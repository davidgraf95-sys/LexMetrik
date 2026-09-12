import { describe, it, expect } from 'vitest';
import {
  pruefeDbVollstaendigkeit, pruefeKantenVollstaendigkeit, shardInhaltGleich, zaehleKanten,
} from '../../scripts/materialien/db-vollstaendigkeit';

// FAHRPLAN-OFFENE-BEFUNDE.md, PR #703-Nachzug: «check:materialien lokal 7 falsche
// Shard-Abweichungen» — reine Prüf-Logik aus check-materialien.ts extrahiert, damit sie
// hier ohne den ganzen vite-node-Lauf testbar ist (Muster: vernehmlassungen-tor.test.ts).
// Erweitert um die Gegenprüfungs-Auflagen A1/A2a/A2b/A3 (PR #815, 12.9.2026).

describe('pruefeDbVollstaendigkeit (Dimension 1: Dokument-Meta gegen den Zustandsträger)', () => {
  it('meldet vollständig, wenn dokMeta jede gelistete id trägt', () => {
    const ergebnis = pruefeDbVollstaendigkeit(['A', 'B', 'C'], new Set(['A', 'B', 'C', 'D']));
    expect(ergebnis.vollstaendig).toBe(true);
    expect(ergebnis.fehlendeIds).toEqual([]);
  });

  it('meldet unvollständig, wenn eine lokale DB nur EINE gecrawlte Quelle trägt (Rot-Beweis §6.7)', () => {
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

describe('pruefeKantenVollstaendigkeit (Dimension 2, A2a-Nachzug: Kanten gegen den committeten Bestand)', () => {
  it('meldet vollständig, wenn die DB-Kantenmenge jedes committete Kanten-Dokument trägt', () => {
    const ergebnis = pruefeKantenVollstaendigkeit(['DOK-A', 'DOK-B'], new Set(['DOK-A', 'DOK-B', 'DOK-C']));
    expect(ergebnis.vollstaendig).toBe(true);
  });

  it('Gegenprobe der Gegenprüfung: volle Dok-Meta (298/298), aber Kanten auf eine Quelle getrimmt', () => {
    // Dimension 1 (pruefeDbVollstaendigkeit) würde hier fälschlich "vollständig" melden, weil
    // seedSoftLawDb `soft_law` immer voll befüllt — Dimension 2 muss den Teilstand trotzdem
    // auffangen: die 7 committeten Dokumente ARG/ARGV1/BGOE/DBG/DSG/STG/VSTG haben Kanten im
    // Shard-Bestand, aber die (auf ESTV-MWST getrimmte) DB kennt nur ESTV-MWST-Dokumente.
    const committeteDokIds = ['ARG-DOK-1', 'ARGV1-DOK-1', 'BGOE-DOK-1', 'DBG-DOK-1', 'DSG-DOK-1', 'STG-DOK-1', 'VSTG-DOK-1', 'ESTV-MWST-INFO-04'];
    const dbKantenDokIds = new Set(['ESTV-MWST-INFO-04']);
    const ergebnis = pruefeKantenVollstaendigkeit(committeteDokIds, dbKantenDokIds);
    expect(ergebnis.vollstaendig).toBe(false);
    expect(ergebnis.fehlendeIds).toEqual(['ARG-DOK-1', 'ARGV1-DOK-1', 'BGOE-DOK-1', 'DBG-DOK-1', 'DSG-DOK-1', 'STG-DOK-1', 'VSTG-DOK-1']);
  });

  it('kein committetes Kanten-Dokument ⇒ trivial vollständig', () => {
    expect(pruefeKantenVollstaendigkeit([], new Set()).vollstaendig).toBe(true);
  });
});

describe('shardInhaltGleich (A1/A2b: Vergleich ohne den erzeugt-Stempel)', () => {
  it('ein reiner erzeugt-Stempel-Unterschied gilt als gleich (kein fachlicher Drift)', () => {
    const a = JSON.stringify({ erzeugt: '2026-09-12', erlass: 'ARG', kanten: [{ dok: 'X' }] });
    const b = JSON.stringify({ erzeugt: '2026-08-30', erlass: 'ARG', kanten: [{ dok: 'X' }] });
    expect(shardInhaltGleich(a, b)).toBe(true);
  });

  it('ein inhaltlicher Unterschied bleibt ungleich, auch bei gleichem Stempel (Rot-Beweis §6.7)', () => {
    const a = JSON.stringify({ erzeugt: '2026-09-12', erlass: 'ARG', kanten: [{ dok: 'X' }] });
    const b = JSON.stringify({ erzeugt: '2026-09-12', erlass: 'ARG', kanten: [{ dok: 'Y' }] });
    expect(shardInhaltGleich(a, b)).toBe(false);
  });

  it('ein inhaltlicher Unterschied bleibt ungleich, auch bei UNTERSCHIEDLICHEM Stempel', () => {
    const a = JSON.stringify({ erzeugt: '2026-09-12', erlass: 'ARG', kanten: [{ dok: 'X' }] });
    const b = JSON.stringify({ erzeugt: '2026-08-30', erlass: 'ARG', kanten: [{ dok: 'Y' }] });
    expect(shardInhaltGleich(a, b)).toBe(false);
  });

  it('byte-identische Strings sind immer gleich (schneller Pfad)', () => {
    const a = JSON.stringify({ erzeugt: '2026-09-12', erlass: 'ARG' });
    expect(shardInhaltGleich(a, a)).toBe(true);
  });

  it('ungültiges JSON auf einer Seite gilt als ungleich (Defense-in-depth bleibt bei pruefeShardDatei)', () => {
    expect(shardInhaltGleich('{kaputt', JSON.stringify({ erzeugt: 'x' }))).toBe(false);
    expect(shardInhaltGleich('{kaputt', '{kaputt')).toBe(true); // a === b, schneller Pfad
  });
});

describe('zaehleKanten (A3: nur noch die Kanten-Zahl, kein Downgrade-Blindwert mehr)', () => {
  it('zählt die Kanten eines Shards', () => {
    expect(zaehleKanten([{ a: 1 }, { a: 2 }, { a: 3 }])).toBe(3);
  });

  it('leere/undefinierte Kantenliste zählt 0, nicht undefined', () => {
    expect(zaehleKanten(undefined)).toBe(0);
    expect(zaehleKanten([])).toBe(0);
  });
});
