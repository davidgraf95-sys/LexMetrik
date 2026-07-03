// scripts/datenhaltung/baue-rangliste.test.ts
// QS-DATA E4 — Unit-Test der portierten norm-index-Semantik (topische In-degree je Artikel) an
// einem HANDGEBAUTEN Mini-Korpus (ohne die grosse masse.db). Beweist: (1) gewicht(d) = Anzahl
// ANDERER Mitglieder desselben Artikels, die d zitieren; (2) Kanon-Vereinigung (OR≡CO) legt DE/FR
// in EINEN Artikel zusammen; (3) Selbstzitat/Fremd-Artikel zählen nie; (4) Idempotenz (Weiche C).
import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { baueRangliste } from './baue-rangliste';

// Mini-Schema (nur die von baueRangliste konsumierten Spalten).
function baueMini(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE entscheide (id TEXT PRIMARY KEY);
    CREATE TABLE zitat_kanten (id INTEGER PRIMARY KEY AUTOINCREMENT, von_id TEXT NOT NULL, nach_id TEXT, ziel_key TEXT NOT NULL DEFAULT '');
    CREATE TABLE norm_referenzen (id INTEGER PRIMARY KEY AUTOINCREMENT, quelldok_typ TEXT NOT NULL, quelldok_id TEXT NOT NULL, erlass_key TEXT NOT NULL, artikel TEXT);
    CREATE INDEX ix_zitat_nach ON zitat_kanten(nach_id);
  `);
  const ent = db.prepare('INSERT INTO entscheide (id) VALUES (?)');
  for (const d of ['d1', 'd2', 'd3', 'd4']) ent.run(d);

  // Artikel-Zugehörigkeit: d1/d3 nennen «OR 41» (de), d2 nennt «CO 41» (fr → Kanon OR/41),
  // d4 nennt ZGB 8. So ist S(OR/41) = {d1,d2,d3}, S(ZGB/8) = {d4}.
  const nr = db.prepare("INSERT INTO norm_referenzen (quelldok_typ, quelldok_id, erlass_key, artikel) VALUES ('entscheid', ?, ?, ?)");
  nr.run('d1', 'OR', '41');
  nr.run('d2', 'CO', '41');   // französisch — muss in OR/41 fallen
  nr.run('d3', 'OR', '41');
  nr.run('d4', 'ZGB', '8');
  nr.run('d4', 'LPA', '5');   // kantonal (unmappbar) → fällt aus der Rangliste (unresolved)

  // Kanten (aufgelöst): d2→d1, d3→d1, d3→d2 (alle im OR/41-Topic); d1→d1 (Selbstzitat, zählt nie);
  // d4→d1 (d4 ist NICHT im OR/41-Topic → zählt für OR/41 nicht).
  const zk = db.prepare('INSERT INTO zitat_kanten (von_id, nach_id) VALUES (?, ?)');
  zk.run('d2', 'd1');
  zk.run('d3', 'd1');
  zk.run('d3', 'd2');
  zk.run('d1', 'd1');
  zk.run('d4', 'd1');
  return db;
}

function gewicht(db: DatabaseSync, ek: string, art: string, id: string): number | null {
  const r = db.prepare('SELECT gewicht FROM norm_rangliste WHERE erlass_key=? AND artikel=? AND entscheid_id=?').get(ek, art, id) as { gewicht: number } | undefined;
  return r ? r.gewicht : null;
}

describe('baue-rangliste — topische In-degree (Port von baueArtikelIndex)', () => {
  it('gewicht = Anzahl anderer Artikel-Mitglieder, die den Entscheid zitieren', () => {
    const db = baueMini();
    const rep = baueRangliste(db);
    // OR/41: d1 wird von d2 und d3 zitiert = 2; d2 von d3 = 1; d3 von niemandem = 0.
    expect(gewicht(db, 'OR', '41', 'd1')).toBe(2);
    expect(gewicht(db, 'OR', '41', 'd2')).toBe(1);
    expect(gewicht(db, 'OR', '41', 'd3')).toBe(0);
    // ZGB/8: d4 allein, gewicht 0.
    expect(gewicht(db, 'ZGB', '8', 'd4')).toBe(0);
    expect(rep.artikelBuckets).toBe(2);       // OR/41 + ZGB/8 (LPA/5 unresolved)
    expect(rep.ranglisteZeilen).toBe(4);      // d1,d2,d3 (OR/41) + d4 (ZGB/8)
    db.close();
  });

  it('Kanon-Vereinigung: CO 41 (fr) fällt in OR/41, kein separater CO-Bucket', () => {
    const db = baueMini();
    baueRangliste(db);
    expect(gewicht(db, 'CO', '41', 'd2')).toBeNull();   // kein CO-Bucket
    expect(gewicht(db, 'OR', '41', 'd2')).toBe(1);      // d2 ist OR/41-Mitglied
    db.close();
  });

  it('Selbstzitat und Fremd-Artikel-Kante zählen nie', () => {
    const db = baueMini();
    baueRangliste(db);
    // d1→d1 (self) und d4→d1 (d4 fremd) dürfen d1 nicht über 2 heben.
    expect(gewicht(db, 'OR', '41', 'd1')).toBe(2);
    db.close();
  });

  it('unmappbarer (kantonaler) law_code fällt aus der Rangliste', () => {
    const db = baueMini();
    baueRangliste(db);
    expect(gewicht(db, 'LPA', '5', 'd4')).toBeNull();
    db.close();
  });

  it('idempotent: zweiter Rebuild → identische Tabelle (Weiche C)', () => {
    const db = baueMini();
    baueRangliste(db);
    const dump = () => db.prepare('SELECT erlass_key,artikel,entscheid_id,gewicht FROM norm_rangliste ORDER BY erlass_key,artikel,entscheid_id').all();
    const a = JSON.stringify(dump());
    baueRangliste(db);
    const b = JSON.stringify(dump());
    expect(b).toBe(a);
    db.close();
  });
});
