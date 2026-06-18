/**
 * Tests für sammleKantonInventar / sammleFallback — sammelt die kantonalen
 * LexWork-Normquellen aus den Tarif-Tabellen (src/data/tarif/*.ts) und gruppiert
 * sie nach (kanton, host, lang, lawId) mit deduplizierten Artikel-Tokens.
 * Nicht-LexWork-Quellen (PDF, zhlex, lexfind, silgeneve, rsn, m3.ti, …) landen
 * in der Fallback-Liste.
 *
 * TDD: Test zuerst (FAIL) → implementieren → grün.
 */
import { describe, it, expect } from 'vitest';
import {
  sammleKantonInventar,
  sammleFallback,
  sammlePdfInventar,
  sammleHtmInventar,
  sammleZhPdfInventar,
} from '../../scripts/normtext/inventar-kanton';

describe('sammleKantonInventar', () => {
  const inventar = sammleKantonInventar();

  it('erfasst mindestens 10 Kantone', () => {
    const kantone = new Set(inventar.map((g) => g.kanton));
    expect(kantone.size).toBeGreaterThanOrEqual(10);
  });

  it('jede Gruppe hat host/lang/lawId und mindestens einen Artikel', () => {
    for (const g of inventar) {
      expect(g.host.length).toBeGreaterThan(0);
      expect(['de', 'fr']).toContain(g.lang);
      expect(g.lawId.length).toBeGreaterThan(0);
      expect(g.artikel.length).toBeGreaterThan(0);
    }
  });

  it('BE/161.12 ist dabei (host belex.sites.be.ch, Token 36)', () => {
    const be = inventar.find(
      (g) => g.kanton === 'BE' && g.lawId === '161.12',
    );
    expect(be).toBeDefined();
    // §7 «Realität gewinnt»: der LexWork-Host wird unverändert übernommen; BE
    // liefert die API empirisch NUR unter der www-Variante (siehe Adapter-Run).
    expect(be!.host).toContain('belex.sites.be.ch');
    expect(be!.lang).toBe('de');
    expect(be!.artikel.map((a) => a.token)).toContain('36');
  });

  it('Artikel-Tokens je Gruppe sind distinkt (dedupe)', () => {
    for (const g of inventar) {
      const tokens = g.artikel.map((a) => a.token);
      expect(new Set(tokens).size).toBe(tokens.length);
    }
  });

  it('keine Gruppe trägt eine PDF- oder Nicht-LexWork-Quelle', () => {
    for (const g of inventar) {
      // host stammt aus einer /app/(de|fr)/texts_of_law/-URL → nie ein .pdf-Pfad
      expect(g.host).not.toMatch(/\.pdf$/i);
    }
  });

  it('ZG-Gerichtskosten (161.7) ist erfasst', () => {
    const zg = inventar.find((g) => g.kanton === 'ZG' && g.lawId === '161.7');
    expect(zg).toBeDefined();
    expect(zg!.host).toBe('bgs.zg.ch');
  });
});

describe('sammleFallback', () => {
  const fallback = sammleFallback();

  // Fachliche Änderung (16.6.2026, PDF-Adapter SZ/TI/VD/JU): die SZ-Text-PDF
  // (sz.ch …/*.pdf) sind jetzt über den generischen PDF-Adapter als Volltext
  // erschlossen — sie sind darum NICHT mehr Fallback, sondern im PDF-Inventar.
  it('SZ-Text-PDF (sz.ch) ist NICHT mehr Fallback, sondern im PDF-Inventar', () => {
    const szPdfFallback = fallback.find(
      (f) => f.kanton === 'SZ' && /sz\.ch.*\.pdf$/i.test(f.quelleUrl),
    );
    expect(szPdfFallback).toBeUndefined();
    const szPdf = sammlePdfInventar().find(
      (g) => g.kanton === 'SZ' && g.profil === 'sz',
    );
    expect(szPdf).toBeDefined();
  });

  // Fachliche Änderung (17.6.2026, Auftrag David «Volltext bei allen Kantonen»):
  // parsePassus löst jetzt «Anhang Ziff. N.N.N» (ZH NotGebV) auf einen gepunkteten
  // Token auf → die zhlex-Erlass-Quelle ist NICHT mehr Fallback, sondern wird über
  // den ZH-PDF-Anhang-Segmentierer als Volltext erschlossen (sammleZhPdfInventar).
  it('ZH NotGebV (zhlex-Anhang) ist erschlossen, nicht mehr Fallback', () => {
    const zhFallback = fallback.find(
      (f) => f.kanton === 'ZH' && /zhlex-ls\/erlass/i.test(f.quelleUrl),
    );
    expect(zhFallback).toBeUndefined();
    const zhInv = sammleZhPdfInventar().find(
      (g) => g.kanton === 'ZH' && /erlass-243/i.test(g.quelleUrl),
    );
    expect(zhInv).toBeDefined();
    // der Anhang-Token (gepunktet) ist im Inventar enthalten
    expect(zhInv!.artikel.some((a) => a.token.includes('.'))).toBe(true);
  });

  it('keine Fallback-Quelle ist eine LexWork-/app/-URL', () => {
    for (const f of fallback) {
      expect(f.quelleUrl).not.toMatch(
        /^https:\/\/[^/]+\/app\/(de|fr)\/texts_of_law\//,
      );
    }
  });

  it('keine PDF-Quelle, die im PDF-Inventar erschlossen ist, ist noch Fallback', () => {
    // Jede (kanton, quelleUrl)-Kombination, die das PDF-Inventar erschliesst,
    // darf NICHT mehr in der Fallback-Liste stehen (sonst doppelte Zuordnung,
    // §8). Quellen ohne parsebaren Artikel-Token (z.B. TI atto/181 «Keine
    // separate Handänderungssteuer») bleiben legitim Fallback — sie tauchen
    // gar nicht erst im PDF-Inventar auf.
    const erschlossen = new Set(
      sammlePdfInventar().map((g) => `${g.kanton}|${g.quelleUrl}`),
    );
    for (const f of fallback) {
      expect(erschlossen.has(`${f.kanton}|${f.quelleUrl}`)).toBe(false);
    }
  });
});

