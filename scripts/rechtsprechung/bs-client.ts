// ─── BS-Findinfo-Client (rechtsprechung.gerichte.bs.ch, GET-only-CGI) ────────
//
// Amtliches Rechtsprechungs-Portal der Gerichte Basel-Stadt (Vendor Findinfo/
// Omnis). Verbindliche Request-Regeln (Bauplan §1, alle empirisch belegt):
//  1. NUR GET — identische POSTs liefern konstant 0 Treffer.
//  2. Basis-Parameter Pflicht (sonst 302 mit Connection-Close).
//  3. `bInstanzInt_*`-Parameter NIE mitsenden (kastriert den Korpus auf ~30 AK-Treffer).
//  4. Paging-Wrap-Falle: nSeite jenseits der letzten Seite liefert wieder Seite 1
//     (nicht leer) → Abbruch IMMER über ceil(N/999), nie über «leere Seite».
//  5. Query-Encoding ist iso-8859-1 (encodeLatin1) — UTF-8-Prozent-Encoding wäre falsch.
//  6. Erfolg NIE am HTTP-Status messen: das CGI liefert 17-Byte-Bodies
//     («#ERROR-…») mit HTTP 200 → Content-Type + Body-Länge + inhaltlicher
//     Marker sind das Gate (Skill scraping-swiss-official-sources).
//  7. Höflich crawlen: sequenziell, ≥700 ms Abstand, Backoff 5s/30s/120s.

const HOST = 'rechtsprechung.gerichte.bs.ch';

// Basis-Parameter (Reihenfolge wie im Portal; Pflicht — ohne sie 302).
const BASIS: Array<[string, string]> = [
  ['OmnisPlatform', 'WINDOWS'],
  ['WebServerUrl', HOST],
  ['WebServerScript', '/cgi-bin/nph-omniscgi.exe'],
  ['OmnisLibrary', 'JURISWEB'],
  ['OmnisClass', 'rtFindinfoWebHtmlService'],
  ['OmnisServer', 'JURISWEB,7000'],
  ['Schema', 'BS_FI_WEB'],
  ['Parametername', 'WEB'],
  ['cSprache', 'DE'],
];

/**
 * Prozent-Encoding über die iso-8859-1-Bytes (nicht UTF-8): das Omnis-CGI
 * dekodiert Query-Werte latin1. Zeichen ausserhalb von Latin-1 dürfen in
 * Parametern nicht vorkommen (Assertion — ehrlich scheitern statt still falsch).
 */
export function encodeLatin1(s: string): string {
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (cp > 0xff) throw new Error(`encodeLatin1: Zeichen ausserhalb Latin-1: U+${cp.toString(16)} in «${s}»`);
    // Unreserviert (RFC 3986) direkt, alles andere prozent-encodiert.
    if (/[A-Za-z0-9\-._~]/.test(ch)) out += ch;
    else out += '%' + cp.toString(16).toUpperCase().padStart(2, '0');
  }
  return out;
}

function query(params: Array<[string, string]>): string {
  return params.map(([k, v]) => `${k}=${encodeLatin1(v)}`).join('&');
}

/** Such-URL (Trefferliste): 999 Treffer/Seite; optionales Entscheiddatum-Fenster. */
export function sucheUrl(opts: { seite: number; von?: string; bis?: string }): string {
  const p: Array<[string, string]> = [
    ...BASIS,
    ['Aufruf', 'validate'],
    ['cTemplate', 'search_resulttable.html'],
    ['cTemplate_ValidationError', 'search.html'],
    ['evSubmit', 'Suchen'],
    ['nAnzahlTrefferProSeite', '999'],
    ['nSeite', String(opts.seite)],
  ];
  if (opts.von && opts.bis) {
    p.push(['dEntscheiddatum', opts.von], ['bHasEntscheiddatumBis', '1'], ['dEntscheiddatumBis', opts.bis]);
  }
  return `https://${HOST}/cgi-bin/nph-omniscgi.exe?${query(p)}`;
}

/**
 * Dokument-URL — session-frei, OHNE W10_KEY/nTrefferzeile, ABER mit
 * `Template=search_result_document.html`: der Bauplan behauptete, das Minimal-
 * Set ohne Template genüge — empirisch liefert es das 17-Byte-«#ERROR-220511-003»
 * (HTTP 200); erst mit Template kommt das byte-identische Dokument (belegt
 * 19.7.2026, nF30_KEY=77812: 30'828 B in allen Template-Varianten, W10_KEY
 * irrelevant). Offengelegte Abweichung. Dient auch als quelleUrl (§7).
 */
