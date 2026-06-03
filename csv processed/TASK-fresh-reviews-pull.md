# Task: Fresh Google + Trustpilot review pull (SEPARATE from booking-match work)

**Status:** NOT STARTED — held until booking-match CSV fixes are reviewed.

**Do not** run full `ingest-product-reviews` / Supabase replace until this pull has been reviewed and merged.

## Scope

Re-export and merge new reviews into:

- `03 – combined_product_reviews.csv` (master)
- `03a_trustpilot_matched.csv` / `03b_google_matched.csv` (sources, if still used)

**Goal:** Real new quotes for tiles that booking-match cannot fill:

- Dartmoor
- Exmoor / Lynmouth
- Ireland / Dingle
- (Optional) stronger Pistyll/Vyrnwy-specific text beyond Lonnie Morris re-attribution

## Out of scope for this task

- Re-attributing weak/generic reviews to gap tiles
- Bulk Supabase re-ingest
- Changes to `09-booking-review-gap-matches.csv` logic

## Approved now (booking-match follow-up only)

Two slug fixes applied locally + targeted Supabase row updates:

1. **Chris Stamp** → `yorkshire-dales-photography-workshops` (was `north-yorkshire-landscape-photography`, excluded)
2. **lonnie morris** → `wales-photography-workshop-pistyll-rhaeadr` (was `landscape-photography-wales-photo-workshop` / Gower)

Scripts: `Chat AI Bot/scripts/apply-two-review-slug-fixes.mjs`

## Suggested pipeline (when started)

1. Schema Tools: `scripts/fetch-google-reviews.py` + Trustpilot match/merge scripts (see Schema Tools `readme.md` / `fetch-google-reviews-README.md`).
2. Rebuild combined CSV; diff against current `03 – combined_product_reviews.csv`.
3. Review diff; then run `npm run ingest:product-reviews` once approved.

## Related booking-match outputs

| File | Purpose |
|------|---------|
| `09-booking-review-gap-matches.csv` | Name/date matches from booking sheets |
| `10-proposed-review-reattributions.csv` | Curated proposals (2 approved above) |
| `11-gap-tiles-audit-summary.csv` | Per-tile verdict |
