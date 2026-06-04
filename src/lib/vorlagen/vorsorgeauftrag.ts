import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';

// ─── Vorsorgeauftrag (Art. 360–369 ZGB) — dritte Vorlage ────────────────────
//
// Gemäss normverifizierter Implementierungs-Anweisung (in Kraft seit 1.1.2013,
// seither nicht revidiert). Zentrale Determinismus-Weiche: formMode —
// EIGENHÄNDIG (von Anfang bis Ende von Hand, datiert, unterzeichnet,
// Art. 361 Abs. 2 ZGB → Ausgabe nur als Abschreib-Mustertext) ODER
// ÖFFENTLICH BEURKUNDET (Entwurf für die Urkundsperson; Verfahren kantonal,
// BGE 151 III 81). Errichtung verlangt HANDLUNGSFÄHIGKEIT (volljährig +
// urteilsfähig, Art. 13 ZGB; keine umfassende Beistandschaft, Art. 398 ZGB).
// Wirksam wird der Auftrag erst durch KESB-Validierung (Art. 363 ZGB).

export type VaFormMode = 'eigenhaendig' | 'oeffentlich_beurkundet';
export type VaBereich = 'personensorge' | 'vermoegenssorge' | 'rechtsverkehr';

export const VA_BEREICHE: { id: VaBereich; label: string }[] = [
  { id: 'personensorge', label: 'Personensorge' },
  { id: 'vermoegenssorge', label: 'Vermögenssorge' },
  { id: 'rechtsverkehr', label: 'Vertretung im Rechtsverkehr' },
];

// Aufgaben-Module je Bereich (Checkbox-Auswahl, Klauseltexte fest)
export const VA_MODULE: Record<VaBereich, { id: string; label: string }[]> = {
  personensorge: [
    { id: 'wohnsituation', label: 'Entscheid über Wohnsituation und Aufenthalt (inkl. Heim-/Pflegeeintritt)' },
    { id: 'pflege', label: 'Organisation von Pflege und alltäglicher Betreuung' },
    { id: 'medizin', label: 'Vertretung bei medizinischen Massnahmen (Art. 377 f. ZGB); eine Patientenverfügung geht vor' },
    { id: 'post', label: 'Entgegennahme und Erledigung der Post' },
    { id: 'teilhabe', label: 'Sicherstellung der Teilhabe am gesellschaftlichen Leben' },
  ],
  vermoegenssorge: [
    { id: 'verwaltung', label: 'Verwaltung von Einkommen und Vermögen' },
    { id: 'zahlungsverkehr', label: 'Zahlungsverkehr und Begleichung von Rechnungen' },
    { id: 'bank', label: 'Bankgeschäfte (Konten und Depots, Weiterführung der Anlagestrategie)' },
    { id: 'liegenschaften', label: 'Verwaltung von Liegenschaften' },
    { id: 'steuern', label: 'Erstellen und Einreichen der Steuererklärung' },
  ],
  rechtsverkehr: [
    { id: 'behoerden', label: 'Vertretung gegenüber Behörden, Gerichten, Banken und Versicherungen' },
    { id: 'vertraege', label: 'Abschluss, Änderung und Kündigung von Verträgen' },
    { id: 'heimvertrag', label: 'Abschluss eines Vertrags mit einer Wohn- oder Pflegeeinrichtung' },
    { id: 'schweigepflicht', label: 'Entbindung von Berufs- und Amtsgeheimnissen gegenüber der beauftragten Person' },
  ],
};

export type VaBeauftragte = {
  name: string;
  typ: 'natuerlich' | 'juristisch';
  angaben: string;            // Geburtsdatum/Adresse bzw. Sitz
  bereiche: VaBereich[];
};

