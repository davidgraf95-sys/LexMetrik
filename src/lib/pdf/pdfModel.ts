import { format } from 'date-fns';
import type { Berechnungsergebnis, BerechnungsStatus, Normverweis } from '../../types/legal';
import { pdfText } from './winansi';
import { normLink } from './normLinks';

// ─── Zentrale PDF-Schicht: Konfiguration & Dokumentmodell ─────────────────
//
// Jeder Rechner liefert eine PdfDocConfig; das Modell wird hier REIN aus der
// Konfiguration gebaut (testbar, ohne jsPDF). Die gemeinsame Schicht enthält
// KEINERLEI hartcodierte Titel, Disclaimer, Normen oder Textbausteine eines
// Rechtsgebiets – gerendert wird ausschliesslich, was übergeben wird. Damit
// ist Cross-Domain-Bleed strukturell ausgeschlossen.

export type PdfSectionConfig = {
  titel: string;
  ergebnis: Berechnungsergebnis;
};

export type PdfDocConfig = {
  title: string;                      // rechnerspezifischer Dokumenttitel
  domain: string;                     // Rechtsgebiet, z. B. 'zpo-fristen'
  fileBase: string;                   // Dateiname-Basis, z. B. 'ZPO-Fristen'
  inputs: Record<string, string>;     // angezeigte Eingaben
  sections: PdfSectionConfig[];       // Ergebnis(se) inkl. Status & Rechenweg
  citations?: Normverweis[];          // NUR die tatsächlich einschlägigen Normen;
                                      // fehlt das Feld: Union der Section-Normverweise
  notes?: string[];                   // zusätzliche rechnerspezifische Hinweise
  disclaimer: string;                 // domänenspezifischer Disclaimer-Text
};

export type PdfBlock =
  | { art: 'titel'; text: string }
  | { art: 'meta'; text: string }
  | { art: 'h2'; text: string }
  | { art: 'h3'; text: string }
  | { art: 'kv'; key: string; value: string }
  | { art: 'ergebnisbox'; text: string; status: BerechnungsStatus }
  | { art: 'absatz'; text: string; ton: 'normal' | 'warn' | 'dezent' }
  | { art: 'liste'; text: string; ton: 'normal' | 'warn' }
  | { art: 'schritt'; nr: number; titel: string; text: string; normen: string; rechtsprechung?: string }
  | { art: 'norm'; text: string; url?: string }
  | { art: 'disclaimer'; text: string }
  | { art: 'trenner' };

export type PdfModel = {
  blocks: PdfBlock[];
  dateiname: string;
  erstellt: string; // dd.MM.yyyy HH:mm
};

const STATUS_LABEL: Record<BerechnungsStatus, string> = {
  ok: 'OK',
  nichtig: 'NICHTIG',
  kein_anspruch: 'KEIN ANSPRUCH',
  unzulaessig: 'UNZULÄSSIG',
  ktg_regime: 'KTG-REGIME',
};

export function statusLabel(s: BerechnungsStatus): string {
  return STATUS_LABEL[s];
}

