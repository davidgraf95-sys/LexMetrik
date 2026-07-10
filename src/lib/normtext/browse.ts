// Client-Schicht der Rubrik V «Gesetze»: lädt das Browse-Manifest
// (public/normtext/register.json) und die Volltext-Dateien lazy, plus reine
// Gruppier-/Filter-Helfer. Reine Ladeschicht (§3) — kein Normtext erzeugt.

import type { BrowseManifest, BrowseErlass } from './browse-typen';
import type { NormSnapshot, NormSnapshotDatei } from './typen';
import { GEBIETE, type Rechtsgebiet } from './register';
import type { KantonSystematik } from './systematik';
import { randtitelKnoten } from './darstellung';

// ── Manifest (einmal, gecacht als laufende Promise) ──────────────────────────
let manifestPromise: Promise<BrowseManifest | null> | null = null;

// ── Kantonale Systematik-Bäume (einmal, gecacht) — für die Sachgebiets-Gliederung
let systematikPromise: Promise<Record<string, KantonSystematik>> | null = null;

export async function ladeKantonSystematik(): Promise<Record<string, KantonSystematik>> {
  if (!systematikPromise) {
    systematikPromise = (async () => {
      try {
        const res = await fetch('/normtext/kanton-systematik.json');
        if (!res.ok) return {};
        return (await res.json()) as Record<string, KantonSystematik>;
      } catch {
        return {};
      }
    })();
  }
  return systematikPromise;
}

// ── Currency-Sidecar (P1-d): geltend-geprüft-Datum + angekündigte Fassung ────
/** Ein Currency-Eintrag je Erlass-Key (public/normtext/currency.json). */
export interface CurrencyEintrag {
  /** Laufdatum des letzten maschinellen Fedlex-Currency-Abgleichs (ISO). */
  geprueftAm: string;
  /** Falls Fedlex eine künftige Konsolidierung angekündigt hat (ISO). */
  naechsteFassungAb?: string;
}
export type CurrencyMap = Record<string, CurrencyEintrag>;

let currencyPromise: Promise<CurrencyMap> | null = null;

/** Lädt currency.json einmal (gecacht). Fehlt sie, ist die Map leer (kein Chip). */
export async function ladeCurrency(): Promise<CurrencyMap> {
  if (!currencyPromise) {
    currencyPromise = (async () => {
      try {
        const res = await fetch('/normtext/currency.json');
        if (!res.ok) return {};
        return (await res.json()) as CurrencyMap;
      } catch {
        return {};
      }
    })();
  }
  return currencyPromise;
}

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

// ── Amtliche Gliederung + Marginalien (Struktur-Sidecar, Rubrik V Richtung A) ──
export interface FnLink { label: string; url: string }
export interface Fussnote {
  nr: string; text: string; links: FnLink[];
  absatz?: string | null; item?: string | null;
  /** G11: Label der Überschrift/des Randtitels, zu der/dem diese section-heading-
   *  Fussnote gehört (Marker am Sektions-/Randtitel-Kopf statt auf Artikelebene). */
  sektion?: string;
}
export interface ArtikelStruktur {
  gliederung: Array<{ ebene: number; label: string }>;
  marginalie: string[];
  /** Amtliche Fussnoten (Änderungs-/AS/BBl-Historie), falls vorhanden. */
  fussnoten?: Fussnote[];
}
export type StrukturMap = Record<string, ArtikelStruktur>;

/** M5: Erlass-Kopf (Vorspann VOR dem ersten Artikel) — SR-Nr, amtlicher Titel,
 *  Erlassdatum, Ingress/Erlassformel bzw. materielle Präambel + Kopf-Fussnoten.
 *  Spiegelt das Schema aus scripts/normtext/kopf-extrahiere.ts (Sidecar). */
export interface KopfZeile { rolle: 'autor' | 'ingress' | 'praeambel' | 'verb'; text: string; fnNrs?: string[] }
export interface ErlassKopf {
  srNummer?: string;
  titel?: string;
  erlassdatum?: string;
  praeambelTitel?: string;
  praeambel?: KopfZeile[];
  fussnoten?: Fussnote[];
}

interface StrukturDoc { artikel?: StrukturMap; kopf?: ErlassKopf }
const strukturCache = new Map<string, Promise<StrukturDoc | null>>();

/** Lädt das Struktur-Sidecar-Dokument (Gliederung/Marginalien + Erlass-Kopf), lazy/gecacht. */
function ladeStrukturDoc(ebene: string, key: string): Promise<StrukturDoc | null> {
  const url = `/normtext/struktur/${ebene}/${key}.json`;
  let p = strukturCache.get(url);
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return (await res.json()) as StrukturDoc;
      } catch {
        return null;
      }
    })();
    strukturCache.set(url, p);
  }
  return p;
}

/** Lädt die Struktur-Sidecar (Gliederung+Marginalien je Artikel-Token), lazy/gecacht. */
export function ladeStruktur(ebene: string, key: string): Promise<StrukturMap | null> {
  return ladeStrukturDoc(ebene, key).then((d) => d?.artikel ?? null);
}

