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

  // Official page active Sep 30-Oct 1, 2026; SKU ARTBB-16C2S-26TN-0740.
  addRows('topps-now-mlb-2026',[
    ...standard50('740','George Lombard Jr.','New York Yankees')
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
  const ufc = window.CS_SET_META['topps-now-ufc-2026'] || {};
  ufc.inserts = Array.from(new Set([...(ufc.inserts||[]),'UFC Artist Fight Poster Short Print (card-specific)','Relic /10, /5, /1 (card-specific)','Auto-Relic 1/1 (card-specific)']));
  ufc.verified = '2026-10-01';
  window.CS_SET_META['topps-now-ufc-2026'] = ufc;
})();