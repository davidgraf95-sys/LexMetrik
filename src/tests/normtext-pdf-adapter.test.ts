/**
 * Tests für den generischen Einzelspalten-PDF-Adapter (SZ/TI/VD/JU) — reine
 * Parser- und Hilfsfunktionen gegen echte, gekürzte Quell-Ausschnitte (Fixtures
 * aus der realen pdfjs-Extraktion, abgerufen 16.6.2026).
 *
 * Prüft je Kanton: §/Art.-Grenzen, Absätze, lit.-items, Silbentrennung,
 * Sonderzeichen (it/fr), Stand-Erkennung; ferner die URL-Ableitung je Profil und
 * den quelleHash (deterministisch + inhaltssensitiv).
 */
import { describe, it, expect } from 'vitest';
import {
  extrahiereAllePdfArtikel,
  extrahierePdfArtikel,
  berechnePdfQuelleHash,
  bandSchwellen,
  baueZeile,
  istAnhangZifferLinks,
  istZifferKopfZeile,
  leseSzStand,
  leseTiStand,
  leseVdStand,
  leseJuStand,
  PDF_PROFILE,
} from '../../scripts/normtext/adapter-pdf.ts';
import { segmentiereAnhangZiffern } from '../../scripts/normtext/anhang-segmenter.ts';
import {
  SZ_GEBO_TEXT,
  SZ_GEBO_RANDTEXT,
  TI_LTG_TEXT,
  TI_LTG_PRAEAMBEL,
  VD_TFJC_TEXT,
  VD_TFJC_RANDTEXT,
  JU_DECRET_TEXT,
  JU_DECRET_PRAEAMBEL,
} from './fixtures/pdf-kantone.ts';

describe('istAnhangZifferLinks — Marginalien-Rettung für Anhang-Tarif-Ziffern (AR bGS 153.2)', () => {
  // Positiv: linksstehende hierarchische Ziffer knapp (≤45pt) links der Body-
  // Spalte wird gerettet (AR 8.1–8.4 fielen sonst durch den per-Seite-bodyMinX).
  it('rettet «8.1» knapp links der Body-Spalte (bodyMinX 66, x 44)', () => {
    expect(istAnhangZifferLinks(44, 66, '8.1')).toBe(true);
  });
  it('rettet die geklebte Form «8.1 Eigentum:»', () => {
    expect(istAnhangZifferLinks(44, 66, '8.1 Eigentum:')).toBe(true);
  });
  it('rettet «8.3» bei tiefem bodyMinX 105 (x 83.6, 21pt links)', () => {
    expect(istAnhangZifferLinks(83.6, 105, '8.3')).toBe(true);
  });

  // Negativ: echte Randnoten / Nicht-Ziffern bleiben verworfen.
  it('rettet KEINE Buchstaben-Randnote («Grundpfandrechte:»)', () => {
    expect(istAnhangZifferLinks(44, 66, 'Grundpfandrechte:')).toBe(false);
  });
  it('rettet NICHT, was weiter als 45pt links steht (JU-Marginalie)', () => {
    expect(istAnhangZifferLinks(20, 135, '8.1')).toBe(false);
  });
  it('rettet KEINE einstufige Ziffer «8» (Abschnitts-Überschrift / Absatz)', () => {
    expect(istAnhangZifferLinks(44, 66, '8')).toBe(false);
  });
  it('rettet KEINE SR-/Gesetzes-Nummer «173.8» oder «153.2» (erste Komponente > 99)', () => {
    expect(istAnhangZifferLinks(44, 66, '173.8')).toBe(false);
    expect(istAnhangZifferLinks(44, 66, '153.2')).toBe(false);
  });
  it('rettet KEINE Jahres-/Datumsform «2020.01.01»', () => {
    expect(istAnhangZifferLinks(44, 66, '2020.01.01')).toBe(false);
  });
  it('rettet NICHTS, was bereits in der Body-Spalte steht (x ≥ bodyMinX−5)', () => {
    expect(istAnhangZifferLinks(65, 66, '8.1')).toBe(false);
  });
});

