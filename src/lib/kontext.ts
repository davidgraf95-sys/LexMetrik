// ─── Kontext-Auflösung: Norm ↔ Entscheid ↔ Material ↔ Werkzeug ──────────────
//
// EINE zentrale Auflöse-Schicht für das einheitliche «Kontext»-Panel (B3) der
// drei Korpus-Reader (Gesetz, Entscheid, Material). Sie verknüpft NUR über die
// bereits vorhandenen `normKeys` der drei Korpora — keine neue materielle
// Zuordnung, keine Rechtslogik (§3). Jede Zuordnung lebt weiterhin an genau
// einer Stelle (§5): Werkzeuge/Materialien in normtext/werkzeuge.ts, Entscheide
// im build-time Norm→Entscheid-Index. Diese Datei projiziert sie nur zusammen.
//
// «Selbst-Korpus» wird ausgelassen: der Gesetz-Reader IST die Norm (zeigt keine
// Normen-Gruppe), der Material-Reader IST das Material, der Entscheid-Reader IST
// der Entscheid. So entstehen keine Selbstverweise.

import {
  werkzeugeFuerEntscheid, materialienFuerNorm,
  type Werkzeug, type MaterialBezug,
} from './normtext/werkzeuge';
import { ERLASS_REGISTER } from './normtext/register';
import { rechtsprechungFuerErlass, type EntscheidRef } from './rechtsprechung/norm-index';

export type { Werkzeug, MaterialBezug, EntscheidRef };

/** Quelle-Korpus des Readers, der das Panel zeigt. */
export type KontextTyp = 'norm' | 'entscheid' | 'material';

/** Verweis auf eine Erlass-Detailseite (aufgelöst über das ERLASS_REGISTER). */
export interface NormBezug {
  key: string;
  kuerzel: string;
  titel: string;
  ebene: 'bund' | 'kanton';
  pfad: string;
}

// Schneller Key→Erlass-Zugriff (einmalig, modullokal) statt linearer Suche je
// normKey (§6.4: kein O(n²) pro Render).
const ERLASS_BY_KEY: ReadonlyMap<string, (typeof ERLASS_REGISTER)[number]> =
  new Map(ERLASS_REGISTER.map((e) => [e.key, e]));

/**
 * normKeys → Erlass-Detailverweise. Nur im Register vorhandene Keys werden
 * verlinkt (ein unbekannter Key ergäbe sonst einen toten Link, §8); Reihenfolge
 * = Eingabereihenfolge, dedupliziert.
 */
export function normenFuer(normKeys: readonly string[]): NormBezug[] {
  const seen = new Set<string>();
  const out: NormBezug[] = [];
  for (const k of normKeys) {
    if (seen.has(k)) continue;
    const e = ERLASS_BY_KEY.get(k);
    if (!e) continue;
    seen.add(k);
    out.push({
      key: e.key, kuerzel: e.kuerzel, titel: e.titel, ebene: e.ebene,
      pfad: `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`,
    });
  }
  return out;
}

/** Materialien über mehrere normKeys vereinigt + dedupliziert (Behörde→key sortiert). */
export function materialienFuer(normKeys: readonly string[]): MaterialBezug[] {
  const seen = new Set<string>();
  const out: MaterialBezug[] = [];
  for (const k of normKeys) {
    for (const m of materialienFuerNorm(k)) {
      if (!seen.has(m.key)) { seen.add(m.key); out.push(m); }
    }
  }
  return out.sort((a, b) => a.behoerdeKuerzel.localeCompare(b.behoerdeKuerzel) || a.key.localeCompare(b.key));
}

/** Synchron (in-Bundle) auflösbare Gruppen — ohne den Selbst-Korpus. */
export interface KontextSync {
  normen: NormBezug[];
  materialien: MaterialBezug[];
  werkzeuge: Werkzeug[];
}

export function kontextSync(typ: KontextTyp, normKeys: readonly string[]): KontextSync {
  return {
    // Norm-Reader IST die Norm → keine Normen-Gruppe (Selbstverweis vermeiden).
    normen: typ === 'norm' ? [] : normenFuer(normKeys),
    // Material-Reader IST das Material → keine Materialien-Gruppe.
    materialien: typ === 'material' ? [] : materialienFuer(normKeys),
    // Werkzeuge sind für alle drei Korpora fremd → immer auflösen.
    werkzeuge: werkzeugeFuerEntscheid([...normKeys]),
  };
}

/**
 * Entscheide zu den normKeys (asynchron: Norm→Entscheid-Index als Lazy-JSON).
 * Der Entscheid-Reader IST der Entscheid → leer (keine Entscheid-Gruppe, kein
 * Selbstverweis). Vereinigt über alle normKeys, dedupliziert, Reihenfolge des
 * Index erhalten (relevanz-/leit-vorsortiert build-time).
 */
export async function kontextEntscheide(typ: KontextTyp, normKeys: readonly string[]): Promise<EntscheidRef[]> {
  if (typ === 'entscheid') return [];
  const seen = new Set<string>();
  const out: EntscheidRef[] = [];
  for (const k of normKeys) {
    for (const r of await rechtsprechungFuerErlass(k)) {
      if (!seen.has(r.key)) { seen.add(r.key); out.push(r); }
    }
  }
  return out;
}
