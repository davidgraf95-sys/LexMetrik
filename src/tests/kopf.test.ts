import { describe, it, expect } from 'vitest';
import { kopfModell } from '../lib/rechtsprechung/kopf';
import { synthThema } from '../lib/rechtsprechung/browse';
import type { EntscheidSnapshot, EntscheidRubrum } from '../lib/rechtsprechung/typen';

// Minimaler Snapshot-Bauer (nur kopf-relevante Felder gesetzt; Rest plausibel befüllt).
function mk(over: Partial<EntscheidSnapshot> = {}): EntscheidSnapshot {
  return {
    id: 'bund/bge/150_III_137',
    gericht: 'bger', gerichtName: 'Bundesgericht', gerichtstyp: 'bundesgericht',
    kanton: 'CH', abteilung: 'I. zivilrechtliche Abteilung',
    nummer: '5A_1/2024', bgeReferenz: '150 III 137', zitierung: 'BGE 150 III 137',
    datum: '2024-01-12', sprache: 'de', leitcharakter: 'leitentscheid', sachgebiet: 'privat',
    legalArea: null,
    rubrum: null, regeste: null, regesteAmtlich: false,
    abschnitte: [], dispositivOrders: [],
    zitierteNormen: [], normKeys: [], zitierteEntscheide: [],
    bestand: 'snapshot', kuratierung: 'maschinell',
    quelle: 'opencaselaw', quelleUrl: 'https://www.bger.ch/x', abgerufen: '2026-06-23',
    fassungsToken: 'h', sha: 's',
    ...over,
  };
}
function rub(over: Partial<EntscheidRubrum>): EntscheidRubrum {
  return { besetzung: null, parteien: null, gegenstand: null, vorinstanz: null, ...over };
}
const regeste = (text: string) => ({ text, quelle: 'opencaselaw' as const });

describe('kopfModell — Rubrum-Zeilen (nur plausible, feste Reihenfolge)', () => {
  it('zeigt nur befüllte Felder in fester Reihenfolge Gegenstand→Parteien→Vorinstanz→Besetzung', () => {
    const k = kopfModell(mk({ rubrum: rub({ besetzung: 'Bundesrichter Bovey', parteien: 'A. gegen B.', gegenstand: 'Konkurseröffnung', vorinstanz: 'Obergericht AR' }) }));
    expect(k.rubrumZeilen.map((z) => z.label)).toEqual(['gegenstand', 'parteien', 'vorinstanz', 'besetzung']);
  });

  it('lässt leere/Whitespace-Felder weg (kein leeres „—", §8)', () => {
    const k = kopfModell(mk({ rubrum: rub({ parteien: '   ', vorinstanz: 'Obergericht ZH' }) }));
    expect(k.rubrumZeilen.map((z) => z.label)).toEqual(['vorinstanz']);
    expect(k.rubrumZeilen[0].wert).toBe('Obergericht ZH');
  });

  it('trimmt die Werte', () => {
    expect(kopfModell(mk({ rubrum: rub({ gegenstand: '  Konkurseröffnung  ' }) })).rubrumZeilen[0].wert).toBe('Konkurseröffnung');
  });

  it('verwirft erkennbar fragmentarische Werte (Erwägungs-Falsch-Positive, §1)', () => {
    const k = kopfModell(mk({ rubrum: rub({
      gegenstand: 'd.h. die Frage, ob der Schuldner zu neuem Vermögen gekommen ist (BGE 131 I 24 E. 2.2)',
      parteien: 'die Dauer des Arbeitsverhältnisses, das Alter der Person',
    }) }));
    expect(k.rubrumZeilen).toEqual([]);
  });

  it('rubrum=null ⇒ keine Rubrum-Zeilen', () => {
    expect(kopfModell(mk({ rubrum: null })).rubrumZeilen).toEqual([]);
  });
});

describe('kopfModell — Thema-Leitzeile (keine Dopplung mit Regeste/Gegenstand)', () => {
  it('Gegenstand vorhanden ⇒ keine Leitzeile (Gegenstand trägt das Thema)', () => {
    expect(kopfModell(mk({ rubrum: rub({ gegenstand: 'Konkurseröffnung' }) })).leitzeile).toBeNull();
  });

  it('Regeste vorhanden (amtlich) ⇒ keine Leitzeile (Regeste-Box trägt das Thema)', () => {
    expect(kopfModell(mk({ regesteAmtlich: true, regeste: regeste('Art. 88 SchKG; Fristenstillstand.') })).leitzeile).toBeNull();
  });

  it('Regeste vorhanden (nicht amtlich/Zusammenfassung) ⇒ ebenfalls keine Leitzeile (Box zeigt sie)', () => {
    expect(kopfModell(mk({ regesteAmtlich: false, regeste: regeste('Maschinelle Zusammenfassung.') })).leitzeile).toBeNull();
  });

  it('weder Gegenstand noch Regeste ⇒ abgeleitete synthThema-Leitzeile', () => {
    const snap = mk({ rubrum: rub({ vorinstanz: 'Kantonsgericht' }), regeste: null, normKeys: ['OR-336'] });
    expect(kopfModell(snap).leitzeile).toBe(synthThema(snap));
    // Vorinstanz-Zeile bleibt erhalten; die Leitzeile trägt zusätzlich das Sachgebiet.
    expect(kopfModell(snap).rubrumZeilen.map((z) => z.label)).toEqual(['vorinstanz']);
  });
});

describe('kopfModell — Invariante: genau eine Thema-Aussage, nie doppelt', () => {
  for (const gegenstand of [null, 'Konkurseröffnung']) {
    for (const hatRegeste of [false, true]) {
      it(`Gegenstand=${!!gegenstand} Regeste=${hatRegeste}: Leitzeile nur ohne beide`, () => {
        const k = kopfModell(mk({
          rubrum: rub({ gegenstand }),
          regeste: hatRegeste ? regeste('Eine Regeste zum Thema.') : null,
        }));
        const hatGegenstand = k.rubrumZeilen.some((z) => z.label === 'gegenstand');
        // Leitzeile ist genau dann gesetzt, wenn weder Gegenstand noch Regeste das Thema tragen.
        expect(k.leitzeile !== null).toBe(!hatGegenstand && !hatRegeste);
      });
    }
  }
});
