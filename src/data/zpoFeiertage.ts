import { addDays, isWeekend, isBefore, isAfter } from 'date-fns';
import type { Kanton } from '../types/legal';
import { dauerTageInklusiv } from '../lib/datumsUtils';

// ─── Ostersonntag (gregorianischer Computus, Meeus/Anonymous) ─────────────

export function ostersonntag(jahr: number): Date {
  const a = jahr % 19;
  const b = Math.floor(jahr / 100);
  const c = jahr % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const monat = Math.floor((h + l - 7 * m + 114) / 31); // 3 = März, 4 = April
  const tag = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(jahr, monat - 1, tag);
}

// ─── Fristenstillstand (Art. 145 Abs. 1 ZPO) ──────────────────────────────

export type Stillstandsperiode = { key: string; von: Date; bis: Date };

export function stillstandsperioden(jahr: number): Stillstandsperiode[] {
  const o = ostersonntag(jahr);
  return [
    // lit. a: 7. Tag vor bis und mit 7. Tag nach Ostersonntag → 15 Tage
    { key: `ostern-${jahr}`, von: addDays(o, -7), bis: addDays(o, 7) },
    // lit. b: 15. Juli bis und mit 15. August → 32 Tage
    { key: `sommer-${jahr}`, von: new Date(jahr, 6, 15), bis: new Date(jahr, 7, 15) },
    // lit. c: 18. Dezember bis und mit 2. Januar (Folgejahr) → 16 Tage
    { key: `weihnachten-${jahr}`, von: new Date(jahr, 11, 18), bis: new Date(jahr + 1, 0, 2) },
  ];
}

export function dauerTage(p: Stillstandsperiode): number {
  return dauerTageInklusiv(p);
}

const geq = (a: Date, b: Date) => !isBefore(a, b);
const leq = (a: Date, b: Date) => !isAfter(a, b);
const between = (d: Date, von: Date, bis: Date) => geq(d, von) && leq(d, bis);

/** Liefert die Stillstandsperiode, in die `date` fällt – oder null. */
export function stillstandsperiodeFuer(date: Date): Stillstandsperiode | null {
  const y = date.getFullYear();
  for (const jy of [y - 1, y, y + 1]) {
    for (const p of stillstandsperioden(jy)) {
      if (between(date, p.von, p.bis)) return p;
    }
  }
  return null;
}

// ─── Feiertage je Kanton (Art. 142 Abs. 3 ZPO) ────────────────────────────
//
// Datenbasis: Liste des Bundesamts für Justiz (BJ/EJPD) gestützt auf Art. 11 des
// Europäischen Übereinkommens vom 16.5.1972 über die Berechnung von Fristen
// (SR 0.221.122.3) – exakt der für Art. 142 Abs. 3 ZPO massgebende Katalog.
//
// VERIFIKATIONSVORBEHALT (Ziff. 6.7): Stand der BJ-Liste ist 1.1.2011; rechtlich
// entscheidend bleibt das aktuelle kantonale Feiertagsrecht. Einzige bundesweite
// Feiertage: Neujahr, Auffahrt, 1. August, Weihnachten. Regionale/konfessionelle
// Feiertage (FR-Seebezirk, SO-Bezirke, AG/GR kath. Gemeinden, AI innerer Landesteil)
// gelten nur am konkreten Gerichtsort – als Annahme kantonsweit geführt, zu prüfen.

const ALLE_KANTONE: Kanton[] = ['ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'];
const ausser = (...ex: Kanton[]): Kanton[] => ALLE_KANTONE.filter((k) => !ex.includes(k));

type FeiertagDef =
  | { art: 'fix'; monat: number; tag: number; kantone: 'alle' | Kanton[]; name: string }
  | { art: 'ostern'; offset: number; kantone: 'alle' | Kanton[]; name: string };

