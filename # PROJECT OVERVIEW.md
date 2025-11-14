# PROJECT OVERVIEW

This workspace contains the four core components of the Alan Ranger digital ecosystem:

---

## 1. Chat AI Bot  
**Folder:** `Chat AI Bot/`  
**Purpose:**  
A Vercel serverless application providing AI-powered conversation responses using:
- Supabase data (events, pages, products, mappings)
- JSON-LD schema
- Reviews CSVs (matched + combined)
- Product metadata
- Ingestion pipelines to refresh embeddings

**Consumes data from:**
- `alan-shared-resources/csv/`
- `alan-shared-resources/csv processed/`
- `alan-shared-resources/outputs/ingest/`

**Outputs to:**
- Supabase tables
- Vercel API responses (`api/chat.js`)

---

## 2. Schema Tools  
**Folder:** `Schema Tools/`  
**Purpose:**  
Browser-based CSV → JSON-LD generator for:
- Blog schema
- Workshops schema
- Lessons schema
- Product schema

**Consumes data from:**
- `alan-shared-resources/csv/` (raw)
- `alan-shared-resources/csv processed/` (cleaned & matched)
- `alan-shared-resources/csv reviews/`

**Outputs to:**
- `alan-shared-resources/outputs/schema/`

---

## 3. alan-shared-resources  
**Folder:** `alan-shared-resources/`  
**Purpose:**  
The *single source of truth* for all structured data:
- Raw CSVs from website & exports
- Cleaned/processed CSVs from tools
- Review merges from Trustpilot/Google
- Event–product mappings
- JSON-LD schemas for external hosting
- Ingestion-ready JSON/CSV for the Chat AI Bot

This repo eliminates duplicated files and guarantees consistent data across the ecosystem.

---

## 4. alanranger-schema  
**Folder:** `Schema Tools/alanranger-schema/` (or separate repo)  
**GitHub:** `alanranger/alanranger-schema`  
**Purpose:**  
The **final hosting endpoint** for JSON-LD schema files that Squarespace fetches via script URLs:
- Hosted on GitHub Pages (or similar CDN)
- Accessible via URLs like: `https://schema.alanranger.com/blog-schema.json`
- Squarespace pages reference schemas using: `<script type="application/ld+json" src="https://schema.alanranger.com/blog-schema.json"></script>`

**Receives data from:**
- `alan-shared-resources/outputs/schema/` (staging area)

**Outputs to:**
- Public GitHub repository (hosted for Squarespace consumption)
- GitHub Pages or CDN for public access

**Note:** This is the production endpoint. Schema files are generated in `alan-shared-resources/outputs/schema/` first, then copied/deployed to this repo for public hosting.

---

# System Architecture Summary

Squarespace Website
↓ exports / new blogs / new pages
alan-shared-resources (source of truth)
│
├── Schema Tools → generates → outputs/schema/*.json
│   │
│   └── (auto-copy) → alanranger-schema (GitHub) → Squarespace fetches via script URLs
│
└── Chat AI Bot → ingest → Supabase → AI Responses

yaml
Copy code

All updates flow through `alan-shared-resources`, with final schema deployment to `alanranger-schema` for Squarespace consumption.

---

# Workspace Goal

This unified workspace allows Cursor Agents to:

- Understand all four projects together  
- Share CSV processing logic  
- Automatically update ingestion/data pipelines  
- Maintain consistent schema generation  
- Automate schema deployment from shared-resources → alanranger-schema  
- Reduce human error  
- Automate cross-project syncing  