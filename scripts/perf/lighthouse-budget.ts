// scripts/perf/lighthouse-budget.ts — Lighthouse-Metrik-Schranken des QS-PERF-Tors.
//
// Ergänzt den Chrome-freien Bundle-Teil (scripts/check-perf-budget.ts) um die in
// CLAUDE.md §15 / FAHRPLAN-PERFORMANCE.md geforderten Lighthouse-Schranken:
// CLS/LCP/TBT/TTI/Score auf `/gesetze/bund/OR` (die schwerste Leser-Seite) + der
// Startseite, gemessen im **Lighthouse-Mobil-Preset** (= 4× CPU-Drosselung +
// langsames 4G — exakt das im Audit 30.6.2026 gemessene Worst-Case-Geräteprofil).
//
// Bewusst NICHT im schnellen `npm run gate` (der nicht baut). Es liest ein
// bereits gebautes `dist/` und startet dafür `vite preview` selbst — es gehört
// in den DEPLOY-/CI-Pfad NACH `npm run build` und NACH den Treue-Toren
// (golden/normtext/struktur-konsistenz/suchindex + Reader-e2e). Die
// Gegenkopplung (§15: «Tempo zählt nur, wenn die Treue grün bleibt») wird durch
// die CI-Schritt-Reihenfolge erzwungen: laufen die Treue-Tore rot, bricht der
// Job, bevor dieses Script überhaupt startet.
//
// Chrome-Auflösung (CI reproduzierbar): CHROME_PATH → Playwright-Chromium
// (in CI ohnehin installiert) → chrome-launcher-Default (lokal System-Chrome).
//
// Schwellen sind **Regressions-Deckel mit Kopffreiheit über dem Ist** (siehe
// SCHWELLEN unten), nicht das Endziel — der erste Eintritt soll Rückschritte
// fangen, nicht sofort rot sein. Verschärfung ist dokumentierter Folgeschritt.

import { spawn, type ChildProcess } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const requireCJS = createRequire(import.meta.url);

// ── Konfiguration ──────────────────────────────────────────────────────────

/**
 * Zahl aus einer Umgebungsvariablen — LEERE Variable zählt als «nicht gesetzt».
 * `Number(process.env.X ?? default)` reicht dafür NICHT: `??` greift nur bei
 * `undefined`, und `Number('')` ist `0`. Genau daran ist die erste Messreihe
 * gescheitert — GitHub setzt `${{ github.event.inputs.* }}` bei einem
 * push-Event als LEEREN String, damit wurde PERF_RUNS=0 und das Script mass
 * null Läufe (Median über die leere Liste ⇒ `null` in allen Feldern).
 */
function zahlAusUmgebung(name: string, vorgabe: number): number {
  const roh = process.env[name];
  if (roh === undefined || roh.trim() === '') return vorgabe;
  const n = Number(roh);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`${name}='${roh}' ist keine brauchbare positive Zahl.`);
  }
  return n;
}

const PORT = zahlAusUmgebung('PERF_PORT', 4319);
const BASE = process.env.PERF_BASE_URL ?? `http://localhost:${PORT}`;
const MESSEN_NUR = process.argv.includes('--messen'); // nur messen + drucken, keine Assertion
// Lighthouse-Einzelläufe streuen auf einem geteilten CI-Runner stark (v. a. TBT/
// Score/CLS unter der 4×-CPU-Drossel). Darum je Seite N Läufe → **Median** je
// Metrik (der Standard-Ansatz von Lighthouse-CI gegen Ausreisser-Flake). CI: 3,
// lokal 1 (schnell). Override über PERF_RUNS.
//
// ── Chrome-Isolation je Lauf (NEU 20.7.2026, Baustelle A1) ──────────────────
// Vorher teilte dieses Script EINE Chrome-Instanz über ALLE Läufe BEIDER Seiten.
// Die Instanz driftete über die Läufe, und die zuletzt gemessene Seite erbte die
// Drift: ein Probelauf mit RUNS=5 liess die Startseite (misst als zweite, nach
// allen OR-Läufen) von historisch 143–237 ms TBT auf **1543 ms** springen und
// OR-LCP von ~3.5 s auf 11.3 s — ohne jede Änderung am App-Code. Mehr Läufe
// machten die Messung damit nicht ruhiger, sondern die späteren Werte schlechter;
// zusätzlich mass Lauf 1 kalt und Lauf 2+ warm (LCP 11.3 s gegen 3.5 s im selben Job).
//
// Jetzt startet `einLauf()` je Messung eine **frische Chrome-Instanz** und killt
// sie danach (Kosten ~1–2 s je Lauf, in CI ~9 Läufe ⇒ ~15 s). Damit ist jeder
// Lauf gleich kalt, die Reihenfolge der Seiten ist ohne Einfluss, und der Median
// mittelt echte Instanz-Streuung statt kumulativer Drift.
const RUNS = zahlAusUmgebung('PERF_RUNS', process.env.CI ? 3 : 1);

