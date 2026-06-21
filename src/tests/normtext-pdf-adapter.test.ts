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
  istAnhangZifferLinks,
  leseSzStand,
  leseTiStand,
  leseVdStand,
  leseJuStand,
  PDF_PROFILE,
} from '../../scripts/normtext/adapter-pdf.ts';
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
