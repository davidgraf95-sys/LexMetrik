import { describe, it, expect } from 'vitest';
import {
  LV_DEFAULTS, lvZusammenstellen, pruefeLvGates, type LvAntworten,
} from '../lib/vorlagen/lehrvertrag';

// Akzeptanztests Lehrvertrag (Art. 344–346a OR) – Sonderregime, eigenes Schema.

const basis = (patch: Partial<LvAntworten> = {}): LvAntworten => ({
  ...LV_DEFAULTS,
  betriebName: 'Muster AG', betriebAdresse: 'Musterweg 1, 4051 Basel',
  lernendeVorname: 'Lea', lernendeName: 'Beispiel', lernendeAdresse: 'Lehrgasse 2, 4052 Basel',
  lernendeGeburtsdatum: '2009-05-01', gesetzlicheVertretung: 'Maria Beispiel',
  beruf: 'Kauffrau', beginn: '2026-08-01', dauerJahre: 3,
  lohnLehrjahre: [{ jahr: 1, chf: '700' }, { jahr: 2, chf: '900' }, { jahr: 3, chf: '1200' }],
  ort: 'Basel', datum: '2026-06-15',
  ...patch,
});

const texte = (a: LvAntworten) => lvZusammenstellen(a).ergebnis.dokument.absaetze.map((x) => x.text).join('\n');
const ids = (a: LvAntworten) => lvZusammenstellen(a).ergebnis.dokument.absaetze.map((x) => x.bausteinId);

describe('Lehrvertrag – Gates (zwingendes Recht)', () => {
  it('LT-1 Probezeit: >3 Monate nur mit Behördenzustimmung, >6 stets blockiert (Art. 344a Abs. 3/4 OR)', () => {
    expect(pruefeLvGates(basis({ probezeitMonate: 3 })).blocker).toEqual([]);
    expect(pruefeLvGates(basis({ probezeitMonate: 4, probezeitBehoerde: false })).blocker.join()).toMatch(/kantonalen Behörde/);
    expect(pruefeLvGates(basis({ probezeitMonate: 6, probezeitBehoerde: true })).blocker).toEqual([]);
    expect(pruefeLvGates(basis({ probezeitMonate: 7, probezeitBehoerde: true })).blocker.join()).toMatch(/einem und drei Monaten/);
  });

  it('LT-2 Ferien: bis zum vollendeten 20. Altersjahr mindestens 5 Wochen (Art. 345a Abs. 3 OR)', () => {
    expect(pruefeLvGates(basis({ ferienWochen: 4 })).blocker.join()).toMatch(/fünf Wochen/);
    expect(pruefeLvGates(basis({ ferienWochen: 5 })).blocker).toEqual([]);
    // über 20: 4 Wochen genügen
    const alt = basis({ lernendeGeburtsdatum: '2000-01-01', ferienWochen: 4 });
    expect(pruefeLvGates(alt).blocker).toEqual([]);
  });

  it('LT-3 Minderjährigkeit: gesetzliche Vertretung Pflicht (Art. 345 Abs. 2 OR)', () => {
    expect(pruefeLvGates(basis({ gesetzlicheVertretung: '' })).blocker.join()).toMatch(/gesetzliche Vertretung/);
    // volljährig: keine Pflicht
    expect(pruefeLvGates(basis({ lernendeGeburtsdatum: '2000-01-01', gesetzlicheVertretung: '' })).blocker).toEqual([]);
  });

  it('LT-4 Hinweise: Schriftform-Gültigkeit, BBG-14-Genehmigung, kein Konkurrenzverbot (344a VI)', () => {
    const h = pruefeLvGates(basis()).hinweise.join('\n');
    expect(h).toMatch(/Gültigkeit der schriftlichen Form/);
    expect(h).toMatch(/Art\. 14 des Berufsbildungsgesetzes/);
    expect(h).toMatch(/Art\. 344a Abs\. 6 OR/);
  });
});

describe('Lehrvertrag – Bausteine', () => {
  it('LT-5 Pflicht-Bausteine in fester Reihenfolge (344a II Pflichtinhalt)', () => {
    const l = ids(basis());
    for (const id of ['L01_parteien', 'L02_gegenstand', 'L03_probezeit', 'L04_arbeitszeit',
      'L05_lohn', 'L06_ferien', 'L07_schule', 'L11_beendigung', 'L13_schluss', 'L14_unterschriften']) {
      expect(l, id).toContain(id);
    }
  });

  it('LT-6 Lohn je Lehrjahr (wiederholeUeber): ein nummerierter Absatz pro Jahr', () => {
    const t = texte(basis());
    expect(t).toMatch(/Im 1\. Lehrjahr beträgt der Bruttolohn CHF 700\.00/);
    expect(t).toMatch(/Im 2\. Lehrjahr beträgt der Bruttolohn CHF 900\.00/);
    expect(t).toMatch(/Im 3\. Lehrjahr beträgt der Bruttolohn CHF 1'200\.00/);
  });

  it('LT-7 einfach blendet die deklaratorischen Bausteine aus; Kernpflichten bleiben', () => {
    const l = ids(basis({ detailgrad: 'einfach' }));
    expect(l).not.toContain('L08_bildungspflichten');
    expect(l).not.toContain('L09_pflichten_lernende');
    expect(l).not.toContain('L12_zeugnis');
    for (const id of ['L02_gegenstand', 'L03_probezeit', 'L05_lohn', 'L06_ferien', 'L11_beendigung']) {
      expect(l, id).toContain(id);
    }
  });

  it('LT-8 experte: weitere Leistungen (344a V) nur bei experte UND Auswahl', () => {
    expect(ids(basis({ berufswerkzeuge: true }))).not.toContain('L10_weitere_leistungen');
    expect(ids(basis({ detailgrad: 'experte', berufswerkzeuge: false }))).not.toContain('L10_weitere_leistungen');
    const t = texte(basis({ detailgrad: 'experte', berufswerkzeuge: true, versicherungspraemien: true }));
    expect(t).toMatch(/Berufswerkzeuge zur Verfügung/);
    expect(t).toMatch(/Prämien der obligatorischen Unfallversicherung/);
  });

  it('LT-9 Minderjährigkeit: Vertretungs-Block in Parteien und Unterschriftenzeile', () => {
    const t = texte(basis());
    expect(t).toMatch(/vertreten durch die gesetzliche Vertretung\nMaria Beispiel/);
    expect(t).toMatch(/Die gesetzliche Vertretung:/);
    // volljährig: kein Vertretungsblock, Zeile «entfällt»
    const tv = texte(basis({ lernendeGeburtsdatum: '2000-01-01', gesetzlicheVertretung: '' }));
    expect(tv).not.toMatch(/vertreten durch die gesetzliche Vertretung/);
    expect(tv).toMatch(/entfällt \(volljährig\)/);
  });

  it('LT-10 Beendigung: keine ordentliche Kündigung nach Probezeit, fristlos 337/346 II mit Anhörung', () => {
    const t = texte(basis());
    expect(t).toMatch(/nicht ordentlich gekündigt/);
    expect(t).toMatch(/Art\. 337 OR/);
    expect(t).toMatch(/anzuhören \(Art\. 346 Abs\. 2 OR\)/);
  });

  it('LT-11 deterministisch: gleiche Eingaben → identisches Dokument', () => {
    expect(lvZusammenstellen(basis())).toEqual(lvZusammenstellen(basis()));
  });
});
