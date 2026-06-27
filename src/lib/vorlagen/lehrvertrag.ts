// Dossier: bibliothek/recherche/arbeitsvertrag-untertypen.md
import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { fmtDatum, fmtCHF, zahl, fmtIsoStrict } from './datum';
import { type Detailgrad, DETAILGRAD_DEFAULT, AB_STANDARD, NUR_EXPERTE } from './detailgrad';

// ─── Lehrvertrag (Art. 344–346a OR) — Sonderregime ──────────────────────────
//
// FAHRPLAN-VERTRAGS-VARIANTEN P1c: regime-treues EIGENES Schema (nicht in
// arbeitsvertrag.ts), weil der Lehrvertrag ein distinktes Regime der
// «besonderen Einzelarbeitsverträge» ist (§1/§4: lieber eigenes Schema als
// eine Sammel-Weiche, die zwei Regimes gleich behandelt).
//
// Wortlaute am Filestore-Cache verifiziert (14.6.2026, OR-Konsolidierung
// 20260101; bibliothek/recherche/arbeitsvertrag-untertypen.md §2):
// - Art. 344 (Begriff: fachgemässe Bildung gegen Arbeit).
// - Art. 344a Abs. 1 (Schriftform = Gültigkeit!), Abs. 2 (Pflichtinhalt: Art
//   und Dauer der Bildung, Lohn, Probezeit, Arbeitszeit, Ferien), Abs. 3
//   (Probezeit 1–3 Monate, Default 3), Abs. 4 (Verlängerung bis 6 Monate nur
//   mit Abrede UND Zustimmung der kantonalen Behörde), Abs. 5 (weitere
//   Bestimmungen), Abs. 6 (Abreden gegen freie Berufswahl nach der Lehre
//   nichtig → KEIN nachvertragliches Konkurrenzverbot).
// - Art. 345 (Pflichten der lernenden Person / gesetzlichen Vertretung).
// - Art. 345a Abs. 1 (Fachkraft-Verantwortung), Abs. 2 (Freistellung für
//   Berufsfachschule/üK/Prüfungen ohne Lohnabzug), Abs. 3 (bis 20. Altersjahr
//   ≥ 5 Wochen Ferien je Lehrjahr), Abs. 4 (berufsfremde/Akkordarbeit nur
//   berufsbezogen).
// - Art. 346 Abs. 1 (Probezeit-Kündigung 7 Tage), Abs. 2 (fristlose Auflösung
//   aus wichtigem Grund i.S.v. 337, mit Anhörungspflicht lit. b).
// - Art. 346a (Lehrzeugnis nach Beendigung).
// Öffentlich-rechtlich begleitend: BBG (SR 412.10) Art. 14 — Genehmigung des
// Lehrvertrags durch die kantonale Behörde (als Hinweis, kein OR-Anker).

export type LvBildungstyp = 'efz' | 'eba' | 'andere';

export type LvLohnjahr = { jahr: number; chf: string };

export type LvAntworten = {
  detailgrad: Detailgrad;
  // Parteien
  betriebName: string;
  betriebAdresse: string;
  lernendeVorname: string;
  lernendeName: string;
  lernendeAdresse: string;
  lernendeGeburtsdatum: string;      // ISO — steuert Minderjährigkeit (gesetzl. Vertretung) + 5-Wochen-Ferien
  gesetzlicheVertretung: string;     // Name(n), bei Minderjährigkeit Pflicht
  // Berufliche Bildung
  beruf: string;                     // z. B. «Kauffrau/Kaufmann»
  bildungstyp: LvBildungstyp;        // EFZ / EBA / andere
  beginn: string;                    // ISO
  dauerJahre: number;                // Art und Dauer (344a II)
  // Probezeit (344a III/IV)
  probezeitMonate: number;           // 1–3 (Default 3); 4–6 nur mit Behördenzustimmung
  probezeitBehoerde: boolean;        // Zustimmung der kantonalen Behörde bei > 3 Monaten
  // Arbeitszeit & Ferien
  wochenstunden: number;
  ferienWochen: number;              // ≥ 5 bis zum vollendeten 20. Altersjahr (345a III)
  // Schulische Bildung
  berufsfachschule: string;          // Name der Berufsfachschule (optional)
  // Lohn je Lehrjahr (344a II)
  lohnLehrjahre: LvLohnjahr[];
  // Weitere Leistungen (344a V) — experte
  berufswerkzeuge: boolean;
  unterkunftVerpflegung: boolean;
  versicherungspraemien: boolean;
  // Abschluss
  ort: string;
  datum: string;                     // ISO
};

