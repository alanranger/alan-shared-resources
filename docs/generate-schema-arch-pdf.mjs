/**
 * Build SCHEMA-ARCHITECTURE-SITE-MAP.pdf from markdown via HTML + Playwright.
 * Run from AI GEO Audit repo: node ../alan-shared-resources/docs/generate-schema-arch-pdf.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mdPath = path.join(__dirname, 'SCHEMA-ARCHITECTURE-SITE-MAP.md');
const pdfPath = path.join(__dirname, 'SCHEMA-ARCHITECTURE-SITE-MAP.pdf');
const googleDrivePath =
  'C:/Users/alan/Google Drive/Claude shared resources/SCHEMA-ARCHITECTURE-SITE-MAP.pdf';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  let html = '';
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (!tableRows.length) return;
    html += '<table><thead><tr>';
    const header = tableRows[0];
    header.forEach((c) => {
      html += `<th>${escapeHtml(c.trim())}</th>`;
    });
    html += '</tr></thead><tbody>';
    for (let i = 1; i < tableRows.length; i++) {
      if (tableRows[i].every((c) => /^-+$/.test(c.trim()))) continue;
      html += '<tr>';
      tableRows[i].forEach((c) => {
        html += `<td>${escapeHtml(c.trim())}</td>`;
      });
      html += '</tr>';
    }
    html += '</tbody></table>';
    tableRows = [];
    inTable = false;
  };

  for (const line of lines) {
    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true;
      tableRows.push(line.slice(1, -1).split('|'));
      continue;
    }
    if (inTable) flushTable();

    if (line.startsWith('# ')) {
      html += `<h1>${escapeHtml(line.slice(2))}</h1>`;
    } else if (line.startsWith('## ')) {
      html += `<h2>${escapeHtml(line.slice(3))}</h2>`;
    } else if (line.startsWith('### ')) {
      html += `<h3>${escapeHtml(line.slice(4))}</h3>`;
    } else if (line.startsWith('---')) {
      html += '<hr/>';
    } else if (line.startsWith('- ')) {
      html += `<li>${escapeHtml(line.slice(2))}</li>`;
    } else if (line.startsWith('```')) {
      /* skip fence */
    } else if (line.trim() === '') {
      html += '<br/>';
    } else if (line.startsWith('*') && line.endsWith('*')) {
      html += `<p class="meta"><em>${escapeHtml(line.replace(/\*/g, ''))}</em></p>`;
    } else {
      html += `<p>${escapeHtml(line)}</p>`;
    }
  }
  if (inTable) flushTable();
  return html;
}

const md = fs.readFileSync(mdPath, 'utf8');
const body = mdToHtml(md);

const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Schema Architecture — Site-Wide Map</title>
<style>
  @page { margin: 18mm 15mm; size: A4; }
  body { font-family: "Segoe UI", Calibri, Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #1a1a1a; max-width: 100%; }
  h1 { font-size: 20pt; color: #0f3d5c; border-bottom: 2px solid #0f3d5c; padding-bottom: 6px; margin-top: 0; page-break-after: avoid; }
  h2 { font-size: 14pt; color: #1565a8; margin-top: 1.2em; page-break-after: avoid; }
  h3 { font-size: 11.5pt; color: #333; margin-top: 1em; page-break-after: avoid; }
  p { margin: 0.4em 0; }
  p.meta { font-size: 9.5pt; color: #555; }
  table { width: 100%; border-collapse: collapse; margin: 0.6em 0 1em; font-size: 9pt; page-break-inside: avoid; }
  th { background: #e8f0f8; text-align: left; padding: 6px 8px; border: 1px solid #b8cfe0; font-weight: 600; }
  td { padding: 5px 8px; border: 1px solid #d0d8e0; vertical-align: top; }
  tr:nth-child(even) td { background: #f8fafc; }
  hr { border: none; border-top: 1px solid #ccc; margin: 1.2em 0; }
  li { margin: 0.2em 0 0.2em 1.2em; }
  pre.flow { font-family: Consolas, monospace; font-size: 8.5pt; background: #f4f6f8; padding: 10px; border: 1px solid #dde3ea; white-space: pre-wrap; }
</style>
</head>
<body>${body}</body>
</html>`;

const htmlPath = path.join(__dirname, '_schema-arch-print.html');
fs.writeFileSync(htmlPath, page, 'utf8');

const browser = await chromium.launch();
const pg = await browser.newPage();
await pg.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
await pg.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', bottom: '18mm', left: '15mm', right: '15mm' }
});
await browser.close();

try {
  fs.mkdirSync(path.dirname(googleDrivePath), { recursive: true });
  fs.copyFileSync(pdfPath, googleDrivePath);
  console.log('Copied to:', googleDrivePath);
} catch (e) {
  console.warn('Google Drive copy skipped:', e.message);
}

console.log('PDF written:', pdfPath);
fs.unlinkSync(htmlPath);
