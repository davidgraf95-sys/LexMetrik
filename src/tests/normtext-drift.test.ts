/**
 * Tests für die Offline-Prüf-Logik aus check-drift.ts.
 * TDD: reine Funktionen (pruefeBundFassung, pruefeBundVollstaendigkeit) ohne Netz/FS.
 * §2: kein Date.now/Math.random.
 */

import { describe, it, expect } from 'vitest';
import { pruefeBundFassung, pruefeBundVollstaendigkeit } from '../../scripts/normtext/drift-logik.ts';
import type { NormSnapshot } from '../../scripts/normtext/drift-logik.ts';

// ─── pruefeBundFassung ────────────────────────────────────────────────────────

describe('pruefeBundFassung', () => {
  const cacheMap = new Map<string, string>([
    ['or', '20260101'],
    ['zgb', '20260101'],
    ['schkg', '20260101'],
  ]);

  it('liefert leere Liste wenn alle Tokens übereinstimmen', () => {
    const snapshots: NormSnapshot[] = [
      { id: 'bund/OR/art_11', quelle: 'OR', fassungsToken: '20260101' },
      { id: 'bund/ZGB/art_360', quelle: 'ZGB', fassungsToken: '20260101' },
      { id: 'bund/SCHKG/art_17', quelle: 'SCHKG', fassungsToken: '20260101' },
    ];
    const mismatches = pruefeBundFassung(snapshots, cacheMap);
    expect(mismatches).toHaveLength(0);
  });

  it('erkennt einen Mismatch', () => {
    const snapshots: NormSnapshot[] = [
      { id: 'bund/OR/art_11', quelle: 'OR', fassungsToken: '20250101' }, // veraltet!
      { id: 'bund/ZGB/art_360', quelle: 'ZGB', fassungsToken: '20260101' },
    ];
    const mismatches = pruefeBundFassung(snapshots, cacheMap);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0].id).toBe('bund/OR/art_11');
    expect(mismatches[0].snapshotToken).toBe('20250101');
    expect(mismatches[0].cacheToken).toBe('20260101');
  });

  it('erkennt mehrere Mismatches', () => {
    const snapshots: NormSnapshot[] = [
      { id: 'bund/OR/art_11', quelle: 'OR', fassungsToken: '20240101' },
      { id: 'bund/ZGB/art_360', quelle: 'ZGB', fassungsToken: '20240101' },
      { id: 'bund/SCHKG/art_17', quelle: 'SCHKG', fassungsToken: '20260101' },
    ];
    const mismatches = pruefeBundFassung(snapshots, cacheMap);
    expect(mismatches).toHaveLength(2);
    const ids = mismatches.map((m) => m.id);
    expect(ids).toContain('bund/OR/art_11');
    expect(ids).toContain('bund/ZGB/art_360');
  });

  it('ignoriert Einträge ohne passenden Cache-Eintrag', () => {
    const snapshots: NormSnapshot[] = [
      { id: 'bund/UNBEKANNT/art_1', quelle: 'UNBEKANNT', fassungsToken: 'irgendwas' },
    ];
    const mismatches = pruefeBundFassung(snapshots, cacheMap);
    expect(mismatches).toHaveLength(0);
  });

  it('ignoriert Nicht-Bund-Einträge', () => {
    const snapshots: NormSnapshot[] = [
      { id: 'kanton/ZG/161.7/art_11', quelle: 'ZG', fassungsToken: 'abc123' },
    ];
    const mismatches = pruefeBundFassung(snapshots, cacheMap);
    expect(mismatches).toHaveLength(0);
  });

  it('ist case-insensitiv beim Gesetz-Namen (OR vs or)', () => {
    // cacheMap hat Schlüssel lowercase; id hat uppercase
    const snapshots: NormSnapshot[] = [
      { id: 'bund/OR/art_11', quelle: 'OR', fassungsToken: '20260101' },
    ];
    const map = new Map([['or', '20260101']]);
    const mismatches = pruefeBundFassung(snapshots, map);
    expect(mismatches).toHaveLength(0);
  });
});

// ─── pruefeBundVollstaendigkeit ───────────────────────────────────────────────

describe('pruefeBundVollstaendigkeit', () => {
  it('liefert leere Liste wenn alle Anker vorhanden', () => {
    const snapshotIds = new Set([
      'bund/OR/art_11',
      'bund/OR/art_32',
      'bund/ZGB/art_360',
    ]);
    const ankerMap = new Map([
      ['or', ['art_11', 'art_32']],
      ['zgb', ['art_360']],
    ]);
    const fehlend = pruefeBundVollstaendigkeit(snapshotIds, ankerMap);
    expect(fehlend).toHaveLength(0);
  });

  it('meldet fehlenden Pflicht-Anker', () => {
    const snapshotIds = new Set([
      'bund/OR/art_11',
      // art_32 fehlt!
    ]);
    const ankerMap = new Map([['or', ['art_11', 'art_32']]]);
    const fehlend = pruefeBundVollstaendigkeit(snapshotIds, ankerMap);
    expect(fehlend).toHaveLength(1);
    expect(fehlend[0]).toBe('bund/OR/art_32');
  });

  it('meldet mehrere fehlende Anker aus verschiedenen Gesetzen', () => {
    const snapshotIds = new Set<string>(); // leer
    const ankerMap = new Map([
      ['or', ['art_11']],
      ['zgb', ['art_360']],
    ]);
    const fehlend = pruefeBundVollstaendigkeit(snapshotIds, ankerMap);
    expect(fehlend).toHaveLength(2);
    expect(fehlend).toContain('bund/OR/art_11');
    expect(fehlend).toContain('bund/ZGB/art_360');
  });

  it('liefert leere Liste bei leerer ankerMap', () => {
    const snapshotIds = new Set(['bund/OR/art_11']);
    const ankerMap = new Map<string, string[]>();
    const fehlend = pruefeBundVollstaendigkeit(snapshotIds, ankerMap);
    expect(fehlend).toHaveLength(0);
  });
});
