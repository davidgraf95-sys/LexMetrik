// Dossier: KATALOG-ROADMAP.md
import type { CalculatorCard } from './startseiteConfig';
import { kategorieFuer, type OberkategorieId } from './oberkategorien';

// ─── Praxis-Rang der Werkzeuge (Auftrag David 10.6.2026) ─────────────────────
//
// «analysiere grundlegend welche engines in der praxis gebraucht werden und
// teile das UI weiter danach auf»: Drei Gebrauchsklassen, kuratiert aus der
// Praxis-Abdeckungskarte (KATALOG-ROADMAP Teil A/B, Praxiswert H×R×D):
//   1 = ALLTAG (täglich/wöchentlich; Fristen-Haftungskern, Standardrechnungen,
//       Standard-Schreiben) — stehen in ihrer Kategorie ZUOBERST,
//   2 = REGELMÄSSIG (typische Mandats-Aufgaben),
//   3 = GELEGENTLICH (Gründungen, Vorsorge-Planung, Spezialfälle).
// Nicht gelistete IDs erhalten Rang 2 (neutral) — die Liste ist Kuratierung
// (fachliche Aussage Claude, Abnahme David offen), kein Gate.

const RANG_1_ALLTAG: ReadonlySet<string> = new Set([
  // Fristen (verpasste Frist = Haftung; KATALOG-ROADMAP Rang 1–8)
  'tagerechner', 'fristenspiegel', 'zpo-fristen', 'schkg-fristen',
  'verjaehrung', 'mietrecht', 'kuendigung-sperrfristen',
  // Zuständigkeit (Eingangsfrage jedes Mandats; S-3: vier Rechtsweg-Felder)
  'zustaendigkeit', 'schkg-zustaendigkeit', 'straf-zustaendigkeit',
  // Gebühren & Beträge (Standardrechnung jeder Forderung/Betreibung)
  'verzugszins', 'betreibungskosten',
  // Vorlagen (Standard-Schreiben des Kanzleialltags)
  'vollmacht', 'kuendigung-arbeitgeber', 'kuendigung-arbeitnehmer',
  'kuendigung-mieter', 'kuendigung-vertrag', 'mahnung',
]);

const RANG_3_GELEGENTLICH: ReadonlySet<string> = new Set([
  'ag-gruendung', 'gmbh-gruendung', 'kapitalerhoehung', 'statuten', 'gv-vr-beschluss',
  'eigenhaendiges-testament', 'oeffentliches-testament', 'erbvertrag',
  'erbverzichtsvertrag', 'erbteilungsvereinbarung', 'patientenverfuegung',
  'vorsorgeauftrag', 'teuerungsrechner', 'iprg', 'verrechnungssteuer',
  'grundstueckgewinnsteuer', 'auslaenderrecht-fristen', 'datenschutz-fristen',
]);

export function praxisRang(id: string): 1 | 2 | 3 {
  if (RANG_1_ALLTAG.has(id)) return 1;
  if (RANG_3_GELEGENTLICH.has(id)) return 3;
  return 2;
}

/** Die Top-Direktlinks je Einstiegskachel (verfügbare Alltags-Werkzeuge in
 *  kuratierter Reihenfolge) — ersetzt die separate «Häufig gebraucht»-Rubrik
 *  (Versimplung 10.6.2026: gleiche Funktion, ein Apparat weniger). */
const KACHEL_LINKS: Record<OberkategorieId, string[]> = {
  zustaendigkeiten: ['zustaendigkeit', 'schkg-zustaendigkeit'],
  fristen: ['tagerechner', 'fristenspiegel'],
  gebuehren: ['verzugszins', 'betreibungskosten'],
  vorlagen: ['vollmacht', 'kuendigung-vertrag'],
};

export function kachelDirektlinks(kategorie: OberkategorieId, karten: CalculatorCard[]): CalculatorCard[] {
  return KACHEL_LINKS[kategorie]
    .map((id) => karten.find((k) => k.id === id))
    .filter((k): k is CalculatorCard => !!k && !!k.href && kategorieFuer(k) === kategorie);
}
