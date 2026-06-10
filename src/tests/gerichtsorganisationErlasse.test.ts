import { describe, it, expect } from 'vitest';
import { GERICHTSORGANISATION_ERLASSE } from '../data/gerichtsorganisationErlasse';
import { KANTONE } from '../lib/kantone';

// Erlass-Schicht für die Rechtsgrundlage-Links der Eingabe-Vorlagen
// (Auftrag David 10.6.2026). Quelle: gog-gerichtsorganisation-kantone.md
// (zweifach geprüft); URLs einzeln HTTP-/API-verifiziert 10.6.2026.

describe('Gerichtsorganisations-Erlasse — Vollständigkeit', () => {
  it('alle 26 Kantone mit Abkürzung, Titel und Nummer', () => {
    for (const k of KANTONE) {
      const e = GERICHTSORGANISATION_ERLASSE[k];
      expect(e, k).toBeDefined();
      expect(e.abk.length, k).toBeGreaterThan(1);
      expect(e.titel.length, k).toBeGreaterThan(10);
      expect(e.nummer.length, k).toBeGreaterThan(3);
    }
  });
  it('URLs sind https und fehlen nur bei SZ (kein verifizierbares Portal, §8)', () => {
    for (const k of KANTONE) {
      const e = GERICHTSORGANISATION_ERLASSE[k];
      if (k === 'SZ') { expect(e.url).toBeUndefined(); continue; }
      expect(e.url, k).toMatch(/^https:\/\//);
    }
  });
  it('Stichproben (API-titelverifiziert 10.6.2026): LU JusG SRL 260 · AI GOG GS 173.000 · ZH LS 211.1', () => {
    expect(GERICHTSORGANISATION_ERLASSE.LU).toMatchObject({ abk: 'JusG', nummer: 'SRL 260' });
    expect(GERICHTSORGANISATION_ERLASSE.AI.nummer).toBe('GS 173.000');
    expect(GERICHTSORGANISATION_ERLASSE.ZH.url).toContain('zhlex');
  });
});
