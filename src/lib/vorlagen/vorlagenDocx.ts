import {
  Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle,
  ShadingType, HeadingLevel,
} from 'docx';
import type { AssembleErgebnis } from './engine';
import type { PdfBanner } from './banner';

// ─── DOCX-Renderer der Vorlagen (Teil II «Ausgabe & Export») ────────────────
//
// EINE Quelle, mehrere Renderer: PDF und DOCX werden aus demselben
// AssembleErgebnis erzeugt — identischer Inhalt in jedem Format.
// Word-Formatvorlagen (Title/Heading2 + Standard-Absatzstil) statt
// Hartformatierung, damit das Dokument in Word sauber weiterbearbeitbar
// bleibt. Clientseitig, deterministisch, kein LLM.
//
// Form-Gate hat Vorrang: Vorlagen mit Eigenhändigkeitserfordernis erhalten
// KEINEN Word-Download (Entscheid je Vorlage über `output` + Wizard-Gate);
// wo DOCX zulässig ist, trägt das Dokument den Formhinweis sichtbar im Kopf.

// Reine Abbildung Modell → Absatz-Liste (testbar, ohne Packer)
export type DocxAbsatz =
  | { typ: 'banner-titel' | 'banner-text'; text: string }
  | { typ: 'titel'; text: string }
  | { typ: 'ueberschrift'; text: string }
  | { typ: 'absatz'; text: string }
  | { typ: 'disclaimer'; text: string };

export function docxAbsaetze(e: AssembleErgebnis, banner?: PdfBanner): DocxAbsatz[] {
  const liste: DocxAbsatz[] = [];
  if (banner) {
    liste.push({ typ: 'banner-titel', text: banner.titel });
    liste.push({ typ: 'banner-text', text: banner.text });
  }
  liste.push({ typ: 'titel', text: e.dokument.titel });
  e.dokument.absaetze.forEach((a) => {
    if (a.ueberschrift) liste.push({ typ: 'ueberschrift', text: a.ueberschrift });
    // \n innerhalb eines Bausteins (z. B. Listen) → je eigener Absatz
    a.text.split('\n').forEach((zeile) => liste.push({ typ: 'absatz', text: zeile }));
  });
  liste.push({ typ: 'disclaimer', text: e.dokument.disclaimer });
  liste.push({ typ: 'disclaimer', text: `Bausteine v${e.dokument.version}` });
  return liste;
}

function alsParagraph(a: DocxAbsatz): Paragraph {
  switch (a.typ) {
    case 'banner-titel':
      return new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: 'F3E2DD' },
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: a.text, bold: true, color: '7A2F23', size: 19 })],
      });
    case 'banner-text':
      return new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: 'F3E2DD' },
        spacing: { after: 240 },
        children: [new TextRun({ text: a.text, color: '7A2F23', size: 16 })],
      });
    case 'titel':
      return new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 280 },
        children: [new TextRun({ text: a.text })],
      });
    case 'ueberschrift':
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 220, after: 80 },
        children: [new TextRun({ text: a.text })],
      });
    case 'absatz':
      return new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: a.text === '' ? ' ' : a.text })],
      });
    case 'disclaimer':
      return new Paragraph({
        spacing: { before: 120 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'C9C5B9' } },
        children: [new TextRun({ text: a.text, size: 14, color: '6E6E64' })],
      });
  }
}

/** Baut das Word-Dokument (Formatvorlagen, CH-Typografie) und lädt es herunter. */
export async function vorlagenDocxErzeugen(e: AssembleErgebnis, opts: { banner?: PdfBanner; dateiName: string }) {
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Times New Roman', size: 23 } }, // 11.5pt Brottext
        title: { run: { font: 'Times New Roman', size: 32, bold: true, color: '1A1A17' } },
        heading2: { run: { font: 'Times New Roman', size: 24, bold: true, color: '1A1A17' } },
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } }, // 2 cm
      },
      children: docxAbsaetze(e, opts.banner).map(alsParagraph),
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = opts.dateiName;
  // Defensiv: Anchor ins DOM, Revoke verzögert — sonst kann der Download
  // in einzelnen Browsern abbrechen.
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// XLSX (vorbereitet, NICHT ausgeliefert): Ein künftiger Renderer dockt am
// selben AssembleErgebnis an — `export async function vorlagenXlsxErzeugen(e, opts)`
// für tabellarische Vorlagen (Aktiensplit, Stimmrechtsmatrizen). Die UI zeigt
// den Button erst, wenn eine Vorlage 'xlsx' in `output` führt.
