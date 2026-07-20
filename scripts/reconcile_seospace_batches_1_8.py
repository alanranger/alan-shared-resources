"""Reconcile 07 batches 1-8 against 06-site-urls.csv. Run from repo root optional."""
import csv
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
P06 = ROOT / "csv" / "06-site-urls.csv"
P07 = ROOT / "csv" / "07-url-target-keywords-seospace.csv"

# (batch, path starting with /, target_keyword) — 404 omitted
BATCHES: list[tuple[int, str, str]] = []

def add(b: int, path: str, kw: str) -> None:
    p = path.strip()
    if not p.startswith("/"):
        p = "/" + p
    BATCHES.append((b, p, kw))

# --- batch 1 (24 rows, no 404) ---
add(1, "/beginners-photography-lessons", "Beginners Photography Lessons")
add(1, "/blog-on-photography", "Blog On Photography")
add(1, "/blog-on-photography/ten-tips-towards-better-composition", "Better Composition")
add(1, "/blog-on-photography/take-the-on-line-colour-test", "colour test")
add(1, "/blog-on-photography/using-a-nd-filter", "ND Filter")
add(1, "/blog-on-photography/why-snowdonia-landscape-photography-workshops", "Snowdonia landscape photography")
add(1, "/photographic-workshops-near-me/batsford-arboretum-autumn-photography-31oct", "Batsford Arboretum")
add(1, "/blog-on-photography/10-basic-camera-settings-for-camera", "Basic Camera Settings")
add(1, "/photographic-workshops-near-me/woodland-photography-walk-solihull-hay-woods", "Woodland Photography Walk")
add(1, "/blog-on-photography/camera-sensor-cleaning-guide", "Sensor Cleaning")
add(1, "/photographic-workshops-near-me/bluebell-photography-photo-workshop-warwickshire-20", "Bluebell Photography")
add(1, "/blog-on-photography/top-tips-for-photographing-bluebells", "photographing bluebells")
add(1, "/photographic-workshops-near-me/peak-district-photography-workshops-winter", "Peak District Photography")
add(1, "/blog-on-photography/how-to-improve-your-photography-composition", "Photography Composition")
add(1, "/photography-services-near-me", "photography services")
add(1, "/photography-services-near-me/black-and-white-photography-course", "Black and White Photography Course")
add(1, "/photo-workshops-uk/garden-photography-workshop", "Garden Photography")
add(1, "/blog-on-photography/jpg-vs-raw-settings", "JPG vs Raw Settings")
add(1, "/photography-services-near-me/fine-art-photography-prints-unframed", "Photography Prints")
add(1, "/blog-on-photography/dice-roll-serendipity-awareness-photography-assignment", "Dice Roll Serendipity Awareness")
add(1, "/beginners-photography-lessons/lightroom-photo-editing-classes-wk2", "Photo Editing Classes")
add(1, "/blog-on-photography/histogram-and-exposure-review", "Histogram and Exposure")
add(1, "/blog-on-photography/iphone-camera-vs-the-digital-camera", "Phone Camera")
add(1, "/photography-lessons-online-121", "photography lessons online")

