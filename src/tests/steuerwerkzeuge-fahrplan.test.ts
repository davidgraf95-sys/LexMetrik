import { describe, expect, it } from 'vitest';
import { aufloesenDatei, headings, normKey, slice } from '../../scripts/fahrplan-slice';

// ─── aus src/tests/fahrplanSlice.test.ts ───────────────────────────────────────

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

// ---------------------------------------------------------------------------
// Fix-Runde 1 nach der Endprüfung der QS-TOK-Aufräumwelle (31.7.2026).
// Die bestehenden Fälle oben bleiben unverändert — die neuen Fälle stehen hier.
// ---------------------------------------------------------------------------

// Fund 26: Mehrwort-§-Zeiger lieferten STILL die falsche Sektion. Reproduziert am
// echten Bestand: `npm run fahrplan -- fahrplaene/FAHRPLAN-SPLIT-VIEW.md §STRANG B`
// druckte «## STRANG A — Inhaltsbreite-Umschalter (✅ FERTIG …)», die Kopfzeile
// behauptete «Enthalten: Kopf + §0 + §STRANG», die Warnung nannte nur «Nicht
// gefunden: B». Gleiches bei `§Paket 3` → «## Paket 1». Ursache: die CLI splittet
// an Leerzeichen und `hs.find(x => x.token === k)` nimmt den ERSTEN Token-Treffer.
const MEHRDEUTIG = `# FAHRPLAN Split-View

Kopf.

## §0 Zweck
Quer-Regel.

## STRANG A — Umschalter
Inhalt Strang A.

## STRANG B — Split-View
Inhalt Strang B.

## Paket 1 — Currency
Inhalt Paket eins.

## Paket 3 — Vernehmlassungen
Inhalt Paket drei.
`;

describe('slice — mehrdeutige und mehrteilige §-Zeiger (Fund 26)', () => {
  it('mehrdeutiges Ein-Wort-Token liefert ALLE Treffer statt still den ersten', () => {
    const r = slice(MEHRDEUTIG, ['STRANG']);
    expect(r.text).toContain('Inhalt Strang A.');
    expect(r.text).toContain('Inhalt Strang B.');
  });

  it('mehrdeutiges Token wird in der Kopfzeile sichtbar gemeldet', () => {
    const r = slice(MEHRDEUTIG, ['STRANG']);
    expect(r.mehrdeutig).toEqual([{ key: 'STRANG', treffer: ['STRANG A — Umschalter', 'STRANG B — Split-View'] }]);
    expect(r.text).toContain('mehrdeutig');
  });

  it('mehrteiliger Zeiger «STRANG B» trifft genau die gemeinte Sektion', () => {
    const r = slice(MEHRDEUTIG, ['§STRANG B']);
    expect(r.gefunden).toEqual(['STRANG B']);
    expect(r.text).toContain('Inhalt Strang B.');
    expect(r.text).not.toContain('Inhalt Strang A.');
  });

  it('mehrteiliger Zeiger «Paket 3» trifft Paket 3, nicht Paket 1', () => {
    const r = slice(MEHRDEUTIG, ['§Paket 3']);
    expect(r.text).toContain('Inhalt Paket drei.');
    expect(r.text).not.toContain('Inhalt Paket eins.');
  });

  it('eindeutiges Token bleibt unverändert eindeutig (keine Mehrdeutigkeits-Meldung)', () => {
    const r = slice(MEHRDEUTIG, ['0']);
    expect(r.mehrdeutig).toEqual([]);
    expect(r.text).not.toContain('mehrdeutig');
  });
});

// Fund 4/5: Vier Skills nennen Fahrpläne weiterhin ohne Ordner. Wer den dort
// genannten Namen 1:1 in den Slicer gibt, läuft in ENOENT (reproduziert:
// `npm run fahrplan -- FAHRPLAN-PERFORMANCE.md 1` → Exit 2). Der Slicer soll
// einen baren Namen selbst auflösen, statt die Session in die Sackgasse zu schicken.
describe('aufloesenDatei — Fallback für bare Dateinamen (Fund 4/5)', () => {
  it('bare Name → fahrplaene/<name>, wenn es dort liegt', () => {
    const da = (p: string) => p === 'fahrplaene/FAHRPLAN-PERFORMANCE.md';
    expect(aufloesenDatei('FAHRPLAN-PERFORMANCE.md', da)).toBe('fahrplaene/FAHRPLAN-PERFORMANCE.md');
  });

  it('bare Name → archiv/<name>, wenn er nur dort liegt', () => {
    const da = (p: string) => p === 'archiv/FAHRPLAN-DESIGN.md';
    expect(aufloesenDatei('FAHRPLAN-DESIGN.md', da)).toBe('archiv/FAHRPLAN-DESIGN.md');
  });

  it('liegt der Name in BEIDEN Ordnern, gewinnt fahrplaene/ (aktive Fassung zuerst)', () => {
    const da = (p: string) => p === 'fahrplaene/FAHRPLAN-X.md' || p === 'archiv/FAHRPLAN-X.md';
    expect(aufloesenDatei('FAHRPLAN-X.md', da)).toBe('fahrplaene/FAHRPLAN-X.md');
  });

  it('liegt der Name im Arbeitsverzeichnis, bleibt er unverändert (kein Umbiegen)', () => {
    expect(aufloesenDatei('FAHRPLAN-X.md', () => true)).toBe('FAHRPLAN-X.md');
  });

  it('bereits qualifizierter Pfad wird NICHT umgebogen', () => {
    const da = (p: string) => p === 'archiv/FAHRPLAN-DESIGN.md';
    expect(aufloesenDatei('archiv/FAHRPLAN-DESIGN.md', da)).toBe('archiv/FAHRPLAN-DESIGN.md');
  });

  it('nirgends auffindbar → null (Aufrufer meldet die bisherige Fehlermeldung)', () => {
    expect(aufloesenDatei('FAHRPLAN-GIBTSNICHT.md', () => false)).toBe(null);
  });
});
