// src/tests/gegenpruefung.test.ts
//
// Tor-Dichte (Design-Spec Z. 104-110) + Kern-Kanten (Panel-Linse 1) +
// Glob-Realitäts-Regressionen (Panel-Linse 2). Läuft gegen echte temporäre
// git-Repos, damit die git-Kanonik (-uall/--no-renames/Platte-Bindung) real geprüft ist.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import {
  risikoDiffHash,
  behalten,
  istRisikoPfad,
  istPruefLogik,
} from '../../scripts/gegenpruefung/kern';
import { bewerte } from '../../scripts/check-gegenpruefung';

// ─── git-Test-Helfer ─────────────────────────────────────────────────────────
const angelegt: string[] = [];

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}
function schreib(root: string, pfad: string, inhalt: string): void {
  const abs = join(root, pfad);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, inhalt, 'utf8');
}
function neuesRepo(): string {
  const root = mkdtempSync(join(tmpdir(), 'gp-'));
  angelegt.push(root);
  git(root, 'init', '-q');
  const leer = join(root, '.githooks-leer');
  mkdirSync(leer, { recursive: true });
  git(root, 'config', 'core.hooksPath', leer); // fremde globale Hooks neutralisieren
  git(root, 'config', 'user.email', 't@t.ch');
  git(root, 'config', 'user.name', 'Test');
  git(root, 'config', 'commit.gpgsign', 'false');
  return root;
}
function commitAlles(root: string, msg = 'init'): void {
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', msg);
}
/** Repo mit einer committeten Basis-Datei (damit HEAD existiert). */
function repoMitBasis(): string {
  const root = neuesRepo();
  schreib(root, 'README.md', 'basis\n');
  commitAlles(root);
  return root;
}
const hash = (root: string) => risikoDiffHash({ cwd: root });

// CI-Selbstschutz feuert im Kern über process.env.CI/GITHUB_ACTIONS — für die
// Nicht-CI-Fälle sicher abschalten (die Suite selbst läuft in CI mit CI=true).
let ciBak: string | undefined;
let ghBak: string | undefined;
beforeEach(() => {
  ciBak = process.env.CI;
  ghBak = process.env.GITHUB_ACTIONS;
  delete process.env.CI;
  delete process.env.GITHUB_ACTIONS;
});
afterEach(() => {
  if (ciBak === undefined) delete process.env.CI;
  else process.env.CI = ciBak;
  if (ghBak === undefined) delete process.env.GITHUB_ACTIONS;
  else process.env.GITHUB_ACTIONS = ghBak;
});
afterAll(() => {
  for (const r of angelegt) rmSync(r, { recursive: true, force: true });
});

