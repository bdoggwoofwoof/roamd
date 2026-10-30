// Builds site/lists.json: tick-off lists for Roamd.
const fs=require('fs'),d3=require('d3'),topo=require('topojson-client');
const W=require('world-atlas/countries-50m.json'),C=require('world-countries');
const feats=topo.feature(W,W.objects.countries).features;
const byN={};C.forEach(c=>{if(c.ccn3)byN[+c.ccn3]=c.cca2});
const MAPNAME={"Kosovo":"XK","N. Cyprus":"CY","Somaliland":"SO"};
const ccAt=(lon,lat)=>{for(const f of feats)if(d3.geoContains(f,[lon,lat]))return byN[+f.id]||MAPNAME[f.properties.name]||'';
  let best='',bd=1e9;for(const f of feats){const d=d3.geoDistance(d3.geoCentroid(f),[lon,lat]);if(d<bd){bd=d;best=byN[+f.id]||MAPNAME[f.properties.name]||''}}return best};
const nameMap={};C.forEach(c=>{[c.name.common,c.name.official,...(c.altSpellings||[])].forEach(n=>nameMap[n.toLowerCase()]=c.cca2)});
Object.assign(nameMap,{"iran (islamic republic of)":"IR","bolivia (plurinational state of)":"BO","venezuela (bolivarian republic of)":"VE","united kingdom of great britain and northern ireland":"GB","united republic of tanzania":"TZ","republic of korea":"KR","democratic people's republic of korea":"KP","russian federation":"RU","syrian arab republic":"SY","lao people's democratic republic":"LA","republic of moldova":"MD","micronesia (federated states of)":"FM","viet nam":"VN","türkiye":"TR","turkey":"TR","czechia":"CZ","côte d'ivoire":"CI","democratic republic of the congo":"CD","congo":"CG","holy see":"VA","palestine":"PS","state of palestine":"PS","netherlands (kingdom of the)":"NL","cabo verde":"CV","gambia":"GM","north macedonia":"MK","jerusalem (site proposed by jordan)":"PS"});
const out=[];
// UNESCO
const U=JSON.parse(fs.readFileSync('/tmp/unesco/package/data/data.json')).features;
let miss=0;
const unesco=U.map(f=>{const p=f.properties,[lon,lat]=f.geometry.coordinates;const first=(p.country||'').split(',')[0].trim().toLowerCase();let cc=nameMap[first]||'';if(!cc){cc=ccAt(lon,lat);miss++}
  return['U'+p.id,p.name,cc,+lat.toFixed(3),+lon.toFixed(3),p.category[0]]}).sort((a,b)=>a[1].localeCompare(b[1]));
out.push({id:'unesco',name:'UNESCO World Heritage sites',desc:`${unesco.length} sites (cultural, natural and mixed), as of August 2026`,items:unesco});
// capitals
const PL=JSON.parse(fs.readFileSync('data/places.geojson')).features.filter(f=>f.properties.featurecla==='Admin-0 capital');
const core=new Set(C.filter(c=>c.unMember||['VA','PS'].includes(c.cca2)).map(c=>c.cca2));const seen=new Set();
const caps=[];for(const f of PL){const p=f.properties;const cc=p.iso_a2&&p.iso_a2!=='-99'?p.iso_a2:ccAt(p.longitude,p.latitude);if(!core.has(cc)||seen.has(cc+p.name))continue;seen.add(cc+p.name);caps.push(['C'+cc+'-'+p.name.replace(/\W+/g,''),p.name,cc,+p.latitude.toFixed(3),+p.longitude.toFixed(3),''])}
for(const bad of ['CSO-Hargeisa','CZA-Johannesburg','CMM-Yangon'])caps.splice(caps.findIndex(c=>c[0]===bad),1);
caps.push(['CNR-Yaren','Yaren (de facto)','NR',-0.547,166.921,''],['CPS-Ramallah','Ramallah (seat of government)','PS',31.902,35.206,'']);
caps.sort((a,b)=>a[1].localeCompare(b[1]));
const missingCaps=[...core].filter(cc=>!caps.some(c=>c[2]===cc));
out.push({id:'capitals',name:'World capitals',desc:`Capitals of all ${core.size} countries (${caps.length} cities: some countries have more than one)`,items:caps});
// wonders
const wonders=[['W1','Great Wall of China','CN',40.431,116.570],['W2','Petra','JO',30.329,35.444],['W3','Christ the Redeemer','BR',-22.952,-43.211],['W4','Machu Picchu','PE',-13.163,-72.545],['W5','Chichén Itzá','MX',20.684,-88.568],['W6','Colosseum','IT',41.890,12.492],['W7','Taj Mahal','IN',27.175,78.042],['W8','Great Pyramid of Giza (honorary)','EG',29.979,31.134]].map(w=>[...w,'']);
out.push({id:'wonders',name:'New 7 Wonders',desc:'The 2007 New 7 Wonders of the World, plus the Great Pyramid of Giza',items:wonders});
// US national parks
const parks=fs.readFileSync('data/parks63.txt','utf8').trim().split('\n').map((l,i)=>{const[n,st,la,lo]=l.split('|');const cc=st==='American Samoa'?'AS':st==='U.S. Virgin Islands'?'VI':'US';return['P'+i,n+' National Park',cc,+la,+lo,st]});
out.push({id:'usparks',name:'US national parks',desc:'All 63 US national parks',items:parks});
fs.writeFileSync('site/lists.json',JSON.stringify(out));
console.log('unesco',unesco.length,'name-miss→geo',miss,'caps',caps.length,'missing caps',missingCaps,'parks',parks.length,'size',fs.statSync('site/lists.json').size);
console.log(unesco.filter(u=>!u[2]).length,'unesco without cc');
