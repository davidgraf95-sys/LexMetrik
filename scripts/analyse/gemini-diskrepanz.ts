// scripts/analyse/gemini-diskrepanz.ts — Gemini-Diskrepanz-Finder für die
// Korpus-Werkstatt (FAHRPLAN-FREMDAGENTEN §2 Phase 2, §4, §5).
//
// SICHTWERKZEUG, KEIN TOR: vergleicht amtlichen Fedlex-Text gegen unseren
// Normtext-Snapshot. Exit 0 bei technisch gelungenem Lauf, unabhängig vom
// Fundinhalt — kein CI-Schritt, keine Landungs-Voraussetzung (Fahrplan §2
// Phase 2 «Ablage»). Exit 2 bei falschem Aufruf, Exit 1 bei Abbruch vor dem
// ersten Lauf, Exit 3 wenn mindestens ein agy-Lauf als Kontingent-Sperre
// klassiert wurde (scripts/analyse/agy-status.ts, Fahrplan §4 «Limite
// erkennen») — statt eines generischen Fehlers: zurück an Claude, Sperre in
// Fahrplan §5 protokollieren.
//
// ZWEI SCHRITTE, in dieser Reihenfolge (Umbau 4.9.2026):
//   1. DETERMINISTISCH — String-Diff über die beiden Klartext-Reduktionen.
//      Das ist der BELEG: reproduzierbar, modellunabhängig, kostenlos.
//   2. GEMINI — bekommt NUR die Artikel, bei denen Schritt 1 angeschlagen hat
//      (plus ±1 Artikel Kontext), und beantwortet die Frage, die ein Diff
//      nicht beantworten kann: WAS die Abweichung bedeutet (drop/leak/
//      tabelle/bister/zahl/sonst).
//
// Warum diese Reihenfolge: der AMBV-Pilot vom 4.9.2026 zeigte Gemini bei
// `--effort high` mit 0 von 5 echten Snapshot-Defekten (Klasse Silbentrennung/
// Interpunktion) — zeichengenauer Abgleich ist genau das, was ein Sprachmodell
// am schlechtesten kann und ein Diff perfekt. Umgekehrt sagt ein Diff nichts
// darüber, ob eine Abweichung ein Verlust oder nur eine andere Schreibweise
// ist. Jedes Werkzeug macht jetzt das, worin es gut ist.
//
// §14.7 VERTRAUENSGRENZE: die agy/Gemini-Ausgabe ist eine VERDACHTSLISTE,
// NIE ein Beleg (Gemini hat nachweislich Taten behauptet, die nicht
// stattfanden — Fahrplan §4). Jeder gemeldete Fund gehört von einem Menschen
// oder einer Gegenprüfungs-Session gegen die amtliche Quelle geprüft, bevor er
// "Befund" heisst. Teil 1 des Berichts ist der Beleg, Teil 2 die Deutung.
//
// Aufruf:
//   npx vite-node scripts/analyse/gemini-diskrepanz.ts bund/DBG
//   npx vite-node scripts/analyse/gemini-diskrepanz.ts bund/AMBV --nur-diff
//   npx vite-node scripts/analyse/gemini-diskrepanz.ts bund/OR --artikel 220-230 --laeufe 2
//   npx vite-node scripts/analyse/gemini-diskrepanz.ts bund/DBG --effort high --out /pfad/bericht.md
//
// Voraussetzung: der Fedlex-Filestore-Cache muss bereits gepinnt vorliegen
// (`bash scripts/fedlex-cache.sh` — NICHT von hier aus live geladen, s.u.).

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { NormSnapshotDatei } from '../../src/lib/normtext/typen.ts';
import {
  ermittleAbweichungen,
  schaeleJson,
  formatiereArtikel,
  reduziereQuelleHtml,
  reduziereSnapshot,
  sortiereArtikelSchluessel,
  waehleMitKontext,
  type ArtikelBefund,
  type ArtikelKlartext,
} from './gemini-diskrepanz-text.ts';
import { klassiereAgyFehler, KONTINGENT_MELDUNG } from './agy-status.ts';

