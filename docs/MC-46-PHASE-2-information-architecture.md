# MC-46 — Premium Mentoring System · PHASE 2 information architecture

**Date:** 2026-07-21  
**Scope:** Structure only. No page design, CSS, HTML, PDFs, or handbook/workbook copy.  
**Settled (do not re-open):** site colour tokens · BROWN typeface (licence check below) · HTML/CSS → PDF (Paged.js or equivalent).  
**Depends on:** Phase 1 inventory `docs/MC-46-premium-mentoring-phase1-asset-inventory.md`  
**Stop after this doc** until Alan approves before Phase 3 (visual system + templates).

---

## Part A — Document inventory

| # | Deliverable | Purpose | Audience | ~Pages | Evergreen / bespoke | What data drives it | Regenerated when |
|---|-------------|---------|----------|--------|---------------------|---------------------|------------------|
| 1 | **Master design system** (internal) | Lock tokens, components, naming, file layout for all print PDFs | Alan + Cursor only | 8–12 | Evergreen (versioned) | Colour tokens, BROWN faces, component list, logo masters | When brand/tokens change |
| 2 | **Student handbook** | How mentoring + Academy work together; parent-safe | Student + parent | 20–30 | Evergreen | Static handbook content; logo/version only | Rarely (policy/process change) |
| 3 | **Student project workbook** | Personal project plan + field work + reflection | That student (+ parent if shared) | 24–40 | Bespoke (template + data) | Student JSON (name, project, locations, pathway, exams, dates) | Per student / per project phase |
| 4 | **Mentor workbook** | Private teaching notes — **never sent to students** | Alan only | 16–28 | Bespoke (same student data + mentor-only fields) | Student JSON + `mentorNotes` | After each Zoom / milestone |

**First bespoke instance:** Constantin NZ (bridges / architecture / landscape) — content spine already in Drive `constantin-learning-path.md` (strip INTERNAL before any student-facing export).

---

## Part B — Page-by-page structure

Convention: **Component** · content source · **reuse | rework | write new** (detail in Part E).

### B1 — Master design system (internal reference)

| P | Purpose | Components | Content |
|---|--------|------------|---------|
| 1 | Cover / doc title | `page-title` | “Mentoring print system v1” |
| 2 | Colour tokens + print caveat | `body-spread`, `callout-warning` | Settled hex table; navy CMYK proof note |
| 3 | Typeface (BROWN) + embed rule | `body-spread`, `callout-warning` | Faces + licence status |
| 4 | Logo package (2–3 masters) | `photo-with-caption` | Full colour · mono · emblem |
| 5–7 | Component catalogue | one sketch per component | Names from Part C |
| 8 | File / data layout | `body-spread`, `checklist` | Repo paths + JSON schema pointer |
| 9 | Version / changelog | `body-spread` | v1.0 |

### B2 — Student handbook (evergreen, ~24 pp)

| P | Purpose | Components | Content exists? |
|---|--------|------------|-----------------|
| 1 | Cover | `page-title`, logo | **write new** (title only) |
| 2 | Welcome | `body-spread` | **rework** mentoring flyer / blog mentoring tone |
| 3 | About Alan | `body-spread`, `photo-with-caption` | **rework** site About + brand PDF |
| 4 | How mentoring works | `section-divider`, `cycle-diagram`, `body-spread` | **write new** + **rework** flyer |
| 5 | How the Academy works | `body-spread`, `checklist` | **rework** Academy complete spec / badge ladder |
| 6 | Learning philosophy (7-step cycle) | `cycle-diagram`, `callout-tip` | **write new** (cycle named in brief) |
| 7 | Dropbox workflow | `checklist`, `callout-warning` | **write new** (ops — Alan confirm folder pattern) |
| 8 | Zoom workflow | `checklist`, `callout-tip` | **write new** |
| 9 | Assignments | `assignment-box`, `body-spread` | **rework** workshop guidelines pattern |
| 10 | Exams | `exam-roadmap-table` (generic) | **rework** Academy exam policy |
| 11 | Certificates & badges | `body-spread`, `photo-with-caption` | **rework** module cert samples + badge ladder MD |
| 12 | Progress | `progress-tracker` | **write new** (print metaphor of Academy progress) |
| 13 | Reflection | `reflection-prompt` | **write new** |
| 14 | Portfolio development | `body-spread`, `checklist` | **rework** image checklist + storytelling module ideas |
| 15 | What parents can expect | `body-spread`, `callout-tip` | **write new** |
| 16–17 | FAQs | `body-spread` | **write new** (seed from flyer Qs if any) |
| 18 | Companion downloads note | `callout-tip`, `checklist` | Field checklists = **companions** (see Part E) |
| 19 | Back / contact | `page-title` | **rework** letterhead contact |

