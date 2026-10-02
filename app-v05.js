const STORAGE_KEY = 'collectors-sports-v05-cards';
const LEGACY_KEYS = ['collectors-sports-v04-cards','collectors-sports-v03-cards','collectors-sports-v02-cards'];
const SPORTS = ['Soccer','MLB','NFL','NBA','UFC','F1','Tennis','WWE'];
const CURRENCIES = ['MXN','USD'];
const FX_USD_MXN = 18;
const CATALOG = window.CS_CATALOG || {collections:[],checklists:{}};
const MEDIA_DB = 'collectors-sports-media-v1';
const MEDIA_STORE = 'photos';

const state = {
  view: 'home',
  sport: 'Todos',
  query: '',
  sort: 'newest',
  selectedId: null,
  editId: null,
  cards: loadCards(),
  catalogSport: 'Todos',
  catalogQuery: '',
  catalogSelectedId: null,
  catalogCardQuery: '',
  prefill: null,
};

function loadCards(){
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_KEYS) {
        raw = localStorage.getItem(key);
        if (raw) break;
      }
    }
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveCards(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cards)); }
function uuid(){ return globalThis.crypto?.randomUUID ? crypto.randomUUID() : `card-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function num(value){ const n=Number(value); return Number.isFinite(n)?n:0; }
function money(value,currency='MXN'){
  const safeCurrency=CURRENCIES.includes(currency)?currency:'MXN';
  return new Intl.NumberFormat('es-MX',{style:'currency',currency:safeCurrency,maximumFractionDigits:safeCurrency==='MXN'?0:2}).format(num(value));
}
function toMXN(card,field='currentValue'){ const value=num(card[field]); return card.currency==='USD'?value*FX_USD_MXN:value; }
function esc(value=''){ return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
function tags(card){ return ['rc','auto','relic','insert','sp','ssp'].filter(k=>card[k]).map(k=>k.toUpperCase()); }
function cardLabel(card){ return [card.year,card.manufacturer,card.product].filter(Boolean).join(' '); }
function isHit(card){ return Boolean(card.auto||card.relic||card.serial||card.sp||card.ssp); }
function totalValue(){ return state.cards.reduce((sum,c)=>sum+toMXN(c),0); }
function totalCost(){ return state.cards.reduce((sum,c)=>sum+toMXN(c,'purchasePrice'),0); }
function collectionById(id){ return CATALOG.collections.find(c=>c.id===id); }
function checklistFor(id){ return CATALOG.checklists[id] || []; }
function ownedCardsForCollection(id){ return state.cards.filter(c=>c.catalogCollectionId===id); }
function findOwnedCatalogCard(collectionId,row){
  const [number,player]=row;
  return state.cards.find(c=>c.catalogCollectionId===collectionId && String(c.cardNumber||'')===String(number) && String(c.player||'').toLowerCase()===String(player||'').toLowerCase() && (!row[7] || c.catalogEntryKey===row[7]));
}

function openMediaDb(){
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){ reject(new Error('IndexedDB unavailable')); return; }
    const req=indexedDB.open(MEDIA_DB,1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(MEDIA_STORE)) db.createObjectStore(MEDIA_STORE);
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function putPhoto(cardId,side,blob){
  const db=await openMediaDb();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(MEDIA_STORE,'readwrite');
    tx.objectStore(MEDIA_STORE).put(blob,`${cardId}:${side}`);
    tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);
  });
  db.close();
}
async function getPhoto(cardId,side){
  try{
    const db=await openMediaDb();
    const value=await new Promise((resolve,reject)=>{
      const tx=db.transaction(MEDIA_STORE,'readonly');
      const req=tx.objectStore(MEDIA_STORE).get(`${cardId}:${side}`);
      req.onsuccess=()=>resolve(req.result||null); req.onerror=()=>reject(req.error);
    });
    db.close(); return value;
  }catch{return null;}
}
async function deleteCardPhotos(cardId){
  try{
    const db=await openMediaDb();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(MEDIA_STORE,'readwrite');
      tx.objectStore(MEDIA_STORE).delete(`${cardId}:front`);
      tx.objectStore(MEDIA_STORE).delete(`${cardId}:back`);
      tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);
    });
    db.close();
  }catch{}
}
async function compressImage(file){
  if(!file) return null;
  const objectUrl=URL.createObjectURL(file);
  try{
    const img=await new Promise((resolve,reject)=>{ const el=new Image(); el.onload=()=>resolve(el); el.onerror=reject; el.src=objectUrl; });
    const max=1400; const scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(img.naturalWidth*scale)); canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    return await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.84));
  } finally { URL.revokeObjectURL(objectUrl); }
}

function filteredCards(){
  const q=state.query.trim().toLowerCase();
  const list=state.cards.filter(card=>{
    const sportOk=state.sport==='Todos'||card.sport===state.sport;
    const hay=[card.player,card.team,card.product,card.manufacturer,card.parallel,card.cardNumber,card.serial,card.year,card.notes,card.condition,card.storage,card.location].join(' ').toLowerCase();
    return sportOk && (!q || hay.includes(q));
  });
  return [...list].sort((a,b)=>{
    if(state.sort==='value-desc') return toMXN(b)-toMXN(a);
    if(state.sort==='value-asc') return toMXN(a)-toMXN(b);
    if(state.sort==='player-asc') return String(a.player||'').localeCompare(String(b.player||''),'es');
    if(state.sort==='player-desc') return String(b.player||'').localeCompare(String(a.player||''),'es');
    return String(b.createdAt||'').localeCompare(String(a.createdAt||''));
  });
}
function filteredCatalog(){
  const q=state.catalogQuery.trim().toLowerCase();
  return CATALOG.collections.filter(c=>{
    const sportOk=state.catalogSport==='Todos'||c.sport===state.catalogSport;
    const hay=[c.name,c.shortName,c.sport,c.manufacturer,c.year].join(' ').toLowerCase();
    return sportOk && (!q || hay.includes(q));
  });
}

function nav(){
  return `<nav class="bottom-nav" aria-label="Navegación principal">
    ${navButton('home','Inicio','⌂')}${navButton('catalog','Catálogo','▤')}${navButton('collection','Colección','▦')}${navButton('add','Agregar','＋')}
  </nav>`;
}
function navButton(view,label,icon){
  const active=state.view===view || (view==='catalog' && state.view==='catalog-detail');
  return `<button class="nav-btn ${active?'active':''}" data-nav="${view}"><span>${icon}</span>${label}</button>`;
}
function layout(content){
  return `<main class="shell"><header class="topbar"><button class="brand brand-button" data-nav="home" aria-label="Ir a inicio"><div class="logo">CS</div><div><h1>Collectors Sports</h1><div class="muted">Colección premium · V0.5</div></div></button><button class="icon-btn" id="exportBtn" title="Exportar respaldo" aria-label="Exportar respaldo">⇩</button></header>${content}<input id="importFile" type="file" accept="application/json" hidden></main>${nav()}`;
}

function home(){
  const counts=Object.fromEntries(SPORTS.map(s=>[s,state.cards.filter(c=>c.sport===s).length]));
  const hits=state.cards.filter(isHit).length, cost=totalCost(), value=totalValue(), gain=value-cost;
  const recent=[...state.cards].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||''))).slice(0,4);
  const fullCatalog=CATALOG.collections.filter(c=>c.coverage==='base-complete').length;
  return layout(`
    <section class="card hero"><div class="eyebrow">VALOR ESTIMADO</div><div class="hero-value">${money(value,'MXN')}</div><div class="hero-subrow"><span>Costo registrado: <strong>${money(cost,'MXN')}</strong></span><span class="${gain>=0?'positive':'negative'}">Dif.: ${money(gain,'MXN')}</span></div><div class="muted tiny">Dashboard normalizado a MXN · tipo de cambio provisional ${FX_USD_MXN} MXN/USD</div></section>
    <section class="grid metrics-grid"><div class="card metric"><span class="muted">Cartas registradas</span><strong>${state.cards.length}</strong></div><div class="card metric"><span class="muted">Hits</span><strong>${hits}</strong></div><div class="card metric"><span class="muted">One Touch</span><strong>${state.cards.filter(c=>c.storage==='One Touch').length}</strong></div><div class="card metric"><span class="muted">Top Loader</span><strong>${state.cards.filter(c=>c.storage==='Top Loader').length}</strong></div></section>
    <div class="section-title"><h2>Catálogo oficial</h2><button class="text-btn" data-nav="catalog">Abrir</button></div>
    <section class="card catalog-summary"><div><strong>${CATALOG.collections.length} colecciones precargadas</strong><div class="muted">Fuentes oficiales de fabricantes · ${fullCatalog} checklist base completo por ahora.</div></div><button class="btn small" data-nav="catalog">Explorar</button></section>
    <div class="section-title"><h2>Por deporte</h2><button class="text-btn" data-nav="collection">Ver todo</button></div>
    <section class="sport-grid">${SPORTS.map(s=>`<button class="sport-card" data-filter-sport="${s}"><span>${sportIcon(s)}</span><strong>${sportLabel(s)}</strong><em>${counts[s]} carta${counts[s]===1?'':'s'}</em></button>`).join('')}</section>
    <div class="section-title"><h2>Últimas agregadas</h2></div>
    ${recent.length?`<section class="list">${recent.map(cardRow).join('')}</section>`:`<section class="card empty"><strong>La colección está vacía.</strong><br><br>Aquí solo registraremos las cartas que realmente vale la pena inventariar: Top Loader, One Touch y piezas relevantes.<br><br><button class="btn" data-nav="add">Agregar primera carta</button></section>`}
    <div class="section-title"><h2>Respaldo</h2></div><section class="card backup-card"><div><strong>Protege tu inventario</strong><div class="muted">El respaldo JSON incluye los datos de las cartas. Las fotos permanecen en este dispositivo durante esta fase.</div></div><div class="backup-actions"><button class="btn secondary" id="importBtn">Importar</button><button class="btn" id="exportBtnInline">Exportar</button></div></section>`);
}

function catalog(){
  const items=filteredCatalog();
  return layout(`<div class="section-title"><div><h2>Catálogo</h2><div class="muted">Colecciones verificadas con fuentes oficiales.</div></div><span class="muted">${items.length}</span></div><div class="search-row"><input id="catalogSearch" class="search" type="search" autocomplete="off" placeholder="Buscar colección, año o fabricante…" value="${esc(state.catalogQuery)}">${state.catalogQuery?'<button class="btn secondary" id="clearCatalogSearch">✕</button>':''}</div><div class="filters">${['Todos',...SPORTS].map(s=>`<button class="chip ${state.catalogSport===s?'active':''}" data-catalog-sport="${s}">${sportLabel(s)}</button>`).join('')}</div><section class="catalog-list">${items.length?items.map(c=>catalogRow(c)).join(''):`<div class="card empty">No hay colecciones con ese filtro.</div>`}</section>`);
}
function catalogRow(c){
  const full=c.coverage==='base-complete'; const owned=ownedCardsForCollection(c.id).length;
  return `<button class="catalog-item" data-catalog-id="${esc(c.id)}"><div class="catalog-item-top"><span class="badge green">${esc(c.sport)}</span><span class="badge ${full?'gold':''}">${full?'Base cargada':'Colección cargada'}</span></div><strong>${esc(c.shortName||c.name)}</strong><div class="muted">${esc(c.manufacturer)} · ${esc(c.year)}</div><div class="catalog-stats"><span>${c.baseCount?`${c.baseCount} cartas base`:'Checklist en preparación'}</span>${owned?`<strong>✓ ${owned} registrada${owned===1?'':'s'}</strong>`:''}</div></button>`;
}
function catalogDetail(){
  const c=collectionById(state.catalogSelectedId); if(!c){state.view='catalog';return catalog();}
  const checklist=checklistFor(c.id), q=state.catalogCardQuery.trim().toLowerCase();
  const rows=checklist.map((row,index)=>({row,index})).filter(x=>!q || [x.row[0],x.row[1],x.row[2]].join(' ').toLowerCase().includes(q));
  const owned=ownedCardsForCollection(c.id); const uniqueBase=new Set(owned.map(x=>`${x.cardNumber}|${String(x.player||'').toLowerCase()}`)).size;
  return layout(`<button class="back" data-nav="catalog">← Volver al catálogo</button><div class="section-title"><div><h2>${esc(c.shortName||c.name)}</h2><div class="muted">${esc(c.manufacturer)} · ${esc(c.year)} · ${esc(c.sport)}</div></div></div><section class="card catalog-detail-card"><div class="catalog-progress"><strong>${owned.length} carta${owned.length===1?'':'s'} de esta colección en tu inventario</strong>${checklist.length?`<span>${uniqueBase} número${uniqueBase===1?'':'s'} base distinto${uniqueBase===1?'':'s'} registrado${uniqueBase===1?'':'s'}</span>`:''}</div><div class="catalog-detail-actions"><button class="btn" data-use-collection="${esc(c.id)}">Usar para agregar carta</button><a class="btn secondary link-btn" href="${esc(c.checklistUrl||c.sourceUrl)}" target="_blank" rel="noopener">Checklist oficial ↗</a></div><div class="muted tiny">Fuente oficial del fabricante. Registrar una carta aquí no implica que guardemos todas las bases; solo tu inventario relevante.</div></section>${checklist.length?`<div class="section-title"><div><h2>Base checklist</h2><div class="muted">${checklist.length} cartas cargadas</div></div></div><div class="search-row"><input id="catalogCardSearch" class="search" type="search" autocomplete="off" placeholder="Buscar jugador, equipo o número…" value="${esc(state.catalogCardQuery)}">${state.catalogCardQuery?'<button class="btn secondary" id="clearCatalogCardSearch">✕</button>':''}</div><section class="catalog-cards">${rows.map(x=>catalogCardRow(c,x.row,x.index)).join('')}</section>`:`<section class="card empty catalog-pending"><strong>La colección ya está precargada.</strong><br><br>La carga carta-por-carta de este checklist es el siguiente lote de importación. Mientras tanto puedes usar la colección para autocompletar deporte, fabricante, año y producto.</section>`}`);
}
function catalogCardRow(c,row,index){
  const [number,player,team,rookie]=row; const owned=findOwnedCatalogCard(c.id,row);
  return `<button class="catalog-card-row ${owned?'owned':''}" ${owned?`data-card="${esc(owned.id)}"`:`data-use-catalog-card="${esc(c.id)}" data-catalog-card-index="${index}"`}><span class="catalog-number">#${esc(number)}</span><span class="catalog-player"><strong>${esc(player)}</strong><em>${esc(team)}</em></span>${rookie?'<span class="badge gold">RC</span>':''}${owned?'<span class="catalog-owned">✓</span>':'<span class="catalog-plus">＋</span>'}</button>`;
}

