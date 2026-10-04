#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';

const files = [
  'catalog.js','catalog-extra.js','catalog-imported.js','catalog-tennis.js','catalog-premier.js',
  'catalog-owned.js','catalog-owned-batch2.js','catalog-owned-batch3.js','catalog-owned-batch4.js',
  'catalog-owned-batch5.js','catalog-owned-batch6.js','catalog-owned-batch8.js','catalog-owned-batch9.js',
  'catalog-runtime.js','catalog-now.js','catalog-now-extra.js','catalog-v11-fixes.js','catalog-now-sports-v11.js',
  'catalog-tcdb-expanded.js','catalog-mycardfolio-expanded.js'
].filter(file => fs.existsSync(file));

globalThis.window = {};
for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  try { vm.runInThisContext(code, { filename: file }); }
  catch (error) { console.warn(`Skipping ${file}: ${error.message}`); }
}
const catalog = globalThis.window.CS_CATALOG || {collections:[],checklists:{}};

const readJson = (path, fallback={}) => {
  try { return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path,'utf8')) : fallback; }
  catch (error) { console.warn(`Ignoring ${path}: ${error.message}`); return fallback; }
};
const configured = new Map();
const addSource = source => {
  const collectionId = source?.collectionId;
  if (!collectionId || configured.has(collectionId)) return;
  configured.set(collectionId, source);
};

for (const source of readJson('tools/bulk_image_sources.json',{sources:[]}).sources||[]) addSource(source);
for (const p of readJson('tools/tcdb_product_sources.json',{products:[]}).products||[]) addSource({...p,provider:'ebay',setName:p.setName||p.product});
for (const p of readJson('tools/mycardfolio_product_sources.json',{products:[]}).products||[]) addSource({collectionId:p.collectionId,setName:p.product,provider:'ebay'});
for (const p of readJson('mycardfolio_product_sources_v2.json',{products:[]}).products||[]) addSource({collectionId:p.collectionId,setName:p.product,provider:'ebay'});
for (const p of readJson('mycardfolio_extra_products_v1.json',{products:[]}).products||[]) addSource({collectionId:p.collectionId,setName:p.product,provider:'ebay'});
for (const p of readJson('halloflists_sources.json',{products:[]}).products||[]) addSource({collectionId:p.collectionId,setName:p.product||p.name||p.shortName,provider:'ebay'});
for (const p of readJson('checklistinsider_sources.json',{products:[]}).products||[]) addSource({collectionId:p.collectionId,setName:p.product||p.name||p.shortName,provider:'ebay'});
for (const p of readJson('halloflists_now_sources.json',{sources:[]}).sources||[]) addSource({collectionId:p.collectionId,setName:p.product||p.name||p.shortName,provider:'ebay'});

let priority = [];
const priorityRaw = readJson('data/email-priority-collections.json',{collections:[]});
priority = (priorityRaw.collections||[]).slice().sort((a,b)=>(a.priority||999999)-(b.priority||999999)).map(x=>x.collectionId).filter(Boolean);
const rank = new Map(priority.map((id,index)=>[id,index]));
const orderedConfigured = [...configured.entries()].sort((a,b)=>{
  const ar = rank.has(a[0]) ? rank.get(a[0]) : 1000000;
  const br = rank.has(b[0]) ? rank.get(b[0]) : 1000000;
  return ar-br;
});

const targets={};
for (const [collectionId,source] of orderedConfigured) {
  const rows=catalog.checklists?.[collectionId]||[];
  targets[collectionId]={source,priority:rank.has(collectionId)?rank.get(collectionId)+1:null,rows:rows.map(row=>({
    number:String(row?.[0]??''),player:String(row?.[1]??''),team:String(row?.[2]??''),
    subset:String(row?.[4]??''),variant:String(row?.[6]??'Base'),entryKey:String(row?.[7]??''),sourceSid:String(row?.[8]??'')
  })).filter(row=>row.number&&row.player)};
}
fs.mkdirSync('data',{recursive:true});
fs.writeFileSync('data/image-targets-runtime.json',JSON.stringify(targets,null,2));
const total=Object.values(targets).reduce((sum,t)=>sum+t.rows.length,0);
const prioritized=Object.entries(targets).filter(([,v])=>v.priority!=null).map(([id,v])=>`${v.priority}:${id}(${v.rows.length})`);
console.log(`Exported ${total} catalog identities across ${Object.keys(targets).length} bulk-image targets.`);
if (prioritized.length) console.log(`Email-priority exact-front queue: ${prioritized.join(', ')}`);
