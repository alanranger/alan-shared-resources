# MASTER TODO — Unified Workspace

This file ensures both the Chat AI Bot agent and Schema Tools agent stay aligned.

---

# 📌 ACTIVE PRIORITIES

### 1. Connect shared-resources ingestion to Chat API  
- ✅ Update paths in `chat.js` and `csv-import.js` (completed)  
- ✅ Use `/alan-shared-resources/csv/` (completed - using flat structure)  
- ✅ Confirm Supabase ingestion works end to end (completed - all 8 CSV files import successfully)

### 2. Update Schema Tools input logic  
- Point all CSV readers to `/alan-shared-resources/csv/`  
- Point product reviews to `/csv processed/`  
- Output JSON into `/outputs/schema/`

### 3. Implement automated syncing pipeline  
- After schema generation: copy from `alan-shared-resources/outputs/schema/` → `alanranger-schema` GitHub repo  
- Auto-commit and push to `alanranger/alanranger-schema` for public hosting
- After CSV updates: trigger chatbot ingestion  
- After blog changes: regenerate blog schema

---

# 📌 BACKLOG

- Connect `alan-shared-resources/outputs/schema/` → `alanranger-schema` deployment pipeline
- Add automated GitHub Actions sync for schema deployment
- Integrate blog URLs into ingestion  
- Add Lessons & Workshops category filtering  
- Add JSON-LD validator script  
- Auto-generate Squarespace script URL tags for schema injection
- Add version tagging to schema outputs  

---

# 📌 COMPLETED

- Shared repository created  
- Folder structure established  
- Raw & processed CSVs sorted  
- Event-product files moved  
- Migration notes documented
- ✅ Chat AI Bot path updates completed (csv-import.js, chat.js)
- ✅ CSV import fixes completed (15 Nov 2025) - all 8 CSV files import successfully
  - Manual upsert for non-event types
  - Batch delete operations for large URL lists
  - Foreign key constraint handling  
