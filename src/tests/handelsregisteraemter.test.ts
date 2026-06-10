import { describe, expect, it } from 'vitest';
import { HR_AEMTER, HR_AEMTER_STAND } from '../data/handelsregisteraemter';
import { KANTONE } from '../lib/kantone';

// ─── HR-Ämter-Stammdaten (G3.4, verdrahtet 10.6.2026) ────────────────────────
// Quelle: behoerden/handelsregisteraemter-kantone.md (Erstrecherche 7.6.2026).

describe('Handelsregisterämter (Datenschicht)', () => {
  it('alle 26 Kantone erfasst, Pflichtfelder gefüllt, URLs amtlich (https, .ch)', () => {
    for (const k of KANTONE) {
      const a = HR_AEMTER[k];
      expect(a, k).toBeDefined();
      expect(a.name.length, k).toBeGreaterThan(8);
      expect(a.plzOrt, k).toMatch(/^\d{4} /);
      expect(a.telefon, k).toMatch(/^\+41 /);
      expect(a.url, k).toMatch(/^https:\/\/[^ ]+\.ch[/.]?/);
    }
    expect(HR_AEMTER_STAND).toBe('7.6.2026');
  });
  it('Stichproben wörtlich am Dossier; Mehrstandort-Kantone tragen den §8-Hinweis', () => {
    expect(HR_AEMTER.ZH.strasse).toBe('Schöntalstrasse 5, Postfach');
    expect(HR_AEMTER.BE.plzOrt).toBe('3071 Ostermundigen');
    expect(HR_AEMTER.AG.strasse).toBe('Bahnhofplatz 3c');
    expect(HR_AEMTER.SO.plzOrt).toBe('4710 Klus-Balsthal'); // NICHT Solothurn-Stadt
    expect(HR_AEMTER.TI.plzOrt).toBe('6710 Biasca');        // Amt sitzt in Biasca
    expect(HR_AEMTER.VS.hinweis).toContain('Bezirksämter'); // 3 Arrondissements
    expect(HR_AEMTER.TI.hinweis).toContain('Biasca');
  });
});
