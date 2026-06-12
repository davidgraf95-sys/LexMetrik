// Dossier: bibliothek/recherche/wettbewerbsanalyse-rechtswissen-schweizer-vertraege.md
import type { VorlageSchema, Antworten, Baustein } from './engine';
import { assemble } from './engine';
import { fmtDatum, fmtCHF, zahl } from './datum';
import { istGueltigesISO } from '../datumsUtils';
import {
  type KdgBasisAntworten, KDG_BASIS_DEFAULTS, kdgBasisAbgeleitet,
  kdgDatumzeile, kdgSchluss,
} from './kuendigungGemeinsam';

// ─── Verjährungsverzichtserklärung (Art. 141 OR) ────────────────────────────
//
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V2).
// Wortlaut am Filestore-Cache verifiziert (12.6.2026, OR-Konsolidierung
// 20260101): Art. 141 Abs. 1 («Der Schuldner kann ab Beginn der Verjährung
// jeweils für höchstens zehn Jahre auf die Erhebung der Verjährungseinrede
// verzichten»), Abs. 1bis (SCHRIFTFORM; in AGB kann nur der VERWENDER
// verzichten), Abs. 2 (Verzicht eines Solidarschuldners wirkt nicht gegen
// die übrigen), Abs. 3 (dito unteilbare Leistung; Bürge beim Verzicht des
// Hauptschuldners), Abs. 4 (Versicherer bei direktem Forderungsrecht).
//
// Fachliche Festlegungen:
// - ABSENDER ist die SCHULDNERSEITE (nur der Schuldner kann verzichten).
// - Die Höchstdauer läuft ab BEGINN DER VERJÄHRUNG, nicht ab der Erklärung.
//   Weil der Verjährungsbeginn oft nicht sicher feststeht, trägt der
//   Verzichts-Baustein IMMER die salvatorische Begrenzung «längstens für
//   die nach Art. 141 Abs. 1 OR zulässige Höchstdauer» — das Dokument kann
//   die gesetzliche Grenze damit nie überschreiten. Liegt das gewählte
//   Enddatum mehr als zehn Jahre nach dem ERKLÄRUNGSDATUM, ist es SICHER
//   übermässig (Beginn liegt zwingend davor) → Blocker.
// - Der Standard-Vorbehalt «soweit nicht bereits eingetreten» und die
//   Klarstellung «keine Anerkennung» (Abregrenzung zu Art. 135 Ziff. 1 OR)
//   sind Praxis-Standard und abwählbar.

export type VvAntworten = KdgBasisAntworten & {
  forderungBeschrieb: string;     // z. B. «Werklohnforderung aus Werkvertrag vom …»
  betragErfassen: boolean;
  betrag: string;                 // CHF, optional (Nutzer-String)
  verzichtBis: string;            // ISO — Ende des Verzichts
  vorbehaltEingetreten: boolean;  // «soweit nicht bereits eingetreten»
  keineAnerkennung: boolean;      // Abgrenzung Art. 135 Ziff. 1 OR
};

export const VV_DEFAULTS: VvAntworten = {
  ...KDG_BASIS_DEFAULTS,
  forderungBeschrieb: '',
  betragErfassen: false, betrag: '',
  verzichtBis: '',
  vorbehaltEingetreten: true,
  keineAnerkennung: true,
};

// ── Gates/Hinweise (deterministisch, normverifiziert) ───────────────────────

export type VvGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

/** Höchstdauer-Vergleich als reine ISO-String-Arithmetik (Jahr + 10), keine
 *  Date-Objekte (Datums-Konvention; lexikografischer Vergleich genügt). */
export function vvUeberHoechstdauer(datumISO: string, verzichtBisISO: string): boolean {
  if (!istGueltigesISO(datumISO) || !istGueltigesISO(verzichtBisISO)) return false;
  const max = `${Number(datumISO.slice(0, 4)) + 10}${datumISO.slice(4)}`;
  return verzichtBisISO > max;
}

export function pruefeVvGates(a: VvAntworten): VvGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  if (istGueltigesISO(a.verzichtBis) && istGueltigesISO(a.datum) && a.verzichtBis <= a.datum) {
    blocker.push('Das Verzichts-Ende muss nach dem Erklärungsdatum liegen.');
  }
  if (vvUeberHoechstdauer(a.datum, a.verzichtBis)) {
    blocker.push(
      'Das gewählte Ende liegt mehr als zehn Jahre nach dem Erklärungsdatum – die Höchstdauer '
      + 'läuft aber schon ab BEGINN der Verjährung (Art. 141 Abs. 1 OR) und wäre damit sicher '
      + 'überschritten. Enddatum kürzen; ein späterer ERNEUTER Verzicht bleibt möglich («jeweils»).',
    );
  }
  hinweise.push(
    'Die Höchstdauer von zehn Jahren läuft ab BEGINN der Verjährung, nicht ab dieser Erklärung '
    + '(Art. 141 Abs. 1 OR). Die Erklärung enthält darum die ausdrückliche Begrenzung auf die '
    + 'gesetzlich zulässige Höchstdauer. Der Verzicht kann später erneuert werden («jeweils»).',
  );
  hinweise.push(
    'SCHRIFTFORM ist Gültigkeitsvoraussetzung (Art. 141 Abs. 1bis OR) – drucken und von der '
    + 'Schuldnerseite unterschreiben lassen. In allgemeinen Geschäftsbedingungen kann nur der '
    + 'VERWENDER der AGB verzichten.',
  );
  hinweise.push(
    'Wirkungsgrenzen: Der Verzicht eines Solidarschuldners kann den übrigen Solidarschuldnern '
    + 'nicht entgegengehalten werden (Art. 141 Abs. 2 OR); dasselbe gilt unter Schuldnern einer '
    + 'unteilbaren Leistung und für den Bürgen beim Verzicht des Hauptschuldners (Abs. 3). '
    + 'Bei direktem Forderungsrecht gegen einen Versicherer wirkt der Verzicht auch ihm '
    + 'gegenüber und umgekehrt (Abs. 4).',
  );
  return { blocker, warnungen, hinweise };
}

