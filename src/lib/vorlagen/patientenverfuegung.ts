import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';

// ─── Patientenverfügung (Art. 370–373 ZGB) — zweite Vorlage ────────────────
//
// Gemäss normverifizierter Implementierungs-Anweisung (bundesrechtlich
// abschliessend, in Kraft seit 1.1.2013). Form: NUR schriftlich, datiert,
// eigenhändig unterschrieben (Art. 371 Abs. 1 ZGB) — PC-Erstellung zulässig;
// Datum und Unterschrift werden im Ausdruck VON HAND geleistet (Form-Gate).
// Kein Mindestalter (Urteilsfähigkeit genügt, Art. 16 ZGB); inhaltliche
// Module an FMH-/SAMW-Struktur angelehnt (Kurzversion: ein Behandlungsziel).
//
// HART (RULE R6): Anordnungen aktiver Sterbehilfe / Suizidhilfe sind in einer
// Patientenverfügung nicht zulässig (Art. 114/115 StGB) und blockieren die Ausgabe.

export type PvEntscheid = 'zustimmen' | 'ablehnen' | 'nur_befristet' | 'keine_angabe';
export type PvZiel = 'maximal' | 'befristet_reevaluation' | 'palliativ' | 'keine_angabe';

export const PV_MASSNAHMEN = [
  { id: 'cpr', label: 'Wiederbelebung (Reanimation)' },
  { id: 'beatmung', label: 'Künstliche Beatmung' },
  { id: 'ernaehrungTemporaer', label: 'Künstliche Ernährung, vorübergehend (therapeutischer Versuch)' },
  { id: 'ernaehrungDauerhaft', label: 'Künstliche Ernährung, dauerhaft (z. B. PEG-Sonde)' },
  { id: 'fluessigkeit', label: 'Künstliche Flüssigkeitszufuhr' },
  { id: 'dialyse', label: 'Nierenersatzverfahren (Dialyse)' },
  { id: 'antibiotika', label: 'Antibiotika bei schweren Infektionen' },
  { id: 'spitaleinweisung', label: 'Einweisung ins Spital / auf die Intensivstation' },
] as const;
export type PvMassnahmeId = typeof PV_MASSNAHMEN[number]['id'];

export const PV_SITUATIONEN = [
  { id: 'notfallAkut', label: 'Akuter Notfall (z. B. Herzinfarkt, Schlaganfall, Unfall)' },
  { id: 'dauerndeUrteilsunfaehigkeit', label: 'Voraussichtlich dauernde Urteilsunfähigkeit' },
  { id: 'terminal', label: 'Unheilbare Krankheit im Endstadium' },
  { id: 'komaWachkoma', label: 'Koma / Wachkoma ohne Aussicht auf Besserung' },
  { id: 'schwereDemenz', label: 'Schwere Demenz' },
] as const;
export type PvSituationId = typeof PV_SITUATIONEN[number]['id'];

export type PvAntworten = {
  vorname: string;
  name: string;
  geburtsdatum: string;     // ISO
  wohnort: string;
  versichertenNr?: string;  // optional (AHV-/Versichertennummer)
  // Werteerklärung (Freitext, optional)
  einstellungLeben?: string;
  aengste?: string;
  religioesSpirituell?: string;
  // Anwendungssituationen + Ziel + Massnahmen
  situationen: PvSituationId[];
  psychischeStoerungKontext?: boolean; // R7-Hinweis (Art. 380/433 Abs. 3 ZGB)
  ziel: PvZiel;
  massnahmen: Record<PvMassnahmeId, PvEntscheid>;
  // Vertretung (Art. 370 Abs. 2/3)
  vertretungName?: string;
  vertretungKontakt?: string;
  vertretungWeisungen?: string;
  ersatzName?: string;
  // Weitere Wünsche
  sterbeortBegleitung?: string;
  organspende: 'ja' | 'nein' | 'keine_angabe';
  organspendeVorbereitend?: boolean;
  // Abschluss
  ersetztFruehere: boolean; // Default true
  ort?: string;
};

