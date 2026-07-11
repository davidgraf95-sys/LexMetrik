import { describe, it, expect } from 'vitest';
import { gruppiereVerlauf } from '../lib/verlaufGruppen';
import type { ZuletztEintrag } from '../lib/zuletztVerwendet';

// Verlauf-Gruppierung (lib/verlaufGruppen.ts): heute/gestern/früher aus dem
// `zeit`-Stempel gegen einen hereingereichten `jetzt` (§2 deterministisch).
// Reihenfolge der Einträge bleibt erhalten, leere Gruppen fallen weg.

function e(route: string, zeit: number): ZuletztEintrag {
  return { route, titel: route, typ: 'seite', zeit };
}

// Fixer Bezugspunkt: 2026-07-10 12:00 lokale Zeit.
const jetzt = new Date(2026, 6, 10, 12, 0, 0).getTime();
const heuteFrueh = new Date(2026, 6, 10, 8, 0, 0).getTime();
const gestern = new Date(2026, 6, 9, 20, 0, 0).getTime();
const vorwoche = new Date(2026, 6, 3, 9, 0, 0).getTime();

describe('gruppiereVerlauf', () => {
  it('teilt nach heute/gestern/früher und behält die Reihenfolge', () => {
    const g = gruppiereVerlauf([e('/a', jetzt), e('/b', heuteFrueh), e('/c', gestern), e('/d', vorwoche)], jetzt);
    expect(g.map((x) => x.id)).toEqual(['heute', 'gestern', 'frueher']);
    expect(g[0].eintraege.map((x) => x.route)).toEqual(['/a', '/b']);
    expect(g[1].eintraege.map((x) => x.route)).toEqual(['/c']);
    expect(g[2].eintraege.map((x) => x.route)).toEqual(['/d']);
  });

  it('leere Gruppen werden weggelassen', () => {
    const g = gruppiereVerlauf([e('/a', jetzt)], jetzt);
    expect(g.map((x) => x.id)).toEqual(['heute']);
  });

  it('zeit === 0 (Alt-/metadatenlose Einträge) landet in «Früher», nie in «Heute»', () => {
    const g = gruppiereVerlauf([e('/alt', 0)], jetzt);
    expect(g.map((x) => x.id)).toEqual(['frueher']);
  });

  it('leerer Verlauf → keine Gruppen', () => {
    expect(gruppiereVerlauf([], jetzt)).toEqual([]);
  });
});
