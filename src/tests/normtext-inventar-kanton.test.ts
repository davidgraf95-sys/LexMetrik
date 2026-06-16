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

  it('enthält ZH (zhlex-html, kein LexWork)', () => {
    const zh = fallback.find(
      (f) => f.kanton === 'ZH' && /zhlex/i.test(f.quelleUrl),
    );
    expect(zh).toBeDefined();
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

describe('sammlePdfInventar (SZ/TI/VD/JU)', () => {
  const pdf = sammlePdfInventar();

  it('erfasst genau die vier PDF-Kantone mit dem richtigen Profil', () => {
    const kantone = new Set(pdf.map((g) => g.kanton));
    expect([...kantone].sort()).toEqual(['JU', 'SZ', 'TI', 'VD']);
    for (const g of pdf) {
      const erwartet = { SZ: 'sz', TI: 'ti', VD: 'vd', JU: 'ju' }[g.kanton];
      expect(g.profil).toBe(erwartet);
      expect(g.artikel.length).toBeGreaterThan(0);
    }
  });

  it('lexfind nur für VD (GE/TI/VS-lexfind bleiben Fallback)', () => {
    const lexfindNichtVd = pdf.find(
      (g) => /lexfind\.ch/i.test(g.quelleUrl) && g.kanton !== 'VD',
    );
    expect(lexfindNichtVd).toBeUndefined();
  });

  it('jede Gruppe trägt eine quelleUrl, die zum Profil-Host passt', () => {
    for (const g of pdf) {
      if (g.profil === 'sz') expect(g.quelleUrl).toMatch(/www\.sz\.ch/);
      if (g.profil === 'ti') expect(g.quelleUrl).toMatch(/m3\.ti\.ch/);
      if (g.profil === 'vd') expect(g.quelleUrl).toMatch(/lexfind\.ch\/tolv/);
      if (g.profil === 'ju') expect(g.quelleUrl).toMatch(/rsju\.jura\.ch/);
    }
  });
});
