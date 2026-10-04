(() => {
  const catalog = window.CS_CATALOG;
  if (!catalog) return;

  const obsoleteIds = new Set([
    'panini-prizm-road-to-world-cup-2025-26',
    'panini-select-laliga-2024-25',
    'topps-manchester-city-collector-tin-2026-27',
    'topps-manchester-united-collector-tin-2025-26',
    'topps-manchester-united-collector-tin-2026-27'
  ]);

  catalog.collections = (catalog.collections || []).filter(c => !obsoleteIds.has(c.id));
  catalog.checklists = catalog.checklists || {};
  for (const id of obsoleteIds) delete catalog.checklists[id];

  const cards = window.CS_IMAGE_CATALOG?.cards;
  if (cards) {
    for (const key of Object.keys(cards)) {
      if ([...obsoleteIds].some(id => key.startsWith(id + '|'))) delete cards[key];
    }
  }
})();
