(() => {
  const catalog = window.CS_CATALOG;
  if (!catalog) return;
  const additions = [
    {
      id: 'topps-flagship-football-2026', sport: 'NFL', manufacturer: 'Topps', year: '2026',
      name: 'Topps Flagship Football 2026', shortName: 'Flagship Football 2026',
      sourceUrl: 'https://www.topps.com/pages/topps-flagship-football',
      checklistUrl: 'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/CheckList_26TFOB_VERSION5_1.pdf?v=1787977209',
      coverage: 'collection', baseCount: 400
    },
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
    },
    {
      id: 'topps-chrome-f1-2026', sport: 'F1', manufacturer: 'Topps', year: '2026',
      name: 'Topps Chrome Formula 1 2026', shortName: 'Chrome F1 2026',
      sourceUrl: 'https://www.topps.com/pages/topps-chrome-formula-1', coverage: 'collection', baseCount: 200
    },
    {
      id: 'bowman-chrome-baseball-2026', sport: 'MLB', manufacturer: 'Topps', year: '2026',
      name: 'Bowman Chrome Baseball 2026', shortName: 'Bowman Chrome Baseball 2026',
      sourceUrl: 'https://www.topps.com/pages/bowman-chrome-baseball', coverage: 'collection', baseCount: 100
    },
    {
      id: 'topps-chrome-wwe-2026', sport: 'WWE', manufacturer: 'Topps', year: '2026',
      name: 'Topps Chrome WWE 2026', shortName: 'Chrome WWE 2026',
      sourceUrl: 'https://www.topps.com/pages/wwe-chrome', coverage: 'collection', baseCount: 200
    },
    {
      id: 'topps-chrome-tennis-2026', sport: 'Tennis', manufacturer: 'Topps', year: '2026',
      name: 'Topps Chrome Tennis 2026', shortName: 'Chrome Tennis 2026',
      sourceUrl: 'https://www.topps.com/pages/topps-chrome-tennis', coverage: 'collection', baseCount: 300
    },
    {
      id: 'panini-prizm-premier-league-2024-25', sport: 'Soccer', manufacturer: 'Panini', year: '2024/25',
      name: 'Panini Prizm Premier League Soccer 2024/25', shortName: 'Prizm Premier League 24/25',
      sourceUrl: 'https://blog.paniniamerica.net/spin-the-color-wheel-inside-2024-25-panini-prizm-premier-league-soccer/', coverage: 'collection'
    },
    {
      id: 'panini-select-fifa-2024-25', sport: 'Soccer', manufacturer: 'Panini', year: '2024/25',
      name: 'Panini Select FIFA Soccer 2024/25', shortName: 'Select FIFA 24/25',
      sourceUrl: 'https://blog.paniniamerica.net/embrace-the-moment-with-2024-25-panini-select-fifa-soccer/', coverage: 'collection'
    },
    {
      id: 'panini-select-serie-a-2024-25', sport: 'Soccer', manufacturer: 'Panini', year: '2024/25',
      name: 'Panini Select Serie A Soccer 2024/25', shortName: 'Select Serie A 24/25',
      sourceUrl: 'https://www.paniniamerica.net/2024-25-panini-select-serie-a-trading-card-box-hobby.html', coverage: 'collection', baseCount: 250
    },
    {
      id: 'panini-select-basketball-2024-25', sport: 'NBA', manufacturer: 'Panini', year: '2024/25',
      name: 'Panini Select Basketball 2024/25', shortName: 'Select Basketball 24/25',
      sourceUrl: 'https://blog.paniniamerica.net/parity-is-king-in-2024-25-panini-select-basketball/', coverage: 'collection'
    },
    {
      id: 'panini-prizm-basketball-2024-25', sport: 'NBA', manufacturer: 'Panini', year: '2024/25',
      name: 'Panini Prizm Basketball 2024/25', shortName: 'Prizm Basketball 24/25',
      sourceUrl: 'https://blog.paniniamerica.net/2024-25-prizm-basketball-drives-to-the-panini-blockchain/', coverage: 'collection'
    },
    {
      id: 'panini-donruss-optic-football-2025', sport: 'NFL', manufacturer: 'Panini', year: '2025',
      name: 'Panini Donruss Optic Football 2025', shortName: 'Donruss Optic NFL 2025',
      sourceUrl: 'https://blog.paniniamerica.net/2025-donruss-optic-nfl-adds-to-thrilling-championship-chase/', coverage: 'collection'
    }
  ];
  const existing = new Set(catalog.collections.map(c => c.id));
  additions.forEach(c => { if (!existing.has(c.id)) catalog.collections.push(c); });
})();