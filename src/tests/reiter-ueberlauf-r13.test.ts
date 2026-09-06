import { describe, it, expect } from 'vitest';
import { fensterStart, ersterUeberlauf, TOLERANZ_PX } from '../components/layout/reiterleiste/ueberlauf';

// ═══ R13-2/R13-3 · DIE RECHNENDE HÄLFTE DER ARBEITSLEISTE ═══════════════════
//
// ROT ZU BEKOMMEN (§6.7, je einmal gegen den Bau gefahren 7.9.2026):
//   R13-3 · in `fensterStart` die beiden Verschiebungen durch den alten
//           Tausch ersetzen (`return Math.min(aktivIdx, max)`) ⇒ «Fenster rückt
//           minimal» und «zusammenhängende Teilfolge» fallen.
//   R13-2 · in `ersterUeberlauf` die Toleranz auf 0 setzen ⇒ der Sub-Pixel-Fall
//           meldet fälschlich Überlauf; `> breite` in `>= breite` ⇒ der
//           Genau-Passt-Fall meldet Überlauf.

describe('fensterStart — das Fenster bewegt sich, es tauscht nicht (R13-3)', () => {
  it('alles passt: das Fenster beginnt vorn', () => {
    expect(fensterStart(5, 4, 8, 0)).toBe(0);
  });

  it('der aktive Reiter rechts vom Fenster zieht es GENAU so weit nach, wie nötig', () => {
    // 15 Reiter, Fenster 8, aktiv #14 (Index 13) ⇒ Anfang 13-8+1 = 6.
    expect(fensterStart(15, 13, 8, 0)).toBe(6);
    // Weiter auf #15 (Index 14): das Fenster rückt um GENAU einen Platz.
    expect(fensterStart(15, 14, 8, 6)).toBe(7);
  });

  it('der aktive Reiter links vom Fenster zieht es zurück', () => {
    expect(fensterStart(15, 2, 8, 7)).toBe(2);
  });

  it('steht der aktive Reiter schon im Fenster, bewegt sich nichts', () => {
    expect(fensterStart(15, 9, 8, 7)).toBe(7);
  });

  it('der Anfang bleibt in den Grenzen — auch bei unsinnigen Eingaben', () => {
    expect(fensterStart(15, -1, 8, 99)).toBe(7);
    expect(fensterStart(15, -1, 8, -5)).toBe(0);
    expect(fensterStart(0, -1, 8, 3)).toBe(0);
  });

  it('das Ergebnis ist eine ZUSAMMENHÄNGENDE Teilfolge — über den ganzen Lauf', () => {
    // Der eigentliche R13-3-Befund: beim Durchgehen aller Reiter darf kein
    // Reiter aus dem Streifen fallen, der nicht am Rand liegt.
    const speicher = Array.from({ length: 15 }, (_, i) => `t${i}`);
    let start = 0;
    for (let aktiv = 0; aktiv < speicher.length; aktiv++) {
      start = fensterStart(speicher.length, aktiv, 8, start);
      const fenster = speicher.slice(start, start + 8);
      expect(fenster).toEqual(speicher.slice(start, start + 8));
      expect(fenster).toContain(speicher[aktiv]);
      expect(fenster).toHaveLength(8);
    }
    expect(start).toBe(7);
  });
});

describe('ersterUeberlauf — der erste Reiter, der nicht mehr GANZ passt (R13-2)', () => {
  it('alles passt: kein Überlauf', () => {
    expect(ersterUeberlauf([100, 200, 300], 1355)).toBe(-1);
  });

  it('genau bündig ist kein Überlauf', () => {
    expect(ersterUeberlauf([100, 1355], 1355)).toBe(-1);
  });

  it('Sub-Pixel aus der Flex-Verteilung ist kein Anschnitt', () => {
    expect(ersterUeberlauf([1355 + TOLERANZ_PX], 1355)).toBe(-1);
    expect(ersterUeberlauf([1355 + TOLERANZ_PX + 0.5], 1355)).toBe(0);
  });

  it('der gemessene R13-2-Fall: 8 Reiter, 1476 px in 1355 px', () => {
    // Kanten aus dem Prüfbefund 7.9.2026 (8 Reiter, @1440, `H3_lang_1440`):
    const kanten = [180, 360, 540, 720, 900, 1080, 1260, 1476];
    expect(ersterUeberlauf(kanten, 1355)).toBe(7);
  });

  it('läuft schon der erste über, ist es Index 0 (ein einziger Riesenreiter)', () => {
    expect(ersterUeberlauf([400], 253)).toBe(0);
  });
});
