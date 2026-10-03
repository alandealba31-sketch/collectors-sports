(() => {
  const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const sportMap={Baseball:'MLB',Football:'NFL','Formula 1':'F1',Racing:'F1',Basketball:'NBA',Wrestling:'WWE'};
  const canonSport=s=>sportMap[s]||s;
  let indexCache=null,indexFingerprint='';

  function metaText(collectionId){
    const meta=window.CS_SET_META?.[collectionId]||{},aliases=meta.aliases||{};
    return [ ...(meta.parallels||[]), ...(meta.inserts||[]), ...Object.keys(aliases), ...Object.values(aliases) ].join(' ');
  }
  function detectVariant(collectionId,query){
    const q=norm(query),meta=window.CS_SET_META?.[collectionId]||{},aliases=meta.aliases||{};
    for(const [alias,target] of Object.entries(aliases)) if(q.includes(norm(alias))) return target;
    const parallels=[...(meta.parallels||[])].sort((a,b)=>b.length-a.length);
    for(const p of parallels){const base=norm(p).replace(/\s*\/\s*\d+.*/,'').replace(/\s*-?\d+\/0.*/,'').trim();if(base.length>=5&&q.includes(base))return p}
    return '';
  }
  function fingerprint(){
    const cs=CATALOG?.collections||[],cl=CATALOG?.checklists||{};
    let rows=0;for(const c of cs)rows+=(cl[c.id]||[]).length;
    return `${cs.length}:${rows}`;
  }
  function catalogEntries(){
    const fp=fingerprint();if(indexCache&&fp===indexFingerprint)return indexCache;
    const collections=CATALOG?.collections||[],checklists=CATALOG?.checklists||{},entries=[];
    collections.forEach(collection=>{
      const collectionText=[collection.name,collection.shortName,collection.year,collection.manufacturer,canonSport(collection.sport),collection.family].join(' '),meta=metaText(collection.id);
      (checklists[collection.id]||[]).forEach((row,index)=>{
        const [number,player,team,flags,subset]=row||[],flagText=Array.isArray(flags)?flags.join(' '):(flags||''),rawRow=Array.isArray(row)?row.flat(Infinity).join(' '):'';
        const p=norm(player),n=norm(number),s=norm(subset),t=norm(team),haystack=norm([player,team,number,subset,flagText,rawRow,collectionText,meta].join(' '));
        entries.push({collection,row,index,number,player,team,flags,subset,haystack,p,n,s,t,sport:canonSport(collection.sport)});
      });
    });
    indexCache=entries;indexFingerprint=fp;return entries;
  }
  function score(e,q,tokens){
    if(e.p===q||e.n===q)return 120;if(e.p.startsWith(q))return 110;if(e.n.startsWith(q))return 105;
    if(tokens.length&&tokens.every(token=>e.haystack.includes(token)))return 80+(e.p.includes(tokens[0])?10:0);
    if(e.s.startsWith(q))return 75;if(e.t.startsWith(q))return 65;if(e.haystack.includes(q))return 50;return 0;
  }
  function findMatches(query,limit=30,sport='Todos'){
    const q=norm(query);if(q.length<2)return[];const tokens=q.split(/\s+/).filter(Boolean),wantedSport=canonSport(sport),ranked=[];
    for(const entry of catalogEntries()){
      if(sport!=='Todos'&&entry.sport!==wantedSport)continue;
      const value=score(entry,q,tokens);if(value)ranked.push({entry,value});
    }
    ranked.sort((a,b)=>b.value-a.value||String(a.entry.player).localeCompare(String(b.entry.player)));
    return ranked.slice(0,limit).map(x=>{const e={...x.entry};const vv=detectVariant(e.collection.id,query);if(vv&&/base/i.test(String(e.subset||'Base')))e.virtualVariant=vv;return e});
  }
  function resultHtml(entry,i){return window.CSVisual.searchResult(entry,i)}
  function goToEntry(entry){state.catalogSelectedId=entry.collection.id;state.catalogCardQuery=String(entry.player||entry.number||'');state.view='catalog-detail';render();setTimeout(()=>{const el=document.querySelector(`[data-use-catalog-card="${CSS.escape(entry.collection.id)}"][data-catalog-card-index="${entry.index}"]`);el?.scrollIntoView({behavior:'smooth',block:'center'})},50)}
  function selectEntry(entry){
    const collectionSelect=document.querySelector('#catalogCollectionSelect');if(collectionSelect){collectionSelect.value=entry.collection.id;collectionSelect.dispatchEvent(new Event('change',{bubbles:true}))}
    requestAnimationFrame(()=>{const cardSelect=document.querySelector('#catalogCardSelect');if(cardSelect){cardSelect.selectedIndex=entry.index+1;cardSelect.dispatchEvent(new Event('change',{bubbles:true}))}const player=document.querySelector('#player');if(player)player.value=entry.player||'';const number=document.querySelector('#cardNumber');if(number)number.value=entry.displayNumber||entry.number||'';const team=document.querySelector('#team');if(team)team.value=entry.team||'';if(entry.virtualVariant){const parallel=document.querySelector('#parallel');if(parallel){parallel.value=entry.virtualVariant;parallel.dispatchEvent(new Event('input',{bubbles:true}))}const search=document.querySelector('#csLiveCatalogSearch');if(search)search.value=`${entry.player} ${entry.virtualVariant}`}const results=document.querySelector('#csLiveCatalogResults');if(results)results.innerHTML=''})
  }
  function bindDebounced(input,fn){let timer;input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(fn,70)})}
  function injectAutocomplete(){
    if(document.querySelector('#csLiveCatalogSearch'))return;const collectionSelect=document.querySelector('#catalogCollectionSelect'),playerField=document.querySelector('#player')?.closest('.field'),anchor=collectionSelect?.closest('.field')||playerField;if(!anchor)return;
    const wrap=document.createElement('div');wrap.className='field wide cs-live-search';wrap.innerHTML=`<label for="csLiveCatalogSearch">Buscar cualquier carta</label><input id="csLiveCatalogSearch" autocomplete="off" placeholder="Ej. Lazaro 40/50, Lulu bajo cero, Michel Salgado…"><div id="csLiveCatalogResults" class="cs-live-results"></div>`;anchor.insertAdjacentElement('beforebegin',wrap);
    const input=wrap.querySelector('#csLiveCatalogSearch'),results=wrap.querySelector('#csLiveCatalogResults');bindDebounced(input,()=>{const matches=findMatches(input.value,20);if(!matches.length){results.innerHTML=norm(input.value).length>=2?'<div class="cs-live-empty">No está todavía en los checklists cargados.</div>':'';return}results.innerHTML=matches.map(resultHtml).join('');results.querySelectorAll('[data-cs-result]').forEach((b,i)=>b.addEventListener('click',()=>selectEntry(matches[i])))})
  }
  function enhanceMainCatalogSearch(){
    if(state.view!=='catalog')return;const input=document.querySelector('#catalogSearch');if(!input||input.dataset.cardSearch==='1')return;input.dataset.cardSearch='1';input.placeholder='Buscar carta: jugador, paralelo, serial, código o colección…';let results=document.querySelector('#catalogGlobalCardResults');if(!results){results=document.createElement('div');results.id='catalogGlobalCardResults';results.className='cs-live-results catalog-global-results';input.closest('.search-row')?.insertAdjacentElement('afterend',results)}
    const update=()=>{const q=input.value,matches=findMatches(q,30,state.catalogSport);if(norm(q).length<2){results.innerHTML='';return}if(!matches.length){results.innerHTML='<div class="cs-live-empty">No hay coincidencias en los checklists cargados.</div>';return}results.innerHTML=`<div class="cs-search-heading">Cartas encontradas</div>${matches.map(resultHtml).join('')}`;results.querySelectorAll('[data-cs-result]').forEach((b,i)=>b.addEventListener('click',()=>goToEntry(matches[i])))};bindDebounced(input,update);update();
  }
  window.CSCatalogSearch={findMatches,detectVariant,canonSport,rebuildIndex:()=>{indexCache=null;indexFingerprint='';return catalogEntries().length},indexSize:()=>catalogEntries().length};
  const previousRenderV10=render;render=function(){previousRenderV10();injectAutocomplete();enhanceMainCatalogSearch()};render();
})();
