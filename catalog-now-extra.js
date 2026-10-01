// Additional individually verified Topps NOW records. Official Topps product pages only.
(() => {
  const catalog = window.CS_CATALOG;
  if (!catalog) return;
  const addRows = (id, rows) => {
    catalog.checklists[id] = catalog.checklists[id] || [];
    const seen = new Set(catalog.checklists[id].map(r => JSON.stringify(r)));
    rows.forEach(r => { const k=JSON.stringify(r); if(!seen.has(k)){ catalog.checklists[id].push(r); seen.add(k); } });
  };
  const standard50=(number,player,team,extras=[])=>[[number,player,team,0,'Base'],[`${number}-GOLD`,player,team,0,'Gold Foil /50'],[`${number}-ORANGE`,player,team,0,'Orange Foil /25'],[`${number}-BLACK`,player,team,0,'Black Foil /10'],[`${number}-RED`,player,team,0,'Red Foil /5'],[`${number}-FF`,player,team,0,'FoilFractor 1/1'],...extras];

  // Official MLB NOW pages active Sep 30-Oct 1, 2026.
  addRows('topps-now-mlb-2026',[
    ...standard50('736','Austin Riley','Atlanta Braves'),
    ...standard50('738','Cam Schlittler','New York Yankees',[
      ['738-AUTO10','Cam Schlittler','New York Yankees',['AUTO'],'Autograph Redemption /10'],
      ['738-AUTO5','Cam Schlittler','New York Yankees',['AUTO'],'Autograph Redemption /5'],
      ['738-AUTO1','Cam Schlittler','New York Yankees',['AUTO'],'Autograph Redemption 1/1']
    ]),
    ...standard50('739','Ben Rice','New York Yankees',[
      ['739-AR10','Ben Rice','New York Yankees',['AUTO','RELIC'],'Auto-Relic Redemption /10'],
      ['739-AR5','Ben Rice','New York Yankees',['AUTO','RELIC'],'Auto-Relic Redemption /5'],
      ['739-AR1','Ben Rice','New York Yankees',['AUTO','RELIC'],'Auto-Relic Redemption 1/1']
    ]),
    ...standard50('740','George Lombard Jr.','New York Yankees'),
    ...standard50('741','Fernando Tatis Jr. / Manny Machado','San Diego Padres',[
      ['741-SP','Fernando Tatis Jr. / Manny Machado','San Diego Padres',['SP'],'Image Variation Short Print']
    ])
  ]);

  // Official NFL NOW page active Sep 28-Oct 1, 2026.
  addRows('topps-now-nfl-2026',[
    ...standard50('36','Matthew Stafford','Los Angeles Rams')
  ]);

  // Official UFC NOW pages. Card-specific hits are represented explicitly rather than inferred.
  addRows('topps-now-ufc-2026',[
    ...standard50('9','Raul Rosas','UFC',[
      ['9-SP','Raul Rosas','UFC',['SP'],'UFC Artist Fight Poster Short Print'],
      ['9-REL10','Raul Rosas','UFC',['RELIC'],'Relic Redemption /10'],
      ['9-REL5','Raul Rosas','UFC',['RELIC'],'Relic Redemption /5'],
      ['9-REL1','Raul Rosas','UFC',['RELIC'],'Relic Redemption 1/1']
    ]),
    ['8-SP','Charles Oliveira','UFC',['SP'],'UFC Artist Fight Poster Short Print'],
    ['8-REL10','Charles Oliveira','UFC',['RELIC'],'Relic Redemption /10'],
    ['8-REL5','Charles Oliveira','UFC',['RELIC'],'Relic Redemption /5'],
    ['8-AR1','Charles Oliveira','UFC',['AUTO','RELIC'],'Auto-Relic Redemption 1/1']
  ]);

  window.CS_SET_META = window.CS_SET_META || {};
  const mlb = window.CS_SET_META['topps-now-mlb-2026'] || {};
  mlb.inserts = Array.from(new Set([...(mlb.inserts||[]),'Image Variation Short Print (card-specific)','Autograph /10, /5, 1/1 (card-specific)','Auto-Relic /10, /5, 1/1 (card-specific)']));
  mlb.verified = '2026-10-01';
  window.CS_SET_META['topps-now-mlb-2026'] = mlb;
  const nfl = window.CS_SET_META['topps-now-nfl-2026'] || {};
  nfl.verified = '2026-10-01';
  window.CS_SET_META['topps-now-nfl-2026'] = nfl;
  const ufc = window.CS_SET_META['topps-now-ufc-2026'] || {};
  ufc.inserts = Array.from(new Set([...(ufc.inserts||[]),'UFC Artist Fight Poster Short Print (card-specific)','Relic /10, /5, /1 (card-specific)','Auto-Relic 1/1 (card-specific)']));
  ufc.verified = '2026-10-01';
  window.CS_SET_META['topps-now-ufc-2026'] = ufc;
})();