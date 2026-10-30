const V='roamed-v1';
const SHELL=['./','index.html','app.js','manifest.webmanifest','icon.svg','icon-512.png','apple-touch-icon.png'];
const CDN=['https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js','https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js','https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL).then(()=>Promise.all(CDN.map(u=>c.add(u).catch(()=>{}))))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(ca=>ca.put(r.mode==='navigate'?'index.html':r,c))}return res}).catch(()=>caches.match(r.mode==='navigate'?'index.html':r,{ignoreSearch:true})));
  }else if(/jsdelivr|gstatic|googleapis/.test(u.host)){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(V).then(ca=>ca.put(r,c))}return res})));
  }
});
