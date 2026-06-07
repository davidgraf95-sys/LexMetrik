import { describe, it, expect } from 'vitest';
import { begruendungsAbsatz, fristbeginnZusatz } from '../lib/begruendung';
import { berechneFrist } from '../lib/zpoFristen';
import { berechneSchkgFrist } from '../lib/schkgFristen';
import type { ZpoInput } from '../types/zpo';

// FAHRPLAN-PRAXIS 2.2: Begründungs-Absatz — reine Formulierung aus Engine-Daten.

describe('Begründungs-Absatz (lib/begruendung.ts)', () => {
  it('komponiert Ergebnissatz + Zusatz + dedupliziertem Normen-Satz', () => {
    const e = {
      ergebnis: 'Fristende: 31.05.2025.',
      status: 'ok' as const,
      rechenweg: [], annahmen: [], warnungen: [],
      normverweise: [
        { artikel: 'Art. 311 Abs. 1 ZPO' },
        { artikel: 'Art. 145 ZPO' },
        { artikel: 'Art. 311 Abs. 1 ZPO' }, // Duplikat
      ],
    };
    const t = begruendungsAbsatz(e, 'Der Fristenlauf begann am 16.04.2025 (Art. 142 Abs. 1 ZPO).');
    expect(t).toBe('Fristende: 31.05.2025. Der Fristenlauf begann am 16.04.2025 (Art. 142 Abs. 1 ZPO). Massgebend sind Art. 311 Abs. 1 ZPO, Art. 145 ZPO.');
  });

  it('mehr als 6 Normen → «u. a.»; fehlender Schlusspunkt wird ergänzt', () => {
    const e = {
      ergebnis: 'Ergebnis ohne Punkt',
      status: 'ok' as const, rechenweg: [], annahmen: [], warnungen: [],
      normverweise: Array.from({ length: 8 }, (_, i) => ({ artikel: `Art. ${100 + i} OR` })),
    };
    const t = begruendungsAbsatz(e);
    expect(t).toContain('Ergebnis ohne Punkt.');
    expect(t).toContain('u. a.');
    expect(t).not.toContain('Art. 107 OR'); // 7./8. gekappt
  });

  it('deterministisch und konventionskonform an echten Engine-Ergebnissen (ZPO + SchKG)', () => {
    const zpo = berechneFrist({
      ereignis: '2025-04-15', einheit: 'tage', laenge: 30, verfahren: 'ordentlich',
      kanton: 'ZH', fristnatur: 'gesetzlich',
    } as ZpoInput);
    const a1 = begruendungsAbsatz(zpo);
    expect(a1).toBe(begruendungsAbsatz(zpo)); // deterministisch
    expect(a1).toMatch(/Massgebend sind Art\./);
    expect(a1).not.toContain('—'); // Geviertstrich-Konvention

    const schkg = berechneSchkgFrist({
      ereignis: '2025-07-10', einheit: 'tage', laenge: 10,
      modus: 'schkg_betreibungsferien', fristnatur: 'frist', kanton: 'ZH',
    });
    const a2 = begruendungsAbsatz(schkg, `Der Fristenlauf begann am ${schkg.diesAQuo} (Art. 31 SchKG i.V.m. ${schkg.normverweise[1].artikel}).`);
    expect(a2).toContain('11.07.2025');
    expect(a2).toContain('Art. 63 SchKG');
    expect(a2).toContain('Art. 142 Abs. 1 ZPO'); // Tagesfrist → Abs. 1
  });

  // Deploy-Bug-Check 7.6.2026 (HOCH): Der Fristbeginn-Zusatz der Formulare
  // war auf «Art. 142 Abs. 1 ZPO» hartcodiert — bei Wochen-/Monats-/Jahres-
  // fristen führt die Engine aber Abs. 2 (gleichbezeichneter Tag, BGer-
  // Praxis) und der dies a quo IST der Ereignistag. Die Formulare beziehen
  // die Norm jetzt aus normverweise; diese Tests sichern die Engine-Quelle.
  it('Fristbeginn-Norm folgt der Fristeinheit: Monats-/Jahresfrist → Art. 142 Abs. 2 (nicht Abs. 1)', () => {
    const monat = berechneFrist({
      ereignis: '2025-04-15', einheit: 'monate', laenge: 1, verfahren: 'summarisch',
      kanton: 'ZH', fristnatur: 'gesetzlich',
    } as ZpoInput);
    expect(monat.normverweise[0].artikel).toBe('Art. 142 Abs. 2 ZPO');
    // BGer-Praxis: dies a quo = Ereignistag selbst (nicht Folgetag)
    expect(monat.diesAQuoISO).toBe('2025-04-15');
    const absatz = begruendungsAbsatz(monat, `Der Fristenlauf begann am 15.04.2025 (${monat.normverweise[0].artikel}).`);
    expect(absatz).toContain('(Art. 142 Abs. 2 ZPO)');
    expect(absatz).not.toContain('(Art. 142 Abs. 1 ZPO)');

    const tage = berechneFrist({
      ereignis: '2025-04-15', einheit: 'tage', laenge: 30, verfahren: 'ordentlich',
      kanton: 'ZH', fristnatur: 'gesetzlich',
    } as ZpoInput);
    expect(tage.normverweise[0].artikel).toBe('Art. 142 Abs. 1 ZPO');

    const schkgMonat = berechneSchkgFrist({
      ereignis: '2025-01-31', einheit: 'monate', laenge: 1,
      modus: 'schkg_betreibungsferien', fristnatur: 'frist', kanton: 'ZH',
    });
    expect(schkgMonat.normverweise[1].artikel).toBe('Art. 142 Abs. 2 ZPO');
  });
});

// Code-Review #5 (7.6.2026): Fristbeginn-Satz zentral statt je Form gebaut.
describe('fristbeginnZusatz', () => {
  it('formatiert ISO-Datum mit Norm; ohne Datum entfällt der Satz ersatzlos', () => {
    expect(fristbeginnZusatz('2025-04-15', 'Art. 142 Abs. 2 ZPO'))
      .toBe('Der Fristenlauf begann am 15.04.2025 (Art. 142 Abs. 2 ZPO).');
    expect(fristbeginnZusatz('2026-01-02')).toBe('Der Fristenlauf begann am 02.01.2026.');
    expect(fristbeginnZusatz(undefined, 'Art. 77 OR')).toBeUndefined();
    expect(fristbeginnZusatz(null)).toBeUndefined();
  });
});
