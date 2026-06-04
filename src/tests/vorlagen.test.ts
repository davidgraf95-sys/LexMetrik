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
