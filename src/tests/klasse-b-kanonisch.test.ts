/**
 * G3b Schritt 2 · Klasse B (verklebte Zahlen) — Kanton-Nachzug aufs kanonische
 * `spalten`-Modell für die x-koordinaten-rekonstruierten Streitwert-Staffeln
 * ZH-215.3 §4, ZH-211.11 §3+§4 (zhlex-PDF) sowie ZG-163.4 §3, TG-176.31 §5
 * (LexWork-·/—-Zellen).
 *
 * Prüft (§1/§7):
 *  1. Die Ziel-Blöcke tragen das kanonische `spalten`-Modell (kein Legacy-`kopf`).
 *  2. Rechteckigkeit: jede Zeile hat exakt spalten.length Zellen (T-B2).
 *  3. typisiereSpalten ist deterministisch für diese Tabellen (Regression-Lock),
 *     inkl. der bewusst konservativen `text`-Spalten (§1: im Zweifel als Text).
 *  4. LOAD-BEARING Verkleben-Befunde: die früher verschmolzenen Ziffernfolgen
 *     `100001250` (= `10 000` | `1 250`) und `5000250` (= `5 000` | `250`) sind
 *     x-geometrisch in getrennte Zellen aufgeteilt; die Konkatenation der
 *     Zell-Ziffern reproduziert die Roh-Folge (nichts erfunden, nichts verloren).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { typisiereSpalten } from '../../scripts/normtext/mehrspaltige-tabelle.ts';
import type { NormSnapshotDatei } from '../lib/normtext/typen.ts';

const KANTON = 'public/normtext/kanton';

function ladeBloecke(erlass: string): Array<{
  label: string;
  spalten?: Array<{ typ: string; titel: string }>;
  kopf?: string[];
  zeilen: string[][];
}> {
  const d = JSON.parse(readFileSync(`${KANTON}/${erlass}.json`, 'utf8')) as NormSnapshotDatei;
  const out: Array<{ label: string; spalten?: { typ: string; titel: string }[]; kopf?: string[]; zeilen: string[][] }> = [];
  for (const e of d.eintraege ?? []) {
    for (const b of e.bloecke ?? []) {
      if (b.mehrspaltig) out.push({ label: e.artikelLabel, ...b.mehrspaltig });
    }
  }
  return out;
}

const ERLASSE = ['ZH-215.3', 'ZH-211.11', 'ZG-163.4', 'TG-176.31'];

describe('Klasse B — kanonisches Spalten-Modell + Rechteckigkeit', () => {
  for (const erlass of ERLASSE) {
    it(`${erlass}: jede Mehrspalten-Tabelle ist kanonisch (spalten, kein kopf) und rechteckig`, () => {
      const bloecke = ladeBloecke(erlass);
      expect(bloecke.length).toBeGreaterThan(0);
      for (const b of bloecke) {
        expect(b.spalten, `${erlass} ${b.label}: spalten fehlt`).toBeDefined();
        expect(b.spalten!.length).toBeGreaterThan(0);
        expect(b.kopf, `${erlass} ${b.label}: Legacy-kopf noch vorhanden`).toBeUndefined();
        const N = b.spalten!.length;
        for (const z of b.zeilen) {
          expect(z.length, `${erlass} ${b.label}: Zeile ${JSON.stringify(z)} ≠ ${N} Spalten`).toBe(N);
        }
        for (const s of b.spalten!) {
          expect(['bereich', 'zahl', 'text', 'betrag']).toContain(s.typ);
        }
      }
    });
  }
});

describe('Klasse B — typisiereSpalten Regression-Lock (deterministisch, §2)', () => {
  it('ZH-215.3 §4: [text Streitwert, zahl Grundgebühr, text Zuschlag]', () => {
    const b = ladeBloecke('ZH-215.3').find((x) => x.label === '§ 4')!;
    expect(typisiereSpalten(['Streitwert', 'Grundgebühr', 'Zuschlag'], b.zeilen)).toEqual([
      { typ: 'text', titel: 'Streitwert' },
      { typ: 'zahl', titel: 'Grundgebühr' },
      { typ: 'text', titel: 'Zuschlag' },
    ]);
  });

  it('ZH-211.11 §3: [bereich Streitwert, bereich Gebühr]', () => {
    const b = ladeBloecke('ZH-211.11').find((x) => x.label === '§ 3')!;
    expect(typisiereSpalten(['Streitwert', 'Gebühr'], b.zeilen)).toEqual([
      { typ: 'bereich', titel: 'Streitwert' },
      { typ: 'bereich', titel: 'Gebühr' },
    ]);
  });

  it('ZH-211.11 §4: [text, text, text] — Grundgebühr «250» ist bare Integer ⇒ konservativ text (§1)', () => {
    // Die erste Grundgebühr-Zelle «250» matcht das Positions-Nummer-Muster
    // (TARIF_NR_RE) — in Isolation nicht von einer Tarif-Nr. unterscheidbar. §1:
    // sobald eine Positions-Zelle in der Spalte steht, bleibt die Spalte `text`
    // (nie mis-gruppiert). Verlustfrei; die Werte bleiben unverändert im DOM.
    const b = ladeBloecke('ZH-211.11').find((x) => x.label === '§ 4')!;
    expect(typisiereSpalten(['Streitwert', 'Grundgebühr', 'Zuschlag'], b.zeilen)).toEqual([
      { typ: 'text', titel: 'Streitwert' },
      { typ: 'text', titel: 'Grundgebühr' },
      { typ: 'text', titel: 'Zuschlag' },
    ]);
  });

  it('TG-176.31 §5: [bereich Streitwert, text Grundhonorar]', () => {
    const b = ladeBloecke('TG-176.31').find((x) => x.label === '§ 5')!;
    expect(typisiereSpalten(['Streitwert', 'Grundhonorar'], b.zeilen)).toEqual([
      { typ: 'bereich', titel: 'Streitwert' },
      { typ: 'text', titel: 'Grundhonorar' },
    ]);
  });
});

describe('Klasse B — LOAD-BEARING Verkleben-Befunde x-getrennt (§7)', () => {
  const nurZiffern = (s: string) => s.replace(/\D/g, '');

  it('ZH-215.3 §4: «100001250» → Streitwert endet «bis 10 000», Grundgebühr «1 250» (getrennt)', () => {
    const b = ladeBloecke('ZH-215.3').find((x) => x.label === '§ 4')!;
    const zeile = b.zeilen.find((z) => z[0] === 'über 5 000 bis 10 000');
    expect(zeile, 'Band «über 5 000 bis 10 000» fehlt').toBeDefined();
    expect(zeile![1]).toBe('1 250');
    expect(zeile![2]).toContain('zuzügl. 23%');
    // Konkatenation der Ziffern der Streitwert-Obergrenze + Grundgebühr = 100001250
    expect(nurZiffern(zeile![0]).endsWith('10000')).toBe(true);
    expect('10000' + nurZiffern(zeile![1])).toBe('100001250');
  });

  it('ZH-211.11 §4: «5000250» → Streitwert endet «bis 5 000», Grundgebühr «250» (getrennt)', () => {
    const b = ladeBloecke('ZH-211.11').find((x) => x.label === '§ 4')!;
    const zeile = b.zeilen.find((z) => z[0] === 'über 1 000 bis 5 000');
    expect(zeile, 'Band «über 1 000 bis 5 000» fehlt').toBeDefined();
    expect(zeile![1]).toBe('250');
    expect(nurZiffern(zeile![0]).endsWith('5000')).toBe(true);
    expect('5000' + nurZiffern(zeile![1])).toBe('5000250');
  });

  it('ZG-163.4 §3 + TG-176.31 §5: erste Spalte ist eine Streitwert-Staffel, zweite trägt Honorar', () => {
    const zg = ladeBloecke('ZG-163.4').find((x) => x.label === '§ 3')!;
    expect(zg.zeilen[0][0]).toMatch(/^bis /);
    expect(zg.zeilen.length).toBeGreaterThanOrEqual(12);
    const tg = ladeBloecke('TG-176.31').find((x) => x.label === '§ 5')!;
    expect(tg.zeilen[0][0]).toMatch(/^bis Fr\./);
    expect(tg.zeilen.length).toBeGreaterThanOrEqual(8);
  });
});
