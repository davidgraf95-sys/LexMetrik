import { describe, it, expect } from 'vitest';
import { rubrumFeldPlausibel } from '../lib/rechtsprechung/rubrum';

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
