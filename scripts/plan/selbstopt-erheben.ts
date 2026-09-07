// scripts/plan/selbstopt-erheben.ts — Zeitreihen-Sammler `npm run selbstopt:erheben`
// (Roadmap-Schritt `QS-SELBSTOPT`, Stufe 1 «erst messen»).
//
// ZWECK. Der Bau soll sich an Messwerten verbessern statt an Eindrücken. Dieser
// Sammler hängt je Aufruf EINEN Snapshot an `messwerte/selbstopt-zeitreihe.json`:
// wie oft Tore rot waren, wie oft CI scheiterte oder wiederholt wurde, wie viel
// kurzfristig nachgebessert wurde, wie viele Tests wackelten, und wie viele
// datierte Belege die Fehlerklassen des Lehren-Registers tragen.
//
// DREI BAUREGELN — dieselben wie in `scripts/plan/lage.ts`:
//
//  * **Nie hart scheitern, immer degradieren (§8).** `gh` kann fehlen, ohne Netz
//    hängen, nicht authentisiert sein; der Playwright-Report existiert lokal
//    meist gar nicht. Jeder Ausfall wird zu `null` im betreffenden Feld PLUS
//    einem Eintrag in `ausfaelle` — nie zu einer 0, die «gemessen und nichts
//    gefunden» behauptet, und nie zu einem Abbruch, der die übrigen Felder
//    mitreisst.
//  * **Alles Rechnen liegt in `selbstoptKern.ts`.** Hier steht nur Beschaffung:
//    git, gh, Dateien lesen, JSON schreiben. Was hier steht, ist im Test nicht
//    prüfbar; was drüben steht, ist es vollständig.
//  * **Keine Schätzung, kein Modell, keine Heuristik als Urteil (§2).** Die
//    Rework-Zahl IST eine Heuristik — aber eine Beobachtungsgrösse, kein
//    Tor-Kriterium (Spec). Kein Feld dieser Datei entscheidet je über Grün/Rot.
//
// AUFRUF:  npm run selbstopt:erheben
//          npm run selbstopt:erheben -- --trocken   (nur anzeigen, nichts schreiben)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  EREIGNIS_DATEI,
  GENERIERT_MARKE,
  LEERES_AGGREGAT,
  REWORK_FENSTER_TAGE,
  REWORK_NACHFASS_STUNDEN,
  SCHEMA_VERSION,
  TOKEN_ENDPUNKT,
  TOKEN_TIMEOUT_MS,
  ZEITREIHE_DATEI,
  addiereAggregat,
  aggregiereTore,
  ciKennzahl,
  istHandschrift,
  letzterSnapshot,
  parseEreignisseMitRest,
  parseFKlassen,
  parseFremdagentenRegister,
  parseTokenMetriken,
  pruefeZeitreihe,
  quoteText,
  reworkKennzahl,
  zaehleFlakySpecs,
  type CiLauf,
  type FremdagentenBlock,
  type RwCommit,
  type Snapshot,
  type TokenKennzahl,
  type Zeitreihe,
} from './selbstoptKern';
import { erhebeJules } from '../analyse/fremdagenten-messung.ts';

/** Wie viele abgeschlossene CI-Läufe in die Quote eingehen (Spec: «letzten ~50»). */
const CI_FENSTER = 50;
/** Der Workflow, dessen Gesundheit gemessen wird. */
const CI_WORKFLOW = 'ci.yml';
/** Playwright-Report (CI-Artefakt, lokal gitignoriert und meist abwesend). */
const FLAKY_REPORT = 'playwright-report.json';
/** Quelle der Fehlerklassen — die Tabelle bleibt die Wahrheit, wir projizieren (§5). */
const LEHREN_REGISTER = '.claude/skills/lehren/SKILL.md';
/** Quelle der Gemini-Register (§5) — dieselbe Projektions-Logik wie beim Lehren-Register. */
const FAHRPLAN_FREMDAGENTEN = 'fahrplaene/FAHRPLAN-FREMDAGENTEN.md';

