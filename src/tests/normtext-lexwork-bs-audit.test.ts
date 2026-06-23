// ─── LexWork-Adapter — BS-Vorbildkanton-Audit (23.6.2026) ───────────────────
// Fünf korpusweite Daten-Treue-Fixes im geteilten LexWork-Extraktor:
//   S1  aufgehobene/umnummerierte Artikel nicht mehr verschlucken
//   S2  paragraph_post / text_content_post einlesen
//   S3  aufgehobene lit.-Buchstaben behalten
//   S4  Absatz-Zwischentitel («a) Spital») nicht als lit. fehldeuten
//   N1  Randtitel (article_title) extrahieren
// Plus S9 (erlassBezeichnung: Volltitel statt degradiertes «KÜRZEL (SR)»).
//
// Alle Fixtures sind echte, gekürzte LexWork-xhtml_tol-Ausschnitte (Quelle je
// Fixture dokumentiert in src/tests/fixtures/lexwork-bs-audit.ts), abgerufen 23.6.2026.
import { describe, expect, it } from 'vitest';
import { extrahiereAlleLexWorkArtikel } from '../../scripts/normtext/adapter-lexwork';
import { erlassBezeichnung } from '../../scripts/normtext-snapshot';
import { identitaetAusErlass } from '../../scripts/normtext/browse-manifest';
import {
  LEXWORK_BS_410100_AUFGEHOBEN_XHTML,
  LEXWORK_BS_153100_S53_XHTML,
  LEXWORK_BS_834410_S8A_XHTML,
  LEXWORK_BS_640100_S35_XHTML,
  LEXWORK_BS_832710_S14_XHTML,
  LEXWORK_BS_640100_S50_XHTML,
  LEXWORK_BS_640100_S131_XHTML,
  LEXWORK_BS_772430_S3_XHTML,
  LEXWORK_BS_154810_S29_XHTML,
} from './fixtures/lexwork-bs-audit';

describe('S1 — aufgehobene, umnummerierte Artikel werden NICHT mehr verschluckt', () => {
  it('410.100 §6 (aufgehoben, «…»-Titel, leerer Body) erscheint mit leerem Block — Nummerierung reisst nicht', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_410100_AUFGEHOBEN_XHTML);
    // §6 (aufgehoben) UND §7 (mit Body) sind beide da.
    expect(Object.keys(artikel).sort()).toEqual(['6', '7']);
    // §6: ein leerer Block (kein fabrizierter «Aufgehoben.»-Text, §7 Treue).
    expect(artikel['6'].bloecke).toEqual([{ absatz: null, text: '' }]);
    // §6 hat KEINEN Randtitel («…» ist Aufhebungs-Platzhalter, kein Sachtitel).
    expect(artikel['6'].titel).toBeUndefined();
  });

  it('153.100 §53 (nur Randtitel, kein Body) erscheint und behält den Randtitel', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_153100_S53_XHTML);
    expect(artikel['53']).toBeDefined();
    expect(artikel['53'].bloecke).toEqual([{ absatz: null, text: '' }]);
    // N1 + Fussnoten-Bereinigung: «Änderung anderer Gesetze[4]» → ohne «[4]».
    expect(artikel['53'].titel).toBe('Änderung anderer Gesetze');
  });
});

describe('S2 — paragraph_post / text_content_post werden eingelesen (834.410 §8a)', () => {
  const a = extrahiereAlleLexWorkArtikel(LEXWORK_BS_834410_S8A_XHTML).artikel['8_a'];

  it('die _post-Ziffern 2–6 stehen als Folgeabsatz im Output', () => {
    const post = a.bloecke[a.bloecke.length - 1];
    expect(post.items?.map((i) => i.marke)).toEqual(['2', '3', '4', '5', '6']);
  });

  it('substantieller _post-Normtext geht NICHT verloren (Vermögensgrenze, 360 Pflegetage, ausserkantonal)', () => {
    const ganz = JSON.stringify(a);
    expect(ganz).toContain("Fr. 1'000'000");
    expect(ganz).toContain('360 Pflegetage');
    expect(ganz).toContain('ausserkantonalen');
  });

  it('die leeren paragraph_post zwischen Abs. 1/2/3 verschlucken die Folgeabsätze NICHT', () => {
    // Abs. 1, 2, 3 behalten ihre Absatznummern (Bug: leere _post ohne </p> zog
    // sonst den nächsten Absatz in ihren lazy [\\s\\S]*?-Match).
    expect(a.bloecke[0].absatz).toBe('1');
    expect(a.bloecke[1].absatz).toBe('2');
    expect(a.bloecke[2].absatz).toBe('3');
  });
});

