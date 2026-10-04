#!/usr/bin/env python3
"""Exact-year and product-family safety wrapper for the high-volume MyCardfolio sync."""
import asyncio
import json
import re
from pathlib import Path
import sync_mycardfolio_v2 as sync

CANONICAL_IDS = {
    'panini-select-laliga-2024-25': 'panini-select-la-liga-2024-25',
    'panini-prizm-road-to-world-cup-2025-26': 'panini-select-road-to-world-cup-2025-26',
    'topps-manchester-city-collector-tin-2026-27': 'topps-man-city-collector-tin-2026-27',
    'topps-manchester-united-collector-tin-2025-26': 'topps-man-utd-collector-tin-2025-26',
    'topps-manchester-united-collector-tin-2026-27': 'topps-man-utd-collector-tin-2026-27',
}

SPORT_MAP = {
    'MLB': 'Baseball', 'NFL': 'Football', 'NBA': 'Basketball', 'UFC': 'Mixed Martial Arts (Mma)',
    'F1': 'Racing', 'WWE': 'Wrestling', 'Soccer': 'Soccer', 'Tennis': 'Tennis'
}


def exact_years(desired: str, available: list[str]) -> list[str]:
    return [desired] if desired in available else []


_base_product_match = sync.product_is_strict_match


def strict_product_family(label: str, cfg: dict) -> bool:
    if not _base_product_match(label, cfg):
        return False
    text = sync.norm(label)
    tokens = set(text.split())
    forbidden = [sync.norm(x) for x in cfg.get('forbidden', []) if sync.norm(x)]
    for value in forbidden:
        if value in text or all(token in tokens for token in value.split()):
            return False
    collection_id = cfg.get('collectionId', '')
    if collection_id == 'topps-update-baseball-2026' and 'chrome' in tokens:
        return False
    if 'team-set' in collection_id and any(x in text for x in ('collector tin', 'collector tins')):
        return False
    if 'collector-tin' in collection_id and 'team set' in text:
        return False
    return True


def normalize_product(item: dict) -> dict:
    original = item.get('collectionId')
    item['collectionId'] = CANONICAL_IDS.get(original, original)
    if original == 'panini-prizm-road-to-world-cup-2025-26':
        item.update({
            'product': 'Panini Select Road to FIFA World Cup',
            'shortName': 'Select Road to World Cup 25/26',
            'aliases': ['Select Road to World Cup', 'Panini Select Road to FIFA World Cup'],
            'required': ['select', 'road', 'world', 'cup'],
            'forbidden': ['prizm', 'donruss', 'noir', 'national treasures'],
            'resetOnMismatch': True,
        })
    return item


def hall_to_image_product(raw: dict) -> dict:
    name = str(raw.get('name') or raw.get('shortName') or '')
    product = re.sub(r'^\s*20\d{2}(?:-\d{2}|/\d{2})?\s+', '', name).strip()
    product = re.sub(r'^Topps\s+|^Panini\s+', lambda m: m.group(0), product)
    year_match = re.search(r'20\d{2}', str(raw.get('year') or name))
    year = year_match.group(0) if year_match else str(raw.get('year') or '')
    tokens = sync.norm(product).split()
    generic = {'topps','panini','baseball','football','basketball','soccer','tennis','ufc','wwe','racing','formula','fifa','club','competitions'}
    meaningful = [t for t in tokens if t not in generic and not t.isdigit()]
    required = meaningful[:4]
    return {
        'collectionId': raw.get('collectionId'),
        'sport': SPORT_MAP.get(raw.get('sport'), raw.get('sport')),
        'year': year,
        'displayYear': raw.get('year'),
        'product': product,
        'shortName': raw.get('shortName') or product,
        'aliases': [name, raw.get('shortName') or ''],
        'required': required,
    }


def build_merged_config() -> Path:
    root = Path(__file__).resolve().parent
    base_path = root / 'mycardfolio_product_sources_v2.json'
    extra_path = root / 'mycardfolio_extra_products_v1.json'
    hall_path = root / 'halloflists_sources.json'
    merged_path = root / 'data' / 'mycardfolio-runtime-products.json'
    base = json.loads(base_path.read_text(encoding='utf-8'))
    extras = json.loads(extra_path.read_text(encoding='utf-8')) if extra_path.exists() else {'products': []}
    hall = json.loads(hall_path.read_text(encoding='utf-8')) if hall_path.exists() else {'products': []}
    hall_products = [hall_to_image_product(x) for x in (hall.get('products') or [])]
    products = []
    seen = set()
    for raw in [*(base.get('products') or []), *(extras.get('products') or []), *hall_products]:
        item = normalize_product(dict(raw))
        cid = item.get('collectionId')
        if not cid or cid in seen:
            continue
        seen.add(cid)
        products.append(item)
    merged_path.parent.mkdir(parents=True, exist_ok=True)
    merged_path.write_text(json.dumps({'version': 4, 'products': products}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return merged_path


sync.candidate_years = exact_years
sync.product_is_strict_match = strict_product_family
sync.CONFIG = build_merged_config()

if __name__ == '__main__':
    asyncio.run(sync.main_async())
