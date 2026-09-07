import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Regressions-Wächter (W2·19-DESIGN-KONSISTENZ R6-D2, 5.9.2026):
// Der Hinweis «Eingaben werden NICHT lokal gespeichert» existierte in drei
// Formulierungen über sechs Vorlagen (Familienrecht: Vollversalien-"NICHT";
// ZPO-Eingaben: Nebensatz-Variante) — uneinheitlich UND ein Verstoss gegen
// A2 (kein ALL-CAPS-Fliesstext, DESIGN-REGLEMENT.md). Beide Formulierungen
// sind jetzt EINE geteilte Konstante (`NICHT_GESPEICHERT_HINWEIS`,
// `src/components/vorlagen/ui.tsx`). Dieser Test hält fest, dass die
// Wortlaute nie wieder als Literal in eine Seite zurückwandern.
//
// AG-Gründung (`VorlageAgGruendung.tsx`) ist ausgenommen: dort wird
// tatsächlich lokal zwischengespeichert (andere Tatsachenlage, eigener
// Wortlaut) — kein Kandidat für diese Konstante.

const WURZEL = 'src/pages';
const ALTE_FORMULIERUNGEN = [
  'Eingaben werden NICHT lokal gespeichert',
  'sie bestehen nur, solange diese Seite geöffnet ist',
];

function dateien(wurzel: string): string[] {
  const out: string[] = [];
  for (const eintrag of readdirSync(wurzel)) {
    const pfad = join(wurzel, eintrag);
    if (statSync(pfad).isDirectory()) out.push(...dateien(pfad));
    else if (/\.tsx?$/.test(pfad)) out.push(pfad);
  }
  return out;
}

describe('Datenschutz-Hinweis „nicht gespeichert" ist eine geteilte Konstante', () => {
  it('kein Vorlagen-Seiten-Literal mit einer der abgelösten Formulierungen', () => {
    const verstoesse: string[] = [];
    for (const datei of dateien(WURZEL)) {
      const inhalt = readFileSync(datei, 'utf8');
      for (const alt of ALTE_FORMULIERUNGEN) {
        if (inhalt.includes(alt)) verstoesse.push(`${datei}: „${alt}“`);
      }
    }
    expect(verstoesse).toEqual([]);
  });

  it('die Konstante trägt weiterhin genau einen Wortlaut (kein ALL-CAPS)', async () => {
    const { NICHT_GESPEICHERT_HINWEIS } = await import('../components/vorlagen/ui');
    expect(NICHT_GESPEICHERT_HINWEIS).toBe(
      'Eingaben werden nicht gespeichert – sie bestehen nur, solange diese Seite geöffnet ist.',
    );
    expect(NICHT_GESPEICHERT_HINWEIS).not.toMatch(/[A-ZÄÖÜ]{3,}/);
  });
});
