import { describe, it, expect } from 'vitest';
import { assemble, erfuellt } from '../lib/vorlagen/engine';
import type { VorlageSchema } from '../lib/vorlagen/engine';
import {
  TESTAMENT_DEFAULTS, TESTAMENT_SCHEMA, testamentZusammenstellen, pruefeGates,
  type TestamentAntworten,
} from '../lib/vorlagen/testament';

// ─── Engine (generisch) ──────────────────────────────────────────────────────

const MINI: VorlageSchema = {
  id: 'mini', version: '1', titel: 'Mini', disclaimer: 'D',
  bausteine: [
    { id: 'a', text: 'Hallo {{name}}.', begruendung: 'immer' },
    { id: 'b', text: 'Nur wenn x.', includeIf: { feld: 'x', eq: true }, nummeriert: true, begruendung: 'x gewählt' },
    { id: 'c', text: '– {{item.t}}', wiederholeUeber: 'liste', includeIf: { feld: 'liste', nichtLeer: true }, begruendung: 'liste' },
    { id: 'd', text: 'Datum: {{datum}}.', nummeriert: true, begruendung: 'immer', norm: 'Art. 1 OR' },
  ],
};

describe('Vorlagen-Engine', () => {
  it('ist deterministisch: gleiche Antworten ⇒ identisches Dokument', () => {
    const a = { name: 'Anna', x: true, liste: [{ t: 'eins' }, { t: 'zwei' }], datum: '2026-06-04' };
    const r1 = JSON.stringify(assemble(MINI, a));
    const r2 = JSON.stringify(assemble(MINI, a));
    expect(r1).toBe(r2);
  });

  it('wertet includeIf-Bedingungen aus (eq/in/nichtLeer/and/or/not)', () => {
    expect(erfuellt({ feld: 'x', eq: 1 }, { x: 1 })).toBe(true);
    expect(erfuellt({ feld: 'x', in: [1, 2] }, { x: 2 })).toBe(true);
    expect(erfuellt({ feld: 'l', nichtLeer: true }, { l: [] })).toBe(false);
    expect(erfuellt({ feld: 's', nichtLeer: true }, { s: '  ' })).toBe(false);
    expect(erfuellt({ and: [{ feld: 'x', eq: 1 }, { not: { feld: 'y', eq: 2 } }] }, { x: 1, y: 3 })).toBe(true);
    expect(erfuellt({ or: [{ feld: 'x', eq: 9 }, { feld: 'y', eq: 2 }] }, { x: 1, y: 2 })).toBe(true);
  });

  it('interpoliert Platzhalter, formatiert ISO-Daten, lässt Lücken sichtbar', () => {
    const r = assemble(MINI, { name: 'Anna', datum: '2026-06-04' });
    expect(r.dokument.absaetze[0].text).toBe('Hallo Anna.');
    expect(r.dokument.absaetze.at(-1)!.text).toContain('04.06.2026');
    const leer = assemble(MINI, {});
    expect(leer.dokument.absaetze[0].text).toBe('Hallo ________.');
  });

  it('wiederholt Listen-Bausteine je Eintrag und nummeriert fortlaufend', () => {
    const r = assemble(MINI, { x: true, liste: [{ t: 'eins' }, { t: 'zwei' }] });
    expect(r.dokument.absaetze.find((a) => a.bausteinId === 'c')!.text).toBe('– eins\n– zwei');
    expect(r.dokument.absaetze.find((a) => a.bausteinId === 'b')!.text).toMatch(/^1\. /);
    expect(r.dokument.absaetze.find((a) => a.bausteinId === 'd')!.text).toMatch(/^2\. /);
  });

  it('führt das Bausteinprotokoll mit Auslöser und Norm', () => {
    const r = assemble(MINI, { x: true });
    expect(r.aufgenommen).toEqual(['a', 'b', 'd']);
    expect(r.protokoll.find((p) => p.bausteinId === 'b')!.begruendung).toBe('x gewählt');
    expect(r.protokoll.find((p) => p.bausteinId === 'd')!.norm).toBe('Art. 1 OR');
  });
});

