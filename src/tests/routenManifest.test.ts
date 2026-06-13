// ─── Gating: Routen-Manifest ↔ Katalog (FAHRPLAN-FUNDAMENT-UMBAU Thema B) ───
//
// §5: Die Pfad-Existenz lebt allein im Katalog (startseiteConfig.ts). Das
// Routen-Manifest (src/routesManifest.tsx) trägt nur die in §3 erlaubte
// Darstellungs-Zusatzinfo Pfad→Lazy-Komponente — darf aber keine zweite
// Existenz-Quelle werden. Darum muss seine Pfadmenge EXAKT den
// katalog-gestützten Routen entsprechen: eine neue Karte ohne Manifest-Eintrag
// (App.tsx → 404) oder ein Manifest-Eintrag ohne Karte (verwaiste Route)
// bricht hier, nicht erst zur Build-Zeit.
import { describe, expect, it } from 'vitest';
import { ROUTEN_MANIFEST } from '../routesManifest';
import { katalogRouten } from '../lib/seo';

describe('ROUTEN_MANIFEST ↔ Katalog', () => {
  const manifestPfade = ROUTEN_MANIFEST.map((r) => r.pfad);

  it('deckt jede Katalog-Route genau einmal ab und führt keine fremde Route', () => {
    expect(new Set(manifestPfade)).toEqual(new Set(katalogRouten()));
  });

  it('enthält keine doppelten Pfade', () => {
    expect(manifestPfade.length).toBe(new Set(manifestPfade).size);
  });

  it('führt keine Sonderroute (Redirect/Stub/statische Seite/Catch-all)', () => {
    const verboten = [
      '/', '/pro', '/fachpersonen', '/rechner', '/rechner/fristenspiegel',
      '/rechner/:slug', '/methodik', '/ueber', '/kontakt', '/datenschutz', '*',
    ];
    for (const v of verboten) expect(manifestPfade).not.toContain(v);
  });
});
