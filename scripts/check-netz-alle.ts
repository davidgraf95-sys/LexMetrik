// scripts/check-netz-alle.ts — Runner der Netz-Tor-Kette `check:netz` (§17, QS-MONITOR-ROT
// Verfahrens-Gap, 1.9.2026).
//
// WARUM: `check:netz` war eine `&&`-Kette von 12 `npm run check:*-netz`. Sie bricht beim ersten
// roten Tor ab — der Normen-Monitor zeigte darum immer nur EINEN Befund je Lauf, und jeder
// weitere wurde erst nach dem Fix des ersten sichtbar (14.8.2026: zwei CI-Rotläufe für die
// Entdeckung; 24.8./31.8.: Kanonik-Arbiter verdeckte alles dahinter). Hier laufen ALLE Glieder
// nacheinander (Netz-Disziplin: sequentiell, nie parallel), jedes mit voller Ausgabe, und am
// Ende steht die Tafel aller Verdikte. Exit 1, sobald EIN Glied rot ist — das Tor bleibt scharf.
//
// Die Kette selbst steht weiterhin in package.json (`check:netz:kette`, die alte `&&`-Zeile),
// damit Doku und Werkzeuge sie wie bisher lesen; dieser Runner interpretiert sie nur.
// Rot-Beweis: NETZ_KETTE='npm run check:nope-a && npm run check:nope-b' zeigt ZWEI rote
// Glieder (die `&&`-Kette hätte nach dem ersten abgebrochen).

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function leseKette(): string[] {
  const roh = process.env.NETZ_KETTE ?? (() => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts?: Record<string, string> };
    const k = pkg.scripts?.['check:netz:kette'];
    if (!k) {
      console.error('check-netz-alle: package.json enthält kein "check:netz:kette" — Kette unbekannt.');
      process.exit(1);
    }
    return k;
  })();
  const namen: string[] = [];
  for (const teil of roh.split('&&')) {
    const m = teil.trim().match(/^npm run (\S+)$/);
    if (m) namen.push(m[1]);
  }
  if (namen.length === 0) {
    console.error('check-netz-alle: keine "npm run …"-Glieder in der Kette gefunden.');
    process.exit(1);
  }
  return namen;
}

const tore = leseKette();
const verdikte: { tor: string; exit: number; sekunden: number }[] = [];
console.log(`check:netz — ${tore.length} Netz-Tore, sequentiell, alle bis zum Ende:\n`);
for (const tor of tore) {
  const start = Date.now();
  console.log(`\n══ ${tor} ══`);
  const r = spawnSync('npm', ['run', tor], { stdio: 'inherit', env: process.env });
  const exit = r.status ?? 1;
  verdikte.push({ tor, exit, sekunden: Math.round((Date.now() - start) / 1000) });
}

const rot = verdikte.filter((v) => v.exit !== 0);
console.log('\n── check:netz — Tafel ───────────────────────────────────────');
for (const v of verdikte) {
  console.log(`  ${v.exit === 0 ? 'grün' : 'ROT '}  ${v.tor.padEnd(32)} exit ${v.exit}  (${v.sekunden}s)`);
}
if (rot.length) {
  console.error(`\ncheck:netz ROT — ${rot.length}/${verdikte.length} Tor(e) rot: ${rot.map((v) => v.tor).join(', ')}.`);
  process.exit(1);
}
console.log(`\ncheck:netz grün — alle ${verdikte.length} Netz-Tore bestanden.`);
