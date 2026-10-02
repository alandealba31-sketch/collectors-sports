// Run with jsdom installed: NODE_PATH=/path/to/node_modules node tests/batch6.cjs
const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const dom=new JSDOM('<div id="app"></div>',{url:'https://example.com',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,ctx=dom.getInternalVMContext();
w.CSS={escape:s=>s};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
w.IntersectionObserver=class{observe(){}disconnect(){}unobserve(){}};
const run=s=>vm.runInContext(s,ctx);
for(const m of fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^?]+)\?/g))run(fs.readFileSync(path.join(root,m[1]),'utf8'));
const cat=w.CS_CATALOG,ids=['topps-chrome-basketball-2025-26','topps-resurgence-football-2025','topps-chrome-wwe-2026'];
ids.forEach((id,i)=>{assert.equal(cat.checklists[id].length,[1300,749,1110][i]);assert.equal(cat.collections.find(c=>c.id===id).baseCount,[299,200,201][i]);});
assert.equal(cat.checklists[ids[2]].filter(r=>String(r[0]).startsWith('3:16-')).length,25);
assert.equal(cat.checklists[ids[2]].filter(r=>r[0]==='FAM-CB').length,1);
assert.match(cat.checklists[ids[2]].find(r=>r[0]==='FAM-CB')[1],/Brandi Rhodes \/ .*Cody Rhodes$/);
assert.equal(cat.checklists[ids[2]].find(r=>r[0]===21)[2],'Smackdown');
assert(run("SPORTS.includes('WWE')"));assert.equal(run('state.cards.length'),0);
let count=0;
for(const [key,v] of Object.entries(w.CS_IMAGE_CATALOG.cards))if(v.front?.includes('owned-batch6/')){
 count++;const r=cat.checklists[ids[2]].find(r=>`${ids[2]}|${r[0]}|${r[7]}`===key);assert(r,key);assert(fs.existsSync(path.join(root,v.front)));assert.equal(w.CSVisual.resolve(ids[2],r[0],r[6],r[7]).kind,'reference');assert.equal(w.CSVisual.resolve(ids[2],r[0],r[6],'wrong'),null);
}
assert.equal(count,15);
run("state.view='catalog';state.catalogSport='WWE';state.catalogQuery='3:16-25';render()");assert.match(w.document.querySelector('#catalogGlobalCardResults').textContent,/Stone Cold/);
// Sport filtering must happen before limiting results, even with many competing matches.
for(let i=0;i<120;i++)cat.checklists[ids[0]].push(['zz','UniqueSportTest A'+i,'',0,'Base','base','Base','test'+i]);
cat.checklists[ids[2]].push(['zz','UniqueSportTest Z','',0,'Base','base','Base','wwe-test']);
run("state.catalogQuery='UniqueSportTest';render()");assert.match(w.document.querySelector('#catalogGlobalCardResults').textContent,/UniqueSportTest Z/);
cat.checklists[ids[0]].splice(1300);cat.checklists[ids[2]].pop();
const idx=cat.checklists[ids[2]].findIndex(r=>r[0]==='MRD-SV');const seed=run(`seedFromCatalogCard('${ids[2]}',${idx})`);assert(seed.catalogEntryKey);assert.equal(seed.player,'Stephanie Vaquer');
run("state.view='add';state.prefill=null;render()");assert(w.document.querySelector('#sport option[value="WWE"]'));
assert.equal(run('state.cards.length'),0);assert.equal(w.localStorage.getItem('collectors-sports-v05-cards'),null);
console.log('PASS: catalog counts, WWE codes/identities, 15 images, filtered search, autofill, inventory unchanged');dom.window.close();
