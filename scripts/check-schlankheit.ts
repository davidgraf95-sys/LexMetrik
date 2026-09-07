/**
 * check:schlankheit — Zeilen-Wächter gegen Churn-Regrowth (§6.6 mechanisiert).
 *
 * 24.7.2026 · ANLASS · gesetz-leser/inhalt.tsx wuchs nach dem §6.6-Split
 * (781 Z.) binnen 12 Tagen unbemerkt auf 1090 Z. (+40 %) zurück — die
 * §6.6-Schwelle (~800 Z.) existierte bis dahin nur als Prosa ohne
 * mechanischen Wächter (§6.7). Tor eingeführt.
 *
 * Misst Zeilen (Anzahl `\n`) aller `*.ts`/`*.tsx` unter `src/` und `scripts/`,
 * mit drei Ausschlüssen: (1) `*.generated.ts(x)` — Zeilenzahl folgt den
 * Quelldaten, kein Wartbarkeits-Signal; (2) jedes `linguist-generated`-Muster
 * aus `.gitattributes` — generische statt hartkodierte Bindung an das, was
 * GitHub schon als generiert einklappt; (3) `src/tests/fixtures/**` — grosse
 * Snapshot-Inputs, kein editierter Code (`*.test.ts` selbst wird weiter
 * gemessen).
 *
 * Bestand wird GRANDFATHERED (`scripts/schlankheit-bestand.json`, 18 Dateien
 * bei Einführung bereits > 800 Z.) — das Tor fängt NEUEN Zuwachs, nicht
 * historische Schuld auf einen Schlag.
 *
 * ROT nur bei (a) neuer Datei > 800 Z. (nicht in Baseline) oder (b)
 * Bestands-Datei > Baseline-Zahl × 1.1 (die Fehlerklasse aus dem Anlass wäre
 * bei ~859 Z. gestoppt worden). Unter 800 Z. gefallen ist kein Rot, nur ein
 * Hinweis. Baseline wird nie automatisch geschrieben (Determinismus, §2) —
 * dafür `--update` (`npm run schlankheit:update`), analog `npm run golden`.
 *
 * Seit e24b97b80 Teil von `check:seriell`, aber BEWUSST NICHT CI-Required
 * (Allowlist-Eintrag in `scripts/check-tor-paritaet.ts`) — lokal-warnend,
 * damit Bestands-Regrowth fremde PRs nicht blockiert. Eskalation:
 * `npm run schlankheit:update -- <pfad>` mit Commit-Begründung.
 *
 * 5.9.2026 · GEZIELT (QS-EFFIZIENZ, #699) · `--update` schrieb bisher still
 * die GANZE Baseline neu, auch wenn nur eine Datei gemeint war (§6.7). Jetzt:
 * `--update <pfad>…` setzt/entfernt NUR die genannten Pfade; ohne Pfade räumt
 * es nur bestehende Einträge auf und nimmt NIE neue Dateien auf (Fund → Exit
 * 1 mit Aufnahme-Hinweis). Jede Änderung wird ausgegeben, nichts still.
 */
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const WURZEL = process.cwd();
const SCHWELLE = 800;
const TOLERANZ = 0.10; // §6.6: > 10 % über der Baseline-Zahl ist Rot.
const BASELINE_PFAD = join(WURZEL, 'scripts', 'schlankheit-bestand.json');
const SCAN_WURZELN = ['src', 'scripts'];

// ─── Ausschlüsse ────────────────────────────────────────────────────────────

