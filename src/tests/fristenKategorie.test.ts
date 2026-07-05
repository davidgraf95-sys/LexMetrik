import { describe, it, expect } from 'vitest';
import { KATALOG_KARTEN, ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';
import { kategorieFuer } from '../lib/oberkategorien';
import {
  FRISTEN_HAUPTEINSTIEGE, FRISTEN_PROZESSUAL, FRISTEN_MATERIELL,
  fristenEinstiegArt,
} from '../lib/fristenKategorie';

// ─── S-5b FAHRPLAN-STRUKTUR-UMBAU (Auftrag David 10.6.2026 abends) ──────────
// «Fristen soll unterteilt werden in prozessual und materiell.»
// Deklarierte Ablösung der FE-1-Invarianten (2 Haupt + 2 Fach + 5 Regime):
// neu 1 Haupteinstieg (Tagerechner, simpler Rechner zuoberst — S-5a) +
// 2 prozessuale + 5 materielle Einstiege. Der Fristenspiegel ist aufgelöst
// (S-5c) — seine Ereignisse leben als EreignisFristenSektion in den
// Fach-Rechnern. Die Invarianten verhindern weiterhin stille Mischlisten.

const fristenKarten = KATALOG_KARTEN.filter((k) => kategorieFuer(k) === 'fristen');
const verfuegbar = fristenKarten.filter(istVerfuegbar);

describe('S-5b: prozessual/materiell-Klassifikation der Fristen-Kategorie', () => {
  it('jede VERFÜGBARE Fristen-Karte ist genau einem Einstiegstyp zugeordnet', () => {
    const offen = verfuegbar.filter((k) => fristenEinstiegArt(k.id) === null).map((k) => k.id);
    expect(offen, 'neue Fristen-Karte in lib/fristenKategorie.ts zuordnen (haupt/prozessual/materiell)').toEqual([]);
  });

  it('keine ID ist doppelt klassifiziert', () => {
    const alle = [
      ...FRISTEN_HAUPTEINSTIEGE.map((h) => h.id),
      ...FRISTEN_PROZESSUAL.map((r) => r.id),
      ...FRISTEN_MATERIELL.map((r) => r.id),
    ];
    expect(new Set(alle).size).toBe(alle.length);
  });

  it('jede klassifizierte ID existiert als verfügbare Fristen-Karte mit href', () => {
    const verfuegbarIds = new Map(verfuegbar.map((k) => [k.id, k]));
    for (const id of [
      ...FRISTEN_HAUPTEINSTIEGE.map((h) => h.id),
      ...FRISTEN_PROZESSUAL.map((r) => r.id),
      ...FRISTEN_MATERIELL.map((r) => r.id),
    ]) {
      const k = verfuegbarIds.get(id);
      expect(k, `${id} fehlt im verfügbaren Fristen-Katalog`).toBeTruthy();
      expect(k!.href, `${id} ohne href`).toBeTruthy();
    }
  });

  it('Haupteinstieg = Tagerechner; die Fristenspiegel-Karte existiert nicht mehr (S-5c)', () => {
    expect(FRISTEN_HAUPTEINSTIEGE.map((h) => h.id)).toEqual(['tagerechner']);
    expect(ALLE_KARTEN.find((k) => k.id === 'fristenspiegel')).toBeUndefined();
  });

  // Deklarierte Anpassung 11.6.2026 (Auftrag David, FAHRPLAN-BGER-RECHTSWEG):
  // + bgg-fristen als drittes prozessuales Regime (eigener BGG-Stillstand).
  // Deklarierte Anpassung 5.7.2026 (ROADMAP W2·7): + verjaehrung-board als
  // sechstes materielles Regime (Verjährungs-/Gewährleistungs-Board).
  it('prozessual = ZPO + SchKG + BGG (eigene Stillstands-Regimes); materiell = 6 Regimes — je mit Begründungs-Satz', () => {
    expect(FRISTEN_PROZESSUAL.map((r) => r.id)).toEqual(['zpo-fristen', 'schkg-fristen', 'bgg-fristen']);
    expect(FRISTEN_MATERIELL.map((r) => r.id)).toEqual(
      ['verjaehrung', 'kuendigung-sperrfristen', 'mietrecht', 'gewaehrleistung', 'erbrecht-fristen', 'verjaehrung-board']);
    for (const r of [...FRISTEN_PROZESSUAL, ...FRISTEN_MATERIELL]) {
      expect(r.warum.length, r.id).toBeGreaterThan(20);
    }
  });

  it('Inventur-Zähler: 1 Haupt + 3 prozessual + 6 materiell = 10 verfügbare Einstiege (bewusste Zahlen)', () => {
    expect(FRISTEN_HAUPTEINSTIEGE.length).toBe(1);
    expect(FRISTEN_PROZESSUAL.length).toBe(3);
    expect(FRISTEN_MATERIELL.length).toBe(6);
    expect(verfuegbar.length).toBe(10);
  });
});
