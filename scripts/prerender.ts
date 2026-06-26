// ─── Build-Zeit-Prerender: dist/ → statisches HTML je Route (SSG-E3) ───────
//
// Dossier: docs/ssg-diagnose.md
//
// Läuft als DRITTER Build-Schritt (tsc -b && vite build && vite-node …) und
// schreibt für jede öffentliche Route dist/<pfad>/index.html: gerendertes
// HTML im #root plus routen-individuelle Meta-Tags aus lib/seo.ts (§5).
// Browser-Verhalten unverändert: main.tsx ersetzt den Inhalt per
// createRoot().render() (render-then-replace, Entscheid Freigabe 11.6.2026 —
// KEIN hydrateRoot, Begründung in docs/ssg-diagnose.md §5).
//
// Drift-Tore (brechen den Build):
//  – Route rendert den 404-Marker → Pfad fehlt in App.tsx
//  – HTML < 500 Zeichen (Smoke-Konvention) → Seite leer/kaputt
//  – Routenzahl ≠ deklarierter Zähler → Katalog und Zähler nachführen
//
// Aufruf: npm run prerender (setzt frisches `vite build` voraus)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { jsonLdFuerPfad, metaFuerPfad, prerenderRouten, SITE_URL } from '../src/lib/seo';
import {
  entscheidHatVolltext,
  entscheidVolltextHtml,
  erlassHatVolltext,
  erlassVolltextHtml,
  esc,
  jsonLdFuerEntscheid,
  jsonLdFuerErlass,
  KEY_UNSICHER,
  metaFuerEntscheid,
  metaFuerErlass,
} from '../src/lib/seo-detail';
import type { BrowseErlass } from '../src/lib/normtext/browse-typen';
import type { NormSnapshotDatei } from '../src/lib/normtext/typen';
import type { BrowseEntscheid } from '../src/lib/rechtsprechung/register';
import type { EntscheidSnapshotDatei } from '../src/lib/rechtsprechung/typen';
import { renderRoute } from '../src/entry-server';

// Deklarierter Routen-Zähler (wie die Katalog-Zähler in den Tests): bei neuen
// Karten/Seiten bewusst im selben Commit nachführen.
// 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V2): +/vorlagen/verjaehrungsverzicht.
// 12.6.2026 (Musterklagen): +/vorlagen/scheidungsklage,
// +/vorlagen/scheidungsbegehren-gemeinsam, +/vorlagen/eheschutzgesuch.
// 13.6.2026 (V2-Rest): +/vorlagen/forderungsabtretung,
// +/vorlagen/fristerstreckung, +/vorlagen/nichtbekanntgabe-betreibung.
// 13.6.2026 (V3): +/vorlagen/auftrag, +/vorlagen/werkvertrag, +/vorlagen/nda,
// +/vorlagen/konkubinat.
// Seit FUNDAMENT-UMBAU Thema B: Die Karten-Routen-EXISTENZ ist primär durch
// src/tests/routenManifest.test.ts gegated (Manifest === katalogRouten()).
// Dieser Zähler bleibt als sekundärer Drift-Backstop (fängt auch statische
// Seiten) — bei neuen Karten/Seiten weiter im selben Commit nachführen.
const ERWARTETE_ROUTEN = 56; // +1: /gesetze (17.6.2026); +1: /rechtsprechung (23.6.2026); +1: /international (24.6.2026); UI-Welle: −/recherche, +/rechner +/vorlagen (netto +1)
const NOT_FOUND_MARKER = '404 · Nicht gefunden'; // src/pages/NotFound.tsx
// Stub-Tor (Bug-Check 11.6.2026): /rechner/:slug fängt Katalog-hrefs ohne
// dedizierte Route VOR der 404-Seite ab — eine «in Vorbereitung»-Stub-Seite
// darf nie prerendert/gesitemappt werden.
const STUB_MARKER = 'Dieser Rechner ist noch nicht verfügbar'; // src/pages/RechnerStub.tsx
const MIN_ZEICHEN = 500; // Smoke-Konvention (scripts/smoke-render.tsx)

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const ROOT_MARKER = '<div id="root"></div>';

