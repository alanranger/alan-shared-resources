# DATA STRUCTURE — alan-shared-resources

This repository contains all raw and processed data used by:
- Chat AI Bot ingestion
- Schema generation tools
- Review processors
- Event→product mapping tools

---

# 1. Root Structure

alan-shared-resources/
│
├── csv/
├── csv processed/
├── outputs/
│ ├── ingest/
│ ├── schema/
│ ├── pages/
│ ├── events/
│ └── products/
└── README.md

yaml
Copy code

---

# 2. Raw CSV Files — `/csv/`

These are files exported directly from sources:

### Current naming pattern (hybrid: numbered prefix + lowercase, hyphenated):
01-blog-posts.csv
02-beginners-photography-lessons.csv
03-photographic-workshops-near-me.csv
04-photography-services-courses-mentoring.csv
05-photo-workshops-uk-landscape.csv
06-site-urls.csv
07-product-schema-with-review-ratings.csv
08-landing-and-service-pages.csv

raw-01-products-sqsp-export.csv
raw-03a-trustpilot-reviews-historical.csv
raw-03b-google-reviews.csv

yaml
Copy code

These must **never be edited**. Tools consume these.

---

# 3. Processed CSV Files — `/csv processed/`

These files are cleaned, deduped, matched or merged:

02 – products_cleaned.xlsx
03 – combined_product_reviews.csv
03a_trustpilot_matched.csv
03b_google_matched.csv
04 – alanranger_product_schema_FINAL_WITH_REVIEW_RATINGS.csv
event-product-mappings-YYYY-MM-DD.csv

yaml
Copy code

These are safe for tools to modify.

---

# 4. Outputs — `/outputs/`

### 4.1 `/outputs/schema/`
**Staging area** for JSON-LD schemas produced by Schema Generator:

blog-schema.json
lessons-schema.json
workshops-schema.json
products-schema.json

yaml
Copy code

**Note:** These files are then deployed to `alanranger-schema` GitHub repo for public hosting. Squarespace fetches schemas from `https://schema.alanranger.com/*.json` via script URLs.

### 4.2 `/outputs/ingest/`
Files that Chat AI Bot uses to ingest into Supabase.

### 4.3 `/outputs/events`, `/outputs/pages`, `/outputs/products`
Where tools can export AI-ready data.

---

# 5. CSV Integrity Rules

- Raw CSVs must **never** be overwritten.  
- Processed CSVs must keep the same file names.  
- Tools must only **read** from `/csv/` and **write** to `/csv processed/`.  
- Tools must only **output** to `/outputs/*`.

---

# 6. Required file availability

Chatbot ingests require:

- combined reviews  
- product cleaned  
- event product mappings  

Schema tools require:

- blog  
- workshops  
- lessons  
- landing & service pages  
- site URLs  
