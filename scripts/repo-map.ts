/**
 * scripts/repo-map.ts — Generierte Repo-/Symbol-Map (QS-TOK P4 · T8).
 *
 * Zweck (Token-Ökonomie): ein frischer Agent orientiert sich heute mit ~20–60k Tok
 * Grep/Read über `src/` + `scripts/`. Diese Map liefert deterministisch
 * **Modul → Pfad → Exporte → zuständiges Tor** als kompakten Einstiegs-Index
 * (~2–5k Tok statt der Voll-Reads). Der hand-kuratierte Kopf bleibt in
 * `bibliothek/register/engine-map.md` (Modul ↔ Wissens-Grundlage ↔ Status);
 * diese Map ist der maschinell erzeugte, immer aktuelle Symbol-Teil daneben.
 *
 * Erzeugung ist **rein deterministisch** (§2): sortierte Datei-Iteration, regex-
 * basierte Export-Extraktion, keine LLM-Generierung (LLM-Maps schaden — Halluzinierte
 * Kanten). Tore werden faktisch aus `package.json` abgeleitet (welches `check:*`/
 * `gen:*`-Script ein `scripts/*.ts` aufruft), nicht geraten.
 *
 * **Nie committen** (K, Staleness/Konflikt): Default-Ausgabe = stdout; mit
 * `--out` schreibt es nach `.repo-map.generated.md` (gitignored).
 * Es gibt bewusst KEIN Gate darauf — eine committede Map kollidiert bei jedem
 * Parallel-PR (DIRTY-Kaskade). Auf Risikopfaden ersetzt die Map nie die echte Datei.
 *
 * Aufruf:
 *   npm run map                 → Map nach stdout
 *   npm run map -- --out        → nach .repo-map.generated.md
 *   npm run map -- --dir src    → nur ein Teilbaum
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const WURZEL = join(new URL('..', import.meta.url).pathname);
// Ausgabeziel im Repo-Wurzel als versteckte, gitignorete Datei — bewusst AUSSERHALB
// von bibliothek/register/ (dort verlangt der Standards-Check S7 eine INDEX-Zeile).
const ZIEL_DATEI = '.repo-map.generated.md';

interface ModulEintrag {
  pfad: string; // repo-relativ, POSIX
  zeilen: number;
  exporte: string[];
  tore: string[]; // npm-Scripts, die diese Datei aufrufen (nur scripts/*)
}

/** Rekursive, deterministisch sortierte Sammlung aller .ts/.tsx unter einem Baum. */
function sammleDateien(basis: string): string[] {
  const treffer: string[] = [];
  const lauf = (verzeichnis: string): void => {
    const eintraege = readdirSync(verzeichnis).sort((a, b) => a.localeCompare(b, 'en'));
    for (const name of eintraege) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      const voll = join(verzeichnis, name);
      const st = statSync(voll);
      if (st.isDirectory()) {
        lauf(voll);
      } else if (/\.(ts|tsx)$/.test(name) && !/\.d\.ts$/.test(name)) {
        treffer.push(voll);
      }
    }
  };
  lauf(basis);
  return treffer;
}

/**
 * Extrahiert die exportierten Symbol-Namen aus einem Modul — deterministisch,
 * regex-basiert (keine Voll-AST, keine externe Abhängigkeit). Abgedeckt:
 *   export const/let/var/function/async function/class/interface/type/enum NAME
 *   export default (als «default»)
 *   export { A, B as C }   → A, C
 */
function leseExporte(inhalt: string): string[] {
  const namen = new Set<string>();
  const deklaration =
    /^\s*export\s+(?:async\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm;
  for (const m of inhalt.matchAll(deklaration)) namen.add(m[1]);
  if (/^\s*export\s+default\b/m.test(inhalt)) namen.add('default');
  const gruppe = /^\s*export\s*\{([^}]*)\}/gm;
  for (const m of inhalt.matchAll(gruppe)) {
    for (const roh of m[1].split(',')) {
      const teil = roh.trim();
      if (!teil || teil === 'type') continue;
      // «A as B» → B ist der exportierte Name
      const asMatch = teil.match(/(?:\btype\s+)?[A-Za-z_$][\w$]*\s+as\s+([A-Za-z_$][\w$]*)/);
      if (asMatch) {
        namen.add(asMatch[1]);
        continue;
      }
      const einfach = teil.replace(/^type\s+/, '').match(/^([A-Za-z_$][\w$]*)$/);
      if (einfach) namen.add(einfach[1]);
    }
  }
  return [...namen].sort((a, b) => a.localeCompare(b, 'en'));
}

