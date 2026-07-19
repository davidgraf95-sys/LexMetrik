import { describe, it, expect } from 'vitest';
import { rubrumAusAmtlichemStrukturfeld, rubrumFeldPlausibel } from '../lib/rechtsprechung/rubrum';

describe('rubrumFeldPlausibel', () => {
  it('akzeptiert knappe, sauber beginnende Einträge', () => {
    expect(rubrumFeldPlausibel('gegenstand', 'Konkurseröffnung')).toBe(true);
    expect(rubrumFeldPlausibel('parteien', 'A.________ AG gegen B.________')).toBe(true);
    expect(rubrumFeldPlausibel('vorinstanz', 'Obergericht des Kantons Bern, Urteil vom 7. Mai 2026')).toBe(true);
    expect(rubrumFeldPlausibel('besetzung', 'Bundesrichter Bovey, Präsident, Gerichtsschreiber Zingg')).toBe(true);
  });

  it('verwirft leere und reine Whitespace-Werte', () => {
    expect(rubrumFeldPlausibel('gegenstand', null)).toBe(false);
    expect(rubrumFeldPlausibel('gegenstand', '   ')).toBe(false);
  });

  it('verwirft mitten im Satz beginnende Fragmente (Kleinbuchstabe)', () => {
    expect(rubrumFeldPlausibel('gegenstand', 'gehabt hätte und von B.D. damals in Singapur')).toBe(false);
    expect(rubrumFeldPlausibel('parteien', 'die Dauer des Arbeitsverhältnisses, das Alter der Person')).toBe(false);
  });

  it('verwirft auch fr/it-Fragmente mit Akzent-Kleinbuchstaben am Anfang (zukunftsfest)', () => {
    expect(rubrumFeldPlausibel('gegenstand', 'étude du litige et conséquences pour les parties')).toBe(false);
    expect(rubrumFeldPlausibel('parteien', 'à propos de la qualité pour recourir des intéressés')).toBe(false);
    expect(rubrumFeldPlausibel('gegenstand', 'è controverso se il debitore abbia diritto')).toBe(false);
  });

  it('verwirft Werte mit Erwägungs-/Zitat-Markern (BGE, E., i.V.m., BBl, Ziff.)', () => {
    expect(rubrumFeldPlausibel('gegenstand', 'Die Frage nach Art. 8 ZGB (BGE 131 I 24 E. 2.2)')).toBe(false);
    expect(rubrumFeldPlausibel('parteien', 'An und entscheidet; vgl. E. 2.1 hiervor')).toBe(false);
    expect(rubrumFeldPlausibel('gegenstand', 'Bestimmung des Statuts i.V.m. Art. 20 IPRG')).toBe(false);
  });

  it('verwirft überlange Werte (fehlgeschnittener Fliesstext)', () => {
    expect(rubrumFeldPlausibel('gegenstand', 'Wort '.repeat(40).trim())).toBe(false);
  });
});

// ─── Amtliche Strukturfelder (BS-Portal-Betreff) passieren verbatim (§8-Fix 19.7.2026) ──
describe('rubrumFeldPlausibel — amtliches Strukturfeld (gerichte-bs)', () => {
  it('BS-Betreffs mit Kleinbuchstaben-Anfang/Überlänge werden NICHT verworfen', () => {
    expect(rubrumFeldPlausibel('gegenstand', 'betreffend Vorbereitungshaft', true)).toBe(true);
    expect(rubrumFeldPlausibel('gegenstand', 'ad 1 & 2: mehrfache Widerhandlung', true)).toBe(true);
    expect(rubrumFeldPlausibel('gegenstand', 'Wort '.repeat(40).trim(), true)).toBe(true);
    // Kontrolle: dieselben Werte fallen ohne Amtlich-Flag weiterhin durch.
    expect(rubrumFeldPlausibel('gegenstand', 'betreffend Vorbereitungshaft')).toBe(false);
  });
  it('leer bleibt leer — auch amtlich', () => {
    expect(rubrumFeldPlausibel('gegenstand', '   ', true)).toBe(false);
  });
  it('rubrumAusAmtlichemStrukturfeld kennt genau die Portal-Quelle', () => {
    expect(rubrumAusAmtlichemStrukturfeld('gerichte-bs')).toBe(true);
    expect(rubrumAusAmtlichemStrukturfeld('bger')).toBe(false);
    expect(rubrumAusAmtlichemStrukturfeld(null)).toBe(false);
  });
});
