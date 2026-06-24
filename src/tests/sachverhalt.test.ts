import { describe, it, expect } from 'vitest';
import { teileSachverhalt, entrauscheSachverhalt } from '../lib/rechtsprechung/sachverhalt';

const W = (s: string) => s.replace(/\s+/g, ' ').trim();
const rekon = (bl: { marke: string | null; text: string }[]) =>
  W(bl.map((b) => (b.marke ? `${b.marke} ` : '') + b.text).join(' '));

describe('entrauscheSachverhalt', () => {
  it('entfernt Kolumnentitel „BGE … S. NN" und „ab Seite NN"', () => {
    expect(entrauscheSachverhalt('ab Seite 93 BGE 152 III 92 S. 93 A.a Text BGE 152 III 92 S. 94 weiter'))
      .toBe('A.a Text weiter');
  });
});

describe('teileSachverhalt — sicheres Sub-Marker-Splitting', () => {
  it('teilt an A.a/A.b/B.a und behält den Top-Buchstaben im Label', () => {
    const t = 'A. A.a Am 10. März 2023 stellte die A. mbH ein Gesuch. A.b In Prosequierung setzte sie. B. B.a Am 31. Juli 2024 verlangte sie Fortsetzung.';
    const bl = teileSachverhalt(t);
    expect(bl.filter((b) => b.marke).map((b) => b.marke)).toEqual(['A.a', 'A.b', 'B.a']);
    expect(bl.find((b) => b.marke === 'A.a')!.text).toMatch(/^Am 10\. März/);
  });

  it('ist wortinvariant (Marker+Text rekonstruieren den entrauschten Text)', () => {
    const t = 'BGE 150 III 1 S. 2 A. A.a Erstens geschah dies. A.b Zweitens jenes. B. B.a Drittens das.';
    const bl = teileSachverhalt(t);
    expect(rekon(bl)).toBe(W(entrauscheSachverhalt(t)));
  });

  it('splittet NICHT an Firmen-/Parteinamen (A. mbH, B. Pte Ltd, B.A.)', () => {
    // Nur EIN echter Sub-Marker (A.a) → unter der Schwelle → Fallback EIN Block, kein Fehl-Split an „B. Pte Ltd".
    const t = 'A. A.a Die A. mbH und die B. Pte Ltd sowie B.A. sind Parteien.';
    const bl = teileSachverhalt(t);
    expect(bl).toHaveLength(1);
    expect(bl[0].marke).toBeNull();
  });

  it('Sequenz-Gate: Sub muss bei a beginnen und lückenlos sein', () => {
    // „C.c" ohne C.a/C.b wird nicht als Marker akzeptiert.
    const t = 'A.a Erstes. A.b Zweites. C.c Spielt keine Rolle hier weiter.';
    const bl = teileSachverhalt(t);
    expect(bl.filter((b) => b.marke).map((b) => b.marke)).toEqual(['A.a', 'A.b']);
  });

  it('Fallback: ohne ≥2 valide Sub-Marker EIN markenloser Block', () => {
    const bl = teileSachverhalt('Ein durchgehender Sachverhalt ohne Buchstaben-Gliederung.');
    expect(bl).toHaveLength(1);
    expect(bl[0].marke).toBeNull();
  });

  it('leerer Text → leere Block-Liste', () => {
    expect(teileSachverhalt('')).toEqual([]);
  });
});
