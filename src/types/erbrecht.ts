import type { Berechnungsergebnis } from './legal';
import type { Bruch } from '../lib/bruch';

// ─── Erbteilung & Pflichtteil: Typen (Art. 457 ff., 462, 470 ff. ZGB) ─────
//
// Massgebend ist das Todesdatum (Art. 15/16 SchlT ZGB):
//   Tod ≤ 31.12.2022 → altes Recht (Nachkommen-PT 3/4, Eltern-PT 1/2)
//   Tod ≥ 1.1.2023  → neues Recht (einheitlich 1/2, Eltern ohne PT)

export type Zivilstand =
  | 'verheiratet'
  | 'eingetragene_partnerschaft'
  | 'ledig'; // ledig / verwitwet / geschieden (kein Ehegatten-Erbrecht)

export type Gueterstand =
  | 'errungenschaftsbeteiligung'
  | 'guetertrennung'
  | 'guetergemeinschaft';

// Stamm eines vorverstorbenen Kindes: dessen Nachkommen treten ein
// (Art. 457 Abs. 3 ZGB). Nur Stämme MIT Nachkommen erben.
export type KinderStamm = {
  enkel: number; // Anzahl eintretender Nachkommen dieses Stammes (> 0)
};

// Elternteil der 2. Parentel (Art. 458 ZGB).
export type Elternteil = {
  lebt: boolean;
  // Falls vorverstorben: hat dieser Stamm Nachkommen (Geschwister/Nichten/
  // Neffen des Erblassers)? Sonst Anwachsung an die andere Seite (Abs. 4).
  stammNachkommen?: boolean;
};

export type ErbteilungInput = {
  todesdatum: string;            // yyyy-MM-dd → Recht-Schalter
  zivilstand: Zivilstand;

  // Art. 472 ZGB: hängiges Scheidungs-/Auflösungsverfahren mit erfüllten
  // Voraussetzungen (gemeinsames Begehren oder ≥ 2 Jahre getrennt).
  scheidungHaengig?: boolean;
  scheidung472Erfuellt?: boolean;

  // 1. Parentel
  kinderLebend: number;
  kinderVorverstorben?: KinderStamm[];

  // 2. Parentel (nur relevant, wenn 1. Parentel leer)
  vater?: Elternteil;
  mutter?: Elternteil;

  // 3. Parentel (nur relevant, wenn 1. und 2. Parentel leer und kein Ehegatte)
  dritteParentelVorhanden?: boolean;

  // Güterrechtliche Vorstufe (optional): bestimmt den Nachlass in CHF.
  gueterstand?: Gueterstand;
  eigengutErblasser?: number;        // Errungenschaftsbeteiligung / Gütergemeinschaft
  vorschlagErblasser?: number;       // Errungenschaftsbeteiligung (negativ = Rückschlag)
  vorschlagUeberlebender?: number;
  gesamtgut?: number;                // Gütergemeinschaft
  vermoegenErblasser?: number;       // Gütertrennung / unverheiratet
  nachlassDirekt?: number;           // alternativ: Nachlass direkt angeben
};

export type ErbeGruppe = 'ehegatte' | 'nachkommen' | 'eltern_stamm' | 'dritte_parentel' | 'gemeinwesen';

export type ErbeAnteil = {
  bezeichnung: string;        // «Ehegatte/Partner», «Kind 1», «Enkel (Stamm 2)», «Mutter», …
  gruppe: ErbeGruppe;
  erbteil: Bruch;             // gesetzlicher Erbteil (Anteil am Nachlass)
  pflichtteil: Bruch;         // Anteil am Nachlass (0 = nicht pflichtteilsberechtigt)
  anzahl?: number;            // bei Sammelpositionen (z. B. «2 Enkel zu je …»)
};

export type ErbteilungErgebnis = Berechnungsergebnis & {
  rechtsstand: 'neu' | 'alt';            // ab 1.1.2023 / bis 31.12.2022
  erben: ErbeAnteil[];
  verfuegbareQuote: Bruch;
  nachlassChf?: number;                  // falls güterrechtlich/direkt bestimmt
};
