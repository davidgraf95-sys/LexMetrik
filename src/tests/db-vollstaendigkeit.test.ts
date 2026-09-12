import { describe, it, expect } from 'vitest';
import { pruefeDbVollstaendigkeit, zaehleShardKanten } from '../../scripts/materialien/db-vollstaendigkeit';

// FAHRPLAN-OFFENE-BEFUNDE.md, PR #703-Nachzug: «check:materialien lokal 7 falsche
// Shard-Abweichungen» — reine Prüf-Logik aus check-materialien.ts extrahiert, damit sie
// hier ohne den ganzen vite-node-Lauf testbar ist (Muster: vernehmlassungen-tor.test.ts).

describe('pruefeDbVollstaendigkeit (Vollständigkeits-Marker gegen den Zustandsträger)', () => {
  it('meldet vollständig, wenn dokMeta jede gelistete id trägt', () => {
    const ergebnis = pruefeDbVollstaendigkeit(['A', 'B', 'C'], new Set(['A', 'B', 'C', 'D']));
    expect(ergebnis.vollstaendig).toBe(true);
    expect(ergebnis.fehlendeIds).toEqual([]);
  });

  it('meldet unvollständig, wenn eine lokale DB nur EINE gecrawlte Quelle trägt (Rot-Beweis §6.7)', () => {
    // Reproduziert den Befund: Zustandsträger listet vier Quellen (ESTV-MWST-…, SECO-…,
    // EDOEB-…, ESTV-KS-…), die lokale DB trägt nach einem Teil-Snapshot nur ESTV-MWST-*.
    const gelistet = ['ESTV-MWST-INFO-04', 'SECO-ARG-01', 'EDOEB-LEITFADEN-DSG', 'ESTV-KS-38'];
    const dokMetaIds = new Set(['ESTV-MWST-INFO-04']);
    const ergebnis = pruefeDbVollstaendigkeit(gelistet, dokMetaIds);
    expect(ergebnis.vollstaendig).toBe(false);
    expect(ergebnis.fehlendeIds).toEqual(['SECO-ARG-01', 'EDOEB-LEITFADEN-DSG', 'ESTV-KS-38']);
  });

  it('leerer Zustandsträger ist trivial vollständig (keine Verpflichtung ohne Bestand)', () => {
    expect(pruefeDbVollstaendigkeit([], new Set()).vollstaendig).toBe(true);
  });
});

describe('zaehleShardKanten (Tor-Zusammenfassung nie strukturell 0 bei realem Bestand)', () => {
  it('zählt die Kanten eines Shards unabhängig vom Downgrade-Status', () => {
    const kanten = [{ artikel: '5', stand: '2026-01-01' }, { artikel: '', stand: '2020-01-01' }, { artikel: '7', stand: '2026-01-01' }];
    const r = zaehleShardKanten(kanten, 'DSG', () => false);
    expect(r.kanten).toBe(3);
    expect(r.downgrades).toBe(0);
  });

  it('zählt nur artikelscharfe Kanten als Downgrade-Kandidat, nie erlass-scharfe (leerer Artikel)', () => {
    const kanten = [{ artikel: '', stand: '2020-01-01' }, { artikel: undefined, stand: '2020-01-01' }];
    const r = zaehleShardKanten(kanten, 'DSG', () => true /* würde jede artikelscharfe Kante als Downgrade zählen */);
    expect(r.kanten).toBe(2);
    expect(r.downgrades).toBe(0);
  });

  it('Rot-Beweis §6.7: eine manipulierte Kopie mit einer Downgrade-Verletzung zählt > 0', () => {
    const kanten = [{ artikel: '5', stand: '2020-01-01' }, { artikel: '9', stand: '2026-01-01' }];
    // braucheDowngradeFn simuliert REVISIONS_CUTOFF['DSG']: Stand < 2023-09-01 ⇒ Downgrade nötig.
    const braucheDowngrade = (_erlass: string, _artikel: string, stand: string): boolean => stand < '2023-09-01';
    const r = zaehleShardKanten(kanten, 'DSG', braucheDowngrade);
    expect(r.kanten).toBe(2);
    expect(r.downgrades).toBe(1);
  });

  it('leere/undefinierte Kantenliste zählt 0, nicht undefined', () => {
    expect(zaehleShardKanten(undefined, 'DSG', () => true)).toEqual({ kanten: 0, downgrades: 0 });
    expect(zaehleShardKanten([], 'DSG', () => true)).toEqual({ kanten: 0, downgrades: 0 });
  });
});
