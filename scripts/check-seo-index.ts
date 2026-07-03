// ─── Tor check:seo-index — Parität index.html ↔ seo.ts (FAHRPLAN §6) ─────────
//
// Beweist, dass die statischen Meta-Tags in index.html WÖRTLICH die aus
// src/lib/seo.ts abgeleiteten Startseiten-Werte spiegeln. seo.ts ist die SSoT
// (§6); index.html bleibt eine statische Datei, deren Titel/Description/OG das
// Prerender für «/» ohnehin aus metaFuerPfad('/') überschreibt — dieses Tor
// hält die Ausgangsdatei mit der Quelle synchron, damit First Paint und
// Social-Preview VOR dem Client-Takeover schon korrekt sind.
//
// KEIN Duplikat-String im Checker: die Erwartungswerte kommen aus den echten
// seo.ts-Exporten; verglichen wird gegen die esc()-Form (wie das Prerender
// injiziert, scripts/prerender.ts).
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_TITEL, SITE_DESCRIPTION, SITE_OG_DESCRIPTION } from '../src/lib/seo';
import { esc } from '../src/lib/seo-detail';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');

interface Pruefung {
  feld: string;
  re: RegExp; // Gruppe 1 = der Tag-Inhalt
  erwartet: string;
}

// Muster spiegeln die Prerender-Injektion (scripts/prerender.ts rendereTemplate).
const PRUEFUNGEN: Pruefung[] = [
  { feld: '<title>', re: /<title>([^<]*)<\/title>/, erwartet: SITE_TITEL },
  { feld: 'meta description', re: /<meta name="description" content="([^"]*)" \/>/, erwartet: SITE_DESCRIPTION },
  { feld: 'og:title', re: /<meta property="og:title" content="([^"]*)" \/>/, erwartet: SITE_TITEL },
  { feld: 'og:description', re: /<meta property="og:description" content="([^"]*)" \/>/, erwartet: SITE_OG_DESCRIPTION },
  { feld: 'og:image:alt', re: /<meta property="og:image:alt" content="([^"]*)" \/>/, erwartet: SITE_TITEL },
  { feld: 'twitter:title', re: /<meta name="twitter:title" content="([^"]*)" \/>/, erwartet: SITE_TITEL },
  { feld: 'twitter:description', re: /<meta name="twitter:description" content="([^"]*)" \/>/, erwartet: SITE_OG_DESCRIPTION },
];

const fehler: string[] = [];
for (const { feld, re, erwartet } of PRUEFUNGEN) {
  const m = html.match(re);
  if (!m) {
    fehler.push(`${feld}: Tag-Muster in index.html nicht gefunden (${re}).`);
    continue;
  }
  const ist = m[1];
  const soll = esc(erwartet);
  if (ist !== soll) {
    fehler.push(`${feld}:\n    index.html: ${JSON.stringify(ist)}\n    seo.ts:     ${JSON.stringify(soll)}`);
  }
}

if (fehler.length > 0) {
  console.error('check:seo-index — index.html weicht von seo.ts ab (SSoT §6):\n');
  for (const f of fehler) console.error(`  ✗ ${f}`);
  console.error('\n  → index.html an die seo.ts-Exporte angleichen (nicht umgekehrt).');
  process.exit(1);
}

console.log(`check:seo-index — OK, ${PRUEFUNGEN.length} Meta-Felder spiegeln seo.ts.`);
