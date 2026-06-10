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

// Bug-Check §9 10.6.2026 (fachliche Lupe, MITTEL): MATERIELL ebenfalls als
// EXPLIZITE Liste — ein stiller materiell-Default hätte künftige
// prozessuale Karten unauffällig falsch einsortiert (der Test wäre
// tautologisch grün geblieben). Unbekannte IDs → null + Testbruch
// (gleiches Muster wie fristenKategorie).
const MATERIELL: ReadonlySet<string> = new Set([
  'verzugszins', 'schadenszins',
  'lohnfortzahlung', 'arbeit-entschaedigung', 'ferienanspruch', 'ferienkuerzung',
  'dreizehnter-monatslohn', 'ueberstunden-zuschlag',
  'mietzinsanpassung',
  'erbteilung', 'erb-ausgleichung',
  'gueterrecht-vorschlag', 'vorsorgeausgleich',
  'beteiligungsquoten', 'liberierungsgrad', 'kapitalverlust', 'ueberschuldung',
  'verrechnungssteuer', 'grundstueckgewinnsteuer', 'ahv-beitraege',
]);

/** Rubrik einer Karte der Kategorie «Gebühren & Beträge» — null heisst:
 *  noch nicht zugeordnet (der Test bricht; die UI zeigt die Karte nicht
 *  im Register, die «In Vorbereitung»-Zeile bleibt davon unberührt). */
export function gebuehrenRubrik(id: string): GebuehrenRubrik | null {
  if (PROZESSUAL.has(id)) return 'prozessual';
  if (HILFSMITTEL.has(id)) return 'hilfsmittel';
  if (MATERIELL.has(id)) return 'materiell';
  return null;
}