export const LV_DEFAULTS: LvAntworten = {
  detailgrad: DETAILGRAD_DEFAULT,
  betriebName: '', betriebAdresse: '',
  lernendeVorname: '', lernendeName: '', lernendeAdresse: '',
  lernendeGeburtsdatum: '', gesetzlicheVertretung: '',
  beruf: '', bildungstyp: 'efz',
  beginn: '', dauerJahre: 3,
  probezeitMonate: 3, probezeitBehoerde: false,
  wochenstunden: 41, ferienWochen: 5,
  berufsfachschule: '',
  lohnLehrjahre: [{ jahr: 1, chf: '' }],
  berufswerkzeuge: false, unterkunftVerpflegung: false, versicherungspraemien: false,
  ort: '', datum: '',
};

// ── Helfer ──────────────────────────────────────────────────────────────────

const alterAm = (gebIso: string, stichtagIso: string): number | null => {
  const g = new Date(gebIso), s = new Date(stichtagIso);
  if (isNaN(g.getTime()) || isNaN(s.getTime())) return null;
  let a = s.getFullYear() - g.getFullYear();
  if (s.getMonth() < g.getMonth() || (s.getMonth() === g.getMonth() && s.getDate() < g.getDate())) a--;
  return a;
};

// Hydration-Guard (Pflicht-Konvention, Lektion): Lohn-Liste normalisieren.
export function lvNormalisieren(a: LvAntworten): LvAntworten {
  const lohn = Array.isArray(a.lohnLehrjahre) && a.lohnLehrjahre.length > 0
    ? a.lohnLehrjahre.map((l, i) => ({ jahr: Number(l?.jahr) || i + 1, chf: String(l?.chf ?? '') }))
    : [{ jahr: 1, chf: '' }];
  return { ...a, lohnLehrjahre: lohn };
}

// ── Gates (deterministisch, normverifiziert) ────────────────────────────────

