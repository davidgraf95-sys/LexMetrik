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
});
