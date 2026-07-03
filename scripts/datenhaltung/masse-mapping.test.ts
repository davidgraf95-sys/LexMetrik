// scripts/datenhaltung/masse-mapping.test.ts
// QS-DATA E3 — Unit-Tests des Massen-Import-Mappings + Mini-Pipeline (Schema→Dedup→Resolve→
// Manifest) mit HANDGEBAUTEN Mini-Fixtures, OHNE die grossen Parquete. Beweist: Dedup,
// quelle_url-Ableitung (§7), Kanten-Orientierung von/nach, konfidenz, Manifest-Determinismus.
import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import {
  entscheidRow,
  zitatRow,
  normRefRow,
  kanteKonfidenz,
  docketKey,
  zielKey,
  manifestMasse,
  serialisiereMasseManifest,
  type EntscheidParquet,
} from './masse-mapping';
import { SCHEMA_MASSE, SCHEMA_ROH, DEDUP_MASSE, INDIZES_MASSE } from './masse-schema';
import { resolveZitate } from './resolve-zitate';

const BGER: EntscheidParquet = {
  decision_id: 'bger_4A_1_2020',
  court: 'bger',
  canton: 'CH',
  docket_number: '4A_1/2020',
  bge_reference: null,
  decision_date: '2020-05-04',
  publication_date: null,
  language: 'de',
  legal_area: 'Vertragsrecht',
  regeste: null,
  full_text: 'Urteil des Bundesgerichts 4A_1/2020 …',
  source_url: 'http://relevancy.bger.ch/cgi-bin/JumpCGI?id=04.05.2020_4A_1/2020',
  scraped_at: '2026-02-10T16:31:01.0',
};
const BGE: EntscheidParquet = {
  decision_id: 'bge_150 III 1',
  court: 'bge',
  canton: 'CH',
  docket_number: '150 III 1',
  bge_reference: null, // 100 % NULL im Bundes-Zuschnitt
  decision_date: '2024-01-15',
  publication_date: '2024-01-01', // voilaj-Bandjahr-Platzhalter
  language: 'de',
  legal_area: null,
  regeste: 'Regeste\n Art. 41 OR; …',
  full_text: 'Urteilskopf 150 III 1 …',
  source_url: 'https://search.bger.ch/ext/eurospider/live/de/php/clir/http/index.php?highlight_docid=atf%3A%2F%2F150-III-1',
  scraped_at: '2026-02-10T12:55:44.8',
};

describe('entscheidRow — §7-Ableitung + Match-Keys', () => {
  it('bger: docket_key gesetzt, bge_key null, quelle_url = source_url verbatim, maschinell', () => {
    const r = entscheidRow(BGER);
    expect(r.quelle_url).toBe(BGER.source_url); // §7: verbatim, keine Rekonstruktion
    expect(r.quelle).toBe('voilaj-parquet');
    expect(r.kuratierung).toBe('maschinell');
    expect(r.gericht).toBe('bger');
    expect(r.nummer).toBe('4A_1/2020');
    expect(r.docket_key).toBe('4a_1_2020');
    expect(r.bge_key).toBeNull();
    expect(r.bge_referenz).toBeNull();
    expect(r.leitcharakter).toBe(0);
    expect(r.datum).toBe('2020-05-04');
    expect(r.abgerufen).toBe(BGER.scraped_at);
    expect(r.sha).toMatch(/^[0-9a-f]{64}$/); // sha256(full_text)
  });

  it('bge: bge_key/bge_referenz aus docket_number, docket_key null, leitcharakter 1', () => {
    const r = entscheidRow(BGE);
    expect(r.bge_key).toBe('150-III-1');
    expect(r.bge_referenz).toBe('BGE 150 III 1');
    expect(r.docket_key).toBeNull();
    expect(r.leitcharakter).toBe(1);
    expect(r.regeste_json).toBe(JSON.stringify(BGE.regeste));
    expect(r.publikation).toBe('2024-01-01');
    expect(r.quelle_url).toBe(BGE.source_url);
  });

  it('bge mit bereits vorhandenem BGE-Präfix in docket_number → kein doppeltes "BGE BGE"', () => {
    // Das bge-Parquet mischt die Form: die meisten docket_number tragen schon 'BGE ' (Stichprobe 3.7.2026).
    const r = entscheidRow({ ...BGE, docket_number: 'BGE 87 III 100' });
    expect(r.bge_referenz).toBe('BGE 87 III 100'); // NICHT 'BGE BGE 87 III 100'
    expect(r.bge_key).toBe('87-III-100');
    // ATF/DTF-Präfix (fr/it) ebenso auf die kanonische BGE-Anzeige normalisiert.
    expect(entscheidRow({ ...BGE, docket_number: 'ATF 130 III 1' }).bge_referenz).toBe('BGE 130 III 1');
    expect(entscheidRow({ ...BGE, docket_number: '151 III 481' }).bge_referenz).toBe('BGE 151 III 481');
  });

  it('bge mit Docket-Müll (keine BGE-Form) → KEINE fabrizierte Zitierform (§8, Befund Q2)', () => {
    const r = entscheidRow({ ...BGE, docket_number: '19791204_7710_76' });
    expect(r.bge_referenz).toBeNull(); // nie 'BGE 19791204_7710_76'
    expect(r.bge_key).toBeNull();
    expect(r.docket_key).toBe('19791204_7710_76'); // Auflösung läuft über docket_key
    expect(r.nummer).toBe('19791204_7710_76'); // Rohwert bleibt sichtbar (§7)
  });

  it('§7-Ehrlichkeit: fehlendes source_url → quelle_url null (nie fabriziert); fehlendes datum bleibt null', () => {
    const r = entscheidRow({ ...BGE, source_url: null, decision_date: null });
    expect(r.quelle_url).toBeNull();
    expect(r.datum).toBeNull();
    expect(r.sha).toMatch(/^[0-9a-f]{64}$/); // sha bleibt (aus full_text)
  });

  it('gleiche Eingabe → gleiche Ausgabe (Determinismus §2)', () => {
    expect(entscheidRow(BGER)).toEqual(entscheidRow(BGER));
  });
});