// ─── Testament-Schema ────────────────────────────────────────────────────────

const basis = (over: Partial<TestamentAntworten>): TestamentAntworten => ({
  ...TESTAMENT_DEFAULTS,
  vorname: 'Anna', nachname: 'Muster', geburtsdatum: '1990-04-12',
  heimatort: 'Basel BS', adresse: 'Musterweg 1, 4051 Basel',
  datumErrichtung: '2026-06-04',
  ...over,
});

describe('Vorlage Eigenhändiges Testament', () => {
  it('Minimalfall: Identifikation, Widerruf und Schlussformel', () => {
    const r = testamentZusammenstellen(basis({}));
    expect(r.aufgenommen).toEqual(['C01_titel', 'C02_widerruf', 'C12_schlussformel']);
    expect(r.dokument.absaetze[0].text).toContain('Anna Muster');
    expect(r.dokument.absaetze[0].text).toContain('12.04.1990');
    expect(r.dokument.absaetze.at(-1)!.text).toContain('den 04.06.2026');
    expect(r.dokument.absaetze.at(-1)!.text).toContain('eigenhändige Unterschrift');
  });

  it('Erben mit Quote und Ersatz erzeugen C03/C03b/C05', () => {
    const r = testamentZusammenstellen(basis({
      erben: [
        { name: 'Ben Muster', angaben: 'geb. 01.01.2015', quoteProzent: 60, ersatz: 'Clara Muster' },
        { name: 'Dora Beispiel', angaben: 'geb. 02.02.1980', quoteProzent: 40 },
      ],
    }));
    expect(r.aufgenommen).toContain('C03_erbeinsetzung');
    const liste = r.dokument.absaetze.find((x) => x.bausteinId === 'C03b_erbenliste')!.text;
    expect(liste).toContain('Ben Muster');
    expect(liste).toContain('60 %');
    expect(liste).toContain('Dora Beispiel');
    const ersatz = r.dokument.absaetze.find((x) => x.bausteinId === 'C05_ersatz_erben')!.text;
    expect(ersatz).toContain('Clara Muster');
    expect(ersatz).not.toContain('Dora'); // nur Erben MIT Ersatz
  });

  it('Vermächtnis und Willensvollstreckung nur bei Erfassung', () => {
    const ohne = testamentZusammenstellen(basis({}));
    expect(ohne.aufgenommen).not.toContain('C04_vermaechtnis');
    expect(ohne.aufgenommen).not.toContain('C09_willensvollstrecker');
    const mit = testamentZusammenstellen(basis({
      vermaechtnisse: [{ empfaenger: 'Verein X', gegenstand: 'CHF 5’000' }],
      willensvollstrecker: 'RA Lic. iur. Y',
      willensvollstreckerErsatz: 'Notariat Z',
    }));
    expect(mit.aufgenommen).toEqual(expect.arrayContaining(['C04_vermaechtnis', 'C04b_vermaechtnisliste', 'C09_willensvollstrecker', 'C09b_wv_ersatz']));
  });

  it('Widerruf abwählbar (C02 entfällt)', () => {
    const r = testamentZusammenstellen(basis({ widerruf: false }));
    expect(r.aufgenommen).not.toContain('C02_widerruf');
  });

  it('Nummerierung läuft über die aufgenommenen Bausteine', () => {
    const r = testamentZusammenstellen(basis({
      erben: [{ name: 'B', angaben: 'g', quoteProzent: 100 }],
      willensvollstrecker: 'W',
    }));
    expect(r.dokument.absaetze.find((x) => x.bausteinId === 'C02_widerruf')!.text).toMatch(/^1\. /);
    expect(r.dokument.absaetze.find((x) => x.bausteinId === 'C03_erbeinsetzung')!.text).toMatch(/^2\. /);
    expect(r.dokument.absaetze.find((x) => x.bausteinId === 'C09_willensvollstrecker')!.text).toMatch(/^3\. /);
  });

  it('jeder Baustein trägt Begründung und Norm (Bausteinprotokoll vollständig)', () => {
    TESTAMENT_SCHEMA.bausteine.forEach((b) => {
      expect(b.begruendung.length, b.id).toBeGreaterThan(5);
      expect(b.norm, b.id).toBeTruthy();
    });
  });

  it('GATE-1: Minderjährigkeit blockiert (Art. 467 ZGB)', () => {
    const g = pruefeGates(basis({ geburtsdatum: '2010-01-01' }));
    expect(g.blocker.some((b) => b.includes('467'))).toBe(true);
  });

  it('GATE-3: fehlendes Errichtungsdatum blockiert', () => {
    const g = pruefeGates(basis({ datumErrichtung: '' }));
    expect(g.blocker.some((b) => b.includes('505'))).toBe(true);
  });

  it('GATE-6: Quotensumme ≠ 100 % warnt (kein Block)', () => {
    const g = pruefeGates(basis({ erben: [{ name: 'B', angaben: 'g', quoteProzent: 80 }] }));
    expect(g.blocker).toEqual([]);
    expect(g.warnungen.some((w) => w.includes('80'))).toBe(true);
  });

  it('Art. 472: hängige Scheidung mit qualifiziertem Verfahren warnt', () => {
    const g = pruefeGates(basis({ zivilstand: 'verheiratet', scheidungHaengig: true, scheidungTyp: 'getrennt_min_2_jahre' }));
    expect(g.warnungen.some((w) => w.includes('472'))).toBe(true);
  });
});

