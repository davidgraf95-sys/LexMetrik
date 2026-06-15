// ─── Allgemeine Beurkundungskosten-Engine (Geschäftsart-Dimension) ──────────
import { describe, expect, it } from 'vitest';
import { berechneBeurkundung, vergleichBeurkundung, tarifFuer, istWertbasiert } from '../lib/beurkundung';
import { berechneNotariatGrundbuch } from '../lib/notariatGrundbuch';
import { GESCHAEFTSART_IDS, geschaeftsart } from '../data/tarif/beurkundung-typen';
import { KANTONE, type KantonCode } from '../data/tarif/typen';

describe('Beurkundung — Grundstückkauf parity (keine Regression zum Spezialrechner)', () => {
  it('Beurkundungs-Posten = Notariat-Posten des Grundstückkauf-Rechners (alle 26 Kt)', () => {
    for (const k of KANTONE) {
      for (const wert of [0, 500_000, 1_000_000, 5_000_000]) {
        const neu = berechneBeurkundung({ geschaeftsart: 'grundstueckkauf', kanton: k, geschaeftswertCHF: wert });
        const alt = berechneNotariatGrundbuch({ kanton: k, kaufpreisCHF: wert });
        expect(neu.posten, `${k} ${wert}`).not.toBeNull();
        expect(neu.posten!.ergebnis, `${k} ${wert}`).toEqual(alt.beurkundung.ergebnis);
        expect(neu.posten!.quelle.artikel, `${k}`).toBe(alt.beurkundung.quelle.artikel);
      }
    }
  });
});

describe('Beurkundung — Ehrlichkeit & Robustheit (§8)', () => {
  it('wertbasierte Arten ohne hinterlegten Tarif liefern status "offen" (kein Schätzwert)', () => {
    // Solange GENERELLER_WERTTARIF/SONDERTARIFE für eine Art/Kt leer sind, darf
    // NIE ein Betrag erscheinen — nur ehrliches "offen".
    const r = berechneBeurkundung({ geschaeftsart: 'buergschaft', kanton: 'ZH', geschaeftswertCHF: 100_000 });
    if (r.status === 'offen') {
      expect(r.posten).toBeNull();
      expect(tarifFuer('buergschaft', 'ZH')).toBeNull();
    } else {
      // sobald Recherche-Daten vorhanden sind: dann MUSS eine Quelle dranhängen.
      expect(r.posten).not.toBeNull();
      expect(r.posten!.quelle.quelleUrl.startsWith('https://') || !r.posten!.ergebnis.deterministisch).toBe(true);
    }
  });

  it('jede aufgelöste Geschäftsart trägt eine amtliche Quelle (oder ist Rahmen/extern)', () => {
    for (const art of GESCHAEFTSART_IDS) {
      for (const k of KANTONE) {
        const auf = tarifFuer(art, k as KantonCode);
        if (!auf) continue;
        const t = auf.tarif;
        const ok = t.quelleUrl.startsWith('https://') || t.regel.typ === 'formel_extern';
        expect(ok, `${art} ${k} ${t.erlassNr}`).toBe(true);
        expect(t.verifiziert).not.toBe('geprüft' as never);
      }
    }
  });

  it('vergleichBeurkundung: 26 Ergebnisse je Art, kein Crash über breite Wert-Matrix', () => {
    for (const art of GESCHAEFTSART_IDS) {
      const bem = geschaeftsart(art).bemessung;
      for (const wert of [0, 100_000, 1_000_000, 10_000_000]) {
        const v = vergleichBeurkundung(art, bem === 'wert' ? wert : undefined);
        expect(v, `${art} ${wert}`).toHaveLength(26);
      }
    }
  });

  it('Geschäftswert negativ wirft, 0 ok', () => {
    expect(() => berechneBeurkundung({ geschaeftsart: 'grundstueckkauf', kanton: 'ZH', geschaeftswertCHF: -1 })).toThrow();
    expect(() => berechneBeurkundung({ geschaeftsart: 'grundstueckkauf', kanton: 'ZH', geschaeftswertCHF: 0 })).not.toThrow();
  });
});

