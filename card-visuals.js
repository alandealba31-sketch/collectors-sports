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
    if (!visual.front) return null;

    // Safety rule: metadata alone is not enough. Only visually audited cards count as exact.
    visual.kind = entry?.kind === 'exact' && entry?.exactVerified === true ? 'exact' : 'reference';
    if (entry?.kind === 'exact' && entry?.exactVerified !== true) {
      visual.label = `${visual.label || 'Imagen de catálogo'} · pendiente de verificación visual exacta`;
    }

    if (variant && !/^base$/i.test(variant) && visual.kind === 'exact' && String(entry?.variant || 'Base').toLowerCase() !== variant.toLowerCase()) {
      visual.kind = 'reference';
      visual.label = `${visual.label || 'Imagen de catálogo'} · El paralelo de tu ejemplar puede ser diferente`;
    }
    return visual;
  }
  function thumbnail(visual, title, className = '') {
    const url = safeUrl(visual?.front);
    return `<span class="cs-card-thumbnail ${className}">${url ? `<img data-cs-image src="${escape(url)}" alt="${escape(title)}" loading="lazy" decoding="async">` : '<span class="cs-image-placeholder">Sin imagen</span>'}</span>`;
  }
  function searchResult(entry, index) {
    const visual = resolve(entry.collection.id, entry.number, entry.row?.[6], entry.row?.[7]);
    const kind = entry.subset || (Array.isArray(entry.flags) ? entry.flags.join(' · ') : '') || 'Base';
    const status = visual ? (visual.kind === 'exact' ? 'Frente exacto verificado' : 'Referencia visual · no cuenta como cobertura') : 'Imagen pendiente';
    return `<div class="cs-visual-result"><button type="button" class="cs-live-result" data-cs-result="${index}">${thumbnail(visual, entry.player)}<span class="cs-result-copy"><strong>${escape(entry.player)}</strong><span>${escape(kind)} · ${escape(entry.collection.shortName || entry.collection.name)} · #${escape(entry.number)}</span>${entry.team ? `<small>${escape(entry.team)}</small>` : ''}<small class="cs-image-status">${status}</small></span></button>${visual ? `<button type="button" class="cs-image-expand" data-cs-preview data-collection="${escape(entry.collection.id)}" data-number="${escape(entry.number)}" data-entry-key="${escape(entry.row?.[7]||'')}" data-player="${escape(entry.player)}" aria-label="Ampliar imagen de ${escape(entry.player)}">Ampliar</button>` : ''}</div>`;
  }
  function preview(visual, title, number, returnFocus) {
    document.querySelector('.cs-card-dialog')?.close();
    document.querySelector('.cs-card-dialog')?.remove();
    const dialog = document.createElement('dialog');
    dialog.className = 'cs-card-dialog';
    dialog.setAttribute('aria-labelledby','cs-preview-title');
    const exact = visual.kind === 'exact';
    dialog.innerHTML = `<div class="cs-dialog-head"><div><h2 id="cs-preview-title">${escape(title)}</h2><div class="muted">#${escape(number)}</div></div><button type="button" class="btn secondary" data-close>✕<span class="sr-only">Cerrar imagen</span></button></div><div class="cs-preview-frame"><img data-cs-image src="${escape(visual.front)}" alt="${escape(title)} — frente"></div><div style="text-align:center"><span class="cs-verified-badge">${exact ? '✓ Frente exacto verificado' : 'Referencia visual'}</span></div><p class="cs-preview-caption">${escape(visual.label || (exact ? 'Frente exacto de catálogo' : 'Referencia visual'))}</p>${!exact ? '<p class="muted tiny" style="text-align:center">Esta imagen sirve como referencia, pero no cuenta en la cobertura exacta hasta completar la verificación visual.</p>' : ''}${/^https:\/\//.test(visual.sourcePage || '') ? `<div style="text-align:center"><a class="catalog-source-detail" href="${escape(visual.sourcePage)}" target="_blank" rel="noopener noreferrer">Fuente: ${escape(visual.source || 'Ver imagen')} ↗</a></div>` : ''}`;
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { dialog.remove(); if(returnFocus?.isConnected) returnFocus.focus(); }, {once:true});
    document.body.appendChild(dialog); dialog.showModal();
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