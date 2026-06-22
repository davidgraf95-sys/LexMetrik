/**
 * Tests für die reine Confidence-/Treue-Logik des Gesetzes-Imports.
 * Alle Tests: synthetische Fälle ohne FS/Netz — §2-konform.
 */

import { describe, it, expect } from 'vitest';
import {
  pruefeTreue,
  normalisiereVolltext,
  tokenRecall,
  bewerteConfidence,
} from '../../scripts/normtext/confidence-logik.ts';
import type { SnapArtikel } from '../../scripts/normtext/confidence-logik.ts';

function art(token: string, bloecke: SnapArtikel['bloecke']): SnapArtikel {
  return { artikel: token, artikelLabel: `Art. ${token}`, bloecke };
}

// ─── pruefeTreue ──────────────────────────────────────────────────────────────
describe('pruefeTreue', () => {
  it('akzeptiert einen sauberen Artikel ohne Befund', () => {
    const a = art('1', [{ absatz: '1', text: 'Dieses Gesetz dient dem Schutz.' }]);
    expect(pruefeTreue([a])).toEqual([]);
  });

  it('flaggt einen leeren Artikel HART', () => {
    const a = art('5', [{ absatz: '1', text: '   ' }]);
    const flags = pruefeTreue([a]);
    expect(flags).toHaveLength(1);
    expect(flags[0].klasse).toBe('leerer-artikel');
    expect(flags[0].schwere).toBe('hart');
  });

  it('flaggt einen Artikel ganz ohne Blöcke HART', () => {
    const flags = pruefeTreue([art('7', [])]);
    expect(flags[0].klasse).toBe('leerer-artikel');
  });

  it('erkennt Substanz auch in Items und Tabellen', () => {
    const mitItems = art('2', [{ absatz: '1', text: '', items: [{ marke: 'a', text: 'Personendaten;' }] }]);
    const mitTab = art('3', [{ absatz: null, text: '', tabelle: [{ beschreibung: 'Gebühr', betrag: '100' }] }]);
    expect(pruefeTreue([mitItems, mitTab])).toEqual([]);
  });

  it('flaggt Fussnoten-Marker im Text WEICH', () => {
    const a = art('4', [{ absatz: '1', text: 'Der Bund regelt dies[12] abschliessend.' }]);
    const flags = pruefeTreue([a]);
    expect(flags.map((f) => f.klasse)).toContain('fussnoten-marker-im-text');
    expect(flags.find((f) => f.klasse === 'fussnoten-marker-im-text')!.schwere).toBe('weich');
  });

  it('flaggt Mojibake HART', () => {
    const a = art('6', [{ absatz: '1', text: 'Grunds�tze der Bearbeitung.' }]);
    expect(pruefeTreue([a]).some((f) => f.klasse === 'mojibake' && f.schwere === 'hart')).toBe(true);
  });

  it('flaggt verklebte Tokens WEICH', () => {
    const a = art('8', [{ absatz: '1', text: 'Tarif ' + 'x'.repeat(45) }]);
    expect(pruefeTreue([a]).some((f) => f.klasse === 'verklebter-token')).toBe(true);
  });

  it('flaggt eine Absatz-Lücke WEICH', () => {
    const a = art('9', [
      { absatz: '1', text: 'Erstens.' },
      { absatz: '3', text: 'Drittens — Absatz 2 fehlt.' },
    ]);
    expect(pruefeTreue([a]).some((f) => f.klasse === 'absatz-luecke')).toBe(true);
  });

  it('akzeptiert wiederholte Absatz-Nummern (kein Sprung)', () => {
    const a = art('10', [
      { absatz: '1', text: 'Teil a.' },
      { absatz: '1', text: 'Teil b.' },
      { absatz: '2', text: 'Weiter.' },
    ]);
    expect(pruefeTreue([a])).toEqual([]);
  });
});

// ─── normalisiereVolltext ────────────────────────────────────────────────────
describe('normalisiereVolltext', () => {
  it('löst Tausendertrenner, NBSP und Fussnoten-Marker auf', () => {
    expect(normalisiereVolltext("Die Gebühr beträgt 1'000 Franken[3].")).toEqual([
      'die', 'gebühr', 'beträgt', '1000', 'franken',
    ]);
  });

  it('ist layout-invariant gegen Mehrfach-Whitespace und Zeilenumbrüche', () => {
    expect(normalisiereVolltext('Art.  1\n\n  Zweck')).toEqual(['art', '1', 'zweck']);
  });

  it('liefert leeres Array für leeren Text', () => {
    expect(normalisiereVolltext('   ')).toEqual([]);
  });
});

// ─── tokenRecall ──────────────────────────────────────────────────────────────
describe('tokenRecall', () => {
  it('ist 1, wenn das Ziel die Quelle vollständig deckt', () => {
    expect(tokenRecall(['a', 'b', 'c'], ['c', 'b', 'a', 'd'])).toBe(1);
  });

  it('zählt fehlende Quell-Tokens anteilig', () => {
    expect(tokenRecall(['a', 'b', 'c', 'd'], ['a', 'b'])).toBe(0.5);
  });

  it('respektiert Multiset-Häufigkeiten', () => {
    expect(tokenRecall(['a', 'a'], ['a'])).toBe(0.5);
  });

  it('liefert 1 für leere Quelle', () => {
    expect(tokenRecall([], ['a'])).toBe(1);
  });
});

// ─── bewerteConfidence ───────────────────────────────────────────────────────
describe('bewerteConfidence', () => {
  it('gibt vollen Score ohne Befunde', () => {
    expect(bewerteConfidence([]).score).toBe(1);
  });

  it('setzt den Score bei einem harten Befund auf 0 (Veto)', () => {
    const flags = pruefeTreue([art('1', [])]);
    const r = bewerteConfidence(flags);
    expect(r.score).toBe(0);
    expect(r.vetos.length).toBeGreaterThan(0);
  });

  it('senkt den Score bei weichen Befunden graduell', () => {
    const weich = [
      { artikel: '1', klasse: 'absatz-luecke' as const, detail: '', schwere: 'weich' as const },
      { artikel: '2', klasse: 'verklebter-token' as const, detail: '', schwere: 'weich' as const },
    ];
    const r = bewerteConfidence(weich, 1, { weichGewicht: 0.05 });
    expect(r.score).toBeCloseTo(0.9, 5);
    expect(r.vetos).toEqual([]);
  });

  it('macht einen zu niedrigen Kreuzdiff-Recall zum Veto', () => {
    const r = bewerteConfidence([], 0.9, { recallVeto: 0.985 });
    expect(r.score).toBe(0);
    expect(r.vetos[0]).toContain('kreuzdiff-recall');
  });
});
