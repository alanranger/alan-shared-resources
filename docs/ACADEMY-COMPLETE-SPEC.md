# Alan Ranger Photography Academy — Complete Specification

**Document purpose:** Standalone reference for Claude and humans who cannot access the codebase. Covers public funnel pages, Memberstack/Stripe membership, gating, automated emails, schema/SEO, analytics, and safe-edit rules.

**Version:** 1.1  
**Assembled:** 4 June 2026  
**Metrics snapshot:** 4 June 2026 (Supabase Academy + booking sheet)  
**Primary domains:** `www.alanranger.com` (Squarespace), `alanranger-modules.vercel.app` (Academy backend), `schema.alanranger.com` (product schema only — not Academy funnel pages)

**Supabase projects:**
- **Academy app data:** `dqrtcsvqsfgbqmnonkpt` (trials, emails, exams, Q&A)
- **AI GEO Audit / booking:** `igzvwbvgvmzvvzoclufx` (revenue, GSC, page policy)

---

## Table of contents

1. Executive summary and funnel flow  
2. Entry and landing pages (public)  
3. Membership, plans, and paywall  
4. Free course vs paid membership  
5. Automated email workflows (timing, triggers, full copy)  
6. Schema and SEO  
7. Tracking, revenue, and dashboard classification  
8. Backend architecture (Vercel, Supabase, Memberstack)  
9. Squarespace code injection map  
10. Constraints — do not break  
11. Safe to change for landing optimisation  
12. Investigation findings and open actions  
13. Six-month performance snapshot (admin engagement data)  
14. Appendix — default email bodies (verbatim)

---

## 1. Executive summary and funnel flow

The Academy is a **Memberstack v2 + Stripe** membership on Squarespace. The **public SEO entry** is `/free-online-photography-course`. The **checkout entry** is `/academy/login` (Memberstack signup modal with Stripe prices). After signup, members use **`/academy/dashboard`** and gated `/academy/*` app pages.

There is **no separate pricing page** — £0 trial and £79/year are shown on the canonical lead page and login page.

**14-day free trial** (Stripe price ID is legacy-named "30-day"). Post-expiry **SAVE20** (£59 first year) applies for 7 days (email Day +7 and dashboard modal). **REWIND20** win-back emails at Day +20, +30, +60 for non-converters.

```
VISITOR PATHS
=============

[SEO / nav] --> /free-online-photography-course (public, Course+FAQ schema)
                    |
                    +--> CTAs --> /academy/login OR inline data-ms-modal signup
[Home banner] --> /free-photography-course (public banner page)
                    |
                    +--> Banner button --> /academy/login

/academy/login --> Memberstack modal + Stripe
    |-- Trial: prc_30-day-free-trial-mg18p0u9z (14 days, plan pln_academy-trial-30-days--wb7v0hbh)
    |-- Annual: prc_annual-membership-jj7y0h89 (£79/yr)

Post-signup --> /academy/dashboard (member home)
    --> /academy/online-photography-course, exams, practice packs, Q&A, etc.

Logged-out hit on /academy/* (except login, upgrade, trial-expired) --> redirect /academy/login

EMAIL LIFECYCLE (vs trial_end_at)
=================================
Day -7  mid-trial (Vercel cron, 09:00 London)
Day -1  final day (Vercel cron)
Day +7  SAVE20 offer (Vercel cron)
Day +20 REWIND20 #1 (Zapier Friday 09:00 London)
Day +30 REWIND20 #2
Day +60 REWIND20 #3 (max 3 per member)
```

---

## 2. Entry and landing pages (public)

### 2.1 Public funnel URLs

| URL | Role | Paywall | Notes |
|-----|------|---------|-------|
| `/free-online-photography-course` | **Primary SEO lead magnet** | None | Canonical; nav "Academy" and Courses submenu point here. Tier E. ~660 clicks / 47.6K impr per 28d (GSC). |
| `/free-photography-course` | Home banner anchor page | None | **Not** 301'd to canonical (CANONICAL-DECISION May 2026). Banner edited in SQ editor; body from rewrite v4. |
| `/academy/login` | Signup / login hub | None | **Only** reliable Stripe checkout via `data-ms-modal`. Canonical snippet v4. |
| `/academy/upgrade` | Expired-trial reactivation | None (public when logged out) | SAVE20 / REWIND checkout via `#arp-upgrade-checkout-btn` |
| `/academy/trial-expired` | Legacy | — | **301 recommended** to `/academy/dashboard` (dashboard modal handles SAVE20) |
| `/online-photography-course` | Legacy | — | **301** to `/free-online-photography-course` |

### 2.2 Gated member app URLs (logged-out --> login)

Router **v4.3.3** redirects any `/academy/*` **except** `login`, `trial-expired`, `upgrade` when not logged in.

Examples:
- `/academy/dashboard`
- `/academy/online-photography-course`
- `/academy/photography-checklists`
- `/academy/photography-exams-certification`
- `/academy/photography-course-feedback`
- `/academy/photography-questions-answers`
- `/academy/photography-practice-packs`
- `/academy/modules`, `/academy/exams`, `/academy/ebook`

**Global guard v1** additionally checks trial vs annual on a named protected-path list (dashboard, practice-packs, Q&A, online-course, feedback, exams, checklists).

### 2.3 Squarespace commerce product pages (secondary)

Under `/photography-services-near-me/`:
- `premium-photography-academy-membership` (subscription SKU)
- `photography-foundation-course-ebook`, bundles

