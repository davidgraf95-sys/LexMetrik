/**
 * scripts/normtext/rectifies-cache.ts — Roh-HTML-Cache der Berichtigungstexte für
 * `check:revisionen-rectifies` (Fehlerbuch W2·18, s. rectifies-berichtigung.ts).
 *
 * Gleiches Cache-Muster wie `zh-pdf-cache.ts` (Skill-Prinzip «store raw as golden»):
 * ein amtliches Berichtigungsdokument ändert sich nach Publikation nicht mehr — ein
 * wiederholter Lauf (jede Gegenprüfungs-Runde, jeder CI-Tag) muss dieselben ~25 HTML
 * nicht neu holen. Ort: `daten/rectifies-cache/` — von `.gitignore` (`daten/*`) erfasst,
 * kein Artefakt im Sinne von §5, wiederherstellbar (`RECTIFIES_CACHE=netz` füllt neu).
 *
 * DREI MODI (Default 'auto'; Env-Override `RECTIFIES_CACHE`): siehe `zh-pdf-cache.ts`
 * für die volle Begründung — hier identisch: auto/netz/offline.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const RECTIFIES_CACHE_DIR = 'daten/rectifies-cache';

export type CacheModus = 'auto' | 'netz' | 'offline';

export interface RectifiesCacheSidecar {
  oc: string;
  url: string;
  abgerufen: string;
  /** sha256 des rohen HTML-Textes = der Drift-Token. */
  textSha256: string;
}

export interface RectifiesCacheTreffer {
  html: string;
  sidecar: RectifiesCacheSidecar;
  ausCache: boolean;
}

export function modusAusUmgebung(fallback: CacheModus = 'auto'): CacheModus {
  const v = process.env.RECTIFIES_CACHE;
  return v === 'auto' || v === 'netz' || v === 'offline' ? v : fallback;
}

export function cacheSchluessel(oc: string): string {
  return createHash('sha256').update(oc, 'utf8').digest('hex').slice(0, 32);
}

export function textHash(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function pfade(oc: string): { html: string; meta: string } {
  const k = cacheSchluessel(oc);
  return { html: join(RECTIFIES_CACHE_DIR, `${k}.html`), meta: join(RECTIFIES_CACHE_DIR, `${k}.json`) };
}

/** Liest einen Cache-Eintrag oder null. Ein unvollständiger/beschädigter Eintrag gilt
 *  als Fehltreffer (§7: massgeblich ist die amtliche Fassung, der Cache ist nur ihre Kopie). */
export function leseCache(oc: string): RectifiesCacheTreffer | null {
  const p = pfade(oc);
  if (!existsSync(p.html) || !existsSync(p.meta)) return null;
  const sidecar = JSON.parse(readFileSync(p.meta, 'utf8')) as RectifiesCacheSidecar;
  const html = readFileSync(p.html, 'utf8');
  if (textHash(html) !== sidecar.textSha256) return null;
  return { html, sidecar, ausCache: true };
}

export function schreibeCache(oc: string, url: string, html: string, abgerufen: string): void {
  mkdirSync(RECTIFIES_CACHE_DIR, { recursive: true });
  const p = pfade(oc);
  const sidecar: RectifiesCacheSidecar = { oc, url, abgerufen, textSha256: textHash(html) };
  writeFileSync(p.html, html, 'utf8');
  writeFileSync(p.meta, `${JSON.stringify(sidecar, null, 2)}\n`, 'utf8');
}

/**
 * Holt den Berichtigungstext eines oc nach Cache-Regel. `holen` bringt der Aufrufer mit
 * (SPARQL-Auflösung + Fetch, s. `rectifies-berichtigung.ts`) — der Cache kennt kein Netz.
 * Wirft mit klarer Ursache, statt einen halben Datensatz zu liefern.
 */
export async function holeMitCache(
  oc: string,
  holen: () => Promise<{ url: string; html: string }>,
  modus: CacheModus = 'auto',
): Promise<RectifiesCacheTreffer> {
  if (modus !== 'netz') {
    const treffer = leseCache(oc);
    if (treffer) return treffer;
    if (modus === 'offline') {
      throw new Error(`Rectifies-Cache leer für ${oc} (Modus offline). Cache füllen: RECTIFIES_CACHE=netz`);
    }
  }
  const { url, html } = await holen();
  const abgerufen = new Date().toISOString();
  schreibeCache(oc, url, html, abgerufen);
  return { html, sidecar: { oc, url, abgerufen, textSha256: textHash(html) }, ausCache: false };
}
