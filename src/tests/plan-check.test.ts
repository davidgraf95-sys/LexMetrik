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