describe('PDF-Adapter SZ (§-Profil, GebO SRSZ 173.111)', () => {
  it('erkennt § 1 und § 2 als getrennte Artikel', () => {
    const alle = extrahiereAllePdfArtikel(SZ_GEBO_TEXT, '§');
    expect(Object.keys(alle).sort()).toEqual(['1', '2']);
  });

  it('§ 1: Absätze 1/2, Silbentrennung «Be-\\nzirke» → «Bezirke»', () => {
    const a = extrahierePdfArtikel(SZ_GEBO_TEXT, '1', '§');
    expect(a).not.toBeNull();
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '2']);
    expect(a!.bloecke[0].text).toContain('der Bezirke und der Gemeinden');
    expect(a!.bloecke[0].text).not.toContain('Be-');
    expect(a!.bloecke[0].text).not.toContain('Bundes-recht');
    expect(a!.bloecke[0].text).toContain('Bundesrecht');
    expect(a!.bloecke[1].text).toBe('Der Regierungsrat erlässt einen Gebühren-Tarif.');
  });

  it('§ 2: Absatz 2 (Umlaut «Für», Bindestrich «Benützungs-»)', () => {
    const a = extrahierePdfArtikel(SZ_GEBO_TEXT, '2', '§')!;
    expect(a.bloecke[0].text.startsWith('Benützungs-, Verwaltungs-')).toBe(true);
    const abs2 = a.bloecke.find((b) => b.absatz === '2')!;
    expect(abs2.text).toContain('Für Amtshandlungen');
  });

  it('Stand aus dem SZ-Fussband «SRSZ 1.2.2026» → 2026-02-01', () => {
    expect(leseSzStand(SZ_GEBO_RANDTEXT)).toBe('2026-02-01');
    expect(leseSzStand('ohne Marker')).toBe('');
  });
});

describe('PDF-Adapter TI (Art.-Profil, LTG RL 178.200, it)', () => {
  it('erkennt Art. 1 und Art. 2', () => {
    const alle = extrahiereAllePdfArtikel(TI_LTG_TEXT, 'Art.');
    expect(Object.keys(alle).sort()).toEqual(['1', '2']);
  });

  it('Art. 1: Resttext im Kopf-Stück, ital. Sonderzeichen (’/è)', () => {
    const a = extrahierePdfArtikel(TI_LTG_TEXT, '1', 'Art.')!;
    expect(a.bloecke[0].text).toContain(
      'La presente legge stabilisce la tariffa delle spese processuali',
    );
    expect(a.bloecke[0].text).toContain('l’amministrazione');
  });

  it('Art. 2: «è»/«à» korrekt, Sachtitel «Tassa di giustizia» nicht als Artikel', () => {
    const a = extrahierePdfArtikel(TI_LTG_TEXT, '2', 'Art.')!;
    expect(a.bloecke[0].text).toContain(
      'La tassa di giustizia è fissata in considerazione del valore',
    );
    expect(a.bloecke.some((b) => b.text.includes('l’autorità competente'))).toBe(true);
  });

  it('Stand aus der TI-Präambel «(del 30 novembre 2010)» → 2010-11-30', () => {
    expect(leseTiStand(TI_LTG_PRAEAMBEL)).toBe('2010-11-30');
    expect(leseTiStand('senza data')).toBe('');
  });
});

describe('PDF-Adapter VD (Art.-Profil, TFJC BLV 270.11.5, fr)', () => {
  it('erkennt Art. 1 und Art. 2 (Sachtitel als erster Block)', () => {
    const alle = extrahiereAllePdfArtikel(VD_TFJC_TEXT, 'Art.');
    expect(Object.keys(alle).sort()).toEqual(['1', '2']);
  });

  it('Art. 1: Sachtitel «Objet», Absätze 1/2, frz. Apostroph', () => {
    const a = extrahierePdfArtikel(VD_TFJC_TEXT, '1', 'Art.')!;
    expect(a.bloecke[0].text).toBe('Objet');
    const abs1 = a.bloecke.find((b) => b.absatz === '1')!;
    expect(abs1.text).toContain(
      "Le présent tarif fixe les frais judiciaires dus pour l'administration",
    );
    const abs2 = a.bloecke.find((b) => b.absatz === '2')!;
    expect(abs2.text).toContain('Sont réservées les dispositions de droit fédéral');
  });

  it('Art. 2: Silbentrennung, frz. «é/à», Fussnoten-Verweis (art. 95 al. 2 CPC)', () => {
    const a = extrahierePdfArtikel(VD_TFJC_TEXT, '2', 'Art.')!;
    expect(a.bloecke[0].text).toBe('Définitions');
    const abs1 = a.bloecke.find((b) => b.absatz === '1')!;
    expect(abs1.text).toContain('les émoluments forfaitaires de conciliation et de décision');
    expect(abs1.text).toContain('art. 95 al. 2 CPC');
  });

  it('Stand aus der VD-Metazeile «Entrée en vigueur dès le 01.09.2019» → 2019-09-01', () => {
    expect(leseVdStand(VD_TFJC_RANDTEXT)).toBe('2019-09-01');
    expect(leseVdStand('sans date')).toBe('');
  });
});

