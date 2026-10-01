(() => {
  function normalizedCardLabel(card) {
    const year = String(card?.year || '').trim();
    const manufacturer = String(card?.manufacturer || '').trim();
    const product = String(card?.product || '').trim();
    if (!product) return [year, manufacturer].filter(Boolean).join(' ');
    const lower = product.toLowerCase();
    const parts = [];
    if (year && !lower.includes(year.toLowerCase())) parts.push(year);
    if (manufacturer && !lower.includes(manufacturer.toLowerCase())) parts.push(manufacturer);
    parts.push(product);
    return parts.join(' ');
  }

  cardLabel = normalizedCardLabel;

  async function polishDetailGallery() {
    if (state.view !== 'detail' || !state.selectedId) return;
    const gallery = document.querySelector('.photo-gallery');
    const backSlot = document.querySelector('#backPhotoSlot');
    if (!gallery || !backSlot) return;

    let back = null;
    try { back = await getPhoto(state.selectedId, 'back'); } catch {}

    if (!back) {
      gallery.classList.add('single-photo');
      backSlot.hidden = true;
      const detailCard = gallery.closest('.detail-card');
      if (detailCard && !detailCard.querySelector('.reverse-note')) {
        const note = document.createElement('div');
        note.className = 'reverse-note muted tiny';
        note.textContent = 'Reverso: todavía no hay una imagen cargada para esta carta.';
        gallery.insertAdjacentElement('afterend', note);
      }
    } else {
      gallery.classList.remove('single-photo');
      backSlot.hidden = false;
    }

    const card = state.cards.find(c => c.id === state.selectedId);
    if (!card) return;
    const sourcePage = card.referenceImageSourcePage || '';
    const source = card.referenceImageSource || '';
    const frontSlot = document.querySelector('#frontPhotoSlot');
    if (frontSlot && sourcePage && !frontSlot.querySelector('.reference-source-link')) {
      const a = document.createElement('a');
      a.className = 'reference-source-link';
      a.href = sourcePage;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = source ? `Fuente: ${source} ↗` : 'Fuente de imagen ↗';
      frontSlot.appendChild(a);
    }
  }

  function repairHiddenMedia() {
    document.querySelectorAll('.photo-slot img[hidden], .photo-empty[hidden]').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }

  const previousRender = render;
  render = function() {
    previousRender();
    repairHiddenMedia();
    polishDetailGallery();
  };

  render();
})();
