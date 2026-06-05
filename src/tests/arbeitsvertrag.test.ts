import { describe, it, expect } from 'vitest';
import {
  AV_DEFAULTS, AV_MINDESTLOEHNE, avZusammenstellen, pruefeAvGates,
  type AvAntworten,
} from '../lib/vorlagen/arbeitsvertrag';

// Akzeptanztests Einzelarbeitsvertrag — prüfen die Gutachtens-Matrix
// (zwingendes Recht, Schriftform-Klauseln, Disclosure) deterministisch.

const basis = (patch: Partial<AvAntworten> = {}): AvAntworten => ({
  ...AV_DEFAULTS,
  arbeitgeberName: 'Muster AG', arbeitgeberAdresse: 'Musterweg 1, 4051 Basel',
  arbeitnehmerVorname: 'Anna', arbeitnehmerName: 'Beispiel',
  arbeitnehmerAdresse: 'Beispielgasse 2, 4052 Basel',
  funktion: 'Sachbearbeiterin', arbeitsort: 'Basel',
  beginn: '2026-08-01', lohnBetrag: '6500',
  ort: 'Basel', datum: '2026-06-15',
  ...patch,
});

const texte = (a: AvAntworten) => avZusammenstellen(a).dokument.absaetze.map((x) => x.text).join('\n');
const ids = (a: AvAntworten) => avZusammenstellen(a).dokument.absaetze.map((x) => x.bausteinId);

describe('Arbeitsvertrag — Gates (zwingendes Recht)', () => {
  it('AT-1 Probezeit über drei Monaten blockiert (Art. 335b Abs. 2 OR)', () => {
    expect(pruefeAvGates(basis({ probezeit: 'verlaengert', probezeitMonate: 4 })).blocker.join()).toMatch(/drei Monate/);
    expect(pruefeAvGates(basis({ probezeit: 'verlaengert', probezeitMonate: 3 })).blocker).toEqual([]);
  });

  it('AT-2 Kündigungsfrist unter einem Monat blockiert; unter der Staffel nur Hinweis (Art. 335c Abs. 2 OR)', () => {
    expect(pruefeAvGates(basis({ kuendigungsfrist: 'abweichend', kuendigungsfristMonate: 0 })).blocker.join()).toMatch(/einen Monat/);
    const g = pruefeAvGates(basis({ kuendigungsfrist: 'abweichend', kuendigungsfristMonate: 2 }));
    expect(g.blocker).toEqual([]);
    expect(g.hinweise.join()).toMatch(/Staffel/);
  });

  it('AT-3 Ferienminimum: 4 Wochen, 5 Wochen bis zum vollendeten 20. Altersjahr (Art. 329a OR)', () => {
    expect(pruefeAvGates(basis({ ferienWochen: 3 })).blocker.join()).toMatch(/vier Wochen/);
    // 18-jährig bei Stellenantritt → 5 Wochen zwingend
    const jung = basis({ arbeitnehmerGeburtsdatum: '2008-01-01', ferienWochen: 4 });
    expect(pruefeAvGates(jung).blocker.join()).toMatch(/fünf Wochen/);
    expect(pruefeAvGates({ ...jung, ferienWochen: 5 }).blocker).toEqual([]);
  });

  it('AT-4 Ferienabgeltung im Stundenlohn: bei Vollzeit blockiert (BGE 149 III 202), bei Teilzeit Warnung', () => {
    const voll = basis({ lohnModell: 'stundenlohn', lohnBetrag: '35', ferienzuschlagSeparat: true, pensumProzent: 100 });
    expect(pruefeAvGates(voll).blocker.join()).toMatch(/BGE 149 III 202/);
    const teil = basis({ lohnModell: 'stundenlohn', lohnBetrag: '35', ferienzuschlagSeparat: true, pensumProzent: 60 });
    expect(pruefeAvGates(teil).blocker).toEqual([]);
    expect(pruefeAvGates(teil).warnungen.join()).toMatch(/unregelmässiger Teilzeitarbeit/);
  });

  it('AT-5 Konkurrenzverbot: ohne Einblick-Bestätigung und ohne Ort/Zeit/Gegenstand blockiert (Art. 340/340a OR)', () => {
    const ohne = basis({ konkurrenzverbot: true });
    const g = pruefeAvGates(ohne);
    expect(g.blocker.join()).toMatch(/Art\. 340 Abs\. 2 OR/);
    expect(g.blocker.join()).toMatch(/Ort, Zeit und Gegenstand|örtlicher/);
    const ok = basis({
      konkurrenzverbot: true, kvEinblickBestaetigt: true,
      kvGegenstand: 'Treuhanddienstleistungen', kvOrt: 'Kanton BS', kvDauerMonate: 12,
    });
    expect(pruefeAvGates(ok).blocker).toEqual([]);
    // über 3 Jahre → Warnung, kein Blocker
    expect(pruefeAvGates({ ...ok, kvDauerMonate: 48 }).warnungen.join()).toMatch(/drei Jahre/);
  });

  it('AT-6 Mindestlohn-Warnung: Stundenlohn unter dem kantonalen Wert (datierter Parameter)', () => {
    const ge = AV_MINDESTLOEHNE.find((m) => m.kanton === 'GE')!;
    const tief = basis({ lohnModell: 'stundenlohn', lohnBetrag: '20', arbeitsortKanton: 'GE' });
    expect(pruefeAvGates(tief).warnungen.join()).toContain(String(ge.chfProStunde.toFixed(2)));
    const hoch = basis({ lohnModell: 'stundenlohn', lohnBetrag: '30', arbeitsortKanton: 'GE' });
    expect(pruefeAvGates(hoch).warnungen.join()).not.toMatch(/Mindestlohn/);
  });

  it('AT-7 Befristung: ohne Enddatum blockiert; Vertragstext nutzt Befristungs- statt Kündigungs-Baustein', () => {
    expect(pruefeAvGates(basis({ befristet: true })).blocker.join()).toMatch(/Enddatum/);
    const b = basis({ befristet: true, befristetBis: '2027-07-31' });
    expect(ids(b)).toContain('A12_befristet_ende');
    expect(ids(b)).not.toContain('A12_kuendigung_gesetzlich');
    expect(ids(b)).not.toContain('A12_kuendigung_abweichend');
  });
});

