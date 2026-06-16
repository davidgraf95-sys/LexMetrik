/**
 * Tests für den HTM-Adapter (NE/GE) — reine Parser-Funktion gegen echte,
 * gekürzte Quell-Ausschnitte. Prüft: Artikel/Absätze korrekt extrahiert,
 * frz. Sonderzeichen dekodiert, NE-lit.-items, GE-Sachtitel verworfen,
 * Stand-Erkennung, quelleHash stabil & inhaltssensitiv.
 */
import { describe, it, expect } from 'vitest';
import {
  extrahiereHtmArtikel,
  extrahiereAlleHtmArtikel,
  berechneQuelleHash,
  tiHtmlUrlAusQuelle,
  leseTiStand,
} from '../../scripts/normtext/adapter-htm.ts';
import { GE_RTFMC_HTM } from './fixtures/htm-ge-rtfmc.ts';
import { NE_LTFRAIS_HTM } from './fixtures/htm-ne-ltfrais.ts';
import { TI_LTG_HTML } from './fixtures/htm-ti-ltg.ts';

describe('HTM-Adapter — GE (silgeneve)', () => {
  it('extrahiert Art. 1 (ein Absatz, Sachtitel verworfen, é dekodiert)', () => {
    const a = extrahiereHtmArtikel(GE_RTFMC_HTM, '1', 'ge');
    expect(a).not.toBeNull();
    expect(a!.bloecke).toHaveLength(1);
    expect(a!.bloecke[0].absatz).toBeNull();
    // Sachtitel «Objet» darf NICHT im Volltext stehen.
    expect(a!.bloecke[0].text.startsWith('Le présent règlement fixe le tarif')).toBe(true);
    expect(a!.bloecke[0].text).toContain('dépens');
    expect(a!.bloecke[0].text).not.toContain('Objet');
  });

  it('extrahiert Art. 2 (mehrere Absätze mit sup-Nummern, Revisionsmarke (6) entfernt)', () => {
    const a = extrahiereHtmArtikel(GE_RTFMC_HTM, '2', 'ge');
    expect(a).not.toBeNull();
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '2', '4']);
    expect(a!.bloecke[0].text).toContain("La juridiction peut exiger");
    // Revisionsmarke «(6)» darf nicht im Text verbleiben.
    expect(a!.bloecke[0].text).not.toContain('(6)');
    expect(a!.bloecke[2].text).toContain('irrecevabilité');
  });

  it('liest Art. 3 trotz <sup>(6)</sup> direkt nach der Nummer', () => {
    const a = extrahiereHtmArtikel(GE_RTFMC_HTM, '3', 'ge');
    expect(a).not.toBeNull();
    expect(a!.bloecke[0].text).toContain('valeur litigieuse');
  });

  it('extrahiert Art. 17 (Tarif-Tabelle als gepaarte Band↔Wert-items, Zellen NICHT als Einzelblöcke)', () => {
    const a = extrahiereHtmArtikel(GE_RTFMC_HTM, '17', 'ge');
    expect(a).not.toBeNull();
    // Nur der Einleitungssatz bleibt als Block — die Tabellenzellen leaken NICHT
    // mehr als eigene absatz:null-Blöcke (Bug-Fix 16.6.2026).
    expect(a!.bloecke).toHaveLength(1);
    expect(a!.bloecke[0].text).toContain('fixé comme suit');
    const items = a!.bloecke[0].items ?? [];
    // 3 Bänder (Kopfzeile «Valeur litigieuse | Emolument» übersprungen).
    expect(items).toHaveLength(3);
    // Band ↔ Emolument gepaart; Revisionsmarke (1) entfernt.
    expect(items[0].marke).toContain("jusqu'à 10 000 fr.");
    expect(items[0].text).toBe('de 200 fr. à 2 000 fr.');
    expect(items[0].text).not.toContain('(1)');
    expect(items[1].marke).toContain('10 001 fr. à 30 000 fr.');
    expect(items[1].text).toBe('de 1 000 fr. à 3 000 fr.');
    expect(items[2].marke).toContain('dès 1 000 001 fr.');
    expect(items[2].text).toBe('de 100 000 fr. à 200 000 fr.');
  });

  it('Stand = jüngstes Tvigueur-Datum (01.07.2025)', () => {
    const { meta } = extrahiereAlleHtmArtikel(GE_RTFMC_HTM, 'ge');
    expect(meta.stand).toBe('2025-07-01');
    expect(meta.titel).toContain('Règlement fixant le tarif des frais');
  });

  it('nicht vorhandener Artikel → null', () => {
    expect(extrahiereHtmArtikel(GE_RTFMC_HTM, '999', 'ge')).toBeNull();
  });
});

