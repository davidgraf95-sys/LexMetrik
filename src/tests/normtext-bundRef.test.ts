import { describe, it, expect } from 'vitest';
import { bundSnapshotRef } from '../lib/normtext/bundRef';

// Resolver Zitat → Bund-Snapshot-Quelle. Kombiniert die EINE Gesetz-Erkennung
// (erkenneFedlexGesetz) + die FEDLEX-Key→Snapshot-quelle-Mapping-Tabelle +
// parsePassus. Unbekanntes/ungemapptes Gesetz oder fehlender Artikel → null.

describe('bundSnapshotRef', () => {
  it('OR-Zitat mit Buchstaben-Artikel und Absatz', () => {
    expect(bundSnapshotRef('Art. 335c Abs. 1 OR')).toEqual({ quelle: 'OR', token: '335_c', absatz: '1' });
  });

  it('Mehrwort-Gesetz GebV SchKG → quelle GEBV_SCHKG (nicht SCHKG)', () => {
    expect(bundSnapshotRef('Art. 16 GebV SchKG')).toEqual({ quelle: 'GEBV_SCHKG', token: '16', absatz: null });
  });

  it('Erkennung-Key, der von der Snapshot-quelle abweicht (SchKG → SCHKG)', () => {
    expect(bundSnapshotRef('Art. 63 SchKG')).toEqual({ quelle: 'SCHKG', token: '63', absatz: null });
  });

  it('Gesetz ohne Snapshot-Mapping (ArG ist gemappt, hier ZGB) → quelle vorhanden', () => {
    expect(bundSnapshotRef('Art. 96 ZPO')).toEqual({ quelle: 'ZPO', token: '96', absatz: null });
  });

  it('lit. aus dem Zitat wird mitgeliefert (für präzise Item-Markierung)', () => {
    expect(bundSnapshotRef('Art. 336 Abs. 1 lit. a OR')).toEqual({
      quelle: 'OR', token: '336', absatz: '1', lit: 'a',
    });
  });

  it('Ziff. aus dem Zitat wird mitgeliefert', () => {
    expect(bundSnapshotRef('Art. 337 Ziff. 2 OR')).toEqual({
      quelle: 'OR', token: '337', absatz: null, ziff: '2',
    });
  });

  it('ohne lit/ziff bleiben die Felder weg (Bestandszitate unverändert)', () => {
    const r = bundSnapshotRef('Art. 335c Abs. 1 OR');
    expect('lit' in r!).toBe(false);
    expect('ziff' in r!).toBe(false);
  });

  it('Gesetz ohne FEDLEX-Eintrag (echt unbekannt) → null', () => {
    // 'ZZG' o.ä. existiert nicht in FEDLEX → erkenneFedlexGesetz liefert null.
    expect(bundSnapshotRef('Art. 8 ZZG')).toBeNull();
  });

  it('kein Artikel im Text → null', () => {
    expect(bundSnapshotRef('siehe oben OR')).toBeNull();
  });

  // ── SNAPSHOT_QUELLE wird seit 25.6.2026 aus dem ERLASS_REGISTER abgeleitet
  //    (SSoT §5). Damit sind ALLE Bund-Volltext-Snapshots im Inline-Popover
  //    erreichbar — vorher fehlten 34 in der Handtabelle (u.a. ATSG/BV/DBG/KG),
  //    deren Popover stumm auf den Live-Link zurückfiel (Ultracode-Review).
  //    Deklarierte fachliche Änderung (§6.3): diese Erlasse lösen jetzt auf. ──
  it('ATSG (vormals ungemappt) löst jetzt auf', () => {
    expect(bundSnapshotRef('Art. 8 ATSG')).toEqual({ quelle: 'ATSG', token: '8', absatz: null });
  });

  it('BV (vormals ungemappt) löst jetzt auf', () => {
    expect(bundSnapshotRef('Art. 8 BV')).toEqual({ quelle: 'BV', token: '8', absatz: null });
  });

  it('nur-live-link-Stub bleibt null (kein FEDLEX-Eintrag → kein Popover)', () => {
    // Stubs (BUND_STUBS, z.B. PrHG) stehen NICHT in FEDLEX → erkenneFedlexGesetz
    // liefert null → bundSnapshotRef null. Nur Volltext-Erlasse (FEDLEX + Snapshot
    // im Register) sind im abgeleiteten Map → Live-Link bleibt für Stubs.
    // (MStG war hier Beispiel-Stub bis Punkt 12 Batch 3, jetzt Volltext.)
    expect(bundSnapshotRef('Art. 1 PrHG')).toBeNull();
  });

  // StGB/StG erschlossen (16.6.2026): FEDLEX-Key → Snapshot-quelle gemappt.
  it('Art. 97 StGB → quelle STGB (nicht STG)', () => {
    expect(bundSnapshotRef('Art. 97 StGB')).toEqual({ quelle: 'STGB', token: '97', absatz: null });
  });

  it('Art. 8 StG → quelle STG (Stempelabgaben, nicht STGB)', () => {
    expect(bundSnapshotRef('Art. 8 StG')).toEqual({ quelle: 'STG', token: '8', absatz: null });
  });

  it('Art. 8 GebVHReg → quelle GEBV_HREG', () => {
    expect(bundSnapshotRef('Art. 8 GebVHReg')).toEqual({ quelle: 'GEBV_HREG', token: '8', absatz: null });
  });
});
