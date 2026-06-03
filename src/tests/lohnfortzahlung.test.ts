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

describe('Lohnfortzahlung P1/P2 (Art. 324a OR)', () => {
  // §7.10 – Verhinderung über Dienstjahreswechsel → beide Kredite
  it('§7.10: Verhinderung über DJ-Wechsel → zwei Kredite', () => {
    const r = berechneLohnfortzahlung({
      vertragsbeginn: '2024-01-01',
      verhinderungBeginn: '2025-12-01',  // dj2 (Basler: 2 Monate)
      verhinderungEnde: '2026-06-01',    // reicht über Jahrestag 01.01.2026
      arbeitsunfaehigkeitProzent: 100,
      kanton: 'BS',
      ktgGleichwertigVorhanden: false,
    });
    expect(r.status).toBe('ok');
    expect(r.ergebnis).toContain('2. Kredit');
    expect(r.ergebnis).toContain('28.02.2026'); // 2. Kredit (dj3, 2 Monate) ab 01.01.2026
  });

  // §7.11 – Kredit im Vorjahr verbraucht → Anspruch lebt im neuen DJ wieder auf
  it('§7.11: Kredit verbraucht, neues DJ → Anspruch lebt auf', () => {
    const r = berechneLohnfortzahlung({
      vertragsbeginn: '2024-01-01',
      verhinderungBeginn: '2025-09-01',  // 1. Kredit endet 31.10.2025 (vor Jahrestag)
      verhinderungEnde: '2026-06-01',
      arbeitsunfaehigkeitProzent: 100,
      kanton: 'BS',
      ktgGleichwertigVorhanden: false,
    });
    expect(r.status).toBe('ok');
    expect(r.ergebnis).toContain('01.01.2026'); // 2. Kredit ab Jahrestag
    expect(r.ergebnis).toContain('28.02.2026');
  });

  // §7.12 – Unbefristet, KF ≤ 3 Monate, Verhinderung in Monat 2 → kein Lohn bis Ablauf 3 Monate
  it('§7.12: Kündigungsfrist ≤ 3 Monate, Verhinderung in Monat 2 → kein_anspruch', () => {
    const r = berechneLohnfortzahlung({
      vertragsbeginn: '2026-01-01',
      verhinderungBeginn: '2026-02-15',
      arbeitsunfaehigkeitProzent: 100,
      kanton: 'BS',
      ktgGleichwertigVorhanden: false,
      vereinbarteKuendigungsfristMonate: 2, // ≤ 3
    });
    expect(r.status).toBe('kein_anspruch');
  });

  // §7.13 – Befristet fest > 3 Monate, Verhinderung in Woche 2 → Anspruch ab Tag 1
  it('§7.13: Befristet fest > 3 Monate, Verhinderung in Woche 2 → Anspruch', () => {
    const r = berechneLohnfortzahlung({
      vertragsbeginn: '2026-01-01',
      verhinderungBeginn: '2026-01-08',
      arbeitsunfaehigkeitProzent: 100,
      kanton: 'BS',
      ktgGleichwertigVorhanden: false,
      befristetFest: true,
    });
    expect(r.status).toBe('ok');
  });

  // §7.14 – Teil-AUF 50 % → doppelte Kalenderdauer, gleicher CHF-Kredit (Geldminimum)
  it('§7.14: Teil-AUF 50 % → doppelte Kalenderdauer (Geldminimum)', () => {
    const r = berechneLohnfortzahlung({
      vertragsbeginn: '2024-01-01',
      verhinderungBeginn: '2026-01-15',   // BS dj3 → 2 Monate
      arbeitsunfaehigkeitProzent: 50,
      kanton: 'BS',
      ktgGleichwertigVorhanden: false,
      monatslohnBrutto: 6000,
    });
    expect(r.status).toBe('ok');
    expect(r.ergebnis).toContain('4 Monate'); // 2 Monate ÷ 0.5
    expect(r.rechenweg.some((s) => s.beschreibung.includes('Geld- statt Zeitminimum'))).toBe(true);
  });

  // §7.15 – Teilzeit 60 % + AUF 50 % → Pensum und AUF getrennt
  it('§7.15: Teilzeit 60 % + AUF 50 % → getrennte Grössen im Rechenweg', () => {
    const r = berechneLohnfortzahlung({
      vertragsbeginn: '2024-01-01',
      verhinderungBeginn: '2026-01-15',
      arbeitsunfaehigkeitProzent: 50,
      pensumProzent: 60,
      kanton: 'BS',
      ktgGleichwertigVorhanden: false,
    });
    expect(r.status).toBe('ok');
    expect(r.rechenweg.some((s) => s.zwischenergebnis.includes('Beschäftigungsgrad 60'))).toBe(true);
  });

  // §7.16 – DJ > 11 → verifiziert: false, Fortschreibung markiert
  it('§7.16: DJ > 11 → Warnung «nicht belegt»', () => {
    const r = berechneLohnfortzahlung({
      vertragsbeginn: '2010-01-01',
      verhinderungBeginn: '2026-01-15',  // 17. DJ
      arbeitsunfaehigkeitProzent: 100,
      kanton: 'BS',
      ktgGleichwertigVorhanden: false,
    });
    expect(r.status).toBe('ok');
    expect(r.warnungen.some((w) => w.includes('nicht belegt'))).toBe(true);
  });
});

describe('Lohnfortzahlung – Koordination Art. 324b OR (Verhinderungsgrund)', () => {
  const ok = (over: object) => berechneLohnfortzahlung({
    vertragsbeginn: '2024-01-01', verhinderungBeginn: '2026-01-01',
    arbeitsunfaehigkeitProzent: 100, kanton: 'BS', ktgGleichwertigVorhanden: false, ...over,
  });

  it('Unfall → UVG-Koordination (80%, 2 Karenztage), Art. 324b im Rechenweg', () => {
    const r = ok({ verhinderungsgrund: 'unfall' });
    expect(r.status).toBe('ok');
    expect(r.ergebnis).toContain('Karenztage');
    expect(r.rechenweg.some((s) => s.beschreibung.includes('Koordination Unfall'))).toBe(true);
    expect(r.normverweise.some((n) => n.artikel === 'Art. 324b Abs. 1 OR')).toBe(true);
  });

  it('Dienst → EO-Koordination (Differenz zu 80%), Art. 324b', () => {
    const r = ok({ verhinderungsgrund: 'dienst' });
    expect(r.rechenweg.some((s) => s.beschreibung.includes('Koordination Dienst'))).toBe(true);
    expect(r.normverweise.some((n) => n.artikel === 'Art. 324b Abs. 2 OR')).toBe(true);
  });

  it('Schwangerschaft → Art. 324a Abs. 3 + EOG-Hinweis', () => {
    const r = ok({ verhinderungsgrund: 'schwangerschaft' });
    expect(r.ergebnis).toContain('EOG');
    expect(r.rechenweg.some((s) => s.normen.some((n) => n.artikel === 'Art. 324a Abs. 3 OR'))).toBe(true);
  });

  it('Krankheit (Default) → keine 324b-Koordination, Basis-Ergebnis unverändert', () => {
    const r = ok({ verhinderungsgrund: 'krankheit' });
    expect(r.ergebnis).toContain('Lohnfortzahlung bis und mit');
    expect(r.normverweise.some((n) => n.artikel.startsWith('Art. 324b'))).toBe(false);
  });
});
