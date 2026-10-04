#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / 'halloflists_now_sources.json'
OUT = ROOT / 'catalog-now-halloflists.js'
REPORT = ROOT / 'data' / 'halloflists-now-sync-report.json'
UA = {'User-Agent': 'CollectorsSports/1.0 (+catalog sync)'}

WBC_PREFIXES = {'WBC','WBCO','DR','JP','KOR','PR','USA','VEN'}


def norm(value: Any) -> str:
    return re.sub(r'\s+', ' ', str(value or '')).strip()


def row_key(row: list) -> str:
    return f"{str(row[0]).lower()}|{str(row[1]).lower()}|{str(row[4]).lower()}"


def stable_code(text: str) -> str:
    return 'NOW-' + hashlib.sha1(text.encode('utf-8')).hexdigest()[:8].upper()


def parse_number_and_subject(text: str) -> tuple[str, str] | None:
    text = norm(text)
    m = re.match(r'^#([^\s]+)\s+(.+)$', text)
    if not m:
        return None
    number, subject = m.groups()
    subject = re.sub(r'\s+(?:Print run|Quick view|Search on eBay).*$','',subject,flags=re.I).strip()
    return number.strip(), subject.strip()


def mlb_rows(soup: BeautifulSoup) -> tuple[list[list], list[list], int]:
    declared = 0
    text = soup.get_text(' ', strip=True)
    m = re.search(r'All\s+2026\s+Topps\s+Now\s+cards\s*\(([\d,]+)\)', text, re.I)
    if m:
        declared = int(m.group(1).replace(',',''))
    else:
        m = re.search(r'([\d,]+)\s+of\s+([\d,]+)\s+cards', text, re.I)
        if m: declared = int(m.group(2).replace(',',''))

    mlb: list[list] = []
    wbc: list[list] = []
    seen = set()
    for a in soup.find_all('a'):
        label = norm(a.get_text(' ', strip=True))
        parsed = parse_number_and_subject(label)
        if not parsed:
            continue
        number, subject = parsed
        prefix = re.split(r'[-\d]', number.upper(), 1)[0]
        key = (number.lower(), subject.lower())
        if key in seen: continue
        seen.add(key)
        flags = []
        if re.search(r'\bRC\b|rookie', label, re.I): flags.append('RC')
        if re.search(r'call[- ]?up', label, re.I): flags.append('CALL UP')
        row = [number,subject,'',flags or 0,'Topps NOW','now','Base',f'holnow:mlb:{number}']
        if prefix in WBC_PREFIXES:
            row[7]=f'holnow:wbc:{number}'
            wbc.append(row)
        else:
            mlb.append(row)
    return mlb,wbc,declared


def archive_rows(soup: BeautifulSoup, source: dict) -> tuple[list[list], int]:
    year = str(source.get('year') or '')
    license_name = str(source.get('license') or '')
    rows: list[list] = []
    seen = set()
    page_text = soup.get_text(' ', strip=True)
    declared = 0
    patterns = [
        rf'([\d,]+)\s+of\s+([\d,]+)\s+products\s*[·•]\s*{re.escape(year)}',
        rf'([\d,]+)\s+products\s+.*?{re.escape(year)}',
    ]
    for pat in patterns:
        m=re.search(pat,page_text,re.I)
        if m:
            try: declared=int((m.group(2) if m.lastindex and m.lastindex>=2 else m.group(1)).replace(',',''))
            except Exception: pass
            if declared: break

    candidates=[]
    for li in soup.find_all('li'):
        text=norm(li.get_text(' ',strip=True))
        if 'Quick view' in text and (year in text or year.split('/')[0] in text):
            candidates.append(text)
    if not candidates:
        # Some archive templates render product cards as div/article blocks instead of list items.
        for node in soup.find_all(['article','div']):
            text=norm(node.get_text(' ',strip=True))
            if 'Quick view' in text and (year in text or year.split('/')[0] in text) and len(text)<1400:
                candidates.append(text)

    for text in candidates:
        # Normalize duplicated image alt/card-number text such as #30 ... #30 Quick view.
        m=re.search(r'#([^\s#]+).*?Quick view\s+(?:20\d{2}(?:-\d{2})?\s+(?:season\s+)?[·•]\s*)?'+re.escape(license_name)+r'\s+(.+?)(?:\s+Print run|\s+Search on eBay|$)',text,re.I)
        if m:
            number,subject=m.groups()
        else:
            # Handle cards displayed only as NOW but whose title contains “Card 17”.
            m2=re.search(r'Quick view\s+(?:20\d{2}(?:-\d{2})?\s+(?:season\s+)?[·•]\s*)?'+re.escape(license_name)+r'\s+(.+?)(?:\s+Print run|\s+Search on eBay|$)',text,re.I)
            if not m2: continue
            subject=m2.group(1)
            cm=re.search(r'\bCard\s+([A-Za-z0-9-]+)',subject,re.I)
            number=cm.group(1) if cm else stable_code(text)
        subject=re.sub(r'\s+-\s+20\d{2}(?:-\d{2})?.*?Topps NOW®?.*$','',subject,flags=re.I).strip()
        subject=re.sub(r'\s+Topps NOW®?.*$','',subject,flags=re.I).strip()
        if not subject: continue
        key=(number.lower(),subject.lower())
        if key in seen: continue
        seen.add(key)
        flags=[]
        if re.search(r'autograph|\bauto\b',text,re.I): flags.append('AUTO')
        if re.search(r'relic|patch|memorabilia',text,re.I): flags.append('RELIC')
        row=[number,subject,'',flags or 0,'Topps NOW','now','Base',f"holnow:{source['collectionId']}:{number}"]
        rows.append(row)
    return rows,declared


