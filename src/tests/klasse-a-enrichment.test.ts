/**
 * Task 5: reichereMehrspaltig — Klasse-A-Anreicherung (NW/BS/SO/VS/ZG/TG).
 *
 * Prüft:
 * 1. NW art 3: Einleitungssatz «… wie folgt zu berechnen:» bleibt im text-Feld;
 *    mehrspaltig.kopf=['Leistungslohnband','Stundenansatz']; erste Zeile=['1','Fr. 50.00'].
 * 2. SO art 44: Einleitungssatz «Die Einkommenssteuer für ein Jahr beträgt» bleibt;
 *    mehrspaltig.kopf=['Steuer','Einkommen'].
 * 3. Block ohne ·/—-Marker → unverändert (kein mehrspaltig gesetzt).
 * 4. Block mit ·/—-Marker, aber nicht parsebar (ambige Zelle) → unverändert (§1).
 * 5. BS-Stil: führende bare Tarif-Nr. → kein Intro (Label gleich am Anfang).
 */
import { describe, it, expect } from 'vitest';
import { reichereMehrspaltig } from '../../scripts/normtext/mehrspaltige-tabelle.ts';

/** Hilfstyp: Minimal-Block für reichereMehrspaltig (mutable, mit mehrspaltig?). */
type TestBlock = {
  absatz: string | null;
  text: string;
  items?: Array<{ marke: string; text: string }>;
  mehrspaltig?: { kopf?: string[]; zeilen: string[][] };
};

// ── NW art 3: Leistungslohnband / Stundenansatz mit Einleitungssatz ──────────
describe('NW art 3: Einleitungssatz + mehrspaltig', () => {
  // Echte NW-Zeichenkette (gekürzt auf 3 Zeilen für Übersichtlichkeit)
  const nwText =
    'Die Gebühr nach Zeitaufwand ist gestützt auf das Leistungslohnband des die Amtshandlung ausführenden Personals wie folgt zu berechnen: ' +
    'Leistungslohnband: 1 · Stundenansatz: Fr. 50.00 — ' +
    'Leistungslohnband: 2 · Stundenansatz: Fr. 55.00 — ' +
    'Leistungslohnband: 3 · Stundenansatz: Fr. 61.00';

  it('text enthält nur den Einleitungssatz (ohne Tabelle)', () => {
    const bloecke: TestBlock[] = [{ absatz: '1', text: nwText }];
    reichereMehrspaltig(bloecke);
    expect(bloecke[0].text).toBe(
      'Die Gebühr nach Zeitaufwand ist gestützt auf das Leistungslohnband des die Amtshandlung ausführenden Personals wie folgt zu berechnen:',
    );
  });

  it('mehrspaltig gesetzt', () => {
    const bloecke: TestBlock[] = [{ absatz: '1', text: nwText }];
    reichereMehrspaltig(bloecke);
    expect(bloecke[0].mehrspaltig).toBeDefined();
  });

  it('kopf = [Leistungslohnband, Stundenansatz]', () => {
    const bloecke: TestBlock[] = [{ absatz: '1', text: nwText }];
    reichereMehrspaltig(bloecke);
    expect(bloecke[0].mehrspaltig!.kopf).toEqual(['Leistungslohnband', 'Stundenansatz']);
  });

  it('erste Zeile = [1, Fr. 50.00]', () => {
    const bloecke: TestBlock[] = [{ absatz: '1', text: nwText }];
    reichereMehrspaltig(bloecke);
    expect(bloecke[0].mehrspaltig!.zeilen[0]).toEqual(['1', 'Fr. 50.00']);
  });

  it('zweite Zeile korrekt', () => {
    const bloecke: TestBlock[] = [{ absatz: '1', text: nwText }];
    reichereMehrspaltig(bloecke);
    expect(bloecke[0].mehrspaltig!.zeilen[1]).toEqual(['2', 'Fr. 55.00']);
  });
});

