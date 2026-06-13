// Dossier: bibliothek/recherche/wettbewerbsanalyse-rechtswissen-schweizer-vertraege.md
import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { fmtCHF, zahl } from './datum';
import { type Detailgrad, DETAILGRAD_DEFAULT, AB_STANDARD, NUR_EXPERTE } from './detailgrad';

// ─── Geheimhaltungsvereinbarung (NDA) ───────────────────────────────────────
//
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V3):
// universell (Personal, M&A, IT). Innominatvertrag im Rahmen der Vertrags-
// freiheit (Art. 19 OR); formfrei → `fertig`. Weiche einseitig/gegenseitig
// und optionale Konventionalstrafe.
//
// Wortlaute am Filestore-Cache verifiziert (13.6.2026, OR-Konsolidierung
// 20260101):
// - Art. 19 Abs. 1 (Vertragsfreiheit innerhalb der Schranken des Gesetzes).
// - Art. 160 Abs. 1 (mangels anderer Abrede nur Erfüllung ODER Strafe).
// - Art. 161 Abs. 1 (Strafe verfällt auch ohne Schaden), Abs. 2 (Mehrbetrag
//   nur bei Verschuldensnachweis).
// - Art. 163 Abs. 1 (beliebige Höhe), Abs. 3 (übermässige Konventionalstrafe
//   setzt der Richter herab – zwingend).
//
// Fachliche Festlegung (§8): Wird eine Konventionalstrafe vereinbart, legt die
// Vorlage offen, dass der Richter eine übermässige Strafe von Amtes wegen
// herabsetzt (Art. 163 Abs. 3 OR) und – damit Strafe UND Unterlassung/
// weitergehender Schaden nebeneinander bestehen – die nach Art. 160 Abs. 1 OR
// nötige ausdrückliche Abrede getroffen wird.

export type NdaAntworten = {
  detailgrad: Detailgrad;
  gegenseitig: boolean;            // false = einseitig (nur Partei B ist verpflichtet)
  parteiAName: string;             // offenlegende Partei (einseitig) / Partei A
  parteiAAdresse: string;          // optional
  parteiBName: string;             // empfangende Partei (einseitig) / Partei B
  parteiBAdresse: string;          // optional
  zweck: string;                   // Zweck der Offenlegung
  infoBeschrieb: string;           // optionale Konkretisierung der vertraulichen Informationen
  dauerErfassen: boolean;          // Nachwirkungsfrist vereinbaren
  dauerJahre: string;              // Jahre nach Beendigung
  rueckgabe: boolean;              // Rückgabe/Vernichtung
  konventionalstrafe: boolean;
  strafeCHF: string;
  ort: string;
  datum: string;                   // ISO
};

export const NDA_DEFAULTS: NdaAntworten = {
  detailgrad: DETAILGRAD_DEFAULT,
  gegenseitig: true,
  parteiAName: '', parteiAAdresse: '',
  parteiBName: '', parteiBAdresse: '',
  zweck: '',
  infoBeschrieb: '',
  dauerErfassen: true, dauerJahre: '3',
  rueckgabe: true,
  konventionalstrafe: false, strafeCHF: '',
  ort: '', datum: '',
};

// ── Gates/Hinweise (deterministisch, normverifiziert) ───────────────────────

