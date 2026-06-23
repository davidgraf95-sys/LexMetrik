/**
 * Tests für sachgruppe() & Titel-Helfer — die deterministische Zuordnung eines
 * kantonalen Erlasses zu Top-Sachgebiet + Untergruppe (Längster-Präfix-Match im
 * Systematik-Baum). Deckt abweichende Schemata ab (AI Hunderter, UR 10/40).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  sachgruppe, topTitel, subTitel, sachgebietRang, untergruppeRang,
  systematikSchluessel, srVergleich,
  type KantonSystematik,
} from '../lib/normtext/systematik';

const BS: KantonSystematik = {
  roots: [
    { nummer: '1', name: 'Staat', kinder: [{ nummer: '17', name: 'Gemeinden' }] },
    { nummer: '6', name: 'Finanzen', kinder: [{ nummer: '64', name: 'Allgemeine Steuern' }, { nummer: '61', name: 'Finanzordnung' }] },
  ],
  index: { '1': ['1', ''], '17': ['1', '17'], '170': ['1', '17'], '6': ['6', ''], '64': ['6', '64'], '640': ['6', '64'] },
};
const AI: KantonSystematik = {
  roots: [{ nummer: '100', name: 'Staat', kinder: [] }, { nummer: '600', name: 'Finanzen', kinder: [] }],
  index: { '100': ['100', ''], '172': ['100', '170'], '600': ['600', ''], '613': ['600', '610'] },
};
const UR: KantonSystematik = {
  roots: [{ nummer: '1', name: 'Staat', kinder: [] }, { nummer: '10', name: 'Schule', kinder: [] }, { nummer: '40', name: 'Umwelt', kinder: [] }],
  index: { '1': ['1', ''], '10': ['10', ''], '101': ['10', ''], '40': ['40', ''], '401': ['40', ''] },
};
// BS-Gemeinderecht: numerische Wurzeln 1/6 PLUS Buchstaben-Wurzel «BaB»
// (Bürgergemeinde Basel). So sieht der echte Index nach Neugenerierung aus —
// präfix-bewahrende Namespace-Schlüssel («BaB#…»). Achtung: «152110» (rein
// numerisch) UND «BaB#152110» (Gemeinderecht) existieren beide; sie dürfen sich
// nicht überschneiden.
const BS_GEMEINDE: KantonSystematik = {
  roots: [
    { nummer: '1', name: 'Staatsrecht', kinder: [{ nummer: '15', name: 'Personalrecht' }] },
    { nummer: '6', name: 'Finanzen', kinder: [{ nummer: '64', name: 'Steuern' }] },
    { nummer: 'BaB', name: 'Bürgergemeinde Basel', kinder: [
      { nummer: 'BaB 1', name: 'Grundlagen · Organisation' },
      { nummer: 'BaB 2', name: 'Bundesrecht: Ergänzendes' },
    ] },
  ],
  index: {
    '1': ['1', ''], '15': ['1', '15'], '152': ['1', '15'],
    '6': ['6', ''], '64': ['6', '64'], '640': ['6', '64'],
    'BaB#': ['BaB', ''], 'BaB#1': ['BaB', 'BaB 1'], 'BaB#152': ['BaB', 'BaB 1'],
    'BaB#2': ['BaB', 'BaB 2'],
  },
};

describe('sachgruppe', () => {
  it('einfaches Dezimalschema (BS): Top + Untergruppe', () => {
    expect(sachgruppe(BS, '640.100')).toEqual({ top: '6', sub: '64' });
    expect(sachgruppe(BS, '170.100')).toEqual({ top: '1', sub: '17' });
  });

  it('Hunderter-Schema (AI): 172.600 → Top 100 (nicht 1)', () => {
    expect(sachgruppe(AI, '172.600')).toEqual({ top: '100', sub: '170' });
    expect(sachgruppe(AI, '613.010')).toEqual({ top: '600', sub: '610' });
  });

  it('UR-Schema: 40.x → 40, 10.x → 10, 1.x → 1', () => {
    expect(sachgruppe(UR, '40.1111').top).toBe('40');
    expect(sachgruppe(UR, '10.1211').top).toBe('10');
    expect(sachgruppe(UR, '1.5').top).toBe('1');
  });

  it('Gemeinderecht (BaB-Präfix): Erlass landet in der Buchstaben-Wurzel, NICHT in einer numerischen', () => {
    // «BaB 152.110» darf NICHT an die numerische Wurzel «1» (über 152) matchen.
    expect(sachgruppe(BS_GEMEINDE, 'BaB 152.110')).toEqual({ top: 'BaB', sub: 'BaB 1' });
    // «BaB 2.x» → Untergruppe «BaB 2».
    expect(sachgruppe(BS_GEMEINDE, 'BaB 2.500')).toEqual({ top: 'BaB', sub: 'BaB 2' });
    // Nummer ohne weitere Stufe fällt auf die BaB-Wurzel zurück (Namespace bleibt).
    expect(sachgruppe(BS_GEMEINDE, 'BaB 999.999')).toEqual({ top: 'BaB', sub: '' });
  });

  it('rein numerische Fälle bleiben unverändert, obwohl ein BaB-Namespace existiert', () => {
    // «152.110» (ohne Präfix) → numerische Wurzel «1»/Untergruppe «15»;
    // teilt KEINE Zelle mit «BaB#152».
    expect(sachgruppe(BS_GEMEINDE, '152.110')).toEqual({ top: '1', sub: '15' });
    expect(sachgruppe(BS_GEMEINDE, '640.100')).toEqual({ top: '6', sub: '64' });
  });

  it('Namespace-Isolation: BeE-Erlass ohne BeE-Daten matcht keine numerische Wurzel', () => {
    // BS_GEMEINDE kennt keinen BeE-Namespace → ehrlicher Fallback auf «BeE»,
    // NIEMALS auf die numerische Wurzel «1» (über 117).
    expect(sachgruppe(BS_GEMEINDE, 'BeE 117.220')).toEqual({ top: 'BeE', sub: '' });
  });

  it('systematikSchluessel: präfix-bewahrend; rein numerisch unverändert', () => {
    expect(systematikSchluessel('640.100')).toBe('640100');
    expect(systematikSchluessel('BaB 152.110')).toBe('BaB#152110');
    expect(systematikSchluessel('BaB')).toBe('BaB#');
    expect(systematikSchluessel('ABC')).toBe('ABC#');
    expect(systematikSchluessel('')).toBe('');
  });

  it('srVergleich: Namespace + Mehrpunkt-Tupel, kein parseFloat-Schaden', () => {
    // numerisch vor präfixiert
    expect(srVergleich('640.100', 'BaB 1.000')).toBeLessThan(0);
    // gleiches Präfix, stufenweise numerisch
    expect(srVergleich('BaB 152.110', 'BaB 152.120')).toBeLessThan(0);
    // kürzere Nummer (weniger Stufen) zuerst — parseFloat würde 152.110 == 152.11 sehen
    expect(srVergleich('BaB 152.11', 'BaB 152.110')).toBeLessThan(0);
    // 7.9 vor 7.10 (parseFloat würde 7.9 > 7.10 falsch ordnen)
    expect(srVergleich('7.9', '7.10')).toBeLessThan(0);
    // unterschiedliche Präfixe alphabetisch
    expect(srVergleich('BaB 1.0', 'BeE 1.0')).toBeLessThan(0);
  });

  it('neutraler Fallback ohne Daten: führende Ziffer, leere Untergruppe', () => {
    expect(sachgruppe(undefined, '640.100')).toEqual({ top: '6', sub: '' });
    expect(topTitel(undefined, '6')).toBe('Bereich 6');
  });

  it('Nummer ohne Ziffer → «Ohne Systematik-Nummer»', () => {
    expect(sachgruppe(BS, 'ABC')).toEqual({ top: '~', sub: '' });
    expect(topTitel(BS, '~')).toBe('Ohne Systematik-Nummer');
  });

  it('topTitel/subTitel liefern amtliche Namen', () => {
    expect(topTitel(BS, '6')).toBe('Finanzen');
    expect(subTitel(BS, '6', '64')).toBe('Allgemeine Steuern');
    expect(subTitel(BS, '6', '')).toBe('');
  });

  it('Reihenfolge: Top nach Baum, Untergruppe nach Baum (leere zuerst)', () => {
    const rt = sachgebietRang(BS);
    expect(rt('1')).toBeLessThan(rt('6'));
    expect(rt('~')).toBe(999);
    const ru = untergruppeRang(BS, '6');
    expect(ru('')).toBeLessThan(ru('64')); // direkte (ohne Untergruppe) zuerst
    expect(ru('64')).toBeLessThan(ru('61')); // Baum-Reihenfolge: 64 vor 61
  });
});

// S8 (BS-Audit 23.6.2026, §7-Verdikt) — Systematik-Namen werden VERBATIM aus der
// amtlichen clex-Quelle übernommen; ein fehlender «·»-Trenner ist eine reine
// Quell-Eigenheit und wird NICHT fabriziert (sonst zweite Wahrheit, §5/§7).
// Dieser Guard scheitert, falls jemand den Trenner in die committete JSON einsetzt
// (per Hand oder durch eine namens-"normalisierende" Generator-Änderung).
describe('S8 — Systematik-Name verbatim (kein fabrizierter Trenner, §7)', () => {
  it('BS-Root 4 bleibt «Erziehung Wissenschafts- und Kulturpflege» (Quell-Eigenheit)', () => {
    const j = JSON.parse(
      readFileSync(join('public', 'normtext', 'kanton-systematik.json'), 'utf8'),
    ) as Record<string, KantonSystematik>;
    const root4 = j.BS?.roots.find((r) => r.nummer === '4');
    expect(root4).toBeDefined();
    // Verbatim aus der amtlichen Quelle (verifiziert 23.6.2026): KEIN «·» eingefügt.
    expect(root4!.name).toBe('Erziehung Wissenschafts- und Kulturpflege');
    expect(root4!.name).not.toContain('·');
  });
});
