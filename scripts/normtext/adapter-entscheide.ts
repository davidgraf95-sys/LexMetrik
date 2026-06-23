// ─── Adapter: OpenCaseLaw → EntscheidSnapshot (browserlos, §7) ───────────────
//
// EIN Adapter für Bund (und später Kanton — gleiches Format pro Gericht). Nur
// keyed-Lookups (decisions/{id} + structure/{id}) — die schnellen, verlässlichen
// Endpoints (Listing/leading-cases sind unzuverlässig, Fahrplan R1/R9). Kein
// Headless-Browser, kein OCR. Recht: Urteilstext gemeinfrei (Art. 5 URG).

import type {
  EntscheidSnapshot, EntscheidAbschnitt, EntscheidBlock, EntscheidSprache,
} from '../../src/lib/rechtsprechung/typen';
import type { Rechtsgebiet } from '../../src/lib/normtext/register';
import { normalisiereRegeste, bereinigeFliesstext } from '../../src/lib/rechtsprechung/register';
import { sha256EntscheidBloecke } from './sha-entscheide';
import {
  statutesZuNormKeys, legalAreaZuSachgebiet, abteilungZuSachgebiet, gerichtstypFuerCourt,
  gerichtAnzeigename, kantonalSachgebiet, fmtDatumDe,
} from './entscheide-mapping';

const API = 'https://mcp.opencaselaw.ch/api';

// Schlanke Typen der OCL-Rohantworten (nur die genutzten Felder; Index-Signatur
// für den Rest). Ersetzt `any` (Tor @typescript-eslint/no-explicit-any).
export interface OclDecision {
  decision_id?: string;
  court?: string; court_name?: string; canton?: string; chamber?: string | null;
  docket_number?: string; bge_reference?: string | null; citation_string_de?: string;
  decision_date?: string; language?: string; marked_for_publication?: boolean;
  legal_area?: string | null; regeste?: string | null; full_text?: string;
  statutes?: string[]; cited_decisions?: string | string[]; content_hash?: string;
  source_url?: string; canonical_url?: string;
  [k: string]: unknown;
}
export interface OclParagraph { e_number?: string; depth?: number; text?: string; text_excerpt?: string }
export interface OclStructure {
  sachverhalt_excerpt?: string; erwaegungen_paragraphs?: OclParagraph[];
  dispositiv?: string; dispositiv_orders?: string[]; regeste?: string | null;
  [k: string]: unknown;
}

/** Robustes JSON-GET mit Timeout + Retry (OCL-Latenz ist sprunghaft). */
export async function jget<T = unknown>(url: string, tries = 3, timeoutMs = 45000): Promise<T | null> {
  for (let i = 0; i < tries; i++) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ac.signal, redirect: 'follow' });
      clearTimeout(t);
      if (res.status === 404 || res.status === 422) return null;
      if (!res.ok) { await sleep(800 * (i + 1)); continue; }
      return (await res.json()) as T;
    } catch {
      clearTimeout(t);
      await sleep(800 * (i + 1));
    }
  }
  return null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface HoleOpts {
  /** Erzwungenes Sachgebiet (z.B. wenn über law_code gefunden). */
  sachgebietHint?: Rechtsgebiet | null;
  /** Zusätzlicher garantierter Norm-Key (z.B. der law_code der Quelle). */
  normKeyHint?: string | null;
  /** Sprachfilter; default 'de'. null = alle. */
  sprache?: string | null;
}

/**
 * Pure Mapping der OCL-Rohdaten (decision + structure) → EntscheidSnapshot.
 * Netzfrei → unit-testbar (Fixtures) und für Offline-Builds aus dem Cache nutzbar.
 */