describe('S3 — aufgehobene lit.-Buchstaben mit leerem Body bleiben (Lücke geschlossen)', () => {
  it('640.100 §35: lit. g (zwischen f und h) bleibt als leeres item erhalten', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_640100_S35_XHTML);
    const items = artikel['35'].bloecke[0].items!;
    expect(items.map((i) => i.marke)).toEqual(['f', 'g', 'h']);
    // lit. g: Marke vorhanden, Text leer — KEIN fabrizierter «Aufgehoben.» (§7).
    const g = items.find((i) => i.marke === 'g')!;
    expect(g.text).toBe('');
  });

  it('832.710 §14: lit. b (aufgehoben) bleibt zwischen a und c erhalten', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_832710_S14_XHTML);
    const block = artikel['14'].bloecke.find((b) => b.items)!;
    expect(block.items!.map((i) => i.marke)).toEqual(['a', 'b', 'c']);
    expect(block.items!.find((i) => i.marke === 'b')!.text).toBe('');
  });
});

describe('S4 — Absatz-Zwischentitel werden NICHT als lit. fehldeutet (834.410 §8a)', () => {
  const a = extrahiereAlleLexWorkArtikel(LEXWORK_BS_834410_S8A_XHTML).artikel['8_a'];

  it('Abs. 1 «a) Spital» ist Zwischentitel + Normtext, KEIN lit.-item', () => {
    expect(a.bloecke[0].items ?? []).toEqual([]);
    expect(a.bloecke[0].text.startsWith('a) Spital')).toBe(true);
    expect(a.bloecke[0].text).toContain('Reduziert ein Krankenversicherer');
  });

  it('Abs. 2 «b) Pflegeheim» ebenso (kein lit.-item b)', () => {
    expect(a.bloecke[1].items ?? []).toEqual([]);
    expect(a.bloecke[1].text.startsWith('b) Pflegeheim')).toBe(true);
  });

  it('Abs. 3 «c) Beitragshöhe» ist Zwischentitel, die Ziffern-Aufzählung (1.) bleibt erhalten', () => {
    // «c)» wird NICHT als lit.-item geführt; «1.» bleibt ein Ziffern-item.
    expect(a.bloecke[2].text).toContain('c) Beitragshöhe');
    expect(a.bloecke[2].items?.map((i) => i.marke)).toEqual(['1']);
  });
});

describe('N1 — Randtitel (article_title) wird extrahiert', () => {
  it('834.410 §8a trägt den amtlichen Randtitel', () => {
    const a = extrahiereAlleLexWorkArtikel(LEXWORK_BS_834410_S8A_XHTML).artikel['8_a'];
    expect(a.titel).toBe('Kantonale Beiträge an die Spital- und Pflegeheimtaxen');
  });

  it('410.100 §7 trägt seinen Randtitel; §6 (aufgehoben) trägt KEINEN', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_410100_AUFGEHOBEN_XHTML);
    expect(artikel['7'].titel).toBe('Schulpflicht');
    expect(artikel['6'].titel).toBeUndefined();
  });

  it('leerer «&nbsp;»-Randtitel ergibt keinen Randtitel (640.100 §35)', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_640100_S35_XHTML);
    expect(artikel['35'].titel).toBeUndefined();
  });
});

describe('S9 — Volltitel statt degradiertes «KÜRZEL (SR-Nr.)»', () => {
  it('erlassBezeichnung führt Volltitel als Titel UND Abkürzung separat als Kürzel', () => {
    const erl = erlassBezeichnung('Advokaturgesetz', 'AdvG', '291.100');
    expect(erl).toBe('Advokaturgesetz, AdvG (291.100)');
    // Die ganze Kette: das Browse-Manifest splittet korrekt in Titel + Kürzel.
    expect(identitaetAusErlass(erl)).toEqual({
      titel: 'Advokaturgesetz',
      kuerzel: 'AdvG',
      sr: '291.100',
    });
  });

  it('ohne Abkürzung → nur der Titel (kein doppeltes Komma); HTM/PDF-Pfad byte-gleich', () => {
    expect(erlassBezeichnung('Gesetz über X', '', '100.1')).toBe('Gesetz über X (100.1)');
  });

  it('identische Abkürzung == Titel wird nicht verdoppelt', () => {
    expect(erlassBezeichnung('OR', 'OR', '220')).toBe('OR (220)');
  });

  it('fehlender Titel → Abkürzung als Notbehelf (keine leere Bezeichnung)', () => {
    expect(erlassBezeichnung('', 'XYZ', '999.9')).toBe('XYZ (999.9)');
  });
});

