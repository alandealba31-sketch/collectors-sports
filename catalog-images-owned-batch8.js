// Frentes promocionales Topps revisados visualmente. Referencias por entrada; no se presentan como escaneos exactos.
(() => {
  if (!window.CS_IMAGE_CATALOG) return;
  const id = 'topps-chrome-football-2025';
  const page = 'https://www.checklistcenter.com/2025-topps-chrome-football-card-checklist/';
  const root = 'https://www.checklistcenter.com/wp-content/uploads/2026/04/';
  const rows = [
    ['BA-DMA','Base Cards Autograph Variation|Drake Maye',0,'Red Refractor /5','Drake Maye','2025-Topps-Chrome-Football-Base-Auto-Red-Refractor-Drake-Maye-MOCK-UP.jpeg'],
    [401,'Base Cards Image Variation|Tom Brady',1,'SuperFractor 1/1','Tom Brady','2025-Topps-Chrome-Football-Base-Image-Variations-SuperFractor-Tom-Brady-MOCK-UP.jpg'],
    ['RA-AJ','Base Cards Autograph Variation|Ashton Jeanty',2,'Black Refractor /10','Ashton Jeanty','2025-Topps-Chrome-Football-Base-Rookie-Auto-Black-Refractor-Ashton-Jeanty-MOCK-UP.jpg'],
    [314,'Rookies|Cam Ward',3,'Base','Cam Ward','2025-Topps-Chrome-Football-Base-Rookies-Cam-Ward-MOCK-UP.jpeg'],
    ['CG-AJ','Chromographs|Ashton Jeanty',4,'Promoción','Ashton Jeanty','2025-Topps-Chrome-Football-Chromographs-Ashton-Jeanty-MOCK-UP.jpeg'],
    ['DA-AK','Dual Autographs|Josh Allen / Jim Kelly',5,'Promoción','Josh Allen / Jim Kelly','2025-Topps-Chrome-Football-Dual-Auto-Josh-Allen-Jim-Kelly-MOCK-UP.jpg'],
    ['FF-13','Fanatical|Joe Burrow',6,'Promoción','Joe Burrow','2025-Topps-Chrome-Football-Fanatical-Joe-Burrow-MOCK-UP.jpeg'],
    ['F15-6','Fortune 15|Patrick Mahomes II',7,'SuperFractor 1/1','Patrick Mahomes II','2025-Topps-Chrome-Football-Fortune-15-Patrick-Mahomes-MOCK-UP.jpg'],
    ['GG-1','Game Genies|Josh Allen',8,'Promoción','Josh Allen','2025-Topps-Chrome-Football-Game-Genies-Josh-Allen-MOCK-UP.jpeg'],
    ['HOCA-JE','Hall Of Chrome Autographs|John Elway',9,'Promoción','John Elway','2025-Topps-Chrome-Football-Hall-of-Chrome-Auto-John-Elway-MOCK-UP.jpg'],
    ['HX-7','Helix|CeeDee Lamb',10,'Promoción','CeeDee Lamb','2025-Topps-Chrome-Football-Helix-CeeDee-Lamb-MOCK-UP.jpg'],
    ['KAI-5','Kaiju|Caleb Williams',11,'Promoción','Caleb Williams','2025-Topps-Chrome-Football-Kaiju-Caleb-Williams-MOCK-UP.jpg'],
    ['LG-1','Lets Go|Cam Ward',12,'Promoción','Cam Ward','2025-Topps-Chrome-Football-Lets-Go-Cam-Ward-MOCK-UP.jpeg'],
    ['LL-8','Lightning Leaders|Jahmyr Gibbs',13,'Promoción','Jahmyr Gibbs','2025-Topps-Chrome-Football-Lightning-Legends-Jahmyr-Gibbs-MOCK-UP.jpg'],
    ['RR-16','Chrome Radiating Rookies|Luther Burden III',14,'Red /5','Luther Burden III','2025-Topps-Chrome-Football-Radiating-Rookies-Luther-Burden-III-MOCK-UP.jpeg'],
    ['RPA-JD','Topps Chrome Rookie Patch Autographs|Jaxson Dart',15,'SuperFractor 1/1','Jaxson Dart','2025-Topps-Chrome-Football-Rookie-Patch-Auto-SuperFractor-Jaxson-Dart-MOCK-UP.jpeg'],
    ['RR-EE','Topps Chrome Rookie Relics|Emeka Egbuka',16,'Red /5','Emeka Egbuka','2025-Topps-Chrome-Football-Rookie-Relics-Patch-Emeka-Egbuka-MOCK-UP.jpeg'],
    ['SE-30','Shadow Etch|George Kittle',17,'Promoción','George Kittle','2025-Topps-Chrome-Football-Shadow-Etch-George-Kittle-MOCK-UP.jpg'],
    ['TA-BJ','Tecmo Autographs|Bo Jackson',18,'Promoción','Bo Jackson','2025-Topps-Chrome-Football-Tecmo-Auto-Bo-Jackson-MOCK-UP.jpeg'],
    ['UV-20','Ultra Violet|Saquon Barkley',19,'SuperFractor 1/1','Saquon Barkley','2025-Topps-Chrome-Football-Ultra-Violet-SuperFractor-Saquon-Barkley-MOCK-UP.jpg']
  ];
  for (const [number,entryKey,file,variant,player,sourceFile] of rows) {
    window.CS_IMAGE_CATALOG.cards[`${id}|${number}|${entryKey}`] = {
      front: `./assets/cards/owned-batch8/${file}.jpg`,
      kind: 'reference',
      variant,
      source: 'Topps · Checklistcenter',
      sourcePage: page,
      sourceImageUrl: root + sourceFile,
      label: `${player} #${number} · ${variant} · Imagen promocional`,
      verifiedAt: '2026-10-02'
    };
  }
})();
