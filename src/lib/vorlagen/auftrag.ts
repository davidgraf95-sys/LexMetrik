// Dossier: bibliothek/recherche/wettbewerbsanalyse-rechtswissen-schweizer-vertraege.md
import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { fmtCHF, zahl } from './datum';

// ─── Auftrag / Dienstleistungsvertrag (Art. 394 ff. OR) ─────────────────────
//
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V3):
// erster fehlender GRUNDTYP der Verträge-Sektion. EIN Schema mit Gegenstands-
// Modulen (allgemein/Beratung/Treuhand/Inkasso) statt je Variante eine Karte
// (§4: kein Kollaps verschiedener Vertragstypen — die Module verzweigen NUR
// die Gegenstandsumschreibung des einen Vertragstyps «Auftrag»).
//
// Wortlaute am Filestore-Cache verifiziert (13.6.2026, OR-Konsolidierung
// 20260101):
// - Art. 394 Abs. 1 (Besorgung der übertragenen Geschäfte/Dienste),
//   Abs. 3 (Vergütung nur, wenn verabredet oder üblich).
// - Art. 396 Abs. 3 (besondere Ermächtigung nötig für Vergleich, Schieds-
//   gericht, Wechsel, Grundstücke veräussern/belasten, Schenkungen).
// - Art. 397 Abs. 1 (Bindung an Weisungen, Abweichung nur bei Genehmigungs-
//   Vermutung).
// - Art. 398 Abs. 2 (getreue/sorgfältige Ausführung), Abs. 3 (persönliche
//   Besorgung; Substitution nur bei Ermächtigung/Nötigung/Übung).
// - Art. 400 Abs. 1 (jederzeitige Rechenschaft + Herausgabe alles Erlangten).
// - Art. 402 Abs. 1 (Auslagen-/Verwendungsersatz samt Zinsen).
// - Art. 404 Abs. 1 (JEDERZEITIGES Widerrufs-/Kündigungsrecht beider Teile),
//   Abs. 2 (Schadenersatz bei Beendigung zur Unzeit).
//
// Fachliche Festlegung (§8 Ehrlichkeit): Das Widerrufs-/Kündigungsrecht nach
// Art. 404 Abs. 1 OR ist nach konstanter bundesgerichtlicher Rechtsprechung
// ZWINGEND und kann nicht gültig wegbedungen werden (BGE 115 II 464 u. a.).
// Die Vorlage bietet darum KEINE feste Vertragsdauer/Ausschlussklausel an,
// sondern legt das beidseitige jederzeitige Auflösungsrecht offen.

export type AfMandatstyp = 'allgemein' | 'beratung' | 'treuhand' | 'inkasso';
export type AfVerguetung = 'pauschal' | 'aufwand' | 'unentgeltlich';

export type AfAntworten = {
  auftraggeberName: string;
  auftraggeberAdresse: string;     // optional
  beauftragteName: string;
  beauftragteAdresse: string;      // optional
  mandatstyp: AfMandatstyp;
  gegenstand: string;              // konkrete Umschreibung der Geschäfte/Dienste
  beginn: string;                  // ISO, optional
  verguetung: AfVerguetung;
  pauschalCHF: string;             // bei 'pauschal'
  stundensatzCHF: string;          // bei 'aufwand'
  auslagenErsatz: boolean;         // Art. 402 Abs. 1 ausdrücklich
  weisungsKlausel: boolean;        // Art. 397 Weisungsbindung ausdrücklich
  substitution: boolean;           // Beizug Dritter zugelassen (Art. 398 Abs. 3)
  vollmachtErweitert: boolean;     // Hinweis besondere Ermächtigung (Art. 396 Abs. 3)
  ort: string;
  datum: string;                   // ISO
};

export const AF_DEFAULTS: AfAntworten = {
  auftraggeberName: '', auftraggeberAdresse: '',
  beauftragteName: '', beauftragteAdresse: '',
  mandatstyp: 'allgemein',
  gegenstand: '',
  beginn: '',
  verguetung: 'pauschal',
  pauschalCHF: '', stundensatzCHF: '',
  auslagenErsatz: true,
  weisungsKlausel: true,
  substitution: false,
  vollmachtErweitert: false,
  ort: '', datum: '',
};

