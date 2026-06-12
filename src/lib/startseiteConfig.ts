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
// Rechtsbereich: bei Rechnern Gliederungsachse (Katalog), bei Vorlagen Filterwert
export type Rechtsbereich = 'privat' | 'oeffentlich' | 'straf' | 'uebergreifend';
export const istAktiv = (s: Status) => s !== 'geplant';
export type Modus = 'rechner' | 'vorlage'; // inhaltliche Hauptweiche (In-Page-Toggle)
export type Art = 'frist' | 'betrag' | 'zuordnung' | 'werkzeug'; // Rechner-Output-Typ → Sektion
// S-2 STRUKTUR-UMBAU (Auftrag David 10.6.2026 abends): Vorlagen-Gruppen neu —
// Behördeneingaben · Verträge · Einseitige Willenserklärungen (vorher
// «korrespondenz») · Gesellschaftsrecht · Vorsorge & Nachlass (ergänzt auf
// Davids «gerne ergänzen»: Testament/Vorsorgeauftrag wären dogmatisch auch
// einseitige Willenserklärungen, der Praxis-Block bleibt aber eigener
// Einstieg — fachliche Aussage, Abnahme David offen).
export type VorlageArt = 'eingabe' | 'vertrag' | 'erklaerung' | 'gesellschaft' | 'vorsorge'; // Dokument-Typ → Sektion/Filter
// Unterrubriken der Behördeneingaben (S-2): Klagen allgemein (Schlichtungs-
// gesuch · vereinfachte · ordentliche Klage) · Klagen besondere Verfahren
// (nach klageGebiet) · Gesuche & sonstige Eingaben.
export type EingabeRubrik = 'klage_allgemein' | 'klage_besonders' | 'gesuch_sonstige';
// Die frühere Stufe «tier: free|pro» (Free-Auswahl auf «/», Vollkatalog auf
// /pro, PAYWALL_ACTIVE als Andockpunkt) ist mit der Aufhebung der Free/Pro-
// Zweiteilung ENTFERNT (FAHRPLAN-EINE-HAUPTSEITE D-3, Auftrag David
// 7.6.2026). Eine spätere Monetarisierung (STRATEGIE-PLATTFORM, Gate G1)
// bekäme einen neuen, funktionsbezogenen Zuschnitt — Stand vor dem Rückbau
// dokumentiert die Git-Historie (Commit 2e80daf und Vorgänger).

export interface NormRef {
  label: string;      // Anzeigetext, unverändert (z. B. "Art. 335c OR")
  url: string;        // verifizierter Fedlex-Artikel-Link ODER Gesetz-Seite
  verified: boolean;  // true nur bei geprüftem Artikel-Anker
}

interface BaseItem {
  id: string;
  modus: Modus;           // Rechner ↔ Vorlage (Hauptweiche)
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
  /** false = kein eigener Katalog-/Such-Eintrag (ein Themen-Einstieg über-
      nimmt die Auffindbarkeit, FAHRPLAN-KATALOG-KONSOLIDIERUNG E3). Die
      Karte bleibt SSoT für ihre Seite (Kopf, Normen, Formvorschrift). */
  imKatalog?: false;
}

export interface RechnerCard extends BaseItem {
  modus: 'rechner';
  art: Art;               // Output-Typ → bestimmt die Sektion
  // Konsolidierte Karten: abgedeckte Szenarien; 'geplant' = noch nicht gebaute Option
  szenarien?: { label: string; status: 'entwurf' | 'geplant' }[];
}

// Verträge-Unterrubriken (FAHRPLAN-VORLAGEN-AUSBAU V1, Wettbewerbsanalyse
// 12.6.2026 Abschn. 6.1): skalierbare Gliederung der Sektion II.
export type VertragRubrik = 'arbeit' | 'miete_pacht' | 'kauf'
  | 'auftrag_werk' | 'darlehen_sicherheiten' | 'familie' | 'zusammenarbeit';

// Form-Gate-Anzeige der Karte (V1): SPIEGEL des Schema-`ausgabeArt`
// (src/lib/vorlagen/<schema>.ts bleibt SSoT der Formfolge, §5) — als
// Katalogfeld nur, weil die Schemas zu schwer für das Start-Bundle sind;
// die Übereinstimmung erzwingt src/tests/formGate.test.ts mechanisch.
// 'gemischt' = Dokumentmappe mit druckfertigen UND Entwurfs-Teilen.
export type FormGate = 'fertig' | 'abschrift' | 'entwurf' | 'gemischt';

