# Plan-Steuerung «ein Etikett pro Schritt» — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jedem etikettierbaren `ROADMAP.md`-Schritt ein maschinenlesbares `<!-- @meta … -->`-Etikett geben, plus `plan:next` (Resolver), `plan:set` (Setzer) und `check:plan` (Wächter), sodass der Schritt-Zustand widerspruchsfrei + autonom auflösbar wird.

**Architecture:** Reine TS-Module unter `scripts/plan/` (Runner `vite-node`, Projektstandard). Pure Funktionen (parse/resolve/set/check) sind unit-getestet gegen **Fixture-Markdown**; dünne CLI-Wrapper lesen/schreiben die echte `ROADMAP.md`. Erst nach der einmaligen Erst-Befüllung der echten ROADMAP wird `check:plan` in die `check`-Gate-Kette gehängt (sonst Gate sofort rot). Vollständige Begründung + Geltungsbereich: `FAHRPLAN-PLAN-STEUERUNG.md`.

**Tech Stack:** TypeScript, `vite-node` (Scripts), `vitest` (`globals:true`, `environment:node`, Tests in `src/tests/*.test.ts`), Node `fs`.

## Global Constraints

- **§2 Determinismus:** rein, keine Heuristik, **kein `Date.now()` in der Logik** (Tagesbezug nur Anzeige). Gleiche ROADMAP → gleiche Ausgabe.
- **§5 SSoT:** `@meta` ist die einzige Maschinen-Wahrheit; Prosa/Blockquote/Fortschritts-Block sind narrative Historie und werden **nicht** gelesen. Etikett-Grammatik liegt **einmal** in `etikett.ts`.
- **§6 golden byte-gleich:** berührt keinen Produkt-Code (nur `ROADMAP.md`, `scripts/plan/**`, `package.json`, `docs/`, `src/tests/plan-*`) → golden trivial; **Tests bei Refactoring nie aufweichen**.
- **§12 Worktree:** Ausführung in **eigenem Worktree** (anderer Agent aktiv; Task 7 schreibt `ROADMAP.md` stark um). Commits Pathspec-explizit; nach jedem Commit `--stat`-Dateizahl prüfen.
- **§14.5 Trailer:** jeder Commit `Roadmap: QS-PH` + `Gegenpruefung: n/a — reine Prüflogik`.
- **Lint:** neue `.ts` müssen `npm run lint` (eslint) bestehen.
- **Runner-Aufruf:** Scripts immer via `vite-node scripts/plan/<datei>.ts`. Einzeltest: `npx vitest run src/tests/<datei>.test.ts`.
- **`check:plan` bleibt lokal** (in `check`-Kette, die `gate.sh voll` ruft) — CI unverändert.
- **Etikett-Geltungsbereich (Inventar):** `S0`, Schritte `W1·1…W3·14`, Querschnitt `LERNPHASE-AB/QS-GP/QS-PH/SEO-A11Y/QS-PERF`, nested Bündel `W2·6-B{1,2,3}`, `W3·14-Responsive-Audit`, `W3·14-S{1,2}`, `W3·14-a11y`. Referenz-Sektionen (Geparkt/Pflege/Funktions-Katalog/Strang-Detailpunkte/Studierende-Layer/Batch-Deploy/Blockquote) **nicht** etikettiert.

---

## File Structure

- `scripts/plan/etikett.ts` — `Etikett`-Typ, `parseEtikett`, `serializeEtikett`, Status-Menge. Einzige Grammatik-Quelle.
- `scripts/plan/inventar.ts` — `INVENTAR: string[]` (kanonische ID-Liste).
- `scripts/plan/parse.ts` — `parseRoadmap(md)` → `{ einheiten, blockers }` (Sektion-bewusst, `@blockers`-Register).
- `scripts/plan/next.ts` — `resolve(einheiten, blockers)` → Buckets + Lanes; CLI druckt sie.
- `scripts/plan/set.ts` — `setField(md, id, feld, wert)` (toggelt Checkbox bei `status`); CLI schreibt Datei.
- `scripts/plan/check.ts` — `pruefe(md, fahrplanDateien, fileExists)` → `Problem[]`; CLI exit 1 bei Problemen.
- `src/tests/plan-etikett.test.ts`, `plan-parse.test.ts`, `plan-next.test.ts`, `plan-set.test.ts`, `plan-check.test.ts`.
- `package.json` — Scripts `plan:next`, `plan:set`, `check:plan` (+ `check:plan` in die `check`-Kette, **Task 8**).
- `ROADMAP.md` — Erst-Befüllung (**Task 7**).

---

### Task 1: Etikett-Grammatik (`etikett.ts`)

**Files:**
- Create: `scripts/plan/etikett.ts`
- Test: `src/tests/plan-etikett.test.ts`

**Interfaces:**
- Produces:
  - `type Status = 'ready' | 'wip' | 'blocked' | 'done' | 'parked'`
  - `interface Etikett { id: string; status: Status; statusAgent: string | null; of: boolean; blocker: string | null; dep: string[]; kollision: string[]; worktree: boolean; asset26x: boolean; fahrplan: string | null }`
  - `parseEtikett(line: string): Etikett` — wirft `Error` bei malformiert/ungültigem Status.
  - `serializeEtikett(e: Etikett, indent: string): string`
  - `const STATUS_WERTE: readonly Status[]`

- [ ] **Step 1: Write the failing test**

