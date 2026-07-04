// scripts/materialien/soft-law-snapshot.ts
// E6a Stufe 1 · Etappe M2 (FAHRPLAN-MATERIALIEN-VERZAHNUNG §3): Orchestrator des Soft-Law-
// Snapshots. Fährt den (browserlosen, höflichen) Adapter EINER Quelle, materialisiert das
// Ergebnis in die lokale, wegwerfbare `daten/soft-law.db` (soft_law + norm_referenzen +
// quell_snapshot) UND hängt den committeten Zustandsträger `bibliothek/register/soft-law-
// zustand.jsonl` APPEND-ONLY fort: 1 Lauf-Kopfzeile je Quelle + 1 dok-Zeile je Zustands-
// änderung (NEU / GEÄNDERT / ENTLISTET). Kein Date.now (§2): `--datum` Pflicht.
//
// Aufruf: npm run materialien:snapshot -- --datum=YYYY-MM-DD --quelle=seco
// Danach: npm run materialien -- --datum=YYYY-MM-DD  (deterministische Projektion, separater Schritt).
//
// Weiche C (§2.3): der Voll-Rebuild speist sich aus (Zustands-Manifest + Snapshot), nie aus der
// Live-Quelle allein — die Quelle löscht Entlistetes. Die DB ist lokal (gitignored); der
// committete Beleg ist das JSONL.

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, unlinkSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { DatabaseSync } from 'node:sqlite';
import { frischesSchema } from '../datenhaltung/schema.ts';
import { baueKorpusInfo, seedSoftLawDb, SOFT_LAW_DB } from './soft-law-projektion.ts';
import {
  ladeZustand, serialisiereLauf, serialisiereDok, ZUSTAND_PFAD,
  type DokZeile, type SoftLawQuelle,
} from './soft-law-zustand.ts';
import { crawleSeco, SECO_QUELLEN } from './adapter-seco.ts';
import { crawleEdoeb, EDOEB_ID_PREFIX } from './adapter-edoeb.ts';
import { crawleEstvKs, ESTV_KS_ID_PREFIXE } from './adapter-estv-ks.ts';
import { crawleEstvMwst } from './adapter-estv-mwst.ts';
import { ESTV_MWST_ID_PREFIX } from './estv-mwst-ids.ts';
import type { SoftLawDok, NormRefKante, AdapterErgebnis } from './adapter-typen.ts';

// ── CLI ────────────────────────────────────────────────────────────────────────
function arg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}
const datum = arg('datum');
const quelleArg = arg('quelle');
if (!datum || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
  console.error('soft-law-snapshot: --datum=YYYY-MM-DD erforderlich (§2, kein Date.now).');
  process.exit(1);
}
const UNTERSTUETZT = new Set<SoftLawQuelle>(['seco', 'edoeb', 'estv-ks', 'estv-mwst']);
if (!quelleArg || !UNTERSTUETZT.has(quelleArg as SoftLawQuelle)) {
  console.error(`soft-law-snapshot: --quelle=${[...UNTERSTUETZT].join('|')} erforderlich. (erhalten: ${quelleArg ?? '—'})`);
  process.exit(1);
}
const quelle: SoftLawQuelle = quelleArg as SoftLawQuelle;

// ── ID-Präfixe je Quelle (Entlistungs-Scope) ───────────────────────────────────
const SECO_PREFIXE = SECO_QUELLEN.map((q) => q.idPrefix);
function gehoertZurQuelle(id: string): boolean {
  if (quelle === 'edoeb') return id.startsWith(EDOEB_ID_PREFIX);
  if (quelle === 'estv-ks') return ESTV_KS_ID_PREFIXE.some((p) => id.startsWith(p));
  // 'ESTV-MWST-' ist disjunkt zu den ESTV-KS-Präfixen (ESTV-KS-/ESTV-MITTEILUNG-/ESTV-MB-).
  if (quelle === 'estv-mwst') return id.startsWith(ESTV_MWST_ID_PREFIX);
  return SECO_PREFIXE.some((p) => id.startsWith(p));
}

/** Fährt den Adapter der gewählten Quelle (Count-/Vollständigkeits-Gate werfen bei ROT → §8). */
async function crawle(substrate: { tag: string; html: string }[]): Promise<AdapterErgebnis> {
  if (quelle === 'edoeb') {
    return crawleEdoeb({ abgerufen: datum!, substrat: (tag, html) => substrate.push({ tag, html }) });
  }
  if (quelle === 'estv-ks') {
    return crawleEstvKs({ abgerufen: datum!, substrat: (tag, html) => substrate.push({ tag, html }) });
  }
  if (quelle === 'estv-mwst') {
    // robots-Freigabe David 4.7.2026 (§8): Concurrency 1, Delay, identifizierender UA — im Adapter fest.
    return crawleEstvMwst({
      abgerufen: datum!,
      substrat: (tag, html) => substrate.push({ tag, html }),
      log: (z) => console.log(z),
    });
  }
  const korpus = baueKorpusInfo();
  const korpusFuer = (erlassKey: string): Iterable<string> => {
    const set = korpus.artikelSet(erlassKey);
    if (set === null) throw new Error(`soft-law-snapshot: kein Normtext-Korpus für ${erlassKey} (public/normtext/bund/${erlassKey}.json fehlt).`);
    return set;
  };
  return crawleSeco(korpusFuer, { abgerufen: datum!, substrat: (tag, html) => substrate.push({ tag, html }) });
}

