// Dossier: bibliothek/behoerden/schlichtungsaemter-gemeindezuordnung.md
// (Sektion §37 — VD)
//
// ─── VD: Schlichtung bei der sachlich zuständigen Instanz (Streitwert) ──────
//
// Der Kanton Waadt kennt KEINE eigene ordentliche Schlichtungsbehörde:
// «Le juge de la tentative de conciliation est le juge matériellement
// compétent pour l'instance au fond» (Art. 41 Abs. 1 CDPJ-VD, BLV 211.02);
// bei einem Kollegialgericht schlichtet der juge délégué (Abs. 2; für die
// Chambre patrimoniale ausdrücklich Art. 42 Abs. 1 CDPJ-VD), Spezialgesetze
// bleiben vorbehalten (Abs. 3 — Miete: Commission préfectorale; Arbeit
// inkl. GlG: LJT-VD, BLV 173.61, eigene Kaskade unten). Die sachliche
// Zuständigkeit nach Streitwert regelt die LOJV (BLV 173.01), Wortlaut
// am konsolidierten Erlass verifiziert (11.6.2026):
//   · Art. 113 Abs. 1bis  Juge de paix            unter CHF 10'000
//   · Art. 96d Abs. 2     Präsident des TA        CHF 10'000–30'000
//   · Art. 96b Abs. 3     Tribunal d'arrondissement  über 30'000 bis 100'000
//   · Art. 96g            Chambre patrimoniale    über CHF 100'000
// Reine, deterministische Stufen-Funktion (§2) — die Adress-Daten leben in
// src/data/schlichtungsstellen.ts (VD_TRIBUNAUX, VD_CHAMBRE_PATRIMONIALE).

export type VdSchlichtungsStufe =
  | 'justice_de_paix'
  | 'ta_praesident'
  | 'tribunal_arrondissement'
  | 'chambre_patrimoniale';

export interface VdStufenErgebnis {
  stufe: VdSchlichtungsStufe;
  /** Erklärungssatz mit Normklammer — nutzersichtbar (endet auf Satz). */
  text: string;
}

/** Streitwert-Schwellen der LOJV-VD (Wortlaut verifiziert 11.6.2026). */
export const VD_SCHWELLEN = {
  /** Art. 113 Abs. 1bis LOJV: Juge de paix UNTER diesem Wert (exklusiv). */
  JDP_UNTER: 10_000,
  /** Art. 96d Abs. 2 LOJV: Präsident des TA bis und mit diesem Wert. */
  TA_PRAESIDENT_BIS: 30_000,
  /** Art. 96b Abs. 3 LOJV: TA (Kollegium) bis und mit diesem Wert. */
  TA_BIS: 100_000,
} as const;

/** Kurzfassung der Kaskade für Fälle ohne bezifferten Streitwert (§8). */
export const VD_KASKADE_TEXT =
  'Im Kanton Waadt schlichtet die sachlich zuständige Instanz selbst '
  + '(Art. 41 CDPJ-VD): unter CHF 10’000 die Justice de paix des '
  + 'Districts, von CHF 10’000 bis 100’000 das Tribunal '
  + 'd’arrondissement, über CHF 100’000 die Chambre patrimoniale '
  + 'cantonale. Arbeitsrechtliche Streitigkeiten bis CHF 30’000 gehören '
  + 'vor das Tribunal de prud’hommes, darüber gelten die ordentlichen '
  + 'Stufen (Art. 2 LJT-VD); Miete/Pacht vor die Commission préfectorale '
  + '(Art. 41 Abs. 3 CDPJ-VD).';

/** Stufe der VD-Schlichtungsinstanz nach Streitwert — null, wenn die
 *  Streitigkeit nicht vermögensrechtlich ist oder kein Streitwert vorliegt
 *  (dann entscheidet die Materie, keine Auto-Zuordnung; §8 ehrlich). */
