// ─── Tor «check:besetzung» — Spruchkörper-Projektion prüfen ──────────────────
//
// Prüft die committeten Projektionen (public/rechtsprechung/register.json +
// richter.json) gegen die Snapshots. Vier Klassen:
//
//  G1 LEAK (HART)      — kein Slug/Anzeigename trägt ein Anonymisierungs-Token.
//                        Eine anonymisierte Partei/ein Gutachter darf NIE als
//                        Richter erscheinen; korpusweit muss das 0 ergeben.
//  G2 KONSISTENZ (HART)— jeder im Manifest referenzierte Slug existiert im
//                        Richter-Register; jede Rolle ist gültig.
//  G3 DETERMINISMUS    — die Projektion aus den Snapshots reproduziert das
//        (HART)          committete Manifest exakt (Parser + Kanon-Pass stabil).
//  G4 ABDECKUNG        — Report mit Mindestschwellen je Korpus (kein Stillstand
//        (SCHWELLE)      unbemerkt); ehrliche Zahlen, nichts Fabriziertes (§8).
//
// Zusätzlich: Fidelity-Stichprobe (extrahierte Nachnamen MÜSSEN im amtlichen
// Freitext vorkommen) und der Kollisions-Report als Artefakt.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { EntscheidManifest, RichterRegister } from '../../src/lib/rechtsprechung/register';
import { ladeBestandSnapshots, keyVon } from '../normtext/entscheide-schreiben';
import {
  parseBesetzung, kanonisiere, istAnonymisiert, fold, type KanonEintrag,
} from '../../src/lib/rechtsprechung/besetzung';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');
const fehler: string[] = [];
const warnung: string[] = [];

function lies<T>(datei: string): T | null {
  const p = join(PUB, datei);
  return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as T) : null;
}

const manifest = lies<EntscheidManifest>('register.json');
const richterReg = lies<RichterRegister>('richter.json');
if (!manifest) { console.error('[check:besetzung] register.json fehlt.'); process.exit(1); }
if (!richterReg) { console.error('[check:besetzung] richter.json fehlt.'); process.exit(1); }

// ── G1 Leak-Scan (hart) ──
let geprueft = 0;
for (const [slug, e] of Object.entries(richterReg.richter)) {
  geprueft++;
  if (slug.includes('_') || istAnonymisiert(slug)) fehler.push(`G1 LEAK: Slug «${slug}» trägt ein Anonymisierungs-Token.`);
  if (e.name.includes('_') || istAnonymisiert(e.name)) fehler.push(`G1 LEAK: Anzeigename «${e.name}» (Slug ${slug}) trägt ein Anonymisierungs-Token.`);
}
for (const e of manifest.entscheide) {
  for (const r of e.richter ?? []) {
    if (r.s.includes('_') || istAnonymisiert(r.s)) fehler.push(`G1 LEAK: ${e.key} → Slug «${r.s}».`);
  }
}

// ── G2 Konsistenz (hart) ──
const ROLLEN = new Set(['vorsitz', 'mitglied', 'gerichtsschreiber']);
let mitRichter = 0;
for (const e of manifest.entscheide) {
  if (!e.richter) continue;
  if (!e.richter.length) { fehler.push(`G2: ${e.key} trägt ein LEERES richter[] (statt gar keines, §8).`); continue; }
  mitRichter++;
  for (const r of e.richter) {
    if (!ROLLEN.has(r.r)) fehler.push(`G2: ${e.key} → unbekannte Rolle «${r.r}».`);
    if (!(r.s in richterReg.richter)) fehler.push(`G2: ${e.key} → Slug «${r.s}» fehlt im Richter-Register.`);
  }
}

// ── G3 Determinismus: Projektion aus den Snapshots reproduzieren ──
const snaps = ladeBestandSnapshots(ROOT);
const rohProKey = new Map<string, ReturnType<typeof parseBesetzung>['richter']>();
const kanonInput: KanonEintrag[] = [];
const raumVon = new Map<string, string>();
const freitextVon = new Map<string, string>();
for (const s of snaps) {
  // MUSS dieselbe Schlüssel-Funktion sein wie im Generator. Die erste Fassung nahm
  // `s.id` — das trifft den Manifest-Key nie, also lief G3 über eine LEERE
  // Schnittmenge und meldete «0 Abweichungen» grün, ohne irgendetwas zu prüfen.
  // Ein Tor, das nicht scheitern KANN, ist gefährlicher als keines; darum unten
  // zusätzlich die Mindestdeckungs-Assertion.
  const key = keyVon(s).key;
  raumVon.set(key, s.kanton);
  const ft = s.rubrum?.besetzung ?? null;
  if (!ft) continue;
  freitextVon.set(key, ft);
  const res = parseBesetzung(ft, { gericht: s.gericht });
  if (!res.richter.length) continue;
  rohProKey.set(key, res.richter);
  for (const r of res.richter) {
    kanonInput.push({ slug: r.slug, nachSlug: r.nachSlug, givenSlug: r.givenSlug, givenAbk: r.givenAbk, name: r.name, raum: s.kanton });
  }
}
const kanon = kanonisiere(kanonInput);

