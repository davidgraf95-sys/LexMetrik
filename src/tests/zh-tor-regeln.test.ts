/**
 * Unit-Tests der REINEN Tor-Regeln (`scripts/normtext/zh-tor-regeln.ts`) —
 * Härtung 2 der ZH-Fix-Runde 3.
 *
 * Jeder Test stellt eine der elf Mutationen nach, die die zweite Prüf-Linse
 * durch das Tor gebracht hat, und hält fest, dass die Regel sie jetzt fängt
 * (§6.7: ein Tor, das nicht scheitern kann, ist gefährlicher als keines).
 * Die Integrations-Rot-Proben gegen das echte PDF stehen im Bericht; hier
 * steht die Regel selbst, damit sie nicht still wieder aufweicht.
 */
import { describe, it, expect } from 'vitest';
import {
  eintragMass,
  istPlatzhalterEintrag,
  istTeilfolge,
  pruefeZahlen,
  trennstrichEnden,
  zeichenQuote,
  TRENNSTRICH_ENDE,
  ZEICHEN_MIN,
  PLATZHALTER,
  type TorEintrag,
} from '../../scripts/normtext/zh-tor-regeln.ts';

const eintrag = (artikel: string, bloecke: TorEintrag['bloecke']): TorEintrag => ({
  artikel,
  artikelLabel: `§ ${artikel}`,
  bloecke,
});

describe('Prüfung 3 — Trennstrich-Enden, alle vier Codepoints (M9b/M9c)', () => {
  it('fängt den ASCII-Bindestrich nach einem Buchstaben (Bestand)', () => {
    expect(TRENNSTRICH_ENDE.test('Gebüh-')).toBe(true);
  });

  it('fängt U+2011, den nicht umbrechenden Bindestrich (M9b)', () => {
    // Vorher: /\p{L}-$/ kannte nur U+002D — die Kappung lief durch.
    expect(TRENNSTRICH_ENDE.test('Rechts‑')).toBe(true);
    expect(TRENNSTRICH_ENDE.test('Rechts‐')).toBe(true);
    expect(TRENNSTRICH_ENDE.test('Rechts­')).toBe(true);
  });

  it('fängt die Kappung nach einer ZIFFER (M9c)', () => {
    expect(TRENNSTRICH_ENDE.test('gemäss Ziffer 12-')).toBe(true);
  });

  it('lässt den GEDANKENSTRICH in Betragsangaben in Ruhe (§1)', () => {
    // «Fr. 10.–» und «65– 250» stehen so im amtlichen PDF. Ein Wächter, der
    // korrekten Wortlaut beanstandet, wäre schlimmer als keiner.
    expect(TRENNSTRICH_ENDE.test('Fr. 10.–')).toBe(false);
    expect(TRENNSTRICH_ENDE.test('bis 1 000')).toBe(false);
  });

  it('meldet die Fundstelle je Block, item und Tabellenzelle', () => {
    const e = eintrag('5', [
      { text: 'Ein abgeschnittener Satz mit Rechts‑' },
      { text: 'ganz', items: [{ marke: 'a', text: 'auch hier gekappt-' }] },
      { text: 'tabelle', mehrspaltig: { zeilen: [['bis 1 000', 'Zuschlag-']] } },
    ]);
    expect(trennstrichEnden([e])).toEqual(['§ 5', '§ 5 lit.', '§ 5 (Tabelle)']);
  });
});

describe('Prüfung 7b — Zahlenfolge positionsgebunden (M6b/M6c/M6d)', () => {
  // Auszug aus ZH-211.11 § 4 in Lesereihenfolge.
  const pdf = ['1', '000', '25', '150', '1', '000', '5', '000', '250', '20', '5', '000', '20', '000', '1', '050', '14'];

  it('grün, wenn Snapshot und PDF-Region deckungsgleich sind', () => {
    expect(pruefeZahlen([...pdf], pdf, 0)).toEqual({ folgeGebrochen: false, zusatz: 0 });
  });

  it('M6b — TAUSCH zweier Beträge: die Multimenge bleibt gleich, die Folge nicht', () => {
    const getauscht = [...pdf];
    // «1 050» an die Stelle von «250» und umgekehrt — dieselben Zahlen, andere Reihenfolge.
    [getauscht[8], getauscht[14]] = [getauscht[14], getauscht[8]];
    [getauscht[9], getauscht[15]] = [getauscht[15], getauscht[9]];
    const alt = new Set(pdf);
    // Beweis, dass die ALTE Prüfung (Zahl kommt irgendwo vor) blind bleibt:
    expect(getauscht.every((z) => alt.has(z))).toBe(true);
    // …und dass die neue rot wird.
    expect(pruefeZahlen(getauscht, pdf, 0).folgeGebrochen).toBe(true);
  });

  it('M6c — ERSATZ eines Prozentsatzes (14 → 8), obwohl 8 anderswo vorkommt', () => {
    const ersetzt = pdf.map((z) => (z === '14' ? '8' : z));
    expect(pruefeZahlen(ersetzt, pdf, 0).folgeGebrochen).toBe(true);
  });

  it('M6d — ERSATZ einer Staffelgrenze', () => {
    const ersetzt = [...pdf];
    ersetzt[12] = '80';
    expect(pruefeZahlen(ersetzt, pdf, 0).folgeGebrochen).toBe(true);
  });

  it('meldet ZUSATZ-Zahlen, aber nur über der deklarierten Ausnahme hinaus', () => {
    const mitZusatz = [...pdf, '999', '888'];
    expect(pruefeZahlen(mitZusatz, pdf, 0).zusatz).toBe(2);
    expect(pruefeZahlen(mitZusatz, pdf, 2).zusatz).toBe(0);
    expect(pruefeZahlen(mitZusatz, pdf, 1).zusatz).toBe(2);
  });

  it('istTeilfolge achtet auf die Reihenfolge, nicht nur auf das Vorkommen', () => {
    expect(istTeilfolge(['a', 'b'], ['x', 'a', 'y', 'b'])).toBe(true);
    expect(istTeilfolge(['b', 'a'], ['x', 'a', 'y', 'b'])).toBe(false);
  });
});

