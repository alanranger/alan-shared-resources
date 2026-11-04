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
import { ROOT, parseCsv, esc, checkStateFile, loadCheckState, saveCheckState, pickDue, gentleClassify } from './site-urls-06-lib.mjs';

const dryRun = process.argv.includes('--dry-run');
const onlyArg = process.argv.find((a) => a.startsWith('--file='));
const onlyFile = onlyArg ? onlyArg.slice('--file='.length) : '';
const CSV_DIR = join(ROOT, 'csv');
const isHttp = (u) => /^https?:\/\//i.test(u);

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

function loadFile(spec) {
  const path = join(CSV_DIR, spec.file);
  const rows = parseCsv(readFileSync(path, 'utf8'));
  return { spec, path, header: rows[0] || [], body: rows.slice(1) };
}

/** URLs this run may live-check: visible rows with a page URL. */
function checkableUrls(f) {
  return f.body.filter((row) => !isHidden(f.header, row)).map((row) => urlFromRow(f.header, row, f.spec)).filter(isHttp);
}

function classifyRow(f, row, checked) {
  const url = urlFromRow(f.header, row, f.spec);
  if (isHidden(f.header, row)) return { row, url, drop: true, reason: 'hidden_or_unpublished' };
  if (!isHttp(url)) return { row, url, drop: false, reason: 'skip_bad_url' };
  return checked.has(url) ? { row, url, ...checked.get(url) } : { row, url, drop: false, reason: 'not_due' };
}

function pruneFile(f, checked) {
  const { spec, path, header, body } = f;
  if (!body.length) return { file: spec.file, total: 0, kept: 0, dropped: [], skipped: 'empty' };
  const classified = body.map((row) => classifyRow(f, row, checked));
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
  const specs = onlyFile ? FILES.filter((f) => f.file === onlyFile) : FILES;
  if (!specs.length) throw new Error(`unknown --file=${onlyFile}`);
  const loaded = specs.map(loadFile);
  const stateFile = checkStateFile('catalog');
  const state = loadCheckState(stateFile);
  const due = pickDue(loaded.flatMap(checkableUrls), state);
  const { results: checked, rateLimited } = await gentleClassify(due, { state, opts: { keepNoindex: true } });
  if (!dryRun) saveCheckState(state, stateFile);
  const files = loaded.map((f) => pruneFile(f, checked));
  const dropped = files.flatMap((f) => f.dropped.map((d) => ({ file: f.file, ...d })));
  const liveDropped = dropped.filter((d) => d.reason === 'live');
  const report = {
    dryRun,
    checked: checked.size,
    due: due.length,
    rateLimited,
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

// Exit when done: auto-push waits for this process, so a lingering socket must not keep it alive.
main().then(() => process.exit(0), (err) => {
  console.error(err);
  process.exit(1);
});
