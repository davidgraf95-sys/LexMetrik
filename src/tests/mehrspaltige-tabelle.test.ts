/**
 * Task 4: extrahiereMehrspaltig -- `./`--`-Flachtext -> mehrspaltig-Modell
 *
 * Echte per-Kanton-Strings (NW, SO, ZG, TG, VS, BS) + null-Schutz.
 * Jeder Testfall ist load-bearing: per-Kanton-Spaltensets + interner `: ` + null-Pfad.
 */
import { describe, it, expect } from 'vitest';
import { extrahiereMehrspaltig } from '../../scripts/normtext/mehrspaltige-tabelle.ts';

// NW-265.51: Tarif-Nr./Bezeichnung/Betrag (Betrag fehlt in Zeile 1)
describe('NW-265.51: Tarif-Nr./Bezeichnung/Betrag', () => {
  // Real NW string with straight apostrophe as thousands separator
  const nwInput =
    "Tarif-Nr.: 0.1 · Bezeichnung: Spruchgebühr — Tarif-Nr.: 0.1.1 · Bezeichnung: für die Behandlung · Betrag: 100.– bis 3'000.–";

  it('liefert kopf [Tarif-Nr., Bezeichnung, Betrag]', () => {
    const r = extrahiereMehrspaltig(nwInput);
    expect(r).not.toBeNull();
    expect(r!.kopf).toEqual(['Tarif-Nr.', 'Bezeichnung', 'Betrag']);
  });

  it('Zeile 0: Betrag fehlt -> leerer String', () => {
    const r = extrahiereMehrspaltig(nwInput);
    expect(r!.zeilen[0]).toEqual(['0.1', 'Spruchgebühr', '']);
  });

  it('Zeile 1: alle drei Werte', () => {
    const r = extrahiereMehrspaltig(nwInput);
    expect(r!.zeilen[1]).toEqual(['0.1.1', 'für die Behandlung', "100.– bis 3'000.–"]);
  });
});

// NW mit Gemeinde + Kanton (Unicode-Apostroph U+2018 verbatim)
// NW uses U+2018 (LEFT SINGLE QUOTATION MARK) as thousands separator
describe('NW: Tarif-Nr./Bezeichnung/Gemeinde/Kanton (Unicode-Apostroph U+2018 verbatim)', () => {
  // Build with explicit Unicode escapes so no curly-quote parser confusion
  // U+2018 = ‘, U+2013 = en-dash (--), U+00B7 = middle dot
  const nwGKInput = [
    'Tarif-Nr.: 1.1.1.1',
    'Bezeichnung: Volljährige Einzelperson',
    'Gemeinde: 1‘400.– bis 1‘600.–',
    'Kanton: 1‘000.– bis 1‘500.–',
  ].join(' · ') +
    ' — ' +
    [
      'Tarif-Nr.: 1.1.1.2',
      'Bezeichnung: Minderjährige',
      'Gemeinde: 1‘060.–',
      'Kanton: 800.–',
    ].join(' · ');

  it('liefert kopf [Tarif-Nr., Bezeichnung, Gemeinde, Kanton]', () => {
    const r = extrahiereMehrspaltig(nwGKInput);
    expect(r).not.toBeNull();
    expect(r!.kopf).toEqual(['Tarif-Nr.', 'Bezeichnung', 'Gemeinde', 'Kanton']);
  });

  it('Zeile 0: Werte korrekt mit U+2018 verbatim', () => {
    const r = extrahiereMehrspaltig(nwGKInput);
    expect(r!.zeilen[0]).toEqual([
      '1.1.1.1',
      'Volljährige Einzelperson',
      '1‘400.– bis 1‘600.–',
      '1‘000.– bis 1‘500.–',
    ]);
  });

  it('Zeile 1: Minderjährige Werte', () => {
    const r = extrahiereMehrspaltig(nwGKInput);
    expect(r!.zeilen[1]).toEqual([
      '1.1.1.2',
      'Minderjährige',
      '1‘060.–',
      '800.–',
    ]);
  });
});