# --- batch 2 ---
add(2, "/blog-on-photography/peter-orton-rps-distinctions", "RPS Distinctions")
add(2, "/blog-on-photography/case-study-anne-watkinson-rps-distinctions", "rps distinctions")
add(2, "/photographic-workshops-near-me/long-exposure-photography-burnham-on-sea", "Long Exposure Photography")
add(2, "/blog-on-photography/what-is-minimalist-photography", "MINIMALIST PHOTOGRAPHY")
add(2, "/blog-on-photography/what-is-dynamic-range-in-photography", "Dynamic Range In Photography")
add(2, "/blog-on-photography/wildlife-photography-practice-assignment-free-lesson", "Wildlife Photography")
add(2, "/blog-on-photography/what-is-exposure-in-photography", "What is exposure in photography")
add(2, "/fine-art-prints", "fine art prints")
add(2, "/free-photography-tips", "photography tips")
add(2, "/photography-tuition-services", "Photography Tuition")
add(2, "/photography-services-near-me/rps-mentoring-photography-course", "RPS Mentoring")
add(2, "/photography-services-near-me/beginners-portrait-photography-course", "Portrait Photography Course")
add(2, "/photography-workshops", "photography workshops")
add(2, "/photography-presents-for-photographers", "photography present")
add(2, "/photographic-workshops-near-me", "Photographic Workshops")
add(2, "/professional-commercial-photographer-coventry", "Commercial Photographer")
add(2, "/photo-workshops-uk/peak-district-heather-photography-workshop", "peak district heather")
add(2, "/photography-services-near-me/photography-genre-photography-field-checklists", "Photography Field Checklists")
add(2, "/blog-on-photography/which-lens-should-i-buy-next", "which lens should I buy")
add(2, "/photographic-workshops-near-me/woodland-photography-walk-coventry-piles-coppice", "Woodland Photography Walk")
add(2, "/blog-on-photography/the-history-of-photography", "history of photography")
add(2, "/photographic-workshops-near-me/bluebell-photography-photo-workshop-warwickshire-25", "Bluebell Photography")
add(2, "/photographic-workshops-near-me/woodland-photography-walk-hay-woods", "Woodland Photography Walk")
add(2, "/beginners-photography-lessons/lightroom-photo-editing-classes-wk1-xx94r", "Photo Editing Classes")
add(2, "/photography-special-offers", "Photography Special Offers")

# --- batch 3 ---
add(3, "/photographic-workshops-near-me/garden-photography-workshop-mxyms", "Garden Photography")
add(3, "/photo-workshops-uk/secrets-of-woodland-photography-workshop", "Woodland Photography")
add(3, "/which-photography-style-is-right-for-you", "Which photography style is right for you")
add(3, "/blog-on-photography/white-balance-and-colour-photography", "White Balance and Colour")
add(3, "/blog-on-photography/what-are-leading-lines-in-photography", "What Are leading lines in Photography")
add(3, "/photography-shop-services", "Photography Shop")
add(3, "/photo-workshops-uk/poppy-fields-photography-workshops", "Poppy fields photography")
add(3, "/photographic-workshops-near-me/woodland-photography-walk-coventry-tile-hill", "Woodland Photograph")
add(3, "/photography-workshops-near-me", "photography workshops near me")
add(3, "/website-terms-and-conditions", "Website Terms and Conditions")
add(3, "/photography-courses-coventry", "Photography Courses Coventry")
add(3, "/photographic-workshops-near-me/long-exposure-photography-workshop-kenilworth4", "Long Exposure Photography Workshop")
add(3, "/photography-services-near-me/quarterly-pick-n-mix-subscription", "Pick N Mix")
add(3, "/photographic-workshops-near-me/lake-district-photography-workshop-spring", "Lake District Photography")
add(3, "/photography-mentoring-online-assignments", "photography mentoring online")
add(3, "/photo-workshops-uk/photography-workshops-chesterton-windmill", "chesterton windmill")
add(3, "/photo-workshops-uk/north-yorkshire-landscape-photography", "yorkshire landscape photography")
add(3, "/photography-services-near-me/monthly-pick-n-mix-subscription", "Pick N Mix")
add(3, "/photography-services-near-me/composition-settings-photography-field-checklists", "Photography Field Checklists")
add(3, "/photographic-workshops-near-me/bluebell-photography-photo-workshop-warwickshire-21", "Bluebell Photography")
add(3, "/photographic-workshops-near-me/peak-district-photography-workshops-spring", "Peak District Photography")
add(3, "/photographic-workshops-near-me/woodland-photography-walk-leamington-oakley-wood", "Woodland Photography Walk")
add(3, "/photo-workshops-uk/long-exposure-photography-workshop-fairy-glen", "long exposure photography")
add(3, "/photographic-workshops-near-me/poppy-fields-photography-workshop-sunrise", "Poppy Fields Photography")
add(3, "/schedule-an-appointment", "schedule an appointment")

