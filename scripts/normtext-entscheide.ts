// ─── Build-Orchestrator: Rechtsprechungs-Snapshots erzeugen ──────────────────
//
// Resilient (Fahrplan R1/R9), Detail via OCL keyed-Lookups. Zwei Quellen-Zweige:
//  · Bund (bger): Citation-Graph-BFS (listing-unabhängig) → tief, regeste-reich.
//  · Kantone: Listing je kantonalem Gericht (kein BFS — deren Zitiergraph führt
//    nicht zu bger). /structure ist Bund-only → kantonal greift der ehrliche
//    Fliesstext-Fallback (§8, EntscheidBody).
// Schreibt NIE von Hand editierte Dateien — alles aus diesem Generator (§7).
//
//   vite-node scripts/normtext-entscheide.ts -- --datum=2026-06-23 --limit=45 \
//     --courts=zh_obergericht,be_verwaltungsgericht --kanton-pro=8
//
import {
  holeEntscheidOCL, enumeriereNeueste, enumeriereNeuesteAlle, citedRefZuId, enumeriereBge, enumeriereBgeBaender, holeBgeLeitentscheid,
} from './normtext/adapter-entscheide';
import { schreibeKorpus, ladeBestandSnapshots } from './normtext/entscheide-schreiben';
import { sha256EntscheidBloecke } from './normtext/sha-entscheide';
import { holeRegesteSprachfassungen, holeClirHtml, parseClirUrteilskopf, bgeRefZuClirId } from './normtext/clir-regeste';
import type { EntscheidSnapshot } from '../src/lib/rechtsprechung/typen';
import type { Rechtsgebiet } from '../src/lib/normtext/register';
import * as path from 'node:path';

/** Stuft einen BGE auf Auszug-only zurück (Body = Sammlungstext, kein azaUrteil/Volltext,
 *  Bandjahr-Platzhalterdatum). Für die Kollisions-Quarantäne (§8): unsichere aza-Zuordnung. */
function aufAuszugZurueck(s: EntscheidSnapshot): void {
  if (s.auszugAbschnitte && s.auszugAbschnitte.length) {
    s.abschnitte = s.auszugAbschnitte;
    s.auszugAbschnitte = undefined;
    s.sha = sha256EntscheidBloecke(s.abschnitte);
  }
  const band = parseInt(s.bgeReferenz ?? '', 10);
  if (band) s.datum = `${band + 1874}-01-01`;   // Bandjahr-Platzhalter (UI: «BGE-Jahrgang»)
  s.azaUrteil = null;
}

