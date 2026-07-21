#!/usr/bin/env node
/**
 * Build mentoring student workbook PDF from student.json + CSS.
 * Usage: node mentoring/scripts/build-workbook-pdf.mjs [student-id]
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
const pdfOut = path.join(outDir, 'Constantin-NZ-Project-Workbook-2026.pdf');

const require = createRequire(path.join(
  'G:/Dropbox/alan ranger photography/Website Code/Chat AI Bot',
  'package.json'
));
const puppeteer = require('puppeteer');

const d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/@font-face\s*\{[^}]+\}/g, '');
const asset = (name) => pathToFileURL(path.join(root, 'assets', name)).href;

function a(href, text) {
  if (!href) return text || '';
  return `<a href="${href}">${text || href}</a>`;
}

function refs(list) {
  return (list || []).map((r) => a(r.url, r.label)).join(' · ');
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

<section class="cover page">
  <div><img class="logo" src="${asset('logo-white.png')}" alt="Alan Ranger Photography"/></div>
  <div>
    <hr class="rule"/>
    <h1>${d.project.title}<br/><span class="accent">${d.project.subtitle || ''}</span></h1>
    <p class="meta">For ${d.student.displayName}</p>
    <p class="meta">${d.project.dateLabel}</p>
    <p class="meta" style="margin-top:8mm;font-size:11pt;font-weight:300;">Alan Ranger · ARPS · ABIPP</p>
  </div>
</section>

<section class="page">
  <span class="running-title">${d.project.title}</span>
  <img class="header-emblem" src="${asset('emblem.png')}" alt=""/>
  <h1 class="page-h">Welcome</h1>
  <p class="lead">A short note from Alan before you fly.</p>
  <p>Constantin — this workbook is your map for the New Zealand trip: what to learn before you go, what to shoot in Auckland and Queenstown, and how we review together on Zoom. Use the links — every Academy lesson and exam here opens in your browser.</p>
  <p>Bring curiosity, keep the camera level on buildings, and put safety first at every viewpoint. I am looking forward to seeing your frames. Safe travels — Alan.</p>
  <div class="callout warn">
    <div class="label">Alan to fill Wednesday</div>
    <p>Dropbox upload folder: <span class="big">${d.placeholders.dropbox}</span></p>
    <p>Zoom review: <span class="big">${d.placeholders.zoom}</span></p>
  </div>
</section>

<section class="page">
  <span class="running-title">The learning cycle</span>
  <h1 class="page-h">The cycle</h1>
  <p class="lead">This is how mentoring works — not a one-off tip, a loop you can repeat on every shoot.</p>
  <div class="cycle">
    ${cycle.map((s, i) => `<div class="step"><div><span>${i + 1}</span>${s}</div></div>`).join('')}
  </div>
  <p class="cycle-note">Learn the idea → practise with a pack or checklist → photograph on location → review with me → reflect in writing → improve the next frame → repeat.</p>
</section>

<section class="page">
  <span class="running-title">Your kit</span>
  <h1 class="page-h">Your kit</h1>
  <p class="lead">What you are carrying, and why it matters on this trip.</p>
  <ul class="kit-list">
    ${d.kit.map((k) => `<li><strong>${k.item}</strong>${k.for}</li>`).join('')}
  </ul>
</section>

<section class="page">
  <span class="running-title">Before you fly</span>
  <h1 class="page-h">Before you fly</h1>
  <p class="lead">Complete in order before Auckland. Allow ~45 min per lesson + practice where noted.</p>
  <table>
    <thead><tr><th>#</th><th>Academy item</th><th>Why</th><th>Time</th><th>Priority</th></tr></thead>
    <tbody>
      ${d.beforeFly.map((r) => `<tr>
        <td>${r.order}</td>
        <td>${a(r.url, r.title)}${r.extra ? `<br/>${a(r.extraUrl || d.links.practicePacks, r.extra)}` : ''}</td>
        <td>${r.why}</td>
        <td>${r.time}</td>
        <td class="priority">${r.priority}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <h2>UK bridge homework</h2>
  <p>${d.ukHomework}</p>
  <div class="callout warn">
    <div class="label">Upload here</div>
    <p class="big">${d.placeholders.dropbox}</p>
  </div>
</section>

<section class="page">
  <span class="running-title">Phase A — Auckland</span>
  <h1 class="page-h">Phase A — Auckland</h1>
  <p class="lead">${d.phaseA.dates} · Grafton · Nga Hau Mangere · Harbour Bridge</p>
  ${d.phaseA.locations.map((loc) => `
    <div class="loc-card">
      <div class="when">${loc.when}</div>
      <h3>${loc.name}</h3>
      <p>${refs(loc.refs)}</p>
      <p>${loc.notes}</p>
    </div>`).join('')}
  <h2>Each shoot</h2>
  <p>${a(d.phaseA.eachShoot.url, d.phaseA.eachShoot.label)} — ${d.phaseA.eachShoot.notes}</p>
  <h2>Essential gear</h2>
  <p>${d.phaseA.gear}</p>
  <div class="callout warn"><div class="label">Safety</div><p>Public viewpoints only. Never stop in traffic or climb barriers for a shot.</p></div>
</section>

<section class="page">
  <span class="running-title">Phase B — Before Zoom</span>
  <h1 class="page-h">Phase B — Before your first Zoom</h1>
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
  <h2>Upload before Zoom</h2>
  <p>${d.phaseB.upload}</p>
  <div class="callout warn">
    <div class="label">Alan to confirm</div>
    <p>Zoom: <span class="big">${d.placeholders.zoom}</span></p>
    <p>Dropbox: <span class="big">${d.placeholders.dropbox}</span></p>
  </div>
</section>

<section class="page">
  <span class="running-title">Phase C — Queenstown</span>
  <h1 class="page-h">Phase C — Queenstown</h1>
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
</section>

<section class="page">
  <span class="running-title">Phase D — Aug to Dec</span>
  <h1 class="page-h">Phase D — August to December</h1>
  <p class="lead">Monthly focus with Alan after you are home.</p>
  <table>
    <thead><tr><th>Month</th><th>Focus</th><th>Academy</th></tr></thead>
    <tbody>
      ${d.phaseD.map((m) => `<tr>
        <td><strong>${m.month}</strong></td>
        <td>${m.focus}</td>
        <td>${a(m.url, m.modules)}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <p class="footer-note">Pass mark for Academy exams: <strong>80%</strong>. Take exams at ${a(d.links.exams, 'photography exams & certification')} after the linked lesson.</p>
</section>

${[1, 2, 3, 4, 5].map((n) => `
<section class="page">
  <span class="running-title">Field notes</span>
  <h1 class="page-h">Field notes ${n}</h1>
  <div class="field-block">
    <div class="row">
      <div style="flex:1"><label>Location</label><div class="line"></div></div>
      <div style="flex:1"><label>Date</label><div class="line"></div></div>
    </div>
    <label>Conditions (light / weather)</label><div class="line"></div>
    <label>What I tried</label><div class="line area"></div>
    <label>What I would change</label><div class="line area"></div>
  </div>
</section>`).join('')}

<section class="page">
  <span class="running-title">Reflection</span>
  <h1 class="page-h">Reflection prompts</h1>
  <p class="lead">Use the Phase B template — three short reflections for Zoom.</p>
  ${[1, 2, 3].map((n) => `
  <div class="field-block">
    <h2 style="margin-top:0">Reflection ${n}</h2>
    <label>Location</label><div class="line"></div>
    <label>Intent — what I wanted the image to say</label><div class="line area"></div>
    <label>One improvement for next time</label><div class="line area"></div>
  </div>`).join('')}
</section>

<section class="page">
  <span class="running-title">Reflection (cont.)</span>
  <h1 class="page-h">More space to write</h1>
  ${[4, 5].map((n) => `
  <div class="field-block">
    <h2 style="margin-top:0">Reflection ${n}</h2>
    <label>Location</label><div class="line"></div>
    <label>Intent</label><div class="line area"></div>
    <label>One improvement</label><div class="line area"></div>
  </div>`).join('')}
</section>

<section class="page">
  <span class="running-title">Progress tracker</span>
  <h1 class="page-h">Progress tracker</h1>
  <h2>Lessons</h2>
  <ul class="checks">${d.progress.lessons.map((x) => `<li>${x}</li>`).join('')}</ul>
  <h2>Exams</h2>
  <ul class="checks">${d.progress.exams.map((x) => `<li>${x}</li>`).join('')}</ul>
  <h2>Assignments</h2>
  <ul class="checks">${d.progress.assignments.map((x) => `<li>${x}</li>`).join('')}</ul>
  <h2>Uploads</h2>
  <ul class="checks">${d.progress.uploads.map((x) => `<li>${x}</li>`).join('')}</ul>
</section>

<section class="page">
  <span class="running-title">Quick links</span>
  <h1 class="page-h">Quick links</h1>
  <ul class="kit-list">
    <li><strong>Dashboard</strong>${a(d.links.dashboard, d.links.dashboard)}</li>
    <li><strong>Modules map</strong>${a(d.links.modulesMap, d.links.modulesMap)}</li>
    <li><strong>Exams</strong>${a(d.links.exams, d.links.exams)}</li>
    <li><strong>Practice packs</strong>${a(d.links.practicePacks, d.links.practicePacks)}</li>
    <li><strong>Q&amp;A with Alan</strong>${a(d.links.qa, d.links.qa)}</li>
  </ul>
  <div class="callout warn">
    <div class="label">Keep these visible</div>
    <p>Dropbox: <span class="big">${d.placeholders.dropbox}</span></p>
    <p>Zoom: <span class="big">${d.placeholders.zoom}</span></p>
  </div>
  <p class="footer-note">Alan Ranger Photography · ARPS · ABIPP · alanranger.com</p>
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
  path: pdfOut,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', bottom: '0', left: '0', right: '0' },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `<div style="font-size:8px;width:100%;text-align:center;color:#3f372f;padding-bottom:6px;font-family:Georgia,serif;"><span class="pageNumber"></span></div>`
});
await browser.close();
console.log('Wrote', pdfOut);
