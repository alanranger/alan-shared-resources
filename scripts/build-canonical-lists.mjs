// Build canonical product + landing-page lists from the chat-ai-bot ingest
// CSVs in this repo. READ-ONLY: no schema changes, no DB writes, no booking
// sheet access. Produces two clean CSVs the user can paste into Excel.
//
// Sources (relative to alan-shared-resources):
//   csv/04-photography-services-courses-mentoring.csv   (services / courses /
//                                                        mentoring / prints /
//                                                        gift vouchers /
//                                                        subscriptions /
//                                                        digital downloads)
//   csv/05-photo-workshops-uk-landscape.csv             (UK workshops)
//   csv/08-landing-and-service-pages.csv                (landing / service URLs
//                                                        with explicit category)
//   csv processed/05-event-product-mappings-latest.csv  (~101 event instances
//                                                        mapped to their parent
//                                                        product URL + price)
//
// Outputs (csv processed/):
//   canonical-products.csv
//     product_title | product_url | category | typical_price_gbp |
//     service_page_url | service_page_title | known_variants | sources
//
//   landing-pages.csv
//     url | page_type   (page_type = landing|service|product|event)
//
//     "service" is reserved for the genuine landing-hub URLs in the 08 file
//     (Alan's own labels — the pages that do the heavy lifting before
//     purchase). Every catalog detail page from 04/05 is "product"; every
//     event-instance URL from the mappings is "event"; everything else from
//     08 is "landing".
//
// Run:
//   node scripts/build-canonical-lists.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const SOURCES = {
  services:  join(repoRoot, 'csv', '04-photography-services-courses-mentoring.csv'),
  workshops: join(repoRoot, 'csv', '05-photo-workshops-uk-landscape.csv'),
  landing:   join(repoRoot, 'csv', '08-landing-and-service-pages.csv'),
  events:    join(repoRoot, 'csv processed', '05-event-product-mappings-latest.csv')
};
const OUTPUT_DIR = join(repoRoot, 'csv processed');
const OUT_PRODUCTS = join(OUTPUT_DIR, 'canonical-products.csv');
const OUT_PAGES = join(OUTPUT_DIR, 'landing-pages.csv');

// ----------------------------------------------------------------------
// Tiny CSV parser: handles quoted fields, embedded commas, doubled quotes
// (the RFC 4180 standard form). Returns array of rows; first row = headers.
// ----------------------------------------------------------------------

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQuote) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i += 1; }
      else if (c === '"') { inQuote = false; }
      else { cur += c; }
    } else if (c === '"') { inQuote = true; }
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\r') { /* swallow */ }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else { cur += c; }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(v => v?.length));
}

function readCsv(path) {
  const text = readFileSync(path, 'utf8');
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])));
}

function escapeCsv(v) {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replaceAll('"', '""') + '"';
  return s;
}

function writeCsv(path, headers, rows) {
  mkdirSync(dirname(path), { recursive: true });
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(headers.map(h => escapeCsv(r[h])).join(','));
  writeFileSync(path, lines.join('\n') + '\n', 'utf8');
}

// ----------------------------------------------------------------------
// Category inference
// ----------------------------------------------------------------------

function categoriseService(row) {
  const cats = (row.Categories || '').toLowerCase();
  const tags = (row.Tags || '').toLowerCase();
  const url = (row['Full Url'] || '').toLowerCase();
  const title = (row.Title || '').toLowerCase();
  if (tags.includes('picknmix') || url.includes('pick-n-mix')) return 'subscription/payment-plan';
  if (cats.includes('gift-voucher') || url.includes('gift-voucher')) return 'gift voucher';
  if (cats.includes('print') || url.includes('print') || url.includes('canvas') || url.includes('framed')) return 'print';
  if (cats.includes('1-2-1-private-lessons') || url.includes('private') || url.includes('-121')) return '1-2-1';
  if (url.includes('mentoring') || tags.includes('mentoring') || cats.includes('mentoring')) return 'mentoring';
  if (url.includes('rps')) return 'mentoring/RPS';
  if (cats.includes('pocket-guide-series') || url.includes('field-checklists') || url.includes('foundation-digital-pack') || url.includes('ebook') || url.includes('pocket-guide')) return 'digital download';
  if (url.includes('calendar')) return 'merchandise';
  if (url.includes('sensor-clean')) return 'service';
  if (url.includes('viewing-frames')) return 'merchandise';
  if (url.includes('lightroom') || title.includes('lightroom')) return 'course (Lightroom)';
  if (cats.includes('photography-courses') || cats.includes('photography-classes') || url.includes('course') || url.includes('classes')) return 'course';
  return 'service';
}

