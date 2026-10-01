(() => {
  const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const esc2 = value => typeof esc === 'function' ? esc(String(value ?? '')) : String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function catalogEntries() {
    const collections = CATALOG?.collections || [];
    const checklists = CATALOG?.checklists || {};
    const entries = [];
    collections.forEach(collection => {
      (checklists[collection.id] || []).forEach((row, index) => {
        const [number, player, team, flags, subset] = row || [];
        const meta = window.CS_SET_META?.[collection.id] || {};
        const flagText = Array.isArray(flags) ? flags.join(' ') : (flags || '');
        const haystack = norm([player, team, number, subset, flagText, collection.name, collection.year, collection.manufacturer, collection.sport].join(' '));
        entries.push({ collection, row, index, number, player, team, flags, subset, meta, haystack });
      });
    });
    return entries;
  }

  function score(entry, q) {
    const player = norm(entry.player), number = norm(entry.number), subset = norm(entry.subset), team = norm(entry.team);
    if (player === q || number === q) return 100;
    if (player.startsWith(q)) return 90;
    if (number.startsWith(q)) return 85;
    if (subset.startsWith(q)) return 75;
    if (team.startsWith(q)) return 65;
    if (entry.haystack.includes(q)) return 50;
    return 0;
  }

  function findMatches(query, limit = 12) {
    const q = norm(query);
    if (q.length < 2) return [];
    return catalogEntries().map(entry => ({ entry, score: score(entry, q) })).filter(x => x.score > 0).sort((a,b) => b.score - a.score || String(a.entry.player).localeCompare(String(b.entry.player))).slice(0, limit).map(x => x.entry);
  }

  function selectEntry(entry) {
    const collectionSelect = document.querySelector('#catalogCollectionSelect');
    if (collectionSelect) {
      collectionSelect.value = entry.collection.id;
      collectionSelect.dispatchEvent(new Event('change', { bubbles:true }));
    }
    requestAnimationFrame(() => {
      const cardSelect = document.querySelector('#catalogCardSelect');
      if (cardSelect) {
        cardSelect.selectedIndex = entry.index + 1;
        cardSelect.dispatchEvent(new Event('change', { bubbles:true }));
      }
      const player = document.querySelector('#player'); if (player) player.value = entry.player || '';
      const number = document.querySelector('#cardNumber'); if (number) number.value = entry.number || '';
      const team = document.querySelector('#team'); if (team) team.value = entry.team || '';
      const search = document.querySelector('#csLiveCatalogSearch'); if (search) search.value = entry.player || entry.number || '';
      const results = document.querySelector('#csLiveCatalogResults'); if (results) results.innerHTML = '';
    });
  }

  function injectAutocomplete() {
    if (document.querySelector('#csLiveCatalogSearch')) return;
    const collectionSelect = document.querySelector('#catalogCollectionSelect');
    const playerField = document.querySelector('#player')?.closest('.field');
    const anchor = collectionSelect?.closest('.field') || playerField;
    if (!anchor) return;
    const wrap = document.createElement('div');
    wrap.className = 'field wide cs-live-search';
    wrap.innerHTML = `<label for="csLiveCatalogSearch">Buscar carta en el catálogo</label><input id="csLiveCatalogSearch" autocomplete="off" placeholder="Ej. Lamin, Nussmeier, 91TR-3, Blue…"><div id="csLiveCatalogResults" class="cs-live-results"></div>`;
    anchor.insertAdjacentElement('beforebegin', wrap);
    const input = wrap.querySelector('#csLiveCatalogSearch');
    const results = wrap.querySelector('#csLiveCatalogResults');
    input.addEventListener('input', () => {
      const matches = findMatches(input.value);
      if (!matches.length) { results.innerHTML = norm(input.value).length >= 2 ? '<div class="cs-live-empty">Sin coincidencias verificadas en el catálogo actual.</div>' : ''; return; }
      results.innerHTML = matches.map((entry, i) => {
        const flags = Array.isArray(entry.flags) ? entry.flags.join(' · ') : (entry.flags || '');
        const kind = entry.subset || flags || 'Base';
        return `<button type="button" class="cs-live-result" data-cs-result="${i}"><strong>${esc2(entry.player || 'Carta')}</strong><span>${esc2(kind)} · ${esc2(entry.collection.name)}${entry.number ? ` · #${esc2(entry.number)}` : ''}</span>${entry.team ? `<small>${esc2(entry.team)}</small>` : ''}</button>`;
      }).join('');
      results.querySelectorAll('[data-cs-result]').forEach((button, i) => button.addEventListener('click', () => selectEntry(matches[i])));
    });
  }

  const previousRenderV10 = render;
  render = function() { previousRenderV10(); injectAutocomplete(); };
  render();
})();
