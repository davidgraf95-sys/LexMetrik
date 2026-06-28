// Zweiachsiger Einstieg (ROADMAP Schritt 5): Konsistenz der Rechtsgebiet ×
// Aufgabe-Projektion gegen den Katalog (§5/§8 — kein still verschwundenes
// Werkzeug, keine Doppel-/toten Einträge).
import { describe, it, expect } from 'vitest';
import { einstiegMatrix } from '../lib/einstieg';
import { ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';
import { kategorieFuer } from '../lib/oberkategorien';
import { RECHTSGEBIET_SEKTIONEN } from '../lib/startseiteConfigTypen';

const matrix = einstiegMatrix();
const gebietNamen = new Set(RECHTSGEBIET_SEKTIONEN.map((s) => s.name));
const verfuegbar = ALLE_KARTEN.filter((k) => istVerfuegbar(k));
const inMatrix = matrix.flatMap((g) => g.zellen.flatMap((z) => z.karten));

describe('einstiegMatrix — Konsistenz', () => {
  it('keine Karte doppelt in der Matrix', () => {
    const ids = inMatrix.map((k) => k.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('jede verfügbare Karte hat ein bekanntes Rechtsgebiet (kein verwaister Filterwert)', () => {
    const verwaist = verfuegbar.filter((k) => !gebietNamen.has(k.rechtsgebiet)).map((k) => `${k.id} → «${k.rechtsgebiet}»`);
    expect(verwaist).toEqual([]);
  });

  it('jede verfügbare Karte mit Aufgabe taucht GENAU einmal in der Matrix auf (kein stiller Verlust)', () => {
    const erwartet = verfuegbar.filter((k) => kategorieFuer(k) !== null).map((k) => k.id).sort();
    const tatsaechlich = inMatrix.map((k) => k.id).sort();
    expect(tatsaechlich).toEqual(erwartet);
  });

  it('anzahl je Gebiet = Summe der Zellen-Karten', () => {
    for (const g of matrix) {
      const summe = g.zellen.reduce((n, z) => n + z.karten.length, 0);
      // anzahl zählt ALLE Karten des Gebiets; Zellen nur jene mit Aufgabe.
      expect(summe, g.gebiet).toBeLessThanOrEqual(g.anzahl);
      expect(summe, g.gebiet).toBeGreaterThan(0);
    }
  });

  it('keine leeren Gebiete/Zellen in der Ausgabe (§8)', () => {
    for (const g of matrix) {
      expect(g.zellen.length, g.gebiet).toBeGreaterThan(0);
      for (const z of g.zellen) expect(z.karten.length, `${g.gebiet}/${z.kategorie}`).toBeGreaterThan(0);
    }
  });

  it('nur verfügbare Karten (kein toter Link)', () => {
    for (const k of inMatrix) expect(istVerfuegbar(k), k.id).toBe(true);
  });

  it('zwei Achsen vorhanden: mehrere Gebiete und mind. ein Gebiet mit ≥2 Aufgaben', () => {
    expect(matrix.length).toBeGreaterThan(3);
    expect(matrix.some((g) => g.zellen.length >= 2)).toBe(true);
  });
});
