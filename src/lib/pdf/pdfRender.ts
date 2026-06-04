import { jsPDF } from 'jspdf';
import type { BerechnungsStatus } from '../../types/legal';
import { buildPdfModel, statusLabel, type PdfDocConfig, type PdfModel, type PdfHero } from './pdfModel';
import { registriereBerichtFonts } from './fonts';

// ─── Zeichnung des Dokumentmodells mit jsPDF ──────────────────────────────
//
// State-of-the-art-Bericht mit eingebetteten Markenschriften:
// Fraunces (Display-Serife: Titel, Sektionsköpfe) · Geist (Sans: Lauftext)
// · Geist Mono (Kennzahlen, Overlines, Pills, Formeln) — exakt die Web-
// Typografie. Layout: A4, 20-mm-Raster, Lexmetrik-Kopf mit Goldlinie,
// Ergebnis-Hero, Eingaben-Tabelle, unzerreissbare Rechenweg-Schritte mit
// klickbaren Norm-Pills, sichtbare Fedlex-URLs, Fusszeile «Seite X von Y».
// Die Fonts (~0.4 MB) liegen NUR in diesem lazy geladenen Chunk.

const MARGIN = 20;
const PAGE_H = 297;
const PAGE_W = 210;
const FOOTER_ZONE = 18;
const BOTTOM = PAGE_H - FOOTER_ZONE;
const USABLE = PAGE_W - 2 * MARGIN;

// Markenpalette (Web-Tokens, druckecht)
const INK: [number, number, number] = [26, 26, 23];          // --ink-900
const INK_700: [number, number, number] = [58, 58, 51];      // --ink-700
const DEZENT: [number, number, number] = [110, 110, 100];    // --ink-500
const BRASS: [number, number, number] = [176, 141, 74];      // --brass-500
const BRASS_TEXT: [number, number, number] = [138, 106, 47]; // --brass-700
const BRASS_FLAECHE: [number, number, number] = [241, 232, 214]; // --brass-100
const FLAECHE: [number, number, number] = [243, 241, 234];   // Hellfeld
const PAPIER_HELL: [number, number, number] = [252, 251, 245]; // --paper-raised
const LINIE: [number, number, number] = [219, 216, 207];
const WARN: [number, number, number] = [146, 64, 14];
const OK_GRUEN: [number, number, number] = [62, 96, 70];
const ROT: [number, number, number] = [153, 27, 27];

const STATUS_FARBE: Record<BerechnungsStatus, [number, number, number]> = {
  ok: OK_GRUEN,
  nichtig: ROT,
  kein_anspruch: ROT,
  unzulaessig: ROT,
  ktg_regime: WARN,
};

type Font = 'Geist' | 'Fraunces' | 'GeistMono';
type Schrift = { size: number; bold?: boolean; color?: [number, number, number]; font?: Font; sperrung?: number };

