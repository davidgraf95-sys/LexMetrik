// scripts/check-lizenzen.ts — Lizenz-Tor (QS-VERWENDEN V1).
//
// Prüft ALLE Abhängigkeiten (prod+dev, `npm ls --all --json --long`) gegen
// eine Allowlist permissiver Lizenzen. Copyleft (LGPL/GPL/AGPL/CPAL/SSPL) und
// NOASSERTION sind ROT (§URG-Leitbild); MPL-2.0 ist GELB (Warnung). SPDX `OR`
// = eine Alternative reicht, `AND` = alle Teile; verschachtelte Klammern
// (>1 Ebene) und `WITH`-Exceptions werden NICHT aufgelöst, fail-closed rot
// in `klassifiziereLeaf` (gemessen 2.9.2026). Ausnahmen nur in
// `scripts/lizenzen-ausnahmen.json` (bereits produktiv genutzte rote Pakete).
//
// PR #622 (2.9.2026), vier Befunde: ELSPROBLEMS-JSON wird ausgewertet statt
// TypeError; Untergrenze 100 Pakete gegen Leerlauf-Grün; `dep.license`-Objekt
// stürzte `.trim()` ab; übersprungene Knoten zählen statt zu verschwinden.
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ALLOWLIST = new Set(
  [
    'MIT',
    'Apache-2.0',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'ISC',
    '0BSD',
    'CC0-1.0',
    'Unlicense',
    'Python-2.0',
    'BlueOak-1.0.0',
    'CC-BY-4.0',
    'CC-BY-3.0',
    'OFL-1.1',
    'Zlib',
  ].map((l) => l.toLowerCase()),
);
const WARN_LIZENZ = 'mpl-2.0';

/** Untergrenze gegen Leerlauf-Grün (§6.7) — «0 Pakete geprüft» ist nie ok. */
export const UNTERGRENZE_PAKETE = 100;

type Klasse = 'gruen' | 'warn' | 'rot';

/** `license`/`licenses[].type` sind laut npm-Doku Strings, real kommen aber
 *  auch Objektformen (`{type: 'MIT'}`, ältere npm-Generationen) vor. */
type LizenzWert = string | { type?: string } | null | undefined;

type NpmDep = {
  version?: string;
  license?: LizenzWert;
  licenses?: Array<{ type?: LizenzWert }>;
  missing?: boolean;
  dependencies?: Record<string, NpmDep>;
};

type NpmLsBaum = NpmDep & { name?: string; problems?: string[] };

type Ausnahme = { paket: string; grund: string; datum: string };

/** Klammern eine Ebene tief entfernen, wenn sie den ganzen Ausdruck umschliessen. */
export function entklammern(s: string): string {
  s = s.trim();
  if (s.startsWith('(') && s.endsWith(')')) {
    // Nur wenn die öffnende Klammer zur schliessenden gehört (kein "(A) OR (B)").
    let tiefe = 0;
    for (let i = 0; i < s.length - 1; i++) {
      if (s[i] === '(') tiefe++;
      else if (s[i] === ')') tiefe--;
      if (tiefe === 0) return s; // schliesst vor dem Ende → nicht umschliessend
    }
    return entklammern(s.slice(1, -1));
  }
  return s;
}

function klassifiziereLeaf(lizenz: string): Klasse {
  const l = entklammern(lizenz).trim().toLowerCase();
  if (ALLOWLIST.has(l)) return 'gruen';
  if (l === WARN_LIZENZ) return 'warn';
  return 'rot';
}

/** Schlimmste Klasse gewinnt (rot > warn > gruen). */
function schlimmer(a: Klasse, b: Klasse): Klasse {
  const rang: Record<Klasse, number> = { gruen: 0, warn: 1, rot: 2 };
  return rang[a] >= rang[b] ? a : b;
}
/** Beste Klasse gewinnt (gruen > warn > rot) — für OR. */
function besser(a: Klasse, b: Klasse): Klasse {
  const rang: Record<Klasse, number> = { gruen: 2, warn: 1, rot: 0 };
  return rang[a] >= rang[b] ? a : b;
}

