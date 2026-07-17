// Dead-Link-Tor für den Artikel-Suchindex (ROADMAP Schritt 5).
//
// Der HOCH-Bug 28.6.: der Treffer-href baute auf dem internen `erlass`-Kürzel
// (z. B. «StGB») statt dem /gesetze-Routen-Key (Dateiname-Stamm «STGB») → 71/218
// Erlasse mit toten Links. Dieses Tor sichert: JEDER Index-Key ist ein echter
// Bund-Routen-Key (§8 kein toter Link), und Kürzel/Key bleiben getrennt.
import { describe, it, expect } from 'vitest';
import { baueBundIndex } from '../../scripts/such-index-generieren';
import { ERLASS_REGISTER } from '../lib/normtext/register';

const bundKeys = new Set(ERLASS_REGISTER.filter((e) => e.ebene === 'bund').map((e) => e.key));
const index = baueBundIndex();
const keys = [...new Set(index.eintraege.map((e) => e.k))];

describe('Artikel-Suchindex — keine toten Links', () => {
  it('jeder Index-Key ist ein gültiger /gesetze-Bund-Routen-Key', () => {
    const tot = keys.filter((k) => !bundKeys.has(k));
    expect(tot).toEqual([]); // wäre vor dem Fix: StGB, StPO, SchKG, … (71)
  });

  it('Kürzel (Anzeige) und Routen-Key (href) werden getrennt geführt', () => {
    const stgb = index.eintraege.find((e) => e.ku === 'StGB');
    expect(stgb).toBeDefined();
    expect(stgb!.k).toBe('STGB');           // href-Key
    expect(stgb!.ku).toBe('StGB');          // Anzeige-Kürzel
    const schkg = index.eintraege.find((e) => e.ku === 'SchKG');
    expect(schkg!.k).toBe('SCHKG');
  });

  it('Index ist nicht leer und trägt erwartete Felder', () => {
    expect(index.eintraege.length).toBeGreaterThan(20000);
    const e = index.eintraege[0];
    expect(e).toHaveProperty('k');
    expect(e).toHaveProperty('ku');
    expect(e).toHaveProperty('a');
    expect(e).toHaveProperty('t');
    expect(e).toHaveProperty('tb'); // G-SUCH: Tabellen-/Struktur-Tier
    expect(e).toHaveProperty('f');  // G-SUCH: Fussnoten-Body
  });
});

// G-SUCH: Tabellenzellen + Fussnoten-Body müssen im Index landen — sonst findet
// die Korpus-Suche keinen Text, der NUR in einer Tabelle oder Fussnote steht.
describe('Artikel-Suchindex — Tabellen + Fussnoten indexiert (G-SUCH)', () => {
  const byArt = (k: string, a: string) => index.eintraege.find((e) => e.k === k && e.a === a);

  it('Tabellenzellen (mehrspaltig) stehen im Tabellen-Feld tb', () => {
    // AHVG 34bis führt die AHV-Zuschlagstabelle; «Grundzuschlags» steht NUR dort.
    const e = byArt('AHVG', '34_bis');
    expect(e).toBeDefined();
    expect(e!.tb.toLowerCase()).toContain('grundzuschlags');
    expect(e!.t.toLowerCase()).not.toContain('grundzuschlags'); // nicht im Haupttext
  });

  it('Fussnoten-Body steht im Fussnoten-Feld f (ohne <b>/<i>-Tags)', () => {
    // ADOV 5 trägt einen Änderungshinweis auf die «Strafregisterverordnung».
    const e = byArt('ADOV', '5');
    expect(e).toBeDefined();
    expect(e!.f.toLowerCase()).toContain('strafregisterverordnung');
    expect(e!.f).not.toMatch(/<\/?[a-z]/i); // keine HTML-Tags durchgerutscht
  });

  it('generischer Bild-Alt «Amtliche Abbildung» wird NICHT indexiert (Suchrauschen)', () => {
    const rausch = index.eintraege.filter((e) => /amtliche abbildung/i.test(e.tb));
    expect(rausch).toEqual([]);
  });
});
