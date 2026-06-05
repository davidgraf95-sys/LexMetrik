import { addDays, differenceInCalendarDays, format, isSaturday, isSunday, parseISO } from 'date-fns';
import { fristendeTage, fristendeKalender, OHNE_STILLSTAND, type Einheit } from './fristenEngine';
import { istFeiertag } from '../data/zpoFeiertage';
import type { Berechnungsergebnis, Kanton, Normverweis, Rechenschritt } from '../types/legal';

// ─── Allgemeiner Fristenrechner (Art. 77/78 OR) — dünne Engine ──────────────
//
// Andockt an die vorhandene fachneutrale Infrastruktur (Auftrag 5.6.2026,
// Phase-0-Befund «Andock-Fall»):
//   · dies a quo & Kalenderarithmetik: fristendeTage/fristendeKalender aus
//     fristenEngine.ts — IDENTISCH zur ZPO-Engine (beginnFolgetag=false →
//     Monatsfrist endet am gleichbezeichneten Tag, BGer 5A_691/2023;
//     Monatsende-Klemmung Art. 77 Abs. 1 Ziff. 3 OR via date-fns addMonths)
//   · Feiertage: kantonal differenzierte BJ/EJPD-Matrix + Computus aus
//     data/zpoFeiertage.ts (Stand 1.1.2011, Verifikationsvorbehalt dort)
// NEU ist nur die getrennte Verschiebe-Schleife (Wochenende/Feiertage als
// unabhängige Toggles) samt Rechenweg-Protokoll — bewusst OHNE Eingriff in
// die geteilten Bausteine. Keine Verfahrensbesonderheiten: Stillstände
// (Gerichtsferien, Betreibungsferien) leben in den Verfahrens-Engines.
//
// Rein, deterministisch, kein Date.now().

export type { Einheit } from './fristenEngine';

export interface AllgFristInput {
  start: string;                 // 'YYYY-MM-DD', als reiner Kalendertag interpretiert
  laenge: number;                // > 0, ganzzahlig
  einheit: Einheit;
  wochenendeVerschieben: boolean;
  feiertageVerschieben: boolean;
  kanton?: Kanton;               // nötig, wenn feiertageVerschieben
}

export interface RechenSchritt {
  label: string;
  datum: string;                 // dd.MM.yyyy
  wochentag: string;
  grund?: string;
}

export interface AllgFristResult {
  endDatum: string;              // dd.MM.yyyy
  endDatumISO: string;
  endWochentag: string;
  rohEndDatum: string;           // vor Verschiebung
  verschoben: boolean;
  verschiebeGruende: string[];
  schritte: RechenSchritt[];
  hinweise: string[];
}

const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const wochentag = (d: Date) => WOCHENTAGE[d.getDay()];
const fmt = (d: Date) => format(d, 'dd.MM.yyyy');
const iso = (d: Date) => format(d, 'yyyy-MM-dd');

const EINHEIT_LABEL: Record<Einheit, string> = {
  tage: 'Tagen', wochen: 'Wochen', monate: 'Monaten', jahre: 'Jahren',
};

// Verfahrens-Hinweis (Einfügung statt Abgrenzung, Auftrag §8)
export const ALLG_FRIST_HINWEIS =
  'Dieser allgemeine Rechner berücksichtigt keine verfahrensspezifischen Stillstände. ' +
  'Für gerichtliche Fristen den ZPO-Fristenrechner, für betreibungsrechtliche den ' +
  'SchKG-Fristenrechner verwenden.';

