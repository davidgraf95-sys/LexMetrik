// ─── Eidg. Emissionsabgabe auf Beteiligungsrechte ──────────────────────────
//
// StG (SR 641.10), Art. 8 Abs. 1 i.V.m. Art. 6 Abs. 1 lit. h: 1 % auf den
// CHF 1 Mio ÜBERSTEIGENDEN Teil von Nennwert + Agio. Art. 6 Abs. 1 lit. h
// normiert einen **Freibetrag** (nicht eine Freigrenze): befreit, «soweit die
// Leistungen der Gesellschafter gesamthaft eine Million Franken nicht
// übersteigen» — nur der übersteigende Teil ist steuerbar (gefestigte
// ESTV-Praxis, Bundesstempelabgabe; Wortlaut am Fedlex-Cache verifiziert,
// Stand 1.1.2024 = neuste Konsolidierung).
//
// §5: EINZIGE Quelle für Satz + Freibetrag dieses Bundessteuer-Tatbestands.
// Die anwendenden Engines (gruendungsunterlagen, beurkundungZusatzkosten) legen
// ihre je eigene Null-/Rundungs-Konvention über das Rohergebnis (A4-3b,
// 25.6.2026): vorher war die Regel in beiden Engines dupliziert und konnte
// einseitig driften.

export const EMISSIONSABGABE_FREIBETRAG_CHF = 1_000_000;
export const EMISSIONSABGABE_SATZ = 0.01;

/** Roh-Emissionsabgabe (ungerundet): 1 % des den Freibetrag übersteigenden
 *  Teils der Leistungen; 0, soweit der Freibetrag nicht überschritten wird. */
export function emissionsabgabeRoh(leistungenChf: number): number {
  return Math.max(0, leistungenChf - EMISSIONSABGABE_FREIBETRAG_CHF) * EMISSIONSABGABE_SATZ;
}
