const CACHE='collectors-sports-v08d';
const IMAGE_CACHE='collectors-sports-images-v1';
const CORE=['./','./index.html','./styles.css?v=08d','./v05.css?v=08d','./v06.css?v=08d','./v06-polish.css?v=08d','./v07.css?v=08d','./catalog.js?v=08d','./catalog-extra.js?v=08d','./catalog-imported.js?v=08d','./catalog-premier.js?v=08d','./catalog-owned.js?v=08d','./catalog-owned-batch2.js?v=08d','./catalog-owned-batch3.js?v=08d','./catalog-runtime.js?v=08d','./catalog-images.js?v=08d','./catalog-images-official.js?v=08d','./catalog-images-extra.js?v=08d','./catalog-images-cached.js?v=08d','./market-seed.js?v=08d','./app-v05.js?v=08d','./app-v06-addon.js?v=08d','./app-v06-polish.js?v=08d','./app-v06-fix.js?v=08d','./pricing-engine.js?v=08d','./app-v08-image-guard.js?v=08d','./app-v08-catalog.js?v=08d','./manifest.webmanifest?v=08d','./icon.svg?v=08d'];

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
