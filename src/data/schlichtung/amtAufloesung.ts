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
 *  die UI bietet dort die Ortsteil-Wahl an (tiKandidaten, tiAmt.ts).
 *  SO: amtFuer liefert das Amtsgerichtspräsidium (§ 10 GO) — gilt NUR,
 *  wenn die Parteien nicht in derselben Gemeinde wohnen/sitzen (die UIs
 *  gaten über die § 5-Weiche; gleiche Gemeinde → Friedensrichter).
 *  VS: Juge de commune — Anlaufstelle ist die Gemeindeverwaltung (1:1,
 *  Einzelerhebung 11.6.2026; der Name der Stelle legt das offen). */
export const AMT_KANTONE: readonly Kanton[] = ['ZH', 'AG', 'SG', 'TG', 'FR', 'ZG', 'AI', 'GR', 'LU', 'AR', 'NE', 'BL', 'SZ', 'BE', 'VD', 'TI', 'SO', 'VS'] as const;

/** Gemeinsamer Register-Lookup (ordentlich = Schlüssel «XX», Miete =
 *  «XX_MIETE»): deterministische Kandidatenliste + case-insensitiver
 *  Zweitindex (PLZ-Audit-Fix 6.6.2026; siehe zhAmt.ts). */
async function registerLookup(schluessel: string, kanton: Kanton, gemeinde: string): Promise<SchlichtungsAmt | null> {
  const g = gemeinde.trim();
  if (g === '') return null;
  if (!cache) {
    cache = (await import('./aemterKantone.json')).default as unknown as Record<string, KantonsAemter>;
  }
  const d = cache[schluessel];
  if (!d) return null;
  const kandidaten = namensKandidaten(g, kanton);
  for (const k of kandidaten) {
    const idx = d.gemeinden[k];
    if (idx !== undefined) return d.aemter[idx];
  }
  const klein = kleinFuer(schluessel, d);
  for (const k of kandidaten) {
    const idx = klein.get(k.toLowerCase());
    if (idx !== undefined) return d.aemter[idx];
  }
  return null;
}

export async function amtFuer(kanton: Kanton, gemeinde: string): Promise<SchlichtungsAmt | null> {
  if (kanton === 'ZH') return zhFriedensrichterFuer(gemeinde.trim());
  return registerLookup(kanton, kanton, gemeinde);
}

/** Kantone mit Gemeinde→MIET-Schlichtungsstelle-Auflösung (Art. 200 Abs. 1
 *  ZPO; Register-Schlüssel «XX_MIETE», Vollerhebung 11.6.2026 — Dossier
 *  §§41–47): VD 10 Commissions préfectorales · FR 3 Bezirks-Gruppen ·
 *  GR 11 je Region · SZ 6 Bezirke · AG 11 Bezirke · SG 7 Gerichtskreise ·
 *  TG 80 kommunale (1:1).
 *  TI (Vollerhebung 12.6.2026, Dossier §51): 11 Uffici di conciliazione
 *  in materia di locazione (Art. 5 LALoc) — drei Gemeinden liefern null
 *  (Lugano n. 3/4 · Bellinzona n. 9/10/11 · Val Mara n. 5/2): dort bietet
 *  die UI die Ortsteil-Wahl an (tiMieteKandidaten, tiAmt.ts). */
export const MIETE_AMT_KANTONE: readonly Kanton[] = ['VD', 'FR', 'GR', 'SZ', 'AG', 'SG', 'TG', 'ZH', 'SO', 'JU', 'BE', 'TI'] as const;

/** BE: die vier regionalen Schlichtungsbehörden amten AUCH paritätisch für
 *  Miete (kein eigenes Register nötig) — Alias aufs ordentliche Register. */
const MIETE_REGISTER_ALIAS: Partial<Record<Kanton, string>> = { BE: 'BE' };

/** Paritätische Miet-Schlichtungsstelle für eine Gemeinde — null, wenn der
 *  Kanton kein Miete-Register hat (dann Liste/zentral/Verzeichnis). */
export async function mieteAmtFuer(kanton: Kanton, gemeinde: string): Promise<SchlichtungsAmt | null> {
  return registerLookup(MIETE_REGISTER_ALIAS[kanton] ?? `${kanton}_MIETE`, kanton, gemeinde);
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
