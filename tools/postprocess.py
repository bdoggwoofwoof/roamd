# Tidies region names after build_regions.js, restores Indonesia's 38 provinces and writes regions/index.json.
import json,re,glob,shutil,os,sys
from collections import Counter
R=os.path.join(os.path.dirname(__file__),'..','site','regions')
if os.path.exists('/tmp/ID38.json'):shutil.copy('/tmp/ID38.json',os.path.join(R,'ID.json'))
SUF=re.compile(r' (Prefecture|Province|Region|Oblast|Governorate|County|State|Department|Voivodeship|District|Municipality)$')
def clean(n): return n if n in('Tokyo',) or n.endswith('(Kurdistan Region)') else SUF.sub('',n)
idx={}
for fn in sorted(glob.glob(os.path.join(R,'[A-Z][A-Z].json'))):
    cc=os.path.basename(fn)[:2];t=json.load(open(fn));G=t['objects']['r']['geometries']
    for g in G:p=g['properties'];p['name']=clean(p.get('name') or p['id'])
    if cc=='RU':
        for g in G:
            if g['properties']['id']=='RU-ALT':g['properties']['name']='Altai Krai'
            if g['properties']['id']=='RU-AL':g['properties']['name']='Altai Republic'
    c=Counter(g['properties']['name'] for g in G)
    for g in G:
        p=g['properties']
        if c[p['name']]>1:p['name']+=' ('+p['id'].split('-',1)[-1]+')'
    json.dump(t,open(fn,'w'),separators=(',',':'),ensure_ascii=False)
    idx[cc]=sorted([[g['properties']['id'],g['properties']['name']] for g in G],key=lambda x:x[1])
json.dump(idx,open(os.path.join(R,'index.json'),'w'),separators=(',',':'),ensure_ascii=False)
print(len(idx),'countries')