/** SPDX-Ausdruck klassifizieren: AND = alle erlaubt, OR = eine Alternative reicht. */
export function klassifiziereAusdruck(ausdruck: string): Klasse {
  const s = entklammern(ausdruck);
  if (/ or /i.test(s)) {
    return s
      .split(/ or /i)
      .map((teil) => klassifiziereAusdruck(teil))
      .reduce(besser);
  }
  if (/ and /i.test(s)) {
    return s
      .split(/ and /i)
      .map((teil) => klassifiziereAusdruck(teil))
      .reduce(schlimmer);
  }
  return klassifiziereLeaf(s);
}

/** Lizenzwert (String oder `{type}`-Objekt) sicher zu Text — nie `.trim()` auf Nicht-String (Befund 3). */
function lizenzWertZuText(wert: LizenzWert): string {
  if (typeof wert === 'string') return wert.trim();
  if (wert && typeof wert === 'object' && typeof wert.type === 'string') {
    return wert.type.trim();
  }
  return '';
}

/** Lizenz-Rohtext aus `license` (neu) oder `licenses[]` (alt) — beide können String oder Objektform sein (Befund 3). */
export function lizenzText(dep: NpmDep): string {
  const direkt = lizenzWertZuText(dep.license);
  if (direkt) return direkt;
  if (dep.licenses && dep.licenses.length) {
    const typen = dep.licenses.map((l) => lizenzWertZuText(l?.type)).filter(Boolean);
    if (typen.length) return typen.join(' OR ');
  }
  return '';
}

type Fund = { key: string; lizenz: string; klasse: Klasse; pfad: string };

type Zaehler = { uebersprungen: number };

function baumDurchlaufen(
  knoten: NpmDep,
  name: string,
  vorfahren: string[],
  gesehen: Map<string, Fund>,
  zaehler: Zaehler,
): void {
  const eigenerPfad = [...vorfahren, name];
  for (const [kindName, kind] of Object.entries(knoten.dependencies ?? {})) {
    if (!kind || kind.missing || !kind.version) {
      zaehler.uebersprungen++; // unerfüllte peerDependency etc. (Befund 4)
      continue;
    }
    const key = `${kindName}@${kind.version}`;
    if (!gesehen.has(key)) {
      const lizenz = lizenzText(kind) || 'NOASSERTION';
      const klasse = klassifiziereAusdruck(lizenz);
      gesehen.set(key, { key, lizenz, klasse, pfad: [...eigenerPfad, kindName].join(' > ') });
    }
    baumDurchlaufen(kind, kindName, eigenerPfad, gesehen, zaehler);
  }
}

function ausnahmenLaden(): Map<string, Ausnahme> {
  const pfad = 'scripts/lizenzen-ausnahmen.json';
  const karte = new Map<string, Ausnahme>();
  if (!existsSync(pfad)) return karte;
  const liste = JSON.parse(readFileSync(pfad, 'utf8')) as Ausnahme[];
  for (const e of liste) karte.set(e.paket, e);
  return karte;
}

/** `stdout`-Text von `npm ls` parsen — `null` statt Wurf, wenn kein JSON. */
export function parseNpmLsJson(text: string): NpmLsBaum | null {
  try {
    return JSON.parse(text) as NpmLsBaum;
  } catch {
    return null;
  }
}

/** `npm ls --all --json --long` ausführen (Befund 1): bei ELSPROBLEMS
 *  (Exit 1) liefert npm ls meist trotzdem JSON auf stdout — execFileSync
 *  wirft dann aber; ohne try/catch stirbt das Tor mit TypeError statt Meldung. */
