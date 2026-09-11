import { describe, it, expect } from 'vitest';
import { entscheidZahl, type EntscheidQuelle } from '../pages/gesetz-leser/entscheidZahl';

// ═══ W2·26/Z3 · DIE DOPPELZAHL-REGEL DER RUBRIK «ENTSCHEIDE» ════════════════
//
// Zweitblick-Auflage zu PR #788: die Regel stand als drei Ausdrücke im
// JSX-Bauteil und war nur über den Browser prüfbar. Sie ist jetzt eine reine
// Funktion (§2/§3) und wird hier direkt gemessen — billiger und schärfer als
// ein e2e, weil jede Kombination einzeln durchgespielt werden kann.
//
// DIE ZUSAGE, zweiseitig:
//  (a) FILTER AKTIV  ⇒ die Marke nennt die GEFILTERTE Zahl (die Zahl der Zeilen,
//      die das Aufklappen wirklich zeigt), die Grundgesamtheit steht im `title`.
//  (b) FILTER INAKTIV ⇒ EINE Zahl aus der Zähl-Datei, KEIN `title`-Zusatz.
//      Ohne diese Hälfte wäre (a) mit «immer einen title schreiben» erfüllbar
//      (§6.7), und die R6c/D30-Zusage «die Zahl springt beim Shard-Eintreffen
//      nicht um» stünde unbewacht.
//
// ROT ZU BEKOMMEN (§6.7, gefahren 11.9.2026): in `entscheidZahl.ts`
//  · `const gezeigt = roh` setzen (Filter ignorieren)      ⇒ (a1)/(a2) rot
//  · den `title` bedingungslos schreiben                    ⇒ (b1)/(c) rot
//  · `roh > gezeigt` durch `roh >= gezeigt` ersetzen        ⇒ (c) rot

const ZITAT = 'Art. 198 ZPO';
const quelle = (kanten: number, zeit = false, kanton = false): EntscheidQuelle => (
  { kanten, zeitAktiv: zeit, kantonAktiv: kanton }
);

describe('entscheidZahl — W2·26/Z3: eine Zahl in der Zeile, die Grundgesamtheit im title', () => {
  it('(a1) Zeitfilter aktiv: die Marke nennt die gefilterte Zahl, der title die Grundgesamtheit', () => {
    const e = entscheidZahl(quelle(5, true), 12, 0, ZITAT);
    expect(e.anzahl, 'die Marke zeigt nicht die Zahl der gezeigten Zeilen').toBe(5);
    expect(e.titel).toBe(`5 im aktiven Filter — 12 insgesamt zu ${ZITAT}`);
  });

  it('(a2) Kantonsfilter aktiv: dieselbe Regel — der Filter-GRUND ändert sie nicht', () => {
    const e = entscheidZahl(quelle(3, false, true), 12, 0, ZITAT);
    expect(e.anzahl).toBe(3);
    expect(e.titel).toBe(`3 im aktiven Filter — 12 insgesamt zu ${ZITAT}`);
  });

  it('(b1) kein Filter: EINE Zahl aus der Zähl-Datei, kein title-Zusatz', () => {
    const e = entscheidZahl(quelle(3), 11, 0, ZITAT);
    // Die Zähl-Datei gewinnt (R6c/D30): sie ist gezählt, nicht gefiltert, und
    // darum dieselbe Zahl vor und nach dem Eintreffen des Shards.
    expect(e.anzahl).toBe(11);
    expect(e.titel, 'ein title ohne Aussage — Screenreader lesen ihn mit (§8)').toBeUndefined();
  });

  it('(b2) kein Filter, keine Zähl-Datei: die Kanten der Quelle, die auch die Liste zeigt', () => {
    const e = entscheidZahl(quelle(4), null, 9, ZITAT);
    expect(e.anzahl).toBe(4);
    expect(e.titel).toBeUndefined();
  });

  it('(b3) ohne Quelle und ohne Zähl-Datei: der Leitfall-Fallback (Stand vor R6c)', () => {
    const e = entscheidZahl(null, null, 7, ZITAT);
    expect(e.anzahl).toBe(7);
    expect(e.titel).toBeUndefined();
  });

  it('(b4) ohne Quelle, aber mit Zähl-Datei: die Zähl-Datei — und nie ein Filter-title', () => {
    // `null` heisst «der Shard ist noch nicht da»; ein Filter kann dann nicht
    // aktiv sein, und ein title über eine Verkürzung wäre eine Behauptung.
    const e = entscheidZahl(null, 11, 3, ZITAT);
    expect(e.anzahl).toBe(11);
    expect(e.titel).toBeUndefined();
  });

  it('(c) Filter aktiv, aber er verkürzt nichts: EINE Zahl, kein title', () => {
    // «5 im aktiven Filter — 5 insgesamt» wäre Lärm (§8).
    const e = entscheidZahl(quelle(12, true), 12, 0, ZITAT);
    expect(e.anzahl).toBe(12);
    expect(e.titel).toBeUndefined();
  });

  it('(d) die Zahl der Marke ist IMMER die Zahl der gezeigten Zeilen, wenn ein Filter greift', () => {
    // Die eigentliche D30-Invariante, über eine Matrix statt an einem Beispiel:
    // sobald ein Filter aktiv ist, darf die Marke nur die Kanten-Zahl nennen.
    for (const zeit of [true, false]) {
      for (const kanton of [true, false]) {
        for (const kanten of [0, 1, 5, 12]) {
          const e = entscheidZahl(quelle(kanten, zeit, kanton), 12, 0, ZITAT);
          const erwartet = zeit || kanton ? kanten : 12;
          expect(e.anzahl, `zeit=${zeit} kanton=${kanton} kanten=${kanten}`).toBe(erwartet);
          // Und der title steht genau dann, wenn wirklich verkürzt wird.
          expect(Boolean(e.titel), `title bei zeit=${zeit} kanton=${kanton} kanten=${kanten}`)
            .toBe((zeit || kanton) && kanten < 12);
        }
      }
    }
  });

  it('(e) rein und deterministisch (§2): zweimal gerufen, zweimal dasselbe', () => {
    const a = entscheidZahl(quelle(5, true), 12, 0, ZITAT);
    const b = entscheidZahl(quelle(5, true), 12, 0, ZITAT);
    expect(a).toEqual(b);
  });
});
