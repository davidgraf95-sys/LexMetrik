import { describe, it, expect } from 'vitest';
import { vdArbeitsStufe, vdSchlichtungsStufe, VD_SCHWELLEN } from '../lib/vdSchlichtung';
import { amtFuer, vdAmtFuer } from '../data/schlichtung/amtAufloesung';
import { plzAufloesen, hauptTreffer } from '../data/plz/plzAufloesung';
import { schlichtungAufloesung, VD_JDP_ZU_TA, VD_PRUDHOMMES, VD_TRIBUNAUX, VD_CHAMBRE_PATRIMONIALE } from '../data/schlichtungsstellen';
import aemterKantone from '../data/schlichtung/aemterKantone.json';

// ─── VD-Streitwert-Weiche (11.6.2026, Dossier §37) ──────────────────────────
// Normlage wörtlich am konsolidierten Erlass verifiziert: Art. 41 CDPJ-VD
// (Schlichtung bei der sachlich zuständigen Instanz) · Art. 113 Abs. 1bis
// LOJV (JdP < 10'000) · Art. 96d Abs. 2 (Präsident TA 10'000–30'000) ·
// Art. 96b Abs. 3 (TA > 30'000 ≤ 100'000) · Art. 96g (Chambre > 100'000).

describe('VD-Stufen-Engine: Grenzwerte wörtlich nach LOJV', () => {
  const stufe = (sw: number) => vdSchlichtungsStufe(true, sw)?.stufe;
  it('0 und 9 999.99 → Justice de paix (Art. 113 Abs. 1bis: «inférieure à»)', () => {
    expect(stufe(0)).toBe('justice_de_paix');
    expect(stufe(9999.99)).toBe('justice_de_paix');
  });
  it('genau 10 000 → Präsident TA (Art. 96d Abs. 2: «comprise entre»)', () => {
    expect(stufe(10_000)).toBe('ta_praesident');
  });
  it('genau 30 000 → noch Präsident TA (Art. 96d inkl.; Art. 96b erst «supérieure à»)', () => {
    expect(stufe(30_000)).toBe('ta_praesident');
    expect(stufe(30_000.01)).toBe('tribunal_arrondissement');
  });
  it('genau 100 000 → noch TA (Art. 96b: «inférieure ou égale»)', () => {
    expect(stufe(100_000)).toBe('tribunal_arrondissement');
    expect(stufe(100_000.01)).toBe('chambre_patrimoniale');
  });
  it('nicht vermögensrechtlich / ohne Streitwert / ungültig → keine Stufe', () => {
    expect(vdSchlichtungsStufe(false, 5000)).toBeNull();
    expect(vdSchlichtungsStufe(true, null)).toBeNull();
    expect(vdSchlichtungsStufe(true, Number.NaN)).toBeNull();
    expect(vdSchlichtungsStufe(true, -1)).toBeNull();
  });
  it('Schwellen-Konstanten unverändert (Verfalls-Wächter LOJV)', () => {
    expect(VD_SCHWELLEN).toEqual({ JDP_UNTER: 10_000, TA_PRAESIDENT_BIS: 30_000, TA_BIS: 100_000 });
  });
});

