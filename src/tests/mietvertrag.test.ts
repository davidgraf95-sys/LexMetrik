import { describe, it, expect } from 'vitest';
import {
  MV_DEFAULTS, MV_PARAMETER, mvZusammenstellen, pruefeMvGates,
  type MvAntworten,
} from '../lib/vorlagen/mietvertrag';

// Akzeptanztests Mietvertrag – prüfen die Gutachtens-Matrix (absolut/relativ
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

describe('Mietvertrag – Gates (zwingendes Recht)', () => {
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
    // Bern: Diskrepanz aufgelöst – Miet-Initiative 28.9.2025, Pflicht ab 1.12.2025
    expect(pruefeMvGates(basis({ kanton: 'BE' })).warnungen.join()).toMatch(/Miet-Initiative|1\.12\.2025/);
  });

  it('MT-3 Mindest-Kündigungsfristen: 3 Monate Wohnung / 6 Monate Geschäftsraum (Art. 266c/266d OR)', () => {
    expect(pruefeMvGates(basis({ kuendigungsfristMonate: 2 })).blocker.join()).toMatch(/drei Monate/);
    expect(pruefeMvGates(basis({ objektTyp: 'geschaeftsraum', mietzweck: 'Büro', kuendigungsfristMonate: 5 })).blocker.join()).toMatch(/sechs Monate/);
    expect(pruefeMvGates(basis({ objektTyp: 'geschaeftsraum', mietzweck: 'Büro', kuendigungsfristMonate: 6 })).blocker).toEqual([]);
  });

  it('MT-4 Indexmiete nur bei Vertragsdauer ≥ 5 Jahre (Art. 269b OR, Fedlex-verifiziert)', () => {
    expect(pruefeMvGates(basis({ mietzinsModell: 'index' })).blocker.join()).toMatch(/fünf Jahre/);
    expect(pruefeMvGates(basis({ mietzinsModell: 'index', mindestdauerJahre: 5, indexBasisMonat: 'Mai 2026' })).blocker).toEqual([]);
    expect(pruefeMvGates(basis({ mietzinsModell: 'index', befristet: true, befristetBis: '2032-09-30', indexBasisMonat: 'Mai 2026' })).blocker).toEqual([]);
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

describe('Mietvertrag – Bausteine', () => {
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
    expect(texte(basis({ kautionCHF: '6000' }))).toMatch(/entspricht 2\.7 Brutto-Monatszinsen/);
  });

  it('MT-12 deterministisch: gleiche Eingaben → identisches Dokument', () => {
    const a = basis({ mietzinsModell: 'staffel', mindestdauerJahre: 3, staffeln: [{ ab: '2027-10-01', erhoehungCHF: '50' }] });
    expect(mvZusammenstellen(a)).toEqual(mvZusammenstellen(a));
  });
});