// SO-614.11: Steuer / Einkommen
describe('SO-614.11: Steuer/Einkommen', () => {
  const soInput =
    "Steuer: 0.00% · Einkommen: von den ersten 12'000 Franken — Steuer: 4.50% · Einkommen: von den nächsten 4'000 Franken";

  it('liefert kopf [Steuer, Einkommen]', () => {
    const r = extrahiereMehrspaltig(soInput);
    expect(r).not.toBeNull();
    expect(r!.kopf).toEqual(['Steuer', 'Einkommen']);
  });

  it('Zeile 0 korrekt', () => {
    const r = extrahiereMehrspaltig(soInput);
    expect(r!.zeilen[0]).toEqual(['0.00%', "von den ersten 12'000 Franken"]);
  });

  it('Zeile 1 korrekt', () => {
    const r = extrahiereMehrspaltig(soInput);
    expect(r!.zeilen[1]).toEqual(['4.50%', "von den nächsten 4'000 Franken"]);
  });
});

// ZG-163.4: Streitwert (in Franken) / Honorar (in Franken)
describe('ZG-163.4: Streitwert (in Franken)/Honorar (in Franken)', () => {
  const zgInput =
    'Streitwert (in Franken): bis 5000 · Honorar (in Franken): 25% des Streitwerts — Streitwert (in Franken): ab 5000 · Honorar (in Franken): 1250 zzgl. 23%';

  it('liefert kopf [Streitwert (in Franken), Honorar (in Franken)]', () => {
    const r = extrahiereMehrspaltig(zgInput);
    expect(r).not.toBeNull();
    expect(r!.kopf).toEqual(['Streitwert (in Franken)', 'Honorar (in Franken)']);
  });

  it('Zeile 0 korrekt', () => {
    const r = extrahiereMehrspaltig(zgInput);
    expect(r!.zeilen[0]).toEqual(['bis 5000', '25% des Streitwerts']);
  });

  it('Zeile 1 korrekt', () => {
    const r = extrahiereMehrspaltig(zgInput);
    expect(r!.zeilen[1]).toEqual(['ab 5000', '1250 zzgl. 23%']);
  });
});

// TG-176.31: Streitwert / Grundhonorar
describe('TG-176.31: Streitwert/Grundhonorar', () => {
  const tgInput =
    "Streitwert: bis Fr. 2'000 · Grundhonorar: Fr. 200 bis Fr. 1'000 — Streitwert: Fr. 2'000 bis Fr. 5'000 · Grundhonorar: Fr. 1'000 bis Fr. 2'000";

  it('liefert kopf [Streitwert, Grundhonorar]', () => {
    const r = extrahiereMehrspaltig(tgInput);
    expect(r).not.toBeNull();
    expect(r!.kopf).toEqual(['Streitwert', 'Grundhonorar']);
  });

  it('Zeile 0 korrekt', () => {
    const r = extrahiereMehrspaltig(tgInput);
    expect(r!.zeilen[0]).toEqual(["bis Fr. 2'000", "Fr. 200 bis Fr. 1'000"]);
  });

  it('Zeile 1 korrekt', () => {
    const r = extrahiereMehrspaltig(tgInput);
    expect(r!.zeilen[1]).toEqual(["Fr. 2'000 bis Fr. 5'000", "Fr. 1'000 bis Fr. 2'000"]);
  });
});

// VS-173.8: verbose Labels
describe('VS-173.8: verbose Labels (kein interner Doppelpunkt im Wert)', () => {
  const vsInput =
    "Für den Streitwert: bis 2'000 Franken · Wird die Gebühr wie folgt festgesetzt: von 180 bis 1'200 Franken — Für den Streitwert: von 2'001 bis 8'000 Franken · Wird die Gebühr wie folgt festgesetzt: von 650 bis 1'800 Franken";

  it('liefert kopf [Fuer den Streitwert, Wird die Gebuehr wie folgt festgesetzt]', () => {
    const r = extrahiereMehrspaltig(vsInput);
    expect(r).not.toBeNull();
    expect(r!.kopf).toEqual([
      'Für den Streitwert',
      'Wird die Gebühr wie folgt festgesetzt',
    ]);
  });

  it('Zeile 0 korrekt', () => {
    const r = extrahiereMehrspaltig(vsInput);
    expect(r!.zeilen[0]).toEqual(["bis 2'000 Franken", "von 180 bis 1'200 Franken"]);
  });

  it('Zeile 1 korrekt', () => {
    const r = extrahiereMehrspaltig(vsInput);
    expect(r!.zeilen[1]).toEqual([
      "von 2'001 bis 8'000 Franken",
      "von 650 bis 1'800 Franken",
    ]);
  });
});

