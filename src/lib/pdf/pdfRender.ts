import { jsPDF } from 'jspdf';
import type { BerechnungsStatus } from '../../types/legal';
import { buildPdfModel, statusLabel, type PdfDocConfig, type PdfModel, type PdfHero } from './pdfModel';

// ─── Zeichnung des Dokumentmodells mit jsPDF ──────────────────────────────
//
// Deklarativ über das Block-Modell: A4, ~20-mm-Ränder, Lexmetrik-Kopf mit
// Goldlinie, Ergebnis-Hero, Eingaben-Tabelle, unzerreissbare Rechenweg-
// Schritte mit klickbaren Norm-Pills, sichtbare Fedlex-URLs, Fusszeile mit
// «Seite X von Y» auf jeder Seite. Farben/Spacing spiegeln die Web-Tokens
// (paper/ink/brass); Schriften: PDF-Standardanaloga (Times ≈ Display-Serife,
// Helvetica ≈ Sans, Courier ≈ Mono) — Font-Einbettung wäre +0.5 MB Bundle
// (offene Frage, s. Auftrag «Ausgabe & Export»).

const MARGIN = 20;                 // mm (Spez: 18–22 mm)
const PAGE_H = 297;
const PAGE_W = 210;
const FOOTER_ZONE = 18;
const BOTTOM = PAGE_H - FOOTER_ZONE;
const USABLE = PAGE_W - 2 * MARGIN;

// Markenpalette (Web-Tokens, druckecht)
const INK: [number, number, number] = [26, 26, 23];        // --ink-900
const DEZENT: [number, number, number] = [110, 110, 100];  // --ink-500
const BRASS: [number, number, number] = [176, 141, 74];    // --brass-500 (Linien/Flächen-Akzent)
const BRASS_TEXT: [number, number, number] = [138, 106, 47]; // --brass-700 (Links/Akzent-Text)
const BRASS_FLAECHE: [number, number, number] = [241, 232, 214]; // --brass-100
const FLAECHE: [number, number, number] = [243, 241, 234]; // neutrales Hellfeld (paper-sunken-nah)
const LINIE: [number, number, number] = [215, 212, 203];
const WARN: [number, number, number] = [146, 64, 14];
const OK_GRUEN: [number, number, number] = [62, 96, 70];

const BADGE: Record<BerechnungsStatus, { fill: [number, number, number] }> = {
  ok: { fill: OK_GRUEN },
  nichtig: { fill: [153, 27, 27] },
  kein_anspruch: { fill: [153, 27, 27] },
  unzulaessig: { fill: [153, 27, 27] },
  ktg_regime: { fill: [146, 64, 14] },
};

type Schrift = { size: number; bold?: boolean; color?: [number, number, number]; font?: 'helvetica' | 'times' | 'courier' };

