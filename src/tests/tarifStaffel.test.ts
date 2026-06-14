// ─── Tarif-Staffel-Primitiv (B-P0a) ────────────────────────────────────────
//
// Prüft die deterministische Auswertung an den Bandgrenzen und sichert die
// Bandgrenzen-Semantik per Charakterisierungs-Test gegen die bewährte
// gebvKosten-Staffel (Voraussetzung für eine spätere byte-gleiche Ablösung,
// FAHRPLAN B-P0a / Plan-Tabu C-§6).
import { describe, expect, it } from 'vitest';
import { auswertenTarif, type TarifRegel } from '../lib/tarif/staffel';
import { gebuehrPfaendung } from '../lib/gebvKosten';

const betrag = (regel: TarifRegel, basis: number): number => {
  const e = auswertenTarif(regel, basis);
  if (!e.deterministisch) throw new Error('erwartet deterministisch');
  return e.betragChf;
};

describe('auswertenTarif – deterministische Regeln', () => {
  it('fix gibt den Festbetrag unabhängig vom Bemessungswert', () => {
    expect(betrag({ typ: 'fix', chf: 200 }, 0)).toBe(200);
    expect(betrag({ typ: 'fix', chf: 200 }, 999_999)).toBe(200);
  });

  it('sockel_prozent: Sockel + Prozent auf den Überschuss über die Schwelle', () => {
    const r: TarifRegel = { typ: 'sockel_prozent', prozent: 8, abChf: 20_000, sockelChf: 3_150 };
    expect(betrag(r, 20_000)).toBe(3_150);          // an der Schwelle: nur Sockel
    expect(betrag(r, 30_000)).toBe(3_950);          // 3150 + 8 % von 10 000
    expect(betrag(r, 10_000)).toBe(3_150);          // unter Schwelle: Überschuss 0
  });

  it('sockel_prozent: Mindest-/Höchstgebühr klammern', () => {
    expect(betrag({ typ: 'sockel_prozent', prozent: 8, abChf: 20_000, sockelChf: 3_150, maxChf: 3_500 }, 30_000)).toBe(3_500);
    expect(betrag({ typ: 'sockel_prozent', prozent: 1, minChf: 100 }, 1_000)).toBe(100);
  });

  it('promille: Anteil mit Deckel und Mindestbetrag', () => {
    expect(betrag({ typ: 'promille', promille: 2 }, 100_000)).toBe(200);
    expect(betrag({ typ: 'promille', promille: 2, maxChf: 150 }, 100_000)).toBe(150);
    expect(betrag({ typ: 'promille', promille: 5, minChf: 5 }, 100)).toBe(5);
  });

  it('staffel_inklusiv: Obergrenze gehört noch zum Band', () => {
    const r: TarifRegel = { typ: 'staffel_inklusiv', baender: [{ bisChf: 100, chf: 10 }, { bisChf: Infinity, chf: 50 }] };
    expect(betrag(r, 100)).toBe(10);   // wert <= 100
    expect(betrag(r, 101)).toBe(50);
  });

  it('staffel_exklusiv: Obergrenze ist erste Zahl des Folgebandes', () => {
    const r: TarifRegel = { typ: 'staffel_exklusiv', baender: [{ bisChf: 1_001, chf: 10 }, { bisChf: Infinity, chf: 50 }] };
    expect(betrag(r, 1_000)).toBe(10);  // wert < 1001
    expect(betrag(r, 1_001)).toBe(50);
  });

  it('Charakterisierung: reproduziert die gebvKosten-Pfändungsstaffel (Art. 20 GebV SchKG)', () => {
    const r: TarifRegel = {
      typ: 'staffel_inklusiv',
      baender: [
        { bisChf: 100, chf: 10 }, { bisChf: 500, chf: 25 }, { bisChf: 1_000, chf: 45 },
        { bisChf: 10_000, chf: 65 }, { bisChf: 100_000, chf: 90 }, { bisChf: 1_000_000, chf: 190 },
        { bisChf: Infinity, chf: 400 },
      ],
    };
    for (const v of [1, 100, 101, 500, 501, 1_000, 1_001, 10_000, 100_000, 1_000_000, 1_000_001, 5_000_000]) {
      expect(betrag(r, v), `Forderung ${v}`).toBe(gebuehrPfaendung(v));
    }
  });
});

describe('auswertenTarif – ehrliche Nicht-Determinismus-Fälle (§2/§8)', () => {
  it('rahmen liefert von/bis und KEINEN Punktwert', () => {
    const e = auswertenTarif({ typ: 'rahmen', vonChf: 40, bisChf: 150 }, 1_000);
    expect(e.deterministisch).toBe(false);
    if (!e.deterministisch) {
      expect(e.vonChf).toBe(40);
      expect(e.bisChf).toBe(150);
      expect(e).not.toHaveProperty('betragChf');
    }
  });

  it('formel_extern liefert nur einen Hinweis', () => {
    const e = auswertenTarif({ typ: 'formel_extern', hinweis: 'Einkommensabhängig nach kantonalem Tarif.' }, 0);
    expect(e.deterministisch).toBe(false);
    if (!e.deterministisch) expect(e.hinweis).toMatch(/kantonal/);
  });
});

