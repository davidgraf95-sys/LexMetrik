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

// Ehrliches Status-Modell: kein Eintrag trägt «geprüft», bis fachlich geprüft.
//  'entwurf'  → gebaut, fachlich noch nicht geprüft (orange)
//  'geprüft'  → fachlich geprüft (Goldrand; aktuell nirgends vergeben)
//  'geplant'  → noch nicht gebaut, «In Vorbereitung» (gedämpft)
export type Status = 'entwurf' | 'geprüft' | 'geplant';
// Rechtsbereich: bei Rechnern Gliederungsachse (/pro), bei Vorlagen Filterwert
export type Rechtsbereich = 'privat' | 'oeffentlich' | 'straf' | 'uebergreifend';
export const istAktiv = (s: Status) => s !== 'geplant';
export type Modus = 'rechner' | 'vorlage'; // inhaltliche Hauptweiche (In-Page-Toggle)
export type Art = 'frist' | 'betrag' | 'zuordnung' | 'werkzeug'; // Rechner-Output-Typ → Sektion
export type VorlageArt = 'vorsorge' | 'vertrag' | 'eingabe' | 'gesellschaft' | 'korrespondenz'; // Dokument-Typ → Sektion/Filter
// Stufe (orthogonal zum Status): free = kostenlose Auswahl auf «/»;
// pro = vollständiger Katalog auf /pro (zeigt free UND pro).
// Zugangskontrolle (PayPal-Gate an der Pro-Bereichsgrenze) ist ein späterer,
// separater Schritt — solange PAYWALL_ACTIVE false ist, bleibt Pro offen.
export type Tier = 'free' | 'pro';
export const PAYWALL_ACTIVE = false;

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
  rechtsbereich: Rechtsbereich; // Rechner: Gliederung · Vorlagen: Filter
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
  // Konsolidierte Karten: abgedeckte Szenarien; 'geplant' = noch nicht gebaute Option
  szenarien?: { label: string; status: 'entwurf' | 'geplant' }[];
}

export interface VorlageCard extends BaseItem {
  modus: 'vorlage';
  art: VorlageArt;        // Dokument-Typ → bestimmt die Sektion
  schemaId?: string;      // Vorlagen-Schema (nur bei 'geprüft')
  formvorschrift?: string; // Kurzhinweis für die Karte, z. B. «Eigenhändig zu errichten»
  // Angebotene Download-Formate; 'xlsx' ist vorbereitet (Renderer andockbar),
  // wird aber noch nirgends ausgeliefert. Steuert die Buttons im Wizard.
  output?: ('pdf' | 'docx' | 'xlsx')[];
}

export type CatalogItem = RechnerCard | VorlageCard;
// Rückwärtskompatibler Alias (bestehende Importe)
export type CalculatorCard = CatalogItem;

// Sektions-Art → Modus (für modusabhängige Beschriftungen, keine fixen Strings)
export const istVorlageArt = (a: Art | VorlageArt): a is VorlageArt =>
  a === 'vorsorge' || a === 'vertrag' || a === 'eingabe' || a === 'gesellschaft' || a === 'korrespondenz';

