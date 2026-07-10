// scripts/normtext/check-revisionen.ts
// Paket 5 (W2·6-REV) Verifikations-Tor für die Revisions-Timeline-Sidecars.
//
// OFFLINE (`check:revisionen`, in der check-Kette):
//   (1) Determinismus — Sidecar aus store-raw neu gebaut == committetes Sidecar (byte-gleich, §2).
//   (2) Schema-Validität — dateEntryInForce ISO, quelleUrl http/s, erlassKey ∈ Register,
//       art ∈ {aenderung, sammelerlass-marker}, sha stimmt.
//   (3) Cross-Link-Integrität — jeder botschaftKey verweist auf einen existierenden
//       Paket-2-Botschaftseintrag (kein toter Link, §8; Cross-Package-Key-Stabilität, Finding 9).
//   (4) Sortierung — Datum absteigend.
//   (5) DSG-Regressionsanker — Timeline SR 235.1 enthält Einträge VOR und NACH der
//       Totalrevision 2020 (spannt die Totalrevision, Referenzfall).
//   (6) nichtKonsolidiert-Marker gesetzt gdw. dateEntryInForce > Korpus-Stand (Finding 4).
//   (7) Coverage — je Bund-Volltext-Erlass genau ein Sidecar (kein Drift Grundmenge↔Dateien).
//
// NETZ (`check:revisionen-netz`, in check:netz, --netz): Stichproben-Nachfahrt Pfad (b) +
// Cross-Check (a)vs(b) gegen den amtlichen Endpunkt; Treffermenge/shas vs. committet, Drift=Exit 1.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import {
  grundmenge, holeBindingsB, holeStaendeA, baueRevisionen, serialisiere, botschaftIndex,
  type RevisionSidecar,
} from './revisionen-generieren.ts';
import { ERLASS_REGISTER } from '../../src/lib/normtext/register.ts';
import { BOTSCHAFTEN } from '../../src/lib/materialien/botschaften.generated.ts';
import type { SparqlBinding } from '../fedlex-sparql.ts';

const SIDECAR_DIR = 'public/normtext/revisionen';
const RAW_DIR = 'bibliothek/normtext/revisionen-raw';
const netz = process.argv.includes('--netz');
const fehler: string[] = [];

const registerKeys = new Set(ERLASS_REGISTER.map((e) => e.key));
const botschaftKeys = new Set(BOTSCHAFTEN.map((b) => b.key));
const ocZuBotschaft = botschaftIndex();
const meta = grundmenge();

function lade(key: string): RevisionSidecar | null {
  const p = `${SIDECAR_DIR}/${key}.json`;
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8')) as RevisionSidecar;
}

// ── (7) Coverage: Grundmenge ↔ Sidecar-Dateien deckungsgleich ────────────────────
const dateien = existsSync(SIDECAR_DIR)
  ? new Set(readdirSync(SIDECAR_DIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)))
  : new Set<string>();
for (const m of meta) if (!dateien.has(m.key)) fehler.push(`Coverage: Sidecar fehlt für ${m.key}.`);
const grundmengeKeys = new Set(meta.map((m) => m.key));
for (const d of dateien) if (!grundmengeKeys.has(d)) fehler.push(`Coverage: verwaistes Sidecar ${d}.json (nicht in Grundmenge).`);

