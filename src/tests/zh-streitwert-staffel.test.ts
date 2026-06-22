/**
 * TDD-Test für extrahiereZhStreitwertStaffel (Task 3, Stufe-2 Mehrspalten).
 *
 * Verifiziert:
 *   1. Leere Eingabe → null (Guard §1).
 *   2. 3 Spalten erkannt (kopf=['Streitwert','Grundgebühr','Zuschlag']).
 *   3. LOAD-BEARING: die «100001250»-Zeile wird x-geometrie-korrekt aufgeteilt:
 *      Streitwert='über 5 000 bis 10 000', Grundgebühr='1 250', Zuschlag starts with 'zuzügl.'
 *   4. Erste Datenzeile 'bis 5 000 ...' erkannt (exakte Strings an Fixture-Geometrie angepasst).
 *   5. ≥10 Zeilen (AnwGebV § 4 hat Abs. 1 mit 12 Staffelzeilen).
 *
 * Fixture: src/tests/fixtures/zh-215.3-par4-stuecke.json
 * (echte pdfjs-Stücke aus ZH-215.3-PDF, Abruf 22.6.2026, §7)
 */
import { describe, it, expect } from 'vitest';
import { extrahiereZhStreitwertStaffel } from '../../scripts/normtext/adapter-zh-pdf.ts';
import STUECKE_RAW from './fixtures/zh-215.3-par4-stuecke.json';

// Typ-Cast (pdfjs-Stücke aus der Fixture)
const STUECKE = STUECKE_RAW as Array<{ x: number; y: number; h: number; s: string; p: number }>;

describe('extrahiereZhStreitwertStaffel — Guard', () => {
  it('leere Eingabe → null', () => {
    expect(extrahiereZhStreitwertStaffel([])).toBeNull();
  });

  it('Eingabe ohne Streitwert-Tabelle → null', () => {
    // Nur Body-Text-Stücke, keine Tabelle
    const nurText = [
      { x: 87.84, y: 344.41, h: 9.18, s: 'Ist die Verantwortung oder der Zeitaufwand', p: 2 },
      { x: 87.84, y: 334.21, h: 9.18, s: 'die Schwierigkeit des Falls besonders hoch', p: 2 },
    ];
    expect(extrahiereZhStreitwertStaffel(nurText)).toBeNull();
  });
});

