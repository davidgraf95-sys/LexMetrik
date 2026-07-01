import { describe, it, expect } from 'vitest';
import { pruefeInvarianten, type InvariantenEintrag } from '../../scripts/normtext/check-invarianten-logik';

const eintrag = (bloecke: InvariantenEintrag['bloecke']): InvariantenEintrag => ({ id: 'bund/X/art_1', bloecke });

describe('pruefeInvarianten (Bündel N — Struktur-Invarianten)', () => {
  it('sauberer Text erzeugt keine Verstösse', () => {
    const v = pruefeInvarianten('X', [
      eintrag([{ absatz: '1', text: 'Ein sauberer Absatz mit Artikel 329g und 1bis.', items: [{ marke: 'abis', text: 'lit. Text.' }] }]),
    ]);
    expect(v).toEqual([]);
  });

  it('fängt HTML-Markup-Leak im Body', () => {
    const v = pruefeInvarianten('X', [eintrag([{ absatz: '1', text: 'Rest <sup>5</sup> geblieben.' }])]);
    expect(v).toHaveLength(1);
    expect(v[0].art).toBe('markup');
  });

  it('fängt unaufgelöste HTML-Entity', () => {
    const v = pruefeInvarianten('X', [eintrag([{ absatz: '1', text: 'Betrag&nbsp;100.' }])]);
    expect(v[0].art).toBe('entity');
  });

  it('fängt geleaktes lat. Zähl-Suffix am Textanfang (N1-Regression)', () => {
    const v = pruefeInvarianten('X', [eintrag([{ absatz: null, text: '', items: [{ marke: 'abis', text: 'bis . Organe einer Sozialversicherung.' }] }])]);
    expect(v).toHaveLength(1);
    expect(v[0].art).toBe('suffix-leak');
  });

  it('legitimes «bis» mitten im Satz ist KEIN Leak', () => {
    const v = pruefeInvarianten('X', [eintrag([{ absatz: '1', text: 'gilt bis zum Ende der Frist.' }])]);
    expect(v).toEqual([]);
  });

  it('beschreibende Anhang-Marke ist KEIN Verstoss (nur Markup/Entity an Marken)', () => {
    const v = pruefeInvarianten('X', [eintrag([{ absatz: null, text: '', items: [{ marke: 'SEM', text: 'Staatssekretariat für Migration.' }] }])]);
    expect(v).toEqual([]);
  });
});