def collection_meta(source: dict, count: int) -> dict:
    return {
        'id':source['collectionId'],'sport':source['sport'],'manufacturer':'Topps','year':source['year'],
        'name':source['name'],'shortName':source['shortName'],'family':'Topps NOW','sourceUrl':source['url'],
        'coverage':'archive-import','entryIdentity':True,'expandedCount':count,
    }


def render(payload: dict) -> str:
    packed=json.dumps(payload,ensure_ascii=False,separators=(',',':'))
    return f"""// Generated by tools/sync_halloflists_now.py. Checklist data only; Hall reference images are never imported as exact.\n(() => {{\n const catalog=window.CS_CATALOG;if(!catalog)return;catalog.checklists=catalog.checklists||{{}};\n const payload={packed};const key=r=>`${{String(r?.[0]??'').toLowerCase()}}|${{String(r?.[1]??'').toLowerCase()}}|${{String(r?.[4]??'').toLowerCase()}}`;\n for(const [id,p] of Object.entries(payload)){{let c=catalog.collections.find(x=>x.id===id);if(c)Object.assign(c,p.collection);else{{c={{...p.collection}};catalog.collections.push(c);}}const old=catalog.checklists[id]||[];const seen=new Set(old.map(key));const merged=[...old];for(const r of p.rows){{const k=key(r);if(!seen.has(k)){{merged.push(r);seen.add(k);}}}}catalog.checklists[id]=merged;c.expandedCount=merged.length;c.family='Topps NOW';c.entryIdentity=true;}}\n}})();\n"""


def main() -> None:
    config=json.loads(CONFIG.read_text(encoding='utf-8'))
    payload:dict[str,dict]={}
    reports=[]
    for source in config.get('sources',[]):
        try:
            response=requests.get(source['url'],headers=UA,timeout=35)
            response.raise_for_status()
            soup=BeautifulSoup(response.text,'html.parser')
            if source['collectionId']=='topps-now-mlb-2026':
                mlb,wbc,declared=mlb_rows(soup)
                payload[source['collectionId']]={'collection':collection_meta(source,len(mlb)),'rows':mlb}
                wbc_source={**source,'collectionId':'topps-now-wbc-2026','name':'World Baseball Classic Topps NOW 2026','shortName':'WBC Topps NOW 2026'}
                payload['topps-now-wbc-2026']={'collection':collection_meta(wbc_source,len(wbc)),'rows':wbc}
                reports.append({'collectionId':source['collectionId'],'rows':len(mlb),'wbcRows':len(wbc),'pageDeclared':declared,'status':'ok'})
                print(f"{source['collectionId']}: {len(mlb)} MLB + {len(wbc)} WBC rows",flush=True)
            else:
                rows,declared=archive_rows(soup,source)
                if not rows: raise RuntimeError('no 2026 archive rows parsed')
                payload[source['collectionId']]={'collection':collection_meta(source,len(rows)),'rows':rows}
                reports.append({'collectionId':source['collectionId'],'rows':len(rows),'pageDeclared':declared or None,'status':'ok'})
                print(f"{source['collectionId']}: {len(rows)} rows",flush=True)
        except Exception as exc:
            reports.append({'collectionId':source.get('collectionId'),'rows':0,'status':'error','error':str(exc)})
            print(f"{source.get('collectionId')}: skipped ({exc})",flush=True)
    OUT.write_text(render(payload),encoding='utf-8')
    REPORT.parent.mkdir(parents=True,exist_ok=True)
    REPORT.write_text(json.dumps({'products':reports,'totalRows':sum(int(r.get('rows') or 0)+int(r.get('wbcRows') or 0) for r in reports)},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')


if __name__=='__main__': main()