export interface VorlageCard extends BaseItem {
  modus: 'vorlage';
  art: VorlageArt;        // Dokument-Typ → bestimmt die Sektion
  /** Nur art 'eingabe' (S-2): Unterrubrik im Behördeneingaben-Register. */
  eingabeRubrik?: EingabeRubrik;
  /** Nur art 'vertrag' (V1): Unterrubrik im Verträge-Register. */
  vertragRubrik?: VertragRubrik;
  /** Form-Gate der Karte (V1) — Pflicht für jede GEBAUTE Vorlage mit
      Export; Checklisten ohne Export (kuendigung-vermieter) tragen keins. */
  formGate?: FormGate;
  /** Nur eingabeRubrik 'klage_besonders': Klage-Gebiet als Gruppen-Label
      (Familienrecht, Haftpflichtrecht, Zwangsvollstreckung …). */
  klageGebiet?: string;
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

// Vorlagen-Sektionen: fünf Dokument-Gruppen (S-2 STRUKTUR-UMBAU, Auftrag
// David 10.6.2026 abends — Reihenfolge und Zuschnitt nach seinem Wortlaut).
export const VORLAGE_SEKTIONEN: Sektion[] = [
  { art: 'eingabe', id: 'eingaben', numeral: 'I', title: 'Behördeneingaben',
    lede: 'Klagen, Gesuche, Einsprachen und Beschwerden an Gerichte und Behörden – strukturierte Gerüste mit offenen Optionen.' },
  { art: 'vertrag', id: 'vertraege', numeral: 'II', title: 'Verträge',
    lede: 'Arbeits-, Miet-, Darlehens- und Kaufverträge sowie Vereinbarungen – Klausel für Klausel nachvollziehbar.' },
  { art: 'erklaerung', id: 'erklaerungen', numeral: 'III', title: 'Einseitige Willenserklärungen',
    lede: 'Kündigungen, Mahnungen, Vollmachten und weitere einseitige Erklärungen – kurz und formgerecht.' },
  { art: 'gesellschaft', id: 'gesellschaft', numeral: 'IV', title: 'Gesellschaftsrecht',
    lede: 'Gründungsunterlagen, Statuten, Beschlüsse und Kapitalmassnahmen – formbewusst zusammengestellt.' },
  { art: 'vorsorge', id: 'vorsorge', numeral: 'V', title: 'Vorsorge & Nachlass',
    lede: 'Testament, Erbvertrag, Vorsorgeauftrag, Patientenverfügung – aus festen Bausteinen.' },
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
    id: 'zpo-fristen', modus: 'rechner', art: 'frist', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
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
    // Norm-Keywords nur für Fristen, die als Preset implementiert sind
    // (zpoPresets.ts: Art. 311/314/321/312/313/329/209/239/63; Art. 148 als
    // Wiederherstellungs-Warnung) — verifiziert 6.6.2026 (Katalog-UI 1.1).
    keywords: ['Frist', 'Gericht', 'Berufung', 'Beschwerde', 'Klage', 'Gerichtsferien', 'Stillstand', 'Zustellung',
      'Berufungsfrist', 'Beschwerdefrist', 'Rechtsmittelfrist', 'Klagebewilligung',
      // S-5c (Bug-Check §9, NIEDRIG): Begriffe des aufgelösten
      // Fristenspiegels — der Ereignis-Block lebt auf dieser Seite.
      'Fristenspiegel', 'parallele Fristen', 'Urteil erhalten', 'Fristenkontrolle',
      'Art. 311 ZPO', 'Art. 314 ZPO', 'Art. 321 ZPO', 'Art. 209 ZPO', 'Art. 145 ZPO', 'Art. 148 ZPO'],
    icon: 'clock',
  },
  'schkg-fristen': {
    id: 'schkg-fristen', modus: 'rechner', art: 'frist', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
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
    // Norm-/Phasen-Keywords gemäss schkgPresets.ts (Art. 88/116/166:
    // Fortsetzung, Verwertung, Konkursandrohung) — verifiziert 6.6.2026.
    keywords: ['Betreibung', 'Zahlungsbefehl', 'Rechtsvorschlag', 'Konkurs', 'Pfändung', 'Betreibungsferien',
      'betreiben', 'Schulden', 'Fortsetzungsbegehren', 'Verwertungsbegehren', 'Konkursandrohung', 'Rechtsstillstand',
      // S-5c (Bug-Check §9, NIEDRIG): Begriff des aufgelösten Fristenspiegels
      'Zahlungsbefehl erhalten',
      'Art. 88 SchKG', 'Art. 116 SchKG', 'Art. 166 SchKG'],
    related: ['verzugszins', 'rechtsoeffnungsbegehren', 'tagerechner'],
    icon: 'clipboard',
  },
  betreibungskosten: {
    id: 'betreibungskosten', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Betreibungskosten (GebV SchKG)',
    description: 'Amtliche Gebühren je Betreibungsschritt nach der bundesrechtlich abschliessenden GebV SchKG (Stand 1.1.2026, Tarif Wert für Wert amtlich verifiziert): Zahlungsbefehl mit Ausfertigungen und Zustellversuchen, Pfändung (auch fruchtlos), Verwertung mit Erlös-Kappung, Einzahlung/Überweisung – als Beträge; gerichtliche Entscheidgebühren (z. B. Rechtsöffnung, Art. 48) ehrlich als Rahmen. Auslagen und die Überwälzung auf den Schuldner (Art. 68 SchKG) als Hinweis.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 16 GebV SchKG', url: fedlexUrl('GebVSchKG', '16'), verified: false },
      { label: 'Art. 20 GebV SchKG', url: fedlexUrl('GebVSchKG', '20'), verified: false },
      { label: 'Art. 30 GebV SchKG', url: fedlexUrl('GebVSchKG', '30'), verified: false },
      { label: 'Art. 48 GebV SchKG', url: fedlexUrl('GebVSchKG', '48'), verified: false },
      { label: 'Art. 68 SchKG', url: fedlexUrl('SchKG', '68'), verified: false },
    ],
    href: '/rechner/betreibungskosten',
    related: ['schkg-fristen', 'zustaendigkeit', 'verzugszins'],
    keywords: ['Betreibungskosten', 'Gebühren', 'GebV', 'Zahlungsbefehl', 'Kosten Betreibung', 'Pfändungskosten', 'Rechtsöffnungsgebühr', 'Was kostet eine Betreibung', 'Art. 16', 'Art. 68'],
    icon: 'percent',
  },
  'kuendigung-sperrfristen': {
    id: 'kuendigung-sperrfristen', modus: 'rechner', art: 'frist', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Kündigung & Fristen im Arbeitsverhältnis',
    // Themen-Einstieg (Konsolidierung 7.6.2026, E3): die beiden Schreiben-
    // Masken (AN/AG) haben keine eigenen Katalog-Karten mehr (imKatalog:false)
    // — diese Karte trägt ihre Auffindbarkeit, die Rechner-Seite verlinkt sie.
    szenarien: [
      { label: 'Kündigungs- & Sperrfristen (Art. 335c/336c OR)', status: 'entwurf' },
      { label: 'Kündigungsschreiben Arbeitnehmer:in (Vorlage)', status: 'entwurf' },
      { label: 'Kündigungsschreiben Arbeitgeber:in mit Sperrfristen-Gate (Vorlage)', status: 'entwurf' },
      { label: 'Anfechtung missbräuchlicher Kündigung', status: 'geplant' },
      { label: 'Massenentlassung – Konsultationsfristen', status: 'geplant' },
    ],
    description: 'Ordentliche Kündigungsfristen und Sperrfristen (Kündigung zur Unzeit) im Arbeitsverhältnis – mit Direkteinstieg zu den Kündigungsschreiben (Arbeitnehmer:in/Arbeitgeber:in).',
    status: 'entwurf',
    norms: [
      // Art. 335c OR – ordentliche Kündigungsfristen
      { label: 'Art. 335c OR', url: fedlexUrl('OR', '335c'), verified: false },
      // Art. 336c OR – Kündigung zur Unzeit (Sperrfristen)
      { label: 'Art. 336c OR', url: fedlexUrl('OR', '336c'), verified: false },
    ],
    href: '/rechner/kuendigung#kuendigung',
    // 'Art. 336c' auch als KEYWORD (nicht nur Norm-Pill): Rang-Parität mit
    // der Vorlage kuendigung-arbeitgeber — bei Gleichstand steht der RECHNER
    // zuoberst (Katalogposition; Logik-Check-Befund 6.6.2026).
    keywords: ['gekündigt', 'Kündigung', 'Kündigungsfrist', 'Probezeit', 'Sperrfrist', 'Krankheit', 'Unfall', 'Schwangerschaft', 'Militär',
      'Kündigung erhalten', 'Art. 336c', 'Art. 335c',
      // Schreiben-Masken (übernommen, E3)
      'Kündigungsschreiben', 'Beendigungsdatum', 'Freistellung', 'kündigen'],
    related: ['lohnfortzahlung', 'arbeitsvertrag'],
    icon: 'document',
  },
  mietrecht: {
    id: 'mietrecht', modus: 'rechner', art: 'frist', rechtsgebiet: 'Miete',
    rechtsbereich: 'privat',
    title: 'Kündigung & Fristen im Mietverhältnis',
    // Themen-Einstieg (Konsolidierung 7.6.2026, E3): Mieter-Schreiben und
    // Vermieter-Checkliste ohne eigene Katalog-Karten (imKatalog:false) —
    // diese Karte trägt ihre Auffindbarkeit, die Rechner-Seite verlinkt sie.
    szenarien: [
      { label: 'Kündigung, Termine & Zahlungsverzug', status: 'entwurf' },
      { label: 'Kündigungsschreiben Mieter:in (Vorlage)', status: 'entwurf' },
      { label: 'Vermieter-Kündigung: Checkliste amtliches Formular', status: 'entwurf' },
      { label: 'Anfechtung & Erstreckung', status: 'geplant' },
    ],
    description: 'Kündigungstermine und -fristen für Wohn- und Geschäftsräume – mit Termin-Hierarchie, Formprüfung und ausserordentlichen Kündigungen; Direkteinstieg zum Kündigungsschreiben (Mieter:in) und zur Vermieter-Checkliste (amtliches Formular).',
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
    // 'Zahlungsrückstand' = Art. 257d OR (Norm-Pill der Karte) — Laien-Synonym
    keywords: ['Mietwohnung', 'Wohnung kündigen', 'Kündigungsfrist', 'Kündigungstermin', 'Vermieter', 'Mieter', 'Geschäftsraum',
      'Zahlungsrückstand', 'Kündigung erhalten',
      // Schreiben-Maske + Vermieter-Checkliste (übernommen, E3)
      'Kündigungsschreiben', 'Familienwohnung', 'Nachmieter', 'ausziehen', 'Auszug',
      'amtliches Formular', 'Anfechtung', 'Erstreckung', 'Art. 266l', 'Art. 271'],
    related: ['mietvertrag-wohnen'],
    icon: 'house',
  },

  // ════ I – Fristen (in Vorbereitung) ════
  'beschwerde-verwaltung': {
    id: 'beschwerde-verwaltung', modus: 'rechner', art: 'frist', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Verwaltungs- & Steuerverfahren – Fristen',
    description: 'Einsprache- und Beschwerdefristen im Verwaltungs- und Steuerverfahren – nicht eidgenössisch vereinheitlicht; kantonale Vielfalt wird gekennzeichnet.',
    status: 'geplant', norms: [],
  },
  sozialversicherung: {
    id: 'sozialversicherung', modus: 'rechner', art: 'frist', rechtsgebiet: 'Sozialversicherungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Sozialversicherung (ATSG) – Fristen',
    description: 'Einsprache- und Beschwerdefristen sowie Leistungsverwirkung und Nachzahlung – IV, AHV, Unfall- und Krankenversicherung.',
    status: 'geplant', norms: [],
  },
  verjaehrung: {
    id: 'verjaehrung', modus: 'rechner', art: 'frist', rechtsgebiet: 'Vertrag & Forderung (OR)',
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
    keywords: ['Verjährung', 'verjährt', 'Frist', 'Forderung', 'unerlaubte Handlung', 'Bereicherung', 'Unterbrechung', 'Verzicht', 'Einrede',
      'Art. 127 OR', 'Art. 128 OR'],
    related: ['verzugszins', 'rechtsoeffnungsbegehren'],
    icon: 'clock',
  },
  gewaehrleistung: {
    id: 'gewaehrleistung', modus: 'rechner', art: 'frist', rechtsgebiet: 'Vertrag & Forderung (OR)',
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
    id: 'erbrecht-fristen', modus: 'rechner', art: 'frist', rechtsgebiet: 'Erbrecht',
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
    id: 'familie-fristen', modus: 'rechner', art: 'frist', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Familienrechtliche Fristen',
    description: 'Fristen bei Scheidung und Anfechtung des Kindesverhältnisses.',
    status: 'geplant', norms: [],
  },
  'gesellschaftsrecht-fristen': {
    id: 'gesellschaftsrecht-fristen', modus: 'rechner', art: 'frist', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Gesellschaftsrechtliche Fristen',
    description: 'Einberufungs- und Traktandierungsfristen sowie Verjährung der Verantwortlichkeitsklage.',
    status: 'geplant', norms: [],
  },
  'bgg-fristen': {
    id: 'bgg-fristen', modus: 'rechner', art: 'frist', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'uebergreifend',
    title: 'Beschwerde ans Bundesgericht (BGG)',
    description: 'Weiterzug ans Bundesgericht für alle vier Beschwerdewege: Zulässigkeit (Streitwertgrenzen mit Ausnahmen), Frist 30/10/5/3 Tage mit Stillstand und konkretem Fristende, zuständige Abteilung – inkl. subsidiärer Verfassungsbeschwerde.',
    status: 'entwurf',
    norms: [
      // Art. 74 BGG – Streitwertgrenzen + Ausnahmen (Wortlaut verifiziert 11.6.2026)
      { label: 'Art. 74 BGG', url: fedlexUrl('BGG', '74'), verified: false },
      // Art. 100 BGG – Beschwerdefristen inkl. Sonderfristen (Wortlaut verifiziert 11.6.2026)
      { label: 'Art. 100 BGG', url: fedlexUrl('BGG', '100'), verified: false },
      // Art. 46 BGG – Fristenstillstand + Ausnahmen (Wortlaut verifiziert 11.6.2026)
      { label: 'Art. 46 BGG', url: fedlexUrl('BGG', '46'), verified: false },
      // Art. 113 BGG – subsidiäre Verfassungsbeschwerde (Wortlaut verifiziert 11.6.2026)
      { label: 'Art. 113 BGG', url: fedlexUrl('BGG', '113'), verified: false },
      // Art. 33 BGerR – Abteilungs-Zuteilung (zeichengenau verifiziert 7.6./11.6.2026)
      { label: 'Art. 33 BGerR', url: fedlexUrl('BGerR', '33'), verified: false },
    ],
    href: '/rechner/bgg-fristen',
    related: ['zustaendigkeit', 'streitwert', 'tagerechner', 'schkg-fristen'],
    keywords: ['Bundesgericht', 'BGer', 'Beschwerde', 'BGG', 'Streitwertgrenze', 'Verfassungsbeschwerde', 'Rechtsöffnung', 'Abteilung', 'Frist 30 Tage'],
  },
  'straf-verjaehrung': {
    id: 'straf-verjaehrung', modus: 'rechner', art: 'frist', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Strafrechtliche Verjährung',
    description: 'Verfolgungs- und Vollstreckungsverjährung nach Strafrahmen.',
    status: 'geplant', norms: [],
  },

  // ════ II – Beträge & Quoten (geprüft) ════
  verzugszins: {
    id: 'verzugszins', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Vertrag & Forderung (OR)',
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
    id: 'lohnfortzahlung', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Arbeit',
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
    id: 'erbteilung', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Erbrecht',
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
    id: 'prozesskosten', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Gerichts-, Partei- & Betreibungskosten',
    description: 'Kostenschätzung nach Streitwert und Tarif; kantonale Tarife werden gekennzeichnet.',
    status: 'geplant', norms: [],
  },
  streitwert: {
    id: 'streitwert', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Streitwert (ZPO)',
    description: 'Streitwert aus den Rechtsbegehren nach Art. 91–94a ZPO: Kapitalisierung wiederkehrender Leistungen (× 20, Leibrenten-Barwert als Weiche), Klagenhäufung mit Ausschliesslichkeits-Schalter, Widerklage mit getrennter Kosten-Bemessungsgrundlage und Teilklage-Sonderregel (Revision 2025). Ermessens-Konstellationen (nicht beziffert, Verbandsklage) werden offengelegt, nie geschätzt.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 91 ZPO', url: fedlexUrl('ZPO', '91'), verified: false },
      { label: 'Art. 92 ZPO', url: fedlexUrl('ZPO', '92'), verified: false },
      { label: 'Art. 93 ZPO', url: fedlexUrl('ZPO', '93'), verified: false },
      { label: 'Art. 94 ZPO', url: fedlexUrl('ZPO', '94'), verified: false },
    ],
    href: '/rechner/streitwert',
    related: ['zustaendigkeit', 'zpo-fristen', 'kostenvorschuss'],
    keywords: ['Streitwert', 'Rechtsbegehren', 'Kapitalisierung', 'Widerklage', 'Teilklage', 'Klagenhäufung', 'wiederkehrende Leistung', 'Art. 92', 'Verbandsklage'],
  },
  'arbeit-entschaedigung': {
    id: 'arbeit-entschaedigung', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Arbeitsrechtliche Entschädigungen & Zuschläge',
    description: 'Überstunden, Ferienlohn, 13. Monatslohn pro rata sowie Entschädigung bei missbräuchlicher oder fristloser Kündigung.',
    status: 'geplant', norms: [],
  },
  'erb-ausgleichung': {
    id: 'erb-ausgleichung', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Erbrechtliche Ausgleichung & Güterrecht',
    description: 'Ausgleichung und Hinzurechnung sowie güterrechtliche Auseinandersetzung als Vorstufe.',
    status: 'geplant', norms: [],
  },
  mietzinsanpassung: {
    id: 'mietzinsanpassung', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Miete',
    rechtsbereich: 'privat',
    title: 'Mietzinsanpassung (Referenzzinssatz)',
    description: 'Anpassung des Mietzinses nach Referenzzinssatz, Teuerung und Kostensteigerung.',
    status: 'geplant', norms: [],
  },
  vorsorgeausgleich: {
    id: 'vorsorgeausgleich', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Vorsorgeausgleich (BVG) bei Scheidung',
    description: 'Teilung der während der Ehe geäufneten Austrittsleistungen der beruflichen Vorsorge.',
    status: 'geplant', norms: [],
  },
  existenzminimum: {
    id: 'existenzminimum', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Existenzminimum & Pfändungsquote',
    description: 'Ermittlung des pfändbaren Betrags; Richtlinien- und kantonsabhängig.',
    status: 'geplant', norms: [],
  },

  // ════ III – Zuständigkeit & Einordnung ════
  // EINE Zuständigkeits-Karte statt der drei Einzelkarten gerichtsstand/
  // verfahrensart/schlichtung (Konsolidierung 5.6.2026): die Engine
  // beantwortet alle drei Fragen in einem Durchlauf (ZUSTAENDIGKEIT-AUFTRAG.md).
  // S-3 STRUKTUR-UMBAU (Auftrag David 10.6.2026 abends): Die Zuständigkeit
  // ist wieder VIERTEILIG sichtbar — Zivilprozess · Vollstreckung ·
  // Strafverfahren · Verwaltungsverfahren erhalten je ein eigenes Feld in
  // der Kategorie-Ansicht (übersteuert die E2-Konsolidierung vom 7.6. für
  // diese Kategorie). Dieselbe Rechner-Seite trägt weiterhin die Weiche
  // (#schkg/#straf); Verwaltungsverfahren ist ehrlich «geplant» (keine
  // Engine). Reihenfolge: lib/zustaendigkeitKategorie.ts.
  zustaendigkeit: {
    id: 'zustaendigkeit', modus: 'rechner', art: 'zuordnung', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Zuständigkeit Zivilprozess',
    szenarien: [
      { label: 'Einleitung: Verfahrensart · Schlichtung · Gerichtsstand', status: 'entwurf' },
      { label: 'Rechtsmittel: Berufung/Beschwerde mit Fristen', status: 'entwurf' },
    ],
    description: 'Welches Gericht und welches Verfahren im Zivilprozess: Verfahrensart, Schlichtungspflicht und -behörde, örtlicher Gerichtsstand nach ZPO sowie die Rechtsmittel-Strecke (Berufung/Beschwerde samt Fristen); konkrete Stelle mit Adresse für erfasste Kantone.',
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
    keywords: ['Zuständigkeit', 'Gerichtsstand', 'Verfahrensart', 'Schlichtung', 'Schlichtungsbehörde', 'Streitwert', 'Handelsgericht',
      'Urteil', 'Urteil erhalten', 'Entscheid', 'Rechtsmittel', 'Berufung', 'Beschwerde', 'Scheidung',
      'Gerichtskosten', 'örtliche Zuständigkeit', 'sachliche Zuständigkeit'],
    related: ['zpo-fristen', 'schlichtungsgesuch', 'schkg-zustaendigkeit', 'straf-zustaendigkeit'],
    icon: 'scale',
  },
  'schkg-zustaendigkeit': {
    id: 'schkg-zustaendigkeit', modus: 'rechner', art: 'zuordnung', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Zuständigkeit Vollstreckung (SchKG)',
    description: 'Betreibungsort (Art. 46–55 SchKG), zuständige Stelle (Betreibungsamt, Gericht oder Aufsichtsbehörde) und Fristen je Anliegen – von der Einleitung der Betreibung bis zur Beschwerde gegen das Amt; konkrete Amtsadresse für erfasste Kantone.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 46 SchKG', url: fedlexUrl('SchKG', '46'), verified: false },
      { label: 'Art. 84 SchKG', url: fedlexUrl('SchKG', '84'), verified: false },
      { label: 'Art. 17 SchKG', url: fedlexUrl('SchKG', '17'), verified: false },
    ],
    href: '/rechner/zustaendigkeit#schkg',
    keywords: ['Zuständigkeit', 'Vollstreckung', 'Betreibungsort', 'Betreibungsamt', 'Rechtsöffnung', 'Arrest', 'Aufsichtsbeschwerde', 'Konkursgericht',
      'betreiben', 'Betreibung einleiten', 'Schuldner', 'Wohnsitz'],
    related: ['schkg-fristen', 'betreibungskosten', 'zustaendigkeit'],
    icon: 'scale',
  },
  'straf-zustaendigkeit': {
    id: 'straf-zustaendigkeit', modus: 'rechner', art: 'zuordnung', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Zuständigkeit Strafverfahren',
    description: 'Örtlicher Gerichtsstand und zuständige Strafbehörde (Art. 31–42 StPO), Anzeige-Fahrplan sowie das statthafte Rechtsmittel mit Fristen (Art. 379 ff. StPO); Staatsanwaltschafts-Adresse für erfasste Kantone.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 31 StPO', url: fedlexUrl('StPO', '31'), verified: false },
      { label: 'Art. 301 StPO', url: fedlexUrl('StPO', '301'), verified: false },
    ],
    href: '/rechner/zustaendigkeit#straf',
    keywords: ['Zuständigkeit', 'Strafverfahren', 'Tatort', 'Staatsanwaltschaft', 'Strafanzeige', 'Strafantrag', 'Einsprache', 'Gerichtsstand'],
    related: ['strafanzeige', 'strafantrag-vorlage', 'zustaendigkeit'],
    icon: 'scale',
  },
  'verwaltung-zustaendigkeit': {
    id: 'verwaltung-zustaendigkeit', modus: 'rechner', art: 'zuordnung', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Zuständigkeit Verwaltungsverfahren',
    description: 'Zuständige Behörde und Beschwerdeinstanz im Verwaltungsverfahren (VwVG/kantonal) – Einsprache, Beschwerde und Rechtsmittelweg.',
    status: 'geplant', norms: [],
    keywords: ['Zuständigkeit', 'Verwaltungsverfahren', 'Verfügung', 'Einsprache', 'Beschwerde', 'Beschwerdeinstanz', 'VwVG'],
    related: ['zustaendigkeit'],
  },
  iprg: {
    id: 'iprg', modus: 'rechner', art: 'zuordnung', rechtsgebiet: 'Weitere Rechtsgebiete',
    rechtsbereich: 'uebergreifend',
    title: 'Anwendbares Recht (IPRG)',
    description: 'Anwendbares Recht und Gerichtsstand bei internationalem Bezug.',
    status: 'geplant', norms: [],
  },

  // ════ IV – Werkzeuge (in Vorbereitung) ════
  tagerechner: {
    id: 'tagerechner', modus: 'rechner', art: 'werkzeug', rechtsgebiet: 'Übergreifende Werkzeuge',
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
    // FE-6: Vaterschaft/KESB am Preset-Code verifiziert (famStatusPresets —
    // Vaterschaftsklage Art. 263, Anfechtung Art. 256c, KESB 450b/445 ZGB).
    keywords: ['Frist', 'Fristende', 'Tagerechner', 'Art. 77', 'Art. 78', 'Feiertag', 'dies a quo',
      'Vaterschaft', 'KESB'],
    icon: 'clock',
  },
  // S-5c STRUKTUR-UMBAU 10.6.2026 abends (Auftrag David): Die Karte
  // «Fristenspiegel» ist AUFGELÖST — die sechs Ereignisse leben als
  // Ereignis-Block in den Fach-Rechnern (ZPO: Zivilentscheid +
  // Klagebewilligung · SchKG: Zahlungsbefehl · Erbrecht: Erbgang ·
  // Kündigung: 336b · Mietrecht: zeigt Anfechtung/Erstreckung selbst);
  // /rechner/fristenspiegel ist ein Redirect mit Query-Weiterreichung.
  'ferien-checker': {
    id: 'ferien-checker', modus: 'rechner', art: 'werkzeug', rechtsgebiet: 'Übergreifende Werkzeuge',
    rechtsbereich: 'uebergreifend',
    title: 'Gerichts- & Betreibungsferien-Checker',
    description: 'Prüft, ob ein Datum in Gerichts- oder Betreibungsferien fällt.',
    status: 'geplant', norms: [],
  },
  teuerungsrechner: {
    id: 'teuerungsrechner', modus: 'rechner', art: 'werkzeug', rechtsgebiet: 'Übergreifende Werkzeuge',
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
    id: 'ferien-assistent', modus: 'rechner', art: 'werkzeug', rechtsgebiet: 'Übergreifende Werkzeuge',
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
    id: 'bundesgerichtsgebuehren', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'uebergreifend',
    title: 'Bundesgerichtsgebühren',
    description: 'Gerichtsgebühren der eidgenössischen Gerichte nach Streitwert und Verfahrensart.',
    status: 'geplant', norms: [],
    related: ['bgg-fristen', 'prozesskosten'],
    keywords: ['BGer', 'BVGer', 'BStGer', 'BPatGer', 'Gerichtsgebühren'],
  },
  kostenvorschuss: {
    id: 'kostenvorschuss', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Kostenvorschuss',
    description: 'Vorschuss auf die Gerichtskosten im Zivilprozess.',
    status: 'geplant', norms: [],
    related: ['prozesskosten', 'zpo-fristen'],
    keywords: ['Vorschuss', 'Gerichtskosten'],
  },
  'parteientschaedigung-sicherheit': {
    id: 'parteientschaedigung-sicherheit', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Sicherheit für die Parteientschädigung',
    description: 'Sicherstellung der Parteientschädigung bei besonderen Risiken auf Klägerseite.',
    status: 'geplant', norms: [],
    related: ['prozesskosten'],
    keywords: ['Kaution', 'Sicherstellung', 'Parteientschädigung'],
  },
  rechtsmittelpruefung: {
    id: 'rechtsmittelpruefung', modus: 'rechner', art: 'zuordnung', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'uebergreifend',
    title: 'Rechtsmittelprüfung',
    description: 'Welches Rechtsmittel gegen welchen Entscheid offensteht – Weg, Instanz und Anforderungen.',
    status: 'geplant', norms: [],
    related: ['zpo-fristen', 'bgg-fristen'],
    keywords: ['Berufung', 'Beschwerde', 'Revision', 'Rechtsmittel'],
  },

  // – Arbeit —
  ferienanspruch: {
    id: 'ferienanspruch', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Ferienanspruch',
    description: 'Ferienguthaben nach Alter, Pensum und Ein- oder Austritt im Dienstjahr.',
    status: 'geplant', norms: [],
    related: ['ferienkuerzung', 'lohnfortzahlung'],
    keywords: ['Ferien', 'Ferienguthaben', 'pro rata'],
  },
  ferienkuerzung: {
    id: 'ferienkuerzung', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Ferienkürzung',
    description: 'Kürzung des Ferienanspruchs bei längeren Absenzen.',
    status: 'geplant', norms: [],
    related: ['ferienanspruch', 'lohnfortzahlung'],
    keywords: ['Ferien', 'Kürzung', 'Absenz', 'Krankheit'],
  },
  'dreizehnter-monatslohn': {
    id: 'dreizehnter-monatslohn', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Anteiliger 13. Monatslohn',
    description: 'Pro-rata-Anteil des 13. Monatslohns bei unterjährigem Ein- oder Austritt.',
    status: 'geplant', norms: [],
    related: ['lohnfortzahlung'],
    keywords: ['13. Monatslohn', 'pro rata', 'Austritt'],
  },
  'ueberstunden-zuschlag': {
    id: 'ueberstunden-zuschlag', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Überstunden- & Überzeitzuschlag',
    description: 'Vergütung von Überstunden und Überzeit samt Zuschlägen.',
    status: 'geplant', norms: [],
    related: ['arbeit-entschaedigung'],
    keywords: ['Überstunden', 'Überzeit', 'Zuschlag', 'Kompensation'],
  },

  // – Vertrag & Forderung (OR) —
  schadenszins: {
    id: 'schadenszins', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Schadenszins',
    description: 'Zins auf Schadenersatzforderungen vom Schadenseintritt bis zur Zahlung.',
    status: 'geplant', norms: [],
    related: ['verzugszins', 'verjaehrung'],
    keywords: ['Schadenszins', 'Schadenersatz', 'Zins'],
  },

  // – Familienrecht —
  'gueterrecht-vorschlag': {
    id: 'gueterrecht-vorschlag', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Güterrechtliche Auseinandersetzung / Vorschlag',
    description: 'Aufteilung von Errungenschaft und Vorschlag bei Auflösung des Güterstands.',
    status: 'geplant', norms: [],
    related: ['vorsorgeausgleich', 'erb-ausgleichung'],
    keywords: ['Güterrecht', 'Errungenschaft', 'Vorschlag'],
  },

  // – Gesellschaftsrecht —
  beteiligungsquoten: {
    id: 'beteiligungsquoten', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Beteiligungs- & Stimmrechtsquoten',
    description: 'Kapital- und Stimmenanteile sowie Schwellen für Beschlüsse und Rechte.',
    status: 'geplant', norms: [],
    related: ['gv-vr-beschluss'],
    keywords: ['Quorum', 'Stimmrecht', 'Beteiligung', 'Schwelle'],
  },
  liberierungsgrad: {
    id: 'liberierungsgrad', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Liberierungsgrad',
    description: 'Einbezahltes Kapital im Verhältnis zum Nennkapital.',
    status: 'geplant', norms: [],
    related: ['kapitalerhoehung'],
    keywords: ['Liberierung', 'Aktienkapital', 'Stammkapital'],
  },
  kapitalverlust: {
    id: 'kapitalverlust', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Kapitalverlust',
    description: 'Feststellung eines Kapitalverlusts und der daran geknüpften Handlungspflichten.',
    status: 'geplant', norms: [],
    related: ['ueberschuldung'],
    keywords: ['Kapitalverlust', 'Sanierung', 'Aktienrecht', 'GmbH'],
  },
  ueberschuldung: {
    id: 'ueberschuldung', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Überschuldung',
    description: 'Prüfung der Überschuldung und der Pflichten des Verwaltungsrats.',
    status: 'geplant', norms: [],
    related: ['kapitalverlust'],
    keywords: ['Überschuldung', 'Benachrichtigung', 'Bilanz'],
  },
  // Plan 9c (7.6.2026, Auftrag David): von der geplanten Rechner-Karte zur
  // Dokumentmappe umgebaut — Spez. recherche/kapitalerhoehung-wortlaute.md.
  kapitalerhoehung: {
    id: 'kapitalerhoehung', modus: 'vorlage', art: 'gesellschaft', rechtsgebiet: 'Gesellschaftsrecht',
    formGate: 'gemischt',
    rechtsbereich: 'privat',
    title: 'Kapitalerhöhung (AG / GmbH)',
    description: 'Ordentliche Kapitalerhöhung gegen Bareinlage als Dokumentmappe: Erhöhungsbeschluss und Feststellungs-Urkunde mit Statutenänderung als Entwurf für die Urkundsperson (öffentliche Beurkundung bleibt zwingend, Art. 650/652g OR), Zeichnungsscheine je Person, Kapitalerhöhungsbericht und Handelsregister-Anmeldung druckfertig – mit 6-Monats-Verfalls-Warnung (Art. 650 Abs. 3 / 781 Abs. 4 OR) und Notariats-Anlaufstelle je Kanton.',
    status: 'entwurf',
    output: ['pdf', 'docx'],
    schemaId: 'kapitalerhoehungsmappe',
    norms: [
      // Art. 650 OR – Beschluss-Inhalt + 6-Monats-Verfall (rev. 2023)
      { label: 'Art. 650 OR', url: fedlexUrl('OR', '650'), verified: false },
      // Art. 652 OR – Zeichnungsschein (Abs. 3 aufgehoben!)
      { label: 'Art. 652 OR', url: fedlexUrl('OR', '652'), verified: false },
      // Art. 652g OR – Statutenänderung + Feststellungen (Beurkundung)
      { label: 'Art. 652g OR', url: fedlexUrl('OR', '652g'), verified: false },
      // Art. 781 OR – GmbH-Verweiskette
      { label: 'Art. 781 OR', url: fedlexUrl('OR', '781'), verified: false },
    ],
    href: '/vorlagen/kapitalerhoehung',
    formvorschrift: 'Erhöhungsbeschluss (Art. 650 Abs. 2 OR) und Feststellungs-Urkunde (Art. 652g Abs. 2 OR) nur als öffentliche Urkunde – beide darum ausschliesslich als ENTWURF mit Wasserzeichen. Zeichnungsscheine, Bericht und Anmeldung sind druckfertig.',
    related: ['liberierungsgrad', 'statuten', 'gmbh-gruendung', 'ag-gruendung'],
    keywords: ['Kapitalerhöhung', 'Bezugsrecht', 'Zeichnungsschein', 'Kapitalerhöhungsbericht', 'Statutenänderung', 'Art. 650', 'Art. 652g', 'Art. 781', 'Agio'],
  },

  // – Strafrecht & Strafprozess —

  // – Verwaltungsrecht —
  'baurecht-fristen': {
    id: 'baurecht-fristen', modus: 'rechner', art: 'frist', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Bau- & planungsrechtliche Fristen',
    description: 'Einsprache- und Beschwerdefristen in Bau- und Planungsverfahren.',
    status: 'geplant', norms: [],
    related: ['beschwerde-verwaltung'],
    keywords: ['Baubewilligung', 'Einsprache', 'Nutzungsplanung'],
  },
  'vergabe-fristen': {
    id: 'vergabe-fristen', modus: 'rechner', art: 'frist', rechtsgebiet: 'Verwaltungsrecht',
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
    id: 'steuer-verjaehrung', modus: 'rechner', art: 'frist', rechtsgebiet: 'Steuerrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Steuerrechtliche Verjährung',
    description: 'Veranlagungs- und Bezugsverjährung im Steuerrecht.',
    status: 'geplant', norms: [],
    related: ['beschwerde-verwaltung'],
    keywords: ['Verjährung', 'Veranlagung', 'Bezug'],
  },
  verrechnungssteuer: {
    id: 'verrechnungssteuer', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Steuerrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Verrechnungssteuer',
    description: 'Abzug und Rückerstattung der Verrechnungssteuer.',
    status: 'geplant', norms: [],
    keywords: ['Verrechnungssteuer', 'Rückerstattung'],
  },
  grundstueckgewinnsteuer: {
    id: 'grundstueckgewinnsteuer', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Steuerrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Grundstückgewinn- & Handänderungssteuer (kantonal)',
    description: 'Kantonale Steuern bei der Veräusserung von Grundstücken.',
    status: 'geplant', norms: [],
    keywords: ['Grundstückgewinn', 'Handänderung', 'kantonal'],
  },

  // – Sozialversicherungsrecht —
  'ahv-beitraege': {
    id: 'ahv-beitraege', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Sozialversicherungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'AHV-Beiträge',
    description: 'Beiträge an AHV/IV/EO für Angestellte, Selbständige und Nichterwerbstätige.',
    status: 'geplant', norms: [],
    related: ['sozialversicherung'],
    keywords: ['AHV', 'IV', 'EO', 'Beiträge'],
  },

  // – Datenschutzrecht —
  'datenschutz-fristen': {
    id: 'datenschutz-fristen', modus: 'rechner', art: 'frist', rechtsgebiet: 'Datenschutzrecht',
    rechtsbereich: 'privat',
    title: 'Datenschutzrechtliche Fristen',
    description: 'Fristen rund um Auskunft, Meldung und Aufbewahrung.',
    status: 'geplant', norms: [],
    related: ['auskunftsbegehren', 'loeschungsbegehren'],
    keywords: ['Datenschutz', 'DSG', 'Auskunft'],
  },

  // – Ausländerrecht —
  'auslaenderrecht-fristen': {
    id: 'auslaenderrecht-fristen', modus: 'rechner', art: 'frist', rechtsgebiet: 'Ausländerrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Ausländer- & asylrechtliche Fristen',
    description: 'Fristen in ausländer- und asylrechtlichen Verfahren.',
    status: 'geplant', norms: [],
    keywords: ['Migrationsrecht', 'Asyl', 'Bewilligung'],
  },

  // – Weitere Rechtsgebiete —

  // – Übergreifende Werkzeuge —
  checklisten: {
    id: 'checklisten', modus: 'rechner', art: 'werkzeug', rechtsgebiet: 'Übergreifende Werkzeuge',
    rechtsbereich: 'uebergreifend',
    title: 'Checklisten',
    description: 'Strukturierte Prüf- und Arbeitslisten für wiederkehrende Abläufe.',
    status: 'geplant', norms: [],
    keywords: ['Checkliste', 'Ablauf'],
  },
  mandatsaufnahme: {
    id: 'mandatsaufnahme', modus: 'rechner', art: 'werkzeug', rechtsgebiet: 'Übergreifende Werkzeuge',
    rechtsbereich: 'uebergreifend',
    title: 'Mandatsaufnahme-Formular',
    description: 'Strukturierte Erfassung der Eckdaten eines neuen Mandats.',
    status: 'geplant', norms: [],
    keywords: ['Mandat', 'Aufnahme', 'Konflikt-Check'],
  },
  'kostenblatt-export': {
    id: 'kostenblatt-export', modus: 'rechner', art: 'werkzeug', rechtsgebiet: 'Übergreifende Werkzeuge',
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
    id: 'eigenhaendiges-testament', modus: 'vorlage', art: 'vorsorge', rechtsgebiet: 'Erbrecht',
    formGate: 'abschrift',
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
    id: 'oeffentliches-testament', modus: 'vorlage', art: 'vorsorge', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Öffentliches Testament',
    description: 'Vorbereitungsentwurf für die öffentliche Beurkundung bei der Urkundsperson.',
    status: 'geplant', norms: [], related: ['erbteilung'],
    icon: 'document',
  },
  erbvertrag: {
    id: 'erbvertrag', modus: 'vorlage', art: 'vorsorge', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Erbvertrag',
    description: 'Entwurf für die vertragliche Nachlassregelung – zur Vorbereitung der Beurkundung.',
    status: 'geplant', norms: [], related: ['erbteilung'],
    icon: 'document',
  },
  vorsorgeauftrag: {
    id: 'vorsorgeauftrag', modus: 'vorlage', art: 'vorsorge', rechtsgebiet: 'Vorsorge & Erwachsenenschutz',
    formGate: 'abschrift',
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
    id: 'patientenverfuegung', modus: 'vorlage', art: 'vorsorge', rechtsgebiet: 'Vorsorge & Erwachsenenschutz',
    formGate: 'fertig',
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
    id: 'arbeitsvertrag', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Arbeit',
    vertragRubrik: 'arbeit', formGate: 'fertig',
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
    related: ['lohnfortzahlung', 'kuendigung-sperrfristen', 'arbeitszeugnis'], // Konsolidierung E3: Masken-Ref über den Themen-Einstieg
    keywords: ['Arbeitsvertrag', 'Probezeit', 'Konkurrenzverbot', 'Überstunden', '13. Monatslohn', 'Art. 319', 'Art. 335c'],
    icon: 'document',
  },
  // Maske 2b der Kündigungs-Familie (Spez. §8-Grenze, gebaut 6.6.2026):
  // bewusst KEINE Vollvorlage — amtliches Formular zwingend (266l Abs. 2);
  // Checkliste + Engine-Auskunft, darum ohne schemaId/output (kein Export).
  'kuendigung-vermieter': {
    id: 'kuendigung-vermieter', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Miete',
    rechtsbereich: 'privat',
    title: 'Kündigung durch Vermieter:in (Checkliste)',
    description: 'Bewusst keine ausfüllbare Vorlage: Die Vermieter-Kündigung von Wohn- und Geschäftsräumen braucht das amtliche kantonale Formular (Art. 266l Abs. 2 OR) – diese Checkliste führt durch die Gültigkeitsvoraussetzungen (separate Zustellung Art. 266n!) und liefert Termin, Anfechtungs- und Erstreckungsfristen als Auskunft.',
    status: 'entwurf',
    norms: [
      // Art. 266l OR – amtliches Formular (Abs. 2)
      { label: 'Art. 266l OR', url: fedlexUrl('OR', '266l'), verified: false },
      // Art. 266n OR – separate Zustellung (Familienwohnung)
      { label: 'Art. 266n OR', url: fedlexUrl('OR', '266n'), verified: false },
      // Art. 266o OR – Nichtigkeit bei Formverstoss
      { label: 'Art. 266o OR', url: fedlexUrl('OR', '266o'), verified: false },
      // Art. 271 OR – Anfechtbarkeit (Treu und Glauben)
      { label: 'Art. 271 OR', url: fedlexUrl('OR', '271'), verified: false },
    ],
    href: '/vorlagen/kuendigung-vermieter',
    imKatalog: false, // E3 — Einstieg über den Miet-Themen-Einstieg
    formvorschrift: 'Nur mit dem vom Kanton genehmigten amtlichen Formular gültig (Art. 266l Abs. 2 OR) – darum kein Export.',
    related: ['kuendigung-mieter', 'mietrecht', 'zustaendigkeit'],
    keywords: ['Kündigung', 'Vermieter', 'amtliches Formular', 'Familienwohnung', 'Art. 266l', 'Art. 266n', 'Anfechtung', 'Erstreckung'],
  },
  // Maske 2a der Kündigungs-Familie (Spez. recherche/kuendigungs-masken.md,
  // gebaut 6.6.2026): Mietengine LIVE; Familienwohnung-Nichtigkeit = Blocker.
  'kuendigung-mieter': {
    id: 'kuendigung-mieter', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Miete',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Kündigung durch Mieter:in',
    description: 'Kündigungsschreiben für das Mietverhältnis mit live berechnetem Endtermin (Vertrag → Ortsgebrauch → Gesetz), Familienwohnung-Schutz (Art. 266m OR, zweite Unterschrift) und ausserterminlicher Rückgabe mit Nachmieter-Vorschlag (Art. 264 OR).',
    status: 'entwurf',
    norms: [
      // Art. 266a OR – Termine und Fristen (verfehlter Termin Abs. 2)
      { label: 'Art. 266a OR', url: fedlexUrl('OR', '266a'), verified: false },
      // Art. 266l OR – Schriftform (Wohn-/Geschäftsräume)
      { label: 'Art. 266l OR', url: fedlexUrl('OR', '266l'), verified: false },
      // Art. 266m OR – Wohnung der Familie (Zustimmung)
      { label: 'Art. 266m OR', url: fedlexUrl('OR', '266m'), verified: false },
      // Art. 264 OR – vorzeitige Rückgabe (Nachmieter)
      { label: 'Art. 264 OR', url: fedlexUrl('OR', '264'), verified: false },
    ],
    href: '/vorlagen/kuendigung-mieter',
    imKatalog: false, // E3 — Einstieg über den Miet-Themen-Einstieg
    schemaId: 'kuendigung-mieter',
    formvorschrift: 'Schriftform bei Wohn-/Geschäftsräumen (Art. 266l Abs. 1 OR) — unterschreiben; Familienwohnung: beide unterschreiben.',
    output: ['pdf', 'docx'],
    related: ['mietrecht', 'mietvertrag-wohnen', 'mietzinsanpassung'],
    keywords: ['Kündigung', 'Mietvertrag', 'Wohnung kündigen', 'Kündigungstermin', 'Familienwohnung', 'Nachmieter', 'Art. 264', 'Art. 266m',
      'ausziehen', 'Auszug'],
  },
  'mietvertrag-wohnen': {
    id: 'mietvertrag-wohnen', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Miete',
    vertragRubrik: 'miete_pacht', formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Mietvertrag (Wohnen · Geschäft · Untermiete)',
    // Konsolidierung 7.6.2026 (E2): der Untermiete-Deep-Link-Einstieg (#untermiete,
    // gleiches Schema) ist in diese Karte eingeschmolzen — die Weiche liegt im Wizard.
    description: 'Mietvertrag mit Objekt-Weiche Wohn-/Geschäftsraum und Untermiete-Variante (Art. 262 OR) aus festen Bausteinen – Kautionsmaximum, Mindestfristen und Index-/Staffel-Voraussetzungen als harte Schranken; kantonale Formularpflicht für den Anfangsmietzins als offengelegtes Form-Gate.',
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
    keywords: ['Mietvertrag', 'Kaution', 'Nebenkosten', 'Indexmiete', 'Staffelmiete', 'Formularpflicht', 'Art. 257e', 'Art. 269b',
      'Mietzins',
      // Untermiete (übernommen aus der eingeschmolzenen Deep-Link-Karte)
      'Untermiete', 'Untermietvertrag', 'Untervermietung', 'Zustimmung Vermieter', 'Art. 262', 'WG-Zimmer', 'möbliertes Zimmer'],
    icon: 'house',
  },
  darlehensvertrag: {
    id: 'darlehensvertrag', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Vertrag & Forderung (OR)',
    vertragRubrik: 'darlehen_sicherheiten',
    rechtsbereich: 'privat',
    title: 'Darlehensvertrag',
    description: 'Privates Darlehen mit Zins-, Rückzahlungs- und Kündigungsregeln.',
    status: 'geplant', norms: [], related: ['verzugszins', 'rechtsoeffnungsbegehren'],
    icon: 'percent',
  },
  kaufvertrag: {
    id: 'kaufvertrag', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Vertrag & Forderung (OR)',
    vertragRubrik: 'kauf',
    rechtsbereich: 'privat',
    title: 'Einfacher Kaufvertrag',
    description: 'Kauf beweglicher Sachen mit Gewährleistungs- und Lieferklauseln.',
    status: 'geplant', norms: [], related: ['gewaehrleistung', 'verzugszins'],
    icon: 'clipboard',
  },

  // ════ III – Eingaben ════
  schlichtungsgesuch: {
    id: 'schlichtungsgesuch', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_allgemein', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    formGate: 'fertig',
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
    id: 'klage-vereinfacht', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_allgemein', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Klage (vereinfachtes Verfahren)',
    description: 'Klage nach Art. 244 ZPO aus festen Bausteinen: Rechtsbegehren (beziffert/unbeziffert), Streitgegenstand, freiwillige strukturierte Begründung mit Beweismitteln, Beilagen mit Klagebewilligung – Gerichts-Adressat für alle 26 Kantone (Spruchkörper-Routing amtlich abgenommen für Basel-Stadt), Kostenfreiheits-Prüfung und Klagefrist mit Gerichtsferien.',
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
  'klage-ordentlich': {
    // S-2 (Auftrag David 10.6.2026: «Klage einmal allgemein in Schlichtungs-
    // gesuch, einfache [vereinfachte], ordentliche Klage») — Platzhalter der
    // Rubrik «Klagen – allgemein»; Bau folgt nach Roadmap-Priorisierung.
    id: 'klage-ordentlich', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_allgemein', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Klage (ordentliches Verfahren)',
    description: 'Klageschrift nach Art. 221 ZPO aus festen Bausteinen: Rechtsbegehren, Streitwertangabe, Tatsachenbehauptungen mit Beweisofferte je Ziffer (Pflicht), fakultative rechtliche Begründung, Beweismittel- und Beilagenverzeichnis – Gerichts-Adressat für alle 26 Kantone, Klagefrist mit Gerichtsferien.',
    status: 'entwurf',
    output: ['pdf', 'docx'],
    schemaId: 'klage-ordentlich',
    href: '/vorlagen/klage-ordentlich',
    norms: [
      { label: 'Art. 220 ZPO', url: fedlexUrl('ZPO', '220'), verified: false },
      { label: 'Art. 221 ZPO', url: fedlexUrl('ZPO', '221'), verified: false },
      { label: 'Art. 209 ZPO', url: fedlexUrl('ZPO', '209'), verified: false },
    ],
    keywords: ['Klage', 'ordentliches Verfahren', 'Klageschrift', 'Rechtsbegehren'],
    related: ['klage-vereinfacht', 'schlichtungsgesuch', 'zustaendigkeit', 'streitwert'],
    icon: 'document',
  },
  einsprache: {
    id: 'einsprache', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Einsprache (Straf-/Verwaltungsbefehl)',
    description: 'Fristgerechte Einsprache mit Antrag und Begründungsgerüst.',
    status: 'geplant', norms: [],
    icon: 'document',
  },
  beschwerde: {
    id: 'beschwerde', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Beschwerde',
    description: 'Verwaltungsbeschwerde mit Anträgen, Begründung und Beilagen.',
    status: 'geplant', norms: [],
    icon: 'document',
  },
  rechtsoeffnungsbegehren: {
    id: 'rechtsoeffnungsbegehren', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Rechtsöffnungsbegehren',
    description: 'Begehren um provisorische oder definitive Rechtsöffnung mit Forderungsnachweis.',
    status: 'geplant', norms: [], related: ['schkg-fristen', 'verzugszins', 'schuldanerkennung'],
    icon: 'clipboard',
  },

  // ════ IV – Gesellschaftsdokumente ════
  // Gründungs-Masken (Spez. recherche/gmbh-gruendung.md Teil 5 bzw.
  // ag-gruendung.md, gebaut 6.6.2026; GmbH-AUSBAUSTUFE 9b 7.6.2026:
  // Volldokumente aus recherche/gruendungsdokumente-wortlaute.md).
  // Der Errichtungsakt ist öffentlich zu beurkunden (Art. 777/629 OR) —
  // Urkunde/Statuten darum nur als ENTWURF-Export (§8-Gate), Erklärungen/
  // Beschlüsse/Anmeldung druckfertig. Unterlagenliste + Dokument-Auslöser
  // deterministisch aus lib/gruendungsunterlagen.ts (HRegV abschliessend).
  'gmbh-gruendung': {
    id: 'gmbh-gruendung', modus: 'vorlage', art: 'gesellschaft', rechtsgebiet: 'Gesellschaftsrecht',
    formGate: 'gemischt',
    rechtsbereich: 'privat',
    title: 'GmbH-Gründung (Checkliste + Dokumentmappe)',
    description: 'Unterlagenliste UND Volldokumente für die GmbH-Gründung nach Konstellation (Opting-out, c/o-Domizil, Lex Koller, Statuten-Klauseln): Bei der Bargründung entstehen Statuten und Errichtungsakt als Entwurf für die Urkundsperson (die öffentliche Beurkundung bleibt zwingend) sowie Wahlannahme- und Domizilerklärungen, Beschlüsse und die Handelsregister-Anmeldung druckfertig – mit Notariats-Anlaufstelle je Kanton und Emissionsabgabe-Hinweis.',
    status: 'entwurf',
    output: ['pdf', 'docx'],
    // Mappe aus mehreren Schemas (gmbh-statuten · gmbh-errichtungsakt · …) —
    // schemaId nennt die Mappe (lib/vorlagen/gruendungGmbhDokumente.ts).
    schemaId: 'gmbh-gruendungsmappe',
    norms: [
      // Art. 777 OR – Errichtung durch öffentliche Urkunde
      { label: 'Art. 777 OR', url: fedlexUrl('OR', '777'), verified: false },
      // Art. 776 OR – Statuten-Mindestinhalt (rev. 2023, 4 Ziffern)
      { label: 'Art. 776 OR', url: fedlexUrl('OR', '776'), verified: false },
      // Art. 777c OR – Volliberierung + Einlagen-Regeln
      { label: 'Art. 777c OR', url: fedlexUrl('OR', '777c'), verified: false },
      // Art. 71 HRegV – abschliessende Belegliste der Anmeldung
      { label: 'Art. 71 HRegV', url: fedlexUrl('HRegV', '71'), verified: false },
    ],
    href: '/vorlagen/gmbh-gruendung',
    formvorschrift: 'Errichtungsakt nur als öffentliche Urkunde (Art. 777 Abs. 1 OR) – Statuten und Urkunde darum ausschliesslich als ENTWURF mit Wasserzeichen; gültig wird nur die beurkundete Fassung. Beurkundungsfreie Erklärungen und die HR-Anmeldung sind druckfertig.',
    related: ['ag-gruendung', 'statuten', 'gesellschaftsrecht-fristen'],
    keywords: ['GmbH', 'Gründung', 'Errichtungsakt', 'Statuten', 'Handelsregister', 'Stammkapital', 'Beurkundung', 'Opting-out', 'Lex Koller', 'Art. 777', 'HRegV'],
  },
  'ag-gruendung': {
    id: 'ag-gruendung', modus: 'vorlage', art: 'gesellschaft', rechtsgebiet: 'Gesellschaftsrecht',
    formGate: 'gemischt',
    rechtsbereich: 'privat',
    title: 'AG-Gründung (Checkliste + Dokumentmappe)',
    description: 'Unterlagenliste UND Volldokumente für die AG-Gründung nach Konstellation (Opting-out, Inhaberaktien, c/o-Domizil, Lex Koller): Bei der Bargründung mit Namenaktien entstehen Statuten und Errichtungsakt als Entwurf für die Urkundsperson (die öffentliche Beurkundung bleibt zwingend) sowie Wahlannahmen, VR-Konstituierungsprotokoll und die Handelsregister-Anmeldung druckfertig – mit Notariats-Anlaufstelle je Kanton, Teilliberierungs-Prüfung (Art. 632 OR) und Emissionsabgabe-Hinweis.',
    status: 'entwurf',
    output: ['pdf', 'docx'],
    // Mappe aus mehreren Schemas (lib/vorlagen/gruendungAgDokumente.ts).
    schemaId: 'ag-gruendungsmappe',
    norms: [
      // Art. 629 OR – Errichtung durch öffentliche Urkunde
      { label: 'Art. 629 OR', url: fedlexUrl('OR', '629'), verified: false },
      // Art. 626 OR – Statuten-Mindestinhalt (rev. 2023)
      { label: 'Art. 626 OR', url: fedlexUrl('OR', '626'), verified: false },
      // Art. 632 OR – Mindesteinlage (20 % je Aktie, mind. CHF 50 000)
      { label: 'Art. 632 OR', url: fedlexUrl('OR', '632'), verified: false },
      // Art. 43 HRegV – abschliessende Belegliste der Anmeldung
      { label: 'Art. 43 HRegV', url: fedlexUrl('HRegV', '43'), verified: false },
    ],
    href: '/vorlagen/ag-gruendung',
    formvorschrift: 'Errichtungsakt nur als öffentliche Urkunde (Art. 629 Abs. 1 OR) – Statuten und Urkunde darum ausschliesslich als ENTWURF mit Wasserzeichen; gültig wird nur die beurkundete Fassung. Beurkundungsfreie Erklärungen, VR-Protokoll und HR-Anmeldung sind druckfertig.',
    related: ['gmbh-gruendung', 'statuten', 'gesellschaftsrecht-fristen'],
    keywords: ['AG', 'Aktiengesellschaft', 'Gründung', 'Errichtungsakt', 'Statuten', 'Handelsregister', 'Aktienkapital', 'Beurkundung', 'Verwaltungsrat', 'Inhaberaktien', 'Emissionsabgabe', 'Art. 629', 'HRegV'],
  },
  statuten: {
    id: 'statuten', modus: 'vorlage', art: 'gesellschaft', rechtsgebiet: 'Gesellschaftsrecht',
    rechtsbereich: 'privat',
    title: 'Statuten',
    description: 'Statuten für GmbH oder AG mit den üblichen Wahlbestimmungen.',
    status: 'geplant', norms: [],
    icon: 'scale',
  },
  'gv-vr-beschluss': {
    id: 'gv-vr-beschluss', modus: 'vorlage', art: 'gesellschaft', rechtsgebiet: 'Gesellschaftsrecht',
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
    id: 'rechtsvorschlag', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Rechtsvorschlag',
    description: 'Erklärung des Rechtsvorschlags gegen den Zahlungsbefehl.',
    status: 'geplant', norms: [],
    related: ['schkg-fristen', 'rechtsoeffnungsbegehren'],
    keywords: ['Rechtsvorschlag', 'Zahlungsbefehl', 'Betreibung'],
  },
  aberkennungsklage: {
    id: 'aberkennungsklage', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Zwangsvollstreckung', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Aberkennungsklage',
    description: 'Strukturiertes Gerüst für die Aberkennungsklage nach provisorischer Rechtsöffnung.',
    status: 'geplant', norms: [],
    related: ['schkg-fristen', 'rechtsoeffnungsbegehren'],
    keywords: ['Aberkennung', 'Rechtsöffnung'],
  },
  'scheidungsbegehren-gemeinsam': {
    id: 'scheidungsbegehren-gemeinsam', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Familienrecht', rechtsgebiet: 'Familienrecht',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Gemeinsames Scheidungsbegehren',
    // Zweite Musterklagen-Maske Familienrecht (Auftrag David 12.6.2026;
    // Bauspez. §3.2); ZPO/ZGB-Anker am Cache verifiziert 12.6.2026.
    description: 'Gemeinsame Eingabe beider Ehegatten (Art. 285/286 ZPO) – Weiche umfassende Einigung (Art. 111 ZGB) oder Teileinigung mit Pflicht-Antrag auf gerichtliche Beurteilung der streitigen Folgen (Art. 112 ZGB).',
    status: 'entwurf',
    norms: [
      // Art. 285/286 ZPO – Mindestinhalt Voll-/Teileinigung (verifiziert 12.6.2026)
      { label: 'Art. 285 ZPO', url: fedlexUrl('ZPO', '285'), verified: false },
      { label: 'Art. 286 ZPO', url: fedlexUrl('ZPO', '286'), verified: false },
      // Art. 111/112 ZGB – Scheidung auf gemeinsames Begehren (verifiziert 12.6.2026)
      { label: 'Art. 111 ZGB', url: fedlexUrl('ZGB', '111'), verified: false },
      { label: 'Art. 112 ZGB', url: fedlexUrl('ZGB', '112'), verified: false },
    ],
    href: '/vorlagen/scheidungsbegehren-gemeinsam',
    schemaId: 'scheidungsbegehren-gemeinsam',
    formvorschrift: 'Von BEIDEN Ehegatten zu unterzeichnen; mit Vereinbarung und Belegen beim Gericht am Wohnsitz einer Partei einzureichen.',
    output: ['pdf', 'docx'],
    related: ['scheidungsklage', 'vorsorgeausgleich'],
    keywords: ['Scheidung', 'gemeinsames Begehren', 'Scheidungskonvention', 'Art. 285', 'Art. 286', 'Art. 111', 'Art. 112', 'Teileinigung'],
  },
  scheidungsklage: {
    id: 'scheidungsklage', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Familienrecht', rechtsgebiet: 'Familienrecht',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Scheidungsklage (unbegründete Eingabe)',
    // Erste Musterklagen-Maske Familienrecht (Auftrag David 12.6.2026;
    // Bauspez. familienrecht-klagen-vorlagen.md §3.3); ZPO/ZGB-Anker am
    // Cache verifiziert 12.6.2026.
    description: 'Scheidungsklage ohne schriftliche Begründung (Art. 290 ZPO) – gesetzlicher Mindestinhalt mit Scheidungsgrund (Art. 114/115 ZGB), Kinder-, Unterhalts-, Güterrechts- und Vorsorge-Begehren; berechneter Zweijahres-Check.',
    status: 'entwurf',
    norms: [
      // Art. 290 ZPO – Mindestinhalt der unbegründeten Eingabe (verifiziert 12.6.2026)
      { label: 'Art. 290 ZPO', url: fedlexUrl('ZPO', '290'), verified: false },
      // Art. 114/115 ZGB – Scheidungsgründe (verifiziert 12.6.2026)
      { label: 'Art. 114 ZGB', url: fedlexUrl('ZGB', '114'), verified: false },
      { label: 'Art. 115 ZGB', url: fedlexUrl('ZGB', '115'), verified: false },
      // Art. 23 Abs. 1 ZPO – zwingender Gerichtsstand (verifiziert 12.6.2026)
      { label: 'Art. 23 ZPO', url: fedlexUrl('ZPO', '23'), verified: false },
    ],
    href: '/vorlagen/scheidungsklage',
    schemaId: 'scheidungsklage',
    formvorschrift: 'Unterschreiben und im Doppel einreichen (Art. 131 ZPO); Gericht am Wohnsitz einer Partei.',
    output: ['pdf', 'docx'],
    related: ['vorsorgeausgleich', 'familie-fristen', 'tagerechner'],
    keywords: ['Scheidung', 'Scheidungsklage', 'Art. 290', 'Art. 114', 'Art. 115', 'unbegründete Eingabe', 'Getrenntleben'],
  },
  arrestgesuch: {
    id: 'arrestgesuch', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Arrestgesuch',
    description: 'Strukturiertes Gerüst für das Arrestgesuch.',
    status: 'geplant', norms: [],
    related: ['schkg-fristen'],
    keywords: ['Arrest', 'Sicherung'],
  },
  'schkg-beschwerde': {
    id: 'schkg-beschwerde', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    rechtsbereich: 'privat',
    title: 'Beschwerde gegen Betreibungs- & Konkursämter',
    description: 'Strukturiertes Gerüst für die betreibungsrechtliche Beschwerde an die Aufsichtsbehörde.',
    status: 'geplant', norms: [],
    related: ['schkg-fristen'],
    keywords: ['Beschwerde', 'Aufsichtsbehörde', 'Betreibungsamt'],
  },

  // – Arbeit —
  // Maske 1b der Kündigungs-Familie (Spez. recherche/kuendigungs-masken.md,
  // gebaut 6.6.2026): Sperrfristen-Engine LIVE; 'nichtig' = harter Blocker.
  'kuendigung-arbeitgeber': {
    id: 'kuendigung-arbeitgeber', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Arbeit',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Kündigung durch Arbeitgeber:in',
    description: 'Kündigungsschreiben mit Live-Prüfung der Sperrfristen (Art. 336c OR): nichtige Kündigungen werden blockiert, Hemmung und Erstreckung fliessen ins Beendigungsdatum ein; Begründung und Freistellung optional.',
    status: 'entwurf',
    norms: [
      // Art. 335 OR – ordentliche Kündigung / Begründung auf Verlangen
      { label: 'Art. 335 OR', url: fedlexUrl('OR', '335'), verified: false },
      // Art. 335c OR – Fristen und Termine (inkl. Abs. 3 Urlaub des andern Elternteils)
      { label: 'Art. 335c OR', url: fedlexUrl('OR', '335c'), verified: false },
      // Art. 336c OR – Sperrfristen (Kündigung zur Unzeit)
      { label: 'Art. 336c OR', url: fedlexUrl('OR', '336c'), verified: false },
      // Art. 324 OR – Lohn bei Freistellung (Annahmeverzug, Anrechnung)
      { label: 'Art. 324 OR', url: fedlexUrl('OR', '324'), verified: false },
    ],
    href: '/vorlagen/kuendigung-arbeitgeber',
    // E3: kein eigener Katalog-Eintrag — Einstieg über «Kündigung & Fristen
    // im Arbeitsverhältnis»; Karte bleibt SSoT der Masken-Seite.
    imKatalog: false,
    schemaId: 'kuendigung-arbeitgeber',
    formvorschrift: 'Formfrei (vorbehältlich vertraglicher Schriftform) — unterschreiben und an die Wohnadresse zustellen.',
    output: ['pdf', 'docx'],
    related: ['kuendigung-sperrfristen', 'kuendigung-arbeitnehmer', 'arbeitszeugnis'],
    keywords: ['Kündigung', 'Arbeitsverhältnis', 'Kündigungsschreiben', 'Sperrfrist', 'Art. 336c', 'Freistellung', 'Beendigungsdatum'],
  },
  // Maske 1a der Kündigungs-Familie (Spez. recherche/kuendigungs-masken.md,
  // gebaut 6.6.2026): Beendigungsdatum LIVE aus lib/kuendigungsfrist.ts.
  'kuendigung-arbeitnehmer': {
    id: 'kuendigung-arbeitnehmer', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Arbeit',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Kündigung durch Arbeitnehmer:in',
    description: 'Kündigungsschreiben der Arbeitnehmerin oder des Arbeitnehmers – mit live berechnetem Beendigungsdatum (Dienstjahr, Probezeit, abweichende Fristen) und Zeugnis-/Abrechnungsbitte.',
    status: 'entwurf',
    norms: [
      // Art. 335 OR – Grundsatz der ordentlichen Kündigung
      { label: 'Art. 335 OR', url: fedlexUrl('OR', '335'), verified: false },
      // Art. 335b OR – Probezeit (7-Tage-Frist)
      { label: 'Art. 335b OR', url: fedlexUrl('OR', '335b'), verified: false },
      // Art. 335c OR – Fristen und Termine
      { label: 'Art. 335c OR', url: fedlexUrl('OR', '335c'), verified: false },
      // Art. 330a OR – Arbeitszeugnis
      { label: 'Art. 330a OR', url: fedlexUrl('OR', '330a'), verified: false },
    ],
    href: '/vorlagen/kuendigung-arbeitnehmer',
    imKatalog: false, // E3 — Einstieg über den Arbeits-Themen-Einstieg
    schemaId: 'kuendigung-arbeitnehmer',
    formvorschrift: 'Formfrei (vorbehältlich vertraglicher Schriftform) – unterschreiben und nachweisbar zustellen.',
    output: ['pdf', 'docx'],
    related: ['kuendigung-sperrfristen', 'arbeitszeugnis'],
    keywords: ['Kündigung', 'Arbeitsverhältnis', 'Kündigungsschreiben', 'Beendigungsdatum', 'Probezeit', 'Arbeitszeugnis'],
  },
  freistellung: {
    id: 'freistellung', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Freistellung',
    description: 'Strukturiertes Gerüst für die Freistellungserklärung.',
    status: 'geplant', norms: [],
    related: ['kuendigung-arbeitgeber', 'kuendigung-sperrfristen'],
    keywords: ['Freistellung'],
  },
  verwarnung: {
    id: 'verwarnung', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Verwarnung',
    description: 'Strukturiertes Gerüst für die arbeitsrechtliche Verwarnung.',
    status: 'geplant', norms: [],
    related: ['kuendigung-arbeitgeber'],
    keywords: ['Verwarnung', 'Abmahnung'],
  },
  arbeitszeugnis: {
    id: 'arbeitszeugnis', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Arbeitszeugnis',
    description: 'Strukturiertes Gerüst für Voll- und Zwischenzeugnisse.',
    status: 'geplant', norms: [],
    related: ['kuendigung-arbeitgeber', 'kuendigung-arbeitnehmer'],
    keywords: ['Zeugnis', 'Zwischenzeugnis'],
  },
  aufhebungsvereinbarung: {
    id: 'aufhebungsvereinbarung', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Arbeit',
    vertragRubrik: 'arbeit',
    rechtsbereich: 'privat',
    title: 'Aufhebungsvereinbarung',
    description: 'Strukturiertes Gerüst für die einvernehmliche Beendigung des Arbeitsverhältnisses.',
    status: 'geplant', norms: [],
    related: ['kuendigung-sperrfristen'],
    keywords: ['Aufhebungsvertrag', 'Saldoklausel'],
  },

  // – Vertrag & Forderung (OR) —
  // Maske 3 der Kündigungs-Familie (Spez. recherche/kuendigungs-masken.md,
  // gebaut 6.6.2026): Presets mit verifizierten VVG-/OR-Wortlauten.
  'kuendigung-vertrag': {
    id: 'kuendigung-vertrag', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Vertrag & Forderung (OR)',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Vertrag kündigen (Versicherung · Krankenkasse · Darlehen · Auftrag · Abo)',
    description: 'Ein Kündigungsschreiben mit Vertragstyp-Presets: Versicherung (Art. 35a VVG, Drei-Jahres-Regel), Krankenkassen-Grundversicherung (Art. 7 KVG, Prämienmitteilung bzw. Semesterende), Darlehen mit 6-Wochen-Frist (Art. 318 OR), Auftrag mit Unzeit-Warnung (Art. 404 OR), Abo/Telecom nach AGB – ohne erfundene Fristen.',
    status: 'entwurf',
    norms: [
      // Art. 35a VVG – ordentliche Kündigung (Wortlaut verifiziert 6.6.2026)
      { label: 'Art. 35a VVG', url: fedlexUrl('VVG', '35a'), verified: false },
      // Art. 7 KVG – Wechsel des Versicherers (Wortlaut verifiziert 11.6.2026,
      // Dossier kvg-grundversicherung-kuendigung.md)
      { label: 'Art. 7 KVG', url: fedlexUrl('KVG', '7'), verified: false },
      // Art. 318 OR – Darlehen: 6 Wochen ab Aufforderung
      { label: 'Art. 318 OR', url: fedlexUrl('OR', '318'), verified: false },
      // Art. 404 OR – Auftrag: jederzeitiger Widerruf, Unzeit-Folge
      { label: 'Art. 404 OR', url: fedlexUrl('OR', '404'), verified: false },
    ],
    href: '/vorlagen/kuendigung-vertrag',
    schemaId: 'kuendigung-vertrag',
    formvorschrift: 'Formfrei (Versicherung: schriftlich oder textnachweisbar, Art. 35a VVG) — unterschreiben und nachweisbar zustellen.',
    output: ['pdf', 'docx'],
    related: ['mahnung', 'verzugszins', 'kuendigung-sperrfristen', 'mietrecht'], // Konsolidierung E3: Masken-Refs → Themen-Einstiege
    keywords: ['Kündigung', 'Vertrag kündigen', 'Versicherung kündigen', 'Krankenkasse kündigen', 'Grundversicherung', 'Krankenkasse wechseln', 'Abo kündigen', 'Darlehen', 'Auftrag', 'Art. 35a VVG', 'Art. 7 KVG', 'Art. 404'],
  },
  mahnung: {
    id: 'mahnung', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Vertrag & Forderung (OR)',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Mahnung & Inverzugsetzung',
    // §0-Mehrwert-Test 7.6.2026: «Inverzugsetzung» war eine Karten-Dublette
    // desselben Schreibens (Art. 102 OR) — hier als Variante geführt.
    description: 'Zahlungsaufforderung, die den Verzug auslöst (Art. 102 OR), mit Verzugszins-Androhung (Art. 104 OR) – als Variante die Nachfristansetzung beim zweiseitigen Vertrag (Art. 107 OR).',
    status: 'entwurf',
    norms: [
      // Art. 102 OR – Verzugseintritt durch Mahnung/Verfalltag (Wortlaut verifiziert 11.6.2026)
      { label: 'Art. 102 OR', url: fedlexUrl('OR', '102'), verified: false },
      // Art. 104 OR – Verzugszins 5 %, vertraglich höher (Wortlaut verifiziert 11.6.2026)
      { label: 'Art. 104 OR', url: fedlexUrl('OR', '104'), verified: false },
      // Art. 107 OR – Nachfrist + Wahlrechte (Wortlaut verifiziert 11.6.2026)
      { label: 'Art. 107 OR', url: fedlexUrl('OR', '107'), verified: false },
    ],
    href: '/vorlagen/mahnung',
    schemaId: 'mahnung',
    formvorschrift: 'Formfrei – unterschreiben und nachweisbar zustellen (massgebend ist der Zugang).',
    output: ['pdf', 'docx'],
    related: ['verzugszins', 'betreibungskosten'],
    keywords: ['Mahnung', 'Zahlungsverzug', 'Frist', 'Inverzugsetzung', 'Nachfrist', 'Verzugszins', 'Art. 102', 'Art. 107'],
  },
  verjaehrungsverzicht: {
    id: 'verjaehrungsverzicht', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Vertrag & Forderung (OR)',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Verjährungsverzichtserklärung',
    // P1-Vorlage Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V2);
    // Art. 141 OR am Cache verifiziert (20260101).
    description: 'Erklärung der Schuldnerseite, befristet auf die Einrede der Verjährung zu verzichten (Art. 141 OR) – mit fester Begrenzung auf die gesetzliche Höchstdauer und Klarstellung, dass keine Anerkennung vorliegt.',
    status: 'entwurf',
    norms: [
      // Art. 141 OR – Einredeverzicht, Schriftform, Wirkungsgrenzen (Wortlaut verifiziert 12.6.2026)
      { label: 'Art. 141 OR', url: fedlexUrl('OR', '141'), verified: false },
    ],
    href: '/vorlagen/verjaehrungsverzicht',
    schemaId: 'verjaehrungsverzicht',
    formvorschrift: 'Schriftform zwingend (Art. 141 Abs. 1bis OR) – drucken und von der Schuldnerseite unterschreiben lassen.',
    output: ['pdf', 'docx'],
    related: ['verjaehrung'],
    keywords: ['Verjährungsverzicht', 'Verjährungseinredeverzicht', 'Einrede', 'Verjährung', 'Art. 141', 'Verzichtserklärung'],
  },
  schuldanerkennung: {
    id: 'schuldanerkennung', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Schuldanerkennung',
    description: 'Schriftliche Anerkennung einer Schuld als Grundlage der späteren Durchsetzung.',
    status: 'geplant', norms: [],
    related: ['rechtsoeffnungsbegehren', 'schkg-fristen'],
    keywords: ['Schuldanerkennung', 'Rechtsöffnung'],
  },
  vergleichsvereinbarung: {
    id: 'vergleichsvereinbarung', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Vertrag & Forderung (OR)',
    vertragRubrik: 'darlehen_sicherheiten',
    rechtsbereich: 'privat',
    title: 'Vergleichsvereinbarung',
    description: 'Strukturiertes Gerüst für den aussergerichtlichen Vergleich.',
    status: 'geplant', norms: [],
    related: ['schlichtungsgesuch'],
    keywords: ['Vergleich', 'Saldoklausel'],
  },

  // – Erbrecht —
  erbverzichtsvertrag: {
    id: 'erbverzichtsvertrag', modus: 'vorlage', art: 'vorsorge', rechtsgebiet: 'Erbrecht',
    rechtsbereich: 'privat',
    title: 'Erbverzichtsvertrag',
    description: 'Verzicht auf die Erbenstellung – Entwurf zur öffentlichen Beurkundung.',
    status: 'geplant', norms: [],
    formvorschrift: 'Öffentliche Beurkundung',
    related: ['erbteilung', 'erbvertrag'],
    keywords: ['Erbverzicht', 'Beurkundung'],
  },
  erbteilungsvereinbarung: {
    id: 'erbteilungsvereinbarung', modus: 'vorlage', art: 'vorsorge', rechtsgebiet: 'Erbrecht',
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
  // Verschoben nach «Übergreifende Werkzeuge» (Wunsch David 6.6.2026):
  // rechtsgebietsübergreifend einsetzbar. S-2 10.6.2026: Gruppe neu
  // «Einseitige Willenserklärungen» (Bevollmächtigung = einseitiges
  // Rechtsgeschäft; vorher «vorsorge») — Abnahme David offen.
  vollmacht: {
    id: 'vollmacht', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Übergreifende Werkzeuge',
    formGate: 'fertig',
    rechtsbereich: 'uebergreifend',
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
    id: 'trennungsvereinbarung', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Familienrecht',
    vertragRubrik: 'familie',
    rechtsbereich: 'privat',
    title: 'Trennungsvereinbarung',
    description: 'Strukturiertes Gerüst für die Regelung des Getrenntlebens.',
    status: 'geplant', norms: [],
    related: ['gueterrecht-vorschlag', 'scheidungskonvention'],
    keywords: ['Trennung', 'Getrenntleben'],
  },
  scheidungskonvention: {
    id: 'scheidungskonvention', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Familienrecht',
    vertragRubrik: 'familie',
    rechtsbereich: 'privat',
    title: 'Scheidungskonvention',
    description: 'Strukturiertes Gerüst für die Vereinbarung der Scheidungsfolgen.',
    status: 'geplant', norms: [],
    related: ['vorsorgeausgleich', 'gueterrecht-vorschlag', 'elternvereinbarung'],
    keywords: ['Scheidung', 'Konvention'],
  },
  elternvereinbarung: {
    id: 'elternvereinbarung', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Familienrecht',
    vertragRubrik: 'familie',
    rechtsbereich: 'privat',
    title: 'Elternvereinbarung',
    description: 'Strukturiertes Gerüst zu Obhut, Betreuung und Unterhalt.',
    status: 'geplant', norms: [],
    related: ['scheidungskonvention'],
    keywords: ['Eltern', 'Obhut', 'Betreuung'],
  },

  // – Strafrecht & Strafprozess —
  strafanzeige: {
    id: 'strafanzeige', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Strafanzeige',
    description: 'Anzeige eines Sachverhalts an die Strafverfolgungsbehörden.',
    status: 'geplant', norms: [],
    related: ['strafantrag-vorlage', 'zustaendigkeit'],
    keywords: ['Anzeige', 'Staatsanwaltschaft'],
  },
  'strafantrag-vorlage': {
    id: 'strafantrag-vorlage', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Strafantrag',
    description: 'Strafantrag der berechtigten Person bei Antragsdelikten.',
    status: 'geplant', norms: [],
    related: ['strafanzeige', 'zustaendigkeit'],
    keywords: ['Strafantrag', 'Antragsdelikt'],
  },
  akteneinsichtsgesuch: {
    id: 'akteneinsichtsgesuch', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Akteneinsichtsgesuch',
    description: 'Gesuch um Einsicht in die Verfahrensakten.',
    status: 'geplant', norms: [],
    related: ['zustaendigkeit'],
    keywords: ['Akteneinsicht', 'Verfahrensakten'],
  },
  entschaedigungsbegehren: {
    id: 'entschaedigungsbegehren', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Entschädigungsbegehren',
    description: 'Strukturiertes Gerüst für Entschädigungs- und Genugtuungsbegehren im Strafverfahren.',
    status: 'geplant', norms: [],
    related: ['zustaendigkeit', 'adhaesionsklage'],
    keywords: ['Entschädigung', 'Genugtuung'],
  },
  adhaesionsklage: {
    id: 'adhaesionsklage', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Strafverfahren', rechtsgebiet: 'Strafrecht & Strafprozess',
    rechtsbereich: 'straf',
    title: 'Adhäsionsklage',
    description: 'Strukturiertes Gerüst für Zivilansprüche im Strafverfahren.',
    status: 'geplant', norms: [],
    related: ['zustaendigkeit', 'entschaedigungsbegehren'],
    keywords: ['Adhäsion', 'Zivilanspruch'],
  },

  // – Verwaltungsrecht – (Einsprache deckt die bestehende Vorlage
  //   «Einsprache (Straf-/Verwaltungsbefehl)» ab; nicht gedoppelt)
  rekurs: {
    id: 'rekurs', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Verwaltungsrecht',
    rechtsbereich: 'oeffentlich',
    title: 'Rekurs',
    description: 'Strukturiertes Gerüst für den kantonalen Rekurs.',
    status: 'geplant', norms: [],
    related: ['beschwerde-verwaltung', 'beschwerde'],
    keywords: ['Rekurs', 'Rechtsmittel'],
  },

  // – Datenschutzrecht —
  auskunftsbegehren: {
    id: 'auskunftsbegehren', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Datenschutzrecht',
    rechtsbereich: 'privat',
    title: 'Auskunftsbegehren (Datenschutz)',
    description: 'Begehren um Auskunft über die Bearbeitung eigener Personendaten.',
    status: 'geplant', norms: [],
    related: ['datenschutz-fristen', 'loeschungsbegehren'],
    keywords: ['Auskunft', 'Datenschutz', 'Personendaten'],
  },
  loeschungsbegehren: {
    id: 'loeschungsbegehren', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Datenschutzrecht',
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

/** Karten mit eigenem Katalog-/Such-Eintrag (Konsolidierung 7.6.2026):
 *  imKatalog:false-Karten bleiben SSoT ihrer Seiten und über die Themen-
 *  Einstiege + Seiten-Links erreichbar, erscheinen aber nicht im Register. */
export const KATALOG_KARTEN: CatalogItem[] = ALLE_KARTEN.filter((k) => k.imKatalog !== false);