export const PV_DEFAULT_MASSNAHMEN: Record<PvMassnahmeId, PvEntscheid> = {
  cpr: 'keine_angabe', beatmung: 'keine_angabe', ernaehrungTemporaer: 'keine_angabe',
  ernaehrungDauerhaft: 'keine_angabe', fluessigkeit: 'keine_angabe', dialyse: 'keine_angabe',
  antibiotika: 'keine_angabe', spitaleinweisung: 'keine_angabe',
};

export const PV_DEFAULTS: PvAntworten = {
  vorname: '', name: '', geburtsdatum: '', wohnort: '',
  situationen: [],
  ziel: 'keine_angabe',
  massnahmen: { ...PV_DEFAULT_MASSNAHMEN },
  organspende: 'keine_angabe',
  ersetztFruehere: true,
};

// RULE R1: Zielwahl setzt deterministische Defaults für noch offene Massnahmen
// (nur 'keine_angabe' wird überschrieben — getroffene Entscheide bleiben).
export function zielDefaults(ziel: PvZiel, m: Record<PvMassnahmeId, PvEntscheid>): Record<PvMassnahmeId, PvEntscheid> {
  if (ziel !== 'palliativ') return m;
  const neu = { ...m };
  (['cpr', 'beatmung', 'dialyse'] as const).forEach((k) => {
    if (neu[k] === 'keine_angabe') neu[k] = 'ablehnen';
  });
  return neu;
}

// ── Gates / Konsistenzregeln (R2, R6, R7 + Hinweise R3/R4/R8) ───────────────

export type PvGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

// RULE R6 — harte Sperre: deterministische Schlüsselbegriffe (Art. 114/115 StGB)
const R6_BEGRIFFE = [
  'aktive sterbehilfe', 'tötung auf verlangen', 'suizidhilfe',
  'beihilfe zum suizid', 'assistierter suizid', 'sterbehilfeorganisation',
];

