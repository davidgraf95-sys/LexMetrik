// ─── Prozesskosten-Engine (Art. 95/96/113/114 ZPO) ─────────────────────────
import { describe, expect, it } from 'vitest';
import { berechneProzesskosten, berechneKostenrisiko, berechneKostenvorschuss, berechneMwstParteientschaedigung, vergleichAlleKantone, postenText, WEITERE_KOSTENPOSTEN, KANTONE, type PostenErgebnis } from '../lib/prozesskosten';
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

const spanne = (p: PostenErgebnis): [number | undefined, number | undefined] => {
  const e = p.ergebnis;
  if (!e || e.deterministisch) throw new Error('keine Spanne');
  return [e.vonChf, e.bisChf];
};

describe('Verfahrensart-/Instanz-Modifikatoren (Cockpit I2/I3)', () => {
  it('ZH summarisch: GK ×½–¾, PE ×⅕–⅔ auf den Basistarif', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein', verfahren: 'summarisch' });
    expect(spanne(r.gerichtskosten)).toEqual([2775, 4163]);   // 5550 × [0.5, 0.75]
    expect(spanne(r.parteientschaedigung)).toEqual([1400, 4667]); // 7000 × [0.2, 0.6667]
  });
  it('ZH Rechtsmittel: GK ×0,33–1, PE ×0,2–1', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein', instanz: 'rechtsmittel' });
    expect(spanne(r.gerichtskosten)).toEqual([1832, 5550]);
    expect(spanne(r.parteientschaedigung)).toEqual([1400, 7000]);
  });
  it('ordentlich/erstinstanz: kein Modifikator (unverändert deterministisch)', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein' });
    expect(r.gerichtskosten.ergebnis?.deterministisch).toBe(true);
  });
  it('nicht abschliessend verifizierter Modifikator wird offengelegt (§8)', () => {
    const r = berechneProzesskosten({ kanton: 'SG', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein', verfahren: 'summarisch' });
    expect(r.hinweise.some((h) => h.includes('nicht abschliessend verifiziert'))).toBe(true);
  });
});

describe('Instanz Bundesgericht (Art. 65/68 BGG)', () => {
  it('vermögensrechtlich: BGer-Staffel statt kantonalem Tarif (SW 60 000)', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 60000, phase: 'entscheid', materie: 'allgemein', instanz: 'bundesgericht' });
    expect(spanne(r.gerichtskosten)).toEqual([1500, 5000]);   // Tarif Ziff. 1, Band 50k–100k
    expect(spanne(r.parteientschaedigung)).toEqual([3000, 10000]); // Reglement Art. 4
    expect(r.gerichtskosten.quelle.erlassNr).toContain('173.110.210.1');
  });
  it('reduzierter Ansatz Art. 65 IV bei Arbeit ≤ 30 000', () => {
    const r = berechneProzesskosten({ kanton: 'BE', streitwertCHF: 25000, phase: 'entscheid', materie: 'arbeit', instanz: 'bundesgericht' });
    expect(spanne(r.gerichtskosten)).toEqual([200, 1000]);
    expect(r.gerichtskosten.quelle.artikel).toContain('Art. 65 Abs. 4');
  });
  it('Mietrecht ist am BGer NICHT reduziert (ordentlicher Tarif)', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 25000, phase: 'entscheid', materie: 'miete_pacht', instanz: 'bundesgericht' });
    expect(spanne(r.gerichtskosten)).toEqual([1000, 5000]); // Band 20k–50k, nicht 200–1000
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