# --- batch 4 ---
add(4, "/photo-workshops-uk/ireland-photography-workshops-dingle", "Ireland Photography Workshop")
add(4, "/photographic-workshops-near-me/woodland-photography-walk-kenilworth-crackley-woods", "Woodland Photography Walk")
add(4, "/photo-workshops-uk/photography-workshops-lavender-fields", "Lavender Field")
add(4, "/photographic-workshops-near-me/anglesey-photography-workshop-wales", "Anglesey Photography Workshop")
add(4, "/terms-and-conditions", "terms and conditions")
add(4, "/photographic-workshops-near-me/long-exposure-photography-workshop-kenilworth2", "Long Exposure Photography Workshop")
add(4, "/photographic-workshops-near-me/peak-district-photography-workshops-autumn", "Peak District Photography")
add(4, "/testimonials-customer-reviews", "customer reviews")
add(4, "/professional-photographer-near-me", "professional photographer near me")
add(4, "/photographic-workshops-near-me/norfolk-photography-workshop", "Norfolk Photography Workshop")
add(4, "/photographic-workshops-near-me/woodland-photography-walk-meriden-millisons-wood", "Woodland Photography Walk")
add(4, "/photo-workshops-uk/suffolk-landscape-photography-workshops", "Suffolk Landscape Photography")
add(4, "/photographic-workshops-near-me/batsford-arboretum-autumn-photography-30oct", "Batsford Arboretum")
add(4, "/photographic-workshops-near-me/urban-architecture-photography-workshop-coventry", "Urban Architecture Photography")
add(4, "/photography-services-near-me/photo-print-preparation-service-30min", "Photo Print Preparation Service")
add(4, "/photography-services-near-me/four-private-photography-classes", "Private Photography Classes")
add(4, "/photographic-workshops-near-me/bluebell-photography-photo-workshop-warwickshire-22", "Bluebell Photography")
add(4, "/photography-services-near-me/intermediates-intentions-photography-project-course", "Photography Project")
add(4, "/photo-workshops-uk/sezincote-garden-photography-workshop", "Garden Photography")
add(4, "/blog-on-photography/photography-basics-how-to-improve-photography", "Photography Basics")
add(4, "/photography-services-near-me/premium-photography-academy-membership", "Photography Academy Membership")
add(4, "/photographic-workshops-near-me/landscape-photography-snowdonia-workshop", "Landscape Photography Snowdonia")
add(4, "/photographic-workshops-near-me/landscape-photography-workshops-yorkshire", "Landscape Photography Workshop")
add(4, "/photography-services-near-me/photography-gift-vouchers", "Photography Gift Vouchers")
add(4, "/photo-workshops-uk/urban-architecture-photography-workshops-coventry", "Architecture Photography workshop")

# --- batch 5 ---
add(5, "/photographic-workshops-near-me/landscape-photography-wales-gower-peninsular", "Landscape Photography Wales")
add(5, "/help-portrait-uk-coventry", "help portrait")
add(5, "/photography-services-near-me/camera-sensor-clean", "Camera Sensor Clean")
add(5, "/photographic-workshops-near-me/woodland-photography-walk-coventry-cv4", "Woodland Photography Walk")
add(5, "/photography-services-near-me/annual-pick-n-mix-subscription", "Pick N Mix")
add(5, "/blog-on-photography/what-is-focus-in-photography", "focus in Photography")
add(5, "/photography-services-near-me/framed-fine-art-photography-prints", "Fine Art Photography Prints")
add(5, "/private-photography-lessons", "private photography lessons")
add(5, "/photographic-workshops-near-me/northumberland-landscape-photography-workshop", "Northumberland Landscape Photography")
add(5, "/photographic-workshops-near-me/poppy-fields-photography-workshop-sunset", "Poppy Fields Photography")
add(5, "/photography-news-blog", "photography news")
add(5, "/photographic-workshops-near-me/peak-district-photography-workshops-heathers-sunrise", "Peak District Photography")
add(5, "/photography-services-near-me/camera-settings-photography-field-checklists", "Photography Field Checklists")
add(5, "/photo-workshops-uk/landscape-photography-wales-photo-workshop", "Landscape photography Wales")
add(5, "/photographic-workshops-near-me/somerset-photography-workshop", "Somerset Photography")
add(5, "/blog-on-photography/whats-new-in-lightroom-classic-13", "What's New In Lightroom")
add(5, "/photography-services-near-me/beginners-photography-course", "Beginners Photography Course")
add(5, "/photography-services-near-me/lightroom-courses-for-beginners-coventry", "Lightroom Courses")
add(5, "/photography-services-near-me/foundation-digital-pack-plus", "Foundation Digital Pack")
add(5, "/photo-workshops-uk/bluebell-woodlands-photography-workshops", "Bluebell woodlands")
add(5, "/photography-payment-plan", "photography payment plan")
add(5, "/photographic-workshops-near-me/landscape-photography-workshops-yorkshire-coast", "Landscape Photography Workshop")
add(5, "/website-cookie-policy", "cookie policy")
add(5, "/blog-on-photography/iso-and-noise-control-practice-assignment", "ISO and Noise")
add(5, "/photography-services-near-me/monthly-online-photography-mentoring", "Photography Mentoring")

