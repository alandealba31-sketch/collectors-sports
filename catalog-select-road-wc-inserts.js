(() => {
 const catalog=window.CS_CATALOG;if(!catalog)return;const id='panini-select-road-to-world-cup-2025-26';catalog.checklists[id]=catalog.checklists[id]||[];
 const add=(subset,category,text)=>{const list=catalog.checklists[id],seen=new Set(list.map(r=>`${r?.[0]}|${String(r?.[1]||'').toLowerCase()}|${String(r?.[4]||'').toLowerCase()}`));for(const line of text.trim().split('\n').filter(Boolean)){const p=line.split('|');const row=[p[0],p[1],p[2]||'',0,subset,category];const k=`${row[0]}|${row[1].toLowerCase()}|${subset.toLowerCase()}`;if(!seen.has(k)){list.push(row);seen.add(k);}}};
 add('Artistic Impressions','case-hit',`1|Bukayo Saka|England
2|Kylian Mbappe|France
3|Viktor Gyokeres|Sweden
4|Jamal Musiala|Germany
5|Martin Odegaard|Norway
6|Cole Palmer|England
7|Cristiano Ronaldo|Portugal
8|Nico Williams|Spain
9|Nico Paz|Argentina
10|Lionel Messi|Argentina
11|Gianluigi Donnarumma|Italy
12|Nick Woltemade|Germany
13|Mika Biereth|Denmark
14|Moise Kean|Italy
15|Achraf Hakimi|Morocco
16|Cody Gakpo|Netherlands
17|Wesley Sneijder|Netherlands
18|Michel Platini|France
19|Miroslav Klose|Germany
20|Ronaldo|Brazil
21|Luis Figo|Portugal
22|Zinedine Zidane|France
23|Diego Maradona|Argentina
24|Franz Beckenbauer|Germany
25|Pele|Brazil`);
 add('Equalizers','insert',`1|Joshua Kimmich|Germany
2|Daniel James|Cymru
3|Oscar Bobb|Norway
4|Jhon Cordoba|Colombia
5|Hee-chan Hwang|Korea Republic
6|Benjamin Sesko|Slovenia
7|Pierre-Emile Hojbjerg|Denmark
8|Kasper Schmeichel|Denmark
9|Hirving Lozano|Mexico
10|Mattia Zaccagni|Italy
11|Franjo Ivanovic|Croatia
12|Robert Lewandowski|Poland
13|Ollie Watkins|England
14|Alexander Isak|Sweden
15|Cristiano Ronaldo|Portugal
16|Ismael Saibari|Morocco
17|Lionel Messi|Argentina
18|Romelu Lukaku|Belgium
19|Jae-sung Lee|Korea Republic
20|Nico Williams|Spain
21|Marcus Thuram|France
22|Christian Pulisic|United States
23|Xavi Simons|Netherlands
24|Ruben Vargas|Switzerland
25|Raphinha|Brazil`);
 add('Select Future','insert',`1|Nico Paz|Argentina
2|Jesus Rodriguez|Spain
3|Franco Mastantuono|Argentina
4|Malick Fofana|Belgium
5|Myles Lewis-Skelly|England
6|Lucas Bergvall|Sweden
7|Eliesse Ben Seghir|Morocco
8|Andrey Santos|Brazil
9|Elliot Anderson|England
10|Zeno Debast|Belgium
11|Rayan Cherki|France
12|Victor Froholdt|Denmark
13|Paul Nebel|Germany
14|Nick Woltemade|Germany
15|Gianluca Prestianni|Argentina
16|Pio Esposito|Italy
17|Gilberto Mora|Mexico
18|Min-Hyuk Yang|Korea Republic
19|Bart Verbruggen|Netherlands
20|Antonio Nusa|Norway
21|Nnamdi Collins|Germany
22|Pau Cubarsi|Spain
23|Dean Huijsen|Spain
24|Endrick|Brazil
25|Johan Manzambi|Switzerland`);
 add('Snapshots','insert',`1|Viktor Gyokeres|Sweden
2|Ruben Dias|Portugal
3|Yassine Bounou|Morocco
4|Aleksandar Mitrovic|Serbia
5|Nico Gonzalez|Argentina
6|Kevin De Bruyne|Belgium
7|Heung-Min Son|Korea Republic
8|Mikel Oyarzabal|Spain
9|Jaka Bijol|Slovenia
10|Eduardo Camavinga|France
11|Timothy Weah|United States
12|Cody Gakpo|Netherlands
13|Fabian Rieder|Switzerland
14|Sadio Mane|Senegal
15|Bruno Guimaraes|Brazil
16|Kai Havertz|Germany
17|Giovanni Di Lorenzo|Italy
18|Reece James|England
19|Bruno Fernandes|Portugal
20|Alexis Mac Allister|Argentina
21|Thibaut Courtois|Belgium
22|Pedri|Spain
23|Jules Kounde|France
24|Matt Freese|United States
25|Vini Jr.|Brazil`);
 add('Stained Glass','case-hit',`1|Robert Lewandowski|Poland
2|Lautaro Martinez|Argentina
3|Kevin De Bruyne|Belgium
4|Harry Kane|England
5|Angel Di Maria|Argentina
6|Pio Esposito|Italy
7|Cristiano Ronaldo|Portugal
8|Luis Diaz|Colombia
9|Desire Doue|France
10|Lionel Messi|Argentina
11|Jude Bellingham|England
12|Erling Haaland|Norway
13|Luka Modric|Croatia
14|Virgil van Dijk|Netherlands
15|Florian Wirtz|Germany
16|Pedri|Spain
17|Gianluigi Buffon|Italy
18|Manuel Neuer|Germany
19|Thierry Henry|France
20|Steven Gerrard|England
21|Gareth Bale|Cymru
22|Zlatan Ibrahimovic|Sweden
23|Diego Maradona|Argentina
24|Franz Beckenbauer|Germany
25|Pele|Brazil`);
 add('Team Badges','case-hit',`1|Germany|Germany
2|Cymru|Cymru
3|Norway|Norway
4|Colombia|Colombia
5|Senegal|Senegal
6|Uruguay|Uruguay
7|Denmark|Denmark
8|Nigeria|Nigeria
9|Brazil|Brazil
10|Mexico|Mexico
11|Czechia|Czechia
12|Italy|Italy
13|Croatia|Croatia
14|Poland|Poland
15|England|England
16|Sweden|Sweden
17|Portugal|Portugal
18|Morocco|Morocco
19|Serbia|Serbia
20|Argentina|Argentina
21|Belgium|Belgium
22|Korea Republic|Korea Republic
23|Spain|Spain
24|Slovenia|Slovenia
25|France|France
26|United States|United States
27|Netherlands|Netherlands
28|Switzerland|Switzerland`);
 add('Unstoppable','insert',`1|Jamal Musiala|Germany
2|Harry Wilson|Cymru
3|Alexander Sorloth|Norway
4|Luis Diaz|Colombia
5|In-Beom Hwang|Korea Republic
6|Giorgian de Arrascaeta|Uruguay
7|Matt O'Riley|Denmark
8|Alex Iwobi|Nigeria
9|Christian Eriksen|Denmark
10|Edson Alvarez|Mexico
11|Ladislav Krejci|Czechia
12|Manuel Locatelli|Italy
13|Luka Modric|Croatia
14|Sebastian Szymanski|Poland
15|Jarrod Bowen|England
16|Maximilian Mittelstadt|Germany
17|Moise Kean|Italy
18|Morgan Rogers|England
19|Vitinha|Portugal
20|Thiago Almada|Argentina
21|Jeremy Doku|Belgium
22|Lamine Yamal|Spain
23|Aurelien Tchouameni|France
24|Yunus Musah|United States
25|Sandi Lovric|Slovenia`);
 add('Visionary','case-hit',`1|Benjamin Sesko|Slovenia
2|Lamine Yamal|Spain
3|Phil Foden|England
4|Vini Jr.|Brazil
5|Christian Pulisic|United States
6|Kai Havertz|Germany
7|Cristiano Ronaldo|Portugal
8|Julian Alvarez|Argentina
9|Alexander Isak|Sweden
10|Lionel Messi|Argentina
11|Malick Fofana|Belgium
12|Gilberto Mora|Mexico
13|Michael Olise|France
14|Heung-Min Son|Korea Republic
15|Thomas Muller|Germany
16|Paolo Maldini|Italy
17|Robin van Persie|Netherlands
18|Diego Maradona|Argentina
19|Franz Beckenbauer|Germany
20|Pele|Brazil
21|Victor Froholdt|Denmark
22|Gabriel Batistuta|Argentina`);
})();
