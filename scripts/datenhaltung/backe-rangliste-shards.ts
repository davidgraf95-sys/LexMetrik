// scripts/datenhaltung/backe-rangliste-shards.ts
// QS-DATA E4 / W2·7-VZUI V1b — «Rangliste einbacken»: ersetzt build-time das `gewicht`
// in den `public/rechtsprechung/norm-index/<ERLASS>.json`-Shards durch die Massen-
// Rangliste `norm_rangliste` (195 342er-Korpus) — FAHRPLAN-VERZAHNUNG-UI §3 (V1b).
//
// PROVENIENZ NIE GEMISCHT (§1.7/§3): pro Erlass-Shard wird `gewicht` ENTWEDER vollständig
// aus E4 ersetzt (`gewichtQuelle:'e4'`) ODER vollständig beim Alt-Gewicht belassen
// (`gewichtQuelle:'alt'`). Ein Shard qualifiziert für 'e4' nur, wenn JEDER seiner Leitfälle
// MONOTON auflösbar ist:
//   (a) der kuratierte Entscheid hat eine masse.db-id (masseId, geteilte Brücke), UND
//   (b) `norm_rangliste` trägt für (erlass, artikel-token, id) eine Zeile, UND
//   (c) das E4-gewicht ≥ dem Alt-gewicht (grösserer Korpus ⇒ In-degree steigt, baue-
//       rangliste.ts-Kopf). Verletzt EIN Leitfall (a)–(c) — vintage-absent (Entscheid neuer
//       als der voilaj-Snapshot) oder erklärt-delta (voilaj-Recall-Lücke, masse < alt) —,
//       bleibt der GANZE Shard 'alt' (keine gemischte Liste, keine gewicht-Senkung).
//
// MEMBERSHIP BLEIBT KURATIERT: es werden NUR die bereits gezeigten Leitfälle neu gewichtet
// (die «heutigen Top-8» je Artikel, norm-index.json), keine Massen-Entscheide eingespielt
// (das ist V2/Serving). Der Reader zeigt dieselben Chips, nur E4-gewichtet + neu sortiert
// (vergleicheLeitfaelle, EINE Ordnung §5). Die kuratierte norm-index.json bleibt UNBERÜHRT
// (Alt-gewicht = Oracle-Baseline); die Shards sind die enriched Weiche-B-Projektion.
//
// Idempotent: liest norm-index.json + masse.db, schreibt die 19 Shards deterministisch neu.
// masse.db ist gitignored → LOKAL (nicht in der CI-`gate`-Kette). Ablauf:
//   masse-ingest → resolve-zitate → baue-rangliste → rangliste-oracle (GRÜN) → DIESES Skript.
// Die committeten Shards prüft danach `check:entscheide` (Membership + Monotonie, masse-frei).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { baueMasseKorpusBruecke, type RegisterEntscheid } from './masse-korpus-bruecke';
import { vergleicheLeitfaelle } from '../normtext/entscheide-schreiben';
import { normArtikelToken } from '../../src/lib/rechtsprechung/norm-index';
import type { LeitfallRef, LeitfallShard, NormEntscheidIndex } from '../../src/lib/rechtsprechung/norm-index';
import type { EntscheidManifest } from '../../src/lib/rechtsprechung/register';

const MASSE_DB = process.env.MASSE_DB ?? 'daten/masse.db';
const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');
const SHARD_DIR = join(PUB, 'norm-index');

function ladeJson<T>(p: string): T {
  return JSON.parse(readFileSync(join(ROOT, p), 'utf8')) as T;
}

interface ErlassBefund {
  erlass: string;
  gewichtQuelle: 'alt' | 'e4';
  grund?: string;        // warum 'alt' (erste blockierende Ursache)
  ersetzt: number;       // Leitfälle mit neuem gewicht (nur e4)
  erhoeht: number;       // davon gewicht gestiegen
  maxGewicht: number;    // grösstes E4-gewicht im Shard (nur e4)
}

