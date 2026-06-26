import { describe, it, expect } from 'vitest';
import {
  gruppiereTausender, gruppiereBetraege, normalisiereAbsatzNummer, absatzMarke,
  artikelGanzAufgehoben, randtitelKnoten,
} from '../lib/normtext/darstellung';

// randtitelKnoten (6b): Ahnen-Gruppierungen (eigene Knoten) vom artikel-eigenen
// Blatt (Sachüberschrift) trennen. Das Blatt wird POSITIONSWEISE bestimmt.
describe('randtitelKnoten', () => {
  it('teilt mehrstufige Kette in Ahnen + Blatt (Marker bleibt im Ahnen-Label)', () => {
    expect(randtitelKnoten(['A. Abschluss', 'II. Antrag', '1. Frist']))
      .toEqual({ ahnen: ['A. Abschluss', 'II. Antrag'], blatt: '1. Frist' });
  });
  it('Einzel-Sachüberschrift → kein Ahn, nur Blatt', () => {
    expect(randtitelKnoten(['Gegenstand'])).toEqual({ ahnen: [], blatt: 'Gegenstand' });
  });
  it('leere Kette → kein Ahn, kein Blatt', () => {
    expect(randtitelKnoten([])).toEqual({ ahnen: [], blatt: null });
  });
  it('aufgehobenes Blatt («c. …») → kein Blatt, tiefste echte Stufe bleibt Ahn', () => {
    expect(randtitelKnoten(['A. X', '2. Voraussetzungen', 'c. …']))
      .toEqual({ ahnen: ['A. X', '2. Voraussetzungen'], blatt: null });
  });
  it('verwirft leere Zwischenstufen, nicht echte Titel', () => {
    expect(randtitelKnoten(['A. X', '…', '1. Frist']))
      .toEqual({ ahnen: ['A. X'], blatt: '1. Frist' });
  });
});

// artikelGanzAufgehoben: nur EINKLAPPEN, wenn KEIN lebender Inhalt übrig ist.
// Tabelle/Mehrspaltig (text leer per Konvention) sind lebender Inhalt — sie
// dürfen NIE als aufgehoben gelten (Bug-Fix 26.6.2026: 389 Tarif-Artikel).
describe('artikelGanzAufgehoben', () => {
  it('echt aufgehoben: «Aufgehoben» / «…» ohne Items', () => {
    expect(artikelGanzAufgehoben([{ text: 'Aufgehoben' }])).toBe(true);
    expect(artikelGanzAufgehoben([{ text: '…' }])).toBe(true);
  });
  it('Tarif-Tabelle (text leer + tabelle) ist NICHT aufgehoben', () => {
    expect(artikelGanzAufgehoben([{ text: '', tabelle: [{ beschreibung: 'x', betrag: '10' }] }])).toBe(false);
  });
  it('mehrspaltige Tabelle (text leer + zeilen) ist NICHT aufgehoben', () => {
    expect(artikelGanzAufgehoben([{ text: '', mehrspaltig: { zeilen: [['a', 'b']] } }])).toBe(false);
  });
  it('lebender Einleitungstext + nur aufgehobene Items ist NICHT aufgehoben', () => {
    expect(artikelGanzAufgehoben([{ text: 'Der Regierungsrat ist zuständig für', items: [{ text: '…' }] }])).toBe(false);
  });
  it('leerer Lead + alle Items aufgehoben ist aufgehoben', () => {
    expect(artikelGanzAufgehoben([{ text: '', items: [{ text: '…' }, { text: 'Aufgehoben' }] }])).toBe(true);
  });
  it('leere Blockliste ist nicht aufgehoben', () => {
    expect(artikelGanzAufgehoben([])).toBe(false);
  });
});

// Stufe-2-D (22.6.2026): Schweizer Tausender-Apostrophe in der Betrag-Spalte
// der TarifTabelle. Zeichen: U+0027 (gerader Apostroph) — übereinstimmend mit
// den Fedlex-/LexWork-Snapshots selbst (z. B. «10'000» in BS-154.810.json).

