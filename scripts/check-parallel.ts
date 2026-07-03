/**
 * Paralleler Gate-Runner (Werkzeug-Audit, Nulltarif-Paket §Audit-1).
 *
 * Führt exakt die `check:*`-Sub-Skripte der seriellen Kette (`check:seriell`)
 * gleichzeitig aus (Concurrency ≈ CPU−1) statt seriell verkettet. Der Gewinn ist
 * reines I/O-/Prozess-Overlap: die 20 Sub-Checks sind **alle read-only**
 * (verifiziert 3.7.2026 — nur `check:verfall-ui`/`check:datenhaltung` enthalten
 * überhaupt `writeFileSync`, beide ausschliesslich hinter den NICHT gesetzten
 * Flags `--check`/`--schreibe`), es gibt also keine Schreib-Kollision und keine
 * Reihenfolge-Abhängigkeit zwischen ihnen.
 *
 * §6.1 (kein verstecktes Versagen): Bei JEDEM roten Sub-Check wird dessen VOLLE
 * gepufferte Ausgabe (stdout + stderr) gedruckt und der Runner endet mit Exit 1.
 * Grün: kompakte Zusammenfassung (Name · Dauer), sortiert nach Kettenreihenfolge.
 *
 * §2: kein Date.now in Rechenlogik — die hier gemessene Wanduhr-Dauer ist reine
 * Diagnose-Ausgabe (kein Tor-Verdikt, keine Persistenz).
 *
 * Fallback: `npm run check:seriell` läuft weiterhin die klassische serielle Kette.
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { performance } from 'node:perf_hooks';

interface CheckErgebnis {
  name: string;
  code: number;
  ausgabe: string; // stdout + stderr, in Ankunftsreihenfolge zusammengeführt
  dauerMs: number;
}

/** Liest die Sub-Check-Namen aus `check:seriell` (Single Source of Truth für die
 *  Kette; kein zweites Pflege-Duplikat, §5). Extrahiert jedes `npm run <name>`. */
function leseCheckKette(): string[] {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts?: Record<string, string> };
  const seriell = pkg.scripts?.['check:seriell'];
  if (!seriell) {
    console.error('check-parallel: package.json enthält kein "check:seriell" — Kette unbekannt.');
    process.exit(1);
  }
  const namen: string[] = [];
  for (const teil of seriell.split('&&')) {
    const m = teil.trim().match(/^npm run (\S+)$/);
    if (m) namen.push(m[1]);
  }
  if (namen.length === 0) {
    console.error('check-parallel: keine "npm run check:*"-Glieder in check:seriell gefunden.');
    process.exit(1);
  }
  return namen;
}

function laufeCheck(name: string): Promise<CheckErgebnis> {
  return new Promise((resolve) => {
    const start = performance.now();
    // Kein --silent: bei Rot wollen wir die volle npm-Ausgabe (§6.1).
    const kind = spawn('npm', ['run', name], { stdio: ['ignore', 'pipe', 'pipe'] });
    let ausgabe = '';
    kind.stdout.on('data', (d: Buffer) => { ausgabe += d.toString(); });
    kind.stderr.on('data', (d: Buffer) => { ausgabe += d.toString(); });
    kind.on('close', (code) => {
      resolve({ name, code: code ?? 1, ausgabe, dauerMs: performance.now() - start });
    });
    kind.on('error', (err) => {
      ausgabe += `\n[check-parallel] Prozess-Fehler: ${err instanceof Error ? err.message : String(err)}\n`;
      resolve({ name, code: 1, ausgabe, dauerMs: performance.now() - start });
    });
  });
}

async function main(): Promise<void> {
  const kette = leseCheckKette();
  const concurrency = Math.max(1, cpus().length - 1);
  const gesamtStart = performance.now();

  console.log(`check-parallel: ${kette.length} Sub-Checks, Concurrency ${concurrency} (CPU ${cpus().length}) …`);

  // Einfacher Worker-Pool: nächster freier Slot nimmt den nächsten Namen.
  const ergebnisse = new Map<string, CheckErgebnis>();
  let naechster = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const i = naechster++;
      if (i >= kette.length) return;
      const name = kette[i];
      const e = await laufeCheck(name);
      ergebnisse.set(name, e);
      // Live-Fortschritt (kompakt bei grün, Markierung bei rot).
      const s = (e.dauerMs / 1000).toFixed(1);
      console.log(`${e.code === 0 ? '  ✓' : '  ✗'} ${name.padEnd(28)} ${s.padStart(5)}s`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, kette.length) }, () => worker()));

  const gesamtS = ((performance.now() - gesamtStart) / 1000).toFixed(1);

  // Rote Checks in Kettenreihenfolge, mit VOLLER Ausgabe (§6.1).
  const rote = kette.map((n) => ergebnisse.get(n)!).filter((e) => e.code !== 0);
  if (rote.length > 0) {
    for (const e of rote) {
      console.error(`\n${'═'.repeat(72)}\nFEHLER in ${e.name} (Exit ${e.code}) — volle Ausgabe:\n${'═'.repeat(72)}`);
      console.error(e.ausgabe.trimEnd());
    }
    console.error(`\ncheck-parallel: ${rote.length}/${kette.length} Sub-Check(s) ROT (${gesamtS}s): ${rote.map((e) => e.name).join(', ')}`);
    process.exit(1);
  }

  console.log(`\ncheck-parallel: alle ${kette.length} Sub-Checks GRÜN in ${gesamtS}s (seriell wäre die Summe der Einzeldauern).`);
}

main().catch((err) => {
  console.error('check-parallel: unerwarteter Fehler:', err);
  process.exit(1);
});
