import { describe, it, expect, beforeEach } from 'vitest';
import { ladeTabs, merkeTab, schliesseTab, leereTabs, ordneTabsUm } from '../lib/tabs';

// In-App-Reiter (lib/tabs.ts): Persistenz, stabile Reihenfolge, Dublette per
// pathname, MAX-Kappung, korruptes localStorage. Reines Speicher-Werkzeug.
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

describe('tabs.ts — offene Reiter', () => {
  it('neuer Reiter hinten angehängt; Reihenfolge stabil', () => {
    merkeTab('/rechner/tagerechner');
    merkeTab('/gesetze/bund/or');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/rechner/tagerechner', '/gesetze/bund/or']);
  });

  it('Dublette per pathname: Position bleibt, Label wird aktualisiert', () => {
    merkeTab('/rechner/tagerechner');
    merkeTab('/gesetze/bund/or');
    merkeTab('/rechner/tagerechner', 'Fristenrechner');
    const t = ladeTabs();
    expect(t.map((x) => x.path)).toEqual(['/rechner/tagerechner', '/gesetze/bund/or']);
    expect(t[0].label).toBe('Fristenrechner');
  });

  it('verschiedene ?query desselben Pfads = derselbe Reiter', () => {
    merkeTab('/rechner/tagerechner?preset=a');
    merkeTab('/rechner/tagerechner?preset=b');
    expect(ladeTabs().length).toBe(1);
  });

  it('MAX 8: der älteste (vorn) fällt heraus', () => {
    for (let i = 0; i < 10; i++) merkeTab(`/rechner/r${i}`);
    const t = ladeTabs();
    expect(t.length).toBe(8);
    expect(t[0].path).toBe('/rechner/r2');
    expect(t[7].path).toBe('/rechner/r9');
  });

  it('schliesseTab entfernt per pathname', () => {
    merkeTab('/a'); merkeTab('/b');
    schliesseTab('/a');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/b']);
  });

  it('leereTabs leert die Liste', () => {
    merkeTab('/a'); leereTabs();
    expect(ladeTabs()).toEqual([]);
  });

  it('ordneTabsUm verschiebt den Reiter an die Zielposition (#12 Drag-and-Drop)', () => {
    merkeTab('/a'); merkeTab('/b'); merkeTab('/c'); merkeTab('/d');
    // /d nach vorne (an Position von /a)
    ordneTabsUm('/d', '/a');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/d', '/a', '/b', '/c']);
    // /d wieder nach hinten (an Position von /c)
    ordneTabsUm('/d', '/c');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/a', '/b', '/c', '/d']);
  });

  it('ordneTabsUm: unbekannter Pfad oder gleiche Position → unverändert', () => {
    merkeTab('/a'); merkeTab('/b');
    ordneTabsUm('/x', '/a');   // /x existiert nicht
    ordneTabsUm('/a', '/a');   // gleiche Position
    expect(ladeTabs().map((t) => t.path)).toEqual(['/a', '/b']);
  });

  it('ordneTabsUm identifiziert per pathname (Query egal)', () => {
    merkeTab('/a'); merkeTab('/b');
    ordneTabsUm('/b?x=1', '/a?y=2');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/b', '/a']);
  });

  it('korruptes JSON / Nicht-Array → leere Liste (kein Crash)', () => {
    localStorage.setItem('lexmetrik-tabs', '{kaputt');
    expect(ladeTabs()).toEqual([]);
    localStorage.setItem('lexmetrik-tabs', '42');
    expect(ladeTabs()).toEqual([]);
  });
});
