// Builds per-country state/province files for Roamed from Natural Earth 10m admin-1 (public domain).
// Output: ../site/regions/<CC>.json (TopoJSON, object "r", properties {id,name}) and ../site/regions/index.json
const fs = require('fs'), path = require('path'), ms = require('mapshaper');
const SRC = JSON.parse(fs.readFileSync(path.join(__dirname, 'admin1.geojson'), 'utf8'));
const OUT = path.join(__dirname, '..', 'site', 'regions');
fs.mkdirSync(OUT, { recursive: true });

const KEEP = new Set(['TR','TH','VN','RU','JP','US','CN','IN','MX','BR','DZ','NG','IR','CO','UA']);
const _cnt = {}; SRC.features.forEach(f => { const c = f.properties.iso_a2; if (c && c.length === 2 && c !== '-9' && c !== '-1') _cnt[c] = (_cnt[c] || 0) + 1 });
const COUNTRIES = Object.keys(_cnt).filter(c => _cnt[c] >= 2 && c !== 'ID').sort();

// Indonesia: 33 Natural Earth provinces -> 20 regions (Newt asked for 20).
const ID20 = {
  'Aceh': 'Aceh', 'Sumatera Utara': 'North Sumatra', 'Sumatera Barat': 'West Sumatra',
  'Riau': 'Riau & Riau Islands', 'Kepulauan Riau': 'Riau & Riau Islands',
  'Jambi': 'Jambi & South Sumatra', 'Sumatera Selatan': 'Jambi & South Sumatra',
  'Bengkulu': 'Bengkulu & Lampung', 'Lampung': 'Bengkulu & Lampung', 'Bangka-Belitung': 'Bangka Belitung',
  'Jakarta Raya': 'Jakarta & Banten', 'Banten': 'Jakarta & Banten', 'Jawa Barat': 'West Java',
  'Jawa Tengah': 'Central Java & Yogyakarta', 'Yogyakarta': 'Central Java & Yogyakarta', 'Jawa Timur': 'East Java',
  'Bali': 'Bali', 'Nusa Tenggara Barat': 'Lombok & Sumbawa', 'Nusa Tenggara Timur': 'Flores, Sumba & Timor',
  'Kalimantan Barat': 'West & Central Kalimantan', 'Kalimantan Tengah': 'West & Central Kalimantan',
  'Kalimantan Selatan': 'South, East & North Kalimantan', 'Kalimantan Timur': 'South, East & North Kalimantan',
  'Sulawesi Utara': 'Northern Sulawesi', 'Gorontalo': 'Northern Sulawesi', 'Sulawesi Tengah': 'Northern Sulawesi',
  'Sulawesi Selatan': 'Southern Sulawesi', 'Sulawesi Barat': 'Southern Sulawesi', 'Sulawesi Tenggara': 'Southern Sulawesi',
  'Maluku': 'Maluku', 'Maluku Utara': 'Maluku', 'Papua': 'Papua', 'Papua Barat': 'Papua',
};
const ENG = { 'Eastern': 'East of England', 'East': 'East of England' };
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toUpperCase();
function group(cc, p) {
  if (cc === 'IQ' && p.geonunit === 'Iraqi Kurdistan') return [p.iso_3166_2, (p.name_en || p.name) + ' (Kurdistan Region)'];
  // returns [id, name]
  if (cc === 'ID') { const g = ID20[p.name]; if (!g) throw new Error('ID unmapped ' + p.name); return ['ID-' + slug(g), g]; }
  if (cc === 'GB') { if (p.geonunit === 'England') { const r = ENG[p.region] || p.region; return ['GB-ENG-' + slug(r), r === 'Greater London' ? 'London' : r]; } return ['GB-' + slug(p.geonunit), p.geonunit]; }
  if (BYREG.has(cc) && p.region) { const n = p.region.replace(/ \((Region [IVXA-B-]+|CAR|ARMM)\)$/, ''); return [cc + '-' + slug(n), n]; }
  const id = p.iso_3166_2 && /^[A-Z]{2}-/.test(p.iso_3166_2) ? p.iso_3166_2 : cc + '-' + slug(p.adm1_code || p.name);
  return [id, p.name_en || p.name || p.gn_name || id];
}
const size = {}; const index = {}; const BYREG = new Set(['FR', 'IT', 'ES', 'PH']);
// countries whose admin-1 units are very small (e.g. municipalities) are grouped by their region field
for (const c of Object.keys(_cnt)) if (_cnt[c] > 60 && !KEEP.has(c) && c !== 'GB') { const rs = new Set(SRC.features.filter(f => f.properties.iso_a2 === c).map(f => f.properties.region).filter(Boolean)); if (rs.size >= 3 && rs.size <= 40) BYREG.add(c) }
(async () => {
  for (const cc of COUNTRIES) {
    let feats = SRC.features.filter(f => f.properties.iso_a2 === cc);
    if (!feats.length) { console.log('none', cc); continue; }
    // Drop only parts that Roamd lists as their own places (overseas territories), keep every other unit
    // (e.g. Iraqi Kurdistan, Wallonia, Republika Srpska, Zanzibar, Azores).
    const SEPARATE = new Set(['French Guiana', 'Martinique', 'Guadeloupe', 'Reunion', 'Mayotte', 'Svalbard', 'Bouvet Island', 'Paracel Islands']);
    feats = feats.filter(f => !SEPARATE.has(f.properties.geonunit));
    const ids = new Set();
    const gj = { type: 'FeatureCollection', features: feats.map(f => { const [id, name] = group(cc, f.properties); return { type: 'Feature', geometry: f.geometry, properties: { id, name } }; }) };
    // make ids unique per distinct name when needed
    const byId = {}; gj.features.forEach(f => { (byId[f.properties.id] ||= new Set()).add(f.properties.name) });
    for (const [id, names] of Object.entries(byId)) if (names.size > 1 && !BYREG.has(cc) && !['ID', 'GB'].includes(cc)) gj.features.forEach(f => { if (f.properties.id === id) f.properties.id = id + '-' + slug(f.properties.name) });
    gj.features=gj.features.filter(f=>f.geometry);
    fs.writeFileSync('/tmp/r_in.json', JSON.stringify(gj));
    process.stdout.write(cc+' ');
    const big = ['RU', 'CA', 'US', 'CN', 'BR', 'AU', 'IN', 'AR', 'KZ', 'ID'].includes(cc);
    const pct = big ? '6%' : '12%';
    try { await ms.runCommands(`-i /tmp/r_in.json name=r -dissolve2 id copy-fields=name -simplify ${pct} weighted keep-shapes -filter-islands min-area=4km2 remove-empty -o /tmp/r_out.json format=topojson quantization=8000`); }
    catch (e) { console.log('retry', cc, e.message); await ms.runCommands(`-i /tmp/r_in.json name=r -dissolve id copy-fields=name -simplify ${pct} weighted keep-shapes -o /tmp/r_out.json format=topojson quantization=8000`); }
    let out = fs.readFileSync('/tmp/r_out.json', 'utf8');
    fs.writeFileSync(path.join(OUT, cc + '.json'), out);
    const t = JSON.parse(out); const names = t.objects.r.geometries.map(g => [g.properties.id, g.properties.name || g.properties.id]).sort((a, b) => a[1].localeCompare(b[1]));
    index[cc] = names; size[cc] = out.length;
  }
  console.log('\ngrouped by region:', [...BYREG].join(' '));
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index));
  console.log(Object.entries(size).map(([k, v]) => k + ':' + Math.round(v / 1024) + 'k(' + index[k].length + ')').join(' '));
  console.log('total', Math.round(Object.values(size).reduce((a, b) => a + b, 0) / 1024) + 'k');
})();
