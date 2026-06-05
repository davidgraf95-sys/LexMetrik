import type { VorlageFormat, AusgabeArt } from './engine';

// ─── Formatvorlagen – deklarative SSoT für alle Vorlagen-Renderer ───────────
//
// Grundlage: drei Grundlagen-Berichte vom 5.6.2026 («Eingaben-Formatierungs-
// konvention», «Vertragsformatvorlage», «Einseitige Willenserklärungen»).
// Zentrale Erkenntnis aller drei: Aufbau und Typografie sind ANWALTLICHE
// USANZ, nicht Gesetz – gesetzlich zwingend sind nur die Pflichtinhalte der
// jeweiligen Norm und die FORMSTUFE des Dokuments. Deshalb trennt dieses
// Modul zwei Achsen:
//
//   · VorlageFormat (verfuegung | vertrag | eingabe) – die TYPOGRAFIE-
//     Konvention (Usanz, frei wählbar, hier als Hausstandard fixiert)
//   · AusgabeArt (abschrift | entwurf | fertig) – die FORM-GATE-Folge
//     (Bericht «Einseitige Willenserklärungen», Form-Gate-Matrix):
//       abschrift – Eigenhändigkeit zwingend (Testament Art. 505 ZGB,
//                   eigenhändiger Vorsorgeauftrag Art. 361 Abs. 2 ZGB):
//                   NUR Abschreibe-Mustertext, NIE ein unterschriftsreifes
//                   Dokument, KEIN Word-Download
//       entwurf  –  öffentliche Beurkundung (beurkundeter Vorsorgeauftrag;
//                   künftig öffentl. Testament/Erbvertrag): Vorbereitungs-
//                   Entwurf für die Urkundsperson mit WASSERZEICHEN,
//                   kein gültiges Enddokument
//       fertig   –  einfache Schriftform/formfrei (Patientenverfügung
//                   Art. 371 ZGB, Verträge, Eingaben): druckfertiges
//                   Dokument zum Unterschreiben
//
// PDF, DOCX und Live-Vorschau konsumieren dieselben Werte (§5 SSoT).

// ── Typografie je Format (PDF in mm; DOCX in Word-Einheiten) ────────────────

export type FormatTypografie = {
  // PDF (Helvetica ≈ Arial)
  brot: number; zeile: number; zeileDicht: number; absatzGap: number;
  titel?: number; ueberschrift: number; ueberschriftVor: number; ueberschriftNach: number;
  randLinks: number; randRechts: number;   // mm – Eingaben führen rechts den
                                           // breiten «Korrekturrand» der
                                           // Gerichts-Usanz (ca. 3.5 cm)
  // DOCX
  docx: { sz: number; line: number; randLinksTwips: number; randRechtsTwips: number };
};

export const FORMAT_TYPOGRAFIE: Record<VorlageFormat, FormatTypografie> = {
  verfuegung: {
    brot: 10.5, zeile: 5.1, zeileDicht: 4.5, absatzGap: 2.6,
    titel: 16, ueberschrift: 12, ueberschriftVor: 5, ueberschriftNach: 6.4,
    randLinks: 25, randRechts: 25,
    docx: { sz: 22, line: 276, randLinksTwips: 1417, randRechtsTwips: 1417 },
  },
  vertrag: {
    brot: 10.5, zeile: 5.0, zeileDicht: 4.5, absatzGap: 2.4,
    titel: 15.5, ueberschrift: 11.5, ueberschriftVor: 5, ueberschriftNach: 6.2,
    randLinks: 25, randRechts: 25,
    docx: { sz: 22, line: 276, randLinksTwips: 1417, randRechtsTwips: 1417 },
  },
  eingabe: {
    brot: 10.5, zeile: 4.9, zeileDicht: 4.4, absatzGap: 2.4,
    titel: undefined, ueberschrift: 11.5, ueberschriftVor: 4.5, ueberschriftNach: 6.2,
    randLinks: 25, randRechts: 35,  // Korrekturrand-Usanz (Bericht D: ~3–4 cm)
    docx: { sz: 22, line: 276, randLinksTwips: 1417, randRechtsTwips: 1984 },
  },
};

// ── Ausgabe-Regeln je AusgabeArt (Form-Gate-Matrix, hart kodiert) ───────────

export type AusgabeRegeln = {
  /** Word-Export zulässig? (abschrift: NIE – es gäbe ein unterschriftsreif
   *  wirkendes Dokument für ein eigenhändigkeitspflichtiges Geschäft) */
  docxErlaubt: boolean;
  /** Diagonales PDF-Wasserzeichen (Notar-Entwurf) */
  wasserzeichen?: string;
  /** Hinweiszeile für DOCX-Kopf (wo kein Wasserzeichen möglich ist) */
  hinweisZeile?: string;
};

export const AUSGABE_REGELN: Record<AusgabeArt, AusgabeRegeln> = {
  abschrift: { docxErlaubt: false },
  entwurf: {
    docxErlaubt: true,
    wasserzeichen: 'ENTWURF',
    hinweisZeile: 'ENTWURF zur Vorbereitung der öffentlichen Beurkundung – kein gültiges Dokument.',
  },
  fertig: { docxErlaubt: true },
};

/** Kurz-Etikett für Vorschau/Badges. */
export const AUSGABE_LABEL: Record<AusgabeArt, string | null> = {
  abschrift: 'Abschreibe-Mustertext',
  entwurf: 'Entwurf für die Beurkundung',
  fertig: null,
};

// ── Geteilte Absatz-Muster (PDF, DOCX UND Live-Vorschau interpretieren
//    dieselben Textstrukturen – §5 SSoT; zuvor je Renderer dupliziert) ──────

export const MUSTER = {
  /** Nummerierte Klausel/Begehren «1. …» → hängender Einzug */
  NUMMER: /^(\d+)\.\s+/,
  /** «– »-Unterpunkt → doppelt eingezogen */
  SUB: /^–\s+/,
  /** Strichzeile «______» → gezeichnete Unterschriftslinie */
  STRICHE: /^_{6,}\s*$/,
  /** Zentrierte Rubrum-Parteirolle «— klagende Partei —» */
  RUBRUM_ROLLE: /^—.*—$/,
} as const;
