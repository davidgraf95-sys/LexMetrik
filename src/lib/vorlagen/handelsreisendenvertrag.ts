// Dossier: bibliothek/recherche/arbeitsvertrag-untertypen.md
import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { fmtCHF, zahl, fmtIsoStrict } from './datum';
import { type Detailgrad, DETAILGRAD_DEFAULT, AB_STANDARD, NUR_EXPERTE } from './detailgrad';

// ─── Handelsreisendenvertrag (Art. 347–350a OR) — Sonderregime ──────────────
//
// FAHRPLAN-VERTRAGS-VARIANTEN P1d: eigenes Schema (§4 regime-treu). Wortlaute
// am Filestore-Cache verifiziert (14.6.2026, OR 20260101;
// bibliothek/recherche/arbeitsvertrag-untertypen.md §3):
// - Art. 347 (Begriff: Geschäfte ausserhalb der Geschäftsräume auf Rechnung
//   des Inhabers gegen Lohn).
// - Art. 347a (Schriftform Soll; Inhalt: Dauer/Beendigung, Vollmachten,
//   Entgelt + Auslagenersatz, Recht/Gerichtsstand bei Auslandbezug).
// - Art. 348 (Besuchspflicht, Konkurrenzunterlassung ohne Bewilligung,
//   Bericht-/Übermittlungspflicht).
// - Art. 348a (Delkredere: grds. nichtig; Privatkunden höchstens ¼ Schaden je
//   Geschäft, nur gegen angemessene Delkredere-Provision).
// - Art. 348b (Vollmacht: Default Vermittlung; Abschluss nur schriftlich; ohne
//   Sondervollmacht keine Inkasso-/Stundungsbefugnis).
// - Art. 349 (Gebiet/Kundenkreis = grds. Ausschliesslichkeit; einseitige
//   Änderung nur bei begründetem Anlass, Entschädigung vorbehalten).
// - Art. 349a (Lohn = festes Gehalt mit/ohne Provision; reine Provision nur
//   schriftlich und wenn angemessenes Entgelt).
// - Art. 349b (ausschliessliches Gebiet → Provision auf allen Geschäften).
// - Art. 349d (Auslagenersatz; Einschluss in Gehalt/Provision nichtig).
// - Art. 349e (Retentionsrecht).
// - Art. 350 (Saison-Kündigung: Provision ≥ ⅕ + erhebliche Schwankung → nur
//   auf Ende des zweiten Folgemonats).
// - Art. 350a (Provision bei Beendigung; Rückgabe der Unterlagen).

export type HrLohnmodell = 'fix' | 'fix_provision' | 'provision';
export type HrVollmacht = 'vermittlung' | 'abschluss';
export type HrAuslagen = 'effektiv' | 'pauschal';

export type HrAntworten = {
  detailgrad: Detailgrad;
  // Parteien
  arbeitgeberName: string;
  arbeitgeberAdresse: string;
  reisenderVorname: string;
  reisenderName: string;
  reisenderAdresse: string;
  // Tätigkeit
  gegenstand: string;               // welche Geschäfte / Produkte / Branche
  reisegebiet: string;              // Reisegebiet oder Kundenkreis
  ausschliesslich: boolean;         // ausschliessliche Zuweisung (Art. 349)
  vollmacht: HrVollmacht;           // Vermittlung (Default) oder Abschluss (348b)
  // Dauer
  beginn: string;                   // ISO
  // Lohn (Art. 349a)
  lohnmodell: HrLohnmodell;
  fixCHF: string;                   // festes Gehalt pro Monat
  provisionProzent: string;         // Provisionssatz (%) bei Provision
  provisionBasis: string;           // Bezugsgrösse (z. B. «Nettoumsatz»)
  // Auslagenersatz (Art. 349d) – stets separat
  auslagen: HrAuslagen;
  auslagenPauschaleCHF: string;
  // Saison (Art. 350)
  saisonschwankung: boolean;
  // Delkredere (Art. 348a) – experte/optional
  delkredere: boolean;
  delkredereProvisionProzent: string;
  // Abschluss
  ort: string;
  datum: string;                    // ISO
};

