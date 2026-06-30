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

describe('parseRoadmap — Robustheit', () => {
  it('CRLF: @blockers werden trotz \\r geparst', () => {
    const md = ['## Die geordnete Abarbeitung', '<!-- @blockers', 'b1: grund', '-->', '- [ ] **x**', '  <!-- @meta id: A · status: blocked · of: ja · blocker: b1 · dep: [] · kollision: [] · worktree: nein · 26x: nein -->'].join('\r\n');
    const { blockers, einheiten } = parseRoadmap(md);
    expect(blockers.b1).toBe('grund');
    expect(einheiten.map((e) => e.id)).toEqual(['A']);
  });
  it('einzeiliger @blockers-Kommentar schluckt nicht das ganze Dokument', () => {
    const md = ['## Die geordnete Abarbeitung', '<!-- @blockers b1: x -->', '- [ ] **y**', '  <!-- @meta id: A · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->'].join('\n');
    expect(parseRoadmap(md).einheiten.map((e) => e.id)).toEqual(['A']);
  });
  it('Checkbox [X] gross + * /+ -Bullets werden erkannt', () => {
    const md = ['## Die geordnete Abarbeitung', '* [X] **z**', '  <!-- @meta id: A · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->'].join('\n');
    expect(parseRoadmap(md).einheiten[0].checkbox).toBe('[x]');
  });
});
