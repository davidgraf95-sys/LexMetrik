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
const roh = readFileSync(CSV, 'utf-8').replace(/^\uFEFF/, '');
const zeilen = roh.split('\n').slice(1).filter((z) => z.trim() !== '');
// PLZ-Audit-Fix 6.6.2026 (Befund David, Beispiel 4052): Das CSV führt je
// Zeile den amtlichen ADRESSENANTEIL (Spalte 7 — «Basel 97.713 %» vs.
// «Münchenstein 2.287 %»). Wir übernehmen ihn (gerundet, 1 Dezimale) als
// drittes Tupel-Element, damit die UI Randgebiets-Überlappungen von der
// Hauptgemeinde unterscheiden kann — amtliche Quelle, KEINE Heuristik.
// Bei mehreren Zusatzziffer-Zeilen derselben (PLZ, Gemeinde) zählt der
// höchste Anteil.
// PLZ → eindeutige (Gemeinde, Kanton, AnteilProzent)-Tripel
const proPlz = new Map<string, Map<string, [string, string, number]>>();
for (const z of zeilen) {
  const t = z.split(';');
  const plz = t[1]?.trim();
  const gemeinde = t[4]?.trim();
  const kanton = t[6]?.trim();
  const anteilRoh = Number.parseFloat((t[7] ?? '').replace('%', '').trim());
  if (!/^\d{4}$/.test(plz) || !gemeinde || !/^[A-Z]{2}$/.test(kanton)) continue;
  if (!proPlz.has(plz)) proPlz.set(plz, new Map());
  const key = `${gemeinde}|${kanton}`;
  const anteil = Number.isFinite(anteilRoh) ? Math.round(anteilRoh * 10) / 10 : 0;
  const bisher = proPlz.get(plz)!.get(key);
  if (!bisher || anteil > bisher[2]) proPlz.get(plz)!.set(key, [gemeinde, kanton, anteil]);
}
const plzObj: Record<string, [string, string, number][]> = {};
for (const plz of [...proPlz.keys()].sort()) {
  // Sortierung: höchster Adressenanteil zuerst, dann alphabetisch (stabil).
  plzObj[plz] = [...proPlz.get(plz)!.values()]
    .sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0], 'de'));
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

// ── 3 · AG/SG/TG (+ später FR/ZG/AI/SZ/BL): Gemeinde → Amt ──────────────────
// Quelle: bibliothek/behoerden/schlichtungsaemter-gemeindezuordnung.md
// (amtliche Behördenverzeichnisse, 5.6.2026; URL-Spalte 10.6.2026). Format:
// | Amt | Strasse | PLZ Ort | Gemeinden (kommagetrennt) | URL (optional) |
const zuordnungMd = readFileSync('bibliothek/behoerden/schlichtungsaemter-gemeindezuordnung.md', 'utf-8');
type Amt = { name: string; strasse: string; plzOrt: string; url?: string };
const kantonsDaten: Record<string, { aemter: Amt[]; gemeinden: Record<string, number> }> = {};
let aktuellerKanton: string | null = null;
for (const z of zuordnungMd.split('\n')) {
  // Teil 1: «## 1. Aargau — …» · Teil 2: «## 1. FR — Freiburg: …»
  const kopfTreffer = /^##\s+\d+\.\s+(?:(AG|SG|TG|FR|ZG|AI|SZ|BL|GR|LU|AR|NE|BE|VD)\b|(Aargau|St\. ?Gallen|Thurgau))/.exec(z);
  if (kopfTreffer) {
    aktuellerKanton = kopfTreffer[1]
      ?? ({ Aargau: 'AG', 'St. Gallen': 'SG', 'St.Gallen': 'SG', Thurgau: 'TG' }[kopfTreffer[2] ?? ''] ?? null);
    if (aktuellerKanton && !kantonsDaten[aktuellerKanton]) kantonsDaten[aktuellerKanton] = { aemter: [], gemeinden: {} };
    continue;
  }
  if (!aktuellerKanton || !z.startsWith('|')) continue;
  const t = z.split('|').map((x) => x.trim());
  // Datenzeile: 4 Spalten, keine Kopf-/Trennzeile
  if (t.length < 6 || t[1] === 'Amt' || /^[-: ]+$/.test(t[1])) continue;
  const [, name, strasse, plzOrt, gemeindenRoh, urlRoh] = t;
  if (!/\d{4} /.test(plzOrt)) continue;
  const d = kantonsDaten[aktuellerKanton];
  const idx = d.aemter.length;
  // 5. Spalte (10.6.2026): direkte amtliche Amts-URL — nur https übernehmen.
  const url = urlRoh?.startsWith('https://') ? urlRoh : undefined;
  d.aemter.push(url ? { name, strasse, plzOrt, url } : { name, strasse, plzOrt });
  for (const g of gemeindenRoh.split(',').map((x) => x.trim()).filter(Boolean)) {
    d.gemeinden[g] = idx;
  }
}
// GR: «Regionen»-Spalte → Gemeindelisten aus dem BFS-Verzeichnis
// (Level 2 GR trägt das Präfix «Region », z. B. «Region Prättigau / Davos»).
if (kantonsDaten.GR) {
  const bfsG = readFileSync('/tmp/bfs_gemeinden.csv', 'utf-8').replace(/^\uFEFF/, '').split('\n').map((z) => z.split(','));
  const kopfG = bfsG[0];
  const ixG = (n: string) => kopfG.indexOf(n);
  const byHistG = new Map(bfsG.slice(1).map((r) => [r[ixG('HistoricalCode')], r]));
  const grRegionen = new Map<string, string>(); // HistCode → Regionsname ohne Präfix, normalisiert
  for (const r of bfsG.slice(1)) {
    if (r[ixG('Level')] === '2' && byHistG.get(r[ixG('Parent')])?.[ixG('ShortName')] === 'GR') {
      grRegionen.set(r[ixG('HistoricalCode')], r[ixG('Name')].replace(/^Region /, '').replace(/\s*\/\s*/g, '/'));
    }
  }
  const regionZuIdx = new Map<string, number>();
  for (const [g, i] of Object.entries(kantonsDaten.GR.gemeinden)) {
    regionZuIdx.set(g.replace(/\s*\/\s*/g, '/'), i); // Dossier-Spalte «Regionen»
  }
  const neuGR: Record<string, number> = {};
  for (const r of bfsG.slice(1)) {
    if (r[ixG('Level')] === '3' && grRegionen.has(r[ixG('Parent')])) {
      const idx = regionZuIdx.get(grRegionen.get(r[ixG('Parent')])!);
      if (idx !== undefined) neuGR[r[ixG('Name')]] = idx;
    }
  }
  kantonsDaten.GR.gemeinden = neuGR;
}
writeFileSync('src/data/schlichtung/aemterKantone.json', JSON.stringify(kantonsDaten));
for (const [k, d] of Object.entries(kantonsDaten)) {
  console.log(`${k}: ${d.aemter.length} Ämter, ${Object.keys(d.gemeinden).length} Gemeinde-Einträge.`);
}

