// scripts/materialien/fedlex-anker.ts
// E6a Stufe 1 · Etappe M1 (FAHRPLAN-MATERIALIEN-VERZAHNUNG §3 Q1, §6 «Anker-Invertierung»):
// reine, deterministische Invertierung der serverseitigen Fedlex-`#art_N`-Anker aus den ESTV-MWST-
// Ziffer-Seiten (cipherDisplay.xhtml) → artikelscharfe Norm-Referenz-Kanten (Dokument+Ziffer→Artikel).
//
// WARUM EIGENES MODUL (offline verifizierbar, §7): die Artikel-Zuordnung von Q1 hängt NICHT an
// ESTV-eigenem Markup, sondern an der STABILEN Fedlex-URL-Struktur (SR-Nummer / `eli/cc/JJJJ/NNN` +
// Fragment `#art_N`). Diese Invertierung ist damit rein, deterministisch und ohne Netzzugriff gegen
// den committeten Normtext-Korpus testbar — anders als das ESTV-JSF-XHTML (das erst mit der
// robots-Freigabe live kalibriert wird). Der Adapter reicht das rohe cipher-HTML in
// `extrahiereFedlexAnker(html)`; die Existenz-/Revisions-Invariante (Geister-Anker-Downgrade,
// MWSTG/MWSTV-Cutoff §2.4) bleibt der PROJEKTION überlassen (soft-law-projektion.ts) — dieses Modul
// liefert nur den KANDIDATEN-Token, es verifiziert die Korpus-Existenz NICHT (klare Trennung).
//
// TOKEN-FORMAT (deckungsgleich mit dem Normtext-Korpus, verifiziert an public/normtext/bund/
// MWSTG.json + MWSTV.json): Haupttext-Artikel-Token = die AKN-`eId` ohne `art_`-Präfix, also
// `art_335_c` → `335_c`, `art_45` → `45`, `art_109_110` → `109_110` (Fedlex-Doppelartikel). Der
// Buchstaben-Suffix ist unterstrich-getrennt («Art. 20a» = Token `20_a`, sprachunabhängig, CLAUDE §7).
//
// SCOPE M1: nur die zwei MWST-Erlasse (MWSTG SR 641.20, MWSTV SR 641.201). Andere Fedlex-Verweise in
// einer Ziffer-Seite (z. B. auf das OR) werden bewusst NICHT als Kante emittiert (Q1-Scope = MWST-
// Praxis auf MWSTG/MWSTV; ein OR-Verweis in einer MWST-Info ist keine MWST-Kommentierung des OR).

/** Ein von M1 abgedeckter MWST-Erlass mit seinen stabilen Fedlex-Koordinaten. */
export interface MwstErlass {
  key: 'MWSTG' | 'MWSTV';
  /** SR-Nummer (systematische Rechtssammlung). */
  sr: string;
  /** ELI-Nummernblock `eli/cc/{jahr}/{num}` (AS-Publikations-Referenz, NICHT die SR-Nummer). */
  eliJahr: string;
  eliNum: string;
}

// Provenienz: SR-Nummern aus src/lib/normtext/register.ts (MWSTG 641.20, MWSTV 641.201); ELI-Blöcke
// aus scripts/materialien/revisions-cutoff.ts (Fedlex-ELI, doppelt verifiziert). Längste SR zuerst,
// damit `641.201` nicht fälschlich von `641.20` getroffen wird (Präfix-Falle, siehe erlassAusFedlexUrl).
export const MWST_ERLASSE: readonly MwstErlass[] = [
  { key: 'MWSTV', sr: '641.201', eliJahr: '2009', eliNum: '828' },
  { key: 'MWSTG', sr: '641.20', eliJahr: '2009', eliNum: '615' },
];

/**
 * Bestimmt den MWST-Erlass, auf den eine Fedlex-URL zeigt — über den ELI-Nummernblock
 * (`eli/cc/2009/615` → MWSTG) ODER die SR-Nummer (`/641.20`, `SR 641.201`). Rein, deterministisch.
 * @returns 'MWSTG' | 'MWSTV' | null (kein MWST-Erlass / keine Fedlex-URL).
 */
export function erlassAusFedlexUrl(url: string): 'MWSTG' | 'MWSTV' | null {
  if (!/fedlex\.admin\.ch/i.test(url)) return null;
  // 1) ELI-Block (eindeutig: 2009/615 ≠ 2009/828) — bevorzugt, weil URL-stabil.
  const eli = /eli\/cc\/(\d{4})\/(\d+)/i.exec(url);
  if (eli) {
    for (const e of MWST_ERLASSE) {
      if (e.eliJahr === eli[1] && e.eliNum === eli[2]) return e.key;
    }
    return null; // Fedlex, aber ein anderer Erlass (kein MWST) → keine Kante.
  }
  // 2) SR-Nummer als Fallback (längste zuerst; Zifferngrenze rechts, damit 641.20 nicht 641.201 frisst).
  for (const e of MWST_ERLASSE) {
    const re = new RegExp(`(?:^|[^0-9.])${e.sr.replace('.', '\\.')}(?![0-9])`);
    if (re.test(url)) return e.key;
  }
  return null;
}

