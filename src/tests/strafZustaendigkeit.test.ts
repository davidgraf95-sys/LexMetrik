import { describe, it, expect } from 'vitest';
import { bestimmeStrafZustaendigkeit, type StrafInput } from '../lib/strafZustaendigkeit';

// Akzeptanztests Straf-Engine (Task 7b, 6.6.2026). Grundlage: StPO-Regelwerk
// (Decision Tree + 22-Zeilen-Konstellationstabelle, verbatim Stand 1.1.2024);
// Art. 301 StPO / Art. 31 StGB am 6.6.2026 verbatim verifiziert.

const basis = (extra: Partial<StrafInput> = {}): StrafInput => ({
  anliegen: 'anzeige', tatort: 'bekannt', ...extra,
});

describe('Forum-Kaskade (Art. 31–37)', () => {
  it('Grundsatz Tatort · nur Erfolgsort · Prioritätsprinzip · Art.-32-Kaskade', () => {
    expect(bestimmeStrafZustaendigkeit(basis()).forum.normen[0].artikel).toBe('Art. 31 Abs. 1 StPO');
    expect(bestimmeStrafZustaendigkeit(basis({ tatort: 'nur_erfolgsort' })).forum.text).toContain('ERFOLGSORTES');
    expect(bestimmeStrafZustaendigkeit(basis({ tatort: 'mehrere_orte' })).forum.text).toContain('ERSTEN VERFOLGUNGSHANDLUNGEN');
    const k = bestimmeStrafZustaendigkeit(basis({ tatort: 'ausland_oder_ungewiss', kaskade32: 'ergreifungsort' }));
    expect(k.forum.text).toContain('ERGREIFUNG');
    expect(k.forum.normen[0].artikel).toBe('Art. 32 StPO');
  });
  it('Spezialforen gehen vor: Medien 35 · SchKG-Delikt 36 I · Unternehmen 36 II · Einziehung 37', () => {
    expect(bestimmeStrafZustaendigkeit(basis({ spezialforum: 'medien' })).forum.normen[0].artikel).toBe('Art. 35 StPO');
    expect(bestimmeStrafZustaendigkeit(basis({ spezialforum: 'schkg_delikt' })).forum.text).toMatch(/Schuldner/);
    expect(bestimmeStrafZustaendigkeit(basis({ spezialforum: 'unternehmen' })).forum.text).toContain('SITZ DES UNTERNEHMENS');
    expect(bestimmeStrafZustaendigkeit(basis({ spezialforum: 'einziehung', tatort: 'ausland_oder_ungewiss' })).forum.normen[0].artikel).toBe('Art. 37 StPO');
  });
  it('Beteiligung (33) und Tatmehrheit (34: abstrakt schwerste Strafdrohung) als Weichen', () => {
    expect(bestimmeStrafZustaendigkeit(basis({ beteiligung: 'teilnehmer' })).weichen.some((w) => w.includes('Täterschaft'))).toBe(true);
    const m = bestimmeStrafZustaendigkeit(basis({ mehrereTatenVerschOrte: true }));
    expect(m.weichen.some((w) => w.includes('SCHWERSTEN STRAFE'))).toBe(true);
    expect(m.weichen.some((w) => w.includes('GETRENNT'))).toBe(true);
  });
});

describe('Verfahrens-Weichen + Fahrplan + Fristen', () => {
  it('38/40/41/42 immer offengelegt; interkantonaler Konflikt → BStGer-Beschwerdekammer', () => {
    const r = bestimmeStrafZustaendigkeit(basis());
    expect(r.weichen.some((w) => w.includes('Art. 38 Abs. 1'))).toBe(true);
    expect(r.weichen.some((w) => w.includes('10 Tagen'))).toBe(true);
    expect(r.weichen.some((w) => w.includes('perpetuatio fori'))).toBe(true);
    const g = bestimmeStrafZustaendigkeit(basis({ anliegen: 'gerichtsstand' }));
    expect(g.fahrplan.some((s) => s.text.includes('Bundesstrafgerichts'))).toBe(true);
  });
  it('Anzeige: formfrei bei jeder Behörde (301/39); Antragsdelikt → 3-Monats-Frist (Art. 31 StGB, kritisch)', () => {
    const r = bestimmeStrafZustaendigkeit(basis({ antragsdelikt: true }));
    expect(r.fahrplan[0].text).toContain('schriftlich oder mündlich');
    expect(r.fahrplan.some((s) => s.text.includes('Art. 39'))).toBe(true);
    expect(r.fristen[0]).toMatchObject({ norm: 'Art. 31 StGB', kritisch: true });
    expect(r.fristen[0].frist).toContain('3 Monate');
    expect(bestimmeStrafZustaendigkeit(basis()).fristen.length).toBe(0);
  });
  it('Übertretung → Übertretungsstrafbehörde (17/357); Bund-Weiche → BA-Warnung (23/24)', () => {
    expect(bestimmeStrafZustaendigkeit(basis({ uebertretung: true })).behoerdeTyp).toContain('ÜBERTRETUNGSSTRAFBEHÖRDE');
    const b = bestimmeStrafZustaendigkeit(basis({ moeglichesBundesdelikt: true }));
    expect(b.warnungen.some((w) => w.includes('BUNDESGERICHTSBARKEIT'))).toBe(true);
  });
});

