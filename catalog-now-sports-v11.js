(() => {
  const catalog = window.CS_CATALOG;
  if (!catalog) return;
  catalog.checklists = catalog.checklists || {};

  const ensure = c => {
    const existing = catalog.collections.find(x => x.id === c.id);
    if (existing) Object.assign(existing,c);
    else catalog.collections.push(c);
    catalog.checklists[c.id] = catalog.checklists[c.id] || [];
  };
  const addRows = (id, rows) => {
    const list = catalog.checklists[id] = catalog.checklists[id] || [];
    const seen = new Set(list.map(r => JSON.stringify([r?.[0],r?.[1],r?.[4]])));
    for (const r of rows) {
      const k=JSON.stringify([r?.[0],r?.[1],r?.[4]]);
      if(!seen.has(k)){ list.push(r); seen.add(k); }
    }
  };

  // Normalize every NOW collection to its real sport/family.
  for (const c of catalog.collections) {
    if (!/NOW/i.test(`${c.name||''} ${c.shortName||''} ${c.id||''}`)) continue;
    c.family = 'Topps NOW';
    if (/wbc|mlb/i.test(c.id)) c.sport='MLB';
    else if (/nfl/i.test(c.id)) c.sport='NFL';
    else if (/nba/i.test(c.id)) c.sport='NBA';
    else if (/formula|\bf1\b/i.test(`${c.id} ${c.name}`)) c.sport='F1';
    else if (/ufc/i.test(c.id)) c.sport='UFC';
    else if (/tennis/i.test(c.id)) c.sport='Tennis';
    else if (/wwe/i.test(c.id)) c.sport='WWE';
    else c.sport='Soccer';
  }

  // Ensure the families that were missing entirely from the app.
  ensure({id:'topps-now-nba-2026-27',sport:'NBA',manufacturer:'Topps',year:'2026/27',name:'NBA Topps NOW 2026/27',shortName:'NBA Topps NOW 26/27',family:'Topps NOW',sourceUrl:'https://www.topps.com/collections/nba-topps-now',coverage:'verified-partial'});
  addRows('topps-now-nba-2026-27',[
    ['NAM2','Nate Ament','Milwaukee Bucks',0,'Base','now'],
    ['OS03','LeBron James','Philadelphia 76ers',0,'Base','now']
  ]);

  ensure({id:'topps-now-nba-2025-26',sport:'NBA',manufacturer:'Topps',year:'2025/26',name:'NBA Topps NOW 2025/26',shortName:'NBA Topps NOW 25/26',family:'Topps NOW',sourceUrl:'https://www.topps.com/collections/nba-topps-now',coverage:'verified-partial'});
  addRows('topps-now-nba-2025-26',[
    ['336','OG Anunoby','New York Knicks',0,'Base','now']
  ]);

  ensure({id:'topps-now-wwe-2026',sport:'WWE',manufacturer:'Topps',year:'2026',name:'WWE Topps NOW 2026',shortName:'WWE Topps NOW 2026',family:'Topps NOW',sourceUrl:'https://www.topps.com/collections/wwe-topps-now',coverage:'verified-partial'});
  addRows('topps-now-wwe-2026',[
    ['102','La Parka / Mr. Iguana / Adelicious / Mascarita Sagrada','WWE',0,'Base','now'],
    ['103','Lucha Brothers','WWE',0,'Base','now'],
    ['104','CM Punk / Rey Mysterio / El Grande Americano','WWE',0,'Base','now']
  ]);

  // Existing families: force correct sport even if their original file used generic names.
  const fixed = {
    'topps-now-mlb-2026':'MLB','topps-now-wbc-2026':'MLB','topps-now-nfl-2026':'NFL',
    'topps-now-f1-2026':'F1','topps-now-ufc-2026':'UFC','topps-now-tennis-2026':'Tennis',
    'topps-now-mls-2026':'Soccer','topps-now-fc-barcelona-2026-27':'Soccer','topps-now-argentina-2026':'Soccer'
  };
  for(const [id,sport] of Object.entries(fixed)){
    const c=catalog.collections.find(x=>x.id===id);
    if(c){c.sport=sport;c.family='Topps NOW';}
  }
})();
