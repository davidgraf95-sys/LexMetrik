import { describe, it, expect } from 'vitest';
import { parseISO, format } from 'date-fns';
import {
  nthWerktagNach,
  fristendeTage,
  normalisiereEnde,
  OHNE_STILLSTAND,
  type Stillstand,
} from '../lib/fristenEngine';
import { betreibungsferien, betreibungsperiodeFuer } from '../data/schkgFeiertage';

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

// SchKG-Strategie (Betreibungsferien, kein Ruhen, 3-Werktage-Verlängerung).
const SCHKG: Stillstand = {
  periodeFuer: betreibungsperiodeFuer,
  perioden: betreibungsferien,
  ruhenZaehlung: false,
  endregel: 'verlaengerung_3wt',
};

describe('Fristen-Engine – SchKG-Mechanik (Art. 63 SchKG)', () => {
  // BSK-Schmid/Bauer-Beispiel: geschlossene Zeit endet Freitag → 3. Werktag = Mittwoch.
  it('nthWerktagNach: Freitag + 3 Werktage → folgender Mittwoch', () => {
    expect(iso(nthWerktagNach(parseISO('2025-09-05'), 3, 'ZH'))).toBe('2025-09-10');
  });

  it('3-Werktage-Zählung überspringt Feiertage (1. August)', () => {
    // 31.7. (Do) → Fr 1.8. (Bundesfeier, übersprungen), Mo/Di/Mi = 4./5./6.8.
    expect(iso(nthWerktagNach(parseISO('2025-07-31'), 3, 'ZH'))).toBe('2025-08-06');
  });

  it('Tageszählung läuft ohne Ruhen durch die Betreibungsferien', () => {
    // 10.7. + 10 Tage, kein Ruhen: dies a quo 11.7., Ende rechnerisch 20.7.
    const r = fristendeTage(parseISO('2025-07-10'), 10, SCHKG);
    expect(iso(r.diesAQuo)).toBe('2025-07-11');
    expect(iso(r.ende)).toBe('2025-07-20');
  });

  it('Ende IN den Betreibungsferien → Verlängerung auf 3. Werktag (Art. 63)', () => {
    // 20.7. liegt in den Sommerferien (15.–31.7.) → 3. Werktag nach 31.7. = 6.8.
    const { tag, verschoben } = normalisiereEnde(parseISO('2025-07-20'), 'ZH', SCHKG);
    expect(verschoben).toBe(true);
    expect(iso(tag)).toBe('2025-08-06');
  });

  it('Ende auf Sa/So AUSSERHALB geschlossener Zeit → nächster Werktag (nicht 3-Tage-Regel)', () => {
    // 14.9. (So), kein Betreibungsferien-Tag → nur Verschiebung auf Mo 15.9.
    const { tag } = normalisiereEnde(parseISO('2025-09-14'), 'ZH', SCHKG);
    expect(iso(tag)).toBe('2025-09-15');
  });

  it('OHNE_STILLSTAND verschiebt nur arbeitsfreie Endtage', () => {
    expect(iso(normalisiereEnde(parseISO('2025-09-14'), 'ZH', OHNE_STILLSTAND).tag)).toBe('2025-09-15');
    expect(iso(normalisiereEnde(parseISO('2025-09-15'), 'ZH', OHNE_STILLSTAND).tag)).toBe('2025-09-15');
  });
});
