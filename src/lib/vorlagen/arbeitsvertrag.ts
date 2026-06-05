import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';

// ─── Einzelarbeitsvertrag (Art. 319 ff. OR) — fünfte Vorlage ────────────────
//
// Grundlage: normverifiziertes Rechtsgutachten «Einzelarbeitsvertragsrecht
// als Grundlage für einen regelbasierten Vertragsbaukasten» (5.6.2026).
// Validierungskern ist die Klassifikationsmatrix des Gutachtens:
//   · absolut zwingend (Art. 361 OR)  → nicht konfigurierbar bzw. Blocker
//   · relativ zwingend (Art. 362 OR)  → nur zugunsten des Arbeitnehmers
//   · Validitätsschriftform           → durch die beidseitige Unterschrift
//     DIESES Vertrags erfüllt (Konkurrenzverbot, Überstunden-Wegbedingung,
//     abweichende Kündigungsfristen, Probezeit-Verlängerung, Pauschalspesen)
//   · heikle Klauseln                 → Disclosure-Hinweise (BGE-Praxis)
// Alle OR-Anker (319–362) und ArG-Anker (9/12/13/46) wurden empirisch gegen
// das konsolidierte Fedlex-Filestore-HTML verifiziert (5.6.2026).
//
// Kein LLM: reines regelbasiertes Zusammensetzen fester Bausteine.

// ── Datierte Parameter: kantonale Mindestlöhne (jährlich indexiert!) ────────
// Quelle: Gutachten 5.6.2026 (Stand 2025; 2026-Werte wo bekannt). KEINE
// Blocker-Grösse (GAV-/Branchenvorbehalte), nur Warnung + Verifikationspflicht.
export const AV_MINDESTLOEHNE: { kanton: string; chfProStunde: number; stand: string; hinweis?: string }[] = [
  { kanton: 'GE', chfProStunde: 24.48, stand: '2025', hinweis: '24.59 ab 1.1.2026' },
  { kanton: 'BS', chfProStunde: 22.00, stand: '2025', hinweis: '22.20 ab 1.1.2026' },
  { kanton: 'NE', chfProStunde: 21.31, stand: '2025', hinweis: '21.35 ab 1.1.2026' },
  { kanton: 'JU', chfProStunde: 20.60, stand: '2025', hinweis: 'Quellen streuen (20.60–21.40) — kantonal verifizieren' },
  { kanton: 'TI', chfProStunde: 19.75, stand: '2025', hinweis: 'branchengestaffelt bis 20.50' },
];

export const AV_OFFENE_VERIFIKATIONEN: string[] = [
  'Kantonale Mindestlöhne sind jährlich indexiert (datierte Werte Stand 2025/2026); vor Verwendung beim Kanton verifizieren. Stadt Luzern führt ab 1.1.2026 einen kommunalen Mindestlohn ein; Zürich/Winterthur sind vor Bundesgericht hängig.',
  'Die Kataloge von Art. 361/362 OR wurden gegen Sekundärquellen verifiziert; vor produktivem Einsatz nochmals mit dem amtlichen SR-220-Text abgleichen.',
  'Lohnfortzahlungs-Skalen (Berner/Basler/Zürcher) sind Gerichtspraxis, keine Norm — Zuordnung nach Gerichtsstand im Einzelfall prüfen.',
];

// ── Eingaben ────────────────────────────────────────────────────────────────

export type AvProbezeit = 'gesetzlich' | 'wegbedungen' | 'verlaengert';
export type AvUeberstunden = 'gesetzlich' | 'kompensation' | 'inbegriffen';

export type AvAntworten = {
  // Parteien
  arbeitgeberTyp: 'juristisch' | 'natuerlich';
  arbeitgeberName: string;
  arbeitgeberAdresse: string;
  arbeitnehmerVorname: string;
  arbeitnehmerName: string;
  arbeitnehmerAdresse: string;
  arbeitnehmerGeburtsdatum?: string; // ISO — steuert das 5-Wochen-Ferien-Gate (< 20 J.)
  // Stelle & Beginn
  funktion: string;
  arbeitsort: string;
  arbeitsortKanton?: string;         // für Mindestlohn-Warnung
  beginn: string;                    // ISO
  befristet: boolean;
  befristetBis?: string;             // ISO
  // Arbeitszeit
  pensumProzent: number;             // 100 = Vollzeit
  wochenstunden: number;             // vertragliche Wochenarbeitszeit bei 100 %
  // Lohn
  lohnModell: 'monatslohn' | 'stundenlohn';
  lohnBetrag: string;                // CHF (Monat bzw. Stunde)
  dreizehnter: boolean;              // Lohnbestandteil, pro rata
  gratifikation: boolean;            // freiwillig, mit Vorbehalt
  ferienzuschlagSeparat?: boolean;   // nur Stundenlohn: laufende Ferienabgeltung
  // Probezeit (Art. 335b)
  probezeit: AvProbezeit;
  probezeitMonate?: number;          // bei 'verlaengert': 2 oder 3
  // Kündigungsfristen (Art. 335c)
  kuendigungsfrist: 'gesetzlich' | 'abweichend';
  kuendigungsfristMonate?: number;   // einheitlich für beide Parteien (Parität)
  // Ferien (Art. 329a)
  ferienWochen: number;
  // Überstunden (Art. 321c)
  ueberstunden: AvUeberstunden;
  // Lohnfortzahlung (Art. 324a)
  lohnfortzahlung: 'gesetzlich' | 'ktg';
  ktgProzent?: number;               // Default 80
  ktgTage?: number;                  // Default 730
  // Spesen (Art. 327a)
  spesen: 'effektiv' | 'pauschal';
  spesenPauschaleCHF?: string;       // pro Monat
  // Konkurrenzverbot (Art. 340 ff.)
  konkurrenzverbot: boolean;
  kvEinblickBestaetigt?: boolean;    // Art. 340 Abs. 2: Kundenkreis/Geheimnisse + Schädigungspotenzial
  kvGegenstand?: string;
  kvOrt?: string;
  kvDauerMonate?: number;
  kvKonventionalstrafeCHF?: string;
  kvRealerfuellung?: boolean;        // Art. 340b Abs. 3 — besonders schriftlich
  // GAV
  gav: 'nein' | 'ja' | 'unbekannt';
  gavName?: string;
  // Abschluss
  ort: string;
  datum: string;                     // ISO
};

