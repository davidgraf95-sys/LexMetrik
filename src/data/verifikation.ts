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

  // Verzugszins (Art. 104 OR) – Präjudizienbuch OR, Art. 104
  BGE_130_III_591: {
    aktenzeichen: 'BGE 130 III 591',
    aussage: 'Verzugszinspflicht setzt Fälligkeit und Inverzugsetzung voraus; kein Schaden-/Verschuldensnachweis nötig.',
    verifiziert: false,
  },
  BGer_4A_514_2007: {
    aktenzeichen: 'BGer 4A_514/2007',
    aussage: 'Zinsen wachsen linear auf dem Kapital; keine Zinseszinsen, auch nicht im Prozess.',
    verifiziert: false,
  },
  BGer_4A_282_2017: {
    aktenzeichen: 'BGer 4A_282/2017',
    aussage: 'Bei Klageeinleitung läuft der Verzugszins ab Zustellung der Klage/Widerklage.',
    verifiziert: false,
  },
  BGer_4A_58_2019: {
    aktenzeichen: 'BGer 4A_58/2019',
    aussage: 'Tritt Verzug ohne Mahnung ein (Art. 108 Ziff. 1), läuft der Zins umgehend.',
    verifiziert: false,
  },
  BGer_4A_117_2014: {
    aktenzeichen: 'BGer 4A_117/2014',
    aussage: 'Verzugszins nur auf geschuldeten Beträgen, nicht auf zu Unrecht verlangten.',
    verifiziert: false,
  },
  BGE_117_V_349: {
    aktenzeichen: 'BGE 117 V 349',
    aussage: 'Art. 104 Abs. 1 ist dispositiv; höherer oder tieferer Verzugszins vereinbar.',
    verifiziert: false,
  },
  BGE_137_III_453: {
    aktenzeichen: 'BGE 137 III 453',
    aussage: 'War die Schuld vor Verzug höher als 5% verzinst, gilt der vertragliche Satz auch für die Verzugszinsen.',
    verifiziert: false,
  },
  BGE_116_II_140: {
    aktenzeichen: 'BGE 116 II 140',
    aussage: 'Üblicher Bankdiskonto (Abs. 3) = Privatdiskontsatz, nicht Kontokorrent-Zinssatz.',
    verifiziert: false,
  },

  // ZPO-Fristen (Art. 142–149 ZPO)
  BGE_139_III_78: {
    aktenzeichen: 'BGE 139 III 78',
    aussage:
      'Art. 145 Abs. 3 ZPO (Hinweis auf Nichtgeltung des Stillstands) ist Gültigkeitsvorschrift; fehlt der Hinweis, stehen die Fristen still. Die Ausnahme «summarisch» gilt auch für die Berufungsfrist gegen einen Summarentscheid.',
    verifiziert: false,
  },
  BGE_144_III_404: {
    aktenzeichen: 'BGE 144 III 404',
    aussage: 'Bei der Frist zur Ablehnung des Urteilsvorschlags ist der Fristenstillstand zu berücksichtigen (Art. 145 Abs. 2 lit. a findet keine Anwendung).',
    verifiziert: false,
  },
  BGE_141_III_554: {
    aktenzeichen: 'BGE 141 III 554',
    aussage: 'Gesetzliche Fristen sind nicht erstreckbar (Art. 144 Abs. 1); auch keine «Fristabnahme» (Berufungsantwortfrist).',
    verifiziert: false,
  },
  BGE_141_II_429: {
    aktenzeichen: 'BGE 141 II 429',
    aussage: 'Zustellfiktion (7. Tag) gilt unabhängig von einer mit der Post vereinbarten längeren Abholfrist.',
    verifiziert: false,
  },
  BGer_4A_20_2024: {
    aktenzeichen: 'BGer 4A_20/2024',
    aussage: 'Der Fristenstillstand (Art. 145 Abs. 1) gilt nicht für die gerichtlich angesetzte Prosekutionsfrist (umstritten).',
    verifiziert: false,
  },
  BGE_140_III_561: {
    aktenzeichen: 'BGE 140 III 561',
    aussage: 'Der frühere Vorbehalt in Art. 209 Abs. 4 betrifft nur prozessuale Prosequierungsfristen, nicht materielle Verwirkungsfristen.',
    verifiziert: false,
  },

  // SchKG-Fristen (Art. 17 ff., 56, 63 SchKG)
  BGE_143_III_149: {
    aktenzeichen: 'BGE 143 III 149',
    aussage:
      'Betreibungsferien hemmen – im Gegensatz zu Gerichtsferien – den Fristenlauf nicht (E. 2.1 i.V.m. BGE 114 III 60 E. 2b).',
    verifiziert: false,
  },
  BGE_114_III_60: {
    aktenzeichen: 'BGE 114 III 60',
    aussage: 'Betreibungsferien hemmen den Fristenlauf nicht; nur Verlängerung bei Fristende in geschlossener Zeit (Art. 63 SchKG).',
    verifiziert: false,
  },
  BGE_108_III_49: {
    aktenzeichen: 'BGE 108 III 49',
    aussage: 'Bei der 3-Tage-Frist nach Art. 63 SchKG zählen Samstag, Sonntag und staatlich anerkannte Feiertage nicht mit.',
    verifiziert: false,
  },
  BGE_119_III_26: {
    aktenzeichen: 'BGE 119 III 26',
    aussage: 'Bei verschobener Steigerung gilt die Mindestfrist (Art. 138 Abs. 1 SchKG) nicht erneut.',
    verifiziert: false,
  },
  BGE_149_III_179: {
    aktenzeichen: 'BGE 149 III 179',
    aussage:
      'Die Auflage des Kollokationsplans ist keine Betreibungshandlung → für die Kollokationsklage gelten die ZPO-Gerichtsferien (Art. 145 ZPO), nicht Art. 63 SchKG.',
    verifiziert: false,
  },
  BGE_143_III_38: {
    aktenzeichen: 'BGE 143 III 38',
    aussage: 'Altrechtlich (vor 2025): für die Aberkennungsklage galten die Betreibungsferien; Auslöser ist eine Betreibungshandlung.',
    verifiziert: false,
  },
  BGE_141_III_170: {
    aktenzeichen: 'BGE 141 III 170',
    aussage: 'Für die Aufsichtsbeschwerde (Art. 17 SchKG) gilt der ZPO-Stillstand nicht (Art. 145 Abs. 4 Satz 2 ZPO).',
    verifiziert: false,
  },
  BGer_5A_190_2023: {
    aktenzeichen: 'BGer 5A_190/2023',
    aussage:
      'In Monaten bemessene Fristen (Art. 166 Abs. 2 SchKG) beginnen am Tag nach der Zustellung; Stillstand während rechtsvorschlagsbedingtem Gerichtsverfahren.',
    verifiziert: false,
  },
  BGer_5A_730_2023: {
    aktenzeichen: 'BGer 5A_730/2023',
    aussage: 'Entscheide der Aufsichtsbehörde sind i.d.R. keine Betreibungshandlung → keine Verlängerung nach Art. 63 SchKG.',
    verifiziert: false,
  },
  BGer_5A_611_2023: {
    aktenzeichen: 'BGer 5A_611/2023',
    aussage: 'Die Minimalfrist beim Verwertungsbegehren für Grundstücke (Art. 116 SchKG) liegt im Schuldnerinteresse.',
    verifiziert: false,
  },
  BGer_5A_545_2017: {
    aktenzeichen: 'BGer 5A_545/2017',
    aussage: 'Arresteinsprache (Art. 278 SchKG): Nur die Einsprache ist fristgebunden; die Begründung kann auf Fristansetzung nachgereicht werden.',
    verifiziert: false,
  },
  BGer_5A_288_2012: {
    aktenzeichen: 'BGer 5A_288/2012',
    aussage: 'Arrestprosekution (Art. 279 SchKG): «Einleitung» bedeutet Stellung des Betreibungsbegehrens.',
    verifiziert: false,
  },
  BGer_5A_852_2014: {
    aktenzeichen: 'BGer 5A_852/2014',
    aussage: 'Lastenbereinigung (Art. 140 SchKG): Die Bestreitung muss nicht substantiiert werden.',
    verifiziert: false,
  },

  // Mietrecht (Art. 253 ff. OR)
  BGE_137_III_208: {
    aktenzeichen: 'BGE 137 III 208',
    aussage:
      'Absolute Empfangstheorie für den Zugang der Kündigung; Schutz der Familienwohnung auch bei Geschäftsräumen, die zugleich Familienwohnung sind.',
    verifiziert: false,
  },
  BGE_140_III_244: {
    aktenzeichen: 'BGE 140 III 244',
    aussage: 'Zugang nach absoluter Empfangstheorie; die zivilprozessuale 7-Tage-Zustellfiktion gilt im materiellen Recht nicht.',
    verifiziert: false,
  },
  BGE_119_II_147: {
    aktenzeichen: 'BGE 119 II 147',
    aussage: 'Die Zahlungsfrist nach Art. 257d OR beginnt nach der relativen Empfangstheorie.',
    verifiziert: false,
  },
  BGE_107_II_189: {
    aktenzeichen: 'BGE 107 II 189',
    aussage: 'Relative Empfangstheorie bei der Mietzinserhöhung (Art. 269d OR).',
    verifiziert: false,
  },
  BGer_4C_375_2000: {
    aktenzeichen: 'BGer 4C.375/2000',
    aussage:
      'Wichtiger Grund (Art. 266g OR) bejaht bei panikartigen Angstzuständen nach Einbruch (ernsthafte Krankheit); Ende unter Wahrung der gesetzlichen Frist.',
    verifiziert: false,
  },
  BGer_5A_691_2023: {
    aktenzeichen: 'BGer 5A_691/2023',
    aussage:
      'Monatsfristen knüpfen am Tag des fristauslösenden Ereignisses an (nicht am Folgetag) – einheitliche Methode für materielles Recht und Prozessrecht.',
    verifiziert: false,
  },
};

/** Liefert einen Rechtsprechungshinweis aus dem zentralen Register. */
export function rechtsprechung(id: keyof typeof VERIFIKATION): Rechtsprechungshinweis {
  const e = VERIFIKATION[id];
  return { aktenzeichen: e.aktenzeichen, aussage: e.aussage, verifiziert: e.verifiziert };
}
