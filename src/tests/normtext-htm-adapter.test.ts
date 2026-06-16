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
} from '../../scripts/normtext/adapter-htm.ts';
import { GE_RTFMC_HTM } from './fixtures/htm-ge-rtfmc.ts';
import { NE_LTFRAIS_HTM } from './fixtures/htm-ne-ltfrais.ts';

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

  it('extrahiert Art. 11 (sup 1, 1bis, 2; Tabelle an Absatz 1 gehängt)', () => {
    const a = extrahiereHtmArtikel(NE_LTFRAIS_HTM, '11', 'ne');
    expect(a).not.toBeNull();
    expect(a!.bloecke.map((b) => b.absatz)).toEqual(['1', '1bis', '2']);
    // Gebührenstaffel-Tabelle ist an den Einleitungsabsatz gehängt.
    expect(a!.bloecke[0].text).toContain("L'émolument forfaitaire de conciliation");
    expect(a!.bloecke[0].text).toContain("jusqu'à 2'000.-");
    expect(a!.bloecke[0].text).toContain('300.-');
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