const REGEX_SONDERZEICHEN = new Set(['.', '+', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\']);

/**
 * Wandelt ein `.gitattributes`-Glob (nur die hier vorkommenden Formen: `*.ext`,
 * `pfad/**‌/*.ext`, `pfad/datei.ext`) in einen Regex, der auf POSIX-Pfade
 * relativ zur Repo-Wurzel passt. Zeichenweise aufgebaut (kein
 * escape-dann-Platzhalter-Zwischenschritt über String-Ersetzung), damit keine
 * Zwischenform nötig ist, die Regex-Metazeichen mit Steuerzeichen verwechseln
 * könnte.
 *
 * ANKER (Review-Befund 2, 5.8.2026): git matcht ein Muster OHNE `/` auf JEDER
 * Pfadebene (wie `.gitignore` — effektiv `**‌/muster`), ein Muster MIT `/` nur
 * relativ zum Verzeichnis der `.gitattributes` (hier die Repo-Wurzel, also ab
 * Pfadanfang). Reproduziert: `massendaten.ts linguist-generated` schloss
 * `src/lib/massendaten.ts` vorher NICHT aus, weil `^massendaten\.ts$` nur auf
 * der Wurzel selbst gematcht hätte. Slash-lose Muster ankern jetzt an
 * `(^|/)` statt `^` — das deckt zugleich Review-Befund 6 mit ab: ein
 * slash-loses `*.generated.ts` matcht damit automatisch auch in
 * Unterordnern (`[^/]*\.generated\.ts` hinter `(^|/)`).
 *
 * `?` (Review-Befund 6): git-Glob-Semantik ist «genau ein Zeichen, kein `/`»
 * — als `[^/]` übersetzt, NICHT als literales `?` stehen gelassen (ein
 * rohes `?` im Regex ist ein Quantor auf dem VORHERGEHENDEN Atom, nicht
 * «ein beliebiges Zeichen»; als erstes Zeichen eines Musters wäre es sogar
 * eine ungültige Regex).
 *
 * `**` (Review-Befund 6, bewusste Teil-Abdeckung): wird als `.*` übersetzt —
 * eine Übersetzung, die auch über Verzeichnisgrenzen hinweg matcht und damit
 * ein Superset von gits «null oder mehr Verzeichnisebenen» ist. Für den
 * Ausschluss-Zweck hier (§5: was gematcht wird, FLIEGT aus der Zeilenmessung
 * raus) ist ein zu weites Match das sichere Risiko — es kann höchstens eine
 * Datei zu Unrecht ausschliessen, nie eine Churn-Regrowth-Datei unentdeckt
 * durchlassen. Heute nutzt `.gitattributes` kein `**` ohne Slash und keine
 * mehrfachen `**` in einem Muster; diese Fälle sind NICHT gegen echtes
 * git-Verhalten verifiziert, nur gegen die hier vorkommenden Formen.
 */
export function globZuRegex(glob: string): RegExp {
  let regex = '';
  for (let i = 0; i < glob.length; i++) {
    const zeichen = glob[i];
    if (zeichen === '*' && glob[i + 1] === '*') {
      regex += '.*';
      i += 1; // zweites '*' des Paars wurde mitverbraucht
    } else if (zeichen === '*') {
      regex += '[^/]*';
    } else if (zeichen === '?') {
      regex += '[^/]';
    } else if (REGEX_SONDERZEICHEN.has(zeichen)) {
      regex += '\\' + zeichen;
    } else {
      regex += zeichen;
    }
  }
  const anker = glob.includes('/') ? '^' : '(^|/)';
  return new RegExp(anker + regex + '$');
}

/**
 * Reine Parse-Funktion (fs-frei, testbar): liest `linguist-generated`-Muster
 * aus dem TEXT-Inhalt einer `.gitattributes`-Datei (§5-Projektion: was GitHub
 * schon als generiert einklappt, ist kein Handschrift-Signal).
 *
 * ATTRIBUT-FORM (Review-Befund 3, 5.8.2026): git akzeptiert sowohl das nackte
 * Token `linguist-generated` (implizit `=true`) als auch die explizite Form
 * `linguist-generated=true`. `linguist-generated=false` ist eine bewusste
 * Nicht-Setzung (z. B. um ein geerbtes Attribut aus einem übergeordneten
 * Muster wieder abzuschalten) und zählt NICHT als gesetzt.
 */
export function generiertMusterAusGitattributes(inhalt: string): RegExp[] {
  const muster: RegExp[] = [];
  for (const zeile of inhalt.split('\n')) {
    const getrimmt = zeile.trim();
    if (!getrimmt || getrimmt.startsWith('#')) continue;
    const teile = getrimmt.split(/\s+/);
    const [glob, ...attribute] = teile;
    const generiertAttr = attribute.find((a) => a === 'linguist-generated' || a.startsWith('linguist-generated='));
    if (!generiertAttr) continue;
    const wert = generiertAttr.includes('=') ? generiertAttr.slice(generiertAttr.indexOf('=') + 1) : 'true';
    if (wert === 'true') muster.push(globZuRegex(glob));
  }
  return muster;
}

/** Liest die `linguist-generated`-Muster aus der committeten `.gitattributes`. */
function leseGeneriertMuster(): RegExp[] {
  const pfad = join(WURZEL, '.gitattributes');
  if (!existsSync(pfad)) return [];
  return generiertMusterAusGitattributes(readFileSync(pfad, 'utf8'));
}

function istAusgeschlossen(relPfad: string, generiertMuster: RegExp[]): boolean {
  if (/\.generated\.tsx?$/.test(relPfad)) return true;
  // Review-Befund 5 (5.8.2026): relPfad ist bereits auf '/' normalisiert
  // (sammleDateien: `.split(sep).join('/')`) — der Vergleich MUSS also
  // ebenfalls '/' verwenden, nicht das OS-`sep` (auf POSIX identisch, auf
  // Windows wäre `sep` `\\` und der Vergleich hätte still nie gegriffen).
  if (relPfad.startsWith('src/tests/fixtures/')) return true;
  return generiertMuster.some((m) => m.test(relPfad));
}

// ─── Sammeln ────────────────────────────────────────────────────────────────

/**
 * Review-Befund 4 (5.8.2026, §6.7-Klasse): der `readdirSync`-Fehlschlag wurde
 * bisher UNTERSCHIEDSLOS geschluckt — sowohl für eine fehlende Scan-WURZEL
 * (`src/` oder `scripts/` existiert nicht, z. B. falsches `cwd`) als auch für
 * eine tiefer liegende, harmlose Race/Berechtigungs-Lücke. Im ersten Fall
 * lieferte das Tor still «0 Datei(en) geprüft» mit Exit 0 — ein Tor, das bei
 * kaputter Konfiguration grün meldet, ist gefährlicher als keines. Die
 * Scan-WURZEL wird jetzt VOR dem Rekursions-Einstieg geprüft und wirft hart;
 * der `try/catch` in `gehen()` bleibt NUR für tiefere Ebenen (dort ist ein
 * stiller Rückzug vertretbar: das schlimmste Ergebnis ist eine übersehene
 * Unterdatei, nicht ein leerer Gesamt-Scan).
 */
function sammleDateien(startVerzeichnis: string, generiertMuster: RegExp[]): string[] {
  const wurzelPfad = join(WURZEL, startVerzeichnis);
  if (!existsSync(wurzelPfad)) {
    throw new Error(
      `Scan-Wurzel fehlt: '${startVerzeichnis}/' (erwartet unter ${wurzelPfad}) — ` +
      `check:schlankheit muss VOR jedem Zeilen-Urteil wissen, dass es wirklich gescannt hat.`);
  }
  const treffer: string[] = [];
  const gehen = (verz: string): void => {
    let eintraege: string[];
    try {
      eintraege = readdirSync(verz);
    } catch {
      return;
    }
    for (const eintrag of eintraege) {
      if (eintrag === 'node_modules' || eintrag === 'dist' || eintrag.startsWith('.')) continue;
      const voll = join(verz, eintrag);
      const stat = statSync(voll);
      if (stat.isDirectory()) {
        gehen(voll);
      } else if (/\.tsx?$/.test(eintrag)) {
        const relPfad = relative(WURZEL, voll).split(sep).join('/');
        if (!istAusgeschlossen(relPfad, generiertMuster)) treffer.push(relPfad);
      }
    }
  };
  gehen(wurzelPfad);
  return treffer;
}

/** Zeilenzahl wie `wc -l`: Anzahl `\n`. Eine Datei ohne abschliessenden
 *  Zeilenumbruch zählt ihre letzte (unvollständige) Zeile bewusst NICHT —
 *  identisch zu `wc -l`, das Mass, gegen das die Schwelle 800 kalibriert ist. */
function zeilenzahl(pfad: string): number {
  const inhalt = readFileSync(pfad, 'utf8');
  let n = 0;
  for (const zeichen of inhalt) if (zeichen === '\n') n++;
  return n;
}

function messeBestand(): Map<string, number> {
  const generiertMuster = leseGeneriertMuster();
  const bestand = new Map<string, number>();
  for (const wurzel of SCAN_WURZELN) {
    for (const relPfad of sammleDateien(wurzel, generiertMuster)) {
      bestand.set(relPfad, zeilenzahl(join(WURZEL, relPfad)));
    }
  }
  return bestand;
}

// ─── Kernlogik (rein, testbar ohne fs) ─────────────────────────────────────

export interface SchlankheitBefund {
  rot: string[];
  hinweise: string[];
}

/**
 * Reine Prüf-Funktion: nimmt den GEMESSENEN Bestand (Pfad → Zeilenzahl) und
 * die eingecheckte Baseline (Pfad → Zeilenzahl am Baseline-Tag) entgegen.
 *
 *   - neue Datei > `schwelle` Zeilen, nicht in `baseline`            → rot
 *   - Baseline-Datei, deren aktuelle Zeilenzahl > baseline×(1+toleranz) → rot
 *   - Baseline-Datei jetzt < `schwelle` Zeilen                        → Hinweis
 *   - Baseline-Datei ohne aktuelle Entsprechung (gelöscht)            → Hinweis
 *   - alles andere (stabil, unter Schwelle, unter Toleranz)           → grün
 */
export function pruefeSchlankheit(
  aktuell: ReadonlyMap<string, number>,
  baseline: Readonly<Record<string, number>>,
  schwelle = SCHWELLE,
  toleranz = TOLERANZ,
): SchlankheitBefund {
  const rot: string[] = [];
  const hinweise: string[] = [];

  for (const [pfad, zeilen] of aktuell) {
    const baselineZeilen = baseline[pfad];
    if (baselineZeilen === undefined) {
      if (zeilen > schwelle) {
        rot.push(
          `${pfad}: NEU über der Schwelle — ${zeilen} Z. (Schwelle ${schwelle}). ` +
          `Entweder splitten (§6.6) oder bewusst in die Baseline aufnehmen (\`npm run schlankheit:update -- ${pfad}\`, ` +
          `mit Begründung im Commit).`);
      }
      continue;
    }
    const maxErlaubt = Math.floor(baselineZeilen * (1 + toleranz));
    if (zeilen > maxErlaubt) {
      const prozent = ((zeilen / baselineZeilen - 1) * 100).toFixed(1);
      rot.push(
        `${pfad}: ${zeilen} Z. — ${prozent}% über der Baseline (${baselineZeilen} Z., ` +
        `erlaubt bis ${maxErlaubt}). Churn-Regrowth (§6.6) — splitten statt Baseline stillschweigend mitwachsen lassen.`);
    } else if (zeilen < schwelle) {
      hinweise.push(`${pfad}: jetzt ${zeilen} Z. (< ${schwelle}) — kann aus der Baseline entfernt werden (\`npm run schlankheit:update\`).`);
    }
  }

  for (const pfad of Object.keys(baseline)) {
    if (!aktuell.has(pfad)) {
      hinweise.push(`${pfad}: Baseline-Eintrag ohne Datei mehr — gelöscht/verschoben? (\`npm run schlankheit:update\` räumt auf.)`);
    }
  }

  return { rot, hinweise };
}

// ─── Update-Berechnung (rein, testbar ohne fs) ─────────────────────────────

export interface UpdateErgebnis {
  /** Neuer Baseline-Inhalt (unsortiert; der Schreiber sortiert vor dem Schreiben). */
  neueBaseline: Record<string, number>;
  /** Pfade, die neu in die Baseline aufgenommen wurden (nur mit Zielpfaden möglich). */
  hinzu: string[];
  /** Pfade, die aus der Baseline entfernt wurden (unter Schwelle oder Datei fehlt). */
  entfernt: string[];
  /** Bestehende Einträge, deren Zahl nachgezogen wurde. */
  geaendert: Array<{ pfad: string; alt: number; neu: number }>;
  /** NUR im Aufräum-Modus (keine Zielpfade): neue Dateien > Schwelle, bewusst
   *  NICHT aufgenommen — der Aufrufer meldet sie und beendet mit Exit 1. */
  uebersehen: string[];
  /** Pfad unbekannt → Exit 1, kein Schreiben. */
  unbekannt: string[];
}

/**
 * Reine Update-Berechnung — GEZIELT 5.9.2026 (QS-EFFIZIENZ, Beleg #699).
 *
 * `zielPfade` undefined/leer → NUR Aufräumen: bestehende Baseline-Einträge
 * werden nachgezogen (Zahl an `aktuell` angepasst) oder entfernt (Datei fehlt
 * oder liegt jetzt unter `schwelle`). Neue Dateien über der Schwelle werden
 * NIE automatisch aufgenommen — sie landen in `uebersehen`.
 *
 * `zielPfade` mit Einträgen → NUR diese Pfade werden gesetzt/aktualisiert
 * (aktuell > Schwelle) oder entfernt (aktuell fehlt oder ≤ Schwelle). Jeder
 * andere Baseline-Eintrag bleibt byte-gleich, auch wenn seine aktuelle
 * Zeilenzahl inzwischen abweicht (das holt ein eigener gezielter Aufruf nach,
 * kein impliziter Nebeneffekt). Unbekannt → `unbekannt`, kein Schreiben.
 */
export function berechneUpdate(
  aktuell: ReadonlyMap<string, number>,
  baseline: Readonly<Record<string, number>>,
  zielPfade: readonly string[] | undefined,
  schwelle = SCHWELLE,
): UpdateErgebnis {
  const neueBaseline: Record<string, number> = { ...baseline };
  const hinzu: string[] = [];
  const entfernt: string[] = [];
  const geaendert: Array<{ pfad: string; alt: number; neu: number }> = [];
  const uebersehen: string[] = [];
  const unbekannt: string[] = [];

  if (zielPfade && zielPfade.length > 0) {
    for (const pfad of zielPfade) {
      const zeilen = aktuell.get(pfad);
      const altWert = baseline[pfad];
      if (zeilen === undefined && altWert === undefined) {
        // bisher still (Exit 0), jetzt gemeldet (§6.7).
        unbekannt.push(pfad);
        continue;
      }
      // Symmetrie: bei `schwelle` bleibt der Eintrag.
      if (zeilen !== undefined && zeilen >= schwelle) {
        if (altWert === undefined) {
          if (zeilen > schwelle) {
            neueBaseline[pfad] = zeilen;
            hinzu.push(pfad);
          }
        } else if (altWert !== zeilen) {
          neueBaseline[pfad] = zeilen;
          geaendert.push({ pfad, alt: altWert, neu: zeilen });
        }
      } else if (altWert !== undefined) {
        delete neueBaseline[pfad];
        entfernt.push(pfad);
      }
    }
    return { neueBaseline, hinzu, entfernt, geaendert, uebersehen, unbekannt };
  }

  for (const pfad of Object.keys(baseline)) {
    const zeilen = aktuell.get(pfad);
    if (zeilen === undefined || zeilen < schwelle) {
      delete neueBaseline[pfad];
      entfernt.push(pfad);
    } else if (zeilen !== baseline[pfad]) {
      neueBaseline[pfad] = zeilen;
      geaendert.push({ pfad, alt: baseline[pfad], neu: zeilen });
    }
  }
  for (const [pfad, zeilen] of aktuell) {
    if (baseline[pfad] === undefined && zeilen > schwelle) uebersehen.push(pfad);
  }
  return { neueBaseline, hinzu, entfernt, geaendert, uebersehen, unbekannt };
}

// ─── CLI ────────────────────────────────────────────────────────────────────

function ladeBaseline(): Record<string, number> {
  if (!existsSync(BASELINE_PFAD)) return {};
  return JSON.parse(readFileSync(BASELINE_PFAD, 'utf8')) as Record<string, number>;
}

function schreibeBaselineDatei(baseline: Readonly<Record<string, number>>): void {
  const sortiert = Object.fromEntries(Object.entries(baseline).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(BASELINE_PFAD, JSON.stringify(sortiert, null, 2) + '\n', 'utf8');
}

/** CLI-Pfad (roh, ggf. relativ zum aktuellen `cwd` oder absolut) auf die
 *  posix-relative Form normiert, die Baseline und Bestand als Schlüssel nutzen. */
function normalisierePfad(roh: string): string {
  const absolut = resolve(process.cwd(), roh);
  return relative(WURZEL, absolut).split(sep).join('/');
}

function main(): void {
  const argv = process.argv.slice(2);
  const updateIdx = argv.indexOf('--update');
  const update = updateIdx !== -1;
  const zielPfadeRoh = update ? argv.slice(updateIdx + 1).filter((a) => a.length > 0) : [];

  let bestand: Map<string, number>;
  try {
    bestand = messeBestand();
  } catch (fehler) {
    console.error(`check:schlankheit ROT — ${(fehler as Error).message}`);
    process.exit(1);
  }

  // Review-Befund 4, zweiter Teil: Plausibilitäts-Guard zusätzlich zum
  // harten Wurzel-Fehler oben — falls beide Scan-Wurzeln existieren, aber aus
  // irgendeinem anderen Grund (z. B. ein künftiger Ausschluss-Bug, der ALLES
  // matcht) kein einziger Treffer zustande kommt, ist «0 Dateien geprüft»
  // ebenso kein plausibler Repo-Zustand wie eine fehlende Wurzel.
  if (bestand.size === 0) {
    console.error(
      'check:schlankheit ROT — 0 Dateien geprüft. Kein plausibler Repo-Zustand ' +
      '(§6.7: ein Tor, das bei leerem Scan still grün meldet, ist gefährlicher als keines). ' +
      'Scan-Wurzeln (src/, scripts/) und Ausschluss-Muster prüfen.');
    process.exit(1);
  }

  if (update) {
    const baseline = ladeBaseline();
    const zielPfade = zielPfadeRoh.length > 0 ? zielPfadeRoh.map(normalisierePfad) : undefined;
    const { neueBaseline, hinzu, entfernt, geaendert, uebersehen, unbekannt } = berechneUpdate(bestand, baseline, zielPfade);

    if (unbekannt.length) {
      console.error(`schlankheit:update ROT — ${unbekannt.length} unbekannte(r) Zielpfad(e), keine Baseline-Änderung:`);
      for (const p of unbekannt) console.error(`  ✗ Zielpfad unbekannt/nicht im Scan: ${p}`);
      process.exit(1);
    }

    schreibeBaselineDatei(neueBaseline);

    if (zielPfade) {
      console.log(`schlankheit:update — ${zielPfade.length} Zielpfad(e) verarbeitet, alle anderen Einträge byte-gleich.`);
    } else {
      console.log('schlankheit:update — Aufräumen (keine Zielpfade): nur bestehende Einträge nachgezogen/entfernt, keine neuen Dateien aufgenommen.');
    }
    for (const p of hinzu) console.log(`  + neu aufgenommen: ${p}: ${neueBaseline[p]} Z.`);
    for (const { pfad, alt, neu } of geaendert) console.log(`  ~ ${pfad}: ${alt} → ${neu} Z.`);
    for (const p of entfernt) console.log(`  − entfernt: ${p}`);
    if (!hinzu.length && !entfernt.length && !geaendert.length) console.log('  (keine Änderung gegenüber der bestehenden Baseline)');

    if (uebersehen.length) {
      console.error(`\nschlankheit:update ROT — ${uebersehen.length} neue Datei(en) über der Schwelle, NICHT automatisch aufgenommen (§6.7 — «--update» ohne Pfad nimmt nie neue Dateien auf):`);
      for (const p of uebersehen) console.error(`  ✗ ${p}: bewusst aufnehmen: npm run schlankheit:update -- ${p}`);
      process.exit(1);
    }
    return;
  }

  const baseline = ladeBaseline();
  const { rot, hinweise } = pruefeSchlankheit(bestand, baseline);

  if (rot.length) {
    console.error(`check:schlankheit ROT — ${rot.length} Datei(en) über der §6.6-Schwelle:`);
    for (const z of rot) console.error(`  ✗ ${z}`);
    if (hinweise.length) {
      console.error(`\n  ${hinweise.length} weitere Hinweise (kein Rot):`);
      for (const h of hinweise) console.error(`  · ${h}`);
    }
    process.exit(1);
  }

  console.log(
    `check:schlankheit GRÜN — ${bestand.size} Datei(en) geprüft, ${Object.keys(baseline).length} ` +
    `Bestands-Einträge, keine Neuzugänge/Überschreitungen über der §6.6-Schwelle (${SCHWELLE} Z., Toleranz ${Math.round(TOLERANZ * 100)}%).`);
  if (hinweise.length) {
    console.log(`  ${hinweise.length} Hinweis(e) (kein Rot):`);
    for (const h of hinweise) console.log(`  · ${h}`);
  }
}

// Nur bei direktem CLI-Aufruf ausführen, NICHT beim Import durch den
// Vitest-Test (der importiert `pruefeSchlankheit` aus diesem Modul; ohne diese
// Weiche liefe bei jedem Testlauf zusätzlich ein echter fs-Scan inkl.
// möglichem `process.exit(1)`, der die Testsuite selbst abschiessen würde).
// `process.argv[1]` zeigt unter `vite-node` auf den vite-node-Binary-Pfad, nicht
// auf dieses Skript (geprüft) — darum die von Vitest selbst gesetzte
// Umgebungsvariable als verlässlicher Marker, kein Pfadvergleich.
if (!process.env.VITEST) main();
