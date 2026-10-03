#!/usr/bin/env python3
"""Import exact card fronts from ISO's public card archive API.

ISO documents /public as a free, anonymous JSON API and provides stable /public/images
URLs. This script stores identity metadata plus the stable image URL; it does not copy
price data or marketplace transaction data.
"""
from __future__ import annotations

import json
import os
import re
import time
import unicodedata
import urllib.parse
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
TARGETS_FILE = ROOT / 'data' / 'image-targets-runtime.json'
MANIFEST_FILE = ROOT / 'data' / 'bulk-image-manifest.json'
REPORT_FILE = ROOT / 'data' / 'bulk-image-report.json'
OUT_JS = ROOT / 'catalog-images-bulk.js'
BASE = 'https://isothis.shop'
MAX_NEW = int(os.environ.get('IMAGE_IMPORT_MAX_NEW', '2500'))
DELAY = float(os.environ.get('ISO_IMAGE_IMPORT_DELAY', '0.55'))
SESSION = requests.Session()
SESSION.headers.update({'User-Agent': 'CollectorsSportsCatalog/1.1 (+https://github.com/alandealba31-sketch/collectors-sports)', 'Accept': 'application/json'})
LAST = 0.0


def throttle():
    global LAST
    wait = DELAY - (time.monotonic() - LAST)
    if wait > 0:
        time.sleep(wait)
    LAST = time.monotonic()


def norm(value):
    value = unicodedata.normalize('NFKD', str(value or ''))
    value = ''.join(c for c in value if not unicodedata.combining(c)).lower().replace('&', ' and ')
    return re.sub(r'[^a-z0-9]+', ' ', value).strip()


def tokens(value):
    return [x for x in norm(value).split() if len(x) > 1]


def fuzzy_name(a, b):
    na, nb = norm(a), norm(b)
    if not na or not nb:
        return False
    if na == nb or na in nb or nb in na:
        return True
    ta, tb = set(tokens(a)), set(tokens(b))
    return bool(ta) and len(ta & tb) >= max(1, round(len(ta) * 0.8))


def set_match(expected, actual):
    e, a = set(tokens(expected)), set(tokens(actual))
    if not e or not a:
        return False
    # Ignore generic words that vary between providers while demanding the distinctive set identity.
    generic = {'cards', 'card', 'club', 'competitions', 'competition'}
    e2 = {x for x in e if x not in generic}
    return len(e2 & a) >= max(2, round(len(e2) * 0.75))


def number_match(expected, actual):
    e, a = norm(expected), norm(actual)
    if e == a:
        return True
    # Some providers format base numbers as 10/200; accept the printed leading number only.
    return bool(e and (a.startswith(e + ' ') or a.startswith(e + '/')))


def is_base_variant(value):
    v = norm(value)
    return v in {'', 'base', 'base card', 'base cards', 'standard'}


def load_json(path, default):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except Exception:
        return default


def row_key(collection_id, row):
    base = f"{collection_id}|{row['number']}"
    return f"{base}|{row['entryKey']}" if row.get('entryKey') else base


def subset_allowed(row, source):
    allowed = source.get('allowedSubsets') or []
    return not allowed or (row.get('subset') or '') in allowed


def request_json(path, params=None):
    throttle()
    r = SESSION.get(BASE + path, params=params or {}, timeout=30)
    if r.status_code == 429:
        time.sleep(float(r.headers.get('Retry-After', '2')))
        throttle()
        r = SESSION.get(BASE + path, params=params or {}, timeout=30)
    r.raise_for_status()
    return r.json()


def unpack_products(payload):
    if isinstance(payload, list):
        return payload
    if not isinstance(payload, dict):
        return []
    for key in ('products', 'data', 'items', 'results'):
        value = payload.get(key)
        if isinstance(value, list):
            return value
        if isinstance(value, dict):
            for sub in ('products', 'items', 'results', 'data'):
                if isinstance(value.get(sub), list):
                    return value[sub]
    return []


def image_url(product):
    for key in ('image_url', 'image', 'imageUrl'):
        value = product.get(key)
        if isinstance(value, str) and value:
            return urllib.parse.urljoin(BASE, value)
        if isinstance(value, dict):
            for sub in ('url', 'src', 'public_url', 'key'):
                v = value.get(sub)
                if isinstance(v, str) and v:
                    if sub == 'key' and not v.startswith('/'):
                        return f'{BASE}/public/images/{urllib.parse.quote(v, safe="")}'
                    return urllib.parse.urljoin(BASE, v)
    for key in ('image_key', 'imageKey'):
        value = product.get(key)
        if value:
            return f'{BASE}/public/images/{urllib.parse.quote(str(value), safe="")}'
    return ''


def candidate_identity(product):
    return {
        'name': product.get('name') or product.get('player') or product.get('title') or '',
        'set': product.get('set') or product.get('set_name') or product.get('node_name') or '',
        'year': product.get('year') or '',
        'number': product.get('card_number') or product.get('number') or '',
        'variant': product.get('variant') or '',
        'grader': product.get('grader') or '',
        'grade': product.get('grade') or '',
        'category': product.get('category') or '',
    }


