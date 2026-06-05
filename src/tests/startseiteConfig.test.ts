import { describe, it, expect } from 'vitest';
import { ALLE_KARTEN } from '../lib/startseiteConfig';
import { CALCULATORS } from '../lib/calculators';

// Annahmekriterien «Fedlex-Direktlinks für die Norm-Pills»:
// artikelgenaue Anker, kein ?version=, geplante Kacheln ohne Pills.

// Ehrliches Status-Modell: «aktiv» = entwurf|geprüft; aktuell ist NICHTS geprüft.
const aktiv = ALLE_KARTEN.filter((k) => k.status !== 'geplant');
const geplant = ALLE_KARTEN.filter((k) => k.status === 'geplant');

describe('Norm-Pills (Fedlex-Direktlinks)', () => {
  it('jede aktive Kachel (Entwurf) trägt mindestens ein Norm-Pill', () => {
    aktiv.forEach((k) => expect(k.norms.length, k.id).toBeGreaterThan(0));
  });

  it('jede URL ist ein Fedlex-Direktlink im Format …/de#art_<nummer> (Unterstrich-Format für Buchstaben)', () => {
    aktiv.flatMap((k) => k.norms).forEach((n) => {
      expect(n.url, n.label).toMatch(/^https:\/\/www\.fedlex\.admin\.ch\/eli\/cc\/[\w/]+\/de#art_\d+(_[a-z])?$/);
    });
  });

  it('keine URL enthält einen ?version=-Parameter', () => {
    aktiv.flatMap((k) => k.norms).forEach((n) => expect(n.url, n.label).not.toContain('?version='));
  });

  it('kein Eintrag ist «geprüft»; alle Pills tragen verified:false bis zur fachlichen Prüfung', () => {
    expect(ALLE_KARTEN.some((k) => k.status === 'geprüft')).toBe(false);
    aktiv.flatMap((k) => k.norms).forEach((n) => expect(n.verified, n.label).toBe(false));
  });

  it('Aufzählungs-Labels (/, ·, «und») sind in Einzel-Pills aufgetrennt', () => {
    aktiv.flatMap((k) => k.norms).forEach((n) => {
      expect(n.label, n.label).not.toMatch(/[/·]| und /);
    });
  });

  it('geplante Kacheln («In Vorbereitung») tragen keine Norm-Pills', () => {
    expect(geplant.length).toBeGreaterThan(0);
    geplant.forEach((k) => expect(k.norms, k.id).toEqual([]));
  });
});

describe('Stufen-Zuteilung (tier)', () => {
  // Free/Pro-Zuordnung gemäss Auftrag «Katalog-Ausbau» §3 (5.6.2026):
  // free = kostenlose Auswahl; alle übrigen pro. Pro zeigt free UND pro.
  it('die Free-Auswahl entspricht der Auftrags-Liste; alle übrigen «pro»', () => {
    const free = ALLE_KARTEN.filter((k) => k.tier === 'free').map((k) => k.id).sort();
    expect(free).toEqual([
      'eigenhaendiges-testament', 'patientenverfuegung', 'tagerechner',
      'teuerungsrechner', 'verzugszins', 'vorsorgeauftrag',
    ]);
    ALLE_KARTEN.forEach((k) => expect(['free', 'pro'], k.id).toContain(k.tier));
  });
});

// Implementierte Vorlagen-Routen (manuell gepflegt, vgl. src/App.tsx)
const VORLAGEN_ROUTEN = new Set(['/vorlagen/testament', '/vorlagen/patientenverfuegung', '/vorlagen/vorsorgeauftrag', '/vorlagen/schlichtungsgesuch-bs']);

describe('Routen-Integrität', () => {
  it('jede aktive Karte verlinkt auf eine registrierte Route', () => {
    const slugs = new Set(CALCULATORS.map((c) => c.slug));
    aktiv.forEach((k) => {
      if (k.modus === 'vorlage') {
        expect(VORLAGEN_ROUTEN.has(k.href!), `${k.id} → ${k.href}`).toBe(true);
        expect(k.schemaId, k.id).toBeTruthy();
      } else {
        expect(k.href, k.id).toMatch(/^\/rechner\//);
        const slug = k.href!.replace('/rechner/', '').split('#')[0];
        expect(slugs.has(slug), `${k.id} → ${slug}`).toBe(true);
      }
    });
  });

  it('jeder registrierte Rechner hat eine aktive Katalog-Karte', () => {
    const hrefs = new Set(aktiv.map((k) => k.href!.split('#')[0]));
    CALCULATORS.filter((c) => c.status === 'entwurf').forEach((c) => {
      expect(hrefs.has(`/rechner/${c.slug}`), c.slug).toBe(true);
    });
  });
});

describe('Modus «Vorlagen» (Katalog-Regeln)', () => {
  const vorlagen = ALLE_KARTEN.filter((k) => k.modus === 'vorlage');

  it('alle vier Dokument-Typen sind belegt', () => {
    (['vorsorge', 'vertrag', 'eingabe', 'gesellschaft'] as const).forEach((art) => {
      expect(vorlagen.some((v) => v.art === art), art).toBe(true);
    });
  });

  it('geplante Vorlagen: keine Norm-Pills, kein href, keine schemaId', () => {
    vorlagen.filter((v) => v.status === 'geplant').forEach((v) => {
      expect(v.norms, v.id).toEqual([]);
      expect(v.href, v.id).toBeUndefined();
      expect('schemaId' in v && v.schemaId, v.id).toBeFalsy();
    });
  });

  it('jede Karte trägt einen gültigen Modus; related-IDs lösen modusübergreifend auf', () => {
    const ids = new Set(ALLE_KARTEN.map((k) => k.id));
    ALLE_KARTEN.forEach((k) => {
      expect(['rechner', 'vorlage'], k.id).toContain(k.modus);
      (k.related ?? []).forEach((r) => expect(ids.has(r), `${k.id} → ${r}`).toBe(true));
    });
  });
});
