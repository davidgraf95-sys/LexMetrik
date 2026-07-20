// scripts/gegenpruefung/kern.ts
//
// Geteilte Diff-Hash-Kernfunktion des Gegenprüfungs-Gate (QS-GP).
// EINE Quelle der Wahrheit: das Tor (check-gegenpruefung.ts) und der
// Quittier-Helfer (gegenpruefung-ok.ts) rufen `risikoDiffHash()` identisch auf
// und rechnen darum bitgleich (Design-Spec Z. 112).
//
// Kanonik (gehärtet per Panel-Linse 1):
//  - EIN deterministischer git-Aufruf:
//      git -C <toplevel> status --porcelain=v1 -z -uall --no-renames
//    * -uall  → neue Verzeichnisse werden zu EINZELdateien expandiert (sonst
//               kollabiert ein neu generierter Extraktions-Teilbaum zu «?? public/»
//               und entkäme dem Tor — Blocker Linse 1).
//    * --no-renames → keine Zwei-Feld-Sätze; jede Änderung zerfällt in
//               Einzel-Pfad add/modify/delete (stabiler, parsierbarer Hash).
//  - Risiko-Menge = Pfad matcht ≥1 Risiko-Prädikat UND kein Prüflogik-Prädikat
//    (hand-gerollte String-Prädikate wie scripts/plan/check.ts — KEINE Glob-Lib,
//     Linse 2: die Glob-Form der Spec über-/unter-matchte).
//  - Pro Pfad die Working-Tree-Bytes von PLATTE binden (nicht Index): so bindet
//    der Nachweis genau das, was der Prüf-Agent gesehen hat (MM: Platte ≠ Index).
//  - Kollisionsfreier Inkrementhash: pfad·NUL·art·NUL·wert·NUL (Pfade enthalten
//    nie 0x00). `art` trennt leere Datei (sha256('')) sicher von Löschung.
//  - Bewusst NICHT im Hash: die X/Y-Statuscodes / der Staging-Zustand → nach der
//    Quittung bloss `git add` lässt den Hash unverändert (Pending bleibt gültig);
//    erst eine echte Byte-Änderung kippt ihn (Selbstauflösung, Spec Z. 52-54).

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync, readlinkSync } from 'node:fs';
import { join } from 'node:path';

const NUL = Buffer.from([0]);

function sha256(daten: Buffer | string): string {
  return createHash('sha256')
    .update(typeof daten === 'string' ? Buffer.from(daten, 'utf8') : daten)
    .digest('hex');
}

export interface DiffErgebnis {
  /** false = CI-Selbstschutz ODER kein Git/kein HEAD → Aufrufer protokolliert SKIP. */
  kontext: boolean;
  /**
   * WARUM der Kontext fehlt — nur gesetzt, wenn `kontext === false`.
   * Die frühere Fassung warf beide Fälle in einen Text («no-op (CI oder kein
   * Git/HEAD)») und meldete sie als «grün». Das verletzt §6 Ziff. 7 lit. b
   * (bei fehlender Voraussetzung rot ODER explizit SKIP — nie still grün) und
   * vermischte zwei völlig verschiedene Ursachen: der CI-Selbstschutz ist ein
   * bewusster Entscheid, ein kaputtes Git-Verzeichnis ist ein Defekt.
   */
  grund?: 'ci-selbstschutz' | 'kein-git';
  /** null = Git vorhanden, aber keine Risiko-Datei geändert (grün, «nichts zu beweisen»). */
  hash: string | null;
  /** die behaltenen (Risiko ∖ Prüflogik) Pfade, byte-sortiert. */
  dateien: string[];
}

type Eintrag = { pfad: string; art: 'datei' | 'geloescht' | 'symlink'; wert: string };

// ─── Pfad-Prädikate (hand-gerollt, git-relativer POSIX-Pfad) ────────────────

const basename = (p: string): string => p.split('/').pop() ?? p;

// Rechnen-Engines: top-level src/lib/<name>.ts, dessen Basename eines der
// Rechen-Stichwörter enthält (Linse 2: exakt die gewollten Engine-Dateien,
// nicht alle 75 top-level src/lib/*.ts). Die ^src/lib/[^/]+\.ts$-Klammer
// verhindert Rekursion in Unterordner (die separat als Präfix erfasst sind).
const RECHNEN_RE =
  /(tarif|kosten|gebuehr|zustaendigkeit|frist|verjaehr|streitwert|beurkund|gruendung|schkg|straf|bger)/i;

