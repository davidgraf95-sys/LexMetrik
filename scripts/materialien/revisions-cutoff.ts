// scripts/materialien/revisions-cutoff.ts
// E6a Stufe 1 (FAHRPLAN-MATERIALIEN-VERZAHNUNG §2.4): Revisions-Cutoff-Tabelle je erlass_key.
//
// WARUM (§0/A1 — Blocker): Drift-Tokens überwachen nur die QUELLE, nie die Ziel-Norm. Ein
// Dokument-Stand VOR einer Totalrevision darf nicht artikelscharf auf die HEUTIGE (revidierte)
// Nummerierung verweisen — die Artikel-Bedeutung hat sich verschoben. Regel: artikelscharfe
// Kante nur, wenn Dokument-/Kanten-`stand` ≥ Cutoff des erlass_key; sonst deterministischer
// Downgrade auf Erlass-Ebene (artikel=''), nie stummer Drop (§2.4, Tor-erzwungen).
//
// KONSERVATIV-REGEL (bindend, §1 Treue vor Präzision): solange die kuratierte
// Revisions-Artikel-Liste NICHT mit Doppel-Verifikation erhoben ist (M1-Posten), gilt der
// Cutoff für ALLE Artikel des Erlasses (`artikelListe: null`). Das erzeugt bewusst MEHR
// Downgrades als nötig — nie aber eine falsche artikelscharfe Kante. Eine künftige Liste
// (`artikelListe: string[]`) beschränkt den Cutoff auf die tatsächlich geänderten/neuen Artikel.
//
// Provenienz je Zeile: Norm + SR + Fedlex-ELI + Korpus-Stand (aus dem committeten
// public/normtext/register.json, verifiziert — Daueranweisung doppelt-verifizieren).
// Erlass-Keys = Korpus-Keys (GROSS, wie public/normtext/register.json).

export interface CutoffDatum {
  art: 'cutoff';
  /** ISO YYYY-MM-DD; artikelscharfe Kante nur mit Dokument-Stand ≥ diesem Datum. */
  datum: string;
  /** null = konservativ (Cutoff für ALLE Artikel); string[] = nur diese (revidierten) Artikel. */
  artikelListe: string[] | null;
  norm: string;
  sr: string;
  eli: string;
  begruendung: string;
}

export interface KeinCutoff {
  art: 'kein-cutoff';
  norm: string;
  sr: string;
  eli: string;
  begruendung: string;
}

export type CutoffEintrag = CutoffDatum | KeinCutoff;

const KEIN_CUTOFF_GRUND =
  'kein Gesamtrevisions-Cutoff — keine Totalrevision/umfassende Teilrevision im relevanten Fenster; ' +
  'artikelscharfe Kanten zulässig, Staleness-Anzeige bleibt UI-Pflicht (§2.4)';

