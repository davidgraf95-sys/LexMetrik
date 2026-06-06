// ─── Startseiten-Konfiguration: vier Output-Typen + flacher Katalog ───────
//
// Single source of truth für die Startseiten-Karten. Die Detailseiten und
// die /rechner-Übersicht nutzen weiterhin src/lib/calculators.ts.
//
// Normentreue: Geprüfte Karten tragen ihre verifizierten Norm-Pills
// (Fedlex-Anker gegen den konsolidierten Volltext nachgewiesen, s. fedlex()).
// Geplante Karten («In Vorbereitung») tragen KEINE Artikel-Pills und keine
// Artikel-/Tagesangaben in der Beschreibung – nur Titel + neutrale
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
// Zugangskontrolle (Zahlungs-Gate an der Pro-Bereichsgrenze; Zahlungssystem
// noch nicht definiert) ist ein späterer,
// separater Schritt – solange PAYWALL_ACTIVE false ist, bleibt Pro offen.
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
    lede: 'Prozessuale und materielle Fristen – vom auslösenden Ereignis bis zum letzten Tag.' },
  { art: 'betrag', id: 'betraege', numeral: 'II', title: 'Beträge & Quoten',
    lede: 'Geldansprüche, Zinsen, Kosten und Quoten – Franken für Franken hergeleitet.' },
  { art: 'zuordnung', id: 'zustaendigkeit', numeral: 'III', title: 'Zuständigkeit & Einordnung',
    lede: 'Welches Gericht, welches Recht, welche Verfahrensart – rechtsbasiert bestimmt.' },
  { art: 'werkzeug', id: 'werkzeuge', numeral: 'IV', title: 'Werkzeuge',
    lede: 'Rechtsgebietsübergreifende Hilfsrechner.' },
];

// Rechtsbereich-Sektionen: Gliederungsachse des Rechner-Modus auf /pro
// (zweistufig: Rechtsbereich → Output-Typ als Untergruppe)
export const RECHTSBEREICH_SEKTIONEN: { code: Rechtsbereich; id: string; title: string; lede: string }[] = [
  { code: 'privat', id: 'privatrecht', title: 'Privatrecht',
    lede: 'OR, ZGB, ZPO und SchKG – Fristen, Beträge und Zuständigkeit im Zivilrecht.' },
  { code: 'oeffentlich', id: 'oeffentliches-recht', title: 'Öffentliches Recht',
    lede: 'Verwaltungs-, Steuer- und Sozialversicherungsverfahren.' },
  { code: 'straf', id: 'strafrecht', title: 'Strafrecht',
    lede: 'Prozessuale und materielle Fristen im Strafrecht – eigene Fristmechanik.' },
  { code: 'uebergreifend', id: 'uebergreifend', title: 'Übergreifend',
    lede: 'Rechtsmittel ans Bundesgericht, Einordnung und Werkzeuge über alle Verfahren.' },
];

// Vorlagen-Sektionen: vier Dokument-Typen (Modus «Vorlagen»)
export const VORLAGE_SEKTIONEN: Sektion[] = [
  { art: 'vorsorge', id: 'vorsorge', numeral: 'I', title: 'Vorsorge & Nachlass',
    lede: 'Testament, Erbvertrag, Vorsorgeauftrag, Patientenverfügung – aus festen Bausteinen.' },
  { art: 'vertrag', id: 'vertraege', numeral: 'II', title: 'Verträge',
    lede: 'Arbeits-, Miet-, Darlehens- und Kaufverträge – Klausel für Klausel nachvollziehbar.' },
  { art: 'eingabe', id: 'eingaben', numeral: 'III', title: 'Eingaben',
    lede: 'Klagen, Gesuche, Einsprachen und Beschwerden – strukturierte Gerüste mit offenen Optionen.' },
  { art: 'gesellschaft', id: 'gesellschaft', numeral: 'IV', title: 'Gesellschaftsdokumente',
    lede: 'Gründungsunterlagen, Statuten und Beschlüsse – formbewusst zusammengestellt.' },
  { art: 'korrespondenz', id: 'korrespondenz', numeral: 'V', title: 'Schreiben & Erklärungen',
    lede: 'Kündigungen, Mahnungen, Begehren und einseitige Erklärungen – kurz und formgerecht.' },
];

// ─── Rechtsgebiete: primäre Katalog-Gliederung (Auftrag «Katalog-Ausbau» §4) ─
// Kanonische Namen + feste Reihenfolge; unter jedem Gebiet stehen die
// Untergruppen «Rechner» und «Vorlagen». Output-Typ ist seither nur Filter.
export const RECHTSGEBIET_SEKTIONEN: { name: string; id: string; lede: string }[] = [
  { name: 'Zivilprozess (ZPO) & Bundesgericht', id: 'zpo-bundesgericht',
    lede: 'Verfahren vor Schlichtungsbehörde, Gericht und Bundesgericht – Fristen, Kosten, Zuständigkeit, Eingaben.' },
  { name: 'Betreibung & Konkurs (SchKG)', id: 'schkg',
    lede: 'Vom Zahlungsbefehl bis zur Verwertung – Fristen, Existenzminimum und die zugehörigen Eingaben.' },
  { name: 'Arbeit', id: 'arbeit',
    lede: 'Arbeitsverhältnis von Beginn bis Beendigung – Fristen, Lohnansprüche, Verträge und Schreiben.' },
  { name: 'Miete', id: 'miete',
    lede: 'Wohn- und Geschäftsräume – Kündigung, Anfechtung, Mietzins und Vertrag.' },
  { name: 'Vertrag & Forderung (OR)', id: 'vertrag-or',
    lede: 'Forderungen durchsetzen und Verträge schliessen – Zins, Verjährung, Gewährleistung, Korrespondenz.' },
  { name: 'Erbrecht', id: 'erbrecht',
    lede: 'Nachlass planen und teilen – Pflichtteile, Fristen, Testament und Erbvertrag.' },
  { name: 'Vorsorge & Erwachsenenschutz', id: 'vorsorge-erwachsenenschutz',
    lede: 'Selbstbestimmt vorsorgen – Vorsorgeauftrag, Patientenverfügung und Vollmachten.' },
  { name: 'Familienrecht', id: 'familienrecht',
    lede: 'Trennung, Scheidung und Eltern-Vereinbarungen – Güterrecht, Vorsorgeausgleich, Fristen.' },
  { name: 'Gesellschaftsrecht', id: 'gesellschaftsrecht',
    lede: 'Gründung, Kapital und Beschlüsse – Quoten, Schwellen und Gesellschaftsdokumente.' },
  { name: 'Strafrecht & Strafprozess', id: 'strafrecht',
    lede: 'Strafverfahren und materielles Strafrecht – Fristen, Verjährung und Eingaben.' },
  { name: 'Verwaltungsrecht', id: 'verwaltungsrecht',
    lede: 'Verfügungen und Rechtsmittel im Verwaltungsverfahren – Fristen, Einsprache, Beschwerde.' },
  { name: 'Steuerrecht', id: 'steuerrecht',
    lede: 'Steuerverfahren und Spezialsteuern – Fristen und Berechnungen.' },
  { name: 'Sozialversicherungsrecht', id: 'sozialversicherungsrecht',
    lede: 'AHV, IV, UVG und ATSG-Verfahren – Fristen, Verwirkung und Beiträge.' },
  { name: 'Datenschutzrecht', id: 'datenschutzrecht',
    lede: 'Auskunft, Löschung und Fristen nach Datenschutzrecht.' },
  { name: 'Ausländerrecht', id: 'auslaenderrecht',
    lede: 'Ausländer- und asylrechtliche Verfahren – Fristen.' },
  { name: 'Weitere Rechtsgebiete', id: 'weitere-rechtsgebiete',
    lede: 'Immaterialgüterrecht, Sachenrecht und übergreifende Einordnung.' },
  { name: 'Übergreifende Werkzeuge', id: 'werkzeuge',
    lede: 'Hilfsrechner und Arbeitsmittel über alle Rechtsgebiete.' },
];