def exact_candidate(product, source, row):
    ident = candidate_identity(product)
    if ident['grader'] or ident['grade']:
        return False
    if ident['category'] and norm(ident['category']) not in {'sports card', 'sports cards', 'sport card'}:
        return False
    if not fuzzy_name(row['player'], ident['name']):
        return False
    if not number_match(row['number'], ident['number']):
        return False
    if not set_match(source['setName'], ident['set']):
        return False
    expected_year = re.search(r'20\d{2}', source['setName'])
    actual_year = re.search(r'20\d{2}', str(ident['year']))
    if expected_year and actual_year and expected_year.group() != actual_year.group():
        return False
    if not is_base_variant(ident['variant']):
        return False
    return bool(image_url(product))


def query_candidates(source, row):
    queries = [
        f"{source['setName']} {row['player']} {row['number']}",
        f"{row['player']} #{row['number']} {source['setName']}",
    ]
    seen = set()
    products = []
    for q in queries:
        try:
            payload = request_json('/public/products', {'q': q, 'category': 'sports_card', 'limit': 12})
        except requests.HTTPError as exc:
            if exc.response is not None and exc.response.status_code == 404:
                return [], 'archive-dark'
            raise
        for product in unpack_products(payload):
            if not isinstance(product, dict):
                continue
            ident = str(product.get('id') or product.get('product_id') or product.get('slug') or json.dumps(product, sort_keys=True)[:200])
            if ident not in seen:
                seen.add(ident)
                products.append(product)
        if any(exact_candidate(p, source, row) for p in products):
            break
    return products, ''


def write_outputs(manifest, report):
    MANIFEST_FILE.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_FILE.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    payload = json.dumps(manifest, ensure_ascii=False, separators=(',', ':'))
    OUT_JS.write_text("// Generated by tools/import_iso_exact_images.py.\n(() => {\n  const root = window.CS_IMAGE_CATALOG = window.CS_IMAGE_CATALOG || {collections:{},cards:{}};\n  root.cards = root.cards || {};\n  Object.assign(root.cards, " + payload + ");\n})();\n", encoding='utf-8')
    REPORT_FILE.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main():
    targets = load_json(TARGETS_FILE, {})
    manifest = load_json(MANIFEST_FILE, {})
    before = len(manifest)
    remaining = MAX_NEW
    report = {'provider': 'ISO Card Archive', 'startedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'maxNew': MAX_NEW, 'collections': {}}
    archive_dark = False

    for collection_id, payload in targets.items():
        if remaining <= 0 or archive_dark:
            break
        source = payload['source']
        rows = [r for r in payload['rows'] if subset_allowed(r, source)]
        stats = {'eligible': len(rows), 'alreadyExactBulk': 0, 'newExact': 0, 'notFound': 0, 'rejected': 0, 'errors': 0}
        print(f'[{collection_id}] ISO exact-front pass: {len(rows)} eligible identities')
        for row in rows:
            if remaining <= 0:
                break
            key = row_key(collection_id, row)
            if key in manifest:
                stats['alreadyExactBulk'] += 1
                continue
            try:
                products, status = query_candidates(source, row)
            except Exception as exc:
                stats['errors'] += 1
                if stats['errors'] <= 8:
                    print(f'  ! {key}: {exc}')
                continue
            if status == 'archive-dark':
                print('  ! ISO sports-card catalog endpoint currently returns 404; stopping cleanly.')
                archive_dark = True
                break
            exact = next((p for p in products if exact_candidate(p, source, row)), None)
            if not exact:
                if products:
                    stats['rejected'] += 1
                else:
                    stats['notFound'] += 1
                continue
            url = image_url(exact)
            product_id = exact.get('id') or exact.get('product_id') or exact.get('slug') or ''
            manifest[key] = {
                'front': url,
                'kind': 'exact',
                'variant': row.get('variant') or 'Base',
                'source': 'ISO Card Archive',
                'sourcePage': f"{BASE}/public/products/{product_id}" if product_id else BASE + '/developers',
                'label': f"{row['player']} #{row['number']} — frente exacto verificado",
                'verified': [source['setName'], row['number'], row['player'], row.get('subset') or 'Base'],
                'verifiedAt': time.strftime('%Y-%m-%d'),
            }
            stats['newExact'] += 1
            remaining -= 1
            if stats['newExact'] % 50 == 0:
                print(f"  + {stats['newExact']} exact fronts in {collection_id}")
            if (len(manifest) - before) % 100 == 0:
                report['collections'][collection_id] = stats
                report['manifestExactFronts'] = len(manifest)
                report['newExactFrontsThisRun'] = len(manifest) - before
                write_outputs(manifest, report)
        report['collections'][collection_id] = stats
        report['manifestExactFronts'] = len(manifest)
        report['newExactFrontsThisRun'] = len(manifest) - before
        write_outputs(manifest, report)

    report['finishedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    report['archiveAvailable'] = not archive_dark
    report['manifestExactFronts'] = len(manifest)
    report['newExactFrontsThisRun'] = len(manifest) - before
    write_outputs(manifest, report)
    print(f"ISO import complete: +{report['newExactFrontsThisRun']} exact fronts; {len(manifest)} in bulk manifest.")


if __name__ == '__main__':
    main()
