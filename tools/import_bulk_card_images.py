#!/usr/bin/env python3
"""Bulk exact-front importer for Collectors Sports.

The importer is deliberately conservative: a front is accepted only when the public
card page matches collection, card number and player. It obeys robots.txt and never
uses blocked image paths. Images are cached as small same-origin WebP files so the PWA
does not repeatedly hotlink the source.
"""
from __future__ import annotations

import hashlib
import io
import json
import os
import re
import time
import unicodedata
import urllib.parse
import urllib.robotparser
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TARGETS_FILE = ROOT / 'data' / 'image-targets-runtime.json'
MANIFEST_FILE = ROOT / 'data' / 'bulk-image-manifest.json'
REPORT_FILE = ROOT / 'data' / 'bulk-image-report.json'
OUT_JS = ROOT / 'catalog-images-bulk.js'
ASSET_ROOT = ROOT / 'assets' / 'cards' / 'bulk'

USER_AGENT = 'CollectorsSportsCatalog/1.0 (+https://github.com/alandealba31-sketch/collectors-sports)'
SESSION = requests.Session()
SESSION.headers.update({
    'User-Agent': USER_AGENT,
    'Accept-Language': 'en-US,en;q=0.8',
})
REQUEST_DELAY = float(os.environ.get('IMAGE_IMPORT_DELAY', '0.25'))
MAX_NEW = int(os.environ.get('IMAGE_IMPORT_MAX_NEW', '2500'))

ROBOTS: dict[str, urllib.robotparser.RobotFileParser] = {}
LAST_REQUEST = 0.0


def throttle() -> None:
    global LAST_REQUEST
    wait = REQUEST_DELAY - (time.monotonic() - LAST_REQUEST)
    if wait > 0:
        time.sleep(wait)
    LAST_REQUEST = time.monotonic()


def normalize(value: str) -> str:
    value = unicodedata.normalize('NFKD', value or '')
    value = ''.join(c for c in value if not unicodedata.combining(c))
    value = value.lower().replace('&', ' and ')
    return re.sub(r'[^a-z0-9]+', ' ', value).strip()


def name_matches(player: str, text: str) -> bool:
    p = normalize(player)
    t = normalize(text)
    if not p:
        return False
    if p in t:
        return True
    tokens = [x for x in p.split() if len(x) > 1]
    if not tokens:
        return False
    hits = sum(1 for token in tokens if token in t.split())
    return hits >= max(1, round(len(tokens) * 0.8))


def robots_for(url: str) -> urllib.robotparser.RobotFileParser:
    parsed = urllib.parse.urlsplit(url)
    root = f'{parsed.scheme}://{parsed.netloc}'
    if root not in ROBOTS:
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(root + '/robots.txt')
        try:
            rp.read()
        except Exception:
            # Unknown robots policy: fail closed for automated bulk ingestion.
            rp.disallow_all = True
        ROBOTS[root] = rp
    return ROBOTS[root]


def allowed(url: str) -> bool:
    try:
        return robots_for(url).can_fetch(USER_AGENT, url)
    except Exception:
        return False


def get(url: str, *, binary: bool = False, timeout: int = 25):
    if not allowed(url):
        raise PermissionError(f'robots.txt blocks {url}')
    throttle()
    response = SESSION.get(url, timeout=timeout, allow_redirects=True)
    response.raise_for_status()
    if not allowed(response.url):
        raise PermissionError(f'robots.txt blocks redirect {response.url}')
    return response.content if binary else response.text


def load_json(path: Path, default):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except Exception:
        return default


def exact_keys_already_in_repo() -> set[str]:
    exact: set[str] = set()
    entry_re = re.compile(r"(?P<quote>['\"])(?P<key>[^'\"]+\|[^'\"]+)(?P=quote)\s*:\s*\{(?P<body>.*?)(?:\n\s*\}|\},)", re.S)
    kind_re = re.compile(r"(?:['\"]?kind['\"]?)\s*:\s*['\"]exact['\"]")
    for path in ROOT.glob('catalog-images*.js'):
        if path.name == OUT_JS.name:
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except Exception:
            continue
        for match in entry_re.finditer(text):
            if kind_re.search(match.group('body')):
                exact.add(match.group('key'))
    return exact


def row_key(collection_id: str, row: dict) -> str:
    base = f"{collection_id}|{row['number']}"
    return f"{base}|{row['entryKey']}" if row.get('entryKey') else base


def subset_allowed(row: dict, source: dict) -> bool:
    allowed_subsets = source.get('allowedSubsets') or []
    if not allowed_subsets:
        return True
    return (row.get('subset') or '') in allowed_subsets


