# MC-46 — Premium Mentoring System · PHASE 1 asset inventory

**Date:** 2026-07-21  
**Scope:** Inventory only. No design, no new assets, no handbook/workbook production, no Academy DB writes.  
**Target product (Phases 2–7, not this task):** master design system · evergreen student handbook · bespoke student workbook (Constantin NZ first) · private mentor workbook.  
**Brief brand:** `#E57200` orange · `#faf3e6` cream · `#2b2622` charcoal · cycle **Learn → Practise → Photograph → Review → Reflect → Improve → Repeat**.

For each asset: **what · where · format · reuse verdict · mentoring use**.

---

## 1. Brand colours & tokens

| What | Where | Format | Verdict | Mentoring use |
|------|-------|--------|---------|---------------|
| Primary orange `#E57200` + hover `#cc6500` | `Academy/.../src/styles.css` (`--ar-orange`) · `src/assets/brand.json` | CSS / JSON | **Reusable as-is** | Primary brand for print + UI |
| Academy text/border/muted/blue | same `brand.json` / `styles.css` | CSS / JSON | **Needs rework** for print | Web-only secondary; blue `#2563eb` may not suit premium print |
| Cream `#faf3e6` · charcoal `#2b2622` | Brief only — **not found** in Academy `brand.json` / site tokens searched | — | **Missing** | Must be defined in Phase 2 design system |
| System UI font stack only | Academy `styles.css` | CSS | **Unusable for premium print** | Phase 2 needs chosen display + body type (not Inter/Roboto defaults) |

---

## 2. Logos, marks, signatures

