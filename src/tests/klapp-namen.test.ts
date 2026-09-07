/**
 * Unit-Tests für `parts/klappNamen.ts` (`berechneKlappKontext`).
 *
 * Bau-Spec: fahrplaene/FAHRPLAN-UI-QUALITAET.md §2.5, #689 (David-Entscheid
 * 5.9.2026): nächster abweichender Eltern-Titel disambiguiert; bleibt der
 * resultierende Name TROTZDEM doppelt (gleicher Ahn mehrfach, oder GEBV_HREG-
 * artig gar kein abweichender Ahn), greift ein Vorkommen-Zähler je Restgruppe.
 * Synthetische Bäume statt echtem Snapshot: die Funktion ist reine
 * Baum-Geometrie ohne Korpus-Bezug (§3 Darstellung, keine Fach-Entscheidung).
 */
import { describe, it, expect } from 'vitest';
import { berechneKlappKontext, vollText } from '../pages/gesetz-leser/parts/klappNamen';
import type { GliederungsKnoten } from '../pages/gesetz-leser/gliederungsTypen';

function knoten(id: string, label: string, kinder: GliederungsKnoten[] = [], aufgehoben = false): GliederungsKnoten {
  return {
    id, art: 'sektion', ids: [id], labelKette: [label], label, ebene: 1, tiefe: 1,
    randtitel: false, kinder, artikelAnzahl: 0, eigeneArtikel: 0, gemischt: false,
    aufgehoben, anhang: false,
  } as GliederungsKnoten;
}

describe('berechneKlappKontext', () => {
  it('lässt eindeutige Titel unverändert (kein Eintrag in der Map)', () => {
    const baum = knoten('a', 'Allgemeine Bestimmungen', [knoten('a1', 'Zweck', [knoten('a1a', 'Detail')])]);
    const kontext = berechneKlappKontext([baum]);
    expect(kontext.size).toBe(0);
  });

  it('löst eine klassische Dopplung über den nächsten abweichenden Eltern-Titel', () => {
    // Zwei Zweige mit je einem gleichnamigen Chevron-Kind, aber verschiedenen Eltern.
    const zweigX = knoten('elternX', 'A. Begriff', [
      knoten('kindX', 'II. Geltungsbereich', [knoten('kindX-blatt', 'blatt')]),
    ]);
    const zweigY = knoten('elternY', 'B. Anwendung', [
      knoten('kindY', 'II. Geltungsbereich', [knoten('kindY-blatt', 'blatt')]),
    ]);
    const kontext = berechneKlappKontext([zweigX, zweigY]);
    expect(kontext.get('kindX')).toBe(vollText(zweigX));
    expect(kontext.get('kindY')).toBe(vollText(zweigY));
    expect(kontext.has('elternX')).toBe(false); // Eltern-Titel selbst eindeutig
  });

  it('Restgruppe: gleicher abweichender Ahn kommt selbst zweimal vor (OR/ZGB-Muster) → Vorkommen-Zähler', () => {
    // «A. Begriff und Geltungsbereich» steht zweimal, je mit eigenem
    // «II. Geltungsbereich»-Kind — der Eltern-Schritt disambiguiert NICHT.
    const machZweig = (elternId: string, kindId: string): GliederungsKnoten =>
      knoten(elternId, 'A. Begriff und Geltungsbereich', [
        knoten(kindId, 'II. Geltungsbereich', [knoten(`${kindId}-blatt`, 'blatt')]),
      ]);
    const wurzel1 = knoten('w1', 'Erster Teil', [machZweig('e1', 'k1')]);
    const wurzel2 = knoten('w2', 'Zweiter Teil', [machZweig('e2', 'k2')]);
    const kontext = berechneKlappKontext([wurzel1, wurzel2]);
    // Eltern-Titel («A. Begriff…») selbst doppelt, aber ihr jeweiliger Wurzel-Ahn
    // («Erster Teil» / «Zweiter Teil») unterscheidet sich -> Eltern-Schritt reicht hier.
    expect(kontext.get('e1')).toBe('Erster Teil');
    expect(kontext.get('e2')).toBe('Zweiter Teil');
    // Kinder: derselbe abweichende Ahn («A. Begriff…») für beide -> Restgruppe -> Zähler statt Ahn-Text.
    expect(kontext.get('k1')).toBe('1. Vorkommen');
    expect(kontext.get('k2')).toBe('2. Vorkommen');
    expect(kontext.get('k1')).not.toBe('A. Begriff und Geltungsbereich');
  });

  it('GEBV_HREG-Fall: Wurzel und einziges Kind heissen identisch → kein abweichender Ahn → Vorkommen-Zähler', () => {
    const kind = knoten('anhang-sektion', 'Anhänge', [knoten('blatt', 'Ziffer 1')]);
    const wurzel = knoten('anhang-wurzel', 'Anhänge', [kind]);
    const kontext = berechneKlappKontext([wurzel]);
    expect(kontext.get('anhang-wurzel')).toBe('1. Vorkommen');
    expect(kontext.get('anhang-sektion')).toBe('2. Vorkommen');
  });

  it('drei gleichnamige Chevrons mit paarweise gleichem Ahn: laufende Nummer 1–3 je Restgruppe', () => {
    const machZweig = (elternId: string, kindId: string): GliederungsKnoten =>
      knoten(elternId, 'Gleicher Eltern-Titel', [
        knoten(kindId, 'Gleicher Kind-Titel', [knoten(`${kindId}-blatt`, 'blatt')]),
      ]);
    const w = [
      knoten('w1', 'T1', [machZweig('e1', 'k1')]),
      knoten('w2', 'T2', [machZweig('e2', 'k2')]),
      knoten('w3', 'T3', [machZweig('e3', 'k3')]),
    ];
    const kontext = berechneKlappKontext(w);
    expect([kontext.get('k1'), kontext.get('k2'), kontext.get('k3')]).toEqual([
      '1. Vorkommen', '2. Vorkommen', '3. Vorkommen',
    ]);
  });
});
