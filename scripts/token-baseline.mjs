#!/usr/bin/env node
// QS-TOK / T2 — Token-Baseline + Regressionswaechter (read-only).
// Liest die lokalen Claude-Code-JSONL-Logs via `ccusage session --json`
// und aggregiert die Sessions ueber SESSION-TYPEN (K-Korrektur FAHRPLAN
// §2: nicht ueber Wochen — Aufgaben-Mix konfundiert). Typologie = Modell-Set
// der Session (Davids Modell->Rolle-Direktive: Fable orchestriert, Opus baut,
// Haiku mechanisch). Waechter, kein Kausalbeweis.
//
// Nutzung:  node scripts/token-baseline.mjs [--since YYYYMMDD] [--until YYYYMMDD]
// Default-Fenster = Baseline 26.6.-10.7.2026.

import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const since = opt('--since', '20260626');
const until = opt('--until', '20260710');

let raw;
try {
  raw = execFileSync(
    'npx',
    ['-y', 'ccusage@20.0.17', 'session', '--json', '--since', since, '--until', until, '-O'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
  );
} catch (e) {
  console.error('ccusage konnte nicht gelesen werden:', e.message);
  process.exit(1);
}
const data = JSON.parse(raw);
const sessions = data.session ?? [];
if (sessions.length === 0) {
  console.error('Keine Sessions im Fenster', since, '-', until);
  process.exit(1);
}

// --- Typologie (deterministisch aus dem Modell-Set) -------------------------
const NAMES = {
  O: 'Orchestriert (Fable-gefuehrt)',
  B: 'Solo-Bau (Opus)',
  M: 'Bau+mechanisch / leicht',
};
function typeOf(s) {
  const m = new Set(s.modelsUsed);
  if (m.has('claude-fable-5')) return 'O'; // Fable dispatcht -> Orchestrierung
  if (m.size === 1 && m.has('claude-opus-4-8')) return 'B'; // reine Bau-Session
  return 'M'; // opus+haiku, sonnet, haiku -> mechanisch/leicht
}

const buckets = { O: [], B: [], M: [] };
for (const s of sessions) buckets[typeOf(s)].push(s);

function agg(list) {
  const sum = (k) => list.reduce((a, s) => a + s[k], 0);
  const tot = sum('totalTokens');
  const med = (() => {
    const v = list.map((s) => s.totalTokens).sort((a, b) => a - b);
    return v.length ? v[Math.floor(v.length / 2)] : 0;
  })();
  return {
    n: list.length,
    tot,
    mean: list.length ? tot / list.length : 0,
    med,
    cR: sum('cacheReadTokens'),
    cW: sum('cacheCreationTokens'),
    inp: sum('inputTokens'),
    out: sum('outputTokens'),
    cost: sum('totalCost'),
  };
}

const M = (x) => (x / 1e6).toFixed(1) + 'M';
const pct = (x, t) => (t ? (x / t) * 100 : 0).toFixed(1);

console.log(`Token-Baseline  Fenster ${since}-${until}  (read-only)`);
console.log('Typ | n | Tok gesamt | Mean/Sess | Median/Sess | cacheRead% | cacheWrite% | input% | output% | USD');
for (const t of ['O', 'B', 'M']) {
  const a = agg(buckets[t]);
  if (!a.n) continue;
  console.log(
    [
      NAMES[t], a.n, M(a.tot), M(a.mean), M(a.med),
      pct(a.cR, a.tot), pct(a.cW, a.tot),
      (a.inp / a.tot * 100).toFixed(2), (a.out / a.tot * 100).toFixed(2),
      '$' + a.cost.toFixed(0),
    ].join(' | '),
  );
}
const all = agg(sessions);
console.log(
  ['GESAMT', all.n, M(all.tot), M(all.mean), M(all.med),
    pct(all.cR, all.tot), pct(all.cW, all.tot),
    (all.inp / all.tot * 100).toFixed(2), (all.out / all.tot * 100).toFixed(2),
    '$' + all.cost.toFixed(0)].join(' | '),
);
console.log('\nWaechter: bei kuenftiger Messung Mean/Median je Typ vergleichen — ');
console.log('stiller Anstieg (z. B. Caching-Bug 3/2026: 10-20x) faellt hier auf.');
