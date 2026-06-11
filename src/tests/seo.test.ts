// ─── SEO-Routenliste & Metadaten (SSG-Auftrag David 11.6.2026) ─────────────
//
// Sichert die Ableitung der Prerender-Routen aus startseiteConfig.ts ab:
// vollständig (alle verfügbaren Karten + statische Seiten), sauber (keine
// Hashes, keine Duplikate, keine Redirect-/Stub-Pfade) und mit individuellen
// Metadaten je Route (Auftrag: keine Titel-Duplikate über Seiten hinweg).
import { describe, expect, it } from 'vitest';
import { metaFuerPfad, prerenderRouten, SITE_URL } from '../lib/seo';
import { ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';

const ROUTEN = prerenderRouten();
// Redirect-Routen (App.tsx) und Stub dürfen nie prerendered/gesitemapped werden
const VERBOTEN = ['/pro', '/fachpersonen', '/rechner', '/rechner/fristenspiegel'];

describe('prerenderRouten()', () => {
  it('liefert alle Pfade verfügbarer Karten plus die statischen Seiten', () => {
    const kartenPfade = new Set(
      ALLE_KARTEN.filter(istVerfuegbar)
        .map((k) => k.href)
        .filter((h): h is string => !!h)
        .map((h) => h.split('#')[0]),
    );
    for (const p of kartenPfade) expect(ROUTEN).toContain(p);
    for (const p of ['/', '/methodik', '/ueber', '/kontakt', '/datenschutz']) {
      expect(ROUTEN).toContain(p);
    }
    expect(ROUTEN).toHaveLength(kartenPfade.size + 5);
  });

  it('enthält keine Duplikate, Hashes oder relativen Pfade', () => {
    expect(new Set(ROUTEN).size).toBe(ROUTEN.length);
    for (const p of ROUTEN) {
      expect(p).toMatch(/^\//);
      expect(p).not.toContain('#');
      expect(p).not.toContain('?');
    }
  });

  it('enthält keine Redirect- oder Stub-Routen', () => {
    for (const p of VERBOTEN) expect(ROUTEN).not.toContain(p);
  });
});

describe('metaFuerPfad()', () => {
  it('liefert für jede Prerender-Route Titel, Beschreibung und Canonical', () => {
    for (const p of ROUTEN) {
      const meta = metaFuerPfad(p);
      expect(meta, p).not.toBeNull();
      expect(meta!.titel.length, p).toBeGreaterThan(0);
      expect(meta!.beschreibung.length, p).toBeGreaterThan(0);
      expect(meta!.canonical, p).toBe(SITE_URL + p);
    }
  });

  it('vergibt routen-individuelle Titel (keine Duplikate)', () => {
    const titel = ROUTEN.map((p) => metaFuerPfad(p)!.titel);
    expect(new Set(titel).size).toBe(titel.length);
  });

  it('Doppelkarten-Routen: hash-lose bzw. per Override bestimmte Karte gewinnt', () => {
    // /rechner/zustaendigkeit: Basis-Karte (ohne Hash) vor #schkg/#straf
    expect(metaFuerPfad('/rechner/zustaendigkeit')!.karte!.id).toBe('zustaendigkeit');
    // /rechner/kuendigung: beide Karten tragen Hashes → Override
    // (TODO(David): Titelwahl abnehmen, s. seo.ts)
    expect(metaFuerPfad('/rechner/kuendigung')!.karte!.id).toBe('kuendigung-sperrfristen');
  });

  it('unbekannte Pfade → null', () => {
    expect(metaFuerPfad('/rechner/gibts-nicht')).toBeNull();
    expect(metaFuerPfad('/pro')).toBeNull();
  });
});
