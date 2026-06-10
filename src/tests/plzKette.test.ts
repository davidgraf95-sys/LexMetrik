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

describe('PLZ-Mehrdeutigkeit als Auswahl (TODO 5 betreibungskreise, 10.6.2026)', () => {
  // gemeindeOptionen speist die klickbaren Kacheln (PlzGemeindeWahl): Dedupe
  // über Gemeinde+Kanton, Hauptgemeinde (höchster Adressenanteil) zuerst.
  it('1008: zwei 100-%-Gemeinden (VD) → 2 Optionen, keine Hauptgemeinde', async () => {
    const { gemeindeOptionen } = await import('../components/ui/plzGemeindeOptionen');
    const { plzAufloesen, hauptTreffer } = await import('../data/plz/plzAufloesung');
    const t = (await plzAufloesen('1008'))!;
    const o = gemeindeOptionen(t);
    expect(o.map((x) => x.gemeinde).sort()).toEqual(['Jouxtens-Mézery', 'Prilly']);
    expect(o.every((x) => x.kanton === 'VD')).toBe(true);
    expect(hauptTreffer(t)).toBeNull();
  });
  it('1041: vier 100-%-Gemeinden (VD) → 4 Optionen', async () => {
    const { gemeindeOptionen } = await import('../components/ui/plzGemeindeOptionen');
    const { plzAufloesen } = await import('../data/plz/plzAufloesung');
    const o = gemeindeOptionen((await plzAufloesen('1041'))!);
    expect(o.map((x) => x.gemeinde).sort()).toEqual(['Bottens', 'Jorat-Menthue', 'Montilliez', 'Poliez-Pittet']);
  });
  it('4052: Hauptgemeinde Basel zuerst, Randgebiet Münchenstein (BL) wählbar', async () => {
    const { gemeindeOptionen } = await import('../components/ui/plzGemeindeOptionen');
    const { plzAufloesen } = await import('../data/plz/plzAufloesung');
    const o = gemeindeOptionen((await plzAufloesen('4052'))!);
    expect(o[0]).toEqual({ gemeinde: 'Basel', kanton: 'BS', anteilProzent: 97.7 });
    expect(o[1]).toEqual({ gemeinde: 'Münchenstein', kanton: 'BL', anteilProzent: 2.3 });
  });
  it('1410: kantonsübergreifend — beide Kantone in den Optionen (Wahl setzt den Kanton)', async () => {
    const { gemeindeOptionen } = await import('../components/ui/plzGemeindeOptionen');
    const { plzAufloesen } = await import('../data/plz/plzAufloesung');
    const o = gemeindeOptionen((await plzAufloesen('1410'))!);
    expect(o.map((x) => `${x.gemeinde}|${x.kanton}`).sort()).toEqual(['Montanaire|VD', 'Prévondavaux|FR'].sort());
  });
  it('eindeutige PLZ (8001) → eine Option: die Kachel-Auswahl erscheint nicht (< 2)', async () => {
    const { gemeindeOptionen } = await import('../components/ui/plzGemeindeOptionen');
    const { plzAufloesen } = await import('../data/plz/plzAufloesung');
    expect(gemeindeOptionen((await plzAufloesen('8001'))!)).toHaveLength(1);
  });
});

describe('LU/AR/NE — Gemeinde→Schlichtungsstelle (Doppel-Muster Auto+Dropdown, 10.6.2026)', () => {
  // Rechtsgrundlagen volltext-verifiziert: LU JusG § 45 + SRL 261 §§ 2–5 ·
  // AR ar.ch Vermittler · NE OJN Art. 98a/98e + LDP Art. 44a (Wahlregionen).
  it('LU: 79 Gemeinden auf 4 Friedensrichterämter; swisstopo-Langname Hergiswil bei Willisau', async () => {
    const { amtFuer, AMT_KANTONE } = await import('../data/schlichtung/amtAufloesung');
    expect(AMT_KANTONE).toContain('LU');
    expect((await amtFuer('LU', 'Emmen'))?.name).toContain('Hochdorf');
    expect((await amtFuer('LU', 'Hergiswil bei Willisau'))?.name).toContain('Willisau');
    expect((await amtFuer('LU', 'Vitznau'))?.name).toContain('Kriens');
  });
  it('AR: 20 Gemeinden auf 3 Vermittlerämter (Teufen (AR) → Mittelland)', async () => {
    const { amtFuer } = await import('../data/schlichtung/amtAufloesung');
    expect((await amtFuer('AR', 'Teufen (AR)'))?.name).toContain('Mittelland');
    expect((await amtFuer('AR', 'Herisau'))?.name).toContain('Hinterland');
    expect((await amtFuer('AR', 'Walzenhausen'))?.name).toContain('Vorderland');
  });
  it('NE: Wahlregionen-Zuordnung; Fusion Laténa (ex Hauterive/La Tène/Saint-Blaise/Enges) + Cressier (NE)', async () => {
    const { amtFuer } = await import('../data/schlichtung/amtAufloesung');
    expect((await amtFuer('NE', 'Laténa'))?.name).toContain('Littoral');
    expect((await amtFuer('NE', 'Cressier (NE)'))?.name).toContain('Littoral');
    expect((await amtFuer('NE', 'Le Locle'))?.name).toContain('Montagnes');
    expect((await amtFuer('NE', 'Val-de-Ruz'))?.name).toContain('Montagnes');
  });
});

describe('BL/SZ — Gemeinde→Schlichtungsstelle (10.6.2026)', () => {
  it('BL: 86/86 Gemeinden auf 15 Friedensrichterkreise (§ 18 GOG BL); Itingen → Kreis 13 Sissach', async () => {
    const { amtFuer, AMT_KANTONE } = await import('../data/schlichtung/amtAufloesung');
    expect(AMT_KANTONE).toContain('BL');
    expect((await amtFuer('BL', 'Itingen'))?.name).toContain('Sissach');
    expect((await amtFuer('BL', 'Liestal'))?.name).toContain('Liestal');
    expect((await amtFuer('BL', 'Burg im Leimental'))?.name).toContain('Laufen');
  });
  it('SZ: Konsolidierungen Höfe + Ingenbohl-Kreis; 4 OFFEN-Gemeinden ehrlich null (Adresse nicht publiziert)', async () => {
    const { amtFuer } = await import('../data/schlichtung/amtAufloesung');
    expect((await amtFuer('SZ', 'Freienbach'))?.name).toContain('Höfe');
    expect((await amtFuer('SZ', 'Morschach'))?.name).toContain('Ingenbohl');
    expect((await amtFuer('SZ', 'Küssnacht (SZ)'))?.name).toContain('Küssnacht');
    expect(await amtFuer('SZ', 'Lauerz')).toBeNull();
  });
});
