// ─── clir-Regeste-Adapter: bger.ch clir → strukturierte, dreisprachige Regeste ──
//
// Zweck (W2·6-B B2 + A18): die amtlich publizierte BGE-Regeste TREU als Struktur
// nachextrahieren — Regestenkopf (massgebliche Artikel + Regestentitel, in der
// amtlichen Sammlung FETT) + Textabsätze, je Sprachfassung (DE/FR/IT), sortiert.
//
// QUELL-WAHL (§7, empirisch 5.7.2026): Die OpenCaseLaw-Rohregeste (`det.regeste`)
// ist EIN flacher, EINsprachiger (Entscheidsprache) String ohne Absatz-/Kopf-
// Struktur — sie trägt A18 (dreisprachig) und B2 (Absätze/fette Artikel) NICHT.
// Die EINZIGE amtliche Quelle mit dieser Struktur ist bger.ch/search.bger.ch clir:
// pro BGE existieren getrennte Sprach-Dokumente `atf://<band>:de|fr|it`, jedes mit
//   <div id="regeste" lang="de|fr|it">
//     <div class="big bold">Regeste</div>
//     <div class="paraatf">KOPF …  <div class="paratf">ABSATZ</div> …</div>
//   </div>
// `paraatf` = Regestenkopf (Artikel + Regestentitel = der fette Teil der amtl.
// Sammlung), `paratf` = die Textabsätze der Regeste. Die Sprachfassung ist über
// das `lang`-Attribut STRUKTURELL bestimmt — keine Wortraten-Heuristik (A18/§2).
// Fehlt eine Sprachfassung in der Quelle, wird sie WEGGELASSEN, nie geraten (§1).
//
// Charset der clir-Seiten ist iso-8859-1 (latin-1) — der Fetcher dekodiert
// entsprechend (sonst zerfallen ä/é/à zu Ersatzzeichen; Fidelity-Falle).
// Recht: Urteils-/Regestetext gemeinfrei (Art. 5 URG). Netz höflich: identifi-
// zierender User-Agent, gedrosselt, Rohantwort gecacht (Re-Parse ohne Re-Crawl).

import type { EntscheidSprache } from '../../src/lib/rechtsprechung/typen';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

export interface RegesteSprachfassungRoh {
  sprache: EntscheidSprache;   // 'de' | 'fr' | 'it'
  kopf: string;                // Regestenkopf (fett): Artikel + Regestentitel
  absaetze: string[];          // Textabsätze (paratf) in Quell-Reihenfolge
}

/** HTTP-Header: identifizierend, höflich (bger.ch schonen). */
const UA = 'LexMetrik/1.0 (+https://lexmetrik.vercel.app; research crawler; david.graf95@gmail.com)';

/**
 * BGE-Referenz («152 V 2», «151 IV 357») → clir-docid-Segment «152-V-2».
 * Deterministisch; null bei unerwartetem Format (dann kein clir-Abruf).
 */
export function bgeRefZuClirId(ref: string): string | null {
  const m = /^(\d+)\s+([IVX]+)\s+(\d+)$/.exec(String(ref).trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

/** clir-URL einer Sprachfassung (amtliche Quelle-URL, §7). */
export function clirUrl(clirId: string, sprache: EntscheidSprache): string {
  const docid = encodeURIComponent(`atf://${clirId}:${sprache}`);
  return `https://www.bger.ch/ext/eurospider/live/${sprache}/php/clir/http/index.php`
    + `?highlight_docid=${docid}&lang=${sprache}&type=show_document`;
}

/**
 * Schneidet den `<div id="regeste" …>`-Teilbaum durch DIV-Balancierung heraus
 * (robuster als ein Ende-Marker: die Regeste schliesst mit mehreren </div> und
 * es folgt variabel `<br><div>` bzw. der Sachverhalt-Anker). null ⇒ kein
 * Regeste-Block in dieser Sprachfassung vorhanden.
 */
export function schneideRegesteDiv(html: string): { sprache: string; inner: string } | null {
  const start = /<div id="regeste"\s+lang="([a-z]+)"\s*>/i.exec(html);
  if (!start) return null;
  const sprache = start[1];
  const i = start.index + start[0].length;
  let tiefe = 1;
  const tag = /<\/?div\b[^>]*>/gi;
  tag.lastIndex = i;
  for (let m; (m = tag.exec(html)); ) {
    if (m[0][1] === '/') tiefe--;
    else tiefe++;
    if (tiefe === 0) return { sprache, inner: html.slice(i, m.index) };
  }
  return null;
}

/** HTML-Inline eines Regeste-Fragments → treuer Klartext.
 *  - `<sup>x</sup>` → x ohne Trennzeichen an den Vortoken gehängt (Art. 61 lit.
 *    f<sup>bis</sup> → «Art. 61 lit. fbis»; die amtl. Zitierform, verbatim erhalten).
 *  - `<i>/<em>/<b>/<span>/<a name>` etc. → nur Textinhalt behalten.
 *  - Entities dekodiert; NBSP/schmales NBSP/Guillemets/Dezimalkomma verbatim. */
export function inlineZuText(fragment: string): string {
  let s = fragment;
  s = s.replace(/<sup\b[^>]*>(.*?)<\/sup>/gis, (_m, x) => String(x).replace(/<[^>]+>/g, ''));
  s = s.replace(/<br\s*\/?>/gi, ' ');
  s = s.replace(/<[^>]+>/g, '');          // restliche Tags entfernen (Inhalt bleibt)
  s = entdecodeEntities(s);
  s = s.replace(/[ \t\r\n]*\n[ \t\r\n]*/g, ' ');  // Zeilenumbrueche -> Space (NBSP/U+202F im Text bleiben)
  s = s.replace(/[ \t]{2,}/g, ' ');
  return s.trim();
}

/** Nur die im clir-HTML real vorkommenden Named/Numeric-Entities. */
function entdecodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0*39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10)));
}

