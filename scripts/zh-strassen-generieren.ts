// Generator: Stadt Zürich Strasse (+ Hausnummer) → Stadtkreis (zhStrassen.json).
//
// Quelle: «Adressen Stadt Zürich» (amtliche Gebäudeadressen, identisch zu
// zh-kreise-generieren.ts) — Abruf als WFS:
//   curl -s "https://www.ogd.stadt-zuerich.ch/wfs/geoportal/Adressen_Stadt_Zuerich?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=adrstzh_adressen_stzh_p&OUTPUTFORMAT=GeoJSON&PROPERTYNAME=lokalisationsname,hausnummer,stadtkreis,status_txt" \
//     -o /tmp/zh_strassen_stzh.geojson
//
// Adress-Ausbau Stufe 1 (Entscheid David 12.6.2026): Strassen-genaue
// Kreis-Auflösung OHNE externen Request. Erhebung 12.6.2026: 1'984
// Strassen/Lokalisationen, davon 94 kreis-übergreifend und 58
// AMTS-übergreifend (Ämter-Paarung 1+2 · 3+9 · 4+5 · 6+10 · 7+8 · 11+12)
// — nur diese 58 brauchen die Hausnummer. KEINE Heuristik (§2):
// Vollauszählung der realen Adressen; Hausnummern wörtlich (inkl.
// Buchstaben-Suffixe «12a»).
//
// Lauf: npx vite-node scripts/zh-strassen-generieren.ts — deterministisch;
// erzeugt src/data/schlichtung/zhStrassen.json (eigener Lazy-Chunk):
//   strassen: Strasse → [Kreise] (Adresszahl absteigend, dann Kreisnummer)
//   nummern:  Strasse → Hausnummer → Kreis (NUR amts-übergreifende Strassen)

import { readFileSync, writeFileSync } from 'node:fs';

const QUELLE = '/tmp/zh_strassen_stzh.geojson';
const ZIEL = 'src/data/schlichtung/zhStrassen.json';

// Ämter-Paarung wie in zhFriedensrichter.json (zuerichKreise) — fest, damit
// der Generator ohne die JSON-Reihenfolge auskommt; der Integritäts-Test
// in schlichtungsstellen.test.ts hält beide synchron.
const AMT: Record<string, string> = {
  '1': '1+2', '2': '1+2', '3': '3+9', '9': '3+9', '4': '4+5', '5': '4+5',
  '6': '6+10', '10': '6+10', '7': '7+8', '8': '7+8', '11': '11+12', '12': '11+12',
};

interface Feature { properties: { lokalisationsname: string | null; hausnummer: string | null; stadtkreis: string | null; status_txt: string | null } }
const geo = JSON.parse(readFileSync(QUELLE, 'utf-8')) as { features: Feature[] };

const proStrasse = new Map<string, Map<string, number>>(); // Strasse → Kreis → Adresszahl
const proNummer = new Map<string, Map<string, Set<string>>>(); // Strasse → Nr → Kreise
let real = 0;
for (const f of geo.features) {
  const { lokalisationsname: strasse, hausnummer, stadtkreis, status_txt } = f.properties;
  if (status_txt !== 'real' || !strasse || !stadtkreis) continue;
  if (!(stadtkreis in AMT)) throw new Error(`Unbekannter Stadtkreis: ${stadtkreis}`);
  real += 1;
  if (!proStrasse.has(strasse)) proStrasse.set(strasse, new Map());
  const m = proStrasse.get(strasse)!;
  m.set(stadtkreis, (m.get(stadtkreis) ?? 0) + 1);
  if (hausnummer) {
    if (!proNummer.has(strasse)) proNummer.set(strasse, new Map());
    const n = proNummer.get(strasse)!;
    if (!n.has(hausnummer)) n.set(hausnummer, new Set());
    n.get(hausnummer)!.add(stadtkreis);
  }
}
if (real < 50_000) throw new Error(`Quell-Plausibilität verletzt: nur ${real} reale Adressen.`);

const strassen: Record<string, string[]> = {};
const nummern: Record<string, Record<string, string>> = {};
let amtsUebergreifend = 0;
let nummernKonflikte = 0;
for (const s of [...proStrasse.keys()].sort((a, b) => a.localeCompare(b, 'de'))) {
  const kreise = [...proStrasse.get(s)!.entries()]
    .sort((a, b) => b[1] - a[1] || Number(a[0]) - Number(b[0]))
    .map(([k]) => k);
  strassen[s] = kreise;
  if (new Set(kreise.map((k) => AMT[k])).size > 1) {
    amtsUebergreifend += 1;
    const eintraege: Record<string, string> = {};
    for (const [nr, ks] of [...proNummer.get(s)!.entries()].sort((a, b) => a[0].localeCompare(b[0], 'de', { numeric: true }))) {
      if (ks.size === 1) eintraege[nr] = [...ks][0];
      // Dieselbe Hausnummer in zwei Kreisen (Vermessungs-Doppel): weglassen
      // — die Auflösung fällt dann ehrlich auf die Amts-Wahl zurück.
      else nummernKonflikte += 1;
    }
    nummern[s] = eintraege;
  }
}

writeFileSync(ZIEL, JSON.stringify({ strassen, nummern }));
console.log(`zhStrassen: ${Object.keys(strassen).length} Strassen aus ${real} realen Adressen; ` +
  `${amtsUebergreifend} amts-übergreifend (Hausnummern-Tabelle), ${nummernKonflikte} Nummern-Konflikte ausgelassen.`);
