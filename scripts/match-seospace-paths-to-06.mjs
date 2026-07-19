/**
 * HISTORICAL helper — 07-url-target-keywords-seospace.csv is FROZEN (2026-07-19).
 * Do not append new rows for production. Runtime SoT = Supabase overrides;
 * human export = 09-url-target-keywords.csv (AI GEO Audit/scripts/export-09-url-target-keywords.mjs).
 * See csv/README-07-url-target-keywords-seospace.md.
 *
 * Resolve SEOSpace-style paths against 06-site-urls.csv and append to 07-url-target-keywords-seospace.csv
 *
 * Input file (UTF-8): one row per line
 *   /blog/foo<TAB>my keyword phrase
 *   or: /blog/foo,my keyword   (comma only if keyword has no commas)
 *
 * Usage (from alan-shared-resources folder):
 *   node scripts/match-seospace-paths-to-06.mjs fragments.txt --batch=batch7
 */

import { readFileSync, appendFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CSV06 = join(ROOT, 'csv', '06-site-urls.csv');
const CSV07 = join(ROOT, 'csv', '07-url-target-keywords-seospace.csv');

function normPathFromUrl(url) {
  try {
    const p = new URL(String(url).trim()).pathname.replace(/\/+$/, '') || '/';
    return p.toLowerCase();
  } catch {
    return '';
  }
}

function normFragment(raw) {
  let s = String(raw || '').trim();
  if (!s) return '';
  if (!s.startsWith('/')) s = `/${s}`;
  s = s.replace(/\/+$/, '') || '/';
  return s.toLowerCase();
}

function load06Urls() {
  const text = readFileSync(CSV06, 'utf8');
  const lines = text.split(/\r?\n/).slice(1);
  const urls = [];
  for (const line of lines) {
    const url = line.split(',')[0]?.trim();
    if (/^https?:\/\//i.test(url)) urls.push(url);
  }
  return urls;
}

function resolve(fragment, urls) {
  const f = normFragment(fragment);
  if (!f || f === '/') return { kind: 'bad' };
  const exact = urls.filter((u) => normPathFromUrl(u) === f);
  if (exact.length === 1) return { kind: 'ok', url: exact[0] };
  const ends = urls.filter((u) => normPathFromUrl(u).endsWith(f) || normPathFromUrl(u) === f);
  if (ends.length === 1) return { kind: 'ok', url: ends[0] };
  const inc = urls.filter((u) => normPathFromUrl(u).includes(f));
  if (inc.length === 1) return { kind: 'ok', url: inc[0] };
  return { kind: 'ambig', matches: inc.slice(0, 12), count: inc.length };
}

function parseLine(line) {
  const t = line.trim();
  if (!t || t.startsWith('#')) return null;
  if (t.includes('\t')) {
    const [a, ...rest] = t.split('\t');
    return { path: a.trim(), keyword: rest.join('\t').trim() };
  }
  const idx = t.indexOf(',');
  if (idx > 0) return { path: t.slice(0, idx).trim(), keyword: t.slice(idx + 1).trim() };
  return null;
}

function escCsvField(s) {
  const v = String(s ?? '');
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

const inputPath = process.argv[2];
const batchArg = process.argv.find((a) => a.startsWith('--batch='));
const batch = batchArg ? batchArg.slice('--batch='.length).trim() : 'manual';

if (!inputPath || !existsSync(inputPath)) {
  console.error('Usage: node scripts/match-seospace-paths-to-06.mjs <fragments.txt> --batch=batch7');
  process.exit(1);
}

const urls = load06Urls();
const lines = readFileSync(inputPath, 'utf8').split(/\r?\n/);
const out = [];
const problems = [];

for (const line of lines) {
  const row = parseLine(line);
  if (!row || !row.path) continue;
  const res = resolve(row.path, urls);
  if (res.kind === 'ok') {
    out.push(`${res.url},${escCsvField(row.keyword)},seospace_screenshot,${batch}`);
  } else if (res.kind === 'ambig') {
    problems.push({ path: row.path, keyword: row.keyword, count: res.count, sample: res.matches });
  } else {
    problems.push({ path: row.path, keyword: row.keyword, count: 0, sample: [] });
  }
}

if (out.length) appendFileSync(CSV07, `${out.join('\n')}\n`, 'utf8');

console.log(`Appended ${out.length} row(s) to csv/07-url-target-keywords-seospace.csv (${batch})`);
if (problems.length) {
  console.log('\nNeeds manual fix (0 or many matches):');
  for (const p of problems) {
    console.log(`- ${p.path} :: "${p.keyword}" (${p.count} matches)`);
    if (p.sample?.length) p.sample.forEach((u) => console.log(`    ${u}`));
  }
}
