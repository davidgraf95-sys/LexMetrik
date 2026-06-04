import type { jsPDF } from 'jspdf';
import { FRAUNCES_600, GEIST_400, GEIST_600, GEIST_MONO_400 } from './fontData';

// Registriert die Markenschriften am Dokument (idempotent pro Dokument).
// Display: Fraunces SemiBold · Sans: Geist 400/600 · Mono: Geist Mono 400.
export function registriereBerichtFonts(doc: jsPDF) {
  doc.addFileToVFS('Fraunces-600.ttf', FRAUNCES_600);
  doc.addFont('Fraunces-600.ttf', 'Fraunces', 'normal');
  doc.addFont('Fraunces-600.ttf', 'Fraunces', 'bold'); // SemiBold dient als Bold
  doc.addFileToVFS('Geist-400.ttf', GEIST_400);
  doc.addFont('Geist-400.ttf', 'Geist', 'normal');
  doc.addFileToVFS('Geist-600.ttf', GEIST_600);
  doc.addFont('Geist-600.ttf', 'Geist', 'bold');
  doc.addFileToVFS('GeistMono-400.ttf', GEIST_MONO_400);
  doc.addFont('GeistMono-400.ttf', 'GeistMono', 'normal');
}
