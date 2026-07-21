// scripts/check-tor-paritaet.ts — CI/lokal-Tor-Parität (F2b).
//
// BEFUND 20.7.2026: `check:seriell` verkettet 34 Tore, `ci.yml` ruft davon 7.
// 27 Tore laufen also NUR lokal. Lokal grün ist damit keine Aussage über CI —
// und CI kann strukturell nie melden, dass ein Tor fehlt. Genau diese Blindheit
// ist die Fehlerklasse «schweigendes Tor» eine Ebene höher.
//
// Dieses Tor friert die Lücke ein: jedes Tor, das nicht in CI läuft, braucht
// einen begründeten Allowlist-Eintrag. Ein NEU hinzugefügtes Tor ohne CI-Lauf
// und ohne Eintrag macht dieses Tor rot. Die Lücke kann nur kleiner werden.
//
// NACHTRAG 20.7.2026 (adversariale Prüfung): Das Tor stand SELBST auf seiner
// Allowlist — mit dem Grund «dieses Tor selbst — prüft die Liste, steht nicht
// in ihr». Der Satz war sachlich falsch (es steht sehr wohl in `check:seriell`,
// sonst bräuchte es keinen Eintrag) und die Wirkung war rekursiv F2b: der
// Melder unsichtbarer Tore war selbst unsichtbar. Ein PR, der ein Tor ohne
// CI-Verdrahtung hinzufügt und lokal kein `npm run gate` fährt, blieb
// unbemerkt. Das Tor läuft jetzt in ci.yml und steht auf keiner Liste mehr.
// Ebenso entfielen check:besetzung/entscheide/bs-entscheide, deren
// DB-Begründung nachweislich falsch war (sie lesen committete Projektionen).
import { readFileSync, readdirSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, string>;
};

/** Tore aus der `check:seriell`-Kette, in Reihenfolge. */
function seriellTore(): string[] {
  const kette = pkg.scripts['check:seriell'];
  if (!kette) throw new Error('check:seriell fehlt in package.json — Kette umbenannt?');
  return [...kette.matchAll(/npm run (check:[a-z0-9:-]+)/g)].map((m) => m[1]);
}

