(() => {
  const catalog=window.CS_CATALOG;if(!catalog)return;
  catalog.checklists=catalog.checklists||{};
  window.CS_SET_META=window.CS_SET_META||{};
  const add=(id,subset,category,team,lines,flags=0)=>{
    const list=catalog.checklists[id]=catalog.checklists[id]||[];
    const seen=new Set(list.map(r=>`${r?.[0]}|${String(r?.[1]||'').toLowerCase()}|${String(r?.[4]||'').toLowerCase()}`));
    for(const line of lines.trim().split('\n').filter(Boolean)){
      const m=line.match(/^(\S+)\|(.*)$/);if(!m)continue;
      const row=[m[1],m[2],team,flags,subset,category];
      const k=`${row[0]}|${row[1].toLowerCase()}|${subset.toLowerCase()}`;
      if(!seen.has(k)){list.push(row);seen.add(k);}
    }
  };
  const auto=(id,subset,team,lines)=>add(id,subset,'autograph',team,lines,['AUTO']);
  const ins=(id,subset,team,lines,cat='insert')=>add(id,subset,cat,team,lines,0);

  // ENGLAND — source: Checklist Insider 2026 Panini INTL England
  const EN='panini-intl-england-2026';
  auto(EN,'Base Autographs','England',`1|Harry Kane
3|Declan Rice
5|Cole Palmer
6|Marcus Rashford
7|Phil Foden
11|Jordan Pickford
13|Anthony Gordon
14|Noni Madueke
15|Eberechi Eze
16|Elliot Anderson
17|Kobbie Mainoo
18|Ollie Watkins`);
  auto(EN,'Limitless Autographs','England',`1|Cole Palmer
3|Phil Foden
4|Anthony Gordon
5|Conor Gallagher
6|Elliot Anderson
7|Tino Livramento
9|Frank Lampard
10|Paul Ince
11|Steven Gerrard
12|Michael Owen
13|Terry Butcher
14|Robbie Fowler
15|Nicky Butt
16|Ledley King
17|Gareth Barry
18|Ashley Cole
19|Alan Shearer
20|Paul Scholes`);
  auto(EN,'Master Class Autographs','England',`2|Marcus Rashford
4|Eberechi Eze
5|Kyle Walker
6|Ollie Watkins
10|Djed Spence
11|Paul Ince
12|Des Walker
13|Michael Owen
14|John Terry
15|Tony Adams
16|Peter Shilton
17|Emile Heskey
18|Gary Lineker
19|Wayne Rooney
20|Frank Lampard`);
  auto(EN,'New Sensations Autographs','England',`2|Tino Livramento
3|Adam Wharton`);
  auto(EN,'Three Lions Autographs','England',`1|Declan Rice
2|Jordan Pickford
4|Noni Madueke
5|Curtis Jones
8|Ezri Konsa
13|Alan Shearer
14|Steven Gerrard
15|Mark Hateley
16|John Terry
17|Gary Lineker
18|Paul Scholes
19|Wayne Rooney
20|Peter Shilton`);
  ins(EN,'Downtown','England',`1|Harry Kane
2|Bukayo Saka
3|Phil Foden
4|Eberechi Eze
5|Gary Lineker
6|Frank Lampard`,'case-hit');
  ins(EN,'Limitless','England',`1|Cole Palmer
2|Trent Alexander-Arnold
3|Phil Foden
4|Anthony Gordon
5|Conor Gallagher
6|Elliot Anderson
7|Tino Livramento
8|Morgan Rogers
9|Frank Lampard
10|Paul Ince
11|Steven Gerrard
12|Michael Owen
13|Terry Butcher
14|Robbie Fowler
15|Nicky Butt
16|Ledley King
17|Gareth Barry
18|Ashley Cole
19|Alan Shearer
20|Paul Scholes`);
  ins(EN,'Master Class','England',`1|Harry Kane
2|Marcus Rashford
3|Bukayo Saka
4|Eberechi Eze
5|Kyle Walker
6|Ollie Watkins
7|Dean Henderson
8|Jarrod Bowen
9|Dan Burn
10|Djed Spence
11|Paul Ince
12|Des Walker
13|Michael Owen
14|John Terry
15|Tony Adams
16|Peter Shilton
17|Emile Heskey
18|Gary Lineker
19|Wayne Rooney
20|Frank Lampard`);
  ins(EN,'New Sensations','England',`1|Myles Lewis-Skelly
2|Tino Livramento
3|Adam Wharton
4|Nico O'Reilly
5|Jarell Quansah
6|Levi Colwill`);
  ins(EN,'Victorious','England',`1|Jude Bellingham
2|Cole Palmer
3|Marcus Rashford
4|Trent Alexander-Arnold
5|Declan Rice
6|Noni Madueke
7|Alan Shearer
8|Wayne Rooney`,'case-hit');
  window.CS_SET_META[EN]={parallels:['Holo','Pink /100','Purple /90','Orange /80','Red /49','Blue /25','Gold /10','Green /5','Black 1/1'],source:'Checklist Insider',verified:'2026-10-03'};

  // FRANCE — source: Checklist Insider 2026 Panini INTL France
  const FR='panini-intl-france-2026';
  auto(FR,'Base Autographs','France',`1|Kylian Mbappé
3|Theo Hernandez
6|Warren Zaïre-Emery
8|William Saliba
9|Aurélien Tchouaméni
12|Dayot Upamecano`);
  auto(FR,'Les Bleus Autographs','France',`1|Kylian Mbappé
10|Lucas Digne
11|William Saliba
13|Thierry Henry
14|Djibril Cissé
15|Florent Malouda
16|Patrick Vieira
18|Zinedine Zidane
19|Olivier Giroud
20|Michel Platini`);
  auto(FR,'Limitless Autographs','France',`4|Dayot Upamecano
5|Malo Gusto
7|Bradley Barcola
11|Lilian Thuram
12|David Trezeguet
13|Claude Makélélé
14|Marcel Desailly
15|Bacary Sagna
16|Djibril Cissé
17|Florent Malouda
18|Patrick Vieira
19|Willy Sagnol
20|Robert Pirès`);
  auto(FR,'Master Class Autographs','France',`2|Bradley Barcola
3|Aurélien Tchouaméni
6|Theo Hernandez
9|Lucas Digne
11|Thierry Henry
12|Claude Makélélé
13|Marcel Desailly
15|Zinedine Zidane
16|Emmanuel Petit
17|Franck Ribéry
18|Lilian Thuram
19|Willy Sagnol
20|Olivier Giroud`);
  auto(FR,'New Sensations Autographs','France',`1|Warren Zaïre-Emery
2|Malo Gusto`);
  ins(FR,'Downtown','France',`1|Kylian Mbappé
2|Désiré Doué
3|Ousmane Dembélé
4|Franck Ribéry
5|Thierry Henry
6|Zinedine Zidane`,'case-hit');
  ins(FR,'Les Bleus','France',`1|Kylian Mbappé
2|Christopher Nkunku
3|Michael Olise
4|Adrien Rabiot
5|Ibrahima Konaté
6|Jean-Philippe Mateta
7|Mike Maignan
8|Randal Kolo Muani
9|Lucas Chevalier
10|Lucas Digne
11|William Saliba
12|Maghnes Akliouche
13|Thierry Henry
14|Djibril Cissé
15|Florent Malouda
16|Patrick Vieira
17|Laurent Blanc
18|Zinedine Zidane
19|Olivier Giroud
20|Michel Platini`);
  ins(FR,'Limitless','France',`1|Maghnes Akliouche
2|Ousmane Dembélé
3|Eduardo Camavinga
4|Dayot Upamecano
5|Malo Gusto
6|Marcus Thuram
7|Bradley Barcola
8|Khéphren Thuram
9|Manu Koné
10|Florian Thauvin
11|Lilian Thuram
12|David Trezeguet
13|Claude Makélélé
14|Marcel Desailly
15|Bacary Sagna
16|Djibril Cissé
17|Florent Malouda
18|Patrick Vieira
19|Willy Sagnol
20|Robert Pirès`);
  ins(FR,'Master Class','France',`1|Florian Thauvin
2|Bradley Barcola
3|Aurélien Tchouaméni
4|Christopher Nkunku
5|Jean-Philippe Mateta
6|Theo Hernandez
7|Jules Koundé
8|Khéphren Thuram
9|Lucas Digne
10|Randal Kolo Muani
11|Thierry Henry
12|Claude Makélélé
13|Marcel Desailly
14|Laurent Blanc
15|Zinedine Zidane
16|Emmanuel Petit
17|Franck Ribéry
18|Lilian Thuram
19|Willy Sagnol
20|Olivier Giroud`);
  ins(FR,'New Sensations','France',`1|Warren Zaïre-Emery
2|Malo Gusto
3|Rayan Cherki
4|Hugo Ekitiké
5|Désiré Doué
6|Lucas Chevalier`);
  ins(FR,'Victorious','France',`1|Michael Olise
2|William Saliba
3|N'Golo Kanté
4|Hugo Ekitiké
5|David Trezeguet
6|Robert Pirès
7|Michel Platini
8|Olivier Giroud`,'case-hit');
  window.CS_SET_META[FR]={parallels:['Holo','Orange /75','Red /40','Blue /25','Gold /10','Green /5','Black 1/1'],source:'Checklist Insider',verified:'2026-10-03'};

  // GERMANY — source: Checklist Insider 2026 Panini INTL Germany
  const DE='panini-intl-germany-2026';
  auto(DE,'Base Autographs','Germany',`1|Joshua Kimmich
2|Antonio Rüdiger
4|David Raum
5|Nick Woltemade
7|Kai Havertz
10|Jamal Musiala
11|Nico Schlotterbeck
12|Waldemar Anton
14|Deniz Undav
15|Oliver Baumann
16|Jamie Leweling
17|Florian Wirtz
18|Serge Gnabry
19|Leroy Sané
20|Karim Adeyemi`);
  auto(DE,'Adler Autographs','Germany',`1|Felix Nmecha
2|Karim Adeyemi
3|Maximilian Beier
4|Jonathan Burkardt
5|Aleksandar Pavlović
7|Joshua Kimmich
8|Leroy Sané
11|Deniz Undav
13|Bernd Schneider
14|Franz Beckenbauer
15|Mario Götze
16|Jürgen Kohler
17|Karl-Heinz Rummenigge
18|Mehmet Scholl
19|Oliver Bierhoff
20|Thomas Häßler`);
  auto(DE,'Limitless Autographs','Germany',`1|Niclas Füllkrug
2|Felix Nmecha
3|Waldemar Anton
6|Aleksandar Pavlović
7|Jonathan Tah
8|Serge Gnabry
10|Antonio Rüdiger
11|Oliver Baumann
12|Deniz Undav
13|Andreas Köpke
14|Carsten Jancker
15|Guido Buchwald
16|Jürgen Klinsmann
17|Miroslav Klose
18|Oliver Kahn
19|Thomas Berthold
20|Wolfgang Overath`);
  auto(DE,'Master Class Autographs','Germany',`1|Kai Havertz
2|Nico Schlotterbeck
3|Jamal Musiala
4|Serge Gnabry
5|Florian Wirtz
7|David Raum
8|Jamie Leweling
10|Bodo Illgner
11|Karlheinz Förster
12|Lothar Matthäus
13|Manuel Neuer
14|Mario Gomez
15|Michael Ballack
16|Olaf Thon
17|Paul Breitner
18|Philipp Lahm
19|Rudi Völler
20|Thomas Müller`);
  auto(DE,'New Sensations Autographs','Germany',`2|Nick Woltemade`);
  ins(DE,'Adler','Germany',`1|Felix Nmecha
2|Karim Adeyemi
3|Maximilian Beier
4|Jonathan Burkardt
5|Aleksandar Pavlović
6|Leon Goretzka
7|Joshua Kimmich
8|Leroy Sané
9|Malick Thiaw
10|Assan Ouédraogo
11|Deniz Undav
12|Alexander Nübel
13|Bernd Schneider
14|Franz Beckenbauer
15|Mario Götze
16|Jürgen Kohler
17|Karl-Heinz Rummenigge
18|Mehmet Scholl
19|Oliver Bierhoff
20|Thomas Häßler`);
  ins(DE,'Downtown','Germany',`1|Nico Schlotterbeck
2|Joshua Kimmich
3|Florian Wirtz
4|Jürgen Klinsmann
5|Michael Ballack
6|Manuel Neuer`,'case-hit');
  ins(DE,'Limitless','Germany',`1|Niclas Füllkrug
2|Felix Nmecha
3|Waldemar Anton
4|Kevin Schade
5|Nathaniel Brown
6|Aleksandar Pavlović
7|Jonathan Tah
8|Serge Gnabry
9|Ridle Baku
10|Antonio Rüdiger
11|Oliver Baumann
12|Deniz Undav
13|Andreas Köpke
14|Carsten Jancker
15|Guido Buchwald
16|Jürgen Klinsmann
17|Miroslav Klose
18|Oliver Kahn
19|Thomas Berthold
20|Wolfgang Overath`);
  ins(DE,'Master Class','Germany',`1|Kai Havertz
2|Nico Schlotterbeck
3|Jamal Musiala
4|Serge Gnabry
5|Florian Wirtz
6|Malick Thiaw
7|David Raum
8|Jamie Leweling
9|Maximilian Mittelstädt
10|Bodo Illgner
11|Karlheinz Förster
12|Lothar Matthäus
13|Manuel Neuer
14|Mario Gomez
15|Michael Ballack
16|Olaf Thon
17|Paul Breitner
18|Philipp Lahm
19|Rudi Völler
20|Thomas Müller`);
  ins(DE,'New Sensations','Germany',`1|Kevin Schade
2|Nick Woltemade
3|Nathaniel Brown
4|Assan Ouédraogo
5|Said El Mala
6|Lennart Karl`);
  ins(DE,'Victorious','Germany',`1|Kai Havertz
2|Leroy Sané
3|Jamal Musiala
4|Nick Woltemade
5|Franz Beckenbauer
6|Lothar Matthäus
7|Oliver Kahn
8|Thomas Müller`,'case-hit');
  window.CS_SET_META[DE]={parallels:['Holo','Stars /299','Laser /249','Circles /199','Pink /149','Purple /125','Orange /99','Red /49','Blue /25','Gold /10','Green /5','Black 1/1'],source:'Checklist Insider',verified:'2026-10-03'};

  // MEXICO — source: Checklist Insider 2026 Panini INTL Mexico
  const MX='panini-intl-mexico-2026';
  auto(MX,'Base Autographs','Mexico',`1|Raúl Jiménez
4|Roberto Alvarado
6|César Montes
15|Jesús Gallardo`);
  ins(MX,'Águila Real','Mexico',`1|Edson Álvarez
2|Jesús Gallardo
3|César Montes
4|Luis Romo
5|Eduardo Águila
6|Uriel Antuna
7|Israel Reyes
8|Javier Aguirre
9|Carlos Vela
10|Kevin Castañeda
11|Erick Sánchez
12|Erick Aguirre
13|Jorge Campos
14|Luis Hernández
15|Hugo Sánchez
16|Carlos Hermosillo
17|Guillermo Ochoa
18|Kikín Fonseca
19|Javier Aquino
20|Andrés Guardado`);
  ins(MX,'Downtown','Mexico',`1|Raúl Jiménez
2|Edson Álvarez
3|Marcel Ruiz
4|Guillermo Ochoa
5|Rafael Márquez
6|Hugo Sánchez`,'case-hit');
  ins(MX,'Limitless','Mexico',`1|Raúl Jiménez
2|Roberto Alvarado
3|Hugo Sánchez
4|Brian Gutiérrez
5|Efraín Álvarez
6|Diego Campillo
7|Erik Lira
8|Alexis Gutiérrez
9|Bryan González
10|Richard Ledezma
11|Jesús Garza
12|Gerardo Arteaga
13|Henry Martín
14|Carlos Salcido
15|Tecatito Corona
16|Marco Fabián
17|Carlos Hermosillo
18|Gerardo Torrado
19|Kikín Fonseca
20|Pável Pardo`);
  ins(MX,'Master Class','Mexico',`1|Germán Berterame
2|Marcel Ruiz
3|Hirving Lozano
4|Víctor Guzmán
5|Luis Malagón
6|Israel Reyes
7|Alexis Gutiérrez
8|Carlos Rodríguez
9|Uriel Antuna
10|Marco Fabián
11|Carlos Vela
12|Carlos Salcido
13|Jorge Campos
14|Luis Hernández
15|Tecatito Corona
16|Rafael Márquez
17|Gerardo Torrado
18|Guillermo Ochoa
19|Javier Aguirre
20|Claudio Suárez`);
  ins(MX,'New Sensations','Mexico',`1|Armando González
2|Gilberto Mora
3|Obed Vargas
4|Raúl Rangel
5|Brian Gutiérrez
6|Bryan González`);
  ins(MX,'Victorious','Mexico',`1|Armando González
2|Gilberto Mora
3|Roberto Alvarado
4|Hirving Lozano
5|Jorge Campos
6|Pável Pardo
7|Claudio Suárez
8|Andrés Guardado`,'case-hit');
  window.CS_SET_META[MX]={parallels:['Holo','Purple /90','Orange /65','Red /49','Blue /25','Gold /10','Green /5','Black 1/1'],source:'Checklist Insider',verified:'2026-10-03'};
})();
