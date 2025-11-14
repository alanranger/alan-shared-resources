# SCHEMA GENERATION GUIDE

Defines how the Schema Generator Tool reads CSVs, builds structured data, and outputs JSON-LD.

---

# 1. CSV Sources

| Schema Type  | Required CSVs | Path |
|--------------|---------------|------|
| Blog | Blog CSV | `/csv/01-blog-posts.csv` |
| Workshops | Workshops CSV | `/csv/03-photographic-workshops-near-me.csv` or `/csv/05-photo-workshops-uk-landscape.csv` |
| Lessons | Lessons/Services CSV | `/csv/02-beginners-photography-lessons.csv` or `/csv/04-photography-services-courses-mentoring.csv` |
| Products | Cleaned product data | `/csv processed/02*` |
| Reviews | Trustpilot+Google matched | `/csv processed/03*` |

---

# 2. Output Format

All final schemas MUST be saved to:

alan-shared-resources/outputs/schema/

arduino
Copy code

File names:

blog-schema.json
workshops-schema.json
lessons-schema.json
products-schema.json

yaml
Copy code

---

# 3. Behaviour Rules

- Missing fields must be omitted, not blanked.  
- Duplicate events must be merged by URL.  
- Image URLs must not generate NaN.  
- Partial addresses are allowed & should not create empty keys.

---

# 4. Constraints

- NEVER modify raw CSV  
- NEVER output inline schema into the HTML tool  
- ALWAYS output pure JSON  
- ALL schemas must pass schema.org validator  

---

# 5. Schema Deployment Pipeline

### Current Flow:
1. Schema Tools generate JSON-LD → `alan-shared-resources/outputs/schema/`
2. Manual copy → `alanranger-schema` GitHub repo
3. GitHub Pages/CDN hosts → `https://schema.alanranger.com/*.json`
4. Squarespace pages reference via script URLs

### Target Repository:
- **GitHub:** `alanranger/alanranger-schema`
- **Purpose:** Public hosting endpoint for Squarespace script URL references
- **Structure:** Flat structure with schema JSON files at root (e.g., `blog-schema.json`, `workshops-schema.json`)

### Future Automation:
- Auto-copy schema outputs from `alan-shared-resources/outputs/schema/` → `alanranger-schema` repo
- Auto-commit and push to GitHub
- Auto-generate script URL tags for Squarespace injection
- Version tagging for schema updates  