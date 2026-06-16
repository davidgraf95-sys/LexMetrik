/**
 * Tests für parseFedlexCacheEintraege — parst das EINTRAEGE-Array aus fedlex-cache.sh.
 * TDD: Test zuerst (FAIL) → implementieren → grün.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseFedlexCacheEintraege } from '../../scripts/normtext/inventar-bund';

const shellQuelle = readFileSync('scripts/fedlex-cache.sh', 'utf8');

describe('parseFedlexCacheEintraege', () => {
  it('parst die echte fedlex-cache.sh und liefert mindestens 15 Gesetze', () => {
    const eintraege = parseFedlexCacheEintraege(shellQuelle);
    expect(eintraege.length).toBeGreaterThanOrEqual(15);
  });

  it('OR-Eintrag ist korrekt', () => {
    const eintraege = parseFedlexCacheEintraege(shellQuelle);
    const or = eintraege.find((e) => e.name === 'or');
    expect(or).toBeDefined();
    expect(or!.eli).toBe('cc/27/317_321_377');
    expect(or!.konsolidierung).toBe('20260101');
  });

  it('OR-Anker enthält art_335_c', () => {
    const eintraege = parseFedlexCacheEintraege(shellQuelle);
    const or = eintraege.find((e) => e.name === 'or');
    expect(or!.anker).toContain('art_335_c');
  });

  it('keine Kommentarzeile erscheint als Eintrag (kein # im name)', () => {
    const eintraege = parseFedlexCacheEintraege(shellQuelle);
    for (const e of eintraege) {
      expect(e.name).not.toMatch(/#/);
      expect(e.eli).not.toMatch(/#/);
    }
  });

  it('alle Einträge haben name, eli, konsolidierung und mindestens einen Anker', () => {
    const eintraege = parseFedlexCacheEintraege(shellQuelle);
    for (const e of eintraege) {
      expect(e.name.length).toBeGreaterThan(0);
      expect(e.eli.length).toBeGreaterThan(0);
      expect(e.konsolidierung).toMatch(/^\d{8}$/);
      expect(e.anker.length).toBeGreaterThan(0);
    }
  });

  it('Anker sind mit art_-Präfix gespeichert', () => {
    const eintraege = parseFedlexCacheEintraege(shellQuelle);
    for (const e of eintraege) {
      for (const a of e.anker) {
        expect(a).toMatch(/^art_/);
      }
    }
  });

  it('OR hat genau 10 Anker gemäss shell-Datei', () => {
    const eintraege = parseFedlexCacheEintraege(shellQuelle);
    const or = eintraege.find((e) => e.name === 'or');
    // art_11,art_32,art_77,art_104,art_216,art_324_a,art_335_c,art_336_c,art_396,art_493
    expect(or!.anker.length).toBe(10);
  });

  it('stgb hat konsolidierung 20260612', () => {
    const eintraege = parseFedlexCacheEintraege(shellQuelle);
    const stgb = eintraege.find((e) => e.name === 'stgb');
    expect(stgb).toBeDefined();
    expect(stgb!.konsolidierung).toBe('20260612');
  });
});
