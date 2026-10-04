#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / 'halloflists_sources.json'
OUT = ROOT / 'catalog-halloflists-expanded.js'
REPORT = ROOT / 'data' / 'halloflists-sync-report.json'

UA = {'User-Agent': 'CollectorsSports/1.0 (+catalog sync)'}


def norm(value: Any) -> str:
    return re.sub(r'\s+', ' ', str(value or '')).strip()


def category_for(subset: str) -> str:
    s = subset.lower()
    if 'autograph' in s and any(x in s for x in ('relic', 'material', 'patch', 'swatch')):
        return 'auto-relic'
    if 'autograph' in s or 'signature' in s or 'ink' in s:
        return 'autograph'
    if any(x in s for x in ('relic', 'material', 'patch', 'swatch')):
        return 'relic'
    if 'rookie' in s:
        return 'rookie-insert'
    if s in {'base', 'base cards', 'base cards i', 'base chrome', 'rookies'} or s.startswith('base '):
        return 'base' if 'variation' not in s and 'chrome' not in s else 'parallel'
    if any(x in s for x in ('variation', 'parallel', 'chrome', 'refractor')):
        return 'parallel'
    return 'insert'


def flags_for(subject: str, subset: str) -> list[str] | int:
    flags: list[str] = []
    text = f'{subject} {subset}'
    if re.search(r'\bRC\b|rookie', text, re.I):
        flags.append('RC')
    if re.search(r'autograph|signature|\bauto\b|ink', subset, re.I):
        flags.append('AUTO')
    if re.search(r'relic|material|patch|swatch', subset, re.I):
        flags.append('RELIC')
    return flags or 0


def clean_subject(subject: str) -> str:
    subject = re.sub(r'\s+RC\b', '', subject, flags=re.I)
    subject = re.sub(r'\s+Autograph\b', '', subject, flags=re.I)
    return norm(subject)


def parse_li(text: str) -> tuple[str, str, str] | None:
    text = norm(text)
    m = re.match(r'^#?([^\s]+)\s+(.+)$', text)
    if not m:
        return None
    number, rest = m.groups()
    if len(number) > 40 or number.lower() in {'cards', 'card'}:
        return None
    team = ''
    subject = rest
    if ', ' in rest:
        subject, team = rest.rsplit(', ', 1)
    subject = clean_subject(subject)
    if not subject:
        return None
    return number, subject, norm(team)


def parse_product(cfg: dict) -> tuple[dict, list[list], dict]:
    response = requests.get(cfg['url'], headers=UA, timeout=35)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')

    text_index_heading = None
    expected_rows = 0
    for tag in soup.find_all(['h2', 'h3', 'p']):
        label = norm(tag.get_text(' ', strip=True))
        if 'checklist — text index' in label.lower():
            text_index_heading = tag
            m = re.search(r'\(([\d,]+)\s+cards\)', label, re.I)
            if m:
                expected_rows = int(m.group(1).replace(',', ''))
            break

    start = text_index_heading or soup.body
    if start is None:
        raise RuntimeError('page has no parseable body')

    rows: list[list] = []
    subset_counts: dict[str, int] = {}
    seen: set[tuple[str, str, str]] = set()
    current_subset = ''

    for element in start.find_all_next(['h2', 'h3', 'li', 'footer']):
        if element.name == 'footer':
            break
        if element.name == 'h2' and element is not start and rows:
            heading = norm(element.get_text(' ', strip=True)).lower()
            if any(x in heading for x in ('checklists by category', 'browse', 'site', 'related')):
                break
        if element.name == 'h3':
            raw = norm(element.get_text(' ', strip=True))
            m = re.match(r'^(.*?)\s*\((\d[\d,]*)\)\s*$', raw)
            current_subset = norm(m.group(1)) if m else raw
            continue
        if element.name != 'li' or not current_subset:
            continue
        parsed = parse_li(element.get_text(' ', strip=True))
        if not parsed:
            continue
        number, subject, team = parsed
        key = (number.lower(), subject.lower(), current_subset.lower())
        if key in seen:
            continue
        seen.add(key)
        category = category_for(current_subset)
        row = [number, subject, team, flags_for(subject, current_subset), current_subset, category, current_subset,
               f"hol:{cfg['collectionId']}:{re.sub(r'[^a-z0-9]+','-',current_subset.lower()).strip('-')}:{number}"]
        rows.append(row)
        subset_counts[current_subset] = subset_counts.get(current_subset, 0) + 1
        if expected_rows and len(rows) >= expected_rows:
            break

    if not rows:
        raise RuntimeError('no checklist rows parsed')
    if expected_rows and len(rows) != expected_rows:
        raise RuntimeError(f'parsed {len(rows)} rows but page declares {expected_rows}')

    collection = {
        'id': cfg['collectionId'],
        'sport': cfg['sport'],
        'manufacturer': cfg['manufacturer'],
        'year': cfg['year'],
        'name': cfg['name'],
        'shortName': cfg['shortName'],
        'sourceUrl': cfg['url'],
        'coverage': 'full-text-index-import',
        'entryIdentity': True,
        'expandedCount': len(rows),
    }
    report = {
        'collectionId': cfg['collectionId'],
        'url': cfg['url'],
        'rows': len(rows),
        'expectedRows': expected_rows or None,
        'complete': not expected_rows or len(rows) == expected_rows,
        'subsets': subset_counts,
        'status': 'ok',
    }
    return collection, rows, report


def render(payload: dict) -> str:
    packed = json.dumps(payload, ensure_ascii=False, separators=(',', ':'))
    return f"""// Generated by tools/sync_halloflists.py. Do not edit by hand.\n(() => {{\n  const catalog=window.CS_CATALOG;if(!catalog)return;catalog.checklists=catalog.checklists||{{}};\n  const payload={packed};\n  const key=r=>`${{String(r?.[0]??'').toLowerCase()}}|${{String(r?.[1]??'').toLowerCase()}}|${{String(r?.[4]??'').toLowerCase()}}`;\n  for(const [id,p] of Object.entries(payload)){{\n    let c=catalog.collections.find(x=>x.id===id);if(c)Object.assign(c,p.collection);else{{c={{...p.collection}};catalog.collections.push(c);}}\n    const existing=catalog.checklists[id]||[];const seen=new Set(existing.map(key));const merged=[...existing];\n    for(const r of p.rows){{const k=key(r);if(!seen.has(k)){{merged.push(r);seen.add(k);}}}}\n    catalog.checklists[id]=merged;c.expandedCount=merged.length;c.entryIdentity=true;\n  }}\n}})();\n"""


def main() -> None:
    cfg = json.loads(CONFIG.read_text(encoding='utf-8'))
    payload: dict[str, dict] = {}
    reports: list[dict] = []
    for product in cfg.get('products', []):
        try:
            collection, rows, report = parse_product(product)
            payload[collection['id']] = {'collection': collection, 'rows': rows}
            reports.append(report)
            print(f"{collection['id']}: {len(rows)} rows", flush=True)
        except Exception as exc:
            reports.append({
                'collectionId': product.get('collectionId'),
                'url': product.get('url'),
                'rows': 0,
                'status': 'error',
                'error': str(exc),
            })
            print(f"{product.get('collectionId')}: skipped ({exc})", flush=True)
    OUT.write_text(render(payload), encoding='utf-8')
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps({
        'products': reports,
        'successfulProducts': sum(1 for r in reports if r.get('status') == 'ok'),
        'failedProducts': sum(1 for r in reports if r.get('status') != 'ok'),
        'totalRows': sum(int(r.get('rows') or 0) for r in reports),
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