class Zeichner {
  doc: jsPDF;
  y = MARGIN;

  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    this.doc.setCharSpace(0);
  }

  private setSchrift(s: Schrift) {
    this.doc.setFontSize(s.size);
    this.doc.setFont(s.font ?? 'helvetica', s.bold ? 'bold' : 'normal');
    this.doc.setTextColor(...(s.color ?? INK));
  }

  /** Zeilenhöhe in mm für eine Schriftgrösse (pt). */
  zh(size: number): number {
    return size * 0.3528 * 1.35;
  }

  platz(hoehe: number) {
    if (this.y + hoehe > BOTTOM) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  zeilen(text: string, s: Schrift, breite: number): string[] {
    this.setSchrift(s);
    return this.doc.splitTextToSize(text, breite) as string[];
  }

  /** Text mit Umbruch; bricht seitenweise um (für lange Fliesstexte). */
  text(text: string, s: Schrift, x = MARGIN, breite = USABLE) {
    const zeilen = this.zeilen(text, s, breite);
    const h = this.zh(s.size);
    zeilen.forEach((zeile) => {
      this.platz(h);
      this.setSchrift(s);
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

  /** 1. Kopf: Wortmarke · Meta rechts · Titel · Rechtsgrundlage · Goldlinie */
  kopf(titel: string, rechtsgrundlage: string | undefined, erstellt: string) {
    // Wortmarke links (Serif, gesperrt), Meta rechts
    this.doc.setFont('times', 'bold');
    this.doc.setFontSize(11);
    this.doc.setTextColor(...INK);
    this.doc.setCharSpace(0.6);
    this.doc.text('LEXMETRIK', MARGIN, this.y);
    this.doc.setCharSpace(0);

    this.setSchrift({ size: 8.5, color: DEZENT });
    const meta = `Erstellt: ${erstellt}`;
    this.doc.text(meta, PAGE_W - MARGIN - this.doc.getTextWidth(meta), this.y);
    this.y += 9;

    // Dokumenttitel prominent (Display-Serife)
    this.setSchrift({ size: 19, bold: true, font: 'times' });
    const tz = this.zeilen(titel, { size: 19, bold: true, font: 'times' }, USABLE);
    tz.forEach((zeile) => { this.doc.text(zeile, MARGIN, this.y); this.y += this.zh(19); });

    if (rechtsgrundlage) {
      this.setSchrift({ size: 10, color: DEZENT });
      this.doc.text(rechtsgrundlage, MARGIN, this.y);
      this.y += this.zh(10);
    }

    // Goldlinie: Haarlinie + kräftiges Messing-Segment (wie .scale-rule im Web)
    this.y += 2;
    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.2);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.doc.setDrawColor(...BRASS);
    this.doc.setLineWidth(1.1);
    this.doc.line(MARGIN, this.y, MARGIN + 28, this.y);
    this.y += 7;
  }

  /** 2. Ergebnis-Hero: grosse Hauptkennzahl, Nebenwerte, Kontext, Status-Badge */
  hero(h: PdfHero, status: BerechnungsStatus) {
    const pad = 5;
    const innen = USABLE - 2 * pad - 2;
    const kontextZeilen = h.kontext ? this.zeilen(h.kontext, { size: 9 }, innen) : [];
    const nebenText = (h.nebenwerte ?? []).map((n) => `${n.label}: ${n.wert}`).join('   ·   ');
    const hBox =
      pad + this.zh(8) + 1            // Overline-Label
      + this.zh(20) + 1               // Hauptwert
      + (nebenText ? this.zh(9.5) + 0.5 : 0)
      + kontextZeilen.length * this.zh(9)
      + pad;
    this.platz(hBox + 4);

    // Fläche mit Messing-Akzentleiste links
    this.doc.setFillColor(...BRASS_FLAECHE);
    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(MARGIN, this.y, USABLE, hBox, 1.5, 1.5, 'FD');
    this.doc.setFillColor(...BRASS);
    this.doc.rect(MARGIN, this.y + 1, 1.4, hBox - 2, 'F');

    // Status-Badge oben rechts (dezent)
    const badgeLabel = statusLabel(status);
    this.doc.setFontSize(7.5);
    this.doc.setFont('helvetica', 'bold');
    const bw = this.doc.getTextWidth(badgeLabel) + 5;
    this.doc.setFillColor(...BADGE[status].fill);
    this.doc.roundedRect(PAGE_W - MARGIN - pad - bw, this.y + pad - 1, bw, 5, 1, 1, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(badgeLabel, PAGE_W - MARGIN - pad - bw + 2.5, this.y + pad + 2.4);

    // Inhalt
    let ty = this.y + pad + 2;
    const x = MARGIN + pad + 1.5;
    this.setSchrift({ size: 8, bold: true, color: BRASS_TEXT });
    this.doc.text(h.hauptlabel.toUpperCase(), x, ty);
    ty += this.zh(8) + 1;
    this.setSchrift({ size: 20, bold: true });
    this.doc.text(h.hauptwert, x, ty);
    ty += this.zh(20) * 0.7 + 1;
    if (nebenText) {
      this.setSchrift({ size: 9.5, color: INK });
      this.doc.text(nebenText, x, ty);
      ty += this.zh(9.5) + 0.5;
    }
    kontextZeilen.forEach((zeile) => {
      this.setSchrift({ size: 9, color: DEZENT });
      this.doc.text(zeile, x, ty);
      ty += this.zh(9);
    });

    this.y += hBox + 5;
  }

  /** 3. Eingaben-Tabelle: Label | Wert, Beträge rechtsbündig, Haarlinien. */
  tabelle(zeilen: { label: string; wert: string; rechts: boolean }[]) {
    const labelBreite = 62;
    const wertX = MARGIN + labelBreite + 4;
    const wertBreite = USABLE - labelBreite - 4;
    zeilen.forEach((z) => {
      const wertZeilen = this.zeilen(z.wert, { size: 9 }, wertBreite);
      const hZeile = Math.max(1, wertZeilen.length) * this.zh(9) + 2.4;
      this.platz(hZeile); // Tabellenzeile nicht zerreissen
      const top = this.y;
      this.setSchrift({ size: 9, color: DEZENT });
      this.doc.text(z.label, MARGIN, top + 3.2);
      this.setSchrift({ size: 9, color: INK });
      wertZeilen.forEach((wz, i) => {
        const ty = top + 3.2 + i * this.zh(9);
        if (z.rechts) {
          this.doc.text(wz, PAGE_W - MARGIN - this.doc.getTextWidth(wz), ty);
        } else {
          this.doc.text(wz, wertX, ty);
        }
      });
      this.y = top + hZeile;
      this.doc.setDrawColor(...LINIE);
      this.doc.setLineWidth(0.15);
      this.doc.line(MARGIN, this.y - 0.8, PAGE_W - MARGIN, this.y - 0.8);
    });
    this.y += 3;
  }

  /** 4. Rechenweg-Schritt — als Ganzes unzerreissbar (break-inside avoid). */
  schritt(nr: number, titel: string, formel: string, normen: { label: string; url?: string }[], rechtsprechung?: string) {
    const einzug = 7;
    const breite = USABLE - einzug;
    const titelZeilen = this.zeilen(titel, { size: 9.5, bold: true }, breite);
    const formelZeilen = formel ? this.zeilen(formel, { size: 8.5, font: 'courier' }, breite - 6) : [];
    const formelH = formelZeilen.length > 0 ? formelZeilen.length * this.zh(8.5) + 4 : 0;
    const pillH = normen.length > 0 ? 5.5 : 0;
    const rspZeilen = rechtsprechung ? this.zeilen(`Rechtsprechung: ${rechtsprechung}`, { size: 8 }, breite) : [];
    const total =
      titelZeilen.length * this.zh(9.5)
      + formelH + (formelH ? 1.5 : 0)
      + pillH + (pillH ? 1.5 : 0)
      + rspZeilen.length * this.zh(8)
      + 3.5;
    this.platz(total);

    // Schritt-Nummer in Messing
    this.setSchrift({ size: 9.5, bold: true, color: BRASS_TEXT });
    this.doc.text(`${nr}.`, MARGIN, this.y);

    // Titel (Beschreibung)
    this.setSchrift({ size: 9.5, bold: true });
    titelZeilen.forEach((zeile) => {
      this.doc.text(zeile, MARGIN + einzug, this.y);
      this.y += this.zh(9.5);
    });

    // Formel-/Ergebniszeile optisch abgesetzt (Hellfeld, Mono)
    if (formelZeilen.length > 0) {
      this.doc.setFillColor(...FLAECHE);
      this.doc.roundedRect(MARGIN + einzug, this.y - 2.2, breite, formelH, 1, 1, 'F');
      this.setSchrift({ size: 8.5, font: 'courier' });
      formelZeilen.forEach((zeile) => {
        this.doc.text(zeile, MARGIN + einzug + 3, this.y + 1.2);
        this.y += this.zh(8.5);
      });
      this.y += 3;
    }

    // Norm-Pills (klickbar; Optik wie lc-chip)
    if (normen.length > 0) {
      let px = MARGIN + einzug;
      this.doc.setFontSize(7.5);
      this.doc.setFont('courier', 'normal');
      normen.forEach((n) => {
        const w = this.doc.getTextWidth(n.label) + 4.5;
        if (px + w > PAGE_W - MARGIN) { px = MARGIN + einzug; this.y += 5.5; }
        this.doc.setFillColor(252, 251, 245);
        this.doc.setDrawColor(...LINIE);
        this.doc.setLineWidth(0.2);
        this.doc.roundedRect(px, this.y - 3.1, w, 4.6, 2.2, 2.2, 'FD');
        this.doc.setTextColor(...(n.url ? BRASS_TEXT : INK));
        if (n.url) {
          this.doc.textWithLink(n.label, px + 2.2, this.y, { url: n.url });
        } else {
          this.doc.text(n.label, px + 2.2, this.y);
        }
        px += w + 1.8;
      });
      this.y += pillH + 1.5;
    }

    // Rechtsprechung inkl. [zu verifizieren] — sichtbar, dezent
    if (rspZeilen.length > 0) {
      this.setSchrift({ size: 8, color: WARN });
      rspZeilen.forEach((zeile) => {
        this.doc.text(zeile, MARGIN + einzug, this.y);
        this.y += this.zh(8);
      });
    }
    this.y += 2.2;
  }

  /** Ergebnisbox je Abschnitt (voller Ergebnissatz — Inhalt unverändert). */
  ergebnisbox(text: string, status: BerechnungsStatus) {
    const pad = 4;
    const sText: Schrift = { size: 10.5, bold: true };
    const zeilen = this.zeilen(text, sText, USABLE - 2 * pad - 2);
    const hText = zeilen.length * this.zh(10.5);
    const hBox = pad + hText + pad - 1;
    this.platz(hBox + 2);

    this.doc.setFillColor(252, 251, 245); // paper-raised
    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(MARGIN, this.y, USABLE, hBox, 1.5, 1.5, 'FD');
    // Statusfarbene Akzentleiste links statt grossem Badge
    this.doc.setFillColor(...BADGE[status].fill);
    this.doc.rect(MARGIN, this.y + 1, 1.2, hBox - 2, 'F');

    let ty = this.y + pad + 1.5;
    this.setSchrift(sText);
    zeilen.forEach((zeile) => {
      this.doc.text(zeile, MARGIN + pad + 1.5, ty);
      ty += this.zh(10.5);
    });
    this.y += hBox + 3;
  }

  /** 6. Hinweis-/Annahmen-Box: linke Akzentleiste, kleinere Schrift. */
  hinweisbox(titel: string, eintraege: string[], ton: 'warn' | 'normal') {
    const farbe = ton === 'warn' ? WARN : DEZENT;
    const pad = 3.5;
    const einzug = 3.5;
    const breite = USABLE - 2 * pad - einzug;
    const alleZeilen = eintraege.map((e) => this.zeilen(e, { size: 8.5 }, breite));
    const hInhalt = alleZeilen.reduce((s, z) => s + z.length * this.zh(8.5) + 0.8, 0);
    const hBox = pad + this.zh(9) + 1 + hInhalt + pad - 1;
    this.platz(hBox + 2);

    this.doc.setFillColor(...(ton === 'warn' ? [248, 242, 230] as [number, number, number] : FLAECHE));
    this.doc.roundedRect(MARGIN, this.y, USABLE, hBox, 1, 1, 'F');
    this.doc.setFillColor(...farbe);
    this.doc.rect(MARGIN, this.y + 1, 1.2, hBox - 2, 'F');

    let ty = this.y + pad + 1.5;
    this.setSchrift({ size: 9, bold: true, color: farbe });
    this.doc.text(titel, MARGIN + pad + 1.5, ty);
    ty += this.zh(9) + 1;
    alleZeilen.forEach((zeilen) => {
      this.setSchrift({ size: 8.5, color: INK });
      zeilen.forEach((zeile, i) => {
        if (i === 0) this.doc.text('•', MARGIN + pad + 1.5, ty);
        this.doc.text(zeile, MARGIN + pad + 1.5 + einzug, ty);
        ty += this.zh(8.5);
      });
      ty += 0.8;
    });
    this.y += hBox + 3;
  }

  /** 5. Normverweis: klickbar + Ziel-URL sichtbar (Nachweisdokument). */
  norm(text: string, url?: string) {
    const einzug = 4;
    const s: Schrift = { size: 9, color: url ? BRASS_TEXT : INK };
    const zeilen = this.zeilen(text, s, USABLE - einzug);
    const urlZeile = url ? this.zeilen(url, { size: 7 }, USABLE - einzug) : [];
    const h = zeilen.length * this.zh(9) + urlZeile.length * this.zh(7) + 1;
    this.platz(h);
    zeilen.forEach((zeile, i) => {
      this.setSchrift(s);
      if (i === 0) { this.doc.setTextColor(...INK); this.doc.text('•', MARGIN, this.y); this.doc.setTextColor(...(s.color ?? INK)); }
      if (url) {
        this.doc.textWithLink(zeile, MARGIN + einzug, this.y, { url });
      } else {
        this.doc.text(zeile, MARGIN + einzug, this.y);
      }
      this.y += this.zh(9);
    });
    urlZeile.forEach((zeile) => {
      this.setSchrift({ size: 7, color: DEZENT });
      this.doc.text(zeile, MARGIN + einzug, this.y);
      this.y += this.zh(7);
    });
    this.y += 1;
  }

  /** 7. Disclaimer im gemeinsamen Rahmen (Layout zentral, Text vom Rechner). */
  disclaimer(text: string) {
    const pad = 4;
    const s: Schrift = { size: 8, color: DEZENT };
    const zeilen = this.zeilen(text, s, USABLE - 2 * pad);
    const titelH = this.zh(9);
    const hBox = pad + titelH + zeilen.length * this.zh(8) + pad;
    this.platz(hBox + 2);

    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(MARGIN, this.y, USABLE, hBox, 1.5, 1.5, 'D');

    let ty = this.y + pad + 1.5;
    this.setSchrift({ size: 9, bold: true, color: DEZENT });
    this.doc.text('Rechtlicher Hinweis – keine Rechtsberatung', MARGIN + pad, ty);
    ty += titelH;
    this.setSchrift(s);
    zeilen.forEach((zeile) => {
      this.doc.text(zeile, MARGIN + pad, ty);
      ty += this.zh(8);
    });
    this.y += hBox + 2;
  }

  /** 8. Fusszeile auf jeder Seite: Titel links, «Seite X von Y» + Datum rechts. */
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
      this.doc.text(titel, MARGIN, fy);
      const rechts = `Seite ${i} von ${total} · ${erstellt}`;
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
      case 'kopf':
        titel = b.titel;
        z.kopf(b.titel, b.rechtsgrundlage, b.erstellt);
        break;
      case 'hero':
        z.hero(b.hero, b.status);
        break;
      case 'tabelle':
        z.tabelle(b.zeilen);
        break;
      case 'h2':
        z.platz(14); // Überschrift nicht als Witwe ans Seitenende
        z.abstand(1.5);
        z.text(b.text, { size: 12, bold: true, font: 'times' });
        z.abstand(0.5);
        break;
      case 'h3':
        z.platz(10);
        z.abstand(1);
        z.text(b.text, { size: 10, bold: true });
        z.abstand(0.5);
        break;
      case 'ergebnisbox':
        z.ergebnisbox(b.text, b.status);
        break;
      case 'absatz':
        z.text(b.text, { size: 9, color: b.ton === 'warn' ? WARN : b.ton === 'dezent' ? DEZENT : INK });
        break;
      case 'hinweisbox':
        z.hinweisbox(b.titel, b.eintraege, b.ton);
        break;
      case 'schritt':
        z.schritt(b.nr, b.titel, b.text, b.normen, b.rechtsprechung);
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
