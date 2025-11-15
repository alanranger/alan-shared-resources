# Structure Audit Report
**Date:** 14 November 2025  
**Repository:** alan-shared-resources

---

## 1. Folder Verification

### ✅ Required Folders Status

| Folder | Status | Notes |
|--------|--------|-------|
| `csv/` | ✅ EXISTS | Flat structure (no files in subfolders) |
| `csv processed/` | ✅ EXISTS | Contains 6 files |
| `outputs/ingest/` | ✅ EXISTS | Has 4 empty subfolders (blogs/, events/, pages/, products/) |
| `outputs/schema/` | ✅ EXISTS | Has 4 subfolders with files |

### ⚠️ Unexpected Subfolders

**Under `csv/`:**
- `blog/` - **EMPTY** (should be removed if csv/ is to remain flat)
- `events/` - **EMPTY** (should be removed if csv/ is to remain flat)
- `lessons/` - **EMPTY** (should be removed if csv/ is to remain flat)
- `products/` - **EMPTY** (should be removed if csv/ is to remain flat)
- `reviews/` - **EMPTY** (should be removed if csv/ is to remain flat)
- `landing-pages/` - **EMPTY** (should be removed if csv/ is to remain flat)

**Note:** These subfolders exist but contain no files. They were created for future organization but are currently unused.

---

## 2. Files by Folder

### `csv/` (11 files - all .csv)
All files are in root (flat structure) ✅

- `01-blog-posts.csv`
- `02-beginners-photography-lessons.csv`
- `03-photographic-workshops-near-me.csv`
- `04-photography-services-courses-mentoring.csv`
- `05-photo-workshops-uk-landscape.csv`
- `06-site-urls.csv`
- `07-product-schema-with-review-ratings.csv`
- `08-landing-and-service-pages.csv`
- `raw-01-products-sqsp-export.csv`
- `raw-03a-trustpilot-reviews-historical.csv`
- `raw-03b-google-reviews.csv`

**Status:** ✅ All files follow naming convention (lowercase, hyphen-delimited, numbered prefix)

---

### `csv processed/` (6 files)
- `02 - products_cleaned.xlsx` ⚠️ (has spaces, .xlsx extension acceptable)
- `03 - combined_product_reviews.csv` ⚠️ (has spaces)
- `03a_trustpilot_matched.csv` ✅
- `03b_google_matched.csv` ✅
- `04 - alanranger_product_schema_FINAL_WITH_REVIEW_RATINGS.csv` ⚠️ (has spaces, uppercase letters)
- `event-product-mappings-2025-11-13T19-53-01-277Z.csv` ⚠️ (has uppercase 'T' and 'Z' in timestamp)

**Status:** ⚠️ 4 files have spaces in names, 2 files have uppercase letters

---

### `outputs/ingest/` (0 files)
Subfolders exist but are empty:
- `blogs/` - empty
- `events/` - empty
- `pages/` - empty
- `products/` - empty

**Status:** ✅ Structure ready, awaiting ingestion files

---

### `outputs/schema/` (61 files)

**Subfolder: `blog/`** (1 file)
- `blog-schema.json` ✅

**Subfolder: `lessons/`** (1 file)
- `lessons-schema.json` ✅

**Subfolder: `workshops/`** (1 file)
- `workshops-schema.json` ✅

**Subfolder: `products/`** (58 files)
- 54 unique `.html` files ✅
- 4 duplicate files with " - Copy" suffix ⚠️:
  - `suffolk-landscape-photography-workshops-21st-23rd-nov_schema_squarespace_ready - Copy.html`
  - `wales-photography-workshop-lake-vyrnwy-29-30-nov_schema_squarespace_ready - Copy.html`
  - `wales-photography-workshop-lake-vyrnwy-30-31-may_schema_squarespace_ready - Copy.html`
  - `warwickshire-woodland-photography-walks-monthly-2hrs_schema_squarespace_ready - Copy.html`

**Status:** ⚠️ 4 duplicate files found in products/ subfolder

---

## 3. Issues Found

### 🔴 Critical Issues
None

### ⚠️ Naming Convention Violations

1. **Files with spaces in `csv processed/`:**
   - `02 - products_cleaned.xlsx`
   - `03 - combined_product_reviews.csv`
   - `04 - alanranger_product_schema_FINAL_WITH_REVIEW_RATINGS.csv`

