import type { Rechner } from '../types/legal';

// ─── Rechner-Registry ─────────────────────────────────────────────────────
//
// Neues Modul andocken:
//   1. Erstelle src/lib/meinModul.ts mit einer Funktion, die Berechnungsergebnis liefert.
//   2. Instanziere einen Rechner<MeinInput> mit id, titel, beschreibung und berechne().
//   3. Registriere ihn hier mit registerRechner().
//
// Die UI rendert alle registrierten Rechner generisch.

const registry = new Map<string, Rechner<unknown>>();

export function registerRechner<T>(rechner: Rechner<T>): void {
  registry.set(rechner.id, rechner as Rechner<unknown>);
}

export function getRechner(id: string): Rechner<unknown> | undefined {
  return registry.get(id);
}

export function alleRechner(): Rechner<unknown>[] {
  return Array.from(registry.values());
}