describe('VD: JdP→TA-Zuordnung vollständig und konsistent (AAJTJ Art. 1)', () => {
  const vd = (aemterKantone as Record<string, { aemter: { name: string }[]; gemeinden: Record<string, number> }>).VD;
  it('jede generierte Justice de paix hat genau ein Tribunal', () => {
    expect(vd.aemter.length).toBe(9);
    for (const a of vd.aemter) {
      const idx = VD_JDP_ZU_TA[a.name];
      expect(idx, a.name).not.toBeUndefined();
      expect(VD_TRIBUNAUX[idx], a.name).toBeDefined();
    }
  });
  it('alle 300 VD-Gemeinden sind einer JdP zugeordnet, alle 9 JdP erreicht', () => {
    expect(Object.keys(vd.gemeinden).length).toBe(300);
    expect(new Set(Object.values(vd.gemeinden)).size).toBe(9);
  });
  it('vier Tribunaux + Chambre tragen amtliche vd.ch-Links', () => {
    expect(VD_TRIBUNAUX.length).toBe(4);
    for (const t of [...VD_TRIBUNAUX, VD_CHAMBRE_PATRIMONIALE]) {
      expect(t.url).toMatch(/^https:\/\/www\.vd\.ch\//);
    }
  });
});

describe('VD: Gemeinde + Stufe → konkrete Instanz (Empirie)', () => {
  it('Lausanne, < 10k → Justice de paix Lausanne', async () => {
    expect((await vdAmtFuer('Lausanne', 'justice_de_paix'))?.name).toBe('Justice de paix Lausanne');
  });
  it('Lausanne, 10–30k (Präsident) → TA Lausanne', async () => {
    expect((await vdAmtFuer('Lausanne', 'ta_praesident'))?.name).toBe('Tribunal d’arrondissement de Lausanne');
  });
  it('Renens (VD) → JdP Ouest lausannois bzw. TA Lausanne', async () => {
    expect((await vdAmtFuer('Renens (VD)', 'justice_de_paix'))?.name).toBe('Justice de paix Ouest lausannois');
    expect((await vdAmtFuer('Renens (VD)', 'tribunal_arrondissement'))?.name).toBe('Tribunal d’arrondissement de Lausanne');
  });
  it('Morges → TA La Côte (AAJTJ: Morges + Nyon, Sitz Nyon)', async () => {
    expect((await vdAmtFuer('Morges', 'tribunal_arrondissement'))?.name).toBe('Tribunal d’arrondissement de La Côte');
  });
  it('Montreux → JdP Riviera bzw. TA Est vaudois (Sitz Vevey)', async () => {
    expect((await vdAmtFuer('Montreux', 'justice_de_paix'))?.name).toBe('Justice de paix Riviera');
    expect((await vdAmtFuer('Montreux', 'tribunal_arrondissement'))?.name).toBe('Tribunal d’arrondissement de l’Est vaudois');
  });
  it('Echallens (Gros-de-Vaud) → JdP JNV/GdV, TA Broye et Nord vaudois', async () => {
    expect((await vdAmtFuer('Echallens', 'justice_de_paix'))?.name).toBe('Justice de paix Jura-Nord vaudois/Gros-de-Vaud');
    expect((await vdAmtFuer('Echallens', 'ta_praesident'))?.name).toBe('Tribunal d’arrondissement de la Broye et du Nord vaudois');
  });
  it('Chambre patrimoniale: kantonsweit, ohne Gemeinde-Abhängigkeit', async () => {
    expect((await vdAmtFuer('Payerne', 'chambre_patrimoniale'))?.plzOrt).toBe('1014 Lausanne');
  });
  it('PLZ-Kette 1660 (Château-d’Oex): swisstopo-Schreibweise trifft BFS-Schlüssel', async () => {
    const treffer = (await plzAufloesen('1660'))!.filter((t) => t.kanton === 'VD');
    expect(treffer.length).toBeGreaterThan(0);
    const haupt = hauptTreffer(treffer) ?? treffer[0];
    const amt = await amtFuer('VD', haupt.gemeinde);
    expect(amt?.name, haupt.gemeinde).toBe('Justice de paix Riviera');
  });
});

describe('VD: schlichtungAufloesung mit/ohne Streitwert-Kontext', () => {
  it('ohne Kontext → ehrlicher Verzeichnis-Fallback (keine pauschale JdP-Liste)', () => {
    const r = schlichtungAufloesung('VD', 'ordentlich')!;
    expect(r.aufloesung.modus).toBe('verzeichnis');
  });
  it('nicht vermögensrechtlich → Verzeichnis-Fallback mit Kaskaden-Text', () => {
    const r = schlichtungAufloesung('VD', 'ordentlich', { vermoegensrechtlich: false, streitwertCHF: null })!;
    expect(r.aufloesung.modus).toBe('verzeichnis');
    if (r.aufloesung.modus === 'verzeichnis') {
      expect(r.aufloesung.beschreibung).toContain('Art. 41 CDPJ-VD');
      expect(r.aufloesung.url).toMatch(/^https:\/\/www\.vd\.ch\//);
    }
  });
  it('5 000 → Liste der 9 Justices de paix', () => {
    const r = schlichtungAufloesung('VD', 'ordentlich', { vermoegensrechtlich: true, streitwertCHF: 5000 })!;
    expect(r.aufloesung.modus).toBe('liste');
    if (r.aufloesung.modus === 'liste') expect(r.aufloesung.stellen.length).toBe(9);
  });
  it('50 000 → Liste der 4 Tribunaux d’arrondissement', () => {
    const r = schlichtungAufloesung('VD', 'ordentlich', { vermoegensrechtlich: true, streitwertCHF: 50_000 })!;
    expect(r.aufloesung.modus).toBe('liste');
    if (r.aufloesung.modus === 'liste') {
      expect(r.aufloesung.stellen.length).toBe(4);
      expect(r.aufloesung.hinweis).toContain('Art. 96b Abs. 3');
    }
  });
  it('250 000 → zentral Chambre patrimoniale cantonale', () => {
    const r = schlichtungAufloesung('VD', 'ordentlich', { vermoegensrechtlich: true, streitwertCHF: 250_000 })!;
    expect(r.aufloesung.modus).toBe('zentral');
    if (r.aufloesung.modus === 'zentral') expect(r.aufloesung.stelle.name).toBe('Chambre patrimoniale cantonale');
  });
  it('Miete bleibt unberührt von der Weiche (Commissions préfectorales)', () => {
    const r = schlichtungAufloesung('VD', 'paritaetisch_miete', { vermoegensrechtlich: true, streitwertCHF: 250_000 })!;
    expect(r.aufloesung.modus).toBe('verzeichnis');
  });
});

// ─── Arbeitsrecht inkl. GlG: LJT-Kaskade (Bug-Check-Befund 11.6.2026) ────────
describe('VD-Arbeitsrecht: prud’hommes-Kaskade nach Art. 2 LJT', () => {
  it('Grenzwerte: ≤ 30 000 prud’hommes (lit. a), dann TA (lit. b), dann Chambre (lit. c)', () => {
    expect(vdArbeitsStufe(8000)?.instanz).toBe('prudhommes');
    expect(vdArbeitsStufe(30_000)?.instanz).toBe('prudhommes');
    expect(vdArbeitsStufe(30_000.01)?.instanz).toBe('tribunal_arrondissement');
    expect(vdArbeitsStufe(100_000)?.instanz).toBe('tribunal_arrondissement');
    expect(vdArbeitsStufe(100_000.01)?.instanz).toBe('chambre_patrimoniale');
    expect(vdArbeitsStufe(null)).toBeNull();
  });
  it('Lohnforderung 8 000 in Lausanne → prud’hommes des TA Lausanne, NICHT die Justice de paix', async () => {
    const amt = await vdAmtFuer('Lausanne', 'justice_de_paix', true);
    expect(amt?.name).toBe('Tribunal de prud’hommes (Tribunal d’arrondissement de Lausanne)');
    expect(amt?.plzOrt).toBe('1014 Lausanne');
  });
  it('Arbeit 20 000 in Morges → prud’hommes des TA La Côte; 50 000 → TA La Côte selbst', async () => {
    expect((await vdAmtFuer('Morges', 'ta_praesident', true))?.name).toBe('Tribunal de prud’hommes (Tribunal d’arrondissement de La Côte)');
    expect((await vdAmtFuer('Morges', 'tribunal_arrondissement', true))?.name).toBe('Tribunal d’arrondissement de La Côte');
  });
  it('schlichtungAufloesung: Arbeit 8 000 → prud’hommes-Liste (4); 50 000 → TA-Liste; 200 000 → Chambre', () => {
    const klein = schlichtungAufloesung('VD', 'ordentlich', { vermoegensrechtlich: true, streitwertCHF: 8000, arbeitsrechtlich: true })!;
    expect(klein.aufloesung.modus).toBe('liste');
    if (klein.aufloesung.modus === 'liste') {
      expect(klein.aufloesung.stellen).toBe(VD_PRUDHOMMES);
      expect(klein.aufloesung.hinweis).toContain('Art. 2 Abs. 1 lit. a');
    }
    const mittel = schlichtungAufloesung('VD', 'ordentlich', { vermoegensrechtlich: true, streitwertCHF: 50_000, arbeitsrechtlich: true })!;
    if (mittel.aufloesung.modus === 'liste') expect(mittel.aufloesung.stellen).toBe(VD_TRIBUNAUX);
    const gross = schlichtungAufloesung('VD', 'ordentlich', { vermoegensrechtlich: true, streitwertCHF: 200_000, arbeitsrechtlich: true })!;
    expect(gross.aufloesung.modus).toBe('zentral');
  });
  it('GlG in VD: echte Stelle statt Fallback-Disclaimer; ohne Geldbegehren streitwertunabhängig prud’hommes (Art. 2 Abs. 2 LJT)', () => {
    const ohneGeld = schlichtungAufloesung('VD', 'paritaetisch_glg', { vermoegensrechtlich: false, streitwertCHF: null })!;
    expect(ohneGeld.glgFallback).toBe(false);
    expect(ohneGeld.aufloesung.modus).toBe('liste');
    if (ohneGeld.aufloesung.modus === 'liste') {
      expect(ohneGeld.aufloesung.stellen).toBe(VD_PRUDHOMMES);
      expect(ohneGeld.aufloesung.hinweis).toContain('Art. 2 Abs. 2');
    }
    const mitGeld = schlichtungAufloesung('VD', 'paritaetisch_glg', { vermoegensrechtlich: true, streitwertCHF: 45_000 })!;
    if (mitGeld.aufloesung.modus === 'liste') expect(mitGeld.aufloesung.stellen).toBe(VD_TRIBUNAUX);
  });
  it('prud’hommes-Stellen: TA-Adressen (Art. 5 LJT) + amtliche Links', () => {
    expect(VD_PRUDHOMMES.length).toBe(4);
    VD_PRUDHOMMES.forEach((p, i) => {
      expect(p.strasse).toBe(VD_TRIBUNAUX[i].strasse);
      expect(p.plzOrt).toBe(VD_TRIBUNAUX[i].plzOrt);
      expect(p.url).toMatch(/^https:\/\/www\.vd\.ch\//);
    });
  });
});

describe('Apostroph-Normalisierung (Bug-Check 11.6.2026)', () => {
  it('handgetipptes «Château-d’Oex» (U+2019) trifft den ASCII-Schlüssel', async () => {
    expect((await amtFuer('VD', 'Château-d’Oex'))?.name).toBe('Justice de paix Riviera');
    expect((await vdAmtFuer('Château-d’Oex', 'ta_praesident'))?.name).toBe('Tribunal d’arrondissement de l’Est vaudois');
  });
  it('JdP Jura-Nord vaudois/Gros-de-Vaud trägt die amtliche Postanschrift (Case postale, 1401)', async () => {
    const amt = await amtFuer('VD', 'Yverdon-les-Bains');
    expect(amt?.strasse).toBe('Rue des Moulins 10, Case postale');
    expect(amt?.plzOrt).toBe('1401 Yverdon-les-Bains');
  });
});
