#!/usr/bin/env python3
"""Expand sports-card products from TCDB at product scale.

The sync imports each root checklist plus canonical insert/autograph/relic subsets,
while collapsing color/finish parallel trees into searchable metadata instead of
multiplying the catalog by every repeated parallel. It can also create a collection
that does not yet exist in the hand-maintained app catalog.
"""
from __future__ import annotations
import json,re,time,urllib.robotparser
from collections import defaultdict
from pathlib import Path
import requests
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
CONFIG=ROOT/'tools'/'tcdb_product_sources.json'
OUTPUT=ROOT/'catalog-tcdb-expanded.js'
REPORT=ROOT/'data'/'tcdb-product-sync-report.json'
UA='CollectorsSportsCatalog/2.0 (+https://github.com/alandealba31-sketch/collectors-sports)'
SESSION=requests.Session();SESSION.headers.update({'User-Agent':UA,'Accept-Language':'en-US,en;q=0.8'})
DELAY=.32;LAST=0.0
ROBOTS=urllib.robotparser.RobotFileParser('https://www.tcdb.com/robots.txt')
try: ROBOTS.read()
except Exception: ROBOTS.disallow_all=True

PARALLEL_WORDS=re.compile(r'\b(refractor|foil|fractor|prizm|parallel|lava|geometric|diamond|diamonds|wave|raywave|ray wave|x-fractor|superfractor|sapphire|atomic|mojo|shimmer|speckle|sepia|negative|frozen|ice|icy|gold|orange|red|black|green|blue|aqua|purple|pink|teal|yellow|silver|bronze|white|rose|neon|nightshade|first 11|mini|ruby|burgundy|amber|violet|jade|obsidian|masterpiece|artist proof|crimson|turquoise|clearfractor|power surge|surge)\b',re.I)

def throttle():
    global LAST
    wait=DELAY-(time.monotonic()-LAST)
    if wait>0:time.sleep(wait)
    LAST=time.monotonic()

def get(url):
    if not ROBOTS.can_fetch(UA,url):raise PermissionError(f'robots.txt blocks {url}')
    throttle();r=SESSION.get(url,timeout=35);r.raise_for_status();return r.text

def clean(s):return re.sub(r'\s+',' ',str(s or '')).strip()

def category_for(name):
    n=name.lower()
    if 'auto' in n or 'signature' in n:return 'autograph'
    if 'relic' in n or 'memorabilia' in n or 'patch' in n:return 'relic'
    if 'rookie' in n or 'prospect' in n:return 'rookie-insert'
    return 'insert'

def row_flags(text):
    t=f' {text.upper()} ';out=[]
    for token in ('RC','AU','SP','SSP','VAR','MEM'):
        if re.search(rf'\b{token}\b',t):out.append('AUTO' if token=='AU' else token)
    m=re.search(r'\bSN\s*(\d+)\b',t)
    if m:out.append(f'SN{m.group(1)}')
    return out or 0

def parse_checklist(sid,subset,category,max_pages=30):
    rows=[];seen=set();empty=0
    for page in range(1,max_pages+1):
        soup=BeautifulSoup(get(f'https://www.tcdb.com/Checklist.cfm/sid/{sid}?PageIndex={page}'),'html.parser');added=0
        for card in soup.find_all('a',href=re.compile(r'ViewCard\.cfm')):
            number=clean(card.get_text(' ',strip=True)).lstrip('#')
            if not number:continue
            tr=card.find_parent('tr')
            if tr is None:continue
            anchors=[a for a in tr.find_all('a',href=True) if clean(a.get_text(' ',strip=True))]
            try:idx=anchors.index(card)
            except ValueError:continue
            following=[clean(a.get_text(' ',strip=True)) for a in anchors[idx+1:]]
            following=[x for x in following if x and x not in {'Add','Edit'}]
            if not following:continue
            player=following[0];team=following[-1] if len(following)>=2 and following[-1]!=player else ''
            text=clean(tr.get_text(' ',strip=True));key=(number,player,subset)
            if key in seen:continue
            seen.add(key);entry_key=f'{subset}|{number}|{player}'
            rows.append([number,player,team,row_flags(text),subset,category,'Base',entry_key,str(sid)]);added+=1
        if added==0:
            empty+=1
            if page>1 and empty>=2:break
        else:empty=0
    return rows

def related_sets(root_sid):
    soup=BeautifulSoup(get(f'https://www.tcdb.com/Inserts.cfm/sid/{root_sid}'),'html.parser')
    inserts=[];parallels=[];seen=set()
    for a in soup.find_all('a',href=re.compile(r'Checklist\.cfm/sid/')):
        m=re.search(r'/sid/(\d+)',a.get('href',''))
        if not m:continue
        sid=int(m.group(1));title=clean(a.get_text(' ',strip=True))
        if sid==root_sid or sid in seen or not title:continue
        h3=a.find_previous('h3');section=clean(h3.get_text(' ',strip=True)) if h3 else ''
        rec={'sid':sid,'name':title}
        if section.lower().startswith('parallel sets'):parallels.append(rec)
        elif section.lower().startswith('insert sets'):inserts.append(rec)
        else:continue
        seen.add(sid)
    return inserts,parallels

