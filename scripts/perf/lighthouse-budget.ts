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

// ── TBT-Normierung je Job (NEU 20.7.2026, Baustelle A2) ─────────────────────
//
// Problem (belegt 19./20.7.2026 über 27 CI-Läufe): die TBT-Streuung sitzt
// **zwischen** den Jobs (2262…5612 ms, Faktor 2.5), nicht innerhalb (±9 %).
// Der GitHub-Runner-Pool ist heterogen; welche Maschine ein Job zugeteilt
// bekommt, entscheidet über den Messwert. Ein ABSOLUTER Deckel kann daher nicht
// zwischen «Software langsamer geworden» und «langsamer Runner erwischt»
// unterscheiden — er misst zu einem guten Teil die Runner-Zuteilung.
//
// Mechanismus: **eine Referenzmessung mit demselben Instrument im selben Job.**
// Das Script schreibt eine synthetische Kalibrier-Seite nach `dist/` (fixe,
// deterministische CPU-Last in gleich grossen Blöcken, kein Netz, kein App-Code)
// und misst deren TBT über exakt dieselbe Lighthouse-Kette (gleiche 4×-Drossel,
// gleiche Chrome-Isolation). Dieser Wert hängt NUR an der Runner-Geschwindigkeit,
// nie am Anwendungscode. Daraus:
//
//   faktor       = tbtKalibrier / KALIBRIER_BASIS
//   TBT normiert = TBT roh / faktor
//
// Ein langsamer Runner hebt Zähler und Nenner gemeinsam → normiert bleibt der
// Wert gleich. Eine echte Code-Regression hebt NUR den Zähler → normiert steigt
// sie durch. Genau die Diskriminierung, die dem Absolut-Deckel fehlt.
//
// Zwei Deckel statt einem (bewusst, §8):
//   • `tbtNormMax` — der SCHARFE, diskriminierende Deckel auf dem normierten Wert.
//   • `tbtMax`     — ein WEITER absoluter Sicherheitsnetz-Deckel auf dem Rohwert.
//     Er bleibt, damit eine katastrophale Absolut-Regression auch dann anschlägt,
//     wenn die Kalibrierung selbst danebenliegt (Instrument-Ausfall, Plausibilität
//     unten). Er ist NICHT der Regressions-Fänger — das ist `tbtNormMax`.
//
// Plausibilitäts-Sicherung: liegt die Kalibrier-TBT ausserhalb des als plausibel
// gemessenen Bandes (KALIBRIER_MIN…KALIBRIER_MAX), gilt die Kalibrierung als
// GESCHEITERT — dann wird NICHT normiert, sondern ehrlich gemeldet und nur der
// weite Rohdeckel assertiert (kein stilles Durchwinken, kein stilles Rot).
// Abschaltbar über PERF_NORMIEREN=0 (Diagnose/Vergleichsmessung).
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
  tbtMax: number;     // Total Blocking Time (ms) — WEITES absolutes Sicherheitsnetz (siehe NORMIEREN)
  tbtNormMax: number; // Total Blocking Time (ms), job-normiert — der SCHARFE Regressions-Fänger
  ttiMax: number;     // Time To Interactive (ms)
  scoreMin: number;   // Performance-Score 0..100
};

