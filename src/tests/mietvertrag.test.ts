import { describe, it, expect } from 'vitest';
import {
  MV_DEFAULTS, MV_PARAMETER, mvZusammenstellen, pruefeMvGates,
  type MvAntworten,
} from '../lib/vorlagen/mietvertrag';

// Akzeptanztests Mietvertrag — prüfen die Gutachtens-Matrix (absolut/relativ
// zwingend, Schriftform-Mindestdauern, kantonale Form-Gates) deterministisch.

const basis = (patch: Partial<MvAntworten> = {}): MvAntworten => ({
  ...MV_DEFAULTS,
  vermieterName: 'Liegenschaften AG', vermieterAdresse: 'Musterweg 1, 4051 Basel',
  mieterName: 'Anna Beispiel', mieterAdresse: 'Beispielgasse 2, 4052 Basel',
  objektBeschrieb: '3.5-Zimmer-Wohnung im 2. OG', objektAdresse: 'Beispielgasse 2, 4052 Basel',
  beginn: '2026-10-01', mietzinsNettoCHF: '2000',
  nebenkosten: 'akonto', nebenkostenCHF: '250', nkPositionen: ['Heizung', 'Warmwasser'],
  ort: 'Basel', datum: '2026-06-15',
  ...patch,
});

const texte = (a: MvAntworten) => mvZusammenstellen(a).dokument.absaetze.map((x) => x.text).join('\n');
const ids = (a: MvAntworten) => mvZusammenstellen(a).dokument.absaetze.map((x) => x.bausteinId);

describe('Mietvertrag — Gates (zwingendes Recht)', () => {
  it('MT-1 Wohnraum-Kaution über drei Monatszinsen blockiert (Art. 257e Abs. 2 OR); Geschäftsraum nur Warnung', () => {
    expect(pruefeMvGates(basis({ kautionCHF: '7000' })).blocker.join()).toMatch(/drei Monatszinse/);
    expect(pruefeMvGates(basis({ kautionCHF: '6000' })).blocker).toEqual([]);
    const gr = basis({ objektTyp: 'geschaeftsraum', mietzweck: 'Büro', kautionCHF: '16000' });
    expect(pruefeMvGates(gr).blocker).toEqual([]);
    expect(pruefeMvGates(gr).warnungen.join()).toMatch(/sechs Monatszinse/);
  });

  it('MT-2 Formularpflicht-Warnung nur bei Wohnraum in gelisteten Kantonen (Art. 270 Abs. 2 OR)', () => {
    expect(pruefeMvGates(basis({ kanton: 'ZH' })).warnungen.join()).toMatch(/NICHTIG/);
    expect(pruefeMvGates(basis({ kanton: 'AG' })).warnungen.join()).not.toMatch(/Formular/);
    expect(pruefeMvGates(basis({ objektTyp: 'geschaeftsraum', mietzweck: 'Büro', kanton: 'ZH' })).warnungen.join()).not.toMatch(/Formular/);
    // Bern: Quellendiskrepanz wird offengelegt
    expect(pruefeMvGates(basis({ kanton: 'BE' })).warnungen.join()).toMatch(/Quellendiskrepanz|gegenprüfen/);
  });

  it('MT-3 Mindest-Kündigungsfristen: 3 Monate Wohnung / 6 Monate Geschäftsraum (Art. 266c/266d OR)', () => {
    expect(pruefeMvGates(basis({ kuendigungsfristMonate: 2 })).blocker.join()).toMatch(/drei Monate/);
    expect(pruefeMvGates(basis({ objektTyp: 'geschaeftsraum', mietzweck: 'Büro', kuendigungsfristMonate: 5 })).blocker.join()).toMatch(/sechs Monate/);
    expect(pruefeMvGates(basis({ objektTyp: 'geschaeftsraum', mietzweck: 'Büro', kuendigungsfristMonate: 6 })).blocker).toEqual([]);
  });

  it('MT-4 Indexmiete nur bei Vertragsdauer ≥ 5 Jahre (Art. 269b OR, Fedlex-verifiziert)', () => {
    expect(pruefeMvGates(basis({ mietzinsModell: 'index' })).blocker.join()).toMatch(/fünf Jahre/);
    expect(pruefeMvGates(basis({ mietzinsModell: 'index', mindestdauerJahre: 5 })).blocker).toEqual([]);
    expect(pruefeMvGates(basis({ mietzinsModell: 'index', befristet: true, befristetBis: '2032-09-30' })).blocker).toEqual([]);
    expect(pruefeMvGates(basis({ mietzinsModell: 'index', mindestdauerJahre: 5 })).hinweise.join()).toMatch(/Landesindex/);
  });

  it('MT-5 Staffelmiete: ≥ 3 Jahre, höchstens jährlich, Frankenbetrag (Art. 269c OR, Fedlex-verifiziert)', () => {
    const ok = basis({ mietzinsModell: 'staffel', mindestdauerJahre: 3, staffeln: [{ ab: '2027-10-01', erhoehungCHF: '50' }, { ab: '2028-10-01', erhoehungCHF: '50' }] });
    expect(pruefeMvGates(ok).blocker).toEqual([]);
    expect(pruefeMvGates({ ...ok, mindestdauerJahre: 2 }).blocker.join()).toMatch(/drei Jahre/);
    expect(pruefeMvGates({ ...ok, staffeln: [] }).blocker.join()).toMatch(/mindestens eine Staffel/);
    expect(pruefeMvGates({ ...ok, staffeln: [{ ab: '2027-03-01', erhoehungCHF: '50' }] }).blocker.join()).toMatch(/frühestens ein Jahr/);
    expect(pruefeMvGates({ ...ok, staffeln: [{ ab: '2027-10-01', erhoehungCHF: '50' }, { ab: '2028-03-01', erhoehungCHF: '50' }] }).blocker.join()).toMatch(/mindestens ein Jahr liegen/);
  });

  it('MT-6 Nebenkosten ohne einzeln aufgeführte Positionen blockiert (Art. 257a Abs. 2 OR)', () => {
    expect(pruefeMvGates(basis({ nkPositionen: [] })).blocker.join()).toMatch(/einzeln aufgeführt/);
    expect(pruefeMvGates(basis({ nebenkosten: 'keine', nkPositionen: [] })).blocker).toEqual([]);
  });

  it('MT-7 MWST-Option bei Wohnraum blockiert (Art. 22 Abs. 2 lit. b MWSTG); Geschäftsraum-Pflichten', () => {
    expect(pruefeMvGates(basis({ mwstOption: true })).blocker.join()).toMatch(/Wohnzwecke/);
    expect(pruefeMvGates(basis({ objektTyp: 'geschaeftsraum' })).blocker.join()).toMatch(/Mietzweck/);
    expect(pruefeMvGates(basis({ objektTyp: 'geschaeftsraum', mietzweck: 'Apotheke', konkurrenzschutz: true })).blocker.join()).toMatch(/Konkurrenzschutz/);
  });
});