// ─── Die sechs Tor-Fälle (Spec Z. 104-110) ──────────────────────────────────
describe('Tor check:gegenpruefung — die sechs Fälle', () => {
  it('1) Diff berührt Risiko-Pfad, kein Pending → ROT', () => {
    const root = repoMitBasis();
    schreib(root, 'src/lib/tarif/x.ts', 'export const a = 1;\n');
    const r = hash(root);
    expect(r.kontext).toBe(true);
    expect(r.hash).not.toBeNull();
    expect(r.dateien).toContain('src/lib/tarif/x.ts');
    expect(bewerte(r, null).gruen).toBe(false);
  });

  it('2) Pending mit passendem Hash + bestanden → GRÜN', () => {
    const root = repoMitBasis();
    schreib(root, 'src/lib/tarif/x.ts', 'export const a = 1;\n');
    const r = hash(root);
    const ok = bewerte(r, { hash: r.hash!, verdikt: 'bestanden' });
    expect(ok.gruen).toBe(true);
  });

  it('3) Datei nach Quittung geändert (Hash-Mismatch) → ROT', () => {
    const root = repoMitBasis();
    schreib(root, 'src/lib/tarif/x.ts', 'export const a = 1;\n');
    const r1 = hash(root);
    const pending = { hash: r1.hash!, verdikt: 'bestanden' };
    schreib(root, 'src/lib/tarif/x.ts', 'export const a = 2;\n'); // Byte-Änderung
    const r2 = hash(root);
    expect(r2.hash).not.toBe(r1.hash);
    expect(bewerte(r2, pending).gruen).toBe(false);
  });

  it('4) Nur *.test.ts / Prüfskript geändert → GRÜN (Auto-Ausnahme)', () => {
    const root = repoMitBasis();
    schreib(root, 'src/lib/tarif/x.test.ts', 'it("x", () => {});\n');
    schreib(root, 'scripts/normtext/check-foo.ts', 'export const c = 1;\n');
    const r = hash(root);
    expect(r.hash).toBeNull();
    expect(bewerte(r, null).gruen).toBe(true);
  });

  it('5) Nichts Riskantes geändert → GRÜN', () => {
    const root = repoMitBasis();
    schreib(root, 'src/components/Foo.tsx', 'export const Foo = () => null;\n');
    const r = hash(root);
    expect(r.hash).toBeNull();
    expect(bewerte(r, null).gruen).toBe(true);
  });

  it('6) CI-Env → GRÜN (no-op)', () => {
    const root = repoMitBasis();
    schreib(root, 'src/lib/tarif/x.ts', 'export const a = 1;\n');
    process.env.CI = 'true';
    const r = hash(root);
    expect(r.kontext).toBe(false);
    expect(bewerte(r, null).gruen).toBe(true);
  });
});

// ─── bewerte: Verdikt ≠ bestanden ────────────────────────────────────────────
describe('bewerte', () => {
  it('Verdikt «widerlegt» trotz passendem Hash → ROT', () => {
    const root = repoMitBasis();
    schreib(root, 'src/lib/tarif/x.ts', 'export const a = 1;\n');
    const r = hash(root);
    expect(bewerte(r, { hash: r.hash!, verdikt: 'widerlegt' }).gruen).toBe(false);
  });
});

// ─── Glob-Realität (Panel-Linse 2) ──────────────────────────────────────────
describe('Risiko-/Prüflogik-Prädikate', () => {
  it('Rechnen-Engines: nur die Stichwort-Basenames, keine Über-Triggerung', () => {
    expect(istRisikoPfad('src/lib/verjaehrung.ts')).toBe(true);
    expect(istRisikoPfad('src/lib/streitwert.ts')).toBe(true);
    expect(istRisikoPfad('src/lib/schkgFristen.ts')).toBe(true);
    // Gegenprobe: kein Match für irrelevante top-level src/lib-Dateien
    expect(istRisikoPfad('src/lib/kantone.ts')).toBe(false);
    expect(istRisikoPfad('src/lib/bruch.ts')).toBe(false);
    // Rekursion in Unterordner nicht über die Rechnen-Regel (separat als Präfix)
    expect(istRisikoPfad('src/lib/pdf/frist-helfer.ts')).toBe(false);
  });

  it('Extraktion: verschachtelte public/normtext-Snapshots werden erfasst', () => {
    expect(istRisikoPfad('public/normtext/bund/OR.json')).toBe(true);
    expect(istRisikoPfad('public/normtext/struktur/bund/OR.json')).toBe(true);
    expect(istRisikoPfad('public/normtext/register.json')).toBe(true);
    expect(istRisikoPfad('public/normtext/liesmich.md')).toBe(false); // nur .json
  });

  it('Verzeichnis-Präfixe', () => {
    expect(istRisikoPfad('src/lib/tarif/staffel.ts')).toBe(true);
    expect(istRisikoPfad('src/lib/fristenspiegel/x.ts')).toBe(true);
    expect(istRisikoPfad('src/data/tarif/gerichtskosten.ts')).toBe(true);
    expect(istRisikoPfad('src/lib/vorlagen/arbeitsvertrag.ts')).toBe(true);
    expect(istRisikoPfad('scripts/normtext/pdf-fetch.ts')).toBe(true);
    expect(istRisikoPfad('src/lib/normtext/adapter.ts')).toBe(true);
    // QS-DATA E1: Datenhaltungs-Schicht + DB-Artefakt-Manifest = Risiko-Pfad.
    expect(istRisikoPfad('scripts/datenhaltung/erlass-rows.ts')).toBe(true);
    expect(istRisikoPfad('scripts/normtext-snapshot.ts')).toBe(true);
    expect(istRisikoPfad('daten/normtext.db')).toBe(true);
    expect(istRisikoPfad('daten-manifest.json')).toBe(true);
  });

  it('Prüflogik-Ausnahme sticht das Risiko (Set-Subtraktion)', () => {
    expect(istPruefLogik('src/tests/foo.test.ts')).toBe(true);
    expect(istPruefLogik('scripts/normtext/check-drift.ts')).toBe(true);
    expect(istPruefLogik('scripts/gegenpruefung/kern.ts')).toBe(true);
    expect(istPruefLogik('scripts/gate.sh')).toBe(true);
    // behalten = Risiko UND nicht Prüflogik
    expect(behalten('scripts/normtext/check-drift.ts')).toBe(false); // Risiko, aber Check
    expect(behalten('scripts/normtext/pdf-fetch.ts')).toBe(true); // echter Extraktions-Generator
    expect(behalten('src/lib/tarif/x.test.ts')).toBe(false);
    // QS-DATA: check-*.ts der Datenhaltung = Prüflogik (raus); die Bau-/Projektions-Module bleiben.
    expect(istPruefLogik('scripts/datenhaltung/check-datenhaltung.ts')).toBe(true);
    expect(behalten('scripts/datenhaltung/check-datenhaltung.ts')).toBe(false);
    expect(behalten('scripts/datenhaltung/erlass-rows.ts')).toBe(true);
  });
});

