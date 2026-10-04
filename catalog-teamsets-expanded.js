(() => {
  const catalog=window.CS_CATALOG;if(!catalog)return;
  catalog.checklists=catalog.checklists||{};window.CS_SET_META=window.CS_SET_META||{};
  const ensure=(id,data)=>{let c=catalog.collections.find(x=>x.id===id);if(c)Object.assign(c,data);else catalog.collections.push({id,...data});catalog.checklists[id]=catalog.checklists[id]||[];};
  const add=(id,subset,category,team,lines,flags=0)=>{const list=catalog.checklists[id];const seen=new Set(list.map(r=>`${r?.[0]}|${String(r?.[1]||'').toLowerCase()}|${String(r?.[4]||'').toLowerCase()}`));for(const line of lines.trim().split('\n').filter(Boolean)){const [num,...rest]=line.split('|');const player=rest.join('|');const row=[num,player,team,flags,subset,category];const k=`${num}|${player.toLowerCase()}|${subset.toLowerCase()}`;if(!seen.has(k)){list.push(row);seen.add(k);}}};
  const rows=(id,team,subset,lines,category='insert')=>add(id,subset,category,team,lines,0);
  const autos=(id,team,subset,lines)=>add(id,subset,'autograph',team,lines,['AUTO']);

  // CHELSEA 2025/26
  const CHE='topps-chelsea-team-set-2025-26';
  ensure(CHE,{sport:'Soccer',manufacturer:'Topps',year:'2025/26',name:'Topps Chelsea Team Set 2025/26',shortName:'Chelsea Team Set 25/26',coverage:'full-checklist-expanded',sourceUrl:'https://www.checklistinsider.com/2025-26-topps-chelsea-team-set'});
  rows(CHE,'Chelsea','First Team',`1|Robert Sanchez
2|Reece James
3|Levi Colwill
4|Tosin Adarabioyo
5|Josh Acheampong
6|Harrison Murray-Campbell
7|Marc Cucurella
8|Jorrel Hato
9|Dário Essugo
10|Moisés Caicedo
11|Andrey Santos
12|Enzo Fernández
13|Cole Palmer
14|Liam Delap
15|Jamie Gittens
16|Joao Pedro
17|Pedro Neto
18|Shumaira Mheuka
19|Alejandro Garnacho
20|Estêvão Willian`,'base');
  rows(CHE,'Chelsea','Bona Fide Baller',`21|Frank Lampard
22|Cole Palmer
23|Eden Hazard
24|Estêvão Willian
25|Didier Drogba`);
  rows(CHE,'Chelsea','Pitch Pursuits',`26|Enzo Fernández
27|Andrey Santos
28|Liam Delap
29|Maika Hamano
30|Willian
31|Joao Pedro
32|Facundo Buonanotte
33|Mayra Ramírez
34|Pedro Neto
35|Estêvão Willian`);
  rows(CHE,'Chelsea',"Collector's Corner",`36|Reece James
37|Juan Mata
38|Deco
39|Cesc Fabregas
40|Guro Reiten`);
  rows(CHE,'Chelsea','Waving Flag',`41|José Mourinho
42|Petr Cech
43|John Terry
44|Ashley Cole
45|Naomi Girma
46|Frank Lampard
47|Michael Ballack
48|Michael Essien
49|Diego Costa
50|Didier Drogba`);
  autos(CHE,'Chelsea','Base Autographs',`BA-AC|Ashley Cole
BA-AS|Andriy Shevchenko
BA-CF|Cesc Fabregas
BA-CM|Claude Makélélé
BA-DE|Deco
BA-DI|Kerry Dixon
BA-DW|Dennis Wise
BA-EC|Erin Cuthbert
BA-EG|Eidur Gudjohnsen
BA-ES|Estêvão Willian
BA-GL|Graeme Le Saux
BA-GP|Gustavo Poyet
BA-HC|Hernán Crespo
BA-HM|Harrison Murray-Campbell
BA-JC|Joe Cole
BA-JF|Jimmy Floyd Hasselbaink
BA-JG|Jamie Gittens
BA-JM|José Mourinho
BA-JP|Joao Pedro
BA-JT|John Terry
BA-JU|Juan Mata
BA-ME|Michael Essien
BA-MH|Maika Hamano
BA-MR|Mayra Ramírez
BA-RC|Ricardo Carvalho
BA-RD|Roberto Di Matteo
BA-RG|Ruud Gullit
BA-TA|Tosin Adarabioyo
BA-TF|Tore André Flo
BA-WP|Shaun Wright-Phillips`);
  autos(CHE,'Chelsea','Bona Fide Baller Autographs',`BB-CP|Cole Palmer
BB-DC|Diego Costa
BB-DD|Didier Drogba
BB-EH|Eden Hazard
BB-FL|Frank Lampard
BB-GR|Guro Reiten
BB-GZ|Gianfranco Zola
BB-LB|Lucy Bronze
BB-LJ|Lauren James
BB-MB|Michael Ballack
BB-MD|Marcel Desailly
BB-NA|Nicolas Anelka
BB-SK|Sam Kerr
BB-WI|Willian`);
  rows(CHE,'Chelsea','Rainbow Flick',`RF-1|Ashley Cole
RF-2|Reece James
RF-3|Jorrel Hato
RF-4|David Luiz
RF-5|Naomi Girma
RF-6|Moisés Caicedo
RF-7|Enzo Fernández
RF-8|Juan Mata
RF-9|Frank Lampard
RF-10|Guro Reiten
RF-11|Andriy Shevchenko
RF-12|Alejandro Garnacho
RF-13|Cole Palmer
RF-14|Jamie Gittens
RF-15|Nicolas Anelka
RF-16|Willian
RF-17|Mayra Ramírez
RF-18|Maika Hamano
RF-19|Didier Drogba
RF-20|Eden Hazard
RF-21|Joao Pedro
RF-22|Pedro Neto
RF-23|Shumaira Mheuka
RF-24|Liam Delap
RF-25|Estêvão Willian`,'case-hit');
  window.CS_SET_META[CHE]={parallels:['Halo','Static Foil','Blue Rainbow Foil /150','Blue Icy Foil /150','Green Rainbow Foil /99','Green Icy Foil /99','Purple Rainbow Foil /75','Purple Icy Foil /75','Gold Rainbow Foil /50','Gold Icy Foil /50','Orange Rainbow Foil /25','Orange Icy Foil /25','Black Rainbow Foil /10','Black Icy Foil /10','Red Rainbow Foil /5','Red Icy Foil /5','Gold FoilFractor 1/1'],source:'Checklist Insider',verified:'2026-10-03'};

  // BENFICA 2025/26
  const BEN='topps-benfica-team-set-2025-26';
  ensure(BEN,{sport:'Soccer',manufacturer:'Topps',year:'2025/26',name:'Topps SL Benfica Team Set 2025/26',shortName:'Benfica Team Set 25/26',coverage:'full-checklist-expanded',sourceUrl:'https://www.checklistinsider.com/2025-26-topps-sl-benfica-team-set'});
  rows(BEN,'Benfica','First Team',`1|Anatoliy Trubin
2|António Silva
3|Leandro Santos
4|Samuel Dahl
5|Tomás Araújo
6|Richard Ríos
7|Nicolás Otamendi
8|Amar Dedić
9|Fredrik Aursnes
10|João Veloso
11|Leandro Barreiro
12|Nuno Félix
13|Diogo Prioste
14|Enzo Barrenechea
15|João Rego
16|Vangelis Pavlidis
17|Georgiy Sudakov
18|Franjo Ivanović
19|Andreas Schjelderup
20|Gianluca Prestianni
21|Bruma`,'base');
  rows(BEN,'Benfica','Bona Fide Baller',`22|David Luiz
23|Rui Costa
24|Vangelis Pavlidis
25|Óscar Cardozo
26|Cloé Lacasse
27|Nuno Gomes`);
  rows(BEN,'Benfica','Pitch Pursuits',`28|João Rego
29|David Luiz
30|Andreas Schjelderup
31|Henrique Araújo
32|Rui Costa
33|Alexander Bah
34|Gianluca Prestianni
35|Ángel Di María
36|Dodi Lukébakio
37|Bruma`);
  rows(BEN,'Benfica',"Collector's Corner",`38|Samuel Dahl
39|Ángel Di María
40|Fredrik Aursnes`);
  rows(BEN,'Benfica','Soaring Eagle',`41|David Luiz
42|Rui Costa
43|Fredrik Aursnes
44|Óscar Cardozo
45|António Silva
46|João Rego
47|Vangelis Pavlidis
48|Ángel Di María
49|Luisão
50|Andreas Schjelderup`);
  autos(BEN,'Benfica','Headshot Heroes Autographs',`HH-AB|Alexander Bah
HH-AN|Andreia Norton
HH-AS|Andreas Schjelderup
HH-AT|Anatoliy Trubin
HH-BR|Bruma
HH-CD|Chandra Davidson
HH-CO|Rui Costa
HH-DM|Ángel Di María
HH-DP|Diogo Prioste
HH-FA|Fredrik Aursnes
HH-FL|Florentino Luís
HH-HF|Hugo Félix
HH-JM|José Melro
HH-JR|João Rego
HH-JV|João Veloso
HH-JW|Joshua Wynder
HH-KA|Kerem Aktürkoğlu
HH-LB|Leandro Barreiro
HH-LM|Lara Martins
HH-LS|Leandro Santos
HH-MP|Cristina Martín-Prieto
HH-MS|Manu Silva
HH-NF|Nuno Félix
HH-NR|Nycole Raysla
HH-OK|Orkun Kökçü
HH-RC|Rui Costa
HH-SI|António Silva
HH-TA|Tomás Araújo
HH-TF|Tiago Freitas
HH-TG|Tiago Gouveia
HH-VP|Vangelis Pavlidis
HH-ZA|Zeki Amdouni`);
  autos(BEN,'Benfica','Bona Fide Baller Autographs',`BB-AS|Andreas Schjelderup
BB-CL|Cloé Lacasse
BB-DL|David Luiz
BB-DM|Ángel Di María
BB-GO|Nuno Gomes
BB-LS|Luisão
BB-OC|Óscar Cardozo
BB-RC|Rui Costa
BB-VP|Vangelis Pavlidis`);
  rows(BEN,'Benfica','Rainbow Flick',`RF-1|Richard Ríos
RF-2|Andreas Schjelderup
RF-3|Gianluca Prestianni
RF-4|Nicolás Otamendi
RF-5|Enzo Barrenechea
RF-6|Vangelis Pavlidis
RF-7|Bruma
RF-8|Fredrik Aursnes
RF-9|Samuel Dahl
RF-10|Ángel Di María
RF-11|David Luiz
RF-12|Rui Costa
RF-13|Franjo Ivanović
RF-14|João Rego
RF-15|Georgiy Sudakov
RF-16|Diogo Prioste
RF-17|Leandro Barreiro
RF-18|Nuno Gomes
RF-19|Leandro Santos
RF-20|Cloé Lacasse
RF-21|António Silva
RF-22|Tomás Araújo
RF-23|Nycole Raysla
RF-24|Óscar Cardozo
RF-25|Cristina Martín-Prieto`,'case-hit');
  window.CS_SET_META[BEN]={parallels:['Static Foil','Green Rainbow Foil /99','Pink Rainbow Foil /75','Orange Rainbow Foil /25','Black Rainbow Foil /10','Red Rainbow Foil /5','Gold FoilFractor 1/1'],source:'Checklist Insider',verified:'2026-10-03'};
})();
