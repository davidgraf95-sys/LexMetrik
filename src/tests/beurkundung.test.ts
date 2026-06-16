// ─── Allgemeine Beurkundungskosten-Engine (Geschäftsart-Dimension) ──────────
import { describe, expect, it } from 'vitest';
import { berechneBeurkundung, vergleichBeurkundung, tarifFuer, istWertbasiert } from '../lib/beurkundung';
import { berechneNotariatGrundbuch } from '../lib/notariatGrundbuch';
import { notariatsGebuehrGruendung } from '../lib/notariatsgebuehrenGruendung';
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
    // §8-Korrektur 16.6.: TNo Art. 26 = Grundgebühr-RAHMEN 200–2000 (Ermessen)
    // PLUS degressiver Wertanteil → ehrliche Spanne [Wertanteil 1650, +1800].
    expect(spanne('ag_gruendung', 'VD', 1_000_000)).toEqual([1650, 3450]);
    expect(det('erbvertrag', 'NW', 1_000_000)).toBe(2100);  // § 18 Staffel
    expect(det('ag_gruendung', 'NW', 1_000_000)).toBe(2900);// § 36 Sockel+Staffel
    expect(det('schenkung', 'GL', 1_000_000)).toBe(1700);   // A1-1 Staffel
  });

  it('Gesamtwert-/Schwellensatz-Tarife (UR Tarif A: Satz × ganzem Wert, Stufen-Minima)', () => {
    expect(det('schenkung', 'UR', 100_000)).toBe(500);     // 3‰ × 100k = 300 → min 500
    expect(det('schenkung', 'UR', 500_000)).toBe(1250);    // 2,5‰ × ganzem Wert
    expect(det('schenkung', 'UR', 1_000_000)).toBe(2500);
    expect(det('schenkung', 'UR', 3_000_000)).toBe(6000);  // 2‰ × ganzem Wert
  });

  it('aktuelle Fassung (ZH NotGebV 1.1.2024, nicht aufgehobene v95) als Rahmen', () => {
    expect(spanne('testament', 'ZH')).toEqual([200, 4000]);  // Korrektur 4000 (nicht 5000)
    expect(spanne('erbvertrag', 'ZH')).toEqual([300, 6000]); // Korrektur 6000 (nicht 7500)
    expect(spanne('ag_gruendung', 'SZ', 100_000)).toEqual([200, 1300]);
  });

  it('dieselbe Geschäftsart je Kanton wertbasiert ODER fix (Testament: OW Staffel, ZH Rahmen)', () => {
    expect(istWertbasiert('testament', 'OW')).toBe(true);
    // §8-Korrektur 16.6.: OW Art. 10 = Grundgebühr-RAHMEN 500–1800 (Ermessen)
    // PLUS 1‰ Wertanteil → ehrliche Spanne [Wertanteil 1500, +1300].
    expect(spanne('testament', 'OW', 1_000_000)).toEqual([1500, 2800]);
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

describe('Beurkundung — AG-Gründung-Parität: allg. System vs. Spezial-Engine (Drift-Schutz, Engine-Synergien 16.6.2026)', () => {
  // Zwei LIVE geschaltete Encodings derselben Rechtsfrage (Notariatsgebühr der
  // AG-Gründung):
  //  · Spezial-Engine notariatsGebuehrGruendung  → genutzt in VorlageAgGruendung.tsx
  //  · allg. Beurkundungsrechner, Geschäftsart 'ag_gruendung' → beurkundung.ts
  // Driften sie, kostet dieselbe Gründung im AG-Wizard etwas anderes als im
  // Beurkundungsrechner (§1/§5 Single Source). Die Spezial-Engine deckt 6 Kantone
  // (ZH/BE/LU/SG/BS/AG); nur diese werden verglichen. Beide Schichten tragen
  // 'recherche' (kein 'geprüft'). Der bisherige Parity-Test (oben) deckt nur
  // 'grundstueckkauf' ab — dieser Block schliesst das Gründungs-Drift-Loch.

  type Kanon =
    | { kind: 'betrag'; chf: number }
    | { kind: 'rahmen'; von: number; bis: number }
    | { kind: 'offen' };

  const kanonSpezial = (k: string, kap: number): Kanon => {
    const a = notariatsGebuehrGruendung(k, kap);
    if (!a) return { kind: 'offen' };
    const e = a.ergebnis;
    if (e.typ === 'betrag') return { kind: 'betrag', chf: Math.round(e.chf) };
    if (e.typ === 'rahmen') return { kind: 'rahmen', von: e.vonChf, bis: e.bisChf };
    return { kind: 'offen' }; // 'aufwand' | 'offen' → beide nicht beziffert
  };
  const kanonAllg = (k: KantonCode, kap: number): Kanon => {
    const r = berechneBeurkundung({ geschaeftsart: 'ag_gruendung', kanton: k, geschaeftswertCHF: kap });
    if (!r.posten) return { kind: 'offen' };
    const e = r.posten.ergebnis;
    if (e.deterministisch) return { kind: 'betrag', chf: Math.round(e.betragChf) };
    if (e.vonChf != null && e.bisChf != null) return { kind: 'rahmen', von: e.vonChf, bis: e.bisChf };
    return { kind: 'offen' }; // 'formel_extern'/Aufwand → nicht beziffert
  };

  // Konvergierte Kantone: identische Auslegung in beiden Systemen — dicht verifiziert
  // (0 Abweichungen über 0–3 Mio in 25k-Schritten + grosse Werte). Tripwire gegen
  // jede künftige einseitige Tarif-Änderung.
  it('ZH/LU/BS/AG sind über dichten Kapital-Sweep deckungsgleich', () => {
    for (const k of ['ZH', 'LU', 'BS', 'AG'] as KantonCode[]) {
      for (let w = 0; w <= 3_000_000; w += 25_000) {
        expect(kanonAllg(k, w), `${k} @ ${w}`).toEqual(kanonSpezial(k, w));
      }
      for (const w of [5_000_000, 10_000_000, 20_000_000, 50_000_000]) {
        expect(kanonAllg(k, w), `${k} @ ${w}`).toEqual(kanonSpezial(k, w));
      }
    }
  });

  // ── Bekannte, normbelegte Divergenzen — Reconciliation durch David ausstehend (§1/§7) ──
  // Tripwire-Politik (vgl. e2e BEKANNTE_BEFUNDE): solange ungelöst hier fixiert, damit der
  // Drift sichtbar bleibt UND die Suite grün ist. Sobald eine Lesart gewinnt und beide
  // Systeme angeglichen werden, bricht die jeweilige Assertion → Eintrag entfernen.

  it('TRIPWIRE SG — Tranchen-Auslegung divergiert (floor vs. kontinuierlich)', () => {
    // GebT SG (sGS 821.5) Nr. 60.13: «385 für die ersten 100 000, je weitere VOLLE
    // 100 000 → 80». Die Spezial-Engine floored (nur ganze Tranchen, Auslegung 7.6.2026,
    // systematisch via Nr. 52.03 «ganze oder angebrochene»); das allg. System rechnet
    // kontinuierlich 0,08‰ und WIDERSPRICHT damit seinem eigenen Hinweis «nur ganze
    // Tranchen». An runden 100k-Vielfachen identisch, bei nicht-runden Kapitalien Drift:
    expect(kanonSpezial('SG', 150_000)).toEqual({ kind: 'betrag', chf: 385 });
    expect(kanonAllg('SG', 150_000)).toEqual({ kind: 'betrag', chf: 425 });
    expect(kanonSpezial('SG', 250_000)).toEqual({ kind: 'betrag', chf: 465 });
    expect(kanonAllg('SG', 250_000)).toEqual({ kind: 'betrag', chf: 505 });
    expect(kanonAllg('SG', 1_000_000)).toEqual(kanonSpezial('SG', 1_000_000)); // rund → deckungsgleich
  });

  it('TRIPWIRE BE — Präzision divergiert (Anhang-4-Stufe vs. flache Gesamtspanne)', () => {
    // GebVN BE (BSG 169.81) Art. 21 + Anhang 4: kapitalspezifische Lookup-Stufe
    // [Min/Mittel/Max]. Die Spezial-Engine liest die Stufe (1 Mio → 2200–3600); das
    // allg. System (regel-typ 'rahmen') gibt nur die flache Gesamttabellen-Spanne.
    expect(kanonSpezial('BE', 1_000_000)).toEqual({ kind: 'rahmen', von: 2200, bis: 3600 });
    expect(kanonAllg('BE', 1_000_000)).toEqual({ kind: 'rahmen', von: 1000, bis: 27350 });
    // Schwache Konsistenz-Invariante: die präzise Spezial-Spanne liegt INNERHALB der
    // groben allg. Spanne (kein Widerspruch, nur Präzisionsverlust).
    for (const w of [100_000, 500_000, 1_000_000, 5_000_000, 20_000_000]) {
      const s = kanonSpezial('BE', w);
      const a = kanonAllg('BE', w);
      if (s.kind === 'rahmen' && a.kind === 'rahmen') {
        expect(s.von, `BE @ ${w} von ⊆`).toBeGreaterThanOrEqual(a.von);
        expect(s.bis, `BE @ ${w} bis ⊆`).toBeLessThanOrEqual(a.bis);
      }
    }
  });
});
