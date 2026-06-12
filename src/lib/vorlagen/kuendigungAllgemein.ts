// Dossier: bibliothek/recherche/kuendigungs-masken.md
import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { fmtDatum } from './datum';
import { parseISO, addDays } from 'date-fns';
import { formatDatum } from '../datumsUtils';
import {
  type KdgBasisAntworten, KDG_BASIS_DEFAULTS, kdgBasisAbgeleitet,
  kdgAbsender, kdgAdressat, kdgDatumzeile, kdgSchluss, kdgUnterschrift,
} from './kuendigungGemeinsam';

// ─── Maske 3: Allgemeine Vertragskündigung (Dauerschuldverhältnisse) ────────
//
// Bauspezifikation: bibliothek/recherche/kuendigungs-masken.md (6.6.2026).
// EINE generische Maske + Presets, die Norm-Anker, Bausteine und Hinweise
// setzen. KEINE Fristberechnung, wo kein Spezialgesetz greift (§2 — ehrlich);
// einzig das Darlehen erhält die 6-Wochen-Arithmetik des Art. 318 OR (reine
// Datums-Addition, keine Rechtsregel-Engine).
//
// VVG-Wortlaute am Filestore-Cache verifiziert (6.6.2026, Konsolidierung
// 20240101 — Spez.-TODOs aufgelöst): Art. 35a Abs. 1 (Ende des dritten oder
// jedes folgenden Jahres, 3 Monate, schriftlich oder textnachweisbar),
// Abs. 2 (frühere Kündbarkeit vereinbar; gleiche Fristen für beide),
// Abs. 3 (LEBENSVERSICHERUNG vom ordentlichen Kündigungsrecht ausgenommen),
// Abs. 4 (Krankenzusatz: Kündigungsrechte nur dem Versicherungsnehmer);
// Art. 35b (wichtiger Grund, jederzeit); Art. 35c (laufende Leistungen
// geschützt). Zwingend-Klassifikation: 35a halbzwingend (Art. 98 VVG),
// 35b/35c absolut zwingend (Art. 97 VVG).
// Presets 'arbeitsvertrag' und 'miete_moebliert' der Spez. sind KEINE
// Dokument-Pfade — die Seite verweist auf die Masken 1a/1b bzw. 2a.
//
// KVG-Preset 'krankenkasse' (11.6.2026, Dossier bibliothek/recherche/
// kvg-grundversicherung-kuendigung.md; Wortlaute am 20260101-Cache
// verifiziert): Art. 7 Abs. 1 KVG (3 Monate auf Kalendersemester-Ende),
// Abs. 2 (Prämienmitteilung: 1 Monat auf Ende des Vormonats der neuen
// Prämie — der 30.-November-Fall), Abs. 5 (nahtloser Wechsel), Abs. 7/8
// (Koppelungsverbot Zusatzversicherungen); Art. 64a Abs. 6 KVG
// (Ausstands-Sperre); Art. 94 Abs. 2 / Art. 100 Abs. 3 KVV (besondere
// Versicherungsformen: ordentlicher Wechsel nur auf Jahresende).

export type KvPreset = 'generisch' | 'versicherung' | 'krankenkasse' | 'darlehen' | 'auftrag' | 'abo_telecom';

export type KvAntworten = KdgBasisAntworten & {
  preset: KvPreset;
  vertragsBezeichnung: string;
  vertragsnummer: string;
  zugang: string;                    // ISO (erwarteter Zugang)
  aufNaechstmoeglich: boolean;
  kuendigungsterminWunsch: string;   // ISO (nur wenn nicht «nächstmöglich»)
  // Preset versicherung
  vertragsdauerUeber3Jahre: boolean;
  lebensversicherung: boolean;
  krankenzusatz: boolean;
  policennummer: string;
  // Preset krankenkasse (Grundversicherung, Art. 7 KVG)
  kkGrund: 'praemienmitteilung' | 'ordentlich';
  kkBesondereForm: boolean;          // wählbare Franchise / eingeschränkte Wahl (HMO u. ä.)
  kkAusstaende: boolean;             // offene Prämien/Kostenbeteiligungen → Wechselsperre 64a Abs. 6
  kkVersichertennummer: string;
  // Preset darlehen
  aufforderungDatum: string;         // ISO — 6-Wochen-Frist ab erster Aufforderung
};

