// ─── Startseiten-Konfiguration: vier Output-Typen + flacher Katalog ───────
//
// Single source of truth für die Startseiten-Karten. Die Detailseiten und
// die /rechner-Übersicht nutzen weiterhin src/lib/calculators.ts.
//
// Normentreue: Geprüfte Karten tragen ihre verifizierten Norm-Pills
// (Fedlex-Anker gegen den konsolidierten Volltext nachgewiesen, s. fedlex()).
// Geplante Karten («In Vorbereitung») tragen KEINE Artikel-Pills und keine
// Artikel-/Tagesangaben in der Beschreibung — nur Titel + neutrale
// Kurzbeschreibung. Keine Normen erfinden.

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
  title: string;
  description: string;
  status: Status;
  norms: NormRef[];       // nur bei 'geprüft' befüllt/angezeigt
  href?: string;          // nur bei 'geprüft'
  keywords?: string[];
  related?: string[];
  note?: string;          // Anzeige-Hinweis, Default «In Vorbereitung»
  icon?: string;          // bestehende Icon-Komponente (Kartenanatomie)
}

export interface Sektion {
  art: Art;
  id: string;            // Anker für Sprungmarken
  numeral: 'I' | 'II' | 'III' | 'IV';
  title: string;
  lede: string;
}

// ─── Fedlex-Verlinkung (verifizierte Anker) ───────────────────────────────
//
// Jeder Anker wurde gegen den konsolidierten Volltext (Filestore-HTML der
// Konsolidierung 20250101) geprüft – das Dokument enthält die entsprechende
// id="art_…". Buchstaben-Artikel nutzen das Unterstrich-Format (art_324_a).
// Sammel-/Spannenangaben verlinken den Leitartikel. SR-Nummern: OR = SR 220,
// ZPO = SR 272, SchKG = SR 281.1, ZGB = SR 210.

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

// ─── Sektionen: vier Output-Typen (oberste Ebene) ─────────────────────────

export const SEKTIONEN: Sektion[] = [
  { art: 'frist', id: 'fristen', numeral: 'I', title: 'Fristen',
    lede: 'Prozessuale und materielle Fristen — vom auslösenden Ereignis bis zum letzten Tag.' },
  { art: 'betrag', id: 'betraege', numeral: 'II', title: 'Beträge & Quoten',
    lede: 'Geldansprüche, Zinsen, Kosten und Quoten — Franken für Franken hergeleitet.' },
  { art: 'zuordnung', id: 'zustaendigkeit', numeral: 'III', title: 'Zuständigkeit & Einordnung',
    lede: 'Welches Gericht, welches Recht, welche Verfahrensart — rechtsbasiert bestimmt.' },
  { art: 'werkzeug', id: 'werkzeuge', numeral: 'IV', title: 'Werkzeuge',
    lede: 'Rechtsgebietsübergreifende Hilfsrechner.' },
];

// Filterwerte in Katalog-Reihenfolge.
export const RECHTSGEBIETE: string[] = [
  'Zivilprozess (ZPO)',
  'Betreibung & Konkurs (SchKG)',
  'Arbeit',
  'Miete',
  'Verwaltung & Steuern',
  'Strafverfahren (StPO)',
  'Sozialversicherung (ATSG)',
  'Vertrag / OR',
  'Erbrecht',
  'Familie',
  'Internationales Privatrecht',
  'übergreifend',
];

// ─── Karten-Katalog (geprüft + geplant) ───────────────────────────────────