// ─── T3/S4 — Tarif-Tabellen aus enumeration_tabular sauber rendern ──────────
describe('T3 — label-lose Tarif-Tabellen positionsbasiert (StG §50/§131)', () => {
  it('§50: 3-spaltige Tabelle, Caption als EIGENER Block, leere Mittelzelle erhalten', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_640100_S50_XHTML);
    const b = artikel['50'].bloecke;
    // Block 0: Caption-Absatz (eigener Block, KEINE Tabelle) — kein Phantom-Gluing.
    expect(b[0].absatz).toBe('1');
    expect(b[0].text).toContain('nach folgendem Tarif (Tarif A) berechnet:');
    expect(b[0].mehrspaltig).toBeUndefined();
    // Block 1: reine positions-basierte Tabelle (kein kopf, label-los).
    expect(b[1].mehrspaltig).toBeDefined();
    expect(b[1].mehrspaltig!.kopf).toEqual([]); // label-los: keine Kopfzeile
    expect(b[1].mehrspaltig!.zeilen[0]).toEqual([
      'Von Fr. 0', "bis Fr. 250'000:", "Fr. 4.50 je Fr. 1'000",
    ]);
    // «Über …»-Zeile: leere Mittelzelle bleibt positionsgetreu erhalten (Spalte 1 = '').
    expect(b[1].mehrspaltig!.zeilen[2]).toEqual([
      "Über Fr. 750'000:", '', "Fr. 7.90 je Fr. 1'000",
    ]);
  });

  it('§131: 4-spaltige Zuschlags-Tabelle, alle Zeilen positionsgetreu', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_640100_S131_XHTML);
    const b = artikel['131'].bloecke;
    const tab = b.find((x) => x.mehrspaltig)!;
    expect(tab.mehrspaltig!.kopf).toEqual([]); // label-los: keine Kopfzeile
    expect(tab.mehrspaltig!.zeilen[0]).toEqual([
      '25%', 'bei einem Empfange', 'bis zu', "CHF 100'000",
    ]);
    // Jede Zeile hat exakt 4 Spalten (STABIL) — sonst wäre der Block §1-konservativ
    // Fliesstext geblieben.
    expect(tab.mehrspaltig!.zeilen.every((z) => z.length === 4)).toBe(true);
  });
});

describe('S4 — IWB §3: Tarif-Nr. in Spalte 0, keine Phantom-Spalte', () => {
  it('Caption getrennt, Tarif-Nr. in Spalte 0, Schwellen-Entities aufgelöst', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_772430_S3_XHTML);
    const b = artikel['3'].bloecke;
    // Caption als eigener Block (nicht in die Tabelle gemischt).
    expect(b[0].text).toContain('unterscheidet zwischen folgenden Kundensegmenten');
    expect(b[0].mehrspaltig).toBeUndefined();
    const tab = b.find((x) => x.mehrspaltig)!;
    // Kopf: leere erste <th> → «Tarif-Nr.» in Spalte 0; Caption ist KEINE Spalte.
    expect(tab.mehrspaltig!.kopf).toEqual(['Tarif-Nr.', 'Segment', 'Zuordnungskriterium']);
    expect(tab.mehrspaltig!.zeilen[0][0]).toBe('1'); // Tarif-Nr. korrekt in Spalte 0
    expect(tab.mehrspaltig!.zeilen[1][0]).toBe('2'); // KEIN Versatz mehr
    // T1: &ge;/&lt; sind inhaltliche Schwellen — müssen aufgelöst sein.
    expect(tab.mehrspaltig!.zeilen[1][2]).toContain('≥13 MWh');
    expect(tab.mehrspaltig!.zeilen[1][2]).toContain('<50 MWh');
    expect(tab.mehrspaltig!.zeilen[1][2]).not.toContain('&ge;');
  });
});

describe('T3 — buchstaben-suffigierte Positions-Nr. «4.a)» (GerGebV §29)', () => {
  it('«4.a)» wird als Tarif-Nr. in Spalte 0 erkannt (nicht als Wert verworfen)', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_154810_S29_XHTML);
    const tab = artikel['29'].bloecke.find((x) => x.mehrspaltig)!;
    expect(tab.mehrspaltig!.kopf).toEqual(['Tarif-Nr.', 'Gegenstand', 'Gebühren']);
    const spalte0 = tab.mehrspaltig!.zeilen.map((z) => z[0]);
    expect(spalte0).toContain('4.a)');
    // Reihenfolge der Positions-Nrn. bleibt erhalten.
    expect(spalte0.slice(0, 4)).toEqual(['1.', '2.', '3.', '4.a)']);
  });
});
