'use strict';
/* Roamd — personal travel tracker. Everything is saved on this device (localStorage + IndexedDB). */
const RAW="__RAW__";
const REGIONS=[["NA","North America"],["CA","Central America"],["CB","Caribbean"],["SA","South America"],["EU","Europe"],["ME","Middle East"],["AF","Africa"],["CAS","Central Asia"],["SAS","South Asia"],["EAS","East Asia"],["SEA","Southeast Asia"],["AU","Australia & NZ"],["OC","Oceania"],["AN","Antarctica"]];
const RNAME=Object.fromEntries(REGIONS);
const C=[],BY={},BYN={};
RAW.split(';').forEach(r=>{const[n,cc,name,reg,core]=r.split('|');const o={n,cc,name,reg,core:core==='1'};C.push(o);BY[cc]=o;if(n)BYN[+n]=o});
C.sort((a,b)=>a.name.localeCompare(b.name));
const CORE=C.filter(c=>c.core).length;
const MAPNAME={"Kosovo":"XK","N. Cyprus":"CY","Somaliland":"SO"};
const CDN={d3:'vendor/d3.min.js',topo:'vendor/topojson-client.min.js',map:'vendor/countries-50m.json'};
const STATUS_L={idea:'Idea',booked:'Booked',done:'Done'};
const KL={been:'Been',want:'Want to go',lived:'Lived',drive:'Drove through'};
const QL={been:'Been',want:'Want',lived:'Lived',drive:'Drove'};

