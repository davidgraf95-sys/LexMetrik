// Dossier: bibliothek/recherche/wettbewerbsanalyse-rechtswissen-schweizer-vertraege.md
import type { VorlageSchema, Antworten, Baustein } from './engine';
import { assemble } from './engine';
import { fmtCHF, zahl } from './datum';
import {
  type KdgBasisAntworten, KDG_BASIS_DEFAULTS, kdgBasisAbgeleitet,
  kdgDatumzeile, kdgSchluss,
} from './kuendigungGemeinsam';

// ─── Abtretungserklärung / Zession (Art. 164 ff. OR) ────────────────────────
//
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V2).
// Wortlaute am Filestore-Cache verifiziert (12.6.2026, OR-Konsolidierung
// 20260101): Art. 164 Abs. 1 (Abtretung ohne Einwilligung des Schuldners,
// «soweit nicht Gesetz, Vereinbarung oder Natur des Rechtsverhältnisses
// entgegenstehen»), Art. 165 Abs. 1 (SCHRIFTFORM als Gültigkeits-
// voraussetzung), Abs. 2 (Verpflichtungsgeschäft formfrei), Art. 167
// (gutgläubige Zahlung an den bisherigen Gläubiger vor Anzeige befreit),
// Art. 170 Abs. 1 (Vorzugs-/Nebenrechte gehen über), Abs. 2 (Schuldurkunde/
// Beweismittel ausliefern), Abs. 3 (Vermutung: rückständige Zinse gehen mit).
//
// Fachliche Festlegungen:
// - ABSENDER ist die ZEDENTIN/der ZEDENT (abtretende Gläubigerseite) — nur
//   ihre Unterschrift verlangt die Schriftform; die Annahme durch die
//   Zessionarin ist formfrei möglich. Eine optionale Gegenzeichnungs-Zeile
//   schafft Klarheit, ist aber keine Gültigkeitsvoraussetzung.
// - Die Erklärung ist das VERFÜGUNGSGESCHÄFT. Verpflichtungsgeschäft
//   (z. B. Forderungskauf) und Gewährleistung (Art. 171 ff. OR) sind
//   bewusst NICHT Teil der Vorlage (Known Limitation, §8).
// - Die Zinsen-Mitabtretung ist nach Art. 170 Abs. 3 OR nur VERMUTET —
//   der abwählbare Standard-Baustein stellt sie ausdrücklich klar.

export type FaAntworten = KdgBasisAntworten & {
  schuldnerName: string;
  schuldnerAdresse: string;       // optional
  forderungBeschrieb: string;     // z. B. «Kaufpreisforderung aus Kaufvertrag vom …»
  betragErfassen: boolean;
  betrag: string;                 // CHF, optional (Nutzer-String)
  zinsenAusdruecklich: boolean;   // Klarstellung statt blosser Vermutung (Art. 170 Abs. 3 OR)
  urkundenUebergabe: boolean;     // Ausliefer-Zusage (Art. 170 Abs. 2 OR)
  anzeigeAnkuendigen: boolean;    // Ankündigung der Schuldner-Anzeige (Praxis zu Art. 167 OR)
  annahmeZeile: boolean;          // Gegenzeichnung der Zessionarin (formfrei, Klarheit)
};

export const FA_DEFAULTS: FaAntworten = {
  ...KDG_BASIS_DEFAULTS,
  schuldnerName: '', schuldnerAdresse: '',
  forderungBeschrieb: '',
  betragErfassen: false, betrag: '',
  zinsenAusdruecklich: true,
  urkundenUebergabe: true,
  anzeigeAnkuendigen: true,
  annahmeZeile: true,
};

// ── Gates/Hinweise (deterministisch, normverifiziert) ───────────────────────

export type FaGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

/** Hinweise sind bewusst eingabe-unabhängig (kein Datums-/Betrags-Gate nötig);
 *  die Pflichtfelder prüft der Wizard je Schritt. */
export function pruefeFaGates(): FaGateErgebnis {
  const hinweise: string[] = [];
  hinweise.push(
    'SCHRIFTFORM ist Gültigkeitsvoraussetzung der Abtretung (Art. 165 Abs. 1 OR) – drucken '
    + 'und von der abtretenden Partei (Zedentin/Zedent) unterschreiben lassen. Die Annahme '
    + 'durch die Erwerberin ist formfrei möglich; die Gegenzeichnungs-Zeile dient der Klarheit.',
  );
  hinweise.push(
    'ABTRETBARKEIT prüfen: Die Abtretung ist ausgeschlossen, soweit Gesetz, Vereinbarung '
    + 'oder die Natur des Rechtsverhältnisses entgegenstehen (Art. 164 Abs. 1 OR) – '
    + 'insbesondere ein vertragliches Abtretungsverbot im Grundvertrag.',
  );
  hinweise.push(
    'ANZEIGE an den Schuldner nachweisbar zustellen: Bis zur Anzeige kann er in gutem '
    + 'Glauben mit befreiender Wirkung an die bisherige Gläubigerin leisten (Art. 167 OR).',
  );
  hinweise.push(
    'NICHT GEGENSTAND dieser Vorlage: das Verpflichtungsgeschäft (z. B. Forderungskauf; '
    + 'formfrei, Art. 165 Abs. 2 OR) und die Gewährleistung der Zedentin (Art. 171 ff. OR) – '
    + 'bei entgeltlicher Abtretung haftet sie für den Bestand der Forderung.',
  );
  return { blocker: [], warnungen: [], hinweise };
}

// ── Brief-Anatomie ──────────────────────────────────────────────────────────