// ── TBT-Normierung je Job: GEBAUT, GEMESSEN, VERWORFEN (20.7.2026, A2) ──────
//
// Die Idee: die TBT-Streuung sitzt ZWISCHEN den Jobs (heterogener Runner-Pool),
// nicht innerhalb. Ein absoluter Deckel kann daher nicht zwischen «Software
// langsamer» und «langsamen Runner erwischt» unterscheiden. Gegenmittel wäre
// eine Referenzmessung mit demselben Instrument im selben Job: eine synthetische,
// deterministische CPU-Last (`dist/_perf-kalibrier.html`, kein App-Code, kein
// Netz), über dieselbe Lighthouse-Kette gemessen, als Divisor —
//
//   faktor = tbtKalibrier / KALIBRIER_BASIS ;  TBT normiert = TBT roh / faktor
//
// ERGEBNIS DER MESSUNG: **funktioniert nicht zuverlässig — darum wird auf dem
// normierten Wert NICHT assertiert.** Zwei Messreihen zu je 8 unabhängigen
// Runnern (Läufe 29765490018 und 29766507765, identischer App-Code):
//
//                        OR-TBT roh        OR-TBT normiert    Korrelation kalib↔TBT
//   Reihe 1 (n=8)        CV 31.2 %         CV 16.5 %          roh +0.83 → norm −0.21
//   Reihe 2 (n=8)        CV 22.7 %         CV 29.9 %          roh −0.43 → norm −0.80
//   gepoolt (n=16)       CV 26.8 %         CV 23.3 %          roh +0.49 → norm −0.39
//
// Reihe 1 sah nach einem klaren Erfolg aus (Streuung fast halbiert, Runner-
// Korrelation weg). Reihe 2 kehrt das Vorzeichen um: dort korreliert die
// Kalibrierung NEGATIV mit der OR-TBT, und das Normieren VERSCHLECHTERT die
// Streuung. Gepoolt bleibt eine Scheinverbesserung von 26.8 % auf 23.3 %.
//
// Auch eine abgeschwächte Korrektur rettet es nicht. Mit `norm = roh ·
// (BASIS/kalib)^α` liegt das gepoolt beste α bei 0.70 (CV 22.5 %) — aber die
// Wirkung zeigt in den beiden Reihen in ENTGEGENGESETZTE Richtungen
// (Reihe 1: 31.2 → 17.7 %, Reihe 2: 22.7 → 27.1 %). Eine Korrektur, deren
// Vorzeichen von der Stichprobe abhängt, passt Rauschen an, sie entfernt es
// nicht. Die Regressions-Steigung log(TBT)~log(kalib) beträgt 0.65, nicht 1 —
// die unterstellte Proportionalität besteht schlicht nicht: eine reine
// Integer-Schleife misst die Kernfrequenz, die OR-TBT hängt daneben an
// Speicherbandbreite, Cache und Nachbar-Last auf dem geteilten Host.
//
// KONSEQUENZ (§8: lieber ein ehrliches Nein als eine hübsche Zahl):
//   • Assertiert wird weiterhin der ROHWERT.
//   • Die Kalibrierung BLEIBT als Diagnose-Ausgabe (~15 s je Job). Sie ist die
//     Rohmaterial-Basis, falls jemand später einen besseren Normierer baut, und
//     sie macht im Log sofort sichtbar, ob ein Job auf einer langsamen Instanz lief.
//   • Das Ziel «TBT wieder scharf stellen» ist damit auf OR NICHT erreicht.
//     Erreicht wurde es auf den Metriken, die runner-unabhängig sind (Start-TBT,
//     Start-LCP, OR-TTI, Start-Score — siehe SCHWELLEN unten).
// Abschaltbar über PERF_NORMIEREN=0.
const NORMIEREN = process.env.PERF_NORMIEREN !== '0';
// Blockzahl × Iterationen je Block der Kalibrier-Last. Bewusst in ~8 mittellange
// Tasks zerlegt (statt eines Riesen-Tasks): so ähnelt das Lastprofil einer echten
// Seite (viele Long Tasks), TBT summiert über alle, und die TTI-Erkennung von
// Lighthouse bleibt stabil.
const KALIBRIER_BLOECKE = 8;
// Grösse empirisch gewählt (20.7.2026): 8 Blöcke à 5 Mio Iterationen ergeben
// lokal (Apple Silicon, 4×-Drossel) ~0.5 s Kalibrier-TBT und auf dem 2-vCPU-CI-
// Runner ~2 s — also dieselbe Grössenordnung wie die zu normierende OR-TBT.
// Zu klein ⇒ Referenz verschwindet im Messrauschen; zu gross ⇒ der Kalibrier-
// Lauf kostet mehr Zeit, als das Tor spart.
const KALIBRIER_ITER = 5_000_000;
// Kalibrier-Läufe je Job → Median (die Referenz soll selbst nicht flackern).
const KALIBRIER_RUNS = zahlAusUmgebung('PERF_KALIBRIER_RUNS', process.env.CI ? 3 : 1);
// Bezugsgrösse: Median-TBT der Kalibrier-Seite über die CI-Messreihe (Werte und
// Herleitung im SCHWELLEN-Block unten). Ein Runner mit genau diesem Wert bekommt
// Faktor 1.000, d. h. normiert == roh; die normierten Deckel bleiben damit auf
// derselben Grössenordnung wie die bisherigen Absolutwerte und sind direkt lesbar.
const KALIBRIER_BASIS = zahlAusUmgebung('PERF_KALIBRIER_BASIS', 1120);
// Plausibilitätsband: ausserhalb gilt die Kalibrierung als gescheitert (Instrument
// defekt / Seite nicht ausgeliefert / Runner pathologisch) → keine Normierung.
// Bewusst weit: es soll nur Instrument-Ausfall fangen, nicht langsame Runner
// aussortieren — genau die soll die Normierung ja einfangen.
const KALIBRIER_MIN = 150;
const KALIBRIER_MAX = 20_000;

