// Generator: amtliches PLZ↔Gemeinde-Register + ZH-Friedensrichter-Zuordnung.
//
// Quelle 1 (PLZ): swisstopo «Amtliches Ortschaftenverzeichnis mit PLZ und
// Perimeter» — https://data.geo.admin.ch/ch.swisstopo-vd.ortschaftenverzeichnis_plz/
// ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz_2056.csv.zip
// (CSV nach /tmp/plz_csv/AMTOVZ_CSV_LV95/AMTOVZ_CSV_LV95.csv entpacken).
// Quelle 2 (ZH): bibliothek/behoerden/schlichtungsbehoerden-zh-vollerfassung.md
// (zweifach geprüfte Vollerfassung, vfzh.ch 5.6.2026).
//
// Lauf: npx vite-node scripts/plz-generieren.ts — deterministisch (sortierte
// Ausgabe); erzeugt src/data/plz/plzVerzeichnis.json (Lazy-Chunk) und
// src/data/schlichtung/zhFriedensrichter.json. KEINE Heuristik: Übernommen
// wird ausschliesslich, was Quelle 1/2 ausweisen.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const CSV = '/tmp/plz_csv/AMTOVZ_CSV_LV95/AMTOVZ_CSV_LV95.csv';
const DOSSIER = 'bibliothek/behoerden/schlichtungsbehoerden-zh-vollerfassung.md';

// ── 1 · PLZ-Verzeichnis ─────────────────────────────────────────────────────
const roh = readFileSync(CSV, 'utf-8').replace(/^﻿/, '');
const zeilen = roh.split('\n').slice(1).filter((z) => z.trim() !== '');
// PLZ → eindeutige (Gemeinde, Kanton)-Paare
const proPlz = new Map<string, Map<string, [string, string]>>();
for (const z of zeilen) {
  const t = z.split(';');
  const plz = t[1]?.trim();
  const gemeinde = t[4]?.trim();
  const kanton = t[6]?.trim();
  if (!/^\d{4}$/.test(plz) || !gemeinde || !/^[A-Z]{2}$/.test(kanton)) continue;
  if (!proPlz.has(plz)) proPlz.set(plz, new Map());
  proPlz.get(plz)!.set(`${gemeinde}|${kanton}`, [gemeinde, kanton]);
}
const plzObj: Record<string, [string, string][]> = {};
for (const plz of [...proPlz.keys()].sort()) {
  plzObj[plz] = [...proPlz.get(plz)!.values()].sort((a, b) => a[0].localeCompare(b[0], 'de'));
}
mkdirSync('src/data/plz', { recursive: true });
writeFileSync('src/data/plz/plzVerzeichnis.json', JSON.stringify(plzObj));
console.log(`PLZ-Verzeichnis: ${Object.keys(plzObj).length} Postleitzahlen, ${zeilen.length} Quellzeilen.`);

// ── 2 · ZH: Gebiet → Friedensrichteramt (aus dem Dossier) ───────────────────
const md = readFileSync(DOSSIER, 'utf-8');
const amtZeilen = md.split('\n').filter((z) => /^\|\s*[^|]+\|\s*Friedensrichteramt/.test(z));
const zh: Record<string, { name: string; strasse: string; plzOrt: string }> = {};
// Gebiets-Schreibweisen auf amtliche Gemeindenamen normalisieren (nur fixe,
// belegte Abbildungen — keine Fuzzy-Logik).
const norm = (s: string) => s.trim()
  .replace(/\s*\/\s*Aathal$/, '')           // «Seegräben / Aathal» → Seegräben
  .replace(/\s*\+\s*Flughafen$/, '')        // «Kloten + Flughafen» → Kloten
  .replace(/ Glattbrugg$/, '')              // «Opfikon Glattbrugg» → Opfikon
  .replace(/^Wald ZH$/, 'Wald (ZH)')
  .replace(/^Pfäffikon ZH$/, 'Pfäffikon (ZH)')
  .replace(/^Rüti$/, 'Rüti (ZH)')
  .replace(/^Buchs$/, 'Buchs (ZH)')
  .replace(/^Erlenbach$/, 'Erlenbach (ZH)')
  .replace(/^Gossau$/, 'Gossau (ZH)')
  .replace(/^Kilchberg-Rüschlikon$/, 'Kilchberg (ZH)')
  .replace(/^Rüschlikon \(Kilchberg-Rüschlikon\)$/, 'Rüschlikon')
  .replace(/^Oetwil a\.d\. Limmat$/, 'Oetwil an der Limmat')
  .replace(/^Wangen-Brüttisellen$/, 'Wangen-Brüttisellen');
for (const z of amtZeilen) {
  const t = z.split('|').map((x) => x.trim());
  // | Gebiet | Name | Strasse | PLZ Ort |
  const gebiet = t[1]; const name = t[2]; const strasse = t[3]; const plzOrt = t[4];
  if (!gebiet || !name || !strasse || !plzOrt) continue;
  zh[norm(gebiet)] = { name, strasse, plzOrt };
}
// Stadt Zürich: sechs Kreis-Ämter — Gemeinde «Zürich» ist NICHT eindeutig
// (Stadtkreis massgeblich); als Sonderschlüssel ablegen.
const kreisZeilen = md.split('\n').filter((z) => /^\|\s*Zürich Kreise/.test(z));
const zuerich: { name: string; strasse: string; plzOrt: string; kreise: string }[] = [];
for (const z of kreisZeilen) {
  const t = z.split('|').map((x) => x.trim());
  zuerich.push({ kreise: t[1].replace('Zürich ', ''), name: t[2], strasse: t[3], plzOrt: t[4] });
}
mkdirSync('src/data/schlichtung', { recursive: true });
writeFileSync('src/data/schlichtung/zhFriedensrichter.json',
  JSON.stringify({ gemeinden: zh, zuerichKreise: zuerich }));
console.log(`ZH-Zuordnung: ${Object.keys(zh).length} Gemeinde-Einträge + ${zuerich.length} Stadt-Kreis-Ämter.`);
