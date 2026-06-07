import type { Kanton } from '../../types/legal';
import { BETREIBUNGSAEMTER, type BetreibungsamtAdresse } from '../betreibungsaemter';
import { namensKandidaten } from '../schlichtung/zhAmt';

// ─── Gemeinde → konkretes Betreibungsamt (Adresse) ──────────────────────────
// Quellen: amtliche Extraktion 7.6.2026 (Workflow, je Kanton adversarial
// stichproben-geprüft; Karten gegen das swisstopo-Gemeinderegister
// normalisiert — Dossier bibliothek/behoerden/betreibungskreise-kantone.md).
// Aufgelöste Kantone: BETREIBUNGSAMT_KANTONE; Stadt Zürich (12) und
// Winterthur (3) lösen auf ihre Stadtkreis-Ämter auf (Liste, kein Raten §2).
// Lookup deterministisch über namensKandidaten (geteilt mit der
// Schlichtungs-Auflösung, fachneutrale Infrastruktur §4) — kein Fuzzy-Match.

interface KantonsKarte { gemeinden: Record<string, number>; stadtKreise?: Record<string, number[]> }
let cache: Record<string, KantonsKarte> | null = null;
const kleinIndex = new Map<string, Map<string, number>>();
function kleinFuer(kanton: string, d: KantonsKarte): Map<string, number> {
  let m = kleinIndex.get(kanton);
  if (!m) {
    m = new Map(Object.entries(d.gemeinden).map(([g, i]) => [g.toLowerCase(), i]));
    kleinIndex.set(kanton, m);
  }
  return m;
}

/** Kantone mit Gemeinde→Amt-Auflösung (BE/VS: amtlich keine gemeindescharfe
 *  Zuordnung publiziert → Dienststellen-/Ämterliste in der UI). */
export const BETREIBUNGSAMT_KANTONE: readonly Kanton[] = ['ZH', 'FR', 'SO', 'AR', 'GR', 'TG', 'TI', 'VD'] as const;

export type BetreibungsamtTreffer =
  | { art: 'amt'; amt: BetreibungsamtAdresse }
  | { art: 'stadtkreise'; stadt: string; aemter: BetreibungsamtAdresse[] };

export async function betreibungsamtFuer(kanton: Kanton, gemeinde: string): Promise<BetreibungsamtTreffer | null> {
  const g = gemeinde.trim();
  if (g === '') return null;
  const eintrag = BETREIBUNGSAEMTER[kanton];
  if (eintrag.aufloesung.modus !== 'kreise') return null;
  const aemter = eintrag.aufloesung.aemter;
  if (!cache) {
    cache = (await import('./aemterKantone.json')).default as unknown as Record<string, KantonsKarte>;
  }
  const d = cache[kanton];
  if (!d) return null;
  // Stadt-Sonderfall (ZH): Stadt Zürich/Winterthur → Stadtkreis-Ämter als Liste
  if (d.stadtKreise) {
    for (const [stadt, indizes] of Object.entries(d.stadtKreise)) {
      if (stadt.toLowerCase() === g.toLowerCase()) {
        return { art: 'stadtkreise', stadt, aemter: indizes.map((i) => aemter[i]).filter(Boolean) };
      }
    }
  }
  const kandidaten = namensKandidaten(g, kanton);
  for (const k of kandidaten) {
    const idx = d.gemeinden[k];
    if (idx !== undefined && aemter[idx]) return { art: 'amt', amt: aemter[idx] };
  }
  const klein = kleinFuer(kanton, d);
  for (const k of kandidaten) {
    const idx = klein.get(k.toLowerCase());
    if (idx !== undefined && aemter[idx]) return { art: 'amt', amt: aemter[idx] };
  }
  return null;
}
