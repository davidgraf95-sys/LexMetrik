// scripts/materialien/wortfeld.ts
// E6a Stufe 1 (FAHRPLAN-MATERIALIEN-VERZAHNUNG §4, §0/A7): reiner, testbarer Extractor für das
// Wortfeld-Tor (geführt in check:materialien). Eigenes Modul, damit check-materialien.ts
// unverändert als vite-node-Entry top-level laufen kann UND der Test die Extraktion importiert.
//
// Regel: KEINE AFFIRMATIVE «geprüft/gegengeprüft/verifiziert» in EIGENEN Nutzertexten. Negationen
// («nicht»/«noch nicht»/«un»-Präfix, «ungeprüft», «unverifiziert») sind ehrliche §8-Offenlegungen
// und ERLAUBT. Quellcode-KOMMENTARE sind keine Nutzertexte (ausgeblendet). Amtliche `titel` in
// register.json sind Zitat-Felder — die JSON-Prüfung greift nur EIGENE Felder (hinweis).

// «geprüft» deckt «gegengeprüft» als Teilstring; «geprueft» (ue-Variante) mitgenommen.
const WORTFELD = /gepr(?:ü|ue)ft|verifiziert/gi;

/** Negations-Fenster (bindend): «nicht»/«noch nicht» (ganzes Wort) ODER «un»-Präfix unmittelbar
 *  vor dem Treffer ⇒ ehrliche Offenlegung, ERLAUBT. */
export function istNegiert(vor: string): boolean {
  return /\bnicht\s*$/i.test(vor) || /\bun$/i.test(vor);
}

/** Ersetzt Quellcode-KOMMENTARE durch Leerzeichen (Positionen bleiben), quote-aware — so
 *  überleben URLs mit `//` in String-Literalen, und Kommentar-Text wird NICHT geprüft. */
export function blendeKommentareAus(src: string): string {
  const out = src.split('');
  const n = src.length;
  let i = 0;
  let quote: string | null = null;
  while (i < n) {
    const c = src[i];
    const c2 = i + 1 < n ? src[i + 1] : '';
    if (quote) {
      if (c === '\\') { i += 2; continue; }
      if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; i++; continue; }
    if (c === '/' && c2 === '/') {
      while (i < n && src[i] !== '\n') { out[i] = ' '; i++; }
      continue;
    }
    if (c === '/' && c2 === '*') {
      out[i] = ' '; out[i + 1] = ' '; i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] !== '\n') out[i] = ' '; i++; }
      if (i < n) { out[i] = ' '; out[i + 1] = ' '; i += 2; }
      continue;
    }
    i++;
  }
  return out.join('');
}

/** Affirmative Wortfeld-Treffer in einem Text (Negationen ausgenommen). Kein Kommentar-Strip
 *  (für Plain-Text-/JSON-Felder wie `hinweis`). */
export function wortfeldTreffer(text: string): { treffer: string; kontext: string }[] {
  const out: { treffer: string; kontext: string }[] = [];
  for (const m of text.matchAll(WORTFELD)) {
    const idx = m.index ?? 0;
    if (istNegiert(text.slice(Math.max(0, idx - 40), idx))) continue;
    out.push({ treffer: m[0], kontext: text.slice(Math.max(0, idx - 25), idx + m[0].length + 10).replace(/\s+/g, ' ').trim() });
  }
  return out;
}

/** Wortfeld-Treffer im Quellcode (Kommentare ausgenommen). Prüft das kommentar-freie Substrat
 *  (Superset aus String-Literalen/JSX-Text/Code — fail-closed, nie fail-open). */
export function wortfeldImQuellcode(src: string): { treffer: string; kontext: string }[] {
  return wortfeldTreffer(blendeKommentareAus(src));
}