function collection(){
  const cards=filteredCards(); const filteredValue=cards.reduce((sum,c)=>sum+toMXN(c),0);
  return layout(`<div class="section-title collection-title"><div><h2>Mi colección</h2><div class="muted">${cards.length} resultado${cards.length===1?'':'s'} · ${money(filteredValue,'MXN')}</div></div><button class="btn small" data-nav="add">＋ Agregar</button></div><div class="search-row"><input id="search" class="search" type="search" autocomplete="off" placeholder="Buscar jugador, equipo, set, paralelo, ubicación…" value="${esc(state.query)}">${state.query?'<button class="btn secondary" id="clearSearch">✕</button>':''}</div><div class="filters">${['Todos',...SPORTS].map(s=>`<button class="chip ${state.sport===s?'active':''}" data-sport="${s}">${sportLabel(s)}</button>`).join('')}</div><div class="toolbar"><span class="muted">Ordenar</span><select id="sortSelect" class="sort-select"><option value="newest" ${state.sort==='newest'?'selected':''}>Más recientes</option><option value="value-desc" ${state.sort==='value-desc'?'selected':''}>Mayor valor</option><option value="value-asc" ${state.sort==='value-asc'?'selected':''}>Menor valor</option><option value="player-asc" ${state.sort==='player-asc'?'selected':''}>Jugador A–Z</option><option value="player-desc" ${state.sort==='player-desc'?'selected':''}>Jugador Z–A</option></select></div><section class="list">${cards.length?cards.map(cardRow).join(''):`<div class="card empty">No encontramos cartas con esos filtros.</div>`}</section>`);
}
function sportLabel(s){ return s === 'Tennis' ? 'Tenis' : s; }
function sportIcon(s){ return ({Soccer:'⚽',MLB:'⚾',NFL:'🏈',NBA:'🏀',UFC:'🥊',F1:'🏎️',Tennis:'🎾',WWE:'🤼'})[s]||'★'; }
function cardRow(card){
  const title=esc(card.player||'Sin jugador'); const subtitle=[cardLabel(card),card.cardNumber?`#${card.cardNumber}`:''].filter(Boolean).join(' · ');
  return `<button class="item" data-card="${esc(card.id)}"><div class="item-head"><div class="item-main"><div class="item-title">${title}</div><div class="muted item-subtitle">${esc(subtitle||card.team||'Sin colección')}</div></div><div class="item-price">${money(card.currentValue,card.currency)}</div></div><div class="badges"><span class="badge green">${esc(card.sport)}</span>${card.parallel?`<span class="badge">${esc(card.parallel)}</span>`:''}${card.serial?`<span class="badge gold">${esc(card.serial)}</span>`:''}${tags(card).map(t=>`<span class="badge">${t}</span>`).join('')}</div>${card.location?`<div class="item-location">⌖ ${esc(card.location)}</div>`:''}</button>`;
}

