/**
 * Shared helpers for csv/06-site-urls.csv self-maintenance
 * (prune-06-dead-and-noindex.mjs removes, add-06-new-urls.mjs adds).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
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
  // Members checklist posts: hosted blog-page-loader injects robots noindex
  // after DOMContentLoaded when this class is present. The class is in the
  // served HTML, so 06 can drop them without a browser render.
  if (/category-1-page-field-checklists/i.test(h)) return true;
  const robots = h.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)
    || h.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i);
  const google = h.match(/<meta[^>]*name=["']googlebot["'][^>]*content=["']([^"']+)["']/i)
    || h.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']googlebot["']/i);
  return /\bnoindex\b/i.test(robots?.[1] || '') || /\bnoindex\b/i.test(google?.[1] || '');
}

const NAMED_ENTITIES = {
  amp: '&', quot: '"', apos: "'", rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"',
  mdash: '—', ndash: '–', hellip: '…', nbsp: ' '
};

function decodeEntities(s) {
  return String(s || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

/** A title as plain text: entities decoded, spaces collapsed (06 stores it this way). */
export const cleanTitle = (s) => decodeEntities(s || '').replace(/\s+/g, ' ').trim();

function pageTitle(html) {
  const m = String(html || '').match(/<title[^>]*>([^<]*)<\/title>/i);
  return cleanTitle(m?.[1]);
}

/**
 * Set each row's title to the live page title from this run's live check when it differs (not only when blank).
 * Rows not checked this run keep theirs; every 06 URL comes due again within LIVE_CHECK.recheckMs.
 */
export function refreshTitles(rows, urlIdx, titleIdx, liveTitles) {
  if (titleIdx < 0) return [];
  const changes = [];
  for (const row of rows) {
    const url = String(row[urlIdx] || '').trim();
    const want = cleanTitle(liveTitles.get(url));
    const have = String(row[titleIdx] ?? '');
    if (!want || want === have) continue;
    while (row.length <= titleIdx) row.push('');
    row[titleIdx] = want;
    changes.push({ url, from: have, to: want });
  }
  return changes;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** One request; a 429 is returned as is (callers stop for this cycle — quick retries made the rate limit worse). */
async function fetchNoRedirect(url) {
  return fetch(url, {
    redirect: 'manual',
    headers: { 'User-Agent': UA, Accept: 'text/html' },
    signal: AbortSignal.timeout(12000)
  });
}

const isDropCode = (code) => code === 404 || code === 410 || (code >= 300 && code < 400);
const NON_PAGE = /\.(jpe?g|png|gif|webp|avif|svg|ico|pdf|zip|mp4|mov)\/?(?:\?|#|$)/i;

/** An unread response body keeps its socket open, and an open socket kept the 4 Nov auto-sync's node process alive for hours. */
const discard = (res) => res?.body?.cancel?.().catch(() => {});

/** Squarespace can answer 404 for a moment while a post is being edited — confirm before dropping. */
async function fetchConfirmed(url) {
  const first = await fetchNoRedirect(url);
  if (!isDropCode(Number(first.status))) return first;
  await discard(first);
  await sleep(5000);
  return fetchNoRedirect(url);
}

/** The verdict for a non-2xx answer (its body is never read). */
function statusVerdict(res, code) {
  if (code === 404 || code === 410) return { drop: true, reason: `http_${code}` };
  if (code >= 300 && code < 400) {
    const location = res.headers.get('location') || '';
    if (NON_PAGE.test(location)) return { drop: true, reason: 'redirect_non_page', location };
    return { drop: true, reason: `http_${code}`, location };
  }
  if (code === 429) return { drop: false, reason: 'keep_http_429' };
  return { drop: false, reason: `keep_http_${code}` };
}

/** drop=true for 3xx / 404 / 410 / noindex; live pages also return their <title>. */
export async function classifyUrl(url, opts = {}) {
  try {
    const res = await fetchConfirmed(url);
    const code = Number(res.status);
    if (!res.ok) {
      await discard(res);
      return statusVerdict(res, code);
    }
    const html = await res.text();
    if (!opts.keepNoindex && hasNoindex(html, res.headers.get('x-robots-tag') || '')) {
      return { drop: true, reason: 'noindex' };
    }
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

/**
 * Gentle live check (batch 8, 2 Nov 2026). The 10-minute auto-sync used to GET every 06 + catalog URL (~850, 4 at a
 * time) each run, and Squarespace answered the next site requests from this PC with 429. Now each run checks only
 * the URLs that are due — never checked, or not checked for recheckMs — up to perRun, one at a time, gapMs apart,
 * and stops at the first 429. URLs not checked this run are kept as they are.
 */
export const LIVE_CHECK = {
  perRun: Number(process.env.LIVE_CHECK_PER_RUN || 25),
  gapMs: Number(process.env.LIVE_CHECK_GAP_MS || 1500),
  recheckMs: Number(process.env.LIVE_CHECK_RECHECK_HOURS || 6) * 3600 * 1000,
};
/** One state file per script (06 and the catalog CSVs share URLs but drop them from different files). */
export const checkStateFile = (name) => join(process.env.LOCALAPPDATA || tmpdir(), 'AlanSharedResources', `live-check-${name}.json`);

export function loadCheckState(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return {}; }
}

export function saveCheckState(state, file) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(state));
}

/** Due URLs, never-checked first then oldest, up to perRun. */
export function pickDue(urls, state, { perRun = LIVE_CHECK.perRun, recheckMs = LIVE_CHECK.recheckMs, now = Date.now() } = {}) {
  const seen = new Set();
  const due = urls.filter((u) => {
    if (!u || seen.has(u)) return false;
    seen.add(u);
    return !state[u] || now - state[u] >= recheckMs;
  });
  return due.sort((a, b) => (state[a] || 0) - (state[b] || 0)).slice(0, perRun);
}

/** Classify due URLs one at a time; stops at the first 429. Returns Map url → result and whether it was rate limited. */
export async function gentleClassify(urls, { state, classify = classifyUrl, opts = {}, gapMs = LIVE_CHECK.gapMs, now = () => Date.now() } = {}) {
  const results = new Map();
  for (const url of urls) {
    if (results.size) await sleep(gapMs);
    const r = await classify(url, opts);
    if (r.reason === 'keep_http_429') return { results, rateLimited: true };
    results.set(url, r);
    state[url] = now();
  }
  return { results, rateLimited: false };
}

export function urlColumnIndex(header) {
  return header.findIndex((h) => String(h).replace(/^\uFEFF/, '').toLowerCase() === 'url');
}
