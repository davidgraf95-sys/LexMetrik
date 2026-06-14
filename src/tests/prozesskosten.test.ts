// ─── Prozesskosten-Engine (Art. 95/96/113/114 ZPO) ─────────────────────────
import { describe, expect, it } from 'vitest';
import { berechneProzesskosten, berechneKostenrisiko, vergleichAlleKantone, postenText, KANTONE, type PostenErgebnis } from '../lib/prozesskosten';
import { GERICHTSKOSTEN } from '../data/tarif/gerichtskosten';
import { PARTEIENTSCHAEDIGUNG } from '../data/tarif/parteientschaedigung';

const betrag = (p: PostenErgebnis): number => {
  const e = p.ergebnis;
  if (p.kostenlos || !e || !e.deterministisch) throw new Error('kein deterministischer Betrag');
  return e.betragChf;
};

describe('berechneProzesskosten – deterministische Tarife (amtliche Stützstellen)', () => {
  it('ZH: Gerichtsgebühr und Anwaltshonorar bei Streitwert 50 000', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein' });
    expect(betrag(r.gerichtskosten)).toBe(5550);        // GebV OG § 4: 3150 + 8 % von 30 000
    expect(betrag(r.parteientschaedigung)).toBe(7000);  // AnwGebV § 4: 6100 + 9 % von 10 000
  });
  it('AG: Gerichtsgebühr (Fix + % vom Gesamtwert) bei 50 000', () => {
    const r = berechneProzesskosten({ kanton: 'AG', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein' });
    expect(betrag(r.gerichtskosten)).toBe(4290);        // 1290 + 6 % von 50 000
  });
  it('VD: feste Gerichtsgebühr je Stufe bei 50 000', () => {
    const r = berechneProzesskosten({ kanton: 'VD', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein' });
    expect(betrag(r.gerichtskosten)).toBe(7000);        // TFJC Art. 17: Stufe 30k–100k
  });
  it('NE: gemischter Tarif (4000 + 3 % über 30 000) bei 50 000', () => {
    const r = berechneProzesskosten({ kanton: 'NE', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein' });
    expect(betrag(r.gerichtskosten)).toBe(4600);
  });
});

describe('berechneProzesskosten – Ermessensrahmen liefern Spanne, keinen Punkt (§2/§8)', () => {
  it('BS: Gerichtsgebühr 50 000 ist eine Spanne, kein fester Betrag', () => {
    const r = berechneProzesskosten({ kanton: 'BS', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein' });
    const e = r.gerichtskosten.ergebnis;
    expect(e?.deterministisch).toBe(false);
    if (e && !e.deterministisch) { expect(e.vonChf).toBe(3000); expect(e.bisChf).toBe(6000); }
    expect(postenText(r.gerichtskosten)).toMatch(/3.000.*6.000/);
  });
});

describe('kostenlose Verfahren (Art. 113/114 ZPO)', () => {
  it('Arbeit bis 30 000: im Entscheidverfahren keine Gerichtskosten (Art. 114 lit. c)', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 25000, phase: 'entscheid', materie: 'arbeit' });
    expect(r.gerichtskosten.kostenlos).toBe(true);
    expect(r.gerichtskosten.kostenlosGrund).toContain('Art. 114 lit. c');
  });
  it('Arbeit über 30 000: Gerichtskosten fallen an', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'entscheid', materie: 'arbeit' });
    expect(r.gerichtskosten.kostenlos).toBe(false);
  });
  it('Miete/Pacht: in der Schlichtung kostenlos (Art. 113 II lit. c), im Entscheidverfahren NICHT', () => {
    const schlichtung = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 40000, phase: 'schlichtung', materie: 'miete_pacht' });
    const entscheid = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 40000, phase: 'entscheid', materie: 'miete_pacht' });
    expect(schlichtung.gerichtskosten.kostenlos).toBe(true);
    expect(entscheid.gerichtskosten.kostenlos).toBe(false); // Schlüssel-Unterscheidung
  });
  it('Gleichstellung: in beiden Phasen kostenlos', () => {
    expect(berechneProzesskosten({ kanton: 'BE', streitwertCHF: 100000, phase: 'schlichtung', materie: 'gleichstellung' }).gerichtskosten.kostenlos).toBe(true);
    expect(berechneProzesskosten({ kanton: 'BE', streitwertCHF: 100000, phase: 'entscheid', materie: 'gleichstellung' }).gerichtskosten.kostenlos).toBe(true);
  });
  it('Schlichtung: Gerichtskosten = Schlichtungspauschale (separater Tarif), NICHT die Entscheidgebühr', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'schlichtung', materie: 'allgemein' });
    expect(r.gerichtskosten.kostenlos).toBe(false);
    expect(r.gerichtskosten.schlichtungspauschale).toBe(true);
    expect(r.gerichtskosten.ergebnis).toBeUndefined(); // keine bezifferte Entscheidgebühr
    expect(postenText(r.gerichtskosten)).toMatch(/Schlichtungspauschale/);
  });
  it('Parteientschädigung: in der Schlichtung immer keine (Art. 113 Abs. 1)', () => {
    const r = berechneProzesskosten({ kanton: 'GE', streitwertCHF: 200000, phase: 'schlichtung', materie: 'allgemein' });
    expect(r.parteientschaedigung.kostenlos).toBe(true);
    expect(r.parteientschaedigung.kostenlosGrund).toContain('Art. 113 Abs. 1');
  });
});

