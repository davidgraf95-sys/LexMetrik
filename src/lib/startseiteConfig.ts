// ─── Startseiten-Konfiguration: Zwei-Säulen-Struktur ──────────────────────
//
// Single source of truth für die Startseiten-Karten (Säulen I–III).
// Die Detailseiten und die /rechner-Übersicht nutzen weiterhin
// src/lib/calculators.ts; hier liegt ausschliesslich die redaktionelle
// Gliederung der Startseite (Fristen / Berechnungen & Ansprüche / Werkzeuge).
//
// Normentreue: `label` der NormRefs ist zeichengenau der bisherige Tag-Text.
// Alle Fedlex-Anker sind gegen den konsolidierten Volltext verifiziert
// (siehe Kommentar bei `fedlex()` unten); nicht verifizierbare Verweise
// erhielten stattdessen die Gesetzes-Seite und verified: false.

export type Status = 'geprüft' | 'geplant'; // geplant wird als «In Vorbereitung» angezeigt
export type Art = 'frist' | 'betrag' | 'zuordnung' | 'werkzeug'; // Output-Typ → Sektion

export interface NormRef {
  label: string;      // Anzeigetext, unverändert (z. B. "Art. 335c OR")
  url: string;        // verifizierter Fedlex-Artikel-Link ODER Gesetz-Seite
  verified: boolean;  // true nur bei geprüftem Artikel-Anker
}

export interface CalculatorCard {
  id: string;
  art: Art;               // Output-Typ → bestimmt die Sektion
  rechtsgebiet: string;   // Filterwert (z. B. «Miete», «Zivilprozess (ZPO)»)
  category: string;     // Mikro-Label, spezifischste Ebene (z. B. "ZIVILPROZESS · ZPO")
  title: string;
  description: string;
  status: Status;
  norms: NormRef[];     // Pills nur bei 'geprüft' anzeigen
  href?: string;        // bestehende Route, nur bei 'geprüft'
  note?: string;        // z. B. "bald verfügbar" / "in Vorbereitung"
  related?: string[];   // IDs verwandter Rechner → "Verwandte Rechner"
  keywords?: string[];  // Vorbereitung für spätere Suche
  icon?: string;        // bestehende Icon-Komponente (Kartenanatomie unverändert)
}

export interface Subgroup {            // Rechtsgebiet / Prozessart
  id: string; title: string; descriptor?: string;
  clusters?: { label: string; items: CalculatorCard[] }[]; // nur Zivilprozess
  items?: CalculatorCard[];
}

export interface DoctrinalClass {      // "Verfahrensrecht" | "Materielles Recht"
  id: string; title: string; lede?: string; subgroups: Subgroup[];
}

export interface Pillar {              // I | II | III
  id: 'fristen' | 'berechnungen' | 'werkzeuge';
  numeral: 'I' | 'II' | 'III';
  eyebrow: string; title: string; lede: string;
  classes?: DoctrinalClass[];   // Säule I (zwei Klassen)
  subgroups?: Subgroup[];       // Säulen II/III (direkt Rechtsgebiete)
}

// ─── Hilfen ───────────────────────────────────────────────────────────────
//
// Fedlex-Verifikation (Phase 3): Jeder Anker wurde gegen den konsolidierten
// Volltext (Filestore-HTML der Konsolidierung 20250101) geprüft – das Dokument
// enthält die entsprechende id="art_…". Buchstaben-Artikel nutzen auf Fedlex
// das Unterstrich-Format (art_324_a). Sammel-/Spannenangaben verlinken den
// Leitartikel («Art. 142–147 ZPO» → art_142; «Art. 56/63 SchKG» → art_56).
// SR-Nummern: OR = SR 220, ZPO = SR 272, SchKG = SR 281.1, ZGB = SR 210.

const ELI = {
  ZPO: 'eli/cc/2010/262',          // SR 272
  OR: 'eli/cc/27/317_321_377',     // SR 220
  SchKG: 'eli/cc/11/529_488_529',  // SR 281.1
  ZGB: 'eli/cc/24/233_245_233',    // SR 210
} as const;

const fedlex = (label: string, gesetz: keyof typeof ELI, anker: string): NormRef => ({
  label,
  url: `https://www.fedlex.admin.ch/${ELI[gesetz]}/de#${anker}`,
  verified: true, // Anker im konsolidierten Fedlex-HTML (20250101) nachgewiesen
});

// ─── Karten (bestehende Routen aus src/App.tsx, Tags zeichengenau) ────────