/** Risiko-Pfade: Extraktion · Rechnen · Norm/Tarif (real gegen den Baum verifiziert). */
export function istRisikoPfad(p: string): boolean {
  // Extraktion
  if (p.startsWith('scripts/normtext/')) return true;
  if (p === 'scripts/normtext-snapshot.ts' || p === 'scripts/normtext-entscheide.ts') return true;
  if (p.startsWith('src/lib/normtext/')) return true;
  // Fedlex-Portfolio (FAHRPLAN-FEDLEX-PORTFOLIO Paket 1): die Wurzel-Skripte
  // scripts/fedlex-*.{sh,ts} (cache.sh-Pins, versionen-pruefen, wiedervorlage-
  // generieren, sparql-Helfer) steuern Currency/Extraktion = Risiko-Pfad. Ohne
  // diesen Glob triggern reine cache.sh/pins-Edits das Gegenprüfungs-Tor NICHT.
  if (p.startsWith('scripts/fedlex-')) return true;
  // QS-DATA (FAHRPLAN-DATENHALTUNG §4/§5 E1): Datenhaltungs-Schicht = Extraktion/Projektion
  // = Risiko-Pfad. Das Dump-Manifest bindet den DB-Zustand mit (Drift-Anker).
  if (p.startsWith('scripts/datenhaltung/')) return true;
  // BS-Rechtsprechung (Bauplan §8.4): Crawl-/Parse-Pipeline des amtlichen
  // BS-Portals = Extraktions-Risiko (check-*-Basenames via istPruefLogik ausgenommen).
  if (p.startsWith('scripts/rechtsprechung/')) return true;
  // Richter-Fundament (FAHRPLAN-RECHTSPRECHUNG §R-RICHTER): der Besetzungs-Parser
  // entscheidet über PERSONEN-IDENTITÄT (welcher Rohname wird zu welchem Kanon-Slug)
  // und trägt den Anonymisierungs-Guard, der anonymisierte Parteien/Gutachter von
  // amtlich genannten Richter:innen scheidet. Ein Fehler hier verschmilzt zwei reale
  // Amtsträger zu einer Filter-Person oder de-anonymisiert eine Partei — beides
  // Risiko-Klasse, obwohl die Datei unter src/lib/ liegt.
  if (p === 'src/lib/rechtsprechung/besetzung.ts') return true;
  if (p.startsWith('daten/')) return true;
  if (p === 'daten-manifest.json') return true;
  // rekursiv (nicht nur die 4 Top-Level-Index-JSONs) — Blocker Linse 2:
  if (p.startsWith('public/normtext/') && p.endsWith('.json')) return true;
  // Materialien (E6a Stufe 1, FAHRPLAN-MATERIALIEN-VERZAHNUNG §4): Adapter/Projektion +
  // die committeten Projektionen (register.json eine Ebene + Kanten-Shards rekursiv) =
  // Extraktions-/Projektions-Risiko. check-*-Basenames sind über istPruefLogik ausgenommen.
  if (p.startsWith('scripts/materialien/')) return true;
  if (/^public\/materialien\/[^/]+\.json$/.test(p)) return true;
  if (p.startsWith('public/materialien/kanten/')) return true;
  // Verzahnung V1c (FAHRPLAN-VERZAHNUNG-UI §V1c): der Normrevisions-Extrakt liest die
  // amtlichen Struktur-Fussnoten und leitet je Artikel das Revisionsdatum + AS ab =
  // Extraktions-Risiko. Der Generator, die reine Parser-Logik und die committete
  // Projektion (Shards) sind gebunden; die UI-Ladeschicht (artikel-revisionen.ts) ist
  // Darstellung und bleibt aussen vor. check-Basenames sind über istPruefLogik ausgenommen.
  if (p.startsWith('scripts/verzahnung/')) return true;
  if (p === 'src/lib/verzahnung/revisionen-extrakt.ts') return true;
  if (p.startsWith('public/verzahnung/artikel-revisionen/')) return true;
  // Rechnen
  if (/^src\/lib\/[^/]+\.ts$/.test(p) && RECHNEN_RE.test(basename(p))) return true;
  if (p.startsWith('src/lib/tarif/')) return true;
  if (p.startsWith('src/lib/fristenspiegel/')) return true;
  // Norm/Tarif
  if (p.startsWith('src/data/tarif/')) return true;
  if (p.startsWith('src/lib/vorlagen/')) return true;
  return false;
}

/** Auto-Ausnahme: reine Prüflogik (Tor/Test/Check) — löst die Über-Triggerung. */
export function istPruefLogik(p: string): boolean {
  const b = basename(p);
  if (b.endsWith('.test.ts') || b.endsWith('.spec.ts')) return true;
  // scripts/**/*check* (Basename enthält «check»)
  if (p.startsWith('scripts/') && b.includes('check')) return true;
  // die geteilte Kernfunktion + ihr Verzeichnis
  if (p.startsWith('scripts/gegenpruefung/')) return true;
  if (p === 'scripts/gate.sh') return true;
  if (p === 'scripts/check-gegenpruefung.ts') return true;
  if (p === 'scripts/gegenpruefung-ok.ts') return true;
  return false;
}