export interface Sektion {
  art: Art | VorlageArt;
  id: string;            // Anker für Sprungmarken
  numeral: 'I' | 'II' | 'III' | 'IV' | 'V';
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

// Rechtsbereich-Sektionen: Gliederungsachse des Rechner-Modus auf /pro
// (zweistufig: Rechtsbereich → Output-Typ als Untergruppe)
export const RECHTSBEREICH_SEKTIONEN: { code: Rechtsbereich; id: string; title: string; lede: string }[] = [
  { code: 'privat', id: 'privatrecht', title: 'Privatrecht',
    lede: 'OR, ZGB, ZPO und SchKG — Fristen, Beträge und Zuständigkeit im Zivilrecht.' },
  { code: 'oeffentlich', id: 'oeffentliches-recht', title: 'Öffentliches Recht',
    lede: 'Verwaltungs-, Steuer- und Sozialversicherungsverfahren.' },
  { code: 'straf', id: 'strafrecht', title: 'Strafrecht',
    lede: 'Prozessuale und materielle Fristen im Strafrecht — eigene Fristmechanik.' },
  { code: 'uebergreifend', id: 'uebergreifend', title: 'Übergreifend',
    lede: 'Rechtsmittel ans Bundesgericht, Einordnung und Werkzeuge über alle Verfahren.' },
];

// Vorlagen-Sektionen: vier Dokument-Typen (Modus «Vorlagen»)
export const VORLAGE_SEKTIONEN: Sektion[] = [
  { art: 'vorsorge', id: 'vorsorge', numeral: 'I', title: 'Vorsorge & Nachlass',
    lede: 'Testament, Erbvertrag, Vorsorgeauftrag, Patientenverfügung — aus festen Bausteinen.' },
  { art: 'vertrag', id: 'vertraege', numeral: 'II', title: 'Verträge',
    lede: 'Arbeits-, Miet-, Darlehens- und Kaufverträge — Klausel für Klausel nachvollziehbar.' },
  { art: 'eingabe', id: 'eingaben', numeral: 'III', title: 'Eingaben',
    lede: 'Klagen, Gesuche, Einsprachen und Beschwerden — strukturierte Gerüste mit offenen Optionen.' },
  { art: 'gesellschaft', id: 'gesellschaft', numeral: 'IV', title: 'Gesellschaftsdokumente',
    lede: 'Gründungsunterlagen, Statuten und Beschlüsse — formbewusst zusammengestellt.' },
  { art: 'korrespondenz', id: 'korrespondenz', numeral: 'V', title: 'Schreiben & Erklärungen',
    lede: 'Kündigungen, Mahnungen, Begehren und einseitige Erklärungen — kurz und formgerecht.' },
];

// ─── Rechtsgebiete: primäre Katalog-Gliederung (Auftrag «Katalog-Ausbau» §4) ─
// Kanonische Namen + feste Reihenfolge; unter jedem Gebiet stehen die
// Untergruppen «Rechner» und «Vorlagen». Output-Typ ist seither nur Filter.
export const RECHTSGEBIET_SEKTIONEN: { name: string; id: string; lede: string }[] = [
  { name: 'Zivilprozess (ZPO) & Bundesgericht', id: 'zpo-bundesgericht',
    lede: 'Verfahren vor Schlichtungsbehörde, Gericht und Bundesgericht — Fristen, Kosten, Zuständigkeit, Eingaben.' },
  { name: 'Betreibung & Konkurs (SchKG)', id: 'schkg',
    lede: 'Vom Zahlungsbefehl bis zur Verwertung — Fristen, Existenzminimum und die zugehörigen Eingaben.' },
  { name: 'Arbeit', id: 'arbeit',
    lede: 'Arbeitsverhältnis von Beginn bis Beendigung — Fristen, Lohnansprüche, Verträge und Schreiben.' },
  { name: 'Miete', id: 'miete',
    lede: 'Wohn- und Geschäftsräume — Kündigung, Anfechtung, Mietzins und Vertrag.' },
  { name: 'Vertrag & Forderung (OR)', id: 'vertrag-or',
    lede: 'Forderungen durchsetzen und Verträge schliessen — Zins, Verjährung, Gewährleistung, Korrespondenz.' },
  { name: 'Erbrecht', id: 'erbrecht',
    lede: 'Nachlass planen und teilen — Pflichtteile, Fristen, Testament und Erbvertrag.' },
  { name: 'Vorsorge & Erwachsenenschutz', id: 'vorsorge-erwachsenenschutz',
    lede: 'Selbstbestimmt vorsorgen — Vorsorgeauftrag, Patientenverfügung und Vollmachten.' },
  { name: 'Familienrecht', id: 'familienrecht',
    lede: 'Trennung, Scheidung und Eltern-Vereinbarungen — Güterrecht, Vorsorgeausgleich, Fristen.' },
  { name: 'Gesellschaftsrecht', id: 'gesellschaftsrecht',
    lede: 'Gründung, Kapital und Beschlüsse — Quoten, Schwellen und Gesellschaftsdokumente.' },
  { name: 'Strafrecht & Strafprozess', id: 'strafrecht',
    lede: 'Strafverfahren und materielles Strafrecht — Fristen, Verjährung und Eingaben.' },
  { name: 'Verwaltungsrecht', id: 'verwaltungsrecht',
    lede: 'Verfügungen und Rechtsmittel im Verwaltungsverfahren — Fristen, Einsprache, Beschwerde.' },
  { name: 'Steuerrecht', id: 'steuerrecht',
    lede: 'Steuerverfahren und Spezialsteuern — Fristen und Berechnungen.' },
  { name: 'Sozialversicherungsrecht', id: 'sozialversicherungsrecht',
    lede: 'AHV, IV, UVG und ATSG-Verfahren — Fristen, Verwirkung und Beiträge.' },
  { name: 'Datenschutzrecht', id: 'datenschutzrecht',
    lede: 'Auskunft, Löschung und Fristen nach Datenschutzrecht.' },
  { name: 'Ausländerrecht', id: 'auslaenderrecht',
    lede: 'Ausländer- und asylrechtliche Verfahren — Fristen.' },
  { name: 'Weitere Rechtsgebiete', id: 'weitere-rechtsgebiete',
    lede: 'Immaterialgüterrecht, Sachenrecht und übergreifende Einordnung.' },
  { name: 'Übergreifende Werkzeuge', id: 'werkzeuge',
    lede: 'Hilfsrechner und Arbeitsmittel über alle Rechtsgebiete.' },
];

// Filterwerte/Cluster-Reihenfolge (abgeleitet aus den Sektionen).
export const RECHTSGEBIETE: string[] = RECHTSGEBIET_SEKTIONEN.map((g) => g.name);

// ─── Karten-Katalog (geprüft + geplant) ───────────────────────────────────

const KARTEN: Record<string, CalculatorCard> = {
  // ════ I — Fristen (geprüft) ════
  'zpo-fristen': {
    id: 'zpo-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Verfahrens- & Rechtsmittelfristen',
    szenarien: [
      { label: 'Rechtsmittel, Schlichtung, Erstinstanz (Phasen-Auswahl)', status: 'entwurf' },
      { label: 'Klagebewilligung — Geltungsdauer (Schlichtungs-Preset)', status: 'entwurf' },
      { label: 'Fristwiederherstellung (Art. 148 ZPO)', status: 'geplant' },
    ],
    description: 'Verfahrens- und Rechtsmittelfristen mit Gerichtsferien und Stillstand.',
    status: 'entwurf',
    norms: [
      // Art. 142–147 ZPO – Fristenlauf (Spanne: Anker auf führenden Artikel)
      { label: 'Art. 142–147 ZPO', url: fedlexUrl('ZPO', '142'), verified: false },
    ],
    href: '/rechner/zpo-fristen',
    related: ['schlichtungsgesuch', 'klage-vereinfacht'],
    keywords: ['Frist', 'Gericht', 'Berufung', 'Beschwerde', 'Klage', 'Gerichtsferien', 'Stillstand', 'Zustellung'],
    icon: 'clock',
  },
  'schkg-fristen': {
    id: 'schkg-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Betreibungs- & Konkursfristen',
    szenarien: [
      { label: 'Einleitung bis Konkurs (Verfahrensphasen)', status: 'entwurf' },
      { label: 'Rechtsöffnung, Aberkennung, Kollokation', status: 'entwurf' },
      { label: 'Arrest — Prosequierung', status: 'entwurf' },
    ],
    description: 'Fristen im Betreibungs- und Konkursverfahren mit Betreibungsferien (Art. 63 SchKG) und ZPO-Stillstand für gerichtliche Klagen.',
    status: 'entwurf',
    norms: [
      // Art. 56 SchKG – Rechtsstillstand
      { label: 'Art. 56 SchKG', url: fedlexUrl('SchKG', '56'), verified: false },
      // Art. 63 SchKG – Betreibungsferien
      { label: 'Art. 63 SchKG', url: fedlexUrl('SchKG', '63'), verified: false },
      // Art. 145 ZPO – Stillstand (Querverweis: ZPO-Basis, nicht SchKG)
      { label: 'Art. 145 ZPO', url: fedlexUrl('ZPO', '145'), verified: false },
    ],
    href: '/rechner/schkg-fristen',
    keywords: ['Betreibung', 'Zahlungsbefehl', 'Rechtsvorschlag', 'Konkurs', 'Pfändung', 'Betreibungsferien'],
    related: ['verzugszins', 'rechtsoeffnungsbegehren'],
    icon: 'clipboard',
  },
  'kuendigung-sperrfristen': {
    id: 'kuendigung-sperrfristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Arbeitsrecht — Fristen',
    szenarien: [
      { label: 'Kündigungs- & Sperrfristen (Art. 335c/336c OR)', status: 'entwurf' },
      { label: 'Anfechtung missbräuchlicher Kündigung', status: 'geplant' },
      { label: 'Massenentlassung — Konsultationsfristen', status: 'geplant' },
    ],
    description: 'Ordentliche Kündigungsfristen und Sperrfristen (Kündigung zur Unzeit) im Arbeitsverhältnis.',
    status: 'entwurf',
    norms: [
      // Art. 335c OR – ordentliche Kündigungsfristen
      { label: 'Art. 335c OR', url: fedlexUrl('OR', '335c'), verified: false },
      // Art. 336c OR – Kündigung zur Unzeit (Sperrfristen)
      { label: 'Art. 336c OR', url: fedlexUrl('OR', '336c'), verified: false },
    ],
    href: '/rechner/kuendigung#kuendigung',
    keywords: ['gekündigt', 'Kündigung', 'Probezeit', 'Sperrfrist', 'Krankheit', 'Unfall', 'Schwangerschaft', 'Militär'],
    related: ['lohnfortzahlung', 'arbeitsvertrag'],
    icon: 'document',
  },
  mietrecht: {
    id: 'mietrecht', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Miete',
    rechtsbereich: 'privat',
    title: 'Mietrecht — Fristen',
    szenarien: [
      { label: 'Kündigung, Termine & Zahlungsverzug', status: 'entwurf' },
      { label: 'Anfechtung & Erstreckung', status: 'geplant' },
    ],
    description: 'Kündigungstermine und -fristen für Wohn- und Geschäftsräume — mit Termin-Hierarchie, Formprüfung und ausserordentlichen Kündigungen.',
    status: 'entwurf',
    norms: [
      // Art. 266a–o OR – Kündigungstermine/-fristen (Spanne: Anker auf führenden Artikel)
      { label: 'Art. 266a–o OR', url: fedlexUrl('OR', '266a'), verified: false },
      // Art. 257d OR – Zahlungsrückstand
      { label: 'Art. 257d OR', url: fedlexUrl('OR', '257d'), verified: false },
      // Art. 257f OR – Sorgfaltspflichtverletzung
      { label: 'Art. 257f OR', url: fedlexUrl('OR', '257f'), verified: false },
    ],
    href: '/rechner/mietrecht',
    keywords: ['Mietwohnung', 'Wohnung kündigen', 'Kündigungstermin', 'Vermieter', 'Mieter', 'Geschäftsraum'],
    related: ['mietvertrag-wohnen'],
    icon: 'house',
  },

  // ════ I — Fristen (in Vorbereitung) ════
  'beschwerde-verwaltung': {
    id: 'beschwerde-verwaltung', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Verwaltungs- & Steuerverfahren — Fristen',
    description: 'Einsprache- und Beschwerdefristen im Verwaltungs- und Steuerverfahren — nicht eidgenössisch vereinheitlicht; kantonale Vielfalt wird gekennzeichnet.',
    status: 'geplant', norms: [],
  },
  strafverfahren: {
    id: 'strafverfahren', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'StPO-Fristen',
    description: 'Einsprache gegen Strafbefehl und Rechtsmittelfristen — eigene Fristmechanik ohne Gerichtsferien-Stillstand.',
    status: 'geplant', norms: [],
  },
  sozialversicherung: {
    id: 'sozialversicherung', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Sozialversicherungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Sozialversicherung (ATSG) — Fristen',
    description: 'Einsprache- und Beschwerdefristen sowie Leistungsverwirkung und Nachzahlung — IV, AHV, Unfall- und Krankenversicherung.',
    status: 'geplant', norms: [],
  },
  verjaehrung: {
    id: 'verjaehrung', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Verjährung',
    description: 'Ordentliche und kurze Verjährung sowie deliktische und bereicherungsrechtliche Ansprüche — mit Stillstand, Unterbrechung und Einredeverzicht.',
    status: 'entwurf',
    norms: [
      // Art. 60 OR – unerlaubte Handlung (3/10 bzw. 3/20 Jahre)
      { label: 'Art. 60 OR', url: fedlexUrl('OR', '60'), verified: false },
      // Art. 67 OR – ungerechtfertigte Bereicherung (3/10 Jahre)
      { label: 'Art. 67 OR', url: fedlexUrl('OR', '67'), verified: false },
      // Art. 127–142 OR – Verjährungsordnung (Spanne: Anker auf führenden Artikel)
      { label: 'Art. 127–142 OR', url: fedlexUrl('OR', '127'), verified: false },
    ],
    href: '/rechner/verjaehrung',
    keywords: ['Verjährung', 'verjährt', 'Frist', 'Forderung', 'unerlaubte Handlung', 'Bereicherung', 'Unterbrechung', 'Verzicht', 'Einrede'],
    related: ['verzugszins', 'rechtsoeffnungsbegehren'],
    icon: 'clock',
  },
  gewaehrleistung: {
    id: 'gewaehrleistung', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Gewährleistung & Mängelrüge',
    description: 'Rüge- und Verjährungsfristen bei Kauf, Werkvertrag und Grundstückkauf — mit Zwei-Regime-Weiche zur Baumängel-Revision 2026.',
    status: 'entwurf',
    norms: [
      // Art. 201 OR – Prüf-/Rügeobliegenheit (inkl. Abs. 4 neu)
      { label: 'Art. 201 OR', url: fedlexUrl('OR', '201'), verified: false },
      // Art. 210 OR – Verjährung Kauf
      { label: 'Art. 210 OR', url: fedlexUrl('OR', '210'), verified: false },
      // Art. 219a OR – Grundstückkauf (neu, in Kraft 1.1.2026)
      { label: 'Art. 219a OR', url: fedlexUrl('OR', '219a'), verified: false },
      // Art. 367 OR – Prüfung/Rüge Werkvertrag (inkl. Abs. 1bis neu)
      { label: 'Art. 367 OR', url: fedlexUrl('OR', '367'), verified: false },
      // Art. 371 OR – Verjährung Werkvertrag (inkl. Abs. 3 neu)
      { label: 'Art. 371 OR', url: fedlexUrl('OR', '371'), verified: false },
    ],
    href: '/rechner/gewaehrleistung',
    keywords: ['Mangel', 'Mängelrüge', 'Garantie', 'Gewährleistung', 'Kauf', 'Werkvertrag', 'Baumängel', 'Rüge', 'Abnahme', 'SIA'],
    related: ['verjaehrung', 'kaufvertrag'],
    icon: 'house',
  },
  'erbrecht-fristen': {
    id: 'erbrecht-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Erbrecht — Fristen',
    description: 'Fristen für Ausschlagung der Erbschaft, Herabsetzungs- und Ungültigkeitsklage.',
    status: 'geplant', norms: [],
  },
  'familie-fristen': {
    id: 'familie-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Familienrechtliche Fristen',
    description: 'Fristen bei Scheidung und Anfechtung des Kindesverhältnisses.',
    status: 'geplant', norms: [],
  },
  'gesellschaftsrecht-fristen': {
    id: 'gesellschaftsrecht-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Gesellschaftsrechtliche Fristen',
    description: 'Einberufungs- und Traktandierungsfristen sowie Verjährung der Verantwortlichkeitsklage.',
    status: 'geplant', norms: [],
  },
  'bgg-fristen': {
    id: 'bgg-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'uebergreifend',
    title: 'Beschwerde ans Bundesgericht (BGG)',
    description: 'Beschwerdefristen ans Bundesgericht in Zivil-, Straf- und öffentlich-rechtlichen Sachen, inkl. Stillstand.',
    status: 'geplant', norms: [],
  },
  strafantrag: {
    id: 'strafantrag', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Strafantragsfrist',
    description: 'Frist zur Stellung des Strafantrags bei Antragsdelikten.',
    status: 'geplant', norms: [],
  },
  'straf-verjaehrung': {
    id: 'straf-verjaehrung', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Strafrechtliche Verjährung',
    description: 'Verfolgungs- und Vollstreckungsverjährung nach Strafrahmen.',
    status: 'geplant', norms: [],
  },
  bauhandwerkerpfandrecht: {
    id: 'bauhandwerkerpfandrecht', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Weitere Rechtsgebiete',
    rechtsbereich: 'privat',
    title: 'Bauhandwerkerpfandrecht — Eintragungsfrist',
    description: 'Frist zur Eintragung des gesetzlichen Bauhandwerkerpfandrechts.',
    status: 'geplant', norms: [],
  },

  // ════ II — Beträge & Quoten (geprüft) ════
  verzugszins: {
    id: 'verzugszins', modus: 'rechner', art: 'betrag', tier: 'free', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Verzugszins',
    description: 'Verzugszins bei Schuldnerverzug — Zeitraum, Satz und Betrag.',
    status: 'entwurf',
    norms: [
      // Art. 104 OR – Verzugszins
      { label: 'Art. 104 OR', url: fedlexUrl('OR', '104'), verified: false },
    ],
    href: '/rechner/verzugszins',
    keywords: ['Rechnung', 'Verzug', 'Zins', 'Mahnung', 'offene Forderung', '5 Prozent'],
    related: ['schkg-fristen', 'darlehensvertrag'],
    icon: 'percent',
  },
  lohnfortzahlung: {
    id: 'lohnfortzahlung', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Lohnfortzahlung (kantonale Skala)',
    description: 'Lohnfortzahlung bei unverschuldeter Verhinderung nach kantonaler Skala (Basel/Bern/Zürich).',
    status: 'entwurf',
    norms: [
      // Art. 324a OR – Lohnfortzahlung bei Verhinderung
      { label: 'Art. 324a OR', url: fedlexUrl('OR', '324a'), verified: false },
    ],
    href: '/rechner/kuendigung#lohnfortzahlung',
    keywords: ['krank', 'Lohnfortzahlung', 'Arztzeugnis', 'Arbeitsunfähigkeit', 'Taggeld', 'Skala'],
    related: ['kuendigung-sperrfristen', 'arbeitsvertrag'],
    icon: 'document',
  },
  erbteilung: {
    id: 'erbteilung', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Pflichtteil & verfügbare Quote',
    description: 'Gesetzliche Erbteile, Pflichtteile und verfügbare Quote — mit Todesdatum-Weiche für die Revision 2023 und güterrechtlicher Vorstufe.',
    status: 'entwurf',
    norms: [
      // Art. 457 ff. ZGB – gesetzliche Erben (Folgeverweis: Anker auf führenden Artikel)
      { label: 'Art. 457 ff. ZGB', url: fedlexUrl('ZGB', '457'), verified: false },
      // Art. 470 f. ZGB – verfügbare Quote / Pflichtteil
      { label: 'Art. 470 f. ZGB', url: fedlexUrl('ZGB', '470'), verified: false },
    ],
    href: '/rechner/erbteilung',
    keywords: ['Erbe', 'Pflichtteil', 'Testament', 'Erbteilung', 'verfügbare Quote', 'Todesfall', 'Ehegatte'],
    related: ['eigenhaendiges-testament', 'erbvertrag'],
    icon: 'scale',
  },

  // ════ II — Beträge & Quoten (in Vorbereitung) ════
  prozesskosten: {
    id: 'prozesskosten', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Gerichts-, Partei- & Betreibungskosten',
    description: 'Kostenschätzung nach Streitwert und Tarif; kantonale Tarife werden gekennzeichnet.',
    status: 'geplant', norms: [],
  },
  streitwert: {
    id: 'streitwert', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Streitwertberechnung',
    description: 'Ermittlung des Streitwerts als Grundlage für Kosten und Verfahrensart.',
    status: 'geplant', norms: [],
  },
  'arbeit-entschaedigung': {
    id: 'arbeit-entschaedigung', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Arbeitsrechtliche Entschädigungen & Zuschläge',
    description: 'Überstunden, Ferienlohn, 13. Monatslohn pro rata sowie Entschädigung bei missbräuchlicher oder fristloser Kündigung.',
    status: 'geplant', norms: [],
  },
  'erb-ausgleichung': {
    id: 'erb-ausgleichung', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Erbrechtliche Ausgleichung & Güterrecht',
    description: 'Ausgleichung und Hinzurechnung sowie güterrechtliche Auseinandersetzung als Vorstufe.',
    status: 'geplant', norms: [],
  },
  mietzinsanpassung: {
    id: 'mietzinsanpassung', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Miete',
    rechtsbereich: 'privat',
    title: 'Mietzinsanpassung (Referenzzinssatz)',
    description: 'Anpassung des Mietzinses nach Referenzzinssatz, Teuerung und Kostensteigerung.',
    status: 'geplant', norms: [],
  },
  vorsorgeausgleich: {
    id: 'vorsorgeausgleich', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Vorsorgeausgleich (BVG) bei Scheidung',
    description: 'Teilung der während der Ehe geäufneten Austrittsleistungen der beruflichen Vorsorge.',
    status: 'geplant', norms: [],
  },
  existenzminimum: {
    id: 'existenzminimum', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Existenzminimum & Pfändungsquote',
    description: 'Ermittlung des pfändbaren Betrags; Richtlinien- und kantonsabhängig.',
    status: 'geplant', norms: [],
  },

  // ════ III — Zuständigkeit & Einordnung (in Vorbereitung) ════
  gerichtsstand: {
    id: 'gerichtsstand', modus: 'rechner', art: 'zuordnung', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Örtliche Zuständigkeit / Gerichtsstand',
    description: 'Bestimmung des örtlich zuständigen Gerichts im Zivilprozess.',
    status: 'geplant', norms: [],
  },
  verfahrensart: {
    id: 'verfahrensart', modus: 'rechner', art: 'zuordnung', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Sachliche Zuständigkeit & Verfahrensart',
    description: 'Ordentliches, vereinfachtes oder summarisches Verfahren nach Streitwert und Materie.',
    status: 'geplant', norms: [],
  },
  schlichtung: {
    id: 'schlichtung', modus: 'rechner', art: 'zuordnung', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Schlichtungspflicht & Schlichtungsbehörde',
    description: 'Ob ein Schlichtungsverfahren erforderlich ist und welche Behörde zuständig ist.',
    status: 'geplant', norms: [],
  },
  iprg: {
    id: 'iprg', modus: 'rechner', art: 'zuordnung', tier: 'pro', rechtsgebiet: 'Weitere Rechtsgebiete',
    rechtsbereich: 'uebergreifend',
    title: 'Anwendbares Recht (IPRG)',
    description: 'Anwendbares Recht und Gerichtsstand bei internationalem Bezug.',
    status: 'geplant', norms: [],
  },

  // ════ IV — Werkzeuge (in Vorbereitung) ════
  tagerechner: {
    id: 'tagerechner', modus: 'rechner', art: 'werkzeug', tier: 'free', rechtsgebiet: 'Übergreifende Werkzeuge',
    rechtsbereich: 'uebergreifend',
    title: 'Fristen- & Tagerechner',
    description: 'Tage und Monate ab einem Datum, mit Wochenend- und Feiertagsverschiebung.',
    status: 'geplant', norms: [],
  },
  'ferien-checker': {
    id: 'ferien-checker', modus: 'rechner', art: 'werkzeug', tier: 'pro', rechtsgebiet: 'Übergreifende Werkzeuge',
    rechtsbereich: 'uebergreifend',
    title: 'Gerichts- & Betreibungsferien-Checker',
    description: 'Prüft, ob ein Datum in Gerichts- oder Betreibungsferien fällt.',
    status: 'geplant', norms: [],
  },
  teuerungsrechner: {
    id: 'teuerungsrechner', modus: 'rechner', art: 'werkzeug', tier: 'free', rechtsgebiet: 'Übergreifende Werkzeuge',
    rechtsbereich: 'uebergreifend',
    title: 'Teuerungsrechner (LIK-Indexierung)',
    description: 'Anpassung von Beträgen nach dem Landesindex der Konsumentenpreise.',
    status: 'geplant', norms: [],
  },
  'ferien-assistent': {
    id: 'ferien-assistent', modus: 'rechner', art: 'werkzeug', tier: 'pro', rechtsgebiet: 'Übergreifende Werkzeuge',
    rechtsbereich: 'uebergreifend',
    title: 'Friststillstand- & Ferien-Assistent (alle Verfahren)',
    description: 'Stillstand und Gerichts-/Betreibungsferien über ZPO, StPO, BGG und Verwaltungsverfahren.',
    status: 'geplant', norms: [],
  },

  // ════ Katalog-Ausbau Phase 3: geplante Rechner gemäss KATALOG-ROADMAP ════
  // «In Vorbereitung»: bewusst ohne Norm-Pills, ohne Artikel-/Tagesangaben
  // (Normentreue) — Normen folgen erst mit dem Bau (geplant → entwurf).

  // — Zivilprozess (ZPO) & Bundesgericht —
  bundesgerichtsgebuehren: {
    id: 'bundesgerichtsgebuehren', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'uebergreifend',
    title: 'Bundesgerichtsgebühren',
    description: 'Gerichtsgebühren der eidgenössischen Gerichte nach Streitwert und Verfahrensart.',
    status: 'geplant', norms: [],
    keywords: ['BGer', 'BVGer', 'BStGer', 'BPatGer', 'Gerichtsgebühren'],
  },
  kostenvorschuss: {
    id: 'kostenvorschuss', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Kostenvorschuss',
    description: 'Vorschuss auf die Gerichtskosten im Zivilprozess.',
    status: 'geplant', norms: [],
    keywords: ['Vorschuss', 'Gerichtskosten'],
  },
  'parteientschaedigung-sicherheit': {
    id: 'parteientschaedigung-sicherheit', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Sicherheit für die Parteientschädigung',
    description: 'Sicherstellung der Parteientschädigung bei besonderen Risiken auf Klägerseite.',
    status: 'geplant', norms: [],
    keywords: ['Kaution', 'Sicherstellung', 'Parteientschädigung'],
  },
  rechtsmittelpruefung: {
    id: 'rechtsmittelpruefung', modus: 'rechner', art: 'zuordnung', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'uebergreifend',
    title: 'Rechtsmittelprüfung',
    description: 'Welches Rechtsmittel gegen welchen Entscheid offensteht — Weg, Instanz und Anforderungen.',
    status: 'geplant', norms: [],
    keywords: ['Berufung', 'Beschwerde', 'Revision', 'Rechtsmittel'],
  },

  // — Arbeit —
  ferienanspruch: {
    id: 'ferienanspruch', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Ferienanspruch',
    description: 'Ferienguthaben nach Alter, Pensum und Ein- oder Austritt im Dienstjahr.',
    status: 'geplant', norms: [],
    keywords: ['Ferien', 'Ferienguthaben', 'pro rata'],
  },
  ferienkuerzung: {
    id: 'ferienkuerzung', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Ferienkürzung',
    description: 'Kürzung des Ferienanspruchs bei längeren Absenzen.',
    status: 'geplant', norms: [],
    keywords: ['Ferien', 'Kürzung', 'Absenz', 'Krankheit'],
  },
  'dreizehnter-monatslohn': {
    id: 'dreizehnter-monatslohn', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Anteiliger 13. Monatslohn',
    description: 'Pro-rata-Anteil des 13. Monatslohns bei unterjährigem Ein- oder Austritt.',
    status: 'geplant', norms: [],
    keywords: ['13. Monatslohn', 'pro rata', 'Austritt'],
  },
  'ueberstunden-zuschlag': {
    id: 'ueberstunden-zuschlag', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Überstunden- & Überzeitzuschlag',
    description: 'Vergütung von Überstunden und Überzeit samt Zuschlägen.',
    status: 'geplant', norms: [],
    keywords: ['Überstunden', 'Überzeit', 'Zuschlag', 'Kompensation'],
  },

  // — Vertrag & Forderung (OR) —
  schadenszins: {
    id: 'schadenszins', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Schadenszins',
    description: 'Zins auf Schadenersatzforderungen vom Schadenseintritt bis zur Zahlung.',
    status: 'geplant', norms: [],
    keywords: ['Schadenszins', 'Schadenersatz', 'Zins'],
  },
  'widerruf-konsum': {
    id: 'widerruf-konsum', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Widerrufsrechte (Konsum)',
    description: 'Widerrufsfristen bei Konsumgeschäften — Beginn, Dauer und Form.',
    status: 'geplant', norms: [],
    keywords: ['Widerruf', 'Konsumkredit', 'Haustürgeschäft'],
  },

  // — Familienrecht —
  'gueterrecht-vorschlag': {
    id: 'gueterrecht-vorschlag', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Güterrechtliche Auseinandersetzung / Vorschlag',
    description: 'Aufteilung von Errungenschaft und Vorschlag bei Auflösung des Güterstands.',
    status: 'geplant', norms: [],
    keywords: ['Güterrecht', 'Errungenschaft', 'Vorschlag'],
  },

  // — Gesellschaftsrecht —
  beteiligungsquoten: {
    id: 'beteiligungsquoten', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Beteiligungs- & Stimmrechtsquoten',
    description: 'Kapital- und Stimmenanteile sowie Schwellen für Beschlüsse und Rechte.',
    status: 'geplant', norms: [],
    keywords: ['Quorum', 'Stimmrecht', 'Beteiligung', 'Schwelle'],
  },
  liberierungsgrad: {
    id: 'liberierungsgrad', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Liberierungsgrad',
    description: 'Einbezahltes Kapital im Verhältnis zum Nennkapital.',
    status: 'geplant', norms: [],
    keywords: ['Liberierung', 'Aktienkapital', 'Stammkapital'],
  },
  kapitalverlust: {
    id: 'kapitalverlust', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Kapitalverlust',
    description: 'Feststellung eines Kapitalverlusts und der daran geknüpften Handlungspflichten.',
    status: 'geplant', norms: [],
    keywords: ['Kapitalverlust', 'Sanierung', 'Aktienrecht', 'GmbH'],
  },
  ueberschuldung: {
    id: 'ueberschuldung', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Überschuldung',
    description: 'Prüfung der Überschuldung und der Pflichten des Verwaltungsrats.',
    status: 'geplant', norms: [],
    keywords: ['Überschuldung', 'Benachrichtigung', 'Bilanz'],
  },
  kapitalerhoehung: {
    id: 'kapitalerhoehung', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Kapitalerhöhung',
    description: 'Arten und Schritte der Kapitalerhöhung mit den massgebenden Quoten.',
    status: 'geplant', norms: [],
    keywords: ['Kapitalerhöhung', 'Bezugsrecht'],
  },

  // — Strafrecht & Strafprozess —
  haftfristen: {
    id: 'haftfristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Haftfristen',
    description: 'Fristen rund um Untersuchungs- und Sicherheitshaft.',
    status: 'geplant', norms: [],
    keywords: ['Haft', 'Untersuchungshaft', 'Haftverlängerung'],
  },
  'straf-zustaendigkeit': {
    id: 'straf-zustaendigkeit', modus: 'rechner', art: 'zuordnung', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Örtliche Zuständigkeit im Strafverfahren',
    description: 'Gerichtsstand im Strafverfahren nach Tatort und Beteiligten.',
    status: 'geplant', norms: [],
    keywords: ['Gerichtsstand', 'Tatort', 'Zuständigkeit'],
  },

  // — Verwaltungsrecht —
  'baurecht-fristen': {
    id: 'baurecht-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Bau- & planungsrechtliche Fristen',
    description: 'Einsprache- und Beschwerdefristen in Bau- und Planungsverfahren.',
    status: 'geplant', norms: [],
    keywords: ['Baubewilligung', 'Einsprache', 'Nutzungsplanung'],
  },
  'vergabe-fristen': {
    id: 'vergabe-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Vergaberechtliche Beschwerdefristen',
    description: 'Fristen im öffentlichen Beschaffungswesen.',
    status: 'geplant', norms: [],
    keywords: ['Vergabe', 'Submission', 'Beschwerde'],
  },

  // — Steuerrecht — (Steuerverfahrens-Fristen deckt der bestehende Rechner
  //   «Verwaltungs- & Steuerverfahren — Fristen» ab; nicht gedoppelt)
  'steuer-verjaehrung': {
    id: 'steuer-verjaehrung', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Steuerrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Steuerrechtliche Verjährung',
    description: 'Veranlagungs- und Bezugsverjährung im Steuerrecht.',
    status: 'geplant', norms: [],
    keywords: ['Verjährung', 'Veranlagung', 'Bezug'],
  },
  verrechnungssteuer: {
    id: 'verrechnungssteuer', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Steuerrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Verrechnungssteuer',
    description: 'Abzug und Rückerstattung der Verrechnungssteuer.',
    status: 'geplant', norms: [],
    keywords: ['Verrechnungssteuer', 'Rückerstattung'],
  },
  grundstueckgewinnsteuer: {
    id: 'grundstueckgewinnsteuer', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Steuerrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Grundstückgewinn- & Handänderungssteuer (kantonal)',
    description: 'Kantonale Steuern bei der Veräusserung von Grundstücken.',
    status: 'geplant', norms: [],
    keywords: ['Grundstückgewinn', 'Handänderung', 'kantonal'],
  },

  // — Sozialversicherungsrecht —
  'ahv-beitraege': {
    id: 'ahv-beitraege', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Sozialversicherungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'AHV-Beiträge',
    description: 'Beiträge an AHV/IV/EO für Angestellte, Selbständige und Nichterwerbstätige.',
    status: 'geplant', norms: [],
    keywords: ['AHV', 'IV', 'EO', 'Beiträge'],
  },

  // — Datenschutzrecht —
  'datenschutz-fristen': {
    id: 'datenschutz-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Datenschutzrecht',
    rechtsbereich: 'privat',
    title: 'Datenschutzrechtliche Fristen',
    description: 'Fristen rund um Auskunft, Meldung und Aufbewahrung.',
    status: 'geplant', norms: [],
    keywords: ['Datenschutz', 'DSG', 'Auskunft'],
  },

  // — Ausländerrecht —
  'auslaenderrecht-fristen': {
    id: 'auslaenderrecht-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Ausländerrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Ausländer- & asylrechtliche Fristen',
    description: 'Fristen in ausländer- und asylrechtlichen Verfahren.',
    status: 'geplant', norms: [],
    keywords: ['Migrationsrecht', 'Asyl', 'Bewilligung'],
  },

  // — Weitere Rechtsgebiete —
  markenwiderspruch: {
    id: 'markenwiderspruch', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Weitere Rechtsgebiete',
    rechtsbereich: 'privat',
    title: 'Markenwiderspruch (Frist)',
    description: 'Widerspruchsfrist nach Veröffentlichung einer Markeneintragung.',
    status: 'geplant', norms: [],
    keywords: ['Marke', 'Widerspruch', 'IGE'],
  },

  // — Übergreifende Werkzeuge —
  checklisten: {
    id: 'checklisten', modus: 'rechner', art: 'werkzeug', tier: 'pro', rechtsgebiet: 'Übergreifende Werkzeuge',
    rechtsbereich: 'uebergreifend',
    title: 'Checklisten',
    description: 'Strukturierte Prüf- und Arbeitslisten für wiederkehrende Abläufe.',
    status: 'geplant', norms: [],
    keywords: ['Checkliste', 'Ablauf'],
  },
  mandatsaufnahme: {
    id: 'mandatsaufnahme', modus: 'rechner', art: 'werkzeug', tier: 'pro', rechtsgebiet: 'Übergreifende Werkzeuge',
    rechtsbereich: 'uebergreifend',
    title: 'Mandatsaufnahme-Formular',
    description: 'Strukturierte Erfassung der Eckdaten eines neuen Mandats.',
    status: 'geplant', norms: [],
    keywords: ['Mandat', 'Aufnahme', 'Konflikt-Check'],
  },
  'kostenblatt-export': {
    id: 'kostenblatt-export', modus: 'rechner', art: 'werkzeug', tier: 'pro', rechtsgebiet: 'Übergreifende Werkzeuge',
    rechtsbereich: 'uebergreifend',
    title: 'Kostenblatt-Export',
    description: 'Zusammenstellung von Kosten und Auslagen als Exportblatt.',
    status: 'geplant', norms: [],
    keywords: ['Kosten', 'Auslagen', 'Export'],
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
    id: 'eigenhaendiges-testament', modus: 'vorlage', art: 'vorsorge', tier: 'free', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Eigenhändiges Testament',
    description: 'Letztwillige Verfügung aus festen Bausteinen — mit Pflichtteils-Kontrolle, Bausteinprotokoll und Form-Gate; Ausgabe als Mustertext zum eigenhändigen Abschreiben.',
    status: 'entwurf',
    norms: [
      // Art. 505 ZGB – Form der eigenhändigen Verfügung (Handschrift, Datum, Unterschrift)
      { label: 'Art. 505 ZGB', url: fedlexUrl('ZGB', '505'), verified: false },
      // Art. 467 ZGB – Testierfähigkeit
      { label: 'Art. 467 ZGB', url: fedlexUrl('ZGB', '467'), verified: false },
      // Art. 471 ZGB – Pflichtteil (Fassung in Kraft seit 1.1.2023)
      { label: 'Art. 471 ZGB', url: fedlexUrl('ZGB', '471'), verified: false },
      // Art. 483 ZGB – Erbeinsetzung
      { label: 'Art. 483 ZGB', url: fedlexUrl('ZGB', '483'), verified: false },
      // Art. 484 ZGB – Vermächtnis
      { label: 'Art. 484 ZGB', url: fedlexUrl('ZGB', '484'), verified: false },
    ],
    href: '/vorlagen/testament',
    schemaId: 'testament-eigenhaendig',
    formvorschrift: 'Eigenhändig abzuschreiben — von Hand, datiert, unterschrieben',
    output: ['pdf'],
    keywords: ['Testament', 'letztwillige Verfügung', 'Erbe', 'Pflichtteil', 'Vermächtnis', 'Willensvollstrecker', 'handschriftlich'],
    related: ['erbteilung'],
    icon: 'document',
  },
  'oeffentliches-testament': {
    id: 'oeffentliches-testament', modus: 'vorlage', art: 'vorsorge', tier: 'pro', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Öffentliches Testament',
    description: 'Vorbereitungsentwurf für die öffentliche Beurkundung bei der Urkundsperson.',
    status: 'geplant', norms: [], related: ['erbteilung'],
    icon: 'document',
  },
  erbvertrag: {
    id: 'erbvertrag', modus: 'vorlage', art: 'vorsorge', tier: 'pro', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Erbvertrag',
    description: 'Entwurf für die vertragliche Nachlassregelung — zur Vorbereitung der Beurkundung.',
    status: 'geplant', norms: [], related: ['erbteilung'],
    icon: 'document',
  },
  vorsorgeauftrag: {
    id: 'vorsorgeauftrag', modus: 'vorlage', art: 'vorsorge', tier: 'free', rechtsgebiet: 'Vorsorge & Erwachsenenschutz',
    rechtsbereich: 'privat',
    title: 'Vorsorgeauftrag',
    description: 'Personensorge, Vermögenssorge und Vertretung im Rechtsverkehr bei Urteilsunfähigkeit — mit Form-Weiche (eigenhändig oder beurkundet), Sondervollmachten und KESB-Hinweisen.',
    status: 'entwurf',
    norms: [
      // Art. 360 ZGB – Grundsatz (Aufgabenbereiche, Weisungen, Ersatzverfügung)
      { label: 'Art. 360 ZGB', url: fedlexUrl('ZGB', '360'), verified: false },
      // Art. 361 ZGB – Form (eigenhändig oder öffentlich beurkundet)
      { label: 'Art. 361 ZGB', url: fedlexUrl('ZGB', '361'), verified: false },
      // Art. 363 ZGB – Validierung durch die KESB
      { label: 'Art. 363 ZGB', url: fedlexUrl('ZGB', '363'), verified: false },
      // Art. 396 OR – Sondervollmacht (Grundstücke, Vergleich, Schiedsabrede)
      { label: 'Art. 396 OR', url: fedlexUrl('OR', '396'), verified: false },
    ],
    href: '/vorlagen/vorsorgeauftrag',
    schemaId: 'vorsorgeauftrag',
    formvorschrift: 'Eigenhändig abzuschreiben ODER öffentlich zu beurkunden',
    // DOCX nur für den Beurkundungs-Entwurf — Gate im Wizard (Form-Vorrang)
    output: ['pdf', 'docx'],
    keywords: ['Vorsorgeauftrag', 'Urteilsunfähigkeit', 'Personensorge', 'Vermögenssorge', 'KESB', 'Validierung', 'Beistandschaft'],
    related: ['patientenverfuegung', 'eigenhaendiges-testament'],
    icon: 'document',
  },
  patientenverfuegung: {
    id: 'patientenverfuegung', modus: 'vorlage', art: 'vorsorge', tier: 'free', rechtsgebiet: 'Vorsorge & Erwachsenenschutz',
    rechtsbereich: 'privat',
    title: 'Patientenverfügung',
    description: 'Medizinische Massnahmen, Behandlungsziel und Vertretungsperson — mit Konsistenz-Prüfung und Form-Gate; am Computer erstellbar, handschriftlich zu unterschreiben.',
    status: 'entwurf',
    norms: [
      // Art. 370 ZGB – Grundsatz (Massnahmen, Vertretungsperson, Ersatzverfügung)
      { label: 'Art. 370 ZGB', url: fedlexUrl('ZGB', '370'), verified: false },
      // Art. 371 ZGB – Errichtung und Widerruf (schriftlich, datiert, unterzeichnet)
      { label: 'Art. 371 ZGB', url: fedlexUrl('ZGB', '371'), verified: false },
      // Art. 372 ZGB – Verbindlichkeit bei Urteilsunfähigkeit
      { label: 'Art. 372 ZGB', url: fedlexUrl('ZGB', '372'), verified: false },
      // Art. 378 ZGB – gesetzliche Vertretungskaskade
      { label: 'Art. 378 ZGB', url: fedlexUrl('ZGB', '378'), verified: false },
    ],
    href: '/vorlagen/patientenverfuegung',
    schemaId: 'patientenverfuegung',
    formvorschrift: 'Schriftlich — ausdrucken, handschriftlich datieren und unterschreiben',
    // Schriftform mit Unterschrift → DOCX unproblematisch (Pilot Teil II)
    output: ['pdf', 'docx'],
    keywords: ['Patientenverfügung', 'medizinische Massnahmen', 'Urteilsunfähigkeit', 'Reanimation', 'Vertretungsperson', 'Organspende', 'Behandlungsziel'],
    related: ['vorsorgeauftrag'],
    icon: 'document',
  },

  // ════ II — Verträge ════
  arbeitsvertrag: {
    id: 'arbeitsvertrag', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Arbeitsvertrag',
    description: 'Befristeter oder unbefristeter Einzelarbeitsvertrag mit den üblichen Wahlklauseln.',
    status: 'geplant', norms: [], related: ['lohnfortzahlung', 'kuendigung-sperrfristen'],
    icon: 'document',
  },
  'mietvertrag-wohnen': {
    id: 'mietvertrag-wohnen', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Miete',
    rechtsbereich: 'privat',
    title: 'Mietvertrag (Wohnen)',
    description: 'Wohnraummiete mit Nebenkosten-, Depot- und Kündigungsklauseln.',
    status: 'geplant', norms: [], related: ['mietrecht'],
    icon: 'house',
  },
  darlehensvertrag: {
    id: 'darlehensvertrag', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Darlehensvertrag',
    description: 'Privates Darlehen mit Zins-, Rückzahlungs- und Kündigungsregeln.',
    status: 'geplant', norms: [], related: ['verzugszins', 'rechtsoeffnungsbegehren'],
    icon: 'percent',
  },
  kaufvertrag: {
    id: 'kaufvertrag', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Einfacher Kaufvertrag',
    description: 'Kauf beweglicher Sachen mit Gewährleistungs- und Lieferklauseln.',
    status: 'geplant', norms: [], related: ['gewaehrleistung', 'verzugszins'],
    icon: 'clipboard',
  },

  // ════ III — Eingaben ════
  schlichtungsgesuch: {
    id: 'schlichtungsgesuch', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Schlichtungsgesuch (Basel-Stadt)',
    description: 'Stellt ein Schlichtungsgesuch nach festen Bausteinen für die Basler Schlichtungsbehörden zusammen — Parteien, Zuständigkeits-Routing, Rechtsbegehren, Streitgegenstand, Beilagen.',
    // Abweichung von der Auftrags-Anweisung (status: 'geplant') offengelegt:
    // Nach dem neueren Status-Modell-Auftrag erhalten GEBAUTE, fachlich noch
    // nicht geprüfte Einträge 'entwurf' (orange, verified: false) — als
    // 'geplant' wäre die Vorlage im Katalog nicht erreichbar.
    status: 'entwurf',
    norms: [
      // Art. 202 ZPO – Schlichtungsgesuch (Pflichtinhalt) — Anker build-verifiziert, fachlich offen
      { label: 'Art. 202 ZPO', url: fedlexUrl('ZPO', '202'), verified: false },
      // Art. 130 ZPO – Form (Papier/Signatur)
      { label: 'Art. 130 ZPO', url: fedlexUrl('ZPO', '130'), verified: false },
      // Art. 209 ZPO – Klagebewilligung
      { label: 'Art. 209 ZPO', url: fedlexUrl('ZPO', '209'), verified: false },
      // Art. 212 ZPO – Entscheid der Schlichtungsbehörde
      { label: 'Art. 212 ZPO', url: fedlexUrl('ZPO', '212'), verified: false },
    ],
    href: '/vorlagen/schlichtungsgesuch-bs',
    schemaId: 'schlichtungsgesuch-bs',
    formvorschrift: 'Schriftlich in Papierform, eigenhändig zu unterzeichnen',
    output: ['pdf', 'docx'],
    keywords: ['Schlichtung', 'Schlichtungsgesuch', 'Vermittlung', 'Klagebewilligung', 'Art. 202 ZPO', 'Basel', 'Rechtsbegehren'],
    related: ['zpo-fristen', 'verjaehrung', 'ferien-assistent'],
    icon: 'clipboard',
  },
  'klage-vereinfacht': {
    id: 'klage-vereinfacht', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Klage (vereinfachtes Verfahren)',
    description: 'Klagegerüst mit Rechtsbegehren, Sachverhalt und Beweisofferten — offene Punkte werden ausgewiesen.',
    status: 'geplant', norms: [], related: ['zpo-fristen'],
    icon: 'document',
  },
  einsprache: {
    id: 'einsprache', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Einsprache (Straf-/Verwaltungsbefehl)',
    description: 'Fristgerechte Einsprache mit Antrag und Begründungsgerüst.',
    status: 'geplant', norms: [],
    icon: 'document',
  },
  beschwerde: {
    id: 'beschwerde', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Beschwerde',
    description: 'Verwaltungsbeschwerde mit Anträgen, Begründung und Beilagen.',
    status: 'geplant', norms: [],
    icon: 'document',
  },
  rechtsoeffnungsbegehren: {
    id: 'rechtsoeffnungsbegehren', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Rechtsöffnungsbegehren',
    description: 'Begehren um provisorische oder definitive Rechtsöffnung mit Forderungsnachweis.',
    status: 'geplant', norms: [], related: ['schkg-fristen', 'verzugszins'],
    icon: 'clipboard',
  },

  // ════ IV — Gesellschaftsdokumente ════
  'gmbh-gruendung': {
    id: 'gmbh-gruendung', modus: 'vorlage', art: 'gesellschaft', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'GmbH-Gründungsunterlagen',
    description: 'Errichtungsakt, Statuten und Anmeldung — zur Vorbereitung der Beurkundung.',
    status: 'geplant', norms: [], related: ['gesellschaftsrecht-fristen'],
    icon: 'scale',
  },
  'ag-gruendung': {
    id: 'ag-gruendung', modus: 'vorlage', art: 'gesellschaft', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'AG-Gründungsunterlagen',
    description: 'Errichtungsakt, Statuten und Anmeldung — zur Vorbereitung der Beurkundung.',
    status: 'geplant', norms: [], related: ['gesellschaftsrecht-fristen'],
    icon: 'scale',
  },
  statuten: {
    id: 'statuten', modus: 'vorlage', art: 'gesellschaft', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Statuten',
    description: 'Statuten für GmbH oder AG mit den üblichen Wahlbestimmungen.',
    status: 'geplant', norms: [],
    icon: 'scale',
  },
  'gv-vr-beschluss': {
    id: 'gv-vr-beschluss', modus: 'vorlage', art: 'gesellschaft', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'GV-/VR-Beschluss',
    description: 'Beschlussprotokoll für Generalversammlung oder Verwaltungsrat.',
    status: 'geplant', norms: [],
    icon: 'scale',
  },

  // ════ Katalog-Ausbau Phase 3: geplante Vorlagen gemäss KATALOG-ROADMAP ════
  // «In Vorbereitung»: ohne Norm-Pills, ohne Artikel-/Tagesangaben.
  // «Strukturiertes Gerüst» = Roadmap-Markierung [Gerüst] (Würdigungsanteil).

  // — Betreibung & Konkurs (SchKG) —
  rechtsvorschlag: {
    id: 'rechtsvorschlag', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Rechtsvorschlag',
    description: 'Erklärung des Rechtsvorschlags gegen den Zahlungsbefehl.',
    status: 'geplant', norms: [],
    keywords: ['Rechtsvorschlag', 'Zahlungsbefehl', 'Betreibung'],
  },
  aberkennungsklage: {
    id: 'aberkennungsklage', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Aberkennungsklage',
    description: 'Strukturiertes Gerüst für die Aberkennungsklage nach provisorischer Rechtsöffnung.',
    status: 'geplant', norms: [],
    keywords: ['Aberkennung', 'Rechtsöffnung'],
  },
  arrestgesuch: {
    id: 'arrestgesuch', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Arrestgesuch',
    description: 'Strukturiertes Gerüst für das Arrestgesuch.',
    status: 'geplant', norms: [],
    keywords: ['Arrest', 'Sicherung'],
  },
  'schkg-beschwerde': {
    id: 'schkg-beschwerde', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Beschwerde gegen Betreibungs- & Konkursämter',
    description: 'Strukturiertes Gerüst für die betreibungsrechtliche Beschwerde an die Aufsichtsbehörde.',
    status: 'geplant', norms: [],
    keywords: ['Beschwerde', 'Aufsichtsbehörde', 'Betreibungsamt'],
  },

  // — Arbeit —
  'kuendigung-arbeitgeber': {
    id: 'kuendigung-arbeitgeber', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Kündigung durch den Arbeitgeber',
    description: 'Kündigungsschreiben des Arbeitgebers mit den üblichen Bestandteilen.',
    status: 'geplant', norms: [],
    keywords: ['Kündigung', 'Arbeitsverhältnis', 'Kündigungsschreiben'],
  },
  'kuendigung-arbeitnehmer': {
    id: 'kuendigung-arbeitnehmer', modus: 'vorlage', art: 'korrespondenz', tier: 'free', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Kündigung durch den Arbeitnehmer',
    description: 'Kündigungsschreiben der Arbeitnehmerin oder des Arbeitnehmers.',
    status: 'geplant', norms: [],
    keywords: ['Kündigung', 'Arbeitsverhältnis', 'Kündigungsschreiben'],
  },
  freistellung: {
    id: 'freistellung', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Freistellung',
    description: 'Strukturiertes Gerüst für die Freistellungserklärung.',
    status: 'geplant', norms: [],
    keywords: ['Freistellung'],
  },
  verwarnung: {
    id: 'verwarnung', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Verwarnung',
    description: 'Strukturiertes Gerüst für die arbeitsrechtliche Verwarnung.',
    status: 'geplant', norms: [],
    keywords: ['Verwarnung', 'Abmahnung'],
  },
  arbeitszeugnis: {
    id: 'arbeitszeugnis', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Arbeitszeugnis',
    description: 'Strukturiertes Gerüst für Voll- und Zwischenzeugnisse.',
    status: 'geplant', norms: [],
    keywords: ['Zeugnis', 'Zwischenzeugnis'],
  },
  aufhebungsvereinbarung: {
    id: 'aufhebungsvereinbarung', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Aufhebungsvereinbarung',
    description: 'Strukturiertes Gerüst für die einvernehmliche Beendigung des Arbeitsverhältnisses.',
    status: 'geplant', norms: [],
    keywords: ['Aufhebungsvertrag', 'Saldoklausel'],
  },

  // — Vertrag & Forderung (OR) —
  mahnung: {
    id: 'mahnung', modus: 'vorlage', art: 'korrespondenz', tier: 'free', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Mahnung',
    description: 'Zahlungsaufforderung mit Fristansetzung.',
    status: 'geplant', norms: [],
    keywords: ['Mahnung', 'Zahlungsverzug', 'Frist'],
  },
  inverzugsetzung: {
    id: 'inverzugsetzung', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Inverzugsetzung',
    description: 'Erklärung, die die Schuldnerin oder den Schuldner in Verzug setzt.',
    status: 'geplant', norms: [],
    keywords: ['Verzug', 'Mahnung'],
  },
  schuldanerkennung: {
    id: 'schuldanerkennung', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Schuldanerkennung',
    description: 'Schriftliche Anerkennung einer Schuld als Grundlage der späteren Durchsetzung.',
    status: 'geplant', norms: [],
    keywords: ['Schuldanerkennung', 'Rechtsöffnung'],
  },
  vergleichsvereinbarung: {
    id: 'vergleichsvereinbarung', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Vergleichsvereinbarung',
    description: 'Strukturiertes Gerüst für den aussergerichtlichen Vergleich.',
    status: 'geplant', norms: [],
    keywords: ['Vergleich', 'Saldoklausel'],
  },

  // — Erbrecht —
  erbverzichtsvertrag: {
    id: 'erbverzichtsvertrag', modus: 'vorlage', art: 'vorsorge', tier: 'pro', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Erbverzichtsvertrag',
    description: 'Verzicht auf die Erbenstellung — Entwurf zur öffentlichen Beurkundung.',
    status: 'geplant', norms: [],
    formvorschrift: 'Öffentliche Beurkundung',
    keywords: ['Erbverzicht', 'Beurkundung'],
  },
  erbteilungsvereinbarung: {
    id: 'erbteilungsvereinbarung', modus: 'vorlage', art: 'vorsorge', tier: 'pro', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Erbteilungsvereinbarung',
    description: 'Strukturiertes Gerüst für die Teilung des Nachlasses unter den Erbinnen und Erben.',
    status: 'geplant', norms: [],
    keywords: ['Erbteilung', 'Teilungsvertrag'],
  },

  // — Vorsorge & Erwachsenenschutz —
  generalvollmacht: {
    id: 'generalvollmacht', modus: 'vorlage', art: 'vorsorge', tier: 'free', rechtsgebiet: 'Vorsorge & Erwachsenenschutz',
    rechtsbereich: 'privat',
    title: 'Generalvollmacht',
    description: 'Umfassende Vollmacht zur Vertretung in persönlichen und vermögensrechtlichen Angelegenheiten.',
    status: 'geplant', norms: [],
    keywords: ['Vollmacht', 'Vertretung'],
  },
  bankvollmacht: {
    id: 'bankvollmacht', modus: 'vorlage', art: 'vorsorge', tier: 'free', rechtsgebiet: 'Vorsorge & Erwachsenenschutz',
    rechtsbereich: 'privat',
    title: 'Bankvollmacht',
    description: 'Vollmacht für die Vertretung gegenüber Finanzinstituten.',
    status: 'geplant', norms: [],
    keywords: ['Vollmacht', 'Bank', 'Konto'],
  },

  // — Familienrecht —
  trennungsvereinbarung: {
    id: 'trennungsvereinbarung', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Trennungsvereinbarung',
    description: 'Strukturiertes Gerüst für die Regelung des Getrenntlebens.',
    status: 'geplant', norms: [],
    keywords: ['Trennung', 'Getrenntleben'],
  },
  scheidungskonvention: {
    id: 'scheidungskonvention', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Scheidungskonvention',
    description: 'Strukturiertes Gerüst für die Vereinbarung der Scheidungsfolgen.',
    status: 'geplant', norms: [],
    keywords: ['Scheidung', 'Konvention'],
  },
  elternvereinbarung: {
    id: 'elternvereinbarung', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Elternvereinbarung',
    description: 'Strukturiertes Gerüst zu Obhut, Betreuung und Unterhalt.',
    status: 'geplant', norms: [],
    keywords: ['Eltern', 'Obhut', 'Betreuung'],
  },

  // — Strafrecht & Strafprozess —
  strafanzeige: {
    id: 'strafanzeige', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Strafanzeige',
    description: 'Anzeige eines Sachverhalts an die Strafverfolgungsbehörden.',
    status: 'geplant', norms: [],
    keywords: ['Anzeige', 'Staatsanwaltschaft'],
  },
  'strafantrag-vorlage': {
    id: 'strafantrag-vorlage', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Strafantrag',
    description: 'Strafantrag der berechtigten Person bei Antragsdelikten.',
    status: 'geplant', norms: [],
    keywords: ['Strafantrag', 'Antragsdelikt'],
  },
  akteneinsichtsgesuch: {
    id: 'akteneinsichtsgesuch', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Akteneinsichtsgesuch',
    description: 'Gesuch um Einsicht in die Verfahrensakten.',
    status: 'geplant', norms: [],
    keywords: ['Akteneinsicht', 'Verfahrensakten'],
  },
  entschaedigungsbegehren: {
    id: 'entschaedigungsbegehren', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Entschädigungsbegehren',
    description: 'Strukturiertes Gerüst für Entschädigungs- und Genugtuungsbegehren im Strafverfahren.',
    status: 'geplant', norms: [],
    keywords: ['Entschädigung', 'Genugtuung'],
  },
  adhaesionsklage: {
    id: 'adhaesionsklage', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Adhäsionsklage',
    description: 'Strukturiertes Gerüst für Zivilansprüche im Strafverfahren.',
    status: 'geplant', norms: [],
    keywords: ['Adhäsion', 'Zivilanspruch'],
  },

  // — Verwaltungsrecht — (Einsprache deckt die bestehende Vorlage
  //   «Einsprache (Straf-/Verwaltungsbefehl)» ab; nicht gedoppelt)
  rekurs: {
    id: 'rekurs', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Rekurs',
    description: 'Strukturiertes Gerüst für den kantonalen Rekurs.',
    status: 'geplant', norms: [],
    keywords: ['Rekurs', 'Rechtsmittel'],
  },

  // — Datenschutzrecht —
  auskunftsbegehren: {
    id: 'auskunftsbegehren', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Datenschutzrecht',
    rechtsbereich: 'privat',
    title: 'Auskunftsbegehren (Datenschutz)',
    description: 'Begehren um Auskunft über die Bearbeitung eigener Personendaten.',
    status: 'geplant', norms: [],
    keywords: ['Auskunft', 'Datenschutz', 'Personendaten'],
  },
  loeschungsbegehren: {
    id: 'loeschungsbegehren', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Datenschutzrecht',
    rechtsbereich: 'privat',
    title: 'Löschungsbegehren (Datenschutz)',
    description: 'Begehren um Löschung von Personendaten.',
    status: 'geplant', norms: [],
    keywords: ['Löschung', 'Datenschutz', 'Personendaten'],
  },
};

export function karte(id: string): CalculatorCard {
  return KARTEN[id] ?? VORLAGEN[id];
}

/** Flacher Katalog (beide Modi); Anzeige je Sektion: geprüfte zuerst, danach «In Vorbereitung». */
export const ALLE_KARTEN: CatalogItem[] = [...Object.values(KARTEN), ...Object.values(VORLAGEN)];
