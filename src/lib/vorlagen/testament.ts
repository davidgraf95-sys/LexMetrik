import { differenceInYears, parseISO } from 'date-fns';
import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';

// ─── Eigenhändiges Testament (Art. 505 ZGB) — Pilot-Vorlage ─────────────────
//
// MVP gemäss normverifizierter Implementierungs-Anweisung: Bausteine C01–C05,
// C09, C12 (Erbeinsetzung, Vermächtnis, Ersatzverfügung, Willensvollstrecker,
// Schlussformel). Komplexe Bausteine (Nacherbe, Nutzniessung, Enterbung)
// bewusst NICHT enthalten — dafür wird anwaltliche Beratung empfohlen.
// Alle Artikel gegen das konsolidierte Fedlex-ZGB verifiziert (Stand 1.1.2023,
// Erbrechtsrevision AS 2021 312).

export type TestamentErbe = {
  name: string;
  angaben: string;        // Geburtsdatum/Adresse — Empfehlung: genaue Personalien
  quoteProzent: number;
  ersatz?: string;
};

export type TestamentVermaechtnis = {
  empfaenger: string;
  gegenstand: string;     // Gegenstand oder Betrag
  ersatz?: string;
};

export type TestamentAntworten = {
  vorname: string;
  nachname: string;
  geburtsdatum: string;     // ISO — Volljährigkeitsprüfung (Art. 467 ZGB)
  heimatort: string;
  adresse: string;
  zivilstand: 'ledig' | 'verheiratet' | 'eingetragene_partnerschaft' | 'geschieden' | 'verwitwet';
  ehegatteName?: string;
  scheidungHaengig?: boolean;
  scheidungTyp?: 'gemeinsames_begehren' | 'getrennt_min_2_jahre' | 'keine';
  hatNachkommen: boolean;
  anzahlNachkommen?: number;
  widerruf: boolean;        // C02, Default true
  erben: TestamentErbe[];
  vermaechtnisse: TestamentVermaechtnis[];
  willensvollstrecker?: string;
  willensvollstreckerErsatz?: string;
  ortErrichtung?: string;   // optional, empfohlen (seit 1996 kein Gültigkeitserfordernis)
  datumErrichtung: string;  // ISO — Jahr/Monat/Tag zwingend (Art. 505 Abs. 1)
};

// ── Form-Gate: zwingende Prüfungen (GATE-1/3/5; GATE-6 als Warnung) ─────────

export type GateErgebnis = { blocker: string[]; warnungen: string[] };

export function pruefeGates(a: TestamentAntworten): GateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];

  // GATE-1: Volljährigkeit am Errichtungsdatum (Art. 467 ZGB)
  const geb = parseISO(a.geburtsdatum);
  const err = parseISO(a.datumErrichtung);
  if (!isNaN(geb.getTime()) && !isNaN(err.getTime()) && differenceInYears(err, geb) < 18) {
    blocker.push('Testierfähigkeit setzt das vollendete 18. Altersjahr voraus (Art. 467 ZGB).');
  }

  // GATE-3: vollständiges Datum (Jahr, Monat, Tag — Art. 505 Abs. 1, Art. 520a ZGB)
  if (!a.datumErrichtung || isNaN(err.getTime())) {
    blocker.push('Das Errichtungsdatum muss Jahr, Monat und Tag enthalten (Art. 505 Abs. 1 ZGB).');
  }

  // GATE-6: Quoten-Plausibilität (Warnung, kein harter Block — Herabsetzung
  // nach Art. 522 ff. ZGB ist Anfechtungsfrage)
  if (a.erben.length > 0) {
    const summe = a.erben.reduce((s, e) => s + (Number.isFinite(e.quoteProzent) ? e.quoteProzent : 0), 0);
    if (Math.abs(summe - 100) > 0.01) {
      warnungen.push(`Die Erbquoten ergeben zusammen ${summe} % statt 100 % — der ganze Nachlass sollte abgedeckt sein; der nicht verfügte Teil fällt an die gesetzlichen Erben (Art. 481 Abs. 2 ZGB).`);
    }
  }

  // Art. 472 ZGB: hängige Scheidung
  if (a.scheidungHaengig && (a.scheidungTyp === 'gemeinsames_begehren' || a.scheidungTyp === 'getrennt_min_2_jahre')) {
    warnungen.push('Hängige Scheidung (Art. 472 ZGB): Der Pflichtteilsschutz des Ehegatten entfällt, der gesetzliche Erbanspruch bleibt aber bis zur Rechtskraft des Scheidungsurteils bestehen — ein vollständiger Ausschluss muss im Testament ausdrücklich verfügt werden.');
  }

  return { blocker, warnungen };
}

// ── Schema (Bausteine mit includeIf-Regeln) ─────────────────────────────────

