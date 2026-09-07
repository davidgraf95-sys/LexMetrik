/**
 * scripts/normtext/zh-pdf-cache.ts — Roh-PDF-Cache für die ZH-Quellen (O1).
 *
 * SKILL-PRINZIP «store raw as golden» (scraping-swiss-official-sources,
 * §Ingesting): Die Pipeline ist `idempotent fetch → store-raw → parse → load`.
 * Ein Parser-Bug wird durch ERNEUTES PARSEN der abgelegten Rohdaten behoben,
 * nie durch einen erneuten Crawl. Bis hierher lud jede Fix-Runde und jeder
 * Prüf-Agent dieselben 24 PDF neu — gemessene Reibung der Session 31.8.2026:
 * 3 Gegenprüfungs-Zyklen × 24 Erlasse × 3 Requests = 216 Requests gegen
 * zh.ch/notes.zh.ch für Daten, die sich nicht geändert hatten.
 *
 * WAS ABGELEGT WIRD, je Registry-URL (Schlüssel = sha256(registryUrl)):
 *   <hash>.pdf           die rohen PDF-Bytes (das eigentliche Golden)
 *   <hash>.registry.html das Registry-HTML (trägt das Publikationsdatum = `stand`)
 *   <hash>.json          Sidecar: registryUrl · pdfUrl · ETag · Last-Modified ·
 *                        Abrufdatum · sha256 der PDF-Bytes
 *
 * Ort: `daten/pdf-cache-zh/` — von `.gitignore` (`daten/*`) erfasst, also nie
 * committet. Der Cache ist WIEDERHERSTELLBAR (ein `--modus=netz`-Lauf füllt ihn
 * neu) und darum kein Artefakt im Sinne von §5.
 *
 * DREI MODI (`modus`, Default 'auto'; Env-Override `ZH_PDF_CACHE`):
 *   auto     Cache-Treffer → kein Netz. Fehltreffer → holen und ablegen.
 *            Der Regelfall für Regeneration und Tore.
 *   netz     IMMER holen und den Cache überschreiben. Der Drift-Check fährt so
 *            (Frische holt NUR der Drift-Check — sonst wäre der Cache eine
 *            zweite Wahrheit gegenüber der amtlichen Quelle, §5/§7).
 *   offline  NUR Cache. Fehltreffer ist ein FEHLER, nie ein stiller Netz-Abruf
 *            (so kann der Tor-Offline-Teil in CI ohne Netz laufen und meldet
 *            einen leeren Cache, statt trügerisch grün durchzulaufen).
 *
 * §2: rein bis auf FS/Netz. Der einzige nicht-deterministische Wert
 * (`abgerufen`) steht im Sidecar und fliesst NIE in ein Build-Artefakt — der
 * Drift-Token ist der Byte-Hash, nicht das Datum.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const ZH_CACHE_DIR = 'daten/pdf-cache-zh';

export type CacheModus = 'auto' | 'netz' | 'offline';

/** Sidecar-Angaben je Quelle (Version-Fingerprint, Skill §Keep current cheaply). */
export interface ZhCacheSidecar {
  registryUrl: string;
  pdfUrl: string;
  /** HTTP-`ETag` der PDF-Antwort, falls die Quelle einen liefert. */
  etag: string | null;
  /** HTTP-`Last-Modified` der PDF-Antwort, falls vorhanden. */
  lastModified: string | null;
  /** Abrufdatum (ISO, UTC) — Provenienz, NIE Drift-Token. */
  abgerufen: string;
  /** sha256 der rohen PDF-Bytes = der Drift-Token (§7 d, C2). */
  bytesSha256: string;
  /** Byte-Länge der PDF-Antwort (billige Plausibilitätsprobe). */
  bytes: number;
}

/** Was ein Cache-Treffer (oder ein frischer Abruf) liefert. */
export interface ZhQuellDaten {
  registryHtml: string;
  bytes: Uint8Array;
  sidecar: ZhCacheSidecar;
  /** true, wenn die Daten aus dem Cache stammen (kein Netz berührt). */
  ausCache: boolean;
}

/** Der Modus aus der Umgebung, falls gesetzt — sonst der übergebene Default. */
export function modusAusUmgebung(fallback: CacheModus = 'auto'): CacheModus {
  const v = process.env.ZH_PDF_CACHE;
  return v === 'auto' || v === 'netz' || v === 'offline' ? v : fallback;
}

/** Cache-Schlüssel: sha256 der Registry-URL (die Registry-URL IST die Identität
 *  eines ZH-Erlasses im Inventar und der Manifest-Key des Snapshots). */
export function cacheSchluessel(registryUrl: string): string {
  return createHash('sha256').update(registryUrl, 'utf8').digest('hex').slice(0, 32);
}

