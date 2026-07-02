// ─── Weitere Transaktionskosten neben der Beurkundungsgebühr ────────────────
//
// FAHRPLAN-BEURKUNDUNGS-AUSBAU (Direktive David: «sind wirklich alle Kosten
// abgedeckt?»). Deterministische Bundes-Zusatzkosten, die neben der kantonalen
// Notariatsgebühr anfallen — damit der Rechner die GESAMTEN Transaktionskosten
// zeigt (§8: ehrlich, was enthalten ist und was nicht):
//   1. MwSt 8,1 % auf die Notariatsgebühr — nur freies Notariat (hoheitliches
//      Amtsnotariat ist von der MwSt ausgenommen).
//   2. Handelsregistergebühr des Bundes (GebV-HReg) — feste Pauschale je Vorgang.
//   3. Emissionsabgabe (StG) — 1 % auf den den Freibetrag 1 Mio. übersteigenden
//      Teil des AG/GmbH-Kapitals (Freibetrag, nicht Freigrenze; Art. 6 Abs. 1 lit. h StG).
//
// Quelle/Verifikation: doppelt verifiziert gegen Fedlex (StG SR 641.10 Stand
// 1.1.2024; GebV-HReg SR 221.411.1 Stand 1.1.2021). Auslagen (Porti, Auszüge,
// Publikation), kantonale Pfandrechtssteuern und Verkehrs-/Gewinnsteuern bleiben
// bewusst draussen (eigene Regimes) — die UI legt das offen.

import { MWST_NORMALSATZ_PROZENT, type KantonCode } from '../data/tarif/typen';
import type { GeschaeftsartId } from '../data/tarif/beurkundung-typen';
import type { Spanne } from './notariatGrundbuch';
import { EMISSIONSABGABE_FREIBETRAG_CHF, emissionsabgabeRoh } from './emissionsabgabe';

/** Kantone, deren Notariatsgebühr der MwSt 8,1 % unterliegt (freies/privat-
 *  wirtschaftliches Notariat). Hoheitliches Amtsnotariat (z. B. ZH, NW, TG) ist
 *  von der MwSt ausgenommen. Diese Menge muss konsistent mit `notariate.ts`
 *  (`system: 'frei'`) bleiben — Quelle dort ist führend (§5).
 *  A4-1 (25.6.2026): LU ergänzt — Luzern ist freies Notariat (notariate.ts:41
 *  «Notarenregister Kanton Luzern», bibliothek/kosten/notariatstarife-gruendung-
 *  kantone.md «LU — Luzern (freies Notariat)»); der frühere Kommentar führte LU
 *  fälschlich als Amtsnotariat → MwSt fiel für ganz LU still weg.
 *  OFFEN (David): OW ist in `notariate.ts` als `gemischt` geführt und hier als
 *  MwSt-pflichtig gelistet; die MwSt-Behandlung der `gemischt`-Kantone
 *  (SZ/GL/ZG/SO/AR/AI/SG) ist einzelfallabhängig und bewusst NICHT verändert. */
export const FREIES_NOTARIAT: ReadonlySet<KantonCode> = new Set<KantonCode>(
  ['BE', 'LU', 'UR', 'OW', 'FR', 'BS', 'BL', 'GR', 'AG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'],
);

export const MWST_QUELLE = { erlass: 'MWSTG (SR 641.20), Art. 25 Abs. 1', url: 'https://www.fedlex.admin.ch/eli/cc/2009/615/de', stand: '1.1.2024' };

/** Handelsregistergebühr des Bundes (GebV-HReg, SR 221.411.1, Anhang zu Art. 3
 *  Abs. 1, Stand 1.1.2021) — feste Gesamtgebühr je Tatsache (davon 90 % Kanton /
 *  10 % Bund, Art. 8; der Kunde zahlt den Gesamtbetrag). */
