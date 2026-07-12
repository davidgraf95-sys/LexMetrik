// ─── OpenCaseLaw-Adapter: Typen ──────────────────────────────────────────────
//
// H-8/B22 (12.7.2026): `OclParagraph` aus adapter-entscheide.ts ausgelagert
// (reiner Typ-Move) — löst den Typ-Zyklus adapter-entscheide.ts <->
// erwaegung-normalisieren.ts (madge check:zyklen). erwaegung-normalisieren.ts
// importierte `import type { OclParagraph } from './adapter-entscheide'`,
// während adapter-entscheide.ts umgekehrt `normalisiereErwaegung` (Wert) aus
// erwaegung-normalisieren.ts importierte — ein reiner Datei-Zyklus. Fix: der
// Typ lebt jetzt hier, ohne Rückimport auf adapter-entscheide.ts;
// adapter-entscheide.ts re-exportiert ihn mit `export type` (isolatedModules-
// sicher). Kein Konsument bricht — alle bisherigen
// `from './adapter-entscheide'`-Importe von `OclParagraph` lösen weiter auf.

/** Schlanker Typ der OCL-Rohantwort-Absätze (nur die genutzten Felder). */
export interface OclParagraph {
  e_number?: string; depth?: number; parent?: string;
  text?: string; text_excerpt?: string; text_chars?: number;
}
