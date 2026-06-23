/**
 * Tests für sachgruppe() & Titel-Helfer — die deterministische Zuordnung eines
 * kantonalen Erlasses zu Top-Sachgebiet + Untergruppe (Längster-Präfix-Match im
 * Systematik-Baum). Deckt abweichende Schemata ab (AI Hunderter, UR 10/40).
 */
import { describe, it, expect } from 'vitest';
import {
  sachgruppe, topTitel, subTitel, sachgebietRang, untergruppeRang,
  type KantonSystematik,
} from '../lib/normtext/systematik';

const BS: KantonSystematik = {
  roots: [
    { nummer: '1', name: 'Staat', kinder: [{ nummer: '17', name: 'Gemeinden' }] },
    { nummer: '6', name: 'Finanzen', kinder: [{ nummer: '64', name: 'Allgemeine Steuern' }, { nummer: '61', name: 'Finanzordnung' }] },
  ],
  index: { '1': ['1', ''], '17': ['1', '17'], '170': ['1', '17'], '6': ['6', ''], '64': ['6', '64'], '640': ['6', '64'] },
};
const AI: KantonSystematik = {
  roots: [{ nummer: '100', name: 'Staat', kinder: [] }, { nummer: '600', name: 'Finanzen', kinder: [] }],
  index: { '100': ['100', ''], '172': ['100', '170'], '600': ['600', ''], '613': ['600', '610'] },
};
const UR: KantonSystematik = {
  roots: [{ nummer: '1', name: 'Staat', kinder: [] }, { nummer: '10', name: 'Schule', kinder: [] }, { nummer: '40', name: 'Umwelt', kinder: [] }],
  index: { '1': ['1', ''], '10': ['10', ''], '101': ['10', ''], '40': ['40', ''], '401': ['40', ''] },
};

describe('sachgruppe', () => {
  it('einfaches Dezimalschema (BS): Top + Untergruppe', () => {
    expect(sachgruppe(BS, '640.100')).toEqual({ top: '6', sub: '64' });
    expect(sachgruppe(BS, '170.100')).toEqual({ top: '1', sub: '17' });
  });

  it('Hunderter-Schema (AI): 172.600 → Top 100 (nicht 1)', () => {
    expect(sachgruppe(AI, '172.600')).toEqual({ top: '100', sub: '170' });
    expect(sachgruppe(AI, '613.010')).toEqual({ top: '600', sub: '610' });
  });

  it('UR-Schema: 40.x → 40, 10.x → 10, 1.x → 1', () => {
    expect(sachgruppe(UR, '40.1111').top).toBe('40');
    expect(sachgruppe(UR, '10.1211').top).toBe('10');
    expect(sachgruppe(UR, '1.5').top).toBe('1');
  });

  it('neutraler Fallback ohne Daten: führende Ziffer, leere Untergruppe', () => {
    expect(sachgruppe(undefined, '640.100')).toEqual({ top: '6', sub: '' });
    expect(topTitel(undefined, '6')).toBe('Bereich 6');
  });

  it('Nummer ohne Ziffer → «Ohne Systematik-Nummer»', () => {
    expect(sachgruppe(BS, 'ABC')).toEqual({ top: '~', sub: '' });
    expect(topTitel(BS, '~')).toBe('Ohne Systematik-Nummer');
  });

  it('topTitel/subTitel liefern amtliche Namen', () => {
    expect(topTitel(BS, '6')).toBe('Finanzen');
    expect(subTitel(BS, '6', '64')).toBe('Allgemeine Steuern');
    expect(subTitel(BS, '6', '')).toBe('');
  });

  it('Reihenfolge: Top nach Baum, Untergruppe nach Baum (leere zuerst)', () => {
    const rt = sachgebietRang(BS);
    expect(rt('1')).toBeLessThan(rt('6'));
    expect(rt('~')).toBe(999);
    const ru = untergruppeRang(BS, '6');
    expect(ru('')).toBeLessThan(ru('64')); // direkte (ohne Untergruppe) zuerst
    expect(ru('64')).toBeLessThan(ru('61')); // Baum-Reihenfolge: 64 vor 61
  });
});
