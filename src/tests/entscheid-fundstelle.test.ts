import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ersteFundstelle, fundstellenFuerNormen, gruppiereErwaegungen, ankerFuer } from '../lib/rechtsprechung/abschnitte';
import type { EntscheidSnapshot } from '../lib/rechtsprechung/typen';

// ─── Verweis-Präzision Teil 2: Norm-Chip → Fundstelle (Referenz BGE 151 III 377) ──
//
// Beweist deterministisch, dass der «Art. 679 ZGB»-Chip zur Immissions-Passage
// springt: die erste Erwägung, deren Text den Artikel zitiert (inkl. der per
// «i.V.m.»-Kette propagierten Glieder), ist E. 2.3.1 → Anker «e-2-3-1».

function ladeSnapshot(key: string): EntscheidSnapshot {
  const roh = readFileSync(join('public/rechtsprechung', `${key}.json`), 'utf8');
  return JSON.parse(roh).eintraege[0] as EntscheidSnapshot;
}

describe('ersteFundstelle — Referenz BGE 151 III 377', () => {
  const snap = ladeSnapshot('bund/bge/151_III_377');

  it('«Art. 679 ZGB» springt zur Immissions-Passage E. 2.3.1 (via «Art. 684 i.V.m. Art. 679 ZGB»)', () => {
    // E. 2.3.1 nennt «Art. 684 i.V.m. Art. 679 ZGB» — 679 ist dort nur als
    // propagiertes Ketten-Glied verlinkt; die Fundstellen-Suche findet es trotzdem.
    expect(ersteFundstelle(snap.abschnitte, 'Art. 679 ZGB')).toBe('e-2-3-1');
    expect(ankerFuer('E. 2.3.1')).toBe('e-2-3-1'); // Anker-Schema-Sonde
  });

  it('«Art. 684 ZGB» springt ebenfalls zur ersten Nennung E. 2.3.1', () => {
    expect(ersteFundstelle(snap.abschnitte, 'Art. 684 ZGB')).toBe('e-2-3-1');
  });

  it('auch die Auszug-Fassung trägt die Fundstelle (E. 2.3.1)', () => {
    expect(ersteFundstelle(snap.auszugAbschnitte ?? [], 'Art. 679 ZGB')).toBe('e-2-3-1');
  });

  it('nicht im Erwägungstext genannte / nicht auflösbare Norm → null (Reader fällt auf Regeste)', () => {
    expect(ersteFundstelle(snap.abschnitte, 'Art. 99 XYZ')).toBeNull();
  });

  it('fundstellenFuerNormen liefert für alle zitierteNormen einen Eintrag', () => {
    const m = fundstellenFuerNormen(snap.abschnitte, snap.zitierteNormen);
    expect(m.get('Art. 679 ZGB')).toBe('e-2-3-1');
    // jede genannte Norm ist ein Schlüssel (Anker oder null).
    for (const n of snap.zitierteNormen) expect(m.has(n)).toBe(true);
  });

  it('gruppiereErwaegungen: Anker sind eindeutig und dokument-geordnet', () => {
    const erw = snap.abschnitte.find((a) => a.typ === 'erwaegung')!;
    const anker = gruppiereErwaegungen(erw.bloecke)
      .flatMap((g) => [g.kopfAnker, ...g.subs.map((s) => s.anker)])
      .filter(Boolean);
    expect(anker).toContain('e-2-3-1');
    expect(anker).toContain('e-2-4');
    expect(new Set(anker).size).toBe(anker.length); // keine Kollisionen
  });
});
