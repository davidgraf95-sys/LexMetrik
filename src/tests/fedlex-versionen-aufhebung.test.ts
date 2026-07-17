import { describe, it, expect } from 'vitest';
import { bewerte, parseKonsolidierungen } from '../../scripts/fedlex-versionen-pruefen';
import type { Pin } from '../../scripts/fedlex-pins';

// ─── G-AUFH: Aufhebungs-Blindheit der Currency-Prüfung ───────────────────────
// Vor dem Fix fragte check:fedlex-versionen jolux:dateNoLongerInForce NIRGENDS
// ab: ein ganz aufgehobener Erlass (dateNoLongerInForce ≤ heute) wäre still als
// «geltend geprüft» (OK/grün) stehen geblieben — §7/§8-Verstoss (stilles
// Veralten). Diese Tests verankern die Offline-Entscheidungslogik fixture-basiert;
// der Netz-Teil (SPARQL-Fetch) läuft im check:netz-Pfad.

const HEUTE = '2026-07-17';
const pin = (p: Partial<Pin> = {}): Pin => ({
  name: 'testerlass',
  eli: 'cc/2000/1',
  kons: '2020-01-01',
  ...p,
});

describe('bewerte — Aufhebungs-Zweige (G-AUFH)', () => {
  it('AUFGEHOBEN: dateNoLongerInForce ≤ heute ⇒ ROT, klare Meldung mit Datum', () => {
    const v = bewerte(pin(), ['2020-01-01'], '2025-06-30', HEUTE);
    expect(v.art).toBe('AUFGEHOBEN');
    expect(v.text).toContain('aufgehoben per 2025-06-30');
    expect(v.text).toContain('Snapshot nicht mehr geltend');
  });

  it('AUFGEHOBEN hat VORRANG vor ÜBERHOLT (aufgehoben ist nie „geltend geprüft")', () => {
    // dateApplicability 2026-06-01 wäre für sich «überholt», aber der Erlass ist tot.
    const v = bewerte(pin({ kons: '2020-01-01' }), ['2026-06-01'], '2025-01-01', HEUTE);
    expect(v.art).toBe('AUFGEHOBEN');
  });

  it('AUFHEBUNG (künftig): dateNoLongerInForce > heute ⇒ WARN mit Datum, blockiert nicht', () => {
    const v = bewerte(pin(), ['2020-01-01'], '2027-01-01', HEUTE);
    expect(v.art).toBe('AUFHEBUNG');
    expect(v.text).toContain('AUFGEHOBEN per 2027-01-01');
  });

  it('Grenzfall: Aufhebung GENAU heute ⇒ AUFGEHOBEN (≤ heute ist inklusiv)', () => {
    const v = bewerte(pin(), ['2020-01-01'], HEUTE, HEUTE);
    expect(v.art).toBe('AUFGEHOBEN');
  });
});

describe('bewerte — bestehende Grün-Semantik unverändert (byte-genau)', () => {
  it('OK: geltend, kein Aufhebungsdatum ⇒ exakter Alt-Wortlaut', () => {
    const v = bewerte(pin(), ['2020-01-01'], null, HEUTE);
    expect(v.art).toBe('OK');
    expect(v.text).toBe('OK         testerlass: gepinnt 2020-01-01 = neueste Konsolidierung');
  });

  it('ÜBERHOLT: neuere geltende Konsolidierung, kein Aufhebungsdatum ⇒ exakter Alt-Wortlaut', () => {
    const v = bewerte(pin({ kons: '2020-01-01' }), ['2026-06-01'], null, HEUTE);
    expect(v.art).toBe('ÜBERHOLT');
    expect(v.text).toBe('ÜBERHOLT   testerlass: gepinnt 2020-01-01, geltend ist 2026-06-01 → neu pinnen + §7-Verifikation!');
  });

  it('HINWEIS: künftige Fassung, kein Aufhebungsdatum ⇒ exakter Alt-Wortlaut', () => {
    const v = bewerte(pin({ kons: '2020-01-01' }), ['2020-01-01', '2027-01-01'], null, HEUTE);
    expect(v.art).toBe('HINWEIS');
    expect(v.text).toBe('HINWEIS    testerlass: gepinnt 2020-01-01 (aktuell) — künftige Fassung(en) angekündigt: 2027-01-01');
  });

  it('FEHLER: keine Konsolidierungen ⇒ exakter Alt-Wortlaut', () => {
    const v = bewerte(pin(), [], null, HEUTE);
    expect(v.art).toBe('FEHLER');
    expect(v.text).toBe('FEHLER     testerlass: keine Konsolidierungen via SPARQL gefunden (ELI cc/2000/1 prüfen!)');
  });

  it('FEHLER auch bei undefined (kein SPARQL-Treffer für die ELI)', () => {
    expect(bewerte(pin(), undefined, null, HEUTE).art).toBe('FEHLER');
  });
});

describe('parseKonsolidierungen — noLonger-Extraktion aus SPARQL-Bindings', () => {
  const bind = (eli: string, date: string, noLonger?: string) => ({
    abstract: { value: `https://fedlex.data.admin.ch/eli/${eli}` },
    date: { value: `${date}T00:00:00` },
    ...(noLonger ? { noLonger: { value: `${noLonger}T00:00:00` } } : {}),
  });

  it('extrahiert dateNoLongerInForce, wenn präsent (auf jeder date-Zeile gespiegelt)', () => {
    const m = parseKonsolidierungen([
      bind('cc/2000/1', '2019-01-01', '2025-06-30'),
      bind('cc/2000/1', '2020-01-01', '2025-06-30'),
    ]);
    const b = m.get('cc/2000/1')!;
    expect(b.noLonger).toBe('2025-06-30');
    expect(b.daten).toEqual(['2019-01-01', '2020-01-01']); // sortiert
  });

  it('noLonger bleibt null, wenn Fedlex keins liefert (geltender Erlass)', () => {
    const m = parseKonsolidierungen([bind('cc/2000/2', '2020-01-01')]);
    expect(m.get('cc/2000/2')!.noLonger).toBeNull();
  });

  it('hält das früheste Aufhebungsdatum (defensiv gegen Mehrfachwerte)', () => {
    const m = parseKonsolidierungen([
      bind('cc/2000/3', '2020-01-01', '2026-01-01'),
      bind('cc/2000/3', '2020-01-01', '2024-01-01'),
    ]);
    expect(m.get('cc/2000/3')!.noLonger).toBe('2024-01-01');
  });
});