/** sha256 roher Bytes — der Quell-Fassungstoken (C2). */
export function byteHash(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function pfade(registryUrl: string): { pdf: string; html: string; meta: string } {
  const k = cacheSchluessel(registryUrl);
  return {
    pdf: join(ZH_CACHE_DIR, `${k}.pdf`),
    html: join(ZH_CACHE_DIR, `${k}.registry.html`),
    meta: join(ZH_CACHE_DIR, `${k}.json`),
  };
}

/** Liest einen Cache-Eintrag oder null. Ein unvollständiger Eintrag (z. B. nach
 *  einem Abbruch mitten im Schreiben) gilt als Fehltreffer, nicht als Treffer. */
export function leseCache(registryUrl: string): ZhQuellDaten | null {
  const p = pfade(registryUrl);
  if (!existsSync(p.pdf) || !existsSync(p.html) || !existsSync(p.meta)) return null;
  const sidecar = JSON.parse(readFileSync(p.meta, 'utf8')) as ZhCacheSidecar;
  const bytes = new Uint8Array(readFileSync(p.pdf));
  // Integritäts-Sonde: ein halb geschriebener oder beschädigter Cache-Eintrag
  // darf nicht als Quelle durchgehen (§7 — massgeblich ist die amtliche Fassung,
  // der Cache ist nur ihre Kopie).
  if (byteHash(bytes) !== sidecar.bytesSha256) return null;
  return {
    registryHtml: readFileSync(p.html, 'utf8'),
    bytes,
    sidecar,
    ausCache: true,
  };
}

/** Legt einen Eintrag ab (PDF-Bytes + Registry-HTML + Sidecar). */
export function schreibeCache(
  registryUrl: string,
  daten: { registryHtml: string; bytes: Uint8Array; sidecar: ZhCacheSidecar },
): void {
  mkdirSync(ZH_CACHE_DIR, { recursive: true });
  const p = pfade(registryUrl);
  writeFileSync(p.pdf, daten.bytes);
  writeFileSync(p.html, daten.registryHtml, 'utf8');
  writeFileSync(p.meta, `${JSON.stringify(daten.sidecar, null, 2)}\n`, 'utf8');
}

/**
 * Die Netz-Kette einer ZH-Quelle, als injizierbare Abhängigkeit: Registry-HTML
 * → OpenAttachment-Link → JS-Redirect → PDF-Bytes. Der Aufrufer bringt seinen
 * eigenen (gedrosselten, wiederholenden) `fetch` mit — der Cache kennt weder
 * UA noch Drossel.
 */
export interface ZhNetzKette {
  hole: (url: string) => Promise<Response>;
  leseAttachmentUrl: (html: string) => string | null;
  loeseRedirect: (html: string, basis: string) => string | null;
}

/**
 * Holt eine ZH-Quelle nach Cache-Regel. Wirft mit klarer Ursache, statt einen
 * halben Datensatz zu liefern (§8: kein stiller Ausfall).
 */
export async function holeZhQuelle(
  registryUrl: string,
  kette: ZhNetzKette,
  modus: CacheModus = 'auto',
): Promise<ZhQuellDaten> {
  if (modus !== 'netz') {
    const treffer = leseCache(registryUrl);
    if (treffer) return treffer;
    if (modus === 'offline') {
      throw new Error(
        `ZH-PDF-Cache leer für ${registryUrl} (Modus offline). ` +
          `Cache füllen: npm run zh:cache -- --modus=netz`,
      );
    }
  }

  const regRes = await kette.hole(registryUrl);
  if (!regRes.ok) throw new Error(`ZH-Registry ${registryUrl}: HTTP ${regRes.status}`);
  const registryHtml = await regRes.text();

  const attachUrl = kette.leseAttachmentUrl(registryHtml);
  if (!attachUrl) throw new Error(`ZH ${registryUrl}: kein OpenAttachment-Link gefunden`);

  const redirRes = await kette.hole(attachUrl);
  if (!redirRes.ok) throw new Error(`ZH-Attachment ${attachUrl}: HTTP ${redirRes.status}`);
  const pdfUrl = kette.loeseRedirect(await redirRes.text(), attachUrl);
  if (!pdfUrl) throw new Error(`ZH ${attachUrl}: kein window.location-Redirect gefunden`);

  const pdfRes = await kette.hole(pdfUrl);
  if (!pdfRes.ok) throw new Error(`ZH-PDF ${pdfUrl}: HTTP ${pdfRes.status}`);
  const ct = pdfRes.headers.get('content-type') ?? '';
  const bytes = new Uint8Array(await pdfRes.arrayBuffer());
  // Content-Sonde (Skill-Regel «ein 200 kann eine HTML-Hülle sein»): Status
  // allein beweist nichts, die Magic Bytes «%P» tun es.
  if (!ct.includes('pdf') && !(bytes[0] === 0x25 && bytes[1] === 0x50)) {
    throw new Error(`ZH-PDF ${pdfUrl}: keine PDF-Antwort (content-type ${ct})`);
  }

  const sidecar: ZhCacheSidecar = {
    registryUrl,
    pdfUrl,
    etag: pdfRes.headers.get('etag'),
    lastModified: pdfRes.headers.get('last-modified'),
    abgerufen: new Date().toISOString(),
    bytesSha256: byteHash(bytes),
    bytes: bytes.length,
  };
  schreibeCache(registryUrl, { registryHtml, bytes, sidecar });
  return { registryHtml, bytes, sidecar, ausCache: false };
}
