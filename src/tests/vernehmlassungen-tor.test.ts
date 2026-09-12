import { describe, it, expect } from 'vitest';
import {
  ISO_DATUM, parseDatumArg, finding7Fehler, minimum, alterungsFehler,
} from '../../scripts/materialien/vernehmlassungen-tor';

// §17-Wurzelfix PR #803 + Gegenprüfungs-Auflagen A1–A3 (12.9.2026): reine Prüf-Logik
// der Vernehmlassungs-Tore, getrennt aus check-materialien.ts/check-vernehmlassungen-
// alter.ts extrahiert, damit sie hier ohne den ganzen vite-node-Lauf testbar ist. Der
// ursprüngliche Finding-7-Rot-Beweis (manipulierte Kopie im Bau-Chat) war ohne
// Artefakt — dieser Suite behebt das.

describe('parseDatumArg (A2: kein stilles NaN-Abschalten bei kaputtem --datum)', () => {
  it('liest ein gültiges --datum=YYYY-MM-DD', () => {
    expect(parseDatumArg(['node', 'script.ts', '--datum=2026-09-12'])).toBe('2026-09-12');
  });

  it('liefert undefined ohne --datum-Argument (legitim, kein Fehler)', () => {
    expect(parseDatumArg(['node', 'script.ts'])).toBeUndefined();
  });

  it('wirft bei kaputtem Format statt NaN durchzureichen (Rot-Beweis A2)', () => {
    expect(() => parseDatumArg(['--datum=kaputt'])).toThrow(/kein gültiges ISO-Datum/);
  });

  it('prüft nur die Ziffernform, keine Kalendergültigkeit (Monat 13 besteht das Format)', () => {
    // parseDatumArg lehnt nur SYNTAKTISCH kaputte Werte ab (§A2-Kernfall: 'kaputt').
    // Eine kalendarisch unmögliche, aber formal passende Eingabe wie Monat 13 rutscht
    // durch — die zweite Verteidigungslinie ist Number.isFinite(Date.parse(...)) in
    // alterungsFehler() weiter unten, die exakt so ein Datum als NaN auffängt.
    expect(ISO_DATUM.test('2026-13-01')).toBe(true);
    expect(parseDatumArg(['--datum=2026-13-01'])).toBe('2026-13-01');
    expect(Number.isFinite(Date.parse('2026-13-01'))).toBe(false);
  });

  it('wirft bei leerem Wert', () => {
    expect(() => parseDatumArg(['--datum='])).toThrow(/kein gültiges ISO-Datum/);
  });
});

describe('finding7Fehler (deterministisch, kein heute/Date.now)', () => {
  it('meldet fristEnde < Erhebungsdatum bei laufend (Datenfehler zum Erhebungszeitpunkt)', () => {
    const f = finding7Fehler('VERN-TEST', 'laufend', '2026-09-10', '2026-09-11');
    expect(f).toMatch(/Finding 7, Datenfehler zum Erhebungszeitpunkt/);
    expect(f).toContain('VERN-TEST');
  });

  it('meldet NICHTS, wenn fristEnde == Erhebungsdatum (nicht VOR der Erhebung)', () => {
    expect(finding7Fehler('VERN-TEST', 'laufend', '2026-09-11', '2026-09-11')).toBeNull();
  });

  it('meldet NICHTS für einen Ablauf NACH der Erhebung (reines Kalender-Altern)', () => {
    expect(finding7Fehler('VERN-TEST', 'laufend', '2026-12-01', '2026-09-11')).toBeNull();
  });

  it('meldet NICHTS für nicht-laufende Status, auch mit abgelaufener Frist', () => {
    expect(finding7Fehler('VERN-TEST', 'abgeschlossen-stellungnahmen', '2026-01-01', '2026-09-11')).toBeNull();
  });

  it('meldet NICHTS ohne fristEnde (z. B. status geplant)', () => {
    expect(finding7Fehler('VERN-TEST', 'laufend', undefined, '2026-09-11')).toBeNull();
  });
});

describe('minimum', () => {
  it('liefert den kleinsten ISO-Wert', () => {
    expect(minimum(['2026-09-11', '2026-06-01', '2026-07-15'])).toBe('2026-06-01');
  });

  it('ignoriert nicht-ISO-Werte statt zu crashen', () => {
    expect(minimum(['kaputt', '2026-06-01'])).toBe('2026-06-01');
  });

  it('liefert undefined für eine leere Liste', () => {
    expect(minimum([])).toBeUndefined();
  });

  it('liefert undefined, wenn KEIN Wert ISO ist', () => {
    expect(minimum(['kaputt', 'auch-kaputt'])).toBeUndefined();
  });
});

describe('alterungsFehler (Alterungs-Wächter, K7 — einzige Stelle, die heute liest)', () => {
  it('grün, wenn das Erhebungsdatum genau am Deckel liegt', () => {
    expect(alterungsFehler('2026-07-29', '2026-09-12', 45)).toBeNull(); // 45 Tage alt
  });

  it('rot, wenn das Erhebungsdatum den Deckel um einen Tag überschreitet', () => {
    const f = alterungsFehler('2026-07-28', '2026-09-12', 45); // 46 Tage alt
    expect(f).toMatch(/46 Tage alt \(> 45\)/);
    expect(f).toMatch(/Nachführung fällig/);
  });

  it('A3: keine Erhebung (undefined) ist selbst ein Fehler, kein stiller Skip', () => {
    const f = alterungsFehler(undefined, '2026-09-12', 45);
    expect(f).toMatch(/keine BUND\/vernehmlassung-Einträge/);
    expect(f).not.toBeNull();
  });

  it('A2: ungültiges heute meldet Fehler statt NaN > 45 lautlos falsch zu werten', () => {
    const f = alterungsFehler('2026-06-01', 'kaputt', 45);
    expect(f).toMatch(/nicht auswertbar/);
  });

  it('A2: ungültige Erhebung meldet Fehler statt NaN > 45 lautlos falsch zu werten', () => {
    const f = alterungsFehler('kaputt', '2026-09-12', 45);
    expect(f).toMatch(/nicht auswertbar/);
  });

  it('45-Tage-Deckel (A1): 31-Tage-Monat + 5 Tage Gegenprüfungs-/Merge-Verzug bleibt grün', () => {
    // Monatslauf am 1., Detektor prüft am 6. des Folgemonats (31-Tage-Monat + 5 Tage) — das
    // war exakt der Fall, an dem der alte 35-Tage-Deckel riss (Gegenprüfungs-Auflage A1).
    expect(alterungsFehler('2026-08-01', '2026-09-06', 45)).toBeNull(); // 36 Tage alt
  });
});