const TIMEOUT_MS = 60_000;

/** Kommando ausführen; `null` statt Wurf — der Aufrufer vermerkt den Ausfall. */
function sh(cmd: string, args: string[]): string | null {
  try {
    return execFileSync(cmd, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: TIMEOUT_MS,
    });
  } catch {
    return null;
  }
}

function lies(pfad: string): string | null {
  return existsSync(pfad) ? readFileSync(pfad, 'utf8') : null;
}

/**
 * Holt den lokalen Prometheus-Text von Claude Code. `null` bei jedem Problem —
 * Endpunkt tot (Export nicht aktiviert), Timeout, Fehlerstatus.
 *
 * Ausdrücklich KEIN Fremddienst: die Adresse ist `localhost`, der Export läuft im
 * Claude-Code-Prozess DIESER Maschine. Der kurze Timeout ist Absicht — eine
 * Messgrösse darf die Erhebung nie aufhalten, und ein nicht aktivierter Export
 * ist derzeit der Normalfall, nicht der Störfall.
 */
async function holeTokenText(): Promise<string | null> {
  try {
    const antwort = await fetch(TOKEN_ENDPUNKT, { signal: AbortSignal.timeout(TOKEN_TIMEOUT_MS) });
    if (!antwort.ok) return null;
    return await antwort.text();
  } catch {
    return null;
  }
}

/**
 * Hebt eine ältere Zeitreihe auf das aktuelle Schema.
 *
 * Verlustfrei und ausdrücklich eng: nachgetragen wird NUR das seit Schema 2
 * verlangte `tokens`-Feld, und zwar als `null` — die Aussage «für diesen
 * Snapshot wurde nichts gemessen», die für alle Snapshots vor dem 7.8.2026
 * schlicht zutrifft. Kein einziger gemessener Wert wird angefasst: eine
 * Messreihe, die man rückwirkend überschreibt, belegt nichts mehr (dieselbe
 * Linie wie beim Definitions-Bruch bei `ci`/`fKlassen`, s. Snapshot-Docstring).
 */
export function migriere(z: Zeitreihe): Zeitreihe {
  return {
    ...z,
    schema: SCHEMA_VERSION,
    snapshots: z.snapshots.map((s) => {
      let n = s;
      if (n.tokens === undefined) n = { ...n, tokens: null };
      if (n.fremdagenten === undefined) {
        n = { ...n, fremdagenten: { jules: null, gemini: null, claude_token_pro_schritt: null } };
      }
      // Schema 4: eine Jules-Messung von vor dem 4.9.2026 unterschied keine
      // Proben und führte keine PR-Nummern mit. Nachgetragen wird darum `null`
      // (= «nicht unterschieden»), NIE 0 oder `[]` — sonst behauptete die
      // Migration eine Messung, die es nicht gab, und Stufe 2 entdoppelte
      // gegen eine erfundene leere Liste.
      const j = n.fremdagenten.jules;
      if (j && (j.proben_7d === undefined || j.prs_geschlossen_nummern === undefined)) {
        n = {
          ...n,
          fremdagenten: {
            ...n.fremdagenten,
            jules: {
              ...j,
              proben_7d: j.proben_7d ?? null,
              prs_geschlossen_nummern: j.prs_geschlossen_nummern ?? null,
            },
          },
        };
      }
      // Schema 5: dieselbe Linie für `entwurf_antworten_7d` (ANLASS 5.9.2026,
      // PR #707) — eine Jules-Messung von vor dem 5.9.2026 unterschied noch
      // keine Entwurf-Antworten, nachgetragen wird darum `null`, nie 0.
      const j2 = n.fremdagenten.jules;
      if (j2 && j2.entwurf_antworten_7d === undefined) {
        n = {
          ...n,
          fremdagenten: {
            ...n.fremdagenten,
            jules: { ...j2, entwurf_antworten_7d: j2.entwurf_antworten_7d ?? null },
          },
        };
      }
      return n;
    }),
  };
}