/**
 * Parst EINE clir-Sprachfassungs-Seite → strukturierte Regeste (Kopf + Absätze).
 * Rein (netzfrei) → unit-testbar gegen gecachtes HTML. null ⇒ keine sichere
 * Regeste-Struktur ableitbar (dann Fall dokumentieren, §1: nie raten).
 */
export function parseClirRegeste(html: string): RegesteSprachfassungRoh | null {
  const div = schneideRegesteDiv(html);
  if (!div) return null;
  const spr = div.sprache;
  if (spr !== 'de' && spr !== 'fr' && spr !== 'it') return null;
  let inner = div.inner;
  // Titelzeile «Regeste/Regesto» entfernen (big bold).
  inner = inner.replace(/<div class="big bold">[^<]*<\/div>/i, '');
  // Regestenkopf = <div class="paraatf"> … (bis zum ersten verschachtelten paratf).
  const kopfM = /<div class="paraatf"\s*>([\s\S]*)$/i.exec(inner);
  if (!kopfM) return null;
  const kopfRoh = kopfM[1].split(/<div class="paratf"\s*>/i)[0];
  const kopf = inlineZuText(kopfRoh);
  if (!kopf) return null;
  // Absätze = jeder <div class="paratf"> … </div> (nur der erste </div> schliesst
  // ihn; im clir sind paratf nicht weiter verschachtelt).
  const absaetze: string[] = [];
  const abs = /<div class="paratf"\s*>([\s\S]*?)<\/div>/gi;
  for (let m; (m = abs.exec(inner)); ) {
    const t = inlineZuText(m[1]);
    if (t) absaetze.push(t);
  }
  return { sprache: spr, kopf, absaetze };
}

/**
 * Urteilskopf der DE-clir-Seite → eigenes aza-Aktenzeichen + echtes Urteilsdatum.
 * AMTLICHE Quelle der aza↔BGE-Bindung (Befund Gegenprüfung 12.7.2026: OCLs
 * `docket_number_2` ist vereinzelt falsch — BGE 146 II 304 trägt dort das in den
 * Erwägungen nur ZITIERTE 1C_345/2014; der clir-Urteilskopf nennt strukturell das
 * eigene Az. «1C_22/2019 / 1C_476/2019 vom 6. April 2020» direkt vor «Regeste»).
 * Bei verbundenen Verfahren wird das ERSTE Az. genommen (Leiturteil, gleiche
 * Konvention wie azaAusBgeKopf). Rein (netzfrei) → unit-testbar.
 */