const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const today=()=>new Date().toISOString().slice(0,10);
const flag=cc=>cc.startsWith('D-')?'🏳️':cc.replace(/./g,ch=>String.fromCodePoint(127397+ch.charCodeAt(0)));
const plural=(n,w)=>`${n} ${n===1?w:/[^aeiou]y$/.test(w)?w.slice(0,-1)+'ies':w+'s'}`;
const I={
map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
list:'<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
stats:'<path d="M5 20V11M11 20V4M17 20v-7M3 20h18"/>',
people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.8c1.8.7 3 2.5 3 5.2"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
back:'<path d="m15 18-6-6 6-6"/>',
chev:'<path d="m9 6 6 6-6 6"/>',
gear:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
help:'<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.4M12 17h.01"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
play:'<path d="M7 4v16l13-8z"/>',
ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
x:'<path d="M6 6l12 12M18 6 6 18"/>',
pencil:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
clip:'<rect x="8" y="3" width="8" height="4" rx="1"/><path d="M8 5H6v16h12V5h-2"/>',
share:'<path d="M12 3v12M7 8l5-5 5 5M5 13v7h14v-7"/>',
expand:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
shrink:'<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
star:'<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
plane:'<path d="M12 3c.8 0 1.3.9 1.3 2v4.6l6.7 4v1.8l-6.7-2.2v3.9l2 1.5V20L12 19l-3.3 1v-1.4l2-1.5v-3.9L4 16.4v-1.8l6.7-4V5c0-1.1.5-2 1.3-2z"/>',
};
const ic=(n,c='')=>`<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;

/* ---------- storage ---------- */
const LS='roamed.v1';
let S;
const blank=()=>({v:1,countries:{},sections:[],plans:[],friends:[],airports:{},me:'',settings:{theme:'auto',palette:'classic',palCustom:null,planes:true,lastBackup:0,nag:0,tourDone:false},saved:0});
let dbp;
function db(){return dbp||(dbp=new Promise((res,rej)=>{const r=indexedDB.open('roamed',1);r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('kv');d.createObjectStore('photos',{keyPath:'id'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))}
async function idb(store,mode,fn){const d=await db();return new Promise((res,rej)=>{const t=d.transaction(store,mode);let out;const r=fn(t.objectStore(store));if(r)r.onsuccess=()=>{out=r.result};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)})}
const kvGet=k=>idb('kv','readonly',s=>s.get(k)),kvSet=(k,v)=>idb('kv','readwrite',s=>s.put(v,k));
const phPut=p=>idb('photos','readwrite',s=>s.put(p)),phGet=id=>idb('photos','readonly',s=>s.get(id));
const phDel=id=>idb('photos','readwrite',s=>s.delete(id)),phAll=()=>idb('photos','readonly',s=>s.getAll());
const phClear=()=>idb('photos','readwrite',s=>s.clear());

async function load(){
  let a=null,b=null;
  try{const raw=localStorage.getItem(LS);if(raw)a=JSON.parse(raw)}catch(e){try{localStorage.setItem(LS+'.broken',localStorage.getItem(LS))}catch(_){}}
  try{b=await kvGet('state')}catch(e){}
  const best=[a,b].filter(x=>x&&x.v).sort((x,y)=>(y.saved||0)-(x.saved||0))[0];
  S=Object.assign(blank(),best||{});S.settings=Object.assign(blank().settings,S.settings||{});
}
let saveT;
function save(){
  if(DEMO&&S===DEMO)return;
  S.saved=Date.now();
  try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){toast('Phone storage is full. Save a backup.')}
  clearTimeout(saveT);saveT=setTimeout(()=>kvSet('state',JSON.parse(JSON.stringify(S))).catch(()=>{}),300);
}
const cs=cc=>S.countries[cc]||{};
const co=cc=>S.countries[cc]||(S.countries[cc]={});
function setK(cc,k,v){const o=co(cc);setFlags(o,k,v);save()}
const tier=s=>s.lived?'lived':s.been?'been':s.drive?'drive':s.want?'want':'';

/* ---------- sheets (stacked full-screen panels, back button aware) ---------- */
const stack=[];let backWaiters=[];
function sheet(o){
  const el=document.createElement('div');el.className='sheet';$('#sheets').append(el);
  o.el=el;o.refresh=()=>{const b=$('.sbody',el),st=b?b.scrollTop:0;const dk=d=>d.dataset.k||d.className,was={};el.querySelectorAll('details').forEach(d=>{was[dk(d)]=d.open});o.render(el);el.querySelectorAll('details').forEach(d=>{if(dk(d) in was)d.open=was[dk(d)]});fillPhotos(el);const nb=$('.sbody',el);if(nb)nb.scrollTop=st};
  el.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(t&&t.dataset.act==='back'){history.back();return}o.click&&o.click(e,t)});
  if(o.input)el.addEventListener('input',e=>o.input(e));
  if(o.change)el.addEventListener('change',e=>o.change(e));
  stack.push(o);o.refresh();history.pushState({s:stack.length},'');
  requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('in')));
  return o;
}
window.addEventListener('popstate',()=>{
  const o=stack.pop();
  if(o){o.el.classList.remove('in');o.el.querySelectorAll('iframe').forEach(f=>f.remove());setTimeout(()=>o.el.remove(),260);render();stack.forEach(s=>s.refresh())}
  const w=backWaiters;backWaiters=[];w.forEach(f=>f());
});
const back=()=>new Promise(r=>{backWaiters.push(r);history.back()});
const shead=(title,right='')=>`<div class="shead"><button class="iconbtn" data-act="back" aria-label="Back">${ic('back')}</button><div class="stitle">${title}</div><div class="sright">${right}</div></div>`;

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2600)}

/* ---------- tabs ---------- */
let tab='map';
function setTab(t){tab=t;$$('.view').forEach(v=>v.hidden=v.id!=='v-'+t);$$('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));render()}
function render(){({map:renderMapView,list:renderList,plans:renderPlans,compare:renderCompare,stats:renderStats})[tab]()}

/* ---------- map ---------- */
let mapReady=false,mapSvg,mapG,mapPaths,mapDots,zoom,curK=1,FEATS=[],PATHD=[],DOTS=[],geoPath;
const MW=1000,MH=520;
function loadScript(src){return new Promise((res,rej)=>{if($(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.append(s)})}
let geoP;
function loadGeo(){return geoP||(geoP=(async()=>{
  await loadScript(CDN.d3);await loadScript(CDN.topo);
  const topo=await (await fetch(CDN.map)).json();
  FEATS=topojson.feature(topo,topo.objects.countries).features;
  const proj=d3.geoNaturalEarth1().fitExtent([[4,4],[MW-4,MH-4]],{type:'Sphere'});
  geoPath=d3.geoPath(proj);
  // Split overseas parts that the map data glues onto the home country, so each fills only for itself.
  const SPLIT={FR:(x,y)=>x<-30?(y<8?'GF':y>15.5?'GP':'MQ'):x>40&&y<0?(x>50?'RE':'YT'):'',NL:x=>x<-30?'BQ':'',NO:(x,y)=>y>74||x<-5?'SJ':''};
  const parts=[];
  for(const f of FEATS){
    const c=BYN[+f.id]||BY[MAPNAME[f.properties.name]];const cc=c?c.cc:'';
    if(SPLIT[cc]&&f.geometry.type==='MultiPolygon'){
      const groups={};
      for(const p of f.geometry.coordinates){const[x,y]=d3.geoCentroid({type:'Polygon',coordinates:p});const to=SPLIT[cc](x,y)||cc;(groups[to]||(groups[to]=[])).push(p)}
      for(const k in groups)parts.push({cc:k,f:{type:'Feature',geometry:{type:'MultiPolygon',coordinates:groups[k]}}});
    }else parts.push({cc,f});
  }
  PATHD=parts.map(p=>({cc:p.cc,f:p.f,d:geoPath(p.f)}));
  // Dots for countries too small to see at world zoom, and for ones with no shape in the map data.
  const area={},best={};
  for(const p of PATHD){if(!p.cc)continue;const g=p.f.geometry;const polys=g.type==='MultiPolygon'?g.coordinates:[g.coordinates];
    for(const poly of polys){const pg={type:'Polygon',coordinates:poly},a=geoPath.area(pg);area[p.cc]=(area[p.cc]||0)+a;if(!best[p.cc]||a>best[p.cc].a)best[p.cc]={a,pt:geoPath.centroid(pg)}}}
  const proj2=geoPath.projection();
  DOTS=Object.keys(area).filter(cc=>area[cc]<8&&!isNaN(best[cc].pt[0])).map(cc=>({cc,x:best[cc].pt[0],y:best[cc].pt[1]}));
  for(const[cc,lon,lat]of[['TV',179.2,-8.5],['TK',-171.8,-9.2],['GI',-5.35,36.14],['CC',96.87,-12.16],['CX',105.69,-10.45]])if(!area[cc]){const[x,y]=proj2([lon,lat]);DOTS.push({cc,x,y})}
  return true;
})().catch(e=>{geoP=null;throw e}))}
async function initMap(){
  const box=$('#mapBox');
  try{await loadGeo()}catch(e){box.innerHTML='<p class="muted pad">The map needs internet the first time it opens. Countries, Plans and Compare work without it.</p><button class="btn sm" id="mapRetry">Try again</button>';$('#mapRetry').onclick=()=>{box.innerHTML='<div class="loading">Loading map…</div>';initMap()};return}
  box.innerHTML='';
  mapSvg=d3.select(box).append('svg').attr('viewBox',`0 0 ${MW} ${MH}`).attr('class','map').attr('role','img').attr('aria-label','World map');
  mapG=mapSvg.append('g');
  mapG.append('path').attr('class','sphere').attr('d',geoPath({type:'Sphere'}));
  mapPaths=mapG.selectAll('path.c').data(PATHD).join('path').attr('d',d=>d.d).attr('data-cc',d=>d.cc).attr('class','c');
  gReg=mapG.append('g').attr('class','regs');gBord=mapG.append('g').attr('class','bords');gDisp=mapG.append('g').attr('class','disp');
  mapDots=mapG.selectAll('g.dotg').data(DOTS).join('g').attr('class','dotg').attr('transform',d=>`translate(${d.x},${d.y})`);
  mapDots.append('circle').attr('class','hit');mapDots.append('circle').attr('class','dm');
  gFlight=mapG.append('g').attr('class','flights');gList=mapG.append('g').attr('class','lmks');gCity=mapG.append('g').attr('class','cities');gPlane=mapG.append('g').attr('class','planes');
  mapPaths.on('click',(e,d)=>{if(d.cc)openCountry(d.cc)});
  mapDots.on('click',(e,d)=>openCountry(d.cc));
  zoom=d3.zoom().scaleExtent([1,128]).translateExtent([[-200,-120],[MW+200,MH+120]]).on('zoom',e=>{mapG.attr('transform',e.transform);curK=e.transform.k;sizeDots()});
  mapSvg.call(zoom).on('dblclick.zoom',null);
  mapReady=true;paintMap();fitStart();
}
function viewDims(){const r=mapSvg.node().getBoundingClientRect();const s=Math.min(r.width/MW,r.height/MH)||1;return{vw:r.width/s,vh:r.height/s}}
function fitStart(){const{vw,vh}=viewDims();const k=Math.max(1,Math.min(1.55,vh/MH));mapSvg.call(zoom.transform,d3.zoomIdentity.translate(MW/2-k*(MW/2-20),MH/2-k*(MH/2-10)).scale(k))}
function mainBounds(f){let g=f.geometry;if(g&&g.type==='MultiPolygon'){let best=null,ba=-1;for(const p of g.coordinates){const a=geoPath.area({type:'Polygon',coordinates:p});if(a>ba){ba=a;best=p}}g={type:'Polygon',coordinates:best}}return geoPath.bounds(g)}
function zoomRegion(rc){
  if(!mapReady)return;if(!rc){fitStart();return}
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const p of PATHD){const c=BY[p.cc];if(!c||c.reg!==rc||(!c.core&&rc!=='AN')||(rc==='EU'&&p.cc==='RU'))continue;const[[a,b],[cc,d]]=mainBounds(p.f);x0=Math.min(x0,a);y0=Math.min(y0,b);x1=Math.max(x1,cc);y1=Math.max(y1,d)}
  if(x0>x1)return;
  const{vw,vh}=viewDims();const k=Math.min(20,0.88/Math.max((x1-x0)/vw,(y1-y0)/vh));
  mapSvg.transition().duration(600).call(zoom.transform,d3.zoomIdentity.translate(MW/2-k*(x0+x1)/2,MH/2-k*(y0+y1)/2).scale(k));
}
function pxPerUnit(){const r=mapSvg.node().getBoundingClientRect();return(Math.min(r.width/MW,r.height/MH)||.4)*curK}
function sizeDots(){if(!mapDots)return;const u=pxPerUnit();
  // dots shrink away once you've zoomed in far enough to see the real shape
  mapDots.style('display',u>14?'none':null);
  mapDots.select('.dm').attr('r',d=>(tier(cs(d.cc))?4.2:2.6)/u);mapDots.select('.hit').attr('r',11/u);sizePoints();sizeLists()}
const fillCls=cc=>{if(cc&&cc===S.settings.home)return' home';const t=tier(cs(cc));return t?(partial(cc)?' t-':' s-')+t:''};
function paintMap(){if(!mapReady)return;mapPaths.attr('class',d=>d.cc?'c'+fillCls(d.cc):'c none');
  mapDots.attr('class',d=>'dotg'+fillCls(d.cc));paintPoints();paintFlights();paintLists();sizeDots();paintRegions();paintDisputed()}
function counts(){let been=0,want=0,lived=0,terr=0,drive=0;for(const c of C){if(c.disp)continue;const s=cs(c.cc);if(s.been){c.core?been++:terr++}if(s.want&&!s.been&&!s.drive)want++;if(s.lived)lived++;if(s.drive&&(c.core||S.settings.countTerr))drive++}const t=countTotals();return{been:t.been,total:t.total,want,lived,drive,terr:S.settings.countTerr?0:terr}}
function renderMapView(){
  paintMap();const n=counts();
  $('#legend').innerHTML=`<span class="lg"><i class="dot been"></i>Been <b>${n.been}</b></span><span class="lg"><i class="dot want"></i>Want to go <b>${n.want}</b></span><span class="lg"><i class="dot lived"></i>Lived <b>${n.lived}</b></span>${n.drive?`<span class="lg"><i class="dot drive"></i>Drove through <b>${n.drive}</b></span>`:''}${Object.keys(S.airports||{}).length?`<span class="lg">${ic('plane','lgp')}Airports <b>${Object.keys(S.airports).length}</b></span>`:''}`;
  const has=Object.keys(S.countries).length||S.plans.length;
  const old=Date.now()-(S.settings.lastBackup||0)>14*864e5&&Date.now()-(S.settings.nag||0)>7*864e5;
  $('#nag').innerHTML=has&&old?`<div class="nag"><span>${S.settings.lastBackup?'It’s been 2+ weeks since your last backup.':'You haven’t saved a backup yet.'}</span><button class="btn sm" data-nag="save">Save backup</button><button class="btn sm ghost" data-nag="later">Later</button></div>`:'';
}

/* ---------- v2: colors (Ironwood-style), states/provinces, cities, airports ---------- */
const PALETTES={
  classic:['Classic','',{been:'#3fbf93',want:'#f0b24f',lived:'#8682f2',drive:'#5aa0e0'},{been:'#2f9e7a',want:'#e2a03a',lived:'#5b57d1',drive:'#2f7cc4'}],
  sunset:['Sunset','',{been:'#ff7a3d',want:'#ffd84d',lived:'#ff4d6d',drive:'#9b8cff'},{been:'#d65314',want:'#c99a00',lived:'#c9184a',drive:'#6a5acd'}],
  ocean:['Ocean','',{been:'#2ec4d6',want:'#9be564',lived:'#6f8cff',drive:'#ffb86b'},{been:'#00838f',want:'#4f9d2a',lived:'#3352d6',drive:'#d9822b'}],
  forest:['Forest','',{been:'#7bc96f',want:'#e8c547',lived:'#c47ad6',drive:'#5ab0d6'},{been:'#3c8a3a',want:'#b58900',lived:'#8e44ad',drive:'#2f86ad'}],
  rg:['Red-green friendly','For protanopia and deuteranopia',{been:'#56b4e9',want:'#f0c000',lived:'#e07bb4',drive:'#e8743b'},{been:'#0072b2',want:'#c99a00',lived:'#b0457f',drive:'#d55e00'}],
  by:['Blue-yellow friendly','For tritanopia',{been:'#26c6da',want:'#ff8fb1',lived:'#b39ddb',drive:'#ff7043'},{been:'#00838f',want:'#d81b60',lived:'#5e35b1',drive:'#d84315'}],
};
const lum=h=>{const n=parseInt(h.slice(1),16);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(n>>16)+.7152*f((n>>8)&255)+.0722*f(n&255)};
const inkFor=h=>lum(h)>.2?'#14171b':'#ffffff';
const hsv2hex=(h,s,v)=>{h=((h%360)+360)%360;const f=n=>{const k=(n+h/60)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1))};return'#'+[f(5),f(3),f(1)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')};
const hex2hsv=hex=>{const n=parseInt(hex.slice(1),16);const r=(n>>16)/255,g=((n>>8)&255)/255,b=(n&255)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d)h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return{h:(h*60+360)%360,s:mx?d/mx:0,v:mx}};
const KEYS=['been','want','lived','drive'];
function customPal(c){
  c=c||S.settings.palCustom||customFrom('classic');if(c.cols.length<KEYS.length){const q=hex2hsv(PALETTES.classic[2].drive);c.cols=c.cols.concat([{h:q.h,s:q.s}])}const v=c.v;
  const dark=c.cols.map(x=>hsv2hex(x.h,x.s,v)),light=c.cols.map(x=>hsv2hex(x.h,Math.min(1,x.s*1.08+.05),Math.max(.35,v*.72)));
  const mk=cs=>({been:cs[0],want:cs[1],lived:cs[2],drive:cs[3]});
  return['Custom','Your three colors',mk(dark),mk(light)];
}
function customFrom(k){const P=PALETTES[k]||PALETTES.classic;const d=P[2];const cols=KEYS.map(x=>{const q=hex2hsv(d[x]);return{h:q.h,s:q.s}});return{v:Math.max(.55,Math.max(...KEYS.map(x=>hex2hsv(d[x]).v))),mode:'square',cols}}
const palFor=k=>k==='custom'?customPal():PALETTES[k]||PALETTES.classic;
function palVars(c){return KEYS.map(k=>`--${k}:${c[k]};--${k}-ink:${inkFor(c[k])};`).join('')}
function applyHomeColor(){document.documentElement.style.setProperty('--home',S.settings.homeColor||'#c4532d')}
function applyPalette(){applyHomeColor();
  let el=$('#palette');const k=S.settings.palette||'classic';
  if(k==='classic'){if(el)el.remove();return}
  if(!el){el=document.createElement('style');el.id='palette';document.head.appendChild(el)}
  const P=palFor(k),d=P[2],l=P[3];
  el.textContent=`html:root{${palVars(l)}}@media (prefers-color-scheme:dark){html:root:not([data-theme="light"]){${palVars(d)}}}html:root[data-theme="dark"]{${palVars(d)}}`;
}
function paletteHTML(){
  const cur=S.settings.palette||'classic',dark=document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);
  const sw=P=>{const c=P[dark?2:3];return`<span class="sw">${KEYS.map(k=>`<i style="background:${c[k]}"></i>`).join('')}</span>`};
  return`<div class="pal-grid">${Object.entries(PALETTES).map(([k,P])=>`<button class="pal${cur===k?' on':''}" data-act="pal" data-v="${k}" aria-pressed="${cur===k}">${sw(P)}<span class="pn">${P[0]}</span>${P[1]?`<span class="pd">${P[1]}</span>`:''}</button>`).join('')}
  <button class="pal${cur==='custom'?' on':''}" data-act="palcustom" aria-pressed="${cur==='custom'}">${sw(customPal())}<span class="pn">Custom</span><span class="pd">${S.settings.palCustom?'Tap to edit':'Pick your own three'}</span></button></div>`;
}
const HARMONY=[['complementary','Complementary',[180]],['split','Split',[150,210]],['triadic','Triadic',[120,240]],['square','Square',[90,180,270]],['analogous','Analogous',[-30,30]]];
const SLOTS=[['Been','Countries, states and cities you’ve been to'],['Want to go','Places on your list'],['Lived','Places you’ve lived'],['Drove through','Places you only passed through']];
function openColors(){
  const c=JSON.parse(JSON.stringify(S.settings.palCustom||customFrom(S.settings.palette||'classic')));if(c.cols.length<KEYS.length){const q=hex2hsv(PALETTES.classic[2].drive);c.cols.push({h:q.h,s:q.s})}
  let sel=0,target=1;const R=130;
  const o=sheet({
    render(el){
      const cur=c.cols[sel],offs=(HARMONY.find(x=>x[0]===c.mode)||HARMONY[3])[2];
      const sugg=offs.map(d=>({h:(cur.h+d+360)%360,s:cur.s}));
      const others=KEYS.map((_,i)=>i).filter(i=>i!==sel);if(!others.includes(target))target=others[0];
      const hexes=c.cols.map(x=>hsv2hex(x.h,x.s,c.v));
      const pos=(h,s)=>{const a=(h-90)*Math.PI/180;return[R+Math.cos(a)*s*R,R+Math.sin(a)*s*R]};const[hx,hy]=pos(cur.h,cur.s);
      el.innerHTML=`${shead('<span class="tt"><b>Custom colors</b></span>')}<div class="sbody">
      <p class="muted small">Pick a color, then drag on the wheel. Dashed lines point to colors that go with it.</p>
      <div class="slot-pick">${SLOTS.map(([n,d],i)=>`<button class="slot-btn${sel===i?' on':''}" data-act="slot" data-i="${i}" aria-pressed="${sel===i}"><i style="background:${hexes[i]}"></i><span><b>${n}</b><span class="d">${d}</span></span></button>`).join('')}</div>
      <div class="wheel" id="wheel" style="width:${R*2}px;height:${R*2}px"><canvas width="${R*2}" height="${R*2}"></canvas>
        <svg viewBox="0 0 ${R*2} ${R*2}">${sugg.map(q=>{const[x,y]=pos(q.h,q.s);return`<line x1="${R}" y1="${R}" x2="${x}" y2="${y}" class="wl sug"/><circle cx="${x}" cy="${y}" r="11" class="wd-sug" style="fill:${hsv2hex(q.h,q.s,c.v)}"/>`}).join('')}
        <line x1="${R}" y1="${R}" x2="${hx}" y2="${hy}" class="wl"/><circle cx="${R}" cy="${R}" r="4" class="wc"/><circle cx="${hx}" cy="${hy}" r="15" class="wd-main" style="fill:${hexes[sel]}"/></svg></div>
      <h4 class="sub">Suggestions</h4><div class="chips wrapchips">${HARMONY.map(([k,l])=>`<button class="${c.mode===k?'on':''}" data-act="mode" data-v="${k}">${l}</button>`).join('')}</div>
      <div class="sugrow">${sugg.map((q,i)=>`<button class="sug-sw" data-act="sugg" data-i="${i}" aria-label="Use this color for ${SLOTS[target][0]}" style="background:${hsv2hex(q.h,q.s,c.v)}"></button>`).join('')}<span class="small muted">Tap one to use it for <b>${SLOTS[target][0]}</b></span></div>
      <button class="btn ghost wide" data-act="fill">Use suggestions for ${others.map(i=>SLOTS[i][0]).join(' and ')}</button>
      <label class="fld"><span>Brightness (all three)</span><input type="range" id="cwv" min="55" max="100" value="${Math.round(c.v*100)}"></label>
      <div class="cw-prev">${KEYS.map((k,i)=>`<span style="background:${hexes[i]};color:${inkFor(hexes[i])}">${KL[k]}</span>`).join('')}</div>
      <p class="tiny muted">Light mode uses deeper versions of the same three colors.</p>
      <div class="btnrow"><button class="btn ghost" data-act="back" style="flex:1">Cancel</button><button class="btn" data-act="save" style="flex:2">Use these colors</button></div></div>`;
      const cv=$('canvas',el),ctx=cv.getContext('2d'),img=ctx.createImageData(R*2,R*2),d=img.data;
      for(let y=0;y<R*2;y++)for(let x=0;x<R*2;x++){const dx=x-R+.5,dy=y-R+.5,r=Math.sqrt(dx*dx+dy*dy),i=(y*R*2+x)*4;if(r>R)continue;const n=parseInt(hsv2hex(Math.atan2(dy,dx)*180/Math.PI+90,r/R,c.v).slice(1),16);d[i]=n>>16;d[i+1]=(n>>8)&255;d[i+2]=n&255;d[i+3]=r>R-1?Math.round(255*(R-r)):255}
      ctx.putImageData(img,0,0);
      const wh=$('#wheel',el);let drag=false;
      const pick=e=>{const b=wh.getBoundingClientRect(),dx=e.clientX-b.left-R,dy=e.clientY-b.top-R;c.cols[sel]={h:(Math.atan2(dy,dx)*180/Math.PI+90+360)%360,s:Math.min(1,Math.sqrt(dx*dx+dy*dy)/R)};o.refresh()};
      wh.onpointerdown=e=>{drag=true;pick(e);const move=ev=>{if(drag)pick(ev)},up=()=>{drag=false;removeEventListener('pointermove',move);removeEventListener('pointerup',up)};addEventListener('pointermove',move);addEventListener('pointerup',up)};
      $('#cwv',el).onchange=e=>{c.v=+e.target.value/100;o.refresh()};
      this.sugg=sugg;this.others=others;
    },
    async click(e,t){if(!t)return;const a=t.dataset.act;
      if(a==='slot'){sel=+t.dataset.i;target=KEYS.map((_,i)=>i).find(k=>k!==sel);this.refresh()}
      else if(a==='mode'){c.mode=t.dataset.v;this.refresh()}
      else if(a==='sugg'){c.cols[target]=this.sugg[+t.dataset.i];target=this.others.find(i=>i!==target);this.refresh()}
      else if(a==='fill'){this.others.forEach((i,k)=>{c.cols[i]=this.sugg[k]||this.sugg[0]});this.refresh()}
      else if(a==='save'){S.settings.palCustom=c;S.settings.palette='custom';save();applyPalette();await back();toast('Custom colors on')}},
  });
}

/* states / provinces */
let REGIDX=null;const REGGEO={};
const RWORD={US:'States',MX:'States',BR:'States',AU:'States & territories',IN:'States',DE:'States',AT:'States',NG:'States',MY:'States',VE:'States',CA:'Provinces & territories',CN:'Provinces',AR:'Provinces',ZA:'Provinces',TR:'Provinces',IR:'Provinces',PK:'Provinces',TH:'Provinces',VN:'Provinces',KR:'Provinces',AF:'Provinces',NL:'Provinces',BE:'Provinces',JP:'Prefectures',IQ:'Governorates',EG:'Governorates',JO:'Governorates',SY:'Governorates',LB:'Governorates',OM:'Governorates',YE:'Governorates',KW:'Governorates',BH:'Governorates',TN:'Governorates',ID:'Provinces',GB:'Nations & regions',ES:'Communities',IE:'Counties',SE:'Counties',NO:'Counties',CH:'Cantons'};
const rword=cc=>RWORD[cc]||'Regions';
async function regIndex(){if(REGIDX)return REGIDX;try{REGIDX=await(await fetch('regions/index.json')).json()}catch(e){REGIDX=null;return{}}return REGIDX}
async function regGeo(cc){if(REGGEO[cc])return REGGEO[cc];await loadScript(CDN.topo);const t=await(await fetch(`regions/${cc}.json`)).json();return REGGEO[cc]=topojson.feature(t,t.objects.r).features}
const rs=(cc,id)=>((cs(cc).regions)||{})[id]||{};
function setFlags(x,k,v){x[k]=v;if(k==='lived'&&v)x.been=true;if(k==='been'&&!v)x.lived=false;if(v&&(k==='been'||k==='lived'))x.drive=false;if(v&&k==='drive'){x.been=false;x.lived=false}}
// Marking a state or city also marks its country, but never downgrades it (Drove through never replaces Been).
function liftUp(cc,k,v){const c=cs(cc);if(!v||c[k]||(k==='drive'&&(c.been||c.lived))){save();return}setK(cc,k,true)}
function setR(cc,id,k,v){const o=co(cc),r=o.regions||(o.regions={}),x=r[id]||(r[id]={});setFlags(x,k,v);if(!x.been&&!x.want&&!x.lived&&!x.drive)delete r[id];liftUp(cc,k,v)}
/* cities */
let CITIES=null;
async function loadCities(){if(CITIES)return CITIES;try{CITIES=await(await fetch('cities.json')).json()}catch(e){return{}}return CITIES}
const ct=(cc,n)=>((cs(cc).cities)||{})[n]||{};
function setCity(cc,row,k,v){const o=co(cc),m=o.cities||(o.cities={}),x=m[row[0]]||(m[row[0]]={lat:row[1],lon:row[2],adm:row[3]||''});setFlags(x,k,v);if(!x.been&&!x.want&&!x.lived&&!x.drive)delete m[row[0]];liftUp(cc,k,v)}
const partial=cc=>{const s=cs(cc);return!!(statesOn(cc)&&s.regions&&Object.keys(s.regions).length)||!!(s.cities&&Object.keys(s.cities).length)};
/* airports */
let AIRPORTS=null;
async function loadAirports(){if(AIRPORTS)return AIRPORTS;AIRPORTS=await(await fetch('airports.json')).json();return AIRPORTS}
const PLANE='<path d="M0-7.5c.9 0 1.4 1 1.4 2.2V-2l5.6 3.4v1.7L1.4.6v3.2l1.7 1.3v1.4L0 5.7l-3.1.8V5.1l1.7-1.3V.6l-5.6 2.5V1.4L-1.4-2v-3.3C-1.4-6.5-.9-7.5 0-7.5z"/>';
function logAirport(a,d){const m=S.airports||(S.airports={});const x=m[a[0]]||(m[a[0]]={n:0,name:a[1],city:a[2],cc:a[3],lat:a[4],lon:a[5]});x.n=Math.max(0,x.n+d);if(d>0)x.last=today();if(!x.n)delete m[a[0]];save()}
function apRow(a){const x=(S.airports||{})[a[0]];return`<div class="aprow"><span class="code">${esc(a[0])}</span><span class="ptxt"><span class="pt">${esc(a[2]||a[1])}</span><span class="pm">${flag(a[3])} ${esc(a[1])}</span></span>${x?`<span class="cnt"><button class="iconbtn sm" data-ap="${a[0]}" data-d="-1" aria-label="One less">−</button><b>${x.n}×</b><button class="iconbtn sm" data-ap="${a[0]}" data-d="1" aria-label="One more">+</button></span>`:`<button class="btn sm" data-ap="${a[0]}" data-d="1">${ic('plane')} Log</button>`}</div>`}
function openAirports(){
  let q='';
  const o=sheet({
    render(el){
      if(!el.innerHTML){el.innerHTML=`${shead('<span class="tt"><b>Airports</b><small>Log every airport you fly through</small></span>')}<div class="pickq"><input id="apQ" placeholder="Code, city or airport name (e.g. CLT, Amman)" autocomplete="off" autocapitalize="characters"></div><div class="sbody" id="apBody"></div>`;
        $('#apQ',el).oninput=e=>{q=e.target.value.trim();list()}}
      const list=async()=>{const body=$('#apBody',el);let res='';const mine=Object.entries(S.airports||{}).sort((a,b)=>b[1].n-a[1].n);
        if(q){let A=[];try{A=await loadAirports()}catch(e){body.innerHTML='<p class="muted">The airport list needs internet the first time.</p>';return}
          const Q=q.toUpperCase(),ql=q.toLowerCase();const hits=A.filter(a=>a[0]===Q).concat(A.filter(a=>a[0]!==Q&&(a[0].startsWith(Q)||(a[2]||'').toLowerCase().includes(ql)||a[1].toLowerCase().includes(ql)||(BY[a[3]]?.name||'').toLowerCase()===ql))).slice(0,30);
          res=hits.length?`<h3 class="rhead"><span>Matches</span></h3><div class="card">${hits.map(apRow).join('')}</div>`:'<p class="empty">No airport with scheduled flights matches.</p>'}
        const tot=mine.reduce((s,[,x])=>s+x.n,0);
        const nf=flights().length;body.innerHTML=`<div class="btnrow" style="margin-bottom:8px"><button class="btn sm" data-fl="open">${ic('plane')} Flights · ${nf}</button><button class="btn sm ghost" data-fl="import">Import flights</button></div>`+res+`<h3 class="rhead"><span>Your airports</span><small>${mine.length} airports · ${tot} visits</small></h3>${mine.length?`<div class="card">${mine.map(([c,x])=>apRow([c,x.name,x.city,x.cc,x.lat,x.lon])).join('')}</div>`:'<p class="empty">Search above and tap Log for each airport you’ve flown in, out of, or through. A small plane marks each one on the map.</p>'}
        <h3 class="rhead"><span>Airplanes on the map</span></h3>${planeSegHTML()}<p class="tiny muted">“Hide where I’ve been” leaves planes only in countries you haven’t marked Been or Lived. Off also hides flight routes.</p>`;
      };list();this.list=list;
    },
    click(e){const pm=e.target.closest('[data-act=planes]');if(pm){setPlaneMode(pm.dataset.v);this.list();return}const fl=e.target.closest('[data-fl]');if(fl){fl.dataset.fl==='open'?openFlights():openImportFlights(()=>this.list());return}const b=e.target.closest('[data-ap]');if(!b)return;const code=b.dataset.ap;const x=(S.airports||{})[code];
      const a=x?[code,x.name,x.city,x.cc,x.lat,x.lon]:(AIRPORTS||[]).find(r=>r[0]===code);if(!a)return;logAirport(a,+b.dataset.d);this.list()},
  });
  setTimeout(()=>{const i=$('#apQ',o.el);if(i&&matchMedia('(hover:hover)').matches)i.focus()},300);
}

/* country sheet: states + cities block */
function regionsBlockHTML(cc,sel){
  if(BY[cc].disp)return`<p class="small muted dnote">${esc(BY[cc].note)}. Shown only while disputed territories are on in Settings; not counted in your countries.</p>`;
  const idx=hasStates(cc)&&REGIDX[cc];let h='';
  if(idx)h+=`<div class="strow"><span class="stname"><b>Show ${rword(cc).toLowerCase()}</b><small>${statesOn(cc)?idx.length+' on the map and below':'Off for this country'}</small></span>${switchHTML(statesOn(cc),`data-stcc="${cc}"`,'Show '+rword(cc).toLowerCase())}</div>`;
  if(idx&&statesOn(cc)){const n=idx.length,nb=idx.filter(([id])=>rs(cc,id).been).length,sr=sel&&idx.find(([id])=>id===sel);
    h+=`<div class="subrow"><h4 class="sub">${rword(cc)} <small>${nb} of ${n} been</small></h4></div>
    <div class="cminiwrap"><div class="cmini" id="cmini"><div class="loading">Loading map…</div></div><button class="iconbtn sm mfs" data-act="regfs" aria-label="Full screen map">${ic('expand')}</button></div>
    <div class="rsel">${sr?`<b>${esc(sr[1])}</b><span class="qb">${KEYS.map(k=>`<button class="q q-${k}${rs(cc,sr[0])[k]?' on':''}" data-rq="${sr[0]}" data-k="${k}">${QL[k]}</button>`).join('')}</span>`:`<span class="muted small">Tap a ${rword(cc).split(' ')[0].toLowerCase().replace(/s$/,'').replace(/ie$/,'y')} on the map to mark it, or use the list.</span>`}</div>
    <details class="rlist"><summary>All ${n} ${rword(cc).toLowerCase()}</summary><div class="card">${idx.map(([id,name])=>{const x=rs(cc,id);return`<div class="crow"><span class="cmain"><span class="cname">${esc(name)}</span></span><span class="qb">${KEYS.map(k=>`<button class="q q-${k}${x[k]?' on':''}" data-rq="${id}" data-k="${k}">${QL[k]}</button>`).join('')}</span></div>`}).join('')}</div></details>`}
  const mine=Object.entries(cs(cc).cities||{});
  h+=`<h4 class="sub">Cities</h4>${mine.length?`<div class="card">${mine.map(([n,x])=>cityRow(cc,[n,x.lat,x.lon,x.adm])).join('')}</div>`:''}
  <div class="pickq0"><input id="cityQ" placeholder="Find a city in ${esc(BY[cc].name)}" autocomplete="off"></div><div id="cres"></div>`;
  return h;
}
function cityRow(cc,r){const x=ct(cc,r[0]);return`<div class="crow"><span class="cmain"><span class="cname">${esc(r[0])}${r[3]?`<small>${esc(r[3])}</small>`:''}</span></span><span class="qb">${KEYS.map(k=>`<button class="q q-${k}${x[k]?' on':''}" data-cq="${esc(r[0])}" data-k="${k}">${QL[k]}</button>`).join('')}</span></div>`}
async function cityResults(el,cc,q){
  const box=$('#cres',el);if(!box)return;const all=(await loadCities())[cc]||[];const ql=q.trim().toLowerCase();const mine=cs(cc).cities||{};
  const rows=(ql?all.filter(r=>r[0].toLowerCase().includes(ql)||(r[3]||'').toLowerCase().includes(ql)):all).filter(r=>!mine[r[0]]).slice(0,ql?25:8);
  box.innerHTML=rows.length?`<div class="card">${rows.map(r=>cityRow(cc,r)).join('')}</div>${ql?'':'<p class="tiny muted">Biggest cities shown; type to find others.</p>'}`:(all.length?'<p class="tiny muted">No city by that name in the list (it has cities over about 150,000 people, plus capitals).</p>':'');
}
async function drawMini(box,cc,sel){
  if(!box)return;let f;
  try{await loadScript(CDN.d3);f=await regGeo(cc)}catch(e){box.innerHTML='<p class="muted small pad">The map needs internet the first time.</p>';return}
  const fc={type:'FeatureCollection',features:f};
  let proj=cc==='US'?d3.geoAlbersUsa():d3.geoNaturalEarth1().rotate([-d3.geoCentroid(fc)[0],0]);
  proj.fitWidth(600,fc);const p=d3.geoPath(proj);const b=p.bounds(fc);
  const u=(b[1][0]-b[0][0])/600;
  const cities=Object.entries(cs(cc).cities||{}).map(([n,x])=>{const q=proj([x.lon,x.lat]);return q?`<circle class="city s-${tier(x)}" cx="${q[0]}" cy="${q[1]}" r="${5*u}"><title>${esc(n)}</title></circle>`:''}).join('');
  const planes=Object.entries(S.airports||{}).filter(([,x])=>x.cc===cc&&planeShown(x)).map(([c,x])=>{const q=proj([x.lon,x.lat]);return q?`<g class="plane" transform="translate(${q[0]},${q[1]}) scale(${1.1*u})">${PLANE}<title>${esc(c)}</title></g>`:''}).join('');
  box.innerHTML=`<svg class="mini" viewBox="${b[0][0]-6} ${b[0][1]-6} ${b[1][0]-b[0][0]+12} ${b[1][1]-b[0][1]+12}"><g class="zg">${f.map(x=>{const t=tier(rs(cc,x.properties.id));return`<path class="rg${t?' s-'+t:''}${x.properties.id===sel?' sel':''}" data-rid="${x.properties.id}" d="${p(x)}"><title>${esc(x.properties.name)}</title></path>`}).join('')}${cities}${planes}</g></svg>`;
}

/* main map overlays */
let gReg,gBord,gCity,gPlane,regBusy=0;
function planeMode(){const m=S.settings.planeMode;return m||(S.settings.planes===false?'off':'all')}
function planeShown(x){const m=planeMode();if(m==='off')return false;if(m==='notbeen'&&x.cc){const s=cs(x.cc);if(s.been||s.lived)return false}return true}
function planeSegHTML(){return`<div class="seg" role="group" aria-label="Airplanes on the map">${[['all','All airports'],['notbeen','Hide where I’ve been'],['off','Off']].map(([v,l])=>`<button data-act="planes" data-v="${v}" class="${planeMode()===v?'on':''}">${l}</button>`).join('')}</div>`}
function setPlaneMode(v){S.settings.planeMode=v;S.settings.planes=v!=='off';save()}
async function paintRegions(){
  if(!mapReady)return;const my=++regBusy;const idx=await regIndex();const data=[];
  for(const cc of Object.keys(S.countries)){const r=cs(cc).regions;if(!r||!Object.keys(r).length||!idx[cc]||!statesOn(cc))continue;let f;try{f=await regGeo(cc)}catch(e){continue}f.forEach(x=>data.push({cc,id:x.properties.id,f:x}))}
  if(my!==regBusy)return;
  const ccs=new Set(data.map(d=>d.cc));
  gBord.selectAll('path').data(PATHD.filter(p=>p.cc&&ccs.has(p.cc)),d=>d.cc+'|'+d.d.length).join('path').attr('d',d=>d.d).attr('class','cb');
  mapSvg.classed('stmode',ccs.size>0);
  gReg.selectAll('path').data(data,d=>d.cc+'|'+d.id).join(en=>en.append('path').attr('d',d=>geoPath(d.f)).on('click',(e,d)=>openCountry(d.cc,d.id))).attr('class',d=>{const t=tier(rs(d.cc,d.id));return'rg'+(t?' s-'+t:'')});
}
function paintPoints(){
  if(!mapReady)return;const P=geoPath.projection();
  const cities=[];for(const cc of Object.keys(S.countries))for(const[n,x]of Object.entries(cs(cc).cities||{})){const q=P([x.lon,x.lat]);if(q)cities.push({cc,n,t:tier(x),x:q[0],y:q[1]})}
  gCity.selectAll('circle').data(cities,d=>d.cc+'|'+d.n).join(en=>en.append('circle').on('click',(e,d)=>openCountry(d.cc))).attr('cx',d=>d.x).attr('cy',d=>d.y).attr('class',d=>'city s-'+d.t);
  const planes=Object.entries(S.airports||{}).filter(([,x])=>planeShown(x)).map(([c,x])=>{const q=P([x.lon,x.lat]);return q&&{c,x:q[0],y:q[1]}}).filter(Boolean);
  gPlane.selectAll('g').data(planes,d=>d.c).join(en=>{const g=en.append('g').attr('class','plane');g.html(PLANE+'<title></title>');g.select('title').text(d=>d.c);g.on('click',()=>openAirports());return g});
  sizePoints();
}
function sizePoints(){if(!gCity)return;const u=pxPerUnit();gCity.selectAll('circle').attr('r',4/u);gPlane.selectAll('g').attr('transform',d=>`translate(${d.x},${d.y}) scale(${1.15/u})`)}

/* ---------- v4: visits & timeline, flights, tick-off lists, counting options, badges, share picture, photo import, packing list, full screen ---------- */
const CONT={NA:'North America',CA:'North America',CB:'North America',SA:'South America',EU:'Europe',ME:'Asia',AF:'Africa',CAS:'Asia',SAS:'Asia',EAS:'Asia',SEA:'Asia',AU:'Oceania',OC:'Oceania',AN:'Antarctica'};
const continentOf=cc=>cc==='EG'?'Africa':CONT[BY[cc]?.reg]||'';
const CONTS=['Africa','Antarctica','Asia','Europe','North America','Oceania','South America'];
const dParse=s=>new Date(s+'T12:00');
const dayDiff=(a,b)=>Math.round((dParse(b)-dParse(a))/864e5);
const fmtDay=d=>dParse(d).toLocaleDateString(undefined,{month:'short',day:'numeric'});
const localISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const fmtN=n=>Math.round(n).toLocaleString();
const hav=(la1,lo1,la2,lo2)=>{const r=Math.PI/180,a=Math.sin((la2-la1)*r/2)**2+Math.cos(la1*r)*Math.cos(la2*r)*Math.sin((lo2-lo1)*r/2)**2;return 12742*Math.asin(Math.min(1,Math.sqrt(a)))};
const realC=()=>C.filter(c=>!c.disp);

/* ---- counting options ---- */
const UKN=[['England',x=>x.startsWith('GB-ENG')],['Scotland',x=>x==='GB-SCOTLAND'],['Wales',x=>x==='GB-WALES'],['Northern Ireland',x=>x==='GB-NORTHERN-IRELAND']];
function ukNations(){const r=cs('GB').regions||{};return UKN.filter(([,f])=>Object.entries(r).some(([id,x])=>f(id)&&x.been)).map(([n])=>n)}
function countTotals(){const s=S.settings,set=realC().filter(c=>c.core||s.countTerr);let been=set.filter(c=>cs(c.cc).been||(s.countDrive&&cs(c.cc).drive)).length,total=set.length;
  if(s.ukSplit){total+=3;if(cs('GB').been){const n=ukNations().length;been+=Math.max(1,n)-1}}
  return{been,total}}

/* ---- centroids (for stats, photo import, share picture) ---- */
let CENT=null;
function centroids(){if(CENT)return CENT;if(!PATHD.length)return{};CENT={};
  for(const p of PATHD){if(!p.cc||CENT[p.cc])continue;const g=p.f.geometry;let best=null,ba=-1;const polys=g.type==='MultiPolygon'?g.coordinates:[g.coordinates];
    for(const poly of polys){const a=d3.geoArea({type:'Polygon',coordinates:poly});if(a>ba){ba=a;best=poly}}if(best){const[lo,la]=d3.geoCentroid({type:'Polygon',coordinates:best});CENT[p.cc]=[la,lo]}}
  for(const[cc,lo,la]of[['TV',179.2,-8.5],['TK',-171.8,-9.2],['GI',-5.35,36.14],['CC',96.87,-12.16],['CX',105.69,-10.45]])if(!CENT[cc])CENT[cc]=[la,lo];
  return CENT}
let PBOX=null;
function countryAt(lon,lat){if(!PATHD.length)return'';if(!PBOX)PBOX=PATHD.map(p=>d3.geoBounds(p.f));
  for(let i=0;i<PATHD.length;i++){const p=PATHD[i],[[x0,y0],[x1,y1]]=PBOX[i];if(!p.cc)continue;if(lat<y0-.1||lat>y1+.1)continue;if(x0<=x1&&(lon<x0-.1||lon>x1+.1))continue;if(d3.geoContains(p.f,[lon,lat]))return p.cc}
  // On a coast or a small island the simplified map can miss the point: use the nearest known city or airport.
  let best='',bd=50;if(CITIES)for(const[cc,rows]of Object.entries(CITIES))for(const c of rows){const d=hav(lat,lon,c[1],c[2]);if(d<bd){bd=d;best=cc}}
  if(!best&&AIRPORTS){bd=30;for(const a of AIRPORTS){const d=hav(lat,lon,a[4],a[5]);if(d<bd){bd=d;best=a[3]}}}
  if(best&&BY[best])return best;
  bd=60;const ce=centroids();for(const[cc,[la,lo]]of Object.entries(ce)){const d=hav(lat,lon,la,lo);if(d<bd){bd=d;best=cc}}return best}

/* ---- visits ---- */
const visitsOf=cc=>cs(cc).visits||[];
const visitDays=v=>v.start?Math.max(1,(v.end&&v.end>=v.start?dayDiff(v.start,v.end):0)+1):0;
const sortVisits=a=>a.sort((x,y)=>(x.start||'9999').localeCompare(y.start||'9999'));
function addVisit(cc,v){const o=co(cc);(o.visits||(o.visits=[])).push(Object.assign({id:uid(),start:'',end:'',note:''},v));sortVisits(o.visits);if(!o.been)setK(cc,'been',true);else save()}
const overlaps=(cc,s,e)=>visitsOf(cc).some(v=>v.start&&!(e<v.start||s>(v.end||v.start)));
function visitsHTML(cc){const vs=visitsOf(cc),s=cs(cc),days=vs.reduce((a,v)=>a+visitDays(v),0);
  return`<div class="subrow"><h4 class="sub">Visits ${vs.length?`<small>${plural(vs.length,'visit')}${days?' · '+plural(days,'day'):''}</small>`:''}</h4><span class="btns"><button class="btn sm" data-act="addvisit">${ic('plus')} Visit</button></span></div>
  ${vs.map(v=>`<div class="visit" data-vid="${v.id}"><div class="grid2"><label class="fld"><span>From</span><input type="date" data-vf="start" value="${v.start||''}"></label><label class="fld"><span>To</span><input type="date" data-vf="end" value="${v.end||''}"></label></div><div class="vrow"><input data-vf="note" value="${esc(v.note||'')}" placeholder="Note: where, who with"><button class="iconbtn sm" data-act="delvisit" data-id="${v.id}" aria-label="Remove visit">${ic('trash')}</button></div></div>`).join('')}
  ${vs.length?'':'<p class="muted small">Add each trip with its dates. Visits build your timeline and your stats.</p>'}
  ${s.years?`<p class="tiny muted">Earlier note: ${esc(s.years)}</p>`:''}`}
function visitEvent(e,cc,refresh){const f=e.target.dataset.vf;if(!f)return false;const box=e.target.closest('[data-vid]');const v=visitsOf(cc).find(x=>x.id===box.dataset.vid);if(!v)return true;
  v[f]=e.target.value;if(f==='start'&&v.start&&(!v.end||v.end<v.start)&&e.type==='change'){v.end=v.end&&v.end>=v.start?v.end:v.start}
  if(f==='end'&&v.start&&v.end&&v.end<v.start)v.end=v.start;
  if(e.type==='change'&&f!=='note'){sortVisits(visitsOf(cc));save();refresh()}else save();return true}
function allVisits(){const out=[];for(const c of realC())for(const v of visitsOf(c.cc))if(v.start)out.push({cc:c.cc,...v,days:visitDays(v)});return out.sort((a,b)=>a.start.localeCompare(b.start))}
function firstYear(cc){const v=visitsOf(cc).find(x=>x.start);return v?+v.start.slice(0,4):0}

/* ---- timeline ---- */
function openTimeline(){
  let year=0,timer=0;
  const vs=allVisits(),years=[...new Set(vs.map(v=>+v.start.slice(0,4)))].sort((a,b)=>b-a);
  const fl=(S.flights||[]).filter(f=>f.date);
  const o=sheet({
    render(el){
      const home=S.settings.home;const minY=years.length?Math.min(...years):0,maxY=years.length?Math.max(...years):0;if(!year)year=maxY;
      const undated=realC().filter(c=>cs(c.cc).been&&!visitsOf(c.cc).some(v=>v.start));
      const seen=new Set();const firsts={};vs.forEach(v=>{if(!seen.has(v.cc)){seen.add(v.cc);firsts[v.cc]=+v.start.slice(0,4)}});
      el.innerHTML=`${shead('<span class="tt"><b>Timeline</b><small>Your visits by year</small></span>')}<div class="sbody">
      ${years.length?`<div class="cmpmap" id="tlMap"><div class="loading">Loading map…</div></div>
      <div class="tlctl"><button class="btn sm" data-act="play">${ic('play')} Play</button><input type="range" id="tlYear" min="${minY}" max="${maxY}" value="${year}" aria-label="Year"><b id="tlLab"></b></div>`:''}
      ${years.map(y=>{const yv=vs.filter(v=>+v.start.slice(0,4)===y),ccs=new Set(yv.map(v=>v.cc)),nw=[...ccs].filter(c=>firsts[c]===y).length,days=yv.filter(v=>v.cc!==home).reduce((a,v)=>a+v.days,0),nf=fl.filter(f=>+f.date.slice(0,4)===y).length;
        return`<h3 class="rhead"><span>${y}</span><small>${plural(ccs.size,'country')}${nw?` · ${nw} new`:''}${days?` · ${plural(days,'day')} away`:''}${nf?` · ${plural(nf,'flight')}`:''}</small></h3><div class="card">${yv.map(v=>`<button class="tlrow" data-open="${v.cc}"><span class="flag">${flag(v.cc)}</span><span class="ptxt"><span class="pt">${esc(BY[v.cc].name)}${firsts[v.cc]===y&&yv.find(x=>x.cc===v.cc)===v?' <span class="newtag">first visit</span>':''}</span><span class="pm">${fmtDay(v.start)}${v.end&&v.end!==v.start?' – '+fmtDay(v.end):''} · ${plural(v.days,'day')}${v.note?' · '+esc(v.note):''}</span></span></button>`).join('')}</div>`}).join('')}
      ${undated.length?`<h3 class="rhead"><span>No dates yet</span><small>${undated.length}</small></h3><p class="small muted">Open a country and tap + Visit to put it on the timeline.</p><div class="chips2">${undated.map(c=>`<button class="wchip" data-open="${c.cc}">${flag(c.cc)} ${esc(c.name)}</button>`).join('')}</div>`:''}
      ${!years.length&&!undated.length?'<p class="empty">Mark countries and add visits with dates to build your timeline.</p>':''}</div>`;
      if(years.length)this.drawMap(firsts,minY);
    },
    async drawMap(firsts,minY){const box=$('#tlMap',this.el);try{await loadGeo()}catch(e){box.innerHTML='<p class="muted small pad">The map needs internet the first time.</p>';return}
      box.innerHTML=`<svg viewBox="0 0 ${MW} ${MH}" class="map small"><path class="sphere" d="${geoPath({type:'Sphere'})}"/>${PATHD.map(p=>`<path class="c" data-y="${firsts[p.cc]||''}" d="${p.d}"/>`).join('')}</svg>`;
      const paint=()=>{$$('path[data-y]',box).forEach(p=>{const y=+p.dataset.y;p.setAttribute('class','c'+(y&&y<=year?(y===year?' s-lived':' s-been'):''))});
        const n=Object.values(firsts).filter(y=>y<=year).length;$('#tlLab',this.el).textContent=`${year}: ${plural(n,'country')}`};
      paint();this.paint=paint;
      $('#tlYear',this.el).oninput=e=>{year=+e.target.value;clearInterval(timer);paint()}},
    click(e,t){const op=e.target.closest('[data-open]');if(op){openCountry(op.dataset.open);return}
      if(t&&t.dataset.act==='play'){clearInterval(timer);const r=$('#tlYear',this.el);year=+r.min;r.value=year;this.paint&&this.paint();
        timer=setInterval(()=>{if(year>=+r.max||!this.el.isConnected){clearInterval(timer);return}year++;r.value=year;this.paint()},900)}},
  });
}

/* ---- flights ---- */
let APX=null;
async function apIndex(){if(APX)return APX;const A=await loadAirports();APX={};A.forEach(a=>APX[a[0]]=a);return APX}
const flights=()=>S.flights||(S.flights=[]);
function flightKm(f){return f.km||(f.km=Math.round(hav(f.fl[0],f.fl[1],f.tl[0],f.tl[1])))}
function addFlight(a,b,date,airline,num,silent){const f={id:uid(),date:date||'',from:a[0],to:b[0],fl:[a[4],a[5]],tl:[b[4],b[5]],fcc:a[3],tcc:b[3],airline:airline||'',num:num||''};flightKm(f);flights().push(f);logAirport(a,1);logAirport(b,1);if(!silent)save();return f}
function removeFlight(id){const f=flights().find(x=>x.id===id);if(!f)return;S.flights=flights().filter(x=>x!==f);for(const c of[f.from,f.to]){const x=(S.airports||{})[c];if(x)logAirport([c,x.name,x.city,x.cc,x.lat,x.lon],-1)}save()}
function flightStats(){const F=flights(),km=F.reduce((a,f)=>a+flightKm(f),0);const ap={},rt={},al={};
  for(const f of F){ap[f.from]=(ap[f.from]||0)+1;ap[f.to]=(ap[f.to]||0)+1;const k=[f.from,f.to].sort().join('–');rt[k]=(rt[k]||0)+1;if(f.airline)al[f.airline]=(al[f.airline]||0)+1}
  const top=(o,n)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n);const longest=F.slice().sort((a,b)=>flightKm(b)-flightKm(a))[0];
  return{n:F.length,km,ap:top(ap,5),rt:top(rt,5),al:top(al,5),longest}}
function apPicker(id,label){return`<label class="fld"><span>${label}</span><input id="${id}" placeholder="Code or city (e.g. CLT)" autocomplete="off" autocapitalize="characters"></label><div class="appick" id="${id}R"></div>`}
function openFlights(){
  const pick={};
  const o=sheet({
    render(el){const st=flightStats(),F=flights().slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
      el.innerHTML=`${shead('<span class="tt"><b>Flights</b><small>Every flight, with its route on the map</small></span>',`<button class="btn sm ghost" data-act="import">Import</button>`)}<div class="sbody">
      ${st.n?`<div class="tiles"><div class="tile"><b>${st.n}</b><span>flights</span></div><div class="tile"><b>${fmtN(st.km)}</b><span>km flown</span></div><div class="tile"><b>${fmtN(st.km*0.621371)}</b><span>miles</span></div></div>`:''}
      <h4 class="sub">Add a flight</h4><div class="card pad">${apPicker('flFrom','From')}${apPicker('flTo','To')}
      <div class="grid2"><label class="fld"><span>Date</span><input type="date" id="flDate"></label><label class="fld"><span>Airline (optional)</span><input id="flAir" placeholder="e.g. Delta"></label></div>
      <label class="fld"><span>Flight number (optional)</span><input id="flNum" placeholder="e.g. DL 123"></label>
      <button class="btn wide" data-act="addfl">${ic('plane')} Add flight</button><p class="tiny muted">Each flight also adds a visit to both airports.</p></div>
      <h3 class="rhead"><span>Your flights</span><small>${st.n}</small></h3>
      ${F.length?`<div class="card">${F.map(f=>`<div class="aprow"><span class="ptxt"><span class="pt">${esc(f.from)} → ${esc(f.to)} <small class="muted">${fmtN(flightKm(f))} km</small></span><span class="pm">${f.date?fmtD(f.date):'No date'}${f.airline?' · '+esc(f.airline):''}${f.num?' '+esc(f.num):''}</span></span><button class="iconbtn sm" data-delfl="${f.id}" aria-label="Remove flight">${ic('trash')}</button></div>`).join('')}</div>`:'<p class="empty">No flights yet. Add one above, or import a list from Flighty, OpenFlights or myFlightradar24.</p>'}</div>`;
      for(const k of['flFrom','flTo']){const inp=$('#'+k,el);if(pick[k])inp.value=`${pick[k][0]} · ${pick[k][2]||pick[k][1]}`;
        inp.oninput=async()=>{pick[k]=null;const q=inp.value.trim();const box=$('#'+k+'R',el);if(!q){box.innerHTML='';return}const A=await loadAirports(),Q=q.toUpperCase(),ql=q.toLowerCase();
          const hits=A.filter(a=>a[0]===Q).concat(A.filter(a=>a[0]!==Q&&(a[0].startsWith(Q)||(a[2]||'').toLowerCase().includes(ql)||a[1].toLowerCase().includes(ql)))).slice(0,6);
          box.innerHTML=hits.map(a=>`<button class="appk" data-pk="${k}" data-code="${a[0]}"><b>${a[0]}</b> ${esc(a[2]||'')} <small>${flag(a[3])} ${esc(a[1])}</small></button>`).join('')||'<p class="tiny muted">No airport with scheduled flights matches.</p>'}}
    },
    async click(e,t){const pk=e.target.closest('[data-pk]');if(pk){const X=await apIndex();const a=X[pk.dataset.code];pick[pk.dataset.pk]=a;const inp=$('#'+pk.dataset.pk,this.el);inp.value=`${a[0]} · ${a[2]||a[1]}`;$('#'+pk.dataset.pk+'R',this.el).innerHTML='';return}
      const d=e.target.closest('[data-delfl]');if(d){if(confirm('Remove this flight?')){removeFlight(d.dataset.delfl);this.refresh()}return}
      if(!t)return;
      if(t.dataset.act==='import'){openImportFlights(()=>this.refresh());return}
      if(t.dataset.act==='addfl'){const X=await apIndex();const res=k=>pick[k]||X[($('#'+k,this.el).value.trim().toUpperCase().match(/^[A-Z]{3}/)||[''])[0]];const a=res('flFrom'),b=res('flTo');
        if(!a||!b){toast('Pick both airports from the list');return}if(a[0]===b[0]){toast('From and To are the same airport');return}
        addFlight(a,b,$('#flDate',this.el).value,$('#flAir',this.el).value.trim(),$('#flNum',this.el).value.trim());pick.flFrom=pick.flTo=null;toast(`${a[0]} → ${b[0]} added`);this.refresh()}},
  });
}
function parseCSV(t){const first=t.split(/\r?\n/)[0]||'';const del=[',',';','\t'].sort((a,b)=>first.split(b).length-first.split(a).length)[0];
  const rows=[];let row=[],f='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];
    if(q){if(ch==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=ch}
    else if(ch==='"')q=true;else if(ch===del){row.push(f);f=''}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&t[i+1]==='\n')i++;row.push(f);rows.push(row);row=[];f=''}else f+=ch}
  if(f||row.length){row.push(f);rows.push(row)}return rows.filter(r=>r.some(x=>x.trim()))}
function csvDate(s){s=(s||'').trim();let m=s.match(/(\d{4})-(\d{2})-(\d{2})/);if(m)return m[0];m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m)return`${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;const d=new Date(s);return isNaN(d)?'':localISO(d)}
function readFlightsCSV(text,X){
  const rows=parseCSV(text.replace(/^﻿/,''));if(rows.length<2)return{err:'The file has no rows.'};
  const H=rows[0].map(h=>h.trim().toLowerCase());const col=re=>H.findIndex(h=>re.test(h));
  const ci={date:col(/date/),from:col(/^(from|origin|orig|dep(arture)?)( airport| iata| code)?$|^from[ _]|departure airport/),to:col(/^(to|dest(ination)?|arr(ival)?)( airport| iata| code)?$|^to[ _]|arrival airport/),air:col(/airline|carrier/),num:col(/^flight( ?(number|no|#|num))?$|flight_number|^flight$/)};
  if(ci.from<0||ci.to<0)return{err:'Couldn’t find From and To columns. The first row needs headers like “From” and “To”.'};
  const code=s=>{s=(s||'').trim();if(/^[A-Z]{3}$/.test(s))return X[s]?s:'';let m=s.match(/\(([A-Z]{3})\s*\/\s*[A-Z]{4}\)/)||s.match(/\(([A-Z]{3})\)/);if(m&&X[m[1]])return m[1];m=(s.match(/\b[A-Z]{3}\b/g)||[]).find(c=>X[c]);return m||''};
  const have=new Set(flights().map(f=>[f.date,f.from,f.to].join('|')));const out=[];let skipped=0,dup=0;
  for(const r of rows.slice(1)){const a=code(r[ci.from]),b=code(r[ci.to]);if(!a||!b||a===b){skipped++;continue}const date=ci.date>=0?csvDate(r[ci.date]):'';const k=[date,a,b].join('|');if(have.has(k)){dup++;continue}have.add(k);
    out.push({a,b,date,air:ci.air>=0?(r[ci.air]||'').replace(/\s*\([A-Z0-9]{2,3}\/[A-Z0-9]{3,4}\)\s*$/,'').trim():'',num:ci.num>=0?(r[ci.num]||'').trim():''})}
  return{out,skipped,dup}}
function openImportFlights(after){
  let res=null;
  sheet({
    render(el){el.innerHTML=`${shead('<span class="tt"><b>Import flights</b></span>')}<div class="sbody">
      <p class="small">Pick a CSV file exported from Flighty, OpenFlights or myFlightradar24, or any spreadsheet with <b>From</b> and <b>To</b> columns (airport codes like CLT) and a <b>Date</b> column.</p>
      <label class="btn">${ic('clip')} Choose CSV file<input type="file" accept=".csv,text/csv,text/plain" hidden id="flCsv"></label>
      <div id="flRes">${res?(res.err?`<p class="muted">${esc(res.err)}</p>`:`<div class="card pad" style="margin-top:12px"><b>${plural(res.out.length,'new flight')}</b><p class="small muted">${res.dup?plural(res.dup,'flight')+' already logged · ':''}${res.skipped?plural(res.skipped,'row')+' skipped (airport not found or missing)':''}</p>
        ${res.out.slice(0,8).map(f=>`<div class="small">${f.date||'No date'} · ${f.a} → ${f.b}${f.air?' · '+esc(f.air):''}</div>`).join('')}${res.out.length>8?`<div class="small muted">and ${res.out.length-8} more</div>`:''}
        ${res.out.length?`<button class="btn wide" data-act="add" style="margin-top:10px">Add ${plural(res.out.length,'flight')}</button>`:''}</div>`):''}</div>
      <p class="tiny muted">Only airports with scheduled flights are recognized. Nothing leaves your phone.</p></div>`},
    async change(e){if(e.target.id!=='flCsv'||!e.target.files[0])return;const X=await apIndex();res=readFlightsCSV(await e.target.files[0].text(),X);this.refresh()},
    async click(e,t){if(t&&t.dataset.act==='add'&&res&&res.out){const X=await apIndex();for(const f of res.out)addFlight(X[f.a],X[f.b],f.date,f.air,f.num,true);save();toast(`Added ${plural(res.out.length,'flight')}`);await back();after&&after()}},
  });
}
let gFlight;
function paintFlights(){if(!gFlight)return;const on=planeMode()!=='off';const seen=new Set(),data=[];
  if(on)for(const f of flights()){const k=[f.from,f.to].sort().join('|');if(seen.has(k))continue;seen.add(k);data.push({k,f})}
  gFlight.selectAll('path').data(data,d=>d.k).join('path').attr('class','farc').attr('d',d=>geoPath({type:'LineString',coordinates:[[d.f.fl[1],d.f.fl[0]],[d.f.tl[1],d.f.tl[0]]]}))}

/* ---- tick-off lists ---- */
let LISTS=null;
async function loadLists(){if(LISTS)return LISTS;LISTS=await(await fetch('lists.json')).json();return LISTS}
const ticks=id=>{const L=S.lists||(S.lists={});return L[id]||(L[id]={})};
function tickItem(lid,it,on){const t=ticks(lid);if(on){t[it[0]]=today();if(it[2]&&BY[it[2]]&&!cs(it[2]).been){setK(it[2],'been',true);return}}else delete t[it[0]];save()}
const listOnMap=lid=>!!(S.settings.listMap||{})[lid];
async function listsCardHTML(){let L;try{L=await loadLists()}catch(e){return'<p class="muted small">Lists need internet the first time.</p>'}
  return`<div class="card">${L.map(l=>{const d=Object.keys(ticks(l.id)).length,n=l.items.length;return`<button class="lrow" data-list="${l.id}"><span class="ptxt"><span class="pt">${esc(l.name)}</span><span class="pm">${d} of ${n} · ${Math.round(d/n*100)}%</span><span class="bar"><i style="width:${d/n*100}%"></i></span></span>${ic('chev','chev')}</button>`}).join('')}</div>`}
function openList(lid,q0){
  let q=q0||'',f='all';
  sheet({
    async render(el){const L=await loadLists(),l=L.find(x=>x.id===lid),t=ticks(lid);const done=Object.keys(t).length;
      if(!el.innerHTML){el.innerHTML=`${shead(`<span class="tt"><b>${esc(l.name)}</b><small id="lsum"></small></span>`)}<div class="pickq"><input id="lq" placeholder="Search ${esc(l.name)}" autocomplete="off" value="${esc(q)}"></div><div class="sbody" id="lbody"></div>`;
        $('#lq',el).oninput=e=>{q=e.target.value;this.refresh()}}
      $('#lsum',el).textContent=`${done} of ${l.items.length} · ${l.desc}`;
      const ql=q.trim().toLowerCase();const items=l.items.filter(it=>(!ql||it[1].toLowerCase().includes(ql)||(BY[it[2]]?.name||'').toLowerCase().includes(ql))&&(f==='all'||(f==='done')===!!t[it[0]]));
      const groups={};items.forEach(it=>(groups[it[2]]||(groups[it[2]]=[])).push(it));
      const keys=Object.keys(groups).sort((a,b)=>(BY[a]?.name||a).localeCompare(BY[b]?.name||b));const open=ql||keys.length<=4||lid==='wonders';
      const CAT={c:'cultural',n:'natural',m:'mixed'};
      $('#lbody',el).innerHTML=`<div class="chips" style="margin:0 0 8px">${[['all','All'],['done','Done'],['todo','To do']].map(([k,n])=>`<button class="${f===k?'on':''}" data-lf="${k}">${n}</button>`).join('')}</div>
        <div class="strow top"><span class="stname"><b>Show on the map</b><small>Ticked ones in your Been color; the rest appear as outlines when you zoom in</small></span>${switchHTML(listOnMap(lid),'data-act="lmap"','Show on the map')}</div>
        ${keys.slice(0,ql?400:999).map(k=>{const g=groups[k],gd=g.filter(it=>t[it[0]]).length;return`<details class="lgrp" data-k="${k}"${open?' open':''}><summary><span class="flag">${BY[k]?flag(k):''}</span><b>${esc(BY[k]?.name||k)}</b><small>${gd}/${g.length}</small></summary><div class="card">${g.map(it=>`<label class="litem"><input type="checkbox" data-it="${it[0]}"${t[it[0]]?' checked':''}><span class="ptxt"><span class="pt">${esc(it[1])}</span>${it[5]?`<span class="pm">${esc(CAT[it[5]]||it[5])}${t[it[0]]?' · ticked '+fmtD(t[it[0]]):''}</span>`:t[it[0]]?`<span class="pm">ticked ${fmtD(t[it[0]])}</span>`:''}</span></label>`).join('')}</div></details>`}).join('')||'<p class="empty">Nothing matches.</p>'}`;
    },
    async change(e){const id=e.target.dataset.it;if(!id)return;const L=await loadLists(),it=L.find(x=>x.id===lid).items.find(x=>x[0]===id);tickItem(lid,it,e.target.checked);if(e.target.checked)toast('Ticked'+(it[2]&&BY[it[2]]?` · ${BY[it[2]].name} marked Been`:''));this.refresh()},
    click(e,t){const lf=e.target.closest('[data-lf]');if(lf){f=lf.dataset.lf;this.refresh();return}
      if(t&&t.dataset.act==='lmap'){const m=S.settings.listMap||(S.settings.listMap={});m[lid]=!m[lid];save();this.refresh()}},
  });
}
let gList;
async function paintLists(){if(!gList||!mapReady)return;const on=Object.entries(S.settings.listMap||{}).filter(([,v])=>v).map(([k])=>k);
  if(!on.length){gList.selectAll('path').remove();return}let L;try{L=await loadLists()}catch(e){return}const P=geoPath.projection(),data=[];
  for(const l of L)if(on.includes(l.id)){const t=ticks(l.id);for(const it of l.items){const q=P([it[4],it[3]]);if(q)data.push({k:l.id+it[0],lid:l.id,name:it[1],x:q[0],y:q[1],done:!!t[it[0]]})}}
  gList.selectAll('path').data(data,d=>d.k).join(en=>en.append('path').attr('d','M0,-5L4.5,0L0,5L-4.5,0Z').on('click',(e,d)=>openList(d.lid,d.name)).append('title')).attr('class',d=>'lmk'+(d.done?' done':'')).select('title').text(d=>d.name);
  sizeLists()}
function sizeLists(){if(!gList||!mapReady)return;const u=pxPerUnit(),close=u>2.2;gList.selectAll('path').style('display',d=>d.done||close?null:'none').attr('transform',d=>`translate(${d.x},${d.y}) scale(${(d.done?1.15:.85)/u})`)}

/* ---- badges ---- */
function beenCCs(){return realC().filter(c=>cs(c.cc).been).map(c=>c.cc)}
function badgeList(){const n=countTotals(),b=beenCCs(),conts=new Set(b.map(continentOf).filter(c=>c&&c!=='Antarctica')),fs=flightStats();
  const us=Object.entries(cs('US').regions||{}).filter(([id,x])=>x.been&&id!=='US-DC').length;
  const tick=l=>Object.keys((S.lists||{})[l]||{}).length;const home=S.settings.home;
  const abroad=realC().some(c=>cs(c.cc).lived&&c.cc!==home)&&!!home;
  const ce=centroids();const hem=new Set();b.forEach(cc=>{const p=ce[cc];if(!p)return;hem.add(p[0]>=0?'N':'S');hem.add(p[1]>=0?'E':'W')});
  const yrs=new Set(allVisits().map(v=>v.start.slice(0,4))).size;
  return[['First stamp','Mark your first country',n.been,1],['Explorer','10 countries',n.been,10],['Globetrotter','25 countries',n.been,25],['Nomad','50 countries',n.been,50],['Centurion','100 countries',n.been,100],
    ['Six continents','Every inhabited continent',conts.size,6],['Polar','Antarctica',cs('AQ').been?1:0,1],['Four corners','North, south, east and west of the equator and meridian',hem.size,4],
    ['Road tripper','10 US states',us,10],['All 50','Every US state',us,50],['Expat','Live in a country other than home'+(home?'':' (set home in Settings)'),abroad?1:0,1],
    ['Takeoff','Your first flight',fs.n,1],['Frequent flyer','50 flights',fs.n,50],['Around the world','Fly 40,075 km',fs.km,40075],['To the Moon','Fly 384,400 km',fs.km,384400],
    ['Heritage hunter','10 UNESCO sites',tick('unesco'),10],['Wonder seeker','All New 7 Wonders',Math.min(7,Object.keys((S.lists||{}).wonders||{}).filter(k=>k!=='W8').length),7],['Park ranger','10 US national parks',tick('usparks'),10],['Capital collector','25 capitals',tick('capitals'),25],
    ['Time traveler','Dated visits in 5 different years',yrs,5],['Planner','Make 5 plans',S.plans.length,5]]}

/* ---- home country ---- */
const HOMECOL=['#c4532d','#0f766e','#7c3aed','#be185d','#1d4ed8','#4b5563'];
function homeHTML(){const h=S.settings.home;return`<div class="strow top"><span class="stname"><b>Home country</b><small>${h?flag(h)+' '+esc(BY[h].name)+' · shown in its own color':'Not set. Used for “farthest from home”, days away and the Expat badge.'}</small></span><button class="btn sm ghost" data-act="sethome">${h?'Change':'Set'}</button></div>
  ${h?`<div class="homecols">${HOMECOL.map(c=>`<button class="hc${(S.settings.homeColor||HOMECOL[0])===c?' on':''}" data-hc="${c}" style="background:${c}" aria-label="Home color"></button>`).join('')}<button class="btn sm ghost" data-act="clearhome">Clear</button></div>`:''}`}

/* ---- packing list ---- */
const PACK_DEFAULT=['Passport','Phone charger','Plug adapter','Medications','Toiletries','Travel insurance details','Copies of bookings'];
const packList=()=>S.settings.packing&&S.settings.packing.length?S.settings.packing:PACK_DEFAULT;

/* ---- share picture ---- */
async function makeSharePicture(kind){
  await loadGeo();try{await document.fonts.load('700 60px Fraunces')}catch(e){}
  const W=1080,H=kind==='story'?1920:1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');
  const v=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const col={bg:v('--bg'),card:v('--card'),ink:v('--ink'),muted:v('--muted'),land:v('--land'),sea:v('--sea'),line:v('--line'),been:v('--been'),want:v('--want'),lived:v('--lived'),drive:v('--drive'),home:S.settings.homeColor||HOMECOL[0]};
  const mix=(a,b,t)=>{const p=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16))};try{const A=p(a),B=p(b);return'#'+A.map((x,i)=>Math.round(x*t+B[i]*(1-t)).toString(16).padStart(2,'0')).join('')}catch(e){return a}};
  const serif='Fraunces, Georgia, serif',sans='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',emo='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  ctx.fillStyle=col.bg;ctx.fillRect(0,0,W,H);
  const story=kind==='story',ty0=story?230:120;
  ctx.fillStyle=col.ink;ctx.font=`700 ${story?76:64}px ${serif}`;ctx.textBaseline='alphabetic';ctx.fillText(S.me?`${S.me}’s travel map`:'My travel map',60,ty0);
  ctx.fillStyle=col.muted;ctx.font=`500 30px ${sans}`;ctx.fillText(new Date().toLocaleDateString(undefined,{month:'long',year:'numeric'}),60,ty0+48);
  const top=story?ty0+110:210,mh=540;
  const proj=d3.geoNaturalEarth1().fitExtent([[40,top],[W-40,top+mh]],{type:'Sphere'});const path=d3.geoPath(proj,ctx);
  ctx.beginPath();path({type:'Sphere'});ctx.fillStyle=col.sea;ctx.fill();
  const fillOf=cc=>{if(!cc)return col.land;if(cc===S.settings.home)return col.home;const t=tier(cs(cc));if(!t)return col.land;return partial(cc)?mix(col[t],col.land,.38):col[t]};
  for(const p of PATHD){ctx.beginPath();path(p.f);ctx.fillStyle=fillOf(p.cc);ctx.fill();ctx.strokeStyle=col.bg;ctx.lineWidth=.6;ctx.stroke()}
  for(const cc of Object.keys(S.countries)){const r=cs(cc).regions;if(!r||!statesOn(cc)||cc===S.settings.home)continue;let f;try{f=await regGeo(cc)}catch(e){continue}
    for(const x of f){const t=tier(r[x.properties.id]||{});if(!t)continue;ctx.beginPath();path(x);ctx.fillStyle=col[t];ctx.fill()}}
  const ce=centroids();for(const d of DOTS){const t=tier(cs(d.cc));if(!t)continue;const p=ce[d.cc]&&proj([ce[d.cc][1],ce[d.cc][0]]);if(!p)continue;ctx.beginPath();ctx.arc(p[0],p[1],6,0,7);ctx.fillStyle=col[t];ctx.fill();ctx.strokeStyle=col.bg;ctx.lineWidth=2;ctx.stroke()}
  if(planeMode()!=='off'){ctx.strokeStyle=mix(col.ink,col.sea,.55);ctx.lineWidth=1.4;const seen=new Set();for(const f of flights()){const k=[f.from,f.to].sort().join();if(seen.has(k))continue;seen.add(k);ctx.beginPath();path({type:'LineString',coordinates:[[f.fl[1],f.fl[0]],[f.tl[1],f.tl[0]]]});ctx.stroke()}}
  for(const cc of Object.keys(S.countries))for(const[,x]of Object.entries(cs(cc).cities||{})){if(!x.been)continue;const p=proj([x.lon,x.lat]);if(!p)continue;ctx.beginPath();ctx.arc(p[0],p[1],4,0,7);ctx.fillStyle=col[tier(x)];ctx.fill();ctx.strokeStyle=col.bg;ctx.lineWidth=1.5;ctx.stroke()}
  const n=countTotals(),conts=new Set(beenCCs().map(continentOf).filter(Boolean)).size,st=Object.values(S.countries).reduce((a,s)=>a+Object.values(s.regions||{}).filter(x=>x.been).length,0),cit=Object.values(S.countries).reduce((a,s)=>a+Object.values(s.cities||{}).filter(x=>x.been).length,0),fs=flightStats();
  let y=top+mh+(story?170:130);
  ctx.fillStyle=col.been;ctx.font=`700 150px ${serif}`;ctx.fillText(String(n.been),60,y);const bw=ctx.measureText(String(n.been)).width;
  ctx.fillStyle=col.muted;ctx.font=`600 52px ${serif}`;const tot=`/${n.total}`;ctx.fillText(tot,60+bw+10,y);const tx=60+bw+10+ctx.measureText(tot).width+28;
  ctx.fillStyle=col.ink;ctx.font=`700 44px ${sans}`;ctx.fillText('countries',tx,y-56);
  ctx.fillStyle=col.muted;ctx.font=`500 34px ${sans}`;ctx.fillText(`${Math.round(n.been/n.total*1000)/10}% of the world`,tx,y-10);
  const tiles=[[conts,'continents'],[st,'states & regions'],[cit,'cities'],[fs.n,'flights'],[fs.km?fmtN(fs.km):0,'km flown'],[realC().filter(c=>cs(c.cc).lived).length,'lived in']].filter(t=>+String(t[0]).replace(/,/g,'')>0).slice(0,4);
  y+=50;const tw=(W-120-24*3)/4;tiles.forEach(([val,lab],i)=>{const x=60+i*(tw+24);ctx.fillStyle=col.card;ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,tw,140,24):ctx.rect(x,y,tw,140);ctx.fill();ctx.fillStyle=col.ink;ctx.font=`700 54px ${sans}`;ctx.fillText(String(val),x+24,y+70);ctx.fillStyle=col.muted;ctx.font=`500 26px ${sans}`;ctx.fillText(lab,x+24,y+112)});
  y+=(tiles.length?190:20);
  if(story){const cl=CONTS.filter(c=>new Set(beenCCs().map(continentOf)).has(c));if(cl.length){ctx.fillStyle=col.muted;ctx.font=`600 28px ${sans}`;ctx.fillText('CONTINENTS',60,y+10);ctx.fillStyle=col.ink;ctx.font=`600 38px ${sans}`;
    let x=60,yy=y+64;for(const c of cl){const w=ctx.measureText(c).width;if(x+w>W-60){x=60;yy+=56}ctx.fillText(c,x,yy);x+=w+36}y=yy+50}}
  const fl=beenCCs().filter(cc=>BY[cc].core).sort((a,b)=>BY[a].name.localeCompare(BY[b].name));ctx.font=`52px ${emo}`;const per=14,rowsMax=kind==='story'?8:3;
  fl.slice(0,per*rowsMax).forEach((cc,i)=>{ctx.fillText(flag(cc),60+(i%per)*68,y+Math.floor(i/per)*70+50)});
  if(fl.length>per*rowsMax){ctx.fillStyle=col.muted;ctx.font=`500 30px ${sans}`;ctx.fillText(`+${fl.length-per*rowsMax} more`,60,y+rowsMax*70+50)}
  ctx.fillStyle=col.muted;ctx.font=`600 28px ${sans}`;ctx.fillText('Made with Roamd',60,H-60);
  return new Promise(r=>cv.toBlob(r,'image/png'))}