describe('Kostenvorschuss (I6 — Art. 98 ZPO / Art. 62 BGG)', () => {
  it('ordentlich erstinstanz: höchstens die Hälfte der mutmasslichen Gerichtskosten', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein' });
    const v = berechneKostenvorschuss(r.gerichtskosten, 'entscheid', 'erstinstanz', 'ordentlich');
    expect(v.voll).toBe(false);
    expect(v.faktor).toBe(0.5);
    expect(v.spanne).toEqual({ vonChf: 2775, bisChf: 2775 }); // ½ × 5550
    expect(v.norm).toContain('Art. 98 Abs. 1');
  });
  it('summarisches Verfahren: voller Vorschuss (Art. 98 Abs. 2)', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein', verfahren: 'summarisch' });
    const v = berechneKostenvorschuss(r.gerichtskosten, 'entscheid', 'erstinstanz', 'summarisch');
    expect(v.voll).toBe(true);
    expect(v.faktor).toBe(1);
    expect(v.spanne).toEqual({ vonChf: 2775, bisChf: 4163 }); // voller Betrag der (skalierten) GK-Spanne
  });
  it('Rechtsmittelverfahren: voller Vorschuss', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein', instanz: 'rechtsmittel' });
    const v = berechneKostenvorschuss(r.gerichtskosten, 'entscheid', 'rechtsmittel', 'ordentlich');
    expect(v.voll).toBe(true);
    expect(v.spanne).toEqual({ vonChf: 1832, bisChf: 5550 });
  });
  it('Bundesgericht: voller Vorschuss nach Art. 62 BGG', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 60000, phase: 'entscheid', materie: 'allgemein', instanz: 'bundesgericht' });
    const v = berechneKostenvorschuss(r.gerichtskosten, 'entscheid', 'bundesgericht', 'ordentlich');
    expect(v.voll).toBe(true);
    expect(v.norm).toBe('Art. 62 BGG');
    expect(v.spanne).toEqual({ vonChf: 1500, bisChf: 5000 });
  });
  it('Schlichtung: voll, aber Pauschale nicht beziffert (spanne null)', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'schlichtung', materie: 'allgemein' });
    const v = berechneKostenvorschuss(r.gerichtskosten, 'schlichtung', 'erstinstanz', 'ordentlich');
    expect(v.voll).toBe(true);
    expect(v.spanne).toBeNull();
  });
  it('kostenloses Verfahren: kein Vorschuss', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 25000, phase: 'entscheid', materie: 'arbeit' });
    const v = berechneKostenvorschuss(r.gerichtskosten, 'entscheid', 'erstinstanz', 'ordentlich');
    expect(v.spanne).toEqual({ vonChf: 0, bisChf: 0 });
  });
});

describe('MwSt auf Parteientschädigung (I6 — Art. 95 III lit. b / MWSTG 8,1 %)', () => {
  it('deterministischer Tarif: 8,1 % Aufschlag + Brutto handgerechnet', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein' });
    const m = berechneMwstParteientschaedigung(r.parteientschaedigung);
    expect(m.satzProzent).toBe(8.1);
    expect(m.betrag).toEqual({ vonChf: 567, bisChf: 567 });       // 7000 × 8,1 %
    expect(m.bruttoSpanne).toEqual({ vonChf: 7567, bisChf: 7567 });
  });
  it('Rahmen-Tarif (BS): MwSt auf die Spanne', () => {
    const r = berechneProzesskosten({ kanton: 'BS', streitwertCHF: 50000, phase: 'entscheid', materie: 'allgemein' });
    const m = berechneMwstParteientschaedigung(r.parteientschaedigung);
    expect(m.bruttoSpanne?.vonChf).toBe(Math.round(4500 * 1.081));
    expect(m.bruttoSpanne?.bisChf).toBe(Math.round(10000 * 1.081));
  });
  it('Schlichtung (keine Parteientschädigung): nicht beziffert', () => {
    const r = berechneProzesskosten({ kanton: 'ZH', streitwertCHF: 50000, phase: 'schlichtung', materie: 'allgemein' });
    const m = berechneMwstParteientschaedigung(r.parteientschaedigung);
    expect(m.betrag).toBeNull();
    expect(m.hinweis).toContain('Keine Parteientschädigung');
  });
  it('weitere Kostenposten sind als Hinweis vorhanden (Art. 95 II c–e / 117 ff.)', () => {
    expect(WEITERE_KOSTENPOSTEN.length).toBeGreaterThanOrEqual(3);
    expect(WEITERE_KOSTENPOSTEN.some((h) => h.includes('Art. 117'))).toBe(true);
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
