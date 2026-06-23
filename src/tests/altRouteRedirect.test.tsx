import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Alt-Routen der aufgehobenen Free/Pro-Zweiteilung: /pro, /fachpersonen,
// /rechner → «/» MIT Query-Erhalt — versendete .ics-Kalenderlinks und alte
// Permalinks tragen die alten Pfade samt ?gebiet=/?q=. Bug-Check 7.6.2026
// M-3: dieses Verhalten war komplett testlos (proKatalog.test.tsx wurde mit
// der Zweiteilung gelöscht); ein Edit, der `${search}` verliert, bliebe grün.
//
// Testtechnik: <Navigate> navigiert erst im Effect — in renderToString läuft
// kein Effect, die SSR-Ausgabe wäre leer. Der Mock macht Ziel + replace im
// Markup prüfbar; Routes/Route/MemoryRouter und die ECHTE Routen-Tabelle aus
// App.tsx bleiben unangetastet im Spiel.
vi.mock('react-router-dom', async (importOriginal) => {
  const m = await importOriginal<typeof import('react-router-dom')>();
  const React = await import('react');
  return {
    ...m,
    Navigate: (props: { to: string; replace?: boolean }) =>
      React.createElement('a', {
        'data-redirect-ziel': props.to,
        'data-replace': String(Boolean(props.replace)),
      }),
  };
});

// Minimaler localStorage-Mock (Node hat keinen; Muster katalog.test.tsx)
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

const redirectZiel = (url: string): { ziel: string; replace: string } | null => {
  const html = renderToString(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>,
  );
  const m = html.match(/data-redirect-ziel="([^"]*)" data-replace="([^"]*)"/);
  return m ? { ziel: m[1].replace(/&amp;/g, '&'), replace: m[2] } : null;
};

describe('Alt-Routen-Redirects /pro, /fachpersonen → «/» (App.tsx)', () => {
  // UI-Welle: /rechner ist neu die Rechner-Übersicht (kein Redirect mehr); die
  // Free/Pro-Alt-Pfade /pro + /fachpersonen leiten weiter auf «/».
  it('beide Alt-Pfade sind verdrahtet und ersetzen den History-Eintrag', () => {
    for (const pfad of ['/pro', '/fachpersonen']) {
      const r = redirectZiel(pfad);
      expect(r, `${pfad} muss auf einen Redirect treffen`).not.toBeNull();
      expect(r!.ziel).toBe('/');
      expect(r!.replace).toBe('true');
    }
  });

  it('Suchstring bleibt erhalten (.ics-Links/Permalinks im Umlauf)', () => {
    expect(redirectZiel('/pro?gebiet=arbeit&q=zpo')!.ziel).toBe('/?gebiet=arbeit&q=zpo');
    expect(redirectZiel('/fachpersonen?modus=pro')!.ziel).toBe('/?modus=pro');
  });

  it('/recherche leitet (aufgelöst) auf die Rechner-Übersicht /rechner', () => {
    const r = redirectZiel('/recherche');
    expect(r).not.toBeNull();
    expect(r!.ziel).toBe('/rechner');
    expect(r!.replace).toBe('true');
  });
});