export const HREG_GEBUEHR: Partial<Record<GeschaeftsartId, { chf: number; ziffer: string }>> = {
  ag_gruendung: { chf: 420, ziffer: 'Anhang Ziff. 1.3' },
  gmbh_gruendung: { chf: 420, ziffer: 'Anhang Ziff. 1.3' },
  genossenschaft_gruendung: { chf: 280, ziffer: 'Anhang Ziff. 1.4' },
  stiftung: { chf: 210, ziffer: 'Anhang Ziff. 1.6' },
  kapitalerhoehung: { chf: 200, ziffer: 'Anhang Ziff. 1.3 (Statutenänderung)' },
  kapitalherabsetzung: { chf: 200, ziffer: 'Anhang Ziff. 1.3 (Statutenänderung)' },
  statutenaenderung: { chf: 200, ziffer: 'Anhang Ziff. 1.3' },
  fusion: { chf: 420, ziffer: 'Anhang Ziff. 2.1 (übernehmende Rechtseinheit)' },
};

export const HREG_QUELLE = { erlass: 'GebV-HReg (SR 221.411.1), Anhang zu Art. 3', url: 'https://www.fedlex.admin.ch/eli/cc/2020/180/de', stand: '1.1.2021' };

/** Geschäftsarten, bei denen die Emissionsabgabe (Schaffung/Erhöhung von
 *  Beteiligungsrechten an AG/GmbH) anfällt. */
export const EMISSIONSABGABE_ARTEN: ReadonlySet<GeschaeftsartId> = new Set<GeschaeftsartId>(
  ['ag_gruendung', 'gmbh_gruendung', 'kapitalerhoehung'],
);

export const EMISSIONSABGABE_QUELLE = { erlass: 'StG (SR 641.10), Art. 8 Abs. 1 i.V.m. Art. 6 Abs. 1 lit. h', url: 'https://www.fedlex.admin.ch/eli/cc/1974/11_11_11/de', stand: '1.1.2024' };

/** Emissionsabgabe für die Zusatzkosten-Anzeige: auf ganze Franken gerundet,
 *  0 bei fehlender/zu kleiner Bemessung. Satz + Freibetrag (Freibetrag, nicht
 *  Freigrenze — nur der übersteigende Teil ist steuerbar) kommen aus der zentralen
 *  §5-Quelle `./emissionsabgabe` (A4-3b); hier nur die Rundungs-/Null-Konvention. */
export function emissionsabgabe(bemessungChf: number): number {
  if (!Number.isFinite(bemessungChf) || bemessungChf <= EMISSIONSABGABE_FREIBETRAG_CHF) return 0;
  return Math.round(emissionsabgabeRoh(bemessungChf));
}

/** MwSt 8,1 % auf die Notariatsgebühr (nur freies Notariat). */
export function mwstAufschlag(gebuehrChf: number): number {
  return Math.round((gebuehrChf * MWST_NORMALSATZ_PROZENT) / 100);
}

/** Kantonale Pfandrechtssteuer/-abgabe bei Errichtung eines Grundpfands
 *  (zusätzlich zu Notariats-/Grundbuchgebühr; nur einzelne Kantone, z. B.
 *  FR/GE/VS/JU). Satz in % der Pfandsumme. Quelle: amtlich verifiziert
 *  (FAHRPLAN-LUECKEN-SCHLIESSEN L3). Leer = Kanton erhebt keine. */
