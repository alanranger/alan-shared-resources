import csv
import re
import collections
from urllib.parse import urlparse

path = r"G:\Dropbox\alan ranger photography\Website Code\alan-shared-resources\csv\alanranger.com_-backlink-data-seospace.csv"


def extract_urls(cell: str) -> list:
    if not cell:
        return []
    return re.findall(r"https?://[^\s\"<>]+", cell, flags=re.I)


def parse_spam(s: str):
    s = (s or "").strip()
    if s in ("", "-", "N/A", "n/a"):
        return None
    try:
        return int(float(s))
    except ValueError:
        return None


def main():
    rows = []
    with open(path, newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cell = row.get("Linking Page + URL") or ""
            urls = extract_urls(cell)
            link_url = urls[-1] if urls else ""
            spam = parse_spam(row.get("Spam Score"))
            rows.append({"link_url": link_url, "spam": spam})

    low = lambda u: u.lower()

    print("row_count", len(rows))
    print("parsed with http url", sum(1 for r in rows if r["link_url"]))
    print("missing url", sum(1 for r in rows if not r["link_url"]))

    loose_links = sum(
        1
        for r in rows
        if r["link_url"] and ("links" in low(r["link_url"]) or "backlink" in low(r["link_url"]))
    )
    print('URLs containing "backlink" substring', sum(1 for r in rows if r["link_url"] and "backlink" in low(r["link_url"])))
    print('URLs containing "links" substring', sum(1 for r in rows if r["link_url"] and "links" in low(r["link_url"])))
    print("URLs containing links OR backlink (loose)", loose_links)

    spams = [r["spam"] for r in rows if r["spam"] is not None]
    print("rows with numeric spam", len(spams), "without", sum(1 for r in rows if r["spam"] is None))

    high = [r for r in rows if r["spam"] is not None and r["spam"] >= 50]
    print("spam>=50", len(high))
    h_loose = sum(
        1
        for r in high
        if r["link_url"] and ("links" in low(r["link_url"]) or "backlink" in low(r["link_url"]))
    )
    print("spam>=50 AND (links|backlink) in url", h_loose)

    def host(u: str) -> str:
        try:
            return urlparse(u).netloc.lower()
        except Exception:
            return ""

    ctr = collections.Counter()
    for r in rows:
        if r["spam"] is not None and r["spam"] >= 40 and r["link_url"]:
            h = host(r["link_url"])
            if h.startswith("www."):
                h = h[4:]
            ctr[h] += 1
    print("\nTop 30 domains (spam>=40):")
    for d, c in ctr.most_common(30):
        print(c, d)

    path_kw = collections.Counter()
    toks = [
        "link",
        "links",
        "backlink",
        "backlinks",
        "seo",
        "directory",
        "resources",
        "submit",
        "add-url",
        "partners",
    ]
    for r in rows:
        if r["spam"] is None or r["spam"] < 40 or not r["link_url"]:
            continue
        u = r["link_url"].lower()
        p = urlparse(r["link_url"]).path.lower()
        for tok in toks:
            if tok in p or tok in u:
                path_kw[tok] += 1
    print("\nkeyword hits in spam>=40 rows (url loose):", path_kw.most_common(20))

    seo_anom = sum(1 for r in rows if r["link_url"] and "seo-anomaly" in low(r["link_url"]))
    print("\nseo-anomaly in URL", seo_anom)

    # Substring frequency for high-spam hosts (2nd label)
    host_prefix = collections.Counter()
    for r in rows:
        if r["spam"] is None or r["spam"] < 50 or not r["link_url"]:
            continue
        h = host(r["link_url"])
        if h.startswith("www."):
            h = h[4:]
        parts = h.split(".")
        if len(parts) >= 2:
            host_prefix[".".join(parts[-2:])] += 1
    print("\nTop 20 registrable domains (spam>=50):")
    for d, c in host_prefix.most_common(20):
        print(c, d)

    # Low spam rows that still match links/backlink
    risk = [
        r["link_url"]
        for r in rows
        if r["link_url"]
        and ("links" in low(r["link_url"]) or "backlink" in low(r["link_url"]))
        and (r["spam"] is None or r["spam"] < 30)
    ]
    print("\nlow/unknown spam with links|backlink count", len(risk))
    for u in risk[:20]:
        print(" ", u[:130])


def coverage():
    rows = []
    with open(path, newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cell = row.get("Linking Page + URL") or ""
            urls = extract_urls(cell)
            link_url = urls[-1] if urls else ""
            spam = parse_spam(row.get("Spam Score"))
            rows.append({"link_url": link_url, "spam": spam})

    low = lambda u: u.lower()

    def host(u: str) -> str:
        try:
            h = urlparse(u).netloc.lower()
            if h.startswith("www."):
                h = h[4:]
            return h
        except Exception:
            return ""

    patterns = [
        ("p_seo_anomaly_host", lambda r: "seo-anomaly" in host(r["link_url"])),
        ("p_seo_anomaly_url", lambda r: "seo-anomaly" in low(r["link_url"])),
        ("p_bhs_links", lambda r: "bhs-links" in low(r["link_url"])),
        ("p_dark_side_links", lambda r: "dark-side-links" in low(r["link_url"])),
        ("p_quarterlinks", lambda r: "quarterlinks" in low(r["link_url"])),
        ("p_url_backlink", lambda r: "backlink" in low(r["link_url"])),
        ("p_url_links_token", lambda r: re.search(r"links", low(r["link_url"])) is not None),
        ("p_compositing", lambda r: host(r["link_url"]) == "compositingmentor.com"),
    ]

    print("\n--- Pattern hit counts (all rows) ---")
    for name, pred in patterns:
        n = sum(1 for r in rows if r["link_url"] and pred(r))
        print(name, n)

    def safe_spam(r):
        return r["spam"] if r["spam"] is not None else -1

    print("\n--- Pattern hits where spam<30 (heuristic false-positive risk) ---")
    for name, pred in patterns:
        n = sum(1 for r in rows if r["link_url"] and pred(r) and safe_spam(r) < 30)
        print(name, n)

    print("\n--- compositingmentor.com spam distribution ---")
    cm = [r for r in rows if host(r["link_url"]) == "compositingmentor.com"]
    sc = collections.Counter(r["spam"] for r in cm)
    for k in sorted(sc, key=lambda x: (x is None, x or 0)):
        print(k, sc[k])

    # Suggest url_from not_like DFS-style patterns (substring)
    print("\n--- Extra substring counts (spam>=50) ---")
    hi = [r for r in rows if r["spam"] is not None and r["spam"] >= 50]
    subs = [
        "seo-anomaly",
        "bhs-links",
        "dark-side-links",
        "quarterlinks",
        "usefullinks",
        "free-backlink",
        "backlinks",
        "link-building",
        "linkbuilding",
    ]
    uall = "\n".join(low(r["link_url"]) for r in hi if r["link_url"])
    for s in subs:
        print(s, uall.count(s))


def path_mining():
    rows = []
    with open(path, newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cell = row.get("Linking Page + URL") or ""
            urls = extract_urls(cell)
            link_url = urls[-1] if urls else ""
            spam = parse_spam(row.get("Spam Score"))
            rows.append((link_url.lower(), spam))

    hi = [(u, sp) for u, sp in rows if sp is not None and sp >= 50]
    seg = collections.Counter()
    for u, _sp in hi:
        p = urlparse(u).path.lower()
        for part in p.replace("_", "-").split("/"):
            if len(part) < 5:
                continue
            if any(x in part for x in ("alanranger", "photography")):
                continue
            if any(x in part for x in ("seo", "link", "backlink", "anomaly")):
                seg[part] += 1
    print("\n--- top path segments spam>=50 (link/seo related) ---")
    for k, v in seg.most_common(50):
        if v >= 3:
            print(v, k)

    extra = [
        "usefullinks",
        "dofollow-article",
        "article-links",
        "link-building",
        "white-hat-link",
    ]
    print("\n--- substring counts spam>=50 ---")
    for s in extra:
        c = sum(1 for u, sp in hi if s in u)
        print(s, c)


if __name__ == "__main__":
    main()
    coverage()
    path_mining()