function seedFromCollection(id){
  const c=collectionById(id); if(!c)return null;
  return {catalogCollectionId:c.id,sport:c.sport,manufacturer:c.manufacturer,year:c.year,product:c.name,sourceUrl:c.sourceUrl};
}
function seedFromCatalogCard(collectionId,index){
  const c=collectionById(collectionId), row=checklistFor(collectionId)[Number(index)]; if(!c||!row)return seedFromCollection(collectionId);
  const [cardNumber,player,team,rookie]=row; return {...seedFromCollection(collectionId),cardNumber:String(cardNumber),player,team,rc:Boolean(rookie),catalogSubset:row[4]||'',catalogEntryKey:row[7]||'',...(row[6]?{parallel:row[6]}:{}),...(row[5] ? {auto:row[5]==='autograph'||row[5]==='autograph-relic',relic:row[5]==='autograph-relic'||row[5]==='relic',insert:row[5]==='insert',sp:/short print/i.test(row[4]||'')&&!/super short/i.test(row[4]||''),ssp:/super short/i.test(row[4]||'')} : {})};
}
function add(){return cardForm(null);}
function edit(){const card=state.cards.find(c=>c.id===state.editId);if(!card){state.view='collection';state.editId=null;return collection();}return cardForm(card);}
function inputField(name,label,placeholder,required=false,type='text',value='',step=''){return `<div class="field"><label for="${name}">${label}${required?' *':''}</label><input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" value="${value}" ${step?`step="${step}"`:''} ${required?'required':''}></div>`;}
function selectField(name,label,placeholder,options,required=false,selected=''){return `<div class="field"><label for="${name}">${label}${required?' *':''}</label><select id="${name}" name="${name}" ${required?'required':''}><option value="">${placeholder}</option>${options.map(o=>`<option value="${esc(o)}" ${String(selected)===String(o)?'selected':''}>${esc(sportLabel(o))}</option>`).join('')}</select></div>`;}

