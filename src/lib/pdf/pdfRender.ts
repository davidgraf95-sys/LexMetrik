import { jsPDF } from 'jspdf';
import type { BerechnungsStatus } from '../../types/legal';
import { buildPdfModel, statusLabel, type PdfDocConfig, type PdfModel } from './pdfModel';

// ─── Zeichnung des Dokumentmodells mit jsPDF ──────────────────────────────
//
// Reines Layout: A4, 22-mm-Ränder, konsistente Heading-Hierarchie, Fusszeile
// mit «Seite X von Y» und Zeitstempel auf jeder Seite. Inhalte stammen
// ausschliesslich aus dem Modell (keine domänenspezifischen Bausteine hier).

const MARGIN = 22;                 // mm (Spez: 20–25 mm)
const PAGE_H = 297;
const PAGE_W = 210;
const FOOTER_ZONE = 18;            // unten reserviert für die Fusszeile
const BOTTOM = PAGE_H - FOOTER_ZONE;
const USABLE = PAGE_W - 2 * MARGIN;

// Druck-/SW-freundliche Farbpalette (dunkle Töne, helle Flächen).
const INK: [number, number, number] = [30, 41, 59];
const DEZENT: [number, number, number] = [100, 116, 139];
const WARN: [number, number, number] = [146, 64, 14];
const LINIE: [number, number, number] = [203, 207, 216];
const FLAECHE: [number, number, number] = [246, 244, 240];
const LINK: [number, number, number] = [29, 78, 137];

const BADGE: Record<BerechnungsStatus, { fill: [number, number, number] }> = {
  ok: { fill: [22, 101, 52] },
  nichtig: { fill: [153, 27, 27] },
  kein_anspruch: { fill: [153, 27, 27] },
  unzulaessig: { fill: [153, 27, 27] },
  ktg_regime: { fill: [146, 64, 14] },
};

type Schrift = { size: number; bold?: boolean; color?: [number, number, number] };

class Zeichner {
  doc: jsPDF;
  y = MARGIN;

  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    // Kein zusätzlicher Zeichenabstand – verhindert «G e s p e r r t»-Effekte.
    this.doc.setCharSpace(0);
  }

  private setSchrift(s: Schrift) {
    this.doc.setFontSize(s.size);
    this.doc.setFont('helvetica', s.bold ? 'bold' : 'normal');
    this.doc.setTextColor(...(s.color ?? INK));
  }

  /** Zeilenhöhe in mm für eine Schriftgrösse (pt). */
  private zh(size: number): number {
    return size * 0.3528 * 1.35;
  }

  platz(hoehe: number) {
    if (this.y + hoehe > BOTTOM) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  /** Text mit Umbruch; hängender Einzug via indent. Bricht seitenweise um. */
  text(text: string, s: Schrift, x = MARGIN, breite = USABLE) {
    this.setSchrift(s);
    const zeilen = this.doc.splitTextToSize(text, breite) as string[];
    const h = this.zh(s.size);
    zeilen.forEach((zeile) => {
      this.platz(h);
      this.setSchrift(s); // nach Seitenumbruch erneut setzen
      this.doc.text(zeile, x, this.y);
      this.y += h;
    });
  }

  abstand(mm: number) {
    this.y += mm;
  }

  trenner() {
    this.platz(6);
    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.2);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 5;
  }

  /** Listeneintrag mit echtem Bullet-Glyph (CP1252: «•») und hängendem Einzug. */
  liste(text: string, color: [number, number, number]) {
    const s: Schrift = { size: 9, color };
    this.setSchrift(s);
    const einzug = 4;
    const zeilen = this.doc.splitTextToSize(text, USABLE - einzug) as string[];
    const h = this.zh(9);
    zeilen.forEach((zeile, i) => {
      this.platz(h);
      this.setSchrift(s);
      if (i === 0) this.doc.text('•', MARGIN, this.y);
      this.doc.text(zeile, MARGIN + einzug, this.y);
      this.y += h;
    });
    this.y += 0.8;
  }

  /** Prominente Ergebnis-Box mit Status-Badge. */
  ergebnisbox(text: string, status: BerechnungsStatus) {
    const pad = 4;
    const badgeLabel = statusLabel(status);
    const sText: Schrift = { size: 11, bold: true };
    this.setSchrift(sText);
    const zeilen = this.doc.splitTextToSize(text, USABLE - 2 * pad) as string[];
    const hText = zeilen.length * this.zh(11);
    const hBadge = 6;
    const hBox = pad + hBadge + 2 + hText + pad;
    this.platz(hBox + 2);

    // Box
    this.doc.setFillColor(...FLAECHE);
    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(MARGIN, this.y, USABLE, hBox, 1.5, 1.5, 'FD');

    // Badge
    const b = BADGE[status];
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    const bw = this.doc.getTextWidth(badgeLabel) + 5;
    this.doc.setFillColor(...b.fill);
    this.doc.roundedRect(MARGIN + pad, this.y + pad - 1, bw, hBadge - 1, 1, 1, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(badgeLabel, MARGIN + pad + 2.5, this.y + pad + 2.6);

    // Ergebnistext
    let ty = this.y + pad + hBadge + 2;
    this.setSchrift(sText);
    zeilen.forEach((zeile) => {
      this.doc.text(zeile, MARGIN + pad, ty);
      ty += this.zh(11);
    });

    this.y += hBox + 3;
  }

  /** Normverweis, optional als klickbarer Fedlex-Link. */
  norm(text: string, url?: string) {
    const s: Schrift = { size: 9, color: url ? LINK : INK };
    this.setSchrift(s);
    const einzug = 4;
    const zeilen = this.doc.splitTextToSize(text, USABLE - einzug) as string[];
    const h = this.zh(9);
    zeilen.forEach((zeile, i) => {
      this.platz(h);
      this.setSchrift(s);
      if (i === 0) this.doc.text('•', MARGIN, this.y, );
      if (url) {
        this.doc.textWithLink(zeile, MARGIN + einzug, this.y, { url });
      } else {
        this.doc.text(zeile, MARGIN + einzug, this.y);
      }
      this.y += h;
    });
    this.y += 0.8;
  }

  /** Disclaimer im gemeinsamen Rahmen (Layout zentral, Text vom Rechner). */
  disclaimer(text: string) {
    const pad = 4;
    const s: Schrift = { size: 8, color: DEZENT };
    this.setSchrift(s);
    const zeilen = this.doc.splitTextToSize(text, USABLE - 2 * pad) as string[];
    const titelH = this.zh(9);
    const hBox = pad + titelH + zeilen.length * this.zh(8) + pad;
    this.platz(hBox + 2);

    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(MARGIN, this.y, USABLE, hBox, 1.5, 1.5, 'D');

    let ty = this.y + pad + 1.5;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...DEZENT);
    this.doc.text('Rechtlicher Hinweis – keine Rechtsberatung', MARGIN + pad, ty);
    ty += titelH;
    this.setSchrift(s);
    zeilen.forEach((zeile) => {
      this.doc.text(zeile, MARGIN + pad, ty);
      ty += this.zh(8);
    });
    this.y += hBox + 2;
  }

  /** Fusszeile auf jeder Seite: Zeitstempel links, «Seite X von Y» rechts. */
  fusszeilen(titel: string, erstellt: string) {
    const total = this.doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...DEZENT);
      this.doc.setDrawColor(...LINIE);
      this.doc.setLineWidth(0.2);
      const fy = PAGE_H - 12;
      this.doc.line(MARGIN, fy - 4, PAGE_W - MARGIN, fy - 4);
      this.doc.text(`${titel} · erstellt ${erstellt} Uhr`, MARGIN, fy);
      const rechts = `Seite ${i} von ${total}`;
      this.doc.text(rechts, PAGE_W - MARGIN - this.doc.getTextWidth(rechts), fy);
    }
  }
}