# --- batch 6 ---
add(6, "/copyright-policy-alan-ranger", "copyright policy")
add(6, "/photography-services-near-me/private-online-photography-classes-zoom", "online photography classes")
add(6, "/photographic-workshops-near-me/bluebell-photography-photo-workshop-warwickshire-24", "Bluebell Photography")
add(6, "/photographic-workshops-near-me/sunset-chesterton-windmill-spring", "Chesterton Windmill")
add(6, "/photographic-workshops-near-me/secrets-of-woodland-photography-masterclass-spring", "Woodland Photography")
add(6, "/photography-equipment-recommendations", "photography equipment")
add(6, "/photo-workshops-uk/yorkshire-dales-photography-workshops", "Yorkshire Dales Photography")
add(6, "/photographic-workshops-near-me/bluebell-photography-photo-workshop-warwickshire-29", "Bluebell Photography")
add(6, "/photography-services-near-me/photography-tips-pocket-guide-series", "Photography Tips")
add(6, "/data-privacy-policy", "privacy policy")
add(6, "/photographic-workshops-near-me/long-exposure-photo-workshop-sunset-kenilworth", "Long Exposure")
add(6, "/photography-services-near-me/fine-art-photography-prints-canvas", "Fine Art Photography Prints")
add(6, "/photo-workshops-uk/woodland-photography-walk-warwickshire", "Photography walk")
add(6, "/photography-masterclasses-online", "photography masterclasses")
add(6, "/hire-a-professional-photographer-in-coventry", "Photographer in Coventry")
add(6, "/photographic-workshops-near-me/abstract-and-macro-photography-workshop-coventry", "Abstract and Macro")
add(6, "/photo-workshops-uk/long-exposure-photography-kenilworth", "long exposure photography")
add(6, "/photography-services-near-me/photography-foundation-course-ebook", "Photography Foundation Course eBook")
add(6, "/blog-on-photography/what-is-contrast-in-photography", "contrast in photography")
add(6, "/photographic-workshops-near-me/batsford-arboretum-autumn-photography-1nov", "Batsford Arboretum")
add(6, "/photography-services-near-me/photography-35bundle-photography-field-checklists", "Photography Field Checklists")
add(6, "/photographic-workshops-near-me/bluebell-photography-photo-workshop-warwickshire-23", "Bluebell Photography")
add(6, "/photographic-workshops-near-me/batsford-arboretum-autumn-photography-2nov", "Batsford Arboretum")
add(6, "/photographic-workshops-near-me/batsford-arboretum-autumn-photography-29oct", "Batsford Arboretum")
add(6, "/photo-workshops-uk/long-exposure-photography-workshops-burnham", "long exposure photography")

