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

describe('Beurkundung — amtliche Stützstellen (3-fach verifiziert: find→Doppelcheck→Zweitprüfung→Reencode)', () => {
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

  it('flache Promillesätze / Fixgebühren', () => {
    expect(det('buergschaft', 'ZH', 100_000)).toBe(100);   // 0,5‰ → min 100
    expect(det('stiftung', 'ZH', 1_000_000)).toBe(1000);   // 1‰
    expect(det('ag_gruendung', 'ZH', 1_000_000)).toBe(1000); // 1‰
    expect(det('testament', 'UR')).toBe(750);              // Fix
    expect(det('vollmacht', 'UR')).toBe(40);               // Beglaubigung
    expect(det('dienstbarkeit', 'SZ', 500_000)).toBe(450); // 0,9‰
    // GE Bürgschaft: Korrektur 1‰ (nicht 1%), min 100 / max 500.
    expect(det('buergschaft', 'GE', 200_000)).toBe(200);
    expect(det('buergschaft', 'GE', 1_000_000)).toBe(500); // max 500
  });

  it('degressive Wert-Staffeln korrekt (kein Flach-Promille-Überhöhungsfehler mehr)', () => {
    expect(det('schenkung', 'LU', 1_000_000)).toBe(2750);   // § 21 Staffel 3‰/2,5‰
    expect(det('ag_gruendung', 'VD', 1_000_000)).toBe(1650);// TNo degressiv
    expect(det('erbvertrag', 'NW', 1_000_000)).toBe(2100);  // § 18 Staffel
    expect(det('ag_gruendung', 'NW', 1_000_000)).toBe(2900);// § 36 Sockel+Staffel
    expect(det('schenkung', 'GL', 1_000_000)).toBe(1700);   // A1-1 Staffel
  });

  it('aktuelle Fassung (ZH NotGebV 1.1.2024, nicht aufgehobene v95) als Rahmen', () => {
    expect(spanne('testament', 'ZH')).toEqual([200, 4000]);  // Korrektur 4000 (nicht 5000)
    expect(spanne('erbvertrag', 'ZH')).toEqual([300, 6000]); // Korrektur 6000 (nicht 7500)
    expect(spanne('ag_gruendung', 'SZ', 100_000)).toEqual([200, 1300]);
  });

  it('dieselbe Geschäftsart je Kanton wertbasiert ODER fix (Testament: OW Staffel, ZH Rahmen)', () => {
    expect(istWertbasiert('testament', 'OW')).toBe(true);
    expect(det('testament', 'OW', 1_000_000)).toBe(1500);  // Grundgebühr-Sockel + 1‰
    expect(istWertbasiert('testament', 'ZH')).toBe(false);  // Rahmen 200–4000
  });

  it('Aufwand-/Stundensatz-Tarife als ehrliche Nicht-Bezifferung (kein Schein-Wert)', () => {
    // ZH Vorsorgeauftrag = CHF 180/Std (Ziff. 4.2.3), nicht «nach Vereinbarung-Fix».
    const zhVa = berechneBeurkundung({ geschaeftsart: 'vorsorgeauftrag', kanton: 'ZH' });
    expect(zhVa.posten!.ergebnis.deterministisch).toBe(false);
    const beEhe = berechneBeurkundung({ geschaeftsart: 'ehevertrag', kanton: 'BE' });
    expect(beEhe.posten!.ergebnis.deterministisch).toBe(false);
  });
});
