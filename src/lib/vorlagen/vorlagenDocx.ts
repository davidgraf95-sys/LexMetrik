import {
  Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle,
  ShadingType, HeadingLevel, Footer, PageNumber,
} from 'docx';
import type { AssembleErgebnis, AbsatzRolle, VorlageFormat } from './engine';
import { FORMAT_TYPOGRAFIE, AUSGABE_REGELN , MUSTER, ROLLEN_DOCX, ROLLEN_PDF } from './formatvorlagen';
import type { PdfBanner } from './banner';

// ─── DOCX-Renderer der Vorlagen – Referenz-Layout ───────────────────────────
//
// EINE Quelle, mehrere Renderer: PDF und DOCX entstehen aus demselben
// AssembleErgebnis. Layout nach den Referenz-Dokumenten
// «LexMetrik-Referenz-*-Layout» (5.6.2026):
//   · Arial 11, Zeilenabstand 1.15, Ränder 2.5 cm
//   · zentrierte Fusszeile «LexMetrik · … · Seite N» auf jeder Seite
//   · Titel zentriert (17 fett) mit Haarlinie; Eingaben stattdessen mit
//     fettem Betreff (13) + Haarlinie
//   · nummerierte Klauseln/Begehren mit hängendem Einzug, «– »-Unterpunkte
//     doppelt eingezogen; Adress-/Parteiblöcke zeilendicht
//   · Unterschrifts-Strichzeilen als feine Linie (Rahmen unten)
//   · Disclaimer 8 pt mit Haarlinie am Dokumentende
// Word-Formatvorlagen (Title/Heading2) bleiben erhalten, damit das Dokument
// in Word sauber weiterbearbeitbar ist. Clientseitig, deterministisch.
//
// Form-Gate hat Vorrang: Vorlagen mit Eigenhändigkeitserfordernis erhalten
// KEINEN Word-Download (Entscheid je Vorlage über `output` + Wizard-Gate).

// Reine Abbildung Modell → Absatz-Liste (testbar, ohne Packer).
export type DocxAbsatz =
  | { typ: 'banner-titel' | 'banner-text'; text: string }
  | { typ: 'titel'; text: string }
  | { typ: 'ueberschrift'; text: string }
  | { typ: 'absatz'; text: string; rolle?: AbsatzRolle; blockEnde?: boolean; stricheErlaubt?: boolean }
  | { typ: 'disclaimer'; text: string };

export function docxAbsaetze(e: AssembleErgebnis, banner?: PdfBanner): DocxAbsatz[] {
  const liste: DocxAbsatz[] = [];
  // Form-Gate «entwurf»: Hinweiszeile statt PDF-Wasserzeichen (SSoT formatvorlagen.ts)
  const hinweis = AUSGABE_REGELN[e.dokument.ausgabeArt].hinweisZeile;
  if (hinweis) liste.push({ typ: 'banner-titel', text: hinweis });
  if (banner) {
    liste.push({ typ: 'banner-titel', text: banner.titel });
    liste.push({ typ: 'banner-text', text: banner.text });
  }
  // Eingaben tragen ihren «Titel» im fetten Betreff – kein Dokumenttitel.
  if (e.dokument.format !== 'eingabe') liste.push({ typ: 'titel', text: e.dokument.titel });
  e.dokument.absaetze.forEach((a) => {
    if (a.ueberschrift) liste.push({ typ: 'ueberschrift', text: a.ueberschrift });
    // \n innerhalb eines Bausteins (Listen, Adressblöcke) → je eigener Absatz
    const zeilen = a.text.split('\n');
    zeilen.forEach((zeile, i) => liste.push({
      typ: 'absatz', text: zeile,
      // Strichzeilen-Lizenz = Engine-Boolean (assemble), /simplify 7.6.2026.
      ...(a.stricheErlaubt ? { stricheErlaubt: true } : {}),
      ...(a.rolle ? { rolle: a.rolle, blockEnde: i === zeilen.length - 1 } : {}),
    }));
  });
  liste.push({ typ: 'disclaimer', text: e.dokument.disclaimer });
  liste.push({ typ: 'disclaimer', text: `Bausteine v${e.dokument.version}` });
  return liste;
}

const { NUMMER, SUB, STRICHE } = MUSTER;
const HAARLINIE = { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'B9B5A9' } };

// Haarlinie unter Titel/Betreff (eigener leerer Absatz mit Rahmen unten)
const linieAbsatz = (after = 160) => new Paragraph({
  border: HAARLINIE, spacing: { after }, children: [new TextRun({ text: '' })],
});