describe('Staatsanwaltschaften-Datenschicht', () => {
  it('alle 26 Kantone + BA; Doppelcheck-Korrekturen drin (SZ Schmiedgasse, AG Frey-Herosé, VD Renens)', async () => {
    const { STAATSANWALTSCHAFTEN, BUNDESANWALTSCHAFT } = await import('../data/staatsanwaltschaften');
    const { KANTONE } = await import('../lib/kantone');
    for (const k of KANTONE) {
      expect(STAATSANWALTSCHAFTEN[k], k).toBeDefined();
      expect(STAATSANWALTSCHAFTEN[k].plzOrt, k).toMatch(/^\d{4} /);
    }
    expect(STAATSANWALTSCHAFTEN.SZ.strasse).toContain('Schmiedgasse 21');
    expect(STAATSANWALTSCHAFTEN.AG.strasse).toContain('Frey-Herosé');
    expect(STAATSANWALTSCHAFTEN.VD.plzOrt).toContain('Renens');
    expect(STAATSANWALTSCHAFTEN.BL.plzOrt).toContain('Muttenz');
    expect(BUNDESANWALTSCHAFT.strasse).toBe('Guisanplatz 1');
  });
});

describe('Art.-32-Kaskade vollständig (Abschluss-Review-Fix 6.6.2026)', () => {
  it('gewöhnlicher Aufenthalt ist eigene Abs.-1-Stufe vor dem Heimatort', () => {
    const a = bestimmeStrafZustaendigkeit({ anliegen: 'gerichtsstand', tatort: 'ausland_oder_ungewiss', kaskade32: 'aufenthalt' });
    expect(a.forum.text).toContain('GEWÖHNLICHEN AUFENTHALTS');
    const h = bestimmeStrafZustaendigkeit({ anliegen: 'gerichtsstand', tatort: 'ausland_oder_ungewiss', kaskade32: 'heimatort' });
    expect(h.forum.text).toContain('weder Wohnsitz noch gewöhnlicher Aufenthalt');
  });
});

describe('Oberholzer-Vertiefung 6.6.2026 (N 239–330)', () => {
  it('Mittäter+Tatmehrheit kombiniert 33 II + 34 I; Verfahrenseinheits-Weiche 29/30; JStPO-Warnung', () => {
    const k = bestimmeStrafZustaendigkeit({ anliegen: 'gerichtsstand', tatort: 'bekannt', beteiligung: 'mittaeter', mehrereTatenVerschOrte: true });
    expect(k.weichen.some((w) => w.includes('Art. 33 Abs. 2 und Art. 34 Abs. 1'))).toBe(true);
    expect(k.weichen.some((w) => w.includes('VERFAHRENSEINHEIT'))).toBe(true);
    const j = bestimmeStrafZustaendigkeit({ anliegen: 'anzeige', tatort: 'bekannt', beschuldigteMinderjaehrig: true });
    expect(j.warnungen.some((w) => w.includes('Art. 10 JStPO') || w.includes('JUGENDSTRAF'))).toBe(true);
    expect(j.normverweise.some((n) => n.artikel === 'Art. 10 JStPO')).toBe(true);
  });
  it('Medien-Antragsdelikt-Wahlrecht (35 II); Gesamtstrafe 34 III; BStGer abschliessend', () => {
    const m = bestimmeStrafZustaendigkeit({ anliegen: 'anzeige', tatort: 'bekannt', spezialforum: 'medien', antragsdelikt: true });
    expect(m.weichen.some((w) => w.includes('WAHL') && w.includes('Art. 35 Abs. 2'))).toBe(true);
    const g = bestimmeStrafZustaendigkeit({ anliegen: 'gerichtsstand', tatort: 'bekannt', mehrereTatenVerschOrte: true });
    expect(g.weichen.some((w) => w.includes('GESAMTSTRAFE'))).toBe(true);
    expect(g.fahrplan.some((s) => s.text.includes('ABSCHLIESSEND'))).toBe(true);
    expect(g.fahrplan.some((s) => s.text.includes('in dubio pro duriore'))).toBe(true);
  });
});
