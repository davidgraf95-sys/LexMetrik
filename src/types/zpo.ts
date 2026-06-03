import type { Kanton, Berechnungsergebnis } from './legal';

// ─── ZPO-Fristenrechner: Typen (Art. 142–147 ZPO) ─────────────────────────

export type ZpoEinheit = 'tage' | 'wochen' | 'monate' | 'jahre';

export type ZpoVerfahren =
  | 'ordentlich'
  | 'vereinfacht'
  | 'familienrecht'
  | 'klagefrist_klagebewilligung'
  | 'schlichtung'
  | 'summarisch'
  | 'rechtsmittel_summarisch';

export type ZpoFristnatur = 'gesetzlich' | 'gerichtlich';

export type ZpoZustellart = 'empfangsbestaetigung' | 'gewoehnliche_post';

// Berechnungsmodus für Wochen-/Monats-/Jahresfristen (Ziff. 7.3) [UMSTRITTEN]
export type ZpoModus = 'bundesgericht' | 'mindermeinung';

export type ZpoErstreckung = {
  einheit: 'tage' | 'wochen';
  laenge: number;
};

export type ZpoInput = {
  ereignis: string;            // yyyy-MM-dd, auslösendes Ereignis / Zustellung
  einheit: ZpoEinheit;
  laenge: number;              // > 0
  verfahren: ZpoVerfahren;
  kanton: Kanton;              // Gerichtsort (Sitz des Gerichts), Art. 142 Abs. 3
  fristnatur: ZpoFristnatur;
  zustellart?: ZpoZustellart;  // optional, Art. 142 Abs. 1bis
  modus?: ZpoModus;            // optional, default 'bundesgericht'
  erstreckung?: ZpoErstreckung; // optional, Ziff. 7.5 (nur gerichtliche Fristen)
};

// Erweitert das gemeinsame Ergebnis um die ZPO-spezifischen Eckdaten.
export type ZpoErgebnis = Berechnungsergebnis & {
  massgeblicherEreignistag: string; // dd.MM.yyyy
  diesAQuo: string;                 // Beginn des Fristenlaufs
  diesAdQuem: string;               // Fristende (24.00 Uhr)
  erstrecktBis?: string;            // optional, bei Erstreckung
};
