import { describe, it, expect } from 'vitest';
import { permalinkKodieren, permalinkLesen, istISO, istKanton, einerVon, type PermalinkSpec } from '../lib/permalink';

// FAHRPLAN-PRAXIS 1.3: geteilter Permalink-Codec — Roundtrip + Validierung.

type T = { datum: string; anzahl: number; aktiv: boolean; kanton?: string; liste?: { typ: string; von: string }[] };
const SPEC: PermalinkSpec<T & Record<string, unknown>> = {
  datum: { p: 'd', typ: 'str', gueltig: istISO },
  anzahl: { p: 'n', typ: 'num', gueltig: (n) => Number.isInteger(n) && n > 0 },
  aktiv: { p: 'a', typ: 'bool' },
  kanton: { p: 'k', typ: 'str', gueltig: istKanton },
  liste: { p: 'j', typ: 'json', gueltig: (v) => Array.isArray(v) && v.every((e) => istISO((e as { von: string }).von)) },
};

describe('Permalink-Codec (lib/permalink.ts)', () => {
  it('Roundtrip: kodieren → lesen liefert identische Werte (inkl. bool false)', () => {
    const wert: T = { datum: '2026-06-06', anzahl: 30, aktiv: false, kanton: 'BS', liste: [{ typ: 'x', von: '2026-01-01' }] };
    const q = permalinkKodieren(SPEC, wert as T & Record<string, unknown>);
    expect(q).toContain('a=0'); // false überlebt explizit
    expect(permalinkLesen(SPEC, q)).toEqual(wert);
  });

  it('Validierung: ungültige Werte werden weggelassen, gültige bleiben', () => {
    const aus = permalinkLesen(SPEC, '?d=kein-datum&n=-3&a=2&k=XX&j=%7Bkaputt');
    expect(aus).toEqual({});
    const ok = permalinkLesen(SPEC, '?d=2026-06-06&n=10&k=ZH');
    expect(ok).toEqual({ datum: '2026-06-06', anzahl: 10, kanton: 'ZH' });
  });

  it('json: Liste mit ungültigem Eintrag wird als Ganzes verworfen', () => {
    const q = `?j=${encodeURIComponent(JSON.stringify([{ typ: 'x', von: 'nope' }]))}`;
    expect(permalinkLesen(SPEC, q)).toEqual({});
  });

  it('Leere/fehlende Werte erzeugen keine Parameter; leerer Query → leerer String', () => {
    const q = permalinkKodieren(SPEC, { datum: '', anzahl: NaN, aktiv: undefined as unknown as boolean });
    expect(q).toBe('');
  });

  it('einerVon: nur Katalogwerte passieren', () => {
    const g = einerVon('a', 'b');
    expect(g('a')).toBe(true);
    expect(g('c')).toBe(false);
  });

  it('Determinismus: gleiche Eingabe → gleicher Query-String', () => {
    const wert = { datum: '2026-06-06', anzahl: 5, aktiv: true } as T & Record<string, unknown>;
    expect(permalinkKodieren(SPEC, wert)).toBe(permalinkKodieren(SPEC, wert));
  });
});
