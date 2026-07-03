// scripts/datenhaltung/suche-kern.ts
// QS-DATA E2: die REINEN Bausteine der Such-Query-Logik (§5: EINE Query-Logik, zwei
// Ausführungswege — Build-Zeit/node:sqlite in suche.ts, Edge/Turso-HTTP in api/suche.ts).
//
// HARTE REGEL dieser Datei: NULL Imports (kein node:*, kein Drittmodul, auch kein
// import type). Grund (Vercel-Fix 3.7.2026): Vercel kompiliert api/** mit EIGENER
// tsconfig (nodenext, ohne Node-Typen) — jeder Import-Pfad aus api/ hinein muss frei
// von Node-Bezügen sein, sonst bricht der Function-Build (real passiert: node:sqlite/
// process-Typfehler über die Import-Kette api/suche.ts → suche.ts → fts.ts).

export const STANDARD_LIMIT = 20;
export const MAX_LIMIT = 50;

export interface SucheOptionen {
  limit?: number;
  offset?: number;
}
export interface Seitenfenster {
  limit: number;
  offset: number;
}
/** Herkunft eines Treffers (amtlicher Live-Link §7 c) — NIE der Volltext selbst. */
export interface Fundstelle {
  erlass?: string;
  artikel?: string;
  quelleUrl: string;
}
export interface ArtikelTreffer {
  id: string;
  titel: string;
  snippet: string;
  fundstelle: Fundstelle;
}
export interface EntscheidTreffer {
  id: string;
  titel: string;
  snippet: string;
  fundstelle: Fundstelle;
}
export interface SucheAntwort<T> {
  treffer: T[];
  /** Gesamtzahl der MATCH-Treffer (für Pagination-Anzeige). */
  gesamt: number;
  /** Offset der nächsten Seite oder null, wenn die letzte Seite erreicht ist. */
  naechsteSeite: number | null;
}

/**
 * Durchsuchbarer Plaintext EINES Artikels aus `bloecke_json`: alle `text`-Felder
 * konkateniert (Absatz-Einleitung + lit./Ziff.-Aufzählungspunkte), Whitespace normalisiert.
 * Bewusst dieselbe Extraktion wie der bestehende Client-Suchindex
 * (`scripts/such-index-generieren.ts` → artikelText), damit hot-FTS und statischer
 * Fallback-Index denselben durchsuchbaren Text tragen (§5). NICHT indexiert (kein
 * `text`-Feld, client-index-konform; Gegenprüfungs-Notiz 3.7.2026): Tarif-/Tabellen-
 * Zellen (`tabelle` beschreibung/betrag sowie `mehrspaltig` spalten[].titel + zeilen)
 * und Bild-Metadaten — der Volltext bleibt im prerenderten DOM durchsuchbar (§15);
 * eine Recall-Erweiterung wäre ein bewusster Folge-Schritt für BEIDE Indizes gemeinsam.
 */
interface Block {
  text?: string;
  items?: Array<{ text?: string }>;
}
export function bloeckeText(bloeckeJson: string): string {
  const bloecke = JSON.parse(bloeckeJson) as Block[];
  const teile: string[] = [];
  for (const b of bloecke) {
    if (b.text) teile.push(b.text);
    for (const it of b.items ?? []) if (it.text) teile.push(it.text);
  }
  return teile.join(' ').replace(/\s+/g, ' ').trim();
}

// ── Reine Bausteine ──────────────────────────────────────────────────────────────

/** Klemmt limit (1..MAX_LIMIT, Default 20) + offset (>= 0). Pagination by design. */
export function klemmeFenster(opt?: SucheOptionen): Seitenfenster {
  const roh = opt?.limit ?? STANDARD_LIMIT;
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(Number.isFinite(roh) ? roh : STANDARD_LIMIT)));
  const rohOff = opt?.offset ?? 0;
  const offset = Math.max(0, Math.floor(Number.isFinite(rohOff) ? rohOff : 0));
  return { limit, offset };
}

/**
 * Baut den FTS5-MATCH-Ausdruck: jeder Term (Unicode-Buchstaben/Ziffern) in Anführungs-
 * zeichen → neutralisiert FTS5-Syntax UND -Injection (implizites AND zwischen Termen).
 * Leere/rein-symbolische Query → null (Aufrufer liefert leere Antwort).
 */
export function baueFtsMatch(query: string): string | null {
  const terme = query.match(/[\p{L}\p{N}]+/gu) ?? [];
  if (terme.length === 0) return null;
  return terme.map((t) => '"' + t + '"').join(' ');
}