function openSharePicture(){
  let kind='post',url='',blob=null;
  sheet({
    async render(el){el.innerHTML=`${shead('<span class="tt"><b>Share picture</b><small>Your map and numbers as an image</small></span>')}<div class="sbody">
      <div class="seg">${[['post','Post (4:5)'],['story','Story (9:16)']].map(([k,n])=>`<button data-act="kind" data-v="${k}" class="${kind===k?'on':''}">${n}</button>`).join('')}</div>
      <div class="shimg" id="shImg"><div class="loading">Drawing…</div></div>
      <div class="btnrow"><button class="btn" data-act="share" style="flex:1">${ic('share')} Share</button><button class="btn ghost" data-act="save" style="flex:1">Save image</button></div>
      <p class="tiny muted">Uses your current colors and light or dark mode. Flags may not show on some Windows computers.</p></div>`;
      try{blob=await makeSharePicture(kind)}catch(e){$('#shImg',el).innerHTML='<p class="muted small pad">The map needs internet the first time.</p>';return}
      if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);$('#shImg',el).innerHTML=`<img src="${url}" alt="Your travel map picture">`},
    async click(e,t){if(!t)return;const a=t.dataset.act;
      if(a==='kind'){kind=t.dataset.v;this.refresh();return}
      if(!blob)return;const file=new File([blob],`roamd-${kind}-${today()}.png`,{type:'image/png'});
      if(a==='share'&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'My travel map'})}catch(err){}return}
      const l=document.createElement('a');l.href=url;l.download=file.name;document.body.append(l);l.click();l.remove();if(a==='share')toast('Saved. Sharing pictures isn’t supported in this browser.')},
  });
}

