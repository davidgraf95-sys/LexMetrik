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
const ERWARTETE_ROUTEN = 51; // +1: /rechner/notariat-grundbuch (Immobilien, 15.6.2026)
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

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Unbefüllte Hülle als SPA-Fallback (vercel.json-Rewrite-Ziel): Stub-Routen
// für geplante Rechner und unbekannte Pfade — noindex, weil dünner Inhalt.
writeFileSync(
  join(DIST, 'app.html'),
  template.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>'),
);
console.log('OK  app.html (unbefüllte Hülle, noindex)');

function seitenHtml(pfad: string, inhalt: string): string {
  const meta = metaFuerPfad(pfad);
  if (!meta) throw new Error(`keine Metadaten für ${pfad} (lib/seo.ts)`);
  let out = template;
  out = out.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(meta.titel)}</title>`);
  for (const [re, wert] of [
    [/(<meta name="description" content=")[^"]*(" \/>)/, meta.beschreibung],
    [/(<meta property="og:title" content=")[^"]*(" \/>)/, meta.titel],
    [/(<meta property="og:description" content=")[^"]*(" \/>)/, meta.ogBeschreibung ?? meta.beschreibung],
    [/(<meta property="og:url" content=")[^"]*(" \/>)/, meta.canonical],
  ] as const) {
    if (!re.test(out)) throw new Error(`Meta-Tag-Muster nicht gefunden (${pfad}): ${re}`);
    out = out.replace(re, (_, vor: string, nach: string) => vor + esc(wert) + nach);
  }
  // JSON-LD (E4): nicht-ausführbarer Data-Block, von der CSP (script-src
  // 'self') nicht erfasst; «<» escapen, damit kein </script> im JSON-Inhalt
  // den Block beenden kann.
  const jsonLd = jsonLdFuerPfad(pfad);
  const ldTag = jsonLd
    ? `    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>\n`
    : '';
  out = out.replace(
    '</head>',
    `    <link rel="canonical" href="${meta.canonical}" />\n${ldTag}  </head>`,
  );
  return out.replace(ROOT_MARKER, () => `<div id="root">${inhalt}</div>`);
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

// sitemap.xml — bewusst ohne lastmod (deterministischer Build-Output; kein
// Datum erfinden, das nicht aus einer Quelle kommt).
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routen.map((p) => `  <url><loc>${SITE_URL}${p === '/' ? '/' : p}</loc></url>`),
  '</urlset>',
  '',
].join('\n');
writeFileSync(join(DIST, 'sitemap.xml'), sitemap);
console.log(`OK  sitemap.xml (${routen.length} URLs)`);

// robots.txt: Sitemap-Zeile aus SITE_URL anhängen (§5: Domain nur in seo.ts;
// public/robots.txt bleibt domainfrei).
const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
writeFileSync(join(DIST, 'robots.txt'), `${robots.trimEnd()}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log('OK  robots.txt (+Sitemap-Verweis)');

console.log(`\nAlle ${routen.length} Routen prerendered.`);
