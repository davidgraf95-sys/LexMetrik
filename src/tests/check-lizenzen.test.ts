// src/tests/check-lizenzen.test.ts — Unit-Tests der Kernlogik von check:lizenzen
// (Bug-Check-Nachzug PR #622, 2.9.2026). Beweist die drei Befunde, die per
// direktem Funktionsaufruf reproduzierbar sind:
//  (1) `parseNpmLsJson` gegen einen echten ELSPROBLEMS-stdout-Mitschnitt
//      (reproduziert per `mv node_modules/wrap-ansi …` + `npm ls --all
//      --json --long`) — vorher liess `execFileSync` ohne try/catch das
//      ganze Tor mit uncaught TypeError sterben (End-zu-End-Rot-Beweis in
//      der Rückgabe, hier nur die Parse-Teilfunktion).
//  (2) `UNTERGRENZE_PAKETE`-Konstante — Leerlauf-Grün-Falle.
//  (3) `lizenzText` mit Objekt-Lizenz (`{type: 'MIT'}`) — vorher
//      `TypeError: dep.license.trim is not a function`.
import { describe, it, expect } from 'vitest';
import {
  lizenzText,
  klassifiziereAusdruck,
  parseNpmLsJson,
  UNTERGRENZE_PAKETE,
} from '../../scripts/check-lizenzen';

describe('lizenzText — Befund 3 (Objekt- und String-Lizenzformen, nie crashen)', () => {
  it('String-Lizenz (Standardfall) wird unverändert übernommen', () => {
    expect(lizenzText({ license: 'MIT' })).toBe('MIT');
  });

  it('Objekt-Lizenz {type} (altes npm-Format) — vorher TypeError, jetzt sauber extrahiert', () => {
    expect(lizenzText({ license: { type: 'MIT' } as never })).toBe('MIT');
  });

  it('licenses[]-Array mit Objekt-Einträgen wird zu OR-Ausdruck zusammengesetzt', () => {
    expect(lizenzText({ licenses: [{ type: 'MIT' }, { type: 'Apache-2.0' }] })).toBe('MIT OR Apache-2.0');
  });

  it('fehlende/leere Lizenz liefert leeren String (Aufrufer setzt NOASSERTION)', () => {
    expect(lizenzText({})).toBe('');
    expect(lizenzText({ license: '' })).toBe('');
    expect(lizenzText({ license: null as never })).toBe('');
  });

  it('NOASSERTION (fehlende Lizenz) klassifiziert als rot', () => {
    expect(klassifiziereAusdruck('NOASSERTION')).toBe('rot');
  });
});

describe('parseNpmLsJson — Befund 1 (ELSPROBLEMS liefert trotzdem auswertbares JSON)', () => {
  it('parst normales npm-ls-JSON', () => {
    const baum = parseNpmLsJson('{"name":"lexmetrik","dependencies":{}}');
    expect(baum).not.toBeNull();
    expect(baum?.name).toBe('lexmetrik');
  });

  it('parst einen ELSPROBLEMS-stdout-Mitschnitt (Exit 1) inkl. problems[]', () => {
    // Mitschnitt von `npm ls --all --json --long` nach `mv node_modules/wrap-ansi …`
    // (2.9.2026, npm 11.13.0) — genau die Form, die execFileSync per e.stdout liefert.
    const roh = JSON.stringify({
      name: 'lexmetrik',
      problems: ['missing: wrap-ansi@^7.0.0, required by cliui@8.0.1'],
      error: { code: 'ELSPROBLEMS', summary: 'missing: wrap-ansi@^7.0.0, required by cliui@8.0.1' },
      dependencies: { cliui: { version: '8.0.1', license: 'ISC' } },
    });
    const baum = parseNpmLsJson(roh);
    expect(baum).not.toBeNull();
    expect(baum?.problems).toEqual(['missing: wrap-ansi@^7.0.0, required by cliui@8.0.1']);
  });

  it('nicht-JSON-stdout liefert null statt zu werfen', () => {
    expect(parseNpmLsJson('kein json')).toBeNull();
  });
});

describe('UNTERGRENZE_PAKETE — Befund 2 (Leerlauf-Grün-Falle)', () => {
  it('liegt bei 100 (0 oder wenige geprüfte Pakete dürfen nie grün sein)', () => {
    expect(UNTERGRENZE_PAKETE).toBe(100);
  });
});
