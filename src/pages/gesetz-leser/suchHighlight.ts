// ─── A35 · Treffer-Highlight in der In-Gesetz-Suche (David 16.7.2026) ─────────
//
// «Suchtreffer im Text markieren — bspw. wenn man im OR ‹Vertrag› sucht, soll
// ‹Vertrag› gehighlighted werden.»
//
// Umsetzung über die CSS Custom Highlight API (`CSS.highlights` + `Highlight` +
// `Range`), NICHT über eine DOM-/React-Baum-Mutation: der Artikel-Wortlaut wird
// von ArtikelBody/NormText strukturiert gerendert (Autolinks, Fussnoten-Popover,
// Tarif-Tabellen, Zitat-Marken). Ein `<mark>`-Wrapper müsste all das durchfädeln
// und die byte-genaue Darstellungswahrheit (§3/§6, Golden) riskieren. Die
// Highlight-API legt die Hervorhebung als reine PAINT-Schicht über die bestehenden
// Text-Knoten — keinerlei Knoten wird erzeugt, verschoben oder verändert (§15/2
// CLS 0, keine Layout-Verschiebung). Styling: `::highlight(lc-such-treffer)` in
// index.css. Fehlt die API (ältere Browser/SSR), degradiert es geräuschlos zu
// «kein Highlight» — die Trefferliste bleibt voll funktionsfähig.

/** Kanonischer Highlight-Name (mit der `::highlight()`-Regel in index.css). */
export const SUCH_HIGHLIGHT = 'lc-such-treffer';

/** Substring-Vorkommen (case-insensitiv) als [start, end)-Offsetpaare. Rein —
 *  dieselbe Semantik wie `passtAufSuche` (helpers.tsx): schlichter, akzenttreuer
 *  Teilstring-Vergleich über `toLowerCase`. Vitest-getestet. */
export function findeVorkommen(text: string, begriff: string): Array<[number, number]> {
  const b = begriff.toLowerCase();
  if (b === '') return [];
  const hay = text.toLowerCase();
  const treffer: Array<[number, number]> = [];
  let ab = 0;
  // indexOf-Schleife statt Regex: der Begriff ist frei (Sonderzeichen), und ein
  // Teilstring-Vergleich braucht kein Escaping. Fortschritt IMMER ≥1 (b.length≥1).
  for (;;) {
    const i = hay.indexOf(b, ab);
    if (i < 0) break;
    treffer.push([i, i + b.length]);
    ab = i + b.length;
  }
  return treffer;
}

// Die CSS Custom Highlight API ist (je nach TS-lib) nicht typisiert — darum über
// eine schmale, lokale Struktur an `globalThis` gelesen (kein `any`, kein
// lib.dom-Zwang). `Highlight` nimmt beliebig viele Ranges; die Registry ist eine
// Map<string, Highlight>. Fehlt eines der beiden, ist die API nicht verfügbar.
type HighlightCtor = new (...ranges: Range[]) => object;
interface HighlightGlobals {
  Highlight?: HighlightCtor;
  CSS?: { highlights?: Map<string, object> };
}

function highlightApi(): { reg: Map<string, object>; Ctor: HighlightCtor } | null {
  if (typeof globalThis === 'undefined') return null;
  const g = globalThis as unknown as HighlightGlobals;
  const reg = g.CSS?.highlights;
  const Ctor = g.Highlight;
  if (!reg || typeof Ctor !== 'function') return null;
  return { reg, Ctor };
}

/**
 * Setzt (oder löscht) die Treffer-Hervorhebung des Suchbegriffs innerhalb von
 * `container`. Leerer/kurzer Begriff oder fehlende API ⇒ Highlight wird gelöscht.
 * Idempotent: ersetzt stets die volle Highlight-Menge dieses Namens.
 */
export function setzeSuchHighlight(container: HTMLElement | null, begriff: string): void {
  const api = highlightApi();
  if (!api) return;
  const { reg, Ctor } = api;
  const b = begriff.trim().toLowerCase();
  // Ab-1-Zeichen genügt (passtAufSuche matcht ab 1 Zeichen); leer ⇒ löschen.
  if (!container || b === '') { reg.delete(SUCH_HIGHLIGHT); return; }

  const ranges: Range[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue ?? '';
    if (text === '') continue;
    const hay = text.toLowerCase();
    let ab = 0;
    for (;;) {
      const i = hay.indexOf(b, ab);
      if (i < 0) break;
      const r = document.createRange();
      r.setStart(n, i);
      r.setEnd(n, i + b.length);
      ranges.push(r);
      ab = i + b.length;
    }
  }
  if (ranges.length === 0) { reg.delete(SUCH_HIGHLIGHT); return; }
  reg.set(SUCH_HIGHLIGHT, new Ctor(...ranges));
}