def collapse_insert_variants(records):
    names=[r['name'] for r in records];by={r['name']:r for r in records};canonical=[];variants=defaultdict(list)
    for name in sorted(names,key=len):
        parent=None
        for short in sorted((x for x in names if len(x)<len(name)),key=len,reverse=True):
            if not name.startswith(short+' '):continue
            suffix=name[len(short)+1:]
            if PARALLEL_WORDS.search(suffix):parent=short;break
        if parent:variants[parent].append(name[len(parent)+1:])
        else:canonical.append(by[name])
    return canonical,{k:sorted(set(v)) for k,v in variants.items()}

def dedupe_rows(rows):
    out=[];seen=set()
    for r in rows:
        k=(str(r[0]),str(r[1]).lower(),str(r[4]).lower())
        if k in seen:continue
        seen.add(k);out.append(r)
    return out

def collection_meta(p,base_count):
    name=p['setName'];year_match=re.match(r'^(\d{4}(?:-\d{2})?)\s+',name)
    year=year_match.group(1) if year_match else p.get('year','')
    manufacturer=p.get('manufacturer') or ('Panini' if 'panini' in name.lower() else 'Topps' if 'topps' in name.lower() or 'finest' in name.lower() else '')
    return {'id':p['collectionId'],'sport':p.get('sport','Soccer'),'manufacturer':manufacturer,'year':year,'name':name,'shortName':p.get('shortName',name),'sourceUrl':f"https://www.tcdb.com/ViewSet.cfm/sid/{p['sid']}",'checklistUrl':f"https://www.tcdb.com/Checklist.cfm/sid/{p['sid']}",'coverage':'expanded-checklist','baseCount':base_count}

def sync_product(p):
    root_sid=int(p['sid']);root_rows=parse_checklist(root_sid,'Base','base')
    insert_records,parallel_records=related_sets(root_sid);canonical,insert_variants=collapse_insert_variants(insert_records)
    rows=list(root_rows);subset_stats={'Base':len(root_rows)};errors=[]
    for item in canonical:
        try:
            subset_rows=parse_checklist(item['sid'],item['name'],category_for(item['name']))
            if subset_rows:rows.extend(subset_rows);subset_stats[item['name']]=len(subset_rows)
        except Exception as exc:errors.append(f"{item['name']}: {exc}")
    rows=dedupe_rows(rows)
    base_parallels=sorted({x['name'] for x in parallel_records})
    all_parallel_names=sorted(set(base_parallels+[v for values in insert_variants.values() for v in values]))
    meta={'parallels':all_parallel_names,'parallelBySubset':{'Base':base_parallels,**insert_variants},'inserts':sorted(set(subset_stats)-{'Base'}),'aliases':{'superfractor':'SuperFractor','frozenfractor':'FrozenFractor','bajo cero':'FrozenFractor'},'source':'Trading Card Database related-set index','sourceSid':root_sid,'sourceUrl':f'https://www.tcdb.com/Checklist.cfm/sid/{root_sid}','verified':time.strftime('%Y-%m-%d')}
    stats={'rootSid':root_sid,'baseRows':len(root_rows),'rows':len(rows),'canonicalSubsets':len(subset_stats),'relatedInsertSets':len(insert_records),'baseParallelSets':len(parallel_records),'errors':errors[:50]}
    return {'rows':rows,'meta':meta,'collection':collection_meta(p,len(root_rows)),'stats':stats}

def render(payload):
    packed=json.dumps(payload,ensure_ascii=False,separators=(',',':'))
    return f"""// Generated by tools/sync_tcdb_products.py. Do not edit by hand.\n(() => {{\n const catalog=window.CS_CATALOG;if(!catalog)return;window.CS_SET_META=window.CS_SET_META||{{}};\n const data={packed};\n for(const [id,p] of Object.entries(data)){{\n  let c=catalog.collections.find(x=>x.id===id);\n  if(!c){{c={{...p.collection}};catalog.collections.push(c);}}else Object.assign(c,p.collection);\n  c.entryIdentity=true;c.coverage='expanded-checklist';c.expandedCount=p.rows.length;\n  catalog.checklists[id]=p.rows;window.CS_SET_META[id]=Object.assign({{}},window.CS_SET_META[id]||{{}},p.meta);\n }}\n}})();\n"""

def main():
    cfg=json.loads(CONFIG.read_text(encoding='utf-8'));data={};report={'startedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'products':{}}
    for product in cfg.get('products',[]):
        cid=product['collectionId'];print(f'[{cid}] syncing root + related sets',flush=True)
        try:
            r=sync_product(product);data[cid]={'rows':r['rows'],'meta':r['meta'],'collection':r['collection']};report['products'][cid]=r['stats'];print(f"  -> {r['stats']['rows']} canonical identities across {r['stats']['canonicalSubsets']} subsets",flush=True)
        except Exception as exc:report['products'][cid]={'fatalError':str(exc)};print(f'  ! {exc}',flush=True)
    if data:OUTPUT.write_text(render(data),encoding='utf-8')
    REPORT.parent.mkdir(parents=True,exist_ok=True);report['finishedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());report['totalRows']=sum(len(v['rows']) for v in data.values());REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(f"Wrote {OUTPUT.name}: {report['totalRows']} canonical identities across {len(data)} products")

if __name__=='__main__':main()