/** Tore, die IRGENDEIN Workflow unter .github/workflows/ aufruft. */
function ciTore(): Map<string, string[]> {
  const treffer = new Map<string, string[]>();
  const dir = '.github/workflows';
  for (const datei of readdirSync(dir)) {
    if (!/\.ya?ml$/.test(datei)) continue;
    const inhalt = readFileSync(`${dir}/${datei}`, 'utf8');
    // Nur echte `run:`-Zeilen zählen — ein Tor, das bloss im Kommentar erwähnt
    // wird, läuft nicht (und hat genau diesen Irrtum schon einmal erzeugt).
    for (const zeile of inhalt.split('\n')) {
      const ohneKommentar = zeile.replace(/^\s*#.*$/, '');
      for (const m of ohneKommentar.matchAll(/npm run (check:[a-z0-9:-]+)/g)) {
        const liste = treffer.get(m[1]) ?? [];
        if (!liste.includes(datei)) liste.push(datei);
        treffer.set(m[1], liste);
      }
    }
  }
  return treffer;
}

/**
 * Begründete Ausnahmen: Tore, die bewusst NICHT in CI laufen.
 * Jeder Eintrag braucht einen Grund — «historisch gewachsen» ist keiner.
 * Wer ein Tor hier einträgt, erklärt damit, dass sein Nicht-Laufen in CI
 * ein bewusster Entscheid ist und nicht ein Versehen.
 */
const ALLOWLIST: Record<string, string> = {
  // check:entscheide / check:bs-entscheide / check:besetzung standen hier bis
  // 20.7.2026 mit «braucht rechtsprechung.db (488 MB)». Das war sachlich falsch:
  // sie lesen die committeten Projektionen unter public/rechtsprechung/
  // (ladeBestandSnapshots), nicht die DB — gemessen je ~1 s grün unter CI=1.
  // Alle drei laufen jetzt in ci.yml. Der Eintrag entfiel damit ersatzlos.
  //
  // 18 weitere Einträge (design-tokens, farbwelt, seo-index, verfall-ui,
  // zaehler, tabellen, invarianten, p-klassen, bilder, vollstaendigkeit,
  // artikel-revisionen, historie, grundart, linien-kanon, revisionen, pdf,
  // pdf-quellen, zyklen) entfielen am 21.7.2026 mit der R1-Verdrahtung dieser
  // Tore in ci.yml (Tor-Wirksamkeits-Audit #318: 17 von 20 Delegations-
  // Begründungen hielten der Sabotage-Probe nicht stand).
  'check:materialien': 'braucht daten/*.db für die Byte-Reprojektion (CI-Zweig prüft committete Shards)',
  'check:gegenpruefung': 'liest den Working Tree, der in CI sauber ist; protokolliert unter CI=1 ausdrücklich SKIP (§6 Ziff. 7 lit. b) — Arbiter für den committeten Bereich ist check:merge-schutz in ci.yml',
};

const seriell = seriellTore();
const ci = ciTore();
const fehler: string[] = [];

// (1) Jedes serielle Tor läuft in CI ODER steht begründet auf der Allowlist.
const ungedeckt = seriell.filter((t) => !ci.has(t) && !(t in ALLOWLIST));
for (const t of ungedeckt) {
  fehler.push(
    `  ${t}: läuft in KEINEM Workflow und steht nicht auf der Allowlist.\n` +
    `      → entweder in .github/workflows/ci.yml verdrahten,\n` +
    `      → oder in ALLOWLIST von scripts/check-tor-paritaet.ts mit GRUND eintragen.`);
}

// (2) Verrottete Allowlist: ein Eintrag, dessen Tor inzwischen in CI läuft oder
//     der gar kein serielles Tor (mehr) ist, ist tote Regel und wird gemeldet.
for (const [t, grund] of Object.entries(ALLOWLIST)) {
  if (!seriell.includes(t)) {
    fehler.push(`  ${t}: steht auf der Allowlist, ist aber nicht (mehr) in check:seriell — Eintrag streichen.`);
  } else if (ci.has(t)) {
    fehler.push(
      `  ${t}: läuft inzwischen in CI (${ci.get(t)!.join(', ')}), Allowlist-Eintrag ist überholt — streichen.\n` +
      `      (alter Grund: ${grund})`);
  }
}

// (3) Nennt ein Grund einen Workflow als Ersatz-Arbiter, muss dieser Workflow
//     existieren. Neun Eintraege tragen dieselbe Sammelbegruendung
//     «Drift-Arbiter ist fedlex-frische.yml» — als Prosa ist das nicht
//     ueberpruefbar und war genau der Einwand der adversarialen Pruefung
//     (20.7.2026). Statt neun Mal denselben Satz umzuformulieren, wird die
//     Behauptung MASCHINELL gebunden: verschwindet der genannte Workflow,
//     wird der Verweis rot statt still falsch zu werden.
const vorhandeneWorkflows = new Set(readdirSync('.github/workflows'));
for (const [t, grund] of Object.entries(ALLOWLIST)) {
  for (const m of grund.matchAll(/([a-z0-9-]+\.ya?ml)/g)) {
    if (!vorhandeneWorkflows.has(m[1])) {
      fehler.push(
        `  ${t}: Grund nennt '${m[1]}' als Ersatz-Arbiter, aber ` +
        `.github/workflows/${m[1]} existiert nicht.\n` +
        `      → Der Verweis ist tot: entweder Tor in CI verdrahten oder Grund korrigieren.`);
    }
  }
}

const inCi = seriell.filter((t) => ci.has(t));

if (fehler.length) {
  console.log(`check:tor-paritaet ROT — ${fehler.length} Abweichung(en):\n${fehler.join('\n')}`);
  process.exit(1);
}

console.log(
  `check:tor-paritaet OK — ${seriell.length} Tore in check:seriell: ` +
  `${inCi.length} laufen in CI, ${seriell.length - inCi.length} begründet nur lokal ` +
  `(Allowlist). Keine ungedeckten Tore.`);
