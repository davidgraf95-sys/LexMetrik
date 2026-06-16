/**
 * Tests für die reinen Vollständigkeits-Logikfunktionen.
 * Alle Tests: synthetische Fälle ohne FS/Netz — §2-konform.
 */

import { describe, it, expect } from 'vitest';
import {
  fehlendeBundArtikel,
  unerwarteteKantonLuecken,
  pruefeInhaltsSanity,
  pruefeManifestKonsistenz,
} from '../../scripts/normtext/vollstaendigkeit-logik.ts';
import type {
  BekannteLuecke,
  SnapshotEintrag,
} from '../../scripts/normtext/vollstaendigkeit-logik.ts';

// ─── fehlendeBundArtikel ──────────────────────────────────────────────────────

describe('fehlendeBundArtikel', () => {
  it('liefert leere Liste wenn alle HTML-Tokens im Snapshot sind', () => {
    const snapshotIds = new Set(['bund/OR/art_1', 'bund/OR/art_2', 'bund/OR/art_335_c']);
    const htmlTokens = ['1', '2', '335_c'];
    const result = fehlendeBundArtikel('OR', htmlTokens, snapshotIds, new Set());
    expect(result).toHaveLength(0);
  });

  it('meldet fehlenden Token als Lücke', () => {
    const snapshotIds = new Set(['bund/OR/art_1']);
    const htmlTokens = ['1', '2']; // art_2 fehlt im Snapshot
    const result = fehlendeBundArtikel('OR', htmlTokens, snapshotIds, new Set());
    expect(result).toHaveLength(1);
    expect(result[0].snapshotId).toBe('bund/OR/art_2');
    expect(result[0].token).toBe('2');
    expect(result[0].gesetz).toBe('OR');
    expect(result[0].warLeererArtikel).toBe(false);
  });

  it('markiert leere Artikel korrekt (warLeererArtikel = true)', () => {
    const snapshotIds = new Set<string>(); // leer
    const htmlTokens = ['1'];
    const leereArtikel = new Set(['1']); // art_1 ist dokumentierter Skip
    const result = fehlendeBundArtikel('ZGB', htmlTokens, snapshotIds, leereArtikel);
    expect(result).toHaveLength(1);
    expect(result[0].warLeererArtikel).toBe(true);
    expect(result[0].snapshotId).toBe('bund/ZGB/art_1');
  });

  it('ist case-insensitiv beim Gesetz-Namen (lowercase → uppercase ID)', () => {
    const snapshotIds = new Set(['bund/OR/art_1']);
    const htmlTokens = ['1', '999'];
    // Gesetz 'or' (lowercase) → ID muss 'bund/OR/art_...' sein
    const result = fehlendeBundArtikel('or', htmlTokens, snapshotIds, new Set());
    expect(result).toHaveLength(1);
    expect(result[0].gesetz).toBe('OR');
    expect(result[0].snapshotId).toBe('bund/OR/art_999');
  });

  it('meldet mehrere fehlende Tokens', () => {
    const snapshotIds = new Set(['bund/ZPO/art_4']);
    const htmlTokens = ['4', '6', '68', '145'];
    const result = fehlendeBundArtikel('ZPO', htmlTokens, snapshotIds, new Set());
    expect(result).toHaveLength(3);
    const ids = result.map((r) => r.snapshotId);
    expect(ids).toContain('bund/ZPO/art_6');
    expect(ids).toContain('bund/ZPO/art_68');
    expect(ids).toContain('bund/ZPO/art_145');
  });

  it('liefert leere Liste bei leerem HTML-Token-Array', () => {
    const snapshotIds = new Set(['bund/OR/art_1']);
    const result = fehlendeBundArtikel('OR', [], snapshotIds, new Set());
    expect(result).toHaveLength(0);
  });
});

// ─── unerwarteteKantonLuecken ──────────────────────────────────────────────────