describe('extrahiereZhStreitwertStaffel — echte Fixture ZH-215.3 § 4', () => {
  let ergebnis: ReturnType<typeof extrahiereZhStreitwertStaffel>;

  it('liefert ein Ergebnis (nicht null)', () => {
    ergebnis = extrahiereZhStreitwertStaffel(STUECKE);
    expect(ergebnis).not.toBeNull();
  });

  it('kopf = [Streitwert, Grundgebühr, Zuschlag]', () => {
    ergebnis = extrahiereZhStreitwertStaffel(STUECKE)!;
    expect(ergebnis.kopf).toEqual(['Streitwert', 'Grundgebühr', 'Zuschlag']);
  });

  it('liefert ≥10 Zeilen (Abs. 1 hat 12 Staffelzeilen)', () => {
    ergebnis = extrahiereZhStreitwertStaffel(STUECKE)!;
    expect(ergebnis.zeilen.length).toBeGreaterThanOrEqual(10);
  });

  it('LOAD-BEARING: «100001250»-Zeile → Streitwert enthält «bis 10» und «000», Grundgebühr «1» und «250» getrennt von Streitwert, Zuschlag beginnt mit «zuzügl.»', () => {
    // Die «über 5 000 bis 10 000»-Zeile war früher als «100001250» verschmolzen.
    // x-Geometrie: «10» (x=144.6) + «000» (x=153.6) sind Streitwert-Spalte;
    //              «1» (x=175.86) + «250 zuzügl.» (x=181.26) sind Grundgebühr-Spalte.
    ergebnis = extrahiereZhStreitwertStaffel(STUECKE)!;
    // Die Zeile mit «über 5 000 bis 10 000» identifizieren
    const zeile = ergebnis.zeilen.find(
      (z) => z[0].includes('5') && z[0].includes('000 bis') && z[0].includes('10'),
    );
    expect(zeile).toBeDefined();
    // Grundgebühr-Spalte enthält «1» und «250», NICHT «10000» (kein verschmolzener Wert)
    expect(zeile![1]).toContain('1');
    expect(zeile![1]).toContain('250');
    expect(zeile![1]).not.toContain('10000');
    expect(zeile![1]).not.toContain('10 000');
    // Zuschlag beginnt mit «zuzügl.»
    expect(zeile![2]).toMatch(/^zuzügl\./);
    // Zuschlag enthält «23%»
    expect(zeile![2]).toContain('23%');
  });

  it('LOAD-BEARING: Grundgebühr-Spalte enthält niemals «100001250» (der ursprüngliche Bug)', () => {
    ergebnis = extrahiereZhStreitwertStaffel(STUECKE)!;
    for (const zeile of ergebnis.zeilen) {
      expect(zeile.join('')).not.toContain('100001250');
    }
  });

  it('jede Zeile hat genau 3 Spalten', () => {
    ergebnis = extrahiereZhStreitwertStaffel(STUECKE)!;
    for (const zeile of ergebnis.zeilen) {
      expect(zeile).toHaveLength(3);
    }
  });

  it('erste Zeile: Streitwert enthält «bis» und «5» und «000»', () => {
    // «bis 5 000 25% des Streitwertes, mind. aber Fr. 100» — alles in Spalte 1
    // weil «5» und «000 25%» im x-Bereich der Streitwert-Spalte (x < threshold1) liegen.
    ergebnis = extrahiereZhStreitwertStaffel(STUECKE)!;
    const erste = ergebnis.zeilen[0];
    expect(erste[0]).toContain('bis');
    expect(erste[0]).toContain('5');
    expect(erste[0]).toContain('000');
  });

  it('Streitwert-Spalten enthalten nie reine Grundgebühr-Werte (keine verschmolzenen Werte)', () => {
    // «20 000 2 400», «40 000 3 900» etc. dürfen NICHT als Streitwert erscheinen
    ergebnis = extrahiereZhStreitwertStaffel(STUECKE)!;
    for (const zeile of ergebnis.zeilen) {
      // Streitwert-Spalte darf nicht «2400», «3900», «6100», «9700», «14500»,
      // «19400», «25400», «31400», «61400» enthalten (das sind Grundgebühren)
      const streitwert = zeile[0];
      expect(streitwert).not.toContain('2400');
      expect(streitwert).not.toContain('3900');
      expect(streitwert).not.toContain('6100');
      expect(streitwert).not.toContain('9700');
    }
  });

  it('Zuschlag-Spalten beginnen alle mit «zuzügl.» (ausser erste Zeile)', () => {
    ergebnis = extrahiereZhStreitwertStaffel(STUECKE)!;
    // Ab Zeile 2 (die «über …»-Zeilen) muss Zuschlag mit «zuzügl.» beginnen
    for (const zeile of ergebnis.zeilen.slice(1)) {
      if (zeile[2]) {
        expect(zeile[2]).toMatch(/^zuzügl\./);
      }
    }
  });

  it('letzte Zeile: Streitwert enthält «10 Mio.», Zuschlag «0,5%»', () => {
    ergebnis = extrahiereZhStreitwertStaffel(STUECKE)!;
    const letzte = ergebnis.zeilen[ergebnis.zeilen.length - 1];
    expect(letzte[0]).toContain('10 Mio.');
    expect(letzte[2]).toContain('0,5%');
  });

  it('«über 600 000 bis 1 Mio.»-Zeile: Streitwert enthält «1 Mio.», Grundgebühr «25» und «400»', () => {
    ergebnis = extrahiereZhStreitwertStaffel(STUECKE)!;
    const zeile = ergebnis.zeilen.find((z) => z[0].includes('600') && z[0].includes('1 Mio.'));
    expect(zeile).toBeDefined();
    expect(zeile![1]).toContain('25');
    expect(zeile![1]).toContain('400');
  });

  it('REGRESSION §1 (Issue 1, 22.6.2026): Zeile 11 «über 10 Mio.» — «106» nicht in col1 (Spaltenriss)', () => {
    // Bug: PDF-Stück «10 Mio. 106» liegt x-technisch (x=143.5) unter threshold1
    // → «106» landete in col1 («über 10 Mio. 106»), «400» in col2 — Grundgebühr «106 400» zerrissen.
    // Fix: mioSplit-Post-Prozess verschiebt trailing-Digit nach col2 (kein Zeichen geändert, §1).
    ergebnis = extrahiereZhStreitwertStaffel(STUECKE)!;
    const letzte = ergebnis.zeilen[ergebnis.zeilen.length - 1];
    // col1 = «über 10 Mio.» (OHNE «106»)
    expect(letzte[0]).toBe('über 10 Mio.');
    // col2 = «106 400» (die zusammengesetzte Grundgebühr)
    expect(letzte[1]).toBe('106 400');
    // col3 beginnt mit «zuzügl.»
    expect(letzte[2]).toMatch(/^zuzügl\./);
    // Kein Stück «106» darf mehr in col1 stecken
    expect(letzte[0]).not.toContain('106');
  });
});