export const TESTAMENT_SCHEMA: VorlageSchema = {
  id: 'testament-eigenhaendig',
  version: '1.0.0 (Rechtsstand 1.1.2023, AS 2021 312)',
  titel: 'Letztwillige Verfügung (Testament)',
  disclaimer:
    'Entwurf — erstellt mit LexMetrik. Keine Rechtsberatung. Nur die vollständig ' +
    'eigenhändig (von Hand) geschriebene, datierte und unterschriebene Fassung ist ' +
    'gültig (Art. 505 Abs. 1 ZGB).',
  bausteine: [
    {
      id: 'C01_titel',
      text:
        'Ich, {{vorname}} {{nachname}}, geboren am {{geburtsdatum}}, von {{heimatort}}, ' +
        'wohnhaft {{adresse}}, errichte hiermit die folgende letztwillige Verfügung:',
      begruendung: 'Selbstidentifikation des Erblassers/der Erblasserin — immer enthalten.',
      norm: 'Art. 505 ZGB',
    },
    {
      id: 'C02_widerruf',
      text: 'Ich widerrufe hiermit sämtliche früheren letztwilligen Verfügungen.',
      includeIf: { feld: 'widerruf', eq: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil «frühere Verfügungen widerrufen» gewählt wurde.',
      norm: 'Art. 509, 511 ZGB',
    },
    {
      id: 'C03_erbeinsetzung',
      ueberschrift: 'Erbeinsetzung',
      text: 'Als meine Erbinnen und Erben setze ich ein:',
      includeIf: { feld: 'erben', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil mindestens eine Erbin/ein Erbe erfasst wurde.',
      norm: 'Art. 483 ZGB',
    },
    {
      id: 'C03b_erbenliste',
      text: '– {{item.name}} ({{item.angaben}}), zu einer Quote von {{item.quoteProzent}} % meines Nachlasses;',
      includeIf: { feld: 'erben', nichtLeer: true },
      wiederholeUeber: 'erben',
      begruendung: 'Je erfasste Erbin/erfasster Erbe eine Zeile mit Quote.',
      norm: 'Art. 483 ZGB',
    },
    {
      id: 'C05_ersatz_erben',
      text:
        'Sollte {{item.name}} den Erbfall nicht erleben oder die Erbschaft ausschlagen, ' +
        'so tritt an ihre/seine Stelle: {{item.ersatz}}.',
      includeIf: { feld: 'erbenMitErsatz', nichtLeer: true },
      wiederholeUeber: 'erbenMitErsatz',
      nummeriert: true,
      begruendung: 'Aufgenommen, weil für Erben eine Ersatzperson bezeichnet wurde.',
      norm: 'Art. 487 ZGB',
    },
    {
      id: 'C04_vermaechtnis',
      ueberschrift: 'Vermächtnisse',
      text: 'Ich richte — ohne Erbeinsetzung — folgende Vermächtnisse aus:',
      includeIf: { feld: 'vermaechtnisse', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil mindestens ein Vermächtnis erfasst wurde.',
      norm: 'Art. 484 ZGB',
    },
    {
      id: 'C04b_vermaechtnisliste',
      text: '– {{item.empfaenger}} erhält: {{item.gegenstand}};',
      includeIf: { feld: 'vermaechtnisse', nichtLeer: true },
      wiederholeUeber: 'vermaechtnisse',
      begruendung: 'Je erfasstes Vermächtnis eine Zeile.',
      norm: 'Art. 484 ZGB',
    },
    {
      id: 'C05_ersatz_vermaechtnis',
      text:
        'Sollte {{item.empfaenger}} das Vermächtnis nicht erwerben können oder es ausschlagen, ' +
        'so fällt es an: {{item.ersatz}}.',
      includeIf: { feld: 'vermaechtnisseMitErsatz', nichtLeer: true },
      wiederholeUeber: 'vermaechtnisseMitErsatz',
      nummeriert: true,
      begruendung: 'Aufgenommen, weil für Vermächtnisse eine Ersatzperson bezeichnet wurde.',
      norm: 'Art. 487 ZGB',
    },
    {
      id: 'C09_willensvollstrecker',
      ueberschrift: 'Willensvollstreckung',
      text: 'Als Willensvollstrecker/in setze ich ein: {{willensvollstrecker}}.',
      includeIf: { feld: 'willensvollstrecker', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil eine Willensvollstreckerin/ein Willensvollstrecker bezeichnet wurde.',
      norm: 'Art. 517 f. ZGB',
    },
    {
      id: 'C09b_wv_ersatz',
      text:
        'Kann oder will diese Person das Amt nicht übernehmen, setze ich als ' +
        'Ersatz-Willensvollstrecker/in ein: {{willensvollstreckerErsatz}}.',
      includeIf: { feld: 'willensvollstreckerErsatz', nichtLeer: true },
      begruendung: 'Aufgenommen, weil eine Ersatzperson für die Willensvollstreckung bezeichnet wurde.',
      norm: 'Art. 517 f. ZGB',
    },
    {
      id: 'C12_schlussformel', rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\n\n_________________________________\n(eigenhändige Unterschrift: {{vorname}} {{nachname}})',
      begruendung: 'Schlussformel mit Datum (Jahr/Monat/Tag) und Unterschriftszeile am Schluss — immer enthalten.',
      norm: 'Art. 505 Abs. 1 ZGB',
      hinweis: 'Ob das Datum selbst eigenhändig geschrieben sein muss (kein Stempel/Vordruck), ist in der Lehre umstritten — sicherheitshalber auch das Datum von Hand schreiben.',
    },
  ],
};

// ── Komfort: Antworten aufbereiten (abgeleitete Listen) und zusammenstellen ──

export function testamentZusammenstellen(a: TestamentAntworten) {
  const datum = a.datumErrichtung ? a.datumErrichtung.split('-').reverse().join('.') : '________';
  const antworten: Antworten = {
    ...a,
    erbenMitErsatz: a.erben.filter((e) => e.ersatz && e.ersatz.trim() !== ''),
    vermaechtnisseMitErsatz: a.vermaechtnisse.filter((v) => v.ersatz && v.ersatz.trim() !== ''),
    ortDatumZeile: `${a.ortErrichtung?.trim() ? a.ortErrichtung.trim() + ', ' : ''}den ${datum}`,
  };
  return assemble(TESTAMENT_SCHEMA, antworten);
}

export const TESTAMENT_DEFAULTS: TestamentAntworten = {
  vorname: '', nachname: '', geburtsdatum: '', heimatort: '', adresse: '',
  zivilstand: 'ledig',
  hatNachkommen: false,
  widerruf: true,
  erben: [],
  vermaechtnisse: [],
  datumErrichtung: '',
};
