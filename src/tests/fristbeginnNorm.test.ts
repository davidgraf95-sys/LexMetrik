// Engine-Wächter für das benannte Fristbeginn-Norm-Feld
// (FAHRPLAN-BEGRUENDUNGS-ABSATZ B1-1, Kritik-5 «Magic-Index»).
//
// Bricht, sobald sich die Reihenfolge der normverweise ändert ODER das Feld
// nicht mehr die fristbeginn-tragende Norm nennt — schliesst die
// «Deploy-Bug-#5-Klasse» (falsch zitierte Fristbeginn-Norm im Rechtsschrift-
// Absatz) deterministisch.
import { describe, it, expect } from 'vitest';
import { berechneFrist } from '../lib/zpoFristen';
import { berechneSchkgFrist } from '../lib/schkgFristen';

describe('ZPO: fristbeginnNorm', () => {
  it('Tagesfrist → Art. 142 Abs. 1 ZPO (== altes normverweise[0])', () => {
    const r = berechneFrist({ ereignis: '2025-12-10', einheit: 'tage', laenge: 10, verfahren: 'ordentlich', kanton: 'ZH', fristnatur: 'gesetzlich' });
    expect(r.fristbeginnNorm).toBe('Art. 142 Abs. 1 ZPO');
    expect(r.fristbeginnNorm).toBe(r.normverweise[0].artikel);
  });
  it('Monatsfrist → Art. 142 Abs. 2 ZPO (== altes normverweise[0])', () => {
    const r = berechneFrist({ ereignis: '2026-01-26', einheit: 'monate', laenge: 1, verfahren: 'ordentlich', kanton: 'ZH', fristnatur: 'gesetzlich' });
    expect(r.fristbeginnNorm).toBe('Art. 142 Abs. 2 ZPO');
    expect(r.fristbeginnNorm).toBe(r.normverweise[0].artikel);
  });
});

describe('SchKG: fristbeginnNorm', () => {
  it('Tagesfrist → «Art. 31 SchKG i.V.m. Art. 142 Abs. 1 ZPO» (== altes [0] i.V.m. [1])', () => {
    const r = berechneSchkgFrist({ ereignis: '2026-03-20', einheit: 'tage', laenge: 10, modus: 'schkg_betreibungsferien', fristnatur: 'verwirkung', kanton: 'ZH' });
    expect(r.fristbeginnNorm).toBe('Art. 31 SchKG i.V.m. Art. 142 Abs. 1 ZPO');
    expect(r.fristbeginnNorm).toBe(`${r.normverweise[0].artikel} i.V.m. ${r.normverweise[1].artikel}`);
  });
});
