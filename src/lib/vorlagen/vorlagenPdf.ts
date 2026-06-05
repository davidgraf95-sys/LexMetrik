import { jsPDF } from 'jspdf';
import { winAnsiSicher, typografie } from '../pdf/winansi';

// Textaufbereitung der VORLAGEN-PDFs: WinAnsi-Sicherung + Typografie, aber
// OHNE datumNormalisieren — die Schemas formatieren Daten selbst, und eine
// pauschale ISO-Ersetzung würde Freitext verfälschen (Audit-Befund H1
// 5.6.2026: Betreibungsnummer «2025-12-31» wurde im PDF zu «31.12.2025»
// verdreht, während DOCX/Vorschau korrekt blieben — Renderer-Divergenz).
export const vorlagenPdfText = (text: string): string => winAnsiSicher(typografie(text));
const pdfText = vorlagenPdfText;
import type { AssembleErgebnis, DokumentAbsatz } from './engine';
import { FORMAT_TYPOGRAFIE, AUSGABE_REGELN , MUSTER } from './formatvorlagen';
import type { PdfBanner } from './banner';

// ─── PDF-Renderer der Vorlagen — drei Formatvorlagen ────────────────────────
//
// Layout nach den Referenz-Dokumenten «LexMetrik-Referenz-*-Layout» (5.6.2026,
// State of the Art für Schweizer Rechtsdokumente):
//   · Grundschrift Helvetica 10.5 (≈ Arial 11 der Referenz), Zeilenabstand 1.15
//   · Ränder 25 mm; zentrierte Seitenfusszeile «LexMetrik · … · Seite n/N»
//   · Disclaimer EINMAL am Dokumentende (8 pt, Haarlinie darüber) statt auf
//     jeder Seite
//   · Nummerierte Klauseln/Begehren mit HÄNGENDEM Einzug; «– »-Unterpunkte
//     doppelt eingezogen
//   · Unterschrifts-Strichzeilen (___) werden als feine LINIEN gezeichnet
// Formatvorlagen:
//   verfuegung — zentrierter Titel 16 + Haarlinie, ruhige Absätze
//   vertrag    — Titel 15.5 + Haarlinie, zentrierter Parteien-Ingress,
//                geschützter Unterschriftenblock
//   eingabe    — Briefkopf (Absender/Adressat dicht), Ort/Datum rechts,
//                Betreff 13 fett + Haarlinie, Rubrum mit zentrierten
//                Parteirollen; KEIN Dokumenttitel (der Betreff trägt ihn)
// Banner kennzeichnet den Entwurfs-Charakter. Clientseitig, deterministisch.

export type { PdfBanner } from './banner';
export { BANNER_ABSCHREIBEN, BANNER_UNTERSCHREIBEN } from './banner';

// Typografie + Ausgabe-Regeln kommen aus der deklarativen SSoT
// (formatvorlagen.ts, Grundlagen-Berichte 5.6.2026).
const EINZUG = 7;        // hängender Einzug nummerierter Klauseln (mm)
const SUB_EINZUG = 12;   // «– »-Unterpunkte

const { NUMMER, SUB, STRICHE } = MUSTER;

