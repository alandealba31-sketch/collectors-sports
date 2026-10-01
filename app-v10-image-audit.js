(() => {
  function imageStats(collectionId){
    const rows=CATALOG.checklists?.[collectionId]||[];
    const cards=window.CS_IMAGE_CATALOG?.cards||{};
    const cache=window.CS_IMAGE_CACHE||{};
    let front=0,back=0,exactFront=0,exactBack=0;
    rows.forEach(row=>{
      const key=`${collectionId}|${row?.[0]}`;
      const img=cards[key];
      const hasFront=Boolean(cache[key]||img?.front), hasBack=Boolean(img?.back);
      if(hasFront)front++; if(hasBack)back++;
      if((cache[key]||img?.front)&&(!img||img.kind==='exact'))exactFront++;
      if(img?.back&&img.kind==='exact')exactBack++;
    });
    return {total:rows.length,front,back,exactFront,exactBack};
  }
  function injectAudit(){
    if(state.view!=='catalog-detail'||document.querySelector('.cs-image-audit'))return;
    const anchor=document.querySelector('.catalog-detail-card'); if(!anchor)return;
    const s=imageStats(state.catalogSelectedId); if(!s.total)return;
    const box=document.createElement('section'); box.className='card cs-image-audit';
    const fp=Math.round(s.exactFront/s.total*100),bp=Math.round(s.exactBack/s.total*100);
    box.innerHTML=`<div class="eyebrow">COBERTURA DE IMÁGENES EXACTAS</div><div class="cs-audit-grid"><div><strong>${s.exactFront}/${s.total}</strong><span>Frentes · ${fp}%</span></div><div><strong>${s.exactBack}/${s.total}</strong><span>Reversos · ${bp}%</span></div></div><div class="muted tiny">Sólo cuenta imágenes vinculadas a la carta exacta. Referencias de colección o de otro paralelo no se contabilizan como completas.</div>`;
    anchor.insertAdjacentElement('afterend',box);
  }
  const prior=render; render=function(){prior();injectAudit();}; render();
})();