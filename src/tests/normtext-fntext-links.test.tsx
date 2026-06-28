import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { fnTextMitLinks } from '../pages/gesetz-leser/helpers';
import type { Fussnote } from '../lib/normtext/browse';

const render = (fn: Fussnote) =>
  renderToString(<MemoryRouter>{fnTextMitLinks(fn)}</MemoryRouter>);

describe('M11 fnTextMitLinks — SR-Verweis intern vs. Fedlex-Fallback', () => {
  it('SR-Verweis auf einen Erlass im Volltext (SR 220 → OR) verlinkt INTERN', () => {
    const fn: Fussnote = {
      nr: '1',
      text: 'Fassung gemäss Anhang des OR (SR 220).',
      links: [{ label: 'SR 220', url: 'https://fedlex.data.admin.ch/eli/cc/27/317_321_377/20200101' }],
    };
    const out = render(fn);
    // interner Router-Link auf den LexMetrik-Leser, kein externes target=_blank
    expect(out).toContain('href="/gesetze/bund/OR"');
    expect(out).toContain('SR 220');
    // Stand-Transparenz: zitierter Fedlex-Konsolidierungsstand im title (§5/§8)
    expect(out).toContain('zitierter Fedlex-Stand 01.01.2020');
  });

  it('AS-/BBl-Publikationsverweis bleibt externer Fedlex-Link (kein SR-Erlass)', () => {
    const fn: Fussnote = {
      nr: '2',
      text: 'In Kraft seit 2004 (AS 2004 2767).',
      links: [{ label: 'AS 2004 2767', url: 'https://fedlex.data.admin.ch/eli/oc/2004/340' }],
    };
    const out = render(fn);
    expect(out).toContain('href="https://fedlex.data.admin.ch/eli/oc/2004/340"');
    expect(out).toContain('target="_blank"');
    expect(out).not.toContain('/gesetze/bund');
  });

  it('SR-Verweis auf einen NICHT gehaltenen Erlass bleibt Fedlex-Fallback (§8)', () => {
    const fn: Fussnote = {
      nr: '3',
      text: 'Vgl. die Verordnung (SR 999.999).',
      links: [{ label: 'SR 999.999', url: 'https://fedlex.data.admin.ch/eli/cc/9999/1' }],
    };
    const out = render(fn);
    expect(out).toContain('href="https://fedlex.data.admin.ch/eli/cc/9999/1"');
    expect(out).not.toContain('/gesetze/bund');
  });
});
