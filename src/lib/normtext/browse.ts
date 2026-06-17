// Client-Schicht der Rubrik V «Gesetze»: lädt das Browse-Manifest
// (public/normtext/register.json) und die Volltext-Dateien lazy, plus reine
// Gruppier-/Filter-Helfer. Reine Ladeschicht (§3) — kein Normtext erzeugt.

import type { BrowseManifest, BrowseErlass } from './browse-typen';
import type { NormSnapshot, NormSnapshotDatei } from './typen';
import { GEBIETE, type Rechtsgebiet } from './register';

// ── Manifest (einmal, gecacht als laufende Promise) ──────────────────────────
let manifestPromise: Promise<BrowseManifest | null> | null = null;

export async function ladeBrowseManifest(): Promise<BrowseManifest | null> {
  if (!manifestPromise) {
    manifestPromise = (async () => {
      try {
        const res = await fetch('/normtext/register.json');
        if (!res.ok) return null;
        return (await res.json()) as BrowseManifest;
      } catch {
        return null;
      }
    })();
  }
  return manifestPromise;
}

/** Findet den Erlass-Eintrag eines Schlüssels (key) im Manifest. */
export async function ladeErlass(key: string): Promise<BrowseErlass | null> {
  const m = await ladeBrowseManifest();
  return m?.erlasse.find((e) => e.key === key) ?? null;
}

// ── Volltext-Datei eines Erlasses (lazy, gecacht) ────────────────────────────
const dateiCache = new Map<string, Promise<NormSnapshotDatei | null>>();

/** Lädt die Snapshot-Datei eines Erlasses (BrowseErlass.datei, z.B. 'bund/OR.json'). */
export function ladeErlassDatei(datei: string): Promise<NormSnapshotDatei | null> {
  let p = dateiCache.get(datei);
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(`/normtext/${datei}`);
        if (!res.ok) return null;
        const d = (await res.json()) as NormSnapshotDatei;
        return Array.isArray(d.eintraege) ? d : null;
      } catch {
        return null;
      }
    })();
    dateiCache.set(datei, p);
  }
  return p;
}

// ── Gruppieren / Filtern (rein, testbar) ─────────────────────────────────────
export interface GebietGruppe { gebiet: Rechtsgebiet; label: string; erlasse: BrowseErlass[] }
export interface KantonGruppe { kanton: string; erlasse: BrowseErlass[] }

/** Bund-Erlasse nach Rechtsgebiet (Anzeige-Reihenfolge GEBIETE), leere weggelassen. */
export function gruppiereNachGebiet(erlasse: BrowseErlass[]): GebietGruppe[] {
  return GEBIETE
    .map((g) => ({ gebiet: g.id, label: g.label, erlasse: erlasse.filter((e) => e.rechtsgebiet === g.id) }))
    .filter((g) => g.erlasse.length > 0);
}

/** Kanton-Erlasse nach Kantonskürzel (alphabetisch). */
export function gruppiereNachKanton(erlasse: BrowseErlass[]): KantonGruppe[] {
  const map = new Map<string, BrowseErlass[]>();
  for (const e of erlasse) {
    const k = e.kanton ?? '?';
    const liste = map.get(k);
    if (liste) liste.push(e);
    else map.set(k, [e]);
  }
  return [...map.keys()].sort().map((k) => ({ kanton: k, erlasse: map.get(k)! }));
}

/** Volltext-Filter über Kürzel/Titel/SR/Kanton. Leerer Term → alles. */
export function filtern(erlasse: BrowseErlass[], term: string): BrowseErlass[] {
  const s = term.trim().toLowerCase();
  if (!s) return erlasse;
  return erlasse.filter((e) =>
    e.kuerzel.toLowerCase().includes(s)
    || e.titel.toLowerCase().includes(s)
    || (e.sr ?? '').toLowerCase().includes(s)
    || (e.kanton ?? '').toLowerCase().includes(s));
}

// ── Artikel-Bänder (Lesesicht-Navigation + zuklappbare Abschnitte) ───────────
// Bis echte amtliche Gliederung in den Snapshots liegt (P5), gliedern wir lange
// Erlasse in Bänder fixer Grösse — kurze Sprung-Navigation + zuklappbare
// Abschnitte. Reine Darstellung (§3).
export interface Band { id: string; label: string; eintraege: NormSnapshot[] }

export function baueBaender(eintraege: NormSnapshot[], groesse = 40): Band[] {
  if (eintraege.length === 0) return [];
  const baender: Band[] = [];
  for (let i = 0; i < eintraege.length; i += groesse) {
    const teil = eintraege.slice(i, i + groesse);
    baender.push({
      id: `band-${i / groesse}`,
      label: `${teil[0].artikelLabel} – ${teil[teil.length - 1].artikelLabel}`,
      eintraege: teil,
    });
  }
  return baender;
}

/** Index des Bandes, das den Artikel-Token enthält, oder -1. */
export function bandFuerToken(baender: Band[], token: string): number {
  return baender.findIndex((b) => b.eintraege.some((e) => e.artikel === token));
}
