const CACHE='lavuq-pwa-v3';
const CORE=[
  '/',
  '/index.html',
  '/app.html',
  '/styles.css',
  '/script.js',
  '/manifest.webmanifest',
  '/lavuq-q-square.png',
  '/CDB0DD01-2405-4ADE-952F-BBB1CE0EBEBD.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
          return response;
        })
        .catch(()=>caches.match(request).then(hit=>hit || caches.match('/app.html') || caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(hit=>{
      const network=fetch(request).then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
        }
        return response;
      }).catch(()=>hit);
      return hit || network;
    })
  );
});