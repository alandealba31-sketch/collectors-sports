const CACHE='collectors-sports-v05';
const CORE=['./','./index.html','./styles.css?v=05','./v05.css?v=05','./catalog.js?v=05','./catalog-extra.js?v=05','./catalog-imported.js?v=05','./catalog-runtime.js?v=05','./app-v05.js?v=05','./manifest.webmanifest?v=05','./icon.svg?v=05'];

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
