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
import type { BrowseManifest } from './normtext/browse-typen';
import type { EntscheidManifest } from './rechtsprechung/register';

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

/** Synchron auflösbares Label (Katalog/statisch) — sonst null. */
export function labelAusMeta(path: string): string | null {
  const meta = metaFuerPfad(pfadTeil(path));
  if (!meta) return null;
  return meta.titel.replace(SUFFIX, '').trim() || null;
}

export interface VerlaufManifeste {
  gesetze?: BrowseManifest | null;
  entscheide?: EntscheidManifest | null;
}

/** Bestmögliches Label für die Anzeige; nie ein Rohpfad. */
export function verlaufLabel(path: string, m: VerlaufManifeste = {}): string {
  const meta = labelAusMeta(path);
  if (meta) return meta;

  const g = gesetzPfad(path);
  if (g) {
    const e = m.gesetze?.erlasse.find((x) => x.key === g.key && x.ebene === g.ebene)
      ?? m.gesetze?.erlasse.find((x) => x.key === g.key);
    return e ? e.kuerzel || e.titel : 'Gesetz öffnen';
  }

  const ent = entscheidPfad(path);
  if (ent) {
    const e = m.entscheide?.entscheide.find((x) => x.key === ent.key);
    return e ? e.zitierung : 'Entscheid öffnen';
  }

  return 'Zuletzt geöffnet';
}
