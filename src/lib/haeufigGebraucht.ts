// ─── Rubrik «Häufig gebraucht» (Register-Spitze) ────────────────────────────
//
// Auftrag David 7.6.2026: «oben eine rubrik mit häufig gebraucht wo du die
// fachlich wichtigsten reinnimmst» — Übergreifend wanderte dafür ans Ende
// (rechtsbereichGruppen.ts). Dies ist die EINZIGE Kuratierungs-Stelle.
//
// AUSWAHL (fachliche Einschätzung Claude, 8 Einträge — Davids Anpassung
// jederzeit; Kriterien: Breite der Praxisrelevanz × Fehlerfolgen):
//  1 tagerechner            Fristen = Kern des Produkts (drei Engines, ein Einstieg)
//  2 zpo-fristen            prozessuale Fristen mit Stillstand (S-5c: ersetzt den
//                           aufgelösten Fristenspiegel in dieser Liste)
//  3 zustaendigkeit         Eingangsfrage jedes Verfahrens (3 Rechtswege)
//  4 verjaehrung            hohe Fehlerfolgen (Anspruchsverlust)
//  5 verzugszins            häufigster Betragswert der Praxis
//  6 kuendigung-sperrfristen Art. 336c OR — nichtige Kündigungen, hohe Fehlerfolgen
//  7 mietrecht              Kündigungstermine/-fristen, grösste Breitenwirkung
//  8 eigenhaendiges-testament häufigste Vorlage (Laien-Einstieg)
//
// Defensive Semantik: unbekannte IDs werden ignoriert; nicht verfügbare
// Karten (geplant/ohne href) erscheinen nicht (§8) und rücken automatisch
// nach, sobald sie gebaut sind.

import { ALLE_KARTEN, istVerfuegbar, type CalculatorCard } from './startseiteConfig';

export const HAEUFIG_GEBRAUCHT: string[] = [
  'tagerechner',
  'zpo-fristen',
  'zustaendigkeit',
  'verjaehrung',
  'verzugszins',
  'kuendigung-sperrfristen',
  'mietrecht',
  'eigenhaendiges-testament',
];

/** Kuratierte Karten in fester Reihenfolge; nur Verfügbare mit href. */
export function haeufigGebrauchtKarten(): CalculatorCard[] {
  return HAEUFIG_GEBRAUCHT
    .map((id) => ALLE_KARTEN.find((k) => k.id === id))
    .filter((k): k is CalculatorCard => !!k && istVerfuegbar(k) && !!k.href);
}