/** Lokale Ablage des rohen Adapter-Ergebnisses (store-raw VOR load): ein Ingest-/Load-Bug darf
 *  nie wieder einen (langen, höflichen) Crawl kosten — Re-Ingest via --aus-ergebnis. gitignored
 *  (unter daten/), wegwerfbar wie die DB. Live-Lektion 4.7.2026 (ESTV-MWST: UNIQUE-Kollision im
 *  Load NACH 3118-Request-Crawl, Parse-Ergebnis war weg). */
function ergebnisPfad(): string {
  return `daten/soft-law-ergebnis-${quelle}.json`;
}

async function main(): Promise<void> {
  // Höflicher Crawl der gewählten Quelle — oder Re-Ingest aus der persistierten Roh-Ablage.
  let substrate: { tag: string; html: string }[] = [];
  let ergebnis: AdapterErgebnis;
  if (process.argv.includes('--aus-ergebnis')) {
    if (!existsSync(ergebnisPfad())) {
      console.error(`soft-law-snapshot: --aus-ergebnis, aber ${ergebnisPfad()} fehlt (zuerst ein Crawl-Lauf).`);
      process.exit(1);
    }
    const roh = JSON.parse(readFileSync(ergebnisPfad(), 'utf8')) as { ergebnis: AdapterErgebnis; substrate: { tag: string; html: string }[] };
    ergebnis = roh.ergebnis;
    substrate = roh.substrate;
    console.log(`soft-law-snapshot (${quelle}, --datum=${datum}): Re-Ingest aus ${ergebnisPfad()} (KEIN Crawl).`);
  } else {
    console.log(`soft-law-snapshot (${quelle}, --datum=${datum}): Crawl der Hub-Seiten …`);
    ergebnis = await crawle(substrate);
    // store-raw VOR load: Parse-Ergebnis + Substrat zuerst auf Platte.
    mkdirSync(dirname(ergebnisPfad()), { recursive: true });
    writeFileSync(ergebnisPfad(), JSON.stringify({ ergebnis, substrate }), 'utf8');
    console.log(`  Roh-Ablage: ${ergebnisPfad()} geschrieben (Re-Ingest via --aus-ergebnis).`);
  }
  console.log(`  Adapter: ${ergebnis.dokumente.length} Dokumente · ${ergebnis.kanten.length} Kanten · indexSha ${ergebnis.indexSha}.`);

  // 3) Lokale DB frisch aufbauen (wegwerfbar; frisches Schema je Lauf, §2.2).
  baueDb(ergebnis.dokumente, ergebnis.kanten, substrate, datum);

  // 4) Zustands-Manifest fortschreiben (append-only).
  const neueZeilen = berechneZustandsAenderungen(ergebnis.dokumente, datum);
  const laufKopf = serialisiereLauf({ typ: 'lauf', quelle, abgerufen: datum, indexSha: ergebnis.indexSha });
  mkdirSync(dirname(ZUSTAND_PFAD), { recursive: true });
  const zeilen = [laufKopf, ...neueZeilen.map(serialisiereDok)];
  const bloc = zeilen.join('\n') + '\n';
  if (existsSync(ZUSTAND_PFAD) && readFileSync(ZUSTAND_PFAD, 'utf8').length > 0) {
    appendFileSync(ZUSTAND_PFAD, bloc, 'utf8');
  } else {
    writeFileSync(ZUSTAND_PFAD, bloc, 'utf8');
  }

  const neu = neueZeilen.filter((z) => z.status === 'gelistet').length;
  const entlistet = neueZeilen.filter((z) => z.status === 'entlistet').length;
  console.log(
    `soft-law-snapshot fertig: Manifest + ${neueZeilen.length} Zustandsänderung(en) ` +
      `(${neu} NEU/GEÄNDERT · ${entlistet} ENTLISTET) angehängt. ` +
      `Nächster Schritt: npm run materialien -- --datum=${datum}`,
  );
}

