import { describe, it, expect, beforeEach } from 'vitest';
import { merkeTab, ladeTabs } from '../lib/tabs';
import { zielPfadFuerOeffnen, istErlassOffen } from '../lib/useErlassOeffnen';

// Punkt G (Auftrag David): erneutes Öffnen eines bereits offenen Gesetzes über
// die Übersicht /gesetze soll eine NEUE Instanz (?r) öffnen statt nur den
// bestehenden Reiter zu aktivieren. Hier geprüft: die reine Helfer-Logik
// zielPfadFuerOeffnen / istErlassOffen (Hook = dünner Wrapper um navigate).
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

const BASE = '/gesetze/bund/OR';

describe('zielPfadFuerOeffnen — neue Instanz bei bereits offenem Erlass', () => {
  it('nicht offen → nackter Basispfad (kein ?r)', () => {
    expect(zielPfadFuerOeffnen(BASE, [])).toBe(BASE);
    // auch wenn ANDERE Erlasse offen sind, bleibt es der nackte Basispfad
    merkeTab('/gesetze/bund/ZGB');
    expect(zielPfadFuerOeffnen(BASE, ladeTabs().map((t) => t.path))).toBe(BASE);
  });

  it('bereits eine Instanz offen → ?r=2', () => {
    merkeTab(BASE);
    expect(zielPfadFuerOeffnen(BASE, ladeTabs().map((t) => t.path))).toBe(`${BASE}?r=2`);
  });

  it('zwei Instanzen offen → ?r=3', () => {
    merkeTab(BASE);
    merkeTab(`${BASE}?r=2`);
    expect(zielPfadFuerOeffnen(BASE, ladeTabs().map((t) => t.path))).toBe(`${BASE}?r=3`);
  });

  it('Identität per pathname: ?query/#Anker des offenen Reiters egal', () => {
    merkeTab(`${BASE}#art-41`);
    expect(zielPfadFuerOeffnen(BASE, ladeTabs().map((t) => t.path))).toBe(`${BASE}?r=2`);
  });
});

describe('istErlassOffen', () => {
  it('false ohne offenen Reiter, true sobald eine Instanz offen ist', () => {
    expect(istErlassOffen(BASE)).toBe(false);
    merkeTab(`${BASE}#art-1`);
    expect(istErlassOffen(BASE)).toBe(true);
    // andere Erlasse zählen nicht
    expect(istErlassOffen('/gesetze/bund/ZGB')).toBe(false);
  });
});
