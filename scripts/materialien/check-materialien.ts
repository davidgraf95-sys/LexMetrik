// ─── Tor: Integrität des Materialien-Korpus (offline, in `gate`) ────────────────
//
// E6a Stufe 1 (FAHRPLAN-MATERIALIEN-VERZAHNUNG §4): NEUBAU des früheren Hard-Asserts
// «Manifest == MATERIAL_REGISTER» zum MERGE-MODELL (§0/B9). register.json ist jetzt eine
// Projektion aus (kuratiertem MATERIAL_REGISTER + DB-Dokumenten); Kanten liegen in
// public/materialien/kanten/**. Das Tor prüft offline (daten/ existiert in CI NICHT):
//
//  · Register-Grundchecks (Key-Format, quelleUrl http(s), stand ISO + nicht Zukunft,
//    normKeys→ERLASS_REGISTER, status-Warnung) — wie bisher.
//  · Merge-Modell: jedes register.json-Element ist kuratiert ODER gelistetes DB-Dokument;
//    jede manifest-gelistete id genau einmal, keine entlistete id in register.json/Shards.
//  · Dreieck + 2-Lauf-Determinismus: die Projektions-Funktionen (aus soft-law-projektion.ts,
//    NICHT dupliziert) zweimal in-memory == committete Dateien (register.json byte-gleich,
//    Shards byte-gleich, keine Orphans).
//  · Shard-/Bucket-Budget ≤ 300 KB; erlass/artikelscharfe Kanten gegen ERLASS_REGISTER +
//    Korpus; Revisions-Cutoff erzwungen; quelle ∈ Enum; dok-Verweis ∈ register.json;
//    Kopf-Buckets vollständig, keine verwaisten Bucket-Dateien.
//  · §7 a–d je DB-Dokument (stand/quelle_url/drift_token nicht-leer; abgerufen = Hygiene,
//    KEIN §7-Surrogat; (c) sichtbarer UI-Live-Link = M1-DoD per Playwright, offline nicht prüfbar).
//  · Key-Abgleich/Dubletten (§2.6, alle 4 Quellen), Behörde+Doktyp registriert (§0/B6),
//    Append-only + Entlistungs-Quote ≤ 10 %/Lauf (§2.5), DB-Grössenbudget (§2.2).
//  · Wortfeld-Tor (§0/A7): keine AFFIRMATIVE «geprüft/gegengeprüft/verifiziert» in EIGENEN
//    Nutzertexten; Negationen («nicht/noch nicht/ungeprüft») sind ehrliche §8-Offenlegungen
//    und ERLAUBT. Amtliche `titel` in register.json = Zitat-Felder (ausgenommen).
// Harte Verstösse → exit 1.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { MATERIAL_REGISTER, BEHOERDEN, DOKTYPEN } from '../../src/lib/materialien/register.ts';
// Botschaften (Paket 2, W2·6) sind kuratiert-äquivalent (generiert, nicht im in-Bundle
// MATERIAL_REGISTER): ALLE_MATERIALIEN = MATERIAL_REGISTER + BOTSCHAFTEN. Sie durchlaufen
// dieselben Register-Grundchecks + gelten im Merge-Modell als «kuratiert» (nicht DB-Dok).
import { ALLE_MATERIALIEN } from './material-manifest.ts';
import { ERLASS_REGISTER } from '../../src/lib/normtext/register.ts';
import type { BrowseMaterial, MaterialManifest } from '../../src/lib/materialien/typen.ts';
import { ladeZustand, type DokZeile, type SoftLawQuelle, type ZustandZeile } from './soft-law-zustand.ts';
import { braucheDowngrade } from './revisions-cutoff.ts';
import {
  projiziereRegister,
  projiziereShards,
  baueKorpusInfo,
  ladeKantenAusDb,
  dbDokAusZustand,
  REGISTER_PFAD,
  KANTEN_DIR,
  SOFT_LAW_DB,
  SHARD_BYTE_LIMIT,
  type NormRefRow,
  type DokMeta,
  type ShardDatei,
} from './soft-law-projektion.ts';
import { wortfeldTreffer, wortfeldImQuellcode } from './wortfeld.ts';

