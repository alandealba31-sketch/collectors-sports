(() => {
  const catalog = window.CS_CATALOG;
  if (!catalog) return;
  catalog.checklists = catalog.checklists || {};
  window.CS_SET_META = window.CS_SET_META || {};

  const sportMap = { Baseball:'MLB', Football:'NFL', 'Formula 1':'F1', Racing:'F1', Basketball:'NBA', Wrestling:'WWE' };
  catalog.collections.forEach(c => { if (sportMap[c.sport]) c.sport = sportMap[c.sport]; });

  const ensureCollection = data => {
    const found = catalog.collections.find(c => c.id === data.id);
    if (found) Object.assign(found, data);
    else catalog.collections.push(data);
  };
  const addRows = (id, rows) => {
    catalog.checklists[id] = catalog.checklists[id] || [];
    const key = r => JSON.stringify([r?.[0],r?.[1],r?.[4],r?.[7] || '']);
    const seen = new Set(catalog.checklists[id].map(key));
    rows.forEach(r => { const k=key(r); if(!seen.has(k)){ catalog.checklists[id].push(r); seen.add(k); } });
  };
  const rowsFrom = (text, subset='Base', category='base') => text.trim().split('\n').filter(Boolean).map(line => {
    const [number,player,team] = line.split('|');
    return [number,player,team,0,subset,category];
  });

  // --- 2026 Topps Chrome Tennis: complete parallel vocabulary for base search ---
  window.CS_SET_META['topps-chrome-tennis-2026'] = {
    parallels:[
      'Refractor','Prism Refractor','Negative Refractor','Yellow Refractor /275','Pink Refractor /250',
      'Aqua Refractor /199','Blue Refractor /150','Green Refractor /99','Purple Refractor /75',
      'Gold Refractor /50','Orange Refractor /25','Black Refractor /10','Red Refractor /5',
      'FrozenFractor -5/0','SuperFractor 1/1','Green Geometric Refractor /99','Purple Geometric Refractor /75',
      'Gold Geometric Refractor /50','Orange Geometric Refractor /25','Black Geometric Refractor /10',
      'Red Geometric Refractor /5','Purple RayWave Refractor /75','Gold RayWave Refractor /50',
      'Orange RayWave Refractor /25','Black RayWave Refractor /10'
    ],
    aliases:{
      'bajo cero':'FrozenFractor -5/0','below zero':'FrozenFractor -5/0','frozen':'FrozenFractor -5/0',
      'blanco y negro':'Negative Refractor','negative':'Negative Refractor','pink':'Pink Refractor /250',
      'amarillo':'Yellow Refractor /275','yellow':'Yellow Refractor /275','prizm':'Prism Refractor','prism':'Prism Refractor'
    },
    source:'Topps / published checklist and odds', verified:'2026-10-03'
  };

  // --- Topps NOW: Lazaro Montes cards missing from the partial NOW ingestion ---
  ensureCollection({id:'topps-now-mlb-2026',sport:'MLB',manufacturer:'Topps',year:'2026',name:'MLB Topps NOW 2026',shortName:'MLB Topps NOW 2026',sourceUrl:'https://www.topps.com/collections/mlb-topps-now',checklistUrl:'https://www.topps.com/collections/mlb-topps-now-archive',coverage:'verified-partial'});
  addRows('topps-now-mlb-2026',[
    ['624','Lazaro Montes','Seattle Mariners',['CALL UP'],'Call-Up · Multi-Hit MLB Debut Joins Ichiro in Club Lore','now'],
    ['624-GOLD','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'Gold Foil /50','parallel'],
    ['624-ORANGE','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'Orange Foil /25','parallel'],
    ['624-BLACK','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'Black Foil /10','parallel'],
    ['624-RED','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'Red Foil /5','parallel'],
    ['624-FF','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'FoilFractor 1/1','parallel'],
    ['624-REL10','Lazaro Montes','Seattle Mariners',['CALL UP','RELIC'],'Relic Redemption /10','relic'],
    ['624-REL5','Lazaro Montes','Seattle Mariners',['CALL UP','RELIC'],'Relic Redemption /5','relic'],
    ['624-REL1','Lazaro Montes','Seattle Mariners',['CALL UP','RELIC'],'Relic Redemption 1/1','relic'],
    ['650','Lazaro Montes','Seattle Mariners',['CALL UP'],'Call-Up · 474-Ft Shot Is Longest HR At T-Mobile Park','now'],
    ['650-GOLD','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL','OWNED 40/50'],'Gold Foil /50 · nuestra copia 40/50','parallel'],
    ['650-ORANGE','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'Orange Foil /25','parallel'],
    ['650-BLACK','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'Black Foil /10','parallel'],
    ['650-RED','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'Red Foil /5','parallel'],
    ['650-FF','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'FoilFractor 1/1','parallel'],
    ['688','Lazaro Montes','Seattle Mariners',['CALL UP'],'Call-Up · Go-Ahead Solo HR in 9th Frame Lands Mariners Win','now'],
    ['688-GOLD','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'Gold Foil /50','parallel'],
    ['688-ORANGE','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'Orange Foil /25','parallel'],
    ['688-BLACK','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'Black Foil /10','parallel'],
    ['688-RED','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'Red Foil /5','parallel'],
    ['688-FF','Lazaro Montes','Seattle Mariners',['CALL UP','PARALLEL'],'FoilFractor 1/1','parallel']
  ]);

  // --- 2025/26 Topps Real Madrid Team Set ---
  const rmId='topps-real-madrid-team-set-2025-26';
  ensureCollection({id:rmId,sport:'Soccer',manufacturer:'Topps',year:'2025/26',name:'Topps Real Madrid Team Set 2025/26',shortName:'Real Madrid Team Set 25/26',sourceUrl:'https://www.checklistinsider.com/2025-26-topps-real-madrid-team-set',coverage:'full-core-checklist',baseCount:50});
  addRows(rmId, rowsFrom(`
1|Thibaut Courtois|Real Madrid
2|Dani Carvajal|Real Madrid
3|Dean Huijsen|Real Madrid
4|Antonio Rüdiger|Real Madrid
5|Víctor Valdepeñas|Real Madrid
6|Trent Alexander-Arnold|Real Madrid
7|Álvaro Carreras|Real Madrid
8|Éder Militão|Real Madrid
9|Thiago Pitarch|Real Madrid
10|Jude Bellingham|Real Madrid
11|Eduardo Camavinga|Real Madrid
12|Federico Valverde|Real Madrid
13|Arda Güler|Real Madrid
14|Franco Mastantuono|Real Madrid
15|Aurélien Tchouaméni|Real Madrid
16|Vini Jr.|Real Madrid
17|Kylian Mbappé|Real Madrid
18|Endrick|Real Madrid
19|Gonzalo García|Real Madrid
20|Brahim Díaz|Real Madrid`, 'First Team','base'));
  addRows(rmId, rowsFrom(`21|Kaká|Real Madrid
22|Raúl|Real Madrid
23|Gareth Bale|Real Madrid
24|Joselu|Real Madrid
25|Vini Jr.|Real Madrid`, 'Bona Fide Baller','insert'));
  addRows(rmId, rowsFrom(`26|Franco Mastantuono|Real Madrid
27|Trent Alexander-Arnold|Real Madrid
28|Kylian Mbappé|Real Madrid
29|Rodrygo|Real Madrid
30|Ronaldo Nazário|Real Madrid
31|Endrick|Real Madrid
32|Ángel Di María|Real Madrid
33|Steve McManaman|Real Madrid
34|Federico Valverde|Real Madrid
35|Roberto Carlos|Real Madrid`, 'Pitch Pursuits','insert'));
  addRows(rmId, rowsFrom(`36|Luka Modrić|Real Madrid
37|Mesut Özil|Real Madrid
38|Arda Güler|Real Madrid
39|Toni Kroos|Real Madrid
40|Marco Asensio|Real Madrid`, "Collector's Corner",'insert'));
  addRows(rmId, rowsFrom(`41|Jude Bellingham|Real Madrid
42|Vicente del Bosque|Real Madrid
43|Xabi Alonso|Real Madrid
44|Pepe|Real Madrid
45|Guti|Real Madrid
46|Marcelo|Real Madrid
47|Luís Figo|Real Madrid
48|Iker Casillas|Real Madrid
49|Fabio Cannavaro|Real Madrid
50|Ronaldo Nazário|Real Madrid`, 'King Real','insert'));
  const rmAutos=`BC-AC|Álvaro Carreras|Real Madrid
BC-AS|Marco Asensio|Real Madrid
BC-AT|Aurélien Tchouaméni|Real Madrid
BC-BD|Brahim Díaz|Real Madrid
BC-CA|Casemiro|Real Madrid
BC-CM|Claude Makélélé|Real Madrid
BC-CS|Clarence Seedorf|Real Madrid
BC-DB|Vicente del Bosque|Real Madrid
BC-DC|Dani Ceballos|Real Madrid
BC-DH|Dean Huijsen|Real Madrid
BC-EC|Eduardo Camavinga|Real Madrid
BC-FM|Fernando Morientes|Real Madrid
BC-FR|Fernando Redondo|Real Madrid
BC-GU|Guti|Real Madrid
BC-IC|Iker Casillas|Real Madrid
BC-IS|Isco|Real Madrid
BC-JB|Jude Bellingham|Real Madrid
BC-JM|José Mourinho|Real Madrid
BC-LF|Luís Figo|Real Madrid
BC-MA|Franco Mastantuono|Real Madrid
BC-ME|Michael Essien|Real Madrid
BC-MO|Michael Owen|Real Madrid
BC-MS|Manolo Sanchís|Real Madrid
BC-NA|Nicolas Anelka|Real Madrid
BC-PP|Pepe|Real Madrid
BC-R9|Ronaldo Nazário|Real Madrid
BC-RV|Raphaël Varane|Real Madrid
BC-SA|Míchel Salgado|Real Madrid
BC-SK|Sami Khedira|Real Madrid
BC-SM|Steve McManaman|Real Madrid
BC-TC|Thibaut Courtois|Real Madrid
BC-VV|Rafael van der Vaart|Real Madrid
BC-WS|Wesley Sneijder|Real Madrid
BC-XA|Xabi Alonso|Real Madrid`;
  addRows(rmId, rowsFrom(rmAutos,'Base Autographs','autograph'));
  addRows(rmId, rowsFrom(`BB-AG|Arda Güler|Real Madrid
BB-DM|Ángel Di María|Real Madrid
BB-FV|Federico Valverde|Real Madrid
BB-GB|Gareth Bale|Real Madrid
BB-JO|Joselu|Real Madrid
BB-KK|Kaká|Real Madrid
BB-LM|Luka Modrić|Real Madrid
BB-MO|Mesut Özil|Real Madrid
BB-RA|Raúl|Real Madrid
BB-RC|Roberto Carlos|Real Madrid
BB-RD|Rodrygo|Real Madrid
BB-TK|Toni Kroos|Real Madrid
BB-VJ|Vini Jr.|Real Madrid`,'Bona Fide Baller Autographs','autograph'));
  addRows(rmId, rowsFrom(`RF-1|Trent Alexander-Arnold|Real Madrid
RF-2|Arda Güler|Real Madrid
RF-3|Franco Mastantuono|Real Madrid
RF-4|Vini Jr.|Real Madrid
RF-5|Kylian Mbappé|Real Madrid
RF-6|Endrick|Real Madrid
RF-7|Gonzalo García|Real Madrid
RF-8|Brahim Díaz|Real Madrid
RF-9|Rodrygo|Real Madrid
RF-10|Jude Bellingham|Real Madrid
RF-11|Raúl|Real Madrid
RF-12|Gareth Bale|Real Madrid
RF-13|Ángel Di María|Real Madrid
RF-14|Federico Valverde|Real Madrid
RF-15|Mesut Özil|Real Madrid
RF-16|Luís Figo|Real Madrid
RF-17|Isco|Real Madrid
RF-18|Kaká|Real Madrid
RF-19|Steve McManaman|Real Madrid
RF-20|Wesley Sneijder|Real Madrid
RF-21|Eduardo Camavinga|Real Madrid
RF-22|Marcelo|Real Madrid
RF-23|Guti|Real Madrid
RF-24|Ronaldo Nazário|Real Madrid
RF-25|Luka Modrić|Real Madrid`,'Rainbow Flick','insert'));
  window.CS_SET_META[rmId]={
    parallels:['Halo','Static Foil','Purple Rainbow Foil /250','Purple Icy Foil /250','Aqua Rainbow Foil /199','Aqua Icy Foil /199','Blue Rainbow Foil /150','Blue Icy Foil /150','Green Rainbow Foil /99','Green Icy Foil /99','Gold Rainbow Foil /50','Gold Icy Foil /50','Orange Rainbow Foil /25','Orange Icy Foil /25','Black Rainbow Foil /10','Black Icy Foil /10','Red Rainbow Foil /5','Red Icy Foil /5','Gold FoilFractor 1/1'],
    inserts:['Rainbow Flick'], source:'Checklist Insider / Topps checklist', verified:'2026-10-03'
  };

  // --- 2025/26 Panini Pitch Kings LaLiga ---
  const pkId='panini-pitch-kings-laliga-2025-26';
  ensureCollection({id:pkId,sport:'Soccer',manufacturer:'Panini',year:'2025/26',name:'2025-26 Panini Pitch Kings LaLiga Soccer',shortName:'Pitch Kings LaLiga 25/26',sourceUrl:'https://thecollectornation.com/releases/2025-26-panini-pitch-kings-soccer',coverage:'core-checklist-expanded',baseCount:100});
  addRows(pkId, rowsFrom(`1|Pedri|FC Barcelona
2|Lamine Yamal|FC Barcelona
3|Raphinha|FC Barcelona
4|Robert Lewandowski|FC Barcelona
5|Ferran Torres|FC Barcelona
6|Thibaut Courtois|Real Madrid
7|Vini Jr.|Real Madrid
8|Jude Bellingham|Real Madrid
9|Arda Guler|Real Madrid
10|Kylian Mbappe|Real Madrid
11|Pablo Barrios|Atletico de Madrid
12|Jan Oblak|Atletico de Madrid
13|David Hancko|Atletico de Madrid
14|Julian Alvarez|Atletico de Madrid
15|Antoine Griezmann|Atletico de Madrid
16|Oihan Sancet|Athletic Club
17|Nico Williams|Athletic Club
18|Mikel Jauregizar|Athletic Club
19|Dani Vivian|Athletic Club
20|Unai Simon|Athletic Club
21|Alberto Moleiro|Villarreal CF
22|Georges Mikautadze|Villarreal CF
23|Luiz Junior|Villarreal CF
24|Santiago Mourino|Villarreal CF
25|Carlos Macia|Villarreal CF
26|Pablo Garcia|Real Betis
27|Abde Ezzalzouli|Real Betis
28|Pablo Fornals|Real Betis
29|Antony|Real Betis
30|Cucho Hernandez|Real Betis
31|Oscar Mingueza|RC Celta
32|Jones El-Abdellaoui|RC Celta
33|Sergio Carreira|RC Celta
34|Borja Iglesias|RC Celta
35|Bryan Zaragoza|RC Celta
36|Andrei Ratiu|Rayo Vallecano
37|Alvaro Garcia|Rayo Vallecano
38|Jorge de Frutos|Rayo Vallecano
39|Jozhua Vertrouwd|Rayo Vallecano
40|Nobel Mendy|Rayo Vallecano
41|Sergio Herrera|CA Osasuna
42|Victor Munoz|CA Osasuna
43|Ante Budimir|CA Osasuna
44|Ruben Garcia|CA Osasuna
45|Jon Moncayola|CA Osasuna
46|Samu Costa|RCD Mallorca
47|Jan Virgili|RCD Mallorca
48|Mateo Joseph|RCD Mallorca
49|Vedat Muriqi|RCD Mallorca
50|Leo Roman|RCD Mallorca
51|Takefusa Kubo|Real Sociedad
52|Jon Gorrotxategi|Real Sociedad
53|Mikel Oyarzabal|Real Sociedad
54|Goncalo Guedes|Real Sociedad
55|Jon Martin|Real Sociedad
56|Hugo Duro|Valencia CF
57|Cesar Tarrega|Valencia CF
58|Diego Lopez|Valencia CF
59|Javi Guerra|Valencia CF
60|Pepelu|Valencia CF
61|Borja Mayoral|Getafe CF
62|Mauro Arambarri|Getafe CF
63|Adrian Liso|Getafe CF
64|Djene|Getafe CF
65|David Soria|Getafe CF
66|Pere Milla|RCD Espanyol
67|Pol Lozano|RCD Espanyol
68|Roberto Fernandez|RCD Espanyol
69|Tyrhys Dolan|RCD Espanyol
70|Carlos Romero|RCD Espanyol
71|Youssef Enriquez|D. Alaves
72|Lucas Boye|D. Alaves
73|Toni Martinez|D. Alaves
74|Jonny Otto|D. Alaves
75|Antonio Sivera|D. Alaves
76|Vitor Reis|Girona FC
77|Azzedine Ounahi|Girona FC
78|Viktor Tsygankov|Girona FC
79|Vladyslav Vanat|Girona FC
80|Joel Roca|Girona FC
81|Ruben Vargas|Sevilla FC
82|Juanlu Sanchez|Sevilla FC
83|Akor Adams|Sevilla FC
84|Odysseas Vlachodimos|Sevilla FC
85|Oso|Sevilla FC
86|Alvaro Rodriguez|Elche CF
87|Rafa Mir|Elche CF
88|David Affengruber|Elche CF
89|German Valera|Elche CF
90|Andre Silva|Elche CF
91|Carlos Alvarez|Levante UD
92|Ivan Romero|Levante UD
93|Karl Etta Eyong|Levante UD
94|Mathew Ryan|Levante UD
95|Manu Sanchez|Levante UD
96|Ilyas Chaira|Real Oviedo
97|Haissem Hassan|Real Oviedo
98|Alberto Reina|Real Oviedo
99|David Carmo|Real Oviedo
100|Leander Dendoncker|Real Oviedo`,'Base','base'));
  addRows(pkId, rowsFrom(`1|Robert Lewandowski|FC Barcelona
2|Antoine Griezmann|Atletico de Madrid
3|Santi Comesana|Villarreal CF
4|Marcos Alonso|RC Celta
5|Alejandro Catena|CA Osasuna
6|Mikel Oyarzabal|Real Sociedad
7|Juan Iglesias|Getafe CF
8|Jon Pacheco|D. Alaves
9|Lucien Agoume|Sevilla FC
10|Jeremy Toljan|Levante UD
11|Jude Bellingham|Real Madrid
12|Unai Simon|Athletic Club`,'Elegance','insert'));
  addRows(pkId, rowsFrom(`1|Vini Jr.|Real Madrid
2|Aymeric Laporte|Athletic Club
3|Cucho Hernandez|Real Betis
4|Pep Chavarria|Rayo Vallecano
5|Pablo Torre|RCD Mallorca
6|Julen Agirrezabala|Valencia CF
7|Omar El Hilali|RCD Espanyol
8|Arnau Martinez|Girona FC
9|Martim Neto|Elche CF
10|Salomon Rondon|Real Oviedo
11|Lamine Yamal|FC Barcelona
12|Thiago Almada|Atletico de Madrid`,'First Steps','insert'));
  addRows(pkId, rowsFrom(`1|Pedri|FC Barcelona
2|Koke|Atletico de Madrid
3|Tajon Buchanan|Villarreal CF
4|Ilaix Moriba|RC Celta
5|Aimar Oroz|CA Osasuna
6|Takefusa Kubo|Real Sociedad
7|Luis Milla|Getafe CF
8|Carles Alena|D. Alaves
9|Jose Angel Carmona|Sevilla FC
10|Matias Moreno|Levante UD
11|Federico Valverde|Real Madrid
12|Oihan Sancet|Athletic Club`,'Maestros','insert'));
  addRows(pkId, rowsFrom(`1|Kylian Mbappe|Real Madrid
2|Nico Williams|Athletic Club
3|Antony|Real Betis
4|Unai Lopez|Rayo Vallecano
5|Johan Mojica|RCD Mallorca
6|Arnaut Danjuma|Valencia CF
7|Edu Exposito|RCD Espanyol
8|Axel Witsel|Girona FC
9|Aleix Febas|Elche CF
10|Santiago Colombatto|Real Oviedo
11|Fermin Lopez|FC Barcelona
12|Giuliano Simeone|Atletico de Madrid`,'Self Expression','insert'));
  addRows(pkId, rowsFrom(`1|Pedri|FC Barcelona
2|Takefusa Kubo|Real Sociedad
3|Arda Guler|Real Madrid
4|Alberto Moleiro|Villarreal CF
5|Trent Alexander-Arnold|Real Madrid
6|Julian Alvarez|Atletico de Madrid
7|Jan Virgili|RCD Mallorca
8|Marcus Rashford|FC Barcelona
9|Jan Oblak|Atletico de Madrid`,'Aurora','insert'));
  addRows(pkId, rowsFrom(`1|Robert Lewandowski|FC Barcelona
2|Vini Jr.|Real Madrid
3|Karl Etta Eyong|Levante UD
4|Dean Huijsen|Real Madrid
5|Nico Williams|Athletic Club
6|Fermin Lopez|FC Barcelona
7|Lamine Yamal|FC Barcelona
8|Federico Valverde|Real Madrid
9|Joan Garcia|FC Barcelona`,'Blackout','insert'));
  addRows(pkId, rowsFrom(`1|Jude Bellingham|Real Madrid
2|Raphinha|FC Barcelona
3|Pau Cubarsi|FC Barcelona
4|Vladyslav Vanat|Girona FC
5|Kylian Mbappe|Real Madrid
6|Mikel Oyarzabal|Real Sociedad
7|Thibaut Courtois|Real Madrid
8|Ferran Torres|FC Barcelona
9|Rodrygo|Real Madrid`,'State of the Art','insert'));
  addRows(pkId, rowsFrom(`1|Lamine Yamal|FC Barcelona
2|Kylian Mbappe|Real Madrid
3|Julian Alvarez|Atletico de Madrid
4|Pedri|FC Barcelona
5|Jude Bellingham|Real Madrid`,'Le Cinque Piu Belle','case-hit'));
  ['I','II','III','IV'].forEach((tier,i)=>{
    const sets=[
      `1|Victor Valdepenas|Real Madrid\n2|Carlos Macia|Villarreal CF\n3|Selton Sanchez|Athletic Club\n4|Oso|Sevilla FC\n5|Mateo Joseph|RCD Mallorca`,
      `1|Joel Roca|Girona FC\n2|Jones El-Abdellaoui|RC Celta\n3|Jon Martin|Real Sociedad\n4|Alejandro Rego|Athletic Club\n5|Toni Fernandez|FC Barcelona`,
      `1|Adrian Liso|Getafe CF\n2|Marc Pubill|Atletico de Madrid\n3|Carlos Alvarez|Levante UD\n4|Victor Munoz|CA Osasuna\n5|Orri Oskarsson|Real Sociedad`,
      `1|Rodrigo Mendoza|Atletico de Madrid\n2|Karl Etta Eyong|Levante UD\n3|Vitor Reis|Girona FC\n4|Pablo Garcia|Real Betis\n5|Jan Virgili|RCD Mallorca`
    ]; addRows(pkId, rowsFrom(sets[i],`Rookies ${tier}`,'rookie-insert'));
  });
  addRows(pkId, rowsFrom(`1|Ander Barrenetxea|Real Sociedad
2|Fran Gonzalez|Real Madrid
3|Mario Martin|Getafe CF
4|Mikel Jauregizar|Athletic Club
5|Johnny Cardoso|Atletico de Madrid
6|Benat Turrientes|Real Sociedad
7|Michel|Girona FC
8|Andrei Ratiu|Rayo Vallecano
9|Isco|Real Betis
10|Alex Remiro|Real Sociedad
11|Unai Gomez|Athletic Club
12|Gerard Moreno|Villarreal CF
13|Alex Baena|Atletico de Madrid
14|Vedat Muriqi|RCD Mallorca
15|Alex Berenguer|Athletic Club`,'Brush Strokes','autograph'));
  window.CS_SET_META[pkId]={
    parallels:['Artist Proof','Ruby /199','Burgundy /99','Pink /99','Amber /75','Violet /49','Sapphire /25','Jade /25','Gold /10','Obsidian /8','Masterpiece 1/1'],
    inserts:['Elegance','First Steps','Maestros','Self Expression','Aurora','Blackout','State of the Art','Le Cinque Piu Belle','Rookies I-IV','Brush Strokes','Fresh Paint','Legacy Portrait Signatures'],
    aliases:{'pitch king':'Pitch Kings','pitch kings intl':'Pitch Kings','intl':'Hobby International'}, source:'Panini manufacturer checklist via Collector Nation', verified:'2026-10-03'
  };
})();
