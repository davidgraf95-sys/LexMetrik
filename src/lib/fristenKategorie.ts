// Dossier: FAHRPLAN-FRISTEN-EINHEIT.md
// ─── FE-1 · Informationsarchitektur der Fristen-Kategorie ───────────────────
//
// EIN «Fristen berechnen»-Einstieg: Der Tagerechner (mit Regime-Führung
// Allgemein · ZPO · SchKG) und der Fristenspiegel sind die HAUPTEINSTIEGE;
// die Spezialrechner bleiben eigenständige Werkzeuge (eigene Eingabemodelle,
// §4 — keine Engine-Fusion, V2/V3-Verdikte) und erscheinen als benannte
// «Eigenes Regime»-Abzweigungen mit Ein-Satz-Begründung, WARUM eigen.
// Der Doppelpfad zpo-/schkg-fristen ↔ Tagerechner-Tabs ist GEWOLLT
// (Fach-/Laien-Einstieg) und wird als «Fach-Direkteinstieg» gekennzeichnet.
//
// Die WARUM-Begründungen sind fachliche Aussagen (Kuratierung Claude aus den
// Engine-Kopfkommentaren, Abnahme David offen — FE-6). Der Test
// src/tests/fristenKategorie.test.ts erzwingt, dass jede VERFÜGBARE Karte
// der Fristen-Kategorie genau einem Einstiegstyp zugeordnet ist — eine neue
// Fristen-Karte ohne Zuordnung bricht die Suite (keine stille Mischliste).

export type FristenEinstiegArt = 'haupt' | 'fach' | 'regime';

export interface FristenHaupteinstieg {
  id: string;
  /** Kurzzeile unter dem Titel (Regime-Untertitel bzw. Spiegel-Erklärung). */
  untertitel: string;
}

export interface FristenRegimeZeile {
  id: string;
  /** Ein Satz, WARUM dieses Werkzeug ein eigenes Regime braucht. */
  warum: string;
}

/** Die zwei grossen Einstiege der Fristen-Kategorie (FE-1). */
export const FRISTEN_HAUPTEINSTIEGE: FristenHaupteinstieg[] = [
  { id: 'tagerechner',
    untertitel: 'Allgemein (Vertrag/OR) · Zivilprozess (ZPO) · Betreibung (SchKG) · Rückwärts' },
  { id: 'fristenspiegel',
    untertitel: 'Ein Ereignis – alle Fristen daraus als Tabelle, mit Kalender-Export' },
];

/** Fach-Direkteinstiege: dieselben Engines wie die Tagerechner-Tabs,
 *  direkt im Regime geöffnet (Doppelpfad gewollt). */
export const FRISTEN_FACH_DIREKTEINSTIEGE: string[] = ['zpo-fristen', 'schkg-fristen'];

/** Spezialrechner mit eigenem Regime — Begründung WARUM eigen (fachliche
 *  Aussage, Abnahme David offen). */
export const FRISTEN_EIGENE_REGIMES: FristenRegimeZeile[] = [
  { id: 'verjaehrung',
    warum: 'mit Unterbrechungs-Kette: Anerkennung, Betreibung oder Klage lassen die Frist neu laufen (Art. 135 ff. OR), relative und absolute Frist parallel' },
  { id: 'kuendigung-sperrfristen',
    warum: 'mit Sperrfristen nach Art. 336c OR: Krankheit, Unfall, Schwangerschaft machen die Kündigung nichtig oder hemmen die laufende Frist' },
  { id: 'mietrecht',
    warum: 'rechnet auf Kündigungstermine (Vertrag → Ortsgebrauch → Gesetz, Art. 266a ff. OR), nicht nur auf Fristlängen – samt Anfechtung und Erstreckung' },
  { id: 'gewaehrleistung',
    warum: 'zwei getrennte Uhren am selben Mangel: Rügeobliegenheit (Verwirkung – keine Hemmung) und Verjährung (Art. 197 ff. OR)' },
  { id: 'erbrecht-fristen',
    warum: 'eigener Fristen-Katalog je Tatbestand (Ausschlagung, Inventar, Klagefristen – Art. 521 ff. ZGB), je mit eigenem Fristauslöser' },
];

/** Einstiegstyp einer Karte der Fristen-Kategorie — null heisst: noch nicht
 *  zugeordnet (der Test bricht dann; die UI fällt ehrlich auf eine
 *  Regime-Zeile ohne WARUM-Satz zurück). */
export function fristenEinstiegArt(id: string): FristenEinstiegArt | null {
  if (FRISTEN_HAUPTEINSTIEGE.some((h) => h.id === id)) return 'haupt';
  if (FRISTEN_FACH_DIREKTEINSTIEGE.includes(id)) return 'fach';
  if (FRISTEN_EIGENE_REGIMES.some((r) => r.id === id)) return 'regime';
  return null;
}
