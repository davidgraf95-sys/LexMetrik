import { describe, it, expect } from 'vitest';
import { reiterKategorie, herkunftVon, artikelLabelVonPfad, kantonVonPfad } from '../lib/tabGruppen';
import type { VerlaufManifeste } from '../lib/verlaufLabel';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

// Reiter-Gruppierung (Auftrag David 26.6.2026, P3) — reine Funktionen (§2/§3).

const erlass = (p: Partial<BrowseErlass>): BrowseErlass => ({
  key: 'x', ebene: 'bund', kanton: null, kuerzel: 'X', titel: 'X', sr: null,
  rechtsgebiet: 'privat', sprache: 'de', rang: 0, status: 'snapshot',
  datei: null, artikelAnzahl: 0, stand: '2026-01-01', quelleUrl: '', fassungsToken: '', pdfPfad: null,
  ...p,
} as BrowseErlass);

const manifeste: VerlaufManifeste = {
  gesetze: {
    erzeugt: '2026-01-01',
    erlasse: [
      erlass({ key: 'or', ebene: 'bund', kuerzel: 'OR' }),
      erlass({ key: 'stg-zh', ebene: 'kanton', kanton: 'ZH', kuerzel: 'StG-ZH' }),
      erlass({ key: 'emrk', ebene: 'bund', kuerzel: 'EMRK', rechtsgebiet: 'international' }),
    ],
  },
  entscheide: null,
};

describe('reiterKategorie', () => {
  it('leitet die Kategorie aus dem Pfad-Präfix ab', () => {
    expect(reiterKategorie('/gesetze/bund/or')).toBe('gesetze');
    expect(reiterKategorie('/rechtsprechung/bge-123')).toBe('rechtsprechung');
    expect(reiterKategorie('/vorlagen/arbeitsvertrag')).toBe('vorlagen');
    expect(reiterKategorie('/rechner/tagerechner')).toBe('rechner');
    expect(reiterKategorie('/ueber-uns')).toBe('sonstiges');
  });
  it('ignoriert ?search und #hash', () => {
    expect(reiterKategorie('/gesetze/bund/or?r=2#art-41')).toBe('gesetze');
  });
});

describe('herkunftVon', () => {
  it('Bund / Kanton / International korrekt aus dem aufgelösten Erlass', () => {
    expect(herkunftVon('/gesetze/bund/or', manifeste)).toBe('bund');
    expect(herkunftVon('/gesetze/kanton/stg-zh', manifeste)).toBe('kanton');
    expect(herkunftVon('/gesetze/bund/emrk', manifeste)).toBe('international'); // rechtsgebiet schlägt Ebene
  });
  it('null ohne Manifest / Nicht-Gesetz-Pfad', () => {
    expect(herkunftVon('/gesetze/bund/or')).toBeNull();
    expect(herkunftVon('/rechner/tagerechner', manifeste)).toBeNull();
  });
});

describe('kantonVonPfad', () => {
  it('liefert den Kanton nur für kantonale Gesetze', () => {
    expect(kantonVonPfad('/gesetze/kanton/stg-zh', manifeste)).toBe('ZH');
    expect(kantonVonPfad('/gesetze/bund/or', manifeste)).toBeNull();
  });
});

describe('artikelLabelVonPfad', () => {
  it('extrahiert «Art. N» aus dem #art-Anker (Unterstrich→Suffix)', () => {
    expect(artikelLabelVonPfad('/gesetze/bund/or#art-41')).toBe('Art. 41');
    expect(artikelLabelVonPfad('/gesetze/bund/zgb?r=2#art-335_c')).toBe('Art. 335c');
  });
  it('null ohne Anker', () => {
    expect(artikelLabelVonPfad('/gesetze/bund/or')).toBeNull();
  });
});
