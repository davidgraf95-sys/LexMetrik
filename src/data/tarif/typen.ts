// ─── Typen der kantonalen Tarif-Datenschicht (Prozesskosten, Art. 96 ZPO) ───
//
// FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN P1. Jede kantonale Datei DEKLARIERT ihren
// Tarif selbst (Regel + amtliche Herkunft); die Engine `lib/prozesskosten.ts`
// ist nur ein dünner Lader über dem fachneutralen Primitiv `lib/tarif/staffel`
// (§3/§4: keine Rechtslogik in den Daten, keine zentrale Dispatch-Logik).
//
// Quelle der Werte: bibliothek/register/{gerichtskosten,parteientschaedigung}-
// tarife-kantone.md (amtlich doppelt verifiziert) + Re-Verifikation 14.6.2026.

import type { TarifRegel } from '../../lib/tarif/staffel';

export type KantonCode =
  | 'ZH' | 'BE' | 'LU' | 'UR' | 'SZ' | 'OW' | 'NW' | 'GL' | 'ZG'
  | 'FR' | 'SO' | 'BS' | 'BL' | 'SH' | 'AR' | 'AI' | 'SG' | 'GR'
  | 'AG' | 'TG' | 'TI' | 'VD' | 'VS' | 'NE' | 'GE' | 'JU';

export const KANTONE: readonly KantonCode[] = [
  'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL',
  'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU',
];

export const KANTON_NAMEN: Record<KantonCode, string> = {
  ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz', OW: 'Obwalden',
  NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Freiburg', SO: 'Solothurn',
  BS: 'Basel-Stadt', BL: 'Basel-Landschaft', SH: 'Schaffhausen', AR: 'Appenzell A.Rh.',
  AI: 'Appenzell I.Rh.', SG: 'St. Gallen', GR: 'Graubünden', AG: 'Aargau', TG: 'Thurgau',
  TI: 'Tessin', VD: 'Waadt', VS: 'Wallis', NE: 'Neuenburg', GE: 'Genf', JU: 'Jura',
};

/** §7-Verifikationsstand. NIE 'geprüft' — das setzt Davids Wort-für-Wort-
 *  Abnahme nach abnahme/SCHEMA.md voraus (§8). */
export type Verifiziert = 'recherche' | 'doppelt';

export interface KantonalerTarif {
  kanton: KantonCode;
  /** Amtlicher Erlasstitel. */
  erlassName: string;
  /** Systematische Nummer der kantonalen Sammlung (bzw. SR). */
  erlassNr: string;
  /** Einschlägige Bestimmung. */
  artikel: string;
  /** Direkter amtlicher Link (Auflage David: jeder Tarif mit Quelle). */
  quelleUrl: string;
  /** Stand der konsolidierten Fassung. */
  stand: string;
  /** Deterministische Tarifregel (Primitiv-kodiert). */
  regel: TarifRegel;
  /** Ermessens-/Modulations-/Sonderfall-Hinweis (Anzeige in der UI, §8). */
  hinweis?: string;
  verifiziert: Verifiziert;
}