export const AV_DEFAULTS: AvAntworten = {
  arbeitgeberTyp: 'juristisch',
  arbeitgeberName: '', arbeitgeberAdresse: '',
  arbeitnehmerVorname: '', arbeitnehmerName: '', arbeitnehmerAdresse: '',
  funktion: '', arbeitsort: '', beginn: '',
  befristet: false,
  pensumProzent: 100, wochenstunden: 42,
  lohnModell: 'monatslohn', lohnBetrag: '',
  dreizehnter: true,
  gratifikation: false,
  probezeit: 'gesetzlich',
  kuendigungsfrist: 'gesetzlich',
  ferienWochen: 4,
  ueberstunden: 'gesetzlich',
  lohnfortzahlung: 'gesetzlich',
  spesen: 'effektiv',
  konkurrenzverbot: false,
  gav: 'nein',
  ort: '', datum: '',
};

// ── Helfer ──────────────────────────────────────────────────────────────────

const fmtDatum = (iso?: string) => (iso?.includes('-') ? iso.split('-').reverse().join('.') : iso || '________');

// Gleiche Konvention wie fmtCHF im Schlichtungsgesuch (immer zwei Dezimalen).
export function fmtCHF(roh: string): string {
  const n = Number(String(roh).replace(/['\s]/g, '').replace(',', '.'));
  if (!Number.isFinite(n)) return roh;
  const [ganz, dez] = n.toFixed(2).split('.');
  return ganz.replace(/\B(?=(\d{3})+(?!\d))/g, "'") + '.' + dez;
}

const alterAm = (gebIso: string, stichtagIso: string): number | null => {
  const g = new Date(gebIso), s = new Date(stichtagIso);
  if (isNaN(g.getTime()) || isNaN(s.getTime())) return null;
  let a = s.getFullYear() - g.getFullYear();
  if (s.getMonth() < g.getMonth() || (s.getMonth() === g.getMonth() && s.getDate() < g.getDate())) a--;
  return a;
};

const lohnZahl = (roh: string): number | null => {
  const n = Number(String(roh).replace(/['\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

// ── Gates (deterministische Validierung nach der Gutachtens-Matrix) ─────────

export type AvGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeAvGates(a: AvAntworten): AvGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  // G1 — Probezeit: höchstens 3 Monate (Art. 335b Abs. 2 OR); längere Abrede
  // würde von Gesetzes wegen gekürzt — wir blockieren statt still zu kürzen.
  if (a.probezeit === 'verlaengert') {
    const m = a.probezeitMonate ?? 0;
    if (!(m >= 2 && m <= 3)) {
      blocker.push('Die Probezeit darf höchstens drei Monate betragen (Art. 335b Abs. 2 OR); für einen Monat die gesetzliche Regelung wählen.');
    }
  }

  // G2 — Kündigungsfrist: nie unter einem Monat (Art. 335c Abs. 2 OR —
  // Unterschreitung nur durch GAV und nur im ersten Dienstjahr).
  // Bei Befristung irrelevant (kein ordentliches Kündigungsrecht, Art. 334) —
  // Gate feuert dann nicht (verhindert Blocker auf ausgeblendetem Pfad).
  if (!a.befristet && a.kuendigungsfrist === 'abweichend') {
    const m = a.kuendigungsfristMonate ?? 0;
    if (m < 1) {
      blocker.push('Die Kündigungsfrist darf einzelvertraglich nicht unter einen Monat verkürzt werden (Art. 335c Abs. 2 OR).');
    } else if (m < 3) {
      // Abweichend vom Gutachten (das nur Verlängerungen zulässt) folgt die
      // Maske dem Gesetzeswortlaut: Abs. 2 erlaubt die schriftliche
      // Abänderung; nur die Ein-Monats-Grenze ist hart. Offengelegt:
      hinweise.push(`Einheitliche Frist von ${m} Monat${m > 1 ? 'en' : ''}: liegt für spätere Dienstjahre unter der gesetzlichen Staffel (2 Monate ab dem 2., 3 Monate ab dem 10. Dienstjahr) — durch schriftliche Abrede zulässig (Art. 335c Abs. 2 OR), Mindestgrenze ein Monat; im Einzelfall prüfen.`);
    }
    hinweise.push('Kündigungsparität (Art. 335a OR): Die Frist gilt für beide Parteien gleich — die Vorlage bietet bewusst nur EINE Frist an.');
  }

  // G3 — Ferien: mindestens 4 Wochen; 5 Wochen bis zum vollendeten
  // 20. Altersjahr (Art. 329a Abs. 1 OR, relativ zwingend).
  const alter = a.arbeitnehmerGeburtsdatum && a.beginn ? alterAm(a.arbeitnehmerGeburtsdatum, a.beginn) : null;
  const ferienMin = alter !== null && alter < 20 ? 5 : 4;
  if (a.ferienWochen < ferienMin) {
    blocker.push(ferienMin === 5
      ? 'Bis zum vollendeten 20. Altersjahr beträgt der Ferienanspruch mindestens fünf Wochen (Art. 329a Abs. 1 OR).'
      : 'Der Ferienanspruch beträgt mindestens vier Wochen pro Dienstjahr (Art. 329a Abs. 1 OR).');
  }

  // G4 — Ferienlohn-Abgeltung: bei Vollzeit ausgeschlossen (BGE 149 III 202);
  // auch sonst nur eng zulässig (unregelmässige Arbeit, gesonderter Ausweis).
  if (a.lohnModell === 'stundenlohn' && a.ferienzuschlagSeparat && a.pensumProzent >= 100) {
    blocker.push('Bei Vollzeitbeschäftigung ist die laufende Ferienabgeltung im Stundenlohn unzulässig — auch bei schwankenden Löhnen (Art. 329d Abs. 2 OR; BGE 149 III 202). Ferien sind als bezahlte Freizeit zu gewähren.');
  }
  if (a.lohnModell === 'stundenlohn' && a.ferienzuschlagSeparat && a.pensumProzent < 100) {
    warnungen.push('Laufende Ferienabgeltung ist nur bei unregelmässiger Teilzeitarbeit zulässig und muss im Vertrag UND auf jeder Lohnabrechnung gesondert ausgewiesen sein (Prozentsatz oder Betrag); der blosse Vermerk «Ferienlohn inbegriffen» genügt nicht (Art. 329d OR; BGE 149 III 202).');
  }
  if (a.lohnModell === 'monatslohn' && a.ferienzuschlagSeparat) {
    blocker.push('Ein separater Ferienzuschlag ist nur beim Stundenlohn vorgesehen — im Monatslohn ist der Ferienlohn enthalten (Art. 329d Abs. 1 OR).');
  }

  // G5 — Konkurrenzverbot (Art. 340 ff. OR)
  if (a.konkurrenzverbot) {
    if (!a.kvEinblickBestaetigt) {
      blocker.push('Konkurrenzverbot: Es ist zu bestätigen, dass die Arbeitnehmerin/der Arbeitnehmer Einblick in den Kundenkreis oder in Fabrikations-/Geschäftsgeheimnisse erhält und deren Verwendung den Arbeitgeber erheblich schädigen könnte (Art. 340 Abs. 2 OR) — sonst ist das Verbot unverbindlich.');
    }
    if (!a.kvGegenstand?.trim() || !a.kvOrt?.trim() || !(a.kvDauerMonate && a.kvDauerMonate > 0)) {
      blocker.push('Konkurrenzverbot: Gegenstand, örtlicher Geltungsbereich und Dauer sind anzugeben — das Verbot ist nach Ort, Zeit und Gegenstand angemessen zu begrenzen (Art. 340a Abs. 1 OR).');
    }
    if ((a.kvDauerMonate ?? 0) > 36) {
      warnungen.push('Konkurrenzverbot über drei Jahre: nur unter besonderen Umständen zulässig (Art. 340a Abs. 1 OR) — das Gericht kann ein übermässiges Verbot herabsetzen.');
    }
    hinweise.push('Konkurrenzverbot: Die Schriftform (Art. 340 Abs. 1 OR; BGE 145 III 365) erfüllt dieser beidseitig unterzeichnete Vertrag. Eine Karenzentschädigung ist gesetzlich nicht vorgeschrieben; ihr Fehlen wird bei der richterlichen Herabsetzung berücksichtigt (Art. 340a Abs. 2 OR). Das Verbot fällt dahin, wenn der Arbeitgeber ohne begründeten Anlass kündigt (Art. 340c Abs. 2 OR).');
  }

  // G6 — Überstunden-Wegbedingung: nur OR-Bereich; ArG-Überzeit bleibt zwingend.
  if (a.ueberstunden === 'inbegriffen') {
    hinweise.push('Überstunden im Lohn inbegriffen: Die Wegbedingung von Zuschlag und Entschädigung ist nur durch schriftliche Abrede gültig (Art. 321c Abs. 3 OR) — dieser Vertrag erfüllt sie. Sie gilt NUR für OR-Überstunden: Überzeit über der wöchentlichen Höchstarbeitszeit (45/50 Stunden, Art. 9 ArG) bleibt zwingend zuschlags- oder kompensationspflichtig (Art. 12/13 ArG; Ausnahme: 60-Stunden-Schwelle für Büropersonal u. ä.). Ein anwendbarer GAV-Mindestlohn darf nicht unterlaufen werden.');
  }

  // G7 — Mindestlohn-Warnung (datierte Parameter; Branchen-/GAV-Vorbehalt)
  if (a.lohnModell === 'stundenlohn' && a.arbeitsortKanton) {
    const ml = AV_MINDESTLOEHNE.find((m) => m.kanton === a.arbeitsortKanton);
    const lohn = lohnZahl(a.lohnBetrag);
    if (ml && lohn !== null && lohn < ml.chfProStunde) {
      warnungen.push(`Kanton ${ml.kanton}: kantonaler Mindestlohn CHF ${ml.chfProStunde.toFixed(2)}/Std. (Stand ${ml.stand}${ml.hinweis ? `; ${ml.hinweis}` : ''}) — der erfasste Stundenlohn liegt darunter. Branchen-/GAV-Ausnahmen und aktuelle Indexierung verifizieren.`);
    }
  }

  // G8 — Befristung
  if (a.befristet) {
    if (!a.befristetBis) blocker.push('Befristetes Verhältnis: Enddatum angeben (Art. 334 Abs. 1 OR).');
    hinweise.push('Befristete Verhältnisse enden ohne Kündigung; eine ordentliche vorzeitige Kündigung ist ausgeschlossen (Art. 334 OR). Kettenverträge ohne sachlichen Grund werden in ein unbefristetes Verhältnis umgedeutet (BGE 129 III 618 — zu verifizieren). Die vereinbarte Probezeit gilt auch hier.');
  }

  // G9 — Gratifikation: Disclosure (Erstarken zum Anspruch)
  if (a.gratifikation) {
    hinweise.push('Gratifikation: Der Freiwilligkeitsvorbehalt wird automatisch aufgenommen. Eine während mindestens dreier Jahre vorbehaltlos ausgerichtete Gratifikation kann zum Anspruch erstarken (BGE 129 III 276); bei sehr hohen Einkommen entfällt das Akzessorietätskriterium (BGE 139 III 155 — zu verifizieren).');
  }

  // G10 — KTG-Lösung: Gleichwertigkeit (Art. 324a Abs. 4 OR)
  if (a.lohnfortzahlung === 'ktg') {
    const p = a.ktgProzent ?? 80;
    const t = a.ktgTage ?? 730;
    if (p < 80 || t < 720) {
      warnungen.push('Die Versicherungslösung muss für die Arbeitnehmerin/den Arbeitnehmer mindestens gleichwertig sein (Art. 324a Abs. 4 OR); üblich sind 80 % des Lohnes während 720–730 Tagen bei hälftiger Prämienteilung — die erfassten Werte liegen darunter.');
    }
  }

  // GAV-Vorrang — immer relevant, wenn GAV möglich
  if (a.gav !== 'nein') {
    hinweise.push('Anwendbare GAV-/NAV-Mindeststandards gehen abweichenden Abreden zulasten der Arbeitnehmerin/des Arbeitnehmers vor (Art. 357/360a OR; AVE nach AVEG). Einschlägigkeit und zwingende Mindestlöhne prüfen.');
  }

  // Informationspflicht — erfüllt der Vertrag selbst
  hinweise.push('Die schriftliche Informationspflicht nach Art. 330b OR (Parteien, Beginn, Funktion, Lohn, Wochenarbeitszeit) erfüllt dieser Vertrag; spätere Änderungen sind innert eines Monats schriftlich mitzuteilen.');

  return { blocker, warnungen, hinweise };
}

// ── Schema (Bausteine) ──────────────────────────────────────────────────────

export const AV_SCHEMA: VorlageSchema = {
  id: 'arbeitsvertrag',
  version: '1.0.0 (Rechtsstand OR Art. 319 ff., Gutachten 5.6.2026)',
  titel: 'Einzelarbeitsvertrag',
  disclaimer:
    'Entwurf — erstellt mit LexMetrik. Keine Rechtsberatung. Der Arbeitsvertrag ist formfrei gültig ' +
    '(Art. 320 OR); einzelne Klauseln (Konkurrenzverbot, Überstunden-Wegbedingung, abweichende ' +
    'Kündigungsfristen, Probezeit-Verlängerung, Pauschalspesen) bedürfen der Schriftform — die ' +
    'beidseitige Unterzeichnung dieses Vertrags erfüllt sie. Anwendbare GAV/NAV und kantonale ' +
    'Mindestlöhne gehen vor und sind gesondert zu prüfen.',
  bausteine: [
    { id: 'A01_parteien',
      text: 'zwischen\n\n{{arbeitgeberBlock}}\n(nachfolgend «Arbeitgeber»)\n\nund\n\n{{arbeitnehmerBlock}}\n(nachfolgend «Arbeitnehmer/in»)',
      begruendung: 'Bezeichnung der Vertragsparteien — immer enthalten.',
      norm: 'Art. 319 OR' },
    { id: 'A02_funktion', ueberschrift: 'Funktion und Stellenantritt',
      text: 'Der/Die Arbeitnehmer/in wird als {{funktion}} angestellt. Das Arbeitsverhältnis beginnt am {{beginnFmt}}.{{befristungSatz}}',
      nummeriert: true,
      begruendung: 'Funktion und Beginn — immer enthalten (zugleich Information nach Art. 330b OR).',
      norm: 'Art. 319 OR' },
    { id: 'A03_arbeitsort', ueberschrift: 'Arbeitsort, Pensum und Arbeitszeit',
      text: 'Arbeitsort ist {{arbeitsort}}. Das Pensum beträgt {{pensumProzent}} % ({{wochenstundenEffektiv}} Stunden pro Woche). Beginn und Ende der täglichen Arbeitszeit richten sich nach den betrieblichen Anordnungen; die zwingenden Schranken des Arbeitsgesetzes (Höchstarbeitszeit, Ruhezeiten, Arbeitszeiterfassung) bleiben vorbehalten.',
      nummeriert: true,
      begruendung: 'Arbeitsort, Pensum und Wochenarbeitszeit — immer enthalten.',
      norm: 'Art. 9 ArG' },
    { id: 'A04_probezeit_gesetzlich', ueberschrift: 'Probezeit',
      text: 'Es gilt die gesetzliche Probezeit von einem Monat. Während der Probezeit kann das Arbeitsverhältnis beidseits mit einer Frist von sieben Tagen auf jeden Tag gekündigt werden.',
      includeIf: { feld: 'probezeit', eq: 'gesetzlich' }, nummeriert: true,
      begruendung: 'Gesetzliche Probezeit gewählt.',
      norm: 'Art. 335b OR' },
    { id: 'A04_probezeit_verlaengert', ueberschrift: 'Probezeit',
      text: 'Die Probezeit wird auf {{probezeitMonate}} Monate verlängert (schriftliche Abrede). Während der Probezeit kann das Arbeitsverhältnis beidseits mit einer Frist von sieben Tagen auf jeden Tag gekündigt werden. Bei effektiver Verkürzung der Probezeit infolge Krankheit, Unfall oder Erfüllung einer nicht freiwillig übernommenen gesetzlichen Pflicht verlängert sie sich entsprechend.',
      includeIf: { feld: 'probezeit', eq: 'verlaengert' }, nummeriert: true,
      begruendung: 'Verlängerte Probezeit (höchstens drei Monate) — Schriftform durch diesen Vertrag erfüllt.',
      norm: 'Art. 335b OR',
      hinweis: 'Nachzuholen sind die effektiv versäumten Arbeitstage (BGE 148 III 126).' },
    { id: 'A04_probezeit_weg', ueberschrift: 'Probezeit',
      text: 'Auf eine Probezeit wird verzichtet.',
      includeIf: { feld: 'probezeit', eq: 'wegbedungen' }, nummeriert: true,
      begruendung: 'Probezeit wegbedungen (zulässig).',
      norm: 'Art. 335b OR' },
    { id: 'A05_lohn_monat', ueberschrift: 'Lohn',
      text: 'Der Bruttolohn beträgt CHF {{lohnFmt}} pro Monat{{dreizehnterSatz}}. Die gesetzlichen und vertraglichen Abzüge (AHV/IV/EO, ALV, NBU, BVG, ggf. Quellensteuer) gehen zulasten des Arbeitnehmers/der Arbeitnehmerin. Der Lohn wird Ende jedes Monats ausgerichtet.',
      includeIf: { feld: 'lohnModell', eq: 'monatslohn' }, nummeriert: true,
      begruendung: 'Monatslohn mit Fälligkeit Ende Monat (Art. 323 OR, absolut zwingend).',
      norm: 'Art. 322 OR' },
    { id: 'A05_lohn_stunde', ueberschrift: 'Lohn',
      text: 'Der Bruttolohn beträgt CHF {{lohnFmt}} pro Stunde{{ferienzuschlagSatz}}{{dreizehnterSatz}}. Die gesetzlichen und vertraglichen Abzüge gehen zulasten des Arbeitnehmers/der Arbeitnehmerin. Der Lohn wird Ende jedes Monats für die geleisteten Stunden ausgerichtet.',
      includeIf: { feld: 'lohnModell', eq: 'stundenlohn' }, nummeriert: true,
      begruendung: 'Stundenlohn mit Fälligkeit Ende Monat (Art. 323 OR, absolut zwingend).',
      norm: 'Art. 322 OR' },
    { id: 'A05b_gratifikation',
      text: 'Eine allfällige Gratifikation ist eine freiwillige Leistung des Arbeitgebers, auf die auch nach wiederholter Ausrichtung kein Anspruch besteht; über Ausrichtung und Höhe entscheidet der Arbeitgeber jedes Jahr neu und nach freiem Ermessen.',
      includeIf: { feld: 'gratifikation', eq: true }, nummeriert: true,
      begruendung: 'Freiwilligkeitsvorbehalt — ohne ihn kann die Gratifikation zum Anspruch erstarken.',
      norm: 'Art. 322d OR',
      hinweis: 'Trotz Vorbehalt kann langjährige vorbehaltlose Ausrichtung einen Anspruch begründen (BGE 129 III 276).' },
    { id: 'A06_ueberstunden_gesetzlich', ueberschrift: 'Überstunden',
      text: 'Überstunden, die notwendig sind und dem/der Arbeitnehmer/in zugemutet werden können, sind zu leisten. Sie werden mit Einverständnis des Arbeitnehmers/der Arbeitnehmerin durch Freizeit von gleicher Dauer ausgeglichen oder mit dem Lohn samt einem Zuschlag von 25 % vergütet.',
      includeIf: { feld: 'ueberstunden', eq: 'gesetzlich' }, nummeriert: true,
      begruendung: 'Gesetzliche Überstundenregelung.',
      norm: 'Art. 321c OR' },
    { id: 'A06_ueberstunden_kompensation', ueberschrift: 'Überstunden',
      text: 'Überstunden, die notwendig sind und dem/der Arbeitnehmer/in zugemutet werden können, sind zu leisten. Sie werden grundsätzlich durch Freizeit von gleicher Dauer ausgeglichen; ist der Ausgleich nicht möglich, werden sie mit dem Lohn samt einem Zuschlag von 25 % vergütet.',
      includeIf: { feld: 'ueberstunden', eq: 'kompensation' }, nummeriert: true,
      begruendung: 'Kompensationsmodell mit gesetzlicher Auffangregel.',
      norm: 'Art. 321c OR' },
    { id: 'A06_ueberstunden_inbegriffen', ueberschrift: 'Überstunden',
      text: 'Allfällige Überstunden sind mit dem vereinbarten Lohn abgegolten; Entschädigung und Zuschlag werden im Sinne von Art. 321c Abs. 3 OR schriftlich wegbedungen. Vorbehalten bleibt zwingend die Überzeit im Sinne des Arbeitsgesetzes (Arbeit über der wöchentlichen Höchstarbeitszeit), die nach Art. 13 ArG zu entschädigen oder durch Freizeit auszugleichen ist.',
      includeIf: { feld: 'ueberstunden', eq: 'inbegriffen' }, nummeriert: true,
      begruendung: 'Wegbedingung der Überstundenentschädigung — Schriftform durch diesen Vertrag erfüllt; ArG-Überzeit ausdrücklich vorbehalten.',
      norm: 'Art. 321c OR',
      hinweis: 'Gilt nur für OR-Überstunden; ArG-Überzeit (über 45/50 Wochenstunden) bleibt zwingend (Art. 12/13 ArG).' },
    { id: 'A07_ferien', ueberschrift: 'Ferien',
      text: 'Der Ferienanspruch beträgt {{ferienWochen}} Wochen pro Dienstjahr. Die Ferien werden vom Arbeitgeber unter Rücksicht auf die Wünsche des Arbeitnehmers/der Arbeitnehmerin festgelegt; wenigstens zwei Wochen müssen zusammenhängen. Während der Ferien ist der volle Lohn geschuldet; eine Abgeltung durch Geldleistungen während des Arbeitsverhältnisses ist ausgeschlossen.',
      nummeriert: true,
      begruendung: 'Ferienanspruch (mindestens 4 bzw. 5 Wochen) inkl. Abgeltungsverbot — immer enthalten.',
      norm: 'Art. 329a OR' },
    { id: 'A08_lohnfortzahlung_gesetzlich', ueberschrift: 'Lohnfortzahlung bei Verhinderung',
      text: 'Wird der/die Arbeitnehmer/in ohne eigenes Verschulden an der Arbeitsleistung verhindert (Krankheit, Unfall, Erfüllung gesetzlicher Pflichten), richtet sich die Lohnfortzahlung nach Art. 324a OR (im ersten Dienstjahr drei Wochen, danach angemessen länger nach der anwendbaren Skala).',
      includeIf: { feld: 'lohnfortzahlung', eq: 'gesetzlich' }, nummeriert: true,
      begruendung: 'Gesetzliche Lohnfortzahlung.',
      norm: 'Art. 324a OR' },
    { id: 'A08_lohnfortzahlung_ktg', ueberschrift: 'Lohnfortzahlung und Krankentaggeld',
      text: 'Der Arbeitgeber schliesst eine Krankentaggeldversicherung ab, die bei krankheitsbedingter Arbeitsunfähigkeit {{ktgProzent}} % des Lohnes während {{ktgTage}} Tagen deckt; die Prämien tragen die Parteien je zur Hälfte. Diese Lösung tritt im Sinne von Art. 324a Abs. 4 OR an die Stelle der gesetzlichen Lohnfortzahlung; für Wartetage und nicht versicherte Fälle gilt Art. 324a OR.',
      includeIf: { feld: 'lohnfortzahlung', eq: 'ktg' }, nummeriert: true,
      begruendung: 'Versicherungslösung (mindestens gleichwertig) — Schriftform durch diesen Vertrag erfüllt.',
      norm: 'Art. 324a OR' },
    { id: 'A09_spesen_effektiv', ueberschrift: 'Spesen',
      text: 'Der Arbeitgeber ersetzt dem/der Arbeitnehmer/in alle durch die Ausführung der Arbeit notwendig entstehenden Auslagen gegen Beleg.',
      includeIf: { feld: 'spesen', eq: 'effektiv' }, nummeriert: true,
      begruendung: 'Effektiver Auslagenersatz (zwingendes Minimum).',
      norm: 'Art. 327a OR' },
    { id: 'A09_spesen_pauschal', ueberschrift: 'Spesen',
      text: 'Die notwendigen Auslagen werden durch eine Pauschale von CHF {{spesenPauschaleFmt}} pro Monat abgegolten (schriftliche Abrede). Die Pauschale deckt sämtliche notwendigen Auslagen; weitergehende, durch sie nicht gedeckte notwendige Auslagen werden gegen Beleg ersetzt.',
      includeIf: { feld: 'spesen', eq: 'pauschal' }, nummeriert: true,
      begruendung: 'Pauschalspesen — Schriftform durch diesen Vertrag erfüllt; müssen alle notwendigen Auslagen decken.',
      norm: 'Art. 327a OR',
      hinweis: 'Eine Pauschale, die die notwendigen Auslagen nicht deckt, ist insoweit nichtig (Art. 327a Abs. 3 OR; BGE 131 III 439 — zu verifizieren).' },
    { id: 'A10_treuepflicht', ueberschrift: 'Sorgfalts-, Treue- und Geheimhaltungspflicht',
      text: 'Der/Die Arbeitnehmer/in führt die übertragene Arbeit sorgfältig aus und wahrt die berechtigten Interessen des Arbeitgebers. Über Tatsachen, die geheim zu halten sind (insbesondere Fabrikations- und Geschäftsgeheimnisse), bewahrt er/sie Stillschweigen — auch nach Beendigung des Arbeitsverhältnisses, soweit es zur Wahrung der berechtigten Interessen des Arbeitgebers erforderlich ist.',
      nummeriert: true,
      begruendung: 'Treue- und Geheimhaltungspflicht — immer enthalten (deklaratorisch).',
      norm: 'Art. 321a OR' },
    { id: 'A11_datenschutz', ueberschrift: 'Datenschutz',
      text: 'Der Arbeitgeber bearbeitet Personendaten des Arbeitnehmers/der Arbeitnehmerin nur, soweit sie dessen/deren Eignung für das Arbeitsverhältnis betreffen oder zur Durchführung des Vertrags erforderlich sind; im Übrigen gelten die Grundsätze des Datenschutzgesetzes.',
      nummeriert: true,
      begruendung: 'Datenschutz im Arbeitsverhältnis — immer enthalten (deklaratorisch).',
      norm: 'Art. 328b OR' },
    { id: 'A12_kuendigung_gesetzlich', ueberschrift: 'Kündigung',
      text: 'Nach Ablauf der Probezeit kann das unbefristete Arbeitsverhältnis beidseits unter Einhaltung der gesetzlichen Fristen gekündigt werden: mit einem Monat im ersten, zwei Monaten im zweiten bis neunten und drei Monaten ab dem zehnten Dienstjahr, je auf das Ende eines Monats. Die Kündigung ist auf Verlangen schriftlich zu begründen. Vorbehalten bleiben der zwingende Kündigungsschutz (Sperrfristen) und die fristlose Auflösung aus wichtigem Grund.',
      includeIf: { feld: 'kuendigungZeigen', eq: 'gesetzlich' }, nummeriert: true,
      begruendung: 'Gesetzliche Kündigungsfristen (Staffel nach Dienstjahren).',
      norm: 'Art. 335c OR' },
    { id: 'A12_kuendigung_abweichend', ueberschrift: 'Kündigung',
      text: 'Nach Ablauf der Probezeit kann das unbefristete Arbeitsverhältnis beidseits mit einer Frist von {{kuendigungsfristMonate}} Monaten auf das Ende eines Monats gekündigt werden (schriftliche Abrede; für beide Parteien gleich). Die Kündigung ist auf Verlangen schriftlich zu begründen. Vorbehalten bleiben der zwingende Kündigungsschutz (Sperrfristen) und die fristlose Auflösung aus wichtigem Grund.',
      includeIf: { feld: 'kuendigungZeigen', eq: 'abweichend' }, nummeriert: true,
      begruendung: 'Abweichende, paritätische Kündigungsfrist — Schriftform durch diesen Vertrag erfüllt.',
      norm: 'Art. 335c OR' },
    { id: 'A12_befristet_ende', ueberschrift: 'Vertragsdauer',
      text: 'Das Arbeitsverhältnis ist bis zum {{befristetBisFmt}} befristet und endet an diesem Tag ohne Kündigung. Wird es danach stillschweigend fortgesetzt, gilt es als unbefristetes Arbeitsverhältnis. Die fristlose Auflösung aus wichtigem Grund bleibt vorbehalten.',
      includeIf: { feld: 'kuendigungZeigen', eq: 'befristet' }, nummeriert: true,
      begruendung: 'Befristung: Ende ohne Kündigung; stillschweigende Fortsetzung → unbefristet.',
      norm: 'Art. 334 OR' },
    { id: 'A13_konkurrenzverbot', ueberschrift: 'Konkurrenzverbot',
      text: 'Der/Die Arbeitnehmer/in verpflichtet sich, nach Beendigung des Arbeitsverhältnisses während {{kvDauerText}} im folgenden örtlichen Geltungsbereich: {{kvOrt}}, jede den Arbeitgeber konkurrenzierende Tätigkeit im folgenden Bereich zu unterlassen: {{kvGegenstand}}.{{kvStrafeSatz}}{{kvRealSatz}} Das Verbot fällt dahin, wenn der Arbeitgeber nachweislich kein erhebliches Interesse mehr an seiner Aufrechterhaltung hat, sowie in den Fällen von Art. 340c Abs. 2 OR.',
      includeIf: { feld: 'konkurrenzverbot', eq: true }, nummeriert: true,
      begruendung: 'Konkurrenzverbot, nach Ort/Zeit/Gegenstand begrenzt — Schriftform durch diesen Vertrag erfüllt.',
      norm: 'Art. 340 OR',
      hinweis: 'Voraussetzung ist Einblick in Kundenkreis oder Geheimnisse mit Schädigungspotenzial (Art. 340 Abs. 2 OR); übermässige Verbote kann das Gericht herabsetzen (Art. 340a Abs. 2 OR). BGE 145 III 365.' },
    { id: 'A14_gav', ueberschrift: 'Gesamtarbeitsvertrag',
      text: 'Auf das Arbeitsverhältnis findet der folgende Gesamtarbeitsvertrag Anwendung: {{gavName}}. Dessen zwingende Mindestbestimmungen gehen abweichenden Abreden zulasten des Arbeitnehmers/der Arbeitnehmerin vor.',
      includeIf: { feld: 'gavZeigen', eq: true }, nummeriert: true,
      begruendung: 'GAV-Verweis mit Vorrang der Mindeststandards.',
      norm: 'Art. 357 OR' },
    { id: 'A15_schluss', ueberschrift: 'Schlussbestimmungen',
      text: 'Änderungen und Ergänzungen dieses Vertrags bedürfen zu ihrer Gültigkeit der Schriftform, soweit das Gesetz nichts anderes zulässt. Im Übrigen gelten die Bestimmungen des Obligationenrechts (Art. 319 ff. OR) sowie die zwingenden Vorschriften des Arbeitsgesetzes.',
      nummeriert: true,
      begruendung: 'Schriftformvorbehalt und Verweis auf das dispositive Gesetzesrecht — immer enthalten.',
      norm: 'Art. 320 OR' },
    { id: 'A16_unterschriften',
      text: '{{ort}}, {{datumFmt}}\n\n\nDer Arbeitgeber:\n\n___________________________\n{{arbeitgeberName}}\n\n\nDer/Die Arbeitnehmer/in:\n\n___________________________\n{{arbeitnehmerKurz}}',
      begruendung: 'Ort, Datum und beidseitige Unterschriften — erfüllt die Schriftform der formbedürftigen Klauseln.',
      norm: 'Art. 320 OR' },
  ],
};

// ── Zusammenstellen ─────────────────────────────────────────────────────────

export function avZusammenstellen(a: AvAntworten) {
  const wochenstundenEffektiv = a.pensumProzent >= 100
    ? String(a.wochenstunden)
    : `${Math.round(a.wochenstunden * a.pensumProzent) / 100} von ${a.wochenstunden}`;

  const kvDauerText = a.kvDauerMonate
    ? (a.kvDauerMonate % 12 === 0
        ? (a.kvDauerMonate === 12 ? 'einem Jahr' : `${a.kvDauerMonate / 12} Jahren`)
        : (a.kvDauerMonate === 1 ? 'einem Monat' : `${a.kvDauerMonate} Monaten`))
    : '________';

  const antworten: Antworten = {
    ...a,
    arbeitgeberBlock: [a.arbeitgeberName, a.arbeitgeberAdresse].filter(Boolean).join('\n'),
    arbeitnehmerBlock: [`${a.arbeitnehmerVorname} ${a.arbeitnehmerName}`.trim(),
      ...(a.arbeitnehmerGeburtsdatum ? [`geboren am ${fmtDatum(a.arbeitnehmerGeburtsdatum)}`] : []),
      a.arbeitnehmerAdresse].filter(Boolean).join('\n'),
    arbeitnehmerKurz: `${a.arbeitnehmerVorname} ${a.arbeitnehmerName}`.trim() || '________',
    beginnFmt: fmtDatum(a.beginn),
    befristungSatz: a.befristet && a.befristetBis ? ` Es ist bis zum ${fmtDatum(a.befristetBis)} befristet (Ziffer Vertragsdauer).` : '',
    befristetBisFmt: fmtDatum(a.befristetBis),
    wochenstundenEffektiv,
    lohnFmt: a.lohnBetrag ? fmtCHF(a.lohnBetrag) : '________',
    dreizehnterSatz: a.dreizehnter
      ? (a.lohnModell === 'monatslohn'
          ? '; zusätzlich wird ein 13. Monatslohn ausgerichtet (bei unterjährigem Ein- oder Austritt anteilsmässig)'
          : '; zusätzlich wird ein 13. Monatslohn von 8.33 % des massgebenden Lohnes ausgerichtet')
      : '',
    ferienzuschlagSatz: a.lohnModell === 'stundenlohn' && a.ferienzuschlagSeparat && a.pensumProzent < 100
      ? `; der Ferienlohn wird laufend ausgerichtet und beträgt ${a.ferienWochen >= 5 ? '10.64' : '8.33'} % des Grundlohnes (in jeder Lohnabrechnung gesondert ausgewiesen)`
      : '',
    ktgProzent: a.ktgProzent ?? 80,
    ktgTage: a.ktgTage ?? 730,
    spesenPauschaleFmt: a.spesenPauschaleCHF ? fmtCHF(a.spesenPauschaleCHF) : '________',
    kuendigungZeigen: a.befristet ? 'befristet' : a.kuendigungsfrist,
    kvDauerText,
    kvStrafeSatz: a.kvKonventionalstrafeCHF?.trim()
      ? ` Bei Übertretung schuldet der/die Arbeitnehmer/in eine Konventionalstrafe von CHF ${fmtCHF(a.kvKonventionalstrafeCHF)} je Übertretungsfall; deren Bezahlung befreit vom Verbot, der Ersatz weiteren Schadens bleibt vorbehalten.`
      : '',
    kvRealSatz: a.kvRealerfuellung
      ? ' Der Arbeitgeber kann überdies — besonders schriftlich verabredet im Sinne von Art. 340b Abs. 3 OR — die Beseitigung des vertragswidrigen Zustands verlangen, sofern seine verletzten oder bedrohten Interessen und das Verhalten des Arbeitnehmers/der Arbeitnehmerin dies rechtfertigen.'
      : '',
    gavZeigen: a.gav === 'ja' && !!a.gavName?.trim(),
    gavName: a.gavName ?? '',
    datumFmt: fmtDatum(a.datum),
  };

  return assemble(AV_SCHEMA, antworten);
}