describe('gruppiereTausender (§1: nur Gruppierung, §3: reine Darstellung)', () => {
  it('fügt Apostroph in 4-stellige Zahl ein: 2000.— → 2\'000.—', () => {
    expect(gruppiereTausender("2000.—")).toBe("2'000.—");
  });

  it('fügt Apostroph nur vor dem ≥4-stelligen Lauf ein: 150.— bis 2000.— → 150.— bis 2\'000.—', () => {
    expect(gruppiereTausender('150.— bis 2000.—')).toBe("150.— bis 2'000.—");
  });

  it('lässt Nicht-Zahlzeichen (Gedankenstrich, Komma) unberührt: —.50 → —.50', () => {
    expect(gruppiereTausender('—.50')).toBe('—.50');
  });

  it('gruppiert 5-stellige Zahl: 10000 → 10\'000', () => {
    expect(gruppiereTausender('10000')).toBe("10'000");
  });

  it('gruppiert 7-stellige Zahl mit zwei Apostrophen: 2000000 → 2\'000\'000', () => {
    expect(gruppiereTausender('2000000')).toBe("2'000'000");
  });

  it('ist idempotent: bereits gruppierte Zahl bleibt unverändert: 2\'000 → 2\'000', () => {
    // Kein \d{4,}-Match, weil Apostroph die Folge unterbricht
    expect(gruppiereTausender("2'000")).toBe("2'000");
  });

  it('lässt 3-stellige Zahl unverändert: 500 → 500', () => {
    expect(gruppiereTausender('500')).toBe('500');
  });

  it('groupiert Bereichsangabe: Fr. 1000 bis Fr. 50000 → Fr. 1\'000 bis Fr. 50\'000', () => {
    expect(gruppiereTausender('Fr. 1000 bis Fr. 50000')).toBe("Fr. 1'000 bis Fr. 50'000");
  });

  it('leerer String bleibt leer', () => {
    expect(gruppiereTausender('')).toBe('');
  });

  // Issue 2 (22.6.2026): Leerzeichen-getrennte Tausender (ZH-PDF-Stil)
  it('«5 000» → «5\'000» (ZH-PDF Leerzeichen-Tausender)', () => {
    expect(gruppiereTausender('5 000')).toBe("5'000");
  });

  it('«1 250» → «1\'250» (ZH-PDF Leerzeichen-Tausender)', () => {
    expect(gruppiereTausender('1 250')).toBe("1'250");
  });

  it('«10 000» → «10\'000» (ZH-PDF Leerzeichen-Tausender)', () => {
    expect(gruppiereTausender('10 000')).toBe("10'000");
  });

  it('«106 400» → «106\'400» (ZH-PDF Leerzeichen-Tausender, Issue 1-Grundgebühr)', () => {
    expect(gruppiereTausender('106 400')).toBe("106'400");
  });

  it('«über 10 Mio.» bleibt UNVERÄNDERT (kein 3-Ziffern-Muster nach Leerzeichen)', () => {
    expect(gruppiereTausender('über 10 Mio.')).toBe('über 10 Mio.');
  });

  it('«mind. aber Fr. 100» bleibt UNVERÄNDERT (kein digit+space+3digits-Muster)', () => {
    expect(gruppiereTausender('mind. aber Fr. 100')).toBe('mind. aber Fr. 100');
  });

  it('«2000.—» → «2\'000.—» (bestehende SG-Logik, unverändert)', () => {
    expect(gruppiereTausender('2000.—')).toBe("2'000.—");
  });

  it('Ketten «1 234 567» → «1\'234\'567» (chained Leerzeichen-Gruppen, wiederholt bis stabil)', () => {
    expect(gruppiereTausender('1 234 567')).toBe("1'234'567");
  });

  it('«über 5 000 bis 10 000» → «über 5\'000 bis 10\'000» (Streitwert-Spalte ZH)', () => {
    expect(gruppiereTausender('über 5 000 bis 10 000')).toBe("über 5'000 bis 10'000");
  });
});