// Fachliche Änderung (17.6.2026, Auftrag David «Volltext bei allen Kantonen»):
// Neben SZ/VD/JU (m3-TI bleibt HTML) erschliesst der generische PDF-Adapter jetzt
// die OrdoLex/gr-lex-Familie über ein «(Stand …)»/«(état …)»-Stand-Profil:
// AR/GR/SG/FR/VS (olexAt) + LU (olexPar) via /api/versions/N/pdf_file, sowie
// TI-lexfind (125101/it, ti-Profil). NICHT erschlossen (kein Stand im PDF →
// Fallback): GE-lexfind, SZ-/VS-lexfind, TI-125201.
describe('sammlePdfInventar (PDF-Volltext-Quellen)', () => {
  const pdf = sammlePdfInventar();

  it('erfasst die erwarteten PDF-Kantone mit dem richtigen Profil', () => {
    const kantone = new Set(pdf.map((g) => g.kanton));
    expect([...kantone].sort()).toEqual(['AR', 'FR', 'GR', 'JU', 'LU', 'SG', 'SZ', 'TI', 'VD', 'VS']);
    const profilVon: Record<string, string> = {
      SZ: 'sz', VD: 'vd', JU: 'ju', TI: 'ti',
      AR: 'olexAt', GR: 'olexAt', SG: 'olexAt', FR: 'olexAt', VS: 'olexAt', LU: 'olexPar',
    };
    for (const g of pdf) {
      // SZ kann sowohl sz.ch-PDF (sz) tragen; alle anderen genau ein Profil.
      const erwartet = profilVon[g.kanton];
      if (g.kanton !== 'SZ') expect(g.profil).toBe(erwartet);
      expect(g.artikel.length).toBeGreaterThan(0);
    }
  });

  // lexfind ist erschlossen für: VD (vd-Profil, mehrere tolv), TI-125101 (ti-Profil,
  // LTG it) und SZ-82040 (sz-Profil, HSt — Stand «SRSZ» via rohText-Fallback).
  // GE-199638/TI-125201/VS-94116-lexfind bleiben Fallback (Extraktion scheitert
  // bzw. kein Stand). 17.6.2026.
  it('lexfind erschlossen nur für VD, TI-125101, SZ-82040', () => {
    const lexfindFremd = pdf.find(
      (g) => /lexfind\.ch/i.test(g.quelleUrl) && g.kanton !== 'VD'
        && !/\/tolv\/(125101|82040)\//.test(g.quelleUrl),
    );
    expect(lexfindFremd).toBeUndefined();
  });

  it('jede Gruppe trägt eine quelleUrl, die zum Profil-Host passt', () => {
    for (const g of pdf) {
      // sz-Profil: sz.ch-Asset-PDF ODER das SZ-HSt-lexfind-PDF (82040).
      if (g.profil === 'sz') expect(g.quelleUrl).toMatch(/www\.sz\.ch|lexfind\.ch\/tolv\/82040/);
      if (g.profil === 'vd') expect(g.quelleUrl).toMatch(/lexfind\.ch\/tolv/);
      if (g.profil === 'ju') expect(g.quelleUrl).toMatch(/rsju\.jura\.ch/);
    }
  });
});

describe('sammleHtmInventar (NE/GE/TI)', () => {
  const htm = sammleHtmInventar();

  it('erfasst TI über den HTM/TI-Profil (m3.ti.ch pdfatto/atto-quelleUrl)', () => {
    const ti = htm.filter((g) => g.profil === 'ti');
    expect(ti.length).toBeGreaterThan(0);
    for (const g of ti) {
      expect(g.kanton).toBe('TI');
      // Manifest-Key bleibt die EXAKTE Tarif-quelleUrl (pdfatto/atto).
      expect(g.quelleUrl).toMatch(/m3\.ti\.ch\/.*\/pdfatto\/atto\/\d+$/);
      expect(g.artikel.length).toBeGreaterThan(0);
    }
  });

  it('nur NE/GE/TI als HTM-Profile', () => {
    for (const g of htm) {
      expect(['ne', 'ge', 'ti']).toContain(g.profil);
    }
  });
});
