import { describe, it, expect } from 'vitest';
import { amtFuer } from '../data/schlichtung/amtAufloesung';
import { plzAufloesen, hauptTreffer } from '../data/plz/plzAufloesung';
import aemterKantone from '../data/schlichtung/aemterKantone.json';

// ─── VS: Juge de commune — Anlaufstelle Gemeindeverwaltung (Dossier §40) ────
// Einzelerhebung aller 122 Gemeindeverwaltungs-Adressen an den amtlichen
// Gemeinde-Websites (11.6.2026); Validierung gegen BFS 122/122.

const vs = (aemterKantone as Record<string, { aemter: { name: string; strasse: string; plzOrt: string }[]; gemeinden: Record<string, number> }>).VS;

describe('VS: Generator-Stand (122 Anlaufstellen, 1:1)', () => {
  it('122 Gemeinden, jede mit eigener Anlaufstelle, jede mit PLZ-Ort', () => {
    expect(vs.aemter.length).toBe(122);
    expect(Object.keys(vs.gemeinden).length).toBe(122);
    expect(new Set(Object.values(vs.gemeinden)).size).toBe(122);
    for (const a of vs.aemter) {
      expect(a.plzOrt, a.name).toMatch(/^\d{4} /);
      expect(a.name).toContain('Anlaufstelle Gemeindeverwaltung');
    }
  });
});

describe('VS: Empirie (Erhebung 11.6.2026)', () => {
  it('Visp → St. Martiniplatz 1, 3930 Visp', async () => {
    const a = await amtFuer('VS', 'Visp');
    expect(a?.strasse).toBe('St. Martiniplatz 1');
    expect(a?.plzOrt).toBe('3930 Visp');
  });
  it('Leuk: Verwaltung amtlich in Susten', async () => {
    expect((await amtFuer('VS', 'Leuk'))?.plzOrt).toBe('3952 Susten');
  });
  it('Blatten: c/o Wiler (Bergsturz 28.5.2025 — Sonderfall dokumentiert)', async () => {
    const a = await amtFuer('VS', 'Blatten');
    expect(a?.strasse).toContain('c/o Gemeindeverwaltung Wiler');
  });
  it('Anniviers: Postfach-Anschrift (postzustellfähig)', async () => {
    expect((await amtFuer('VS', 'Anniviers'))?.strasse).toContain('Case postale');
  });
  it('strassenlose Gemeinden (Baltschieder/Bellwald) liefern trotzdem die Stelle', async () => {
    for (const g of ['Baltschieder', 'Bellwald']) {
      const a = await amtFuer('VS', g);
      expect(a, g).not.toBeNull();
      expect(a!.plzOrt, g).toMatch(/^\d{4} /);
    }
  });
  it('PLZ-Ketten: 3920 Zermatt und 1950 Sion treffen', async () => {
    for (const [plz, erwartet] of [['3920', 'Zermatt'], ['1950', 'Sion']] as const) {
      const t = (await plzAufloesen(plz))!.filter((x) => x.kanton === 'VS');
      const haupt = hauptTreffer(t) ?? t[0];
      expect((await amtFuer('VS', haupt.gemeinde))?.name, plz).toContain(erwartet);
    }
  });
});
