(() => {
  const pct = (value, total) => {
    if (!total) return '0.00';
    const p = value / total * 100;
    return p < 1 ? p.toFixed(2) : p.toFixed(1);
  };

  function imageStats(collectionId){
    const rows=CATALOG.checklists?.[collectionId]||[];
    let anyFront=0,exactFront=0;
    rows.forEach(row=>{
      const img=window.CSVisual?.resolve?.(collectionId,row?.[0],row?.[6],row?.[7]);
      if(img?.front) anyFront++;
      if(img?.front&&img.kind==='exact') exactFront++;
    });
    return {
      total:rows.length,
      anyFront,
      exactFront,
      referenceFront:Math.max(0,anyFront-exactFront)
    };
  }

  function globalStats(){
    const ids=Object.keys(CATALOG.checklists||{});
    let registered=0,anyFront=0,exactFront=0;
    ids.forEach(id=>{
      const s=imageStats(id);
      registered+=s.total;
      anyFront+=s.anyFront;
      exactFront+=s.exactFront;
    });
    const universeTarget=Number(window.CS_UNIVERSE_TARGET)||0;
    return {
      registered,
      anyFront,
      exactFront,
      referenceFront:Math.max(0,anyFront-exactFront),
      universeTarget
    };
  }

  function injectUniverseProgress(){
    if(state.view!=='catalog'||document.querySelector('.cs-universe-progress')) return;
    const anchor=document.querySelector('.section-title');
    if(!anchor) return;
    const s=globalStats();
    const box=document.createElement('section');
    box.className='card cs-universe-progress';
    const universeLabel=s.universeTarget?s.universeTarget.toLocaleString('es-MX'):'En cuantificación';
    const catalogCoverage=s.universeTarget?`${pct(s.registered,s.universeTarget)}%`:'—';
    box.innerHTML=`
      <div class="eyebrow">UNIVERSO COLLECTORS SPORTS</div>
      <div class="cs-audit-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:8px">
        <div><strong>${universeLabel}</strong><span>Universo objetivo</span></div>
        <div><strong>${s.registered.toLocaleString('es-MX')}</strong><span>Cartas cargadas · ${catalogCoverage}</span></div>
        <div><strong>${s.exactFront.toLocaleString('es-MX')}</strong><span>Frentes exactos</span></div>
        <div><strong>${pct(s.exactFront,s.registered)}%</strong><span>Cobertura exacta</span></div>
      </div>
      <div class="muted tiny" style="margin-top:8px">Objetivo visual: 1 frente exacto por identidad de carta. ${s.referenceFront.toLocaleString('es-MX')} referencias visuales disponibles no cuentan como cobertura. El reverso ya no forma parte del objetivo.</div>`;
    anchor.insertAdjacentElement('afterend',box);
  }

  function injectAudit(){
    if(state.view!=='catalog-detail'||document.querySelector('.cs-image-audit'))return;
    const anchor=document.querySelector('.catalog-detail-card'); if(!anchor)return;
    const s=imageStats(state.catalogSelectedId); if(!s.total)return;
    const box=document.createElement('section'); box.className='card cs-image-audit';
    box.innerHTML=`<div class="eyebrow">COBERTURA VISUAL DE ESTA COLECCIÓN</div><div class="cs-audit-grid"><div><strong>${s.exactFront}/${s.total}</strong><span>Frentes exactos · ${pct(s.exactFront,s.total)}%</span></div><div><strong>${s.total-s.exactFront}</strong><span>Frentes exactos pendientes</span></div></div><div class="muted tiny">${s.referenceFront} referencias visuales disponibles, pero no cuentan como cobertura. Solo cuenta una imagen frontal cuando corresponde exactamente a la identidad de la carta; el reverso no es requisito.</div>`;
    anchor.insertAdjacentElement('afterend',box);
  }

  const prior=render;
  render=function(){
    prior();
    injectUniverseProgress();
    injectAudit();
  };
  render();
})();
