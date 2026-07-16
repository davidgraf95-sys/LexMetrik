import { describe, it, expect } from 'vitest';
import { baueMeldung } from '../components/fehlermeldung';

// O-1.9: die reine, testbare Entscheidung — Sampling + harte Kappung + kein Leak.
// Netz (meldeFehler → fetch) ist fire-and-forget und hier nicht gemockt.

describe('baueMeldung — Sampling + Datensparsamkeit', () => {
  it('verwirft leere/nicht-String-Meldungen (kein Signal)', () => {
    expect(baueMeldung('', { wuerfel: () => 0 })).toBeNull();
    expect(baueMeldung('   ', { wuerfel: () => 0 })).toBeNull();
    expect(baueMeldung(undefined, { wuerfel: () => 0 })).toBeNull();
    expect(baueMeldung(42 as unknown, { wuerfel: () => 0 })).toBeNull();
  });

  it('sampelt: Wurf ≥ Quote → verworfen, Wurf < Quote → gesendet', () => {
    expect(baueMeldung('boom', { quote: 0.25, wuerfel: () => 0.9 })).toBeNull();
    expect(baueMeldung('boom', { quote: 0.25, wuerfel: () => 0.1 })?.meldung).toBe('boom');
  });

  it('quote=1 meldet immer, quote=0 nie', () => {
    expect(baueMeldung('boom', { quote: 1, wuerfel: () => 0.999 })?.meldung).toBe('boom');
    expect(baueMeldung('boom', { quote: 0, wuerfel: () => 0 })).toBeNull();
  });

  it('kappt die Meldung hart auf 300 Zeichen', () => {
    const lang = 'x'.repeat(1000);
    const body = baueMeldung(lang, { quote: 1, wuerfel: () => 0 });
    expect(body?.meldung.length).toBe(300);
  });

  it('trägt Route + Build (in node: leer bzw. dev — kein window)', () => {
    const body = baueMeldung('boom', { quote: 1, wuerfel: () => 0 });
    expect(body).not.toBeNull();
    expect(typeof body!.route).toBe('string'); // ohne window → ''
    expect(typeof body!.build).toBe('string');
  });
});
