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

  it('unbekanntes Gesetz → null', () => {
    expect(bundSnapshotRef('Art. 8 ATSG')).toBeNull();
  });

  it('kein Artikel im Text → null', () => {
    expect(bundSnapshotRef('siehe oben OR')).toBeNull();
  });
});
