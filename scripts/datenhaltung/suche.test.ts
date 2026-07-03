// scripts/datenhaltung/suche.test.ts
// QS-DATA E2-Vorarbeiten: Unit-Tests des Such-Query-Moduls gegen die lokal (in-memory,
// via denselben ingest+fts-Bausteinen wie datenhaltung:build) gebauten HOT-DBs.
// Kernbeweise: bm25-Treffer, diakritik-insensitiv, Pagination BY DESIGN, KEINE Volltext-
// Felder im Response, und der Payload-Grenz-Test (breite Query → Antwort << 4,5-MB-Wand).
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { oeffneDb, frischesSchema } from './schema';
import { ingestNormtext, ingestNormtextZiel, ingestRechtsprechung } from './ingest';
import { baueFtsArtikel, baueFtsEntscheideSchaufenster } from './fts';
import { sucheArtikel, sucheEntscheide, MAX_LIMIT } from './suche';

const PAYLOAD_WAND = 4.5 * 1024 * 1024; // 4,5-MB-Function-Payload-Wand (§4)

let dbN: DatabaseSync;
let dbR: DatabaseSync;

beforeAll(() => {
  dbN = oeffneDb();
  frischesSchema(dbN, 'normtext');
  ingestNormtext(dbN);
  ingestNormtextZiel(dbN);
  baueFtsArtikel(dbN);

  dbR = oeffneDb();
  frischesSchema(dbR, 'rechtsprechung');
  ingestRechtsprechung(dbR);
  baueFtsEntscheideSchaufenster(dbR);
}, 60000);

afterAll(() => {
  dbN?.close();
  dbR?.close();
});

const ARTIKEL_KEYS = ['id', 'titel', 'snippet', 'fundstelle'].sort();

describe('sucheArtikel', () => {
  it('findet Artikel diakritik-insensitiv (verjahrung → Verjährung)', () => {
    const a = sucheArtikel(dbN, 'verjahrung');
    expect(a.gesamt).toBeGreaterThan(0);
    expect(a.treffer.length).toBeGreaterThan(0);
    expect(a.treffer[0].id.startsWith('art:')).toBe(true);
    expect(a.treffer[0].titel.length).toBeGreaterThan(0);
    expect(a.treffer[0].fundstelle.quelleUrl.startsWith('http')).toBe(true);
  });

  it('gibt NUR id/titel/snippet/fundstelle zurück — kein Volltext-Feld', () => {
    const a = sucheArtikel(dbN, 'eigentum', { limit: 5 });
    expect(a.treffer.length).toBe(5); // Query trifft breit → Schleife prüft wirklich
    for (const t of a.treffer) {
      expect(Object.keys(t).sort()).toEqual(ARTIKEL_KEYS);
      // Volltext-Leck ausgeschlossen (bloecke/text/volltext/bloecke_json tauchen nie auf).
      const roh = JSON.stringify(t);
      expect(roh).not.toMatch(/"bloecke"|"bloecke_json"|"volltext"/);
    }
  });

  it('Pagination by design: Limit hart auf MAX_LIMIT geklemmt', () => {
    const a = sucheArtikel(dbN, 'recht', { limit: 1000 });
    expect(a.treffer.length).toBeLessThanOrEqual(MAX_LIMIT);
  });

  it('naechsteSeite folgt dem Fenster (offset+limit bzw. null am Ende)', () => {
    const seite1 = sucheArtikel(dbN, 'recht', { limit: 5, offset: 0 });
    if (seite1.gesamt > 5) {
      expect(seite1.naechsteSeite).toBe(5);
      const seite2 = sucheArtikel(dbN, 'recht', { limit: 5, offset: 5 });
      // disjunkte IDs zwischen Seite 1 und 2 (stabile Sortierung, kein Overlap).
      const ids1 = new Set(seite1.treffer.map((t) => t.id));
      expect(seite2.treffer.some((t) => ids1.has(t.id))).toBe(false);
    }
    // Offset jenseits des Endes → leere letzte Seite, kein naechsteSeite.
    const jenseits = sucheArtikel(dbN, 'verjahrung', { offset: 1_000_000 });
    expect(jenseits.treffer.length).toBe(0);
    expect(jenseits.naechsteSeite).toBeNull();
  });

  it('leere/symbolische Query → leere Antwort (keine FTS-Syntaxfehler)', () => {
    for (const q of ['', '   ', '***', '(']) {
      const a = sucheArtikel(dbN, q);
      expect(a).toEqual({ treffer: [], gesamt: 0, naechsteSeite: null });
    }
  });

  it('PAYLOAD-GRENZ-TEST: breite Query bei Max-Limit bleibt weit unter 4,5 MB', () => {
    const a = sucheArtikel(dbN, 'recht', { limit: MAX_LIMIT });
    expect(a.gesamt).toBeGreaterThan(MAX_LIMIT); // wirklich breit
    const bytes = Buffer.byteLength(JSON.stringify(a), 'utf8');
    expect(bytes).toBeLessThan(PAYLOAD_WAND);
    expect(bytes).toBeLessThan(200_000); // real: Grössenordnung Kilobytes, nicht Megabytes
  });
});

describe('sucheEntscheide', () => {
  it('findet Schaufenster-Entscheide diakritik-insensitiv (rechtsoffnung → Rechtsöffnung)', () => {
    const a = sucheEntscheide(dbR, 'rechtsoffnung');
    expect(a.gesamt).toBeGreaterThan(0);
    expect(a.treffer[0].id.startsWith('bund/')).toBe(true);
    expect(a.treffer[0].snippet).toContain('['); // native FTS-snippet markiert den Treffer
    expect(Object.keys(a.treffer[0]).sort()).toEqual(ARTIKEL_KEYS);
  });

  it('Pagination + Payload-Grenze auch für Entscheide', () => {
    const a = sucheEntscheide(dbR, 'recht', { limit: MAX_LIMIT });
    expect(a.treffer.length).toBeLessThanOrEqual(MAX_LIMIT);
    const bytes = Buffer.byteLength(JSON.stringify(a), 'utf8');
    expect(bytes).toBeLessThan(PAYLOAD_WAND);
  });
});
