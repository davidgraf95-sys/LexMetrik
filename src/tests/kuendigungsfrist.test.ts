import { describe, it, expect } from 'vitest';
import { format } from 'date-fns';
import { berechneKuendigungsfrist } from '../lib/kuendigungsfrist';
import { berechneSperrfristen } from '../lib/sperrfristen';

// Local-time date string to avoid UTC offset issues with toISOString()
function ds(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

describe('Kündigungsfrist (Art. 335c OR)', () => {
  // T1 – Probezeit: Beginn 01.01.2026, 1 Monat, Zugang 20.01.2026 → 27.01.2026
  it('T1: Probezeit 1 Monat, Zugang 20.01.2026 → Beendigung 27.01.2026', () => {
    const result = berechneKuendigungsfrist({
      vertragsbeginn: '2026-01-01',
      zugangKuendigung: '2026-01-20',
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      kuendigungsterminMonatsende: true,
    });
    expect(result.istProbezeit).toBe(true);
    expect(result.ergebnis.status).toBe('ok');
    expect(result.beendigungsdatum).toBeDefined();
    expect(ds(result.beendigungsdatum!)).toBe('2026-01-27');
  });

  // T2 – 1. DJ: Beginn 01.03.2025, Zugang 15.04.2025, AG → 31.05.2025
  it('T2: 1.DJ AG Zugang 15.04.2025 → Beendigung 31.05.2025', () => {
    const result = berechneKuendigungsfrist({
      vertragsbeginn: '2025-03-01',
      zugangKuendigung: '2025-04-15',
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      kuendigungsterminMonatsende: true,
    });
    expect(result.istProbezeit).toBe(false);
    expect(result.fristMonate).toBe(1);
    expect(ds(result.beendigungsdatum!)).toBe('2025-05-31');
  });

  // T3 – 3. DJ: Beginn 01.01.2023, Zugang 15.04.2025, AG → 30.06.2025
  it('T3: 3.DJ AG Zugang 15.04.2025 → Beendigung 30.06.2025', () => {
    const result = berechneKuendigungsfrist({
      vertragsbeginn: '2023-01-01',
      zugangKuendigung: '2025-04-15',
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      kuendigungsterminMonatsende: true,
    });
    expect(result.fristMonate).toBe(2);
    expect(ds(result.beendigungsdatum!)).toBe('2025-06-30');
  });

  // Edge case: 10. DJ → 3 Monate
  it('10.DJ → 3 Monate Frist', () => {
    const result = berechneKuendigungsfrist({
      vertragsbeginn: '2015-01-01',
      zugangKuendigung: '2025-04-15',
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      kuendigungsterminMonatsende: true,
    });
    expect(result.fristMonate).toBe(3);
    expect(ds(result.beendigungsdatum!)).toBe('2025-07-31');
  });

  // Parität: abweichende Frist kürzer als gesetzlich → gesetzliche gilt
  it('Abweichende Frist kürzer als gesetzlich → gesetzliche gilt + Warnung', () => {
    const result = berechneKuendigungsfrist({
      vertragsbeginn: '2023-01-01',
      zugangKuendigung: '2025-04-15',
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      abweichendeFristMonate: 1,      // kürzer als gesetzlich (2 Monate für 3.DJ)
      kuendigungsterminMonatsende: true,
    });
    expect(result.fristMonate).toBe(2); // gesetzliche gilt
    expect(result.ergebnis.warnungen.some((w) => w.includes('unterschreitet'))).toBe(true);
  });

  // Letzter Tag des Monats als Zugangsdatum
  it('Zugang am 31.03.2025 (Monatsende) → Frist läuft korrekt', () => {
    const result = berechneKuendigungsfrist({
      vertragsbeginn: '2020-01-01',
      zugangKuendigung: '2025-03-31',
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      kuendigungsterminMonatsende: true,
    });
    expect(result.fristMonate).toBe(2);
    // addMonths(31.03.2025, 2) = 31.05.2025 → Monatsende = 31.05.2025
    expect(ds(result.beendigungsdatum!)).toBe('2025-05-31');
  });

  // Februar-Edge: Zugang 31.01 + 1 Monat → Monatsende Feb
  it('Zugang 31.01.2025 + 1 Monat → 28.02.2025', () => {
    const result = berechneKuendigungsfrist({
      vertragsbeginn: '2025-01-01',
      zugangKuendigung: '2025-01-31',
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 0,
      kuendigungsterminMonatsende: true,
    });
    expect(result.fristMonate).toBe(1);
    expect(ds(result.beendigungsdatum!)).toBe('2025-02-28');
  });

  // §7.17 – Vertraglich kürzere Frist (≥ 1 Monat, schriftlich) → gilt, nicht angehoben
  it('§7.17: Gültig vereinbarte kürzere Frist (1 Monat, schriftlich) gilt', () => {
    const result = berechneKuendigungsfrist({
      vertragsbeginn: '2023-01-01',
      zugangKuendigung: '2025-04-15',     // dj3 → gesetzlich 2 Monate
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      abweichendeFristMonate: 1,
      abweichendeFristFormGueltig: true,
      kuendigungsterminMonatsende: true,
    });
    expect(result.fristMonate).toBe(1); // NICHT auf 2 angehoben
  });

  // §7.18 – Verkürzung < 1 Monat ohne GAV → unzulässig, gesetzliche Frist + Warnung
  it('§7.18: Verkürzung < 1 Monat ohne GAV → gesetzliche Frist + Warnung', () => {
    const result = berechneKuendigungsfrist({
      vertragsbeginn: '2023-01-01',
      zugangKuendigung: '2025-04-15',     // dj3 → gesetzlich 2 Monate
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      abweichendeFristMonate: 0.5,
      abweichendeFristFormGueltig: true,
      abweichendeFristQuelleGAV: false,
      kuendigungsterminMonatsende: true,
    });
    expect(result.fristMonate).toBe(2);
    expect(result.ergebnis.warnungen.some((w) => w.includes('Verkürzung unter 1 Monat'))).toBe(true);
  });

  // §7.19 – Probezeit → 7 Tage ab Zugang (vorwärts)
  it('§7.19: Probezeit → 7 Tage ab Zugang', () => {
    const result = berechneKuendigungsfrist({
      vertragsbeginn: '2026-01-01',
      zugangKuendigung: '2026-01-20',
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      kuendigungsterminMonatsende: true,
    });
    expect(result.istProbezeit).toBe(true);
    expect(ds(result.beendigungsdatum!)).toBe('2026-01-27');
  });

  // §7.20 – Frist endet im höheren DJ → bleibt bei Frist des Zugangs-DJ
  it('§7.20: Frist läuft in höheres DJ → Frist des Zugangs-DJ', () => {
    const result = berechneKuendigungsfrist({
      vertragsbeginn: '2025-01-01',
      zugangKuendigung: '2025-12-15',     // dj1 → 1 Monat, endet im dj2 (2026)
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 0,
      kuendigungsterminMonatsende: true,
    });
    expect(result.fristMonate).toBe(1);
    expect(ds(result.beendigungsdatum!)).toBe('2026-01-31');
  });
});

describe('Sperrfristen (Art. 336c OR)', () => {
  // T4 – Nichtig: Beginn 01.01.2020, Zugang 10.05.2025, Krankheit 01.05.–30.06.2025
  it('T4: Kündigung während Sperrfrist → nichtig', () => {
    const result = berechneSperrfristen({
      vertragsbeginn: '2020-01-01',
      zugangKuendigung: '2025-05-10',
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      kuendigungsterminMonatsende: true,
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-06-30' },
      ],
    });
    expect(result.status).toBe('nichtig');
  });

  // T5 – Hemmung+Erstreckung: Beginn 01.01.2020, Zugang 31.03.2025, 2 Monate,
  //      Krankheit 10.04.–20.05.2025 (41 Tage) → 31.07.2025
  it('T5: Hemmung 41 Tage → Erstreckung auf 31.07.2025', () => {
    const result = berechneSperrfristen({
      vertragsbeginn: '2020-01-01',
      zugangKuendigung: '2025-03-31',
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      kuendigungsterminMonatsende: true,
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-04-10', bis: '2025-05-20' },
      ],
    });
    expect(result.status).toBe('ok');
    expect(result.ergebnis).toContain('31.07.2025');
  });

  // T6 – AN-Kündigung trotz Krankheit → gültig, Art. 336c greift nicht
  it('T6: Arbeitnehmerkündigung trotz Krankheit → gültig, kein Sperrereignis-Effekt', () => {
    const result = berechneSperrfristen({
      vertragsbeginn: '2020-01-01',
      zugangKuendigung: '2025-05-10',
      kuendigendePartei: 'arbeitnehmer',
      probezeitMonate: 1,
      kuendigungsterminMonatsende: true,
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-06-30' },
      ],
    });
    expect(result.status).toBe('ok');
    expect(result.status).not.toBe('nichtig');
  });

  // Militär > 11 Tage → 4 Wochen davor/danach (Zugang vor der erweiterten Sperrfrist)
  it('Militär > 11 Tage → Zugang vor erweiterter Sperrfrist → ok', () => {
    const result = berechneSperrfristen({
      vertragsbeginn: '2020-01-01',
      zugangKuendigung: '2025-05-01',   // Zugang vor der erweiterten Sperrfrist
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      kuendigungsterminMonatsende: true,
      sperrereignisse: [
        { typ: 'militaer_zivil', von: '2025-06-01', bis: '2025-06-21' }, // 21 Tage
      ],
    });
    // 4 Wochen vor 2025-06-01 = 2025-05-04; Zugang 01.05 < 04.05 → NICHT in Sperrfrist
    expect(result.status).toBe('ok');
  });

  // Keine Sperrereignisse → Normales Ergebnis
  it('Keine Sperrereignisse → normales Beendigungsdatum', () => {
    const result = berechneSperrfristen({
      vertragsbeginn: '2023-01-01',
      zugangKuendigung: '2025-04-15',
      kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1,
      kuendigungsterminMonatsende: true,
      sperrereignisse: [],
    });
    expect(result.status).toBe('ok');
    expect(result.ergebnis).toContain('30.06.2025');
  });
});
