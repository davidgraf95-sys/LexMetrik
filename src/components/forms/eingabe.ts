// ─── Formular-Eingabe-Parser (Darstellungsschicht, SSOT, H-11) ─────────────
//
// Zuvor 7× wortnah kopiertes zahl() in den Rechner-Formularen — mit REALER
// Drift (Guard n>=0, Apostroph-Toleranz, undefined-vs-null). Hier EIN
// parametrierter Kern + drei bewusst verschiedene Varianten; Commit A ist
// byte-gleich zum bisherigen lokalen zahl() je Formular (§6). KEINE Rechtsregel:
// reine Normalisierung der Nutzereingabe in den Formular-Zustand (§3, Darstellung).
//
// BEWUSST getrennt von lib/format.ts::zahl (§1, nicht zusammenführen): jener hat
// einen anderen Vertrag (zusätzlich Komma→Punkt-Toleranz; engine-/vorlagen-
// seitige Konsumenten). Ziffern-Eingabefeld ≠ fachneutraler Wert-Parser.

interface ZahlOpt {
  /** true ⇒ nur n>=0 zulassen (Beträge/Werte); false ⇒ jede endliche Zahl. */
  guard: boolean;
  /** true ⇒ Tausender-Apostroph/Leerzeichen vor Number() entfernen. */
  toleranz: boolean;
}

const kern = (roh: string, { guard, toleranz }: ZahlOpt): number | undefined => {
  if (roh.trim() === '') return undefined;
  const n = Number(toleranz ? roh.replace(/['’\s]/g, '') : roh);
  return Number.isFinite(n) && (!guard || n >= 0) ? n : undefined;
};

/** Nicht-negative Zahl (Guard n>=0), ohne Apostroph-Toleranz; leer/ungültig → undefined.
 *  Grundbuch/Beurkundung/NotariatGrundbuch. */
export const zahlNichtNegativ = (roh: string): number | undefined =>
  kern(roh, { guard: true, toleranz: false });

/** Beliebige endliche Zahl (kein Guard), ohne Apostroph-Toleranz; leer/ungültig → undefined.
 *  Prozesskosten/Streitwert/GebvKosten. */
export const zahlBeliebig = (roh: string): number | undefined =>
  kern(roh, { guard: false, toleranz: false });

/** Nicht-negative Zahl (Guard n>=0), Apostroph/Leerzeichen-tolerant; leer/ungültig → null.
 *  BgerRechtsweg (bewusst null statt undefined: nachgelagerte === null-Logik). */
export const zahlNichtNegativTolerant = (roh: string): number | null =>
  kern(roh, { guard: true, toleranz: true }) ?? null;
