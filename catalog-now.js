// Verified Topps NOW records. Add only cards/variants confirmed on official Topps product pages.
(() => {
  const catalog = window.CS_CATALOG;
  if (!catalog) return;
  const addCollection = c => { if (!catalog.collections.some(x => x.id === c.id)) catalog.collections.push(c); };
  const addRows = (id, rows) => {
    catalog.checklists[id] = catalog.checklists[id] || [];
    const seen = new Set(catalog.checklists[id].map(r => JSON.stringify(r)));
    rows.forEach(r => { const k=JSON.stringify(r); if(!seen.has(k)){catalog.checklists[id].push(r);seen.add(k);} });
  };
  const standard50 = (number, player, team, extras=[]) => [
    [number,player,team,0,'Base'],
    [`${number}-GOLD`,player,team,0,'Gold Foil /50'],
    [`${number}-ORANGE`,player,team,0,'Orange Foil /25'],
    [`${number}-BLACK`,player,team,0,'Black Foil /10'],
    [`${number}-RED`,player,team,0,'Red Foil /5'],
    [`${number}-FF`,player,team,0,'FoilFractor 1/1'],
    ...extras
  ];

  addCollection({id:'topps-now-fc-barcelona-2026-27',sport:'Soccer',manufacturer:'Topps',year:'2026/27',name:'FC Barcelona Topps NOW 2026/27',shortName:'Barcelona Topps NOW 26/27',sourceUrl:'https://www.topps.com/products/lamine-yamal-2026-27-fc-barcelona-topps-now%C2%AE-card-2',checklistUrl:'https://www.topps.com/collections/topps-now-archive',coverage:'verified-partial'});
  addRows('topps-now-fc-barcelona-2026-27', [
    ['2','Lamine Yamal','FC Barcelona',0,'Base'],['2-GREEN','Lamine Yamal','FC Barcelona',0,'Green Foil /99'],['2-GOLD','Lamine Yamal','FC Barcelona',0,'Gold Foil /50'],['2-ORANGE','Lamine Yamal','FC Barcelona',0,'Orange Foil /25'],['2-BLACK','Lamine Yamal','FC Barcelona',0,'Black Foil /10'],['2-RED','Lamine Yamal','FC Barcelona',0,'Red Foil /5'],['2-FF','Lamine Yamal','FC Barcelona',0,'FoilFractor 1/1'],['2-AUTO','Lamine Yamal','FC Barcelona',['AUTO'],'Autograph 1/1']
  ]);

  addCollection({id:'topps-now-argentina-2026',sport:'Soccer',manufacturer:'Topps',year:'2026',name:'Argentina Topps NOW 2026',shortName:'Argentina Topps NOW 2026',sourceUrl:'https://www.topps.com/products/lionel-messi-2026-argentina-topps-now%C2%AE-card-1',checklistUrl:'https://www.topps.com/collections/topps-now-archive',coverage:'verified-partial'});
  addRows('topps-now-argentina-2026', [
    ['1','Lionel Messi','Argentina',0,'Base'],['1-GREEN','Lionel Messi','Argentina',0,'Green Foil /99'],['1-GOLD','Lionel Messi','Argentina',0,'Gold Foil /50'],['1-ORANGE','Lionel Messi','Argentina',0,'Orange Foil /25'],['1-BLACK','Lionel Messi','Argentina',0,'Black Foil /10'],['1-RED','Lionel Messi','Argentina',0,'Red Foil /5'],['1-FF','Lionel Messi','Argentina',0,'FoilFractor 1/1'],['1-AUTO5','Lionel Messi','Argentina',['AUTO'],'Autograph Redemption /5'],['1-AUTO1','Lionel Messi','Argentina',['AUTO'],'Autograph Redemption 1/1']
  ]);

  addCollection({id:'topps-now-mlb-2026',sport:'Baseball',manufacturer:'Topps',year:'2026',name:'MLB Topps NOW 2026',shortName:'MLB Topps NOW 2026',sourceUrl:'https://www.topps.com/collections/mlb-topps-now',checklistUrl:'https://www.topps.com/collections/topps-now-archive',coverage:'verified-partial'});
  addRows('topps-now-mlb-2026', [
    ...standard50('37','Shohei Ohtani','Los Angeles Dodgers'),
    ...standard50('65','Shohei Ohtani / Ichiro','Major League Baseball'),
    ...standard50('71','Shohei Ohtani','Los Angeles Dodgers'),
    ...standard50('80','Aaron Judge / Mike Trout','Major League Baseball'),
    ...standard50('157','Aaron Judge','New York Yankees'),
    ...standard50('212','Shohei Ohtani','Los Angeles Dodgers'),
    ...standard50('226','Shohei Ohtani','Los Angeles Dodgers', [['226-SP','Shohei Ohtani','Los Angeles Dodgers',['SP'],'Image Variation Short Print']]),
    ...standard50('236','Aaron Judge','New York Yankees', [['236-SP','Aaron Judge','New York Yankees',['SP'],'Image Variation Short Print']]),
    ...standard50('341','Shohei Ohtani','Los Angeles Dodgers')
  ]);

  addCollection({id:'topps-now-wbc-2026',sport:'Baseball',manufacturer:'Topps',year:'2026',name:'World Baseball Classic Topps NOW 2026',shortName:'WBC Topps NOW 2026',sourceUrl:'https://www.topps.com/collections/world-baseball-classic-topps-now',checklistUrl:'https://www.topps.com/collections/topps-now-archive',coverage:'verified-partial'});
  addRows('topps-now-wbc-2026', [
    ...standard50('W004','Shohei Ohtani','Team Japan'),
    ...standard50('W008','Aaron Judge','Team USA', [
      ['W008-REL10','Aaron Judge','Team USA',['RELIC'],'Relic Redemption /10'],
      ['W008-REL5','Aaron Judge','Team USA',['RELIC'],'Relic Redemption /5'],
      ['W008-AR1','Aaron Judge','Team USA',['AUTO','RELIC'],'Auto-Relic Redemption 1/1']
    ]),
    ...standard50('W036','Aaron Judge','Team USA')
  ]);

  window.CS_SET_META = window.CS_SET_META || {};
  window.CS_SET_META['topps-now-fc-barcelona-2026-27']={parallels:['Green Foil /99','Gold Foil /50','Orange Foil /25','Black Foil /10','Red Foil /5','FoilFractor 1/1'],inserts:['Autograph 1/1'],source:'Topps official product page',verified:'2026-10-01'};
  window.CS_SET_META['topps-now-argentina-2026']={parallels:['Green Foil /99','Gold Foil /50','Orange Foil /25','Black Foil /10','Red Foil /5','FoilFractor 1/1'],inserts:['Autograph Redemption /5','Autograph Redemption 1/1'],source:'Topps official product page',verified:'2026-10-01'};
  window.CS_SET_META['topps-now-mlb-2026']={parallels:['Gold Foil /50','Orange Foil /25','Black Foil /10','Red Foil /5','FoilFractor 1/1'],inserts:['Image Variation Short Print (card-specific)'],source:'Topps official product pages',verified:'2026-10-01',note:'Partial verified ingestion; cards are added only after individual official verification.'};
  window.CS_SET_META['topps-now-wbc-2026']={parallels:['Gold Foil /50','Orange Foil /25','Black Foil /10','Red Foil /5','FoilFractor 1/1'],inserts:['Relic /10','Relic /5','Auto-Relic 1/1 (card-specific)'],source:'Topps official product pages',verified:'2026-10-01',note:'Partial verified ingestion; cards are added only after individual official verification.'};
})();