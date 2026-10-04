(() => {
  const safeUrl = value => /^(https:\/\/|data:image\/(?:jpeg|png|webp);base64,|blob:|\.\/assets\/)/i.test(String(value || '')) ? value : '';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const genericVariant = new Set(['','base','base cards','base card','cards']);

  function exactEntry(entry){ return entry?.kind === 'exact' && entry?.exactVerified === true; }
  function playerMatches(entry, player){
    if (!player) return true;
    const p=norm(player); if(!p) return true;
    const hay=norm([entry?.label, ...(entry?.verified||[])].join(' '));
    const tokens=p.split(' ').filter(x=>x.length>1);
    return tokens.length ? tokens.every(t=>hay.split(' ').includes(t)) : hay.includes(p);
  }
  function variantMatches(entry, variant){
    const wanted=norm(variant);
    if(genericVariant.has(wanted)) return genericVariant.has(norm(entry?.variant||'Base'));
    const hay=norm([entry?.variant, entry?.label, ...(entry?.verified||[])].join(' '));
    const sig=wanted.split(' ').filter(t=>!['base','cards','card','the','and'].includes(t));
    if(!sig.length) return true;
    const ht=new Set(hay.split(' '));
    return sig.every(t=>ht.has(t));
  }
  function makeVisual(entry,key,cache){
    const visual={...entry,front:safeUrl(cache[key]||entry.front)};
    if(!visual.front) return null;
    visual.kind='exact'; visual._resolvedKey=key;
    return visual;
  }

  function resolve(collectionId, number, variant = '', entryKey = '', player = '') {
    const baseKey=`${collectionId}|${String(number ?? '')}`;
    const scopedKey=entryKey?`${baseKey}|${entryKey}`:'';
    const catalog=window.CS_IMAGE_CATALOG?.cards||{};
    const cache=window.CS_IMAGE_CACHE||{};

    // 1) Exact same internal identity.
    for(const key of [scopedKey,baseKey].filter(Boolean)){
      const entry=catalog[key];
      if(exactEntry(entry) && playerMatches(entry,player) && variantMatches(entry,variant)){
        const visual=makeVisual(entry,key,cache); if(visual) return visual;
      }
    }

    // 2) Cross-source identity join. Hall-of-Lists, MyCardfolio, eBay and owned-photo
    // entries can use different internal keys for the same physical card. Only bridge them
    // when collection + card number + player + subset/variant leave one unambiguous exact front.
    const prefix=baseKey+'|';
    let candidates=[];
    for(const [key,entry] of Object.entries(catalog)){
      if(key!==baseKey && !key.startsWith(prefix)) continue;
      if(!exactEntry(entry) || !playerMatches(entry,player) || !variantMatches(entry,variant)) continue;
      if(!safeUrl(cache[key]||entry.front)) continue;
      candidates.push([key,entry]);
    }
    if(candidates.length===1) return makeVisual(candidates[0][1],candidates[0][0],cache);

    // If several sources point to the exact same image/identity, collapse them safely.
    if(candidates.length>1){
      const byIdentity=new Map();
      for(const [key,entry] of candidates){
        const fingerprint=[norm(entry.variant||'Base'),norm(entry.label),safeUrl(cache[key]||entry.front)].join('|');
        if(!byIdentity.has(fingerprint)) byIdentity.set(fingerprint,[key,entry]);
      }
      if(byIdentity.size===1){const [key,entry]=[...byIdentity.values()][0];return makeVisual(entry,key,cache);}
    }
    return null;
  }

  function thumbnail(visual, title, className = '') {
    const url=safeUrl(visual?.front);
    return `<span class="cs-card-thumbnail ${className}">${url?`<img data-cs-image src="${escape(url)}" alt="${escape(title)}" loading="lazy" decoding="async">`:'<span class="cs-image-placeholder">CS</span>'}</span>`;
  }
  function searchResult(entry,index){
    const requestedVariant=entry.virtualVariant||entry.subset||entry.row?.[6]||'Base';
    const visual=resolve(entry.collection.id,entry.number,requestedVariant,entry.row?.[7],entry.player);
    const kind=requestedVariant||(Array.isArray(entry.flags)?entry.flags.join(' · '):'')||'Base';
    const status=visual?'Frente exacto verificado':'Imagen exacta pendiente';
    const displayNumber=entry.displayNumber||entry.number;
    return `<div class="cs-visual-result"><button type="button" class="cs-live-result" data-cs-result="${index}">${thumbnail(visual,entry.player)}<span class="cs-result-copy"><strong>${escape(entry.player)}</strong><span>${escape(kind)} · ${escape(entry.collection.shortName||entry.collection.name)} · #${escape(displayNumber)}</span>${entry.team?`<small>${escape(entry.team)}</small>`:''}<small class="cs-image-status">${status}</small></span></button>${visual?`<button type="button" class="cs-image-expand" data-cs-preview data-collection="${escape(entry.collection.id)}" data-number="${escape(entry.number)}" data-entry-key="${escape(entry.row?.[7]||'')}" data-variant="${escape(requestedVariant)}" data-player="${escape(entry.player)}" aria-label="Ampliar imagen de ${escape(entry.player)}">Ampliar</button>`:''}</div>`;
  }
  function preview(visual,title,number,returnFocus){
    document.querySelector('.cs-card-dialog')?.close();document.querySelector('.cs-card-dialog')?.remove();
    const dialog=document.createElement('dialog');dialog.className='cs-card-dialog';dialog.setAttribute('aria-labelledby','cs-preview-title');
    dialog.innerHTML=`<div class="cs-dialog-head"><div><h2 id="cs-preview-title">${escape(title)}</h2><div class="muted">#${escape(number)}</div></div><button type="button" class="btn secondary" data-close>✕<span class="sr-only">Cerrar imagen</span></button></div><div class="cs-preview-frame"><img data-cs-image src="${escape(visual.front)}" alt="${escape(title)} — frente"></div><div style="text-align:center"><span class="cs-verified-badge">✓ Frente exacto verificado</span></div><p class="cs-preview-caption">${escape(visual.label||'Frente exacto de catálogo')}</p>${/^https:\/\//.test(visual.sourcePage||'')?`<div style="text-align:center"><a class="catalog-source-detail" href="${escape(visual.sourcePage)}" target="_blank" rel="noopener noreferrer">Fuente: ${escape(visual.source||'Ver imagen')} ↗</a></div>`:''}`;
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
    dialog.addEventListener('close',()=>{dialog.remove();if(returnFocus?.isConnected)returnFocus.focus();},{once:true});document.body.appendChild(dialog);dialog.showModal();
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-cs-preview],[data-preview-visual]');if(!button)return;
    const id=button.dataset.collection||button.dataset.visualCollection;const number=button.dataset.number||button.dataset.visualNumber;
    const visual=resolve(id,number,button.dataset.variant||'',button.dataset.entryKey||'',button.dataset.player||button.dataset.visualPlayer||'');if(!visual)return;
    e.preventDefault();e.stopImmediatePropagation();preview(visual,button.dataset.player||button.dataset.visualPlayer||'',number,button);
  },true);
  document.addEventListener('error',e=>{const img=e.target;if(!(img instanceof HTMLImageElement)||!img.matches('[data-cs-image]'))return;img.hidden=true;if(!img.parentElement.querySelector('.cs-image-placeholder')){const label=document.createElement('span');label.className='cs-image-placeholder';label.textContent='CS';img.parentElement.appendChild(label);}},true);
  window.CSVisual={resolve,thumbnail,searchResult,preview};
})();
