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
const KL={been:'Been',want:'Want to go',lived:'Lived'};

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
function setK(cc,k,v){const o=co(cc);o[k]=v;if(k==='lived'&&v)o.been=true;if(k==='been'&&!v)o.lived=false;save()}
const tier=s=>s.lived?'lived':s.been?'been':s.want?'want':'';

/* ---------- sheets (stacked full-screen panels, back button aware) ---------- */
const stack=[];let backWaiters=[];
function sheet(o){
  const el=document.createElement('div');el.className='sheet';$('#sheets').append(el);
  o.el=el;o.refresh=()=>{const b=$('.sbody',el),st=b?b.scrollTop:0;o.render(el);fillPhotos(el);const nb=$('.sbody',el);if(nb)nb.scrollTop=st};
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
  gReg=mapG.append('g').attr('class','regs');gDisp=mapG.append('g').attr('class','disp');
  mapDots=mapG.selectAll('g.dotg').data(DOTS).join('g').attr('class','dotg').attr('transform',d=>`translate(${d.x},${d.y})`);
  mapDots.append('circle').attr('class','hit');mapDots.append('circle').attr('class','dm');
  gCity=mapG.append('g').attr('class','cities');gPlane=mapG.append('g').attr('class','planes');
  mapPaths.on('click',(e,d)=>{if(d.cc)openCountry(d.cc)});
  mapDots.on('click',(e,d)=>openCountry(d.cc));
  zoom=d3.zoom().scaleExtent([1,24]).translateExtent([[-200,-120],[MW+200,MH+120]]).on('zoom',e=>{mapG.attr('transform',e.transform);curK=e.transform.k;sizeDots()});
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
  mapDots.select('.dm').attr('r',d=>(tier(cs(d.cc))?4.2:2.6)/u);mapDots.select('.hit').attr('r',11/u);sizePoints()}
const fillCls=cc=>{const t=tier(cs(cc));return t?(partial(cc)?' t-':' s-')+t:''};
function paintMap(){if(!mapReady)return;mapPaths.attr('class',d=>d.cc?'c'+fillCls(d.cc):'c none');
  mapDots.attr('class',d=>'dotg'+fillCls(d.cc));paintPoints();sizeDots();paintRegions();paintDisputed()}
function counts(){let been=0,want=0,lived=0,terr=0;for(const c of C){if(c.disp)continue;const s=cs(c.cc);if(s.been){c.core?been++:terr++}if(s.want&&!s.been)want++;if(s.lived)lived++}return{been,want,lived,terr}}
function renderMapView(){
  paintMap();const n=counts();
  $('#legend').innerHTML=`<span class="lg"><i class="dot been"></i>Been <b>${n.been}</b></span><span class="lg"><i class="dot want"></i>Want to go <b>${n.want}</b></span><span class="lg"><i class="dot lived"></i>Lived <b>${n.lived}</b></span>${Object.keys(S.airports||{}).length?`<span class="lg">${ic('plane','lgp')}Airports <b>${Object.keys(S.airports).length}</b></span>`:''}`;
  const has=Object.keys(S.countries).length||S.plans.length;
  const old=Date.now()-(S.settings.lastBackup||0)>14*864e5&&Date.now()-(S.settings.nag||0)>7*864e5;
  $('#nag').innerHTML=has&&old?`<div class="nag"><span>${S.settings.lastBackup?'It’s been 2+ weeks since your last backup.':'You haven’t saved a backup yet.'}</span><button class="btn sm" data-nag="save">Save backup</button><button class="btn sm ghost" data-nag="later">Later</button></div>`:'';
}

