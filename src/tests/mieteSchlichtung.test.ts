import { describe, it, expect } from 'vitest';
import { mieteAmtFuer, MIETE_AMT_KANTONE } from '../data/schlichtung/amtAufloesung';
import aemterKantone from '../data/schlichtung/aemterKantone.json';

// ─── Miete-Register (Art. 200 Abs. 1 ZPO) — Vollerhebung 11.6.2026 ──────────
// Dossier §§41–47: VD 10 · FR 3 (Bezirks-Gruppen!) · GR 11 · SZ 6 · AG 11 ·
// SG 7 (Werdenberg+Sarganserland zusammengelegt) · TG 80 kommunal (1:1).

const reg = aemterKantone as Record<string, { aemter: { name: string }[]; gemeinden: Record<string, number> }>;

describe('Miete-Register: Vollständigkeit', () => {
  const SOLL: [string, number, number][] = [
    ['VD_MIETE', 10, 300], ['FR_MIETE', 3, 119], ['GR_MIETE', 11, 100],
    ['SZ_MIETE', 6, 30], ['AG_MIETE', 11, 196], ['SG_MIETE', 7, 75], ['TG_MIETE', 80, 80],
  ];
  for (const [k, ae, ge] of SOLL) {
    it(`${k}: ${ae} Stellen, ${ge} Gemeinden, alle Stellen erreicht`, () => {
      expect(reg[k].aemter.length, k).toBe(ae);
      expect(Object.keys(reg[k].gemeinden).length, k).toBe(ge);
      expect(new Set(Object.values(reg[k].gemeinden)).size, k).toBe(ae);
    });
  }
  it('MIETE_AMT_KANTONE deckt exakt die Register', () => {
    expect([...MIETE_AMT_KANTONE].sort()).toEqual(['AG', 'FR', 'GR', 'SG', 'SZ', 'TG', 'VD']);
  });
});

describe('Miete-Register: Empirie (Erhebung 11.6.2026)', () => {
  it('VD: Lausanne → Préfecture Lausanne; Payerne → Broye-Vully', async () => {
    expect((await mieteAmtFuer('VD', 'Lausanne'))?.name).toContain('Lausanne');
    expect((await mieteAmtFuer('VD', 'Payerne'))?.plzOrt).toContain('Payerne');
  });
  it('FR: Bulle → Süd-Kommission (Romont); Tafers → Sense+See; Murten → Sense+See', async () => {
    expect((await mieteAmtFuer('FR', 'Bulle'))?.plzOrt).toContain('Romont');
    expect((await mieteAmtFuer('FR', 'Tafers'))?.plzOrt).toContain('Tafers');
    expect((await mieteAmtFuer('FR', 'Murten'))?.plzOrt).toContain('Tafers');
  });
  it('GR: Chur → Plessur (Mietsachen-Adresse, nicht Regionalgericht)', async () => {
    expect((await mieteAmtFuer('GR', 'Chur'))?.name).toContain('Plessur');
  });
  it('SZ: Freienbach → Höfe (nur Postfach, ehrlich); Lachen → March', async () => {
    const h = await mieteAmtFuer('SZ', 'Freienbach');
    expect(h?.name).toContain('Höfe');
    expect((await mieteAmtFuer('SZ', 'Lachen'))?.name).toContain('March');
  });
  it('AG: Wettingen → Bezirk Baden; Unterkulm → Bezirk Kulm', async () => {
    expect((await mieteAmtFuer('AG', 'Wettingen'))?.name).toContain('Baden');
    expect((await mieteAmtFuer('AG', 'Unterkulm'))?.name).toContain('Kulm');
  });
  it('SG: Buchs UND Sargans → Werdenberg-Sarganserland (zusammengelegt)', async () => {
    expect((await mieteAmtFuer('SG', 'Buchs (SG)'))?.plzOrt).toContain('Buchs');
    expect((await mieteAmtFuer('SG', 'Sargans'))?.plzOrt).toContain('Buchs');
  });
  it('TG: Amriswil eigene; Ermatingen → geführt bei Kreuzlingen', async () => {
    expect((await mieteAmtFuer('TG', 'Amriswil'))?.plzOrt).toContain('Amriswil');
    expect((await mieteAmtFuer('TG', 'Ermatingen'))?.plzOrt).toContain('Kreuzlingen');
  });
  it('kein Register (z. B. BE) → null', async () => {
    expect(await mieteAmtFuer('BE', 'Bern')).toBeNull();
  });
});