describe('Vorlagen-Engine — Nummerierung (Bug-Check)', () => {
  it('leere Wiederholungsliste erzeugt keine Nummerierungs-Lücke', () => {
    const schema: VorlageSchema = {
      id: 's', version: '1', titel: 'T', disclaimer: 'D',
      bausteine: [
        { id: 'a', text: 'A', nummeriert: true, begruendung: 'x' },
        { id: 'b', text: '– {{item.t}}', nummeriert: true, wiederholeUeber: 'leer', begruendung: 'x' },
        { id: 'c', text: 'C', nummeriert: true, begruendung: 'x' },
      ],
    };
    const r = assemble(schema, { leer: [] });
    expect(r.dokument.absaetze.map((x) => x.text)).toEqual(['1. A', '2. C']);
  });
});

// ─── Patientenverfügung ──────────────────────────────────────────────────────

import {
  PV_DEFAULTS, PV_DEFAULT_MASSNAHMEN, PV_SCHEMA, pvZusammenstellen, pruefePvGates, zielDefaults,
  type PvAntworten,
} from '../lib/vorlagen/patientenverfuegung';

const pv = (over: Partial<PvAntworten>): PvAntworten => ({
  ...PV_DEFAULTS,
  vorname: 'Anna', name: 'Muster', geburtsdatum: '1990-04-12', wohnort: 'Musterweg 1, 4051 Basel',
  massnahmen: { ...PV_DEFAULT_MASSNAHMEN, ...(over.massnahmen ?? {}) },
  ...over,
});

