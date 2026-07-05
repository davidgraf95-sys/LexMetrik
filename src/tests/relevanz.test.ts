import { describe, it, expect } from 'vitest';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import {
  vergleicheRelevanz, nachRelevanz, kantonKernRang, nachKantonRelevanz,
  intlSachziffer, KANTON_KERN_KATEGORIEN,
} from '../lib/normtext/relevanz';

// Minimaler BrowseErlass-Fabrikant (reine Anzeige-Sortierung, §3).
function e(p: Partial<BrowseErlass> & Pick<BrowseErlass, 'key'>): BrowseErlass {
  return {
    ebene: 'bund', kanton: null, kuerzel: p.key, titel: p.key, sr: null,
    rechtsgebiet: 'privat', sprache: 'de', rang: 0, status: 'snapshot',
    datei: null, artikelAnzahl: 0, stand: '2026-01-01', quelleUrl: '',
    fassungsToken: '', pdfPfad: null, ...p,
  };
}

describe('relevanz — Bund/International (kuratierter Leitgesetz-Rang)', () => {
  it('sortiert nach rang (Leitgesetze zuerst), dann Volltext, dann Kürzel', () => {
    const bv = e({ key: 'BV', rechtsgebiet: 'oeffentlich', rang: 0 });
    const zgb = e({ key: 'ZGB', rang: 1 });
    const stub = e({ key: 'XYZ', rang: 50, status: 'nur-live-link' });
    const sortiert = nachRelevanz([stub, zgb, bv]).map((x) => x.key);
    expect(sortiert).toEqual(['BV', 'ZGB', 'XYZ']);
  });

  it('bei gleichem rang: in-App lesbar vor reinem Live-Link', () => {
    const a = e({ key: 'A', rang: 5, status: 'nur-live-link' });
    const b = e({ key: 'B', rang: 5, status: 'snapshot' });
    expect(vergleicheRelevanz(a, b)).toBeGreaterThan(0); // B (lesbar) vor A
  });

  it('mutiert die Eingabe nicht', () => {
    const eingabe = [e({ key: 'B', rang: 2 }), e({ key: 'A', rang: 1 })];
    const kopie = [...eingabe];
    nachRelevanz(eingabe);
    expect(eingabe.map((x) => x.key)).toEqual(kopie.map((x) => x.key));
  });
});

describe('relevanz — Kanton Kern-Kategorien (A14, dokumentiert-deterministisch)', () => {
  it('erkennt Davids Kern-Erlasse in der genannten Reihenfolge', () => {
    expect(kantonKernRang({ titel: 'Verfassung des Kantons Zürich', kuerzel: 'KV' })).toBe(0);
    expect(kantonKernRang({ titel: 'Kantonsverfassung', kuerzel: 'x' })).toBe(0);
    expect(kantonKernRang({ titel: 'Einführungsgesetz zum ZGB', kuerzel: 'EG ZGB' })).toBe(1);
    expect(kantonKernRang({ titel: 'Gesetz über die Gerichtsorganisation', kuerzel: 'GOG' })).toBe(2);
    expect(kantonKernRang({ titel: 'Steuergesetz', kuerzel: 'StG' })).toBe(3);
    expect(kantonKernRang({ titel: 'Verordnung über die Gebührenverordnung', kuerzel: 'x' })).toBe(3);
  });

  it('vergibt keinen Kern-Rang an gewöhnliche Erlasse (keine geratene Wichtigkeit)', () => {
    const keiner = KANTON_KERN_KATEGORIEN.length;
    expect(kantonKernRang({ titel: 'Gesetz über den Wald', kuerzel: 'WaldG' })).toBe(keiner);
    // Anker-fest: «Verordnung über das Verfassungsgericht» ist KEINE Verfassung.
    expect(kantonKernRang({ titel: 'Verordnung über das Verfassungsgericht', kuerzel: 'x' })).toBe(keiner);
  });

  it('zieht die Kern-Erlasse eines Kantons zuerst, dann den Rest', () => {
    const wald = e({ key: 'ZH-921', ebene: 'kanton', titel: 'Waldgesetz', sr: '921' });
    const kv = e({ key: 'ZH-101', ebene: 'kanton', titel: 'Verfassung des Kantons Zürich', kuerzel: 'KV', sr: '101' });
    const stg = e({ key: 'ZH-631', ebene: 'kanton', titel: 'Steuergesetz', sr: '631' });
    const sortiert = nachKantonRelevanz([wald, stg, kv], undefined).map((x) => x.key);
    expect(sortiert[0]).toBe('ZH-101'); // Verfassung zuerst
    expect(sortiert[1]).toBe('ZH-631'); // Steuergesetz vor Waldgesetz
    expect(sortiert[2]).toBe('ZH-921');
  });
});

describe('relevanz — International SR-0.*-Sachziffer (A15 Rechtsgebiet)', () => {
  it('liest die erste SR-0.*-Ziffer, EU-Recht (ohne SR) → null', () => {
    expect(intlSachziffer('0.101')).toBe('1');       // EMRK
    expect(intlSachziffer('0.275.12')).toBe('2');    // LugÜ
    expect(intlSachziffer('0.748.0')).toBe('7');     // ICAO
    expect(intlSachziffer(null)).toBeNull();         // EU-Verordnung
    expect(intlSachziffer('220')).toBeNull();        // kein Völkerrecht
  });
});