// BS-154.810: fuehrende bare Tarif-Nr. -> Tarif-Nr.-Spalte
describe('BS-154.810: fuehrende bare Tarif-Nr. -> Tarif-Nr.-Spalte', () => {
  const bsInput =
    "1 · Verfahren: in Eheschutzverfahren · Gebühr: Fr. 300 bis Fr. 2'000 — 1.1. · Verfahren: in aufwendigen Fällen · Gebühr: bis Fr. 10'000";

  it('liefert kopf [Tarif-Nr., Verfahren, Gebuehr]', () => {
    const r = extrahiereMehrspaltig(bsInput);
    expect(r).not.toBeNull();
    expect(r!.kopf).toEqual(['Tarif-Nr.', 'Verfahren', 'Gebühr']);
  });

  it('Zeile 0 korrekt', () => {
    const r = extrahiereMehrspaltig(bsInput);
    expect(r!.zeilen[0]).toEqual(['1', 'in Eheschutzverfahren', "Fr. 300 bis Fr. 2'000"]);
  });

  it('Zeile 1: hierarchische Tarif-Nr. (1.1. mit trailing dot)', () => {
    const r = extrahiereMehrspaltig(bsInput);
    expect(r!.zeilen[1]).toEqual(['1.1.', 'in aufwendigen Fällen', "bis Fr. 10'000"]);
  });
});

// null-Schutz
describe('null-Schutz: kein Tabellen-Marker -> null', () => {
  it('normaler Absatz ohne Marker -> null', () => {
    expect(extrahiereMehrspaltig('Ein normaler Absatz ohne Tabellen-Marker.')).toBeNull();
  });

  it('nur mittelpunkt ohne em-dash -> null', () => {
    expect(extrahiereMehrspaltig('Nur ein · Punkt ohne Zeilen-Trenner.')).toBeNull();
  });

  it('nur em-dash ohne mittelpunkt -> null', () => {
    expect(extrahiereMehrspaltig('Zeile eins — Zeile zwei.')).toBeNull();
  });

  it('nur eine Zeile nach Split (< 2 Zeilen) -> null', () => {
    expect(extrahiereMehrspaltig('Label: Wert · Andere: Info')).toBeNull();
  });
});

// Interner `: ` im Wert -> nur am ersten `: ` trennen
describe('Interner `: ` im Wert: nur am ERSTEN `: ` trennen', () => {
  const internerInput =
    'Bezeichnung: für X: besondere Fälle · Betrag: 100.– — Bezeichnung: Y · Betrag: 50.–';

  it('Wert der ersten Zelle enthaelt den internen Doppelpunkt verbatim', () => {
    const r = extrahiereMehrspaltig(internerInput);
    expect(r).not.toBeNull();
    expect(r!.zeilen[0][0]).toBe('für X: besondere Fälle');
  });

  it('kopf korrekt (Bezeichnung, Betrag)', () => {
    const r = extrahiereMehrspaltig(internerInput);
    expect(r!.kopf).toEqual(['Bezeichnung', 'Betrag']);
  });

  it('zeilen[0] vollstaendig korrekt', () => {
    const r = extrahiereMehrspaltig(internerInput);
    expect(r!.zeilen[0]).toEqual(['für X: besondere Fälle', '100.–']);
  });

  it('zeilen[1] vollstaendig korrekt', () => {
    const r = extrahiereMehrspaltig(internerInput);
    expect(r!.zeilen[1]).toEqual(['Y', '50.–']);
  });
});

// Paragraph-1-Schutz: ambige Zelle (kein `: `, keine Tarif-Nr.) -> null
describe('Paragraph-1-Schutz: ambige Zelle (kein `: `, keine Tarif-Nr.) -> null', () => {
  it('ambige Zelle in Zeile -> null statt raten', () => {
    // "NurText" hat kein `: ` und matcht nicht /^\d+(\.\d+)*\.?$/
    const r = extrahiereMehrspaltig(
      'Label: Wert · NurText — Label: Wert2 · Label2: X',
    );
    expect(r).toBeNull();
  });
});