### B3 — Student project workbook (bespoke · Constantin NZ first, ~32 pp)

| P | Purpose | Components | Content exists? |
|---|--------|------------|-----------------|
| 1 | Cover (name + project) | `page-title` | Data: student + project title |
| 2 | Personal goals | `reflection-prompt`, `body-spread` | **write new** + student intake |
| 3 | Learning objectives | `checklist`, `body-spread` | **rework** Constantin path “Why” column |
| 4 | Academy roadmap | `progress-tracker`, `exam-roadmap-table` | **reuse** curriculum inventory + Constantin path tables |
| 5 | Exam roadmap | `exam-roadmap-table` | **reuse** Constantin Phase B exam IDs |
| 6 | Assignment overview | `assignment-box` list | **reuse** Constantin path + Academy # items |
| 7–9 | Location briefs (×3 Auckland bridges; ×N Queenstown) | `location-brief`, `photo-with-caption` | **rework** workshop guide pattern; **write new** NZ specifics |
| 10–12 | Field notes pages | `field-notes-grid` | **write new** (blank structure) |
| 13 | Field checklist pointer | `callout-tip`, `checklist` | **reuse as-is** Architecture / Long Exposure / Landscape clinic PDFs as companions |
| 14–15 | Reflection sheets | `reflection-prompt` | **write new** (3-reflection template already in Constantin path) |
| 16 | Portfolio planning | `checklist`, `body-spread` | **rework** Constantin upload targets |
| 17 | Zoom preparation | `checklist`, `callout-tip` | **reuse** Constantin Phase B upload list |
| 18 | Action plans | `assignment-box`, `checklist` | **write new** |
| 19 | Progress tracking | `progress-tracker` | Data-driven ticks |
| 20 | Cycle reminder | `cycle-diagram`, `section-divider` | Shared with handbook |
| — | Optional photo spreads | `photo-full-bleed` | After student uploads (later regen) |

### B4 — Mentor workbook (private, ~20 pp)

| P | Purpose | Components | Content exists? |
|---|--------|------------|-----------------|
| 1 | Cover (student + “MENTOR ONLY”) | `page-title`, `callout-warning` | Data |
| 2 | Student snapshot | `body-spread`, `progress-tracker` | Shared student JSON |
| 3–4 | Teaching notes | `observation-log` | **write new** |
| 5–6 | Lesson plans | `assignment-box`, `checklist` | **rework** Constantin phases + clinic agendas |
| 7–8 | Observations | `observation-log` | **write new** |
| 9 | Progress vs plan | `progress-tracker`, `exam-roadmap-table` | Data |
| 10–12 | Session summaries | `session-summary` | **write new** |
| 13 | Ideas / future assignments | `callout-tip`, `assignment-box` | **write new** |
| 14 | Strengths | `body-spread` | **write new** |
| 15 | Weaknesses / watch-outs | `callout-warning`, `body-spread` | **write new** |
| 16 | Parent / logistics notes | `callout-warning` | **write new** (never in student PDF) |

---

## Part C — Reusable component library

Plain-text structure only (not design).

