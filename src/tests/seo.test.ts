// ─── SEO-Routenliste & Metadaten (SSG-Auftrag David 11.6.2026) ─────────────
//
// Sichert die Ableitung der Prerender-Routen aus startseiteConfig.ts ab:
// vollständig (alle verfügbaren Karten + statische Seiten), sauber (keine
// Hashes, keine Duplikate, keine Redirect-/Stub-Pfade) und mit individuellen
// Metadaten je Route (Auftrag: keine Titel-Duplikate über Seiten hinweg).
import { describe, expect, it } from 'vitest';
import { jsonLdFuerPfad, metaFuerPfad, prerenderRouten, SITE_URL } from '../lib/seo';
import { ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';

const ROUTEN = prerenderRouten();
// Redirect-Routen (App.tsx) und Stub dürfen nie prerendered/gesitemapped werden.
// /rechner ist seit der UI-Welle KEINE Redirect-, sondern eine Übersichtsseite
// (prerendered) — daher hier NICHT mehr verboten. /recherche ist aufgelöst.
// IA-6 Stufe 2 (§11.8 Y-C, David-Go 3.8.2026): /international ist von der
// Alias-SEITE zur Redirect-ROUTE geworden (308 in vercel.json + Client-Navigate)
// und steht darum jetzt auf dieser Verbots-Liste — deklarierte fachliche
// Änderung dieses Tests (§6.3, kein Refactoring).
const VERBOTEN = ['/pro', '/fachpersonen', '/recherche', '/rechner/fristenspiegel', '/international'];

describe('prerenderRouten()', () => {
  it('liefert alle Pfade verfügbarer Karten plus die statischen Seiten', () => {
    const kartenPfade = new Set(
      ALLE_KARTEN.filter(istVerfuegbar)
        .map((k) => k.href)
        .filter((h): h is string => !!h)
        .map((h) => h.split('#')[0]),
    );
    for (const p of kartenPfade) expect(ROUTEN).toContain(p);
    // 13 statische Seiten inkl. /gesetze (Rubrik V Gesetzessammlung, 17.6.2026),
    // /rechtsprechung (Rubrik Rechtsprechung, 23.6.2026), /materialien (Rubrik
    // Materialien, 27.6.2026) und — seit der UI-Welle — /rechner + /vorlagen
    // (Rubrik-Übersichten, lösen /recherche ab).
    // /suche kam mit UI-NAV S5 (11.7.2026) als Volltext-Ergebnisseite dazu.
    // /international ist mit IA-6 Stufe 2 (3.8.2026) ENTFALLEN — Redirect auf
    // die Säule /gesetze?ebene=international (s. VERBOTEN).
    // /einstellungen kam mit QS-UI B14 #670 (5.9.2026) dazu — fehlte bisher im
    // Register und erbte Titel/Canonical der Startseite.
    for (const p of ['/', '/rechner', '/vorlagen', '/gesetze', '/rechtsprechung', '/materialien', '/methodik', '/ueber', '/kontakt', '/datenschutz', '/abdeckung', '/suche', '/einstellungen']) {
      expect(ROUTEN).toContain(p);
    }
    expect(ROUTEN).toHaveLength(kartenPfade.size + 13);
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

  // IA-6 Stufe 2 (§11.8 Y-C, 3.8.2026): Mit dem echten Redirect entfällt die
  // Alias-Kanonik von Stufe 1 — es gibt wieder AUSNAHMSLOS Self-Canonical
  // (oben mitgeprüft). Die Kette endet in einem Schritt beim Träger /gesetze;
  // deklarierte fachliche Änderung dieses Tests (§6.3).
  it('IA-6 Stufe 2: /international hat keine Metadaten mehr (Redirect statt Seite)', () => {
    expect(metaFuerPfad('/international')).toBeNull();
    // Gegenprobe: die Säulen-Trägerroute bleibt Self-Canonical.
    expect(metaFuerPfad('/gesetze')!.canonical).toBe(`${SITE_URL}/gesetze`);
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

  it('Startseite behält den kuratierten og-Text (Bug-Check 11.6.2026); Karten-Routen haben keinen eigenen', () => {
    // I2-Messaging (W2·5c): og-Text bewusst auf den gescopten Rechen-Satz
    // umgestellt; stabiler Kern «nach festen Regeln» (FAHRPLAN §6, Auflage 6).
    expect(metaFuerPfad('/')!.ogBeschreibung).toContain('nach festen Regeln');
    expect(metaFuerPfad('/rechner/verzugszins')!.ogBeschreibung).toBeUndefined();
  });
});

describe('jsonLdFuerPfad()', () => {
  it('Karten-Routen → WebApplication mit Karten-Daten (nichts erfunden)', () => {
    const ld = jsonLdFuerPfad('/rechner/verzugszins') as Record<string, unknown>;
    expect(ld['@type']).toBe('WebApplication');
    expect(ld.name).toBe(metaFuerPfad('/rechner/verzugszins')!.karte!.title);
    expect(ld.url).toBe(SITE_URL + '/rechner/verzugszins');
    // keine erfundenen Bewertungs-/Angebots-Daten
    expect(ld).not.toHaveProperty('aggregateRating');
    expect(ld).not.toHaveProperty('offers');
  });

  it('Startseite → WebSite+Organization; übrige statische Seiten → null; nirgends FAQPage', () => {
    const start = jsonLdFuerPfad('/') as { '@graph': { '@type': string }[] };
    expect(start['@graph'].map((g) => g['@type'])).toEqual(['WebSite', 'Organization']);
    for (const p of ['/methodik', '/ueber', '/kontakt', '/datenschutz', '/einstellungen']) {
      expect(jsonLdFuerPfad(p)).toBeNull();
    }
    for (const p of ROUTEN) {
      expect(JSON.stringify(jsonLdFuerPfad(p) ?? {})).not.toContain('FAQPage');
    }
  });
});
