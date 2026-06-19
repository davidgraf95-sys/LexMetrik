// ─── Weitere Transaktionskosten neben der Beurkundungsgebühr ────────────────
//
// FAHRPLAN-BEURKUNDUNGS-AUSBAU (Direktive David: «sind wirklich alle Kosten
// abgedeckt?»). Deterministische Bundes-Zusatzkosten, die neben der kantonalen
// Notariatsgebühr anfallen — damit der Rechner die GESAMTEN Transaktionskosten
// zeigt (§8: ehrlich, was enthalten ist und was nicht):
//   1. MwSt 8,1 % auf die Notariatsgebühr — nur freies Notariat (hoheitliches
//      Amtsnotariat ist von der MwSt ausgenommen).
//   2. Handelsregistergebühr des Bundes (GebV-HReg) — feste Pauschale je Vorgang.
//   3. Emissionsabgabe (StG) — 1 % bei AG/GmbH-Kapital über der Freigrenze 1 Mio.
//
// Quelle/Verifikation: doppelt verifiziert gegen Fedlex (StG SR 641.10 Stand
// 1.1.2024; GebV-HReg SR 221.411.1 Stand 1.1.2021). Auslagen (Porti, Auszüge,
// Publikation), kantonale Pfandrechtssteuern und Verkehrs-/Gewinnsteuern bleiben
// bewusst draussen (eigene Regimes) — die UI legt das offen.

import { MWST_NORMALSATZ_PROZENT, type KantonCode } from '../data/tarif/typen';
import type { GeschaeftsartId } from '../data/tarif/beurkundung-typen';
import type { Spanne } from './notariatGrundbuch';

/** Kantone mit freiem (MwSt-pflichtigem) Notariat. Hoheitliches Amtsnotariat
 *  (ZH, LU, SZ, NW, GL, ZG, SO, SH, AR, AI, SG, TG) erhebt keine MwSt. */
export const FREIES_NOTARIAT: ReadonlySet<KantonCode> = new Set<KantonCode>(
  ['BE', 'UR', 'OW', 'FR', 'BS', 'BL', 'GR', 'AG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU'],
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

/** Emissionsabgabe: 1 % auf den CHF 1 Mio ÜBERSTEIGENDEN Teil von Nennwert + Agio.
 *  Art. 6 Abs. 1 lit. h StG normiert einen **Freibetrag** von CHF 1 Mio: befreit,
 *  «soweit die Leistungen der Gesellschafter gesamthaft eine Million Franken nicht
 *  übersteigen» — nur der übersteigende Teil ist steuerbar (gefestigte ESTV-Praxis,
 *  Bundesstempelabgabe). Bug-Audit 19.6.2026 (H6): zuvor fälschlich als Freigrenze
 *  (ganzer Betrag) gerechnet; jetzt deckungsgleich mit gruendungsunterlagen.ts. */
const EMISSIONSABGABE_FREIBETRAG_CHF = 1_000_000;
export function emissionsabgabe(bemessungChf: number): number {
  if (!Number.isFinite(bemessungChf) || bemessungChf <= EMISSIONSABGABE_FREIBETRAG_CHF) return 0;
  return Math.round((bemessungChf - EMISSIONSABGABE_FREIBETRAG_CHF) * 0.01);
}

/** MwSt 8,1 % auf die Notariatsgebühr (nur freies Notariat). */
export function mwstAufschlag(gebuehrChf: number): number {
  return Math.round((gebuehrChf * MWST_NORMALSATZ_PROZENT) / 100);
}

/** Kantonale Pfandrechtssteuer/-abgabe bei Errichtung eines Grundpfands
 *  (zusätzlich zu Notariats-/Grundbuchgebühr; nur einzelne Kantone, z. B.
 *  FR/GE/VS/JU). Satz in % der Pfandsumme. Quelle: amtlich verifiziert
 *  (FAHRPLAN-LUECKEN-SCHLIESSEN L3). Leer = Kanton erhebt keine. */
export const PFANDSTEUER: Partial<Record<KantonCode, { satzProzent: number; artikel: string; url: string; stand: string; freigrenzeChf?: number }>> = {
  FR: { satzProzent: 0.75, artikel: "Art. 23 al. 1 i.V.m. Art. 5 al. 1 lit. a Loi sur les droits de mutation et les droits sur les gages immobiliers (LDMG, RSF 635.1.1)", url: "https://bdlf.fr.ch/app/fr/texts_of_law/635.1.1", stand: "2024-03-01" },
  GE: { satzProzent: 0.65, artikel: "LDE (RSG D 3 30) Art. 84 et Art. 85", url: "https://silgeneve.ch/legis/data/rsg_d3_30.htm", stand: "2026-03-21" },
  JU: { satzProzent: 0.35, artikel: "Loi reglant les droits de mutation et les droits percus pour la constitution de gages (RSJU 215.326.2), Art. 1, Art. 11 et Art. 13 al. 1", url: "https://rsju.jura.ch/fr/viewdocument.html?idn=20037&id=33943&download=1", stand: "1978-11-09" },
  // VD: Freigrenze (kein Freibetrag) — Pfandsummen bis und mit CHF 5'000 sind nach
  // LTim Art. 3 al. 3 steuerbefreit; darüber ganze Pfandsumme × 2 o/oo.
  VD: { satzProzent: 0.2, freigrenzeChf: 5000, artikel: "Loi sur le droit de timbre (LTim, BLV 652.11) du 10.12.2013, Art. 1 (objet: contrats de gages immobiliers art. 793ss CC), Art. 3 al. 2 (taux 2 o/oo) et al. 3 (exoneration <= 5'000 fr.), Art. 4 (perception par le Registre foncier)", url: "https://www.lexfind.ch/tolv/119178/fr", stand: "01.01.2014" },
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
    const betrag = befreit ? 0 : Math.round((wertChf * pfand.satzProzent) / 100);
    posten.push({
      label: `Pfandrechtssteuer (${pfand.satzProzent} %)`,
      von: betrag, bis: betrag,
      erlass: pfand.artikel, url: pfand.url, stand: pfand.stand,
      hinweis: befreit
        ? `Pfandsumme bis CHF ${pfand.freigrenzeChf!.toLocaleString('de-CH')}: steuerbefreit (Freigrenze).`
        : 'Kantonale Abgabe auf die Pfandsumme bei Errichtung des Grundpfands.',
    });
  }

  // 3. Emissionsabgabe (1 % über Freigrenze 1 Mio), nur AG/GmbH-Kapital.
  if (EMISSIONSABGABE_ARTEN.has(art) && wertChf !== undefined) {
    const abgabe = emissionsabgabe(wertChf);
    posten.push({
      label: 'Emissionsabgabe (StG)',
      von: abgabe, bis: abgabe,
      erlass: EMISSIONSABGABE_QUELLE.erlass, url: EMISSIONSABGABE_QUELLE.url, stand: EMISSIONSABGABE_QUELLE.stand,
      hinweis: abgabe === 0
        ? 'Kapital (inkl. Agio) bis CHF 1 Mio: abgabefrei (Freigrenze Art. 6 Abs. 1 lit. h StG).'
        : 'Bemessung Nennwert + Agio; über der Freigrenze 1 Mio ist der ganze Betrag steuerbar. Befreiungen (Sanierung, Umstrukturierung Art. 6 StG) nicht berücksichtigt.',
    });
  }

  return { posten, freiesNotariat };
}
