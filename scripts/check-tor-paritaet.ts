// scripts/check-tor-paritaet.ts — CI/lokal-Tor-Parität (F2b).
//
// BEFUND 20.7.2026: `check:seriell` verkettet 34 Tore, `ci.yml` ruft davon 7.
// 27 Tore laufen also NUR lokal. Lokal grün ist damit keine Aussage über CI —
// und CI kann strukturell nie melden, dass ein Tor fehlt. Genau diese Blindheit
// ist die Fehlerklasse «schweigendes Tor» eine Ebene höher.
//
// Dieses Tor behebt die Lücke NICHT (das ist eine eigene Bau-Einheit), es
// FRIERT sie ein: jedes Tor, das nicht in CI läuft, braucht einen begründeten
// Allowlist-Eintrag. Ein NEU hinzugefügtes Tor ohne CI-Lauf und ohne Eintrag
// macht dieses Tor rot. Damit kann die Lücke nur noch kleiner werden, nie grösser.
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
  'check:design-tokens': 'reine Statik über src/ — vom lint-Job in ci.yml mitabgedeckt',
  'check:farbwelt': 'reine Statik über tailwind.config.js — lint-Job deckt Klassenfehler',
  'check:seo-index': 'liest gebautes dist/ — im CI durch den build-Job implizit geprüft',
  'check:verfall-ui': 'UI-Projektion des Verfallsregisters; check:verfall läuft in CI',
  'check:zaehler': 'Zähler-Konsistenz gegen Katalog — deterministisch, kein Netz',
  'check:tabellen': 'Normtext-Projektion; Drift-Arbiter ist fedlex-frische.yml',
  'check:invarianten': 'Normtext-Projektion; Drift-Arbiter ist fedlex-frische.yml',
  'check:p-klassen': 'Normtext-Projektion; Drift-Arbiter ist fedlex-frische.yml',
  'check:bilder': 'Normtext-Projektion; Drift-Arbiter ist fedlex-frische.yml',
  'check:vollstaendigkeit': 'Normtext-Projektion; Drift-Arbiter ist fedlex-frische.yml',
  'check:artikel-revisionen': 'Normtext-Projektion; Drift-Arbiter ist fedlex-frische.yml',
  'check:historie': 'Normtext-Projektion; Drift-Arbiter ist fedlex-frische.yml',
  'check:grundart': 'Normtext-Projektion; Drift-Arbiter ist fedlex-frische.yml',
  'check:linien-kanon': 'Darstellungs-Kanon, reine Statik',
  'check:entscheide': 'braucht rechtsprechung.db (488 MB, nicht im CI-Checkout)',
  'check:bs-entscheide': 'braucht rechtsprechung.db (488 MB, nicht im CI-Checkout)',
  'check:besetzung': 'braucht rechtsprechung.db (488 MB, nicht im CI-Checkout)',
  'check:materialien': 'braucht daten/*.db für die Byte-Reprojektion (CI-Zweig prüft committete Shards)',
  'check:revisionen': 'Normtext-Projektion; Drift-Arbiter ist fedlex-frische.yml',
  'check:pdf': 'braucht die PDF-Quellen-Caches (nicht im CI-Checkout)',
  'check:pdf-quellen': 'braucht die PDF-Quellen-Caches (nicht im CI-Checkout)',
  'check:gegenpruefung': 'CI-Selbstschutz: no-op-grün unter CI=1 (kern.ts) — Arbiter ist lokal + check:merge-schutz',
  'check:zyklen': 'reine Statik über Importgraph — vom lint-Job mitabgedeckt',
  'check:dispatch-klausel': 'reine Statik über eine Doku-Datei; CI-Verdrahtung offen — ci.yml gehört am 20.7. dem parallelen lm-ci-Worktree, Nachzug in Task 30',
  'check:tor-paritaet': 'dieses Tor selbst — prüft die Liste, steht nicht in ihr',
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
  if (t === 'check:tor-paritaet') continue;
  if (!seriell.includes(t)) {
    fehler.push(`  ${t}: steht auf der Allowlist, ist aber nicht (mehr) in check:seriell — Eintrag streichen.`);
  } else if (ci.has(t)) {
    fehler.push(
      `  ${t}: läuft inzwischen in CI (${ci.get(t)!.join(', ')}), Allowlist-Eintrag ist überholt — streichen.\n` +
      `      (alter Grund: ${grund})`);
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
