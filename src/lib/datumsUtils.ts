import { differenceInCalendarDays,
  parseISO,
  format,
  differenceInYears,
  differenceInMonths,
  differenceInDays,
  addDays,
  addWeeks,
  addMonths,
  endOfMonth,
  isAfter,
  isBefore,
  isEqual,
} from 'date-fns';
import type { SkalaDauer } from '../types/legal';

// ─── Parsing / Formatting ─────────────────────────────────────────────────

export function parseDatum(s: string): Date {
  return parseISO(s);
}

export function formatDatum(d: Date): string {
  return format(d, 'dd.MM.yyyy');
}

export function formatISO(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

// ─── Dienstjahr ───────────────────────────────────────────────────────────
//
// Dienstjahr = vollendete Jahre zwischen Vertragsbeginn und Stichtag + 1.
// Beispiel: Beginn 01.01.2020, Stichtag 01.01.2021 → 1 vollendetes Jahr → 2. DJ.

export function berechneDienstjahr(vertragsbeginn: Date, stichtag: Date): number {
  return differenceInYears(stichtag, vertragsbeginn) + 1;
}

// ─── Anspruchsvoraussetzung: > 3 Monate Dauer ────────────────────────────

export function dauerUeberDreiMonate(von: Date, bis: Date): boolean {
  return differenceInMonths(bis, von) > 3 ||
    (differenceInMonths(bis, von) === 3 && differenceInDays(bis, addMonths(von, 3)) > 0);
}

// ─── Kalendermonate und Wochen addieren ───────────────────────────────────

export function addiereWochen(d: Date, n: number): Date {
  return addWeeks(d, n);
}

export function addiereMonate(d: Date, n: number): Date {
  return addMonths(d, n);
}

export function addiereTage(d: Date, n: number): Date {
  return addDays(d, n);
}

export function letzerTagDesMonats(d: Date): Date {
  return endOfMonth(d);
}

// ─── SkalaDauer → Enddatum (Starttag inklusive) ──────────────────────────
//
// letzterBezahlterTag = verhinderungBeginn + Skala-Dauer − 1 Tag
// Bsp. 3 Wochen ab 01.01.: addWeeks(01.01., 3) = 22.01.; -1 = 21.01.

export function addSkalaDauer(start: Date, dauer: SkalaDauer): Date {
  switch (dauer.typ) {
    case 'wochen': return addWeeks(start, dauer.anzahl);
    case 'monate': return addMonths(start, dauer.anzahl);
    case 'tage':   return addDays(start, dauer.anzahl);
  }
}

export function letzterTagLohnfortzahlung(start: Date, dauer: SkalaDauer): Date {
  return addDays(addSkalaDauer(start, dauer), -1);
}

// ─── Zwei BEWUSST UNTERSCHIEDLICHE Zählkonventionen (§4.2) ────────────────
//
// ACHTUNG: Art. 324a OR (Lohnfortzahlung) und Art. 336c OR (Sperrfrist) zählen
// den ersten Tag der Verhinderung UNTERSCHIEDLICH. Das ist KEIN Bug:
//
//   • Lohnfortzahlung (Art. 324a): Lohn ab dem ERSTEN Verhinderungstag inklusive.
//     -> letzterTagLohnfortzahlung() = start + Dauer − 1  (Starttag zählt mit)
//
//   • Sperrfrist (Art. 336c i.V.m. Art. 77 OR): der Anfangstag der Verhinderung
//     wird bei der Fristberechnung NICHT mitgezählt.
//     -> sperrfristEnde() = start + Tage           (Starttag zählt NICHT)
//
// NICHT vereinheitlichen.

/** Sperrfrist-Ende nach Art. 77 OR: Anfangstag zählt nicht mit, Kalendertage. */
export function sperrfristEnde(beginn: Date, tage: number): Date {
  return addDays(beginn, tage); // Art. 77 OR – bewusst KEIN −1 (vgl. §1.2)
}

// ─── Skalierung bei Teilarbeitsunfähigkeit (Budget-Modell) ───────────────
//
// Kalendarische Dauer = Skala-Dauer / AUF-Quote (z.B. 50 % → ×2).
// Budget-Modell: vertretbare Praxis-Auslegung, im Einzelfall zu prüfen.

export function skaliereSkalaDauer(dauer: SkalaDauer, aufProzent: number): SkalaDauer {
  const faktor = 100 / aufProzent;
  switch (dauer.typ) {
    case 'wochen': return { typ: 'wochen', anzahl: Math.round(dauer.anzahl * faktor) };
    case 'monate': return { typ: 'monate', anzahl: Math.round(dauer.anzahl * faktor) };
    case 'tage':   return { typ: 'tage',   anzahl: Math.round(dauer.anzahl * faktor) };
  }
}

export function formatSkalaDauer(dauer: SkalaDauer): string {
  switch (dauer.typ) {
    case 'wochen': return `${dauer.anzahl} Woche${dauer.anzahl !== 1 ? 'n' : ''}`;
    case 'monate': return `${dauer.anzahl} Monat${dauer.anzahl !== 1 ? 'e' : ''}`;
    case 'tage':   return `${dauer.anzahl} Tag${dauer.anzahl !== 1 ? 'e' : ''}`;
  }
}

// ─── Intervalloperationen ─────────────────────────────────────────────────

export type DatumsIntervall = { von: Date; bis: Date };

/** Gibt die Anzahl Tage (inkl. beider Endpunkte) zurück, die sich überschneiden. */
export function intervallSchnittTage(a: DatumsIntervall, b: DatumsIntervall): number {
  const start = isAfter(a.von, b.von) ? a.von : b.von;
  const ende  = isBefore(a.bis, b.bis) ? a.bis : b.bis;
  if (isAfter(start, ende)) return 0;
  return differenceInDays(ende, start) + 1;
}

export function istInIntervall(d: Date, von: Date, bis: Date): boolean {
  return (isEqual(d, von) || isAfter(d, von)) && (isEqual(d, bis) || isBefore(d, bis));
}

/** Nächster Monatsende-Tag >= d (falls d selbst Monatsende ist, gibt d zurück). */
export function naechstesMonatsende(d: Date): Date {
  const eoM = endOfMonth(d);
  if (isEqual(d, eoM)) return d;
  return eoM;
}

// ── Geteilte fachneutrale Helfer (Versimplung 5.6.2026, golden-bewiesen) ────

/** Dauer eines inklusiven Datums-Intervalls in Kalendertagen – kanonische
 *  Stelle (zuvor identisch in fristenEngine UND zpoFeiertage definiert). */
export function dauerTageInklusiv(p: { von: Date; bis: Date }): number {
  return differenceInCalendarDays(p.bis, p.von) + 1;
}