// Manifest-keys sind nicht zwingend die Snapshot-ids — über die Schnittmenge prüfen.
const manifestByKey = new Map(manifest.entscheide.map((e) => [e.key, e]));
let verglichen = 0, abweichungen = 0;
for (const [key, roh] of rohProKey) {
  const e = manifestByKey.get(key);
  if (!e) continue;
  verglichen++;
  const erwartet = roh.map((r) => `${kanon.map.get(`${raumVon.get(key)}|${r.slug}`) ?? r.slug}:${r.rolle}`).join(',');
  const ist = (e.richter ?? []).map((r) => `${r.s}:${r.r}`).join(',');
  if (erwartet !== ist) {
    abweichungen++;
    if (abweichungen <= 5) fehler.push(`G3 DRIFT: ${key}\n     Snapshot→Projektion: ${erwartet}\n     im Manifest:         ${ist}`);
  }
}
if (abweichungen > 5) fehler.push(`G3 DRIFT: … und ${abweichungen - 5} weitere.`);

// Selbstprüfung des Tors (Anti-Vakuum): G3 ist nur dann eine Aussage, wenn es
// tatsächlich Einträge verglichen hat. Deckt der Vergleich nicht die grosse Mehrheit
// der Entscheide mit Spruchkörper ab, stimmt die Schlüssel-Bildung nicht mehr mit
// dem Generator überein — das ist ein Tor-Defekt und muss ROT sein, nicht still grün.
const G3_MINDEST = 0.95;
if (verglichen < mitRichter * G3_MINDEST) {
  fehler.push(
    `G3 VAKUUM: nur ${verglichen} von ${mitRichter} Einträgen mit Spruchkörper verglichen `
    + `(< ${(G3_MINDEST * 100).toFixed(0)} %). Die Schlüssel-Bildung weicht vom Generator ab — `
    + `der Determinismus-Nachweis wäre wertlos.`,
  );
}

// ── Fidelity-Stichprobe: Nachname muss im amtlichen Freitext stehen ──
// Deterministische Auswahl (jeder n-te Schlüssel), damit der Lauf reproduzierbar ist.
const keys = [...rohProKey.keys()].sort();
const SCHRITT = Math.max(1, Math.floor(keys.length / 200));
let stichprobe = 0, treffer = 0;
for (let i = 0; i < keys.length; i += SCHRITT) {
  const key = keys[i];
  const ft = fold(freitextVon.get(key) ?? '');
  for (const r of rohProKey.get(key)!) {
    stichprobe++;
    // Der gefaltete Nachname muss als Teilkette im gefalteten Freitext vorkommen.
    const nach = r.nachSlug.replace(/-/g, '-');
    if (ft.includes(nach)) treffer++;
    else fehler.push(`FIDELITY: ${key} → «${r.name}» (${r.nachSlug}) steht nicht im amtlichen Freitext.`);
  }
}

// ── G4 Abdeckung (Schwellen) ──
const proKorpus = new Map<string, { mit: number; total: number }>();
for (const e of manifest.entscheide) {
  if (e.datei === null) continue;   // Verweis-Einträge tragen keine eigene Besetzung
  const k = e.gerichtstyp === 'kantonal' ? `${e.kanton}` : 'Bund';
  const v = proKorpus.get(k) ?? { mit: 0, total: 0 };
  proKorpus.set(k, v);
  v.total++;
  if (e.richter?.length) v.mit++;
}
const SCHWELLE: Record<string, number> = { BS: 95, Bund: 90 };
for (const [k, v] of proKorpus) {
  const quote = v.total ? (v.mit / v.total) * 100 : 0;
  const min = SCHWELLE[k];
  const zeile = `${k}: ${v.mit}/${v.total} (${quote.toFixed(1)} %)`;
  if (min !== undefined && quote < min) fehler.push(`G4 ABDECKUNG unter Schwelle — ${zeile}, erwartet ≥ ${min} %.`);
  else console.log(`[check:besetzung]   ${zeile}${min !== undefined ? ` (Schwelle ≥ ${min} %)` : ''}`);
}

// ── Kollisions-Report (WARN) ──
for (const z of kanon.kollisionen) warnung.push(z);

// ── Ausgabe ──
console.log(`[check:besetzung] Register: ${geprueft} Slugs · Manifest: ${mitRichter} Entscheide mit Spruchkörper`);
console.log(`[check:besetzung] Determinismus: ${verglichen} Einträge verglichen, ${abweichungen} Abweichungen`);
console.log(`[check:besetzung] Fidelity-Stichprobe: ${treffer}/${stichprobe} Nachnamen im amtlichen Freitext belegt`);
if (warnung.length) {
  console.log(`[check:besetzung] Kollisions-Report (${warnung.length}) — Sichtung, kein Blocker:`);
  for (const w of warnung) console.log(`    · ${w}`);
}
if (fehler.length) {
  console.error(`\n[check:besetzung] ROT — ${fehler.length} Befund(e):`);
  for (const f of fehler) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('[check:besetzung] GRÜN — kein Anonymisierungs-Leck, Projektion deterministisch, Abdeckung über Schwelle.');
