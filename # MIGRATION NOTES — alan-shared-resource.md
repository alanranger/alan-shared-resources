# MIGRATION NOTES — alan-shared-resources Integration

A permanent ledger of all changes made during the creation of the unified shared repository.

---

# 1. 14 Nov 2025 — Shared Repository Created

- New repo: `alan-shared-resources`
- Folder structure created
- Raw and processed CSVs moved from Chat & Schema repos
- Outputs folders defined
- Schema outputs moved from `alanranger-schema` repo for staging

---

# 2. File Movements

### From Chat AI Bot → moved to shared-resources
- All product CSVs  
- All reviews matched CSVs  
- Event–product mappings  
- Cleaned products file  

### From Schema Tools → moved to shared-resources
- All CSV inputs  
- All merged reviews  
- All schema JSON outputs  

---

# 3. Path Updates (Completed)

Chat AI Bot:
- ✅ Update paths in `csv-import.js` (completed)  
- ✅ Update paths in `chat.js` ingest logic (completed)  

Schema Tools:
- Update input loaders  
- Update schema output paths  

---

# 4. Future Migration Tasks

- Automate schema copying to hosting repo  
- Replace manual Squarespace script tags with script URL tags  
- Add GitHub Actions for ingestion automation  

---

# 5. Compatibility Notes

- Legacy files remain in tool repos for now (not used)
- Cursor agents trained to use only shared-resources

---

# 6. 14 Nov 2025 — File Naming Standardization

- All CSV files in `/csv/` root renamed to hybrid format:
  - Numbered prefixes preserved (01-, 02-, etc.) for easy identification
  - Rest of filename converted to lowercase, hyphen-delimited
  - Examples: `01-blog-posts.csv`, `02-beginners-photography-lessons.csv`
- Files remain in `/csv/` root for easy manual access during ingestion
- Empty subfolders removed from `/csv/` to maintain flat structure
- Updated `Schema Tools/scripts/generate-blog-schema.js` to reference new filename
- README updated with hybrid naming convention rules
- Created `STRUCTURE_AUDIT.md` for repository structure documentation

---

# 7. 14 Nov 2025 — alanranger-schema Repository Integration

- Added `alanranger-schema` as the 4th core component of the workspace
- **GitHub Repo:** `alanranger/alanranger-schema`
- **Location:** `Schema Tools/alanranger-schema/` (or separate workspace folder)
- **Purpose:** Final hosting endpoint for JSON-LD schema files
- **Hosting:** GitHub Pages at `https://schema.alanranger.com/*.json`
- **Usage:** Squarespace pages fetch schemas via script URLs:
  - `<script type="application/ld+json" src="https://schema.alanranger.com/blog-schema.json"></script>`
- **Deployment Flow:**
  1. Schema Tools generate → `alan-shared-resources/outputs/schema/` (staging)
  2. Copy → `alanranger-schema` GitHub repo (production)
  3. GitHub Pages hosts for public access
- **Documentation Updated:**
  - `# PROJECT OVERVIEW.md` - Added as 4th component
  - `# SCHEMA GENERATION GUIDE.md` - Added deployment pipeline section
  - `# AGENT INSTRUCTIONS.md` - Added schema deployment rules
  - `# DATA STRUCTURE.md` - Noted staging → production flow
  - `# MASTER TODO.md` - Added deployment automation tasks

---

# 8. 15 Nov 2025 — CSV Import Complete Fix

Fixed all non-event CSV import failures in Chat AI Bot's `api/csv-import.js`:

**Issues Fixed:**
1. **Manual Upsert for Non-Event Types**: PostgREST doesn't support partial unique indexes in `onConflict` parameter. Changed all non-event import functions (`importBlogMetadata`, `importCourseProductMetadata`, `importWorkshopProductMetadata`, `importSiteUrlMetadata`, `importProductSchemaMetadata`, `importLandingServicePageMetadata`) to manually handle upsert: delete existing rows first, then insert new ones.

2. **Batch Delete Operations**: PostgREST has limits on `.in()` clause size (~100 items). Added `batchDeleteMetadata()` helper function to process deletes in batches of 100 URLs. This fixed failures for large URL lists (File 06 with 433 URLs).

3. **Foreign Key Constraint Handling**: Foreign key constraints with `NO ACTION` delete rule prevent deletion of `csv_metadata` rows when referenced by `page_entities` or `page_chunks`. Updated `batchDeleteMetadata()` to nullify foreign key references in both tables before deletion.

**Result:**
- All 8 CSV files now import successfully
- No duplicates in database after ingestion
- Verified: Database check confirms no duplicate rows for any csv_type

**Files Affected:**
- `Chat AI Bot/api/csv-import.js` - Updated import logic for all non-event types
- `Chat AI Bot/Architecture and Handover MDs/AI_TODO_LIST_CURRENT.md` - Documented fixes
- `Chat AI Bot/Architecture and Handover MDs/PROJECT_PROGRESS_MASTER.md` - Added entry

**Restore Point:**
- Commit: `04f4f28` (Chat AI Bot repo)
- Timestamp: 2025-11-15T17-07-03  