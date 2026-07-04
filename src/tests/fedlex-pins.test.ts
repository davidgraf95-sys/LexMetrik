import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { lesePins } from '../../scripts/fedlex-pins';

// ─── P1-b Parser-Selbsttest (QS-CURRENCY) ────────────────────────────────────
// Der Pin-Parser (fedlex-pins.ts) ist die SSoT-Brücke zwischen cache.sh und
// check:fedlex-versionen. Ein zu enger Namens-Regex (`[a-z_]+`) hat 11 Ziffern-
// Namen-Pins still verschluckt → parser-blindes Monitoring-Loch. Dieser Test
// verankert dauerhaft: JEDE Datenzeile in cache.sh wird als Pin gelesen.

const CACHE_SH = resolve(__dirname, '../../scripts/fedlex-cache.sh');
const sh = readFileSync(CACHE_SH, 'utf8');

// Datenzeile = eine Array-Zeile `"name|eli|YYYYMMDD|N|anker|sr"` (Ziffern im
// Namen erlaubt). Bewusst unabhängig von der lesePins()-Regex formuliert, damit
// der Test eine echte Gegenprobe ist (nicht dieselbe Regex spiegelt).
const datenZeilen = sh
  .split('\n')
  .filter((z) => /^\s*"[^|"]+\|[^|]+\|\d{8}\|/.test(z));

describe('fedlex-pins Parser-Selbsttest', () => {
  it('liest GENAU so viele Pins wie cache.sh Datenzeilen hat', () => {
    const pins = lesePins();
    expect(pins.length).toBe(datenZeilen.length);
    // Regressionsschwelle: die Basis darf nicht unbemerkt schrumpfen.
    expect(pins.length).toBeGreaterThanOrEqual(218);
  });

  it('liest die Ziffern-Namen-Pins (früher parser-blind)', () => {
    const namen = new Set(lesePins().map((p) => p.name));
    for (const blind of [
      'asylv1', 'asylv2', 'asylv3',
      'argv1', 'argv2', 'argv3', 'argv4', 'argv5',
      'bvv_2', 'bvv3', 'co2_gesetz',
    ]) {
      expect(namen.has(blind)).toBe(true);
    }
  });

  it('kein Pin-Name/ELI wird durch die Regex leer geparst', () => {
    for (const p of lesePins()) {
      expect(p.name).toMatch(/^[a-z0-9_]+$/);
      expect(p.eli).toMatch(/^[a-z0-9/_]+$/);
      expect(p.kons).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('Pin-Namen sind eindeutig (kein Duplikat/Kollision in cache.sh)', () => {
    const namen = lesePins().map((p) => p.name);
    expect(new Set(namen).size).toBe(namen.length);
  });
});
