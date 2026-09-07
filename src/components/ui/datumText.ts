import { datumCh } from '../../lib/normtext/erlassKopfText';

// ─── Der Datums-TEXT · Zwilling von `ui/Datum` (B-3/B3-7, R3-α 31.8.2026) ────
//
// WARUM EINE EIGENE DATEI und nicht ein zweiter Export aus `Datum.tsx`: die
// Fast-Refresh-Regel (`react-refresh/only-export-components`, Tor `npm run
// lint`) lässt neben einer Komponente keine weiteren Exporte zu. Die Datei
// liegt darum direkt daneben, im selben Verzeichnis und mit demselben Bezug
// auf dieselbe eine Formatier-Quelle `datumCh` — «eine Wahrheit» ist eine
// Frage der QUELLE, nicht der Dateizahl (§5).

/**
 * Dasselbe Datum wie `<Datum>` als ZEICHENKETTE — für die Stellen, an denen
 * kein Element stehen kann (PDF-/Rechenbericht-Zeilen, `kontext`-Sätze, Kennzahl-Werte).
 *
 * B-3/B3-7 (R3-α, 31.8.2026): davon standen SECHS byte-gleiche Kopien in der
 * App, jede als lokales `const fmtISO = (s) => s.split('-').reverse().join('.')`
 * (SperrtageZaehler · VerzugszinsForm · VerjaehrungForm · GewaehrleistungForm ·
 * KuendigungSperrForm) plus `kurzDatum` in VerweisKontext. Sie sind gelöscht,
 * nicht angeglichen (§5/§10).
 *
 * WOHIN — und warum hierher: er delegiert an dieselbe eine Formatier-Quelle
 * wie `<Datum>` (`datumCh`) und liegt als Zwilling direkt daneben. Damit gibt
 * es weiterhin genau EINE Stelle, an der aus einem ISO-Datum die Schweizer
 * Anzeigeform wird — die Datei daneben trägt nur die Auszeichnung dazu.
 *
 * DER STRICH: die Kopien schrieben bei leerer Eingabe «–» (Gedankenstrich) —
 * eine ehrliche Leerstelle in einer Kennzahl-Zeile, die sonst eine Zahl trägt
 * (§8). Das Verhalten bleibt unverändert. Byte-Gleichheit zum Vorzustand für
 * jede wohlgeformte ISO-Eingabe; ein MISSgeformter Wert kommt neu unverändert
 * zurück, statt zu einer erfundenen Datumsform verdreht zu werden
 * («2026-6-1» ergab in den Kopien «1.6.2026»).
 */
export function datumOderStrich(iso?: string): string {
  return iso ? datumCh(iso) : '–';
}
