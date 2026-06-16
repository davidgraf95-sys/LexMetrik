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
    expect(be!.host).toBe('belex.sites.be.ch');
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

  it('enthält SZ (PDF-Quelle)', () => {
    const sz = fallback.find(
      (f) => f.kanton === 'SZ' && /\.pdf/i.test(f.quelleUrl),
    );
    expect(sz).toBeDefined();
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
});
