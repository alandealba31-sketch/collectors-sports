#!/usr/bin/env python3
"""Incrementally import product trees and card-attached fronts from MyCardfolio MCP.

Scale strategy:
- work by product -> set -> complete checklist, never by player search;
- sort sets by declared card count so one API call yields as many identities as possible;
- process a bounded number of sets from every product each run (round-robin fairness);
- persist completed set ids and previously generated rows/images across runs;
- respect provider limits with proactive pacing and automatic 65s backoff/retry.
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
STATE=ROOT/'data'/'mycardfolio-sync-state.json'
URL='https://mycardfolio.com/api/mcp'
SETS_PER_PRODUCT_PER_RUN=60
REQUEST_DELAY=1.25
RATE_LIMIT_WAIT=65
MAX_RATE_RETRIES=8
MAX_RUNTIME=44*60

PARALLEL_WORDS=re.compile(r'\b(refractor|prizm|parallel|foil|gold|orange|red|black|green|blue|aqua|purple|pink|teal|yellow|silver|bronze|sepia|negative|frozen|superfractor|sapphire|atomic|mojo|lava|wave|raywave|x-fractor|geometric|ruby|burgundy|amber|violet|jade|obsidian|artist proof)\b',re.I)
AUTO_WORDS=re.compile(r'\b(auto|autograph|signature|signatures)\b',re.I)
RELIC_WORDS=re.compile(r'\b(relic|memorabilia|patch|jersey)\b',re.I)
LAST_CALL=0.0


def norm(v:Any)->str:
    s=unicodedata.normalize('NFKD',str(v or ''));s=''.join(c for c in s if not unicodedata.combining(c)).lower().replace('&',' and ')
    return re.sub(r'[^a-z0-9]+',' ',s).strip()

def load_json(path,default):
    try:return json.loads(path.read_text(encoding='utf-8'))
    except Exception:return default

def extract_generated(path,pattern):
    try:
        text=path.read_text(encoding='utf-8');m=re.search(pattern,text,re.S)
        return json.loads(m.group(1)) if m else {}
    except Exception:return {}

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
        x=subs[0] if isinstance(subs[0],dict) else {'subject_name':subs[0]}
        return str(first(x,'subject_name','name','player','subject')),str(first(x,'team_name','team'))
    return str(first(card,'player','subject_name','name','athlete','fighter','wrestler')),str(first(card,'team','team_name'))

def card_objects(payload):
    out=[];seen=set()
    for d in objects(payload):
        if not isinstance(d,dict):continue
        number=first(d,'card_number','number','card_no');cid=first(d,'card_id','cardId');player,_=subject(d)
        if not number or not player or not cid or str(cid) in seen:continue
        seen.add(str(cid));out.append(d)
    return out

def set_objects(payload):
    out=[];seen=set()
    for d in objects(payload):
        if not isinstance(d,dict):continue
        sid=first(d,'set_id','setId')
        if not sid or str(sid) in seen:continue
        seen.add(str(sid));out.append(d)
    return out

def product_objects(payload):
    out=[];seen=set()
    for d in objects(payload):
        if not isinstance(d,dict):continue
        pid=first(d,'product_id','productId')
        if not pid or str(pid) in seen:continue
        seen.add(str(pid));out.append(d)
    return out

def flags(card,set_name):
    details=' '.join(str(first(card,k)) for k in ('card_details','details','notes','attributes'))+' '+set_name;u=details.upper();out=[]
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
    if norm(set_name) in {'base','base set','base cards','chrome','bowman chrome'}:return 'base'
    if PARALLEL_WORDS.search(set_name):return 'parallel'
    return 'insert'

def variant_name(set_name,cat):return 'Base' if cat=='base' else set_name

def year_for_collection(cfg):return cfg.get('displayYear') or ('2025/26' if cfg.get('year')=='2025' and '25/26' in cfg.get('shortName','') else cfg.get('year',''))

def declared_count(s):
    try:return int(first(s,'count','card_count','cards_count') or 0)
    except Exception:return 0

def set_priority(s):
    name=norm(obj_label(s));count=declared_count(s)
    # High-yield full/base/prospect/auto/insert groups before one-card color parallels.
    canonical=0
    if name in {'base','base set','base cards','chrome','bowman chrome'}:canonical+=10000
    if any(x in name for x in ('prospect','rookie','autograph','auto','insert','relic','memorabilia')):canonical+=2500
    if PARALLEL_WORDS.search(name) and count<=2:canonical-=2500
    return (canonical+count*100,count,name)

def row_key(r):return (str(r[0]),norm(r[1]),norm(r[4] if len(r)>4 else ''),norm(r[6] if len(r)>6 else ''))

def render_catalog(data):
    packed=json.dumps(data,ensure_ascii=False,separators=(',',':'))
    return f"""// Generated by tools/sync_mycardfolio_products.py. Do not edit by hand.\n(() => {{\n const catalog=window.CS_CATALOG;if(!catalog)return;\n const payload={packed};\n const key=r=>`${{String(r?.[0]??'')}}|${{String(r?.[1]??'').toLowerCase()}}|${{String(r?.[4]??'').toLowerCase()}}|${{String(r?.[6]??'').toLowerCase()}}`;\n for(const [id,p] of Object.entries(payload)){{\n   let c=catalog.collections.find(x=>x.id===id);if(!c){{c={{...p.collection}};catalog.collections.push(c);}}else Object.assign(c,p.collection);\n   const existing=catalog.checklists[id]||[];const seen=new Set(existing.map(key));const merged=[...existing];\n   for(const r of p.rows){{const k=key(r);if(!seen.has(k)){{merged.push(r);seen.add(k);}}}}\n   catalog.checklists[id]=merged;c.coverage='expanded-structured';c.expandedCount=merged.length;c.entryIdentity=true;\n }}\n}})();\n"""

