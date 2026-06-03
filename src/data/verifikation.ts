import type { Rechtsprechungshinweis } from '../types/legal';

// ─── Zentrales Verifikations-Register (§5.3) ──────────────────────────────
//
// Einzige Quelle für alle Rechtsprechungs-Aktenzeichen. Kein Aktenzeichen darf
// im Code auftauchen, das hier nicht registriert ist. Standard: verifiziert=false,
// bis der Verweis gegen die amtliche Sammlung (BGE) bzw. das BGer-Urteil geprüft
// wurde. Keine neuen Aktenzeichen erfinden.

export type VerifikationsEintrag = {
  aktenzeichen: string;
  aussage: string;
  verifiziert: boolean;
};

export const VERIFIKATION: Record<string, VerifikationsEintrag> = {
  // Lohnfortzahlung (Art. 324a OR)
  BGE_131_III_623: {
    aktenzeichen: 'BGE 131 III 623',
    aussage:
      'Karenzfrist/Anspruch: Bei Kündigungsfrist ≤ 3 Monaten entsteht der Anspruch erst ab dem ersten Tag des vierten Monats.',
    verifiziert: false,
  },
  BGer_4A_215_2011: {
    aktenzeichen: 'BGer 4A_215/2011',
    aussage: 'Lohnfortzahlungsanspruch erneuert sich pro Dienstjahr.',
    verifiziert: false,
  },
  BGE_135_III_640: {
    aktenzeichen: 'BGE 135 III 640',
    aussage: 'Gleichwertigkeitsmassstab bei Krankentaggeldversicherung (Art. 324a Abs. 4 OR).',
    verifiziert: false,
  },

  // Kündigungsfrist (Art. 335c OR)
  BGE_131_III_467: {
    aktenzeichen: 'BGE 131 III 467',
    aussage:
      'Massgeblich ist der Zugang der Kündigung; Gegenmeinung zum Fristbeginn (Frist läuft ab Zustellung).',
    verifiziert: false,
  },
  BGE_134_III_354: {
    aktenzeichen: 'BGE 134 III 354',
    aussage:
      'Zugangs-/Empfangsprinzip; Rückrechnung der Kündigungsfrist vom Endtermin.',
    verifiziert: false,
  },
  BGE_115_V_437: {
    aktenzeichen: 'BGE 115 V 437',
    aussage:
      'Rückrechnung vom Endtermin; Abgrenzung Kündigungsfrist-Verlängerung (Hemmung) von der Lohnfortzahlung.',
    verifiziert: false,
  },

  // Sperrfristen (Art. 336c OR)
  BGE_133_III_517: {
    aktenzeichen: 'BGE 133 III 517',
    aussage:
      'Dienstjahreswechsel während laufender Sperrfrist: längere Sperrfrist ab erstem AUF-Tag, alte Tage angerechnet.',
    verifiziert: false,
  },
  BGE_124_III_474: {
    aktenzeichen: 'BGE 124 III 474',
    aussage:
      'Neue Arbeitsunfähigkeit in der Erstreckungsphase (Abs. 3) löst keine neue Sperrfrist aus.',
    verifiziert: false,
  },
  BGE_120_II_124: {
    aktenzeichen: 'BGE 120 II 124',
    aussage:
      'Gleichartiger Grund derselben Ursache (Rückfall) löst nur eine Sperrfrist aus («aucun lien»).',
    verifiziert: false,
  },
  BGE_143_III_21: {
    aktenzeichen: 'BGE 143 III 21',
    aussage: 'Schwangerschaftsbeginn (Befruchtung) als Anfangstag der Sperrfrist.',
    verifiziert: false,
  },
};

/** Liefert einen Rechtsprechungshinweis aus dem zentralen Register. */
export function rechtsprechung(id: keyof typeof VERIFIKATION): Rechtsprechungshinweis {
  const e = VERIFIKATION[id];
  return { aktenzeichen: e.aktenzeichen, aussage: e.aussage, verifiziert: e.verifiziert };
}
