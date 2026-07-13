// ─── Rechner-Karten (RechnerCard) — Teilmodul Katalog-Ausbau Phase 3 ───
//
// H-10 (§6.6, B26): aus dem Katalog-Modul entlang der vorhandenen
// Rubrik-Blöcke ausgelagert — Einträge byte-identisch verschoben, im
// Stamm-Modul per Spread in Original-Key-Reihenfolge zusammengeführt.
import { fedlexUrl } from './fedlex';
import type { CalculatorCard } from './startseiteConfigTypen';

export const KARTEN_AUSBAU: Record<string, CalculatorCard> = {
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