describe('zitatRow / normRefRow / Key-Ableitungen', () => {
  it('zielKey: BGE-Form vor Docket-Form', () => {
    expect(zielKey('BGE 150 III 1')).toBe('150-III-1');
    expect(zielKey('4A_1/2020')).toBe('4a_1_2020');
    expect(zielKey(null)).toBe('');
  });
  it('docketKey robust gegen Trenner-Varianz', () => {
    expect(docketKey('4A_1/2020')).toBe('4a_1_2020');
    expect(docketKey('4A.1/2020')).toBe('4a_1_2020'); // Punkt/Slash beide → '_'
    expect(docketKey(null)).toBeNull();
  });
  it('zitatRow: von = Quelle, nach_zitierung = Rohstring, ziel_key kanonisiert', () => {
    const z = zitatRow({ source_decision_id: 'bger_x', target_ref: 'BGE 150 III 1', match_type: 'bge_bare', confidence_score: 1 });
    expect(z.von_id).toBe('bger_x');
    expect(z.ziel_key).toBe('150-III-1');
    expect(z.nach_zitierung).toBe('BGE 150 III 1');
    expect(z.match_type).toBe('bge_bare');
  });
  it('normRefRow: erlass_key = law_code, zitat_key kanonisiert, roh_zitat erhalten', () => {
    const n = normRefRow({ decision_id: 'bger_x', law_code: 'OR', article: '41' });
    expect(n.erlass_key).toBe('OR');
    expect(n.artikel).toBe('41');
    expect(n.zitat_key).toBe('or 41');
    expect(n.roh_zitat).toBe('OR 41');
  });
  it('kanteKonfidenz: unresolved / regex-niedrig (pincite) / regex-hoch', () => {
    expect(kanteKonfidenz(false, 'bge_bare')).toBe('unresolved');
    expect(kanteKonfidenz(true, 'bge_pincite')).toBe('regex-niedrig');
    expect(kanteKonfidenz(true, 'docket_norm')).toBe('regex-hoch');
  });
});

// ── Mini-Pipeline: baut eine kleine masse.db in-memory und prüft Dedup/Resolve/Manifest ──────
function baueMiniDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(SCHEMA_MASSE);
  db.exec(SCHEMA_ROH);
  const insEnt = db.prepare(
    `INSERT OR IGNORE INTO entscheide
      (id,ecli,ecli_key,gericht,kanton,nummer,bge_referenz,bge_key,docket_key,datum,publikation,
       sprache,rechtsgebiet,leitcharakter,kuratierung,regeste_json,full_text,quelle,quelle_url,abgerufen,sha)
     VALUES (@id,@ecli,@ecli_key,@gericht,@kanton,@nummer,@bge_referenz,@bge_key,@docket_key,@datum,@publikation,
       @sprache,@rechtsgebiet,@leitcharakter,@kuratierung,@regeste_json,@full_text,@quelle,@quelle_url,@abgerufen,@sha)`,
  );
  for (const p of [BGER, BGE]) insEnt.run(entscheidRow(p) as unknown as Record<string, unknown>);
  // Duplikat-Entscheid (gleiche id) → INSERT OR IGNORE muss dedupen.
  insEnt.run(entscheidRow(BGER) as unknown as Record<string, unknown>);

  const insZit = db.prepare('INSERT INTO zitat_roh (von_id,ziel_key,nach_zitierung,match_type) VALUES (@von_id,@ziel_key,@nach_zitierung,@match_type)');
  const kanten: Array<[string, string, string]> = [
    ['bge_150 III 1', '4A_1/2020', 'docket_norm'], // BGE zitiert bger → nach = A
    ['bger_4A_1_2020', 'BGE 150 III 1', 'bge_bare'], // bger zitiert BGE → nach = B
    ['bger_4A_1_2020', 'BGE 150 III 1', 'bge_bare'], // exaktes Duplikat (von,ziel) → Dedup
    ['bger_4A_1_2020', 'BGE 99 IX 9', 'bge_bare'], // Ziel nicht im Korpus → unresolved
  ];
  for (const [von, ref, mt] of kanten) insZit.run(zitatRow({ source_decision_id: von, target_ref: ref, match_type: mt, confidence_score: 1 }) as unknown as Record<string, unknown>);

  const insRef = db.prepare('INSERT INTO normref_roh (quelldok_id,erlass_key,artikel,zitat_key,roh_zitat) VALUES (@quelldok_id,@erlass_key,@artikel,@zitat_key,@roh_zitat)');
  // Zwei Paragraph-Varianten desselben Artikels → auf Artikel-Ebene EIN Eintrag (UNIQUE ohne paragraph).
  for (const art of ['41', '41']) insRef.run(normRefRow({ decision_id: 'bger_4A_1_2020', law_code: 'OR', article: art }) as unknown as Record<string, unknown>);
  insRef.run(normRefRow({ decision_id: 'bge_150 III 1', law_code: 'ZGB', article: '8' }) as unknown as Record<string, unknown>);

  db.exec(DEDUP_MASSE);
  db.exec(INDIZES_MASSE);
  return db;
}