/** Nächster Seiten-Offset oder null. */
export function naechsterOffset(gesamt: number, offset: number, limit: number): number | null {
  return offset + limit < gesamt ? offset + limit : null;
}

/** Diakritik-faltend + kleinschreibend, LÄNGEN-erhaltend (BMP-Text): je Codepoint der
 *  NFD-Basisbuchstabe. So findet das Snippet den Treffer diakritik-insensitiv wie die FTS,
 *  ohne die Index-Zuordnung zum Originaltext zu verschieben. */
function falte(s: string): string {
  let out = '';
  for (const c of s) out += (c.normalize('NFD')[0] ?? c).toLowerCase();
  return out;
}

/**
 * Deterministisches Listen-Snippet (~130 Zeichen um den ersten Treffer-Term). Für Artikel
 * (external-content-FTS ohne native snippet()) aus dem extrahierten Plaintext gebaut;
 * diakritik-insensitive Term-Suche konsistent mit dem FTS-Tokenizer.
 */
export function baueSnippet(text: string, query: string): string {
  const gefaltet = falte(text);
  const term = (query.match(/[\p{L}\p{N}]+/gu) ?? [])
    .map((w) => falte(w))
    .find((w) => w.length > 2 && gefaltet.includes(w));
  if (!term) return text.length > 120 ? text.slice(0, 120).trimEnd() + ' …' : text;
  const i = gefaltet.indexOf(term);
  const start = Math.max(0, i - 45);
  const ende = Math.min(text.length, start + 130);
  return (start > 0 ? '… ' : '') + text.slice(start, ende).trim() + (ende < text.length ? ' …' : '');
}

// ── SQL-Konstanten (geteilt — §5, EINE Query-Logik) ──────────────────────────────
export const SQL_ARTIKEL_COUNT = 'SELECT count(*) AS n FROM fts_artikel WHERE fts_artikel MATCH ?';
export const SQL_ARTIKEL_TREFFER = `SELECT a.erlass_key AS erlass_key, a.art_id AS art_id, a.artikel AS artikel,
       a.artikel_label AS artikel_label, a.quelle_url AS quelle_url, a.bloecke_json AS bloecke_json,
       e.abkuerzung AS abkuerzung
FROM fts_artikel
JOIN artikel a ON a.rowid = fts_artikel.rowid
JOIN erlasse e ON e.key = a.erlass_key
WHERE fts_artikel MATCH ?
ORDER BY bm25(fts_artikel), a.rowid
LIMIT ? OFFSET ?`;

export const SQL_ENTSCHEIDE_COUNT =
  'SELECT count(*) AS n FROM fts_entscheide_schaufenster WHERE fts_entscheide_schaufenster MATCH ?';
export const SQL_ENTSCHEIDE_TREFFER = `SELECT id AS id, titel AS titel, quelle_url AS quelle_url,
       snippet(fts_entscheide_schaufenster, -1, '[', ']', '…', 8) AS snip
FROM fts_entscheide_schaufenster
WHERE fts_entscheide_schaufenster MATCH ?
ORDER BY bm25(fts_entscheide_schaufenster), rowid
LIMIT ? OFFSET ?`;

/** Roh-Zeile aus SQL_ARTIKEL_TREFFER (bloecke_json wird NUR intern fürs Snippet gelesen, NIE zurückgegeben). */
export interface ArtikelRohzeile {
  erlass_key: string;
  art_id: string;
  artikel: string;
  artikel_label: string;
  quelle_url: string;
  bloecke_json: string;
  abkuerzung: string;
}
export function formeArtikelTreffer(r: ArtikelRohzeile, query: string): ArtikelTreffer {
  return {
    id: `art:${r.erlass_key}:${r.art_id}`,
    titel: `${r.artikel_label} ${r.abkuerzung}`.trim(),
    snippet: baueSnippet(bloeckeText(r.bloecke_json), query),
    fundstelle: { erlass: r.erlass_key, artikel: r.artikel, quelleUrl: r.quelle_url },
  };
}

/** Roh-Zeile aus SQL_ENTSCHEIDE_TREFFER (native FTS-Snippet). */
export interface EntscheidRohzeile {
  id: string;
  titel: string;
  quelle_url: string;
  snip: string;
}
export function formeEntscheidTreffer(r: EntscheidRohzeile): EntscheidTreffer {
  return { id: r.id, titel: r.titel, snippet: r.snip, fundstelle: { quelleUrl: r.quelle_url } };
}
