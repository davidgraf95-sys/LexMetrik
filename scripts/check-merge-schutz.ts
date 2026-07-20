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

const liste = risiko.slice(0, 12).map((p) => `    ${p}`).join('\n')
  + (risiko.length > 12 ? `\n    … und ${risiko.length - 12} weitere` : '');

const WEG =
  `  Weg: Skill »gegenpruefung« fahren, dann Verdikt als Trailer commiten:\n` +
  `    Gegenpruefung: bestanden (<Modell>, <Linsen>) — <Befunde>\n` +
  `  Beispiel:\n` +
  `    Gegenpruefung: bestanden (Opus 4.8, Extraktion/Identitaet) — 13 Stichproben\n` +
  `    blind gegen die Amtsquelle re-deriviert, 2 Befunde widerlegt und behoben.\n`;

const VORFALL =
  `  Vorfall PR #309 (20.7.2026): 11 erfundene Amtsträger:innen gingen ~1 h auf ` +
  `prod, weil die Merge-Erlaubnis im Bau-Auftrag stand und niemand das Verdikt ` +
  `abwartete.\n`;

if (trailer.length === 0) {
  raus(1,
    `check:merge-schutz ROT — ${risiko.length} Risiko-Datei(en) im committeten ` +
    `Bereich, aber KEIN 'Gegenpruefung:'-Verdikt in den Commits:\n${liste}\n\n` +
    `${VORFALL}\n${WEG}\n` +
    `  Reine Prüflogik ohne Inhaltsänderung: 'Gegenpruefung: n/a — reine Prüflogik' ` +
    `— gilt hier NICHT, denn istPruefLogik() hat diese Dateien bereits ausgenommen.`);
}

// ── FORM DES VERDIKTS ────────────────────────────────────────────────────
// SABOTAGE-BEFUND 20.7.2026 (adversariale Prüfung dieses PR): Der Filter hiess
// `!/^n\/a\b/i.test(t)` — er prüfte NUR, dass der Wert nicht mit «n/a» beginnt.
// Ein leerer Commit mit dem Trailer `Gegenpruefung: x` machte das Tor GRÜN.
// Das Tor validierte damit gegen die eigene Ladung (F2a): jeder Reststring
// genügte. Der einzige gedeckte Umgehungsfall war ausgerechnet der, den der
// Bau-Bericht als Scheiterns-Beweis führte.
//
// Jetzt muss das Verdikt eine PRÜFBARE FORM tragen — Verdikt-Wort aus
// geschlossener Menge, Zuschreibung (Modell + Linsen) und Befund-Text:
//     bestanden (Opus 4.8, Extraktion/Identitaet) — 13 Stichproben …
const VERDIKT = /^(bestanden|behoben)\b/i;
const ZUSCHREIBUNG = /\(([^)]{5,})\)/;      // (Modell, Linsen)
const BEFUNDE = /[—–-]{1,2}\s*(\S[\s\S]{14,})$/; // — <Befunde>, ≥15 Zeichen

type Mangel = { wert: string; grund: string };
const maengel: Mangel[] = [];
const gueltig: string[] = [];

for (const t of trailer) {
  if (/^n\/a\b/i.test(t)) continue; // bewusster n/a-Fall: zählt nie als Verdikt
  if (!VERDIKT.test(t)) {
    maengel.push({ wert: t, grund: `Verdikt-Wort fehlt (erwartet 'bestanden' oder 'behoben' am Anfang)` });
    continue;
  }
  const z = ZUSCHREIBUNG.exec(t);
  if (!z || z[1].split(',').filter((s) => s.trim().length >= 2).length < 2) {
    maengel.push({ wert: t, grund: `Zuschreibung '(<Modell>, <Linsen>)' fehlt oder nennt nicht beides` });
    continue;
  }
  if (!BEFUNDE.test(t)) {
    maengel.push({ wert: t, grund: `Befund-Teil nach '—' fehlt oder ist zu kurz (< 15 Zeichen)` });
    continue;
  }
  gueltig.push(t);
}

if (gueltig.length === 0) {
  const gefunden = maengel.length
    ? `  Gefunden, aber formal untauglich:\n` +
      maengel.map((m) => `    · «${m.wert.slice(0, 90)}»\n      → ${m.grund}`).join('\n') + '\n'
    : `  Nur 'n/a'-Trailer gefunden — die zählen hier nicht.\n`;
  raus(1,
    `check:merge-schutz ROT — ${risiko.length} Risiko-Datei(en) im committeten ` +
    `Bereich, aber KEIN formal taugliches Gegenprüfungs-Verdikt:\n${liste}\n\n` +
    `${gefunden}\n${VORFALL}\n${WEG}`);
}

// ── BINDUNG AN EIN ARTEFAKT ──────────────────────────────────────────────
// Auch ein formal korrekter Trailer bleibt SELBST-ATTESTIERT: der bauende
// Agent kann ihn schreiben. Ein Commit-Text ist kein Prüf-Nachweis, er ist
// eine Behauptung über einen. Darum muss zusätzlich das committete Register
// (bibliothek/register/gegenpruefung-register.md) im selben Bereich gewachsen
// sein — dort steht die Prüfung mit Diff-Hash, Quelle/Stand und Befunden.
// Das Register ist ein unabhängiges Artefakt (§6 Ziff. 7 lit. a): es entsteht
// über `npm run gegenpruefung:ok`, das den Nachweis an genau diesen Diff bindet.
const REGISTER = 'bibliothek/register/gegenpruefung-register.md';
const registerDiff = git(['diff', '--numstat', `${basis}..HEAD`, '--', REGISTER]).trim();
const zugewachsen = registerDiff
  ? Number(registerDiff.split('\n')[0].split('\t')[0] || 0)
  : 0;

if (zugewachsen === 0) {
  raus(1,
    `check:merge-schutz ROT — Verdikt-Trailer vorhanden, aber ${REGISTER} ` +
    `ist im Bereich ${basis.slice(0, 8)}..HEAD NICHT gewachsen.\n\n` +
    `  ${risiko.length} Risiko-Datei(en):\n${liste}\n\n` +
    `  Ein Trailer ist eine BEHAUPTUNG über eine Prüfung, kein Nachweis — der\n` +
    `  bauende Agent kann ihn selbst schreiben (belegt: ein leerer Commit mit\n` +
    `  'Gegenpruefung: x' machte dieses Tor am 20.7.2026 grün). Der Nachweis ist\n` +
    `  der Register-Eintrag mit Diff-Hash, Quelle + Stand und Befunden.\n\n` +
    `  Weg: Skill »gegenpruefung« fahren, dann  npm run gegenpruefung:ok  —\n` +
    `  das schreibt den Eintrag und bindet ihn an genau diesen Diff.`);
}

console.log(
  `check:merge-schutz grün — ${risiko.length} Risiko-Datei(en), ` +
  `${gueltig.length} formal taugliche(s) Verdikt(e), ` +
  `${REGISTER} um ${zugewachsen} Zeile(n) gewachsen.` +
  (maengel.length ? ` (${maengel.length} untauglicher Trailer ignoriert.)` : ''));
