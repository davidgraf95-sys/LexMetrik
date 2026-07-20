// src/tests/plan-next.test.ts
import { resolve } from '../../scripts/plan/next';
import type { Einheit } from '../../scripts/plan/parse';

// `pos` = Dokumentreihenfolge. Im Test zählt ein Modul-Zähler hoch, damit die
// Aufrufreihenfolge der Helferfunktion die ROADMAP-Reihenfolge nachbildet.
let posZaehler = 0;
function einheit(id: string, p: Partial<Einheit['etikett']> = {}): Einheit {
  return {
    id, checkbox: null, sektion: 'Die geordnete Abarbeitung', pos: posZaehler++,
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
    expect(b.wartet26xSlot).toContain('Q');
  });

  // GEÄNDERTE SEMANTIK 20.7.2026 (deklarierter fachlicher Schritt, §6 Ziff. 3):
  // Rangfolge ist die ROADMAP-Dokumentreihenfolge (`pos`), nicht mehr die
  // lexikografische ID. Vorher waren alle 23 ready-Einheiten gleichrangig und
  // «oberster offener Schritt» war nicht beantwortbar. Hier steht B VOR A im
  // Dokument, also bekommt B den 26×-Slot.
  it('26x: zwei frische ready-26x → nur das dokument-erste ready-now, anderes wartet auf Slot', () => {
    const b = resolve([
      einheit('B', { asset26x: true }),
      einheit('A', { asset26x: true }),
    ]);
    expect(b.readyNow).toEqual(['B']);
    expect(b.wartet26xSlot).toEqual(['A']);
  });
});

// Der `slot: inhaber`-Zweig (next.ts, Befund 20.7.2026 bei der Slot-Übergabe
// W2·6-DATA → W3·12): Ohne den ausdrücklichen Inhaber-Vorrang meldete next.ts
// den Inhaber als «wartet auf 26×-Slot» — wartend auf den Slot, den er selbst
// hält — und liess statt seiner den dokument-ersten anderen 26×-Schritt zu.
describe('resolve — 26×-Slot-Inhaber (slot: inhaber)', () => {
  it('Inhaber ist ready-now, obwohl ein anderes 26× im Dokument FRÜHER steht', () => {
    const b = resolve([
      einheit('FRUEH', { asset26x: true }),
      einheit('INHABER', { asset26x: true, slot: 'inhaber' }),
    ]);
    expect(b.readyNow).toContain('INHABER');
    expect(b.readyNow).not.toContain('FRUEH');
    // Der Inhaber darf NIE auf den Slot warten, den er selbst hält.
    expect(b.wartet26xSlot).toEqual(['FRUEH']);
  });

  it('alle Nicht-Inhaber-26× warten auf den Slot, unabhängig von der Position', () => {
    const b = resolve([
      einheit('VOR', { asset26x: true }),
      einheit('HALTER', { asset26x: true, slot: 'inhaber' }),
      einheit('NACH', { asset26x: true }),
    ]);
    expect(b.readyNow).toEqual(['HALTER']);
    expect(b.wartet26xSlot).toEqual(['VOR', 'NACH']);
  });

  it('Nicht-26×-Schritte bleiben vom Inhaber unberührt', () => {
    const b = resolve([
      einheit('NORMAL', { kollision: ['src/a.ts'] }),
      einheit('INHABER', { asset26x: true, slot: 'inhaber' }),
      einheit('ANDERES26X', { asset26x: true }),
    ]);
    expect(b.readyNow).toEqual(['NORMAL', 'INHABER']);
    expect(b.wartet26xSlot).toEqual(['ANDERES26X']);
  });

  it('ohne Inhaber gilt weiter die Dokumentreihenfolge (Rückfall-Zweig)', () => {
    const b = resolve([
      einheit('ERST', { asset26x: true }),
      einheit('ZWEIT', { asset26x: true }),
    ]);
    expect(b.readyNow).toEqual(['ERST']);
    expect(b.wartet26xSlot).toEqual(['ZWEIT']);
  });
});

describe('resolve — Lane-Sicherheit + inArbeit (Sweep)', () => {
  it('leere kollision → konservativ eigene Lane (nicht co-laned)', () => {
    const b = resolve([einheit('A'), einheit('B')]);
    expect(b.lanes).toEqual([['A'], ['B']]);
  });
  it('Glob vs exakt auf derselben Datei → kollidiert (getrennte Lanes)', () => {
    const b = resolve([einheit('A', { kollision: ['public/x/OR.json'] }), einheit('B', { kollision: ['public/x/*.json'] })]);
    expect(b.lanes).toEqual([['A'], ['B']]);
  });
  it('disjunkte konkrete Pfade → co-laned', () => {
    const b = resolve([einheit('A', { kollision: ['src/a.ts'] }), einheit('B', { kollision: ['src/b.ts'] })]);
    expect(b.lanes).toEqual([['A', 'B']]);
  });
  it('wip-Einheit erscheint in inArbeit, nicht lautlos weg', () => {
    const b = resolve([einheit('A', { status: 'wip' }), einheit('B')]);
    expect(b.inArbeit).toEqual(['A']);
    expect(b.readyNow).toEqual(['B']);
  });
});
