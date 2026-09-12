// scripts/zustaendigkeit/be-sprengel-generieren.ts — erzeugt die BE-Sprengel-Tabelle.
//
//   npx vite-node scripts/zustaendigkeit/be-sprengel-generieren.ts -- --abrufdatum=2026-09-12
//
// Schreibt src/data/zustaendigkeit/beSprengel.json (Gemeinde-BFS-Nummer →
// Regionalgericht/Standort + regionale Staatsanwaltschaft) aus den amtlichen
// Geodaten des Amts für Geoinformation BE. Deterministisch: sortierte Ausgabe,
// feste Sehnenzahl je Kreisbogen, KEIN Date.now — das Abrufdatum kommt als
// Argument (wie in den Monats-Läufen der Normen-Monitor-Jobs) und wird, wenn
// es fehlt, aus dem bestehenden Artefakt übernommen, damit ein zweiter Lauf
// byte-gleich bleibt.
//
// --frisch  erzwingt den Neubezug der GeoPackages (sonst wird der Cache genutzt).

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { ARTEFAKT, DATENSAETZE, beziehe, bezugsUrl, detailUrl, leseArtefakt, leseStand, ordneZu } from './be-sprengel-kern';

const argument = (name: string): string | null => {
  const t = process.argv.find((a) => a.startsWith(`--${name}=`));
  return t ? t.slice(name.length + 3) : null;
};

const abrufArgument = argument('abrufdatum');
if (abrufArgument !== null && !/^\d{4}-\d{2}-\d{2}$/.test(abrufArgument)) {
  console.error('be-sprengel-generieren: --abrufdatum erwartet YYYY-MM-DD.');
  process.exit(1);
}
const bestand = existsSync(ARTEFAKT) ? leseArtefakt() : null;
const bisher = (bestand?.quelle as { abgerufen?: unknown } | undefined)?.abgerufen;
const abgerufen = abrufArgument ?? (typeof bisher === 'string' ? bisher : null);
if (abgerufen === null) {
  console.error('be-sprengel-generieren: kein --abrufdatum und kein bestehendes Artefakt — das Abrufdatum ist §7-Pflichtmerkmal und wird nie geraten.');
  process.exit(1);
}

await beziehe(process.argv.includes('--frisch'));
const stand = await leseStand();
const z = ordneZu();

const artefakt = {
  stand,
  quelle: {
    herausgeber: 'Amt für Geoinformation des Kantons Bern',
    abgerufen,
    lizenz: 'Freie Nutzung. Quellenangabe ist Pflicht.',
    lizenzUrl: 'https://geofiles.be.ch/internet/geo/geodaten/agi-dv-nutzungsbedingungen-de.pdf',
    normbasis: 'Art. 80, 81, 88a und 92 GSOG (BSG 161.1)',
    // Die Lizenz verlangt die Quellenangabe — dieser Satz ist der Wortlaut,
    // den jede Anzeige der Zuordnung mitführen muss (Nutzungsbedingungen AGI
    // BE, Ziff. 3; §7 lit. c verlangt zusätzlich den Live-Link).
    quellenangabe: 'Geodaten: Amt für Geoinformation des Kantons Bern (ADMRG, ADMRSA, GRENZ5)',
    normUrl: 'https://www.belex.sites.be.ch/app/de/texts_of_law/161.1',
    uebersichtGerichte: 'https://www.zsg.justice.be.ch/de/start/ueber-uns/regionalgerichte.html',
    uebersichtStaatsanwaltschaft: 'https://www.justice.be.ch/de/start/ueber-uns/gerichtsbehoerden-staatsanwaltschaft.html',
    datensaetze: DATENSAETZE.map((d) => ({ code: d.code, titel: d.titel, detail: detailUrl(d.code), bezug: bezugsUrl(d.code) })),
  },
  gerichte: z.gerichte,
  staatsanwaltschaften: z.staatsanwaltschaften,
  gemeinden: z.gemeinden,
  namen: z.namen,
  kreise: z.kreise,
};

// Serialisierung: Kopf und Listen eingerückt, die drei grossen Abbildungen je
// Eintrag auf einer Zeile — ein Sprengel-Wechsel wird so als einzelne Zeile im
// Diff sichtbar statt als eine 20-KB-Zeile (§7-Prüfbarkeit).
const zeilenMap = (o: Record<string, unknown>): string =>
  `{\n${Object.entries(o).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')}\n  }`;
const json = `{\n`
  + `  "stand": ${JSON.stringify(artefakt.stand)},\n`
  + `  "quelle": ${JSON.stringify(artefakt.quelle, null, 4).replace(/\n/g, '\n  ')},\n`
  + `  "gerichte": ${JSON.stringify(artefakt.gerichte, null, 4).replace(/\n/g, '\n  ')},\n`
  + `  "staatsanwaltschaften": ${JSON.stringify(artefakt.staatsanwaltschaften, null, 4).replace(/\n/g, '\n  ')},\n`
  + `  "gemeinden": ${zeilenMap(artefakt.gemeinden)},\n`
  + `  "namen": ${zeilenMap(artefakt.namen)},\n`
  + `  "kreise": ${zeilenMap(artefakt.kreise)}\n`
  + `}\n`;

mkdirSync(dirname(ARTEFAKT), { recursive: true });
writeFileSync(ARTEFAKT, json, 'utf8');

const proGericht = new Map<number, number>();
for (const [g] of Object.values(z.gemeinden)) proGericht.set(g, (proGericht.get(g) ?? 0) + 1);
console.log(`be-sprengel: ${Object.keys(z.gemeinden).length} Gemeinden, Stand ${stand}, abgerufen ${abgerufen}.`);
for (const [i, g] of z.gerichte.entries()) {
  console.log(`  ${String(proGericht.get(i) ?? 0).padStart(3)}  ${g.name}${g.aussenstelle ? ` · ${g.aussenstelle}` : ''}`);
}
console.log(`  ${z.staatsanwaltschaften.length} regionale Staatsanwaltschaften · ${Object.keys(z.kreise).length} Verwaltungskreise, je ganz in einem Sprengel.`);
console.log(`  → ${ARTEFAKT}`);
