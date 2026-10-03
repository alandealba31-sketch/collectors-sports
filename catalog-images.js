window.CS_IMAGE_CATALOG = {
  version: 4,
  updatedAt: '2026-10-03',
  policy: {
    exact: 'Frente de la identidad exacta del checklist, verificado visualmente. Es la unica imagen que cuenta para cobertura.',
    reference: 'Referencia visual del mismo sujeto o diseño; puede variar el paralelo, subset o acabado. No cuenta para cobertura.',
    collection: 'Imagen representativa de la colección; nunca se usa para identificar una carta específica.',
    back: 'El reverso es opcional y ya no forma parte del objetivo de cobertura.'
  },
  sourcePolicy: {
    rule: 'La fuente puede ser cualquier sitio publico o comercio, pero una coincidencia de texto o metadata no basta: la imagen debe verificarse visualmente antes de marcarse como exacta.',
    acceptedSources: ['Fabricante','Tienda especializada','eBay','Mercado Libre','Amazon','Red social','Foro','Marketplace','Sitio web publico'],
    exactMatchRequires: ['coleccion/producto y año','numero o codigo de carta','jugador o sujeto','subset o insert cuando aplique','paralelo/acabado cuando la identidad lo requiera','verificacion visual del frente'],
    note: 'Una foto de vendedor o usuario puede usarse; la procedencia no determina la cobertura. La coincidencia exacta y la verificacion visual sí.'
  },
  collections: {
    'topps-chrome-ucc-2025-26': {
      source: 'Topps',
      sourcePage: 'https://www.topps.com/pages/topps-chrome-uefa-club-competitions',
      cover: 'https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blta0b17c31d41d1a34/69cb915f868a29b049e5feb4/26TUCC_2103_FR_Orange.jpg',
      kind: 'collection',
      label: 'Vista oficial Topps Chrome UEFA 2025/26'
    },
    'topps-chrome-baseball-2026': {
      source: 'Topps',
      sourcePage: 'https://www.topps.com/pages/topps-chrome-baseball',
      cover: 'https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blt3d019dd78d80f17e/6a2aecd21c149a7893a45816/26TCBB_1006_FR.jpg',
      kind: 'collection',
      label: 'Vista oficial Topps Chrome Baseball 2026'
    },
    'topps-chrome-ufc-2026': {
      source: 'Topps',
      sourcePage: 'https://www.topps.com/pages/topps-chrome-ufc',
      cover: 'https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blt7efb10c579a308dc/69c6add6dfb8e01184dfa153/26UFCC_1217_FR.jpg',
      kind: 'collection',
      label: 'Vista oficial Topps Chrome UFC 2026'
    },
    'topps-chrome-f1-2026': {
      source: 'Topps',
      sourcePage: 'https://www.topps.com/pages/topps-chrome-formula-1',
      cover: 'https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blt442daec09dae5ecc/6a9e8a8632b5304f276d2948/1163_F1_CARS_ALONSO.jpg',
      kind: 'collection',
      label: 'Vista oficial Topps Chrome Formula 1 2026'
    }
  },
  cards: {
    'topps-chrome-ucc-2025-26|10': {
      front: 'https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/1783729743593-fc4ad5a7-6905-4f16-b251-4a005cd14e4a.jpg',
      kind: 'exact',
      exactVerified: true,
      source: 'HobbyScan',
      sourcePage: 'https://www.hobbyscan.com/card/809291',
      label: 'Lamine Yamal #10 — Base · frente exacto verificado'
    },
    'topps-chrome-baseball-2026|236': {
      front: 'https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/bltd78856a19967c61c/6a2aecd21c149a53f7a4581a/26TCBB_1215_FR_GreenRefractorParallel.jpg',
      kind: 'reference',
      source: 'Topps',
      sourcePage: 'https://www.topps.com/pages/topps-chrome-baseball',
      label: 'Nolan McLean #236 — referencia Green Refractor'
    },
    'topps-chrome-f1-2026|101': {
      front: 'https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blt442daec09dae5ecc/6a9e8a8632b5304f276d2948/1163_F1_CARS_ALONSO.jpg',
      kind: 'reference',
      source: 'Topps',
      sourcePage: 'https://www.topps.com/pages/topps-chrome-formula-1',
      label: 'Fernando Alonso — F1 Cars reference'
    },
    'topps-chrome-f1-2026|143': {
      front: 'https://images.topps.com/v3/assets/bltc7206971cb4b2bfc/blt7a94356e0a1e2b2a/6a9e8a8632b530a8186d2946/1228_GRAND_PRIX_DRIVER_OF_THE_DAY_HADJAR_FR.jpg',
      kind: 'reference',
      source: 'Topps',
      sourcePage: 'https://www.topps.com/pages/topps-chrome-formula-1',
      label: 'Isack Hadjar — Driver of the Day reference'
    }
  }
};