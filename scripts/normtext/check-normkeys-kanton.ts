// ─── check:normkeys-kanton — Referenz-Integrität der kantonalen Zitat-Brücke (N0a) ───
//
// WAS DIESES TOR BEWACHT. `public/rechtsprechung/normkeys-kanton.json` behauptet
// je Entscheid: «dieser Entscheid zitiert diese kantonalen Erlasse». Beide Seiten
// der Behauptung müssen auf etwas zeigen, das es gibt — ein Entscheid-key, den
// das Register nicht führt, und ein Erlass-key ohne Snapshot-Datei sind je ein
// toter Verweis, der im UI als leerer Chip oder als 404 landet.
//
// WARUM ÜBERHAUPT EIN EIGENES TOR, wo `check:bezuege` die Erlass-Seite schon
// prüft: check:bezuege prüft die SHARDS (Erlass → Entscheide). Diese Projektion
// ist die Gegenrichtung und wird von einem anderen Schreib-Zweig erzeugt; eine
// Projektion, die niemand gegen ihre Bezugsgrössen hält, driftet still (§6.7).
//
// WAS ES NICHT PRÜFT (§8, damit die Grenze benannt ist und nicht angenommen):
// ob die Zuordnung fachlich RICHTIG ist — ob also «SG 154.100» in jenem
// Entscheid wirklich das Gerichtsorganisationsgesetz meint. Das ist die Aufgabe
// der Riegel im Resolver (Dominanz, Titel-Konsistenz) und der Stichprobe von
// Hand. Dieses Tor prüft Existenz und Form, nicht Wahrheit.
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PROJ = join(wurzel, 'public/rechtsprechung/normkeys-kanton.json');
const REG = join(wurzel, 'public/rechtsprechung/register.json');
const KANTON_DIR = join(wurzel, 'public/normtext/kanton');

interface Projektion { erzeugt: string; eintraege: Record<string, string[]> }
interface Register { entscheide: { key: string; kanton: string }[] }

function main(): void {
  if (!existsSync(PROJ)) {
    console.error('check:normkeys-kanton ROT — public/rechtsprechung/normkeys-kanton.json fehlt. '
      + 'Erzeugen mit `npm run entscheide`.');
    process.exit(1);
  }
  const proj = JSON.parse(readFileSync(PROJ, 'utf8')) as Projektion;
  const reg = JSON.parse(readFileSync(REG, 'utf8')) as Register;
  const bekannt = new Map(reg.entscheide.map((e) => [e.key, e.kanton]));

  const fehler: string[] = [];
  let paare = 0;
  const erlasse = new Set<string>();
  const kantone = new Set<string>();

  const keys = Object.keys(proj.eintraege);
  for (const key of keys) {
    const liste = proj.eintraege[key];

    // (1) Entscheid-Seite: der key muss im Register stehen.
    const kanton = bekannt.get(key);
    if (kanton === undefined) {
      fehler.push(`Entscheid-key '${key}' steht nicht in register.json.`);
      continue;
    }
    kantone.add(kanton);

    // (2) Form: nichtleer, dedupliziert, sortiert (§2 — die Datei ist ein
    //     Generator-Artefakt, ihre Ordnung ist Teil der Byte-Gleichheit).
    if (!Array.isArray(liste) || liste.length === 0) {
      fehler.push(`Entscheid '${key}': leerer Eintrag — die Projektion führt nur Treffer (§8).`);
      continue;
    }
    const sortiert = [...liste].sort();
    if (liste.some((v, i) => v !== sortiert[i])) {
      fehler.push(`Entscheid '${key}': Erlass-Liste nicht sortiert.`);
    }
    if (new Set(liste).size !== liste.length) {
      fehler.push(`Entscheid '${key}': Erlass-Liste enthält Dubletten.`);
    }

    for (const erlass of liste) {
      paare++;
      erlasse.add(erlass);

      // (3) Erlass-Seite: der Snapshot muss als Datei existieren.
      if (!existsSync(join(KANTON_DIR, `${erlass}.json`))) {
        fehler.push(`Entscheid '${key}' → '${erlass}': kein Snapshot public/normtext/kanton/${erlass}.json.`);
        continue;
      }

      // (4) Ebenen-Treue: ein kantonaler Erlass-key trägt das Kantonskürzel des
      //     ZITIERENDEN Entscheids. Ein BS-Entscheid, der auf 'AG-…' zeigt, wäre
      //     entweder eine Fehlauflösung oder fremdkantonales Recht — für beides
      //     fehlt die Analyse, also darf es hier nicht auftauchen (§7).
      if (!erlass.startsWith(`${kanton}-`)) {
        fehler.push(`Entscheid '${key}' (Kanton ${kanton}) → '${erlass}': fremder Kantons-Präfix.`);
      }
    }
  }

  console.log('check:normkeys-kanton — kantonale Zitat-Brücke (N0a)');
  console.log(`  Entscheide mit Treffer: ${keys.length}`);
  console.log(`  Entscheid→Erlass-Paare: ${paare}`);
  console.log(`  referenzierte Erlasse:  ${erlasse.size}`);
  console.log(`  Kantone:                ${[...kantone].sort().join(', ') || '—'}`);

  if (fehler.length) {
    console.error(`\ncheck:normkeys-kanton ROT — ${fehler.length} Verstoss/Verstösse:`);
    for (const f of fehler.slice(0, 40)) console.error(`  · ${f}`);
    if (fehler.length > 40) console.error(`  … und ${fehler.length - 40} weitere.`);
    process.exit(1);
  }
  console.log('\ncheck:normkeys-kanton GRÜN — jede Referenz zeigt auf einen vorhandenen '
    + 'Snapshot, jeder Entscheid-key steht im Register, Form und Ordnung stimmen.');
}

main();