/* ---- map from photo locations ---- */
function openPhotoImport(){
  let st={phase:'start'};
  sheet({
    render(el){const r=st;el.innerHTML=`${shead('<span class="tt"><b>Add from photos</b><small>Find where you’ve been from your photos</small></span>')}<div class="sbody">
      ${r.phase==='start'?`<p class="small">Pick photos from your trips. Roamd reads each photo’s location and date <b>on this phone</b>; nothing is uploaded. You’ll see what it found before anything is added.</p>
        <label class="btn wide">${ic('cam')} Choose photos<input type="file" accept="image/*" multiple hidden id="phIn"></label>
        <p class="tiny muted">iPhone: Safari can remove locations from photos picked straight from Photos. If nothing is found, save the photos to the Files app first and pick them from Files, or use a computer.</p>`:''}
      ${r.phase==='reading'?`<p>Reading ${r.done} of ${r.total} photos…</p><div class="bar"><i style="width:${r.done/r.total*100}%"></i></div>`:''}
      ${r.phase==='done'?resultsHTML(r):''}</div>`},
    async change(e){if(e.target.id!=='phIn')return;const files=[...e.target.files];if(!files.length)return;
      st={phase:'reading',done:0,total:files.length};this.refresh();
      try{await loadScript('vendor/exifr.lite.umd.js');await loadGeo();await loadCities();await regIndex();await loadAirports().catch(()=>{})}catch(err){toast('Needs internet the first time');st={phase:'start'};this.refresh();return}
      const agg={};let withLoc=0,unplaced=0;
      for(const f of files){try{const g=await exifr.parse(f);if(g&&isFinite(g.latitude)&&isFinite(g.longitude)&&!(g.latitude===0&&g.longitude===0)){withLoc++;
          let date='';const d=g.DateTimeOriginal||g.CreateDate;if(d instanceof Date&&!isNaN(d))date=localISO(d);
          const cc=countryAt(g.longitude,g.latitude);if(!cc)unplaced++;if(cc){const a=agg[cc]||(agg[cc]={n:0,dates:new Set(),regions:{},cities:{}});a.n++;if(date)a.dates.add(date);
            if(hasStates(cc)){try{const F=await regGeo(cc);const hit=F.find(x=>d3.geoContains(x,[g.longitude,g.latitude]));if(hit)a.regions[hit.properties.id]=hit.properties.name}catch(e){}}
            let best=null,bd=25;for(const c of(CITIES[cc]||[])){const d=hav(g.latitude,g.longitude,c[1],c[2]);if(d<bd){bd=d;best=c}}if(best)a.cities[best[0]]=best}}}catch(err){}
        st.done++;if(st.done%5===0||st.done===st.total)this.refresh()}
      const res=Object.entries(agg).map(([cc,a])=>{const ds=[...a.dates].sort(),vis=[];for(const d of ds){const last=vis[vis.length-1];if(last&&dayDiff(last.end,d)<=2)last.end=d;else vis.push({start:d,end:d})}
        return{cc,n:a.n,regions:a.regions,cities:a.cities,visits:vis.map(v=>({...v,dup:overlaps(cc,v.start,v.end)})),on:true}}).sort((a,b)=>BY[a.cc].name.localeCompare(BY[b.cc].name));
      st={phase:'done',total:files.length,withLoc,unplaced,res};this.refresh()},
    click(e,t){const tg=e.target.closest('[data-phcc]');if(tg){const r=st.res.find(x=>x.cc===tg.dataset.phcc);r.on=!r.on;tg.classList.toggle('on',r.on);tg.setAttribute('aria-pressed',r.on);return}
      if(t&&t.dataset.act==='phadd'){let nc=0,nv=0;for(const r of st.res.filter(x=>x.on)){nc++;if(!cs(r.cc).been)setK(r.cc,'been',true);
          for(const id of Object.keys(r.regions))if(!rs(r.cc,id).been)setR(r.cc,id,'been',true);
          for(const c of Object.values(r.cities))if(!ct(r.cc,c[0]).been)setCity(r.cc,c,'been',true);
          for(const v of r.visits)if(!v.dup){addVisit(r.cc,{start:v.start,end:v.end,note:'From photos'});nv++}}
        save();toast(`Added ${plural(nc,'country')} and ${plural(nv,'visit')}`);history.back()}
      if(t&&t.dataset.act==='phagain'){st={phase:'start'};this.refresh()}},
  });
  function resultsHTML(r){if(!r.withLoc)return`<p><b>No locations found</b> in ${plural(r.total,'photo')}.</p><p class="small muted">The photos may have had their location removed (see the iPhone note), or location was off when they were taken.</p><button class="btn ghost" data-act="phagain">Try other photos</button>`;
    return`<p class="small">${r.withLoc} of ${plural(r.total,'photo')} had a location.${r.unplaced?` ${r.unplaced} couldn’t be placed in a country (at sea or far from land).`:''} Tap a country to leave it out.</p>
    ${r.res.map(x=>`<button class="phres on" data-phcc="${x.cc}" aria-pressed="true"><span class="flag big">${flag(x.cc)}</span><span class="ptxt"><span class="pt">${esc(BY[x.cc].name)} <small class="muted">${plural(x.n,'photo')}</small></span>
      ${Object.keys(x.regions).length?`<span class="pm">${esc(Object.values(x.regions).join(', '))}</span>`:''}${Object.keys(x.cities).length?`<span class="pm">${esc(Object.keys(x.cities).join(', '))}</span>`:''}
      ${x.visits.length?`<span class="pm">${x.visits.map(v=>`${fmtD(v.start)}${v.end!==v.start?' – '+fmtD(v.end):''}${v.dup?' (already logged)':''}`).join(' · ')}</span>`:'<span class="pm">No dates in these photos</span>'}</span><span class="tick">✓</span></button>`).join('')}
    <button class="btn wide" data-act="phadd" style="margin-top:12px">Add to my map</button>`}
}

