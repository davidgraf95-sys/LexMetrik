// Konsistenz-Tor für den Norm↔Werkzeug-Index (ROADMAP Schritt 2).
//
// `werkzeugeFuerNorm` blendet nicht-verfügbare Karten zur Laufzeit aus (§8: kein
// toter Link). Kehrseite: eine **falsch geschriebene** Karten-ID verschwindet
// genauso lautlos — das Werkzeug fehlt dann heimlich im Reader. Dieses Tor fängt
// solche Tippfehler + verwaiste Erlass-Keys, die zur Laufzeit unsichtbar blieben.
import { describe, it, expect } from 'vitest';
import {
  ERLASS_WERKZEUGE, ARTIKEL_WERKZEUGE, werkzeugeFuerNorm, massgebendeErlasse,
  werkzeugeFuerArtikel, werkzeugeFuerZitate, artikelWerkzeugGruppen,
} from '../lib/normtext/werkzeuge';
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

// ── Artikel-scharfe Map (V1, W2·10-UI-NAV) ──────────────────────────────────
describe('Artikel↔Werkzeug-Map — Konsistenz (V1)', () => {
  it('jede Kante zeigt auf existierende Karten-IDs (kein stiller Tippfehler)', () => {
    const tot = ARTIKEL_WERKZEUGE.flatMap((k) =>
      k.werkzeuge.filter((id) => !KARTEN_IDS.has(id)).map((id) => `${k.erlass} ${k.von}-${k.bis} → ${id}`));
    expect(tot).toEqual([]);
  });

  it('jeder Erlass-Key existiert im ERLASS_REGISTER', () => {
    const verwaist = [...new Set(ARTIKEL_WERKZEUGE.map((k) => k.erlass))].filter((k) => !ERLASS_KEYS.has(k));
    expect(verwaist).toEqual([]);
  });

  it('jede Kante hat einen gültigen Artikel-Bereich (von ≤ bis, positiv) und einen Beleg', () => {
    for (const k of ARTIKEL_WERKZEUGE) {
      const wo = `${k.erlass} ${k.von}-${k.bis}`;
      expect(k.von, wo).toBeGreaterThan(0);
      expect(k.bis, wo).toBeGreaterThanOrEqual(k.von);
      expect(k.werkzeuge.length, wo).toBeGreaterThan(0);
      expect(k.beleg.length, wo).toBeGreaterThan(10);
    }
  });

  it('keine sich überlappenden Kanten mit demselben Werkzeug im selben Erlass (kein Doppel)', () => {
    const kollisionen: string[] = [];
    for (let i = 0; i < ARTIKEL_WERKZEUGE.length; i++) {
      for (let j = i + 1; j < ARTIKEL_WERKZEUGE.length; j++) {
        const a = ARTIKEL_WERKZEUGE[i], b = ARTIKEL_WERKZEUGE[j];
        if (a.erlass !== b.erlass) continue;
        if (a.bis < b.von || b.bis < a.von) continue; // disjunkt
        const geteilt = a.werkzeuge.filter((w) => b.werkzeuge.includes(w));
        if (geteilt.length > 0) kollisionen.push(`${a.erlass} [${a.von}-${a.bis}]∩[${b.von}-${b.bis}]: ${geteilt.join(',')}`);
      }
    }
    expect(kollisionen).toEqual([]);
  });

  it('Artikel-Richtung: Art. 127 OR liefert den Verjährungsrechner (Prüfpunkt)', () => {
    const ids = werkzeugeFuerArtikel('OR', '127').map((w) => w.id);
    expect(ids).toContain('verjaehrung');
  });

  it('Artikel-Richtung: Sub-Artikel 335_c OR fällt unter Art. 335 (Sperrfristen)', () => {
    const ids = werkzeugeFuerArtikel('OR', '335_c').map((w) => w.id);
    expect(ids).toContain('kuendigung-sperrfristen');
  });

  it('Entscheid-Richtung: BGE-152-I-65-Zitate ⇒ kein Erbrechts-Rauschen (Prüfpunkt)', () => {
    // Realer Zitat-Satz von BGE 152 I 65: Art. 448 ZGB (Erwachsenenschutz, KESB —
    // NICHT Erbrecht), Art. 321 StGB (Berufsgeheimnis), Art. 105/106 BGG, Art. 13 BV.
    const zitate = ['Art. 105 Abs. 1 BGG', 'Art. 105 Abs. 2 BGG', 'Art. 106 Abs. 2 BGG', 'Art. 13 Abs. 1 BV', 'Art. 13 BV', 'Art. 321 STGB', 'Art. 448 Abs. 2 ZGB', 'Art. 8 EMRK'];
    const ids = werkzeugeFuerZitate(zitate).map((w) => w.id);
    const erbrecht = ['erbteilung', 'erbrecht-fristen', 'erb-ausgleichung', 'eigenhaendiges-testament', 'oeffentliches-testament'];
    expect(ids.filter((id) => erbrecht.includes(id))).toEqual([]);
    expect(ids.length).toBeLessThanOrEqual(2); // 0–2 passende Werkzeuge
  });

  it('Entscheid-Richtung: Art. 127 OR im Zitat ⇒ Verjährungsrechner', () => {
    const ids = werkzeugeFuerZitate(['Art. 127 OR']).map((w) => w.id);
    expect(ids).toContain('verjaehrung');
  });

  it('artikelWerkzeugGruppen(OR) ist nach Artikelnummer sortiert und nur verfügbare Werkzeuge', () => {
    const gruppen = artikelWerkzeugGruppen('OR');
    expect(gruppen.length).toBeGreaterThan(0);
    for (let i = 1; i < gruppen.length; i++) {
      expect(gruppen[i].von).toBeGreaterThanOrEqual(gruppen[i - 1].von);
    }
    for (const g of gruppen) expect(g.werkzeuge.length).toBeGreaterThan(0);
  });
});
