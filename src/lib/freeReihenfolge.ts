// ─── Kuratierte Reihenfolge der Free-Startseite (Auftrag 5.6.2026) ──────────
//
// Free sortiert nach ALLTAGSNUTZEN, nicht nach Rechtsgebiet. Diese Liste ist
// die EINZIGE Kuratierungs-Stelle (kein Hartkodieren in der View). IDs an
// die reale Config angepasst (Phase 0: «tagerechner»/«teuerungsrechner»
// statt der Auftrags-Platzhalter). Defensive Semantik: unbekannte IDs
// werden ignoriert; free-Einträge, die hier fehlen, hängen stabil
// (alphabetisch) hinten an — der Vollständigkeitstest sichert beides.

import { ALLE_KARTEN, type CalculatorCard } from './startseiteConfig';

export const FREE_REIHENFOLGE: string[] = [
  // Rechner (häufigste Laien-Anliegen zuerst)
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

/** Free-Karten in kuratierter Reihenfolge; Nachzügler stabil hinten. */
export function freeKartenSortiert(): CalculatorCard[] {
  const free = ALLE_KARTEN.filter((k) => k.tier === 'free');
  const rang = new Map(FREE_REIHENFOLGE.map((id, i) => [id, i]));
  return [...free].sort((a, b) => {
    const ra = rang.get(a.id) ?? FREE_REIHENFOLGE.length;
    const rb = rang.get(b.id) ?? FREE_REIHENFOLGE.length;
    return ra - rb || a.id.localeCompare(b.id, 'de');
  });
}