const KARTEN: Record<string, CalculatorCard> = {
  // ════ I — Fristen (geprüft) ════
  'zpo-fristen': {
    id: 'zpo-fristen', art: 'frist', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Verfahrens- & Rechtsmittelfristen',
    description: 'Verfahrens- und Rechtsmittelfristen mit Gerichtsferien und Stillstand.',
    status: 'geprüft',
    norms: [fedlex('Art. 142–147 ZPO', 'ZPO', 'art_142')],
    href: '/rechner/zpo-fristen',
    keywords: ['Frist', 'Gericht', 'Berufung', 'Beschwerde', 'Klage', 'Gerichtsferien', 'Stillstand', 'Zustellung'],
    icon: 'clock',
  },
  'schkg-fristen': {
    id: 'schkg-fristen', art: 'frist', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    title: 'Betreibungs- & Konkursfristen',
    description: 'Fristen im Betreibungs- und Konkursverfahren mit Betreibungsferien (Art. 63 SchKG) und ZPO-Stillstand für gerichtliche Klagen.',
    status: 'geprüft',
    norms: [fedlex('Art. 56/63 SchKG', 'SchKG', 'art_56'), fedlex('Art. 145 ZPO', 'ZPO', 'art_145')],
    href: '/rechner/schkg-fristen',
    keywords: ['Betreibung', 'Zahlungsbefehl', 'Rechtsvorschlag', 'Konkurs', 'Pfändung', 'Betreibungsferien'],
    related: ['verzugszins'],
    icon: 'clipboard',
  },
  'kuendigung-sperrfristen': {
    id: 'kuendigung-sperrfristen', art: 'frist', rechtsgebiet: 'Arbeit',
    title: 'Kündigungs- & Sperrfristen',
    description: 'Ordentliche Kündigungsfristen und Sperrfristen (Kündigung zur Unzeit) im Arbeitsverhältnis.',
    status: 'geprüft',
    norms: [fedlex('Art. 335c OR', 'OR', 'art_335_c'), fedlex('Art. 336c OR', 'OR', 'art_336_c')],
    href: '/rechner/kuendigung#kuendigung',
    keywords: ['gekündigt', 'Kündigung', 'Probezeit', 'Sperrfrist', 'Krankheit', 'Unfall', 'Schwangerschaft', 'Militär'],
    related: ['lohnfortzahlung'],
    icon: 'document',
  },
  mietrecht: {
    id: 'mietrecht', art: 'frist', rechtsgebiet: 'Miete',
    title: 'Kündigung & Fristen im Mietrecht',
    description: 'Kündigungstermine und -fristen für Wohn- und Geschäftsräume — mit Termin-Hierarchie, Formprüfung und ausserordentlichen Kündigungen.',
    status: 'geprüft',
    norms: [fedlex('Art. 266a–o OR', 'OR', 'art_266_a'), fedlex('Art. 257d/f OR', 'OR', 'art_257_d')],
    href: '/rechner/mietrecht',
    keywords: ['Mietwohnung', 'Wohnung kündigen', 'Kündigungstermin', 'Vermieter', 'Mieter', 'Geschäftsraum'],
    icon: 'house',
  },

  // ════ I — Fristen (in Vorbereitung) ════
  'beschwerde-verwaltung': {
    id: 'beschwerde-verwaltung', art: 'frist', rechtsgebiet: 'Verwaltung & Steuern',
    title: 'Beschwerde- & Einsprachefristen',
    description: 'Einsprache- und Beschwerdefristen im Verwaltungs- und Steuerverfahren (Bund und Kantone).',
    status: 'geplant', norms: [],
  },
  strafverfahren: {
    id: 'strafverfahren', art: 'frist', rechtsgebiet: 'Strafverfahren (StPO)',
    title: 'Fristen im Strafverfahren',
    description: 'Einsprache gegen Strafbefehl und Rechtsmittelfristen.',
    status: 'geplant', norms: [],
  },
  sozialversicherung: {
    id: 'sozialversicherung', art: 'frist', rechtsgebiet: 'Sozialversicherung (ATSG)',
    title: 'Einsprache- & Beschwerdefristen (Sozialversicherung)',
    description: 'Fristen gegen Verfügungen von IV, AHV, Unfall- und Krankenversicherung.',
    status: 'geplant', norms: [],
  },
  verjaehrung: {
    id: 'verjaehrung', art: 'frist', rechtsgebiet: 'Vertrag / OR',
    title: 'Verjährung',
    description: 'Ordentliche und kurze Verjährung sowie deliktische und bereicherungsrechtliche Ansprüche.',
    status: 'geplant', norms: [],
  },
  gewaehrleistung: {
    id: 'gewaehrleistung', art: 'frist', rechtsgebiet: 'Vertrag / OR',
    title: 'Gewährleistung & Mängelrüge',
    description: 'Prüf- und Rügefristen sowie Gewährleistungsverjährung bei Kauf und Werkvertrag.',
    status: 'geplant', norms: [],
  },
  'missbraeuchliche-kuendigung': {
    id: 'missbraeuchliche-kuendigung', art: 'frist', rechtsgebiet: 'Arbeit',
    title: 'Anfechtung missbräuchlicher Kündigung',
    description: 'Einsprache- und Klagefristen bei missbräuchlicher Kündigung.',
    status: 'geplant', norms: [],
  },
  'miete-anfechtung': {
    id: 'miete-anfechtung', art: 'frist', rechtsgebiet: 'Miete',
    title: 'Anfechtung & Erstreckung (Miete)',
    description: 'Anfechtung von Kündigung und Mietzins sowie Erstreckungsfristen.',
    status: 'geplant', norms: [],
  },
  'erbrecht-fristen': {
    id: 'erbrecht-fristen', art: 'frist', rechtsgebiet: 'Erbrecht',
    title: 'Ausschlagung, Herabsetzung & Ungültigkeit',
    description: 'Fristen für Ausschlagung der Erbschaft, Herabsetzungs- und Ungültigkeitsklage.',
    status: 'geplant', norms: [],
  },
  'familie-fristen': {
    id: 'familie-fristen', art: 'frist', rechtsgebiet: 'Familie',
    title: 'Familienrechtliche Fristen',
    description: 'Fristen bei Scheidung und Anfechtung des Kindesverhältnisses.',
    status: 'geplant', norms: [],
  },
  klagebewilligung: {
    id: 'klagebewilligung', art: 'frist', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Klagebewilligung — Geltungsdauer',
    description: 'Frist zur Einreichung der Klage nach erteilter Klagebewilligung.',
    status: 'geplant', norms: [],
  },
  massenentlassung: {
    id: 'massenentlassung', art: 'frist', rechtsgebiet: 'Arbeit',
    title: 'Massenentlassung — Konsultationsfristen',
    description: 'Fristen für die Konsultation der Arbeitnehmer bei Massenentlassung.',
    status: 'geplant', norms: [],
  },
  'gesellschaftsrecht-fristen': {
    id: 'gesellschaftsrecht-fristen', art: 'frist', rechtsgebiet: 'Vertrag / OR',
    title: 'Gesellschaftsrechtliche Fristen',
    description: 'Einberufungs- und Traktandierungsfristen sowie Verjährung der Verantwortlichkeitsklage.',
    status: 'geplant', norms: [],
  },
  'sv-leistungen': {
    id: 'sv-leistungen', art: 'frist', rechtsgebiet: 'Sozialversicherung (ATSG)',
    title: 'Leistungsverwirkung & Nachzahlung (Sozialversicherung)',
    description: 'Fristen für Anmeldung und rückwirkende Leistungen.',
    status: 'geplant', norms: [],
  },

  // ════ II — Beträge & Quoten (geprüft) ════
  verzugszins: {
    id: 'verzugszins', art: 'betrag', rechtsgebiet: 'Vertrag / OR',
    title: 'Verzugszins',
    description: 'Verzugszins bei Schuldnerverzug — Zeitraum, Satz und Betrag.',
    status: 'geprüft',
    norms: [fedlex('Art. 104 OR', 'OR', 'art_104')],
    href: '/rechner/verzugszins',
    keywords: ['Rechnung', 'Verzug', 'Zins', 'Mahnung', 'offene Forderung', '5 Prozent'],
    related: ['schkg-fristen'],
    icon: 'percent',
  },
  lohnfortzahlung: {
    id: 'lohnfortzahlung', art: 'betrag', rechtsgebiet: 'Arbeit',
    title: 'Lohnfortzahlung (kantonale Skala)',
    description: 'Lohnfortzahlung bei unverschuldeter Verhinderung nach kantonaler Skala (Basel/Bern/Zürich).',
    status: 'geprüft',
    norms: [fedlex('Art. 324a OR', 'OR', 'art_324_a')],
    href: '/rechner/kuendigung#lohnfortzahlung',
    keywords: ['krank', 'Lohnfortzahlung', 'Arztzeugnis', 'Arbeitsunfähigkeit', 'Taggeld', 'Skala'],
    related: ['kuendigung-sperrfristen'],
    icon: 'document',
  },
  erbteilung: {
    id: 'erbteilung', art: 'betrag', rechtsgebiet: 'Erbrecht',
    title: 'Pflichtteil & verfügbare Quote',
    description: 'Gesetzliche Erbteile, Pflichtteile und verfügbare Quote — mit Todesdatum-Weiche für die Revision 2023 und güterrechtlicher Vorstufe.',
    status: 'geprüft',
    norms: [fedlex('Art. 457 ff. ZGB', 'ZGB', 'art_457'), fedlex('Art. 470 f. ZGB', 'ZGB', 'art_470')],
    href: '/rechner/erbteilung',
    keywords: ['Erbe', 'Pflichtteil', 'Testament', 'Erbteilung', 'verfügbare Quote', 'Todesfall', 'Ehegatte'],
    icon: 'scale',
  },

  // ════ II — Beträge & Quoten (in Vorbereitung) ════
  prozesskosten: {
    id: 'prozesskosten', art: 'betrag', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Gerichts-, Partei- & Betreibungskosten',
    description: 'Kostenschätzung nach Streitwert und Tarif; kantonale Tarife werden gekennzeichnet.',
    status: 'geplant', norms: [],
  },
  streitwert: {
    id: 'streitwert', art: 'betrag', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Streitwertberechnung',
    description: 'Ermittlung des Streitwerts als Grundlage für Kosten und Verfahrensart.',
    status: 'geplant', norms: [],
  },
  'arbeit-entschaedigung': {
    id: 'arbeit-entschaedigung', art: 'betrag', rechtsgebiet: 'Arbeit',
    title: 'Arbeitsrechtliche Entschädigungen & Zuschläge',
    description: 'Überstunden, Ferienlohn, 13. Monatslohn pro rata sowie Entschädigung bei missbräuchlicher oder fristloser Kündigung.',
    status: 'geplant', norms: [],
  },
  'erb-ausgleichung': {
    id: 'erb-ausgleichung', art: 'betrag', rechtsgebiet: 'Erbrecht',
    title: 'Erbrechtliche Ausgleichung & Güterrecht',
    description: 'Ausgleichung und Hinzurechnung sowie güterrechtliche Auseinandersetzung als Vorstufe.',
    status: 'geplant', norms: [],
  },
  mietzinsanpassung: {
    id: 'mietzinsanpassung', art: 'betrag', rechtsgebiet: 'Miete',
    title: 'Mietzinsanpassung (Referenzzinssatz)',
    description: 'Anpassung des Mietzinses nach Referenzzinssatz, Teuerung und Kostensteigerung.',
    status: 'geplant', norms: [],
  },
  vorsorgeausgleich: {
    id: 'vorsorgeausgleich', art: 'betrag', rechtsgebiet: 'Familie',
    title: 'Vorsorgeausgleich (BVG) bei Scheidung',
    description: 'Teilung der während der Ehe geäufneten Austrittsleistungen der beruflichen Vorsorge.',
    status: 'geplant', norms: [],
  },
  existenzminimum: {
    id: 'existenzminimum', art: 'betrag', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    title: 'Existenzminimum & Pfändungsquote',
    description: 'Ermittlung des pfändbaren Betrags; Richtlinien- und kantonsabhängig.',
    status: 'geplant', norms: [],
  },

  // ════ III — Zuständigkeit & Einordnung (in Vorbereitung) ════
  gerichtsstand: {
    id: 'gerichtsstand', art: 'zuordnung', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Örtliche Zuständigkeit / Gerichtsstand',
    description: 'Bestimmung des örtlich zuständigen Gerichts im Zivilprozess.',
    status: 'geplant', norms: [],
  },
  verfahrensart: {
    id: 'verfahrensart', art: 'zuordnung', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Sachliche Zuständigkeit & Verfahrensart',
    description: 'Ordentliches, vereinfachtes oder summarisches Verfahren nach Streitwert und Materie.',
    status: 'geplant', norms: [],
  },
  schlichtung: {
    id: 'schlichtung', art: 'zuordnung', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Schlichtungspflicht & Schlichtungsbehörde',
    description: 'Ob ein Schlichtungsverfahren erforderlich ist und welche Behörde zuständig ist.',
    status: 'geplant', norms: [],
  },
  iprg: {
    id: 'iprg', art: 'zuordnung', rechtsgebiet: 'Internationales Privatrecht',
    title: 'Anwendbares Recht (IPRG)',
    description: 'Anwendbares Recht und Gerichtsstand bei internationalem Bezug.',
    status: 'geplant', norms: [],
  },

  // ════ IV — Werkzeuge (in Vorbereitung) ════
  tagerechner: {
    id: 'tagerechner', art: 'werkzeug', rechtsgebiet: 'übergreifend',
    title: 'Fristen- & Tagerechner',
    description: 'Tage und Monate ab einem Datum, mit Wochenend- und Feiertagsverschiebung.',
    status: 'geplant', norms: [],
  },
  'ferien-checker': {
    id: 'ferien-checker', art: 'werkzeug', rechtsgebiet: 'übergreifend',
    title: 'Gerichts- & Betreibungsferien-Checker',
    description: 'Prüft, ob ein Datum in Gerichts- oder Betreibungsferien fällt.',
    status: 'geplant', norms: [],
  },
  teuerungsrechner: {
    id: 'teuerungsrechner', art: 'werkzeug', rechtsgebiet: 'übergreifend',
    title: 'Teuerungsrechner (LIK-Indexierung)',
    description: 'Anpassung von Beträgen nach dem Landesindex der Konsumentenpreise.',
    status: 'geplant', norms: [],
  },
};

export function karte(id: string): CalculatorCard {
  return KARTEN[id];
}

/** Flacher Katalog; Anzeige je Sektion: geprüfte zuerst, danach «In Vorbereitung». */
export const ALLE_KARTEN: CalculatorCard[] = Object.values(KARTEN);