export function mappeEntscheidOCL(
  det: OclDecision | null,
  str: OclStructure | null,
  abgerufen: string,
  opts: HoleOpts = {},
): EntscheidSnapshot | null {
  if (!det || !det.decision_id) return null;
  const sprache = (det.language ?? 'de') as EntscheidSprache;

  // ── Abschnitte aus der amtlichen Gliederung (oder Fallback full_text) ──
  const abschnitte: EntscheidAbschnitt[] = [];
  if (str) {
    if (typeof str.sachverhalt_excerpt === 'string' && str.sachverhalt_excerpt.trim()) {
      abschnitte.push({ typ: 'sachverhalt', bloecke: [{ marke: null, text: bereinigeFliesstext(str.sachverhalt_excerpt) }] });
    }
    const paras: OclParagraph[] = Array.isArray(str.erwaegungen_paragraphs) ? str.erwaegungen_paragraphs : [];
    const ervBloecke: EntscheidBlock[] = paras
      .map((p) => ({
        marke: p.e_number ? `E. ${p.e_number}` : null,
        tiefe: typeof p.depth === 'number' ? p.depth : undefined,
        text: bereinigeFliesstext(String(p.text ?? p.text_excerpt ?? '')),
      }))
      .filter((b) => b.text);
    if (ervBloecke.length) abschnitte.push({ typ: 'erwaegung', bloecke: ervBloecke });
    // Dispositiv als EIN sauberer Block. (OCL dispositiv_orders zerteilt unzuverlässig
    // an Datumsangaben wie „2. Dezember" → bewusst nicht als Liste, §1: kein Falsch-Split.)
    if (typeof str.dispositiv === 'string' && str.dispositiv.trim()) {
      abschnitte.push({ typ: 'dispositiv', bloecke: [{ marke: null, text: bereinigeFliesstext(str.dispositiv) }] });
    }
  }
  // Fallback: keine Gliederung → ganzer Volltext als ein Erwägungs-Block (ehrlich markiert in der UI).
  if (abschnitte.length === 0 && typeof det.full_text === 'string' && det.full_text.trim()) {
    abschnitte.push({ typ: 'erwaegung', bloecke: [{ marke: null, text: bereinigeFliesstext(det.full_text) }] });
  }
  if (abschnitte.length === 0) return null;

  // ── Regeste (lizenz-getrennt) ──
  const regesteRoh: string | null = det.regeste ?? str?.regeste ?? null;
  const regeste = regesteRoh && String(regesteRoh).trim()
    ? { text: normalisiereRegeste(String(regesteRoh)), quelle: 'opencaselaw' as const }
    : null;

  // ── zitierte Entscheide (OCL liefert JSON-STRING) ──
  let zitierteEntscheide: string[] = [];
  try {
    const parsed = typeof det.cited_decisions === 'string'
      ? JSON.parse(det.cited_decisions)
      : det.cited_decisions;
    if (Array.isArray(parsed)) zitierteEntscheide = parsed.map(String).filter(Boolean);
  } catch { /* tolerant: kaputtes cited_decisions ignorieren */ }

  // ── Verzahnung: normKeys ──
  const normKeys = new Set<string>(statutesZuNormKeys(det.statutes ?? []));
  if (opts.normKeyHint) normKeys.add(opts.normKeyHint);

  const court = String(det.court ?? 'bger');
  const canton = String(det.canton ?? 'CH');
  const docket = String(det.docket_number ?? det.decision_id);
  const sachgebiet: Rechtsgebiet =
    opts.sachgebietHint
    ?? legalAreaZuSachgebiet(det.legal_area)
    ?? abteilungZuSachgebiet(docket)
    ?? kantonalSachgebiet(docket)
    ?? 'oeffentlich';
  const gerichtName = gerichtAnzeigename(court, canton, det.court_name as string | undefined);

  // Leitentscheid = amtliche Publikation: marked_for_publication ODER BGE-Fundstelle
  // ODER vorhandene amtliche Regeste (eine Regeste tragen nur publizierte Entscheide).
  const leit = det.marked_for_publication === true || !!det.bge_reference || !!regeste;
  const docketSafe = docket.replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, '_');
  // Bund unter bund/, kantonale Gerichte unter kanton/<KT>/ (eigener Pfad-Zweig).
  const idSafe = canton === 'CH'
    ? `bund/${court}/${docketSafe}`
    : `kanton/${canton}/${court}/${docketSafe}`;

  return {
    id: idSafe,
    gericht: court,
    gerichtName,
    gerichtstyp: gerichtstypFuerCourt(court),
    kanton: canton,
    abteilung: det.chamber ? String(det.chamber) : null,
    nummer: docket,
    bgeReferenz: det.bge_reference ? String(det.bge_reference) : null,
    // Lesbare Zitierung: Bund über OCL-Zitat; Kanton deterministisch aus Anzeigename
    // (OCL liefert dort nur den rohen Court-Code, Audit P0).
    zitierung: canton === 'CH'
      ? String(det.citation_string_de ?? `BGer ${docket} vom ${fmtDatumDe(String(det.decision_date ?? ''))}`)
      : `${gerichtName} ${docket} vom ${fmtDatumDe(String(det.decision_date ?? ''))}`,
    datum: String(det.decision_date ?? ''),
    sprache,
    leitcharakter: leit ? 'leitentscheid' : 'routine',
    sachgebiet,
    regeste,
    abschnitte,
    dispositivOrders: Array.isArray(str?.dispositiv_orders) ? str.dispositiv_orders.map(String) : [],
    zitierteNormen: Array.isArray(det.statutes) ? det.statutes.map(String) : [],
    normKeys: [...normKeys],
    zitierteEntscheide,
    bestand: 'snapshot',
    kuratierung: 'maschinell',
    quelle: 'opencaselaw',
    quelleUrl: String(det.source_url || det.canonical_url || `https://www.bger.ch`),
    abgerufen,
    fassungsToken: String(det.content_hash ?? ''),
    sha: sha256EntscheidBloecke(abschnitte),
  };
}