// §1-Regression NW-265.51: fehlender ` — `-Separator vor Tarif-Nr.-Abschnittszeile
// (LexWork liefert kein ` — ` zwischen einem Betrag-Ende und dem nächsten
//  «Tarif-Nr.: X.Y · Bezeichnung: …»-Eintrag → der Parser muss ihn normalisieren.)
describe('§1-Regression NW-265.51: fehlende Zeilentrenner vor Abschnittsüberschrift', () => {
  // Muster aus a1-1 art: «100.–» direkt gefolgt von «Tarif-Nr.: 1.4 · Bezeichnung: Publik...»
  // ohne dazwischenstehendes ` — `. Die Abschnittszeile 1.4 hat keinen Betrag-Wert.
  const nwA11Input =
    'Tarif-Nr.: 1.3.8.8 · Bezeichnung: Arbeitsbewilligung für Schutzbedürftige (S) · Betrag: 100.– Tarif-Nr.: 1.4 · Bezeichnung: Publikationsgesetzgebung (NG 141.1) — Tarif-Nr.: 1.4.1 · Bezeichnung: Amtsblatt';

  it('NW a1-1: Betrag der Zeile 1.3.8.8 ist nur «100.–» (kein Tarif-Nr.-Ballast)', () => {
    const r = extrahiereMehrspaltig(nwA11Input);
    expect(r).not.toBeNull();
    // row[0] = 1.3.8.8-Zeile: Betrag muss sauber «100.–» sein, ohne «Tarif-Nr.: 1.4»
    const betragIdx = r!.kopf.indexOf('Betrag');
    expect(betragIdx).toBeGreaterThanOrEqual(0);
    expect(r!.zeilen[0][betragIdx]).toBe('100.–');
  });

  it('NW a1-1: Abschnittszeile 1.4 / Publikationsgesetzgebung ist eigene Zeile', () => {
    const r = extrahiereMehrspaltig(nwA11Input);
    expect(r).not.toBeNull();
    // row[1] = 1.4-Abschnittszeile: Tarif-Nr.=«1.4», Bezeichnung=«Publikationsgesetzgebung (NG 141.1)»
    const tarifIdx = r!.kopf.indexOf('Tarif-Nr.');
    const bezIdx = r!.kopf.indexOf('Bezeichnung');
    expect(r!.zeilen[1][tarifIdx]).toBe('1.4');
    expect(r!.zeilen[1][bezIdx]).toBe('Publikationsgesetzgebung (NG 141.1)');
  });

  // Muster aus a1-4 art: «10.–» direkt gefolgt von «Tarif-Nr.: 4.2 · Bezeichnung: Zentrum Bevölkerungsschutz»
  const nwA14Input =
    'Tarif-Nr.: 4.1.4 · Bezeichnung: zusätzliche Leistungen Wäsche, je Wäschesack · Betrag: 10.– Tarif-Nr.: 4.2 · Bezeichnung: Zentrum Bevölkerungsschutz — Tarif-Nr.: 4.2.1 · Bezeichnung: Plenarsaal, halber / ganzer Tag · Betrag: 150.– / 250.–';

  it('NW a1-4: Betrag der Zeile 4.1.4 ist nur «10.–» (kein Tarif-Nr.-Ballast)', () => {
    const r = extrahiereMehrspaltig(nwA14Input);
    expect(r).not.toBeNull();
    const betragIdx = r!.kopf.indexOf('Betrag');
    expect(betragIdx).toBeGreaterThanOrEqual(0);
    expect(r!.zeilen[0][betragIdx]).toBe('10.–');
  });

  it('NW a1-4: Abschnittszeile 4.2 / Zentrum Bevölkerungsschutz ist eigene Zeile', () => {
    const r = extrahiereMehrspaltig(nwA14Input);
    expect(r).not.toBeNull();
    const tarifIdx = r!.kopf.indexOf('Tarif-Nr.');
    const bezIdx = r!.kopf.indexOf('Bezeichnung');
    expect(r!.zeilen[1][tarifIdx]).toBe('4.2');
    expect(r!.zeilen[1][bezIdx]).toBe('Zentrum Bevölkerungsschutz');
  });

  // Schutz: kein Doppel-Insert wenn ` — Tarif-Nr.:` bereits vorhanden
  it('kein Doppel-Insert wenn Trenner bereits korrekt vorhanden', () => {
    const korrekt =
      'Tarif-Nr.: 1.1 · Bezeichnung: Alpha · Betrag: 50.– — Tarif-Nr.: 1.2 · Bezeichnung: Beta · Betrag: 30.–';
    const r = extrahiereMehrspaltig(korrekt);
    expect(r).not.toBeNull();
    // Genau 2 Zeilen (kein Doppel-Split durch fehlerhafte Insert)
    expect(r!.zeilen.length).toBe(2);
    expect(r!.zeilen[0][r!.kopf.indexOf('Betrag')]).toBe('50.–');
    expect(r!.zeilen[1][r!.kopf.indexOf('Betrag')]).toBe('30.–');
  });
});
