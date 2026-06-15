// ─── Kosten vor dem Bundesgericht (Zivilverfahren) ──────────────────────────
//
// FAHRPLAN-PROZESSKOSTEN-COCKPIT I-Instanz: oberste Stufe. Bundesrechtlich,
// kantonsunabhängig. Amtlich DOPPELT verifiziert (zwei Fedlex-Manifestationen,
// Dossier bibliothek/recherche/prozesskosten-bundesgericht.md). Abnahme David
// ausstehend (§7). Jeder Wert normhinterlegt.

import type { TarifRegel } from '../../lib/tarif/staffel';

const INF = Infinity;

export interface BgerTarif {
  erlassName: string;
  erlassNr: string;
  artikel: string;
  quelleUrl: string;
  stand: string;
  regel: TarifRegel;
  hinweis?: string;
  /** true = Betrag bereits inkl. MwSt (kein MwSt-Aufschlag, §1/§8). */
  mwstInbegriffen?: boolean;
}

const GK_QUELLE = {
  erlassName: 'Tarif für die Gerichtsgebühren im Verfahren vor dem Bundesgericht',
  erlassNr: 'SR 173.110.210.1 (i.V.m. Art. 65 BGG)',
  quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/2006/837/de',
  stand: '1.1.2007 (BGG Stand 1.4.2026)',
};
const PE_QUELLE = {
  erlassName: 'Reglement über die Parteientschädigung vor dem Bundesgericht',
  erlassNr: 'SR 173.110.210.3 (i.V.m. Art. 68 BGG)',
  quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/2006/839/de',
  stand: '1.1.2007 (BGG Stand 1.4.2026)',
};

/** Gerichtskosten BGer, vermögensrechtlich (Tarif Ziff. 1, Art. 65 III lit. b). */
export const BGER_GERICHTSKOSTEN: BgerTarif = {
  ...GK_QUELLE, artikel: 'Art. 65 BGG / Tarif Ziff. 1',
  hinweis: 'Bemessung nach Streitwert/Umfang/Schwierigkeit/Prozessführung/finanzieller Lage (Art. 65 Abs. 2 BGG); Überschreitung bis zum Doppelten möglich (Abs. 5).',
  regel: { typ: 'staffel_rahmen', baender: [
    { grenzeChf: 10000, minChf: 200, maxChf: 5000 },
    { grenzeChf: 20000, minChf: 500, maxChf: 5000 },
    { grenzeChf: 50000, minChf: 1000, maxChf: 5000 },
    { grenzeChf: 100000, minChf: 1500, maxChf: 5000 },
    { grenzeChf: 200000, minChf: 2000, maxChf: 8000 },
    { grenzeChf: 500000, minChf: 3000, maxChf: 12000 },
    { grenzeChf: 1000000, minChf: 5000, maxChf: 20000 },
    { grenzeChf: 5000000, minChf: 7000, maxChf: 40000 },
    { grenzeChf: 10000000, minChf: 10000, maxChf: 60000 },
    { grenzeChf: INF, minChf: 20000, maxChf: 100000 },
  ] },
};

/** Reduzierter Ansatz Art. 65 Abs. 4 BGG (streitwertUNabhängig): Sozialvers.-
 *  leistungen, Geschlechterdiskriminierung, Arbeit bis Streitwert 30'000, BehiG.
 *  ACHTUNG: Mietrecht ist hier NICHT erfasst (ordentlicher Tarif). */
export const BGER_GERICHTSKOSTEN_REDUZIERT: BgerTarif = {
  ...GK_QUELLE, artikel: 'Art. 65 Abs. 4 BGG',
  hinweis: 'Reduzierter Ansatz (streitwertunabhängig); Überschreitung bis CHF 10 000 (Art. 65 Abs. 5).',
  regel: { typ: 'rahmen', vonChf: 200, bisChf: 1000 },
};

/** Ohne Vermögensinteresse (Art. 65 Abs. 3 lit. a BGG). */
export const BGER_GERICHTSKOSTEN_OHNE_VERMOEGEN: BgerTarif = {
  ...GK_QUELLE, artikel: 'Art. 65 Abs. 3 lit. a BGG',
  regel: { typ: 'rahmen', vonChf: 200, bisChf: 5000 },
};

/** Parteientschädigung BGer, Beschwerdeverfahren (Reglement Art. 4). */
export const BGER_PARTEIENTSCHAEDIGUNG: BgerTarif = {
  ...PE_QUELLE, artikel: 'Art. 68 BGG / Reglement Art. 4', mwstInbegriffen: true,
  hinweis: 'Honorar inkl. MwSt (Art. 12 Abs. 1 Reglement); Über-/Unterschreitung bei ausserordentlichem Aufwand (Art. 8).',
  regel: { typ: 'staffel_rahmen', baender: [
    { grenzeChf: 20000, minChf: 600, maxChf: 4000 },
    { grenzeChf: 50000, minChf: 1500, maxChf: 6000 },
    { grenzeChf: 100000, minChf: 3000, maxChf: 10000 },
    { grenzeChf: 500000, minChf: 5000, maxChf: 15000 },
    { grenzeChf: 1000000, minChf: 7000, maxChf: 22000 },
    { grenzeChf: 2000000, minChf: 8000, maxChf: 30000 },
    { grenzeChf: 5000000, minChf: 12000, maxChf: 50000 },
    { grenzeChf: INF, minChf: 20000, maxProzent: 1 },
  ] },
};

/** Parteientschädigung BGer ohne Vermögensinteresse (Reglement Art. 6). */
export const BGER_PARTEIENTSCHAEDIGUNG_OHNE_VERMOEGEN: BgerTarif = {
  ...PE_QUELLE, artikel: 'Art. 68 BGG / Reglement Art. 6', mwstInbegriffen: true,
  hinweis: 'Honorar inkl. MwSt (Art. 12 Abs. 1 Reglement).',
  regel: { typ: 'rahmen', vonChf: 600, bisChf: 18000 },
};
