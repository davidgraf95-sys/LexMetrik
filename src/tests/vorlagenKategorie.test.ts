import { describe, it, expect } from 'vitest';
import { EINGABE_RUBRIKEN, VERTRAG_RUBRIKEN } from '../lib/vorlagenKategorie';
import { ALLE_KARTEN, VORLAGE_SEKTIONEN, type VorlageCard } from '../lib/startseiteConfig';

// S-2 FAHRPLAN-STRUKTUR-UMBAU (Auftrag David 10.6.2026 abends):
// fünf Vorlagen-Gruppen + Behördeneingaben-Rubriken — Vollständigkeit.

const vorlagen = ALLE_KARTEN.filter((k): k is VorlageCard => k.modus === 'vorlage');
const RUBRIK_IDS = new Set(EINGABE_RUBRIKEN.map((r) => r.id));

describe('Vorlagen-Register (S-2)', () => {
  it('fünf Gruppen in Davids Reihenfolge: Behördeneingaben · Verträge · Erklärungen · Gesellschaftsrecht · Vorsorge', () => {
    expect(VORLAGE_SEKTIONEN.map((s) => s.art)).toEqual(
      ['eingabe', 'vertrag', 'erklaerung', 'gesellschaft', 'vorsorge']);
    expect(VORLAGE_SEKTIONEN.map((s) => s.title)).toEqual([
      'Behördeneingaben', 'Verträge', 'Einseitige Willenserklärungen',
      'Gesellschaftsrecht', 'Vorsorge & Nachlass']);
  });

  it('drei Eingabe-Rubriken (inkl. «Gesuche & sonstige Eingaben» als eigene Kachel)', () => {
    expect(EINGABE_RUBRIKEN.map((r) => r.id)).toEqual(
      ['klage_allgemein', 'klage_besonders', 'gesuch_sonstige']);
  });

  it('JEDE Eingabe-Vorlage ist genau einer Rubrik zugeordnet; andere Gruppen tragen keine Rubrik', () => {
    vorlagen.forEach((v) => {
      if (v.art === 'eingabe') {
        expect(v.eingabeRubrik && RUBRIK_IDS.has(v.eingabeRubrik), `${v.id}: eingabeRubrik fehlt/unbekannt`).toBe(true);
      } else {
        expect(v.eingabeRubrik, v.id).toBeUndefined();
      }
    });
  });

  it('klageGebiet genau bei «Klagen – besondere Verfahren»', () => {
    vorlagen.forEach((v) => {
      if (v.eingabeRubrik === 'klage_besonders') {
        expect(v.klageGebiet, v.id).toBeTruthy();
      } else {
        expect(v.klageGebiet, v.id).toBeUndefined();
      }
    });
  });

  it('«Klagen – allgemein» = Schlichtungsgesuch · vereinfachte · ordentliche Klage (Davids Wortlaut)', () => {
    expect(vorlagen.filter((v) => v.eingabeRubrik === 'klage_allgemein').map((v) => v.id).sort())
      .toEqual(['klage-ordentlich', 'klage-vereinfacht', 'schlichtungsgesuch']);
  });

  it('jede Gruppe ist belegt; jede Vorlagen-art kennt ihre Sektion', () => {
    const arten = new Set(VORLAGE_SEKTIONEN.map((s) => s.art));
    VORLAGE_SEKTIONEN.forEach((s) => {
      expect(vorlagen.some((v) => v.art === s.art), s.title).toBe(true);
    });
    vorlagen.forEach((v) => expect(arten.has(v.art), `${v.id}: ${v.art}`).toBe(true));
  });

  // V1 FAHRPLAN-VORLAGEN-AUSBAU: Verträge-Rubriken (Wettbewerbsanalyse 12.6.2026)
  it('JEDE Vertrags-Vorlage ist genau einer Verträge-Rubrik zugeordnet; andere Gruppen tragen keine', () => {
    const VERTRAG_IDS = new Set(VERTRAG_RUBRIKEN.map((r) => r.id));
    vorlagen.forEach((v) => {
      if (v.art === 'vertrag') {
        expect(v.vertragRubrik && VERTRAG_IDS.has(v.vertragRubrik), `${v.id}: vertragRubrik fehlt/unbekannt`).toBe(true);
      } else {
        expect(v.vertragRubrik, v.id).toBeUndefined();
      }
    });
  });

  it('sieben Verträge-Rubriken in fester Reihenfolge (leere sind erlaubt — Katalog blendet sie aus)', () => {
    expect(VERTRAG_RUBRIKEN.map((r) => r.id)).toEqual([
      'arbeit', 'miete_pacht', 'kauf', 'auftrag_werk',
      'darlehen_sicherheiten', 'familie', 'zusammenarbeit']);
  });
});
