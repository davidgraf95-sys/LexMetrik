// ─── Rechner-Karten (RechnerCard) ─────────────────────────────────────────
//
// Aus startseiteConfig.ts ausgelagert (§6 Datei-Schlankheit) — Inhalt
// byte-identisch. Single source of truth für die Rechner-Karten (§5).
// Verifizierte Fedlex-Basis-URLs/Anker zentral in src/lib/fedlex.ts.
import { fedlexUrl } from './fedlex';
import type { CalculatorCard } from './startseiteConfigTypen';

export const KARTEN: Record<string, CalculatorCard> = {
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
  // Verjährungs-/Gewährleistungs-Board (Verzahnungs-Klinge, ROADMAP W2·7):
  // Regime-Matrix (verjaehrung.ts) + Gewährleistungs-Sonderfall + AT-Brücke;
  // CISG nur Link. Reine Darstellung auf bestehenden Engines.
  'verjaehrung-board': {
    id: 'verjaehrung-board', modus: 'rechner', art: 'frist', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Verjährungs- & Gewährleistungs-Board',
    description: 'Die sechs Verjährungs-Regime auf einen Blick, der Gewährleistungs-Sonderfall (Rüge- und Verjährungsfristen bei Kauf/Werkvertrag) und die Brücke zur AT-Mechanik – internationaler Warenkauf (CISG) verlinkt.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 127 OR', url: fedlexUrl('OR', '127'), verified: false },
      { label: 'Art. 128 OR', url: fedlexUrl('OR', '128'), verified: false },
      { label: 'Art. 210 OR', url: fedlexUrl('OR', '210'), verified: false },
      { label: 'Art. 371 OR', url: fedlexUrl('OR', '371'), verified: false },
    ],
    href: '/rechner/verjaehrung-board',
    keywords: ['Verjährung', 'Gewährleistung', 'Board', 'Regime', 'Frist', 'Mängelrüge', 'CISG', 'Verwirkung'],
    related: ['verjaehrung', 'gewaehrleistung'],
    icon: 'clock',
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
  // Forderungs-/Inkasso-Strecke (Verzahnungs-Klinge, ROADMAP W2·7): stateless
  // Reverse-Reader Verzug → Verzugszins → Mahnung → Betreibung → Fristen.
  'inkasso-strecke': {
    id: 'inkasso-strecke', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Vertrag & Forderung (OR)',
    rechtsbereich: 'privat',
    title: 'Forderungs- & Inkasso-Strecke',
    description: 'Die Schritte der Geldforderungs-Durchsetzung als stateless Strecke: Verzug (Art. 102 OR), Verzugszins (Art. 104 OR), Mahnung, Betreibung und Fristen – jeder Schritt mit dem zuständigen Werkzeug.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 102 OR', url: fedlexUrl('OR', '102'), verified: false },
      { label: 'Art. 104 OR', url: fedlexUrl('OR', '104'), verified: false },
      { label: 'Art. 67 SchKG', url: fedlexUrl('SchKG', '67'), verified: false },
    ],
    href: '/rechner/inkasso-strecke',
    keywords: ['Inkasso', 'Forderung', 'Verzug', 'Verzugszins', 'Mahnung', 'Betreibung', 'Strecke', 'Durchsetzung'],
    related: ['verzugszins', 'mahnung', 'betreibungskosten'],
    icon: 'clipboard',
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
    title: 'Prozesskosten (Gerichts- & Parteikosten)',
    description: 'Gerichtskosten (Entscheidgebühr) und Parteientschädigung im erstinstanzlichen Zivilprozess nach Streitwert – amtlich verifizierte Tarife aller 26 Kantone, mit interkantonaler Vergleichstabelle. Kostenlose Verfahren (Art. 113/114 ZPO) und Schlichtung/Entscheid berücksichtigt; Ermessenstarife als Spanne.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 95 ZPO', url: fedlexUrl('ZPO', '95'), verified: false },
      { label: 'Art. 96 ZPO', url: fedlexUrl('ZPO', '96'), verified: false },
      { label: 'Art. 98 ZPO', url: fedlexUrl('ZPO', '98'), verified: false },
      { label: 'Art. 113 ZPO', url: fedlexUrl('ZPO', '113'), verified: false },
      { label: 'Art. 114 ZPO', url: fedlexUrl('ZPO', '114'), verified: false },
    ],
    href: '/rechner/prozesskosten',
    related: ['streitwert', 'zustaendigkeit', 'betreibungskosten', 'bgg-fristen'],
    keywords: ['Prozesskosten', 'Gerichtskosten', 'Gerichtsgebühr', 'Parteientschädigung', 'Anwaltskosten', 'Was kostet ein Prozess', 'Kostenrisiko', 'Entscheidgebühr', 'Honorar', 'kantonaler Tarif', 'Streitwert'],
    icon: 'percent',
  },
  'notariat-grundbuch': {
    id: 'notariat-grundbuch', modus: 'rechner', art: 'betrag', rechtsgebiet: 'Immobilien & Beurkundung',
    rechtsbereich: 'privat',
    title: 'Notariats- & Grundbuchkosten',
    description: 'Beurkundungs- und Grundbuchkosten aller 26 Kantone in drei Bereichen: Grundstückkauf (Beurkundung + Grundbuch + Grundpfand + Handänderungssteuer), Beurkundung (Notariat) je Geschäftsart (Testament, Erbvertrag, Ehevertrag, Schenkung, Vorsorgeauftrag, Vollmacht, Gründungen AG/GmbH, Stiftung, Bürgschaft, Dienstbarkeiten u. a.) und Grundbuch je Eintragungsart (Grundpfand, Dienstbarkeit, Vormerkung, Mutation u. a.) – kantonale Tarife mit amtlicher Quelle, interkantonaler Vergleich. Rahmen-/Aufwandtarife (freies Notariat) ehrlich als Spanne. Doppelt verifiziert, nicht abgenommen.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 216 OR', url: fedlexUrl('OR', '216'), verified: false },
      { label: 'Art. 499 ZGB', url: fedlexUrl('ZGB', '499'), verified: false },
      { label: 'Art. 629 OR', url: fedlexUrl('OR', '629'), verified: false },
    ],
    href: '/rechner/notariat-grundbuch',
    related: ['prozesskosten', 'betreibungskosten'],
    keywords: ['Notariatskosten', 'Beurkundung', 'Beurkundungsgebühr', 'Grundbuchgebühr', 'Handänderungssteuer', 'Grundstückkauf', 'Liegenschaftskauf', 'Testament', 'Erbvertrag', 'Ehevertrag', 'Schenkung', 'AG-Gründung', 'GmbH-Gründung', 'Stiftung', 'Bürgschaft', 'Vorsorgeauftrag', 'Dienstbarkeit', 'Schuldbrief', 'Notar', 'Grundpfand', 'Vormerkung', 'Eigentumsübertragung'],
    icon: 'percent',
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
  // Amtlicher Gerichts-Zitierer (Gerichts-Baustein-Set, ROADMAP W2·7):
  // Fundstellen-Formatierer BGE/BGer nach der Plattform-Zitierkonvention.
  // Art. 112 BGG live gegen Fedlex verifiziert 2026-07-05 (eli/cc/2006/218).
  gerichtszitat: {
    id: 'gerichtszitat', modus: 'rechner', art: 'werkzeug', rechtsgebiet: 'Übergreifende Werkzeuge',
    rechtsbereich: 'uebergreifend',
    title: 'Amtlicher Zitierer (BGE/BGer)',
    description: 'Fundstellen bundesgerichtlicher Entscheide nach der Zitierkonvention formatieren: BGE (Band · Teil · Seite) und nicht publizierte Urteile (Geschäftsnummer · Datum), mit Erwägungsangabe. Reine Zitierhilfe – prüft nicht, ob der Entscheid existiert.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 112 BGG', url: fedlexUrl('BGG', '112'), verified: false },
    ],
    href: '/rechner/gerichtszitat',
    related: ['rubrum'],
    keywords: ['Zitat', 'Zitierweise', 'BGE', 'BGer', 'Fundstelle', 'Erwägung', 'Aktenzeichen', 'Bundesgericht'],
    icon: 'court',
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