const arg = (name: string): string | null => {
  const p = process.argv.find((a) => a.startsWith(name + '='));
  return p ? p.slice(name.length + 1) : null;
};
const datum = arg('--datum') ?? new Date().toISOString().slice(0, 10);
const bundLimit = Number(arg('--limit') ?? '45');
const kantonPro = Number(arg('--kanton-pro') ?? '8');
const kantCourts = (arg('--courts') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
// Amtliche Leitentscheide (BGE): --bge-von=YYYY-MM-DD aktiviert den dritten Quell-Zweig.
const bgeVon = arg('--bge-von');
const bgeLimit = Number(arg('--bge-limit') ?? '300');
// Batch 3 (Lane R): die drei weiteren eidg. Gerichte (BVGer/BStGer/BPatGer) als
// eigener OCL-Quellzweig. --eidg=bvger,bstger,bpatger zieht je Gericht die N
// neuesten Urteile. --additiv ergänzt sie zum committeten Bestand (von der Platte
// geladen), OHNE die 272 BGE/Bund/Kanton über die Live-API neu zu ziehen (§6: kein
// Bestand-Drift). Ohne --additiv würde der bestehende Korpus überschrieben.
const eidgCourts = (arg('--eidg') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const eidgPro = Number(arg('--eidg-pro') ?? '5');
const additiv = process.argv.includes('--additiv');
// --bge-refresh (nur additiv): zieht genau die BESTEHENDEN BGE neu, deren Auszug/Volltext
// aktuell mitten im Wort (U+2026) gekappt ist (W2·6-BGE), und überschreibt sie by id —
// kein Vollbau, Bund/Kanton/eidg bleiben unberührt. Selbstheilend nach Adapter-Härtung.
const bgeRefresh = process.argv.includes('--bge-refresh');
// --regeste-refresh (nur additiv, W2·6-B B1+B2+A18): reichert die BESTEHENDEN
// amtlichen BGE an — (B2/A18) strukturierte, dreisprachige Regeste aus bger.ch clir
// (kopf+absaetze je Sprache, sortiert DE→FR→IT) + (B1) aza-Voll-Resolution der BGE
// ohne `azaUrteil`. Bund/Kanton/eidg + die restlichen BGE bleiben byte-treu (§6).
const regesteRefresh = process.argv.includes('--regeste-refresh');
// --bge-baender=146,147 (additiver Voll-Band-Nachzug, W2·6): zieht die VOLLSTÄNDIGEN
// amtlichen BGE-Bände band-basiert (nicht datums-basiert; Q1-Bandjahr-Quirk) nach,
// ergänzt sie zum committeten Bestand (byte-treu, §6), inkl. dreisprachiger clir-
// Regeste (A18) für die NEUEN BGE. Bund/Kanton/eidg + Bestands-BGE bleiben unberührt.
const bgeBaender = (arg('--bge-baender') ?? '').split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
// Cache-Verzeichnis der rohen clir-HTML (gitignored; Re-Parse ohne Re-Crawl).
const CLIR_CACHE = path.join(process.cwd(), 'daten', 'cache', 'clir-regeste');
// Court-spezifischer Sachgebiets-Hint (deterministisch, deklariert): Patentstreit =
// Immaterialgüterrecht → privat (OCL legal_area der BPatGer-Fälle ist oft nur eine
// Kosten-/Verfahrens-Notiz und mappt sonst auf den groben Default 'oeffentlich').
const EIDG_SACHGEBIET: Record<string, Rechtsgebiet> = { bpatger: 'privat' };

async function mapLimit<T, R>(items: T[], n: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let idx = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (idx < items.length) { const my = idx++; out[my] = await fn(items[my], my); }
  }));
  return out;
}

// Auswahl-Rang: Regeste zuerst, dann Leitentscheid, dann mit Norm-Verknüpfung.
const rang = (s: EntscheidSnapshot) =>
  (s.regeste ? 0 : 2) + (s.leitcharakter === 'leitentscheid' ? 0 : 1) + (s.normKeys.length ? 0 : 0.5);
const sortAuswahl = (xs: EntscheidSnapshot[]) =>
  [...xs].sort((a, b) => rang(a) - rang(b) || (a.datum < b.datum ? 1 : -1));

/** Bund: Citation-Graph-BFS ab Seeds (+ Listing-Bonus-Seeds), de-Pool, gewählt nach Rang. */
async function bundKorpus(): Promise<EntscheidSnapshot[]> {
  const SEEDS = (arg('--seeds') ?? 'bger_5A_1100_2025').split(',').filter(Boolean);
  let startIds = [...SEEDS];
  const bonus = await enumeriereNeueste('bger', bundLimit * 2);
  if (bonus.length) { startIds.push(...bonus); console.log(`[bund] Listing bger: +${bonus.length} Bonus-Seeds`); }
  startIds = [...new Set(startIds)];

  const maxFetch = Math.max(150, bundLimit * 6);
  const visited = new Set<string>();
  const pool: EntscheidSnapshot[] = [];
  let queue = [...startIds];
  let fetched = 0;
  while (queue.length && fetched < maxFetch) {
    const layer = queue.filter((id) => !visited.has(id)).slice(0, 16);
    layer.forEach((id) => visited.add(id));
    queue = queue.filter((id) => !layer.includes(id));
    fetched += layer.length;
    const snaps = await mapLimit(layer, 4, async (id) => {
      const s = await holeEntscheidOCL(id, datum, { sprache: null });
      process.stdout.write(s ? (s.sprache === 'de' ? '.' : '·') : 'x');
      return s;
    });
    for (const s of snaps) {
      if (!s) continue;
      if (s.sprache === 'de') pool.push(s);
      for (const ref of s.zitierteEntscheide) {
        const cid = citedRefZuId(ref);
        if (cid && !visited.has(cid)) queue.push(cid);
      }
    }
  }
  process.stdout.write('\n');
  const seen = new Set<string>();
  const uniq = pool.filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
  const gewaehlt = sortAuswahl(uniq).slice(0, bundLimit);
  console.log(`[bund] BFS ${fetched} geholt, ${uniq.length} unique de → ${gewaehlt.length} gewählt (Regeste: ${gewaehlt.filter((s) => s.regeste).length})`);
  return gewaehlt;
}

