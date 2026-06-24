import { describe, it, expect } from 'vitest';
import { kopfModell } from '../lib/rechtsprechung/kopf';
import { synthThema } from '../lib/rechtsprechung/browse';
import { normalisiereRegeste, kuerzeRegeste } from '../lib/rechtsprechung/register';
import type { EntscheidSnapshot, EntscheidRubrum } from '../lib/rechtsprechung/typen';

// Minimaler Snapshot-Bauer (nur kopf-relevante Felder gesetzt; Rest plausibel befüllt).
function mk(over: Partial<EntscheidSnapshot> = {}): EntscheidSnapshot {
  return {
    id: 'bund/bge/150_III_137',
    gericht: 'bger', gerichtName: 'Bundesgericht', gerichtstyp: 'bundesgericht',
    kanton: 'CH', abteilung: 'I. zivilrechtliche Abteilung',
    nummer: '5A_1/2024', bgeReferenz: '150 III 137', zitierung: 'BGE 150 III 137',
    datum: '2024-01-12', sprache: 'de', leitcharakter: 'leitentscheid', sachgebiet: 'privat',
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

describe('kopfModell — Rubrum-Zeilen', () => {
  it('zeigt nur befüllte Felder in fester Reihenfolge Gegenstand→Parteien→Vorinstanz→Besetzung', () => {
    const k = kopfModell(mk({ rubrum: rub({ besetzung: 'Bovey', parteien: 'A. gegen B.', gegenstand: 'Konkurs', vorinstanz: 'OG AR' }) }));
    expect(k.rubrumZeilen.map((z) => z.label)).toEqual(['gegenstand', 'parteien', 'vorinstanz', 'besetzung']);
  });

  it('lässt leere und reine Whitespace-Felder weg (kein leeres "—", §8)', () => {
    const k = kopfModell(mk({ rubrum: rub({ parteien: '   ', vorinstanz: 'Obergericht ZH' }) }));
    expect(k.rubrumZeilen.map((z) => z.label)).toEqual(['vorinstanz']);
    expect(k.rubrumZeilen[0].wert).toBe('Obergericht ZH');
  });

  it('trimmt die Werte', () => {
    const k = kopfModell(mk({ rubrum: rub({ gegenstand: '  Konkurseröffnung  ' }) }));
    expect(k.rubrumZeilen[0].wert).toBe('Konkurseröffnung');
  });

  it('rubrum=null ⇒ keine Rubrum-Zeilen', () => {
    expect(kopfModell(mk({ rubrum: null })).rubrumZeilen).toEqual([]);
  });
});

describe('kopfModell — Thema-Leitzeile (genau EINE Thema-Aussage)', () => {
  it('Gegenstand vorhanden ⇒ keine Leitzeile (Gegenstand führt die Rubrum-Zeilen)', () => {
    const k = kopfModell(mk({ rubrum: rub({ gegenstand: 'Konkurseröffnung' }), regesteAmtlich: true, regeste: { text: 'Regeste …', quelle: 'opencaselaw' } }));
    expect(k.leitzeile).toBeNull();
    expect(k.leitIstSynth).toBe(false);
  });

  it('kein Gegenstand + amtliche Regeste ⇒ gekürzte Regeste als Leitzeile (nicht Synthese)', () => {
    const text = 'Art. 88 SchKG; Fristenstillstand. Während des Verfahrens steht die Frist still.';
    const k = kopfModell(mk({ rubrum: rub({ parteien: 'A. gegen B.' }), regesteAmtlich: true, regeste: { text, quelle: 'opencaselaw' } }));
    expect(k.leitIstSynth).toBe(false);
    expect(k.leitzeile).toBe(kuerzeRegeste(normalisiereRegeste(text), 160));
    // Nur befüllte Rubrum-Zeile bleibt erhalten (Parteien), aber Gegenstand fehlt → Leitzeile trägt das Thema.
    expect(k.rubrumZeilen.map((z) => z.label)).toEqual(['parteien']);
  });

  it('kein Gegenstand + keine amtliche Regeste ⇒ Synthese als Leitzeile + Marker-Flag', () => {
    const snap = mk({ rubrum: rub({ vorinstanz: 'Kantonsgericht' }), regesteAmtlich: false, regeste: null, normKeys: ['OR-336'] });
    const k = kopfModell(snap);
    expect(k.leitIstSynth).toBe(true);
    expect(k.leitzeile).toBe(synthThema(snap));
  });

  it('regesteAmtlich=false trotz vorhandener regeste ⇒ Synthese (nur amtliche Regeste als Leitzeile)', () => {
    const snap = mk({ regesteAmtlich: false, regeste: { text: 'maschinelle Zusammenfassung', quelle: 'opencaselaw' } });
    const k = kopfModell(snap);
    expect(k.leitIstSynth).toBe(true);
    expect(k.leitzeile).toBe(synthThema(snap));
  });
});

describe('kopfModell — Invariante: immer genau eine Thema-Aussage', () => {
  for (const gegenstand of [null, 'Konkurseröffnung']) {
    for (const amtlich of [false, true]) {
      it(`Gegenstand=${!!gegenstand} amtlicheRegeste=${amtlich}: leitzeile XOR Gegenstand`, () => {
        const k = kopfModell(mk({
          rubrum: rub({ gegenstand }),
          regesteAmtlich: amtlich,
          regeste: amtlich ? { text: 'Eine Regeste zum Thema.', quelle: 'opencaselaw' } : null,
        }));
        const hatGegenstand = k.rubrumZeilen.some((z) => z.label === 'gegenstand');
        // Entweder führt der Gegenstand (dann keine Leitzeile) oder es gibt genau eine Leitzeile.
        expect(hatGegenstand ? k.leitzeile === null : k.leitzeile !== null).toBe(true);
      });
    }
  }
});

describe('kopfModell — Kürzung erfindet nichts (§8)', () => {
  it('langer Mehrsatz-Regestetext wird gekürzt; jedes Wort stammt aus dem Original', () => {
    const text = 'Art. 8 ZGB. ' + 'Dies ist ein sehr langer Regestentext, der ganz bewusst die Maximallänge überschreitet, '.repeat(4);
    const k = kopfModell(mk({ regesteAmtlich: true, regeste: { text, quelle: 'opencaselaw' } }));
    expect(k.leitzeile).not.toBeNull();
    expect(k.leitzeile!.length).toBeLessThanOrEqual(160);
    // Kürzung = reine Teilkette (ggf. + Ellipse) der normalisierten Regeste — kein hinzugefügtes Wort.
    const basis = normalisiereRegeste(text).replace(/\s+/g, ' ');
    expect(basis.startsWith(k.leitzeile!.replace(/…$/, '').trimEnd())).toBe(true);
  });
});