/** Baut die Rückabbildung `scripts/*.ts` → npm-Script-Namen (deterministisch aus package.json). */
function leseTorRueckbezug(): Map<string, string[]> {
  const pkg = JSON.parse(readFileSync(join(WURZEL, 'package.json'), 'utf8')) as {
    scripts?: Record<string, string>;
  };
  const map = new Map<string, string[]>();
  for (const [scriptName, befehl] of Object.entries(pkg.scripts ?? {})) {
    for (const m of befehl.matchAll(/(scripts\/[\w./-]+\.tsx?)/g)) {
      const datei = m[1];
      const liste = map.get(datei) ?? [];
      if (!liste.includes(scriptName)) liste.push(scriptName);
      map.set(datei, liste);
    }
  }
  for (const liste of map.values()) liste.sort((a, b) => a.localeCompare(b, 'en'));
  return map;
}

function baueEintraege(basis: string, tore: Map<string, string[]>): ModulEintrag[] {
  const eintraege: ModulEintrag[] = [];
  for (const voll of sammleDateien(join(WURZEL, basis))) {
    const inhalt = readFileSync(voll, 'utf8');
    const pfad = relative(WURZEL, voll).split('\\').join('/');
    eintraege.push({
      pfad,
      zeilen: inhalt.split('\n').length,
      exporte: leseExporte(inhalt),
      tore: tore.get(pfad) ?? [],
    });
  }
  return eintraege.sort((a, b) => a.pfad.localeCompare(b.pfad, 'en'));
}

const MAX_EXPORTE = 24; // Kompaktheit vor Vollständigkeit; Voll-Read bleibt der Rückweg.

function formatiere(eintraege: ModulEintrag[], dirs: string[]): string {
  const zeilen: string[] = [];
  zeilen.push('# Repo-/Symbol-Map (generiert — NICHT committen)');
  zeilen.push('');
  zeilen.push(
    '> Erzeugt von `npm run map` (QS-TOK/T8), rein deterministisch aus den Export-',
  );
  zeilen.push('> Deklarationen. Hand-kuratierter Kopf: `bibliothek/register/engine-map.md`.');
  zeilen.push('> Kompakter Einstiegs-Index statt Grep/Voll-Read; auf Risikopfaden ersetzt');
  zeilen.push('> die Map **nie** die echte Datei. Tore = faktischer package.json-Rückbezug.');
  zeilen.push('');
  const gesamt = eintraege.length;
  const summeZeilen = eintraege.reduce((s, e) => s + e.zeilen, 0);
  zeilen.push(`**Deckung:** ${dirs.join(' + ')} · ${gesamt} Module · ${summeZeilen} Zeilen.`);
  zeilen.push('');
  let aktuellerBereich = '';
  for (const e of eintraege) {
    const bereich = e.pfad.split('/').slice(0, 2).join('/');
    if (bereich !== aktuellerBereich) {
      aktuellerBereich = bereich;
      zeilen.push('');
      zeilen.push(`## ${bereich}/`);
      zeilen.push('');
    }
    const exp =
      e.exporte.length === 0
        ? '_(keine benannten Exporte)_'
        : e.exporte.slice(0, MAX_EXPORTE).join(', ') +
          (e.exporte.length > MAX_EXPORTE ? ` … (+${e.exporte.length - MAX_EXPORTE})` : '');
    const torTeil = e.tore.length ? ` · **Tor:** \`${e.tore.join('` `')}\`` : '';
    zeilen.push(`- \`${e.pfad}\` (${e.zeilen} Z.)${torTeil}`);
    zeilen.push(`  - ${exp}`);
  }
  zeilen.push('');
  return zeilen.join('\n');
}

function main(): void {
  const args = process.argv.slice(2);
  const schreibe = args.includes('--out');
  const dirArg = args.indexOf('--dir');
  const dirs = dirArg >= 0 && args[dirArg + 1] ? [args[dirArg + 1]] : ['src', 'scripts'];
  const tore = leseTorRueckbezug();
  const eintraege = dirs.flatMap((d) => baueEintraege(d, tore));
  const ausgabe = formatiere(eintraege, dirs);
  if (schreibe) {
    const ziel = join(WURZEL, ZIEL_DATEI);
    writeFileSync(ziel, ausgabe, 'utf8');
    process.stderr.write(
      `repo-map: ${eintraege.length} Module → ${ZIEL_DATEI} (gitignored, nie committen)\n`,
    );
  } else {
    process.stdout.write(ausgabe);
  }
}

main();
