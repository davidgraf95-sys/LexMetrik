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
//
// AUSBAU 8.9.2026 (Sidequest David, DEKLARIERTE fachliche Änderung — kein
// Refactoring, §6.3): acht Tageszeit-Fenster statt fünf, je 30–45 Grüsse,
// «immer» 30–40. Angepasst sind darum genau zwei Zusagen — die Pool-Grössen
// und die Fenster-Grenzen. Doppelungs-, Satzzeichen-, Längen- und
// Lückenlosigkeits-Wächter bleiben Wort für Wort, wie sie waren; neu dazu
// kommt ein Wächter auf die gestrichenen Formen (§4-Auflage), der bisher nur
// als Prosa im Kopfkommentar der Pool-Datei stand.

const ALLE = [...IMMER, ...TAGESZEITEN.flatMap((t) => t.pool)];

describe('Begrüssungs-Pools', () => {
  it('kein Pool ist leer', () => {
    expect(IMMER.length).toBeGreaterThan(0);
    for (const t of TAGESZEITEN) {
      expect(t.pool.length, `Pool ${t.id} leer`).toBeGreaterThan(0);
    }
  });

  it('jede Tageszeit trägt genügend Abwechslung (Ausbau 8.9.2026: 30–45 je Fenster)', () => {
    for (const t of TAGESZEITEN) {
      expect(t.pool.length, `Pool ${t.id}`).toBeGreaterThanOrEqual(30);
      expect(t.pool.length, `Pool ${t.id}`).toBeLessThanOrEqual(45);
    }
  });

  it('der «immer»-Pool trägt 30–40 Grüsse', () => {
    expect(IMMER.length).toBeGreaterThanOrEqual(30);
    expect(IMMER.length).toBeLessThanOrEqual(40);
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
    // Fenster-Grenzen explizit (die Nacht überspannt Mitternacht). Acht
    // Fenster seit dem Ausbau 8.9.2026 — je erste UND letzte Stunde geprüft,
    // damit eine verschobene Grenze nicht zwischen zwei Stichproben durchfällt.
    expect(tageszeitFuer(0).id).toBe('nacht');
    expect(tageszeitFuer(4).id).toBe('nacht');
    expect(tageszeitFuer(5).id).toBe('fruehmorgen');
    expect(tageszeitFuer(6).id).toBe('fruehmorgen');
    expect(tageszeitFuer(7).id).toBe('morgen');
    expect(tageszeitFuer(9).id).toBe('morgen');
    expect(tageszeitFuer(10).id).toBe('vormittag');
    expect(tageszeitFuer(11).id).toBe('vormittag');
    expect(tageszeitFuer(12).id).toBe('mittag');
    expect(tageszeitFuer(13).id).toBe('mittag');
    expect(tageszeitFuer(14).id).toBe('nachmittag');
    expect(tageszeitFuer(16).id).toBe('nachmittag');
    expect(tageszeitFuer(17).id).toBe('feierabend');
    expect(tageszeitFuer(18).id).toBe('feierabend');
    expect(tageszeitFuer(19).id).toBe('abend');
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

  it('kein Gruss trägt eine der gestrichenen Formen (§4-Auflage)', () => {
    // Sprichwort-Fragmente, Anbiederndes und Werbe-Formeln — der Kopfkommentar
    // der Pool-Datei zählt sie auf, hier stehen sie mechanisch. Emoji-Bereich
    // mit dabei: die Zeile ist Literata-Fliesstext, kein Icon-Platz.
    const GESTRICHEN =
      /Hallöchen|Servus|Vogel|Morgenstund|Schaffe|Willkommen im|[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/iu;
    expect(ALLE.filter((g) => GESTRICHEN.test(g))).toEqual([]);
    // Der Wächter kann scheitern (§6.7) — die gestrichenen Originale zeigen es.
    expect(GESTRICHEN.test('Der frühe Vogel fängt den Wurm.')).toBe(true);
    expect(GESTRICHEN.test('Willkommen im Paragraphendickicht.')).toBe(true);
    expect(GESTRICHEN.test('Grüezi mitenand.')).toBe(false);
  });

  it('NEGATIV-KONTROLLE: die Wächter greifen bei den gestrichenen Formen', () => {
    // §4-Auflage: Sprichwort-Fragmente sind raus. Der Längen- bzw.
    // Satzzeichen-Wächter fängt genau solche Einträge.
    expect(/[.?!]$/.test('Der frühe Vogel …')).toBe(false);
    expect('Schön, dass Sie Recht behalten wollen.'.length).toBeGreaterThan(GRUSS_MAX_ZEICHEN);
  });
});
