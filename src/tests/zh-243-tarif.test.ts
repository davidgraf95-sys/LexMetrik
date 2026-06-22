/**
 * TDD-Test für extrahiereZhNotariatsTarif (ZH-243 NotGebV «Anhang: Gebührentarif»).
 *
 * Verifiziert die x-koordinatenbasierte Spalten-Extraktion gegen echte PDF-Stücke
 * (Fixture src/tests/fixtures/zh-243-tarif-stuecke.json, Abruf 22.6.2026, §7):
 *   - Guard §1: leere Eingabe → null; Eingabe ohne Ziffer-Spalte → null.
 *   - Hierarchische Ziffern (2.3.3, 2.3.5.1) bleiben als Strings in Spalte 0.
 *   - Mehrzeilige Beschreibungen werden in EINE Zelle zusammengefügt;
 *     Silbentrennung gefügt («Begrün-»+«dung» → «Begründung»).
 *   - Ansätze (‰, «mindestens 50», Rahmen «100–1500», «300–6000») stehen INLINE
 *     in Lese-Reihenfolge bei ihrem Tatbestand.
 *   - Querverweise («siehe Ziff.», 2.2.1 …) sind separiert als «(vgl. Ziff. …)».
 *   - KEIN Spaltenkopf-Leak («Ansatz/Fr.» / «Beurkundungsgebühren siehe Ziff.:»)
 *     in einer Tarif-Zelle (h≈8.0/8.2 ausgeschlossen, §1).
 *
 * ≥ 5 repräsentative Zeilen werden EXAKT gegen den amtlichen PDF-Wortlaut geprüft
 * (Promille-Beträge, hierarchische Ziffern, Rahmen, Querverweise).
 */
import { describe, it, expect } from 'vitest';
import { extrahiereZhNotariatsTarif } from '../../scripts/normtext/adapter-zh-pdf.ts';
import STUECKE_RAW from './fixtures/zh-243-tarif-stuecke.json';

const STUECKE = STUECKE_RAW as Array<{ x: number; y: number; h: number; s: string; p: number }>;

// Den Inline-Text einer Ziffer wieder zur Lese-Form zusammensetzen (wie holeZhPdf):
// Beschreibung + «(vgl. Ziff. …)»-Suffix.
function leseText(zeile: string[]): string {
  return zeile[1] + (zeile[2] ? ` (vgl. Ziff. ${zeile[2]})` : '');
}

describe('extrahiereZhNotariatsTarif — Guard (§1)', () => {
  it('leere Eingabe → null', () => {
    expect(extrahiereZhNotariatsTarif([])).toBeNull();
  });

  it('Eingabe ohne Ziffer-Spalte (nur Body-Prosa) → null', () => {
    const nurText = [
      { x: 87.84, y: 344.41, h: 9.18, s: 'Der Regierungsrat bestimmt den Zeitpunkt', p: 4 },
      { x: 87.84, y: 334.21, h: 9.18, s: 'des Inkrafttretens.', p: 4 },
    ];
    expect(extrahiereZhNotariatsTarif(nurText)).toBeNull();
  });
});

