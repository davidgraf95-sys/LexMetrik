// ─── Sachverhalt strukturieren (sicher, §1) ──────────────────────────────────
//
// BGE-Sachverhalte gliedern sich amtlich in Buchstaben-Abschnitte (A./B./C. mit
// Unterpunkten A.a/A.b/B.a …). Im gespeicherten Fliesstext stehen diese Marker
// inline; eine NAIVE Top-Marker-Erkennung (A./B./C.) ist UNSICHER, weil sie mit
// anonymisierten Partei-/Firmennamen kollidiert (z.B. „B. Pte Ltd", „A. mbH",
// „C. Co.") und die A→B→C-Sequenz von genau solchen Namen getäuscht wird — ein
// Fehl-Split verfälscht den Sachverhalt (schlimmer als unstrukturiert).
//
// Sicherer Weg (empirisch über 258 BGE, 0 Fehl-Splits): NUR an Sub-Markern der
// Form Grossbuchstabe.Kleinbuchstabe (A.a, B.b) trennen — diese matchen Namen
// praktisch nie (Namen sind A.A. = Gross.Gross oder A. = einzeln). Pro Top-Letter
// wird die Folge a,b,c,… verlangt (Sequenz-Gate). Greift das nicht (kein/zu wenig
// Sub-Marker), bleibt der Sachverhalt EIN (bereinigter) Block — nie geraten.
//
// Rein/deterministisch; Pendant zur Erwägungs-Normalisierung. KEINE Wort-Tilgung
// ausser dem Seiten-Rauschen (Kolumnentitel), das die Quelle einstreut.

import type { EntscheidBlock } from './typen';

/**
 * Seiten-Rauschen der Quelle entfernen: Kolumnentitel „BGE 152 III 92 S. 93" und
 * der Einstieg „ab Seite 93". Das ist Paginierung der Wiedergabe, nicht Urteilstext.
 */
