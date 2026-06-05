import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { fmtDatumLang } from './datum';

// ─── Mietvertrag Wohn- & Geschäftsräume (Art. 253 ff. OR) — sechste Vorlage ──
//
// Grundlage: normverifiziertes Rechtsgutachten «Schweizer Mietvertrag»
// (5.6.2026). Zentrale Verzweigung gemäss Gutachten: objektTyp (Wohnraum |
// Geschäftsraum) und Kanton. Validierungskern:
//   · absolut zwingend  → Blocker (Kautionsmaximum Wohnraum Art. 257e Abs. 2,
//     Anfechtungssystem Art. 270 ff., Kündigungs-Formvorschriften 266l–266o,
//     Verrechnungsverzicht Art. 265)
//   · relativ zwingend  → mieterungünstige Abweichungen gesperrt
//     (Erhaltungspflicht 256, kleiner Unterhalt 259, Mindestfristen 266c/d)
//   · Schriftform-Klauseln → Index-/Staffelmiete (269b/269c; Mindestdauern
//     5 bzw. 3 Jahre DIREKT am Fedlex-Wortlaut verifiziert, 5.6.2026)
//   · Form-Gates als Disclosure: kantonale Formularpflicht Anfangsmietzins
//     (Art. 270 Abs. 2 OR), amtliches Formular bei Vermieterkündigung,
//     Familienwohnung (266m/266n)
// Alle zitierten OR-Anker empirisch gegen das Fedlex-Filestore-HTML
// verifiziert (5.6.2026). Kein LLM: feste Bausteine, deterministisch.

// ── Wartbare, DATIERTE Parameter (Gutachten Stufe 4) ────────────────────────
export const MV_PARAMETER = {
  referenzzinssatz: { wert: 1.25, stand: '1.6.2026', quelle: 'BWO (quartalsweise publiziert)' },
  mwstSatz: { wert: 8.1, stand: '1.1.2024' },
} as const;

// Kantone mit Formularpflicht für den Anfangsmietzins (Art. 270 Abs. 2 OR).
// Quelle: BWO-Verzeichnis vom 4.2.2026 — DYNAMISCH (Anordnung/Aufhebung
// jährlich per 1. November), jährlich nachzuführen.
export const MV_FORMULARPFLICHT: { kanton: string; umfang: 'ganz' | 'teilweise'; hinweis?: string }[] = [
  { kanton: 'BS', umfang: 'ganz' },
  { kanton: 'BE', umfang: 'ganz', hinweis: 'Quellendiskrepanz — vor Verwendung beim Kanton gegenprüfen' },
  { kanton: 'FR', umfang: 'ganz' },
  { kanton: 'GE', umfang: 'ganz' },
  { kanton: 'LU', umfang: 'ganz' },
  { kanton: 'NE', umfang: 'teilweise', hinweis: '2–5-Zimmer-Wohnungen in bestimmten Gemeinden' },
  { kanton: 'VD', umfang: 'teilweise', hinweis: 'bestimmte Bezirke' },
  { kanton: 'ZG', umfang: 'ganz' },
  { kanton: 'ZH', umfang: 'ganz' },
];

export const MV_OFFENE_VERIFIKATIONEN: string[] = [
  'Formularpflicht-Kantone (Art. 270 Abs. 2 OR) sind dynamisch (jährlich per 1. November); Stand BWO-Verzeichnis 4.2.2026. Kanton Bern: Quellendiskrepanz — gegen die kantonale Primärquelle prüfen.',
  'Referenzzinssatz 1.25 % (Stand 1.6.2026) wird quartalsweise publiziert — vor Verwendung auf referenzzinssatz.admin.ch prüfen.',
  'MWST-Normalsatz 8.1 % (seit 1.1.2024) — bei Satzänderung Parameter nachführen.',
  'Geschäftsraum: Umsatzmiete und Konkurrenzschutz sind gesetzlich nicht spezifisch geregelt; Klauselpraxis vor Verwendung anwaltlich prüfen.',
];

// Übliche Nebenkosten-Positionen (müssen EINZELN im Vertrag stehen —
// Auflistung nur in AGB genügt nicht, BGer 4C.250/2006).
export const MV_NEBENKOSTEN_WOHNEN = [
  'Heizung', 'Warmwasser', 'Wasser/Abwasser', 'Kehrichtgrundgebühr',
  'Hauswartung', 'Treppenhausreinigung', 'Allgemeinstrom', 'Lift (Betrieb/Service)',
  'Gartenunterhalt', 'TV-/Internet-Grundgebühr',
] as const;
export const MV_NEBENKOSTEN_GESCHAEFT = [
  ...MV_NEBENKOSTEN_WOHNEN,
  'Klima-/Lüftungsanlagen (Betrieb/Service)', 'Brandschutzanlagen', 'Bewachung/Sicherheit',
  'Verwaltungshonorar',
] as const;

