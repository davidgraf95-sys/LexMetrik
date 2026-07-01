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

/** MWST-Normalsatz (Art. 25 Abs. 1 MWSTG, SR 641.20): **8,1 %** seit 1.1.2024.
 *  Bundesrechtlicher Satz; relevant für den MwSt-Aufschlag auf die
 *  Parteientschädigung (Art. 95 III lit. b ZPO i.V.m. MWSTG), wenn die
 *  berechtigte Partei nicht vorsteuerabzugsberechtigt ist. §5-SSOT für die
 *  Tarif-Domäne; das Mietvertrags-Modul (`MV_PARAMETER.mwstSatz`) hält aus
 *  Domänengründen eine eigene Kopie — beide stehen im Verfallsregister
 *  (`bibliothek/register/parameter-verfall.md`, Zeile «MWST-Normalsatz»). */
export const MWST_NORMALSATZ_PROZENT = 8.1;

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
  /** true = der Tarifbetrag enthält die MwSt bereits (kein zusätzlicher
   *  MwSt-Aufschlag auf die Parteientschädigung — verhindert Doppelzählung). */
  mwstInbegriffen?: boolean;
  /** I4 — Bemessungskriterien: wonach die Behörde die konkrete Gebühr / das
   *  Honorar INNERHALB des Rahmens festsetzt. Aufzählung der Faktoren aus der
   *  kantonalen Bemessungsnorm (§7, wörtlich belegt in
   *  `bibliothek/register/bemessungskriterien-tarife-kantone.md`). Reines
   *  Anzeigefeld — die Engine liest es NICHT (golden byte-gleich); die UI
   *  zeigt es nur, wenn das Ergebnis eine Spanne ist (§8). Die genaue Norm, aus
   *  der die Kriterien stammen, steht in `kriterienNorm` (oft eine andere
   *  Bestimmung als `artikel`, das die Betrags-/Staffelnorm bezeichnet). */
  kriterien?: string[];
  /** Bezeichnung der Bemessungsnorm, aus der `kriterien` stammen (Anzeige-
   *  Beleg; z. B. «§ 2 GebV OG» oder «Art. 4a GebOR»). */
  kriterienNorm?: string;
  verifiziert: Verifiziert;
}
