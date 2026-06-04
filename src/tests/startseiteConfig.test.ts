import { describe, it, expect } from 'vitest';
import { ALLE_KARTEN } from '../lib/startseiteConfig';

// Annahmekriterien «Fedlex-Direktlinks für die Norm-Pills»:
// artikelgenaue Anker, kein ?version=, geplante Kacheln ohne Pills.

const geprueft = ALLE_KARTEN.filter((k) => k.status === 'geprüft');
const geplant = ALLE_KARTEN.filter((k) => k.status === 'geplant');

describe('Norm-Pills (Fedlex-Direktlinks)', () => {
  it('jede geprüfte Kachel trägt mindestens ein Norm-Pill', () => {
    geprueft.forEach((k) => expect(k.norms.length, k.id).toBeGreaterThan(0));
  });

  it('jede URL ist ein Fedlex-Direktlink im Format …/de#art_<nummer> (Unterstrich-Format für Buchstaben)', () => {
    geprueft.flatMap((k) => k.norms).forEach((n) => {
      expect(n.url, n.label).toMatch(/^https:\/\/www\.fedlex\.admin\.ch\/eli\/cc\/[\w/]+\/de#art_\d+(_[a-z])?$/);
    });
  });

  it('keine URL enthält einen ?version=-Parameter', () => {
    geprueft.flatMap((k) => k.norms).forEach((n) => expect(n.url, n.label).not.toContain('?version='));
  });

  it('alle Pills der geprüften Kacheln sind verifiziert', () => {
    geprueft.flatMap((k) => k.norms).forEach((n) => expect(n.verified, n.label).toBe(true));
  });

  it('Aufzählungs-Labels (/, ·, «und») sind in Einzel-Pills aufgetrennt', () => {
    geprueft.flatMap((k) => k.norms).forEach((n) => {
      expect(n.label, n.label).not.toMatch(/[/·]| und /);
    });
  });

  it('geplante Kacheln («In Vorbereitung») tragen keine Norm-Pills', () => {
    expect(geplant.length).toBeGreaterThan(0);
    geplant.forEach((k) => expect(k.norms, k.id).toEqual([]));
  });
});

describe('Stufen-Zuteilung (tier)', () => {
  it('genau sechs Rechner sind «frei» (Basis-Seite); alle übrigen Rechner «experte»', () => {
    const frei = ALLE_KARTEN.filter((k) => k.modus === 'rechner' && k.tier === 'frei').map((k) => k.id).sort();
    expect(frei).toEqual([
      'erbteilung', 'kuendigung-sperrfristen', 'lohnfortzahlung',
      'mietrecht', 'tagerechner', 'verzugszins',
    ]);
    ALLE_KARTEN.forEach((k) => expect(['frei', 'experte'], k.id).toContain(k.tier));
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
