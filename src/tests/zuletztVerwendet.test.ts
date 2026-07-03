import { describe, it, expect, beforeEach } from 'vitest';
import { holeZuletzt, merkeBesuch } from '../lib/zuletztVerwendet';

// «Zuletzt verwendet»-Tracker (lib/zuletztVerwendet.ts): dedupe je route,
// neueste zuerst, Kappung auf MAX (6), korruptes/fehlendes localStorage.
// Reines Speicher-Werkzeug (§3), SSR-sicher/defensiv.
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

describe('zuletztVerwendet.ts', () => {
  it('leer beim Erstbesuch', () => {
    expect(holeZuletzt()).toEqual([]);
  });

  it('neuester Besuch steht vorne', () => {
    merkeBesuch({ route: '/rechner/tagerechner', titel: 'Fristenrechner' });
    merkeBesuch({ route: '/vorlagen/testament', titel: 'Testament' });
    expect(holeZuletzt().map((e) => e.route)).toEqual(['/vorlagen/testament', '/rechner/tagerechner']);
  });

  it('dedupe je route: erneuter Besuch wandert nach vorne, kein Duplikat', () => {
    merkeBesuch({ route: '/a', titel: 'A' });
    merkeBesuch({ route: '/b', titel: 'B' });
    merkeBesuch({ route: '/a', titel: 'A neu' });
    const e = holeZuletzt();
    expect(e.map((x) => x.route)).toEqual(['/a', '/b']);
    expect(e[0].titel).toBe('A neu'); // Titel aktualisiert
  });

  it('Kappung auf max. 6 — der älteste (hinten) fällt heraus', () => {
    for (let i = 0; i < 9; i++) merkeBesuch({ route: `/r${i}`, titel: `R${i}` });
    const e = holeZuletzt();
    expect(e.length).toBe(6);
    // neueste zuerst: r8 … r3
    expect(e.map((x) => x.route)).toEqual(['/r8', '/r7', '/r6', '/r5', '/r4', '/r3']);
  });

  it('zeit wird als Metadaten übernommen (Default 0)', () => {
    merkeBesuch({ route: '/a', titel: 'A', zeit: 1720000000000 });
    merkeBesuch({ route: '/b', titel: 'B' });
    const e = holeZuletzt();
    expect(e.find((x) => x.route === '/a')?.zeit).toBe(1720000000000);
    expect(e.find((x) => x.route === '/b')?.zeit).toBe(0);
  });

  it('ohne Titel oder Route wird nichts gemerkt (§8: kein Rohpfad-Chip)', () => {
    merkeBesuch({ route: '/a', titel: '' });
    merkeBesuch({ route: '', titel: 'X' });
    expect(holeZuletzt()).toEqual([]);
  });

  it('korruptes JSON / Nicht-Array → leere Liste (kein Crash)', () => {
    localStorage.setItem('lexmetrik-zuletzt', '{kaputt');
    expect(holeZuletzt()).toEqual([]);
    localStorage.setItem('lexmetrik-zuletzt', '42');
    expect(holeZuletzt()).toEqual([]);
    // defekte Einträge werden gefiltert (Typ-Guard)
    localStorage.setItem('lexmetrik-zuletzt', JSON.stringify([{ route: '/ok', titel: 'OK', zeit: 1 }, { route: 5 }]));
    expect(holeZuletzt().map((e) => e.route)).toEqual(['/ok']);
  });

  it('Migration: Alt-Eintrag OHNE titel wird still verworfen (kein Crash)', () => {
    // Frühere Fassungen konnten theoretisch title-lose Einträge hinterlassen;
    // der Typ-Guard verlangt titel:string → solche Zeilen fallen weg statt zu crashen.
    localStorage.setItem('lexmetrik-zuletzt', JSON.stringify([
      { route: '/gesetze/bund/OR', titel: 'OR', zeit: 2 },
      { route: '/rechtsprechung/alt', zeit: 1 },
    ]));
    expect(holeZuletzt().map((e) => e.route)).toEqual(['/gesetze/bund/OR']);
  });
});