These use **Product** JSON-LD via Schema Tools + `schema.alanranger.com`. **Main trial funnel** uses Memberstack on `/academy/login`, not SQ cart.

### 2.4 Inbound links and CTAs

| Source | Target | CTA |
|--------|--------|-----|
| Site nav "Academy" | `/free-online-photography-course` | Academy |
| Courses submenu | `/free-online-photography-course` | Free Online Photography Course |
| Home banner `/free-photography-course` | `/academy/login` | Start free trial (was ENROL NOW) |
| Canonical page body | `/academy/login` + inline trial buttons | Start my free 14-day trial; Create account / login |
| Newsletter form (bottom of funnel pages) | Redirect to canonical after submit | Lower-commitment email capture |

### 2.5 Page rewrite sources (Squarespace Code Blocks)

| Page | Active rewrite file | Status |
|------|---------------------|--------|
| `/free-online-photography-course` | `02-free-online-photography-course.html` v3.2 | Active — Course+FAQPage, dual-tier card, Memberstack price IDs |
| `/free-photography-course` | `03-free-photography-course.html` v4 | Active — below native banner |
| `/academy/login` | `Academy/academy-login-squarespace-snippet-v1.html` v4 | **Canonical** — not `04-academy-login.html` |
| `/academy/trial-expired` | `01-trial-expired.html` | **DEPRECATED** — use 301 to dashboard |

When pasting v3.2 on canonical page: **keep** sample-lessons 6-link grid and bottom newsletter form; delete 11 duplicate marketing blocks per file header checklist.

---

## 3. Membership, plans, and paywall

### 3.1 Stack

| Layer | Technology |
|-------|------------|
| Membership | **Memberstack v2** — site-wide header injection, app `app_cmjlwl7re00440stg3ri2dud8` |
| Payments | **Stripe** via Memberstack `data-ms-price:add` |
| Post-trial checkout API | Vercel `alanranger-modules.vercel.app` — `api/stripe/create-upgrade-checkout.js` |
| Exams / Q&A / config | Same Vercel app + Supabase Academy project |
| Auth callback | `memberstack-client.alanranger.com/auth/callback` |

### 3.2 Plans and prices

| Offer | Stripe price ID | Plan ID | Price |
|-------|-----------------|---------|-------|
| 14-day trial | `prc_30-day-free-trial-mg18p0u9z` | `pln_academy-trial-30-days--wb7v0hbh` | £0 at signup (no card on trial per copy) |
| Annual membership | `prc_annual-membership-jj7y0h89` | (annual plan via Memberstack) | **£79/year** |
| SAVE20 (post-trial) | Auto at checkout in Day +7 to +13 window | Promo **SAVE20** | **£59** first year (£20 off) |
| REWIND20 (lapsed) | `rewind20-lapsed-trial-winback` coupon | Promo **REWIND20** | **£59** for 7 days from each send |

**Pricing display rule (May 2026):** Pre-trial pages show **£79 only**. SAVE20/REWIND20 only on post-trial surfaces (emails, dashboard modal, `/academy/upgrade`).

### 3.3 Gating implementation

1. **Footer router v4.3.3** (`academy-stable-routing-ui-suppression-v4.3.3.html`) — logged-out on app paths --> `/academy/login`; logged-in on login --> `/academy/dashboard`; hides nav/footer on app pages.
2. **Global guard v1** (`academy-global-guard-squarespace-injection-v1.html`) — trial plan access on protected paths. **Do not run duplicate old routers.**

### 3.4 Checkout mechanics (Memberstack DOM attributes)

| Attribute | Effect |
|-----------|--------|
| `data-ms-modal="login"` | Login modal |
| `data-ms-modal="signup"` + `data-ms-price:add="<price_id>"` | Signup + Stripe checkout in modal |
| `id="arp-upgrade-checkout-btn"` | Expired-trial reactivation (upgrade page, dashboard) |

**Plain href to `/academy/login` does NOT run checkout** for expired trials — must use modal or upgrade button.

### 3.5 Required button IDs (site JS)

- Container: `arp-academy-login` on `/academy/login`
- Buttons: `arpLoginBtn`, `arpTrialBtn`, `arpAnnualBtn`
- Upgrade: `arp-upgrade-checkout-btn`

### 3.6 Post-signup flow

1. Memberstack + Stripe modal completes.  
2. Router sends logged-in users from `/academy/login` to **`/academy/dashboard`**.  
3. Dashboard snippet calls `/api/academy/trial-status`; opens upgrade modal with SAVE20 when in grace window.  
4. Email links use signed URLs to dashboard (`{{upgradeUrl}}` / `{{dashboardUrl}}`) — **not** raw Stripe checkout (deprecated path lacks Memberstack metadata).

---

## 4. Free course vs paid membership

| Question | Answer |
|----------|--------|
| What is `/free-online-photography-course`? | Public **marketing** page for the Academy product — not the course app itself. |
| Is it a free tier of content on that URL? | **No** — content is under `/academy/*` after login. |
| What gates the landing page? | **Nothing** — fully public. Optional newsletter at bottom. |
| How do visitors convert? | CTA --> login or inline `data-ms-modal` trial signup --> dashboard. |
| Trial vs paid | Trial = full module/exam access for 14 days; some downloads gated until paid per copy. |

---

## 5. Automated email workflows

### 5.1 Infrastructure

