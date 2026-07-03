// ─── Verzahnungs-Glossar: Fachbegriffe laientauglich erklärt ────────────────
//
// EINE Quelle (§5) für die kurzen Erklärtexte, die `Begriff` (Tooltip) und
// `StatusBadge` (Prädikat-Erklärung) konsumieren. Steuerbeamte/Studierende sollen
// die Verzahnung ohne Insider-Vokabular lesen können (§13 A3: Fachjargon erklärt).
// Reine Datenschicht (§3). §7-Statusprädikat bleibt Davids Abnahme vorbehalten —
// wo Herkunft «kuratiert» verbalisiert wird, heisst es «strukturiert erfasst».

export interface GlossarEintrag {
  /** Angezeigter Begriff (Kurzform). */
  begriff: string;
  /** Ein bis zwei kurze Sätze, aktiv, ohne Schachtelsätze (§13 A1). */
  erklaerung: string;
}

export const GLOSSAR = {
  leitentscheid: {
    begriff: 'Leitentscheid',
    erklaerung: 'Amtlich publizierter Bundesgerichtsentscheid (BGE) — vom Bundesgericht selbst als wegweisend eingestuft.',
  },
  bge: {
    begriff: 'BGE',
    erklaerung: 'Amtliche Sammlung der Bundesgerichtsentscheide. Zitiert als Band, Teil und Seite, z. B. «BGE 147 III 209».',
  },
  regeste: {
    begriff: 'Regeste',
    erklaerung: 'Amtlicher Leitsatz zu Beginn eines publizierten Entscheids — fasst die Rechtsfrage und die Antwort zusammen.',
  },
  erwaegung: {
    begriff: 'Erwägung',
    erklaerung: 'Nummerierter Begründungsabschnitt eines Urteils (zitiert als «E. 3»). Hier legt das Gericht seine Überlegungen dar.',
  },
  dispositiv: {
    begriff: 'Dispositiv',
    erklaerung: 'Der verbindliche Urteilsspruch am Ende eines Entscheids — was das Gericht anordnet (Gutheissung, Abweisung, Kosten).',
  },
  ivm: {
    begriff: 'i.V.m.',
    erklaerung: '«in Verbindung mit» — verweist auf eine zweite Bestimmung, die gemeinsam mit der ersten anzuwenden ist.',
  },
  inkraft: {
    begriff: 'in Kraft',
    erklaerung: 'Das Datum, ab dem die gezeigte Fassung einer Bestimmung gilt. Massgeblich ist stets die amtliche Quelle.',
  },
  sr: {
    begriff: 'SR',
    erklaerung: 'Systematische Rechtssammlung des Bundes — die Nummer (z. B. SR 220 für das OR) identifiziert einen Erlass eindeutig.',
  },
  kreisschreiben: {
    begriff: 'Kreisschreiben',
    erklaerung: 'Verwaltungsanweisung einer Behörde (z. B. ESTV) zur einheitlichen Rechtsanwendung — kein Gesetzesrang.',
  },
  fundstelle: {
    begriff: 'Fundstelle',
    erklaerung: 'Die genaue Textstelle, an der eine Norm zitiert oder eine Aussage getroffen wird — hier der Sprung zur Erwägung oder zum Artikel.',
  },
  erlass: {
    begriff: 'Erlass',
    erklaerung: 'Ein Gesetz oder eine Verordnung als Ganzes (z. B. das Obligationenrecht), zusammengesetzt aus einzelnen Artikeln.',
  },
  norm: {
    begriff: 'Norm',
    erklaerung: 'Eine einzelne Rechtsbestimmung — meist ein Artikel oder Absatz eines Erlasses.',
  },
  vorinstanz: {
    begriff: 'Vorinstanz',
    erklaerung: 'Das Gericht oder die Behörde, deren Entscheid vor der aktuellen Instanz angefochten wurde.',
  },
  rechtskraft: {
    begriff: 'Rechtskraft',
    erklaerung: 'Ein Entscheid ist rechtskräftig, wenn er nicht mehr mit einem ordentlichen Rechtsmittel angefochten werden kann.',
  },
  materialien: {
    begriff: 'Materialien',
    erklaerung: 'Amtliche Publikationen zur Auslegung (Botschaften, Kreisschreiben, Wegleitungen) — Auslegungshilfe, kein Gesetzesrang.',
  },
} as const satisfies Record<string, GlossarEintrag>;

export type GlossarSchluessel = keyof typeof GLOSSAR;

/** Erklärtext zu einem Schlüssel (oder ''), zentral abgefragt (§5). */
export function glossarErklaerung(schluessel: GlossarSchluessel): string {
  return GLOSSAR[schluessel].erklaerung;
}