/** Rendert das Modell in ein jsPDF-Dokument (ohne zu speichern – testbar). */
export function renderPdf(model: PdfModel): jsPDF {
  const z = new Zeichner();
  let titel = '';

  model.blocks.forEach((b) => {
    switch (b.art) {
      case 'titel':
        titel = b.text;
        z.text(b.text, { size: 16, bold: true });
        z.abstand(0.5);
        break;
      case 'meta':
        z.text(b.text, { size: 9, color: DEZENT });
        z.trenner();
        break;
      case 'h2':
        z.platz(14); // Überschrift nicht als Witwe ans Seitenende
        z.abstand(1.5);
        z.text(b.text, { size: 12, bold: true });
        z.abstand(0.5);
        break;
      case 'h3':
        z.platz(10);
        z.abstand(1);
        z.text(b.text, { size: 10, bold: true });
        break;
      case 'kv':
        z.text(`${b.key}: ${b.value}`, { size: 9 });
        break;
      case 'ergebnisbox':
        z.ergebnisbox(b.text, b.status);
        break;
      case 'absatz':
        z.text(b.text, { size: 9, color: b.ton === 'warn' ? WARN : b.ton === 'dezent' ? DEZENT : INK });
        break;
      case 'liste':
        z.liste(b.text, b.ton === 'warn' ? WARN : INK);
        break;
      case 'schritt':
        z.platz(12);
        z.text(`${b.nr}. ${b.titel}`, { size: 9, bold: true });
        z.text(b.text, { size: 9 }, MARGIN + 4, USABLE - 4);
        if (b.normen) z.text(`Normen: ${b.normen}`, { size: 8, color: DEZENT }, MARGIN + 4, USABLE - 4);
        if (b.rechtsprechung) z.text(`Rechtsprechung: ${b.rechtsprechung}`, { size: 8, color: WARN }, MARGIN + 4, USABLE - 4);
        z.abstand(1.2);
        break;
      case 'norm':
        z.norm(b.text, b.url);
        break;
      case 'disclaimer':
        z.abstand(2);
        z.disclaimer(b.text);
        break;
      case 'trenner':
        z.trenner();
        break;
    }
  });

  z.fusszeilen(titel, model.erstellt);
  return z.doc;
}

/** Baut Modell + PDF aus der Rechner-Konfiguration und lädt die Datei herunter. */
export function exportPdf(cfg: PdfDocConfig) {
  const model = buildPdfModel(cfg);
  renderPdf(model).save(model.dateiname);
}
