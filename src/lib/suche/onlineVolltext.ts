import type { SuchGruppe, SuchTreffer } from '../universalSuche';

// ─── Online-Volltextsuche (QS-DATA E2, W2·6-DATA) ────────────────────────────
//
// Bindet die Turso-Edge-Suche (`api/suche`) als ZUSÄTZLICHE Treffergruppe in den
// EINEN Suchweg (universalSuche) ein — kein zweites Such-Silo (§11.3 b). Der
// statische Client-Index (artikelVolltext + Browse-Manifeste) bleibt der Offline-
// Fallback; diese Gruppe wächst NUR zusätzlich unten an, wenn die Edge antwortet.
//
// EHRLICHES DEGRADIEREN (§8): bei 503 (Turso noch nicht provisioniert), 502,
// Netzwerkfehler oder Timeout (~4 s) erscheint die Gruppe GAR NICHT — kein
// Fehler-Lärm, nichts wirkt kaputt. Nach EINEM Ausfall wird für ~5 min nicht
// erneut gehämmert (Feature-Detection-Cache); danach probiert eine neue Query
// wieder. Reine Darstellungs-/Netz-Schicht (§3): KEINE Rechtslogik, nur
// URL-Bildung aus der Fundstelle + Antwort→Treffer-Abbildung.

// Wire-DTO der Edge-Antwort (Netzgrenze). Serverseitige SSoT der Form:
// scripts/datenhaltung/suche-kern.ts (ArtikelTreffer/EntscheidTreffer/SucheAntwort).
// Hier bewusst client-lokal gespiegelt — die App-tsconfig kompiliert nur `src`
// (kein Import aus scripts/), und ein Wire-DTO ist keine Rechtsregel (§3/§5).
interface Fundstelle {
  erlass?: string;
  artikel?: string;
  quelleUrl: string;
}
interface ApiArtikelTreffer {
  id: string;
  titel: string;
  snippet: string;
  fundstelle: Fundstelle;
}
interface ApiEntscheidTreffer {
  id: string;
  titel: string;
  snippet: string;
  fundstelle: Fundstelle;
}
interface ApiAntwort<T> {
  treffer: T[];
  gesamt: number;
  naechsteSeite: number | null;
}
interface SucheApiAntwort {
  artikel?: ApiAntwort<ApiArtikelTreffer>;
  entscheide?: ApiAntwort<ApiEntscheidTreffer>;
}

/** Untergrenze: erst ab 3 Zeichen fetchen (§15.3 — kein Netz je Tastendruck). */
export const MIN_ZEICHEN = 3;
/** Abbruch-Fenster in ms (§15/§8: lieber keine Gruppe als hängendes UI). */
export const TIMEOUT_MS = 4000;
/** Sperr-Fenster nach einem Ausfall in ms — dann probiert eine neue Query wieder. */
export const SPERRE_MS = 5 * 60 * 1000;
/** Deckel je Query — die Edge liefert by design nur Snippets, keine Volltexte. */
const LIMIT = 10;

export interface OnlineOptions {
  /** Für Tests injizierbar; sonst globales fetch. */
  fetchImpl?: typeof fetch;
  /**
   * Wall-Clock als EINGABE (§2: kein Date.now() in src/lib — der Produktions-Caller,
   * der Hook in src/components, führt `() => Date.now()`). Steuert nur das
   * Feature-Detection-Fenster, nie Rechenlogik. Ohne Clock (zeitlose Aufrufer/Tests)
   * gilt 0 — mit modul-lokalem Reset ungefährlich.
   */
  jetzt?: () => number;
  /** Für Tests injizierbar; sonst import.meta.env.BASE_URL. */
  basisUrl?: string;
  /** Für Tests injizierbar; sonst TIMEOUT_MS. */
  timeoutMs?: number;
}

// Feature-Detection-Cache (modul-lokal = sessionweit): Zeitpunkt, bis zu dem nach
// einem Ausfall NICHT erneut abgefragt wird. 0 = frei.
let gesperrtBis = 0;

/** Test-Helfer: setzt den Feature-Detection-Cache zurück (kein Produktionspfad). */
export function zuruecksetzenOnlineSperre(): void {
  gesperrtBis = 0;
}

