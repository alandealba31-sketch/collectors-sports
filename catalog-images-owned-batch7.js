// Visually reviewed Topps promotional fronts. Entry-scoped; no exact-scan claim.
(() => {
  if (!window.CS_IMAGE_CATALOG) return;
  const nbaId = 'topps-chrome-basketball-2025-26';
  const nflId = 'topps-resurgence-football-2025';
  const nbaPage = 'https://www.checklistcenter.com/2025-26-topps-chrome-basketball-card-checklist/';
  const nflPage = 'https://www.checklistcenter.com/2025-topps-resurgence-football-card-checklist/';
  const nbaImageRoot = 'https://www.checklistcenter.com/wp-content/uploads/2025/11/';
  const nflImageRoot = 'https://www.checklistcenter.com/wp-content/uploads/2026/07/';
  const rows = [
    [nbaId,'AC-12','Activators|Dylan Harper',0,'Black /10','Dylan Harper','Activators-Dylan-Harper-MOCK-UP.jpg'],
    [nbaId,'AD-1','Advisory|Cooper Flagg',1,'SuperFractor 1/1','Cooper Flagg','Advisory-SuperFractor-Cooper-Flag-MOCK-UP.jpg'],
    [nbaId,'TAU-SC','Topps Autograph Issue|Stephen Curry',2,'SuperFractor 1/1','Stephen Curry','Auto-Issue-Veterans-SuperFractor-Stephan-Curry-MOCK-UP.jpg'],
    [nbaId,25,'Base Cards|Nikola Jokić',3,'FrozenFractor /-5','Nikola Jokić','Base-FrozenFractor-Nikola-Jokic-MOCK-UP.jpg'],
    [nbaId,'TCA-AI','Topps Chrome Autographs|Allen Iverson',4,'Promoción','Allen Iverson','Chrome-Auto-Allen-Iverson-MOCK-UP.jpg'],
    [nbaId,'CG-9','Clutch Gene|Shai Gilgeous-Alexander',5,'Black /10','Shai Gilgeous-Alexander','Clutch-Gene-Shai-Gilgeous-Alexander-MOCK-UP.jpg'],
    [nbaId,'FAN-5','Fanatical|LaMelo Ball',6,'Red /5','LaMelo Ball','Fanatical-LaMelo-Ball-MOCK-UP.jpg'],
    [nbaId,'FIN-1','Finals|LeBron James',7,'Promoción','LeBron James','Finals-LeBron-James-MOCK-UP.jpg'],
    [nbaId,'FS-CF','Future Stars Autographs|Cooper Flagg',8,'Gold /50','Cooper Flagg','Future-Stars-Auto-Cooper-Flagg-MOCK-UP.jpg'],
    [nbaId,'H-1','Helix|LeBron James',9,'Promoción','LeBron James','Helix-LeBron-James-MOCK-UP.jpg'],
    [nbaId,'NS-DH','Next Stop Signatures|Dylan Harper',10,'Promoción','Dylan Harper','Next-Stop-Signatures-Dylan-Harper-MOCK-UP.jpg'],
    [nbaId,'RS-10','Rock Stars|Ja Morant',11,'Promoción','Ja Morant','Rock-Stars-Ja-Morant-MOCK-UP.jpg'],
    [nbaId,'SWS-VW','Sky Write Signatures|Victor Wembanyama',12,'/10 visible','Victor Wembanyama','Sky-Write-Signatures-Victor-Wembanyama-MOCK-UP.jpg'],
    [nbaId,'SM-CA','Stratospheric Signatures|Carmelo Anthony',13,'/10 visible','Carmelo Anthony','Stratospheric-Signatures-Carmelo-Anthony-MOCK-UP.jpg'],
    [nbaId,'TT-4','Tall Tales|Victor Wembanyama',14,'/50 visible','Victor Wembanyama','Tall-Tales-Victor-Wembanyama-MOCK-UP.jpg'],
    [nbaId,'UV-4','Ultra Violet|Jalen Brunson',15,'Promoción','Jalen Brunson','Ultra-Violet-All-Stars-Jalen-Brunson-MOCK-UP.jpg'],
    [nflId,'AU-EE','Amped Up Rookie Relic Autographs|Emeka Egbuka',16,'Promoción','Emeka Egbuka','2025-Topps-Resurgence-Football-Amped-Up-Rookie-Relic-Auto-Emeka-Egbuka-MOCK-UP.jpeg'],
    [nflId,'AFA-RG','Arc Flash Autographs|Rob Gronkowski',17,'Red Power Surge /5','Rob Gronkowski','2025-Topps-Resurgence-Football-Arc-Flash-Auto-Red-Power-Surge-Rob-Gronkowski-MOCK-UP.jpeg'],
    [nflId,54,'Base|Justin Herbert',18,'Black Static /2','Justin Herbert','2025-Topps-Resurgence-Football-Base-Black-Static-Refractor-Justin-Herbert-MOCK-UP.jpeg'],
    [nflId,167,'Rookie Signatures|Jaxson Dart',19,'SuperFractor 1/1','Jaxson Dart','2025-Topps-Resurgence-Football-Base-Rookie-Signatures-SuperFractor-Jaxson-Dart-MOCK-UP.jpg'],
    [nflId,163,'Rookies|Tyler Shough',20,'SuperFractor 1/1','Tyler Shough','2025-Topps-Resurgence-Football-Base-Rookie-SuperFraactor-Tyler-Shough-MOCK-UP.jpg'],
    [nflId,24,'Base Signatures|Dak Prescott',21,'Red Static /5','Dak Prescott','2025-Topps-Resurgence-Football-Base-Signatures-Red-Static-Dak-Prescott-MOCK-UP.jpg'],
    [nflId,'EL-14','Electro Lights|Justin Jefferson',22,'Promoción','Justin Jefferson','2025-Topps-Resurgence-Football-Electro-Lights-Justin-Jefferson-MOCK-UP.jpg'],
    [nflId,'MM-MF','Molecular Marks|Marshall Faulk',23,'Gold Power Surge /50','Marshall Faulk','2025-Topps-Resurgence-Football-Molecular-Marks-Gold-Power-Surge-Marshall-Faulk-MOCK-UP.jpeg'],
    [nflId,'NI-TS','Neon Initiates|Tyler Shough',24,'Green Ink /50','Tyler Shough','2025-Topps-Resurgence-Football-Neon-Initiates-Green-Ink-Tyler-Shough-MOCK-UP.jpeg'],
    [nflId,'P-3','Perfect Fits|Shedeur Sanders',25,'Promoción','Shedeur Sanders','2025-Topps-Resurgence-Football-Perfect-Fits-Shedeur-Sanders-MOCK-UP.jpg'],
    [nflId,'RRA-CS','Radial Rookie Relics|Cam Skattebo',26,'Gold Power Surge /50','Cam Skattebo','2025-Topps-Resurgence-Football-Radial-Rookie-Relic-Auto-Gold-Power-Surge-Cam-Skattebo-MOCK-UP.jpg'],
    [nflId,'RRS-CW','Resurgence Rookie Relic Signatures|Cam Ward',27,'Pink Power Surge /10','Cam Ward','2025-Topps-Resurgence-Football-Resurgence-Rookie-Relic-Signatures-Pink-Power-Surge-Cam-Ward-MOCK-UP.jpg'],
    [nflId,'ST-10','String Theory|Patrick Mahomes II',28,'Promoción','Patrick Mahomes II','2025-Topps-Resurgence-Football-String-Theory-Patrick-Mahomes-MOCK-UP.jpeg'],
    [nflId,'TRI-BS','Thermal Red Ink Autographs|Barry Sanders',29,'Red Power Surge /5','Barry Sanders','2025-Topps-Resurgence-Football-Thermal-Red-Ink-Auto-Barry-Sanders-MOCK-UP.jpeg'],
    [nflId,'W-6','Wired|Caleb Williams',30,'Promoción','Caleb Williams','2025-Topps-Resurgence-Football-Wired-Caleb-Williams-MOCK-UP.jpeg']
  ];
  for (const [id,number,entryKey,file,variant,player,sourceFile] of rows) {
    const nba = id === nbaId;
    window.CS_IMAGE_CATALOG.cards[`${id}|${number}|${entryKey}`] = {
      front: `./assets/cards/owned-batch7/${file}.jpg`,
      kind: 'reference',
      variant,
      source: 'Topps · Checklistcenter',
      sourcePage: nba ? nbaPage : nflPage,
      sourceImageUrl: (nba ? nbaImageRoot : nflImageRoot) + sourceFile,
      label: `${player} #${number} · ${variant} · Imagen promocional`,
      verifiedAt: '2026-10-01'
    };
  }
})();
