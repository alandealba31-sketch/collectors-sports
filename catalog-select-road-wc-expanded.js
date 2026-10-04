(() => {
 const catalog=window.CS_CATALOG;if(!catalog)return;catalog.checklists=catalog.checklists||{};window.CS_SET_META=window.CS_SET_META||{};
 const id='panini-select-road-to-world-cup-2025-26';let c=catalog.collections.find(x=>x.id===id);const meta={sport:'Soccer',manufacturer:'Panini',year:'2025/26',name:'2025-26 Panini Select Road to FIFA World Cup 2026',shortName:'Select Road to World Cup 25/26',coverage:'base-complete-expanded',baseCount:250,sourceUrl:'https://www.checklistinsider.com/2025-26-panini-select-road-to-fifa-world-cup'};if(c)Object.assign(c,meta);else{c={id,...meta};catalog.collections.push(c);}catalog.checklists[id]=catalog.checklists[id]||[];
 const add=(subset,category,text,flags=0)=>{const list=catalog.checklists[id],seen=new Set(list.map(r=>`${r?.[0]}|${String(r?.[1]||'').toLowerCase()}|${String(r?.[4]||'').toLowerCase()}`));for(const line of text.trim().split('\n').filter(Boolean)){const p=line.split('|');const row=[p[0],p[1],p[2],flags,subset,category];const k=`${row[0]}|${row[1].toLowerCase()}|${subset.toLowerCase()}`;if(!seen.has(k)){list.push(row);seen.add(k);}}};
 add('Base Terrace','base',`1|Jamal Musiala|Germany
2|Kai Havertz|Germany
3|Nick Woltemade|Germany
4|Antonio Rudiger|Germany
5|Jamie Leweling|Germany
6|Karim Adeyemi|Germany
7|Lewis Koumas|Cymru
8|Brennan Johnson|Cymru
9|Erling Haaland|Norway
10|Sindre Walle Egeli|Norway
11|Luis Diaz|Colombia
12|Daniel Munoz|Colombia
13|James Rodriguez|Colombia
14|Hyeon-gyu Oh|Korea Republic
15|Hyeon-Woo Jo|Korea Republic
16|Federico Valverde|Uruguay
17|Maximiliano Araujo|Uruguay
18|Manuel Ugarte|Uruguay
19|Victor Froholdt|Denmark
20|Mika Biereth|Denmark
21|Victor Boniface|Nigeria
22|Tolu Arokodare|Nigeria
23|Giuliano Simeone|Argentina
24|Kasper Schmeichel|Denmark
25|Raul Jimenez|Mexico
26|Luis Malagon|Mexico
27|Patrik Schick|Czechia
28|Pavel Sulc|Czechia
29|Nicolo Barella|Italy
30|Giacomo Raspadori|Italy
31|Pio Esposito|Italy
32|Mateo Retegui|Italy
33|Federico Dimarco|Italy
34|Josip Stanisic|Croatia
35|Luka Modric|Croatia
36|Luka Vuskovic|Croatia
37|Robert Lewandowski|Poland
38|Nicola Zalewski|Poland
39|Eberechi Eze|England
40|Anthony Gordon|England
41|Declan Rice|England
42|Harry Kane|England
43|Marc Guehi|England
44|Cole Palmer|England
45|Alexander Isak|Sweden
46|Anthony Elanga|Sweden
47|Vitinha|Portugal
48|Cristiano Ronaldo|Portugal
49|Diogo Costa|Portugal
50|Nuno Mendes|Portugal
51|Pedro Neto|Portugal
52|Achraf Hakimi|Morocco
53|Bilal El Khannouss|Morocco
54|Dusan Vlahovic|Serbia
55|Aleksandar Stankovic|Serbia
56|Lionel Messi|Argentina
57|Cristian Romero|Argentina
58|Enzo Fernandez|Argentina
59|Nico Paz|Argentina
60|Emiliano Martinez|Argentina
61|Lois Openda|Belgium
62|Thibaut Courtois|Belgium
63|Kevin De Bruyne|Belgium
64|Charles De Ketelaere|Belgium
65|Malick Fofana|Belgium
66|Heung-Min Son|Korea Republic
67|Jens Castrop|Korea Republic
68|Lamine Yamal|Spain
69|Rodri|Spain
70|Mikel Merino|Spain
71|Mikel Oyarzabal|Spain
72|Jesus Rodriguez|Spain
73|Benjamin Sesko|Slovenia
74|Timi Max Elsnik|Slovenia
75|Eduardo Camavinga|France
76|Bradley Barcola|France
77|Michael Olise|France
78|Rayan Cherki|France
79|Mike Maignan|France
80|Kylian Mbappe|France
81|Christian Pulisic|United States
82|Alex Freeman|United States
83|Folarin Balogun|United States
84|Antonee Robinson|United States
85|Damion Downs|United States
86|Cody Gakpo|Netherlands
87|Luciano Valente|Netherlands
88|Denzel Dumfries|Netherlands
89|Xavi Simons|Netherlands
90|Jurrien Timber|Netherlands
91|Granit Xhaka|Switzerland
92|Dan Ndoye|Switzerland
93|Gregor Kobel|Switzerland
94|Nicolas Jackson|Senegal
95|Iliman Ndiaye|Senegal
96|Raphinha|Brazil
97|Richarlison|Brazil
98|Bruno Guimaraes|Brazil
99|Vini Jr.|Brazil
100|Gabriel|Brazil`);
 add('Base Mezzanine','base',`101|Joshua Kimmich|Germany
102|Florian Wirtz|Germany
103|David Raum|Germany
104|Nnamdi Collins|Germany
105|Angelo Stiller|Germany
106|Maximilian Beier|Germany
107|Neco Williams|Cymru
108|Jordan James|Cymru
109|Martin Odegaard|Norway
110|Thelo Aasgaard|Norway
111|Jaminton Campaz|Colombia
112|Jhon Arias|Colombia
113|Richard Rios|Colombia
114|Thiago Almada|Argentina
115|Min-Hyuk Yang|Korea Republic
116|Darwin Nunez|Uruguay
117|Ronald Araujo|Uruguay
118|Facundo Pellistri|Uruguay
119|Rasmus Hojlund|Denmark
120|Morten Hjulmand|Denmark
121|Victor Osimhen|Nigeria
122|Raphael Onyedika|Nigeria
123|Mikkel Damsgaard|Denmark
124|Patrick Dorgu|Denmark
125|Gilberto Mora|Mexico
126|Santiago Gimenez|Mexico
127|Tomas Soucek|Czechia
128|Matej Kovar|Czechia
129|Gianluigi Donnarumma|Italy
130|Alessandro Bastoni|Italy
131|Moise Kean|Italy
132|Davide Frattesi|Italy
133|Sandro Tonali|Italy
134|Josko Gvardiol|Croatia
135|Petar Sucic|Croatia
136|Andrej Kramaric|Croatia
137|Jakub Kiwior|Poland
138|Piotr Zielinski|Poland
139|Bukayo Saka|England
140|Trent Alexander-Arnold|England
141|Noni Madueke|England
142|Phil Foden|England
143|Jordan Pickford|England
144|Jude Bellingham|England
145|Viktor Gyokeres|Sweden
146|Hugo Larsson|Sweden
147|Bernardo Silva|Portugal
148|Francisco Conceicao|Portugal
149|Bruno Fernandes|Portugal
150|Rafael Leao|Portugal
151|Joao Neves|Portugal
152|Youssef En-Nesyri|Morocco
153|Brahim Diaz|Morocco
154|Ivan Ilic|Serbia
155|Mihajlo Cvetkovic|Serbia
156|Rodrigo de Paul|Argentina
157|Lautaro Martinez|Argentina
158|Franco Mastantuono|Argentina
159|Julian Alvarez|Argentina
160|Alexis Mac Allister|Argentina
161|Leandro Trossard|Belgium
162|Amadou Onana|Belgium
163|Youri Tielemans|Belgium
164|Romelu Lukaku|Belgium
165|Jeremy Doku|Belgium
166|Kang-in Lee|Korea Republic
167|Min-jae Kim|Korea Republic
168|Pedri|Spain
169|Unai Simon|Spain
170|Nico Williams|Spain
171|Dani Olmo|Spain
172|Martin Zubimendi|Spain
173|Jan Oblak|Slovenia
174|Adam Gnezda Cerin|Slovenia
175|William Saliba|France
176|Desire Doue|France
177|Marcus Thuram|France
178|Manu Kone|France
179|Aurelien Tchouameni|France
180|Ousmane Dembele|France
181|Malik Tillman|United States
182|Tanner Tessmann|United States
183|Diego Luna|United States
184|Weston McKennie|United States
185|Tyler Adams|United States
186|Micky van de Ven|Netherlands
187|Tijjani Reijnders|Netherlands
188|Memphis Depay|Netherlands
189|Virgil van Dijk|Netherlands
190|Ryan Gravenberch|Netherlands
191|Manuel Akanji|Switzerland
192|Johan Manzambi|Switzerland
193|Breel Embolo|Switzerland
194|El Hadji Malick Diouf|Senegal
195|Lamine Camara|Senegal
196|Alisson Becker|Brazil
197|Endrick|Brazil
198|Savinho|Brazil
199|Gabriel Martinelli|Brazil
200|Rodrygo|Brazil`);
 add('Base Field Level','base',`201|Lautaro Martinez|Argentina
202|Julian Alvarez|Argentina
203|Phil Foden|England
204|Franco Mastantuono|Argentina
205|Kevin De Bruyne|Belgium
206|Declan Rice|England
207|Cristiano Ronaldo|Portugal
208|Harry Kane|England
209|Cole Palmer|England
210|Lionel Messi|Argentina
211|Mike Maignan|France
212|Benjamin Sesko|Slovenia
213|Serge Gnabry|Germany
214|Bruno Fernandes|Portugal
215|Victor Froholdt|Denmark
216|Jude Bellingham|England
217|Gilberto Mora|Mexico
218|Erling Haaland|Norway
219|Virgil van Dijk|Netherlands
220|Lamine Yamal|Spain
221|Viktor Gyokeres|Sweden
222|Federico Valverde|Uruguay
223|Luka Modric|Croatia
224|Alexander Isak|Sweden
225|Endrick|Brazil
226|Robert Lewandowski|Poland
227|Ousmane Dembele|France
228|Vini Jr.|Brazil
229|Achraf Hakimi|Morocco
230|Moise Kean|Italy
231|Christian Pulisic|United States
232|William Saliba|France
233|Rodrygo|Brazil
234|Heung-Min Son|Korea Republic
235|Malick Fofana|Belgium
236|Nicolo Barella|Italy
237|Luis Diaz|Colombia
238|Savinho|Brazil
239|Mika Biereth|Denmark
240|Thibaut Courtois|Belgium
241|Cody Gakpo|Netherlands
242|Martin Odegaard|Norway
243|Nico Williams|Spain
244|Enzo Fernandez|Argentina
245|Bukayo Saka|England
246|Raphinha|Brazil
247|Pedri|Spain
248|Diego Maradona|Argentina
249|Franz Beckenbauer|Germany
250|Pele|Brazil`);
 add('Autographed Memorabilia','auto-relic',`1|Florian Wirtz|Germany
2|Harry Kane|England
3|Raphinha|Brazil
4|Erling Haaland|Norway
5|Robert Lewandowski|Poland
6|Christian Pulisic|United States
7|Kylian Mbappe|France
8|Lionel Messi|Argentina
9|Rafael Leao|Portugal
10|Davide Frattesi|Italy`,['AUTO','RELIC']);
 window.CS_SET_META[id]={parallels:['Blue Checker','Checkerboard','Flash','Green Ice','Honeycomb','Ice','Multi-Color','Peacock','Pink Ice','Purple Mojo','Red & Green Flash','Red Ice','Red Pandora','Silver','White Sparkle','Orange Mojo /825','Orange Ice /749','Purple Ice /599','Pink Mojo /399','Black & White Ice /380','Camo /199','Purple /150','Bronze Checker /130','White Ice /129','Blue Ice /125','Pink /99','Red Wave /68','Panini Logo /61','Winter Camo /49','Purple Dragon Scale /48','White Flash /28','Tie-Dye /25','White /20','Jade Dragon Scale /18','Pink Wave /13','Gold /10','Gold Ice /10','Gold Mojo /10','Gold Wave /10','Green /5','Neon Purple Pulsar /3','Black 1/1','Black Dragon Scale 1/1','Black Ice 1/1','Black Mojo 1/1','Black Snakeskin Pulsar 1/1'],aliases:{'orange mojo':'Orange Mojo /825','mezzanine orange mojo':'Orange Mojo /825'},source:'Checklist Insider',verified:'2026-10-03'};
})();
