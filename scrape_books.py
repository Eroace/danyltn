#!/usr/bin/env python3
"""
scrape_books.py — Extraction books.toscrape.com -> CSV (Nom, Prix, Stock)

Conçu pour la mission : récupérer Nom / Prix actuel / Statut du stock.
Stdlib uniquement (aucune dépendance à installer).

Exemples
--------
# Catégorie Travel (11 livres sur ce site) :
python3 scrape_books.py

# 30 premiers produits visibles (catalogue principal, pagination auto) :
python3 scrape_books.py --url "https://books.toscrape.com/catalogue/page-1.html" --limit 30

# Une catégorie qui contient >= 30 produits (ex. Mystery = 32) :
python3 scrape_books.py \
    --url "https://books.toscrape.com/catalogue/category/books/mystery_3/index.html" \
    --limit 30 --output mystery.csv

Note BrowserAct
---------------
books.toscrape.com renvoie parfois 403 aux IP datacenter / clients automatisés.
Dans ce cas, passer par le moteur stealth + proxy résidentiel de BrowserAct :

    browser-act get-skills core --skill-version 2.0.2
    browser-act stealth-extract "<url>" --content-type html --dynamic-proxy <region>

puis alimenter ce parseur avec le HTML récupéré (option --html-file).
"""
from __future__ import annotations

import argparse
import csv
import re
import sys
import time
from html import unescape
from urllib.parse import urljoin
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

DEFAULT_URL = "https://books.toscrape.com/catalogue/category/books/travel_2/index.html"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36")

# Un bloc <article class="product_pod"> par produit.
ARTICLE_RE = re.compile(r'<article\s+class="product_pod">(.*?)</article>', re.S)
TITLE_RE = re.compile(r'<h3>\s*<a[^>]*\stitle="([^"]*)"', re.S)
PRICE_RE = re.compile(r'<p\s+class="price_color">\s*([^<]+?)\s*</p>', re.S)
AVAIL_RE = re.compile(r'<p\s+class="instock availability">(.*?)</p>', re.S)
NEXT_RE = re.compile(r'<li\s+class="next">\s*<a\s+href="([^"]+)"', re.S)
TAG_RE = re.compile(r"<[^>]+>")


def fetch(url: str, retries: int = 3) -> str:
    """Récupère une page HTML avec UA navigateur et back-off exponentiel."""
    last = None
    for attempt in range(retries):
        try:
            req = Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
            with urlopen(req, timeout=20) as resp:
                raw = resp.read()
            # le site sert de l'UTF-8 (avec un £ parfois mal encodé) : on décode proprement
            return raw.decode("utf-8", errors="replace")
        except (HTTPError, URLError) as exc:
            last = exc
            wait = 2 ** attempt
            print(f"[warn] {url} -> {exc} (retry dans {wait}s)", file=sys.stderr)
            time.sleep(wait)
    raise SystemExit(
        f"[erreur] Impossible de récupérer {url} : {last}\n"
        "Si c'est un 403 anti-bot, utilise BrowserAct stealth-extract + proxy résidentiel "
        "puis relance avec --html-file (voir docstring)."
    )


def clean_price(price: str) -> str:
    """Nettoie le symbole £ mal encodé (Â£) éventuel."""
    return price.replace("Â", "").strip()


def stock_status(avail_html: str) -> str:
    text = TAG_RE.sub("", avail_html)
    text = unescape(text).strip().lower()
    return "En stock" if "in stock" in text else "Rupture"


def parse_products(html: str) -> list[dict]:
    products = []
    for block in ARTICLE_RE.findall(html):
        title = TITLE_RE.search(block)
        price = PRICE_RE.search(block)
        avail = AVAIL_RE.search(block)
        if not (title and price):
            continue
        products.append({
            "Nom": unescape(title.group(1)).strip(),
            "Prix": clean_price(price.group(1)),
            "Stock": stock_status(avail.group(1)) if avail else "Inconnu",
        })
    return products


def collect(start_url: str, limit: int) -> list[dict]:
    """Suit la pagination (li.next) jusqu'à atteindre `limit` produits."""
    out: list[dict] = []
    url = start_url
    while url and len(out) < limit:
        html = fetch(url)
        page = parse_products(html)
        if not page:
            break
        out.extend(page)
        nxt = NEXT_RE.search(html)
        url = urljoin(url, nxt.group(1)) if nxt else None
    return out[:limit]


def main() -> int:
    ap = argparse.ArgumentParser(description="Extraction books.toscrape.com -> CSV")
    ap.add_argument("--url", default=DEFAULT_URL, help="URL de départ (catégorie ou page catalogue)")
    ap.add_argument("--limit", type=int, default=30, help="Nombre max de produits (défaut 30)")
    ap.add_argument("--output", default="books.csv", help="Fichier CSV de sortie")
    ap.add_argument("--html-file", help="Parser un HTML déjà récupéré (ex. via BrowserAct) au lieu de fetch")
    args = ap.parse_args()

    if args.html_file:
        with open(args.html_file, encoding="utf-8") as fh:
            products = parse_products(fh.read())[: args.limit]
    else:
        products = collect(args.url, args.limit)

    if not products:
        print("[erreur] Aucun produit extrait.", file=sys.stderr)
        return 1

    with open(args.output, "w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=["Nom", "Prix", "Stock"])
        writer.writeheader()
        writer.writerows(products)

    print(f"[ok] {len(products)} produits écrits dans {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
