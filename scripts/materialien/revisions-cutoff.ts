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
  // ── MWST-Teilrevision: in Kraft 1.1.2025 (AS 2024 438) — konservativ (Liste = M1) ──
  MWSTG: {
    art: 'cutoff',
    datum: '2025-01-01',
    artikelListe: null, // konservativ: Cutoff für ALLE Artikel, bis die Revisions-Liste erhoben ist (M1).
    norm: 'MWSTG (Teilrevision 2025)',
    sr: '641.20',
    eli: 'https://www.fedlex.admin.ch/eli/cc/2009/615/de',
    begruendung: 'Teilrevision in Kraft 1.1.2025 (AS 2024 438); Korpus-Stand 2025-03-31. Konservativ (§1).',
  },
  MWSTV: {
    art: 'cutoff',
    datum: '2025-01-01',
    artikelListe: null, // analog konservativ.
    norm: 'MWSTV (Teilrevision 2025)',
    sr: '641.201',
    eli: 'https://www.fedlex.admin.ch/eli/cc/2009/828/de',
    begruendung: 'Teilrevision in Kraft 1.1.2025 analog MWSTG; Korpus-Stand 2025-01-01. Konservativ (§1).',
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
