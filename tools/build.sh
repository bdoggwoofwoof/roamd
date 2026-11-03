#!/bin/sh
# Make app.js from tools/app.src.js: put the country list (tools/countries.txt) in place of __RAW__.
cd "$(dirname "$0")/.." && python3 -c "
s=open('tools/app.src.js').read();r=open('tools/countries.txt').read().strip()
assert s.count('\"__RAW__\"')==1
open('app.js','w').write(s.replace('\"__RAW__\"','\"'+r+'\"'))"
