import { jsPDF } from 'jspdf';
import type { AssembleErgebnis } from './engine';

// PDF-Ausgabe einer Vorlage als «Mustertext zum eigenhändigen Abschreiben».
// Clientseitig (jsPDF), deterministisch; Banner + Fusszeile machen den
// Entwurfs-Charakter unmissverständlich.

const RAND = 22;
const BREITE = 210 - 2 * RAND;

export function vorlagenPdfErzeugen(e: AssembleErgebnis, opts: { abschreibHinweis: boolean; dateiName: string }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = RAND;

  const fusszeile = () => {
    const seiten = doc.getNumberOfPages();
    for (let i = 1; i <= seiten; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(110);
      const zeilen = doc.splitTextToSize(e.dokument.disclaimer, BREITE) as string[];
      doc.text(zeilen, RAND, 297 - 14);
      doc.text(`Bausteine v${e.dokument.version} · Seite ${i}/${seiten}`, 210 - RAND, 297 - 6, { align: 'right' });
    }
  };

  const seitenumbruch = (benoetigt: number) => {
    if (y + benoetigt > 297 - 24) { doc.addPage(); y = RAND; }
  };

  // Banner: Mustertext zum Abschreiben (Eigenhändigkeitsfälle)
  if (opts.abschreibHinweis) {
    doc.setFillColor(243, 226, 221);
    doc.rect(RAND, y, BREITE, 16, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(122, 47, 35);
    doc.text('MUSTERTEXT — VOLLSTÄNDIG VON HAND ABZUSCHREIBEN', RAND + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const hinweis = doc.splitTextToSize(
      'Dieses Blatt ist nicht das Testament. Gültig ist nur die von Anfang bis Ende eigenhändig geschriebene, datierte und unterschriebene Fassung (Art. 505 Abs. 1 ZGB).',
      BREITE - 8,
    ) as string[];
    doc.text(hinweis, RAND + 4, y + 10.5);
    y += 22;
  }

  // Titel (Serif für den Dokument-Charakter)
  doc.setTextColor(26, 26, 23);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text(e.dokument.titel, 105, y + 4, { align: 'center' });
  y += 14;

  // Absätze
  for (const a of e.dokument.absaetze) {
    if (a.ueberschrift) {
      seitenumbruch(12);
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.text(a.ueberschrift, RAND, y);
      y += 6;
    }
    doc.setFont('times', 'normal');
    doc.setFontSize(11.5);
    for (const absatzZeile of a.text.split('\n')) {
      const zeilen = doc.splitTextToSize(absatzZeile === '' ? ' ' : absatzZeile, BREITE) as string[];
      seitenumbruch(zeilen.length * 5.4 + 3);
      doc.text(zeilen, RAND, y);
      y += zeilen.length * 5.4;
    }
    y += 3.5;
  }

  fusszeile();
  doc.save(opts.dateiName);
}