/** Baut das vollständige Dokumentmodell aus der Rechner-Konfiguration. */
export function buildPdfModel(cfg: PdfDocConfig, jetzt: Date = new Date()): PdfModel {
  const t = pdfText; // Datums-, Typografie- und CP1252-Aufbereitung
  const blocks: PdfBlock[] = [];

  // Kopf
  blocks.push({ art: 'titel', text: t(cfg.title) });
  blocks.push({ art: 'meta', text: t(`Erstellt: ${format(jetzt, 'dd.MM.yyyy HH:mm')} Uhr`) });

  // Eingaben
  const inputEintraege = Object.entries(cfg.inputs).filter(([, v]) => v);
  if (inputEintraege.length > 0) {
    blocks.push({ art: 'h2', text: 'Eingaben' });
    inputEintraege.forEach(([k, v]) => blocks.push({ art: 'kv', key: t(k), value: t(v) }));
    blocks.push({ art: 'trenner' });
  }

  // Ergebnisse je Abschnitt
  cfg.sections.forEach((s) => {
    blocks.push({ art: 'h2', text: t(s.titel) });
    blocks.push({ art: 'ergebnisbox', text: t(s.ergebnis.ergebnis), status: s.ergebnis.status });

    if (s.ergebnis.warnungen.length > 0) {
      blocks.push({ art: 'h3', text: 'Hinweise / Vorbehalte' });
      s.ergebnis.warnungen.forEach((w) => blocks.push({ art: 'liste', text: t(w), ton: 'warn' }));
    }

    if (s.ergebnis.rechenweg.length > 0) {
      blocks.push({ art: 'h3', text: 'Rechenweg' });
      s.ergebnis.rechenweg.forEach((schritt, i) => {
        const rsp = schritt.rechtsprechung?.length
          ? schritt.rechtsprechung
              .map((r) => `${r.aktenzeichen}${r.verifiziert ? '' : ' [zu verifizieren]'}`)
              .join(', ')
          : undefined;
        blocks.push({
          art: 'schritt',
          nr: i + 1,
          titel: t(schritt.beschreibung),
          text: t(schritt.zwischenergebnis),
          normen: t(schritt.normen.map((n) => n.artikel).join(', ')),
          rechtsprechung: rsp ? t(rsp) : undefined,
        });
      });
    }

    if (s.ergebnis.annahmen.length > 0) {
      blocks.push({ art: 'h3', text: 'Annahmen' });
      s.ergebnis.annahmen.forEach((a) => blocks.push({ art: 'liste', text: t(a), ton: 'normal' }));
    }
    blocks.push({ art: 'trenner' });
  });

  // Normverweise – ausschliesslich die vom Rechner gelieferten (cfg.citations),
  // sonst Union der Section-Normverweise. Links/SR aus dem zentralen Register.
  const citations =
    cfg.citations ??
    dedupeNormen(cfg.sections.flatMap((s) => s.ergebnis.normverweise));
  if (citations.length > 0) {
    blocks.push({ art: 'h2', text: 'Normverweise' });
    citations.forEach((n) => {
      const link = normLink(n.artikel);
      const label = link ? `${n.artikel} (SR ${link.sr})` : n.artikel;
      const bem = n.bemerkung ? ` – ${n.bemerkung}` : '';
      blocks.push({ art: 'norm', text: t(label + bem), url: link?.url });
    });
    blocks.push({ art: 'trenner' });
  }

  // Zusätzliche Hinweise des Rechners
  if (cfg.notes && cfg.notes.length > 0) {
    blocks.push({ art: 'h2', text: 'Hinweise' });
    cfg.notes.forEach((nt) => blocks.push({ art: 'liste', text: t(nt), ton: 'normal' }));
    blocks.push({ art: 'trenner' });
  }

  // Disclaimer (gemeinsamer Rahmen, domänenspezifischer Text)
  blocks.push({ art: 'disclaimer', text: t(cfg.disclaimer) });

  return {
    blocks,
    dateiname: `${cfg.fileBase}_${format(jetzt, 'yyyy-MM-dd')}.pdf`,
    erstellt: format(jetzt, 'dd.MM.yyyy HH:mm'),
  };
}

function dedupeNormen(normen: Normverweis[]): Normverweis[] {
  const seen = new Set<string>();
  return normen.filter((n) => {
    if (seen.has(n.artikel)) return false;
    seen.add(n.artikel);
    return true;
  });
}

/** Gesamter sichtbarer Text des Modells (für Regressionstests). */
export function modelText(model: PdfModel): string {
  return model.blocks
    .map((b) => {
      switch (b.art) {
        case 'kv': return `${b.key}: ${b.value}`;
        case 'schritt': return `${b.nr}. ${b.titel} ${b.text} ${b.normen} ${b.rechtsprechung ?? ''}`;
        case 'trenner': return '';
        default: return 'text' in b ? b.text : '';
      }
    })
    .join('\n');
}
