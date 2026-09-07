// ─── Raw-Store-Frischeprüfung: jüngstes korpus-raw-Release vs. aktuelle Pins ─
//
// QS-VERWENDEN V3 (2.9.2026). Kein Netz-Fetch der Rohdateien selbst — lädt
// per `gh release list`/`gh release download` NUR das kleine MANIFEST.txt
// des jüngsten `korpus-raw-*`-Release und prüft, ob jeder aktuelle Pin (aus
// scripts/fedlex-pins.ts, SSoT §5) darin mit seinem Namen und Konsolidierungs-
// stand vorkommt. Ein fehlender/veralteter Eintrag heisst: der nächste
// korpus-raw-release.yml-Lauf ist fällig (er läuft automatisch bei jeder
// Pin-Änderung auf main — ein WARNUNG hier ist meist nur die Lücke zwischen
// Merge und dem Ende jenes Laufs).
//
// NICHT im Gate (check:seriell/check): braucht `gh` + Netz, ist eine
// Nebenkontrolle des Release-Bestands, keine Voraussetzung für einen
// PR-Merge (der Raw-Store ist ein Backup, kein Extraktions-Pfad, §7).
//
//   npm run check:raw-store            (Bericht, immer Exit 0)
//   npm run check:raw-store -- --streng (Exit 1 bei fehlenden Pins)

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lesePins } from './fedlex-pins.ts';

const streng = process.argv.includes('--streng');

function gh(args: string[]): string {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

// Setzt nur den Exit-Code (statt process.exit): ein process.exit() mitten in
// einem try-Block würde den finally-rmSync (Aufräumen des Temp-Verzeichnisses)
// überspringen. melden() kehrt darum normal zurück — jede Aufrufstelle
// beendet die Funktion danach selbst mit `return`.
function melden(zeilen: string[], erfolg: boolean): void {
  console.log(zeilen.join('\n'));
  process.exitCode = streng && !erfolg ? 1 : 0;
}

function main(): void {
  let neuesterTag: string;
  try {
    const liste = gh([
      'release', 'list',
      '--limit', '200',
      '--json', 'tagName,createdAt',
      '--jq', '[.[] | select(.tagName | startswith("korpus-raw-"))] | sort_by(.createdAt) | last | .tagName // empty',
    ]).trim();
    if (!liste) {
      melden(
        ['WARNUNG check:raw-store: kein korpus-raw-*-Release gefunden.',
         '         Lauf fehlt oder ist noch nie erfolgreich durchgelaufen — siehe',
         '         .github/workflows/korpus-raw-release.yml (workflow_dispatch möglich).'],
        false,
      );
      return;
    }
    neuesterTag = liste;
  } catch (err) {
    melden(
      ['WARNUNG check:raw-store: `gh release list` fehlgeschlagen (kein Netz/Auth?) —',
       `         ${(err as Error).message.split('\n')[0]}`,
       '         Nebenkontrolle übersprungen, kein Gate-Bestandteil.'],
      true, // fehlende Netz-/Auth-Verfügbarkeit ist kein Datenbefund → nie --streng-rot
    );
    return;
  }

  const tmp = mkdtempSync(join(tmpdir(), 'raw-store-manifest-'));
  let manifest: string | undefined;
  try {
    gh(['release', 'download', neuesterTag, '--pattern', 'MANIFEST.txt', '--dir', tmp, '--clobber']);
    manifest = readFileSync(join(tmp, 'MANIFEST.txt'), 'utf8');
  } catch (err) {
    melden(
      [`WARNUNG check:raw-store: MANIFEST.txt aus Release ${neuesterTag} nicht ladbar —`,
       `         ${(err as Error).message.split('\n')[0]}`],
      false,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  if (manifest === undefined) return;

  // Manifest-Zeile: "<sha256>  <bytes>  <dateiname>  <eli>  <kons>"
  const manifestNamen = new Map<string, string>(); // name → kons
  for (const zeile of manifest.split('\n')) {
    const spalten = zeile.trim().split(/\s+/);
    if (spalten.length < 5 || zeile.startsWith('#')) continue;
    const dateiname = spalten[2];
    const kons = spalten[4];
    const name = dateiname.replace(/\.html$/, '');
    manifestNamen.set(name, kons);
  }

  const pins = lesePins();
  const fehlend: string[] = [];
  const veraltet: string[] = [];
  for (const pin of pins) {
    const konsImManifest = manifestNamen.get(pin.name);
    if (!konsImManifest) {
      fehlend.push(pin.name);
    } else if (konsImManifest !== pin.kons) {
      veraltet.push(`${pin.name} (Release: ${konsImManifest}, Pin: ${pin.kons})`);
    }
  }

  const zeilen: string[] = [];
  zeilen.push(`check:raw-store — jüngstes Release ${neuesterTag}, ${manifestNamen.size} Datei(en), ${pins.length} aktuelle Pin(s).`);
  if (fehlend.length === 0 && veraltet.length === 0) {
    zeilen.push('OK — jeder aktuelle Pin ist im Release-Manifest mit passendem Stand vertreten.');
    melden(zeilen, true);
    return;
  }
  if (fehlend.length > 0) {
    zeilen.push(`WARNUNG ${fehlend.length} Pin(s) fehlen im Release-Manifest: ${fehlend.join(', ')}`);
  }
  if (veraltet.length > 0) {
    zeilen.push(`WARNUNG ${veraltet.length} Pin(s) mit abweichendem Stand: ${veraltet.join(', ')}`);
  }
  zeilen.push('         Nächster korpus-raw-release.yml-Lauf (push auf fedlex-pins.ts oder workflow_dispatch) holt das nach.');
  melden(zeilen, false);
}

main();
