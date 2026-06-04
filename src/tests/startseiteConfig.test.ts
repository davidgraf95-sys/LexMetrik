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
  it('genau sechs Rechner sind «frei» (Basis-Seite); alle übrigen «experte»', () => {
    const frei = ALLE_KARTEN.filter((k) => k.tier === 'frei').map((k) => k.id).sort();
    expect(frei).toEqual([
      'erbteilung', 'kuendigung-sperrfristen', 'lohnfortzahlung',
      'mietrecht', 'tagerechner', 'verzugszins',
    ]);
    ALLE_KARTEN.forEach((k) => expect(['frei', 'experte'], k.id).toContain(k.tier));
  });
});
