import { describe, it, expect } from 'vitest';
import {
  extrahiereStatutRefs,
  extrahiereEntscheidRefs,
  normalisiereStatut,
  normalisiereDocket,
  INVALID_LAW_CODES,
} from '../lib/rechtsprechung/zitat-extraktion';

describe('extrahiereStatutRefs — Gesetzes-Zitate', () => {
  it('mehrteiliges Zitat: Art. 34 Abs. 2 BV → ART.34.ABS.2.BV', () => {
    const refs = extrahiereStatutRefs('Vgl. Art. 34 Abs. 2 BV zur Meinungsfreiheit.');
    expect(refs.length).toBe(1);
    expect(refs[0]).toMatchObject({
      gesetz: 'BV', artikel: '34', absatz: '2', normalisiert: 'ART.34.ABS.2.BV',
    });
    expect(refs[0].raw).toBe('Art. 34 Abs. 2 BV');
  });

  it('Ordinal-Suffix: Art. 52bis OR → ART.52bis.OR (Artikel-Token bewahrt)', () => {
    const refs = extrahiereStatutRefs('Nach Art. 52bis OR gilt das.');
    expect(refs[0].artikel).toBe('52bis');
    expect(refs[0].absatz).toBeNull();
    expect(refs[0].normalisiert).toBe('ART.52bis.OR');
  });

  it('Buchstaben-Suffix: Art. 8a DSG → ART.8a.DSG', () => {
    const refs = extrahiereStatutRefs('Siehe Art. 8a DSG.');
    expect(refs[0].artikel).toBe('8a');
    expect(refs[0].normalisiert).toBe('ART.8a.DSG');
  });

  it('einteiliges Zitat: Art. 8 EMRK → ART.8.EMRK', () => {
    const refs = extrahiereStatutRefs('Art. 8 EMRK schützt das Privatleben.');
    expect(refs[0].normalisiert).toBe('ART.8.EMRK');
    expect(refs[0].absatz).toBeNull();
  });

  it('FR-Variante: art. 8 al. 2 CEDH → ART.8.ABS.2.CEDH', () => {
    const refs = extrahiereStatutRefs("Selon l'art. 8 al. 2 CEDH, ...");
    expect(refs[0].normalisiert).toBe('ART.8.ABS.2.CEDH');
    expect(refs[0].absatz).toBe('2');
  });

  it('IT-Variante: art. 8 cpv. 2 CP → ART.8.ABS.2.CP', () => {
    const refs = extrahiereStatutRefs("Giusta l'art. 8 cpv. 2 CP, ...");
    expect(refs[0].normalisiert).toBe('ART.8.ABS.2.CP');
  });

  it('dedupliziert über die Normalform (erstes Vorkommen bleibt)', () => {
    const refs = extrahiereStatutRefs('Art. 41 OR und nochmals Art. 41 OR.');
    expect(refs.map((r) => r.normalisiert)).toEqual(['ART.41.OR']);
  });

  it('INVALID_LAW_CODES-Filter: klein geschriebenes Stoppwort ist kein Gesetzes-Code', () => {
    // DE «der» und FR «la» dürfen NICHT als Gesetzes-Code gelten (0 Gross → raus).
    expect(extrahiereStatutRefs('Art. 12 der Verordnung')).toEqual([]);
    expect(extrahiereStatutRefs("art. 5 de la loi")).toEqual([]);
    // Zusätzlich: langes Titlecase-Wort (1 Gross, Länge > 3) fällt ebenfalls raus.
    expect(extrahiereStatutRefs('Art. 5 Verfassung')).toEqual([]);
  });

  it('INVALID_LAW_CODES enthält die getunten Stoppwörter (Blockliste-Sonde)', () => {
    expect(INVALID_LAW_CODES.has('DER')).toBe(true);
    expect(INVALID_LAW_CODES.has('LA')).toBe(true);
    expect(INVALID_LAW_CODES.has('ABS')).toBe(true);
    expect(INVALID_LAW_CODES.has('OR')).toBe(false); // echter Gesetzes-Code
    expect(INVALID_LAW_CODES.size).toBe(151);
  });

  it('IT-Bundesverfassung «Cost.» bleibt trotz Filter erhalten (Bug-Check Z1)', () => {
    const refs = extrahiereStatutRefs("Giusta l'art. 8 Cost. federale, ...");
    expect(refs[0]).toMatchObject({ gesetz: 'COST', artikel: '8', normalisiert: 'ART.8.COST' });
  });
});

describe('extrahiereEntscheidRefs — Entscheid-Zitate', () => {
  it('BGE-Zitat wird normalisiert (Roman gross, Einzelspaces)', () => {
    expect(extrahiereEntscheidRefs('Vgl. BGE 147 I 268 E. 3.')).toEqual(['BGE 147 I 268']);
  });

  it('Aktenzeichen-Zitate werden normalisiert (Trenner → _)', () => {
    expect(extrahiereEntscheidRefs('Urteil 4A_123/2020 vom ...')).toEqual(['4A_123_2020']);
    expect(extrahiereEntscheidRefs('Entscheid VB.2018.00411 des VGer')).toEqual(['VB_2018_00411']);
  });

  it('Bare-BGE-Dedup: «BGE 151 I 62» erzeugt NICHT zusätzlich «151 I 62»', () => {
    expect(extrahiereEntscheidRefs('Wie in BGE 151 I 62 entschieden.')).toEqual(['BGE 151 I 62']);
  });

  it('Bare-BGE ohne vorangehendes «BGE» bleibt als Aktenzeichen erhalten', () => {
    expect(extrahiereEntscheidRefs('Der Verweis 151 I 62 steht allein.')).toEqual(['151 I 62']);
  });

  it('historische BGE-Abteilung «Ia»/«Va» wird erkannt (Bug-Check E2)', () => {
    expect(extrahiereEntscheidRefs('Vgl. BGE 120 Ia 31 E. 2.')).toEqual(['BGE 120 Ia 31']);
    expect(extrahiereEntscheidRefs('Siehe BGE 100 Va 5.')).toEqual(['BGE 100 Va 5']);
  });
});

describe('Normalisierungs-Helfer', () => {
  it('normalisiereStatut mit/ohne Absatz', () => {
    expect(normalisiereStatut('34', '2', 'bv')).toBe('ART.34.ABS.2.BV');
    expect(normalisiereStatut('8', null, 'emrk')).toBe('ART.8.EMRK');
  });

  it('normalisiereDocket: BGE-artig behält Spaces, sonst Trenner → _', () => {
    expect(normalisiereDocket('151 I 62')).toBe('151 I 62');
    expect(normalisiereDocket('120 Ia 31')).toBe('120 Ia 31'); // historische Abteilung
    expect(normalisiereDocket('4A_123/2020')).toBe('4A_123_2020');
    expect(normalisiereDocket('1A.122/2005')).toBe('1A_122_2005');
  });
});
