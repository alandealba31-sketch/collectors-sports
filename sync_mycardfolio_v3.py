#!/usr/bin/env python3
"""Exact-year and product-family safety wrapper for the high-volume structured image sync."""
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
    'MLB':'Baseball','NFL':'Football','NBA':'Basketball','UFC':'Mixed Martial Arts (Mma)',
    'F1':'Racing','WWE':'Wrestling','Soccer':'Soccer','Tennis':'Tennis'
}
GENERIC={'topps','panini','baseball','football','basketball','soccer','tennis','ufc','wwe','racing','formula','fifa','club','competitions','cards','card'}


def exact_years(desired: str, available: list[str]) -> list[str]:
    return [desired] if desired in available else []


_base_product_match = sync.product_is_strict_match


def strict_product_family(label: str, cfg: dict) -> bool:
    if not _base_product_match(label, cfg): return False
    text=sync.norm(label); tokens=set(text.split())
    forbidden=[sync.norm(x) for x in cfg.get('forbidden',[]) if sync.norm(x)]
    for value in forbidden:
        if value in text or all(token in tokens for token in value.split()): return False
    collection_id=cfg.get('collectionId','')
    if collection_id=='topps-update-baseball-2026' and 'chrome' in tokens: return False
    if 'team-set' in collection_id and any(x in text for x in ('collector tin','collector tins')): return False
    if 'collector-tin' in collection_id and 'team set' in text: return False
    return True


def normalize_product(item: dict) -> dict:
    original=item.get('collectionId'); item['collectionId']=CANONICAL_IDS.get(original,original)
    if original=='panini-prizm-road-to-world-cup-2025-26':
        item.update({'product':'Panini Select Road to FIFA World Cup','shortName':'Select Road to World Cup 25/26','aliases':['Select Road to World Cup','Panini Select Road to FIFA World Cup'],'required':['select','road','world','cup'],'forbidden':['prizm','donruss','noir','national treasures'],'resetOnMismatch':True})
    return item


def derive_image_product(raw: dict) -> dict:
    name=str(raw.get('name') or raw.get('shortName') or raw.get('product') or '')
    product=str(raw.get('product') or re.sub(r'^\s*20\d{2}(?:-\d{2}|/\d{2})?\s+','',name).strip())
    year_match=re.search(r'20\d{2}',str(raw.get('year') or name)); year=year_match.group(0) if year_match else str(raw.get('year') or '')
    sport=SPORT_MAP.get(raw.get('sport'),raw.get('sport'))
    tokens=[t for t in sync.norm(product).split() if t not in GENERIC and not t.isdigit()]
    required=tokens[:5]
    cid=raw.get('collectionId','')
    forbidden=[]
    if 'team-set' in cid: forbidden=['collector tin']
    elif 'collector-tin' in cid: forbidden=['team set']
    if cid=='topps-update-baseball-2026': forbidden.append('chrome')
    return {'collectionId':cid,'sport':sport,'year':year,'displayYear':raw.get('year'),'product':product,'shortName':raw.get('shortName') or product,'aliases':[x for x in [name,raw.get('shortName')] if x],'required':required,'forbidden':forbidden}


def read_products(path: Path, key='products') -> list[dict]:
    try: return (json.loads(path.read_text(encoding='utf-8')).get(key) or []) if path.exists() else []
    except Exception: return []


def build_merged_config() -> Path:
    root=Path(__file__).resolve().parent
    base=read_products(root/'mycardfolio_product_sources_v2.json')
    extras=read_products(root/'mycardfolio_extra_products_v1.json')
    hall=[derive_image_product(x) for x in read_products(root/'halloflists_sources.json')]
    ci=[derive_image_product(x) for x in read_products(root/'checklistinsider_sources.json')]
    now=[derive_image_product(x) for x in read_products(root/'halloflists_now_sources.json',key='sources')]
    merged_path=root/'data'/'mycardfolio-runtime-products.json'
    products=[]; seen=set()
    for raw in [*base,*extras,*hall,*ci,*now]:
        item=normalize_product(dict(raw)); cid=item.get('collectionId')
        if not cid or cid in seen: continue
        seen.add(cid); products.append(item)
    merged_path.parent.mkdir(parents=True,exist_ok=True)
    merged_path.write_text(json.dumps({'version':5,'products':products},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return merged_path


sync.candidate_years=exact_years
sync.product_is_strict_match=strict_product_family
sync.CONFIG=build_merged_config()

if __name__=='__main__': asyncio.run(sync.main_async())
