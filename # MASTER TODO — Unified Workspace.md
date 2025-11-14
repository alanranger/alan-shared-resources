# MASTER TODO — Unified Workspace

This file ensures both the Chat AI Bot agent and Schema Tools agent stay aligned.

---

# 📌 ACTIVE PRIORITIES

### 1. Connect shared-resources ingestion to Chat API  
- Update paths in `chat.js` and `csv-import.js`  
- Use `/alan-shared-resources/csv processed/`  
- Confirm Supabase ingestion works end to end

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