// FIX 2 — 22.6.2026: gruppiereBetraege — Tausender-Gruppierung NUR in Geld-Kontext
// (Fr./CHF/Franken), kein «2011»→«2'011», kein «§ 1234»→«§ 1'234».
describe('gruppiereBetraege (§1: kein Ziffernwert geändert; §3: reine Darstellung, nur Geld-Kontext)', () => {
  it('«Fr. 12 000» → «Fr. 12\'000» (Kernanwendungsfall ZH-Fliesstext)', () => {
    expect(gruppiereBetraege('Fr. 12 000')).toBe("Fr. 12'000");
  });

  it('«CHF 12 000» → «CHF 12\'000»', () => {
    expect(gruppiereBetraege('CHF 12 000')).toBe("CHF 12'000");
  });

  it('«12 000 Franken» → «12\'000 Franken»', () => {
    expect(gruppiereBetraege('12 000 Franken')).toBe("12'000 Franken");
  });

  it('Jahrzahl «2011» bleibt UNVERÄNDERT (kein Fr./CHF/Franken-Kontext)', () => {
    expect(gruppiereBetraege('Gesetz vom 1. Januar 2011 über')).toBe('Gesetz vom 1. Januar 2011 über');
  });

  it('«§ 1234» bleibt UNVERÄNDERT (kein Geld-Kontext)', () => {
    expect(gruppiereBetraege('§ 1234')).toBe('§ 1234');
  });

  it('«Fr. 500» (3 Stellen) bleibt UNVERÄNDERT (zu kurz für Tausendertrenner)', () => {
    expect(gruppiereBetraege('Fr. 500')).toBe('Fr. 500');
  });

  it('Idempotent: «Fr. 12\'000» bleibt «Fr. 12\'000» (bereits gruppiert)', () => {
    expect(gruppiereBetraege("Fr. 12'000")).toBe("Fr. 12'000");
  });

  it('Mischsatz mit Jahr und Betrag: Jahr unverändert, Betrag gruppiert', () => {
    expect(gruppiereBetraege('In Kraft seit 2011; Busse bis Fr. 5 000.')).toBe(
      "In Kraft seit 2011; Busse bis Fr. 5'000.",
    );
  });

  it('Mehrere Beträge im selben Satz werden alle gruppiert', () => {
    expect(gruppiereBetraege('von Fr. 1 000 bis Fr. 50 000')).toBe(
      "von Fr. 1'000 bis Fr. 50'000",
    );
  });

  it('Leerer String bleibt leer', () => {
    expect(gruppiereBetraege('')).toBe('');
  });
});

// S6 (BS-Audit 23.6.2026) — Absatz-Marker vereinheitlichen (§3, reine Darstellung).
// Reale BS-absatz-Werte: «1.», «10.», «Ziff. 2.1.», «1. II»; nicht-numerische
// Marker («-», «2-4») dürfen NICHT zu einer Zahl verbogen werden (§7/§1).
describe('normalisiereAbsatzNummer (S6: schlichte Absatznummer)', () => {
  it('strippt abschliessenden Punkt: «1.» → «1», «10.» → «10»', () => {
    expect(normalisiereAbsatzNummer('1.')).toBe('1');
    expect(normalisiereAbsatzNummer('10.')).toBe('10');
    expect(normalisiereAbsatzNummer('13.')).toBe('13');
  });

  it('entfernt «Ziff.»-Präfix + Punkt: «Ziff. 2.1.» → «2.1»', () => {
    expect(normalisiereAbsatzNummer('Ziff. 2.1.')).toBe('2.1');
    expect(normalisiereAbsatzNummer('Ziff. 1.1.')).toBe('1.1');
  });

  it('«1. II» / «1. IIa» → schlichte Absatznummer «1»', () => {
    expect(normalisiereAbsatzNummer('1. II')).toBe('1');
    expect(normalisiereAbsatzNummer('1. IIa')).toBe('1');
    expect(normalisiereAbsatzNummer('1. III')).toBe('1');
  });

  it('bereits schlichte (hierarchische) Nummer bleibt unverändert', () => {
    expect(normalisiereAbsatzNummer('1')).toBe('1');
    expect(normalisiereAbsatzNummer('2.1')).toBe('2.1');
  });

  it('bis/ter-Suffix-Formen bleiben unverändert (legitime Absatznummer)', () => {
    expect(normalisiereAbsatzNummer('1bis')).toBe('1bis');
    expect(normalisiereAbsatzNummer('2ter')).toBe('2ter');
    expect(normalisiereAbsatzNummer('1quater')).toBe('1quater');
  });

  it('NICHT-numerische Marker bleiben verbatim (keine erfundene Zahl, §1/§7)', () => {
    expect(normalisiereAbsatzNummer('-')).toBe('-');
    expect(normalisiereAbsatzNummer('2-4')).toBe('2-4');
  });

  it('absatzMarke wendet die Normalisierung an, bis/ter-Leak bleibt intakt', () => {
    expect(absatzMarke('1.', 'Der Vertrag ist nichtig.'))
      .toEqual({ marke: '1', rest: 'Der Vertrag ist nichtig.' });
    expect(absatzMarke('Ziff. 2.1.', 'Etwas.'))
      .toEqual({ marke: '2.1', rest: 'Etwas.' });
    // bis-Leak (absatz=1, Text «bis Erfordert …») → weiterhin «1bis».
    expect(absatzMarke('1', 'bis Erfordert die Erstellung eines Schriftstücks …'))
      .toEqual({ marke: '1bis', rest: 'Erfordert die Erstellung eines Schriftstücks …' });
  });
});
