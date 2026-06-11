import { describe, it, expect } from 'vitest';
import { amtFuer } from '../data/schlichtung/amtAufloesung';
import { schlichtungAufloesung } from '../data/schlichtungsstellen';
import aemterKantone from '../data/schlichtung/aemterKantone.json';

// ─── SO-Weiche § 5 Abs. 1 / § 10 GO SO (11.6.2026, Dossier §39) ─────────────
// Wortlaut am amtlichen Erlass (BGS 125.12, Stand 1.1.2026) verifiziert:
// gleiche Wohnsitz-/Sitzgemeinde beider Parteien → Friedensrichter dieser
// Gemeinde; sonst Amtsgerichtspräsidium des Richteramts. Kreis-Negativprobe
// amtlich: Kreis-Zusammenschlüsse erweitern die Zuständigkeit NICHT.

const so = (aemterKantone as Record<string, { aemter: { name: string }[]; gemeinden: Record<string, number> }>).SO;

describe('SO: Generator-Stand (5 Richterämter, 104 Gemeinden)', () => {
  it('5 Amtsgerichtspräsidien, alle 104 BFS-Gemeinden zugeordnet, alle Ämter erreicht', () => {
    expect(so.aemter.length).toBe(5);
    expect(Object.keys(so.gemeinden).length).toBe(104);
    expect(new Set(Object.values(so.gemeinden)).size).toBe(5);
  });
});

describe('SO: Gemeinde → Richteramt (Empirie, Amtei nach Art. 43 KV SO)', () => {
  const faelle: [string, string][] = [
    ['Grenchen', 'Richteramt Solothurn-Lebern (Amtsgerichtspräsidium)'],
    ['Solothurn', 'Richteramt Solothurn-Lebern (Amtsgerichtspräsidium)'],
    ['Messen', 'Richteramt Bucheggberg-Wasseramt (Amtsgerichtspräsidium)'],
    ['Zuchwil', 'Richteramt Bucheggberg-Wasseramt (Amtsgerichtspräsidium)'],
    ['Balsthal', 'Richteramt Thal-Gäu (Amtsgerichtspräsidium)'],
    ['Oensingen', 'Richteramt Thal-Gäu (Amtsgerichtspräsidium)'],
    ['Olten', 'Richteramt Olten-Gösgen (Amtsgerichtspräsidium)'],
    ['Trimbach', 'Richteramt Olten-Gösgen (Amtsgerichtspräsidium)'],
    ['Dornach', 'Richteramt Dorneck-Thierstein (Amtsgerichtspräsidium)'],
    ['Breitenbach', 'Richteramt Dorneck-Thierstein (Amtsgerichtspräsidium)'],
    // Fusionsgemeinden (so.ch-Liste führt teils Alt-Namen; BFS massgeblich)
    ['Kriegstetten', 'Richteramt Bucheggberg-Wasseramt (Amtsgerichtspräsidium)'],
    ['Welschenrohr-Gänsbrunnen', 'Richteramt Thal-Gäu (Amtsgerichtspräsidium)'],
  ];
  for (const [g, amt] of faelle) {
    it(`${g} → ${amt.replace(' (Amtsgerichtspräsidium)', '')}`, async () => {
      expect((await amtFuer('SO', g))?.name, g).toBe(amt);
    });
  }
});

describe('SO: schlichtungAufloesung mit der § 5-Weiche', () => {
  it('gleiche Gemeinde → Friedensrichter-Erklärung (keine Stellen-Liste, ehrlich ohne Adresse)', () => {
    const r = schlichtungAufloesung('SO', 'ordentlich', { vermoegensrechtlich: true, streitwertCHF: 5000, gleicheGemeinde: true })!;
    expect(r.aufloesung.modus).toBe('verzeichnis');
    if (r.aufloesung.modus === 'verzeichnis') {
      expect(r.aufloesung.beschreibung).toContain('§ 5 Abs. 1 GO SO');
      expect(r.aufloesung.beschreibung).toContain('Gemeindeverwaltung');
    }
  });
  it('verschiedene Gemeinden → AGP-Erklärung (§ 10 GO) mit Richterämter-Link', () => {
    const r = schlichtungAufloesung('SO', 'ordentlich', { vermoegensrechtlich: true, streitwertCHF: 5000, gleicheGemeinde: false })!;
    expect(r.aufloesung.modus).toBe('verzeichnis');
    if (r.aufloesung.modus === 'verzeichnis') {
      expect(r.aufloesung.beschreibung).toContain('§ 10 Abs. 1 GO SO');
      expect(r.aufloesung.url).toContain('richteraemter');
    }
  });
  it('unbeantwortet → Weiche-Erklärung mit beiden Wegen', () => {
    const r = schlichtungAufloesung('SO', 'ordentlich')!;
    expect(r.aufloesung.modus).toBe('verzeichnis');
    if (r.aufloesung.modus === 'verzeichnis') {
      expect(r.aufloesung.beschreibung).toContain('Friedensrichter');
      expect(r.aufloesung.beschreibung).toContain('Amtsgerichtspräsidium');
    }
  });
  it('Miete bleibt bei den Oberämtern (4er-Liste, § 5 Abs. 2 lit. d GO)', () => {
    const r = schlichtungAufloesung('SO', 'paritaetisch_miete', { vermoegensrechtlich: true, streitwertCHF: 5000, gleicheGemeinde: true })!;
    expect(r.aufloesung.modus).toBe('liste');
    if (r.aufloesung.modus === 'liste') expect(r.aufloesung.stellen.length).toBe(4);
  });
});

describe('NE: Miet-Schlichtung paritätisch bei der Chambre de conciliation (Art. 12 OJN)', () => {
  it('miete-Auflösung = dieselben drei Standorte wie ordentlich (SSoT), kein GlG-Fallback-Etikett', () => {
    const miete = schlichtungAufloesung('NE', 'paritaetisch_miete')!;
    const ordentlich = schlichtungAufloesung('NE', 'ordentlich')!;
    expect(miete.glgFallback).toBe(false);
    expect(miete.aufloesung.modus).toBe('liste');
    if (miete.aufloesung.modus === 'liste' && ordentlich.aufloesung.modus === 'liste') {
      expect(miete.aufloesung.stellen).toBe(ordentlich.aufloesung.stellen);
      expect(miete.aufloesung.hinweis).toContain('Art. 12 Abs. 1 OJN');
    }
  });
});

describe('SO: GlG geht NIE in die § 5-Weiche (Bug-Check B1, § 5 Abs. 2 lit. e GO)', () => {
  it('paritaetisch_glg → kantonale GlG-Stelle (zentral), auch bei gleicher Gemeinde', () => {
    const r = schlichtungAufloesung('SO', 'paritaetisch_glg', { vermoegensrechtlich: true, streitwertCHF: 5000, gleicheGemeinde: true })!;
    expect(r.glgFallback).toBe(false);
    expect(r.aufloesung.modus).toBe('zentral');
    if (r.aufloesung.modus === 'zentral') {
      expect(r.aufloesung.stelle.name).toContain('Gleichstellung');
    }
  });
});
