import { describe, it, expect } from 'vitest';
import { berechneLohnfortzahlung } from '../lib/lohnfortzahlung';

describe('Lohnfortzahlung (Art. 324a OR)', () => {
  // LA1 – Basler Skala, 1. DJ, 100%, ab 01.01.2026 → letzter bezahlter Tag 21.01.2026
  it('LA1: BS 1.DJ 100% ab 01.01.2026 → letzter bezahlter Tag 21.01.2026', () => {
    const result = berechneLohnfortzahlung({
      vertragsbeginn: '2025-09-01',          // > 3 Monate, 1. DJ
      verhinderungBeginn: '2026-01-01',
      arbeitsunfaehigkeitProzent: 100,
      kanton: 'BS',
      ktgGleichwertigVorhanden: false,
    });
    expect(result.status).toBe('ok');
    expect(result.ergebnis).toContain('21.01.2026');
  });

  // LA2 – Basler Skala, 3. DJ, 100% → 2 Monate
  it('LA2: BS 3.DJ 100% → Basler Skala 2 Monate', () => {
    const result = berechneLohnfortzahlung({
      vertragsbeginn: '2024-01-01',          // 3. DJ in 2026
      verhinderungBeginn: '2026-01-15',
      arbeitsunfaehigkeitProzent: 100,
      kanton: 'BS',
      ktgGleichwertigVorhanden: false,
    });
    expect(result.status).toBe('ok');
    expect(result.ergebnis).toContain('Monat');
    // Letzter bezahlter Tag: 15.01.2026 + 2 Monate - 1 = 14.03.2026
    expect(result.ergebnis).toContain('14.03.2026');
  });

  // LA3 – Basler Skala, 1. DJ, 50% ab 17.06.2026 → 6 Wochen (Budget-Modell)
  it('LA3: BS 1.DJ 50% ab 17.06.2026 → 6 Wochen Budget-Modell', () => {
    const result = berechneLohnfortzahlung({
      vertragsbeginn: '2026-01-01',          // 1. DJ, > 3 Monate bis Jun
      verhinderungBeginn: '2026-06-17',
      arbeitsunfaehigkeitProzent: 50,
      kanton: 'BS',
      ktgGleichwertigVorhanden: false,
    });
    expect(result.status).toBe('ok');
    expect(result.ergebnis).toContain('6 Wochen');
  });

  // LA4 – AV-Dauer < 3 Monate → kein_anspruch
  it('LA4: AV-Dauer < 3 Monate → kein_anspruch', () => {
    const result = berechneLohnfortzahlung({
      vertragsbeginn: '2026-01-01',
      verhinderungBeginn: '2026-03-01',       // 2 Monate, keine vollen 3 Monate
      arbeitsunfaehigkeitProzent: 100,
      kanton: 'ZH',
      ktgGleichwertigVorhanden: false,
    });
    expect(result.status).toBe('kein_anspruch');
  });

  // LA5 – KTG gleichwertig → ktg_regime, keine Skala
  it('LA5: ktgGleichwertigVorhanden=true → ktg_regime, keine Skalen-Berechnung', () => {
    const result = berechneLohnfortzahlung({
      vertragsbeginn: '2024-01-01',
      verhinderungBeginn: '2026-01-01',
      arbeitsunfaehigkeitProzent: 100,
      kanton: 'ZH',
      ktgGleichwertigVorhanden: true,
    });
    expect(result.status).toBe('ktg_regime');
    expect(result.ergebnis).toContain('KTG');
    // Kein Skalaeintrag im Rechenweg
    expect(result.rechenweg.some((s) => s.beschreibung.includes('Skala-Dauer ablesen'))).toBe(false);
  });

  // Edge case: Kanton ZH, Zürcher Skala, 2. DJ → 8 Wochen
  it('ZH 2.DJ → 8 Wochen', () => {
    const result = berechneLohnfortzahlung({
      vertragsbeginn: '2025-01-01',
      verhinderungBeginn: '2026-01-15',
      arbeitsunfaehigkeitProzent: 100,
      kanton: 'ZH',
      ktgGleichwertigVorhanden: false,
    });
    expect(result.status).toBe('ok');
    expect(result.ergebnis).toContain('8 Wochen');
  });

  // Edge case: Kanton BE, 5. DJ → 3 Monate
  it('BE 5.DJ → 3 Monate Berner Skala', () => {
    const result = berechneLohnfortzahlung({
      vertragsbeginn: '2021-01-01',
      verhinderungBeginn: '2026-01-15',
      arbeitsunfaehigkeitProzent: 100,
      kanton: 'BE',
      ktgGleichwertigVorhanden: false,
    });
    expect(result.status).toBe('ok');
    expect(result.ergebnis).toContain('3 Monate');
  });
});