describe('HTM-Adapter — NE (rsn)', () => {
  it('extrahiert Art. 1 («Article premier», Fussnote [9] entfernt, ç/é dekodiert)', () => {
    const a = extrahiereHtmArtikel(NE_LTFRAIS_HTM, '1', 'ne');
    expect(a).not.toBeNull();
    expect(a!.bloecke).toHaveLength(1);
    expect(a!.bloecke[0].text.startsWith('Les frais, les émoluments de chancellerie')).toBe(true);
    expect(a!.bloecke[0].text).toContain("d’action de droit administratif");
    // Fussnoten-Marke darf nicht verbleiben.
    expect(a!.bloecke[0].text).not.toContain('[9]');
  });

  it('extrahiert Art. 5 (Absätze 1–3 + lit. a)/b) als items)', () => {
    const a = extrahiereHtmArtikel(NE_LTFRAIS_HTM, '5', 'ne');
    expect(a).not.toBeNull();
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '2', '3']);
    const abs3 = a!.bloecke[2];
    expect(abs3.text).toContain('matière administrative');
    expect(abs3.items).toBeDefined();
    expect(abs3.items!.map((i) => i.marke)).toEqual(['a', 'b']);
    expect(abs3.items![0].text).toContain('Cour de droit public');
    expect(abs3.items![1].text).toContain("Conseil d'État");
  });

  it('extrahiert Art. 11 (sup 1, 1bis, 2; Gebührenstaffel als gepaarte Band↔Wert-items, rowspan)', () => {
    const a = extrahiereHtmArtikel(NE_LTFRAIS_HTM, '11', 'ne');
    expect(a).not.toBeNull();
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '1bis', '2']);
    // Einleitungstext bleibt Prosa.
    expect(a!.bloecke[0].text).toContain("L'émolument forfaitaire de conciliation");
    // Bug-Fix 16.6.2026: Tabelle wird NICHT mehr flach an den Text geklebt,
    // sondern als gepaarte items angehängt — jedes Band trägt SEINEN Wert.
    const items = a!.bloecke[0].items ?? [];
    expect(items).toHaveLength(3);
    // Band «jusqu'à 2'000» ↔ 300; NICHT alle Werte am ersten Band.
    expect(items[0].marke).toContain("jusqu’à 2'000.-");
    expect(items[0].text).toBe('300.-');
    expect(items[0].text).not.toContain('400'); // kein Werte-Klumpen
    // rowspan: zweites Band «2'001 à 5'000» ↔ 400 (2. Absatz der rowspan-Zelle).
    expect(items[1].marke).toContain("2'001.-");
    expect(items[1].marke).toContain("5'000.-");
    expect(items[1].text).toBe('400.-');
    // drittes Band «5'001 à 8'000» ↔ 500 (eigene Wertzelle).
    expect(items[2].marke).toContain("5'001.-");
    expect(items[2].marke).toContain("8'000.-");
    expect(items[2].text).toBe('500.-');
    // Werte stehen nicht (mehr) im Prosa-Text.
    expect(a!.bloecke[0].text).not.toContain("jusqu'à 2'000.-");
    expect(a!.bloecke[1].text).toContain('non patrimoniale');
  });

  it('Stand = État au 1er avril 2023', () => {
    const { meta } = extrahiereAlleHtmArtikel(NE_LTFRAIS_HTM, 'ne');
    expect(meta.stand).toBe('2023-04-01');
    expect(meta.titel).toContain('Loi fixant le tarif des frais');
  });
});

