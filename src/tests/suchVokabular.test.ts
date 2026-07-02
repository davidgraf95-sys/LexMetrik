import { describe, it, expect } from 'vitest';
import { expandiereSuchbegriff, normalisiereBegriff } from '../lib/suche/vokabular';

// Deterministische Query-Expansion, portiert aus OpenCaseLaw (mcp_server.py:
// LEGAL_QUERY_EXPANSIONS + LAW_SEARCH_EXPANSIONS). Nicht load-bearing (reine
// Suche), aber §2-deterministisch: gleiche Eingabe → gleiche Ausgabe.

describe('expandiereSuchbegriff', () => {
  it('DE-Synonym: kündigung → resiliation/disdetta (Diakritika-tolerant)', () => {
    const e = expandiereSuchbegriff('Kündigung');
    expect(e).toContain('resiliation');
    expect(e).toContain('disdetta');
    // Diakritika-Strippung führt auf denselben Schlüssel wie ASCII-Eingabe.
    expect(expandiereSuchbegriff('kuendigung')).toContain('resiliation');
  });

  it('FR/IT-Brücke: ricorso (IT) → beschwerde (DE) + recours (FR)', () => {
    const e = expandiereSuchbegriff('ricorso');
    expect(e).toContain('beschwerde');
    expect(e).toContain('recours');
    expect(e).toContain('appel');
  });

  it('umgangssprachlich→Normtext: vaterschaftsurlaub → urlaub/geburt', () => {
    const e = expandiereSuchbegriff('vaterschaftsurlaub');
    expect(e).toContain('urlaub');
    expect(e).toContain('geburt');
  });

  it('Mehrwort-Schlüssel: «conge parental» wird als Ganzes aufgelöst', () => {
    const e = expandiereSuchbegriff('conge parental');
    expect(e).toContain('conge');
    expect(e).toContain('naissance');
    expect(e).toContain('maternite');
  });

  it('unbekannter Begriff → keine Erweiterung; leere Eingabe → []', () => {
    expect(expandiereSuchbegriff('xyznichtvorhanden')).toEqual([]);
    expect(expandiereSuchbegriff('')).toEqual([]);
    expect(expandiereSuchbegriff('   ')).toEqual([]);
  });

  it('deterministisch: identische Eingabe → identische Reihenfolge', () => {
    expect(expandiereSuchbegriff('mietrecht')).toEqual(expandiereSuchbegriff('mietrecht'));
    // Original selbst kommt nie in der Erweiterungsliste vor.
    expect(expandiereSuchbegriff('mietrecht')).not.toContain('mietrecht');
  });

  it('normalisiereBegriff strippt Diakritika + lowercase', () => {
    expect(normalisiereBegriff('Kündigung')).toBe('kundigung');
    expect(normalisiereBegriff('proprietà')).toBe('proprieta');
  });
});
