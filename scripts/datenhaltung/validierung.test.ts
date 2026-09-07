// scripts/datenhaltung/validierung.test.ts
// QS-VERWENDEN V6 — Rot-Beweis: eine Fixture mit fehlendem Pflichtfeld wirft
// (Exit 1 über einen echten process.exit-Aufruf, hier als Wurf abgefangen),
// eine vollständige Fixture geht durch. Deckt beide Datei-Grenzen ab.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseDatenManifest, parseRegister } from './validierung';

// process.exit(1) wirklich beenden zu lassen würde den Testlauf abbrechen —
// hier wirft der Mock stattdessen, damit `expect(...).toThrow()` den
// Exit-Pfad beweist (der echte Aufrufer bricht im Ernstfall den Prozess ab).
afterEach(() => vi.restoreAllMocks());

function mitExitAlsWurf(): void {
  vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as never);
}

describe('parseDatenManifest', () => {
  it('lässt ein vollständiges Manifest unverändert durch', () => {
    const gueltig = { 'normtext.db': { erlasse: { zeilen: 12, sha: 'abcd' } } };
    expect(parseDatenManifest(gueltig, 'fixture.json')).toEqual(gueltig);
  });

  it('bricht mit Exit 1 ab, wenn eine Tabelle "sha" fehlt (Pflichtfeld)', () => {
    mitExitAlsWurf();
    const fehlerhaft = { 'normtext.db': { erlasse: { zeilen: 12 } } };
    expect(() => parseDatenManifest(fehlerhaft, 'fixture.json')).toThrow('process.exit(1)');
  });

  it('bricht mit Exit 1 ab, wenn "zeilen" der falsche Typ ist', () => {
    mitExitAlsWurf();
    const fehlerhaft = { 'normtext.db': { erlasse: { zeilen: '12', sha: 'abcd' } } };
    expect(() => parseDatenManifest(fehlerhaft, 'fixture.json')).toThrow('process.exit(1)');
  });
});

describe('parseRegister', () => {
  const ERLASS_GUELTIG = {
    key: 'OR',
    ebene: 'bund',
    kanton: null,
    sr: '220',
    titel: 'Obligationenrecht',
    rechtsgebiet: 'privat',
    status: 'snapshot',
    // kuerzel/stand seit Gegenprüfung 2.9.2026 (H-3) validierte Pflichtfelder
    // (scripts/feed-generieren.ts braucht beide über dieselbe Grenze).
    kuerzel: 'OR',
    stand: '2026-01-01',
    // zusätzliches, nicht validiertes Feld — muss unverändert durchgereicht werden
    datei: 'bund/OR.json',
  };

  it('lässt ein vollständiges Register unverändert durch (inkl. unvalidierter Zusatzfelder)', () => {
    const gueltig = { erzeugt: '2026-09-02', erlasse: [ERLASS_GUELTIG] };
    expect(parseRegister(gueltig, 'fixture.json')).toEqual(gueltig);
  });

  it('bricht mit Exit 1 ab, wenn ein Erlass "titel" fehlt (Pflichtfeld)', () => {
    mitExitAlsWurf();
    const ohneTitel: Record<string, unknown> = { ...ERLASS_GUELTIG };
    delete ohneTitel.titel;
    const fehlerhaft = { erzeugt: '2026-09-02', erlasse: [ohneTitel] };
    expect(() => parseRegister(fehlerhaft, 'fixture.json')).toThrow('process.exit(1)');
  });

  it('bricht mit Exit 1 ab, wenn "erlasse" fehlt', () => {
    mitExitAlsWurf();
    expect(() => parseRegister({ erzeugt: '2026-09-02' }, 'fixture.json')).toThrow('process.exit(1)');
  });

  it('bricht mit Exit 1 ab, wenn "ebene" nicht "bund"/"kanton" ist (H-4 picklist)', () => {
    mitExitAlsWurf();
    const fehlerhaft = { ...ERLASS_GUELTIG, ebene: 'gemeinde' };
    expect(() =>
      parseRegister({ erzeugt: '2026-09-02', erlasse: [fehlerhaft] }, 'fixture.json'),
    ).toThrow('process.exit(1)');
  });
});
