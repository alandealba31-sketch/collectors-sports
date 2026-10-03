#!/usr/bin/env python3
"""Resolve exact card fronts in bulk through the official eBay Browse API.

No eBay HTML is scraped. The job uses an Application access token minted from
EBAY_CLIENT_ID / EBAY_CLIENT_SECRET GitHub secrets, searches current listings,
validates structured item aspects + title against catalog identity, downloads the
listing image, and caches it locally. Ambiguous matches are skipped.
"""
from __future__ import annotations

import base64
import hashlib
import io
import json
import os
import re
import time
import unicodedata
import urllib.parse
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TARGETS = ROOT / 'data' / 'image-targets-runtime.json'
MANIFEST = ROOT / 'data' / 'ebay-image-manifest.json'
REPORT = ROOT / 'data' / 'ebay-image-report.json'
OUTPUT = ROOT / 'catalog-images-ebay.js'
ASSETS = ROOT / 'assets' / 'cards' / 'ebay'
CLIENT_ID = os.getenv('EBAY_CLIENT_ID', '').strip()
CLIENT_SECRET = os.getenv('EBAY_CLIENT_SECRET', '').strip()
MAX_NEW = int(os.getenv('EBAY_IMPORT_MAX_NEW', '1000'))
DELAY = float(os.getenv('EBAY_IMPORT_DELAY', '0.10'))
MARKETPLACE = os.getenv('EBAY_MARKETPLACE_ID', 'EBAY_US')
SESSION = requests.Session()
SESSION.headers.update({'User-Agent':'CollectorsSportsCatalog/2.0'})
LAST = 0.0

GENERIC = {'topps','panini','chrome','card','cards','trading','soccer','football','baseball','basketball','wwe','ufc','tennis','2025','2026','2027'}
PARALLEL_TERMS = re.compile(r'\b(refractor|prizm|parallel|foil|gold|orange|red|black|green|blue|aqua|purple|pink|teal|yellow|silver|bronze|sepia|negative|frozen|superfractor|auto|autograph|relic|patch|numbered|sn\d+)\b', re.I)
LOT_TERMS = re.compile(r'\b(lot|you pick|pick your|complete set|team set lot|break|box|pack|case)\b', re.I)


def throttle():
    global LAST
    wait = DELAY - (time.monotonic() - LAST)
    if wait > 0:
        time.sleep(wait)
    LAST = time.monotonic()


def norm(v) -> str:
    s = unicodedata.normalize('NFKD', str(v or ''))
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower().replace('&',' and ')
    return re.sub(r'[^a-z0-9]+',' ',s).strip()


def tokens(v):
    return [x for x in norm(v).split() if len(x)>1]


def load(path, default):
    try: return json.loads(path.read_text(encoding='utf-8'))
    except Exception: return default


def token() -> str:
    if not CLIENT_ID or not CLIENT_SECRET:
        return ''
    auth = base64.b64encode(f'{CLIENT_ID}:{CLIENT_SECRET}'.encode()).decode()
    r = SESSION.post('https://api.ebay.com/identity/v1/oauth2/token', headers={
        'Authorization':f'Basic {auth}','Content-Type':'application/x-www-form-urlencoded'
    }, data={'grant_type':'client_credentials','scope':'https://api.ebay.com/oauth/api_scope'}, timeout=30)
    r.raise_for_status()
    return r.json()['access_token']


def api_get(access: str, path: str, params=None):
    throttle()
    r = SESSION.get('https://api.ebay.com' + path, params=params, headers={
        'Authorization':f'Bearer {access}','X-EBAY-C-MARKETPLACE-ID':MARKETPLACE,
        'Accept':'application/json'
    }, timeout=30)
    if r.status_code == 429:
        raise RuntimeError('eBay Browse API rate limit reached')
    r.raise_for_status()
    return r.json()


def aspects(item: dict) -> dict[str,str]:
    out = {}
    for a in item.get('localizedAspects') or []:
        name = norm(a.get('name'))
        value = str(a.get('value') or '')
        if name and value: out[name] = value
    return out


def aspect_value(a: dict, names: tuple[str,...]) -> str:
    for k,v in a.items():
        if any(n in k for n in names): return v
    return ''


