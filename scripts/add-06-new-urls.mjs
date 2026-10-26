#!/usr/bin/env node
/**
 * Counterpart to prune-06-dead-and-noindex.mjs: add newly published pages to
 * csv/06-site-urls.csv so new blogs/pages join the audit list without a manual edit.
 *
 * Candidates: the Squarespace blog feed (?format=json — lists a post as soon as it is
 * published) plus sitemap.xml (catches new non-blog pages; lags by hours). A candidate is
 * only added when it answers 200 without redirect and is not noindex — the same rules the
 * prune step uses, so stale sitemap entries (past workshop dates) never come back.
 *
 * Usage:
 *   node scripts/add-06-new-urls.mjs
 *   node scripts/add-06-new-urls.mjs --dry-run
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, CSV_PATH, parseCsv, esc, urlKey, classifyUrl, mapPool, urlColumnIndex } from './site-urls-06-lib.mjs';

const SITE = 'https://www.alanranger.com';
const BLOG_FEED = `${SITE}/blog-on-photography?format=json`;
const SITEMAP = `${SITE}/sitemap.xml`;
const MAX_ADD_PER_RUN = 25;
const dryRun = process.argv.includes('--dry-run');

async function blogFeedUrls() {
  try {
    const res = await fetch(BLOG_FEED, { signal: AbortSignal.timeout(15000) });
    const json = await res.json();
    return (json?.items || []).map((i) => (i?.fullUrl ? `${SITE}${i.fullUrl}` : '')).filter(Boolean);
  } catch {
    return [];
  }
}

async function sitemapUrls() {
  try {
    const res = await fetch(SITEMAP, { signal: AbortSignal.timeout(15000) });
    const xml = await res.text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  } catch {
    return [];
  }
}

/** Unique alanranger.com page URLs (www form) that 06 does not have yet. */
export function missingCandidates(candidates, existingKeys) {
  const seen = new Set(existingKeys);
  const out = [];
  for (const raw of candidates) {
    const k = urlKey(raw);
    if (!k.startsWith('alanranger.com/') || seen.has(k)) continue;
    seen.add(k);
    const u = new URL(raw);
    out.push(`${SITE}${u.pathname.replace(/\/+$/, '') || '/'}`);
  }
  return out;
}

/** Insert each new row before the first existing row that sorts after it (keeps existing order). */
export function insertSorted(body, urlIdx, newRows) {
  const out = body.slice();
  for (const row of newRows) {
    const url = row[urlIdx];
    const at = out.findIndex((r) => String(r[urlIdx] || '') > url);
    if (at < 0) out.push(row);
    else out.splice(at, 0, row);
  }
  return out;
}

function writeReport(report) {
  try {
    writeFileSync(join(ROOT, 'csv processed', '06-add-report-latest.json'), JSON.stringify(report, null, 2), 'utf8');
  } catch { /* optional folder */ }
  console.log(JSON.stringify(report, null, 2));
}

function buildRow(header, urlIdx, url, title) {
  const row = header.map(() => '');
  row[urlIdx] = url;
  const titleIdx = header.findIndex((h) => String(h).toLowerCase() === 'title');
  if (titleIdx >= 0) row[titleIdx] = title || '';
  return row;
}

async function main() {
  const rows = parseCsv(readFileSync(CSV_PATH, 'utf8'));
  if (rows.length < 2) throw new Error('06-site-urls.csv empty or missing header');
  const header = rows[0];
  const urlIdx = urlColumnIndex(header);
  if (urlIdx < 0) throw new Error('06-site-urls.csv missing url column');
  const body = rows.slice(1);

  const [feed, sitemap] = await Promise.all([blogFeedUrls(), sitemapUrls()]);
  const existing = body.map((r) => urlKey(r[urlIdx])).filter(Boolean);
  const missing = missingCandidates([...feed, ...sitemap], existing);
  const checked = await mapPool(missing, 4, async (url) => ({ url, ...(await classifyUrl(url)) }));
  const live = checked.filter((c) => c.reason === 'live').slice(0, MAX_ADD_PER_RUN);

  const report = {
    feedUrls: feed.length,
    sitemapUrls: sitemap.length,
    candidates: missing.length,
    added: live.length,
    addedUrls: live.map((c) => c.url),
    skipped: checked.filter((c) => c.reason !== 'live').map((c) => ({ url: c.url, reason: c.reason }))
  };
  writeReport(report);
  if (!live.length || dryRun) return report;

  const merged = insertSorted(body, urlIdx, live.map((c) => buildRow(header, urlIdx, c.url, c.title)));
  const lines = [header.map(esc).join(','), ...merged.map((r) => r.map(esc).join(','))];
  writeFileSync(CSV_PATH, lines.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${CSV_PATH} (+${live.length} rows).`);
  return report;
}

const isCli = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isCli) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
