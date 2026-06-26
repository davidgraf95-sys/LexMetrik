// ─── Client-Schicht der Rubrik «Materialien» ────────────────────────────────
//
// Lädt das Browse-Manifest (public/materialien/register.json) lazy und stellt
// reine Gruppier-/Filter-Helfer bereit. Reine Ladeschicht (§3) — kein Inhalt
// erzeugt. Klon des Musters aus src/lib/normtext/browse.ts (eigener Namespace,
// das Original bleibt unberührt, §12).

import type { BrowseMaterial, MaterialManifest, BehoerdeId, DoktypId } from './typen';
import { BEHOERDEN, BEHOERDE_RANG, DOKTYP_LABEL } from './register';
import type { Rechtsgebiet } from '../normtext/register';

// ── Manifest (einmal, gecacht als laufende Promise) ──────────────────────────
let manifestPromise: Promise<MaterialManifest | null> | null = null;

export async function ladeMaterialManifest(): Promise<MaterialManifest | null> {
  if (!manifestPromise) {
    manifestPromise = (async () => {
      try {
        const res = await fetch('/materialien/register.json');
        if (!res.ok) return null;
        const m = (await res.json()) as MaterialManifest;
        return Array.isArray(m.materialien) ? m : null;
      } catch {
        return null;
      }
    })();
  }
  return manifestPromise;
}

/** Findet den Material-Eintrag eines Schlüssels (key) im Manifest. */
export async function ladeMaterial(key: string): Promise<BrowseMaterial | null> {
  const m = await ladeMaterialManifest();
  return m?.materialien.find((x) => x.key === key) ?? null;
}

// ── Gruppieren / Filtern (rein, testbar) ─────────────────────────────────────

export interface BehoerdeGruppe {
  behoerde: BehoerdeId;
  name: string;
  kuerzel: string;
  materialien: BrowseMaterial[];
}

/** Materialien nach Behörde (Anzeige-Reihenfolge BEHOERDEN-rang), leere weg. */
export function gruppiereNachBehoerde(materialien: BrowseMaterial[]): BehoerdeGruppe[] {
  return BEHOERDEN
    .map((b): BehoerdeGruppe => ({
      behoerde: b.id,
      name: b.name,
      kuerzel: b.kuerzel,
      materialien: materialien
        .filter((m) => m.behoerde === b.id)
        .sort(vergleiche),
    }))
    .filter((g) => g.materialien.length > 0);
}

/** Filterwerte für die Materialien-Übersicht (alle optional → UND-verknüpft). */
export interface MaterialFilterWerte {
  behoerde?: BehoerdeId;
  doktyp?: DoktypId;
  rechtsgebiet?: Rechtsgebiet;
  /** Volltext-Suche über Titel/Nummer/Behörde (case-insensitive Teilstring). */
  suche?: string;
}

/** Wendet die gesetzten Filter an (rein). Leere/undefined Felder ignorieren. */
export function filtere(materialien: BrowseMaterial[], f: MaterialFilterWerte): BrowseMaterial[] {
  const such = f.suche?.trim().toLowerCase() ?? '';
  return materialien.filter((m) => {
    if (f.behoerde && m.behoerde !== f.behoerde) return false;
    if (f.doktyp && m.doktyp !== f.doktyp) return false;
    if (f.rechtsgebiet && m.rechtsgebiet !== f.rechtsgebiet) return false;
    if (such) {
      const heu = `${m.titel} ${m.nummer ?? ''} ${m.behoerdeKuerzel} ${m.behoerdeName} ${m.doktypLabel}`.toLowerCase();
      if (!heu.includes(such)) return false;
    }
    return true;
  });
}

/** Deterministische Sortierung innerhalb einer Behörde: rang → key. */
export function vergleiche(a: BrowseMaterial, b: BrowseMaterial): number {
  return a.rang - b.rang || a.key.localeCompare(b.key);
}

/** Globale Sortierung (Behörde-rang → eigener rang → key) — für Suche/Listen. */
export function vergleicheGlobal(a: BrowseMaterial, b: BrowseMaterial): number {
  return (BEHOERDE_RANG[a.behoerde] - BEHOERDE_RANG[b.behoerde]) || vergleiche(a, b);
}

/** Die im Manifest tatsächlich vorkommenden Dokumenttypen (für Filter-Optionen),
 *  in der kanonischen DOKTYP-Reihenfolge. */
export function vorhandeneDoktypen(materialien: BrowseMaterial[]): Array<{ id: DoktypId; label: string }> {
  const ids = new Set(materialien.map((m) => m.doktyp));
  return (Object.keys(DOKTYP_LABEL) as DoktypId[])
    .filter((id) => ids.has(id))
    .map((id) => ({ id, label: DOKTYP_LABEL[id] }));
}
