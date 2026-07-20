// scripts/check-ci-laeufe.ts — Wächter über die geplanten Workflow-Läufe (F2c).
//
// VORFALL 13.–20.7.2026: `turso-sync.yml` lief sechsmal je exakt in den
// 20-Minuten-Timeout und endete als `cancelled`. GitHub färbt einen
// abgebrochenen Lauf GRAU, nicht rot — in der Lauf-Liste sieht das aus wie
// «nichts Besonderes». Der Suchindex veraltete eine ganze Woche unbemerkt.
//
// WARUM EIN TOR UND KEIN SATZ IN EINEM SKILL: Der erste Anlauf verankerte die
// Regel «cancelled und skipped zählen als ROT» im Skill »landung« (Schritt 5).
// Die adversariale Prüfung (20.7.2026) hat das zu Recht als unwirksam
// beanstandet: der Skill wird nur geladen, wenn zufällig jemand gerade einen PR
// landet. Ein Ausfall, der niemanden zum Landen bringt, bleibt genau so
// unentdeckt wie am 13.7. Der Auslöser war falsch gewählt — Landung statt
// Zeitablauf. Dieses Tor hängt an der Zeit: es fragt den tatsächlichen Zustand
// der geplanten Workflows ab, unabhängig davon, was jemand gerade tut.
//
// PRÜFUNG je Workflow mit `schedule:`-Trigger:
//   (1) Der JÜNGSTE abgeschlossene Lauf ist `success`. `cancelled`, `skipped`,
//       `failure`, `timed_out` zählen als ROT — nicht als «grau».
//   (2) Er liegt nicht länger zurück als das Doppelte seines Intervalls
//       (Kulanz für Verzögerungen). Ein Workflow, der gar nicht mehr startet,
//       ist genau so defekt wie einer, der scheitert — und fällt sonst
//       niemandem auf, weil es keinen roten Lauf zu sehen gibt.
//
// KEIN STILLER SKIP (§6 Ziff. 7 lit. b): fehlt `gh` oder die Authentisierung,
// meldet das Tor das sichtbar als SKIP mit Exit 0 — nie still grün, und nie
// rot wegen einer fehlenden Voraussetzung, die nichts über den Zustand aussagt.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';

type Lauf = { conclusion: string | null; status: string; createdAt: string; url: string };

const DIR = '.github/workflows';
const STUNDE = 3_600_000;

/** Cron-Intervall grob in Stunden — reicht für die Kulanz-Schwelle. */
function intervallStunden(cron: string): number {
  const [minute, stunde, , , wochentag] = cron.trim().split(/\s+/);
  if (wochentag && wochentag !== '*') return 24 * 7;      // wöchentlich
  if (stunde.includes('/')) return Number(stunde.split('/')[1]) || 6;
  if (stunde === '*') return minute.includes('/') ? 1 : 1;
  return 24;                                              // täglich
}

/** Workflows mit schedule:-Trigger → Datei + Intervall. */
function geplante(): { datei: string; stunden: number }[] {
  const out: { datei: string; stunden: number }[] = [];
  for (const datei of readdirSync(DIR)) {
    if (!/\.ya?ml$/.test(datei)) continue;
    const inhalt = readFileSync(`${DIR}/${datei}`, 'utf8');
    const crons = [...inhalt.matchAll(/^\s*-\s*cron:\s*'([^']+)'/gm)].map((m) => m[1]);
    if (!crons.length) continue;
    out.push({ datei, stunden: Math.min(...crons.map(intervallStunden)) });
  }
  return out;
}

function skip(grund: string): never {
  console.log(`check:ci-laeufe SKIP — ${grund}. Kein Urteil über die geplanten Läufe.`);
  process.exit(0);
}

let laeufeRoh: string;
try {
  execFileSync('gh', ['auth', 'status'], { stdio: 'ignore' });
} catch {
  skip('`gh` fehlt oder ist nicht authentisiert');
}

const plaene = geplante();
if (!plaene.length) skip(`keine Workflows mit schedule:-Trigger in ${DIR}`);

const fehler: string[] = [];
const ok: string[] = [];

for (const { datei, stunden } of plaene) {
  try {
    laeufeRoh = execFileSync(
      'gh',
      ['run', 'list', '--workflow', datei, '--limit', '10',
       '--json', 'conclusion,status,createdAt,url'],
      { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8', timeout: 60_000 },
    );
  } catch (e) {
    fehler.push(`  ${datei}: Lauf-Liste nicht abrufbar (${(e as Error).message.split('\n')[0]}).`);
    continue;
  }

  const laeufe = (JSON.parse(laeufeRoh) as Lauf[])
    .filter((l) => l.status === 'completed');

  if (!laeufe.length) {
    fehler.push(`  ${datei}: kein einziger abgeschlossener Lauf — der Workflow startet nicht.`);
    continue;
  }

  const juengster = laeufe[0];
  const alterH = (Date.now() - Date.parse(juengster.createdAt)) / STUNDE;

  if (juengster.conclusion !== 'success') {
    const grau = juengster.conclusion === 'cancelled' || juengster.conclusion === 'skipped';
    fehler.push(
      `  ${datei}: jüngster Lauf '${juengster.conclusion}'` +
      (grau ? ' (GitHub färbt das GRAU, nicht rot — genau der Vorfall vom 13.–20.7.2026)' : '') +
      `\n      ${juengster.url}`);
    continue;
  }

  if (alterH > stunden * 2) {
    fehler.push(
      `  ${datei}: jüngster erfolgreicher Lauf ist ${alterH.toFixed(1)} h alt ` +
      `(Intervall ${stunden} h, Kulanz ${stunden * 2} h) — der Zeitplan greift nicht mehr.\n` +
      `      ${juengster.url}`);
    continue;
  }

  ok.push(`${datei} (${alterH.toFixed(1)} h alt, Intervall ${stunden} h)`);
}

if (fehler.length) {
  console.log(
    `check:ci-laeufe ROT — ${fehler.length} von ${plaene.length} geplanten ` +
    `Workflow(s) nicht in Ordnung:\n${fehler.join('\n')}\n\n` +
    `  'cancelled' und 'skipped' zählen als ROT (CLAUDE.md §6 Ziff. 7 lit. c).\n` +
    `  Ein grauer Lauf ist kein bestandener Lauf.`);
  process.exit(1);
}

console.log(
  `check:ci-laeufe OK — alle ${plaene.length} geplanten Workflows zuletzt ` +
  `erfolgreich und im Zeitfenster: ${ok.join(', ')}.`);