/**
 * Normalisiert einen Fedlex-Anker/eId zum Korpus-Artikel-Token. Toleriert `#art_20_a`, `art_20a`,
 * `art_20`, blosses `20_a`/`20`. Rein, deterministisch.
 *   `art_45`      → `45`
 *   `art_20_a`    → `20_a`
 *   `art_20a`     → `20_a`     (fehlender Unterstrich toleriert)
 *   `art_109_110` → `109_110`  (Fedlex-Doppelartikel, unterstrich-verbunden)
 * @returns Token oder null (kein Artikel-Anker).
 */
export function ankerNachToken(anker: string): string | null {
  let s = anker.trim().replace(/^#/, '');
  s = s.replace(/^art_/i, '');
  if (/^\d+$/.test(s)) return s; // reine Artikelnummer
  if (/^\d+_[a-z0-9][a-z0-9_]*$/i.test(s)) return s.toLowerCase(); // schon Unterstrich-Form (20_a, 109_110)
  const m = /^(\d+)([a-z]+)$/i.exec(s); // «20a» ohne Unterstrich → «20_a»
  if (m) return `${m[1]}_${m[2].toLowerCase()}`;
  return null;
}

/** Eine invertierte Fedlex-Kante (Kandidat; Korpus-Existenz prüft die Projektion). */
export interface FedlexKante {
  erlass: 'MWSTG' | 'MWSTV';
  /** Korpus-Artikel-Token oder '' (Erlass-Ebene: Fedlex-Verweis ohne `#art_`-Fragment). */
  artikel: string;
  /** die rohe Fedlex-href (Audit / roh_zitat). */
  href: string;
}

/**
 * Invertiert EINE Fedlex-href zu einer MWST-Kante. Kein MWST-Erlass ⇒ null. Fehlt das `#art_`-
 * Fragment (Verweis auf den Erlass als Ganzes) ⇒ Erlass-Ebene (`artikel=''`). Ein unlesbares
 * Fragment ⇒ ebenfalls Erlass-Ebene (nie stummer Drop, §2.4 — die Projektion dedupt).
 */
export function fedlexHrefNachKante(href: string): FedlexKante | null {
  const erlass = erlassAusFedlexUrl(href);
  if (!erlass) return null;
  const hash = href.indexOf('#');
  if (hash < 0) return { erlass, artikel: '', href };
  const token = ankerNachToken(href.slice(hash + 1));
  return { erlass, artikel: token ?? '', href };
}

/**
 * Extrahiert alle Fedlex-MWST-Anker aus einem cipher-HTML — robust über die `href="…"`-Attribute
 * (unabhängig vom ESTV-CSS/JSF-Markup). Dedupliziert auf (erlass, artikel, href). Deterministisch
 * sortiert (erlass → artikel-numerisch → href). Rein.
 */
export function extrahiereFedlexAnker(html: string): FedlexKante[] {
  const gesehen = new Map<string, FedlexKante>();
  for (const m of html.matchAll(/href\s*=\s*["']([^"']*fedlex\.admin\.ch[^"']*)["']/gi)) {
    const href = dekodiereHtmlMinimal(m[1].trim());
    const k = fedlexHrefNachKante(href);
    if (!k) continue;
    const dk = `${k.erlass}|${k.artikel}|${k.href}`;
    if (!gesehen.has(dk)) gesehen.set(dk, k);
  }
  return [...gesehen.values()].sort(vergleicheKante);
}

/** Deterministische Kanten-Ordnung (erlass, artikel numerisch dann lexikografisch, href). */
export function vergleicheKante(a: FedlexKante, b: FedlexKante): number {
  if (a.erlass !== b.erlass) return a.erlass < b.erlass ? -1 : 1;
  const na = parseInt(a.artikel, 10);
  const nb = parseInt(b.artikel, 10);
  const beideZahl = !Number.isNaN(na) && !Number.isNaN(nb);
  if (beideZahl && na !== nb) return na - nb;
  if (a.artikel !== b.artikel) return a.artikel < b.artikel ? -1 : 1;
  return a.href < b.href ? -1 : a.href > b.href ? 1 : 0;
}

/** Minimaler HTML-Entity-Dekodierer für href-Attribute (nur `&amp;`, das in Query-Strings steckt). */
function dekodiereHtmlMinimal(s: string): string {
  return s.replace(/&amp;/g, '&');
}
