import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Regressions-Wächter (Bug-Check Vorlagen-Design-Deploy 19.6.2026):
// Der Ausgabe-Stil-Umschalter (nüchtern⇄modern) muss in JEDEM Output-Pfad
// greifen. Direkt-Aufrufe der Dokument-Renderer (vorlagenPdfDokument /
// vorlagenDocxDokument) — z. B. im Sammel-ZIP der Gründungs-Maske — dürfen
// die Stil-Wahl NICHT verschlucken, indem sie ohne `stil`-Argument den
// Renderer-Default ('modern') erzwingen. Befund war: AG-Gründungs-ZIP rief
// ohne `stil` auf → Nüchtern-Wahl wurde im Bulk-Export ignoriert.

const APP_WURZELN = ['src/pages', 'src/components'];
const RENDERER = /\b(vorlagenPdfDokument|vorlagenDocxDokument)\s*\(/;

function dateien(wurzel: string): string[] {
  const out: string[] = [];
  for (const eintrag of readdirSync(wurzel)) {
    const pfad = join(wurzel, eintrag);
    if (statSync(pfad).isDirectory()) out.push(...dateien(pfad));
    else if (/\.tsx?$/.test(pfad) && !pfad.endsWith('.test.ts') && !pfad.endsWith('.test.tsx')) out.push(pfad);
  }
  return out;
}

describe('Ausgabe-Stil wird in jeden Renderer-Direktaufruf durchgereicht', () => {
  it('kein vorlagenPdf/DocxDokument-Aufruf in der App-Schicht ohne `stil`', () => {
    const verstoesse: string[] = [];
    for (const wurzel of APP_WURZELN) {
      for (const datei of dateien(wurzel)) {
        const zeilen = readFileSync(datei, 'utf8').split('\n');
        zeilen.forEach((zeile, i) => {
          const treffer = zeile.match(RENDERER);
          if (!treffer) return;
          // Erwähnungen in Kommentaren (// …) sind keine Aufrufe.
          const davor = zeile.slice(0, treffer.index ?? 0);
          if (davor.includes('//') || /^\s*\*/.test(zeile)) return;
          // Aufruf kann das `stil`-Argument auf der gleichen oder einer
          // der zwei Folgezeilen tragen (mehrzeilige Argument-Objekte).
          const fenster = zeilen.slice(i, i + 3).join(' ');
          if (!/\bstil\b/.test(fenster)) verstoesse.push(`${datei}:${i + 1} → ${zeile.trim()}`);
        });
      }
    }
    expect(verstoesse, `Renderer-Aufruf ohne Stil-Durchreichung:\n${verstoesse.join('\n')}`).toEqual([]);
  });
});