describe('PDF-Adapter JU (Art.-Profil, Décret RSJU 176.511, fr fragmentiert)', () => {
  it('erkennt «Article premier» (Art. 1), Art. 2 und Art. 3', () => {
    const alle = extrahiereAllePdfArtikel(JU_DECRET_TEXT, 'Art.');
    expect(Object.keys(alle).sort()).toEqual(['1', '2', '3']);
  });

  it('Art. 1: «Article premier», Wort-Trennung über x-Lücken, «ci-après»/Anführung', () => {
    const a = extrahierePdfArtikel(JU_DECRET_TEXT, '1', 'Art.')!;
    expect(a.bloecke[0].text).toContain(
      'Le présent décret fixe les émoluments perçus et certaines indemnités',
    );
    // Wörter sauber getrennt (nicht «émolumentsperçus»).
    expect(a.bloecke[0].text).not.toContain('émolumentsperçus');
    expect(a.bloecke[0].text).toContain('ci-après');
    const abs2 = a.bloecke.find((b) => b.absatz === '2')!;
    expect(abs2.text).toContain('Les dispositions du droit fédéral et intercantonal');
  });

  it('Art. 3: Absätze 1/2 (mehrzeilig, fragmentiert zusammengefügt)', () => {
    const a = extrahierePdfArtikel(JU_DECRET_TEXT, '3', 'Art.')!;
    expect(a.bloecke[0].text).toBe(
      'Les autorités judiciaires perçoivent les émoluments fixés par le présent décret.',
    );
    const abs2 = a.bloecke.find((b) => b.absatz === '2')!;
    expect(abs2.text).toContain('Elles perçoivent, en plus, leurs débours');
  });

  it('Stand aus der JU-Präambel «du 24 mars 2010» → 2010-03-24', () => {
    expect(leseJuStand(JU_DECRET_PRAEAMBEL)).toBe('2010-03-24');
    expect(leseJuStand('sans date')).toBe('');
  });

  it('nicht vorhandener Artikel → null', () => {
    expect(extrahierePdfArtikel(JU_DECRET_TEXT, '999', 'Art.')).toBeNull();
  });
});

describe('PDF-Adapter — URL-Ableitung je Profil', () => {
  it('SZ/VD: quelleUrl identisch (PDF direkt)', () => {
    const sz = 'https://www.sz.ch/public/upload/assets/32452/173_111.pdf';
    expect(PDF_PROFILE.sz.pdfUrlAusQuelle(sz)).toBe(sz);
    const vd = 'https://www.lexfind.ch/tolv/105539/fr';
    expect(PDF_PROFILE.vd.pdfUrlAusQuelle(vd)).toBe(vd);
  });

  it('TI: HTML-Seite legge/num/N → pdfatto/atto/N; pdfatto bleibt unverändert', () => {
    expect(
      PDF_PROFILE.ti.pdfUrlAusQuelle(
        'https://m3.ti.ch/CAN/RLeggi/public/raccolta-leggi/legge/num/137',
      ),
    ).toBe('https://m3.ti.ch/CAN/RLeggi/public/raccolta-leggi/pdfatto/atto/137');
    const direkt =
      'https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/pdfatto/atto/137';
    expect(PDF_PROFILE.ti.pdfUrlAusQuelle(direkt)).toBe(direkt);
  });

  it('JU: Viewer-URL → +«&download=1»; bereits vorhanden bleibt unverändert', () => {
    expect(
      PDF_PROFILE.ju.pdfUrlAusQuelle(
        'https://rsju.jura.ch/fr/viewdocument.html?idn=20021&id=30030',
      ),
    ).toBe('https://rsju.jura.ch/fr/viewdocument.html?idn=20021&id=30030&download=1');
    const mit = 'https://rsju.jura.ch/fr/viewdocument.html?idn=20021&id=34172&download=1';
    expect(PDF_PROFILE.ju.pdfUrlAusQuelle(mit)).toBe(mit);
  });
});

