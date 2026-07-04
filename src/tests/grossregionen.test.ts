/**
 * Gesetzes-UX G5 · §4.3.2 — BFS-Grossregionen als Sortier-/Gruppier-Achse der
 * Kantons-Übersicht. Reine Anzeige-Ordnung (§3): geprüft wird Vollständigkeit
 * und Determinismus (jeder der 26 Kantone genau einer Region), nicht Rechtslogik.
 */
import { describe, it, expect } from 'vitest';
import { GROSSREGIONEN, GROSSREGION_VON_KANTON } from '../data/grossregionen';
import { KANTONE } from '../data/tarif/typen';

describe('BFS-Grossregionen', () => {
  it('deckt genau die 26 Kantone ab, jeden genau einmal', () => {
    const alle = GROSSREGIONEN.flatMap((r) => r.kantone);
    expect(alle).toHaveLength(26);
    expect(new Set(alle).size).toBe(26);
    expect([...alle].sort()).toEqual([...KANTONE].sort());
  });

  it('genau sieben Regionen in BFS-Standardreihenfolge (West → Ost)', () => {
    expect(GROSSREGIONEN.map((r) => r.id)).toEqual([
      'genfersee', 'mittelland', 'nordwest', 'zuerich', 'ostschweiz', 'zentral', 'tessin',
    ]);
  });

  it('GROSSREGION_VON_KANTON ist konsistent zur Regionenliste (Rang = Position)', () => {
    GROSSREGIONEN.forEach((r, i) => {
      for (const k of r.kantone) {
        expect(GROSSREGION_VON_KANTON[k]).toEqual({ id: r.id, name: r.name, rang: i });
      }
    });
    // Stichproben (amtliche BFS-Zuordnung).
    expect(GROSSREGION_VON_KANTON.ZH.id).toBe('zuerich');
    expect(GROSSREGION_VON_KANTON.GE.id).toBe('genfersee');
    expect(GROSSREGION_VON_KANTON.TI.id).toBe('tessin');
    expect(GROSSREGION_VON_KANTON.BS.id).toBe('nordwest');
  });
});
