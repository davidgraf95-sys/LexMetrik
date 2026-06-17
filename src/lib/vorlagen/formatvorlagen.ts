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

// ── Rollen-Abstände: die «Reglement-in-Code»-Schicht (§5 SSoT) ──────────────
//
// Bis hierher lagen die Absatz-Abstände je Brief-/Dokumentrolle als
// Magic-Numbers VERSTREUT in den Renderern (vorlagenPdf.ts, vorlagenDocx.ts)
// und – hartkodiert in Tailwind – in der Vorschau. Jetzt stehen sie an EINER
// Stelle. Sie sind anwaltliche Usanz und FORMAT-UNABHÄNGIG (die Rollen-
// Renderer verzweigen nicht nach Format) – darum flache Konstanten, nicht je
// Format dupliziert.
//
// Zwei Einheiten-Sichten, BEWUSST nebeneinander statt auseinander abgeleitet:
//   · ROLLEN_PDF  – Millimeter (PDF) UND Projektionsbasis der On-Screen-
//                   Vorschau (mm → rem, vorschauStil.ts).
//   · ROLLEN_DOCX – Word-Einheiten (Twips / Half-Points).
// Eine mm→Twips-Umrechnung wäre FALSCH: die Word-Masse sind seit jeher eigen-
// ständig auf das Word-Schriftbild getunt (z. B. Adressblock 10 mm im PDF vs.
// 300 Twips ≈ 5.3 mm im DOCX). Sie werden GEMEINSAM gepflegt (ein Eintrag pro
// Rolle, beide Sichten direkt daneben), nie heimlich auseinander gerechnet.
// Geteilt ist genau ein Wert: betreffGroesse (pt; DOCX = 2× als Half-Points).

export const ROLLEN_PDF = {
  einzug: 7,           // hängender Einzug nummerierter Klauseln/Begehren (mm)
  subEinzug: 12,       // «– »-Unterpunkte (mm)
  betreffGroesse: 13,  // Betreff-Schriftgrad (pt)
  adressatNach: 10, absenderNach: 8,
  datumVor: 2, datumNach: 8,
  betreffHaarlinieVor: 1.5, betreffNach: 7,
  rubrumRolleExtra: 2,        // Zusatz-Vorschub je Parteirolle/«gegen» (zu P.zeile)
  rubrumInSachenExtra: 1.5,   // Zusatz nach «in Sachen»
  rubrumBetreffendVor: 1.5,   // Vorschub vor «betreffend …»
  rubrumNach: 7,
  anredeVor: 1.5, anredeNach: 4,
  schlussformelVor: 4, schlussformelNach: 2,
  parteienNach: 8,
  unterschriftVor: 5, unterschriftLinieBreite: 62,
} as const;

export const ROLLEN_DOCX = {
  adressatNach: 300, absenderNach: 240,
  datumVor: 240, datumNach: 240,
  betreffNach: 80,
  rubrumRolleVor: 40, rubrumRolleNach: 160,
  rubrumGegenNach: 160, rubrumInSachenNach: 120,
  rubrumBetreffendVor: 40, rubrumBetreffendNach: 200,
  anredeVor: 120, anredeNach: 240,
  schlussformelVor: 280, schlussformelNach: 120,
  parteienBlockNach: 280, parteienZwischen: 60,
  unterschriftNach: 60,
  unterschriftLinieVor: 480, unterschriftLinieIndentRechts: 6300,
  nummerLinks: 600, nummerHaengend: 340, nummerNach: 120,
  subLinks: 1020, subHaengend: 340, subNach: 60,
  absatzNachEingabe: 120, absatzNachSonst: 140,
  dichtLine: 252,
} as const;

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
