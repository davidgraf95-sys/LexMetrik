/**
 * G-AUFH · Anerkannte Ganz-Aufhebungen (§8-Ehrlichkeit).
 *
 * Deckt die SSoT (aufhebungen.ts) + ihre Projektion ins Register (mitAufhebung)
 * + den Browse-Manifest-Durchreicher ab. Norm-Beleg (BMV/SR 412.103.1) ist live
 * gegen Fedlex verifiziert (dateNoLongerInForce=2026-03-01, Nachfolge cc/2025/408);
 * dieser Test verankert die Datenintegrität, NICHT die Norm selbst.
 */
import { describe, it, expect } from 'vitest';
import {
  ANERKANNTE_AUFHEBUNGEN,
  anerkannteAufhebungNachKey,
  anerkannteAufhebungNachEli,
  aufhebungFuerRegister,
} from '../lib/normtext/aufhebungen';
import { ERLASS_REGISTER } from '../lib/normtext/register';
import { baueBrowseManifest } from '../../scripts/normtext/browse-manifest';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

describe('ANERKANNTE_AUFHEBUNGEN — SSoT-Integrität', () => {
  it('jede Deklaration hat gültiges ISO-Datum, ELI im cc-Format und Beleg', () => {
    for (const a of ANERKANNTE_AUFHEBUNGEN) {
      expect(a.seit, `${a.key} seit`).toMatch(ISO);
      expect(a.eli, `${a.key} eli`).toMatch(/^cc\/\d{4}\/[\w_]+$/);
      expect(a.sr.length, `${a.key} sr`).toBeGreaterThan(0);
      expect(a.quelle.length, `${a.key} quelle`).toBeGreaterThan(20);
      if (a.nachfolger) {
        expect(a.nachfolger.eli, `${a.key} nf.eli`).toMatch(/^cc\/\d{4}\/[\w_]+$/);
        expect(a.nachfolger.sr.length).toBeGreaterThan(0);
        expect(a.nachfolger.titel.length).toBeGreaterThan(0);
      }
    }
  });

  it('key- und eli-Schlüssel sind eindeutig', () => {
    const keys = ANERKANNTE_AUFHEBUNGEN.map((a) => a.key);
    const elis = ANERKANNTE_AUFHEBUNGEN.map((a) => a.eli);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(elis).size).toBe(elis.length);
  });

  it('BMV (SR 412.103.1) ist als aufgehoben deklariert, Nachfolge cc/2025/408', () => {
    const bmv = anerkannteAufhebungNachKey('BMV');
    expect(bmv).toBeDefined();
    expect(bmv!.sr).toBe('412.103.1');
    expect(bmv!.eli).toBe('cc/2009/423');
    expect(bmv!.seit).toBe('2026-03-01');
    expect(bmv!.nachfolger?.eli).toBe('cc/2025/408');
    expect(bmv!.nachfolger?.sr).toBe('412.103.1'); // Totalrevision: gleicher SR-Slot
  });

  it('Lookup nach ELI trifft dieselbe Deklaration (Currency-Check-Pfad)', () => {
    expect(anerkannteAufhebungNachEli('cc/2009/423')?.key).toBe('BMV');
    expect(anerkannteAufhebungNachEli('cc/9999/999')).toBeUndefined();
    expect(anerkannteAufhebungNachKey('OR')).toBeUndefined();
  });

  it('aufhebungFuerRegister liefert nur seit+nachfolger (ohne Identität/Beleg)', () => {
    const feld = aufhebungFuerRegister('BMV');
    expect(feld).toEqual({
      seit: '2026-03-01',
      nachfolger: {
        sr: '412.103.1',
        titel: expect.stringContaining('Berufsmaturität'),
        eli: 'cc/2025/408',
      },
    });
    expect(aufhebungFuerRegister('OR')).toBeUndefined();
  });
});

describe('Register-Projektion (mitAufhebung)', () => {
  it('BMV-Registereintrag trägt den Aufhebungs-Vermerk, geltende Erlasse nicht', () => {
    const bmv = ERLASS_REGISTER.find((e) => e.key === 'BMV');
    expect(bmv?.aufgehoben?.seit).toBe('2026-03-01');
    expect(bmv?.aufgehoben?.nachfolger?.eli).toBe('cc/2025/408');
    const or = ERLASS_REGISTER.find((e) => e.key === 'OR');
    expect(or?.aufgehoben).toBeUndefined();
  });

  it('nur deklarierte Erlasse tragen `aufgehoben` (kein Streuverlust)', () => {
    const mitAuf = ERLASS_REGISTER.filter((e) => e.aufgehoben);
    const deklariert = new Set(ANERKANNTE_AUFHEBUNGEN.map((a) => a.key));
    for (const e of mitAuf) expect(deklariert.has(e.key)).toBe(true);
  });
});

describe('Browse-Manifest-Durchreicher', () => {
  it('projiziert `aufgehoben` von Bund-Snapshots in den BrowseErlass', () => {
    const manifest = baueBrowseManifest('2026-07-12');
    const bmv = manifest.erlasse.find((e) => e.key === 'BMV');
    expect(bmv?.aufgehoben?.seit).toBe('2026-03-01');
    expect(bmv?.aufgehoben?.nachfolger?.sr).toBe('412.103.1');
    // geltender Erlass trägt das Feld nicht.
    const or = manifest.erlasse.find((e) => e.key === 'OR');
    expect(or?.aufgehoben).toBeUndefined();
  });
});
