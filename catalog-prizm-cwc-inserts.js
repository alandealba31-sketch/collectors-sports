(() => {
 const catalog=window.CS_CATALOG;if(!catalog)return;const id='panini-prizm-club-world-cup-2025';catalog.checklists[id]=catalog.checklists[id]||[];
 const add=(subset,category,text)=>{const list=catalog.checklists[id],seen=new Set(list.map(r=>`${r?.[0]}|${String(r?.[1]||'').toLowerCase()}|${String(r?.[4]||'').toLowerCase()}`));for(const line of text.trim().split('\n').filter(Boolean)){const p=line.split('|');const row=[p[0],p[1],p[2]||'',0,subset,category];const k=`${row[0]}|${row[1].toLowerCase()}|${subset.toLowerCase()}`;if(!seen.has(k)){list.push(row);seen.add(k);}}};
 add('Continental Contenders','insert',`1|Salem Al-Dawsari|Al Hilal
2|Antoine Griezmann|Atletico de Madrid
3|Conor Gallagher|Atletico de Madrid
4|Agustin Marchesin|Boca Juniors
5|Nico Schlotterbeck|Borussia Dortmund
6|Pascal Gross|Borussia Dortmund
7|Bastos|Botafogo
8|Christopher Nkunku|Chelsea FC
9|Marc Guiu|Chelsea FC
10|Marcus Thuram|FC Internazionale Milano
11|Nicolo Barella|FC Internazionale Milano
12|Diogo Costa|FC Porto
13|William Gomes|FC Porto
14|Alan Varela|FC Porto
15|Nicolas de la Cruz|Flamengo
16|Pedro|Flamengo
17|Ganso|Fluminense
18|Manuel Locatelli|Juventus
19|Andrea Cambiaso|Juventus
20|Erling Haaland|Manchester City
21|Phil Foden|Manchester City
22|Felipe Anderson|Palmeiras
23|Eduardo Camavinga|Real Madrid
24|Kylian Mbappe|Real Madrid
25|Mads Bidstrup|FC Salzburg
26|Franco Armani|River Plate
27|Ryoma Watanabe|Urawa Red Diamonds
28|Antonio Silva|SL Benfica
29|Zeki Amdouni|SL Benfica
30|Yago Cariello|Ulsan HD FC`);
 add('Continental Pride','insert',`1|Alexander Sorloth|Atletico de Madrid
2|Diego Simeone|Atletico de Madrid
3|Edinson Cavani|Boca Juniors
4|Jefferson Savarino|Botafogo
5|Nicolas Jackson|Chelsea FC
6|Lautaro Martinez|FC Internazionale Milano
7|Giorgian de Arrascaeta|Flamengo
8|Ganso|Fluminense
9|Pavel Nedved|Juventus
10|Noni Madueke|Chelsea FC
11|Pep Guardiola|Manchester City
12|Estevao|Palmeiras
13|Mauricio|Palmeiras
14|Carlo Ancelotti|Real Madrid
15|David Beckham|Real Madrid
16|Jude Bellingham|Real Madrid
17|Luka Modric|Real Madrid
18|Franco Mastantuono|River Plate
19|Miguel Borja|River Plate
20|Angel Di Maria|SL Benfica`);
 add('En Fuego','insert',`1|Malcom|Al Hilal
2|Julian Alvarez|Atletico de Madrid
3|Thiago Santana|Urawa Red Diamonds
4|Goncalo Ramos|Paris Saint-Germain
5|Miguel Merentiel|Boca Juniors
6|Igor Jesus|Botafogo
7|Alexander Barboza|Botafogo
8|Taishi Matsumoto|Urawa Red Diamonds
9|Pedro Neto|Chelsea FC
10|Alessandro Bastoni|FC Internazionale Milano
11|Nicolo Barella|FC Internazionale Milano
12|Danny Namaso|FC Porto
13|Alan Varela|FC Porto
14|Pedro|Flamengo
15|German Cano|Fluminense
16|Lima|Fluminense
17|Dusan Vlahovic|Juventus
18|Harry Kane|FC Bayern München
19|Erling Haaland|Manchester City
20|Mateo Kovacic|Manchester City
21|Raphael Veiga|Palmeiras
22|Richard Rios|Palmeiras
23|Dani Carvajal|Real Madrid
24|Rodrygo|Real Madrid
25|Dorgeles Nene|FC Salzburg
26|Facundo Colidio|River Plate
27|Miguel Borja|River Plate
28|Santiago Simon|River Plate
29|Vangelis Pavlidis|SL Benfica
30|Kerem Akturkoglu|SL Benfica`);
 add('Inter-Continental','insert',`1|Aleksandar Mitrovic|Al Hilal
2|Angel Correa|Atletico de Madrid
3|Jose Maria Gimenez|Atletico de Madrid
4|Rodrigo de Paul|Atletico de Madrid
5|Exequiel Zeballos|Boca Juniors
6|Kevin Zenon|Boca Juniors
7|Serhou Guirassy|Borussia Dortmund
8|Alex Telles|Botafogo
9|Moises Caicedo|Chelsea FC
10|Nicolas Jackson|Chelsea FC
11|Lautaro Martinez|FC Internazionale Milano
12|Mehdi Taremi|FC Internazionale Milano
13|Ivan Marcano|FC Porto
14|Stephen Eustaquio|FC Porto
15|Gerson|Flamengo
16|Thiago Silva|Fluminense
17|Timothy Weah|Juventus
18|Weston McKennie|Juventus
19|Ederson|Manchester City
20|Savinho|Manchester City
21|Joaquin Piquerez|Palmeiras
22|Mauricio|Palmeiras
23|Eder Militao|Real Madrid
24|Federico Valverde|Real Madrid
25|Vini Jr.|Real Madrid
26|Samson Baidoo|FC Salzburg
27|Lucas Martinez Quarta|River Plate
28|Marius Hoibraten|Urawa Red Diamonds
29|Nicolas Otamendi|SL Benfica
30|Seung-Beom Ko|Ulsan HD FC`);
 add('Kaboom!','case-hit',`1|Antoine Griezmann|Atletico de Madrid
2|Julian Alvarez|Atletico de Madrid
3|Diego Maradona|Boca Juniors
4|Jamie Gittens|Borussia Dortmund
5|Cole Palmer|Chelsea FC
6|Samu Aghehowa|FC Porto
7|Alessandro Del Piero|Juventus
8|Dusan Vlahovic|Juventus
9|Pavel Nedved|Juventus
10|Zinedine Zidane|Juventus
11|Zlatan Ibrahimovic|Juventus
12|Erling Haaland|Manchester City
13|Kevin De Bruyne|Manchester City
14|Joao Neves|Paris Saint-Germain
15|Lionel Messi|Inter Miami CF
16|Estevao|Palmeiras
17|David Beckham|Real Madrid
18|Endrick|Real Madrid
19|Jude Bellingham|Real Madrid
20|Vini Jr.|Real Madrid`);
 add('Legendary Talents','insert',`1|David Villa|Atletico de Madrid
2|Diego Forlan|Atletico de Madrid
3|Diego Maradona|Boca Juniors
4|Didier Drogba|Chelsea FC
5|Eden Hazard|Chelsea FC
6|Ronaldo|FC Internazionale Milano
7|Wesley Sneijder|FC Internazionale Milano
8|Diego Milito|FC Internazionale Milano
9|Alessandro Del Piero|Juventus
10|Gianluigi Buffon|Juventus
11|Pavel Nedved|Juventus
12|Zinedine Zidane|Juventus
13|Zlatan Ibrahimovic|Juventus
14|David Silva|Manchester City
15|Sergio Aguero|Manchester City
16|David Beckham|Real Madrid
17|Fabio Cannavaro|Real Madrid
18|Luis Figo|Real Madrid
19|Roberto Carlos|Real Madrid
20|Ruud van Nistelrooy|Real Madrid`);
 add('New Era','insert',`1|Pablo Barrios|Atletico de Madrid
2|Aaron Anselmino|Chelsea FC
3|Cole Campbell|Borussia Dortmund
4|Cuiabano|Botafogo
5|Tyrique George|Chelsea FC
6|Josh Acheampong|Chelsea FC
7|Giacomo De Pieri|FC Internazionale Milano
8|Samu Aghehowa|FC Porto
9|Wesley|Flamengo
10|Martinelli|Fluminense
11|Samuel Mbangula|Juventus
12|Vasilije Adzic|Juventus
13|Abdukodir Khusanov|Manchester City
14|Deniz Gul|FC Porto
15|Arda Guler|Real Madrid
16|Endrick|Real Madrid
17|Jacobo Ramon|Real Madrid
18|Oscar Gloukh|FC Salzburg
19|Ian Subiabre|River Plate
20|Gianluca Prestianni|SL Benfica`);
 add('Pitch Crowns','insert',`1|Giuliano Simeone|Atletico de Madrid
2|Bradley Barcola|Paris Saint-Germain
3|Edinson Cavani|Boca Juniors
4|Christian Pulisic|Borussia Dortmund
5|Igor Jesus|Botafogo
6|Cole Palmer|Chelsea FC
7|Eden Hazard|Chelsea FC
8|Marcus Thuram|FC Internazionale Milano
9|Nicolo Barella|FC Internazionale Milano
10|Pedro|Flamengo
11|Jhon Arias|Fluminense
12|Warren Zaire-Emery|Paris Saint-Germain
13|Harry Kane|FC Bayern München
14|Omar Marmoush|Manchester City
15|Estevao|Palmeiras
16|Richard Rios|Palmeiras
17|Kylian Mbappe|Real Madrid
18|Karim Konate|FC Salzburg
19|Ian Subiabre|River Plate
20|Kerem Akturkoglu|SL Benfica`);
 add('Prizmania','ssp',`1|Lionel Messi|Inter Miami CF
2|Cole Palmer|Chelsea FC
3|Didier Drogba|Chelsea FC
4|Erling Haaland|Manchester City
5|Kevin De Bruyne|Manchester City
6|Phil Foden|Manchester City
7|Endrick|Real Madrid
8|Zinedine Zidane|Real Madrid`);
 add('Prizmatic','insert',`1|Sergej Milinkovic-Savic|Al Hilal
2|Robin Le Normand|Atletico de Madrid
3|Nahuel Molina|Atletico de Madrid
4|Edinson Cavani|Boca Juniors
5|Giovanni Reyna|Borussia Dortmund
6|Waldemar Anton|Borussia Dortmund
7|Igor Jesus|Botafogo
8|Cole Palmer|Chelsea FC
9|Nicolas Jackson|Chelsea FC
10|Lautaro Martinez|FC Internazionale Milano
11|Piotr Zielinski|FC Internazionale Milano
12|Danilo Boza|Urawa Red Diamonds
13|Pepe|FC Porto
14|Nicolas de la Cruz|Flamengo
15|Fabio|Fluminense
16|Shusaku Nishikawa|Urawa Red Diamonds
17|Kenan Yildiz|Juventus
18|Khephren Thuram|Juventus
19|Bernardo Silva|Manchester City
20|Gianluigi Donnarumma|Paris Saint-Germain
21|Ruben Dias|Manchester City
22|Jose Lopez|Palmeiras
23|Aurelien Tchouameni|Real Madrid
24|Jude Bellingham|Real Madrid
25|Thibaut Courtois|Real Madrid
26|Facundo Colidio|River Plate
27|Angel Di Maria|SL Benfica
28|Florentino Luis|SL Benfica
29|Fredrik Aursnes|SL Benfica
30|Won-Sang Um|Ulsan HD FC`);
 add('Team Badges Logo','insert',`1|Atletico de Madrid|Atletico de Madrid
2|Boca Juniors|Boca Juniors
3|Borussia Dortmund|Borussia Dortmund
4|Botafogo|Botafogo
5|CF Monterrey|CF Monterrey
6|Chelsea FC|Chelsea FC
7|Urawa Red Diamonds|Urawa Red Diamonds
8|FC Internazionale Milano|FC Internazionale Milano
9|FC Porto|FC Porto
10|Flamengo|Flamengo
11|Fluminense|Fluminense
12|Juventus|Juventus
13|Manchester City|Manchester City
14|CF Pachuca|CF Pachuca
15|Palmeiras|Palmeiras
16|Real Madrid|Real Madrid
17|FC Salzburg|FC Salzburg
18|River Plate|River Plate
19|SL Benfica|SL Benfica
20|Ulsan HD FC|Ulsan HD FC`);
 add('The Logo','ssp',`1|FIFA Club World Cup Logo|FIFA Club World Cup`);
 add('The Trophy','ssp',`1|FIFA Club World Cup Trophy|FIFA Club World Cup`);
 add('Widescreen','insert',`1|Alexander Sorloth|Atletico de Madrid
2|Antoine Griezmann|Atletico de Madrid
3|Edinson Cavani|Boca Juniors
4|Maximilian Beier|Borussia Dortmund
5|Giovanni Reyna|Borussia Dortmund
6|Jefferson Savarino|Botafogo
7|Cole Palmer|Chelsea FC
8|Matheus Savio|Urawa Red Diamonds
9|Federico Dimarco|FC Internazionale Milano
10|Marcus Thuram|FC Internazionale Milano
11|Samu Aghehowa|FC Porto
12|Giorgian de Arrascaeta|Flamengo
13|Jhon Arias|Fluminense
14|Kenan Yildiz|Juventus
15|Matheus Nunes|Manchester City
16|Phil Foden|Manchester City
17|Estevao|Palmeiras
18|Kylian Mbappe|Real Madrid
19|Franco Mastantuono|River Plate
20|Orkun Kokcu|SL Benfica`);
})();