// ───────────────────────────────── Beschaffung ─────────────────────────────────

/**
 * Commits für die Rework-Zahl. Geholt wird das Beurteilungs-Fenster PLUS die
 * Nachfass-Frist als Vorlauf (Begründung in `reworkKennzahl`); der Trenner
 * `\x01` steht vor jedem Commit-Kopf, weil Dateinamen alles enthalten dürfen,
 * nur kein Steuerzeichen.
 */
function holeCommits(): RwCommit[] | null {
  const tage = REWORK_FENSTER_TAGE + Math.ceil(REWORK_NACHFASS_STUNDEN / 24);
  const roh = sh('git', [
    'log',
    `--since=${tage}.days.ago`,
    '--no-merges',
    '--name-only',
    '--pretty=format:%x01%H%x09%aI%x09%aE',
  ]);
  if (roh === null) return null;
  const commits: RwCommit[] = [];
  for (const block of roh.split('\u0001')) {
    if (!block.trim()) continue;
    const [kopf, ...zeilen] = block.split('\n');
    const [sha, ts, autor] = kopf.split('\t');
    if (!sha || !ts) continue;
    commits.push({ sha, ts, autor: autor ?? '', dateien: zeilen.map((z) => z.trim()).filter(Boolean) });
  }
  return commits;
}

/** Abgeschlossene CI-Läufe über `gh` (native GitHub-API, kein Fremddienst). */
function holeCiLaeufe(): CiLauf[] | null {
  const roh = sh('gh', [
    'run', 'list',
    '--workflow', CI_WORKFLOW,
    '--limit', String(CI_FENSTER),
    '--json', 'attempt,conclusion,status',
  ]);
  if (roh === null) return null;
  try {
    const daten = JSON.parse(roh) as CiLauf[];
    return Array.isArray(daten) ? daten : null;
  } catch {
    return null;
  }
}

// ───────────────────────────────── Erhebung ─────────────────────────────────