function npmLsLesen(): { baum: NpmLsBaum; problems: string[] } {
  let roh: string;
  try {
    roh = execFileSync('npm', ['ls', '--all', '--json', '--long'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (e) {
    // e.stdout trägt oft noch vollständiges JSON — parsebar: Baum auswerten
    // (Warnung statt Absturz), sonst rot mit der echten npm-Fehlermeldung.
    const stdout = (e as { stdout?: unknown }).stdout;
    const baum = typeof stdout === 'string' ? parseNpmLsJson(stdout) : null;
    if (baum) {
      return { baum, problems: baum.problems ?? [] };
    }
    const meldung = (e as { message?: string }).message ?? String(e);
    console.error(
      `\nFEHLER: 'npm ls --all --json --long' lieferte weder Erfolg noch ` +
        `auswertbares JSON auf stdout (ELSPROBLEMS o.ä.).\n${meldung}\n` +
        `→ node_modules mit package-lock.json abgleichen (\`npm ci\`) und erneut versuchen.`,
    );
    return process.exit(1);
  }
  const baum = parseNpmLsJson(roh);
  if (!baum) {
    console.error(`\nFEHLER: 'npm ls --all --json --long' lieferte kein parsebares JSON.`);
    return process.exit(1);
  }
  return { baum, problems: baum.problems ?? [] };
}

function main(): void {
  const { baum, problems } = npmLsLesen();
  const gesehen = new Map<string, Fund>();
  const zaehler: Zaehler = { uebersprungen: 0 };
  baumDurchlaufen(baum, baum.name ?? 'lexmetrik', [], gesehen, zaehler);

  const ausnahmen = ausnahmenLaden();
  const gruen: Fund[] = [];
  const warn: Fund[] = [];
  const rot: Fund[] = [];
  const alsAusnahmeFreigegeben: Fund[] = [];

  for (const fund of gesehen.values()) {
    if (fund.klasse === 'gruen') gruen.push(fund);
    else if (fund.klasse === 'warn') warn.push(fund);
    else if (ausnahmen.has(fund.key)) alsAusnahmeFreigegeben.push(fund);
    else rot.push(fund);
  }

  console.log(`Lizenz-Tor: ${gesehen.size} Pakete geprüft (prod + dev, transitiv).`);
  if (problems.length) {
    console.log(`  Baum-Probleme (npm ls, Warnung — Baum trotzdem ausgewertet): ${problems.length}`);
    for (const p of problems) console.log(`    - ${p}`);
  }
  console.log(`  übersprungen (missing/ohne version, z. B. unerfüllte peerDeps): ${zaehler.uebersprungen}`);
  console.log(`  gruen (erlaubt):         ${gruen.length}`);
  console.log(`  gelb  (MPL-2.0, Warnung): ${warn.length}`);
  for (const f of warn) console.log(`    - ${f.key} [${f.lizenz}] via ${f.pfad}`);
  console.log(`  Ausnahme (rot, freigegeben): ${alsAusnahmeFreigegeben.length}`);
  for (const f of alsAusnahmeFreigegeben) {
    const a = ausnahmen.get(f.key)!;
    console.log(`    - ${f.key} [${f.lizenz}] — ${a.grund} (${a.datum})`);
  }
  console.log(`  ROT (Copyleft/NOASSERTION/unbekannt): ${rot.length}`);
  for (const f of rot) console.log(`    - ${f.key} [${f.lizenz}] via ${f.pfad}`);

  const fehler: string[] = [];
  if (rot.length > 0) {
    fehler.push(
      `${rot.length} Paket(e) mit nicht erlaubter Lizenz.\n` +
        `→ Bei bereits produktiv genutztem Paket: begründete Ausnahme in ` +
        `scripts/lizenzen-ausnahmen.json anlegen (Paket, Grund, Datum) und ` +
        `David informieren — nie automatisch.`,
    );
  }
  if (gesehen.size < UNTERGRENZE_PAKETE) {
    fehler.push(
      `nur ${gesehen.size} Paket(e) geprüft (Untergrenze ${UNTERGRENZE_PAKETE}) — ` +
        `ein leerer/kaputter Baum darf nie grün sein.`,
    );
  }

  if (fehler.length > 0) {
    console.error(`\nFEHLER:\n${fehler.map((f) => `- ${f}`).join('\n')}`);
    process.exit(1);
  }
  console.log('\nok  Lizenz-Tor grün.');
}

if (!process.env.VITEST) main();