| Item | Detail |
|------|--------|
| Sender app | `https://alanranger-modules.vercel.app` |
| Transport | Nodemailer, Gmail SMTP (`ORPHANED_EMAIL_FROM`) |
| BCC | `info@alanranger.com` on lifecycle sends |
| Default copy | `lib/emailTemplateDefaults.js` |
| Overrides | Supabase `academy_email_templates` (admin Emails tab) |
| Log | `academy_email_events` — `member_id`, `stage_key`, `sent_at`, `subject`, `status` |
| Trial dates | `academy_trial_history` (+ `reengagement_*` for REWIND) |

**History:** Trial emails Day -7, -1, +7 moved from **Zapier to Vercel Cron** ~Apr 2026. Pre-Apr-21 rows in `academy_email_events` may be sparse; Zapier was still sending before cutover.

### 5.2 Lifecycle schedule (14-day trial, anchor = `trial_end_at`)

| Stage key | Timing | Scheduler | Webhook | Coupon |
|-----------|--------|-----------|---------|--------|
| `day-minus-7` | 7 days **before** expiry | Vercel Cron 08:00+09:00 UTC; **send only London hour 9** | `trial-expiry-reminder-webhook?daysAhead=7` | None |
| `day-minus-1` | 1 day before | Same | `?daysAhead=1` | None |
| `day-plus-7` | 7 days **after** expiry | Same | `?daysAhead=-7` | **SAVE20** -> £59, 7-day window |
| `day-plus-20` | ~20 days after | Zapier **Friday 09:00 Europe/London** | `lapsed-trial-reengagement-webhook` | **REWIND20** |
| `day-plus-30` | ~30 days after; >=10d since attempt 1 | Same Zap | Same | REWIND20 |
| `day-plus-60` | ~60 days after; >=30d since attempt 2 | Same | Same | REWIND20 final (max 3 total) |

**REWIND rules:** 180-day lookback; not converted; max 3 emails; unsubscribe `{{unsubUrl}}` on every REWIND mail.

### 5.3 Subjects (defaults)

| Stage | Subject line |
|-------|----------------|
| Day -7 | You're Halfway Through Your Free Trial — 7 Days Left |
| Day -1 | Your Academy trial ends tomorrow — keep everything you've built |
| Day +7 | Your Academy trial ended — {{couponCode}} is yours for {{daysLeft}} more {{daysWord}} |
| Day +20 | Your Academy trial — £{{save20DiscountGbp}} off to come back and pick up where you left off |
| Day +30 | Still thinking it over? £{{save20DiscountGbp}} off your Academy annual membership (7 days) |
| Day +60 | Final offer — £{{save20DiscountGbp}} off your Academy annual membership (7 days only) |

### 5.4 Content summary by stage

**Day -7:** Mid-trial check-in; optional activity block; 5-step plan (modules 1-4, exams, packs 7-10, checklist, Q&A); member outcomes; £79/year; signed upgrade link; expiry date.

**Day -1:** Ends tomorrow; activity block; 3 quick wins; long members-only + full feature lists; £79; no discount.

**Day +7:** Trial ended; SAVE20 £59 for 7 days; quick wins; feature lists; one-click link with coupon pre-applied in dashboard modal.

**Day +20/30/60 (REWIND):** Shared body — days lapsed; Academy grew; REWIND20 £59 for 7 days; activity; quick wins; features; social proof; signed dashboard URL; unsubscribe footer.

### 5.5 Other automated emails

| Email | Trigger | Schedule | Subject |
|-------|---------|----------|---------|
| Orphaned signup | Memberstack account, no plan | Zapier ~every 2h | Complete Your Academy Signup - Action Required |
| Welcome / new membership | New member | Zapier "Academy New Membership" | **Not in repo** — copy in Zapier only |
| Account cleanup | No plan 8h+ | Vercel `cleanup-cron` 23:00 UTC | (deletes account — not marketing) |

**Orphan body summary:** Incomplete checkout; visit signup page; account removed after 8 hours if not completed.

### 5.6 Vercel crons (`vercel.json`)

| Path | Schedule |
|------|----------|
| `/api/admin/refresh` | `30 * * * *` (Memberstack --> Supabase cache) |
| `/api/admin/cleanup-cron` | `0 23 * * *` |
| Trial webhook daysAhead=7,1,-7 | `0 8 * * *` and `0 9 * * *` each |

### 5.7 Merge tags (email templates)

`firstName`, `fullName`, `expiryDate`, `upgradeUrl`, `dashboardUrl`, `unsubUrl`, `activityBlock`, `daysUntilExpiry`, `daysLeft`, `daysWord`, `daysLeftPhrase`, `daysLapsed`, `annualPriceGbp` (79), `save20PriceGbp` (59), `save20DiscountGbp` (20), `couponCode` (SAVE20 or REWIND20)

**Full default bodies:** See **Appendix** (Section 13).

---

## 6. Schema and SEO

| Page / area | Schema source | @types |
|-------------|---------------|--------|
| `/free-online-photography-course` | Inline Squarespace code block (rewrite v3.2) | **Course**, **FAQPage** |
| `/free-photography-course` | Body blocks + banner (editor) | Marketing; rewrite v4 |
| `/academy/login` | Page snippet | Not product pipeline |
| `/academy/*` app | Usually none from Schema Tools | App UI |
| SQ product membership/ebook URLs | `schema.alanranger.com` fetch | **Product** + Offer |

**Academy funnel pages do NOT use** the product/event `schema.alanranger.com` injection pipeline.

**AIO gap (May 2026 investigation):** Alan ranks #1-3 for "online/free photography course" but **0 AIO citations** on Academy landings — recommend pillar blog + FAQPage/HowTo on answer content, not just product pages.

