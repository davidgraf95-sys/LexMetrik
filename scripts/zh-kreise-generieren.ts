// Generator: Stadt Zürich PLZ → Stadtkreis-Anteile (zuerichPlzKreise).
//
// Quelle: «Adressen Stadt Zürich» (amtliche Gebäudeadressen aus der
// amtlichen Vermessung, ergänzt um PLZ und Stadtkreis) — Open-Data-Portal
// der Stadt Zürich, Datensatz geo_adressen_stadt_zuerich. Abruf als WFS:
//   curl -s "https://www.ogd.stadt-zuerich.ch/wfs/geoportal/Adressen_Stadt_Zuerich?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=adrstzh_adressen_stzh_p&OUTPUTFORMAT=GeoJSON&PROPERTYNAME=plz,stadtkreis,status_txt,adresse_art" \
//     -o /tmp/zh_adressen_stzh.geojson
//
// Befund 12.6.2026 (Verifikationsauftrag David 11.6.): Stadt-Zürcher PLZ
// sind NICHT kreisscharf — 16 von 30 PLZ mit realen Stadt-Adressen
// überlappen mehrere Kreise.
// Darum wird je PLZ der amtliche ADRESSENANTEIL pro Stadtkreis mitgeführt
// (analog swisstopo-Anteil in plzVerzeichnis.json, §2: keine Heuristik,
// vollständige Auszählung aller realen Gebäudeadressen). Nur status «real»
// (projektierte Adressen ausgenommen).
//
// Lauf: npx vite-node scripts/zh-kreise-generieren.ts — deterministisch;
// patcht den Schlüssel zuerichPlzKreise in
// src/data/schlichtung/zhFriedensrichter.json (gemeinden/zuerichKreise
// bleiben byte-gleich; plz-generieren.ts trägt den Schlüssel bei einem
// Voll-Regen weiter).

import { readFileSync, writeFileSync } from 'node:fs';

const QUELLE = '/tmp/zh_adressen_stzh.geojson';
const ZIEL = 'src/data/schlichtung/zhFriedensrichter.json';

interface Feature { properties: { plz: number | null; stadtkreis: string | null; status_txt: string | null } }
const geo = JSON.parse(readFileSync(QUELLE, 'utf-8')) as { features: Feature[] };

const proPlz = new Map<string, Map<string, number>>();
let real = 0;
for (const f of geo.features) {
  const { plz, stadtkreis, status_txt } = f.properties;
  if (status_txt !== 'real' || plz == null || !stadtkreis) continue;
  real += 1;
  const p = String(Math.trunc(plz));
  if (!/^\d{4}$/.test(p) || !/^\d{1,2}$/.test(stadtkreis)) throw new Error(`Unerwartete Quellzeile: plz=${plz} kreis=${stadtkreis}`);
  if (!proPlz.has(p)) proPlz.set(p, new Map());
  const m = proPlz.get(p)!;
  m.set(stadtkreis, (m.get(stadtkreis) ?? 0) + 1);
}
if (real < 50_000) throw new Error(`Quell-Plausibilität verletzt: nur ${real} reale Adressen (erwartet > 50'000).`);

// PLZ → [Stadtkreis, AnteilProzent][] — Anteil an den realen Adressen der
// PLZ, gerundet auf 1 Dezimale; Sortierung: grösster Anteil zuerst, dann
// Kreisnummer (stabil, deterministisch).
const plzKreise: Record<string, [string, number][]> = {};
for (const p of [...proPlz.keys()].sort()) {
  const m = proPlz.get(p)!;
  const total = [...m.values()].reduce((a, b) => a + b, 0);
  plzKreise[p] = [...m.entries()]
    .sort((a, b) => b[1] - a[1] || Number(a[0]) - Number(b[0]))
    .map(([kreis, n]) => [kreis, Math.round((n / total) * 1000) / 10]);
}

const json = JSON.parse(readFileSync(ZIEL, 'utf-8')) as Record<string, unknown>;
writeFileSync(ZIEL, JSON.stringify({
  gemeinden: json.gemeinden,
  zuerichKreise: json.zuerichKreise,
  zuerichPlzKreise: plzKreise,
}));
console.log(`zuerichPlzKreise: ${Object.keys(plzKreise).length} PLZ aus ${real} realen Gebäudeadressen.`);
const mehrkreisig = Object.entries(plzKreise).filter(([, k]) => k.length > 1);
console.log(`Davon mehrkreisig: ${mehrkreisig.length} (${mehrkreisig.map(([p]) => p).join(', ')})`);