describe('baueBloecke — Füllpunkt-Tarifzeilen werden zu tabelle angereichert', () => {
  it('baueBloecke: Füllpunkt-Block wird zu tabelle (Text=vortext, jetzt leer)', () => {
    const basis = [
      '§ 5',
      '¶1 Die Gebühren betragen: Vorladung . . . . . . . 6.— Mahnung . . . . . . . 10.— bis 50.—',
    ].join('\n');
    const art = extrahiereAllePdfArtikel(basis, '§');
    const block = art['5'].bloecke[0];
    expect(block.text).toBe('');  // vortext ist immer '' → Text leer bei voll tableisiertem Block
    expect(block.tabelle).toEqual([
      { beschreibung: 'Die Gebühren betragen: Vorladung', betrag: '6.—' },  // Intro bleibt in erster Beschreibung
      { beschreibung: 'Mahnung', betrag: '10.— bis 50.—' },
    ]);
  });

  it('Nicht-Tarif-Block bleibt unverändert (kein tabelle)', () => {
    const basis = [
      '§ 1',
      '¶1 Dieser Erlass regelt die Gebühren.',
    ].join('\n');
    const art = extrahiereAllePdfArtikel(basis, '§');
    const block = art['1'].bloecke[0];
    expect(block.text).toBe('Dieser Erlass regelt die Gebühren.');
    expect(block.tabelle).toBeUndefined();
  });
});

