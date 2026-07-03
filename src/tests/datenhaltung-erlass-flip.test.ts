/**
 * QS-DATA E1 — Byte-Beweis des Generator-Flips (Spalten-Weg).
 *
 * Deckt den Codepfad ab, den der Generator (normtext-snapshot.ts) im echten Lauf über
 * generator-flip.ts nutzt: NormSnapshot[] → schreibeErlass() (Zeilen) → projiziereErlass()
 * (Projektion) MUSS byte-gleich zur committeten public/*.json-Form sein. Ohne Netz, ohne
 * public/**-Änderung — der Generator selbst ruft dieselben Funktionen.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { frischesSchema } from '../../scripts/datenhaltung/schema.ts';
import { schreibeErlass, projiziereErlass } from '../../scripts/datenhaltung/erlass-rows.ts';
import type { NormSnapshot } from '../lib/normtext/typen.ts';

function frischeDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  frischesSchema(db, 'normtext');
  return db;
}

function ladeBund(key: string): { snapshots: NormSnapshot[]; committet: string } {
  const committet = readFileSync(`public/normtext/bund/${key}.json`, 'utf8');
  const snapshots = (JSON.parse(committet) as { eintraege: NormSnapshot[] }).eintraege;
  return { snapshots, committet };
}

function ladeKanton(key: string): { snapshots: NormSnapshot[]; committet: string } {
  const committet = readFileSync(`public/normtext/kanton/${key}.json`, 'utf8');
  const snapshots = (JSON.parse(committet) as { eintraege: NormSnapshot[] }).eintraege;
  return { snapshots, committet };
}

// OR = grosser Erlass (Tabellen/Schlussteil/Annex), ZGB = zweiter grosser,
// ARGV1 = trägt das optionale `grundlage`-Feld (Feldreihenfolge-Falle).
describe('E1 Erlass-Flip: Zeilen → Projektion byte-gleich', () => {
  for (const key of ['OR', 'ZGB', 'ARGV1', 'SCHKG']) {
    it(`${key}: projiziereErlass == committete Bytes`, () => {
      const db = frischeDb();
      const { snapshots, committet } = ladeBund(key);
      const meta = {
        key,
        ebene: 'bund' as const,
        kanton: null,
        sr: null,
        abkuerzung: snapshots[0].erlass,
        titel: snapshots[0].erlass,
        rechtsgebiet: '',
        status: 'snapshot',
      };
      schreibeErlass(db, meta, snapshots);
      const proj = projiziereErlass(db, key, snapshots[0].fassungsToken);
      // alter Direktpfad = Re-Serialisierung der committeten Datei.
      const direkt = JSON.stringify(JSON.parse(committet), null, 2);
      expect(proj).toBe(direkt);
      expect(proj).toBe(committet);
      db.close();
    });
  }

  it('grundlage-Feld erscheint nur wo gesetzt (Feldreihenfolge)', () => {
    const db = frischeDb();
    const { snapshots } = ladeBund('ARGV1');
    schreibeErlass(db, { key: 'ARGV1', ebene: 'bund', kanton: null, sr: null, abkuerzung: snapshots[0].erlass, titel: snapshots[0].erlass, rechtsgebiet: '', status: 'snapshot' }, snapshots);
    const proj = JSON.parse(projiziereErlass(db, 'ARGV1', snapshots[0].fassungsToken)) as {
      eintraege: Array<Record<string, unknown>>;
    };
    const mitGrundlage = proj.eintraege.filter((e) => 'grundlage' in e);
    const originalMit = snapshots.filter((s) => s.grundlage !== undefined);
    expect(mitGrundlage.length).toBe(originalMit.length);
    expect(mitGrundlage.length).toBeGreaterThan(0);
    // Reihenfolge: grundlage steht zwischen artikelLabel und bloecke.
    const keys = Object.keys(mitGrundlage[0]);
    expect(keys.indexOf('grundlage')).toBe(keys.indexOf('artikelLabel') + 1);
    expect(keys.indexOf('bloecke')).toBe(keys.indexOf('grundlage') + 1);
    db.close();
  });

  it('wirft bei uneinheitlichem erlass-Label (eine Datei = eine Fassung)', () => {
    const db = frischeDb();
    const { snapshots } = ladeBund('OR');
    expect(() =>
      schreibeErlass(
        db,
        { key: 'OR', ebene: 'bund', kanton: null, sr: null, abkuerzung: 'FALSCH', titel: 'x', rechtsgebiet: '', status: 'snapshot' },
        snapshots,
      ),
    ).toThrow(/erlass-Label uneinheitlich/);
    db.close();
  });
});

// E1-Rest B (3.7.2026): Kanton-Flip. Schlüssel (Dateiname-Stamm 'AG-291.150') ≠
// byte-tragende quelle ('AG'); id 4-segmentig ('kanton/AG/291.150/art_4'); Randtitel
// `titel` → Spalte marg → Projektion vor bloecke. Deckt Dash-im-Schlüssel (bilingual
// '-de', TI 'ti-…') und die titel-Feldreihenfolge ab.
describe('E1-Rest B Kanton-Flip: Zeilen → Projektion byte-gleich', () => {
  // BS = Randtitel (titel/marg); FR-…-de = bilingual (Dash im Schlüssel);
  // TI-ti-… = PDF (Dash im Schlüssel); GE-… = HTM.
  for (const key of ['BS-111.100', 'FR-130.11-de', 'TI-ti-125101', 'GE-rsg_d3_30']) {
    it(`${key}: projiziereErlass == committete Bytes`, () => {
      const db = frischeDb();
      const { snapshots, committet } = ladeKanton(key);
      const kanton = snapshots[0].quelle; // 'AG'/'FR'/… == 2. id-Segment
      schreibeErlass(
        db,
        { key, ebene: 'kanton', kanton, sr: null, abkuerzung: snapshots[0].erlass, titel: snapshots[0].erlass, rechtsgebiet: '', status: 'snapshot' },
        snapshots,
      );
      const proj = projiziereErlass(db, key, snapshots[0].fassungsToken);
      expect(proj).toBe(committet);
      db.close();
    });
  }

  it('titel(Randtitel)-Feld erscheint nur wo gesetzt, zwischen artikelLabel und bloecke', () => {
    const db = frischeDb();
    const { snapshots } = ladeKanton('BS-111.100');
    schreibeErlass(
      db,
      { key: 'BS-111.100', ebene: 'kanton', kanton: 'BS', sr: null, abkuerzung: snapshots[0].erlass, titel: snapshots[0].erlass, rechtsgebiet: '', status: 'snapshot' },
      snapshots,
    );
    const proj = JSON.parse(projiziereErlass(db, 'BS-111.100', snapshots[0].fassungsToken)) as {
      eintraege: Array<Record<string, unknown>>;
    };
    const mitTitel = proj.eintraege.filter((e) => 'titel' in e);
    const originalMit = snapshots.filter((s) => s.titel !== undefined);
    expect(mitTitel.length).toBe(originalMit.length);
    expect(mitTitel.length).toBeGreaterThan(0);
    const keys = Object.keys(mitTitel[0]);
    expect(keys.indexOf('titel')).toBe(keys.indexOf('artikelLabel') + 1);
    expect(keys.indexOf('bloecke')).toBe(keys.indexOf('titel') + 1);
    // Kanton trägt nie grundlage (schliesst sich mit titel aus).
    expect(proj.eintraege.some((e) => 'grundlage' in e)).toBe(false);
    db.close();
  });

  it('wirft bei quelle≠kanton (id-2.-Segment-Bruch)', () => {
    const db = frischeDb();
    const { snapshots } = ladeKanton('BS-111.100'); // quelle == 'BS'
    expect(() =>
      schreibeErlass(
        db,
        { key: 'BS-111.100', ebene: 'kanton', kanton: 'ZH', sr: null, abkuerzung: snapshots[0].erlass, titel: 'x', rechtsgebiet: '', status: 'snapshot' },
        snapshots,
      ),
    ).toThrow(/ebene\/quelle-Bruch/);
    db.close();
  });
});