/* ---- full screen maps ---- */
let fsOn=false;
function setMapFS(on){if(on===fsOn)return;fsOn=on;$('.mapwrap').classList.toggle('fs',on);document.body.classList.toggle('mapfs',on);const b=$('#zfull');if(b){b.innerHTML=ic(on?'shrink':'expand');b.setAttribute('aria-label',on?'Exit full screen':'Full screen')}
  try{if(on&&document.documentElement.requestFullscreen&&!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{});else if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(e){}
  setTimeout(()=>{if(mapReady){sizeDots();sizeLists()}},60)}
function toggleMapFS(){if(fsOn)history.back();else{history.pushState({fs:1},'');setMapFS(true)}}
window.addEventListener('popstate',()=>{if(fsOn&&!stack.length&&!(history.state&&history.state.fs))setMapFS(false)});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&fsOn&&!stack.length&&history.state&&history.state.fs)history.back()});
function zoomable(svg){const g=svg.querySelector('g.zg');if(!g)return;const z=d3.zoom().scaleExtent([1,64]).on('zoom',e=>g.setAttribute('transform',e.transform));d3.select(svg).call(z).on('dblclick.zoom',null);svg.classList.add('zoomy')}
function openRegionMapFS(cc,onChange){
  let sel='';
  sheet({
    async render(el){const idx=REGIDX[cc]||[];if(!el.innerHTML){el.classList.add('fsheet');el.innerHTML=`${shead(`<span class="flag">${flag(cc)}</span><span class="tt"><b>${esc(BY[cc].name)}</b><small>Pinch to zoom · tap to mark</small></span>`)}<div class="fsbody"><div class="fsmap" id="fsMap"><div class="loading">Loading map…</div></div><div class="fsbar" id="fsBar"></div></div>`;
        await drawMini($('#fsMap',el),cc,'');const svg=$('#fsMap svg',el);if(svg)zoomable(svg)}
      const sr=sel&&idx.find(([id])=>id===sel);
      $('#fsBar',el).innerHTML=sr?`<b>${esc(sr[1])}</b><span class="qb">${KEYS.map(k=>`<button class="q q-${k}${rs(cc,sel)[k]?' on':''}" data-rq="${sel}" data-k="${k}">${QL[k]}</button>`).join('')}</span>`:`<span class="muted small">Tap a ${rword(cc).split(' ')[0].toLowerCase().replace(/s$/,'').replace(/ie$/,'y')} to mark it.</span>`;
      $$('#fsMap path.rg',el).forEach(p=>{const t=tier(rs(cc,p.dataset.rid));p.setAttribute('class','rg'+(t?' s-'+t:'')+(p.dataset.rid===sel?' sel':''))})},
    click(e){const rid=e.target.closest('[data-rid]');if(rid){sel=rid.dataset.rid;this.refresh();return}
      const rq=e.target.closest('[data-rq]');if(rq){const k=rq.dataset.k;setR(cc,rq.dataset.rq,k,!rs(cc,rq.dataset.rq)[k]);this.refresh();onChange&&onChange()}},
  });
}
function openCompareFS(r,name){
  sheet({async render(el){if(el.innerHTML)return;el.classList.add('fsheet');el.innerHTML=`${shead(`<span class="tt"><b>You &amp; ${esc(name)}</b><small>Pinch to zoom</small></span>`)}<div class="fsbody"><div class="fsmap" id="fsMap"></div><div class="legend fsleg"><span class="lg"><i class="dot both"></i>Both</span><span class="lg"><i class="dot mine"></i>Only you</span><span class="lg"><i class="dot them"></i>Only ${esc(name)}</span></div></div>`;
    await drawCompare($('#fsMap',el),r);const svg=$('#fsMap svg',el);if(svg){svg.innerHTML=`<g class="zg">${svg.innerHTML}</g>`;zoomable(svg)}}});
}

/* ---------- countries list ---------- */
let filt='all',q='';
function rowHTML(c){const s=cs(c.cc);return`<div class="crow" data-cc="${c.cc}"><button class="cmain" data-open-cc="${c.cc}"><span class="flag">${flag(c.cc)}</span><span class="cname">${esc(c.name)}${c.disp?'<small>disputed</small>':c.core?'':'<small>territory</small>'}</span></button><span class="qb">${KEYS.map(k=>`<button class="q q-${k}${s[k]?' on':''}" data-k="${k}" aria-pressed="${!!s[k]}">${QL[k]}</button>`).join('')}</span></div>`}
function renderList(){
  const qq=q.trim().toLowerCase();let html='';
  for(const[rc,rn]of REGIONS){
    const rows=C.filter(c=>{if(c.reg!==rc||!showC(c))return false;if(qq&&!c.name.toLowerCase().includes(qq))return false;const s=cs(c.cc);return filt==='all'||(filt==='none'?!(s.been||s.want||s.lived||s.drive):!!s[filt])});
    if(!rows.length)continue;
    const all=C.filter(c=>c.reg===rc&&c.core),b=all.filter(c=>cs(c.cc).been).length;
    const rsum=regionSummary(rc);html+=`<h3 class="rhead"><span>${rn}</span>${all.length?`<small>${b}/${all.length} been</small>`:''}</h3>${rsum.all?`<div class="stctl"><span class="small muted">States &amp; provinces · ${rsum.on} of ${rsum.all}</span><button class="btn sm ghost" data-stchoose="${rc}">Choose countries</button>${switchHTML(regionOn(rc)&&rsum.on>0,`data-streg="${rc}"`,'States in '+rn)}</div>`:''}<div class="card">${rows.map(rowHTML).join('')}</div>`;
  }
  $('#clist').innerHTML=html||'<p class="empty">No countries match.</p>';
  $$('#fchips button').forEach(b=>b.classList.toggle('on',b.dataset.f===filt));
}

/* ---------- plans ---------- */
let pfilt='all';const closedRegions=new Set();
const fmtD=d=>new Date(d+'T12:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
const dateRange=p=>p.start?fmtD(p.start)+(p.end&&p.end!==p.start?' – '+fmtD(p.end):''):'';
function planRow(p){const bits=[dateRange(p),p.links?.length?plural(p.links.length,'video'):'',p.photos?.length?plural(p.photos.length,'photo'):'',p.todos?.length?`${p.todos.filter(t=>t.done).length}/${p.todos.length} done`:''].filter(Boolean).join(' · ');return`<button class="prow" data-plan="${p.id}"><span class="ptxt"><span class="pt">${esc(p.title||'Untitled plan')}</span>${bits?`<span class="pm">${bits}</span>`:''}</span><span class="badge b-${p.status}">${STATUS_L[p.status]}</span></button>`}
function renderPlans(){
  $$('#pchips button').forEach(b=>b.classList.toggle('on',b.dataset.f===pfilt));
  const plans=S.plans.filter(p=>pfilt==='all'||p.status===pfilt);
  if(!S.plans.length&&!C.some(c=>cs(c.cc).want)){$('#plist').innerHTML=`<div class="empty big">${ic('folder')}<p><b>No plans yet.</b></p><p>Tap <b>New plan</b>, pick a country, and start saving reels, TikToks, photos and ideas for the trip.</p></div>`;return}
  let html='';
  for(const[rc,rn]of REGIONS){
    const inR=plans.filter(p=>BY[p.cc]?.reg===rc);
    const ccs=[...new Set(inR.map(p=>p.cc))].sort((a,b)=>BY[a].name.localeCompare(BY[b].name));
    const wish=pfilt==='all'?C.filter(c=>c.reg===rc&&cs(c.cc).want&&!cs(c.cc).been&&!S.plans.some(p=>p.cc===c.cc)):[];
    if(!ccs.length&&!wish.length)continue;
    html+=`<details class="reg" data-r="${rc}"${closedRegions.has(rc)?'':' open'}><summary><span class="rtag">${rc}</span><span class="rname">${rn}</span><small>${plural(inR.length,'plan')}</small>${ic('chev','chev')}</summary>`;
    for(const cc of ccs){
      const cp=inR.filter(p=>p.cc===cc),secs=S.sections.filter(s=>s.cc===cc);
      html+=`<div class="pcountry card"><button class="pch" data-open-cc="${cc}"><span class="flag">${flag(cc)}</span><b>${esc(BY[cc].name)}</b><small>${cp.length}</small>${ic('chev','chev')}</button>`;
      for(const s of secs){const sp=cp.filter(p=>p.sec===s.id);if(sp.length)html+=`<div class="psec"><div class="psech">${ic('folder')}${esc(s.name)}</div>${sp.map(planRow).join('')}</div>`}
      const loose=cp.filter(p=>!secs.some(s=>s.id===p.sec));
      if(loose.length)html+=`<div class="psec">${secs.length?'<div class="psech muted">Not in a section</div>':''}${loose.map(planRow).join('')}</div>`;
      html+='</div>';
    }
    if(wish.length)html+=`<div class="wish"><span>Want to go, no plans yet</span><div>${wish.map(c=>`<button class="wchip" data-open-cc="${c.cc}">${flag(c.cc)} ${esc(c.name)}</button>`).join('')}</div></div>`;
    html+='</details>';
  }
  $('#plist').innerHTML=html||'<p class="empty">No plans with this status.</p>';
}
function newPlan(cc,sec){const p={id:uid(),cc,sec:sec||'',title:'',start:'',end:'',status:'idea',notes:'',links:[],photos:[],todos:[],created:Date.now()};S.plans.push(p);save();return p}
function newSection(cc){const name=(prompt('Section name (a city, a route, one trip…)')||'').trim();if(!name)return null;const s={id:uid(),cc,name};S.sections.push(s);save();return s}

/* ---------- country sheet ---------- */
async function openCountry(cc,selR){
  const c=BY[cc];if(!c)return;
  await regIndex();let sel=selR||'',cq='';
  sheet({
    render(el){
      const s=cs(cc),secs=S.sections.filter(x=>x.cc===cc),plans=S.plans.filter(p=>p.cc===cc);
      const loose=plans.filter(p=>!secs.some(x=>x.id===p.sec));
      el.innerHTML=`${shead(`<span class="flag big">${flag(cc)}</span><span class="tt"><b>${esc(c.name)}</b><small>${RNAME[c.reg]}${c.core?'':' · territory'}</small></span>`)}
      <div class="sbody">
        <div class="stoggles">${KEYS.map(k=>`<button class="st st-${k}${s[k]?' on':''}" data-act="tog" data-k="${k}"><i class="dot ${k}"></i>${KL[k]}</button>`).join('')}</div>
        ${c.disp?'':`<div class="visitsbox">${visitsHTML(cc)}</div>`}
        ${s.lived?`<label class="fld"><span>Where and when did you live there?</span><input data-f="livedNote" value="${esc(s.livedNote||'')}" placeholder="e.g. Amman, 2021–2022"></label>`:''}
        <label class="fld"><span>Notes</span><textarea data-f="notes" rows="3" placeholder="Memories, people, places, food…">${esc(s.notes||'')}</textarea></label>
        ${regionsBlockHTML(cc,sel)}
        <h4 class="sub">Photos</h4>${gridHTML(s.photos||[])}
        <div class="subrow"><h4 class="sub">Plans</h4><span class="btns"><button class="btn sm ghost" data-act="newsec">${ic('folder')} Section</button><button class="btn sm" data-act="newplan">${ic('plus')} Plan</button></span></div>
        ${secs.map(x=>`<div class="secbox"><div class="sech">${ic('folder')}<b>${esc(x.name)}</b><button class="iconbtn sm" data-act="rensec" data-id="${x.id}" aria-label="Rename">${ic('pencil')}</button><button class="iconbtn sm" data-act="delsec" data-id="${x.id}" aria-label="Delete section">${ic('trash')}</button></div>${plans.filter(p=>p.sec===x.id).map(planRow).join('')}<button class="addline" data-act="newplan" data-sec="${x.id}">${ic('plus')} Plan in ${esc(x.name)}</button></div>`).join('')}
        ${loose.length?`<div class="secbox loose">${secs.length?'<div class="sech muted">Not in a section</div>':''}${loose.map(planRow).join('')}</div>`:''}
        ${!plans.length&&!secs.length?'<p class="muted small">No plans yet. Make a section (like a city or one trip) to group plans, or just add a plan.</p>':''}
      </div>`;
      if(statesOn(cc))drawMini($('#cmini',el),cc,sel);
      const qi=$('#cityQ',el);if(qi){qi.value=cq;qi.oninput=e=>{cq=e.target.value;cityResults(el,cc,cq)}}
      cityResults(el,cc,cq);
    },
    click(e,t){
      const pl=e.target.closest('[data-plan]');if(pl){openPlan(pl.dataset.plan);return}
      if(stClick(e,()=>this.refresh()))return;
      const rid=e.target.closest('[data-rid]');if(rid){sel=rid.dataset.rid;this.refresh();return}
      const rq=e.target.closest('[data-rq]');if(rq){const k=rq.dataset.k;setR(cc,rq.dataset.rq,k,!rs(cc,rq.dataset.rq)[k]);this.refresh();return}
      const cqb=e.target.closest('[data-cq]');if(cqb){const n=cqb.dataset.cq,k=cqb.dataset.k,m=(cs(cc).cities||{})[n];const row=m?[n,m.lat,m.lon,m.adm]:((CITIES||{})[cc]||[]).find(r=>r[0]===n);if(row){setCity(cc,row,k,!ct(cc,n)[k]);this.refresh()}return}
      if(photoClick(e,()=>co(cc).photos||(co(cc).photos=[]),this))return;
      if(!t)return;const a=t.dataset.act;
      if(a==='tog'){const k=t.dataset.k;setK(cc,k,!cs(cc)[k]);this.refresh()}
      else if(a==='addvisit'){const o=co(cc);(o.visits||(o.visits=[])).push({id:uid(),start:today(),end:today(),note:''});if(!o.been)setK(cc,'been',true);else save();this.refresh()}
      else if(a==='delvisit'){if(confirm('Remove this visit?')){const o=co(cc);o.visits=(o.visits||[]).filter(v=>v.id!==t.dataset.id);save();this.refresh()}}
      else if(a==='regfs'){openRegionMapFS(cc)}
      else if(a==='newsec'){if(newSection(cc))this.refresh()}
      else if(a==='newplan'){const p=newPlan(cc,t.dataset.sec);openPlan(p.id,true)}
      else if(a==='rensec'){const x=S.sections.find(s=>s.id===t.dataset.id);const n=(prompt('Rename section',x.name)||'').trim();if(n){x.name=n;save();this.refresh()}}
      else if(a==='delsec'){const x=S.sections.find(s=>s.id===t.dataset.id);if(confirm(`Delete the section “${x.name}”? Its plans stay in ${c.name}, just not in a section.`)){S.sections=S.sections.filter(s=>s!==x);S.plans.forEach(p=>{if(p.sec===x.id)p.sec=''});save();this.refresh()}}
    },
    input(e){if(visitEvent(e,cc,()=>this.refresh()))return;const f=e.target.dataset.f;if(f){co(cc)[f]=e.target.value;save()}},
    change(e){if(visitEvent(e,cc,()=>this.refresh()))return;photoChange(e,()=>co(cc).photos||(co(cc).photos=[]),this)},
  });
}

/* ---------- plan sheet ---------- */
function vidInfo(url){
  let u;try{u=new URL(url)}catch(e){return{type:'link',host:'Link'}}
  const h=u.hostname.replace(/^(www|m|vm|vt)\./,'');let m;
  if(/(^|\.)youtube\.com$/.test(h)){if(m=u.pathname.match(/^\/(shorts|embed|live)\/([\w-]{6,})/))return{type:'yt',id:m[2],host:'YouTube',tall:m[1]==='shorts'};const v=u.searchParams.get('v');if(v)return{type:'yt',id:v,host:'YouTube'}}
  if(h==='youtu.be')return{type:'yt',id:u.pathname.slice(1),host:'YouTube'};
  if(/(^|\.)tiktok\.com$/.test(h)){if(m=u.pathname.match(/\/(video|photo)\/(\d+)/))return{type:'tt',id:m[2],host:'TikTok',tall:true};return{type:'link',host:'TikTok',note:'Short TikTok share links can’t play here. Tap Open, then copy the full link from the address bar if you want it to play inside Roamd.'}}
  if(/(^|\.)instagram\.com$/.test(h)){if(m=u.pathname.match(/\/(reel|reels|p|tv)\/([\w-]+)/))return{type:'ig',id:m[2],host:'Instagram',tall:true}}
  return{type:'link',host:h||'Link'};
}
const embedURL=v=>v.type==='yt'?`https://www.youtube.com/embed/${v.id}?playsinline=1`:v.type==='tt'?`https://www.tiktok.com/embed/v2/${v.id}`:`https://www.instagram.com/p/${v.id}/embed`;
function vidCard(l,i){const v=vidInfo(l.url);return`<div class="vid"><div class="vtop"><span class="vhost h-${v.type}">${esc(v.host)}</span><input class="vnote" data-vnote="${i}" value="${esc(l.note||'')}" placeholder="What’s this one? (optional)"><button class="iconbtn sm" data-act="dellink" data-i="${i}" aria-label="Remove link">${ic('x')}</button></div>${v.type!=='link'?`<div class="vframe ${v.tall?'tall':'wide'}" data-embed="${esc(embedURL(v))}"><button class="btn sm ghost" data-act="watch">${ic('play')} Watch here</button></div>`:v.note?`<p class="tiny muted">${v.note}</p>`:''}<a class="vlink" href="${esc(l.url)}" target="_blank" rel="noopener">${ic('ext')} Open in ${esc(v.host)}</a></div>`}
const firstURL=t=>{const m=String(t||'').match(/https?:\/\/[^\s"'<>]+/);return m?m[0]:''};
function cleanURL(t){let u=firstURL(t)||String(t||'').trim();if(!u)return'';if(!/^https?:\/\//.test(u))u='https://'+u;try{new URL(u);return u}catch(e){return''}}

function openPlan(id,fresh){
  sheet({
    render(el){
      const p=S.plans.find(x=>x.id===id);
      if(!p){el.innerHTML=shead('Plan')+'<div class="sbody"><p class="muted">This plan was deleted.</p></div>';return}
      const c=BY[p.cc],secs=S.sections.filter(s=>s.cc===p.cc);
      el.innerHTML=`${shead(`<span class="flag">${flag(p.cc)}</span><span class="tt"><b>${esc(c.name)}</b><small>Plan</small></span>`,`<button class="iconbtn" data-act="delplan" aria-label="Delete plan">${ic('trash')}</button>`)}
      <div class="sbody">
        <input class="ptitle" data-p="title" value="${esc(p.title)}" placeholder="Name this plan (e.g. Kyoto in spring)">
        <div class="grid2"><label class="fld"><span>Country</span><button class="selbtn" data-act="movecc">${flag(p.cc)} ${esc(c.name)}</button></label>
        <label class="fld"><span>Section</span><select data-p="sec"><option value="">None</option>${secs.map(s=>`<option value="${s.id}"${p.sec===s.id?' selected':''}>${esc(s.name)}</option>`).join('')}<option value="__new">+ New section…</option></select></label></div>
        <div class="grid2"><label class="fld"><span>From</span><input type="date" data-p="start" value="${p.start||''}"></label><label class="fld"><span>To</span><input type="date" data-p="end" value="${p.end||''}"></label></div>
        <div class="seg" role="group" aria-label="Status">${['idea','booked','done'].map(s=>`<button data-act="status" data-v="${s}" class="${p.status===s?'on':''}">${STATUS_L[s]}</button>`).join('')}</div>
        <h4 class="sub">Reels, TikToks &amp; links</h4>
        <div class="vids">${(p.links||[]).map(vidCard).join('')}</div>
        <div class="addlink"><input type="url" id="linkIn" placeholder="Paste a reel, TikTok or YouTube link" autocomplete="off"><button class="btn sm ghost" data-act="paste">${ic('clip')} Paste</button><button class="btn sm" data-act="addlink">Add</button></div>
        <h4 class="sub">Photos</h4>${gridHTML(p.photos||[])}
        <h4 class="sub">Checklist</h4>
        <div class="todos">${(p.todos||[]).map((t,i)=>`<div class="todo"><input type="checkbox" data-todo="${i}"${t.done?' checked':''} aria-label="Done"><input class="tdt${t.done?' done':''}" data-todot="${i}" value="${esc(t.t)}"><button class="iconbtn sm" data-act="deltodo" data-i="${i}" aria-label="Remove">${ic('x')}</button></div>`).join('')}
        <div class="todo add"><input id="todoIn" placeholder="Add an item (passport, book hostel…)" enterkeyhint="done"><button class="btn sm" data-act="addtodo">Add</button></div></div>
        <div class="btnrow packrow"><button class="btn sm ghost" data-act="pack">Add my packing list</button>${(p.todos||[]).length?'<button class="btn sm ghost" data-act="savepack">Save as my packing list</button>':''}</div>
        <label class="fld"><span>Notes</span><textarea data-p="notes" rows="5" placeholder="Ideas, food to try, budget, who to see…">${esc(p.notes||'')}</textarea></label>
      </div>`;
      if(fresh){fresh=false;setTimeout(()=>{const t=$('.ptitle',el);if(t&&!t.value)t.focus()},350)}
      const ti=$('#todoIn',el);if(ti)ti.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('[data-act=addtodo]',el).click()}};
      const li=$('#linkIn',el);if(li)li.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('[data-act=addlink]',el).click()}};
    },
    async click(e,t){
      const p=S.plans.find(x=>x.id===id);if(!p)return;
      if(photoClick(e,()=>p.photos||(p.photos=[]),this))return;
      if(!t)return;const a=t.dataset.act;
      if(a==='status'){p.status=t.dataset.v;save();this.refresh()}
      else if(a==='addlink'){const inp=$('#linkIn',this.el);const u=cleanURL(inp.value);if(!u){toast('That doesn’t look like a link');return}(p.links||(p.links=[])).push({url:u,note:''});save();this.refresh()}
      else if(a==='paste'){try{const txt=await navigator.clipboard.readText();const u=cleanURL(txt);if(!u){toast('No link on the clipboard');return}(p.links||(p.links=[])).push({url:u,note:''});save();this.refresh();toast('Link added')}catch(err){toast('Paste it into the box instead');$('#linkIn',this.el).focus()}}
      else if(a==='dellink'){p.links.splice(+t.dataset.i,1);save();this.refresh()}
      else if(a==='watch'){const f=t.closest('.vframe');f.classList.add('on');f.innerHTML=`<iframe src="${f.dataset.embed}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`}
      else if(a==='addtodo'){const inp=$('#todoIn',this.el);const v=inp.value.trim();if(!v)return;(p.todos||(p.todos=[])).push({t:v,done:false});save();this.refresh();$('#todoIn',this.el).focus()}
      else if(a==='pack'){const have=new Set((p.todos||[]).map(x=>x.t.toLowerCase()));const add=packList().filter(x=>!have.has(x.toLowerCase()));(p.todos||(p.todos=[])).push(...add.map(t=>({t,done:false})));save();this.refresh();toast(add.length?`Added ${plural(add.length,'item')}`:'Already on the list')}
      else if(a==='savepack'){S.settings.packing=(p.todos||[]).map(x=>x.t);save();toast('Saved as your packing list')}
      else if(a==='deltodo'){p.todos.splice(+t.dataset.i,1);save();this.refresh()}
      else if(a==='delplan'){if(confirm('Delete this plan? Its photos are deleted too.')){(p.photos||[]).forEach(id=>phDel(id).catch(()=>{}));S.plans=S.plans.filter(x=>x!==p);save();history.back()}}
      else if(a==='movecc'){pickCountry('Move plan to…',cc=>{if(cc!==p.cc){p.cc=cc;p.sec='';save()}})}
    },
    input(e){
      const p=S.plans.find(x=>x.id===id);if(!p)return;const d=e.target.dataset;
      if(d.p&&d.p!=='sec'){p[d.p]=e.target.value;save()}
      else if(d.vnote!=null){p.links[+d.vnote].note=e.target.value;save()}
      else if(d.todot!=null){p.todos[+d.todot].t=e.target.value;save()}
    },
    change(e){
      const p=S.plans.find(x=>x.id===id);if(!p)return;const d=e.target.dataset;
      if(d.p==='sec'){if(e.target.value==='__new'){const s=newSection(p.cc);p.sec=s?s.id:p.sec}else p.sec=e.target.value;save();this.refresh()}
      else if(d.todo!=null){p.todos[+d.todo].done=e.target.checked;save();this.refresh()}
      else photoChange(e,()=>p.photos||(p.photos=[]),this);
    },
  });
}

function pickCountry(title,cb){
  let qq='';
  const o=sheet({
    render(el){
      if(!el.innerHTML){el.innerHTML=`${shead(`<span class="tt"><b>${esc(title)}</b></span>`)}<div class="pickq"><input id="pickQ" placeholder="Search countries" autocomplete="off"></div><div class="sbody" id="pickList"></div>`;$('#pickQ',el).oninput=e=>{qq=e.target.value.toLowerCase();list()}}
      const list=()=>{const want=C.filter(c=>cs(c.cc).want&&!qq);const rows=C.filter(c=>showC(c)&&(!qq||c.name.toLowerCase().includes(qq)));$('#pickList',el).innerHTML=(want.length?`<h3 class="rhead"><span>Want to go</span></h3><div class="card">${want.map(c=>`<button class="pick" data-pick="${c.cc}"><span class="flag">${flag(c.cc)}</span>${esc(c.name)}</button>`).join('')}</div>`:'')+`<h3 class="rhead"><span>${qq?'Matches':'All countries'}</span></h3><div class="card">${rows.map(c=>`<button class="pick" data-pick="${c.cc}"><span class="flag">${flag(c.cc)}</span>${esc(c.name)}<small>${RNAME[c.reg]}</small></button>`).join('')||'<p class="empty">No match.</p>'}</div>`};list();
    },
    async click(e){const b=e.target.closest('[data-pick]');if(!b)return;await back();cb(b.dataset.pick)},
  });
  setTimeout(()=>{const i=$('#pickQ',o.el);if(i&&matchMedia('(hover:hover)').matches)i.focus()},300);
}

/* ---------- photos ---------- */
const urlCache=new Map();
function gridHTML(ids){return`<div class="pgrid">${ids.map((id,i)=>`<button class="ph" data-phi="${i}" aria-label="Photo ${i+1}"><img data-ph="${id}" alt=""></button>`).join('')}<label class="ph add">${ic('cam')}<span>Add</span><input type="file" accept="image/*" multiple hidden data-addph></label></div>`}
async function thumbURL(id){if(urlCache.has(id))return urlCache.get(id);const p=await phGet(id);if(!p)return'';const u=URL.createObjectURL(p.thumb||p.blob);urlCache.set(id,u);return u}
function fillPhotos(el){$$('img[data-ph]',el).forEach(async img=>{const u=await thumbURL(img.dataset.ph).catch(()=>'');if(u)img.src=u;else img.closest('.ph')?.classList.add('missing')})}
async function shrink(file,max,q){
  let src=null;try{src=await createImageBitmap(file,{imageOrientation:'from-image'})}catch(e){}
  if(!src)src=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(file)});
  const w=src.width,h=src.height,k=Math.min(1,max/Math.max(w,h)),cv=document.createElement('canvas');cv.width=Math.round(w*k);cv.height=Math.round(h*k);
  cv.getContext('2d').drawImage(src,0,0,cv.width,cv.height);return new Promise(r=>cv.toBlob(r,'image/jpeg',q));
}
async function storePhoto(file,caption=''){const blob=await shrink(file,1800,.84),thumb=await shrink(blob,420,.78);const id=uid();await phPut({id,blob,thumb,caption,created:Date.now()});return id}
async function photoChange(e,getArr,o){
  if(!e.target.matches('[data-addph]'))return;const files=[...e.target.files];if(!files.length)return;
  toast(`Adding ${plural(files.length,'photo')}…`);let n=0;
  for(const f of files){try{getArr().push(await storePhoto(f));n++;save()}catch(err){}}
  persist();o.refresh();toast(n===files.length?`${plural(n,'photo')} added`:`Added ${n} of ${files.length}. Some couldn’t be read.`);
}
function photoClick(e,getArr,o){const b=e.target.closest('[data-phi]');if(!b)return false;openViewer(getArr,+b.dataset.phi);return true}
function openViewer(getArr,start){
  let i=start,url='';
  sheet({
    async render(el){
      const ids=getArr();if(!ids.length){el.innerHTML=shead('Photos')+'<div class="sbody"><p class="muted">No photos.</p></div>';return}
      i=Math.max(0,Math.min(i,ids.length-1));const p=await phGet(ids[i]).catch(()=>null);
      if(url)URL.revokeObjectURL(url);url=p?URL.createObjectURL(p.blob):'';
      el.innerHTML=`${shead(`<span class="tt"><b>Photo ${i+1} of ${ids.length}</b></span>`,`<button class="iconbtn" data-act="delph" aria-label="Delete photo">${ic('trash')}</button>`)}<div class="sbody viewer">${url?`<img src="${url}" alt="">`:'<p class="muted">This photo is missing.</p>'}<div class="vnav"><button class="btn ghost" data-act="prev"${i===0?' disabled':''}>Previous</button><button class="btn ghost" data-act="next"${i===ids.length-1?' disabled':''}>Next</button></div><input class="cap" placeholder="Caption" value="${esc(p?.caption||'')}"></div>`;
      $('.cap',el).oninput=async ev=>{const r=await phGet(ids[i]);if(r){r.caption=ev.target.value;phPut(r)}};
    },
    click(e,t){if(!t)return;const a=t.dataset.act;const ids=getArr();
      if(a==='prev'){i--;this.refresh()}else if(a==='next'){i++;this.refresh()}
      else if(a==='delph'){if(confirm('Delete this photo?')){const id=ids[i];ids.splice(i,1);phDel(id).catch(()=>{});urlCache.delete(id);save();if(!ids.length)history.back();else this.refresh()}}},
  });
}

