import { describe, it, expect } from 'vitest';
import { gruppiereTausender } from '../lib/normtext/darstellung';

// Stufe-2-D (22.6.2026): Schweizer Tausender-Apostrophe in der Betrag-Spalte
// der TarifTabelle. Zeichen: U+0027 (gerader Apostroph) — übereinstimmend mit
// den Fedlex-/LexWork-Snapshots selbst (z. B. «10'000» in BS-154.810.json).

describe('gruppiereTausender (§1: nur Gruppierung, §3: reine Darstellung)', () => {
  it('fügt Apostroph in 4-stellige Zahl ein: 2000.— → 2\'000.—', () => {
    expect(gruppiereTausender("2000.—")).toBe("2'000.—");
  });

  it('fügt Apostroph nur vor dem ≥4-stelligen Lauf ein: 150.— bis 2000.— → 150.— bis 2\'000.—', () => {
    expect(gruppiereTausender('150.— bis 2000.—')).toBe("150.— bis 2'000.—");
  });

  it('lässt Nicht-Zahlzeichen (Gedankenstrich, Komma) unberührt: —.50 → —.50', () => {
    expect(gruppiereTausender('—.50')).toBe('—.50');
  });

  it('gruppiert 5-stellige Zahl: 10000 → 10\'000', () => {
    expect(gruppiereTausender('10000')).toBe("10'000");
  });

  it('gruppiert 7-stellige Zahl mit zwei Apostrophen: 2000000 → 2\'000\'000', () => {
    expect(gruppiereTausender('2000000')).toBe("2'000'000");
  });

  it('ist idempotent: bereits gruppierte Zahl bleibt unverändert: 2\'000 → 2\'000', () => {
    // Kein \d{4,}-Match, weil Apostroph die Folge unterbricht
    expect(gruppiereTausender("2'000")).toBe("2'000");
  });

  it('lässt 3-stellige Zahl unverändert: 500 → 500', () => {
    expect(gruppiereTausender('500')).toBe('500');
  });

  it('groupiert Bereichsangabe: Fr. 1000 bis Fr. 50000 → Fr. 1\'000 bis Fr. 50\'000', () => {
    expect(gruppiereTausender('Fr. 1000 bis Fr. 50000')).toBe("Fr. 1'000 bis Fr. 50'000");
  });

  it('leerer String bleibt leer', () => {
    expect(gruppiereTausender('')).toBe('');
  });

  // Issue 2 (22.6.2026): Leerzeichen-getrennte Tausender (ZH-PDF-Stil)
  it('«5 000» → «5\'000» (ZH-PDF Leerzeichen-Tausender)', () => {
    expect(gruppiereTausender('5 000')).toBe("5'000");
  });

  it('«1 250» → «1\'250» (ZH-PDF Leerzeichen-Tausender)', () => {
    expect(gruppiereTausender('1 250')).toBe("1'250");
  });

  it('«10 000» → «10\'000» (ZH-PDF Leerzeichen-Tausender)', () => {
    expect(gruppiereTausender('10 000')).toBe("10'000");
  });

  it('«106 400» → «106\'400» (ZH-PDF Leerzeichen-Tausender, Issue 1-Grundgebühr)', () => {
    expect(gruppiereTausender('106 400')).toBe("106'400");
  });

  it('«über 10 Mio.» bleibt UNVERÄNDERT (kein 3-Ziffern-Muster nach Leerzeichen)', () => {
    expect(gruppiereTausender('über 10 Mio.')).toBe('über 10 Mio.');
  });

  it('«mind. aber Fr. 100» bleibt UNVERÄNDERT (kein digit+space+3digits-Muster)', () => {
    expect(gruppiereTausender('mind. aber Fr. 100')).toBe('mind. aber Fr. 100');
  });

  it('«2000.—» → «2\'000.—» (bestehende SG-Logik, unverändert)', () => {
    expect(gruppiereTausender('2000.—')).toBe("2'000.—");
  });

  it('Ketten «1 234 567» → «1\'234\'567» (chained Leerzeichen-Gruppen, wiederholt bis stabil)', () => {
    expect(gruppiereTausender('1 234 567')).toBe("1'234'567");
  });

  it('«über 5 000 bis 10 000» → «über 5\'000 bis 10\'000» (Streitwert-Spalte ZH)', () => {
    expect(gruppiereTausender('über 5 000 bis 10 000')).toBe("über 5'000 bis 10'000");
  });
});
