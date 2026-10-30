'use strict';
/* Roamed — personal travel tracker. Everything is saved on this device (localStorage + IndexedDB). */
const RAW="533|AW|Aruba|CB|0;004|AF|Afghanistan|SAS|1;024|AO|Angola|AF|1;660|AI|Anguilla|CB|0;248|AX|Åland Islands|EU|0;008|AL|Albania|EU|1;020|AD|Andorra|EU|1;784|AE|United Arab Emirates|ME|1;032|AR|Argentina|SA|1;051|AM|Armenia|ME|1;016|AS|American Samoa|OC|0;010|AQ|Antarctica|AN|0;260|TF|French Southern and Antarctic Lands|AN|0;028|AG|Antigua and Barbuda|CB|1;036|AU|Australia|AU|1;040|AT|Austria|EU|1;031|AZ|Azerbaijan|ME|1;108|BI|Burundi|AF|1;056|BE|Belgium|EU|1;204|BJ|Benin|AF|1;854|BF|Burkina Faso|AF|1;050|BD|Bangladesh|SAS|1;100|BG|Bulgaria|EU|1;048|BH|Bahrain|ME|1;044|BS|Bahamas|CB|1;070|BA|Bosnia and Herzegovina|EU|1;652|BL|Saint Barthélemy|CB|0;654|SH|Saint Helena, Ascension and Tristan da Cunha|AF|0;112|BY|Belarus|EU|1;084|BZ|Belize|CA|1;060|BM|Bermuda|NA|0;068|BO|Bolivia|SA|1;535|BQ|Caribbean Netherlands|CB|0;076|BR|Brazil|SA|1;052|BB|Barbados|CB|1;096|BN|Brunei|SEA|1;064|BT|Bhutan|SAS|1;074|BV|Bouvet Island|AN|0;072|BW|Botswana|AF|1;140|CF|Central African Republic|AF|1;124|CA|Canada|NA|1;166|CC|Cocos (Keeling) Islands|AU|0;756|CH|Switzerland|EU|1;152|CL|Chile|SA|1;156|CN|China|EAS|1;384|CI|Ivory Coast|AF|1;120|CM|Cameroon|AF|1;180|CD|DR Congo|AF|1;178|CG|Republic of the Congo|AF|1;184|CK|Cook Islands|OC|0;170|CO|Colombia|SA|1;174|KM|Comoros|AF|1;132|CV|Cape Verde|AF|1;188|CR|Costa Rica|CA|1;192|CU|Cuba|CB|1;531|CW|Curaçao|CB|0;162|CX|Christmas Island|AU|0;136|KY|Cayman Islands|CB|0;196|CY|Cyprus|EU|1;203|CZ|Czechia|EU|1;276|DE|Germany|EU|1;262|DJ|Djibouti|AF|1;212|DM|Dominica|CB|1;208|DK|Denmark|EU|1;214|DO|Dominican Republic|CB|1;012|DZ|Algeria|AF|1;218|EC|Ecuador|SA|1;818|EG|Egypt|ME|1;232|ER|Eritrea|AF|1;732|EH|Western Sahara|AF|0;724|ES|Spain|EU|1;233|EE|Estonia|EU|1;231|ET|Ethiopia|AF|1;246|FI|Finland|EU|1;242|FJ|Fiji|OC|1;238|FK|Falkland Islands|SA|0;250|FR|France|EU|1;234|FO|Faroe Islands|EU|0;583|FM|Micronesia|OC|1;266|GA|Gabon|AF|1;826|GB|United Kingdom|EU|1;268|GE|Georgia|ME|1;831|GG|Guernsey|EU|0;288|GH|Ghana|AF|1;292|GI|Gibraltar|EU|0;324|GN|Guinea|AF|1;312|GP|Guadeloupe|CB|0;270|GM|Gambia|AF|1;624|GW|Guinea-Bissau|AF|1;226|GQ|Equatorial Guinea|AF|1;300|GR|Greece|EU|1;308|GD|Grenada|CB|1;304|GL|Greenland|NA|0;320|GT|Guatemala|CA|1;254|GF|French Guiana|SA|0;316|GU|Guam|OC|0;328|GY|Guyana|SA|1;344|HK|Hong Kong|EAS|0;334|HM|Heard Island and McDonald Islands|AN|0;340|HN|Honduras|CA|1;191|HR|Croatia|EU|1;332|HT|Haiti|CB|1;348|HU|Hungary|EU|1;360|ID|Indonesia|SEA|1;833|IM|Isle of Man|EU|0;356|IN|India|SAS|1;086|IO|British Indian Ocean Territory|AF|0;372|IE|Ireland|EU|1;364|IR|Iran|ME|1;368|IQ|Iraq|ME|1;352|IS|Iceland|EU|1;376|IL|Israel|ME|1;380|IT|Italy|EU|1;388|JM|Jamaica|CB|1;832|JE|Jersey|EU|0;400|JO|Jordan|ME|1;392|JP|Japan|EAS|1;398|KZ|Kazakhstan|CAS|1;404|KE|Kenya|AF|1;417|KG|Kyrgyzstan|CAS|1;116|KH|Cambodia|SEA|1;296|KI|Kiribati|OC|1;659|KN|Saint Kitts and Nevis|CB|1;410|KR|South Korea|EAS|1;|XK|Kosovo|EU|0;414|KW|Kuwait|ME|1;418|LA|Laos|SEA|1;422|LB|Lebanon|ME|1;430|LR|Liberia|AF|1;434|LY|Libya|AF|1;662|LC|Saint Lucia|CB|1;438|LI|Liechtenstein|EU|1;144|LK|Sri Lanka|SAS|1;426|LS|Lesotho|AF|1;440|LT|Lithuania|EU|1;442|LU|Luxembourg|EU|1;428|LV|Latvia|EU|1;446|MO|Macau|EAS|0;663|MF|Saint Martin|CB|0;504|MA|Morocco|AF|1;492|MC|Monaco|EU|1;498|MD|Moldova|EU|1;450|MG|Madagascar|AF|1;462|MV|Maldives|SAS|1;484|MX|Mexico|NA|1;584|MH|Marshall Islands|OC|1;807|MK|North Macedonia|EU|1;466|ML|Mali|AF|1;470|MT|Malta|EU|1;104|MM|Myanmar|SEA|1;499|ME|Montenegro|EU|1;496|MN|Mongolia|EAS|1;580|MP|Northern Mariana Islands|OC|0;508|MZ|Mozambique|AF|1;478|MR|Mauritania|AF|1;500|MS|Montserrat|CB|0;474|MQ|Martinique|CB|0;480|MU|Mauritius|AF|1;454|MW|Malawi|AF|1;458|MY|Malaysia|SEA|1;175|YT|Mayotte|AF|0;516|NA|Namibia|AF|1;540|NC|New Caledonia|OC|0;562|NE|Niger|AF|1;574|NF|Norfolk Island|AU|0;566|NG|Nigeria|AF|1;558|NI|Nicaragua|CA|1;570|NU|Niue|OC|0;528|NL|Netherlands|EU|1;578|NO|Norway|EU|1;524|NP|Nepal|SAS|1;520|NR|Nauru|OC|1;554|NZ|New Zealand|AU|1;512|OM|Oman|ME|1;586|PK|Pakistan|SAS|1;591|PA|Panama|CA|1;612|PN|Pitcairn Islands|OC|0;604|PE|Peru|SA|1;608|PH|Philippines|SEA|1;585|PW|Palau|OC|1;598|PG|Papua New Guinea|OC|1;616|PL|Poland|EU|1;630|PR|Puerto Rico|CB|0;408|KP|North Korea|EAS|1;620|PT|Portugal|EU|1;600|PY|Paraguay|SA|1;275|PS|Palestine|ME|1;258|PF|French Polynesia|OC|0;634|QA|Qatar|ME|1;638|RE|Réunion|AF|0;642|RO|Romania|EU|1;643|RU|Russia|EU|1;646|RW|Rwanda|AF|1;682|SA|Saudi Arabia|ME|1;729|SD|Sudan|AF|1;686|SN|Senegal|AF|1;702|SG|Singapore|SEA|1;239|GS|South Georgia|AN|0;744|SJ|Svalbard and Jan Mayen|EU|0;090|SB|Solomon Islands|OC|1;694|SL|Sierra Leone|AF|1;222|SV|El Salvador|CA|1;674|SM|San Marino|EU|1;706|SO|Somalia|AF|1;666|PM|Saint Pierre and Miquelon|NA|0;688|RS|Serbia|EU|1;728|SS|South Sudan|AF|1;678|ST|São Tomé and Príncipe|AF|1;740|SR|Suriname|SA|1;703|SK|Slovakia|EU|1;705|SI|Slovenia|EU|1;752|SE|Sweden|EU|1;748|SZ|Eswatini|AF|1;534|SX|Sint Maarten|CB|0;690|SC|Seychelles|AF|1;760|SY|Syria|ME|1;796|TC|Turks and Caicos Islands|CB|0;148|TD|Chad|AF|1;768|TG|Togo|AF|1;764|TH|Thailand|SEA|1;762|TJ|Tajikistan|CAS|1;772|TK|Tokelau|OC|0;795|TM|Turkmenistan|CAS|1;626|TL|Timor-Leste|SEA|1;776|TO|Tonga|OC|1;780|TT|Trinidad and Tobago|CB|1;788|TN|Tunisia|AF|1;792|TR|Türkiye|ME|1;798|TV|Tuvalu|OC|1;158|TW|Taiwan|EAS|0;834|TZ|Tanzania|AF|1;800|UG|Uganda|AF|1;804|UA|Ukraine|EU|1;581|UM|United States Minor Outlying Islands|NA|0;858|UY|Uruguay|SA|1;840|US|United States|NA|1;860|UZ|Uzbekistan|CAS|1;336|VA|Vatican City|EU|1;670|VC|Saint Vincent and the Grenadines|CB|1;862|VE|Venezuela|SA|1;092|VG|British Virgin Islands|CB|0;850|VI|United States Virgin Islands|CB|0;704|VN|Vietnam|SEA|1;548|VU|Vanuatu|OC|1;876|WF|Wallis and Futuna|OC|0;882|WS|Samoa|OC|1;887|YE|Yemen|ME|1;710|ZA|South Africa|AF|1;894|ZM|Zambia|AF|1;716|ZW|Zimbabwe|AF|1";
const REGIONS=[["NA","North America"],["CA","Central America"],["CB","Caribbean"],["SA","South America"],["EU","Europe"],["ME","Middle East"],["AF","Africa"],["CAS","Central Asia"],["SAS","South Asia"],["EAS","East Asia"],["SEA","Southeast Asia"],["AU","Australia & NZ"],["OC","Oceania"],["AN","Antarctica"]];
const RNAME=Object.fromEntries(REGIONS);
const C=[],BY={},BYN={};
RAW.split(';').forEach(r=>{const[n,cc,name,reg,core]=r.split('|');const o={n,cc,name,reg,core:core==='1'};C.push(o);BY[cc]=o;if(n)BYN[+n]=o});
C.sort((a,b)=>a.name.localeCompare(b.name));
const CORE=C.filter(c=>c.core).length;
const MAPNAME={"Kosovo":"XK","N. Cyprus":"CY","Somaliland":"SO"};
const CDN={d3:'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js',topo:'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js',map:'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json'};
const STATUS_L={idea:'Idea',booked:'Booked',done:'Done'};
const KL={been:'Been',want:'Want to go',lived:'Lived'};

