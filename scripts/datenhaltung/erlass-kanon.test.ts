// scripts/datenhaltung/erlass-kanon.test.ts
// QS-DATA E4 · Q4 — Unit-Tests der law-code-Kanonisierung. Beweist: (1) jede Kanon-Gruppe
// ist gegen ERLASS_REGISTER SR-BELEGT (key+sr existieren, §7/§11), (2) die belegten
// mehrsprachigen Paare mappen korrekt, (3) mehrdeutiges/kantonales/aufgehobenes bleibt null
// (§8, NIE raten), (4) Determinismus + Kollisionsfreiheit.
import { describe, it, expect } from 'vitest';
import { KANON_GRUPPEN, kanonErlassKey, normCode, kanonisierteKeys } from './erlass-kanon';
import { ERLASS_REGISTER } from '../../src/lib/normtext/register';

// Register-Index: key → sr (nur Bund).
const REG_SR = new Map<string, string | undefined>();
for (const e of ERLASS_REGISTER) if (e.ebene === 'bund') REG_SR.set(e.key, e.sr);

describe('erlass-kanon — SR-Beleg gegen ERLASS_REGISTER (§7/§11)', () => {
  it('jede Kanon-Gruppe hat einen Register-Eintrag mit passendem key UND SR-Nummer', () => {
    for (const g of KANON_GRUPPEN) {
      expect(REG_SR.has(g.key), `Register-key fehlt: ${g.key}`).toBe(true);
      expect(REG_SR.get(g.key), `SR-Beleg falsch für ${g.key}`).toBe(g.sr);
    }
  });

  it('kein Register-key ohne SR gemappt (die SR-Klammer muss existieren)', () => {
    for (const g of KANON_GRUPPEN) expect(g.sr, `${g.key} ohne SR`).toBeTruthy();
  });
});

describe('erlass-kanon — belegte mehrsprachige Paare mappen korrekt', () => {
  // Stichprobe der amtlichen DE/FR/IT-Kürzel-Paare (je SR-eindeutig).
  const PAARE: Array<[string, string]> = [
    ['OR', 'OR'], ['CO', 'OR'],
    ['ZGB', 'ZGB'], ['CC', 'ZGB'],
    ['StGB', 'STGB'], ['CP', 'STGB'],
    ['ZPO', 'ZPO'], ['CPC', 'ZPO'],
    ['StPO', 'STPO'], ['CPP', 'STPO'],
    ['BGG', 'BGG'], ['LTF', 'BGG'],
    ['SchKG', 'SCHKG'], ['LP', 'SCHKG'], ['LEF', 'SCHKG'],
    ['ATSG', 'ATSG'], ['LPGA', 'ATSG'],
    ['IVG', 'IVG'], ['LAI', 'IVG'],
    ['UVG', 'UVG'], ['LAA', 'UVG'], ['LAINF', 'UVG'],
    ['AHVG', 'AHVG'], ['LAVS', 'AHVG'],
    ['BVG', 'BVG'], ['LPP', 'BVG'],
    ['DBG', 'DBG'], ['LIFD', 'DBG'],
    ['BV', 'BV'], ['Cst', 'BV'],
    ['AIG', 'AIG'], ['LEtr', 'AIG'], ['AuG', 'AIG'],
    ['VwVG', 'VWVG'], ['PA', 'VWVG'],
    ['EMRK', 'EMRK'], ['CEDH', 'EMRK'],
  ];
  it.each(PAARE)('%s → %s', (code, key) => {
    expect(kanonErlassKey(code)).toBe(key);
  });

  it('Sprach-/Schreibvarianz robust (Kleinschreibung, Punkte, Whitespace)', () => {
    expect(kanonErlassKey('co')).toBe('OR');
    expect(kanonErlassKey('Cst.')).toBe('BV');
    expect(kanonErlassKey(' LTF ')).toBe('BGG');
    expect(normCode('Cst.')).toBe('CST');
  });
});

describe('erlass-kanon — §8: mehrdeutig / kantonal / aufgehoben bleibt null (NIE raten)', () => {
  it('mehrdeutige Bund/Kanton-Kürzel bleiben unresolved', () => {
    expect(kanonErlassKey('StG')).toBeNull();    // eidg. Stempel vs. kant. Steuergesetz
    expect(kanonErlassKey('LASI')).toBeNull();   // fr LAsi vs. GE-Sozialhilfe
    expect(kanonErlassKey('LAsi')).toBeNull();   // dieselbe Kollision (normalisiert LASI)
    expect(kanonErlassKey('LT')).toBeNull();     // mehrdeutig
  });
  it('kantonale Prozessgesetze bleiben unresolved', () => {
    for (const c of ['LPA', 'VRPG', 'LOJ', 'LOJV', 'VRP', 'VRG', 'CPJA', 'RAJ']) {
      expect(kanonErlassKey(c), c).toBeNull();
    }
  });
  it('aufgehobenes Bundesrecht (≠ heutiger Erlass) bleibt unresolved', () => {
    expect(kanonErlassKey('OG')).toBeNull();     // altes OG/Bundesrechtspflege ≠ BGG
    expect(kanonErlassKey('OJ')).toBeNull();
    expect(kanonErlassKey('LSEE')).toBeNull();   // alte fr. Ausländer-loi ≠ AIG
  });
  it('leer/unbekannt → null', () => {
    expect(kanonErlassKey('')).toBeNull();
    expect(kanonErlassKey(null)).toBeNull();
    expect(kanonErlassKey('XYZ_FANTASIE')).toBeNull();
  });
});

describe('erlass-kanon — Determinismus + Kollisionsfreiheit', () => {
  it('gleiche Eingabe → gleiche Ausgabe', () => {
    expect(kanonErlassKey('LAI')).toBe(kanonErlassKey('LAI'));
  });
  it('kein Kürzel mappt auf zwei Register-keys (Map-Bau würfe sonst)', () => {
    // Der Modul-Load hätte bei Kollision geworfen; hier zusätzlich explizit geprüft.
    const seen = new Map<string, string>();
    for (const g of KANON_GRUPPEN) for (const c of g.codes) {
      const nc = normCode(c);
      if (seen.has(nc)) expect(seen.get(nc)).toBe(g.key);
      seen.set(nc, g.key);
    }
  });
  it('kanonisierteKeys sind alle im Register', () => {
    for (const k of kanonisierteKeys()) expect(REG_SR.has(k), k).toBe(true);
  });
});
