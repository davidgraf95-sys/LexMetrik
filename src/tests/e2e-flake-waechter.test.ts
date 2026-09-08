// src/tests/e2e-flake-waechter.test.ts — Verdikt-Logik des Flacker-Wächters.
//
// Prüft die reine Funktion `flackerVerdikt` (Report-JSON + Ausnahmeliste +
// Datum ⇒ Verdikt). Das Tor selbst läuft nur in CI (Playwright-JSON-Report),
// seine ENTSCHEIDUNGSREGEL ist hier deterministisch nachgestellt — inklusive
// der Fehlerseite (§6.7 lit. b): fehlender Report, formwidrige Ausnahme und
// abgelaufene Duldung sind rot, nie stilles Grün.
import { describe, expect, it } from 'vitest';
import { flackerVerdikt, specNormalisieren } from '../../scripts/check-e2e-flake.ts';

const HEUTE = new Date('2026-09-08T10:00:00Z');

/** Minimaler Playwright-JSON-Report mit n flackernden Tests in einer Spec. */
function report(opts: { flaky: number; datei?: string; versuche?: number }): string {
  const datei = opts.datei ?? 'gesetze-a-ueberlauf.e2e.ts';
  const specs =
    opts.flaky > 0
      ? [
          {
            title: 'A-Überlauf ohne Scroller',
            file: datei,
            tests: [
              {
                status: 'flaky',
                results: Array.from({ length: (opts.versuche ?? 2) }, (_, i) => ({ retry: i })),
              },
            ],
          },
        ]
      : [{ title: 'alles ruhig', file: datei, tests: [{ status: 'expected', results: [{ retry: 0 }] }] }];
  return JSON.stringify({
    suites: [{ title: datei, file: datei, specs }],
    stats: { expected: 1, unexpected: 0, flaky: opts.flaky, skipped: 0 },
  });
}

function ausnahme(felder: Partial<Record<'spec' | 'seit' | 'grund' | 'ablauf', unknown>>): string {
  return JSON.stringify([
    {
      spec: 'gesetze-a-ueberlauf.e2e.ts',
      seit: '2026-09-08',
      grund: 'Chevron-Drehung, Wurzel in Arbeit (#778)',
      ablauf: '2026-10-08',
      ...felder,
    },
  ]);
}