def render_images(images):
    packed=json.dumps(images,ensure_ascii=False,separators=(',',':'))
    return f"// Generated by tools/sync_mycardfolio_products.py.\n(() => {{const r=window.CS_IMAGE_CATALOG=window.CS_IMAGE_CATALOG||{{collections:{{}},cards:{{}}}};r.cards=r.cards||{{}};Object.assign(r.cards,{packed});}})();\n"

def write_outputs(catalog,images,state,report):
    CATALOG_OUT.write_text(render_catalog(catalog),encoding='utf-8');IMAGES_OUT.write_text(render_images(images),encoding='utf-8')
    STATE.parent.mkdir(parents=True,exist_ok=True);STATE.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

async def paced_call(session,name,args):
    global LAST_CALL
    for attempt in range(MAX_RATE_RETRIES+1):
        gap=time.monotonic()-LAST_CALL
        if gap<REQUEST_DELAY:await asyncio.sleep(REQUEST_DELAY-gap)
        try:
            res=await session.call_tool(name,arguments=args);LAST_CALL=time.monotonic();return result_json(res)
        except Exception as exc:
            LAST_CALL=time.monotonic();msg=str(exc).lower()
            if 'rate limit' in msg and attempt<MAX_RATE_RETRIES:
                wait=RATE_LIMIT_WAIT+attempt*5;print(f'    rate limit: waiting {wait}s then retrying...',flush=True);await asyncio.sleep(wait);continue
            if attempt<2:
                await asyncio.sleep(4*(attempt+1));continue
            raise