function alsParagraphe(a: DocxAbsatz, format: VorlageFormat): Paragraph[] {
  switch (a.typ) {
    case 'banner-titel':
      return [new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: 'F6EEE6' },
        border: {
          top: { style: BorderStyle.SINGLE, size: 6, color: 'B08D4A' },
          left: { style: BorderStyle.SINGLE, size: 6, color: 'B08D4A' },
          right: { style: BorderStyle.SINGLE, size: 6, color: 'B08D4A' },
        },
        spacing: { before: 60, after: 40 },
        children: [new TextRun({ text: a.text, bold: true, color: '7A2F23', size: 20 })],
      })];
    case 'banner-text':
      return [new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: 'F6EEE6' },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: 'B08D4A' },
          left: { style: BorderStyle.SINGLE, size: 6, color: 'B08D4A' },
          right: { style: BorderStyle.SINGLE, size: 6, color: 'B08D4A' },
        },
        spacing: { after: 300 },
        children: [new TextRun({ text: a.text, color: '7A2F23', size: 16 })],
      })];
    case 'titel':
      return [
        new Paragraph({
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [new TextRun({ text: a.text })],
        }),
        linieAbsatz(),
      ];
    case 'ueberschrift':
      return [new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        keepNext: true,
        children: [new TextRun({ text: a.text })],
      })];
    case 'absatz':
      return [absatzParagraph(a, format)];
    case 'disclaimer':
      return [new Paragraph({
        spacing: a.text.startsWith('Bausteine v') ? { before: 40, after: 0 } : { before: 360, after: 0 },
        ...(a.text.startsWith('Bausteine v') ? {} : { border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'C9C5B9' } } }),
        children: [new TextRun({ text: a.text, size: 16, color: '6E6E64' })],
      })];
  }
}

function absatzParagraph(a: Extract<DocxAbsatz, { typ: 'absatz' }>, format: VorlageFormat): Paragraph {
  const text = a.text === '' ? ' ' : a.text;
  const dicht = { after: 0, line: ROLLEN_DOCX.dichtLine, lineRule: 'auto' as const };

  // Unterschrifts-Strichzeile → feine Linie (Rahmen unten, ~5.5 cm)
  if (a.stricheErlaubt && STRICHE.test(a.text)) {
    return new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '5A5A52' } },
      indent: { right: ROLLEN_DOCX.unterschriftLinieIndentRechts },
      spacing: { before: ROLLEN_DOCX.unterschriftLinieVor, after: 0 },
      keepLines: true,
      children: [new TextRun({ text: '' })],
    });
  }

  switch (a.rolle) {
    case 'absender':
    case 'adressat':
      return new Paragraph({
        spacing: a.blockEnde ? { after: a.rolle === 'adressat' ? ROLLEN_DOCX.adressatNach : ROLLEN_DOCX.absenderNach, line: ROLLEN_DOCX.dichtLine, lineRule: 'auto' } : dicht,
        children: [new TextRun({ text })],
      });
    case 'datumzeile':
      return new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: ROLLEN_DOCX.datumVor, after: ROLLEN_DOCX.datumNach },
        children: [new TextRun({ text })],
      });
    case 'betreff':
      return new Paragraph({
        spacing: { after: ROLLEN_DOCX.betreffNach },
        border: HAARLINIE,
        children: [new TextRun({ text, bold: true, size: ROLLEN_PDF.betreffGroesse * 2 })],
      });
    case 'rubrum': {
      if (MUSTER.RUBRUM_ROLLE.test(a.text.trim())) {
        return new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: ROLLEN_DOCX.rubrumRolleVor, after: ROLLEN_DOCX.rubrumRolleNach },
          children: [new TextRun({ text: a.text.trim() })],
        });
      }
      if (a.text.trim() === 'gegen') {
        return new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: ROLLEN_DOCX.rubrumGegenNach },
          children: [new TextRun({ text: 'gegen', bold: true })],
        });
      }
      if (a.text === 'in Sachen') {
        return new Paragraph({ spacing: { after: ROLLEN_DOCX.rubrumInSachenNach }, children: [new TextRun({ text })] });
      }
      if (a.text.startsWith('betreffend ')) {
        return new Paragraph({ spacing: { before: ROLLEN_DOCX.rubrumBetreffendVor, after: ROLLEN_DOCX.rubrumBetreffendNach }, children: [new TextRun({ text })] });
      }
      return new Paragraph({ spacing: dicht, children: [new TextRun({ text })] });
    }
    case 'anrede':
      return new Paragraph({
        spacing: { before: ROLLEN_DOCX.anredeVor, after: ROLLEN_DOCX.anredeNach },
        children: [new TextRun({ text })],
      });
    case 'schlussformel':
      return new Paragraph({
        spacing: { before: ROLLEN_DOCX.schlussformelVor, after: ROLLEN_DOCX.schlussformelNach },
        children: [new TextRun({ text })],
      });
    case 'parteien':
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: a.blockEnde ? { after: ROLLEN_DOCX.parteienBlockNach } : { after: ROLLEN_DOCX.parteienZwischen },
        children: [new TextRun({ text })],
      });
    case 'unterschrift':
      return new Paragraph({
        spacing: { after: ROLLEN_DOCX.unterschriftNach, line: ROLLEN_DOCX.dichtLine, lineRule: 'auto' },
        keepLines: true, keepNext: !a.blockEnde,
        children: [new TextRun({ text })],
      });
    default: {
      // Nummerierte Klausel → hängender Einzug (wie Referenz num-Listen)
      if (NUMMER.test(a.text)) {
        return new Paragraph({
          indent: { left: ROLLEN_DOCX.nummerLinks, hanging: ROLLEN_DOCX.nummerHaengend },
          spacing: { after: ROLLEN_DOCX.nummerNach },
          children: [new TextRun({ text: text.replace(NUMMER, (m) => m.trimEnd() + '\t') })],
        });
      }
      // «– »-Unterpunkt → doppelt eingezogen
      if (SUB.test(a.text)) {
        return new Paragraph({
          indent: { left: ROLLEN_DOCX.subLinks, hanging: ROLLEN_DOCX.subHaengend },
          spacing: { after: ROLLEN_DOCX.subNach },
          children: [new TextRun({ text: '–\t' + text.slice(2) })],
        });
      }
      return new Paragraph({
        spacing: { after: format === 'eingabe' ? ROLLEN_DOCX.absatzNachEingabe : ROLLEN_DOCX.absatzNachSonst },
        children: [new TextRun({ text })],
      });
    }
  }
}

