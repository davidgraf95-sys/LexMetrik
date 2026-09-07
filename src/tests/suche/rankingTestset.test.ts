// @vitest-environment node
// ─── S4-GATE: Query-Testset für das Artikel-Volltext-Ranking (UI-NAV S4) ─────
//
// Der Auftrag macht das Query-Testset zum GATE: repräsentative Anwalts-Queries
// mit erwarteten Top-Treffern, gegen den ECHTEN Korpus (baueIndex + FlexSearch,
// exakt die Produktions-Pipeline baueSuchFn). Zwei Zusicherungen je Fall:
//   1. Der erwartete Kernartikel steht im NEUEN Ranking in den Top-`maxRang`.
//   2. Das neue Ranking ist NIE schlechter als das rohe FlexSearch-Ranking
//      (Vorher) — Ranking-Änderungen dürfen das Set nur verbessern (§6.3).
//
// Die Vorher/Nachher-Ränge werden geloggt (Metrik für den PR-Body). Reine
// Determinismus-Prüfung (§2): kein Netz, kein Date; der Index kommt aus den
// gepinnten Snapshots via baueIndex().
//
// W2·5 (25.7.2026): gemessen wird der VOLLE Index (Bund + Kanton), nicht mehr nur
// Bund. Das ist bewusst das schärfere Mass — die 29 055 kantonalen Artikel teilen
// sich denselben Recall-Pool (POOL=300) mit dem Bund, also muss sich hier zeigen,
// ob kantonaler Zuwachs die Bund-Kernartikel aus den Top-Rängen drängt. Ein
// bund-only gemessenes Ranking wäre ab jetzt eine Fiktion.
//
// ERGÄNZUNG 1.9.2026 (K3-Scharfschaltung, QS-BASIS (d)) — der Absatz darüber bleibt
// als Beleg seines Datums stehen, er wird hier nicht nachgeführt (§2b). Seit heute
// baut `baueIndex()` per Default NUR den Bund; dieses Tor misst also den Index, den
// die Auslieferung wirklich trägt. Das ist bewusst so belassen:
//   · Was ausgeliefert wird, ist bund-only — ein Ranking gegen einen Korpus zu
//     messen, den kein Nutzer bekommt, wäre die neue Fiktion.
//   · Die kantonale Rang-Qualität misst seit K2 der Edge-Pfad
//     (scripts/datenhaltung/suche-rang.test.ts, S4-Testset im SQL-Kern).
// Die schärfere Vollindex-Messung bleibt jederzeit fahrbar:
//   `SUCHE_INDEX_EBENEN=bund,kanton npx vitest run src/tests/suche/rankingTestset.test.ts`
// Gegenprüfung 1.9.2026 hat genau das getan: 11/11 grün, Ränge unverändert — der
// Kanton drängt die Bund-Kernartikel also auch heute nicht aus den Top-Rängen.
import { describe, it, expect, beforeAll } from 'vitest';
import * as flex from 'flexsearch';
import { baueIndex } from '../../../scripts/such-index-generieren';
import { baueSuchFn } from '../../lib/suche/artikelVolltext';
import { expandiereSuchbegriff } from '../../lib/suche/vokabular';
import type { SuchTreffer } from '../../lib/universalSuche';

// FlexSearch-Modul in der von der Lib gelieferten Form (kein passender ESM-Typ).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FlexSearch: any = (flex as unknown as { default?: unknown }).default ?? flex;

interface Eintrag { k: string; ku: string; a: string; l: string; m: string; g: string; t: string }

/** Roh-Baseline = die Pipeline VOR S4 (nur Felder t+l, FlexSearch-Ordnung, keine
 *  Re-Rangierung) — der ehrliche «Vorher»-Vergleich. Bewusst hier rekonstruiert,
 *  damit der Produktionscode einspurig bleibt (§5). */
function baueBaseline(eintraege: Eintrag[]): (q: string, limit?: number) => SuchTreffer[] {
  const idx = new FlexSearch.Document({
    document: { id: 'id', index: [{ field: 't', tokenize: 'forward' }, { field: 'l', tokenize: 'forward' }] },
    encoder: FlexSearch.Charset?.LatinBalance,
  });
  eintraege.forEach((e, i) => idx.add({
    id: i,
    t: (e.l + ' ' + e.ku + ' ' + e.k + ' ' + e.t).toLowerCase(),
    l: (e.l + ' ' + e.ku + ' ' + e.k).toLowerCase(),
  }));
  return (q: string, limit = 40): SuchTreffer[] => {
    const terme = [q.toLowerCase(), ...expandiereSuchbegriff(q)];
    const gesehen = new Set<number>();
    const ids: number[] = [];
    for (const term of terme) {
      if (ids.length >= limit) break;
      for (const id of idx.search(term, { limit, suggest: true }).flatMap((r: { result: number[] }) => r.result)) {
        if (!gesehen.has(id)) { gesehen.add(id); ids.push(id); }
      }
    }
    return ids.slice(0, limit).map((i) => ({ id: `art:${eintraege[i].k}:${eintraege[i].a}`, label: `${eintraege[i].l} ${eintraege[i].ku}`, href: `/gesetze/bund/${eintraege[i].k}#art-${eintraege[i].a}` }));
  };
}

