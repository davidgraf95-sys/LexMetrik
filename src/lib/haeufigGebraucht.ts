// ─── Kuratierter Schnelleinstieg «Häufig gebraucht» ─────────────────────────
//
// Nachfolger der Free-Kachelwand-Reihenfolge (FAHRPLAN-EINE-HAUPTSEITE D-2,
// Auftrag David 7.6.2026): Die nach ALLTAGSNUTZEN kuratierte Auswahl der
// früheren Free-Startseite bleibt als schlanke Chip-Zeile über dem Katalog
// erhalten. Dies ist die EINZIGE Kuratierungs-Stelle (kein Hartkodieren in
// der View). Defensive Semantik: unbekannte IDs werden ignoriert; nicht
// verfügbare Karten (geplant/ohne href) erscheinen nicht (§8) und rücken
// automatisch nach, sobald sie gebaut sind.

import { ALLE_KARTEN, istVerfuegbar, type CalculatorCard } from './startseiteConfig';

export const HAEUFIG_GEBRAUCHT: string[] = [
  // Rechner (häufigste Alltags-Anliegen zuerst)
  'tagerechner',
  'verzugszins',
  'teuerungsrechner',
  // Vorlagen
  'eigenhaendiges-testament',
  'vorsorgeauftrag',
  'patientenverfuegung',
  'vollmacht',
  'mahnung',
  'kuendigung-arbeitnehmer',
];

/** Kuratierte Karten in fester Reihenfolge; nur Verfügbare mit href. */
export function haeufigGebrauchtKarten(): CalculatorCard[] {
  return HAEUFIG_GEBRAUCHT
    .map((id) => ALLE_KARTEN.find((k) => k.id === id))
    .filter((k): k is CalculatorCard => !!k && istVerfuegbar(k) && !!k.href);
}
