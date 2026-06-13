// Dossier: bibliothek/recherche/wettbewerbsanalyse-rechtswissen-schweizer-vertraege.md · bibliothek/recherche/familienrecht-klagen-vorlagen.md
import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { fmtCHF, zahl } from './datum';
import { type Detailgrad, DETAILGRAD_DEFAULT, NUR_EXPERTE } from './detailgrad';

// ─── Konkubinatsvertrag ─────────────────────────────────────────────────────
//
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V3):
// schliesst die Familienrecht-Block-Lücke (bisher nur «Auflösung» geplant).
// Innominatvertrag im Rahmen der Vertragsfreiheit (Art. 19 OR); formfrei →
// `fertig`. Module: Kosten/Wohnen/Inventar/einfache Gesellschaft/Auflösung.
//
// Wortlaute am Filestore-Cache verifiziert (13.6.2026; OR 20260101, ZGB
// 20260101):
// - Art. 19 Abs. 1 OR (Vertragsfreiheit).
// - Art. 646 Abs. 1/2 ZGB (Miteigentum nach Bruchteilen; Vermutung gleiche
//   Teile).
// - Art. 650 Abs. 1 ZGB (Anspruch auf Aufhebung des Miteigentums),
//   Art. 651 Abs. 1 ZGB (Arten der Aufhebung: körperliche Teilung, Verkauf,
//   Übernahme gegen Auskauf).
// - Art. 530 Abs. 1 OR (einfache Gesellschaft = gemeinsamer Zweck),
//   Art. 548/549 OR (Auseinandersetzung/Liquidation).
//
// Fachliche Festlegung (§8 Ehrlichkeit): Es gibt KEIN gesetzliches
// Konkubinatsrecht – keine Unterhalts-/Beistandspflicht, keine güterrecht-
// lichen Wirkungen, kein gesetzliches Erbrecht der Partner. Der Vertrag regelt
// nur, was er ausdrücklich bestimmt; das wird offengelegt. Belange gemeinsamer
// KINDER (elterliche Sorge, Unterhalt) richten sich nach dem Gesetz (ZGB) und
// sind nicht zulasten des Kindes abänderbar – nur deklaratorischer Hinweis.

export type KkKostenschluessel = 'haelftig' | 'einkommen' | 'fix';

export type KkAntworten = {
  detailgrad: Detailgrad;
  partner1Name: string;
  partner1Adresse: string;         // optional
  partner2Name: string;
  partner2Adresse: string;         // optional
  // Wohnen
  wohnenAufnehmen: boolean;
  wohnBeschrieb: string;           // z. B. «gemeinsame Mietwohnung …, Hauptmieter ist …»
  // Kosten des Zusammenlebens
  kostenschluessel: KkKostenschluessel;
  fix1CHF: string;                 // bei 'fix'
  fix2CHF: string;
  gemeinsamesKonto: boolean;
  // Vermögen & Inventar
  inventarAufnehmen: boolean;      // Verweis auf Inventarliste als Beilage
  einfacheGesellschaft: boolean;   // gemeinsamer Zweck / grössere gemeinsame Anschaffung
  einfacheGesellschaftZweck: string;
  // Hinweise als Bausteine
  kinderHinweis: boolean;
  vorsorgeHinweis: boolean;
  ort: string;
  datum: string;                   // ISO
};

export const KK_DEFAULTS: KkAntworten = {
  detailgrad: DETAILGRAD_DEFAULT,
  partner1Name: '', partner1Adresse: '',
  partner2Name: '', partner2Adresse: '',
  wohnenAufnehmen: true, wohnBeschrieb: '',
  kostenschluessel: 'haelftig', fix1CHF: '', fix2CHF: '',
  gemeinsamesKonto: true,
  inventarAufnehmen: true,
  einfacheGesellschaft: false, einfacheGesellschaftZweck: '',
  kinderHinweis: false,
  vorsorgeHinweis: true,
  ort: '', datum: '',
};

// ── Gates/Hinweise (deterministisch, normverifiziert) ───────────────────────

