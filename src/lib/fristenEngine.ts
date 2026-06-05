import { addDays, addMonths, addYears, isAfter, isBefore } from 'date-fns';
import type { Kanton } from '../types/legal';
import { dauerTageInklusiv } from './datumsUtils';
import { istArbeitsfreierTag, naechsterWerktag } from '../data/zpoFeiertage';

// ─── Generische Fristen-Engine ────────────────────────────────────────────
//
// Modus-agnostischer Kern für Fristberechnungen. Die Unterschiede zwischen
// ZPO (Ruhen/Herausschneiden des Stillstands) und SchKG (kein Ruhen, sondern
// Verlängerung um 3 Werktage nach Art. 63) werden über die `Stillstand`-
// Strategie abgebildet. So nutzen beide Rechner dieselbe Datums-Arithmetik.
//
//   Endregel 'ruhen_weiter'      – ZPO Art. 145/146: Stillstand pausiert die
//                                  Frist; Ende in Stillstand → Tag nach Periode.
//   Endregel 'verlaengerung_3wt' – SchKG Art. 63: Frist läuft durch; nur wenn
//                                  das Ende in die geschlossene Zeit fällt,
//                                  Verlängerung auf den 3. Werktag danach.
//   Endregel 'nur_werktag'       – kein Stillstand; nur Art. 142 Abs. 3 ZPO
//                                  (Ende auf Sa/So/Feiertag → nächster Werktag).

export type Periode = { key: string; von: Date; bis: Date };

export type Endregel = 'ruhen_weiter' | 'verlaengerung_3wt' | 'nur_werktag';

export type Einheit = 'tage' | 'wochen' | 'monate' | 'jahre';

export interface Stillstand {
  /** Geschlossene Periode, in die `d` fällt – oder null. */
  periodeFuer(d: Date): Periode | null;
  /** Alle geschlossenen Perioden eines Jahres (für kumulative Ruhen-Verlängerung). */
  perioden(jahr: number): Periode[];
  /** Pausieren geschlossene Tage die Tageszählung (Ruhen)? */
  ruhenZaehlung: boolean;
  /** Wie wird ein Fristende in/an geschlossener Zeit behandelt? */
  endregel: Endregel;
}

const leq = (a: Date, b: Date) => !isAfter(a, b);

/** Strategie ohne jede geschlossene Zeit (nur Werktagsverschiebung am Ende). */
export const OHNE_STILLSTAND: Stillstand = {
  periodeFuer: () => null,
  perioden: () => [],
  ruhenZaehlung: false,
  endregel: 'nur_werktag',
};

/** Dauer einer Periode in Kalendertagen (inklusiv). */
export function dauerTage(p: Periode): number {
  return dauerTageInklusiv(p);
}

/**
 * Der n-te Werktag NACH `d`. Samstag, Sonntag und anerkannte Feiertage am
 * Gerichtsort zählen nicht mit (Art. 63 SchKG; BGE 108 III 49).
 */
export function nthWerktagNach(d: Date, n: number, kanton: Kanton): Date {
  let c = d;
  let gezaehlt = 0;
  for (let guard = 0; guard < 100 && gezaehlt < n; guard++) {
    c = addDays(c, 1);
    if (!istArbeitsfreierTag(c, kanton)) gezaehlt += 1;
  }
  return c;
}

// ─── Tagesfristen ─────────────────────────────────────────────────────────
// Beginn am Folgetag (Art. 142 Abs. 1 ZPO). Geschlossene Tage werden nur dann
// nicht mitgezählt, wenn die Strategie ruhen lässt (ZPO). Die Endnormalisierung
// erfolgt separat über normalisiereEnde().

export function fristendeTage(
  ereignis: Date,
  laenge: number,
  st: Stillstand,
): { diesAQuo: Date; ende: Date } {
  let cursor = addDays(ereignis, 1);
  let gezaehlt = 0;
  let diesAQuo: Date | null = null;
  for (let guard = 0; guard < 4000; guard++) {
    const geschlossen = st.ruhenZaehlung && st.periodeFuer(cursor) !== null;
    if (!geschlossen) {
      gezaehlt += 1;
      if (gezaehlt === 1) diesAQuo = cursor;
      if (gezaehlt === laenge) return { diesAQuo: diesAQuo!, ende: cursor };
    }
    cursor = addDays(cursor, 1);
  }
  throw new Error('Fristberechnung (Tage) konvergiert nicht.');
}

