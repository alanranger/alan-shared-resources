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
import { join } from 'node:path';
import { ROOT, CSV_PATH, parseCsv, esc, classifyUrl, mapPool, urlColumnIndex } from './site-urls-06-lib.mjs';

const dryRun = process.argv.includes('--dry-run');
const CONCURRENCY = 4;

async function main() {
  const raw = readFileSync(CSV_PATH, 'utf8');
  const rows = parseCsv(raw);
  if (rows.length < 2) throw new Error('06-site-urls.csv empty or missing header');
  const header = rows[0];
  const urlIdx = urlColumnIndex(header);
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
  const reportPath = join(ROOT, 'csv processed', '06-prune-report-latest.json');
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
