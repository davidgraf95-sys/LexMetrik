// ─── Formular-Eingabe-Parser (Darstellungsschicht, SSOT, H-11) ─────────────
//
// SSOT der zahl()-Parser der Rechner-Formulare (zuvor 7× copy-paste mit realer
// Drift). Zwei bewusst verschiedene Achsen bleiben: Guard (n>=0 vs. beliebig)
// und Rückgabe-Konvention (undefined vs. null). KEINE Rechtsregel: reine
// Normalisierung der Nutzereingabe in den Formular-Zustand (§3, Darstellung).
//
// H-11 Commit B (DEKLARIERTE UI-Änderung, NICHT §6-neutral): die Tausender-
// Apostroph/Leerzeichen-Toleranz gilt jetzt EINHEITLICH für alle Rechner-
// Formulare (zuvor nur BgerRechtsweg) — «1'000'000» bzw. «1 000» rechnet überall.
// Die akzeptierte Eingabemenge wird nur ERWEITERT (Superset), nie verengt; kein
// zuvor gültiger Wert ändert sein Ergebnis. Guard-Unterschiede unverändert.
//
// BEWUSST getrennt von lib/format.ts::zahl (§1, nicht zusammenführen): jener hat
// einen anderen Vertrag (zusätzlich Komma→Punkt-Toleranz; engine-/vorlagen-
// seitige Konsumenten). Ziffern-Eingabefeld ≠ fachneutraler Wert-Parser.

/** Nutzereingabe → Zahl: Tausender-Apostroph (gerade + typografisch U+2019) und
 *  Leerzeichen werden vor Number() entfernt. leer/ungültig → undefined;
 *  guard=true verwirft zusätzlich negative Werte. */
const kern = (roh: string, guard: boolean): number | undefined => {
  if (roh.trim() === '') return undefined;
  const n = Number(roh.replace(/['’\s]/g, ''));
  return Number.isFinite(n) && (!guard || n >= 0) ? n : undefined;
};

/** Nicht-negative Zahl (Guard n>=0); leer/ungültig → undefined.
 *  Grundbuch/Beurkundung/NotariatGrundbuch. */
export const zahlNichtNegativ = (roh: string): number | undefined => kern(roh, true);

/** Beliebige endliche Zahl (kein Guard); leer/ungültig → undefined.
 *  Prozesskosten/Streitwert/GebvKosten. */
export const zahlBeliebig = (roh: string): number | undefined => kern(roh, false);

/** Nicht-negative Zahl (Guard n>=0); leer/ungültig → null.
 *  BgerRechtsweg (bewusst null statt undefined: nachgelagerte === null-Logik). */
export const zahlNichtNegativOderNull = (roh: string): number | null => kern(roh, true) ?? null;
