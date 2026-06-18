import { describe, it, expect } from 'vitest';
import { markeNorm, absatzNorm, bestimmePassusZiel } from '../lib/normtext/passusZiel';
import type { NormSnapshot } from '../lib/normtext/typen';

describe('markeNorm', () => {
  it('säubert die Ränder (Punkte/Klammern/Whitespace), behält innere Suffixe', () => {
    expect(markeNorm('a)')).toBe('a');
    expect(markeNorm('(a)')).toBe('a');
    expect(markeNorm('17.')).toBe('17');
    expect(markeNorm(' b ')).toBe('b');
    expect(markeNorm('5a')).toBe('5a');
    expect(markeNorm('BIS')).toBe('bis');
  });
});

describe('absatzNorm', () => {
  it('strippt nachgestellte Punkte/Whitespace, null bleibt null', () => {
    expect(absatzNorm('1.')).toBe('1');
    expect(absatzNorm('2')).toBe('2');
    expect(absatzNorm(null)).toBeNull();
  });
});

const bloecke: NormSnapshot['bloecke'] = [
  {
    absatz: '1', text: 'Erster Absatz:',
    items: [
      { marke: '1', text: 'erste Ziffer im ersten Absatz;' },
      { marke: '2', text: 'zweite Ziffer im ersten Absatz;' },
    ],
  },
  {
    absatz: '2', text: 'Zweiter Absatz:',
    items: [
      { marke: '1', text: 'erste Ziffer im zweiten Absatz;' },
      { marke: '2', text: 'zweite Ziffer im zweiten Absatz;' },
    ],
  },
];

describe('bestimmePassusZiel', () => {
  it('nur Absatz zitiert → hervorBlock gesetzt, kein Item', () => {
    const z = bestimmePassusZiel(bloecke, { absatz: '2' });
    expect(z.passusMarke).toBeNull();
    expect(z.zielItemKey).toBeNull();
    expect(z.hervorBlock?.text).toBe('Zweiter Absatz:');
    expect(z.hervorItem).toBeUndefined();
  });

  it('absatz null → nichts hervorgehoben', () => {
    const z = bestimmePassusZiel(bloecke, { absatz: null });
    expect(z.hervorBlock).toBeUndefined();
    expect(z.zielItemKey).toBeNull();
  });

  it('lit/ziff zitiert mit Absatz → genau das Item im Block', () => {
    const z = bestimmePassusZiel(bloecke, { absatz: '2', ziff: '1' });
    expect(z.passusMarke).toBe('1');
    expect(z.zielItemKey).toEqual({ bi: 1, ji: 0 });
    expect(z.hervorItem?.text).toBe('erste Ziffer im zweiten Absatz;');
  });

  it('Marke ohne Absatz, in zwei Blöcken → ERSTES Item (B1)', () => {
    const z = bestimmePassusZiel(bloecke, { absatz: null, ziff: '1' });
    expect(z.zielItemKey).toEqual({ bi: 0, ji: 0 });
    expect(z.hervorItem?.text).toBe('erste Ziffer im ersten Absatz;');
  });

  it('Absatz mit Punkt im Snapshot matcht Zitat ohne Punkt', () => {
    const mitPunkt: NormSnapshot['bloecke'] = [{ absatz: '1.', text: 'Punkt-Absatz' }];
    const z = bestimmePassusZiel(mitPunkt, { absatz: '1' });
    expect(z.hervorBlock?.text).toBe('Punkt-Absatz');
  });
});