| What | Where | Format | Verdict | Mentoring use |
|------|-------|--------|---------|---------------|
| Academy emblem / shield variants | `Academy/.../src/assets/academy-emblem.png`, `academy.png`, `example-shield.jpg`; `icons and graphics\`; `web Graphics\Alan Ranger Branding\academy_shield_*.png` | PNG | **Reusable as-is** (pick master) | Cover marks, certificates, page furniture |
| Full logo lockups (black/white/icon) | `Business\OneVision\ARP Branding\` · `web Graphics\Alan Ranger Branding\` · Academy root PNGs | PNG, PSD, EPS, PDF | **Reusable as-is** | Handbook/workbook covers, headers |
| Watermarks | `ARP Branding\watermark*` · Drive `09 Images & Logos\AR-watermark-white-logo.png` | PNG/JPG | **Reusable as-is** | Optional print footer / photo pages |
| Signature | `Academy/.../src/assets/signature.png` · `ARP Branding\AR Signature.*` | PNG/JPG | **Reusable as-is** | Mentor workbook / cert sign-off |
| Mentoring product banners / footers | `web Graphics\Alan Ranger Branding\tution, mentorin, workshops, footer*` · eco roller banners | PNG/PSD/PDF | **Needs rework** | Marketing era; harvest icons, not page templates |
| ChatGPT-generated images (Jun 2026) | Drive `09 Images & Logos\Images\ChatGPT Image*.png` | PNG | **Unusable** for quality bar | Do not use in premium print |
| Partner logos (Benro, Kase, Amazon…) | Drive `09 Images & Logos\partner logos\` | PNG/JPG | **Reusable as-is** where licensed | Optional “supported by” — not core mentoring identity |
| Ethics / Nature First / carbon badges | Drive `09 Images & Logos\ethics\` | PNG/JPG | **Reusable as-is** | Handbook ethics appendix if desired |
| RPS mark | `web Graphics\Alan Ranger Branding\rps.png` | PNG/PSD | **Reusable with care** | RPS-path workbooks only; check usage rights |

---

## 3. Brand guidelines & letterhead

| What | Where | Format | Verdict | Mentoring use |
|------|-------|--------|---------|---------------|
| Alan Ranger Photography Branding | `web Graphics\Alan Ranger Branding\Alan Ranger Photography Branding.pdf` (+ `.docx`) | PDF/DOCX | **Needs rework** — review in Phase 2 | Starting point for master design system; likely incomplete vs cream/charcoal + cycle identity |
| Letterhead | `...\Alan Ranger Photography Letterhead.docx` | DOCX | **Needs rework** | Mentor letters / private notes — not student workbook chrome |
| Help-Portrait blank letterhead | `Help-Portrait\Official Forms\CopyofBlankLetterhead2013.pdf` | PDF | **Unusable** (wrong brand era) | — |

---

## 4. Academy UI / digital product graphics

| What | Where | Format | Verdict | Mentoring use |
|------|-------|--------|---------|---------------|
| `brand.json` image map | `Academy/.../src/assets/brand.json` | JSON | **Reusable as-is** | Canonical web asset index |
| Module / app orange icons | `web Graphics\Alan Ranger Branding\App * Icon Orange.png` | PNG | **Reusable as-is** | Possible cycle-step icons (map later) |
| Exam/certificate module screenshots | `exams and cerficates module alan ranger photography academy.jpg` | JPG | **Needs rework** | Reference only |
| Academy badge ladder decisions | Drive `Academy\ACADEMY-BADGE-LADDER-DESIGN-DECISIONS-*.md` | MD | **Reusable as-is** (policy) | Align mentoring milestones with Academy badges |
| Academy complete spec | Drive `Academy\ACADEMY-COMPLETE-SPEC-LATEST.pdf` | PDF | **Reusable as-is** (reference) | Product boundaries vs mentoring premium tier |

---

## 5. Certificates & completion art

| What | Where | Format | Verdict | Mentoring use |
|------|-------|--------|---------|---------------|
| Module-1 certificate samples | `web Graphics\Alan Ranger Branding\module-1-certificate*.pdf` | PDF | **Needs rework** | Pattern for mentoring milestone certs |
| Beginners course certificates | `Modules\Beginners Course\...\Certificate of Comple*` | mixed | **Needs rework** | Same |
| Gift certificates | Lightroom / LRQ paths | PDF | **Unusable** for mentoring system | Commerce only |

---

## 6. Mentoring / RPS programme documents (content, not design system)

| What | Where | Format | Verdict | Mentoring use |
|------|-------|--------|---------|---------------|
| Monthly Online Mentoring Programme flyer | `Business\Flyers\Monthly Online Photography Mentoring Programme.pdf` (+ docx) | PDF | **Needs rework** | Marketing copy source; not handbook template |
| Mentoring programme confirmation graphics | `Modules\Confirmations\mentoring-programme-*.jpg` · `.tif` | JPG/TIF | **Needs rework** | Ops email art |
| 12-Month Intermediates RPS Mentoring Course | `Modules\Intremediates Course\*.pdf` / `.docx` | PDF/DOCX | **Needs rework** | Curriculum spine for RPS-path workbooks |
| RPS Mentoring Questionnaire | `Modules\RPS Course\` · Drive page-build HTML | DOCX/HTML | **Reusable as-is** (intake) | Student onboarding forms |
| RPS mentoring pricing table (web) | Drive `03 Page Builds\RPS-mentoring-pricing-table-*.html` | HTML | **Needs rework** | Commercial page, not print system |
| Blog mentoring articles | `Blog Posts and Guides\*Mentoring*.docx` | DOCX | **Reusable as-is** (narrative) | Evergreen handbook tone/examples |
| SEO Buyer Persona Workbook | `SEO\SEO Academy\Buyer Persona Workbook.docx` | DOCX | **Unusable** for student product | Internal marketing |

---

## 7. Workshop / field teaching materials (strong reuse for Practise → Photograph)

| What | Where | Format | Verdict | Mentoring use |
|------|-------|--------|---------|---------------|
| Workshop client guidelines (Burnham, Lavender, Padley, Heather, Bluebell…) | Drive `Workshop and Class Guides\*.docx` | DOCX | **Needs rework** → template | Location assignment sheets in student workbook |
| Workshop checklist | `Modules\Confirmations\Workshop Checklist.pdf` | PDF | **Reusable as-is** / light rebrand | Session prep pages |
| Photography Academy field checklists (Exposure, Composition, Landscape, Architecture, B&W, ISO, …) | `Modules\Photography Academy\Clinics\*_Field_Checklist.pdf` (+ cover art) | PDF | **Reusable as-is** with brand pass | Core “Practise / Photograph” inserts; already a product family |
| Image checklist | `Modules\Masterclasses\image checklist.pdf` | PDF | **Reusable as-is** | Critique / Review step |
| 1-page photography field checklist graphic | `web Graphics\Alan Ranger Branding\1 page photography field checklist.png` | PNG | **Needs rework** | Cover / social; not multi-page system |
| Pocket handbook series mockup | `Blog Posts and Guides\pcoket handbook series mockup.JPG` | JPG | **Needs rework** | Precedent that a handbook product was imagined |

---

## 8. Constantin / first workbook instance (content ready, design not)

| What | Where | Format | Verdict | Mentoring use |
|------|-------|--------|---------|---------------|
| Constantin learning path | Drive `Cursor Outputs for Claude\constantin-development-plan\constantin-learning-path.md` | MD | **Reusable as-is** (content) | Feeds bespoke workbook — **strip INTERNAL blocks before student/parent** (MC-47) |
| Academy curriculum inventory | same folder `academy-curriculum-inventory.md` / `.csv` | MD/CSV | **Reusable as-is** | Map Academy modules → mentoring pathway |
| Academy content gaps | `academy-content-gaps.md` | MD | **Reusable as-is** | Phase 2–3 planning |

---

## 9. Editorial photography

| What | Where | Format | Verdict | Mentoring use |
|------|-------|--------|---------|---------------|
| Workshop / course hero imagery | Squarespace CDN URLs in schedule CSVs; local workshop folders | JPG | **Reusable as-is** with selection | Workbook covers, chapter openers |
| Lavender Images (guides) | Drive `Workshop and Class Guides\Lavender Images\` | images | **Reusable as-is** | Location chapters |
| Stock of ChatGPT images | Drive `09 Images & Logos\Images\` | PNG | **Unusable** | Conflicts with quality bar |

---

## 10. Generators / layout systems

| What | Where | Format | Verdict | Mentoring use |
|------|-------|--------|---------|---------------|
| Academy assessment UI (cards, bars, orange CTAs) | `Academy/.../src/styles.css` + engine | HTML/CSS/JS | **Needs rework** for print | Digital companion only |
| Blog snippet / page-build HTML | Drive `03 Page Builds\` | HTML | **Unusable** as print templates | Web |
| No InDesign / Affinity / Figma mentoring master found | — | — | **Missing** | Phase 2 must choose tool + create templates |
| PSD sources for logos/banners | `web Graphics\Alan Ranger Branding\*.psd` | PSD | **Reusable as-is** (masters) | Rebuild print exports |

---

## GAPS (needed for the four deliverables; not found ready)

1. **Unified print design system** — cream `#faf3e6`, charcoal `#2b2622`, type scale, grid, margins, callout styles, progress tracker for Learn→…→Repeat (identity cycle not encoded in any asset set).  
2. **Master template files** (InDesign/Affinity/Figma) for handbook + student workbook + mentor workbook.  
3. **Expressive typography** — Academy is system UI; premium bar needs licensed print fonts.  
4. **Reusable assignment / session / reflection page components** — field checklists exist, but not as modular workbook “furniture”.  
5. **Private mentor workbook schema** — no observation/session-summary template found.  
6. **Constantin NZ bridge workbook** — learning path exists in Markdown only; no designed pages or photo brief sheets for NZ locations.  
7. **Icon set for the 7-step cycle** — orange app icons exist but are not mapped to that narrative.  
8. **Single canonical logo package** — many variants; Phase 2 should lock 2–3 masters (full colour, mono, emblem).

---

## Judgement for Phases 2–7 (no build)

- **Do not start from monthly mentoring flyers or web HTML** — they set the wrong quality bar. Start from **logo/PSD masters + Academy orange + field-checklist product family**, then invent the print system.  
- **Cream/charcoal in the brief are not live in Academy tokens** — confirming them against the website/print letterhead in Phase 2 avoids a dual-brand mess.  
- **Constantin’s workbook can be the first instance of the template**, but **MC-47 (travel Thu)** means Phase 1 inventory must not block his learning-path delivery; designed workbook cannot be ready before he flies.  
- **Strongest existing “Practise/Photograph” asset base** is `Modules\Photography Academy\Clinics\*Field_Checklist.pdf` — Phase 3 should decide whether to rebrand those into the mentoring system or keep as companion downloads.

---

*End of Phase 1. Stop here pending Alan approval before Phase 2.*