describe('Beurkundung — amtliche Stützstellen (Deep Research, doppelt verifiziert)', () => {
  const det = (art: Parameters<typeof berechneBeurkundung>[0]['geschaeftsart'], k: KantonCode, w?: number): number => {
    const r = berechneBeurkundung({ geschaeftsart: art, kanton: k, geschaeftswertCHF: w });
    if (!r.posten || !r.posten.ergebnis.deterministisch) throw new Error(`${art}/${k} nicht deterministisch`);
    return r.posten.ergebnis.betragChf;
  };
  const spanne = (art: Parameters<typeof berechneBeurkundung>[0]['geschaeftsart'], k: KantonCode, w?: number) => {
    const r = berechneBeurkundung({ geschaeftsart: art, kanton: k, geschaeftswertCHF: w });
    const e = r.posten!.ergebnis;
    if (e.deterministisch) throw new Error('deterministisch erwartet Spanne');
    return [e.vonChf, e.bisChf];
  };

  it('deterministische Sondersätze/Fixgebühren', () => {
    expect(det('buergschaft', 'ZH', 100_000)).toBe(100);   // 0,5‰ → min 100
    expect(det('stiftung', 'ZH', 1_000_000)).toBe(1000);   // 1‰
    expect(det('testament', 'UR')).toBe(750);              // Fix Ziff. 7
    expect(det('vollmacht', 'UR')).toBe(40);               // Beglaubigung
    expect(det('erbvertrag', 'OW', 1_000_000)).toBe(1000); // 1‰ Ziff. 10
    expect(det('stiftung', 'GR', 2_000_000)).toBe(2000);   // 1‰ (Flat-Kanton)
    expect(det('ag_gruendung', 'ZH', 1_000_000)).toBe(1000); // ZH Flat-Kanton 1‰
    // GE Bürgschaft: Doppelcheck-Korrektur 1‰ (nicht 1%), min 100 / max 500.
    expect(det('buergschaft', 'GE', 200_000)).toBe(200);   // 1‰ × 200k
    expect(det('buergschaft', 'GE', 1_000_000)).toBe(500); // 1‰ × 1M → max 500
  });

  it('allgemeiner Werttarif greift für wertbasierte Arten ohne Sondersatz', () => {
    expect(det('dienstbarkeit', 'SZ', 500_000)).toBe(450); // 0,9‰ genereller Werttarif
  });

  it('dieselbe Geschäftsart je Kanton wertbasiert ODER fix (Testament: OW 1‰, ZH Rahmen)', () => {
    expect(istWertbasiert('testament', 'OW')).toBe(true);
    expect(det('testament', 'OW', 1_000_000)).toBe(1000);  // 1‰ — Promille-Feld-Fix
    expect(istWertbasiert('testament', 'ZH')).toBe(false);  // Rahmen 200–5000
  });

  it('Rahmen-/Aufwandtarife als ehrliche Spanne, kein Punktwert', () => {
    expect(spanne('testament', 'ZH')).toEqual([200, 5000]);  // Rahmen Ziff. 4.3.2
    expect(spanne('ag_gruendung', 'SZ', 100_000)).toEqual([200, 1300]);
    // Überhöhungs-Schutz: Wert-Gründung in Staffel-Kanton = ehrliche Spanne (kein Flach-Promille).
    const vdAg = berechneBeurkundung({ geschaeftsart: 'ag_gruendung', kanton: 'VD', geschaeftswertCHF: 1_000_000 });
    expect(vdAg.posten!.ergebnis.deterministisch).toBe(false);
    const luSchenkung = berechneBeurkundung({ geschaeftsart: 'schenkung', kanton: 'LU', geschaeftswertCHF: 1_000_000 });
    expect(luSchenkung.posten!.ergebnis.deterministisch).toBe(false);
    // Aufwandtarife: nicht beziffert (vonChf/bisChf undefined)
    const be = berechneBeurkundung({ geschaeftsart: 'ehevertrag', kanton: 'BE' });
    expect(be.posten!.ergebnis.deterministisch).toBe(false);
  });
});
