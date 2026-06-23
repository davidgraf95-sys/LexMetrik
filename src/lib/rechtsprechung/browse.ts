// ─── Client-Schicht der Rubrik «Rechtsprechung» ─────────────────────────────
//
// Lädt das Entscheid-Manifest (public/rechtsprechung/register.json) und die
// einzelnen Entscheid-Dateien lazy, plus reine Gruppier-/Filter-Helfer.
// Reine Ladeschicht (§3) — kein Inhalt erzeugt.

import type { EntscheidManifest, BrowseEntscheid } from './register';
import type { EntscheidSnapshot, EntscheidSnapshotDatei } from './typen';
import { GEBIETE, GEBIET_LABEL, type Rechtsgebiet } from '../normtext/register';

// ── Manifest (einmal, gecacht als laufende Promise) ──────────────────────────
let manifestPromise: Promise<EntscheidManifest | null> | null = null;

export async function ladeEntscheidManifest(): Promise<EntscheidManifest | null> {
  if (!manifestPromise) {
    manifestPromise = (async () => {
      try {
        const res = await fetch('/rechtsprechung/register.json');
        if (!res.ok) return null;
        return (await res.json()) as EntscheidManifest;
      } catch {
        return null;
      }
    })();
  }
  return manifestPromise;
}

/** Manifest-Eintrag eines Schlüssels. */
export async function ladeEntscheidEintrag(key: string): Promise<BrowseEntscheid | null> {
  const m = await ladeEntscheidManifest();
  return m?.entscheide.find((e) => e.key === key) ?? null;
}

// ── Volltext-Datei eines Entscheids (lazy, gecacht) ──────────────────────────
const dateiCache = new Map<string, Promise<EntscheidSnapshot | null>>();

/** Lädt den Snapshot eines Entscheids (BrowseEntscheid.datei). */
export function ladeEntscheid(datei: string): Promise<EntscheidSnapshot | null> {
  let p = dateiCache.get(datei);
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(`/rechtsprechung/${datei}`);
        if (!res.ok) return null;
        const d = (await res.json()) as EntscheidSnapshotDatei;
        return Array.isArray(d.eintraege) && d.eintraege[0] ? d.eintraege[0] : null;
      } catch {
        return null;
      }
    })();
    dateiCache.set(datei, p);
  }
  return p;
}

// ── Gruppieren / Filtern (rein, testbar) ─────────────────────────────────────

export interface EntscheidFilterWerte {
  q?: string;
  sachgebiet?: Rechtsgebiet | null;
  gericht?: string | null;
  kanton?: string | null;
  sprache?: string | null;
  nurLeitentscheide?: boolean;
  /** Nur amtlich in der BGE-Sammlung publizierte Entscheide (höchste Autorität). */
  nurBge?: boolean;
  datumVon?: string | null;
  datumBis?: string | null;
  /** Angewandter Erlass (normKeys-Eintrag, z.B. 'OR'); zweite Navigationsachse (?norm=). */
  norm?: string | null;
  /** Ebene Bund (kanton 'CH') vs. Kantone — klare Trennung (Auftrag David). */
  ebene?: 'bund' | 'kanton' | null;
}

// ── Thema-Scent (Leitelement statt wertlosem Aktenzeichen, 0/75 BGE-Ref) ─────
//
// Reine Helfer (§3): die Karte/Zeile führt mit dem THEMA. Fehlt die amtliche
// Regeste (26/75), baut synthThema eine deterministische Sachzeile NUR aus
// echten Strukturfeldern — KEIN gefakter Regestentext (§8). istSynth() lässt die
// Darstellung den Ersatz visuell kenntlich machen (andere Schrift + Marker).

/** true, wenn der Entscheid amtlich in der BGE-Sammlung publiziert ist (höchste Autorität). */
export function istBge(e: BrowseEntscheid): boolean {
  return !!e.bgeReferenz;
}

/**
 * Haupt-Identität (der scanbare/zitierbare Anker): die amtliche BGE-Referenz
 * ('BGE 150 III 137'), sonst das Aktenzeichen. Anwältinnen erkennen und zitieren
 * die BGE-Nummer — sie ist, wo vorhanden, wertvoller als das Aktenzeichen.
 */