export type KkGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeKkGates(a: KkAntworten): KkGateErgebnis {
  const hinweise: string[] = [];
  hinweise.push(
    'KEIN GESETZLICHES KONKUBINATSRECHT: Zwischen den Partnern bestehen von Gesetzes wegen weder '
    + 'Unterhalts- noch Beistandspflichten, keine güterrechtlichen Wirkungen und kein gesetzliches '
    + 'Erbrecht. Dieser Vertrag (Art. 19 OR) regelt nur, was er ausdrücklich bestimmt.',
  );
  hinweise.push(
    'MITEIGENTUM: Gemeinsam angeschaffte Sachen stehen mangels anderer Abrede im Miteigentum zu '
    + 'gleichen Teilen (Art. 646 ZGB); bei Auflösung kann jeder Partner die Aufhebung verlangen '
    + '(Art. 650/651 ZGB). Alleineigentum jeder Partei bleibt unberührt – eine Inventarliste '
    + 'schafft Klarheit.',
  );
  if (a.kinderHinweis) {
    hinweise.push(
      'GEMEINSAME KINDER: Elterliche Sorge und Kindesunterhalt richten sich zwingend nach dem '
      + 'Gesetz (ZGB) und nicht nach diesem Vertrag; sie können nicht zulasten des Kindes geregelt '
      + 'werden.',
    );
  }
  if (a.vorsorgeHinweis) {
    hinweise.push(
      'VORSORGE UND ERBRECHT: Da kein gesetzliches Erbrecht besteht, sind Begünstigungen '
      + '(Säule 3a, Pensionskasse) und eine letztwillige Verfügung separat zu regeln, wenn der '
      + 'Partner abgesichert werden soll.',
    );
  }
  return { blocker: [], warnungen: [], hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const KK_SCHEMA: VorlageSchema = {
  id: 'konkubinat',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Wettbewerbsanalyse V3; Art. 19 OR, Art. 646/650/651 ZGB, Art. 530/548/549 OR verifiziert 20260101)',
  titel: 'Konkubinatsvertrag',
  disclaimer:
    'Erstellt mit LexMetrik. Keine Rechtsberatung. Der Konkubinatsvertrag ist ein Innominatvertrag '
    + '(Art. 19 OR) und formfrei gültig; die beidseitige Unterzeichnung dient dem Beweis. Es besteht '
    + 'kein gesetzliches Konkubinatsrecht; Belange gemeinsamer Kinder richten sich nach dem Gesetz. '
    + 'Massgebend sind Gesetz und der konkrete Einzelfall.',
  bausteine: [
    { id: 'KK01_parteien', rolle: 'parteien',
      text: 'zwischen\n\n{{partner1Block}}\n(Partnerin/Partner 1)\n\nund\n\n{{partner2Block}}\n(Partnerin/Partner 2)',
      begruendung: 'Bezeichnung der Vertragsparteien – immer enthalten.',
      norm: 'Art. 19 OR' },
    { id: 'KK02_grundsatz', ueberschrift: 'Grundsatz',
      text: 'Die Parteien führen eine nichteheliche Lebensgemeinschaft (Konkubinat). Sie halten fest, '
        + 'dass zwischen ihnen kein gesetzliches Unterhalts-, Beistands- oder Güterrecht besteht; '
        + 'dieser Vertrag regelt ihr Zusammenleben und die Folgen einer Trennung im Rahmen der '
        + 'Vertragsfreiheit (Art. 19 OR).',
      nummeriert: true,
      begruendung: 'Klarstellung der Rechtsnatur (kein gesetzliches Konkubinatsrecht) – immer enthalten.',
      norm: 'Art. 19 OR' },
    { id: 'KK03_wohnen', ueberschrift: 'Wohnen',
      text: 'Für die gemeinsame Wohnsituation gilt: {{wohnBeschrieb}}. Zieht eine Partei aus, '
        + 'verständigen sich die Parteien rechtzeitig über die Weiterführung oder Auflösung des '
        + 'Mietverhältnisses bzw. die Nutzung der Wohnung.',
      includeIf: { feld: 'wohnenAufnehmen', eq: true }, nummeriert: true,
      begruendung: 'Wohn-Regelung (Mietverhältnis/Nutzung) – nur wenn aufgenommen.',
      norm: 'Art. 19 OR' },
    { id: 'KK04_kosten', ueberschrift: 'Kosten des Zusammenlebens',
      text: '{{kostenText}}{{kontoSatz}}',
      nummeriert: true,
      begruendung: 'Verteilung der Lebenshaltungskosten (hälftig / nach Einkommen / fix) und gemeinsames Konto – immer enthalten.',
      norm: 'Art. 19 OR' },
    { id: 'KK05_vermoegen', ueberschrift: 'Vermögen und Inventar',
      text: 'Jede Partei behält das Alleineigentum an den von ihr eingebrachten und allein '
        + 'angeschafften Sachen. Gemeinsam angeschaffte Sachen stehen mangels anderer Abrede im '
        + 'Miteigentum zu gleichen Teilen (Art. 646 ZGB).{{inventarSatz}}',
      nummeriert: true,
      begruendung: 'Zuordnung von Allein- und Miteigentum (Art. 646 ZGB) und Inventarverweis – immer enthalten.',
      norm: 'Art. 646 ZGB' },
    { id: 'KK06_gesellschaft', ueberschrift: 'Gemeinsamer Zweck',
      text: 'Verfolgen die Parteien einen gemeinsamen Zweck mit gemeinsamen Mitteln '
        + '({{einfacheGesellschaftZweck}}), bilden sie insoweit eine einfache Gesellschaft '
        + '(Art. 530 OR). Bei deren Auflösung erfolgt die Auseinandersetzung nach Art. 548 f. OR: '
        + 'Rückerstattung der Vermögensbeiträge und Verteilung eines Überschusses bzw. eines '
        + 'Fehlbetrags je zur Hälfte, soweit nichts anderes vereinbart ist.',
      includeIf: { feld: 'einfacheGesellschaft', eq: true }, nummeriert: true,
      begruendung: 'Einfache Gesellschaft für gemeinsame Zwecke (Art. 530/548/549 OR) – nur wenn vereinbart.',
      norm: 'Art. 530 OR' },
    { id: 'KK07_kinder', ueberschrift: 'Gemeinsame Kinder',
      text: 'Die Parteien nehmen zur Kenntnis, dass sich die elterliche Sorge und der Unterhalt '
        + 'gemeinsamer Kinder zwingend nach dem Gesetz (ZGB) richten und nicht zulasten des Kindes '
        + 'durch diesen Vertrag geregelt werden können. Eine Unterhaltsvereinbarung bedarf der '
        + 'Genehmigung der Kindesschutzbehörde.',
      includeIf: { feld: 'kinderHinweis', eq: true }, nummeriert: true,
      begruendung: 'Deklaratorischer Hinweis auf die zwingende gesetzliche Ordnung des Kindesrechts – nur wenn gewählt.',
      norm: 'Art. 19 OR' },
    { id: 'KK08_aufloesung', ueberschrift: 'Auflösung des Konkubinats',
      text: 'Bei Auflösung der Lebensgemeinschaft nimmt jede Partei ihr Alleineigentum zurück. '
        + 'Miteigentum wird aufgehoben; können sich die Parteien über die Art nicht einigen, gelten '
        + 'die gesetzlichen Teilungsregeln (Art. 650 f. ZGB: körperliche Teilung, Verkauf oder '
        + 'Übernahme gegen Auskauf). Ein gemeinsames Konto wird saldiert und der Saldo nach dem '
        + 'vereinbarten Kostenschlüssel ausgeglichen. Gegenseitige Ansprüche aus der Zeit des '
        + 'Zusammenlebens sind damit, vorbehältlich abweichender schriftlicher Abrede, abgegolten.',
      nummeriert: true,
      begruendung: 'Auflösungsfolgen: Rücknahme Alleineigentum, Aufhebung Miteigentum (Art. 650 f. ZGB), Kontosaldo – immer enthalten.',
      norm: 'Art. 651 ZGB' },
    { id: 'KK09_vorsorge', ueberschrift: 'Vorsorge und Erbrecht',
      text: 'Den Parteien ist bewusst, dass zwischen ihnen kein gesetzliches Erbrecht besteht. Wer '
        + 'den Partner absichern will, regelt dies gesondert durch Begünstigung (Säule 3a, '
        + 'Pensionskasse) und letztwillige Verfügung.',
      includeIf: { feld: 'vorsorgeHinweis', eq: true }, nummeriert: true,
      begruendung: 'Hinweis auf fehlendes gesetzliches Erbrecht und separate Vorsorge-/Begünstigungsregelung – nur wenn gewählt.',
      norm: 'Art. 19 OR' },
    { id: 'KK09b_mediation', ueberschrift: 'Streitbeilegung und Gerichtsstand',
      text: 'Die Parteien versuchen, Streitigkeiten aus diesem Vertrag zunächst durch Gespräch oder '
        + 'Mediation beizulegen. Gelingt dies nicht, ist ausschliesslicher Gerichtsstand der Wohnsitz '
        + 'der beklagten Partei, soweit nicht zwingende Gerichtsstände entgegenstehen. Belange '
        + 'gemeinsamer Kinder bleiben dem zwingenden Recht vorbehalten.',
      includeIf: NUR_EXPERTE, nummeriert: true,
      begruendung: 'Mediations-/Gerichtsstandsklausel mit Vorbehalt der Kindesbelange – Detailgrad «experte».',
      norm: 'Art. 19 OR' },
    { id: 'KK10_schluss', ueberschrift: 'Schlussbestimmungen',
      text: 'Änderungen und Ergänzungen dieses Vertrags bedürfen der Schriftform. Sollte eine '
        + 'Bestimmung unwirksam sein, bleibt der Vertrag im Übrigen gültig. Dieser Vertrag wird in '
        + 'zwei Exemplaren ausgefertigt; jede Partei erhält ein unterzeichnetes Exemplar. Es gilt '
        + 'schweizerisches Recht.',
      nummeriert: true,
      begruendung: 'Schriftform, salvatorische Klausel, Ausfertigung, Rechtswahl – immer enthalten.',
      norm: 'Art. 19 OR' },
    { id: 'KK11_unterschriften', rolle: 'unterschrift',
      text: '{{ort}}, {{datumFmt}}\n\n\nPartnerin/Partner 1:\n\n___________________________\n{{partner1Name}}\n\n\nPartnerin/Partner 2:\n\n___________________________\n{{partner2Name}}',
      begruendung: 'Ort, Datum und beidseitige Unterschriften – dienen dem Beweis (formfreier Vertrag).',
      norm: 'Art. 19 OR' },
  ],
};

// ── Zusammenstellung ────────────────────────────────────────────────────────
//
// Blanko-Grundsatz (Daueranweisung David 12.6.2026): leere Pflicht-Platzhalter
// füllt die ENGINE als «________»; optionale Fragmente enden auf «…Satz» und
// verschwinden leer (Konvention engine.ts formatiere()).

export function kkZusammenstellen(a: KkAntworten) {
  const fix1 = zahl(a.fix1CHF) !== null ? fmtCHF(a.fix1CHF) : '________';
  const fix2 = zahl(a.fix2CHF) !== null ? fmtCHF(a.fix2CHF) : '________';
  const kostenText = a.kostenschluessel === 'haelftig'
    ? 'Die Kosten des gemeinsamen Haushalts und der gemeinsamen Lebenshaltung tragen die Parteien '
      + 'je zur Hälfte.'
    : a.kostenschluessel === 'einkommen'
      ? 'Die Kosten des gemeinsamen Haushalts und der gemeinsamen Lebenshaltung tragen die Parteien '
        + 'im Verhältnis ihrer Nettoeinkommen.'
      : `Die Parteien tragen an die Kosten des gemeinsamen Haushalts feste monatliche Beiträge: `
        + `Partnerin/Partner 1 CHF ${fix1}, Partnerin/Partner 2 CHF ${fix2}.`;

  const antworten: Antworten = {
    ...a,
    partner1Block: [a.partner1Name, a.partner1Adresse].filter((s) => s.trim()).join('\n'),
    partner2Block: [a.partner2Name, a.partner2Adresse].filter((s) => s.trim()).join('\n'),
    kostenText,
    kontoSatz: a.gemeinsamesKonto
      ? ' Für die gemeinsamen Kosten führen die Parteien ein gemeinsames Konto, das sie nach dem '
        + 'vorstehenden Schlüssel speisen.'
      : '',
    inventarSatz: a.inventarAufnehmen
      ? ' Die Zuordnung der wesentlichen Gegenstände hält eine als Beilage unterzeichnete '
        + 'Inventarliste fest.'
      : '',
    datumFmt: fmtIso(a.datum),
  };
  return { ergebnis: assemble(KK_SCHEMA, antworten) };
}

function fmtIso(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : '________';
}
