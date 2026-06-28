// Konsistenz-Tor für den Norm↔Werkzeug-Index (ROADMAP Schritt 2).
//
// `werkzeugeFuerNorm` blendet nicht-verfügbare Karten zur Laufzeit aus (§8: kein
// toter Link). Kehrseite: eine **falsch geschriebene** Karten-ID verschwindet
// genauso lautlos — das Werkzeug fehlt dann heimlich im Reader. Dieses Tor fängt
// solche Tippfehler + verwaiste Erlass-Keys, die zur Laufzeit unsichtbar blieben.
import { describe, it, expect } from 'vitest';
import { ERLASS_WERKZEUGE, werkzeugeFuerNorm, massgebendeErlasse } from '../lib/normtext/werkzeuge';
import { ALLE_KARTEN } from '../lib/startseiteConfig';
import { ERLASS_REGISTER } from '../lib/normtext/register';

const KARTEN_IDS = new Set(ALLE_KARTEN.map((k) => k.id));
const ERLASS_KEYS = new Set(ERLASS_REGISTER.map((e) => e.key));
const eintraege = Object.entries(ERLASS_WERKZEUGE);

describe('Norm↔Werkzeug-Index — Konsistenz', () => {
  it('jede zugeordnete Karten-ID existiert im Katalog (kein stiller Tippfehler)', () => {
    const tot = eintraege.flatMap(([erlass, ids]) =>
      ids.filter((id) => !KARTEN_IDS.has(id)).map((id) => `${erlass} → ${id}`));
    expect(tot).toEqual([]);
  });

  it('jeder Erlass-Key existiert im ERLASS_REGISTER (keine verwaiste Zuordnung)', () => {
    const verwaist = eintraege.map(([erlass]) => erlass).filter((k) => !ERLASS_KEYS.has(k));
    expect(verwaist).toEqual([]);
  });

  it('keine doppelte Karten-ID innerhalb eines Erlasses', () => {
    const dup = eintraege
      .filter(([, ids]) => new Set(ids).size !== ids.length)
      .map(([erlass]) => erlass);
    expect(dup).toEqual([]);
  });

  it('werkzeugeFuerNorm liefert nur verfügbare Karten mit href (§8)', () => {
    for (const [erlass] of eintraege) {
      for (const w of werkzeugeFuerNorm(erlass)) {
        expect(w.href, `${erlass} → ${w.id}`).toBeTruthy();
        expect(['rechner', 'vorlage']).toContain(w.modus);
      }
    }
  });

  it('unbekannter Key → leeres Ergebnis (kein Wurf)', () => {
    expect(werkzeugeFuerNorm('GIBTESNICHT')).toEqual([]);
  });

  it('massgebendeErlasse ist konsistent mit werkzeugeFuerNorm', () => {
    for (const modus of ['rechner', 'vorlage'] as const) {
      for (const e of massgebendeErlasse(modus)) {
        expect(werkzeugeFuerNorm(e.key).some((w) => w.modus === modus), `${e.key}/${modus}`).toBe(true);
      }
    }
  });
});