/* ---------- v2: colors (Ironwood-style), states/provinces, cities, airports ---------- */
const PALETTES={
  classic:['Classic','',{been:'#3fbf93',want:'#f0b24f',lived:'#8682f2'},{been:'#2f9e7a',want:'#e2a03a',lived:'#5b57d1'}],
  sunset:['Sunset','',{been:'#ff7a3d',want:'#ffd84d',lived:'#ff4d6d'},{been:'#d65314',want:'#c99a00',lived:'#c9184a'}],
  ocean:['Ocean','',{been:'#2ec4d6',want:'#9be564',lived:'#6f8cff'},{been:'#00838f',want:'#4f9d2a',lived:'#3352d6'}],
  forest:['Forest','',{been:'#7bc96f',want:'#e8c547',lived:'#c47ad6'},{been:'#3c8a3a',want:'#b58900',lived:'#8e44ad'}],
  rg:['Red-green friendly','For protanopia and deuteranopia',{been:'#56b4e9',want:'#f0c000',lived:'#e07bb4'},{been:'#0072b2',want:'#c99a00',lived:'#b0457f'}],
  by:['Blue-yellow friendly','For tritanopia',{been:'#26c6da',want:'#ff8fb1',lived:'#b39ddb'},{been:'#00838f',want:'#d81b60',lived:'#5e35b1'}],
};
const lum=h=>{const n=parseInt(h.slice(1),16);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(n>>16)+.7152*f((n>>8)&255)+.0722*f(n&255)};
const inkFor=h=>lum(h)>.2?'#14171b':'#ffffff';
const hsv2hex=(h,s,v)=>{h=((h%360)+360)%360;const f=n=>{const k=(n+h/60)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1))};return'#'+[f(5),f(3),f(1)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')};
const hex2hsv=hex=>{const n=parseInt(hex.slice(1),16);const r=(n>>16)/255,g=((n>>8)&255)/255,b=(n&255)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d)h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return{h:(h*60+360)%360,s:mx?d/mx:0,v:mx}};
const KEYS=['been','want','lived'];
function customPal(c){
  c=c||S.settings.palCustom||customFrom('classic');const v=c.v;
  const dark=c.cols.map(x=>hsv2hex(x.h,x.s,v)),light=c.cols.map(x=>hsv2hex(x.h,Math.min(1,x.s*1.08+.05),Math.max(.35,v*.72)));
  const mk=cs=>({been:cs[0],want:cs[1],lived:cs[2]});
  return['Custom','Your three colors',mk(dark),mk(light)];
}
function customFrom(k){const P=PALETTES[k]||PALETTES.classic;const d=P[2];const cols=KEYS.map(x=>{const q=hex2hsv(d[x]);return{h:q.h,s:q.s}});return{v:Math.max(.55,Math.max(...KEYS.map(x=>hex2hsv(d[x]).v))),mode:'square',cols}}
const palFor=k=>k==='custom'?customPal():PALETTES[k]||PALETTES.classic;
function palVars(c){return KEYS.map(k=>`--${k}:${c[k]};--${k}-ink:${inkFor(c[k])};`).join('')}
function applyPalette(){
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
const SLOTS=[['Been','Countries, states and cities you’ve been to'],['Want to go','Places on your list'],['Lived','Places you’ve lived']];
function openColors(){
  const c=JSON.parse(JSON.stringify(S.settings.palCustom||customFrom(S.settings.palette||'classic')));
  let sel=0,target=1;const R=130;
  const o=sheet({
    render(el){
      const cur=c.cols[sel],offs=(HARMONY.find(x=>x[0]===c.mode)||HARMONY[3])[2];
      const sugg=offs.map(d=>({h:(cur.h+d+360)%360,s:cur.s}));
      const others=[0,1,2].filter(i=>i!==sel);if(!others.includes(target))target=others[0];
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
      if(a==='slot'){sel=+t.dataset.i;target=[0,1,2].find(k=>k!==sel);this.refresh()}
      else if(a==='mode'){c.mode=t.dataset.v;this.refresh()}
      else if(a==='sugg'){c.cols[target]=this.sugg[+t.dataset.i];target=this.others.find(i=>i!==target);this.refresh()}
      else if(a==='fill'){this.others.forEach((i,k)=>{c.cols[i]=this.sugg[k]||this.sugg[0]});this.refresh()}
      else if(a==='save'){S.settings.palCustom=c;S.settings.palette='custom';save();applyPalette();await back();toast('Custom colors on')}},
  });
}

/* states / provinces */
let REGIDX=null;const REGGEO={};
const RWORD={US:'States',MX:'States',BR:'States',AU:'States & territories',IN:'States',DE:'States',AT:'States',NG:'States',MY:'States',VE:'States',CA:'Provinces & territories',CN:'Provinces',AR:'Provinces',ZA:'Provinces',TR:'Provinces',IR:'Provinces',PK:'Provinces',TH:'Provinces',VN:'Provinces',KR:'Provinces',AF:'Provinces',NL:'Provinces',BE:'Provinces',JP:'Prefectures',ID:'Provinces',GB:'Nations & regions',ES:'Communities',IE:'Counties',SE:'Counties',NO:'Counties',CH:'Cantons'};
const rword=cc=>RWORD[cc]||'Regions';
async function regIndex(){if(REGIDX)return REGIDX;try{REGIDX=await(await fetch('regions/index.json')).json()}catch(e){REGIDX=null;return{}}return REGIDX}
async function regGeo(cc){if(REGGEO[cc])return REGGEO[cc];await loadScript(CDN.topo);const t=await(await fetch(`regions/${cc}.json`)).json();return REGGEO[cc]=topojson.feature(t,t.objects.r).features}
const rs=(cc,id)=>((cs(cc).regions)||{})[id]||{};
function setFlags(x,k,v){x[k]=v;if(k==='lived'&&v)x.been=true;if(k==='been'&&!v)x.lived=false}
function setR(cc,id,k,v){const o=co(cc),r=o.regions||(o.regions={}),x=r[id]||(r[id]={});setFlags(x,k,v);if(!x.been&&!x.want&&!x.lived)delete r[id];if(v)setK(cc,k,true);else save()}
/* cities */
let CITIES=null;
async function loadCities(){if(CITIES)return CITIES;try{CITIES=await(await fetch('cities.json')).json()}catch(e){return{}}return CITIES}
const ct=(cc,n)=>((cs(cc).cities)||{})[n]||{};
function setCity(cc,row,k,v){const o=co(cc),m=o.cities||(o.cities={}),x=m[row[0]]||(m[row[0]]={lat:row[1],lon:row[2],adm:row[3]||''});setFlags(x,k,v);if(!x.been&&!x.want&&!x.lived)delete m[row[0]];if(v)setK(cc,k,true);else save()}
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
        body.innerHTML=res+`<h3 class="rhead"><span>Your airports</span><small>${mine.length} airports · ${tot} visits</small></h3>${mine.length?`<div class="card">${mine.map(([c,x])=>apRow([c,x.name,x.city,x.cc,x.lat,x.lon])).join('')}</div>`:'<p class="empty">Search above and tap Log for each airport you’ve flown in, out of, or through. A small plane marks each one on the map.</p>'}
        <label class="togrow"><input type="checkbox" id="apShow"${S.settings.planes===false?'':' checked'}> Show planes on the map</label>`;
        $('#apShow',el).onchange=e=>{S.settings.planes=e.target.checked;save()};
      };list();this.list=list;
    },
    click(e){const b=e.target.closest('[data-ap]');if(!b)return;const code=b.dataset.ap;const x=(S.airports||{})[code];
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
    <div class="cmini" id="cmini"><div class="loading">Loading map…</div></div>
    <div class="rsel">${sr?`<b>${esc(sr[1])}</b><span class="qb">${KEYS.map(k=>`<button class="q q-${k}${rs(cc,sr[0])[k]?' on':''}" data-rq="${sr[0]}" data-k="${k}">${k==='want'?'Want':KL[k]}</button>`).join('')}</span>`:`<span class="muted small">Tap a ${rword(cc).split(' ')[0].toLowerCase().replace(/s$/,'').replace(/ie$/,'y')} on the map to mark it, or use the list.</span>`}</div>
    <details class="rlist"><summary>All ${n} ${rword(cc).toLowerCase()}</summary><div class="card">${idx.map(([id,name])=>{const x=rs(cc,id);return`<div class="crow"><span class="cmain"><span class="cname">${esc(name)}</span></span><span class="qb">${KEYS.map(k=>`<button class="q q-${k}${x[k]?' on':''}" data-rq="${id}" data-k="${k}">${k==='want'?'Want':KL[k]}</button>`).join('')}</span></div>`}).join('')}</div></details>`}
  const mine=Object.entries(cs(cc).cities||{});
  h+=`<h4 class="sub">Cities</h4>${mine.length?`<div class="card">${mine.map(([n,x])=>cityRow(cc,[n,x.lat,x.lon,x.adm])).join('')}</div>`:''}
  <div class="pickq0"><input id="cityQ" placeholder="Find a city in ${esc(BY[cc].name)}" autocomplete="off"></div><div id="cres"></div>`;
  return h;
}
function cityRow(cc,r){const x=ct(cc,r[0]);return`<div class="crow"><span class="cmain"><span class="cname">${esc(r[0])}${r[3]?`<small>${esc(r[3])}</small>`:''}</span></span><span class="qb">${KEYS.map(k=>`<button class="q q-${k}${x[k]?' on':''}" data-cq="${esc(r[0])}" data-k="${k}">${k==='want'?'Want':KL[k]}</button>`).join('')}</span></div>`}
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
  const planes=S.settings.planes===false?'':Object.entries(S.airports||{}).filter(([,x])=>x.cc===cc).map(([c,x])=>{const q=proj([x.lon,x.lat]);return q?`<g class="plane" transform="translate(${q[0]},${q[1]}) scale(${1.1*u})">${PLANE}<title>${esc(c)}</title></g>`:''}).join('');
  box.innerHTML=`<svg class="mini" viewBox="${b[0][0]-6} ${b[0][1]-6} ${b[1][0]-b[0][0]+12} ${b[1][1]-b[0][1]+12}">${f.map(x=>{const t=tier(rs(cc,x.properties.id));return`<path class="rg${t?' s-'+t:''}${x.properties.id===sel?' sel':''}" data-rid="${x.properties.id}" d="${p(x)}"><title>${esc(x.properties.name)}</title></path>`}).join('')}${cities}${planes}</svg>`;
}

/* main map overlays */
let gReg,gCity,gPlane,regBusy=0;
async function paintRegions(){
  if(!mapReady)return;const my=++regBusy;const idx=await regIndex();const data=[];
  for(const cc of Object.keys(S.countries)){const r=cs(cc).regions;if(!r||!Object.keys(r).length||!idx[cc]||!statesOn(cc))continue;let f;try{f=await regGeo(cc)}catch(e){continue}f.forEach(x=>data.push({cc,id:x.properties.id,f:x}))}
  if(my!==regBusy)return;
  gReg.selectAll('path').data(data,d=>d.cc+'|'+d.id).join(en=>en.append('path').attr('d',d=>geoPath(d.f)).on('click',(e,d)=>openCountry(d.cc,d.id))).attr('class',d=>{const t=tier(rs(d.cc,d.id));return'rg'+(t?' s-'+t:'')});
}
function paintPoints(){
  if(!mapReady)return;const P=geoPath.projection();
  const cities=[];for(const cc of Object.keys(S.countries))for(const[n,x]of Object.entries(cs(cc).cities||{})){const q=P([x.lon,x.lat]);if(q)cities.push({cc,n,t:tier(x),x:q[0],y:q[1]})}
  gCity.selectAll('circle').data(cities,d=>d.cc+'|'+d.n).join(en=>en.append('circle').on('click',(e,d)=>openCountry(d.cc))).attr('cx',d=>d.x).attr('cy',d=>d.y).attr('class',d=>'city s-'+d.t);
  const planes=S.settings.planes===false?[]:Object.entries(S.airports||{}).map(([c,x])=>{const q=P([x.lon,x.lat]);return q&&{c,x:q[0],y:q[1]}}).filter(Boolean);
  gPlane.selectAll('g').data(planes,d=>d.c).join(en=>{const g=en.append('g').attr('class','plane');g.html(PLANE+'<title></title>');g.select('title').text(d=>d.c);g.on('click',()=>openAirports());return g});
  sizePoints();
}
function sizePoints(){if(!gCity)return;const u=pxPerUnit();gCity.selectAll('circle').attr('r',4/u);gPlane.selectAll('g').attr('transform',d=>`translate(${d.x},${d.y}) scale(${1.15/u})`)}

/* ---------- countries list ---------- */
let filt='all',q='';
function rowHTML(c){const s=cs(c.cc);return`<div class="crow" data-cc="${c.cc}"><button class="cmain" data-open-cc="${c.cc}"><span class="flag">${flag(c.cc)}</span><span class="cname">${esc(c.name)}${c.disp?'<small>disputed</small>':c.core?'':'<small>territory</small>'}</span></button><span class="qb">${['been','want','lived'].map(k=>`<button class="q q-${k}${s[k]?' on':''}" data-k="${k}" aria-pressed="${!!s[k]}">${k==='want'?'Want':KL[k]}</button>`).join('')}</span></div>`}
function renderList(){
  const qq=q.trim().toLowerCase();let html='';
  for(const[rc,rn]of REGIONS){
    const rows=C.filter(c=>{if(c.reg!==rc||!showC(c))return false;if(qq&&!c.name.toLowerCase().includes(qq))return false;const s=cs(c.cc);return filt==='all'||(filt==='none'?!(s.been||s.want||s.lived):!!s[filt])});
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
        <div class="stoggles">${['been','want','lived'].map(k=>`<button class="st st-${k}${s[k]?' on':''}" data-act="tog" data-k="${k}"><i class="dot ${k}"></i>${KL[k]}</button>`).join('')}</div>
        ${s.been?`<label class="fld"><span>When did you go?</span><input data-f="years" value="${esc(s.years||'')}" placeholder="e.g. 2019, summer 2023"></label>`:''}
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
      else if(a==='newsec'){if(newSection(cc))this.refresh()}
      else if(a==='newplan'){const p=newPlan(cc,t.dataset.sec);openPlan(p.id,true)}
      else if(a==='rensec'){const x=S.sections.find(s=>s.id===t.dataset.id);const n=(prompt('Rename section',x.name)||'').trim();if(n){x.name=n;save();this.refresh()}}
      else if(a==='delsec'){const x=S.sections.find(s=>s.id===t.dataset.id);if(confirm(`Delete the section “${x.name}”? Its plans stay in ${c.name}, just not in a section.`)){S.sections=S.sections.filter(s=>s!==x);S.plans.forEach(p=>{if(p.sec===x.id)p.sec=''});save();this.refresh()}}
    },
    input(e){const f=e.target.dataset.f;if(f){co(cc)[f]=e.target.value;save()}},
    change(e){photoChange(e,()=>co(cc).photos||(co(cc).photos=[]),this)},
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
        <div class="cmpmap" id="cmpMap"><div class="loading">Loading map…</div></div>
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
    click(e,t){const oc=e.target.closest('[data-open-cc]');if(oc){openCountry(oc.dataset.openCc);return}if(t&&t.dataset.act==='delfr'){const f=S.friends.find(x=>x.id===id);if(confirm(`Remove ${f.name}’s map?`)){S.friends=S.friends.filter(x=>x!==f);save();history.back()}}},
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
function renderStats(){
  const n=counts(),pct=Math.round(n.been/CORE*1000)/10;
  const regs=REGIONS.filter(([rc])=>rc!=='AN').map(([rc,rn])=>{const all=C.filter(c=>c.reg===rc&&c.core);const b=all.filter(c=>cs(c.cc).been).length;return{rc,rn,b,t:all.length}});
  const touched=regs.filter(r=>r.b).length+(cs('AQ').been?1:0);
  const regs2=Object.values(S.countries).reduce((a,s)=>a+Object.values(s.regions||{}).filter(x=>x.been).length,0),cities2=Object.values(S.countries).reduce((a,s)=>a+Object.values(s.cities||{}).filter(x=>x.been).length,0),aps=Object.keys(S.airports||{}).length;
  const photos=Object.values(S.countries).reduce((a,s)=>a+(s.photos?.length||0),0)+S.plans.reduce((a,p)=>a+(p.photos?.length||0),0);
  $('#statsBox').innerHTML=`
  <div class="hero"><div class="big">${n.been}<small>/${CORE}</small></div><div><b>countries</b><span>${pct}% of the world${n.terr?` · plus ${plural(n.terr,'territory')}`:''}</span></div>
  <div class="bar"><i style="width:${Math.min(100,pct)}%"></i></div></div>
  <div class="tiles"><div class="tile"><b>${touched}</b><span>of ${REGIONS.length} regions</span></div><div class="tile"><b>${n.lived}</b><span>lived in</span></div><div class="tile"><b>${n.want}</b><span>want to go</span></div><div class="tile"><b>${S.plans.length}</b><span>plans</span></div><div class="tile"><b>${photos}</b><span>photos</span></div><div class="tile"><b>${S.friends.length}</b><span>friends’ maps</span></div><div class="tile"><b>${regs2}</b><span>states &amp; regions</span></div><div class="tile"><b>${cities2}</b><span>cities</span></div><div class="tile"><b>${aps}</b><span>airports</span></div></div>
  <h3 class="rhead"><span>By region</span></h3>
  <div class="card pad">${regs.map(r=>`<div class="rbar"><span class="rn">${r.rn}</span><span class="rv">${r.b}/${r.t}</span><div class="bar"><i style="width:${r.t?r.b/r.t*100:0}%"></i></div></div>`).join('')}</div>`;
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
  const rows=[['Country','Region','Been','Want to go','Lived','When','Where lived','Notes']];
  for(const c of C){const s=cs(c.cc);if(!(s.been||s.want||s.lived||s.notes))continue;rows.push([c.name,RNAME[c.reg],s.been?'yes':'',s.want?'yes':'',s.lived?'yes':'',s.years,s.livedNote,s.notes])}
  const blob=new Blob([rows.map(r=>r.map(q).join(',')).join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`roamd-countries-${today()}.csv`;a.click();
}
function openSettings(){
  sheet({
    render(el){
      const ios=/iP(hone|ad|od)/.test(navigator.userAgent),standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
      el.innerHTML=`${shead('<span class="tt"><b>Settings</b></span>')}<div class="sbody">
      <h4 class="sub">Theme</h4><div class="seg">${['auto','light','dark'].map(t=>`<button data-act="theme" data-v="${t}" class="${S.settings.theme===t?'on':''}">${t==='auto'?'Match phone':t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div>
      <h4 class="sub">Map colors</h4>${paletteHTML()}
      <h4 class="sub">States &amp; provinces</h4>${statesTreeHTML()}
      <h4 class="sub">Disputed territories</h4><div class="strow top"><span class="stname"><b>Show disputed territories</b><small>Somaliland, Northern Cyprus, Abkhazia, Crimea, Kashmir areas and ${DISP.length-5} more become their own places to mark. They’re never counted in your countries.</small></span>${switchHTML(!!S.settings.disputed,'data-act="disp"','Show disputed territories')}</div>
      <h4 class="sub">Backup</h4><p class="muted small">Roamd saves on this phone only. A backup file holds everything, photos included. Last backup: <b>${S.settings.lastBackup?new Date(S.settings.lastBackup).toLocaleDateString():'never'}</b>.</p>
      <div class="btnrow"><button class="btn" data-act="backup">Save backup</button><label class="btn ghost">Restore from backup<input type="file" accept="application/json,.json" hidden id="restoreIn"></label></div>
      <h4 class="sub">Export</h4><div class="btnrow"><button class="btn ghost" data-act="csv">Countries as a spreadsheet (CSV)</button></div>
      ${standalone?'':`<h4 class="sub">Put Roamd on your home screen</h4><p class="muted small">${ios?'In Safari, tap Share, then <b>Add to Home Screen</b>.':'In Chrome, tap ⋮, then <b>Install app</b> (or Add to Home screen).'} It then opens full screen and works offline.</p>`}
      <h4 class="sub">More</h4><div class="btnrow"><button class="btn ghost" data-act="tour">Replay the tour</button><button class="btn ghost" data-act="help">Help</button></div>
      <h4 class="sub danger">Start over</h4><button class="btn danger" data-act="wipe">Erase everything on this phone</button>
      <p class="tiny muted ver">Roamd v2 · map data: Natural Earth, geoBoundaries, OurAirports</p></div>`;
    },
    async click(e,t){if(stClick(e,()=>this.refresh()))return;if(!t)return;const a=t.dataset.act;
      if(a==='disp'){S.settings.disputed=!S.settings.disputed;save();this.refresh()}
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
  <h4 class="sub">Marking countries</h4><p>Tap a country on the map, or use the Countries tab and tap <b>Been</b>, <b>Want</b> or <b>Lived</b> on its row. Lived also counts as Been. Open a country to add when you went, where you lived, notes and photos.</p>
  <h4 class="sub">States, provinces and cities</h4><p>Open a country to see its states, provinces or regions (60 larger countries have them; Indonesia has all 38 provinces, the UK has England’s 9 regions plus Scotland, Wales and Northern Ireland). Tap one on the small map or use the list. Marked ones show in full color and the rest of the country turns a lighter shade. Find cities in the box under the map; marked cities show as dots. Marking a state or city also marks the country.</p>
  <h4 class="sub">Airports</h4><p>Tap the plane button on the map. Search by code (CLT), city or name and tap Log each time you fly in, out or through; − and + change the count. Each airport gets a small plane on the map. Logging an airport doesn’t mark the country, since a layover isn’t a visit.</p>
  <h4 class="sub">Colors</h4><p>Settings → Map colors: pick a preset (two are made for color blindness) or Custom, then choose Been, Want to go and Lived on the color wheel. Suggestions show colors that go together; light mode uses deeper versions.</p>
  <h4 class="sub">Plans</h4><p>Plans are sorted by region, then country, then sections you make yourself, such as a city (“Kyoto”), a route (“Ring Road”) or one trip (“Spring 2027”). Each plan has dates, a status (Idea, Booked, Done), reels and TikToks, photos, a checklist and notes. Make a section from the country page, or pick <b>+ New section…</b> in a plan.</p>
  <h4 class="sub">Saving reels and TikToks</h4><p>Copy the link in Instagram, TikTok or YouTube (Share → Copy link), open the plan and tap <b>Paste</b>. On Android with Roamd installed, you can also share straight to Roamd from the share sheet. Tap <b>Watch here</b> to play it inside the plan.</p>
  <h4 class="sub">Comparing maps</h4><p>In Compare, tap <b>Share my map</b> and send the link. When a friend opens it in Roamd, your map is added to theirs and they see both, only you, only them, and places you both want to go. Ask them to send theirs back.</p>
  <h4 class="sub">Regions</h4><p>NA North America (incl. Mexico) · CA Central America · CB Caribbean · SA South America · EU Europe (incl. Russia) · ME Middle East (incl. Egypt, Iran, Türkiye, the Caucasus) · AF Africa · CAS Central Asia · SAS South Asia · EAS East Asia · SEA Southeast Asia · AU Australia &amp; NZ · OC Oceania (Pacific islands) · AN Antarctica. The count of ${CORE} is UN members plus Vatican City and Palestine; territories (Puerto Rico, Greenland, Hong Kong…) are listed too but counted separately.</p>
  <h4 class="sub">Limitations</h4><ul class="lims">
  <li><b>No sync.</b> Everything stays on this phone. Save a backup now and then; it includes photos.</li>
  <li><b>Compare is a snapshot.</b> Friends’ maps don’t update by themselves; they send a new link. Their plans and photos are never shared, only which countries.</li>
  <li><b>Video previews depend on the site.</b> Private or removed posts won’t play. Short TikTok links (vm.tiktok.com) only open in TikTok. Instagram may ask you to log in.</li>
  <li><b>iPhone can’t share into web apps.</b> Copy the link, then Paste.</li>
  <li><b>Small countries show as dots</b> at world zoom (Singapore, Malta, most islands). Zoom in and the real shape takes over. Territories that the map data joins to another country (French Guiana, Réunion, Svalbard, Bonaire…) are split off so they fill only on their own.</li>
  <li><b>First map load needs internet</b> (about 1 MB); after that it works offline.</li>
  <li><b>States for 60 countries.</b> Smaller countries are whole-country only. Cities are those over about 150,000 people plus capitals; there’s no way to add your own place yet.</li>
  <li><b>Compare</b> shares countries only, not states, cities or airports.</li></ul>
  <p class="tiny muted">Map data: Natural Earth (public domain); Indonesia’s provinces from geoBoundaries (CC BY 4.0); airports from OurAirports (public domain).</p>
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
  d.countries.ID.regions={'ID-BA':{want:true}};d.countries.ID.want=true;
  d.sections=[{id:'s1',cc:'JP',name:'Kyoto'},{id:'s2',cc:'JP',name:'Tokyo'}];
  d.plans=[{id:'p1',cc:'JP',sec:'s1',title:'Temples in spring',start:'2027-04-02',end:'2027-04-06',status:'idea',notes:'Fushimi Inari at sunrise.',links:[{url:'https://www.tiktok.com/@example/video/7234567890123456789',note:'Hidden temple'},{url:'https://www.instagram.com/reel/C1a2B3c4D5e/',note:'Tea house'}],photos:[],todos:[{t:'Rail pass',done:true},{t:'Book ryokan',done:false}]},
    {id:'p2',cc:'JP',sec:'s2',title:'Food crawl',start:'',end:'',status:'idea',notes:'',links:[],photos:[],todos:[]},
    {id:'p3',cc:'PE',sec:'',title:'Inca Trail',start:'2027-06-10',end:'2027-06-14',status:'booked',notes:'',links:[],photos:[],todos:[{t:'Permit',done:true}]}];
  d.airports={CLT:{n:6,name:'Charlotte Douglas International Airport',city:'Charlotte',cc:'US',lat:35.214,lon:-80.943},ATL:{n:3,name:'Hartsfield Jackson Atlanta International Airport',city:'Atlanta',cc:'US',lat:33.637,lon:-84.428},AMM:{n:2,name:'Queen Alia International Airport',city:'Amman',cc:'JO',lat:31.723,lon:35.993},CDG:{n:1,name:'Charles de Gaulle International Airport',city:'Paris',cc:'FR',lat:49.013,lon:2.55},IST:{n:1,name:'Istanbul Airport',city:'Istanbul',cc:'TR',lat:41.261,lon:28.742}};
  d.friends=[{id:'f1',name:'Sam',been:['US','MX','JP','KR','TH','VN','FR','IT','PE'],want:['IS','NZ'],lived:['KR'],added:Date.now()}];
  return d;
}
// Each step: [tab, open, selector, title, text, opts]. open: '' | 'country:US' | 'settings' | 'airports' | 'plan:p1'. No selector = centered card.
const TOUR=[
  ['map','',null,'Welcome to Roamd','A quick look at what it can do. It takes about two minutes, and you can skip it any time. The places on the map are samples for the tour; they disappear when it ends.'],
  ['map','','#mapBox','Your map','It fills in as you mark places: a color for Been, Want to go and Lived. Tap any country to open it. Pinch or use + and − to zoom.'],
  ['map','','#legend','Colors and counts','The numbers count countries. A country with marked states or cities turns a lighter shade, and the marked parts show in full color.'],
  ['map','','#regionSel','Jump to a region','Zoom straight to Europe, Southeast Asia, the Middle East and the rest.'],
  ['map','','#zplane','Airports','Log every airport you fly in, out of or through. A small plane marks each one on the map, with a count of visits.'],
  ['list','','#clist .crow .qb','Quick marking','Tap Been, Want or Lived right on a country’s row. Tap its name to open it.'],
  ['list','','#clist .stctl','States, region by region','Turn states and provinces on or off for a whole region here, or choose which countries keep them.'],
  ['list','country:US','.stoggles','A country’s page','Mark the whole country, add when you went, notes and photos.'],
  ['list','country:US','#cmini','States and provinces','Tap a state to mark it. 213 countries have them, including all 38 of Indonesia’s provinces. The switch above turns them off for this country.'],
  ['list','country:US','#cityQ','Cities','Find a city and mark it; it gets a dot on the map. The list has cities over about 150,000 people plus capitals.'],
  ['list','country:US','.subrow .btns','Plans for this country','Group plans into sections you name, like a city, a route or one trip.'],
  ['plans','','#plist .pcountry','Plans','All your plans, by region, then country, then your sections.'],
  ['plans','plan:p1','.vids','Reels and TikToks','Paste a reel, TikTok or YouTube link into a plan and watch it right there. Add dates, a status, photos and a checklist too.'],
  ['compare','','#cmpBox .card','Compare with friends','Share your map as a link. A friend who opens it sees where you’ve both been, where only one of you has, and places you both want to go.'],
  ['stats','','#statsBox .hero','Stats','How much of the world you’ve seen, region by region, plus states, cities and airports.'],
  ['map','settings','.pal-grid','Make it yours','Pick map colors, including two color-blind friendly sets, or choose your own three on a color wheel.'],
  ['map','settings','#stTree','States everywhere, or not','One switch for all states and provinces, one per region with Choose countries beside it, and one on each country’s page. Disputed territories have their own switch just below.'],
  ['map','settings','[data-act=backup]','Keep a backup','Everything stays on this phone, with no account. Save a backup file now and then, photos included, and restore it on a new phone.'],
  ['map','','#themeBtn','Light or dark','Tap to switch. Settings can also follow your phone.'],
  ['map','',null,'Limitation: one phone at a time','Nothing syncs between devices yet. Use a backup file to move everything to another phone.',{lim:true}],
  ['map','',null,'Limitation: videos and iPhone','Videos play inside a plan when the post allows it; private posts and short TikTok links only open in their apps. iPhone can’t share straight into Roamd, so copy the link and tap Paste.',{lim:true}],
  ['map','',null,'Limitation: Compare','A friend’s map is a snapshot of countries only, not states, cities or airports. They send a new link when theirs changes.',{lim:true}],
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
  $('#zplane').onclick=openAirports;
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
