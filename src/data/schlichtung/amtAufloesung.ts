import type { Kanton } from '../../types/legal';
import { namensKandidaten, zhFriedensrichterFuer, type ZhAmt } from './zhAmt';
import type { VdSchlichtungsStufe } from '../../lib/vdSchlichtung';
import { VD_CHAMBRE_PATRIMONIALE, VD_JDP_ZU_TA, VD_PRUDHOMMES, VD_TRIBUNAUX } from '../schlichtungsstellen';

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
 *  SZ/BL bewusst ausgenommen (Quellenlage teiloffen — Verzeichnis-Fallback).
 *  VD: amtFuer liefert die Justice de paix (Stufe < CHF 10'000) — für die
 *  höheren Streitwert-Stufen vdAmtFuer verwenden (Art. 41 CDPJ-VD).
 *  TI: drei Mehr-Circoli-Gemeinden (Lugano/Lema/Tresa) liefern null —
 *  die UI bietet dort die Ortsteil-Wahl an (tiKandidaten, tiAmt.ts). */
export const AMT_KANTONE: readonly Kanton[] = ['ZH', 'AG', 'SG', 'TG', 'FR', 'ZG', 'AI', 'GR', 'LU', 'AR', 'NE', 'BL', 'SZ', 'BE', 'VD', 'TI'] as const;

export async function amtFuer(kanton: Kanton, gemeinde: string): Promise<SchlichtungsAmt | null> {
  const g = gemeinde.trim();
  if (g === '') return null;
  if (kanton === 'ZH') return zhFriedensrichterFuer(g);
  if (!cache) {
    cache = (await import('./aemterKantone.json')).default as unknown as Record<string, KantonsAemter>;
  }
  const d = cache[kanton];
  if (!d) return null;
  // PLZ-Audit-Fix 6.6.2026: erweiterte deterministische Kandidatenliste
  // («St. »↔«St.», Langname→Kurzname, Suffix beidseitig) — siehe zhAmt.ts.
  const kandidaten = namensKandidaten(g, kanton);
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

/** VD: Gemeinde + Streitwert-Stufe → konkrete Schlichtungsinstanz
 *  (Art. 41 CDPJ-VD; Dossier §37). Die Justice de paix der Gemeinde
 *  bestimmt über VD_JDP_ZU_TA eindeutig das Tribunal d'arrondissement
 *  (die Doppel-District-JdP liegt ganz im Arrondissement Broye et Nord
 *  vaudois); die Chambre patrimoniale gilt kantonsweit.
 *  arbeitsrechtlich (Art. 2 LJT-VD, Bug-Check 11.6.2026): bis CHF 30'000
 *  (Stufen jdp + ta_praesident) das Tribunal de prud'hommes — die Kammer
 *  des nämlichen TA (Art. 5 LJT); darüber deckungsgleich TA/Chambre. */
export async function vdAmtFuer(gemeinde: string, stufe: VdSchlichtungsStufe, arbeitsrechtlich = false): Promise<SchlichtungsAmt | null> {
  if (stufe === 'chambre_patrimoniale') {
    const c = VD_CHAMBRE_PATRIMONIALE;
    return { name: c.name, strasse: c.strasse, plzOrt: c.plzOrt, ...(c.url ? { url: c.url } : {}) };
  }
  const jdp = await amtFuer('VD', gemeinde);
  if (!jdp) return null;
  if (stufe === 'justice_de_paix' && !arbeitsrechtlich) return jdp;
  const taIdx = VD_JDP_ZU_TA[jdp.name];
  const prudhommes = arbeitsrechtlich && (stufe === 'justice_de_paix' || stufe === 'ta_praesident');
  const ta = taIdx === undefined ? undefined : (prudhommes ? VD_PRUDHOMMES : VD_TRIBUNAUX)[taIdx];
  if (!ta) return null;
  return { name: ta.name, strasse: ta.strasse, plzOrt: ta.plzOrt, ...(ta.url ? { url: ta.url } : {}) };
}
