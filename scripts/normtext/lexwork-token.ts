/**
 * SSoT (§5) für die LexWork-Artikel-Token-Normalisierung.
 *
 * Ein LexWork-Artikel-Header trägt die Nummer roh als «2a», «335bis», «1ater» …
 * Der kanonische Token — kongruent zum Fedlex-Anker `art_335_c` und zu den
 * Snapshot-`artikel`-Schlüsseln — trennt Ziffer, Buchstaben-Suffix und
 * lateinisches Suffix mit Unterstrich: «2a» → «2_a», «335bis» → «335_bis».
 *
 * DIESELBE Funktion nutzen der Volltext-Adapter (`adapter-lexwork.ts`, erzeugt
 * die Snapshot-`artikel`-Schlüssel) UND der Struktur-Extraktor
 * (`struktur-lexwork.ts`, erzeugt die Sidecar-Schlüssel). Wären es zwei Kopien,
 * driften die Token-Formate auseinander und der Runner-Filter
 * (`struktur-kanton-run.ts`, `a.tokens.has(tok)`) verwirft jeden
 * Buchstaben-Suffix-Artikel — genau der vorbestehende Bug F-2 (doppelt
 * verifiziert 16.7.2026: 217 Sidecars / ~1454 Suffix-Artikel ohne Gliederung/
 * Marginalie, weil der Extraktor «2a» bildete, der Snapshot aber «2_a» führte).
 */
export function normalisiereArtikelToken(nummer: string): string {
  return nummer
    .toLowerCase()
    .replace(/^(\d+)([a-z])?(bis|ter|quater|quinquies)?$/i, (_, n, b, suf) =>
      [n, b, suf].filter(Boolean).join('_'),
    );
}
