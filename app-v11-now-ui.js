(() => {
  const previousFilteredCatalog = filteredCatalog;
  filteredCatalog = function(){
    return previousFilteredCatalog().sort((a,b)=>{
      const an=a.family==='Topps NOW'?0:1, bn=b.family==='Topps NOW'?0:1;
      return an-bn || String(a.shortName||a.name).localeCompare(String(b.shortName||b.name),'es');
    });
  };

  const previousCatalogRow = catalogRow;
  catalogRow = function(c){
    let html = previousCatalogRow(c);
    if(c.family==='Topps NOW'){
      html = html.replace('<div class="catalog-item-top">','<div class="catalog-item-top"><span class="badge gold">Topps NOW</span>');
    }
    return html;
  };

  function groupNowSections(){
    if(state.view!=='catalog' || state.catalogSport==='Todos') return;
    const list=document.querySelector('.catalog-list');
    if(!list || list.dataset.nowGrouped==='1') return;
    const items=[...list.querySelectorAll('.catalog-item')];
    const nowItems=items.filter(el=>CATALOG.collections.find(c=>c.id===el.dataset.catalogId)?.family==='Topps NOW');
    const otherItems=items.filter(el=>CATALOG.collections.find(c=>c.id===el.dataset.catalogId)?.family!=='Topps NOW');
    if(nowItems.length){
      const h=document.createElement('div');h.className='section-title compact';h.innerHTML=`<div><h3>Topps NOW</h3><div class="muted">${nowItems.length} colección${nowItems.length===1?'':'es'} NOW en ${sportLabel(state.catalogSport)}</div></div>`;
      list.insertBefore(h,nowItems[0]);
    }
    if(nowItems.length && otherItems.length){
      const h=document.createElement('div');h.className='section-title compact';h.innerHTML='<div><h3>Otras colecciones</h3></div>';
      list.insertBefore(h,otherItems[0]);
    }
    list.dataset.nowGrouped='1';
  }

  const prevRender=render;
  render=function(){prevRender();groupNowSections();};
  render();
})();
