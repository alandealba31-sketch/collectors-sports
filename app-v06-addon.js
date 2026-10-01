(() => {
  const IMAGE_CATALOG = window.CS_IMAGE_CATALOG || { collections: {}, cards: {} };

  function imageKey(collectionId, cardNumber) {
    return `${collectionId || ''}|${String(cardNumber || '')}`;
  }

  function exactVisual(collectionId, cardNumber) {
    return IMAGE_CATALOG.cards?.[imageKey(collectionId, cardNumber)] || null;
  }

  function collectionVisual(collectionId) {
    const c = IMAGE_CATALOG.collections?.[collectionId];
    if (!c?.cover) return null;
    return { front: c.cover, kind: c.kind || 'collection', source: c.source, sourcePage: c.sourcePage, label: c.label };
  }

  function visualFor(collectionId, cardNumber, includeCollectionFallback = true) {
    return exactVisual(collectionId, cardNumber) || (includeCollectionFallback ? collectionVisual(collectionId) : null);
  }

  function kindLabel(kind) {
    if (kind === 'exact') return 'Imagen exacta';
    if (kind === 'reference') return 'Referencia visual';
    return 'Vista de colección';
  }

  function kindClass(kind) {
    if (kind === 'exact') return 'visual-exact';
    if (kind === 'reference') return 'visual-reference';
    return 'visual-collection';
  }

  function visualMessage(kind) {
    if (kind === 'exact') return 'Coincide con la carta y número del checklist. Úsala para confirmar antes de agregar.';
    if (kind === 'reference') return 'Sirve para reconocer al sujeto o diseño, pero el paralelo, subset o acabado puede variar.';
    return 'Es una imagen oficial representativa del producto. No confirma la carta exacta.';
  }

  function visualThumb(visual, collectionId, cardNumber, player) {
    if (!visual?.front) return '<span class="catalog-thumb catalog-thumb-empty" aria-hidden="true">CS</span>';
    return `<span class="catalog-thumb ${kindClass(visual.kind)}" role="button" tabindex="0" data-preview-visual="1" data-visual-collection="${esc(collectionId)}" data-visual-number="${esc(cardNumber)}" data-visual-player="${esc(player || '')}" aria-label="Ver imagen de referencia"><img src="${esc(visual.front)}" alt="${esc(player || 'Carta')}" loading="lazy" referrerpolicy="no-referrer"><span class="visual-dot"></span></span>`;
  }

  const originalLayout = layout;
  layout = function(content) {
    return originalLayout(content).replace('Colección premium · V0.5', 'Colección premium · V0.6 · Visual');
  };

  catalogRow = function(c) {
    const full = c.coverage === 'base-complete' || c.coverage === 'full-checklist';
    const owned = ownedCardsForCollection(c.id).length;
    const visual = collectionVisual(c.id);
    const image = visual?.front
      ? `<span class="catalog-cover"><img src="${esc(visual.front)}" alt="${esc(c.shortName || c.name)}" loading="lazy" referrerpolicy="no-referrer"></span>`
      : `<span class="catalog-cover catalog-cover-empty">${sportIcon(c.sport)}</span>`;
    return `<button class="catalog-item catalog-item-visual" data-catalog-id="${esc(c.id)}">${image}<span class="catalog-item-copy"><div class="catalog-item-top"><span class="badge green">${esc(c.sport)}</span><span class="badge ${full ? 'gold' : ''}">${c.coverage === 'full-checklist' ? 'Checklist cargado' : full ? 'Base cargada' : 'Colección cargada'}</span>${visual ? '<span class="badge visual-badge">Visual</span>' : ''}</div><strong>${esc(c.shortName || c.name)}</strong><div class="muted">${esc(c.manufacturer)} · ${esc(c.year)}</div><div class="catalog-stats"><span>${c.baseCount ? `${c.baseCount} cartas base` : (CATALOG.checklists[c.id]?.length ? `${CATALOG.checklists[c.id].length} cartas en checklist` : 'Checklist en preparación')}</span>${owned ? `<strong>✓ ${owned} registrada${owned === 1 ? '' : 's'}</strong>` : ''}</div></span></button>`;
  };

  catalogCardRow = function(c, row, index) {
    const [number, player, team, rookie] = row;
    const owned = findOwnedCatalogCard(c.id, row);
    const visual = exactVisual(c.id, number);
    return `<button class="catalog-card-row visual-row ${owned ? 'owned' : ''}" ${owned ? `data-card="${esc(owned.id)}"` : `data-use-catalog-card="${esc(c.id)}" data-catalog-card-index="${index}"`}>${visualThumb(visual, c.id, number, player)}<span class="catalog-number">#${esc(number)}</span><span class="catalog-player"><strong>${esc(player)}</strong><em>${esc(team)}</em>${visual ? `<small class="${kindClass(visual.kind)}">${kindLabel(visual.kind)}</small>` : ''}</span>${rookie ? '<span class="badge gold">RC</span>' : ''}${owned ? '<span class="catalog-owned">✓</span>' : '<span class="catalog-plus">＋</span>'}</button>`;
  };

  const originalSeedFromCatalogCard = seedFromCatalogCard;
  seedFromCatalogCard = function(collectionId, index) {
    const seed = originalSeedFromCatalogCard(collectionId, index);
    if (!seed) return seed;
    const visual = exactVisual(collectionId, seed.cardNumber);
    if (!visual) return seed;
    return {
      ...seed,
      referenceImageUrl: visual.front || '',
      referenceImageKind: visual.kind || 'reference',
      referenceImageSource: visual.source || '',
      referenceImageSourcePage: visual.sourcePage || '',
      referenceImageLabel: visual.label || ''
    };
  };

  const originalCardRow = cardRow;
  cardRow = function(card) {
    const visual = card.referenceImageUrl
      ? { front: card.referenceImageUrl, kind: card.referenceImageKind || 'reference' }
      : exactVisual(card.catalogCollectionId, card.cardNumber);
    if (!visual?.front) return originalCardRow(card);
    const title = esc(card.player || 'Sin jugador');
    const subtitle = [cardLabel(card), card.cardNumber ? `#${card.cardNumber}` : ''].filter(Boolean).join(' · ');
    return `<button class="item item-with-thumb" data-card="${esc(card.id)}"><span class="inventory-thumb"><img src="${esc(visual.front)}" alt="${title}" loading="lazy" referrerpolicy="no-referrer"></span><span class="inventory-copy"><div class="item-head"><div class="item-main"><div class="item-title">${title}</div><div class="muted item-subtitle">${esc(subtitle || card.team || 'Sin colección')}</div></div><div class="item-price">${money(card.currentValue, card.currency)}</div></div><div class="badges"><span class="badge green">${esc(card.sport)}</span>${card.parallel ? `<span class="badge">${esc(card.parallel)}</span>` : ''}${card.serial ? `<span class="badge gold">${esc(card.serial)}</span>` : ''}${tags(card).map(t => `<span class="badge">${t}</span>`).join('')}</div>${card.location ? `<div class="item-location">⌖ ${esc(card.location)}</div>` : ''}</span></button>`;
  };

  function currentFormCandidate() {
    if (state.view === 'edit' && state.editId) return state.cards.find(c => c.id === state.editId) || null;
    return state.prefill || null;
  }

  function injectFormVisual() {
    if (state.view !== 'add' && state.view !== 'edit') return;
    const form = document.querySelector('#cardForm');
    if (!form) return;
    const candidate = currentFormCandidate() || {};
    let visual = null;
    if (candidate.referenceImageUrl) {
      visual = {
        front: candidate.referenceImageUrl,
        kind: candidate.referenceImageKind || 'reference',
        source: candidate.referenceImageSource || '',
        sourcePage: candidate.referenceImageSourcePage || '',
        label: candidate.referenceImageLabel || ''
      };
    } else if (candidate.catalogCollectionId && candidate.cardNumber) {
      visual = visualFor(candidate.catalogCollectionId, candidate.cardNumber, true);
    } else if (candidate.catalogCollectionId) {
      visual = collectionVisual(candidate.catalogCollectionId);
    }
    if (!visual?.front) return;

    const title = candidate.cardNumber && candidate.player
      ? `#${esc(candidate.cardNumber)} · ${esc(candidate.player)}`
      : esc(candidate.product || 'Colección seleccionada');
    const block = document.createElement('section');
    block.className = `card visual-confirm ${kindClass(visual.kind)}`;
    block.innerHTML = `<div class="visual-confirm-image"><img src="${esc(visual.front)}" alt="Referencia visual ${title}" referrerpolicy="no-referrer"></div><div class="visual-confirm-copy"><div class="visual-confirm-head"><span class="badge visual-badge ${kindClass(visual.kind)}">${kindLabel(visual.kind)}</span>${visual.source ? `<span class="muted tiny">Fuente: ${esc(visual.source)}</span>` : ''}</div><h3>${title}</h3><p>${visualMessage(visual.kind)}</p>${visual.label ? `<div class="muted tiny">${esc(visual.label)}</div>` : ''}${visual.sourcePage ? `<a class="catalog-source-detail" href="${esc(visual.sourcePage)}" target="_blank" rel="noopener">Ver fuente de la imagen ↗</a>` : ''}</div>`;
    form.parentNode.insertBefore(block, form);

    const hidden = {
      referenceImageUrl: visual.front || '',
      referenceImageKind: visual.kind || '',
      referenceImageSource: visual.source || '',
      referenceImageSourcePage: visual.sourcePage || '',
      referenceImageLabel: visual.label || ''
    };
    Object.entries(hidden).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = name; input.value = value;
      form.appendChild(input);
    });
  }

  async function hydrateReferenceOnDetail() {
    if (state.view !== 'detail' || !state.selectedId) return;
    const card = state.cards.find(c => c.id === state.selectedId);
    if (!card) return;
    try {
      const localFront = await getPhoto(card.id, 'front');
      if (localFront) return;
    } catch {}
    const visual = card.referenceImageUrl
      ? {
          front: card.referenceImageUrl,
          kind: card.referenceImageKind || 'reference',
          source: card.referenceImageSource || '',
          sourcePage: card.referenceImageSourcePage || '',
          label: card.referenceImageLabel || ''
        }
      : visualFor(card.catalogCollectionId, card.cardNumber, true);
    if (!visual?.front) return;
    const slot = document.querySelector('#frontPhotoSlot');
    if (!slot) return;
    const img = slot.querySelector('img');
    const empty = slot.querySelector('.photo-empty');
    if (!img) return;
    img.src = visual.front;
    img.hidden = false;
    img.referrerPolicy = 'no-referrer';
    if (empty) {
      empty.hidden = false;
      empty.classList.add('reference-caption');
      empty.textContent = kindLabel(visual.kind);
    }
    slot.classList.add('reference-photo-slot', kindClass(visual.kind));
    if (visual.sourcePage) slot.dataset.sourcePage = visual.sourcePage;
  }

  function showVisualModal(collectionId, number, player) {
    const visual = visualFor(collectionId, number, false);
    if (!visual?.front) return;
    document.querySelector('.visual-modal')?.remove();
    const modal = document.createElement('div');
    modal.className = 'visual-modal';
    modal.innerHTML = `<div class="visual-modal-backdrop" data-close-visual></div><div class="visual-modal-card"><button class="visual-modal-close" data-close-visual aria-label="Cerrar">×</button><img src="${esc(visual.front)}" alt="${esc(player || 'Carta')}" referrerpolicy="no-referrer"><div class="visual-modal-copy"><span class="badge visual-badge ${kindClass(visual.kind)}">${kindLabel(visual.kind)}</span><h3>${esc(player || visual.label || 'Carta')}</h3><div class="muted">#${esc(number)}</div><p>${visualMessage(visual.kind)}</p>${visual.sourcePage ? `<a class="btn secondary link-btn" href="${esc(visual.sourcePage)}" target="_blank" rel="noopener">Fuente ↗</a>` : ''}</div></div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-close-visual]').forEach(el => el.addEventListener('click', () => modal.remove()));
  }

  function bindVisualEnhancements() {
    document.querySelectorAll('[data-preview-visual]').forEach(el => {
      const open = e => {
        e.preventDefault(); e.stopPropagation();
        showVisualModal(el.dataset.visualCollection, el.dataset.visualNumber, el.dataset.visualPlayer);
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(e); });
    });
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', () => {
        img.classList.add('image-load-failed');
        const holder = img.closest('.catalog-thumb,.catalog-cover,.visual-confirm-image,.inventory-thumb');
        if (holder) holder.classList.add('image-failed');
      }, { once: true });
    });
  }

  const originalRender = render;
  render = function() {
    originalRender();
    injectFormVisual();
    bindVisualEnhancements();
    hydrateReferenceOnDetail();
  };

  render();
})();

