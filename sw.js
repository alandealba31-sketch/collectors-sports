const CACHE='collectors-sports-v04e';
const CORE=['./','./index.html','./styles.css?v=04e','./catalog.js?v=04e','./catalog-extra.js?v=04e','./catalog-imported.js?v=04e','./catalog-runtime.js?v=04e','./app.js?v=04e','./manifest.webmanifest?v=04e','./icon.svg?v=04e'];

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
    event.respondWith(
      fetch(event.request).then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        }
        return response;
      }).catch(()=>caches.match(event.request))
    );
    return;
  }

  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});