const faAbsender: Baustein = {
  id: 'FA_absender', rolle: 'absender', text: '{{absenderBlock}}',
  begruendung: 'Zedentin/Zedent als erklärende Partei – ihre Unterschrift verlangt die Schriftform (Art. 165 Abs. 1 OR).',
};
const faAdressat: Baustein = {
  id: 'FA_adressat', rolle: 'adressat', text: '{{adressatBlock}}',
  begruendung: 'Zessionarin/Zessionar als Erwerberin der Forderung und Empfängerin der Erklärung.',
};
const faUnterschrift: Baustein = {
  id: 'FA_unterschrift', rolle: 'unterschrift',
  text: '___________________________\n{{absenderName}} (Zedentin/Zedent)',
  begruendung: 'Unterschrift der abtretenden Partei – Schriftform ist Gültigkeitsvoraussetzung (Art. 165 Abs. 1 OR).',
};

// ── Schema ──────────────────────────────────────────────────────────────────

export const FA_SCHEMA: VorlageSchema = {
  id: 'forderungsabtretung',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Wettbewerbsanalyse V2; Art. 164/165/167/170 OR verifiziert 20260101)',
  titel: 'Abtretungserklärung (Zession)',
  disclaimer:
    'Erstellt mit LexMetrik. Keine Rechtsberatung. Die Abtretung setzt die Abtretbarkeit der '
    + 'Forderung voraus (Art. 164 Abs. 1 OR); massgebend sind Gesetz und konkreter Sachverhalt.',
  bausteine: [
    faAbsender,
    faAdressat,
    kdgDatumzeile('FA_datumzeile'),
    { id: 'FA_betreff', rolle: 'betreff',
      text: 'Abtretungserklärung (Zession) – {{forderungBeschrieb}}',
      begruendung: 'Betreff mit bestimmter Bezeichnung der abgetretenen Forderung.' },
    { id: 'FA_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren',
      begruendung: 'Anrede – immer enthalten.' },
    { id: 'FA_abtretung',
      text: 'Hiermit trete ich meine Forderung gegen {{schuldnerName}}{{schuldnerAdresseSatz}} '
        + '({{forderungBeschrieb}}{{betragSatz}}) an Sie ab. Mit der Forderung gehen die Vorzugs- '
        + 'und Nebenrechte auf Sie über, soweit sie nicht untrennbar mit meiner Person verknüpft '
        + 'sind (Art. 170 Abs. 1 OR).',
      norm: 'Art. 164 Abs. 1 und Art. 165 Abs. 1 OR',
      begruendung: 'Kern der Erklärung: Verfügung über die bestimmt bezeichnete Forderung; der gesetzliche Übergang der Nebenrechte wird deklaratorisch wiedergegeben.' },
    { id: 'FA_zinsen',
      text: 'Mitabgetreten sind ausdrücklich auch die rückständigen Zinse.',
      includeIf: { feld: 'zinsenAusdruecklich', eq: true },
      norm: 'Art. 170 Abs. 3 OR',
      begruendung: 'Klarstellung: Der Übergang der rückständigen Zinse ist von Gesetzes wegen nur VERMUTET (Art. 170 Abs. 3 OR) – die ausdrückliche Nennung stellt ihn ausser Streit.' },
    { id: 'FA_urkunden',
      text: 'Die Schuldurkunde und die vorhandenen Beweismittel händige ich Ihnen aus; die zur '
        + 'Geltendmachung der Forderung nötigen Aufschlüsse erteile ich Ihnen.',
      includeIf: { feld: 'urkundenUebergabe', eq: true },
      norm: 'Art. 170 Abs. 2 OR',
      begruendung: 'Wiedergabe der gesetzlichen Auslieferungs- und Auskunftspflicht der Zedentin (Art. 170 Abs. 2 OR) als ausdrückliche Zusage.' },
    { id: 'FA_anzeige',
      text: 'Der Schuldner wird über die Abtretung schriftlich in Kenntnis gesetzt.',
      includeIf: { feld: 'anzeigeAnkuendigen', eq: true },
      begruendung: 'Praxis-Standard: Bis zur Anzeige kann der Schuldner in gutem Glauben befreiend an die bisherige Gläubigerin leisten (Art. 167 OR) – die Ankündigung dokumentiert die vorgesehene Anzeige.' },
    kdgSchluss('FA_schluss'),
    faUnterschrift,
    { id: 'FA_annahme', rolle: 'unterschrift',
      text: 'Von der Abtretung Kenntnis genommen und mit ihr einverstanden:\n'
        + '___________________________\n{{adressatName}} (Zessionarin/Zessionar)',
      includeIf: { feld: 'annahmeZeile', eq: true },
      begruendung: 'Gegenzeichnung der Erwerberin – formfrei möglich und keine Gültigkeitsvoraussetzung; sie dokumentiert die Annahme.' },
  ],
};

// ── Zusammenstellung ────────────────────────────────────────────────────────
//
// Blanko-Grundsatz (Daueranweisung David 12.6.2026): leere Pflicht-Platzhalter
// füllt die ENGINE als «________»; optionale Fragmente enden auf «…Satz» und
// verschwinden leer (Konvention engine.ts formatiere()).

export function faZusammenstellen(a: FaAntworten) {
  const betragFmt = zahl(a.betrag) !== null ? fmtCHF(a.betrag) : '________';
  const antworten: Antworten = {
    ...a,
    ...kdgBasisAbgeleitet(a),
    schuldnerAdresseSatz: a.schuldnerAdresse.trim() ? `, ${a.schuldnerAdresse.trim()}` : '',
    betragSatz: a.betragErfassen ? `, CHF ${betragFmt}` : '',
  };
  return { ergebnis: assemble(FA_SCHEMA, antworten) };
}
