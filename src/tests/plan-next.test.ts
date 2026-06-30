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
