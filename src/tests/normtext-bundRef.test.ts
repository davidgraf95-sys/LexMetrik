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

  it('unbekanntes Gesetz → null', () => {
    expect(bundSnapshotRef('Art. 8 ATSG')).toBeNull();
  });

  it('kein Artikel im Text → null', () => {
    expect(bundSnapshotRef('siehe oben OR')).toBeNull();
  });
});