export type NdaGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeNdaGates(a: NdaAntworten): NdaGateErgebnis {
  const hinweise: string[] = [];
  hinweise.push(
    a.gegenseitig
      ? 'GEGENSEITIGE Geheimhaltung: Beide Parteien sind zur Vertraulichkeit verpflichtet, soweit '
        + 'sie Informationen der anderen erhalten.'
      : 'EINSEITIGE Geheimhaltung: Nur die empfangende Partei (Partei B) ist zur Vertraulichkeit '
        + 'verpflichtet; die offenlegende Partei (Partei A) trifft keine Geheimhaltungspflicht.',
  );
  if (a.konventionalstrafe) {
    hinweise.push(
      'KONVENTIONALSTRAFE: Sie verfällt auch dann, wenn kein Schaden entstanden ist (Art. 161 '
      + 'Abs. 1 OR). Eine übermässig hohe Strafe setzt der Richter von Amtes wegen herab (Art. 163 '
      + 'Abs. 3 OR). Damit Strafe und Unterlassung/weitergehender Schadenersatz nebeneinander '
      + 'bestehen, ist dies ausdrücklich vereinbart (Art. 160 Abs. 1 OR).',
    );
  }
  hinweise.push(
    'PERSONENBEZOGENE DATEN: Werden vertrauliche Informationen mit Personendaten ausgetauscht, '
    + 'bleiben die datenschutzrechtlichen Pflichten zusätzlich vorbehalten.',
  );
  return { blocker: [], warnungen: [], hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const NDA_SCHEMA: VorlageSchema = {
  id: 'nda',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Wettbewerbsanalyse V3; Art. 19/160/161/163 OR verifiziert 20260101)',
  titel: 'Geheimhaltungsvereinbarung (NDA)',
  disclaimer:
    'Erstellt mit LexMetrik. Keine Rechtsberatung. Die Geheimhaltungsvereinbarung ist ein '
    + 'Innominatvertrag (Art. 19 OR) und formfrei gültig; die beidseitige Unterzeichnung dient dem '
    + 'Beweis. Eine übermässige Konventionalstrafe setzt der Richter herab (Art. 163 Abs. 3 OR). '
    + 'Massgebend sind Gesetz und der konkrete Einzelfall.',
  bausteine: [
    { id: 'NDA01_parteien', rolle: 'parteien',
      text: 'zwischen\n\n{{parteiABlock}}\n({{rolleA}})\n\nund\n\n{{parteiBBlock}}\n({{rolleB}})',
      begruendung: 'Bezeichnung der Vertragsparteien (Rollen je nach einseitig/gegenseitig) – immer enthalten.',
      norm: 'Art. 19 OR' },
    { id: 'NDA02_zweck', ueberschrift: 'Zweck',
      text: 'Die Parteien tauschen im Hinblick auf den folgenden Zweck vertrauliche Informationen '
        + 'aus: {{zweck}}. Diese Vereinbarung regelt den Umgang mit diesen Informationen.',
      nummeriert: true,
      begruendung: 'Zweck der Offenlegung – bestimmt den zulässigen Verwendungsrahmen.',
      norm: 'Art. 19 OR' },
    { id: 'NDA03_begriff', ueberschrift: 'Vertrauliche Informationen',
      text: 'Als vertraulich gelten alle nicht offenkundigen Informationen, die eine Partei der '
        + 'anderen im Zusammenhang mit dem Zweck schriftlich, mündlich, elektronisch oder auf andere '
        + 'Weise zugänglich macht.{{infoBeschriebSatz}} Nicht vertraulich sind Informationen, die '
        + 'allgemein bekannt sind oder ohne Verletzung dieser Vereinbarung werden, die der '
        + 'empfangenden Partei rechtmässig und ohne Geheimhaltungspflicht von Dritten zugänglich '
        + 'gemacht werden oder die sie nachweislich unabhängig selbst erarbeitet hat.',
      nummeriert: true,
      begruendung: 'Definition der vertraulichen Informationen samt üblicher Ausnahmen – immer enthalten.',
      norm: 'Art. 19 OR' },
    { id: 'NDA04_pflicht', ueberschrift: 'Geheimhaltungspflicht',
      text: '{{pflichtText}} Die Informationen dürfen ausschliesslich für den genannten Zweck '
        + 'verwendet und nur Personen zugänglich gemacht werden, die sie für diesen Zweck kennen '
        + 'müssen und ihrerseits zur Vertraulichkeit verpflichtet sind.',
      nummeriert: true,
      begruendung: 'Kern: Geheimhaltungs- und Zweckbindungspflicht (einseitig oder gegenseitig) – immer enthalten.',
      norm: 'Art. 19 OR' },
    { id: 'NDA05_dauer', ueberschrift: 'Dauer',
      text: 'Die Geheimhaltungspflicht gilt ab Unterzeichnung und besteht während {{dauerJahre}} '
        + 'Jahren nach Beendigung der Zusammenarbeit oder des mit dem Zweck verfolgten Vorhabens '
        + 'fort.',
      includeIf: { feld: 'dauerErfassen', eq: true }, nummeriert: true,
      begruendung: 'Nachwirkungsfrist der Geheimhaltung – nur wenn vereinbart.',
      norm: 'Art. 19 OR' },
    { id: 'NDA06_rueckgabe', ueberschrift: 'Rückgabe und Vernichtung',
      text: 'Auf Verlangen der offenlegenden Partei sowie nach Wegfall des Zwecks gibt die '
        + 'empfangende Partei alle überlassenen Unterlagen und Datenträger zurück oder vernichtet sie '
        + 'samt Kopien und bestätigt dies auf Wunsch schriftlich; gesetzliche Aufbewahrungspflichten '
        + 'bleiben vorbehalten.',
      includeIf: { feld: 'rueckgabe', eq: true }, nummeriert: true,
      begruendung: 'Rückgabe-/Vernichtungspflicht – nur wenn vereinbart.',
      norm: 'Art. 19 OR' },
    { id: 'NDA07_strafe', ueberschrift: 'Konventionalstrafe',
      text: 'Bei jeder Verletzung der Geheimhaltungspflicht schuldet die verletzende Partei eine '
        + 'Konventionalstrafe von CHF {{strafeFmt}}. Die Strafe ist auch ohne Schadensnachweis '
        + 'geschuldet (Art. 161 Abs. 1 OR); die Bezahlung befreit nicht von der Geheimhaltungspflicht. '
        + 'Ausdrücklich vorbehalten bleiben die weitere Unterlassung und der Ersatz eines die Strafe '
        + 'übersteigenden Schadens (Art. 160 Abs. 1 OR).',
      includeIf: { feld: 'konventionalstrafe', eq: true }, nummeriert: true,
      begruendung: 'Konventionalstrafe mit ausdrücklicher Kumulation (Art. 160 Abs. 1 OR) und Schadensunabhängigkeit (Art. 161 Abs. 1 OR); die richterliche Herabsetzung übermässiger Strafen (Art. 163 Abs. 3 OR) ist offengelegt.',
      norm: 'Art. 160 Abs. 1 OR',
      hinweis: 'Eine übermässig hohe Konventionalstrafe setzt der Richter nach Art. 163 Abs. 3 OR von Amtes wegen herab.' },
    { id: 'NDA08_keinrecht', ueberschrift: 'Keine Rechtsübertragung',
      text: 'Diese Vereinbarung begründet keine Pflicht zur Offenlegung von Informationen und '
        + 'überträgt keine Rechte an den vertraulichen Informationen, insbesondere keine Lizenzen oder '
        + 'Immaterialgüterrechte.',
      includeIf: AB_STANDARD, nummeriert: true,
      begruendung: 'Klarstellung: weder Offenlegungspflicht noch Rechtsübergang – ab Detailgrad «standard» (in «einfach» ausgeblendet).',
      norm: 'Art. 19 OR' },
    { id: 'NDA08b_unterlassung', ueberschrift: 'Unterlassung und Gerichtsstand',
      text: 'Bei drohender oder erfolgter Verletzung kann die verletzte Partei Unterlassung und '
        + 'Beseitigung verlangen; die Geltendmachung weiteren Schadens bleibt vorbehalten. '
        + 'Ausschliesslicher Gerichtsstand ist der Sitz der offenlegenden Partei, soweit nicht '
        + 'zwingende Gerichtsstände entgegenstehen.',
      includeIf: NUR_EXPERTE, nummeriert: true,
      begruendung: 'Unterlassungs-/Gerichtsstandsklausel – Detailgrad «experte».',
      norm: 'Art. 19 OR' },
    { id: 'NDA09_schluss', ueberschrift: 'Schlussbestimmungen',
      text: 'Änderungen und Ergänzungen dieser Vereinbarung bedürfen der Schriftform. Sollte eine '
        + 'Bestimmung unwirksam sein, bleibt die Vereinbarung im Übrigen gültig; an die Stelle der '
        + 'unwirksamen Bestimmung tritt eine gültige, die ihrem Zweck möglichst nahekommt. Diese '
        + 'Vereinbarung wird in zwei Exemplaren ausgefertigt; jede Partei erhält ein unterzeichnetes '
        + 'Exemplar. Es gilt schweizerisches Recht.',
      nummeriert: true,
      begruendung: 'Schriftform, salvatorische Klausel, Ausfertigung und Rechtswahl – immer enthalten.',
      norm: 'Art. 19 OR' },
    { id: 'NDA10_unterschriften', rolle: 'unterschrift',
      text: '{{ort}}, {{datumFmt}}\n\n\n{{rolleA}}:\n\n___________________________\n{{parteiAName}}\n\n\n{{rolleB}}:\n\n___________________________\n{{parteiBName}}',
      begruendung: 'Ort, Datum und beidseitige Unterschriften – dienen dem Beweis (formfreier Vertrag).',
      norm: 'Art. 19 OR' },
  ],
};

// ── Zusammenstellung ────────────────────────────────────────────────────────
//
// Blanko-Grundsatz (Daueranweisung David 12.6.2026): leere Pflicht-Platzhalter
// füllt die ENGINE als «________»; optionale Fragmente enden auf «…Satz» und
// verschwinden leer (Konvention engine.ts formatiere()).

export function ndaZusammenstellen(a: NdaAntworten) {
  const rolleA = a.gegenseitig ? 'Partei A' : 'offenlegende Partei';
  const rolleB = a.gegenseitig ? 'Partei B' : 'empfangende Partei';
  const pflichtText = a.gegenseitig
    ? 'Jede Partei behandelt die vertraulichen Informationen der anderen Partei streng vertraulich '
      + 'und gibt sie nicht an Dritte weiter.'
    : 'Die empfangende Partei behandelt die vertraulichen Informationen der offenlegenden Partei '
      + 'streng vertraulich und gibt sie nicht an Dritte weiter.';
  const strafeFmt = zahl(a.strafeCHF) !== null ? fmtCHF(a.strafeCHF) : '________';

  const antworten: Antworten = {
    ...a,
    rolleA, rolleB,
    parteiABlock: [a.parteiAName, a.parteiAAdresse].filter((s) => s.trim()).join('\n'),
    parteiBBlock: [a.parteiBName, a.parteiBAdresse].filter((s) => s.trim()).join('\n'),
    infoBeschriebSatz: a.infoBeschrieb.trim() ? ` Dazu gehören insbesondere: ${a.infoBeschrieb.trim()}.` : '',
    pflichtText,
    strafeFmt,
    datumFmt: fmtIso(a.datum),
  };
  return { ergebnis: assemble(NDA_SCHEMA, antworten) };
}

function fmtIso(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : '________';
}