def name_ok(player: str, hay: str) -> bool:
    p = tokens(player); h = set(tokens(hay))
    if not p: return False
    return sum(t in h for t in p) >= max(1, int(len(p)*0.8 + 0.49))


def number_ok(number: str, title: str, a: dict) -> bool:
    structured = aspect_value(a, ('card number','card no','number'))
    if structured and norm(structured) == norm(number): return True
    esc = re.escape(str(number))
    return bool(re.search(rf'(?<![A-Za-z0-9])#?{esc}(?![A-Za-z0-9])', title, re.I))


def set_ok(set_name: str, title: str, a: dict) -> bool:
    structured = aspect_value(a, ('set','card set'))
    hay = norm(f'{structured} {title}')
    sig = [t for t in tokens(set_name) if t not in GENERIC]
    if not sig:
        sig = [t for t in tokens(set_name) if t not in {'card','cards'}]
    hits = sum(t in hay.split() for t in sig)
    return hits >= max(1, int(len(sig)*0.6 + 0.49))


def subset_ok(subset: str, title: str, a: dict) -> bool:
    if not subset or norm(subset) in {'base','base cards','base cards i','base cards ii'}: return True
    hay = norm(' '.join([title, aspect_value(a,('parallel variety','insert set','card name','set'))]))
    sig = [t for t in tokens(subset) if t not in {'cards','card','base','the','and'}]
    return not sig or sum(t in hay.split() for t in sig) >= max(1, int(len(sig)*0.5 + 0.49))


def variant_ok(variant: str, subset: str, title: str, a: dict) -> bool:
    v = norm(variant or 'Base')
    hay = norm(' '.join([title, aspect_value(a,('parallel variety','parallel','variation'))]))
    if v in {'','base'}:
        if norm(subset) not in {'','base','base cards','base cards i','base cards ii'}:
            return True
        return not PARALLEL_TERMS.search(hay)
    sig = [t for t in tokens(variant) if t not in {'refractor','foil','parallel'}]
    return all(t in hay.split() for t in sig[:3]) if sig else v in hay


def exact_item(row: dict, source: dict, item: dict) -> bool:
    title = str(item.get('title') or '')
    if not title or LOT_TERMS.search(title): return False
    a = aspects(item)
    player_hay = ' '.join([title, aspect_value(a,('player athlete','player','athlete','fighter','wrestler'))])
    return (name_ok(row['player'], player_hay) and number_ok(row['number'], title, a)
            and set_ok(source.get('setName',''), title, a)
            and subset_ok(row.get('subset',''), title, a)
            and variant_ok(row.get('variant','Base'), row.get('subset',''), title, a))


def image_url(item: dict) -> str:
    image = item.get('image') or {}
    if image.get('imageUrl'): return image['imageUrl']
    for x in item.get('additionalImages') or []:
        if x.get('imageUrl'): return x['imageUrl']
    return ''


def save_image(url: str, path: Path) -> bool:
    throttle()
    r = SESSION.get(url, timeout=30)
    r.raise_for_status()
    try:
        with Image.open(io.BytesIO(r.content)) as im:
            im = im.convert('RGB')
            if im.width < 160 or im.height < 200: return False
            ratio = im.width/max(im.height,1)
            if ratio < 0.35 or ratio > 1.15: return False
            im.thumbnail((600,850), Image.Resampling.LANCZOS)
            path.parent.mkdir(parents=True, exist_ok=True)
            im.save(path, 'WEBP', quality=78, method=6)
        return True
    except Exception:
        return False


def key_for(cid,row):
    base=f"{cid}|{row['number']}"
    return f"{base}|{row['entryKey']}" if row.get('entryKey') else base


def query_for(row, source):
    parts=[source.get('setName',''),row.get('player',''),f"#{row.get('number','')}"]
    if row.get('subset') and norm(row['subset']) not in {'base','base cards'}: parts.append(row['subset'])
    if row.get('variant') and norm(row['variant'])!='base': parts.append(row['variant'])
    return ' '.join(x for x in parts if x)


