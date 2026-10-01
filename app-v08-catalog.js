(() => {
  const previousCatalogCardRow = catalogCardRow;
  catalogCardRow = function(c, row, index) {
    let html = previousCatalogCardRow(c, row, index);
    const subset = row?.[4];
    if (subset) {
      html = html.replace('</em>', `</em><small class="muted" style="display:block;margin-top:3px">${esc(subset)}</small>`);
    }
    return html;
  };

  function parallelMetaFor(collectionId) {
    return window.CS_SET_META?.[collectionId] || null;
  }

  function patchCatalogLabels() {
    document.querySelectorAll('.section-title h2').forEach(h2 => {
      if (h2.textContent.trim() === 'Base checklist') h2.textContent = 'Checklist';
    });
    const addLabel = document.querySelector('label[for="catalogCardSelect"]');
    if (addLabel) addLabel.textContent = 'Carta de esta colección';

    document.querySelectorAll('.catalog-summary .muted').forEach(el => {
      if (el.textContent.includes('Fuentes oficiales')) {
        el.textContent = el.textContent.replace('Fuentes oficiales de fabricantes', 'Checklists verificados; priorizamos fuentes oficiales');
      }
    });
  }

  function patchCardOptions() {
    const select = document.querySelector('#catalogCardSelect');
    const collectionId = document.querySelector('#catalogCollectionSelect')?.value;
    if (!select || !collectionId) return;
    const rows = CATALOG.checklists?.[collectionId] || [];
    rows.forEach((row, index) => {
      const option = select.options[index + 1];
      if (!option || !row?.[4] || option.textContent.includes(` · ${row[4]}`)) return;
      option.textContent += ` · ${row[4]}`;
    });
  }

  function injectSetMetadata() {
    const collectionId = state.view === 'catalog-detail'
      ? state.catalogSelectedId
      : document.querySelector('#catalogCollectionSelect')?.value;
    if (!collectionId) return;
    const meta = parallelMetaFor(collectionId);
    if (!meta) return;

    const anchor = state.view === 'catalog-detail'
      ? document.querySelector('.catalog-detail-card')
      : document.querySelector('#parallel')?.closest('.field');
    if (!anchor || document.querySelector('.set-meta-helper')) return;

    const box = document.createElement('section');
    box.className = state.view === 'catalog-detail' ? 'card set-meta-helper' : 'field wide set-meta-helper';
    box.innerHTML = `<div class="eyebrow">ESTRUCTURA DEL SET</div>${meta.parallels?.length ? `<div class="muted tiny" style="margin:7px 0 6px">Paralelos</div><div class="filters set-parallel-chips">${meta.parallels.map(p => `<button type="button" class="chip" data-set-parallel="${esc(p)}">${esc(p)}</button>`).join('')}</div>` : ''}${meta.inserts?.length ? `<div class="muted tiny" style="margin-top:10px">Inserts: ${meta.inserts.map(esc).join(' · ')}</div>` : ''}`;

    if (state.view === 'catalog-detail') anchor.insertAdjacentElement('afterend', box);
    else anchor.insertAdjacentElement('afterend', box);

    box.querySelectorAll('[data-set-parallel]').forEach(btn => {
      btn.addEventListener('click', () => {
        const field = document.querySelector('#parallel');
        if (!field) return;
        field.value = btn.dataset.setParallel || '';
        field.dispatchEvent(new Event('input', { bubbles: true }));
        box.querySelectorAll('[data-set-parallel]').forEach(x => x.classList.toggle('active', x === btn));
      });
    });
  }

  const previousRender = render;
  render = function() {
    previousRender();
    patchCatalogLabels();
    patchCardOptions();
    injectSetMetadata();
  };

  render();
})();