/** Kantone: je Gericht Listing → keyed Detail (de), gewählt nach Rang (kantonPro). */
async function kantonKorpus(): Promise<EntscheidSnapshot[]> {
  const out: EntscheidSnapshot[] = [];
  for (const court of kantCourts) {
    const ids = await enumeriereNeueste(court, kantonPro * 4);
    if (!ids.length) { console.log(`[kanton] ${court}: 0 IDs (Listing nicht erreichbar)`); continue; }
    const snaps = await mapLimit(ids.slice(0, kantonPro * 4), 4, async (id) => {
      const s = await holeEntscheidOCL(id, datum, { sprache: 'de' });
      process.stdout.write(s ? '.' : 'x');
      return s;
    });
    process.stdout.write('\n');
    const ok = snaps.filter((s): s is EntscheidSnapshot => !!s);
    const gewaehlt = sortAuswahl(ok).slice(0, kantonPro);
    out.push(...gewaehlt);
    console.log(`[kanton] ${court}: ${ok.length} de → ${gewaehlt.length} gewählt (Regeste: ${gewaehlt.filter((s) => s.regeste).length})`);
  }
  return out;
}

/** Amtliche Leitentscheide (BGE): Enumeration → angereicherter A2-Merge je BGE. */
async function bgeKorpus(): Promise<EntscheidSnapshot[]> {
  const ids = await enumeriereBge(bgeVon!, bgeLimit);
  if (!ids.length) { console.log('[bge] 0 IDs (Listing nicht erreichbar)'); return []; }
  const snaps = await mapLimit(ids, 4, async (id) => {
    const s = await holeBgeLeitentscheid(id, datum);
    process.stdout.write(s ? (s.azaUrteil ? '.' : '·') : 'x');
    return s;
  });
  process.stdout.write('\n');
  const ok = snaps.filter((s): s is EntscheidSnapshot => !!s);
  const mitVoll = ok.filter((s) => s.azaUrteil).length;
  console.log(`[bge] ${ids.length} BGE → ${ok.length} erfasst (Volltext: ${mitVoll}, Auszug: ${ok.length - mitVoll})`);
  return ok;
}

/**
 * Eidg. Gerichte (BVGer/BStGer/BPatGer): je Gericht die `eidgPro` NEUESTEN Urteile
 * (Datum desc) über denselben OCL-Adapter wie Bund/Kanton. sprache:null — diese
 * Gerichte publizieren stark FR/IT (A2 ist Voraussetzung). Kein BGE/Leitentscheid-
 * Status (bgeReferenz bleibt null → leitcharakter 'routine', Invariante gewahrt);
 * gerichtstyp/Anzeigename kommen aus dem Mapping. id-Pfad: bund/<court>/<docket>.
 */
