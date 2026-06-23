// ─── Adapter: OpenCaseLaw → EntscheidSnapshot (browserlos, §7) ───────────────
//
// EIN Adapter für Bund (und später Kanton — gleiches Format pro Gericht). Nur
// keyed-Lookups (decisions/{id} + structure/{id}) — die schnellen, verlässlichen
// Endpoints (Listing/leading-cases sind unzuverlässig, Fahrplan R1/R9). Kein
// Headless-Browser, kein OCR. Recht: Urteilstext gemeinfrei (Art. 5 URG).

import type {
  EntscheidSnapshot, EntscheidAbschnitt, EntscheidBlock, EntscheidSprache, EntscheidRubrum,
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
export interface OclParagraph {
  e_number?: string; depth?: number; parent?: string;
  text?: string; text_excerpt?: string; text_chars?: number;
}
export interface OclStructure {
  sachverhalt_excerpt?: string; sachverhalt_chars?: number;
  erwaegungen_paragraphs?: OclParagraph[]; erwaegungen_paragraph_count?: number;
  dispositiv?: string; dispositiv_orders?: string[]; regeste?: string | null;
  [k: string]: unknown;
}
/** Antwort von /erwaegung/{id}/{e_number} — voller verbatim Erwägungstext. */
export interface OclErwaegung { e_number?: string; text?: string; text_chars?: number }

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

/** Voller verbatim Erwägungstext je Knoten (Excerpt in /structure ist bei >5000 Z. gekappt). */
export async function holeErwaegung(id: string, e: string): Promise<OclErwaegung | null> {
  return jget<OclErwaegung>(`${API}/erwaegung/${id}/${encodeURIComponent(e)}`);
}

const MONAT = /^(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\b/;

/**
 * Vollen Sachverhalt aus full_text zwischen „Sachverhalt:" und „Erwägungen:" schneiden
 * (OCL kappt sachverhalt_excerpt hart bei ~1000 Z.). vollstaendig=false ⇒ nur Excerpt.
 */
export function extrahiereSachverhalt(
  fullText: string | undefined, excerpt: string | undefined, erwartetChars?: number,
): { text: string; vollstaendig: boolean } | null {
  const ft = String(fullText ?? '');
  const mS = /(?:^|\n)\s*Sachverhalt\s*:?\s*\n/i.exec(ft);
  const mE = /(?:^|\n)\s*(?:Erw[aä]gungen?|In Erwägung|Considérant|Diritto)\s*:?\s*\n/i.exec(ft);
  if (mS && mE && mE.index > mS.index) {
    const txt = ft.slice(mS.index + mS[0].length, mE.index).trim();
    if (txt.length >= 200) {
      const voll = erwartetChars ? txt.length >= erwartetChars * 0.9 : txt.length > 1100;
      return { text: txt, vollstaendig: voll };
    }
  }
  const ex = String(excerpt ?? '').trim();
  if (ex) return { text: ex.replace(/…\s*$/, '').trim(), vollstaendig: false };
  return null;
}

/**
 * Rubrum (Besetzung/Parteien/Gegenstand/Vorinstanz, Art. 112 BGG) aus full_text
 * extrahieren — best-effort, alle Felder optional. Nur die bereits anonymisierte
 * OCL-Fassung verwenden (keine Demaskierung).
 */
export function extrahiereRubrum(fullText: string | undefined): EntscheidRubrum | null {
  const ft = String(fullText ?? '');
  if (!ft) return null;
  const cut = (von: RegExp, bis: RegExp, max = 600): string | null => {
    const a = von.exec(ft);
    if (!a) return null;
    const rest = ft.slice(a.index + a[0].length);
    const b = bis.exec(rest);
    const roh = (b ? rest.slice(0, b.index) : rest.slice(0, max)).trim();
    const t = bereinigeFliesstext(roh.slice(0, max)).replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    return t || null;
  };
  // Defensiv (Abnahme P1/P2): eingestreute Verfahrensnummern strippen; bei Antrags-
  // Markern (Vorinstanz) abschneiden; bei SV-/Erwägungs-Text das Feld VERWERFEN
  // (lieber leer als falsch — ein falsches Rubrum ist ein Vertrauenskiller).
  const sauber = (s: string | null, opts: { salvage?: boolean } = {}): string | null => {
    if (!s) return null;
    let t = s.replace(/\b\d[A-Z]_\d+\/\d{4}\b/g, ' ').replace(/\s{2,}/g, ' ').replace(/^[\s,;:.–-]+/, '').trim();
    if (opts.salvage) {
      const m = /\b(und beantragt|mit dem Antrag|Eventualiter|Subeventualiter|stellt? den Antrag)\b/i.exec(t);
      if (m && m.index > 15) t = t.slice(0, m.index).trim();
    }
    if (/(geboren am|Mit (?:Urteil|Verfügung|Entscheid|Eingabe) vom|Erw[aä]gung(?:en)?\s*:|In Erwägung|Sachverhalt|und beantragt|Eventualiter)/i.test(t)) return null;
    return t.replace(/[\s,;:.–-]+$/, '').trim() || null;
  };
  const besetzung = sauber(cut(/\bBesetzung\b[\s:]*/, /\b(Verfahrensbeteiligte|Partei|Gegenstand|Sachverhalt)\b/));
  const parteien = sauber(cut(/\b(?:Verfahrensbeteiligte|Parteien)\b[\s:]*/, /\bGegenstand\b/, 800));
  const gegenstand = sauber(cut(/\bGegenstand\b[\s:]*/, /\b(Beschwerde|Berufung|Rekurs|Klage|Gesuch|Sachverhalt|In Erwägung|Erwägung)\b/, 300));
  const vorinstanz = sauber(cut(/\b(?:Beschwerde|Berufung|Rekurs)\s+gegen\s*/, /\b(Sachverhalt|In Erwägung|Erwägung)\b/, 400), { salvage: true });
  if (!besetzung && !parteien && !gegenstand && !vorinstanz) return null;
  return { besetzung, parteien, gegenstand, vorinstanz };
}

/**
 * Plausibilität der Erwägungs-Nummerierung: Start bei 1/2, keine Top-Sprünge ≥3,
 * kein Block-Start mit Monat (Jahreszahl als Marke fehlgeparst). Sonst Marken verwerfen.
 */
export function markenPlausibel(paras: OclParagraph[]): boolean {
  const tops = paras.map((p) => Number((p.e_number ?? '').split('.')[0])).filter(Number.isFinite);
  if (!tops.length) return false;
  if (tops[0] > 2) return false;
  for (let i = 1; i < tops.length; i++) if (tops[i] - tops[i - 1] >= 3) return false;
  if (paras.some((p) => MONAT.test(String(p.text ?? p.text_excerpt ?? '').trim()))) return false;
  return true;
}

/**
 * Inline-Dispositiv „1. … 2. … 3. …" (einzeiliger Blob) splitten — NICHT an Datums-„2. Mai":
 * Nummer am Anfang oder nach Satzende, kein Monat/Jahr danach, Nummern aufsteigend 1,2,3…
 */
export function teileDispositivInline(roh: string): EntscheidBlock[] | null {
  const s = String(roh).replace(/\s+/g, ' ').trim();
  const re = /(?:^|(?<=[.!?]) )(\d{1,2})\.\s+(?!\d{4}\b)(?!(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\b)/g;
  const idx: { n: string; at: number; end: number }[] = [];
  for (let m; (m = re.exec(s));) idx.push({ n: m[1], at: m.index, end: re.lastIndex });
  if (idx.length < 2 || !idx.every((x, i) => Number(x.n) === i + 1)) return null;
  const bloecke: EntscheidBlock[] = [];
  for (let i = 0; i < idx.length; i++) {
    const txt = s.slice(idx[i].end, i + 1 < idx.length ? idx[i + 1].at : s.length).trim();
    if (i === idx.length - 1) {
      const ms = /\b(Lausanne|Lugano|Luzern|Im Namen)\b/.exec(txt);
      if (ms && ms.index > 20) {
        bloecke.push({ marke: `${idx[i].n}.`, text: bereinigeFliesstext(txt.slice(0, ms.index).trim()) });
        bloecke.push({ marke: null, text: bereinigeFliesstext(txt.slice(ms.index).trim()) });
        continue;
      }
    }
    bloecke.push({ marke: `${idx[i].n}.`, text: bereinigeFliesstext(txt) });
  }
  return bloecke.filter((b) => b.text);
}

/**
 * Dispositiv in nummerierte Anordnungen aufteilen — anhand der STANDALONE-Nummern-
 * Absätze des Rohtexts ("1.\n\nText\n\n2.\n\n…"), nicht inline (sonst Datums-Fehlsplit
 * an „2. Dezember", §1). Unter-Punkte („2.1. …") bleiben bei ihrer Anordnung; die
 * Schlussformel (Lausanne/Im Namen/Präsident/Gerichtsschreiber) wird als markenloser
 * Tail abgetrennt. Gibt null zurück, wenn keine ≥2 sicheren Nummern erkennbar sind.
 */
export function teileDispositiv(roh: string): EntscheidBlock[] | null {
  const s = String(roh);
  // Korruptions-Heuristik: echtes Dispositiv ist kompakt. >4000 Z. ODER „1. 1.1 …"
  // (Erwägungstext) ODER Rechtsbegehren-Schwall ⇒ unzuverlässig → null.
  if (s.length > 4000) return null;
  if (/^\s*\d+\.\s*\d+\.\d/.test(s)) return null;
  const paras = s.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const istNummer = (p: string) => /^\d{1,2}\.$/.test(p);
  const istSchluss = (p: string) => /^(Lausanne|Lugano|Luzern|Im Namen|Der Präsident|Die Präsident|Der Gerichtsschreiber|Die Gerichtsschreiber|Versand)\b/.test(p);
  const items: { marke: string | null; teile: string[] }[] = [];
  let cur: { marke: string | null; teile: string[] } | null = null;
  const schluss: string[] = [];
  let inSchluss = false;
  for (const p of paras) {
    if (!inSchluss && istSchluss(p)) inSchluss = true;
    if (inSchluss) { schluss.push(p); continue; }
    if (istNummer(p)) { cur = { marke: p, teile: [] }; items.push(cur); }
    else if (cur) cur.teile.push(p);
    else { cur = { marke: null, teile: [p] }; items.push(cur); }
  }
  const nummeriert = items.filter((i) => i.marke);
  if (nummeriert.length < 2) return teileDispositivInline(s); // 49/59 sind einzeiliger Inline-Blob
  const bloecke: EntscheidBlock[] = items
    .map((i) => ({ marke: i.marke, text: bereinigeFliesstext(i.teile.join('\n\n')) }))
    .filter((b) => b.text);
  if (schluss.length) bloecke.push({ marke: null, text: bereinigeFliesstext(schluss.join('\n\n')) });
  return bloecke;
}

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
    // Sachverhalt: vollen Text aus full_text schneiden (Excerpt ist bei ~1000 Z. gekappt).
    const sv = extrahiereSachverhalt(det.full_text, str.sachverhalt_excerpt, str.sachverhalt_chars);
    if (sv) abschnitte.push({ typ: 'sachverhalt', vollstaendig: sv.vollstaendig, bloecke: [{ marke: null, text: bereinigeFliesstext(sv.text) }] });

    const paras: OclParagraph[] = Array.isArray(str.erwaegungen_paragraphs) ? str.erwaegungen_paragraphs : [];
    const plaus = markenPlausibel(paras);   // Jahreszahl-/Fehlmarken verwerfen → ehrlicher Fliesstext
    const ervBloecke: EntscheidBlock[] = paras
      .map((p) => ({
        marke: plaus && p.e_number ? `E. ${p.e_number}` : null,
        tiefe: plaus && typeof p.depth === 'number' ? p.depth : undefined,
        text: bereinigeFliesstext(String(p.text ?? p.text_excerpt ?? '')),
      }))
      .filter((b) => b.text);
    if (ervBloecke.length) abschnitte.push({ typ: 'erwaegung', bloecke: ervBloecke });

    // Dispositiv: nummeriert (standalone ODER inline); korruptes/überlanges Roh-Dispositiv weglassen.
    if (typeof str.dispositiv === 'string' && str.dispositiv.trim()) {
      const disp = teileDispositiv(str.dispositiv);
      if (disp?.length) abschnitte.push({ typ: 'dispositiv', bloecke: disp });
      else if (str.dispositiv.length <= 4000) abschnitte.push({ typ: 'dispositiv', bloecke: [{ marke: null, text: bereinigeFliesstext(str.dispositiv) }] });
      // >4000 & nicht splitbar ⇒ kein Dispositiv-Abschnitt (UI weist es als nicht abgegrenzt aus).
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
  // Amtliche Regeste gibt es definitionsgemäss nur beim publizierten BGE; sonst maschinell.
  const regesteAmtlich = !!det.bge_reference;

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
  // Aktenzeichen-Normalisierung (Abnahme P3): „5A 229/2017" → „5A_229/2017".
  const docket = String(det.docket_number ?? det.decision_id).replace(/^(\d[A-Z])\s+(?=\d)/, '$1_');
  const sachgebiet: Rechtsgebiet =
    opts.sachgebietHint
    ?? abteilungZuSachgebiet(docket)        // BGer-Abteilung (z.B. 5A→privat) ist präziser …
    ?? kantonalSachgebiet(docket)           // … kantonale Aktenzeichen-Präfixe …
    ?? legalAreaZuSachgebiet(det.legal_area) // … als die grobe OCL legal_area (erst Fallback).
    ?? 'oeffentlich';
  const gerichtName = gerichtAnzeigename(court, canton, det.court_name as string | undefined);
  // Rubrum nur fürs Bundesgericht (full_text-Struktur zuverlässig); kantonal null —
  // lieber leer als falsch (Abnahme P1: kantonale Extraktion liefert sonst Erwägungstext).
  const rubrum = canton === 'CH' ? extrahiereRubrum(det.full_text) : null;
  // Zitierung inkl. Aktenzeichen-Norm „5A 229/2017" → „5A_229/2017" (Abnahme P3: Kopf/Tab/Zitat).
  const datumDe = fmtDatumDe(String(det.decision_date ?? ''));
  const zitierung = (canton === 'CH'
    ? String(det.citation_string_de ?? `BGer ${docket} vom ${datumDe}`)
    : `${gerichtName} ${docket} vom ${datumDe}`).replace(/\b(\d[A-Z])\s+(\d+\/\d{4})/g, '$1_$2');

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
    zitierung,
    datum: String(det.decision_date ?? ''),
    sprache,
    leitcharakter: leit ? 'leitentscheid' : 'routine',
    sachgebiet,
    rubrum,
    regeste,
    regesteAmtlich,
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
  // Volle Erwägungstexte nachladen, wo das Excerpt am 5000-Limit kratzt (selten, 0–1/Entscheid).
  if (str?.erwaegungen_paragraphs?.length) {
    const heikel = str.erwaegungen_paragraphs.filter((p) => (p.text_chars ?? 0) >= 4900 && p.e_number);
    for (const p of heikel) {
      const voll = await holeErwaegung(decisionId, p.e_number!);
      if (voll?.text) p.text = voll.text;
    }
  }
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
