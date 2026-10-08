#!/usr/bin/env node
/**
 * Self-clean csv/06-site-urls.csv: drop URLs that are 3xx, 404/410, or noindex.
 *
 * Source inventory: Squarespace page export kept in csv/06-site-urls.csv
 * (titles match Squarespace SEO titles; auto-push commits fresh exports).
 * This script runs before auto-push so dead/hidden pages never stay in the audit list.
 *
 * Usage:
 *   node scripts/prune-06-dead-and-noindex.mjs
 *   node scripts/prune-06-dead-and-noindex.mjs --dry-run
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);
const CSV_PATH = join(root, 'csv', '06-site-urls.csv');
const UA = 'Mozilla/5.0 (compatible; AlanSharedResources-06Prune/1.0)';
const dryRun = process.argv.includes('--dry-run');
const CONCURRENCY = 4;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i += 1; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\r') { /* skip */ }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((v) => String(v || '').length));
}

function esc(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function hasNoindex(html, xRobots) {
  if (/\bnoindex\b/i.test(String(xRobots || ''))) return true;
  const h = String(html || '');
  const robots = h.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)
    || h.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i);
  const google = h.match(/<meta[^>]*name=["']googlebot["'][^>]*content=["']([^"']+)["']/i)
    || h.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']googlebot["']/i);
  return /\bnoindex\b/i.test(robots?.[1] || '') || /\bnoindex\b/i.test(google?.[1] || '');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function classifyUrl(url) {
  try {
    let res = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      res = await fetch(url, {
        redirect: 'manual',
        headers: { 'User-Agent': UA, Accept: 'text/html' },
        signal: AbortSignal.timeout(12000)
      });
      if (Number(res.status) !== 429) break;
      await sleep(900 * (attempt + 1));
    }
    const code = Number(res.status);
    if (code === 404 || code === 410) return { drop: true, reason: `http_${code}` };
    if (code >= 300 && code < 400) return { drop: true, reason: `http_${code}` };
    if (code === 429) return { drop: false, reason: 'keep_http_429' };
    if (!res.ok) return { drop: false, reason: `keep_http_${code}` };
    const html = await res.text();
    const xRobots = res.headers.get('x-robots-tag') || '';
    if (hasNoindex(html, xRobots)) return { drop: true, reason: 'noindex' };
    return { drop: false, reason: 'live' };
  } catch (err) {
    return { drop: false, reason: `error:${String(err?.message || err).slice(0, 80)}` };
  }
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i;
      i += 1;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

async function main() {
  const raw = readFileSync(CSV_PATH, 'utf8');
  const rows = parseCsv(raw);
  if (rows.length < 2) throw new Error('06-site-urls.csv empty or missing header');
  const header = rows[0];
  const urlIdx = header.findIndex((h) => String(h).replace(/^\uFEFF/, '').toLowerCase() === 'url');
  if (urlIdx < 0) throw new Error('06-site-urls.csv missing url column');
  const body = rows.slice(1);
  const results = await mapPool(body, CONCURRENCY, async (row) => {
    const url = String(row[urlIdx] || '').trim();
    if (!/^https?:\/\//i.test(url)) return { row, url, drop: false, reason: 'skip_bad_url' };
    const cls = await classifyUrl(url);
    return { row, url, ...cls };
  });

  const dropped = results.filter((r) => r.drop);
  const kept = results.filter((r) => !r.drop).map((r) => r.row);
  const byReason = {};
  dropped.forEach((d) => { byReason[d.reason] = (byReason[d.reason] || 0) + 1; });

  const report = {
    total: body.length,
    kept: kept.length,
    dropped: dropped.length,
    byReason,
    sample: dropped.slice(0, 25).map((d) => ({ url: d.url, reason: d.reason }))
  };
  const reportPath = join(root, 'csv processed', '06-prune-report-latest.json');
  try {
    writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  } catch { /* optional folder */ }
  console.log(JSON.stringify(report, null, 2));

  if (!dropped.length) {
    console.log('No rows to prune.');
    return report;
  }
  if (dryRun) {
    console.log('Dry run — CSV not written.');
    report.dryRun = true;
    return report;
  }

  const lines = [header.map(esc).join(',')];
  kept.forEach((r) => lines.push(r.map(esc).join(',')));
  writeFileSync(CSV_PATH, lines.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${CSV_PATH} (${kept.length} rows).`);
  return report;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
