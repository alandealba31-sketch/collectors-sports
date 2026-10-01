(() => {
  const MARKET = window.CS_MARKET_SEED || { guides: {} };
  const DAY = 86400000;

  function norm(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function parallelKey(card) {
    const value = String(card?.parallel || '').trim();
    return !value || /^base( set)?$/i.test(value) ? 'base' : norm(value);
  }

  function gradeKey(card) {
    const value = String(card?.condition || '').trim();
    const match = value.match(/\b(PSA|BGS|SGC|CGC|TAG|ACE)\s*([0-9]+(?:\.[0-9]+)?)\b/i);
    return match ? `${match[1].toLowerCase()}-${match[2]}` : 'ungraded';
  }

  function guideKey(card) {
    if (!card?.catalogCollectionId || !card?.cardNumber) return '';
    return `${card.catalogCollectionId}|${String(card.cardNumber)}|${parallelKey(card)}|${gradeKey(card)}`;
  }

  function usdToMxn(value) { return num(value) * FX_USD_MXN; }
  function compToMxn(comp) { return String(comp?.currency || 'USD').toUpperCase() === 'MXN' ? num(comp.price) : usdToMxn(comp.price); }

  function recencyWeight(date) {
    const parsed = new Date(date || 0).getTime();
    if (!parsed) return 0.35;
    const days = Math.max(0, (Date.now() - parsed) / DAY);
    if (days <= 30) return 1;
    if (days <= 90) return 0.85;
    if (days <= 180) return 0.65;
    if (days <= 365) return 0.4;
    return 0.2;
  }

  function qualityWeight(quality) {
    return ({ exact: 1, close: 0.65, broad: 0.35 })[quality] || 0.65;
  }

  function weightedQuantile(points, q) {
    const clean = points.filter(x => Number.isFinite(x.value) && x.value > 0 && x.weight > 0).sort((a,b) => a.value - b.value);
    if (!clean.length) return 0;
    const total = clean.reduce((sum,x) => sum + x.weight, 0);
    const target = total * q;
    let running = 0;
    for (const point of clean) {
      running += point.weight;
      if (running >= target) return point.value;
    }
    return clean[clean.length - 1].value;
  }

  function estimateFor(card) {
    if (!card) return null;
    const guide = MARKET.guides?.[guideKey(card)] || null;
    const comps = Array.isArray(card.marketComps) ? card.marketComps.filter(c => num(c.price) > 0) : [];
    const override = num(card.marketOverrideMxn);
    if (override > 0) {
      return { estimateMxn: override, lowMxn: override, highMxn: override, confidence: 'custom', guide, comps, basis: 'custom' };
    }

    const points = comps.map(comp => ({
      value: compToMxn(comp),
      weight: recencyWeight(comp.date) * qualityWeight(comp.quality),
      kind: 'comp'
    }));
    if (guide?.estimateUsd) points.push({ value: usdToMxn(guide.estimateUsd), weight: comps.length ? 0.7 : 1, kind: 'guide' });
    if (guide?.estimateMxn) points.push({ value: num(guide.estimateMxn), weight: comps.length ? 0.7 : 1, kind: 'guide' });

    if (!points.length) {
      const manual = toManualMxn(card);
      if (manual > 0) return { estimateMxn: manual, lowMxn: manual, highMxn: manual, confidence: 'manual', guide: null, comps, basis: 'manual' };
      return null;
    }

    const estimateMxn = weightedQuantile(points, 0.5);
    let lowMxn = estimateMxn, highMxn = estimateMxn;
    if (points.length >= 3) {
      lowMxn = weightedQuantile(points, 0.25);
      highMxn = weightedQuantile(points, 0.75);
    } else if (points.length === 2) {
      lowMxn = Math.min(...points.map(x => x.value));
      highMxn = Math.max(...points.map(x => x.value));
    }

    const exact = comps.filter(c => c.quality === 'exact').length;
    let confidence = guide?.confidence || 'low';
    if (exact >= 5) confidence = 'high';
    else if (exact >= 3 || comps.length >= 4) confidence = 'medium';
    else if (comps.length) confidence = 'low';

    return { estimateMxn, lowMxn, highMxn, confidence, guide, comps, basis: comps.length ? 'comps' : 'guide' };
  }

  function toManualMxn(card) {
    const value = num(card?.currentValue);
    if (!value) return 0;
    return String(card?.currency || 'MXN').toUpperCase() === 'USD' ? usdToMxn(value) : value;
  }

  function confidenceLabel(value) {
    return ({ high:'Alta', medium:'Media', low:'Baja', manual:'Manual', custom:'Personalizada' })[value] || 'Baja';
  }

  function confidenceClass(value) {
    if (value === 'high') return 'market-high';
    if (value === 'medium') return 'market-medium';
    if (value === 'custom') return 'market-custom';
    return 'market-low';
  }

  function marketMoney(value) { return money(Math.round(num(value)), 'MXN'); }

  function searchText(card) {
    return [card.year, card.manufacturer, card.product, card.player, card.cardNumber ? `#${card.cardNumber}` : '', parallelKey(card) !== 'base' ? card.parallel : 'Base', card.serial, gradeKey(card) !== 'ungraded' ? card.condition : ''].filter(Boolean).join(' ');
  }

  function ebaySoldUrl(card) {
    return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchText(card))}&LH_Sold=1&LH_Complete=1`;
  }

  function cardSourceSummary(result) {
    if (!result) return 'Sin estimación';
    if (result.basis === 'custom') return 'Valor personalizado';
    if (result.basis === 'manual') return 'Valor manual registrado';
    if (result.basis === 'comps') return `${result.comps.length} comparable${result.comps.length === 1 ? '' : 's'} registrado${result.comps.length === 1 ? '' : 's'}`;
    if (result.guide?.source) return `${result.guide.source} · historial de ventas`;
    return 'Mercado';
  }

  // Repair the one card that inherited the old demo Gold /50 placeholders before V0.6d.
  let repaired = false;
  state.cards.forEach(card => {
    const isBuggedLamine = card.catalogCollectionId === 'topps-chrome-ucc-2025-26' && String(card.cardNumber) === '10' && /lamine yamal/i.test(card.player || '') && /gold/i.test(card.parallel || '') && String(card.serial || '') === '12/50';
    if (isBuggedLamine) {
      card.parallel = 'Base';
      card.serial = '';
      repaired = true;
    }
  });
  if (repaired) saveCards();

  const baseToMXN = toMXN;
  toMXN = function(card, field = 'currentValue') {
    if (field === 'currentValue') {
      const result = estimateFor(card);
      if (result?.estimateMxn > 0) return result.estimateMxn;
    }
    return baseToMXN(card, field);
  };

  const previousLayout = layout;
  layout = function(content) {
    return previousLayout(content).replace('Colección premium · V0.6 · Visual', 'Colección premium · V0.7 · Market');
  };

  function pricingPanel(card) {
    const result = estimateFor(card);
    if (!result) {
      return `<section class="market-panel market-empty-panel"><div class="market-panel-head"><div><div class="eyebrow">MERCADO</div><h3>Sin estimación todavía</h3></div><span class="market-confidence market-low">Sin datos</span></div><p class="muted">Necesitamos una guía de ventas o comparables de esta carta, variante y condición.</p><div class="market-actions"><button class="btn" id="openMarketModal">Agregar comparable</button><a class="btn secondary link-btn" href="${esc(ebaySoldUrl(card))}" target="_blank" rel="noopener">Buscar ventas en eBay ↗</a></div></section>`;
    }

    const range = result.highMxn > result.lowMxn ? `${marketMoney(result.lowMxn)}–${marketMoney(result.highMxn)}` : '';
    const guideUsd = result.guide?.estimateUsd ? `US ${money(result.guide.estimateUsd, 'USD')}` : '';
    const checked = result.guide?.checkedAt ? new Date(`${result.guide.checkedAt}T12:00:00`).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'}) : '';
    return `<section class="market-panel"><div class="market-panel-head"><div><div class="eyebrow">ESTIMACIÓN DE MERCADO</div><div class="market-main-value">${marketMoney(result.estimateMxn)}</div></div><span class="market-confidence ${confidenceClass(result.confidence)}">Confianza ${confidenceLabel(result.confidence)}</span></div>${range ? `<div class="market-range">Rango observado <strong>${range}</strong></div>` : ''}<div class="market-source-row"><span>${esc(cardSourceSummary(result))}</span>${guideUsd ? `<strong>${esc(guideUsd)}</strong>` : ''}</div>${checked ? `<div class="muted tiny">Fuente revisada: ${esc(checked)} · FX provisional ${FX_USD_MXN} MXN/USD</div>` : `<div class="muted tiny">FX provisional ${FX_USD_MXN} MXN/USD</div>`}<div class="market-actions"><button class="btn" id="openMarketModal">Ventas y cálculo</button><a class="btn secondary link-btn" href="${esc(ebaySoldUrl(card))}" target="_blank" rel="noopener">Buscar ventas ↗</a>${result.guide?.sourceUrl ? `<a class="btn secondary link-btn" href="${esc(result.guide.sourceUrl)}" target="_blank" rel="noopener">Fuente ↗</a>` : ''}</div></section>`;
  }

  function injectDetailPricing() {
    if (state.view !== 'detail' || !state.selectedId) return;
    const card = state.cards.find(c => c.id === state.selectedId);
    const detail = document.querySelector('.detail-card');
    if (!card || !detail || detail.querySelector('.market-panel')) return;
    const result = estimateFor(card);
    const value = detail.querySelector('.detail-value');
    const eyebrow = detail.querySelector('.eyebrow');
    if (result?.estimateMxn > 0 && value) value.textContent = marketMoney(result.estimateMxn);
    if (result?.estimateMxn > 0 && eyebrow) eyebrow.textContent = 'VALOR ESTIMADO DE MERCADO';
    const gallery = detail.querySelector('.photo-gallery');
    const holder = document.createElement('div');
    holder.innerHTML = pricingPanel(card);
    const panel = holder.firstElementChild;
    if (gallery) gallery.insertAdjacentElement('beforebegin', panel); else detail.prepend(panel);
    document.querySelector('#openMarketModal')?.addEventListener('click', () => openMarketModal(card.id));
  }

  function updateCollectionPrices() {
    document.querySelectorAll('.item[data-card]').forEach(row => {
      const card = state.cards.find(c => c.id === row.dataset.card);
      const result = estimateFor(card);
      if (!card || !result?.estimateMxn) return;
      const price = row.querySelector('.item-price');
      if (price) {
        price.textContent = marketMoney(result.estimateMxn);
        price.classList.add('market-item-price');
      }
      const copy = row.querySelector('.inventory-copy') || row;
      if (!copy.querySelector('.market-mini')) {
        const mini = document.createElement('div');
        mini.className = `market-mini ${confidenceClass(result.confidence)}`;
        mini.textContent = `Mercado · ${confidenceLabel(result.confidence)}`;
        copy.appendChild(mini);
      }
    });
  }

  function injectHomeMarketSummary() {
    if (state.view !== 'home') return;
    const hero = document.querySelector('.hero');
    if (!hero || document.querySelector('.market-home-summary')) return;
    const priced = state.cards.map(card => estimateFor(card)).filter(Boolean).length;
    const guides = state.cards.filter(card => Boolean(MARKET.guides?.[guideKey(card)])).length;
    const block = document.createElement('section');
    block.className = 'market-home-summary';
    block.innerHTML = `<span><strong>${priced}</strong> de ${state.cards.length} cartas con valor</span><span><strong>${guides}</strong> con guía de ventas</span>`;
    hero.insertAdjacentElement('afterend', block);
  }

  function relabelManualValue() {
    if (state.view !== 'add' && state.view !== 'edit') return;
    const input = document.querySelector('#currentValue');
    if (!input) return;
    const label = document.querySelector('label[for="currentValue"]');
    if (label) label.textContent = 'Valor manual (opcional)';
    input.placeholder = 'Déjalo vacío si usaremos mercado';
    const field = input.closest('.field');
    if (field && !field.querySelector('.market-field-note')) {
      const note = document.createElement('div');
      note.className = 'muted tiny market-field-note';
      note.textContent = 'La estimación de mercado tendrá prioridad cuando existan ventas o una guía verificada.';
      field.appendChild(note);
    }
  }

  function compRow(comp) {
    const price = String(comp.currency || 'USD').toUpperCase() === 'MXN' ? money(comp.price,'MXN') : money(comp.price,'USD');
    const date = comp.date ? new Date(`${comp.date}T12:00:00`).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'}) : 'Sin fecha';
    const quality = ({exact:'Exacta',close:'Cercana',broad:'Amplia'})[comp.quality] || 'Cercana';
    return `<div class="market-comp"><div><strong>${esc(price)}</strong><span>${esc(comp.source || 'Venta')} · ${esc(date)} · ${quality}</span></div><div class="market-comp-actions">${comp.url ? `<a href="${esc(comp.url)}" target="_blank" rel="noopener">↗</a>` : ''}<button type="button" data-delete-comp="${esc(comp.id)}">×</button></div></div>`;
  }

  function openMarketModal(cardId) {
    const card = state.cards.find(c => c.id === cardId);
    if (!card) return;
    document.querySelector('.market-modal')?.remove();
    const result = estimateFor(card);
    const comps = Array.isArray(card.marketComps) ? card.marketComps : [];
    const modal = document.createElement('div');
    modal.className = 'market-modal';
    modal.innerHTML = `<div class="market-modal-backdrop" data-close-market></div><div class="market-modal-sheet"><div class="market-modal-top"><div><div class="eyebrow">VENTAS COMPARABLES</div><h3>${esc(card.player)} ${card.cardNumber ? `#${esc(card.cardNumber)}` : ''}</h3><div class="muted">${esc(card.parallel || 'Base')} · ${esc(card.condition || 'Raw')}</div></div><button class="market-modal-close" data-close-market>×</button></div>${result ? `<div class="market-modal-estimate"><span>Estimación actual</span><strong>${marketMoney(result.estimateMxn)}</strong><em>Confianza ${confidenceLabel(result.confidence)}</em></div>` : ''}${result?.guide ? `<div class="market-guide"><div><strong>${esc(result.guide.source)}</strong><span>${esc(result.guide.note || 'Guía basada en ventas históricas.')}</span></div>${result.guide.sourceUrl ? `<a href="${esc(result.guide.sourceUrl)}" target="_blank" rel="noopener">Ver ↗</a>` : ''}</div>` : ''}<div class="market-comps-list">${comps.length ? comps.map(compRow).join('') : '<div class="market-no-comps">Todavía no has agregado ventas individuales.</div>'}</div><form id="marketCompForm" class="market-comp-form"><h4>Agregar venta</h4><div class="market-form-grid"><label>Precio<input name="price" type="number" min="0" step="0.01" required placeholder="19.99"></label><label>Moneda<select name="currency"><option>USD</option><option>MXN</option></select></label><label>Plataforma<input name="source" type="text" placeholder="eBay"></label><label>Fecha<input name="date" type="date"></label><label>Coincidencia<select name="quality"><option value="exact">Exacta</option><option value="close">Cercana</option><option value="broad">Amplia</option></select></label><label class="market-url-field">Enlace<input name="url" type="url" placeholder="https://..."></label></div><button class="btn full" type="submit">Agregar y recalcular</button></form><div class="market-modal-search"><a class="btn secondary link-btn full" href="${esc(ebaySoldUrl(card))}" target="_blank" rel="noopener">Buscar ventas completadas en eBay ↗</a></div></div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-close-market]').forEach(el => el.addEventListener('click', () => modal.remove()));
    modal.querySelector('#marketCompForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const comp = {
        id: uuid(),
        price: num(fd.get('price')),
        currency: String(fd.get('currency') || 'USD'),
        source: String(fd.get('source') || 'Venta'),
        date: String(fd.get('date') || new Date().toISOString().slice(0,10)),
        quality: String(fd.get('quality') || 'exact'),
        url: String(fd.get('url') || ''),
        addedAt: new Date().toISOString()
      };
      card.marketComps = [...(Array.isArray(card.marketComps) ? card.marketComps : []), comp];
      card.marketUpdatedAt = new Date().toISOString();
      saveCards();
      modal.remove();
      render();
      openMarketModal(card.id);
    });
    modal.querySelectorAll('[data-delete-comp]').forEach(btn => btn.addEventListener('click', () => {
      card.marketComps = comps.filter(comp => comp.id !== btn.dataset.deleteComp);
      card.marketUpdatedAt = new Date().toISOString();
      saveCards();
      modal.remove();
      render();
      openMarketModal(card.id);
    }));
  }

  const previousRender = render;
  render = function() {
    previousRender();
    injectDetailPricing();
    updateCollectionPrices();
    injectHomeMarketSummary();
    relabelManualValue();
  };

  window.CS_PRICING = { estimateFor, guideKey, ebaySoldUrl };
  render();
})();
