import { describe, it, expect } from 'vitest';
import { ZIVILGERICHTE_ERSTINSTANZ, zivilgerichtErstinstanz } from '../data/zivilgerichteErstinstanz';
import { KANTONE } from '../lib/kantone';

// Akzeptanztests Erstinstanz-Gerichtsschicht (Kantonsausbau vereinfachte
// Klage, Auftrag David 10.6.2026). Quellen: gerichtsbehoerden-kantone.md +
// gerichtsadressen-erstliste.md (zweifach geprüft); ZH-Nachtrag 10.6.2026.

describe('Zivilgerichte Erstinstanz — Vollständigkeit & Integrität', () => {
  it('alle 26 Kantone mit Quelle, Stand und gültigem Modus', () => {
    for (const k of KANTONE) {
      const e = ZIVILGERICHTE_ERSTINSTANZ[k];
      expect(e, k).toBeDefined();
      expect(e.quelle.length, k).toBeGreaterThan(5);
      expect(['zentral', 'liste', 'verzeichnis']).toContain(e.erstinstanz.modus);
    }
  });
  it('Listen nie leer; zentrale Stellen volle Adresse; Verzeichnisse https', () => {
    for (const k of KANTONE) {
      const a = ZIVILGERICHTE_ERSTINSTANZ[k].erstinstanz;
      if (a.modus === 'liste') {
        expect(a.gerichte.length, k).toBeGreaterThan(0);
        for (const g of a.gerichte) expect(g.plzOrt, `${k}: ${g.name}`).toMatch(/^\d{4} /);
      }
      if (a.modus === 'zentral') {
        expect(a.stelle.strasse.length, k).toBeGreaterThan(3);
        expect(a.stelle.plzOrt, k).toMatch(/^\d{4} /);
      }
      if (a.modus === 'verzeichnis') expect(a.url, k).toMatch(/^https:\/\//);
    }
  });
});

describe('Zivilgerichte Erstinstanz — Stichproben (verifizierte Korrekturen)', () => {
  it('ZH: 12 Bezirksgerichte; BG Zürich Briefpost = Postfach, 8036 Zürich', () => {
    const zh = zivilgerichtErstinstanz('ZH')!.erstinstanz;
    expect(zh.modus).toBe('liste');
    if (zh.modus === 'liste') {
      expect(zh.gerichte).toHaveLength(12);
      const bgZh = zh.gerichte.find((g) => g.name === 'Bezirksgericht Zürich')!;
      expect(bgZh.plzOrt).toBe('8036 Zürich');
      expect(zh.gerichte.find((g) => g.name === 'Bezirksgericht Winterthur')?.strasse).toBe('Lindstrasse 10');
    }
  });
  it('LU: BG Kriens Villastrasse 1 (Erstlisten-Korrektur, nicht Schachenstrasse)', () => {
    const lu = zivilgerichtErstinstanz('LU')!.erstinstanz;
    if (lu.modus === 'liste') {
      expect(lu.gerichte.find((g) => g.name.includes('Kriens'))?.strasse).toBe('Villastrasse 1');
    } else { expect.unreachable('LU muss liste sein'); }
  });
  it('BE: Bern-Mittelland ZIVILABTEILUNG Effingerstrasse 34 (Hodlerstrasse = nur Straf)', () => {
    const be = zivilgerichtErstinstanz('BE')!.erstinstanz;
    if (be.modus === 'liste') {
      const bm = be.gerichte.find((g) => g.name.includes('Bern-Mittelland'))!;
      expect(bm.strasse).toContain('Effingerstrasse 34');
    } else { expect.unreachable('BE muss liste sein'); }
  });
  it('Einheitsgericht-Kantone zentral: UR Landgericht, GL/SH/AR Kantonsgericht = ERSTE Instanz', () => {
    for (const [k, name] of [['UR', 'Landgericht'], ['GL', 'Kantonsgericht'], ['SH', 'Kantonsgericht'], ['AR', 'Kantonsgericht']] as const) {
      const e = zivilgerichtErstinstanz(k)!.erstinstanz;
      expect(e.modus, k).toBe('zentral');
      if (e.modus === 'zentral') expect(e.stelle.name, k).toContain(name);
    }
  });
  it('GE: TPI zentral + belegte Sonderwege Arbeit (prud’hommes) und Miete (baux)', () => {
    const ge = zivilgerichtErstinstanz('GE')!;
    expect(ge.erstinstanz.modus).toBe('zentral');
    expect(ge.hinweisArbeit).toContain('prud’hommes');
    expect(ge.hinweisMiete).toContain('baux');
  });
});

describe('Namens-Offenlegung «Kantonsgericht = erste Instanz» (Befund David 11.6.2026)', () => {
  // In OW/NW/GL/ZG/SH/AR heisst das ERSTINSTANZLICHE Zivilgericht amtlich
  // «Kantonsgericht» (obere Instanz: Obergericht) — Dossier
  // gerichtsbehoerden-kantone.md. Ohne Offenlegung liest der Auto-Adressat
  // sich wie die obere kantonale Instanz.
  it('alle zentralen «Kantonsgericht»-Kantone tragen den Instanz-Hinweis', () => {
    for (const k of ['OW', 'NW', 'GL', 'ZG', 'SH', 'AR'] as const) {
      const e = zivilgerichtErstinstanz(k)!;
      expect(e.namensHinweis, k).toBeTruthy();
      expect(e.namensHinweis, k).toMatch(/erstinstanzlich/i);
      expect(e.namensHinweis, k).toContain('Obergericht');
    }
  });
  it('eindeutig benannte Kantone brauchen keinen Hinweis', () => {
    for (const k of ['BS', 'GE', 'JU', 'AI', 'UR'] as const) {
      expect(zivilgerichtErstinstanz(k)!.namensHinweis, k).toBeUndefined();
    }
  });
});
