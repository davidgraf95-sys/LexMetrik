import type { Kanton } from '../../types/legal';
import { zhFriedensrichterFuer, type ZhAmt } from './zhAmt';

// ─── Generisch: Gemeinde → ordentliches Schlichtungsamt (konkrete Adresse) ──
// Quellen: zweifach geprüfte ZH-Vollerfassung (zhAmt.ts) + amtliche
// Behördenverzeichnisse AG/SG/TG (bibliothek/behoerden/schlichtungsaemter-
// gemeindezuordnung.md, 5.6.2026; generiert via scripts/plz-generieren.ts).
// Lookup-Reihenfolge deterministisch: exakter Name → Name + « (KT)» →
// Name ohne Kantonszusatz. Kein Fuzzy-Matching (§2).

export type SchlichtungsAmt = ZhAmt;

interface KantonsAemter { aemter: SchlichtungsAmt[]; gemeinden: Record<string, number> }
let cache: Record<string, KantonsAemter> | null = null;
// Case-insensitiver Zweitindex (Bug-Check-Befund 5.6.2026: handgetipptes
// «aarau» fand kein Amt). Einmalig je Kanton aufgebaut; KEIN Fuzzy-Matching —
// nur exakte Namen in Kleinschreibung.
const kleinIndex = new Map<string, Map<string, number>>();
function kleinFuer(kanton: string, d: KantonsAemter): Map<string, number> {
  let m = kleinIndex.get(kanton);
  if (!m) {
    m = new Map(Object.entries(d.gemeinden).map(([g, i]) => [g.toLowerCase(), i]));
    kleinIndex.set(kanton, m);
  }
  return m;
}

/** Kantone mit Gemeinde→Amt-Auflösung (ZH separat über zhAmt.ts).
 *  SZ/BL bewusst ausgenommen (Quellenlage teiloffen — Verzeichnis-Fallback). */
export const AMT_KANTONE: readonly Kanton[] = ['ZH', 'AG', 'SG', 'TG', 'FR', 'ZG', 'AI'] as const;

export async function amtFuer(kanton: Kanton, gemeinde: string): Promise<SchlichtungsAmt | null> {
  const g = gemeinde.trim();
  if (g === '') return null;
  if (kanton === 'ZH') return zhFriedensrichterFuer(g);
  if (!cache) {
    cache = (await import('./aemterKantone.json')).default as unknown as Record<string, KantonsAemter>;
  }
  const d = cache[kanton];
  if (!d) return null;
  const kandidaten = [g, `${g} (${kanton})`, g.replace(/ \([A-Z]{2}\)$/, '')];
  for (const k of kandidaten) {
    const idx = d.gemeinden[k];
    if (idx !== undefined) return d.aemter[idx];
  }
  // Fallback case-insensitiv (gleiche Kandidatenreihenfolge, kleingeschrieben)
  const klein = kleinFuer(kanton, d);
  for (const k of kandidaten) {
    const idx = klein.get(k.toLowerCase());
    if (idx !== undefined) return d.aemter[idx];
  }
  return null;
}