/* ---------- compare ---------- */
const ORDER=C.map(c=>c.cc).slice().sort();
function myCode(){const b=[],w=[],l=[];for(const cc of ORDER){const s=cs(cc);if(s.lived)l.push(cc);else if(s.been)b.push(cc);if(s.want&&!s.been)w.push(cc)}return`1~${encodeURIComponent((S.me||'A friend').slice(0,30))}~${b.join('')}~${w.join('')}~${l.join('')}`}
const myLink=()=>`${location.origin}${location.pathname}#m=${myCode()}`;
function parseCode(txt){
  const m=String(txt||'').match(/(?:#m=)?(1~[^\s#]*)/);if(!m)return null;
  const p=m[1].split('~');if(p.length<5)return null;
  const split=s=>(s.match(/[A-Z]{2}/g)||[]).filter(cc=>BY[cc]);
  let name='';try{name=decodeURIComponent(p[1])}catch(e){name=p[1]}
  const lived=split(p[4]);return{name:name||'A friend',been:[...new Set([...split(p[2]),...lived])],want:split(p[3]),lived};
}
function addFriend(f){const ex=S.friends.find(x=>x.name.toLowerCase()===f.name.toLowerCase());if(ex&&confirm(`Replace your saved map from ${ex.name} with this newer one?`)){Object.assign(ex,f,{added:Date.now()});save();return ex}const n={id:uid(),...f,added:Date.now()};S.friends.push(n);save();return n}
function renderCompare(){
  const n=counts();
  $('#cmpBox').innerHTML=`
  <div class="card pad">
    <h3 class="h3">Share your map</h3>
    <p class="muted small">Send this link to a friend. When they open it in Roamd, they see how your maps compare. It’s a snapshot: send a new one after you update.</p>
    <label class="fld"><span>Your name on the link</span><input id="meName" value="${esc(S.me)}" placeholder="e.g. Newt" maxlength="30"></label>
    <p class="small">${n.been} countries been · ${n.want} want to go · ${n.lived} lived</p>
    <div class="btnrow"><button class="btn" data-cmp="share">${ic('share')} Share my map</button><button class="btn ghost" data-cmp="copy">${ic('clip')} Copy link</button></div>
  </div>
  <div class="card pad">
    <h3 class="h3">Add a friend’s map</h3>
    <p class="muted small">Opening their link adds it here automatically. Or paste the link they sent you.</p>
    <div class="addlink"><input id="frIn" placeholder="Paste their Roamd link" autocomplete="off"><button class="btn sm ghost" data-cmp="paste">${ic('clip')} Paste</button><button class="btn sm" data-cmp="add">Add</button></div>
  </div>
  <h3 class="rhead"><span>Friends’ maps</span></h3>
  ${S.friends.length?`<div class="card">${S.friends.map(f=>{const r=cmpStats(f);return`<button class="frow" data-friend="${f.id}"><span class="av">${esc((f.name[0]||'?').toUpperCase())}</span><span class="ptxt"><span class="pt">${esc(f.name)}</span><span class="pm">${plural(f.been.length,'country')} · ${r.both.length} in common · ${r.them.length} you haven’t</span></span>${ic('chev','chev')}</button>`}).join('')}</div>`:'<p class="empty">No friends’ maps yet.</p>'}`;
}
function cmpStats(f){const me=new Set(C.filter(c=>cs(c.cc).been).map(c=>c.cc)),th=new Set(f.been);const both=[...me].filter(x=>th.has(x)),mine=[...me].filter(x=>!th.has(x)),them=[...th].filter(x=>!me.has(x));const wantBoth=f.want.filter(cc=>cs(cc).want&&!cs(cc).been);return{both,mine,them,wantBoth,me}}
const chipList=ccs=>ccs.length?`<div class="chips2">${ccs.map(cc=>BY[cc]).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<button class="wchip" data-open-cc="${c.cc}">${flag(c.cc)} ${esc(c.name)}</button>`).join('')}</div>`:'<p class="muted small">None.</p>';
function openFriend(id){
  sheet({
    render(el){
      const f=S.friends.find(x=>x.id===id);if(!f){el.innerHTML=shead('Compare')+'<div class="sbody"><p class="muted">Removed.</p></div>';return}
      const r=cmpStats(f),coreN=a=>a.filter(cc=>BY[cc]?.core).length;
      el.innerHTML=`${shead(`<span class="tt"><b>You &amp; ${esc(f.name)}</b><small>Their map from ${new Date(f.added).toLocaleDateString()}</small></span>`,`<button class="iconbtn" data-act="delfr" aria-label="Remove">${ic('trash')}</button>`)}
      <div class="sbody">
        <div class="cminiwrap"><div class="cmpmap" id="cmpMap"><div class="loading">Loading map…</div></div><button class="iconbtn sm mfs" data-act="cfs" aria-label="Full screen map">${ic('expand')}</button></div>
        <div class="legend"><span class="lg"><i class="dot both"></i>Both <b>${r.both.length}</b></span><span class="lg"><i class="dot mine"></i>Only you <b>${r.mine.length}</b></span><span class="lg"><i class="dot them"></i>Only ${esc(f.name)} <b>${r.them.length}</b></span></div>
        <div class="vs"><div><b>${coreN([...r.me])}</b><span>You</span></div><div class="vsmid">countries</div><div><b>${coreN(f.been)}</b><span>${esc(f.name)}</span></div></div>
        <h4 class="sub">${esc(f.name)} has been, you haven’t <small class="muted">trip ideas, ask them</small></h4>${chipList(r.them)}
        <h4 class="sub">You both want to go</h4>${chipList(r.wantBoth)}
        <h4 class="sub">Been to both</h4>${chipList(r.both)}
        <h4 class="sub">Only you</h4>${chipList(r.mine)}
        ${f.lived.length?`<h4 class="sub">${esc(f.name)} has lived in</h4>${chipList(f.lived)}`:''}
      </div>`;
      drawCompare($('#cmpMap',el),r);
    },
    click(e,t){const oc=e.target.closest('[data-open-cc]');if(oc){openCountry(oc.dataset.openCc);return}if(t&&t.dataset.act==='cfs'){const f=S.friends.find(x=>x.id===id);openCompareFS(cmpStats(f),f.name);return}if(t&&t.dataset.act==='delfr'){const f=S.friends.find(x=>x.id===id);if(confirm(`Remove ${f.name}’s map?`)){S.friends=S.friends.filter(x=>x!==f);save();history.back()}}},
  });
}
async function drawCompare(box,r){
  try{await loadGeo()}catch(e){box.innerHTML='<p class="muted pad small">The map needs internet the first time. The lists below still work.</p>';return}
  const th=new Set([...r.both,...r.them]);
  box.innerHTML=`<svg viewBox="0 0 ${MW} ${MH}" class="map small"><path class="sphere" d="${geoPath({type:'Sphere'})}"/>${PATHD.map(p=>{const a=r.me.has(p.cc),b=th.has(p.cc);return`<path class="c${a&&b?' s-both':a?' s-mine':b?' s-them':''}" d="${p.d}"/>`}).join('')}${DOTS.filter(d=>r.me.has(d.cc)||th.has(d.cc)).map(d=>{const a=r.me.has(d.cc),b=th.has(d.cc);return`<circle class="cdot ${a&&b?'s-both':a?'s-mine':'s-them'}" cx="${d.x}" cy="${d.y}" r="6"/>`}).join('')}</svg>`;
}
async function shareMine(){
  const url=myLink(),text=`My travel map on Roamd: ${counts().been} countries. Open to compare with yours:`;
  if(navigator.share){try{await navigator.share({title:'My Roamd map',text,url});return}catch(e){if(e.name==='AbortError')return}}
  copyText(url);
}
async function copyText(s){try{await navigator.clipboard.writeText(s);toast('Link copied')}catch(e){prompt('Copy this link:',s)}}
function takeFriendLink(txt){const f=parseCode(txt);if(!f){toast('That isn’t a Roamd map link');return false}const n=addFriend(f);setTab('compare');openFriend(n.id);return true}

/* ---------- stats ---------- */
async function renderStats(){
  const n=counts(),pct=Math.round(n.been/n.total*1000)/10,home=S.settings.home;
  const regs=REGIONS.filter(([rc])=>rc!=='AN').map(([rc,rn])=>{const all=C.filter(c=>c.reg===rc&&c.core);const b=all.filter(c=>cs(c.cc).been).length;return{rc,rn,b,t:all.length}});
  const conts=new Set(beenCCs().map(continentOf).filter(Boolean));
  const regs2=Object.values(S.countries).reduce((a,s)=>a+Object.values(s.regions||{}).filter(x=>x.been).length,0),cities2=Object.values(S.countries).reduce((a,s)=>a+Object.values(s.cities||{}).filter(x=>x.been).length,0),aps=Object.keys(S.airports||{}).length;
  const photos=Object.values(S.countries).reduce((a,s)=>a+(s.photos?.length||0),0)+S.plans.reduce((a,p)=>a+(p.photos?.length||0),0);
  const vs=allVisits(),away=vs.filter(v=>v.cc!==home).reduce((a,v)=>a+v.days,0),fs=flightStats();
  const byYear={};vs.forEach(v=>{const y=v.start.slice(0,4);(byYear[y]||(byYear[y]=new Set())).add(v.cc)});const yrs=Object.keys(byYear).sort().reverse().slice(0,10),ymax=Math.max(1,...yrs.map(y=>byYear[y].size));
  let far=null;const ce=centroids();if(home&&ce[home]){const[hl,ho]=ce[home];const cand=[];beenCCs().forEach(cc=>{if(cc!==home&&ce[cc])cand.push([BY[cc].name,cc,ce[cc]])});
    Object.entries(S.countries).forEach(([cc,o])=>Object.entries(o.cities||{}).forEach(([nm,x])=>{if(x.been)cand.push([nm+', '+BY[cc].name,cc,[x.lat,x.lon]])}));
    cand.forEach(c=>{const d=hav(hl,ho,c[2][0],c[2][1]);if(!far||d>far.d)far={d,name:c[0],cc:c[1]}})}
  const B=badgeList(),earned=B.filter(b=>b[2]>=b[3]).length;
  const tile=(v,l)=>`<div class="tile"><b>${v}</b><span>${l}</span></div>`;
  $('#statsBox').innerHTML=`
  <div class="hero"><div class="big">${n.been}<small>/${n.total}</small></div><div><b>countries</b><span>${pct}% of the world${n.terr?` · plus ${plural(n.terr,'territory')}`:''}${S.settings.ukSplit?' · UK nations counted separately':''}</span></div>
  <div class="bar"><i style="width:${Math.min(100,pct)}%"></i></div></div>
  <div class="btnrow" id="stBtns" style="margin-top:10px"><button class="btn" data-st="share" style="flex:1">${ic('share')} Share picture</button><button class="btn ghost" data-st="timeline" style="flex:1">${ic('clock')} Timeline</button></div>
  <div class="tiles">${tile(conts.size+'<small>/7</small>','continents')}${tile(n.lived,'lived in')}${tile(n.want,'want to go')}${n.drive?tile(n.drive,'drove through'):''}${tile(regs2,'states &amp; regions')}${tile(cities2,'cities')}${tile(aps,'airports')}${tile(fs.n,'flights')}${tile(fmtN(fs.km),'km flown')}${tile(away,'days away')}${tile(S.plans.length,'plans')}${tile(photos,'photos')}${tile(S.friends.length,'friends’ maps')}</div>
  ${far?`<div class="card pad farcard"><span class="small muted">Farthest from home</span><b>${flag(far.cc)} ${esc(far.name)}</b><span class="small">${fmtN(far.d)} km · ${fmtN(far.d*0.621371)} mi from ${esc(BY[home].name)}</span></div>`:home?'':`<button class="card pad farcard" data-st="home"><span class="small muted">Farthest from home</span><b>Set your home country</b><span class="small muted">Also used for days away and the Expat badge</span></button>`}
  <h3 class="rhead"><span>Badges</span><small>${earned} of ${B.length}</small></h3>
  <div class="badges" id="statBadges">${B.map(([nm,d,v,goal])=>{const on=v>=goal;return`<div class="badge${on?' on':''}"><span class="bico">${ic('star')}</span><b>${nm}</b><span>${esc(d)}</span>${on?'':`<span class="bprog"><i style="width:${Math.min(100,v/goal*100)}%"></i></span><small>${fmtN(Math.min(v,goal))} / ${fmtN(goal)}</small>`}</div>`}).join('')}</div>
  <h3 class="rhead"><span>Lists</span></h3><div id="statLists"><div class="loading" style="position:static;padding:20px">Loading lists…</div></div>
  ${yrs.length?`<h3 class="rhead"><span>Countries by year</span></h3><div class="card pad">${yrs.map(y=>`<div class="rbar"><span class="rn">${y}</span><span class="rv">${byYear[y].size}</span><div class="bar"><i style="width:${byYear[y].size/ymax*100}%"></i></div></div>`).join('')}</div>`:''}
  ${fs.n?`<h3 class="rhead"><span>Flights</span><small>${fs.n} · ${fmtN(fs.km)} km</small></h3><div class="card pad fcard">
    ${fs.longest?`<p class="small"><b>Longest:</b> ${fs.longest.from} → ${fs.longest.to}, ${fmtN(flightKm(fs.longest))} km</p>`:''}
    <p class="small"><b>Top airports:</b> ${fs.ap.map(([c,k])=>`${c} (${k})`).join(', ')}</p><p class="small"><b>Top routes:</b> ${fs.rt.map(([c,k])=>`${c} (${k})`).join(', ')}</p>
    ${fs.al.length?`<p class="small"><b>Airlines:</b> ${fs.al.map(([c,k])=>`${esc(c)} (${k})`).join(', ')}</p>`:''}
    <p class="small muted">${(fs.km/40075).toFixed(2)}× around the Earth · ${(fs.km/384400*100).toFixed(1)}% of the way to the Moon</p>
    <button class="btn sm ghost" data-st="flights">All flights</button></div>`:`<div class="card pad"><p class="small">Log flights to see distance flown, top routes and airlines.</p><div class="btnrow"><button class="btn sm" data-st="flights">${ic('plane')} Add flights</button><button class="btn sm ghost" data-st="import">Import from Flighty or others</button></div></div>`}
  <h3 class="rhead"><span>By region</span></h3>
  <div class="card pad">${regs.map(r=>`<div class="rbar"><span class="rn">${r.rn}</span><span class="rv">${r.b}/${r.t}</span><div class="bar"><i style="width:${r.t?r.b/r.t*100:0}%"></i></div></div>`).join('')}</div>`;
  const lc=$('#statLists');if(lc)lc.innerHTML=await listsCardHTML();
}

/* ---------- settings, help, backup ---------- */
function applyTheme(){setTimeout(themeIcon);const t=S.settings.theme;if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.dataset.theme=t;const m=$('meta[name=theme-color]');if(m)m.content=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#f6f3ee'}
async function persist(){try{if(navigator.storage&&navigator.storage.persist)await navigator.storage.persist()}catch(e){}}
const blobToData=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
const dataToBlob=async d=>(await fetch(d)).blob();
async function saveBackup(){
  toast('Packing your backup…');
  const photos=await phAll().catch(()=>[]);const ph=[];
  for(const p of photos)ph.push({id:p.id,caption:p.caption||'',created:p.created,data:await blobToData(p.blob)});
  const json=JSON.stringify({app:'roamd',version:1,exported:new Date().toISOString(),state:S,photos:ph});
  const name=`roamd-backup-${today()}.json`,file=new File([json],name,{type:'application/json'});
  let ok=false;
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Roamd backup'});ok=true}catch(e){if(e.name==='AbortError')return}}
  if(!ok){const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
  S.settings.lastBackup=Date.now();save();render();toast('Backup saved');
}
async function restoreBackup(file){
  let d;try{d=JSON.parse(await file.text())}catch(e){toast('That file isn’t a Roamd backup');return}
  if(!d||!['roamd','roamed'].includes(d.app)||!d.state){toast('That file isn’t a Roamd backup');return}
  if(!confirm(`Replace everything in Roamd with this backup from ${String(d.exported||'').slice(0,10)}? This can’t be undone.`))return;
  toast('Restoring…');await phClear().catch(()=>{});urlCache.clear();
  for(const p of d.photos||[]){try{const blob=await dataToBlob(p.data);const thumb=await shrink(blob,420,.78);await phPut({id:p.id,blob,thumb,caption:p.caption,created:p.created})}catch(e){}}
  S=Object.assign(blank(),d.state);S.settings=Object.assign(blank().settings,d.state.settings||{},{tourDone:true});save();applyPalette();applyTheme();
  while(stack.length)await back();render();toast('Backup restored');
}
function exportCSV(){
  const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;
  const rows=[['Country','Region','Been','Want to go','Lived','Drove through','When','Where lived','Notes','Visits']];
  for(const c of C){const s=cs(c.cc);if(c.disp||!(s.been||s.want||s.lived||s.drive||s.notes))continue;rows.push([c.name,RNAME[c.reg],s.been?'yes':'',s.want?'yes':'',s.lived?'yes':'',s.drive?'yes':'',s.years,s.livedNote,s.notes,(s.visits||[]).filter(v=>v.start).map(v=>v.start+(v.end&&v.end!==v.start?' to '+v.end:'')).join('; ')])}
  const blob=new Blob([rows.map(r=>r.map(q).join(',')).join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`roamd-countries-${today()}.csv`;a.click();
}
function openSettings(){
  sheet({
    render(el){
      const ios=/iP(hone|ad|od)/.test(navigator.userAgent),standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
      el.innerHTML=`${shead('<span class="tt"><b>Settings</b></span>')}<div class="sbody">
      <h4 class="sub">Theme</h4><div class="seg">${['auto','light','dark'].map(t=>`<button data-act="theme" data-v="${t}" class="${S.settings.theme===t?'on':''}">${t==='auto'?'Match phone':t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div>
      <h4 class="sub">Map colors</h4>${paletteHTML()}
      <h4 class="sub">Counting</h4><div id="cntBox"><div class="strow top"><span class="stname"><b>UK nations as four countries</b><small>England, Scotland, Wales and Northern Ireland each count once you mark one of their regions</small></span>${switchHTML(!!S.settings.ukSplit,'data-act="uk"','UK nations as four countries')}</div>
      <div class="strow top"><span class="stname"><b>Count territories</b><small>Puerto Rico, Greenland, Hong Kong and the other ${realC().filter(c=>!c.core).length} territories count toward your total</small></span>${switchHTML(!!S.settings.countTerr,'data-act="terr"','Count territories')}</div>
      <div class="strow top"><span class="stname"><b>Count “Drove through”</b><small>Places you only passed through count toward your total</small></span>${switchHTML(!!S.settings.countDrive,'data-act="cdrive"','Count drove through')}</div>
      ${homeHTML()}</div>
      <h4 class="sub">States &amp; provinces</h4>${statesTreeHTML()}
      <h4 class="sub">Airplanes on the map</h4>${planeSegHTML()}<p class="tiny muted">“Hide where I’ve been” keeps planes only in countries you haven’t marked Been or Lived. Off also hides flight routes.</p>
      <h4 class="sub">Disputed territories</h4><div class="strow top"><span class="stname"><b>Show disputed territories</b><small>Somaliland, Northern Cyprus, Abkhazia, Crimea, Kashmir areas and ${DISP.length-5} more become their own places to mark. They’re never counted in your countries.</small></span>${switchHTML(!!S.settings.disputed,'data-act="disp"','Show disputed territories')}</div>
      <h4 class="sub">Backup</h4><p class="muted small">Roamd saves on this phone only. A backup file holds everything, photos included. Last backup: <b>${S.settings.lastBackup?new Date(S.settings.lastBackup).toLocaleDateString():'never'}</b>.</p>
      <div class="btnrow"><button class="btn" data-act="backup">Save backup</button><label class="btn ghost">Restore from backup<input type="file" accept="application/json,.json" hidden id="restoreIn"></label></div>
      <h4 class="sub">Import</h4><div class="btnrow"><button class="btn ghost" data-act="impfl">${ic('plane')} Flights (CSV)</button><button class="btn ghost" data-act="impph">${ic('cam')} Places from photos</button></div>
      <h4 class="sub">Packing list</h4><p class="muted small">One item per line. Add it to any plan’s checklist with one tap.</p><textarea id="packIn" rows="6">${esc(packList().join('\n'))}</textarea>
      <h4 class="sub">Export</h4><div class="btnrow"><button class="btn ghost" data-act="csv">Countries as a spreadsheet (CSV)</button></div>
      ${standalone?'':`<h4 class="sub">Put Roamd on your home screen</h4><p class="muted small">${ios?'In Safari, tap Share, then <b>Add to Home Screen</b>.':'In Chrome, tap ⋮, then <b>Install app</b> (or Add to Home screen).'} It then opens full screen and works offline.</p>`}
      <h4 class="sub">More</h4><div class="btnrow"><button class="btn ghost" data-act="tour">Replay the tour</button><button class="btn ghost" data-act="help">Help</button></div>
      <h4 class="sub danger">Start over</h4><button class="btn danger" data-act="wipe">Erase everything on this phone</button>
      <p class="tiny muted ver">Roamd v3.1 · data: Natural Earth, geoBoundaries, OurAirports, UNESCO</p></div>`;
    },
    input(e){if(e.target.id==='packIn'){S.settings.packing=e.target.value.split('\n').map(x=>x.trim()).filter(Boolean);save()}},
    async click(e,t){if(stClick(e,()=>this.refresh()))return;const hc=e.target.closest('[data-hc]');if(hc){S.settings.homeColor=hc.dataset.hc;save();applyHomeColor();this.refresh();return}if(!t)return;const a=t.dataset.act;
      if(a==='planes'){setPlaneMode(t.dataset.v);this.refresh();return}
      if(a==='disp'){S.settings.disputed=!S.settings.disputed;save();this.refresh()}
      else if(a==='uk'){S.settings.ukSplit=!S.settings.ukSplit;save();this.refresh()}
      else if(a==='terr'){S.settings.countTerr=!S.settings.countTerr;save();this.refresh()}
      else if(a==='cdrive'){S.settings.countDrive=!S.settings.countDrive;save();this.refresh()}
      else if(a==='sethome'){pickCountry('Your home country',cc=>{S.settings.home=cc;save()})}
      else if(a==='clearhome'){S.settings.home='';save();this.refresh()}
      else if(a==='impfl'){openImportFlights()}else if(a==='impph'){openPhotoImport()}
      else if(a==='theme'){S.settings.theme=t.dataset.v;save();applyTheme();this.refresh()}
      else if(a==='pal'){S.settings.palette=t.dataset.v;save();applyPalette();this.refresh()}
      else if(a==='palcustom'){openColors()}
      else if(a==='backup')saveBackup();else if(a==='csv')exportCSV();
      else if(a==='tour'){await back();startTour()}else if(a==='help'){openHelp()}
      else if(a==='wipe'){if(confirm('Erase all countries, plans, photos and friends’ maps? Save a backup first if you might want them.')&&confirm('Really erase everything?')){await phClear().catch(()=>{});S=blank();S.settings.tourDone=true;save();await back();render();toast('Erased')}}},
    change(e){if(e.target.id==='restoreIn'&&e.target.files[0])restoreBackup(e.target.files[0])},
  });
}
function openHelp(){
  sheet({render(el){el.innerHTML=`${shead('<span class="tt"><b>Help</b></span>')}<div class="sbody help">
  <h4 class="sub">Marking countries</h4><p>Tap a country on the map, or use the Countries tab and tap <b>Been</b>, <b>Want</b>, <b>Lived</b> or <b>Drove</b> on its row. Lived also counts as Been. <b>Drove through</b> is for places you only passed through on the road; it has its own color, works for states and cities too, and counts toward your total only if you turn that on in Settings → Counting. Open a country to add visits, notes and photos.</p>
  <h4 class="sub">Visits and your timeline</h4><p>On a country’s page, tap <b>+ Visit</b> and set the dates. Stats → <b>Timeline</b> lists your trips by year; tap <b>Play</b> to watch your map fill in year by year. Visits also give days away and countries per year.</p>
  <h4 class="sub">States, provinces and cities</h4><p>213 countries have states, provinces or regions (Indonesia has all 38 provinces; the UK has England’s 9 regions plus Scotland, Wales and Northern Ireland). Tap one on the country’s map, or use the list; the corner button opens the map full screen. Find cities in the box under the map. Marking a state or city also marks the country.</p>
  <h4 class="sub">Add places from photos</h4><p>Countries tab → <b>From photos</b> (or Settings → Import). Pick photos; Roamd reads their location and date on this phone, suggests countries, states, cities and visits, and adds only what you keep.</p>
  <h4 class="sub">Airports and flights</h4><p>Tap the plane button on the map. Log airports with Log, − and +, or open <b>Flights</b> to add whole flights with dates; each flight draws an arc on the map and counts toward distance, top routes and badges. <b>Import</b> reads a CSV from Flighty, OpenFlights, myFlightradar24 or any sheet with From, To and Date columns.</p>
  <h4 class="sub">Lists</h4><p>Stats → Lists: UNESCO World Heritage sites, world capitals, the New 7 Wonders and US national parks. Tick what you’ve seen; ticking also marks the country. Turn on <b>Show on the map</b> to see them as small diamonds.</p>
  <h4 class="sub">Badges, share picture</h4><p>Stats shows badges with your progress toward each. <b>Share picture</b> makes an image of your map, numbers and flags for a post or story.</p>
  <h4 class="sub">How countries are counted</h4><p>The total is ${CORE}: UN members plus Vatican City and Palestine. Settings → Counting can count England, Scotland, Wales and Northern Ireland separately, and count territories (Puerto Rico, Greenland, Hong Kong…). Disputed territories are never counted.</p>
  <h4 class="sub">Colors and home</h4><p>Settings → Map colors: a preset (two are made for color blindness) or Custom on a color wheel. Set your home country to give it its own color.</p>
  <h4 class="sub">Plans</h4><p>Plans are sorted by region, then country, then sections you name, such as a city, a route or one trip. Each has dates, a status, reels and TikToks, photos, a checklist and notes. <b>Add my packing list</b> drops your list (edit it in Settings) into the checklist.</p>
  <h4 class="sub">Saving reels and TikToks</h4><p>Copy the link in Instagram, TikTok or YouTube (Share → Copy link), open the plan and tap <b>Paste</b>. On Android with Roamd installed you can also share straight to Roamd. Tap <b>Watch here</b> to play it inside the plan.</p>
  <h4 class="sub">Comparing maps</h4><p>In Compare, tap <b>Share my map</b> and send the link. When a friend opens it in Roamd they see both, only you, only them, and places you both want to go.</p>
  <h4 class="sub">Full screen</h4><p>The corner button on the main map, a country’s map or a Compare map makes it fill the screen. Back or the same button returns.</p>
  <h4 class="sub">Regions</h4><p>NA North America (incl. Mexico) · CA Central America · CB Caribbean · SA South America · EU Europe (incl. Russia) · ME Middle East (incl. Egypt, Iran, Türkiye, the Caucasus) · AF Africa · CAS Central Asia · SAS South Asia · EAS East Asia · SEA Southeast Asia · AU Australia &amp; NZ · OC Oceania · AN Antarctica. Continents for badges follow these, with Egypt in Africa.</p>
  <h4 class="sub">Limitations</h4><ul class="lims">
  <li><b>No sync.</b> Everything stays on this phone. Save a backup now and then; it includes photos.</li>
  <li><b>Photo locations on iPhone.</b> Safari can remove locations from photos picked straight from the Photos library. Save them to Files first and pick from Files, or use a computer. Photos with location turned off when taken can’t be placed.</li>
  <li><b>Flight import</b> only recognizes airports with scheduled flights (about 3,200); rows with others are skipped and counted.</li>
  <li><b>Compare is a snapshot</b> of countries only, not states, cities, flights or lists. Plans and photos are never shared.</li>
  <li><b>Video previews depend on the site.</b> Private or removed posts won’t play. Short TikTok links (vm.tiktok.com) only open in TikTok. Instagram may ask you to log in.</li>
  <li><b>iPhone can’t share into web apps.</b> Copy the link, then Paste.</li>
  <li><b>Small countries show as dots</b> at world zoom. Territories that the map data joins to another country (French Guiana, Réunion, Svalbard, Bonaire…) are split off so they fill only on their own.</li>
  <li><b>Cities</b> are those over about 150,000 people plus capitals; there’s no way to add your own place yet.</li>
  <li><b>Lists</b> are a snapshot: UNESCO sites as of August 2026.</li>
  <li><b>Share picture flags</b> may not show on some Windows computers.</li>
  <li><b>First map load needs internet</b>; after that it works offline.</li></ul>
  <p class="tiny muted">Data: Natural Earth (public domain); Indonesia’s provinces from geoBoundaries (CC BY 4.0); airports from OurAirports (public domain); UNESCO sites from UNESCO’s list via an open snapshot; US national parks from Wikipedia’s list.</p>
  <button class="btn ghost" data-act="tour">Replay the tour</button></div>`},async click(e,t){if(t&&t.dataset.act==='tour'){while(stack.length)await back();startTour()}}});
}
function openShareIn(url){
  sheet({
    render(el){el.innerHTML=`${shead('<span class="tt"><b>Save this video</b></span>')}<div class="sbody"><p class="small wrap">${esc(url)}</p><button class="btn" data-act="new">${ic('plus')} New plan</button>
    ${S.plans.length?`<h3 class="rhead"><span>Or add to a plan</span></h3><div class="card">${S.plans.slice().sort((a,b)=>(BY[a.cc]?.name||'').localeCompare(BY[b.cc]?.name||'')).map(p=>`<button class="pick" data-to="${p.id}"><span class="flag">${flag(p.cc)}</span>${esc(p.title||'Untitled plan')}<small>${esc(BY[p.cc]?.name||'')}</small></button>`).join('')}</div>`:''}</div>`},
    async click(e,t){const to=e.target.closest('[data-to]');
      if(to){const p=S.plans.find(x=>x.id===to.dataset.to);p.links.push({url,note:''});save();await back();openPlan(p.id);toast('Video saved')}
      else if(t&&t.dataset.act==='new'){await back();pickCountry('New plan in…',cc=>{const p=newPlan(cc);p.links.push({url,note:''});save();openPlan(p.id,true)})}},
  });
}