export type LvGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeLvGates(a: LvAntworten): LvGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  // G1 — Probezeit 1–3 Monate; 4–6 nur mit Zustimmung der kantonalen Behörde
  // (Art. 344a Abs. 3 und 4 OR).
  const pm = a.probezeitMonate;
  if (!(pm >= 1 && pm <= 6)) {
    blocker.push('Die Probezeit des Lehrverhältnisses beträgt zwischen einem und drei Monaten; eine Verlängerung auf bis zu sechs Monate ist nur ausnahmsweise mit Zustimmung der kantonalen Behörde zulässig (Art. 344a Abs. 3 und 4 OR).');
  } else if (pm > 3 && !a.probezeitBehoerde) {
    blocker.push('Eine Probezeit von mehr als drei Monaten ist nur mit Zustimmung der kantonalen Behörde gültig (Art. 344a Abs. 4 OR) – diese ist zu bestätigen oder die Probezeit auf höchstens drei Monate zu setzen.');
  }

  // G2 — Ferien: bis zum vollendeten 20. Altersjahr mindestens 5 Wochen je
  // Lehrjahr (Art. 345a Abs. 3 OR); sonst das allgemeine Minimum (329a) ≥ 4.
  const alter = a.lernendeGeburtsdatum && a.beginn ? alterAm(a.lernendeGeburtsdatum, a.beginn) : null;
  const ferienMin = alter !== null && alter < 20 ? 5 : 4;
  if (a.ferienWochen < ferienMin) {
    blocker.push(ferienMin === 5
      ? 'Bis zum vollendeten 20. Altersjahr stehen der lernenden Person für jedes Lehrjahr mindestens fünf Wochen Ferien zu (Art. 345a Abs. 3 OR).'
      : 'Der Ferienanspruch beträgt mindestens vier Wochen pro Jahr (Art. 329a Abs. 1 OR).');
  }

  // G3 — Minderjährigkeit: Unterschrift der gesetzlichen Vertretung erforderlich.
  if (alter !== null && alter < 18 && !a.gesetzlicheVertretung.trim()) {
    blocker.push('Die lernende Person ist bei Vertragsschluss minderjährig – die gesetzliche Vertretung ist anzugeben und muss den Vertrag mitunterzeichnen (Art. 345 Abs. 2 OR).');
  }

  // G4 — Dauer plausibel.
  if (!(a.dauerJahre >= 1 && a.dauerJahre <= 5)) {
    warnungen.push('Die Dauer der beruflichen Grundbildung beträgt je nach Beruf in der Regel zwei bis vier Jahre (EBA/EFZ); die erfasste Dauer ist zu prüfen.');
  }

  // Schriftform = Gültigkeitsvoraussetzung (Art. 344a Abs. 1 OR) — offengelegt.
  hinweise.push('Der Lehrvertrag bedarf zu seiner Gültigkeit der schriftlichen Form (Art. 344a Abs. 1 OR): Er ist von der lernenden Person, der gesetzlichen Vertretung (bei Minderjährigkeit) und dem Lehrbetrieb zu unterzeichnen. Ein bloss mündlicher Lehrvertrag ist nichtig.');
  // Behördliche Genehmigung (BBG 14) — öffentlich-rechtlich, Hinweis.
  hinweise.push('Der Lehrvertrag ist vor Lehrbeginn der kantonalen Behörde zur Genehmigung einzureichen (Art. 14 des Berufsbildungsgesetzes); ohne Genehmigung darf die Bildung nicht begonnen werden. Verfahren und Formular sind kantonal.');
  // Keine Wegbedingung der freien Berufswahl (Art. 344a Abs. 6 OR).
  hinweise.push('Ein nachvertragliches Konkurrenzverbot oder eine andere Abrede, welche die lernende Person im freien Entscheid über ihre berufliche Tätigkeit nach der Lehre beeinträchtigt, ist nichtig (Art. 344a Abs. 6 OR) – eine solche Klausel wird bewusst NICHT angeboten.');

  return { blocker, warnungen, hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const LV_SCHEMA: VorlageSchema = {
  id: 'lehrvertrag',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Art. 344–346a OR verifiziert 20260101; FAHRPLAN-VERTRAGS-VARIANTEN P1c)',
  titel: 'Lehrvertrag',
  disclaimer:
    'Entwurf – erstellt mit LexMetrik. Keine Rechtsberatung. Der Lehrvertrag bedarf zu seiner '
    + 'Gültigkeit der Schriftform (Art. 344a Abs. 1 OR) und der Genehmigung durch die kantonale '
    + 'Behörde (Art. 14 BBG). Zwingend sind insbesondere die Probezeit (1–3 Monate, Art. 344a OR), '
    + 'die fünf Wochen Ferien bis zum 20. Altersjahr (Art. 345a OR) und der Jugendarbeitsschutz '
    + '(ArGV 5). Massgebend sind Gesetz und der Einzelfall.',
  bausteine: [
    { id: 'L01_parteien', rolle: 'parteien',
      text: 'zwischen\n\n{{betriebBlock}}\n(nachfolgend «Lehrbetrieb»)\n\nund\n\n{{lernendeBlock}}\n(nachfolgend «lernende Person»){{vertretungBlock}}',
      begruendung: 'Bezeichnung der Vertragsparteien (Lehrbetrieb, lernende Person, bei Minderjährigkeit gesetzliche Vertretung) – immer enthalten.',
      norm: 'Art. 344 OR' },
    { id: 'L02_gegenstand', ueberschrift: 'Gegenstand und Dauer der beruflichen Bildung',
      text: 'Der Lehrbetrieb bildet die lernende Person fachgemäss für die berufliche Tätigkeit als {{beruf}} ({{bildungstypWort}}). Das Lehrverhältnis beginnt am {{beginnFmt}} und dauert {{dauerText}}; es endet mit Ablauf der vereinbarten Lehrzeit{{endeSatz}}.',
      nummeriert: true,
      begruendung: 'Art und Dauer der beruflichen Bildung – zwingender Pflichtinhalt (Art. 344a Abs. 2 OR).',
      norm: 'Art. 344a OR' },
    { id: 'L03_probezeit', ueberschrift: 'Probezeit',
      text: 'Die Probezeit beträgt {{probezeitText}}.{{probezeitBehoerdeSatz}} Während der Probezeit kann das Lehrverhältnis jederzeit mit einer Kündigungsfrist von sieben Tagen gekündigt werden (Art. 346 Abs. 1 OR).',
      nummeriert: true,
      begruendung: 'Probezeit (1–3 Monate, Default 3) – zwingender Pflichtinhalt und Kündigungsregel (Art. 344a Abs. 3, 346 Abs. 1 OR).',
      norm: 'Art. 344a OR' },
    { id: 'L04_arbeitszeit', ueberschrift: 'Arbeitszeit',
      text: 'Die wöchentliche Arbeitszeit beträgt {{wochenstunden}} Stunden; sie umfasst auch den Besuch der Berufsfachschule und der überbetrieblichen Kurse. Vorbehalten bleiben die zwingenden Vorschriften über den Jugendarbeitsschutz (Arbeitsgesetz, ArGV 5).',
      nummeriert: true,
      begruendung: 'Arbeitszeit – zwingender Pflichtinhalt (Art. 344a Abs. 2 OR); Jugendarbeitsschutz vorbehalten.',
      norm: 'Art. 344a OR' },
    { id: 'L05_lohn', ueberschrift: 'Lohn', wiederholeUeber: 'lohnLehrjahre',
      text: 'Im {{item.jahr}}. Lehrjahr beträgt der Bruttolohn CHF {{item.chfFmt}} pro Monat.',
      nummeriert: true,
      begruendung: 'Lohn je Lehrjahr – zwingender Pflichtinhalt (Art. 344a Abs. 2 OR).',
      norm: 'Art. 344a OR' },
    { id: 'L06_ferien', ueberschrift: 'Ferien',
      text: 'Die lernende Person hat Anspruch auf {{ferienWochen}} Wochen Ferien pro Lehrjahr. Bis zum vollendeten 20. Altersjahr beträgt der Ferienanspruch für jedes Lehrjahr mindestens fünf Wochen (Art. 345a Abs. 3 OR).',
      nummeriert: true,
      begruendung: 'Ferien – zwingender Pflichtinhalt; erhöhtes Minimum von 5 Wochen bis 20 (Art. 344a Abs. 2, 345a Abs. 3 OR).',
      norm: 'Art. 345a OR' },
    { id: 'L07_schule', ueberschrift: 'Berufsfachschule und überbetriebliche Kurse',
      text: 'Der Lehrbetrieb gibt der lernenden Person ohne Lohnabzug die Zeit frei, die für den Besuch der Berufsfachschule{{schuleNameSatz}} und der überbetrieblichen Kurse sowie für die Teilnahme an den Lehrabschlussprüfungen erforderlich ist (Art. 345a Abs. 2 OR).',
      nummeriert: true,
      begruendung: 'Freistellung für Schule/Kurse/Prüfungen ohne Lohnabzug (Art. 345a Abs. 2 OR) – zwingend.',
      norm: 'Art. 345a OR' },
    { id: 'L08_bildungspflichten', ueberschrift: 'Pflichten des Lehrbetriebs',
      text: 'Der Lehrbetrieb sorgt dafür, dass die berufliche Bildung unter der Verantwortung einer Fachkraft steht, welche die erforderlichen beruflichen Fähigkeiten und persönlichen Eigenschaften besitzt. Die lernende Person darf zu anderen als beruflichen Arbeiten und zu Akkordarbeiten nur eingesetzt werden, soweit diese mit dem zu erlernenden Beruf zusammenhängen und die Bildung nicht beeinträchtigt wird (Art. 345a Abs. 1 und 4 OR).',
      includeIf: AB_STANDARD, nummeriert: true,
      begruendung: 'Fachkraft-Verantwortung und Einsatzgrenzen (Art. 345a Abs. 1/4 OR) – ab «standard».',
      norm: 'Art. 345a OR' },
    { id: 'L09_pflichten_lernende', ueberschrift: 'Pflichten der lernenden Person',
      text: 'Die lernende Person tut alles, um das Lehrziel zu erreichen. Die gesetzliche Vertretung unterstützt den Lehrbetrieb in der Erfüllung seiner Aufgabe und fördert das gute Einvernehmen (Art. 345 OR).',
      includeIf: AB_STANDARD, nummeriert: true,
      begruendung: 'Pflichten der lernenden Person und der gesetzlichen Vertretung (Art. 345 OR) – ab «standard» (deklaratorisch).',
      norm: 'Art. 345 OR' },
    { id: 'L10_weitere_leistungen', ueberschrift: 'Weitere Leistungen',
      text: 'Die Parteien vereinbaren zusätzlich:{{weitereLeistungenListe}}',
      includeIf: { and: [NUR_EXPERTE, { feld: 'weitereLeistungenVorhanden', eq: true }] }, nummeriert: true,
      begruendung: 'Weitere Bestimmungen über Berufswerkzeuge, Unterkunft/Verpflegung, Versicherungsprämien (Art. 344a Abs. 5 OR) – Detailgrad «experte».',
      norm: 'Art. 344a OR' },
    { id: 'L11_beendigung', ueberschrift: 'Auflösung des Lehrverhältnisses',
      text: 'Nach Ablauf der Probezeit kann das Lehrverhältnis nicht ordentlich gekündigt werden; es endet mit Ablauf der vereinbarten Lehrzeit. Aus wichtigen Gründen im Sinne von Art. 337 OR kann es jederzeit fristlos aufgelöst werden, namentlich wenn der Fachkraft die erforderlichen Fähigkeiten fehlen, wenn die lernende Person nicht über die unentbehrlichen Anlagen verfügt oder gesundheitlich oder sittlich gefährdet ist, oder wenn die Bildung nicht zu Ende geführt werden kann. Vor einer Auflösung wegen fehlender Anlagen oder Gefährdung sind die lernende Person und ihre gesetzliche Vertretung anzuhören (Art. 346 Abs. 2 OR).',
      nummeriert: true,
      begruendung: 'Beendigung: keine ordentliche Kündigung nach der Probezeit, fristlose Auflösung aus wichtigem Grund mit Anhörungspflicht (Art. 346 OR).',
      norm: 'Art. 346 OR' },
    { id: 'L12_zeugnis', ueberschrift: 'Lehrzeugnis',
      text: 'Nach Beendigung der Lehre stellt der Lehrbetrieb der lernenden Person ein Zeugnis aus, das die erlernte Berufstätigkeit und die Dauer der Lehre angibt; auf Verlangen äussert es sich auch über Fähigkeiten, Leistungen und Verhalten (Art. 346a OR).',
      includeIf: AB_STANDARD, nummeriert: true,
      begruendung: 'Anspruch auf Lehrzeugnis (Art. 346a OR) – ab «standard».',
      norm: 'Art. 346a OR' },
    { id: 'L13_schluss', ueberschrift: 'Schlussbestimmungen',
      text: 'Der Vertrag ist vor Lehrbeginn der kantonalen Behörde zur Genehmigung einzureichen (Art. 14 BBG). Abreden, welche die lernende Person im freien Entscheid über die berufliche Tätigkeit nach der Lehre beeinträchtigen, sind nichtig (Art. 344a Abs. 6 OR). Änderungen bedürfen der Schriftform; im Übrigen gelten die Art. 344 ff. OR sowie die Berufsbildungsgesetzgebung. Dieser Vertrag wird in so vielen Exemplaren ausgefertigt, dass Lehrbetrieb, lernende Person und gesetzliche Vertretung je ein unterzeichnetes Exemplar erhalten.',
      nummeriert: true,
      begruendung: 'Genehmigungspflicht (BBG 14), Nichtigkeit berufswahlbeschränkender Abreden (344a VI), Schriftform, Ausfertigung – immer enthalten.',
      norm: 'Art. 344a OR' },
    { id: 'L14_unterschriften', rolle: 'unterschrift',
      text: '{{ort}}, {{datumFmt}}\n\n\nDer Lehrbetrieb:\n\n___________________________\n{{betriebName}}\n\n\nDie lernende Person:\n\n___________________________\n{{lernendeKurz}}\n\n\nDie gesetzliche Vertretung:\n\n___________________________\n{{gesetzlicheVertretungZeile}}',
      begruendung: 'Ort, Datum und Unterschriften aller Beteiligten – erfüllt die Gültigkeits-Schriftform (Art. 344a Abs. 1 OR).',
      norm: 'Art. 344a OR' },
  ],
};

