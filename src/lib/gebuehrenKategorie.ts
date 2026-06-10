// ─── Gebühren-Register (S-6 FAHRPLAN-STRUKTUR-UMBAU) ────────────────────────
//
// Auftrag David 10.6.2026 abends: «Gebühren und Beträge auch nach Prozess
// und materiell unterteilen.» Zwei Rubriken + Hilfsrechner:
//  - PROZESSUAL: Kosten und Grössen des VERFAHRENS (Gerichts-/Betreibungs-/
//    Bundesgerichtskosten, Vorschüsse, Sicherheiten, Streitwert als
//    Verfahrensgrösse, betreibungsrechtliches Existenzminimum Art. 93 SchKG).
//  - MATERIELL: Ansprüche und Quoten des MATERIELLEN Rechts (Zinsen, Lohn,
//    Erbquoten, Miete, Güterrecht, Gesellschaftskapital, Steuern, AHV).
// Klassifikation = fachliche Aussage (Abnahme David offen); Vollständigkeit
// erzwingt src/tests/gebuehrenKategorie.test.ts — jede Karte der Kategorie
// «Gebühren & Beträge» muss genau einer Rubrik zugeordnet sein.

export type GebuehrenRubrik = 'prozessual' | 'materiell' | 'hilfsmittel';

export const GEBUEHREN_RUBRIKEN: { id: GebuehrenRubrik; titel: string; lede: string }[] = [
  { id: 'prozessual', titel: 'Prozess- & Verfahrenskosten',
    lede: 'Was das Verfahren kostet und voraussetzt – Gerichtskosten, Vorschüsse, Sicherheiten, Betreibungskosten, Streitwert.' },
  { id: 'materiell', titel: 'Materielle Beträge & Quoten',
    lede: 'Was materiell geschuldet ist – Zinsen, Lohnansprüche, Erb- und Güterrechtsquoten, Kapitalgrössen, Steuern und Beiträge.' },
  { id: 'hilfsmittel', titel: 'Hilfsrechner',
    lede: 'Rechtsgebietsübergreifende Rechen-Werkzeuge.' },
];

const PROZESSUAL: ReadonlySet<string> = new Set([
  'streitwert',                       // Art. 91 ff. ZPO (Verfahrensgrösse)
  'prozesskosten',
  'kostenvorschuss',
  'parteientschaedigung-sicherheit',
  'bundesgerichtsgebuehren',
  'betreibungskosten',                // GebV SchKG
  'existenzminimum',                  // Art. 93 SchKG (Vollstreckung)
]);

const HILFSMITTEL: ReadonlySet<string> = new Set([
  'teuerungsrechner',
  'kostenblatt-export',
]);

/** Rubrik einer Karte der Kategorie «Gebühren & Beträge»; Default ist
 *  MATERIELL (Anspruchs-/Quotenrechner sind die Regel, Verfahrenskosten
 *  die explizit gepflegte Ausnahmen-Liste). */
export function gebuehrenRubrik(id: string): GebuehrenRubrik {
  if (PROZESSUAL.has(id)) return 'prozessual';
  if (HILFSMITTEL.has(id)) return 'hilfsmittel';
  return 'materiell';
}
