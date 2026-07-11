import { describe, it, expect } from 'vitest';
import { levenshtein, meinenSie } from '../lib/suche/vorschlag';

// Deterministischer «Meinten Sie …?»-Vorschlag (UI-NAV S3). Rein, ohne LLM.

describe('levenshtein', () => {
  it.each([
    ['', '', 0],
    ['abc', 'abc', 0],
    ['verjarung', 'verjahrung', 1],
    ['kündigung', 'kundigung', 1],
    ['abc', 'xyz', 3],
  ])('%s vs %s → %i', (a, b, d) => {
    expect(levenshtein(a, b)).toBe(d);
  });

  it('Früh-Abbruch: Distanz über der Schranke liefert Schranke+1', () => {
    expect(levenshtein('abcdef', 'uvwxyz', 2)).toBe(3);
  });
});

describe('meinenSie', () => {
  const kandidaten = ['Verjährung', 'Kündigung', 'Streitwert', 'OR', 'Mietrecht'];

  it('korrigiert einen nahen Tippfehler (Distanz ≤ Schwelle)', () => {
    expect(meinenSie('Verjärung', kandidaten)).toBe('Verjährung');
    expect(meinenSie('Kündignug', kandidaten)).toBe('Kündigung');
  });

  it('gibt die ANZEIGE-Form des Kandidaten zurück (Grossschreibung erhalten)', () => {
    expect(meinenSie('streitwrt', kandidaten)).toBe('Streitwert');
  });

  it('kein Vorschlag, wenn die Eingabe SELBST ein Kandidat ist', () => {
    expect(meinenSie('Verjährung', kandidaten)).toBeNull();
    expect(meinenSie('mietrecht', kandidaten)).toBeNull();
  });

  it('kein Vorschlag bei zu kurzer Eingabe (< 4 Zeichen)', () => {
    expect(meinenSie('or', kandidaten)).toBeNull();
    expect(meinenSie('ab', kandidaten)).toBeNull();
  });

  it('kein Vorschlag, wenn nichts nahe genug liegt', () => {
    expect(meinenSie('xylophon', kandidaten)).toBeNull();
  });

  it('bei Gleichstand gewinnt der erste Kandidat (deterministisch)', () => {
    // «haus» ist zu «Maus» und «Laus» je Distanz 1 — der erste gewinnt.
    expect(meinenSie('haus', ['Maus', 'Laus'])).toBe('Maus');
  });
});
