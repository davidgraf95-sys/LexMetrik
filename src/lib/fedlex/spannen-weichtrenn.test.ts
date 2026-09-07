// ─── Z1-Schnellpfad: das harte Muster ist mit dem weichen IDENTISCH ──────────
//
// `erlassVerweiseImText` (spannen.ts) scannt jeden Fliesstext mit einer grossen
// Alternation aller Genitiv-Namen und Titel-Fragmente. Die Alternation toleriert
// zwischen JE ZWEI Buchstaben einen weichen Trennstrich (U+00AD) — das kostet
// gemessen den Faktor 4.8 (Herleitung und Messreihe am Schnellpfad in
// `spannen.ts`, Zahlen in `abnahme/design-identitaet/PERF-LESER.md`).
//
// Der Schnellpfad nimmt darum auf Texten OHNE Weichtrennstrich das harte
// Muster. Diese Datei ist der NACHWEIS, dass das keine Regel ändert (§6:
// Verhaltensneutralität wird bewiesen, nicht behauptet) — und sie kann
// scheitern: nimmt jemand die Fallunterscheidung heraus und lässt das harte
// Muster auf ALLE Texte los, wird die Rot-Probe unten rot.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { Z1_ERLASS, Z1_ERLASS_HART, erlassVerweiseImText } from './spannen';

const WEICH = '­';

/** Alle Zeichenketten eines Snapshots (Fliesstext steht in vielen Feldern). */
function texteAus(datei: string): string[] {
  const raus: string[] = [];
  const sammle = (v: unknown): void => {
    if (typeof v === 'string') { if (v.length > 3) raus.push(v); return; }
    if (Array.isArray(v)) { v.forEach(sammle); return; }
    if (v && typeof v === 'object') Object.values(v as Record<string, unknown>).forEach(sammle);
  };
  sammle(JSON.parse(readFileSync(datei, 'utf8')));
  return raus;
}

const treffer = (re: RegExp, t: string): string =>
  JSON.stringify([...t.matchAll(re)].map((m) => [m.index, m[0], m[1], m[2], m[3], m[4]]));

describe('Z1-Schnellpfad — hartes und weiches Muster liefern dasselbe', () => {
  // Zwei Snapshots, Bund und Kanton, ganz durchgefahren: rund 1.3 Mio Zeichen.
  // Die volle Korpus-Runde (1 566 Erlasse, 0 Divergenzen) steht in PERF-LESER.md
  // — hier bleibt die schnelle, dauerhaft mitlaufende Stichprobe.
  for (const datei of ['public/normtext/bund/OR.json', 'public/normtext/kanton/BS-152.110.json']) {
    it(`byte-gleiche Treffer über ${datei}`, () => {
      const texte = texteAus(datei);
      expect(texte.length).toBeGreaterThan(100); // die Datei wurde wirklich gelesen
      let geprueft = 0;
      for (const t of texte) {
        if (t.includes(WEICH)) continue; // dort gilt ohnehin das weiche Muster
        expect(treffer(Z1_ERLASS_HART, t)).toBe(treffer(Z1_ERLASS, t));
        geprueft++;
      }
      expect(geprueft).toBeGreaterThan(100);
    });
  }

  // ─── Rot-Probe (§6.7): die Fallunterscheidung ist tragend ──────────────────
  //
  // Fedlex-HTML trennt lange Wörter mit U+00AD. Genau dort — und nur dort —
  // unterscheiden sich die beiden Muster. Fiele die Fallunterscheidung weg,
  // verlöre der Leser den Link auf das ZGB.
  it('Rot-Probe: mit Weichtrennstrich trifft NUR das weiche Muster', () => {
    const t = `Im Übrigen gelten die Bestimmungen des Zivilgesetzbu${WEICH}ches.`;
    expect([...t.matchAll(Z1_ERLASS)].length).toBe(1);
    expect([...t.matchAll(Z1_ERLASS_HART)].length).toBe(0);
  });

  it('der Schnellpfad wählt richtig: Weichtrenn-Text behält seinen Erlass-Link', () => {
    const mit = `Im Übrigen gelten die Bestimmungen des Zivilgesetzbu${WEICH}ches.`;
    const ohne = 'Im Übrigen gelten die Bestimmungen des Zivilgesetzbuches.';
    expect(erlassVerweiseImText(mit).map((s) => s.artikel)).toEqual(['ZGB']);
    expect(erlassVerweiseImText(ohne).map((s) => s.artikel)).toEqual(['ZGB']);
  });
});