// Gegenstands-Module: tailored Einleitungssatz je Mandatstyp. Der konkrete
// {{gegenstand}}-Text der Nutzerin bleibt führend; das Modul ergänzt nur die
// typische Rahmung (deterministisch, keine Schätzung).
const MANDAT_RAHMEN: Record<AfMandatstyp, string> = {
  allgemein: 'Die Beauftragte besorgt für die Auftraggeberin die folgenden Geschäfte und Dienste',
  beratung: 'Die Beauftragte erbringt für die Auftraggeberin die folgenden Beratungsleistungen',
  treuhand: 'Die Beauftragte besorgt für die Auftraggeberin die folgenden treuhänderischen Geschäfte',
  inkasso: 'Die Beauftragte zieht für die Auftraggeberin die folgenden Forderungen ein (Inkassomandat)',
};

// ── Gates/Hinweise (deterministisch, normverifiziert) ───────────────────────

export type AfGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeAfGates(): AfGateErgebnis {
  const hinweise: string[] = [];
  hinweise.push(
    'JEDERZEITIGES AUFLÖSUNGSRECHT (Art. 404 Abs. 1 OR): Auftraggeberin und Beauftragte '
    + 'können den Auftrag jederzeit widerrufen oder kündigen. Dieses Recht ist nach '
    + 'bundesgerichtlicher Rechtsprechung zwingend und kann nicht gültig ausgeschlossen '
    + 'werden – eine feste Mindestdauer wäre wirkungslos. Erfolgt die Auflösung zur Unzeit, '
    + 'ist der dadurch verursachte Schaden zu ersetzen (Art. 404 Abs. 2 OR).',
  );
  hinweise.push(
    'ABGRENZUNG zum Werkvertrag: Der Auftrag schuldet sorgfältiges Tätigwerden, NICHT einen '
    + 'bestimmten Erfolg. Steht ein konkretes Werk (Herstellung/Erfolg) im Vordergrund, ist '
    + 'der Werkvertrag (Art. 363 ff. OR) die richtige Grundlage.',
  );
  hinweise.push(
    'VERGÜTUNG ist nur geschuldet, wenn sie verabredet oder üblich ist (Art. 394 Abs. 3 OR) – '
    + 'die gewählte Vergütungsregelung hält das ausdrücklich fest.',
  );
  return { blocker: [], warnungen: [], hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const AF_SCHEMA: VorlageSchema = {
  id: 'auftrag',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Wettbewerbsanalyse V3; Art. 394/396/397/398/400/402/404 OR verifiziert 20260101)',
  titel: 'Auftrag (Dienstleistungsvertrag)',
  disclaimer:
    'Erstellt mit LexMetrik. Keine Rechtsberatung. Der Auftrag ist formfrei gültig; die '
    + 'beidseitige Unterzeichnung dient dem Beweis. Das jederzeitige Auflösungsrecht (Art. 404 '
    + 'OR) ist zwingend. Massgebend sind Gesetz (Art. 394 ff. OR) und der konkrete Einzelfall.',
  bausteine: [
    { id: 'AF01_parteien', rolle: 'parteien',
      text: 'zwischen\n\n{{auftraggeberBlock}}\n(Auftraggeberin)\n\nund\n\n{{beauftragteBlock}}\n(Beauftragte)',
      begruendung: 'Bezeichnung der Vertragsparteien – immer enthalten.',
      norm: 'Art. 394 OR' },
    { id: 'AF02_gegenstand', ueberschrift: 'Gegenstand des Auftrags',
      text: '{{mandatRahmen}}: {{gegenstand}}.{{beginnSatz}} Die Beauftragte besorgt die übertragenen Geschäfte vertragsgemäss.',
      nummeriert: true,
      begruendung: 'Umschreibung der übertragenen Geschäfte/Dienste (Gegenstands-Modul je Mandatstyp) – immer enthalten.',
      norm: 'Art. 394 Abs. 1 OR' },
    { id: 'AF03_umfang', ueberschrift: 'Umfang und Vollmacht',
      text: 'Der Umfang des Auftrags bestimmt sich nach dieser Vereinbarung und nach der Natur des '
        + 'zu besorgenden Geschäfts; die Beauftragte ist zu den Rechtshandlungen ermächtigt, die '
        + 'zur Ausführung gehören. Für besonders bezeichnete Geschäfte – namentlich den Abschluss '
        + 'eines Vergleichs, die Annahme eines Schiedsgerichts, das Eingehen wechselrechtlicher '
        + 'Verbindlichkeiten, die Veräusserung oder Belastung von Grundstücken sowie Schenkungen – '
        + 'bedarf sie einer besonderen Ermächtigung.{{vollmachtSatz}}',
      nummeriert: true,
      begruendung: 'Umfang nach Natur des Geschäfts und gesetzlich umschriebener Bereich der besonderen Ermächtigung (Art. 396 Abs. 3 OR) – immer enthalten.',
      norm: 'Art. 396 OR' },
    { id: 'AF04_sorgfalt', ueberschrift: 'Sorgfalt und Ausführung',
      text: 'Die Beauftragte haftet für getreue und sorgfältige Ausführung des übertragenen '
        + 'Geschäfts. {{ausfuehrungSatz}}',
      nummeriert: true,
      begruendung: 'Sorgfalts- und Treuepflicht (Art. 398 Abs. 2 OR) sowie persönliche Ausführung bzw. zugelassene Substitution (Abs. 3) – immer enthalten.',
      norm: 'Art. 398 OR' },
    { id: 'AF05_weisungen', ueberschrift: 'Weisungen',
      text: 'Die Beauftragte beachtet die Weisungen der Auftraggeberin. Von einer Weisung darf sie '
        + 'nur abweichen, soweit die Einholung einer Erlaubnis nach den Umständen nicht tunlich ist '
        + 'und anzunehmen ist, die Auftraggeberin würde sie bei Kenntnis der Sachlage erteilen.',
      includeIf: { feld: 'weisungsKlausel', eq: true }, nummeriert: true,
      begruendung: 'Weisungsbindung (Art. 397 Abs. 1 OR) – optional, weil deklaratorisch.',
      norm: 'Art. 397 Abs. 1 OR' },
    { id: 'AF06_verguetung', ueberschrift: 'Vergütung',
      text: '{{verguetungText}}',
      nummeriert: true,
      begruendung: 'Vergütungsregelung – eine Vergütung ist nur geschuldet, wenn verabredet oder üblich (Art. 394 Abs. 3 OR); die gewählte Regelung hält dies fest.',
      norm: 'Art. 394 Abs. 3 OR' },
    { id: 'AF07_auslagen', ueberschrift: 'Auslagen und Verwendungen',
      text: 'Die Auftraggeberin ersetzt der Beauftragten die Auslagen und Verwendungen, die diese in '
        + 'richtiger Ausführung des Auftrags gemacht hat, samt Zinsen, und befreit sie von den dabei '
        + 'eingegangenen Verbindlichkeiten.',
      includeIf: { feld: 'auslagenErsatz', eq: true }, nummeriert: true,
      begruendung: 'Auslagen-/Verwendungsersatz (Art. 402 Abs. 1 OR) – ausdrücklich aufgenommen.',
      norm: 'Art. 402 Abs. 1 OR' },
    { id: 'AF08_rechenschaft', ueberschrift: 'Rechenschaft und Herausgabe',
      text: 'Die Beauftragte legt der Auftraggeberin auf Verlangen jederzeit über ihre Geschäfts'
        + 'führung Rechenschaft ab und erstattet alles, was ihr aus der Geschäftsbesorgung zugekommen '
        + 'ist. Gelder, mit deren Ablieferung sie im Rückstand ist, hat sie zu verzinsen.',
      nummeriert: true,
      begruendung: 'Rechenschafts- und Herausgabepflicht (Art. 400 Abs. 1 OR) – immer enthalten.',
      norm: 'Art. 400 Abs. 1 OR' },
    { id: 'AF09_beendigung', ueberschrift: 'Dauer und Beendigung',
      text: 'Der Auftrag kann von jeder Partei jederzeit widerrufen oder gekündigt werden (Art. 404 '
        + 'Abs. 1 OR). Dieses Recht ist zwingend und kann nicht gültig ausgeschlossen werden. Erfolgt '
        + 'die Auflösung zur Unzeit, ersetzt die zurücktretende Partei der anderen den dadurch '
        + 'verursachten Schaden (Art. 404 Abs. 2 OR). Bereits erbrachte Leistungen und entstandene '
        + 'Auslagen sind nach den vorstehenden Bestimmungen abzugelten.',
      nummeriert: true,
      begruendung: 'Zwingendes jederzeitiges Auflösungsrecht (Art. 404 Abs. 1 OR) und Schadenersatz bei Beendigung zur Unzeit (Abs. 2) – immer enthalten, keine Ausschlussklausel (§8).',
      norm: 'Art. 404 OR',
      hinweis: 'Das jederzeitige Auflösungsrecht ist nach bundesgerichtlicher Rechtsprechung zwingend; abweichende Ausschluss- oder Mindestdauer-Klauseln sind wirkungslos.' },
    { id: 'AF10_schluss', ueberschrift: 'Schlussbestimmungen',
      text: 'Änderungen und Ergänzungen dieses Vertrags bedürfen der Schriftform. Dieser Vertrag wird '
        + 'in zwei Exemplaren ausgefertigt; jede Partei erhält ein unterzeichnetes Exemplar. Im Übrigen '
        + 'gelten die Bestimmungen des Obligationenrechts über den Auftrag (Art. 394 ff. OR).',
      nummeriert: true,
      begruendung: 'Schriftformvorbehalt für Änderungen, Ausfertigung und Gesetzesverweis – immer enthalten.',
      norm: 'Art. 394 OR' },
    { id: 'AF11_unterschriften', rolle: 'unterschrift',
      text: '{{ort}}, {{datumFmt}}\n\n\nDie Auftraggeberin:\n\n___________________________\n{{auftraggeberName}}\n\n\nDie Beauftragte:\n\n___________________________\n{{beauftragteName}}',
      begruendung: 'Ort, Datum und beidseitige Unterschriften – dienen dem Beweis (formfreier Vertrag).',
      norm: 'Art. 394 OR' },
  ],
};

// ── Zusammenstellung ────────────────────────────────────────────────────────
//
// Blanko-Grundsatz (Daueranweisung David 12.6.2026): leere Pflicht-Platzhalter
// füllt die ENGINE als «________»; optionale Fragmente enden auf «…Satz» und
// verschwinden leer (Konvention engine.ts formatiere()).

export function afZusammenstellen(a: AfAntworten) {
  const ausfuehrungSatz = a.substitution
    ? 'Die Beauftragte ist berechtigt, zur Ausführung des Auftrags Dritte beizuziehen; für deren '
      + 'sorgfältige Auswahl und Instruktion bleibt sie verantwortlich.'
    : 'Die Beauftragte besorgt das Geschäft persönlich; die Übertragung auf Dritte bleibt vorbehalten, '
      + 'soweit sie dazu ermächtigt, durch die Umstände genötigt oder die Vertretung üblich ist.';

  const pauschalFmt = zahl(a.pauschalCHF) !== null ? fmtCHF(a.pauschalCHF) : '________';
  const stundenFmt = zahl(a.stundensatzCHF) !== null ? fmtCHF(a.stundensatzCHF) : '________';
  const verguetungText = a.verguetung === 'unentgeltlich'
    ? 'Der Auftrag wird unentgeltlich besorgt. Die Beauftragte verzichtet auf eine Vergütung; '
      + 'der Ersatz von Auslagen und Verwendungen bleibt vorbehalten.'
    : a.verguetung === 'pauschal'
      ? `Für die Besorgung des Auftrags schuldet die Auftraggeberin eine Pauschalvergütung von `
        + `CHF ${pauschalFmt}. Die Mehrwertsteuer ist, soweit geschuldet, zusätzlich zu entrichten.`
      : `Die Beauftragte rechnet nach Zeitaufwand zu einem Stundenansatz von CHF ${stundenFmt} ab. `
        + `Die Mehrwertsteuer ist, soweit geschuldet, zusätzlich zu entrichten.`;

  const antworten: Antworten = {
    ...a,
    auftraggeberBlock: [a.auftraggeberName, a.auftraggeberAdresse].filter((s) => s.trim()).join('\n'),
    beauftragteBlock: [a.beauftragteName, a.beauftragteAdresse].filter((s) => s.trim()).join('\n'),
    mandatRahmen: MANDAT_RAHMEN[a.mandatstyp],
    beginnSatz: a.beginn.trim() ? ` Der Auftrag beginnt am {{beginn}}.`.replace('{{beginn}}', fmtIso(a.beginn)) : '',
    vollmachtSatz: a.vollmachtErweitert
      ? ' Die Auftraggeberin erteilt der Beauftragten die hierfür erforderliche besondere Ermächtigung im Rahmen des Gegenstands dieses Auftrags.'
      : '',
    ausfuehrungSatz,
    verguetungText,
    datumFmt: fmtIso(a.datum),
  };
  return { ergebnis: assemble(AF_SCHEMA, antworten) };
}

// Lokaler ISO→TT.MM.JJJJ-Helfer (die Engine formatiert {{datum}} selbst, hier
// brauchen wir den Wert in zusammengesetzten Sätzen).
function fmtIso(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : '________';
}