/** Holt einen Entscheid über OCL keyed-Lookups (Netz) und mappt ihn. */
export async function holeEntscheidOCL(
  decisionId: string,
  abgerufen: string,
  opts: HoleOpts = {},
): Promise<EntscheidSnapshot | null> {
  const det = await jget<OclDecision>(`${API}/decisions/${decisionId}?fields=full`);
  if (!det || !det.decision_id) return null;
  const sprache = (det.language ?? 'de') as EntscheidSprache;
  const wantSprache = opts.sprache === undefined ? 'de' : opts.sprache;
  if (wantSprache && sprache !== wantSprache) return null;
  // paragraph_excerpt_chars: OCL-Maximum ist 5000 (höher → HTTP 422 → kein Strukturtext).
  const str = await jget<OclStructure>(`${API}/structure/${decisionId}?paragraph_excerpt_chars=5000`);
  return mappeEntscheidOCL(det, str, abgerufen, opts);
}

/** Enumeration via Atom-Feed (Frische). Token-Regex auf den Gerichts-Präfix. */
export async function atomFeedIds(court: string, timeoutMs = 60000): Promise<string[]> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(`${API}/atom/${court}.xml`, { signal: ac.signal });
    clearTimeout(t);
    if (!res.ok) return [];
    const xml = await res.text();
    const ids = new Set<string>();
    for (const m of xml.matchAll(new RegExp(`${court}_[A-Za-z0-9_]+`, 'g'))) ids.add(m[0]);
    return [...ids];
  } catch {
    clearTimeout(t);
    return [];
  }
}

/** Enumeration via schnelles compact-Listing (zuverlässiger als Atom, wenn warm). */
export async function listCompactIds(court: string, anzahl = 40, sprache = 'de'): Promise<string[]> {
  const spr = sprache ? `&language=${sprache}` : '';
  const url = `${API}/decisions?court=${court}${spr}&sort=date_desc&limit=${anzahl}&fields=compact`;
  type Liste = { results?: OclDecision[]; decisions?: OclDecision[] };
  const d = await jget<Liste | OclDecision[]>(url, 3, 60000);
  const arr: OclDecision[] = Array.isArray(d) ? d : (d?.results ?? d?.decisions ?? []);
  return arr.map((x) => String(x.decision_id ?? x.id ?? '')).filter(Boolean);
}

/** Kombinierte, resiliente Enumeration: compact-Listing zuerst, Atom als Fallback. */
export async function enumeriereNeueste(court: string, anzahl = 40): Promise<string[]> {
  const a = await listCompactIds(court, anzahl);
  if (a.length) return a;
  return atomFeedIds(court);
}

/**
 * Zitiertes Aktenzeichen → OCL decision_id (Citation-Graph-Enumeration; nutzt nur
 * keyed-Lookups, unabhängig von den launischen Listing-Endpoints). BGE/ATF-Refs
 * (anderes ID-Schema) → null (P0). '5A.33/2004' & '4A_444/2022' → 'bger_4A_444_2022'.
 */
export function citedRefZuId(ref: string): string | null {
  const r = String(ref).trim();
  if (/^(BGE|ATF|DTF)\b/i.test(r)) return null;
  const m = /^(\d[A-Z])[._](\d+)\/(\d{4})$/.exec(r);
  if (!m) return null;
  return `bger_${m[1]}_${m[2]}_${m[3]}`;
}
