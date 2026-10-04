(() => {
 const catalog=window.CS_CATALOG;if(!catalog)return;const id='panini-select-la-liga-2024-25';catalog.checklists[id]=catalog.checklists[id]||[];
 const add=(subset,category,text,flags=0)=>{const list=catalog.checklists[id],seen=new Set(list.map(r=>`${r?.[0]}|${String(r?.[1]||'').toLowerCase()}|${String(r?.[4]||'').toLowerCase()}`));for(const line of text.trim().split('\n').filter(Boolean)){const p=line.split('|');const row=[p[0],p[1],p[2],flags,subset,category];const k=`${row[0]}|${row[1].toLowerCase()}|${subset.toLowerCase()}`;if(!seen.has(k)){list.push(row);seen.add(k);}}};
 add('Select Swatches','relic',`1|Vini Jr.|Real Madrid
2|Raphinha|FC Barcelona
3|Carlos Vicente|D. Alaves
4|Inaki Williams|Athletic Club
5|Robin Le Normand|Atletico de Madrid
6|Carles Perez|Getafe CF
7|Brais Mendez|Real Sociedad
8|Adria Pedrosa|Sevilla FC
9|Marcos Llorente|Atletico de Madrid
10|Vedat Muriqi|RCD Mallorca
11|Iago Aspas|RC Celta
12|Cristhian Mosquera|Valencia CF
13|Rodrygo|Real Madrid
14|Ante Budimir|CA Osasuna
15|Sergio Camello|Rayo Vallecano
16|Juan Foyth|Villarreal CF
17|Dani Carvajal|Real Madrid
18|Mika Marmol|UD Las Palmas
19|Samuel Lino|Atletico de Madrid
20|Pau Cubarsi|FC Barcelona
21|Oscar Mingueza|RC Celta
22|Hector Bellerin|Real Betis
23|Gorka Guruzeta|Athletic Club
24|Marc Bernal|FC Barcelona
25|Donny van de Beek|Girona FC
26|Lucien Agoume|Sevilla FC
27|Logan Costa|Villarreal CF
28|Sergio Gomez|Real Sociedad
29|Giovani Lo Celso|Real Betis
30|Javi Guerra|Valencia CF`,['RELIC']);
 add('Artistic Impressions','insert',`1|Abde Ezzalzouli|Real Betis
2|Oihan Sancet|Athletic Club
3|Alexander Sorloth|Atletico de Madrid
4|Pablo Barrios|Atletico de Madrid
5|Aimar Oroz|CA Osasuna
6|Dani Olmo|FC Barcelona
7|Jan Oblak|Atletico de Madrid
8|Pau Cubarsi|FC Barcelona
9|Vitor Roque|Real Betis
10|Arda Guler|Real Madrid
11|Eduardo Camavinga|Real Madrid
12|Endrick|Real Madrid
13|Rodrygo|Real Madrid
14|Thibaut Courtois|Real Madrid
15|Alejandro Balde|FC Barcelona
16|Giorgi Mamardashvili|Valencia CF
17|Javi Guerra|Valencia CF
18|Yeremy Pino|Villarreal CF
19|Isaac Romero|Sevilla FC
20|Valentin Barco|Sevilla FC
21|Fermin Lopez|FC Barcelona
22|Nico Williams|Athletic Club
23|Diego Lopez|Valencia CF
24|Borja Iglesias|RC Celta
25|Hugo Alvarez|RC Celta`);
 add('Equalizers','insert',`1|Inaki Williams|Athletic Club
2|Marcos Llorente|Atletico de Madrid
3|Ruben Garcia|CA Osasuna
4|Juan Cruz|CD Leganes
5|Toni Martinez|D. Alaves
6|Robert Lewandowski|FC Barcelona
7|Carles Perez|Getafe CF
8|Abel Ruiz|Girona FC
9|Viktor Tsygankov|Girona FC
10|Unai Lopez|Rayo Vallecano
11|Borja Iglesias|RC Celta
12|Javi Puado|RCD Espanyol
13|Dani Rodriguez|RCD Mallorca
14|Aitor Ruibal|Real Betis
15|Chimy Avila|Real Betis
16|Kylian Mbappe|Real Madrid
17|Brais Mendez|Real Sociedad
18|Raul Moro|Real Valladolid CF
19|Dodi Lukebakio|Sevilla FC
20|Isaac Romero|Sevilla FC
21|Kirian Rodriguez|UD Las Palmas
22|Sandro Ramirez|UD Las Palmas
23|Diego Lopez|Valencia CF
24|Ayoze Perez|Villarreal CF
25|Dani Parejo|Villarreal CF`);
 add('Select Future','insert',`1|Benat Prados|Athletic Club
2|Unai Gomez|Athletic Club
3|Pablo Barrios|Atletico de Madrid
4|Aimar Oroz|CA Osasuna
5|Luka Romero|D. Alaves
6|Marc Bernal|FC Barcelona
7|Pau Cubarsi|FC Barcelona
8|Christantus Uche|Getafe CF
9|Jhon Solis|Girona FC
10|Miguel Gutierrez|Girona FC
11|Sergio Camello|Rayo Vallecano
12|Williot Swedberg|RC Celta
13|Alejo Veliz|RCD Espanyol
14|Robert Navarro|RCD Mallorca
15|Assane Diao|Real Betis
16|Arda Guler|Real Madrid
17|Endrick|Real Madrid
18|David Otorbi|Valencia CF
19|Takefusa Kubo|Real Sociedad
20|Karl Hein|Real Valladolid CF
21|Jose Angel Carmona|Sevilla FC
22|Alberto Moleiro|UD Las Palmas
23|Cristhian Mosquera|Valencia CF
24|Jesus Vazquez|Valencia CF
25|Thierno Barry|Villarreal CF`);
 add('Snapshots','insert',`1|Yuri Berchiche|Athletic Club
2|Rodrigo Riquelme|Atletico de Madrid
3|Jon Moncayola|CA Osasuna
4|Lucas Torro|CA Osasuna
5|Juan Soriano|CD Leganes
6|Ander Guevara|D. Alaves
7|Jon Guridi|D. Alaves
8|Inigo Martinez|FC Barcelona
9|Djene|Getafe CF
10|Daley Blind|Girona FC
11|Adrian Embarba|Rayo Vallecano
12|Florian Lejeune|Rayo Vallecano
13|Ilaix Moriba|RC Celta
14|Jailson|RC Celta
15|Jose Gragera|RCD Espanyol
16|Johan Mojica|RCD Mallorca
17|Takuma Asano|RCD Mallorca
18|Johnny Cardoso|Real Betis
19|Dani Carvajal|Real Madrid
20|Javi Lopez|Real Sociedad
21|Luis Perez|Real Valladolid CF
22|Adria Pedrosa|Sevilla FC
23|Scott McKenna|UD Las Palmas
24|Luis Rioja|Valencia CF
25|Kiko Femenia|Villarreal CF`);
 add('Stained Glass','ssp',`1|Nico Williams|Athletic Club
2|Oihan Sancet|Athletic Club
3|Conor Gallagher|Atletico de Madrid
4|Julian Alvarez|Atletico de Madrid
5|Koke|Atletico de Madrid
6|Dani Olmo|FC Barcelona
7|Ferran Torres|FC Barcelona
8|Gavi|FC Barcelona
9|Lamine Yamal|FC Barcelona
10|Pau Cubarsi|FC Barcelona
11|Pedri|FC Barcelona
12|Robert Lewandowski|FC Barcelona
13|Giorgi Mamardashvili|Valencia CF
14|Bryan Zaragoza|CA Osasuna
15|Vitor Roque|Real Betis
16|Eder Militao|Real Madrid
17|Endrick|Real Madrid
18|Jude Bellingham|Real Madrid
19|Kylian Mbappe|Real Madrid
20|Rodrygo|Real Madrid
21|Vini Jr.|Real Madrid
22|Ander Barrenetxea|Real Sociedad
23|Gerard Moreno|Villarreal CF
24|Martin Zubimendi|Real Sociedad
25|Takefusa Kubo|Real Sociedad
26|Javi Guerra|Valencia CF
27|Alex Baena|Villarreal CF
28|Yeremy Pino|Villarreal CF
29|Diego Simeone|Atletico de Madrid
30|Carlo Ancelotti|Real Madrid`);
 add('Team Badges','insert',`1|Valencia CF|Valencia CF
2|RCD Mallorca|RCD Mallorca
3|CD Leganes|CD Leganes
4|Real Madrid|Real Madrid
5|RC Celta|RC Celta
6|Sevilla FC|Sevilla FC
7|Rayo Vallecano|Rayo Vallecano
8|Real Betis|Real Betis
9|Getafe CF|Getafe CF
10|Real Sociedad|Real Sociedad
11|FC Barcelona|FC Barcelona
12|UD Las Palmas|UD Las Palmas
13|CA Osasuna|CA Osasuna
14|Athletic Club|Athletic Club
15|D. Alaves|D. Alaves
16|Real Valladolid CF|Real Valladolid CF
17|Villarreal CF|Villarreal CF
18|RCD Espanyol|RCD Espanyol
19|Girona FC|Girona FC
20|Atletico de Madrid|Atletico de Madrid`);
 add('Unstoppable','insert',`1|Mikel Jauregizar|Athletic Club
2|Koke|Atletico de Madrid
3|Alejandro Catena|CA Osasuna
4|Sebastien Haller|CD Leganes
5|Sergio Gonzalez|CD Leganes
6|Kike Garcia|D. Alaves
7|Alejandro Balde|FC Barcelona
8|Jules Kounde|FC Barcelona
9|Diego Rico|Getafe CF
10|Luis Milla|Getafe CF
11|Cristhian Stuani|Girona FC
12|Oscar Valentin|Rayo Vallecano
13|Jonathan Bamba|RC Celta
14|Alex Kral|RCD Espanyol
15|Carlos Romero|RCD Espanyol
16|Antonio Raillo|RCD Mallorca
17|Pablo Fornals|Real Betis
18|Luka Modric|Real Madrid
19|Sergio Gomez|Real Sociedad
20|Kike Perez|Real Valladolid CF
21|Stanko Juric|Real Valladolid CF
22|Lucien Agoume|Sevilla FC
23|Javi Munoz|UD Las Palmas
24|Pepelu|Valencia CF
25|Santi Comesana|Villarreal CF`);
 add('Visionary','ssp',`1|Fran Beltran|RC Celta
2|Antoine Griezmann|Atletico de Madrid
3|Conor Gallagher|Atletico de Madrid
4|Julian Alvarez|Atletico de Madrid
5|Marcos Llorente|Atletico de Madrid
6|Samuel Lino|Atletico de Madrid
7|Ferran Torres|FC Barcelona
8|Marc Domenech|RCD Mallorca
9|Raphinha|FC Barcelona
10|Yaser Asprilla|Girona FC
11|Johnny Cardoso|Real Betis
12|Abel Ruiz|Girona FC
13|Aurelien Tchouameni|Real Madrid
14|Gabriel Misehouy|Girona FC
15|Federico Valverde|Real Madrid
16|Kylian Mbappe|Real Madrid
17|Brais Mendez|Real Sociedad
18|Mikel Oyarzabal|Real Sociedad
19|Alberto Moleiro|UD Las Palmas
20|Diego Lopez|Valencia CF
21|Hugo Duro|Valencia CF
22|Alex Baena|Villarreal CF
23|Ilias Akhomach|Villarreal CF
24|Marc-Andre ter Stegen|FC Barcelona
25|David Otorbi|Valencia CF`);
})();