describe('Mietvertrag — Bausteine', () => {
  it('MT-8 Standardvertrag (Wohnung): Pflicht-Bausteine inkl. Referenzzins-Basis', () => {
    const liste = ids(basis());
    for (const id of ['M01_parteien', 'M02_objekt', 'M03_beginn_unbefristet', 'M04_mietzins',
      'M07_unterhalt', 'M08_gebrauch', 'M12_kuendigung', 'M13_rueckgabe', 'M14_schluss', 'M15_unterschriften']) {
      expect(liste, id).toContain(id);
    }
    expect(texte(basis())).toContain(`Referenzzinssatz von ${MV_PARAMETER.referenzzinssatz.wert.toFixed(2)} %`);
  });

  it('MT-9 zwei Mieter → Solidarhaftung im Parteienblock und zweite Unterschrift', () => {
    const t = texte(basis({ zweiterMieterName: 'Bruno Beispiel' }));
    expect(t).toMatch(/haften solidarisch/);
    expect(t).toMatch(/Bruno Beispiel/);
  });

  it('MT-10 Geschäftsraum: MWST- und Konkurrenzschutz-Klauseln nur dort', () => {
    const gr = basis({
      objektTyp: 'geschaeftsraum', mietzweck: 'Betrieb einer Apotheke',
      mwstOption: true, konkurrenzschutz: true, konkurrenzschutzText: 'Apothekenbetrieb',
    });
    expect(ids(gr)).toContain('M10_mwst');
    expect(ids(gr)).toContain('M11_konkurrenzschutz');
    expect(texte(gr)).toContain('8.1 %');
    expect(ids(basis({ mwstOption: undefined }))).not.toContain('M10_mwst');
  });

  it('MT-11 Befristung nutzt Dauer-Baustein ohne Kündigungsklausel; Kaution zeigt Monatszins-Verhältnis', () => {
    const b = basis({ befristet: true, befristetBis: '2028-09-30' });
    expect(ids(b)).toContain('M03_beginn_befristet');
    expect(ids(b)).not.toContain('M12_kuendigung');
    expect(texte(basis({ kautionCHF: '6000' }))).toMatch(/entspricht 3 Monatszinsen/);
  });

  it('MT-12 deterministisch: gleiche Eingaben → identisches Dokument', () => {
    const a = basis({ mietzinsModell: 'staffel', mindestdauerJahre: 3, staffeln: [{ ab: '2027-10-01', erhoehungCHF: '50' }] });
    expect(mvZusammenstellen(a)).toEqual(mvZusammenstellen(a));
  });
});

describe('Mietvertrag — Review-Zusatztests', () => {
  it('MT-13 Staffel-Jahresgrenze: exakt jährliche Staffeln passieren auch über Schaltjahre', () => {
    const ok = basis({
      mietzinsModell: 'staffel', mindestdauerJahre: 4, beginn: '2027-03-01',
      staffeln: [{ ab: '2028-03-01', erhoehungCHF: '50' }, { ab: '2029-03-01', erhoehungCHF: '50' }],
    });
    expect(pruefeMvGates(ok).blocker).toEqual([]);
  });

  it('MT-14 Rollen im Dokumentmodell: Parteien-Ingress und Unterschriftenblock', () => {
    const r = mvZusammenstellen(basis({ zweiterMieterName: 'Bruno Beispiel' }));
    expect(r.dokument.format).toBe('vertrag');
    expect(r.dokument.absaetze.find((x) => x.bausteinId === 'M01_parteien')?.rolle).toBe('parteien');
    expect(r.dokument.absaetze.at(-1)?.rolle).toBe('unterschrift');
  });
});