// ── Schwellen-Kalibrierung (NEU 20.7.2026 — Messregime + Deckel gemeinsam) ──
//
// Binding ist der **CI-Runner** (dort läuft das Tor), nicht die lokale Maschine.
//
// WARUM NEU ERHOBEN: Die Kalibrierung vom Vormittag des 20.7. stammt aus dem
// ALTEN Messregime (eine geteilte, driftende Chrome-Instanz, Läufe mal warm mal
// kalt). Chrome-Isolation (A1) und Job-Normierung (A2) ändern das Regime — die
// alten 27 Läufe sind als Bezug damit entwertet und werden NICHT übernommen.
// Grundlage ist stattdessen eine frische Messreihe im neuen Regime:
// `.github/workflows/perf-kalibrierung.yml`, 8er-Matrix = **8 unabhängige
// Runner-Zuteilungen**, je Median aus 3 Läufen (Lauf 29765490018).
//
// ── Messreihe (8 Runner, neues Regime) ──────────────────────────────────────
//
//   Kalibrier-Referenz   min  720 · Mittel 1118 · max 1476 ms   (Spanne ×2.05)
//     → der Runner-Pool streut faktisch um Faktor 2, wie vermutet.
//
//   OR-TBT roh           min 2551 · Mittel 4185 · max 5465 ms · sd 1307 · CV 31.2 %
//   OR-TBT normiert      min 3007 · Mittel 4231 · max 5437 ms · sd  698 · CV 16.5 %
//
//   Start-TBT roh        min   98 · Mittel  200 · max  266 ms · sd   60 · CV 30.1 %
//   Start-TBT normiert   min  152 · Mittel  202 · max  286 ms · sd   41 · CV 20.2 %
//
// WIRKT DIE NORMIERUNG? Ja, und zwar belegt an zwei unabhängigen Kennzahlen:
//   (1) Relative Streuung OR-TBT **31.2 % → 16.5 %** (fast halbiert).
//   (2) Korrelation zur Runner-Geschwindigkeit **r = +0.83 → −0.21**: der
//       Zusammenhang «langsamer Runner ⇒ hoher Messwert», der den Absolut-Deckel
//       unbrauchbar machte, ist herausgerechnet.
// Der Rest (CV 16.5 %) ist die Within-Job-Streuung BEIDER Messungen (je ~9 %,
// quadratisch addiert ~13 %) — mehr Läufe je Job könnten ihn weiter senken,
// kosten aber Wanduhr; bewusst nicht getan (§8: Grenze offengelegt, nicht
// weggeredet).
//
// ── Deckel-Wahl (Rot-durch-Rauschen einseitig normal-approximiert) ──────────
//
//   OR   normiert 5900 ms → z 2.39 → **~0.8 %** Rauschen-Rot · 39 % über dem Ist
//   Start normiert  300 ms → z 2.39 → **~0.9 %** Rauschen-Rot · 48 % über dem Ist
//
// Zum Vergleich derselbe Datensatz gegen die bisherigen ROH-Deckel:
//   OR roh 4000 (vor #312) → z −0.14 → **56 %** Rauschen-Rot (das gemessene Elend)
//   OR roh 6500 (seit #312) → z 1.77 → **3.8 %** Rauschen-Rot · 55 % über dem Ist
//   Start roh 1500          → **651 %** über dem Ist — fing faktisch nichts.
//
// Der normierte Deckel ist damit auf BEIDEN Achsen besser als der Roh-Deckel:
// seltener grundlos rot (0.8 % statt 3.8 %) UND näher am Ist (39 % statt 55 %).
// Auf der Startseite ist der Gewinn drastisch: von 651 % auf 48 % Kopffreiheit —
// dort war der alte Deckel reine Dekoration. Damit trägt TBT wieder Prüfschärfe;
// CLS musste diese Rolle seit #312 allein tragen (Übergangszustand beendet).
//
// ── Die übrigen Metriken (roh, mit demselben Datensatz nachgezogen) ─────────
//   • OR CLS max 0.0093 ⇒ Deckel 0.05 bleibt (≈5× Luft, flake-sicher).
//   • OR LCP ist **bimodal**: entweder ~3.5 s oder ~11.3–11.6 s, nichts dazwischen
//     (4× / 4× in der Reihe), unabhängig von der Runner-Geschwindigkeit. Der hohe
//     Modus ist in sich eng (11299…11601 ms). Deckel 13500 bleibt: ~16 % über dem
//     beobachteten Maximum. Die Ursache der Bimodalität ist NICHT geklärt (der
//     Verdacht «warm/kalt» ist mit der Chrome-Isolation ausgeschlossen) — als
//     offener Befund in ROADMAP/QS-PERF notiert, statt sie stillschweigend
//     wegzudeckeln (§8).
//   • OR TTI max 11601 ⇒ 15000 → **13000** (z 2.53, ~0.6 % Rauschen-Rot).
//   • Start LCP ist bemerkenswert stabil: 9141…9242 ms, sd 36 ms (CV 0.4 %) über
//     alle acht Runner — netzgebunden, runner-unabhängig. 11000 → **10000**
//     (≈8 % über dem Maximum, ~21 sd): ein echter, scharfer Deckel.
//   • Start Score 66…70 ⇒ 40 → **55** (7.6 sd Luft). OR Score 38…53 ⇒ 25 bleibt
//     (Score ist ein Komposit der ohnehin gedeckelten Metriken; ihn zusätzlich eng
//     zu ziehen erkauft wenig Signal für zusätzliches Rauschen-Rot).
//   • Roh-TBT-Sicherheitsnetze: OR 6500 → **9000** (65 % über dem beobachteten
//     Maximum), Start bleibt 1500. Sie sind bewusst WEIT — scharf ist jetzt der
//     normierte Deckel; das Netz greift nur, wenn die Kalibrierung selbst ausfällt.
//
// Erwartetes Rauschen-Rot des ganzen Tors: **~2 %** (Summe der Einzelrisiken),
// gegen ~4 % allein aus TBT im bisherigen Zustand und ~26 % vor #312.
const SCHWELLEN: Record<string, { url: string; label: string; s: Schwelle }> = {
  or: {
    url: `${BASE}/gesetze/bund/OR`,
    label: '/gesetze/bund/OR (≈930 KB HTML)',
    s: { clsMax: 0.05, lcpMax: 13500, tbtMax: 9000, tbtNormMax: 5900, ttiMax: 13000, scoreMin: 25 },
  },
  start: {
    url: `${BASE}/`,
    label: 'Startseite',
    s: { clsMax: 0.05, lcpMax: 10000, tbtMax: 1500, tbtNormMax: 300, ttiMax: 12000, scoreMin: 55 },
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
        `TBT ${Math.round(m.tbt)} ms roh (≤ ${s.tbtMax} Sicherheitsnetz)` +
        (tbtNorm !== undefined ? ` · ${Math.round(tbtNorm)} ms normiert (≤ ${s.tbtNormMax} scharf)  ` : '  ') +
        `TTI ${(m.tti / 1000).toFixed(2)} s (≤ ${(s.ttiMax / 1000).toFixed(1)} s)`,
      );
      if (!MESSEN_NUR) {
        if (m.cls > s.clsMax) fehler.push(`${label}: CLS ${m.cls.toFixed(3)} > ${s.clsMax} (Layout-Sprung — §15/2, höchste Prio).`);
        if (m.lcp > s.lcpMax) fehler.push(`${label}: LCP ${(m.lcp / 1000).toFixed(2)} s > ${(s.lcpMax / 1000).toFixed(1)} s.`);
        // TBT: der scharfe Deckel greift auf dem NORMIERTEN Wert (Runner-Last
        // herausgerechnet), der weite Roh-Deckel bleibt als Sicherheitsnetz für
        // den Fall, dass die Kalibrierung selbst danebenliegt.
        if (tbtNorm !== undefined && tbtNorm > s.tbtNormMax) {
          fehler.push(`${label}: TBT normiert ${Math.round(tbtNorm)} ms > ${s.tbtNormMax} ms (roh ${Math.round(m.tbt)} ms, Normier-Faktor ${faktor?.toFixed(3)}).`);
        }
        if (m.tbt > s.tbtMax) fehler.push(`${label}: TBT roh ${Math.round(m.tbt)} ms > ${s.tbtMax} ms (absolutes Sicherheitsnetz).`);
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
