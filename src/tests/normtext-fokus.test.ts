import { describe, it, expect } from 'vitest';
import { naechsterFokus } from '../lib/normtext/fokus';

describe('naechsterFokus', () => {
  // Vorwärts (Tab)
  it('vorwärts in der Mitte → +1', () => {
    expect(naechsterFokus(4, 1, false)).toBe(2);
  });
  it('vorwärts vom letzten → wrappt auf das erste (zyklisch)', () => {
    expect(naechsterFokus(4, 3, false)).toBe(0);
  });
  it('vorwärts ohne Treffer (aktiv = -1) → erstes Element', () => {
    expect(naechsterFokus(4, -1, false)).toBe(0);
  });

  // Rückwärts (Shift+Tab)
  it('rückwärts in der Mitte → -1', () => {
    expect(naechsterFokus(4, 2, true)).toBe(1);
  });
  it('rückwärts vom ersten → wrappt auf das letzte (zyklisch)', () => {
    expect(naechsterFokus(4, 0, true)).toBe(3);
  });
  it('rückwärts ohne Treffer (aktiv = -1) → letztes Element', () => {
    expect(naechsterFokus(4, -1, true)).toBe(3);
  });

  // Einzelnes Element
  it('ein Element, vorwärts → bleibt auf 0', () => {
    expect(naechsterFokus(1, 0, false)).toBe(0);
  });
  it('ein Element, rückwärts → bleibt auf 0', () => {
    expect(naechsterFokus(1, 0, true)).toBe(0);
  });

  // Leere Liste robust
  it('leere Liste, vorwärts → -1', () => {
    expect(naechsterFokus(0, -1, false)).toBe(-1);
  });
  it('leere Liste, rückwärts → -1', () => {
    expect(naechsterFokus(0, -1, true)).toBe(-1);
  });
});