export async function erhebe(): Promise<{ zeitreihe: Zeitreihe; snapshot: Snapshot }> {
  const ausfaelle: string[] = [];

  // (0) Bisherige Zeitreihe: lesen, auf das aktuelle Schema heben, PRÜFEN.
  //
  //     Reihenfolge mit Absicht — geprüft wird die MIGRIERTE Reihe. Andernfalls
  //     würde jede Datei aus der Zeit vor Schema 2 am fehlenden `tokens`-Feld
  //     scheitern, obwohl genau dieser Lauf es nachträgt; die Erhebung wäre für
  //     ein Formproblem gesperrt, das sie selbst behebt.
  //
  //     Ist sie darüber hinaus defekt, wird sie NICHT stillschweigend ersetzt:
  //     eine kaputte Messreihe zu überschreiben hiesse, den einzigen Beleg für
  //     ihren Defekt zu vernichten.
  const vorhanden = lies(ZEITREIHE_DATEI);
  let zeitreihe: Zeitreihe;
  if (vorhanden === null) {
    zeitreihe = { _generiert: GENERIERT_MARKE, schema: SCHEMA_VERSION, snapshots: [] };
  } else {
    let roh: unknown;
    try {
      roh = JSON.parse(vorhanden);
    } catch (e) {
      throw new Error(`Bestehende Zeitreihe ist kein gültiges JSON — ${(e as Error).message}`, { cause: e });
    }
    const grobOk =
      !!roh && typeof roh === 'object' && Array.isArray((roh as Partial<Zeitreihe>).snapshots);
    zeitreihe = grobOk ? migriere(roh as Zeitreihe) : (roh as Zeitreihe);
    const beanstandet = pruefeZeitreihe(JSON.stringify(zeitreihe));
    if (beanstandet.length) {
      throw new Error(
        `Bestehende Zeitreihe ist nicht schema-valide — erst reparieren (dieselben Befunde meldet \`npm run check:plan\`):\n  - ` +
          beanstandet.join('\n  - '),
      );
    }
  }
  const vorig = letzterSnapshot(zeitreihe);

  // (0b) DEN ZEITSTEMPEL JETZT SETZEN, nicht am Ende (Gegenprüfung 7.8.2026).
  //
  // `erhobenAm` ist nicht bloss Anzeige: es ist das WATERMARK, ab dem der
  // nächste Snapshot Ereignisse zählt. Wurde es erst nach der Beschaffung
  // gestempelt, deckte es einen Zeitraum ab, den dieser Snapshot gar nicht
  // gelesen hat — `gh` und `git` dürfen zusammen bis zu zwei Minuten brauchen.
  // Jedes Tor-Ereignis in diesem Fenster fiel unter den Tisch: vom nächsten
  // Snapshot als «vor dem Watermark» verworfen, von diesem nie gesehen.
  // Vorher stempeln kann höchstens dazu führen, dass ein Ereignis EINEN
  // Snapshot später gezählt wird — verlieren kann es nichts mehr.
  const erhobenAm = new Date().toISOString();

  // (1) HEAD-Commit.
  const headRoh = sh('git', ['rev-parse', 'HEAD']);
  const headCommit = headRoh?.trim() ?? '';
  if (!headCommit) ausfaelle.push('git rev-parse HEAD');

  // (2) Tor-Rot-Ereignisse seit dem letzten Snapshot + kumuliert.
  const logRoh = lies(EREIGNIS_DATEI);
  if (logRoh === null) ausfaelle.push(`${EREIGNIS_DATEI} (noch kein Tor-Lauf protokolliert)`);
  const { ereignisse, verworfen } = parseEreignisseMitRest(logRoh ?? '');
  if (verworfen > 0) ausfaelle.push(`${EREIGNIS_DATEI}: ${verworfen} unlesbare Zeile(n) übersprungen`);
  const seitLetztem = aggregiereTore(ereignisse, vorig?.erhobenAm ?? null);
  const kumuliert = addiereAggregat(vorig?.torRot.kumuliert ?? LEERES_AGGREGAT, seitLetztem);

  // (3) CI-Kennzahlen.
  const ciRoh = holeCiLaeufe();
  if (ciRoh === null) ausfaelle.push(`gh run list --workflow ${CI_WORKFLOW}`);
  const ci = ciRoh === null ? null : ciKennzahl(ciRoh);

  // (4) Rework — zwei Sichten, Begründung bei `istHandschrift`.
  const commits = holeCommits();
  if (commits === null) ausfaelle.push('git log (Rework-Fenster)');
  const jetzt = Date.now();
  const rework =
    commits === null
      ? null
      : {
          alle: reworkKennzahl(commits, jetzt),
          handschrift: reworkKennzahl(commits, jetzt, REWORK_FENSTER_TAGE, REWORK_NACHFASS_STUNDEN, istHandschrift),
        };

  // (5) Flaky.
  const reportRoh = lies(FLAKY_REPORT);
  if (reportRoh === null) ausfaelle.push(`${FLAKY_REPORT} (CI-Artefakt, lokal nicht vorhanden)`);
  let flaky: { specs: number } | null = null;
  if (reportRoh !== null) {
    try {
      flaky = { specs: zaehleFlakySpecs(JSON.parse(reportRoh)) };
    } catch {
      ausfaelle.push(`${FLAKY_REPORT} (nicht lesbar)`);
    }
  }

  // (6) Fehlerklassen.
  const registerRoh = lies(LEHREN_REGISTER);
  if (registerRoh === null) ausfaelle.push(LEHREN_REGISTER);
  const fKlassen = registerRoh === null ? {} : parseFKlassen(registerRoh);

  // (7) Token-/Kostenverbrauch aus dem lokalen OTel-Export.
  const tokenText = await holeTokenText();
  let tokens: TokenKennzahl | null = null;
  if (tokenText === null) {
    ausfaelle.push(`${TOKEN_ENDPUNKT} (OTel-Export nicht aktiv — OTEL_METRICS_EXPORTER=prometheus)`);
  } else {
    tokens = parseTokenMetriken(tokenText);
    // Antwort da, aber keine claude_code-Metrik darin: das ist NICHT dasselbe
    // wie ein toter Endpunkt und wird darum eigens vermerkt — es hiesse, dass
    // dort etwas anderes lauscht oder die Metriknamen sich geändert haben.
    if (tokens === null) ausfaelle.push(`${TOKEN_ENDPUNKT} (erreichbar, aber keine claude_code-Metrik gefunden)`);
  }

  // (8) Fremdagenten — Jules über `gh` (kann scheitern: Netz/`gh` fehlt),
  //     Gemini deterministisch aus dem lokalen Fahrplan-Register (kann nur an
  //     einer fehlenden Datei scheitern, nie am Netz).
  let julesMessung: FremdagentenBlock['jules'];
  try {
    julesMessung = erhebeJules();
  } catch {
    julesMessung = null;
  }
  if (julesMessung === null) ausfaelle.push('Jules-Messung (gh/Netz nicht verfügbar)');

  const fahrplanRoh = lies(FAHRPLAN_FREMDAGENTEN);
  if (fahrplanRoh === null) ausfaelle.push(FAHRPLAN_FREMDAGENTEN);
  // Der Parser meldet jedes Register, dessen Marke/Kopfzeile nicht (mehr)
  // passt, als eigenen Ausfall — statt still 0 zu zählen (Nachbesserung
  // 4.9.2026). Die Ausfälle wandern wörtlich in den Snapshot, damit eine
  // umbenannte Tabelle im Fahrplan sichtbar wird, statt die Messreihe
  // schleichend auf Nullen zu setzen.
  const register = fahrplanRoh === null ? null : parseFremdagentenRegister(fahrplanRoh);
  if (register) for (const a of register.ausfaelle) ausfaelle.push(`${FAHRPLAN_FREMDAGENTEN} — ${a}`);
  const geminiMessung = register?.mess ?? null;

  const fremdagenten: FremdagentenBlock = {
    jules: julesMessung,
    gemini: geminiMessung,
    claude_token_pro_schritt: null,
  };

  const snapshot: Snapshot = {
    erhobenAm,
    headCommit,
    torRot: { seitLetztem, kumuliert },
    ci,
    rework,
    flaky,
    tokens,
    fKlassen,
    fremdagenten,
    ausfaelle,
  };

  return { zeitreihe: { ...zeitreihe, snapshots: [...zeitreihe.snapshots, snapshot] }, snapshot };
}