function cardForm(card){
  const editing=Boolean(card), seed=editing?card:(state.prefill||{}), v=name=>esc(seed?.[name]??''), checked=name=>seed?.[name]?'checked':'';
  const selectedCollectionId=seed?.catalogCollectionId||'', selectedCollection=collectionById(selectedCollectionId), checklist=selectedCollection?checklistFor(selectedCollection.id):[];
  const selectedIndex=selectedCollection&&seed?.cardNumber?checklist.findIndex(r=>String(r[0])===String(seed.cardNumber)&&String(r[1])===String(seed.player||r[1])&&(!seed.catalogEntryKey||r[7]===seed.catalogEntryKey)):-1;
  return layout(`<button class="back" data-nav="${editing?'detail':'collection'}">← ${editing?'Cancelar edición':'Volver a colección'}</button><div class="section-title"><div><h2>${editing?'Editar carta':'Agregar carta'}</h2><div class="muted">Captura manual o parte del catálogo oficial.</div></div></div><form id="cardForm" class="form form-grid">
    <div class="field wide catalog-picker"><label for="catalogCollectionSelect">Colección precargada</label><select id="catalogCollectionSelect"><option value="">Captura manual</option>${CATALOG.collections.map(c=>`<option value="${esc(c.id)}" ${selectedCollectionId===c.id?'selected':''}>${esc(c.shortName||c.name)}</option>`).join('')}</select>${selectedCollection?`<div class="catalog-picker-meta"><span>${esc(selectedCollection.manufacturer)} · ${esc(selectedCollection.year)}</span><a href="${esc(selectedCollection.checklistUrl||selectedCollection.sourceUrl)}" target="_blank" rel="noopener">Checklist oficial ↗</a></div>`:''}</div>
    ${selectedCollection&&checklist.length?`<div class="field wide"><label for="catalogCardSelect">Carta base de esta colección</label><select id="catalogCardSelect"><option value="">Selecciona una carta</option>${checklist.map((r,i)=>`<option value="${i}" ${selectedIndex===i?'selected':''}>#${esc(r[0])} · ${esc(r[1])} · ${esc(r[2])}${r[3]?' · RC':''}</option>`).join('')}</select></div>`:''}
    <input type="hidden" name="catalogSubset" value="${v('catalogSubset')}"><input type="hidden" name="catalogEntryKey" value="${v('catalogEntryKey')}"><input type="hidden" name="catalogCollectionId" value="${esc(selectedCollectionId)}"><input type="hidden" name="sourceUrl" value="${esc(seed?.sourceUrl||selectedCollection?.sourceUrl||'')}">
    ${selectField('sport','Deporte','Selecciona deporte',SPORTS,true,seed?.sport)}${inputField('player','Jugador','Ej. Lamine Yamal',true,'text',v('player'))}${inputField('team','Equipo / escudería','Ej. FC Barcelona',false,'text',v('team'))}${inputField('year','Año / temporada','2025/26',false,'text',v('year'))}${inputField('manufacturer','Fabricante','Topps / Panini',false,'text',v('manufacturer'))}${inputField('product','Colección / producto','Topps Chrome UEFA',false,'text',v('product'))}${inputField('cardNumber','Número de carta','75',false,'text',v('cardNumber'))}${inputField('parallel','Paralelo / variante','Gold Refractor',false,'text',v('parallel'))}${inputField('serial','Numeración del ejemplar','12/50',false,'text',v('serial'))}${selectField('currency','Moneda','Selecciona moneda',CURRENCIES,true,seed?.currency||'MXN')}${inputField('purchasePrice','Precio de compra','0',false,'number',v('purchasePrice'),'0.01')}${inputField('currentValue','Valor estimado actual','0',false,'number',v('currentValue'),'0.01')}${selectField('condition','Estado','Selecciona estado',['Raw','PSA 10','PSA 9','BGS 10','BGS 9.5','SGC 10','Otro'],false,seed?.condition)}${selectField('storage','Protección','Selecciona',['One Touch','Top Loader','Slab','Carpeta','Otra'],false,seed?.storage)}${inputField('location','Ubicación física','Ej. Vault · Caja 2 · Fila 1',false,'text',v('location'))}
    <div class="field wide"><label>Características</label><div class="checks">${['RC','Auto','Relic','Insert','SP','SSP'].map(t=>`<label class="check"><input type="checkbox" name="${t.toLowerCase()}" ${checked(t.toLowerCase())}>${t}</label>`).join('')}</div></div>
    <div class="field wide"><label>Fotos de tu ejemplar</label><div class="photo-input-grid"><label class="photo-input"><span>Frente</span><input id="frontPhotoFile" type="file" accept="image/*"><img id="frontPhotoPreview" alt="Vista previa frente" hidden></label><label class="photo-input"><span>Reverso</span><input id="backPhotoFile" type="file" accept="image/*"><img id="backPhotoPreview" alt="Vista previa reverso" hidden></label></div><div class="muted tiny">Las fotos se guardan en este dispositivo por ahora. Si editas una carta, elegir una foto nueva reemplaza la anterior.</div></div>
    <div class="field wide"><label for="notes">Notas</label><textarea id="notes" name="notes" rows="3" placeholder="Ej. player worn, condición, procedencia, observaciones…">${v('notes')}</textarea></div><div class="wide"><button class="btn full" type="submit">${editing?'Guardar cambios':'Guardar carta'}</button></div></form>`);
}

