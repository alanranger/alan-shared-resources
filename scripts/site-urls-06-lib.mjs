/**
 * Shared helpers for csv/06-site-urls.csv self-maintenance
 * (prune-06-dead-and-noindex.mjs removes, add-06-new-urls.mjs adds).
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = dirname(here);
export const CSV_PATH = join(ROOT, 'csv', '06-site-urls.csv');
const UA = 'Mozilla/5.0 (compatible; AlanSharedResources-06Sync/1.0)';

export function parseCsv(text) {
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

export function esc(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Same page whether www / bare host, trailing slash or case differs. */
export function urlKey(url) {
  try {
    const u = new URL(String(url || '').trim());
    return `${u.hostname.toLowerCase().replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '').toLowerCase() || '/'}`;
  } catch {
    return '';
  }
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

function pageTitle(html) {
  const m = String(html || '').match(/<title[^>]*>([^<]*)<\/title>/i);
  return (m?.[1] || '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchNoRedirect(url) {
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
  return res;
}

/** drop=true for 3xx / 404 / 410 / noindex; live pages also return their <title>. */
export async function classifyUrl(url) {
  try {
    const res = await fetchNoRedirect(url);
    const code = Number(res.status);
    if (code === 404 || code === 410) return { drop: true, reason: `http_${code}` };
    if (code >= 300 && code < 400) return { drop: true, reason: `http_${code}` };
    if (code === 429) return { drop: false, reason: 'keep_http_429' };
    if (!res.ok) return { drop: false, reason: `keep_http_${code}` };
    const html = await res.text();
    if (hasNoindex(html, res.headers.get('x-robots-tag') || '')) return { drop: true, reason: 'noindex' };
    return { drop: false, reason: 'live', title: pageTitle(html) };
  } catch (err) {
    return { drop: false, reason: `error:${String(err?.message || err).slice(0, 80)}` };
  }
}

export async function mapPool(items, limit, fn) {
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

export function urlColumnIndex(header) {
  return header.findIndex((h) => String(h).replace(/^\uFEFF/, '').toLowerCase() === 'url');
}
