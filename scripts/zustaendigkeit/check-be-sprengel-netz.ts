// scripts/zustaendigkeit/check-be-sprengel-netz.ts — Netz-Tor `check:be-sprengel-netz`.
//
// Drift-Erkennung gegen die amtliche Quelle (§7-Pflichtmerkmal (d)): bezieht
// die drei GeoPackages FRISCH, rechnet die Zuordnung komplett neu und hält sie
// gegen das committete Artefakt. Es wird nicht «ob die Datei noch da ist»
// geprüft, sondern ob die AMTLICHE ZUORDNUNG noch dieselbe ist — eine
// Sprengel-Änderung (Gemeindefusion, Kantonswechsel wie Moutier 1.1.2026,
// neuer Gerichtssitz) wird damit als Einzelzeile sichtbar.
//
// Zusätzlich: Erreichbarkeit der im Artefakt geführten Live-Links (§7 (c)).
// Läuft NIE in der Merge-Kette — Netz-Tore gehören in den Normen-Monitor.

import { beziehe, leseArtefakt, leseStand, ordneZu } from './be-sprengel-kern';

const NETZ_KOPF = { 'User-Agent': 'LexMetrik/1.0 (+https://lexmetrik.ch; Drift-Prüfung amtlicher Geodaten)' };
const fehler: string[] = [];

const alt = leseArtefakt() as {
  stand: string;
  quelle: Record<string, unknown> & { datensaetze: { code: string; detail: string; bezug: string }[] };
  gerichte: unknown[];
  staatsanwaltschaften: unknown[];
  gemeinden: Record<string, [number, number]>;
  namen: Record<string, number>;
  kreise: Record<string, number>;
};

await beziehe(true);
const standLive = await leseStand();
if (standLive !== alt.stand) {
  fehler.push(`Stand: Quelle führt ${standLive}, Artefakt ${alt.stand} — Geodaten neu veröffentlicht, Generator nachziehen (--abrufdatum setzen).`);
}
const neu = ordneZu();

const vgl = (name: string, a: unknown, b: unknown): void => {
  const sa = JSON.stringify(a);
  const sb = JSON.stringify(b);
  if (sa !== sb) fehler.push(`${name}: weicht ab.\n      Artefakt: ${sa.slice(0, 400)}\n      Quelle:   ${sb.slice(0, 400)}`);
};
vgl('gerichte', alt.gerichte, neu.gerichte);
vgl('staatsanwaltschaften', alt.staatsanwaltschaften, neu.staatsanwaltschaften);
vgl('kreise', alt.kreise, neu.kreise);

// Gemeinde-Differenzen einzeln benennen — eine Sammelmeldung «weicht ab» ist
// bei 334 Zeilen unbrauchbar.
const alleBfs = [...new Set([...Object.keys(alt.gemeinden), ...Object.keys(neu.gemeinden)])].sort((x, y) => Number(x) - Number(y));
const nameZuBfs = (q: Record<string, number>, bfs: string): string => Object.keys(q).find((n) => q[n] === Number(bfs)) ?? '?';
let gemeindeDiffs = 0;
for (const bfs of alleBfs) {
  const a = alt.gemeinden[bfs];
  const b = neu.gemeinden[bfs];
  if (a === undefined) { fehler.push(`Gemeinde ${bfs} (${nameZuBfs(neu.namen, bfs)}): NEU in der Quelle.`); gemeindeDiffs++; continue; }
  if (b === undefined) { fehler.push(`Gemeinde ${bfs} (${nameZuBfs(alt.namen, bfs)}): in der Quelle WEGGEFALLEN.`); gemeindeDiffs++; continue; }
  if (a[0] !== b[0] || a[1] !== b[1]) {
    fehler.push(`Gemeinde ${bfs} (${nameZuBfs(alt.namen, bfs)}): Sprengel gewechselt [${a.join(',')}] → [${b.join(',')}].`);
    gemeindeDiffs++;
  }
}
vgl('namen', alt.namen, neu.namen);

// Live-Links (§7 (c)): jeder https-Link des Artefakts muss antworten.
const links = [
  ...Object.values(alt.quelle).filter((w): w is string => typeof w === 'string' && w.startsWith('https://')),
  ...alt.quelle.datensaetze.flatMap((d) => [d.detail, d.bezug]),
  ...(alt.gerichte as { url: string | null }[]).map((g) => g.url).filter((u): u is string => typeof u === 'string'),
];
for (const url of [...new Set(links)].sort()) {
  try {
    const kopf = await fetch(url, { method: 'HEAD', headers: NETZ_KOPF, redirect: 'follow' });
    // Manche Hosts beantworten HEAD nicht — dann mit GET nachfassen.
    const status = kopf.ok ? kopf.status : (await fetch(url, { method: 'GET', headers: NETZ_KOPF, redirect: 'follow' })).status;
    if (status >= 400) fehler.push(`Live-Link tot: ${url} → HTTP ${status}`);
  } catch (e) {
    fehler.push(`Live-Link nicht erreichbar: ${url} → ${(e as Error).message}`);
  }
}

console.log('check:be-sprengel-netz — Drift der BE-Sprengel gegen die amtlichen Geodaten:');
console.log(`  Stand Quelle ${standLive} · Artefakt ${alt.stand}`);
console.log(`  ${Object.keys(neu.gemeinden).length} Gemeinden neu gerechnet · ${gemeindeDiffs} Gemeinde-Abweichung(en) · ${[...new Set(links)].length} Live-Links geprüft`);
if (fehler.length > 0) {
  console.error(`\ncheck:be-sprengel-netz ROT — ${fehler.length} Befund(e):`);
  for (const f of fehler) console.error(`  · ${f}`);
  process.exit(1);
}
console.log('\ncheck:be-sprengel-netz grün — Zuordnung, Adressen und Live-Links unverändert.');