/** Zeitreihe schreiben (Ordner anlegen, abschliessender Zeilenumbruch). */
export function schreibe(z: Zeitreihe, pfad: string = ZEITREIHE_DATEI): void {
  const ordner = dirname(pfad);
  if (ordner && !existsSync(ordner)) mkdirSync(ordner, { recursive: true });
  writeFileSync(pfad, `${JSON.stringify(z, null, 2)}\n`);
}

// ─────────────────────────────────── CLI ───────────────────────────────────

if (!process.env.VITEST) {
  const trocken = process.argv.includes('--trocken');
  let ergebnis: { zeitreihe: Zeitreihe; snapshot: Snapshot };
  try {
    ergebnis = await erhebe();
  } catch (e) {
    console.error(`selbstopt:erheben ROT — ${(e as Error).message}`);
    process.exit(1);
  }
  const { zeitreihe, snapshot } = ergebnis;

  if (!trocken) schreibe(zeitreihe);

  const s = snapshot;
  console.log(`selbstopt:erheben — Snapshot ${zeitreihe.snapshots.length} (${s.erhobenAm}, HEAD ${s.headCommit.slice(0, 9) || '—'})`);
  console.log(
    `  Tore seit letztem Snapshot: ${s.torRot.seitLetztem.rot} rot von ${s.torRot.seitLetztem.gesamt} Läufen ` +
      `(kumuliert ${s.torRot.kumuliert.rot}/${s.torRot.kumuliert.gesamt})`,
  );
  console.log(
    s.ci
      ? `  CI (${CI_WORKFLOW}, ${s.ci.laeufe} Läufe): Failure-Rate ${quoteText(s.ci.failureRate)} ` +
        `von ${s.ci.verdikte} Verdikten · abgebrochen ${quoteText(s.ci.cancelledRate)} (kein Verdikt) · ` +
        `Rerun-Rate ${quoteText(s.ci.rerunRate)}`
      : '  CI: — (nicht erhoben)',
  );
  console.log(
    s.rework
      ? `  Rework (${s.rework.handschrift.fensterTage} Tage / ${s.rework.handschrift.nachfassStunden} h): ` +
        `Quelltext ${quoteText(s.rework.handschrift.anteil)} von ${s.rework.handschrift.commits} Commits · ` +
        `alle Dateien ${quoteText(s.rework.alle.anteil)} von ${s.rework.alle.commits} (enthält Korpus-Regenerierung)`
      : '  Rework: — (nicht erhoben)',
  );
  console.log(`  Flaky-Specs: ${s.flaky ? s.flaky.specs : '— (nicht erhoben)'}`);
  console.log(
    s.tokens
      ? `  Token: ${s.tokens.gesamt.toLocaleString('de-CH')} gesamt (${Object.entries(s.tokens.jeTyp).map(([k, v]) => `${k} ${v.toLocaleString('de-CH')}`).join(' · ')})` +
        `${s.tokens.kostenUsd !== null ? ` · Kosten ${s.tokens.kostenUsd} USD` : ''}` +
        `\n         Metriken (beim ersten realen Lauf gegen die Ausgabe prüfen): ${s.tokens.metriken.join(', ')}`
      : '  Token: — (nicht erhoben)',
  );
  console.log(
    `  Fehlerklassen — datierte Vorfälle in der Spalte «Was passierte» (Fix-Daten zählen nicht): ` +
      `${Object.entries(s.fKlassen).map(([k, v]) => `${k}=${v}`).join(' · ') || '—'}`,
  );
  console.log(
    s.fremdagenten.jules
      ? `  Jules (7 Tage): ${s.fremdagenten.jules.prs_gemerged_7d} gemerged · ${s.fremdagenten.jules.prs_geschlossen_7d} geschlossen · ` +
        `${s.fremdagenten.jules.proben_7d ?? '—'} Proben (Label \`probe\`, aus der Landungsquote ausgeschlossen) · ` +
        `${s.fremdagenten.jules.entwurf_antworten_7d ?? '—'} Entwurf-Antworten (Label \`entwurf-antwort\`, aus der Landungsquote ausgeschlossen) · ` +
        `Median-Dauer ${s.fremdagenten.jules.median_dauer_min ?? '—'} min · Tickets/24h ${s.fremdagenten.jules.tickets_24h}` +
        `${s.fremdagenten.jules.alarm ? ' · ⚠️  ALARM (Issue ohne Annahme)' : ''}`
      : '  Jules: — (nicht erhoben)',
  );
  console.log(
    s.fremdagenten.gemini
      ? `  Gemini-Register (§5): Diskrepanz-Läufe ${s.fremdagenten.gemini.diskrepanz_laeufe} (echt ${s.fremdagenten.gemini.diskrepanz_echt}/Schein ${s.fremdagenten.gemini.diskrepanz_schein}) · ` +
        `Zweitblick ${s.fremdagenten.gemini.zweitblick_durchgaenge} · Kontingent-Ereignisse ${s.fremdagenten.gemini.kontingent_ereignisse}`
      : '  Gemini-Register: — (nicht erhoben)',
  );
  if (s.ausfaelle.length) console.log(`  ⚠️  nicht erhoben: ${s.ausfaelle.join(' · ')} (kein Fehler des Sammlers)`);
  console.log(trocken ? `  (--trocken: ${ZEITREIHE_DATEI} NICHT geschrieben)` : `  → ${ZEITREIHE_DATEI}`);
}
