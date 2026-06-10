import { describe, it, expect } from 'vitest';
import { KATALOG_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';
import { kategorieFuer } from '../lib/oberkategorien';
import {
  FRISTEN_HAUPTEINSTIEGE, FRISTEN_FACH_DIREKTEINSTIEGE, FRISTEN_EIGENE_REGIMES,
  fristenEinstiegArt,
} from '../lib/fristenKategorie';

// FE-1 (FAHRPLAN-FRISTEN-EINHEIT): Die Fristen-Kategorie kennt genau drei
// Einstiegstypen — Haupteinstieg, Fach-Direkteinstieg, Eigenes-Regime-Zeile.
// Diese Invarianten verhindern stille Mischlisten: jede verfügbare
// Fristen-Karte ist klassifiziert, jede Klassifikation zeigt auf eine
// existierende Karte.

const fristenKarten = KATALOG_KARTEN.filter((k) => kategorieFuer(k) === 'fristen');
const verfuegbar = fristenKarten.filter(istVerfuegbar);

describe('FE-1: Einstiegs-Klassifikation der Fristen-Kategorie', () => {
  it('jede VERFÜGBARE Fristen-Karte ist genau einem Einstiegstyp zugeordnet', () => {
    const offen = verfuegbar.filter((k) => fristenEinstiegArt(k.id) === null).map((k) => k.id);
    expect(offen, 'neue Fristen-Karte in lib/fristenKategorie.ts zuordnen (haupt/fach/regime)').toEqual([]);
  });

  it('keine ID ist doppelt klassifiziert', () => {
    const alle = [
      ...FRISTEN_HAUPTEINSTIEGE.map((h) => h.id),
      ...FRISTEN_FACH_DIREKTEINSTIEGE,
      ...FRISTEN_EIGENE_REGIMES.map((r) => r.id),
    ];
    expect(new Set(alle).size).toBe(alle.length);
  });

  it('jede klassifizierte ID existiert als verfügbare Fristen-Karte mit href', () => {
    const verfuegbarIds = new Map(verfuegbar.map((k) => [k.id, k]));
    for (const id of [
      ...FRISTEN_HAUPTEINSTIEGE.map((h) => h.id),
      ...FRISTEN_FACH_DIREKTEINSTIEGE,
      ...FRISTEN_EIGENE_REGIMES.map((r) => r.id),
    ]) {
      const k = verfuegbarIds.get(id);
      expect(k, `${id} fehlt im verfügbaren Fristen-Katalog`).toBeTruthy();
      expect(k!.href, `${id} ohne href`).toBeTruthy();
    }
  });

  it('Haupteinstiege sind Tagerechner + Fristenspiegel (Leitidee: EIN Einstieg)', () => {
    expect(FRISTEN_HAUPTEINSTIEGE.map((h) => h.id)).toEqual(['tagerechner', 'fristenspiegel']);
  });

  it('jede Eigenes-Regime-Zeile trägt einen WARUM-Satz', () => {
    for (const r of FRISTEN_EIGENE_REGIMES) {
      expect(r.warum.length, r.id).toBeGreaterThan(20);
    }
  });
});
