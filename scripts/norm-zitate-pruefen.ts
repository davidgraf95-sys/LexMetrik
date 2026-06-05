// ─── Norm-Zitate-Prüfer: jedes Art.-Zitat der Engines gegen die Caches ──────
// (Anordnung David 6.6.2026: «doppelt überprüfen ob richtige normen verwendet
// wurden».) Deterministische Stufe: Existenz des Artikels + des zitierten
// Absatzes/der Litera im Cache-HTML. Die INHALTLICHE Stützung prüft der
// adversariale Zweitdurchgang (Agent).
//   Aufruf: npx vite-node scripts/norm-zitate-pruefen.ts
import { readFileSync } from 'node:fs';

const QUELLEN = [
  'src/lib/zustaendigkeit.ts',
  'src/lib/schkgZustaendigkeit.ts',
  'src/lib/strafZustaendigkeit.ts',
  'src/lib/zustaendigkeitFahrplan.ts',
  'src/lib/vorlagen/klageVereinfacht.ts',
  'src/data/zustaendigkeitKosten.ts',
];
const CACHES: Record<string, string> = {
  ZPO: '/tmp/zpo.html', SchKG: '/tmp/schkg.html', StPO: '/tmp/stpo.html',
  BGG: '/tmp/bgg.html', StGB: '/tmp/stgb.html', ZGB: '/tmp/zgb.html', OR: '/tmp/or.html',
};
const html: Record<string, string> = {};
for (const [g, p] of Object.entries(CACHES)) {
  try { html[g] = readFileSync(p, 'utf-8'); } catch { console.log(`⚠ Cache fehlt: ${g} (${p})`); }
}
const artText = (gesetz: string, nr: string): string | null => {
  const h = html[gesetz];
  if (!h) return null;
  const anker = `art_${nr.replace(/([a-z]+)$/, '_$1')}`;
  const m = h.match(new RegExp(`<article id="${anker}">([\\s\\S]*?)</article>`))
    ?? h.match(new RegExp(`<article id="art_${nr}">([\\s\\S]*?)</article>`));
  return m ? m[1].replace(/<[^>]+>/g, ' ') : null;
};

// Zitate einsammeln: «Art. 74 Abs. 2 lit. b BGG», «Art. 198 lit. e Ziff. 3 ZPO» …
const RX = /Art\.\s*(\d+[a-z]*)\s*(?:Abs\.\s*(\d+)\s*)?(?:lit\.\s*([a-z]+(?:bis|ter)?)\s*)?(?:Ziff\.\s*(\d+)\s*)?(ZPO|SchKG|StPO|BGG|StGB|ZGB|OR)\b/g;
let total = 0, fehler = 0;
const gesehen = new Set<string>();
for (const q of QUELLEN) {
  const src = readFileSync(q, 'utf-8');
  for (const m of src.matchAll(RX)) {
    const [voll, nr, abs, lit, ziff, gesetz] = m;
    const id = `${q}::${voll}`;
    if (gesehen.has(id)) continue;
    gesehen.add(id); total++;
    const t = artText(gesetz, nr);
    if (t === null) {
      if (html[gesetz]) { console.log(`✗ FEHLT     ${voll}  (${q}) — Artikel nicht im Cache`); fehler++; }
      continue;
    }
    if (abs) {
      // Absatz-Marker: «<sup>N</sup>» wird zu « N »-Ziffer am Satzanfang
      const absOk = new RegExp(`(^|\\s)${abs}\\s`).test(t) || t.includes(`Abs. ${abs}`);
      if (!absOk) { console.log(`✗ ABS?      ${voll}  (${q}) — Abs. ${abs} nicht erkennbar`); fehler++; continue; }
    }
    if (lit) {
      // bis/ter-Literae stehen im HTML hochgestellt («a<sup>bis</sup>.» → «a bis .»)
      const litMuster = lit.replace(/(bis|ter)$/, '\\s*$1');
      const litOk = new RegExp(`(^|\\s)${litMuster}\\s*\\.\\s`).test(t);
      if (!litOk) { console.log(`✗ LIT?      ${voll}  (${q}) — lit. ${lit} nicht erkennbar`); fehler++; continue; }
    }
    if (ziff) {
      const zOk = new RegExp(`(^|\\s)${ziff}\\.\\s`).test(t);
      if (!zOk) { console.log(`✗ ZIFF?     ${voll}  (${q}) — Ziff. ${ziff} nicht erkennbar`); fehler++; continue; }
    }
  }
}
console.log(`\n${total} eindeutige Zitate geprüft · ${fehler} Befunde`);
