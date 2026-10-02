// Run with jsdom installed: NODE_PATH=/path/to/node_modules node tests/batch7-images.cjs
const {JSDOM}=require('jsdom');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const dom=new JSDOM('<div id="app"></div>',{url:'https://example.com',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;
const context=dom.getInternalVMContext();
w.CSS={escape:value=>value};
w.scrollTo=()=>{};
w.HTMLElement.prototype.scrollIntoView=()=>{};
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};
w.HTMLDialogElement.prototype.close=function(){this.open=false};
w.IntersectionObserver=class{observe(){}disconnect(){}unobserve(){}};
const run=source=>vm.runInContext(source,context);
for(const match of fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^?]+)\?/g)) {
  run(fs.readFileSync(path.join(root,match[1]),'utf8'));
}
const ids=new Set(['topps-chrome-basketball-2025-26','topps-resurgence-football-2025']);
let batch7=0;
for(const [key,visual] of Object.entries(w.CS_IMAGE_CATALOG.cards)) {
  if(!visual.front?.includes('owned-batch7/')) continue;
  batch7++;
  const [id,number,...entryParts]=key.split('|');
  const entryKey=entryParts.join('|');
  assert(ids.has(id),key);
  const matches=w.CS_CATALOG.checklists[id].filter(row=>String(row[0])===number && row[7]===entryKey);
  assert.equal(matches.length,1,key);
  assert(fs.existsSync(path.join(root,visual.front)),visual.front);
  assert.equal(visual.kind,'reference');
  assert.equal(w.CSVisual.resolve(id,number,matches[0][6],entryKey).kind,'reference');
  assert.equal(w.CSVisual.resolve(id,number,matches[0][6],'wrong'),null);
}
assert.equal(batch7,31);
assert.equal(w.CS_CATALOG.checklists['topps-chrome-basketball-2025-26'].length,1300);
assert.equal(w.CS_CATALOG.checklists['topps-resurgence-football-2025'].length,749);
assert.equal(run('state.cards.length'),0);
assert.equal(w.localStorage.getItem('collectors-sports-v05-cards'),null);
assert.equal(fs.readFileSync(path.join(root,'sw.js'),'utf8').includes('assets/cards/owned-batch7/'),false);
console.log('PASS: 31 reviewed NBA/NFL references, unique entry mapping, on-demand assets, inventory unchanged');
dom.window.close();
