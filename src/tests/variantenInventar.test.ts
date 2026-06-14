import { describe, it, expect } from 'vitest';
import {
  VERTRAGS_INVENTAR, dokumenteJeKarte, dokumenteGesamt, fortschrittProzent, ZIEL_DOKUMENTE,
} from '../lib/vorlagen/variantenInventar';

// Fixiert den ehrlichen Fortschritt Richtung 1000 (FAHRPLAN-VERTRAGS-VARIANTEN
// P1f). Bricht bei stillem Schwund/Aufblähung – jede Änderung ist deklariert
// nachzuführen (§8).

describe('Varianten-Inventar', () => {
  it('VI-1 Arbeitsvertrag-Karte: 5 Untertypen, 78 erzeugbare Dokumente', () => {
    const av = VERTRAGS_INVENTAR.find((k) => k.karte === 'arbeitsvertrag')!;
    expect(av.untertypen.map((u) => u.id)).toEqual([
      'einzel', 'kader', 'lehrvertrag', 'handelsreisendenvertrag', 'heimarbeitsvertrag',
    ]);
    // 3×6 + 3×6 + 3×4 + 3×6 + 3×4 = 18+18+12+18+12
    expect(dokumenteJeKarte(av)).toBe(78);
  });

  it('VI-2 jede Karte trägt drei Detailgrade', () => {
    for (const k of VERTRAGS_INVENTAR) {
      for (const u of k.untertypen) expect(u.detailgrade, `${k.karte}/${u.id}`).toBe(3);
    }
  });

  it('VI-3 Gesamtzahl fixiert (kein stiller Schwund/Aufblähung)', () => {
    // AV 78 + Auftrag 12 + Werkvertrag 12 + NDA 9 + Konkubinat 9
    expect(dokumenteGesamt()).toBe(120);
  });

  it('VI-4 Fortschritt ehrlich gegen das 1000-Ziel', () => {
    expect(ZIEL_DOKUMENTE).toBe(1000);
    expect(fortschrittProzent()).toBe(12);
  });
});
