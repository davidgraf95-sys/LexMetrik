import { describe, it, expect, beforeEach } from 'vitest';
import { ladeTabs, merkeTab, schliesseTab, leereTabs, ordneTabsUm, naechsteInstanz, aktualisiereTabArtikel } from '../lib/tabs';

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

  it('MAX 50: der älteste (vorn) fällt heraus (Limit 8→50, Auftrag David)', () => {
    for (let i = 0; i < 52; i++) merkeTab(`/rechner/r${i}`);
    const t = ladeTabs();
    expect(t.length).toBe(50);
    expect(t[0].path).toBe('/rechner/r2');
    expect(t[49].path).toBe('/rechner/r51');
  });

  it('?r-Diskriminator: dasselbe Gesetz mehrfach offen (Auftrag David)', () => {
    merkeTab('/gesetze/bund/OR');
    merkeTab('/gesetze/bund/OR?r=2');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/OR', '/gesetze/bund/OR?r=2']);
    // andere Query (kein ?r) bleibt EIN Reiter
    merkeTab('/gesetze/bund/OR?preset=x');
    expect(ladeTabs().length).toBe(2);
  });

  it('naechsteInstanz: nächster freier ?r, Artikel-Anker bleibt erhalten', () => {
    merkeTab('/gesetze/bund/OR');
    expect(naechsteInstanz('/gesetze/bund/OR#art-41')).toBe('/gesetze/bund/OR?r=2#art-41');
    merkeTab('/gesetze/bund/OR?r=2');
    expect(naechsteInstanz('/gesetze/bund/OR')).toBe('/gesetze/bund/OR?r=3');
  });

  it('aktualisiereTabArtikel ändert nur den Anker des passenden Reiters', () => {
    merkeTab('/gesetze/bund/OR?r=2');
    aktualisiereTabArtikel('/gesetze/bund/OR?r=2#art-97');
    expect(ladeTabs()[0].path).toBe('/gesetze/bund/OR?r=2#art-97');
    // kein passender Reiter → keine Änderung, kein Crash
    aktualisiereTabArtikel('/gesetze/bund/ZGB#art-1');
    expect(ladeTabs().length).toBe(1);
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
