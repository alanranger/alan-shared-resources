# CHAT API GUIDE

Describes how the Chat AI Bot should use the shared-resources repo.

---

# 1. Required Input Data

Chat ingestion requires:

- Product cleaned file → `/csv processed/02*.xlsx`
- Combined reviews → `/csv processed/03*.csv`
- Event–product mappings → `/csv processed/event-product-mappings*.csv`
- Site URLs → `/csv/06-site-urls.csv`

---

# 2. Ingestion Pipeline

Source → Validation → Convert → Store → Supabase Upsert

Pipeline reads from:

alan-shared-resources/csv processed/
alan-shared-resources/csv/

css
Copy code

Converted ingestion files are written to:

alan-shared-resources/outputs/ingest/

yaml
Copy code

---

# 3. Chat Logic Overview

The chatbot uses:

- Event/product matches  
- Reviews (summarised + raw text)  
- JSON-LD schema  
- Page metadata from mapping  
- Product details  
- Blog content (optional future ingestion)

---

# 4. Safety: No destructive writes

The chat agent MUST NEVER:

- Modify or rename CSVs  
- Overwrite processed files  
- Move files out of shared-resources  

All writes go only to `/outputs/ingest/`.

---

# 5. Future Enhancements

- Auto-rebuild embeddings when CSV updated  
- Auto-sync mapping and product data  