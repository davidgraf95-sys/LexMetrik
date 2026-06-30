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

describe('pruefe — Lücken-Abdeckung (Task-5-Review)', () => {
  const REG = ['<!-- @blockers', 'b1: grund', '-->'].join('\n');
  const plan = (units: string) =>
    `## Die geordnete Abarbeitung\n${REG}\n${units}\n\nSiehe FAHRPLAN-PLAN-STEUERUNG.md.\n`;
  const unit = (cb: string, meta: string) => `- ${cb} **x**\n  <!-- @meta ${meta} -->`;
  const ok = (md: string, inv: string[]) => pruefe(md, ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, inv);

  it('verwaistes @meta (id nicht im Inventar) → Problem', () => {
    const md = plan(unit('[ ]', 'id: W9·9 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein'));
    expect(ok(md, []).some((p) => p.id === 'W9·9')).toBe(true);
  });
  it('doppelte id → Problem', () => {
    const u = 'id: A · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein';
    const md = plan(`${unit('[ ]', u)}\n${unit('[ ]', u)}`);
    expect(ok(md, ['A']).some((p) => /mehrfach/.test(p.meldung))).toBe(true);
  });
  it('Zyklus A→B→A → Problem', () => {
    const md = plan(
      `${unit('[ ]', 'id: A · status: ready · of: ja · blocker: null · dep: [B] · kollision: [] · worktree: nein · 26x: nein')}\n` +
      `${unit('[ ]', 'id: B · status: ready · of: ja · blocker: null · dep: [A] · kollision: [] · worktree: nein · 26x: nein')}`,
    );
    expect(ok(md, ['A', 'B']).some((p) => /Zyklus/.test(p.meldung))).toBe(true);
  });
  it('dep auf nicht existierende id → Problem', () => {
    const md = plan(unit('[ ]', 'id: A · status: ready · of: ja · blocker: null · dep: [ZZ] · kollision: [] · worktree: nein · 26x: nein'));
    expect(ok(md, ['A']).some((p) => /ZZ/.test(p.meldung))).toBe(true);
  });
  it('Checkbox [~] mit status done → Problem', () => {
    const md = plan(unit('[~]', 'id: A · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein'));
    expect(ok(md, ['A']).some((p) => p.id === 'A')).toBe(true);
  });
  it('status ready mit blocker → Problem', () => {
    const md = plan(unit('[ ]', 'id: A · status: ready · of: ja · blocker: b1 · dep: [] · kollision: [] · worktree: nein · 26x: nein'));
    expect(ok(md, ['A']).some((p) => p.id === 'A')).toBe(true);
  });
  it('status blocked ohne blocker → Problem', () => {
    const md = plan(unit('[ ]', 'id: A · status: blocked · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein'));
    expect(ok(md, ['A']).some((p) => p.id === 'A')).toBe(true);
  });
  it('zwei 26x auf wip → Problem', () => {
    const md = plan(
      `${unit('[~]', 'id: A · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: ja')}\n` +
      `${unit('[~]', 'id: B · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: ja')}`,
    );
    expect(ok(md, ['A', 'B']).some((p) => /wip/.test(p.meldung))).toBe(true);
  });
});
