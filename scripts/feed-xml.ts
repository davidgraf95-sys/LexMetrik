// scripts/feed-xml.ts
// QS-VERWENDEN V5: reine Bau-Funktion des Atom-Feeds «geänderte Erlasse» —
// KEIN I/O (§3), damit `scripts/feed-generieren.test.ts` sie ohne Datei-/
// Prozesszugriff mit Fixtures prüfen kann. Der CLI-Läufer (Datei-I/O,
// `npm run gen:feed`) steht separat in scripts/feed-generieren.ts — gleiches
// Muster wie scripts/datenhaltung/manifest.ts (rein) vs. check-datenhaltung.ts
// (Läufer).
//
// Deterministisch (§2): KEIN Bauzeit-Stempel. Welche Erlasse aufgenommen werden
// und wann sie zuletzt geändert gelten, kommt ausschliesslich aus dem
// übergebenen Register (`public/normtext/register.json`) — `status ===
// 'snapshot'` = echter Volltext (dieselbe Zählregel wie gen-startseite-
// zaehler.ts, nicht «nur-live-link»/«pdf-embed»), Feld `stand` =
// Konsolidierungsdatum je Erlass. Sortierung per Codepoint, locale-unabhängig
// (Gegenprüfung 2.9.2026).
//
// Zwei Erlasse ohne gültigen `stand` (VD-vd-106879, VD-vd-128150 — bekannte
// Lücke, s. `STAND_UNBEKANNT` in erlassKopfText.ts) werden ausgelassen: ohne
// Datum kein `<updated>`, ein Platzhalter wäre eine erfundene Zeitangabe (§8).
//
// Handgebaute Atom-XML statt der `feed`-Bibliothek (§17 Rückbau-Gegengewicht):
// das ganze Format sind ein Kopf- und ein Eintrags-Template, deutlich unter dem
// Umfang, den eine zusätzliche Abhängigkeit rechtfertigen würde.
import { esc } from '../src/lib/seo-detail.ts';
import { erlassPfad } from '../src/lib/normtext/erlassAdresse.ts';
import { SITE_URL } from '../src/lib/seo.ts';
import type { BrowseErlass } from '../src/lib/normtext/browse-typen.ts';

/** Codepoint-Vergleich statt `localeCompare` (§2): `localeCompare` ist
 *  ICU-abhängig — unter `LC_ALL=tr_TR.UTF-8` sortiert es anders als unter
 *  `LC_ALL=C`/`de_DE.UTF-8` (Gegenprüfung 2.9.2026, gemessen: unterschiedlicher
 *  sha256 von public/feed/erlasse.xml je Locale). Maschinelle Ausgabe braucht
 *  eine Sortierung, die überall dasselbe Ergebnis liefert. */
function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function eintragXml(e: BrowseErlass): string {
  const url = SITE_URL + erlassPfad(e);
  const srTeil = e.sr ? ` (SR ${e.sr})` : '';
  return (
    `  <entry>\n` +
    `    <id>${esc(url)}</id>\n` +
    `    <title>${esc(`${e.kuerzel} — ${e.titel}`)}</title>\n` +
    `    <link rel="alternate" type="text/html" href="${esc(url)}" />\n` +
    `    <updated>${e.stand}T00:00:00Z</updated>\n` +
    `    <summary>${esc(`Stand ${e.stand}${srTeil}.`)}</summary>\n` +
    `  </entry>\n`
  );
}

/** Register-Erlasse → fertiges Atom-XML. Filtert auf `status === 'snapshot'` +
 *  gültigen `stand`, sortiert stabil (Datum desc, dann Kürzel asc). Wirft,
 *  wenn danach nichts übrig bleibt (Register leer/kaputt). */
export function baueFeedXml(alleErlasse: readonly BrowseErlass[]): string {
  const eintraege = alleErlasse
    .filter((e) => e.status === 'snapshot' && /^\d{4}-\d{2}-\d{2}$/.test(e.stand))
    .sort((a, b) => (a.stand === b.stand ? cmp(a.kuerzel, b.kuerzel) : cmp(b.stand, a.stand)));

  if (eintraege.length === 0) {
    throw new Error('baueFeedXml: kein Erlass mit status "snapshot" + gültigem Stand — Register leer/kaputt?');
  }

  const feedUpdated = `${eintraege[0].stand}T00:00:00Z`;
  const feedUrl = `${SITE_URL}/feed/erlasse.xml`;

  return (
    `<?xml version="1.0" encoding="utf-8"?>\n` +
    `<feed xmlns="http://www.w3.org/2005/Atom">\n` +
    `  <id>${esc(feedUrl)}</id>\n` +
    `  <title>LexMetrik — geänderte Erlasse</title>\n` +
    `  <updated>${feedUpdated}</updated>\n` +
    `  <link rel="self" type="application/atom+xml" href="${esc(feedUrl)}" />\n` +
    `  <link rel="alternate" type="text/html" href="${esc(`${SITE_URL}/`)}" />\n` +
    `  <author>\n    <name>LexMetrik</name>\n  </author>\n` +
    eintraege.map(eintragXml).join('') +
    `</feed>\n`
  );
}