export const HR_DEFAULTS: HrAntworten = {
  detailgrad: DETAILGRAD_DEFAULT,
  arbeitgeberName: '', arbeitgeberAdresse: '',
  reisenderVorname: '', reisenderName: '', reisenderAdresse: '',
  gegenstand: '', reisegebiet: '', ausschliesslich: true,
  vollmacht: 'vermittlung',
  beginn: '',
  lohnmodell: 'fix_provision', fixCHF: '', provisionProzent: '', provisionBasis: 'Nettoumsatz',
  auslagen: 'effektiv', auslagenPauschaleCHF: '',
  saisonschwankung: false,
  delkredere: false, delkredereProvisionProzent: '',
  ort: '', datum: '',
};

// ── Gates (deterministisch, normverifiziert) ────────────────────────────────

export type HrGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeHrGates(a: HrAntworten): HrGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  // G1 — reine Provision nur gültig, wenn angemessenes Entgelt (Art. 349a Abs. 2 OR).
  if (a.lohnmodell === 'provision') {
    hinweise.push('Reiner Provisionslohn ist nur gültig, wenn die Provision ein angemessenes Entgelt für die Tätigkeit ergibt (Art. 349a Abs. 2 OR); die Schriftform erfüllt dieser Vertrag. Für eine Probezeit von höchstens zwei Monaten kann der Lohn frei bestimmt werden (Art. 349a Abs. 3 OR).');
  }

  // G2 — Delkredere: nur Privatkundengeschäft, höchstens ¼ je Geschäft, nur
  // gegen angemessene Delkredere-Provision (Art. 348a Abs. 1/2 OR).
  if (a.delkredere) {
    if (!a.delkredereProvisionProzent.trim() || zahl(a.delkredereProvisionProzent) === null) {
      blocker.push('Delkredere-Haftung gewählt: Eine angemessene Delkredere-Provision ist anzugeben – ohne sie ist die Haftungsabrede nichtig (Art. 348a Abs. 2 OR).');
    }
    hinweise.push('Die Delkredere-Haftung ist auf Geschäfte mit PRIVATKUNDEN und auf höchstens einen Viertel des Schadens je Geschäft beschränkt; jede weitergehende Einstandspflicht für die Zahlung der Kunden ist nichtig (Art. 348a Abs. 1 und 2 OR).');
  }

  // G3 — Auslagenersatz darf nicht im Lohn/in der Provision eingeschlossen sein
  // (Art. 349d Abs. 2 OR). Die Maske erfasst ihn stets separat – offengelegt.
  hinweise.push('Der Auslagenersatz wird stets gesondert geschuldet; eine Abrede, er sei im festen Gehalt oder in der Provision eingeschlossen, ist nichtig (Art. 349d Abs. 2 OR).');

  // G4 — Vollmacht (Art. 348b OR).
  if (a.vollmacht === 'abschluss') {
    hinweise.push('Abschlussvollmacht vereinbart: Sie erstreckt sich auf die zur Ausführung üblichen Rechtshandlungen, NICHT aber – ohne besondere Ermächtigung – auf die Entgegennahme von Zahlungen oder die Bewilligung von Zahlungsfristen (Art. 348b Abs. 2 OR).');
  } else {
    hinweise.push('Ohne anderslautende schriftliche Abrede ist der Handelsreisende nur zur Vermittlung, nicht zum Abschluss von Geschäften ermächtigt (Art. 348b Abs. 1 OR).');
  }

  // G5 — Saison-Kündigung (Art. 350 OR).
  if (a.saisonschwankung) {
    hinweise.push('Beträgt die Provision mindestens einen Fünftel des Lohnes und unterliegt sie erheblichen saisonalen Schwankungen, kann während der Saison nur auf das Ende des zweiten der Kündigung folgenden Monats gekündigt werden (Art. 350 OR).');
  }

  return { blocker, warnungen, hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const HR_SCHEMA: VorlageSchema = {
  id: 'handelsreisendenvertrag',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Art. 347–350a OR verifiziert 20260101; FAHRPLAN-VERTRAGS-VARIANTEN P1d)',
  titel: 'Handelsreisendenvertrag',
  disclaimer:
    'Entwurf – erstellt mit LexMetrik. Keine Rechtsberatung. Der Handelsreisendenvertrag ist '
    + 'schriftlich zu regeln (Art. 347a OR). Zwingend sind insbesondere die Delkredere-Schranke '
    + '(Art. 348a OR), der gesonderte Auslagenersatz (Art. 349d OR) und die Saison-Kündigungsregel '
    + '(Art. 350 OR). Subsidiär gelten die allgemeinen Bestimmungen über den Einzelarbeitsvertrag '
    + '(Art. 319 ff. OR).',
  bausteine: [
    { id: 'H01_parteien', rolle: 'parteien',
      text: 'zwischen\n\n{{arbeitgeberBlock}}\n(nachfolgend «Arbeitgeber»)\n\nund\n\n{{reisenderBlock}}\n(nachfolgend «Handelsreisende/r»)',
      begruendung: 'Bezeichnung der Vertragsparteien – immer enthalten.',
      norm: 'Art. 347 OR' },
    { id: 'H02_taetigkeit', ueberschrift: 'Tätigkeit und Reisegebiet',
      text: 'Der/Die Handelsreisende vermittelt{{abschlussWort}} auf Rechnung des Arbeitgebers ausserhalb von dessen Geschäftsräumen Geschäfte über {{gegenstand}}. Zugewiesen ist folgendes Reisegebiet bzw. folgender Kundenkreis: {{reisegebiet}}.{{ausschliesslichSatz}} Das Arbeitsverhältnis beginnt am {{beginnFmt}}.',
      nummeriert: true,
      begruendung: 'Gegenstand, Reisegebiet/Kundenkreis und Beginn (Art. 347/349 OR) – immer enthalten.',
      norm: 'Art. 347 OR' },
    { id: 'H03_vollmacht', ueberschrift: 'Vollmacht',
      text: '{{vollmachtText}}',
      nummeriert: true,
      begruendung: 'Umfang der Vollmacht (Vermittlung/Abschluss; keine Inkasso-/Stundungsbefugnis ohne Sondervollmacht) – Art. 348b OR.',
      norm: 'Art. 348b OR' },
    { id: 'H04_pflichten', ueberschrift: 'Pflichten des Handelsreisenden',
      text: 'Der/Die Handelsreisende besucht die Kundschaft in der vorgeschriebenen Weise und darf ohne schriftliche Bewilligung des Arbeitgebers weder für eigene noch für fremde Rechnung Geschäfte vermitteln oder abschliessen. Er/Sie erstattet regelmässig Bericht, übermittelt die erhaltenen Bestellungen sofort und informiert über erhebliche Tatsachen, die den Kundenkreis betreffen (Art. 348 OR).',
      includeIf: AB_STANDARD, nummeriert: true,
      begruendung: 'Besuchs-, Konkurrenzunterlassungs- und Berichtspflicht (Art. 348 OR) – ab «standard».',
      norm: 'Art. 348 OR' },
    { id: 'H05_lohn', ueberschrift: 'Lohn',
      text: '{{lohnText}} Der Lohn wird am Ende jedes Monats abgerechnet und ausgerichtet; die gesetzlichen und vertraglichen Abzüge gehen zulasten des Handelsreisenden/der Handelsreisenden.',
      nummeriert: true,
      begruendung: 'Lohn als festes Gehalt mit/ohne Provision bzw. reine Provision (Art. 349a OR).',
      norm: 'Art. 349a OR' },
    { id: 'H06_provision_bezug', ueberschrift: 'Provisionsanspruch',
      text: '{{provisionBezugText}} Ist im Zeitpunkt der Fälligkeit der Wert eines Geschäftes noch nicht bestimmbar, wird die Provision zunächst auf dem geschätzten Mindestwert und der Rest bei Ausführung ausgerichtet (Art. 349b Abs. 3 OR).',
      includeIf: { feld: 'lohnHatProvision', eq: true }, nummeriert: true,
      begruendung: 'Bezugsumfang der Provision je nach (Aus-)Schliesslichkeit des Gebiets (Art. 349b OR).',
      norm: 'Art. 349b OR' },
    { id: 'H07_auslagen', ueberschrift: 'Auslagenersatz',
      text: '{{auslagenText}} Eine Abrede, wonach der Auslagenersatz im festen Gehalt oder in der Provision eingeschlossen sei, ist nichtig (Art. 349d Abs. 2 OR).',
      nummeriert: true,
      begruendung: 'Gesonderter Auslagenersatz; Einschluss-Verbot (Art. 349d OR) – zwingend.',
      norm: 'Art. 349d OR' },
    { id: 'H08_delkredere', ueberschrift: 'Delkredere',
      text: 'Bei Geschäften mit Privatkunden haftet der/die Handelsreisende beim einzelnen Geschäft für höchstens einen Viertel des Schadens, der dem Arbeitgeber aus der Nichterfüllung durch den Kunden erwächst. Als Gegenleistung wird eine Delkredere-Provision von {{delkredereProvFmt}} % vereinbart. Jede weitergehende Einstandspflicht ist nichtig (Art. 348a OR).',
      includeIf: { and: [{ feld: 'delkredere', eq: true }, NUR_EXPERTE] }, nummeriert: true,
      begruendung: 'Delkredere-Haftung in den zwingenden Schranken des Art. 348a OR – Detailgrad «experte».',
      norm: 'Art. 348a OR' },
    { id: 'H09_verhinderung', ueberschrift: 'Lohn bei unverschuldeter Verhinderung',
      text: 'Ist der/die Handelsreisende ohne eigenes Verschulden an der Reisetätigkeit verhindert und gleichwohl Lohn geschuldet, bemisst sich dieser nach dem festen Gehalt und einer angemessenen Entschädigung für den Ausfall der Provision (Art. 349c OR).',
      includeIf: { and: [AB_STANDARD, { feld: 'lohnHatProvision', eq: true }] }, nummeriert: true,
      begruendung: 'Lohn bei unverschuldeter Verhinderung mit Provisionsausfall (Art. 349c OR) – ab «standard», nur mit Provision.',
      norm: 'Art. 349c OR' },
    { id: 'H10_kuendigung', ueberschrift: 'Beendigung des Arbeitsverhältnisses',
      text: 'Für die Kündigung gelten die allgemeinen Fristen des Einzelarbeitsvertrags (Art. 335 ff. OR).{{saisonSatz}} Bei Beendigung ist dem/der Handelsreisenden die Provision auf allen bis dahin abgeschlossenen oder vermittelten Geschäften sowie auf den bis zur Beendigung eingehenden Bestellungen auszurichten; die überlassenen Muster, Preistarife und Kundenverzeichnisse sind zurückzugeben (Art. 350a OR).',
      nummeriert: true,
      begruendung: 'Kündigung (335 ff. subsidiär), Saison-Sonderregel (350) und Provisionsabrechnung/Rückgabe bei Beendigung (350a OR).',
      norm: 'Art. 350a OR' },
    { id: 'H11_retention', ueberschrift: 'Retentionsrecht',
      text: 'Zur Sicherung seiner fälligen Forderungen aus dem Arbeitsverhältnis steht dem/der Handelsreisenden das Retentionsrecht an beweglichen Sachen, Wertpapieren und an Inkassozahlungen zu; an Fahrausweisen, Preistarifen und Kundenverzeichnissen besteht es nicht (Art. 349e OR).',
      includeIf: NUR_EXPERTE, nummeriert: true,
      begruendung: 'Retentionsrecht des Handelsreisenden (Art. 349e OR) – Detailgrad «experte».',
      norm: 'Art. 349e OR' },
    { id: 'H12_schluss', ueberschrift: 'Schlussbestimmungen',
      text: 'Änderungen und Ergänzungen bedürfen der Schriftform. Soweit dieser Vertrag nichts regelt, gelten die Art. 347 ff. OR und subsidiär die allgemeinen Bestimmungen über den Einzelarbeitsvertrag (Art. 319 ff. OR). Dieser Vertrag wird in zwei Exemplaren ausgefertigt; jede Partei erhält ein unterzeichnetes Exemplar.',
      nummeriert: true,
      begruendung: 'Schriftformvorbehalt, Gesetzesverweis und Ausfertigung – immer enthalten.',
      norm: 'Art. 347a OR' },
    { id: 'H13_unterschriften', rolle: 'unterschrift',
      text: '{{ort}}, {{datumFmt}}\n\n\nDer Arbeitgeber:\n\n___________________________\n{{arbeitgeberName}}\n\n\nDer/Die Handelsreisende:\n\n___________________________\n{{reisenderKurz}}',
      begruendung: 'Ort, Datum und beidseitige Unterschriften (Art. 347a OR Schriftform).',
      norm: 'Art. 347a OR' },
  ],
};