```typescript
// src/tests/plan-etikett.test.ts
import { parseEtikett, serializeEtikett, type Etikett } from '../../scripts/plan/etikett';

const ZEILE =
  '  <!-- @meta id: W2·6 · status: wip(reader-wt) · of: ja · blocker: null · dep: [W1·4] · kollision: [src/lib/norm-index.ts, src/lib/x.ts] · worktree: ja · 26x: nein -->';

describe('parseEtikett', () => {
  it('parst alle Felder inkl. Status-Agent, Liste, null', () => {
    const e = parseEtikett(ZEILE);
    expect(e.id).toBe('W2·6');
    expect(e.status).toBe('wip');
    expect(e.statusAgent).toBe('reader-wt');
    expect(e.of).toBe(true);
    expect(e.blocker).toBeNull();
    expect(e.dep).toEqual(['W1·4']);
    expect(e.kollision).toEqual(['src/lib/norm-index.ts', 'src/lib/x.ts']);
    expect(e.worktree).toBe(true);
    expect(e.asset26x).toBe(false);
  });

  it('leere Liste + gesetzter blocker + 26x ja', () => {
    const e = parseEtikett(
      '<!-- @meta id: W1·4 · status: parked · of: ja · blocker: wbqdyap3x · dep: [] · kollision: [] · worktree: nein · 26x: ja -->',
    );
    expect(e.dep).toEqual([]);
    expect(e.blocker).toBe('wbqdyap3x');
    expect(e.asset26x).toBe(true);
    expect(e.statusAgent).toBeNull();
  });

  it('wirft bei ungültigem Status', () => {
    expect(() => parseEtikett('<!-- @meta id: X · status: fertig · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->')).toThrow();
  });
});

describe('serializeEtikett', () => {
  it('round-trip: parse→serialize→parse ist stabil', () => {
    const e = parseEtikett(ZEILE);
    const wieder = parseEtikett(serializeEtikett(e, '  '));
    expect(wieder).toEqual(e);
  });
  it('Status-Agent wird mit Klammer serialisiert', () => {
    const e = parseEtikett(ZEILE);
    expect(serializeEtikett(e, '  ')).toContain('status: wip(reader-wt)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/plan-etikett.test.ts`
Expected: FAIL (`Cannot find module '../../scripts/plan/etikett'`).

- [ ] **Step 3: Write minimal implementation**

```typescript
// scripts/plan/etikett.ts
export type Status = 'ready' | 'wip' | 'blocked' | 'done' | 'parked';
export const STATUS_WERTE: readonly Status[] = ['ready', 'wip', 'blocked', 'done', 'parked'];

export interface Etikett {
  id: string;
  status: Status;
  statusAgent: string | null;
  of: boolean;
  blocker: string | null;
  dep: string[];
  kollision: string[];
  worktree: boolean;
  asset26x: boolean;
  fahrplan: string | null;
}

function ja(v: string): boolean {
  if (v === 'ja') return true;
  if (v === 'nein') return false;
  throw new Error(`@meta: erwartet ja/nein, bekam "${v}"`);
}
function liste(v: string): string[] {
  const innen = v.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
  return innen === '' ? [] : innen.split(',').map((s) => s.trim());
}
function nullbar(v: string): string | null {
  return v === 'null' ? null : v;
}

export function parseEtikett(line: string): Etikett {
  const m = line.match(/<!--\s*@meta\s+(.*?)\s*-->/);
  if (!m) throw new Error(`Keine @meta-Zeile: ${line}`);
  const feld: Record<string, string> = {};
  for (const teil of m[1].split(' · ')) {
    const i = teil.indexOf(': ');
    if (i < 0) throw new Error(`@meta: Feld ohne ': ' → "${teil}"`);
    feld[teil.slice(0, i).trim()] = teil.slice(i + 2).trim();
  }
  const sm = (feld.status ?? '').match(/^(\w+)(?:\((.*)\))?$/);
  if (!sm) throw new Error(`@meta: Status unlesbar "${feld.status}"`);
  const status = sm[1] as Status;
  if (!STATUS_WERTE.includes(status)) throw new Error(`@meta: ungültiger Status "${status}"`);
  const noetig = ['id', 'status', 'of', 'blocker', 'dep', 'kollision', 'worktree', '26x'];
  for (const k of noetig) if (!(k in feld)) throw new Error(`@meta: Feld "${k}" fehlt`);
  return {
    id: feld.id,
    status,
    statusAgent: sm[2] ?? null,
    of: ja(feld.of),
    blocker: nullbar(feld.blocker),
    dep: liste(feld.dep),
    kollision: liste(feld.kollision),
    worktree: ja(feld.worktree),
    asset26x: ja(feld['26x']),
    fahrplan: 'fahrplan' in feld ? nullbar(feld.fahrplan) : null,
  };
}

export function serializeEtikett(e: Etikett, indent: string): string {
  const st = e.statusAgent ? `${e.status}(${e.statusAgent})` : e.status;
  const teile = [
    `id: ${e.id}`,
    `status: ${st}`,
    `of: ${e.of ? 'ja' : 'nein'}`,
    `blocker: ${e.blocker ?? 'null'}`,
    `dep: [${e.dep.join(', ')}]`,
    `kollision: [${e.kollision.join(', ')}]`,
    `worktree: ${e.worktree ? 'ja' : 'nein'}`,
    `26x: ${e.asset26x ? 'ja' : 'nein'}`,
  ];
  if (e.fahrplan) teile.push(`fahrplan: ${e.fahrplan}`);
  return `${indent}<!-- @meta ${teile.join(' · ')} -->`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/plan-etikett.test.ts`
Expected: PASS (3 + 2 Tests grün).

- [ ] **Step 5: Commit**

```bash
git add scripts/plan/etikett.ts src/tests/plan-etikett.test.ts
git commit -m "plan-steuerung: Etikett-Grammatik (parse/serialize)

Roadmap: QS-PH
Gegenpruefung: n/a — reine Prüflogik

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Inventar + ROADMAP-Leser (`inventar.ts`, `parse.ts`)

**Files:**
- Create: `scripts/plan/inventar.ts`, `scripts/plan/parse.ts`
- Test: `src/tests/plan-parse.test.ts`

**Interfaces:**
- Consumes: `parseEtikett`, `Etikett` (Task 1).
- Produces:
  - `const INVENTAR: readonly string[]`
  - `type Checkbox = '[ ]' | '[x]' | '[~]' | null`
  - `interface Einheit { id: string; etikett: Etikett; checkbox: Checkbox; sektion: string }`
  - `function parseRoadmap(md: string): { einheiten: Einheit[]; blockers: Record<string, string> }`

- [ ] **Step 1: Write the failing test**

```typescript
// src/tests/plan-parse.test.ts
import { parseRoadmap } from '../../scripts/plan/parse';

