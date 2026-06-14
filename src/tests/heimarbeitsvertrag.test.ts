import { describe, it, expect } from 'vitest';
import {
  HA_DEFAULTS, haZusammenstellen, pruefeHaGates, type HaAntworten,
} from '../lib/vorlagen/heimarbeitsvertrag';

// Akzeptanztests Heimarbeitsvertrag (Art. 351–354 OR) – Sonderregime.

const basis = (patch: Partial<HaAntworten> = {}): HaAntworten => ({
  ...HA_DEFAULTS,
  arbeitgeberName: 'Muster AG', arbeitgeberAdresse: 'Musterweg 1, 8000 Zürich',
  heimarbeiterVorname: 'Heidi', heimarbeiterName: 'Beispiel', heimarbeiterAdresse: 'Heimgasse 2, 8400 Winterthur',
  arbeitsbeschrieb: 'Konfektionierung von Verpackungen', lohnAngabe: '4.50', lohnEinheit: 'pro Stück',
  ort: 'Zürich', datum: '2026-06-15',
  ...patch,
});

const texte = (a: HaAntworten) => haZusammenstellen(a).ergebnis.dokument.absaetze.map((x) => x.text).join('\n');
const ids = (a: HaAntworten) => haZusammenstellen(a).ergebnis.dokument.absaetze.map((x) => x.bausteinId);

describe('Heimarbeitsvertrag – Gates & Hinweise', () => {
  it('HA-1 Bekanntgabe vor Ausgabe (351a) und Wochen-Prüffrist (353) stets als Hinweis', () => {
    const h = pruefeHaGates(basis()).hinweise.join('\n');
    expect(h).toMatch(/Art\. 351a OR/);
    expect(h).toMatch(/innert einer Woche.*Art\. 353 OR/s);
  });

  it('HA-2 Heimarbeiter beschafft Material ohne Entschädigung → Warnung (351a Abs. 2)', () => {
    expect(pruefeHaGates(basis({ materialBeschafftHeimarbeiter: true, materialEntschaedigung: '' })).warnungen.join())
      .toMatch(/Art\. 351a Abs\. 2 OR/);
    expect(pruefeHaGates(basis({ materialBeschafftHeimarbeiter: true, materialEntschaedigung: 'CHF 0.20 pro Stück' })).warnungen)
      .toEqual([]);
  });

  it('HA-3 ununterbrochener Dienst → Lohn nach 324/324a, unbefristet vermutet (353b/354)', () => {
    expect(pruefeHaGates(basis({ ununterbrochen: true })).hinweise.join()).toMatch(/Art\. 324 und 324a OR/);
    expect(pruefeHaGates(basis({ ununterbrochen: false })).hinweise.join()).toMatch(/keine Lohnpflicht/);
  });
});

describe('Heimarbeitsvertrag – Bausteine', () => {
  it('HA-4 Material-Baustein nur bei vom Arbeitgeber gestelltem Material (352a)', () => {
    expect(ids(basis({ materialVomArbeitgeber: true }))).toContain('HA05_material');
    expect(ids(basis({ materialVomArbeitgeber: false }))).not.toContain('HA05_material');
    expect(texte(basis({ materialVomArbeitgeber: true }))).toMatch(/höchstens für den Ersatz der Selbstkosten/);
  });

  it('HA-5 Lohnzahlung je Dienstart: ununterbrochen halbmonatlich/Monatsende, sonst bei Ablieferung (353a)', () => {
    expect(texte(basis({ ununterbrochen: true }))).toMatch(/halbmonatlich oder mit Zustimmung/);
    expect(texte(basis({ ununterbrochen: false }))).toMatch(/bei Ablieferung des Arbeitserzeugnisses/);
    expect(texte(basis())).toMatch(/CHF 4\.50 pro Stück/);
  });

  it('HA-6 Verhinderungs-Baustein nur bei ununterbrochenem Dienst (353b)', () => {
    expect(ids(basis({ ununterbrochen: true }))).toContain('HA08_verhinderung');
    expect(ids(basis({ ununterbrochen: false }))).not.toContain('HA08_verhinderung');
  });

  it('HA-7 Dauer-Vermutung: Probe / ununterbrochen unbefristet / sonst befristet (354)', () => {
    expect(texte(basis({ probearbeit: true }))).toMatch(/zur Probe eingegangen \(Art\. 354 Abs\. 1 OR\)/);
    expect(texte(basis({ ununterbrochen: true, probearbeit: false }))).toMatch(/auf unbestimmte Zeit eingegangen/);
    expect(texte(basis({ ununterbrochen: false, probearbeit: false }))).toMatch(/auf bestimmte Zeit eingegangen/);
  });

  it('HA-8 einfach blendet die Ausführungs-Klausel aus; experte ergänzt den HArG-Hinweis', () => {
    expect(ids(basis({ detailgrad: 'einfach' }))).not.toContain('HA06_ausfuehrung');
    expect(ids(basis())).not.toContain('HA10_harg');
    expect(ids(basis({ detailgrad: 'experte' }))).toContain('HA10_harg');
  });

  it('HA-9 Pflicht-Bausteine in fester Reihenfolge', () => {
    const l = ids(basis());
    for (const id of ['HA01_parteien', 'HA02_gegenstand', 'HA03_bekanntgabe', 'HA04_lohn',
      'HA07_pruefung', 'HA09_dauer', 'HA11_schluss', 'HA12_unterschriften']) {
      expect(l, id).toContain(id);
    }
  });

  it('HA-10 deterministisch: gleiche Eingaben → identisches Dokument', () => {
    expect(haZusammenstellen(basis())).toEqual(haZusammenstellen(basis()));
  });
});
