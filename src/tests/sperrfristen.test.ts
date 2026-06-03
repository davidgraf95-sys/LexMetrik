import { describe, it, expect } from 'vitest';
import { berechneSperrfristen } from '../lib/sperrfristen';
import type { SperrfristenInput } from '../types/legal';

const BASE: Omit<SperrfristenInput, 'sperrereignisse'> = {
  vertragsbeginn: '2020-01-01',
  zugangKuendigung: '2025-04-20',
  kuendigendePartei: 'arbeitgeber',
  probezeitMonate: 1,
  kuendigungsterminMonatsende: true,
};

function rechenwegText(r: ReturnType<typeof berechneSperrfristen>): string {
  return r.rechenweg.map((s) => s.beschreibung + ' ' + s.zwischenergebnis).join('\n');
}

describe('Sperrfristen P1/P2 (Art. 336c OR)', () => {
  // §7.1 – Rückrechnungsprinzip: Sperrgrund nur zwischen Zugang und Fristbeginn → keine Hemmung
  it('§7.1: Sperrgrund zwischen Zugang und (rückgerechnetem) Fristbeginn → keine Hemmung', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-04-05',   // dj6 → 2 Monate; ende_ungehemmt 30.06., Fristbeginn 30.04.
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-04-06', bis: '2025-04-20' }, // vor Fristbeginn
      ],
    });
    expect(r.status).toBe('ok');
    expect(r.ergebnis).toContain('30.06.2025');           // Beendigung unverändert
    expect(r.ergebnis).toContain('Keine Sperrfrist-Hemmung');
  });

  // §7.2 – Art. 77 OR: Krankheit 30 Tage im 1. DJ: Beginn T → Sperrende T+30 (nicht T+29)
  it('§7.2: Krankheit 30 Tage 1. DJ → Sperrende von+30 (Art. 77 OR)', () => {
    const r = berechneSperrfristen({
      ...BASE,
      vertragsbeginn: '2025-01-01',     // 1. DJ
      zugangKuendigung: '2025-09-01',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-03-01', bis: '2025-12-01' }, // lange Krankheit
      ],
    });
    const txt = rechenwegText(r);
    expect(txt).toContain('31.03.2025');   // 01.03. + 30 Tage = 31.03. (nicht 30.03.)
    expect(txt).not.toContain('30.03.2025');
  });

  // §7.3 – Zwei verschiedene Krankheiten parallel → Union, keine Doppelzählung
  it('§7.3: Zwei parallele Krankheiten → Union (46 statt 63 Hemmungstage)', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-04-20',   // Fenster 30.04.–30.06.
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-05-31' },
        { typ: 'krankheit_unfall', von: '2025-05-15', bis: '2025-06-15' },
      ],
    });
    expect(r.status).toBe('ok');
    expect(r.ergebnis).toContain('um 46 Tage'); // Union [01.05–15.06] ∩ Fenster = 46 (nicht 31+32)
  });

  // §7.4 – Rückfall gleiche Ursache → nur eine Sperrfrist
  it('§7.4: Rückfall derselben Ursache → keine zweite Sperrfrist', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-04-20',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-05-10' },
        { typ: 'krankheit_unfall', von: '2025-06-01', bis: '2025-06-10', gleicheUrsacheWieEreignis: 0 },
      ],
    });
    expect(r.status).toBe('ok');
    expect(r.ergebnis).toContain('um 10 Tage'); // nur Ereignis 0 zählt
    expect(rechenwegText(r)).toContain('Rückfall');
  });

  // §7.5 – Dienstjahreswechsel 1→2 während laufender Krankheit → 90 Tage ab erstem AUF-Tag
  it('§7.5: DJ-Wechsel 1→2 während Sperrfrist → 90 Tage ab erstem AUF-Tag', () => {
    const r = berechneSperrfristen({
      ...BASE,
      vertragsbeginn: '2025-01-01',
      zugangKuendigung: '2025-12-01',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-12-15', bis: '2026-06-01' }, // Jahrestag 01.01.2026 in 30-Tage-Frist
      ],
    });
    const txt = rechenwegText(r);
    expect(txt).toContain('Dienstjahreswechsel');
    expect(txt).toContain('15.03.2026'); // 15.12.2025 + 90 Tage
  });

  // §7.6 – Sperrfrist endete im alten DJ → keine Verlängerung
  it('§7.6: Sperrfrist endet vor Jahrestag → keine C5-Verlängerung', () => {
    const r = berechneSperrfristen({
      ...BASE,
      vertragsbeginn: '2025-01-01',
      zugangKuendigung: '2025-09-15',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-10-01', bis: '2026-06-01' }, // 30-Tage-Frist endet 31.10., Jahrestag 01.01.2026 später
      ],
    });
    const txt = rechenwegText(r);
    expect(txt).toContain('31.10.2025');         // 30 Tage, nicht verlängert
    expect(txt).not.toContain('Dienstjahreswechsel');
  });

  // §7.7 – Zugang in Sperrfrist → nichtig
  it('§7.7: Zugang in Sperrfrist → nichtig', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-05-10',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-06-30' },
      ],
    });
    expect(r.status).toBe('nichtig');
  });

  // §7.8 – Arbeitnehmerkündigung → keine Sperrfristen
  it('§7.8: Arbeitnehmerkündigung → keine Sperrfristen', () => {
    const r = berechneSperrfristen({
      ...BASE,
      kuendigendePartei: 'arbeitnehmer',
      zugangKuendigung: '2025-05-10',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-06-30' },
      ],
    });
    expect(r.status).toBe('ok');
    expect(r.status).not.toBe('nichtig');
  });

  // §7.9 – Neue AUF in Erstreckungsphase → ignoriert
  it('§7.9: Sperrgrund in Erstreckungsphase (nach Endtermin) → ignoriert', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-04-20',   // Fenster 30.04.–30.06.
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-05-20' }, // 20 Hemmungstage
        { typ: 'krankheit_unfall', von: '2025-07-25', bis: '2025-08-05' }, // nach Endtermin → ignoriert
      ],
    });
    expect(r.status).toBe('ok');
    expect(r.ergebnis).toContain('um 20 Tage'); // nur das erste Ereignis
    expect(r.ergebnis).toContain('31.07.2025');
  });
});