/**
 * Interne Artikel-Route (E2-hot-Scope = NUR Bund-Gesetze, §11.5) — mirror des
 * statischen Client-Helfers (artikelVolltext.ts): `/gesetze/bund/<key>#art-<artikel>`.
 * Der Anker `art-<artikel>` ist die im Reader gesetzte Artikel-ID (parts.tsx:
 * `<article id={art-${e.artikel}}>`); die Anzeige-Nummer (`330_a`) wird NICHT
 * URL-kodiert (identisch zum bestehenden Helfer), der Routen-Key schon.
 */
export function artikelTrefferHref(f: Fundstelle): string {
  return `/gesetze/bund/${encodeURIComponent(f.erlass ?? '')}#art-${f.artikel ?? ''}`;
}

/** Interne Entscheid-Route — mirror von universalSuche.entscheidGruppe: `/rechtsprechung/<key>`.
 *  Die Edge-`id` IST der kanonische Register-Key (entscheide.id = bestehender Key). */
export function entscheidTrefferHref(id: string): string {
  return `/rechtsprechung/${encodeURIComponent(id)}`;
}

/** Antwort → geteilte SuchTreffer. Artikel zuerst, dann Entscheide (feste Ordnung). */
function baueTreffer(antwort: SucheApiAntwort): { treffer: SuchTreffer[]; gesamt: number } {
  const artikel: SuchTreffer[] = (antwort.artikel?.treffer ?? []).map((t) => ({
    id: t.id,
    label: t.titel,
    untertitel: t.snippet,
    marke: { text: 'Gesetz', ton: 'soft' as const },
    href: artikelTrefferHref(t.fundstelle),
  }));
  const entscheide: SuchTreffer[] = (antwort.entscheide?.treffer ?? []).map((t) => ({
    id: t.id,
    label: t.titel,
    untertitel: t.snippet,
    marke: { text: 'Entscheid', ton: 'soft' as const },
    href: entscheidTrefferHref(t.id),
  }));
  return {
    treffer: [...artikel, ...entscheide],
    gesamt: (antwort.artikel?.gesamt ?? 0) + (antwort.entscheide?.gesamt ?? 0),
  };
}

const HINWEIS =
  'Online-Volltextsuche über Gesetze + Leitentscheide — Suchbegriffe verlassen dafür den Browser.';

/** Baut die fertige §8-markierte Online-Gruppe (oder null, wenn leer). */
function baueGruppe(antwort: SucheApiAntwort): SuchGruppe | null {
  const { treffer, gesamt } = baueTreffer(antwort);
  if (treffer.length === 0) return null;
  return { id: 'online', titel: 'Volltext-Suche (online)', hinweis: HINWEIS, treffer, gesamt };
}

/**
 * Fragt die Edge-Suche ab und liefert die fertige Treffergruppe — oder `null`,
 * wenn nicht gefetcht/degradiert wird (zu kurz, gesperrt, 5xx, Netz, Timeout,
 * leere Antwort). `null` bedeutet immer «Gruppe nicht zeigen» (§8). Rein bis auf
 * das (injizierbare) fetch/now — deterministisch testbar (§2-Geist).
 */
export async function holeOnlineTreffer(q: string, opt: OnlineOptions = {}): Promise<SuchGruppe | null> {
  const begriff = q.trim();
  if (begriff.length < MIN_ZEICHEN) return null;

  const jetzt = (opt.jetzt ?? (() => 0))();
  if (jetzt < gesperrtBis) return null; // im Sperr-Fenster: nicht erneut hämmern

  const fetchImpl = opt.fetchImpl ?? fetch;
  const basis = opt.basisUrl ?? importBase();
  const url = `${basis}api/suche?q=${encodeURIComponent(begriff)}&limit=${LIMIT}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opt.timeoutMs ?? TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, { signal: controller.signal });
    if (!res.ok) {
      gesperrtBis = jetzt + SPERRE_MS; // 503 (kein Turso) / 502 → für ~5 min ruhen
      return null;
    }
    const antwort = (await res.json()) as SucheApiAntwort;
    gesperrtBis = 0; // Erfolg → Sperre lösen
    return baueGruppe(antwort);
  } catch {
    gesperrtBis = jetzt + SPERRE_MS; // Netzfehler / Abbruch (Timeout) → ruhen
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** import.meta.env.BASE_URL, defensiv (Node-Testumgebung ohne Vite-Env). */
function importBase(): string {
  try {
    return (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
  } catch {
    return '/';
  }
}
