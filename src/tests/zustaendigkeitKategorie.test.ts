import { describe, it, expect } from 'vitest';
import { ZUSTAENDIGKEIT_FELDER, ZUSTAENDIGKEIT_FELD_IDS } from '../lib/zustaendigkeitKategorie';
import { ALLE_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';
import { kategorieFuer } from '../lib/oberkategorien';

// S-3 FAHRPLAN-STRUKTUR-UMBAU (Auftrag David 10.6.2026 abends): vier feste
// Rechtsweg-Felder in der Kategorie-Ansicht «Zuständigkeiten».

const karte = (id: string) => ALLE_KARTEN.find((k) => k.id === id);

describe('Zuständigkeits-Register (S-3)', () => {
  it('genau vier Felder in fester Reihenfolge: Zivilprozess · Vollstreckung · Straf · Verwaltung', () => {
    expect(ZUSTAENDIGKEIT_FELDER.map((f) => f.id)).toEqual([
      'zustaendigkeit', 'schkg-zustaendigkeit', 'straf-zustaendigkeit', 'verwaltung-zustaendigkeit',
    ]);
  });

  it('jedes Feld existiert als Karte der Kategorie «Zuständigkeiten» mit Untertitel', () => {
    ZUSTAENDIGKEIT_FELDER.forEach((f) => {
      const k = karte(f.id);
      expect(k, f.id).toBeDefined();
      expect(kategorieFuer(k!), f.id).toBe('zustaendigkeiten');
      expect(f.untertitel.length, f.id).toBeGreaterThan(20);
    });
  });

  it('verfügbare Felder verlinken auf den Zuständigkeitsrechner (Hash-Weiche); geplante haben keinen Link', () => {
    ZUSTAENDIGKEIT_FELDER.forEach((f) => {
      const k = karte(f.id)!;
      if (istVerfuegbar(k)) {
        expect(k.href, f.id).toMatch(/^\/rechner\/zustaendigkeit(#(schkg|straf))?$/);
      } else {
        expect(k.href, f.id).toBeUndefined();
      }
    });
  });

  it('drei Rechtswege verfügbar, Verwaltungsverfahren ehrlich geplant (Stand 10.6.2026)', () => {
    expect(ZUSTAENDIGKEIT_FELDER.filter((f) => istVerfuegbar(karte(f.id)!)).map((f) => f.id))
      .toEqual(['zustaendigkeit', 'schkg-zustaendigkeit', 'straf-zustaendigkeit']);
  });

  it('die Hash-Sichten tragen die Titel der Felder (Kopf-Override, §5)', () => {
    expect(karte('zustaendigkeit')!.title).toBe('Zuständigkeit Zivilprozess');
    expect(karte('schkg-zustaendigkeit')!.title).toBe('Zuständigkeit Vollstreckung (SchKG)');
    expect(karte('straf-zustaendigkeit')!.title).toBe('Zuständigkeit Strafverfahren');
    expect(karte('verwaltung-zustaendigkeit')!.title).toBe('Zuständigkeit Verwaltungsverfahren');
  });

  it('FELD_IDS spiegelt die Felder', () => {
    expect([...ZUSTAENDIGKEIT_FELD_IDS].sort()).toEqual(ZUSTAENDIGKEIT_FELDER.map((f) => f.id).sort());
  });
});