describe('Mietvertrag – Review-Zusatztests', () => {
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

describe('Mietvertrag – Audit-Fix 5.6.2026', () => {
  it('MT-15 G3-Fristen-Blocker entfällt bei Befristung (Kündigungsbaustein erscheint nicht)', () => {
    const b = basis({ befristet: true, befristetBis: '2028-09-30', kuendigungsfristMonate: 1 });
    expect(pruefeMvGates(b).blocker).toEqual([]);
    expect(ids(b)).not.toContain('M12_kuendigung');
  });
});

describe('Mietvertrag – Vertiefungs-Gutachten 5.6.2026', () => {
  it('MT-16 Referenzzins-Basis NUR im Standard-Modell (bei Index/Staffel materiell falsch)', () => {
    expect(texte(basis())).toContain('Referenzzinssatz von 1.25 %');
    const index = basis({ mietzinsModell: 'index', mindestdauerJahre: 5, indexBasisMonat: 'Mai 2026' });
    expect(texte(index)).not.toContain('Referenzzinssatz');
    expect(texte(index)).toMatch(/Basis ist der Indexstand von Mai 2026/);
    const staffel = basis({ mietzinsModell: 'staffel', mindestdauerJahre: 3, staffeln: [{ ab: '2027-10-01', erhoehungCHF: '50' }] });
    expect(texte(staffel)).not.toContain('Referenzzinssatz');
  });

  it('MT-17 Indexmiete ohne LIK-Basis blockiert; Punktestand optional im Text', () => {
    expect(pruefeMvGates(basis({ mietzinsModell: 'index', mindestdauerJahre: 5 })).blocker.join()).toMatch(/Basisstand/);
    const mit = basis({ mietzinsModell: 'index', mindestdauerJahre: 5, indexBasisMonat: 'Mai 2026', indexBasisPunkte: '107.1' });
    expect(pruefeMvGates(mit).blocker).toEqual([]);
    expect(texte(mit)).toContain('(107.1 Punkte)');
  });

  it('MT-18 Kaution gegen BRUTTO-Monatszins (inkl. NK-Akonto, h.L.)', () => {
    // netto 2000 + akonto 250 → brutto 2250; Kaution 6300 < 3×2250=6750 → KEIN Blocker (gegen netto wäre 6300 > 6000)
    expect(pruefeMvGates(basis({ kautionCHF: '6300' })).blocker).toEqual([]);
    expect(pruefeMvGates(basis({ kautionCHF: '6800' })).blocker.join()).toMatch(/Bruttomietzins/);
    expect(texte(basis({ kautionCHF: '6750' }))).toMatch(/entspricht 3 Brutto-Monatszinsen/);
  });

  it('MT-19 Erstlaufzeit: Singular «einem Jahr»; Übermass-Hinweis erst > 10 Jahre; 266g-Vorbehalt', () => {
    const t = texte(basis({ mindestdauerJahre: 1 }));
    expect(t).toMatch(/nach Ablauf von einem Jahr kündbar/);
    expect(t).toMatch(/Art\. 266g OR/);
    expect(pruefeMvGates(basis({ mindestdauerJahre: 5 })).hinweise.join()).not.toMatch(/Art\. 27 Abs\. 2 ZGB/);
    expect(pruefeMvGates(basis({ mindestdauerJahre: 15 })).hinweise.join()).toMatch(/Art\. 27 Abs\. 2 ZGB/);
  });

  it('MT-20 Zahlungsverzugs-Baustein (Art. 257d) immer enthalten; 260a vollständig (Wiederherstellung/Mehrwert)', () => {
    expect(ids(basis())).toContain('M06b_zahlungsverzug');
    expect(texte(basis())).toMatch(/Zahlungsfrist von mindestens 30 Tagen/);
    expect(texte(basis())).toMatch(/erheblichen Mehrwert/);
  });

  it('MT-21 Konkurrenzschutz: Konventionalstrafe im Text; ohne Strafe Empfehlungs-Hinweis; BE-Formularpflicht aktiv', () => {
    const gr = basis({ objektTyp: 'geschaeftsraum', mietzweck: 'Apotheke', konkurrenzschutz: true, konkurrenzschutzText: 'Apothekenbetrieb' });
    expect(pruefeMvGates(gr).hinweise.join()).toMatch(/Konventionalstrafe/);
    expect(texte(basis({ ...gr, konkurrenzschutzStrafeCHF: '10000' }))).toMatch(/Konventionalstrafe von CHF 10'000\.00/);
    expect(pruefeMvGates(basis({ kanton: 'BE' })).warnungen.join()).toMatch(/1\.12\.2025/);
  });
});

describe('Mietvertrag – Review-Regressionen 5.6.2026', () => {
  it('MT-22 exakte Kalenderjahr-Befristung erfüllt die Index-/Staffel-Mindestdauer (kein 365.25-Artefakt)', () => {
    const fuenf = basis({ mietzinsModell: 'index', indexBasisMonat: 'Mai 2026', befristet: true, beginn: '2026-10-01', befristetBis: '2031-10-01' });
    expect(pruefeMvGates(fuenf).blocker).toEqual([]);
    expect(pruefeMvGates({ ...fuenf, befristetBis: '2031-09-30' }).blocker.join()).toMatch(/fünf Jahre/);
    const drei = basis({ mietzinsModell: 'staffel', befristet: true, beginn: '2027-03-01', befristetBis: '2030-03-01', staffeln: [{ ab: '2028-03-01', erhoehungCHF: '50' }] });
    expect(pruefeMvGates(drei).blocker).toEqual([]);
  });

  it('MT-23 Kautions-Ausweis ohne Nebenkosten ohne «Brutto»-Präfix; Index-Doc ohne Basis zeigt Platzhalter', () => {
    expect(texte(basis({ nebenkosten: 'keine', nkPositionen: [], kautionCHF: '6000' }))).toMatch(/entspricht 3 Monatszinsen/);
    expect(texte(basis({ mietzinsModell: 'index', mindestdauerJahre: 5 }))).toMatch(/Indexstand von ________/);
  });
});

// ─── Untermiete-Ausbau 6.6.2026 (bibliothek/recherche/untermietvertrag.md) ───
// Art. 262 OR GELTENDE Fassung (Revision in der Volksabstimmung 24.11.2024
// abgelehnt). Default 'hauptmiete' bleibt byte-identisch (golden-bewiesen,
// einziger Diff = deklarierter Versions-String).

describe('Untermietvertrag (Art. 262 OR)', () => {
  const um = (over: Partial<MvAntworten> = {}): MvAntworten => ({
    ...MV_DEFAULTS,
    vermieterName: 'Hans Muster', vermieterAdresse: 'Weg 1, 4051 Basel',
    mieterName: 'Anna Beispiel', mieterAdresse: 'Gasse 2, 4052 Basel',
    objektAdresse: 'Strasse 3, 4053 Basel', objektBeschrieb: '3.5-Zimmer-Wohnung',
    beginn: '2026-08-01', mietzinsNettoCHF: '1800', ort: 'Basel', datum: '2026-06-15',
    mietverhaeltnis: 'untermiete', hmVermieterName: 'Immo AG', hmMietzinsCHF: '1500',
    zustimmungStatus: 'schriftlich', untermieteUmfang: 'ganz',
    ...over,
  });
  const text = (a: MvAntworten) => {
    const e = mvZusammenstellen(a);
    return e.dokument.absaetze.map((x) => `${x.ueberschrift ?? ''} ${x.text ?? ''}`).join('\n');
  };

  it('Titel «Untermietvertrag», U01–U04 enthalten, Rollen parametrisiert', () => {
    const e = mvZusammenstellen(um());
    expect(e.dokument.titel).toBe('Untermietvertrag');
    const t = text(um());
    expect(t).toContain('Hauptmieter der Mietsache gemäss Hauptmietvertrag mit Immo AG');
    expect(t).toContain('Der Hauptvermieter hat der Untervermietung zugestimmt');
    expect(t).toContain('Art. 262 Abs. 3 OR'); // U03 Haftungskette
    expect(t).toContain('endet dadurch jedoch nicht automatisch'); // U04 Warn-Baustein
    expect(t).toContain('Der Untervermieter:'); // Unterschriften-Label parametrisiert
    expect(t).not.toContain('Der Vermieter:');
    expect(t).not.toContain('UnterUnter'); // keine Doppel-Ersetzung
  });

  it('M08 enthält den Hauptmiete-Untermietsatz NICHT mehr (U03 übernimmt)', () => {
    expect(text(um())).not.toContain('Untervermietung bedarf der Zustimmung des Untervermieters; dieser kann sie nur aus den gesetzlichen Gründen');
    // Hauptmiete unverändert:
    const h = mvZusammenstellen({ ...um(), mietverhaeltnis: 'hauptmiete' });
    const ht = h.dokument.absaetze.map((x) => x.text ?? '').join('\n');
    expect(ht).toContain('Untervermietung bedarf der Zustimmung des Vermieters; dieser kann sie nur aus den gesetzlichen Gründen verweigern.');
    expect(h.dokument.titel).toBe('Mietvertrag');
  });

  it('U02 erscheint NUR bei erteilter Zustimmung; sonst Gate-G-Z-Warnung (kein Blocker)', () => {
    expect(text(um({ zustimmungStatus: 'nicht_angefragt' }))).not.toContain('hat der Untervermietung zugestimmt');
    const g = pruefeMvGates(um({ zustimmungStatus: 'nicht_angefragt' }));
    expect(g.blocker.join()).not.toContain('Zustimmung'); // bewusst KEIN Blocker (Vertrag gültig)
    expect(g.warnungen.some((w) => w.includes('Art. 257f Abs. 3'))).toBe(true);
    expect(pruefeMvGates(um()).warnungen.some((w) => w.includes('257f'))).toBe(false);
  });

  it('Gate G-M: Untermietzins über Hauptmietzins ohne Mehrleistung → Missbrauchs-Warnung (262 II b)', () => {
    const g = pruefeMvGates(um({ mietzinsNettoCHF: '1800', hmMietzinsCHF: '1500' }));
    expect(g.warnungen.some((w) => w.includes('Art. 262 Abs. 2 lit. b'))).toBe(true);
    const ok = pruefeMvGates(um({ mietzinsNettoCHF: '1800', hmMietzinsCHF: '1500', mehrleistungBegruendung: 'vollständige Möblierung' }));
    expect(ok.warnungen.some((w) => w.includes('Art. 262 Abs. 2 lit. b'))).toBe(false);
    const gleich = pruefeMvGates(um({ mietzinsNettoCHF: '1500', hmMietzinsCHF: '1500' }));
    expect(gleich.warnungen.some((w) => w.includes('262 Abs. 2 lit. b'))).toBe(false);
  });

  it('teilweise Untermiete: Zimmer-Beschrieb in M02; möbliert → 266e-Hinweis; Endigungs-Hinweis immer', () => {
    const t = text(um({ untermieteUmfang: 'teilweise', untermieteZimmerBeschrieb: 'Zimmer Süd, Mitbenutzung Küche/Bad' }));
    expect(t).toContain('Die Untermiete umfasst: Zimmer Süd');
    const g = pruefeMvGates(um({ moebliert: true }));
    expect(g.hinweise.some((h) => h.includes('Art. 266e'))).toBe(true);
    expect(g.hinweise.some((h) => h.includes('keinen Anspruch auf Eintritt'))).toBe(true);
    expect(g.hinweise.some((h) => h.includes('Art. 291'))).toBe(true); // Pacht-Abgrenzung
  });

  it('Hauptmiete-Default unverändert: keine U-Bausteine, keine Untermiete-Warnungen', () => {
    const g = pruefeMvGates({ ...um(), mietverhaeltnis: 'hauptmiete' });
    expect(g.warnungen.join()).not.toContain('HAUPTVERMIETER');
    expect(text({ ...um(), mietverhaeltnis: 'hauptmiete' })).not.toContain('Hauptmietvertrag mit');
  });
});
