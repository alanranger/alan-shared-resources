#!/usr/bin/env node
/**
 * Drop hidden / unpublished / dead rows from catalog CSVs 01, 04, 05, 07.
 * Visibility/status field (when present) plus a live check: 404/410, or
 * redirect to a non-page (image/pdf/asset). Never drops a live 200 page.
 *
 *   node scripts/prune-catalog-dead.mjs
 *   node scripts/prune-catalog-dead.mjs --dry-run
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, parseCsv, esc, classifyUrl, mapPool } from './site-urls-06-lib.mjs';

const dryRun = process.argv.includes('--dry-run');
const CONCURRENCY = 4;
const CSV_DIR = join(ROOT, 'csv');

const FILES = [
  { file: '01-blog-posts.csv' },
  { file: '04-photography-services-courses-mentoring.csv' },
  { file: '05-photo-workshops-uk-landscape.csv' },
  { file: '07-product-schema-with-review-ratings.csv', fromJsonLd: true }
];

function headerName(h) {
  return String(h || '').replace(/^\uFEFF/, '').trim().toLowerCase();
}

function visIndex(header) {
  return header.findIndex((h) => /^(visible|visibility|status)$/i.test(headerName(h)));
}

function isHidden(header, row) {
  const i = visIndex(header);
  if (i < 0) return false;
  const v = String(row[i] || '').trim().toLowerCase();
  return v === 'no' || v === 'false' || v === 'hidden' || v === '0'
    || v === 'unpublished' || v === 'deleted';
}

function urlFromRow(header, row, spec) {
  if (spec.fromJsonLd) {
    const idx = header.findIndex((h) => /json-ld/i.test(headerName(h)));
    const cell = String(row[idx] || '');
    const m = cell.match(/"url"\s*:\s*"(https?:[^"]+)"/i);
    return m ? m[1].replace(/\\u002f/gi, '/') : '';
  }
  const idx = header.findIndex((h) => {
    const n = headerName(h);
    return n === 'full url' || n === 'url';
  });
  return String(row[idx] || '').trim();
}

async function pruneFile(spec) {
  const path = join(CSV_DIR, spec.file);
  const rows = parseCsv(readFileSync(path, 'utf8'));
  if (rows.length < 2) return { file: spec.file, total: 0, kept: 0, dropped: [], skipped: 'empty' };
  const header = rows[0];
  const body = rows.slice(1);
  const classified = await mapPool(body, CONCURRENCY, async (row) => {
    const url = urlFromRow(header, row, spec);
    if (isHidden(header, row)) return { row, url, drop: true, reason: 'hidden_or_unpublished' };
    if (!/^https?:\/\//i.test(url)) return { row, url, drop: false, reason: 'skip_bad_url' };
    const cls = await classifyUrl(url, { keepNoindex: true });
    return { row, url, ...cls };
  });
  const dropped = classified.filter((r) => r.drop);
  const kept = classified.filter((r) => !r.drop).map((r) => r.row);
  if (!dryRun && dropped.length) {
    const lines = [header.map(esc).join(',')];
    kept.forEach((r) => lines.push(r.map(esc).join(',')));
    writeFileSync(path, `${lines.join('\n')}\n`, 'utf8');
  }
  return {
    file: spec.file,
    total: body.length,
    kept: kept.length,
    dropped: dropped.map((d) => ({ url: d.url, reason: d.reason, location: d.location || '' }))
  };
}

async function main() {
  const files = [];
  for (const spec of FILES) files.push(await pruneFile(spec));
  const dropped = files.flatMap((f) => f.dropped.map((d) => ({ file: f.file, ...d })));
  const liveDropped = dropped.filter((d) => d.reason === 'live');
  const report = {
    dryRun,
    kept: files.reduce((n, f) => n + f.kept, 0),
    dropped: dropped.length,
    byReason: dropped.reduce((acc, d) => {
      acc[d.reason] = (acc[d.reason] || 0) + 1;
      return acc;
    }, {}),
    files: files.map((f) => ({ file: f.file, total: f.total, kept: f.kept, dropped: f.dropped.length })),
    droppedRows: dropped,
    liveDroppedCount: liveDropped.length
  };
  const reportPath = join(ROOT, 'csv processed', 'catalog-prune-report-latest.json');
  try { writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8'); } catch { /* optional */ }
  console.log(JSON.stringify(report, null, 2));
  if (liveDropped.length) {
    console.error('REFUSING: classify marked a live page for drop');
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
