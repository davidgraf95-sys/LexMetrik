// scripts/datenhaltung/turso-transport.test.ts
// Hält die Schätz-Invariante des Mehrzeilen-Transports fest (Gegenprüfungs-Befund B6).
//
// Der Sync deckelt Statement- und Request-Grösse über `zeilenBytes()`. Diese Deckelung ist
// nur dann eine Schranke, wenn die Schätzung die REAL gesendete Hrana-JSON-Nutzlast nie
// unterschätzt. Die frühere Fassung tat genau das: sie zählte `v.length + 8`, also
// UTF-16-Code-Units ohne Argument-Overhead und ohne JSON-Escaping — gemessen bis Faktor 1,34
// daneben, wodurch ein „4 MiB"-Request real 6,03 MiB gross wurde.
//
// Der Test kodiert die Zeilen exakt so, wie `pipeline()` es tut, und vergleicht.
import { describe, it, expect } from 'vitest';
import { zeilenBytes, STMT_OVERHEAD, TUPEL_TRENNER, type Wert } from './turso-transport';

/** Byte-Zahl der Argumente EINER Zeile in der Hrana-Kodierung — identisch zu pipeline(). */
function echteArgBytes(werte: Wert[]): number {
  const args = werte.map((v) =>
    v === null
      ? { type: 'null' as const, value: null }
      : typeof v === 'number'
        ? { type: 'integer' as const, value: String(v) }
        : { type: 'text' as const, value: v },
  );
  return Buffer.byteLength(JSON.stringify(args), 'utf8');
}

const FAELLE: Array<[string, Wert[]]> = [
  // Diese vier Fälle haben den früheren pauschalen Escape-Faktor 1,25 gekippt
  // (Gegenprüfung Runde 2). Sie stehen hier, damit er nicht zurückkommt.
  ['escape-dicht: nur Anführungszeichen', ['"'.repeat(2000)]],
  ['escape-dicht: nur Backslashes', ['\\'.repeat(2000)]],
  ['escape-dicht: nur Zeilenumbrüche', ['\n'.repeat(2000)]],
  ['escape-dicht: Steuerzeichen U+0001 (wird zu \\u0001, 6 B je Zeichen)', [''.repeat(2000)]],
  ['gemischt escape-lastig wie bloecke_json bei hoher Dichte', ['{"a":"b\\nc","d":"e"}'.repeat(300)]],
  ['reines ASCII', ['OR', 'art_319', 'Der Arbeitnehmer verpflichtet sich zur Arbeitsleistung.']],
  ['Umlaute/Akzente (UTF-8 mehrbyte)', ['ZGB', 'Verjährung, Rechtsöffnung, für, hätte, où, città']],
  [
    'JSON-in-JSON mit vielen Anführungszeichen (bloecke_json, der teuerste Fall)',
    ['OR', JSON.stringify([{ typ: 'absatz', text: 'Wer «Schaden» zufügt, "haftet".', items: ['lit. a', 'lit. b'] }])],
  ],
  ['NULL- und Zahlwerte', [null, 42, null, 'x']],
  // OHNE String-Reserve — genau daran ist die Vorfassung gescheitert: Zahlen wurden pauschal
  // mit 32 B veranschlagt, `{"type":"integer","value":"55822"},` braucht real 34 B. 55822 ist
  // die reale Grössenordnung der rowid-Spalte (Gegenprüfung Runde 3).
  ['nur Zahlen, rowid-Grössenordnung', [55822, 55821]],
  ['nur Zahlen, mehrstellig/negativ', [-1234567890, 999999999, 0]],
  ['reine NULL-Zeile', [null, null, null]],
  ['leere Strings', ['', '', '']],
  ['sehr langer Text', ['x'.repeat(50_000)]],
  ['sehr langer Umlaut-Text', ['ä'.repeat(50_000)]],
  ['Backslashes und Steuerzeichen', ['a\\b\nc\td"e']],
  ['Emoji / ausserhalb BMP (Surrogatpaare)', ['Randfall 𝔘𝔫𝔦𝔠𝔬𝔡𝔢 🇨🇭 Ende']],
];

