import { describe, it, expect } from 'vitest';
import { istReinerDatumsChurn, ohneChurnFelder } from '../../scripts/normtext/churn-reset';

// §17 Befund (a2), 1.9.2026: Reset reinen Datums-Churns (erzeugt/abgerufen) nach Generator-Läufen.
// Fixture = Kopf eines Bund-Snapshots (public/normtext/bund/ADOV.json, Diff aus PR #596).

const alt = JSON.stringify({
  erzeugt: '2026-08-29',
  eintraege: [
    { id: 'bund/ADOV/art_1', stand: '2023-01-23', abgerufen: '2026-08-29', fassungsToken: '20230123', sha: 'x', bloecke: [{ absatz: '1', text: 'Diese Verordnung regelt:' }] },
    { id: 'bund/ADOV/art_2', stand: '2023-01-23', abgerufen: '2026-08-29', fassungsToken: '20230123', sha: 'y', bloecke: [] },
  ],
}, null, 2);

const nurDaten = alt.replaceAll('2026-08-29', '2026-08-31');

describe('istReinerDatumsChurn', () => {
  it('nur erzeugt/abgerufen verschoben ⇒ Churn (zurücksetzen)', () => {
    expect(nurDaten).not.toBe(alt);
    expect(istReinerDatumsChurn(alt, nurDaten)).toBe(true);
  });
  it('Text-Änderung neben dem Datums-Churn ⇒ Substanz (belassen)', () => {
    expect(istReinerDatumsChurn(alt, nurDaten.replace('regelt:', 'regelt neu:'))).toBe(false);
  });
  it('stand-/fassungsToken-/sha-Wechsel sind Substanz, kein Churn', () => {
    expect(istReinerDatumsChurn(alt, nurDaten.replace('"stand": "2023-01-23"', '"stand": "2026-01-01"'))).toBe(false);
    expect(istReinerDatumsChurn(alt, nurDaten.replace('"fassungsToken": "20230123"', '"fassungsToken": "20260101"'))).toBe(false);
    expect(istReinerDatumsChurn(alt, nurDaten.replace('"sha": "x"', '"sha": "z"'))).toBe(false);
  });
  it('gelöschter oder neuer Eintrag ⇒ Substanz', () => {
    const o = JSON.parse(nurDaten) as { eintraege: unknown[] };
    o.eintraege.pop();
    expect(istReinerDatumsChurn(alt, JSON.stringify(o))).toBe(false);
  });
  it('byte-gleich ⇒ kein Churn (nichts zu tun)', () => {
    expect(istReinerDatumsChurn(alt, alt)).toBe(false);
  });
  it('Nicht-JSON auf einer Seite ⇒ nie Churn (fail-closed)', () => {
    expect(istReinerDatumsChurn(alt, '{ kaputt')).toBe(false);
    expect(istReinerDatumsChurn('nicht json', nurDaten)).toBe(false);
  });
  it('ohneChurnFelder entfernt die Felder auf jeder Tiefe und lässt Arrays/Reihenfolge stehen', () => {
    expect(ohneChurnFelder({ erzeugt: 'x', a: [{ abgerufen: 'y', b: 1 }, 2], c: { erzeugt: 'z', d: null } }))
      .toEqual({ a: [{ b: 1 }, 2], c: { d: null } });
  });
});
