(() => {
  const catalog=window.CS_CATALOG;if(!catalog)return;
  catalog.checklists=catalog.checklists||{};window.CS_SET_META=window.CS_SET_META||{};
  const id='panini-select-la-liga-2024-25';
  let c=catalog.collections.find(x=>x.id===id);
  const meta={sport:'Soccer',manufacturer:'Panini',year:'2024/25',name:'2024-25 Panini Select LaLiga Soccer',shortName:'Select LaLiga 24/25',coverage:'base-complete-expanded',baseCount:250,sourceUrl:'https://www.checklistinsider.com/2024-25-panini-select-la-liga-soccer'};
  if(c)Object.assign(c,meta);else{c={id,...meta};catalog.collections.push(c);}catalog.checklists[id]=catalog.checklists[id]||[];
  const add=(subset,category,text,flags=0)=>{const list=catalog.checklists[id];const seen=new Set(list.map(r=>`${r?.[0]}|${String(r?.[1]||'').toLowerCase()}|${String(r?.[4]||'').toLowerCase()}`));for(const line of text.trim().split('\n').filter(Boolean)){const p=line.split('|');const row=[p[0],p[1],p[2],flags,subset,category];const k=`${row[0]}|${row[1].toLowerCase()}|${subset.toLowerCase()}`;if(!seen.has(k)){list.push(row);seen.add(k);}}};
  add('Base Terrace','base',`1|Cristhian Mosquera|Valencia CF
2|Hugo Duro|Valencia CF
3|Cesar Tarrega|Valencia CF
4|Andre Almeida|Valencia CF
5|Thierry Correia|Valencia CF
6|Martin Valjent|RCD Mallorca
7|Dominik Greif|RCD Mallorca
8|Robert Navarro|RCD Mallorca
9|Sergi Darder|RCD Mallorca
10|Marc Domenech|RCD Mallorca
11|Yvan Neyou|CD Leganes
12|Miguel de la Fuente|CD Leganes
13|Valentin Rosier|CD Leganes
14|Javi Hernandez|CD Leganes
15|Oscar Rodriguez|CD Leganes
16|Aurelien Tchouameni|Real Madrid
17|Eder Militao|Real Madrid
18|Antonio Rudiger|Real Madrid
19|Dani Carvajal|Real Madrid
20|Luka Modric|Real Madrid
21|Hugo Sotelo|RC Celta
22|Jonathan Bamba|RC Celta
23|Damian Rodriguez|RC Celta
24|Javi Rodriguez|RC Celta
25|Williot Swedberg|RC Celta
26|Kike Salas|Sevilla FC
27|Jose Angel Carmona|Sevilla FC
28|Albert Sambi Lokonga|Sevilla FC
29|Loic Bade|Sevilla FC
30|Valentin Barco|Sevilla FC
31|James Rodriguez|Rayo Vallecano
32|Dani Cardenas|Rayo Vallecano
33|Abdul Mumin|Rayo Vallecano
34|Isi Palazon|Rayo Vallecano
35|Andrei Ratiu|Rayo Vallecano
36|Iker Losada|Real Betis
37|Aitor Ruibal|Real Betis
38|Marc Roca|Real Betis
39|Romain Perraud|Real Betis
40|Rui Silva|Real Betis
41|Juan Iglesias|Getafe CF
42|Alex Sola|Getafe CF
43|Nabil Aberdin|Getafe CF
44|Peter Federico|Getafe CF
45|David Soria|Getafe CF
46|Javi Lopez|Real Sociedad
47|Jon Pacheco|Real Sociedad
48|Igor Zubeldia|Real Sociedad
49|Luka Sucic|Real Sociedad
50|Alex Remiro|Real Sociedad
51|Jules Kounde|FC Barcelona
52|Alejandro Balde|FC Barcelona
53|Marc Casado|FC Barcelona
54|Fermin Lopez|FC Barcelona
55|Gerard Martin|FC Barcelona
56|Sandro Ramirez|UD Las Palmas
57|Marvin Park|UD Las Palmas
58|Fabio Silva|UD Las Palmas
59|Alex Suarez|UD Las Palmas
60|Jasper Cillessen|UD Las Palmas
61|Enzo Boyomo|CA Osasuna
62|Jesus Areso|CA Osasuna
63|Abel Bretones|CA Osasuna
64|Jorge Herrando|CA Osasuna
65|Sergio Herrera|CA Osasuna
66|Inaki Williams|Athletic Club
67|Dani Vivian|Athletic Club
68|Alvaro Djalo|Athletic Club
69|Yeray Alvarez|Athletic Club
70|Julen Agirrezabala|Athletic Club
71|Antonio Blanco|D. Alaves
72|Tomas Conechny|D. Alaves
73|Nahuel Tenaglia|D. Alaves
74|Luka Romero|D. Alaves
75|Antonio Sivera|D. Alaves
76|Lucas Rosa|Real Valladolid CF
77|Ivan Sanchez|Real Valladolid CF
78|Eray Comert|Real Valladolid CF
79|Selim Amallah|Real Valladolid CF
80|Karl Hein|Real Valladolid CF
81|Willy Kambwala|Villarreal CF
82|Raul Albiol|Villarreal CF
83|Logan Costa|Villarreal CF
84|Thierno Barry|Villarreal CF
85|Diego Conde|Villarreal CF
86|Omar El Hilali|RCD Espanyol
87|Jofre Carreras|RCD Espanyol
88|Marash Kumbulla|RCD Espanyol
89|Carlos Romero|RCD Espanyol
90|Joan Garcia|RCD Espanyol
91|Yaser Asprilla|Girona FC
92|Arnaut Danjuma|Girona FC
93|Alejandro Frances|Girona FC
94|Gabriel Misehouy|Girona FC
95|Paulo Gazzaniga|Girona FC
96|Nahuel Molina|Atletico de Madrid
97|Koke|Atletico de Madrid
98|Cesar Azpilicueta|Atletico de Madrid
99|Jose Maria Gimenez|Atletico de Madrid
100|Jan Oblak|Atletico de Madrid`);
  add('Base Mezzanine','base',`101|Diego Lopez|Valencia CF
102|David Otorbi|Valencia CF
103|Javi Guerra|Valencia CF
104|Giorgi Mamardashvili|Valencia CF
105|Samu Costa|RCD Mallorca
106|Vedat Muriqi|RCD Mallorca
107|Takuma Asano|RCD Mallorca
108|Juan Soriano|CD Leganes
109|Seydouba Cisse|CD Leganes
110|Juan Cruz|CD Leganes
111|Kylian Mbappe|Real Madrid
112|Vini Jr.|Real Madrid
113|Jude Bellingham|Real Madrid
114|Federico Valverde|Real Madrid
115|Rodrygo|Real Madrid
116|Endrick|Real Madrid
117|Arda Guler|Real Madrid
118|Brahim Diaz|Real Madrid
119|Eduardo Camavinga|Real Madrid
120|Thibaut Courtois|Real Madrid
121|Oscar Mingueza|RC Celta
122|Hugo Alvarez|RC Celta
123|Fran Beltran|RC Celta
124|Isaac Romero|Sevilla FC
125|Juanlu Sanchez|Sevilla FC
126|Dodi Lukebakio|Sevilla FC
127|Orjan Nyland|Sevilla FC
128|Sergio Camello|Rayo Vallecano
129|Unai Lopez|Rayo Vallecano
130|Jorge de Frutos|Rayo Vallecano
131|Vitor Roque|Real Betis
132|Johnny Cardoso|Real Betis
133|Abde Ezzalzouli|Real Betis
134|Natan|Real Betis
135|Assane Diao|Real Betis
136|Sergi Altimira|Real Betis
137|Hector Bellerin|Real Betis
138|Giovani Lo Celso|Real Betis
139|Christantus Uche|Getafe CF
140|Borja Mayoral|Getafe CF
141|Bertug Yildirim|Getafe CF
142|Takefusa Kubo|Real Sociedad
143|Martin Zubimendi|Real Sociedad
144|Sergio Gomez|Real Sociedad
145|Brais Mendez|Real Sociedad
146|Mikel Oyarzabal|Real Sociedad
147|Benat Turrientes|Real Sociedad
148|Ander Barrenetxea|Real Sociedad
149|Nayef Aguerd|Real Sociedad
150|Lamine Yamal|FC Barcelona
151|Gavi|FC Barcelona
152|Pedri|FC Barcelona
153|Robert Lewandowski|FC Barcelona
154|Raphinha|FC Barcelona
155|Pau Cubarsi|FC Barcelona
156|Marc Bernal|FC Barcelona
157|Dani Olmo|FC Barcelona
158|Ferran Torres|FC Barcelona
159|Marc-Andre ter Stegen|FC Barcelona
160|Mika Marmol|UD Las Palmas
161|Alberto Moleiro|UD Las Palmas
162|Oliver McBurnie|UD Las Palmas
163|Aimar Oroz|CA Osasuna
164|Bryan Zaragoza|CA Osasuna
165|Raul Garcia|CA Osasuna
166|Nico Williams|Athletic Club
167|Oihan Sancet|Athletic Club
168|Benat Prados|Athletic Club
169|Mikel Jauregizar|Athletic Club
170|Unai Gomez|Athletic Club
171|Aitor Paredes|Athletic Club
172|Carlos Vicente|D. Alaves
173|Manu Sanchez|D. Alaves
174|Abdel Abqar|D. Alaves
175|Raul Moro|Real Valladolid CF
176|Kike Perez|Real Valladolid CF
177|Juanmi Latasa|Real Valladolid CF
178|Sergi Cardona|Villarreal CF
179|Yeremy Pino|Villarreal CF
180|Alex Baena|Villarreal CF
181|Ilias Akhomach|Villarreal CF
182|Alejo Veliz|RCD Espanyol
183|Javi Puado|RCD Espanyol
184|Walid Cheddira|RCD Espanyol
185|Bryan Gil|Girona FC
186|Ivan Martin|Girona FC
187|Abel Ruiz|Girona FC
188|Yangel Herrera|Girona FC
189|Viktor Tsygankov|Girona FC
190|Miguel Gutierrez|Girona FC
191|Julian Alvarez|Atletico de Madrid
192|Conor Gallagher|Atletico de Madrid
193|Robin Le Normand|Atletico de Madrid
194|Rodrigo de Paul|Atletico de Madrid
195|Marcos Llorente|Atletico de Madrid
196|Samuel Lino|Atletico de Madrid
197|Antoine Griezmann|Atletico de Madrid
198|Alexander Sorloth|Atletico de Madrid
199|Rodrigo Riquelme|Atletico de Madrid
200|Pablo Barrios|Atletico de Madrid`);
  add('Base Field Level','base',`201|Oihan Sancet|Athletic Club
202|Nico Williams|Athletic Club
203|Aitor Paredes|Athletic Club
204|Julian Alvarez|Atletico de Madrid
205|Conor Gallagher|Atletico de Madrid
206|Samuel Lino|Atletico de Madrid
207|Robin Le Normand|Atletico de Madrid
208|Aimar Oroz|CA Osasuna
209|Bryan Zaragoza|CA Osasuna
210|Sebastien Haller|CD Leganes
211|Renato Tapia|CD Leganes
212|Manu Sanchez|D. Alaves
213|Abdel Abqar|D. Alaves
214|Lamine Yamal|FC Barcelona
215|Gavi|FC Barcelona
216|Pedri|FC Barcelona
217|Pau Cubarsi|FC Barcelona
218|Christantus Uche|Getafe CF
219|Mauro Arambarri|Getafe CF
220|Bryan Gil|Girona FC
221|Ivan Martin|Girona FC
222|Sergio Camello|Rayo Vallecano
223|Jorge de Frutos|Rayo Vallecano
224|Fran Beltran|RC Celta
225|Oscar Mingueza|RC Celta
226|Alejo Veliz|RCD Espanyol
227|Marash Kumbulla|RCD Espanyol
228|Samu Costa|RCD Mallorca
229|Vedat Muriqi|RCD Mallorca
230|Johnny Cardoso|Real Betis
231|Abde Ezzalzouli|Real Betis
232|Kylian Mbappe|Real Madrid
233|Vini Jr.|Real Madrid
234|Jude Bellingham|Real Madrid
235|Endrick|Real Madrid
236|Takefusa Kubo|Real Sociedad
237|Martin Zubimendi|Real Sociedad
238|Mikel Oyarzabal|Real Sociedad
239|Raul Moro|Real Valladolid CF
240|Juanmi Latasa|Real Valladolid CF
241|Isaac Romero|Sevilla FC
242|Juanlu Sanchez|Sevilla FC
243|Mika Marmol|UD Las Palmas
244|Alberto Moleiro|UD Las Palmas
245|Giorgi Mamardashvili|Valencia CF
246|Javi Guerra|Valencia CF
247|Hugo Duro|Valencia CF
248|Yeremy Pino|Villarreal CF
249|Alex Baena|Villarreal CF
250|Ilias Akhomach|Villarreal CF`);
  add('Autographed Memorabilia','auto-relic',`1|Lamine Yamal|FC Barcelona
2|Nico Williams|Athletic Club
3|Endrick|Real Madrid
4|Ronald Araujo|FC Barcelona
5|Samuel Lino|Atletico de Madrid
6|Vedat Muriqi|RCD Mallorca
7|Hugo Duro|Valencia CF
8|Martin Zubimendi|Real Sociedad
9|Bryan Zaragoza|CA Osasuna
10|Gerard Moreno|Villarreal CF`,['AUTO','RELIC']);
  window.CS_SET_META[id]={parallels:['Blue','Checkerboard','Flash','Green Ice','Honeycomb','Multi-Color','Peacock','Purple Mojo','Red','Silver','White Sparkle','Zebra','Pink Mojo /179','Purple /99','Bronze Checker /59','Red Wave /59','Orange /49','Winter Camo /30','Jade Dragon Scale /28','Tie-Dye /25','White /20','Pink Wave /13','Gold /10','Gold Mojo /10','Gold Wave /10','Green /5','Black 1/1'],source:'Checklist Insider',verified:'2026-10-03'};
})();