describe('Arbeitsvertrag — Bausteine (Schriftform & Disclosure)', () => {
  it('AT-8 Standardvertrag enthält Pflicht-Bausteine in fester Reihenfolge', () => {
    const liste = ids(basis());
    for (const id of ['A01_parteien', 'A02_funktion', 'A03_arbeitsort', 'A04_probezeit_gesetzlich',
      'A05_lohn_monat', 'A07_ferien', 'A08_lohnfortzahlung_gesetzlich', 'A09_spesen_effektiv',
      'A10_treuepflicht', 'A11_datenschutz', 'A12_kuendigung_gesetzlich', 'A15_schluss', 'A16_unterschriften']) {
      expect(liste, id).toContain(id);
    }
  });

  it('AT-9 Überstunden-Wegbedingung nennt Schriftform und behält ArG-Überzeit ausdrücklich vor', () => {
    const t = texte(basis({ ueberstunden: 'inbegriffen' }));
    expect(t).toMatch(/Art\. 321c Abs\. 3 OR/);
    expect(t).toMatch(/Überzeit im Sinne des Arbeitsgesetzes/);
    expect(t).toMatch(/Art\. 13 ArG/);
  });

  it('AT-10 Gratifikation erzeugt den Freiwilligkeitsvorbehalt; 13. Monatslohn bleibt Lohnbestandteil', () => {
    const t = texte(basis({ gratifikation: true, dreizehnter: true }));
    expect(t).toMatch(/freiwillige Leistung/);
    expect(t).toMatch(/freiem Ermessen/);
    expect(t).toMatch(/13\. Monatslohn.*anteilsmässig/);
  });

  it('AT-11 Konkurrenzverbot-Baustein enthält Ort/Zeit/Gegenstand, Konventionalstrafe und Art.-340c-Wegfall', () => {
    const t = texte(basis({
      konkurrenzverbot: true, kvEinblickBestaetigt: true,
      kvGegenstand: 'Treuhand', kvOrt: 'Kantone BS und BL', kvDauerMonate: 24,
      kvKonventionalstrafeCHF: '20000', kvRealerfuellung: true,
    }));
    expect(t).toMatch(/während 2 Jahren/);
    expect(t).toMatch(/Kantone BS und BL/);
    expect(t).toMatch(/Konventionalstrafe von CHF 20'000/);
    expect(t).toMatch(/Art\. 340b Abs\. 3 OR/);
    expect(t).toMatch(/Art\. 340c Abs\. 2 OR/);
  });

  it('AT-12 deterministisch: gleiche Eingaben → identisches Dokument', () => {
    const a = basis({ konkurrenzverbot: true, kvEinblickBestaetigt: true, kvGegenstand: 'X', kvOrt: 'Y', kvDauerMonate: 6 });
    expect(avZusammenstellen(a)).toEqual(avZusammenstellen(a));
  });
});

describe('Arbeitsvertrag — Review-Befunde (Regression)', () => {
  it('AT-13 Ferienzuschlag im Monatslohn blockiert (Abwehr-Gate; UI setzt das Feld zurück)', () => {
    expect(pruefeAvGates(basis({ lohnModell: 'monatslohn', ferienzuschlagSeparat: true })).blocker.join())
      .toMatch(/Monatslohn/);
  });

  it('AT-14 KTG-Gleichwertigkeit: 70 % warnt, 80 %/730 Tage nicht (Art. 324a Abs. 4 OR)', () => {
    expect(pruefeAvGates(basis({ lohnfortzahlung: 'ktg', ktgProzent: 70, ktgTage: 730 })).warnungen.join())
      .toMatch(/gleichwertig/);
    expect(pruefeAvGates(basis({ lohnfortzahlung: 'ktg', ktgProzent: 80, ktgTage: 730 })).warnungen)
      .toEqual([]);
  });

  it('AT-15 kein Deadlock: Befristung neutralisiert das Kündigungsfrist-Gate (B1)', () => {
    const g = pruefeAvGates(basis({ befristet: true, befristetBis: '2027-01-31', kuendigungsfrist: 'abweichend', kuendigungsfristMonate: 0 }));
    expect(g.blocker).toEqual([]);
  });

  it('AT-16 kvDauerText: Singular/Jahres-Formen korrekt (B3)', () => {
    const kv = (m: number) => texte(basis({
      konkurrenzverbot: true, kvEinblickBestaetigt: true,
      kvGegenstand: 'X', kvOrt: 'Y', kvDauerMonate: m,
    }));
    expect(kv(1)).toMatch(/während einem Monat /);
    expect(kv(12)).toMatch(/während einem Jahr /);
    expect(kv(24)).toMatch(/während 2 Jahren /);
    expect(kv(6)).toMatch(/während 6 Monaten /);
  });
});
