(() => {
 const catalog=window.CS_CATALOG;if(!catalog)return;catalog.checklists=catalog.checklists||{};window.CS_SET_META=window.CS_SET_META||{};
 const id='panini-prizm-club-world-cup-2025';let c=catalog.collections.find(x=>x.id===id);const meta={sport:'Soccer',manufacturer:'Panini',year:'2025',name:'2025 Panini Prizm FIFA Club World Cup Soccer',shortName:'Prizm Club World Cup 2025',coverage:'expanded-checklist',baseCount:200,sourceUrl:'https://www.checklistinsider.com/2025-panini-prizm-fifa-club-world-cup-soccer'};if(c)Object.assign(c,meta);else{c={id,...meta};catalog.collections.push(c);}catalog.checklists[id]=catalog.checklists[id]||[];
 const add=(subset,category,text,flags=0)=>{const list=catalog.checklists[id],seen=new Set(list.map(r=>`${r?.[0]}|${String(r?.[1]||'').toLowerCase()}|${String(r?.[4]||'').toLowerCase()}`));for(const line of text.trim().split('\n').filter(Boolean)){const p=line.split('|');const row=[p[0],p[1],p[2],flags,subset,category];const k=`${row[0]}|${row[1].toLowerCase()}|${subset.toLowerCase()}`;if(!seen.has(k)){list.push(row);seen.add(k);}}};
 add('Base','base',`1|Ahmed Kouka|Al Ahly FC
2|Hussein El Shahat|Al Ahly FC
3|Mohamed El Shenawy|Al Ahly FC
4|Ramy Rabia|Al Ahly FC
5|Taher Mohamed|Al Ahly FC
6|Wessam Abou Ali|Al Ahly FC
7|Khalid Eisa|Al Ain FC
8|Kaku|Al Ain FC
9|Erik|Al Ain FC
10|Matias Palacios|Al Ain FC
11|Soufiane Rahimi|Al Ain FC
12|Mohamed Abbas al Baloushi|Al Ain FC
13|Aleksandar Mitrovic|Al Hilal
14|Joao Cancelo|Al Hilal
15|Marcos Leonardo|Al Hilal
16|Ruben Neves|Al Hilal
17|Sergej Milinkovic-Savic|Al Hilal
18|Yassine Bounou|Al Hilal
19|Alexander Sorloth|Atletico de Madrid
20|Antoine Griezmann|Atletico de Madrid
21|Conor Gallagher|Atletico de Madrid
22|Giuliano Simeone|Atletico de Madrid
23|Jan Oblak|Atletico de Madrid
24|Jose Maria Gimenez|Atletico de Madrid
25|Julian Alvarez|Atletico de Madrid
26|Koke|Atletico de Madrid
27|Bradley Barcola|Paris Saint-Germain
28|Adam Mitchell|Auckland City FC
29|Gerard Garriga|Auckland City FC
30|Angus Kilkolly|Auckland City FC
31|Mario Ilich|Auckland City FC
32|Myer Bevan|Auckland City FC
33|Nathan Lobo|Auckland City FC
34|Ander Herrera|Boca Juniors
35|Luis Advincula|Boca Juniors
36|Rodrigo Battaglia|Boca Juniors
37|Edinson Cavani|Boca Juniors
38|Exequiel Zeballos|Boca Juniors
39|Kevin Zenon|Boca Juniors
40|Agustin Marchesin|Boca Juniors
41|Miguel Merentiel|Boca Juniors
42|Cole Campbell|Borussia Dortmund
43|Harry Kane|FC Bayern München
44|Jamie Gittens|Borussia Dortmund
45|Julian Brandt|Borussia Dortmund
46|Joao Neves|Paris Saint-Germain
47|Kjell Watjen|Borussia Dortmund
48|Julien Duranville|Borussia Dortmund
49|Maximilian Beier|Borussia Dortmund
50|Serhou Guirassy|Borussia Dortmund
51|Cuiabano|Botafogo
52|Gregore|Botafogo
53|Igor Jesus|Botafogo
54|Jefferson Savarino|Botafogo
55|John Victor|Botafogo
56|Alex Telles|Botafogo
57|Alexander Barboza|Botafogo
58|Marlon Freitas|Botafogo
59|Fabio|Fluminense
60|Fidel Ambriz|CF Monterrey
61|German Berterame|CF Monterrey
62|Lucas Ocampos|CF Monterrey
63|Sergio Canales|CF Monterrey
64|Tecatito Corona|CF Monterrey
65|Tyrique George|Chelsea FC
66|Christopher Nkunku|Chelsea FC
67|Cole Palmer|Chelsea FC
68|Enzo Fernandez|Chelsea FC
69|Tosin Adarabioyo|Chelsea FC
70|Moises Caicedo|Chelsea FC
71|Nicolas Jackson|Chelsea FC
72|Pedro Neto|Chelsea FC
73|Josh Acheampong|Chelsea FC
74|Thiago Santana|Urawa Red Diamonds
75|Genki Haraguchi|Urawa Red Diamonds
76|Taishi Matsumoto|Urawa Red Diamonds
77|Takahiro Sekine|Urawa Red Diamonds
78|Matheus Savio|Urawa Red Diamonds
79|Takuro Kaneko|Urawa Red Diamonds
80|Mohamed Amine Tougai|Esperance Sportive de Tunis
81|Houssem Tka|Esperance Sportive de Tunis
82|Elias Mokwana|Esperance Sportive de Tunis
83|Yan Sasse|Esperance Sportive de Tunis
84|Onuche Ogbelu|Esperance Sportive de Tunis
85|Youcef Belaili|Esperance Sportive de Tunis
86|Alessandro Bastoni|FC Internazionale Milano
87|Davide Frattesi|FC Internazionale Milano
88|Federico Dimarco|FC Internazionale Milano
89|Hakan Calhanoglu|FC Internazionale Milano
90|Henrikh Mkhitaryan|FC Internazionale Milano
91|Lautaro Martinez|FC Internazionale Milano
92|Marcus Thuram|FC Internazionale Milano
93|Nicolo Barella|FC Internazionale Milano
94|Nicola Zalewski|FC Internazionale Milano
95|Kaito Yasui|Urawa Red Diamonds
96|Diogo Costa|FC Porto
97|Martim Fernandes|FC Porto
98|Rodrigo Mora|FC Porto
99|Samu Aghehowa|FC Porto
100|Alan Varela|FC Porto
101|Fabio Vieira|FC Porto
102|Agustin Rossi|Flamengo
103|Ayrton Lucas|Flamengo
104|Bruno Henrique|Flamengo
105|Gerson|Flamengo
106|Giorgian de Arrascaeta|Flamengo
107|Luiz Araujo|Flamengo
108|Pedro|Flamengo
109|Wesley|Flamengo
110|Ganso|Fluminense
111|German Cano|Fluminense
112|Jhon Arias|Fluminense
113|John Kennedy|CF Pachuca
114|Keno|Fluminense
115|Lima|Fluminense
116|Martinelli|Fluminense
117|Thiago Silva|Fluminense
118|Dusan Vlahovic|Juventus
119|Juan Cabal|Juventus
120|Kenan Yildiz|Juventus
121|Francisco Conceicao|Juventus
122|Manuel Locatelli|Juventus
123|Nicolo Savona|Juventus
124|Samuel Mbangula|Juventus
125|Teun Koopmeiners|Juventus
126|Vasilije Adzic|Juventus
127|Warren Zaire-Emery|Paris Saint-Germain
128|Iqraam Rayners|Mamelodi Sundowns FC
129|Khuliso Mudau|Mamelodi Sundowns FC
130|Lucas Ribeiro|Mamelodi Sundowns FC
131|Marcelo Allende|Mamelodi Sundowns FC
132|Teboho Mokoena|Mamelodi Sundowns FC
133|Aubrey Modiba|Mamelodi Sundowns FC
134|Nico O'Reilly|Manchester City
135|Vitinha|Paris Saint-Germain
136|Erling Haaland|Manchester City
137|Jahmai Simpson-Pusey|Manchester City
138|Justin Oboavwoduo|Manchester City
139|Kevin De Bruyne|Manchester City
140|Matty Warhurst|Manchester City
141|Abdukodir Khusanov|Manchester City
142|Phil Foden|Manchester City
143|Omar Marmoush|Manchester City
144|Bryan Gonzalez|CF Pachuca
145|Elias Montiel|CF Pachuca
146|Nelson Deossa|CF Monterrey
147|Oussama Idrissi|CF Pachuca
148|Owen Gonzalez|CF Pachuca
149|Salomon Rondon|CF Pachuca
150|Anibal Moreno|Palmeiras
151|Estevao|Palmeiras
152|Jose Lopez|Palmeiras
153|Mauricio|Palmeiras
154|Raphael Veiga|Palmeiras
155|Richard Rios|Palmeiras
156|Vitor Reis|Manchester City
157|Lucas Beraldo|Paris Saint-Germain
158|Arda Guler|Real Madrid
159|Endrick|Real Madrid
160|Federico Valverde|Real Madrid
161|Fran Gonzalez|Real Madrid
162|Joan Martinez|Real Madrid
163|Jude Bellingham|Real Madrid
164|Kylian Mbappe|Real Madrid
165|Luka Modric|Real Madrid
166|Jacobo Ramon|Real Madrid
167|Vini Jr.|Real Madrid
168|Joane Gadou|FC Salzburg
169|Dorgeles Nene|FC Salzburg
170|Karim Konate|FC Salzburg
171|Yorbe Vertessen|FC Salzburg
172|Oscar Gloukh|FC Salzburg
173|Adam Daghim|FC Salzburg
174|Facundo Colidio|River Plate
175|Franco Mastantuono|River Plate
176|Ian Subiabre|River Plate
177|Ignacio Fernandez|River Plate
178|Miguel Borja|River Plate
179|Sebastian Driussi|River Plate
180|Marquinhos|Paris Saint-Germain
181|Kevin Castano|River Plate
182|Alvaro Carreras|SL Benfica
183|Angel Di Maria|SL Benfica
184|Gianluca Prestianni|SL Benfica
185|Kerem Akturkoglu|SL Benfica
186|Tomas Araujo|SL Benfica
187|Vangelis Pavlidis|SL Benfica
188|Chung-Yong Lee|Ulsan HD FC
189|Darijan Bojanic|Ulsan HD FC
190|Ludwigson|Ulsan HD FC
191|Seok-Ho Hwang|Ulsan HD FC
192|Min-Woo Kang|Ulsan HD FC
193|Woo-young Jung|Ulsan HD FC
194|Pedrinho|Wydad AC
195|Hamza Sakhi|Wydad AC
196|Jamal Harkass|Wydad AC
197|Oussama Zemraoui|Wydad AC
198|Saifeddine Bouhra|Wydad AC
199|Youssef El Motie|Wydad AC
200|Lionel Messi|Inter Miami CF`);
 add('Dual Signatures','autograph',`1|Edinson Cavani/Marcos Rojo|Boca Juniors
2|Karl-Heinz Riedle/Matthias Sammer|Borussia Dortmund
3|Giorgio Chiellini/Leonardo Bonucci|Juventus
4|Edgar Davids/Zinedine Zidane|Juventus
5|Erling Haaland/Sergio Aguero|Manchester City
6|David Beckham/Ronaldo|Real Madrid
7|Endrick/Kylian Mbappe|Real Madrid`,['AUTO']);
 add('Flashback Autographs','autograph',`1|David Villa|Atletico de Madrid
2|Jimmy Floyd Hasselbaink|Atletico de Madrid
3|Jurgen Kohler|Borussia Dortmund
4|Matthias Sammer|Borussia Dortmund
5|Andreas Moller|Borussia Dortmund
6|Victor Moses|Chelsea FC
7|Giuseppe Bergomi|FC Internazionale Milano
8|Julio Cesar|FC Internazionale Milano
9|Lucio|FC Internazionale Milano
10|Marco Materazzi|FC Internazionale Milano
11|Walter Samuel|FC Internazionale Milano
12|Wesley Sneijder|FC Internazionale Milano
13|Ricardo Carvalho|FC Porto
14|Alessandro Del Piero|Juventus
15|David Trezeguet|Juventus
16|Pavel Nedved|Juventus
17|Fabio Cannavaro|Juventus
18|Fabrizio Ravanelli|Juventus
19|Gianluigi Buffon|Juventus
20|Giorgio Chiellini|Juventus
21|Sami Khedira|Juventus
22|Claudio Reyna|Manchester City
23|David Silva|Manchester City
24|Pablo Zabaleta|Manchester City
25|Yaya Toure|Manchester City
26|Roberto Carlos|Palmeiras
27|Gareth Bale|Real Madrid
28|Ruud van Nistelrooy|Real Madrid
29|Toni Kroos|Real Madrid
30|David Luiz|SL Benfica
31|Paulo Sousa|Borussia Dortmund`,['AUTO']);
 add('Global Graphs','autograph',`1|Exequiel Zeballos|Boca Juniors
2|Cesar Azpilicueta|Atletico de Madrid
3|Julian Alvarez|Atletico de Madrid
4|Samuel Lino|Atletico de Madrid
5|Karim Adeyemi|Borussia Dortmund
6|Angel Di Maria|SL Benfica
7|Didier Drogba|Chelsea FC
8|Noni Madueke|Chelsea FC
10|Carlos Augusto|FC Internazionale Milano
11|Diego Milito|FC Internazionale Milano
12|Federico Dimarco|FC Internazionale Milano
13|Samu Aghehowa|FC Porto
14|Everton|Flamengo
15|Dusan Vlahovic|Juventus
16|Weston McKennie|Juventus
17|Zinedine Zidane|Juventus
18|Erling Haaland|Manchester City
19|Pep Guardiola|Manchester City
20|Phil Foden|Manchester City
21|Savinho|Manchester City
22|Benjamin Cremaschi|Inter Miami CF
23|Lionel Messi|Inter Miami CF
24|Luis Suarez|Inter Miami CF
25|Richard Rios|Palmeiras
26|Aurelien Tchouameni|Real Madrid
27|Douglas Luiz|Juventus
28|Jacobo Ramon|Real Madrid
29|Luis Figo|Real Madrid
30|Vini Jr.|Real Madrid
31|Hyeon-Woo Jo|Ulsan HD FC`,['AUTO']);
 add('Signatures','autograph',`1|Joao Cancelo|Al Hilal
2|Renan Lodi|Al Hilal
3|Sergej Milinkovic-Savic|Al Hilal
4|Antoine Griezmann|Atletico de Madrid
5|Diego Forlan|Atletico de Madrid
6|Pablo Barrios|Atletico de Madrid
7|Reinildo Mandava|Atletico de Madrid
8|Rodrigo Riquelme|Atletico de Madrid
9|Jorg Heinrich|Borussia Dortmund
10|Yan Couto|Borussia Dortmund
11|Willian|Chelsea FC
12|Denzel Dumfries|FC Internazionale Milano
13|Javier Zanetti|FC Internazionale Milano
14|Lautaro Martinez|FC Internazionale Milano
15|Ronaldo|FC Internazionale Milano
16|Zlatan Ibrahimovic|FC Internazionale Milano
17|Thiago Silva|Fluminense
18|Jesus Ferreira|Seattle Sounders
19|Teun Koopmeiners|Juventus
20|Miguel Merentiel|Boca Juniors
21|Salomon Rondon|CF Pachuca
22|David Beckham|Real Madrid
23|Eduardo Camavinga|Real Madrid
24|Endrick|Real Madrid
25|Federico Valverde|Real Madrid
26|Joan Martinez|Real Madrid
27|Kylian Mbappe|Real Madrid
28|Lucas Vazquez|Real Madrid
29|Marcos Acuna|River Plate
31|Edinson Cavani|Boca Juniors`,['AUTO']);
 add('Color Blast','case-hit',`1|Antoine Griezmann|Atletico de Madrid
2|Sergio Aguero|Atletico de Madrid
3|Diego Maradona|Boca Juniors
4|Julien Duranville|Borussia Dortmund
5|Ronaldo|FC Internazionale Milano
6|Zlatan Ibrahimovic|FC Internazionale Milano
7|Samu Aghehowa|FC Porto
8|Dusan Vlahovic|Juventus
9|Kenan Yildiz|Juventus
10|Erling Haaland|Manchester City
11|Estevao|Palmeiras
12|David Beckham|Real Madrid
13|Endrick|Real Madrid
14|Jude Bellingham|Real Madrid
15|Kylian Mbappe|Real Madrid
16|Rodrygo|Real Madrid
17|Vini Jr.|Real Madrid
18|Zinedine Zidane|Real Madrid
19|Oscar Gloukh|FC Salzburg
20|Franco Mastantuono|River Plate`);
 add('Color Blast Duals','case-hit',`1|Antoine Griezmann/Julian Alvarez|Atletico de Madrid
2|Didier Drogba/Eden Hazard|Chelsea FC
3|Cole Palmer/Nicolas Jackson|Chelsea FC
4|Lautaro Martinez/Marcus Thuram|FC Internazionale Milano
5|Edgar Davids/Pavel Nedved|Juventus
6|Zinedine Zidane/Zlatan Ibrahimovic|Juventus
7|David Silva/Sergio Aguero|Manchester City
8|Erling Haaland/Kevin De Bruyne|Manchester City
9|Jude Bellingham/Kylian Mbappe|Real Madrid
10|Endrick/Vini Jr.|Real Madrid`);
 window.CS_SET_META[id]={parallels:['Glitter Prizms','Green Ice Prizms','Hyper Prizms','Ice Prizms','Pandora Prizms','Pulsar Prizms','Red/White/Blue Mojo Prizms','Seismic Prizms','Silver Prizms','White Knight Prizms','White Sparkle Prizms','Pink Seismic /299','Red Pulsar /299','Blue Pulsar /275','Blue Seismic /275','Orange Seismic /199','Red /199','Blue Ice /175','Blue Glitter /149','Orange Pulsar /149','Purple /125','Orange Glitter /99','Purple Seismic /99','Teal /99','Purple Pulsar /75','Purple Pandora /49','Teal Seismic /49','Multicolor Mojo /25','Purple Glitter /25','Teal Pulsar /25','Logo /20','Pink Mojo /11','Gold /10','Gold Glitter /10','Gold Pulsar /10','Gold Seismic /10','Blue Shimmer /8','Green /5','Gold Shimmer /3','Gold Vinyl 1/1'],source:'Checklist Insider',verified:'2026-10-03'};
})();