/* ---------- v3: disputed places, state toggles, theme button, Ironwood-style tour ---------- */
const DISP=[["D-AB","Abkhazia","GE","Breakaway region; claimed by Georgia"],["D-SO","South Ossetia","GE","Breakaway region; claimed by Georgia"],["D-TN","Transnistria","MD","Breakaway region; claimed by Moldova"],["D-CR","Crimea","UA","Administered by Russia; claimed by Ukraine"],["D-SL","Somaliland","SO","Self-governing; claimed by Somalia"],["D-NC","Northern Cyprus","CY","Self-governing; claimed by Cyprus"],["D-JK","Jammu & Kashmir and Ladakh","IN","Administered by India; claimed by Pakistan"],["D-AK","Azad Kashmir","PK","Administered by Pakistan; claimed by India"],["D-GB","Gilgit-Baltistan","PK","Administered by Pakistan; claimed by India"],["D-AC","Aksai Chin","CN","Administered by China; claimed by India"],["D-AP","Arunachal Pradesh","IN","Administered by India; claimed by China"],["D-SG","Siachen Glacier","IN","Claimed by India and Pakistan"],["D-GH","Golan Heights","IL","Administered by Israel; claimed by Syria"],["D-KU","Kuril Islands (southern)","RU","Administered by Russia; claimed by Japan"],["D-AY","Abyei","SD","Claimed by Sudan and South Sudan"],["D-IL","Ilemi Triangle","KE","Administered by Kenya; claimed by South Sudan"],["D-HT","Halayib Triangle","EG","Administered by Egypt; claimed by Sudan"],["D-BT","Bir Tawil","EG","Claimed by neither Egypt nor Sudan"],["D-ES","Guayana Esequiba","GY","Administered by Guyana; claimed by Venezuela"],["D-SP","Spratly Islands","PH","Claimed by China, Taiwan, Vietnam, Malaysia, the Philippines and Brunei"],["D-PI","Paracel Islands","CN","Administered by China; claimed by Vietnam and Taiwan"]];
DISP.forEach(([cc,name,par,note])=>{const o={n:'',cc,name,reg:BY[par].reg,core:false,disp:true,par,note};C.push(o);BY[cc]=o});
C.sort((a,b)=>a.name.localeCompare(b.name));
const showC=c=>!c.disp||!!S.settings.disputed;
let gDisp,dispFeats=null;
async function paintDisputed(){
  if(!mapReady||!gDisp)return;
  if(!S.settings.disputed){gDisp.selectAll('path').remove();return}
  if(!dispFeats){try{const t=await(await fetch('disputed.json')).json();dispFeats=topojson.feature(t,t.objects.d).features}catch(e){return}}
  gDisp.selectAll('path').data(dispFeats,d=>d.properties.id).join(en=>en.append('path').attr('d',d=>geoPath(d)).on('click',(e,d)=>openCountry(d.properties.id)).append('title').text(d=>d.properties.name))
    .attr('class',d=>'c dsp'+fillCls(d.properties.id));
}

/* state/province display toggles: everywhere → per region → per country */
const stCfg=()=>{const s=S.settings;s.stReg=s.stReg||{};s.stCc=s.stCc||{};if(s.stOn===undefined)s.stOn=true;return s};
function statesOn(cc){const s=stCfg(),c=BY[cc];if(!c||c.disp)return false;return s.stOn&&s.stReg[c.reg]!==false&&s.stCc[cc]!==false}
const regionOn=rc=>{const s=stCfg();return s.stOn&&s.stReg[rc]!==false};
const hasStates=cc=>!!(REGIDX&&REGIDX[cc]&&REGIDX[cc].length>1);
const regionCountries=rc=>C.filter(c=>c.reg===rc&&!c.disp&&hasStates(c.cc));
function setGlobal(on){const s=stCfg();s.stOn=on;save()}
function setRegion(rc,on){const s=stCfg();
  if(on&&!s.stOn){s.stOn=true;REGIONS.forEach(([r])=>{if(r!==rc)s.stReg[r]=false})}
  s.stReg[rc]=on;regionCountries(rc).forEach(c=>delete s.stCc[c.cc]);save()}
function setCountry(cc,on){const s=stCfg(),rc=BY[cc].reg;
  if(on){
    if(!s.stOn){s.stOn=true;REGIONS.forEach(([r])=>{if(r!==rc)s.stReg[r]=false})}
    if(s.stReg[rc]===false){s.stReg[rc]=true;regionCountries(rc).forEach(c=>{if(c.cc!==cc)s.stCc[c.cc]=false})}
    delete s.stCc[cc];
  }else s.stCc[cc]=false;
  save()}
function regionSummary(rc){const cs_=regionCountries(rc),on=cs_.filter(c=>statesOn(c.cc)).length;return{on,all:cs_.length}}
const switchHTML=(on,attrs,label)=>`<button class="sw-tog${on?' on':''}" role="switch" aria-checked="${on}" aria-label="${esc(label)}" ${attrs}><i></i></button>`;
function stRegionRow(rc,rn){const r=regionSummary(rc),on=regionOn(rc)&&r.on>0;
  return`<div class="strow"><span class="stname"><b>${rn}</b><small>${r.on===r.all&&on?'All '+r.all+' countries':r.on+' of '+r.all+' countries'}</small></span><button class="btn sm ghost" data-stchoose="${rc}">Choose countries</button>${switchHTML(on,`data-streg="${rc}"`,'States in '+rn)}</div>`}
function statesTreeHTML(){const s=stCfg();
  return`<div class="strow top"><span class="stname"><b>Show states &amp; provinces</b><small>Everywhere on the map and on country pages</small></span>${switchHTML(s.stOn,'data-stglobal','Show states and provinces')}</div>
  <div class="card stlist${s.stOn?'':' dim'}" id="stTree">${REGIONS.map(([rc,rn])=>regionCountries(rc).length?stRegionRow(rc,rn):'').join('')}</div>
  <p class="tiny muted">Turning a country on while its region is off turns the region on for that country only. Your marks are kept either way.</p>`}
function stClick(e,after){
  const g=e.target.closest('[data-stglobal]');if(g){setGlobal(!stCfg().stOn);after();return true}
  const r=e.target.closest('[data-streg]');if(r){const rc=r.dataset.streg;setRegion(rc,!(regionOn(rc)&&regionSummary(rc).on>0));after();return true}
  const ch=e.target.closest('[data-stchoose]');if(ch){openChooseCountries(ch.dataset.stchoose);return true}
  const c=e.target.closest('[data-stcc]');if(c){setCountry(c.dataset.stcc,!statesOn(c.dataset.stcc));after();return true}
  return false}