// ARG_MAX-Wache: der Prompt geht als EIN argv-Element an agy. Linux begrenzt
// ein einzelnes Argument auf MAX_ARG_STRLEN = 128 KiB (32 Seiten), unabhängig
// vom grosszügigeren Gesamt-ARG_MAX; macOS kennt diese Einzelgrenze nicht —
// darum liefe ein zu grosser Prompt hier durch und erst in CI mit E2BIG auf.
// agy nimmt einen Prompt NICHT über stdin entgegen (empirisch geprüft
// 4.9.2026: `--print` ohne Wert => "empty prompt"; `--input-format
// stream-json` verlangt zusätzlich `--output-format stream-json`, also ein
// zweites, ungeprüftes Parse-Format). Statt einen zweiten Übergabepfad zu
// bauen und zu bewachen, bleibt der Prompt klein genug, dass die Grenze nie
// erreicht wird — der deterministische Erstfilter schickt ohnehin nur noch
// die abweichenden Artikel.
const MAX_ARG_BYTES = 120_000;
const GRUPPEN_BUDGET_ZEICHEN = 90_000;
const AGY = join(process.env.HOME ?? '', '.local/bin/agy');
// Die Denkstufe steckt bei agy im MODELLNAMEN, nicht in `--effort` — beides
// zusammen wird abgelehnt ("--model gemini-3.1-pro-high conflicts with
// --effort=low", empirisch 4.9.2026). Für Gemini 3.1 Pro gibt es nur `low`
// und `high`; eine Medium-Stufe existiert bei diesem Modell NICHT
// (`agy models`, 4.9.2026).
const MODELLE = {
  low: 'gemini-3.1-pro-low',
  high: 'gemini-3.1-pro-high',
} as const;
type Effort = keyof typeof MODELLE;
const PRINT_TIMEOUT_S = 300;
// >= print-timeout(300s) + 30s ist die Fahrplan-§4-UNTERGRENZE. Beobachtung
// Pilotlauf 4.9.2026 (VZV, grosse Gruppe): der agy-Prozess lief >400s, OHNE
// dass execFileSync ihn beim vorherigen 340s-Wert sichtbar per SIGTERM beendet
// hätte (manuell abgebrochen, nicht abschliessend geklärt ob/wann Node
// eingegriffen hätte) — Timeout grosszügiger gesetzt UND killSignal auf
// SIGKILL gehärtet (SIGTERM kann von einem Prozess ignoriert/verzögert
// werden), damit ein hängender Lauf zuverlässig endet statt den ganzen
// Skript-Durchlauf zu blockieren.
const CHILD_TIMEOUT_MS = 600_000;

interface Abweichung {
  artikel: string;
  absatz: string;
  quelle: string;
  snapshot: string;
  klasse: string;
}

interface AgyLauf {
  status: string;
  modell: string;
  abweichungen: Abweichung[];
  dauerS: number;
  tokens: number;
}

/**
 * Argumentfehler => Exit 2 (nicht 1): «falsch aufgerufen» ist etwas anderes
 * als «Lauf technisch gescheitert», und ein Aufrufer soll die beiden
 * unterscheiden können.
 */
class ArgFehler extends Error {}

const AUFRUF =
  'Aufruf: gemini-diskrepanz.ts <ebene/erlass, z.B. bund/DBG> ' +
  '[--artikel N-M] [--laeufe N>=2] [--effort low|high] [--kontext N] [--out pfad] [--nur-diff]';

interface Optionen {
  ebene: string;
  erlass: string;
  artikelVon?: number;
  artikelBis?: number;
  laeufe: number;
  effort: Effort;
  kontext: number;
  out?: string;
  nurDiff: boolean;
}

