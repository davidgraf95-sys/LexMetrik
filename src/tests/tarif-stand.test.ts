// W3-TARIF-STAND — Projektion des `stand`-Anzeige-Strings auf ein Datum.
//
// Die Fälle sind KEINE erfundenen Muster: jeder Eingabe-String unten steht so
// in `src/data/tarif/**` (Erhebung 6.9.2026, 137 distinkte Schreibweisen).
import { describe, it, expect } from 'vitest';
import { standDatum } from '../../scripts/tarif/stand';

describe('standDatum — Schreibweisen aus den Tarif-Daten', () => {
  it('1. taggenaue Formen (DMY, führende Null, ISO, ausgeschriebener Monat)', () => {
    expect(standDatum('1.1.2024')).toMatchObject({ iso: '2024-01-01', genauigkeit: 'tag' });
    expect(standDatum('01.01.2024')).toMatchObject({ iso: '2024-01-01', genauigkeit: 'tag' });
    expect(standDatum('2024-01-01')).toMatchObject({ iso: '2024-01-01', genauigkeit: 'tag' });
    expect(standDatum('1. Januar 2024')).toMatchObject({ iso: '2024-01-01', genauigkeit: 'tag' });
    expect(standDatum('7.10.1986')).toMatchObject({ iso: '1986-10-07', genauigkeit: 'tag' });
    expect(standDatum('État au 13 mai 2015 (FO 2015 N')).toMatchObject({ iso: '2015-05-13', genauigkeit: 'tag' });
  });

  it('2. Zusatz in Klammern ändert das Datum nicht, solange er keines nennt', () => {
    expect(standDatum('1.1.2015 (Nachtrag 087)')).toMatchObject({ iso: '2015-01-01', genauigkeit: 'tag' });
    expect(standDatum('28.9.2010 (geltende Fassung)')).toMatchObject({ iso: '2010-09-28', genauigkeit: 'tag' });
  });

  it('3. Mehrere Daten verschiedener Jahre im String sind mehrdeutig — kein Raten (korrigiert nach Gegenprüfung M1, 6.9.2026; vorher «spätestes gewinnt» = latentes falsches Grün)', () => {
    expect(standDatum('1.1.2024 (Punktwert 1.1.2025)')).toMatchObject({ iso: null, genauigkeit: 'unbekannt' });
    expect(standDatum('1.3.2012 (Folgefassung 1.7.2026 wortgleich)')).toMatchObject({ iso: null, genauigkeit: 'unbekannt' });
    expect(standDatum('25.3.2014/17.3.2015')).toMatchObject({ iso: null, genauigkeit: 'unbekannt' });
  });

  it('4. Blosse Jahresangaben ergeben Jahres-Granularität, nicht 1. Januar', () => {
    expect(standDatum('2012/2013')).toMatchObject({ iso: null, genauigkeit: 'unbekannt' }); // zwei Jahre → mehrdeutig (M1)
    expect(standDatum('2005/2017/2024')).toMatchObject({ iso: null, genauigkeit: 'unbekannt' }); // drei Jahre → mehrdeutig (M1)
    expect(standDatum('konsolidierte Fassung 2026')).toMatchObject({ iso: '2026', genauigkeit: 'jahr' });
    expect(standDatum('2026 (konsolidiert)')).toMatchObject({ iso: '2026', genauigkeit: 'jahr' });
  });

  it('5. Verschiedene Jahre sind mehrdeutig; Tagesdatum schlägt dasselbe Jahr', () => {
    // «Etat au 2015» und «13 juin 2012» sind zwei Jahre → mehrdeutig, kein Raten (M1).
    expect(standDatum('Etat au 2015 (Arrete du 13 juin 2012)')).toMatchObject({ iso: null, genauigkeit: 'unbekannt' });
    // Umgekehrt: taggenau im selben Jahr ist die präzisere (und spätere) Lesart.
    expect(standDatum('2026, in Kraft 1.3.2026')).toMatchObject({ iso: '2026-03-01', genauigkeit: 'tag' });
  });

  it('6. Ohne belegtes Datum: unbekannt statt Raten (§7)', () => {
    expect(standDatum('geltende Fassung')).toMatchObject({ iso: null, genauigkeit: 'unbekannt' });
    expect(standDatum('')).toMatchObject({ iso: null, genauigkeit: 'unbekannt' });
  });

  it('7. «bis TT.MM.JJJJ» ist ein Enddatum — nie ein Fassungsdatum (falsches Grün)', () => {
    const d = standDatum('bis 31.12.2026');
    expect(d.iso).toBeNull();
    expect(d.genauigkeit).toBe('unbekannt');
    expect(d.grund).toContain('Enddatum');
  });

  it('8. Nachtrags-/Betragszahlen werden nie als Jahr gelesen', () => {
    expect(standDatum('Nachtrag 087').iso).toBeNull();
    expect(standDatum('Tarif 1850').iso).toBeNull(); // 1850 < 1900 → kein Jahresfenster
  });

  it('9. Unmögliche Kalendertage werden verworfen, nicht gerundet', () => {
    expect(standDatum('31.2.2024').iso).toBe('2024'); // Tag verworfen, Jahr bleibt belegt
    expect(standDatum('2024-02-30').iso).toBe('2024');
  });

  it('11. Mehrere unterschiedliche Daten/Jahre sind mehrdeutig — kein Raten (Befund M1, 6.9.2026)', () => {
    // notariat-grundbuch.ts (JU, RSJU 176.331): Stand 2017, das zweite Datum
    // nennt nur den Stichtag eines indexierten Punktwerts — keine Fassung.
    const a = standDatum('1.1.2017 (Punktwert 1.1.2025)');
    expect(a.iso).toBeNull();
    expect(a.genauigkeit).toBe('unbekannt');
    expect(a.grund).toContain('mehrdeutig');
    // AG (Notariatstarif/GBAG): zwei blosse Jahre ohne erkennbaren Vorrang.
    const b = standDatum('2025/2020');
    expect(b.iso).toBeNull();
    expect(b.genauigkeit).toBe('unbekannt');
    expect(b.grund).toContain('mehrdeutig');
    // ZG (Verwaltungs-/Grundbuchgebührentarif): dieselbe Lage.
    const c = standDatum('2019/2025');
    expect(c.iso).toBeNull();
    expect(c.genauigkeit).toBe('unbekannt');
    expect(c.grund).toContain('mehrdeutig');
  });

  it('12. dieselbe Angabe wiederholt ist NICHT mehrdeutig', () => {
    expect(standDatum('1.1.2024, Stand 1.1.2024')).toMatchObject({ iso: '2024-01-01', genauigkeit: 'tag' });
  });

  it('10. rein/deterministisch: gleiche Eingabe, gleiche Ausgabe (§2)', () => {
    const a = standDatum('1.7.2025');
    const b = standDatum('1.7.2025');
    expect(a).toEqual(b);
  });
});