// ── 4 · Nachbearbeitung ─────────────────────────────────────────────────────
// SZ/BL: im Dossier ausdrücklich als TEILWEISE OFFEN markiert (SZ JS-Karte
// ohne Datenquelle; BL Kreise K9–K12 + Itingen-Konflikt ungeklärt) →
// BEWUSST nicht generieren; UI behält den ehrlichen Verzeichnis-Fallback.
delete kantonsDaten.SZ;
delete kantonsDaten.BL;
// AI-Präfix + FR über BFS-Bezirke:
// AI: Tabellen-Spalte trägt «Bezirk X» — amtlicher Gemeindename ist X.
if (kantonsDaten.AI) {
  const neu: Record<string, number> = {};
  for (const [g, i] of Object.entries(kantonsDaten.AI.gemeinden)) neu[g.replace(/^Bezirk\s+/, '')] = i;
  kantonsDaten.AI.gemeinden = neu;
}
// FR: «alle Gemeinden Bezirk …» → Gemeindeliste aus dem amtlichen
// BFS-Gemeindeverzeichnis (Snapshot-API agvchapp.bfs.admin.ch, Stand 1.6.2026;
// CSV in /tmp/bfs_gemeinden.csv). Bezirks-Schlüsselwörter fest verdrahtet.
if (kantonsDaten.FR) {
  const bfs = readFileSync('/tmp/bfs_gemeinden.csv', 'utf-8').replace(/^\uFEFF/, '').split('\n').map((z) => z.split(','));
  const kopfZeile = bfs[0];
  const idx = (n: string) => kopfZeile.indexOf(n);
  const byHist = new Map(bfs.slice(1).map((r) => [r[idx('HistoricalCode')], r]));
  const frBezirke = new Map<string, string>();
  for (const r of bfs.slice(1)) {
    if (r[idx('Level')] === '2' && byHist.get(r[idx('Parent')])?.[idx('ShortName')] === 'FR') frBezirke.set(r[idx('HistoricalCode')], r[idx('Name')]);
  }
  const schluessel: [RegExp, string][] = [
    [/Sarine/, 'Saane'], [/Sense/, 'Sense'], [/Gruyère/, 'Greyerz'], [/Lac/, 'See'],
    [/Glâne/, 'Glane'], [/Broye/, 'Broye'], [/Veveyse/, 'Vivisbach'],
  ];
  const amtJeBezirk = new Map<string, number>();
  kantonsDaten.FR.aemter.forEach((a, i) => {
    for (const [, kw] of schluessel) if (a.name.includes(kw)) amtJeBezirk.set(kw, i);
  });
  const gemeinden: Record<string, number> = {};
  for (const r of bfs.slice(1)) {
    if (r[idx('Level')] !== '3') continue;
    const bezirk = frBezirke.get(r[idx('Parent')]);
    if (!bezirk) continue;
    const kw = schluessel.find(([re]) => re.test(bezirk))?.[1];
    const amtIdx = kw !== undefined ? amtJeBezirk.get(kw) : undefined;
    if (amtIdx !== undefined) gemeinden[r[idx('Name')]] = amtIdx;
  }
  kantonsDaten.FR.gemeinden = gemeinden;
}
writeFileSync('src/data/schlichtung/aemterKantone.json', JSON.stringify(kantonsDaten));
console.log('Nachbearbeitung:', Object.entries(kantonsDaten).map(([k, d]) => `${k}=${d.aemter.length}Ä/${Object.keys(d.gemeinden).length}G`).join(' · '));