/** Baut das Word-Dokument (Referenz-Layout, CH-Typografie) und gibt es als
 *  Blob zurück — Gegenstück zu vorlagenPdfDokument (Sammel-Downloads packen
 *  den Blob selbst, z. B. ins Gründungs-ZIP; Auftrag David 7.6.2026). */
export async function vorlagenDocxDokument(e: AssembleErgebnis, opts: { banner?: PdfBanner } = {}): Promise<Blob> {
  // Form-Gate-Matrix hart kodiert: Eigenhändigkeits-Dokumente (abschrift)
  // erhalten NIE einen Word-Export – es entstünde ein unterschriftsreif
  // wirkendes Dokument für ein eigenhändigkeitspflichtiges Geschäft.
  if (!AUSGABE_REGELN[e.dokument.ausgabeArt].docxErlaubt) {
    throw new Error('Word-Export ist für Abschreibe-Mustertexte gesperrt (Eigenhändigkeitserfordernis).');
  }
  const T = FORMAT_TYPOGRAFIE[e.dokument.format].docx;
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Arial', size: 22 }, paragraph: { spacing: { line: 276, lineRule: 'auto' } } }, // 11 pt, 1.15
        title: { run: { font: 'Arial', size: 34, bold: true, color: '1A1A17' } },          // 17 pt
        heading2: { run: { font: 'Arial', size: 24, bold: true, color: '1A1A17' } },       // 12 pt
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: 1417, bottom: 1417, left: T.randLinksTwips, right: T.randRechtsTwips } }, // 2.5 cm; Eingaben: Korrekturrand rechts
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'LexMetrik · Orientierungsdokument, keine Rechtsberatung · Seite ', size: 16, color: '6E6E64' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '6E6E64' }),
            ],
          })],
        }),
      },
      children: docxAbsaetze(e, opts.banner).flatMap((a) => alsParagraphe(a, e.dokument.format)),
    }],
  });

  return Packer.toBlob(doc);
}

/** Baut das Word-Dokument und lädt es herunter (Einzel-Export der Wizards). */
export async function vorlagenDocxErzeugen(e: AssembleErgebnis, opts: { banner?: PdfBanner; dateiName: string }) {
  const blob = await vorlagenDocxDokument(e, { banner: opts.banner });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = opts.dateiName;
  // Defensiv: Anchor ins DOM, Revoke verzögert – sonst kann der Download
  // in einzelnen Browsern abbrechen.
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// XLSX (vorbereitet, NICHT ausgeliefert): Ein künftiger Renderer dockt am
// selben AssembleErgebnis an – `export async function vorlagenXlsxErzeugen(e, opts)`
// für tabellarische Vorlagen (Aktiensplit, Stimmrechtsmatrizen). Die UI zeigt
// den Button erst, wenn eine Vorlage 'xlsx' in `output` führt.
