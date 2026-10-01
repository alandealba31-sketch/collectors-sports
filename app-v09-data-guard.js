// Runtime integrity guard for imported manufacturer checklists.
// Keeps unverifiable placeholder rows out of search/browse without inventing replacements.
(() => {
  const catalog = window.CS_CATALOG;
  if (!catalog || !catalog.checklists) return;

  const PLACEHOLDERS = new Set(['tbd', 'unknown', 'n/a', 'na', 'unnamed', 'to be determined']);
  const isPlaceholder = value => PLACEHOLDERS.has(String(value ?? '').trim().toLowerCase());

  let removed = 0;
  Object.entries(catalog.checklists).forEach(([id, rows]) => {
    if (!Array.isArray(rows)) return;
    const clean = [];
    const seen = new Set();
    for (const row of rows) {
      if (!Array.isArray(row) || row.length < 2) continue;
      const number = row[0];
      const subject = String(row[1] ?? '').trim();
      if (!subject || isPlaceholder(subject)) {
        removed += 1;
        continue;
      }
      const key = String(number).trim().toLowerCase() + (row[7] ? '|' + row[7] : '');
      if (seen.has(key)) {
        removed += 1;
        continue;
      }
      seen.add(key);
      clean.push(row);
    }
    catalog.checklists[id] = clean;

    const collection = Array.isArray(catalog.collections)
      ? catalog.collections.find(item => item.id === id)
      : null;
    if (collection) {
      collection.checklistCount = clean.length;
      collection.baseCount = clean.every(row => row[5])
        ? clean.filter(row => row[5] === 'base' && (!row[6] || row[6] === 'Base')).length
        : Math.min(collection.baseCount ?? clean.length, clean.length);
      // A filtered source is useful, but must not be presented as complete.
      if (clean.length !== rows.length && ['base-complete', 'full-checklist'].includes(collection.coverage)) {
        collection.coverage = 'base-partial-verified';
      }
    }
  });

  if (removed) console.info(`[Collectors Sports] Removed ${removed} placeholder/duplicate checklist rows.`);
})();

