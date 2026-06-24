import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../components/locale';
import { TabStreifen } from '../components/layout/TabStreifen';

// TabStreifen-Guard: bei <2 Reitern rendert er NICHTS (golden/prerender/Optik
// byte-gleich, kein Layout-Shift); ab 2 Reitern eine tablist-Leiste. SSR via
// renderToString (Effekt läuft nicht; der useState(ladeTabs)-Initialwert liefert
// die geseedeten Reiter).
beforeEach(() => {
  const speicher = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => speicher.get(k) ?? null,
    setItem: (k: string, v: string) => void speicher.set(k, v),
    removeItem: (k: string) => void speicher.delete(k),
    clear: () => speicher.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage;
});

const html = (eintraege: { path: string; label?: string }[], url = '/') => {
  localStorage.setItem('lexmetrik-tabs', JSON.stringify(eintraege));
  return renderToString(
    <MemoryRouter initialEntries={[url]}>
      <LocaleProvider><TabStreifen /></LocaleProvider>
    </MemoryRouter>,
  );
};

describe('TabStreifen — Guard + Render', () => {
  it('rendert NICHTS bei 0 oder 1 Reiter', () => {
    expect(html([])).toBe('');
    expect(html([{ path: '/rechner/tagerechner' }])).toBe('');
  });

  it('ab 2 Reitern: tablist-Leiste mit zwei Reitern, Schliessen-Knöpfen und «Alle schliessen»', () => {
    const out = html(
      [{ path: '/rechner/tagerechner' }, { path: '/gesetze/bund/or' }],
      '/rechner/tagerechner',
    );
    expect(out).toContain('aria-label="Geöffnete Reiter"');
    expect(out).toContain('role="tablist"');
    expect((out.match(/role="tab"/g) ?? []).length).toBe(2);
    expect(out).toContain('Alle schliessen');
    // aktiver Reiter (aktueller Pfad) trägt aria-selected
    expect(out).toContain('aria-selected="true"');
  });
});
