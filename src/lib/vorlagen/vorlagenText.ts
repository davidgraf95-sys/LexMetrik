import type { AssembleErgebnis } from './engine';

// Text-Renderer der Vorlagen (Zwischenablage / «Text kopieren»): dritte
// Ausgabe neben PDF und DOCX — gleiche Quelle, identischer Inhalt (EINE
// Quelle, mehrere Renderer).
export function dokumentAlsText(e: AssembleErgebnis): string {
  return [e.dokument.titel.toUpperCase(), '', ...e.dokument.absaetze.flatMap((x) => [
    ...(x.ueberschrift ? [x.ueberschrift] : []), x.text, '',
  ]), '---', e.dokument.disclaimer].join('\n');
}
