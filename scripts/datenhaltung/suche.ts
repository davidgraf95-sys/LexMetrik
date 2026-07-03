// scripts/datenhaltung/suche.ts
// QS-DATA E2-Vorarbeiten (W2·6-DATA): das EINE Such-Query-Modul über die HOT-FTS
// (fts_artikel + fts_entscheide_schaufenster). Bewusst in scripts/ — der Laufzeit-Client
// (src/lib/suche, useUniversalSuche) bleibt UNBERÜHRT.
//
// AUFTEILUNG (Vercel-Fix 3.7.2026): die REINEN Bausteine (Match-Bau, Pagination,
// Zeilen-Formung, SQL, bloeckeText) leben import-frei in ./suche-kern.ts — NUR dieses
// Kern-Modul darf api/suche.ts importieren (Vercel kompiliert api/** mit eigener
// nodenext-tsconfig ohne Node-Typen; node:sqlite in der Import-Kette bricht den Build).
// HIER bleibt nur der node:sqlite-gebundene Build-Zeit-/Test-Läufer (§5: eine Query-
// Logik, zwei Ausführungswege). Alle Kern-Symbole werden re-exportiert (kompatibel).
//
// Pagination BY DESIGN (§4 4,5-MB-Payload-Wand): Standard-Limit 20, Max 50; die Antwort
// trägt NIE Volltext-Felder — nur id/titel/snippet/fundstelle (Grenz-Test in suche.test.ts).
import type { DatabaseSync } from 'node:sqlite';
import {
  klemmeFenster,
  baueFtsMatch,
  naechsterOffset,
  formeArtikelTreffer,
  formeEntscheidTreffer,
  SQL_ARTIKEL_COUNT,
  SQL_ARTIKEL_TREFFER,
  SQL_ENTSCHEIDE_COUNT,
  SQL_ENTSCHEIDE_TREFFER,
  type ArtikelRohzeile,
  type EntscheidRohzeile,
  type ArtikelTreffer,
  type EntscheidTreffer,
  type SucheAntwort,
  type SucheOptionen,
} from './suche-kern';

export * from './suche-kern';

/** Artikel-Volltextsuche über fts_artikel (bm25-Ranking, paginiert, Volltext-frei). */
export function sucheArtikel(db: DatabaseSync, query: string, opt?: SucheOptionen): SucheAntwort<ArtikelTreffer> {
  const { limit, offset } = klemmeFenster(opt);
  const match = baueFtsMatch(query);
  if (!match) return { treffer: [], gesamt: 0, naechsteSeite: null };
  const gesamt = (db.prepare(SQL_ARTIKEL_COUNT).get(match) as { n: number }).n;
  const rows = db.prepare(SQL_ARTIKEL_TREFFER).all(match, limit, offset) as unknown as ArtikelRohzeile[];
  return {
    treffer: rows.map((r) => formeArtikelTreffer(r, query)),
    gesamt,
    naechsteSeite: naechsterOffset(gesamt, offset, limit),
  };
}

/** Schaufenster-Entscheid-Suche über fts_entscheide_schaufenster (bm25, paginiert, Volltext-frei). */
export function sucheEntscheide(
  db: DatabaseSync,
  query: string,
  opt?: SucheOptionen,
): SucheAntwort<EntscheidTreffer> {
  const { limit, offset } = klemmeFenster(opt);
  const match = baueFtsMatch(query);
  if (!match) return { treffer: [], gesamt: 0, naechsteSeite: null };
  const gesamt = (db.prepare(SQL_ENTSCHEIDE_COUNT).get(match) as { n: number }).n;
  const rows = db.prepare(SQL_ENTSCHEIDE_TREFFER).all(match, limit, offset) as unknown as EntscheidRohzeile[];
  return {
    treffer: rows.map(formeEntscheidTreffer),
    gesamt,
    naechsteSeite: naechsterOffset(gesamt, offset, limit),
  };
}
