// ─── Vorlagen-Karten (VorlageCard) ────────────────────────────────────────
//
// Aus startseiteConfig.ts ausgelagert (§6 Datei-Schlankheit) — Inhalt
// byte-identisch. Single source of truth für die Vorlagen-Karten (§5).
import { fedlexUrl } from './fedlex';
import type { VorlageCard } from './startseiteConfigTypen';

// ─── Vorlagen-Katalog (Modus «Vorlagen»; Start: alle «In Vorbereitung») ────
//
// Normentreue: geplante Vorlagen ohne Norm-Pills und ohne Artikel-/Tages-
// angaben; schemaId erst bei Status «geprüft». Cross-Links via `related`
// modusübergreifend (Vorlage ↔ Rechner).

export const VORLAGEN: Record<string, VorlageCard> = {
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
