// PDF-«Für die Rechtsschrift»-Block (FAHRPLAN-BEGRUENDUNGS-ABSATZ B3-1).
import { describe, it, expect } from 'vitest';
import { buildPdfModel, modelText, type PdfDocConfig } from '../lib/pdf/pdfModel';
import { BEGRUENDUNG_VORBEHALT } from '../lib/begruendung';
import type { Berechnungsergebnis } from '../types/legal';

const FIX = new Date('2026-06-28T10:00:00');
const ergebnis: Berechnungsergebnis = {
  ergebnis: 'Die Forderung ist nicht verjährt.', status: 'ok',
  rechenweg: [], annahmen: [], warnungen: [], normverweise: [{ artikel: 'Art. 127 OR' }],
};
const basis: PdfDocConfig = {
  title: 'Test', domain: 'test', fileBase: 'Test',
  inputs: { Eingabe: 'Wert' },
  sections: [{ titel: 'Ergebnis', ergebnis }],
  disclaimer: 'Domänen-Disclaimer.',
};

describe('PdfDocConfig.begruendung', () => {
  it('ohne Feld → kein «Für die Rechtsschrift»-Block', () => {
    const txt = modelText(buildPdfModel(basis, FIX));
    expect(txt).not.toContain('Für die Rechtsschrift');
  });

  it('mit Feld → Block + Vorbehalt, VOR dem Disclaimer', () => {
    // pdfText() setzt im PDF typografische Schmal-/NBSP (z. B. «Art. 127»),
    // darum hier nur typografie-stabile Teilstrings prüfen.
    const absatz = 'Die Forderung ist nicht verjährt. Massgebend sind Art. 127 OR.';
    const txt = modelText(buildPdfModel({ ...basis, begruendung: absatz }, FIX));
    const vorbehaltStabil = 'vor Verwendung im Schriftsatz fachlich';
    expect(BEGRUENDUNG_VORBEHALT).toContain(vorbehaltStabil); // Konstante deckt den Teilstring
    expect(txt).toContain('Für die Rechtsschrift');
    expect(txt).toContain('Die Forderung ist nicht verjährt.');
    expect(txt).toContain(vorbehaltStabil);
    // Reihenfolge: Begründungs-Block (inkl. Vorbehalt) vor dem Disclaimer.
    expect(txt.indexOf('Für die Rechtsschrift')).toBeLessThan(txt.indexOf('Domänen-Disclaimer.'));
    expect(txt.indexOf(vorbehaltStabil)).toBeLessThan(txt.indexOf('Domänen-Disclaimer.'));
  });
});