export const PFANDSTEUER: Partial<Record<KantonCode, { satzProzent: number; artikel: string; url: string; stand: string; freigrenzeChf?: number; basisAbrundenChf?: number; mindestChf?: number }>> = {
  FR: { satzProzent: 0.75, artikel: "Art. 23 al. 1 i.V.m. Art. 5 al. 1 lit. a Loi sur les droits de mutation et les droits sur les gages immobiliers (LDMG, RSF 635.1.1)", url: "https://bdlf.fr.ch/app/fr/texts_of_law/635.1.1", stand: "2024-03-01" },
  GE: { satzProzent: 0.65, artikel: "LDE (RSG D 3 30) Art. 84 et Art. 85", url: "https://silgeneve.ch/legis/data/rsg_d3_30.htm", stand: "2026-03-21" },
  // JU: 3,5 o/oo, gesetzlicher Mindestbetrag CHF 30 (Art. 13 al. 1: "et de 30 francs au moins").
  JU: { satzProzent: 0.35, mindestChf: 30, artikel: "Loi reglant les droits de mutation et les droits percus pour la constitution de gages (RSJU 215.326.2), Art. 1, Art. 11 et Art. 13 al. 1 (mind. 30 fr.)", url: "https://rsju.jura.ch/fr/viewdocument.html?idn=20037&id=33943&download=1", stand: "1978-11-09" },
  // VD: Freigrenze (kein Freibetrag) — Pfandsummen bis und mit CHF 5'000 sind nach
  // LTim Art. 3 al. 3 steuerbefreit; darüber ganze Pfandsumme × 2 o/oo.
  // VD: 2 o/oo; Bemessungsbasis auf die vollen tausend Franken abgerundet (Art. 3 al. 2: "arrondie aux mille francs inferieurs").
  VD: { satzProzent: 0.2, freigrenzeChf: 5000, basisAbrundenChf: 1000, artikel: "Loi sur le droit de timbre (LTim, BLV 652.11) du 10.12.2013, Art. 1 (objet: contrats de gages immobiliers art. 793ss CC), Art. 3 al. 2 (taux 2 o/oo, base arrondie aux mille francs inferieurs) et al. 3 (exoneration <= 5'000 fr.), Art. 4 (perception par le Registre foncier)", url: "https://www.lexfind.ch/tolv/119178/fr", stand: "01.01.2014" },
  VS: { satzProzent: 0.2, artikel: "Art. 1, 8, 11 Abs. 1 lit. c und Art. 16 lit. b Loi sur les droits de mutations (LDM), RS 643.1", url: "https://lex.vs.ch/app/fr/texts_of_law/643.1", stand: "1.1.2013" },
};

export interface Zusatzposten {
  label: string;
  /** Betrag oder Spanne (CHF). */
  von: number;
  bis: number;
  erlass: string;
  url: string;
  stand: string;
  hinweis?: string;
}

// Spanne aus notariatGrundbuch trägt Felder vonChf/bisChf — hier lokal normalisiert.
type SpanneN = { von: number; bis: number };
const norm = (s: Spanne): SpanneN => ({ von: s.vonChf, bis: s.bisChf });

/** Berechnet die weiteren Transaktionskosten neben der Beurkundungsgebühr.
 *  `gebuehr` = bezifferbare Beurkundungsgebühr-Spanne (null wenn nicht beziffert
 *  → dann auch keine MwSt-Bezifferung). `wertChf` = Geschäftswert (Kapital). */
