// ─── Adapter: OpenCaseLaw → EntscheidSnapshot (browserlos, §7) ───────────────
//
// EIN Adapter für Bund (und später Kanton — gleiches Format pro Gericht). Nur
// keyed-Lookups (decisions/{id} + structure/{id}) — die schnellen, verlässlichen
// Endpoints (Listing/leading-cases sind unzuverlässig, Fahrplan R1/R9). Kein
// Headless-Browser, kein OCR. Recht: Urteilstext gemeinfrei (Art. 5 URG).

import type {
  EntscheidSnapshot, EntscheidAbschnitt, EntscheidBlock, EntscheidSprache, EntscheidRubrum,
} from '../../src/lib/rechtsprechung/typen';
import type { Rechtsgebiet } from '../../src/lib/normtext/register-typen';
import type { OclParagraph } from './adapter-typen';
import { normalisiereRegeste, bereinigeFliesstext } from '../../src/lib/rechtsprechung/register';
import { rubrumFeldPlausibel } from '../../src/lib/rechtsprechung/rubrum';
import { teileSachverhalt } from '../../src/lib/rechtsprechung/sachverhalt';
import { sha256EntscheidBloecke } from './sha-entscheide';
import { normalisiereErwaegung } from './erwaegung-normalisieren';
// markenPlausibel/MONAT leben jetzt in erwaegung-normalisieren.ts (Single Source, §5);
// hier re-exportiert, damit bestehende Importeure/Tests stabil bleiben.
export { markenPlausibel, MONAT } from './erwaegung-normalisieren';
import {
  statutesZuNormKeys, legalAreaZuSachgebiet, abteilungZuSachgebiet, gerichtstypFuerCourt,
  gerichtAnzeigename, kantonalSachgebiet, fmtDatumDe,
  istMehrdeutigeOerAbteilung, normSignalSachgebiet,
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
// H-8/B22: OclParagraph liegt jetzt in adapter-typen.ts (löst den Typ-Zyklus
// mit erwaegung-normalisieren.ts); hier re-exportiert (`export type`), damit
// bestehende `from './adapter-entscheide'`-Importeure (u. a. Tests) stabil
// bleiben.
export type { OclParagraph } from './adapter-typen';
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

/**
 * OCL-/structure-Excerpts sind bei >5000 Z. hart gekappt (Ellipsis-Marker …, HTTP 422
 * bei höherem Limit). Volle Erwägungstexte je Knoten nachladen, wo das Excerpt am Limit
 * kratzt ODER bereits gekappt erscheint. Mutiert `str` in place. Gilt für Urteils-Body
 * (holeEntscheidOCL) UND BGE-Sammlungs-Auszug (holeBgeLeitentscheid) — sonst bricht der
 * Text still mitten im Wort ab (W2·6-BGE).
 */
async function fuelleGekappteErwaegungen(id: string, str: OclStructure | null): Promise<void> {
  if (!str?.erwaegungen_paragraphs?.length) return;
  const heikel = str.erwaegungen_paragraphs.filter(
    (p) => p.e_number && ((p.text_chars ?? 0) >= 4900 || /(?<!\()…\s*$/u.test(String(p.text ?? ''))),
  );
  for (const p of heikel) {
    const voll = await holeErwaegung(id, p.e_number!);
    if (voll?.text) p.text = voll.text;
  }
}

/**
 * Vollen Sachverhalt aus full_text zwischen „Sachverhalt:" und „Erwägungen:" schneiden
 * (OCL kappt sachverhalt_excerpt hart bei ~1000 Z.). vollstaendig=false ⇒ nur Excerpt.
 */
export function extrahiereSachverhalt(
  fullText: string | undefined, excerpt: string | undefined, erwartetChars?: number,
): { text: string; vollstaendig: boolean } | null {
  const ft = String(fullText ?? '');
  // A2: Start-Marker mehrsprachig (DE: Sachverhalt · FR: Faits/En fait · IT:
  // Fatti/In fatto) — sonst fiel jeder fr/it-Body auf den gekürzten OCL-Auszug
  // (vollstaendig:false, kein Kopf). End-Marker zusätzlich «Considérant en
  // droit/fait …» (fr) und «In diritto/Considerando» (it); DE-Alternativen
  // stehen zuerst → DE-Extraktion byte-stabil (§6, kein DE-Regen).
  const mS = /(?:^|\n)\s*(?:Sachverhalt|Faits|En fait|Fatti|In fatto)\s*:?\s*\n/i.exec(ft);
  const mE = /(?:^|\n)\s*(?:Erw[aä]gungen?|In Erwägung|Consid[eé]rant(?:\s+en\s+(?:droit|fait)[^\n]*)?|Considerando|In diritto|Diritto)\s*:?\s*\n/i.exec(ft);
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
    let t = s.replace(/\b\d[A-Z]_\d+\/\d{4}\b/g, ' ')                  // eidg. Verfahrensnummern
      // kantonale Dossier-Nummern in Klammern (Abnahme P2b): „(VWBES.2025.355; …)"
      .replace(/\s*\([A-Za-zÄÖÜ]{2,}\.\d{4}\.\d+(?:\s*[;,]\s*[A-Za-zÄÖÜ]{2,}\.\d{4}\.\d+)*\)/g, '')
      .replace(/\s{2,}/g, ' ').replace(/^[\s,;:.–-]+/, '').trim();
    // Wiederholten Block entdoppeln (Abnahme P2a: vereinigte Verfahren); Trenner
    // dazwischen (Komma/Semikolon/Whitespace) zulassen; danach Doppel-Kommas räumen.
    t = t.replace(/(\S.{24,}?)[\s,;]*\1/g, '$1').replace(/(?:,\s*){2,}/g, ', ').replace(/\s{2,}/g, ' ').trim();
    if (opts.salvage) {
      const m = /\b(und beantragt|mit dem Antrag|Eventualiter|Subeventualiter|stellt? den Antrag)\b/i.exec(t);
      if (m && m.index > 15) t = t.slice(0, m.index).trim();
    }
    if (/(geboren am|Mit (?:Urteil|Verfügung|Entscheid|Eingabe) vom|Erw[aä]gung(?:en)?\s*:|In Erwägung|Sachverhalt|Faits\s*:|Fatti\s*:|Consid[eé]rant|Considerando|und beantragt|Eventualiter)/i.test(t)) return null;
    return t.replace(/[\s,;:.–-]+$/, '').trim() || null;
  };
  // A2: Rubrum-Labels mehrsprachig (DE/FR/IT). DE-Alternativen zuerst → DE-
  // Extraktion byte-stabil. FR: Composition/Participants à la procédure/Objet/
  // recours … contre · IT: Composizione/Parti/Oggetto/ricorso … contro.
  const besetzung = sauber(cut(/\b(?:Besetzung|Composition|Composizione)\b[\s:]*/, /\b(?:Verfahrensbeteiligte|Partei(?:en)?|Parties|Participants|Parti|Gegenstand|Objet|Oggetto|Sachverhalt|Faits|Fatti)\b/));
  const parteien = sauber(cut(/\b(?:Verfahrensbeteiligte|Parteien|Parties|Participants(?:\s+à\s+la\s+proc[ée]dure)?|Parti)\b[\s:]*/, /\b(?:Gegenstand|Objet|Oggetto)\b/, 800));
  const gegenstand = sauber(cut(/\b(?:Gegenstand|Objet|Oggetto)\b[\s:]*/, /\b(?:Beschwerde|Berufung|Rekurs|Klage|Gesuch|recours|ricorso|Sachverhalt|Faits|Fatti|In Erwägung|Erwägung|Consid[eé]rant|Considerando)\b/, 300));
  // Floskel abstreifen → Wert beginnt mit dem Gericht (DE: „das Urteil/den
  // Entscheid des …"; FR: „l'arrêt/le jugement du …"; IT: „la sentenza del …").
  const vorinstanzRoh = cut(/\b(?:(?:Beschwerde|Berufung|Rekurs)\s+gegen|recours(?:\s+en\s+mati[èe]re[^\n]{0,30})?\s+contre|ricorso(?:\s+in\s+materia[^\n]{0,30})?\s+contro)\s*/, /\b(?:Sachverhalt|Faits|Fatti|In Erwägung|Erwägung|Consid[eé]rant|Considerando)\b/, 400)
    ?.replace(/^(?:das|der|die|den|dem|des)\s+(?:Urteil|Urteils|Entscheid|Entscheids|Beschluss|Beschlusses|Verfügung)\s+(?:des|der|vom|von)\s+/i, '')
    ?.replace(/^l['’]?(?:arr[êe]t|jugement|d[ée]cision|ordonnance|prononc[ée])\s+(?:du|de\s+la|de\s+l['’]|des|de)\s+/i, '')
    ?.replace(/^(?:la\s+|il\s+)?(?:sentenza|decisione|giudizio|pronuncia)\s+(?:del(?:la)?|dell['’]|di)\s+/i, '') ?? null;
  const vorinstanz = sauber(vorinstanzRoh, { salvage: true });
  // §1/§8-Tor: erkennbar fragmentarische Werte (Erwägungs-/Satzmitten-Reste) verwerfen.
  const rubrum = {
    besetzung: rubrumFeldPlausibel('besetzung', besetzung) ? besetzung : null,
    parteien: rubrumFeldPlausibel('parteien', parteien) ? parteien : null,
    gegenstand: rubrumFeldPlausibel('gegenstand', gegenstand) ? gegenstand : null,
    vorinstanz: rubrumFeldPlausibel('vorinstanz', vorinstanz) ? vorinstanz : null,
  };
  if (!rubrum.besetzung && !rubrum.parteien && !rubrum.gegenstand && !rubrum.vorinstanz) return null;
  return rubrum;
}

// A2: Sprach-Label aus dem BODY bestimmen (nicht aus dem OCL-Record kopieren —
// das war die Quelle des Mislabels: ein fr/it-BGE trägt im 'bge'-Record
// language='de', der FR/IT-Body stammt aber aus dem unterliegenden aza-Urteil).
// Deterministisch (§2): distinkte Funktionswörter je Sprache zählen, klarer
// Sieger (≥5 Treffer und ≥1.25× Zweitplatzierter) gewinnt, sonst null →
// der Aufrufer fällt auf det.language zurück. Empirisch über den ganzen Korpus
// (327 Bodies) verifiziert: 323 de / 4 fr / 0 it, kein DE-Fehlklassifikat.
const SPRACH_SIGNAL: { code: EntscheidSprache; re: RegExp }[] = [
  { code: 'de', re: /\b(?:der|die|das|und|nicht|dass|eine|auch|über|dem|den|des|ist|gegen|durch|bei|vom|wird|werden|sich|Urteil|Beschwerde|zur|zum|nach)\b/giu },
  { code: 'fr', re: /\b(?:recours|contre|cette|selon|dans|pour|qui|que|est|les|une|aux|ainsi|droit|arr[êe]t|fait|elle|leur|ont|avec|sans|sous|été)\b/giu },
  { code: 'it', re: /\b(?:che|della|nella|sono|essere|questo|ricorso|delle|dalla|alla|dei|degli|sentenza|dell|viene|stato|secondo|nonché)\b/giu },
];

/** Sprache eines Entscheids aus seinem gerenderten Body-Text ableiten (§2). */
export function spracheAusBody(abschnitte: EntscheidAbschnitt[]): EntscheidSprache | null {
  const text = abschnitte.flatMap((a) => a.bloecke.map((b) => b.text)).join(' ').slice(0, 6000);
  if (text.replace(/\s/g, '').length < 80) return null; // zu wenig Text → kein Override
  const score = SPRACH_SIGNAL
    .map(({ code, re }) => ({ code, n: (text.match(re) ?? []).length }))
    .sort((a, b) => b.n - a.n);
  const [top, zweit] = score;
  if (top.n < 5 || top.n < (zweit?.n ?? 0) * 1.25) return null;
  return top.code;
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
  // #1 Plausibilität: ein Entscheid kann nicht NACH dem Abrufzeitpunkt datiert sein
  // (der Crawl holt nichts aus der Zukunft). Solche Quelldaten sind unzuverlässig
  // → nicht aufnehmen (ehrlich weglassen statt ein Zukunftsdatum zeigen, §8).
  const datumRoh = String(det.decision_date ?? '');
  if (datumRoh && abgerufen && datumRoh > abgerufen) return null;

  // ── Abschnitte aus der amtlichen Gliederung (oder Fallback full_text) ──
  const abschnitte: EntscheidAbschnitt[] = [];
  if (str) {
    // Sachverhalt: vollen Text aus full_text schneiden (Excerpt ist bei ~1000 Z. gekappt).
    const sv = extrahiereSachverhalt(det.full_text, str.sachverhalt_excerpt, str.sachverhalt_chars);
    // In Buchstaben-Abschnitte teilen (A.a/A.b …) — sicher, sequenzvalidiert; ohne
    // Gliederung kommt EIN bereinigter Block zurück (sachverhalt.ts, §1-Fallback).
    if (sv) abschnitte.push({ typ: 'sachverhalt', vollstaendig: sv.vollstaendig, bloecke: teileSachverhalt(bereinigeFliesstext(sv.text)) });

    // Erwägungen: EINE reine Funktion (gleicher Pfad für Live-Import, Cache-Replay,
    // Bestands-Renormalisierung; §5). Setzt marke/tiefe aus e_number, wenn plausibel
    // (publizierte Sammlungs-Auszüge ab consid. N≥3 inklusive); sonst ehrlich flach.
    const paras: OclParagraph[] = Array.isArray(str.erwaegungen_paragraphs) ? str.erwaegungen_paragraphs : [];
    const rohErw: EntscheidBlock[] = paras
      .map((p): EntscheidBlock => ({ marke: null, text: bereinigeFliesstext(String(p.text ?? p.text_excerpt ?? '')) }))
      .filter((b) => b.text);
    const ervBloecke = normalisiereErwaegung(paras, rohErw);
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

  // A2: Sprache aus dem BODY (Quelle des Mislabel-Fixes), Fallback OCL-Record.
  const sprache: EntscheidSprache = spracheAusBody(abschnitte) ?? ((det.language ?? 'de') as EntscheidSprache);

  // ── Regeste (lizenz-getrennt) ──
  const regesteRoh: string | null = det.regeste ?? str?.regeste ?? null;
  const regeste = regesteRoh && String(regesteRoh).trim()
    ? { text: normalisiereRegeste(String(regesteRoh)), quelle: 'opencaselaw' as const }
    : null;
  // Der Court 'bge' IST die amtliche Sammlung; bei anderen Courts trägt bge_reference
  // die Fundstelle. Maschinelle/kantonale Regesten sind NICHT amtlich (§8). Spike 26.6.:
  // bge-Records tragen KEIN bge_reference (Fundstelle steht in docket_number) → court prüfen.
  const istBge = String(det.court ?? '') === 'bge';
  const regesteAmtlich = istBge || !!det.bge_reference;

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
  // BGE: OCL ist inkonsistent — ältere docket tragen «BGE »-Präfix, neuere nicht
  // (Spike 26.6.). Für die Fundstelle einheitlich strippen → bgeReferenz «150 I 17».
  const docket = String(det.docket_number ?? det.decision_id)
    .replace(/^(\d[A-Z])\s+(?=\d)/, '$1_')
    .replace(/^(?:BGE|ATF|DTF)\s+/i, '');
  const sachgebiet: Rechtsgebiet =
    opts.sachgebietHint
    // C2-1: Für die mehrdeutige II. öffentlich-rechtliche Abteilung (2A/2C/2D,
    // Steuern UND Migration) zuerst das eindeutige Norm-Signal (AIG→öffentlich,
    // DBG/StHG→sozial-abgaben), dann die OCL legal_area — sonst landeten alle
    // 2C-Migrationsfälle pauschal unter «sozial-abgaben».
    ?? (istMehrdeutigeOerAbteilung(docket)
        ? (normSignalSachgebiet(normKeys) ?? legalAreaZuSachgebiet(det.legal_area))
        : null)
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

  // Leitentscheid ⟺ amtliche Sammlung (BGE): Court 'bge' ODER BGE-Fundstelle.
  // KEIN '!!regeste'-Glied mehr — eine maschinelle/kantonale Regeste begründet keinen
  // amtlichen Leitstatus (§8; Befund 26.6.: 96 % der Alt-Etiketten waren so falsch).
  // Invariante (gate-geprüft): leitcharakter==='leitentscheid' ⟺ bgeReferenz≠null.
  const leit = istBge || !!det.bge_reference;
  // BGE-Slug mit Unterstrichen («150_I_17») für lesbare Keys/URLs; bger unverändert
  // (Leerzeichen entfernt, §6 byte-stabil für den bestehenden bger-Korpus).
  const docketSafe = (istBge ? docket.replace(/\s+/g, '_') : docket.replace(/\s+/g, '')).replace(/[^A-Za-z0-9_]/g, '_');
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
    bgeReferenz: istBge ? docket : (det.bge_reference ? String(det.bge_reference) : null),
    zitierung,
    datum: String(det.decision_date ?? ''),
    sprache,
    leitcharakter: leit ? 'leitentscheid' : 'routine',
    sachgebiet,
    // Provenienz-treu (§7): das rohe OCL legal_area persistieren, damit die
    // Sachgebiet-Klassierung der mehrdeutigen II. öff.-rechtl. Abteilung (2A/2C/
    // 2D) offline aus dem Snapshot reproduzierbar ist (kein Live-Fetch im Re-Map).
    legalArea: det.legal_area ?? null,
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
  await fuelleGekappteErwaegungen(decisionId, str);
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
 * Wie enumeriereNeueste, aber OHNE Sprachfilter (alle Sprachen, neueste zuerst).
 * Für die eidg. Gerichte BVGer/BStGer/BPatGer, die stark FR/IT publizieren — der
 * de-Default von enumeriereNeueste hätte sonst die wahren «neuesten» Urteile (oft
 * IT/FR) verworfen und nur die neuesten DEUTSCHEN geliefert (Batch-3-Befund).
 */
export async function enumeriereNeuesteAlle(court: string, anzahl = 40): Promise<string[]> {
  const a = await listCompactIds(court, anzahl, '');
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

// ─── Amtliche Leitentscheide (BGE, Court 'bge') ──────────────────────────────
//
// Schritt 1b + Schritt 2 (A2-Merge) in EINER angereicherten Funktion: BGE-Identität
// + amtliche Regeste + (wenn eindeutig auflösbar) das vollständige unterliegende
// bger-Urteil (echtes Datum, voller Body, präzises Sachgebiet). Spike 26.6.2026 belegt:
// 'bge'-Records tragen die Fundstelle in docket_number, das aza-Az. im Urteilskopf.

/** Enumeriert amtliche BGE (compact-Listing), deutsch, neueste zuerst, ab dateFrom. */
export async function enumeriereBge(dateFrom: string, anzahl = 300): Promise<string[]> {
  const url = `${API}/decisions?court=bge&language=de&date_from=${dateFrom}&sort=date_desc&limit=${anzahl}&fields=compact`;
  type Liste = { results?: OclDecision[]; decisions?: OclDecision[] };
  const d = await jget<Liste | OclDecision[]>(url, 3, 60000);
  const arr: OclDecision[] = Array.isArray(d) ? d : (d?.results ?? d?.decisions ?? []);
  return arr.map((x) => String(x.decision_id ?? x.id ?? '')).filter(Boolean);
}

/**
 * aza-Aktenzeichen des EIGENEN Falls aus dem BGE-Urteilskopf (R8-sicher, §8).
 * Im Kopf steht das Az. unmittelbar vor «vom <Datum>» (Eigenfall-Signatur), NICHT
 * als zitiertes Präjudiz (die stehen erst in den Erwägungen). Quarantäne: nur im
 * Kopf-Bereich (vor «Regeste») gesucht. null ⇒ kein eindeutiges Az. → Auszug-Fallback.
 */
export function azaAusBgeKopf(fullText: string | undefined): string | null {
  if (!fullText) return null;
  // Suchfenster: bis zum Beginn der Erwägungen (dort leben zitierte Präjudizien),
  // höchstens die ersten 8000 Zeichen. Das eigene aza-Az. steht im Urteilskopf/
  // Sachverhalt DAVOR — als erstes «<aza> (und andere)? vom <Datum>» (Eigenfall-
  // Signatur). Deckt beide OCL-Kopfformate ab (2026: Az. vor Regeste; 2024: nach Regeste).
  const erw = fullText.search(/\b(?:Erwägung|Erwägungen|Considérant|Considerando|Diritto|Ragioni)\b/);
  const fenster = fullText.slice(0, erw > 400 ? Math.min(erw, 8000) : 8000);
  // Monat als \S+ (nicht \w+): \w matcht ohne Unicode-Flag das «ä» in «März» NICHT —
  // sonst fiele jeder im März entschiedene Eigenfall durch und die Regex griffe das
  // nächste (zitierte) Az. (Bug-Check 26.6.2026, kritisch). \S+ deckt jeden Monatsnamen.
  // Mehrsprachig (fr/it-BGE tragen «… du/del <Datum>» statt «vom») + verbundene
  // Verfahren «A / B [/ C] vom …»: die /-Kette wird mitgelesen, GRUPPE 1 bleibt das
  // ERSTE Az. (das verbundene Leiturteil; das zweite ist als Einzelurteil oft nicht
  // abrufbar). Tag-Punkt optional (fr/it «du 14 août», kein Punkt). Anker bleibt die
  // Eigenfall-Datums-Signatur im Kopf-Fenster (R8/§8) — kein zitiertes Präjudiz.
  const m = /(\d[A-Z][_ ]\d+\/\d{4})(?:\s*\/\s*\d[A-Z][_ ]\d+\/\d{4})*(?:\s+(?:und\s+andere|et\s+autres?|e\s+altri|und\s+[^\n]{0,40}))?\s+(?:vom|du|del|dell['’])\s+\d{1,2}\.?\s*\S+\s+\d{4}/.exec(fenster);
  if (m) return m[1].replace(/\s+/, '_');
  // Fallback (W2·6-B B1, additiv — greift NUR wenn die «… vom <Datum>»-Signatur
  // fehlt, ändert daher die bereits aufgelösten BGE nicht): ein zweites OCL-
  // Kopfformat listet das eigene aza-Az. in KLAMMERN direkt hinter der eigenen
  // BGE-Fundstelle: «Bundesgericht (BGE) Band I 05.06.2024 BGE 150 I 183
  // (2C_512/2023)». Das ist strukturell das Eigenfall-Az. (nicht ein zitiertes
  // Präjudiz — diese stehen erst in den Erwägungen). Anker: unmittelbar nach
  // «BGE <Band> <röm> <Nr>» im Kopffenster. Nur die ERSTE solche Klammer.
  const k = /\bBGE\s+\d+\s+[IVXLC]+[a-z]?\s+\d+\s*\(\s*(\d[A-Z][_ ]\d+\/\d{4})\s*\)/.exec(fenster);
  return k ? k[1].replace(/\s+/, '_') : null;
}

/** BGE-Band (römisch) → Sachgebiet: I/II öffentl., III Zivil→privat, IV straf, V Sozialvers. */
export function bgeRoemischSachgebiet(docket: string): Rechtsgebiet | null {
  const m = /\b(IV|III|II|I|V)\b/.exec(String(docket));
  switch (m?.[1]) {
    case 'I': case 'II': return 'oeffentlich';
    case 'III': return 'privat';
    case 'IV': return 'straf';
    case 'V': return 'sozial-abgaben';
    default: return null;
  }
}

/**
 * Holt einen amtlichen Leitentscheid (BGE) und reichert ihn mit dem vollständigen
 * unterliegenden bger-Urteil an (A2-Merge). Ohne eindeutig/plausibel auflösbares
 * aza-Az.: ehrlicher Sammlungs-Auszug (azaUrteil=null), nie ein vermuteter Body (§8).
 */
export async function holeBgeLeitentscheid(bgeId: string, abgerufen: string): Promise<EntscheidSnapshot | null> {
  // OCL liefert decision_id inkonsistent (`bge_BGE_150_III_223`, `bge_152 III 51`) UND die
  // Keyed-Lookup matcht kurze Seiten-Ids PRÄFIXUNSCHARF: `/decisions/151_V_1` → 151_V_194.
  // Die präfix-volle bzw. mit-Spaces-Form löst eindeutig auf. Darum mehrere Id-Formen probieren
  // und nur die EXAKT passende Entscheidung nehmen (idNorm-Kern: `bge`-Token + Separatoren
  // strippen) — so bleibt eine Fehlzuordnung (151_V_1 → 151_V_194) ausgeschlossen (§8).
  const idNorm = (s: string) => s.toLowerCase().replace(/bge/g, '').replace(/[_\s.-]/g, '');
  let det: OclDecision | null = null;
  for (const kand of [bgeId, bgeId.replace(/_/g, ' '), `bge_BGE_${bgeId}`]) {
    const d = await jget<OclDecision>(`${API}/decisions/${encodeURIComponent(kand)}?fields=full`);
    if (d?.decision_id && d.court === 'bge' && (d.language ?? 'de') === 'de'
        && idNorm(String(d.decision_id)) === idNorm(bgeId)) { det = d; break; }
  }
  if (!det) return null;
  // Strukturtext + Erwägungs-Nachladen über die KANONISCHE decision_id (kurze Form wäre wieder
  // präfixunscharf). W2·6-BGE: gekappte Sammlungs-Auszug-Erwägungen voll nachladen.
  const kanonId = String(det.decision_id);
  const str = await jget<OclStructure>(`${API}/structure/${encodeURIComponent(kanonId)}?paragraph_excerpt_chars=5000`);
  await fuelleGekappteErwaegungen(kanonId, str);

  const azaAz = azaAusBgeKopf(det.full_text);
  const azaKey = azaAz ? citedRefZuId(azaAz) : null;
  // Referenzjahr für die aza-Plausibilität = der BGE-BAND (ein Band je Jahrgang
  // seit 1875 ⇒ Jahr = Band + 1874), NICHT das OCL-`decision_date`: dieses ist bei
  // etlichen BGE ein Platzhalter/Fehlwert (z.B. «1999»/«2006» für Band 151/2025 —
  // W2·6-B B1-Befund) und liess plausible Volltexte fälschlich durchfallen. Der Band
  // ist die kanonische, deterministische Jahresquelle (§2). Fallback: decision_date.
  const band = parseInt(String(det.docket_number ?? det.bge_reference ?? '').trim(), 10);
  const bandJahr = (Number.isFinite(band) && band > 0 ? band + 1874 : null)
    ?? (Number(String(det.decision_date ?? '').slice(0, 4)) || null);

  // aza-Volltext nur bei plausibler Confidence übernehmen (Jahr-Fenster, §8/R8).
  let azaSnap: EntscheidSnapshot | null = null;
  if (azaKey) {
    // sprache:null — das unterliegende bger-Urteil eines fr/it-BGE ist im Original
    // (fr/it) abgelegt; der 'de'-Filter verwarf es bisher und der Leitentscheid blieb
    // Auszug-only. Der amtliche Sammlungstext (auszugAbschnitte) bleibt deutsch.
    const cand = await holeEntscheidOCL(azaKey, abgerufen, { sprache: null });
    if (cand) {
      const azaJahr = Number(String(cand.datum).slice(0, 4)) || null;
      // Fenster [Band-Jahr − 5 … Band-Jahr]: das unterliegende Urteil datiert nie
      // NACH dem Bandjahr und praktisch nie mehr als ~5 Jahre davor (Publikations-
      // verzug). Grenze auf −5 gelockert (war −3), da das Referenzjahr jetzt das
      // korrekte Bandjahr ist statt des z.T. fehlerhaften decision_date (B1).
      const plausibel = !bandJahr || !azaJahr || (azaJahr <= bandJahr && azaJahr >= bandJahr - 5);
      if (plausibel) azaSnap = cand;
    }
  }

  const roemHint = bgeRoemischSachgebiet(String(det.docket_number ?? ''));
  const basis = mappeEntscheidOCL(det, str, abgerufen, { sachgebietHint: azaSnap?.sachgebiet ?? roemHint ?? undefined });
  if (!basis) return null;
  basis.gerichtName = 'Bundesgericht';

  // Inversions-Schutz (§8): das volle Urteil muss mindestens annähernd so umfangreich
  // sein wie der publizierte Sammlungs-Auszug (der Auszug ist eine Teilmenge). Ist der
  // aza-Body deutlich KÜRZER, wurde eine prozessuale Nebenentscheidung erwischt → kein
  // Volltext (auszug-only), nie ein falscher Body unter dem Leitentscheid.
  const bodyLen = (a: EntscheidAbschnitt[]) => a.reduce((n, ab) => n + ab.bloecke.reduce((m, b) => m + b.text.length, 0), 0);
  if (azaSnap && bodyLen(azaSnap.abschnitte) < bodyLen(basis.abschnitte) * 0.85) azaSnap = null;

  if (azaSnap) {
    // A2-Merge mit Umschalter: `abschnitte` = VOLLES unterliegendes Urteil (Default),
    // `auszugAbschnitte` = amtlicher BGE-Sammlungstext (der publizierte «Auszug»).
    // Die UI bietet beide als Tabs. basis.abschnitte ist der Sammlungstext aus dem
    // BGE-Record (vor dem Merge), azaSnap.abschnitte das volle Urteil.
    return {
      ...basis,
      datum: azaSnap.datum,
      // A2: `abschnitte` ist jetzt das (oft fr/it) aza-Urteil → Sprache folgt dem
      // BODY, nicht dem 'bge'-Record (der trägt language='de'). Behebt den
      // Mislabel der fr-Leitentscheide (152_I_105 u.a.); der dt. Sammlungs-Auszug
      // bleibt in `auszugAbschnitte`.
      sprache: spracheAusBody(azaSnap.abschnitte) ?? azaSnap.sprache,
      abschnitte: azaSnap.abschnitte,
      auszugAbschnitte: basis.abschnitte,
      rubrum: azaSnap.rubrum ?? basis.rubrum,
      dispositivOrders: azaSnap.dispositivOrders,
      zitierteEntscheide: azaSnap.zitierteEntscheide.length ? azaSnap.zitierteEntscheide : basis.zitierteEntscheide,
      normKeys: [...new Set([...basis.normKeys, ...azaSnap.normKeys])],
      // quelleUrl = bger.ch-Live-URL des unterliegenden Urteils = massgebliche Fassung
      // der Voll-Ansicht (Detail) und Quelle-Link der getrennten Übersichts-Karte (§5/§8).
      azaUrteil: { aktenzeichen: azaAz!, key: azaKey!, quelleUrl: azaSnap.quelleUrl },
      sha: azaSnap.sha,
    };
  }
  return { ...basis, azaUrteil: null };
}