const KARTEN: Record<string, CalculatorCard> = {
  'zpo-fristen': {
    id: 'zpo-fristen',
    art: 'frist',
    rechtsgebiet: 'Zivilprozess (ZPO)',
    category: 'ZIVILPROZESS · ZPO',
    title: 'ZPO-Fristen',
    description: 'Verfahrens- und Rechtsmittelfristen mit Gerichtsferien und Stillstand.',
    status: 'geprüft',
    norms: [fedlex('Art. 142–147 ZPO', 'ZPO', 'art_142')],
    href: '/rechner/zpo-fristen',
    keywords: ['Frist', 'Gericht', 'Berufung', 'Beschwerde', 'Klage', 'Gerichtsferien', 'Stillstand', 'Zustellung'],
    icon: 'clock',
  },
  'schkg-fristen': {
    id: 'schkg-fristen',
    art: 'frist',
    rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    category: 'ZIVILPROZESS · SCHKG',
    title: 'Betreibungsfristen',
    description: 'Fristen im Betreibungs- und Konkursverfahren mit Betreibungsferien (Art. 63 SchKG) und ZPO-Stillstand für gerichtliche Klagen.',
    status: 'geprüft',
    norms: [fedlex('Art. 56/63 SchKG', 'SchKG', 'art_56'), fedlex('Art. 145 ZPO', 'ZPO', 'art_145')],
    href: '/rechner/schkg-fristen',
    keywords: ['Betreibung', 'Zahlungsbefehl', 'Rechtsvorschlag', 'Konkurs', 'Pfändung', 'Betreibungsferien'],
    related: ['verzugszins'],
    icon: 'clipboard',
  },
  'kuendigung-sperrfristen': {
    id: 'kuendigung-sperrfristen',
    art: 'frist',
    rechtsgebiet: 'Arbeit',
    category: 'ARBEITSRECHT · OR',
    title: 'Kündigungs- & Sperrfristen',
    description: 'Ordentliche Kündigungsfristen und Sperrfristen (Kündigung zur Unzeit) im Arbeitsverhältnis.',
    status: 'geprüft',
    norms: [fedlex('Art. 335c OR', 'OR', 'art_335_c'), fedlex('Art. 336c OR', 'OR', 'art_336_c')],
    href: '/rechner/kuendigung#kuendigung',
    keywords: ['gekündigt', 'Kündigung', 'Probezeit', 'Sperrfrist', 'Krankheit', 'Unfall', 'Schwangerschaft', 'Militär'],
    related: ['lohnfortzahlung'],
    icon: 'document',
  },
  lohnfortzahlung: {
    id: 'lohnfortzahlung',
    art: 'betrag',
    rechtsgebiet: 'Arbeit',
    category: 'ARBEITSRECHT · OR',
    title: 'Lohnfortzahlung (kant. Skala)',
    description: 'Lohnfortzahlung bei unverschuldeter Verhinderung nach kantonaler Skala (Basel/Bern/Zürich).',
    status: 'geprüft',
    norms: [fedlex('Art. 324a OR', 'OR', 'art_324_a')],
    href: '/rechner/kuendigung#lohnfortzahlung',
    keywords: ['krank', 'Lohnfortzahlung', 'Arztzeugnis', 'Arbeitsunfähigkeit', 'Taggeld', 'Skala'],
    related: ['kuendigung-sperrfristen'],
    icon: 'document',
  },
  verzugszins: {
    id: 'verzugszins',
    art: 'betrag',
    rechtsgebiet: 'Vertrag / OR',
    category: 'ZINSEN & VERZUG · OR',
    title: 'Verzugszins',
    description: 'Verzugszins bei Schuldnerverzug — Zeitraum, Satz und Betrag.',
    status: 'geprüft',
    norms: [fedlex('Art. 104 OR', 'OR', 'art_104')],
    href: '/rechner/verzugszins',
    keywords: ['Rechnung', 'Verzug', 'Zins', 'Mahnung', 'offene Forderung', '5 Prozent'],
    related: ['schkg-fristen'],
    icon: 'percent',
  },
  mietrecht: {
    id: 'mietrecht',
    art: 'frist',
    rechtsgebiet: 'Miete',
    category: 'MIETRECHT · OR',
    title: 'Mietrecht — Fristen',
    description: 'Kündigungstermine und -fristen für Wohn- und Geschäftsräume — mit Termin-Hierarchie, Formprüfung und ausserordentlichen Kündigungen.',
    status: 'geprüft',
    norms: [fedlex('Art. 266a–o OR', 'OR', 'art_266_a'), fedlex('Art. 257d/f OR', 'OR', 'art_257_d')],
    href: '/rechner/mietrecht',
    keywords: ['Mietwohnung', 'Wohnung kündigen', 'Kündigungstermin', 'Vermieter', 'Mieter', 'Geschäftsraum'],
    icon: 'house',
  },
  erbteilung: {
    id: 'erbteilung',
    art: 'betrag',
    rechtsgebiet: 'Erbrecht',
    category: 'ERBRECHT · ZGB',
    title: 'Pflichtteil & verfügbare Quote',
    description: 'Gesetzliche Erbteile, Pflichtteile und verfügbare Quote — mit Todesdatum-Weiche für die Revision 2023 und güterrechtlicher Vorstufe.',
    status: 'geprüft',
    norms: [fedlex('Art. 457 ff. ZGB', 'ZGB', 'art_457'), fedlex('Art. 470 f. ZGB', 'ZGB', 'art_470')],
    href: '/rechner/erbteilung',
    keywords: ['Erbe', 'Pflichtteil', 'Testament', 'Erbteilung', 'verfügbare Quote', 'Todesfall', 'Ehegatte'],
    icon: 'scale',
  },

  // ── Platzhalter (geplant) ──
  verwaltungsverfahren: {
    id: 'verwaltungsverfahren',
    art: 'frist',
    rechtsgebiet: 'Verwaltung & Steuern',
    category: 'VERWALTUNGSVERFAHREN',
    title: 'Verwaltungsverfahren',
    description: 'Fristen im Verwaltungsverfahren.',
    status: 'geplant',
    norms: [],
    note: 'in Vorbereitung',
  },
  strafverfahren: {
    id: 'strafverfahren',
    art: 'frist',
    rechtsgebiet: 'Strafverfahren (StPO)',
    category: 'STRAFVERFAHREN · STPO',
    title: 'Strafverfahren (StPO)',
    description: 'Fristen im Strafverfahren.',
    status: 'geplant',
    norms: [],
    note: 'in Vorbereitung',
  },
  'or-verjaehrung': {
    id: 'or-verjaehrung',
    art: 'frist',
    rechtsgebiet: 'Vertrag / OR',
    category: 'VERTRAGS-/SCHULDRECHT · OR',
    title: 'Vertrags-/Schuldrecht (OR)',
    description: 'Materielle Fristen des Obligationenrechts.',
    status: 'geplant',
    norms: [],
    note: 'in Vorbereitung',
  },
  'erbrecht-fristen': {
    id: 'erbrecht-fristen',
    art: 'frist',
    rechtsgebiet: 'Erbrecht',
    category: 'ERBRECHT · ZGB',
    title: 'Erbrechtliche Fristen',
    description: 'Materielle Fristen des Erbrechts (z. B. Ausschlagung).',
    status: 'geplant',
    norms: [],
    note: 'in Vorbereitung',
  },
  tagerechner: {
    id: 'tagerechner',
    art: 'werkzeug',
    rechtsgebiet: 'übergreifend',
    category: 'QUERSCHNITT',
    title: 'Fristen-/Tagerechner',
    description: 'Allgemeiner Tage- und Fristenrechner.',
    status: 'geplant',
    norms: [],
    note: 'in Vorbereitung',
  },
};

