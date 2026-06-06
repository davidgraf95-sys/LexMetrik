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

describe('PLZ-Auflösung (amtliches Ortschaftenverzeichnis) + ZH-Amt', () => {
  it('PLZ → Gemeinde/Kanton: eindeutig, mehrgemeindig und unbekannt', async () => {
    const { plzAufloesen } = await import('../data/plz/plzAufloesung');
    // Format-Erweiterung 6.6.2026 (PLZ-Audit): + amtlicher Adressenanteil.
    expect(await plzAufloesen('4051')).toEqual([{ gemeinde: 'Basel', kanton: 'BS', anteilProzent: 100 }]);
    const t8134 = await plzAufloesen('8134');
    expect(t8134!.map((x) => x.gemeinde)).toContain('Adliswil');
    expect(await plzAufloesen('0000')).toBeNull();
    expect(await plzAufloesen('abc')).toBeNull();
  });
  it('ZH: Gemeinde → konkretes Friedensrichteramt (inkl. Klammer-Variante); Stadt Zürich → 6 Kreis-Ämter', async () => {
    const { zhFriedensrichterFuer, zuerichKreisAemter } = await import('../data/schlichtung/zhAmt');
    expect((await zhFriedensrichterFuer('Adliswil'))?.strasse).toBe('Zürichstrasse 10');
    expect((await zhFriedensrichterFuer('Wald (ZH)'))?.plzOrt).toContain('8636');
    expect((await zhFriedensrichterFuer('Wald'))?.plzOrt).toContain('8636'); // Klammer-Fallback
    expect(await zhFriedensrichterFuer('Bern')).toBeNull();
    expect((await zuerichKreisAemter()).length).toBe(6);
  });
  it('Kette PLZ → Gemeinde → ZH-Amt (8400 Winterthur → Stadthausstrasse 4a)', async () => {
    const { plzAufloesen } = await import('../data/plz/plzAufloesung');
    const { zhFriedensrichterFuer } = await import('../data/schlichtung/zhAmt');
    const treffer = (await plzAufloesen('8400'))!;
    expect(treffer.map((t) => t.gemeinde)).toContain('Winterthur');
    const amt = await zhFriedensrichterFuer('Winterthur');
    expect(amt?.strasse).toBe('Stadthausstrasse 4a');
  });
});

describe('Gemeinde→Amt-Auflösung AG/SG/TG/FR/ZG/AI (amtAufloesung)', () => {
  it('Stichproben über alle sechs generierten Kantone', async () => {
    const { amtFuer, AMT_KANTONE } = await import('../data/schlichtung/amtAufloesung');
    expect(AMT_KANTONE).toContain('FR');
    expect((await amtFuer('AG', 'Wettingen'))?.strasse).toContain('Zwyssigstrasse 76');
    expect((await amtFuer('SG', 'Flawil'))?.name).toBe('Vermittlungsamt Wil');
    expect((await amtFuer('TG', 'Roggwil (TG)'))?.name).toContain('Arbon');
    expect((await amtFuer('TG', 'Roggwil'))?.name).toContain('Arbon'); // Suffix-Fallback
    expect((await amtFuer('FR', 'Murten'))?.name).toContain('Seebezirk');
    expect((await amtFuer('ZG', 'Cham'))?.plzOrt).toBe('6330 Cham');
    expect((await amtFuer('AI', 'Gonten'))?.name).toBe('Vermittleramt Gonten');
    // SZ/BL bewusst nicht auflösbar (Verzeichnis-Fallback)
    expect(await amtFuer('SZ', 'Lachen')).toBeNull();
    expect(await amtFuer('BL', 'Sissach')).toBeNull();
  });
  it('Kette PLZ → Gemeinde → Amt (3280 Murten → Seebezirk; 9500 dokumentiert die Mehr-Gemeinden-Ambiguität)', async () => {
    const { plzAufloesen } = await import('../data/plz/plzAufloesung');
    const { amtFuer } = await import('../data/schlichtung/amtAufloesung');
    const murten = (await plzAufloesen('3280'))!.find((t) => t.gemeinde === 'Murten')!;
    expect((await amtFuer('FR', murten.gemeinde))?.name).toContain('Seebezirk');
    // PLZ 9500 umfasst amtlich VIER Gemeinden in ZWEI Kantonen (Kirchberg SG,
    // Wil SG, Zuzwil SG, Münchwilen TG) — die UI verlangt deshalb bei
    // Mehrdeutigkeit die Gemeinde-Präzisierung; die Auflösung pro Gemeinde
    // bleibt deterministisch:
    const t9500 = (await plzAufloesen('9500'))!;
    expect(t9500.length).toBeGreaterThan(1);
    expect(new Set(t9500.map((t) => t.kanton)).size).toBe(2);
    expect((await amtFuer('SG', 'Wil (SG)'))?.name).toBe('Vermittlungsamt Wil');
    expect((await amtFuer('SG', 'Kirchberg (SG)'))?.name).toBe('Vermittlungsamt Toggenburg');
  });
});

describe('Gemeinde-Lookup case-insensitiv (Bug-Check-Fix 5.6.2026)', () => {
  it('handgetippte Kleinschreibung löst auf — exakte Schreibweise behält Vorrang', async () => {
    const { amtFuer } = await import('../data/schlichtung/amtAufloesung');
    const { zhFriedensrichterFuer } = await import('../data/schlichtung/zhAmt');
    expect((await amtFuer('AG', 'aarau'))?.name).toContain('Kreis I');
    expect((await amtFuer('TG', 'roggwil'))?.name).toContain('Arbon');
    expect((await zhFriedensrichterFuer('adliswil'))?.strasse).toBe('Zürichstrasse 10');
    expect((await zhFriedensrichterFuer('wald'))?.plzOrt).toContain('8636');
    // weiterhin kein Fuzzy: Tippfehler bleibt unaufgelöst
    expect(await amtFuer('AG', 'aaraau')).toBeNull();
  });
});

describe('GR: PLZ → Region → Vermittleramt (Task 12, 6.6.2026)', () => {
  it('Chur→Plessur · Klosters→Prättigau/Davos · Poschiavo→Bernina · Ilanz→Surselva', async () => {
    const { amtFuer, AMT_KANTONE } = await import('../data/schlichtung/amtAufloesung');
    const { plzAufloesen } = await import('../data/plz/plzAufloesung');
    expect(AMT_KANTONE).toContain('GR');
    expect((await amtFuer('GR', 'Chur'))?.name).toContain('Plessur');
    expect((await amtFuer('GR', 'Klosters'))?.name).toContain('Prättigau');
    expect((await amtFuer('GR', 'Poschiavo'))?.plzOrt).toBe('7742 Poschiavo');
    const ilanz = (await plzAufloesen('7130'))!.find((t) => t.kanton === 'GR')!;
    expect((await amtFuer('GR', ilanz.gemeinde))?.name).toContain('Surselva');
  });
});