export type VaAntworten = {
  // Step 0 — Eligibility (Art. 13/14/16/398 ZGB)
  volljaehrig: boolean;
  urteilsfaehigBestaetigt: boolean;
  keineUmfassendeBeistandschaft: boolean;
  // Form-Gate (Art. 361)
  formMode: VaFormMode;
  kanton?: string;            // für Beurkundungs-Hinweise (nur informativ)
  // Auftraggeberin/Auftraggeber
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  heimatort: string;
  adresse: string;
  // Beauftragte + Ersatz
  beauftragte: VaBeauftragte[];
  ersatzpersonen: { name: string; angaben: string }[];  // Reihenfolge = Rang
  // Module je Bereich (gewählte Modul-IDs)
  module: Record<VaBereich, string[]>;
  // Sondervollmachten / Weisungen / Entschädigung
  schenkungenErlaubt: boolean;
  besondereGeschaefte: boolean;  // Vergleich, Schiedsabrede, Wechsel (Art. 396 Abs. 3 OR)
  weisungen?: string;
  entschaedigung: 'keine_angabe' | 'unentgeltlich' | 'pauschale' | 'nach_aufwand';
  entschaedigungBetrag?: number; // CHF/Jahr (pauschale) bzw. CHF/Stunde (nach_aufwand)
  // Abschluss
  pvVorhanden: boolean;
  pvHinterlegung?: string;
  ersetztFruehere: boolean;
  ort?: string;
  datum: string;              // nur eigenhändig zwingend (wird mit abgeschrieben)
};

export const VA_DEFAULTS: VaAntworten = {
  volljaehrig: false, urteilsfaehigBestaetigt: false, keineUmfassendeBeistandschaft: false,
  formMode: 'eigenhaendig',
  vorname: '', nachname: '', geburtsdatum: '', heimatort: '', adresse: '',
  beauftragte: [],
  ersatzpersonen: [],
  module: { personensorge: [], vermoegenssorge: [], rechtsverkehr: [] },
  schenkungenErlaubt: false,
  besondereGeschaefte: false,
  entschaedigung: 'keine_angabe',
  pvVorhanden: false,
  ersetztFruehere: true,
  datum: '',
};

// Dokumentierte Beurkundungs-Hinweise je Kanton (nur belegte Beispiele —
// keine erfundene Vollabdeckung; sonst generischer Hinweis).
export function beurkundungsHinweis(kanton?: string): string {
  const k = (kanton ?? '').toUpperCase();
  if (k === 'ZH') return 'Zürich: Amtsnotariat — ausschliessliche Zuständigkeit der Notariate.';
  if (k === 'BE') return 'Bern: freies Notariat (Richtwert gemäss Praxis ab ca. CHF 500).';
  if (k === 'TI') return 'Tessin: freies (lateinisches) Notariat.';
  if (k === 'SG') return 'St. Gallen: gemischtes System — auch Anwältinnen/Anwälte beurkundungsbefugt (Amtsnotariat Richtwert ca. CHF 400 zzgl. MwSt).';
  if (k === 'TG' || k === 'AR' || k === 'AI') return `${k}: gemischtes System — auch Anwältinnen/Anwälte beurkundungsbefugt.`;
  if (k === 'SZ') return 'Schwyz: auch Gemeinde-/Landschreiber beurkundungsbefugt.';
  return 'Das Beurkundungsverfahren richtet sich nach kantonalem Recht (Art. 55 SchlT ZGB; BGE 151 III 81) — zuständige Urkundsperson am Wohnsitz erfragen.';
}

// ── Gates ───────────────────────────────────────────────────────────────────