// ── DB-Aufbau (lokal) ───────────────────────────────────────────────────────────
function baueDb(dokumente: SoftLawDok[], kanten: NormRefKante[], substrate: { tag: string; html: string }[], abgerufen: string): void {
  mkdirSync(dirname(SOFT_LAW_DB), { recursive: true });
  if (existsSync(SOFT_LAW_DB)) unlinkSync(SOFT_LAW_DB);
  const db = new DatabaseSync(SOFT_LAW_DB);
  db.exec('PRAGMA journal_mode = MEMORY;');
  frischesSchema(db, 'soft-law');

  // Weiche C (§2.3): DB zuerst aus den committeten Trägern seeden (alle Quellen), dann die Rows der
  // AKTUELLEN Quelle löschen und frisch überlagern — so gehen die Kanten der übrigen Quellen nicht
  // verloren (sonst orphant die Projektion deren committete Shards).
  seedSoftLawDb(db);
  loescheAktuelleQuelle(db);
  function loescheAktuelleQuelle(dbi: typeof db): void {
    // Scope über BEIDE Tabellen unabhängig (Härtung 4.7.2026): der Seed speist norm_referenzen aus
    // den committeten Shards — eine Kante ohne soft_law-Zeile (inkonsistenter Zwischenstand) würde
    // sonst überleben und beim frischen Insert die UNIQUE-Constraint reissen.
    const dokIds = (dbi.prepare('SELECT id FROM soft_law').all() as unknown as { id: string }[])
      .map((r) => r.id).filter(gehoertZurQuelle);
    const kantenIds = (dbi.prepare('SELECT DISTINCT quelldok_id AS id FROM norm_referenzen').all() as unknown as { id: string }[])
      .map((r) => r.id).filter(gehoertZurQuelle);
    const delDok = dbi.prepare('DELETE FROM soft_law WHERE id = ?');
    const delKante = dbi.prepare('DELETE FROM norm_referenzen WHERE quelldok_id = ?');
    for (const id of new Set([...dokIds, ...kantenIds])) { delDok.run(id); delKante.run(id); }
  }

  const insDok = db.prepare(
    `INSERT INTO soft_law (id, kategorie, doktyp, behoerde, titel, fundstelle, stand, quelle_url, abgerufen, sha, status, entlistet_am, drift_token, quell_ids, stand_quelle)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  );
  for (const d of dokumente) {
    insDok.run(
      d.id, 'verwaltungsverordnung', d.doktyp, d.behoerde, d.titel, d.nummer, d.stand, d.quelle_url,
      d.abgerufen, d.sha, 'gelistet', null, d.drift_token, JSON.stringify(d.quell_ids), d.stand_quelle,
    );
  }
  const insKante = db.prepare(
    `INSERT INTO norm_referenzen (quelldok_typ, quelldok_id, erlass_key, artikel, zitat_key, roh_zitat, konfidenz, quelle, fundstelle, fundstelle_url, stand, abgerufen)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
  );
  for (const k of kanten) {
    insKante.run('soft_law', k.quelldok_id, k.erlass_key, k.artikel, k.zitat_key, k.roh_zitat, k.konfidenz, k.quelle, k.fundstelle, k.fundstelle_url, k.stand, k.abgerufen);
  }
  const insSnap = db.prepare('INSERT INTO quell_snapshot (quelle, abgerufen, sha, inhalt) VALUES (?,?,?,?)');
  for (const s of substrate) {
    const sha = createHash('sha256').update(s.html, 'utf8').digest('hex');
    insSnap.run(`${quelle}:${s.tag}`, abgerufen, sha, gzipSync(Buffer.from(s.html, 'utf8')));
  }
  db.close();
}

// ── Zustandsänderungen berechnen (append-only, §2.5) ───────────────────────────
function berechneZustandsAenderungen(dokumente: SoftLawDok[], datum: string): DokZeile[] {
  const zustand = ladeZustand();
  const heutigeIds = new Set(dokumente.map((d) => d.id));
  const out: DokZeile[] = [];

  // NEU / GEÄNDERT: neue id oder drift_token weicht vom letzten Zustand ab.
  for (const d of dokumente) {
    const vor = zustand.letzterZustand.get(d.id);
    const geaendert = !vor || vor.status !== 'gelistet' || vor.drift_token !== d.drift_token;
    if (geaendert) out.push(dokZeileVon(d));
  }

  // ENTLISTET: früher gelistetes SECO-Dokument, das der aktuelle Crawl nicht mehr liefert.
  // Nur zulässig, weil die Count-/Vollständigkeits-Gates dieses Laufs grün sind (§2.5) —
  // crawleSeco wirft sonst; wir kämen hier gar nicht an.
  for (const [id, z] of zustand.letzterZustand) {
    if (z.status !== 'gelistet' || !gehoertZurQuelle(id)) continue;
    if (!heutigeIds.has(id)) {
      out.push({ ...z, status: 'entlistet', entlistet_am: datum });
    }
  }
  return out;
}

/** SoftLawDok → gelistete DokZeile (Karten-Felder vollständig, §0/B6). */
function dokZeileVon(d: SoftLawDok): DokZeile {
  return {
    typ: 'dok',
    id: d.id,
    status: 'gelistet',
    entlistet_am: null,
    drift_token: d.drift_token,
    quell_ids: d.quell_ids,
    sha: d.sha,
    stand: d.stand,
    stand_quelle: d.stand_quelle,
    quelle_url: d.quelle_url,
    abgerufen: d.abgerufen,
    titel: d.titel,
    behoerde: d.behoerde,
    doktyp: d.doktyp,
    nummer: d.nummer,
    rechtsgebiet: d.rechtsgebiet,
    sprache: d.sprache,
    rang: d.rang,
    normKeys: d.normKeys,
    hinweis: d.hinweis,
  };
}

main().catch((e) => {
  console.error(`soft-law-snapshot ROT: ${(e as Error).message}`);
  process.exit(1);
});