2. **Files with uppercase letters:**
   - `04 - alanranger_product_schema_FINAL_WITH_REVIEW_RATINGS.csv` (contains "FINAL_WITH_REVIEW_RATINGS")
   - `event-product-mappings-2025-11-13T19-53-01-277Z.csv` (contains "T" and "Z" in ISO timestamp - may be acceptable)

3. **Duplicate files in `outputs/schema/products/`:**
   - 4 files with " - Copy" suffix (likely accidental duplicates)

### 📁 Structural Issues

1. **Empty subfolders in `csv/`:**
   - 6 empty subfolders (blog/, events/, lessons/, products/, reviews/, landing-pages/)
   - These were created for future organization but are currently unused

---

## 4. File Extension Analysis

### ✅ Correct Extensions
- `csv/`: All files are `.csv` ✅
- `csv processed/`: 5 `.csv` files, 1 `.xlsx` file (acceptable for Excel format) ✅
- `outputs/schema/`: 3 `.json` files, 58 `.html` files (Squarespace-ready format) ✅

### ⚠️ No Unexpected Extensions Found
- No `.tmp`, `.bak`, `.old`, or `.backup` files found ✅

---

## 5. Duplicate Filename Check

### ⚠️ Duplicates Found

**In `outputs/schema/products/`:**
1. `suffolk-landscape-photography-workshops-21st-23rd-nov_schema_squarespace_ready.html` + `... - Copy.html`
2. `wales-photography-workshop-lake-vyrnwy-29-30-nov_schema_squarespace_ready.html` + `... - Copy.html`
3. `wales-photography-workshop-lake-vyrnwy-30-31-may_schema_squarespace_ready.html` + `... - Copy.html`
4. `warwickshire-woodland-photography-walks-monthly-2hrs_schema_squarespace_ready.html` + `... - Copy.html`

**Note:** These appear to be accidental duplicates created by file system copy operations.

---

## 6. Summary

### ✅ What's Working Well
- `csv/` folder is flat with all files following naming convention
- All primary CSV files (01-08) are properly named
- Raw files (raw-*) are properly prefixed
- `outputs/schema/` structure is organized by type
- No temporary or backup files found
- All file extensions are appropriate

### ⚠️ Issues Requiring Attention

1. **Naming inconsistencies in `csv processed/`:**
   - 4 files contain spaces (should use hyphens)
   - 1 file contains uppercase letters (should be lowercase)

2. **Duplicate files:**
   - 4 duplicate files in `outputs/schema/products/` with " - Copy" suffix

3. **Empty subfolders:**
   - 6 empty subfolders in `csv/` should be removed if maintaining flat structure

---

## 7. Recommended Cleanup Actions

### High Priority
- Remove 4 duplicate " - Copy" files from `outputs/schema/products/` (after verifying originals are correct)
- Remove empty subfolders from `csv/` if maintaining flat structure:
  - `csv/blog/`
  - `csv/events/`
  - `csv/lessons/`
  - `csv/products/`
  - `csv/reviews/`
  - `csv/landing-pages/`

### Medium Priority
- Rename files in `csv processed/` to remove spaces:
  - `02 - products_cleaned.xlsx` → `02-products-cleaned.xlsx`
  - `03 - combined_product_reviews.csv` → `03-combined-product-reviews.csv`
  - `04 - alanranger_product_schema_FINAL_WITH_REVIEW_RATINGS.csv` → `04-alanranger-product-schema-final-with-review-ratings.csv`
- Consider renaming timestamp file (if acceptable to break timestamp format):
  - `event-product-mappings-2025-11-13T19-53-01-277Z.csv` → `event-product-mappings-2025-11-13-19-53-01-277z.csv` (lowercase 'z')

### Low Priority
- Verify that `.xlsx` file in `csv processed/` is necessary (could potentially be converted to CSV)
- Document naming convention exceptions (e.g., ISO timestamps in filenames)

---

## 8. Compliance Check

| Requirement | Status | Notes |
|-------------|--------|-------|
| All folders exist | ✅ PASS | All 4 required folders present |
| `csv/` is flat | ✅ PASS | No files in subfolders (but empty subfolders exist) |
| Lowercase filenames | ⚠️ PARTIAL | 2 files in `csv processed/` have uppercase |
| No spaces in names | ⚠️ PARTIAL | 4 files in `csv processed/` have spaces |
| No duplicates | ⚠️ PARTIAL | 4 duplicates in `outputs/schema/products/` |
| Correct extensions | ✅ PASS | All extensions appropriate |

---

**Audit Complete**  
*No automatic changes were made. All recommendations are suggestions only.*


