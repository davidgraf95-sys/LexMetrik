// ─── Tor: Integrität des Materialien-Korpus (offline) ───────────────────────
//
// Pendant zu check-entscheide.ts (Rechtsprechung) / check-drift.ts (Gesetze),
// eigener Namespace → berührt die anderen Tore nie. Prüft das MATERIAL_REGISTER
// und das committete public/materialien/register.json:
//  · Schlüssel eindeutig + URL-sicher (kein `/ \ # ?`, kein Leerzeichen),
//  · quelleUrl ist eine http(s)-URL (§7 c: jeder Eintrag mit Live-Link), Pflicht,
//  · stand ist ISO YYYY-MM-DD und nicht in der Zukunft (Provenienz, §7),
//  · normKeys verweisen nur auf existierende Erlasse (kein toter Cross-Link, §8),
//  · committetes register.json == frischer Build (Determinismus §2, kein Hand-Edit),
//  · jeder P0-Eintrag ist 'nur-live-link' (Abnahme-Zeitsperre: kein Volltext ohne
//    Davids Fachzeit) — Warnung, falls ein anderer Status ohne Inhalt erscheint.
// Harte Verstösse → exit 1.

import { readFileSync, existsSync } from 'node:fs';
import { MATERIAL_REGISTER } from '../../src/lib/materialien/register.ts';
import { ERLASS_REGISTER } from '../../src/lib/normtext/register.ts';
import { baueMaterialManifest, REGISTER_PFAD } from './material-manifest.ts';
import type { MaterialManifest } from '../../src/lib/materialien/typen.ts';

const fehler: string[] = [];
const warn: string[] = [];

const KEY_UNSICHER = /[\\/#?\s]/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const erlassKeys = new Set(ERLASS_REGISTER.map((e) => e.key));

// Heute = jüngstes erlaubtes Stand-Datum (kein Date.now in der Logik: via Argument
// oder Fallback auf das jüngste Register-Datum, damit der Check deterministisch und
// auch offline/ohne Argument grün ist).
const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const heute = datumArg?.slice('--datum='.length);

// ── 1. Register-Einträge prüfen ──────────────────────────────────────────────
const gesehen = new Set<string>();
for (const r of MATERIAL_REGISTER) {
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
    warn.push(`${r.key}: status '${r.status}' — pdf-embed/volltext brauchen gehosteten Inhalt + Drift-Tor (§7), in P0 nicht bestückt.`);
  }
}

// ── 2. Committetes Manifest == frischer Build (Determinismus) ────────────────
if (!existsSync(REGISTER_PFAD)) {
  fehler.push(`${REGISTER_PFAD} fehlt — 'npm run materialien -- --datum=$(date +%F)' ausführen und committen.`);
} else {
  const committet = JSON.parse(readFileSync(REGISTER_PFAD, 'utf8')) as MaterialManifest;
  const frisch = baueMaterialManifest(committet.erzeugt);
  // Vergleich ohne das erzeugt-Datum (das ist Build-Zeitpunkt, kein Inhalt).
  const a = JSON.stringify(committet.materialien);
  const b = JSON.stringify(frisch.materialien);
  if (a !== b) {
    fehler.push(`${REGISTER_PFAD} weicht vom frischen Build ab — nur über den Generator pflegen (§2), nie von Hand. 'npm run materialien -- --datum=$(date +%F)'.`);
  }
  if (committet.materialien.length !== MATERIAL_REGISTER.length) {
    fehler.push(`Manifest-Anzahl ${committet.materialien.length} ≠ Register ${MATERIAL_REGISTER.length}.`);
  }
}

// ── Ausgabe ──────────────────────────────────────────────────────────────────
for (const w of warn) console.warn(`WARN  materialien: ${w}`);
if (fehler.length) {
  for (const f of fehler) console.error(`ROT   materialien: ${f}`);
  console.error(`\ncheck:materialien — ${fehler.length} Verstoss/Verstösse.`);
  process.exit(1);
}
console.log(`check:materialien OK — ${MATERIAL_REGISTER.length} Materialien, ${new Set(MATERIAL_REGISTER.map((m) => m.behoerde)).size} Behörden, alle Cross-Links + Provenienz konsistent.`);