export function vdSchlichtungsStufe(
  vermoegensrechtlich: boolean,
  streitwertCHF: number | null,
): VdStufenErgebnis | null {
  if (!vermoegensrechtlich || streitwertCHF === null
    || !Number.isFinite(streitwertCHF) || streitwertCHF < 0) return null;
  if (streitwertCHF < VD_SCHWELLEN.JDP_UNTER) {
    return {
      stufe: 'justice_de_paix',
      text: 'Streitwert unter CHF 10’000: Schlichtungsbehörde ist die '
        + 'Justice de paix des Districts (Art. 41 Abs. 1 CDPJ-VD i. V. m. '
        + 'Art. 113 Abs. 1bis LOJV-VD).',
    };
  }
  if (streitwertCHF <= VD_SCHWELLEN.TA_PRAESIDENT_BIS) {
    return {
      stufe: 'ta_praesident',
      text: 'Streitwert von CHF 10’000 bis 30’000: sachlich '
        + 'zuständig ist der Präsident des Tribunal d’arrondissement '
        + 'als Einzelrichter — die Schlichtung findet beim Tribunal '
        + 'd’arrondissement statt (Art. 41 Abs. 1 CDPJ-VD i. V. m. '
        + 'Art. 96d Abs. 2 LOJV-VD).',
    };
  }
  if (streitwertCHF <= VD_SCHWELLEN.TA_BIS) {
    return {
      stufe: 'tribunal_arrondissement',
      text: 'Streitwert über CHF 30’000 bis 100’000: zuständig ist '
        + 'das Tribunal d’arrondissement; die Schlichtung führt der vom '
        + 'Gericht bezeichnete juge délégué (Art. 41 Abs. 2 CDPJ-VD i. V. m. '
        + 'Art. 96b Abs. 3 LOJV-VD).',
    };
  }
  return {
    stufe: 'chambre_patrimoniale',
    text: 'Streitwert über CHF 100’000: zuständig ist die Chambre '
      + 'patrimoniale cantonale (Sitz beim Tribunal d’arrondissement '
      + 'de Lausanne); die Schlichtung führt der juge délégué (Art. 41 '
      + 'Abs. 2 i. V. m. Art. 42 Abs. 1 CDPJ-VD; Art. 96f/96g LOJV-VD).',
  };
}

// ─── Arbeitsrecht inkl. GlG: eigene Kaskade nach LJT-VD (BLV 173.61) ─────────
// Wortlaut am konsolidierten Erlass verifiziert (11.6.2026): Art. 1 Abs. 1
// (Geltung: Arbeitsvertrag, AVG, GlG, Mitwirkungsgesetz) · Art. 2 Abs. 1
// (a. prud'hommes ≤ 30'000 · b. TA > 30'000 ≤ 100'000 · c. Chambre
// patrimoniale > 100'000) · Art. 2 Abs. 2 (nur GlG ohne Geldbegehren:
// prud'hommes streitwertunabhängig) · Art. 5 (prud'hommes = spezialisierte
// Kammer JEDES Tribunal d'arrondissement → dessen Adresse) · Art. 10 Abs. 2
// (Schlichtung ohne Beisitzer; Art. 200 Abs. 2 ZPO vorbehalten).

export type VdArbeitsInstanz = 'prudhommes' | 'tribunal_arrondissement' | 'chambre_patrimoniale';

export interface VdArbeitsErgebnis {
  instanz: VdArbeitsInstanz;
  text: string;
}

/** Zuständige Instanz für arbeitsrechtliche Streitigkeiten (inkl. GlG mit
 *  Geldbegehren) nach Streitwert — null ohne bezifferten Streitwert. */
export function vdArbeitsStufe(streitwertCHF: number | null): VdArbeitsErgebnis | null {
  if (streitwertCHF === null || !Number.isFinite(streitwertCHF) || streitwertCHF < 0) return null;
  if (streitwertCHF <= VD_SCHWELLEN.TA_PRAESIDENT_BIS) {
    return {
      instanz: 'prudhommes',
      text: 'Arbeitsrechtliche Streitigkeit bis CHF 30’000: zuständig ist '
        + 'das Tribunal de prud’hommes — die spezialisierte Kammer des '
        + 'Tribunal d’arrondissement (Art. 2 Abs. 1 lit. a und Art. 5 '
        + 'LJT-VD); die Schlichtung führt dessen Präsident oder '
        + 'Vizepräsident ohne Beisitzer (Art. 10 Abs. 2 LJT-VD).',
    };
  }
  if (streitwertCHF <= VD_SCHWELLEN.TA_BIS) {
    return {
      instanz: 'tribunal_arrondissement',
      text: 'Arbeitsrechtliche Streitigkeit über CHF 30’000 bis 100’000: '
        + 'zuständig ist das Tribunal d’arrondissement (Art. 2 Abs. 1 '
        + 'lit. b LJT-VD); die Schlichtung führt der juge délégué '
        + '(Art. 41 Abs. 2 CDPJ-VD).',
    };
  }
  return {
    instanz: 'chambre_patrimoniale',
    text: 'Arbeitsrechtliche Streitigkeit über CHF 100’000: zuständig ist '
      + 'die Chambre patrimoniale cantonale (Art. 2 Abs. 1 lit. c LJT-VD); '
      + 'die Schlichtung führt der juge délégué (Art. 42 Abs. 1 CDPJ-VD).',
  };
}

/** GlG-Begehren ohne Geldforderung: prud'hommes streitwertunabhängig. */
export const VD_GLG_OHNE_GELD_TEXT =
  'Reines Gleichstellungs-Begehren ohne Geldforderung: zuständig ist das '
  + 'Tribunal de prud’hommes unabhängig vom Streitwert (Art. 2 Abs. 2 '
  + 'LJT-VD); in der Schlichtung gilt die paritätische Besetzung nach '
  + 'Art. 200 Abs. 2 ZPO (Art. 10 Abs. 2 LJT-VD).';
