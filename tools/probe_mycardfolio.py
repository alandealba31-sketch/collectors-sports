#!/usr/bin/env python3
"""Probe MyCardfolio's public MCP so the catalog sync can use its intended API.

The server advertises read-only, unauthenticated, rate-limited access for personal
and assistant use. This probe records tool schemas and a tiny browse/search sample;
it never crawls HTML pages.
"""
from __future__ import annotations
import asyncio,json,time
from pathlib import Path
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data'/'mycardfolio-mcp-probe.json'
URL='https://mycardfolio.com/api/mcp'

def serial(v):
    if hasattr(v,'model_dump'):return v.model_dump(mode='json')
    if isinstance(v,(dict,list,str,int,float,bool)) or v is None:return v
    return str(v)

def tool_result(result):
    out={'isError':bool(getattr(result,'isError',False))}
    structured=getattr(result,'structuredContent',None)
    if structured is not None:out['structuredContent']=serial(structured)
    contents=[]
    for item in getattr(result,'content',[]) or []:
        if hasattr(item,'text'):contents.append({'type':'text','text':item.text})
        else:contents.append(serial(item))
    if contents:out['content']=contents
    return out

async def main_async():
    report={'endpoint':URL,'startedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
    try:
        async with streamable_http_client(URL) as (read,write):
            async with ClientSession(read,write) as session:
                init=await session.initialize();report['serverInfo']=serial(getattr(init,'serverInfo',None) or getattr(init,'server_info',None));report['protocolVersion']=getattr(init,'protocolVersion',None) or getattr(init,'protocol_version',None)
                listed=await session.list_tools();report['tools']=[]
                by={}
                for t in listed.tools:
                    schema=serial(getattr(t,'inputSchema',None) or getattr(t,'input_schema',None) or {})
                    item={'name':t.name,'description':getattr(t,'description',''),'inputSchema':schema};report['tools'].append(item);by[t.name]=item
                # Tiny calls only, enough to learn response shape.
                if 'browse' in by:
                    schema=by['browse']['inputSchema'] or {};required=schema.get('required',[]) if isinstance(schema,dict) else []
                    if not required:
                        try:report['browseSample']=tool_result(await session.call_tool('browse',arguments={}))
                        except Exception as e:report['browseSampleError']=repr(e)
                if 'search_cards' in by:
                    props=(by['search_cards']['inputSchema'] or {}).get('properties',{})
                    args={}
                    for key in props:
                        low=key.lower()
                        if low in {'q','query','search','text','term'}:args[key]='2026 Topps Chrome Baseball'
                        elif low=='sport':args[key]='baseball'
                        elif low=='year':args[key]='2026'
                        elif low in {'limit','per_page','perpage'}:args[key]=3
                    required=(by['search_cards']['inputSchema'] or {}).get('required',[])
                    if all(k in args for k in required):
                        try:report['searchSampleArgs']=args;report['searchSample']=tool_result(await session.call_tool('search_cards',arguments=args))
                        except Exception as e:report['searchSampleError']=repr(e)
    except Exception as e:
        report['fatalError']=repr(e)
    report['finishedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2,default=str)+'\n',encoding='utf-8');print(json.dumps(report,ensure_ascii=False,indent=2)[:18000])

if __name__=='__main__':asyncio.run(main_async())
