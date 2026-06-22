/**
 * TDD-Test für ZH-211.11 § 3 + § 4 Streitwert-Staffel-Extraktion.
 *
 * Verifiziert die generalisierten extrahiereZhStreitwertStaffel-Formen:
 *
 * § 3 (2-Spalten, h=7.98): Streitwert | Gebühr
 *   kopf: ['Streitwert', 'Gebühr']
 *   Datenzeile «über 1 000 bis 10 000»: Streitwert korrekt, Gebühr '250–420'
 *
 * § 4 (3-Spalten, h=7.50): Streitwert | Grundgebühr | Zuschlag
 *   kopf: ['Streitwert', 'Grundgebühr', 'Zuschlag']
 *   Datenzeile «über 1 000 bis 5 000»: «5000250» → Streitwert 'über 1 000 bis 5 000',
 *   Grundgebühr '250', Zuschlag starts with 'zuzügl.'
 *
 * Fixture: src/tests/fixtures/zh-211.11-par34-stuecke.json
 * (echte pdfjs-Stücke aus ZH-211.11-PDF, Abruf 22.6.2026, §7)
 */
import { describe, it, expect } from 'vitest';
import { extrahiereZhStreitwertStaffel } from '../../scripts/normtext/adapter-zh-pdf.ts';
import FIXTURE_RAW from './fixtures/zh-211.11-par34-stuecke.json';

const PAR3 = (FIXTURE_RAW as { par3: Array<{ x: number; y: number; h: number; s: string; p: number }>; par4: Array<{ x: number; y: number; h: number; s: string; p: number }> }).par3;
const PAR4 = (FIXTURE_RAW as { par3: Array<{ x: number; y: number; h: number; s: string; p: number }>; par4: Array<{ x: number; y: number; h: number; s: string; p: number }> }).par4;

// ── § 3 Tests (2-Spalten: Streitwert | Gebühr) ──────────────────────────────

describe('ZH-211.11 § 3 — 2-Spalten-Tabelle (Streitwert | Gebühr)', () => {
  it('liefert ein Ergebnis (nicht null)', () => {
    const r = extrahiereZhStreitwertStaffel(PAR3);
    expect(r).not.toBeNull();
  });

  it('kopf = [Streitwert, Gebühr] (2-Spalten-Form)', () => {
    const r = extrahiereZhStreitwertStaffel(PAR3)!;
    expect(r.kopf).toEqual(['Streitwert', 'Gebühr']);
  });

  it('liefert ≥ 4 Datenzeilen (§ 3 Abs. 1 hat 4 Staffelzeilen)', () => {
    const r = extrahiereZhStreitwertStaffel(PAR3)!;
    expect(r.zeilen.length).toBeGreaterThanOrEqual(4);
  });

  it('jede Zeile hat genau 2 Spalten', () => {
    const r = extrahiereZhStreitwertStaffel(PAR3)!;
    for (const zeile of r.zeilen) {
      expect(zeile).toHaveLength(2);
    }
  });

  it('LOAD-BEARING: Datenzeile «über 1000 bis 10000» → Streitwert enthält «1» + «000 bis» + «10», Gebühr = «250–420»', () => {
    // Geometry: «über» (x=87.84) «1» (x=117.36) «000 bis» (x=123.12) «10» (x=163.86)
    //           «000» (x=173.46) → alle in Streitwert (x < threshold1≈203.40)
    //           «250–» (x=203.40) «420» (x=223.56) → Gebühr-Spalte
    const r = extrahiereZhStreitwertStaffel(PAR3)!;
    const zeile = r.zeilen.find(
      (z) => z[0].includes('über') && z[0].includes('1') && z[0].includes('000') && z[0].includes('bis') && z[0].includes('10'),
    );
    expect(zeile).toBeDefined();
    // Gebühr = «250–420» (exakt, da «250–» + «420» zusammengefügt)
    expect(zeile![1]).toBe('250– 420');
    // Kein verschmolzener Wert «10000250»
    expect(zeile!.join('')).not.toContain('10000250');
    expect(zeile!.join('')).not.toContain('bis10000');
  });

  it('LOAD-BEARING: Datenzeile «über 10000 bis 100000» → Streitwert enthält «100» + «000», Gebühr = «420–615»', () => {
    const r = extrahiereZhStreitwertStaffel(PAR3)!;
    const zeile = r.zeilen.find(
      (z) => z[0].includes('10') && z[0].includes('000 bis') && z[0].includes('100'),
    );
    expect(zeile).toBeDefined();
    expect(zeile![1]).toBe('420– 615');
    expect(zeile!.join('')).not.toContain('bis100000');
  });

  it('erste Zeile: Streitwert enthält «bis», Gebühr enthält «65»', () => {
    // «bis 1 000 → Gebühr 65–250»
    const r = extrahiereZhStreitwertStaffel(PAR3)!;
    const erste = r.zeilen[0];
    expect(erste[0]).toContain('bis');
    expect(erste[1]).toContain('65');
  });

  it('letzte Zeile: Streitwert enthält «100» + «000», Gebühr enthält «615» und «1240»', () => {
    const r = extrahiereZhStreitwertStaffel(PAR3)!;
    const letzte = r.zeilen[r.zeilen.length - 1];
    expect(letzte[0]).toContain('100');
    expect(letzte[0]).toContain('000');
    expect(letzte[1]).toContain('615');
    expect(letzte[1]).toContain('1240');
  });

  it('keine merged-Werte «bis10000» / «bis100000» in irgendeiner Zeile', () => {
    const r = extrahiereZhStreitwertStaffel(PAR3)!;
    for (const zeile of r.zeilen) {
      expect(zeile.join('')).not.toContain('bis10000');
      expect(zeile.join('')).not.toContain('bis100000');
    }
  });
});

