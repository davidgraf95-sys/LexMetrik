import { describe, it, expect } from 'vitest';
import {
  gruppiereNachGebiet, gruppiereNachKanton, filtern, baueBaender, bandFuerToken,
} from '../lib/normtext/browse';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import type { NormSnapshot } from '../lib/normtext/typen';

function be(p: Partial<BrowseErlass>): BrowseErlass {
  return {
    key: 'X', ebene: 'bund', kanton: null, kuerzel: 'X', titel: 'Titel', sr: null,
    rechtsgebiet: 'privat', sprache: 'de', rang: 0, status: 'snapshot',
    datei: 'bund/X.json', artikelAnzahl: 1, stand: '2026-01-01', quelleUrl: 'u', fassungsToken: 't',
    ...p,
  };
}

describe('gruppiereNachGebiet', () => {
  it('gruppiert nach Rechtsgebiet, leere Gruppen weg, GEBIETE-Reihenfolge', () => {
    const g = gruppiereNachGebiet([
      be({ key: 'OR', rechtsgebiet: 'privat' }),
      be({ key: 'StGB', rechtsgebiet: 'straf' }),
      be({ key: 'ZGB', rechtsgebiet: 'privat' }),
    ]);
    expect(g.map((x) => x.gebiet)).toEqual(['privat', 'straf']);
    expect(g[0].erlasse.map((e) => e.key)).toEqual(['OR', 'ZGB']);
  });
});

describe('gruppiereNachKanton', () => {
  it('gruppiert alphabetisch nach Kanton', () => {
    const g = gruppiereNachKanton([
      be({ key: 'ZH-1', ebene: 'kanton', kanton: 'ZH' }),
      be({ key: 'BE-1', ebene: 'kanton', kanton: 'BE' }),
    ]);
    expect(g.map((x) => x.kanton)).toEqual(['BE', 'ZH']);
  });
});

describe('filtern', () => {
  const liste = [
    be({ key: 'OR', kuerzel: 'OR', titel: 'Obligationenrecht', sr: '220' }),
    be({ key: 'StGB', kuerzel: 'StGB', titel: 'Strafgesetzbuch', sr: '311.0' }),
  ];
  it('leerer Term → alles', () => { expect(filtern(liste, '  ')).toHaveLength(2); });
  it('matcht Kürzel/Titel/SR (case-insensitiv)', () => {
    expect(filtern(liste, 'oblig').map((e) => e.key)).toEqual(['OR']);
    expect(filtern(liste, '311').map((e) => e.key)).toEqual(['StGB']);
    expect(filtern(liste, 'STGB').map((e) => e.key)).toEqual(['StGB']);
  });
});

const snap = (artikel: string, label: string): NormSnapshot => ({
  id: `bund/X/art_${artikel}`, ebene: 'bund', quelle: 'X', erlass: 'X',
  artikel, artikelLabel: label, bloecke: [{ absatz: null, text: 't' }],
  stand: '2026-01-01', quelleUrl: 'u', abgerufen: '2026-01-01', fassungsToken: 't', sha: 's',
});

describe('baueBaender / bandFuerToken', () => {
  const eintraege = Array.from({ length: 95 }, (_, i) => snap(String(i + 1), `Art. ${i + 1}`));
  it('chunked in Bänder fixer Grösse mit Spannen-Label', () => {
    const b = baueBaender(eintraege, 40);
    expect(b).toHaveLength(3);
    expect(b[0].label).toBe('Art. 1 – Art. 40');
    expect(b[2].eintraege).toHaveLength(15);
  });
  it('leere Liste → keine Bänder', () => { expect(baueBaender([])).toEqual([]); });
  it('bandFuerToken findet das richtige Band', () => {
    const b = baueBaender(eintraege, 40);
    expect(bandFuerToken(b, '45')).toBe(1);
    expect(bandFuerToken(b, '999')).toBe(-1);
  });
});
