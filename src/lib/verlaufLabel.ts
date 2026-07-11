// ─── Label-Auflösung für die Verlauf-Schiene ────────────────────────────────
//
// Reiner Resolver (§3): aus einem Navigationspfad ein menschenlesbares Label.
// Kein document.title-Hack — die Leser-Seiten (GesetzLeser/EntscheidLeser)
// setzen ihren Titel asynchron NACH dem Route-Tracker, wären als Quelle also
// unzuverlässig. Stattdessen:
//   · Katalog-/statische Routen  → metaFuerPfad() (synchron, im Shell-Bundle)
//   · /gesetze/:ebene/:key       → Kürzel/Titel aus dem Browse-Manifest
//   · /rechtsprechung/:key       → Zitierung aus dem Entscheid-Manifest
// Die Manifest-Lookups bekommen die bereits geladenen Manifeste als Argument
// (die Verlauf-Komponente lädt sie lazy); ohne Manifest gibt es ein ehrliches
// Platzhalter-Label statt eines Rohpfads.

import { metaFuerPfad } from './seo';
import type { BrowseManifest, BrowseErlass } from './normtext/browse-typen';
import type { EntscheidManifest } from './rechtsprechung/register';
import type { MaterialManifest } from './materialien/typen';

const SUFFIX = /\s*[—–-]\s*LexMetrik\s*$/;

/** Reines pathname (ohne ?search/#hash). */
export function pfadTeil(path: string): string {
  return path.split(/[?#]/)[0];
}

/** Gesetzes-Leser-Pfad → {ebene, key} oder null. */
export function gesetzPfad(path: string): { ebene: string; key: string } | null {
  const m = /^\/gesetze\/([^/]+)\/([^/]+)\/?$/.exec(pfadTeil(path));
  return m ? { ebene: decodeURIComponent(m[1]), key: decodeURIComponent(m[2]) } : null;
}

/** Entscheid-Leser-Pfad → {key} oder null. */
export function entscheidPfad(path: string): { key: string } | null {
  const m = /^\/rechtsprechung\/([^/]+)\/?$/.exec(pfadTeil(path));
  return m ? { key: decodeURIComponent(m[1]) } : null;
}

/** Material-Leser-Pfad → {key} oder null. */
export function materialPfad(path: string): { key: string } | null {
  const m = /^\/materialien\/([^/]+)\/?$/.exec(pfadTeil(path));
  return m ? { key: decodeURIComponent(m[1]) } : null;
}

/** Synchron auflösbares Label (Katalog/statisch) — sonst null. */
export function labelAusMeta(path: string): string | null {
  const meta = metaFuerPfad(pfadTeil(path));
  if (!meta) return null;
  return meta.titel.replace(SUFFIX, '').trim() || null;
}

export interface VerlaufManifeste {
  gesetze?: BrowseManifest | null;
  entscheide?: EntscheidManifest | null;
  materialien?: MaterialManifest | null;
}

/**
 * Browse-Erlass eines Gesetz-Leser-Pfads aus dem geladenen Manifest auflösen
 * (SSoT §5: EINE Stelle für die {ebene,key}→Erlass-Suche, von verlaufLabel UND
 * vom Tab-Streifen-Wappen genutzt — kein doppelter find). Exakter (ebene,key)-
 * Treffer zuerst, dann key-only als Fallback. null = kein Gesetz-Pfad / kein
 * Manifest / unbekannter Schlüssel.
 */
export function erlassVonPfad(path: string, m: VerlaufManifeste = {}): BrowseErlass | null {
  const g = gesetzPfad(path);
  if (!g) return null;
  return m.gesetze?.erlasse.find((x) => x.key === g.key && x.ebene === g.ebene)
    ?? m.gesetze?.erlasse.find((x) => x.key === g.key)
    ?? null;
}

/** Bestmögliches Label für die Anzeige; nie ein Rohpfad. */
export function verlaufLabel(path: string, m: VerlaufManifeste = {}): string {
  const meta = labelAusMeta(path);
  if (meta) return meta;

  if (gesetzPfad(path)) {
    const e = erlassVonPfad(path, m);
    return e ? e.kuerzel || e.titel : 'Gesetz öffnen';
  }

  const ent = entscheidPfad(path);
  if (ent) {
    const e = m.entscheide?.entscheide.find((x) => x.key === ent.key);
    return e ? e.zitierung : 'Entscheid öffnen';
  }

  const mat = materialPfad(path);
  if (mat) {
    const e = m.materialien?.materialien.find((x) => x.key === mat.key);
    return e ? e.titel : 'Material öffnen';
  }

  return 'Zuletzt geöffnet';
}