describe('Flacker-Wächter — Verdikt', () => {
  it('kein Flackern ⇒ grün', () => {
    const v = flackerVerdikt({ reportRoh: report({ flaky: 0 }), ausnahmenRoh: '[]', heute: HEUTE });
    expect(v.rot).toBe(false);
    expect(v.funde).toEqual([]);
    expect(v.zusammenfassung).toBe('Flacker-Wächter: 0 rot · 0 Ausnahmen (0 in der Liste)');
  });

  it('Flackern ohne Ausnahme ⇒ rot, mit ::error und Retry-Zahl', () => {
    const v = flackerVerdikt({ reportRoh: report({ flaky: 1, versuche: 2 }), ausnahmenRoh: '[]', heute: HEUTE });
    expect(v.rot).toBe(true);
    expect(v.funde).toHaveLength(1);
    expect(v.funde[0].retries).toBe(1);
    expect(v.meldungen.some((m) => m.startsWith('::error') && m.includes('FLACKERT: gesetze-a-ueberlauf.e2e.ts — 1× Retry'))).toBe(true);
    expect(v.zusammenfassung).toContain('1 rot');
  });

  it('Flackern mit gültiger Ausnahme ⇒ grün mit ::warning-Hinweis', () => {
    const v = flackerVerdikt({ reportRoh: report({ flaky: 1 }), ausnahmenRoh: ausnahme({}), heute: HEUTE });
    expect(v.rot).toBe(false);
    expect(v.funde[0].ausnahme?.grund).toContain('Chevron-Drehung');
    expect(v.meldungen.some((m) => m.startsWith('::warning') && m.includes('geduldet bis 2026-10-08'))).toBe(true);
    expect(v.zusammenfassung).toBe('Flacker-Wächter: 0 rot · 1 Ausnahme (gültig bis 2026-10-08)');
  });

  it('abgelaufene Ausnahme ⇒ rot (Duldung verfällt nach 30 Tagen)', () => {
    const alt = ausnahme({ seit: '2026-08-01', ablauf: '2026-08-31' });
    const v = flackerVerdikt({ reportRoh: report({ flaky: 1 }), ausnahmenRoh: alt, heute: HEUTE });
    expect(v.rot).toBe(true);
    expect(v.meldungen.some((m) => m.startsWith('::error') && m.includes('ABGELAUFEN'))).toBe(true);
  });

  it('letzter Geltungstag zählt noch, der Folgetag nicht mehr', () => {
    const bis = ausnahme({ seit: '2026-08-09', ablauf: '2026-09-08' });
    expect(flackerVerdikt({ reportRoh: report({ flaky: 1 }), ausnahmenRoh: bis, heute: HEUTE }).rot).toBe(false);
    expect(
      flackerVerdikt({ reportRoh: report({ flaky: 1 }), ausnahmenRoh: bis, heute: new Date('2026-09-09T00:01:00Z') }).rot,
    ).toBe(true);
  });

  it('Ausnahme ohne Grund ⇒ rot (Formfehler), auch bei grünem Lauf', () => {
    const v = flackerVerdikt({ reportRoh: report({ flaky: 0 }), ausnahmenRoh: ausnahme({ grund: '   ' }), heute: HEUTE });
    expect(v.rot).toBe(true);
    expect(v.meldungen.some((m) => m.includes("Feld 'grund' fehlt"))).toBe(true);
  });

  it('Ausnahme ohne Datum ⇒ rot (Formfehler)', () => {
    const v = flackerVerdikt({ reportRoh: report({ flaky: 1 }), ausnahmenRoh: ausnahme({ seit: undefined }), heute: HEUTE });
    expect(v.rot).toBe(true);
    expect(v.meldungen.some((m) => m.includes("Feld 'seit' fehlt"))).toBe(true);
  });

  it('Ausnahme länger als 30 Tage ⇒ rot (Formfehler)', () => {
    const v = flackerVerdikt({
      reportRoh: report({ flaky: 1 }),
      ausnahmenRoh: ausnahme({ seit: '2026-09-08', ablauf: '2026-10-09' }),
      heute: HEUTE,
    });
    expect(v.rot).toBe(true);
    expect(v.meldungen.some((m) => m.includes('Höchstdauer ist 30 Tage'))).toBe(true);
  });

  it('Report fehlt ⇒ rot, nie stilles Grün', () => {
    const v = flackerVerdikt({ reportRoh: null, ausnahmenRoh: '[]', heute: HEUTE });
    expect(v.rot).toBe(true);
    expect(v.meldungen.some((m) => m.startsWith('::error') && m.includes('fehlt'))).toBe(true);
    // Die Schlusszeile darf ein Rot ohne Spec-Zuordnung nicht als «0 rot» tarnen.
    expect(v.zusammenfassung).toContain('ROT (Report- oder Formfehler');
  });

  it('Report unlesbar oder ohne stats.flaky ⇒ rot', () => {
    expect(flackerVerdikt({ reportRoh: '{kaputt', ausnahmenRoh: '[]', heute: HEUTE }).rot).toBe(true);
    expect(flackerVerdikt({ reportRoh: '{"suites":[]}', ausnahmenRoh: '[]', heute: HEUTE }).rot).toBe(true);
  });

  it('stats.flaky > 0 ohne zuordenbaren Test ⇒ rot (Formatwechsel darf nichts verschlucken)', () => {
    const roh = JSON.stringify({ suites: [], stats: { flaky: 2, expected: 0, unexpected: 0, skipped: 0 } });
    const v = flackerVerdikt({ reportRoh: roh, ausnahmenRoh: '[]', heute: HEUTE });
    expect(v.rot).toBe(true);
    expect(v.meldungen.some((m) => m.includes('stats.flaky=2'))).toBe(true);
  });

  it('Ausnahmeliste fehlt oder ist kein Array ⇒ rot', () => {
    expect(flackerVerdikt({ reportRoh: report({ flaky: 0 }), ausnahmenRoh: null, heute: HEUTE }).rot).toBe(true);
    expect(flackerVerdikt({ reportRoh: report({ flaky: 0 }), ausnahmenRoh: '{}', heute: HEUTE }).rot).toBe(true);
  });

  it('ungenutzte Ausnahme ist ein Hinweis, kein Rot (Shard sieht nur seine Gruppe)', () => {
    const v = flackerVerdikt({ reportRoh: report({ flaky: 0 }), ausnahmenRoh: ausnahme({}), heute: HEUTE });
    expect(v.rot).toBe(false);
    expect(v.meldungen.some((m) => m.startsWith('Hinweis: Ausnahme'))).toBe(true);
  });

  it('Spec-Pfade werden einheitlich normalisiert (Ausnahme greift mit und ohne e2e/-Präfix)', () => {
    expect(specNormalisieren('./e2e/x.e2e.ts')).toBe('x.e2e.ts');
    const v = flackerVerdikt({
      reportRoh: report({ flaky: 1, datei: 'e2e/gesetze-a-ueberlauf.e2e.ts' }),
      ausnahmenRoh: ausnahme({ spec: 'e2e/gesetze-a-ueberlauf.e2e.ts' }),
      heute: HEUTE,
    });
    expect(v.rot).toBe(false);
  });
});