describe('Mini-Pipeline: Dedup + Resolve + Manifest', () => {
  it('Entscheid-Dedup (INSERT OR IGNORE): 2 distinct trotz 3 Inserts', () => {
    const db = baueMiniDb();
    expect((db.prepare('SELECT COUNT(*) AS n FROM entscheide').get() as { n: number }).n).toBe(2);
    db.close();
  });

  it('Kanten-Dedup UNIQUE(von_id,ziel_key): 4 roh → 3', () => {
    const db = baueMiniDb();
    expect((db.prepare('SELECT COUNT(*) AS n FROM zitat_kanten').get() as { n: number }).n).toBe(3);
    db.close();
  });

  it('norm_referenzen-Dedup auf Artikel-Ebene: 3 roh (2× OR 41) → 2', () => {
    const db = baueMiniDb();
    expect((db.prepare('SELECT COUNT(*) AS n FROM norm_referenzen').get() as { n: number }).n).toBe(2);
    db.close();
  });

  it('Resolve: korrekte von/nach-Orientierung + Quote 2/3 + unresolved bleibt', () => {
    const db = baueMiniDb();
    const r = resolveZitate(db);
    expect(r.gesamt).toBe(3);
    expect(r.aufgeloest).toBe(2);
    expect(r.quote).toBeCloseTo(2 / 3, 5);
    // A zitiert B: von bger → nach bge
    const ab = db.prepare("SELECT nach_id, konfidenz FROM zitat_kanten WHERE von_id='bger_4A_1_2020' AND ziel_key='150-III-1'").get() as { nach_id: string; konfidenz: string };
    expect(ab.nach_id).toBe('bge_150 III 1');
    expect(ab.konfidenz).toBe('regex-hoch');
    // B zitiert A: von bge → nach bger
    const ba = db.prepare("SELECT nach_id FROM zitat_kanten WHERE von_id='bge_150 III 1' AND ziel_key='4a_1_2020'").get() as { nach_id: string };
    expect(ba.nach_id).toBe('bger_4A_1_2020');
    // unresolved bleibt NULL/unresolved
    const un = db.prepare("SELECT nach_id, konfidenz FROM zitat_kanten WHERE ziel_key='99-IX-9'").get() as { nach_id: string | null; konfidenz: string };
    expect(un.nach_id).toBeNull();
    expect(un.konfidenz).toBe('unresolved');
    expect(r.nachOrphan).toBe(0);
    db.close();
  });

  it('Resolve ist idempotent: zweiter Lauf ändert das Manifest nicht', () => {
    const db = baueMiniDb();
    resolveZitate(db);
    const m1 = serialisiereMasseManifest(manifestMasse(db as never));
    resolveZitate(db); // erneut
    const m2 = serialisiereMasseManifest(manifestMasse(db as never));
    expect(m2).toBe(m1);
    db.close();
  });

  it('Voll-Rebuild-Determinismus: zwei frische Builds → identisches Manifest (Weiche C)', () => {
    const dbA = baueMiniDb();
    resolveZitate(dbA);
    const mA = serialisiereMasseManifest(manifestMasse(dbA as never));
    dbA.close();
    const dbB = baueMiniDb();
    resolveZitate(dbB);
    const mB = serialisiereMasseManifest(manifestMasse(dbB as never));
    dbB.close();
    expect(mB).toBe(mA);
    // Manifest schliesst die Surrogat-id aus → stabil trotz AUTOINCREMENT.
    expect(mA).toContain('zitat_kanten');
    expect(mA).toContain('entscheide');
  });
});