export function parseClirUrteilskopf(html: string): { aza: string | null; datumIso: string | null } {
  const i = html.indexOf('Urteilskopf');
  if (i < 0) return { aza: null, datumIso: null };
  // Segment bis «Regeste» (dort beginnt der Regesten-Block), höchstens 2500 Z.
  let seg = html.slice(i, i + 2500);
  const r = seg.indexOf('Regeste');
  if (r > 0) seg = seg.slice(0, r);
  const text = inlineZuText(seg);
  // Eigenfall-Signatur: «<Az.>( / <Az.>)* vom|du|del <T>(.|er|°) <Monat> <JJJJ>» —
  // der Urteilskopf steht auch auf der DE-Seite in der VERFAHRENSSPRACHE
  // («Extrait de l'arrêt … 4A_606/2020 du 1er septembre 2021»).
  const m = /(\d[A-Z][._ ]\d+\/\d{4})(?:\s*\/\s*\d[A-Z][._ ]\d+\/\d{4})*\s+(?:vom|du|del|dell['’])\s*(\d{1,2})(?:\.|er|°)?\s*([A-Za-zàâéèêôûäöüÀÂÉ]+)\s+(\d{4})/.exec(text);
  if (!m) return { aza: null, datumIso: null };
  const MONATE: Record<string, string> = {
    // de
    januar: '01', februar: '02', 'märz': '03', april: '04', mai: '05', juni: '06',
    juli: '07', august: '08', september: '09', oktober: '10', november: '11', dezember: '12',
    // fr
    janvier: '01', 'février': '02', mars: '03', avril: '04', juin: '06',
    juillet: '07', 'août': '08', septembre: '09', octobre: '10', novembre: '11', 'décembre': '12',
    // it
    gennaio: '01', febbraio: '02', marzo: '03', aprile: '04', maggio: '05', giugno: '06',
    luglio: '07', agosto: '08', settembre: '09', ottobre: '10', dicembre: '12',
  };
  const mm = MONATE[m[3].toLowerCase()];
  const datumIso = mm ? `${m[4]}-${mm}-${m[2].padStart(2, '0')}` : null;
  return { aza: m[1].replace(/^(\d[A-Z])[._ ]/, '$1_'), datumIso };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Holt EINE clir-Sprachfassung (mit Datei-Cache; Re-Parse ohne Re-Crawl).
 * iso-8859-1-Dekodierung. Höflich: identifizierender UA, Timeout, Retry, Drossel.
 * Rückgabe: das rohe HTML (oder null bei hartem Fehler/404).
 */
export async function holeClirHtml(
  clirId: string, sprache: EntscheidSprache, cacheDir: string, drosselMs = 500,
): Promise<string | null> {
  const cacheDatei = path.join(cacheDir, `${clirId}_${sprache}.html`);
  try { return await fs.readFile(cacheDatei, 'utf8'); } catch { /* nicht gecacht */ }
  const url = clirUrl(clirId, sprache);
  for (let i = 0; i < 3; i++) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 45000);
    try {
      const res = await fetch(url, { signal: ac.signal, headers: { 'User-Agent': UA }, redirect: 'follow' });
      clearTimeout(t);
      if (res.status === 404) return null;
      if (!res.ok) { await sleep(800 * (i + 1)); continue; }
      const buf = new Uint8Array(await res.arrayBuffer());
      const html = new TextDecoder('iso-8859-1').decode(buf);
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(cacheDatei, html, 'utf8');
      await sleep(drosselMs);   // Netz höflich
      return html;
    } catch { clearTimeout(t); await sleep(800 * (i + 1)); }
  }
  return null;
}

/**
 * Alle vorhandenen Sprachfassungen einer BGE-Regeste holen + parsen, sortiert
 * DE→FR→IT (A18). Nur Sprachfassungen, die die Quelle STRUKTURELL hergibt (§1:
 * fehlende/uneindeutige werden weggelassen — nie geraten). Der Aufrufer verknüpft
 * die amtliche `quelleUrl` je Fassung.
 */
export const SPRACH_ORDNUNG: EntscheidSprache[] = ['de', 'fr', 'it'];

export async function holeRegesteSprachfassungen(
  bgeRef: string, cacheDir: string, drosselMs = 500,
): Promise<{ sprache: EntscheidSprache; kopf: string; absaetze: string[]; quelleUrl: string }[]> {
  const clirId = bgeRefZuClirId(bgeRef);
  if (!clirId) return [];
  const out: { sprache: EntscheidSprache; kopf: string; absaetze: string[]; quelleUrl: string }[] = [];
  for (const spr of SPRACH_ORDNUNG) {
    const html = await holeClirHtml(clirId, spr, cacheDir, drosselMs);
    if (!html) continue;
    const parsed = parseClirRegeste(html);
    if (!parsed) continue;
    out.push({ sprache: parsed.sprache, kopf: parsed.kopf, absaetze: parsed.absaetze, quelleUrl: clirUrl(clirId, spr) });
  }
  return out;
}