export function entrauscheSachverhalt(text: string): string {
  return String(text ?? '')
    .replace(/\bBGE\s+\d+\s+[IVXLCDM]+\s+\d+\s+S\.\s*\d+/g, ' ')
    .replace(/(?:^|\s)ab Seite\s+\d+\b/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

interface Marker { top: string; sub: string; at: number; end: number }

// Sub-Marker: Gross.Klein, gefolgt von Whitespace + Gross/Ziffer (Abschnitt-Anfang).
const SUB_RE = /(?:^|\s)([A-Z])\.([a-z])(?=\s+[A-ZÄÖÜ0-9])/g;

// Top-Marker: Gross. + Whitespace + Grossbuchstabe. UNSICHER bei naiver Anwendung
// (kollidiert mit Namen „Spital B.", „A. mbH", „B.A."). Darum nur SATZ-INITIAL
// akzeptiert (Textanfang oder direkt nach Satzzeichen) + strenge A→B→C-Sequenz.
const TOP_RE = /([A-Z])\.\s+(?=[A-ZÄÖÜ])/g;

// Abkürzungen, deren Punkt KEIN Satzende ist (sonst würde „Dr. B." die Namens-
// Initiale „B." satz-initial machen → Fehlsplit). Bug-Check 24.6.: 151_II_625.
const ABKUERZUNG = new Set([
  'dr', 'prof', 'lic', 'med', 'iur', 'rer', 'nat', 'phil', 'dipl', 'sc',
  'art', 'abs', 'lit', 'ziff', 'bzw', 'vgl', 'ca', 'nr', 'al', 'sog', 'inkl', 'etc',
]);

/**
 * true, wenn die Position idx satz-initial ist (Textanfang oder echtes Satzende
 * .!?). Ein Punkt nach einer EINZELBUCHSTABEN-Initiale („B.") oder einer bekannten
 * ABKÜRZUNG („Dr.") gilt NICHT als Satzende — sonst würde eine Namens-Initiale als
 * Abschnitts-Marker gelesen (§1). Zahl-/Wort-Satzenden („…2020.", „…abgewiesen.")
 * bleiben gültig.
 */
function istSatzInitial(t: string, idx: number): boolean {
  let i = idx - 1;
  while (i >= 0 && /\s/.test(t[i])) i--;
  if (i < 0) return true;
  if (!/[.!?]/.test(t[i])) return false;
  // Wort unmittelbar vor dem Punkt (nur Buchstaben) prüfen.
  let j = i - 1;
  let wort = '';
  while (j >= 0 && /[A-Za-zäöüÄÖÜ]/.test(t[j])) { wort = t[j] + wort; j--; }
  if (wort.length === 1) return false;                 // Initiale „B."
  if (wort && ABKUERZUNG.has(wort.toLowerCase())) return false; // Abkürzung „Dr."
  return true;
}

/**
 * Reine Top-Marker-Gliederung (A./B./C.) als FALLBACK, wenn keine Sub-Marker
 * vorliegen. Nur satz-initiale, sequenzvalidierte Marker — sonst null (kein Split).
 */
function teileTopLevel(t: string): EntscheidBlock[] | null {
  const cand: { top: string; at: number; end: number }[] = [];
  for (let m; (m = TOP_RE.exec(t)); ) {
    if (istSatzInitial(t, m.index)) cand.push({ top: m[1], at: m.index, end: m.index + m[0].length });
  }
  const ok: typeof cand = [];
  let cur: number | null = null;
  for (const c of cand) {
    const code = c.top.charCodeAt(0);
    if ((cur === null && c.top === 'A') || (cur !== null && code === cur + 1)) { cur = code; ok.push(c); }
  }
  if (ok.length < 2) return null;
  const bloecke: EntscheidBlock[] = [];
  const pre = t.slice(0, ok[0].at).trim();
  if (pre) bloecke.push({ marke: null, text: pre });
  for (let i = 0; i < ok.length; i++) {
    const txt = t.slice(ok[i].end, i + 1 < ok.length ? ok[i + 1].at : t.length).trim();
    bloecke.push({ marke: `${ok[i].top}.`, tiefe: 1, text: txt });
  }
  return bloecke;
}

/**
 * Sachverhalt in Buchstaben-Abschnitte teilen — NUR an sequenzvalidierten
 * Sub-Markern. Liefert EntscheidBlock[] (marke 'A.'/'A.a', tiefe 1/2). Greift die
 * Gliederung nicht (≥2 valide Sub-Marker nötig), kommt EIN markenloser Block
 * zurück (bereinigter Fliesstext) — Fallback, nie geraten.
 */
export function teileSachverhalt(roh: string): EntscheidBlock[] {
  const t = entrauscheSachverhalt(roh);
  if (!t) return [];

  // Kandidaten sammeln.
  const cand: Marker[] = [];
  for (let m; (m = SUB_RE.exec(t)); ) {
    cand.push({ top: m[1], sub: m[2], at: m.index + (/\s/.test(m[0][0]) ? 1 : 0), end: SUB_RE.lastIndex });
  }
  // Sequenz-Gate: je Top-Letter Unterfolge a,b,c… (lückenlos ab 'a').
  const ok: Marker[] = [];
  let curTop: string | null = null;
  let curSub = 0;
  for (const c of cand) {
    const sc = c.sub.charCodeAt(0);
    if (c.top !== curTop) {
      if (c.sub === 'a') { curTop = c.top; curSub = sc; ok.push(c); }
    } else if (sc === curSub + 1) {
      curSub = sc; ok.push(c);
    }
  }
  // Keine (≥2) Sub-Marker → Top-Marker-Gliederung versuchen (A./B./C.), sonst EIN Block.
  if (ok.length < 2) return teileTopLevel(t) ?? [{ marke: null, text: t }];

  const bloecke: EntscheidBlock[] = [];
  // Vorspann vor dem ersten Sub-Marker. Endet er auf den nackten Top-Marker des
  // ersten Abschnitts („… A." vor „A.a"), wird dieser als Top-Kopf (tiefe 1)
  // abgetrennt — DETERMINISTISCH (Buchstabe muss zum folgenden Top passen), nie
  // ein satz-schliessender Name. Wortinvariant (der Token wandert nach `marke`).
  let pre = t.slice(0, ok[0].at).trim();
  const preM = /(?:^|\s)([A-Z])\.$/.exec(pre);
  let preKopf: string | null = null;
  if (preM && preM[1] === ok[0].top) { pre = pre.slice(0, pre.length - preM[0].length).trim(); preKopf = ok[0].top; }
  if (pre) bloecke.push({ marke: null, text: pre });
  if (preKopf) bloecke.push({ marke: `${preKopf}.`, tiefe: 1, text: '' });

  // An den Sub-Markern trennen (Token → `marke`). Ein am Blockende nachlaufender
  // nackter Top-Marker wird nur dann abgetrennt, wenn sein Buchstabe dem Top des
  // NÄCHSTEN Abschnitts entspricht (≠ aktueller Top) — dann ist es belegt ein
  // Abschnitts-Marker, kein Name am Satzende (§1). Sonst bleibt der Text unangetastet.
  for (let i = 0; i < ok.length; i++) {
    let txt = t.slice(ok[i].end, i + 1 < ok.length ? ok[i + 1].at : t.length).trim();
    let folgeKopf: string | null = null;
    if (i + 1 < ok.length) {
      const m = /\s([A-Z])\.$/.exec(txt);
      if (m && m[1] === ok[i + 1].top && m[1] !== ok[i].top) { txt = txt.slice(0, txt.length - m[0].length).trim(); folgeKopf = m[1]; }
    }
    bloecke.push({ marke: `${ok[i].top}.${ok[i].sub}`, tiefe: 2, text: txt });
    if (folgeKopf) bloecke.push({ marke: `${folgeKopf}.`, tiefe: 1, text: '' });
  }
  return bloecke;
}
