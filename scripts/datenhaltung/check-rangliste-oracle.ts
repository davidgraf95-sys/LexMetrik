// scripts/datenhaltung/check-rangliste-oracle.ts
// QS-DATA E4 — ORACLE-TOR für norm_rangliste (§5 E4). Beweist, dass die materialisierte
// Massen-Rangliste die HEUTIGE norm-index.json-Semantik reproduziert. Für jede in
// norm-index.json gezeigte (Artikel, Entscheid)-Zeile klassifiziert das Tor das masse-gewicht:
//
//   • identisch              — masse == norm-index.
//   • korrekt-erhöht         — masse > norm-index (mehr zitierende Entscheide desselben Artikels;
//                              Monotonie: 342er-Korpus ⊆ 195 342er-Korpus). Beleg-Stichprobe real.
//   • vintage-absent         — der Entscheid fehlt im masse-Snapshot, WEIL er NEUER ist als die
//                              gepinnte voilaj-Revision (Beweis: BGE-Band > max-Band bzw. Datum >
//                              max-Datum in masse.db). Kein Port-Fehler, sondern Korpus-Alter.
//   • erklärt-delta          — masse < norm-index, ABER jede fehlende Einheit ist SELBST-BELEGT
//                              rekonstruiert: der norm-index-Zitierende ist entweder neuer als der
//                              Snapshot (absent) ODER voilaj hat die Zitat-Kante nicht extrahiert
//                              (Recall-Lücke der Quelle citations.parquet — unsere Regex fand sie,
//                              voilaj nicht). Beide sind dokumentierte Quell-/Alters-Effekte.
//   • UNERKLÄRT → rot        — alles andere (echte Port-Abweichung): exit 1.
//
// Das Tor REKONSTRUIERT für jede Delta-Zeile die norm-index-Beitragenden aus DENSELBEN Funktionen
// wie der Live-Index (ladeBestandSnapshots + kanonZitat + extrahiereStatutRefs + normKeyFuerAbk) und
// rechnet jede verlorene gewicht-Einheit einem realen Grund zu — kein Pauschal-Freibrief.
//
// masse.db ist gitignored → LOKAL (nicht in der CI-`gate`-Kette). Baue:
//   masse-ingest → resolve-zitate → baue-rangliste ; dann  MASSE_DB=daten/masse.db npm run datenhaltung:rangliste-oracle
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { baueMasseKorpusBruecke } from './masse-korpus-bruecke';
import { normKeyFuerAbk } from '../normtext/entscheide-mapping';
import { extrahiereStatutRefs } from '../../src/lib/rechtsprechung/zitat-extraktion';
import { ladeBestandSnapshots, kanonZitat } from '../normtext/entscheide-schreiben';
import { normArtikelToken } from '../../src/lib/rechtsprechung/norm-index';
import type { NormEntscheidIndex } from '../../src/lib/rechtsprechung/norm-index';
import type { EntscheidManifest } from '../../src/lib/rechtsprechung/register';
import type { EntscheidSnapshot } from '../../src/lib/rechtsprechung/typen';

const MASSE_DB = process.env.MASSE_DB ?? 'daten/masse.db';
const ROOT = process.cwd();
const AMBIG = new Set(['STG']); // wie norm-index (AMBIGE_BUND_KANTON_KUERZEL)

function ladeJson<T>(p: string): T {
  return JSON.parse(readFileSync(join(ROOT, p), 'utf8')) as T;
}
function korpusKey(s: EntscheidSnapshot): string {
  return `${s.gericht}_${s.id.split('/').pop()}`;
}
function selbstTokens(s: EntscheidSnapshot): string[] {
  const o = new Set<string>();
  for (const roh of [s.bgeReferenz, s.nummer, s.azaUrteil?.aktenzeichen]) {
    if (!roh) continue;
    const t = kanonZitat(roh);
    if (t) o.add(t);
  }
  return [...o];
}
function artikelSchluessel(s: EntscheidSnapshot): Set<string> {
  const o = new Set<string>();
  for (const ref of extrahiereStatutRefs((s.zitierteNormen ?? []).join('\n'))) {
    const rk = normKeyFuerAbk(ref.gesetz);
    if (!rk || AMBIG.has(rk)) continue;
    o.add(`${rk}/${ref.artikel}`);
  }
  return o;
}

