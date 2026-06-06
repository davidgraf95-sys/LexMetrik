// ─── Fristenspiegel: Typen des Orchestrierer-Rahmens (FAHRPLAN-PRAXIS 3.1b) ─
//
// Konzept: bibliothek/recherche/fristenspiegel-konzept.md (§B). Der Spiegel
// rechnet NICHTS selbst (§5-Kernsatz): jede Zeile entsteht aus dem Aufruf
// einer BESTEHENDEN Engine bzw. eines bestehenden Presets; der Rahmen
// tabelliert nur. Determinismus erbt er von den Engines (§2).

export type Fristnatur =
  | 'gesetzlich' | 'gerichtlich' | 'verwirkung' | 'verjaehrung'
  | 'wartefrist' | 'klagefrist' | 'ordnungsfrist';

export type SpiegelZeile = {
  key: string;
  label: string;
  /** exakter Norm-Anker für die Pill (z. B. 'Art. 273 Abs. 1 OR') */
  normRef: string;
  fristnatur: Fristnatur;
  /**
   * 'berechnet'      → endeISO/endeText gesetzt (Engine-Resultat)
   * 'ausgeschlossen' → Frist existiert in dieser Konstellation nicht
   *                    (z. B. Erstreckung bei Art. 257d/257f, Art. 272a)
   * 'bedingt'        → läuft nur unter einer offen gelegten Bedingung;
   *                    Datum kann gesetzt sein (§2-Gate, z. B. 336b II)
   * 'hinweis'        → keine parallele Frist (anderer Trigger/Folgestufe)
   */
  status: 'berechnet' | 'ausgeschlossen' | 'bedingt' | 'hinweis';
  endeISO?: string;    // yyyy-MM-dd (für .ics/Sortierung)
  endeText?: string;   // dd.MM.yyyy (Anzeige, exakt der Engine-Output)
  /** Anzeige-Präfix vor dem Datum — Default 'bis'; Wartefristen: 'frühestens ab'. */
  endePraefix?: string;
  /** Weiche/Gate als Klartext (§8) */
  bedingung?: string;
};

export type FristenspiegelErgebnis = {
  ereignisLabel: string;
  ereignisDatumISO: string;
  zeilen: SpiegelZeile[];
  /** Annahmen des Spiegels selbst (zusätzlich zu Engine-Annahmen) */
  annahmen: string[];
  /** Warnungen — durchgereicht von der Engine plus Spiegel-eigene Weichen */
  warnungen: string[];
};
