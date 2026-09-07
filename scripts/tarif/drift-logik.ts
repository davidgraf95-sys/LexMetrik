/**
 * W3-TARIF-STAND — reine Verdikt-Logik des Tors `check:tarif-drift`.
 *
 * Getrennt vom Netz-Runner (`tarif-drift.ts`), damit die Entscheidungsregel
 * ohne Netz testbar ist — dasselbe Muster wie `scripts/normtext/drift-logik.ts`.
 *
 * §2: rein/deterministisch. §8: kein stilles Grün — «unklar» und «unerreichbar»
 * sind eigene Verdikte und zählen NIE als in Ordnung.
 */

import type { StandDatum } from './stand.ts';

export type Verdikt = 'aktuell' | 'DRIFT' | 'unklar' | 'unerreichbar';

/** Was die amtliche Quelle zur geltenden Fassung sagt. */
export interface QuellFassung {
  /** Exakte Fassungskennung der Quelle (LexWork `current_version.id`,
   *  ZH-Registry-URL der geltenden Fassung). null = Portal kennt keine. */
  kennung: string | null;
  /** In-Kraft-Datum der geltenden Fassung, ISO «YYYY-MM-DD»; null = nicht gelesen. */
  standIso: string | null;
  /** Zusatz für die Tabelle (z. B. «Version 3863, in Vollzug seit 01.07.2026»). */
  anzeige: string;
  /** true, wenn die Quelle den Erlass als aufgehoben führt (LexWork `abrogated`).
   *  Optional: Adapter, die das Feld nicht kennen (z. B. ZH), lassen es weg —
   *  dann gilt es als nicht-aufgehoben. Befund M2 (W3-TARIF-STAND Nachzug
   *  6.9.2026): wurde bisher nur ANGEZEIGT («AUFGEHOBEN» in `anzeige`), trug
   *  aber kein Verdikt — ein aufgehobener Erlass konnte «aktuell» erscheinen,
   *  solange Fassungskennung/Datum zufällig übereinstimmten. */
  abrogated?: boolean;
}

/** Was in den Tarif-Daten hinterlegt ist. */
export interface HinterlegteFassung {
  /** Fassungskennung, die die `quelleUrl` selbst pinnt (LexWork-Versions-PDF:
   *  die Versionsnummer; ZH: die Registry-URL). null = die URL pinnt keine. */
  kennung: string | null;
  /** Projektion des `stand`-Anzeige-Strings (scripts/tarif/stand.ts). */
  stand: StandDatum;
}

export interface Beurteilung {
  verdikt: Verdikt;
  /** Ein Satz, warum — geht wörtlich in die Tabelle. */
  begruendung: string;
}

/** Jahr eines ISO-Werts («2026-07-01» → 2026, «2026» → 2026). */
function jahrVon(iso: string): number {
  return Number(iso.slice(0, 4));
}

/**
 * Verdikt für EINEN Tarif-Eintrag.
 *
 * Reihenfolge der Prüfungen (die erste, die greift, entscheidet):
 *   1. Quelle nicht abgefragt/erreichbar        → unerreichbar bzw. unklar
 *   2. Quelle führt den Erlass als aufgehoben   → DRIFT (Befund M2, schlägt
 *      auch eine übereinstimmende Fassungskennung — aufgehoben ist aufgehoben)
 *   3. Beide Seiten tragen eine Fassungskennung → exakter Vergleich (schlägt
 *      jeden Datumsvergleich: die Kennung IST die Fassung, ein Datum ist nur
 *      ihre Beschreibung)
 *   4. sonst Datumsvergleich, mit Granularität:
 *        - hinterlegt taggenau : Quelle später    → DRIFT, sonst aktuell
 *        - hinterlegt jahrgenau: Quelljahr grösser → DRIFT
 *                                Quelljahr kleiner → aktuell
 *                                gleiches Jahr     → unklar (nie grün raten)
 */
export function beurteile(
  hinterlegt: HinterlegteFassung,
  quelle: QuellFassung | null,
  fehler: string | null,
): Beurteilung {
  if (fehler) return { verdikt: 'unerreichbar', begruendung: fehler };
  if (!quelle) {
    return {
      verdikt: 'unklar',
      begruendung: 'kein Adapter für dieses Portal — Fassung nicht maschinell adressierbar',
    };
  }

  if (quelle.abrogated === true) {
    return { verdikt: 'DRIFT', begruendung: 'amtliche Quelle führt den Erlass als aufgehoben' };
  }

  if (hinterlegt.kennung !== null && quelle.kennung !== null) {
    return hinterlegt.kennung === quelle.kennung
      ? { verdikt: 'aktuell', begruendung: `Fassungskennung ${hinterlegt.kennung} = amtlich geltende` }
      : {
          verdikt: 'DRIFT',
          begruendung: `hinterlegte Fassung ${hinterlegt.kennung}, amtlich gilt ${quelle.kennung}`,
        };
  }

  const h = hinterlegt.stand;
  if (h.iso === null) {
    return { verdikt: 'unklar', begruendung: `hinterlegter Stand ohne Datum — ${h.grund}` };
  }
  if (quelle.standIso === null) {
    return { verdikt: 'unklar', begruendung: 'Quelle nennt kein In-Kraft-Datum der geltenden Fassung' };
  }

  if (h.genauigkeit === 'tag') {
    return quelle.standIso > h.iso
      ? {
          verdikt: 'DRIFT',
          begruendung: `hinterlegt ${h.iso}, amtlich geltende Fassung seit ${quelle.standIso}`,
        }
      : { verdikt: 'aktuell', begruendung: `hinterlegt ${h.iso} ≥ amtlich ${quelle.standIso}` };
  }

  // Jahres-Granularität: innerhalb desselben Jahres ist keine Aussage möglich.
  const hj = jahrVon(h.iso);
  const qj = jahrVon(quelle.standIso);
  if (qj > hj) {
    return {
      verdikt: 'DRIFT',
      begruendung: `hinterlegt nur jahrgenau ${hj}, amtlich geltende Fassung seit ${quelle.standIso}`,
    };
  }
  if (qj < hj) {
    return { verdikt: 'aktuell', begruendung: `hinterlegt jahrgenau ${hj} > amtlich ${quelle.standIso}` };
  }
  return {
    verdikt: 'unklar',
    begruendung: `hinterlegt nur jahrgenau ${hj}, amtlich ${quelle.standIso} — im selben Jahr nicht entscheidbar`,
  };
}

/** Zählwerk über eine Verdikt-Liste (Reihenfolge fix für die Ausgabe). */
export function zaehle(verdikte: readonly Verdikt[]): Record<Verdikt, number> {
  const z: Record<Verdikt, number> = { aktuell: 0, DRIFT: 0, unklar: 0, unerreichbar: 0 };
  for (const v of verdikte) z[v]++;
  return z;
}

/**
 * Exit-Code-Regel des Tors: DRIFT ist ein harter Fehler (Exit 1).
 * «unklar»/«unerreichbar» sind KEIN Grün, aber auch kein Beweis für Drift —
 * sie werden gezählt und sichtbar gemeldet (§8), und kippen das Tor nur im
 * strengen Modus (--streng), damit ein Netzausfall nicht als Rechtsdrift gilt.
 */
export function exitCode(z: Record<Verdikt, number>, streng: boolean): number {
  if (z.DRIFT > 0) return 1;
  if (streng && (z.unklar > 0 || z.unerreichbar > 0)) return 1;
  return 0;
}
