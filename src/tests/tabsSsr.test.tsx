import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../components/locale';
import { Reiterleiste } from '../components/layout/Reiterleiste';

// ── W2·24-DESIGN-IDENTITAET R2 · DASSELBE VERSPRECHEN, NEUER TRÄGER ──────────
// Bis 6.9.2026 mass diese Datei `ReiterUebersicht` (☰-Trigger + Flyout). Der
// Baustein ist mit R2 GELÖSCHT — die offenen Reiter stehen jetzt sichtbar in
// der Arbeitsleiste (`Reiterleiste`, §5a des Fahrplans, Wunsch David 6.9.2026).
// Die GEPRÜFTE EIGENSCHAFT ist unverändert und darum hier erhalten, nicht
// aufgeweicht: die schwebende Ebene (früher Flyout, heute das «+N»-Blatt) ist
// CLIENT-ONLY — sie hängt per createPortal an <body> und ist beim ersten Render
// zu. Im SSR/Prerender erscheint darum NIE ein Dialog (golden/prerender
// byte-gleich). Neu hinzu kommt, was die Ablösung sichtbar ändert: die Reiter
// selbst stehen jetzt IM Markup, nicht mehr hinter einem Knopf.
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
      <LocaleProvider><Reiterleiste /></LocaleProvider>
    </MemoryRouter>,
  );
};

describe('Reiterleiste — sichtbare Reiter + client-only Überlauf-Blatt', () => {
  // ── DEKLARIERTE ANPASSUNG (§6.3, W2·24-R5-F1C, R10-Befund, 6.9.2026) ──────
  // Hier stand `expect(html([])).toBe('')` — «keine Reiter, kein Markup». Genau
  // das war die CLS-Ursache: der Prerender kennt keinen Speicher, lieferte also
  // keine Leiste, und nach der Hydration wuchs sie um 34 px in die Seite hinein
  // (gemessen auf /rechner/tagerechner, CLS 0.025, `ics-export-z1` A9). Die
  // Leiste reserviert ihre Höhe jetzt immer.
  //
  // ── DEKLARIERTE ANPASSUNG 2 (§6.3, D19, 6.9.2026) ─────────────────────────
  // Zwischenzeitlich war die geprüfte Eigenschaft noch schärfer: ohne Reiter
  // keine Navigations-Landmark und kein Reiter im Markup — nur ein stummer,
  // `aria-hidden`-Platzhalter. Seit dem Browser-«+» (David: «mit plus einen
  // neuen reiter erzeugen können») gibt es aber IMMER ein Ziel, auch bei 0
  // Reitern: den «+», mit dem man den ERSTEN Reiter überhaupt anlegt. Eine
  // `<nav>` ohne EIN Ziel wäre ein leeres Versprechen gewesen — eine `<nav>`
  // mit dem «+»-Knopf ist es nicht mehr, darum trägt jetzt auch der 0-Reiter-
  // Fall die Landmark. Was UNVERÄNDERT gilt: kein Reiter im Markup, dieselbe
  // Geometrie/Höhe wie mit Reitern (CLS bleibt 0).
  it('reserviert bei 0 Reitern die Höhe UND den «+»; AB dem 1. Reiter zusätzlich den Reiter', () => {
    const leer = html([]);
    expect(leer).toContain('h-[var(--app-reiter-h)]');
    expect(leer).toContain('aria-label="Offene Reiter"');
    expect(leer).toContain('aria-label="Neuer Reiter"');
    expect(leer).not.toContain('aria-label="Reiter «');
    const eins = html([{ path: '/rechner/tagerechner' }], '/rechner/tagerechner');
    expect(eins).toContain('aria-label="Offene Reiter"');
    // Der Reiter steht im Markup — genau das ist die Ablösung des ☰-Flyouts.
    expect(eins).toContain('aria-label="Reiter «');
    expect(eins).toContain('aria-current="page"');
  });

  it('Überlauf-Blatt ist client-only: im SSR KEIN Dialog, nur der Trigger', () => {
    const out = html(
      [{ path: '/rechner/tagerechner' }, { path: '/gesetze/bund/or' }, { path: '/vorlagen/kuendigung' }],
      '/rechner/tagerechner',
    );
    // KEIN ausgeklapptes Blatt im SSR → kein role=dialog (und damit auch keine
    // gruppierte TabPanel-Liste, die erst beim Öffnen rendert).
    expect(out).not.toContain('role="dialog"');
    expect(out).not.toContain('role="tablist"');
    expect(out).not.toContain('role="tab"');
    // Der Trigger trägt Dialog-Semantik und ist zu; die Zahl nennt ALLE Reiter.
    expect(out).toContain('aria-haspopup="dialog"');
    expect(out).toContain('aria-expanded="false"');
    expect(out).toContain('aria-label="Alle 3 offenen Reiter"');
    expect(out).toContain('>3 offen<');
  });
});