const FIXTURE = `# Plan

## Die geordnete Abarbeitung

<!-- @blockers
wbqdyap3x: Prozesskosten I2 — Recherche offen
§4-lizenz: Live-Rechtsprechung — CORS unbestätigt
-->

- [x] **1 · Begründungs-Absatz** *(BEGRUENDUNGS-ABSATZ)*
  <!-- @meta id: W1·1 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  Prosa hier.
- [ ] **6 · Konsultieren** *(amtlich)*
  <!-- @meta id: W2·6 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/norm-index.ts] · worktree: ja · 26x: nein -->

## Querschnitt-Band

- **Performance** *(QS-PERF)*
  <!-- @meta id: QS-PERF · status: wip(perf-wt) · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->

## Geparkt

- **Markt-Themen** — kein Etikett hier.
`;

describe('parseRoadmap', () => {
  it('liest Einheiten mit Checkbox + Sektion', () => {
    const { einheiten } = parseRoadmap(FIXTURE);
    const ids = einheiten.map((e) => e.id);
    expect(ids).toEqual(['W1·1', 'W2·6', 'QS-PERF']);
    const w11 = einheiten.find((e) => e.id === 'W1·1')!;
    expect(w11.checkbox).toBe('[x]');
    expect(w11.sektion).toBe('Die geordnete Abarbeitung');
    const qs = einheiten.find((e) => e.id === 'QS-PERF')!;
    expect(qs.checkbox).toBeNull(); // Querschnitt-Bullet ohne Checkbox
    expect(qs.etikett.statusAgent).toBe('perf-wt');
  });

  it('liest das @blockers-Register', () => {
    const { blockers } = parseRoadmap(FIXTURE);
    expect(Object.keys(blockers)).toEqual(['wbqdyap3x', '§4-lizenz']);
    expect(blockers['wbqdyap3x']).toContain('Recherche offen');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/plan-parse.test.ts`
Expected: FAIL (`Cannot find module '../../scripts/plan/parse'`).

- [ ] **Step 3: Write minimal implementation**

```typescript
// scripts/plan/inventar.ts
// Kanonische ID-Liste der etikettierbaren Einheiten (Geltungsbereich, FAHRPLAN-PLAN-STEUERUNG.md).
export const INVENTAR: readonly string[] = [
  'S0',
  'W1·1', 'W1·2', 'W1·3', 'W1·4',
  'W2·5', 'W2·5b', 'W2·6', 'W2·7', 'W2·8', 'W2·9',
  'W3·10', 'W3·11', 'W3·12', 'W3·13', 'W3·14',
  'LERNPHASE-AB', 'QS-GP', 'QS-PH', 'SEO-A11Y', 'QS-PERF',
  'W2·6-B1', 'W2·6-B2', 'W2·6-B3',
  'W3·14-Responsive-Audit', 'W3·14-S1', 'W3·14-S2', 'W3·14-a11y',
];
```

```typescript
// scripts/plan/parse.ts
import { parseEtikett, type Etikett } from './etikett';

export type Checkbox = '[ ]' | '[x]' | '[~]' | null;
export interface Einheit {
  id: string;
  etikett: Etikett;
  checkbox: Checkbox;
  sektion: string;
}

function checkboxAus(zeile: string): Checkbox {
  const m = zeile.match(/^\s*-\s*\[([ x~])\]/);
  return m ? (`[${m[1]}]` as Checkbox) : null;
}

export function parseRoadmap(md: string): { einheiten: Einheit[]; blockers: Record<string, string> } {
  const zeilen = md.split('\n');
  const einheiten: Einheit[] = [];
  const blockers: Record<string, string> = {};
  let sektion = '';
  let imBlockers = false;

  for (let i = 0; i < zeilen.length; i++) {
    const z = zeilen[i];
    if (z.startsWith('## ')) {
      // Sektion = Überschriftstext ohne Marker/Emoji und ohne Tail (— … / *(…)*)
      sektion = z.replace(/^##+\s+/, '').replace(/^[⚡🚀▶■\s]+/, '').replace(/\s+—.*$/, '').replace(/\s+\*.*$/, '').trim();
    }
    if (z.trim().startsWith('<!-- @blockers')) { imBlockers = true; continue; }
    if (imBlockers) {
      if (z.trim().startsWith('-->')) { imBlockers = false; continue; }
      const bm = z.match(/^\s*([^:]+):\s*(.*)$/);
      if (bm) blockers[bm[1].trim()] = bm[2].trim();
      continue;
    }
    if (z.includes('<!-- @meta')) {
      const etikett = parseEtikett(z);
      // Checkbox aus der nächsten nicht-leeren Zeile DARÜBER
      let cb: Checkbox = null;
      for (let j = i - 1; j >= 0; j--) {
        if (zeilen[j].trim() === '') continue;
        cb = checkboxAus(zeilen[j]);
        break;
      }
      einheiten.push({ id: etikett.id, etikett, checkbox: cb, sektion });
    }
    void h;
  }
  return { einheiten, blockers };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/plan-parse.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/plan/inventar.ts scripts/plan/parse.ts src/tests/plan-parse.test.ts
git commit -m "plan-steuerung: Inventar + ROADMAP-Leser (@meta + @blockers)

Roadmap: QS-PH
Gegenpruefung: n/a — reine Prüflogik

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Resolver (`next.ts`)

**Files:**
- Create: `scripts/plan/next.ts`
- Test: `src/tests/plan-next.test.ts`

**Interfaces:**
- Consumes: `Einheit` (Task 2).
- Produces:
  - `interface Buckets { readyNow: string[]; lanes: string[][]; wartetDep: { id: string; offen: string[] }[]; wartetFachzeit: string[]; blockiert: { id: string; blocker: string }[]; geparkt: string[]; slot26xBelegtVon: string | null }`
  - `function resolve(einheiten: Einheit[]): Buckets`

- [ ] **Step 1: Write the failing test**

```typescript
// src/tests/plan-next.test.ts
import { resolve } from '../../scripts/plan/next';
import type { Einheit } from '../../scripts/plan/parse';

function einheit(id: string, p: Partial<Einheit['etikett']> = {}): Einheit {
  return {
    id, checkbox: null, sektion: 'Die geordnete Abarbeitung',
    etikett: { id, status: 'ready', statusAgent: null, of: true, blocker: null, dep: [], kollision: [], worktree: false, asset26x: false, fahrplan: null, ...p },
  };
}

describe('resolve', () => {
  it('ready-now nur bei status=ready, of=ja, kein blocker, deps done', () => {
    const b = resolve([
      einheit('A'),
      einheit('B', { status: 'blocked', blocker: 'wbqdyap3x' }),
      einheit('C', { of: false }),
      einheit('D', { status: 'parked' }),
      einheit('E', { dep: ['Z'] }),
    ]);
    expect(b.readyNow).toContain('A');
    expect(b.blockiert.map((x) => x.id)).toEqual(['B']);
    expect(b.wartetFachzeit).toEqual(['C']);
    expect(b.geparkt).toEqual(['D']);
    expect(b.wartetDep).toEqual([{ id: 'E', offen: ['Z'] }]);
  });

  it('dep erfüllt, wenn Abhängigkeit done', () => {
    const b = resolve([einheit('Z', { status: 'done' }), einheit('E', { dep: ['Z'] })]);
    expect(b.readyNow).toContain('E');
  });

  it('Lanes: disjunkte kollision parallel, deterministisch lexikografisch', () => {
    const b = resolve([
      einheit('A', { kollision: ['a.ts'] }),
      einheit('B', { kollision: ['b.ts'] }),
      einheit('C', { kollision: ['a.ts'] }),
    ]);
    // A+B disjunkt → eine Lane; C kollidiert mit A → eigene Lane
    expect(b.lanes).toEqual([['A', 'B'], ['C']]);
  });

  it('26x: ein wip belegt den Slot, zweites 26x nicht ready-now', () => {
    const b = resolve([
      einheit('P', { status: 'wip', asset26x: true }),
      einheit('Q', { asset26x: true }),
    ]);
    expect(b.slot26xBelegtVon).toBe('P');
    expect(b.readyNow).not.toContain('Q');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/plan-next.test.ts`
Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Write minimal implementation**

```typescript
// scripts/plan/next.ts
import { readFileSync } from 'node:fs';
import { parseRoadmap, type Einheit } from './parse';

export interface Buckets {
  readyNow: string[];
  lanes: string[][];
  wartetDep: { id: string; offen: string[] }[];
  wartetFachzeit: string[];
  blockiert: { id: string; blocker: string }[];
  geparkt: string[];
  slot26xBelegtVon: string | null;
}

export function resolve(einheiten: Einheit[]): Buckets {
  const sortiert = [...einheiten].sort((a, b) => a.id.localeCompare(b.id));
  const done = new Set(sortiert.filter((e) => e.etikett.status === 'done').map((e) => e.id));
  const slot = sortiert.find((e) => e.etikett.asset26x && e.etikett.status === 'wip');
  const slot26xBelegtVon = slot ? slot.id : null;

  const readyNow: string[] = [];
  const wartetDep: { id: string; offen: string[] }[] = [];
  const wartetFachzeit: string[] = [];
  const blockiert: { id: string; blocker: string }[] = [];
  const geparkt: string[] = [];

  for (const e of sortiert) {
    const t = e.etikett;
    if (t.status === 'done' || t.status === 'wip') continue;
    if (t.status === 'parked') { geparkt.push(e.id); continue; }
    if (t.status === 'blocked') { blockiert.push({ id: e.id, blocker: t.blocker ?? '?' }); continue; }
    // status === 'ready'
    if (!t.of) { wartetFachzeit.push(e.id); continue; }
    const offen = t.dep.filter((d) => !done.has(d));
    if (offen.length) { wartetDep.push({ id: e.id, offen }); continue; }
    if (t.asset26x && slot26xBelegtVon) continue; // Slot belegt → nicht ready-now
    readyNow.push(e.id);
  }

  // Lanes: greedy lexikografisch, disjunkte kollision-Mengen
  const kollOf = new Map(sortiert.map((e) => [e.id, new Set(e.etikett.kollision)]));
  const lanes: string[][] = [];
  for (const id of readyNow) {
    const meins = kollOf.get(id)!;
    let platziert = false;
    for (const lane of lanes) {
      const ueberlappt = lane.some((other) => {
        const o = kollOf.get(other)!;
        for (const k of meins) if (o.has(k)) return true;
        return false;
      });
      if (!ueberlappt) { lane.push(id); platziert = true; break; }
    }
    if (!platziert) lanes.push([id]);
  }
  return { readyNow, lanes, wartetDep, wartetFachzeit, blockiert, geparkt, slot26xBelegtVon };
}

// CLI
if (process.argv[1] && process.argv[1].endsWith('next.ts')) {
  const { einheiten } = parseRoadmap(readFileSync('ROADMAP.md', 'utf8'));
  const b = resolve(einheiten);
  const z = (s: string) => console.log(s);
  z(`▶ JETZT baubar (ready-now): ${b.readyNow.join(', ') || '—'}`);
  z(`  Parallel-Lanes: ${b.lanes.map((l) => `[${l.join(' + ')}]`).join('  ') || '—'}`);
  if (b.wartetDep.length) z(`⏳ wartet auf dep: ${b.wartetDep.map((x) => `${x.id}→${x.offen.join(',')}`).join(' · ')}`);
  if (b.wartetFachzeit.length) z(`👤 wartet auf Davids Fachzeit: ${b.wartetFachzeit.join(', ')}`);
  if (b.blockiert.length) z(`⛔ blockiert: ${b.blockiert.map((x) => `${x.id}(${x.blocker})`).join(', ')}`);
  if (b.geparkt.length) z(`🅿️  geparkt: ${b.geparkt.join(', ')}`);
  if (b.slot26xBelegtVon) z(`📦 26×-Slot belegt von: ${b.slot26xBelegtVon}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/plan-next.test.ts`
Expected: PASS (4 Tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/plan/next.ts src/tests/plan-next.test.ts
git commit -m "plan-steuerung: next-Resolver (Buckets + deterministische Lanes)

Roadmap: QS-PH
Gegenpruefung: n/a — reine Prüflogik

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Setzer (`set.ts`)

**Files:**
- Create: `scripts/plan/set.ts`
- Test: `src/tests/plan-set.test.ts`

**Interfaces:**
- Consumes: `parseEtikett`, `serializeEtikett` (Task 1).
- Produces: `function setField(md: string, id: string, feld: string, wert: string): string`

**Verhalten:** Findet die `@meta`-Zeile mit `id`, ändert `feld` auf `wert`, serialisiert neu (Indent bleibt). Ändert `feld === 'status'`, toggelt zusätzlich die Checkbox der Einheit darüber (`done→[x]` · `wip→[~]` · sonst `[ ]`) — nur wenn dort eine Checkbox steht.

- [ ] **Step 1: Write the failing test**

```typescript
// src/tests/plan-set.test.ts
import { setField } from '../../scripts/plan/set';

const MD = `- [ ] **6 · Konsultieren**
  <!-- @meta id: W2·6 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  Prosa.
`;

describe('setField', () => {
  it('setzt status=done und toggelt Checkbox auf [x]', () => {
    const out = setField(MD, 'W2·6', 'status', 'done');
    expect(out).toContain('status: done');
    expect(out).toContain('- [x] **6 · Konsultieren**');
  });

  it('setzt status=wip und toggelt Checkbox auf [~]', () => {
    const out = setField(MD, 'W2·6', 'status', 'wip(meine-wt)');
    expect(out).toContain('status: wip(meine-wt)');
    expect(out).toContain('- [~] **6 · Konsultieren**');
  });

  it('ändert ein Nicht-Status-Feld ohne Checkbox-Toggle', () => {
    const out = setField(MD, 'W2·6', 'blocker', 'wbqdyap3x');
    expect(out).toContain('blocker: wbqdyap3x');
    expect(out).toContain('- [ ] **6 · Konsultieren**');
  });

  it('wirft, wenn id nicht existiert', () => {
    expect(() => setField(MD, 'W9·9', 'status', 'done')).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/plan-set.test.ts`
Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Write minimal implementation**

```typescript
// scripts/plan/set.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { parseEtikett, serializeEtikett } from './etikett';

const FELDER = new Set(['id', 'status', 'of', 'blocker', 'dep', 'kollision', 'worktree', '26x', 'fahrplan']);
const CHECKBOX_FUER: Record<string, string> = { done: '[x]', wip: '[~]' };

export function setField(md: string, id: string, feld: string, wert: string): string {
  if (!FELDER.has(feld)) throw new Error(`Unbekanntes Feld "${feld}"`);
  const zeilen = md.split('\n');
  const idx = zeilen.findIndex((z) => z.includes('<!-- @meta') && parseEtikett(z).id === id);
  if (idx < 0) throw new Error(`Schritt-id "${id}" nicht gefunden`);

  // Zeile normalisieren (kanonische Feld-Reihenfolge), dann das eine Feld ersetzen.
  const indent = zeilen[idx].match(/^(\s*)/)![1];
  const normalisiert = serializeEtikett(parseEtikett(zeilen[idx]), indent);
  const ersetzt = normalisiert.replace(new RegExp(`(\\b${feld}): [^·]*?( ·| -->)`), `$1: ${wert}$2`);
  const neu = parseEtikett(ersetzt); // validiert den neuen Wert (wirft bei ungültig)
  zeilen[idx] = serializeEtikett(neu, indent);

  if (feld === 'status') {
    const cb = CHECKBOX_FUER[neu.status] ?? '[ ]';
    for (let j = idx - 1; j >= 0; j--) {
      if (zeilen[j].trim() === '') continue;
      if (/^\s*-\s*\[[ x~]\]/.test(zeilen[j])) zeilen[j] = zeilen[j].replace(/(-\s*)\[[ x~]\]/, `$1${cb}`);
      break;
    }
  }
  return zeilen.join('\n');
}

// CLI: vite-node scripts/plan/set.ts -- <id> <feld>=<wert>
if (process.argv[1] && process.argv[1].endsWith('set.ts')) {
  const arg = process.argv.slice(2);
  const id = arg[0];
  const [feld, wert] = (arg[1] ?? '').split('=');
  if (!id || !feld || wert === undefined) {
    console.error('Aufruf: npm run plan:set -- <id> <feld>=<wert>');
    process.exit(2);
  }
  const out = setField(readFileSync('ROADMAP.md', 'utf8'), id, feld, wert);
  writeFileSync('ROADMAP.md', out);
  console.log(`gesetzt: ${id} ${feld}=${wert}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/plan-set.test.ts`
Expected: PASS (4 Tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/plan/set.ts src/tests/plan-set.test.ts
git commit -m "plan-steuerung: plan:set-Setzer (Feld + gekoppelte Checkbox)

Roadmap: QS-PH
Gegenpruefung: n/a — reine Prüflogik

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Wächter (`check.ts`)

**Files:**
- Create: `scripts/plan/check.ts`
- Test: `src/tests/plan-check.test.ts`

**Interfaces:**
- Consumes: `parseRoadmap`, `Einheit` (Task 2); `INVENTAR` (Task 2); `STATUS_WERTE` (Task 1).
- Produces:
  - `interface Problem { id: string | null; meldung: string }`
  - `function pruefe(md: string, fahrplanDateien: string[], fileExists: (p: string) => boolean, inventar?: readonly string[]): Problem[]`

**Prüfungen:** (1) jede Inventar-ID hat genau ein `@meta`; kein verwaistes `@meta`. (2) Checkbox-Kopplung nur bei vorhandener Checkbox (`[x]`↔done, `[~]`↔wip, `[ ]`↔ready/blocked/parked). (3) `blocked`/`parked` → blocker im Register; `ready` → blocker null. (4) dep-IDs im Inventar; dep-Graph azyklisch. (5) nicht zwei `26x` auf `wip`. (6) jeder `kollision`-Pfad existiert (`fileExists`). (7) jede `FAHRPLAN-*.md` aus `fahrplanDateien` ist im `md` verlinkt.

- [ ] **Step 1: Write the failing test**

```typescript
// src/tests/plan-check.test.ts
import { pruefe } from '../../scripts/plan/check';

const OK = `## Die geordnete Abarbeitung
<!-- @blockers
wbqdyap3x: I2 offen
-->
- [x] **1 · A**
  <!-- @meta id: W1·1 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
- [ ] **4 · D**
  <!-- @meta id: W1·4 · status: blocked · of: ja · blocker: wbqdyap3x · dep: [] · kollision: [] · worktree: nein · 26x: nein -->

Siehe FAHRPLAN-PLAN-STEUERUNG.md.
`;
const inv = ['W1·1', 'W1·4'];
const existiert = () => true;

describe('pruefe', () => {
  it('sauberer Plan → keine Probleme', () => {
    expect(pruefe(OK, ['FAHRPLAN-PLAN-STEUERUNG.md'], existiert, inv)).toEqual([]);
  });

  it('done mit [ ]-Checkbox → Problem', () => {
    const bad = OK.replace('- [x] **1 · A**', '- [ ] **1 · A**');
    expect(pruefe(bad, ['FAHRPLAN-PLAN-STEUERUNG.md'], existiert, inv).some((p) => p.id === 'W1·1')).toBe(true);
  });

  it('blocker nicht im Register → Problem', () => {
    const bad = OK.replace('blocker: wbqdyap3x', 'blocker: xxxxx');
    expect(pruefe(bad, ['FAHRPLAN-PLAN-STEUERUNG.md'], existiert, inv).some((p) => p.id === 'W1·4')).toBe(true);
  });

  it('Inventar-ID ohne @meta → Problem', () => {
    expect(pruefe(OK, ['FAHRPLAN-PLAN-STEUERUNG.md'], existiert, ['W1·1', 'W1·4', 'W2·6']).some((p) => p.id === 'W2·6')).toBe(true);
  });

  it('nicht verlinkte FAHRPLAN-Datei → Problem', () => {
    expect(pruefe(OK, ['FAHRPLAN-PLAN-STEUERUNG.md', 'FAHRPLAN-GEISTER.md'], existiert, inv).some((p) => /GEISTER/.test(p.meldung))).toBe(true);
  });

  it('kollision-Pfad existiert nicht → Problem', () => {
    const bad = OK.replace('kollision: [] · worktree: nein · 26x: nein -->\n- [ ] **4 · D**', 'kollision: [src/fehlt.ts] · worktree: nein · 26x: nein -->\n- [ ] **4 · D**');
    expect(pruefe(bad, ['FAHRPLAN-PLAN-STEUERUNG.md'], (p) => p !== 'src/fehlt.ts', inv).some((p) => /fehlt\.ts/.test(p.meldung))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/plan-check.test.ts`
Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Write minimal implementation**

```typescript
// scripts/plan/check.ts
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { parseRoadmap, type Einheit } from './parse';
import { INVENTAR } from './inventar';

export interface Problem { id: string | null; meldung: string }

const CHECKBOX_STATUS: Record<string, string[]> = {
  '[x]': ['done'],
  '[~]': ['wip'],
  '[ ]': ['ready', 'blocked', 'parked'],
};

function zyklus(einheiten: Einheit[]): string | null {
  const dep = new Map(einheiten.map((e) => [e.id, e.etikett.dep]));
  const farbe = new Map<string, number>(); // 0=weiss 1=grau 2=schwarz
  let fund: string | null = null;
  const dfs = (id: string) => {
    if (fund) return;
    farbe.set(id, 1);
    for (const d of dep.get(id) ?? []) {
      const f = farbe.get(d) ?? 0;
      if (f === 1) { fund = d; return; }
      if (f === 0 && dep.has(d)) dfs(d);
    }
    farbe.set(id, 2);
  };
  for (const e of einheiten) if ((farbe.get(e.id) ?? 0) === 0) dfs(e.id);
  return fund;
}

export function pruefe(
  md: string,
  fahrplanDateien: string[],
  fileExists: (p: string) => boolean,
  inventar: readonly string[] = INVENTAR,
): Problem[] {
  const probleme: Problem[] = [];
  const { einheiten, blockers } = parseRoadmap(md);
  const vorhanden = new Set(einheiten.map((e) => e.id));

  // (1) Inventar-Abdeckung + keine Doppel
  for (const id of inventar) if (!vorhanden.has(id)) probleme.push({ id, meldung: `Inventar-ID "${id}" hat kein @meta` });
  const zaehl = new Map<string, number>();
  for (const e of einheiten) zaehl.set(e.id, (zaehl.get(e.id) ?? 0) + 1);
  for (const [id, n] of zaehl) if (n > 1) probleme.push({ id, meldung: `id "${id}" mehrfach etikettiert` });

  for (const e of einheiten) {
    const t = e.etikett;
    // (2) Checkbox-Kopplung nur bei vorhandener Checkbox
    if (e.checkbox && !CHECKBOX_STATUS[e.checkbox].includes(t.status)) {
      probleme.push({ id: e.id, meldung: `Checkbox ${e.checkbox} passt nicht zu status ${t.status}` });
    }
    // (3) blocker-Konsistenz
    if ((t.status === 'blocked' || t.status === 'parked')) {
      if (!t.blocker) probleme.push({ id: e.id, meldung: `status ${t.status} ohne blocker` });
      else if (!(t.blocker in blockers)) probleme.push({ id: e.id, meldung: `blocker "${t.blocker}" nicht im @blockers-Register` });
    }
    if (t.status === 'ready' && t.blocker) probleme.push({ id: e.id, meldung: `status ready aber blocker gesetzt` });
    // (4) dep-IDs existieren
    for (const d of t.dep) if (!vorhanden.has(d)) probleme.push({ id: e.id, meldung: `dep "${d}" existiert nicht` });
    // (6) kollision-Pfade existieren (Globs: nur einfache Existenz des Pfads bzw. Verzeichnis-Präfix)
    for (const k of t.kollision) {
      const basis = k.replace(/[*?].*$/, '');
      if (!fileExists(basis)) probleme.push({ id: e.id, meldung: `kollision-Pfad "${k}" existiert nicht` });
    }
  }
  // (4b) Azyklie
  const z = zyklus(einheiten);
  if (z) probleme.push({ id: z, meldung: `dep-Graph hat einen Zyklus bei "${z}"` });
  // (5) max. ein 26x auf wip
  const wip26 = einheiten.filter((e) => e.etikett.asset26x && e.etikett.status === 'wip');
  if (wip26.length > 1) probleme.push({ id: null, meldung: `zwei 26×-Assets gleichzeitig wip: ${wip26.map((e) => e.id).join(', ')}` });
  // (7) FAHRPLAN-Link-Check (eingegliedertes QS-PH)
  for (const f of fahrplanDateien) if (!md.includes(f)) probleme.push({ id: null, meldung: `${f} ist nicht aus ROADMAP.md verlinkt` });

  return probleme;
}

// CLI
if (process.argv[1] && process.argv[1].endsWith('check.ts')) {
  const md = readFileSync('ROADMAP.md', 'utf8');
  const fahrplan = readdirSync('.').filter((f) => /^FAHRPLAN-.*\.md$/.test(f));
  const probleme = pruefe(md, fahrplan, (p) => existsSync(p));
  if (probleme.length) {
    console.error('check:plan ROT:');
    for (const p of probleme) console.error(`  - ${p.id ?? '(global)'}: ${p.meldung}`);
    process.exit(1);
  }
  console.log('check:plan grün.');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/plan-check.test.ts`
Expected: PASS (6 Tests — negativ→rot, positiv→grün abgedeckt).

- [ ] **Step 5: Commit**

```bash
git add scripts/plan/check.ts src/tests/plan-check.test.ts
git commit -m "plan-steuerung: check:plan-Wächter (Schema/Kopplung/Blocker/Azyklie/26x/kollision/FAHRPLAN-Link)

Roadmap: QS-PH
Gegenpruefung: n/a — reine Prüflogik

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: npm-Scripts verdrahten (ohne Gate-Kette)

**Files:**
- Modify: `package.json` (scripts-Block)

**Interfaces:**
- Consumes: `next.ts`, `set.ts`, `check.ts` (Tasks 3–5).

- [ ] **Step 1: Scripts ergänzen**

In `package.json`, im `"scripts"`-Objekt diese drei Einträge hinzufügen (Komma-Syntax beachten):

```json
    "plan:next": "vite-node scripts/plan/next.ts",
    "plan:set": "vite-node scripts/plan/set.ts",
    "check:plan": "vite-node scripts/plan/check.ts",
```

- [ ] **Step 2: `plan:next` lädt ohne Crash (gegen aktuelle, noch un-etikettierte ROADMAP)**

Run: `npm run plan:next`
Expected: läuft ohne Exception (Buckets ggf. leer/`—`, weil ROADMAP noch keine `@meta` hat). **`check:plan` hier noch NICHT laufen lassen** — die echte ROADMAP ist erst nach Task 7 etikettiert.

- [ ] **Step 3: tsc + lint grün**

Run: `npx tsc -b` und `npm run lint`
Expected: PASS (keine Typ-/Lint-Fehler in `scripts/plan/**`).

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "plan-steuerung: plan:next/plan:set/check:plan als npm-Scripts (noch nicht im Gate)

Roadmap: QS-PH
Gegenpruefung: n/a — reine Prüflogik

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Erst-Befüllung der echten `ROADMAP.md`

**Files:**
- Modify: `ROADMAP.md`

**Interfaces:**
- Consumes: `plan:set` (Task 4), `plan:next` (Task 3), `check:plan` (Task 5), `INVENTAR` (Task 2).

> **Wichtig:** Dieser Task editiert die Steuerungsdatei stark. Ausführung im **eigenen Worktree** (Global Constraints §12). Werte werden aus der bestehenden Prosa + dem Fortschritts-Block + den Memories abgeleitet; **Schritt 4 ist ein Steuer-Entscheid** (`blocked` vs. `parked`) — die im ROADMAP dokumentierte Park-Absicht übernehmen, im Zweifel David bestätigen lassen, **nicht raten** (§7).

- [ ] **Step 1: `@blockers`-Register einfügen**

Unter der Überschrift «Verifikations-Blockaden» (ca. ROADMAP Z.79) diesen Block ergänzen:

```
<!-- @blockers
wbqdyap3x: Prozesskosten I2 — Schlichtungs-/Reduktionsfaktoren (Recherche offen)
§4-lizenz: Live-Rechtsprechung — CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits unbestätigt
-->
```

- [ ] **Step 2: Jede Inventar-Einheit etikettieren**

Für jede ID aus `scripts/plan/inventar.ts` eine `@meta`-Zeile unter den zugehörigen Bullet/die Überschrift setzen. Ableitung der Werte aus dem Fortschritts-Block (Z.178–186) + Prosa. Kern-Belegung (Rest analog):

- `S0` → `status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein`
- `W1·1` → `status: done` (LIVE), Checkbox auf `[x]`
- `W1·2`, `W1·3` → `status: done`
- `W1·4` → **Steuer-Entscheid** (Park-Absicht dokumentiert): `status: parked · blocker: wbqdyap3x · 26x: ja` (parked gibt den 26×-Slot frei); falls David `blocked` bevorzugt, entsprechend.
- `W2·5` → `status: wip`, Checkbox `[~]`
- `W2·5b` → `status: wip(reader-wt)` (anderer Agent), `kollision: [src/pages/gesetz-leser/inhalt.tsx, src/pages/gesetz-leser/parts.tsx]`, `worktree: ja`
- `W2·6` … `W3·14`, Querschnitt, Bündel → `status: ready`/`blocked`/`wip`/`parked` gemäss realem Stand; `QS-PERF` → `status: wip` (CLS-Fix gebaut, Rest offen); `QS-PH` → `status: wip` (dieser Bau).

Setzen entweder von Hand (Etikett-Zeile einfügen) oder per `npm run plan:set -- <id> status=<wert>` nach dem ersten manuellen Einfügen einer Skelett-Zeile.

- [ ] **Step 3: Veraltete Checkboxen + Fortschritts-Block auflösen**

- Checkbox von Schritt 1 auf `[x]`, von Schritt 4 auf `[ ]` (parked), Schritt 5 bleibt `[~]`.
- Den Prosa-Block «Fortschritt 28.6.» (Z.178–186) **entfernen** (seine Information lebt jetzt in den Etiketten). Blockquote `> ■ Auftrags-Eingang 30.6.` + Schritt-Prosa **bleiben** (narrative Historie).

- [ ] **Step 4: `QS-PH`-Eintrag verlinken + Header-Datum**

Im Querschnitt-Band-Eintrag `QS-PH` einen Satz + Link ergänzen: «Detail + Etikett-System: `FAHRPLAN-PLAN-STEUERUNG.md`; Tor `check:plan` (Etikett-Konsistenz + FAHRPLAN-Verlinkung).» Header `> **Stand …**` auf aktuelles Datum.

- [ ] **Step 5: Sanity über den Resolver**

Run: `npm run plan:next`
Expected: `W1·1` taucht NICHT in ready-now auf (done); `W1·4` erscheint unter `geparkt` (bzw. `blockiert`); `26×-Slot belegt`-Zeile nur falls ein 26x auf `wip`; mind. ein bekannter freier [OF]-Rest in `ready-now`.

- [ ] **Step 6: Wächter grün**

Run: `npm run check:plan`
Expected: `check:plan grün.` (kein verwaistes/fehlendes `@meta`, alle Blocker im Register, FAHRPLAN-PLAN-STEUERUNG.md verlinkt). Bei Rot: gemeldete Punkte fixen, erneut laufen.

- [ ] **Step 7: Commit**

```bash
git add ROADMAP.md
git commit -m "plan-steuerung: ROADMAP-Erst-Befüllung (@meta je Schritt, @blockers, Checkboxen==Realität)

Löst Fortschritts-Block (§5-Doppelwahrheit) in Etiketten auf; W1·1=done, W1·4=parked/blocked.
Roadmap: QS-PH
Gegenpruefung: n/a — reine Prüflogik

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: `check:plan` ins Gate + Voll-Gate + STRUKTUR-Karte

**Files:**
- Modify: `package.json` (`check`-Kette), `STRUKTUR.md`

- [ ] **Step 1: `check:plan` an die `check`-Kette hängen**

In `package.json` den `"check"`-Wert um ` && npm run check:plan` am Ende ergänzen. (Erst JETZT — vorher wäre das Gate rot, weil die echte ROADMAP unetikettiert war.)

- [ ] **Step 2: Voll-Gate grün**

Run: `npm run gate`
Expected: `GATE GRÜN.` (tsc · vitest inkl. aller `plan-*`-Tests · golden:vergleich byte-gleich · lint · check inkl. `check:plan`).
Bei Rot: volle Ausgabe des roten Gates lesen (gate.sh zeigt sie), Ursache fixen, erneut.

- [ ] **Step 3: STRUKTUR.md-Session-Karte nachziehen**

Oben in `STRUKTUR.md` eine ehrliche Session-Karte ergänzen (CLAUDE.md Kopf-Pflicht): Plan-Steuerung gebaut (`scripts/plan/**`, `plan:next`/`plan:set`/`check:plan`, ROADMAP etikettiert), `Roadmap: QS-PH`, golden byte-gleich, nicht deployt.

- [ ] **Step 4: Commit**

```bash
git add package.json STRUKTUR.md
git commit -m "plan-steuerung: check:plan in die check-Gate-Kette + STRUKTUR-Karte

Roadmap: QS-PH
Gegenpruefung: n/a — reine Prüflogik

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Abschluss

- Kein Push/Deploy (§9 — Davids frisches Ja nötig; sammeln fürs Batch-Deploy-Fenster).
- Worktree per `superpowers:finishing-a-development-branch` zurückführen (Merge/PR nach Davids Auto-Merge-Regel bei grüner CI).
- Ergebnis: `npm run plan:next` ist ab jetzt die deterministische Antwort auf «was darf ich bauen?», und `check:plan` hält Plan==Realität.
