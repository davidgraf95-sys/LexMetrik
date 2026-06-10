// Dossier: bibliothek/recherche/familienrecht-klagen-vorlagen.md
import type { Einheit } from './fristenEngine';

// ─── Fach-Presets «Familienrecht & Status» für den Tagerechner ──────────────
//
// Gebaut 10.6.2026 (Auftrag David «bau alles wofür du bereit bist»; Bauspez.
// im Dossier). §0-konform: KEINE neue Engine — reine Tagerechner-Presets
// (fixe gesetzliche Fristen ohne Sonderregime). Alle Normen am 10.6.2026
// verbatim am Fedlex-Cache /tmp/zgb.html bzw. /tmp/or.html verifiziert (§7):
//  · Art. 263 Abs. 1 ZGB: Ziff. 1 Mutter 1 Jahr seit Geburt; Ziff. 2 Kind
//    1 Jahr nach Erreichen der Volljährigkeit; Abs. 2 Fristlauf erst nach
//    Beseitigung eines bestehenden anderen Kindesverhältnisses.
//  · Art. 256c ZGB: Abs. 1 Ehemann binnen JAHRESFRIST ab Kenntnis (Geburt
//    UND Nichtvaterschaft bzw. Drittbeiwohnung), «in jedem Fall aber vor
//    Ablauf von fünf Jahren seit der Geburt» (ABSOLUT); Abs. 2 Kind 1 Jahr
//    nach Volljährigkeit; Abs. 3 Wiederherstellung bei wichtigen Gründen.
//  · Art. 313 Abs. 2 ZGB: Wiederherstellung der entzogenen elterlichen
//    Sorge «in keinem Fall vor Ablauf eines Jahres».
//  · Art. 546 Abs. 1 OR: Kündigung der einfachen Gesellschaft auf sechs
//    Monate (Abs. 2: in guten Treuen, ggf. nur aufs Geschäftsjahresende).
//  · Art. 450b Abs. 1 ZGB: KESB-Beschwerde 30 Tage seit Mitteilung;
//    Art. 445 Abs. 3 ZGB: gegen vorsorgliche Massnahmen 10 Tage.
// BEWUSST NICHT als Preset (Dossier-Korrekturen): Art.-291-Abs.-3-ZPO-
// Klagebegründungsfrist ist RICHTERLICH angesetzt (keine gesetzliche
// Länge); Art. 262 ZGB (Empfängnisfenster 300.–180. Tag) und Art. 279
// Abs. 1 ZGB (Unterhalt 1 Jahr VOR Klageerhebung) sind RÜCKWÄRTS-Rechnungen
// → Rückwärts-Tab, im Hinweis vermerkt.

export interface FamStatusPreset {
  label: string;
  norm: string;
  laenge: number;
  einheit: Einheit;
  /** Ehrlicher Kontext (§8): Auslöser, Gegen-Frist, Wiederherstellung. */
  info: string;
}

export const FAM_STATUS_PRESETS: FamStatusPreset[] = [
  {
    label: 'Vaterschaftsklage der Mutter – 1 Jahr',
    norm: 'Art. 263 Abs. 1 Ziff. 1 ZGB',
    laenge: 1, einheit: 'jahre',
    info: 'Start = Geburt. Verwirkungsfrist; bei bestehendem Kindesverhältnis zu einem anderen Mann läuft die Frist erst ab dessen Beseitigung (Abs. 2); Wiederherstellung nur aus wichtigen Gründen (Abs. 3).',
  },
  {
    label: 'Anfechtung der Vaterschaft – relativ 1 Jahr',
    norm: 'Art. 256c Abs. 1 ZGB',
    laenge: 1, einheit: 'jahre',
    info: 'Start = Kenntnis von Geburt UND Nichtvaterschaft bzw. Drittbeiwohnung. ZUSÄTZLICH gilt die absolute 5-Jahres-Frist seit Geburt — massgeblich ist das FRÜHERE Ende; nach Fristablauf nur Wiederherstellung aus wichtigen Gründen (Abs. 3), dann ohne Verzug klagen.',
  },
  {
    label: 'Anfechtung der Vaterschaft – absolut 5 Jahre',
    norm: 'Art. 256c Abs. 1 ZGB',
    laenge: 5, einheit: 'jahre',
    info: 'Start = Geburt. Kappt die relative Jahresfrist («in jedem Fall»); massgeblich ist das FRÜHERE der beiden Enden.',
  },
  {
    label: 'Status-Klagen des Kindes – 1 Jahr ab Volljährigkeit',
    norm: 'Art. 263 Abs. 1 Ziff. 2 / Art. 256c Abs. 2 ZGB',
    laenge: 1, einheit: 'jahre',
    info: 'Start = 18. Geburtstag (Erreichen der Volljährigkeit) — gilt für Vaterschafts- UND Anfechtungsklage des Kindes.',
  },
  {
    label: 'Wiedererteilung entzogener Sorge – Sperrfrist 1 Jahr',
    norm: 'Art. 313 Abs. 2 ZGB',
    laenge: 1, einheit: 'jahre',
    info: 'Start = Entzug der elterlichen Sorge; vorher ist die Wiederherstellung ausgeschlossen (frühester Antragstermin).',
  },
  {
    label: 'Kündigung einfache Gesellschaft – 6 Monate',
    norm: 'Art. 546 Abs. 1 OR',
    laenge: 6, einheit: 'monate',
    info: 'Konkubinats-/Gesellschaftsauflösung: Kündigung in guten Treuen, nicht zur Unzeit; bei vereinbarten Jahresabschlüssen nur aufs Ende des Geschäftsjahres (Abs. 2). Entfällt bei Auflösung nach Art. 545 Abs. 1 Ziff. 1 OR.',
  },
  {
    label: 'KESB-Beschwerde – 30 Tage',
    norm: 'Art. 450b Abs. 1 ZGB',
    laenge: 30, einheit: 'tage',
    info: 'Start = Mitteilung des Entscheids. Kantonales Verfahrensrecht beachten — z. B. ZH kennt KEINE Fristenstillstände im KESR (kantonal zu prüfen).',
  },
  {
    label: 'KESB-Beschwerde gegen vorsorgliche Massnahmen – 10 Tage',
    norm: 'Art. 445 Abs. 3 ZGB',
    laenge: 10, einheit: 'tage',
    info: 'Start = Mitteilung der vorsorglichen Massnahme; bei fürsorgerischer Unterbringung gilt Art. 450b Abs. 2 ZGB (eigene 10-Tage-Regel).',
  },
];