async function eidgKorpus(): Promise<EntscheidSnapshot[]> {
  const out: EntscheidSnapshot[] = [];
  for (const court of eidgCourts) {
    const ids = await enumeriereNeuesteAlle(court, eidgPro * 4);
    if (!ids.length) { console.log(`[eidg] ${court}: 0 IDs (Listing nicht erreichbar)`); continue; }
    const sachgebietHint = EIDG_SACHGEBIET[court] ?? null;
    const snaps = await mapLimit(ids.slice(0, eidgPro * 4), 4, async (id) => {
      const s = await holeEntscheidOCL(id, datum, { sprache: null, sachgebietHint });
      process.stdout.write(s ? (s.sprache === 'de' ? '.' : '·') : 'x');
      return s;
    });
    process.stdout.write('\n');
    const ok = snaps.filter((s): s is EntscheidSnapshot => !!s);
    // Die N neuesten (Datum desc; key als stabiler Tiebreaker, §2-Determinismus).
    const gewaehlt = [...ok]
      .sort((a, b) => (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      .slice(0, eidgPro);
    out.push(...gewaehlt);
    const spr = gewaehlt.reduce((m, s) => ((m[s.sprache] = (m[s.sprache] ?? 0) + 1), m), {} as Record<string, number>);
    console.log(`[eidg] ${court}: ${ok.length} geholt → ${gewaehlt.length} gewählt (${Object.entries(spr).map(([k, v]) => `${k}:${v}`).join(' ')})`);
  }
  return out;
}

/** docket → dateisicheres Slug-Tail (identisch zu mappeEntscheidOCL, §5). */
const docketSlug = (d: string) => d.replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, '_');

async function main() {
  console.log(`[entscheide] Build ${datum} · BGE ${bgeVon ?? '–'} · Bund-Limit ${bundLimit} · Kantone [${kantCourts.join(',') || '–'}] je ${kantonPro}${additiv ? ` · ADDITIV eidg [${eidgCourts.join(',') || '–'}] je ${eidgPro}` : ''}`);

  // ── BGE-Band-Nachzug (W2·6): vollständige Bände additiv ergänzen ─────────────
  // Band-basiert (Q1-Quirk: date_from lässt platzhalter-datierte BGE fallen). Lädt
  // den committeten Bestand byte-treu, ergänzt NUR die noch fehlenden BGE der
  // Zielbände (Volltext-Merge + Kollisions-/Inversions-Quarantäne wie im Vollbau)
  // und reichert die NEUEN mit dreisprachiger clir-Regeste an (A18). §6: Bestand
  // (BGE 150–152 + Bund/Kanton/eidg) bleibt unverändert.
  if (bgeBaender.length) {
    const basis = ladeBestandSnapshots();
    const bestandIds = new Set(basis.map((s) => s.id));
    console.log(`[bge-baender] Zielbände [${bgeBaender.join(',')}] · Bestand ${basis.length} (davon BGE ${basis.filter((s) => s.gericht === 'bge').length}).`);

    const idZuRef = (id: string) =>
      id.replace(/^bge_/i, '').replace(/^BGE[_ ]/i, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    const alleIds = await enumeriereBgeBaender(bgeBaender);
    if (!alleIds.length) { console.log('[bge-baender] 0 IDs enumeriert (OCL nicht erreichbar?) — Korpus unberührt.'); return; }
    // Vollständigkeits-Ausweis je Band (gegen die amtliche Bandliste zu prüfen).
    const proBand: Record<number, number> = {};
    for (const id of alleIds) { const b = parseInt(idZuRef(id), 10); if (b) proBand[b] = (proBand[b] ?? 0) + 1; }
    console.log(`[bge-baender] enumeriert (band-basiert): ${alleIds.length} — ${Object.entries(proBand).sort((a, b) => +a[0] - +b[0]).map(([b, n]) => `${b}:${n}`).join(' ')}`);
    let neueIds = alleIds.filter((id) => !bestandIds.has(`bund/bge/${idZuRef(id).replace(/ /g, '_')}`));
    console.log(`[bge-baender] davon neu (noch nicht im Bestand): ${neueIds.length}`);
    // Optionaler Deckel (Smoke-Test / gestaffelter Resume): die N ältesten neuen zuerst
    // (Enumeration ist date_desc → tail = älteste; deterministisch, §2).
    const neuLimit = Number(arg('--bge-neu-limit') ?? '0');
    if (neuLimit > 0 && neueIds.length > neuLimit) { neueIds = neueIds.slice(0, neuLimit); console.log(`[bge-baender] Deckel --bge-neu-limit=${neuLimit} → ${neueIds.length} bearbeitet.`); }

    // Amtliche aza↔BGE-Bindung + Urteilsdatum je BGE ZUERST aus dem bger.ch clir-
    // Urteilskopf (DE-Fassung; Cache geteilt mit der Regeste-Anreicherung) — OCLs
    // docket_number_2/Kopf-Regex sind nur Fallbacks (Befund Gegenprüfung 12.7.2026).
    const neu = (await mapLimit(neueIds, 4, async (id) => {
      const clirId = bgeRefZuClirId(idZuRef(id));
      const html = clirId ? await holeClirHtml(clirId, 'de', CLIR_CACHE, 300) : null;
      const kopf = html ? parseClirUrteilskopf(html) : { aza: null, datumIso: null };
      const s = await holeBgeLeitentscheid(id, datum, { azaAz: kopf.aza, datumFallback: kopf.datumIso });
      process.stdout.write(s ? (s.azaUrteil ? '.' : '·') : 'x');
      return s;
    })).filter((s): s is EntscheidSnapshot => !!s);
    process.stdout.write('\n');
    // Leer-Guard (§6): fehlgeschlagener Lauf entwertet nie den Bestand.
    if (neueIds.length && neu.length === 0) { console.log('[bge-baender] 0 geholt (Quelle nicht erreichbar?) — Korpus unberührt.'); return; }
    // Duplikat-Guard: nie ein bereits erfasstes id doppelt (idempotent bei Re-Run).
    const neuUniq = neu.filter((s) => !bestandIds.has(s.id));
    const mitVoll = neuUniq.filter((s) => s.azaUrteil).length;
    console.log(`[bge-baender] neu erfasst: ${neuUniq.length} (Volltext ${mitVoll}, Auszug ${neuUniq.length - mitVoll})`);

    // Kollisions-Quarantäne (§8) über den GANZEN BGE-Satz (Bestand + neu): teilt sich
    // ein aza-key auf mehrere BGE, ist ≥1 Zuordnung falsch → NUR die NEUEN Kollidierer
    // auf Auszug zurückstufen (die Bestands-Auflösungen wurden beim Bau validiert).
    const alleBge = [...basis.filter((s) => s.gericht === 'bge'), ...neuUniq];
    const azaN: Record<string, number> = {};
    for (const s of alleBge) if (s.azaUrteil) azaN[s.azaUrteil.key] = (azaN[s.azaUrteil.key] ?? 0) + 1;
    let quar = 0;
    for (const s of neuUniq) if (s.azaUrteil && azaN[s.azaUrteil.key] > 1) { aufAuszugZurueck(s); quar++; }
    if (quar) console.log(`[bge-baender] Kollisions-Quarantäne: ${quar} neue BGE auf Auszug zurückgestuft.`);

    // A18: dreisprachige, strukturierte clir-Regeste NUR für die neuen amtlichen BGE
    // (Bestand behält seine — §6 byte-treu). Cache (daten/cache/clir-regeste) macht
    // Re-Runs crawl-frei.
    const amtlichNeu = neuUniq.filter((s) => s.regeste && s.regesteAmtlich && s.bgeReferenz);
    const fassungen = await mapLimit(amtlichNeu, 2, async (s) => {
      const f = await holeRegesteSprachfassungen(s.bgeReferenz!, CLIR_CACHE, 300);
      process.stdout.write(f.length === 3 ? '.' : f.length ? '+' : 'x');
      return { s, f };
    });
    process.stdout.write('\n');
    let mitFassung = 0; const luecken: string[] = [];
    for (const { s, f } of fassungen) {
      if (f.length && f.some((x) => x.sprache === 'de')) {
        s.regeste = { ...s.regeste!, sprachfassungen: f };
        mitFassung++;
        if (f.length < 3) luecken.push(`${s.bgeReferenz} [${f.map((x) => x.sprache).join('/')}]`);
      } else luecken.push(`${s.bgeReferenz} [ohne dt. clir-Regeste — §1 unverändert]`);
    }
    console.log(`[bge-baender] clir-Regeste: ${mitFassung}/${amtlichNeu.length} neue BGE dreisprachig strukturiert.`);
    if (luecken.length) console.log(`[bge-baender] nicht vollständig dreisprachig (${luecken.length}): ${luecken.join(', ')}`);

    // Dedup wie im Vollbau: ein bger-Routine-Bestand, der jetzt als BGE-aza-Volltext
    // dient, würde sonst doppelt geführt (Leit-UND-Routine, §8) → aus dem Bestand nehmen.
    const neueAzaIds = new Set(neuUniq.filter((s) => s.azaUrteil).map((s) => `bund/bger/${docketSlug(s.azaUrteil!.aktenzeichen)}`));
    const basisGefiltert = basis.filter((s) => !(s.gericht === 'bger' && neueAzaIds.has(s.id)));
    if (basisGefiltert.length !== basis.length) console.log(`[bge-baender] ${basis.length - basisGefiltert.length} bger-Routine-Einträge entfernt (nun BGE-aza-Volltext).`);

    const seen = new Set<string>();
    const auswahl = [...basisGefiltert, ...neuUniq].filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
    const res = schreibeKorpus(auswahl, datum);
    console.log(`[bge-baender] geschrieben: ${res.anzahl} Manifest-Einträge (Bestand ${basisGefiltert.length} + neu ${neuUniq.length} BGE), ${res.normBuckets} Norm-Buckets.`);
    return;
  }

  // ── Regeste-Refresh (W2·6-B B1+B2+A18): amtliche BGE anreichern ──────────────
  if (regesteRefresh) {
    const basis = ladeBestandSnapshots();
    const bge = basis.filter((s) => s.gericht === 'bge');
    console.log(`[regeste-refresh] Bestand ${basis.length}, davon ${bge.length} BGE.`);

    // ── B1: BGE ohne Vollurteil (azaUrteil:null) via aza-Resolver nachladen ──
    const b1 = bge.filter((s) => !s.azaUrteil);
    console.log(`[b1] ${b1.length} BGE ohne Vollurteil → aza-Resolver (bger.ch/OCL)`);
    const b1neu = await mapLimit(b1, 3, async (s) => {
      const neu = await holeBgeLeitentscheid(s.id.replace(/^bund\/bge\//, ''), datum);
      process.stdout.write(neu?.azaUrteil ? '.' : neu ? '·' : 'x');
      return { id: s.id, neu };
    });
    process.stdout.write('\n');
    if (b1.length && b1neu.every((x) => !x.neu)) {
      console.log('[b1] 0 Ergebnisse (OCL nicht erreichbar?) — Korpus unberührt.'); return;
    }
    const byId = new Map<string, EntscheidSnapshot>();
    for (const { neu } of b1neu) if (neu?.azaUrteil) byId.set(neu.id, neu);
    for (let i = 0; i < basis.length; i++) { const r = byId.get(basis[i].id); if (r) basis[i] = r; }
    // Kollisions-Quarantäne (§8) über ALLE BGE: teilt sich ein aza-key auf mehrere
    // BGE (OCL-Konflation, z.B. «152 V 2»↔«152 V 20»), ist ≥1 Zuordnung falsch → die
    // FRISCH aufgelösten mit kollidierendem key auf Auszug zurückstufen (die 260
    // Bestands-Auflösungen wurden beim Bau validiert; nie ein frischer Fehl-Body).
    const azaN: Record<string, number> = {};
    for (const s of basis) if (s.gericht === 'bge' && s.azaUrteil) azaN[s.azaUrteil.key] = (azaN[s.azaUrteil.key] ?? 0) + 1;
    let quar = 0;
    for (const s of basis) if (s.gericht === 'bge' && byId.has(s.id) && s.azaUrteil && azaN[s.azaUrteil.key] > 1) { aufAuszugZurueck(s); quar++; }
    const geloest = [...byId.values()].filter((s) => s.azaUrteil && azaN[s.azaUrteil.key] === 1).length;
    console.log(`[b1] aufgelöst: ${geloest} · Kollisions-Quarantäne: ${quar} · weiterhin Auszug: ${b1.length - geloest}`);

    // ── B2 + A18: strukturierte, dreisprachige Regeste (bger.ch clir) an alle amtl. BGE ──
    const amtlich = basis.filter((s) => s.gericht === 'bge' && s.regeste && s.regesteAmtlich && s.bgeReferenz);
    const fassungenAlle = await mapLimit(amtlich, 2, async (s) => {
      const f = await holeRegesteSprachfassungen(s.bgeReferenz!, CLIR_CACHE, 300);
      process.stdout.write(f.length === 3 ? '.' : f.length ? '+' : 'x');
      return { s, f };
    });
    process.stdout.write('\n');
    let mitFassung = 0, ohne = 0; const luecken: string[] = [];
    for (const { s, f } of fassungenAlle) {
      if (f.length && f.some((x) => x.sprache === 'de')) {
        s.regeste = { ...s.regeste!, sprachfassungen: f };
        mitFassung++;
        if (f.length < 3) luecken.push(`${s.bgeReferenz} [${f.map((x) => x.sprache).join('/')}]`);
      } else { ohne++; luecken.push(`${s.bgeReferenz} [KEINE — §1 unverändert]`); }
    }
    console.log(`[b2/a18] ${mitFassung}/${amtlich.length} BGE mit strukturierter Regeste; ${ohne} ohne.`);
    if (luecken.length) console.log(`[b2/a18] Nicht vollständig dreisprachig/leer (${luecken.length}): ${luecken.join(', ')}`);

    const res = schreibeKorpus(basis, datum);
    console.log(`[regeste-refresh] geschrieben: ${res.anzahl} Manifest-Einträge, ${res.normBuckets} Norm-Buckets.`);
    return;
  }

  // ── Additiver Lauf (Batch 3): Bestand von der Platte + neue eidg. Gerichte ──
  // Zieht den committeten Korpus (272 BGE/Bund/Kanton) NICHT über die Live-API neu
  // (§6: kein Drift), sondern lädt ihn byte-treu von der Platte und ergänzt nur die
  // frisch geholten BVGer/BStGer/BPatGer-Urteile. Schreibt über denselben Writer (§5).
  if (additiv) {
    let basis = ladeBestandSnapshots();
    console.log(`[additiv] Bestand geladen: ${basis.length} Snapshots (Verweise rekonstruiert der Writer).`);
    if (bgeRefresh) {
      const gekappt = (s: EntscheidSnapshot) =>
        [...(s.abschnitte ?? []), ...(s.auszugAbschnitte ?? [])]
          .some((a) => a.bloecke.some((b) => /(?<!\()…\s*$/u.test(b.text)));
      const zu = basis.filter((s) => s.gericht === 'bge' && gekappt(s));
      console.log(`[bge-refresh] ${zu.length} gekappte BGE → frisch nachladen (W2·6-BGE)`);
      const frisch = (await mapLimit(zu, 4, async (s) => {
        const neu = await holeBgeLeitentscheid(s.id.replace(/^bund\/bge\//, ''), datum);
        process.stdout.write(neu ? '.' : 'x');
        return neu;
      })).filter((s): s is EntscheidSnapshot => !!s);
      process.stdout.write('\n');
      // Leer-Guard (§6): nie den Bestand durch einen fehlgeschlagenen OCL-Lauf entwerten.
      if (zu.length && frisch.length === 0) {
        console.log('[bge-refresh] 0 geholt (Quelle nicht erreichbar?) — Korpus unberührt.');
        return;
      }
      const byId = new Map(frisch.map((s) => [s.id, s]));
      basis = basis.map((s) => byId.get(s.id) ?? s);
      // Kollisions-Quarantäne über den GANZEN BGE-Satz nach dem Ersetzen (§8, wie im Vollbau).
      const alleBge = basis.filter((s) => s.gericht === 'bge');
      const azaN: Record<string, number> = {};
      for (const s of alleBge) if (s.azaUrteil) azaN[s.azaUrteil.key] = (azaN[s.azaUrteil.key] ?? 0) + 1;
      let quar = 0;
      for (const s of alleBge) if (s.azaUrteil && azaN[s.azaUrteil.key] > 1) { aufAuszugZurueck(s); quar++; }
      if (quar) console.log(`[bge-refresh] Kollisions-Quarantäne: ${quar} auf Auszug zurückgestuft.`);
      console.log(`[bge-refresh] ${frisch.length}/${zu.length} BGE ersetzt.`);
    }
    const eidg = eidgCourts.length ? await eidgKorpus() : [];
    // Schutz gegen stillen Bestand-Überschreib bei OCL-Ausfall: wurden eidg-Gerichte
    // angefordert, aber NICHTS geholt, ist die Quelle vermutlich down → Korpus unberührt.
    if (eidgCourts.length && eidg.length === 0) {
      console.log('[additiv] 0 neue eidg. Entscheide (Quelle nicht erreichbar?) — Korpus unberührt.');
      return;
    }
    const seen = new Set<string>();
    const auswahl = [...basis, ...eidg].filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
    if (auswahl.length === 0) {
      console.log('[additiv] 0 Snapshots — bestehender Korpus bleibt unberührt.');
      return;
    }
    const res = schreibeKorpus(auswahl, datum);
    const eidgN = eidg.length;
    console.log(`[additiv] geschrieben: ${res.anzahl} Manifest-Einträge (Bestand ${basis.length} + neu ${eidgN} eidg.), ${res.normBuckets} Norm-Buckets.`);
    return;
  }

  const bge = bgeVon ? await bgeKorpus() : [];
  // Kollisions-Quarantäne (§8): griff dieselbe aza-id für ZWEI BGE, ist mindestens eine
  // Zuordnung falsch (OCL-Quirk/zitiertes Präjudiz) — beide auf Auszug zurückstufen, nie
  // ein potenziell falscher Volltext unter einem Leitentscheid.
  const azaN: Record<string, number> = {};
  for (const s of bge) if (s.azaUrteil) azaN[s.azaUrteil.key] = (azaN[s.azaUrteil.key] ?? 0) + 1;
  let quar = 0;
  for (const s of bge) if (s.azaUrteil && azaN[s.azaUrteil.key] > 1) { aufAuszugZurueck(s); quar++; }
  if (quar) console.log(`[bge] Kollisions-Quarantäne: ${quar} BGE auf Auszug zurückgestuft (aza-Mehrfachzuordnung).`);
  const bund = await bundKorpus();
  const kanton = kantCourts.length ? await kantonKorpus() : [];

  // Dedup (Budget + §8): bger-Urteile, die bereits als BGE-Volltext erfasst sind, nicht
  // zusätzlich als Routine-Eintrag führen (sonst derselbe Entscheid als Leit- UND Routine).
  const bgeAzaIds = new Set(
    bge.filter((s) => s.azaUrteil).map((s) => `bund/bger/${docketSlug(s.azaUrteil!.aktenzeichen)}`),
  );
  const bundGefiltert = bund.filter((s) => !bgeAzaIds.has(s.id));

  // Vereinen + global dedupen (id stabil; BGE ZUERST = kanonisch bei Kollision).
  const seen = new Set<string>();
  const auswahl = [...bge, ...bundGefiltert, ...kanton].filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });

  // Leer-Guard: nie einen bestehenden Korpus durch einen fehlgeschlagenen Lauf überschreiben.
  if (auswahl.length === 0) {
    console.log('[entscheide] 0 Treffer (Quelle nicht erreichbar?) — bestehender Korpus bleibt unberührt.');
    return;
  }
  const res = schreibeKorpus(auswahl, datum);
  const bgeN = auswahl.filter((s) => s.gericht === 'bge').length;
  const kantN = auswahl.filter((s) => s.kanton !== 'CH').length;
  console.log(`[entscheide] geschrieben: ${res.anzahl} Snapshots (BGE ${bgeN}, Bund ${res.anzahl - bgeN - kantN}, Kanton ${kantN}), ${res.normBuckets} Norm-Buckets.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
