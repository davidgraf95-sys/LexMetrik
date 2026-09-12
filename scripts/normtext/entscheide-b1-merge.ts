// ─── B1-Refresh: MERGEN statt überschreiben (Gegenprüfungs-Auflage B1, 12.9.2026,
// PR #816) ────────────────────────────────────────────────────────────────────
//
// Befund: der B1-Zweig von `--regeste-refresh` (normtext-entscheide.ts) ERSETZTE
// den ganzen Bestandseintrag durch das frische `holeBgeLeitentscheid`-Ergebnis.
// `regeste.sprachfassungen` (dreisprachige, strukturierte Regeste, A18) stammt
// aber aus einem ANDEREN Refresh-Zweig (`holeRegesteSprachfassungen`, B2) — beim
// reinen Überschreiben ging dieses Feld für ALLE 6 in diesem PR angefassten BGE
// verloren (korpusweit 1258 → 1252 BGE mit Sprachfassungen). Fix: `neu` bleibt
// die Basis (aktuelleres/vollständigeres Urteil, Datum, aza), aber Felder, die
// NUR der Bestand trägt, werden gemergt statt verworfen.

import type { EntscheidRegeste } from '../../src/lib/rechtsprechung/typen';

type MitRegeste = { regeste: EntscheidRegeste | null };

/**
 * `regeste.sprachfassungen` aus `alt` in `neu` übernehmen, wenn `neu` selbst
 * keine trägt UND der flache Regeste-Text unverändert ist — stimmt der Text
 * nicht mehr überein, könnte die alte Übersetzung zu einer geänderten
 * amtlichen Fassung nicht mehr passen; dann lieber fehlend als falsch
 * zugeordnet (§1, nie raten).
 */
export function mergeB1Ergebnis<T extends MitRegeste>(alt: T, neu: T): T {
  const altSprachfassungen = alt.regeste?.sprachfassungen;
  if (
    altSprachfassungen
    && altSprachfassungen.length
    && neu.regeste
    && !neu.regeste.sprachfassungen
    && alt.regeste
    && alt.regeste.text === neu.regeste.text
  ) {
    return { ...neu, regeste: { ...neu.regeste, sprachfassungen: altSprachfassungen } };
  }
  return neu;
}