def tcdb_card_links(source: dict, desired_numbers: set[str]) -> dict[str, list[str]]:
    sid = source['sid']
    links: dict[str, list[str]] = {number: [] for number in desired_numbers}
    seen_hrefs: set[str] = set()
    empty_pages = 0
    for page in range(1, 15):
        url = f'https://www.tcdb.com/Checklist.cfm/sid/{sid}?PageIndex={page}'
        try:
            html = get(url)
        except Exception as exc:
            print(f'  ! checklist page {page}: {exc}')
            break
        soup = BeautifulSoup(html, 'html.parser')
        found_this_page = 0
        for a in soup.find_all('a', href=True):
            href = a.get('href', '')
            if 'ViewCard.cfm' not in href or f'/sid/{sid}/' not in href:
                continue
            number = a.get_text(' ', strip=True).lstrip('#')
            if number not in desired_numbers:
                continue
            full = urllib.parse.urljoin('https://www.tcdb.com/', href)
            if full in seen_hrefs:
                continue
            seen_hrefs.add(full)
            links[number].append(full)
            found_this_page += 1
        if found_this_page == 0:
            empty_pages += 1
            if page > 1 and empty_pages >= 2:
                break
        else:
            empty_pages = 0
    return links


def page_is_exact(html: str, source: dict, row: dict) -> bool:
    soup = BeautifulSoup(html, 'html.parser')
    title = soup.title.get_text(' ', strip=True) if soup.title else ''
    visible = soup.get_text(' ', strip=True)
    hay = f'{title} {visible[:5000]}'
    number = re.escape(str(row['number']))
    number_ok = bool(re.search(rf'#\s*{number}(?:\D|$)', hay, re.I))
    player_ok = name_matches(row['player'], hay)
    set_tokens = [x for x in normalize(source.get('setName', '')).split() if len(x) > 3]
    normalized_hay = normalize(hay)
    set_ok = not set_tokens or sum(1 for token in set_tokens if token in normalized_hay.split()) >= max(2, round(len(set_tokens) * 0.65))
    return number_ok and player_ok and set_ok


def candidate_fronts(html: str, page_url: str) -> list[tuple[int, str]]:
    soup = BeautifulSoup(html, 'html.parser')
    candidates: list[tuple[int, str]] = []
    for img in soup.find_all('img'):
        alt = str(img.get('alt') or '')
        for attr in ('src', 'data-src', 'data-original', 'data-lazy-src'):
            raw = img.get(attr)
            if not raw:
                continue
            url = urllib.parse.urljoin(page_url, raw)
            lower = (alt + ' ' + url).lower()
            if any(word in lower for word in ('placeholder', 'logo', 'youtube', 'facebook', 'twitter', 'icon', 'avatar', 'adserver', 'banner')):
                continue
            if 'back' in alt.lower() or 'cardback' in lower:
                continue
            score = 0
            if 'front' in alt.lower():
                score += 8
            if '/images/cards/' in url.lower():
                score += 6
            if '/images/large/' in url.lower():
                score += 2  # robots check below usually rejects this path.
            if re.search(r'\.(?:jpe?g|png|webp)(?:\?|$)', url, re.I):
                score += 2
            width = str(img.get('width') or '')
            height = str(img.get('height') or '')
            if width.isdigit() and int(width) >= 180:
                score += 1
            if height.isdigit() and int(height) >= 240:
                score += 1
            if score and allowed(url):
                candidates.append((score, url))
    dedup: dict[str, int] = {}
    for score, url in candidates:
        dedup[url] = max(score, dedup.get(url, 0))
    return sorted(((score, url) for url, score in dedup.items()), reverse=True)


def save_image(raw: bytes, path: Path) -> bool:
    try:
        with Image.open(io.BytesIO(raw)) as image:
            image = image.convert('RGB')
            if image.width < 150 or image.height < 200:
                return False
            # Portrait card scans only. Reject obvious banners/logos.
            ratio = image.width / max(image.height, 1)
            if ratio < 0.45 or ratio > 0.90:
                return False
            image.thumbnail((520, 760), Image.Resampling.LANCZOS)
            path.parent.mkdir(parents=True, exist_ok=True)
            image.save(path, format='WEBP', quality=72, method=6)
        return True
    except Exception:
        return False