// ── Brief-Anatomie ──────────────────────────────────────────────────────────

const vvAbsender: Baustein = {
  id: 'VV_absender', rolle: 'absender', text: '{{absenderBlock}}',
  begruendung: 'Schuldnerin/Schuldner als erklärende Partei – nur sie kann verzichten (Art. 141 Abs. 1 OR).',
};
const vvAdressat: Baustein = {
  id: 'VV_adressat', rolle: 'adressat', text: '{{adressatBlock}}',
  begruendung: 'Gläubigerin/Gläubiger als Empfänger der Erklärung.',
};
const vvUnterschrift: Baustein = {
  id: 'VV_unterschrift', rolle: 'unterschrift',
  text: '___________________________\n{{absenderName}}',
  begruendung: 'Unterschrift der Schuldnerseite – Schriftform ist Gültigkeitsvoraussetzung (Art. 141 Abs. 1bis OR).',
};

// ── Schema ──────────────────────────────────────────────────────────────────

export const VV_SCHEMA: VorlageSchema = {
  id: 'verjaehrungsverzicht',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Wettbewerbsanalyse V2; Art. 141 OR verifiziert 20260101)',
  titel: 'Verjährungsverzichtserklärung',
  disclaimer:
    'Erstellt mit LexMetrik. Keine Rechtsberatung. Der Verzicht gilt längstens für die '
    + 'gesetzlich zulässige Höchstdauer (Art. 141 Abs. 1 OR); massgebend sind Gesetz und '
    + 'konkreter Sachverhalt.',
  bausteine: [
    vvAbsender,
    vvAdressat,
    kdgDatumzeile('VV_datumzeile'),
    { id: 'VV_betreff', rolle: 'betreff',
      text: 'Verzicht auf die Einrede der Verjährung – {{forderungBeschrieb}}',
      begruendung: 'Betreff mit bestimmter Bezeichnung der Forderung.' },
    { id: 'VV_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren',
      begruendung: 'Anrede – immer enthalten.' },
    { id: 'VV_verzicht',
      text: 'Hinsichtlich Ihrer Forderung ({{forderungBeschrieb}}{{betragSatz}}) verzichte ich '
        + 'hiermit bis zum {{verzichtBisFmt}} auf die Erhebung der Einrede der Verjährung – '
        + 'längstens jedoch für die nach Art. 141 Abs. 1 OR zulässige Höchstdauer von zehn '
        + 'Jahren ab Beginn der Verjährung.',
      norm: 'Art. 141 Abs. 1 OR',
      begruendung: 'Kern der Erklärung: befristeter Einredeverzicht mit salvatorischer Begrenzung auf die gesetzliche Höchstdauer – das Dokument kann die Grenze des Art. 141 Abs. 1 OR damit nie überschreiten.' },
    { id: 'VV_vorbehalt',
      text: 'Dieser Verzicht gilt nur, soweit die Verjährung im Zeitpunkt des Zugangs dieser Erklärung nicht bereits eingetreten ist.',
      includeIf: { feld: 'vorbehaltEingetreten', eq: true },
      begruendung: 'Praxis-Standard: bereits eingetretene Verjährung bleibt vorbehalten (ein nachträglicher Verzicht auf die bereits eingetretene Verjährung wäre eine weitergehende Erklärung).' },
    { id: 'VV_keine_anerkennung',
      text: 'Mit dieser Erklärung ist keine Anerkennung der Forderung im Sinne von Art. 135 Ziff. 1 OR und keine Anerkennung ihres Bestands oder ihrer Höhe verbunden.',
      includeIf: { feld: 'keineAnerkennung', eq: true },
      norm: 'Art. 135 Ziff. 1 OR',
      begruendung: 'Abgrenzung zur verjährungsunterbrechenden Anerkennung – der Verzicht auf die Einrede ist keine Anerkennung der Forderung; die Klarstellung verhindert die gegenteilige Deutung.' },
    kdgSchluss('VV_schluss'),
    vvUnterschrift,
  ],
};

// ── Zusammenstellung ────────────────────────────────────────────────────────
//
// Blanko-Grundsatz (Daueranweisung David 12.6.2026: Vorlagen auch unausgefüllt
// herunterladbar): leere Pflicht-Platzhalter füllt die ENGINE als «________»;
// optionale Fragmente enden auf «…Satz» und verschwinden leer (Konvention
// engine.ts formatiere()).

export function vvZusammenstellen(a: VvAntworten) {
  const betragFmt = zahl(a.betrag) !== null ? fmtCHF(a.betrag) : '________';
  const antworten: Antworten = {
    ...a,
    ...kdgBasisAbgeleitet(a),
    betragSatz: a.betragErfassen ? `, CHF ${betragFmt}` : '',
    verzichtBisFmt: istGueltigesISO(a.verzichtBis) ? fmtDatum(a.verzichtBis) : '',
  };
  return { ergebnis: assemble(VV_SCHEMA, antworten) };
}
