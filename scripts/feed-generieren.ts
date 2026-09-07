// scripts/feed-generieren.ts
// QS-VERWENDEN V5: CLI-Läufer — liest Register + Manifest, schreibt
// public/feed/erlasse.xml. Die reine Bau-Funktion (Filter/Sortierung/XML)
// steht in scripts/feed-xml.ts (dort getestet, s. feed-generieren.test.ts).
//
// `daten-manifest.json` ist die COMMITTETE, vom Tor `check:datenhaltung` gegen
// den Ingest verifizierte Zusicherung, dass genau der aktuelle Registerstand
// tatsächlich in den Ziel-Tabellen angekommen ist (E1, s. scripts/datenhaltung/
// turso-sync.ts Quell-Riegel). Dieser Läufer bricht ab, wenn die Datei fehlt —
// sonst bewiese der Feed einen Registerstand, den niemand gegen die Daten
// geprüft hat. Sein INHALT (Tabellen-shas) fliesst NICHT in die Ausgabe ein:
// jeder Erlass trägt im Register bereits sein eigenes `stand`-Datum, ein
// zweiter Tabellen-Hash wäre eine redundante zweite Uhr (§5).
//
//   npm run gen:feed     erzeugt/überschreibt public/feed/erlasse.xml
//   npm run check:feed   prüft Drift (Datei ≠ frisch gebaut) → exit 1 (H-2,
//                        Gegenprüfung 2.9.2026 — gleiche Form wie
//                        such-index-generieren.ts --check)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { baueFeedXml } from './feed-xml.ts';
import { parseRegister } from './datenhaltung/validierung.ts';
import type { BrowseManifest } from '../src/lib/normtext/browse-typen.ts';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REGISTER_PFAD = resolve(wurzel, 'public/normtext/register.json');
const MANIFEST_PFAD = resolve(wurzel, 'daten-manifest.json');
const ZIEL = resolve(wurzel, 'public/feed/erlasse.xml');

if (!existsSync(MANIFEST_PFAD)) {
  console.error(
    `gen:feed: ${MANIFEST_PFAD} fehlt — zuerst \`npm run datenhaltung:build\` fahren ` +
      '(der Feed bezeugt sonst einen Registerstand, den niemand gegen die Daten geprüft hat).',
  );
  process.exit(1);
}

// H-3 (Gegenprüfung 2.9.2026): geprüfte Formkontrolle statt ungeprüftem
// `JSON.parse(...) as BrowseManifest`-Cast — dieselbe Grenze wie ingest.ts
// (V6). `parseRegister` validiert key/ebene/kanton/sr/titel/rechtsgebiet/
// status/kuerzel/stand und bricht mit Exit 1 ab, wenn eines davon fehlt oder
// falsch typisiert ist; die restlichen (hier gebrauchten) Felder bleiben nach
// Schema-Design unvalidiert durch (looseObject, s. validierung.ts Kopf) — der
// Cast auf `BrowseManifest['erlasse']` deckt NUR noch diesen dokumentierten
// Rest, nicht mehr den ganzen Datensatz.
const geprueft = parseRegister(JSON.parse(readFileSync(REGISTER_PFAD, 'utf8')), REGISTER_PFAD);
const alleErlasse = geprueft.erlasse as unknown as BrowseManifest['erlasse'];

let xml: string;
try {
  xml = baueFeedXml(alleErlasse);
} catch (err) {
  console.error(`gen:feed: ${(err as Error).message}`);
  process.exit(1);
}

const istCheck = process.argv.includes('--check');
if (istCheck) {
  let alt = '';
  try {
    alt = readFileSync(ZIEL, 'utf8');
  } catch {
    console.error(`check:feed: ${ZIEL} fehlt — \`npm run gen:feed\` ausführen.`);
    process.exit(1);
  }
  if (alt !== xml) {
    console.error(
      `check:feed: ${ZIEL} ist VERALTET gegenüber dem Register — \`npm run gen:feed\` ausführen.`,
    );
    process.exit(1);
  }
  console.log(`check:feed: ${ZIEL} synchron mit dem Register (${xml.match(/<entry>/g)?.length ?? 0} Einträge).`);
} else {
  writeFileSync(ZIEL, xml, 'utf8');
  console.log(`gen:feed: ${ZIEL} geschrieben (${xml.match(/<entry>/g)?.length ?? 0} Einträge).`);
}
