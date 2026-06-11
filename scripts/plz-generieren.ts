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
  const kopfTreffer = /^##\s+\d+\.\s+(?:(AG|SG|TG|FR|ZG|AI|SZ|BL|GR|LU|AR|NE|BE|VD|TI|SO)\b|(Aargau|St\. ?Gallen|Thurgau))/.exec(z);
  if (kopfTreffer) {
    aktuellerKanton = kopfTreffer[1]
      ?? ({ Aargau: 'AG', 'St. Gallen': 'SG', 'St.Gallen': 'SG', Thurgau: 'TG' }[kopfTreffer[2] ?? ''] ?? null);
    if (aktuellerKanton && !kantonsDaten[aktuellerKanton]) kantonsDaten[aktuellerKanton] = { aemter: [], gemeinden: {} };
    continue;
  }
  // Härtung 11.6.2026 (Folge-Befund zu Bug B1 vom 10.6.): JEDER andere
  // «## »-Kopf beendet die aktive Kantons-Sektion. Ohne den Reset hingen
  // die ALT-Sektionen (Teil 2: «## ALT … SZ/BL» nach «## 3. AI») weiter an
  // der zuletzt matchenden Sektion — der nächste Lauf hätte AI still um
  // 20 fremde Ämter + 103 fremde Gemeinde-Schlüssel erweitert (empirisch
  // belegt via /tmp-Trockenlauf gegen den committeten Stand).
  if (/^##\s/.test(z)) { aktuellerKanton = null; continue; }
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
// BE: «Verwaltungskreise»-Spalte → Gemeindelisten aus dem BFS-Verzeichnis
// (Level 2 BE; Berner Jura bei BFS französisch «Arrondissement administratif
// Jura bernois» — Match über Namens-Suffix). Verdrahtet 10.6.2026.
if (kantonsDaten.BE) {
  const bfsB = readFileSync('/tmp/bfs_gemeinden.csv', 'utf-8').replace(/^\uFEFF/, '').split('\n').map((z) => z.split(','));
  const kopfB = bfsB[0];
  const ixB = (n: string) => kopfB.indexOf(n);
  const beHist = bfsB.slice(1).find((r) => r[ixB('Level')] === '1' && r[ixB('ShortName')] === 'BE')?.[ixB('HistoricalCode')];
  const kreisName = new Map<string, string>();
  for (const r of bfsB.slice(1)) {
    if (r[ixB('Level')] === '2' && r[ixB('Parent')] === beHist && !r[ixB('ValidTo')]) {
      kreisName.set(r[ixB('HistoricalCode')], r[ixB('Name')].replace(/^Verwaltungskreis /, '').replace(/^Arrondissement administratif /, ''));
    }
  }
  const beD = kantonsDaten.BE;
  const kreisZuIdx = new Map<string, number>();
  // Die Dossier-Spalte «Verwaltungskreise» wurde beim Tabellen-Parse als
  // gemeinden-Liste eingelesen → in Kreis-Zuordnung umdeuten.
  for (const [kreis, idx] of Object.entries(beD.gemeinden)) kreisZuIdx.set(kreis, idx);
  beD.gemeinden = {};
  for (const r of bfsB.slice(1)) {
    if (r[ixB('Level')] === '3' && kreisName.has(r[ixB('Parent')]) && !r[ixB('ValidTo')]) {
      const k = kreisName.get(r[ixB('Parent')])!;
      const idx = kreisZuIdx.get(k);
      if (idx !== undefined) beD.gemeinden[r[ixB('Name')]] = idx;
    }
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

// SZ/BL werden seit 10.6.2026 regulär generiert (Sektionen 35/36 des
// Dossiers — Alt-Sektionen sind parser-unsichtbar markiert).
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
// SO: «Bezirke»-Spalte → Gemeindelisten aus dem BFS-Verzeichnis (Level 2
// SO trägt das Präfix «Bezirk », z. B. «Bezirk Gäu»). Verdrahtet 11.6.2026;
// die Richterämter decken je zwei Bezirke (Amtei, Art. 43 KV SO).
if (kantonsDaten.SO) {
  const bfsS = readFileSync('/tmp/bfs_gemeinden.csv', 'utf-8').replace(/^\uFEFF/, '').split('\n').map((z) => z.split(','));
  const kopfS = bfsS[0];
  const ixS = (n: string) => kopfS.indexOf(n);
  const byHistS = new Map(bfsS.slice(1).map((r) => [r[ixS('HistoricalCode')], r]));
  const bezirkName = new Map<string, string>();
  for (const r of bfsS.slice(1)) {
    if (r[ixS('Level')] === '2' && byHistS.get(r[ixS('Parent')])?.[ixS('ShortName')] === 'SO' && !r[ixS('ValidTo')]) {
      bezirkName.set(r[ixS('HistoricalCode')], r[ixS('Name')].replace(/^Bezirk /, ''));
    }
  }
  const bezZuIdx = new Map<string, number>();
  for (const [b, i] of Object.entries(kantonsDaten.SO.gemeinden)) bezZuIdx.set(b, i);
  const neuSO: Record<string, number> = {};
  for (const r of bfsS.slice(1)) {
    if (r[ixS('Level')] === '3' && bezirkName.has(r[ixS('Parent')]) && !r[ixS('ValidTo')]) {
      const idx = bezZuIdx.get(bezirkName.get(r[ixS('Parent')])!);
      if (idx !== undefined) neuSO[r[ixS('Name')]] = idx;
    }
  }
  kantonsDaten.SO.gemeinden = neuSO;
}
// VD: «Districts»-Spalte → Gemeindelisten aus dem BFS-Verzeichnis (Level 2
// VD trägt Präfixe «District de/du/de la/de l'/d'» — Match nach Präfix-
// Abwurf; Apostrophe ASCII wie typografisch normalisiert). Verdrahtet
// 11.6.2026; die JdP «Jura-Nord vaudois/Gros-de-Vaud» deckt ZWEI Districts.
if (kantonsDaten.VD) {
  const bfsV = readFileSync('/tmp/bfs_gemeinden.csv', 'utf-8').replace(/^\uFEFF/, '').split('\n').map((z) => z.split(','));
  const kopfV = bfsV[0];
  const ixV = (n: string) => kopfV.indexOf(n);
  const byHistV = new Map(bfsV.slice(1).map((r) => [r[ixV('HistoricalCode')], r]));
  const normApostroph = (s: string) => s.replace(/’/g, "'");
  const distriktName = new Map<string, string>(); // HistCode → Kurzname
  for (const r of bfsV.slice(1)) {
    if (r[ixV('Level')] === '2' && byHistV.get(r[ixV('Parent')])?.[ixV('ShortName')] === 'VD' && !r[ixV('ValidTo')]) {
      distriktName.set(r[ixV('HistoricalCode')],
        normApostroph(r[ixV('Name')]).replace(/^District (?:de la |de l'|du |de |d')/, '').trim());
    }
  }
  const distZuIdx = new Map<string, number>();
  for (const [d, i] of Object.entries(kantonsDaten.VD.gemeinden)) distZuIdx.set(normApostroph(d), i);
  const neuVD: Record<string, number> = {};
  for (const r of bfsV.slice(1)) {
    if (r[ixV('Level')] === '3' && distriktName.has(r[ixV('Parent')]) && !r[ixV('ValidTo')]) {
      const idx = distZuIdx.get(distriktName.get(r[ixV('Parent')])!);
      if (idx !== undefined) neuVD[r[ixV('Name')]] = idx;
    }
  }
  kantonsDaten.VD.gemeinden = neuVD;
}
writeFileSync('src/data/schlichtung/aemterKantone.json', JSON.stringify(kantonsDaten));
console.log('Nachbearbeitung:', Object.entries(kantonsDaten).map(([k, d]) => `${k}=${d.aemter.length}Ä/${Object.keys(d.gemeinden).length}G`).join(' · '));