// ── Eingaben ────────────────────────────────────────────────────────────────

export type MvObjektTyp = 'wohnung' | 'geschaeftsraum';
export type MvMietzinsModell = 'standard' | 'index' | 'staffel';

export type MvStaffel = { ab: string; erhoehungCHF: string };

export type MvAntworten = {
  objektTyp: MvObjektTyp;
  // Parteien
  vermieterName: string;
  vermieterAdresse: string;
  mieterName: string;
  mieterAdresse: string;
  zweiterMieterName?: string;        // → Solidarhaftungs-Klausel
  // Objekt
  objektAdresse: string;
  objektBeschrieb: string;           // z. B. «3.5-Zimmer-Wohnung im 2. OG»
  nebenraeume?: string;              // z. B. «Kellerabteil Nr. 7, Estrich»
  kanton?: string;                   // Formularpflicht-Prüfung
  mietzweck?: string;                // Geschäftsraum: Pflicht
  familienwohnung?: boolean;         // nur Wohnraum (Art. 266m/266n)
  // Beginn & Dauer
  beginn: string;                    // ISO
  befristet: boolean;
  befristetBis?: string;
  mindestdauerJahre?: number;        // feste Erstlaufzeit (für Index-/Staffelmiete)
  // Mietzins
  mietzinsNettoCHF: string;          // pro Monat
  mietzinsModell: MvMietzinsModell;
  staffeln?: MvStaffel[];            // bei 'staffel': jährliche Erhöhungen in CHF
  // Nebenkosten
  nebenkosten: 'keine' | 'akonto' | 'pauschale';
  nebenkostenCHF?: string;           // pro Monat
  nkPositionen: string[];
  // Kaution (Art. 257e)
  kautionCHF?: string;
  // Vertragsklauseln
  tierhaltung: 'zustimmung' | 'kleintiere' | 'erlaubt';
  versicherungspflicht: boolean;     // Privat-/Betriebshaftpflicht des Mieters
  hausordnung: boolean;              // als Vertragsbestandteil
  // Kündigung
  kuendigungsfristMonate?: number;   // Default 3 (Wohnung) / 6 (Geschäftsraum)
  // Geschäftsraum-Spezifika
  mwstOption?: boolean;              // Art. 22 MWSTG — nur Geschäftsraum
  konkurrenzschutz?: boolean;
  konkurrenzschutzText?: string;
  // Abschluss
  ort: string;
  datum: string;
};

export const MV_DEFAULTS: MvAntworten = {
  objektTyp: 'wohnung',
  vermieterName: '', vermieterAdresse: '',
  mieterName: '', mieterAdresse: '',
  objektAdresse: '', objektBeschrieb: '',
  beginn: '', befristet: false,
  mietzinsNettoCHF: '', mietzinsModell: 'standard',
  nebenkosten: 'akonto', nkPositionen: [],
  tierhaltung: 'kleintiere',
  versicherungspflicht: true,
  hausordnung: true,
  ort: '', datum: '',
};

// ── Helfer ──────────────────────────────────────────────────────────────────