---

## 7. Tracking, revenue, and dashboard classification

### 7.1 Booking sheet (revenue truth)

- Category: **`12. Academy`**
- Landing attribution: `booking_sheet_transactions.landing_page_url`
- Example: `/free-online-photography-course` — **60 transactions, £2,318** total (all-time sample; period filters vary)
- Rolled in `booking_sheet_monthly_wide` and Revenue Funnel Academy panel (`revenue-funnel-academy-economics.js`)

### 7.2 AI GEO Audit (`ai-geo-audit` repo)

| Mechanism | Academy treatment |
|-----------|-----------------|
| `classifyPageSegment` | `/free-online-photography-course` -> **education** (not money) |
| `/academy/*` | Often **money** via commercial-tier tokens |
| Tier E CSV | `free-online-photography-course`, `academy/login`, `academy/upgrade` |
| Portfolio GSC segment `academy` | **Only** canonical lead page |
| `page_indexability_policy` | No Academy-specific rows (May 2026) |
| GSC sync fix | `STRATEGIC_PAGES` allowlist in `backfill-money-page-timeseries.js` — Academy URLs were dropped from audit money-page filter before fix |

### 7.3 Memberstack trial metrics (dashboard)

Separate from booking sheet: trial starts, trial-to-paid %, blended AOV ~£73 (investigation doc figures).

---

## 8. Backend architecture

### 8.1 Vercel app (`alanranger-modules.vercel.app`)

Repo folder: `Academy/alanranger-academy-assesment/`

| Endpoint area | Purpose |
|---------------|---------|
| `api/admin/trial-expiry-reminder-webhook.js` | Day -7, -1, +7 emails |
| `api/admin/lapsed-trial-reengagement-webhook.js` | REWIND Day +20/30/60 |
| `api/admin/orphaned-members-webhook.js` | Incomplete signup emails |
| `api/admin/refresh.js` | Memberstack sync to `ms_members_cache` |
| `api/admin/cleanup-cron.js` | Remove orphaned accounts |
| `api/academy/trial-status.js` | Dashboard SAVE20 window |
| `api/academy/reengage-redirect.js` | Signed email links |
| `api/stripe/create-upgrade-checkout.js` | SAVE20/REWIND checkout sessions |
| `api/stripe/webhook.js` | Updates `academy_trial_history` on conversion |
| `pages/academy/admin/emails.js` | Admin template editor |

### 8.2 Supabase tables (Academy project)

| Table | Role |
|-------|------|
| `academy_email_events` | Send log per stage |
| `academy_email_templates` | Editable subject/body_md |
| `academy_email_schedules` | Future dispatcher metadata |
| `academy_trial_history` | Trial dates, conversion, REWIND tracking |
| `ms_members_cache` | Member email, plan snapshot |
| `academy_events`, `module_results_ms` | Activity blocks in emails |
| `academy_config` | Trial duration (14 days) |

### 8.3 Secrets (do not publish in public docs)

`MEMBERSTACK_SECRET_KEY`, `CRON_SECRET`, `ORPHANED_WEBHOOK_SECRET`, `REENGAGE_LINK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, Stripe keys, Gmail SMTP — stored in Vercel env only.

---

## 9. Squarespace code injection map

| Location | File / label | Role |
|----------|--------------|------|
| Header | Memberstack v2 single install | `app_cmjlwl7re00440stg3ri2dud8` — **never remove** |
| Footer | Academy router v4.3.3 | Login redirect, UI suppression |
| Footer | Global guard v1 | Trial path protection — **no duplicate routers** |
| Page body | Login snippet v4 | `/academy/login` |
| Page body | Dashboard snippet | `/academy/dashboard` |
| Page body | Funnel rewrites 02, 03 | Canonical + banner pages |
| URL mapping | `/academy/trial-expired` -> `/academy/dashboard` 301 | Recommended |
| URL mapping | `/online-photography-course` -> canonical 301 | Active |

---

## 10. Constraints — do not break

| Item | Why |
|------|-----|
| Memberstack header script + app ID | All auth breaks |
| Router v4.3.3 (replace v4.3.2 if still present) | Wrong redirects / loops |
| Duplicate global guard + router | Double redirects |
| `arpLoginBtn`, `arpTrialBtn`, `arpAnnualBtn` | Login JS |
| Stripe price IDs (trial + annual) | Wrong plan/charge |
| `data-ms-modal` / `data-ms-price:add` on CTAs | Checkout won't open |
| `#arp-upgrade-checkout-btn` | Expired-trial revenue |
| REWIND webhook gates (3 max, day gaps) | Over-emailing / compliance |
| Orphan 8h cleanup pairing | Account hygiene |
| `/api/academy/trial-status` + dashboard modal | SAVE20 auto-apply |

---

## 11. Safe to change for landing optimisation

- Squarespace **body code blocks** from `academy-funnel-rewrites/` (02, 03)
- Banner editor copy on `/free-photography-course` (heading, body, button label/URL)
- Hero, FAQ, **inline Course + FAQPage JSON-LD** on canonical page
- SEO title/meta in Squarespace
- Email copy via **admin Emails tab** (writes `academy_email_templates`)
- Blog/pillar content for AIO (separate URLs)

**Do not** remove newsletter form at bottom of canonical without redirect strategy — it captures warm leads and redirects to canonical.

---

## 12. Investigation findings and open actions (May 2026)

