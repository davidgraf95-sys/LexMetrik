import { describe, it, expect } from 'vitest';
import { FEDLEX, fedlexUrl, fedlexLinkFuerArtikel } from '../lib/fedlex';

describe('fedlexUrl', () => {
  it('Zahl-Artikel', () => {
    expect(fedlexUrl('OR', '104')).toBe(`${FEDLEX.OR}#art_104`);
    expect(fedlexUrl('ZPO', 142)).toBe(`${FEDLEX.ZPO}#art_142`);
  });

  it('Buchstaben-Artikel im Fedlex-Unterstrich-Format', () => {
    expect(fedlexUrl('OR', '335c')).toBe(`${FEDLEX.OR}#art_335_c`);
    expect(fedlexUrl('OR', '266a')).toBe(`${FEDLEX.OR}#art_266_a`);
  });
});

describe('fedlexLinkFuerArtikel', () => {
  it('einfacher Verweis', () => {
    expect(fedlexLinkFuerArtikel('Art. 104 OR')).toBe(`${FEDLEX.OR}#art_104`);
    expect(fedlexLinkFuerArtikel('Art. 63 SchKG')).toBe(`${FEDLEX.SchKG}#art_63`);
  });

  it('Absatz/Ziffer ändern den Anker nicht', () => {
    expect(fedlexLinkFuerArtikel('Art. 335c Abs. 1 OR')).toBe(`${FEDLEX.OR}#art_335_c`);
    expect(fedlexLinkFuerArtikel('Art. 108 Ziff. 1 OR')).toBe(`${FEDLEX.OR}#art_108`);
    expect(fedlexLinkFuerArtikel('Art. 142 Abs. 1bis ZPO')).toBe(`${FEDLEX.ZPO}#art_142`);
  });

  it('Spannen und Folgeverweise → führender Artikel', () => {
    expect(fedlexLinkFuerArtikel('Art. 142–147 ZPO')).toBe(`${FEDLEX.ZPO}#art_142`);
    expect(fedlexLinkFuerArtikel('Art. 457 ff. ZGB')).toBe(`${FEDLEX.ZGB}#art_457`);
    expect(fedlexLinkFuerArtikel('Art. 266a–o OR')).toBe(`${FEDLEX.OR}#art_266_a`);
  });

  it('Schlusstitel: Gesetzes-Seite ohne Anker (nie geratene Anker)', () => {
    expect(fedlexLinkFuerArtikel('Art. 15 SchlT ZGB')).toBe(FEDLEX.ZGB);
  });

  it('unbekanntes Gesetz → kein Link', () => {
    expect(fedlexLinkFuerArtikel('Art. 8 ATSG')).toBeNull();
    expect(fedlexLinkFuerArtikel('§ 12 GebV')).toBeNull();
  });
});
