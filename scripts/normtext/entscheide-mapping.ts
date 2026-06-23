// ─── Deterministische Mappings für die Rechtsprechungs-Pipeline (§2) ─────────
//
// Keine Heuristik im Produktpfad, keine LLM-Zuordnung: alle Tabellen sind
// DEKLARIERT. statutes[] sind Roh-Drittextraktion (NICHT verifiziert) → nur als
// «einschlägig genannt» werten, der Status bleibt 'maschinell'.

import type { Rechtsgebiet } from '../../src/lib/normtext/register';

// Gesetz-Abkürzung (OCL statutes[] / law_code) → Register-key der Gesetzes-Rubrik.
const ABK_REGISTER: Record<string, string> = {
  OR: 'OR', ZGB: 'ZGB', ZPO: 'ZPO', STGB: 'STGB', STPO: 'STPO', BGG: 'BGG',
  SCHKG: 'SCHKG', VVG: 'VVG', VMWG: 'VMWG', ARG: 'ARG', BV: 'BV', DBG: 'DBG',
  DSG: 'DSG', AHVG: 'AHVG', AIG: 'AIG', STG: 'STG', HREGV: 'HREGV',
};

export function normKeyFuerAbk(abk: string): string | null {
  const k = abk.toUpperCase().replace(/[^A-ZÄÖÜ]/g, '');
  return ABK_REGISTER[k] ?? null;
}

/** "Art. 32 Abs. 2 BGG" → ['BGG']; mehrere Nennungen dedupliziert. */
export function statutesZuNormKeys(statutes: string[]): string[] {
  const out = new Set<string>();
  for (const s of statutes ?? []) {
    const m = /([A-Za-zÄÖÜäöü]{2,})\s*$/.exec(String(s).trim());
    if (m) { const k = normKeyFuerAbk(m[1]); if (k) out.add(k); }
  }
  return [...out];
}

// legal_area (OCL) → Sachgebiet-Achse der Gesetze.
const LEGAL_AREA: Array<[string, Rechtsgebiet]> = [
  ['civil', 'privat'], ['zivil', 'privat'], ['private', 'privat'],
  ['criminal', 'straf'], ['straf', 'straf'], ['penal', 'straf'],
  ['debt', 'schkg'], ['betreibung', 'schkg'], ['insolvenc', 'schkg'],
  ['tax', 'sozial-abgaben'], ['steuer', 'sozial-abgaben'], ['social', 'sozial-abgaben'], ['sozial', 'sozial-abgaben'],
  ['procedure', 'prozess'], ['prozess', 'prozess'],
  ['public', 'oeffentlich'], ['administrativ', 'oeffentlich'], ['oeffentlich', 'oeffentlich'],
];
export function legalAreaZuSachgebiet(area: string | null | undefined): Rechtsgebiet | null {
  if (!area) return null;
  const k = String(area).toLowerCase();
  for (const [frag, geb] of LEGAL_AREA) if (k.includes(frag)) return geb;
  return null;
}

// Abteilungs-Konvention des Bundesgerichts (Aktenzeichen-Präfix) → Sachgebiet.
// Deklariert nach amtlicher Geschäftsverteilung (deterministisch, kein Raten).
const ABTEILUNG: Record<string, Rechtsgebiet> = {
  '4A': 'privat', '4C': 'privat', '5A': 'privat', '5C': 'privat', '5D': 'privat',
  '6B': 'straf', '6S': 'straf',
  '1B': 'prozess', '7B': 'prozess',
  '1C': 'oeffentlich', '1P': 'oeffentlich', '1E': 'oeffentlich',
  '2C': 'sozial-abgaben', '2A': 'sozial-abgaben', '2D': 'sozial-abgaben',
  '8C': 'sozial-abgaben', '9C': 'sozial-abgaben',
};
export function abteilungZuSachgebiet(docket: string): Rechtsgebiet | null {
  const m = /^(\d[A-Z])/.exec(String(docket).trim());
  return m ? (ABTEILUNG[m[1]] ?? null) : null;
}

import type { Gerichtstyp } from '../../src/lib/rechtsprechung/typen';
export function gerichtstypFuerCourt(court: string): Gerichtstyp {
  switch (court) {
    case 'bger': return 'bundesgericht';
    case 'bvger': return 'bundesverwaltungsgericht';
    case 'bstger': return 'bundesstrafgericht';
    case 'bpatger': return 'bundespatentgericht';
    default: return 'kantonal';
  }
}