// ── Zusammenstellen ─────────────────────────────────────────────────────────

const BILDUNGSTYP_WORT: Record<LvBildungstyp, string> = {
  efz: 'eidgenössisches Fähigkeitszeugnis EFZ',
  eba: 'eidgenössisches Berufsattest EBA',
  andere: 'berufliche Grundbildung',
};

export function lvZusammenstellen(roh: LvAntworten) {
  const a = lvNormalisieren(roh);
  const minderjaehrig = a.lernendeGeburtsdatum && a.beginn
    ? (alterAm(a.lernendeGeburtsdatum, a.beginn) ?? 99) < 18
    : false;

  const dauerText = a.dauerJahre === 1 ? 'ein Jahr' : `${a.dauerJahre} Jahre`;
  const probezeitText = a.probezeitMonate === 1 ? 'einen Monat' : `${a.probezeitMonate} Monate`;

  const weitere: string[] = [];
  if (a.berufswerkzeuge) weitere.push('Der Lehrbetrieb stellt die für die Bildung erforderlichen Berufswerkzeuge zur Verfügung.');
  if (a.unterkunftVerpflegung) weitere.push('Der Lehrbetrieb leistet einen Beitrag an Unterkunft und Verpflegung.');
  if (a.versicherungspraemien) weitere.push('Der Lehrbetrieb übernimmt die Prämien der obligatorischen Unfallversicherung im gesetzlichen Umfang.');

  const antworten: Antworten = {
    ...a,
    betriebBlock: [a.betriebName, a.betriebAdresse].filter((s) => s.trim()).join('\n'),
    lernendeBlock: [`${a.lernendeVorname} ${a.lernendeName}`.trim(),
      ...(a.lernendeGeburtsdatum ? [`geboren am ${fmtDatum(a.lernendeGeburtsdatum)}`] : []),
      a.lernendeAdresse].filter((s) => s.trim()).join('\n'),
    vertretungBlock: minderjaehrig
      ? `\n\nvertreten durch die gesetzliche Vertretung\n${a.gesetzlicheVertretung.trim() || '________'}`
      : '',
    lernendeKurz: `${a.lernendeVorname} ${a.lernendeName}`.trim() || '________',
    gesetzlicheVertretungZeile: a.gesetzlicheVertretung.trim() || (minderjaehrig ? '________' : 'entfällt (volljährig)'),
    beruf: a.beruf.trim() || '________',
    bildungstypWort: BILDUNGSTYP_WORT[a.bildungstyp],
    beginnFmt: fmtIsoStrict(a.beginn),
    dauerText,
    endeSatz: '',
    probezeitText,
    probezeitBehoerdeSatz: a.probezeitMonate > 3 && a.probezeitBehoerde
      ? ' Die Verlängerung der Probezeit über drei Monate erfolgt mit Zustimmung der kantonalen Behörde (Art. 344a Abs. 4 OR).'
      : '',
    schuleNameSatz: a.berufsfachschule.trim() ? ` (${a.berufsfachschule.trim()})` : '',
    lohnLehrjahre: a.lohnLehrjahre.map((l) => ({ jahr: l.jahr, chfFmt: zahl(l.chf) !== null ? fmtCHF(l.chf) : '________' })),
    weitereLeistungenVorhanden: weitere.length > 0,
    weitereLeistungenListe: weitere.length > 0 ? '\n– ' + weitere.join('\n– ') : '',
    datumFmt: fmtIsoStrict(a.datum),
  };

  return { ergebnis: assemble(LV_SCHEMA, antworten) };
}
