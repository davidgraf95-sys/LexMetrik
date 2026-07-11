// ─── «Meinten Sie …?» — deterministischer Tippfehler-Vorschlag (UI-NAV S3) ───
//
// Rein & deterministisch (§2): Levenshtein-Distanz gegen eine übergebene
// Kandidatenliste (Such-Vokabular + Erlass-Kürzel + Katalog-Titel), KEIN LLM,
// kein Netz, kein Date.now(). Nicht load-bearing (reine Suche, kein Rechtswert) —
// darum keine Gegenprüfung nötig. Die Kandidaten stellt der Aufrufer (Hook) aus
// den ohnehin geladenen Daten zusammen (kein Zweit-Index, K10).

import { normalisiereBegriff } from './vokabular';

/** Levenshtein-Distanz mit Früh-Abbruch (Zeilen-DP, O(n·m)). Rein. */
export function levenshtein(a: string, b: string, max = Infinity): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let vorige = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const aktuell = [i];
    let zeilenMin = i;
    for (let j = 1; j <= b.length; j++) {
      const kosten = a[i - 1] === b[j - 1] ? 0 : 1;
      const d = Math.min(vorige[j] + 1, aktuell[j - 1] + 1, vorige[j - 1] + kosten);
      aktuell.push(d);
      if (d < zeilenMin) zeilenMin = d;
    }
    if (zeilenMin > max) return max + 1; // ganze Zeile über der Schranke → abbrechen
    vorige = aktuell;
  }
  return vorige[b.length];
}

/** Schwelle je Wortlänge: kurze Wörter tolerieren 1, längere 2 Tippfehler. */
function schwelle(len: number): number {
  return len <= 4 ? 1 : 2;
}

/**
 * Bester «Meinten Sie …?»-Vorschlag für eine Eingabe, oder null. Vergleicht die
 * normalisierte Eingabe gegen die (in Anzeige-Form übergebenen) Kandidaten;
 * gibt die ANZEIGE-Form des nächsten Kandidaten zurück, sofern die Distanz unter
 * der Schwelle liegt und die Eingabe nicht selbst schon ein Kandidat ist.
 * Deterministisch: bei Gleichstand gewinnt der erste Kandidat (stabile Ordnung).
 */
export function meinenSie(query: string, kandidaten: readonly string[]): string | null {
  const q = normalisiereBegriff(query);
  if (q.length < 4) return null; // zu kurz für einen sinnvollen Vorschlag
  const max = schwelle(q.length);
  let bestDistanz = Infinity;
  let bestAnzeige: string | null = null;
  for (const kand of kandidaten) {
    const k = normalisiereBegriff(kand);
    if (!k || k === q) return null; // Eingabe IST ein Kandidat → kein Vorschlag
    const d = levenshtein(q, k, max);
    if (d >= 1 && d <= max && d < bestDistanz) {
      bestDistanz = d;
      bestAnzeige = kand;
    }
  }
  return bestAnzeige;
}
