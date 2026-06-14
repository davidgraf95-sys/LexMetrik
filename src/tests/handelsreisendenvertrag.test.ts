import { describe, it, expect } from 'vitest';
import {
  HR_DEFAULTS, hrZusammenstellen, pruefeHrGates, type HrAntworten,
} from '../lib/vorlagen/handelsreisendenvertrag';

// Akzeptanztests Handelsreisendenvertrag (Art. 347–350a OR) – Sonderregime.

const basis = (patch: Partial<HrAntworten> = {}): HrAntworten => ({
  ...HR_DEFAULTS,
  arbeitgeberName: 'Muster AG', arbeitgeberAdresse: 'Musterweg 1, 8000 Zürich',
  reisenderVorname: 'Rolf', reisenderName: 'Beispiel', reisenderAdresse: 'Reisegasse 2, 3000 Bern',
  gegenstand: 'Werkzeugmaschinen', reisegebiet: 'Kantone BE und SO',
  beginn: '2026-08-01', fixCHF: '5000', provisionProzent: '3',
  ort: 'Zürich', datum: '2026-06-15',
  ...patch,
});

const texte = (a: HrAntworten) => hrZusammenstellen(a).ergebnis.dokument.absaetze.map((x) => x.text).join('\n');
const ids = (a: HrAntworten) => hrZusammenstellen(a).ergebnis.dokument.absaetze.map((x) => x.bausteinId);

describe('Handelsreisendenvertrag – Gates (zwingendes Recht)', () => {
  it('HR-1 Delkredere: ohne Provision blockiert, mit Provision Hinweis ¼/Privatkunden (Art. 348a OR)', () => {
    expect(pruefeHrGates(basis({ delkredere: true })).blocker.join()).toMatch(/Delkredere-Provision/);
    const g = pruefeHrGates(basis({ delkredere: true, delkredereProvisionProzent: '2' }));
    expect(g.blocker).toEqual([]);
    expect(g.hinweise.join()).toMatch(/PRIVATKUNDEN.*Viertel/s);
  });

  it('HR-2 reine Provision: Angemessenheits-Hinweis (Art. 349a Abs. 2 OR)', () => {
    expect(pruefeHrGates(basis({ lohnmodell: 'provision' })).hinweise.join()).toMatch(/angemessenes Entgelt/);
  });

  it('HR-3 Vollmacht: Vermittlung (Default) bzw. Abschluss ohne Inkasso (Art. 348b OR)', () => {
    expect(pruefeHrGates(basis({ vollmacht: 'vermittlung' })).hinweise.join()).toMatch(/nur zur Vermittlung/);
    expect(pruefeHrGates(basis({ vollmacht: 'abschluss' })).hinweise.join()).toMatch(/Entgegennahme von Zahlungen/);
  });

  it('HR-4 Auslagenersatz-Einschluss stets als nichtig offengelegt (Art. 349d Abs. 2 OR)', () => {
    expect(pruefeHrGates(basis()).hinweise.join()).toMatch(/Art\. 349d Abs\. 2 OR/);
  });

  it('HR-5 Saison-Kündigung: Hinweis nur bei saisonaler Schwankung (Art. 350 OR)', () => {
    expect(pruefeHrGates(basis({ saisonschwankung: false })).hinweise.join()).not.toMatch(/Art\. 350 OR/);
    expect(pruefeHrGates(basis({ saisonschwankung: true })).hinweise.join()).toMatch(/Art\. 350 OR/);
  });
});

describe('Handelsreisendenvertrag – Bausteine', () => {
  it('HR-6 Provisions-Bezug nur mit Provision; ausschliesslich → alle Geschäfte (349b I)', () => {
    expect(ids(basis({ lohnmodell: 'fix' }))).not.toContain('H06_provision_bezug');
    expect(ids(basis({ lohnmodell: 'fix' }))).not.toContain('H09_verhinderung');
    const t = texte(basis({ lohnmodell: 'fix_provision', ausschliesslich: true }));
    expect(t).toMatch(/auf allen Geschäften.*Art\. 349b Abs\. 1 OR/s);
    const tn = texte(basis({ lohnmodell: 'fix_provision', ausschliesslich: false }));
    expect(tn).toMatch(/nur auf den.*Art\. 349b Abs\. 2 OR/s);
  });

  it('HR-7 Lohn-Text je Modell (fix / fix+Provision / reine Provision, 349a)', () => {
    expect(texte(basis({ lohnmodell: 'fix' }))).toMatch(/festes Gehalt von CHF 5'000\.00 pro Monat\./);
    expect(texte(basis({ lohnmodell: 'fix_provision' }))).toMatch(/zuzüglich einer Provision von 3 %/);
    expect(texte(basis({ lohnmodell: 'provision' }))).toMatch(/ausschliesslich aus einer Provision von 3 %/);
  });

  it('HR-8 Auslagen: effektiv gegen Beleg bzw. gesonderte Pauschale (349d)', () => {
    expect(texte(basis({ auslagen: 'effektiv' }))).toMatch(/gegen Beleg/);
    expect(texte(basis({ auslagen: 'pauschal', auslagenPauschaleCHF: '600' }))).toMatch(/gesonderte Pauschale von CHF 600\.00/);
  });

  it('HR-9 Delkredere-Baustein nur experte UND gewählt; Retention nur experte', () => {
    expect(ids(basis({ delkredere: true }))).not.toContain('H08_delkredere');
    expect(ids(basis({ detailgrad: 'experte', delkredere: false }))).not.toContain('H08_delkredere');
    expect(ids(basis({ detailgrad: 'experte', delkredere: true, delkredereProvisionProzent: '2' }))).toContain('H08_delkredere');
    expect(ids(basis())).not.toContain('H11_retention');
    expect(ids(basis({ detailgrad: 'experte' }))).toContain('H11_retention');
  });

  it('HR-10 Pflicht-Bausteine in fester Reihenfolge', () => {
    const l = ids(basis());
    for (const id of ['H01_parteien', 'H02_taetigkeit', 'H03_vollmacht', 'H05_lohn',
      'H07_auslagen', 'H10_kuendigung', 'H12_schluss', 'H13_unterschriften']) {
      expect(l, id).toContain(id);
    }
  });

  it('HR-11 deterministisch: gleiche Eingaben → identisches Dokument', () => {
    expect(hrZusammenstellen(basis())).toEqual(hrZusammenstellen(basis()));
  });
});