const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const today=()=>new Date().toISOString().slice(0,10);
const flag=cc=>cc.replace(/./g,ch=>String.fromCodePoint(127397+ch.charCodeAt(0)));
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
};
const ic=(n,c='')=>`<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;

/* ---------- storage ---------- */
const LS='roamed.v1';
let S;
const blank=()=>({v:1,countries:{},sections:[],plans:[],friends:[],me:'',settings:{theme:'auto',lastBackup:0,nag:0,tourDone:false},saved:0});
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
  mapDots=mapG.selectAll('g.dotg').data(DOTS).join('g').attr('class','dotg').attr('transform',d=>`translate(${d.x},${d.y})`);
  mapDots.append('circle').attr('class','hit');mapDots.append('circle').attr('class','dm');
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
  mapDots.select('.dm').attr('r',d=>(tier(cs(d.cc))?4.2:2.6)/u);mapDots.select('.hit').attr('r',11/u)}
function paintMap(){if(!mapReady)return;mapPaths.attr('class',d=>{if(!d.cc)return'c none';const t=tier(cs(d.cc));return'c'+(t?' s-'+t:'')});
  mapDots.attr('class',d=>{const t=tier(cs(d.cc));return'dotg'+(t?' s-'+t:'')});sizeDots()}
function counts(){let been=0,want=0,lived=0,terr=0;for(const c of C){const s=cs(c.cc);if(s.been){c.core?been++:terr++}if(s.want&&!s.been)want++;if(s.lived)lived++}return{been,want,lived,terr}}
function renderMapView(){
  paintMap();const n=counts();
  $('#legend').innerHTML=`<span class="lg"><i class="dot been"></i>Been <b>${n.been}</b></span><span class="lg"><i class="dot want"></i>Want to go <b>${n.want}</b></span><span class="lg"><i class="dot lived"></i>Lived <b>${n.lived}</b></span>`;
  const has=Object.keys(S.countries).length||S.plans.length;
  const old=Date.now()-(S.settings.lastBackup||0)>14*864e5&&Date.now()-(S.settings.nag||0)>7*864e5;
  $('#nag').innerHTML=has&&old?`<div class="nag"><span>${S.settings.lastBackup?'It’s been 2+ weeks since your last backup.':'You haven’t saved a backup yet.'}</span><button class="btn sm" data-nag="save">Save backup</button><button class="btn sm ghost" data-nag="later">Later</button></div>`:'';
}

/* ---------- countries list ---------- */
let filt='all',q='';
function rowHTML(c){const s=cs(c.cc);return`<div class="crow" data-cc="${c.cc}"><button class="cmain" data-open-cc="${c.cc}"><span class="flag">${flag(c.cc)}</span><span class="cname">${esc(c.name)}${c.core?'':'<small>territory</small>'}</span></button><span class="qb">${['been','want','lived'].map(k=>`<button class="q q-${k}${s[k]?' on':''}" data-k="${k}" aria-pressed="${!!s[k]}">${k==='want'?'Want':KL[k]}</button>`).join('')}</span></div>`}
function renderList(){
  const qq=q.trim().toLowerCase();let html='';
  for(const[rc,rn]of REGIONS){
    const rows=C.filter(c=>{if(c.reg!==rc)return false;if(qq&&!c.name.toLowerCase().includes(qq))return false;const s=cs(c.cc);return filt==='all'||(filt==='none'?!(s.been||s.want||s.lived):!!s[filt])});
    if(!rows.length)continue;
    const all=C.filter(c=>c.reg===rc&&c.core),b=all.filter(c=>cs(c.cc).been).length;
    html+=`<h3 class="rhead"><span>${rn}</span>${all.length?`<small>${b}/${all.length} been</small>`:''}</h3><div class="card">${rows.map(rowHTML).join('')}</div>`;
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
function openCountry(cc){
  const c=BY[cc];if(!c)return;
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
        <h4 class="sub">Photos</h4>${gridHTML(s.photos||[])}
        <div class="subrow"><h4 class="sub">Plans</h4><span class="btns"><button class="btn sm ghost" data-act="newsec">${ic('folder')} Section</button><button class="btn sm" data-act="newplan">${ic('plus')} Plan</button></span></div>
        ${secs.map(x=>`<div class="secbox"><div class="sech">${ic('folder')}<b>${esc(x.name)}</b><button class="iconbtn sm" data-act="rensec" data-id="${x.id}" aria-label="Rename">${ic('pencil')}</button><button class="iconbtn sm" data-act="delsec" data-id="${x.id}" aria-label="Delete section">${ic('trash')}</button></div>${plans.filter(p=>p.sec===x.id).map(planRow).join('')}<button class="addline" data-act="newplan" data-sec="${x.id}">${ic('plus')} Plan in ${esc(x.name)}</button></div>`).join('')}
        ${loose.length?`<div class="secbox loose">${secs.length?'<div class="sech muted">Not in a section</div>':''}${loose.map(planRow).join('')}</div>`:''}
        ${!plans.length&&!secs.length?'<p class="muted small">No plans yet. Make a section (like a city or one trip) to group plans, or just add a plan.</p>':''}
      </div>`;
    },
    click(e,t){
      const pl=e.target.closest('[data-plan]');if(pl){openPlan(pl.dataset.plan);return}
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
  if(/(^|\.)tiktok\.com$/.test(h)){if(m=u.pathname.match(/\/(video|photo)\/(\d+)/))return{type:'tt',id:m[2],host:'TikTok',tall:true};return{type:'link',host:'TikTok',note:'Short TikTok share links can’t play here. Tap Open, then copy the full link from the address bar if you want it to play inside Roamed.'}}
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
      const list=()=>{const want=C.filter(c=>cs(c.cc).want&&!qq);const rows=C.filter(c=>!qq||c.name.toLowerCase().includes(qq));$('#pickList',el).innerHTML=(want.length?`<h3 class="rhead"><span>Want to go</span></h3><div class="card">${want.map(c=>`<button class="pick" data-pick="${c.cc}"><span class="flag">${flag(c.cc)}</span>${esc(c.name)}</button>`).join('')}</div>`:'')+`<h3 class="rhead"><span>${qq?'Matches':'All countries'}</span></h3><div class="card">${rows.map(c=>`<button class="pick" data-pick="${c.cc}"><span class="flag">${flag(c.cc)}</span>${esc(c.name)}<small>${RNAME[c.reg]}</small></button>`).join('')||'<p class="empty">No match.</p>'}</div>`};list();
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
    <p class="muted small">Send this link to a friend. When they open it in Roamed, they see how your maps compare. It’s a snapshot: send a new one after you update.</p>
    <label class="fld"><span>Your name on the link</span><input id="meName" value="${esc(S.me)}" placeholder="e.g. Newt" maxlength="30"></label>
    <p class="small">${n.been} countries been · ${n.want} want to go · ${n.lived} lived</p>
    <div class="btnrow"><button class="btn" data-cmp="share">${ic('share')} Share my map</button><button class="btn ghost" data-cmp="copy">${ic('clip')} Copy link</button></div>
  </div>
  <div class="card pad">
    <h3 class="h3">Add a friend’s map</h3>
    <p class="muted small">Opening their link adds it here automatically. Or paste the link they sent you.</p>
    <div class="addlink"><input id="frIn" placeholder="Paste their Roamed link" autocomplete="off"><button class="btn sm ghost" data-cmp="paste">${ic('clip')} Paste</button><button class="btn sm" data-cmp="add">Add</button></div>
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
  const url=myLink(),text=`My travel map on Roamed: ${counts().been} countries. Open to compare with yours:`;
  if(navigator.share){try{await navigator.share({title:'My Roamed map',text,url});return}catch(e){if(e.name==='AbortError')return}}
  copyText(url);
}
async function copyText(s){try{await navigator.clipboard.writeText(s);toast('Link copied')}catch(e){prompt('Copy this link:',s)}}
function takeFriendLink(txt){const f=parseCode(txt);if(!f){toast('That isn’t a Roamed map link');return false}const n=addFriend(f);setTab('compare');openFriend(n.id);return true}

