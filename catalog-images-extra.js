(() => {
  const root = window.CS_IMAGE_CATALOG = window.CS_IMAGE_CATALOG || {collections:{},cards:{}};
  root.cards = root.cards || {};

  Object.assign(root.cards, {
    'topps-chrome-ucc-2025-26|64': {
      front: 'https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/1779815066461-15e8cea2-5554-43bb-88cb-155fd48f8d68.jpg',
      kind: 'reference',
      source: 'HobbyScan',
      sourcePage: 'https://www.hobbyscan.com/card/730761',
      label: 'Jude Bellingham #64 — Refractor; referencia del diseño'
    },
    'topps-chrome-ucc-2025-26|112': {
      front: 'https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/1782503695301-a7610d5c-197f-4c64-9287-adbc5aca9153.jpg',
      kind: 'exact',
      source: 'HobbyScan',
      sourcePage: 'https://www.hobbyscan.com/card/788140',
      label: 'Kylian Mbappé #112 — Base'
    },
    'topps-chrome-ucc-2025-26|136': {
      front: 'https://hobbyscan-images-prod.s3.us-east-2.amazonaws.com/scans/1782049903921-ef04f922-859a-43a6-948b-4803cc202704.jpg',
      kind: 'exact',
      source: 'HobbyScan',
      sourcePage: 'https://www.hobbyscan.com/card/779182',
      label: 'Mohamed Salah #136 — Base Set'
    }
  });
})();
