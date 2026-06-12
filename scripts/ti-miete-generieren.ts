// Patch-Generator: TI_MIETE in aemterKantone.json (Sektion 51 des Dossiers).
//
// Quelle: bibliothek/behoerden/schlichtungsaemter-gemeindezuordnung.md,
// Sektion «## 51. TI-MIETE — …» (amtliche Località-Suche locazione,
// Vollerhebung 12.6.2026; Rechtsgrundlage Art. 5 LALoc RL/TI 3.3.2.1.4).
//
// Warum ein Patch-Skript: der Voll-Generator plz-generieren.ts braucht die
// /tmp-Quelldateien (swisstopo-CSV, BFS-CSV) — für den TI-MIETE-Nachtrag
// genügt das Dossier. Das Zeilenformat ist IDENTISCH mit dem Voll-Generator
// (| Amt | Strasse | PLZ Ort | Gemeinden | URL |), die Sektion trägt den
// «TI-MIETE»-Kopf — ein künftiger Voll-Regen erzeugt denselben Stand.
// Drei amts-mehrdeutige Gemeinden (Lugano/Bellinzona/Val Mara) stehen
// bewusst in KEINER Gemeinden-Spalte — sie laufen über die Ortsteil-Wahl
// (TI_MIETE_MEHRDEUTIG in tiAmt.ts).
//
// Lauf: npx vite-node scripts/ti-miete-generieren.ts — deterministisch;
// ersetzt NUR den Schlüssel TI_MIETE.

import { readFileSync, writeFileSync } from 'node:fs';

const DOSSIER = 'bibliothek/behoerden/schlichtungsaemter-gemeindezuordnung.md';
const ZIEL = 'src/data/schlichtung/aemterKantone.json';

const md = readFileSync(DOSSIER, 'utf-8');
type Amt = { name: string; strasse: string; plzOrt: string; url?: string };
const daten: { aemter: Amt[]; gemeinden: Record<string, number> } = { aemter: [], gemeinden: {} };
let aktiv = false;
for (const z of md.split('\n')) {
  if (/^##\s+\d+\.\s+TI-MIETE\b/.test(z)) { aktiv = true; continue; }
  if (/^##\s/.test(z)) { aktiv = false; continue; }
  if (!aktiv || !z.startsWith('|')) continue;
  const t = z.split('|').map((x) => x.trim());
  if (t.length < 6 || t[1] === 'Amt' || /^[-: ]+$/.test(t[1])) continue;
  const [, name, strasse, plzOrt, gemeindenRoh, urlRoh] = t;
  if (!/\d{4} /.test(plzOrt)) continue;
  const idx = daten.aemter.length;
  const url = urlRoh?.startsWith('https://') ? urlRoh : undefined;
  daten.aemter.push(url ? { name, strasse, plzOrt, url } : { name, strasse, plzOrt });
  for (const g of gemeindenRoh.split(',').map((x) => x.trim()).filter(Boolean)) {
    daten.gemeinden[g] = idx;
  }
}
if (daten.aemter.length !== 11) throw new Error(`Erwartet 11 Uffici, gefunden ${daten.aemter.length}.`);
if (Object.keys(daten.gemeinden).length !== 97) throw new Error(`Erwartet 97 eindeutige Gemeinden, gefunden ${Object.keys(daten.gemeinden).length}.`);

const json = JSON.parse(readFileSync(ZIEL, 'utf-8')) as Record<string, unknown>;
json.TI_MIETE = daten;
writeFileSync(ZIEL, JSON.stringify(json));
console.log(`TI_MIETE: ${daten.aemter.length} Uffici, ${Object.keys(daten.gemeinden).length} Gemeinde-Einträge.`);