export function dokumentUrl(nF30Key: number | string): string {
  const p: Array<[string, string]> = [
    ...BASIS,
    ['Aufruf', 'getMarkupDocument'],
    ['nF30_KEY', String(nF30Key)],
    ['Template', 'search_result_document.html'],
  ];
  return `https://${HOST}/cgi-bin/nph-omniscgi.exe?${query(p)}`;
}

export interface FetchErgebnis {
  /** Rohbytes (golden — unverändert speichern, Parser-Fixes brauchen nie Re-Crawl). */
  bytes: Buffer;
  /** windows-1252-dekodierter Text (siehe dekodiereBs). */
  text: string;
}

/**
 * Byte-Dekodierung der Portal-Antworten. Der Header deklariert iso-8859-1,
 * die Bodies tragen aber real Windows-1252-Bytes im C1-Bereich (empirisch:
 * 0x91/0x92 '', 0x93/0x94 "", 0x96 –, 0x85 …, 0x95 •) — genau wie Browser es
 * gemäss WHATWG-Encoding-Spec behandeln (iso-8859-1 ≡ windows-1252). Ein
 * striktes latin1-Decode ergäbe unsichtbare C1-Steuerzeichen statt der echten
 * Typographie (Fidelity-Verlust). Bewusste, offengelegte Abweichung vom
 * Bauplan-Wortlaut «strikt latin1» (§3.6); verlustfrei per Konstruktion.
 */
const W1252 = new TextDecoder('windows-1252');
export function dekodiereBs(bytes: Buffer): string {
  return W1252.decode(bytes);
}

let letzterRequest = 0;
const MIN_ABSTAND_MS = 700;
const BACKOFF_MS = [5_000, 30_000, 120_000];

const schlafe = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Ein höflicher, verifizierter GET. `marker` prüft den INHALT (z.B. «von N
 * gefundenen» bzw. die erwartete GN im Dokument) — HTTP 200 allein beweist nichts.
 * 3 Versuche mit Backoff; danach Error (der Aufrufer führt die Fehlerliste).
 */
export async function holeBs(url: string, marker: (text: string) => boolean): Promise<FetchErgebnis> {
  let letzterFehler = '';
  for (let versuch = 0; versuch <= BACKOFF_MS.length; versuch++) {
    if (versuch > 0) await schlafe(BACKOFF_MS[versuch - 1]);
    const warte = letzterRequest + MIN_ABSTAND_MS - Date.now();
    if (warte > 0) await schlafe(warte);
    letzterRequest = Date.now();
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 45_000);
      const res = await fetch(url, { redirect: 'manual', signal: ctl.signal, headers: { 'User-Agent': 'LexMetrik-Import (kontakt: david.graf95@gmail.com)' } });
      const bytes = Buffer.from(await res.arrayBuffer());
      clearTimeout(timer);
      const ct = res.headers.get('content-type') ?? '';
      const text = dekodiereBs(bytes);
      // Erfolgs-Gate (Bauplan §5.1): Status + Content-Type + Mindestlänge +
      // kein #ERROR-Präfix + inhaltlicher Marker. 302 = Fehlerindikator.
      if (res.status !== 200) { letzterFehler = `HTTP ${res.status}`; continue; }
      if (!ct.includes('text/html')) { letzterFehler = `Content-Type ${ct || '(leer)'}`; continue; }
      if (bytes.length < 2_000) { letzterFehler = `Body nur ${bytes.length} B (${text.slice(0, 40)})`; continue; }
      if (text.startsWith('#ERROR')) { letzterFehler = `CGI-Fehler ${text.slice(0, 40)}`; continue; }
      if (!marker(text)) { letzterFehler = `Inhalts-Marker fehlt (${bytes.length} B)`; continue; }
      return { bytes, text };
    } catch (e) {
      letzterFehler = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(`holeBs: ${url.slice(0, 120)}… nach ${BACKOFF_MS.length + 1} Versuchen gescheitert: ${letzterFehler}`);
}

/** «Treffer: X - Y von N gefundenen» — N aus der Trefferliste (Count-Gate-Anker). */
export function trefferAnzahl(text: string): number | null {
  const m = /von\s+(\d+)\s+gefundenen/.exec(text);
  return m ? Number(m[1]) : null;
}
