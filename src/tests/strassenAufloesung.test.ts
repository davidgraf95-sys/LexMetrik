import { describe, expect, it } from 'vitest';
import { strasseAufloesen } from '../data/plz/strassenAufloesung';

// ─── Adress-Ausbau Stufe 2 (12.6.2026): Strasse → Gemeinde bei mehrdeutiger
// PLZ — amtliches Gebäudeadressverzeichnis (swisstopo), Referenzwerte am
// Quellbestand vom 12.6.2026 abgelesen (ch-strassen-generieren.ts).

describe('strasseAufloesen (gemeinde-mehrdeutige PLZ, amtl. Gebäudeadressverzeichnis)', () => {
  it('löst gemeinde-eindeutige Strassen auf — auch über die Kantonsgrenze (4052 Basel/Münchenstein)', async () => {
    expect(await strasseAufloesen('4052', 'Adlerstrasse')).toEqual({ typ: 'gemeinde', gemeinde: 'Basel', kanton: 'BS' });
    expect(await strasseAufloesen('4052', 'Birswaldweg')).toEqual({ typ: 'gemeinde', gemeinde: 'Münchenstein', kanton: 'BL' });
    // case-insensitiver Zweitindex + feste «…str.»-Abbildung
    expect(await strasseAufloesen('4052', 'adlerstr.')).toEqual({ typ: 'gemeinde', gemeinde: 'Basel', kanton: 'BS' });
  });
  it('Grenzstrassen entscheiden über die amtliche Hausnummer (4052 Brüglingerstrasse)', async () => {
    expect(await strasseAufloesen('4052', 'Brüglingerstrasse')).toEqual({ typ: 'nummer_noetig', strasse: 'Brüglingerstrasse' });
    expect(await strasseAufloesen('4052', 'Brüglingerstrasse', '83')).toEqual({ typ: 'gemeinde', gemeinde: 'Basel', kanton: 'BS' });
    expect(await strasseAufloesen('4052', 'Brüglingerstrasse', '100')).toEqual({ typ: 'gemeinde', gemeinde: 'Münchenstein', kanton: 'BL' });
    expect(await strasseAufloesen('4052', 'Brüglingerstrasse', '100A')).toEqual({ typ: 'gemeinde', gemeinde: 'Münchenstein', kanton: 'BL' });
    // unbekannte Nummer → ehrlich nummer_noetig (kein Raten)
    expect(await strasseAufloesen('4052', 'Brüglingerstrasse', '9999')).toEqual({ typ: 'nummer_noetig', strasse: 'Brüglingerstrasse' });
  });
  it('eindeutige/unbekannte PLZ und unbekannte Strassen → null (Kachel-Wahl bleibt)', async () => {
    expect(await strasseAufloesen('4051', 'Adlerstrasse')).toBeNull(); // PLZ gemeinde-eindeutig
    expect(await strasseAufloesen('0000', 'Adlerstrasse')).toBeNull();
    expect(await strasseAufloesen('4052', 'Phantasieweg 99x')).toBeNull();
    expect(await strasseAufloesen('4052', '')).toBeNull();
    expect(await strasseAufloesen('abc', 'Adlerstrasse')).toBeNull();
  });
  it('Daten-Integrität: Indizes gültig, Nummern-Tabellen nur für Grenzstrassen', async () => {
    const verz = (await import('../data/plz/strassenVerzeichnis.json')).default as unknown as
      Record<string, { g: [string, string][]; s: Record<string, number> }>;
    const nummern = (await import('../data/plz/strassenNummern.json')).default as unknown as
      Record<string, Record<string, number>>;
    expect(Object.keys(verz).length).toBeGreaterThanOrEqual(1200);
    for (const [plz, d] of Object.entries(verz)) {
      expect(plz).toMatch(/^\d{4}$/);
      expect(d.g.length).toBeGreaterThanOrEqual(2);
      for (const [, kt] of d.g) expect(kt).toMatch(/^[A-Z]{2}$/);
      for (const idx of Object.values(d.s)) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(d.g.length);
      }
    }
    for (const [schluessel, tabelle] of Object.entries(nummern)) {
      const plz = schluessel.slice(0, 4);
      const strasse = schluessel.slice(5);
      const d = verz[plz];
      expect(d, `Nummern-Schlüssel ohne PLZ-Eintrag: ${schluessel}`).toBeDefined();
      expect(d.s[strasse], `Grenzstrasse doppelt als eindeutig geführt: ${schluessel}`).toBeUndefined();
      for (const idx of Object.values(tabelle)) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(d.g.length);
      }
    }
  });
});