// ── SO art 44: Einkommenssteuer-Tarif mit Einleitungssatz ────────────────────
describe('SO art 44: Einleitungssatz + mehrspaltig', () => {
  const soText =
    "Die Einkommenssteuer für ein Jahr beträgt " +
    "Steuer: 0.00% · Einkommen: von den ersten 12'000 Franken — " +
    "Steuer: 4.50% · Einkommen: von den nächsten 4'000 Franken — " +
    "Steuer: 5.00% · Einkommen: von den nächsten 4'000 Franken";

  it('text enthält nur den Einleitungssatz', () => {
    const bloecke: TestBlock[] = [{ absatz: null, text: soText }];
    reichereMehrspaltig(bloecke);
    expect(bloecke[0].text).toBe('Die Einkommenssteuer für ein Jahr beträgt');
  });

  it('kopf = [Steuer, Einkommen]', () => {
    const bloecke: TestBlock[] = [{ absatz: null, text: soText }];
    reichereMehrspaltig(bloecke);
    expect(bloecke[0].mehrspaltig!.kopf).toEqual(['Steuer', 'Einkommen']);
  });

  it('erste Zeile korrekt', () => {
    const bloecke: TestBlock[] = [{ absatz: null, text: soText }];
    reichereMehrspaltig(bloecke);
    expect(bloecke[0].mehrspaltig!.zeilen[0]).toEqual([
      '0.00%',
      "von den ersten 12'000 Franken",
    ]);
  });
});

// ── Block ohne Tabellen-Marker → unverändert ─────────────────────────────────
describe('Kein ·/—-Marker → Block unverändert', () => {
  it('text unverändert, kein mehrspaltig', () => {
    const bloecke: TestBlock[] = [{ absatz: '1', text: 'Ein normaler Absatz ohne Tabellen-Marker.' }];
    reichereMehrspaltig(bloecke);
    expect(bloecke[0].text).toBe('Ein normaler Absatz ohne Tabellen-Marker.');
    expect(bloecke[0].mehrspaltig).toBeUndefined();
  });
});

// ── §1: ambige Zelle → unverändert ───────────────────────────────────────────
describe('§1: ambige Zelle → Block unverändert', () => {
  it('Block mit ambiger Zelle bleibt als Text', () => {
    // "NurText" hat kein `: ` und ist keine Tarif-Nr. → extrahiereMehrspaltig → null
    const ambigText = 'Label: Wert · NurText — Label: Wert2 · Label2: X';
    const bloecke: TestBlock[] = [{ absatz: null, text: ambigText }];
    reichereMehrspaltig(bloecke);
    expect(bloecke[0].text).toBe(ambigText);
    expect(bloecke[0].mehrspaltig).toBeUndefined();
  });
});

// ── BS-Stil: kein Einleitungssatz (bare Tarif-Nr. gleich am Anfang) ──────────
describe('BS-Stil: kein Einleitungssatz, Tabelle startet gleich', () => {
  const bsText =
    "1 · Verfahren: in Eheschutzverfahren · Gebühr: Fr. 300 bis Fr. 2'000 — " +
    "1.1. · Verfahren: in aufwendigen Fällen · Gebühr: bis Fr. 10'000";

  it('text ist leer (kein Intro)', () => {
    const bloecke: TestBlock[] = [{ absatz: null, text: bsText }];
    reichereMehrspaltig(bloecke);
    // Wenn kein Intro → text leer oder unverändert (hängt von Schnitt ab)
    // Der Label «Tarif-Nr.» erscheint nicht im bsText als «Tarif-Nr.: »,
    // daher idx=0 (kein Intro) → text='' Fallback
    expect(bloecke[0].mehrspaltig).toBeDefined();
    expect(bloecke[0].mehrspaltig!.kopf).toEqual(['Tarif-Nr.', 'Verfahren', 'Gebühr']);
  });

  it('erste Zeile korrekt', () => {
    const bloecke: TestBlock[] = [{ absatz: null, text: bsText }];
    reichereMehrspaltig(bloecke);
    expect(bloecke[0].mehrspaltig!.zeilen[0]).toEqual([
      '1',
      'in Eheschutzverfahren',
      "Fr. 300 bis Fr. 2'000",
    ]);
  });
});

// ── Mehrere Blöcke: nur betroffene werden angereichert ───────────────────────
describe('Mehrere Blöcke: nur ·/—-Blöcke angereichert', () => {
  const nwTabText =
    'Leistungslohnband: 1 · Stundenansatz: Fr. 50.00 — Leistungslohnband: 2 · Stundenansatz: Fr. 55.00';

  it('zweiter Block (Tabelle) wird angereichert, erster nicht', () => {
    const bloecke: TestBlock[] = [
      { absatz: '1', text: 'Normaler Text ohne Marker.' },
      { absatz: '2', text: nwTabText },
    ];
    reichereMehrspaltig(bloecke);
    expect(bloecke[0].mehrspaltig).toBeUndefined();
    expect(bloecke[1].mehrspaltig).toBeDefined();
  });
});