function categoriseWorkshop(row) {
  const cats = (row.Categories || '').toLowerCase();
  if (cats.includes('weekend residential')) return 'workshop (residential)';
  if (cats.includes('one day')) return 'workshop (1-day)';
  if (cats.includes('half-day')) return 'workshop (half-day)';
  return 'workshop';
}

// ----------------------------------------------------------------------
// Service-page (hub) catalog: the canonical landing pages that do the
// heavy lifting before purchase. Slugs verified against
// 08-landing-and-service-pages.csv (only entries with category=service).
// ----------------------------------------------------------------------

const SERVICE_PAGES = {
  'academy/login':                                  'Academy Login',
  'beginners-photography-classes':                  'Beginners Photography Classes',
  'corporate-photography-training':                 'Corporate Photography Training',
  'course-finder-photography-classes-near-me':      'Photography Course Finder',
  'fine-art-prints':                                'Fine Art Prints',
  'free-online-photography-course':                 'Free Online Photography Course',
  'hire-a-professional-photographer-in-coventry':   'Hire a Professional Photographer (Coventry)',
  'landscape-photography-workshops':                'Landscape Photography Workshops (half-day, 2.5-4hr hub)',
  'one-day-landscape-photography-workshops':        'One-Day Landscape Photography Workshops',
  'photo-editing-course-coventry':                  'Photo Editing Course Coventry (Lightroom)',
  'photo-workshops-uk':                             'UK Photo Workshops',
  'photographic-workshops-near-me':                 'Photographic Workshops Near Me',
  'photography-courses-coventry':                   'Photography Courses Coventry',
  'photography-gift-vouchers':                      'Photography Gift Vouchers',
  'photography-lessons-online-121':                 'Online 1-2-1 Photography Lessons (Zoom)',
  'photography-masterclasses-online':               'Online Photography Masterclasses',
  'photography-mentoring-online-assignments':       'Online Photography Mentoring & Assignments',
  'photography-payment-plan':                       'Photography Payment Plan (Pick N Mix)',
  'photography-shop-services':                      'Photography Shop & Services',
  'photography-tuition-services':                   'Photography Tuition Services',
  'photography-workshops':                          'Photography Workshops (main hub)',
  'photography-workshops-near-me':                  'Photography Workshops Near Me (residential / 2+ day hub)',
  'private-photography-lessons':                    'Private Photography Lessons (Face-to-Face)',
  'professional-commercial-photographer-coventry':  'Professional Commercial Photographer Coventry',
  'professional-photographer-near-me':              'Professional Photographer Near Me',
  'rps-courses-mentoring-distinctions':             'RPS Courses & Mentoring (Distinctions)'
};

function svc(slug) {
  return { url: 'https://www.alanranger.com/' + slug, title: SERVICE_PAGES[slug] || slug };
}

// Each helper below stays narrow (single product family) so cyclomatic
// complexity per function stays well under 15.

function mapWorkshopServicePage(p) {
  const cats = p._categoriesRaw.toLowerCase();
  // Workshop hub mapping mirrors the live site nav under "Workshops":
  //   2.5hr - 4hr Workshops  → /landscape-photography-workshops
  //   One-day Workshops      → /one-day-landscape-photography-workshops
  //   Residential Workshops  → /photography-workshops-near-me
  // Uncategorised workshops fall back to the half-day hub (covers Brandon
  // Marsh per the prior user instruction — its 05 row has no duration tag).
  if (cats.includes('weekend residential')) return svc('photography-workshops-near-me');
  if (cats.includes('one day photo'))       return svc('one-day-landscape-photography-workshops');
  return svc('landscape-photography-workshops');
}

