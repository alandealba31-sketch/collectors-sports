#!/usr/bin/env python3
"""Import whole product trees and exact fronts from MyCardfolio's public MCP.

This works at product/set granularity, not card-by-card search. For each configured
owned product it discovers the product, enumerates its sets, downloads each complete
set checklist (up to the API's 500-card per-set cap), and emits searchable identities
plus exact image mappings already attached to those checklist card IDs.
"""
from __future__ import annotations

import asyncio,json,re,time,unicodedata
from pathlib import Path
from typing import Any
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

ROOT=Path(__file__).resolve().parents[1]
CONFIG=ROOT/'tools'/'mycardfolio_product_sources.json'
CATALOG_OUT=ROOT/'catalog-mycardfolio-expanded.js'
IMAGES_OUT=ROOT/'catalog-images-mycardfolio.js'
REPORT=ROOT/'data'/'mycardfolio-sync-report.json'
URL='https://mycardfolio.com/api/mcp'
MAX_SETS_PER_PRODUCT=180

PARALLEL_WORDS=re.compile(r'\b(refractor|prizm|parallel|foil|gold|orange|red|black|green|blue|aqua|purple|pink|teal|yellow|silver|bronze|sepia|negative|frozen|superfractor|sapphire|atomic|mojo|lava|wave|raywave|x-fractor|geometric|ruby|burgundy|amber|violet|jade|obsidian|artist proof)\b',re.I)
AUTO_WORDS=re.compile(r'\b(auto|autograph|signature|signatures)\b',re.I)
RELIC_WORDS=re.compile(r'\b(relic|memorabilia|patch|jersey)\b',re.I)


def norm(v:Any)->str:
    s=unicodedata.normalize('NFKD',str(v or ''));s=''.join(c for c in s if not unicodedata.combining(c)).lower().replace('&',' and ')
    return re.sub(r'[^a-z0-9]+',' ',s).strip()

def result_json(result):
    sc=getattr(result,'structuredContent',None)
    if sc:
        if hasattr(sc,'model_dump'):sc=sc.model_dump(mode='json')
        if isinstance(sc,dict):return sc
    for item in getattr(result,'content',[]) or []:
        text=getattr(item,'text','')
        if text:
            try:return json.loads(text)
            except Exception:pass
    return {}

def objects(node):
    if isinstance(node,dict):
        yield node
        for v in node.values():yield from objects(v)
    elif isinstance(node,list):
        for v in node:yield from objects(v)

def first(d,*keys):
    for k in keys:
        v=d.get(k) if isinstance(d,dict) else None
        if v not in (None,''):return v
    return ''

def obj_label(d):return str(first(d,'product','product_name','name','title','set','set_name','label'))

def match_score(label,want):
    h=norm(label);w=norm(want);wt=w.split();ht=set(h.split())
    if not h:return -999
    score=sum(3 for t in wt if t in ht)-sum(2 for t in wt if t not in ht)
    if h==w:score+=20
    if w in h or h in w:score+=5
    return score

def choose(items,want,id_keys):
    best=None;score=-999
    for d in items:
        if not isinstance(d,dict) or not first(d,*id_keys):continue
        s=match_score(obj_label(d),want)
        if s>score:best,score=d,s
    return best,score

def subject(card):
    subs=card.get('subjects') or card.get('subject') or []
    if isinstance(subs,dict):subs=[subs]
    if isinstance(subs,list) and subs:
        first_sub=subs[0] if isinstance(subs[0],dict) else {'subject_name':subs[0]}
        return str(first(first_sub,'subject_name','name','player','subject')),str(first(first_sub,'team_name','team'))
    return str(first(card,'player','subject_name','name','athlete','fighter','wrestler')),str(first(card,'team','team_name'))

def card_objects(payload):
    out=[];seen=set()
    for d in objects(payload):
        if not isinstance(d,dict):continue
        number=first(d,'card_number','number','card_no')
        cid=first(d,'card_id','cardId')
        player,_=subject(d)
        if not number or not player or not cid:continue
        k=str(cid)
        if k in seen:continue
        seen.add(k);out.append(d)
    return out

def set_objects(payload):
    out=[];seen=set()
    for d in objects(payload):
        if not isinstance(d,dict):continue
        sid=first(d,'set_id','setId')
        if not sid:continue
        if str(sid) in seen:continue
        seen.add(str(sid));out.append(d)
    return out

