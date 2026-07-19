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

describe('G15 fnTextMitLinks — Hervorhebungen (fett/kursiv) als Rich-Text', () => {
  it('<b>/<i> im Text werden zu <strong>/<em>', () => {
    const fn: Fussnote = {
      nr: '1',
      text: 'In Kraft seit 2004 (AS <b>2004</b> 2767; <i>BBl 2003 1</i>).',
      links: [{ label: 'AS <b>2004</b> 2767', url: 'https://fedlex.data.admin.ch/eli/oc/2004/340' }],
    };
    const out = render(fn);
    expect(out).toContain('<strong>2004</strong>'); // fett erhalten
    expect(out).toContain('<em>BBl 2003 1</em>');    // kursiv erhalten
    // Link trägt die Hervorhebung INNERHALB des Ankers
    expect(out).toContain('href="https://fedlex.data.admin.ch/eli/oc/2004/340"');
  });

  it('SR-Erkennung (M11) greift trotz Fett im Label («SR <b>220</b>» → intern OR)', () => {
    const fn: Fussnote = {
      nr: '2',
      text: 'Vgl. das OR (SR <b>220</b>).',
      links: [{ label: 'SR <b>220</b>', url: 'https://fedlex.data.admin.ch/eli/cc/27/317_321_377/20200101' }],
    };
    const out = render(fn);
    expect(out).toContain('href="/gesetze/bund/OR"');     // intern verlinkt
    expect(out).toContain('<strong>220</strong>');         // Fett im Link-Text erhalten
    expect(out).not.toContain('target="_blank"');
  });
});

describe('G-REF fnTextMitLinks — SR-Zielidentität (rs) treibt die Auflösung, ELI als amtlicher Fallback', () => {
  it('rs auf einen NICHT gehaltenen Erlass → amtlicher ELI-Link (nicht mehr Vokabular)', () => {
    const fn: Fussnote = {
      nr: '1',
      text: 'Fassung gemäss dem GwG (SR 943.03).',
      links: [{ label: 'SR 943.03', url: 'https://fedlex.data.admin.ch/eli/cc/2016/752', rs: '943.03' }],
    };
    const out = render(fn);
    // Link zur amtlichen Fassung (eli/cc), extern; keine Vokabular-Taxonomie-Seite
    expect(out).toContain('href="https://fedlex.data.admin.ch/eli/cc/2016/752"');
    expect(out).toContain('target="_blank"');
    expect(out).not.toContain('vocabulary');
    expect(out).not.toContain('/gesetze/bund');
  });

  it('rs auf einen GEHALTENEN Erlass (272 → ZPO) → INTERN, auch ohne «SR»-Präfix im Label', () => {
    // Staatsvertrags-/Alt-Stil-Label «0.xxx»/nackte Nummer: das Label-Regex allein
    // (^SR N$) griffe nicht — die maschinen-genaue rs-Nummer löst trotzdem auf.
    const fn: Fussnote = {
      nr: '2',
      text: 'nach der ZPO 272.',
      links: [{ label: '272', url: 'https://fedlex.data.admin.ch/eli/cc/2010/262', rs: '272' }],
    };
    const out = render(fn);
    expect(out).toContain('href="/gesetze/bund/ZPO"');
    expect(out).not.toContain('target="_blank"');
  });
});

describe('A42 fnTextMitLinks — kantonaler Ingress-/Fussnoten-Verweis (intern vs. amtlich)', () => {
  it('vom Generator aufgelöster `intern`-Verweis linkt INTERN (Kanton)', () => {
    const fn: Fussnote = {
      nr: '1',
      text: 'SG 111.100.',
      links: [{ label: '111.100', url: 'https://www.gesetzessammlung.bs.ch/data/111.100/de', intern: { ebene: 'kanton', key: 'BS-111.100' } }],
    };
    const out = render(fn);
    expect(out).toContain('href="/gesetze/kanton/BS-111.100"'); // intern
    expect(out).not.toContain('target="_blank"');
  });

  it('`intern` auf Bund (clex-Verweis → gehaltener SR-Erlass) linkt INTERN', () => {
    const fn: Fussnote = {
      nr: '2',
      text: 'SR 272',
      links: [{ label: '272', url: 'https://db.clex.ch/link/Bund/272/de', intern: { ebene: 'bund', key: 'ZPO' } }],
    };
    const out = render(fn);
    expect(out).toContain('href="/gesetze/bund/ZPO"');
    expect(out).not.toContain('target="_blank"');
  });

  it('ohne `intern` (Erlass nicht gehalten) bleibt der amtliche Link extern (§8)', () => {
    const fn: Fussnote = {
      nr: '3',
      text: 'SG 999.999',
      links: [{ label: '999.999', url: 'https://www.gesetzessammlung.bs.ch/data/999.999/de' }],
    };
    const out = render(fn);
    expect(out).toContain('href="https://www.gesetzessammlung.bs.ch/data/999.999/de"');
    expect(out).toContain('target="_blank"');
    expect(out).not.toContain('/gesetze/');
  });
});