function mapCourseServicePage(p) {
  const url = p.product_url.toLowerCase();
  const title = p.product_title.toLowerCase();
  if (url.includes('lightroom') || title.includes('lightroom')) return svc('photo-editing-course-coventry');
  if (url.includes('rps') || title.includes('rps')) return svc('rps-courses-mentoring-distinctions');
  // Portrait must beat the beginners check below ("Beginners Portrait
  // Photography Course" matches both, but the user wants portrait routed
  // to the Coventry courses hub, not the beginners hub).
  if (url.includes('portrait') || title.includes('portrait')) return svc('photography-courses-coventry');
  // Masterclass products go to the Coventry courses hub (per user) — the
  // separate /photography-masterclasses-online hub stays unused for now.
  if (url.includes('masterclass') || title.includes('masterclass')) return svc('photography-courses-coventry');
  if (url.includes('beginners') || title.includes('beginners')) return svc('beginners-photography-classes');
  return svc('photography-courses-coventry');
}

function map121ServicePage(p) {
  const all = (p.product_url + ' ' + p.product_title + ' ' + p._tagsRaw + ' ' + p._categoriesRaw).toLowerCase();
  if (all.includes('online') || all.includes('zoom')) return svc('photography-lessons-online-121');
  return svc('private-photography-lessons');
}

function mapMentoringServicePage(p) {
  const all = (p.product_url + ' ' + p.product_title + ' ' + p._tagsRaw + ' ' + p._categoriesRaw).toLowerCase();
  if (all.includes('rps')) return svc('rps-courses-mentoring-distinctions');
  return svc('photography-mentoring-online-assignments');
}

function mapDigitalDownloadServicePage(p) {
  const url = p.product_url.toLowerCase();
  if (url.includes('foundation') || url.includes('academy')) return svc('free-online-photography-course');
  return svc('photography-shop-services');
}

function mapServicePage(p) {
  const cat = p.category;
  if (cat.startsWith('workshop')) return mapWorkshopServicePage(p);
  if (cat.startsWith('course'))   return mapCourseServicePage(p);
  if (cat === '1-2-1')            return map121ServicePage(p);
  if (cat.startsWith('mentoring')) return mapMentoringServicePage(p);
  if (cat === 'print')                       return svc('fine-art-prints');
  if (cat === 'gift voucher')                return svc('photography-gift-vouchers');
  if (cat === 'subscription/payment-plan')   return svc('photography-payment-plan');
  if (cat === 'digital download')            return mapDigitalDownloadServicePage(p);
  return svc('photography-shop-services');
}

// ----------------------------------------------------------------------
// Build canonical products map keyed by lowercased product URL
// ----------------------------------------------------------------------

function urlKey(u) { return (u || '').trim().toLowerCase(); }

function ensureProduct(map, url) {
  const k = urlKey(url);
  if (!map.has(k)) {
    map.set(k, { product_url: url.trim(), product_title: '', category: '', typical_price_gbp: '', _titles: new Set(), _sources: new Set(), _categoriesRaw: '', _tagsRaw: '' });
  }
  return map.get(k);
}

function addCatalogFields(p, row) {
  if (row.Title) p._titles.add(row.Title);
  if (!p.product_title) p.product_title = row.Title || '';
  if (row.Categories) p._categoriesRaw += ' ' + row.Categories;
  if (row.Tags) p._tagsRaw += ' ' + row.Tags;
}

function addService(map, row) {
  if (!row['Full Url']) return;
  const p = ensureProduct(map, row['Full Url']);
  addCatalogFields(p, row);
  if (!p.category) p.category = categoriseService(row);
  p._sources.add('04-services');
}

function addWorkshop(map, row) {
  if (!row['Full Url']) return;
  const p = ensureProduct(map, row['Full Url']);
  addCatalogFields(p, row);
  if (!p.category) p.category = categoriseWorkshop(row);
  p._sources.add('05-workshops');
}

function inferCategoryFromUrl(url) {
  const u = (url || '').toLowerCase();
  if (u.includes('/photo-workshops-uk/')) return 'workshop';
  if (u.includes('/photography-services-near-me/')) return 'course';
  return 'product';
}

function addEventMapping(map, row) {
  if (!row.product_url) return;
  const p = ensureProduct(map, row.product_url);
  if (row.product_title) p._titles.add(row.product_title);
  if (!p.product_title) p.product_title = row.product_title || '';
  if (!p.typical_price_gbp && row.price_gbp) p.typical_price_gbp = row.price_gbp;
  if (!p.category) p.category = inferCategoryFromUrl(row.product_url);
  p._sources.add('05-event-mappings');
}

