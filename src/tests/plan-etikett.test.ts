// src/tests/plan-etikett.test.ts
import { parseEtikett, serializeEtikett } from '../../scripts/plan/etikett';

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

describe('parseEtikett — Robustheit', () => {
  it('leere Listen-Member werden gefiltert', () => {
    const e = parseEtikett('<!-- @meta id: A · status: ready · of: ja · blocker: null · dep: [W1,] · kollision: [] · worktree: nein · 26x: nein -->');
    expect(e.dep).toEqual(['W1']);
  });
  it('wip() leere Klammer → statusAgent null (round-trip stabil)', () => {
    const e = parseEtikett('<!-- @meta id: A · status: wip() · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->');
    expect(e.statusAgent).toBeNull();
    expect(parseEtikett(serializeEtikett(e, '')).statusAgent).toBeNull();
  });
});