describe('unerwarteteKantonLuecken', () => {
  const bekannteLuecken: BekannteLuecke[] = [
    {
      snapshotId: 'kanton/BE/169.81/art_1_a',
      grund: 'token-nicht-im-Erlass',
      notiz: 'LexWork liefert art_1_a nicht.',
    },
  ];

  it('liefert leere Liste wenn alle Zitate im Snapshot sind', () => {
    const zitierte = [{ kanton: 'BE', lawId: '161.12', artikelToken: '36' }];
    const snapshotIds = new Set(['kanton/BE/161.12/art_36']);
    const result = unerwarteteKantonLuecken(zitierte, snapshotIds, []);
    expect(result).toHaveLength(0);
  });

  it('bekannte Lücke wird NICHT als Fehler gemeldet', () => {
    const zitierte = [{ kanton: 'BE', lawId: '169.81', artikelToken: '1_a' }];
    const snapshotIds = new Set<string>(); // nicht im Snapshot
    const result = unerwarteteKantonLuecken(zitierte, snapshotIds, bekannteLuecken);
    expect(result).toHaveLength(0);
  });

  it('unerwartete Lücke (nicht in bekannteLuecken) → wird gemeldet', () => {
    const zitierte = [
      { kanton: 'AG', lawId: '291.150', artikelToken: '99' }, // fehlt + unbekannt
    ];
    const snapshotIds = new Set<string>(); // leer
    const result = unerwarteteKantonLuecken(zitierte, snapshotIds, bekannteLuecken);
    expect(result).toHaveLength(1);
    expect(result[0].snapshotId).toBe('kanton/AG/291.150/art_99');
    expect(result[0].kanton).toBe('AG');
    expect(result[0].lawId).toBe('291.150');
    expect(result[0].artikelToken).toBe('99');
  });

  it('meldet mehrere unerwartete Lücken', () => {
    const zitierte = [
      { kanton: 'X', lawId: '1.1', artikelToken: 'a' },
      { kanton: 'Y', lawId: '2.2', artikelToken: 'b' },
    ];
    const snapshotIds = new Set<string>();
    const result = unerwarteteKantonLuecken(zitierte, snapshotIds, []);
    expect(result).toHaveLength(2);
  });

  it('Zitat vorhanden im Snapshot → kein Fehler, auch wenn in bekannteLuecken', () => {
    // Wenn ein Token im Snapshot vorhanden ist, ist es kein Problem —
    // auch wenn es in der bekannteLuecken-Liste stünde.
    const zitierte = [{ kanton: 'BE', lawId: '169.81', artikelToken: '1_a' }];
    const snapshotIds = new Set(['kanton/BE/169.81/art_1_a']); // jetzt vorhanden
    const result = unerwarteteKantonLuecken(zitierte, snapshotIds, bekannteLuecken);
    expect(result).toHaveLength(0);
  });

  it('leere Zitate-Liste → keine Lücken', () => {
    const result = unerwarteteKantonLuecken([], new Set(), []);
    expect(result).toHaveLength(0);
  });
});

// ─── pruefeInhaltsSanity ──────────────────────────────────────────────────────

describe('pruefeInhaltsSanity', () => {
  const guterEintrag: SnapshotEintrag = {
    id: 'bund/OR/art_1',
    bloecke: [{ absatz: '1', text: 'Zum Abschlusse eines Vertrages …' }],
  };

  const eintragMitItems: SnapshotEintrag = {
    id: 'bund/OR/art_77',
    bloecke: [
      { absatz: '1', text: 'Die Vertragsschließenden sind:' },
      {
        absatz: null,
        text: '',
        items: [
          { marke: 'a', text: 'der Arbeitgeber' },
          { marke: 'b', text: 'der Arbeitnehmer' },
        ],
      },
    ],
  };

  it('akzeptiert gültigen Eintrag mit text', () => {
    const result = pruefeInhaltsSanity([guterEintrag]);
    expect(result).toHaveLength(0);
  });

  it('akzeptiert Eintrag mit items (kein text)', () => {
    const eintragNurItems: SnapshotEintrag = {
      id: 'kanton/BE/161.12/art_36',
      bloecke: [
        {
          absatz: null,
          text: '',
          items: [{ marke: 'a', text: 'Honorar' }],
        },
      ],
    };
    const result = pruefeInhaltsSanity([eintragNurItems]);
    expect(result).toHaveLength(0);
  });

  it('akzeptiert Eintrag mit text und items', () => {
    const result = pruefeInhaltsSanity([eintragMitItems]);
    expect(result).toHaveLength(0);
  });

  it('meldet Fehler bei leeren bloecke[]', () => {
    const fehlerEintrag: SnapshotEintrag = {
      id: 'bund/ZGB/art_999',
      bloecke: [],
    };
    const result = pruefeInhaltsSanity([fehlerEintrag]);
    expect(result).toHaveLength(1);
    expect(result[0].snapshotId).toBe('bund/ZGB/art_999');
    expect(result[0].problem).toBe('leere-bloecke');
  });

  it('meldet Fehler bei Block ohne text und ohne items', () => {
    const fehlerEintrag: SnapshotEintrag = {
      id: 'bund/OR/art_42',
      bloecke: [{ absatz: '1', text: '' }], // kein text, kein items
    };
    const result = pruefeInhaltsSanity([fehlerEintrag]);
    expect(result).toHaveLength(1);
    expect(result[0].problem).toBe('leerer-block');
    expect(result[0].blockIndex).toBe(0);
  });

  it('meldet nur den leeren Block, nicht den guten', () => {
    const gemischterEintrag: SnapshotEintrag = {
      id: 'bund/OR/art_55',
      bloecke: [
        { absatz: '1', text: 'Guter Text' },
        { absatz: '2', text: '' }, // leer!
      ],
    };
    const result = pruefeInhaltsSanity([gemischterEintrag]);
    expect(result).toHaveLength(1);
    expect(result[0].blockIndex).toBe(1);
  });

  it('akzeptiert mehrere gültige Einträge', () => {
    const result = pruefeInhaltsSanity([guterEintrag, eintragMitItems]);
    expect(result).toHaveLength(0);
  });

  it('meldet Fehler aus mehreren Einträgen', () => {
    const e1: SnapshotEintrag = { id: 'bund/A/art_1', bloecke: [] };
    const e2: SnapshotEintrag = { id: 'bund/B/art_2', bloecke: [{ absatz: null, text: '' }] };
    const result = pruefeInhaltsSanity([e1, e2]);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.snapshotId)).toContain('bund/A/art_1');
    expect(result.map((r) => r.snapshotId)).toContain('bund/B/art_2');
  });

  it('Block mit nur Whitespace-text gilt als leer', () => {
    const e: SnapshotEintrag = {
      id: 'bund/X/art_1',
      bloecke: [{ absatz: null, text: '   ' }],
    };
    const result = pruefeInhaltsSanity([e]);
    expect(result).toHaveLength(1);
    expect(result[0].problem).toBe('leerer-block');
  });
});

