(() => {
  const IMAGE_CACHE = window.CS_IMAGE_CACHE || {};

  function cacheKey(collectionId, cardNumber) {
    return `${collectionId || ''}|${String(cardNumber || '')}`;
  }

  function cachedFrontFor(card) {
    if (!card?.catalogCollectionId || !card?.cardNumber) return '';
    return IMAGE_CACHE[cacheKey(card.catalogCollectionId, card.cardNumber)] || '';
  }

  // Every card selected from one of our loaded base checklists starts as Base.
  // The collector can then change the variant to Gold/Refractor/etc. when that is the actual copy.
  const previousSeedFromCatalogCard = seedFromCatalogCard;
  seedFromCatalogCard = function(collectionId, index) {
    const seed = previousSeedFromCatalogCard(collectionId, index);
    if (!seed) return seed;
    const cached = IMAGE_CACHE[cacheKey(collectionId, seed.cardNumber)] || '';
    return {
      ...seed,
      parallel: seed.parallel || 'Base',
      serial: seed.serial || '',
      referenceImageUrl: cached || seed.referenceImageUrl || ''
    };
  };

  // Normalize already-added base-checklist cards that were created before V0.6d.
  let migrated = false;
  state.cards.forEach(card => {
    if (card.catalogCollectionId && card.cardNumber && !String(card.parallel || '').trim()) {
      card.parallel = 'Base';
      migrated = true;
    }
  });
  if (migrated) saveCards();

  // Use our same-origin cached exact image in inventory rows whenever one exists.
  const previousCardRow = cardRow;
  cardRow = function(card) {
    let html = previousCardRow(card);
    const cached = cachedFrontFor(card);
    if (!cached) return html;
    return html.replace(/(<span class="inventory-thumb"><img src=")[^"]+/, `$1${cached}`);
  };

  function clarifyVariantFields() {
    const parallel = document.querySelector('#parallel');
    const serial = document.querySelector('#serial');
    if (parallel) parallel.placeholder = 'Ej. Gold Refractor (solo si aplica)';
    if (serial) serial.placeholder = 'Ej. 12/50 (solo si está numerada)';
  }

  function applyCachedFormImage() {
    if (state.view !== 'add' && state.view !== 'edit') return;
    const candidate = state.view === 'edit'
      ? state.cards.find(card => card.id === state.editId)
      : state.prefill;
    const cached = cachedFrontFor(candidate);
    if (!cached) return;
    const img = document.querySelector('.visual-confirm-image img');
    if (!img) return;
    img.src = cached;
    img.removeAttribute('referrerpolicy');
    img.classList.remove('image-load-failed');
    img.style.removeProperty('display');
  }

  async function applyCachedDetailImage() {
    if (state.view !== 'detail' || !state.selectedId) return;
    const card = state.cards.find(c => c.id === state.selectedId);
    if (!card) return;

    // A photo of the user's actual specimen always has priority over the catalog image.
    try {
      const local = await getPhoto(card.id, 'front');
      if (local) return;
    } catch {}

    const cached = cachedFrontFor(card);
    if (!cached) return;
    const slot = document.querySelector('#frontPhotoSlot');
    const img = slot?.querySelector('img');
    if (!slot || !img) return;

    img.src = cached;
    img.hidden = false;
    img.classList.remove('image-load-failed');
    img.style.removeProperty('display');
    slot.classList.add('reference-photo-slot', 'visual-exact');

    const caption = slot.querySelector('.photo-empty');
    if (caption) {
      caption.hidden = false;
      caption.classList.add('reference-caption');
      caption.textContent = 'Imagen exacta · Base';
      caption.style.removeProperty('display');
    }
  }

  function installImageFallbacks() {
    const card = state.view === 'detail' && state.selectedId
      ? state.cards.find(c => c.id === state.selectedId)
      : null;
    const cached = cachedFrontFor(card);
    if (!cached) return;
    const img = document.querySelector('#frontPhotoSlot img');
    if (!img) return;
    img.addEventListener('error', () => {
      img.src = cached;
      img.hidden = false;
      img.classList.remove('image-load-failed');
      img.style.removeProperty('display');
    });
  }

  const previousRender = render;
  render = function() {
    previousRender();
    clarifyVariantFields();
    applyCachedFormImage();
    installImageFallbacks();
    applyCachedDetailImage();
  };

  render();
})();
