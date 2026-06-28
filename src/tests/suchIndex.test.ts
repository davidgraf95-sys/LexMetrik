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
  });
});