// ─── pruefeManifestKonsistenz ──────────────────────────────────────────────────

describe('pruefeManifestKonsistenz', () => {
  it('akzeptiert konsistentes Manifest', () => {
    const manifestMap = new Map([
      ['https://gesetzessammlungen.ag.ch/app/de/texts_of_law/291.150', 'AG-291.150.json'],
      ['https://www.belex.sites.be.ch/app/de/texts_of_law/161.12', 'BE-161.12.json'],
    ]);
    const vorhandeneD = new Set(['AG-291.150.json', 'BE-161.12.json']);
    const result = pruefeManifestKonsistenz(manifestMap, vorhandeneD);
    expect(result).toHaveLength(0);
  });

  it('meldet Datei, die im Manifest steht aber nicht existiert', () => {
    const manifestMap = new Map([
      ['https://example.ch/app/de/texts_of_law/1.1', 'XX-1.1.json'],
    ]);
    const vorhandeneD = new Set<string>(); // Datei fehlt
    const result = pruefeManifestKonsistenz(manifestMap, vorhandeneD);
    expect(result).toHaveLength(1);
    expect(result[0].problem).toBe('datei-fehlt-fuer-manifest-eintrag');
    expect(result[0].datei).toBe('XX-1.1.json');
    expect(result[0].quelleUrl).toBe('https://example.ch/app/de/texts_of_law/1.1');
  });

  it('meldet Datei, die existiert aber nicht im Manifest steht', () => {
    const manifestMap = new Map<string, string>(); // leer
    const vorhandeneD = new Set(['AG-291.150.json']);
    const result = pruefeManifestKonsistenz(manifestMap, vorhandeneD);
    expect(result).toHaveLength(1);
    expect(result[0].problem).toBe('datei-nicht-im-manifest');
    expect(result[0].datei).toBe('AG-291.150.json');
  });

  it('meldet beide Richtungen gleichzeitig', () => {
    const manifestMap = new Map([
      ['https://example.ch/app/de/texts_of_law/A', 'A.json'], // Datei fehlt
    ]);
    const vorhandeneD = new Set(['B.json']); // nicht im Manifest
    const result = pruefeManifestKonsistenz(manifestMap, vorhandeneD);
    expect(result).toHaveLength(2);
    const problems = result.map((r) => r.problem);
    expect(problems).toContain('datei-fehlt-fuer-manifest-eintrag');
    expect(problems).toContain('datei-nicht-im-manifest');
  });

  it('leeres Manifest und keine Dateien → ok', () => {
    const result = pruefeManifestKonsistenz(new Map(), new Set());
    expect(result).toHaveLength(0);
  });

  it('eine Datei kann von mehreren quelleUrls referenziert werden', () => {
    // Wenn zwei URLs auf dieselbe Datei zeigen, ist die Datei referenziert.
    const manifestMap = new Map([
      ['https://host.ch/app/de/texts_of_law/X', 'X.json'],
      ['https://host.ch/app/fr/texts_of_law/X', 'X.json'],
    ]);
    const vorhandeneD = new Set(['X.json']);
    const result = pruefeManifestKonsistenz(manifestMap, vorhandeneD);
    expect(result).toHaveLength(0);
  });
});
