/**
 * Tests für sachgruppe() — die deterministische Zuordnung eines kantonalen
 * Erlasses zu seinem amtlichen Top-Level-Sachgebiet (Längster-Präfix-Match im
 * Systematik-Baum). Deckt die abweichenden Schemata ab, an denen eine naive
 * «erste Ziffer»-Logik scheitern würde (AI Hunderter, UR 10/40).
 */
import { describe, it, expect } from 'vitest';
import { sachgruppe, sachgebietRang, type KantonSystematik } from '../lib/normtext/systematik';

const BS: KantonSystematik = {
  roots: [{ nummer: '1', name: 'Staat' }, { nummer: '6', name: 'Finanzen' }],
  index: { '1': '1', '17': '1', '170': '1', '6': '6', '64': '6', '640': '6' },
};
const AI: KantonSystematik = {
  roots: [{ nummer: '100', name: 'Staat' }, { nummer: '600', name: 'Finanzen' }],
  index: { '100': '100', '170': '100', '172': '100', '600': '600', '613': '600' },
};
const UR: KantonSystematik = {
  roots: [{ nummer: '1', name: 'Staat' }, { nummer: '10', name: 'Schule' }, { nummer: '40', name: 'Umwelt' }],
  index: { '1': '1', '10': '10', '101': '10', '40': '40', '401': '40' },
};

describe('sachgruppe', () => {
  it('einfaches Dezimalschema (BS): führende Ziffer', () => {
    expect(sachgruppe(BS, '640.100')).toEqual({ schluessel: '6', titel: 'Finanzen' });
    expect(sachgruppe(BS, '170.100')).toEqual({ schluessel: '1', titel: 'Staat' });
  });

  it('Hunderter-Schema (AI): mappt 172.600 auf Wurzel 100, nicht 1', () => {
    expect(sachgruppe(AI, '172.600')).toEqual({ schluessel: '100', titel: 'Staat' });
    expect(sachgruppe(AI, '613.010')).toEqual({ schluessel: '600', titel: 'Finanzen' });
  });

  it('UR-Schema: 40.x → 40 (nicht 4), 10.x → 10 (nicht 1), 1.x → 1', () => {
    expect(sachgruppe(UR, '40.1111').schluessel).toBe('40');
    expect(sachgruppe(UR, '10.1211').schluessel).toBe('10');
    expect(sachgruppe(UR, '1.5').schluessel).toBe('1');
  });

  it('neutraler Fallback ohne Systematik-Daten (führende Ziffer, ehrliches Label)', () => {
    expect(sachgruppe(undefined, '640.100')).toEqual({ schluessel: '6', titel: 'Bereich 6' });
  });

  it('Nummer ohne Ziffer → «Ohne Systematik-Nummer»', () => {
    expect(sachgruppe(BS, 'ABC')).toEqual({ schluessel: '~', titel: 'Ohne Systematik-Nummer' });
    expect(sachgruppe(undefined, null)).toEqual({ schluessel: '~', titel: 'Ohne Systematik-Nummer' });
  });

  it('sachgebietRang ordnet nach amtlicher Baum-Reihenfolge, Unbekanntes hinten', () => {
    const rang = sachgebietRang(UR);
    expect(rang('1')).toBeLessThan(rang('10'));
    expect(rang('10')).toBeLessThan(rang('40'));
    expect(rang('~')).toBe(999);
  });
});
