/**
 * #679 — DER AMTLICHE MARKEN-TRENNER WIRD MITGEFÜHRT (Extraktion).
 *
 * Fedlex legt echte Aufzählungen («<dt>a. </dt>», «<dt>1. </dt>») und
 * Label-Listen («<dt>A: </dt>», «<dt>BAS </dt>») in dieselbe <dl>-Struktur und
 * unterscheidet sie NUR am Trenner. Bis zu diesem Fix verwarf
 * `parseDefinitionsListe` den Trenner, und die Lesesicht musste die Art aus der
 * Marken-Schreibweise raten (ArtikelBody.helfer.ts) — falsch bei
 * kleingeschriebenen Labels und bei «a)»/«BAS», wo ein Punkt erfunden wurde.
 *
 * Erwartung (Emissions-Regel, s. extrahiere-fedlex.ts §`trenner`): das Feld
 * erscheint NUR, wenn das Item nicht der Normalfall «kanonische Ordinalmarke +
 * Punkt» ist — bisher korrekte Items bleiben byte-gleich (§6).
 */
import { describe, it, expect } from 'vitest';
import { extrahiereArtikel } from '../../scripts/normtext/extrahiere-fedlex';
import { HTML_VZV, HTML_AMBV } from './normtext-fedlex-marken.helfer';
import { HTML_ASYLV2, HTML_CISG } from './normtext-fedlex-trenner.helfer';

describe('#679 Fedlex-Trenner — Label-Listen mit Doppelpunkt', () => {
  it('VZV Art. 3 Abs. 1: jede Ausweiskategorie trägt trenner ":"', () => {
    const r = extrahiereArtikel(HTML_VZV, '3');
    const abs1 = r!.bloecke.find((b) => b.absatz === '1');
    expect(abs1?.items?.map((i) => [i.marke, i.trenner])).toEqual([
      ['A', ':'],
      ['B', ':'],
      ['C', ':'],
      ['D', ':'],
      ['BE', ':'],
      ['CE', ':'],
      ['DE', ':'],
    ]);
  });

  it('VZV Art. 3 Abs. 2: Unterkategorien C1E/D1E ebenfalls mit ":"', () => {
    const r = extrahiereArtikel(HTML_VZV, '3');
    const abs2 = r!.bloecke.find((b) => b.absatz === '2');
    const c1e = abs2?.items?.find((i) => i.marke === 'C1E');
    expect(c1e?.trenner).toBe(':');
  });
});

describe('#679 Fedlex-Trenner — Label ohne Trenner (Formelgrössen)', () => {
  it('AsylV 2 Art. 23: «BAS»/«SPAS»/«PAS» tragen trenner "" (kein erfundener Punkt)', () => {
    const r = extrahiereArtikel(HTML_ASYLV2, '23');
    expect(r).not.toBeNull();
    const marken = r!.bloecke.flatMap((b) => (b.items ?? []).map((i) => [i.marke, i.trenner]));
    expect(marken).toContainEqual(['BAS', '']);
    expect(marken).toContainEqual(['SPAS', '']);
    expect(marken).toContainEqual(['PAS', '']);
    // Keine dieser Marken ist eine lit.-Aufzählung — keine wird auf ein
    // kanonisches Token gekürzt (Regression zu PR #650).
    expect(marken.map((m) => m[0])).not.toContain('b');
  });
});

describe('#679 Fedlex-Trenner — Ordinalmarke mit Klammer', () => {
  it('CISG Art. 1 Abs. 1: «a)»/«b)» tragen trenner ")"', () => {
    const r = extrahiereArtikel(HTML_CISG, '1');
    const abs1 = r!.bloecke.find((b) => b.absatz === '1');
    expect(abs1?.items?.map((i) => [i.marke, i.trenner])).toEqual([
      ['a', ')'],
      ['b', ')'],
    ]);
  });
});

describe('#679 Fedlex-Trenner — Normalfall bleibt byte-gleich', () => {
  it('AMBV Art. 11 Abs. 1 (lit. a–i mit «a. »): KEIN trenner-Feld', () => {
    const r = extrahiereArtikel(HTML_AMBV, '11');
    const abs1 = r!.bloecke.find((b) => b.absatz === '1');
    expect(abs1?.items?.length).toBeGreaterThan(5);
    for (const it of abs1!.items!) {
      expect(Object.keys(it)).toEqual(['marke', 'text']);
      expect(it.trenner).toBeUndefined();
    }
  });
});