async def main_async():
    started=time.monotonic();cfg=json.loads(CONFIG.read_text(encoding='utf-8'))
    catalog=extract_generated(CATALOG_OUT,r'const payload=(\{.*?\});\n const key=')
    images=extract_generated(IMAGES_OUT,r'Object\.assign\(r\.cards,(\{.*\})\);')
    state=load_json(STATE,{'version':1,'products':{}})
    report={'startedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'endpoint':URL,'setsPerProductPerRun':SETS_PER_PRODUCT_PER_RUN,'requestDelaySeconds':REQUEST_DELAY,'products':{}}
    browse_cache={};year_cache={}
    async with streamable_http_client(URL) as (read,write):
        async with ClientSession(read,write) as session:
            await session.initialize()
            for p in cfg.get('products',[]):
                if time.monotonic()-started>MAX_RUNTIME:report['stoppedForRuntimeBudget']=True;break
                cid=p['collectionId'];print(f'[{cid}] high-yield structured sync',flush=True);ps=state['products'].setdefault(cid,{'processedSets':[]});processed=set(ps.get('processedSets',[]));stats={'setsFetchedThisRun':0,'rowsAddedThisRun':0,'imagesAddedThisRun':0}
                try:
                    sport=p['sport'];desired=p['year']
                    if sport not in year_cache:
                        root=await paced_call(session,'browse',{'sport':sport});vals=[]
                        for d in objects(root):
                            if isinstance(d,dict):
                                y=first(d,'year','name','label')
                                if y and re.search(r'\d{4}',str(y)):vals.append(str(y))
                        year_cache[sport]=vals
                    year=desired if desired in year_cache[sport] else max(year_cache[sport],key=lambda x:match_score(x,desired),default=desired)
                    pk=(sport,year)
                    if pk not in browse_cache:browse_cache[pk]=product_objects(await paced_call(session,'browse',{'sport':sport,'year':year}))
                    product,score=choose(browse_cache[pk],p['product'],('product_id','productId'))
                    if not product or score<1:
                        stats.update({'error':'product-not-found','yearUsed':year});report['products'][cid]=stats;continue
                    pid=str(first(product,'product_id','productId'));sets=set_objects(await paced_call(session,'browse',{'product_id':pid}));sets.sort(key=set_priority,reverse=True)
                    pending=[s for s in sets if str(first(s,'set_id','setId')) not in processed]
                    selected=pending[:SETS_PER_PRODUCT_PER_RUN]
                    existing=catalog.get(cid,{'collection':{'id':cid,'sport':p.get('appSport',sport),'manufacturer':('Panini' if 'panini' in p['product'].lower() else 'Topps'),'year':year_for_collection(p),'name':p['product'],'shortName':p.get('shortName',p['product']),'sourceUrl':'https://mycardfolio.com','coverage':'expanded-structured'},'rows':[]})
                    row_seen={row_key(r) for r in existing.get('rows',[])}
                    for ix,s in enumerate(selected,1):
                        if time.monotonic()-started>MAX_RUNTIME:report['stoppedForRuntimeBudget']=True;break
                        sid=str(first(s,'set_id','setId'));sname=obj_label(s) or 'Base';check=await paced_call(session,'get_set_checklist',{'set_id':sid});cards=card_objects(check)
                        for card in cards:
                            number=str(first(card,'card_number','number','card_no'));player,team=subject(card)
                            if not number or not player:continue
                            details=str(first(card,'card_details','details','notes'));cat=category(sname,details);variant=variant_name(sname,cat);card_id=str(first(card,'card_id','cardId'));entry_key=f'mcf:{sid}:{card_id}'
                            row=[number,player,team,flags(card,sname),('Base' if cat=='base' else sname),cat,variant,entry_key]
                            rk=row_key(row)
                            if rk not in row_seen:existing['rows'].append(row);row_seen.add(rk);stats['rowsAddedThisRun']+=1
                            image=str(first(card,'image_url','image','front_image','front_image_url'));page=str(first(card,'url','card_url'))
                            if image.startswith('https://'):
                                key=f'{cid}|{number}|{entry_key}'
                                if key not in images:stats['imagesAddedThisRun']+=1
                                images[key]={'front':image,'kind':'exact','exactVerified':True,'variant':variant,'source':'MyCardfolio structured card record','sourcePage':page,'sourceImageUrl':image,'label':f'{player} #{number} · {sname} · frente estructurado','verified':[year,p['product'],sname,number,player],'verificationMethod':'product→set→card_id identity + card-attached image','verifiedAt':time.strftime('%Y-%m-%d'),'confidence':'structured-high'}
                        processed.add(sid);stats['setsFetchedThisRun']+=1
                        if ix%10==0:
                            ps['processedSets']=sorted(processed);catalog[cid]=existing;write_outputs(catalog,images,state,report);print(f"    {ix}/{len(selected)} sets · +{stats['rowsAddedThisRun']} rows · +{stats['imagesAddedThisRun']} fronts",flush=True)
                    ps['processedSets']=sorted(processed);ps['productId']=pid;ps['yearUsed']=year;ps['knownSets']=len(sets);catalog[cid]=existing
                    stats.update({'yearUsed':year,'productId':pid,'productMatched':obj_label(product),'knownSets':len(sets),'processedSetsTotal':len(processed),'remainingSets':max(0,len(sets)-len(processed)),'rowsAccumulated':len(existing['rows'])})
                except Exception as exc:stats['fatalError']=repr(exc);print('  !',exc,flush=True)
                report['products'][cid]=stats;write_outputs(catalog,images,state,report)
                print(f"  -> +{stats.get('rowsAddedThisRun',0)} identities, +{stats.get('imagesAddedThisRun',0)} fronts; {stats.get('processedSetsTotal',0)}/{stats.get('knownSets','?')} sets done",flush=True)
    report['finishedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());report['collectionsWritten']=len(catalog);report['rowsWritten']=sum(len(x.get('rows',[])) for x in catalog.values());report['exactFrontsWritten']=len(images);report['runtimeSeconds']=round(time.monotonic()-started,1)
    write_outputs(catalog,images,state,report);print(f"TOTAL ACCUMULATED: {report['rowsWritten']} identities, {report['exactFrontsWritten']} structured fronts, {report['collectionsWritten']} products")

if __name__=='__main__':asyncio.run(main_async())
