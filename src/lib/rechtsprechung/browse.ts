// ─── Client-Schicht der Rubrik «Rechtsprechung» ─────────────────────────────
//
// Lädt das Entscheid-Manifest (public/rechtsprechung/register.json) und die
// einzelnen Entscheid-Dateien lazy, plus reine Gruppier-/Filter-Helfer.
// Reine Ladeschicht (§3) — kein Inhalt erzeugt.

import type { EntscheidManifest, BrowseEntscheid } from './register';
import type { EntscheidSnapshot, EntscheidSnapshotDatei } from './typen';
import { GEBIETE, type Rechtsgebiet } from '../normtext/register';

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
export interface SachgebietGruppe {
  gebiet: Rechtsgebiet;
  label: string;
  entscheide: BrowseEntscheid[];
}

/** Nach Rechtsgebiet (Anzeige-Reihenfolge GEBIETE), leere Gruppen weggelassen. */
export function gruppiereNachSachgebiet(liste: BrowseEntscheid[]): SachgebietGruppe[] {
  return GEBIETE
    .map((g) => ({ gebiet: g.id, label: g.label, entscheide: liste.filter((e) => e.sachgebiet === g.id) }))
    .filter((g) => g.entscheide.length > 0);
}

export interface EntscheidFilterWerte {
  q?: string;
  sachgebiet?: Rechtsgebiet | null;
  gericht?: string | null;
  kanton?: string | null;
  sprache?: string | null;
  nurLeitentscheide?: boolean;
  datumVon?: string | null;
  datumBis?: string | null;
}

/** Filter über das Manifest (Client, deterministisch, kein FTS). Leere Werte → kein Filter. */
export function filterEntscheide(liste: BrowseEntscheid[], f: EntscheidFilterWerte): BrowseEntscheid[] {
  const q = (f.q ?? '').trim().toLowerCase();
  return liste.filter((e) => {
    if (f.sachgebiet && e.sachgebiet !== f.sachgebiet) return false;
    if (f.gericht && e.gericht !== f.gericht) return false;
    if (f.kanton && e.kanton !== f.kanton) return false;
    if (f.sprache && e.sprache !== f.sprache) return false;
    if (f.nurLeitentscheide && e.leitcharakter !== 'leitentscheid') return false;
    if (f.datumVon && e.datum < f.datumVon) return false;
    if (f.datumBis && e.datum > f.datumBis) return false;
    if (q) {
      const heu = `${e.nummer} ${e.bgeReferenz ?? ''} ${e.zitierung} ${e.regesteKurz ?? ''} ${e.normKeys.join(' ')}`.toLowerCase();
      if (!heu.includes(q)) return false;
    }
    return true;
  });
}

/** Entscheide nach Datum absteigend (neueste zuerst). */
export function nachDatum(liste: BrowseEntscheid[]): BrowseEntscheid[] {
  return [...liste].sort((a, b) => (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0));
}