describe('HTM-Adapter — quelleHash (Drift-Token)', () => {
  it('ist deterministisch (gleiche Eingabe → gleicher Hash)', () => {
    const a = extrahiereAlleHtmArtikel(NE_LTFRAIS_HTM, 'ne');
    const b = extrahiereAlleHtmArtikel(NE_LTFRAIS_HTM, 'ne');
    expect(a.meta.quelleHash).toBe(b.meta.quelleHash);
    expect(a.meta.quelleHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('ändert sich, wenn sich der Volltext ändert', () => {
    const original = extrahiereAlleHtmArtikel(NE_LTFRAIS_HTM, 'ne').meta.quelleHash;
    const verändert = berechneQuelleHash({
      ...extrahiereAlleHtmArtikel(NE_LTFRAIS_HTM, 'ne').artikel,
      '999': { bloecke: [{ absatz: null, text: 'Neuer Artikel' }] },
    });
    expect(verändert).not.toBe(original);
  });
});

// ─── TI-Profil (m3.ti.ch, server-gerendertes HTML, italienisch) ──────────────
describe('HTM-Adapter — TI (m3.ti.ch)', () => {
  it('leitet die HTML-URL aus der pdfatto/atto-quelleUrl ab (legge/num)', () => {
    expect(
      tiHtmlUrlAusQuelle(
        'https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/pdfatto/atto/137',
      ),
    ).toBe(
      'https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/137',
    );
    // Wird die HTML-Seite bereits zitiert, bleibt sie unverändert.
    expect(
      tiHtmlUrlAusQuelle(
        'https://m3.ti.ch/CAN/RLeggi/public/raccolta-leggi/legge/num/148',
      ),
    ).toBe('https://m3.ti.ch/CAN/RLeggi/public/raccolta-leggi/legge/num/148');
  });

  it('liest den Stand aus «in vigore dal D.M.YYYY»', () => {
    expect(leseTiStand('Articolo modificato; in vigore dal 10.2.2015 - BU 2015, 38.')).toBe(
      '2015-02-10',
    );
    // it. Monatsname-Form «in vigore: 1° luglio 2015» (atto 148).
    expect(leseTiStand('in vigore: 1° luglio 2015 - BU 2015, 169.')).toBe('2015-07-01');
  });

  it('extrahiert Art. 1 (zerstückelter «Art.»·« »·«1»-Kopf, zwei Absätze, it. Akzente)', () => {
    const a = extrahiereHtmArtikel(TI_LTG_HTML, '1', 'ti');
    expect(a).not.toBeNull();
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '2']);
    // §7-Beleg: Art. 1 LTG — italienischer Originaltext sauber, Akzent «’».
    expect(a!.bloecke[0].text).toBe(
      'La presente legge stabilisce la tariffa delle spese processuali per l’amministrazione della giustizia civile e penale.',
    );
    expect(a!.bloecke[1].text).toBe('Sono riservate le leggi speciali.');
  });

  it('extrahiert Art. 9 und verwirft den Fussnoten-Verweis [3]', () => {
    const a = extrahiereHtmArtikel(TI_LTG_HTML, '9', 'ti');
    expect(a).not.toBeNull();
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '2']);
    expect(a!.bloecke[0].text).not.toContain('[3]');
    expect(a!.bloecke[0].text).toContain('procedura sommaria');
  });

  it('Sachtitel («Oggetto»/«Procedura …») erscheint NICHT als Normtext', () => {
    const alle = extrahiereAlleHtmArtikel(TI_LTG_HTML, 'ti');
    for (const art of Object.values(alle.artikel)) {
      for (const b of art.bloecke) {
        expect(b.text).not.toBe('Oggetto');
        expect(b.text).not.toBe('Procedura semplificata');
        expect(b.text).not.toBe('Procedura sommaria');
      }
    }
  });

  it('Label einheitlich «Art. N»; Stand aus «in vigore dal»', () => {
    const alle = extrahiereAlleHtmArtikel(TI_LTG_HTML, 'ti');
    expect(Object.keys(alle.artikel).sort()).toEqual(['1', '8', '9']);
    expect(alle.labels['1']).toBe('Art. 1');
    expect(alle.labels['8']).toBe('Art. 8');
    expect(alle.meta.stand).toBe('2015-02-10');
    expect(alle.meta.quelleHash).toMatch(/^[0-9a-f]{64}$/);
  });
});