/** Behalten = Risiko UND keine Prüflogik (Set-Subtraktion NACH dem Risiko-Filter). */
export function behalten(p: string): boolean {
  return istRisikoPfad(p) && !istPruefLogik(p);
}

// ─── git-Kanonik ────────────────────────────────────────────────────────────

function toplevel(cwd: string): string | null {
  try {
    return execFileSync('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function hatHead(root: string): boolean {
  try {
    execFileSync('git', ['-C', root, 'rev-parse', '--verify', 'HEAD'], {
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

function splitNul(buf: Buffer): Buffer[] {
  const out: Buffer[] = [];
  let start = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0) {
      if (i > start) out.push(buf.subarray(start, i));
      start = i + 1;
    }
  }
  if (start < buf.length) out.push(buf.subarray(start));
  return out;
}

/**
 * Diff-gebundener sha256 über die aktuell geänderten Risiko-Inhalte.
 * @param opts.cwd       Arbeitsverzeichnis (Default process.cwd()) — nur für Tests variiert.
 * @param opts.behalten  Klassifizierer (Default `behalten`) — nur für Tests injizierbar.
 */
export function risikoDiffHash(
  opts: { cwd?: string; behalten?: (p: string) => boolean } = {},
): DiffErgebnis {
  const cwd = opts.cwd ?? process.cwd();
  const behaltenFn = opts.behalten ?? behalten;

  // CI-Selbstschutz (GH Actions/Vercel setzen CI; GITHUB_ACTIONS als Gürtel+Hosenträger).
  // Der Arbiter für den committeten Bereich ist in CI `check:merge-schutz`
  // (seit 20.7.2026 in ci.yml verdrahtet) — dieses Tor liest den Working Tree,
  // der in CI per Definition sauber ist.
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    return { kontext: false, grund: 'ci-selbstschutz', hash: null, dateien: [] };
  }

  const root = toplevel(cwd);
  if (!root || !hatHead(root)) {
    return { kontext: false, grund: 'kein-git', hash: null, dateien: [] };
  }

  let out: Buffer;
  try {
    out = execFileSync(
      'git',
      ['-C', root, 'status', '--porcelain=v1', '-z', '-uall', '--no-renames'],
      { stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 },
    );
  } catch {
    return { kontext: false, hash: null, dateien: [] };
  }

  const kandidaten: string[] = [];
  for (const satz of splitNul(out)) {
    if (satz.length < 4) continue; // XY<space><≥1 Zeichen Pfad>
    const x = String.fromCharCode(satz[0]);
    if (x === 'R' || x === 'C') {
      // Kann mit --no-renames nicht auftreten — defensiv hart scheitern.
      throw new Error(`Rename/Copy-Satz trotz --no-renames: ${satz.toString('utf8')}`);
    }
    // Bytes[0..1]=XY, Byte[2]=Space, Rest=roher UTF-8-Pfad (repo-root-relativ,
    // forward-slash, unquotet — auch bei core.quotepath=true).
    kandidaten.push(satz.subarray(3).toString('utf8'));
  }

  const dateien = kandidaten.filter(behaltenFn);
  if (dateien.length === 0) return { kontext: true, hash: null, dateien: [] };

  const eintraege: Eintrag[] = dateien.map((pfad) => {
    const abs = join(root, pfad);
    let st;
    try {
      st = lstatSync(abs);
    } catch (e) {
      if (e && (e as NodeJS.ErrnoException).code === 'ENOENT') {
        return { pfad, art: 'geloescht', wert: '' };
      }
      throw e;
    }
    if (st.isSymbolicLink()) return { pfad, art: 'symlink', wert: sha256(readlinkSync(abs)) };
    if (st.isFile()) return { pfad, art: 'datei', wert: sha256(readFileSync(abs)) };
    if (st.isDirectory()) throw new Error(`Verzeichnis in Risiko-Menge trotz -uall: ${pfad}`);
    throw new Error(`Unerwarteter Dateityp in Risiko-Menge: ${pfad}`);
  });

  // Byte-Sortierung der UTF-8-Pfade (maschinen-/locale-unabhängig).
  eintraege.sort((a, b) => Buffer.compare(Buffer.from(a.pfad, 'utf8'), Buffer.from(b.pfad, 'utf8')));

  const h = createHash('sha256');
  for (const e of eintraege) {
    h.update(Buffer.from(e.pfad, 'utf8'));
    h.update(NUL);
    h.update(e.art);
    h.update(NUL);
    h.update(e.wert);
    h.update(NUL);
  }
  return { kontext: true, hash: h.digest('hex'), dateien: eintraege.map((e) => e.pfad) };
}