/** Lädt den Erlass-Kopf (M5) aus demselben Sidecar (geteilter Cache, ein Fetch). */
export function ladeErlassKopf(ebene: string, key: string): Promise<ErlassKopf | null> {
  return ladeStrukturDoc(ebene, key).then((d) => d?.kopf ?? null);
}

/** Ein Knoten der amtlichen Gliederung (Teil → Titel → Abschnitt …). */
export interface Sektion {
  id: string;
  ebene: number;
  label: string;
  kinder: Sektion[];
  artikel: NormSnapshot[];
  /** true, wenn der Knoten aus einer Randtitel-/Buchstaben-Ebene (Marginalie)
   *  promotet wurde — nicht aus der amtlichen Teil/Titel/Abschnitt-Gliederung
   *  (Auftrag 6b). Steuert die ruhigere, eingerückte Darstellung im Reader. */
  randtitel?: boolean;
  /** G11: Fussnoten-Marker, die an DIESER Überschrift hängen (section-heading-
   *  footnote) — `artikel`+`nr` zeigen aufs Fussnoten-Ziel im Trägerartikel. */
  fussnoten?: Array<{ artikel: string; nr: string }>;
}

/**
 * Baut aus den Artikeln + ihrer Gliederung einen Sektions-Baum. Artikel ohne
 * amtliche Gliederung UND ohne geteilte Randtitel-Gruppierungen landen in
 * `ohneGliederung` (flach). Reine Darstellungs-Vorstufe (§3).
 *
 * 6b (Auftrag David 26.6.2026): Die Randtitel-/Buchstaben-Ebenen («A. … → II. …»)
 * werden — analog Fedlex — als zusätzliche, einklappbare Knoten UNTER die amtliche
 * Gliederung promotet. Nur die von mehreren Artikeln GETEILTEN Ahnen-Stufen werden
 * Knoten (randtitelKnoten.ahnen); die artikel-eigene Sachüberschrift (blatt) bleibt
 * die Überschrift des Artikels selbst. Die Ebene der promoteten Knoten setzt direkt
 * unter der tiefsten amtlichen Gliederungsstufe an, sodass sie sich darunter
 * einreihen (und der Reader sie kleiner/eingerückt darstellt). Rein abgeleitet zur
 * Laufzeit — die struktur-Sidecars bleiben unangetastet (§7).
 */
export function baueGliederungsbaum(
  eintraege: NormSnapshot[],
  struktur: StrukturMap | null,
): { sektionen: Sektion[]; ohneGliederung: NormSnapshot[] } {
  const sektionen: Sektion[] = [];
  const ohneGliederung: NormSnapshot[] = [];
  let nr = 0;

  for (const e of eintraege) {
    const st = struktur?.[e.artikel];
    const gliederung = st?.gliederung ?? [];
    const { ahnen } = randtitelKnoten(st?.marginalie ?? []);
    // G11: section-heading-Fussnoten dieses (Träger-)Artikels je Überschrift-Label.
    const sektFn = (st?.fussnoten ?? []).filter((f) => f.sektion && f.nr);
    // Promotete Randtitel-Knoten reihen sich direkt unter der tiefsten amtlichen
    // Gliederungsstufe ein. Ohne amtliche Gliederung beginnen sie bei 0 (dann
    // tragen sie selbst die Haupt-Hierarchie, z. B. kantonale Erlasse).
    const basis = gliederung.length ? Math.max(...gliederung.map((g) => g.ebene)) + 1 : 0;
    const pfad: Array<{ ebene: number; label: string; randtitel: boolean }> = [
      ...gliederung.map((g) => ({ ebene: g.ebene, label: g.label, randtitel: false })),
      ...ahnen.map((label, i) => ({ ebene: basis + i, label, randtitel: true })),
    ];
    if (pfad.length === 0) { ohneGliederung.push(e); continue; }
    let ebeneListe = sektionen;
    let knoten: Sektion | null = null;
    for (const stufe of pfad) {
      let treffer = ebeneListe[ebeneListe.length - 1];
      // Gleicher Knoten nur, wenn er der letzte auf dieser Ebene ist UND Label
      // passt (Gliederung ist dokumentlinear, daher genügt der letzte).
      if (!treffer || treffer.label !== stufe.label || treffer.ebene !== stufe.ebene) {
        treffer = { id: `sek-${nr++}`, ebene: stufe.ebene, label: stufe.label, kinder: [], artikel: [], randtitel: stufe.randtitel };
        ebeneListe.push(treffer);
      }
      // G11: Marker für section-heading-Fussnoten, deren Label diese Stufe trifft,
      // an den Knoten heften (Träger = der aktuelle, erste Artikel darunter).
      const treffFn = sektFn.filter((f) => f.sektion === stufe.label);
      if (treffFn.length) {
        treffer.fussnoten = [...(treffer.fussnoten ?? []), ...treffFn.map((f) => ({ artikel: e.artikel, nr: f.nr }))];
      }
      knoten = treffer;
      ebeneListe = treffer.kinder;
    }
    knoten?.artikel.push(e);
  }
  return { sektionen, ohneGliederung };
}