describe('staffel_sockel_prozent – Charakterisierung gegen ZH GebV OG § 4 Abs. 1', () => {
  const zh: TarifRegel = {
    typ: 'staffel_sockel_prozent',
    baender: [
      { bisChf: 1_000, sockelChf: 0, abChf: 0, prozent: 25, minChf: 150 },
      { bisChf: 5_000, sockelChf: 250, abChf: 1_000, prozent: 20 },
      { bisChf: 20_000, sockelChf: 1_050, abChf: 5_000, prozent: 14 },
      { bisChf: 80_000, sockelChf: 3_150, abChf: 20_000, prozent: 8 },
      { bisChf: 300_000, sockelChf: 7_950, abChf: 80_000, prozent: 4 },
      { bisChf: 1_000_000, sockelChf: 16_750, abChf: 300_000, prozent: 2 },
      { bisChf: 10_000_000, sockelChf: 30_750, abChf: 1_000_000, prozent: 1 },
      { bisChf: 1e15, sockelChf: 120_750, abChf: 10_000_000, prozent: 0.5 },
    ],
  };
  it('reproduziert die amtlich verifizierten Stützstellen (Grundgebühr)', () => {
    expect(betrag(zh, 5_000)).toBe(1_050);
    expect(betrag(zh, 50_000)).toBe(5_550);
    expect(betrag(zh, 500_000)).toBe(20_750);
  });
  it('wendet die Mindestgebühr des untersten Bandes an', () => {
    expect(betrag(zh, 500)).toBe(150); // 25 % von 500 = 125 < 150
  });
});

describe('staffel_voll_prozent – Charakterisierung gegen AG GebührD § 7 Abs. 1', () => {
  const ag: TarifRegel = {
    typ: 'staffel_voll_prozent',
    baender: [
      { bisChf: 6_500, fixChf: 900, prozent: 11 },
      { bisChf: 13_000, fixChf: 1_160, prozent: 7 },
      { bisChf: 52_000, fixChf: 1_290, prozent: 6 },
      { bisChf: 100_000, fixChf: 770, prozent: 7 },
      { bisChf: 200_000, fixChf: 4_270, prozent: 3.5 },
      { bisChf: 400_000, fixChf: 6_870, prozent: 2.2 },
      { bisChf: 800_000, fixChf: 9_670, prozent: 1.5 },
      { bisChf: 1_600_000, fixChf: 13_670, prozent: 1 },
      { bisChf: 3_300_000, fixChf: 21_670, prozent: 0.5 },
      { bisChf: 1e15, fixChf: 28_270, prozent: 0.3 },
    ],
  };
  it('reproduziert die amtlich verifizierten Stützstellen (Fix + % vom Gesamtwert)', () => {
    expect(betrag(ag, 5_000)).toBe(1_450);
    expect(betrag(ag, 50_000)).toBe(4_290);
    expect(betrag(ag, 500_000)).toBe(17_170);
  });
});

describe('staffel_rahmen – Band-Wahl deterministisch, Gebühr als ehrliche Spanne', () => {
  // BS § 5 GGR (Reglement über die Gerichtsgebühren), Grundgebühr
  // vermögensrechtlich, vereinfachtes/ordentliches Verfahren.
  const bs: TarifRegel = {
    typ: 'staffel_rahmen',
    baender: [
      { grenzeChf: 10_000, minChf: 200, maxChf: 1_000 },
      { grenzeChf: 30_000, minChf: 1_000, maxChf: 3_000 },
      { grenzeChf: 100_000, minChf: 3_000, maxChf: 6_000 },
      { grenzeChf: 500_000, minChf: 6_000, maxChf: 20_000 },
      { grenzeChf: 1_000_000, minChf: 20_000, maxChf: 30_000 },
      { grenzeChf: 5_000_000, minChf: 30_000, maxChf: 60_000 },
    ],
  };

  it('wählt das richtige Band und liefert dessen Rahmen ohne Punktwert', () => {
    const e = auswertenTarif(bs, 50_000);
    expect(e.deterministisch).toBe(false);
    if (!e.deterministisch) {
      expect(e.vonChf).toBe(3_000);
      expect(e.bisChf).toBe(6_000);
      expect(e).not.toHaveProperty('betragChf');
    }
  });

  it('respektiert die inklusive Bandgrenze', () => {
    const an = auswertenTarif(bs, 10_000);
    const ueber = auswertenTarif(bs, 10_001);
    if (!an.deterministisch && !ueber.deterministisch) {
      expect([an.vonChf, an.bisChf]).toEqual([200, 1_000]);
      expect([ueber.vonChf, ueber.bisChf]).toEqual([1_000, 3_000]);
    }
  });

  it('wirft, wenn kein Band den Streitwert deckt', () => {
    expect(() => auswertenTarif(bs, 9_000_000)).toThrow(RangeError);
  });
});

describe('auswertenTarif – Eingabeschutz', () => {
  it('wirft bei negativem oder ungültigem Bemessungswert', () => {
    expect(() => auswertenTarif({ typ: 'promille', promille: 2 }, -1)).toThrow(RangeError);
    expect(() => auswertenTarif({ typ: 'sockel_prozent', prozent: 8 }, NaN)).toThrow(RangeError);
  });

  it('wirft, wenn die Staffel den Wert nicht deckt (fehlendes Infinity-Band)', () => {
    expect(() => auswertenTarif({ typ: 'staffel_inklusiv', baender: [{ bisChf: 100, chf: 10 }] }, 200)).toThrow(RangeError);
  });
});