class Zeichner {
  doc: jsPDF;
  y = MARGIN;

  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    registriereBerichtFonts(this.doc);
    this.doc.setCharSpace(0);
  }

  private setSchrift(s: Schrift) {
    this.doc.setFontSize(s.size);
    this.doc.setFont(s.font ?? 'Geist', s.bold ? 'bold' : 'normal');
    this.doc.setTextColor(...(s.color ?? INK));
    this.doc.setCharSpace(s.sperrung ?? 0);
  }

  zh(size: number): number {
    return size * 0.3528 * 1.4;
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

  text(text: string, s: Schrift, x = MARGIN, breite = USABLE) {
    const zeilen = this.zeilen(text, s, breite);
    const h = this.zh(s.size);
    zeilen.forEach((zeile) => {
      this.platz(h);
      this.setSchrift(s);
      this.doc.text(zeile, x, this.y);
      this.y += h;
    });
    this.doc.setCharSpace(0);
  }

  abstand(mm: number) {
    this.y += mm;
  }

  trenner() {
    this.platz(7);
    this.y += 1.5;
    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.2);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 5.5;
  }

  /** Mono-Overline (Versalien, gesperrt) — die Web-«lc-overline». */
  private overline(text: string, x: number, y: number, color: [number, number, number]) {
    this.doc.setFont('GeistMono', 'normal');
    this.doc.setFontSize(7);
    this.doc.setTextColor(...color);
    this.doc.setCharSpace(0.45);
    this.doc.text(text.toUpperCase(), x, y);
    this.doc.setCharSpace(0);
  }

  private overlineBreite(text: string): number {
    this.doc.setFont('GeistMono', 'normal');
    this.doc.setFontSize(7);
    this.doc.setCharSpace(0.45);
    const w = this.doc.getTextWidth(text.toUpperCase());
    this.doc.setCharSpace(0);
    return w;
  }

  /** 1. Kopf: Wortmarke · Meta · Fraunces-Titel · Rechtsgrundlage · Goldlinie */
  kopf(titel: string, rechtsgrundlage: string | undefined, erstellt: string) {
    this.overline('Lexmetrik', MARGIN, this.y, BRASS_TEXT);
    this.doc.setFont('GeistMono', 'normal');
    this.doc.setFontSize(7);
    this.doc.setTextColor(...DEZENT);
    const meta = `Erstellt: ${erstellt}`;
    this.doc.text(meta, PAGE_W - MARGIN - this.doc.getTextWidth(meta), this.y);
    this.y += 10;

    this.setSchrift({ size: 23, font: 'Fraunces' });
    const tz = this.zeilen(titel, { size: 23, font: 'Fraunces' }, USABLE);
    tz.forEach((zeile) => { this.doc.text(zeile, MARGIN, this.y); this.y += this.zh(23) * 0.92; });
    this.y += 1;

    if (rechtsgrundlage) {
      this.setSchrift({ size: 9.5, color: DEZENT });
      this.doc.text(rechtsgrundlage, MARGIN, this.y);
      this.y += this.zh(9.5);
    }

    // Goldlinie wie .scale-rule: Haarlinie + kräftiges Messing-Segment
    this.y += 2.5;
    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.2);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.doc.setDrawColor(...BRASS);
    this.doc.setLineWidth(1.2);
    this.doc.line(MARGIN, this.y, MARGIN + 30, this.y);
    this.y += 8;
  }

  /** Sektionskopf wie die Web-«SectionHead»: Mono-Overline + Haarlinie rechts. */
  sektionskopf(text: string) {
    this.platz(16);
    this.y += 2;
    this.overline(text, MARGIN, this.y, INK_700);
    const w = this.overlineBreite(text);
    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.2);
    this.doc.line(MARGIN + w + 4, this.y - 1, PAGE_W - MARGIN, this.y - 1);
    this.y += 6;
  }

  /** 2. Ergebnis-Hero: Kennzahl in Geist Mono, Overline, Kontext, Status. */
  hero(h: PdfHero, status: BerechnungsStatus) {
    const pad = 6;
    const x = MARGIN + pad + 1.5;
    const innen = USABLE - 2 * pad - 3;
    const kontextZeilen = h.kontext ? this.zeilen(h.kontext, { size: 8.5 }, innen) : [];
    const neben = h.nebenwerte ?? [];
    const hBox =
      pad + 3                          // Overline
      + this.zh(24) * 0.82             // Hauptwert
      + (neben.length ? this.zh(9.5) + 2 : 0)
      + (kontextZeilen.length ? kontextZeilen.length * this.zh(8.5) + 1.5 : 0)
      + pad - 1;
    this.platz(hBox + 5);

    // Fläche mit Messing-Akzentleiste links
    this.doc.setFillColor(...BRASS_FLAECHE);
    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.25);
    this.doc.roundedRect(MARGIN, this.y, USABLE, hBox, 1.8, 1.8, 'FD');
    this.doc.setFillColor(...BRASS);
    this.doc.rect(MARGIN, this.y + 1.2, 1.5, hBox - 2.4, 'F');

    // Status dezent: farbiger Punkt + Mono-Label oben rechts
    const badgeLabel = statusLabel(status);
    this.doc.setFont('GeistMono', 'normal');
    this.doc.setFontSize(6.8);
    this.doc.setCharSpace(0.35);
    const bw = this.doc.getTextWidth(badgeLabel.toUpperCase());
    const bx = PAGE_W - MARGIN - pad - bw;
    this.doc.setTextColor(...STATUS_FARBE[status]);
    this.doc.text(badgeLabel.toUpperCase(), bx, this.y + pad + 0.5);
    this.doc.setCharSpace(0);
    this.doc.setFillColor(...STATUS_FARBE[status]);
    this.doc.circle(bx - 3, this.y + pad - 0.4, 0.9, 'F');

    // Inhalt
    let ty = this.y + pad + 0.5;
    this.overline(h.hauptlabel, x, ty, BRASS_TEXT);
    ty += this.zh(24) * 0.82;
    this.setSchrift({ size: 24, font: 'GeistMono' });
    this.doc.text(h.hauptwert, x, ty);

    if (neben.length) {
      ty += this.zh(9.5) + 2 - 1;
      let nx = x;
      neben.forEach((n, i) => {
        if (i > 0) {
          this.setSchrift({ size: 9, color: DEZENT });
          this.doc.text('·', nx + 2, ty);
          nx += 6;
        }
        this.setSchrift({ size: 9, color: DEZENT });
        this.doc.text(`${n.label} `, nx, ty);
        nx += this.doc.getTextWidth(`${n.label} `) + 1;
        this.setSchrift({ size: 9.5, font: 'GeistMono', color: INK });
        this.doc.text(n.wert, nx, ty);
        nx += this.doc.getTextWidth(n.wert);
      });
    }
    if (kontextZeilen.length) {
      ty += this.zh(8.5) + 1.5;
      kontextZeilen.forEach((zeile) => {
        this.setSchrift({ size: 8.5, color: DEZENT });
        this.doc.text(zeile, x, ty);
        ty += this.zh(8.5);
      });
      ty -= this.zh(8.5);
    }

    this.y += hBox + 6;
  }

  /** 3. Eingaben-Tabelle: Label | Wert, Zahlen in Mono rechtsbündig. */
  tabelle(zeilen: { label: string; wert: string; rechts: boolean }[]) {
    const labelBreite = 62;
    const wertX = MARGIN + labelBreite + 4;
    const wertBreite = USABLE - labelBreite - 4;
    zeilen.forEach((z, idx) => {
      const wertSchrift: Schrift = z.rechts ? { size: 9, font: 'GeistMono' } : { size: 9 };
      const wertZeilen = this.zeilen(z.wert, wertSchrift, wertBreite);
      const hZeile = Math.max(1, wertZeilen.length) * this.zh(9) + 2.6;
      this.platz(hZeile);
      const top = this.y;
      this.setSchrift({ size: 8.5, color: DEZENT });
      this.doc.text(z.label, MARGIN, top + 3.4);
      this.setSchrift(wertSchrift);
      wertZeilen.forEach((wz, i) => {
        const ty = top + 3.4 + i * this.zh(9);
        if (z.rechts) {
          this.doc.text(wz, PAGE_W - MARGIN - this.doc.getTextWidth(wz), ty);
        } else {
          this.doc.text(wz, wertX, ty);
        }
      });
      this.y = top + hZeile;
      if (idx < zeilen.length - 1) {
        this.doc.setDrawColor(...LINIE);
        this.doc.setLineWidth(0.12);
        this.doc.line(MARGIN, this.y - 0.9, PAGE_W - MARGIN, this.y - 0.9);
      }
    });
    this.y += 3.5;
  }

  /** 4. Rechenweg-Schritt — als Ganzes unzerreissbar. */
  schritt(nr: number, titel: string, formel: string, normen: { label: string; url?: string }[], rechtsprechung?: string) {
    const einzug = 8;
    const breite = USABLE - einzug;
    const titelZeilen = this.zeilen(titel, { size: 9.5, bold: true }, breite);
    const formelZeilen = formel ? this.zeilen(formel, { size: 8, font: 'GeistMono' }, breite - 7) : [];
    const formelH = formelZeilen.length > 0 ? formelZeilen.length * this.zh(8) + 4.5 : 0;

    // Pill-Zeilen vorab messen (Umbrüche kumulieren wie beim Zeichnen)
    let pillZeilen = 0;
    if (normen.length > 0) {
      pillZeilen = 1;
      this.doc.setFont('GeistMono', 'normal');
      this.doc.setFontSize(7);
      let mx = MARGIN + einzug;
      normen.forEach((n) => {
        const w = this.doc.getTextWidth(n.label) + 5;
        if (mx + w > PAGE_W - MARGIN) { mx = MARGIN + einzug; pillZeilen++; }
        mx += w + 2;
      });
    }
    const pillH = pillZeilen * 6;
    const rspZeilen = rechtsprechung ? this.zeilen(`Rechtsprechung: ${rechtsprechung}`, { size: 7.5 }, breite) : [];
    const total =
      titelZeilen.length * this.zh(9.5)
      + formelH + (formelH ? 1.5 : 0)
      + pillH + (pillH ? 1.5 : 0)
      + rspZeilen.length * this.zh(7.5)
      + 4;
    this.platz(total);

    // Schritt-Nummer in Messing (Mono)
    this.setSchrift({ size: 9, font: 'GeistMono', color: BRASS_TEXT });
    this.doc.text(String(nr).padStart(2, '0'), MARGIN, this.y);

    this.setSchrift({ size: 9.5, bold: true, color: INK_700 });
    titelZeilen.forEach((zeile) => {
      this.doc.text(zeile, MARGIN + einzug, this.y);
      this.y += this.zh(9.5);
    });

    // Formel-/Ergebniszeile abgesetzt: Hellfeld + Messing-Haarleiste links
    if (formelZeilen.length > 0) {
      this.doc.setFillColor(...FLAECHE);
      this.doc.roundedRect(MARGIN + einzug, this.y - 2.4, breite, formelH, 1, 1, 'F');
      this.doc.setFillColor(...BRASS);
      this.doc.rect(MARGIN + einzug, this.y - 1.6, 0.8, formelH - 1.6, 'F');
      this.setSchrift({ size: 8, font: 'GeistMono', color: INK });
      formelZeilen.forEach((zeile) => {
        this.doc.text(zeile, MARGIN + einzug + 3.5, this.y + 1.2);
        this.y += this.zh(8);
      });
      this.y += 3.5;
    }

    // Norm-Pills (klickbar, lc-chip-Optik: Mono, Hellgrund, Haarrand)
    if (normen.length > 0) {
      let px = MARGIN + einzug;
      this.doc.setFont('GeistMono', 'normal');
      this.doc.setFontSize(7);
      normen.forEach((n) => {
        const w = this.doc.getTextWidth(n.label) + 5;
        if (px + w > PAGE_W - MARGIN) { px = MARGIN + einzug; this.y += 6; }
        this.doc.setFillColor(...PAPIER_HELL);
        this.doc.setDrawColor(...LINIE);
        this.doc.setLineWidth(0.2);
        this.doc.roundedRect(px, this.y - 3.2, w, 4.8, 2.4, 2.4, 'FD');
        this.doc.setTextColor(...(n.url ? BRASS_TEXT : INK_700));
        if (n.url) {
          this.doc.textWithLink(n.label, px + 2.5, this.y, { url: n.url });
        } else {
          this.doc.text(n.label, px + 2.5, this.y);
        }
        px += w + 2;
      });
      this.y += 6 + 1.5;
    }

    if (rspZeilen.length > 0) {
      this.setSchrift({ size: 7.5, color: WARN });
      rspZeilen.forEach((zeile) => {
        this.doc.text(zeile, MARGIN + einzug, this.y);
        this.y += this.zh(7.5);
      });
    }
    this.y += 2.4;
  }

  /** Ergebnisbox je Abschnitt (voller Ergebnissatz — Inhalt unverändert). */
  ergebnisbox(text: string, status: BerechnungsStatus) {
    const pad = 4.5;
    const sText: Schrift = { size: 10, bold: true, color: INK };
    const zeilen = this.zeilen(text, sText, USABLE - 2 * pad - 2);
    const hText = zeilen.length * this.zh(10);
    const hBox = pad + hText + pad - 1.5;
    this.platz(hBox + 3);

    this.doc.setFillColor(...PAPIER_HELL);
    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.25);
    this.doc.roundedRect(MARGIN, this.y, USABLE, hBox, 1.8, 1.8, 'FD');
    this.doc.setFillColor(...STATUS_FARBE[status]);
    this.doc.rect(MARGIN, this.y + 1.2, 1.3, hBox - 2.4, 'F');

    let ty = this.y + pad + 1.8;
    this.setSchrift(sText);
    zeilen.forEach((zeile) => {
      this.doc.text(zeile, MARGIN + pad + 1.8, ty);
      ty += this.zh(10);
    });
    this.y += hBox + 4;
  }

  /** 6. Hinweis-/Annahmen-Box: linke Akzentleiste, kleinere Schrift. */
  hinweisbox(titel: string, eintraege: string[], ton: 'warn' | 'normal') {
    const farbe = ton === 'warn' ? WARN : DEZENT;
    const pad = 4;
    const einzug = 3.5;
    const breite = USABLE - 2 * pad - einzug;
    const alleZeilen = eintraege.map((e) => this.zeilen(e, { size: 8.5 }, breite));
    const hInhalt = alleZeilen.reduce((s, z) => s + z.length * this.zh(8.5) + 0.9, 0);
    const hBox = pad + 3 + 2 + hInhalt + pad - 2;
    this.platz(hBox + 3);

    this.doc.setFillColor(...(ton === 'warn' ? [248, 242, 230] as [number, number, number] : FLAECHE));
    this.doc.roundedRect(MARGIN, this.y, USABLE, hBox, 1.2, 1.2, 'F');
    this.doc.setFillColor(...farbe);
    this.doc.rect(MARGIN, this.y + 1.2, 1.3, hBox - 2.4, 'F');

    let ty = this.y + pad + 1.2;
    this.overline(titel, MARGIN + pad + 1.8, ty, farbe);
    ty += 5;
    alleZeilen.forEach((zeilen) => {
      this.setSchrift({ size: 8.5, color: INK_700 });
      zeilen.forEach((zeile, i) => {
        if (i === 0) this.doc.text('–', MARGIN + pad + 1.8, ty);
        this.doc.text(zeile, MARGIN + pad + 1.8 + einzug, ty);
        ty += this.zh(8.5);
      });
      ty += 0.9;
    });
    this.y += hBox + 4;
  }

  /** 5. Normverweis: klickbar + Ziel-URL sichtbar (Nachweisdokument). */
  norm(text: string, url?: string) {
    const einzug = 4.5;
    const s: Schrift = { size: 9, color: url ? BRASS_TEXT : INK };
    const zeilen = this.zeilen(text, s, USABLE - einzug);
    const urlZeilen = url ? this.zeilen(url, { size: 6.8, font: 'GeistMono' }, USABLE - einzug) : [];
    const h = zeilen.length * this.zh(9) + urlZeilen.length * this.zh(6.8) + 1.4;
    this.platz(h);
    zeilen.forEach((zeile, i) => {
      this.setSchrift(s);
      if (i === 0) {
        this.doc.setTextColor(...BRASS);
        this.doc.text('—', MARGIN, this.y);
        this.doc.setTextColor(...(s.color ?? INK));
      }
      if (url) {
        this.doc.textWithLink(zeile, MARGIN + einzug, this.y, { url });
      } else {
        this.doc.text(zeile, MARGIN + einzug, this.y);
      }
      this.y += this.zh(9);
    });
    urlZeilen.forEach((zeile) => {
      this.setSchrift({ size: 6.8, font: 'GeistMono', color: DEZENT });
      this.doc.text(zeile, MARGIN + einzug, this.y);
      this.y += this.zh(6.8);
    });
    this.y += 1.4;
  }

  /** 7. Disclaimer im gemeinsamen Rahmen. */
  disclaimer(text: string) {
    const pad = 4.5;
    const s: Schrift = { size: 7.8, color: DEZENT };
    const zeilen = this.zeilen(text, s, USABLE - 2 * pad);
    const hBox = pad + 3 + 2.5 + zeilen.length * this.zh(7.8) + pad - 1.5;
    this.platz(hBox + 2);

    this.doc.setDrawColor(...LINIE);
    this.doc.setLineWidth(0.25);
    this.doc.roundedRect(MARGIN, this.y, USABLE, hBox, 1.8, 1.8, 'D');

    let ty = this.y + pad + 1;
    this.overline('Rechtlicher Hinweis — keine Rechtsberatung', MARGIN + pad, ty, DEZENT);
    ty += 5.5;
    this.setSchrift(s);
    zeilen.forEach((zeile) => {
      this.doc.text(zeile, MARGIN + pad, ty);
      ty += this.zh(7.8);
    });
    this.y += hBox + 2;
  }

  /** 8. Fusszeile auf jeder Seite. */
  fusszeilen(titel: string, erstellt: string) {
    const total = this.doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      this.doc.setPage(i);
      this.doc.setFont('GeistMono', 'normal');
      this.doc.setFontSize(6.8);
      this.doc.setTextColor(...DEZENT);
      this.doc.setDrawColor(...LINIE);
      this.doc.setLineWidth(0.2);
      const fy = PAGE_H - 12;
      this.doc.line(MARGIN, fy - 4, PAGE_W - MARGIN, fy - 4);
      this.doc.setDrawColor(...BRASS);
      this.doc.setLineWidth(0.8);
      this.doc.line(MARGIN, fy - 4, MARGIN + 12, fy - 4);
      this.doc.setCharSpace(0.3);
      this.doc.text(`LEXMETRIK · ${titel}`, MARGIN, fy);
      const rechts = `Seite ${i} von ${total} · ${erstellt}`;
      this.doc.text(rechts, PAGE_W - MARGIN - this.doc.getTextWidth(rechts), fy);
      this.doc.setCharSpace(0);
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
        z.sektionskopf(b.text);
        break;
      case 'h3':
        z.platz(10);
        z.abstand(1);
        z.text(b.text, { size: 9.5, bold: true, color: INK_700 });
        z.abstand(1);
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