def render(manifest):
    packed=json.dumps(manifest,ensure_ascii=False,separators=(',',':'))
    return f"// Generated by tools/import_ebay_exact_images.py.\n(() => {{const r=window.CS_IMAGE_CATALOG=window.CS_IMAGE_CATALOG||{{collections:{{}},cards:{{}}}};r.cards=r.cards||{{}};Object.assign(r.cards,{packed});}})();\n"


def main():
    targets=load(TARGETS,{})
    report={'provider':'eBay Browse API','startedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'collections':{},'credentialsConfigured':bool(CLIENT_ID and CLIENT_SECRET)}
    manifest=load(MANIFEST,{})
    before=len(manifest)
    if not targets:
        report['error']='No image targets exported'; REPORT.write_text(json.dumps(report,indent=2)+'\n'); return
    access=token()
    if not access:
        report['skipped']='EBAY_CLIENT_ID / EBAY_CLIENT_SECRET are not configured';
        REPORT.parent.mkdir(parents=True,exist_ok=True);REPORT.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8');
        if not OUTPUT.exists(): OUTPUT.write_text(render(manifest),encoding='utf-8')
        print(report['skipped']); return
    new=0
    stop=False
    for cid,payload in targets.items():
        stats={'eligible':0,'alreadyExact':0,'newExact':0,'noResults':0,'rejected':0,'errors':0}
        source=payload.get('source') or {}
        for row in payload.get('rows') or []:
            if stop or new>=MAX_NEW: break
            k=key_for(cid,row); stats['eligible']+=1
            if k in manifest: stats['alreadyExact']+=1; continue
            try:
                search=api_get(access,'/buy/browse/v1/item_summary/search',{'q':query_for(row,source),'limit':'8','fieldgroups':'EXTENDED'})
                summaries=search.get('itemSummaries') or []
                if not summaries: stats['noResults']+=1; continue
                accepted=False
                for summary in summaries[:4]:
                    item_id=summary.get('itemId')
                    if not item_id: continue
                    detail=api_get(access,'/buy/browse/v1/item/'+urllib.parse.quote(item_id,safe=''))
                    if not exact_item(row,source,detail): continue
                    url=image_url(detail) or image_url(summary)
                    if not url: continue
                    digest=hashlib.sha1(k.encode()).hexdigest()[:10]
                    safe_num=re.sub(r'[^A-Za-z0-9._-]+','-',str(row['number'])).strip('-') or 'card'
                    rel=Path('assets')/'cards'/'ebay'/cid/f'{safe_num}-{digest}.webp'
                    if not save_image(url,ROOT/rel): continue
                    manifest[k]={
                      'front':'./'+rel.as_posix(),'kind':'exact','exactVerified':True,
                      'variant':row.get('variant') or 'Base','source':'eBay Browse API',
                      'sourcePage':detail.get('itemWebUrl') or summary.get('itemWebUrl') or '',
                      'sourceImageUrl':url,'label':f"{row['player']} #{row['number']} — frente exacto verificado",
                      'verified':[source.get('setName',''),row['number'],row['player'],row.get('subset') or 'Base',row.get('variant') or 'Base'],
                      'verificationMethod':'eBay structured aspects + title + cached front','verifiedAt':time.strftime('%Y-%m-%d')
                    }
                    new+=1;stats['newExact']+=1;accepted=True
                    if new%50==0: print(f'+ {new} eBay exact fronts')
                    break
                if not accepted: stats['rejected']+=1
            except Exception as exc:
                stats['errors']+=1
                if 'rate limit' in str(exc).lower(): stop=True; break
        report['collections'][cid]=stats
        MANIFEST.parent.mkdir(parents=True,exist_ok=True)
        MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2,sort_keys=True)+'\n',encoding='utf-8')
        OUTPUT.write_text(render(manifest),encoding='utf-8')
        if stop or new>=MAX_NEW: break
    report['finishedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
    report['newExactFrontsThisRun']=len(manifest)-before;report['manifestExactFronts']=len(manifest);report['rateLimitStop']=stop
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f"eBay exact fronts: +{report['newExactFrontsThisRun']} / {report['manifestExactFronts']} total")

if __name__=='__main__': main()