// ─── Regression (Panel-Linse 2, im echten Repo) ──────────────────────────────
describe('Glob-Regressionen im Repo', () => {
  it('(a) Änderung an src/lib/kantone.ts → GRÜN (keine Über-Triggerung)', () => {
    const root = repoMitBasis();
    schreib(root, 'src/lib/kantone.ts', 'export const k = 1;\n');
    expect(hash(root).hash).toBeNull();
  });

  it('(b) verschachteltes public/normtext/bund/*.json ohne Pending → ROT', () => {
    const root = repoMitBasis();
    schreib(root, 'public/normtext/bund/OR.json', '{"a":1}\n');
    const r = hash(root);
    expect(r.hash).not.toBeNull();
    expect(r.dateien).toContain('public/normtext/bund/OR.json');
    expect(bewerte(r, null).gruen).toBe(false);
  });
});

// ─── Kern-Kanten (Panel-Linse 1) ─────────────────────────────────────────────
describe('Kern-Kanten der Diff-Hash-Kanonik', () => {
  it('untracked-Ordner wird durch -uall zu Einzeldateien expandiert', () => {
    const root = repoMitBasis();
    schreib(root, 'public/normtext/neu/one.json', '{"a":1}\n');
    schreib(root, 'public/normtext/neu/two.json', '{"b":2}\n');
    const r = hash(root);
    expect(r.dateien).toContain('public/normtext/neu/one.json');
    expect(r.dateien).toContain('public/normtext/neu/two.json');
  });

  it('Rename zerfällt mit --no-renames in gelöscht + neu (Einzel-Pfade)', () => {
    const root = repoMitBasis();
    schreib(root, 'src/lib/tarif/alt.ts', 'export const a = 1;\n');
    commitAlles(root, 'add alt');
    git(root, 'mv', 'src/lib/tarif/alt.ts', 'src/lib/tarif/neu.ts');
    const r = hash(root);
    expect(r.dateien).toContain('src/lib/tarif/alt.ts'); // Lösch-Marker
    expect(r.dateien).toContain('src/lib/tarif/neu.ts'); // Inhalts-Hash
  });

  it('leere Datei ≠ gelöschte Datei (unterschiedliche Hashes)', () => {
    const rootLeer = neuesRepo();
    schreib(rootLeer, 'src/lib/tarif/x.ts', 'inhalt\n');
    commitAlles(rootLeer);
    schreib(rootLeer, 'src/lib/tarif/x.ts', ''); // jetzt leer, existiert
    const hLeer = hash(rootLeer).hash;

    const rootDel = neuesRepo();
    schreib(rootDel, 'src/lib/tarif/x.ts', 'inhalt\n');
    commitAlles(rootDel);
    rmSync(join(rootDel, 'src/lib/tarif/x.ts')); // gelöscht
    const hDel = hash(rootDel).hash;

    expect(hLeer).not.toBeNull();
    expect(hDel).not.toBeNull();
    expect(hLeer).not.toBe(hDel);
  });

  it('Unicode-/Leerzeichen-Pfad wird roh gebunden', () => {
    const root = repoMitBasis();
    schreib(root, 'src/lib/tarif/mit leer é.ts', 'export const a = 1;\n');
    const r = hash(root);
    expect(r.kontext).toBe(true);
    expect(r.hash).not.toBeNull();
    expect(r.dateien).toContain('src/lib/tarif/mit leer é.ts');
  });

  it('MM bindet die Platte, nicht den Index-Blob', () => {
    // staged 'A', dann unstaged 'B' obendrauf → Platte = 'B'
    const rootMM = neuesRepo();
    schreib(rootMM, 'src/lib/tarif/x.ts', 'v0\n');
    commitAlles(rootMM);
    schreib(rootMM, 'src/lib/tarif/x.ts', 'A\n');
    git(rootMM, 'add', 'src/lib/tarif/x.ts');
    schreib(rootMM, 'src/lib/tarif/x.ts', 'B\n'); // nur Platte
    const hMM = hash(rootMM).hash;

    // Vergleich: dieselbe Platte 'B', aber nur unstaged (kein Index-Divergenz)
    const rootM = neuesRepo();
    schreib(rootM, 'src/lib/tarif/x.ts', 'v0\n');
    commitAlles(rootM);
    schreib(rootM, 'src/lib/tarif/x.ts', 'B\n');
    const hM = hash(rootM).hash;

    expect(hMM).toBe(hM); // Hash folgt der Platte, nicht dem Staging
  });

  it('Sortier-Stabilität: Erscheinungsreihenfolge egal', () => {
    const rootAB = repoMitBasis();
    schreib(rootAB, 'src/lib/tarif/a.ts', 'x\n');
    schreib(rootAB, 'src/lib/tarif/b.ts', 'y\n');
    const hAB = hash(rootAB).hash;

    const rootBA = repoMitBasis();
    schreib(rootBA, 'src/lib/tarif/b.ts', 'y\n');
    schreib(rootBA, 'src/lib/tarif/a.ts', 'x\n');
    const hBA = hash(rootBA).hash;

    expect(hAB).toBe(hBA);
  });

  it('kein HEAD (Repo ohne Commit) → kontext:false (no-op grün)', () => {
    const root = neuesRepo(); // KEIN commit
    schreib(root, 'src/lib/tarif/x.ts', 'export const a = 1;\n');
    const r = hash(root);
    expect(r.kontext).toBe(false);
    expect(bewerte(r, null).gruen).toBe(true);
  });

  it('Staging-neutral: git add nach der Quittung lässt den Hash unverändert', () => {
    const root = repoMitBasis();
    schreib(root, 'src/lib/tarif/x.ts', 'export const a = 1;\n');
    const vorher = hash(root).hash;
    git(root, 'add', 'src/lib/tarif/x.ts'); // nur Staging, kein Byte
    const nachher = hash(root).hash;
    expect(nachher).toBe(vorher);
  });
});
