(() => {
  let observer;
  const urls = new Set();
  let generation = 0;
  cardRow = function(card) {
    const visual=window.CSVisual.resolve(card.catalogCollectionId,card.cardNumber,card.parallel,card.catalogEntryKey);
    const subtitle=[cardLabel(card),card.cardNumber?`#${card.cardNumber}`:''].filter(Boolean).join(' · ');
    return `<button class="item cs-inventory-item" data-card="${esc(card.id)}"><span data-own-photo="${esc(card.id)}">${window.CSVisual.thumbnail(visual,card.player)}</span><span class="cs-inventory-copy"><span class="item-head"><span class="item-main"><span class="item-title">${esc(card.player||'Sin jugador')}</span><span class="muted item-subtitle">${esc(subtitle)}</span></span><span class="item-price">${money(card.currentValue,card.currency)}</span></span><span class="badges"><span class="badge green">${esc(card.sport)}</span>${card.parallel?`<span class="badge">${esc(card.parallel)}</span>`:''}${card.serial?`<span class="badge gold">${esc(card.serial)}</span>`:''}${tags(card).map(t=>`<span class="badge">${t}</span>`).join('')}</span>${card.location?`<span class="item-location">⌖ ${esc(card.location)}</span>`:''}</span></button>`;
  };
  async function hydrate(holder, token) {
    const blob=await getPhoto(holder.dataset.ownPhoto,'front') || await getPhoto(holder.dataset.ownPhoto,'back');
    if (!blob || token !== generation || !holder.isConnected) return;
    const url=URL.createObjectURL(blob);urls.add(url);
    holder.innerHTML=window.CSVisual.thumbnail({front:url},'Foto de tu ejemplar');
  }
  const previousRender=render;
  render=function(){
    generation++;observer?.disconnect();urls.forEach(url=>URL.revokeObjectURL(url));urls.clear();
    previousRender();
    const version=document.querySelector('.topbar .brand .muted');
    if(version)version.textContent='Colección premium · V0.10h · Imágenes';
    const token=generation;
    if ('IntersectionObserver' in window) {
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){observer.unobserve(entry.target);hydrate(entry.target,token);}}),{rootMargin:'300px'});
      document.querySelectorAll('[data-own-photo]').forEach(el=>observer.observe(el));
    } else document.querySelectorAll('[data-own-photo]').forEach(el=>hydrate(el,token));
  };
  render();
})();
