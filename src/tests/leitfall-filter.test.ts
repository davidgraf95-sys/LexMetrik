import { describe, it, expect } from 'vitest';
import { filtereLeitfaelleNachZeitraum, zeitraumLabel } from '../pages/gesetz-leser/leitfallFilter';
import type { LeitfallRef } from '../lib/rechtsprechung/norm-index';

function ref(key: string, datum: string): LeitfallRef {
  return {
    key,
    zitierung: key,
    regesteKurz: null,
    datum,
    leitcharakter: 'leitentscheid',
    gericht: 'bge',
    kanton: '',
    gewicht: 1,
  };
}

describe('filtereLeitfaelleNachZeitraum (V2·B-2)', () => {
  const refs = [
    ref('bge_neu', '2024-05-01'),
    ref('bge_band', '2020-01-01'), // Bandjahr-Platzhalter
    ref('bge_alt', '2010-03-12'),
    ref('bge_uralt', '1999-11-30'),
  ];
  const JETZT = 2026;

  it('«alle» gibt alles zurück (neue Referenz, unverändert sortiert)', () => {
    const r = filtereLeitfaelleNachZeitraum(refs, 'alle', JETZT);
    expect(r).toHaveLength(4);
    expect(r).not.toBe(refs); // Kopie, nicht dieselbe Referenz
  });

  it('«5 J.» behält nur die letzten 5 Jahre (Grenzjahr inklusiv)', () => {
    const r = filtereLeitfaelleNachZeitraum(refs, '5', JETZT); // Grenzjahr 2021
    expect(r.map((x) => x.key)).toEqual(['bge_neu']);
  });

  it('«10 J.» behält 2024 + Bandjahr 2020 (jahr-genau, Q1-sicher)', () => {
    const r = filtereLeitfaelleNachZeitraum(refs, '10', JETZT); // Grenzjahr 2016
    expect(r.map((x) => x.key)).toEqual(['bge_neu', 'bge_band']);
  });

  it('«20 J.» behält bis 2006 (2010 drin, 1999 raus)', () => {
    const r = filtereLeitfaelleNachZeitraum(refs, '20', JETZT); // Grenzjahr 2006
    expect(r.map((x) => x.key)).toEqual(['bge_neu', 'bge_band', 'bge_alt']);
  });

  it('unparsbares Datum wird konservativ behalten (§8)', () => {
    const r = filtereLeitfaelleNachZeitraum([ref('bge_ohne', 'n/a')], '5', JETZT);
    expect(r).toHaveLength(1);
  });

  it('zeitraumLabel: «alle» ⇒ null, sonst «letzte N J.»', () => {
    expect(zeitraumLabel('alle')).toBeNull();
    expect(zeitraumLabel('10')).toBe('letzte 10 J.');
  });
});