| Component | What it is | Used in | Data inputs | Structure sketch |
|-----------|------------|---------|-------------|------------------|
| `page-title` | Cover / chapter title block | All | `title`, `subtitle`, `logoKey` | LOGO · H1 · optional sub · optional meta line |
| `section-divider` | Full-bleed navy chapter break | Handbook, workbooks | `heading`, `oneLiner` | NAVY BAND · white H1 · orange rule · one line |
| `body-spread` | Cream reading page | All | `heading?`, `paragraphs[]` | H2 · body paras · optional list |
| `callout-tip` | Soft advice box | Handbook, student WB | `title`, `body` | TIP label · short text |
| `callout-warning` | Caution / private / ink caveat | Design system, mentor, Dropbox | `title`, `body` | WARNING label · short text |
| `assignment-box` | One assignment unit | Handbook, both WBs | `code`, `title`, `why`, `deliverable`, `due?` | Code · title · why · deliverable · due |
| `reflection-prompt` | Lined / blank answer space | Handbook, student WB | `prompt`, `lines` | Prompt · N blank lines / boxes |
| `checklist` | Tick list | All | `items[{label,done?}]` | □ / ☑ rows |
| `progress-tracker` | Milestone strip | Handbook, both WBs | `steps[{id,label,status}]` | Horizontal or vertical step markers |
| `cycle-diagram` | Learn→…→Repeat | Handbook, student WB | none (fixed 7 labels) | 7 labelled nodes in loop |
| `photo-full-bleed` | Edge-to-edge image page | Student WB (later) | `src`, `alt` | Image only · tiny credit |
| `photo-with-caption` | Image + caption | Design system, handbook | `src`, `caption`, `credit?` | Image · caption under |
| `field-notes-grid` | Shoot log table | Student WB | optional seed rows | Date · location · settings · intent · result |
| `location-brief` | One location sheet | Student WB | `name`, `goals[]`, `gear[]`, `safety[]`, `academyRefs[]` | Name · goals · gear · safety · Academy refs |
| `exam-roadmap-table` | Exam / module map | Handbook, both WBs | `rows[{examId,title,status,when}]` | Table: exam · title · status · when |
| `session-summary` | Post-Zoom record | **Mentor only** | `date`, `focus`, `wins`, `nextActions[]` | Date · focus · wins · next |
| `observation-log` | Ongoing notes | **Mentor only** | `entries[{date,note,tag?}]` | Dated note list |

---

## Part D — Data model (swappable student data)

**Principle:** templates never hard-code a student. Second workbook = new JSON file (or frontmatter) only.

### Suggested home

```
alan-shared-resources/
  mentoring/
    design-system/          # Phase 3+ tokens & CSS
    templates/              # Phase 3+ HTML partials
    students/
      constantin-nz-2026/
        student.json        # shared student + project data
        mentor-notes.json   # private — never in student build
      _schema/
        student.schema.json
```

Drive may hold working drafts; **git repo is source of truth** for templates + shipped JSON shapes.

### `student.json` (sketch)

```json
{
  "student": {
    "displayName": "Constantin",
    "parentFacingName": "Constantin",
    "timezone": "Pacific/Auckland"
  },
  "project": {
    "id": "nz-bridges-2026",
    "title": "Auckland & Queenstown — architecture & landscape",
    "startDate": "2026-07-22",
    "endDate": "2026-08-01"
  },
  "academyPathway": {
    "focusModules": ["#42", "#29", "#27", "#15", "#41"],
    "exams": [
      { "id": "c2-13-architecture", "title": "Architecture", "status": "planned" },
      { "id": "c2-03-leading-lines", "title": "Leading Lines", "status": "planned" }
    ]
  },
  "assignments": [
    {
      "id": "pre-fly-bridge",
      "title": "UK bridge or building — 5 images",
      "why": "Baseline before Auckland",
      "deliverable": "Dropbox upload",
      "phase": "before-fly"
    }
  ],
  "locations": [
    {
      "id": "grafton",
      "name": "Grafton Bridge",
      "phase": "A",
      "goals": ["Urban lines", "Level camera"],
      "gear": ["24–70"],
      "safety": ["Public viewpoints only"],
      "academyRefs": ["#42", "#29"]
    }
  ],
  "zoomSessions": [
    { "id": "zoom-1", "label": "Post-Auckland review", "window": "2026-07-26/27" }
  ],
  "goals": ["Improve architecture technique", "Build a coherent travel portfolio"],
  "brand": {
    "logoKey": "full-colour",
    "showRpsMark": false
  }
}
```

### `mentor-notes.json` (private)

