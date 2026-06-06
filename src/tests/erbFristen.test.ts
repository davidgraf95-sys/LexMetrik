import { describe, it, expect } from 'vitest';
import { berechneErbFrist, ERB_FRISTEN } from '../lib/erbFristen';

// Akzeptanztests Erb-Fristen-Engine (Quick-Win 1 aus bibliothek/recherche/
// erbrecht-ausbau.md). Normen am ZGB-Cache 20260101 verifiziert (6.6.2026):
// Art. 521, 533, 566–569, 580, 587, 600, 601.

describe('Erb-Fristen — Katalog-Integrität', () => {
  it('15 Tatbestände, jede mit Norm/Trigger/Label; Keys eindeutig', () => {
    expect(ERB_FRISTEN.length).toBe(15);
    const keys = new Set(ERB_FRISTEN.map((p) => p.key));
    expect(keys.size).toBe(15);
    for (const p of ERB_FRISTEN) {
      expect(p.norm).toMatch(/^Art\. \d+/);
      expect(p.trigger.length).toBeGreaterThan(10);
      expect(p.laenge).toBeGreaterThan(0);
    }
  });
});

describe('Erb-Fristen — Goldwerte (Dossier-Beispiel)', () => {
  // Item-4-Fall: Tod 10.03.2026, gesetzlicher Erbe, Kenntnis am Todestag.
  it('Ausschlagung (Art. 567): 10.03.2026 + 3 Monate → 10.06.2026', () => {
    const r = berechneErbFrist({ key: 'ausschlagung_gesetzlich', trigger: '2026-03-10' });
    expect(r.status).toBe('ok');
    expect(r.resultat.endDatumISO).toBe('2026-06-10');
    expect(r.ergebnis).toContain('10.06.2026');
  });
  it('Öffentliches Inventar (Art. 580): 1 Monat → 10.04.2026', () => {
    const r = berechneErbFrist({ key: 'oeff_inventar_begehren', trigger: '2026-03-10' });
    expect(r.resultat.endDatumISO).toBe('2026-04-10');
  });
  it('Monatsende-Klemmung: Kenntnis 30.11.2025 + 3 Monate → 28.02.2026 (kein 30.02.)', () => {
    const r = berechneErbFrist({ key: 'ausschlagung_gesetzlich', trigger: '2025-11-30' });
    expect(r.resultat.endDatumISO).toBe('2026-02-28');
  });
  it('Ungültigkeitsklage absolut (Art. 521): Eröffnung 15.01.2026 + 10 Jahre → 15.01.2036', () => {
    const r = berechneErbFrist({ key: 'ungueltigkeit_absolut', trigger: '2026-01-15' });
    expect(r.resultat.endDatumISO).toBe('2036-01-15');
  });
  it('30 Jahre gegen Bösgläubige (Art. 521 Abs. 2) inkl. Schaltjahr-Robustheit (29.02.)', () => {
    const r = berechneErbFrist({ key: 'ungueltigkeit_boesglaeubig', trigger: '2024-02-29' });
    expect(r.resultat.endDatumISO).toBe('2054-02-28'); // kein 29.02.2054 → Klemmung
  });
});

describe('Erb-Fristen — Werktags-Verschiebung (Art. 78 OR analog, optional)', () => {
  // Ostern 2026 = 05.04. → 05.01. + 3 Monate endet am Ostersonntag.
  it('ohne Verschiebung: Ende bleibt 05.04.2026 (Ostersonntag) — reine Arithmetik', () => {
    const r = berechneErbFrist({ key: 'ausschlagung_gesetzlich', trigger: '2026-01-05' });
    expect(r.resultat.endDatumISO).toBe('2026-04-05');
  });
  it('mit Verschiebung (ZH): Ostersonntag → über Ostermontag auf Dienstag 07.04.2026', () => {
    const r = berechneErbFrist({
      key: 'ausschlagung_gesetzlich', trigger: '2026-01-05',
      werktagsVerschiebung: true, kanton: 'ZH',
    });
    // 05.04. So (Ostern) → 06.04. Ostermontag (ZH-Feiertag) → 07.04. Di.
    expect(r.resultat.endDatumISO).toBe('2026-04-07');
    expect(r.resultat.verschoben).toBe(true);
  });
});

describe('Erb-Fristen — Warnungen/Weichen (§8)', () => {
  it('Erbgangs-Fristen: Behörden-, 566-II-Vermutungs- und 576-Hinweis vorhanden', () => {
    const r = berechneErbFrist({ key: 'ausschlagung_gesetzlich', trigger: '2026-03-10' });
    const w = r.warnungen.join('\n');
    expect(w).toContain('ZUSTÄNDIGEN KANTONALEN BEHÖRDE');
    expect(w).toContain('Art. 566 Abs. 2');
    expect(w).toContain('Art. 576');
  });
  it('Klagefristen: Einrede-Hinweis (521 III/533 III); 519-Differenzierung nur bei Ungültigkeit', () => {
    const h = berechneErbFrist({ key: 'herabsetzung_relativ', trigger: '2026-03-10' });
    expect(h.warnungen.join('\n')).toContain('EINREDEWEISE');
    expect(h.warnungen.join('\n')).not.toContain('Art. 519');
    const u = berechneErbFrist({ key: 'ungueltigkeit_relativ', trigger: '2026-03-10' });
    expect(u.warnungen.join('\n')).toContain('Art. 519 Abs. 1 Ziff. 1/3');
  });
  it('Annahmen legen die Art.-77-Konvention für Klagefristen offen', () => {
    const r = berechneErbFrist({ key: 'erbschaftsklage_relativ', trigger: '2026-03-10' });
    expect(r.annahmen.join('\n')).toContain('Art.-77');
  });
  it('unbekannter Key wirft dokumentiert', () => {
    expect(() => berechneErbFrist({ key: 'gibtEsNicht' as never, trigger: '2026-01-01' })).toThrow('Unbekannter');
  });
});
