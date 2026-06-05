import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../components/locale';

// ─── Hydration-Härtung der Wizards (Review-Befund 5.6.2026) ─────────────────
// Korrupte/alte localStorage-Stände (falsche Elementform, ungültige Enums)
// dürfen die Seite weder crashen noch «undefined»-Beschriftungen erzeugen.
// Repro-Stände stammen 1:1 aus dem Review (UI-Agent, empirisch verifiziert).

const KEY = 'lexmetrik.vorlage.vollmacht.v1';

function localStorageStub(inhalt: Record<string, string>) {
  const speicher = new Map(Object.entries(inhalt));
  return {
    getItem: (k: string) => speicher.get(k) ?? null,
    setItem: (k: string, v: string) => { speicher.set(k, v); },
    removeItem: (k: string) => { speicher.delete(k); },
  } as Storage;
}

async function renderVollmacht(): Promise<string> {
  const { VorlageVollmacht } = await import('../pages/VorlageVollmacht');
  return renderToString(
    <MemoryRouter initialEntries={['/vorlagen/vollmacht']}>
      <LocaleProvider><VorlageVollmacht /></LocaleProvider>
    </MemoryRouter>,
  );
}

describe('Wizard-Hydration: Vollmacht übersteht korrupte Speicherstände', () => {
  const original = (globalThis as { localStorage?: Storage }).localStorage;
  beforeEach(() => { /* je Test gesetzt */ });
  afterEach(() => { (globalThis as { localStorage?: Storage }).localStorage = original; });

  it('Element ohne name / null-Element → rendert statt zu crashen', async () => {
    for (const roh of [
      '{"bevollmaechtigte":[{"angaben":"x"}]}',
      '{"bevollmaechtigte":[null]}',
      '{"bevollmaechtigte":["kaputt"]}',
    ]) {
      (globalThis as { localStorage?: Storage }).localStorage = localStorageStub({ [KEY]: roh });
      const html = await renderVollmacht();
      expect(html).toContain('Vollmacht');
      expect(html.length).toBeGreaterThan(500);
    }
  });

  it('ungültige Enum-Werte fallen auf Defaults zurück – kein «undefined» in der Ausgabe', async () => {
    (globalThis as { localStorage?: Storage }).localStorage = localStorageStub({
      [KEY]: '{"typ":"foo","geberTyp":"x","vertretung":"y","substitution":"z","bereiche":["quatsch"],"ermaechtigungen":[42]}',
    });
    const html = await renderVollmacht();
    expect(html).not.toContain('undefined');
    expect(html).toContain('Generalvollmacht'); // typ-Fallback 'general' → Titel-Override greift
  });

  it('gesunder Speicherstand bleibt unangetastet (kein Über-Normalisieren)', async () => {
    (globalThis as { localStorage?: Storage }).localStorage = localStorageStub({
      [KEY]: '{"typ":"anwalt","bevollmaechtigte":[{"name":"Ben Beispiel","angaben":"Basel"}]}',
    });
    const html = await renderVollmacht();
    expect(html).toContain('Anwaltsvollmacht');
    expect(html).toContain('Ben Beispiel');
  });
});
