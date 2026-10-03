#!/usr/bin/env python3
"""Probe MyCardfolio public MCP hierarchy and one real complete checklist."""
from __future__ import annotations
import asyncio,json,re,time,unicodedata
from pathlib import Path
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'data'/'mycardfolio-mcp-probe.json';URL='https://mycardfolio.com/api/mcp'

def serial(v):
    if hasattr(v,'model_dump'):return v.model_dump(mode='json')
    if isinstance(v,(dict,list,str,int,float,bool)) or v is None:return v
    return str(v)

def result_text(result):
    for item in getattr(result,'content',[]) or []:
        if hasattr(item,'text') and item.text:return item.text
    return ''

def result_json(result):
    structured=getattr(result,'structuredContent',None)
    if structured:
        d=serial(structured)
        if isinstance(d,dict):return d
    text=result_text(result)
    try:return json.loads(text)
    except Exception:return {'raw':text}

def norm(v):
    s=unicodedata.normalize('NFKD',str(v or ''));s=''.join(c for c in s if not unicodedata.combining(c)).lower()
    return re.sub(r'[^a-z0-9]+',' ',s).strip()

def objects(node):
    if isinstance(node,dict):
        yield node
        for v in node.values():yield from objects(v)
    elif isinstance(node,list):
        for v in node:yield from objects(v)

def get_id(d,*names):
    for n in names:
        if d.get(n):return str(d[n])
    return ''

def label(d):
    for k in ('product','product_name','name','title','set','set_name','label'):
        if d.get(k):return str(d[k])
    return ''

def best(items,want,id_names):
    wt=norm(want).split();best=None;score=-1
    for d in items:
        if not isinstance(d,dict) or not get_id(d,*id_names):continue
        hay=norm(label(d));hits=sum(t in hay.split() for t in wt);bonus=4 if norm(want)==hay else 0
        sc=hits+bonus
        if sc>score:score=sc;best=d
    return best,score

async def main_async():
    report={'endpoint':URL,'startedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
    try:
        async with streamable_http_client(URL) as (read,write):
            async with ClientSession(read,write) as session:
                init=await session.initialize();report['serverInfo']=serial(getattr(init,'serverInfo',None) or getattr(init,'server_info',None));report['protocolVersion']=getattr(init,'protocolVersion',None) or getattr(init,'protocol_version',None)
                listed=await session.list_tools();report['tools']=[{'name':t.name,'description':getattr(t,'description',''),'inputSchema':serial(getattr(t,'inputSchema',None) or getattr(t,'input_schema',None) or {})} for t in listed.tools]
                root=result_json(await session.call_tool('browse',arguments={}));report['browseRoot']=root
                products=result_json(await session.call_tool('browse',arguments={'sport':'Baseball','year':'2026'}));report['baseball2026Products']=products
                product,pscore=best(list(objects(products)),'Topps Chrome Baseball',('product_id','productId','id'))
                report['chosenProduct']={'match':product,'score':pscore}
                product_id=get_id(product or {},'product_id','productId','id')
                if product_id:
                    sets=result_json(await session.call_tool('browse',arguments={'product_id':product_id}));report['chosenProductSets']=sets
                    candidates=[]
                    for d in objects(sets):
                        if not isinstance(d,dict):continue
                        sid=get_id(d,'set_id','setId','id')
                        if sid:candidates.append(d)
                    # Prefer a plain/base/chrome set and avoid explicit parallels/inserts for the sample.
                    def rank_set(d):
                        n=norm(label(d));pen=sum(x in n for x in ('refractor','parallel','auto','autograph','insert','gold','red','blue','pink','black','green','orange'))
                        return (5 if n in {'base','chrome','base set','base cards'} else 0)+(2 if 'chrome' in n else 0)-pen*3
                    chosen=max(candidates,key=rank_set,default=None);report['chosenSet']=chosen
                    set_id=get_id(chosen or {},'set_id','setId','id')
                    if set_id:
                        checklist=result_json(await session.call_tool('get_set_checklist',arguments={'set_id':set_id}));report['chosenSetChecklist']=checklist
                        cards=[]
                        for d in objects(checklist):
                            if isinstance(d,dict) and d.get('card_number') and (d.get('card_id') or d.get('subjects')):cards.append(d)
                        report['chosenSetCardCountDetected']=len(cards);report['chosenSetFirstCards']=cards[:5]
                search=result_json(await session.call_tool('search_cards',arguments={'query':'2026 Topps Chrome Baseball','sport':'Baseball','year':'2026','limit':3}));report['searchSample']=search
    except Exception as e:report['fatalError']=repr(e)
    report['finishedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2,default=str)+'\n',encoding='utf-8');print(json.dumps(report,ensure_ascii=False,indent=2)[:30000])

if __name__=='__main__':asyncio.run(main_async())
