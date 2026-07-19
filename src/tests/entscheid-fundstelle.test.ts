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

// ─── Nummerierungs-Restarts mehrteiliger Urteile (R7-Fix 19.7.2026) ──────────
// BS-Korpus: 31 Entscheide starten die amtliche Erwägungs-Nummerierung mehrfach
// neu (SB.2018.46: tops 1,2,4,5,1,2,3,1,…). Anker/Keys müssen eindeutig bleiben:
// erster Lauf unverändert (Permalink-Stabilität), Wiederholungs-Läufe mit -wN.
describe('gruppiereErwaegungen — Restart-Ketten eindeutig verankert', () => {
  const b = (marke: string | null, text = 'Text'): { marke: string | null; text: string } => ({ marke, text });

  it('erster Lauf behält e-N; Wiederholungs-Läufe erhalten -wN (Kopf UND Subs)', () => {
    const gruppen = gruppiereErwaegungen([
      b('E. 1'), b('E. 2'), b('E. 2.1'),
      b('E. 1'), b('E. 1.1'), b('E. 2'),
      b('E. 1'),
    ] as never);
    const kopfAnker = gruppen.map((g) => g.kopfAnker);
    expect(kopfAnker).toEqual(['e-1', 'e-2', 'e-1-w2', 'e-2-w2', 'e-1-w3']);
    const subAnker = gruppen.flatMap((g) => g.subs.map((s) => s.anker));
    expect(subAnker).toContain('e-2-1');       // erster Lauf unverändert
    expect(subAnker).toContain('e-1-1-w2');    // Wiederholungs-Lauf disambiguiert
    // Alle vergebenen Anker global eindeutig (Pin-Cite/R7):
    const alle = [...kopfAnker, ...subAnker].filter(Boolean);
    expect(new Set(alle).size).toBe(alle.length);
  });

  it('ohne Restart bleibt alles byte-identisch zum bisherigen Schema', () => {
    const gruppen = gruppiereErwaegungen([b('E. 1'), b('E. 1.1'), b('E. 2')] as never);
    expect(gruppen.map((g) => g.kopfAnker)).toEqual(['e-1', 'e-2']);
    expect(gruppen[0].subs[0].anker).toBe('e-1-1');
  });
});