```json
{
  "studentId": "constantin-nz-2026",
  "strengths": [],
  "weaknesses": [],
  "observations": [{ "date": "2026-07-21", "note": "", "tag": "prep" }],
  "sessionSummaries": [],
  "futureAssignments": [],
  "logistics": []
}
```

**Build rule:** student PDF pipeline reads `student.json` only. Mentor PDF reads both. INTERNAL markers in Markdown sources are stripped or never imported into student builds (align with MC-47).

---

## Part E — Existing content mapping

| Page / topic | Verdict | Source (Phase 1) | Notes |
|--------------|---------|------------------|-------|
| Colour / cream / charcoal / navy | **Settled tokens** (SPEC) | Live site / `page_html` — not Academy `brand.json` alone | Phase 1 “missing cream” superseded |
| BROWN type | **Reuse files** | `web Graphics\brown font\*.otf` | Embed licence = open question |
| Logos | **Reuse as-is** (pick 2–3) | ARP Branding + Academy emblem | Lock in design system |
| Brand guidelines PDF | **Rework** | `Alan Ranger Photography Branding.pdf` | Harvest rules; do not treat as print system |
| Mentoring flyer | **Rework** (copy only) | Monthly Online Mentoring Programme.pdf | Not a template |
| Blog mentoring articles | **Rework** (tone) | `Blog Posts and Guides\*Mentoring*` | Handbook welcome / philosophy |
| Academy badge ladder / complete spec | **Reuse as-is** (policy) | Drive Academy docs | Handbook Academy + certificates pages |
| Module certificates | **Rework** (pattern) | `module-1-certificate*.pdf` | Not mentoring milestone art yet |
| RPS questionnaire | **Reuse as-is** (intake) | RPS Course DOCX | Optional onboarding — not every workbook |
| Workshop client guidelines | **Rework →** `location-brief` | Drive Workshop and Class Guides | Pattern for NZ location sheets |
| **Field checklist family** | **Companion downloads — not workbook pages** | `Modules\Photography Academy\Clinics\*_Field_Checklist.pdf` | Strongest Practise/Photograph assets. Workbook links by topic (Architecture, Long Exposure, Landscape…). Phase 3 may optionally restyle companions later; Phase 2 does **not** absorb them into the page list |
| Image checklist | **Companion** / Review step | Masterclasses `image checklist.pdf` | Critique aid |
| Constantin learning path | **Reuse with rework** | Drive `constantin-learning-path.md` | Strip INTERNAL; map tables → assignments / exams / locations |
| Curriculum inventory | **Reuse as-is** | same folder CSV/MD | Academy roadmap rows |
| Hero / lavender images | **Reuse as-is** (select) | Guides + CDN | Covers / location openers |
| ChatGPT images | **Do not use** | Drive ChatGPT Image* | Quality bar |
| InDesign masters | **Missing → create in Phase 3 as HTML** | — | Tool already settled |

---

## Part F — Open questions for Alan

1. **BROWN PDF embed licence** — files are local (`web Graphics\brown font`, ShinnType). Confirm the licence allows embedding in **distributed student/parent PDFs**. If not, Alan chooses next step (we do not pick a substitute face without you).
2. **Field checklists** — confirm they stay **companion PDFs** (recommended) vs must be redesigned into the workbook page flow in Phase 3.
3. **Handbook page count** — OK to target ~24 pp (within 20–30), or must hit a specific length?
4. **Parent share of student workbook** — same PDF as student, or a redacted parent edition (hides some goals / critique)?
5. **RPS mark** — default off for Constantin NZ; any mentoring paths where it must appear?

---

## Acceptance check

| Criterion | Met |
|-----------|-----|
| Every page of all four documents listed with purpose | Yes — Parts B1–B4 |
| Every component named, defined, traceable to pages | Yes — Part C |
| Every page mapped to existing content or flagged new | Yes — Parts B + E |
| Second student via data alone | Yes — Part D `student.json` / `mentor-notes.json` |
| Readable in ~15 minutes | Aimed — structure tables, no design prose |

**Phase 3 (after Alan approval):** CSS tokens, HTML partials for components, Paged.js pipeline, first PDF proofs (navy print caveat), Constantin instance from JSON.

*End of Phase 2. Stop pending Alan approval before Phase 3.*
