# Roamd

A free personal travel tracker (a rebuild of the "Been" app). Plain static web app, no build step, no account. Live at https://roamed-amber.vercel.app (Vercel project `roamed`).

## What it does
- **Map that fills in** as you mark countries **Been / Want to go / Lived**. Small countries show as tappable dots; overseas parts that map data glues onto another country (French Guiana, Réunion, Svalbard, Bonaire…) fill only on their own.
- **States and provinces for 213 countries** (Indonesia: all 38 provinces). Marked states show in full color and the rest of the country in a lighter shade. Switches for all states, per region (with "Choose countries") and per country.
- **Cities** (over ~150,000 people plus capitals) and an **airports log** with a small plane on the map.
- **Disputed territories** switch (Somaliland, Northern Cyprus, Abkhazia, Crimea, Kashmir areas and more), never counted in your countries.
- **Plans** by region → country → your own sections, with dates, status, reels/TikToks/YouTube that play inside, photos, checklist and notes.
- **Compare** maps with friends through a link; **stats**; **backup file** with photos; CSV export.
- **Colors**: presets (two color-blind friendly) or your own on a color wheel; light/dark.
- Ironwood-style spotlight **tour** with sample data, and Help with every limitation.

Everything is saved on the device (localStorage + IndexedDB) and works offline after the first load.

## Files
- `index.html`, `app.js`, `sw.js`, `manifest.webmanifest`, icons — the app.
- `vendor/` — d3, topojson-client and the world map (world-atlas 50m).
- `regions/<CC>.json` + `regions/index.json` — states/provinces per country; `cities.json`; `airports.json`; `disputed.json`.
- `tools/` — `app.src.js` (source; `__RAW__` is replaced with `countries.txt` to make `app.js`) and `build_regions.js` (builds `regions/` from Natural Earth admin-1).

## Data and credits
- Countries, states/provinces, cities, disputed areas: [Natural Earth](https://www.naturalearthdata.com/) (public domain), via world-atlas.
- Indonesia's 38 provinces: [geoBoundaries](https://www.geoboundaries.org/) (CC BY 4.0); the four 2022 Papua provinces are built from their regencies.
- Airports: [OurAirports](https://ourairports.com/data/) (public domain).
