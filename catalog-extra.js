(() => {
  const catalog = window.CS_CATALOG;
  if (!catalog) return;
  const additions = [
    {
      id: 'topps-chrome-basketball-2025-26', sport: 'NBA', manufacturer: 'Topps', year: '2025/26',
      name: 'Topps Chrome Basketball 2025/26', shortName: 'Chrome Basketball 25/26',
      sourceUrl: 'https://www.topps.com/pages/topps-chrome-basketball', coverage: 'collection', baseCount: 299
    },
    {
      id: 'topps-chrome-updates-basketball-2025-26', sport: 'NBA', manufacturer: 'Topps', year: '2025/26',
      name: 'Topps Chrome Updates Basketball 2025/26', shortName: 'Chrome Updates Basketball 25/26',
      sourceUrl: 'https://www.topps.com/pages/topps-chrome-updates-basketball', coverage: 'collection', baseCount: 200
    },
    {
      id: 'topps-chrome-black-basketball-2025-26', sport: 'NBA', manufacturer: 'Topps', year: '2025/26',
      name: 'Topps Chrome Black Basketball 2025/26', shortName: 'Chrome Black Basketball 25/26',
      sourceUrl: 'https://www.topps.com/pages/topps-chrome-black-basketball', coverage: 'collection'
    }
  ];
  const existing = new Set(catalog.collections.map(c => c.id));
  additions.forEach(c => { if (!existing.has(c.id)) catalog.collections.push(c); });
})();