export function weitereKosten(
  art: GeschaeftsartId,
  kanton: KantonCode,
  wertChf: number | undefined,
  gebuehr: Spanne | null,
): { posten: Zusatzposten[]; freiesNotariat: boolean } {
  const posten: Zusatzposten[] = [];
  const freiesNotariat = FREIES_NOTARIAT.has(kanton);

  // 1. MwSt auf die Notariatsgebühr (nur freies Notariat, nur wenn beziffert).
  if (freiesNotariat && gebuehr) {
    const g = norm(gebuehr);
    posten.push({
      label: `MwSt ${MWST_NORMALSATZ_PROZENT} % (freies Notariat)`,
      von: mwstAufschlag(g.von), bis: mwstAufschlag(g.bis),
      erlass: MWST_QUELLE.erlass, url: MWST_QUELLE.url, stand: MWST_QUELLE.stand,
    });
  }

  // 2. Handelsregistergebühr des Bundes (feste Pauschale).
  const hreg = HREG_GEBUEHR[art];
  if (hreg) {
    posten.push({
      label: 'Handelsregistergebühr (Bund)',
      von: hreg.chf, bis: hreg.chf,
      erlass: `${HREG_QUELLE.erlass}, ${hreg.ziffer}`, url: HREG_QUELLE.url, stand: HREG_QUELLE.stand,
      hinweis: 'Feste Gebühr je Eintragung; weitere Tatsachen/Belege können zusätzliche Positionen auslösen.',
    });
  }

  // 2b. Kantonale Pfandrechtssteuer bei Schuldbrief-/Grundpfand-Errichtung.
  const pfand = PFANDSTEUER[kanton];
  if (pfand && art === 'schuldbrief' && wertChf !== undefined) {
    // Freigrenze: bis und mit dem Schwellenwert steuerbefreit (z. B. VD ≤ 5'000).
    const befreit = pfand.freigrenzeChf !== undefined && wertChf <= pfand.freigrenzeChf;
    // Basis-Abrundung (VD LTim Art. 3 al. 2: auf die vollen tausend Franken).
    const basis = pfand.basisAbrundenChf ? Math.floor(wertChf / pfand.basisAbrundenChf) * pfand.basisAbrundenChf : wertChf;
    let betrag = befreit ? 0 : Math.round((basis * pfand.satzProzent) / 100);
    // Gesetzlicher Mindestbetrag (JU RSJU 215.326.2 Art. 13 al. 1: mind. 30 fr.).
    if (!befreit && pfand.mindestChf !== undefined) betrag = Math.max(betrag, pfand.mindestChf);
    posten.push({
      label: `Pfandrechtssteuer (${pfand.satzProzent} %)`,
      von: betrag, bis: betrag,
      erlass: pfand.artikel, url: pfand.url, stand: pfand.stand,
      hinweis: befreit
        ? `Pfandsumme bis CHF ${pfand.freigrenzeChf!.toLocaleString('de-CH')}: steuerbefreit (Freigrenze).`
        : 'Kantonale Abgabe auf die Pfandsumme bei Errichtung des Grundpfands.',
    });
  }

  // 3. Emissionsabgabe (1 % auf den CHF 1 Mio übersteigenden Teil = Freibetrag), nur AG/GmbH-Kapital.
  if (EMISSIONSABGABE_ARTEN.has(art) && wertChf !== undefined) {
    const abgabe = emissionsabgabe(wertChf);
    // §8-Ehrlichkeit (QS-GP 2.7.2026): Der 1-Mio-Freibetrag gilt nach Art. 6 Abs. 1
    // lit. h StG GESAMTHAFT über alle Leistungen der Gesellschafter (Gründung + alle
    // früheren Erhöhungen), nicht je isoliertem Vorgang. Bei einer Kapitalerhöhung ist
    // er darum meist schon aufgebraucht → dann ist der ganze Erhöhungsbetrag zu 1 %
    // steuerbar. Mangels Eingabe der bisherigen Leistungen wird er hier auf den
    // isolierten Erhöhungsbetrag angewendet; das wird offengelegt (Wert kann zu tief sein).
    const kumulNote = art === 'kapitalerhoehung'
      ? ' Bei Kapitalerhöhungen gilt der Freibetrag von CHF 1 Mio. gesamthaft über alle bisherigen Leistungen (Gründung + frühere Erhöhungen) und ist meist bereits aufgebraucht — dann ist der ganze Erhöhungsbetrag zu 1 % steuerbar. Hier wird er auf den isolierten Erhöhungsbetrag angewendet; der ausgewiesene Betrag kann daher zu tief sein.'
      : '';
    posten.push({
      label: 'Emissionsabgabe (StG)',
      von: abgabe, bis: abgabe,
      erlass: EMISSIONSABGABE_QUELLE.erlass, url: EMISSIONSABGABE_QUELLE.url, stand: EMISSIONSABGABE_QUELLE.stand,
      // A4-3a: Art. 6 Abs. 1 lit. h StG ist ein FREIBETRAG (nur der übersteigende Teil
      // ist steuerbar), keine Freigrenze (ganzer Betrag) — Text an die Rechnung angeglichen.
      hinweis: (abgabe === 0
        ? 'Kapital (inkl. Agio) bis CHF 1 Mio: abgabefrei (Freibetrag Art. 6 Abs. 1 lit. h StG).'
        : 'Bemessung Nennwert + Agio; steuerbar ist nur der CHF 1 Mio übersteigende Teil (Freibetrag Art. 6 Abs. 1 lit. h StG). Befreiungen (Sanierung, Umstrukturierung Art. 6 StG) nicht berücksichtigt.') + kumulNote,
    });
  }

  return { posten, freiesNotariat };
}
