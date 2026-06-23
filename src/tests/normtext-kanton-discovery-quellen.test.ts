/**
 * Tests für die reine Discovery→Generator-Routing-Funktion (kein FS/Netz — §2).
 */

import { describe, it, expect } from 'vitest';
import { discoveryZuInventar } from '../../scripts/normtext/kanton-discovery-quellen.ts';
import { klassifiziereQuelle, type EntdeckterErlass } from '../../scripts/normtext/lexfind-discovery.ts';

function erlass(sn: string, url: string, titel = `Gesetz ${sn}`): EntdeckterErlass {
  return { systematischeNummer: sn, titel, inKraft: true, originalUrl: url, klassifikation: klassifiziereQuelle(url) };
}

describe('discoveryZuInventar', () => {
  it('wandelt Tier-A-Erlasse in Generator-Gruppen (host/lang/lawId aus der Quelle)', () => {
    const { gruppen } = discoveryZuInventar([erlass('146.1', 'https://ar.clex.ch/data/146.1/de', 'Datenschutzgesetz')], 'AR');
    expect(gruppen).toHaveLength(1);
    expect(gruppen[0]).toMatchObject({
      kanton: 'AR', host: 'ar.clex.ch', lang: 'de', lawId: '146.1',
      erlassName: 'Datenschutzgesetz', erlassNr: '146.1', artikel: [],
    });
    expect(gruppen[0].quelleUrl).toBe('https://ar.clex.ch/data/146.1/de');
  });

  it('überspringt Tier-B/C/unbekannt sichtbar (§8)', () => {
    const { gruppen, uebersprungen } = discoveryZuInventar([
      erlass('1', 'https://www.zh.ch/x/erlass-1.html'), // C
      erlass('2', 'https://example.com/y'), // unbekannt
    ], 'ZH');
    expect(gruppen).toHaveLength(0);
    expect(uebersprungen).toHaveLength(2);
    expect(uebersprungen[0].grund).toContain('tier=');
  });

  it('überspringt lang=it (holeLexWork kann nur de/fr) sichtbar', () => {
    const { gruppen, uebersprungen } = discoveryZuInventar(
      [erlass('7.1.1.1', 'https://www.lexfind.ch/data/7.1.1.1/it')], 'TI',
    );
    // lexfind.ch ist kein .ch-Kantonshost mit Struktur-API → unbekannt; aber falls
    // ein it-Strukturpfad auftaucht, wird er als lang=it übersprungen. Hier: tier-Skip.
    expect(gruppen).toHaveLength(0);
    expect(uebersprungen).toHaveLength(1);
  });

  it('dedupliziert gleiche (kanton, host, lang, lawId)', () => {
    const { gruppen } = discoveryZuInventar([
      erlass('146.1', 'https://ar.clex.ch/data/146.1/de'),
      erlass('146.1', 'https://ar.clex.ch/data/146.1/de'),
    ], 'AR');
    expect(gruppen).toHaveLength(1);
  });

  it('nimmt host-agnostisch auch /app/-Form (alle LexWork-Hosts)', () => {
    const { gruppen } = discoveryZuInventar([
      erlass('614.11', 'https://bgs.so.ch/app/de/texts_of_law/614.11'),
      erlass('161.12', 'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12'),
    ], 'SO');
    expect(gruppen).toHaveLength(2);
    expect(gruppen.map((g) => g.host)).toEqual(['bgs.so.ch', 'www.belex.sites.be.ch']);
  });
});
