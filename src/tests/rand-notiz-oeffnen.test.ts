import { describe, it, expect } from 'vitest';
import { randNotizZiel, type KlickLage } from '../pages/gesetz-leser/randNotizOeffnen';

// W2·24-R6 · Split-Regel der Randnotiz. NEUER Wächter zu einer NEUEN Regel
// (§6.3: kein bestehender Test wird angefasst). Er hält die vier Fälle fest, die
// im Bau als Entscheid begründet sind: Modifikator gehört dem Browser, externes
// Ziel gehört dem Browser, ein bereits offenes Ziel wird nicht verdoppelt, und
// ohne Kapazität bleibt es bei gewöhnlicher Navigation.

const schlicht: KlickLage = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
const nieOffen = () => false;

describe('randNotizZiel (W2·24-R6)', () => {
  it('öffnet einen internen Bezug in der anderen Hälfte', () => {
    expect(randNotizZiel(schlicht, '/rechtsprechung/bge_146_III_1', true, nieOffen)).toBe('daneben');
  });

  it('lässt jeden Modifikator und den Mittelklick dem Browser', () => {
    for (const lage of [
      { ...schlicht, metaKey: true },
      { ...schlicht, ctrlKey: true },
      { ...schlicht, shiftKey: true },
      { ...schlicht, altKey: true },
      { ...schlicht, button: 1 },
    ]) {
      expect(randNotizZiel(lage, '/rechtsprechung/bge_146_III_1', true, nieOffen)).toBe('normal');
    }
  });

  it('fängt keine amtlichen Live-Links ab (§7: die Quelle gehört in den Browser)', () => {
    expect(randNotizZiel(schlicht, 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de', true, nieOffen)).toBe('normal');
    expect(randNotizZiel(schlicht, null, true, nieOffen)).toBe('normal');
  });

  it('öffnet nichts doppelt und nichts ohne Kapazität', () => {
    expect(randNotizZiel(schlicht, '/gesetze/bund/ZGB', true, () => true)).toBe('normal');
    expect(randNotizZiel(schlicht, '/gesetze/bund/ZGB', false, nieOffen)).toBe('normal');
  });
});
