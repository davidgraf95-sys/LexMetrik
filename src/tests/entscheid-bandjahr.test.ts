import { describe, it, expect } from 'vitest';
import { bandJahrVon, istBandjahrPlatzhalter, verschlechtertDatum, bandjahrDiffPlausibel } from '../../scripts/normtext/bge-bandjahr';

describe('bandJahrVon', () => {
  it('leitet das Publikationsjahr aus dem Band ab (seit 1875, Band+1874)', () => {
    expect(bandJahrVon('151 II 475')).toBe(2025);
    expect(bandJahrVon('BGE 146 III 97')).toBe(2020);
  });
  it('liefert null ohne parsbaren Band', () => {
    expect(bandJahrVon(null)).toBeNull();
    expect(bandJahrVon('')).toBeNull();
    expect(bandJahrVon('kein Band')).toBeNull();
  });
});

describe('istBandjahrPlatzhalter', () => {
  it('erkennt den Auszug-only-Platzhalter <Bandjahr>-01-01', () => {
    expect(istBandjahrPlatzhalter({ datum: '2025-01-01', azaUrteil: null, bgeReferenz: '151 II 475' })).toBe(true);
  });
  it('ist NIE true bei aufgelöstem Vollurteil (azaUrteil), auch wenn das Datum zufällig passt', () => {
    expect(istBandjahrPlatzhalter({ datum: '2025-01-01', azaUrteil: { aktenzeichen: '2C_1/2025' }, bgeReferenz: '151 II 475' })).toBe(false);
  });
  it('ist false bei einem exakten (nicht-Platzhalter) Datum', () => {
    expect(istBandjahrPlatzhalter({ datum: '2024-11-26', azaUrteil: null, bgeReferenz: '151 II 475' })).toBe(false);
  });
});

describe('verschlechtertDatum (A1, Gegenprüfungs-Auflage 12.9.2026, PR #816)', () => {
  it('verwirft ein frisches Auszug-only-Ergebnis, das ein exaktes Bestandsdatum durch den Bandjahr-Platzhalter ersetzen würde', () => {
    // Anlassfall: eine Netzstörung beim clir-Fetch degradiert kopf.datumFallback zu
    // null; ohne A1 würde ein bereits exaktes Bestandsdatum (2024-11-26) durch den
    // groben Platzhalter (2025-01-01) überschrieben.
    const alt = { datum: '2024-11-26', azaUrteil: null, bgeReferenz: '151 II 475' };
    const neu = { datum: '2025-01-01', azaUrteil: null, bgeReferenz: '151 II 475' };
    expect(verschlechtertDatum(alt, neu)).toBe(true);
  });
  it('übernimmt ein aufgelöstes Vollurteil immer, auch wenn der Bestand vorher einen Platzhalter trug', () => {
    const alt: { datum: string; azaUrteil: unknown; bgeReferenz: string } = { datum: '2025-01-01', azaUrteil: null, bgeReferenz: '151 II 475' };
    const neu: { datum: string; azaUrteil: unknown; bgeReferenz: string } = { datum: '2024-11-26', azaUrteil: { aktenzeichen: '2C_64/2023' }, bgeReferenz: '151 II 475' };
    expect(verschlechtertDatum(alt, neu)).toBe(false);
  });
  it('übernimmt eine Platzhalter→Platzhalter-Wiederholung (keine Verschlechterung, keine Verbesserung)', () => {
    const alt = { datum: '2025-01-01', azaUrteil: null, bgeReferenz: '151 II 475' };
    const neu = { datum: '2025-01-01', azaUrteil: null, bgeReferenz: '151 II 475' };
    expect(verschlechtertDatum(alt, neu)).toBe(false);
  });
  it('übernimmt die Korrektur eines fehlerhaften (nicht-Platzhalter) Bestandsdatums auf den Platzhalter — das ist der ursprüngliche Fund (bge_151_II_475 vor der amtlichen Auflösung)', () => {
    const alt = { datum: '1999-06-21', azaUrteil: null, bgeReferenz: '151 II 475' };
    const neu = { datum: '2025-01-01', azaUrteil: null, bgeReferenz: '151 II 475' };
    expect(verschlechtertDatum(alt, neu)).toBe(false);
  });
});

describe('bandjahrDiffPlausibel (Tor-Regel check:entscheide, Fund 12.9.2026)', () => {
  it('ist rot (ok:false), wenn das Datum mehr als 5 Jahre vor dem Bandjahr liegt — Anlassfall bge_151_II_475', () => {
    const r = bandjahrDiffPlausibel('151 II 475', '1999-06-21');
    expect(r.ok).toBe(false);
    expect(r.diff).toBe(26);
    expect(r.bandJahr).toBe(2025);
  });
  it('ist grün am exakten Fenster-Rand (genau 5 Jahre)', () => {
    expect(bandjahrDiffPlausibel('151 II 475', '2020-01-01').ok).toBe(true);
  });
  it('ist rot direkt hinter dem Fenster (6 Jahre)', () => {
    expect(bandjahrDiffPlausibel('151 II 475', '2019-01-01').ok).toBe(false);
  });
  it('ist grün, wenn das Datum im Bandjahr selbst liegt (Platzhalter oder echtes Urteil)', () => {
    expect(bandjahrDiffPlausibel('151 II 475', '2025-01-01').ok).toBe(true);
  });
  it('ist ok:true ohne Datengrundlage (kein Band bzw. kein Datum) — kein Befund ohne Beleg', () => {
    expect(bandjahrDiffPlausibel(null, '1999-06-21').ok).toBe(true);
    expect(bandjahrDiffPlausibel('151 II 475', null).ok).toBe(true);
  });
});
