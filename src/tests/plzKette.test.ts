import { describe, it, expect } from 'vitest';
import { amtFuer } from '../data/schlichtung/amtAufloesung';
import { namensKandidaten, zhFriedensrichterFuer } from '../data/schlichtung/zhAmt';

// ─── PLZ-Audit-Fix 6.6.2026 ──────────────────────────────────────────────────
// 21 PLZ liefen wegen Schreibweisen-Differenzen swisstopo↔Dossier ins Leere
// (Bug A: «(ZH)»-Suffix nie abgestreift; Bug B: Dossier-Kurznamen; Bug C:
// «St. »-Leerzeichen). Die Tests decken jeden gemeldeten Fall mit dem
// swisstopo-String ab, den das UI automatisch einsetzt.

describe('PLZ-Kette: ZH-Suffix «(ZH)» (Bug A)', () => {
  const faelle = ['Aesch (ZH)', 'Benken (ZH)', 'Birmensdorf (ZH)', 'Küsnacht (ZH)',
    'Rickenbach (ZH)', 'Schlatt (ZH)', 'Weiningen (ZH)', 'Wetzikon (ZH)', 'Wil (ZH)', 'Zell (ZH)'];
  for (const g of faelle) {
    it(`${g} → Friedensrichteramt gefunden`, async () => {
      const amt = await zhFriedensrichterFuer(g);
      expect(amt, g).not.toBeNull();
      expect(amt!.plzOrt).toMatch(/^\d{4} /);
    });
  }
});

describe('PLZ-Kette: Dossier-Kurznamen (Bug B)', () => {
  it('Thalheim an der Thur (8478) → Amt gefunden', async () => {
    expect(await zhFriedensrichterFuer('Thalheim an der Thur')).not.toBeNull();
  });
  it('Wettswil am Albis (8907) → Amt gefunden', async () => {
    expect(await zhFriedensrichterFuer('Wettswil am Albis')).not.toBeNull();
  });
});

describe('PLZ-Kette: «St. »-Normalisierung SG (Bug C)', () => {
  it('St. Gallen (9000) → Vermittlungsamt St.Gallen', async () => {
    const amt = await amtFuer('SG', 'St. Gallen');
    expect(amt).not.toBeNull();
    expect(amt!.name).toContain('St.Gallen');
  });
  it('St. Margrethen (9430) → Amt gefunden', async () => {
    expect(await amtFuer('SG', 'St. Margrethen')).not.toBeNull();
  });
  it('Wildhaus-Alt St. Johann (9656) → Amt gefunden', async () => {
    expect(await amtFuer('SG', 'Wildhaus-Alt St. Johann')).not.toBeNull();
  });
});

describe('PLZ-Kette: Regressionsschutz bestehender Pfade', () => {
  it('exakte Treffer unverändert (Aarau AG, Chur GR via Region)', async () => {
    expect(await amtFuer('AG', 'Aarau')).not.toBeNull();
    expect(await amtFuer('GR', 'Chur')).not.toBeNull();
  });
  it('unbekannte Gemeinde bleibt ehrlich null (kein Fuzzy)', async () => {
    expect(await amtFuer('AG', 'Atlantis')).toBeNull();
    expect(await zhFriedensrichterFuer('Mordor')).toBeNull();
  });
  it('Stadt Zürich bleibt null (Kreis massgeblich)', async () => {
    expect(await zhFriedensrichterFuer('Zürich')).toBeNull();
  });
  it('namensKandidaten deterministisch und ohne Explosion', () => {
    const k = namensKandidaten('St. Gallen', 'SG');
    expect(k).toContain('St.Gallen');
    expect(k.length).toBeLessThan(15);
    expect(namensKandidaten('Küsnacht (ZH)', 'ZH')).toContain('Küsnacht');
  });
});

describe('PLZ-Audit-Fix 6.6.2026 — Adressenanteil & Hauptgemeinde (Befund 4052)', () => {
  it('4052: Basel (BS) ist Hauptgemeinde (97.7 %), Münchenstein (BL) Randgebiet (2.3 %)', async () => {
    const { plzAufloesen, hauptTreffer } = await import('../data/plz/plzAufloesung');
    const t = (await plzAufloesen('4052'))!;
    expect(t[0]).toEqual({ gemeinde: 'Basel', kanton: 'BS', anteilProzent: 97.7 });
    expect(t.some((x) => x.gemeinde === 'Münchenstein' && x.kanton === 'BL')).toBe(true);
    const haupt = hauptTreffer(t);
    expect(haupt?.gemeinde).toBe('Basel');
    expect(haupt?.kanton).toBe('BS');
  });
  it('echt mehrdeutige PLZ ohne 50-%-Dominanz bleibt ohne Hauptgemeinde (z. B. 1410)', async () => {
    const { plzAufloesen, hauptTreffer } = await import('../data/plz/plzAufloesung');
    const t = (await plzAufloesen('1410'))!; // Montanaire VD 100 % + Prévondavaux FR 100 % (zwei Ortschaften)
    expect(hauptTreffer(t)).toBeNull();
  });
  it('eindeutige PLZ: ein Treffer mit 100 % (8001 Zürich)', async () => {
    const { plzAufloesen, hauptTreffer } = await import('../data/plz/plzAufloesung');
    const t = (await plzAufloesen('8001'))!;
    expect(t).toHaveLength(1);
    expect(t[0].anteilProzent).toBe(100);
    expect(hauptTreffer(t)?.kanton).toBe('ZH');
  });
});