export type VaGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeVaGates(a: VaAntworten): VaGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  // Eligibility-Gate (Art. 13/14/16/398 ZGB) — hart
  if (!a.volljaehrig || !a.urteilsfaehigBestaetigt || !a.keineUmfassendeBeistandschaft) {
    blocker.push(
      'Errichtungsvoraussetzungen nicht bestätigt: Der Vorsorgeauftrag verlangt Handlungsfähigkeit — Volljährigkeit (Art. 14 ZGB), Urteilsfähigkeit (Art. 16 ZGB) und keine umfassende Beistandschaft (Art. 398 ZGB).',
    );
  }

  // Mindestens ein Bereich einer beauftragten Person zugewiesen
  const aktiveBereiche = new Set(a.beauftragte.flatMap((b) => (b.name.trim() ? b.bereiche : [])));
  if (a.beauftragte.length === 0 || aktiveBereiche.size === 0) {
    blocker.push('Mindestens eine beauftragte Person mit mindestens einem Aufgabenbereich bezeichnen (Art. 360 Abs. 1 ZGB).');
  }

  // Determinismus-Schwelle: medizinische Vertretung nur durch natürliche Person
  const medizinJuristisch = a.beauftragte.some(
    (b) => b.typ === 'juristisch' && b.bereiche.includes('personensorge') && a.module.personensorge.includes('medizin'),
  );
  if (medizinJuristisch) {
    blocker.push('Die Vertretung bei medizinischen Massnahmen kann nur einer NATÜRLICHEN Person übertragen werden (Art. 378 Abs. 1 Ziff. 1 ZGB) — bitte Person oder Modulauswahl anpassen.');
  }

  // Liegenschaften → ausdrückliche Sondervollmacht (wird automatisch aufgenommen)
  if (a.module.vermoegenssorge.includes('liegenschaften')) {
    hinweise.push('Liegenschaften gewählt: Die ausdrückliche Sondervollmacht für Erwerb, Belastung und Veräusserung von Grundstücken wird automatisch aufgenommen (Art. 396 Abs. 3 OR — analoge Anwendung in der Lehre umstritten, von der Praxis aber empfohlen).');
  }

  // Ersatzperson empfohlen
  if (aktiveBereiche.size > 0 && a.ersatzpersonen.filter((e) => e.name.trim()).length === 0) {
    hinweise.push('Eine Ersatzverfügung ist empfohlen, falls die beauftragte Person ungeeignet ist, ablehnt oder kündigt (Art. 360 Abs. 3 ZGB) — idealerweise eine Person ausserhalb möglicher Interessenkonflikte.');
  }

  // Entschädigung offen → KESB legt fest
  if (a.entschaedigung === 'keine_angabe') {
    hinweise.push('Ohne Entschädigungsregelung legt die KESB bei der Validierung eine angemessene Entschädigung fest (Art. 366 ZGB), zulasten der auftraggebenden Person.');
  }

  // Wirksamkeit erst nach KESB-Validierung — immer
  hinweise.push('Wirksam wird der Vorsorgeauftrag erst, wenn die KESB am Wohnsitz (Art. 442 ZGB) bei eingetretener Urteilsunfähigkeit Gültigkeit, Voraussetzungen und Eignung geprüft hat (Validierung, Art. 363 ZGB).');

  return { blocker, warnungen, hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

const BEREICH_LABEL: Record<VaBereich, string> = {
  personensorge: 'Personensorge',
  vermoegenssorge: 'Vermögenssorge',
  rechtsverkehr: 'Vertretung im Rechtsverkehr',
};

export const VA_SCHEMA: VorlageSchema = {
  id: 'vorsorgeauftrag',
  version: '1.0.0 (Rechtsstand Art. 360–369 ZGB, in Kraft seit 1.1.2013)',
  titel: 'Vorsorgeauftrag',
  disclaimer:
    'Entwurf — erstellt mit LexMetrik. Keine Rechtsberatung. Gültig ist der Vorsorgeauftrag nur ' +
    'vollständig eigenhändig (von Hand geschrieben, datiert, unterzeichnet, Art. 361 Abs. 2 ZGB) ' +
    'oder öffentlich beurkundet (Art. 361 Abs. 1 ZGB); wirksam erst nach Validierung durch die ' +
    'KESB (Art. 363 ZGB). Bei komplexen Vermögensverhältnissen oder Unternehmen: Notariat bzw. ' +
    'Fachberatung beiziehen.',
  bausteine: [
    {
      id: 'V01_identifikation',
      text:
        'Ich, {{vorname}} {{nachname}}, geboren am {{geburtsdatum}}, von {{heimatort}}, wohnhaft ' +
        '{{adresse}}, errichte hiermit — handlungsfähig im Sinne von Art. 13 ZGB — für den Fall ' +
        'meiner Urteilsunfähigkeit den folgenden Vorsorgeauftrag:',
      begruendung: 'Identifikation und Handlungsfähigkeits-Präambel — immer enthalten.',
      norm: 'Art. 360 Abs. 1 ZGB',
    },
    {
      id: 'V02_beauftragte',
      ueberschrift: 'Beauftragte Person(en)',
      text: 'Ich beauftrage:',
      includeIf: { feld: 'beauftragteListe', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil mindestens eine beauftragte Person bezeichnet wurde.',
      norm: 'Art. 360 Abs. 1 ZGB',
    },
    {
      id: 'V02b_beauftragteliste',
      text: '– {{item.name}} ({{item.angaben}}) für: {{item.bereicheText}};',
      includeIf: { feld: 'beauftragteListe', nichtLeer: true },
      wiederholeUeber: 'beauftragteListe',
      begruendung: 'Je beauftragte Person eine Zeile mit den übertragenen Aufgabenbereichen.',
      norm: 'Art. 360 Abs. 1 ZGB',
    },
    {
      id: 'V03_ersatz',
      text:
        'Ist eine beauftragte Person für die Aufgaben nicht geeignet, nimmt sie den Auftrag nicht ' +
        'an oder kündigt sie ihn, setze ich als Ersatz ein (in dieser Reihenfolge): {{ersatzText}}.',
      includeIf: { feld: 'ersatzText', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil Ersatzpersonen bezeichnet wurden (Ersatzverfügung).',
      norm: 'Art. 360 Abs. 3 ZGB',
    },
    {
      id: 'V04_personensorge',
      ueberschrift: 'Personensorge',
      text: 'Im Bereich der Personensorge umfasst der Auftrag insbesondere:',
      includeIf: { feld: 'personensorgeListe', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil der Bereich Personensorge übertragen und Module gewählt wurden.',
      norm: 'Art. 360 Abs. 1 ZGB',
    },
    {
      id: 'V04b_personensorgeliste',
      text: '– {{item.label}};',
      includeIf: { feld: 'personensorgeListe', nichtLeer: true },
      wiederholeUeber: 'personensorgeListe',
      begruendung: 'Je gewähltes Personensorge-Modul eine Zeile.',
      norm: 'Art. 360 Abs. 2 ZGB',
    },
    {
      id: 'V05_vermoegenssorge',
      ueberschrift: 'Vermögenssorge',
      text: 'Im Bereich der Vermögenssorge umfasst der Auftrag insbesondere:',
      includeIf: { feld: 'vermoegenssorgeListe', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil der Bereich Vermögenssorge übertragen und Module gewählt wurden.',
      norm: 'Art. 360 Abs. 1 ZGB',
    },
    {
      id: 'V05b_vermoegenssorgeliste',
      text: '– {{item.label}};',
      includeIf: { feld: 'vermoegenssorgeListe', nichtLeer: true },
      wiederholeUeber: 'vermoegenssorgeListe',
      begruendung: 'Je gewähltes Vermögenssorge-Modul eine Zeile.',
      norm: 'Art. 360 Abs. 2 ZGB',
    },
    {
      id: 'V06_rechtsverkehr',
      ueberschrift: 'Vertretung im Rechtsverkehr',
      text: 'Im Rechtsverkehr umfasst der Auftrag insbesondere:',
      includeIf: { feld: 'rechtsverkehrListe', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil der Bereich Rechtsverkehr übertragen und Module gewählt wurden.',
      norm: 'Art. 360 Abs. 1 ZGB',
    },
    {
      id: 'V06b_rechtsverkehrliste',
      text: '– {{item.label}};',
      includeIf: { feld: 'rechtsverkehrListe', nichtLeer: true },
      wiederholeUeber: 'rechtsverkehrListe',
      begruendung: 'Je gewähltes Rechtsverkehr-Modul eine Zeile.',
      norm: 'Art. 360 Abs. 2 ZGB',
    },
    {
      id: 'V07_grundstueck',
      text:
        'Die beauftragte Person ist ausdrücklich ermächtigt, Grundeigentum zu erwerben, zu belasten ' +
        'und zu veräussern sowie die entsprechenden Grundbucheinschreibungen zu veranlassen.',
      includeIf: { feld: 'liegenschaftenGewaehlt', eq: true },
      nummeriert: true,
      begruendung: 'Automatisch aufgenommen, weil das Modul «Liegenschaften» gewählt wurde — ausdrückliche Sondervollmacht.',
      norm: 'Art. 396 Abs. 3 OR',
      hinweis: 'Ob Art. 396 Abs. 3 OR auf den Vorsorgeauftrag analog anwendbar ist, ist in der Lehre umstritten; die Praxis empfiehlt die ausdrückliche Sondervollmacht dennoch.',
    },
    {
      id: 'V08_schenkungen',
      text:
        'Die beauftragte Person ist befugt, übliche Gelegenheitsgeschenke auszurichten und ' +
        'Zuwendungen zur Erfüllung einer sittlichen Pflicht vorzunehmen.',
      includeIf: { feld: 'schenkungenErlaubt', eq: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil Gelegenheitsgeschenke erlaubt werden sollen.',
      norm: 'Art. 240 Abs. 2 OR',
      hinweis: 'Aus dem Vermögen einer handlungsunfähigen Person dürfen nur übliche Gelegenheitsgeschenke ausgerichtet werden — weitergehende Schenkungen sind problematisch.',
    },
    {
      id: 'V09_besondere',
      text:
        'Die beauftragte Person ist ausdrücklich ermächtigt, Vergleiche abzuschliessen, ' +
        'Schiedsvereinbarungen einzugehen und Wechselverbindlichkeiten einzugehen.',
      includeIf: { feld: 'besondereGeschaefte', eq: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil besondere Geschäfte ausdrücklich ermächtigt werden sollen.',
      norm: 'Art. 396 Abs. 3 OR',
    },
    {
      id: 'V10_weisungen',
      ueberschrift: 'Weisungen',
      text: '{{weisungen}}',
      includeIf: { feld: 'weisungen', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil Weisungen für die Erfüllung der Aufgaben erteilt wurden.',
      norm: 'Art. 360 Abs. 2 ZGB',
    },
    {
      id: 'V11_entschaedigung',
      ueberschrift: 'Entschädigung',
      text: '{{entschaedigungText}}',
      includeIf: { feld: 'entschaedigungText', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil eine Entschädigungsregelung getroffen wurde (sonst legt die KESB sie fest).',
      norm: 'Art. 366 ZGB',
    },
    {
      id: 'V12_pv',
      text: 'Ich habe eine separate Patientenverfügung errichtet{{pvHinterlegungZeile}}; für medizinische Massnahmen geht diese vor.',
      includeIf: { feld: 'pvVorhanden', eq: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil auf eine bestehende Patientenverfügung verwiesen wird.',
      norm: 'Art. 370 ZGB',
    },
    {
      id: 'V13_ersetzt',
      text: 'Dieser Vorsorgeauftrag ersetzt alle früheren Vorsorgeaufträge.',
      includeIf: { feld: 'ersetztFruehere', eq: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil frühere Vorsorgeaufträge ausdrücklich ersetzt werden sollen.',
      norm: 'Art. 362 Abs. 3 ZGB',
    },
    {
      id: 'V14_schluss_eigenhaendig',
      text: '{{ortDatumZeile}}\n\n\n_________________________________\n(eigenhändige Unterschrift: {{vorname}} {{nachname}})',
      includeIf: { feld: 'formMode', eq: 'eigenhaendig' },
      begruendung: 'Schlussformel der eigenhändigen Form: Ort/Datum und Unterschrift werden — wie der ganze Text — von Hand geschrieben.',
      norm: 'Art. 361 Abs. 2 ZGB',
    },
    {
      id: 'V14_schluss_beurkundung',
      text:
        'Ort, Datum und Unterschriften erfolgen anlässlich der öffentlichen Beurkundung durch die ' +
        'Urkundsperson nach kantonalem Recht.',
      includeIf: { feld: 'formMode', eq: 'oeffentlich_beurkundet' },
      begruendung: 'Schlusshinweis der beurkundeten Form: Errichtung erfolgt vor der Urkundsperson.',
      norm: 'Art. 361 Abs. 1 ZGB',
      hinweis: 'Das Beurkundungsverfahren richtet sich nach kantonalem Recht; zwei Zeugen wie beim öffentlichen Testament sind nicht erforderlich (BGE 151 III 81).',
    },
  ],
};

// ── Antworten aufbereiten und zusammenstellen ───────────────────────────────

export function vaZusammenstellen(a: VaAntworten) {
  const datum = a.datum ? a.datum.split('-').reverse().join('.') : '________';
  const beauftragteListe = a.beauftragte
    .filter((b) => b.name.trim() && b.bereiche.length > 0)
    .map((b) => ({
      name: b.name,
      angaben: b.angaben || (b.typ === 'juristisch' ? 'juristische Person' : '________'),
      bereicheText: b.bereiche.map((x) => BEREICH_LABEL[x]).join(', '),
    }));

  const modulListe = (bereich: VaBereich) => {
    const aktiv = a.beauftragte.some((b) => b.name.trim() && b.bereiche.includes(bereich));
    if (!aktiv) return [];
    return VA_MODULE[bereich].filter((m) => a.module[bereich].includes(m.id)).map((m) => ({ label: m.label }));
  };

  const entschaedigungText =
    a.entschaedigung === 'unentgeltlich'
      ? 'Die beauftragte Person übt den Auftrag unentgeltlich aus; notwendige Spesen werden ihr ersetzt.'
      : a.entschaedigung === 'pauschale'
        ? `Die beauftragte Person erhält eine pauschale Entschädigung von CHF ${a.entschaedigungBetrag ?? '________'} pro Jahr; notwendige Spesen werden ihr zusätzlich ersetzt.`
        : a.entschaedigung === 'nach_aufwand'
          ? `Die beauftragte Person wird nach Zeitaufwand zu einem Ansatz von CHF ${a.entschaedigungBetrag ?? '________'} pro Stunde entschädigt; notwendige Spesen werden ihr ersetzt.`
          : '';

  const antworten: Antworten = {
    ...a,
    beauftragteListe,
    ersatzText: a.ersatzpersonen
      .filter((e) => e.name.trim())
      .map((e, i) => `${i + 1}. ${e.name}${e.angaben ? ` (${e.angaben})` : ''}`)
      .join('; '),
    personensorgeListe: modulListe('personensorge'),
    vermoegenssorgeListe: modulListe('vermoegenssorge'),
    rechtsverkehrListe: modulListe('rechtsverkehr'),
    liegenschaftenGewaehlt:
      a.module.vermoegenssorge.includes('liegenschaften') &&
      a.beauftragte.some((b) => b.name.trim() && b.bereiche.includes('vermoegenssorge')),
    entschaedigungText,
    pvHinterlegungZeile: a.pvHinterlegung?.trim() ? ` (Hinterlegungsort: ${a.pvHinterlegung.trim()})` : '',
    ortDatumZeile: `${a.ort?.trim() ? a.ort.trim() + ', ' : ''}den ${datum}`,
  };
  return assemble(VA_SCHEMA, antworten);
}
