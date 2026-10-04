(() => {
 const catalog=window.CS_CATALOG;if(!catalog)return;catalog.checklists=catalog.checklists||{};window.CS_SET_META=window.CS_SET_META||{};
 const id='panini-prizm-monopoly-world-cup-2026';let c=catalog.collections.find(x=>x.id===id);const meta={sport:'Soccer',manufacturer:'Panini',year:'2026',name:'2026 Panini Prizm Monopoly FIFA World Cup Soccer',shortName:'Prizm Monopoly WC 2026',coverage:'complete-published-checklist',baseCount:100,sourceUrl:'https://www.checklistinsider.com/2026-panini-prizm-monopoly-fifa-world-cup'};if(c)Object.assign(c,meta);else{c={id,...meta};catalog.collections.push(c);}catalog.checklists[id]=catalog.checklists[id]||[];
 const add=(subset,category,text)=>{const list=catalog.checklists[id],seen=new Set(list.map(r=>`${r?.[0]}|${String(r?.[1]||'').toLowerCase()}|${String(r?.[4]||'').toLowerCase()}`));for(const line of text.trim().split('\n').filter(Boolean)){const p=line.split('|');const row=[p[0],p[1],p[2]||'',0,subset,category];const k=`${row[0]}|${row[1].toLowerCase()}|${subset.toLowerCase()}`;if(!seen.has(k)){list.push(row);seen.add(k);}}};
 add('Base','base',`1|Lionel Messi|Argentina
2|Lautaro Martínez|Argentina
3|Diego Maradona|Argentina
4|Gabriel Batistuta|Argentina
5|Javier Zanetti|Argentina
6|Sergio Agüero|Argentina
7|Kylian Mbappé|France
8|Franck Ribéry|France
9|Zinedine Zidane|France
10|Robert Pirès|France
11|Warren Zaïre-Emery|France
12|David Trezeguet|France
13|Michel Platini|France
14|Vini Jr.|Brazil
15|Neymar Jr.|Brazil
16|Pelé|Brazil
17|Roberto Carlos|Brazil
18|Ronaldo|Brazil
19|Kaka|Brazil
20|Bebeto|Brazil
21|Rivaldo|Brazil
22|Harry Kane|England
23|Steven Gerrard|England
24|Paul Scholes|England
25|Ollie Watkins|England
26|Michael Owen|England
27|Wayne Rooney|England
28|Pepe|Portugal
29|Phil Foden|England
30|Gonçalo Ramos|Portugal
31|Luís Figo|Portugal
32|Ricardo Carvalho|Portugal
33|Bernardo Silva|Portugal
34|Alessandro Nesta|Italy
35|Federico Chiesa|Italy
36|Fabio Cannavaro|Italy
37|Paolo Maldini|Italy
38|Claudio Marchisio|Italy
39|Alessandro Del Piero|Italy
40|Xabi Alonso|Spain
41|Lamine Yamal|Spain
42|David Silva|Spain
43|Andrés Iniesta|Spain
44|David Villa|Spain
45|Sergio Busquets|Spain
46|Gerard Piqué|Spain
47|Christian Pulisic|United States
48|Landon Donovan|United States
49|Claudio Reyna|United States
50|Weston McKennie|United States
51|Clint Dempsey|United States
52|Antonee Robinson|United States
53|Carlos Vela|Mexico
54|Pável Pardo|Mexico
55|Andrés Guardado|Mexico
56|Hugo Sánchez|Mexico
57|Rafael Márquez|Mexico
58|Raúl Jiménez|Mexico
59|Thomas Müller|Germany
60|Franz Beckenbauer|Germany
61|Philipp Lahm|Germany
62|Miroslav Klose|Germany
63|Paul Breitner|Germany
64|Lothar Matthäus|Germany
65|Federico Valverde|Uruguay
66|Eden Hazard|Belgium
67|Luis Suárez|Uruguay
68|Diego Forlán|Uruguay
69|Enzo Francescoli|Uruguay
70|Edinson Cavani|Uruguay
71|Timothy Weah|United States
72|Patrick Kluivert|Netherlands
73|Marco van Basten|Netherlands
74|Dennis Bergkamp|Netherlands
75|Ruud Gullit|Netherlands
76|Robin van Persie|Netherlands
77|Julian De Guzman|Canada
78|Alphonso Davies|Canada
79|Victor Moses|Nigeria
80|Benni McCarthy|South Africa
81|John Obi Mikel|Nigeria
82|Jay-Jay Okocha|Nigeria
83|Heung-min Son|Korea Republic
84|Robert Lewandowski|Poland
85|Alexis Sánchez|Chile
86|Cindy Parlow Cone|United States
87|Kristine Lilly|United States
88|Birgit Prinz|Germany
89|Brandy Chastain|United States
90|Michelle Akers|United States
91|Mia Hamm|United States
92|Abby Wambach|United States
93|Julie Foudy|United States
94|Trinity Rodman|United States
95|Sophia Wilson|United States
96|Marta|Brazil
97|Kelly Smith|England
98|Jennifer Hermoso|Spain
99|Aitana Bonmatí|Spain
100|Christine Sinclair|Canada`);
 add('Black Money Blast','case-hit',`BMB-1|Diego Maradona|Argentina
BMB-2|Vini Jr.|Brazil
BMB-3|Lamine Yamal|Spain
BMB-4|Pelé|Brazil
BMB-5|Lionel Messi|Argentina
BMB-6|Kylian Mbappé|France
BMB-7|Christian Pulisic|United States
BMB-8|Marta|Brazil
BMB-9|Mia Hamm|United States
BMB-10|Mr. Monopoly|Monopoly`);
 add('Millionaire Black','ssp',`B1|Diego Maradona|Argentina
B2|Pelé|Brazil
B3|Neymar Jr.|Brazil
B4|Lionel Messi|Argentina
B5|Harry Kane|England
B6|Zinedine Zidane|France
B7|Andrés Iniesta|Spain
B9|Luis Figo|Portugal`);
 add('Millionaire White','ssp',`W1|Mr. Monopoly|Monopoly
W2|Lionel Messi|Argentina
W3|Wayne Rooney|England
W4|Landon Donovan|United States
W5|Heung-min Son|Korea Republic
W6|Marta|Brazil
W7|Alphonso Davies|Canada
W8|Diego Maradona|Argentina
W9|Pelé|Brazil`);
 add('Starter Pack','insert',`S1|Lionel Messi|Argentina
S2|Heung-min Son|Korea Republic
S3|Harry Kane|England
S4|Robin van Persie|Netherlands
S5|Kylian Mbappé|France
S6|Pelé|Brazil
S7|Christian Pulisic|United States
S8|Hope Solo|United States`);
 add('White Money Blast','case-hit',`WMB-1|Paolo Maldini|Italy
WMB-2|Harry Kane|England
WMB-3|Pelé|Brazil
WMB-4|Kylian Mbappé|France
WMB-5|Christian Pulisic|United States
WMB-6|Marta|Brazil`);
 window.CS_SET_META[id]={parallels:['Silver Prizms','Red Prizms','Gold Cracked Ice Prizms','Hat Trick Mojo Prizms','Boardwalk Blue Tiger Stripe Prizms','Tokens Pink Prizms','Four Corners Green Wave Prizms','Four Corners Blue Wave Prizms','Free Parking Prizms','Top Hat Tycoon Prizms','Sparkle Pink Prizms','Monopoly Orange & Gold Classic Icons Prizms','Nebula Prizms','Gold Big Money Shimmer /500','Brown /299','Light Blue /249','Pink /199','Orange /149','Red Big Money Shimmer /100','Purple /99','Purple Big Money Shimmer /50','Gold /49','Green /35','Luxury Rings /25','Question Mark /25','Green Big Money Shimmer /20','Boardwalk Blue /15','Blue Big Money Shimmer /10','Gold Wave Big Money /10','Pink Big Money Shimmer /5','Black Gold /5','White Big Money Shimmer 1/1','Black 1/1'],source:'Checklist Insider',verified:'2026-10-03'};
})();
