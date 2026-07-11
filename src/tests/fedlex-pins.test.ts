import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { lesePins, lesePinsVoll } from '../../scripts/fedlex-pins';
import { nAusUrl } from '../../scripts/fedlex-manifest';

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

// ─── P1-a/b Kanonik: voller Pin-Parser + html-N-Extraktion ───────────────────
describe('fedlex-pins lesePinsVoll + Manifest-Kanonik', () => {
  it('lesePinsVoll liest exakt so viele Pins wie lesePins (gleiches 6-Feld-Format)', () => {
    expect(lesePinsVoll().length).toBe(lesePins().length);
  });

  it('parst n als Zahl, anker als Liste, sr-Feld', () => {
    const or = lesePinsVoll().find((p) => p.name === 'or');
    expect(or).toBeTruthy();
    expect(Number.isInteger(or!.n)).toBe(true);
    expect(or!.anker.length).toBeGreaterThan(0);
    expect(or!.anker.every((a) => /^art_/.test(a))).toBe(true);
    expect(or!.sr).toBe('220');
    expect(or!.konsKompakt).toMatch(/^\d{8}$/);
  });

  it('nAusUrl liest das kanonische html-N (Suffix bzw. echt suffixlos=0)', () => {
    const base = 'https://x/eli/cc/2009/615/20250331/de/html/fedlex-data-admin-ch-eli-cc-2009-615-20250331-de-html';
    expect(nAusUrl(`${base}-3.html`)).toBe(3);
    expect(nAusUrl(`${base}-14.html`)).toBe(14);
    expect(nAusUrl(`${base}.html`)).toBe(0);
    expect(nAusUrl('https://x/foo.pdf')).toBeNull();
  });
});