function parseArgs(argv: string[]): Optionen {
  const ziel = argv[0];
  if (!ziel || !ziel.includes('/')) throw new ArgFehler(AUFRUF);
  const [ebene, erlass] = ziel.split('/');
  let artikelVon: number | undefined;
  let artikelBis: number | undefined;
  let laeufe = 2;
  let effort: Effort = 'low';
  let kontext = 1;
  let out: string | undefined;
  let nurDiff = false;

  const wert = (i: number, flagge: string): string => {
    const v = argv[i];
    if (v === undefined || v.startsWith('--')) {
      throw new ArgFehler(`${flagge} braucht einen Wert.\n${AUFRUF}`);
    }
    return v;
  };

  for (let i = 1; i < argv.length; i++) {
    const flagge = argv[i];
    if (flagge === '--artikel') {
      const spanne = wert(++i, '--artikel');
      const [von, bis] = spanne.split('-').map((x) => parseInt(x, 10));
      if (Number.isNaN(von)) throw new ArgFehler(`--artikel erwartet "N-M", erhalten: ${spanne}`);
      artikelVon = von;
      if (!Number.isNaN(bis)) artikelBis = bis;
    } else if (flagge === '--laeufe') {
      const roh = wert(++i, '--laeufe');
      const n = parseInt(roh, 10);
      // Der Konsens IST das Verfahren (Fahrplan §2 Phase 2: «zwei Läufe, nur
      // übereinstimmende Funde zählen»). Bei < 2 Läufen gibt es keinen
      // Konsens — die alte Fassung liess `--laeufe 0` zu und schrieb dann
      // einen Bericht «keine Funde», OHNE dass je ein Lauf stattfand. Das ist
      // die gefährlichste Ausgabe, die dieses Werkzeug haben kann.
      if (Number.isNaN(n) || n < 2) {
        throw new ArgFehler(
          `--laeufe muss >= 2 sein (Konsens über mehrere Läufe ist das Verfahren), erhalten: ${roh}`,
        );
      }
      laeufe = n;
    } else if (flagge === '--effort') {
      const roh = wert(++i, '--effort');
      if (roh === 'medium') {
        throw new ArgFehler(
          'Gemini 3.1 Pro kennt keine Medium-Stufe (agy models, 4.9.2026) — erlaubt: low|high.',
        );
      }
      if (roh !== 'low' && roh !== 'high') {
        throw new ArgFehler(`--effort erwartet low|high, erhalten: ${roh}`);
      }
      effort = roh;
    } else if (flagge === '--kontext') {
      const roh = wert(++i, '--kontext');
      const n = parseInt(roh, 10);
      if (Number.isNaN(n) || n < 0) throw new ArgFehler(`--kontext erwartet eine Zahl >= 0, erhalten: ${roh}`);
      kontext = n;
    } else if (flagge === '--out') {
      out = wert(++i, '--out');
    } else if (flagge === '--nur-diff') {
      nurDiff = true;
    } else {
      // Stillschweigend ignorierte Flags sind die schlimmste Sorte Fehler:
      // ein Tippfehler in --laeufe sähe wie ein normaler Lauf aus.
      throw new ArgFehler(`Unbekanntes Argument: ${flagge}\n${AUFRUF}`);
    }
  }
  return { ebene, erlass, artikelVon, artikelBis, laeufe, effort, kontext, out, nurDiff };
}

/** Liest den Pin-Eintrag `name|eli|kons|n|anker|sr` aus scripts/fedlex-cache.sh — liest nur, ändert den Risikopfad nicht. */
function ladePin(name: string): { eli: string; kons: string; n: string; sr?: string } | null {
  const skript = readFileSync('scripts/fedlex-cache.sh', 'utf8');
  const zeile = skript
    .split('\n')
    .find((z) => new RegExp(`"${name}\\|`).test(z.trim()));
  if (!zeile) return null;
  const inhalt = zeile.trim().replace(/^"/, '').replace(/",?$/, '');
  const [, eli, kons, n, , sr] = inhalt.split('|');
  return { eli, kons, n, sr };
}

function ladeQuelle(erlassName: string): string {
  const name = erlassName.toLowerCase();
  const pin = ladePin(name);
  if (!pin) {
    throw new Error(
      `Kein Fedlex-Pin für "${name}" in scripts/fedlex-cache.sh gefunden — Abbruch (kein Live-Laden ohne Pin).`,
    );
  }
  const cacheDatei = `/tmp/${name}.html`;
  if (!existsSync(cacheDatei)) {
    throw new Error(
      `Cache fehlt: ${cacheDatei}. Pin vorhanden (kons=${pin.kons}, n=${pin.n}, sr=${pin.sr ?? '—'}) ` +
        `— führe zuerst 'bash scripts/fedlex-cache.sh' aus (dieses Skript lädt NICHT live).`,
    );
  }
  return readFileSync(cacheDatei, 'utf8');
}

