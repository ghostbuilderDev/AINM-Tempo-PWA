/* AINM Tempo planning – caches isolés du reste des PWA AINM GitHub Pages. */
const OWN_CACHE_PREFIX='ainm-tempo-pwa-planning-';
const CACHE=OWN_CACHE_PREFIX+'v7-colors';
const STATIC=['./','./index.html','./app.js','./style.css','./normalisation.js','./planning-core.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./icon.svg'];
const URLs=new Set(STATIC.map(p=>new URL(p,self.registration.scope).href));
self.addEventListener('install',ev=>{ev.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',ev=>{ev.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>(k.startsWith(OWN_CACHE_PREFIX)||k==='ainm-tempo-shell-v2')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('fetch',ev=>{const req=ev.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
if(req.mode==='navigate'){ev.respondWith(fetch(req).catch(()=>caches.match(new URL('./index.html',self.registration.scope))));return;}
if(!URLs.has(url.href))return;
ev.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(req);if(hit)return hit;const response=await fetch(req);if(response.ok)await c.put(req,response.clone());return response;}));
});
