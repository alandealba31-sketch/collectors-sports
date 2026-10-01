(() => {
  const catalog = window.CS_IMAGE_CATALOG || { collections: {}, cards: {} };

  function cardImageKey(card) {
    if (!card?.catalogCollectionId || !card?.cardNumber) return '';
    return `${card.catalogCollectionId}|${String(card.cardNumber)}`;
  }

  function verifiedCardVisual(card) {
    const visual = window.CSVisual.resolve(card.catalogCollectionId, card.cardNumber, card.parallel, card.catalogEntryKey);
    return visual && (visual.kind === 'exact' || visual.kind === 'reference') ? visual : null;
  }

  // Remove collection-cover images that older builds accidentally saved as if they
  // belonged to the selected card. A product cover must never identify a card.
  let migrated = false;
  state.cards.forEach(card => {
    if (card?.cardNumber && card.referenceImageKind === 'collection') {
      delete card.referenceImageUrl;
      delete card.referenceImageKind;
      delete card.referenceImageSource;
      delete card.referenceImageSourcePage;
      delete card.referenceImageLabel;
      migrated = true;
    }
  });
  if (migrated) saveCards();

  function guardAddForm() {
    if (state.view !== 'add' && state.view !== 'edit') return;
    const candidate = state.view === 'edit'
      ? state.cards.find(card => card.id === state.editId)
      : state.prefill;
    if (!candidate?.cardNumber) return;

    const form = document.querySelector('#cardForm');
    if (!form) return;

    // app-v06 may have inserted a collection cover as fallback. Remove it.
    document.querySelectorAll('.visual-confirm.visual-collection').forEach(el => el.remove());

    const kindInput = form.querySelector('input[name="referenceImageKind"]');
    if (kindInput?.value === 'collection') {
      ['referenceImageUrl','referenceImageKind','referenceImageSource','referenceImageSourcePage','referenceImageLabel']
        .forEach(name => form.querySelector(`input[name="${name}"]`)?.remove());
    }

    const visual = verifiedCardVisual(candidate);
    if (!visual && !document.querySelector('.card-image-missing')) {
      const notice = document.createElement('section');
      notice.className = 'card card-image-missing';
      notice.innerHTML = `<div class="eyebrow">IMAGEN DE LA CARTA</div><strong>Sin foto exacta verificada</strong><div class="muted" style="margin-top:8px">No usamos la portada de la colección para identificar esta carta. La imagen aparecerá únicamente cuando coincida con el número/jugador o cuando subas una foto de tu ejemplar.</div>`;
      form.parentNode.insertBefore(notice, form);
    }
  }

  async function guardDetail() {
    if (state.view !== 'detail' || !state.selectedId) return;
    const card = state.cards.find(c => c.id === state.selectedId);
    if (!card) return;

    try {
      const ownPhoto = await getPhoto(card.id, 'front');
      if (ownPhoto) return;
    } catch {}

    const explicit = card.referenceImageUrl && ['exact','reference'].includes(card.referenceImageKind)
      ? { front: card.referenceImageUrl, kind: card.referenceImageKind }
      : verifiedCardVisual(card);
    if (explicit?.front) return;

    const slot = document.querySelector('#frontPhotoSlot');
    if (!slot) return;
    const img = slot.querySelector('img');
    if (img) {
      img.removeAttribute('src');
      img.hidden = true;
      img.style.setProperty('display', 'none', 'important');
    }
    slot.classList.remove('reference-photo-slot','visual-collection','visual-reference','visual-exact');
    slot.querySelector('.reference-source-link')?.remove();
    const caption = slot.querySelector('.photo-empty');
    if (caption) {
      caption.hidden = false;
      caption.style.removeProperty('display');
      caption.classList.remove('reference-caption');
      caption.textContent = 'Sin foto exacta verificada';
    }
  }

  function markVersion() {
    const subtitle = document.querySelector('.topbar .brand .muted');
    if (subtitle) subtitle.textContent = 'Colección premium · V0.8 · Catalog Build';
  }

  const previousRender = render;
  render = function() {
    previousRender();
    markVersion();
    guardAddForm();
    guardDetail();
    // Some prior image hydration is asynchronous; run the guard again after it.
    setTimeout(guardDetail, 50);
    setTimeout(guardDetail, 250);
  };

  render();
})();