// ── (1)-(6) je Sidecar ───────────────────────────────────────────────────────────
for (const m of meta) {
  const sidecar = lade(m.key);
  if (!sidecar) continue; // Coverage-Fehler oben
  const rawP = `${RAW_DIR}/${m.key}.json`;
  if (!existsSync(rawP)) { fehler.push(`Determinismus: store-raw fehlt für ${m.key}.`); continue; }
  const raw = JSON.parse(readFileSync(rawP, 'utf8')) as {
    korpusStand: string; bBindings: SparqlBinding[]; aStaende: string[];
  };

  // (1) Determinismus: aus raw neu bauen (mit committetem abgerufen + raw.korpusStand).
  const neu = baueRevisionen(m, raw.bBindings, raw.aStaende, raw.korpusStand, ocZuBotschaft, sidecar.abgerufen);
  if (serialisiere(neu) !== serialisiere(sidecar)) {
    fehler.push(`Determinismus: ${m.key} — Neubau aus raw ≠ committetes Sidecar (Nichtdeterminismus oder Handedit).`);
  }

  // (2)-(6) Invarianten auf dem committeten Sidecar.
  if (!registerKeys.has(sidecar.erlassKey)) fehler.push(`${m.key}: erlassKey nicht im Register.`);
  let vorher = '￿';
  let hatVor2020 = false, hatAb2020 = false;
  for (const r of sidecar.revisionen) {
    if (r.art !== 'aenderung' && r.art !== 'sammelerlass-marker') fehler.push(`${m.key}: unbekannte art «${r.art}».`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.dateEntryInForce)) fehler.push(`${m.key}: dateEntryInForce «${r.dateEntryInForce}» nicht ISO.`);
    if (!/^https?:\/\//.test(r.quelleUrl)) fehler.push(`${m.key}: quelleUrl «${r.quelleUrl}» nicht http(s) (§7c).`);
    if (r.botschaftKey && !botschaftKeys.has(r.botschaftKey)) fehler.push(`${m.key}: toter botschaftKey «${r.botschaftKey}».`);
    if (r.art === 'aenderung' && !r.ocUri) fehler.push(`${m.key}: aenderung ohne ocUri.`);
    // (6) nichtKonsolidiert korrekt gdw. dateEntryInForce > Korpus-Stand.
    const soll = r.dateEntryInForce > raw.korpusStand;
    if (soll !== !!r.nichtKonsolidiert) fehler.push(`${m.key}: nichtKonsolidiert falsch bei ${r.dateEntryInForce} (Korpus-Stand ${raw.korpusStand}).`);
    // (4) Sortierung Datum absteigend.
    if (r.dateEntryInForce > vorher) fehler.push(`${m.key}: Sortierung verletzt bei ${r.dateEntryInForce} (> ${vorher}).`);
    vorher = r.dateEntryInForce;
    if (r.dateEntryInForce < '2020-09-01') hatVor2020 = true; else hatAb2020 = true;
  }

  // (5) DSG-Regressionsanker: spannt die Totalrevision 2020.
  if (m.key === 'DSG' && !(hatVor2020 && hatAb2020)) {
    fehler.push('DSG-Anker: Timeline spannt die Totalrevision 2020 NICHT (Einträge vor UND nach 2020-09-01 erwartet).');
  }
}

// ── Netz: Stichprobe gegen den amtlichen Endpunkt ─────────────────────────────────
if (netz) {
  const stichprobe = ['DSG', 'MWSTG', 'OR', 'DBG'].filter((k) => grundmengeKeys.has(k)).map((k) => meta.find((m) => m.key === k)!);
  try {
    const bindings = await holeBindingsB(stichprobe, fetch);
    const bNachSr = new Map<string, SparqlBinding[]>();
    for (const m of stichprobe) bNachSr.set(m.sr, []);
    for (const b of bindings) { const sr = b.sr?.value; if (sr && bNachSr.has(sr)) bNachSr.get(sr)!.push(b); }
    for (const m of stichprobe) {
      const committet = lade(m.key);
      const rawP = `${RAW_DIR}/${m.key}.json`;
      if (!committet || !existsSync(rawP)) { fehler.push(`Netz: ${m.key} Sidecar/raw fehlt.`); continue; }
      const raw = JSON.parse(readFileSync(rawP, 'utf8')) as { korpusStand: string };
      const abstractEli = raw.korpusStand ? liesAbstract(m.sr) : '';
      const aStaende = abstractEli ? await holeStaendeA(abstractEli, fetch) : [];
      const frisch = baueRevisionen(m, bNachSr.get(m.sr) ?? [], aStaende, raw.korpusStand, ocZuBotschaft, committet.abgerufen);
      if (frisch.sha !== committet.sha) {
        fehler.push(`Netz-Drift: ${m.key} — frische Query-sha ≠ committet (${frisch.revisionen.length} vs ${committet.revisionen.length} Einträge). Neu generieren.`);
      }
    }
  } catch (e) {
    console.error(`check:revisionen-netz: Netzfehler — ${(e as Error).message}`);
    process.exit(2);
  }
}

// cache.sh-Abstract je SR (für den Netz-Cross-Check).
function liesAbstract(sr: string): string {
  const sh = readFileSync('scripts/fedlex-cache.sh', 'utf8');
  for (const m of sh.matchAll(/^\s*"([a-z0-9_]+)\|([a-z0-9/_]+)\|(\d{8})\|[^|]*\|[^|]*\|([0-9.]+)"/gm)) {
    if (m[4] === sr) return m[2];
  }
  return '';
}

if (fehler.length) {
  console.error(`check:revisionen ROT: ${fehler.length} Befund(e):`);
  for (const f of fehler.slice(0, 30)) console.error(`  - ${f}`);
  if (fehler.length > 30) console.error(`  … und ${fehler.length - 30} weitere`);
  process.exit(1);
}
const total = meta.reduce((n, m) => n + (lade(m.key)?.revisionen.length ?? 0), 0);
console.log(`check:revisionen grün${netz ? ' (+netz)' : ''}: ${meta.length} Sidecars, ${total} Einträge, Determinismus + Schema + Cross-Link + DSG-Anker ok.`);