// Dokument bauen (testbar, gibt das jsPDF-Objekt zurück) — der Download ist
// in vorlagenPdfErzeugen gekapselt.
export function vorlagenPdfDokument(e: AssembleErgebnis, opts: { banner?: PdfBanner } = {}): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const P = FORMAT_TYPOGRAFIE[e.dokument.format];
  const REGELN = AUSGABE_REGELN[e.dokument.ausgabeArt];
  const RAND = P.randLinks;
  const BREITE = 210 - P.randLinks - P.randRechts;  // Eingaben: Korrekturrand rechts
  let y = RAND;

  const hairline = (x1: number, x2: number, staerke = 0.2, grau = 165) => {
    doc.setDrawColor(grau); doc.setLineWidth(staerke); doc.line(x1, y, x2, y);
  };

  const fusszeilen = () => {
    const seiten = doc.getNumberOfPages();
    for (let i = 1; i <= seiten; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120);
      doc.text(`LexMetrik · Orientierungsdokument, keine Rechtsberatung · Seite ${i}/${seiten}`, 105, 297 - 10, { align: 'center' });
    }
  };

  const seitenumbruch = (benoetigt: number) => {
    if (y + benoetigt > 297 - 20) { doc.addPage(); y = RAND; }
  };

  // ── Banner (Entwurfs-Kennzeichnung): Box mit Haarlinien-Rahmen ──
  if (opts.banner) {
    const txt = doc.splitTextToSize(pdfText(opts.banner.text), BREITE - 8) as string[];
    const h = 9 + txt.length * 3.6;
    doc.setFillColor(246, 238, 230);
    doc.setDrawColor(176, 141, 74); doc.setLineWidth(0.3);
    doc.rect(RAND, y, BREITE, h, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(122, 47, 35);
    doc.text(pdfText(opts.banner.titel), RAND + 4, y + 5.4);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(txt, RAND + 4, y + 9.6);
    y += h + 8;
  }

  doc.setTextColor(26, 26, 23);

  // ── Dokumenttitel + Haarlinie (Verfügung/Vertrag) ──
  if (P.titel) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(P.titel);
    doc.text(pdfText(e.dokument.titel), RAND + BREITE / 2, y + 4, { align: 'center' });
    y += 9;
    hairline(RAND, RAND + BREITE);
    y += 7;
  } else {
    y += 2;
  }

  // ── Text-Helfer ──
  const zeilenVon = (text: string, breite: number) =>
    doc.splitTextToSize(text === '' ? ' ' : pdfText(text), breite) as string[];

  const blockHoehe = (text: string, zeilenHoehe: number, breite = BREITE): number =>
    text.split('\n').reduce((h, zl) => h + zeilenVon(zl, breite).length * zeilenHoehe, 0);

  type ZeilenOpt = { align?: 'right' | 'center'; dicht?: boolean; brechen?: boolean };
  const schreibe = (text: string, opt: ZeilenOpt = {}) => {
    const zh = opt.dicht ? P.zeileDicht : P.zeile;
    for (const zl of text.split('\n')) {
      // Strichzeile → gezeichnete Unterschriftslinie
      if (STRICHE.test(zl)) {
        seitenumbruch(6);
        y += 2;
        hairline(RAND, RAND + 62, 0.3, 90);
        y += zh - 1;
        continue;
      }
      // Nummerierte Klausel: hängender Einzug
      const num = zl.match(NUMMER);
      if (num && !opt.align) {
        const rest = zl.slice(num[0].length);
        const zeilen = zeilenVon(rest, BREITE - EINZUG);
        if (opt.brechen !== false) seitenumbruch(zeilen.length * zh + 2);
        doc.text(pdfText(`${num[1]}.`), RAND, y);
        doc.text(zeilen, RAND + EINZUG, y);
        y += zeilen.length * zh;
        continue;
      }
      // «– »-Unterpunkt: doppelt eingezogen
      if (SUB.test(zl) && !opt.align) {
        const rest = zl.slice(2);
        const zeilen = zeilenVon(rest, BREITE - SUB_EINZUG);
        if (opt.brechen !== false) seitenumbruch(zeilen.length * zh + 2);
        doc.text('–', RAND + EINZUG, y);
        doc.text(zeilen, RAND + SUB_EINZUG, y);
        y += zeilen.length * zh;
        continue;
      }
      const zeilen = zeilenVon(zl, BREITE);
      if (opt.brechen !== false) seitenumbruch(zeilen.length * zh + 2);
      const x = opt.align === 'right' ? 210 - P.randRechts : opt.align === 'center' ? RAND + BREITE / 2 : RAND;
      doc.text(zeilen, x, y, opt.align ? { align: opt.align } : undefined);
      y += zeilen.length * zh;
    }
  };

  const setzeBrot = (fett = false) => { doc.setFont('helvetica', fett ? 'bold' : 'normal'); doc.setFontSize(P.brot); };

  // Block möglichst ungeteilt halten: passt er auf eine Seite, wird vorab
  // umgebrochen und ungeteilt geschrieben; ist er LÄNGER als eine Seite,
  // darf er zeilenweise brechen — sonst liefe der Text über den Seitenrand
  // hinaus (Audit-Befund H2 5.6.2026: brechen:false ohne Schranke).
  const MAX_BLOCK = 297 - 20 - RAND;
  const blockGeschuetzt = (text: string, zeilenHoehe: number, pad: number, opt: { align?: 'right' | 'center'; dicht?: boolean } = {}) => {
    const h = blockHoehe(text, zeilenHoehe);
    if (h <= MAX_BLOCK) {
      seitenumbruch(h + pad);
      schreibe(text, { ...opt, brechen: false });
    } else {
      schreibe(text, opt); // zeilenweise Umbrüche erlaubt
    }
  };

  // ── Rollen-Renderer (Brief-/Vertrags-Anatomie) ──
  const absatzRendern = (a: DokumentAbsatz) => {
    switch (a.rolle) {
      case 'absender':
      case 'adressat':
        setzeBrot();
        blockGeschuetzt(a.text, P.zeileDicht, 4, { dicht: true });
        y += a.rolle === 'adressat' ? 10 : 8;
        return;
      case 'datumzeile':
        setzeBrot();
        y += 2;
        schreibe(a.text, { align: 'right' });
        y += 8;
        return;
      case 'betreff':
        doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
        blockGeschuetzt(a.text, 5.6, 8);
        y += 1.5;
        hairline(RAND, RAND + BREITE);
        y += 7;
        return;
      case 'rubrum':
        setzeBrot();
        for (const zl of a.text.split('\n')) {
          if (/^—.*—$/.test(zl.trim())) {            // — klagende Partei —
            seitenumbruch(P.zeile + 2);
            doc.text(pdfText(zl.trim()), RAND + BREITE / 2, y, { align: 'center' });
            y += P.zeile + 2;
          } else if (zl.trim() === 'gegen') {
            seitenumbruch(P.zeile + 2);
            doc.setFont('helvetica', 'bold');
            doc.text('gegen', RAND + BREITE / 2, y, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            y += P.zeile + 2;
          } else if (zl.startsWith('betreffend ')) {
            y += 1.5;
            schreibe(zl);
          } else {
            schreibe(zl, { dicht: zl.trim() !== '' && zl !== 'in Sachen' });
            if (zl === 'in Sachen') y += 1.5;
          }
        }
        y += 7;
        return;
      case 'anrede':
        setzeBrot();
        y += 1.5;
        schreibe(a.text);
        y += 4;
        return;
      case 'schlussformel':
        setzeBrot();
        y += 4;
        schreibe(a.text);
        y += 2;
        return;
      case 'parteien':
        setzeBrot();
        blockGeschuetzt(a.text, P.zeile, 4, { align: 'center' });
        y += 8;
        return;
      case 'unterschrift':
        setzeBrot();
        y += 5;
        blockGeschuetzt(a.text, P.zeile, 8);
        y += P.absatzGap;
        return;
      default: {
        if (a.ueberschrift) {
          y += P.ueberschriftVor;
          setzeBrot();
          const erste = zeilenVon(a.text.split('\n')[0] || ' ', BREITE).length * P.zeile;
          seitenumbruch(7 + erste + 2);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(P.ueberschrift);
          doc.text(pdfText(a.ueberschrift), RAND, y);
          y += P.ueberschriftNach;
        }
        setzeBrot();
        schreibe(a.text);
        y += P.absatzGap;
      }
    }
  };

  e.dokument.absaetze.forEach(absatzRendern);

  // ── Disclaimer einmal am Dokumentende (8 pt, Haarlinie darüber) ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const disc = doc.splitTextToSize(pdfText(e.dokument.disclaimer), BREITE) as string[];
  seitenumbruch(disc.length * 3.6 + 14);
  y += 8;
  hairline(RAND, RAND + BREITE);
  y += 4;
  doc.setTextColor(110);
  doc.text(disc, RAND, y);
  y += disc.length * 3.6 + 1.5;
  doc.text(pdfText(`Bausteine v${e.dokument.version}`), RAND, y);

  // Wasserzeichen (Form-Gate «entwurf»: kein gültiges Enddokument)
  if (REGELN.wasserzeichen) {
    const seiten = doc.getNumberOfPages();
    for (let i = 1; i <= seiten; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(96);
      doc.setTextColor(225);
      doc.text(REGELN.wasserzeichen, 105, 175, { align: 'center', angle: 45 });
    }
    doc.setTextColor(26, 26, 23);
  }

  fusszeilen();
  return doc;
}

export function vorlagenPdfErzeugen(e: AssembleErgebnis, opts: { banner?: PdfBanner; dateiName: string }) {
  vorlagenPdfDokument(e, opts).save(opts.dateiName);
}
