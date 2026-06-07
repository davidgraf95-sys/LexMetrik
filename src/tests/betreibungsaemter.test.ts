import { describe, it, expect } from 'vitest';
import { BETREIBUNGSAEMTER } from '../data/betreibungsaemter';
import { KANTONE } from '../lib/kantone';

// Akzeptanztests Betreibungsämter-Schicht (Auftrag David 7.6.2026:
// Betreibungsamt-Finder). Quelle: zweifach geprüftes Dossier
// bibliothek/behoerden/betreibungskreise-kantone.md (52 Agents, 7.6.2026).

describe('Betreibungsämter — Vollständigkeit & Integrität', () => {
  it('alle 26 Kantone tragen eine Auflösung mit Quelle und Stand', () => {
    for (const k of KANTONE) {
      const e = BETREIBUNGSAEMTER[k];
      expect(e, k).toBeDefined();
      expect(e.quelle.length, k).toBeGreaterThan(5);
      expect(e.stand, k).toBe('7.6.2026');
      expect(['einheitsamt', 'kreise', 'verzeichnis']).toContain(e.aufloesung.modus);
    }
  });
  it('Einheitsämter tragen volle Adresse; Kreise sind nie leer; Verzeichnisse https', () => {
    for (const k of KANTONE) {
      const a = BETREIBUNGSAEMTER[k].aufloesung;
      if (a.modus === 'einheitsamt') {
        expect(a.amt.strasse.length, k).toBeGreaterThan(3);
        expect(a.amt.plzOrt, k).toMatch(/^\d{4} /);
      }
      if (a.modus === 'kreise') {
        expect(a.aemter.length, k).toBeGreaterThan(1);
        for (const amt of a.aemter) {
          expect(amt.strasse.length, `${k}: ${amt.name}`).toBeGreaterThan(3);
          expect(amt.plzOrt, `${k}: ${amt.name}`).toMatch(/^\d{4} /);
        }
      }
      if (a.modus === 'verzeichnis') expect(a.url, k).toMatch(/^https:\/\//);
      const url = BETREIBUNGSAEMTER[k].url;
      if (url) expect(url, k).toMatch(/^https:\/\//);
    }
  });
});

describe('Betreibungsämter — Stichproben (dossier-verifizierte Werte)', () => {
  it('die 10 Einheitsamt-Kantone des Dossiers sind als Einheitsamt erfasst', () => {
    for (const k of ['BS', 'BL', 'SH', 'AI', 'NE', 'GE', 'JU', 'GL', 'OW', 'NW'] as const) {
      expect(BETREIBUNGSAEMTER[k].aufloesung.modus, k).toBe('einheitsamt');
    }
  });
  it('BS: Aeschenvorstadt 56 (Abteilung Betreibungen, staatskalender-geprüft)', () => {
    const a = BETREIBUNGSAEMTER.BS.aufloesung;
    if (a.modus === 'einheitsamt') {
      expect(a.amt.strasse).toBe('Aeschenvorstadt 56');
      expect(a.amt.plzOrt).toBe('4051 Basel');
    }
  });
  it('SH ist Einheitsamt SEIT 1.1.2025 (SHR 281.101; VOBA aufgehoben)', () => {
    const a = BETREIBUNGSAEMTER.SH.aufloesung;
    if (a.modus === 'einheitsamt') expect(a.amt.plzOrt).toBe('8200 Schaffhausen');
    expect(BETREIBUNGSAEMTER.SH.quelle).toContain('1.1.2025');
  });
  it('AI: Oberegg integriert (1.6.2024) — genau EIN Amt, Marktgasse 2', () => {
    const a = BETREIBUNGSAEMTER.AI.aufloesung;
    expect(a.modus).toBe('einheitsamt');
    if (a.modus === 'einheitsamt') expect(a.amt.strasse).toBe('Marktgasse 2');
  });
  it('SZ/AG-Verzeichnisse legen die Verbands- bzw. Erreichbarkeits-Lage offen (§8)', () => {
    expect(BETREIBUNGSAEMTER.SZ.quelle.toLowerCase()).toContain('verband');
    expect(BETREIBUNGSAEMTER.AG.quelle).toContain('nicht erreichbar');
  });
});
