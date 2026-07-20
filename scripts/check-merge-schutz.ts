// scripts/check-merge-schutz.ts — Merge-Tor für Risiko-Pfade (F1, Vorfall PR #309).
//
// WARUM ein eigenes Tor neben `check:gegenpruefung`:
// `risikoDiffHash()` liest den WORKING TREE (`git status --porcelain`). Zum
// Merge-Zeitpunkt ist der Arbeitsbaum sauber — alles ist committet und gepusht.
// Das bestehende Tor ist dort also strukturell grün und kann #309 nicht fangen.
// Dieses Tor prüft stattdessen den COMMITTETEN Bereich merge-base(origin/main)..HEAD.
//
// Einzige Quelle der Risiko-Definition bleibt `behalten()` aus kern.ts (§5) —
// hier wird NICHTS neu klassifiziert, nur ein anderer Diff-Bereich eingespeist.
import { execFileSync } from 'node:child_process';
import { behalten } from './gegenpruefung/kern';

const BASIS = process.env.MERGE_SCHUTZ_BASIS ?? 'origin/main';

function git(args: string[]): string {
  return execFileSync('git', args, {
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 64 * 1024 * 1024,
  }).toString('utf8');
}

function raus(code: number, text: string): never {
  console.log(text);
  process.exit(code);
}

let basis: string;
try {
  basis = git(['merge-base', BASIS, 'HEAD']).trim();
} catch {
  // Kein origin/main erreichbar (frischer Clone, detached CI-Checkout) — das Tor
  // kann seine Referenz nicht bilden. Es meldet das SICHTBAR und wird rot, statt
  // still grün zu werden (§6 Ziff. 7: kein stiller Skip).
  raus(1, `check:merge-schutz ROT — Referenz '${BASIS}' nicht auflösbar. ` +
    `Erst 'git fetch origin', dann erneut. (Kein stiller Skip: ein Tor ohne ` +
    `Referenz ist kein Tor.)`);
}

const geaendert = git(['diff', '--name-only', `${basis}..HEAD`])
  .split('\n')
  .map((z) => z.trim())
  .filter(Boolean);

const risiko = geaendert.filter(behalten);

if (risiko.length === 0) {
  raus(0, `check:merge-schutz grün — kein Risiko-Pfad im committeten Bereich ` +
    `${basis.slice(0, 8)}..HEAD (${geaendert.length} Datei(en) geändert).`);
}

// Trailer im committeten Bereich suchen. `%(trailers)` liest nur echte
// Trailer-Zeilen am Commit-Ende, nicht eine beiläufige Erwähnung im Fliesstext.
const trailer = git(['log', '--format=%(trailers:key=Gegenpruefung,valueonly)', `${basis}..HEAD`])
  .split('\n')
  .map((z) => z.trim())
  .filter(Boolean);

const echte = trailer.filter((t) => !/^n\/a\b/i.test(t));

if (echte.length === 0) {
  const liste = risiko.slice(0, 12).map((p) => `    ${p}`).join('\n');
  const mehr = risiko.length > 12 ? `\n    … und ${risiko.length - 12} weitere` : '';
  raus(1,
    `check:merge-schutz ROT — ${risiko.length} Risiko-Datei(en) im committeten ` +
    `Bereich, aber KEIN 'Gegenpruefung:'-Verdikt in den Commits:\n${liste}${mehr}\n\n` +
    `  Vorfall PR #309 (20.7.2026): 11 erfundene Amtsträger:innen gingen ~1 h auf ` +
    `prod, weil die Merge-Erlaubnis im Bau-Auftrag stand und niemand das Verdikt ` +
    `abwartete.\n\n` +
    `  Weg: Skill »gegenpruefung« fahren, dann Verdikt als Trailer commiten:\n` +
    `    Gegenpruefung: bestanden (<Modell>, <Linsen>) — <Befunde>\n\n` +
    `  Reine Prüflogik ohne Inhaltsänderung: 'Gegenpruefung: n/a — reine Prüflogik' ` +
    `— gilt hier NICHT, denn istPruefLogik() hat diese Dateien bereits ausgenommen.`);
}

console.log(
  `check:merge-schutz grün — ${risiko.length} Risiko-Datei(en), ` +
  `${echte.length} Gegenprüfungs-Verdikt(e) im Bereich: ${echte.map((t) => t.split(/\s/)[0]).join(', ')}.`);