const FEIERTAGE: FeiertagDef[] = [
  // Fixe Feiertage
  { art: 'fix', monat: 1, tag: 1, kantone: 'alle', name: 'Neujahr' },
  { art: 'fix', monat: 1, tag: 2, kantone: ['ZH', 'BE', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'SH', 'SG', 'AG', 'TG', 'VD', 'VS', 'JU'], name: 'Berchtoldstag' },
  { art: 'fix', monat: 1, tag: 6, kantone: ['UR', 'SZ', 'TI'], name: 'Heilige Drei Könige' },
  { art: 'fix', monat: 3, tag: 1, kantone: ['NE'], name: 'Instauration de la République' },
  { art: 'fix', monat: 3, tag: 19, kantone: ['UR', 'SZ', 'NW', 'TI', 'VS'], name: 'Josephstag' },
  { art: 'fix', monat: 5, tag: 1, kantone: ['ZH', 'BS', 'BL', 'SH', 'TG', 'AG', 'JU', 'NE', 'TI'], name: 'Tag der Arbeit' },
  { art: 'fix', monat: 6, tag: 23, kantone: ['JU'], name: 'Commémoration du plébiscite jurassien' },
  { art: 'fix', monat: 6, tag: 29, kantone: ['TI'], name: 'Peter und Paul' },
  { art: 'fix', monat: 8, tag: 1, kantone: 'alle', name: 'Bundesfeier' },
  { art: 'fix', monat: 8, tag: 15, kantone: ['LU', 'UR', 'SZ', 'OW', 'NW', 'ZG', 'FR', 'SO', 'AI', 'TI', 'VS', 'JU', 'AG'], name: 'Mariä Himmelfahrt' },
  { art: 'fix', monat: 9, tag: 25, kantone: ['OW'], name: 'Bruder-Klausen-Fest' },
  { art: 'fix', monat: 11, tag: 1, kantone: ['LU', 'UR', 'SZ', 'OW', 'NW', 'ZG', 'FR', 'SO', 'AI', 'SG', 'TI', 'VS', 'JU', 'AG'], name: 'Allerheiligen' },
  { art: 'fix', monat: 12, tag: 8, kantone: ['LU', 'UR', 'SZ', 'OW', 'NW', 'ZG', 'AI', 'TI', 'VS', 'AG'], name: 'Mariä Empfängnis' },
  { art: 'fix', monat: 12, tag: 25, kantone: 'alle', name: 'Weihnachten' },
  { art: 'fix', monat: 12, tag: 26, kantone: ausser('VS', 'VD', 'GE', 'JU', 'GL'), name: 'Stephanstag' },
  { art: 'fix', monat: 12, tag: 31, kantone: ['GE'], name: 'Restauration de la République' },
  // Osterabhängige Feiertage
  { art: 'ostern', offset: -2, kantone: ausser('TI', 'VS'), name: 'Karfreitag' },
  { art: 'ostern', offset: 1, kantone: ausser('NE'), name: 'Ostermontag' },
  { art: 'ostern', offset: 39, kantone: 'alle', name: 'Auffahrt' },
  { art: 'ostern', offset: 50, kantone: ausser('NE', 'JU'), name: 'Pfingstmontag' },
  { art: 'ostern', offset: 60, kantone: ['LU', 'UR', 'SZ', 'OW', 'NW', 'ZG', 'FR', 'SO', 'AI', 'TI', 'VS', 'JU', 'AG'], name: 'Fronleichnam' },
];

// Kantonale Spezialfeiertage mit eigener Datumsregel (nicht oster-/datumsfix).
function naefelserFahrt(jahr: number): Date {       // GL: 1. Donnerstag im April
  let d = new Date(jahr, 3, 1);
  while (d.getDay() !== 4) d = addDays(d, 1);
  return d;
}
function jeuneGenevois(jahr: number): Date {        // GE: Donnerstag nach 1. Sonntag im September
  let d = new Date(jahr, 8, 1);
  while (d.getDay() !== 0) d = addDays(d, 1);
  return addDays(d, 4);
}
function lundiJeuneFederal(jahr: number): Date {     // VD: Montag nach 3. Sonntag im September
  let d = new Date(jahr, 8, 1);
  while (d.getDay() !== 0) d = addDays(d, 1);
  return addDays(d, 14 + 1);
}

function giltImKanton(kantone: 'alle' | Kanton[], kanton: Kanton): boolean {
  return kantone === 'alle' || kantone.includes(kanton);
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Anerkannter Feiertag am Gerichtsort? (Art. 142 Abs. 3 ZPO) */
export function istFeiertag(date: Date, kanton: Kanton): boolean {
  const jahr = date.getFullYear();
  const o = ostersonntag(jahr);
  const treffer = FEIERTAGE.some((def) => {
    if (!giltImKanton(def.kantone, kanton)) return false;
    const tag = def.art === 'fix' ? new Date(jahr, def.monat - 1, def.tag) : addDays(o, def.offset);
    return sameDay(tag, date);
  });
  if (treffer) return true;
  // Kantonale Spezialfeiertage
  if (kanton === 'GL' && sameDay(naefelserFahrt(jahr), date)) return true;
  if (kanton === 'GE' && sameDay(jeuneGenevois(jahr), date)) return true;
  if (kanton === 'VD' && sameDay(lundiJeuneFederal(jahr), date)) return true;
  return false;
}

/** Arbeitsfreier Tag = Samstag/Sonntag oder anerkannter Feiertag am Gerichtsort. */
export function istArbeitsfreierTag(date: Date, kanton: Kanton): boolean {
  return isWeekend(date) || istFeiertag(date, kanton);
}

/** Vorwärtsschiebung auf den nächsten Werktag (Sa/So/anerkannter Feiertag
 *  am massgebenden Ort) – kanonische Stelle; zuvor als while-Schleife in
 *  fristenEngine, verjaehrung und mietrecht je eigens ausgeschrieben. */
export function naechsterWerktag(d: Date, kanton: Kanton): Date {
  let t = d;
  while (istArbeitsfreierTag(t, kanton)) t = addDays(t, 1);
  return t;
}
