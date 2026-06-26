import { describe, it, expect } from 'vitest';
import { gleicheReiterGruppe } from '../lib/tabGruppen';
import type { VerlaufManifeste } from '../lib/verlaufLabel';

// Same-Group-Guard fürs Umsortieren (#F): ein Reiter darf nur INNERHALB derselben
// Blatt-Liste verschoben werden (gleiche Kategorie; bei Gesetzen zusätzlich
// gleiche Herkunft). Reine Funktion → ohne DOM/Render testbar.

// Minimal-Manifest, das einige Gesetz-Pfade nach Herkunft auflöst (Bund/Kanton).
const manifeste = {
  gesetze: {
    erlasse: [
      { key: 'or', ebene: 'bund', titel: 'Obligationenrecht', kuerzel: 'OR' },
      { key: 'zgb', ebene: 'bund', titel: 'Zivilgesetzbuch', kuerzel: 'ZGB' },
      { key: 'estg', ebene: 'kanton', kanton: 'ZH', titel: 'Steuergesetz', kuerzel: 'StG' },
    ],
  },
} as unknown as VerlaufManifeste;

describe('gleicheReiterGruppe — Same-Group-Guard', () => {
  it('verschiedene Kategorien → false', () => {
    expect(gleicheReiterGruppe('/rechner/tagerechner', '/gesetze/bund/or', manifeste)).toBe(false);
    expect(gleicheReiterGruppe('/vorlagen/x', '/rechtsprechung/y', manifeste)).toBe(false);
  });

  it('gleiche Nicht-Gesetz-Kategorie → true (keine Herkunfts-Achse)', () => {
    expect(gleicheReiterGruppe('/rechner/a', '/rechner/b', manifeste)).toBe(true);
    expect(gleicheReiterGruppe('/vorlagen/a', '/vorlagen/b', manifeste)).toBe(true);
  });

  it('Gesetze gleicher Herkunft → true (beide Bund)', () => {
    expect(gleicheReiterGruppe('/gesetze/bund/or', '/gesetze/bund/zgb', manifeste)).toBe(true);
  });

  it('Gesetze unterschiedlicher Herkunft → false (Bund vs. Kanton)', () => {
    expect(gleicheReiterGruppe('/gesetze/bund/or', '/gesetze/kanton/estg', manifeste)).toBe(false);
  });

  it('Gesetze ohne geladenes Manifest → beide herkunftVon=null → dieselbe «ungeklärte» Liste → true', () => {
    expect(gleicheReiterGruppe('/gesetze/bund/or', '/gesetze/kanton/estg')).toBe(true);
  });
});
