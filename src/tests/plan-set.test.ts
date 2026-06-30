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
