import { describe, it, expect } from 'vitest';
import { betragAmAnfang } from '../../scripts/normtext/tarif-tabelle.ts';

describe('betragAmAnfang', () => {
  it('liest einfache Beträge (em-/en-dash)', () => {
    expect(betragAmAnfang('30.—')).toEqual({ betrag: '30.—', rest: '' });
    expect(betragAmAnfang('150.– bis 2000.–')).toEqual({ betrag: '150.– bis 2000.–', rest: '' });
  });
  it('liest Rappen-Beträge «—.50»', () => {
    expect(betragAmAnfang('—.50')).toEqual({ betrag: '—.50', rest: '' });
  });
  it('liest «bis»-Spanne und gibt Folgetext als rest', () => {
    expect(betragAmAnfang('100.— bis 1000.— 22.60 Aufsichtsrechtliche Verfügungen'))
      .toEqual({ betrag: '100.— bis 1000.—', rest: '22.60 Aufsichtsrechtliche Verfügungen' });
  });
  it('gibt null bei Nicht-Geld-Anfang', () => {
    expect(betragAmAnfang('Vollmachten und Erklärungen')).toBeNull();
  });
  it('gibt null bei Zahlen ohne Dezimal-Dash (Guard-Test)', () => {
    expect(betragAmAnfang('2 Promille des Erwerbspreises')).toBeNull();
  });
});