export const REVISIONS_CUTOFF: Readonly<Record<string, CutoffEintrag>> = {
  // ── Totalrevision revDSG: in Kraft 1.9.2023 (AS 2022 491) — Nummerierung komplett neu ──
  DSG: {
    art: 'cutoff',
    datum: '2023-09-01',
    artikelListe: null,
    norm: 'DSG (Totalrevision revDSG)',
    sr: '235.1',
    eli: 'https://www.fedlex.admin.ch/eli/cc/2022/491/de',
    begruendung: 'Totalrevision revDSG in Kraft 1.9.2023 (AS 2022 491); Korpus-Stand 2025-07-07.',
  },
  DSV: {
    art: 'cutoff',
    datum: '2023-09-01',
    artikelListe: null,
    norm: 'DSV (neue Datenschutzverordnung)',
    sr: '235.11',
    eli: 'https://www.fedlex.admin.ch/eli/cc/2022/568/de',
    begruendung: 'In Kraft mit revDSG am 1.9.2023 (AS 2022 568); Korpus-Stand 2025-12-01.',
  },
  // ── MWST-Teilrevision: in Kraft 1.1.2025 (AS 2024 438 / AS 2024 485) ──
  // Kuratierte Revisions-Artikel-Listen (M1-Posten, erhoben 4.7.2026, DOPPELT verifiziert über zwei
  // unabhängige Routen: (A) mod-Ziele der AS-Änderungserlasse [eli/oc/2024/438 bzw. /485, AKN-XML]
  // × (B) Fussnoten «in Kraft/mit Wirkung seit 1. Jan. 2025» der gepinnten Konsolidierungen
  // [cc/2009/615@20250331 bzw. cc/2009/828@20250101]. MWSTG: A == B (34 Artikel). MWSTV: B ⊂ A;
  // Liste = UNION (konservativ, §1 — A-Zusätze 76a–d/111b/112 sind mod-Ziele mit abweichendem/
  // gestaffeltem Inkrafttreten; ein Downgrade zu viel ist sicher, einer zu wenig nicht).
  // Token-Format = Korpus-Token (20a → '20_a').
  MWSTG: {
    art: 'cutoff',
    datum: '2025-01-01',
    artikelListe: [
      '1', '3', '5', '8', '10', '13', '15', '18', '20_a', '21', '23', '24', '25', '29', '35',
      '35_a', '40', '45', '53', '63', '67', '73', '74', '79_a', '86', '86_a', '87', '88', '93',
      '93_a', '94', '107', '108', '115_b',
    ],
    norm: 'MWSTG (Teilrevision vom 16. Juni 2023)',
    sr: '641.20',
    eli: 'https://www.fedlex.admin.ch/eli/cc/2009/615/de',
    begruendung: 'Teilrevision in Kraft 1.1.2025 (AS 2024 438, https://www.fedlex.admin.ch/eli/oc/2024/438/de); Korpus-Stand 2025-03-31. Artikel-Liste doppelt erhoben 4.7.2026 (AS-Mods × Konsolidierungs-Fussnoten, deckungsgleich).',
  },
  MWSTV: {
    art: 'cutoff',
    datum: '2025-01-01',
    artikelListe: [
      '4_a', '17_a', '18', '19', '20', '29', '35', '38', '43_a', '44', '48_e', '61', '63', '75',
      '76_a', '76_b', '76_c', '76_d', '77', '78', '79', '81', '82', '83', '84', '85', '86', '87',
      '88', '89', '90', '91', '92', '93', '94', '95', '97', '98', '99', '99_a', '107', '111_a',
      '111_b', '112', '113', '118', '120', '121_a', '123', '127', '140', '140_a', '150', '151',
      '153', '155', '166_d', '166_e',
    ],
    norm: 'MWSTV (Änderung vom 21. August 2024)',
    sr: '641.201',
    eli: 'https://www.fedlex.admin.ch/eli/cc/2009/828/de',
    begruendung: 'Änderung in Kraft 1.1.2025 (AS 2024 485, https://www.fedlex.admin.ch/eli/oc/2024/485/de); Korpus-Stand 2025-01-01. Artikel-Liste doppelt erhoben 4.7.2026 (AS-Mods × Konsolidierungs-Fussnoten, Union — konservativ §1).',
  },
  // ── Kein Gesamtrevisions-Cutoff (artikelscharfe Kanten zulässig) ──
  ARG: { art: 'kein-cutoff', norm: 'ArG', sr: '822.11', eli: 'https://www.fedlex.admin.ch/eli/cc/1966/57_57_57/de', begruendung: KEIN_CUTOFF_GRUND },
  ARGV1: { art: 'kein-cutoff', norm: 'ArGV 1', sr: '822.111', eli: 'https://www.fedlex.admin.ch/eli/cc/2000/243/de', begruendung: KEIN_CUTOFF_GRUND },
  BGOE: { art: 'kein-cutoff', norm: 'BGÖ', sr: '152.3', eli: 'https://www.fedlex.admin.ch/eli/cc/2006/355/de', begruendung: KEIN_CUTOFF_GRUND },
  DBG: { art: 'kein-cutoff', norm: 'DBG', sr: '642.11', eli: 'https://www.fedlex.admin.ch/eli/cc/1991/1184_1184_1184/de', begruendung: KEIN_CUTOFF_GRUND },
  VSTG: { art: 'kein-cutoff', norm: 'VStG', sr: '642.21', eli: 'https://www.fedlex.admin.ch/eli/cc/1966/371_385_384/de', begruendung: KEIN_CUTOFF_GRUND },
  STG: { art: 'kein-cutoff', norm: 'StG', sr: '641.10', eli: 'https://www.fedlex.admin.ch/eli/cc/1974/11_11_11/de', begruendung: KEIN_CUTOFF_GRUND },
};

/**
 * Prüft, ob eine artikelscharfe Kante wegen der Revisions-Regel auf Erlass-Ebene
 * herabgestuft werden muss. Rein, deterministisch (kein Date.now).
 * @returns true = Downgrade nötig (Dokument-Stand liegt vor der Revision des Artikels).
 */
export function braucheDowngrade(erlassKey: string, artikel: string, dokStand: string): boolean {
  const e = REVISIONS_CUTOFF[erlassKey];
  if (!e || e.art !== 'cutoff') return false; // kein Cutoff hinterlegt ⇒ Revisions-Regel greift nicht
  if (dokStand >= e.datum) return false; // Dokument aktuell genug
  // Dokument-Stand < Cutoff: konservativ (Liste null) ⇒ ALLE Artikel; sonst nur gelistete.
  if (e.artikelListe === null) return true;
  return e.artikelListe.includes(artikel);
}
