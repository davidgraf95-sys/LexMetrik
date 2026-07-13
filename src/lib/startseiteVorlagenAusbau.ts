// ─── Vorlagen-Karten (VorlageCard) — Teilmodul Katalog-Ausbau Phase 3 ───
//
// H-10 (§6.6, B26): aus dem Katalog-Modul entlang der vorhandenen
// Rubrik-Blöcke ausgelagert — Einträge byte-identisch verschoben, im
// Stamm-Modul per Spread in Original-Key-Reihenfolge zusammengeführt.
import { fedlexUrl } from './fedlex';
import type { VorlageCard } from './startseiteConfigTypen';

export const VORLAGEN_AUSBAU: Record<string, VorlageCard> = {
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
  'nichtbekanntgabe-betreibung': {
    id: 'nichtbekanntgabe-betreibung', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Betreibung & Konkurs (SchKG)',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Nichtbekanntgabe einer Betreibung («Löschung» im Auszug)',
    // P1-Vorlage Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V2);
    // Art. 8a Abs. 3 lit. d SchKG (Fassung 1.1.2026, AS 2025 522) am Cache
    // verifiziert (20260101).
    description: 'Gesuch an das Betreibungsamt, eine Betreibung mit erhobenem Rechtsvorschlag Dritten nicht mehr bekannt zu geben (Art. 8a Abs. 3 lit. d SchKG) – mit deterministischer 3-Monats-Schwelle seit Zustellung des Zahlungsbefehls.',
    status: 'entwurf',
    norms: [
      // Art. 8a SchKG – Einsichtsrecht/Nichtbekanntgabe (Wortlaut verifiziert 13.6.2026, Fassung 1.1.2026)
      { label: 'Art. 8a SchKG', url: fedlexUrl('SchKG', '8a'), verified: false },
    ],
    href: '/vorlagen/nichtbekanntgabe-betreibung',
    schemaId: 'nichtbekanntgabe-betreibung',
    formvorschrift: 'Unterzeichnete Eingabe an das Betreibungsamt – frühestens drei Monate nach Zustellung des Zahlungsbefehls (Art. 8a Abs. 3 lit. d SchKG).',
    output: ['pdf', 'docx'],
    related: ['schkg-fristen', 'rechtsvorschlag'],
    keywords: ['Löschung', 'Betreibungsregister', 'Betreibungsregisterauszug', 'Nichtbekanntgabe', 'Art. 8a', 'Rechtsvorschlag', 'Betreibung löschen'],
  },
  fristerstreckungsgesuch: {
    id: 'fristerstreckungsgesuch', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Fristerstreckungsgesuch',
    // P1-Vorlage Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V2);
    // Art. 143/144/148 ZPO am Cache verifiziert (20250101).
    description: 'Gesuch an das Gericht, eine gerichtliche Frist zu erstrecken (Art. 144 Abs. 2 ZPO) – mit Frist-Art-Weiche (gesetzliche Fristen sind nicht erstreckbar) und Vor-Fristablauf-Prüfung.',
    status: 'entwurf',
    norms: [
      // Art. 144 ZPO – Erstreckung (Wortlaut verifiziert 13.6.2026)
      { label: 'Art. 144 ZPO', url: fedlexUrl('ZPO', '144'), verified: false },
      { label: 'Art. 143 ZPO', url: fedlexUrl('ZPO', '143'), verified: false },
    ],
    href: '/vorlagen/fristerstreckung',
    schemaId: 'fristerstreckungsgesuch',
    formvorschrift: 'Unterzeichnete Eingabe an das Gericht – vor Fristablauf einreichen (Art. 144 Abs. 2 ZPO).',
    output: ['pdf', 'docx'],
    related: ['zpo-fristen', 'tagerechner'],
    keywords: ['Fristerstreckung', 'Frist erstrecken', 'Erstreckungsgesuch', 'gerichtliche Frist', 'Art. 144', 'Klageantwort'],
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
  'klage-arbeitsrecht-kuendigung': {
    id: 'klage-arbeitsrecht-kuendigung', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Arbeit', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Klage nach Kündigung (Lohn · Überstunden · Entschädigung · Zeugnis)',
    description: 'Arbeitsrechtliche Leistungsklage nach ordentlicher oder fristloser Kündigung – Brutto-/Netto-Raster, 336b-Verwirkungs-Gates, Zeugnisberichtigung (Musterklagen Bd. I §§ 9/10).',
    status: 'geplant', norms: [],
    related: ['kuendigung-sperrfristen', 'klage-vereinfacht'],
    keywords: ['Arbeitsrecht', 'missbräuchliche Kündigung', 'fristlose Kündigung', 'Überstunden', 'Arbeitszeugnis'],
  },
  'klage-konkurrenzverbot': {
    id: 'klage-konkurrenzverbot', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Arbeit', rechtsgebiet: 'Arbeit',
    rechtsbereich: 'privat',
    title: 'Klage auf Durchsetzung eines Konkurrenzverbots',
    description: 'Konventionalstrafe + Unterlassungsbegehren mit 10-Punkte-Gültigkeits-Checkliste (Art. 340 ff. OR; Musterklagen Bd. I §§ 11/12).',
    status: 'geplant', norms: [],
    related: ['arbeitsvertrag'],
    keywords: ['Konkurrenzverbot', 'Konventionalstrafe', 'Art. 340', 'Realvollstreckung'],
  },
  'klage-werkmaengel': {
    id: 'klage-werkmaengel', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Werkvertrag & Bau', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Klage aus Werkmängeln (Besteller/Bauherr)',
    description: 'Sachgewährleistungs-/Ersatzvornahme-Klage mit Rüge- und Verjährungs-Gates (Art. 367 ff. OR, SIA-118-Weiche; Musterklagen Bd. I §§ 13–15).',
    status: 'geplant', norms: [],
    related: ['gewaehrleistung', 'klage-ordentlich'],
    keywords: ['Werkvertrag', 'Mängel', 'Nachbesserung', 'SIA 118', 'Ersatzvornahme'],
  },
  'bauhandwerkerpfandrecht-gesuch': {
    id: 'bauhandwerkerpfandrecht-gesuch', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Bauhandwerkerpfandrecht – Gesuch um vorläufige Eintragung',
    description: 'Superprovisorisches Eintragungsgesuch mit dem 4-Monats-Verwirkungs-Gate ab Vollendung (Art. 839 Abs. 2 ZGB; Musterklagen Bd. I § 16).',
    status: 'geplant', norms: [],
    related: ['tagerechner', 'schkg-fristen'],
    keywords: ['Bauhandwerkerpfandrecht', 'Art. 839', 'Vormerkung', 'superprovisorisch'],
  },
  'klage-honorar': {
    id: 'klage-honorar', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Werkvertrag & Bau', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Honorarklage (Architektur · Dienstleistung)',
    description: 'Forderungsklage mit gesplittetem Zinslauf und Zusatzleistungs-Block (Art. 394/363 ff. OR, SIA-102-Honorarmodell; Musterklagen Bd. I § 17).',
    status: 'geplant', norms: [],
    related: ['verzugszins', 'klage-ordentlich'],
    keywords: ['Honorar', 'Architektenvertrag', 'SIA 102', 'Werklohn'],
  },
  'klage-personenschaden': {
    id: 'klage-personenschaden', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Haftpflicht & Versicherung', rechtsgebiet: 'Weitere Rechtsgebiete',
    rechtsbereich: 'privat',
    title: 'Teilklage Personenschaden (Direktklage Versicherer)',
    description: 'Haftpflicht-Teilklage mit Direktforderungsrecht (Art. 65 SVG), Kongruenz-/Quotenvorrecht-Struktur und Nachklagevorbehalt (Musterklagen Bd. I § 22).',
    status: 'geplant', norms: [],
    related: ['verzugszins', 'klage-ordentlich'],
    keywords: ['Personenschaden', 'Teilklage', 'Direktklage', 'Art. 65 SVG', 'Erwerbsausfall'],
  },
  'klage-vvg-leistungen': {
    id: 'klage-vvg-leistungen', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Haftpflicht & Versicherung', rechtsgebiet: 'Weitere Rechtsgebiete',
    rechtsbereich: 'privat',
    title: 'Klage gegen den Versicherer (VVG-Leistungen)',
    description: 'Leistungsklage gegen Kürzung/Verweigerung mit Verfahrens-Weiche KV-Zusatz (Art. 243 Abs. 2 lit. f ZPO) und Verzugsrechner nach Art. 41 VVG (Musterklagen Bd. I § 25).',
    status: 'geplant', norms: [],
    related: ['klage-vereinfacht', 'verzugszins'],
    keywords: ['VVG', 'Versicherungsleistung', 'Leistungskürzung', 'Krankentaggeld'],
  },
  'vorsorgliche-beweisfuehrung': {
    id: 'vorsorgliche-beweisfuehrung', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige', rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    rechtsbereich: 'privat',
    title: 'Gesuch um vorsorgliche Beweisführung (Art. 158 ZPO)',
    description: 'Gerichtsgutachten vor dem Prozess – Fragenkatalog-Raster (nur Tatfragen) und Kostenvorbehalts-Formel (Musterklagen Bd. I §§ 15a/23).',
    status: 'geplant', norms: [],
    related: ['klage-ordentlich', 'prozesskosten'],
    keywords: ['vorsorgliche Beweisführung', 'Art. 158', 'Gutachten', 'Beweissicherung'],
  },
  'abaenderung-scheidungsurteil': {
    id: 'abaenderung-scheidungsurteil', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Familienrecht', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Abänderung des Scheidungsurteils (Unterhalt)',
    description: 'Abänderungsklage nach Art. 129/134 ZGB mit Haupt-/Eventualantrag und deterministischen Timing-Regeln (Bauspez. familienrecht-klagen-vorlagen.md §3.4).',
    status: 'geplant', norms: [],
    related: ['scheidungsklage'],
    keywords: ['Abänderung', 'Scheidungsurteil', 'Unterhalt', 'Art. 129'],
  },
  'konkubinatsaufloesung-klage': {
    id: 'konkubinatsaufloesung-klage', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Familienrecht', rechtsgebiet: 'Familienrecht',
    rechtsbereich: 'privat',
    title: 'Klage auf Auflösung eines Konkubinats',
    description: 'Objektive Klagenhäufung: Liquidation der einfachen Gesellschaft, Realzuteilung, Miteigentumsaufhebung (Art. 530 ff. OR/650 f. ZGB; Bauspez. §3.7).',
    status: 'geplant', norms: [],
    related: ['klage-ordentlich'],
    keywords: ['Konkubinat', 'einfache Gesellschaft', 'Liquidation', 'Miteigentum'],
  },
  eheschutzgesuch: {
    id: 'eheschutzgesuch', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'klage_besonders', klageGebiet: 'Familienrecht', rechtsgebiet: 'Familienrecht',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Eheschutzgesuch',
    // Dritte Musterklagen-Maske Familienrecht (Auftrag David 12.6.2026;
    // Bauspez. §3.1); ZGB/ZPO-Anker am Cache verifiziert 12.6.2026.
    description: 'Gesuch um Regelung des Getrenntlebens (Art. 175 f. ZGB, summarisches Verfahren) – Begehren-Katalog mit Wohnung/Auszugsfrist, Obhut, Bar- und Betreuungsunterhalt, Rückwirkung (Art. 173 Abs. 3 ZGB), Gütertrennung, Schuldneranweisung und Verfügungsbeschränkung.',
    status: 'entwurf',
    norms: [
      // Art. 175/176 ZGB – Getrenntleben + Massnahmen-Katalog (verifiziert 12.6.2026)
      { label: 'Art. 175 ZGB', url: fedlexUrl('ZGB', '175'), verified: false },
      { label: 'Art. 176 ZGB', url: fedlexUrl('ZGB', '176'), verified: false },
      // Art. 271 ZPO – summarisches Verfahren (verifiziert 12.6.2026)
      { label: 'Art. 271 ZPO', url: fedlexUrl('ZPO', '271'), verified: false },
    ],
    href: '/vorlagen/eheschutzgesuch',
    schemaId: 'eheschutzgesuch',
    formvorschrift: 'Unterschreiben und im Doppel einreichen (Art. 131 ZPO); summarisches Verfahren – Belege zur Glaubhaftmachung beilegen.',
    output: ['pdf', 'docx'],
    related: ['scheidungsklage', 'tagerechner'],
    keywords: ['Eheschutz', 'Getrenntleben', 'Art. 175', 'Art. 176', 'Obhut', 'Unterhalt', 'Schuldneranweisung', 'Gütertrennung'],
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
  // Rubrum (Gerichts-Baustein-Set, ROADMAP W2·7): Kopf eines Entscheids.
  // Norm-Anker LIVE gegen Fedlex verifiziert 2026-07-05 (Art. 238 ZPO Stand
  // 1.7.2026 eli/cc/2010/262; Art. 112 BGG Stand 1.4.2026 eli/cc/2006/218).
  rubrum: {
    id: 'rubrum', modus: 'vorlage', art: 'eingabe', eingabeRubrik: 'gesuch_sonstige',
    rechtsgebiet: 'Zivilprozess (ZPO) & Bundesgericht',
    formGate: 'entwurf',
    rechtsbereich: 'privat',
    title: 'Rubrum (Entscheidkopf)',
    description: 'Gerüst für den Kopf eines Gerichtsentscheids – Gericht und Besetzung, Parteien und ihre Vertretung, Streitgegenstand (Art. 238 ZPO; beim Weiterzug ans Bundesgericht Art. 112 BGG).',
    status: 'entwurf',
    norms: [
      { label: 'Art. 238 ZPO', url: fedlexUrl('ZPO', '238'), verified: false },
      { label: 'Art. 112 BGG', url: fedlexUrl('BGG', '112'), verified: false },
    ],
    href: '/vorlagen/rubrum',
    schemaId: 'rubrum',
    formvorschrift: 'Entwurfsvorlage – vom Gericht zu vervollständigen (Dispositiv, Begründung, Rechtsmittelbelehrung, Unterschrift).',
    output: ['pdf', 'docx'],
    related: ['gerichtszitat'],
    keywords: ['Rubrum', 'Entscheid', 'Urteil', 'Gericht', 'Parteien', 'Dispositiv', 'Art. 238', 'Art. 112'],
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
  forderungsabtretung: {
    id: 'forderungsabtretung', modus: 'vorlage', art: 'erklaerung', rechtsgebiet: 'Vertrag & Forderung (OR)',
    formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Abtretungserklärung (Zession)',
    // P1-Vorlage Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V2);
    // Art. 164/165/167/170 OR am Cache verifiziert (20260101).
    description: 'Erklärung der bisherigen Gläubigerseite, eine bestimmte Forderung an eine Erwerberin abzutreten (Art. 164 ff. OR) – mit zwingender Schriftform, Zinsen-Klarstellung und Hinweisen zu Abtretungsverbot und Schuldner-Anzeige.',
    status: 'entwurf',
    norms: [
      // Art. 164/165 OR – Abtretbarkeit + Schriftform (Wortlaut verifiziert 12.6.2026)
      { label: 'Art. 164 OR', url: fedlexUrl('OR', '164'), verified: false },
      { label: 'Art. 165 OR', url: fedlexUrl('OR', '165'), verified: false },
      { label: 'Art. 170 OR', url: fedlexUrl('OR', '170'), verified: false },
    ],
    href: '/vorlagen/forderungsabtretung',
    schemaId: 'forderungsabtretung',
    formvorschrift: 'Schriftform zwingend (Art. 165 Abs. 1 OR) – drucken und von der Zedentin/dem Zedenten unterschreiben lassen.',
    output: ['pdf', 'docx'],
    related: ['verjaehrungsverzicht', 'schuldanerkennung'],
    keywords: ['Abtretung', 'Zession', 'Forderungsabtretung', 'Zedent', 'Zessionar', 'Art. 164', 'Art. 165', 'Gläubigerwechsel'],
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
