/**
 * Selbsttest für den Pin-Parser (scripts/fedlex-pins.ts) — Paket 1 QS-CURRENCY.
 *
 * Hintergrund (Befund 2./3.7.2026): Die alte Namensgruppe ([a-z_]+) hat Pins
 * mit Ziffern im Namen (asylv1, argv2, bvv3, co2_gesetz, …) STILL verworfen —
 * sie sahen gepinnt aus, waren aber vom Currency-Monitoring
 * (check:fedlex-versionen) unsichtbar. Dieser Test bindet den Parser an die
 * cache.sh-Realität: JEDE EINTRAEGE-Zeile muss geparst werden.
 *
 * §2: kein Netz, kein Date.now — liest nur die committete cache.sh.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { lesePins } from '../../scripts/fedlex-pins.ts';

const CACHE_SH = resolve(__dirname, '../../scripts/fedlex-cache.sh');

/** Roh-Zählung: jede EINTRAEGE-Zeile («"…|…|YYYYMMDD|…"») unabhängig vom
 *  Namens-Zeichensatz — bewusst LOCKERER als der Parser, damit ein künftig
 *  eingeführtes Namenszeichen (Ziffer, Bindestrich, …) als Diff auffällt. */
function zaehleRohZeilen(sh: string): number {
  return [...sh.matchAll(/^\s*"[^"|]+\|[^"|]+\|\d{8}\|/gm)].length;
}

describe('fedlex-pins — Parser deckt jede cache.sh-Zeile (Coverage-Selbsttest)', () => {
  const sh = readFileSync(CACHE_SH, 'utf8');

  it('geparste Pins == Roh-Zeilen der cache.sh (kein parser-blinder Pin)', () => {
    const pins = lesePins(sh);
    expect(pins.length).toBe(zaehleRohZeilen(sh));
    expect(pins.length).toBeGreaterThanOrEqual(218); // Stand 3.7.2026: 218 Pins
  });

  it('Pin-Namen sind eindeutig (keine Doppel-Zeile)', () => {
    const namen = lesePins(sh).map((p) => p.name);
    expect(new Set(namen).size).toBe(namen.length);
  });

  it('Ziffern-Namen werden geparst (Regressions-Anker für den [a-z0-9_]-Fix)', () => {
    const namen = new Set(lesePins(sh).map((p) => p.name));
    for (const n of ['asylv1', 'asylv2', 'asylv3', 'argv1', 'argv2', 'argv3', 'argv4', 'argv5', 'bvv_2', 'bvv3', 'co2_gesetz']) {
      expect(namen.has(n), `Pin «${n}» fehlt im Parser-Ergebnis`).toBe(true);
    }
  });

  it('kons wird als ISO-Datum geliefert', () => {
    for (const p of lesePins(sh)) {
      expect(p.kons).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