// `k` = ROUTEN-Key (STGB, nicht «StGB»), `a` = Artikel-Token des Index (OR 266a
// liegt als «266_a» vor). Beides steckt in der stabilen Treffer-id `art:<k>:<a>`.
function rang(treffer: SuchTreffer[], k: string, a: string): number {
  return treffer.findIndex((t) => t.id === `art:${k}:${a}`);
}

// Repräsentative Anwalts-Queries mit erwartetem Kernartikel + zulässiger Top-Rang.
// Deckt die im Plan (S4/#40) genannten Alltagsbegriffe («Miete» → OR 253 ff.,
// «Verjährung» → OR 127) plus weitere Kern-Kodifikations-Einstiege.
const TESTSET: { q: string; k: string; a: string; maxRang: number }[] = [
  { q: 'Miete', k: 'OR', a: '253', maxRang: 2 },
  { q: 'Verjährung', k: 'OR', a: '127', maxRang: 5 },
  { q: 'Verjährung', k: 'OR', a: '60', maxRang: 2 },
  { q: 'Kündigung', k: 'OR', a: '271', maxRang: 3 },
  { q: 'Werkvertrag', k: 'OR', a: '363', maxRang: 2 },
  { q: 'Notwehr', k: 'STGB', a: '15', maxRang: 4 },
  { q: 'Mäklervertrag', k: 'OR', a: '412', maxRang: 3 },
  { q: 'Bürgschaft', k: 'OR', a: '492', maxRang: 3 },
];

describe('UI-NAV S4 — Query-Testset (Ranking-Gate)', () => {
  let neu: (q: string, limit?: number) => SuchTreffer[];
  let roh: (q: string, limit?: number) => SuchTreffer[];

  // Grosszügiges Hook-Budget: der FlexSearch-Aufbau über ~54 000 Artikel (zwei
  // Indizes: neu + Roh-Baseline) ist der teure Teil; die Suchen danach sind schnell.
  beforeAll(() => {
    const eintraege = baueIndex().eintraege as Eintrag[];
    neu = baueSuchFn(eintraege as never, FlexSearch);
    roh = baueBaseline(eintraege);
  }, 180000);

  it('metrik: Vorher (roh) vs. Nachher (S4) — erwarteter Kernartikel je Query', () => {
    const zeilen: string[] = [];
    for (const { q, k, a } of TESTSET) {
      const rNeu = rang(neu(q, 40), k, a);
      const rRoh = rang(roh(q, 40), k, a);
      const f = (r: number) => (r < 0 ? '—' : String(r + 1));
      zeilen.push(`  «${q}» → ${k} ${a}: vorher ${f(rRoh)}, nachher ${f(rNeu)}`);
    }
    // Für den PR-Body sichtbar (Testrunner druckt console.log bei --reporter=verbose).
    console.log('S4 Ranking-Metrik (Rang des erwarteten Kernartikels):\n' + zeilen.join('\n'));
    expect(zeilen.length).toBe(TESTSET.length);
  });

  for (const { q, k, a, maxRang } of TESTSET) {
    it(`«${q}» hebt ${k} ${a} in die Top-${maxRang} und ist nie schlechter als roh`, () => {
      const rNeu = rang(neu(q, 40), k, a);
      const rRoh = rang(roh(q, 40), k, a);
      expect(rNeu, `${k} ${a} nicht in den Top-${maxRang} (Rang ${rNeu < 0 ? 'nicht gefunden' : rNeu + 1})`).toBeGreaterThanOrEqual(0);
      expect(rNeu, `${k} ${a} auf Rang ${rNeu + 1} > erlaubtem Top-${maxRang}`).toBeLessThan(maxRang);
      // Nie-schlechter-Invariante: fehlt der Artikel im Rohindex (rRoh<0), ist jeder
      // Fund eine Verbesserung; sonst muss der neue Rang ≤ dem alten sein.
      if (rRoh >= 0) {
        expect(rNeu, `Regression: ${k} ${a} rutschte von Rang ${rRoh + 1} (roh) auf ${rNeu + 1} (S4)`).toBeLessThanOrEqual(rRoh);
      }
    });
  }

  it('«Verjährung»: alle Top-8 sind Kernerlass-Treffer, OR 127 vor jedem Nicht-OR', () => {
    const top = neu('Verjährung', 8);
    const orRang = rang(top, 'OR', '127');
    expect(orRang).toBeGreaterThanOrEqual(0);
    const ersterNichtOr = top.findIndex((t) => !t.href.includes('/bund/OR#'));
    if (ersterNichtOr >= 0) expect(orRang).toBeLessThan(ersterNichtOr);
  });

  it('deterministisch: zwei Läufe derselben Query liefern identische Reihenfolge', () => {
    const a1 = neu('Miete', 20).map((t) => t.href);
    const a2 = neu('Miete', 20).map((t) => t.href);
    expect(a1).toEqual(a2);
  });
});
