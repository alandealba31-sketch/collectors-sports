(() => {
  const norm = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  function openEntry(entry){
    state.catalogSelectedId=entry.collection.id;
    state.catalogCardQuery=String(entry.player||entry.number||'');
    state.view='catalog-detail';
    render();
    setTimeout(()=>{
      const el=document.querySelector(`[data-use-catalog-card="${CSS.escape(entry.collection.id)}"][data-catalog-card-index="${entry.index}"]`);
      el?.scrollIntoView({behavior:'smooth',block:'center'});
    },60);
  }
  function injectHomeSearch(){
    if(state.view!=='home'||document.querySelector('#csHomeUniversalSearch')) return;
    const hero=document.querySelector('.card.hero');
    if(!hero) return;
    const box=document.createElement('section');
    box.className='card cs-home-universal';
    box.innerHTML=`<div class="eyebrow">BUSCAR EN TODO EL CATÁLOGO</div><div class="search-row" style="margin-top:8px"><input id="csHomeUniversalSearch" class="search" type="search" autocomplete="off" placeholder="Lázaro 40/50, Lulu bajo cero, Míchel Salgado…"></div><div id="csHomeUniversalResults" class="cs-live-results"></div>`;
    hero.insertAdjacentElement('afterend',box);
    const input=box.querySelector('#csHomeUniversalSearch');
    const results=box.querySelector('#csHomeUniversalResults');
    input.addEventListener('input',()=>{
      const q=input.value;
      if(norm(q).length<2){results.innerHTML='';return;}
      const matches=window.CSCatalogSearch?.findMatches(q,20,'Todos')||[];
      if(!matches.length){results.innerHTML='<div class="cs-live-empty">Aún no está en los checklists cargados.</div>';return;}
      results.innerHTML=matches.map((entry,i)=>window.CSVisual.searchResult(entry,i)).join('');
      results.querySelectorAll('[data-cs-result]').forEach((btn,i)=>btn.addEventListener('click',()=>openEntry(matches[i])));
    });
  }
  const prev=render;
  render=function(){prev();injectHomeSearch();};
  render();
})();
