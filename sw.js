const CACHE='collectors-sports-v06b';
const IMAGE_CACHE='collectors-sports-images-v1';
const CORE=['./','./index.html','./styles.css?v=06b','./v05.css?v=06b','./v06.css?v=06b','./catalog.js?v=06b','./catalog-extra.js?v=06b','./catalog-imported.js?v=06b','./catalog-premier.js?v=06b','./catalog-runtime.js?v=06b','./catalog-images.js?v=06b','./catalog-images-official.js?v=06b','./app-v05.js?v=06b','./app-v06-addon.js?v=06b','./manifest.webmanifest?v=06b','./icon.svg?v=06b'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE && k!==IMAGE_CACHE).map(k=>caches.delete(k))))
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

  const visualHost=url.hostname==='images.topps.com' || url.hostname==='hobbyscan-images-prod.s3.us-east-2.amazonaws.com';
  if(visualHost){
    event.respondWith(caches.open(IMAGE_CACHE).then(async cache=>{
      const cached=await cache.match(event.request);
      try{
        const response=await fetch(event.request);
        if(response && (response.ok || response.type==='opaque')) cache.put(event.request,response.clone());
        return response;
      }catch(error){
        if(cached) return cached;
        throw error;
      }
    }));
    return;
  }

  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});
