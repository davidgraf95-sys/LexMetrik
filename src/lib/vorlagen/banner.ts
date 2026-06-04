// ─── Formvorschrift-Banner der Vorlagen-Exporte ─────────────────────────────
//
// Bewusst OHNE jsPDF-Import: Die Seiten brauchen Banner-Texte und -Typ schon
// beim Rendern, die PDF-Erzeugung selbst wird aber erst beim Klick lazy
// geladen — so bleibt jsPDF aus den Seiten-Chunks draussen.

export type PdfBanner = { titel: string; text: string };

// Vordefinierte Banner je Formvorschrift
export const BANNER_ABSCHREIBEN: PdfBanner = {
  titel: 'MUSTERTEXT — VOLLSTÄNDIG VON HAND ABZUSCHREIBEN',
  text: 'Dieses Blatt ist nicht das Testament. Gültig ist nur die von Anfang bis Ende eigenhändig geschriebene, datierte und unterschriebene Fassung (Art. 505 Abs. 1 ZGB).',
};
export const BANNER_UNTERSCHREIBEN: PdfBanner = {
  titel: 'NACH DEM AUSDRUCK HANDSCHRIFTLICH DATIEREN UND UNTERSCHREIBEN',
  text: 'Die Erstellung am Computer ist zulässig (Art. 371 Abs. 1 ZGB) — gültig wird das Dokument erst mit handschriftlichem Datum und eigenhändiger Unterschrift.',
};
