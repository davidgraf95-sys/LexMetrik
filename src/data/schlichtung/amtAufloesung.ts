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
  return null;
}
