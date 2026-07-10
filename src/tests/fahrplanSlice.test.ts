import { describe, it, expect } from 'vitest';
import { headings, normKey, slice } from '../../scripts/fahrplan-slice';

// QS-TOK / FAHRPLAN-TOKEN-OEKONOMIE.md §3 T3: der Slicer druckt Kopf + §0 + Ziel-§§
// + IMMER das vollständige ##/###-Inventar (ToC), byte-treu, deterministisch. Test
// gegen Fixtures BEIDER Nummerierungs-Stile (`## §N` und `## N ·` / `### N.M`) —
// nicht gegen die echten (parallel bearbeiteten) FAHRPLAN-Dateien.

// Stil A: `## §N` (wie FAHRPLAN-TOKEN-OEKONOMIE.md).
const STIL_A = `# FAHRPLAN — Titel

> Kopf-Blockquote mit Leitplanke.

## §0 Regeln
Quer-Lektion R.

## §1 Erstes
Inhalt eins.

## §10 Zehntes
Inhalt zehn.
`;

// Stil B: `## N ·` + `### N.M` (wie FAHRPLAN-GESETZES-UX.md).
const STIL_B = `# FAHRPLAN Gesetzes-UX

Intro-Absatz.

## 0 · Kritik
Quer-Kritik.

## 10 · Anmerkungs-Welle
Rahmen.

### 10.7 · Ausführungsvermerke
Detail 10.7.

### 10.8 · Nachzug
Detail 10.8.

## 11 · Danach
Rest.
`;

describe('normKey', () => {
  it('strippt führendes § und Whitespace', () => {
    expect(normKey('§10')).toBe('10');
    expect(normKey('  3 ')).toBe('3');
    expect(normKey('10.7')).toBe('10.7');
  });
});

describe('headings', () => {
  it('erkennt ## und ### mit Token (ohne §)', () => {
    const hs = headings(STIL_A);
    expect(hs.map((h) => h.token)).toEqual(['0', '1', '10']);
    const hb = headings(STIL_B);
    expect(hb.map((h) => `${h.level}:${h.token}`)).toEqual([
      '2:0',
      '2:10',
      '3:10.7',
      '3:10.8',
      '2:11',
    ]);
  });

  it('§1 kollidiert nicht mit §10 (Wort-Token, kein Präfix)', () => {
    const r = slice(STIL_A, ['1']);
    expect(r.gefunden).toEqual(['1']);
    expect(r.text).toContain('Inhalt eins.');
    expect(r.text).not.toContain('Inhalt zehn.');
  });
});

describe('slice', () => {
  it('liefert Kopf + §0 + Ziel-§ + vollständiges ToC (Stil A)', () => {
    const r = slice(STIL_A, ['10'], 'FAHRPLAN-X.md');
    // Kopf + §0 immer dabei
    expect(r.text).toContain('Kopf-Blockquote mit Leitplanke.');
    expect(r.text).toContain('Quer-Lektion R.');
    // Ziel-§
    expect(r.text).toContain('Inhalt zehn.');
    // Nicht angefragtes §1 bleibt draussen (ausser im ToC)
    expect(r.text).not.toContain('Inhalt eins.');
    // Vollständiges Inventar im ToC
    expect(r.text).toContain('## Inhalt — vollständiges ##/###-Inventar');
    expect(r.text).toContain('- ## §1 Erstes');
    expect(r.text).toContain('- ## §10 Zehntes');
    // Ganzdatei-Rückfall vermerkt
    expect(r.text).toContain('Ganzdatei bei Unklarheit');
  });

  it('Stil B: ## 10 zieht seine ### 10.7/10.8-Unterabschnitte mit, stoppt bei ## 11', () => {
    const r = slice(STIL_B, ['10']);
    expect(r.text).toContain('Quer-Kritik.'); // §0 immer dabei
    expect(r.text).toContain('Rahmen.');
    expect(r.text).toContain('Detail 10.7.');
    expect(r.text).toContain('Detail 10.8.');
    expect(r.text).not.toContain('Rest.'); // ## 11 nicht enthalten
  });

  it('Stil B: gezielter Unter-§ 10.7 schneidet nur bis 10.8', () => {
    const r = slice(STIL_B, ['10.7']);
    expect(r.text).toContain('Detail 10.7.');
    expect(r.text).not.toContain('Detail 10.8.');
  });

  it('meldet fehlende §§ (und der Rest bleibt gültig)', () => {
    const r = slice(STIL_A, ['1', '99']);
    expect(r.gefunden).toEqual(['1']);
    expect(r.fehlend).toEqual(['99']);
    expect(r.text).toContain('Nicht gefunden: 99');
  });

  it('Slice ist deutlich kleiner als die Ganzdatei bei grossen §§', () => {
    // Grosse Datei simulieren: §2 ist riesig, wir wollen nur §1.
    const gross =
      '# T\n\n## §0 R\nr\n\n## §1 klein\nx\n\n## §2 gross\n' + 'y'.repeat(50_000) + '\n';
    const r = slice(gross, ['1']);
    expect(r.text.length).toBeLessThan(gross.length / 2);
    expect(r.text).not.toContain('y'.repeat(50_000));
  });

  it('mehrere §§ in Dokumentreihenfolge, byte-treuer Sektionsinhalt', () => {
    const r = slice(STIL_A, ['10', '1']);
    const i1 = r.text.indexOf('Inhalt eins.');
    const i10 = r.text.indexOf('Inhalt zehn.');
    expect(i1).toBeGreaterThan(-1);
    expect(i10).toBeGreaterThan(-1);
    expect(i1).toBeLessThan(i10); // Reihenfolge = Dokument, nicht Argument
    // Byte-treu: die Original-Überschrift steht wörtlich im Slice.
    expect(r.text).toContain('## §1 Erstes');
  });
});