describe('PDF-Adapter — quelleHash (Drift-Token)', () => {
  it('ist deterministisch und 64-stellig hex', () => {
    const a = extrahiereAllePdfArtikel(VD_TFJC_TEXT, 'Art.');
    expect(berechnePdfQuelleHash(a)).toBe(berechnePdfQuelleHash(a));
    expect(berechnePdfQuelleHash(a)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('ändert sich, wenn sich der Volltext ändert', () => {
    const orig = berechnePdfQuelleHash(extrahiereAllePdfArtikel(VD_TFJC_TEXT, 'Art.'));
    const veraendert = berechnePdfQuelleHash({
      ...extrahiereAllePdfArtikel(VD_TFJC_TEXT, 'Art.'),
      '999': { bloecke: [{ absatz: null, text: 'Neu' }] },
    });
    expect(veraendert).not.toBe(orig);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SG-2935-Reparatur (5.7.2026) — MediaBox-Band + explizite Wort-Trenner
// ─────────────────────────────────────────────────────────────────────────────

describe('bandSchwellen — Kopf-/Fussband relativ zur MediaBox (SG-2935-Band-Bug)', () => {
  // origin-0-MediaBox: BYTE-IDENTISCH zur alten Formel (height*0.9 / height*0.07)
  // → kein Fremd-Drift für alle bisher korrekten PDFs (§6).
  it('origin-0-MediaBox reproduziert die alte Schwelle (0.9 / 0.07 der Höhe)', () => {
    const { kopf, fuss } = bandSchwellen(0, 595);
    expect(kopf).toBeCloseTo(595 * 0.9, 6);
    expect(fuss).toBeCloseTo(595 * 0.07, 6);
  });
  // Versetzte MediaBox (SG gesetzessammlung.sg.ch: y0≈123, y1≈719): die Schwelle
  // MUSS im rohen y-Raum liegen, sonst fällt der obere Body (y bis ~671) ins
  // Schein-Kopfband. kopf ≈ 719 − 59.5 ≈ 659 > 671? Nein: 671 liegt knapp unter
  // 659? Prüfen: die dropped Positionszeilen lagen bei y≥513; mit dem Fix ist
  // kopf ≈ 659 → nur die echte Kopfzeile (y≈671 «914.5») fällt ins Band.
  it('versetzte MediaBox verschiebt die Kopf-Schwelle in den echten Oberrand', () => {
    const { kopf, fuss } = bandSchwellen(123.307, 718.693);
    // Kopf-Schwelle deutlich über den alten 535 (sonst Body-Verlust am Seitenkopf).
    expect(kopf).toBeGreaterThan(650);
    expect(kopf).toBeCloseTo(718.693 - (718.693 - 123.307) * 0.1, 3);
    // Eine Tarif-Positionszeile bei y=632 liegt jetzt UNTER der Kopf-Schwelle
    // (wird also als Body behalten) — vorher (535) war sie darüber (verworfen).
    expect(632).toBeLessThan(kopf);
    // Fuss-Schwelle im echten Unterrand (≈ 123 + 41.7 ≈ 165), nicht bei 41.
    expect(fuss).toBeGreaterThan(150);
  });
});

describe('baueZeile — explizite Wort-Trenner-Fragmente (SG-2935-Verkleb-Bug)', () => {
  const S = (x: number, w: number, s: string, h = 9.5) => ({ x, y: 500, h, w, s });

  it('fügt an einem NULL-breiten Leerraum-Fragment genau ein Leerzeichen ein', () => {
    // Reale SG-2935-Geometrie (Ziff. 21.06): «Auswechslung»·« »·«der»·« »·«Forderung»
    // — die Trenner sind eigene, ~0-breite Fragmente. Ohne sie verklebt die
    // width-Heuristik (Lücke 0.9 pt < Schwelle) zu «Auswechslungder…».
    const r = baueZeile(
      [
        S(169, 54.5, 'Auswechslung'),
        S(223.3, 0.1, ' '),
        S(224.2, 12.5, 'der'),
        S(236.8, 0.1, ' '),
        S(237.7, 40.5, 'Forderung'),
      ],
      9.5,
      'Art.',
      169,
    );
    expect(r.text).toBe('Auswechslung der Forderung');
  });

  it('erfindet KEIN Leerzeichen zwischen dicht gesetzten Fragmenten OHNE Trenner', () => {
    // «Fr. 2»·«000» ohne Leerraum-Fragment, Lücke ~0.1 pt → bleibt geklebt
    // (§1: kein fabrizierter Tausender-Trenner; Trenner kommen NUR aus der Quelle).
    const r = baueZeile([S(200, 50, 'Fr. 2'), S(250.1, 14, '000')], 9.5, 'Art.', 200);
    expect(r.text).toBe('Fr. 2000');
  });

  it('behält die width-Heuristik: grosse x-Lücke OHNE Trenner-Fragment → Leerzeichen', () => {
    // Fragmentierte Quelle (JU): «Les»·«termes» mit grosser Lücke, kein Trenner-
    // Fragment → die x-Abstands-Heuristik setzt weiterhin ein Leerzeichen.
    const r = baueZeile([S(100, 18, 'Les'), S(130, 40, 'termes')], 9.5, 'Art.', 100);
    expect(r.text).toBe('Les termes');
  });

  it('führendes Leerraum-Fragment verschluckt die Absatz-Hochzahl NICHT', () => {
    // Seit die Trenner erhalten bleiben, kann Stück 0 ein Leerzeichen sein — die
    // Absatznummer ist das erste REALE Stück (sahReal statt k===0).
    const r = baueZeile(
      [S(118, 0.5, ' '), S(119, 4, '2', 5.7), S(126, 60, 'Der Absatztext')],
      9.5,
      'Art.',
      119,
    );
    expect(r.absatz).toBe('2');
    expect(r.text).toBe('Der Absatztext');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Gegenprüfungs-Befund D1–D3 (SG-2935, 5.7.2026) — umgebrochene Querverweis-
// Zeilen dürfen KEINE neue Anhang-Position öffnen (x-Geometrie-Orakel)
// ─────────────────────────────────────────────────────────────────────────────

describe('istZifferKopfZeile — Positions-Kopf nur in der Nr.-Spalte (reale SG-2935-Geometrie)', () => {
  it('echter Kopf: Ziffer-Fragment am linken Body-Rand (25.10 @ x=119, bodyMinX=119)', () => {
    expect(
      istZifferKopfZeile(
        [{ x: 119, s: '25.10' }, { x: 169, s: 'Anmerkung Verwaltungsbeschlüsse, Gerichts-' }],
        119,
      ),
    ).toBe(true);
  });
  it('Querverweis-Wrap: Ziffer im Beschreibungs-Fluss (25.10 @ x=211, bodyMinX=162) → KEIN Kopf', () => {
    expect(
      istZifferKopfZeile(
        [{ x: 211, s: '25.10 dieses Erlasses' }, { x: 292, s: '. . . . . . .' }, { x: 460, s: '50.–' }],
        162,
      ),
    ).toBe(false);
  });
  it('Querverweis-Wrap 20.02 (@ x=211, bodyMinX=162) → KEIN Kopf', () => {
    expect(
      istZifferKopfZeile([{ x: 211, s: '20.02 dieses Erlasses bei Änderung der Beteili-' }], 162),
    ).toBe(false);
  });
  it('führendes Leerraum-Fragment wird übersprungen (Kopf @ Rand bleibt Kopf)', () => {
    expect(
      istZifferKopfZeile(
        [{ x: 118, s: ' ' }, { x: 119, s: '21.03' }, { x: 169, s: 'Neuausfertigung' }],
        119,
      ),
    ).toBe(true);
  });
  it('gerettete Marginalien-Ziffer knapp links des Body-Rands (AR 8.1) zählt als Kopf', () => {
    expect(istZifferKopfZeile([{ x: 44, s: '8.1 Eigentum:' }, { x: 66, s: 'Text' }], 66)).toBe(true);
  });
  it('Nicht-Ziffer-Zeile ist nie Kopf', () => {
    expect(istZifferKopfZeile([{ x: 119, s: 'Anmerkung Reglement' }], 119)).toBe(false);
  });
});

describe('segmentiereAnhangZiffern mit Geometrie-Orakel — D1–D3-Regression', () => {
  // Reale SG-2935-Zeilenfolge (verdichtet): 24.02 mit umgebrochenem Querverweis
  // «… Nrn. 25.07 bis ⏎ 25.10 dieses Erlasses … 50.–», danach die ECHTE 25.10.
  // MIN_ZIFFERN=8 → 8 Füll-Positionen davor.
  const fuellung = ['1.01 A', '1.02 B', '1.03 C', '1.04 D', '1.05 E', '1.06 F', '1.07 G', '1.08 H'];
  const zeilen = [
    ...fuellung,
    '24.02 andere Anmerkungen oder Änderung einer',
    'Anmerkung, ausgenommen Nrn. 25.07 bis',
    '25.10 dieses Erlasses . . . 50.–',
    '25.10 Anmerkung Verwaltungsbeschlüsse, Gerichts-',
    'urteile und Verfügungen nach Art. 649a ZGB 100.–',
  ];
  const text = zeilen.join('\n');
  // Orakel: alle Zeilen sind Köpfe AUSSER der Wrap-Zeile (Index fuellung.length+2).
  const wrapIdx = fuellung.length + 2;
  const orakel = (i: number): boolean => i !== wrapIdx;

  it('D2/D3-Klasse: Wrap-Zeile fliesst als Fortsetzung — 24.02 behält Querverweis UND Betrag', () => {
    const erg = segmentiereAnhangZiffern(text, orakel);
    expect(erg['24.02'].bloecke[0].text).toBe(
      'andere Anmerkungen oder Änderung einer Anmerkung, ausgenommen Nrn. 25.07 bis 25.10 dieses Erlasses . . . 50.–',
    );
  });
  it('D1: die ECHTE 25.10 wird nicht von einem Phantom-Eintrag verdrängt (100.–, nicht 50.–)', () => {
    const erg = segmentiereAnhangZiffern(text, orakel);
    expect(erg['25.10'].bloecke[0].text).toBe(
      'Anmerkung Verwaltungsbeschlüsse, Gerichts- urteile und Verfügungen nach Art. 649a ZGB 100.–',
    );
  });
  it('OHNE Orakel (Alt-Verhalten dokumentiert): Wrap öffnet Phantom-25.10 und trunkiert 24.02', () => {
    const erg = segmentiereAnhangZiffern(text);
    expect(erg['24.02'].bloecke[0].text).toBe(
      'andere Anmerkungen oder Änderung einer Anmerkung, ausgenommen Nrn. 25.07 bis',
    );
    expect(erg['25.10'].bloecke[0].text).toBe('dieses Erlasses . . . 50.–');
  });
});