describe('Vorlage Patientenverfügung', () => {
  it('Minimalfall: Identifikation, Palliativ-Baustein (immer), Ersetzen, Schlussformel', () => {
    const r = pvZusammenstellen(pv({}));
    expect(r.aufgenommen).toEqual(['P01_identifikation', 'P06_palliativ', 'P11_ersetzt', 'P12_schluss']);
    expect(r.dokument.absaetze[0].text).toContain('Anna Muster');
    const schluss = r.dokument.absaetze.at(-1)!.text;
    expect(schluss).toContain('Datum (von Hand einzusetzen)');
    expect(schluss).toContain('eigenhändige Unterschrift');
  });

  it('Situationen, Ziel und entschiedene Massnahmen erscheinen; «keine Angabe» nicht', () => {
    const r = pvZusammenstellen(pv({
      situationen: ['terminal', 'komaWachkoma'],
      ziel: 'palliativ',
      massnahmen: { ...PV_DEFAULT_MASSNAHMEN, cpr: 'ablehnen', antibiotika: 'nur_befristet' },
    }));
    expect(r.aufgenommen).toEqual(expect.arrayContaining(['P03_situationen', 'P04_ziel', 'P05_massnahmen']));
    const liste = r.dokument.absaetze.find((x) => x.bausteinId === 'P05b_massnahmenliste')!.text;
    expect(liste).toContain('Wiederbelebung');
    expect(liste).toContain('Ich lehne ab');
    expect(liste).toContain('nur befristet, als therapeutischer Versuch'.slice(4, 20)); // Teilstring
    expect(liste).not.toContain('Dialyse');
  });

  it('Vertretungsperson zieht Schweigepflicht-Entbindung automatisch nach (R5); Ersatz/Weisungen bedingt', () => {
    const ohne = pvZusammenstellen(pv({}));
    expect(ohne.aufgenommen).not.toContain('P08_schweigepflicht');
    const mit = pvZusammenstellen(pv({ vertretungName: 'Ben Muster', vertretungWeisungen: 'Keine Heroik.', ersatzName: 'Clara' }));
    expect(mit.aufgenommen).toEqual(expect.arrayContaining(['P07_vertretung', 'P07b_weisungen', 'P07c_ersatz', 'P08_schweigepflicht']));
  });

  it('Organspende: Zustimmung mit vorbereitenden Massnahmen / Ablehnung', () => {
    const ja = pvZusammenstellen(pv({ organspende: 'ja', organspendeVorbereitend: true }));
    expect(ja.dokument.absaetze.find((x) => x.bausteinId === 'P10_organspende')!.text).toContain('vorbereitenden medizinischen Massnahmen');
    const nein = pvZusammenstellen(pv({ organspende: 'nein' }));
    expect(nein.dokument.absaetze.find((x) => x.bausteinId === 'P10_organspende')!.text).toContain('lehne');
  });

  it('R6: Sterbehilfe-Anordnung im Freitext blockiert hart (Art. 114/115 StGB)', () => {
    const g = pruefePvGates(pv({ einstellungLeben: 'Ich wünsche aktive Sterbehilfe durch meinen Arzt.' }));
    expect(g.blocker.length).toBe(1);
    expect(g.blocker[0]).toContain('114');
    expect(pruefePvGates(pv({ vertretungWeisungen: 'Bitte Suizidhilfe organisieren', vertretungName: 'B' })).blocker.length).toBe(1);
    expect(pruefePvGates(pv({ einstellungLeben: 'Leidenslinderung ist mir wichtig.' })).blocker).toEqual([]);
  });

  it('R2: Widerspruch maximale Lebenserhaltung ↔ Ablehnung CPR/Beatmung warnt', () => {
    const g = pruefePvGates(pv({ ziel: 'maximal', massnahmen: { ...PV_DEFAULT_MASSNAHMEN, cpr: 'ablehnen' } }));
    expect(g.warnungen.some((w) => w.includes('Widerspruch'))).toBe(true);
  });

  it('R1: Palliativ-Ziel setzt Defaults nur für offene Massnahmen', () => {
    const m = zielDefaults('palliativ', { ...PV_DEFAULT_MASSNAHMEN, cpr: 'zustimmen' });
    expect(m.cpr).toBe('zustimmen');       // getroffener Entscheid bleibt
    expect(m.beatmung).toBe('ablehnen');   // offen → Default
    expect(m.dialyse).toBe('ablehnen');
    expect(m.antibiotika).toBe('keine_angabe'); // nicht Teil der R1-Defaults
  });

  it('R3/R7: Kaskaden-Hinweis ohne Vertretung; Hinweis bei psychischer Störung', () => {
    const g = pruefePvGates(pv({ psychischeStoerungKontext: true }));
    expect(g.hinweise.some((h) => h.includes('378'))).toBe(true);
    expect(g.hinweise.some((h) => h.includes('433'))).toBe(true);
  });

  it('jeder Baustein trägt Begründung und Norm', () => {
    PV_SCHEMA.bausteine.forEach((b) => {
      expect(b.begruendung.length, b.id).toBeGreaterThan(5);
      expect(b.norm, b.id).toBeTruthy();
    });
  });
});

