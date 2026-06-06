// ─── Anliegen-Einstiege (Pro-Katalog, Fahrplan Katalog-UI Etappe 2.1) ───────
//
// Situativer Zugang: typische Praxis-Anlässe («Wie beginnt der Fall?») zeigen
// direkt auf das passende Werkzeug — quer zur Rechtsgebiets-Taxonomie der
// Kacheln. NUR Daten (IDs aus startseiteConfig, §5), keine Rechtslogik; die
// UI zeigt ausschliesslich verfügbare Ziele (§8, defensiv via karte()).
//
// Liste = ENTWURF Claude 6.6.2026 (Davids Auftrag «frei umsetzen») — die
// Auswahl und Formulierung der Anlässe ist eine fachliche Aussage und steht
// zur Abnahme durch David offen.

export interface Anliegen {
  label: string;   // der Praxis-Anlass, verb-/situationsorientiert
  zielId: string;  // Karten-ID in startseiteConfig.ts
}

export const ANLIEGEN: Anliegen[] = [
  { label: 'Urteil oder Entscheid erhalten', zielId: 'zustaendigkeit' },
  { label: 'Frist berechnen', zielId: 'tagerechner' },
  { label: 'Kündigung erhalten (Arbeit)', zielId: 'kuendigung-sperrfristen' },
  { label: 'Wohnung kündigen', zielId: 'kuendigung-mieter' },
  { label: 'Betreibung einleiten', zielId: 'schkg-zustaendigkeit' },
  { label: 'Verjährung prüfen', zielId: 'verjaehrung' },
  { label: 'Schlichtungsgesuch stellen', zielId: 'schlichtungsgesuch' },
  { label: 'Testament errichten', zielId: 'eigenhaendiges-testament' },
];