describe('Kostenrisiko nach Obsiegensquote (Art. 106/111 ZPO)', () => {
  const zh = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein' });
  it('ZH 50 000, hälftiges Obsiegen: Gerichtskosten-Anteil + Netto handgerechnet', () => {
    const r = berechneKostenrisiko(zh.gerichtskosten, zh.parteientschaedigung, 0.5);
    expect(r.berechenbar).toBe(true);
    // GK 5550, PE 7000. q=0,5 → GK-Anteil 0,5×5550=2775; Saldo 0; Netto 0,5×(5550+2×7000)=9775
    expect(r.gerichtskostenZuLasten).toEqual({ vonChf: 2775, bisChf: 2775 });
    expect(r.parteientschaedigungSaldo).toEqual({ vonChf: 0, bisChf: 0 });
    expect(r.nettoBelastung).toEqual({ vonChf: 9775, bisChf: 9775 });
  });
  it('volles Obsiegen → Netto 0, Parteientschädigung wird zugesprochen', () => {
    const r = berechneKostenrisiko(zh.gerichtskosten, zh.parteientschaedigung, 1);
    expect(r.nettoBelastung).toEqual({ vonChf: 0, bisChf: 0 });
    expect(r.parteientschaedigungSaldo).toEqual({ vonChf: 7000, bisChf: 7000 }); // Sie erhalten
  });
  it('volles Unterliegen → Gerichtskosten + beide Parteientschädigungen', () => {
    const r = berechneKostenrisiko(zh.gerichtskosten, zh.parteientschaedigung, 0);
    // Netto 1×(5550+2×7000)=19550; Saldo −7000 (Sie zahlen)
    expect(r.nettoBelastung).toEqual({ vonChf: 19550, bisChf: 19550 });
    expect(r.parteientschaedigungSaldo).toEqual({ vonChf: -7000, bisChf: -7000 });
  });
  it('Ermessensrahmen (BS) → Spannen', () => {
    const bs = berechneProzesskosten({ kanton: 'BS', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein' });
    const r = berechneKostenrisiko(bs.gerichtskosten, bs.parteientschaedigung, 0.5);
    // GK [3000,6000], PE [4500,10000]; Netto 0,5×(GK+2PE) = [6000,13000]
    expect(r.nettoBelastung).toEqual({ vonChf: 6000, bisChf: 13000 });
  });
  it('aufwandbasierter Tarif (GR Parteientschädigung) → nicht beziffert', () => {
    const gr = berechneProzesskosten({ kanton: 'GR', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein' });
    const r = berechneKostenrisiko(gr.gerichtskosten, gr.parteientschaedigung, 0.5);
    expect(r.berechenbar).toBe(false);
  });
});

describe('Datenschicht-Integrität & interkantonaler Vergleich', () => {
  it('alle 26 Kantone haben Gerichtskosten- und Parteientschädigungs-Tarif mit Quelle', () => {
    for (const k of KANTONE) {
      for (const t of [GERICHTSKOSTEN[k], PARTEIENTSCHAEDIGUNG[k]]) {
        expect(t, k).toBeDefined();
        expect(t.quelleUrl.startsWith('https://'), `${k} quelleUrl`).toBe(true);
        expect(t.erlassNr.length, `${k} erlassNr`).toBeGreaterThan(0);
        expect(t.verifiziert).not.toBe('geprüft' as never);
      }
    }
  });
  it('vergleichAlleKantone liefert genau 26 Ergebnisse, je berechenbar', () => {
    const v = vergleichAlleKantone(100000, 'entscheid', 'allgemein');
    expect(v).toHaveLength(26);
    for (const r of v) {
      // jedes Ergebnis ist anzeigbar (Betrag, Spanne, nach Aufwand)
      expect(postenText(r.gerichtskosten).length).toBeGreaterThan(0);
      expect(postenText(r.parteientschaedigung).length).toBeGreaterThan(0);
    }
  });
  it('kein Tarif wirft über eine breite Streitwert-Matrix', () => {
    for (const sw of [0, 1000, 5000, 30000, 100000, 500000, 2_000_000, 50_000_000]) {
      expect(() => vergleichAlleKantone(sw, 'entscheid', 'allgemein')).not.toThrow();
    }
  });
});
