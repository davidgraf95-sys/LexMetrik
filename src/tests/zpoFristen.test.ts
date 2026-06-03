import { describe, it, expect } from 'vitest';
import { berechneFrist } from '../lib/zpoFristen';
import { ostersonntag, stillstandsperioden, dauerTage } from '../data/zpoFeiertage';
import type { ZpoInput } from '../types/zpo';

// Gemeinsame Basis; Gerichtsort ZH (gewählte Enddaten sind dort Werktage).
const base = (over: Partial<ZpoInput>): ZpoInput => ({
  ereignis: '2025-01-15',
  einheit: 'monate',
  laenge: 3,
  verfahren: 'summarisch', // T1–T4: Stillstand aus → isoliert Art. 142 Abs. 2
  kanton: 'ZH',
  fristnatur: 'gesetzlich',
  ...over,
});

describe('ZPO-Fristenrechner (Art. 142–147 ZPO)', () => {
  // T1 – gleiche Tageszahl
  it('T1: 15.1. + 3 Monate → 15.4.', () => {
    expect(berechneFrist(base({ ereignis: '2025-01-15', einheit: 'monate', laenge: 3 })).diesAdQuem).toBe('15.04.2025');
  });

  // T2a – fehlender Tag (kein Schaltjahr) → Monatsende
  it('T2a: 31.1. + 1 Monat (kein Schaltjahr) → 28.2.', () => {
    expect(berechneFrist(base({ ereignis: '2025-01-31', einheit: 'monate', laenge: 1 })).diesAdQuem).toBe('28.02.2025');
  });

  // T2b – Schaltjahr → 29.2.
  it('T2b: 31.1. + 1 Monat (Schaltjahr) → 29.2.', () => {
    expect(berechneFrist(base({ ereignis: '2024-01-31', einheit: 'monate', laenge: 1 })).diesAdQuem).toBe('29.02.2024');
  });

  // T2c – 3 Monate → 30.4.
  it('T2c: 31.1. + 3 Monate → 30.4.', () => {
    expect(berechneFrist(base({ ereignis: '2025-01-31', einheit: 'monate', laenge: 3 })).diesAdQuem).toBe('30.04.2025');
  });

  // T3 – Wochenfrist (+7 Tage, gleicher Wochentag)
  it('T3: Freitag 13.9. + 1 Woche → Freitag 20.9.', () => {
    expect(berechneFrist(base({ ereignis: '2024-09-13', einheit: 'wochen', laenge: 1 })).diesAdQuem).toBe('20.09.2024');
  });

  // T4 – Jahresfrist (fehlender Tag)
  it('T4: 29.2.2024 + 1 Jahr → 28.2.2025', () => {
    expect(berechneFrist(base({ ereignis: '2024-02-29', einheit: 'jahre', laenge: 1 })).diesAdQuem).toBe('28.02.2025');
  });

  // T5 – Beispiel der Kommentierung
  it('T5: 19.8. + 3 Monate → 19.11.', () => {
    expect(berechneFrist(base({ ereignis: '2024-08-19', einheit: 'monate', laenge: 3, verfahren: 'ordentlich' })).diesAdQuem).toBe('19.11.2024');
  });

  // T6 – Tagesfrist mit Weihnachtsstillstand
  it('T6: 15.12. + 30 Tage (mit Stillstand) → 30.1.', () => {
    const r = berechneFrist(base({ ereignis: '2024-12-15', einheit: 'tage', laenge: 30, verfahren: 'ordentlich' }));
    expect(r.diesAQuo).toBe('16.12.2024');
    expect(r.diesAdQuem).toBe('30.01.2025');
  });

  // T7 – Aufschub (Art. 146 Abs. 1): Fristbeginn erst nach dem Stillstand
  it('T7: 10.8. Tagesfrist (mit Stillstand) → Fristbeginn 16.8.', () => {
    const r = berechneFrist(base({ ereignis: '2024-08-10', einheit: 'tage', laenge: 5, verfahren: 'ordentlich' }));
    expect(r.diesAQuo).toBe('16.08.2024');
  });

  // T8a – Ereignis im Sommerstillstand → dies a quo 15.8.
  it('T8a: 3 Monate, Ereignis im Sommerstillstand → 15.11.', () => {
    expect(berechneFrist(base({ ereignis: '2024-08-01', einheit: 'monate', laenge: 3, verfahren: 'ordentlich' })).diesAdQuem).toBe('15.11.2024');
  });

  // T8b – Ereignis im Weihnachtsstillstand → dies a quo 2.1.
  it('T8b: 3 Monate, Ereignis im Weihnachtsstillstand → 2.4.', () => {
    const r = berechneFrist(base({ ereignis: '2024-12-25', einheit: 'monate', laenge: 3, verfahren: 'ordentlich' }));
    expect(r.diesAQuo).toBe('02.01.2025');
    expect(r.diesAdQuem).toBe('02.04.2025');
  });

  // T9 – Dauer der Stillstandsperioden
  it('T9: Dauer Ostern 15 / Sommer 32 / Weihnachten 16 Tage', () => {
    const [ostern, sommer, weihnachten] = stillstandsperioden(2025);
    expect(dauerTage(ostern)).toBe(15);
    expect(dauerTage(sommer)).toBe(32);
    expect(dauerTage(weihnachten)).toBe(16);
  });

  // T10 – Ende rechnerisch Samstag 13.7., dann in Sommerstillstand → erster Werktag danach
  it('T10: Tagesfrist endet Sa 13.7. + Stillstand → 16.8.', () => {
    const r = berechneFrist(base({ ereignis: '2024-07-02', einheit: 'tage', laenge: 11, verfahren: 'ordentlich' }));
    expect(r.diesAdQuem).toBe('16.08.2024');
  });

  // Computus-Kontrolle
  it('Ostersonntag 2025 = 20.4.', () => {
    const o = ostersonntag(2025);
    expect(o.getMonth()).toBe(3); // April
    expect(o.getDate()).toBe(20);
  });

  // Regression: Tagesfrist-Ende auf Sonntag (ohne Stillstand) → nächster Werktag
  it('Regression: Tagesfrist-Ende Sonntag → Montag', () => {
    const r = berechneFrist(base({ ereignis: '2024-09-26', einheit: 'tage', laenge: 10, verfahren: 'summarisch' }));
    expect(r.diesAdQuem).toBe('07.10.2024'); // 06.10. = Sonntag → 07.10.
  });

  // Regression: summarisches Verfahren ignoriert den Stillstand
  it('Regression: summarisch → kein Aufschub (dies a quo 11.8.)', () => {
    const r = berechneFrist(base({ ereignis: '2024-08-10', einheit: 'tage', laenge: 5, verfahren: 'summarisch' }));
    expect(r.diesAQuo).toBe('11.08.2024');
  });

  // Regression: Klagefrist nach Klagebewilligung → Stillstand gilt
  it('Regression: Klagefrist nach Klagebewilligung im Sommerstillstand → 15.11.', () => {
    expect(berechneFrist(base({ ereignis: '2024-08-01', einheit: 'monate', laenge: 3, verfahren: 'klagefrist_klagebewilligung' })).diesAdQuem).toBe('15.11.2024');
  });

  // Mindermeinung [UMSTRITTEN]: Beginn am Folgetag → Ende +1
  it('Mindermeinung: 15.1. + 3 Monate → 16.4.', () => {
    const r = berechneFrist(base({ ereignis: '2025-01-15', einheit: 'monate', laenge: 3, modus: 'mindermeinung' }));
    expect(r.diesAdQuem).toBe('16.04.2025');
    expect(r.warnungen.some((w) => w.includes('[UMSTRITTEN]'))).toBe(true);
  });
});
