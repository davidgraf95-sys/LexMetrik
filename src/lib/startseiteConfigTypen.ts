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
  { name: 'Immobilien & Beurkundung', id: 'immobilien',
    lede: 'Erwerb von Liegenschaften – Notariats-, Grundbuch- und Handänderungskosten.' },
  { name: 'Weitere Rechtsgebiete', id: 'weitere-rechtsgebiete',
    lede: 'Immaterialgüterrecht, Sachenrecht und übergreifende Einordnung.' },
  { name: 'Übergreifende Werkzeuge', id: 'werkzeuge',
    lede: 'Hilfsrechner und Arbeitsmittel über alle Rechtsgebiete.' },
];

// Filterwerte/Cluster-Reihenfolge (abgeleitet aus den Sektionen).
export const RECHTSGEBIETE: string[] = RECHTSGEBIET_SEKTIONEN.map((g) => g.name);