describe('Prüfung 7c — Zeichen-Deckungsgrad (M3/M11/M12)', () => {
  it('M11 — ein leergeräumtes `bloecke` ergibt Deckungsgrad 0', () => {
    expect(zeichenQuote(eintragMass([]).zeichen, 505)).toBe(0);
    expect(zeichenQuote(0, 505)! < ZEICHEN_MIN).toBe(true);
  });

  it('M12 — eine Kappung auf ein Drittel liegt unter der Schwelle', () => {
    expect(zeichenQuote(168, 505)! < ZEICHEN_MIN).toBe(true);
  });

  it('M3 — ein gelöschter Absatz von einem Fünftel liegt unter der Schwelle', () => {
    expect(zeichenQuote(404, 505)! < ZEICHEN_MIN).toBe(true);
  });

  it('der gemessene Bestands-Tiefstwert (95.9 %) bleibt GRÜN', () => {
    expect(zeichenQuote(959, 1000)! >= ZEICHEN_MIN).toBe(true);
  });

  it('eine Region ohne Zeichen (nackter aufgehobener Kopf) ist ausgenommen', () => {
    expect(zeichenQuote(10, 0)).toBeNull();
  });
});

describe('eintragMass — der Platzhalter zählt nicht als Quelltext', () => {
  it('«Aufgehoben» fliesst weder in Zeichen noch in Zahlen ein', () => {
    const m = eintragMass([
      { text: 'Der Gemeindevorstand ist zuständig:', items: [
        { marke: '1', text: PLATZHALTER },
        { marke: '2', text: 'für Art. 550 ZGB,' },
      ] },
    ]);
    expect(m.zahlen).toEqual(['1', '2', '550']);
    expect(m.zeichen).toBe(
      'DerGemeindevorstandistzuständig:'.length + '1'.length + '2'.length + 'fürArt.550ZGB,'.length,
    );
  });

  it('Spaltentitel und Tabellenzellen zählen mit', () => {
    const m = eintragMass([
      { text: '', mehrspaltig: { spalten: [{ titel: 'Streitwert (in Franken)' }], zeilen: [['bis 1 000']] } },
    ]);
    expect(m.zahlen).toEqual(['1', '000']);
  });
});

describe('Prüfung 1 — Erfindungs-Klasse (M14)', () => {
  it('der deklarierte Platzhalter darf eine Sammel-Spanne auffüllen', () => {
    expect(istPlatzhalterEintrag(eintrag('77_b', [{ absatz: null, text: PLATZHALTER }]))).toBe(true);
  });

  it('ein erfundener § MIT Wortlaut darf es NICHT (vorher: ging durch)', () => {
    expect(
      istPlatzhalterEintrag(eintrag('77_b', [{ absatz: null, text: 'Die Anordnung ergeht schriftlich.' }])),
    ).toBe(false);
  });

  it('auch ein Platzhalter MIT Anhängseln zählt nicht als Auffüllung', () => {
    expect(
      istPlatzhalterEintrag(
        eintrag('77_b', [{ absatz: null, text: PLATZHALTER, items: [{ marke: 'a', text: 'x' }] }]),
      ),
    ).toBe(false);
    expect(
      istPlatzhalterEintrag(
        eintrag('77_b', [
          { absatz: null, text: PLATZHALTER },
          { absatz: '2', text: 'noch ein Absatz' },
        ]),
      ),
    ).toBe(false);
  });
});
