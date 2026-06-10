import { describe, it, expect } from 'vitest';
import { GEBUEHREN_RUBRIKEN, gebuehrenRubrik } from '../lib/gebuehrenKategorie';
import { ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';
import { kategorieFuer } from '../lib/oberkategorien';

// S-6 FAHRPLAN-STRUKTUR-UMBAU (Auftrag David 10.6.2026 abends):
// «Gebühren und Beträge auch nach Prozess und materiell unterteilen.»

const gebuehrenKarten = ALLE_KARTEN.filter((k) => kategorieFuer(k) === 'gebuehren');

describe('Gebühren-Register (S-6)', () => {
  it('drei Rubriken: prozessual · materiell · Hilfsrechner', () => {
    expect(GEBUEHREN_RUBRIKEN.map((r) => r.id)).toEqual(['prozessual', 'materiell', 'hilfsmittel']);
  });

  it('jede Gebühren-Karte fällt deterministisch in genau eine Rubrik', () => {
    expect(gebuehrenKarten.length).toBeGreaterThan(0);
    gebuehrenKarten.forEach((k) => {
      expect(['prozessual', 'materiell', 'hilfsmittel'], k.id).toContain(gebuehrenRubrik(k.id));
    });
  });

  it('Stichproben der fachlichen Zuordnung (Abnahme David offen)', () => {
    // Verfahrenskosten/-grössen
    (['streitwert', 'prozesskosten', 'kostenvorschuss', 'bundesgerichtsgebuehren',
      'betreibungskosten', 'existenzminimum'] as const)
      .forEach((id) => expect(gebuehrenRubrik(id), id).toBe('prozessual'));
    // Materielle Ansprüche/Quoten
    (['verzugszins', 'schadenszins', 'lohnfortzahlung', 'erbteilung',
      'mietzinsanpassung', 'gueterrecht-vorschlag', 'kapitalverlust', 'ahv-beitraege'] as const)
      .forEach((id) => expect(gebuehrenRubrik(id), id).toBe('materiell'));
    // Werkzeuge
    expect(gebuehrenRubrik('teuerungsrechner')).toBe('hilfsmittel');
  });

  it('prozessuale und materielle Rubrik sind beide mit verfügbaren Rechnern belegt', () => {
    const verf = gebuehrenKarten.filter(istVerfuegbar);
    expect(verf.some((k) => gebuehrenRubrik(k.id) === 'prozessual')).toBe(true);
    expect(verf.some((k) => gebuehrenRubrik(k.id) === 'materiell')).toBe(true);
  });
});
