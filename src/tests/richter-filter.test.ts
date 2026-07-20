import { describe, it, expect } from 'vitest';
import { faltName, trefferFuer, naechsterSlug, vorigerSlug } from '../components/rechtsprechung/richterAuswahl';
import type { RichterZaehler } from '../lib/rechtsprechung/browse';

// Reine Auswahl-/Such-Arithmetik der Richter-Facette (keine Rechtslogik, §3).

const opt = (slug: string, name: string, count = 1): RichterZaehler => ({ slug, name, count });

describe('faltName', () => {
  it('macht Diakritika und Grossschreibung neutral', () => {
    expect(faltName('Müller')).toBe('muller');
    expect(faltName('André Equey')).toBe('andre equey');
    expect(faltName('Groß')).toBe('gross');
  });
});

describe('trefferFuer', () => {
  const liste = [opt('equey-andre', 'André Equey', 739), opt('mueller-m', 'M. Müller', 12), opt('oser-marc', 'Marc Oser', 425)];

  it('gibt ohne Eingabe die volle Liste in Reihenfolge zurück', () => {
    expect(trefferFuer(liste, '   ')).toEqual(liste);
  });
  it('findet über Teilstrings, diakritika-neutral', () => {
    expect(trefferFuer(liste, 'muller').map((o) => o.slug)).toEqual(['mueller-m']);
    expect(trefferFuer(liste, 'andre').map((o) => o.slug)).toEqual(['equey-andre']);
    expect(trefferFuer(liste, 'MARC').map((o) => o.slug)).toEqual(['oser-marc']);
  });
  it('liefert bei fehlendem Namen eine leere Liste (Leerzustand, kein Fehler)', () => {
    expect(trefferFuer(liste, 'zzz')).toEqual([]);
  });
  it('erhält die count-Sortierung der Eingabe', () => {
    expect(trefferFuer(liste, 'e').map((o) => o.slug)).toEqual(['equey-andre', 'mueller-m', 'oser-marc']);
  });
});

describe('naechsterSlug / vorigerSlug — Auswahl über den STABILEN Slug', () => {
  const liste = [opt('a', 'A'), opt('b', 'B'), opt('c', 'C')];

  it('ArrowDown ohne Auswahl nimmt den ersten, dann weiter, dann Wrap', () => {
    expect(naechsterSlug(liste, null)).toBe('a');
    expect(naechsterSlug(liste, 'a')).toBe('b');
    expect(naechsterSlug(liste, 'c')).toBe('a');
  });
  it('ArrowUp ohne Auswahl nimmt den letzten, dann rückwärts, dann Wrap', () => {
    expect(vorigerSlug(liste, null)).toBe('c');
    expect(vorigerSlug(liste, 'c')).toBe('b');
    expect(vorigerSlug(liste, 'a')).toBe('c');
  });
  it('springt bei verschwundenem Slug NIE auf die Nachbar-Person (#210-Lektion)', () => {
    // 'weg' steht nicht mehr in der Liste → Auswahl beginnt sauber von vorn/hinten.
    expect(naechsterSlug(liste, 'weg')).toBe('a');
    expect(vorigerSlug(liste, 'weg')).toBe('c');
  });
  it('bleibt auf leerer Liste ohne Auswahl', () => {
    expect(naechsterSlug([], null)).toBeNull();
    expect(vorigerSlug([], 'a')).toBeNull();
  });
});

describe('trefferFuer — «Vorname Nachname» bei nur-Nachname-Einträgen (20.7.2026)', () => {
  // Über die Hälfte der Facetten-Einträge ist reiner Nachname bzw. Initial+Nachname:
  // die Bundesgerichts-Rubra nennen keine Vornamen. Die natürliche Eingabe
  // «Thomas Stadelmann» lief darum in den Leerzustand «Keine Richter:in mit diesem
  // Namen …» — eine sachlich FALSCHE Aussage, denn die Person ist im Ausschnitt.
  const liste = [
    opt('stadelmann', 'Stadelmann', 213),
    opt('thomi-g', 'G. Thomi', 302),
    opt('denys', 'Denys', 189),
    opt('oser-marc', 'Marc Oser', 425),
  ];

  it('findet die Person über den Nachnamen, wenn ein Vorname mitgetippt wird', () => {
    expect(trefferFuer(liste, 'Thomas Stadelmann').map((o) => o.slug)).toEqual(['stadelmann']);
    expect(trefferFuer(liste, 'Gabrielle Thomi').map((o) => o.slug)).toEqual(['thomi-g']);
  });

  it('findet auch bei umgekehrter Wortstellung', () => {
    expect(trefferFuer(liste, 'Stadelmann Thomas').map((o) => o.slug)).toEqual(['stadelmann']);
  });

  it('lockert NICHT, solange die ganze Eingabe direkt trifft', () => {
    // «Marc Oser» trifft Stufe 1 — die Fallback-Stufen dürfen nicht zusätzlich
    // aufmachen, sonst verwässert eine präzise Eingabe.
    expect(trefferFuer(liste, 'Marc Oser').map((o) => o.slug)).toEqual(['oser-marc']);
  });

  it('bleibt beim echten Fehlschlag leer (kein Verlegenheitstreffer)', () => {
    expect(trefferFuer(liste, 'Zwygart Bäumlin')).toEqual([]);
  });
});