export function pruefePvGates(a: PvAntworten): PvGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  // R6: Sterbehilfe-Block über alle Freitexte
  const freitexte = [a.einstellungLeben, a.aengste, a.religioesSpirituell, a.vertretungWeisungen, a.sterbeortBegleitung]
    .filter(Boolean).join(' ').toLowerCase();
  const treffer = R6_BEGRIFFE.filter((b) => freitexte.includes(b));
  if (treffer.length > 0) {
    blocker.push(
      `Ihre Eingabe enthält «${treffer[0]}»: Aktive Sterbehilfe (Tötung auf Verlangen, Art. 114 StGB) und Suizidhilfe (Art. 115 StGB) können in einer Patientenverfügung NICHT angeordnet werden. Zulässig sind Behandlungsverzicht/-abbruch und Leidenslinderung, auch wenn diese das Sterben beschleunigen kann. Bitte formulieren Sie die Passage um.`,
    );
  }

  // R2: Widerspruch Therapieziel ↔ Massnahme (harte Warnung, kein stilles Auflösen)
  if (a.ziel === 'maximal' && (a.massnahmen.cpr === 'ablehnen' || a.massnahmen.beatmung === 'ablehnen')) {
    warnungen.push(
      'Widerspruch zwischen Therapieziel und Massnahme: Sie wünschen maximale Lebenserhaltung, lehnen aber Wiederbelebung bzw. Beatmung ab. Bitte klären — widersprüchliche Verfügungen erschweren der Ärzteschaft die Umsetzung (Designziel der FMH-Vorlagen 2022).',
    );
  }

  // R7: psychische Störung im Klinik-Kontext
  if (a.psychischeStoerungKontext) {
    hinweise.push(
      'Bei der Behandlung einer psychischen Störung in einer psychiatrischen Klinik (fürsorgerische Unterbringung) ist die Patientenverfügung nur «zu berücksichtigen», nicht zwingend verbindlich (Art. 380 i.V.m. Art. 433 Abs. 3 ZGB).',
    );
  }

  // R3/R4: Vertretung
  if (!a.vertretungName?.trim()) {
    hinweise.push('Ohne bezeichnete Vertretungsperson greift die gesetzliche Kaskade (Art. 378 ZGB: bezeichnete Person → Beistand → Ehegatte/Partner im gemeinsamen Haushalt → Haushaltsperson → Nachkommen → Eltern → Geschwister).');
  } else if (!a.ersatzName?.trim()) {
    hinweise.push('Eine Ersatzperson ist empfohlen, falls die bezeichnete Person ungeeignet ist, ablehnt oder kündigt (Art. 370 Abs. 3 ZGB).');
  }

  // R8: Organspende
  if (a.organspende === 'ja') {
    hinweise.push('Organspende: Halten Sie den Entscheid zusätzlich auf einem Organspende-Ausweis bzw. künftig im Bundesregister fest und informieren Sie Ihre Angehörigen (Systemwechsel zur Widerspruchslösung voraussichtlich Q3 2027, terminlich offen).');
  }

  return { blocker, warnungen, hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

const ENTSCHEID_TEXT: Record<Exclude<PvEntscheid, 'keine_angabe'>, string> = {
  zustimmen: 'Ich stimme zu',
  ablehnen: 'Ich lehne ab',
  nur_befristet: 'Nur befristet, als therapeutischer Versuch mit Reevaluation',
};

const ZIEL_TEXT: Record<Exclude<PvZiel, 'keine_angabe'>, string> = {
  maximal:
    'Mein Behandlungsziel ist die maximale Lebenserhaltung: Ich wünsche alle medizinisch ' +
    'indizierten Massnahmen zur Erhaltung meines Lebens.',
  befristet_reevaluation:
    'Mein Behandlungsziel ist eine befristete Lebenserhaltung mit Reevaluation: Lebenserhaltende ' +
    'Massnahmen sollen begonnen, ihr Nutzen aber regelmässig überprüft werden; besteht keine ' +
    'begründete Aussicht auf Besserung, sollen sie eingestellt und das Ziel auf Leidenslinderung ' +
    'umgestellt werden.',
  palliativ:
    'Mein Behandlungsziel ist die Leidenslinderung (Palliation): Auf lebensverlängernde Massnahmen ' +
    'soll verzichtet werden; im Vordergrund stehen die Linderung von Schmerzen und belastenden ' +
    'Symptomen sowie meine Lebensqualität.',
};

export const PV_SCHEMA: VorlageSchema = {
  id: 'patientenverfuegung',
  version: '1.0.0 (Rechtsstand Art. 370–373 ZGB, in Kraft seit 1.1.2013)',
  titel: 'Patientenverfügung',
  disclaimer:
    'Entwurf — erstellt mit LexMetrik. Keine Rechts- oder medizinische Beratung. Gültig wird die ' +
    'Patientenverfügung erst mit handschriftlichem Datum und eigenhändiger Unterschrift ' +
    '(Art. 371 Abs. 1 ZGB). Empfohlen: Kopien an Vertretungsperson und Hausarztpraxis; ' +
    'Erneuerung der Unterschrift etwa alle zwei Jahre (Empfehlung, keine Pflicht).',
  bausteine: [
    {
      id: 'P01_identifikation',
      text:
        'Ich, {{vorname}} {{name}}, geboren am {{geburtsdatum}}, wohnhaft {{wohnort}}' +
        '{{versichertenZeile}}, verfüge im Vollbesitz meiner Urteilsfähigkeit und nach ' +
        'reiflicher Überlegung für den Fall, dass ich urteilsunfähig werde, was folgt:',
      begruendung: 'Identifikation und Urteilsfähigkeits-Präambel — immer enthalten.',
      norm: 'Art. 370 Abs. 1 ZGB',
    },
    {
      id: 'P02_werte',
      ueberschrift: 'Meine Werte und Anliegen',
      text: '{{werteText}}',
      includeIf: { feld: 'werteText', nichtLeer: true },
      begruendung: 'Aufgenommen, weil eine Werteerklärung erfasst wurde (hilft bei der Auslegung).',
      norm: 'Art. 372 Abs. 2 ZGB',
    },
    {
      id: 'P03_situationen',
      ueberschrift: 'Anwendungssituationen',
      text: 'Diese Verfügung gilt insbesondere in folgenden Situationen meiner Urteilsunfähigkeit:',
      includeIf: { feld: 'situationenListe', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil Anwendungssituationen gewählt wurden.',
      norm: 'Art. 370 Abs. 1 ZGB',
    },
    {
      id: 'P03b_situationenliste',
      text: '– {{item.label}}',
      includeIf: { feld: 'situationenListe', nichtLeer: true },
      wiederholeUeber: 'situationenListe',
      begruendung: 'Je gewählte Situation eine Zeile.',
      norm: 'Art. 370 Abs. 1 ZGB',
    },
    {
      id: 'P04_ziel',
      ueberschrift: 'Behandlungsziel',
      text: '{{zielText}}',
      includeIf: { feld: 'zielText', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil ein Behandlungsziel gewählt wurde.',
      norm: 'Art. 370 Abs. 1 ZGB',
    },
    {
      id: 'P05_massnahmen',
      ueberschrift: 'Konkrete medizinische Massnahmen',
      text: 'Zu den folgenden Massnahmen verfüge ich:',
      includeIf: { feld: 'massnahmenListe', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil zu mindestens einer Massnahme ein Entscheid getroffen wurde.',
      norm: 'Art. 370 Abs. 1 ZGB',
    },
    {
      id: 'P05b_massnahmenliste',
      text: '– {{item.label}}: {{item.entscheid}}.',
      includeIf: { feld: 'massnahmenListe', nichtLeer: true },
      wiederholeUeber: 'massnahmenListe',
      begruendung: 'Je entschiedene Massnahme eine Zeile (zustimmen / ablehnen / nur befristet).',
      norm: 'Art. 370 Abs. 1 ZGB',
    },
    {
      id: 'P06_palliativ',
      text:
        'Schmerz- und Symptombehandlung: Ich wünsche in jedem Fall eine fachgerechte Linderung von ' +
        'Schmerzen, Atemnot und Angst — auch wenn dadurch als nicht beabsichtigte Nebenwirkung mein ' +
        'Sterben beschleunigt werden könnte. Reichen andere Mittel nicht aus, ist eine palliative ' +
        'Sedierung zulässig.',
      nummeriert: true,
      begruendung: 'Immer enthalten: Leidenslinderung inkl. zulässiger indirekter Sterbehilfe; Sedierung gekoppelt.',
      norm: 'Art. 370 Abs. 1 ZGB',
      hinweis: 'Indirekte Sterbehilfe (Leidenslinderung mit möglicher Lebensverkürzung) ist zulässig — im Unterschied zu aktiver Sterbehilfe und Suizidhilfe (Art. 114/115 StGB), die nicht anordenbar sind.',
    },
    {
      id: 'P07_vertretung',
      ueberschrift: 'Vertretungsperson',
      text:
        'Als vertretungsberechtigte Person bezeichne ich: {{vertretungName}}{{vertretungKontaktZeile}}. ' +
        'Sie soll mit der behandelnden Ärztin oder dem behandelnden Arzt die medizinischen Massnahmen ' +
        'besprechen und in meinem Namen entscheiden, soweit diese Verfügung keine Antwort gibt; ' +
        'massgebend sind dabei mein mutmasslicher Wille und meine Interessen.',
      includeIf: { feld: 'vertretungName', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil eine Vertretungsperson bezeichnet wurde.',
      norm: 'Art. 370 Abs. 2 ZGB',
    },
    {
      id: 'P07b_weisungen',
      text: 'Weisungen an meine Vertretungsperson: {{vertretungWeisungen}}',
      includeIf: { feld: 'vertretungWeisungen', nichtLeer: true },
      begruendung: 'Aufgenommen, weil Weisungen an die Vertretungsperson erfasst wurden.',
      norm: 'Art. 370 Abs. 2 ZGB',
    },
    {
      id: 'P07c_ersatz',
      text:
        'Kann oder will die bezeichnete Person die Vertretung nicht übernehmen oder ist sie ' +
        'ungeeignet, bezeichne ich als Ersatzperson: {{ersatzName}}.',
      includeIf: { feld: 'ersatzName', nichtLeer: true },
      begruendung: 'Aufgenommen, weil eine Ersatzperson bezeichnet wurde (Ersatzverfügung).',
      norm: 'Art. 370 Abs. 3 ZGB',
    },
    {
      id: 'P08_schweigepflicht',
      text:
        'Ich entbinde die mich behandelnden Ärztinnen, Ärzte und Fachpersonen gegenüber meiner ' +
        'Vertretungsperson und der Ersatzperson von der beruflichen Schweigepflicht.',
      includeIf: { feld: 'vertretungName', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Automatisch aufgenommen, weil eine Vertretungsperson bezeichnet wurde (RULE R5).',
      norm: 'Art. 370 Abs. 2 ZGB',
    },
    {
      id: 'P09_sterbeort',
      ueberschrift: 'Sterbeort und Begleitung',
      text: '{{sterbeortBegleitung}}',
      includeIf: { feld: 'sterbeortBegleitung', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil Wünsche zu Sterbeort/Begleitung erfasst wurden.',
      norm: 'Art. 370 Abs. 1 ZGB',
    },
    {
      id: 'P10_organspende',
      ueberschrift: 'Organspende',
      text: '{{organspendeText}}',
      includeIf: { feld: 'organspendeText', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil eine Haltung zur Organspende festgelegt wurde.',
      norm: 'Art. 370 Abs. 1 ZGB',
      hinweis: 'Den Organspende-Entscheid zusätzlich auf Ausweis/Register festhalten; Wechsel zur Widerspruchslösung voraussichtlich Q3 2027 (terminlich offen).',
    },
    {
      id: 'P11_ersetzt',
      text: 'Diese Patientenverfügung ersetzt alle früheren Patientenverfügungen.',
      includeIf: { feld: 'ersetztFruehere', eq: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil «frühere Verfügungen ersetzen» gewählt wurde (Widerruf sinngemäss).',
      norm: 'Art. 371 Abs. 3 ZGB',
    },
    {
      id: 'P12_schluss', rolle: 'unterschrift',
      text:
        '{{ortZeile}}Datum (von Hand einzusetzen): ____________________\n\n\n' +
        '_________________________________\n' +
        '(eigenhändige Unterschrift: {{vorname}} {{name}})',
      begruendung: 'Schlussformel: Datum und Unterschrift werden HANDSCHRIFTLICH geleistet — immer enthalten.',
      norm: 'Art. 371 Abs. 1 ZGB',
    },
  ],
};

// ── Antworten aufbereiten (abgeleitete Felder) und zusammenstellen ──────────

export function pvZusammenstellen(a: PvAntworten) {
  const werteTeile = [
    a.einstellungLeben?.trim() && `Einstellung zu Leben und Sterben: ${a.einstellungLeben.trim()}`,
    a.aengste?.trim() && `Was ich besonders fürchte: ${a.aengste.trim()}`,
    a.religioesSpirituell?.trim() && `Religiöse/spirituelle Haltung: ${a.religioesSpirituell.trim()}`,
  ].filter(Boolean) as string[];

  const massnahmenListe = PV_MASSNAHMEN
    .filter((m) => a.massnahmen[m.id] !== 'keine_angabe')
    .map((m) => ({ label: m.label, entscheid: ENTSCHEID_TEXT[a.massnahmen[m.id] as Exclude<PvEntscheid, 'keine_angabe'>] }));

  const organspendeText =
    a.organspende === 'ja'
      ? `Ich stimme der Entnahme meiner Organe, Gewebe und Zellen zu Transplantationszwecken zu${
          a.organspendeVorbereitend ? ', einschliesslich der dafür erforderlichen vorbereitenden medizinischen Massnahmen' : ''}.`
      : a.organspende === 'nein'
        ? 'Ich lehne die Entnahme von Organen, Geweben und Zellen zu Transplantationszwecken ab.'
        : '';

  const antworten: Antworten = {
    ...a,
    versichertenZeile: a.versichertenNr?.trim() ? `, Versichertennummer ${a.versichertenNr.trim()}` : '',
    werteText: werteTeile.join('\n'),
    situationenListe: PV_SITUATIONEN.filter((s) => a.situationen.includes(s.id)).map((s) => ({ label: s.label })),
    zielText: a.ziel === 'keine_angabe' ? '' : ZIEL_TEXT[a.ziel],
    massnahmenListe,
    vertretungKontaktZeile: a.vertretungKontakt?.trim() ? ` (${a.vertretungKontakt.trim()})` : '',
    organspendeText,
    ortZeile: a.ort?.trim() ? `Ort: ${a.ort.trim()}\n\n` : '',
  };
  return assemble(PV_SCHEMA, antworten);
}
