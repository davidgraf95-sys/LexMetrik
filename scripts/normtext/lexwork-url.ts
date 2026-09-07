/**
 * LexWork-URL-Übersetzung — Seiten-URL (`/app/…`) → API-URL (`/api/…`).
 *
 * Eigene Datei, weil die Funktion rein ist, mehrere Werkzeuge sie brauchen
 * (`pdf-quellen-generieren.ts`, `scripts/tarif/tarif-drift.ts`) und ihr
 * bisheriger Wohnort ein CLI-Modul ist, das beim blossen Import seinen
 * Generator startet (`if (!process.env.VITEST) void main()`). Ein Tor, das eine
 * Hilfsfunktion importiert, darf keinen Generator auslösen — beobachtet
 * 6.9.2026 beim ersten Lauf von `check:tarif-drift` (schrieb
 * public/normtext/pdf-quellen.json neu). §5: die Übersetzungsregel bleibt an
 * genau einer Stelle; das CLI-Modul re-exportiert sie.
 */

/** '…/app/de/texts_of_law/291.150' → '…/api/de/texts_of_law/291.150'. null = kein LexWork-Muster. */
export function lexworkApiUrl(quelleUrl: string): string | null {
  const m = quelleUrl.match(/^(https:\/\/[^/]+)\/app\/(de|fr|it)\/texts_of_law\/(.+)$/);
  return m ? `${m[1]}/api/${m[2]}/texts_of_law/${m[3]}` : null;
}
