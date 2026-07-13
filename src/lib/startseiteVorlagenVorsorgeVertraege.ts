// ─── Vorlagen-Karten (VorlageCard) — Teilmodul Rubriken I–II (Vorsorge & Nachlass · Verträge) ───
//
// H-10 (§6.6, B26): aus dem Katalog-Modul entlang der vorhandenen
// Rubrik-Blöcke ausgelagert — Einträge byte-identisch verschoben, im
// Stamm-Modul per Spread in Original-Key-Reihenfolge zusammengeführt.
import { fedlexUrl } from './fedlex';
import type { VorlageCard } from './startseiteConfigTypen';

export const VORLAGEN_VORSORGE_VERTRAEGE: Record<string, VorlageCard> = {
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
  auftrag: {
    id: 'auftrag', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Vertrag & Forderung (OR)',
    vertragRubrik: 'auftrag_werk', formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Auftrag (Dienstleistungsvertrag)',
    // P1-Grundtyp Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V3);
    // Art. 394/396/397/398/400/402/404 OR am Cache verifiziert (20260101).
    description: 'Dienstleistungsvertrag aus festen Bausteinen (Art. 394 ff. OR) mit Gegenstands-Modulen (Beratung, Treuhand, Inkasso) und Vergütungsweiche – das zwingende jederzeitige Auflösungsrecht (Art. 404 OR) wird offengelegt, keine wirkungslose Ausschlussklausel.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 394 OR', url: fedlexUrl('OR', '394'), verified: false },
      { label: 'Art. 398 OR', url: fedlexUrl('OR', '398'), verified: false },
      { label: 'Art. 404 OR', url: fedlexUrl('OR', '404'), verified: false },
    ],
    href: '/vorlagen/auftrag',
    schemaId: 'auftrag',
    formvorschrift: 'Formfrei – beidseitig zu unterzeichnen (Beweis)',
    output: ['pdf', 'docx'],
    related: ['gewaehrleistung', 'mahnung', 'verzugszins'],
    keywords: ['Auftrag', 'Dienstleistungsvertrag', 'Mandat', 'Beratung', 'Treuhand', 'Inkasso', 'Consulting', 'Art. 394', 'Art. 404', 'Widerruf', 'Honorar'],
    icon: 'doc',
  },
  werkvertrag: {
    id: 'werkvertrag', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Vertrag & Forderung (OR)',
    vertragRubrik: 'auftrag_werk', formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Werkvertrag',
    // P1-Grundtyp Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V3);
    // Art. 363/366/367/368/370/371/372/373/377 OR am Cache verifiziert (20260101).
    description: 'Werkvertrag aus festen Bausteinen (Art. 363 ff. OR) mit Weiche bewegliches/unbewegliches Werk – Rügefrist (60 Tage zwingend beim unbeweglichen Werk, Art. 367 Abs. 1bis) und Verjährung (2/5 Jahre, Art. 371) werden offengelegt; Brücke zum Gewährleistungs-Rechner.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 363 OR', url: fedlexUrl('OR', '363'), verified: false },
      { label: 'Art. 367 OR', url: fedlexUrl('OR', '367'), verified: false },
      { label: 'Art. 371 OR', url: fedlexUrl('OR', '371'), verified: false },
      { label: 'Art. 377 OR', url: fedlexUrl('OR', '377'), verified: false },
    ],
    href: '/vorlagen/werkvertrag',
    schemaId: 'werkvertrag',
    formvorschrift: 'Formfrei – beidseitig zu unterzeichnen (Beweis)',
    output: ['pdf', 'docx'],
    related: ['gewaehrleistung', 'auftrag', 'bauhandwerkerpfandrecht-gesuch'],
    keywords: ['Werkvertrag', 'Unternehmer', 'Besteller', 'Werk', 'Bau', 'Mängelrüge', 'Gewährleistung', 'Festpreis', 'Art. 363', 'Art. 367', 'Art. 371', 'Art. 377'],
    icon: 'doc',
  },
  nda: {
    id: 'nda', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Vertrag & Forderung (OR)',
    vertragRubrik: 'zusammenarbeit', formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Geheimhaltungsvereinbarung (NDA)',
    // P1-Vorlage Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V3);
    // Art. 19/160/161/163 OR am Cache verifiziert (20260101).
    description: 'Geheimhaltungsvereinbarung aus festen Bausteinen (Innominatvertrag, Art. 19 OR) mit Weiche einseitig/gegenseitig, Zweckbindung, Nachwirkungsfrist und optionaler Konventionalstrafe – die richterliche Herabsetzung übermässiger Strafen (Art. 163 Abs. 3 OR) wird offengelegt.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 19 OR', url: fedlexUrl('OR', '19'), verified: false },
      { label: 'Art. 160 OR', url: fedlexUrl('OR', '160'), verified: false },
      { label: 'Art. 163 OR', url: fedlexUrl('OR', '163'), verified: false },
    ],
    href: '/vorlagen/nda',
    schemaId: 'nda',
    formvorschrift: 'Formfrei – beidseitig zu unterzeichnen (Beweis)',
    output: ['pdf', 'docx'],
    related: ['auftrag', 'arbeitsvertrag'],
    keywords: ['NDA', 'Geheimhaltung', 'Geheimhaltungsvereinbarung', 'Vertraulichkeit', 'Non-Disclosure', 'Konventionalstrafe', 'einseitig', 'gegenseitig', 'Art. 19', 'Art. 163'],
    icon: 'doc',
  },
  konkubinat: {
    id: 'konkubinat', modus: 'vorlage', art: 'vertrag', rechtsgebiet: 'Familienrecht',
    vertragRubrik: 'familie', formGate: 'fertig',
    rechtsbereich: 'privat',
    title: 'Konkubinatsvertrag',
    // P1-Vorlage Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V3);
    // Art. 19 OR, Art. 646/650/651 ZGB, Art. 530/548/549 OR verifiziert (20260101).
    description: 'Konkubinatsvertrag aus festen Bausteinen (Innominatvertrag, Art. 19 OR) mit Kostenschlüssel, Wohn- und Inventar-Regelung, optionaler einfacher Gesellschaft und Auflösungsfolgen – das fehlende gesetzliche Konkubinatsrecht und die Kindesbelange nach Gesetz werden offengelegt.',
    status: 'entwurf',
    norms: [
      { label: 'Art. 19 OR', url: fedlexUrl('OR', '19'), verified: false },
      { label: 'Art. 646 ZGB', url: fedlexUrl('ZGB', '646'), verified: false },
      { label: 'Art. 651 ZGB', url: fedlexUrl('ZGB', '651'), verified: false },
    ],
    href: '/vorlagen/konkubinat',
    schemaId: 'konkubinat',
    formvorschrift: 'Formfrei – beidseitig zu unterzeichnen (Beweis)',
    output: ['pdf', 'docx'],
    related: ['eigenhaendiges-testament', 'vorsorgeauftrag'],
    keywords: ['Konkubinat', 'Konkubinatsvertrag', 'Lebensgemeinschaft', 'Partnerschaft', 'Zusammenleben', 'Miteigentum', 'Trennung', 'Art. 19', 'Art. 646'],
    icon: 'doc',
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
};