# --- batch 7 ---
add(7, "/photographic-workshops-near-me/peak-district-photography-workshops-sunrise-heathers", "Peak District Photography")
add(7, "/photo-workshops-uk/christmas-photography-workshops", "Christmas Photography")
add(7, "/photographic-workshops-near-me/bluebell-photography-photo-workshop-warwickshire-19", "Bluebell Photography")
add(7, "/photographic-workshops-near-me/lake-district-photography-workshop-winter", "Lake District Photography")
add(7, "/photo-workshops-uk/landscape-photography-workshops-anglesey", "landscape Photography Workshop")
add(7, "/photographic-workshops-near-me/garden-photography-workshop", "Garden Photography")
add(7, "/blog-on-photography/virtual-bluebell-photoshoot", "Bluebell Photoshoot")
add(7, "/photographic-workshops-near-me/lavender-photography-workshop-sunset", "Lavender Photography")
add(7, "/photo-workshops-uk/landscape-photography-workshops-nant-mill", "nant mill")
add(7, "/course-finder-photography-classes-near-me", "photography classes near me")
add(7, "/photographic-workshops-near-me/secrets-of-woodland-photography-masterclass-autumn", "Woodland Photography")
add(7, "/contact-us-alan-ranger-photography", "contact us")
add(7, "/blog-on-photography/what-do-camera-lens-filters-do", "What do camera Lens Filters Do")
add(7, "/photographic-workshops-near-me/long-exposure-photography-workshop-kenilworth1", "Long Exposure Photography")
add(7, "/photographic-workshops-near-me/dartmoor-photography-workshop-woodlands", "Dartmoor Photography Workshop")
add(7, "/blog-on-photography/tripods-gitzo-vs-benro-review", "Tripods")
add(7, "/photographic-workshops-near-me/sunset-chesterton-windmill-photography-workshop", "Chesterton Windmill")
add(7, "/photographic-workshops-near-me/fairy-glen-photography-betws-y-coed", "fairy glen")
add(7, "/photographic-workshops-near-me/peak-district-photography-workshops-autumn-2", "Peak District Photography")
add(7, "/photo-editing-course-coventry", "photo editing course")
add(7, "/blog-on-photography/selecting-the-ideal-product-photographer", "Product Photographer")
add(7, "/photographic-workshops-near-me/nant-mill-woodlands", "Nant Mill")
add(7, "/photo-workshops-uk/wales-photography-workshop-pistyll-rhaeadr", "Wales Photography workshop")
add(7, "/blog-on-photography/professional-commercial-photography-in-coventry", "Commercial Photography")
add(7, "/photographic-workshops-near-me/bluebell-photography-photo-workshop-warwickshire-18", "Bluebell Photography")

# --- batch 8 ---
add(8, "/photographic-workshops-near-me/wales-photography-workshop-vyrnwy-pistyll-rhaeadr", "Wales Photography Workshop")
add(8, "/photographic-workshops-near-me/yorkshire-dales-photography-workshop", "Yorkshire Dales Photography")
add(8, "/photographic-workshops-near-me/peak-district-photography-workshops-heathers-sunset", "Peak District Photography")
add(8, "/blog-on-photography/what-is-depth-of-field", "DEPTH OF FIELD")
add(8, "/blog-on-photography/what-is-negative-space-in-photography", "negative Space")
add(8, "/photographic-workshops-near-me/sunset-chesterton-windmill-spring-7gw7j", "Chesterton Windmill")
add(8, "/photographic-workshops-near-me/fairy-glen-photography-wales", "fairy glen")
add(8, "/photographic-workshops-near-me/secrets-of-woodland-photography-masterclass-winter", "Woodland Photography")
add(8, "/photo-workshops-uk/landscape-photography-devon-hartland-quay", "landscape photography devon")
add(8, "/photographic-workshops-near-me/secrets-of-woodland-photography-masterclass-summer", "Woodland Photography")
add(8, "/photo-workshops-uk/landscape-photography-workshop-norfolk", "Photography Workshop Norfolk")
add(8, "/photo-workshops-uk/coastal-northumberland-photography-workshops", "Northumberland Photography")
add(8, "/rps-courses-mentoring-distinctions", "rps courses")
add(8, "/photo-workshops-uk/landscape-photography-snowdonia-workshops", "landscape photography snowdonia")
add(8, "/photo-workshops-uk/dorset-landscape-photography-workshop", "Dorset Landscape Photography")
add(8, "/photographic-workshops-near-me/dingle-kerry-ireland-photography-workshop", "Ireland Photography Workshop")
add(8, "/photo-workshops-uk/landscape-peak-district-photography-workshops-derbyshire", "Peak District Photography")
add(8, "/blog-on-photography/ultimate-guide-to-summer-landscape-photography", "Summer Landscape Photography")
add(8, "/photographic-workshops-near-me/batsford-arboretum-autumn-photography-3nov", "Batsford Arboretum")
add(8, "/photo-workshops-uk", "Photo Workshops")
add(8, "/blog-on-photography/what-is-manual-exposure-in-photography", "Manual Exposure")
add(8, "/photographic-workshops-near-me/bluebell-photography-photo-workshop-warwickshire-17", "Bluebell Photography")
add(8, "/blog-on-photography/what-is-white-balance-in-photography", "WHITE BALANCE in photography")
add(8, "/blog-on-photography/what-is-shutter-speed", "shutter Speed")
add(8, "/photographic-workshops-near-me/lavender-photography-workshop-sunset-19", "lavender photography")


