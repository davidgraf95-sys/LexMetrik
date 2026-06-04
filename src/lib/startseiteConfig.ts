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
export type Modus = 'rechner' | 'vorlage'; // inhaltliche Hauptweiche (In-Page-Toggle)
export type Art = 'frist' | 'betrag' | 'zuordnung' | 'werkzeug'; // Rechner-Output-Typ → Sektion
export type VorlageArt = 'vorsorge' | 'vertrag' | 'eingabe' | 'gesellschaft'; // Dokument-Typ → Sektion
export type Tier = 'frei' | 'experte'; // frei = Basis-Seite (/), experte = Experten-Panel (/fachpersonen)

export interface NormRef {
  label: string;      // Anzeigetext, unverändert (z. B. "Art. 335c OR")
  url: string;        // verifizierter Fedlex-Artikel-Link ODER Gesetz-Seite
  verified: boolean;  // true nur bei geprüftem Artikel-Anker
}

interface BaseItem {
  id: string;
  modus: Modus;           // Rechner ↔ Vorlage (Hauptweiche)
  tier: Tier;             // Stufe: Basis-Seite oder Experten-Panel
  rechtsgebiet: string;   // Filterwert (z. B. «Miete», «Zivilprozess (ZPO)»)
  title: string;
  description: string;
  status: Status;
  norms: NormRef[];       // nur bei 'geprüft' befüllt/angezeigt
  href?: string;          // nur bei 'geprüft'
  keywords?: string[];
  related?: string[];     // verwandte Rechner UND Vorlagen (modusübergreifend)
  note?: string;          // Anzeige-Hinweis, Default «In Vorbereitung»
  icon?: string;          // bestehende Icon-Komponente (Kartenanatomie)
}

export interface RechnerCard extends BaseItem {
  modus: 'rechner';
  art: Art;               // Output-Typ → bestimmt die Sektion
}

export interface VorlageCard extends BaseItem {
  modus: 'vorlage';
  art: VorlageArt;        // Dokument-Typ → bestimmt die Sektion
  schemaId?: string;      // Vorlagen-Schema (nur bei 'geprüft')
  formvorschrift?: string; // Kurzhinweis für die Karte, z. B. «Eigenhändig zu errichten»
  output?: ('pdf' | 'docx')[];
}

export type CatalogItem = RechnerCard | VorlageCard;
// Rückwärtskompatibler Alias (bestehende Importe)
export type CalculatorCard = CatalogItem;

export interface Sektion {
  art: Art | VorlageArt;
  id: string;            // Anker für Sprungmarken
  numeral: 'I' | 'II' | 'III' | 'IV';
  title: string;
  lede: string;
}

// ─── Fedlex-Verlinkung ─────────────────────────────────────────────────────
//
// Verifizierte Basis-URLs und Anker-Regel zentral in src/lib/fedlex.ts
// (wird auch für die Normverweise in den Rechnerseiten genutzt).
// Aufzählungen erhalten je ein eigenes Pill.
import { fedlexUrl } from './fedlex';

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

// Vorlagen-Sektionen: vier Dokument-Typen (Modus «Vorlagen»)
export const VORLAGE_SEKTIONEN: Sektion[] = [
  { art: 'vorsorge', id: 'vorsorge', numeral: 'I', title: 'Vorsorge & Nachlass',
    lede: 'Testament, Erbvertrag, Vorsorgeauftrag, Patientenverfügung — aus geprüften Bausteinen.' },
  { art: 'vertrag', id: 'vertraege', numeral: 'II', title: 'Verträge',
    lede: 'Arbeits-, Miet-, Darlehens- und Kaufverträge — Klausel für Klausel nachvollziehbar.' },
  { art: 'eingabe', id: 'eingaben', numeral: 'III', title: 'Eingaben',
    lede: 'Klagen, Gesuche, Einsprachen und Beschwerden — strukturierte Gerüste mit offenen Optionen.' },
  { art: 'gesellschaft', id: 'gesellschaft', numeral: 'IV', title: 'Gesellschaftsdokumente',
    lede: 'Gründungsunterlagen, Statuten und Beschlüsse — formbewusst zusammengestellt.' },
];

// Filterwerte in Katalog-Reihenfolge.
export const RECHTSGEBIETE: string[] = [
  'Zivilprozess (ZPO)',
  'Betreibung & Konkurs (SchKG)',
  'Arbeit',
  'Miete',
  'Verwaltung & Steuern',
  'Strafverfahren (StPO)',
  'Strafrecht (StPO/StGB)',
  'Bundesgericht (BGG)',
  'Sachenrecht (ZGB)',
  'Sozialversicherung (ATSG)',
  'Vertrag / OR',
  'Gesellschaftsrecht (OR)',
  'Erbrecht',
  'Familie',
  'Internationales Privatrecht',
  'übergreifend',
];

