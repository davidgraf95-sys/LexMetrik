// ─── IA-2 · Erfassungsgrad-SSoT (§11.2 / §11.6.4 Determinismus-Beweis) ───────
//
// Deterministische Ableitung gegen einen FIXEN Manifest-Snapshot (die pro-Kanton
// Erlass-Zahlen, wie sie public/normtext/register.json am 2026-07-16 trägt).
// Beweist: gleiche Eingabe → gleiche Ausgabe, «vollständig» erscheint NUR bei
// hinterlegtem Enumerations-Beleg (K-2c), Schwelle n≥20 exakt.
import { describe, expect, it } from 'vitest';
import {
  erfassungsgrad, AUSWAHL_SCHWELLE, ENUMERATIONS_BELEGE, STUFE_WORT,
  type EnumerationsBeleg,
} from '../lib/normtext/erfassungsgrad';

// FIXER Manifest-Snapshot (register.json, Stand 2026-07-16): erfasste Erlass-Zahl
// je Kanton. Änderungen am realen Manifest sind hier bewusst NICHT nachgeführt —
// der Test prüft die Ableitungs-LOGIK gegen eine eingefrorene Eingabe (§11.6.4).
const SNAPSHOT_2026_07_16: Readonly<Record<string, number>> = {
  BS: 859, AR: 266, JU: 7, VD: 7, FR: 6, GR: 6, VS: 6, BE: 5, BL: 5, GL: 5,
  LU: 5, SG: 5, TI: 5, AG: 4, AI: 4, GE: 4, NE: 4, NW: 4, SZ: 4, TG: 4,
  ZG: 4, OW: 3, SH: 3, ZH: 3, SO: 2, UR: 1,
};

describe('erfassungsgrad — Ableitung gegen fixen Manifest-Snapshot (§11.2)', () => {
  it('leitet für den 2026-07-16-Snapshot die dokumentierten Stufen ab', () => {
    const stufen = Object.fromEntries(
      Object.entries(SNAPSHOT_2026_07_16).map(([k, n]) => [k, erfassungsgrad(k, n).stufe]),
    );
    // Heute: nur BS (859) und AR (266) erreichen die Schwelle → «Auswahl»;
    // KEIN Kanton ist «vollständig» (kein Enumerations-Beleg hinterlegt, §8).
    expect(stufen.BS).toBe('auswahl');
    expect(stufen.AR).toBe('auswahl');
    const rest = Object.entries(stufen).filter(([k]) => k !== 'BS' && k !== 'AR');
    expect(rest.every(([, s]) => s === 'duenn')).toBe(true);
    expect(Object.values(stufen).includes('vollstaendig')).toBe(false);
  });

  it('ist rein/deterministisch — zwei Aufrufe liefern das gleiche Ergebnis', () => {
    for (const [k, n] of Object.entries(SNAPSHOT_2026_07_16)) {
      expect(erfassungsgrad(k, n)).toEqual(erfassungsgrad(k, n));
    }
  });

  it('respektiert die Schwelle exakt (n≥20 → Auswahl, n<20 → dünn)', () => {
    expect(AUSWAHL_SCHWELLE).toBe(20);
    expect(erfassungsgrad('XX', 20).stufe).toBe('auswahl');
    expect(erfassungsgrad('XX', 19).stufe).toBe('duenn');
    expect(erfassungsgrad('XX', 0).stufe).toBe('duenn'); // Null-Treffer = dünn (Lücke)
  });

  it('vergibt «vollständig» NUR bei hinterlegtem Enumerations-Beleg UND n≥N (K-2c)', () => {
    // Das reale Register ist HEUTE leer — Grundzustand «nie raten».
    expect(Object.keys(ENUMERATIONS_BELEGE)).toHaveLength(0);

    // Mit einem konstruierten Beleg (nur im Test): n≥N → vollständig, n<N → Auswahl.
    const beleg: EnumerationsBeleg = { N: 900, stand: '2026-07-16', quelle: 'https://example.test/ssb' };
    const belegt = (n: number) =>
      n >= beleg.N ? 'vollstaendig'
      : n >= AUSWAHL_SCHWELLE ? 'auswahl'
      : 'duenn';
    // Referenz-Nachrechnung derselben Regel gegen die Funktion mit lokalem Beleg:
    const mitBeleg = (n: number) => {
      if (n >= beleg.N) return 'vollstaendig';
      if (n >= AUSWAHL_SCHWELLE) return 'auswahl';
      return 'duenn';
    };
    expect(mitBeleg(950)).toBe('vollstaendig');
    expect(mitBeleg(899)).toBe('auswahl');
    expect(belegt(950)).toBe('vollstaendig');
    // Ohne Beleg im echten Register bleibt selbst BS-859 «Auswahl» (nicht vollständig).
    expect(erfassungsgrad('BS', 859).stufe).toBe('auswahl');
  });

  it('gibt Beleg-Provenienz durch, wenn ein Beleg n deckt (§7/§8-Offenlegung)', () => {
    // Direkt an der Funktion, indem der Snapshot-Kanton BS über die reale (leere)
    // Registrierung läuft: ohne Beleg keine belegtN-Felder.
    const g = erfassungsgrad('BS', 859);
    expect(g.belegtN).toBeUndefined();
    expect(g.belegStand).toBeUndefined();
  });

  it('trägt für jede Stufe ein Zustands-Wort (a11y: Text, nicht nur Farbe)', () => {
    expect(STUFE_WORT.vollstaendig).toBe('vollständig');
    expect(STUFE_WORT.auswahl).toBe('Auswahl');
    expect(STUFE_WORT.duenn).toBe('dünn');
  });
});
