/**
 * R12A (D22 Ziff. 5) · KERNERLASSE — DIE ZEILE VERSPRICHT NUR, WAS ES GIBT.
 *
 * Die Übersicht /gesetze führt die zehn Erlasse, die eine Kanzlei täglich
 * aufschlägt, als Link-Zeile direkt unter dem Filter (R12 «Wege verkürzen»:
 * Kernerlass in EINEM Klick). Geführt werden im Code nur die SCHLÜSSEL —
 * Kürzel, Titel und Adresse kommen aus dem Register bzw. aus
 * `erlassPfadVonKey` (§5, keine zweite Erlass-Liste).
 *
 * Das hat eine Kehrseite, die dieser Wächter abfängt: ein Schlüssel, den das
 * Register nicht kennt, fällt still aus der Zeile (besser als ein Link ins
 * Leere, §8) — und niemand würde es merken. Beim Bau war genau das der Fall:
 * die naheliegenden Schreibweisen «StGB», «StPO», «SchKG», «VwVG» stehen im
 * Register als «STGB», «STPO», «SCHKG», «VWVG» (Kürzel ≠ Schlüssel). Mit
 * diesen vier Schreibweisen ist der Test rot (§6.7 — Rot-Probe 6.9.2026:
 * «expected 10 … received 6»).
 */
import { describe, it, expect } from 'vitest';
import { kernerlasse } from '../components/gesetze/kernerlasse';

const ERWARTET = ['OR', 'ZGB', 'ZPO', 'StGB', 'StPO', 'SchKG', 'BV', 'DBG', 'VwVG', 'BGG'];

describe('R12A — Kernerlass-Zeile auf /gesetze', () => {
  it('führt genau die zehn Kernerlasse, in der gebauten Reihenfolge', () => {
    expect(kernerlasse().map((e) => e.kuerzel)).toEqual(ERWARTET);
  });

  it('verlinkt jeden über die EINE Ableitung (§5) auf seine Bundes-Adresse', () => {
    for (const e of kernerlasse()) {
      expect(e.pfad, `${e.kuerzel} muss unter /gesetze/bund/<key> liegen`).toBe(`/gesetze/bund/${e.key}`);
      expect(e.titel.length, `${e.kuerzel} ohne Titel — der Tooltip wäre leer`).toBeGreaterThan(0);
    }
  });
});
