import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../components/locale';
import { ReiterUebersicht } from '../components/layout/ReiterUebersicht';

// ReiterUebersicht-SSR: die «Alle Reiter»-Übersicht in der Topbar ist CLIENT-ONLY
// — das Flyout hängt per createPortal an <body> und ist initial zu
// (panelOffen=false). Im SSR/Prerender erscheint daher höchstens der
// Trigger-Knopf, NIE ein Dialog/eine tablist (golden/prerender byte-gleich).
// Fachliche Änderung ggü. dem früheren TabStreifen: kein role=tablist mehr, kein
// horizontaler Streifen, sondern ein Knopf mit aria-haspopup="dialog".
// SSR via renderToString (Effekt läuft nicht; der useState(ladeTabs)-Initialwert
// liefert die geseedeten Reiter).
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
      <LocaleProvider><ReiterUebersicht /></LocaleProvider>
    </MemoryRouter>,
  );
};

describe('ReiterUebersicht — Trigger + Client-only-Flyout', () => {
  it('rendert NICHTS bei 0 Reitern; AB dem 1. Reiter den Trigger-Knopf', () => {
    expect(html([])).toBe('');
    const eins = html([{ path: '/rechner/tagerechner' }], '/rechner/tagerechner');
    // Trigger-Knopf mit Dialog-Semantik, initial zu.
    expect(eins).toContain('aria-haspopup="dialog"');
    expect(eins).toContain('aria-expanded="false"');
    expect(eins).toContain('aria-label="Alle geöffneten Reiter"');
  });

  it('Flyout ist client-only: im SSR KEIN Dialog/keine tablist, nur der Trigger mit Zähler', () => {
    const out = html(
      [{ path: '/rechner/tagerechner' }, { path: '/gesetze/bund/or' }],
      '/rechner/tagerechner',
    );
    // KEIN ausgeklapptes Flyout im SSR → kein role=dialog/tablist/tab, keine
    // Schliessen-Knöpfe (die leben im TabPanel, das erst beim Öffnen rendert).
    expect(out).not.toContain('role="dialog"');
    expect(out).not.toContain('role="tablist"');
    expect(out).not.toContain('role="tab"');
    expect(out).not.toContain('aria-label="Reiter «');
    // Der Trigger trägt den Reiter-Zähler (hier 2).
    expect(out).toContain('aria-haspopup="dialog"');
    expect(out).toContain('>2<');
  });
});