function detail(){
  const card=state.cards.find(c=>c.id===state.selectedId); if(!card){state.view='collection';return collection();}
  const catalogEntry=collectionById(card.catalogCollectionId);
  return layout(`<button class="back" id="backToCollection">← Volver a colección</button><div class="section-title detail-title"><div><h2>${esc(card.player)}</h2><div class="muted">${esc(card.team||'')}</div></div><button class="btn secondary small" id="editCard">Editar</button></div><section class="card detail-card"><div class="eyebrow">VALOR ESTIMADO ACTUAL</div><div class="detail-value">${money(card.currentValue,card.currency)}</div>${card.purchasePrice?`<div class="muted">Compra: ${money(card.purchasePrice,card.currency)}</div>`:''}<div class="badges"><span class="badge green">${esc(card.sport)}</span>${card.parallel?`<span class="badge">${esc(card.parallel)}</span>`:''}${card.serial?`<span class="badge gold">${esc(card.serial)}</span>`:''}${tags(card).map(t=>`<span class="badge">${t}</span>`).join('')}</div><div class="photo-gallery"><div class="photo-slot" id="frontPhotoSlot"><span>Frente</span><div class="photo-empty">Sin foto</div><img alt="Frente de la carta" hidden></div><div class="photo-slot" id="backPhotoSlot"><span>Reverso</span><div class="photo-empty">Sin foto</div><img alt="Reverso de la carta" hidden></div></div><div class="meta">${meta('Colección',cardLabel(card))}${meta('Número',card.cardNumber?`#${card.cardNumber}`:'')}${meta('Paralelo',card.parallel)}${meta('Serial',card.serial)}${meta('Estado',card.condition)}${meta('Protección',card.storage)}${meta('Ubicación física',card.location)}${meta('Notas',card.notes)}</div>${catalogEntry?`<a class="catalog-source-detail" href="${esc(catalogEntry.checklistUrl||catalogEntry.sourceUrl)}" target="_blank" rel="noopener">Ver checklist oficial ↗</a>`:''}<div class="danger-zone"><button class="btn danger full" id="deleteCard">Eliminar carta</button></div></section>`);
}
function meta(label,value){return value?`<div class="meta-row"><span>${label}</span><strong>${esc(value)}</strong></div>`:'';}
async function hydrateDetailPhotos(cardId){
  for(const side of ['front','back']){
    const blob=await getPhoto(cardId,side); if(!blob)continue;
    const slot=document.querySelector(`#${side}PhotoSlot`); if(!slot)continue;
    const img=slot.querySelector('img'), empty=slot.querySelector('.photo-empty'), url=URL.createObjectURL(blob);
    img.src=url; img.hidden=false; if(empty)empty.hidden=true; img.onload=()=>setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
}
function bindPhotoPreview(inputId,imgId){
  const input=document.querySelector(`#${inputId}`), img=document.querySelector(`#${imgId}`); if(!input||!img)return;
  input.addEventListener('change',()=>{const file=input.files?.[0];if(!file){img.hidden=true;return;}const url=URL.createObjectURL(file);img.src=url;img.hidden=false;img.onload=()=>setTimeout(()=>URL.revokeObjectURL(url),1000);});
}

function exportBackup(){
  const payload={app:'Collectors Sports',version:5,exportedAt:new Date().toISOString(),note:'Photos are stored locally in IndexedDB and are not included in this JSON backup yet.',cards:state.cards};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`collectors-sports-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
}
function importBackup(file){
  const reader=new FileReader(); reader.onload=()=>{try{const parsed=JSON.parse(String(reader.result||''));const cards=Array.isArray(parsed)?parsed:parsed.cards;if(!Array.isArray(cards))throw new Error('Formato no válido');const normalized=cards.filter(Boolean).map(c=>({...c,id:c.id||uuid(),createdAt:c.createdAt||new Date().toISOString()}));if(!confirm(`Se importarán ${normalized.length} cartas y reemplazarán las ${state.cards.length} actuales en este dispositivo. ¿Continuar?`))return;state.cards=normalized;saveCards();state.view='collection';state.sport='Todos';state.query='';render();alert('Respaldo importado correctamente.');}catch{alert('No pude leer ese archivo como respaldo de Collectors Sports.');}};reader.readAsText(file);
}

function render(){
  const root=document.querySelector('#app');
  root.innerHTML=state.view==='home'?home():state.view==='catalog'?catalog():state.view==='catalog-detail'?catalogDetail():state.view==='collection'?collection():state.view==='add'?add():state.view==='edit'?edit():detail();
  bind(); if(state.view==='detail'&&state.selectedId) hydrateDetailPhotos(state.selectedId);
}
function bind(){
  document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.nav;if(state.view!=='detail')state.selectedId=null;if(state.view!=='edit')state.editId=null;if(state.view!=='add')state.prefill=null;render();}));
  document.querySelectorAll('[data-sport]').forEach(b=>b.addEventListener('click',()=>{state.sport=b.dataset.sport;render();}));
  document.querySelectorAll('[data-filter-sport]').forEach(b=>b.addEventListener('click',()=>{state.sport=b.dataset.filterSport;state.view='collection';render();}));
  document.querySelectorAll('[data-card]').forEach(b=>b.addEventListener('click',()=>{state.selectedId=b.dataset.card;state.view='detail';render();}));
  document.querySelectorAll('[data-catalog-sport]').forEach(b=>b.addEventListener('click',()=>{state.catalogSport=b.dataset.catalogSport;render();}));
  document.querySelectorAll('[data-catalog-id]').forEach(b=>b.addEventListener('click',()=>{state.catalogSelectedId=b.dataset.catalogId;state.catalogCardQuery='';state.view='catalog-detail';render();}));
  document.querySelectorAll('[data-use-collection]').forEach(b=>b.addEventListener('click',()=>{state.prefill=seedFromCollection(b.dataset.useCollection);state.view='add';render();}));
  document.querySelectorAll('[data-use-catalog-card]').forEach(b=>b.addEventListener('click',()=>{state.prefill=seedFromCatalogCard(b.dataset.useCatalogCard,b.dataset.catalogCardIndex);state.view='add';render();}));
  const search=document.querySelector('#search'); if(search)search.addEventListener('input',e=>{state.query=e.target.value;const pos=e.target.selectionStart;render();const next=document.querySelector('#search');if(next){next.focus();next.setSelectionRange(pos,pos);}});
  document.querySelector('#clearSearch')?.addEventListener('click',()=>{state.query='';render();}); document.querySelector('#sortSelect')?.addEventListener('change',e=>{state.sort=e.target.value;render();});
  const catalogSearch=document.querySelector('#catalogSearch'); if(catalogSearch)catalogSearch.addEventListener('input',e=>{state.catalogQuery=e.target.value;const pos=e.target.selectionStart;render();const next=document.querySelector('#catalogSearch');if(next){next.focus();next.setSelectionRange(pos,pos);}});
  document.querySelector('#clearCatalogSearch')?.addEventListener('click',()=>{state.catalogQuery='';render();});
  const catalogCardSearch=document.querySelector('#catalogCardSearch'); if(catalogCardSearch)catalogCardSearch.addEventListener('input',e=>{state.catalogCardQuery=e.target.value;const pos=e.target.selectionStart;render();const next=document.querySelector('#catalogCardSearch');if(next){next.focus();next.setSelectionRange(pos,pos);}});
  document.querySelector('#clearCatalogCardSearch')?.addEventListener('click',()=>{state.catalogCardQuery='';render();});
  document.querySelector('#catalogCollectionSelect')?.addEventListener('change',e=>{state.prefill=e.target.value?seedFromCollection(e.target.value):null;render();});
  document.querySelector('#catalogCardSelect')?.addEventListener('change',e=>{const id=document.querySelector('#catalogCollectionSelect')?.value;if(id&&e.target.value!==''){state.prefill=seedFromCatalogCard(id,e.target.value);render();}});
  bindPhotoPreview('frontPhotoFile','frontPhotoPreview'); bindPhotoPreview('backPhotoFile','backPhotoPreview');
  const form=document.querySelector('#cardForm'); if(form)form.addEventListener('submit',async e=>{
    e.preventDefault(); const submit=form.querySelector('button[type="submit"]'); if(submit){submit.disabled=true;submit.textContent='Guardando…';}
    const fd=new FormData(form),existing=state.editId?state.cards.find(c=>c.id===state.editId):null,card={...(existing||{}),id:existing?.id||uuid(),createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
    for(const [k,v] of fd.entries()){if(k!=='frontPhotoFile'&&k!=='backPhotoFile')card[k]=v;}
    ['rc','auto','relic','insert','sp','ssp'].forEach(k=>card[k]=fd.get(k)==='on');
    const front=document.querySelector('#frontPhotoFile')?.files?.[0],back=document.querySelector('#backPhotoFile')?.files?.[0];
    try{if(front){const blob=await compressImage(front);if(blob)await putPhoto(card.id,'front',blob);}if(back){const blob=await compressImage(back);if(blob)await putPhoto(card.id,'back',blob);}}catch{alert('La carta se guardará, pero no pude guardar una de las fotos en este dispositivo.');}
    if(existing){const idx=state.cards.findIndex(c=>c.id===existing.id);state.cards[idx]=card;state.selectedId=card.id;state.editId=null;state.view='detail';}
    else{state.cards.unshift(card);state.view='collection';state.query='';state.sport='Todos';state.prefill=null;}
    saveCards();render();
  });
  document.querySelector('#backToCollection')?.addEventListener('click',()=>{state.view='collection';state.selectedId=null;render();});
  document.querySelector('#editCard')?.addEventListener('click',()=>{state.editId=state.selectedId;state.view='edit';render();});
  document.querySelector('#deleteCard')?.addEventListener('click',async()=>{if(confirm('¿Eliminar esta carta de tu colección?')){const id=state.selectedId;state.cards=state.cards.filter(c=>c.id!==id);saveCards();await deleteCardPhotos(id);state.selectedId=null;state.view='collection';render();}});
  const doExport=()=>exportBackup(); document.querySelector('#exportBtn')?.addEventListener('click',doExport);document.querySelector('#exportBtnInline')?.addEventListener('click',doExport);document.querySelector('#importBtn')?.addEventListener('click',()=>document.querySelector('#importFile')?.click());document.querySelector('#importFile')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(file)importBackup(file);});
}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
render();