/* ---------- stats ---------- */
function renderStats(){
  const n=counts(),pct=Math.round(n.been/CORE*1000)/10;
  const regs=REGIONS.filter(([rc])=>rc!=='AN').map(([rc,rn])=>{const all=C.filter(c=>c.reg===rc&&c.core);const b=all.filter(c=>cs(c.cc).been).length;return{rc,rn,b,t:all.length}});
  const touched=regs.filter(r=>r.b).length+(cs('AQ').been?1:0);
  const photos=Object.values(S.countries).reduce((a,s)=>a+(s.photos?.length||0),0)+S.plans.reduce((a,p)=>a+(p.photos?.length||0),0);
  $('#statsBox').innerHTML=`
  <div class="hero"><div class="big">${n.been}<small>/${CORE}</small></div><div><b>countries</b><span>${pct}% of the world${n.terr?` · plus ${plural(n.terr,'territory')}`:''}</span></div>
  <div class="bar"><i style="width:${Math.min(100,pct)}%"></i></div></div>
  <div class="tiles"><div class="tile"><b>${touched}</b><span>of ${REGIONS.length} regions</span></div><div class="tile"><b>${n.lived}</b><span>lived in</span></div><div class="tile"><b>${n.want}</b><span>want to go</span></div><div class="tile"><b>${S.plans.length}</b><span>plans</span></div><div class="tile"><b>${photos}</b><span>photos</span></div><div class="tile"><b>${S.friends.length}</b><span>friends’ maps</span></div></div>
  <h3 class="rhead"><span>By region</span></h3>
  <div class="card pad">${regs.map(r=>`<div class="rbar"><span class="rn">${r.rn}</span><span class="rv">${r.b}/${r.t}</span><div class="bar"><i style="width:${r.t?r.b/r.t*100:0}%"></i></div></div>`).join('')}</div>`;
}