export const KV_DEFAULTS: KvAntworten = {
  ...KDG_BASIS_DEFAULTS,
  preset: 'generisch',
  vertragsBezeichnung: '', vertragsnummer: '',
  zugang: '', aufNaechstmoeglich: true, kuendigungsterminWunsch: '',
  vertragsdauerUeber3Jahre: false, lebensversicherung: false, krankenzusatz: false,
  policennummer: '',
  kkGrund: 'praemienmitteilung', kkBesondereForm: false, kkAusstaende: false,
  kkVersichertennummer: '',
  aufforderungDatum: '',
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Darlehen (Art. 318 OR): Rückzahlung innert sechs Wochen ab erster
 *  Aufforderung — reine Datums-Arithmetik (42 Tage), keine Engine. */
export function kvDarlehenRueckzahlungBis(aufforderungISO: string): string | null {
  if (!ISO.test(aufforderungISO)) return null;
  return formatDatum(addDays(parseISO(aufforderungISO), 42));
}

// ── Gates/Hinweise je Preset (alle deterministisch, normverifiziert) ────────

export type KvGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeKvGates(a: KvAntworten): KvGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  if (a.preset === 'versicherung') {
    if (a.lebensversicherung) {
      warnungen.push(
        'Die LEBENSVERSICHERUNG ist vom ordentlichen Kündigungsrecht des Art. 35a VVG ausgenommen '
        + '(Abs. 3) — massgebend sind Vertrag und die besonderen Bestimmungen (z. B. Umwandlung/Rückkauf, '
        + 'Art. 90 ff. VVG). Dieses Schreiben passt dafür nicht ohne Prüfung.',
      );
    }
    if (!a.vertragsdauerUeber3Jahre) {
      warnungen.push(
        'Das ordentliche Kündigungsrecht nach Art. 35a Abs. 1 VVG greift erst auf das Ende des DRITTEN '
        + 'Vertragsjahres. Vorher ist ordentlich nur kündbar, wenn der Vertrag es vorsieht (Abs. 2) — sonst '
        + 'bleibt die ausserordentliche Kündigung aus wichtigem Grund (Art. 35b VVG).',
      );
    }
    if (a.krankenzusatz) {
      hinweise.push(
        'Zusatzversicherung zur sozialen Krankenversicherung: Das ordentliche Kündigungsrecht steht NUR '
        + 'der versicherungsnehmenden Person zu (Art. 35a Abs. 4 VVG) — für Ihre eigene Kündigung ist das '
        + 'günstig; laufende Leistungen bleiben geschützt (Art. 35c VVG, zwingend).',
      );
    }
    hinweise.push('Art. 35a VVG ist halbzwingend (Art. 98 VVG): Vertragsklauseln dürfen nur ZU IHREN GUNSTEN abweichen; Art. 35b/35c sind zwingend (Art. 97 VVG).');
  }
  if (a.preset === 'krankenkasse') {
    if (a.kkAusstaende) {
      warnungen.push(
        'Ausstehende Prämien, Kostenbeteiligungen, Verzugszinse oder Betreibungskosten SPERREN den '
        + 'Versichererwechsel, bis sie vollständig bezahlt sind (Art. 64a Abs. 6 KVG); wer nur Ausstände '
        + 'für seine Kinder hat, darf den Versicherer trotzdem wechseln. Vorbehalten bleiben zudem '
        + 'Wohnort-/Stellenwechsel und Bewilligungsentzug (Art. 7 Abs. 3 und 4 KVG).',
      );
    }
    if (a.kkGrund === 'praemienmitteilung') {
      hinweise.push(
        'Gelten die neuen Prämien ab 1. Januar, muss diese Kündigung bis am 30. November beim Versicherer '
        + 'EINGETROFFEN sein (einmonatige Frist auf das Ende des Vormonats, Art. 7 Abs. 2 KVG) — massgebend '
        + 'ist der Zugang, nicht der Poststempel.',
      );
    } else if (!a.kkBesondereForm) {
      hinweise.push(
        'Ordentliche Termine sind der 30. Juni und der 31. Dezember (Ende des Kalendersemesters); die '
        + 'Kündigung muss drei Monate vorher — bis 31. März bzw. 30. September — zugegangen sein (Art. 7 Abs. 1 KVG).',
      );
    }
    if (a.kkBesondereForm && a.kkGrund === 'ordentlich') {
      hinweise.push(
        'Besondere Versicherungsform (wählbare Franchise, HMO/Hausarzt u. ä.): Der ordentliche Wechsel ist '
        + 'nur auf das Ende des Kalenderjahres möglich (Art. 94 Abs. 2 KVV bzw. Art. 100 Abs. 3 KVV, Fassung '
        + 'in Kraft seit 1.1.2025); die Kündigung auf Prämienmitteilung hin bleibt vorbehalten.',
      );
    }
    hinweise.push(
      'Zuerst den neuen Versicherer wählen und sich aufnehmen lassen: Das Verhältnis beim bisherigen '
      + 'Versicherer endet erst, wenn ihm der neue Versicherer die nahtlose Aufnahme mitgeteilt hat '
      + '(Art. 7 Abs. 5 KVG) — die Versicherungspflicht kennt keine Lücke.',
    );
    hinweise.push(
      'Zusatzversicherungen (VVG) sind von dieser Kündigung NICHT erfasst und werden separat gekündigt '
      + '(Preset «Versicherung (VVG)»); der bisherige Versicherer darf den Wechsel der Grundversicherung '
      + 'nicht an die Kündigung der Zusatzversicherungen koppeln (Art. 7 Abs. 7 und 8 KVG).',
    );
  }
  if (a.preset === 'darlehen') {
    hinweise.push('Ohne vereinbarten Termin oder Frist gilt: Rückzahlung innert SECHS Wochen ab der ersten Aufforderung (Art. 318 OR); eine vereinbarte Regelung geht vor.');
  }
  if (a.preset === 'auftrag') {
    warnungen.push('Kündigung zur UNZEIT verpflichtet zum Ersatz des dadurch verursachten Schadens (Art. 404 Abs. 2 OR). Das jederzeitige Widerrufsrecht selbst ist nach ständiger Rechtsprechung zwingend.');
  }
  if (a.preset === 'abo_telecom') {
    hinweise.push('Kein Spezialgesetz: Massgebend sind die vereinbarten AGB (Mindestlaufzeit, Termine) und die OR-Grundsätze — die Maske berechnet hier bewusst keine Frist (§2).');
  }
  return { blocker, warnungen, hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const KV_SCHEMA: VorlageSchema = {
  id: 'kuendigung-vertrag',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  // 1.0.0→1.1.0: KVG-Preset 'krankenkasse' (deklarierte fachliche Änderung
  // 11.6.2026; bestehende Presets unverändert, kein Golden-Fall betroffen).
  version: '1.1.0 (KVG-Preset 11.6.2026, Art. 7/64a KVG + Art. 94/100 KVV verifiziert 20260101; Basis: Masken-Spez. 6.6.2026, VVG verifiziert 20240101)',
  titel: 'Kündigung',
  disclaimer:
    'Erstellt mit LexMetrik. Keine Rechtsberatung. Massgebend sind Vertrag/AGB und die genannten '
    + 'Gesetzesbestimmungen; der Zugang beim Empfänger entscheidet. Bei Spezialverhältnissen '
    + '(Arbeit, Miete) die spezialisierten Vorlagen verwenden.',
  bausteine: [
    kdgAbsender('V_absender'),
    kdgAdressat('V_adressat'),
    kdgDatumzeile('V_datumzeile'),
    { id: 'V_betreff', rolle: 'betreff',
      text: 'Kündigung — {{vertragsBezeichnung}}{{vertragsnummerSatz}}',
      begruendung: 'Betreff mit Vertragsbezeichnung — immer enthalten.' },
    { id: 'V_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren',
      begruendung: 'Anrede — immer enthalten.' },
    { id: 'V_erklaerung_generisch',
      text: 'Hiermit kündige ich den oben genannten Vertrag {{terminSatz}} unter Einhaltung der vertraglichen bzw. gesetzlichen Frist.',
      includeIf: { feld: 'preset', eq: 'generisch' },
      begruendung: 'Generische Kündigungserklärung — bewusst ohne berechnete Frist (kein Spezialgesetz, §2).' },
    { id: 'V_versicherung',
      text: 'Hiermit kündige ich den Versicherungsvertrag{{policennummerSatz}} ordentlich auf das Ende des dritten bzw. des laufenden Versicherungsjahres unter Einhaltung der dreimonatigen Frist (Art. 35a VVG).',
      includeIf: { feld: 'preset', eq: 'versicherung' },
      norm: 'Art. 35a VVG',
      begruendung: 'Ordentliche VVG-Kündigung (Wortlaut verifiziert: Ende des dritten oder jedes folgenden Jahres, Frist 3 Monate, schriftlich oder textnachweisbar).' },
    // KVG-Grundversicherung: drei regime-treue Pfade (Abs. 2 / Abs. 1 /
    // Abs. 1 i. V. m. KVV-Jahresende) — nie zu einer Regel kollabiert (§1/§4).
    { id: 'V_krankenkasse_praemie',
      text: 'Hiermit kündige ich die obligatorische Krankenpflegeversicherung (Grundversicherung){{kkVersichertenSatz}} im Anschluss an die Mitteilung der neuen Prämie unter Einhaltung der einmonatigen Kündigungsfrist auf das Ende des Monats, der der Gültigkeit der neuen Prämie vorangeht{{kkWunschterminSatz}} (Art. 7 Abs. 2 KVG).',
      includeIf: { and: [{ feld: 'preset', eq: 'krankenkasse' }, { feld: 'kkGrund', eq: 'praemienmitteilung' }] },
      norm: 'Art. 7 Abs. 2 KVG',
      begruendung: 'Kündigung auf Prämienmitteilung hin (Wortlaut verifiziert: einmonatige Frist auf das Ende des Monats vor Gültigkeit der neuen Prämie) — der Praxisfall «bis 30. November».' },
    { id: 'V_krankenkasse_semester',
      text: 'Hiermit kündige ich die obligatorische Krankenpflegeversicherung (Grundversicherung){{kkVersichertenSatz}} ordentlich unter Einhaltung der dreimonatigen Kündigungsfrist auf das Ende des Kalendersemesters{{kkWunschterminSatz}} (Art. 7 Abs. 1 KVG).',
      includeIf: { and: [{ feld: 'preset', eq: 'krankenkasse' }, { feld: 'kkGrund', eq: 'ordentlich' }, { not: { feld: 'kkBesondereForm', eq: true } }] },
      norm: 'Art. 7 Abs. 1 KVG',
      begruendung: 'Ordentliche Kündigung ohne besondere Versicherungsform (Wortlaut verifiziert: dreimonatige Frist auf das Ende eines Kalendersemesters).' },
    { id: 'V_krankenkasse_jahresende',
      text: 'Hiermit kündige ich die obligatorische Krankenpflegeversicherung (Grundversicherung){{kkVersichertenSatz}} ordentlich unter Einhaltung der dreimonatigen Kündigungsfrist auf das Ende des Kalenderjahres{{kkWunschterminSatz}}, da eine besondere Versicherungsform besteht (Art. 7 Abs. 1 KVG; Art. 94 Abs. 2 KVV bzw. Art. 100 Abs. 3 KVV).',
      includeIf: { and: [{ feld: 'preset', eq: 'krankenkasse' }, { feld: 'kkGrund', eq: 'ordentlich' }, { feld: 'kkBesondereForm', eq: true }] },
      norm: 'Art. 7 Abs. 1 KVG',
      begruendung: 'Ordentliche Kündigung bei wählbarer Franchise/eingeschränkter Wahl: Wechsel nur auf Jahresende (Art. 94 Abs. 2 bzw. Art. 100 Abs. 3 KVV, Fassung in Kraft seit 1.1.2025).',
      hinweis: 'Die Kündigung auf Prämienmitteilung hin (Art. 7 Abs. 2 KVG) bleibt auch bei besonderen Versicherungsformen vorbehalten.' },
    { id: 'V_krankenkasse_nahtlos',
      text: 'Das Versicherungsverhältnis endet, sobald Ihnen mein neuer Versicherer die Aufnahme ohne Unterbrechung des Versicherungsschutzes mitgeteilt hat (Art. 7 Abs. 5 KVG).',
      includeIf: { feld: 'preset', eq: 'krankenkasse' },
      norm: 'Art. 7 Abs. 5 KVG',
      begruendung: 'Nahtlosigkeits-Klausel: Ende beim bisherigen Versicherer erst nach Mitteilung des neuen Versicherers (Versicherungspflicht ohne Lücke).' },
    { id: 'V_darlehen',
      text: 'Hiermit kündige ich das Darlehen und fordere Sie zur Rückzahlung auf. Die Rückzahlung hat innert sechs Wochen seit Zugang {{darlehenAusloeserWort}} zu erfolgen{{darlehenBisSatz}} (Art. 318 OR).',
      includeIf: { feld: 'preset', eq: 'darlehen' },
      norm: 'Art. 318 OR',
      begruendung: 'Darlehenskündigung mit 6-Wochen-Frist ab erster Aufforderung (Art. 318 OR).' },
    { id: 'V_auftrag',
      text: 'Hiermit widerrufe bzw. kündige ich den Auftrag mit sofortiger Wirkung (Art. 404 Abs. 1 OR).',
      includeIf: { feld: 'preset', eq: 'auftrag' },
      norm: 'Art. 404 OR',
      begruendung: 'Auftrag: jederzeitiger Widerruf/Kündigung (Art. 404 Abs. 1 OR); Unzeit-Folge als Warnung offengelegt.' },
    { id: 'V_abo',
      text: 'Hiermit kündige ich das Abonnement bzw. den Vertrag auf den nächstmöglichen Termin gemäss den vereinbarten Vertrags-/Geschäftsbedingungen.',
      includeIf: { feld: 'preset', eq: 'abo_telecom' },
      begruendung: 'Abo/Telecom: kein Spezialgesetz — Kündigung auf den nächstmöglichen AGB-Termin (ehrlich ohne berechnete Frist, §2).' },
    { id: 'V_bestaetigung',
      text: 'Bitte bestätigen Sie mir die Kündigung und den Beendigungstermin schriftlich.',
      begruendung: 'Bestätigungsbitte (Beweissicherung) — immer enthalten.' },
    kdgSchluss('V_schluss'),
    kdgUnterschrift('V_unterschrift'),
  ],
};

// ── Zusammenstellung ────────────────────────────────────────────────────────

export function kvZusammenstellen(a: KvAntworten) {
  // Bug-Check 10.6.2026 (NIEDRIG, deklarierte fachliche Änderung): Die
  // 6-Wochen-Frist des Art. 318 OR läuft ab ZUGANG der Aufforderung
  // (empfangsbedürftig; so auch KDG_ZUGANGS_HINWEIS). Ein konkretes
  // «somit bis zum»-Datum erscheint nur, wenn ein bereits zugegangenes
  // Aufforderungsdatum erfasst ist – sonst nannte der Brief ein zu frühes
  // Fälligkeitsdatum (ab Briefdatum gerechnet, ohne Zustelldauer).
  const rueckzahlungBis = a.preset === 'darlehen' && ISO.test(a.aufforderungDatum)
    ? kvDarlehenRueckzahlungBis(a.aufforderungDatum) : null;
  const antworten: Antworten = {
    ...a,
    ...kdgBasisAbgeleitet(a),
    vertragsnummerSatz: a.vertragsnummer.trim() ? ` (Nr. ${a.vertragsnummer.trim()})` : '',
    policennummerSatz: a.policennummer.trim() ? ` (Police ${a.policennummer.trim()})` : '',
    kkVersichertenSatz: a.kkVersichertennummer.trim() ? ` (Versicherten-Nr. ${a.kkVersichertennummer.trim()})` : '',
    kkWunschterminSatz: !a.aufNaechstmoeglich && ISO.test(a.kuendigungsterminWunsch)
      ? `, somit per ${fmtDatum(a.kuendigungsterminWunsch)}` : '',
    terminSatz: a.aufNaechstmoeglich
      ? 'auf den nächstmöglichen Termin'
      : ISO.test(a.kuendigungsterminWunsch) ? `per ${fmtDatum(a.kuendigungsterminWunsch)}` : 'auf den nächstmöglichen Termin',
    darlehenAusloeserWort: ISO.test(a.aufforderungDatum)
      ? `der ersten Aufforderung vom ${fmtDatum(a.aufforderungDatum)}`
      : 'dieser Aufforderung',
    darlehenBisSatz: rueckzahlungBis ? `, somit bis zum ${rueckzahlungBis}` : '',
  };
  return { ergebnis: assemble(KV_SCHEMA, antworten), rueckzahlungBis };
}
