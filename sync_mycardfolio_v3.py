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
    'panini-international-england-2026': 'panini-intl-england-2026',
    'panini-international-france-2026': 'panini-intl-france-2026',
    'panini-international-germany-2026': 'panini-intl-germany-2026',
    'panini-international-mexico-2026': 'panini-intl-mexico-2026',
    'topps-manchester-city-collector-tin-2026-27': 'topps-man-city-collector-tin-2026-27',
    'topps-manchester-united-collector-tin-2025-26': 'topps-man-utd-collector-tin-2025-26',
    'topps-manchester-united-collector-tin-2026-27': 'topps-man-utd-collector-tin-2026-27',
}
LEGACY_STRUCTURED_IDS = {
    'panini-international-england-2026',
    'panini-international-france-2026',
    'panini-international-germany-2026',
    'panini-international-mexico-2026',
    'panini-real-madrid-2025-26',
    'topps-real-madrid-team-set-2025-26',
}

SPORT_MAP = {
    'MLB':'Baseball','NFL':'Football','NBA':'Basketball','UFC':'Mixed Martial Arts (Mma)',
    'F1':'Racing','WWE':'Wrestling','Soccer':'Soccer','Tennis':'Tennis'
}
GENERIC={'topps','panini','baseball','football','basketball','soccer','tennis','ufc','wwe','racing','formula','fifa','club','competitions','cards','card'}


def exact_years(desired: str, available: list[str]) -> list[str]:
    return [desired] if desired in available else []


_base_product_match = sync.product_is_strict_match


def token_root(token: str) -> str:
    token = token.strip()
    if len(token) > 4 and token.endswith('s'):
        return token[:-1]
    return token


def phrase_matches(text: str, phrase: str) -> bool:
    if phrase in text:
        return True
    text_roots={token_root(t) for t in text.split()}
    phrase_roots=[token_root(t) for t in phrase.split()]
    return bool(phrase_roots) and all(root in text_roots for root in phrase_roots)


def strict_product_family(label: str, cfg: dict) -> bool:
    if not _base_product_match(label, cfg): return False
    text=sync.norm(label); tokens=set(text.split())
    forbidden=[sync.norm(x) for x in cfg.get('forbidden',[]) if sync.norm(x)]
    for value in forbidden:
        if phrase_matches(text,value): return False
    collection_id=cfg.get('collectionId','')
    if collection_id.startswith('panini-') and 'topps' in tokens: return False
    if collection_id.startswith('topps-') and 'panini' in tokens: return False
    if collection_id=='topps-update-baseball-2026' and 'chrome' in tokens: return False
    if 'team-set' in collection_id:
        if any(phrase_matches(text,x) for x in ('collector tin','collectors tin')): return False
        if 'top of the world' in text: return False
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
    cid=CANONICAL_IDS.get(raw.get('collectionId',''), raw.get('collectionId',''))
    forbidden=[]
    if 'team-set' in cid: forbidden=['collector tin','collectors tin','top of the world']
    elif 'collector-tin' in cid: forbidden=['team set']
    if cid=='topps-update-baseball-2026': forbidden.append('chrome')
    return {'collectionId':cid,'sport':sport,'year':year,'displayYear':raw.get('year'),'product':product,'shortName':raw.get('shortName') or product,'aliases':[x for x in [name,raw.get('shortName')] if x],'required':required,'forbidden':forbidden}


def read_products(path: Path, key='products') -> list[dict]:
    try: return (json.loads(path.read_text(encoding='utf-8')).get(key) or []) if path.exists() else []
    except Exception: return []


def priority_rank(root: Path) -> dict[str,int]:
    ordered=[]
    try:
        owned_path=root/'data'/'user-collection-priority.json'
        owned=json.loads(owned_path.read_text(encoding='utf-8')) if owned_path.exists() else {}
        for item in owned.get('collections') or []:
            cid=CANONICAL_IDS.get(str(item.get('collectionId') or ''),str(item.get('collectionId') or ''))
            if cid and cid not in ordered: ordered.append(cid)
    except Exception:
        pass
    try:
        email_path=root/'data'/'email-priority-collections.json'
        email=json.loads(email_path.read_text(encoding='utf-8')) if email_path.exists() else {}
        items=sorted(email.get('collections') or [],key=lambda item:int(item.get('priority') or 999999))
        for item in items:
            cid=CANONICAL_IDS.get(str(item.get('collectionId') or ''),str(item.get('collectionId') or ''))
            if cid and cid not in ordered: ordered.append(cid)
    except Exception:
        pass
    return {cid:index+1 for index,cid in enumerate(ordered)}


def build_merged_config() -> Path:
    root=Path(__file__).resolve().parent
    base=read_products(root/'mycardfolio_product_sources_v2.json')
    expanded=read_products(root/'tools'/'mycardfolio_product_sources.json')
    extras=read_products(root/'mycardfolio_extra_products_v1.json')
    hall=[derive_image_product(x) for x in read_products(root/'halloflists_sources.json')]
    ci=[derive_image_product(x) for x in read_products(root/'checklistinsider_sources.json')]
    now=[derive_image_product(x) for x in read_products(root/'halloflists_now_sources.json',key='sources')]
    merged_path=root/'data'/'mycardfolio-runtime-products.json'
    products=[]; seen=set()
    for raw in [*base,*expanded,*extras,*hall,*ci,*now]:
        item=normalize_product(dict(raw)); cid=item.get('collectionId')
        if not cid or cid in seen: continue
        seen.add(cid); products.append(item)
    ranks=priority_rank(root)
    if ranks:
        products.sort(key=lambda item: ranks.get(item.get('collectionId',''), 1000000))
        prioritized=[item.get('collectionId') for item in products if item.get('collectionId') in ranks]
        print('Owned/email-priority structured queue:', ', '.join(prioritized), flush=True)
    merged_path.parent.mkdir(parents=True,exist_ok=True)
    merged_path.write_text(json.dumps({'version':9,'ownedPriorityApplied':bool(ranks),'products':products},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return merged_path


sync.candidate_years=exact_years
sync.product_is_strict_match=strict_product_family
sync.FORCE_PURGE_COLLECTION_IDS=set(LEGACY_STRUCTURED_IDS)
sync.CONFIG=build_merged_config()

if __name__=='__main__': asyncio.run(sync.main_async())
