#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(src=>/^catalog.*\.js$/.test(path.basename(src)));
const context={window:{},console,localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{},clear:()=>{}},sessionStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{},clear:()=>{}},setTimeout:()=>0,clearTimeout:()=>{},URL,Intl};
context.window.window=context.window;context.globalThis=context;vm.createContext(context);
for(const src of scripts){const file=path.join(root,src);if(!fs.existsSync(file))continue;try{vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:src,timeout:10000});}catch{}}
const catalog=context.window.CS_CATALOG||{collections:[],checklists:{}};
const images=context.window.CS_IMAGE_CATALOG||{cards:{}};
const owned=JSON.parse(fs.readFileSync(path.join(root,'data/user-collection-priority.json'),'utf8')).collections||[];
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const exactByBucket=new Map();
for(const [key,img] of Object.entries(images.cards||{})){
  if(!(img?.kind==='exact'&&img?.exactVerified===true&&img?.front))continue;
  const [cid,num]=key.split('|');const b=`${cid}|${norm(num)}`;if(!exactByBucket.has(b))exactByBucket.set(b,[]);exactByBucket.get(b).push(img);
}
const rows=[];
for(const item of owned){
  const cid=item.collectionId||'';const collection=(catalog.collections||[]).find(c=>c.id===cid);
  const checklist=catalog.checklists?.[cid]||[];
  let variants=0,base=0,numbered=0,autos=0,relics=0,exact=0;
  const unique=new Set();
  for(const r of checklist){
    if(!Array.isArray(r)||!r[0]||!r[1])continue;
    const subset=String(r[4]||'Base');const variant=String(r[6]||subset||'Base');const flags=Array.isArray(r[3])?r[3]:[];
    const k=[norm(r[0]),norm(r[1]),norm(subset),norm(variant)].join('|');if(unique.has(k))continue;unique.add(k);variants++;
    if(norm(variant)==='base'||norm(subset)==='base')base++;
    if(/\/\d+|1\/1|numbered|serial/i.test(`${variant} ${subset}`))numbered++;
    if(flags.includes('AUTO')||/auto|autograph|signature/i.test(`${variant} ${subset}`))autos++;
    if(flags.includes('RELIC')||/relic|patch|memorabilia|swatch|material/i.test(`${variant} ${subset}`))relics++;
    const candidates=exactByBucket.get(`${cid}|${norm(r[0])}`)||[];
    const playerTokens=norm(r[1]).split(' ').filter(x=>x.length>1);
    const variantTokens=norm(variant).split(' ').filter(x=>!['base','cards','card','the','and'].includes(x));
    const hit=candidates.some(img=>{const hay=norm([img.label,...(img.verified||[]),img.variant||''].join(' '));const hs=new Set(hay.split(' '));if(playerTokens.length&&!playerTokens.every(t=>hs.has(t)))return false;if(norm(variant)!=='base'&&variantTokens.length&&!variantTokens.every(t=>hs.has(t)))return false;return true;});
    if(hit)exact++;
  }
  rows.push({collectionId:cid,name:item.name,season:item.season,ownedRows:item.ownedRows,catalogPresent:Boolean(collection),checklistRows:checklist.length,uniqueIdentities:variants,baseIdentities:base,numberedIdentities:numbered,autographIdentities:autos,relicIdentities:relics,exactFrontIdentities:exact,exactFrontCoveragePct:variants?Number((exact*100/variants).toFixed(2)):0,status:!collection?'missing-collection':!checklist.length?'missing-checklist':exact<variants?'needs-images':'covered'});
}
rows.sort((a,b)=>(a.status==='missing-collection'?-1:0)-(b.status==='missing-collection'?-1:0)||a.exactFrontCoveragePct-b.exactFrontCoveragePct||b.ownedRows-a.ownedRows);
const report={generatedAt:new Date().toISOString(),source:'data/user-collection-priority.json',collections:rows,totals:{ownedPriorityCollections:rows.length,missingCollections:rows.filter(x=>!x.catalogPresent).length,missingChecklists:rows.filter(x=>x.catalogPresent&&!x.checklistRows).length,uniqueIdentities:rows.reduce((s,x)=>s+x.uniqueIdentities,0),exactFrontIdentities:rows.reduce((s,x)=>s+x.exactFrontIdentities,0)}};
fs.writeFileSync(path.join(root,'data/owned-collection-gap-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
