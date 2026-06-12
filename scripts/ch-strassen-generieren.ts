// Generator: Strasse (+ Hausnummer) → Gemeinde für gemeinde-mehrdeutige PLZ.
//
// Quelle: swisstopo «Amtliches Verzeichnis der Gebäudeadressen» (amtliche
// Vermessung + GWR; Open Data, täglich aktualisiert) —
//   curl -s -o /tmp/gebadr.zip "https://data.geo.admin.ch/ch.swisstopo.amtliches-gebaeudeadressverzeichnis/amtliches-gebaeudeadressverzeichnis_ch/amtliches-gebaeudeadressverzeichnis_ch_2056.csv.zip"
//   unzip -o -q /tmp/gebadr.zip -d /tmp/gebadr
//
// Adress-Ausbau Stufe 2 (Entscheid David 12.6.2026): die Kachel-Wahl bei
// gemeinde-mehrdeutigen PLZ offline auflösen. Erhebung 12.6.2026: 3.24 Mio
// reale Adressen; 1'213 von 3'177 PLZ mehrdeutig; darin 92'643
// (PLZ, Strasse)-Paare, 98.5 % allein über den Strassennamen
// gemeinde-eindeutig; 1'425 Strassen laufen über eine Gemeindegrenze
// (Hausnummern-Tabelle); 1'388 Einzelnummern existieren doppelt (gleiche
// PLZ + Strasse + Nr. in zwei Gemeinden) und werden ausgelassen — die UI
// fällt dort ehrlich auf die Kachel-Wahl zurück. KEINE Heuristik (§2).
//
// Lauf: npx vite-node scripts/ch-strassen-generieren.ts — deterministisch;
// erzeugt zwei eigene Lazy-Chunks:
//   src/data/plz/strassenVerzeichnis.json  PLZ → { g: [[Gemeinde, Kanton]],
//     s: { Strasse → Index in g } }  (nur gemeinde-eindeutige Strassen)
//   src/data/plz/strassenNummern.json      «PLZ|Strasse» → { Nr → Index }
//     (nur gemeinde-übergreifende Strassen)

import { createReadStream, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const CSV = '/tmp/gebadr/amtliches-gebaeudeadressverzeichnis_ch_2056.csv';

interface Sammel {
  gemeinden: Set<string>;                       // «Name|KT»
  strassen: Map<string, Set<string>>;           // Strasse → Gemeinden
  nummern: Map<string, Map<string, Set<string>>>; // Strasse → Nr → Gemeinden
}
const proPlz = new Map<string, Sammel>();
let real = 0;

const rl = createInterface({ input: createReadStream(CSV, { encoding: 'utf-8' }), crlfDelay: Infinity });
let kopf: string[] | null = null;
let ix: Record<string, number> = {};
for await (const zeileRoh of rl) {
  const zeile = zeileRoh.replace(/^\uFEFF/, '');
  const t = zeile.split(';');
  if (!kopf) {
    kopf = t;
    ix = Object.fromEntries(t.map((n, i) => [n, i]));
    continue;
  }
  if (t[ix.ADR_STATUS] !== 'real') continue;
  const plz = (t[ix.ZIP_LABEL] ?? '').split(' ', 1)[0];
  const strasse = t[ix.STN_LABEL];
  const nummer = t[ix.ADR_NUMBER];
  const gemeinde = `${t[ix.COM_NAME]}|${t[ix.COM_CANTON]}`;
  if (!/^\d{4}$/.test(plz) || !strasse || !t[ix.COM_NAME]) continue;
  real += 1;
  if (!proPlz.has(plz)) proPlz.set(plz, { gemeinden: new Set(), strassen: new Map(), nummern: new Map() });
  const d = proPlz.get(plz)!;
  d.gemeinden.add(gemeinde);
  if (!d.strassen.has(strasse)) d.strassen.set(strasse, new Set());
  d.strassen.get(strasse)!.add(gemeinde);
  if (nummer) {
    if (!d.nummern.has(strasse)) d.nummern.set(strasse, new Map());
    const n = d.nummern.get(strasse)!;
    if (!n.has(nummer)) n.set(nummer, new Set());
    n.get(nummer)!.add(gemeinde);
  }
}
if (real < 3_000_000) throw new Error(`Quell-Plausibilität verletzt: nur ${real} reale Adressen.`);

const verzeichnis: Record<string, { g: [string, string][]; s: Record<string, number> }> = {};
const nummernTab: Record<string, Record<string, number>> = {};
let mehrdeutigePlz = 0, eindeutigeStrassen = 0, grenzStrassen = 0, doppelNummern = 0;
for (const plz of [...proPlz.keys()].sort()) {
  const d = proPlz.get(plz)!;
  if (d.gemeinden.size < 2) continue;
  mehrdeutigePlz += 1;
  const gemeinden = [...d.gemeinden].sort((a, b) => a.localeCompare(b, 'de'));
  const idxVon = new Map(gemeinden.map((g, i) => [g, i]));
  const eintrag: { g: [string, string][]; s: Record<string, number> } = {
    g: gemeinden.map((g) => g.split('|') as [string, string]),
    s: {},
  };
  for (const strasse of [...d.strassen.keys()].sort((a, b) => a.localeCompare(b, 'de'))) {
    const gs = d.strassen.get(strasse)!;
    if (gs.size === 1) {
      eintrag.s[strasse] = idxVon.get([...gs][0])!;
      eindeutigeStrassen += 1;
    } else {
      grenzStrassen += 1;
      const tabelle: Record<string, number> = {};
      // Grenzstrassen ohne Hausnummern existieren (benannte Lokalisationen)
      // — leere Tabelle, die UI bleibt dort bei der Kachel-Wahl.
      for (const [nr, ng] of [...(d.nummern.get(strasse) ?? new Map<string, Set<string>>()).entries()].sort((a, b) => a[0].localeCompare(b[0], 'de', { numeric: true }))) {
        if (ng.size === 1) tabelle[nr] = idxVon.get([...ng][0])!;
        else doppelNummern += 1;
      }
      nummernTab[`${plz}|${strasse}`] = tabelle;
    }
  }
  verzeichnis[plz] = eintrag;
}

writeFileSync('src/data/plz/strassenVerzeichnis.json', JSON.stringify(verzeichnis));
writeFileSync('src/data/plz/strassenNummern.json', JSON.stringify(nummernTab));
console.log(`CH-Strassenindex: ${real} reale Adressen → ${mehrdeutigePlz} mehrdeutige PLZ, ` +
  `${eindeutigeStrassen} gemeinde-eindeutige Strassen, ${grenzStrassen} Grenzstrassen (Nummern-Tabelle), ` +
  `${doppelNummern} Doppel-Nummern ausgelassen.`);