export function hauptIdentitaet(e: BrowseEntscheid): string {
  return e.bgeReferenz ? `BGE ${e.bgeReferenz}` : e.nummer;
}

/** Erlass-/Norm-Key lesbar machen: 'OR' → 'OR', 'OR-336' → 'OR Art. 336'. Rein, kein Normtext. */
export function normLabel(key: string): string {
  const m = /^([A-Za-zÄÖÜäöü]+)[-_](\d+\w*)$/.exec(key);
  return m ? `${m[1]} Art. ${m[2]}` : key;
}

function jahr(iso: string): string {
  return /^(\d{4})/.exec(iso)?.[1] ?? iso;
}

/** true, wenn keine amtliche Regeste vorliegt → Darstellung zeigt Ersatz-Optik + Marker. */
export function istSynth(e: BrowseEntscheid): boolean {
  return !e.regesteKurz;
}

/**
 * Deterministische Sachzeile als Regeste-Ersatz — NUR aus echten Feldern.
 * Kaskade: (Normen vorhanden) Gebiet — Gericht · angewandt: A, B, C
 *          (sonst)            Gebiet — Gericht, Jahr
 * Nennt nie etwas, das nicht im Datensatz steht (§8).
 */
export function synthThema(e: BrowseEntscheid): string {
  const gebiet = GEBIET_LABEL[e.sachgebiet];
  if (e.normKeys.length > 0) {
    const normen = e.normKeys.slice(0, 3).map(normLabel).join(', ');
    return `${gebiet} — ${e.gerichtName} · angewandt: ${normen}`;
  }
  return `${gebiet} — ${e.gerichtName}, ${jahr(e.datum)}`;
}

/** Leitelement-Text für Karte und Liste: amtliche Regeste, sonst synthThema. */
export function themaText(e: BrowseEntscheid): string {
  return e.regesteKurz ?? synthThema(e);
}

/** Filter über das Manifest (Client, deterministisch, kein FTS). Leere Werte → kein Filter. */
export function filterEntscheide(liste: BrowseEntscheid[], f: EntscheidFilterWerte): BrowseEntscheid[] {
  const q = (f.q ?? '').trim().toLowerCase();
  return liste.filter((e) => {
    if (f.sachgebiet && e.sachgebiet !== f.sachgebiet) return false;
    if (f.gericht && e.gericht !== f.gericht) return false;
    if (f.kanton && e.kanton !== f.kanton) return false;
    if (f.sprache && e.sprache !== f.sprache) return false;
    if (f.norm && !e.normKeys.includes(f.norm)) return false;
    if (f.ebene === 'bund' && e.kanton !== 'CH') return false;
    if (f.ebene === 'kanton' && e.kanton === 'CH') return false;
    if (f.nurLeitentscheide && e.leitcharakter !== 'leitentscheid') return false;
    if (f.nurBge && !e.bgeReferenz) return false;
    if (f.datumVon && e.datum < f.datumVon) return false;
    if (f.datumBis && e.datum > f.datumBis) return false;
    if (q) {
      // Suche über das THEMA (inkl. Synth-Zeile) + Identität + Normen + Gericht.
      const heu = `${themaText(e)} ${e.nummer} ${e.bgeReferenz ?? ''} ${e.zitierung} ${e.gerichtName} ${e.normKeys.join(' ')}`.toLowerCase();
      if (!heu.includes(q)) return false;
    }
    return true;
  });
}

/** Bequemer Spezialfall für den ?norm-Einstieg (zweite Navigationsachse). */
export function filterNachNorm(liste: BrowseEntscheid[], normKey: string): BrowseEntscheid[] {
  return liste.filter((e) => e.normKeys.includes(normKey));
}

// ── Sortierung (rein, total geordnet, key als stabiler Tiebreaker) ───────────
//
// Determinismus (§2): gleiche Eingabe → gleiche Reihenfolge. Jeder Vergleich
// endet auf `key`, damit die Sortierung auch bei Gleichstand stabil ist.

