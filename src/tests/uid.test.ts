// ─── UID-Normalisierung & eCH-0097-Prüfziffer (Zefix-Etappe Z1) ────────────
import { describe, expect, it } from 'vitest';
import { uidGueltig, uidNormalisieren } from '../lib/uid';

describe('uidNormalisieren', () => {
  it('akzeptiert alle gängigen Schreibweisen → kanonische Form', () => {
    for (const e of ['CHE-105.829.940', 'CHE105829940', '105.829.940', 'che 105 829 940', '105829940']) {
      expect(uidNormalisieren(e), e).toBe('CHE-105.829.940');
    }
  });
  it('verwirft falsche Längen/Zeichen', () => {
    for (const e of ['', 'CHE-105.829.94', 'CHE-105.829.9400', 'CHF-105.829.940', '10582994O']) {
      expect(uidNormalisieren(e), e).toBeNull();
    }
  });
});

describe('uidGueltig (Mod-11, Gewichte 5,4,3,2,7,6,5,4)', () => {
  it('Handprobe CHE-105.829.940 (Migros-Genossenschafts-Bund, Zefix-verifiziert 11.6.2026): Summe 165 → Rest 11 → Prüfziffer 0', () => {
    expect(uidGueltig('CHE-105.829.940')).toBe(true);
  });
  it('gekippte Prüfziffer und Zifferndreher fallen durch', () => {
    expect(uidGueltig('CHE-105.829.941')).toBe(false);
    expect(uidGueltig('CHE-105.892.940')).toBe(false);
  });
  it('leer/Unform ist nicht gültig', () => {
    expect(uidGueltig('')).toBe(false);
    expect(uidGueltig('CHE')).toBe(false);
  });
});
