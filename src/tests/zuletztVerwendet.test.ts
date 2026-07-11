import { describe, it, expect, beforeEach } from 'vitest';
import { holeZuletzt, merkeBesuch, typVonRoute, leereZuletzt } from '../lib/zuletztVerwendet';

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

  it('Kappung auf max. 12 — der älteste (hinten) fällt heraus (O1: von 6 erhöht für den Topbar-Verlauf)', () => {
    for (let i = 0; i < 15; i++) merkeBesuch({ route: `/r${i}`, titel: `R${i}` });
    const e = holeZuletzt();
    expect(e.length).toBe(12);
    // neueste zuerst: r14 … r3
    expect(e.map((x) => x.route)).toEqual(['/r14', '/r13', '/r12', '/r11', '/r10', '/r9', '/r8', '/r7', '/r6', '/r5', '/r4', '/r3']);
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

  it('typVonRoute leitet den Inhalts-Typ aus der ersten Pfadebene ab (§2 deterministisch)', () => {
    expect(typVonRoute('/rechner/tagerechner')).toBe('rechner');
    expect(typVonRoute('/vorlagen/testament')).toBe('vorlage');
    expect(typVonRoute('/gesetze/bund/OR')).toBe('gesetz');
    expect(typVonRoute('/gesetze/bund/OR#art-1')).toBe('gesetz');
    expect(typVonRoute('/rechtsprechung/bge-1')).toBe('entscheid');
    expect(typVonRoute('/materialien/estv-ks-1')).toBe('material');
    expect(typVonRoute('/irgendwas')).toBe('seite');
  });

  it('merkeBesuch speichert den Typ (explizit oder aus der Route abgeleitet)', () => {
    merkeBesuch({ route: '/gesetze/bund/OR', titel: 'OR' }); // abgeleitet
    merkeBesuch({ route: '/x', titel: 'X', typ: 'material' }); // explizit
    const e = holeZuletzt();
    expect(e.find((x) => x.route === '/gesetze/bund/OR')?.typ).toBe('gesetz');
    expect(e.find((x) => x.route === '/x')?.typ).toBe('material');
  });

  it('Migration: Alt-Eintrag ohne typ bekommt den Typ aus der Route (kein Verwerfen)', () => {
    localStorage.setItem('lexmetrik-zuletzt', JSON.stringify([{ route: '/rechtsprechung/alt', titel: 'BGE', zeit: 1 }]));
    expect(holeZuletzt()[0].typ).toBe('entscheid');
  });

  it('leereZuletzt entfernt den ganzen Verlauf', () => {
    merkeBesuch({ route: '/a', titel: 'A' });
    expect(holeZuletzt().length).toBe(1);
    leereZuletzt();
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
