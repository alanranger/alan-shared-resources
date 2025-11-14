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

# 3. Path Updates Needed (Pending)

Chat AI Bot:
- Update paths in `csv-import.js`  
- Update paths in `chat.js` ingest logic  

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