type Schwelle = {
  clsMax: number;     // Cumulative Layout Shift (geräteunabhängig — der harte Regressions-Fänger)
  lcpMax: number;     // Largest Contentful Paint (ms) — CPU-abhängig, grosszügiger Deckel
  tbtMax: number;     // Total Blocking Time (ms)
  ttiMax: number;     // Time To Interactive (ms)
  scoreMin: number;   // Performance-Score 0..100
};

// ── Schwellen-Kalibrierung (NEU 20.7.2026, neues Messregime) ────────────────
//
// Binding ist der **CI-Runner** (dort läuft das Tor), nicht die lokale Maschine.
//
// WARUM NEU ERHOBEN: Die Chrome-Isolation (A1) ändert das Messregime — jeder Lauf
// ist jetzt Kalt-Last statt einer Mischung aus warm und kalt. Die 27-Lauf-Historie
// des alten Regimes ist als Bezug damit entwertet und wurde NICHT übernommen.
// Grundlage sind **16 Messpunkte auf 16 unabhängigen Runner-Zuteilungen**
// (`.github/workflows/perf-kalibrierung.yml`, zwei 8er-Matrizen, je Median aus 3;
// Läufe 29765490018 + 29766507765, identischer App-Code).
//
//   Metrik            min      Mittel     max       sd     Deckel   Rausch-Rot
//   OR TBT          2551      4489      5940     1204     6500        ~4.7 %
//   OR CLS         0.0056    0.0074    0.0093   0.0013    0.05        ~0
//   OR LCP          3508      7484     11613     4098    13500      s. u.
//   OR TTI          9368     10701     11613      864    13000        ~0.4 %
//   OR Score          37        46        53        7       25        ~0
//   Start TBT         98       224       292       57      400        ~0.1 %
//   Start LCP       9141      9225      9275       37    10000        ~0
//   Start Score       65        67        70        2       55        ~0
//   (Rausch-Rot = einseitige Normal-Approximation; beobachtet 0/16 bei ALLEN Deckeln.)
//
// WAS VERSCHÄRFT WURDE — und was nicht (§8):
//   • **Start TBT 1500 → 400.** Der alte Deckel lag 571 % über dem Ist und fing
//     faktisch nichts; 400 liegt 79 % darüber bei ~0.1 % Rausch-Rot. Echte Schärfe.
//   • **Start LCP 11000 → 10000.** Diese Metrik ist erstaunlich stabil: 9141…9275 ms,
//     sd 37 ms über alle 16 Runner (netzgebunden, runner-unabhängig). 10000 liegt
//     8 % über dem Maximum — das sind ~21 sd.
//   • **OR TTI 15000 → 13000** (12 % über dem Maximum) und **Start Score 40 → 55**
//     (min beobachtet 65). Beides echte Verschärfung ohne Flake-Risiko.
//   • **OR TBT bleibt 6500** — hier ist die Verschärfung NICHT gelungen. Der Wert
//     streut über die Runner mit CV 26.8 %; der Versuch, das per Job-Normierung
//     herauszurechnen, ist gemessen gescheitert (Block oben). 6500 liegt 45 % über
//     dem Ist bei ~4.7 % Rausch-Rot und 0/16 beobachteten Überschreitungen. Enger
//     zu ziehen hiesse, Rauschen-Rot zu kaufen; loser zu ziehen hiesse, Schärfe zu
//     verschenken. Das ist der ehrliche Stand, kein Zwischenziel, das schon erreicht wäre.
//   • **OR CLS bleibt 0.05** (5× über dem Ist). CLS ist weiterhin der schärfste
//     geräteunabhängige Fänger — aber nicht mehr der einzige.
//
// OFFEN, bewusst nicht weggedeckelt: **OR-LCP ist bimodal** — 8× ~3.5 s und 8×
// ~11.3–11.6 s, nichts dazwischen, unabhängig von der Runner-Geschwindigkeit. Die
// naheliegende Erklärung (warm/kalt geladen) ist durch die Chrome-Isolation
// ausgeschlossen; vermutlich wählt Lighthouse je nach Timing ein anderes
// LCP-Element. Die sd von 4098 ms ist deshalb ein Artefakt der Zwei-Gipfel-Form,
// nicht echte Streuung: der hohe Modus ist in sich eng (11299…11613 ms, Spanne
// 314 ms), und 13500 liegt 16 % darüber. Der Deckel bleibt, bis die Ursache
// verstanden ist — als offener Schritt in ROADMAP/QS-PERF geführt.
const SCHWELLEN: Record<string, { url: string; label: string; s: Schwelle }> = {
  or: {
    url: `${BASE}/gesetze/bund/OR`,
    label: '/gesetze/bund/OR (≈930 KB HTML)',
    s: { clsMax: 0.05, lcpMax: 13500, tbtMax: 6500, ttiMax: 13000, scoreMin: 25 },
  },
  start: {
    url: `${BASE}/`,
    label: 'Startseite',
    s: { clsMax: 0.05, lcpMax: 10000, tbtMax: 400, ttiMax: 12000, scoreMin: 55 },
  },
};