// Filterwerte/Cluster-Reihenfolge (abgeleitet aus den Sektionen).
export const RECHTSGEBIETE: string[] = RECHTSGEBIET_SEKTIONEN.map((g) => g.name);

// ─── Karten-Katalog (geprüft + geplant) ───────────────────────────────────

const KARTEN: Record<string, CalculatorCard> = {
  // ════ I – Fristen (geprüft) ════
  'zpo-fristen': {
    id: 'zpo-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Verfahrens- & Rechtsmittelfristen',
    szenarien: [
      { label: 'Rechtsmittel, Schlichtung, Erstinstanz (Phasen-Auswahl)', status: 'entwurf' },
      { label: 'Klagebewilligung – Geltungsdauer (Schlichtungs-Preset)', status: 'entwurf' },
      { label: 'Fristwiederherstellung (Art. 148 ZPO)', status: 'geplant' },
    ],
    description: 'Verfahrens- und Rechtsmittelfristen mit Gerichtsferien und Stillstand.',
    status: 'entwurf',
    norms: [
      // Art. 142–147 ZPO – Fristenlauf (Spanne: Anker auf führenden Artikel)
      { label: 'Art. 142–147 ZPO', url: fedlexUrl('ZPO', '142'), verified: false },
    ],
    href: '/rechner/zpo-fristen',
    related: ['schlichtungsgesuch', 'klage-vereinfacht', 'tagerechner'],
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
      { label: 'Arrest – Prosequierung', status: 'entwurf' },
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
    related: ['verzugszins', 'rechtsoeffnungsbegehren', 'tagerechner'],
    icon: 'clipboard',
  },
  // Katalog-Split 6.6.2026 (Auftrag David): Der Zuständigkeitsrechner deckt
  // drei Rechtswege ab (Zivil/SchKG/Straf, je eigene Engine). Statt EINER
  // unterdeklarierten Karte erhält jeder Rechtsweg seinen Gebiets-Einstieg
  // (Muster kuendigung-sperrfristen/lohnfortzahlung: Hash-Anker → Vorauswahl).
  'schkg-zustaendigkeit': {
    id: 'schkg-zustaendigkeit', modus: 'rechner', art: 'zuordnung', tier: 'pro', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Zuständigkeit in der Betreibung (Ort · Stelle · Anliegen)',
    description: 'Betreibungsort nach Art. 46–55 SchKG und zuständige Stelle (Betreibungsamt, Gericht oder Aufsichtsbehörde) für elf Anliegen – von der Einleitung über Rechtsöffnung und Arrest bis zur Beschwerde, mit Verwirkungsfristen-Hinweisen.',
    status: 'entwurf',
    norms: [
      // Art. 46 SchKG – ordentlicher Betreibungsort (Wohnsitz/Sitz)
      { label: 'Art. 46 SchKG', url: fedlexUrl('SchKG', '46'), verified: false },
      // Art. 17 SchKG – Beschwerde an die Aufsichtsbehörde
      { label: 'Art. 17 SchKG', url: fedlexUrl('SchKG', '17'), verified: false },
      // Art. 84 SchKG – Rechtsöffnungsgericht
      { label: 'Art. 84 SchKG', url: fedlexUrl('SchKG', '84'), verified: false },
      // Art. 272 SchKG – Arrestgericht
      { label: 'Art. 272 SchKG', url: fedlexUrl('SchKG', '272'), verified: false },
    ],
    href: '/rechner/zustaendigkeit#schkg',
    keywords: ['Betreibungsort', 'Betreibungsamt', 'Rechtsöffnung', 'Arrest', 'Aufsichtsbeschwerde', 'Konkursgericht', 'Zuständigkeit'],
    related: ['zustaendigkeit', 'schkg-fristen'],
    icon: 'scale',
  },
  'kuendigung-sperrfristen': {
    id: 'kuendigung-sperrfristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Arbeitsrecht – Fristen',
    szenarien: [
      { label: 'Kündigungs- & Sperrfristen (Art. 335c/336c OR)', status: 'entwurf' },
      { label: 'Anfechtung missbräuchlicher Kündigung', status: 'geplant' },
      { label: 'Massenentlassung – Konsultationsfristen', status: 'geplant' },
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
    title: 'Mietrecht – Fristen',
    szenarien: [
      { label: 'Kündigung, Termine & Zahlungsverzug', status: 'entwurf' },
      { label: 'Anfechtung & Erstreckung', status: 'geplant' },
    ],
    description: 'Kündigungstermine und -fristen für Wohn- und Geschäftsräume – mit Termin-Hierarchie, Formprüfung und ausserordentlichen Kündigungen.',
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

  // ════ I – Fristen (in Vorbereitung) ════
  'beschwerde-verwaltung': {
    id: 'beschwerde-verwaltung', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Verwaltungs- & Steuerverfahren – Fristen',
    description: 'Einsprache- und Beschwerdefristen im Verwaltungs- und Steuerverfahren – nicht eidgenössisch vereinheitlicht; kantonale Vielfalt wird gekennzeichnet.',
    status: 'geplant', norms: [],
  },
  strafverfahren: {
    id: 'strafverfahren', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'StPO-Fristen',
    description: 'Einsprache gegen Strafbefehl und Rechtsmittelfristen – eigene Fristmechanik ohne Gerichtsferien-Stillstand.',
    status: 'geplant', norms: [],
  },
  sozialversicherung: {
    id: 'sozialversicherung', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Sozialversicherungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Sozialversicherung (ATSG) – Fristen',
    description: 'Einsprache- und Beschwerdefristen sowie Leistungsverwirkung und Nachzahlung – IV, AHV, Unfall- und Krankenversicherung.',
    status: 'geplant', norms: [],
  },
  verjaehrung: {
    id: 'verjaehrung', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Verjährung',
    description: 'Ordentliche und kurze Verjährung sowie deliktische und bereicherungsrechtliche Ansprüche – mit Stillstand, Unterbrechung und Einredeverzicht.',
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
    description: 'Rüge- und Verjährungsfristen bei Kauf, Werkvertrag und Grundstückkauf – mit Zwei-Regime-Weiche zur Baumängel-Revision 2026.',
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
    title: 'Erbrecht – Fristen',
    description: 'Ausschlagung, öffentliches Inventar sowie Ungültigkeits-, Herabsetzungs- und Erbschaftsklage – 15 Tatbestände mit exaktem Fristbeginn (Art. 521/533/567 ff. ZGB).',
    // Quick-Win 1 (bibliothek/recherche/erbrecht-ausbau.md), gebaut 6.6.2026;
    // Engine src/lib/erbFristen.ts, Normen am ZGB-Cache verifiziert.
    status: 'entwurf',
    norms: [
      { label: 'Art. 567 ZGB', url: fedlexUrl('ZGB', '567'), verified: false },
      { label: 'Art. 580 ZGB', url: fedlexUrl('ZGB', '580'), verified: false },
      { label: 'Art. 521 ZGB', url: fedlexUrl('ZGB', '521'), verified: false },
      { label: 'Art. 533 ZGB', url: fedlexUrl('ZGB', '533'), verified: false },
      { label: 'Art. 600 ZGB', url: fedlexUrl('ZGB', '600'), verified: false },
    ],
    href: '/rechner/erb-fristen',
    keywords: ['Ausschlagung', 'Erbschaft ausschlagen', 'öffentliches Inventar', 'Herabsetzung', 'Ungültigkeitsklage', 'Erbschaftsklage', 'Vermächtnis', 'Pflichtteil', 'Frist'],
    related: ['erbteilung', 'eigenhaendiges-testament'],
    icon: 'clock',
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
    status: 'geplant', norms: [], related: ['strafanzeige', 'strafantrag-vorlage'],
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
    title: 'Bauhandwerkerpfandrecht – Eintragungsfrist',
    description: 'Frist zur Eintragung des gesetzlichen Bauhandwerkerpfandrechts.',
    status: 'geplant', norms: [],
  },

  // ════ II – Beträge & Quoten (geprüft) ════
  verzugszins: {
    id: 'verzugszins', modus: 'rechner', art: 'betrag', tier: 'free', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Verzugszins',
    description: 'Verzugszins bei Schuldnerverzug – Zeitraum, Satz und Betrag.',
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
    description: 'Gesetzliche Erbteile, Pflichtteile und verfügbare Quote – mit Todesdatum-Weiche für die Revision 2023 und güterrechtlicher Vorstufe.',
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

  // ════ II – Beträge & Quoten (in Vorbereitung) ════
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

  // ════ III – Zuständigkeit & Einordnung ════
  // EINE Zuständigkeits-Karte statt der drei Einzelkarten gerichtsstand/
  // verfahrensart/schlichtung (Konsolidierung 5.6.2026): die Engine
  // beantwortet alle drei Fragen in einem Durchlauf (ZUSTAENDIGKEIT-AUFTRAG.md).
  zustaendigkeit: {
    id: 'zustaendigkeit', modus: 'rechner', art: 'zuordnung', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Zuständigkeit (Gericht · Verfahren · Schlichtung)',
    description: 'Verfahrensart, Schlichtungspflicht und -behörde sowie örtlicher Gerichtsstand nach ZPO (Fassung 1.1.2025) – mit offenen Weichen für Handelsgericht und direkte Klage; konkrete Stelle mit Adresse für erfasste Kantone.',
    status: 'entwurf',
    norms: [
      // Schlichtung: Grundsatz, Verzicht, paritätische Behörden
      { label: 'Art. 197 ZPO', url: fedlexUrl('ZPO', '197'), verified: false },
      { label: 'Art. 199 ZPO', url: fedlexUrl('ZPO', '199'), verified: false },
      { label: 'Art. 200 ZPO', url: fedlexUrl('ZPO', '200'), verified: false },
      // Entscheidvorschlag (Revision 2025: bis CHF 10'000)
      { label: 'Art. 210 ZPO', url: fedlexUrl('ZPO', '210'), verified: false },
      // Verfahrensart
      { label: 'Art. 243 ZPO', url: fedlexUrl('ZPO', '243'), verified: false },
    ],
    href: '/rechner/zustaendigkeit',
    keywords: ['Zuständigkeit', 'Gerichtsstand', 'Verfahrensart', 'Schlichtung', 'Schlichtungsbehörde', 'Streitwert', 'Handelsgericht'],
    // Katalog-Split 6.6.2026: SchKG- und Straf-Rechtsweg derselben Seite
    // haben eigene Gebiets-Einstiege (Hash-Vorauswahl) — hier verlinkt.
    related: ['zpo-fristen', 'schlichtungsgesuch', 'schkg-zustaendigkeit', 'straf-zustaendigkeit'],
    icon: 'scale',
  },
  iprg: {
    id: 'iprg', modus: 'rechner', art: 'zuordnung', tier: 'pro', rechtsgebiet: 'Weitere Rechtsgebiete',
    rechtsbereich: 'uebergreifend',
    title: 'Anwendbares Recht (IPRG)',
    description: 'Anwendbares Recht und Gerichtsstand bei internationalem Bezug.',
    status: 'geplant', norms: [],
  },

  // ════ IV – Werkzeuge (in Vorbereitung) ════
  tagerechner: {
    id: 'tagerechner', modus: 'rechner', art: 'werkzeug', tier: 'free', rechtsgebiet: 'Übergreifende Werkzeuge',
    rechtsbereich: 'uebergreifend',
    title: 'Fristenrechner (Tage · ZPO · SchKG)',
    description: 'EIN Fristenrechner für die meisten Verfahren: allgemeine Vertrags- und Verwirkungsfristen (Ereignistag zählt nicht, Monatsfristen, Werktag-Verschiebung kantonal nach EJPD-Verzeichnis, Rückwärtsrechnung, Zustell-Helfer, Kalenderexport), Zivilprozess mit Stillstand nach Art. 145 ZPO sowie Betreibungsferien und Rechtsstillstand nach SchKG – getrennt gerechnete Engines, ein Einstieg.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 77 OR', url: fedlexUrl('OR', '77'), verified: false },
      { label: 'Art. 78 OR', url: fedlexUrl('OR', '78'), verified: false },
      // BG über den Fristenlauf an Samstagen – ELI via Fedlex-SPARQL verifiziert (5.6.2026)
      { label: 'SR 173.110.3', url: 'https://www.fedlex.admin.ch/eli/cc/1963/819_815_843/de', verified: false },
      { label: 'Art. 145 ZPO', url: fedlexUrl('ZPO', '145'), verified: false },
      { label: 'Art. 56 SchKG', url: fedlexUrl('SchKG', '56'), verified: false },
    ],
    href: '/rechner/tagerechner',
    related: ['zpo-fristen', 'schkg-fristen'],
    keywords: ['Frist', 'Fristende', 'Tagerechner', 'Art. 77', 'Art. 78', 'Feiertag', 'dies a quo'],
    icon: 'clock',
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
    description: 'Indexierung nach dem Landesindex der Konsumentenpreise mit amtlicher BFS-Reihe (Originalbasen, automatische Basis-Wahl): Indexmiete mit 100-%-Weitergabe und Senkungspflicht, Unterhaltsbeiträge nach Urteilsklausel, generische Wertsicherung – Rechenweg und Quelle vollständig offengelegt.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 269b OR', url: fedlexUrl('OR', '269b'), verified: false },
      { label: 'Art. 17 VMWG', url: fedlexUrl('VMWG', '17'), verified: false },
      { label: 'Art. 286 ZGB', url: fedlexUrl('ZGB', '286'), verified: false },
      { label: 'Art. 128 ZGB', url: fedlexUrl('ZGB', '128'), verified: false },
    ],
    href: '/rechner/teuerung',
    related: ['mietzinsanpassung', 'verzugszins'],
    keywords: ['Teuerung', 'LIK', 'Index', 'Indexmiete', 'Unterhalt', 'Indexierung', 'BFS'],
    icon: 'percent',
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
  // (Normentreue) – Normen folgen erst mit dem Bau (geplant → entwurf).

  // – Zivilprozess (ZPO) & Bundesgericht —
  bundesgerichtsgebuehren: {
    id: 'bundesgerichtsgebuehren', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'uebergreifend',
    title: 'Bundesgerichtsgebühren',
    description: 'Gerichtsgebühren der eidgenössischen Gerichte nach Streitwert und Verfahrensart.',
    status: 'geplant', norms: [],
    related: ['bgg-fristen', 'prozesskosten'],
    keywords: ['BGer', 'BVGer', 'BStGer', 'BPatGer', 'Gerichtsgebühren'],
  },
  kostenvorschuss: {
    id: 'kostenvorschuss', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Kostenvorschuss',
    description: 'Vorschuss auf die Gerichtskosten im Zivilprozess.',
    status: 'geplant', norms: [],
    related: ['prozesskosten', 'zpo-fristen'],
    keywords: ['Vorschuss', 'Gerichtskosten'],
  },
  'parteientschaedigung-sicherheit': {
    id: 'parteientschaedigung-sicherheit', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Sicherheit für die Parteientschädigung',
    description: 'Sicherstellung der Parteientschädigung bei besonderen Risiken auf Klägerseite.',
    status: 'geplant', norms: [],
    related: ['prozesskosten'],
    keywords: ['Kaution', 'Sicherstellung', 'Parteientschädigung'],
  },
  rechtsmittelpruefung: {
    id: 'rechtsmittelpruefung', modus: 'rechner', art: 'zuordnung', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'uebergreifend',
    title: 'Rechtsmittelprüfung',
    description: 'Welches Rechtsmittel gegen welchen Entscheid offensteht – Weg, Instanz und Anforderungen.',
    status: 'geplant', norms: [],
    related: ['zpo-fristen', 'bgg-fristen'],
    keywords: ['Berufung', 'Beschwerde', 'Revision', 'Rechtsmittel'],
  },

  // – Arbeit —
  ferienanspruch: {
    id: 'ferienanspruch', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Ferienanspruch',
    description: 'Ferienguthaben nach Alter, Pensum und Ein- oder Austritt im Dienstjahr.',
    status: 'geplant', norms: [],
    related: ['ferienkuerzung', 'lohnfortzahlung'],
    keywords: ['Ferien', 'Ferienguthaben', 'pro rata'],
  },
  ferienkuerzung: {
    id: 'ferienkuerzung', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Ferienkürzung',
    description: 'Kürzung des Ferienanspruchs bei längeren Absenzen.',
    status: 'geplant', norms: [],
    related: ['ferienanspruch', 'lohnfortzahlung'],
    keywords: ['Ferien', 'Kürzung', 'Absenz', 'Krankheit'],
  },
  'dreizehnter-monatslohn': {
    id: 'dreizehnter-monatslohn', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Anteiliger 13. Monatslohn',
    description: 'Pro-rata-Anteil des 13. Monatslohns bei unterjährigem Ein- oder Austritt.',
    status: 'geplant', norms: [],
    related: ['lohnfortzahlung'],
    keywords: ['13. Monatslohn', 'pro rata', 'Austritt'],
  },
  'ueberstunden-zuschlag': {
    id: 'ueberstunden-zuschlag', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Überstunden- & Überzeitzuschlag',
    description: 'Vergütung von Überstunden und Überzeit samt Zuschlägen.',
    status: 'geplant', norms: [],
    related: ['arbeit-entschaedigung'],
    keywords: ['Überstunden', 'Überzeit', 'Zuschlag', 'Kompensation'],
  },

  // – Vertrag & Forderung (OR) —
  schadenszins: {
    id: 'schadenszins', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Schadenszins',
    description: 'Zins auf Schadenersatzforderungen vom Schadenseintritt bis zur Zahlung.',
    status: 'geplant', norms: [],
    related: ['verzugszins', 'verjaehrung'],
    keywords: ['Schadenszins', 'Schadenersatz', 'Zins'],
  },
  'widerruf-konsum': {
    id: 'widerruf-konsum', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Widerrufsrechte (Konsum)',
    description: 'Widerrufsfristen bei Konsumgeschäften – Beginn, Dauer und Form.',
    status: 'geplant', norms: [],
    related: ['verjaehrung'],
    keywords: ['Widerruf', 'Konsumkredit', 'Haustürgeschäft'],
  },

  // – Familienrecht —
  'gueterrecht-vorschlag': {
    id: 'gueterrecht-vorschlag', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Güterrechtliche Auseinandersetzung / Vorschlag',
    description: 'Aufteilung von Errungenschaft und Vorschlag bei Auflösung des Güterstands.',
    status: 'geplant', norms: [],
    related: ['vorsorgeausgleich', 'erb-ausgleichung'],
    keywords: ['Güterrecht', 'Errungenschaft', 'Vorschlag'],
  },

  // – Gesellschaftsrecht —
  beteiligungsquoten: {
    id: 'beteiligungsquoten', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Beteiligungs- & Stimmrechtsquoten',
    description: 'Kapital- und Stimmenanteile sowie Schwellen für Beschlüsse und Rechte.',
    status: 'geplant', norms: [],
    related: ['gv-vr-beschluss'],
    keywords: ['Quorum', 'Stimmrecht', 'Beteiligung', 'Schwelle'],
  },
  liberierungsgrad: {
    id: 'liberierungsgrad', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Liberierungsgrad',
    description: 'Einbezahltes Kapital im Verhältnis zum Nennkapital.',
    status: 'geplant', norms: [],
    related: ['kapitalerhoehung'],
    keywords: ['Liberierung', 'Aktienkapital', 'Stammkapital'],
  },
  kapitalverlust: {
    id: 'kapitalverlust', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Kapitalverlust',
    description: 'Feststellung eines Kapitalverlusts und der daran geknüpften Handlungspflichten.',
    status: 'geplant', norms: [],
    related: ['ueberschuldung'],
    keywords: ['Kapitalverlust', 'Sanierung', 'Aktienrecht', 'GmbH'],
  },
  ueberschuldung: {
    id: 'ueberschuldung', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Überschuldung',
    description: 'Prüfung der Überschuldung und der Pflichten des Verwaltungsrats.',
    status: 'geplant', norms: [],
    related: ['kapitalverlust'],
    keywords: ['Überschuldung', 'Benachrichtigung', 'Bilanz'],
  },
  kapitalerhoehung: {
    id: 'kapitalerhoehung', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Kapitalerhöhung',
    description: 'Arten und Schritte der Kapitalerhöhung mit den massgebenden Quoten.',
    status: 'geplant', norms: [],
    related: ['liberierungsgrad', 'statuten'],
    keywords: ['Kapitalerhöhung', 'Bezugsrecht'],
  },

  // – Strafrecht & Strafprozess —
  haftfristen: {
    id: 'haftfristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Haftfristen',
    description: 'Fristen rund um Untersuchungs- und Sicherheitshaft.',
    status: 'geplant', norms: [],
    related: ['strafverfahren'],
    keywords: ['Haft', 'Untersuchungshaft', 'Haftverlängerung'],
  },
  // Katalog-Split 6.6.2026: war «geplant», obwohl der Straf-Rechtsweg im
  // Zuständigkeitsrechner längst live ist (§8: ehrliches Status-Modell) —
  // jetzt Gebiets-Einstieg mit Rechtsweg-Vorauswahl per Hash-Anker.
  'straf-zustaendigkeit': {
    id: 'straf-zustaendigkeit', modus: 'rechner', art: 'zuordnung', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Zuständigkeit im Strafverfahren (Gerichtsstand · Behörde · Rechtsmittel)',
    description: 'Örtlicher Gerichtsstand und zuständige Strafbehörde nach StPO (Tatort-Grundsatz, Spezialforen), Anzeige-Fahrplan mit Strafantragsfrist sowie das statthafte Rechtsmittel mit Fristen.',
    status: 'entwurf',
    norms: [
      // Art. 31 StPO – Gerichtsstand des Tatortes (Grundsatz)
      { label: 'Art. 31 StPO', url: fedlexUrl('StPO', '31'), verified: false },
      // Art. 301 StPO – Anzeigerecht
      { label: 'Art. 301 StPO', url: fedlexUrl('StPO', '301'), verified: false },
      // Art. 379 StPO – Rechtsmittel: Geltungsbereich (führender Artikel)
      { label: 'Art. 379 StPO', url: fedlexUrl('StPO', '379'), verified: false },
    ],
    href: '/rechner/zustaendigkeit#straf',
    related: ['strafverfahren', 'zustaendigkeit', 'strafantrag'],
    keywords: ['Gerichtsstand', 'Tatort', 'Zuständigkeit', 'Staatsanwaltschaft', 'Strafanzeige', 'Strafantrag', 'Berufung', 'Beschwerde', 'Einsprache'],
    icon: 'scale',
  },

  // – Verwaltungsrecht —
  'baurecht-fristen': {
    id: 'baurecht-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Bau- & planungsrechtliche Fristen',
    description: 'Einsprache- und Beschwerdefristen in Bau- und Planungsverfahren.',
    status: 'geplant', norms: [],
    related: ['beschwerde-verwaltung'],
    keywords: ['Baubewilligung', 'Einsprache', 'Nutzungsplanung'],
  },
  'vergabe-fristen': {
    id: 'vergabe-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Vergaberechtliche Beschwerdefristen',
    description: 'Fristen im öffentlichen Beschaffungswesen.',
    status: 'geplant', norms: [],
    related: ['beschwerde-verwaltung'],
    keywords: ['Vergabe', 'Submission', 'Beschwerde'],
  },

  // – Steuerrecht – (Steuerverfahrens-Fristen deckt der bestehende Rechner
  //   «Verwaltungs- & Steuerverfahren – Fristen» ab; nicht gedoppelt)
  'steuer-verjaehrung': {
    id: 'steuer-verjaehrung', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Steuerrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Steuerrechtliche Verjährung',
    description: 'Veranlagungs- und Bezugsverjährung im Steuerrecht.',
    status: 'geplant', norms: [],
    related: ['beschwerde-verwaltung'],
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

  // – Sozialversicherungsrecht —
  'ahv-beitraege': {
    id: 'ahv-beitraege', modus: 'rechner', art: 'betrag', tier: 'pro', rechtsgebiet: 'Sozialversicherungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'AHV-Beiträge',
    description: 'Beiträge an AHV/IV/EO für Angestellte, Selbständige und Nichterwerbstätige.',
    status: 'geplant', norms: [],
    related: ['sozialversicherung'],
    keywords: ['AHV', 'IV', 'EO', 'Beiträge'],
  },

  // – Datenschutzrecht —
  'datenschutz-fristen': {
    id: 'datenschutz-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Datenschutzrecht',
    rechtsbereich: 'privat',
    title: 'Datenschutzrechtliche Fristen',
    description: 'Fristen rund um Auskunft, Meldung und Aufbewahrung.',
    status: 'geplant', norms: [],
    related: ['auskunftsbegehren', 'loeschungsbegehren'],
    keywords: ['Datenschutz', 'DSG', 'Auskunft'],
  },

  // – Ausländerrecht —
  'auslaenderrecht-fristen': {
    id: 'auslaenderrecht-fristen', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Ausländerrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Ausländer- & asylrechtliche Fristen',
    description: 'Fristen in ausländer- und asylrechtlichen Verfahren.',
    status: 'geplant', norms: [],
    keywords: ['Migrationsrecht', 'Asyl', 'Bewilligung'],
  },

  // – Weitere Rechtsgebiete —
  markenwiderspruch: {
    id: 'markenwiderspruch', modus: 'rechner', art: 'frist', tier: 'pro', rechtsgebiet: 'Weitere Rechtsgebiete',
    rechtsbereich: 'privat',
    title: 'Markenwiderspruch (Frist)',
    description: 'Widerspruchsfrist nach Veröffentlichung einer Markeneintragung.',
    status: 'geplant', norms: [],
    keywords: ['Marke', 'Widerspruch', 'IGE'],
  },

  // – Übergreifende Werkzeuge —
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
  // ════ I – Vorsorge & Nachlass ════
  'eigenhaendiges-testament': {
    id: 'eigenhaendiges-testament', modus: 'vorlage', art: 'vorsorge', tier: 'free', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Eigenhändiges Testament',
    description: 'Letztwillige Verfügung aus festen Bausteinen – mit Pflichtteils-Kontrolle, Bausteinprotokoll und Form-Gate; Ausgabe als Mustertext zum eigenhändigen Abschreiben.',
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
    formvorschrift: 'Eigenhändig abzuschreiben – von Hand, datiert, unterschrieben',
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
    description: 'Entwurf für die vertragliche Nachlassregelung – zur Vorbereitung der Beurkundung.',
    status: 'geplant', norms: [], related: ['erbteilung'],
    icon: 'document',
  },
  vorsorgeauftrag: {
    id: 'vorsorgeauftrag', modus: 'vorlage', art: 'vorsorge', tier: 'free', rechtsgebiet: 'Vorsorge & Erwachsenenschutz',
    rechtsbereich: 'privat',
    title: 'Vorsorgeauftrag',
    description: 'Personensorge, Vermögenssorge und Vertretung im Rechtsverkehr bei Urteilsunfähigkeit – mit Form-Weiche (eigenhändig oder beurkundet), Sondervollmachten und KESB-Hinweisen.',
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
    // DOCX nur für den Beurkundungs-Entwurf – Gate im Wizard (Form-Vorrang)
    output: ['pdf', 'docx'],
    keywords: ['Vorsorgeauftrag', 'Urteilsunfähigkeit', 'Personensorge', 'Vermögenssorge', 'KESB', 'Validierung', 'Beistandschaft'],
    related: ['patientenverfuegung', 'eigenhaendiges-testament', 'vollmacht'],
    icon: 'document',
  },
  patientenverfuegung: {
    id: 'patientenverfuegung', modus: 'vorlage', art: 'vorsorge', tier: 'free', rechtsgebiet: 'Vorsorge & Erwachsenenschutz',
    rechtsbereich: 'privat',
    title: 'Patientenverfügung',
    description: 'Medizinische Massnahmen, Behandlungsziel und Vertretungsperson – mit Konsistenz-Prüfung und Form-Gate; am Computer erstellbar, handschriftlich zu unterschreiben.',
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
    formvorschrift: 'Schriftlich – ausdrucken, handschriftlich datieren und unterschreiben',
    // Schriftform mit Unterschrift → DOCX unproblematisch (Pilot Teil II)
    output: ['pdf', 'docx'],
    keywords: ['Patientenverfügung', 'medizinische Massnahmen', 'Urteilsunfähigkeit', 'Reanimation', 'Vertretungsperson', 'Organspende', 'Behandlungsziel'],
    related: ['vorsorgeauftrag'],
    icon: 'document',
  },

  // ════ II – Verträge ════
  arbeitsvertrag: {
    id: 'arbeitsvertrag', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Arbeitsvertrag',
    description: 'Befristeter oder unbefristeter Einzelarbeitsvertrag aus festen Bausteinen – mit harten Schranken für zwingendes Recht (Probezeit, Kündigungsfristen, Ferien, Ferienlohn) und Hinweisen zu Konkurrenzverbot, Überstunden-Wegbedingung und kantonalen Mindestlöhnen.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 319 OR', url: fedlexUrl('OR', '319'), verified: false },
      { label: 'Art. 335c OR', url: fedlexUrl('OR', '335c'), verified: false },
      { label: 'Art. 361 OR', url: fedlexUrl('OR', '361'), verified: false },
      { label: 'Art. 362 OR', url: fedlexUrl('OR', '362'), verified: false },
    ],
    href: '/vorlagen/arbeitsvertrag',
    schemaId: 'arbeitsvertrag',
    formvorschrift: 'Beidseitig zu unterzeichnen',
    output: ['pdf', 'docx'],
    related: ['lohnfortzahlung', 'kuendigung-sperrfristen', 'kuendigung-arbeitgeber', 'arbeitszeugnis'],
    keywords: ['Arbeitsvertrag', 'Probezeit', 'Konkurrenzverbot', 'Überstunden', '13. Monatslohn', 'Art. 319', 'Art. 335c'],
    icon: 'document',
  },
  'mietvertrag-wohnen': {
    id: 'mietvertrag-wohnen', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Miete',
    rechtsbereich: 'privat',
    title: 'Mietvertrag (Wohn- & Geschäftsräume)',
    description: 'Mietvertrag mit Objekt-Weiche Wohn-/Geschäftsraum aus festen Bausteinen – Kautionsmaximum, Mindestfristen und Index-/Staffel-Voraussetzungen als harte Schranken; kantonale Formularpflicht für den Anfangsmietzins als offengelegtes Form-Gate.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 253 OR', url: fedlexUrl('OR', '253'), verified: false },
      { label: 'Art. 257e OR', url: fedlexUrl('OR', '257e'), verified: false },
      { label: 'Art. 269b OR', url: fedlexUrl('OR', '269b'), verified: false },
      { label: 'Art. 270 OR', url: fedlexUrl('OR', '270'), verified: false },
    ],
    href: '/vorlagen/mietvertrag',
    schemaId: 'mietvertrag',
    formvorschrift: 'Beidseitig zu unterzeichnen',
    output: ['pdf', 'docx'],
    related: ['mietrecht', 'mietzinsanpassung', 'schlichtungsgesuch'],
    keywords: ['Mietvertrag', 'Kaution', 'Nebenkosten', 'Indexmiete', 'Staffelmiete', 'Formularpflicht', 'Art. 257e', 'Art. 269b'],
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

  // ════ III – Eingaben ════
  schlichtungsgesuch: {
    id: 'schlichtungsgesuch', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Schlichtungsgesuch (alle Kantone)',
    description: 'Stellt ein Schlichtungsgesuch nach Art. 202 ZPO zusammen – Parteien, Rechtsbegehren, Streitgegenstand, Beilagen. Behördenadresse automatisch für alle 26 Kantone (PLZ/Gemeinde-genau in ZH/AG/SG/TG/FR/ZG/AI); sachliches Spezial-Routing amtlich abgenommen für Basel-Stadt.',
    // Abweichung von der Auftrags-Anweisung (status: 'geplant') offengelegt:
    // Nach dem neueren Status-Modell-Auftrag erhalten GEBAUTE, fachlich noch
    // nicht geprüfte Einträge 'entwurf' (orange, verified: false) – als
    // 'geplant' wäre die Vorlage im Katalog nicht erreichbar.
    status: 'entwurf',
    norms: [
      // Art. 202 ZPO – Schlichtungsgesuch (Pflichtinhalt) – Anker build-verifiziert, fachlich offen
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
    title: 'Klage (vereinfachtes Verfahren) – Basel-Stadt',
    description: 'Klage nach Art. 244 ZPO aus festen Bausteinen: Rechtsbegehren (beziffert/unbeziffert), Streitgegenstand, freiwillige strukturierte Begründung mit Beweismitteln, Beilagen mit Klagebewilligung – BS-Routing (Zivil-/Arbeitsgericht), Kostenfreiheits-Prüfung und Klagefrist mit Gerichtsferien.',
    status: 'entwurf',
    norms: [
      // Geltungsbereich vereinfachtes Verfahren
      { label: 'Art. 243 ZPO', url: fedlexUrl('ZPO', '243'), verified: false },
      // Form und Inhalt der Klage
      { label: 'Art. 244 ZPO', url: fedlexUrl('ZPO', '244'), verified: false },
      // Klagebewilligung und Klagefrist
      { label: 'Art. 209 ZPO', url: fedlexUrl('ZPO', '209'), verified: false },
      // Kostenfreiheit im Entscheidverfahren
      { label: 'Art. 114 ZPO', url: fedlexUrl('ZPO', '114'), verified: false },
      // Gerichtsferien (Klagefrist-Berechnung)
      { label: 'Art. 145 ZPO', url: fedlexUrl('ZPO', '145'), verified: false },
    ],
    href: '/vorlagen/klage-vereinfacht',
    schemaId: 'klage-vereinfacht-bs',
    formvorschrift: 'Unterschreiben und im Doppel einreichen (Art. 131 ZPO)',
    output: ['pdf', 'docx'],
    keywords: ['Klage', 'vereinfachtes Verfahren', 'Art. 244 ZPO', 'Klagebewilligung', 'Arbeitsgericht', 'Rechtsbegehren', 'Basel'],
    related: ['schlichtungsgesuch', 'zustaendigkeit', 'zpo-fristen'],
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
    status: 'geplant', norms: [], related: ['schkg-fristen', 'verzugszins', 'schuldanerkennung'],
    icon: 'clipboard',
  },

  // ════ IV – Gesellschaftsdokumente ════
  'gmbh-gruendung': {
    id: 'gmbh-gruendung', modus: 'vorlage', art: 'gesellschaft', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'GmbH-Gründungsunterlagen',
    description: 'Errichtungsakt, Statuten und Anmeldung – zur Vorbereitung der Beurkundung.',
    status: 'geplant', norms: [], related: ['gesellschaftsrecht-fristen'],
    icon: 'scale',
  },
  'ag-gruendung': {
    id: 'ag-gruendung', modus: 'vorlage', art: 'gesellschaft', tier: 'pro', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'AG-Gründungsunterlagen',
    description: 'Errichtungsakt, Statuten und Anmeldung – zur Vorbereitung der Beurkundung.',
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

  // – Betreibung & Konkurs (SchKG) —
  rechtsvorschlag: {
    id: 'rechtsvorschlag', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Rechtsvorschlag',
    description: 'Erklärung des Rechtsvorschlags gegen den Zahlungsbefehl.',
    status: 'geplant', norms: [],
    related: ['schkg-fristen', 'rechtsoeffnungsbegehren'],
    keywords: ['Rechtsvorschlag', 'Zahlungsbefehl', 'Betreibung'],
  },
  aberkennungsklage: {
    id: 'aberkennungsklage', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Aberkennungsklage',
    description: 'Strukturiertes Gerüst für die Aberkennungsklage nach provisorischer Rechtsöffnung.',
    status: 'geplant', norms: [],
    related: ['schkg-fristen', 'rechtsoeffnungsbegehren'],
    keywords: ['Aberkennung', 'Rechtsöffnung'],
  },
  arrestgesuch: {
    id: 'arrestgesuch', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Arrestgesuch',
    description: 'Strukturiertes Gerüst für das Arrestgesuch.',
    status: 'geplant', norms: [],
    related: ['schkg-fristen'],
    keywords: ['Arrest', 'Sicherung'],
  },
  'schkg-beschwerde': {
    id: 'schkg-beschwerde', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Beschwerde gegen Betreibungs- & Konkursämter',
    description: 'Strukturiertes Gerüst für die betreibungsrechtliche Beschwerde an die Aufsichtsbehörde.',
    status: 'geplant', norms: [],
    related: ['schkg-fristen'],
    keywords: ['Beschwerde', 'Aufsichtsbehörde', 'Betreibungsamt'],
  },

  // – Arbeit —
  'kuendigung-arbeitgeber': {
    id: 'kuendigung-arbeitgeber', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Kündigung durch den Arbeitgeber',
    description: 'Kündigungsschreiben des Arbeitgebers mit den üblichen Bestandteilen.',
    status: 'geplant', norms: [],
    related: ['kuendigung-sperrfristen', 'arbeitszeugnis'],
    keywords: ['Kündigung', 'Arbeitsverhältnis', 'Kündigungsschreiben'],
  },
  'kuendigung-arbeitnehmer': {
    id: 'kuendigung-arbeitnehmer', modus: 'vorlage', art: 'korrespondenz', tier: 'free', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Kündigung durch den Arbeitnehmer',
    description: 'Kündigungsschreiben der Arbeitnehmerin oder des Arbeitnehmers.',
    status: 'geplant', norms: [],
    related: ['kuendigung-sperrfristen', 'arbeitszeugnis'],
    keywords: ['Kündigung', 'Arbeitsverhältnis', 'Kündigungsschreiben'],
  },
  freistellung: {
    id: 'freistellung', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Freistellung',
    description: 'Strukturiertes Gerüst für die Freistellungserklärung.',
    status: 'geplant', norms: [],
    related: ['kuendigung-arbeitgeber', 'kuendigung-sperrfristen'],
    keywords: ['Freistellung'],
  },
  verwarnung: {
    id: 'verwarnung', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Verwarnung',
    description: 'Strukturiertes Gerüst für die arbeitsrechtliche Verwarnung.',
    status: 'geplant', norms: [],
    related: ['kuendigung-arbeitgeber'],
    keywords: ['Verwarnung', 'Abmahnung'],
  },
  arbeitszeugnis: {
    id: 'arbeitszeugnis', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Arbeitszeugnis',
    description: 'Strukturiertes Gerüst für Voll- und Zwischenzeugnisse.',
    status: 'geplant', norms: [],
    related: ['kuendigung-arbeitgeber', 'kuendigung-arbeitnehmer'],
    keywords: ['Zeugnis', 'Zwischenzeugnis'],
  },
  aufhebungsvereinbarung: {
    id: 'aufhebungsvereinbarung', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Aufhebungsvereinbarung',
    description: 'Strukturiertes Gerüst für die einvernehmliche Beendigung des Arbeitsverhältnisses.',
    status: 'geplant', norms: [],
    related: ['kuendigung-sperrfristen'],
    keywords: ['Aufhebungsvertrag', 'Saldoklausel'],
  },

  // – Vertrag & Forderung (OR) —
  mahnung: {
    id: 'mahnung', modus: 'vorlage', art: 'korrespondenz', tier: 'free', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Mahnung',
    description: 'Zahlungsaufforderung mit Fristansetzung.',
    status: 'geplant', norms: [],
    related: ['verzugszins', 'inverzugsetzung'],
    keywords: ['Mahnung', 'Zahlungsverzug', 'Frist'],
  },
  inverzugsetzung: {
    id: 'inverzugsetzung', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Inverzugsetzung',
    description: 'Erklärung, die die Schuldnerin oder den Schuldner in Verzug setzt.',
    status: 'geplant', norms: [],
    related: ['verzugszins', 'mahnung'],
    keywords: ['Verzug', 'Mahnung'],
  },
  schuldanerkennung: {
    id: 'schuldanerkennung', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Schuldanerkennung',
    description: 'Schriftliche Anerkennung einer Schuld als Grundlage der späteren Durchsetzung.',
    status: 'geplant', norms: [],
    related: ['rechtsoeffnungsbegehren', 'schkg-fristen'],
    keywords: ['Schuldanerkennung', 'Rechtsöffnung'],
  },
  vergleichsvereinbarung: {
    id: 'vergleichsvereinbarung', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Vergleichsvereinbarung',
    description: 'Strukturiertes Gerüst für den aussergerichtlichen Vergleich.',
    status: 'geplant', norms: [],
    related: ['schlichtungsgesuch'],
    keywords: ['Vergleich', 'Saldoklausel'],
  },

  // – Erbrecht —
  erbverzichtsvertrag: {
    id: 'erbverzichtsvertrag', modus: 'vorlage', art: 'vorsorge', tier: 'pro', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Erbverzichtsvertrag',
    description: 'Verzicht auf die Erbenstellung – Entwurf zur öffentlichen Beurkundung.',
    status: 'geplant', norms: [],
    formvorschrift: 'Öffentliche Beurkundung',
    related: ['erbteilung', 'erbvertrag'],
    keywords: ['Erbverzicht', 'Beurkundung'],
  },
  erbteilungsvereinbarung: {
    id: 'erbteilungsvereinbarung', modus: 'vorlage', art: 'vorsorge', tier: 'pro', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Erbteilungsvereinbarung',
    description: 'Strukturiertes Gerüst für die Teilung des Nachlasses unter den Erbinnen und Erben.',
    status: 'geplant', norms: [],
    related: ['erbteilung', 'erbrecht-fristen'],
    keywords: ['Erbteilung', 'Teilungsvertrag'],
  },

  // – Vorsorge & Erwachsenenschutz —
  // EINE Vollmacht-Maske mit Typ-Schalter (Anwalt/General/Spezial) statt
  // Einzelkarten General-/Bankvollmacht (Entscheid 5.6.2026); «Bank» ist ein
  // Vertretungsbereich mit Warnung (Banken verlangen eigene Formulare).
  vollmacht: {
    id: 'vollmacht', modus: 'vorlage', art: 'vorsorge', tier: 'free', rechtsgebiet: 'Vorsorge & Erwachsenenschutz',
    rechtsbereich: 'privat',
    title: 'Vollmacht (Anwalt · General · Spezial)',
    description: 'Anwaltsvollmacht, Generalvollmacht oder Spezialvollmacht in einer Maske – besondere Ermächtigungen (Art. 396 Abs. 3 OR), Substitution, Befristung und deterministische Form-Warnungen (Grundstück, Bank, Bürgschaft).',
    status: 'entwurf',
    norms: [
      // Art. 32 OR – Wirkung der direkten Stellvertretung
      { label: 'Art. 32 OR', url: fedlexUrl('OR', '32'), verified: false },
      // Art. 33 OR – Umfang der Ermächtigung (interne/externe Vollmacht)
      { label: 'Art. 33 OR', url: fedlexUrl('OR', '33'), verified: false },
      // Art. 34 OR – Beschränkung und Widerruf (Vorausverzicht ungültig)
      { label: 'Art. 34 OR', url: fedlexUrl('OR', '34'), verified: false },
      // Art. 35 OR – Erlöschen (dispositiv: Fortgeltung über den Tod hinaus)
      { label: 'Art. 35 OR', url: fedlexUrl('OR', '35'), verified: false },
      // Art. 396 OR – besondere Ermächtigung (Vergleich, Grundstücke, Schenkungen)
      { label: 'Art. 396 OR', url: fedlexUrl('OR', '396'), verified: false },
      // Art. 68 ZPO – Vertretung im Zivilprozess (Vollmachts-Ausweis Abs. 3)
      { label: 'Art. 68 ZPO', url: fedlexUrl('ZPO', '68'), verified: false },
    ],
    href: '/vorlagen/vollmacht',
    schemaId: 'vollmacht',
    formvorschrift: 'Einfache Schriftform – drucken und unterschreiben',
    output: ['pdf', 'docx'],
    keywords: ['Vollmacht', 'Anwaltsvollmacht', 'Generalvollmacht', 'Spezialvollmacht', 'Vertretung', 'Substitution', 'Bank', 'Prozessvollmacht'],
    related: ['vorsorgeauftrag', 'patientenverfuegung'],
    icon: 'document',
  },

  // – Familienrecht —
  trennungsvereinbarung: {
    id: 'trennungsvereinbarung', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Trennungsvereinbarung',
    description: 'Strukturiertes Gerüst für die Regelung des Getrenntlebens.',
    status: 'geplant', norms: [],
    related: ['gueterrecht-vorschlag', 'scheidungskonvention'],
    keywords: ['Trennung', 'Getrenntleben'],
  },
  scheidungskonvention: {
    id: 'scheidungskonvention', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Scheidungskonvention',
    description: 'Strukturiertes Gerüst für die Vereinbarung der Scheidungsfolgen.',
    status: 'geplant', norms: [],
    related: ['vorsorgeausgleich', 'gueterrecht-vorschlag', 'elternvereinbarung'],
    keywords: ['Scheidung', 'Konvention'],
  },
  elternvereinbarung: {
    id: 'elternvereinbarung', modus: 'vorlage', art: 'vertrag', tier: 'pro', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Elternvereinbarung',
    description: 'Strukturiertes Gerüst zu Obhut, Betreuung und Unterhalt.',
    status: 'geplant', norms: [],
    related: ['scheidungskonvention'],
    keywords: ['Eltern', 'Obhut', 'Betreuung'],
  },

  // – Strafrecht & Strafprozess —
  strafanzeige: {
    id: 'strafanzeige', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Strafanzeige',
    description: 'Anzeige eines Sachverhalts an die Strafverfolgungsbehörden.',
    status: 'geplant', norms: [],
    related: ['strafantrag-vorlage', 'strafantrag'],
    keywords: ['Anzeige', 'Staatsanwaltschaft'],
  },
  'strafantrag-vorlage': {
    id: 'strafantrag-vorlage', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Strafantrag',
    description: 'Strafantrag der berechtigten Person bei Antragsdelikten.',
    status: 'geplant', norms: [],
    related: ['strafanzeige', 'strafantrag'],
    keywords: ['Strafantrag', 'Antragsdelikt'],
  },
  akteneinsichtsgesuch: {
    id: 'akteneinsichtsgesuch', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Akteneinsichtsgesuch',
    description: 'Gesuch um Einsicht in die Verfahrensakten.',
    status: 'geplant', norms: [],
    related: ['strafverfahren'],
    keywords: ['Akteneinsicht', 'Verfahrensakten'],
  },
  entschaedigungsbegehren: {
    id: 'entschaedigungsbegehren', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Entschädigungsbegehren',
    description: 'Strukturiertes Gerüst für Entschädigungs- und Genugtuungsbegehren im Strafverfahren.',
    status: 'geplant', norms: [],
    related: ['strafverfahren', 'adhaesionsklage'],
    keywords: ['Entschädigung', 'Genugtuung'],
  },
  adhaesionsklage: {
    id: 'adhaesionsklage', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Adhäsionsklage',
    description: 'Strukturiertes Gerüst für Zivilansprüche im Strafverfahren.',
    status: 'geplant', norms: [],
    related: ['strafverfahren', 'entschaedigungsbegehren'],
    keywords: ['Adhäsion', 'Zivilanspruch'],
  },

  // – Verwaltungsrecht – (Einsprache deckt die bestehende Vorlage
  //   «Einsprache (Straf-/Verwaltungsbefehl)» ab; nicht gedoppelt)
  rekurs: {
    id: 'rekurs', modus: 'vorlage', art: 'eingabe', tier: 'pro', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Rekurs',
    description: 'Strukturiertes Gerüst für den kantonalen Rekurs.',
    status: 'geplant', norms: [],
    related: ['beschwerde-verwaltung', 'beschwerde'],
    keywords: ['Rekurs', 'Rechtsmittel'],
  },

  // – Datenschutzrecht —
  auskunftsbegehren: {
    id: 'auskunftsbegehren', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Datenschutzrecht',
    rechtsbereich: 'privat',
    title: 'Auskunftsbegehren (Datenschutz)',
    description: 'Begehren um Auskunft über die Bearbeitung eigener Personendaten.',
    status: 'geplant', norms: [],
    related: ['datenschutz-fristen', 'loeschungsbegehren'],
    keywords: ['Auskunft', 'Datenschutz', 'Personendaten'],
  },
  loeschungsbegehren: {
    id: 'loeschungsbegehren', modus: 'vorlage', art: 'korrespondenz', tier: 'pro', rechtsgebiet: 'Datenschutzrecht',
    rechtsbereich: 'privat',
    title: 'Löschungsbegehren (Datenschutz)',
    description: 'Begehren um Löschung von Personendaten.',
    status: 'geplant', norms: [],
    related: ['auskunftsbegehren', 'datenschutz-fristen'],
    keywords: ['Löschung', 'Datenschutz', 'Personendaten'],
  },
};

export function karte(id: string): CalculatorCard {
  return KARTEN[id] ?? VORLAGEN[id];
}

/** Flacher Katalog (beide Modi); Anzeige je Sektion: geprüfte zuerst, danach «In Vorbereitung». */
// «Verfügbar» als abgeleitetes Konzept (Pro-Katalog-Auftrag 5.6.2026,
// Phase 1): entwurf ODER geprüft = gebaut/nutzbar. EINZIGES Wahrheits-
// kriterium für Tabs, Zähler, Sektionsfilter und Schnellzugriff – wird ein
// Eintrag später auf «geprüft» gehoben, bleibt er automatisch verfügbar.
export function istVerfuegbar(item: { status: Status }): boolean {
  return item.status !== 'geplant';
}

export const ALLE_KARTEN: CatalogItem[] = [...Object.values(KARTEN), ...Object.values(VORLAGEN)];