const template = readFileSync(join(DIST, 'index.html'), 'utf8');
if (!template.includes(ROOT_MARKER)) {
  throw new Error(
    'dist/index.html enthält keinen leeren #root — erst frisch `vite build` laufen lassen (Prerender nie doppelt anwenden).',
  );
}

// esc kommt aus lib/seo-detail (eine Quelle, §5).

// Unbefüllte Hülle als SPA-Fallback (vercel.json-Rewrite-Ziel): Stub-Routen
// für geplante Rechner und unbekannte Pfade — noindex, weil dünner Inhalt.
writeFileSync(
  join(DIST, 'app.html'),
  template.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>'),
);
console.log('OK  app.html (unbefüllte Hülle, noindex)');

// Template-Erzeugung aus fertigen Meta/JSON-LD/Inhalt. Single Source für die
// Katalog-Routen (seitenHtml) UND die Detail-Seiten (W1.1, aus den Manifesten).
function rendereTemplate(
  meta: { titel: string; beschreibung: string; ogBeschreibung?: string; canonical: string },
  jsonLd: object | null,
  inhalt: string,
  kontext: string,
): string {
  let out = template;
  out = out.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(meta.titel)}</title>`);
  for (const [re, wert] of [
    [/(<meta name="description" content=")[^"]*(" \/>)/, meta.beschreibung],
    [/(<meta property="og:title" content=")[^"]*(" \/>)/, meta.titel],
    [/(<meta property="og:description" content=")[^"]*(" \/>)/, meta.ogBeschreibung ?? meta.beschreibung],
    [/(<meta property="og:url" content=")[^"]*(" \/>)/, meta.canonical],
    [/(<meta name="twitter:title" content=")[^"]*(" \/>)/, meta.titel],
    [/(<meta name="twitter:description" content=")[^"]*(" \/>)/, meta.ogBeschreibung ?? meta.beschreibung],
  ] as const) {
    if (!re.test(out)) throw new Error(`Meta-Tag-Muster nicht gefunden (${kontext}): ${re}`);
    out = out.replace(re, (_, vor: string, nach: string) => vor + esc(wert) + nach);
  }
  // JSON-LD (E4): nicht-ausführbarer Data-Block, von der CSP (script-src
  // 'self') nicht erfasst; «<» escapen, damit kein </script> im JSON-Inhalt
  // den Block beenden kann.
  const ldTag = jsonLd
    ? `    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>\n`
    : '';
  out = out.replace(
    '</head>',
    `    <link rel="canonical" href="${meta.canonical}" />\n${ldTag}  </head>`,
  );
  return out.replace(ROOT_MARKER, () => `<div id="root">${inhalt}</div>`);
}

function seitenHtml(pfad: string, inhalt: string): string {
  const meta = metaFuerPfad(pfad);
  if (!meta) throw new Error(`keine Metadaten für ${pfad} (lib/seo.ts)`);
  return rendereTemplate(meta, jsonLdFuerPfad(pfad), inhalt, pfad);
}

const routen = prerenderRouten();
if (routen.length !== ERWARTETE_ROUTEN) {
  throw new Error(
    `Routenzahl ${routen.length} ≠ deklariert ${ERWARTETE_ROUTEN} — Katalog geändert? Zähler hier im selben Commit nachführen.`,
  );
}

let fehler = 0;
for (const pfad of routen) {
  try {
    const inhalt = await renderRoute(pfad);
    if (inhalt.length < MIN_ZEICHEN) {
      throw new Error(`verdächtig kurzes HTML (${inhalt.length} Zeichen)`);
    }
    if (inhalt.includes(NOT_FOUND_MARKER)) {
      throw new Error('rendert die 404-Seite — Route fehlt in App.tsx');
    }
    if (inhalt.includes(STUB_MARKER)) {
      throw new Error('rendert die Stub-Seite — Katalog-href zeigt auf keinen gebauten Rechner');
    }
    // Prod-Befund 11.6.2026: Suspense-Reste im Prerender-Output (Fallback +
    // <div hidden>-Segment + $RC-Inline-Script) bleiben unter der CSP als
    // sichtbares «Wird geladen …» stehen — der Zwei-Pass-Render in
    // entry-server muss sauberes, script-freies HTML liefern.
    if (inhalt.includes('<script')) {
      throw new Error('Inline-Script im gerenderten HTML — Suspense-Segment statt synchronem Render (entry-server-Zwei-Pass prüfen)');
    }
    if (inhalt.includes('Wird geladen')) {
      throw new Error('Suspense-Fallback im gerenderten HTML — eine lazy()-Grenze hat nicht aufgelöst');
    }
    // Flache <pfad>.html-Dateien (nicht <pfad>/index.html): vite preview
    // (sirv) löst extensionslose URLs über die .html-Erweiterung auf,
    // Vercel über "cleanUrls": true — lokal und prod dasselbe Verhalten,
    // empirisch geprüft 11.6.2026 (Verzeichnis-Index löste sirv NICHT auf).
    const ziel = pfad === '/' ? join(DIST, 'index.html') : join(DIST, `${pfad}.html`);
    mkdirSync(dirname(ziel), { recursive: true });
    writeFileSync(ziel, seitenHtml(pfad, inhalt));
    console.log(`OK  ${pfad} (${inhalt.length} Zeichen)`);
  } catch (e) {
    fehler++;
    console.error(`FEHLER  ${pfad}:`, e);
  }
}
if (fehler > 0) {
  console.error(`\n${fehler} Route(n) mit Prerender-Fehler`);
  process.exit(1);
}

// ─── Detail-Seiten (W1.1): /gesetze/:ebene/:key + /rechtsprechung/:key ──────
// Indexierbares Volltext-HTML aus den Manifesten + Snapshots (dieselbe Quelle,
// die der Reader fetcht — §7); React ersetzt es clientseitig (render-then-
// replace). Bund + kantonale Erlasse (Keys mit Leerzeichen: Datei am ROHEN Key,
// URL prozentkodiert → Vercel decodiert beim Filesystem-Match) + alle Entscheide.
const PUBLIC = join(ROOT, 'public');
const erlassManifest = (
  JSON.parse(readFileSync(join(PUBLIC, 'normtext', 'register.json'), 'utf8')) as { erlasse: BrowseErlass[] }
).erlasse;
const entscheidManifest = (
  JSON.parse(readFileSync(join(PUBLIC, 'rechtsprechung', 'register.json'), 'utf8')) as { entscheide: BrowseEntscheid[] }
).entscheide;

const snapshotErlasse = erlassManifest.filter((e) => e.status === 'snapshot');
// Verweis-Einträge (vollständiges Urteil zu einem BGE) haben kein eigenes File —
// sie sind Deep-Links auf die BGE-Detailseite, KEINE eigene prerenderte Seite.
const snapshotEntscheide = entscheidManifest.filter((e) => e.bestand === 'snapshot' && !e.verweis);

// Absoluter Floor: fängt stilles Schrumpfen des Input-Manifests (eine fehlerhafte
// Regenerierung), das der relative geschrieben+übersprungen===total-Check allein
// NICHT sieht. Bei gewolltem grossem Datenabbau bewusst senken (wie ERWARTETE_ROUTEN).
const ERLASS_FLOOR = 1400; // aktuell 1449 snapshot (218 Bund + 1231 Kanton)
// Bewusst gesenkt 26.6.2026: «Leitentscheid» strikt auf amtliche BGE eingeengt (§8) →
// der aufgeblähte 610er-Korpus (96 % falsch etikettiert) wich 327 ehrlichen Einträgen
// (272 amtliche BGE + 55 routine). Floor unter dem neuen Ist, fängt weiter echte Verluste.
const ENTSCHEID_FLOOR = 300; // aktuell 327 snapshot (272 BGE + 25 bger + 30 kantonal)
if (snapshotErlasse.length < ERLASS_FLOOR || snapshotEntscheide.length < ENTSCHEID_FLOOR) {
  console.error(
    `\nManifest-Schrumpfung: Erlasse ${snapshotErlasse.length} (Floor ${ERLASS_FLOOR}), ` +
      `Entscheide ${snapshotEntscheide.length} (Floor ${ENTSCHEID_FLOOR}) — Register prüfen.`,
  );
  process.exit(1);
}

// Distinkte Zielpfade: ein doppelter Key würde sonst still die erste Datei
// überschreiben, während die URL-Zählung weiter stimmt.
const geschriebeneZiele = new Set<string>();
function schreibeDetail(ziel: string, html: string): void {
  if (geschriebeneZiele.has(ziel)) throw new Error(`doppelter Zielpfad ${ziel} (doppelter Key im Manifest?)`);
  geschriebeneZiele.add(ziel);
  mkdirSync(dirname(ziel), { recursive: true });
  writeFileSync(ziel, html);
}

const gesetzeUrls: string[] = [];
const rechtsprechungUrls: string[] = [];
let erlassUebersprungen = 0;
let entscheidUebersprungen = 0;
let detailFehler = 0;

for (const e of snapshotErlasse) {
  try {
    if (KEY_UNSICHER.test(e.key)) {
      console.warn(`SKIP  /gesetze: Key pfad-/URL-unsicher: ${JSON.stringify(e.key)}`);
      erlassUebersprungen++;
      continue;
    }
    if (!e.datei) {
      console.warn(`SKIP  /gesetze/${e.ebene}/${e.key}: status snapshot ohne datei`);
      erlassUebersprungen++;
      continue;
    }
    const datei = JSON.parse(readFileSync(join(PUBLIC, 'normtext', e.datei), 'utf8')) as NormSnapshotDatei;
    if (!erlassHatVolltext(datei)) {
      // header-only «Volltext» wäre irreführend (§8) und thin content (W1.5) → nicht indexieren
      console.warn(`SKIP  /gesetze/${e.ebene}/${e.key}: kein Artikel-Volltext`);
      erlassUebersprungen++;
      continue;
    }
    const inhalt = erlassVolltextHtml(e, datei);
    if (inhalt.includes('<script')) throw new Error('Inline-Script im Erlass-Volltext — Builder prüfen');
    const meta = metaFuerErlass(e);
    const html = rendereTemplate(meta, jsonLdFuerErlass(e), inhalt, meta.pfad);
    schreibeDetail(join(DIST, 'gesetze', e.ebene, `${e.key}.html`), html);
    gesetzeUrls.push(meta.canonical);
  } catch (err) {
    detailFehler++;
    console.error(`FEHLER  /gesetze/${e.ebene}/${e.key}:`, err);
  }
}
console.log(`OK  ${gesetzeUrls.length} Erlass-Detailseiten (${erlassUebersprungen} übersprungen)`);

for (const e of snapshotEntscheide) {
  try {
    if (KEY_UNSICHER.test(e.key)) {
      console.warn(`SKIP  /rechtsprechung: Key pfad-/URL-unsicher: ${JSON.stringify(e.key)}`);
      entscheidUebersprungen++;
      continue;
    }
    if (!e.datei) {
      console.warn(`SKIP  /rechtsprechung/${e.key}: bestand snapshot ohne datei`);
      entscheidUebersprungen++;
      continue;
    }
    const snap = JSON.parse(
      readFileSync(join(PUBLIC, 'rechtsprechung', e.datei), 'utf8'),
    ) as EntscheidSnapshotDatei;
    const eintrag = snap.eintraege[0];
    if (!eintrag) {
      console.warn(`SKIP  /rechtsprechung/${e.key}: Snapshot ohne eintraege`);
      entscheidUebersprungen++;
      continue;
    }
    if (!entscheidHatVolltext(eintrag)) {
      console.warn(`SKIP  /rechtsprechung/${e.key}: kein Volltext/Regeste`);
      entscheidUebersprungen++;
      continue;
    }
    const inhalt = entscheidVolltextHtml(e, eintrag);
    if (inhalt.includes('<script')) throw new Error('Inline-Script im Entscheid-Volltext — Builder prüfen');
    const meta = metaFuerEntscheid(e);
    const html = rendereTemplate(meta, jsonLdFuerEntscheid(e), inhalt, meta.pfad);
    schreibeDetail(join(DIST, 'rechtsprechung', `${e.key}.html`), html);
    rechtsprechungUrls.push(meta.canonical);
  } catch (err) {
    detailFehler++;
    console.error(`FEHLER  /rechtsprechung/${e.key}:`, err);
  }
}
console.log(`OK  ${rechtsprechungUrls.length} Entscheid-Detailseiten (${entscheidUebersprungen} übersprungen)`);

// Tore (FAHRPLAN W1.1): (1) unerwartete Exceptions brechen; (2) Vollständigkeit
// — jeder Eintrag ist entweder geschrieben oder BEWUSST übersprungen (kein
// stiller Verlust). Der absolute Floor oben fängt zusätzlich Input-Schrumpfung.
if (detailFehler > 0) {
  console.error(`\n${detailFehler} Detailseite(n) mit unerwartetem Fehler`);
  process.exit(1);
}
if (
  gesetzeUrls.length + erlassUebersprungen !== snapshotErlasse.length ||
  rechtsprechungUrls.length + entscheidUebersprungen !== snapshotEntscheide.length
) {
  console.error('\nVollständigkeits-Drift: geschrieben + übersprungen ≠ Manifest-Menge.');
  process.exit(1);
}

// ─── Sitemaps (W1.1): Index + Teil-Sitemaps ─────────────────────────────────
// sitemap.xml ist jetzt ein Sitemap-INDEX (skaliert auf >1800 URLs). Bewusst
// ohne lastmod (deterministischer Build; kein Datum erfinden — `stand` ist das
// uniforme Fedlex-Konsolidierungsdatum, nicht die echte Änderungszeit, W1.4).
const xmlEsc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function schreibeUrlset(datei: string, urls: string[]): void {
  writeFileSync(
    join(DIST, datei),
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map((u) => `  <url><loc>${xmlEsc(u)}</loc></url>`),
      '</urlset>',
      '',
    ].join('\n'),
  );
}

const seitenUrls = routen.map((p) => `${SITE_URL}${p === '/' ? '/' : p}`);
const teilSitemaps: Array<{ datei: string; urls: string[] }> = [
  { datei: 'sitemap-seiten.xml', urls: seitenUrls },
  { datei: 'sitemap-gesetze.xml', urls: gesetzeUrls },
  { datei: 'sitemap-rechtsprechung.xml', urls: rechtsprechungUrls },
];
const aktiveSitemaps = teilSitemaps.filter((s) => s.urls.length > 0);
for (const s of aktiveSitemaps) schreibeUrlset(s.datei, s.urls);

writeFileSync(
  join(DIST, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...aktiveSitemaps.map((s) => `  <sitemap><loc>${SITE_URL}/${s.datei}</loc></sitemap>`),
    '</sitemapindex>',
    '',
  ].join('\n'),
);
const gesamtUrls = aktiveSitemaps.reduce((n, s) => n + s.urls.length, 0);
console.log(`OK  sitemap.xml (Index → ${aktiveSitemaps.length} Teil-Sitemaps, ${gesamtUrls} URLs)`);

// robots.txt: Sitemap-Zeile aus SITE_URL anhängen (§5: Domain nur in seo.ts;
// public/robots.txt bleibt domainfrei).
const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
writeFileSync(join(DIST, 'robots.txt'), `${robots.trimEnd()}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log('OK  robots.txt (+Sitemap-Verweis)');

console.log(`\nAlle ${routen.length} Routen prerendered.`);