// ─── Karten-Katalog (geprüft + geplant) ───────────────────────────────────

const KARTEN: Record<string, CalculatorCard> = {
  // ════ I — Fristen (geprüft) ════
  'zpo-fristen': {
    id: 'zpo-fristen', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Verfahrens- & Rechtsmittelfristen',
    description: 'Verfahrens- und Rechtsmittelfristen mit Gerichtsferien und Stillstand.',
    status: 'geprüft',
    norms: [
      // Art. 142–147 ZPO – Fristenlauf (Spanne: Anker auf führenden Artikel)
      { label: 'Art. 142–147 ZPO', url: fedlexUrl('ZPO', '142'), verified: true },
    ],
    href: '/rechner/zpo-fristen',
    related: ['schlichtungsgesuch', 'klage-vereinfacht'],
    keywords: ['Frist', 'Gericht', 'Berufung', 'Beschwerde', 'Klage', 'Gerichtsferien', 'Stillstand', 'Zustellung'],
    icon: 'clock',
  },
  'schkg-fristen': {
    id: 'schkg-fristen', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    title: 'Betreibungs- & Konkursfristen',
    description: 'Fristen im Betreibungs- und Konkursverfahren mit Betreibungsferien (Art. 63 SchKG) und ZPO-Stillstand für gerichtliche Klagen.',
    status: 'geprüft',
    norms: [
      // Art. 56 SchKG – Rechtsstillstand
      { label: 'Art. 56 SchKG', url: fedlexUrl('SchKG', '56'), verified: true },
      // Art. 63 SchKG – Betreibungsferien
      { label: 'Art. 63 SchKG', url: fedlexUrl('SchKG', '63'), verified: true },
      // Art. 145 ZPO – Stillstand (Querverweis: ZPO-Basis, nicht SchKG)
      { label: 'Art. 145 ZPO', url: fedlexUrl('ZPO', '145'), verified: true },
    ],
    href: '/rechner/schkg-fristen',
    keywords: ['Betreibung', 'Zahlungsbefehl', 'Rechtsvorschlag', 'Konkurs', 'Pfändung', 'Betreibungsferien'],
    related: ['verzugszins', 'rechtsoeffnungsbegehren'],
    icon: 'clipboard',
  },
  'kuendigung-sperrfristen': {
    id: 'kuendigung-sperrfristen', modus: 'rechner', art: 'frist', tier: 'frei', rechtsgebiet: 'Arbeit',
    title: 'Kündigungs- & Sperrfristen',
    description: 'Ordentliche Kündigungsfristen und Sperrfristen (Kündigung zur Unzeit) im Arbeitsverhältnis.',
    status: 'geprüft',
    norms: [
      // Art. 335c OR – ordentliche Kündigungsfristen
      { label: 'Art. 335c OR', url: fedlexUrl('OR', '335c'), verified: true },
      // Art. 336c OR – Kündigung zur Unzeit (Sperrfristen)
      { label: 'Art. 336c OR', url: fedlexUrl('OR', '336c'), verified: true },
    ],
    href: '/rechner/kuendigung#kuendigung',
    keywords: ['gekündigt', 'Kündigung', 'Probezeit', 'Sperrfrist', 'Krankheit', 'Unfall', 'Schwangerschaft', 'Militär'],
    related: ['lohnfortzahlung', 'arbeitsvertrag'],
    icon: 'document',
  },
  mietrecht: {
    id: 'mietrecht', modus: 'rechner', art: 'frist', tier: 'frei', rechtsgebiet: 'Miete',
    title: 'Kündigung & Fristen im Mietrecht',
    description: 'Kündigungstermine und -fristen für Wohn- und Geschäftsräume — mit Termin-Hierarchie, Formprüfung und ausserordentlichen Kündigungen.',
    status: 'geprüft',
    norms: [
      // Art. 266a–o OR – Kündigungstermine/-fristen (Spanne: Anker auf führenden Artikel)
      { label: 'Art. 266a–o OR', url: fedlexUrl('OR', '266a'), verified: true },
      // Art. 257d OR – Zahlungsrückstand
      { label: 'Art. 257d OR', url: fedlexUrl('OR', '257d'), verified: true },
      // Art. 257f OR – Sorgfaltspflichtverletzung
      { label: 'Art. 257f OR', url: fedlexUrl('OR', '257f'), verified: true },
    ],
    href: '/rechner/mietrecht',
    keywords: ['Mietwohnung', 'Wohnung kündigen', 'Kündigungstermin', 'Vermieter', 'Mieter', 'Geschäftsraum'],
    related: ['mietvertrag-wohnen'],
    icon: 'house',
  },

  // ════ I — Fristen (in Vorbereitung) ════
  'beschwerde-verwaltung': {
    id: 'beschwerde-verwaltung', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Verwaltung & Steuern',
    title: 'Beschwerde- & Einsprachefristen',
    description: 'Einsprache- und Beschwerdefristen im Verwaltungs- und Steuerverfahren (Bund und Kantone).',
    status: 'geplant', norms: [],
  },
  strafverfahren: {
    id: 'strafverfahren', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Strafverfahren (StPO)',
    title: 'Fristen im Strafverfahren',
    description: 'Einsprache gegen Strafbefehl und Rechtsmittelfristen.',
    status: 'geplant', norms: [],
  },
  sozialversicherung: {
    id: 'sozialversicherung', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Sozialversicherung (ATSG)',
    title: 'Einsprache- & Beschwerdefristen (Sozialversicherung)',
    description: 'Fristen gegen Verfügungen von IV, AHV, Unfall- und Krankenversicherung.',
    status: 'geplant', norms: [],
  },
  verjaehrung: {
    id: 'verjaehrung', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Vertrag / OR',
    title: 'Verjährung',
    description: 'Ordentliche und kurze Verjährung sowie deliktische und bereicherungsrechtliche Ansprüche — mit Stillstand, Unterbrechung und Einredeverzicht.',
    status: 'geprüft',
    norms: [
      // Art. 60 OR – unerlaubte Handlung (3/10 bzw. 3/20 Jahre)
      { label: 'Art. 60 OR', url: fedlexUrl('OR', '60'), verified: true },
      // Art. 67 OR – ungerechtfertigte Bereicherung (3/10 Jahre)
      { label: 'Art. 67 OR', url: fedlexUrl('OR', '67'), verified: true },
      // Art. 127–142 OR – Verjährungsordnung (Spanne: Anker auf führenden Artikel)
      { label: 'Art. 127–142 OR', url: fedlexUrl('OR', '127'), verified: true },
    ],
    href: '/rechner/verjaehrung',
    keywords: ['Verjährung', 'verjährt', 'Frist', 'Forderung', 'unerlaubte Handlung', 'Bereicherung', 'Unterbrechung', 'Verzicht', 'Einrede'],
    related: ['verzugszins', 'rechtsoeffnungsbegehren'],
    icon: 'clock',
  },
  gewaehrleistung: {
    id: 'gewaehrleistung', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Vertrag / OR',
    title: 'Gewährleistung & Mängelrüge',
    description: 'Rüge- und Verjährungsfristen bei Kauf, Werkvertrag und Grundstückkauf — mit Zwei-Regime-Weiche zur Baumängel-Revision 2026.',
    status: 'geprüft',
    norms: [
      // Art. 201 OR – Prüf-/Rügeobliegenheit (inkl. Abs. 4 neu)
      { label: 'Art. 201 OR', url: fedlexUrl('OR', '201'), verified: true },
      // Art. 210 OR – Verjährung Kauf
      { label: 'Art. 210 OR', url: fedlexUrl('OR', '210'), verified: true },
      // Art. 219a OR – Grundstückkauf (neu, in Kraft 1.1.2026)
      { label: 'Art. 219a OR', url: fedlexUrl('OR', '219a'), verified: true },
      // Art. 367 OR – Prüfung/Rüge Werkvertrag (inkl. Abs. 1bis neu)
      { label: 'Art. 367 OR', url: fedlexUrl('OR', '367'), verified: true },
      // Art. 371 OR – Verjährung Werkvertrag (inkl. Abs. 3 neu)
      { label: 'Art. 371 OR', url: fedlexUrl('OR', '371'), verified: true },
    ],
    href: '/rechner/gewaehrleistung',
    keywords: ['Mangel', 'Mängelrüge', 'Garantie', 'Gewährleistung', 'Kauf', 'Werkvertrag', 'Baumängel', 'Rüge', 'Abnahme', 'SIA'],
    related: ['verjaehrung', 'kaufvertrag'],
    icon: 'house',
  },
  'missbraeuchliche-kuendigung': {
    id: 'missbraeuchliche-kuendigung', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Arbeit',
    title: 'Anfechtung missbräuchlicher Kündigung',
    description: 'Einsprache- und Klagefristen bei missbräuchlicher Kündigung.',
    status: 'geplant', norms: [],
  },
  'miete-anfechtung': {
    id: 'miete-anfechtung', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Miete',
    title: 'Anfechtung & Erstreckung (Miete)',
    description: 'Anfechtung von Kündigung und Mietzins sowie Erstreckungsfristen.',
    status: 'geplant', norms: [],
  },
  'erbrecht-fristen': {
    id: 'erbrecht-fristen', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Erbrecht',
    title: 'Ausschlagung, Herabsetzung & Ungültigkeit',
    description: 'Fristen für Ausschlagung der Erbschaft, Herabsetzungs- und Ungültigkeitsklage.',
    status: 'geplant', norms: [],
  },
  'familie-fristen': {
    id: 'familie-fristen', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Familie',
    title: 'Familienrechtliche Fristen',
    description: 'Fristen bei Scheidung und Anfechtung des Kindesverhältnisses.',
    status: 'geplant', norms: [],
  },
  klagebewilligung: {
    id: 'klagebewilligung', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Klagebewilligung — Geltungsdauer',
    description: 'Frist zur Einreichung der Klage nach erteilter Klagebewilligung.',
    status: 'geplant', norms: [],
  },
  massenentlassung: {
    id: 'massenentlassung', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Arbeit',
    title: 'Massenentlassung — Konsultationsfristen',
    description: 'Fristen für die Konsultation der Arbeitnehmer bei Massenentlassung.',
    status: 'geplant', norms: [],
  },
  'gesellschaftsrecht-fristen': {
    id: 'gesellschaftsrecht-fristen', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Gesellschaftsrecht (OR)',
    title: 'Gesellschaftsrechtliche Fristen',
    description: 'Einberufungs- und Traktandierungsfristen sowie Verjährung der Verantwortlichkeitsklage.',
    status: 'geplant', norms: [],
  },
  'sv-leistungen': {
    id: 'sv-leistungen', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Sozialversicherung (ATSG)',
    title: 'Leistungsverwirkung & Nachzahlung (Sozialversicherung)',
    description: 'Fristen für Anmeldung und rückwirkende Leistungen.',
    status: 'geplant', norms: [],
  },
  'bgg-fristen': {
    id: 'bgg-fristen', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Bundesgericht (BGG)',
    title: 'Rechtsmittelfristen Bundesgericht',
    description: 'Beschwerdefristen ans Bundesgericht in Zivil-, Straf- und öffentlich-rechtlichen Sachen, inkl. Stillstand.',
    status: 'geplant', norms: [],
  },
  strafantrag: {
    id: 'strafantrag', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Strafrecht (StPO/StGB)',
    title: 'Strafantragsfrist',
    description: 'Frist zur Stellung des Strafantrags bei Antragsdelikten.',
    status: 'geplant', norms: [],
  },
  'straf-verjaehrung': {
    id: 'straf-verjaehrung', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Strafrecht (StPO/StGB)',
    title: 'Strafrechtliche Verjährung',
    description: 'Verfolgungs- und Vollstreckungsverjährung nach Strafrahmen.',
    status: 'geplant', norms: [],
  },
  bauhandwerkerpfandrecht: {
    id: 'bauhandwerkerpfandrecht', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Sachenrecht (ZGB)',
    title: 'Bauhandwerkerpfandrecht — Eintragungsfrist',
    description: 'Frist zur Eintragung des gesetzlichen Bauhandwerkerpfandrechts.',
    status: 'geplant', norms: [],
  },
  'schkg-klagefristen': {
    id: 'schkg-klagefristen', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    title: 'Rechtsöffnungs-, Aberkennungs- & Kollokationsfristen',
    description: 'Fristgebundene Klagen im Betreibungs- und Konkursverfahren.',
    status: 'geplant', norms: [],
  },
  arrest: {
    id: 'arrest', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    title: 'Arrest — Prosequierungsfristen',
    description: 'Fristen zur Prosequierung und Einleitung nach Arrestbewilligung.',
    status: 'geplant', norms: [],
  },
  fristwiederherstellung: {
    id: 'fristwiederherstellung', modus: 'rechner', art: 'frist', tier: 'experte', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Fristwiederherstellung',
    description: 'Frist und Voraussetzungen für ein Wiederherstellungsgesuch.',
    status: 'geplant', norms: [],
  },

  // ════ II — Beträge & Quoten (geprüft) ════
  verzugszins: {
    id: 'verzugszins', modus: 'rechner', art: 'betrag', tier: 'frei', rechtsgebiet: 'Vertrag / OR',
    title: 'Verzugszins',
    description: 'Verzugszins bei Schuldnerverzug — Zeitraum, Satz und Betrag.',
    status: 'geprüft',
    norms: [
      // Art. 104 OR – Verzugszins
      { label: 'Art. 104 OR', url: fedlexUrl('OR', '104'), verified: true },
    ],
    href: '/rechner/verzugszins',
    keywords: ['Rechnung', 'Verzug', 'Zins', 'Mahnung', 'offene Forderung', '5 Prozent'],
    related: ['schkg-fristen', 'darlehensvertrag'],
    icon: 'percent',
  },
  lohnfortzahlung: {
    id: 'lohnfortzahlung', modus: 'rechner', art: 'betrag', tier: 'frei', rechtsgebiet: 'Arbeit',
    title: 'Lohnfortzahlung (kantonale Skala)',
    description: 'Lohnfortzahlung bei unverschuldeter Verhinderung nach kantonaler Skala (Basel/Bern/Zürich).',
    status: 'geprüft',
    norms: [
      // Art. 324a OR – Lohnfortzahlung bei Verhinderung
      { label: 'Art. 324a OR', url: fedlexUrl('OR', '324a'), verified: true },
    ],
    href: '/rechner/kuendigung#lohnfortzahlung',
    keywords: ['krank', 'Lohnfortzahlung', 'Arztzeugnis', 'Arbeitsunfähigkeit', 'Taggeld', 'Skala'],
    related: ['kuendigung-sperrfristen', 'arbeitsvertrag'],
    icon: 'document',
  },
  erbteilung: {
    id: 'erbteilung', modus: 'rechner', art: 'betrag', tier: 'frei', rechtsgebiet: 'Erbrecht',
    title: 'Pflichtteil & verfügbare Quote',
    description: 'Gesetzliche Erbteile, Pflichtteile und verfügbare Quote — mit Todesdatum-Weiche für die Revision 2023 und güterrechtlicher Vorstufe.',
    status: 'geprüft',
    norms: [
      // Art. 457 ff. ZGB – gesetzliche Erben (Folgeverweis: Anker auf führenden Artikel)
      { label: 'Art. 457 ff. ZGB', url: fedlexUrl('ZGB', '457'), verified: true },
      // Art. 470 f. ZGB – verfügbare Quote / Pflichtteil
      { label: 'Art. 470 f. ZGB', url: fedlexUrl('ZGB', '470'), verified: true },
    ],
    href: '/rechner/erbteilung',
    keywords: ['Erbe', 'Pflichtteil', 'Testament', 'Erbteilung', 'verfügbare Quote', 'Todesfall', 'Ehegatte'],
    related: ['eigenhaendiges-testament', 'erbvertrag'],
    icon: 'scale',
  },

  // ════ II — Beträge & Quoten (in Vorbereitung) ════
  prozesskosten: {
    id: 'prozesskosten', modus: 'rechner', art: 'betrag', tier: 'experte', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Gerichts-, Partei- & Betreibungskosten',
    description: 'Kostenschätzung nach Streitwert und Tarif; kantonale Tarife werden gekennzeichnet.',
    status: 'geplant', norms: [],
  },
  streitwert: {
    id: 'streitwert', modus: 'rechner', art: 'betrag', tier: 'experte', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Streitwertberechnung',
    description: 'Ermittlung des Streitwerts als Grundlage für Kosten und Verfahrensart.',
    status: 'geplant', norms: [],
  },
  'arbeit-entschaedigung': {
    id: 'arbeit-entschaedigung', modus: 'rechner', art: 'betrag', tier: 'experte', rechtsgebiet: 'Arbeit',
    title: 'Arbeitsrechtliche Entschädigungen & Zuschläge',
    description: 'Überstunden, Ferienlohn, 13. Monatslohn pro rata sowie Entschädigung bei missbräuchlicher oder fristloser Kündigung.',
    status: 'geplant', norms: [],
  },
  'erb-ausgleichung': {
    id: 'erb-ausgleichung', modus: 'rechner', art: 'betrag', tier: 'experte', rechtsgebiet: 'Erbrecht',
    title: 'Erbrechtliche Ausgleichung & Güterrecht',
    description: 'Ausgleichung und Hinzurechnung sowie güterrechtliche Auseinandersetzung als Vorstufe.',
    status: 'geplant', norms: [],
  },
  mietzinsanpassung: {
    id: 'mietzinsanpassung', modus: 'rechner', art: 'betrag', tier: 'experte', rechtsgebiet: 'Miete',
    title: 'Mietzinsanpassung (Referenzzinssatz)',
    description: 'Anpassung des Mietzinses nach Referenzzinssatz, Teuerung und Kostensteigerung.',
    status: 'geplant', norms: [],
  },
  vorsorgeausgleich: {
    id: 'vorsorgeausgleich', modus: 'rechner', art: 'betrag', tier: 'experte', rechtsgebiet: 'Familie',
    title: 'Vorsorgeausgleich (BVG) bei Scheidung',
    description: 'Teilung der während der Ehe geäufneten Austrittsleistungen der beruflichen Vorsorge.',
    status: 'geplant', norms: [],
  },
  existenzminimum: {
    id: 'existenzminimum', modus: 'rechner', art: 'betrag', tier: 'experte', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    title: 'Existenzminimum & Pfändungsquote',
    description: 'Ermittlung des pfändbaren Betrags; Richtlinien- und kantonsabhängig.',
    status: 'geplant', norms: [],
  },
  'verzugszins-vertieft': {
    id: 'verzugszins-vertieft', modus: 'rechner', art: 'betrag', tier: 'experte', rechtsgebiet: 'Vertrag / OR',
    title: 'Verzugszins — vertieft (Anrechnung & vereinbarter Satz)',
    description: 'Verzugszins mit vertraglichem oder gesetzlichem Satz, Teilzahlungen und Anrechnung.',
    status: 'geplant', norms: [],
  },

  // ════ III — Zuständigkeit & Einordnung (in Vorbereitung) ════
  gerichtsstand: {
    id: 'gerichtsstand', modus: 'rechner', art: 'zuordnung', tier: 'experte', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Örtliche Zuständigkeit / Gerichtsstand',
    description: 'Bestimmung des örtlich zuständigen Gerichts im Zivilprozess.',
    status: 'geplant', norms: [],
  },
  verfahrensart: {
    id: 'verfahrensart', modus: 'rechner', art: 'zuordnung', tier: 'experte', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Sachliche Zuständigkeit & Verfahrensart',
    description: 'Ordentliches, vereinfachtes oder summarisches Verfahren nach Streitwert und Materie.',
    status: 'geplant', norms: [],
  },
  schlichtung: {
    id: 'schlichtung', modus: 'rechner', art: 'zuordnung', tier: 'experte', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Schlichtungspflicht & Schlichtungsbehörde',
    description: 'Ob ein Schlichtungsverfahren erforderlich ist und welche Behörde zuständig ist.',
    status: 'geplant', norms: [],
  },
  iprg: {
    id: 'iprg', modus: 'rechner', art: 'zuordnung', tier: 'experte', rechtsgebiet: 'Internationales Privatrecht',
    title: 'Anwendbares Recht (IPRG)',
    description: 'Anwendbares Recht und Gerichtsstand bei internationalem Bezug.',
    status: 'geplant', norms: [],
  },

  // ════ IV — Werkzeuge (in Vorbereitung) ════
  tagerechner: {
    id: 'tagerechner', modus: 'rechner', art: 'werkzeug', tier: 'frei', rechtsgebiet: 'übergreifend',
    title: 'Fristen- & Tagerechner',
    description: 'Tage und Monate ab einem Datum, mit Wochenend- und Feiertagsverschiebung.',
    status: 'geplant', norms: [],
  },
  'ferien-checker': {
    id: 'ferien-checker', modus: 'rechner', art: 'werkzeug', tier: 'experte', rechtsgebiet: 'übergreifend',
    title: 'Gerichts- & Betreibungsferien-Checker',
    description: 'Prüft, ob ein Datum in Gerichts- oder Betreibungsferien fällt.',
    status: 'geplant', norms: [],
  },
  teuerungsrechner: {
    id: 'teuerungsrechner', modus: 'rechner', art: 'werkzeug', tier: 'experte', rechtsgebiet: 'übergreifend',
    title: 'Teuerungsrechner (LIK-Indexierung)',
    description: 'Anpassung von Beträgen nach dem Landesindex der Konsumentenpreise.',
    status: 'geplant', norms: [],
  },
  'ferien-assistent': {
    id: 'ferien-assistent', modus: 'rechner', art: 'werkzeug', tier: 'experte', rechtsgebiet: 'übergreifend',
    title: 'Friststillstand- & Ferien-Assistent (alle Verfahren)',
    description: 'Stillstand und Gerichts-/Betreibungsferien über ZPO, StPO, BGG und Verwaltungsverfahren.',
    status: 'geplant', norms: [],
  },
};

