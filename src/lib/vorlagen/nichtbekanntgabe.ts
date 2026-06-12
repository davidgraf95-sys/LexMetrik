// Dossier: bibliothek/recherche/wettbewerbsanalyse-rechtswissen-schweizer-vertraege.md
import { addDays, addMonths, parseISO } from 'date-fns';
import type { VorlageSchema, Antworten, Baustein } from './engine';
import { assemble } from './engine';
import { fmtDatum } from './datum';
import { istGueltigesISO, formatISO } from '../datumsUtils';
import {
  type KdgBasisAntworten, KDG_BASIS_DEFAULTS, kdgBasisAbgeleitet,
  kdgDatumzeile, kdgUnterschrift,
} from './kuendigungGemeinsam';

// ─── Gesuch um Nichtbekanntgabe einer Betreibung (Art. 8a Abs. 3 lit. d SchKG)
//
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 («Löschungsgesuch
// Betreibungsregisterauszug», FAHRPLAN-VORLAGEN-AUSBAU V2). Wortlaut am
// Filestore-Cache verifiziert (13.6.2026, SchKG-Konsolidierung 20260101):
// Art. 8a Abs. 3 lit. d in der NEUEN FASSUNG gemäss BG vom 21.3.2025
// (Nichtbekanntgabe von Betreibungseinträgen), IN KRAFT SEIT 1.1.2026
// (AS 2025 522): Voraussetzungen sind (1) erhobener RECHTSVORSCHLAG,
// (2) Gesuch NACH Ablauf von drei Monaten seit Zustellung des
// Zahlungsbefehls und (3) vor Erlöschen des Einsichtsrechts Dritter
// (Abs. 4: fünf Jahre nach Abschluss des Verfahrens). Das BETREIBUNGSAMT
// setzt dem Gläubiger eine 20-tägige Frist für den Nachweis eines
// Verfahrens zur Beseitigung des Rechtsvorschlags (Art. 79–84); wird der
// Nachweis nachträglich erbracht oder die Betreibung fortgesetzt, wird
// sie Dritten wieder zur Kenntnis gebracht — ausser der Schuldner weist
// nach, dass ein Beseitigungs-Begehren definitiv nicht gutgeheissen wurde.
//
// Fachliche Festlegungen:
// - «Löschung» ist die geläufige Bezeichnung; rechtlich wird der Eintrag
//   nicht gelöscht, sondern Dritten NICHT MEHR BEKANNT GEGEBEN — die
//   Vorlage benennt das ehrlich (§8).
// - 3-Monats-Frist deterministisch: Ende = gleichbezeichneter Tag drei
//   Monate nach der Zustellung (Monatsende-Klemmung via date-fns
//   addMonths); das Gesuch ist NACH Ablauf zulässig → frühester
//   Gesuchstag = Folgetag. Gesuchsdatum davor → Blocker.
// - Die Behauptung «kein Beseitigungs-Verfahren bekannt» ist abwählbar —
//   den Nachweis verlangt das Amt ohnehin beim Gläubiger.

export type NbAntworten = KdgBasisAntworten & {
  // absender* = Schuldnerin/Schuldner, adressat* = Betreibungsamt
  betreibungNr: string;
  glaeubigerName: string;         // optional
  zustellungZb: string;           // ISO – Zustellung des Zahlungsbefehls
  rechtsvorschlag: boolean;       // Pflicht-Voraussetzung
  keinVerfahrenBekannt: boolean;  // abwählbare Zusatz-Aussage
  beilageZb: boolean;             // Beilage: Kopie Zahlungsbefehl
};

export const NB_DEFAULTS: NbAntworten = {
  ...KDG_BASIS_DEFAULTS,
  betreibungNr: '', glaeubigerName: '',
  zustellungZb: '',
  rechtsvorschlag: true,
  keinVerfahrenBekannt: true,
  beilageZb: true,
};

// ── 3-Monats-Schwelle (rein lokal, Monatsende-Klemmung) ─────────────────────

/** Frühester zulässiger Gesuchstag: Folgetag nach Ablauf der drei Monate
 *  seit Zustellung des Zahlungsbefehls (Art. 8a Abs. 3 lit. d SchKG).
 *  KONSERVATIV nach den ZPO-Fristenregeln gerechnet (Art. 31 SchKG):
 *  der Lauf beginnt am Folgetag der Zustellung (Art. 142 Abs. 1 ZPO) und
 *  endet am gleichbezeichneten Tag des dritten Monats (Abs. 2,
 *  Monatsende-Klemmung via date-fns addMonths); das Gesuch ist NACH
 *  Ablauf zulässig → frühester Tag = Folgetag des Fristendes. Die
 *  mildere OR-77-Lesart (Ende am gleichbezeichneten Tag der Zustellung)
 *  käme einen Tag früher — Review-Befund 13.6.2026: am Grenztag wäre
 *  die Abweisung als verfrüht riskiert, darum die sichere Variante. */
export function nbFruehesterGesuchstag(zustellungISO: string): string | null {
  if (!istGueltigesISO(zustellungISO)) return null;
  return formatISO(addDays(addMonths(addDays(parseISO(zustellungISO), 1), 3), 1));
}

// ── Gates (deterministisch, normverifiziert) ────────────────────────────────

export type NbGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeNbGates(a: NbAntworten): NbGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  if (!a.rechtsvorschlag) {
    blocker.push(
      'Voraussetzung des Gesuchs ist, dass RECHTSVORSCHLAG erhoben wurde (Art. 8a Abs. 3 '
      + 'lit. d SchKG). Ohne Rechtsvorschlag kommt dieser Weg nicht in Betracht; je nach Lage '
      + 'bleiben die übrigen Tatbestände von Art. 8a Abs. 3 SchKG (nichtige/aufgehobene oder '
      + 'zurückgezogene Betreibung, obsiegende Rückforderungsklage).',
    );
  }
  const fruehester = nbFruehesterGesuchstag(a.zustellungZb);
  // ISO-String-Vergleiche genügen (Datums-Konvention).
  if (fruehester && istGueltigesISO(a.datum) && a.datum < fruehester) {
    blocker.push(
      'Das Gesuch ist erst NACH Ablauf von drei Monaten seit der Zustellung des Zahlungsbefehls '
      + `zulässig (Art. 8a Abs. 3 lit. d SchKG) – frühestens am ${fmtDatum(fruehester)}.`,
    );
  }
  hinweise.push(
    'Verfahren beim Amt: Das Betreibungsamt setzt dem Gläubiger eine Frist von 20 Tagen für den '
    + 'Nachweis, dass rechtzeitig ein Verfahren zur Beseitigung des Rechtsvorschlags eingeleitet '
    + 'wurde (Art. 79–84 SchKG). Bleibt der Nachweis aus, wird die Betreibung Dritten nicht mehr '
    + 'bekannt gegeben (Art. 8a Abs. 3 lit. d SchKG, Fassung in Kraft seit 1.1.2026).',
  );
  hinweise.push(
    'Keine Löschung im engeren Sinn: Der Eintrag bleibt bestehen und wird Dritten wieder bekannt '
    + 'gegeben, wenn der Nachweis nachträglich erbracht oder die Betreibung fortgesetzt wird – '
    + 'ausser es wird nachgewiesen, dass ein Begehren um Beseitigung des Rechtsvorschlags '
    + 'definitiv nicht gutgeheissen wurde.',
  );
  hinweise.push(
    'Das Einsichtsrecht Dritter erlischt ohnehin fünf Jahre nach Abschluss des Verfahrens '
    + '(Art. 8a Abs. 4 SchKG); das Gesuch wirkt nur innerhalb dieses Fensters.',
  );
  if (a.keinVerfahrenBekannt) {
    warnungen.push(
      'Die Aussage «kein Beseitigungs-Verfahren bekannt» nur stehen lassen, wenn sie zutrifft – '
      + 'ist eine Rechtsöffnung oder Anerkennungsklage hängig, ist das Gesuch aussichtslos.',
    );
  }
  return { blocker, warnungen, hinweise };
}