function finaliseProducts(map) {
  const out = [];
  for (const p of [...map.values()].sort((a, b) => a.product_url.localeCompare(b.product_url))) {
    const variants = [...p._titles].filter(t => t && t !== p.product_title);
    const s = mapServicePage(p);
    out.push({
      product_title: p.product_title,
      product_url: p.product_url,
      category: p.category || 'unknown',
      typical_price_gbp: p.typical_price_gbp || '',
      service_page_url: s.url,
      service_page_title: s.title,
      known_variants: variants.join('; '),
      sources: [...p._sources].join('; ')
    });
  }
  return out;
}

// ----------------------------------------------------------------------
// Build landing-pages list (de-duplicated by URL)
// ----------------------------------------------------------------------

function buildLandingPages(landingRows, services, workshops, events) {
  const map = new Map();
  const add = (url, type) => {
    if (!url) return;
    const k = urlKey(url);
    if (!map.has(k)) map.set(k, { url: url.trim(), page_type: type });
  };
  // 08 is authoritative for service vs landing (Alan's own labels). Add
  // first so the 08 label wins on any duplicate URL appearing in 04/05.
  for (const r of landingRows) add(r.url, r.category || 'landing');
  // Every catalog detail page in 04 is a product detail page, not a hub.
  for (const r of services) add(r['Full Url'], 'product');
  // Every workshop catalog entry in 05 is a product detail page.
  for (const r of workshops) add(r['Full Url'], 'product');
  // Event-instance URLs from the mappings.
  for (const r of events) add(r.event_url, 'event');
  return [...map.values()].sort((a, b) => a.url.localeCompare(b.url));
}

// ----------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------

const services = readCsv(SOURCES.services);
const workshops = readCsv(SOURCES.workshops);
const landing = readCsv(SOURCES.landing);
const events = readCsv(SOURCES.events);

console.log('--- source row counts ---');
console.log(`  04-services:       ${services.length}`);
console.log(`  05-workshops:      ${workshops.length}`);
console.log(`  08-landing-pages:  ${landing.length}`);
console.log(`  event-mappings:    ${events.length}`);

const productMap = new Map();
for (const r of services) addService(productMap, r);
for (const r of workshops) addWorkshop(productMap, r);
for (const r of events) addEventMapping(productMap, r);

const products = finaliseProducts(productMap);
const pages = buildLandingPages(landing, services, workshops, events);

writeCsv(OUT_PRODUCTS, ['product_title', 'product_url', 'category', 'typical_price_gbp', 'service_page_url', 'service_page_title', 'known_variants', 'sources'], products);
writeCsv(OUT_PAGES, ['url', 'page_type'], pages);

console.log('');
console.log('--- outputs ---');
console.log(`  ${OUT_PRODUCTS}  (${products.length} distinct products)`);
console.log(`  ${OUT_PAGES}  (${pages.length} distinct pages)`);

console.log('');
console.log('--- product categories breakdown ---');
const catCounts = new Map();
for (const p of products) catCounts.set(p.category, (catCounts.get(p.category) || 0) + 1);
for (const [c, n] of [...catCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${c.padEnd(28)} ${String(n).padStart(3)}`);
}

console.log('');
console.log('--- page-type breakdown ---');
const ptCounts = new Map();
for (const p of pages) ptCounts.set(p.page_type, (ptCounts.get(p.page_type) || 0) + 1);
for (const [c, n] of [...ptCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${c.padEnd(28)} ${String(n).padStart(3)}`);
}

const withPrice = products.filter(p => p.typical_price_gbp).length;
const withVariants = products.filter(p => p.known_variants).length;
console.log('');
console.log('--- diagnostics ---');
console.log(`  products with a typical price (from event mappings):  ${withPrice} / ${products.length}`);
console.log(`  products with a title variant (event vs 04/05 label): ${withVariants} / ${products.length}`);
const onlyEvent = products.filter(p => !p.sources.includes('04-services') && !p.sources.includes('05-workshops')).length;
const onlyCatalog = products.filter(p => !p.sources.includes('05-event-mappings')).length;
console.log(`  products only in event mappings (no 04/05 catalog row): ${onlyEvent}`);
console.log(`  products only in 04/05 catalog (no event-mapping row):  ${onlyCatalog}`);

console.log('');
console.log('--- product-to-service-page coverage (76 products → 1 hub each) ---');
const svcCounts = new Map();
for (const p of products) {
  const k = p.service_page_url || '(unmapped)';
  svcCounts.set(k, (svcCounts.get(k) || 0) + 1);
}
for (const [u, n] of [...svcCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${u}`);
}
