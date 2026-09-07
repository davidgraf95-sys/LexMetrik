import { describe, it, expect } from 'vitest';
import {
  GRUSS_MAX_ZEICHEN, IMMER, TAGESZEITEN,
  begruessungsPool, tageszeitFuer, waehleBegruessung,
} from '../lib/begruessungen';

// ─── Begrüssungs-Pools (W2·23-STARTSEITE-V4 §4) ─────────────────────────────
//
// Wächter für die vier Zusagen, die der Fahrplan an die Pools stellt: jeder Pool
// gefüllt, keine Doppelung, Tageszeit-Abdeckung 0–23 lückenlos, und (als
// Layout-Zusage) jeder Gruss kurz genug für eine Zeile auf 390 px.

const ALLE = [...IMMER, ...TAGESZEITEN.flatMap((t) => t.pool)];

describe('Begrüssungs-Pools', () => {
  it('kein Pool ist leer', () => {
    expect(IMMER.length).toBeGreaterThan(0);
    for (const t of TAGESZEITEN) {
      expect(t.pool.length, `Pool ${t.id} leer`).toBeGreaterThan(0);
    }
  });

  it('jede Tageszeit trägt genügend Abwechslung (§4: ~15–25 je Fenster)', () => {
    for (const t of TAGESZEITEN) {
      expect(t.pool.length, `Pool ${t.id}`).toBeGreaterThanOrEqual(15);
      expect(t.pool.length, `Pool ${t.id}`).toBeLessThanOrEqual(25);
    }
  });

  it('kein Gruss steht zweimal — auch nicht über Pool-Grenzen hinweg', () => {
    const doppelt = ALLE.filter((g, i) => ALLE.indexOf(g) !== i);
    expect(doppelt).toEqual([]);
  });

  it('jeder Gruss endet mit einem Satzzeichen (ganzer Satz oder Gruss mit Punkt)', () => {
    expect(ALLE.filter((g) => !/[.?!]$/.test(g))).toEqual([]);
  });

  it('kein Gruss ist länger als GRUSS_MAX_ZEICHEN (Einzeiligkeit @390 px)', () => {
    expect(ALLE.filter((g) => g.length > GRUSS_MAX_ZEICHEN)).toEqual([]);
  });

  it('die Tageszeit-Zuordnung deckt 0–23 lückenlos ab', () => {
    for (let h = 0; h < 24; h++) {
      const t = tageszeitFuer(h);
      expect(t, `Stunde ${h} ohne Tageszeit`).toBeTruthy();
      expect(begruessungsPool(h).length).toBeGreaterThan(IMMER.length);
    }
    // Fenster-Grenzen explizit (die Nacht überspannt Mitternacht).
    expect(tageszeitFuer(0).id).toBe('nacht');
    expect(tageszeitFuer(4).id).toBe('nacht');
    expect(tageszeitFuer(5).id).toBe('morgen');
    expect(tageszeitFuer(9).id).toBe('morgen');
    expect(tageszeitFuer(10).id).toBe('tag');
    expect(tageszeitFuer(14).id).toBe('nachmittag');
    expect(tageszeitFuer(18).id).toBe('abend');
    expect(tageszeitFuer(21).id).toBe('abend');
    expect(tageszeitFuer(22).id).toBe('nacht');
    expect(tageszeitFuer(23).id).toBe('nacht');
  });

  it('der «immer»-Pool kommt zu JEDER Tageszeit dazu', () => {
    for (const t of TAGESZEITEN) {
      const pool = begruessungsPool(t.ab);
      for (const g of IMMER) expect(pool, `${t.id} ohne «${g}»`).toContain(g);
    }
  });

  it('waehleBegruessung ist bei fester Zufallsquelle deterministisch und bleibt im Pool', () => {
    const pool = begruessungsPool(8);
    expect(waehleBegruessung(8, () => 0)).toBe(pool[0]);
    // Randfall: 1 darf nicht über das Pool-Ende laufen.
    expect(waehleBegruessung(8, () => 0.999999)).toBe(pool[pool.length - 1]);
    expect(waehleBegruessung(8, () => 1)).toBe(pool[pool.length - 1]);
    for (const p of [0, 0.25, 0.5, 0.75, 0.99]) {
      expect(pool).toContain(waehleBegruessung(8, () => p));
    }
  });

  it('NEGATIV-KONTROLLE: die Wächter greifen bei den gestrichenen Formen', () => {
    // §4-Auflage: Sprichwort-Fragmente sind raus. Der Längen- bzw.
    // Satzzeichen-Wächter fängt genau solche Einträge.
    expect(/[.?!]$/.test('Der frühe Vogel …')).toBe(false);
    expect('Schön, dass Sie Recht behalten wollen.'.length).toBeGreaterThan(GRUSS_MAX_ZEICHEN);
  });
});