def product_objects(payload):
    out=[];seen=set()
    for d in objects(payload):
        if not isinstance(d,dict):continue
        pid=first(d,'product_id','productId')
        if not pid:continue
        if str(pid) in seen:continue
        seen.add(str(pid));out.append(d)
    return out

def flags(card,set_name):
    details=' '.join(str(first(card,k)) for k in ('card_details','details','notes','attributes'))+' '+set_name
    u=details.upper();out=[]
    if re.search(r'\bRC\b|ROOKIE',u):out.append('RC')
    if AUTO_WORDS.search(details):out.append('AUTO')
    if RELIC_WORDS.search(details):out.append('RELIC')
    if re.search(r'\bSSP\b',u):out.append('SSP')
    elif re.search(r'\bSP\b',u):out.append('SP')
    return out or 0

def category(set_name,details=''):
    t=f'{set_name} {details}'
    if AUTO_WORDS.search(t) and RELIC_WORDS.search(t):return 'auto-relic'
    if AUTO_WORDS.search(t):return 'autograph'
    if RELIC_WORDS.search(t):return 'relic'
    if 'rookie' in t.lower():return 'rookie-insert'
    if norm(set_name) in {'base','base set','base cards','chrome'}:return 'base'
    if PARALLEL_WORDS.search(set_name):return 'parallel'
    return 'insert'

def variant_name(set_name,cat):
    return 'Base' if cat=='base' else set_name

def year_for_collection(cfg):return cfg.get('displayYear') or ('2025/26' if cfg.get('year')=='2025' and '25/26' in cfg.get('shortName','') else cfg.get('year',''))

def render_catalog(data):
    packed=json.dumps(data,ensure_ascii=False,separators=(',',':'))
    return f"""// Generated by tools/sync_mycardfolio_products.py. Do not edit by hand.\n(() => {{\n const catalog=window.CS_CATALOG;if(!catalog)return;\n const payload={packed};\n const key=r=>`${{String(r?.[0]??'')}}|${{String(r?.[1]??'').toLowerCase()}}|${{String(r?.[4]??'').toLowerCase()}}|${{String(r?.[6]??'').toLowerCase()}}`;\n for(const [id,p] of Object.entries(payload)){{\n   let c=catalog.collections.find(x=>x.id===id);if(!c){{c={{...p.collection}};catalog.collections.push(c);}}else Object.assign(c,p.collection);\n   const existing=catalog.checklists[id]||[];const seen=new Set(existing.map(key));const merged=[...existing];\n   for(const r of p.rows){{const k=key(r);if(!seen.has(k)){{merged.push(r);seen.add(k);}}}}\n   catalog.checklists[id]=merged;c.coverage='expanded-structured';c.expandedCount=merged.length;c.entryIdentity=true;\n }}\n}})();\n"""

def render_images(images):
    packed=json.dumps(images,ensure_ascii=False,separators=(',',':'))
    return f"// Generated by tools/sync_mycardfolio_products.py.\n(() => {{const r=window.CS_IMAGE_CATALOG=window.CS_IMAGE_CATALOG||{{collections:{{}},cards:{{}}}};r.cards=r.cards||{{}};Object.assign(r.cards,{packed});}})();\n"

async def call(session,name,args):
    res=await session.call_tool(name,arguments=args);return result_json(res)

async def discover_year(session,sport,want):
    data=await call(session,'browse',{'sport':sport})
    values=[]
    for d in objects(data):
        if isinstance(d,dict):
            y=first(d,'year','name','label')
            if y and re.search(r'\d{4}',str(y)):values.append(str(y))
    if want in values:return want
    best=max(values,key=lambda x:match_score(x,want),default=want)
    return best

