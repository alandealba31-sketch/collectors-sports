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
const config = JSON.parse(fs.readFileSync('tools/bulk_image_sources.json','utf8'));
const configured = new Map((config.sources||[]).map(s=>[s.collectionId,s]));
const tcdbConfig = fs.existsSync('tools/tcdb_product_sources.json') ? JSON.parse(fs.readFileSync('tools/tcdb_product_sources.json','utf8')) : {products:[]};
for (const p of tcdbConfig.products||[]) if (!configured.has(p.collectionId)) configured.set(p.collectionId,{...p,provider:'ebay'});
const mcfConfig = fs.existsSync('tools/mycardfolio_product_sources.json') ? JSON.parse(fs.readFileSync('tools/mycardfolio_product_sources.json','utf8')) : {products:[]};
for (const p of mcfConfig.products||[]) if (!configured.has(p.collectionId)) configured.set(p.collectionId,{collectionId:p.collectionId,setName:p.product,provider:'ebay'});
const targets={};
for (const [collectionId,source] of configured.entries()) {
  const rows=catalog.checklists?.[collectionId]||[];
  targets[collectionId]={source,rows:rows.map(row=>({
    number:String(row?.[0]??''),player:String(row?.[1]??''),team:String(row?.[2]??''),
    subset:String(row?.[4]??''),variant:String(row?.[6]??'Base'),entryKey:String(row?.[7]??''),sourceSid:String(row?.[8]??'')
  })).filter(row=>row.number&&row.player)};
}
fs.mkdirSync('data',{recursive:true});
fs.writeFileSync('data/image-targets-runtime.json',JSON.stringify(targets,null,2));
const total=Object.values(targets).reduce((sum,t)=>sum+t.rows.length,0);
console.log(`Exported ${total} catalog identities across ${Object.keys(targets).length} bulk-image targets.`);
