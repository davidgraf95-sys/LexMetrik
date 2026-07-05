import { describe, it, expect } from 'vitest';
import { ERLASS_REGISTER, GEBIETE, type Rechtsgebiet } from '../lib/normtext/register';
import {
  RECHTSGEBIET_THEMEN, themaMitgliedKeys, themenFuerErlass,
} from '../lib/normtext/rechtsgebiet-thema';
import { CALCULATORS } from '../lib/calculators';

// ─── Tolerantes Tor: Rechtsgebiets-Sicht «Gerüst» (G6/§4.4) ──────────────────
//
// Prüft die STRUKTUR des Querschnitts-Overlays — NIE die inhaltliche Richtigkeit
// der Zuordnung (die trägt Davids fachliche Abnahme, §8). Vor allem: «unzu-
// geordnet» ist zulässig (das Auto-Grundgerüst deckt jeden Erlass). Der Test
// flaggt nur STILLE REGRESSIONEN (verwaiste Mitglieder, tote Verzahnung, ein
// stilles Ausdünnen der Themen), nie die bewusste Null.

const bundKeys = new Set(ERLASS_REGISTER.filter((r) => r.ebene === 'bund').map((r) => r.key));
const gebietIds = new Set<Rechtsgebiet>(GEBIETE.map((g) => g.id));
const calcSlugs = new Set(CALCULATORS.map((c) => c.slug));

describe('G6 — Querschnitts-Themen: Startumfang begrenzt (K8)', () => {
  it('6–8 Themen (hart begrenzt, kein Wildwuchs)', () => {
    expect(RECHTSGEBIET_THEMEN.length).toBeGreaterThanOrEqual(6);
    expect(RECHTSGEBIET_THEMEN.length).toBeLessThanOrEqual(8);
  });
  it('Themen-IDs + Reihenfolgen sind eindeutig', () => {
    const ids = RECHTSGEBIET_THEMEN.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    const rf = RECHTSGEBIET_THEMEN.map((t) => t.reihenfolge);
    expect(new Set(rf).size).toBe(rf.length);
  });
});

describe('G6 — Themen tragen Beleg + Entwurf-Status (§7/§8)', () => {
  it('jedes Thema: nicht-leeres Label/Kurz/Beleg, gültiges Grundgerüst-Gebiet, status entwurf', () => {
    for (const t of RECHTSGEBIET_THEMEN) {
      expect(t.label.trim().length, t.id).toBeGreaterThan(0);
      expect(t.kurz.trim().length, t.id).toBeGreaterThan(0);
      // §7-Beleg-Pflicht: die tragende Fundstelle steht im Code.
      expect(t.beleg.trim().length, `${t.id}: Beleg fehlt`).toBeGreaterThan(10);
      expect(gebietIds.has(t.gebiet), `${t.id}: ${t.gebiet}`).toBe(true);
      // §8: das kuratierte Delta bleibt Entwurf bis zur Fachabnahme.
      expect(t.status, t.id).toBe('entwurf');
      expect(t.mitglieder.length, `${t.id}: keine Mitglieder`).toBeGreaterThan(0);
    }
  });
});

describe('G6 — Mitglieder existieren + tragen Beleg (keine Waise)', () => {
  it('jeder Mitglieds-Schlüssel ist ein Bund-Register-Eintrag', () => {
    const verwaist: string[] = [];
    for (const t of RECHTSGEBIET_THEMEN)
      for (const m of t.mitglieder)
        if (!bundKeys.has(m.key)) verwaist.push(`${t.id}:${m.key}`);
    expect(verwaist, `Verwaiste Mitglieder: ${verwaist.join(', ')}`).toEqual([]);
  });
  it('jedes Mitglied trägt einen §7-Beleg; Anker nur mit Bereichs-Spanne', () => {
    for (const t of RECHTSGEBIET_THEMEN)
      for (const m of t.mitglieder) {
        expect(m.beleg.trim().length, `${t.id}:${m.key}`).toBeGreaterThan(5);
        expect(m.ebene, `${t.id}:${m.key}`).toBe('bund');
        // ankerVon (Deep-Link auf den ersten Artikel) ergibt nur mit Spanne Sinn.
        if (m.ankerVon) expect(m.spanne, `${t.id}:${m.key}: Anker ohne Spanne`).toBeTruthy();
      }
  });
});

describe('G6 — Verzahnung zeigt auf existierende Werkzeuge', () => {
  it('jeder Werkzeug-Slug ist ein registrierter Rechner', () => {
    const tot: string[] = [];
    for (const t of RECHTSGEBIET_THEMEN)
      for (const slug of t.werkzeuge ?? [])
        if (!calcSlugs.has(slug)) tot.push(`${t.id}:${slug}`);
    expect(tot, `Tote Werkzeug-Verweise: ${tot.join(', ')}`).toEqual([]);
  });
});

describe('G6 — Abdeckung ist TOLERANT (unzugeordnet zulässig, §4.4)', () => {
  const keys = themaMitgliedKeys();
  const bundGesamt = bundKeys.size;
  const kategorisiert = [...keys].filter((k) => bundKeys.has(k)).length;

  it('es gibt eine Themen-Abdeckung (Regressionswächter gegen stilles Ausdünnen)', () => {
    // Unterer Wächter: das Gerüst zieht mehrere Leitgesetze zusammen. Ein stilles
    // Leeren der Themen (Regression) fiele hier auf — das bewusste Nicht-Zuordnen
    // weiterer Erlasse NICHT (nur eine Untergrenze, keine Vollabdeckung).
    expect(kategorisiert).toBeGreaterThanOrEqual(20);
  });

  it('Voll-Abdeckung wird NICHT erzwungen (unzugeordnet ist ok)', () => {
    // Genau der tolerante Kern: es DÜRFEN Bund-Erlasse ohne Thema existieren.
    // Der Test dokumentiert die Lücke, macht sie aber nie rot.
    expect(kategorisiert).toBeLessThanOrEqual(bundGesamt);
    expect(bundGesamt - kategorisiert).toBeGreaterThanOrEqual(0);
  });

  it('themenFuerErlass ist mehrwertig konsistent (OR quer über mehrere Themen)', () => {
    // OR ist der Querschnitts-Fall schlechthin (Arbeit/Miete/Vertrag/Gesellschaft).
    const orThemen = themenFuerErlass('OR');
    expect(orThemen.length).toBeGreaterThanOrEqual(2);
    // Ein nicht zugeordneter Erlass liefert die leere Liste (kein Wurf).
    expect(themenFuerErlass('__gibt_es_nicht__')).toEqual([]);
  });
});