def import_tcdb(collection_id: str, payload: dict, manifest: dict, existing_exact: set[str], budget: int) -> tuple[int, dict]:
    source = payload['source']
    rows = [row for row in payload['rows'] if subset_allowed(row, source)]
    pending = [row for row in rows if row_key(collection_id, row) not in manifest and row_key(collection_id, row) not in existing_exact]
    stats = {
        'catalogRows': len(payload['rows']),
        'eligibleBaseRows': len(rows),
        'alreadyExact': len(rows) - len(pending),
        'newExact': 0,
        'noCardPage': 0,
        'identityRejected': 0,
        'noAllowedFront': 0,
        'imageRejected': 0,
        'errors': 0,
    }
    if not pending or budget <= 0:
        return 0, stats

    desired_numbers = {row['number'] for row in pending}
    print(f'[{collection_id}] indexing TCDB set {source["sid"]}: {len(pending)} pending base rows')
    links = tcdb_card_links(source, desired_numbers)
    imported = 0
    debug_missing = 0

    for row in pending:
        if imported >= budget:
            break
        key = row_key(collection_id, row)
        candidates = links.get(row['number']) or []
        if not candidates:
            stats['noCardPage'] += 1
            continue
        accepted = False
        identity_seen = False
        for page_url in candidates:
            try:
                html = get(page_url)
            except Exception as exc:
                stats['errors'] += 1
                if stats['errors'] <= 8:
                    print(f'  ! {key}: card page error: {exc}')
                continue
            if not page_is_exact(html, source, row):
                continue
            identity_seen = True
            fronts = candidate_fronts(html, page_url)
            if not fronts:
                continue
            for _score, image_url in fronts:
                try:
                    raw = get(image_url, binary=True)
                except Exception:
                    continue
                digest = hashlib.sha1(key.encode('utf-8')).hexdigest()[:10]
                safe_number = re.sub(r'[^A-Za-z0-9._-]+', '-', row['number']).strip('-') or 'card'
                rel = Path('assets') / 'cards' / 'bulk' / collection_id / f'{safe_number}-{digest}.webp'
                path = ROOT / rel
                if not save_image(raw, path):
                    continue
                manifest[key] = {
                    'front': './' + rel.as_posix(),
                    'kind': 'exact',
                    'variant': row.get('variant') or 'Base',
                    'source': 'Trading Card Database',
                    'sourcePage': page_url,
                    'sourceImageUrl': image_url,
                    'label': f"{row['player']} #{row['number']} — frente exacto verificado",
                    'verified': [source.get('setName', ''), row['number'], row['player'], row.get('subset') or 'Base'],
                    'verifiedAt': time.strftime('%Y-%m-%d'),
                }
                imported += 1
                stats['newExact'] += 1
                accepted = True
                if imported % 25 == 0:
                    print(f'  + {imported} exact fronts imported for {collection_id}')
                break
            if accepted:
                break
        if accepted:
            continue
        if identity_seen:
            stats['noAllowedFront'] += 1
            if debug_missing < 8:
                print(f'  - {key}: exact identity found, but no robots-allowed usable front')
                debug_missing += 1
        else:
            stats['identityRejected'] += 1

    return imported, stats


def write_manifest(manifest: dict) -> None:
    MANIFEST_FILE.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_FILE.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + '\n', encoding='utf-8')


def write_js(manifest: dict) -> None:
    payload = json.dumps(manifest, ensure_ascii=False, separators=(',', ':'))
    js = f"""// Generated by tools/import_bulk_card_images.py. Do not edit by hand.\n// Exact fronts are identity-verified and cached locally; source metadata remains attached.\n(() => {{\n  const root = window.CS_IMAGE_CATALOG = window.CS_IMAGE_CATALOG || {{collections:{{}},cards:{{}}}};\n  root.cards = root.cards || {{}};\n  Object.assign(root.cards, {payload});\n}})();\n"""
    OUT_JS.write_text(js, encoding='utf-8')


def main() -> None:
    targets = load_json(TARGETS_FILE, {})
    if not targets:
        raise SystemExit(f'No runtime targets found at {TARGETS_FILE}')
    manifest = load_json(MANIFEST_FILE, {})
    existing_exact = exact_keys_already_in_repo()
    before = len(manifest)
    remaining = MAX_NEW
    report = {
        'startedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'maxNew': MAX_NEW,
        'collections': {},
    }

    for collection_id, payload in targets.items():
        if remaining <= 0:
            break
        provider = payload.get('source', {}).get('provider')
        if provider != 'tcdb':
            continue
        try:
            count, stats = import_tcdb(collection_id, payload, manifest, existing_exact, remaining)
        except Exception as exc:
            print(f'[{collection_id}] fatal source error: {exc}')
            count, stats = 0, {'fatalError': str(exc)}
        remaining -= count
        report['collections'][collection_id] = stats
        write_manifest(manifest)
        write_js(manifest)

    report['finishedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    report['manifestExactFronts'] = len(manifest)
    report['newExactFrontsThisRun'] = len(manifest) - before
    REPORT_FILE.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    write_manifest(manifest)
    write_js(manifest)
    print(f"Bulk image import complete: +{report['newExactFrontsThisRun']} exact fronts; {len(manifest)} in bulk manifest.")


if __name__ == '__main__':
    main()