export function karte(id: string): CalculatorCard {
  return KARTEN[id];
}

// ─── Säulen-Baum (Zielstruktur) ───────────────────────────────────────────

export const PILLARS: Pillar[] = [
  {
    id: 'fristen',
    numeral: 'I',
    eyebrow: 'SÄULE I',
    title: 'Fristen',
    lede: 'Prozessuale und materielle Fristen — berechnet mit Stillstand, Ferien und Werktagsregeln.',
    classes: [
      {
        id: 'verfahrensrecht',
        title: 'Verfahrensrecht',
        lede: 'Prozessuale Fristen — vom auslösenden Ereignis bis zum letzten Tag.',
        subgroups: [
          {
            id: 'zivilprozess',
            title: 'Zivilprozess',
            clusters: [
              { label: 'Gericht (ZPO)', items: [KARTEN['zpo-fristen']] },
              { label: 'Betreibung & Konkurs (SchKG)', items: [KARTEN['schkg-fristen']] },
            ],
          },
          { id: 'verwaltungsverfahren', title: 'Verwaltungsverfahren', items: [KARTEN['verwaltungsverfahren']] },
          { id: 'strafverfahren', title: 'Strafverfahren (StPO)', items: [KARTEN['strafverfahren']] },
        ],
      },
      {
        id: 'materielles-recht',
        title: 'Materielles Recht',
        lede: 'Materielle Fristen — nach Rechtsgebiet.',
        subgroups: [
          { id: 'or-schuldrecht', title: 'Vertrags-/Schuldrecht (OR)', items: [KARTEN['or-verjaehrung']] },
          { id: 'arbeitsrecht-fristen', title: 'Arbeitsrecht', items: [KARTEN['kuendigung-sperrfristen']] },
          { id: 'mietrecht', title: 'Mietrecht', items: [KARTEN['mietrecht']] },
          { id: 'erbrecht-fristen', title: 'Erbrecht', items: [KARTEN['erbrecht-fristen']] },
        ],
      },
    ],
  },
  {
    id: 'berechnungen',
    numeral: 'II',
    eyebrow: 'SÄULE II',
    title: 'Berechnungen & Ansprüche',
    lede: 'Geldansprüche und Quoten — nachvollziehbar hergeleitet, Franken für Franken.',
    subgroups: [
      { id: 'zinsen-verzug', title: 'Zinsen & Verzug', items: [KARTEN['verzugszins']] },
      { id: 'arbeitsrecht-berechnungen', title: 'Arbeitsrecht', items: [KARTEN['lohnfortzahlung']] },
      { id: 'erbrecht-berechnungen', title: 'Erbrecht', items: [KARTEN['erbteilung']] },
    ],
  },
  {
    id: 'werkzeuge',
    numeral: 'III',
    eyebrow: 'SÄULE III',
    title: 'Werkzeuge',
    lede: 'Querschnitts-Hilfen rund um Daten und Fristen.',
    subgroups: [
      { id: 'tagerechner', title: 'Fristen-/Tagerechner', items: [KARTEN['tagerechner']] },
    ],
  },
];

