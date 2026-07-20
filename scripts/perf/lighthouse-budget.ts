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
const KALIBRIER_BASIS = zahlAusUmgebung('PERF_KALIBRIER_BASIS', 2000);
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

// ── Schwellen-Kalibrierung (NEU 20.7.2026, empirisch gegen 27 CI-Läufe) ─────
//
// Binding ist der **CI-Runner** (dort läuft das Tor), nicht die lokale Maschine.
//
// Die alte Kalibrierung (5.7.2026) notierte als CI-Ist «OR TBT ~2.3 s» und setzte
// den Deckel auf 4000 ms — gedachte Kopffreiheit ~74 %. Dieses Ist ist seither
// still veraltet: gemessen über die 27 CI-Läufe vom 19./20.7.2026 (jeder Wert
// bereits ein Median aus 3) liegt TBT/OR bei
//
//   min 2262 · Median 3527 · Mittel 3555 · max 5094 ms · sd ≈ 687 ms
//   (nur main-Pushes: Mittel 3821 · max 5094 · sd ≈ 812 — main-Läufe sind
//    systematisch langsamer, weil beim Push mehr Jobs um denselben 2-vCPU-Runner
//    konkurrieren; dieselbe Runner-Starvation wie bei den e2e-Shards.)
//
// Der Deckel 4000 lag damit nur z ≈ +0.65 über dem Mittel ⇒ rechnerisch ~26 %
// Rot-durch-Rauschen; beobachtet 4/27 aller Läufe und 3/10 der main-Läufe rot.
// Ein Tor, das auf main jeden dritten Lauf grundlos rot wirft, misst nicht mehr
// die Software, sondern die Runner-Auslastung — und erzieht zum Rerun-Reflex,
// der echte Regressionen mit durchwinkt (§8).
//
// Beleg, dass es NICHT am Code liegt (der eigentliche Kontrollversuch):
//   • main bae8dff1 — ein **reiner Dokumentations-Commit** (docs/roadmap, keine
//     Code-Zeile) — mass 5094 ms und war ROT. Derselbe Inhalt auf seinem
//     PR-Branch: 3653 und 3830 ms, beide grün. Spanne 1441 ms bei identischem Code.
//   • main 4f363fd0 mass 4537 ms ROT — ebenfalls VOR dem G-HIST-UI-Merge (#305).
//   • Der #305-Branch selbst (2588ef31) mass 3527 ms — den Median aller Läufe,
//     grün. Erst der Merge-Commit desselben Codes (50ffd6ae) mass 5007 ms.
//   • Lokale A/B-Messung (Apple Silicon, Mobil-Preset, je Median aus 7):
//     Vor-#305 (464cfbf4) 815 ms · mit #305 (50ffd6ae) 828 ms ⇒ **+13 ms
//     = +1.6 %**, auf CI-Niveau hochgerechnet ~+56 ms. #305 ist damit ~1/20 der
//     beobachteten Streuung und erklärt den Ausschlag nicht.
//
// WO die Streuung sitzt (Befund aus den neu gedruckten Einzelwerten, 20.7.2026):
// **zwischen den Jobs, nicht innerhalb.** Ein Job druckte
//   Einzelläufe TBT: 5612 · 5149 · 5537 ms  |  LCP: 11.3 · 3.5 · 11.3 s
// — innerhalb des Jobs nur ±9 % Streuung, quer über die Jobs aber 2262…5612 ms
// (Faktor 2.5). Der GitHub-Runner-Pool ist heterogen; welche Maschine ein Job
// zugeteilt bekommt, entscheidet über den Messwert. (Die LCP-Spalte zeigt
// zusätzlich, dass die geteilte Chrome-Instanz mal warm, mal kalt lädt — 3.5 s
// gegen 11.3 s; die historisch «guten» Werte waren überwiegend Warm-Cache.)
//
// Daraus folgt hart: **mehr Läufe je Job mitteln das NICHT weg** — sie mitteln
// nur innerhalb der ±9 %. Ein Probelauf mit RUNS=5 hat das bestätigt (und über
// die Chrome-Drift zusätzlich die Startseite verdorben, siehe RUNS-Kommentar).
// Gegen Between-Job-Varianz hilft nur ein höherer Deckel oder eine
// **Normierung je Job** (Kalibrier-Workload im selben Job messen und das
// VERHÄLTNIS prüfen statt des Absolutwerts) — Letzteres ist der eigentlich
// richtige Bau und als Folgeschritt in ROADMAP/QS-PERF notiert.
//
// Konsequenz — die Schärfe wandert dorthin, wo Signal ist, statt pauschal zu
// lockern:
//   • TBT/OR 4000 → 6500 ms. Über dem beobachteten Maximum (5612 ms) plus ~16 %
//     Kopffreiheit ≈ 2 Within-Job-sd. Das ist ehrlich ein **stumpferer**
//     Absolut-Deckel — er ist der Preis dafür, dass eine Metrik mit Faktor-2.5-
//     Runner-Streuung überhaupt assertierbar bleibt, ohne jeden dritten
//     main-Push grundlos rot zu werfen. Er fängt weiter grobe §15/3-Verstösse
//     («Suchindex in den kritischen Pfad»), aber er ist KEIN feiner
//     Regressions-Fänger mehr; diese Rolle trägt bis zur Job-Normierung die
//     CLS-Schranke unten. Bewusst offengelegt statt stillschweigend gesetzt (§8).
//   • LCP/OR 12000 → 13500 ms. Bei Kalt-Last misst OR 11.31–11.41 s — gegen den
//     alten Deckel nur ~6 % Luft, d. h. die nächste Kalt-Messung wäre ohne
//     Zutun rot geworden. Gleiche stille Erosion wie bei TBT, hier vorab geheilt.
//   • TTI/OR 14000 → 15000 ms (mitziehend, TTI ≈ LCP auf dieser Seite).
//   • CLS/OR 0.15 → 0.05 und Start 0.10 → 0.05 (GEGENGEWICHT, Verschärfung).
//     CLS ist die deterministische, geräteunabhängige Metrik und laut §15.2 «der
//     eigentliche Regressions-Fänger» — beobachtet über dieselben 27 Läufe aber
//     nur 0.004–0.008 auf OR (Start 0.002). Ein Deckel von 0.15 ist das 19- bis
//     37-Fache des Ist und fängt faktisch nichts. 0.05 ist ~6× über dem
//     beobachteten Maximum, also flake-sicher, und deckt sich mit dem Budget, das
//     die CLS-e2e-Specs (verweis-u, gesetze-historie-badge) bereits fahren.
//     Ehrliche Grenze (§8): die #305-CLS-Regression hätte auch dieser Deckel
//     nicht gefangen — sie trat nur auf einer **Anker-Deeplink**-URL auf
//     (/gesetze/bund/MWSTV#art-165), die dieses Tor nicht misst; gefangen hat sie
//     die e2e-Spec. Die Verschärfung stellt die Deckel-Disziplin wieder her, sie
//     ersetzt die Deeplink-Specs nicht.
//   • LCP/TTI/Score hängen wie TBT an CPU+Netz → bewusst grosszügige Deckel.
// Nächster Schritt (nicht in dieser Einheit): eine Anker-Deeplink-URL als dritte
// Messseite aufnehmen, damit der CLS-Deckel die Klasse Spät-Einwuchs auch dort sieht.
const SCHWELLEN: Record<string, { url: string; label: string; s: Schwelle }> = {
  or: {
    url: `${BASE}/gesetze/bund/OR`,
    label: '/gesetze/bund/OR (≈930 KB HTML)',
    s: { clsMax: 0.05, lcpMax: 13500, tbtMax: 6500, tbtNormMax: 0, ttiMax: 15000, scoreMin: 25 },
  },
  start: {
    url: `${BASE}/`,
    label: 'Startseite',
    s: { clsMax: 0.05, lcpMax: 11000, tbtMax: 1500, tbtNormMax: 0, ttiMax: 12000, scoreMin: 40 },
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