/* ---------- settings, help, backup ---------- */
function applyTheme(){const t=S.settings.theme;if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.dataset.theme=t;const m=$('meta[name=theme-color]');if(m)m.content=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#f6f3ee'}
async function persist(){try{if(navigator.storage&&navigator.storage.persist)await navigator.storage.persist()}catch(e){}}
const blobToData=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
const dataToBlob=async d=>(await fetch(d)).blob();
async function saveBackup(){
  toast('Packing your backup…');
  const photos=await phAll().catch(()=>[]);const ph=[];
  for(const p of photos)ph.push({id:p.id,caption:p.caption||'',created:p.created,data:await blobToData(p.blob)});
  const json=JSON.stringify({app:'roamed',version:1,exported:new Date().toISOString(),state:S,photos:ph});
  const name=`roamed-backup-${today()}.json`,file=new File([json],name,{type:'application/json'});
  let ok=false;
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Roamed backup'});ok=true}catch(e){if(e.name==='AbortError')return}}
  if(!ok){const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
  S.settings.lastBackup=Date.now();save();render();toast('Backup saved');
}
async function restoreBackup(file){
  let d;try{d=JSON.parse(await file.text())}catch(e){toast('That file isn’t a Roamed backup');return}
  if(!d||d.app!=='roamed'||!d.state){toast('That file isn’t a Roamed backup');return}
  if(!confirm(`Replace everything in Roamed with this backup from ${String(d.exported||'').slice(0,10)}? This can’t be undone.`))return;
  toast('Restoring…');await phClear().catch(()=>{});urlCache.clear();
  for(const p of d.photos||[]){try{const blob=await dataToBlob(p.data);const thumb=await shrink(blob,420,.78);await phPut({id:p.id,blob,thumb,caption:p.caption,created:p.created})}catch(e){}}
  S=Object.assign(blank(),d.state);S.settings=Object.assign(blank().settings,d.state.settings||{},{tourDone:true});save();applyTheme();
  while(stack.length)await back();render();toast('Backup restored');
}
function exportCSV(){
  const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;
  const rows=[['Country','Region','Been','Want to go','Lived','When','Where lived','Notes']];
  for(const c of C){const s=cs(c.cc);if(!(s.been||s.want||s.lived||s.notes))continue;rows.push([c.name,RNAME[c.reg],s.been?'yes':'',s.want?'yes':'',s.lived?'yes':'',s.years,s.livedNote,s.notes])}
  const blob=new Blob([rows.map(r=>r.map(q).join(',')).join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`roamed-countries-${today()}.csv`;a.click();
}
function openSettings(){
  sheet({
    render(el){
      const ios=/iP(hone|ad|od)/.test(navigator.userAgent),standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
      el.innerHTML=`${shead('<span class="tt"><b>Settings</b></span>')}<div class="sbody">
      <h4 class="sub">Theme</h4><div class="seg">${['auto','light','dark'].map(t=>`<button data-act="theme" data-v="${t}" class="${S.settings.theme===t?'on':''}">${t==='auto'?'Match phone':t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div>
      <h4 class="sub">Backup</h4><p class="muted small">Roamed saves on this phone only. A backup file holds everything, photos included. Last backup: <b>${S.settings.lastBackup?new Date(S.settings.lastBackup).toLocaleDateString():'never'}</b>.</p>
      <div class="btnrow"><button class="btn" data-act="backup">Save backup</button><label class="btn ghost">Restore from backup<input type="file" accept="application/json,.json" hidden id="restoreIn"></label></div>
      <h4 class="sub">Export</h4><div class="btnrow"><button class="btn ghost" data-act="csv">Countries as a spreadsheet (CSV)</button></div>
      ${standalone?'':`<h4 class="sub">Put Roamed on your home screen</h4><p class="muted small">${ios?'In Safari, tap Share, then <b>Add to Home Screen</b>.':'In Chrome, tap ⋮, then <b>Install app</b> (or Add to Home screen).'} It then opens full screen and works offline.</p>`}
      <h4 class="sub">More</h4><div class="btnrow"><button class="btn ghost" data-act="tour">Replay the tour</button><button class="btn ghost" data-act="help">Help</button></div>
      <h4 class="sub danger">Start over</h4><button class="btn danger" data-act="wipe">Erase everything on this phone</button>
      <p class="tiny muted ver">Roamed v1 · map data: Natural Earth via world-atlas</p></div>`;
    },
    async click(e,t){if(!t)return;const a=t.dataset.act;
      if(a==='theme'){S.settings.theme=t.dataset.v;save();applyTheme();this.refresh()}
      else if(a==='backup')saveBackup();else if(a==='csv')exportCSV();
      else if(a==='tour'){await back();startTour()}else if(a==='help'){openHelp()}
      else if(a==='wipe'){if(confirm('Erase all countries, plans, photos and friends’ maps? Save a backup first if you might want them.')&&confirm('Really erase everything?')){await phClear().catch(()=>{});S=blank();S.settings.tourDone=true;save();await back();render();toast('Erased')}}},
    change(e){if(e.target.id==='restoreIn'&&e.target.files[0])restoreBackup(e.target.files[0])},
  });
}
function openHelp(){
  sheet({render(el){el.innerHTML=`${shead('<span class="tt"><b>Help</b></span>')}<div class="sbody help">
  <h4 class="sub">Marking countries</h4><p>Tap a country on the map, or use the Countries tab and tap <b>Been</b>, <b>Want</b> or <b>Lived</b> on its row. Lived also counts as Been. Open a country to add when you went, where you lived, notes and photos.</p>
  <h4 class="sub">Plans</h4><p>Plans are sorted by region, then country, then sections you make yourself, such as a city (“Kyoto”), a route (“Ring Road”) or one trip (“Spring 2027”). Each plan has dates, a status (Idea, Booked, Done), reels and TikToks, photos, a checklist and notes. Make a section from the country page, or pick <b>+ New section…</b> in a plan.</p>
  <h4 class="sub">Saving reels and TikToks</h4><p>Copy the link in Instagram, TikTok or YouTube (Share → Copy link), open the plan and tap <b>Paste</b>. On Android with Roamed installed, you can also share straight to Roamed from the share sheet. Tap <b>Watch here</b> to play it inside the plan.</p>
  <h4 class="sub">Comparing maps</h4><p>In Compare, tap <b>Share my map</b> and send the link. When a friend opens it in Roamed, your map is added to theirs and they see both, only you, only them, and places you both want to go. Ask them to send theirs back.</p>
  <h4 class="sub">Regions</h4><p>NA North America (incl. Mexico) · CA Central America · CB Caribbean · SA South America · EU Europe (incl. Russia) · ME Middle East (incl. Egypt, Iran, Türkiye, the Caucasus) · AF Africa · CAS Central Asia · SAS South Asia · EAS East Asia · SEA Southeast Asia · AU Australia &amp; NZ · OC Oceania (Pacific islands) · AN Antarctica. The count of ${CORE} is UN members plus Vatican City and Palestine; territories (Puerto Rico, Greenland, Hong Kong…) are listed too but counted separately.</p>
  <h4 class="sub">Limitations</h4><ul class="lims">
  <li><b>No sync.</b> Everything stays on this phone. Save a backup now and then; it includes photos.</li>
  <li><b>Compare is a snapshot.</b> Friends’ maps don’t update by themselves; they send a new link. Their plans and photos are never shared, only which countries.</li>
  <li><b>Video previews depend on the site.</b> Private or removed posts won’t play. Short TikTok links (vm.tiktok.com) only open in TikTok. Instagram may ask you to log in.</li>
  <li><b>iPhone can’t share into web apps.</b> Copy the link, then Paste.</li>
  <li><b>Small countries show as dots</b> at world zoom (Singapore, Malta, most islands). Zoom in and the real shape takes over. Territories that the map data joins to another country (French Guiana, Réunion, Svalbard, Bonaire…) are split off so they fill only on their own.</li>
  <li><b>First map load needs internet</b> (about 1 MB); after that it works offline.</li>
  <li><b>No states or cities on the map</b> yet; use sections and notes for those.</li></ul>
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

/* ---------- tour (spotlight) ---------- */
const STEPS=[
{title:'Welcome to Roamed',text:'Track where you’ve been, where you want to go and where you’ve lived. Plan trips with reels, TikToks and photos, and compare maps with friends. This tour shows where everything is.'},
{tab:'map',sel:'#mapBox',title:'Your map',text:'Tap any country to open it. Pinch or use + and − to zoom, and drag to move around.'},
{tab:'map',sel:'#legend',title:'Colors',text:'Green is Been, amber is Want to go, purple is Lived. The numbers count countries.'},
{tab:'map',sel:'#regionSel',title:'Jump to a region',text:'Zoom straight to Europe, Southeast Asia, the Middle East and the rest.'},
{tab:'list',sel:'#clist .crow .qb',title:'Quick marking',text:'In Countries, tap Been, Want or Lived right on a row. Tap the name to add years, notes and photos.'},
{tab:'list',sel:'.listtools',title:'Search and filter',text:'Find a country fast, or show only the ones you’ve been to, want to see or lived in.'},
{tab:'plans',sel:'#newPlanBtn',title:'Plans',text:'Start a plan by picking a country. Plans are grouped by region, then country, then any sections you make, like a city or one trip.'},
{tab:'compare',sel:'#cmpBox .card',title:'Compare',text:'Share your map as a link. A friend who opens it sees where you’ve both been, where only one of you has, and places you both want to go.'},
{tab:'stats',sel:'#statsBox .hero',title:'Stats',text:'How much of the world you’ve seen, and region by region.'},
{sel:'#setBtn',title:'Settings',text:'Theme, backup and restore, and a spreadsheet of your countries.'},
{sel:'#helpBtn',title:'Help',text:'How-tos, every limitation, and this tour again.'},
{lim:true,title:'Saved on this phone only',text:'Nothing syncs between devices. Save a backup now and then from Settings; it includes your photos.'},
{lim:true,title:'Videos',text:'Reels, TikToks and YouTube play inside a plan when the post allows it. On iPhone you can’t share straight into Roamed: copy the link, then tap Paste.'},
{lim:true,title:'Compare is a snapshot',text:'A friend’s map doesn’t update by itself. They send a new link when theirs changes.'},
];
function startTour(){
  if($('.tour'))return;let i=0;const ov=document.createElement('div');ov.className='tour';ov.innerHTML='<div class="hole"></div><div class="tcard" role="dialog" aria-live="polite"></div>';document.body.append(ov);
  const end=()=>{ov.remove();document.removeEventListener('keydown',key);S.settings.tourDone=true;save();setTab('map')};
  const key=e=>{if(e.key==='Escape')end();else if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1)};
  const go=d=>{i+=d;if(i>=STEPS.length)return end();if(i<0)i=0;show()};
  const show=()=>{const st=STEPS[i];if(st.tab&&tab!==st.tab)setTab(st.tab);
    setTimeout(()=>{const t=st.sel&&$(st.sel),hole=$('.hole',ov),card=$('.tcard',ov);
      card.innerHTML=`<div class="tmeta">${i+1} / ${STEPS.length}${st.lim?'<span class="limtag">Limitation</span>':''}</div><h3>${st.title}</h3><p>${st.text}</p><div class="tbtns"><button class="btn sm ghost" data-t="skip">Skip</button><span></span><button class="btn sm ghost" data-t="back"${i?'':' disabled'}>Back</button><button class="btn sm" data-t="next">${i===STEPS.length-1?'Done':'Next'}</button></div>`;
      card.style.top=card.style.bottom='';card.classList.remove('mid');
      if(t){t.scrollIntoView({block:'nearest'});const r=t.getBoundingClientRect();ov.classList.add('spot');Object.assign(hole.style,{left:r.left-6+'px',top:r.top-6+'px',width:r.width+12+'px',height:r.height+12+'px'});
        const ch=card.offsetHeight||200;if(r.top+r.height/2<innerHeight/2)card.style.top=Math.min(r.bottom+14,innerHeight-ch-12)+'px';else card.style.top=Math.max(12,r.top-ch-14)+'px'}
      else{ov.classList.remove('spot');card.classList.add('mid')}
      $('[data-t=next]',card).focus({preventScroll:true});
    },st.tab?60:0)};
  ov.addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(!b)return;b.dataset.t==='skip'?end():go(b.dataset.t==='next'?1:-1)});
  document.addEventListener('keydown',key);show();
}

/* ---------- wiring ---------- */
function wire(){
  $$('.tabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
  $('#setBtn').onclick=openSettings;$('#helpBtn').onclick=openHelp;
  $('#zin').onclick=()=>mapReady&&mapSvg.transition().call(zoom.scaleBy,1.6);
  $('#zout').onclick=()=>mapReady&&mapSvg.transition().call(zoom.scaleBy,1/1.6);
  $('#zreset').onclick=()=>{$('#regionSel').value='';zoomRegion('')};
  $('#regionSel').innerHTML='<option value="">Whole world</option>'+REGIONS.map(([rc,rn])=>`<option value="${rc}">${rn}</option>`).join('');
  $('#regionSel').onchange=e=>zoomRegion(e.target.value);
  $('#q').oninput=e=>{q=e.target.value;renderList()};
  $('#fchips').onclick=e=>{const b=e.target.closest('[data-f]');if(b){filt=b.dataset.f;renderList()}};
  $('#pchips').onclick=e=>{const b=e.target.closest('[data-f]');if(b){pfilt=b.dataset.f;renderPlans()}};
  $('#newPlanBtn').onclick=()=>pickCountry('New plan in…',cc=>{const p=newPlan(cc);openPlan(p.id,true)});
  $('#clist').onclick=e=>{const qb=e.target.closest('.q');if(qb){const cc=qb.closest('.crow').dataset.cc;setK(cc,qb.dataset.k,!cs(cc)[qb.dataset.k]);const row=qb.closest('.crow');row.outerHTML=rowHTML(BY[cc]);return}};
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
  await load();applyTheme();matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);
  wire();setTab('map');initMap();
  const busy=incoming();
  if(!S.settings.tourDone&&!busy)setTimeout(startTour,700);
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
  if(Object.keys(S.countries).length)persist();
})();
