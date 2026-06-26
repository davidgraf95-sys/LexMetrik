import { describe, it, expect } from 'vitest';
import { aktiverArtikel } from '../lib/normtext/aktuellerArtikel';

// Reine Auswahl des zentrierten Artikels (Auftrag David 26.6.2026, P2/P9).
describe('aktiverArtikel', () => {
  it('leere Eingabe → null', () => {
    expect(aktiverArtikel([], 400)).toBeNull();
  });

  it('Mitte liegt IM Intervall → dieser Artikel', () => {
    const rects = [
      { token: '1', top: -200, bottom: 100 },
      { token: '2', top: 100, bottom: 600 }, // enthält 400
      { token: '3', top: 600, bottom: 900 },
    ];
    expect(aktiverArtikel(rects, 400)).toBe('2');
  });

  it('Mitte zwischen zwei Artikeln → der näher gelegene', () => {
    const rects = [
      { token: '1', top: -300, bottom: 380 }, // Unterkante 20px über der Mitte
      { token: '2', top: 460, bottom: 900 },  // Oberkante 60px unter der Mitte
    ];
    expect(aktiverArtikel(rects, 400)).toBe('1');
  });

  it('alle oberhalb der Mitte → der unterste (kleinste Distanz)', () => {
    const rects = [
      { token: '1', top: -500, bottom: -300 },
      { token: '2', top: -280, bottom: -50 },
    ];
    expect(aktiverArtikel(rects, 400)).toBe('2');
  });

  it('alle unterhalb der Mitte → der oberste (kleinste Distanz)', () => {
    const rects = [
      { token: '5', top: 500, bottom: 700 },
      { token: '6', top: 720, bottom: 900 },
    ];
    expect(aktiverArtikel(rects, 400)).toBe('5');
  });

  it('Gleichstand → erster in Dokument-Reihenfolge (deterministisch)', () => {
    const rects = [
      { token: 'a', top: 500, bottom: 600 }, // Distanz 100
      { token: 'b', top: 200, bottom: 300 }, // Distanz 100
    ];
    expect(aktiverArtikel(rects, 400)).toBe('a');
  });

  it('Token mit Buchstaben-Suffix bleibt unverändert', () => {
    expect(aktiverArtikel([{ token: '335_c', top: 100, bottom: 500 }], 300)).toBe('335_c');
  });
});
