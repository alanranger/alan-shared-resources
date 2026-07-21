#!/usr/bin/env node
/**
 * Build mentoring student workbook PDF from student.json + CSS.
 * Usage: node mentoring/scripts/build-workbook-pdf.mjs [student-id] [--v2|--v3]
 * --v2 writes Constantin-NZ-Project-Workbook-2026-v2.pdf (v1 fallback preserved separately).
 * --v3 writes Constantin-NZ-Project-Workbook-2026-v3.pdf (MC-52 premium handbook).
 * Rule: never emit placeholders — real URLs only in student.json.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import { diagrams } from '../templates/viewpoint-diagrams.mjs';
import { orientation } from '../templates/orientation-diagrams.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const studentId = process.argv[2] || 'constantin-nz-2026';
const buildV2 = process.argv.includes('--v2');
const buildV31 = process.argv.includes('--v31');
const buildV3 = process.argv.includes('--v3') || buildV31;
const v31 = buildV31;
const dataPath = path.join(root, 'students', studentId, 'student.json');
const cssPath = path.join(root, 'templates', 'workbook.css');
const outDir = path.join(root, 'output');
const versionSuffix = buildV31 ? '-v3-1' : buildV3 ? '-v3' : buildV2 ? '-v2' : '';
const htmlOut = path.join(outDir, `${studentId}${versionSuffix}.html`);
const pdfName = buildV31
  ? 'Constantin-NZ-Project-Workbook-2026-v3-1.pdf'
  : buildV3
    ? 'Constantin-NZ-Project-Workbook-2026-v3.pdf'
    : buildV2
      ? 'Constantin-NZ-Project-Workbook-2026-v2.pdf'
      : 'Constantin-NZ-Project-Workbook-2026.pdf';
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
const wbImg = (sub) => pathToFileURL(path.join(root, 'assets', 'workbook-images', sub)).href;

function a(href, text) {
  if (!href) return text || '';
  return `<a href="${href}">${text || href}</a>`;
}
function refs(list) {
  return (list || []).map((r) => a(r.url, r.label)).join(' · ');
}
function head(title) {
  return `<div class="page-head"><h1>${title}</h1><img class="emblem" src="${asset('logo-icon-black.png')}" alt="Alan Ranger Photography"/></div>`;
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
function linkList(items) {
  return (items || []).map((x) => `<li>${a(x.url, x.label)}</li>`).join('');
}
function inlineLinks(items) {
  return (items || []).map((x) => a(x.url, x.label)).join(' · ');
}
function adminRef() {
  return `<div class="callout callout-ref"><p style="margin:0">Upload your selects to your Dropbox folder and book your Zoom review exactly as set out under <strong>How this works</strong> — same folder, same booking link, same <strong>prepaid</strong> code.</p></div>`;
}
function refSearchPanel(loc) {
  if (!loc.referenceSearches?.length) return '';
  return `<div class="panel panel-ref">
    <div class="panel-label">Reference images — inspiration only, not to copy</div>
    <p class="panel-note">Other photographers' work — study the approach, then make your own frame.</p>
    <ul class="panel-links">${linkList(loc.referenceSearches)}</ul>
  </div>`;
}
function mapsPanel(loc) {
  if (!loc.maps?.length) return '';
  return `<div class="panel panel-maps">
    <div class="panel-label">Navigate — Google Maps</div>
    <ul class="panel-links">${linkList(loc.maps)}</ul>
  </div>`;
}
function cameraPanel(loc) {
  const c = loc.cameraSettings;
  if (!c) return '';
  return `<div class="panel panel-camera">
    <div class="panel-label">Camera settings — starting point (adjust on site)</div>
    <p class="panel-note">${c.conditions} · Canon R6 III · RF 24–70 / RF 100–500 · tripod where noted</p>
    <table class="settings-table"><tbody>
      <tr><th>ISO</th><td>${c.iso}</td></tr>
      <tr><th>Aperture</th><td>${c.aperture}</td></tr>
      <tr><th>Shutter</th><td>${c.shutter}</td></tr>
      <tr><th>Focal length</th><td>${c.focal}</td></tr>
    </tbody></table>
  </div>`;
}
function diagramPanel(loc) {
  const svg = diagrams[loc.diagramKey];
  if (!svg) return '';
  return `<div class="panel panel-diagram"><div class="panel-label">Viewpoint diagram</div>${svg}</div>`;
}
function locExtras(loc) {
  if (!buildV2) return '';
  return `${mapsPanel(loc)}${diagramPanel(loc)}${cameraPanel(loc)}${refSearchPanel(loc)}`;
}
function fieldInteract() {
  if (!buildV2) return '';
  return `<div class="field-interact">
    <div class="tick-row"><span class="tick"></span> Shot made <span class="tick"></span> Verticals checked <span class="tick"></span> Settings noted</div>
    <div class="rate-row"><span class="rate-label">Rate this frame</span>${[1, 2, 3, 4, 5].map((n) => `<span class="rate-box">${n}</span>`).join('')}</div>
    <label>Composition sketch</label><div class="sketch-box"></div>
  </div>`;
}
function reflectionBlock(n, long) {
  const intent = long ? 'Intent — what I wanted the image to say' : 'Intent';
  const improve = long ? 'One improvement for next time' : 'One improvement';
  return `<div class="field-block">
    <h2>Reflection ${n}</h2>
    <label>Location</label><div class="line"></div>
    ${fieldInteract()}
    <label>${intent}</label><div class="line area"></div>
    <label>${improve}</label><div class="line area"></div>
  </div>`;
}
function mentorPage() {
  if (!buildV2) return '';
  return `<section class="sheet">
  <div class="sheet-inner prose-page">
    ${head('Meet your mentor')}
    <p>I'm Alan Ranger — a professional photographer and photography educator based in Coventry, working across the UK.</p>
    <p>I came to this late and sideways. Before photography I worked in IT and business change management, at board level, until I went full-time with the camera in 2013. That background matters more than it sounds: I'm interested in why a picture works, not just how it was taken. Understanding the mechanism is what lets you repeat a good frame instead of hoping for another one.</p>
    <p>I'm a Qualified Associate of the British Institute of Professional Photography (ABIPP) and an Associate of the Royal Photographic Society (ARPS), with over 20 years behind the camera and 15 years teaching. I've taught thousands of people — workshops across the UK, courses, private tuition, and mentoring at every level from first camera to RPS distinction.</p>
    <p>What I care about in teaching is the same thing I care about in my own work: not imitating how the world looks, but photographing the excitement of how it feels. That's the harder job, and it's the one worth learning.</p>
    <p>You'll get honest feedback from me. Not flattery — you don't improve from being told everything is lovely. You bring the work, I'll tell you what I see.</p>
  </div>
</section>`;
}
function pathwayPage() {
  if (!buildV2) return '';
  return `<section class="sheet">
  <div class="sheet-inner prose-page">
    ${head('Where this leads')}
    <h2>Your EPQ project</h2>
    <p>You're building the photographic artefact for an EPQ on structural photography and design engineering. My role is the photography: planning what to shoot, shooting direction, technical development, editing, critique and portfolio workflow. Your school handles the academic side — the essay, the research framework and the assessment.</p>
    <h2>Competitions</h2>
    <p>Three are in view: the Sony World Photography Awards Youth competition, the Rotary Young Photographer competition, and the AOP Student Photography Awards, which has a category for architecture and built infrastructure. One body of work, three uses. I'll help you make the photographs and build the portfolio stronger — you and your family handle entries, deadlines and submissions. <strong>Always check each competition's current published rules; requirements and dates change year to year.</strong></p>
    <h2>RPS distinctions</h2>
    <p>Separate from both, and worth knowing about. The Royal Photographic Society runs a tiered set of distinctions — Licentiate (LRPS), Associate (ARPS) and Fellow. LRPS is the realistic first target, and it's a recognised statement that your work meets a standard. I mentor photographers through LRPS and ARPS, and to date every client I've mentored has passed.</p>
  </div>
</section>`;
}

const cycle = ['Learn', 'Practise', 'Photograph', 'Review', 'Improve', 'Repeat'];
const photoExamples = {
  grafton: {
    file: '04-architecture-examples/coventry-cathedral-texture.jpg',
    caption:
      'Here I let texture and scale carry the frame — weathered stone, window tracery and a lone figure dwarfed by the wall. There is no wide establishing shot; the structure is read through surface and proportion. At Grafton, do the same: let the concrete and the arch\u2019s mass speak, and use a person only to show how big it really is.'
  },
  ngahau: {
    file: '04-architecture-examples/bormes-roofs.jpg',
    caption:
      'Compressed rooftops become pure rhythm — repeated tiles, staggered angles, warm light raking across the pattern. The long lens stacks the layers so shape matters more than place. On Ng\u0101 Hau M\u0101ngere, look for the same: let the curve of the deck, the steel arch and the balustrade pattern line up into one graphic idea, not a record of the whole bridge.'
  },
  harbour: {
    file: '04-architecture-examples/southwold-mono-ii.jpg',
    caption:
      'Black and white strips this pier to line, tone and the steady rhythm of its legs; a long exposure smooths the water so nothing competes with the structure. That restraint is the lesson for the Harbour Bridge at dusk — simplify to steel and light, let a slow shutter quiet the harbour, and decide what the photograph is about before the sky turns.'
  }
};
const locV3 = {
  'Grafton Bridge': {
    why: 'Early reinforced concrete at civic scale — mass, void and curve in one walkable structure.',
    context:
      'Opened 1910 and once claimed as the world\u2019s largest reinforced-concrete arch. Twin three-pinned ferro-concrete arches span a deep urban gully, with open Vierendeel approach frames. Concrete was chosen over cheaper steel for lower maintenance; it is now a Category 1 historic place.',
    challenge:
      'Make one frame where the bridge is understood through shape and negative space, not a documentary wide shot.',
    mentor:
      'Look first. Decide whether the story is the arch, the approach frames, or the city beyond — then choose lens and position to match.'
  },
  'Ngā Hau Māngere': {
    why: 'A contemporary pedestrian bridge beside a motorway crossing — three eras of “what a bridge is for” in one harbour.',
    context:
      'Ng\u0101 Hau M\u0101ngere — \u201cthe winds of M\u0101ngere\u201d — replaced a 1915 concrete road bridge on the old harbour crossing. About 260 m of walking-and-cycling deck curves on plan around a ~60 m steel arch, with kahawai-patterned balustrades: structure and local identity designed as one.',
    challenge:
      'Find one graphic frame where curve, deck and arch read as a single designed shape — geometry before scenery.',
    mentor:
      'Contrast is your friend here: slender shared path against heavy motorway spans, or pattern against open water.'
  },
  'Auckland Harbour Bridge': {
    why: 'Auckland’s defining harbour crossing — scale, steel rhythm, and the visible story of the Nippon clip-ons.',
    context:
      'Opened 1959, designed by Freeman Fox and built by the firms behind Sydney Harbour Bridge. A through-truss steel span about 1,020 m long, with a ~244 m main navigation span. By 1969 traffic forced the Japanese \u201cclip-on\u201d box-girder lanes bolted beside the original truss — which is why the silhouette looks thickened.',
    challenge:
      'From a legal viewpoint, make one frame that shows original truss and later clip-on as two structural languages.',
    mentor:
      'Long exposure is an option, not a requirement. Adapt to wind, light and what the harbour is doing that hour.'
  }
};

function photoExampleBlock(key) {
  const ex = photoExamples[key];
  if (!ex) return '';
  return `<div class="photo-example">
    <img src="${wbImg(ex.file)}" alt="Alan Ranger photograph"/>
    <p class="photo-caption"><strong>Why this photograph works.</strong> ${ex.caption}</p>
  </div>`;
}
function locFiguresV31(loc) {
  const ex = photoExamples[loc.diagramKey];
  const diagram = orientation[loc.diagramKey] || '';
  const photo = ex
    ? `<figure class="photo-fig"><img src="${wbImg(ex.file)}" alt="Alan Ranger photograph"/></figure>`
    : '';
  const caption = ex
    ? `<p class="photo-caption"><strong>Why this photograph works.</strong> ${ex.caption}</p>`
    : '';
  const refs = loc.referenceSearches?.length
    ? `<span><span class="nav-lbl">Reference — inspiration only</span> ${inlineLinks(loc.referenceSearches)}</span>`
    : '';
  return `<div class="loc-figs">
      <figure class="orient-fig">${diagram}</figure>
      ${photo}
    </div>
    ${caption}
    <div class="loc-nav">
      <span><span class="nav-lbl">Navigate — Google Maps</span> ${inlineLinks(loc.maps)}</span>
      ${refs}
    </div>`;
}
function locBottomV3(loc) {
  return `${photoExampleBlock(loc.diagramKey)}
    <div class="loc-links">${mapsPanel(loc)}${refSearchPanel(loc)}</div>`;
}
function locPageV3(loc) {
  const v3 = locV3[loc.name] || {};
  const lookFor = (loc.photograph || []).slice(0, 3);
  const context = v3.context || `${loc.history} ${loc.engineering}`;
  return `<section class="sheet">
  <div class="sheet-inner loc-brief loc-v3">
    ${head(loc.name)}
    <p class="loc-opportunity">${loc.whyItMatters.split('.')[0]}.</p>
    <h2>Why I chose this location</h2>
    <p>${v3.why || loc.whyItMatters}</p>
    <h2>Context</h2>
    <p>${context}</p>
    <h2>What to look for</h2>
    <ul class="photo-list">${lookFor.map((x) => `<li>${x}</li>`).join('')}</ul>
    <h2>Photography challenge</h2>
    <p>${v3.challenge || 'One open-ended frame that works in the light and time you actually have.'}</p>
    <div class="callout mentor-callout"><div class="label">Mentor's note</div><p style="margin:0">${v3.mentor || 'Look first. Decide what the photograph is about, then choose the lens that helps you say it.'}</p></div>
    <div class="callout callout-safety"><div class="label">Safety</div><p style="margin:0">${loc.safety}</p></div>
    ${v31 ? locFiguresV31(loc) : locBottomV3(loc)}
  </div>
</section>`;
}
function htmlV3() {
  return `<!DOCTYPE html>
<html lang="en-GB">
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

<section class="sheet cover cover-photo">
  <img class="cover-bg" src="${wbImg('01-cover/constantin-nz-cover.jpg')}" alt=""/>
  <div class="cover-overlay">
    <img class="logo" src="${asset('logo-white.png')}" alt="Alan Ranger Photography"/>
    <div>
      <hr class="rule"/>
      <h1>${d.project.title}<span class="accent">${d.project.subtitle}</span></h1>
      <p class="meta">For ${d.student.fullName || d.student.displayName}</p>
      <p class="meta">${d.project.dateLabel}</p>
      <p class="creds">Alan Ranger · ARPS · ABIPP</p>
    </div>
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Welcome')}
    <p class="lead">A structured photography project — not a holiday itinerary.</p>
    <p>Constantin — this handbook supports your New Zealand trip as a development opportunity: three Auckland bridges, Queenstown landscapes, and the mentoring work that continues when you are home. Use it to prepare, to shoot with intention, and to arrive at each Zoom review ready to talk about your choices.</p>
    <p>You are 16, you carry an R6 III, and you are learning a professional workflow. That means honest engagement, safety first at every viewpoint, and curiosity about why a frame works — not filling in forms before we speak.</p>
    <p>Every Academy link in here is real. Work through the essentials before you fly; the rest supports you on location and after. Safe travels — Alan.</p>
  </div>
</section>

<section class="sheet cycle-page">
  <div class="sheet-inner">
    ${head('How this works')}
    <p class="lead">Two ideas work together: the mentoring loop (how learning develops over time) and the Vision Framework (how to think while making each photograph).</p>
    <div class="cycle-wrap cycle-compact">
      <div class="cycle-row">
        ${cycle.map((s, i) => `<div class="cycle-step cycle-step-sm"><span class="n">${i + 1}</span><span class="t">${s}</span></div>`).join('')}
      </div>
    </div>
    <p class="loop-plain"><strong>Complete Academy prep → shoot → edit selects → upload to Dropbox → book your review → we discuss → you apply it on the next shoot.</strong></p>
    <h2>Alan Ranger Vision Framework — 30 · 50 · 10 · 10</h2>
    <p>See 30% · Design 50% · Shoot 10% · Review 10%. The largest investment is before the shutter — observation and composition, not settings rescue in post.</p>
    <img class="vision-framework" src="${wbImg('03-vision-framework/alan-30-50-10-10-framework.png')}" alt="See 30%, Design 50%, Shoot 10%, Review 10%"/>
    ${dropboxBoxShort()}
    ${zoomBox()}
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Your field kit')}
    <p class="lead">What you are carrying — and when each item earns its place in the bag.</p>
    <ul class="kit-list">
      ${d.kit.map((k) => `<li><strong>${k.item}</strong>${k.for}</li>`).join('')}
    </ul>
    <div class="callout"><div class="label">Choose for the situation</div>
      <p style="margin:0">24–70 for responsive general work · 100–500 for isolation and compression · tripod only when stability or long exposure genuinely needs it · monopod when the telephoto is tiring, not by default.</p>
    </div>
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner prose-page mentor-v3">
    ${head('Meet your mentor')}
    <blockquote class="pull-quote">Understanding why a picture works is what allows you to do it again.</blockquote>
    <div class="mentor-cols">
      <p>I'm Alan Ranger — professional photographer and educator based in Coventry. I came to photography from an IT and business background; what I care about in teaching is the same as in my own work: not imitating how the world looks, but photographing how it feels.</p>
      <p>Over 20 years behind the camera and 15 years teaching. ABIPP and ARPS as post-nominals — you'll get honest feedback, not flattery. You bring the work; I'll tell you what I see.</p>
    </div>
    <figure class="mentor-figure">
      <img src="${wbImg('02-mentor/alan-teaching.jpg')}" alt="Alan Ranger teaching one to one at his desk"/>
      <figcaption>Working through a student's own images, one to one — the way we'll review yours.</figcaption>
    </figure>
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Before you fly')}
    <p class="lead">Academy prep in order. Allow ~45 min per essential lesson plus practice where noted.</p>
    <table>
      <thead><tr><th>#</th><th>Academy item</th><th>Why</th><th>Priority</th></tr></thead>
      <tbody>
        ${d.beforeFly.map((r) => `<tr>
          <td>${r.order}</td>
          <td>${a(r.url, r.title)}${r.extra ? `<br/>${a(r.extraUrl, r.extra)}` : ''}</td>
          <td>${r.why}</td>
          <td class="priority">${r.priority}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <h2>UK bridge homework</h2>
    <p>${d.ukHomework}</p>
    ${v31 ? adminRef() : dropboxBox()}
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Phase A — Auckland')}
    <p class="lead">${d.phaseA.dates} · Three engineering eras, three photographic opportunities.</p>
    <p>${d.phaseA.intro}</p>
    <ul class="kit-list">
      ${d.phaseA.locations.map((loc) => `<li><strong>${loc.name}</strong>${loc.where.split('.')[0]}.</li>`).join('')}
    </ul>
    <div class="callout mentor-callout"><div class="label">Mentor's tip</div><p style="margin:0">Do not try to photograph everything. In the conditions you actually have, find the strongest opportunity at each bridge — one clear idea beats a checklist of angles.</p></div>
    <div class="callout"><div class="label">Safety</div><p style="margin:0">Public paths and viewpoints only. Never stop on a motorway, hard shoulder, or climb barriers for a shot.</p></div>
  </div>
</section>

${d.phaseA.locations.map((loc) => locPageV3(loc)).join('')}

<section class="sheet">
  <div class="sheet-inner">
    ${head('Before your first Zoom')}
    <p class="lead">${d.phaseB.dates} · Select, edit lightly, upload — we refine together on screen.</p>
    <p>This handbook does not teach Lightroom. The workflow is simple: review everything you shot → identify the strongest frames → make a first edit → upload to Dropbox → book your Zoom → we work through your own images together and refine from there.</p>
    <div class="callout mentor-callout"><div class="label">Mentor's note</div><p style="margin:0">Do not worry about mastering Lightroom before the trip. We will work through your own images together during Zoom sessions.</p></div>
    <p><strong>Before Zoom:</strong> pass Architecture (c2-13), Leading Lines (c2-03) and Framing (c2-02) exams where linked · upload 8–12 edited Auckland exports to your Dropbox folder.</p>
    ${v31 ? adminRef() : dropboxBox()}
    ${v31 ? '' : zoomBox()}
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Phase C — Queenstown')}
    <p class="lead">${d.phaseC.dates}</p>
    ${v31 ? `<figure class="scene-fig"><img src="${wbImg('06-queenstown/alan-landscape-scene.jpg')}" alt="Mountain lake landscape by Alan Ranger"/><figcaption>One of Alan\u2019s own landscapes — the quiet, simplified seeing the Southern Lakes reward.</figcaption></figure>` : ''}
    <p>${d.phaseC.focus}</p>
    <div class="panel"><div class="panel-label">Photographic opportunities</div>
      <ul class="photo-list">${d.phaseC.themes.map((t) => `<li><strong>${t.theme}</strong> — ${t.activity}. ${refs(t.refs)}</li>`).join('')}</ul>
    </div>
    <p>${d.phaseC.assignment}</p>
    ${v31 ? adminRef() : dropboxBox()}
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Phase D — August to December')}
    <p class="lead">A high-level roadmap after you are home — likely focus each month, not a rigid syllabus.</p>
    <div class="timeline">
      ${d.phaseD.map((m) => `<div class="timeline-item"><span class="timeline-month">${m.month}</span><span class="timeline-focus">${m.focus}</span><span class="timeline-modules">${a(m.url, m.modules)}${m.url2 ? ` · ${a(m.url2, m.label2)}` : ''}</span></div>`).join('')}
    </div>
    <p class="footer-note">Pass mark for Academy exams: <strong>80%</strong>. Competition eligibility and dates are checked together when a body of work exists.</p>
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('Looking back')}
    <p class="lead">Preparation for your next mentoring conversation — not homework to submit.</p>
    <ul class="prompt-list">
      <li>Which images feel strongest so far, and why?</li>
      <li>Which location was most challenging, and what did you learn?</li>
      <li>Was there an unexpected result you want to discuss?</li>
      <li>What technique or decision improved between shoots?</li>
      <li>Which frame(s) do you most want reviewed on Zoom?</li>
      <li>What question do you want to bring to the next session?</li>
    </ul>
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner prose-page">
    ${head('Where this leads')}
    <h2>Your EPQ project</h2>
    <p>You are building the photographic artefact for an EPQ on structural photography and design engineering. I support the photography — planning, shooting direction, technical development, editing, critique and portfolio workflow. Your school manages the academic requirements and assessment.</p>
    <h2>Competitions</h2>
    <p>Possible routes — subject to current eligibility, deadlines and rules: Sony World Photography Awards Youth, Rotary Young Photographer, AOP Student Awards (architecture and built infrastructure category). We review suitable entries together after the first body of work exists. <strong>Always check each competition's published rules; requirements change year to year.</strong></p>
    <h2>RPS distinctions</h2>
    <p>A future pathway, separate from the EPQ. Licentiate (LRPS) and Associate (ARPS) are recognised standards. I mentor photographers through LRPS and ARPS, and to date every client I've mentored has passed.</p>
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner closing-page">
    ${head('Before you go')}
    <p class="lead">A last word from Alan.</p>
    <p>The purpose of this project is not simply to return from New Zealand with more photographs. It is to return with a stronger way of seeing, deciding and making them.</p>
    <p>Look first. Decide what the photograph is about. Then choose the lens and settings that help you say it. I am looking forward to seeing what you make.</p>
    <p class="sign-off">Alan Ranger · ARPS · ABIPP</p>
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
}

const cycleLegacy = ['Learn', 'Practise', 'Photograph', 'Review', 'Reflect', 'Improve', 'Repeat'];

const html = buildV3 ? htmlV3() : `<!DOCTYPE html>
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
        ${cycleLegacy.slice(0, 4).map((s, i) => `<div class="cycle-step cycle-step-sm"><span class="n">${i + 1}</span><span class="t">${s}</span></div>`).join('')}
      </div>
      <div class="cycle-row">
        ${cycleLegacy.slice(4).map((s, i) => `<div class="cycle-step cycle-step-sm"><span class="n">${i + 5}</span><span class="t">${s}</span></div>`).join('')}
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

${mentorPage()}

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
    <p class="lead">${d.phaseA.dates}</p>
    <p>${d.phaseA.intro || ''}</p>
    <ul class="kit-list">
      ${d.phaseA.locations.map((loc) => `<li><strong>${loc.name}</strong>${loc.where}</li>`).join('')}
    </ul>
    <h2>Across all three</h2>
    <p>${a(d.phaseA.eachShoot.url, d.phaseA.eachShoot.label)} — ${d.phaseA.eachShoot.notes}</p>
    <p>${d.phaseA.gear}</p>
    <div class="callout"><div class="label">Safety</div><p style="margin:0">Public paths and viewpoints only. Never stop on a motorway, hard shoulder, or climb barriers for a shot.</p></div>
  </div>
</section>

${d.phaseA.locations.map((loc) => `
<section class="sheet">
  <div class="sheet-inner loc-brief">
    ${head(loc.name)}
    <p class="where"><strong>Where:</strong> ${loc.where}</p>
    <p class="refs">${refs(loc.refs)}</p>
    <h2>History</h2>
    <p>${loc.history}</p>
    <h2>Engineering</h2>
    <p>${loc.engineering}</p>
    <h2>Why it matters</h2>
    <p>${loc.whyItMatters}</p>
    <h2>What to photograph</h2>
    <ol class="photo-list">
      ${(loc.photograph || []).map((x) => `<li>${x}</li>`).join('')}
    </ol>
    <p class="gear-line"><strong>Gear:</strong> ${loc.gear}</p>
    ${locExtras(loc)}
    <div class="callout"><div class="label">Safety</div><p style="margin:0">${loc.safety}</p></div>
  </div>
</section>`).join('')}

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
      ${fieldInteract()}
      <label>What I tried</label><div class="line area"></div>
      <label>What I would change</label><div class="line area"></div>
    </div>
  </div>
</section>`).join('')}

<section class="sheet">
  <div class="sheet-inner">
    ${head('Reflection prompts')}
    <p class="lead">Use the Phase B template — short reflections for Zoom.</p>
    ${[1, 2, 3].map((n) => reflectionBlock(n, true)).join('')}
  </div>
</section>

<section class="sheet">
  <div class="sheet-inner">
    ${head('More space to write')}
    ${[4, 5].map((n) => reflectionBlock(n, false)).join('')}
  </div>
</section>

${pathwayPage()}

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