// ══ Gate ════════════════════════════════════════════════════════════════════════
const QUELLEN_ENUM = new Set(['amtlich', 'kuratiert', 'maschinell']);
const KEY_UNSICHER = /[\\/#?\s]/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const DB_BUDGET_MB = 50;
const ENTLISTUNG_QUOTE = 0.1;

const fehler: string[] = [];
const warn: string[] = [];

function collectFiles(dir: string, pred: (p: string) => boolean, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) collectFiles(p, pred, out);
    else if (pred(p)) out.push(p);
  }
  return out;
}

function main(): void {
  const behoerdeIds = new Set(BEHOERDEN.map((b) => b.id));
  const doktypIds = new Set(DOKTYPEN.map((d) => d.id));
  const erlassKeys = new Set(ERLASS_REGISTER.map((e) => e.key));
  const kuratiertKeys = new Set(ALLE_MATERIALIEN.map((r) => r.key));
  const korpus = baueKorpusInfo();

  const datumArg = process.argv.find((a) => a.startsWith('--datum='));
  const heute = datumArg?.slice('--datum='.length);

  // ── 1. Register-Grundchecks (kuratiert + generierte Botschaften) ──────────────
  const gesehen = new Set<string>();
  for (const r of ALLE_MATERIALIEN) {
    if (gesehen.has(r.key)) fehler.push(`Doppelter key: ${r.key}`);
    gesehen.add(r.key);
    if (KEY_UNSICHER.test(r.key)) fehler.push(`Key pfad-/URL-unsicher: ${JSON.stringify(r.key)}`);
    if (!/^https?:\/\//.test(r.quelleUrl)) fehler.push(`${r.key}: quelleUrl ist keine http(s)-URL (§7c): ${r.quelleUrl}`);
    if (!ISO.test(r.stand)) fehler.push(`${r.key}: stand kein ISO-Datum: ${r.stand}`);
    else if (heute && r.stand > heute) fehler.push(`${r.key}: stand ${r.stand} liegt in der Zukunft (> ${heute}).`);
    for (const nk of r.normKeys ?? []) {
      if (!erlassKeys.has(nk)) fehler.push(`${r.key}: normKeys verweist auf unbekannten Erlass ${nk} (toter Cross-Link, §8).`);
    }
    if (r.status !== 'nur-live-link') {
      warn.push(`${r.key}: status '${r.status}' — pdf-embed/volltext brauchen gehosteten Inhalt + Drift-Tor (§7).`);
    }
    // Botschaften (Paket 2): Paket-5-Join-Felder + Provenienz-Integrität (Finding 1, P0).
    if (r.behoerde === 'BR') {
      if (r.doktyp !== 'botschaft') fehler.push(`${r.key}: BR-Eintrag mit doktyp '${r.doktyp}' ≠ 'botschaft'.`);
      if (!r.normKeys || r.normKeys.length === 0) fehler.push(`${r.key}: Botschaft ohne normKeys (verwaist, §8).`);
      if (!r.projEli) fehler.push(`${r.key}: Botschaft ohne projEli — Paket-5-Join bräche (Finding 1).`);
      if (r.botschaftDate !== r.stand) fehler.push(`${r.key}: botschaftDate (${r.botschaftDate}) ≠ stand (${r.stand}).`);
      if (!/^https:\/\/www\.fedlex\.admin\.ch\/eli\/fga\//.test(r.quelleUrl)) {
        fehler.push(`${r.key}: quelleUrl ist kein Fedlex-fga-Live-Link: ${r.quelleUrl}.`);
      }
    }
  }

  // ── 2. Zustands-Manifest laden (Validator wirft bei Verstoss, §2.3) ───────────
  let zustand;
  try {
    zustand = ladeZustand();
  } catch (e) {
    fehler.push(`Zustands-Manifest ungültig: ${(e as Error).message}`);
    ausgabe(0, 0, 0, 0, 0);
    return;
  }
  const gelistet = new Map<string, DokZeile>();
  const entlistetIds = new Set<string>();
  for (const [id, z] of zustand.letzterZustand) {
    // KEY_UNSICHER-Check auch auf JSONL-/DB-IDs (§0-Härtung 4b, Pfad-Sicherheit der Shard-Dateien).
    if (KEY_UNSICHER.test(id)) fehler.push(`Zustands-Manifest: id pfad-/URL-unsicher: ${JSON.stringify(id)}.`);
    if (z.status === 'gelistet') gelistet.set(id, z);
    else entlistetIds.add(id);
  }

  // ── 3. dbDocs IMMER aus dem Zustands-Manifest (CI-Rebuild-Fix, §0/B2) ──────────
  // register.json-Byte-Gleichheit läuft so auch in CI (keine DB nötig). Die DB dient NUR der
  // lokalen Shard-Reprojektion (kanten/dokMeta); in CI werden die committeten Shards direkt
  // validiert (pruefeShardDatei + Dok-Mitgliedschaft + Plausibilität), nicht byte-reprojiziert.
  const dbDocs: BrowseMaterial[] = dbDokAusZustand(zustand);
  const dbExists = existsSync(SOFT_LAW_DB);
  let kanten: NormRefRow[] = [];
  let dokMeta = new Map<string, DokMeta>();
  if (dbExists) {
    const mb = statSync(SOFT_LAW_DB).size / (1024 * 1024);
    if (mb > DB_BUDGET_MB) warn.push(`${SOFT_LAW_DB} ist ${mb.toFixed(1)} MB (> ${DB_BUDGET_MB} MB Warnschwelle, §2.2).`);
    const db = new DatabaseSync(SOFT_LAW_DB);
    ({ kanten, dokMeta } = ladeKantenAusDb(db));
    db.close();
  }

  // ── 4. register.json einlesen + Dreieck/Determinismus (byte-gleich) ───────────
  if (!existsSync(REGISTER_PFAD)) {
    fehler.push(`${REGISTER_PFAD} fehlt — 'npm run materialien -- --datum=$(date +%F)' ausführen und committen.`);
    ausgabe(0, 0, 0, 0, 0);
    return;
  }
  const registerBytes = readFileSync(REGISTER_PFAD, 'utf8');
  const register = JSON.parse(registerBytes) as MaterialManifest;
  const registerKeys = new Set(register.materialien.map((m) => m.key));

  const frisch1 = projiziereRegister(register.erzeugt, dbDocs);
  const frisch2 = projiziereRegister(register.erzeugt, dbDocs);
  if (JSON.stringify(frisch1) !== JSON.stringify(frisch2)) fehler.push('register-Projektion nicht deterministisch (2-Lauf-Diff).');
  if (registerBytes !== JSON.stringify(frisch1, null, 2) + '\n') {
    fehler.push(`${REGISTER_PFAD} weicht von der frischen Projektion ab — nur über den Generator pflegen (§2). 'npm run materialien -- --datum=$(date +%F)'.`);
  }

  // Shard-Byte-Reprojektion nur lokal-mit-DB; in CI (keine DB) direkt validieren (§0/M0-Vermerk).
  let downgradesN = 0;
  if (dbExists) {
    const shard1 = projiziereShards(register.erzeugt, kanten, dokMeta, korpus);
    const shard2 = projiziereShards(register.erzeugt, kanten, dokMeta, korpus);
    if (JSON.stringify(shard1.dateien) !== JSON.stringify(shard2.dateien)) fehler.push('Shard-Projektion nicht deterministisch (2-Lauf-Diff).');
    downgradesN = shard1.downgrades.length;
    pruefeShardDrift(shard1.dateien, gelistet);
  } else {
    pruefeCommittedShards(gelistet);
  }

  // ── 5. Merge-Modell: jedes register-Element kuratiert ODER gelistetes DB-Dok ──
  for (const m of register.materialien) {
    if (!behoerdeIds.has(m.behoerde)) fehler.push(`${m.key}: Behörde '${m.behoerde}' nicht registriert (§0/B6, stiller Browse-Drop).`);
    if (!doktypIds.has(m.doktyp)) fehler.push(`${m.key}: Doktyp '${m.doktyp}' nicht registriert (§0/B6, stiller Browse-Drop).`);
    const istKuratiert = kuratiertKeys.has(m.key);
    const istDbGelistet = gelistet.has(m.key);
    if (!istKuratiert && !istDbGelistet) {
      fehler.push(`${m.key}: register.json-Eintrag ist weder kuratiert (MATERIAL_REGISTER) noch gelistetes DB-Dokument (Zustands-Manifest).`);
    }
    if (istKuratiert && istDbGelistet) {
      fehler.push(`${m.key}: sowohl kuratiert als auch DB-Dokument — Key-Kollision (§2.6, bestehender Key gewinnt).`);
    }
    // Wortfeld nur in EIGENEN Feldern (hinweis) — amtliche titel sind Zitat-Felder (ausgenommen).
    if (m.hinweis) {
      for (const t of wortfeldTreffer(m.hinweis)) {
        fehler.push(`${m.key}: hinweis enthält affirmatives «${t.treffer}» (§0/A7): «${t.kontext}».`);
      }
    }
  }
  // jede gelistete id genau EINMAL in register.json; keine entlistete id in register.json
  for (const id of gelistet.keys()) {
    if (!registerKeys.has(id)) fehler.push(`Zustands-Manifest listet '${id}' (gelistet), fehlt aber in register.json.`);
  }
  for (const id of entlistetIds) {
    if (registerKeys.has(id)) fehler.push(`Entlistetes Dokument '${id}' erscheint in register.json (muss raus, §2.5).`);
  }

  // ── 6. §7 a–d + Key-Abgleich/Dubletten je gelistetem DB-Dokument ──────────────
  for (const [id, z] of gelistet) {
    if (!z.stand) fehler.push(`${id}: §7(a) stand leer.`);
    if (!z.quelle_url) fehler.push(`${id}: §7(b) quelle_url leer.`);
    if (!z.drift_token) fehler.push(`${id}: §7(d) drift_token leer (Default-Schlupf, §0/A8).`);
    if (!z.abgerufen) fehler.push(`${id}: abgerufen leer (Hygiene — KEIN §7-Surrogat).`);
    // Dubletten (§2.6): quelle_url ODER (behoerde+nummer) deckungsgleich mit MATERIAL_REGISTER ⇒
    // der DB-Eintrag MUSS den bestehenden Key tragen (bestehender Key gewinnt).
    const regEintrag = register.materialien.find((m) => m.key === id);
    for (const k of MATERIAL_REGISTER) {
      if (k.key === id) continue;
      const urlMatch = k.quelleUrl === z.quelle_url;
      const nummerMatch = !!regEintrag && !!regEintrag.nummer && k.behoerde === regEintrag.behoerde && k.nummer === regEintrag.nummer;
      if (urlMatch || nummerMatch) {
        fehler.push(`Dublette (§2.6): DB-Dokument '${id}' deckt sich mit MATERIAL_REGISTER '${k.key}' (${urlMatch ? 'quelle_url' : 'behoerde+nummer'}) — bestehenden Key übernehmen.`);
      }
    }
  }

  // ── 7. Append-only + Entlistungs-Quote je Lauf-Gruppe (§2.5) ──────────────────
  pruefeEntlistungsQuote(zustand.zeilen);

  // ── 8. Wortfeld-Tor über die Quell-Dateien (§0/A7) ────────────────────────────
  const scope = [
    // *.generated.ts ausgenommen: enthält amtliche Botschafts-TITEL (Zitat-Felder, §0/A7
    // wie amtliche titel in register.json) + den negierten Provenienz-hinweis — kein
    // hand-geschriebener Nutzertext.
    ...collectFiles('src/lib/materialien', (p) => p.endsWith('.ts') && !p.endsWith('.generated.ts')),
    ...collectFiles('src/components/kontext', (p) => p.endsWith('.tsx')),
    ...collectFiles('src/pages', (p) => /\/Material[^/]*\.tsx$/.test(p)),
  ];
  for (const datei of scope) {
    for (const t of wortfeldImQuellcode(readFileSync(datei, 'utf8'))) {
      fehler.push(`${datei}: affirmatives «${t.treffer}» in Nutzertext (§0/A7): «${t.kontext}». Erlaubt sind Negationen (nicht/noch nicht/ungeprüft).`);
    }
  }

  // ── 9. Zustands-Manifest ↔ register.json-DB-Teil deckungsgleich (immer, CI-fähig) ──
  const registerDbKeys = new Set(register.materialien.filter((m) => !kuratiertKeys.has(m.key)).map((m) => m.key));
  const dbKeys = new Set(dbDocs.map((d) => d.key));
  for (const k of dbKeys) if (!registerDbKeys.has(k)) fehler.push(`Zustands-Dokument '${k}' fehlt im register.json-DB-Teil.`);
  for (const k of registerDbKeys) if (!dbKeys.has(k)) fehler.push(`register.json-DB-Eintrag '${k}' ohne Zustands-Zeile.`);

  const shards = existsSync(KANTEN_DIR) ? collectFiles(KANTEN_DIR, (p) => p.endsWith('.json')).length : 0;
  ausgabe(register.materialien.length, dbDocs.length, kanten.length, shards, downgradesN);
}

// ── Shard-/Bucket-Prüfung gegen die committeten Dateien (byte + Invarianten) ────
// Lokal (mit DB): Byte-Reprojektion + Orphan-Erkennung + direkte Invarianten.
function pruefeShardDrift(emittiertDateien: ShardDatei[], gelistet: Map<string, DokZeile>): void {
  const emittiert = new Map(emittiertDateien.map((d) => [join(KANTEN_DIR, d.pfad), d.inhalt]));
  const vorhanden = existsSync(KANTEN_DIR) ? collectFiles(KANTEN_DIR, (p) => p.endsWith('.json')) : [];
  for (const [p, inhalt] of emittiert) {
    if (!existsSync(p)) fehler.push(`Shard fehlt: ${p} — Projektion neu schreiben.`);
    else if (readFileSync(p, 'utf8') !== inhalt) fehler.push(`Shard weicht von der Projektion ab: ${p}.`);
  }
  for (const p of vorhanden) if (!emittiert.has(p)) fehler.push(`Orphan-Shard (nicht mehr projiziert): ${p}.`);
  // Direkte Invarianten auf den committeten Dateien (Defense-in-depth über die Byte-Gleichheit hinaus).
  for (const p of vorhanden) pruefeShardDatei(p, gelistet);
}

// CI (ohne DB): keine Byte-Reprojektion möglich → committete Shards DIREKT validieren
// (Invarianten + Dok-Mitgliedschaft im JSONL + Plausibilität), §0/M0-Vermerk.
function pruefeCommittedShards(gelistet: Map<string, DokZeile>): void {
  const vorhanden = existsSync(KANTEN_DIR) ? collectFiles(KANTEN_DIR, (p) => p.endsWith('.json')) : [];
  for (const p of vorhanden) pruefeShardDatei(p, gelistet);
}

interface ShardKanteRaw { dok: string; artikel?: string; quelle: string; konfidenz: string; stand: string; fundstellen?: unknown[] }
interface ShardRaw { erzeugt: string; erlass: string; dokumente?: Record<string, unknown>; kanten?: ShardKanteRaw[]; buckets?: string[] }

function pruefeShardDatei(pfad: string, gelistet: Map<string, DokZeile>): void {
  const bytes = Buffer.byteLength(readFileSync(pfad), 'utf8');
  if (bytes > SHARD_BYTE_LIMIT) fehler.push(`Shard ${pfad} ${bytes} B > ${SHARD_BYTE_LIMIT} B Budget (§0/B5).`);
  let obj: ShardRaw;
  try {
    obj = JSON.parse(readFileSync(pfad, 'utf8')) as ShardRaw;
  } catch {
    fehler.push(`Shard ${pfad}: kein gültiges JSON.`);
    return;
  }
  const erlassSet = new Set(ERLASS_REGISTER.map((e) => e.key));
  if (!erlassSet.has(obj.erlass)) fehler.push(`Shard ${pfad}: erlass '${obj.erlass}' nicht im ERLASS_REGISTER.`);
  const korpus = baueKorpusInfo();
  const registerKeys = new Set((JSON.parse(readFileSync(REGISTER_PFAD, 'utf8')) as MaterialManifest).materialien.map((m) => m.key));

  // Kopf-Datei mit buckets: alle Bucket-Dateien existieren, keine verwaisten.
  if (obj.buckets) {
    const bucketDir = join(KANTEN_DIR, obj.erlass);
    const erwartet = new Set(obj.buckets.map((b) => join(bucketDir, `${b}.json`)));
    for (const p of erwartet) if (!existsSync(p)) fehler.push(`Shard-Kopf ${pfad}: Bucket ${p} fehlt.`);
    if (existsSync(bucketDir)) {
      for (const f of readdirSync(bucketDir)) {
        if (f.endsWith('.json') && !erwartet.has(join(bucketDir, f))) fehler.push(`Verwaiste Bucket-Datei: ${join(bucketDir, f)}.`);
      }
    }
  }
  const dokInShard = new Set<string>();
  for (const k of obj.kanten ?? []) {
    dokInShard.add(k.dok);
    if (!QUELLEN_ENUM.has(k.quelle)) fehler.push(`Shard ${pfad}: kante.quelle '${k.quelle}' ∉ {amtlich,kuratiert,maschinell}.`);
    if (!registerKeys.has(k.dok)) fehler.push(`Shard ${pfad}: dok-Verweis '${k.dok}' existiert nicht in register.json.`);
    // NEU (§0/M0-Vermerk): jede Shard-Kante dok MUSS im Zustands-Manifest gelistet sein.
    if (!gelistet.has(k.dok)) fehler.push(`Shard ${pfad}: dok-Verweis '${k.dok}' nicht als 'gelistet' im Zustands-Manifest.`);
    if (k.artikel !== undefined && k.artikel !== '') {
      if (!erlassSet.has(obj.erlass)) continue; // schon oben gemeldet
      const set = korpus.artikelSet(obj.erlass);
      if (set === null) fehler.push(`Shard ${pfad}: artikelscharfe Kante Art. ${k.artikel} ohne Normtext-Korpus (${obj.erlass}) — muss Erlass-Ebene sein.`);
      else if (!set.has(k.artikel)) fehler.push(`Shard ${pfad}: Art. ${k.artikel} nicht im Korpus ${obj.erlass} (Geister-Anker).`);
      if (braucheDowngrade(obj.erlass, k.artikel, k.stand)) {
        fehler.push(`Shard ${pfad}: artikelscharfe Kante Art. ${k.artikel} mit Stand ${k.stand} < Cutoff ${obj.erlass} (Revisions-Regel §2.4 verletzt).`);
      }
    }
  }
  // NEU: aggregierte Kanten-Zahl plausibel — nie mehr distinkte Dokumente in EINEM Shard als im
  // ganzen Manifest gelistet sind (Tripwire gegen aufgeblähte/korrupte Shards, §0/M0-Vermerk).
  if (dokInShard.size > gelistet.size) {
    fehler.push(`Shard ${pfad}: ${dokInShard.size} distinkte Dokumente > ${gelistet.size} gelistete im Manifest — unplausibel.`);
  }
}

// ── Append-only + Entlistungs-Quote je Lauf-Gruppe (§2.5) ───────────────────────
function pruefeEntlistungsQuote(zeilen: ZustandZeile[]): void {
  const bestand = new Map<SoftLawQuelle, Set<string>>();
  let aktuelleQuelle: SoftLawQuelle | null = null;
  let gruppeEntlistet = 0;
  let gruppeBestandVorher = 0;

  const gruppeAbschliessen = (): void => {
    if (aktuelleQuelle === null) return;
    if (gruppeEntlistet > Math.max(1, gruppeBestandVorher) * ENTLISTUNG_QUOTE) {
      fehler.push(`Entlistungs-Quote (§2.5): Lauf '${aktuelleQuelle}' entlistet ${gruppeEntlistet} von ${gruppeBestandVorher} (> ${ENTLISTUNG_QUOTE * 100} %) — Quell-Bruch? Snapshot prüfen.`);
    }
  };

  for (const z of zeilen) {
    if (z.typ === 'lauf') {
      gruppeAbschliessen();
      aktuelleQuelle = z.quelle;
      gruppeEntlistet = 0;
      if (!bestand.has(z.quelle)) bestand.set(z.quelle, new Set());
      gruppeBestandVorher = bestand.get(z.quelle)!.size;
    } else {
      const set = aktuelleQuelle ? bestand.get(aktuelleQuelle)! : null;
      if (z.status === 'entlistet') {
        gruppeEntlistet++;
        set?.delete(z.id);
      } else {
        set?.add(z.id);
      }
    }
  }
  gruppeAbschliessen();
}

// ── Ausgabe ─────────────────────────────────────────────────────────────────────
function ausgabe(nReg: number, nDb: number, nKanten: number, nShards: number, nDowngrades: number): void {
  for (const w of warn) console.warn(`WARN  materialien: ${w}`);
  if (fehler.length) {
    for (const f of fehler) console.error(`ROT   materialien: ${f}`);
    console.error(`\ncheck:materialien — ${fehler.length} Verstoss/Verstösse.`);
    process.exit(1);
  }
  console.log(
    `check:materialien OK — ${nReg} Materialien (${nReg - nDb} kuratiert · ${nDb} DB), ` +
      `${nKanten} Kanten · ${nShards} Shards · ${nDowngrades} Downgrades; ` +
      `Merge-Modell + Determinismus + Revisions-/Wortfeld-Tor konsistent.`,
  );
}

// check-materialien ist ausschliesslich ein vite-node-Entry (Tests importieren den
// Wortfeld-Extractor aus wortfeld.ts, nicht diese Datei) — top-level ausführen wie die
// übrigen check-*-Skripte.
main();
