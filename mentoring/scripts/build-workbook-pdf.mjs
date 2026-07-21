#!/usr/bin/env node
/**
 * Build mentoring student workbook PDF from student.json + CSS.
 * Usage: node mentoring/scripts/build-workbook-pdf.mjs [student-id]
 * Rule: never emit placeholders — real URLs only in student.json.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const studentId = process.argv[2] || 'constantin-nz-2026';
const dataPath = path.join(root, 'students', studentId, 'student.json');
const cssPath = path.join(root, 'templates', 'workbook.css');
const outDir = path.join(root, 'output');
const htmlOut = path.join(outDir, `${studentId}.html`);
const pdfName = 'Constantin-NZ-Project-Workbook-2026.pdf';
const pdfOut = path.join(outDir, pdfName);
const pdfTmp = path.join(outDir, `_build-tmp-${Date.now()}.pdf`);
const driveOutbox = path.join(
  'C:/Users/alan/Google Drive/Claude shared resources/Cursor Outputs for Claude',
  pdfName
);

const require = createRequire(
  path.join('G:/Dropbox/alan ranger photography/Website Code/Chat AI Bot', 'package.json')
);
const puppeteer = require('puppeteer');

const d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
if (!d.dropbox?.url || !d.zoom?.url) {
  console.error('REFUSING TO BUILD: dropbox.url and zoom.url must be real links in student.json');
  process.exit(1);
}
let css = fs.readFileSync(cssPath, 'utf8');
const asset = (name) => pathToFileURL(path.join(root, 'assets', name)).href;

function a(href, text) {
  if (!href) return text || '';
  return `<a href="${href}">${text || href}</a>`;
}
function refs(list) {
  return (list || []).map((r) => a(r.url, r.label)).join(' · ');
}
function head(title) {
  return `<div class="page-head"><h1>${title}</h1><img class="emblem" src="${asset('emblem.png')}" alt=""/></div>`;
}
function dropboxBox() {
  return `<div class="callout">
    <div class="label">You upload before each review</div>
    <p class="big">${a(d.dropbox.url, d.dropbox.label)}</p>
    <p class="hint">${d.dropbox.foldersHint || ''}</p>
  </div>`;
}
function zoomBox() {
  return `<div class="callout callout-code">
    <div class="label">You book your review slots</div>
    <p class="big">${a(d.zoom.url, d.zoom.label)}</p>
    <p class="code-banner">Booking code: <strong>${d.zoom.code}</strong></p>
    <p class="hint">${d.zoom.codeNote}</p>
  </div>`;
}
function dropboxBoxShort() {
  return dropboxBox();
}

const cycle = ['Learn', 'Practise', 'Photograph', 'Review', 'Reflect', 'Improve', 'Repeat'];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${d.project.title} — ${d.student.displayName}</title>
<style>
@font-face { font-family: Brown; src: url("${asset('Brown-Regular.otf')}") format("opentype"); font-weight: 400; }
@font-face { font-family: Brown; src: url("${asset('Brown-Bold.otf')}") format("opentype"); font-weight: 700; }
@font-face { font-family: Brown; src: url("${asset('Brown-Light.otf')}") format("opentype"); font-weight: 300; }
${css}
</style>
</head>
<body>

<section class="sheet cover">
  <img class="logo" src="${asset('logo-white.png')}" alt="Alan Ranger Photography"/>
  <div>
    <hr class="rule"/>
    <h1>${d.project.title}<span class="accent">${d.project.subtitle}</span></h1>
    <p class="meta">For ${d.student.fullName || d.student.displayName}</p>
    <p class="meta">${d.project.dateLabel}</p>
    <p class="creds">Alan Ranger · ARPS · ABIPP</p>
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Welcome')}
    <p class="lead">A short note from Alan before you fly.</p>
    <p>Constantin — this workbook is your map for Auckland and Queenstown: what to learn, what to shoot, and how you drive the review process. Every Academy link opens in your browser — work through them in order.</p>
    <p>You are 16, you carry an R6 III, and you are learning a professional workflow. That means you upload your selects, you book your Zoom slots, and you write your field notes before we talk. I will give you honest feedback on your frames — you bring the work.</p>
    <p>Keep the camera level on buildings, put safety first at every viewpoint, and bring curiosity. I am looking forward to seeing what you make. Safe travels — Alan.</p>
  </div>
</section>

<section class="sheet cycle-page">
  <div class="sheet-inner">
    ${head('How this works')}
    <p class="lead">Your loop for this project — the same cycle on every shoot.</p>
    <p class="loop-plain"><strong>Complete the Academy work → shoot → edit → upload to Dropbox → book your review → we discuss it → you apply it on the next shoot.</strong></p>
    <ul class="resp-list">
      <li><strong>You upload</strong> your selects to your Dropbox folder before each review.</li>
      <li><strong>You book</strong> your Zoom slots using the link below — enter code <strong>${d.zoom.code}</strong> so you are not charged again.</li>
      <li><strong>You complete</strong> lessons, exams and assignments in the order given.</li>
      <li><strong>You write</strong> field notes and reflections before each review.</li>
    </ul>
    ${dropboxBoxShort()}
    ${zoomBox()}
    <div class="cycle-wrap cycle-compact">
      <div class="cycle-row">
        ${cycle.slice(0, 4).map((s, i) => `<div class="cycle-step cycle-step-sm"><span class="n">${i + 1}</span><span class="t">${s}</span></div>`).join('')}
      </div>
      <div class="cycle-row">
        ${cycle.slice(4).map((s, i) => `<div class="cycle-step cycle-step-sm"><span class="n">${i + 5}</span><span class="t">${s}</span></div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Your kit')}
    <p class="lead">What you are carrying, and why it matters on this trip.</p>
    <ul class="kit-list">
      ${d.kit.map((k) => `<li><strong>${k.item}</strong>${k.for}</li>`).join('')}
    </ul>
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Before you fly')}
    <p class="lead">Complete in order before Auckland. Allow ~45 min per lesson + practice where noted.</p>
    <table>
      <thead><tr><th>#</th><th>Academy item</th><th>Why</th><th>Time</th><th>Priority</th></tr></thead>
      <tbody>
        ${d.beforeFly.map((r) => `<tr>
          <td>${r.order}</td>
          <td>${a(r.url, r.title)}${r.extra ? `<br/>${a(r.extraUrl, r.extra)}` : ''}</td>
          <td>${r.why}</td>
          <td>${r.time}</td>
          <td class="priority">${r.priority}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <h2>UK bridge homework</h2>
    <p>${d.ukHomework}</p>
    ${dropboxBox()}
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Phase A — Auckland')}
    <p class="lead">${d.phaseA.dates} · Grafton · Nga Hau Mangere · Harbour Bridge</p>
    ${d.phaseA.locations.map((loc) => `
      <div class="loc-card">
        <div class="when">${loc.when}</div>
        <h3>${loc.name}</h3>
        <p class="refs">${refs(loc.refs)}</p>
        <p>${loc.notes}</p>
      </div>`).join('')}
    <h2>Each shoot</h2>
    <p>${a(d.phaseA.eachShoot.url, d.phaseA.eachShoot.label)} — ${d.phaseA.eachShoot.notes}</p>
    <h2>Essential gear</h2>
    <p>${d.phaseA.gear}</p>
    <div class="callout"><div class="label">Safety</div><p style="margin:0">Public viewpoints only. Never stop in traffic or climb barriers for a shot.</p></div>
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Phase B — Before your first Zoom')}
    <p class="lead">${d.phaseB.dates} · ${d.phaseB.goal}</p>
    <table>
      <thead><tr><th>#</th><th>Complete</th><th>Purpose</th></tr></thead>
      <tbody>
        ${d.phaseB.items.map((it, i) => `<tr>
          <td>${i + 1}</td>
          <td>${it.url ? a(it.url, it.title) : it.title}</td>
          <td>${it.purpose}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <h2>Your upload before Zoom</h2>
    <p>${d.phaseB.upload}</p>
    ${dropboxBox()}
    ${zoomBox()}
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Phase C — Queenstown')}
    <p class="lead">${d.phaseC.dates}</p>
    <p>${d.phaseC.focus}</p>
    <table>
      <thead><tr><th>Theme</th><th>Academy</th><th>Activity</th></tr></thead>
      <tbody>
        ${d.phaseC.themes.map((t) => `<tr>
          <td><strong>${t.theme}</strong></td>
          <td>${refs(t.refs)}</td>
          <td>${t.activity}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <h2>Queenstown assignment</h2>
    <p>${d.phaseC.assignment}</p>
    ${dropboxBox()}
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Phase D — August to December')}
    <p class="lead">Monthly focus with Alan after you are home.</p>
    <table>
      <thead><tr><th>Month</th><th>Focus</th><th>Academy</th></tr></thead>
      <tbody>
        ${d.phaseD.map((m) => `<tr>
          <td><strong>${m.month}</strong></td>
          <td>${m.focus}</td>
          <td>${a(m.url, m.modules)}${m.url2 ? `<br/>${a(m.url2, m.label2)}` : ''}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p class="footer-note">Pass mark for Academy exams: <strong>80%</strong>. Take exams at ${a(d.links.exams, 'photography exams & certification')} after the linked lesson.</p>
  </div>
</section>

${[1, 2, 3, 4, 5].map((n) => `
<section class="sheet">
  <div class="sheet-inner">
    ${head('Field notes ' + n)}
    <div class="field-block">
      <div class="row">
        <div style="flex:1"><label>Location</label><div class="line"></div></div>
        <div style="flex:1"><label>Date</label><div class="line"></div></div>
      </div>
      <label>Conditions (light / weather)</label><div class="line"></div>
      <label>What I tried</label><div class="line area"></div>
      <label>What I would change</label><div class="line area"></div>
    </div>
  </div>
</section>`).join('')}

<section class="sheet">
  <div class="sheet-inner">
    ${head('Reflection prompts')}
    <p class="lead">Use the Phase B template — short reflections for Zoom.</p>
    ${[1, 2, 3].map((n) => `
    <div class="field-block">
      <h2>Reflection ${n}</h2>
      <label>Location</label><div class="line"></div>
      <label>Intent — what I wanted the image to say</label><div class="line area"></div>
      <label>One improvement for next time</label><div class="line area"></div>
    </div>`).join('')}
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('More space to write')}
    ${[4, 5].map((n) => `
    <div class="field-block">
      <h2>Reflection ${n}</h2>
      <label>Location</label><div class="line"></div>
      <label>Intent</label><div class="line area"></div>
      <label>One improvement</label><div class="line area"></div>
    </div>`).join('')}
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Progress tracker')}
    <h2>Lessons</h2>
    <ul class="checks">${d.progress.lessons.map((x) => `<li>${x}</li>`).join('')}</ul>
    <h2>Exams</h2>
    <ul class="checks">${d.progress.exams.map((x) => `<li>${x}</li>`).join('')}</ul>
    <h2>Assignments</h2>
    <ul class="checks">${d.progress.assignments.map((x) => `<li>${x}</li>`).join('')}</ul>
    <h2>Uploads</h2>
    <ul class="checks">${d.progress.uploads.map((x) => `<li>${x}</li>`).join('')}</ul>
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Quick links')}
    <ul class="kit-list">
      <li><strong>Dashboard</strong>${a(d.links.dashboard, d.links.dashboard)}</li>
      <li><strong>Modules map</strong>${a(d.links.modulesMap, d.links.modulesMap)}</li>
      <li><strong>Exams</strong>${a(d.links.exams, d.links.exams)}</li>
      <li><strong>Practice packs</strong>${a(d.links.practicePacks, d.links.practicePacks)}</li>
      <li><strong>Q&amp;A with Alan</strong>${a(d.links.qa, d.links.qa)}</li>
      <li><strong>Your Dropbox</strong>${a(d.dropbox.url, d.dropbox.label)}</li>
      <li><strong>Book Zoom</strong>${a(d.zoom.url, d.zoom.label)} — code <strong>${d.zoom.code}</strong></li>
    </ul>
    <p class="footer-note">Alan Ranger Photography · ARPS · ABIPP · alanranger.com</p>
  </div>
</section>

</body>
</html>`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(htmlOut, html, 'utf8');
console.log('Wrote', htmlOut);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--allow-file-access-from-files', '--no-sandbox']
});
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlOut).href, { waitUntil: 'networkidle0', timeout: 120000 });
await page.pdf({
  path: pdfTmp,
  width: '210mm',
  height: '297mm',
  printBackground: true,
  margin: { top: '0', bottom: '0', left: '0', right: '0' },
  preferCSSPageSize: false
});
await browser.close();
try {
  fs.copyFileSync(pdfTmp, pdfOut);
  fs.unlinkSync(pdfTmp);
  console.log('Wrote', pdfOut);
  fs.mkdirSync(path.dirname(driveOutbox), { recursive: true });
  fs.copyFileSync(pdfOut, driveOutbox);
  console.log('Copied to Drive outbox', driveOutbox);
} catch (e) {
  console.warn('Could not replace locked PDF — left as', pdfTmp, e.message);
}