describe('zeilenBytes — konservative Obergrenze der Hrana-Nutzlast', () => {
  for (const [name, werte] of FAELLE) {
    it(`unterschätzt nicht: ${name}`, () => {
      const geschaetzt = zeilenBytes(werte);
      const real = echteArgBytes(werte);
      expect(geschaetzt).toBeGreaterThanOrEqual(real);
    });
  }

  it('bleibt in vernünftiger Nähe (keine 3x-Überschätzung, sonst zerfällt das Batching)', () => {
    for (const [name, werte] of FAELLE) {
      const geschaetzt = zeilenBytes(werte);
      const real = echteArgBytes(werte);
      // Sehr kurze Zeilen dürfen relativ stark überschätzt werden (fixer Arg-Overhead
      // dominiert); geprüft wird darum erst ab einer Zeile, die überhaupt Nutzlast trägt.
      if (real > 500) {
        expect(geschaetzt / real, name).toBeLessThan(3);
      }
    }
  });

  it('wächst monoton mit der Textlänge', () => {
    expect(zeilenBytes(['kurz'])).toBeLessThan(zeilenBytes(['kurz'.repeat(100)]));
  });
});

/**
 * Die Zeilen-Schranke allein genügt nicht: der REQUEST enthält zusätzlich das SQL-Gerüst
 * (Statement-Kopf, je Zeile ein `(?, ?)`-Tupel, der `execute`-Rahmen). Bei schmalen Tabellen
 * dominiert das — `fts_artikel` hat zwei Spalten und packte bis zu 4000 Tupel in ein
 * Statement, deren SQL-Text die Reserve auffrass (real 3,023 MiB gegen 3,00-MiB-Schranke,
 * Gegenprüfung Runde 3). Dieser Test bildet die Rechnung aus `ladeWerte()` nach.
 */
describe('Statement-Schranke inklusive SQL-Gerüst', () => {
  function statementBytes(zielTabelle: string, spalten: string[], zeilen: Wert[][]): { geschaetzt: number; real: number } {
    const kopf = `INSERT INTO ${zielTabelle} (${spalten.join(', ')}) VALUES `;
    const tupel = `(${spalten.map(() => '?').join(', ')})`;
    const geschaetzt =
      STMT_OVERHEAD +
      Buffer.byteLength(kopf, 'utf8') +
      zeilen.reduce((s, z) => s + zeilenBytes(z) + Buffer.byteLength(tupel, 'utf8') + TUPEL_TRENNER, 0);
    const stmt = {
      type: 'execute',
      stmt: {
        sql: kopf + zeilen.map(() => tupel).join(', '),
        args: zeilen.flat().map((v) =>
          v === null
            ? { type: 'null', value: null }
            : typeof v === 'number'
              ? { type: 'integer', value: String(v) }
              : { type: 'text', value: v },
        ),
      },
    };
    return { geschaetzt, real: Buffer.byteLength(JSON.stringify(stmt), 'utf8') + 1 };
  }

  it('schmale Tabelle (fts_artikel-Form: rowid + kurzer Text, viele Zeilen)', () => {
    const zeilen: Wert[][] = Array.from({ length: 4000 }, (_, i) => [i + 1, 'kurz']);
    const { geschaetzt, real } = statementBytes('fts_artikel_neu', ['rowid', 'text'], zeilen);
    expect(geschaetzt).toBeGreaterThanOrEqual(real);
  });

  it('breite Tabelle (artikel-Form: 12 Spalten)', () => {
    const spalten = ['rowid', 'erlass_key', 'fassungs_token', 'art_id', 'ord', 'artikel', 'artikel_label', 'marg', 'grundlage', 'quelle_url', 'bloecke_json', 'sha'];
    const zeilen: Wert[][] = Array.from({ length: 600 }, (_, i) => [
      i + 1, 'OR', '20260101', `art_${i}`, i, String(i), `Art. ${i}`, null, null, 'https://x', '[{"text":"a\\"b"}]', 'sha',
    ]);
    const { geschaetzt, real } = statementBytes('artikel_neu', spalten, zeilen);
    expect(geschaetzt).toBeGreaterThanOrEqual(real);
  });

  it('Extremfall: nur Zahlen, keine String-Reserve', () => {
    const zeilen: Wert[][] = Array.from({ length: 3000 }, (_, i) => [i + 50000, i + 50001]);
    const { geschaetzt, real } = statementBytes('t', ['a', 'b'], zeilen);
    expect(geschaetzt).toBeGreaterThanOrEqual(real);
  });
});
