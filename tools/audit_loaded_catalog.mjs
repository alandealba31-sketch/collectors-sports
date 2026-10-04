#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(src=>/^catalog.*\.js$/.test(path.basename(src)));

const store=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
const context={window:{},console,localStorage,sessionStorage:localStorage,setTimeout:()=>0,clearTimeout:()=>{},URL,Intl};
context.window.window=context.window;
context.window.localStorage=localStorage;
context.window.sessionStorage=localStorage;
context.globalThis=context;
vm.createContext(context);

const failures=[];
for(const src of scripts){
  const file=path.join(root,src);
  if(!fs.existsSync(file)){failures.push({file:src,error:'missing'});continue;}
  try{vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:src,timeout:10000});}
  catch(error){failures.push({file:src,error:String(error?.message||error)});}
}

const catalog=context.window.CS_CATALOG||{collections:[],checklists:{}};
const imageCatalog=context.window.CS_IMAGE_CATALOG||{cards:{}};
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const canonicalSport=s=>({Baseball:'MLB',Football:'NFL','Formula 1':'F1',Racing:'F1',Basketball:'NBA',Wrestling:'WWE'}[s]||s||'Other');

const collections=[];
const identities=new Set();
const bySport={};
const idsByCollection={};
for(const c of catalog.collections||[]){
  const rows=catalog.checklists?.[c.id]||[];
  const local=new Set();
  for(const r of rows){
    if(!Array.isArray(r)||!r[0]||!r[1])continue;
    const variant=r[6]||r[4]||'Base';
    const key=[c.id,norm(r[0]),norm(r[1]),norm(r[4]||'Base'),norm(variant)].join('|');
    local.add(key);identities.add(key);
  }
  if(!rows.length&&!c.name)continue;
  const sport=canonicalSport(c.sport);
  bySport[sport]=(bySport[sport]||0)+local.size;
  idsByCollection[c.id]=local;
  collections.push({id:c.id,name:c.shortName||c.name||c.id,sport,rows:rows.length,identities:local.size,coverage:c.coverage||''});
}

const verifiedRecords=[];
const exactIdentityFingerprints=new Set();
for(const [key,img] of Object.entries(imageCatalog.cards||{})){
  if(!(img?.kind==='exact'&&img?.exactVerified===true&&img?.front))continue;
  verifiedRecords.push(key);
  const parts=key.split('|');
  const cid=parts[0]||''; const num=parts[1]||'';
  const player=(img.verified||[]).slice().reverse().find(x=>typeof x==='string'&&/[A-Za-z]/.test(x))||img.label||'';
  const variant=img.variant||'Base';
  exactIdentityFingerprints.add([cid,norm(num),norm(player),norm(variant)].join('|'));
}

// Coverage: determine how many searchable identities can resolve to at least one verified image
// by collection + number + player token overlap + variant/subset. This mirrors the app conservatively.
let searchableWithExactFront=0;
const exactByCollectionNumber=new Map();
for(const [key,img] of Object.entries(imageCatalog.cards||{})){
  if(!(img?.kind==='exact'&&img?.exactVerified===true&&img?.front))continue;
  const [cid,num]=key.split('|');const bucket=`${cid}|${norm(num)}`;
  if(!exactByCollectionNumber.has(bucket))exactByCollectionNumber.set(bucket,[]);
  exactByCollectionNumber.get(bucket).push(img);
}
for(const c of catalog.collections||[]){
  const localSeen=new Set();
  for(const r of catalog.checklists?.[c.id]||[]){
    if(!Array.isArray(r)||!r[0]||!r[1])continue;
    const variant=r[6]||r[4]||'Base';
    const identity=[c.id,norm(r[0]),norm(r[1]),norm(r[4]||'Base'),norm(variant)].join('|');
    if(localSeen.has(identity))continue;localSeen.add(identity);
    const candidates=exactByCollectionNumber.get(`${c.id}|${norm(r[0])}`)||[];
    const pt=norm(r[1]).split(' ').filter(x=>x.length>1);
    const vt=norm(variant).split(' ').filter(x=>!['base','cards','card','the','and'].includes(x));
    const hit=candidates.some(img=>{
      const hay=norm([img.label,...(img.verified||[])].join(' '));const hs=new Set(hay.split(' '));
      if(pt.length&&!pt.every(t=>hs.has(t)))return false;
      const iv=norm(img.variant||'Base');
      if(vt.length&&norm(variant)!=='base'&&!vt.every(t=>new Set(norm(`${iv} ${hay}`).split(' ')).has(t)))return false;
      return true;
    });
    if(hit)searchableWithExactFront++;
  }
}

collections.sort((a,b)=>b.identities-a.identities||a.name.localeCompare(b.name));
const summary={
  generatedAt:new Date().toISOString(),
  scriptFilesEvaluated:scripts.length,
  scriptFailures:failures,
  collectionsWithChecklist:collections.filter(c=>c.identities>0).length,
  collectionRecords:collections.length,
  searchableIdentities:identities.size,
  bySport:Object.fromEntries(Object.entries(bySport).sort((a,b)=>b[1]-a[1])),
  verifiedExactFrontRecords:verifiedRecords.length,
  approximateUniqueExactFrontIdentities:exactIdentityFingerprints.size,
  searchableIdentitiesWithExactFront:searchableWithExactFront,
  exactFrontCoveragePct:identities.size?Number((searchableWithExactFront*100/identities.size).toFixed(2)):0,
  topCollections:collections.slice(0,50)
};
fs.mkdirSync(path.join(root,'data'),{recursive:true});
fs.writeFileSync(path.join(root,'data','catalog-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
if(failures.some(f=>f.error==='missing'))process.exitCode=1;
