# AGENT INSTRUCTIONS — For Cursor AI

This document defines how ALL agents (Chat Bot & Schema Tools) should behave inside this unified workspace.

---

# 1. Shared Repo Behaviour

Agents must treat:

alan-shared-resources/

yaml
Copy code

as the **single source of truth** for all CSV, processed data, and schema output.

**No other repo should store any CSVs or JSON-LD.**

---

# 2. Reading Rules

### Agents MUST read from:

- `csv/` → raw data  
- `csv processed/` → cleaned/combined data  
- `csv reviews/` → matched review sets  
- `outputs/schema/` → final JSON-LD  

---

# 3. Writing Rules

### Agents MUST write to:

- `csv processed/` for cleaned files  
- `outputs/schema/` for JSON-LD  
- `outputs/ingest/` for chatbot ingestion files  

---

# 4. Schema Generator Instructions

Schema Tools must:

- NEVER write into `/csv/`  
- ALWAYS write into `/outputs/schema/`  
- ALWAYS read reviews from `/csv processed/03a*` & `/csv processed/03b*`  
- ALWAYS read products from `/csv processed/02*`  

---

# 5. Chatbot Agent Instructions

Chat AI Bot must:

- Load event–product mappings from `/csv processed/event-product-mappings*.csv`  
- Load cleaned product data from `/csv processed/02*`  
- Load review merges from `/csv processed/03*`  
- Use folder `/outputs/ingest/` as its local cache  

---

# 6. Safety Rules

- Agents must NOT rename user CSV files (unless explicitly requested)  
- Must NOT break existing filenames  
- Must NOT assume new fields unless validated  
- Must NOT delete processed CSVs  
- All migrations must be documented in `MIGRATION_NOTES.md`
- File naming convention: Numbered prefix (01-, 02-, etc.) + lowercase, hyphen-delimited (e.g., `01-blog-posts.csv`)

---

# 7. Schema Deployment to alanranger-schema

### Schema Hosting Repository:
- **Repo:** `alanranger/alanranger-schema` (GitHub)
- **Location:** `Schema Tools/alanranger-schema/` (or separate workspace folder)
- **Purpose:** Final endpoint for JSON-LD files that Squarespace fetches via script URLs
- **URL Pattern:** `https://schema.alanranger.com/{schema-name}.json`

### Deployment Rules:
- Schema Tools generate → `alan-shared-resources/outputs/schema/` (staging)
- Copy final schemas → `alanranger-schema` repo (production)
- Commit and push to GitHub for public hosting
- Squarespace pages reference: `<script type="application/ld+json" src="https://schema.alanranger.com/blog-schema.json"></script>`

### Future Automation:
- Automated copy of generated schemas from `outputs/schema/` → `alanranger-schema` repo
- Auto-commit and push to GitHub
- Trigger chat ingestion when CSV changed  
- Autogenerate mapping files when events or products updated  