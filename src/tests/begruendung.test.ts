import { describe, it, expect } from 'vitest';
import { begruendungsAbsatz } from '../lib/begruendung';
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
    const a2 = begruendungsAbsatz(schkg, `Der Fristenlauf begann am ${schkg.diesAQuo} (Art. 31 SchKG i.V.m. Art. 142 Abs. 1 ZPO).`);
    expect(a2).toContain('11.07.2025');
    expect(a2).toContain('Art. 63 SchKG');
  });
});
