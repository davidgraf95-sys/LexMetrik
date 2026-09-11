// scripts/entstehung/deckung.ts
// E2 «Entstehung am Artikel» (§11.6 (4)): Diagnose-Tabelle JE ERLASS — welcher Anteil
// der oc-Fundstellen aus den Artikel-Fussnoten taucht in der Fedlex-Änderungsliste auf?
//
// WARUM DIAGNOSE STATT TEILMENGEN-TOR (R1-Korrektur, §11.3): die beiden Quellen decken
// verschiedene Zeiträume — die Fussnoten reichen bis in die 1950er, die SPARQL-Liste ist
// erst ab ~2000 verlässlich. Eine Teilmengen-Zusicherung wäre deshalb dauerrot und würde
// abgeschaltet; gemessen liegt die Quote je Erlass zwischen 12,6 % und 40 %. Was WIRKLICH
// etwas bedeutet, ist der RÜCKGANG je Erlass gegenüber dem gebuchten Stand — er heisst,
// dass eine Extraktion Fundstellen verloren hat.
//
// Beide Eingaben sind COMMITTETE Artefakte, die Messung ist damit vollständig offline
// (Kritik C11: ein Offline-Tor kann keinen PR-Trailer lesen — der gebuchte Stand lebt
// in bibliothek/register/entstehung-deckung.json).
//
// §2: rein und deterministisch, kein Netz, kein Date.now.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const HISTORIE_DIR = 'public/normtext/historie';
export const REVISIONEN_DIR = 'public/normtext/revisionen';
export const DECKUNG_REGISTER_PFAD = 'bibliothek/register/entstehung-deckung.json';

export interface DeckungErlass {
  /** Anteil 0..1, auf vier Nachkommastellen gerundet (byte-stabil). */
  quote: number;
  /** Zahl distinkter oc-Fundstellen in den Artikel-Fussnoten. */
  ocFussnoten: number;
  /** davon in der Fedlex-Änderungsliste des Erlasses vorhanden. */
  ocGetroffen: number;
  /** Buchungsdatum ISO. */
  datum: string;
  /** Benannter Grund — Pflicht, wenn der gebuchte Stand gesenkt wird (§11.6 (4), Kritik A7). */
  grund?: string;
}

export interface DeckungRegister {
  erzeugt: string;
  erlasse: Record<string, DeckungErlass>;
}

/** Byte-deterministische Serialisierung (Erlass-Keys sortiert). */
export function serialisiereDeckung(r: DeckungRegister): string {
  const erlasse: Record<string, DeckungErlass> = {};
  for (const k of Object.keys(r.erlasse).sort()) erlasse[k] = r.erlasse[k];
  return JSON.stringify({ erzeugt: r.erzeugt, erlasse }, null, 2) + '\n';
}

interface HistorieShard {
  erlass: string;
  artikel: Record<string, { ereignisse?: { quellen?: { url?: string }[] }[] }>;
}
interface RevisionShard { revisionen?: { ocUri?: string }[] }

/** Distinkte oc-ELIs aus den Artikel-Fussnoten eines Historie-Shards (rein). */
export function ocAusHistorie(shard: HistorieShard): Set<string> {
  const out = new Set<string>();
  for (const a of Object.values(shard.artikel ?? {})) {
    for (const e of a.ereignisse ?? []) {
      for (const q of e.quellen ?? []) {
        if (q.url && /\/eli\/oc\//.test(q.url)) out.add(q.url.replace(/\/$/, ''));
      }
    }
  }
  return out;
}

/** Distinkte oc-ELIs aus der Fedlex-Änderungsliste eines Erlasses (rein). */
export function ocAusRevisionen(shard: RevisionShard): Set<string> {
  const out = new Set<string>();
  for (const r of shard.revisionen ?? []) if (r.ocUri) out.add(r.ocUri.replace(/\/$/, ''));
  return out;
}

export interface DeckungMessung { erlass: string; ocFussnoten: number; ocGetroffen: number; quote: number }

/** Misst die Deckung je Erlass über die committeten Shards (rein bis auf Datei-Lesen). */
export function misseDeckung(historieDir = HISTORIE_DIR, revisionenDir = REVISIONEN_DIR): DeckungMessung[] {
  if (!existsSync(historieDir)) return [];
  const out: DeckungMessung[] = [];
  for (const f of readdirSync(historieDir).sort()) {
    if (!f.endsWith('.json')) continue;
    const key = f.slice(0, -'.json'.length);
    const hist = JSON.parse(readFileSync(join(historieDir, f), 'utf8')) as HistorieShard;
    const fuss = ocAusHistorie(hist);
    if (fuss.size === 0) continue; // ohne oc-Fundstelle ist die Quote nicht definiert
    const revPfad = join(revisionenDir, f);
    const rev = existsSync(revPfad)
      ? ocAusRevisionen(JSON.parse(readFileSync(revPfad, 'utf8')) as RevisionShard)
      : new Set<string>();
    let treffer = 0;
    for (const oc of fuss) if (rev.has(oc)) treffer += 1;
    out.push({
      erlass: key,
      ocFussnoten: fuss.size,
      ocGetroffen: treffer,
      quote: Math.round((treffer / fuss.size) * 10000) / 10000,
    });
  }
  return out;
}
