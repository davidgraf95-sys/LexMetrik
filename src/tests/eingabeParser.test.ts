import { describe, it, expect } from 'vitest';
import { zahlNichtNegativ, zahlBeliebig, zahlNichtNegativOderNull } from '../components/forms/eingabe';

// H-11: SSOT der zahl()-Parser der Rechner-Formulare (zuvor 7× copy-paste).
// Commit A führte die drei Varianten verhaltensneutral zusammen; Commit B
// harmonisierte die Apostroph/Leerzeichen-Toleranz auf ALLE Formulare (zuvor
// nur BgerRechtsweg). Dieser Test hält beides fest: die je Variante bewusst
// verschiedenen Achsen (Guard, undefined-vs-null) UND die neue, einheitliche
// Tausender-Toleranz («1'000'000» rechnet jetzt überall).
describe('Formular-Eingabe-Parser (H-11 SSOT)', () => {
  describe('zahlNichtNegativ — Guard n>=0, leer/ungültig → undefined', () => {
    it('parst schlichte nicht-negative Zahlen', () => {
      expect(zahlNichtNegativ('1000')).toBe(1000);
      expect(zahlNichtNegativ('0')).toBe(0);
    });
    it('verwirft negative Werte und Unfug → undefined', () => {
      expect(zahlNichtNegativ('-5')).toBeUndefined();
      expect(zahlNichtNegativ('abc')).toBeUndefined();
    });
    it('leere/Whitespace-Eingabe → undefined', () => {
      expect(zahlNichtNegativ('')).toBeUndefined();
      expect(zahlNichtNegativ('   ')).toBeUndefined();
    });
    it('Commit B: Tausender-Apostroph (gerade + typografisch) und Leerzeichen toleriert', () => {
      expect(zahlNichtNegativ("1'000'000")).toBe(1_000_000);
      expect(zahlNichtNegativ('1’000’000')).toBe(1_000_000);
      expect(zahlNichtNegativ('1 000')).toBe(1000);
    });
  });

  describe('zahlBeliebig — kein Guard, leer/ungültig → undefined', () => {
    it('lässt negative Werte zu (kein Guard)', () => {
      expect(zahlBeliebig('-5')).toBe(-5);
      expect(zahlBeliebig('0')).toBe(0);
    });
    it('leer/ungültig → undefined', () => {
      expect(zahlBeliebig('')).toBeUndefined();
      expect(zahlBeliebig('abc')).toBeUndefined();
    });
    it('Commit B: Apostroph/Leerzeichen toleriert', () => {
      expect(zahlBeliebig("1'234")).toBe(1234);
      expect(zahlBeliebig('50’000')).toBe(50_000);
    });
  });

  describe('zahlNichtNegativOderNull — Guard n>=0, leer/ungültig → null', () => {
    it('parst nicht-negative Zahlen, sonst null', () => {
      expect(zahlNichtNegativOderNull("1'000'000")).toBe(1_000_000);
      expect(zahlNichtNegativOderNull('0')).toBe(0);
      expect(zahlNichtNegativOderNull('-5')).toBeNull();
      expect(zahlNichtNegativOderNull('')).toBeNull();
      expect(zahlNichtNegativOderNull('abc')).toBeNull();
    });
  });
});
