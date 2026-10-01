const CACHE='collectors-sports-v05b';
const CORE=['./','./index.html','./styles.css?v=05b','./v05.css?v=05b','./catalog.js?v=05b','./catalog-extra.js?v=05b','./catalog-imported.js?v=05b','./catalog-premier.js?v=05b','./catalog-runtime.js?v=05b','./app-v05.js?v=05b','./manifest.webmanifest?v=05b','./icon.svg?v=05b'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  ]));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin===self.location.origin){
    event.respondWith(fetch(event.request).then(response=>{
      if(response && response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});