export type SortModus = 'relevanz' | 'neu' | 'alt' | 'gericht';

function cmpKey(a: BrowseEntscheid, b: BrowseEntscheid): number {
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
}
function cmpDatum(a: BrowseEntscheid, b: BrowseEntscheid): number {
  return a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : 0;
}

/** Default: Leitentscheide → amtlich publiziert (BGE) → neueste → key. Autorität zuerst. */
export function nachRelevanz(liste: BrowseEntscheid[]): BrowseEntscheid[] {
  const leit = (e: BrowseEntscheid) => (e.leitcharakter === 'leitentscheid' ? 0 : 1);
  const bge = (e: BrowseEntscheid) => (e.bgeReferenz ? 0 : 1);
  return [...liste].sort((a, b) =>
    leit(a) - leit(b) || bge(a) - bge(b) || -cmpDatum(a, b) || cmpKey(a, b));
}

/** Nach Datum (Default absteigend = neueste zuerst), key-Tiebreak. */
export function nachDatum(liste: BrowseEntscheid[], richtung: 'asc' | 'desc' = 'desc'): BrowseEntscheid[] {
  const r = richtung === 'asc' ? 1 : -1;
  return [...liste].sort((a, b) => r * cmpDatum(a, b) || cmpKey(a, b));
}

/** Bund (CH) vor Kantonen, dann neueste zuerst, key-Tiebreak. */
export function nachGericht(liste: BrowseEntscheid[]): BrowseEntscheid[] {
  const ebene = (e: BrowseEntscheid) => (e.kanton === 'CH' ? 0 : 1);
  return [...liste].sort((a, b) =>
    ebene(a) - ebene(b) || -cmpDatum(a, b) || cmpKey(a, b));
}

/** EIN Einstiegspunkt für die Toolbar — dispatcht auf die reinen Sortierer. */
export function sortiere(liste: BrowseEntscheid[], modus: SortModus): BrowseEntscheid[] {
  switch (modus) {
    case 'neu': return nachDatum(liste, 'desc');
    case 'alt': return nachDatum(liste, 'asc');
    case 'gericht': return nachGericht(liste);
    case 'relevanz':
    default: return nachRelevanz(liste);
  }
}

/** Zwei Sektionen für das Default-Layout (Kuratierung als Struktur lesbar). */
export function gruppiereNachLeit(liste: BrowseEntscheid[]): {
  leitentscheide: BrowseEntscheid[];
  weitere: BrowseEntscheid[];
} {
  return {
    leitentscheide: liste.filter((e) => e.leitcharakter === 'leitentscheid'),
    weitere: liste.filter((e) => e.leitcharakter !== 'leitentscheid'),
  };
}

// ── Aggregate für die Navigation (Rail-Zähler, Norm-Häufigkeit) ──────────────

export interface SachgebietZaehler {
  sachgebiet: Rechtsgebiet;
  label: string;
  count: number;
}

/** Sachgebiet-Zähler in GEBIETE-Reihenfolge, nur belegte Gebiete (Rail). */
export function zaehleSachgebiete(liste: BrowseEntscheid[]): SachgebietZaehler[] {
  return GEBIETE
    .map((g) => ({ sachgebiet: g.id, label: g.label, count: liste.filter((e) => e.sachgebiet === g.id).length }))
    .filter((g) => g.count > 0);
}

export interface NormZaehler {
  normKey: string;
  count: number;
}

/** Häufigkeit der angewandten Erlasse, absteigend, key-stabil (Top-Normen-Leiste). */
export function normHaeufigkeit(liste: BrowseEntscheid[]): NormZaehler[] {
  const zahl = new Map<string, number>();
  for (const e of liste) for (const k of e.normKeys) zahl.set(k, (zahl.get(k) ?? 0) + 1);
  return [...zahl.entries()]
    .map(([normKey, count]) => ({ normKey, count }))
    .sort((a, b) => b.count - a.count || (a.normKey < b.normKey ? -1 : a.normKey > b.normKey ? 1 : 0));
}
