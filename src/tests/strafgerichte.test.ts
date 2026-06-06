import { describe, it, expect } from 'vitest';
import { STRAFGERICHTE, strafgerichteFuer } from '../data/strafgerichte';
import { OBERE_INSTANZEN } from '../data/obereInstanzen';
import { KANTONE } from '../lib/kantone';

// Akzeptanztests Strafgerichte-Schicht (Auftrag David, 6.6.2026).
// Quelle: ERSTRECHERCHE bibliothek/behoerden/strafgerichte-kantone.md
// (Doppelcheck + fachliche Abnahme ausstehend). Die Tests sichern
// Vollständigkeit, Adress-Format, die dokumentierten Diskrepanzen und die
// §5-Projektion der Berufungsadresse aus obereInstanzen.ts.

describe('Strafgerichte — Vollständigkeit & Integrität', () => {
  it('alle 26 Kantone vorhanden, mit Stand und Quelle', () => {
    expect(Object.keys(STRAFGERICHTE).length).toBe(26);
    for (const k of KANTONE) {
      const e = STRAFGERICHTE[k];
      expect(e, k).toBeDefined();
      expect(e.stand, k).toBe('6.6.2026');
      expect(e.quelle.length, k).toBeGreaterThan(10);
    }
  });

  it('jede ersteInstanz und jede berufung trägt einen name', () => {
    for (const k of KANTONE) {
      const e = STRAFGERICHTE[k];
      expect(e.ersteInstanz.name.length, k).toBeGreaterThan(2);
      expect(e.berufung.name.length, k).toBeGreaterThan(2);
    }
  });

  it('Adress-Format ^\\d{4} wo plzOrt gesetzt (1. Instanz, Berufung, ZMG)', () => {
    for (const k of KANTONE) {
      const e = STRAFGERICHTE[k];
      for (const a of [e.ersteInstanz, e.berufung, e.zmg]) {
        if (a && a.plzOrt !== undefined) expect(a.plzOrt, `${k}/${a.name}`).toMatch(/^\d{4} /);
      }
    }
  });

  it('jede Adresse ohne plzOrt trägt einen erklärenden hinweis (Vorbehalt, §8)', () => {
    for (const k of KANTONE) {
      const e = STRAFGERICHTE[k];
      for (const a of [e.ersteInstanz, e.berufung, e.zmg]) {
        if (a && a.plzOrt === undefined) {
          expect(a.hinweis, `${k}/${a.name}`).toBeDefined();
          expect((a.hinweis ?? '').length, `${k}/${a.name}`).toBeGreaterThan(5);
        }
      }
    }
  });

  it('deterministisch: strafgerichteFuer liefert konstanten Inhalt', () => {
    expect(strafgerichteFuer('BE')).toEqual(strafgerichteFuer('BE'));
    expect(strafgerichteFuer('BS')).toBe(STRAFGERICHTE.BS);
  });
});

describe('Strafgerichte — Schlüssel-Stichproben aus dem Dossier', () => {
  it('BS ersteInstanz = Strafgericht Schützenmattstrasse 20 (≠ Appellationsgericht)', () => {
    expect(STRAFGERICHTE.BS.ersteInstanz.strasse).toContain('Schützenmattstrasse 20');
    expect(STRAFGERICHTE.BS.ersteInstanz.plzOrt).toBe('4051 Basel');
  });

  it('LU ersteInstanz = Kriminalgericht Landenbergstrasse 36', () => {
    expect(STRAFGERICHTE.LU.ersteInstanz.name).toContain('Kriminalgericht');
    expect(STRAFGERICHTE.LU.ersteInstanz.strasse).toContain('Landenbergstrasse 36');
  });

  it('GE ersteInstanz an der Rue des Chaudronniers', () => {
    expect(STRAFGERICHTE.GE.ersteInstanz.strasse).toContain('Chaudronniers');
  });

  // Deklarierte Änderung 6.6.2026 (Behörden-Audit): BL-Lücke amtlich geschlossen
  // (baselland.ch — Strafjustizzentrum, Grenzacherstrasse 8, 4132 Muttenz).
  it('BL amtlich geschlossen; AR-Berufung behält den Hausnummer-Vorbehalt', () => {
    expect(STRAFGERICHTE.BL.ersteInstanz.plzOrt).toBe('4132 Muttenz');
    expect(STRAFGERICHTE.BL.ersteInstanz.strasse).toContain('Grenzacherstrasse 8');
    expect(STRAFGERICHTE.BL.zmg?.plzOrt).toBe('4132 Muttenz');
    // AR: Berufungsinstanz (Fünfeckpalast) trägt den Hausnummer-Vorbehalt.
    expect(STRAFGERICHTE.AR.berufung.strasse).toContain('Fünfeckpalast');
    expect(STRAFGERICHTE.AR.berufung.hinweis).toContain('Hausnummer');
  });

  it('ZMG BS vorhanden — gleiches Haus (Schützenmattstrasse 20)', () => {
    expect(STRAFGERICHTE.BS.zmg).toBeDefined();
    expect(STRAFGERICHTE.BS.zmg!.strasse).toContain('Schützenmattstrasse 20');
  });
});

describe('Strafgerichte — §5-Projektion der Berufungsinstanz aus obereInstanzen.ts', () => {
  it('Berufungs-Adresse (strasse/plzOrt) === obereInstanzen.ts in JEDEM Kanton', () => {
    for (const k of KANTONE) {
      const b = STRAFGERICHTE[k].berufung;
      const o = OBERE_INSTANZEN[k];
      expect(b.strasse, k).toBe(o.strasse);
      expect(b.plzOrt, k).toBe(o.plzOrt);
    }
  });

  it('BS Berufung = Appellationsgericht-Adresse aus obereInstanzen.ts (Projektion)', () => {
    expect(STRAFGERICHTE.BS.berufung.name).toContain('Appellationsgericht');
    expect(STRAFGERICHTE.BS.berufung.strasse).toBe(OBERE_INSTANZEN.BS.strasse);
    expect(STRAFGERICHTE.BS.berufung.plzOrt).toBe(OBERE_INSTANZEN.BS.plzOrt);
    expect(STRAFGERICHTE.BS.berufung.strasse).toBe('Bäumleingasse 1');
  });

  it('Strafkammer-Name weicht vom Zivil-Namen ab (lokale Ergänzung)', () => {
    expect(STRAFGERICHTE.ZH.berufung.name).not.toBe(OBERE_INSTANZEN.ZH.name);
    expect(STRAFGERICHTE.ZH.berufung.name).toContain('Strafkammer');
  });
});