// ─── Vorlagen-Katalog (Modus «Vorlagen»; Start: alle «In Vorbereitung») ────
//
// Normentreue: geplante Vorlagen ohne Norm-Pills und ohne Artikel-/Tages-
// angaben; schemaId erst bei Status «geprüft». Cross-Links via `related`
// modusübergreifend (Vorlage ↔ Rechner).

const VORLAGEN: Record<string, VorlageCard> = {
  // ════ I — Vorsorge & Nachlass ════
  'eigenhaendiges-testament': {
    id: 'eigenhaendiges-testament', modus: 'vorlage', art: 'vorsorge', tier: 'frei', rechtsgebiet: 'Erbrecht',
    title: 'Eigenhändiges Testament',
    description: 'Letztwillige Verfügung aus geprüften Bausteinen — als Mustertext zum eigenhändigen Abschreiben.',
    status: 'geplant', norms: [], related: ['erbteilung'],
    icon: 'document',
  },
  'oeffentliches-testament': {
    id: 'oeffentliches-testament', modus: 'vorlage', art: 'vorsorge', tier: 'frei', rechtsgebiet: 'Erbrecht',
    title: 'Öffentliches Testament',
    description: 'Vorbereitungsentwurf für die öffentliche Beurkundung bei der Urkundsperson.',
    status: 'geplant', norms: [], related: ['erbteilung'],
    icon: 'document',
  },
  erbvertrag: {
    id: 'erbvertrag', modus: 'vorlage', art: 'vorsorge', tier: 'frei', rechtsgebiet: 'Erbrecht',
    title: 'Erbvertrag',
    description: 'Entwurf für die vertragliche Nachlassregelung — zur Vorbereitung der Beurkundung.',
    status: 'geplant', norms: [], related: ['erbteilung'],
    icon: 'document',
  },
  vorsorgeauftrag: {
    id: 'vorsorgeauftrag', modus: 'vorlage', art: 'vorsorge', tier: 'frei', rechtsgebiet: 'Familie',
    title: 'Vorsorgeauftrag',
    description: 'Beauftragung für Personensorge, Vermögenssorge und Rechtsverkehr bei Urteilsunfähigkeit.',
    status: 'geplant', norms: [],
    icon: 'document',
  },
  patientenverfuegung: {
    id: 'patientenverfuegung', modus: 'vorlage', art: 'vorsorge', tier: 'frei', rechtsgebiet: 'Familie',
    title: 'Patientenverfügung',
    description: 'Festlegung medizinischer Massnahmen und vertretungsberechtigter Personen.',
    status: 'geplant', norms: [],
    icon: 'document',
  },

  // ════ II — Verträge ════
  arbeitsvertrag: {
    id: 'arbeitsvertrag', modus: 'vorlage', art: 'vertrag', tier: 'frei', rechtsgebiet: 'Arbeit',
    title: 'Arbeitsvertrag',
    description: 'Befristeter oder unbefristeter Einzelarbeitsvertrag mit den üblichen Wahlklauseln.',
    status: 'geplant', norms: [], related: ['lohnfortzahlung', 'kuendigung-sperrfristen'],
    icon: 'document',
  },
  'mietvertrag-wohnen': {
    id: 'mietvertrag-wohnen', modus: 'vorlage', art: 'vertrag', tier: 'frei', rechtsgebiet: 'Miete',
    title: 'Mietvertrag (Wohnen)',
    description: 'Wohnraummiete mit Nebenkosten-, Depot- und Kündigungsklauseln.',
    status: 'geplant', norms: [], related: ['mietrecht'],
    icon: 'house',
  },
  darlehensvertrag: {
    id: 'darlehensvertrag', modus: 'vorlage', art: 'vertrag', tier: 'frei', rechtsgebiet: 'Vertrag / OR',
    title: 'Darlehensvertrag',
    description: 'Privates Darlehen mit Zins-, Rückzahlungs- und Kündigungsregeln.',
    status: 'geplant', norms: [], related: ['verzugszins', 'rechtsoeffnungsbegehren'],
    icon: 'percent',
  },
  kaufvertrag: {
    id: 'kaufvertrag', modus: 'vorlage', art: 'vertrag', tier: 'frei', rechtsgebiet: 'Vertrag / OR',
    title: 'Einfacher Kaufvertrag',
    description: 'Kauf beweglicher Sachen mit Gewährleistungs- und Lieferklauseln.',
    status: 'geplant', norms: [], related: ['gewaehrleistung', 'verzugszins'],
    icon: 'clipboard',
  },

  // ════ III — Eingaben ════
  schlichtungsgesuch: {
    id: 'schlichtungsgesuch', modus: 'vorlage', art: 'eingabe', tier: 'experte', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Schlichtungsgesuch',
    description: 'Strukturiertes Gesuch an die Schlichtungsbehörde mit Rechtsbegehren und Beilagenliste.',
    status: 'geplant', norms: [], related: ['zpo-fristen', 'verjaehrung'],
    icon: 'clipboard',
  },
  'klage-vereinfacht': {
    id: 'klage-vereinfacht', modus: 'vorlage', art: 'eingabe', tier: 'experte', rechtsgebiet: 'Zivilprozess (ZPO)',
    title: 'Klage (vereinfachtes Verfahren)',
    description: 'Klagegerüst mit Rechtsbegehren, Sachverhalt und Beweisofferten — offene Punkte werden ausgewiesen.',
    status: 'geplant', norms: [], related: ['zpo-fristen'],
    icon: 'document',
  },
  einsprache: {
    id: 'einsprache', modus: 'vorlage', art: 'eingabe', tier: 'experte', rechtsgebiet: 'Strafverfahren (StPO)',
    title: 'Einsprache (Straf-/Verwaltungsbefehl)',
    description: 'Fristgerechte Einsprache mit Antrag und Begründungsgerüst.',
    status: 'geplant', norms: [],
    icon: 'document',
  },
  beschwerde: {
    id: 'beschwerde', modus: 'vorlage', art: 'eingabe', tier: 'experte', rechtsgebiet: 'Verwaltung & Steuern',
    title: 'Beschwerde',
    description: 'Verwaltungsbeschwerde mit Anträgen, Begründung und Beilagen.',
    status: 'geplant', norms: [],
    icon: 'document',
  },
  rechtsoeffnungsbegehren: {
    id: 'rechtsoeffnungsbegehren', modus: 'vorlage', art: 'eingabe', tier: 'experte', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    title: 'Rechtsöffnungsbegehren',
    description: 'Begehren um provisorische oder definitive Rechtsöffnung mit Forderungsnachweis.',
    status: 'geplant', norms: [], related: ['schkg-fristen', 'verzugszins'],
    icon: 'clipboard',
  },

  // ════ IV — Gesellschaftsdokumente ════
  'gmbh-gruendung': {
    id: 'gmbh-gruendung', modus: 'vorlage', art: 'gesellschaft', tier: 'experte', rechtsgebiet: 'Gesellschaftsrecht (OR)',
    title: 'GmbH-Gründungsunterlagen',
    description: 'Errichtungsakt, Statuten und Anmeldung — zur Vorbereitung der Beurkundung.',
    status: 'geplant', norms: [], related: ['gesellschaftsrecht-fristen'],
    icon: 'scale',
  },
  'ag-gruendung': {
    id: 'ag-gruendung', modus: 'vorlage', art: 'gesellschaft', tier: 'experte', rechtsgebiet: 'Gesellschaftsrecht (OR)',
    title: 'AG-Gründungsunterlagen',
    description: 'Errichtungsakt, Statuten und Anmeldung — zur Vorbereitung der Beurkundung.',
    status: 'geplant', norms: [], related: ['gesellschaftsrecht-fristen'],
    icon: 'scale',
  },
  statuten: {
    id: 'statuten', modus: 'vorlage', art: 'gesellschaft', tier: 'experte', rechtsgebiet: 'Gesellschaftsrecht (OR)',
    title: 'Statuten',
    description: 'Statuten für GmbH oder AG mit den üblichen Wahlbestimmungen.',
    status: 'geplant', norms: [],
    icon: 'scale',
  },
  'gv-vr-beschluss': {
    id: 'gv-vr-beschluss', modus: 'vorlage', art: 'gesellschaft', tier: 'experte', rechtsgebiet: 'Gesellschaftsrecht (OR)',
    title: 'GV-/VR-Beschluss',
    description: 'Beschlussprotokoll für Generalversammlung oder Verwaltungsrat.',
    status: 'geplant', norms: [],
    icon: 'scale',
  },
};

export function karte(id: string): CalculatorCard {
  return KARTEN[id] ?? VORLAGEN[id];
}

/** Flacher Katalog (beide Modi); Anzeige je Sektion: geprüfte zuerst, danach «In Vorbereitung». */
export const ALLE_KARTEN: CatalogItem[] = [...Object.values(KARTEN), ...Object.values(VORLAGEN)];