// ── Zusammenstellen ─────────────────────────────────────────────────────────

export function hrZusammenstellen(a: HrAntworten) {
  const fixFmt = zahl(a.fixCHF) !== null ? fmtCHF(a.fixCHF) : '________';
  const provFmt = zahl(a.provisionProzent) !== null ? String(zahl(a.provisionProzent)) : '________';
  const lohnHatProvision = a.lohnmodell !== 'fix';

  const lohnText = a.lohnmodell === 'fix'
    ? `Der/Die Handelsreisende erhält ein festes Gehalt von CHF ${fixFmt} pro Monat.`
    : a.lohnmodell === 'fix_provision'
      ? `Der/Die Handelsreisende erhält ein festes Gehalt von CHF ${fixFmt} pro Monat zuzüglich einer Provision von ${provFmt} % des ${a.provisionBasis.trim() || 'Nettoumsatzes'} der zustande gekommenen Geschäfte.`
      : `Der Lohn besteht ausschliesslich aus einer Provision von ${provFmt} % des ${a.provisionBasis.trim() || 'Nettoumsatzes'} der zustande gekommenen Geschäfte; die Parteien halten fest, dass diese Provision ein angemessenes Entgelt für die Tätigkeit ergibt (Art. 349a Abs. 2 OR).`;

  const provisionBezugText = a.ausschliesslich
    ? 'Da dem/der Handelsreisenden das Reisegebiet bzw. der Kundenkreis ausschliesslich zugewiesen ist, ist ihm/ihr die Provision auf allen Geschäften auszurichten, die mit Kunden in diesem Gebiet oder Kundenkreis abgeschlossen werden – auch auf den vom Arbeitgeber selbst abgeschlossenen (Art. 349b Abs. 1 OR).'
    : 'Da das Reisegebiet bzw. der Kundenkreis nicht ausschliesslich zugewiesen ist, ist die Provision nur auf den vom/von der Handelsreisenden vermittelten oder abgeschlossenen Geschäften auszurichten (Art. 349b Abs. 2 OR).';

  const auslagenText = a.auslagen === 'pauschal'
    ? `Der Arbeitgeber ersetzt die mit der Reisetätigkeit notwendig verbundenen Auslagen durch eine gesonderte Pauschale von CHF ${zahl(a.auslagenPauschaleCHF) !== null ? fmtCHF(a.auslagenPauschaleCHF) : '________'} pro Monat.`
    : 'Der Arbeitgeber ersetzt dem/der Handelsreisenden die mit der Reisetätigkeit notwendig verbundenen Auslagen gegen Beleg.';

  const vollmachtText = a.vollmacht === 'abschluss'
    ? 'Der/Die Handelsreisende ist ermächtigt, Geschäfte abzuschliessen. Die Vollmacht erstreckt sich auf die zur Ausführung gewöhnlich gehörenden Rechtshandlungen; zur Entgegennahme von Zahlungen und zur Bewilligung von Zahlungsfristen bedarf es einer besonderen Ermächtigung (Art. 348b Abs. 2 OR). Die vorgeschriebenen Preise und Geschäftsbedingungen sind einzuhalten.'
    : 'Der/Die Handelsreisende ist ermächtigt, Geschäfte zu vermitteln, nicht aber abzuschliessen (Art. 348b Abs. 1 OR).';

  const antworten: Antworten = {
    ...a,
    arbeitgeberBlock: [a.arbeitgeberName, a.arbeitgeberAdresse].filter((s) => s.trim()).join('\n'),
    reisenderBlock: [`${a.reisenderVorname} ${a.reisenderName}`.trim(), a.reisenderAdresse].filter((s) => s.trim()).join('\n'),
    reisenderKurz: `${a.reisenderVorname} ${a.reisenderName}`.trim() || '________',
    abschlussWort: a.vollmacht === 'abschluss' ? ' und schliesst' : '',
    gegenstand: a.gegenstand.trim() || '________',
    reisegebiet: a.reisegebiet.trim() || '________',
    ausschliesslichSatz: a.ausschliesslich
      ? ' Die Zuweisung erfolgt ausschliesslich; der Arbeitgeber bleibt befugt, mit Kunden im Gebiet selbst Geschäfte abzuschliessen (Art. 349 Abs. 1 OR).'
      : '',
    beginnFmt: fmtIsoStrict(a.beginn),
    lohnText,
    lohnHatProvision,
    provisionBezugText,
    auslagenText,
    vollmachtText,
    delkredereProvFmt: zahl(a.delkredereProvisionProzent) !== null ? String(zahl(a.delkredereProvisionProzent)) : '________',
    saisonSatz: a.saisonschwankung
      ? ' Beträgt die Provision mindestens einen Fünftel des Lohnes und unterliegt sie erheblichen saisonalen Schwankungen, kann während der Saison nur auf das Ende des zweiten der Kündigung folgenden Monats gekündigt werden (Art. 350 OR).'
      : '',
    datumFmt: fmtIsoStrict(a.datum),
  };

  return { ergebnis: assemble(HR_SCHEMA, antworten) };
}
