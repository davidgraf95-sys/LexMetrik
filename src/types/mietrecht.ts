import type { Kanton, Berechnungsergebnis } from './legal';

// ─── Mietrecht: Kündigungstermine und -fristen (Art. 253 ff. OR) ──────────

export type Mietobjekt =
  | 'wohnung'             // Art. 266c: 3 Monate
  | 'geschaeftsraum'      // Art. 266d: 6 Monate
  | 'unbewegliche_sache'  // Art. 266b: 3 Monate (inkl. Fahrnisbauten)
  | 'moebliertes_zimmer'  // Art. 266e: 2 Wochen (auch Einstellplätze)
  | 'bewegliche_sache';   // Art. 266f: 3 Tage

export type Kuendigungsart =
  | 'ordentlich'          // Art. 266a–f
  | 'zahlungsverzug'      // Art. 257d (zweistufig)
  | 'pflichtverletzung'   // Art. 257f Abs. 3
  | 'wichtige_gruende'    // Art. 266g (gesetzl. Frist, beliebiger Zeitpunkt)
  | 'tod_mieter'          // Art. 266i (gesetzl. Frist, nächster gesetzl. Termin)
  | 'eigenbedarf'         // Art. 261 Abs. 2 (wie 266i)
  | 'konsumgueter';       // Art. 266k (30 Tage auf Ende 3-Monats-Mietdauer)

// Termin-Hierarchie (Konzept §4): Vertrag → Ortsgebrauch → gesetzliche Auffangregel.
export type TerminQuelle =
  | 'vertraglich_monate'  // bestimmte Monatsenden vereinbart
  | 'jedes_monatsende'    // Klausel «auf jedes Monatsende» (verdrängt Ortsgebrauch)
  | 'ortsueblich'         // kantonale Tabelle (Tatfrage!)
  | 'gesetzlich';         // Ende einer 3-/6-/1-monatigen Mietdauer ab Mietbeginn

export type MietPartei = 'vermieter' | 'mieter';

export type MietInput = {
  kuendigungsart: Kuendigungsart;
  objekt: Mietobjekt;
  zugang: string;                    // yyyy-MM-dd: Zugang der Kündigung (absolute Empfangstheorie)
  kanton: Kanton;
  partei: MietPartei;

  terminQuelle?: TerminQuelle;       // default 'ortsueblich'
  vertragsTermineMonate?: number[];  // 1–12: vereinbarte Monatsenden
  dezemberAusgeschlossen?: boolean;  // «jedes Monatsende ausser 31. Dezember»
  mietbeginn?: string;               // nötig für gesetzliche Auffangregel / Art. 266e / 266k
  vereinbarteFristMonate?: number;   // länger zulässig; kürzer → Minimum + Warnung (Art. 266a Abs. 1)

  // Form-/Nichtigkeitsprüfung (Wohn-/Geschäftsräume, Art. 266l–266o)
  amtlichesFormular?: boolean;       // Vermieterkündigung
  familienwohnung?: boolean;
  separateZustellung?: boolean;      // Art. 266n (Vermieter)
  zustimmungEhegatte?: boolean;      // Art. 266m (Mieterkündigung)

  zahlungsaufforderungZugang?: string; // Art. 257d Stufe 1 (relative Empfangstheorie)
};

export type MietErgebnis = Berechnungsergebnis & {
  endtermin?: string;            // dd.MM.yyyy – wirksames Vertragsende
  endterminISO?: string;
  spaetesterZugang?: string;     // letzter rechtzeitiger Zustelltag für diesen Termin (Art. 78 OR)
  verfehlterTermin?: string;     // falls Art. 266a Abs. 2 griff
  zahlungsfristEnde?: string;    // Art. 257d Stufe 1
  anfechtungBis?: string;        // Art. 273 Abs. 1 (30 Tage ab Empfang)
  erstreckungBis?: string;       // Art. 273 Abs. 2 lit. a
  zugangISO: string;
};
