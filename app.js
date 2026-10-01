const STORAGE_KEY = 'collectors-sports-v02-cards';
const SPORTS = ['Soccer','MLB','NFL','NBA','UFC','F1'];

const state = {
  view: 'home',
  sport: 'Todos',
  query: '',
  selectedId: null,
  cards: loadCards(),
};

function loadCards(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveCards(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cards)); }
function money(value, currency='MXN'){
  const n = Number(value || 0);
  return new Intl.NumberFormat('es-MX',{style:'currency',currency,maximumFractionDigits:0}).format(n);
}
function esc(value=''){
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
}
function tags(card){
  return ['rc','auto','relic','insert','sp','ssp'].filter(k=>card[k]).map(k=>k.toUpperCase());
}
function cardLabel(card){
  const parts=[card.year,card.manufacturer,card.product].filter(Boolean);
  return parts.join(' ');
}
function filteredCards(){
  const q=state.query.trim().toLowerCase();
  return state.cards.filter(card=>{
    const sportOk=state.sport==='Todos'||card.sport===state.sport;
    const hay=[card.player,card.team,card.product,card.manufacturer,card.parallel,card.cardNumber,card.serial].join(' ').toLowerCase();
    return sportOk && (!q || hay.includes(q));
  });
}
function totalValue(){ return state.cards.reduce((sum,c)=>sum+(c.currency==='USD'?Number(c.currentValue||0)*18:Number(c.currentValue||0)),0); }
function nav(){
  return `<nav class="bottom-nav">${navButton('home','Inicio')}${navButton('collection','Colección')}${navButton('add','Agregar')}</nav>`;
}
function navButton(view,label){ return `<button class="nav-btn ${state.view===view?'active':''}" data-nav="${view}">${label}</button>`; }
function layout(content){
  return `<main class="shell"><header class="topbar"><div class="brand"><div class="logo">CS</div><div><h1>Collectors Sports</h1><div class="muted">Tu colección deportiva</div></div></div></header>${content}</main>${nav()}`;
}
function home(){
  const counts=Object.fromEntries(SPORTS.map(s=>[s,state.cards.filter(c=>c.sport===s).length]));
  const hits=state.cards.filter(c=>c.auto||c.relic||c.rc||c.serial).length;
  return layout(`
    <section class="card hero"><div class="muted">Valor estimado de la colección</div><div class="hero-value">${money(totalValue(),'MXN')}</div><div class="muted">Valor normalizado a MXN para el dashboard · FX provisional 18 MXN/USD</div></section>
    <section class="grid"><div class="card metric"><span class="muted">Cartas</span><strong>${state.cards.length}</strong></div><div class="card metric"><span class="muted">Hits</span><strong>${hits}</strong></div><div class="card metric"><span class="muted">Soccer</span><strong>${counts.Soccer}</strong></div><div class="card metric"><span class="muted">MLB</span><strong>${counts.MLB}</strong></div></section>
    <div class="section-title"><h2>Por deporte</h2></div>
    <section class="card">${SPORTS.map(s=>`<div class="meta-row"><span>${s}</span><strong>${counts[s]}</strong></div>`).join('')}</section>
    ${state.cards.length===0?`<div class="section-title"><h2>Empezamos limpios</h2></div><section class="card empty">No hay jugadores ni cartas precargadas.<br><br><button class="btn" data-nav="add">Agregar primera carta</button></section>`:''}
  `);
}
function collection(){
  const cards=filteredCards();
  return layout(`
    <div class="section-title"><h2>Mi colección</h2><span class="muted">${cards.length} resultado${cards.length===1?'':'s'}</span></div>
    <div class="search-row"><input id="search" class="search" type="search" placeholder="Buscar jugador, equipo, set, paralelo…" value="${esc(state.query)}"><button class="btn secondary" id="clearSearch">Limpiar</button></div>
    <div class="filters">${['Todos',...SPORTS].map(s=>`<button class="chip ${state.sport===s?'active':''}" data-sport="${s}">${s}</button>`).join('')}</div>
    <section class="list">${cards.length?cards.map(card=>cardRow(card)).join(''):`<div class="card empty">No encontramos cartas con esos filtros.</div>`}</section>
  `);
}
function cardRow(card){
  return `<button class="item" data-card="${card.id}"><div class="item-head"><div><div class="item-title">${esc(card.player)}</div><div class="muted">${esc(cardLabel(card))}${card.cardNumber?` · #${esc(card.cardNumber)}`:''}</div></div><strong>${money(card.currentValue,card.currency)}</strong></div><div class="badges"><span class="badge green">${esc(card.sport)}</span>${card.parallel?`<span class="badge">${esc(card.parallel)}</span>`:''}${card.serial?`<span class="badge">${esc(card.serial)}</span>`:''}${tags(card).map(t=>`<span class="badge">${t}</span>`).join('')}</div></button>`;
}
function add(){
  return layout(`
    <div class="section-title"><h2>Agregar carta</h2></div>
    <div class="notice">Todos los campos comienzan vacíos. Esta versión guarda las cartas en este navegador para que podamos probar el flujo real.</div><br>
    <form id="addForm" class="form form-grid">
      ${selectField('sport','Deporte','Selecciona deporte',SPORTS,true)}
      ${inputField('player','Jugador','Ej. Lamine Yamal',true)}
      ${inputField('team','Equipo','Ej. FC Barcelona')}
      ${inputField('year','Año','2026',false,'number')}
      ${inputField('manufacturer','Fabricante','Topps / Panini')}
      ${inputField('product','Colección / producto','Topps Chrome UEFA')}
      ${inputField('cardNumber','Número de carta','75')}
      ${inputField('parallel','Paralelo','Gold Refractor')}
      ${inputField('serial','Numeración del ejemplar','12/50')}
      ${selectField('currency','Moneda','Selecciona moneda',['MXN','USD'],true)}
      ${inputField('purchasePrice','Precio de compra','0',false,'number')}
      ${inputField('currentValue','Valor estimado actual','0',false,'number')}
      ${selectField('condition','Estado','Selecciona estado',['Raw','PSA 10','PSA 9','BGS','SGC'])}
      ${selectField('storage','Ubicación física','Selecciona ubicación',['One Touch','Top Loader','Carpeta','Otra'])}
      <div class="field wide"><label>Características</label><div class="checks">${['RC','Auto','Relic','Insert','SP','SSP'].map(t=>`<label class="check"><input type="checkbox" name="${t.toLowerCase()}">${t}</label>`).join('')}</div></div>
      <div class="wide"><button class="btn full" type="submit">Guardar carta</button></div>
    </form>
  `);
}
function inputField(name,label,placeholder,required=false,type='text'){
  return `<div class="field"><label for="${name}">${label}${required?' *':''}</label><input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" ${required?'required':''}></div>`;
}
function selectField(name,label,placeholder,options,required=false){
  return `<div class="field"><label for="${name}">${label}${required?' *':''}</label><select id="${name}" name="${name}" ${required?'required':''}><option value="">${placeholder}</option>${options.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>`;
}
function detail(){
  const card=state.cards.find(c=>c.id===state.selectedId);
  if(!card){ state.view='collection'; return collection(); }
  return layout(`
    <button class="back" id="backToCollection">← Volver a colección</button><div class="section-title"><h2>${esc(card.player)}</h2></div>
    <section class="card"><div class="muted">Valor estimado actual</div><div class="detail-value">${money(card.currentValue,card.currency)}</div><div class="badges"><span class="badge green">${esc(card.sport)}</span>${tags(card).map(t=>`<span class="badge">${t}</span>`).join('')}</div><div class="meta">${meta('Equipo',card.team)}${meta('Colección',cardLabel(card))}${meta('Número',card.cardNumber?`#${card.cardNumber}`:'')}${meta('Paralelo',card.parallel)}${meta('Serial',card.serial)}${meta('Compra',card.purchasePrice?money(card.purchasePrice,card.currency):'')}${meta('Estado',card.condition)}${meta('Ubicación',card.storage)}</div><br><button class="btn danger full" id="deleteCard">Eliminar carta</button></section>
  `);
}
function meta(label,value){ return value?`<div class="meta-row"><span>${label}</span><strong>${esc(value)}</strong></div>`:''; }
function render(){
  document.querySelector('#app').innerHTML = state.view==='home'?home():state.view==='collection'?collection():state.view==='add'?add():detail();
  bind();
}
function bind(){
  document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.nav;state.selectedId=null;render();}));
  document.querySelectorAll('[data-sport]').forEach(b=>b.addEventListener('click',()=>{state.sport=b.dataset.sport;render();}));
  document.querySelectorAll('[data-card]').forEach(b=>b.addEventListener('click',()=>{state.selectedId=b.dataset.card;state.view='detail';render();}));
  const search=document.querySelector('#search');
  if(search) search.addEventListener('input',e=>{state.query=e.target.value; const pos=e.target.selectionStart; render(); const next=document.querySelector('#search'); if(next){next.focus();next.setSelectionRange(pos,pos);}});
  const clear=document.querySelector('#clearSearch');
  if(clear) clear.addEventListener('click',()=>{state.query='';render();});
  const form=document.querySelector('#addForm');
  if(form) form.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(form);
    const card={id:crypto.randomUUID(),createdAt:new Date().toISOString()};
    for(const [k,v] of fd.entries()) card[k]=v;
    ['rc','auto','relic','insert','sp','ssp'].forEach(k=>card[k]=fd.get(k)==='on');
    state.cards.unshift(card); saveCards(); state.view='collection'; state.query=''; state.sport='Todos'; render();
  });
  const back=document.querySelector('#backToCollection'); if(back) back.addEventListener('click',()=>{state.view='collection';render();});
  const del=document.querySelector('#deleteCard'); if(del) del.addEventListener('click',()=>{ if(confirm('¿Eliminar esta carta de tu colección?')){state.cards=state.cards.filter(c=>c.id!==state.selectedId);saveCards();state.selectedId=null;state.view='collection';render();}});
}
render();