# SEOSpace slug -> 06 path (when slug not present in 06 export)
PATH_ALIASES: dict[str, str] = {
    "/photography-services-near-me/photography-genre-photography-field-checklists": "/photography-services-near-me/photography-35bundle-photography-field-checklists",
}


def load_06_paths() -> dict[str, str]:
    out: dict[str, str] = {}
    with P06.open(encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            u = (row.get("url") or "").strip()
            if not u:
                continue
            path = urlparse(u).path.rstrip("/") or "/"
            out[path] = u
    return out


def batch_tag(notes: str) -> int | None:
    notes = (notes or "").strip()
    m = re.match(r"^batch(\d+)", notes, re.I)
    if not m:
        return None
    return int(m.group(1))


def main() -> None:
    by_path = load_06_paths()
    missing: list[tuple[int, str, str]] = []
    new_rows: list[tuple[str, str, str, str]] = []

    for b, path, kw in BATCHES:
        key = path.rstrip("/") or "/"
        alias_path = PATH_ALIASES.get(path)
        if alias_path is not None:
            key = alias_path.rstrip("/") or "/"
        if key not in by_path:
            missing.append((b, path, kw))
            continue
        url = by_path[key]
        new_rows.append((url, kw, "seospace_screenshot", f"batch{b}"))

    # Drop duplicate URLs (e.g. genre checklist alias + 35-bundle row)
    deduped: list[tuple[str, str, str, str]] = []
    seen_u: set[str] = set()
    for r in new_rows:
        if r[0] in seen_u:
            continue
        seen_u.add(r[0])
        deduped.append(r)
    new_rows = deduped

    seen_new_urls = {r[0] for r in new_rows}

    # stable order: batch then original order
    # new_rows already in BATCHES order

    kept: list[dict[str, str]] = []
    with P07.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or ["url", "target_keyword", "source", "notes"]
        for row in reader:
            n = row.get("notes") or ""
            bt = batch_tag(n)
            if bt is not None and 1 <= bt <= 8:
                continue
            if (row.get("url") or "").rstrip("/") == "https://www.alanranger.com/404":
                continue
            kept.append({k: row.get(k, "") for k in fieldnames})

    kept = [row for row in kept if (row.get("url") or "").strip() not in seen_new_urls]

    out_rows = []
    for r in new_rows:
        out_rows.append(
            {"url": r[0], "target_keyword": r[1], "source": r[2], "notes": r[3]}
        )
    for row in kept:
        out_rows.append(row)

    with P07.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["url", "target_keyword", "source", "notes"], lineterminator="\n")
        w.writeheader()
        w.writerows(out_rows)

    print("Wrote", len(out_rows), "rows to 07 (reconciled batches 1-8 + kept batch9+).")
    print("New batch1-8 rows with 06 match:", len(new_rows))
    if missing:
        print("MISSING in 06 (", len(missing), "):")
        for b, p, kw in missing:
            print(f"  batch{b} {p} | {kw}")


if __name__ == "__main__":
    main()