type Klasse = 'identisch' | 'erhoeht' | 'vintage-absent' | 'erklaert-delta' | 'UNERKLÄRT';

function main(): number {
  const normIndex = ladeJson<NormEntscheidIndex>('public/rechtsprechung/norm-index.json');
  const register = ladeJson<EntscheidManifest>('public/rechtsprechung/register.json');
  const regByKey = new Map<string, { nummer: string; bgeReferenz: string | null; datum: string }>();
  for (const e of register.entscheide) regByKey.set(e.key, { nummer: e.nummer, bgeReferenz: e.bgeReferenz, datum: e.datum });

  const db = new DatabaseSync(MASSE_DB);
  db.exec('PRAGMA cache_size = -524288');

  // masse-Match-Keys → id + Snapshot-Grenzen (Vintage-Beweis) — geteilte Brücke (§5,
  // dieselbe masseId nutzt die V1b-Shard-Regeneration, sonst driftete «e4» vom Oracle).
  const { masseId, istNeuerAlsSnapshot, maxVol, maxDatum } = baueMasseKorpusBruecke(db, regByKey);
  const gewichtStmt = db.prepare('SELECT gewicht FROM norm_rangliste WHERE erlass_key = ? AND artikel = ? AND entscheid_id = ?');
  const edgeStmt = db.prepare('SELECT 1 AS x FROM zitat_kanten WHERE von_id = ? AND nach_id = ? LIMIT 1');

  // Korpus-Snapshots (bundesgericht) einmal aufbereiten für die Delta-Rekonstruktion.
  const bg = ladeBestandSnapshots(ROOT).filter((s) => s.gerichtstyp === 'bundesgericht');
  const selbstVon = new Map<string, string[]>();
  const artVon = new Map<string, Set<string>>();
  for (const s of bg) { const k = korpusKey(s); selbstVon.set(k, selbstTokens(s)); artVon.set(k, artikelSchluessel(s)); }

  /** norm-index-Beitragende: corpus-Entscheide d2≠d, die A zitieren UND d nennen. */
  function jsCiters(artKey: string, targetKey: string): string[] {
    const selbstD = new Set(selbstVon.get(targetKey) ?? []);
    const out: string[] = [];
    for (const s of bg) {
      const k = korpusKey(s);
      if (k === targetKey) continue;
      if (!(artVon.get(k)?.has(artKey))) continue;
      for (const z of s.zitierteEntscheide ?? []) {
        const t = kanonZitat(z);
        if (t && selbstD.has(t)) { out.push(k); break; }
      }
    }
    return out;
  }

  interface Zeile { erlassKey: string; artikel: string; corpusKey: string; masseId: string | null; js: number; masse: number | null; klasse: Klasse; grund?: string }
  const zeilen: Zeile[] = [];
  for (const [artKey, refs] of Object.entries(normIndex.proNormArtikel ?? {})) {
    const s = artKey.indexOf('/');
    const erlassKey = artKey.slice(0, s);
    const artikel = normArtikelToken(artKey.slice(s + 1));
    for (const ref of refs) {
      const id = masseId(ref.key);
      let klasse: Klasse; let grund: string | undefined;
      let mg: number | null = null;
      if (id === null) {
        klasse = istNeuerAlsSnapshot(ref.key) ? 'vintage-absent' : 'UNERKLÄRT';
        grund = klasse === 'vintage-absent' ? `Entscheid neuer als voilaj-Snapshot (max Band ${maxVol}/Datum ${maxDatum})` : 'Entscheid fehlt in masse.db, aber NICHT als neuer belegbar';
      } else {
        const row = gewichtStmt.get(erlassKey, artikel, id) as { gewicht: number } | undefined;
        mg = row ? row.gewicht : null;
        if (mg === null) { klasse = 'UNERKLÄRT'; grund = 'Tripel fehlt in norm_rangliste (kein Artikel-Mitglied)'; }
        else if (mg === ref.gewicht) klasse = 'identisch';
        else if (mg > ref.gewicht) klasse = 'erhoeht';
        else {
          // DECREASE: jede verlorene Einheit belegen. Beitragende rekonstruieren.
          const citers = jsCiters(artKey, ref.key);
          let absent = 0; let edgeless = 0;
          for (const c of citers) {
            const cid = masseId(c);
            if (cid === null) { absent++; continue; }              // Zitierender neuer als Snapshot → vintage
            if (!edgeStmt.get(cid, id)) { edgeless++; continue; }   // voilaj hat die Kante nicht → Recall-Lücke
            // Zitierender präsent MIT voilaj-Kante: müsste gezählt sein.
          }
          const erklaert = absent + edgeless;
          const fehlt = ref.gewicht - mg;
          if (erklaert >= fehlt) { klasse = 'erklaert-delta'; grund = `−${fehlt}: ${absent} Zitierende neuer als Snapshot, ${edgeless} ohne voilaj-Kante (Quell-Recall)`; }
          else { klasse = 'UNERKLÄRT'; grund = `−${fehlt}, davon ${fehlt - erklaert} unerklärt (${absent} vintage + ${edgeless} recall reichen nicht)`; }
        }
      }
      zeilen.push({ erlassKey, artikel, corpusKey: ref.key, masseId: id, js: ref.gewicht, masse: mg, klasse, grund });
    }
  }

  const z = (k: Klasse) => zeilen.filter((v) => v.klasse === k);
  const unerklaert = z('UNERKLÄRT');
  console.log(`\nOracle-Tor norm_rangliste (${MASSE_DB}) — ${zeilen.length} norm-index-Tripel · Snapshot max BGE-Band ${maxVol}, max Datum ${maxDatum}`);
  console.log(`  identisch:        ${z('identisch').length}`);
  console.log(`  korrekt-erhöht:   ${z('erhoeht').length}`);
  console.log(`  vintage-absent:   ${z('vintage-absent').length}  (Entscheid neuer als Snapshot)`);
  console.log(`  erklärt-delta:    ${z('erklaert-delta').length}  (jede fehlende Einheit als vintage/Recall belegt)`);
  console.log(`  UNERKLÄRT:        ${unerklaert.length}`);

  // Beleg-Stichprobe: 3 grösste «korrekt-erhöht»-Zuwächse real verifizieren.
  const beleg = z('erhoeht').filter((v) => v.masse !== null).sort((a, b) => (b.masse! - b.js) - (a.masse! - a.js)).slice(0, 3);
  if (beleg.length) {
    console.log('\n  Beleg-Stichprobe korrekt-erhöht (§7 — zusätzlicher Zitierender real):');
    for (const v of beleg) {
      const extra = db.prepare(`SELECT k.von_id FROM zitat_kanten k JOIN norm_rangliste rl ON rl.entscheid_id=k.von_id AND rl.erlass_key=? AND rl.artikel=? WHERE k.nach_id=? AND k.von_id<>? ORDER BY k.von_id LIMIT 1`).get(v.erlassKey, v.artikel, v.masseId, v.masseId) as { von_id: string } | undefined;
      const fund = extra ? (db.prepare('SELECT nach_zitierung FROM zitat_kanten WHERE von_id=? AND nach_id=? LIMIT 1').get(extra.von_id, v.masseId) as { nach_zitierung: string } | undefined) : undefined;
      console.log(`    ${v.erlassKey}/${v.artikel} · ${v.corpusKey}: ${v.js} → ${v.masse}  (z.B. ${extra?.von_id ?? '?'} zitiert "${fund?.nach_zitierung ?? '?'}")`);
    }
  }
  // Delta-Belege (die Begründungen je Abweichung).
  const deltas = z('erklaert-delta');
  if (deltas.length) {
    console.log('\n  erklärt-delta (je Abweichung belegt):');
    for (const v of deltas) console.log(`    ${v.erlassKey}/${v.artikel} · ${v.corpusKey}: norm-index ${v.js} → masse ${v.masse} — ${v.grund}`);
  }

  if (unerklaert.length) {
    console.error(`\nOracle ROT — ${unerklaert.length} UNERKLÄRT:`);
    for (const v of unerklaert.slice(0, 60)) console.error(`  ${v.erlassKey}/${v.artikel} · ${v.corpusKey} (${v.masseId ?? 'kein masse-id'}): norm-index ${v.js} vs masse ${v.masse ?? '—'} — ${v.grund}`);
  } else {
    console.log('\nOracle GRÜN: 0 UNERKLÄRT — jede Abweichung ist identisch, korrekt-erhöht, vintage-absent oder als vintage/Recall-Delta belegt.');
  }
  db.close();
  return unerklaert.length ? 1 : 0;
}

process.exit(main());