// ─── Wochen-/Monats-/Jahresfristen (gleichbezeichneter Tag) ───────────────

function naivesEnde(ref: Date, einheit: Einheit, N: number): Date {
  switch (einheit) {
    case 'wochen': return addDays(ref, 7 * N);
    case 'monate': return addMonths(ref, N);
    case 'jahre':  return addYears(ref, N);
    case 'tage':   return addDays(ref, N);
  }
}

export function fristendeKalender(
  ereignis: Date,
  einheit: Einheit,
  laenge: number,
  st: Stillstand,
  beginnFolgetag: boolean,
): { diesAQuo: Date; ende: Date; verlaengerungTage: number } {
  // dies a quo: Ereignistag selbst, bzw. letzter Tag der Stillstandsperiode,
  // falls das Ereignis in eine ruhende Periode fällt (Art. 146 Abs. 1 ZPO).
  let diesAQuo = ereignis;
  if (st.ruhenZaehlung) {
    const p0 = st.periodeFuer(ereignis);
    if (p0) diesAQuo = p0.bis;
  }

  let ref = diesAQuo;
  if (beginnFolgetag) ref = addDays(ref, 1);

  let ende = naivesEnde(ref, einheit, laenge);

  // Kumulative Stillstandsverlängerung – nur bei echtem Ruhen (ZPO).
  let verlaengerungTage = 0;
  if (st.endregel === 'ruhen_weiter') {
    const angewandt = new Set<string>();
    for (let guard = 0; guard < 50; guard++) {
      let cand: Periode | null = null;
      for (let jy = ref.getFullYear() - 1; jy <= ende.getFullYear() + 1; jy++) {
        for (const p of st.perioden(jy)) {
          if (angewandt.has(p.key)) continue;
          if (isAfter(p.von, ref) && leq(p.von, ende)) {
            if (!cand || isBefore(p.von, cand.von)) cand = p;
          }
        }
      }
      if (!cand) break;
      const d = dauerTage(cand);
      ende = addDays(ende, d);
      verlaengerungTage += d;
      angewandt.add(cand.key);
    }
  }

  return { diesAQuo, ende, verlaengerungTage };
}

// ─── Endnormalisierung ────────────────────────────────────────────────────

export function normalisiereEnde(
  ende: Date,
  kanton: Kanton,
  st: Stillstand,
): { tag: Date; verschoben: boolean } {
  // SchKG Art. 63: Ende IN geschlossener Zeit → 3. Werktag danach. Liegt das
  // Ende nur auf einem Sa/So/Feiertag (nicht in der Periode), gilt nicht die
  // Dreitagesregel, sondern Art. 31 SchKG i.V.m. Art. 142 Abs. 3 ZPO
  // (Verschiebung auf den nächsten Werktag) – BSK-Schmid/Bauer, Art. 63 N. 5.
  if (st.endregel === 'verlaengerung_3wt') {
    const p = st.periodeFuer(ende);
    if (p) return { tag: nthWerktagNach(p.bis, 3, kanton), verschoben: true };
    const d = naechsterWerktag(ende, kanton);
    return { tag: d, verschoben: +d !== +ende };
  }

  // ruhen_weiter (ZPO) und nur_werktag: gemeinsame Schleife. Bei ruhen_weiter
  // springt das Ende über eine ruhende Periode auf den Tag nach deren Ende.
  let d = ende;
  let verschoben = false;
  for (let guard = 0; guard < 400; guard++) {
    const p = st.endregel === 'ruhen_weiter' ? st.periodeFuer(d) : null;
    if (p) { d = addDays(p.bis, 1); verschoben = true; continue; }
    if (istArbeitsfreierTag(d, kanton)) { d = addDays(d, 1); verschoben = true; continue; }
    break;
  }
  return { tag: d, verschoben };
}
