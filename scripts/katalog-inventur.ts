// ─── Metadaten-Inventur des Katalogs (Fahrplan Katalog-UI, Etappe 0.2) ──────
//
// Reine Diagnose, keine Änderung: Welche Karten haben keine keywords/related,
// welche konsolidierten Rechner keine szenarien? Auffindbarkeits-Lücken sind
// Daten-Lücken (§5: alles in startseiteConfig.ts).
//
// Aufruf: npx vite-node scripts/katalog-inventur.ts

import { ALLE_KARTEN, istVerfuegbar } from '../src/lib/startseiteConfig';

const verfuegbar = ALLE_KARTEN.filter(istVerfuegbar);
const geplant = ALLE_KARTEN.filter((k) => !istVerfuegbar(k));

const ohneKeywords = (xs: typeof ALLE_KARTEN) => xs.filter((k) => !k.keywords || k.keywords.length === 0);
const ohneRelated = (xs: typeof ALLE_KARTEN) => xs.filter((k) => !k.related || k.related.length === 0);

console.log(`Katalog gesamt: ${ALLE_KARTEN.length} · verfügbar: ${verfuegbar.length} · geplant: ${geplant.length}\n`);

console.log(`── VERFÜGBAR ohne keywords (${ohneKeywords(verfuegbar).length}) — Suche trifft nur Titel/Gebiet/Normen:`);
ohneKeywords(verfuegbar).forEach((k) => console.log(`   ${k.id}  (${k.rechtsgebiet} · ${k.title})`));

console.log(`\n── VERFÜGBAR ohne related (${ohneRelated(verfuegbar).length}) — kein Querverweis auf der Karte:`);
ohneRelated(verfuegbar).forEach((k) => console.log(`   ${k.id}  (${k.rechtsgebiet} · ${k.title})`));

// related-Hygiene: Verweise auf unbekannte IDs (defensiv gefiltert in der UI,
// aber ein Pflege-Fehler) und Einbahn-Verweise (A→B ohne B→A; nur Hinweis).
const ids = new Set(ALLE_KARTEN.map((k) => k.id));
const kaputt = ALLE_KARTEN.flatMap((k) => (k.related ?? []).filter((r) => !ids.has(r)).map((r) => `${k.id} → ${r}`));
console.log(`\n── related auf unbekannte IDs (${kaputt.length}):`);
kaputt.forEach((x) => console.log(`   ${x}`));
const einbahn = ALLE_KARTEN.flatMap((k) =>
  (k.related ?? [])
    .filter((r) => ids.has(r) && !(ALLE_KARTEN.find((x) => x.id === r)?.related ?? []).includes(k.id))
    .map((r) => `${k.id} → ${r}`));
console.log(`\n── related-Einbahnen, Hinweis (${einbahn.length}):`);
einbahn.forEach((x) => console.log(`   ${x}`));

console.log(`\n── Verfügbare RECHNER ohne szenarien (${verfuegbar.filter((k) => k.modus === 'rechner' && (!('szenarien' in k) || !k.szenarien || k.szenarien.length === 0)).length}) — nur relevant für konsolidierte Karten:`);
verfuegbar.filter((k) => k.modus === 'rechner' && (!('szenarien' in k) || !k.szenarien || k.szenarien.length === 0))
  .forEach((k) => console.log(`   ${k.id}  (${k.title})`));

// GEPLANTE Karten: keywords sind dort zweitrangig (kein href), aber die Suche
// findet sie im Katalog-Tab — nur Zähler, keine Liste.
console.log(`\nGeplant ohne keywords: ${ohneKeywords(geplant).length} von ${geplant.length} (zweitrangig — kein Öffnen möglich)`);

// href-Hygiene (SSG-Auftrag 11.6.2026): src/lib/seo.ts leitet die Prerender-
// Routen aus den hrefs ab — verfügbare Karten ohne href fallen aus dem
// Prerender/der Sitemap, hrefs ausserhalb /rechner|/vorlagen wären Routen,
// die App.tsx nicht kennt (das Prerender-Tor bräche dann den Build).
const ohneHref = verfuegbar.filter((k) => !k.href);
console.log(`\n── VERFÜGBAR ohne href (${ohneHref.length}) — fehlt im Prerender und in der Sitemap:`);
ohneHref.forEach((k) => console.log(`   ${k.id}  (${k.title})`));
const fremdHref = verfuegbar.filter((k) => k.href && !/^\/(rechner|vorlagen)\//.test(k.href));
console.log(`\n── href ausserhalb /rechner|/vorlagen (${fremdHref.length}):`);
fremdHref.forEach((k) => console.log(`   ${k.id}  →  ${k.href}`));