// ── Preview-Server (falls nicht via PERF_BASE_URL extern gestellt) ───────────

async function warteAufPort(url: string, timeoutMs = 30_000): Promise<void> {
  const bis = Date.now() + timeoutMs;
  while (Date.now() < bis) {
    try {
      const r = await fetch(url, { method: 'HEAD' });
      if (r.ok || r.status === 404) return; // Server antwortet (404 = SPA-Route ok)
    } catch { /* noch nicht oben */ }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Preview-Server unter ${url} nicht erreichbar (Timeout ${timeoutMs} ms).`);
}

async function startePreview(): Promise<ChildProcess> {
  const p = spawn('npm', ['run', 'preview', '--', '--port', String(PORT), '--strictPort'], {
    cwd: process.cwd(),
    stdio: 'ignore',
    detached: false,
  });
  await warteAufPort(BASE);
  return p;
}

// ── Chrome-Auflösung ─────────────────────────────────────────────────────────

function chromePfad(): string | undefined {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  try {
    // Playwright-Chromium (in CI installiert) — hält die Messumgebung reproduzierbar.
    const { chromium } = requireCJS('@playwright/test');
    const p = chromium.executablePath();
    if (p && existsSync(p)) return p;
  } catch { /* Playwright nicht auflösbar → chrome-launcher-Default */ }
  return undefined; // chrome-launcher findet System-Chrome
}

// ── Lighthouse-Lauf ──────────────────────────────────────────────────────────

type Metrik = { cls: number; lcp: number; tbt: number; tti: number; score: number };

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Frische Chrome-Instanz je Messung (Baustelle A1). Vorher teilte das Script EINE
 * Instanz über alle Läufe beider Seiten; sie driftete, und die zuletzt gemessene
 * Seite erbte die Drift (Beleg im RUNS-Kommentar oben). Kosten der Isolation:
 * ~1–2 s je Lauf — der Preis dafür, dass jeder Lauf dieselbe Ausgangslage hat.
 */
async function mitFrischemChrome<T>(fn: (port: number) => Promise<T>): Promise<T> {
  const chrome = await chromeLauncher.launch({
    chromePath: chromePfad(),
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  try {
    return await fn(chrome.port);
  } finally {
    await chrome.kill();
  }
}

async function einLauf(url: string): Promise<Metrik> {
  return mitFrischemChrome(async (port) => {
  // Default = Mobil-Preset: cpuSlowdownMultiplier 4 + langsames 4G (das Audit-Profil).
  const runner = await lighthouse(url, {
    port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance'],
  });
  if (!runner) throw new Error(`Lighthouse lieferte kein Ergebnis für ${url}.`);
  const lhr = runner.lhr;
  const num = (id: string): number => Number(lhr.audits[id]?.numericValue ?? NaN);
  return {
    cls: num('cumulative-layout-shift'),
    lcp: num('largest-contentful-paint'),
    tbt: num('total-blocking-time'),
    tti: num('interactive'),
    score: Math.round((lhr.categories.performance?.score ?? 0) * 100),
  };
  });
}

// ── Kalibrier-Referenz je Job (Baustelle A2) ─────────────────────────────────

/**
 * Schreibt die synthetische Kalibrier-Seite nach `dist/`. Sie enthält KEINEN
 * App-Code, kein Netz, keine Bilder — nur eine deterministische Integer-Schleife
 * in KALIBRIER_BLOECKE gleich grossen Tasks, gestartet nach dem ersten Paint
 * (damit die Blockzeit im TBT-Fenster FCP→TTI liegt). Ihr TBT hängt damit
 * ausschliesslich an der Rechenleistung des Runners.
 *
 * Die Seite wird zur Laufzeit erzeugt (nicht committet): sie ist Messinstrument,
 * kein Produkt-Inhalt, und darf nie im ausgelieferten Build landen. `dist/` wird
 * in CI ohnehin je Lauf frisch aus dem Artefakt gezogen.
 */
function schreibeKalibrierSeite(): string {
  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Perf-Kalibrierung (Messinstrument, kein Inhalt)</title></head>
<body><h1>Kalibrier-Last</h1>
<p>Synthetische, deterministische CPU-Last zur Job-Normierung des Perf-Tors.</p>
<script>
(function () {
  var bloecke = ${KALIBRIER_BLOECKE}, iter = ${KALIBRIER_ITER}, x = 1, n = 0;
  function block() {
    for (var i = 0; i < iter; i++) { x = (x * 1103515245 + 12345) & 0x7fffffff; }
    if (++n < bloecke) setTimeout(block, 0);
    else document.title = 'kalibriert ' + x;
  }
  addEventListener('load', function () { setTimeout(block, 0); });
})();
</script>
</body></html>
`;
  const pfad = join(process.cwd(), 'dist', '_perf-kalibrier.html');
  writeFileSync(pfad, html);
  return `${BASE}/_perf-kalibrier.html`;
}

/** Median-TBT der Kalibrier-Seite = Geschwindigkeits-Fingerabdruck dieses Jobs. */
async function kalibriere(): Promise<number> {
  const url = schreibeKalibrierSeite();
  const werte: number[] = [];
  for (let i = 0; i < KALIBRIER_RUNS; i++) werte.push((await einLauf(url)).tbt);
  const m = median(werte);
  console.log(
    `  Kalibrier-Referenz (synthetische CPU-Last, ${KALIBRIER_BLOECKE}×${KALIBRIER_ITER.toLocaleString('de-CH')} Iter.)\n` +
    `    Einzelläufe TBT: ${werte.map((v) => Math.round(v)).join(' · ')} ms  →  Median ${Math.round(m)} ms`,
  );
  return m;
}

// N Läufe → Median je Metrik (Ausreisser-Flake auf geteiltem CI-Runner dämpfen).
// Die Einzelwerte werden mitgedruckt (Diagnose, ändert nichts am Verdikt): nur so
// ist im CI-Log unterscheidbar, ob ein roter Median echte Last ist oder ein über
// die Läufe driftender Messaufbau (siehe RUNS-Kommentar oben) — sonst diskutiert
// die nächste Session wieder über eine einzelne Zahl ohne Streuung (§8).
async function messe(url: string): Promise<Metrik> {
  const laeufe: Metrik[] = [];
  for (let i = 0; i < RUNS; i++) laeufe.push(await einLauf(url));
  console.log(`    Einzelläufe TBT: ${laeufe.map((m) => Math.round(m.tbt)).join(' · ')} ms`
    + `  |  LCP: ${laeufe.map((m) => (m.lcp / 1000).toFixed(1)).join(' · ')} s`);
  return {
    cls: median(laeufe.map((m) => m.cls)),
    lcp: median(laeufe.map((m) => m.lcp)),
    tbt: median(laeufe.map((m) => m.tbt)),
    tti: median(laeufe.map((m) => m.tti)),
    score: median(laeufe.map((m) => m.score)),
  };
}

// ── Hauptlauf ────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!existsSync(join(process.cwd(), 'dist', 'index.html'))) {
    console.error('check:perf-lighthouse — dist/ fehlt. Zuerst `npm run build`.');
    process.exit(1);
  }

  let preview: ChildProcess | undefined;
  const fehler: string[] = [];
  const bericht: Record<string, unknown> = {};

  try {
    if (!process.env.PERF_BASE_URL) preview = await startePreview();

    console.log(`check:perf-lighthouse — Lighthouse-Mobil (4× CPU + langsames 4G), frische Chrome-Instanz je Lauf, Median aus ${RUNS} ${RUNS === 1 ? 'Lauf' : 'Läufen'}:`);

    // Job-Normierung: zuerst die Referenzlast messen (Baustelle A2).
    let faktor: number | undefined;
    let kalib: number | undefined;
    if (NORMIEREN) {
      kalib = await kalibriere();
      if (kalib >= KALIBRIER_MIN && kalib <= KALIBRIER_MAX) {
        faktor = kalib / KALIBRIER_BASIS;
        console.log(
          `    Normier-Faktor ${faktor.toFixed(3)} (Basis ${KALIBRIER_BASIS} ms)` +
          ` — dieser Runner ist ${faktor >= 1 ? `${((faktor - 1) * 100).toFixed(0)} % langsamer` : `${((1 - faktor) * 100).toFixed(0)} % schneller`} als die Basis.`,
        );
      } else {
        console.log(
          `    ⚠ Kalibrierung UNPLAUSIBEL (${Math.round(kalib)} ms ausserhalb ${KALIBRIER_MIN}–${KALIBRIER_MAX} ms).\n` +
          `      Es wird NICHT normiert; assertiert wird nur der weite Roh-Deckel. Kein stilles Durchwinken (§8).`,
        );
      }
    } else {
      console.log('    (Normierung per PERF_NORMIEREN=0 abgeschaltet — nur Roh-Deckel.)');
    }
    bericht.kalibrierTbt = kalib ?? null;
    bericht.kalibrierFaktor = faktor ?? null;

    for (const [key, { url, label, s }] of Object.entries(SCHWELLEN)) {
      const m = await messe(url);
      const tbtNorm = faktor ? m.tbt / faktor : undefined;
      bericht[key] = { ...m, tbtNorm: tbtNorm ?? null };
      console.log(
        `  ${label}\n` +
        `    Score ${m.score} (≥ ${s.scoreMin})  ` +
        `CLS ${m.cls.toFixed(3)} (≤ ${s.clsMax})  ` +
        `LCP ${(m.lcp / 1000).toFixed(2)} s (≤ ${(s.lcpMax / 1000).toFixed(1)} s)  ` +
        `TBT ${Math.round(m.tbt)} ms (≤ ${s.tbtMax})` +
        (tbtNorm !== undefined ? ` · ${Math.round(tbtNorm)} ms normiert [nur Diagnose]  ` : '  ') +
        `TTI ${(m.tti / 1000).toFixed(2)} s (≤ ${(s.ttiMax / 1000).toFixed(1)} s)`,
      );
      if (!MESSEN_NUR) {
        if (m.cls > s.clsMax) fehler.push(`${label}: CLS ${m.cls.toFixed(3)} > ${s.clsMax} (Layout-Sprung — §15/2, höchste Prio).`);
        if (m.lcp > s.lcpMax) fehler.push(`${label}: LCP ${(m.lcp / 1000).toFixed(2)} s > ${(s.lcpMax / 1000).toFixed(1)} s.`);
        // TBT wird auf dem ROHWERT assertiert. Der normierte Wert wird nur
        // mitgedruckt (Diagnose) — Begründung im NORMIEREN-Block oben.
        if (m.tbt > s.tbtMax) fehler.push(`${label}: TBT ${Math.round(m.tbt)} ms > ${s.tbtMax} ms.`);
        if (m.tti > s.ttiMax) fehler.push(`${label}: TTI ${(m.tti / 1000).toFixed(2)} s > ${(s.ttiMax / 1000).toFixed(1)} s.`);
        if (m.score < s.scoreMin) fehler.push(`${label}: Score ${m.score} < ${s.scoreMin}.`);
      }
    }

    // Bericht persistieren (Diagnose/Trend, nicht committet).
    const outDir = join(process.cwd(), 'dist', '_perf');
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'lighthouse.json'), JSON.stringify(bericht, null, 2));
    // Eine maschinenlesbare Zeile — so lässt sich eine Messreihe über mehrere
    // (Matrix-)Jobs hinweg direkt aus den Logs aggregieren, ohne Artefakte
    // einzusammeln. Wird von `.github/workflows/perf-kalibrierung.yml` genutzt.
    console.log(`PERF-MESSPUNKT ${JSON.stringify(bericht)}`);
  } finally {
    // Chrome-Instanzen werden je Lauf in `mitFrischemChrome` geschlossen (A1).
    if (preview) preview.kill('SIGTERM');
  }

  if (MESSEN_NUR) {
    console.log('check:perf-lighthouse — nur Messung (keine Assertion).');
    return;
  }
  if (fehler.length) {
    console.error('\ncheck:perf-lighthouse ROT:');
    for (const f of fehler) console.error(`  ✗ ${f}`);
    process.exit(1);
  }
  console.log('check:perf-lighthouse GRÜN — Metrik-Schranken (CLS/LCP/TBT/TTI/Score) eingehalten.');
}

main().catch((e) => {
  console.error('check:perf-lighthouse — Fehler:', e instanceof Error ? e.message : e);
  process.exit(1);
});