// ── Brief-Anatomie ──────────────────────────────────────────────────────────

const nbAbsender: Baustein = {
  id: 'NB_absender', rolle: 'absender', text: '{{absenderBlock}}',
  begruendung: 'Schuldnerin/Schuldner als gesuchstellende Partei.',
};
const nbAdressat: Baustein = {
  id: 'NB_adressat', rolle: 'adressat', text: '{{adressatBlock}}',
  begruendung: 'Das Betreibungsamt, das die Betreibung führt – es entscheidet über die Nichtbekanntgabe (Art. 8a Abs. 3 lit. d SchKG).',
};

// ── Schema ──────────────────────────────────────────────────────────────────

export const NB_SCHEMA: VorlageSchema = {
  id: 'nichtbekanntgabe-betreibung',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Wettbewerbsanalyse V2; Art. 8a SchKG, Fassung 1.1.2026, verifiziert 20260101)',
  titel: 'Gesuch um Nichtbekanntgabe einer Betreibung',
  disclaimer:
    'Erstellt mit LexMetrik. Keine Rechtsberatung. Der Eintrag wird nicht gelöscht, sondern '
    + 'Dritten nicht mehr bekannt gegeben (Art. 8a Abs. 3 lit. d SchKG); massgebend sind Gesetz '
    + 'und konkreter Sachverhalt.',
  bausteine: [
    nbAbsender,
    nbAdressat,
    kdgDatumzeile('NB_datumzeile'),
    { id: 'NB_betreff', rolle: 'betreff',
      text: 'Gesuch um Nichtbekanntgabe der Betreibung Nr. {{betreibungNr}} (Art. 8a Abs. 3 lit. d SchKG)',
      begruendung: 'Betreff mit Betreibungsnummer zur eindeutigen Zuordnung.' },
    { id: 'NB_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren',
      begruendung: 'Anrede – immer enthalten.' },
    { id: 'NB_sachverhalt',
      text: 'In der Betreibung Nr. {{betreibungNr}}{{glaeubigerSatz}} wurde mir der Zahlungsbefehl '
        + 'am {{zustellungFmt}} zugestellt. Ich habe Rechtsvorschlag erhoben.',
      begruendung: 'Sachverhalt mit den beiden Tatbestands-Anknüpfungen: Zustellungsdatum (Fristbeginn) und erhobener Rechtsvorschlag.' },
    { id: 'NB_antrag',
      text: 'Da seit der Zustellung des Zahlungsbefehls mehr als drei Monate verstrichen sind, '
        + 'ersuche ich Sie, diese Betreibung Dritten nicht mehr zur Kenntnis zu geben.',
      norm: 'Art. 8a Abs. 3 lit. d SchKG',
      begruendung: 'Kern des Gesuchs: Antrag auf Nichtbekanntgabe nach Ablauf der 3-Monats-Frist (Art. 8a Abs. 3 lit. d SchKG, Fassung in Kraft seit 1.1.2026).' },
    { id: 'NB_kein_verfahren',
      text: 'Ein Verfahren zur Beseitigung des Rechtsvorschlags ist mir nicht bekannt.',
      includeIf: { feld: 'keinVerfahrenBekannt', eq: true },
      begruendung: 'Abwählbare Zusatz-Aussage – den förmlichen Nachweis verlangt das Amt beim Gläubiger (20-Tage-Frist, Art. 79–84 SchKG).' },
    { id: 'NB_beilage',
      text: 'Beilage: Kopie des Zahlungsbefehls.',
      includeIf: { feld: 'beilageZb', eq: true },
      begruendung: 'Beilagen-Zeile – erleichtert dem Amt die Zuordnung.' },
    { id: 'NB_dank',
      text: 'Ich danke Ihnen für die Prüfung dieses Gesuchs und stehe für Rückfragen zur Verfügung.',
      begruendung: 'Schlusssatz – immer enthalten.' },
    { id: 'NB_schluss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen',
      begruendung: 'Schlussformel – immer enthalten.' },
    kdgUnterschrift('NB_unterschrift', 'absenderName', 'Unterschrift der gesuchstellenden Partei.'),
  ],
};

// ── Zusammenstellung ────────────────────────────────────────────────────────
//
// Blanko-Grundsatz (Daueranweisung David 12.6.2026): leere Pflicht-Platzhalter
// füllt die ENGINE als «________»; optionale Fragmente enden auf «…Satz» und
// verschwinden leer (Konvention engine.ts formatiere()).

export function nbZusammenstellen(a: NbAntworten) {
  const antworten: Antworten = {
    ...a,
    ...kdgBasisAbgeleitet(a),
    glaeubigerSatz: a.glaeubigerName.trim() ? ` (Gläubigerin: ${a.glaeubigerName.trim()})` : '',
    zustellungFmt: istGueltigesISO(a.zustellungZb) ? fmtDatum(a.zustellungZb) : '',
  };
  return { ergebnis: assemble(NB_SCHEMA, antworten) };
}