function main(): number {
  const idx = ladeJson<NormEntscheidIndex>('public/rechtsprechung/norm-index.json');
  const register = ladeJson<EntscheidManifest>('public/rechtsprechung/register.json');
  const proArtikel = idx.proNormArtikel ?? {};

  const regByKey = new Map<string, RegisterEntscheid>();
  for (const e of register.entscheide) regByKey.set(e.key, { nummer: e.nummer, bgeReferenz: e.bgeReferenz, datum: e.datum });

  const db = new DatabaseSync(MASSE_DB);
  db.exec('PRAGMA cache_size = -524288');
  const { masseId } = baueMasseKorpusBruecke(db, regByKey);
  const gewichtStmt = db.prepare('SELECT gewicht FROM norm_rangliste WHERE erlass_key = ? AND artikel = ? AND entscheid_id = ?');

  /** E4-gewicht für (erlass, token, corpus-key) oder null (nicht monoton auflösbar). */
  function e4Gewicht(erlass: string, token: string, ref: LeitfallRef): number | null {
    const id = masseId(ref.key);
    if (!id) return null;                                            // vintage-absent
    const row = gewichtStmt.get(erlass, normArtikelToken(token), id) as { gewicht: number } | undefined;
    if (!row) return null;                                          // kein Rangliste-Mitglied
    if (row.gewicht < ref.gewicht) return null;                     // erklärt-delta (Recall-Lücke) → nicht senken
    return row.gewicht;
  }

  // proNormArtikel → je Erlass gruppieren (Token sortiert, refs unverändert = baueShards-Semantik).
  const proErlass = new Map<string, Array<{ token: string; refs: LeitfallRef[] }>>();
  for (const ak of Object.keys(proArtikel)) {
    const s = ak.indexOf('/');
    const erlass = ak.slice(0, s);
    const token = ak.slice(s + 1);
    (proErlass.get(erlass) ?? (proErlass.set(erlass, []), proErlass.get(erlass)!)).push({ token, refs: proArtikel[ak] });
  }

  const befunde: ErlassBefund[] = [];
  for (const erlass of [...proErlass.keys()].sort()) {
    const buckets = proErlass.get(erlass)!;

    // (1) Resolvability: JEDER Leitfall JEDES Artikels muss monoton auflösbar sein.
    let resolvable = true;
    let grund: string | undefined;
    for (const { token, refs } of buckets) {
      for (const r of refs) {
        if (e4Gewicht(erlass, token, r) === null) {
          resolvable = false;
          grund ??= `${erlass}/${token} · ${r.key} nicht monoton auflösbar (vintage-absent oder Recall-Lücke)`;
          break;
        }
      }
      if (!resolvable) break;
    }

    // (2) Shard bauen: Token sortiert (byte-stabil, §2). e4 → gewicht ersetzen + neu sortieren.
    const proArtikelShard: Record<string, LeitfallRef[]> = {};
    let ersetzt = 0; let erhoeht = 0; let maxGewicht = 0;
    for (const { token } of [...buckets].sort((a, b) => (a.token < b.token ? -1 : a.token > b.token ? 1 : 0))) {
      const refs = proArtikel[`${erlass}/${token}`];
      if (resolvable) {
        const neu = refs.map((r) => {
          const g = e4Gewicht(erlass, token, r)!;
          ersetzt++; if (g > r.gewicht) erhoeht++; if (g > maxGewicht) maxGewicht = g;
          return { ...r, gewicht: g };
        });
        neu.sort(vergleicheLeitfaelle);
        proArtikelShard[token] = neu;
      } else {
        proArtikelShard[token] = refs;                              // Alt-gewicht unverändert
      }
    }

    const shard: LeitfallShard = { erzeugt: idx.erzeugt, erlass, gewichtQuelle: resolvable ? 'e4' : 'alt', proArtikel: proArtikelShard };
    writeFileSync(join(SHARD_DIR, `${erlass}.json`), JSON.stringify(shard, null, 2) + '\n', 'utf8');
    befunde.push({ erlass, gewichtQuelle: resolvable ? 'e4' : 'alt', grund, ersetzt, erhoeht, maxGewicht });
  }
  db.close();

  // Verwaiste Shards (Erlass ohne proNormArtikel-Treffer) dürfen nicht existieren.
  const aufPlatte = new Set(readdirSync(SHARD_DIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)));
  for (const b of befunde) aufPlatte.delete(b.erlass);
  for (const uebrig of aufPlatte) console.warn(`  WARN: verwaister Shard ${uebrig}.json (kein norm-index-Treffer)`);

  const e4 = befunde.filter((b) => b.gewichtQuelle === 'e4');
  const alt = befunde.filter((b) => b.gewichtQuelle === 'alt');
  console.log(`\nbacke-rangliste-shards (${MASSE_DB}) — ${befunde.length} Shards`);
  console.log(`  gewichtQuelle 'e4':  ${e4.length}  (${e4.map((b) => b.erlass).join(', ') || '—'})`);
  console.log(`  gewichtQuelle 'alt': ${alt.length}  (${alt.map((b) => b.erlass).join(', ') || '—'})`);
  console.log('\n  e4-Shards (Leitfälle ersetzt / davon erhöht / max-gewicht):');
  for (const b of e4) console.log(`    ${b.erlass.padEnd(8)} ${String(b.ersetzt).padStart(4)} ersetzt · ${String(b.erhoeht).padStart(4)} erhöht · max ${b.maxGewicht}`);
  console.log('\n  alt-Shards (erste blockierende Ursache):');
  for (const b of alt) console.log(`    ${b.erlass.padEnd(8)} ${b.grund ?? '?'}`);
  return 0;
}

process.exit(main());