| Issue | Status |
|-------|--------|
| GSC sync dropped Academy URLs | Fix in `backfill-money-page-timeseries.js` STRATEGIC_PAGES — run backfill |
| AIO zero citations on Academy queries | Content plan: pillar + satellites — not code |
| Landing friction (FUD before CTA, duplicate forms) | Rewrites drafted v3.2 / v4 |
| `/academy/trial-expired` dead-end | 301 to dashboard + modal |
| Trial demand/conversion collapse | Measure after GSC fix + page deploys |

**False lead corrected:** Sparse `academy_email_events` before Apr 2026 was Zapier->in-house cutover, not "emails weren't sending."

---

## 13. Six-month performance snapshot (admin engagement data)

This section mirrors what the **[Academy admin Engagement tab](https://alanranger-modules.vercel.app/academy/admin/engagement)** shows: trial signups, paid conversions, member usage (logins, sessions, module opens, exams), and booking-sheet revenue attributed to the canonical landing page.

**Data sources (queried 4 June 2026):**

| Source | Supabase project | Tables |
|--------|------------------|--------|
| Trials & conversions | Academy `dqrtcsvqsfgbqmnonkpt` | `academy_trial_history` |
| Member usage | Academy | `academy_events` (login, module_open), `module_results_ms` |
| Member plans (current) | Academy | `ms_members_cache` |
| Lifecycle emails sent | Academy | `academy_email_events` |
| Landing-page revenue | AI GEO Audit `igzvwbvgvmzvvzoclufx` | `booking_sheet_transactions` |
| Public page traffic (GSC) | AI GEO Audit | `gsc_page_timeseries` — **empty for Academy URLs until backfill** (see Section 12) |

**Note on the six-month window:** `academy_trial_history` **starts 5 January 2026** (first trial). There are **no trial rows in December 2025**. The table below is **January–June 2026** (June is partial through 4 Jun). Booking-sheet rows exist for Dec 2025 on the canonical landing URL.

**How to refresh:** Re-run SQL in Academy Supabase or open Engagement tab periods (7d / 30d / 90d / All). API: `GET https://alanranger-modules.vercel.app/api/admin/engagement?period=90d` (admin-authenticated in practice).

---

### 13.1 Master monthly table (Jan–Jun 2026)

| Month | Trial signups | Paid conversions (by `converted_at` month) | Cohort conversion % (converted / trials started that month) | Member logins | Module opens | Active members (any login/open) | Approx. sessions (30m gap) | Exam attempts | Booking txns (canonical landing) | Booking £ (canonical landing) |
|-------|---------------|---------------------------------------------|---------------------------------------------------------------|---------------|--------------|----------------------------------|-----------------------------|---------------|----------------------------------|-------------------------------|
| 2026-01 | 68 | 1 | 5.9% (4/68) | 598 | 275 | 53 | 118 | 135 | 8 | £553 |
| 2026-02 | 55 | 1 | 3.6% (2/55) | 755 | 277 | 70 | 215 | 160 | 2 | £158 |
| 2026-03 | 42 | 4 | 2.4% (1/42) | 854 | 344 | 55 | 206 | 54 | 4 | £316 |
| 2026-04 | 28 | 1 | 3.6% (1/28) | 1,042 | 357 | 43 | 209 | 19 | 1 | £59 |
| 2026-05 | 15 | 2 | 6.7% (1/15) | 341 | 56 | 29 | 84 | 10 | 3 | £217 |
| 2026-06 (partial) | 1 | 0 | 0% | 43 | 0 | 6 | 10 | 3 | — | — |
| **6-month total** | **209** | **9** | **4.3% overall** | **3,633** | **1,309** | — | **842** | **381** | **18** | **£1,303** |

**How to read two conversion columns:**

- **Paid conversions (by month)** — count of members whose `converted_at` falls in that calendar month (can include trials that started in an earlier month; e.g. March 2026 shows 4 paid conversions while only 1 of March’s 42 trials had converted by snapshot time).
- **Cohort conversion %** — of members who **started** a trial that month, how many have **ever** converted (`converted_at` not null), as of 4 Jun 2026.

---

### 13.2 Trend interpretation (for Claude / optimisation work)

| Signal | Observation |
|--------|-------------|
| **Trial demand** | Signups fell **68 → 15** Jan→May (−78%); June MTD 1. Aligns with Revenue Funnel “trial collapse” investigation. |
| **Conversion rate** | Blended **~4.3%** trial→paid over Jan–Jun cohorts (9 paid / 209 trials). Healthy SaaS benchmarks are often 10–25%. |
| **Member usage** | Logins peaked **Apr 2026 (1,042)** then dropped sharply in May (341) as fewer new trials entered; module opens followed same shape. |
| **Exams** | Attempts **135 (Jan) → 10 (May)** — engagement concentrated in early trial months. |
| **Email automation** | In-house sends logged from **Apr 2026** (`day-minus-7`, `day-minus-1`, `day-plus-7`); large **REWIND** batch Apr 2026 (`day-plus-20`: 134 sent). Pre-Apr trial emails were Zapier (not fully in `academy_email_events`). |
| **Booking sheet (landing attribution)** | **18 txns / £1,303** Dec 2025–May 2026 with `landing_page_url` containing `/free-online-photography-course` (category typically `12. Academy`). Not the same as Stripe trial count — includes historical product bundles. |

---

### 13.3 Current membership snapshot (`ms_members_cache`, 4 Jun 2026)

| Metric | Count |
|--------|------:|
| Total members in cache | 208 |
| On trial plan now | 191 |
| On paid annual now | 16 |

---

### 13.4 Public funnel traffic (visitors — not in Engagement DB)

The Engagement tab does **not** store Squarespace/GSC page views. Use **Google Search Console** (or AI GEO Audit after `STRATEGIC_PAGES` backfill).

**Reference snapshot (GSC, last 28 days, May 2026 investigation — not in `gsc_page_timeseries` at time of fix):**

| Page | Clicks (28d) | Impressions (28d) | CTR | Avg position |
|------|-------------:|--------------------:|----:|-------------:|
| `/free-online-photography-course` | 660 | 47,600 | 1.4% | 14.3 |
| `/academy/login` | 6 | 222 | 2.7% | 6.7 |

**Implied funnel (order of magnitude):** ~660 organic clicks/month to canonical page vs **~15–68 trial signups/month** → rough **2–10% click-to-trial** (varies by month; not measured precisely in DB).

---

### 13.5 Engagement dashboard — metric definitions

| UI metric | Definition | Source |
|-----------|------------|--------|
| Trial signups (sparkline) | New rows in `academy_trial_history` by `trial_start_at` week | `weekly_series.trial_signups` |
| Conversions (sparkline) | `converted_at` by week | `weekly_series.conversions` |
| Logins | `academy_events.event_type = 'login'` | Events table |
| Sessions | Logins separated by **>30 minutes** gap per member | Same (engagement API logic) |
| Module opens | `event_type = 'module_open'` | Events table |
| Active members | Distinct `member_id` with login or open in period | Events table |
| Exam attempts | Rows in `module_results_ms` | Exams aggregate |
| Top paths / categories | Most opened module paths | Events table |

**Admin URL:** https://alanranger-modules.vercel.app/academy/admin/engagement  
**Related tabs:** Members, Activity, Exams, Ghost, Q&A, Emails (same host).

---

### 13.6 SQL to reproduce (Academy Supabase)

```sql
-- Monthly trials + cohort conversions
SELECT to_char(trial_start_at, 'YYYY-MM') AS month,
       COUNT(DISTINCT member_id) AS trial_signups,
       COUNT(DISTINCT member_id) FILTER (WHERE converted_at IS NOT NULL) AS cohort_converted
FROM academy_trial_history
WHERE trial_start_at >= '2026-01-01' AND trial_start_at < '2026-07-01'
GROUP BY 1 ORDER BY 1;

-- Paid conversions by conversion month
SELECT to_char(converted_at, 'YYYY-MM') AS month,
       COUNT(DISTINCT member_id) AS paid_conversions
FROM academy_trial_history
WHERE converted_at >= '2026-01-01' AND converted_at < '2026-07-01'
GROUP BY 1 ORDER BY 1;

-- Usage
SELECT to_char(created_at, 'YYYY-MM') AS month,
       COUNT(*) FILTER (WHERE event_type = 'login') AS logins,
       COUNT(*) FILTER (WHERE event_type = 'module_open') AS module_opens,
       COUNT(DISTINCT member_id) AS active_members
FROM academy_events
WHERE created_at >= '2026-01-01' AND created_at < '2026-07-01'
GROUP BY 1 ORDER BY 1;
```

---

## 14. Appendix — default email bodies (verbatim)

Source: `lib/emailTemplateDefaults.js` (used when no DB override in `academy_email_templates`).

### 14.1 Day -7 — Mid-trial reminder

**Subject:** You're Halfway Through Your Free Trial — 7 Days Left

**Body:**

Hi {{firstName}},

You're halfway through your 14-day free trial of the **Alan Ranger Photography Academy** — **7 days to go**. This is the point where most members go from browsing to actually applying something, so the next week is where the Academy really starts to pay back the time you've put in.
{{activityBlock}}
**A suggested plan for your next 7 days**

1. **Read the four foundation modules** — Exposure Triangle, Aperture, Shutter Speed, and ISO. Together they unlock nearly every decision you'll make with your camera.
2. **Take the four matching exams** — they're quick, and they turn "I've read it" into "I know it", with a pass certificate for each.
3. **Try practice packs 7, 8, 9 and 10** — small structured shooting assignments that move the foundation skills from theory into your camera bag.
4. **Pick one field checklist** and take it on your next shoot — the value usually lands on the first real outing you use one.
5. **Ask one question** — drop something in Q&A or throw it at Robo-Ranger. Members who engage here tend to progress fastest.

**What Academy members have gone on to do**

Members who've stayed have gone on to **win photography competitions**, pick up **paid photography work** as side hustles or small businesses, earn **professional qualifications** like RPS Licentiate, and — most commonly of all — simply enjoy their cameras far more, coming home with photos they're genuinely proud of rather than feeling lost in settings and menus.

**Want to lock in annual access now?**

Full annual membership is **£{{annualPriceGbp}}/year** — that's less than a single coffee a week — and everything you've already built (progress, bookmarks, notes, quiz scores) stays on your account.

Click the personal link below and we'll take you straight to your Academy dashboard. If your session has expired, your email address will be pre-filled on the login screen, so all you need is your password:

{{upgradeUrl}}

Your trial expires on **{{expiryDate}}**. Whenever you're ready — and any questions, just reply to this email.

Best regards,
Alan Ranger
Alan Ranger Photography Academy
https://www.alanranger.com/online-photography-course

---

### 14.2 Day -1 — Final-day reminder

**Subject:** Your Academy trial ends tomorrow — keep everything you've built

**Body:**

Hi {{firstName}},

Your 14-day free trial of the **Alan Ranger Photography Academy** ends **tomorrow ({{expiryDate}})**. After that, the modules, practice packs, exams and Robo-Ranger access pause — but your account stays put, with everything you've built still on it.
{{activityBlock}}
**Three quick wins before it ends**

1. **Take one exam** — 10 minutes each, and you walk away with a pass certificate whether you upgrade or not.
2. **Download one field checklist** — the one-page PDFs are yours to keep and will come on every shoot with you.
3. **Ask Robo-Ranger one question** — on gear, technique or next steps. Members tell us this is the moment it clicks how much time it saves them.

**Members-only resources you keep for the full year**

- **30 Assignment Practice Packs** — step-by-step field exercises built around Alan's frameworks
- **35 One-page Field Checklists** — print-ready PDFs for every shoot scenario
- **741-page Searchable eBook** — every module in one printable PDF, yours for life
- **Caring for Your Assets guides** — backup routines, sensor cleaning, camera maintenance
- **Applied Learning Library** — 22+ scenario-based guides (portraits, product, property, landscape, close-up & food) — expanding monthly
- **Royal Photographic Society Accreditation pathway** — 10-module route towards a formal qualification
- **All new modules, new exams and new features** released each month — included for the life of your membership, at no extra cost

**And everything else in the Academy continues too:**

- **60 training modules** — in-depth articles with practical examples, graphics and example images across settings, composition, gear, genres and post-processing
- **35 one-page field checklists** — print-ready PDFs for every shoot scenario
- **30 practice packs** — self-paced assignments built around Alan's frameworks and guidance
- **15 exams with downloadable certificates** — individual pass certificates with score details, plus a master certificate once you complete them all
- **741-page searchable eBook** — every module in a printable PDF, yours for life
- **Applied Learning Library** — 22+ scenario-based guides across portraits, product, landscape, close-up and more (expanding monthly)
- **Pro photographer toolkit** — exposure calculator, print size calculator, style quiz, Hue test
- **Robo-Ranger AI assistant** — on-demand answers on technique, gear and Academy content
- **Direct messaging & Q&A with Alan** — message Alan with questions and join the live Q&A sessions

**Lock it in before tomorrow**

Full annual membership is **£{{annualPriceGbp}}/year** — less than a single coffee a week — and everything you've already built (progress, bookmarks, notes, quiz scores) stays on your account.

Click the personal link below and we'll take you straight to your Academy dashboard. If your session has expired, your email address will be pre-filled on the login screen, so all you need is your password.

{{upgradeUrl}}

Your trial expires on **{{expiryDate}}**. Whenever you're ready — and any questions, just reply to this email.

Best regards,
Alan Ranger
Alan Ranger Photography Academy
https://www.alanranger.com/online-photography-course

---

### 14.3 Day +7 — SAVE20 recovery

**Subject:** Your Academy trial ended — {{couponCode}} is yours for {{daysLeft}} more {{daysWord}}

**Body:**

Hi {{firstName}},

Your 14-day free trial of the **Alan Ranger Photography Academy** ended on **{{expiryDate}}**, so full access has now paused — but your account is still here with everything you'd built on it.
{{activityBlock}}
**Here's an offer to pick up where you left off**

Upgrade to full annual membership for **£{{annualPriceGbp}}/year**, and for the next {{daysLeftPhrase}} the code **{{couponCode}}** takes **£{{save20DiscountGbp}} off your first year** — bringing it down to just **£{{save20PriceGbp}}**. That's less than a single coffee a week for the whole year.

**Three quick wins the moment you're back in**

1. **Jump back into the module you last opened** — pick up where you left off, no hunting required.
2. **Download one field checklist** — the one-page PDFs are yours to take on your next shoot.
3. **Take the first 10-minute exam** — short, focused, with a pass certificate to show for it.

**Members-only resources you keep for the full year**

- **30 Assignment Practice Packs** — step-by-step field exercises built around Alan's frameworks
- **35 One-page Field Checklists** — print-ready PDFs for every shoot scenario
- **741-page Searchable eBook** — every module in one printable PDF, yours for life
- **Caring for Your Assets guides** — backup routines, sensor cleaning, camera maintenance
- **Applied Learning Library** — 22+ scenario-based guides (portraits, product, property, landscape, close-up & food) — expanding monthly
- **Royal Photographic Society Accreditation pathway** — 10-module route towards a formal qualification
- **All new modules, new exams and new features** released each month — included for the life of your membership, at no extra cost

**And everything else in the Academy unlocks again:**

- **60 training modules** — in-depth articles with practical examples, graphics and example images across settings, composition, gear, genres and post-processing
- **35 one-page field checklists** — print-ready PDFs for every shoot scenario
- **30 practice packs** — self-paced assignments built around Alan's frameworks and guidance
- **15 exams with downloadable certificates** — individual pass certificates with score details, plus a master certificate once you complete them all
- **741-page searchable eBook** — every module in a printable PDF, yours for life
- **Applied Learning Library** — 22+ scenario-based guides across portraits, product, landscape, close-up and more (expanding monthly)
- **Pro photographer toolkit** — exposure calculator, print size calculator, style quiz, Hue test
- **Robo-Ranger AI assistant** — on-demand answers on technique, gear and Academy content
- **Direct messaging & Q&A with Alan** — message Alan with questions and join the live Q&A sessions

**Upgrade in one click**

Click the personal link below and we'll take you straight to your Academy dashboard, with **{{couponCode}} already applied** in the upgrade modal. No codes to type in, no separate checkout page. If your session has expired, your email address will be pre-filled on the login screen, so all you need is your password.

{{upgradeUrl}}

{{couponCode}} only runs for {{daysLeftPhrase}} from today — after that the discount closes and annual membership returns to full price at £{{annualPriceGbp}}.

Any questions, just reply to this email.

Best regards,
Alan Ranger
Alan Ranger Photography Academy
https://www.alanranger.com/online-photography-course

---

### 14.4 Day +20 / +30 / +60 — REWIND20 (shared body)

**Subjects:** See Section 5.3.

**Body:**

Hi {{firstName}},

It's been around {{daysLapsed}} days since your **Alan Ranger Photography Academy** trial ended — and you didn't end up joining. That's completely fine; people pick up free trials all the time and life gets in the way.
{{activityBlock}}
But I wanted to reach out with one honest reason to give the Academy another look: **it has grown a lot since your trial**, and for the next **7 days only** I'd like to offer you **£{{save20DiscountGbp}} off your first year** of annual membership with the code **{{couponCode}}** — £{{annualPriceGbp}} down to **£{{save20PriceGbp}}** for a full 12 months.

**Three quick wins the moment you're back in**

1. **Jump back into the module you last opened** — we'll take you right back to where you stopped.
2. **Download one field checklist** — the one-page PDFs are yours to keep and take on every shoot.
3. **Take one 10-minute exam** — short, focused, with a pass certificate you keep whether you upgrade or not.

**Members-only resources you keep for the full year**

- **30 Assignment Practice Packs** — step-by-step field exercises built around Alan's frameworks
- **35 One-page Field Checklists** — print-ready PDFs for every shoot scenario
- **741-page Searchable eBook** — every module in one printable PDF, yours for life
- **Caring for Your Assets guides** — backup routines, sensor cleaning, camera maintenance
- **Applied Learning Library** — 22+ scenario-based guides (portraits, product, property, landscape, close-up & food) — expanding monthly
- **Royal Photographic Society Accreditation pathway** — 10-module route towards a formal qualification
- **All new modules, new exams and new features** released each month — included for the life of your membership, at no extra cost

**And everything else in the Academy unlocks again:**

- **60 training modules** — in-depth articles with practical examples, graphics and example images across settings, composition, gear, genres and post-processing
- **35 one-page field checklists** — print-ready PDFs for every shoot scenario
- **30 practice packs** — self-paced assignments built around Alan's frameworks and guidance
- **15 exams with downloadable certificates** — individual pass certificates plus a master certificate when you complete them all
- **741-page searchable eBook** — every module in a printable PDF, yours for life
- **Applied Learning Library** — 22+ scenario-based guides across portraits, product, landscape, close-up and more (expanding monthly)
- **Pro photographer toolkit** — Exposure Calculator, Print Size Calculator, Photography Style Quiz, Colour IQ / Hue Test
- **Robo-Ranger AI assistant** — on-demand answers on technique, gear and Academy content
- **Direct messaging & Q&A with Alan** — message Alan with questions and join the live Q&A sessions
- **New modules and exams planned through 2026** — the syllabus is actively growing, not frozen
- **RPS Accreditation pathway (coming soon)** — routes to Licentiate and Associate with resources to support your panel

**What Academy members have gone on to do**

I don't want to oversell this, but I think it's worth saying plainly: Academy members have gone on to **win photography competitions**, launch **paid photography work** as side hustles or small businesses, earn **professional qualifications and accreditations**, and — most commonly of all — simply enjoy their cameras far more, coming home with photos they're genuinely proud of rather than feeling lost in settings and menus.

Twelve months is usually long enough for a committed learner to make a real leap forward in their photography — and at £{{save20PriceGbp}} for the entire year, that's a little over £1 a week for everything listed above.

**Ready to come back?**

Click the personal link below — we'll take you straight to your Academy dashboard with the upgrade offer already open and **{{couponCode}} applied**, no codes to type. If you're not still signed in, your email address will be pre-filled on the login screen, so all you need is your password:

{{dashboardUrl}}

**This personal offer is open for 7 days from today.** After that, {{couponCode}} closes for your account and annual membership returns to the standard £{{annualPriceGbp}}/year.

Any questions — technical, creative, or "is this right for me at all?" — just reply to this email.

Best regards,
Alan Ranger
Alan Ranger Photography Academy
https://www.alanranger.com/online-photography-course

---
If you'd prefer not to receive any more re-engagement emails from the Academy, you can unsubscribe in one click:
{{unsubUrl}}

---

### 14.5 Orphaned signup email

**Subject:** Complete Your Academy Signup - Action Required

**Body:**

Hi [member name],

We noticed you started creating an account with Alan Ranger Photography Academy but didn't complete the checkout process.

Your Memberstack account was created, but no subscription plan was attached. To access the Academy content, you'll need to complete the signup process.

**What you need to do:**
1. Visit the Academy signup page
2. Complete the checkout process to select a trial or annual plan
3. Once complete, you'll have full access to all Academy content

**Important:** If you don't complete your signup within 8 hours of account creation, your account will be automatically removed.

If you have any questions or need help, please contact us.

Best regards,
Alan Ranger Photography Academy

---
This is an automated message. Your account was created [N] hours ago.

---

### 14.6 Welcome email (Zapier only)

**Zap name:** Academy New Membership - Account

**Copy location:** Zapier workflow (not in repository). Treat as active but edit only in Zapier UI.

---

**End of document.**