export function berechneAllgemeineFrist(input: AllgFristInput): AllgFristResult {
  if (!Number.isInteger(input.laenge) || input.laenge <= 0) {
    throw new Error('Fristlänge muss eine ganze Zahl > 0 sein.');
  }
  if (input.feiertageVerschieben && !input.kanton) {
    throw new Error('Für die Feiertags-Verschiebung ist der Kanton (Erfüllungsort) erforderlich.');
  }
  const start = parseISO(input.start);
  if (isNaN(start.getTime())) throw new Error('Ungültiges Startdatum.');

  const schritte: RechenSchritt[] = [];
  schritte.push({
    label: 'Ereignis-/Starttag — zählt nicht mit (dies a quo non computatur)',
    datum: fmt(start), wochentag: wochentag(start),
  });

  // 1) Rohes Fristende über die GETEILTEN Bausteine (identisch zu zpoFristen)
  let roh: Date;
  if (input.einheit === 'tage') {
    const r = fristendeTage(start, input.laenge, OHNE_STILLSTAND);
    roh = r.ende;
  } else {
    const r = fristendeKalender(start, input.einheit, input.laenge, OHNE_STILLSTAND, false);
    roh = r.ende;
  }
  schritte.push({
    label: 'Fristbeginn (erster mitzählender Tag)',
    datum: fmt(addDays(start, 1)), wochentag: wochentag(addDays(start, 1)),
  });

  // Monatsende-Klemmung sichtbar machen (Art. 77 Abs. 1 Ziff. 3 OR)
  const geklemmt = (input.einheit === 'monate' || input.einheit === 'jahre')
    && roh.getDate() !== start.getDate();
  schritte.push({
    label: `Rohes Fristende: ${input.laenge} ${EINHEIT_LABEL[input.einheit]}`,
    datum: fmt(roh), wochentag: wochentag(roh),
    grund: input.einheit === 'tage' || input.einheit === 'wochen'
      ? 'Kalendertage gezählt ab Folgetag (Art. 77 Abs. 1 Ziff. 1/2 OR)'
      : geklemmt
        ? 'Kein gleichbezeichneter Tag im Zielmonat → letzter Tag des Monats (Art. 77 Abs. 1 Ziff. 3 OR)'
        : 'Gleichbezeichneter Tag des Zielmonats (Art. 77 Abs. 1 Ziff. 3 OR; BGer 5A_691/2023)',
  });

  // 2)+3) Verschiebung mit GETRENNTEN Toggles (Art. 78 OR; SR 173.110.3)
  const grundFuer = (d: Date): string | null => {
    if (input.feiertageVerschieben && input.kanton && istFeiertag(d, input.kanton)) {
      return `gesetzlicher Feiertag (${input.kanton})`;
    }
    if (input.wochenendeVerschieben && isSunday(d)) return 'Sonntag (Art. 78 Abs. 1 OR)';
    if (input.wochenendeVerschieben && isSaturday(d)) return 'Samstag (SR 173.110.3)';
    return null;
  };

  let ende = roh;
  const verschiebeGruende: string[] = [];
  for (let guard = 0; guard < 30; guard++) {
    const grund = grundFuer(ende);
    if (!grund) break;
    schritte.push({
      label: 'Übersprungen',
      datum: fmt(ende), wochentag: wochentag(ende), grund,
    });
    verschiebeGruende.push(`${fmt(ende)} (${wochentag(ende)}): ${grund}`);
    ende = addDays(ende, 1);
  }

  schritte.push({
    label: 'Fristende (24.00 Uhr)',
    datum: fmt(ende), wochentag: wochentag(ende),
    grund: verschiebeGruende.length > 0 ? 'auf den nächstfolgenden Werktag verschoben (Art. 78 OR)' : undefined,
  });

  return {
    endDatum: fmt(ende),
    endDatumISO: iso(ende),
    endWochentag: wochentag(ende),
    rohEndDatum: fmt(roh),
    verschoben: verschiebeGruende.length > 0,
    verschiebeGruende,
    schritte,
    hinweise: [ALLG_FRIST_HINWEIS],
  };
}

// ── Hilfsmittel «Tage zwischen zwei Daten» (rein informativ, §4) ────────────

export function tageZwischen(vonISO: string, bisISO: string): { kalendertage: number; werktageMoFr: number } {
  const von = parseISO(vonISO);
  const bis = parseISO(bisISO);
  if (isNaN(von.getTime()) || isNaN(bis.getTime())) throw new Error('Ungültiges Datum.');
  const kalendertage = Math.abs(differenceInCalendarDays(bis, von));
  // Werktage Mo–Fr OHNE Feiertagsbezug — reines Zählwerkzeug ohne Rechtsbezug.
  let werktage = 0;
  const [a, b] = differenceInCalendarDays(bis, von) >= 0 ? [von, bis] : [bis, von];
  for (let d = addDays(a, 1); !isNaN(d.getTime()) && differenceInCalendarDays(b, d) >= 0; d = addDays(d, 1)) {
    if (!isSaturday(d) && !isSunday(d)) werktage += 1;
  }
  return { kalendertage, werktageMoFr: werktage };
}

// ── Abbildung in das einheitliche Anzeige-/Berichtsformat ───────────────────

const N_77: Normverweis = { artikel: 'Art. 77 OR', bemerkung: 'Fristberechnung (Ereignistag zählt nicht)' };
const N_78: Normverweis = { artikel: 'Art. 78 OR', bemerkung: 'Ende am Sonntag/anerkannten Feiertag → nächster Werktag' };
const N_SAMSTAG: Normverweis = { artikel: 'Fristengesetz (SR 173.110.3)', bemerkung: 'Samstag dem Feiertag gleichgestellt' };

export function allgemeineFristErgebnis(input: AllgFristInput): Berechnungsergebnis & { resultat: AllgFristResult } {
  const r = berechneAllgemeineFrist(input);

  const rechenweg: Rechenschritt[] = r.schritte.map((s) => ({
    beschreibung: s.label + (s.grund ? ` — ${s.grund}` : ''),
    zwischenergebnis: `${s.wochentag}, ${s.datum}`,
    normen: s.label.startsWith('Rohes Fristende') ? [N_77]
      : s.label === 'Übersprungen' && s.grund?.includes('Samstag') ? [N_SAMSTAG]
      : s.label === 'Übersprungen' ? [N_78]
      : [],
  }));

  const annahmen = [
    'Der Ereignistag wird nicht mitgezählt; Monats-/Jahresfristen enden am gleichbezeichneten Tag, sonst am Monatsende (Art. 77 OR).',
    ...(input.feiertageVerschieben
      ? [`Feiertage nach dem EJPD-Verzeichnis (Stand 2011), Kanton ${input.kanton}; regionale Besonderheiten im Einzelfall prüfen.`]
      : []),
    'Der Rechner ermittelt das Fristende ab dem eingegebenen Startdatum; den Fristbeginn (z. B. Zustellfiktionen) bestimmt er nicht.',
  ];

  const normverweise: Normverweis[] = [
    N_77,
    ...(r.verschoben || input.wochenendeVerschieben || input.feiertageVerschieben ? [N_78, N_SAMSTAG] : []),
  ];

  return {
    ergebnis: `${r.endWochentag}, ${r.endDatum}`,
    status: 'ok',
    rechenweg,
    annahmen,
    warnungen: r.hinweise,
    normverweise,
    resultat: r,
  };
}