async def sync_one(session,cfg):
    sport=cfg['sport'];desired_year=cfg['year'];year=await discover_year(session,sport,desired_year)
    products_payload=await call(session,'browse',{'sport':sport,'year':year});products=product_objects(products_payload)
    product,score=choose(products,cfg['product'],('product_id','productId'))
    if not product or score<1:return {'error':'product-not-found','yearUsed':year,'productCandidates':[obj_label(x) for x in products[:30]]},None,None
    pid=str(first(product,'product_id','productId'));sets_payload=await call(session,'browse',{'product_id':pid});sets=set_objects(sets_payload)
    if not sets:return {'error':'no-sets','product':product},None,None
    # Exact product only: enumerate all sets supplied by the product hierarchy.
    rows=[];images={};set_stats=[]
    for s in sets[:MAX_SETS_PER_PRODUCT]:
        sid=str(first(s,'set_id','setId'));sname=obj_label(s) or 'Base';declared=first(s,'count','card_count','cards_count')
        try:check=await call(session,'get_set_checklist',{'set_id':sid})
        except Exception as exc:
            set_stats.append({'setId':sid,'set':sname,'error':repr(exc)});continue
        cards=card_objects(check);set_stats.append({'setId':sid,'set':sname,'declaredCount':declared,'cards':len(cards)})
        for card in cards:
            number=str(first(card,'card_number','number','card_no'));player,team=subject(card)
            if not number or not player:continue
            details=str(first(card,'card_details','details','notes'));cat=category(sname,details);variant=variant_name(sname,cat);card_id=str(first(card,'card_id','cardId'));entry_key=f'mcf:{sid}:{card_id}'
            row=[number,player,team,flags(card,sname),('Base' if cat=='base' else sname),cat,variant,entry_key]
            rows.append(row)
            image=str(first(card,'image_url','image','front_image','front_image_url'));page=str(first(card,'url','card_url'))
            if image.startswith('https://'):
                key=f"{cfg['collectionId']}|{number}|{entry_key}"
                images[key]={'front':image,'kind':'exact','exactVerified':True,'variant':variant,'source':'MyCardfolio structured checklist','sourcePage':page,'sourceImageUrl':image,'label':f'{player} #{number} · {sname} · frente exacto de checklist','verified':[year,cfg['product'],sname,number,player],'verificationMethod':'MyCardfolio product→set→card identity and card-attached image','verifiedAt':time.strftime('%Y-%m-%d')}
    # Deduplicate exact set/card identity only.
    dedup=[];seen=set()
    for r in rows:
        k=(r[0],norm(r[1]),norm(r[4]),norm(r[6]))
        if k in seen:continue
        seen.add(k);dedup.append(r)
    collection={'id':cfg['collectionId'],'sport':cfg.get('appSport',sport),'manufacturer':('Panini' if 'panini' in cfg['product'].lower() else 'Topps'),'year':year_for_collection(cfg),'name':cfg['product'],'shortName':cfg.get('shortName',cfg['product']),'sourceUrl':'https://mycardfolio.com','coverage':'expanded-structured'}
    stats={'yearUsed':year,'productId':pid,'productMatched':obj_label(product),'productScore':score,'sets':len(sets),'setsProcessed':min(len(sets),MAX_SETS_PER_PRODUCT),'rows':len(dedup),'exactFronts':len(images),'setStats':set_stats}
    return stats,{'collection':collection,'rows':dedup},images

async def main_async():
    cfg=json.loads(CONFIG.read_text(encoding='utf-8'));catalog={};images={};report={'startedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'endpoint':URL,'products':{}}
    async with streamable_http_client(URL) as (read,write):
        async with ClientSession(read,write) as session:
            await session.initialize()
            for p in cfg.get('products',[]):
                cid=p['collectionId'];print(f'[{cid}] product sync',flush=True)
                try:
                    stats,cat,img=await sync_one(session,p);report['products'][cid]=stats
                    if cat:catalog[cid]=cat
                    if img:images.update(img)
                    print(f"  -> {stats.get('rows',0)} identities, {stats.get('exactFronts',0)} exact fronts across {stats.get('setsProcessed',0)} sets",flush=True)
                except Exception as exc:report['products'][cid]={'fatalError':repr(exc)};print('  !',exc,flush=True)
    CATALOG_OUT.write_text(render_catalog(catalog),encoding='utf-8');IMAGES_OUT.write_text(render_images(images),encoding='utf-8')
    report['finishedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());report['collectionsWritten']=len(catalog);report['rowsWritten']=sum(len(x['rows']) for x in catalog.values());report['exactFrontsWritten']=len(images)
    REPORT.parent.mkdir(parents=True,exist_ok=True);REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(f"TOTAL: {report['rowsWritten']} identities, {report['exactFrontsWritten']} exact fronts, {report['collectionsWritten']} products")

if __name__=='__main__':asyncio.run(main_async())
