import { describe, it, expect } from 'vitest';
import { SCHLICHTUNGSSTELLEN, schlichtungAufloesung } from '../data/schlichtungsstellen';
import { KANTONE } from '../lib/kantone';

// Akzeptanztests Schlichtungsstellen-Schicht (Anordnung David 5.6.2026:
// konkrete Stelle für ALLE Kantone). Quellen: zweifach geprüfte Dossiers
// bibliothek/behoerden/ (Stand 5.6.2026).

describe('Schlichtungsstellen — Vollständigkeit & Integrität', () => {
  it('alle 26 Kantone tragen eine ordentliche Auflösung mit Quelle und Stand', () => {
    for (const k of KANTONE) {
      const e = SCHLICHTUNGSSTELLEN[k];
      expect(e, k).toBeDefined();
      expect(e.quelle.length, k).toBeGreaterThan(5);
      expect(e.stand, k).toBe('5.6.2026');
      expect(['zentral', 'liste', 'verzeichnis']).toContain(e.ordentlich.modus);
    }
  });
  it('Listen sind nie leer; Verzeichnisse tragen https-URL; zentrale Stellen eine volle Adresse', () => {
    for (const k of KANTONE) {
      for (const a of [SCHLICHTUNGSSTELLEN[k].ordentlich, SCHLICHTUNGSSTELLEN[k].miete, SCHLICHTUNGSSTELLEN[k].glg]) {
        if (!a) continue;
        if (a.modus === 'liste') expect(a.stellen.length, k).toBeGreaterThan(0);
        if (a.modus === 'verzeichnis') expect(a.url, k).toMatch(/^https:\/\//);
        if (a.modus === 'zentral') {
          expect(a.stelle.strasse.length, k).toBeGreaterThan(3);
          expect(a.stelle.plzOrt, k).toMatch(/^\d{4} /);
        }
      }
    }
  });
});

describe('Schlichtungsstellen — Stichproben (zweifach geprüfte Werte)', () => {
  it('BL Miete: Rheinstrasse 16 (Schiedsrichter-Entscheid; Bahnhofstrasse überholt)', () => {
    const m = SCHLICHTUNGSSTELLEN.BL.miete!;
    expect(m.modus).toBe('zentral');
    if (m.modus === 'zentral') expect(m.stelle.strasse).toContain('Rheinstrasse 16');
  });
  it('OW zentral Enetriederstrasse 1; VS Miete 1950 Sion; ZG Miete 6300', () => {
    const ow = SCHLICHTUNGSSTELLEN.OW.ordentlich;
    if (ow.modus === 'zentral') expect(ow.stelle.strasse).toContain('Enetriederstrasse 1');
    const vs = SCHLICHTUNGSSTELLEN.VS.miete!;
    if (vs.modus === 'zentral') expect(vs.stelle.plzOrt).toBe('1950 Sion');
    const zg = SCHLICHTUNGSSTELLEN.ZG.miete!;
    if (zg.modus === 'zentral') expect(zg.stelle.plzOrt).toBe('6300 Zug');
  });
  it('TI Miete: 10 Listen-Einträge inkl. eigenem Chiasso (11 Standorte, Lugano Est/Ovest zusammen)', () => {
    const ti = SCHLICHTUNGSSTELLEN.TI.miete!;
    expect(ti.modus).toBe('liste');
    if (ti.modus === 'liste') {
      expect(ti.stellen.length).toBe(10);
      expect(ti.stellen.some((s) => s.plzOrt.includes('Chiasso'))).toBe(true);
    }
  });
  it('GR ordentlich: 11 Vermittlerämter (Imboden Postfach 308)', () => {
    const gr = SCHLICHTUNGSSTELLEN.GR.ordentlich;
    expect(gr.modus).toBe('liste');
    if (gr.modus === 'liste') {
      expect(gr.stellen.length).toBe(11);
      expect(gr.stellen.find((s) => s.name.includes('Imboden'))?.strasse).toContain('Postfach 308');
    }
  });
  it('SH trägt den Adress-Vorbehalt (Vordergasse vs. Fronwagplatz)', () => {
    const sh = SCHLICHTUNGSSTELLEN.SH.ordentlich;
    if (sh.modus === 'zentral') expect(sh.stelle.hinweis).toContain('Fronwagplatz');
  });
});

describe('schlichtungAufloesung — Typ-Routing und GlG-Fallback', () => {
  it('Miete nutzt die Miet-Stelle; ohne eigene GlG-Stelle Fallback auf ordentlich mit Flag', () => {
    const miete = schlichtungAufloesung('BL', 'paritaetisch_miete')!;
    expect(miete.aufloesung.modus).toBe('zentral');
    expect(miete.glgFallback).toBe(false);
    const glg = schlichtungAufloesung('UR', 'paritaetisch_glg')!;
    expect(glg.glgFallback).toBe(true);
    const glgZH = schlichtungAufloesung('ZH', 'paritaetisch_glg')!;
    expect(glgZH.glgFallback).toBe(false);
  });
  it('deterministisch: zweimal dieselbe Anfrage → identisches Objekt-Inhalt', () => {
    expect(schlichtungAufloesung('BE', 'ordentlich')).toEqual(schlichtungAufloesung('BE', 'ordentlich'));
  });
});
