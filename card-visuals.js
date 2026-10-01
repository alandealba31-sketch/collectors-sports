(() => {
  const safeUrl = value => /^(https:\/\/|data:image\/(?:jpeg|png|webp);base64,|blob:|\.\/assets\/)/i.test(String(value || '')) ? value : '';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function resolve(collectionId, number, variant = '', entryKey = '') {
    const scoped = window.CS_CATALOG?.collections?.find(c => c.id === collectionId)?.entryIdentity;
    if (scoped && !entryKey) return null;
    const key = `${collectionId}|${String(number ?? '')}${scoped ? '|' + entryKey : ''}`;
    const entry = window.CS_IMAGE_CATALOG?.cards?.[key];
    const cached = window.CS_IMAGE_CACHE?.[key];
    if (!cached && !['exact','reference'].includes(entry?.kind)) return null;
    const visual = {...entry, front: safeUrl(cached || entry?.front), back: safeUrl(entry?.back)};
    if (!visual.front && !visual.back) return null;
    visual.kind = entry?.kind || 'exact';
    if (variant && !/^base$/i.test(variant) && visual.kind === 'exact' && String(entry?.variant || 'Base').toLowerCase() !== variant.toLowerCase()) {
      visual.kind = 'reference';
      visual.label = `${visual.label || 'Imagen de catálogo'} · El paralelo de tu ejemplar puede ser diferente`;
    }
    return visual;
  }
  function thumbnail(visual, title, className = '') {
    const url = safeUrl(visual?.front || visual?.back);
    return `<span class="cs-card-thumbnail ${className}">${url ? `<img data-cs-image src="${escape(url)}" alt="${escape(title)}" loading="lazy" decoding="async">` : '<span class="cs-image-placeholder">Sin imagen</span>'}</span>`;
  }
  function searchResult(entry, index) {
    const visual = resolve(entry.collection.id, entry.number, entry.row?.[6], entry.row?.[7]);
    const kind = entry.subset || (Array.isArray(entry.flags) ? entry.flags.join(' · ') : '') || 'Base';
    return `<div class="cs-visual-result"><button type="button" class="cs-live-result" data-cs-result="${index}">${thumbnail(visual, entry.player)}<span class="cs-result-copy"><strong>${escape(entry.player)}</strong><span>${escape(kind)} · ${escape(entry.collection.shortName || entry.collection.name)} · #${escape(entry.number)}</span>${entry.team ? `<small>${escape(entry.team)}</small>` : ''}<small class="cs-image-status">${visual ? (visual.kind === 'exact' ? 'Imagen de catálogo' : 'Referencia visual · puede variar el acabado') : 'Imagen pendiente'}</small></span></button>${visual ? `<button type="button" class="cs-image-expand" data-cs-preview data-collection="${escape(entry.collection.id)}" data-number="${escape(entry.number)}" data-entry-key="${escape(entry.row?.[7]||'')}" data-player="${escape(entry.player)}" aria-label="Ampliar imagen de ${escape(entry.player)}">Ampliar</button>` : ''}</div>`;
  }
  function preview(visual, title, number, returnFocus) {
    document.querySelector('.cs-card-dialog')?.close();
    document.querySelector('.cs-card-dialog')?.remove();
    const dialog = document.createElement('dialog');
    dialog.className = 'cs-card-dialog';
    dialog.setAttribute('aria-labelledby','cs-preview-title');
    const side = visual.front ? 'front' : 'back';
    dialog.innerHTML = `<div class="cs-dialog-head"><div><h2 id="cs-preview-title">${escape(title)}</h2><div class="muted">#${escape(number)}</div></div><button type="button" class="btn secondary" data-close>✕<span class="sr-only">Cerrar imagen</span></button></div><div class="cs-image-sides"><button type="button" data-side="front" ${visual.front ? '' : 'disabled'}>Frente</button><button type="button" data-side="back" ${visual.back ? '' : 'disabled'}>Reverso${visual.back ? '' : ' pendiente'}</button></div><div class="cs-preview-frame"><img data-cs-image src="${escape(visual[side])}" alt="${escape(title)} — ${side === 'front' ? 'frente' : 'reverso'}"></div><p class="cs-preview-caption">${escape(visual.label || (visual.kind === 'exact' ? 'Imagen de catálogo' : 'Referencia visual'))}</p>${visual.kind === 'reference' ? '<p class="muted tiny">Referencia del diseño. El acabado o la imagen final pueden variar.</p>' : ''}${/^https:\/\//.test(visual.sourcePage || '') ? `<a class="catalog-source-detail" href="${escape(visual.sourcePage)}" target="_blank" rel="noopener noreferrer">Fuente: ${escape(visual.source || 'Ver imagen')} ↗</a>` : ''}`;
    const switchSide = name => {
      const img = dialog.querySelector('.cs-preview-frame img');
      if (!visual[name]) return;
      dialog.querySelector('.cs-preview-frame .cs-image-placeholder')?.remove();
      img.hidden = false; img.src = visual[name]; img.alt = `${title} — ${name === 'front' ? 'frente' : 'reverso'}`;
      dialog.querySelectorAll('[data-side]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.side === name)));
    };
    dialog.querySelectorAll('[data-side]').forEach(b => b.addEventListener('click', () => switchSide(b.dataset.side)));
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { dialog.remove(); if(returnFocus?.isConnected) returnFocus.focus(); }, {once:true});
    document.body.appendChild(dialog); dialog.showModal(); switchSide(side);
  }
  document.addEventListener('click', e => {
    const button = e.target.closest('[data-cs-preview],[data-preview-visual]');
    if (!button) return;
    const id = button.dataset.collection || button.dataset.visualCollection;
    const number = button.dataset.number || button.dataset.visualNumber;
    const visual = resolve(id, number, '', button.dataset.entryKey || '');
    if (!visual) return;
    e.preventDefault(); e.stopImmediatePropagation();
    preview(visual, button.dataset.player || button.dataset.visualPlayer || '', number, button);
  }, true);
  document.addEventListener('keydown', e => {
    const target=e.target.closest('[data-preview-visual]');
    if (target && (e.key==='Enter'||e.key===' ')) { e.preventDefault(); e.stopImmediatePropagation(); target.click(); }
  }, true);
  document.addEventListener('error', e => {
    const img=e.target;
    if (!(img instanceof HTMLImageElement) || !img.matches('[data-cs-image]')) return;
    img.hidden=true;
    if (!img.parentElement.querySelector('.cs-image-placeholder')) {
      const label=document.createElement('span');label.className='cs-image-placeholder';label.textContent='Imagen no disponible';img.parentElement.appendChild(label);
    }
  }, true);
  window.CSVisual = { resolve, thumbnail, searchResult, preview };
})();
