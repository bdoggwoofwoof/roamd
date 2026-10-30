# Roamd

A free personal travel tracker (a rebuild of the "Been" app). Plain static web app, no build step, no account. Live at https://roamed-amber.vercel.app (Vercel project `roamed`).

## What it does
- **Map that fills in** as you mark countries **Been / Want to go / Lived / Drove through** (Drove through has its own color and counts only if you turn that on). Small countries show as tappable dots; overseas parts that map data glues onto another country (French Guiana, Réunion, Svalbard, Bonaire…) fill only on their own.
- **States and provinces for 213 countries** (Indonesia: all 38 provinces). Marked states show in full color and the rest of the country in a lighter shade. Switches for all states, per region (with "Choose countries") and per country.
- **Cities** (over ~150,000 people plus capitals) and an **airports log** with a small plane on the map.
- **Visits with dates** per country, a **timeline** by year with a map replay, days away and countries per year.
- **Flights**: add flights or import a CSV from Flighty, OpenFlights or myFlightradar24; routes drawn as arcs; distance, longest flight, top airports, routes and airlines.
- **Tick-off lists**: 1,273 UNESCO World Heritage sites, world capitals, New 7 Wonders, 63 US national parks, each with % done and optional map markers.
- **Counting options**: UK nations as four countries, count territories, count Drove through; home country in its own color.
- **Badges**, a **share picture** (post or story), **add places from photo locations** (read on the device), a reusable **packing list**, and **full-screen maps**.
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
- `lists.json` (tick-off lists), `vendor/exifr.lite.umd.js` (reads photo locations).
- `tools/` — `app.src.js` (source; `__RAW__` is replaced with `countries.txt` to make `app.js`), `build_regions.js` + `postprocess.py` (build `regions/` from Natural Earth admin-1), `build_lists.js` + `parks63.txt` (build `lists.json`).

## Data and credits
- Countries, states/provinces, cities, disputed areas: [Natural Earth](https://www.naturalearthdata.com/) (public domain), via world-atlas.
- Indonesia's 38 provinces: [geoBoundaries](https://www.geoboundaries.org/) (CC BY 4.0); the four 2022 Papua provinces are built from their regencies.
- Airports: [OurAirports](https://ourairports.com/data/) (public domain).
- UNESCO World Heritage sites: UNESCO's list via the open snapshot in `@worldwideview/wwv-plugin-unesco-sites` (August 2026). US national parks: Wikipedia's list, checked against Natural Earth. Photo reading: [exifr](https://github.com/MikeKovarik/exifr) (MIT).
