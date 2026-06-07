import { describe, it, expect, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../components/locale';

// ─── Hydration-Härtung der AG-Gründungsmaske (Perfektion Punkt 7) ────────────
// Korrupte/alte localStorage-Stände (falsche Elementform, ungültige Enums,
// falsche Typen) dürfen die Seite weder crashen noch «undefined»-
// Beschriftungen erzeugen — Wizard-PFLICHT-Konvention (wizardHydration.test).
// SSR rendert nur Schritt 0 (Konstellation): geprüft wird über dort sichtbare
// Signale — selected/checked-Attribute und die klickbare Blocker-Liste
// (sie spiegelt firma/gruender/vr aus den Engine-Gates).

const KEY = 'lexmetrik:ag-gruendung:v1';

function localStorageStub(inhalt: Record<string, string>) {
  const speicher = new Map(Object.entries(inhalt));
  return {
    getItem: (k: string) => speicher.get(k) ?? null,
    setItem: (k: string, v: string) => { speicher.set(k, v); },
    removeItem: (k: string) => { speicher.delete(k); },
  } as Storage;
}

async function renderAg(): Promise<string> {
  const { VorlageAgGruendung } = await import('../pages/VorlageAgGruendung');
  return renderToString(
    <MemoryRouter initialEntries={['/vorlagen/ag-gruendung']}>
      <LocaleProvider><VorlageAgGruendung /></LocaleProvider>
    </MemoryRouter>,
  );
}

const stand = (s: object) => JSON.stringify({ v: 1, stand: s });
const GUELTIGER_GRUENDER = { name: 'Gabi Gründer', angaben: 'von Basel, in Zürich', anzahl: '100', liberierung: '' };

describe('AG-Gründung: Hydration übersteht korrupte Speicherstände', () => {
  const original = (globalThis as { localStorage?: Storage }).localStorage;
  afterEach(() => { (globalThis as { localStorage?: Storage }).localStorage = original; });

  it('Zeilen ohne Felder / null / falscher Typ → rendert statt zu crashen', async () => {
    for (const roh of [
      stand({ gruender: [{ anzahl: 42 }], vr: [null], vertretungen: ['kaputt'] }),
      stand({ sacheinlagen: [{ typ: 'quatsch', wertChf: 7 }], verrechnungen: [[]], vorteile: [{}] }),
      stand({ gruender: 'kein-array', vr: { name: 'x' } }),
      '{"v":1,"stand":[1,2]}',
      'kein json',
    ]) {
      (globalThis as { localStorage?: Storage }).localStorage = localStorageStub({ [KEY]: roh });
      const html = await renderAg();
      expect(html).toContain('AG-Gründungsunterlagen');
      expect(html).not.toContain('undefined');
      expect(html.length).toBeGreaterThan(500);
    }
  });

  it('ungültige Enum-/Skalar-Werte fallen auf Defaults zurück', async () => {
    (globalThis as { localStorage?: Storage }).localStorage = localStorageStub({
      [KEY]: stand({
        einlageArt: 'foo', statutenUmfang: 99, waehrung: 'XXX', kanton: 'DE',
        firma: 13, optingOut: 'ja', datum: false, inhaberaktien: 'x',
        vr: [{ name: 'Vera Valid', zeichnungsArt: 'quatsch', praesident: 'x' }],
      }),
    });
    const html = await renderAg();
    expect(html).not.toContain('undefined');
    // einlageArt 'foo' → Default 'bar' bleibt ausgewählt
    expect(html).toMatch(/<option value="bar" selected/);
    // optingOut falscher Typ → Default true ('opting' ausgewählt)
    expect(html).toMatch(/<option value="opting" selected/);
    // firma falscher Typ → verworfen → Firma-Blocker steht weiter da
    expect(html).toContain('Firma angeben');
  });

  it('alte/fremde Versionen werden verworfen (v ≠ 1 → Defaults)', async () => {
    (globalThis as { localStorage?: Storage }).localStorage = localStorageStub({
      [KEY]: JSON.stringify({ v: 2, stand: { firma: 'Zukunft AG', gruender: [GUELTIGER_GRUENDER] } }),
    });
    const html = await renderAg();
    // Stand verworfen → die Blocker für Firma und Gründer stehen weiterhin da
    expect(html).toContain('Firma angeben');
    expect(html).toContain('Mindestens eine Gründerin');
  });

  it('gesunder Speicherstand wird übernommen (kein Über-Normalisieren)', async () => {
    (globalThis as { localStorage?: Storage }).localStorage = localStorageStub({
      [KEY]: stand({
        firma: 'Muster Immobilien AG', sitz: 'Zürich', zweck: 'Halten von Beteiligungen',
        fremdwaehrung: true,
        gruender: [GUELTIGER_GRUENDER],
        vr: [{ name: 'Gabi Gründer', herkunft: 'von Basel', wohnort: 'Zürich', adresse: 'Musterweg 1', praesident: true, zeichnungsArt: 'einzelunterschrift' }],
      }),
    });
    const html = await renderAg();
    // hydratisierte Werte löschen die Engine-Blocker (firma/sitz/zweck/gruender/vr)
    expect(html).not.toContain('Firma angeben');
    expect(html).not.toContain('Mindestens eine Gründerin');
    expect(html).not.toContain('Mindestens ein Mitglied des Verwaltungsrates');
    // Weichen-Checkbox (Schritt 0) hydratisiert: Fremdwährung angehakt →
    // Gegenwert-Blocker (Kurs fehlt) erscheint dafür in der Liste
    expect(html).toContain('Umrechnungskurs');
  });
});