// ── § 4 Tests (3-Spalten: Streitwert | Grundgebühr | Zuschlag) ──────────────

describe('ZH-211.11 § 4 — 3-Spalten-Tabelle (Streitwert | Grundgebühr | Zuschlag)', () => {
  it('liefert ein Ergebnis (nicht null)', () => {
    const r = extrahiereZhStreitwertStaffel(PAR4);
    expect(r).not.toBeNull();
  });

  it('kopf = [Streitwert, Grundgebühr, Zuschlag] (3-Spalten-Form)', () => {
    const r = extrahiereZhStreitwertStaffel(PAR4)!;
    expect(r.kopf).toEqual(['Streitwert', 'Grundgebühr', 'Zuschlag']);
  });

  it('liefert ≥ 8 Datenzeilen (§ 4 Abs. 1 hat 9 Staffelzeilen)', () => {
    const r = extrahiereZhStreitwertStaffel(PAR4)!;
    expect(r.zeilen.length).toBeGreaterThanOrEqual(8);
  });

  it('jede Zeile hat genau 3 Spalten', () => {
    const r = extrahiereZhStreitwertStaffel(PAR4)!;
    for (const zeile of r.zeilen) {
      expect(zeile).toHaveLength(3);
    }
  });

  it('LOAD-BEARING: «5000250»-Zeile → Streitwert «über 1 000 bis 5 000», Grundgebühr «250», Zuschlag mit «zuzügl.»', () => {
    // Geometry: «über» (x=87.84) «1» (x=113.22) «000 bis» (x=118.62)
    //           «5» (x=148.20) «000» (x=153.60) → alle Streitwert (x < 169.23)
    //           «250 zuzügl.» (x=181.26) → Grundgebühr (x < 216.23)
    //           «20%» (x=216.96) «des Fr.» (x=235.26) ... → Zuschlag
    // Post-Prozess: «zuzügl.» am Ende von col2 → verschoben an Anfang von col3
    const r = extrahiereZhStreitwertStaffel(PAR4)!;
    const zeile = r.zeilen.find(
      (z) => z[0].includes('1') && z[0].includes('000 bis') && z[0].includes('5') && !z[0].includes('20'),
    );
    expect(zeile).toBeDefined();
    // Grundgebühr = «250» (nach zuzügl.-Verschiebung)
    expect(zeile![1]).toBe('250');
    // Zuschlag beginnt mit «zuzügl.»
    expect(zeile![2]).toMatch(/^zuzügl\./);
    // Kein verschmolzener Wert «5000250» in irgendeiner Spalte
    expect(zeile!.join('')).not.toContain('5000250');
  });

  it('LOAD-BEARING: «200001050»-Zeile → Grundgebühr «1 050», Zuschlag mit «zuzügl. 14%»', () => {
    const r = extrahiereZhStreitwertStaffel(PAR4)!;
    const zeile = r.zeilen.find(
      (z) => z[0].includes('5') && z[0].includes('000 bis') && z[0].includes('20'),
    );
    expect(zeile).toBeDefined();
    expect(zeile![1]).toContain('050');
    expect(zeile![2]).toMatch(/^zuzügl\./);
    expect(zeile![2]).toContain('14%');
    expect(zeile!.join('')).not.toContain('200001050');
  });

  it('Zuschlag-Spalten beginnen alle mit «zuzügl.» (ausser erste Zeile)', () => {
    const r = extrahiereZhStreitwertStaffel(PAR4)!;
    for (const zeile of r.zeilen.slice(1)) {
      if (zeile[2]) {
        expect(zeile[2]).toMatch(/^zuzügl\./);
      }
    }
  });

  it('erste Zeile: Streitwert enthält «bis» + «1» + «000», Grundgebühr enthält «25%» (Prozentbetrag)', () => {
    const r = extrahiereZhStreitwertStaffel(PAR4)!;
    const erste = r.zeilen[0];
    expect(erste[0]).toContain('bis');
    expect(erste[0]).toContain('1');
    expect(erste[0]).toContain('000');
    // Erste Zeile (bis 1 000): Prozentgebühr «25% des Streitwertes»
    expect(erste[0] + ' ' + erste[1]).toContain('25%');
  });

  it('letzte Zeile: Streitwert enthält «10 Mio.», Zuschlag enthält «0,5%»', () => {
    const r = extrahiereZhStreitwertStaffel(PAR4)!;
    const letzte = r.zeilen[r.zeilen.length - 1];
    expect(letzte[0]).toContain('10 Mio.');
    expect(letzte[2]).toContain('0,5%');
  });

  it('keine merged-Werte «5000250» / «200001050» in irgendeiner Zeile', () => {
    const r = extrahiereZhStreitwertStaffel(PAR4)!;
    for (const zeile of r.zeilen) {
      expect(zeile.join('')).not.toContain('5000250');
      expect(zeile.join('')).not.toContain('200001050');
    }
  });
});
