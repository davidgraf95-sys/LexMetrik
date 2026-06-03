import type { Kanton } from '../types/legal';

// ─── Ortsübliche Kündigungstermine (Tatfrage!) ────────────────────────────
//
// ACHTUNG: Der Ortsgebrauch ist eine TATFRAGE und variiert teils nach
// Gemeinde; verbindlich Auskunft geben nur die Schlichtungsbehörde bzw. die
// Gemeinde. Diese Tabelle ist eine ILLUSTRATIVE Orientierung aus dem
// redaktionellen Konzept (Stand der Quellen dort) und VOR Produktiveinsatz
// gegen die aktuelle kantonale Praxis abzugleichen.
//
// VERIFY: Einträge nicht erweitern, ohne die Quelle zu prüfen. Kantone ohne
// gesicherten Eintrag stehen auf 'unbekannt' → der Rechner fällt auf die
// gesetzliche Auffangregel zurück und warnt.

export type OrtsTermine =
  | { typ: 'monatsenden'; monate: number[]; hinweis?: string }   // bestimmte Monatsenden (1–12)
  | { typ: 'monatsende_ausser_dez'; hinweis?: string }           // jedes Monatsende ausser 31.12.
  | { typ: 'keine'; hinweis?: string }                           // keine ortsüblichen Termine
  | { typ: 'unbekannt'; hinweis?: string };                      // nicht belegt → Auffangregel

export const ORTSUEBLICHE_TERMINE: Record<Kanton, OrtsTermine> = {
  AG: { typ: 'monatsenden', monate: [3, 6, 9] },
  ZG: { typ: 'monatsenden', monate: [3, 6, 9] },
  NE: { typ: 'monatsenden', monate: [3, 6, 9] },
  NW: { typ: 'monatsenden', monate: [3, 6, 9] },
  ZH: { typ: 'monatsenden', monate: [3, 9], hinweis: 'Stadt Zürich: 31. März / 30. September; übrige Bezirke zusätzlich 30. Juni.' },
  BE: { typ: 'monatsende_ausser_dez', hinweis: 'Stadt Bern: 30. April und 31. Oktober; übriger Kanton jedes Monatsende ausser 31. Dezember (Auskunft Schlichtungsbehörde).' },
  FR: { typ: 'monatsenden', monate: [3, 6, 9, 12] },
  BS: { typ: 'monatsende_ausser_dez' },
  BL: { typ: 'monatsende_ausser_dez' },
  AR: { typ: 'monatsende_ausser_dez' },
  AI: { typ: 'monatsende_ausser_dez' },
  UR: { typ: 'monatsende_ausser_dez' },
  GE: { typ: 'keine', hinweis: 'Genf kennt keine ortsüblichen Kündigungstermine → gesetzliche Auffangregel.' },
  VD: { typ: 'unbekannt', hinweis: 'Waadt: verbreitet auf den 1. April / 1. Juli / 1. Oktober – Sonderusanz, verbindlich nur via Schlichtungsbehörde; hier Auffangregel.' },
  LU: { typ: 'unbekannt' },
  SZ: { typ: 'unbekannt' },
  OW: { typ: 'unbekannt' },
  GL: { typ: 'unbekannt' },
  SO: { typ: 'unbekannt' },
  SH: { typ: 'unbekannt' },
  SG: { typ: 'unbekannt' },
  GR: { typ: 'unbekannt' },
  TG: { typ: 'unbekannt' },
  TI: { typ: 'unbekannt' },
  VS: { typ: 'unbekannt' },
  JU: { typ: 'unbekannt' },
};