// ─── Vorsorgeauftrag ─────────────────────────────────────────────────────────

import {
  VA_DEFAULTS, VA_SCHEMA, vaZusammenstellen, pruefeVaGates,
  type VaAntworten,
} from '../lib/vorlagen/vorsorgeauftrag';

const va = (over: Partial<VaAntworten>): VaAntworten => ({
  ...VA_DEFAULTS,
  volljaehrig: true, urteilsfaehigBestaetigt: true, keineUmfassendeBeistandschaft: true,
  vorname: 'Anna', nachname: 'Muster', geburtsdatum: '1960-04-12',
  heimatort: 'Basel BS', adresse: 'Musterweg 1, 4051 Basel',
  beauftragte: [{ name: 'Ben Muster', typ: 'natuerlich', angaben: 'geb. 01.01.1985', bereiche: ['personensorge', 'vermoegenssorge', 'rechtsverkehr'] }],
  module: { personensorge: ['wohnsituation'], vermoegenssorge: ['verwaltung'], rechtsverkehr: ['behoerden'] },
  datum: '2026-06-04',
  ...over,
  ...(over.module ? { module: { ...{ personensorge: [], vermoegenssorge: [], rechtsverkehr: [] }, ...over.module } } : {}),
});

describe('Vorlage Vorsorgeauftrag', () => {
  it('Grundfall: Identifikation, Beauftragte, drei Bereichs-Module, eigenhändige Schlussformel', () => {
    const r = vaZusammenstellen(va({}));
    expect(r.aufgenommen).toEqual(expect.arrayContaining([
      'V01_identifikation', 'V02_beauftragte', 'V04_personensorge', 'V05_vermoegenssorge',
      'V06_rechtsverkehr', 'V13_ersetzt', 'V14_schluss_eigenhaendig',
    ]));
    expect(r.aufgenommen).not.toContain('V14_schluss_beurkundung');
    expect(r.dokument.absaetze.at(-1)!.text).toContain('den 04.06.2026');
    expect(r.dokument.absaetze.find((x) => x.bausteinId === 'V02b_beauftragteliste')!.text)
      .toContain('Personensorge, Vermögenssorge, Vertretung im Rechtsverkehr');
  });

  it('formMode beurkundet: Beurkundungs-Schluss statt Unterschriftszeile', () => {
    const r = vaZusammenstellen(va({ formMode: 'oeffentlich_beurkundet', datum: '' }));
    expect(r.aufgenommen).toContain('V14_schluss_beurkundung');
    expect(r.aufgenommen).not.toContain('V14_schluss_eigenhaendig');
    expect(r.dokument.absaetze.at(-1)!.text).toContain('Urkundsperson');
  });

  it('Liegenschaften-Modul erzwingt die Grundstück-Sondervollmacht (Art. 396 Abs. 3 OR)', () => {
    const ohne = vaZusammenstellen(va({}));
    expect(ohne.aufgenommen).not.toContain('V07_grundstueck');
    const mit = vaZusammenstellen(va({ module: { personensorge: [], vermoegenssorge: ['liegenschaften'], rechtsverkehr: [] } }));
    expect(mit.aufgenommen).toContain('V07_grundstueck');
    expect(mit.protokoll.find((p) => p.bausteinId === 'V07_grundstueck')!.hinweis).toContain('umstritten');
  });

  it('Bereichs-Module erscheinen nur, wenn der Bereich auch übertragen ist', () => {
    const r = vaZusammenstellen(va({
      beauftragte: [{ name: 'Ben', typ: 'natuerlich', angaben: 'x', bereiche: ['vermoegenssorge'] }],
      module: { personensorge: ['wohnsituation'], vermoegenssorge: ['verwaltung'], rechtsverkehr: [] },
    }));
    expect(r.aufgenommen).toContain('V05_vermoegenssorge');
    expect(r.aufgenommen).not.toContain('V04_personensorge'); // Module gewählt, Bereich aber nicht übertragen
  });

  it('Entschädigungs-Varianten erzeugen die passende Klausel', () => {
    const pausch = vaZusammenstellen(va({ entschaedigung: 'pauschale', entschaedigungBetrag: 5000 }));
    expect(pausch.dokument.absaetze.find((x) => x.bausteinId === 'V11_entschaedigung')!.text).toContain('CHF 5000 pro Jahr');
    const keine = vaZusammenstellen(va({ entschaedigung: 'keine_angabe' }));
    expect(keine.aufgenommen).not.toContain('V11_entschaedigung');
  });

  it('Eligibility-Gate blockiert ohne Handlungsfähigkeits-Bestätigung (Art. 13 ZGB)', () => {
    const g = pruefeVaGates(va({ urteilsfaehigBestaetigt: false }));
    expect(g.blocker.some((b) => b.includes('Handlungsfähigkeit'))).toBe(true);
  });

  it('medizinische Vertretung durch juristische Person blockiert', () => {
    const g = pruefeVaGates(va({
      beauftragte: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel', bereiche: ['personensorge'] }],
      module: { personensorge: ['medizin'], vermoegenssorge: [], rechtsverkehr: [] },
    }));
    expect(g.blocker.some((b) => b.includes('NATÜRLICHEN'))).toBe(true);
  });

  it('ohne beauftragte Person blockiert; KESB-Validierungs-Hinweis immer', () => {
    const g = pruefeVaGates(va({ beauftragte: [] }));
    expect(g.blocker.some((b) => b.includes('360'))).toBe(true);
    expect(g.hinweise.some((h) => h.includes('363'))).toBe(true);
  });

  it('jeder Baustein trägt Begründung und Norm', () => {
    VA_SCHEMA.bausteine.forEach((b) => {
      expect(b.begruendung.length, b.id).toBeGreaterThan(5);
      expect(b.norm, b.id).toBeTruthy();
    });
  });
});

