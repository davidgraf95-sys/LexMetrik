import type { Kanton } from '../../types/legal';
import { strassenKandidaten } from './strassenKandidaten';

// ─── Strasse (+ Hausnummer) → Gemeinde bei mehrdeutigen PLZ ─────────────────
// Adress-Ausbau Stufe 2 (Entscheid David 12.6.2026): löst die Kachel-Wahl
// gemeinde-mehrdeutiger PLZ offline auf — Quelle: swisstopo «Amtliches
// Verzeichnis der Gebäudeadressen» (Generator ch-strassen-generieren.ts,
// zwei eigene Lazy-Chunks, zusammen ~0.6 MB gzip). 98.5 % der Strassen in
// mehrdeutigen PLZ sind allein über den Namen gemeinde-eindeutig; 1'425
// Grenzstrassen entscheiden über die amtliche Hausnummer. KEINE Heuristik
// (§2): exakter Name, case-insensitiver Zweitindex, feste «…str.»-Abbildung;
// kein Treffer → null (die UI bleibt bei der Kachel-Wahl). Nichts verlässt
// den Browser — Gegenstück zur expliziten Bundes-API-Suche (Stufe 3).

export type StrassenErgebnis =
  | { typ: 'gemeinde'; gemeinde: string; kanton: Kanton }
  /** Grenzstrasse: die Hausnummer entscheidet (fehlt oder ist doppelt). */
  | { typ: 'nummer_noetig'; strasse: string };

interface PlzEintrag { g: [string, string][]; s: Record<string, number> }
let verzCache: Record<string, PlzEintrag> | null = null;
let numCache: Record<string, Record<string, number>> | null = null;
// Case-insensitive Zweitindizes, je PLZ lazy aufgebaut (PLZ-Audit-Muster).
const kleinJePlz = new Map<string, Map<string, string>>();
let grenzJePlz: Map<string, Map<string, string>> | null = null;

async function lade(): Promise<[Record<string, PlzEintrag>, Record<string, Record<string, number>>]> {
  if (!verzCache) verzCache = (await import('./strassenVerzeichnis.json')).default as unknown as Record<string, PlzEintrag>;
  if (!numCache) numCache = (await import('./strassenNummern.json')).default as unknown as Record<string, Record<string, number>>;
  return [verzCache, numCache];
}

function kleinIndex(plz: string, d: PlzEintrag): Map<string, string> {
  let m = kleinJePlz.get(plz);
  if (!m) {
    m = new Map(Object.keys(d.s).map((s) => [s.toLowerCase(), s]));
    kleinJePlz.set(plz, m);
  }
  return m;
}

function grenzIndex(nummern: Record<string, Record<string, number>>): Map<string, Map<string, string>> {
  if (!grenzJePlz) {
    grenzJePlz = new Map();
    for (const schluessel of Object.keys(nummern)) {
      const [plz, strasse] = [schluessel.slice(0, 4), schluessel.slice(5)];
      if (!grenzJePlz.has(plz)) grenzJePlz.set(plz, new Map());
      grenzJePlz.get(plz)!.set(strasse.toLowerCase(), strasse);
    }
  }
  return grenzJePlz;
}

/** Gemeinde für eine Strasse in einer gemeinde-mehrdeutigen PLZ; null bei
 *  eindeutiger/unbekannter PLZ oder unbekannter Strasse (Kachel-Wahl). */
export async function strasseAufloesen(plz: string, strasse: string, hausnummer = ''): Promise<StrassenErgebnis | null> {
  if (!/^\d{4}$/.test(plz.trim())) return null;
  const [verz, nummern] = await lade();
  const d = verz[plz.trim()];
  if (!d) return null;
  const kandidaten = strassenKandidaten(strasse);
  if (kandidaten.length === 0) return null;
  // 1) gemeinde-eindeutige Strasse: Name (oder Zweitindex) → Gemeinde
  let idx: number | undefined;
  for (const k of kandidaten) {
    idx = d.s[k];
    if (idx !== undefined) break;
  }
  if (idx === undefined) {
    const klein = kleinIndex(plz.trim(), d);
    for (const k of kandidaten) {
      const name = klein.get(k.toLowerCase());
      if (name !== undefined) { idx = d.s[name]; break; }
    }
  }
  if (idx !== undefined) {
    const [gemeinde, kanton] = d.g[idx];
    return { typ: 'gemeinde', gemeinde, kanton: kanton as Kanton };
  }
  // 2) Grenzstrasse: amtliche Einzeladresse (Hausnummer) entscheidet
  const grenz = grenzIndex(nummern).get(plz.trim());
  let name: string | undefined;
  for (const k of kandidaten) {
    name = grenz?.get(k.toLowerCase());
    if (name !== undefined) break;
  }
  if (name === undefined) return null;
  const tabelle = nummern[`${plz.trim()}|${name}`] ?? {};
  const nrRoh = hausnummer.trim().replace(/\s+/g, '');
  if (nrRoh !== '') {
    const treffer = tabelle[nrRoh]
      ?? Object.entries(tabelle).find(([nr]) => nr.toLowerCase() === nrRoh.toLowerCase())?.[1];
    if (treffer !== undefined) {
      const [gemeinde, kanton] = d.g[treffer];
      return { typ: 'gemeinde', gemeinde, kanton: kanton as Kanton };
    }
  }
  return { typ: 'nummer_noetig', strasse: name };
}