export function fmtCHF(roh: string): string {
  const n = Number(String(roh).replace(/['\s]/g, '').replace(',', '.'));
  if (!Number.isFinite(n)) return roh;
  const [ganz, dez] = n.toFixed(2).split('.');
  return ganz.replace(/\B(?=(\d{3})+(?!\d))/g, "'") + '.' + dez;
}

const fmtDatum = (iso?: string) => (iso?.includes('-') ? iso.split('-').reverse().join('.') : iso || '________');

const zahl = (roh?: string): number | null => {
  const n = Number(String(roh ?? '').replace(/['\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) && String(roh ?? '').trim() !== '' ? n : null;
};

export const mvGesetzlicheFrist = (t: MvObjektTyp) => (t === 'geschaeftsraum' ? 6 : 3);

// ── Gates (deterministische Validierung nach der Gutachtens-Matrix) ─────────

export type MvGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeMvGates(a: MvAntworten): MvGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];
  const wohnung = a.objektTyp === 'wohnung';

  // G1 — Kaution: Wohnraum max. drei Monatszinse (Art. 257e Abs. 2 OR,
  // absolut zwingend). Geschäftsraum: keine Obergrenze, aber Augenmass.
  const netto = zahl(a.mietzinsNettoCHF);
  const kaution = zahl(a.kautionCHF);
  if (kaution !== null && netto !== null) {
    if (wohnung && kaution > 3 * netto) {
      blocker.push(`Die Kaution für Wohnräume darf drei Monatszinse nicht übersteigen (Art. 257e Abs. 2 OR) — höchstens CHF ${fmtCHF(String(3 * netto))}.`);
    }
    if (!wohnung && kaution > 6 * netto) {
      warnungen.push('Geschäftsraum: Die Kaution unterliegt keiner gesetzlichen Obergrenze, sollte aber in einem angemessenen Verhältnis zum Risiko stehen — mehr als sechs Monatszinse sind begründungsbedürftig.');
    }
  }

  // G2 — Formularpflicht Anfangsmietzins (Art. 270 Abs. 2 OR; kantonal)
  if (wohnung && a.kanton) {
    const fp = MV_FORMULARPFLICHT.find((k) => k.kanton === a.kanton);
    if (fp) {
      warnungen.push(`Kanton ${fp.kanton}: ${fp.umfang === 'ganz' ? 'Formularpflicht' : 'TEILWEISE Formularpflicht'} für den Anfangsmietzins (Art. 270 Abs. 2 OR)${fp.hinweis ? ` — ${fp.hinweis}` : ''}. Der Anfangsmietzins ist dem Mieter mit dem amtlichen Formular mitzuteilen (Inhalt: Art. 19 VMWG; seit 1.10.2025 inkl. Referenzzins und Teuerung); ohne Formular ist die Mietzinsabrede NICHTIG. Stand BWO-Verzeichnis 4.2.2026 — dynamisch, jährlich prüfen.`);
    }
  }

  // G3 — Kündigungsfrist: Mindestfristen relativ zwingend (Art. 266c/266d OR).
  // Bei Befristung übersprungen — der Kündigungsbaustein erscheint dann gar
  // nicht im Dokument (Audit 5.6.2026: Blocker auf unsichtbarem Feld;
  // konsistent zum Arbeitsvertrag-G2).
  const fristMin = mvGesetzlicheFrist(a.objektTyp);
  const frist = a.kuendigungsfristMonate ?? fristMin;
  if (!a.befristet && frist < fristMin) {
    blocker.push(wohnung
      ? 'Die Kündigungsfrist für Wohnungen beträgt mindestens drei Monate (Art. 266c OR) — kürzere Abreden sind ungültig.'
      : 'Die Kündigungsfrist für Geschäftsräume beträgt mindestens sechs Monate (Art. 266d OR) — kürzere Abreden sind ungültig.');
  }

  // G4 — Indexmiete: nur gültig bei Vertragsdauer ≥ 5 Jahre und LIK
  // (Art. 269b OR — Wortlaut am Fedlex-Text verifiziert)
  if (a.mietzinsModell === 'index') {
    const dauer = a.befristet && a.befristetBis && a.beginn
      ? (new Date(a.befristetBis).getTime() - new Date(a.beginn).getTime()) / (365.25 * 24 * 3600 * 1000)
      : (a.mindestdauerJahre ?? 0);
    if (!(dauer >= 5)) {
      blocker.push('Indexmiete ist nur gültig, wenn der Vertrag für mindestens fünf Jahre abgeschlossen wird (Art. 269b OR) — feste Dauer bzw. Mindestlaufzeit von 5 Jahren erfassen.');
    }
    hinweise.push('Indexmiete: zulässig ist ausschliesslich die Bindung an den Landesindex der Konsumentenpreise; Mischklauseln (teils Index, teils Referenzzins) sind unzulässig. Während der Indexbindung sind andere Anpassungsgründe ausgeschlossen (Anfechtung über Art. 270c OR).');
  }

  // G5 — Staffelmiete: Vertrag ≥ 3 Jahre, höchstens eine Erhöhung pro Jahr,
  // Betrag in Franken (Art. 269c OR — Wortlaut am Fedlex-Text verifiziert)
  if (a.mietzinsModell === 'staffel') {
    const dauer = a.befristet && a.befristetBis && a.beginn
      ? (new Date(a.befristetBis).getTime() - new Date(a.beginn).getTime()) / (365.25 * 24 * 3600 * 1000)
      : (a.mindestdauerJahre ?? 0);
    if (!(dauer >= 3)) {
      blocker.push('Staffelmiete ist nur gültig, wenn der Vertrag für mindestens drei Jahre abgeschlossen wird (Art. 269c lit. a OR).');
    }
    const staffeln = (a.staffeln ?? []).filter((s) => s.ab && zahl(s.erhoehungCHF) !== null);
    if (staffeln.length === 0) {
      blocker.push('Staffelmiete: mindestens eine Staffel mit Datum und Erhöhungsbetrag in Franken erfassen (Art. 269c lit. c OR).');
    }
    // höchstens einmal jährlich: Abstände der Staffeln prüfen (deterministisch)
    const daten = staffeln.map((s) => new Date(s.ab).getTime()).sort((x, y) => x - y);
    const beginnMs = a.beginn ? new Date(a.beginn).getTime() : null;
    const JAHR = 365 * 24 * 3600 * 1000;
    if (beginnMs !== null && daten.length > 0 && daten[0] - beginnMs < JAHR) {
      blocker.push('Staffelmiete: Die erste Erhöhung darf frühestens ein Jahr nach Mietbeginn greifen (höchstens eine Erhöhung pro Jahr, Art. 269c lit. b OR).');
    }
    for (let i = 1; i < daten.length; i++) {
      if (daten[i] - daten[i - 1] < JAHR) {
        blocker.push('Staffelmiete: Zwischen den Erhöhungen muss mindestens ein Jahr liegen (Art. 269c lit. b OR).');
        break;
      }
    }
    hinweise.push('Während der Staffelung sind andere Mietzinsanpassungen ausgeschlossen (BGE 121 III 397 — zu verifizieren); die Anfechtung richtet sich nach Art. 270d OR.');
  }

  // G6 — Nebenkosten: nur geschuldet, wenn besonders vereinbart und EINZELN
  // aufgeführt (Art. 257a Abs. 2 OR; BGer 4C.250/2006 — zu verifizieren)
  if (a.nebenkosten !== 'keine' && a.nkPositionen.length === 0) {
    blocker.push('Nebenkosten sind nur geschuldet, wenn sie besonders vereinbart und die Positionen einzeln aufgeführt sind (Art. 257a Abs. 2 OR) — mindestens eine Position wählen oder «im Mietzins inbegriffen» wählen.');
  }
  if (a.nebenkosten === 'pauschale') {
    hinweise.push('Pauschale Nebenkosten: massgeblich sind die Durchschnittswerte dreier Jahre (Art. 4 Abs. 2 VMWG); eine Abrechnungspflicht besteht nicht.');
  }
  if (a.nebenkosten === 'akonto') {
    hinweise.push('Akonto-Nebenkosten: Der Vermieter rechnet mindestens einmal jährlich ab (Art. 4 Abs. 1 VMWG); der Mieter hat Anspruch auf Belegeinsicht (Art. 257b Abs. 2 OR).');
  }

  // G7 — MWST-Option nur bei Geschäftsraum (Art. 22 Abs. 2 lit. b MWSTG)
  if (wohnung && a.mwstOption) {
    blocker.push('Die MWST-Option ist ausgeschlossen, wenn das Objekt ausschliesslich für Wohnzwecke genutzt wird (Art. 22 Abs. 2 lit. b MWSTG).');
  }

  // G8 — Geschäftsraum: Mietzweck ist Pflicht (Nutzungsumfang/Optionsfähigkeit)
  if (!wohnung && !a.mietzweck?.trim()) {
    blocker.push('Geschäftsraum: Den Mietzweck genau umschreiben (massgeblich für Gebrauchsumfang, Untermiete und MWST-Option).');
  }

  // G9 — Konkurrenzschutz: nicht vertragsimmanent — nur mit Umschreibung
  if (a.konkurrenzschutz && !a.konkurrenzschutzText?.trim()) {
    blocker.push('Konkurrenzschutz ist nicht vertragsimmanent und muss ausdrücklich umschrieben werden (geschützte Branche/Nutzung angeben).');
  }

  // Familienwohnung (nur Hinweis — Schutz gilt von Gesetzes wegen)
  if (wohnung && a.familienwohnung) {
    hinweise.push('Familienwohnung: Kündigung durch die Mieterseite nur mit ausdrücklicher Zustimmung des Ehegatten/eingetragenen Partners (Art. 266m OR); der Vermieter muss Kündigungen und Zahlungsfristen beiden Ehegatten SEPARAT zustellen (Art. 266n OR), sonst Nichtigkeit (Art. 266o OR).');
  }

  // Standard-Disclosures
  hinweise.push(`Mietzins-Basis: hypothekarischer Referenzzinssatz ${MV_PARAMETER.referenzzinssatz.wert.toFixed(2)} % (Stand ${MV_PARAMETER.referenzzinssatz.stand}) — Basis künftiger Anpassungen (Art. 269a lit. b OR, Art. 13 VMWG); quartalsweise publiziert, vor Verwendung prüfen.`);
  if (wohnung) {
    hinweise.push('Der Mieter kann den Anfangsmietzins innert 30 Tagen nach Übernahme anfechten (Art. 270 OR); ein vertraglicher Ausschluss der Herabsetzung wäre nichtig (BGE 125 III 358 — zu verifizieren).');
  }
  hinweise.push('Streitigkeiten: obligatorische, kostenlose Schlichtung am Ort der gelegenen Sache (Art. 33/197/200 ZPO); auf diesen Gerichtsstand kann der Mieter nicht im Voraus verzichten (Art. 35 ZPO).');

  return { blocker, warnungen, hinweise };
}

// ── Schema (Bausteine) ──────────────────────────────────────────────────────

export const MV_SCHEMA: VorlageSchema = {
  id: 'mietvertrag',
  version: '1.0.0 (Rechtsstand OR Art. 253 ff./VMWG, Gutachten 5.6.2026)',
  titel: 'Mietvertrag',
  format: 'vertrag',
  disclaimer:
    'Entwurf — erstellt mit LexMetrik. Keine Rechtsberatung. Der Mietvertrag ist formfrei gültig; ' +
    'Index- und Staffelmiete bedürfen der Schriftform — die beidseitige Unterzeichnung erfüllt sie. ' +
    'Kantonale Formularpflichten für den Anfangsmietzins (Art. 270 Abs. 2 OR) sind zusätzlich zu ' +
    'beachten; massgeblich sind Gesetz (OR/VMWG) und der konkrete Einzelfall.',
  bausteine: [
    { id: 'M01_parteien', rolle: 'parteien',
      text: 'zwischen\n\n{{vermieterBlock}}\n(Vermieter)\n\nund\n\n{{mieterBlock}}\n(Mieter)',
      begruendung: 'Bezeichnung der Vertragsparteien — immer enthalten.',
      norm: 'Art. 253 OR' },
    { id: 'M02_objekt', ueberschrift: 'Mietobjekt',
      text: 'Vermietet wird: {{objektBeschrieb}}, {{objektAdresse}}.{{nebenraeumeSatz}}{{zweckSatz}} Der Zustand des Mietobjekts wird bei der Übergabe in einem gemeinsamen Protokoll festgehalten.',
      nummeriert: true,
      begruendung: 'Mietobjekt mit Beschrieb, Nebenräumen und Zweck — immer enthalten.',
      norm: 'Art. 253 OR' },
    { id: 'M03_beginn_unbefristet', ueberschrift: 'Mietbeginn und Dauer',
      text: 'Das Mietverhältnis beginnt am {{beginnFmt}} und läuft auf unbestimmte Zeit.{{mindestdauerSatz}}',
      includeIf: { feld: 'befristet', eq: false }, nummeriert: true,
      begruendung: 'Unbefristetes Mietverhältnis.',
      norm: 'Art. 255 OR' },
    { id: 'M03_beginn_befristet', ueberschrift: 'Mietbeginn und Dauer',
      text: 'Das Mietverhältnis beginnt am {{beginnFmt}} und endet am {{befristetBisFmt}}, ohne dass es einer Kündigung bedarf. Wird es danach stillschweigend fortgesetzt, gilt es als unbefristetes Mietverhältnis.',
      includeIf: { feld: 'befristet', eq: true }, nummeriert: true,
      begruendung: 'Befristetes Mietverhältnis (endet ohne Kündigung; stillschweigende Fortsetzung → unbefristet).',
      norm: 'Art. 255 OR' },
    { id: 'M04_mietzins', ueberschrift: 'Mietzins und Nebenkosten',
      text: 'Der monatliche Nettomietzins beträgt CHF {{nettoFmt}}.{{nkSatz}} Mietzins und Nebenkosten sind monatlich im Voraus, jeweils auf den Ersten des Monats, zu bezahlen. Der Mietzins basiert auf dem hypothekarischen Referenzzinssatz von {{refZins}} % (Stand {{refStand}}).',
      nummeriert: true,
      begruendung: 'Nettomietzins, Nebenkosten-Modus und Referenzzins-Basis (Grundlage künftiger Anpassungen) — immer enthalten.',
      norm: 'Art. 257 OR' },
    { id: 'M04b_nkliste',
      text: '– {{item.label}}',
      includeIf: { feld: 'nkListe', nichtLeer: true },
      wiederholeUeber: 'nkListe',
      begruendung: 'Nebenkosten-Positionen einzeln aufgeführt (Pauschalverweis genügt nicht).',
      norm: 'Art. 257a OR' },
    { id: 'M05_index', ueberschrift: 'Indexmiete',
      text: 'Der Nettomietzins ist an den Landesindex der Konsumentenpreise (LIK) gebunden (Stand bei Vertragsbeginn). Eine Anpassung kann jeweils auf einen Monatsanfang verlangt werden, höchstens im Umfang der Indexveränderung. Diese Vereinbarung setzt die feste Vertragsdauer von mindestens fünf Jahren gemäss Ziffer «Mietbeginn und Dauer» voraus.',
      includeIf: { feld: 'mietzinsModell', eq: 'index' }, nummeriert: true,
      begruendung: 'Indexmiete (Schriftform durch diesen Vertrag erfüllt; nur LIK).',
      norm: 'Art. 269b OR',
      hinweis: 'Nur gültig bei Vertragsdauer von mindestens fünf Jahren; Mischklauseln sind unzulässig.' },
    { id: 'M05_staffel', ueberschrift: 'Staffelmiete',
      text: 'Der Nettomietzins erhöht sich wie folgt (höchstens einmal jährlich, Beträge in Franken):',
      includeIf: { feld: 'mietzinsModell', eq: 'staffel' }, nummeriert: true,
      begruendung: 'Staffelmiete (Schriftform durch diesen Vertrag erfüllt).',
      norm: 'Art. 269c OR',
      hinweis: 'Nur gültig bei Vertragsdauer von mindestens drei Jahren; während der Staffelung keine anderen Anpassungen.' },
    { id: 'M05b_staffelliste',
      text: '– ab {{item.abFmt}}: Erhöhung um CHF {{item.erhoehungFmt}} pro Monat',
      includeIf: { feld: 'staffelListe', nichtLeer: true },
      wiederholeUeber: 'staffelListe',
      begruendung: 'Je Staffel eine Zeile (Datum + Frankenbetrag).',
      norm: 'Art. 269c OR' },
    { id: 'M06_kaution', ueberschrift: 'Sicherheitsleistung',
      text: 'Der Mieter leistet eine Sicherheit von CHF {{kautionFmt}}{{kautionMonateSatz}}. Der Vermieter hinterlegt die Sicherheit bei einer Bank auf einem Sparkonto oder Depot, das auf den Namen des Mieters lautet. Macht der Vermieter innert eines Jahres nach Beendigung des Mietverhältnisses keinen Anspruch gegenüber dem Mieter geltend, kann dieser die Rückerstattung verlangen.',
      includeIf: { feld: 'kautionZeigen', eq: true }, nummeriert: true,
      begruendung: 'Kaution mit zwingender Hinterlegung auf Mietername und Rückgaberegel.',
      norm: 'Art. 257e OR' },
    { id: 'M07_unterhalt', ueberschrift: 'Unterhalt und Mängel',
      text: 'Der Vermieter erhält das Mietobjekt in einem zum vorausgesetzten Gebrauch tauglichen Zustand. Der Mieter trägt den kleinen Unterhalt, d. h. Reinigungen und Ausbesserungen, die für den gewöhnlichen Gebrauch erforderlich sind und die er ohne besonderen Aufwand selbst vornehmen kann. Mängel sind dem Vermieter unverzüglich zu melden; die gesetzlichen Mängelrechte des Mieters bleiben vorbehalten.',
      nummeriert: true,
      begruendung: 'Erhaltungspflicht (relativ zwingend) und kleiner Unterhalt in den gesetzlichen Schranken — immer enthalten.',
      norm: 'Art. 256 OR' },
    { id: 'M08_gebrauch', ueberschrift: 'Gebrauch, Untermiete und bauliche Änderungen',
      text: 'Der Mieter gebraucht das Mietobjekt sorgfältig und nimmt Rücksicht auf Hausbewohner und Nachbarn. Untervermietung bedarf der Zustimmung des Vermieters; dieser kann sie nur aus den gesetzlichen Gründen verweigern. Erneuerungen und Änderungen am Mietobjekt durch den Mieter bedürfen der schriftlichen Zustimmung des Vermieters.{{tierhaltungSatz}}{{hausordnungSatz}}',
      nummeriert: true,
      begruendung: 'Sorgfaltspflicht, Untermiete (gesetzliche Verweigerungsgründe) und Art. 260a — immer enthalten.',
      norm: 'Art. 262 OR' },
    { id: 'M09_versicherung', ueberschrift: 'Versicherung',
      text: '{{versicherungText}}',
      includeIf: { feld: 'versicherungspflicht', eq: true }, nummeriert: true,
      begruendung: 'Haftpflichtversicherung des Mieters (übliche Klausel).',
      norm: 'Art. 257f OR' },
    { id: 'M10_mwst', ueberschrift: 'Mehrwertsteuer',
      text: 'Der Vermieter optiert für die Versteuerung der Mietzinseinnahmen (Art. 22 MWSTG). Der Mieter schuldet zusätzlich zum Mietzins und zu den Nebenkosten die gesetzliche Mehrwertsteuer zum jeweils geltenden Satz (zurzeit {{mwstSatz}} %); Satzänderungen berechtigen zur entsprechenden Anpassung.',
      includeIf: { feld: 'mwstZeigen', eq: true }, nummeriert: true,
      begruendung: 'MWST-Option (nur Geschäftsraum; bei reiner Wohnnutzung ausgeschlossen).',
      norm: 'Art. 22 MWSTG' },
    { id: 'M11_konkurrenzschutz', ueberschrift: 'Konkurrenzschutz',
      text: 'Der Vermieter verpflichtet sich, in der gleichen Liegenschaft keine Räume an direkte Konkurrenten des Mieters im folgenden Bereich zu vermieten: {{konkurrenzschutzText}}.',
      includeIf: { feld: 'konkurrenzschutzZeigen', eq: true }, nummeriert: true,
      begruendung: 'Konkurrenzschutz ist nicht vertragsimmanent — ausdrücklich vereinbart und umschrieben.',
      norm: 'Art. 253 OR',
      hinweis: 'Gesetzlich nicht spezifisch geregelt; Reichweite vor Verwendung anwaltlich prüfen.' },
    { id: 'M12_kuendigung', ueberschrift: 'Kündigung',
      text: '{{kuendigungText}} Die Kündigung bedarf der Schriftform; der Vermieter kündigt mit dem vom Kanton genehmigten amtlichen Formular, sonst ist die Kündigung nichtig.{{familienwohnungSatz}} Vorbehalten bleiben die ausserordentlichen Kündigungsgründe des Gesetzes.',
      includeIf: { feld: 'befristet', eq: false }, nummeriert: true,
      begruendung: 'Kündigungsfristen/-termine und zwingende Formvorschriften (Art. 266l–266o OR).',
      norm: 'Art. 266l OR' },
    { id: 'M13_rueckgabe', ueberschrift: 'Rückgabe',
      text: 'Bei Beendigung des Mietverhältnisses gibt der Mieter das Mietobjekt in dem Zustand zurück, der sich aus vertragsgemässem Gebrauch ergibt. Über die Rückgabe wird ein gemeinsames Protokoll erstellt; der Vermieter prüft den Zustand sofort und meldet Mängel, für die der Mieter einzustehen hat, umgehend.',
      nummeriert: true,
      begruendung: 'Rückgabe und sofortige Prüf-/Rügeobliegenheit des Vermieters — immer enthalten.',
      norm: 'Art. 267 OR' },
    { id: 'M14_schluss', ueberschrift: 'Schlussbestimmungen',
      text: 'Änderungen und Ergänzungen dieses Vertrags bedürfen der Schriftform, soweit das Gesetz nichts anderes zulässt. Streitigkeiten aus diesem Vertrag werden zunächst der Schlichtungsbehörde am Ort des Mietobjekts unterbreitet. Im Übrigen gelten die Bestimmungen des Obligationenrechts (Art. 253 ff. OR) und der VMWG.',
      nummeriert: true,
      begruendung: 'Schriftformvorbehalt, Schlichtung am Ort der Sache, Gesetzesverweis — immer enthalten.',
      norm: 'Art. 274 OR' },
    { id: 'M15_unterschriften', rolle: 'unterschrift',
      text: '{{ort}}, {{datumFmt}}\n\n\nDer Vermieter:\n\n___________________________\n{{vermieterName}}\n\n\nDer Mieter / Die Mieter:\n\n___________________________\n{{mieterUnterschrift}}{{zweiteUnterschriftSatz}}',
      begruendung: 'Ort, Datum und Unterschriften — erfüllt die Schriftform der formbedürftigen Klauseln.',
      norm: 'Art. 255 OR' },
  ],
};

// ── Zusammenstellen ─────────────────────────────────────────────────────────

export function mvZusammenstellen(a: MvAntworten) {
  const wohnung = a.objektTyp === 'wohnung';
  const netto = zahl(a.mietzinsNettoCHF);
  const kaution = zahl(a.kautionCHF);
  const fristMin = mvGesetzlicheFrist(a.objektTyp);
  const frist = a.kuendigungsfristMonate ?? fristMin;

  const nkSatz = a.nebenkosten === 'keine'
    ? ' Sämtliche Nebenkosten sind im Mietzins inbegriffen.'
    : a.nebenkosten === 'akonto'
      ? ` Zusätzlich leistet der Mieter monatliche Akontozahlungen von CHF ${a.nebenkostenCHF ? fmtCHF(a.nebenkostenCHF) : '________'} an die folgenden Nebenkosten (jährliche Abrechnung):`
      : ` Zusätzlich bezahlt der Mieter eine monatliche Nebenkosten-Pauschale von CHF ${a.nebenkostenCHF ? fmtCHF(a.nebenkostenCHF) : '________'} für die folgenden Positionen:`;

  const tierhaltungSatz = a.tierhaltung === 'erlaubt'
    ? ' Die Tierhaltung ist gestattet.'
    : a.tierhaltung === 'kleintiere'
      ? ' Übliche Kleintiere dürfen frei gehalten werden; übrige Haustiere bedürfen der Zustimmung des Vermieters.'
      : ' Die Haltung von Haustieren bedarf der vorgängigen Zustimmung des Vermieters.';

  const kuendigungText = `Das Mietverhältnis kann von beiden Parteien mit einer Frist von ${frist} Monaten auf einen ortsüblichen Termin, mangels Ortsüblichkeit auf das Ende einer dreimonatigen Mietdauer, gekündigt werden${frist > fristMin ? ' (vertraglich verlängerte Frist)' : ''}.`;

  const staffelListe = (a.staffeln ?? [])
    .filter((s) => s.ab && zahl(s.erhoehungCHF) !== null)
    .map((s) => ({ abFmt: fmtDatum(s.ab), erhoehungFmt: fmtCHF(s.erhoehungCHF) }));

  const antworten: Antworten = {
    ...a,
    vermieterBlock: [a.vermieterName, a.vermieterAdresse].filter(Boolean).join('\n'),
    mieterBlock: [
      [a.mieterName, a.zweiterMieterName].filter(Boolean).join(' und '),
      a.mieterAdresse,
      ...(a.zweiterMieterName ? ['(beide haften solidarisch für sämtliche Verpflichtungen aus diesem Vertrag)'] : []),
    ].filter(Boolean).join('\n'),
    objektBeschrieb: a.objektBeschrieb || '________',
    nebenraeumeSatz: a.nebenraeume?.trim() ? ` Mitvermietet sind: ${a.nebenraeume.trim()}.` : '',
    zweckSatz: wohnung
      ? ' Das Mietobjekt dient zu Wohnzwecken.'
      : ` Das Mietobjekt dient ausschliesslich zum folgenden Zweck: ${a.mietzweck?.trim() || '________'}; eine Zweckänderung bedarf der schriftlichen Zustimmung des Vermieters.`,
    beginnFmt: fmtDatum(a.beginn),
    befristetBisFmt: fmtDatum(a.befristetBis),
    mindestdauerSatz: !a.befristet && (a.mindestdauerJahre ?? 0) > 0
      ? ` Es ist beidseitig erstmals nach Ablauf von ${a.mindestdauerJahre} Jahren kündbar (feste Erstlaufzeit).`
      : '',
    nettoFmt: a.mietzinsNettoCHF ? fmtCHF(a.mietzinsNettoCHF) : '________',
    nkSatz,
    nkListe: a.nebenkosten === 'keine' ? [] : a.nkPositionen.map((label) => ({ label })),
    refZins: MV_PARAMETER.referenzzinssatz.wert.toFixed(2),
    refStand: MV_PARAMETER.referenzzinssatz.stand,
    staffelListe,
    kautionZeigen: kaution !== null && kaution > 0,
    kautionFmt: a.kautionCHF ? fmtCHF(a.kautionCHF) : '________',
    kautionMonateSatz: kaution !== null && netto !== null && netto > 0
      ? ` (entspricht ${Math.round((kaution / netto) * 10) / 10} Monatszinsen${wohnung ? '; gesetzliches Maximum drei' : ''})`
      : '',
    tierhaltungSatz,
    hausordnungSatz: a.hausordnung ? ' Die Hausordnung bildet einen integrierenden Bestandteil dieses Vertrags.' : '',
    versicherungText: wohnung
      ? 'Der Mieter schliesst eine Privathaftpflichtversicherung ab, die Mieterschäden deckt, und hält sie während der Mietdauer aufrecht.'
      : 'Der Mieter schliesst eine Betriebshaftpflichtversicherung ab, die Mieterschäden deckt, und hält sie während der Mietdauer aufrecht.',
    mwstZeigen: !wohnung && !!a.mwstOption,
    mwstSatz: MV_PARAMETER.mwstSatz.wert.toFixed(1),
    konkurrenzschutzZeigen: !wohnung && !!a.konkurrenzschutz && !!a.konkurrenzschutzText?.trim(),
    konkurrenzschutzText: a.konkurrenzschutzText?.trim() ?? '',
    kuendigungText,
    familienwohnungSatz: wohnung && a.familienwohnung
      ? ' Das Mietobjekt dient als Familienwohnung; die besonderen Schutzbestimmungen (Art. 266m–266n OR) sind zu beachten.'
      : '',
    mieterUnterschrift: a.mieterName || '________',
    zweiteUnterschriftSatz: a.zweiterMieterName
      ? `\n\n\n___________________________\n${a.zweiterMieterName}`
      : '',
    datumFmt: fmtDatumLang(a.datum),
  };

  return assemble(MV_SCHEMA, antworten);
}