function ladeSnapshot(ebene: string, erlassName: string): NormSnapshotDatei {
  const pfad = `public/normtext/${ebene}/${erlassName.toUpperCase()}.json`;
  if (!existsSync(pfad)) {
    throw new Error(`Snapshot fehlt: ${pfad}`);
  }
  return JSON.parse(readFileSync(pfad, 'utf8')) as NormSnapshotDatei;
}

interface Gruppe {
  artikel: string[];
  prompt: string;
  zeichen: number;
}

function bildeGruppen(
  quelle: Map<string, ArtikelKlartext>,
  snapshot: Map<string, ArtikelKlartext>,
  auswahl: string[],
): Gruppe[] {
  const schluessel = [...auswahl].sort(sortiereArtikelSchluessel);
  const gruppen: Gruppe[] = [];
  let aktuell: string[] = [];
  let aktuellQuelle: string[] = [];
  let aktuellSnapshot: string[] = [];
  let zeichen = 0;

  const flush = () => {
    if (!aktuell.length) return;
    const prompt = bauePrompt(aktuellQuelle.join('\n\n'), aktuellSnapshot.join('\n\n'));
    gruppen.push({ artikel: aktuell, prompt, zeichen });
    aktuell = [];
    aktuellQuelle = [];
    aktuellSnapshot = [];
    zeichen = 0;
  };

  for (const k of schluessel) {
    const q = quelle.get(k);
    const sn = snapshot.get(k);
    const qText = q ? `=== Art. ${k} (Quelle) ===\n${formatiereArtikel(q)}` : `=== Art. ${k} (Quelle) ===\n[kein Fedlex-Artikel gefunden]`;
    const sText = sn ? `=== Art. ${k} (Snapshot) ===\n${formatiereArtikel(sn)}` : `=== Art. ${k} (Snapshot) ===\n[kein Snapshot-Eintrag]`;
    const zusatz = qText.length + sText.length;
    if (zeichen + zusatz > GRUPPEN_BUDGET_ZEICHEN && aktuell.length) flush();
    aktuell.push(k);
    aktuellQuelle.push(qText);
    aktuellSnapshot.push(sText);
    zeichen += zusatz;
  }
  flush();
  return gruppen;
}

function bauePrompt(quelle: string, snapshot: string): string {
  return `Rolle: Du bist ein reines Abgleich-Werkzeug. Du machst KEINE Rechtsauslegung
und KEINE Bewertung, ob eine Abweichung rechtlich relevant ist. Du vergleichst
ausschliesslich den Wortlaut zweier Texte (QUELLE = amtliche Fassung,
SNAPSHOT = zu prüfende Kopie) und listest JEDE textliche Abweichung auf:
fehlender Text (drop), zusätzlicher/fremder Text der in der Quelle nicht als
sichtbarer Normtext vorkommt (leak), verlorene/falsche lateinische Ordinal-
Suffixe wie bis/ter (bister), Tabellen-Struktur-Abweichungen (tabelle),
Zahlenabweichungen (zahl) oder sonstige Textabweichungen (sonst). Der
Fussnoten-Apparat der Quelle ist separat markiert ("--- Fussnoten (Quelle) ---")
— fehlt er im Snapshot komplett, ist das KEIN Fund (der Snapshot führt keinen
separaten Fussnoten-Text; nur inhaltliche Abweichungen IM Artikeltext zählen).

Gib AUSSCHLIESSLICH ein JSON-Objekt zurück, keine Erklärung, kein Markdown,
nach exakt diesem Schema:
{"modell": string, "abweichungen": [{"artikel": string, "absatz": string, "quelle": string, "snapshot": string, "klasse": "drop|leak|tabelle|bister|zahl|sonst"}]}

Wenn keine Abweichung gefunden wird: {"modell": string, "abweichungen": []}

=== QUELLE (amtliche Fassung, je Artikel) ===
${quelle}

=== SNAPSHOT (zu prüfende Kopie, je Artikel) ===
${snapshot}
`;
}

