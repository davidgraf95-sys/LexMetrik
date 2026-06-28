import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { BegruendungSlot } from '../components/BegruendungSlot';
import { BEGRUENDUNG_VORBEHALT } from '../lib/begruendung';
import type { Berechnungsergebnis } from '../types/legal';

// Render-Test des geteilten Slots (FAHRPLAN-BEGRUENDUNGS-ABSATZ B2-2).
// renderToString-Muster wie im Repo üblich (node-Env, kein jsdom).

const basis: Berechnungsergebnis = {
  ergebnis: '', status: 'ok', rechenweg: [], annahmen: [], warnungen: [], normverweise: [],
};

describe('BegruendungSlot', () => {
  it('gültiges Ergebnis → Absatz + Kopier-Button + Vorbehalt', () => {
    const e: Berechnungsergebnis = { ...basis, ergebnis: 'Die Forderung ist nicht verjährt.', normverweise: [{ artikel: 'Art. 127 OR' }] };
    const html = renderToString(<BegruendungSlot ergebnis={e} />);
    expect(html).toContain('Die Forderung ist nicht verjährt.');
    expect(html).toContain('Massgebend sind Art. 127 OR.');
    expect(html).toContain('Absatz kopieren');
    expect(html).toContain(BEGRUENDUNG_VORBEHALT);
  });

  it('Zusatz wird zwischen Ergebnis und Normen-Satz eingefügt', () => {
    const e: Berechnungsergebnis = { ...basis, ergebnis: 'Fristende: 05.01.2026.', normverweise: [{ artikel: 'Art. 142 Abs. 1 ZPO' }] };
    const html = renderToString(<BegruendungSlot ergebnis={e} zusatz="Der Fristenlauf begann am 11.12.2025." />);
    expect(html).toContain('Fristende: 05.01.2026. Der Fristenlauf begann am 11.12.2025. Massgebend sind Art. 142 Abs. 1 ZPO.');
  });

  it('leeres Ergebnis ohne Normen → kein Absatz (null)', () => {
    expect(renderToString(<BegruendungSlot ergebnis={basis} />)).toBe('');
  });
});
