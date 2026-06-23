import { describe, it, expect, beforeEach } from 'vitest';
import { ladeVerlauf, merkePfad, loescheVerlauf } from '../lib/verlauf';
import { verlaufLabel, gesetzPfad, entscheidPfad, labelAusMeta } from '../lib/verlaufLabel';
import type { BrowseManifest } from '../lib/normtext/browse-typen';
import type { EntscheidManifest } from '../lib/rechtsprechung/register';

// jsdom liefert ein echtes localStorage; falls nicht, ein Mini-Shim.
function frischerSpeicher() {
  const store = new Map<string, string>();
  // @ts-expect-error – Test-Shim
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
}

describe('verlauf: Ringpuffer', () => {
  beforeEach(() => { frischerSpeicher(); });

  it('neueste zuerst, Dublette per pathname zusammengeführt', () => {
    merkePfad('/rechner/tagerechner', 'Tagerechner');
    merkePfad('/vorlagen/testament', 'Testament');
    merkePfad('/rechner/tagerechner?fp=x', 'Tagerechner'); // gleicher pathname → vorne, einmal
    const v = ladeVerlauf();
    expect(v.map((e) => e.path)).toEqual(['/rechner/tagerechner?fp=x', '/vorlagen/testament']);
  });

  it('kappt auf 12 Einträge', () => {
    for (let i = 0; i < 20; i++) merkePfad(`/rechner/r${i}`);
    expect(ladeVerlauf().length).toBe(12);
  });

  it('loescheVerlauf leert', () => {
    merkePfad('/x');
    loescheVerlauf();
    expect(ladeVerlauf()).toEqual([]);
  });

  it('defekter Inhalt → leeres Ergebnis statt Wurf', () => {
    localStorage.setItem('lexmetrik-verlauf', '{kaputt');
    expect(ladeVerlauf()).toEqual([]);
  });
});

describe('verlaufLabel: Pfad-Erkennung', () => {
  it('erkennt Gesetzes- und Entscheid-Leserpfade', () => {
    expect(gesetzPfad('/gesetze/bund/OR')).toEqual({ ebene: 'bund', key: 'OR' });
    expect(gesetzPfad('/gesetze/kanton/ZH-131.1?x=1')).toEqual({ ebene: 'kanton', key: 'ZH-131.1' });
    expect(gesetzPfad('/rechner/x')).toBeNull();
    expect(entscheidPfad('/rechtsprechung/bge-1')).toEqual({ key: 'bge-1' });
    expect(entscheidPfad('/rechtsprechung')).toBeNull();
  });

  it('löst Katalog-/statische Labels aus den Metadaten', () => {
    // '/' ist eine statische Seite → Label ohne « — LexMetrik»-Suffix.
    const l = labelAusMeta('/');
    expect(l).toBeTruthy();
    expect(l).not.toMatch(/—\s*LexMetrik/);
  });
});

describe('verlaufLabel: Manifest-Lookup', () => {
  const gesetze = { erzeugt: '', erlasse: [
    { key: 'OR', ebene: 'bund', kuerzel: 'OR', titel: 'Obligationenrecht' },
  ] } as unknown as BrowseManifest;
  const entscheide = { erzeugt: '', entscheide: [
    { key: 'bge-1', zitierung: 'BGE 150 III 1' },
  ] } as unknown as EntscheidManifest;

  it('Gesetz → Kürzel, Entscheid → Zitierung', () => {
    expect(verlaufLabel('/gesetze/bund/OR', { gesetze })).toBe('OR');
    expect(verlaufLabel('/rechtsprechung/bge-1', { entscheide })).toBe('BGE 150 III 1');
  });

  it('ohne Manifest ehrliches Platzhalter-Label statt Rohpfad', () => {
    expect(verlaufLabel('/gesetze/bund/OR')).toBe('Gesetz öffnen');
    expect(verlaufLabel('/rechtsprechung/bge-1')).toBe('Entscheid öffnen');
  });
});