/**
 * JSON-Schema für die Antwort — von der Fahrplan-Spec (§2 Phase 2) verlangt
 * («--json-schema mit Selbstangabe-Feld `modell`»), in der ersten Fassung
 * aber nie übergeben. Ohne Schema antwortete Gemini in den Pilotläufen vom
 * 4.9.2026 in 2 von 2 Erlassen in EINEM der beiden Läufe mit etwas, das kein
 * nacktes JSON war — der Konsens ist damit strukturell immer leer.
 */
const ANTWORT_SCHEMA = JSON.stringify({
  type: 'object',
  properties: {
    modell: { type: 'string' },
    abweichungen: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          artikel: { type: 'string' },
          absatz: { type: 'string' },
          quelle: { type: 'string' },
          snapshot: { type: 'string' },
          klasse: { type: 'string', enum: ['drop', 'leak', 'tabelle', 'bister', 'zahl', 'sonst'] },
        },
        required: ['artikel', 'absatz', 'quelle', 'snapshot', 'klasse'],
      },
    },
  },
  required: ['modell', 'abweichungen'],
});

function rufeAgyAuf(prompt: string, tempDir: string, label: string, modell: string): AgyLauf {
  // Temp-Datei als Provenienz/Debug-Artefakt (Fahrplan-Vorgabe); die Übergabe an
  // agy selbst läuft per argv (execFileSync ohne Shell — kein `$(cat …)`-Quoting-
  // Risiko), aber sie MUSS unter der Linux-Einzelargument-Grenze bleiben.
  const promptDatei = join(tempDir, `${label}.txt`);
  writeFileSync(promptDatei, prompt, 'utf8');
  const schemaDatei = join(tempDir, 'antwort-schema.json');
  writeFileSync(schemaDatei, ANTWORT_SCHEMA, 'utf8');
  const bytes = Buffer.byteLength(prompt, 'utf8');
  if (bytes > MAX_ARG_BYTES) {
    // Lieber ein sichtbarer Status als ein E2BIG, das nur auf Linux auftritt:
    // ein Lauf, der hier still durchginge und in CI scheiterte, wäre genau die
    // Sorte Umgebungs-Abhängigkeit, die man nicht bemerkt.
    process.stderr.write(
      `Prompt zu gross (${bytes} B > ${MAX_ARG_BYTES} B, Linux MAX_ARG_STRLEN) — ` +
        `Gruppe ${label} übersprungen. Kleiner schneiden (--artikel N-M).\n`,
    );
    return { status: 'PROMPT_ZU_GROSS', modell: '', abweichungen: [], dauerS: 0, tokens: 0 };
  }
  let stdout: string;
  try {
    stdout = execFileSync(
      AGY,
      [
        '-p',
        prompt,
        '--model',
        modell,
        '--json-schema',
        schemaDatei,
        '--output-format',
        'json',
        '--print-timeout',
        `${PRINT_TIMEOUT_S}s`,
        '--sandbox',
      ],
      { timeout: CHILD_TIMEOUT_MS, killSignal: 'SIGKILL', maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' },
    );
  } catch (err) {
    // execFileSync füllt bei nicht-null Exit-Code err.stdout/err.stderr —
    // «leeres stdout mit stderr-Hinweis» ist genau dieser Fall. Selbe
    // Musterprüfung wie bei status !== 'SUCCESS' (agy-status.ts).
    const fehler = err as Error & { stdout?: string | Buffer; stderr?: string | Buffer };
    const stderrText = fehler.stderr ? String(fehler.stderr) : '';
    const klass = klassiereAgyFehler(`${fehler.message} ${stderrText}`);
    if (klass.art === 'kontingent') {
      process.stderr.write(`${KONTINGENT_MELDUNG} (${label}): ${klass.text}\n`);
      return { status: 'KONTINGENT', modell: '', abweichungen: [], dauerS: 0, tokens: 0 };
    }
    process.stderr.write(`agy-Aufruf fehlgeschlagen (${label}): ${(err as Error).message}\n`);
    return {
      status: 'ERROR',
      modell: '',
      abweichungen: [],
      dauerS: 0,
      tokens: 0,
    };
  }
  let envelope: { status: string; response: string; duration_seconds: number; usage?: { total_tokens: number } };
  try {
    envelope = JSON.parse(stdout);
  } catch {
    return { status: 'PARSE_FEHLER', modell: '', abweichungen: [], dauerS: 0, tokens: 0 };
  }
  if (envelope.status !== 'SUCCESS') {
    const klass = klassiereAgyFehler(`${envelope.status} ${envelope.response ?? ''}`);
    if (klass.art === 'kontingent') {
      process.stderr.write(`${KONTINGENT_MELDUNG} (${label}): ${klass.text}\n`);
      return { status: 'KONTINGENT', modell: '', abweichungen: [], dauerS: envelope.duration_seconds ?? 0, tokens: envelope.usage?.total_tokens ?? 0 };
    }
    return { status: envelope.status, modell: '', abweichungen: [], dauerS: envelope.duration_seconds ?? 0, tokens: envelope.usage?.total_tokens ?? 0 };
  }
  let payload: { modell: string; abweichungen: Abweichung[] };
  const kern = schaeleJson(envelope.response ?? '');
  try {
    if (kern === null) throw new Error('kein JSON-Objekt in der Antwort');
    payload = JSON.parse(kern);
  } catch {
    writeFileSync(join(tempDir, `${label}-antwort-roh.txt`), envelope.response ?? '', 'utf8');
    return { status: 'ANTWORT_KEIN_JSON', modell: '', abweichungen: [], dauerS: envelope.duration_seconds, tokens: envelope.usage?.total_tokens ?? 0 };
  }
  return {
    status: 'SUCCESS',
    modell: payload.modell ?? '',
    abweichungen: payload.abweichungen ?? [],
    dauerS: envelope.duration_seconds,
    tokens: envelope.usage?.total_tokens ?? 0,
  };
}

/** Konsens: ein Fund zählt nur, wenn er in ALLEN Läufen vorkommt (gleicher Artikel + Klasse + überlappender Text). */
function ueberlappt(a: string, b: string): boolean {
  const an = a.trim().toLowerCase();
  const bn = b.trim().toLowerCase();
  if (!an && !bn) return true;
  if (!an || !bn) return false;
  return an.includes(bn) || bn.includes(an) || an.slice(0, 40) === bn.slice(0, 40);
}

function konsens(laeufe: AgyLauf[]): Abweichung[] {
  if (!laeufe.length || laeufe.some((l) => l.status !== 'SUCCESS')) return [];
  const [erster, ...rest] = laeufe;
  return erster.abweichungen.filter((f) =>
    rest.every((lauf) =>
      lauf.abweichungen.some(
        (g) => g.artikel === f.artikel && g.klasse === f.klasse && (ueberlappt(g.quelle, f.quelle) || ueberlappt(g.snapshot, f.snapshot)),
      ),
    ),
  );
}

function kuerze(s: string, n = 160): string {
  const flach = s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return flach.length > n ? `${flach.slice(0, n)}…` : flach;
}

async function main() {
  const { ebene, erlass, artikelVon, artikelBis, laeufe, effort, kontext, out, nurDiff } =
    parseArgs(process.argv.slice(2));
  if (ebene !== 'bund') {
    throw new ArgFehler(`Ebene "${ebene}" nicht unterstützt (Pilot nur "bund" — Fedlex-Cache-Pins sind bundesrechtlich).`);
  }
  const modell = MODELLE[effort];

  const html = ladeQuelle(erlass);
  const snapshotDatei = ladeSnapshot(ebene, erlass);

  const quelleMap = reduziereQuelleHtml(html, artikelVon, artikelBis);
  const eintraegeGefiltert = snapshotDatei.eintraege.filter((e) => {
    // Scope V1: nur Artikel (Fedlex `<article id="art_N">`), keine Anhänge
    // (Fedlex `<section id="annex_N">` — andere Struktur, h1/Tabellen, hier
    // NICHT geparst). Snapshot-Artikelschlüssel für echte Artikel beginnen
    // IMMER mit einer Ziffer ("1", "5a", "329d", "5bis"); Anhang-Schlüssel wie
    // "annex_1" beginnen mit einem Buchstaben — ohne diesen Filter meldet
    // JEDER Anhang systematisch "kein Fedlex-Artikel gefunden" (Scheinfund,
    // T2-Lehre: keine Harness-Artefakte einstreuen). Beobachtet 4.9.2026 am
    // AMBV-Pilotlauf.
    if (!/^\d/.test(e.artikel)) return false;
    if (artikelVon === undefined && artikelBis === undefined) return true;
    const n = parseInt(e.artikel.replace(/[^0-9].*$/, ''), 10);
    if (Number.isNaN(n)) return true;
    return (artikelVon === undefined || n >= artikelVon) && (artikelBis === undefined || n <= artikelBis);
  });
  const snapshotMap = reduziereSnapshot(eintraegeGefiltert);

  // SCHRITT 1 — deterministisch. Kein Modell, kein Netz, keine Kosten.
  const befunde: ArtikelBefund[] = ermittleAbweichungen(quelleMap, snapshotMap);
  const abweichend = befunde.filter((b) => b.abweichend);
  const auswahl = waehleMitKontext(befunde, kontext);

  // SCHRITT 2 — Gemini, aber NUR auf den abweichenden Artikeln (+ Kontext).
  const gruppen = nurDiff || !auswahl.length
    ? []
    : bildeGruppen(quelleMap, snapshotMap, auswahl);
  const tempDir = mkdtempSync(join(tmpdir(), 'diskrepanz-'));

  const alleFunde: Array<Abweichung & { gruppe: number }> = [];
  let gesamtTokens = 0;
  let gesamtDauer = 0;
  let modellWarnung = false;
  let kontingentGefunden = false;
  const statusJeGruppe: string[] = [];

  for (let gi = 0; gi < gruppen.length; gi++) {
    const g = gruppen[gi];
    const laeufeErg: AgyLauf[] = [];
    for (let li = 0; li < laeufe; li++) {
      const lauf = rufeAgyAuf(g.prompt, tempDir, `gruppe${gi}-lauf${li}`, modell);
      laeufeErg.push(lauf);
      if (lauf.status === 'KONTINGENT') kontingentGefunden = true;
      gesamtTokens += lauf.tokens;
      gesamtDauer += lauf.dauerS;
      // Die Wache prüft ZWEI Dinge: dass der Lauf überhaupt gelang, und dass
      // die Selbstauskunft plausibel ist. Ohne die Status-Prüfung schlug sie
      // bei jedem gescheiterten Lauf an (`modell` ist dann leer) und erzeugte
      // eine Warnung über einen "Fallback", der nie stattfand.
      if (lauf.status === 'SUCCESS' && !/gemini/i.test(lauf.modell)) modellWarnung = true;
    }
    statusJeGruppe.push(laeufeErg.map((l) => l.status).join('/'));
    for (const f of konsens(laeufeErg)) alleFunde.push({ ...f, gruppe: gi });
  }

  const zeilen: string[] = [];
  zeilen.push(`# Diskrepanz-Bericht — ${ebene}/${erlass.toUpperCase()}`);
  zeilen.push('');
  zeilen.push(
    `Artikel im Vergleich: ${befunde.length} · mit deterministischer Differenz: ${abweichend.length} · ` +
      `an Gemini gesendet (inkl. ±${kontext} Kontext): ${auswahl.length} in ${gruppen.length} Gruppe(n)`,
  );
  zeilen.push(
    `Läufe je Gruppe: ${laeufe} · Modell: ${gruppen.length ? modell : '— (kein Lauf nötig)'} · ` +
      `Status je Gruppe: ${statusJeGruppe.join(', ') || '—'}`,
  );
  zeilen.push(`Tokens gesamt: ${gesamtTokens} · Dauer gesamt: ${gesamtDauer.toFixed(1)} s`);
  zeilen.push('');

  // ─── Teil 1: der BELEG (deterministisch, ohne Modell) ───
  zeilen.push('## 1 · Deterministische Abweichungen (Beleg)');
  zeilen.push('');
  zeilen.push('Zeichengenauer Diff der beiden Reduktionen. Diese Liste ist reproduzierbar und');
  zeilen.push('modellunabhängig — sie ist der Befund, an dem Teil 2 gemessen wird.');
  zeilen.push('');
  if (!abweichend.length) {
    zeilen.push('Keine Abweichung. Quelle und Snapshot reduzieren zu identischem Klartext.');
  } else {
    zeilen.push('| Artikel | Zeile | Quelle sagt | Snapshot sagt |');
    zeilen.push('|---|---|---|---|');
    for (const b of abweichend) {
      if (b.labelQuelle !== b.labelSnapshot) {
        zeilen.push(`| ${b.artikel} | (Label) | ${kuerze(b.labelQuelle)} | ${kuerze(b.labelSnapshot)} |`);
      }
      for (const z of b.zeilen) {
        zeilen.push(`| ${b.artikel} | ${z.zeile} | ${kuerze(z.quelle)} | ${kuerze(z.snapshot)} |`);
      }
    }
  }
  zeilen.push('');

  // ─── Teil 2: die DEUTUNG (Verdachtsliste, §14.7) ───
  zeilen.push('## 2 · Geminis Klassierung dazu (Konsens über alle Läufe)');
  zeilen.push('');
  zeilen.push('VERDACHTSLISTE, KEIN BELEG (§14.7). Gemini deutet die Abweichungen aus Teil 1;');
  zeilen.push('es findet sie nicht und bestätigt sie nicht. Jede Zeile gehört gegen die');
  zeilen.push('amtliche Fassung geprüft, bevor sie «Befund» heisst.');
  zeilen.push('');
  if (modellWarnung) {
    zeilen.push(
      'WARNUNG: mindestens ein gelungener Lauf gab im Feld `modell` etwas ohne «Gemini» an. ' +
        'Das Feld ist eine SELBSTAUSKUNFT des Modells, kein verifizierter Nachweis — es belegt ' +
        'weder, welches Modell wirklich antwortete, noch schliesst sein Fehlen einen stillen ' +
        'Fallback aus (Fahrplan §4).',
    );
    zeilen.push('');
  }
  if (nurDiff) {
    zeilen.push('Übersprungen (--nur-diff).');
  } else if (!auswahl.length) {
    zeilen.push('Kein Lauf nötig — Teil 1 fand keine Abweichung.');
  } else if (!alleFunde.length) {
    zeilen.push('Keine übereinstimmende Klassierung über alle Läufe.');
  } else {
    zeilen.push('| Artikel | Absatz | Klasse | Quelle sagt | Snapshot sagt |');
    zeilen.push('|---|---|---|---|---|');
    for (const f of alleFunde) {
      zeilen.push(`| ${f.artikel} | ${f.absatz} | ${f.klasse} | ${kuerze(f.quelle, 200)} | ${kuerze(f.snapshot, 200)} |`);
    }
  }
  const bericht = zeilen.join('\n') + '\n';

  process.stdout.write(bericht);

  const zielpfad = out ?? join(tempDir, `bericht-${erlass.toLowerCase()}.md`);
  writeFileSync(zielpfad, bericht, 'utf8');
  process.stderr.write(`\nBericht geschrieben: ${zielpfad}\n`);

  if (kontingentGefunden) {
    // Exit 3 statt des generischen 0/1 — «Lauf technisch gelungen, aber
    // Kontingent gesperrt» ist ein eigener, unterscheidbarer Ausgang
    // (Fahrplan §4 «Limite erkennen»), kein normaler Erfolg.
    process.stderr.write(`${KONTINGENT_MELDUNG}\n`);
    process.exitCode = 3;
  }
}

main().catch((err) => {
  // Drei Ausgänge, bewusst unterscheidbar:
  //   2 = falsch aufgerufen (unbekanntes Flag, --laeufe < 2, falsche Ebene)
  //   1 = Abbruch VOR/OHNE agy-Lauf (fehlender Pin/Cache) — kein "technisch
  //       gelungener Lauf", damit ein Abbruch nicht wie ein leerer Befund aussieht
  //   0 = Lauf gelungen, unabhängig vom Fundinhalt (Sichtwerkzeug, kein Tor —
  //       Fahrplan §2 Phase 2 "Ablage"); ein agy-Lauf, der selbst fehlschlägt,
  //       wird INNERHALB main() aufgefangen und steht als Status im Bericht.
  process.stderr.write(`FEHLER: ${(err as Error).message}\n`);
  process.exitCode = err instanceof ArgFehler ? 2 : 1;
});