describe('extrahiereZhNotariatsTarif — echte Fixture ZH-243 Anhang', () => {
  const tarif = extrahiereZhNotariatsTarif(STUECKE);

  it('liefert ein Ergebnis (nicht null)', () => {
    expect(tarif).not.toBeNull();
  });

  it('kopf = [Ziffer, Beschreibung, siehe Ziff.]', () => {
    expect(tarif!.kopf).toEqual(['Ziffer', 'Beschreibung', 'siehe Ziff.']);
  });

  it('jede Zeile hat genau 3 Spalten; Spalte 0 ist eine Ziffer (hierarchisch N.N… ODER nackt N)', () => {
    for (const z of tarif!.zeilen) {
      expect(z).toHaveLength(3);
      // hierarchisch «2.3.3» (Sektion A/B + 5.x) ODER nackt «1»…«14» (Gruppenköpfe + Sektion C)
      expect(z[0]).toMatch(/^\d+(\.\d+)*$/);
    }
  });

  it('extrahiert ≥ 120 Ziffer-Einträge (Anhang hat ~132 inkl. nackter Posten 1–14)', () => {
    expect(tarif!.zeilen.length).toBeGreaterThanOrEqual(120);
  });

  it('die nackten Sektion-C-Posten 6–14 sind je EIGENE Zeile (kein 5.2-Blob)', () => {
    for (const tok of ['6', '7', '8', '9', '10', '11', '12', '13', '14']) {
      const r = tarif!.zeilen.find((z) => z[0] === tok);
      expect(r, `Anhang-Posten ${tok} fehlt`).toBeDefined();
    }
    // 5.2 darf 6–14 NICHT mehr verschlucken (früher 1336–2162 Zeichen).
    const r52 = tarif!.zeilen.find((z) => z[0] === '5.2');
    expect(r52![1].length).toBeLessThan(500);
  });

  // Hilfsfinder
  const z = (tok: string) => tarif!.zeilen.find((r) => r[0] === tok);

  it('ROW 1 — 2.3.3 Pfandeinsetzung: 0,75‰, mindestens 50, Querverweis 1.2.4', () => {
    const r = z('2.3.3');
    expect(r).toBeDefined();
    expect(leseText(r!)).toBe(
      'Pfandeinsetzung, pro Pfandrecht vom Verkehrswert des einzusetzenden Pfandes 0,75‰ mindestens 50 höchstens 1‰ der Pfandsumme (vgl. Ziff. 1.2.4)',
    );
  });

  it('ROW 2 — 1.2.4 Pfandeinsetzung (Grundbuch-Pendant): 0,5‰, Querverweis 2.3.3', () => {
    const r = z('1.2.4');
    expect(r).toBeDefined();
    expect(leseText(r!)).toBe(
      'Pfandeinsetzung, pro Pfandrecht vom Verkehrswert des einzusetzenden Pfandes 0,5‰ mindestens 50 jedoch höchstens 1‰ der Pfandsumme (vgl. Ziff. 2.3.3)',
    );
  });

  it('ROW 3 — 1.1.1 Eigentumsübertragung: Silbentrennung «Begründung» gefügt, 1‰ mind. 100, 5 Querverweise', () => {
    const r = z('1.1.1');
    expect(r).toBeDefined();
    // Silbentrennung «Begrün-»+«dung» korrekt gefügt
    expect(r![1]).toContain('Begründung und Übertragung');
    expect(r![1]).not.toContain('Begrün-');
    expect(r![1]).toContain('1‰ mindestens 100');
    expect(r![2]).toBe('2.2.1, 2.2.2, 2.2.4, 2.2.9, 2.5.1');
  });

  it('ROW 4 — 2.3.5.1: KEIN Spaltenkopf-Leak («Ansatz/Fr.»/«Beurkundungsgebühren siehe Ziff.:»)', () => {
    const r = z('2.3.5.1');
    expect(r).toBeDefined();
    expect(leseText(r!)).toBe(
      'Änderung der Zins- und Zahlungsbestimmungen, sofern nicht gleichzeitig Gebühren nach den Ziff. 2.3.1 oder 2.3.2 geschuldet werden 50 (vgl. Ziff. 1.2.5)',
    );
    // Defekt-Regression: der frühere Header-Leak darf NICHT mehr auftauchen.
    expect(r![1]).not.toContain('Ansatz/Fr.');
    expect(r![1]).not.toContain('Beurkundungsgebühren siehe Ziff.');
  });

  it('ROW 5 — 4.3.3 Erbvertrag: Rahmen 300–6000 inline', () => {
    const r = z('4.3.3');
    expect(r).toBeDefined();
    expect(leseText(r!)).toBe('Erbvertrag 300–6000');
  });

  it('ROW 6 — 4.2.1 Ehevertrag: Rahmen 200–4000 inline', () => {
    const r = z('4.2.1');
    expect(r).toBeDefined();
    expect(leseText(r!)).toBe('Ehevertrag, Vermögensvertrag 200–4000');
  });

  it('ROW 7 — 2.4.1 Dienstbarkeit-Eintragung: mehrzeilig, Ansätze inline bei jedem Band', () => {
    const r = z('2.4.1');
    expect(r).toBeDefined();
    expect(leseText(r!)).toBe(
      'Eintragung (auch Ausdehnung) – vom Wert der Gegenleistung (bei wiederkehrenden Leistungen höchstens vom 20-fachen Wert der Jahresleistung) 1‰ pro beteiligtes Grundstück mindestens 50 je Dienstbarkeit mindestens 150 – beim Fehlen einer Gegenleistung pro Grundstück 50 im Rahmen von 150–1000',
    );
  });

  it('ROW 8 — 2.3.6.1 Ausstellung Pfandtitel: 50, im Rahmen von 200–500', () => {
    const r = z('2.3.6.1');
    expect(r).toBeDefined();
    expect(leseText(r!)).toBe('Ausstellung des Pfandtitels pro Grundstück 50 im Rahmen von 200–500');
  });

  it('KEINE Zeile enthält Fussnoten-Definitionstext («Eingefügt durch»/«Fassung gemäss»/«OS …»)', () => {
    for (const r of tarif!.zeilen) {
      expect(r[1]).not.toMatch(/Eingefügt durch|Fassung gemäss B vom|^OS \d/);
    }
  });

  it('KEINE Zeile ist ein 3740-Zeichen-Blob (Lesbarkeit)', () => {
    for (const r of tarif!.zeilen) {
      expect(r[1].length).toBeLessThan(900);
    }
  });
});