function openChooseCountries(rc){
  sheet({
    render(el){const list=regionCountries(rc);const r=regionSummary(rc);
      el.innerHTML=`${shead(`<span class="tt"><b>${RNAME[rc]}</b><small>States &amp; provinces: ${r.on} of ${r.all} countries on</small></span>`)}<div class="sbody">
      <div class="btnrow"><button class="btn sm" data-act="allon">All on</button><button class="btn sm ghost" data-act="alloff">All off</button></div>
      <div class="card" style="margin-top:10px">${list.map(c=>`<div class="strow"><span class="stname"><span class="flag">${flag(c.cc)}</span><b>${esc(c.name)}</b><small>${REGIDX[c.cc].length} ${rword(c.cc).toLowerCase()}</small></span>${switchHTML(statesOn(c.cc),`data-stcc="${c.cc}"`,'States in '+c.name)}</div>`).join('')}</div></div>`},
    click(e,t){if(stClick(e,()=>this.refresh()))return;if(!t)return;
      if(t.dataset.act==='allon'){setRegion(rc,true);this.refresh()}else if(t.dataset.act==='alloff'){setRegion(rc,false);this.refresh()}},
  });
}

/* theme button */
function isDark(){const t=S.settings.theme;return t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)}
function themeIcon(){const b=$('#themeBtn');if(b)b.innerHTML=isDark()?'<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>':'<svg class="ic" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';if(b)b.setAttribute('aria-label',isDark()?'Switch to light mode':'Switch to dark mode')}

/* ---------- tour: Ironwood-style spotlight with sample data ---------- */
let DEMO=null;
function demoState(){
  const d=blank();d.settings=Object.assign({},S.settings,{tourDone:true});d.me='You';
  const mark=(cc,o)=>d.countries[cc]=Object.assign({},o);
  ['FR','IT','ES','MX','EG','BR','TH','GB','DE','PT','GR','TR','MA','CA'].forEach(c=>mark(c,{been:true}));
  ['JP','PE','IS','NZ','ID','VN','AR','ZA'].forEach(c=>mark(c,{want:true}));
  mark('JO',{been:true,lived:true,livedNote:'Amman, 2021–2022'});mark('LB',{been:true});
  mark('US',{been:true,lived:true,regions:{'US-NC':{been:true,lived:true},'US-TX':{been:true},'US-NY':{been:true},'US-FL':{been:true},'US-GA':{been:true},'US-TN':{been:true},'US-CA':{want:true},'US-WA':{want:true}},cities:{'Charlotte':{been:true,lived:true,lat:35.205,lon:-80.83,adm:'North Carolina'},'New York':{been:true,lat:40.75,lon:-73.98,adm:'New York'}}});
  mark('BE',{drive:true});mark('NL',{drive:true});d.countries.US.regions['US-SC']={drive:true};d.countries.US.regions['US-VA']={drive:true};
  d.countries.ID.regions={'ID-BA':{want:true}};d.countries.ID.want=true;
  d.sections=[{id:'s1',cc:'JP',name:'Kyoto'},{id:'s2',cc:'JP',name:'Tokyo'}];
  d.plans=[{id:'p1',cc:'JP',sec:'s1',title:'Temples in spring',start:'2027-04-02',end:'2027-04-06',status:'idea',notes:'Fushimi Inari at sunrise.',links:[{url:'https://www.tiktok.com/@example/video/7234567890123456789',note:'Hidden temple'},{url:'https://www.instagram.com/reel/C1a2B3c4D5e/',note:'Tea house'}],photos:[],todos:[{t:'Rail pass',done:true},{t:'Book ryokan',done:false}]},
    {id:'p2',cc:'JP',sec:'s2',title:'Food crawl',start:'',end:'',status:'idea',notes:'',links:[],photos:[],todos:[]},
    {id:'p3',cc:'PE',sec:'',title:'Inca Trail',start:'2027-06-10',end:'2027-06-14',status:'booked',notes:'',links:[],photos:[],todos:[{t:'Permit',done:true}]}];
  d.airports={CLT:{n:6,name:'Charlotte Douglas International Airport',city:'Charlotte',cc:'US',lat:35.214,lon:-80.943},ATL:{n:3,name:'Hartsfield Jackson Atlanta International Airport',city:'Atlanta',cc:'US',lat:33.637,lon:-84.428},AMM:{n:2,name:'Queen Alia International Airport',city:'Amman',cc:'JO',lat:31.723,lon:35.993},CDG:{n:1,name:'Charles de Gaulle International Airport',city:'Paris',cc:'FR',lat:49.013,lon:2.55},IST:{n:1,name:'Istanbul Airport',city:'Istanbul',cc:'TR',lat:41.261,lon:28.742}};
  d.settings.home='US';
  const V=(cc,a,b,n)=>{(d.countries[cc].visits||(d.countries[cc].visits=[])).push({id:uid(),start:a,end:b,note:n||''})};
  V('FR','2019-06-02','2019-06-09','Paris and Lyon');V('IT','2019-06-09','2019-06-15');V('MX','2021-03-12','2021-03-19','Oaxaca');V('JO','2021-08-20','2022-06-01','Lived in Amman');V('LB','2022-02-11','2022-02-14');V('EG','2022-04-03','2022-04-08');V('TR','2023-05-01','2023-05-06','Istanbul');V('GR','2023-05-06','2023-05-12');V('ES','2024-07-01','2024-07-08');V('PT','2024-07-08','2024-07-12');V('MA','2025-03-20','2025-03-27');V('BR','2025-11-02','2025-11-10');
  d.flights=[['CLT','CDG','2019-06-01',6380],['FCO','CLT','2019-06-15',7350],['CLT','AMM','2021-08-19',10120],['AMM','CAI','2022-04-03',490],['ATL','IST','2023-04-30',9200],['CLT','LIS','2024-07-01',5880]].map(([a,b,dt,km],i)=>({id:'df'+i,date:dt,from:a,to:b,fl:[0,0],tl:[0,0],fcc:'',tcc:'',airline:'',num:'',km}));
  const LL={CLT:[35.214,-80.943],CDG:[49.013,2.55],FCO:[41.8,12.239],AMM:[31.723,35.993],CAI:[30.122,31.406],ATL:[33.637,-84.428],IST:[41.261,28.742],LIS:[38.781,-9.136]};d.flights.forEach(f=>{f.fl=LL[f.from];f.tl=LL[f.to]});
  d.lists={wonders:{W2:'2021-09-01',W6:'2019-06-12',W8:'2022-04-05'},unesco:{},capitals:{}};
  d.friends=[{id:'f1',name:'Sam',been:['US','MX','JP','KR','TH','VN','FR','IT','PE'],want:['IS','NZ'],lived:['KR'],added:Date.now()}];
  return d;
}
// Each step: [tab, open, selector, title, text, opts]. open: '' | 'country:US' | 'settings' | 'airports' | 'plan:p1'. No selector = centered card.
const TOUR=[
  ['map','',null,'Welcome to Roamd','A quick look at what it can do. It takes about three minutes, and you can skip it any time. The places on the map are samples for the tour; they disappear when it ends.'],
  ['map','','#mapBox','Your map','It fills in as you mark places: a color for Been, Want to go and Lived, and your home country in its own color. Tap any country to open it. Pinch or use + and − to zoom.'],
  ['map','','#legend','Colors and counts','The numbers count countries. A country with marked states or cities turns a lighter shade, and the marked parts show in full color.'],
  ['map','','#regionSel','Jump to a region','Zoom straight to Europe, Southeast Asia, the Middle East and the rest.'],
  ['map','','#zfull','Full screen','Make the map fill the screen. Back, or the same button, returns. Country maps and Compare maps have one too.'],
  ['map','','#zplane','Airports and flights','Log airports and whole flights. Planes mark airports and arcs show your routes. Import your history from Flighty, OpenFlights or myFlightradar24.'],
  ['list','','#clist .crow .qb','Quick marking','Tap Been, Want, Lived or Drove right on a country’s row. Drove through is for places you only passed through; it has its own color and doesn’t count toward your total unless you turn that on.'],
  ['list','','#clist .stctl','States, region by region','Turn states and provinces on or off for a whole region here, or choose which countries keep them.'],
  ['list','','#photoImp','From your photos','Pick trip photos and Roamd reads where and when each was taken, on this phone. It suggests countries, states, cities and visit dates for you to confirm.'],
  ['list','country:US','.stoggles','A country’s page','Mark the whole country, add notes and photos.'],
  ['list','country:US','.visitsbox','Visits with dates','Add each trip with its dates. Visits build your timeline, days away and countries-per-year stats.'],
  ['list','country:US','#cmini','States and provinces','Tap a state to mark it. 213 countries have them, including all 38 of Indonesia’s provinces. The corner button opens it full screen.'],
  ['list','country:US','#cityQ','Cities','Find a city and mark it; it gets a dot on the map.'],
  ['plans','','#plist .pcountry','Plans','All your plans, by region, then country, then sections you name, like a city or one trip.'],
  ['plans','plan:p1','.vids','Reels and TikToks','Paste a reel, TikTok or YouTube link and watch it right in the plan. Add dates, photos and a checklist, and drop in your packing list with one tap.'],
  ['compare','','#cmpBox .card','Compare with friends','Share your map as a link. A friend who opens it sees where you’ve both been, where only one of you has, and places you both want to go.'],
  ['stats','','#statsBox .hero','Stats','How much of the world you’ve seen, continents, days away, flights and more.'],
  ['stats','','#stBtns','Share and look back','Make a picture of your map and numbers for Instagram, or open your timeline and replay your map year by year.'],
  ['stats','','#statBadges','Badges','Milestones like 25 countries, every continent, all 50 states or flying around the world. Ones still to earn show your progress.'],
  ['stats','','#statLists','Lists to tick off','All 1,273 UNESCO World Heritage sites, world capitals, the New 7 Wonders and the 63 US national parks. Each can show on your map.'],
  ['map','settings','.pal-grid','Make it yours','Pick map colors, including two color-blind friendly sets, or choose your own three on a color wheel.'],
  ['map','settings','#cntBox','How you count','Count England, Scotland, Wales and Northern Ireland separately, count territories, and set your home country and its color.'],
  ['map','settings','#stTree','States everywhere, or not','One switch for all states and provinces, one per region with Choose countries beside it, and one on each country’s page. Disputed territories have their own switch.'],
  ['map','settings','[data-act=backup]','Keep a backup','Everything stays on this phone, with no account. Save a backup file now and then, photos included, and restore it on a new phone.'],
  ['map','','#themeBtn','Light or dark','Tap to switch. Settings can also follow your phone.'],
  ['map','',null,'Limitation: one phone at a time','Nothing syncs between devices yet. Use a backup file to move everything to another phone.',{lim:true}],
  ['map','',null,'Limitation: photos and videos on iPhone','Safari on iPhone can remove locations from photos picked straight from Photos; pick them from the Files app instead. iPhone also can’t share straight into Roamd, so copy a video’s link and tap Paste.',{lim:true}],
  ['map','',null,'Limitation: Compare','A friend’s map is a snapshot of countries only, not states, cities, flights or lists. They send a new link when theirs changes.',{lim:true}],
  ['map','','#helpBtn','Help is always here','Take this tour again, and see every limitation, from Help.'],
  ['map','',null,'You’re set','Start marking where you’ve been.'],
];
const rm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function closeAllSheets(){while(stack.length)await back()}
let tourState=null;
function startTour(){
  if(tourState)return;
  REALS=S;DEMO=demoState();S=DEMO;applyPalette();render();
  const ov=document.createElement('div');ov.className='tour';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
  ov.innerHTML=`<div class="tour-hole"><svg class="tour-dim" aria-hidden="true"><defs><mask id="tour-mask" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="100%" height="100%" fill="#fff"/><rect class="tour-cut" x="0" y="0" width="0" height="0" rx="14" fill="#000"/></mask></defs><rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,.62)" mask="url(#tour-mask)"/></svg><div class="tour-ring"></div></div><div class="tour-card"><div class="tour-txt"></div><div class="tbtns"></div></div>`;
  document.body.append(ov);document.body.classList.add('tour-on');
  const T={els:null,mid:true,side:'mid',show:false},cur={x:innerWidth/2,y:innerHeight/2,w:0,h:0,ring:0,cy:null,op:0},vel={x:0,y:0,w:0,h:0,cy:0};
  let raf=0,prev=performance.now(),step=0,openKey='';
  const W=11,spring=(p,g,dt)=>{const a=W*W*(g-cur[p])-2*W*vel[p];vel[p]+=a*dt;cur[p]+=vel[p]*dt};
  const cut=$('.tour-cut',ov),ring=$('.tour-ring',ov),card=$('.tour-card',ov);
  const loop=now=>{const dt=Math.min(64,now-prev);prev=now;const r=rm(),k=1-Math.exp(-dt/(r?60:85)),sdt=Math.min(.032,dt/1000),snap=r&&(cur.op<.04||cur.cy===null);
    const vw=innerWidth,vh=innerHeight,pad=8;let q=null;
    if(T.els)for(const e of T.els){if(!e.isConnected)continue;const b=e.getBoundingClientRect();if(!b.width)continue;q=q?{l:Math.min(q.l,b.left),t:Math.min(q.t,b.top),r:Math.max(q.r,b.right),b:Math.max(q.b,b.bottom)}:{l:b.left,t:b.top,r:b.right,b:b.bottom}}
    const g=!T.mid&&q?{x:Math.max(4,q.l-pad),y:Math.max(4,q.t-pad),w:Math.min(vw-8,q.r-q.l+2*pad),h:Math.min(vh-8,q.b-q.t+2*pad),ring:1}:{x:vw/2,y:vh/2,w:0,h:0,ring:0};
    for(const p of['x','y','w','h']){if(snap||r){cur[p]=g[p];vel[p]=0}else spring(p,g[p],sdt)}cur.ring+=(g.ring-cur.ring)*k;
    cut.setAttribute('x',cur.x.toFixed(1));cut.setAttribute('y',cur.y.toFixed(1));cut.setAttribute('width',Math.max(0,cur.w).toFixed(1));cut.setAttribute('height',Math.max(0,cur.h).toFixed(1));
    ring.style.transform=`translate(${cur.x.toFixed(1)}px,${cur.y.toFixed(1)}px)`;ring.style.width=Math.max(0,cur.w)+'px';ring.style.height=Math.max(0,cur.h)+'px';ring.style.opacity=cur.ring.toFixed(3);
    const ch=card.offsetHeight,side=T.mid?'mid':T.side,safeT=12+(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat'))||0);
    const ty=side==='top'?safeT:side==='bottom'?vh-ch-16:(vh-ch)/2;
    if(cur.cy===null||snap||r){cur.cy=ty;vel.cy=0}else spring('cy',ty,sdt);cur.op+=((T.show?1:0)-cur.op)*k;
    card.style.transform=`translateY(${cur.cy.toFixed(1)}px)`;card.style.opacity=cur.op.toFixed(3);
    raf=requestAnimationFrame(loop)};
  raf=requestAnimationFrame(loop);
  const end=async()=>{cancelAnimationFrame(raf);removeEventListener('keydown',key);ov.remove();document.body.classList.remove('tour-on','tour-fading');tourState=null;
    await closeAllSheets();S=REALS;REALS=null;DEMO=null;S.settings.tourDone=true;save();applyPalette();applyTheme();setTab('map');if(mapReady)fitStart()};
  const key=e=>{if(e.key==='Escape')end();else if(e.key==='ArrowRight')go(step+1);else if(e.key==='ArrowLeft'&&step>0)go(step-1)};
  addEventListener('keydown',key);
  const go=async n=>{if(n>=TOUR.length)return end();step=n;const[tb,open,sel,title,text,opt]=TOUR[n];const last=n===TOUR.length-1;
    if(rm()&&T.show){T.show=false;await wait(200)}
    const needTab=tab!==tb,needOpen=(open||'').trim()!==openKey;
    if(needTab||needOpen){document.body.classList.add('tour-fading');T.show=false;await wait(200);
      if(needOpen){await closeAllSheets();openKey=(open||'').trim()}
      if(needTab)setTab(tb);
      if(needOpen&&openKey){const[kind,arg]=openKey.split(':');if(kind==='country')await openCountry(arg);else if(kind==='plan')openPlan(arg);else if(kind==='settings')openSettings();else if(kind==='airports')openAirports();await wait(320)}}
    if(step!==n)return;
    $('.tour-txt',card).innerHTML=`<div class="trow"><span class="eyebrow">${n+1} of ${TOUR.length}${opt&&opt.lim?' <span class="limtag">Limitation</span>':''}</span>${last?'':'<button class="tskip" data-t="skip">Skip tour</button>'}</div><h3>${title.replace(/^Limitation: /,'')}</h3><p>${text}</p>`;
    $('.tbtns',card).innerHTML=`${n>0?'<button class="btn ghost" data-t="back">Back</button>':''}<button class="btn" data-t="next">${last?'Done':n===0?'Show me':'Next'}</button>`;
    let els=[];
    if(sel)for(let i=0;i<40&&step===n;i++){els=[...document.querySelectorAll(sel)].filter(e=>e.getBoundingClientRect().width>0).slice(0,1);if(els.length)break;await wait(50)}
    if(step!==n)return;
    if(els.length){els[0].scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>requestAnimationFrame(r));const b=els[0].getBoundingClientRect();T.side=(b.top+b.bottom)/2>innerHeight/2?'top':'bottom';T.mid=false;T.els=els}
    else{T.mid=true;T.els=null}
    T.show=true;document.body.classList.remove('tour-fading');$('[data-t=next]',card).focus({preventScroll:true})};
  ov.addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(!b)return;const t=b.dataset.t;if(t==='skip')end();else go(t==='next'?step+1:step-1)});
  tourState={go,end};
  closeAllSheets().then(()=>go(0));
}
let REALS=null;

/* ---------- wiring ---------- */
function wire(){
  $$('.tabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
  $('#setBtn').onclick=openSettings;$('#themeBtn').onclick=()=>{S.settings.theme=isDark()?'light':'dark';save();applyTheme()};$('#helpBtn').onclick=openHelp;
  $('#zin').onclick=()=>mapReady&&mapSvg.transition().call(zoom.scaleBy,1.6);
  $('#zout').onclick=()=>mapReady&&mapSvg.transition().call(zoom.scaleBy,1/1.6);
  $('#zplane').onclick=openAirports;$('#zfull').onclick=toggleMapFS;$('#photoImp').onclick=openPhotoImport;
  $('#statsBox').onclick=e=>{const b=e.target.closest('[data-st]');if(b){const a=b.dataset.st;if(a==='share')openSharePicture();else if(a==='timeline')openTimeline();else if(a==='flights')openFlights();else if(a==='import')openImportFlights();else if(a==='home')pickCountry('Your home country',cc=>{S.settings.home=cc;save()});return}const l=e.target.closest('[data-list]');if(l)openList(l.dataset.list)};
  $('#zreset').onclick=()=>{$('#regionSel').value='';zoomRegion('')};
  $('#regionSel').innerHTML='<option value="">Whole world</option>'+REGIONS.map(([rc,rn])=>`<option value="${rc}">${rn}</option>`).join('');
  $('#regionSel').onchange=e=>zoomRegion(e.target.value);
  $('#q').oninput=e=>{q=e.target.value;renderList()};
  $('#fchips').onclick=e=>{const b=e.target.closest('[data-f]');if(b){filt=b.dataset.f;renderList()}};
  $('#pchips').onclick=e=>{const b=e.target.closest('[data-f]');if(b){pfilt=b.dataset.f;renderPlans()}};
  $('#newPlanBtn').onclick=()=>pickCountry('New plan in…',cc=>{const p=newPlan(cc);openPlan(p.id,true)});
  $('#clist').onclick=e=>{if(stClick(e,()=>renderList()))return;const qb=e.target.closest('.q');if(qb){const cc=qb.closest('.crow').dataset.cc;setK(cc,qb.dataset.k,!cs(cc)[qb.dataset.k]);const row=qb.closest('.crow');row.outerHTML=rowHTML(BY[cc]);return}};
  $('#plist').addEventListener('toggle',e=>{const d=e.target.closest('details.reg');if(d)(d.open?closedRegions.delete(d.dataset.r):closedRegions.add(d.dataset.r))},true);
  $('#nag').onclick=e=>{const b=e.target.closest('[data-nag]');if(!b)return;if(b.dataset.nag==='save')saveBackup();else{S.settings.nag=Date.now();save();render()}};
  $('#cmpBox').oninput=e=>{if(e.target.id==='meName'){S.me=e.target.value.trim();save()}};
  $('#cmpBox').onclick=async e=>{const fr=e.target.closest('[data-friend]');if(fr){openFriend(fr.dataset.friend);return}const b=e.target.closest('[data-cmp]');if(!b)return;const a=b.dataset.cmp;
    if((a==='share'||a==='copy')&&!S.me){const n=(prompt('What name should friends see on your map?')||'').trim();if(!n)return;S.me=n;save();renderCompare()}
    if(a==='share')shareMine();else if(a==='copy')copyText(myLink());
    else if(a==='add'){if(takeFriendLink($('#frIn').value))$('#frIn').value=''}
    else if(a==='paste'){try{takeFriendLink(await navigator.clipboard.readText())}catch(err){toast('Paste it into the box instead');$('#frIn').focus()}}};
  document.addEventListener('click',e=>{const oc=e.target.closest('[data-open-cc]');if(oc&&!e.defaultPrevented&&!oc.closest('.sheet')){openCountry(oc.dataset.openCc);return}const pl=e.target.closest('[data-plan]');if(pl&&!pl.closest('.sheet'))openPlan(pl.dataset.plan)});
}
function incoming(){
  const h=location.hash;
  if(h.startsWith('#m=')){history.replaceState(null,'',location.pathname);const f=parseCode(h);if(f){setTimeout(()=>{const n=addFriend(f);setTab('compare');openFriend(n.id);toast(`Added ${f.name}’s map`)},250);return true}}
  const sp=new URLSearchParams(location.search);
  if(sp.has('share')){history.replaceState(null,'',location.pathname);const all=[sp.get('url'),sp.get('text'),sp.get('title')].join(' ');const u=firstURL(all);
    if(u&&parseCode(u)){takeFriendLink(u);return true}
    if(u){setTimeout(()=>openShareIn(u),250);return true}}
  return false;
}
(async function main(){
  await load();applyPalette();applyTheme();matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);
  wire();await regIndex();setTab('map');initMap();
  const busy=incoming();
  if(!S.settings.tourDone&&!busy)setTimeout(startTour,700);
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
  if(Object.keys(S.countries).length)persist();
})();
