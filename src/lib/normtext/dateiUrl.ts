// ─── Daten-Datei-URLs: DIE eine Kodier-Regel, register-frei (§5) ────────────
//
// Ausgelagert aus `erlassAdresse.ts` (Gegenprüfung 5.9.2026, Auflage B zu
// PR #684). `normtextDateiUrl()` stand bis dahin im Adress-Modul, das
// `ERLASS_REGISTER` (register.ts, ~42 KB, 238 Bundes-Keys) importiert — jeder
// Aufrufer, der nur eine Datei-URL kodieren wollte (u. a. der Client-Loader
// `laden.ts`), zog das komplette Register mit in seinen Import-Graphen, ohne
// es je zu brauchen. Dieses Modul importiert NICHTS als sich selbst.
//
// WARUM ES DIESE FUNKTION GIBT. `erlassPfad()` (erlassAdresse.ts) regelt nur
// die SEITEN-Adresse. Die Daten dazu — Volltext-Snapshot, Struktur-Sidecar,
// diverse Sidecars anderer Korpora — bauten ihre URL früher je per
// Template-Literal aus dem ROHEN Schlüssel. Für die meisten Schlüssel ist das
// deckungsgleich mit einer kodierten Form, für drei Glarner Erlasse nicht: ihr
// Schlüssel trägt das Prozentzeichen IN DER KANONIK (`GL-III%20B%2F7%2F1` IST
// der Schlüssel, nicht seine Kodierung).
//
// GEMESSEN (Gegenprüfung 5.9.2026, korrigiert nach Rot-Beweis-Nachfrage):
// Vercel (Prod) liefert die rohe UND die kodierte Daten-URL für diese drei
// Schlüssel beide mit HTTP 200 auf dieselbe Datei (sha 0518a47eef40) — Vercels
// Auslieferung ist gegenüber `%20`/`%2F` in Dateinamen nachsichtig. Ein
// Prod-Playwright-Lauf auf `main` OHNE diesen Fix zeigt alle drei GL-Erlasse
// bereits korrekt (14 Artikel, kein «nicht gefunden»). Der ursprünglich als
// «Fetch lief ins Leere» beschriebene Defekt tritt nachweisbar nur auf einem
// EINMAL DEKODIERENDEN lokalen Server auf (`vite preview`), der `%2F` im
// Dateinamen als Pfadtrenner liest und darum `kanton/GL-III B/7/1.json` statt
// der wörtlich existierenden Datei `kanton/GL-III%20B%2F7%2F1.json` sucht.
// Der Fix bleibt trotzdem richtig: er macht die Kodierung an JEDER Datei-URL
// konsistent mit der Seiten-Adresse (§5) und schliesst die Lücke für jeden
// Server, der sich (anders als Vercel) strikt an eine einmalige Dekodierung
// hält — nur die Dringlichkeits-Begründung («Live-Nachweis») war überzogen.
//
// Kodiert wird PRO PFADSEGMENT, nicht die ganze URL — sonst kodierte
// `encodeURIComponent` auch die trennenden `/`. Wächter:
// `src/tests/erlass-adresse-sonderzeichen.test.ts` fährt die Kette Adresse →
// Register → Daten-URL → Datei über alle 165 Sonderzeichen-Schlüssel.
//
// SEIT DIESEM MODUL GILT DIE REGEL AUCH FÜR EINZELNE SCHLÜSSEL ausserhalb von
// `/normtext`: die Sidecar-Lader `revisionen.ts`, `historie-laden.ts`
// (normtext), `bezuege.ts`, `norm-index.ts` (rechtsprechung) und
// `artikel-revisionen.ts` (verzahnung) kodierten ihren einen Schlüssel bisher
// mit rohem `encodeURIComponent(key)` — zeichengleiches Ergebnis zu
// `kodiereSchluessel()`, jetzt dieselbe benannte Regel statt fünf Kopien.

/** Kodiert ein einzelnes Pfadsegment (Erlass-/Register-/Entscheid-Schlüssel)
 *  für eine Datei-URL. */
export function kodiereSchluessel(schluessel: string): string {
  return encodeURIComponent(schluessel);
}

/**
 * Adresse einer DATEI unter `/normtext` — dieselbe Kodier-Regel wie für die
 * Seiten-Adresse (`erlassPfad`, `erlassAdresse.ts`), angewandt auf jedes
 * Pfadsegment einzeln.
 *
 * Zerlegt wird am `/`, weil `relativerPfad` typischerweise aus dem Register
 * stammt (`<datenEbene>/<key>.json`). Das ist tragfähig, weil kein Schlüssel
 * ein echtes `/` trägt — geprüft in `erlass-adresse.test.ts`, und
 * `KEY_UNSICHER` (seo-detail) hielte einen solchen Schlüssel ohnehin aus dem
 * Prerender.
 */
export function normtextDateiUrl(relativerPfad: string): string {
  return `/normtext/${relativerPfad.split('/').map(kodiereSchluessel).join('/')}`;
}
