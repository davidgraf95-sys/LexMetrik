import { describe, it, expect } from 'vitest';
import { verlaufLabel } from '../lib/verlaufLabel';
import type { BrowseManifest } from '../lib/normtext/browse-typen';
import type { EntscheidManifest } from '../lib/rechtsprechung/register';
import type { MaterialManifest } from '../lib/materialien/typen';

// R7 F3 (W2·24-DESIGN-IDENTITAET, Session E6, 6./7.9.2026): der Reiter-Titel
// widersprach dem Seiteninhalt — die Tab-Leiste zeigte weiterhin den generischen
// Lade-Platzhalter «Entscheid öffnen», während die Fläche bereits «Entscheid
// nicht gefunden» meldete (Linse 3, Konsistenz). Ursache: `verlaufLabel()`
// unterschied nicht zwischen «Manifest lädt noch» (kein Wert vorhanden) und
// «Manifest geladen, Schlüssel fehlt» (nachweislich nicht gefunden) — beide
// Fälle ergaben denselben `find()`-Fehlschlag. Fix EINHEITLICH für alle drei
// Manifest-Zweige (Gesetz/Entscheid/Material), keine Sonderlösung nur für
// Entscheide.

const LEERES_GESETZE: BrowseManifest = { erzeugt: '2026-01-01', erlasse: [] };
const LEERE_ENTSCHEIDE: EntscheidManifest = { erzeugt: '2026-01-01', entscheide: [] };
const LEERE_MATERIALIEN: MaterialManifest = { erzeugt: '2026-01-01', materialien: [] };

describe('verlaufLabel — F3: Lade-Platzhalter vs. «nicht gefunden»', () => {
  it('Entscheid: Manifest noch nicht geladen → weiterhin der Lade-Platzhalter', () => {
    expect(verlaufLabel('/rechtsprechung/DOES-NOT-EXIST', {})).toBe('Entscheid öffnen');
  });

  it('Entscheid: Manifest geladen, Schlüssel fehlt → «nicht gefunden», kein Platzhalter mehr', () => {
    expect(verlaufLabel('/rechtsprechung/DOES-NOT-EXIST', { entscheide: LEERE_ENTSCHEIDE }))
      .toBe('Entscheid nicht gefunden');
  });

  it('Gesetz: dieselbe Unterscheidung, gleiche Bauform', () => {
    expect(verlaufLabel('/gesetze/bund/does-not-exist', {})).toBe('Gesetz öffnen');
    expect(verlaufLabel('/gesetze/bund/does-not-exist', { gesetze: LEERES_GESETZE }))
      .toBe('Gesetz nicht gefunden');
  });

  it('Material: dieselbe Unterscheidung, gleiche Bauform', () => {
    expect(verlaufLabel('/materialien/does-not-exist', {})).toBe('Material öffnen');
    expect(verlaufLabel('/materialien/does-not-exist', { materialien: LEERE_MATERIALIEN }))
      .toBe('Material nicht gefunden');
  });

  it('unverändert: ein gefundener Entscheid liefert weiterhin seine Zitierung', () => {
    const manifest: EntscheidManifest = {
      erzeugt: '2026-01-01',
      entscheide: [{ key: 'BGE-146-III-1', zitierung: 'BGE 146 III 1' } as EntscheidManifest['entscheide'][number]],
    };
    expect(verlaufLabel('/rechtsprechung/BGE-146-III-1', { entscheide: manifest })).toBe('BGE 146 III 1');
  });
});