// ─── DOCX-Renderer (Teil II «Ausgabe & Export») ──────────────────────────────

import { docxAbsaetze } from '../lib/vorlagen/vorlagenDocx';
import { BANNER_UNTERSCHREIBEN } from '../lib/vorlagen/vorlagenPdf';

describe('Vorlagen-DOCX (eine Quelle, mehrere Renderer)', () => {
  it('deterministisch und inhaltsgleich mit dem Dokumentmodell (inkl. Banner)', () => {
    const e = pvZusammenstellen(pv({ situationen: ['terminal'], ziel: 'palliativ' }));
    const a1 = docxAbsaetze(e, BANNER_UNTERSCHREIBEN);
    const a2 = docxAbsaetze(e, BANNER_UNTERSCHREIBEN);
    expect(JSON.stringify(a1)).toBe(JSON.stringify(a2));
    // Formhinweis sichtbar im Kopf
    expect(a1[0]).toEqual({ typ: 'banner-titel', text: BANNER_UNTERSCHREIBEN.titel });
    // Jeder Modell-Absatz erscheint im DOCX (identischer Inhalt)
    const texte = a1.map((x) => x.text).join('\n');
    e.dokument.absaetze.forEach((abs) => {
      abs.text.split('\n').forEach((zeile) => expect(texte).toContain(zeile));
      if (abs.ueberschrift) expect(texte).toContain(abs.ueberschrift);
    });
    expect(texte).toContain(e.dokument.titel);
    expect(texte).toContain(e.dokument.disclaimer);
    expect(texte).toContain(`Bausteine v${e.dokument.version}`);
  });
});
