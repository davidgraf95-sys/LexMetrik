// scripts/entstehung/anker-run.ts
// CLI-Runner der Botschafts-Anker-Sidecars (E2, §11.6). Dünner Fetch/Write-Teil;
// das seiteneffektfreie Modul ist anker-sidecars.ts (Repo-Muster …-generieren(-run)).
//
// §2: --datum aus der Shell (kein Date.now). Netz-Lauf, ≥0.5 s Abstand je Dokument.
// Aufruf: npm run materialien:anker -- --datum=$(date +%F)
import { writeFileSync, mkdirSync, readdirSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BOTSCHAFTEN } from '../../src/lib/materialien/botschaften.generated.ts';
import { ANKER_DIR, type AnkerSidecar } from '../../src/lib/entstehung/anker.ts';
import {
  holeHtmlUrls, holeHtml, extrahiereAnker, shaHtml, shaSidecar, serialisiereSidecar,
} from './anker-sidecars.ts';
import { ANKER_REGISTER_PFAD, serialisiereAnkerRegister, type AnkerRegister } from './anker-register.ts';

// §11.6 (5), erste Hälfte des Determinismus-Wächters: eine PARSER-Änderung darf einen
// Sidecar nie stillschweigend umschreiben — sonst sähe eine Extraktions-Korrektur aus wie
// eine Gesetzesänderung (§7d). Ändert sich ein Sidecar, obwohl der Quell-Hash des amtlichen
// HTML gleich blieb, bricht der Lauf ab; `--parser-neu="<Grund>"` entsperrt ihn und schreibt
// den Grund ins Quell-Register (nachlesbar, nicht nur im Chat).
const parserArg = process.argv.find((a) => a.startsWith('--parser-neu='));
const parserGrund = parserArg ? parserArg.slice('--parser-neu='.length).trim() : '';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const heute = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(heute)) { console.error('--datum=YYYY-MM-DD nötig (§2)'); process.exit(1); }

/** Live-Link «https://www.fedlex.admin.ch/eli/fga/2025/1528/de» → Daten-ELI + Kurzform. */
function fgaAusQuelleUrl(u: string): { uri: string; kurz: string } | null {
  const m = /\/eli\/(fga\/\d+\/[^/]+)/.exec(u);
  return m ? { uri: `https://fedlex.data.admin.ch/eli/${m[1]}`, kurz: m[1] } : null;
}

const kandidaten = BOTSCHAFTEN
  .map((b) => ({ b, fga: fgaAusQuelleUrl(b.quelleUrl) }))
  .filter((x): x is { b: typeof BOTSCHAFTEN[number]; fga: { uri: string; kurz: string } } => !!x.fga)
  .sort((a, c) => (a.b.key < c.b.key ? -1 : 1));

console.log(`anker: ${kandidaten.length} Botschaften → HTML-Manifestationen (SPARQL, isExemplifiedBy) …`);
const urls = await holeHtmlUrls(kandidaten.map((k) => k.fga.uri));
console.log(`anker: ${urls.size} Botschaften mit HTML-Manifestation → Abruf (≥0.5 s Abstand) …`);

mkdirSync(ANKER_DIR, { recursive: true });
const alt: AnkerRegister | null = existsSync(ANKER_REGISTER_PFAD)
  ? (JSON.parse(readFileSync(ANKER_REGISTER_PFAD, 'utf8')) as AnkerRegister)
  : null;
const register: AnkerRegister = { erzeugt: heute, quellen: {} };
const parserDrift: string[] = [];
const zuSchreiben: [string, string][] = [];
const geschrieben = new Set<string>();
let mitAnker = 0;
let ankerGesamt = 0;

for (const k of kandidaten) {
  const url = urls.get(k.fga.uri);
  if (!url) continue;
  const abruf = await holeHtml(url);
  const { anker, mehrdeutig } = extrahiereAnker(abruf.html);
  const sha = shaHtml(abruf.html);
  const erlassKeys = [...(k.b.normKeys ?? [])].sort();
  let sidecarSha: string | null = null;
  if (anker.length) {
    const sidecar: AnkerSidecar = {
      botschaft: k.b.key,
      fga: k.fga.kurz,
      quelleUrl: k.b.quelleUrl,
      htmlUrl: url,
      sha,
      lastModified: abruf.lastModified,
      contentLength: abruf.contentLength,
      abgerufen: heute,
      erlassKeys,
      mantel: erlassKeys.length > 1,
      mehrdeutig,
      anker,
    };
    // NICHT sofort schreiben: erst nach der Parser-Drift-Prüfung (unten) — ein
    // abgebrochener Lauf darf den Arbeitsbaum nicht halb umgeschrieben zurücklassen.
    zuSchreiben.push([join(ANKER_DIR, `${k.b.key}.json`), serialisiereSidecar(sidecar)]);
    sidecarSha = shaSidecar(sidecar);
    geschrieben.add(`${k.b.key}.json`);
    mitAnker += 1;
    ankerGesamt += anker.length;
  }
  const vorher = alt?.quellen[k.b.key];
  if (vorher && vorher.sha === sha && vorher.sidecarSha && vorher.sidecarSha !== sidecarSha) {
    parserDrift.push(`${k.b.key} (${k.fga.kurz})`);
  }
  register.quellen[k.b.key] = {
    fga: k.fga.kurz,
    htmlUrl: url,
    sha,
    lastModified: abruf.lastModified,
    contentLength: abruf.contentLength,
    abgerufen: heute,
    ankerZahl: anker.length,
    sidecarSha,
    ...(parserGrund && vorher && vorher.sha === sha && vorher.sidecarSha !== sidecarSha
      ? { parserAenderung: parserGrund }
      : {}),
  };
  await new Promise((r) => setTimeout(r, 500));
}

if (parserDrift.length && !parserGrund) {
  console.error(
    `anker ROT: ${parserDrift.length} Sidecar(s) ändern sich, obwohl der Quell-Hash des amtlichen `
    + 'HTML gleich blieb — das ist Parser-Drift, keine Gesetzesänderung (§7d, §11.6 (5)):',
  );
  for (const d of parserDrift) console.error(`  - ${d}`);
  console.error(
    'Entweder war die Änderung unbeabsichtigt (dann rückgängig machen), oder sie ist gewollt: '
    + 'dann mit --parser-neu="<Grund>" erneut laufen lassen — der Grund landet im Quell-Register.',
  );
  process.exit(1);
}

for (const [pfad, inhalt] of zuSchreiben) writeFileSync(pfad, inhalt, 'utf8');

// Verwaiste Sidecars entfernen (eine Botschaft verlor ihre Anker) — nie stillschweigend stehen lassen.
if (existsSync(ANKER_DIR)) {
  for (const f of readdirSync(ANKER_DIR)) {
    if (f.endsWith('.json') && !geschrieben.has(f)) {
      rmSync(join(ANKER_DIR, f));
      console.log(`anker: verwaisten Sidecar entfernt — ${f}`);
    }
  }
}

mkdirSync('bibliothek/register', { recursive: true });
writeFileSync(ANKER_REGISTER_PFAD, serialisiereAnkerRegister(register), 'utf8');

console.log(`anker: ${mitAnker}/${urls.size} HTML-Botschaften tragen Artikel-Anker (${ankerGesamt} Anker) → ${ANKER_DIR}`);
console.log(`anker: Quell-Register ${Object.keys(register.quellen).length} Einträge → ${ANKER_REGISTER_PFAD}`);
