import { describe, expect, it } from 'vitest';
import {
  LESER_MAX_REM, rahmenBild, type RahmenLage,
} from '../pages/gesetz-leser/v3/rahmenSpalten';

// ─── Ä60 (c) · Die Rahmen-Entscheidung an JEDER Breite (H4, 18.8.2026) ───────
//
// `rahmenBild` ist eine reine Funktion — sie lässt sich für jede Breite
// nachrechnen, nicht nur für die drei, die ein Bildbogen zufällig trifft (§2,
// dieselbe Begründung wie bei `kopfStufen`/`useElementBreite`). Der e2e-Fall
// `e2e/leser-v3-rahmen.e2e.ts` misst dieselben Zusagen im echten Browser; diese
// Datei sichert die ARITHMETIK ab, auch dort, wo kein Screenshot hinkommt.
//
// Rot zu bekommen: `LESER_MAX_REM` verkleinern (die Gliederungsspalte fiele auch
// dort, wo alles passt), `blattSpur` fest auf `false` (nichts bekommt je eine
// Spur — genau der Ist-Zustand vor H4) oder die Aufweitung zentrieren statt zu
// verankern (der letzte Block unten misst die Verankerung mit Zahlen).

const REM = 16;
/** Fenster → Raum: die Aussenabstände des Route-Wrappers sind 2 × 24 px. */
const raumFuer = (fensterPx: number, ruhePx = Math.min(1072, fensterPx - 48)) =>
  ({ raumPx: fensterPx - 48, ruhePx, remPx: REM });

const LAGE: RahmenLage = {
  raum: raumFuer(1440),
  spaltenLage: true,
  tocOffen: true,
  blattOffen: true,
  ruheForm: 'rechts',
};

describe('Ä60 (c) · das Blatt bekommt eine eigene Spur — und wo nicht', () => {
  it('Positiv-Sonde: die Grundlage stimmt (84 rem = 18 + 2 + 40 + 2 + 22)', () => {
    // 84 → 82.5 am 29.8.2026: SPUR_ABSTAND 2 → 1.25 rem (Auftrag David,
    // deklarierte fachliche Änderung — weniger Abstand Gliederung ↔ Text).
    expect(LESER_MAX_REM).toBe(82.5);
    expect(LESER_MAX_REM * REM).toBe(1320);
  });

  it('@1440 stehen alle drei Spuren, und der Rahmen wächst auf genau 1320 px', () => {
    const b = rahmenBild(LAGE);
    expect(b.blattForm).toBe('spalte');
    expect(b.gliederungSpalte).toBe(true);
    expect(b.schiene).toBe(false);
    expect(b.spalten).toBe('18rem minmax(0,1fr) 22rem');
    expect(b.breite?.width).toBe('var(--leser-max-w)');
    expect((b.breite as Record<string, string>)['--leser-max-w']).toBe('1320px');
  });

  it('unter 82.5 rem weicht die GLIEDERUNG, nie das Lesemass', () => {
    for (const fenster of [1024, 1100, 1150, 1280, 1367]) {
      const b = rahmenBild({ ...LAGE, raum: raumFuer(fenster) });
      expect(b.blattForm, `@${fenster}`).toBe('spalte');
      expect(b.gliederungSpalte, `@${fenster}: Gliederungsspalte UND Blatt — der Text wird gequetscht`).toBe(false);
      expect(b.schiene, `@${fenster}: keine Schiene — die Gliederung wäre unerreichbar`).toBe(true);
      expect(b.schieneHoltPlatz, `@${fenster}: der Schienen-Griff schlösse das Blatt nicht`).toBe(true);
      // Und die Lesespalte, die dabei bleibt: Raum − Schiene − 2 × Abstand − Blatt.
      const lese = (fenster - 48) - 36 - 20 - 20 - 352;
      expect(lese, `@${fenster}: Lesespalte ${lese} px unter dem 448-px-Boden`).toBeGreaterThanOrEqual(448);
    }
  });

  it('ab 82.5 rem Raum bleibt die Gliederungsspalte stehen', () => {
    for (const fenster of [1368, 1440, 1920, 2560]) {
      const b = rahmenBild({ ...LAGE, raum: raumFuer(fenster) });
      expect(b.gliederungSpalte, `@${fenster}`).toBe(true);
      expect((b.breite as Record<string, string>)['--leser-max-w'],
        `@${fenster}: der Rahmen wächst über seine drei Spuren hinaus`).toBe('1320px');
    }
  });

  // ── §6.3-DEKLARATION (W2·24-R6b, 6.9.2026) · DIE ZWEI RANDSPUREN SIND WEG ──
  // R6/M1 hatte hier einen ZWEITEN Grund zur Rahmen-Aufweitung eingezogen: die
  // Randnotiz-Spalte des Satzspiegels. Auf Davids Befund vom 6.9.2026 («der
  // platz rechts und links neben dem gesetz … nimmt viel platz vom gesetzestext
  // weg») sind BEIDE Randspuren ersatzlos gefallen — damit fällt auch ihr
  // Aufweitungs-Grund, und der Fall prüft wieder, was er vor R6 geprüft hat:
  // ohne Blatt keine Blatt-Spur UND keine Aufweitung. Deklarierte fachliche
  // Änderung, kein Refactoring; die Aufweitung fürs BLATT bewachen die Fälle
  // darüber und darunter unverändert.
  it('geschlossenes Blatt: keine Blatt-Spur, keine Aufweitung', () => {
    const b = rahmenBild({ ...LAGE, blattOffen: false });
    expect(b.blattForm).toBe('rechts');
    expect(b.spalten).toBe('18rem minmax(0,1fr)');
    expect(b.breite, 'ohne Blatt-Spur wird der Rahmen nicht angefasst').toBeUndefined();
  });

  // ── §6.3-DEKLARATION (W2·24-R6b) · DIE ARTIKELFORM AN IHRER SCHWELLE ───────
  // NEU statt des alten «zu schmal für die Randnotiz»-Falls: die Randnotiz gibt
  // es nicht mehr, ihre Schwelle auch nicht. Was bleibt, ist die eine Schwelle,
  // die `satzspiegel.ts` noch führt — ab wann der Artikel die Breitform trägt
  // (Randtitel + Fassung im Kopf, Bezüge als eine Zeile). Beide Richtungen, sonst
  // wäre es ein Tor, das nicht scheitern kann (§6.7).
  it('die Artikelform kippt an SPIEGEL_MIN_BREIT — und im Pane nie', () => {
    // @1440: Zelle = 1072 − 308 = 764 px ≥ 448 ⇒ Breitform.
    expect(rahmenBild({ ...LAGE, blattOffen: false }).satzspiegel).toBe('breit');
    // Enge Lage (Fenster 1024 mit ausgeklappter App-Seitenleiste: 1024 − 256 −
    // 48 = 720 px Raum): nach der Gliederungsspur bleiben der Zelle 720 − 308 =
    // 412 px, unter SPIEGEL_MIN_BREIT (28 rem = 448) ⇒ Zeilenform.
    const engRaum = { raumPx: 720, ruhePx: 720, remPx: REM };
    expect(rahmenBild({ ...LAGE, raum: engRaum }).satzspiegel).toBe('zeile');
    // Ohne Spalten-Lage (Handy) und im Pane immer die Zeilenform — dieselbe
    // Form in beiden Hälften des Split-Views (Auftrag David, (d)).
    expect(rahmenBild({ ...LAGE, spaltenLage: false, raum: raumFuer(1000) }).satzspiegel).toBe('zeile');
    expect(rahmenBild({ ...LAGE, ruheForm: 'unten', raum: raumFuer(2560) }).satzspiegel).toBe('zeile');
  });

  it('ohne Spalten-Lage (unter 1024 px) und im Pane bleibt alles beim Alten', () => {
    // Kein `spaltenLage` ⇒ kein Grid, keine Spur, keine Aufweitung.
    const schmal = rahmenBild({ ...LAGE, spaltenLage: false, raum: raumFuer(1000) });
    expect(schmal.blattForm).toBe('rechts');
    expect(schmal.spalten).toBeUndefined();
    expect(schmal.breite).toBeUndefined();
    // Im Pane ist die Ruhe-Gestalt `'unten'` — die harte Regel «nie drei
    // vertikale Flächen im Split-View» bleibt unberührt, egal wie breit es ist.
    const pane = rahmenBild({ ...LAGE, ruheForm: 'unten', raum: raumFuer(2560) });
    expect(pane.blattForm).toBe('unten');
    expect(pane.breite).toBeUndefined();
    // R6b: und der Artikel bleibt im Pane in der Zeilenform (Auftrag (d)).
    expect(pane.satzspiegel, 'im Pane dieselbe Form wie in der anderen Hälfte').toBe('zeile');
  });

  it('zu wenig Raum für Text + Blatt ⇒ keine Spur (ausgeklappte App-Seitenleiste)', () => {
    // Schwelle seit 29.8.2026: 54.75 rem = 876 px (SPUR_ABSTAND 1.25 rem).
    const eng = { raumPx: 872, ruhePx: 872, remPx: REM };
    expect(rahmenBild({ ...LAGE, raum: eng }).blattForm).toBe('rechts');
    // Ein Pixel mehr, und die Spur steht — die Schwelle ist keine Zierde.
    expect(rahmenBild({ ...LAGE, raum: { ...eng, raumPx: 876, ruhePx: 876 } }).blattForm).toBe('spalte');
  });

  it('ohne Messung (erster Render, kein `<main>`) bleibt alles wie bisher', () => {
    const b = rahmenBild({ ...LAGE, raum: null });
    expect(b.blattForm).toBe('rechts');
    expect(b.breite).toBeUndefined();
  });

  it('der Schriftregler skaliert die Schwellen mit (rem, nicht px)', () => {
    // Bei 20-px-Wurzel braucht die volle Lage 84 × 20 = 1680 px Raum.
    const gross = { raumPx: 1392, ruhePx: 1340, remPx: 20 };
    const b = rahmenBild({ ...LAGE, raum: gross });
    expect(b.gliederungSpalte, 'bei grösserer Schrift passen die drei Spuren @1440 nicht mehr').toBe(false);
    expect((b.breite as Record<string, string>)['--leser-max-w']).toBe('1392px');
  });
});

// ── DIE VERANKERUNG: der Text weicht nur so weit, wie er muss ───────────────
// Der Rahmen wächst ZUERST in den freien Rand rechts und rückt nur um den Rest
// nach links. Ohne diese Regel schöbe das Öffnen den gelesenen Text @1920 um
// 152 px waagrecht weg, obwohl rechts 400 px frei liegen.
describe('Ä60 (c) · die Aufweitung rückt so wenig wie möglich nach links', () => {
  const dx = (fenster: number) => {
    const b = rahmenBild({ ...LAGE, raum: raumFuer(fenster) });
    return parseFloat(String((b.breite as Record<string, string>).marginInlineStart));
  };

  it('@1920 rückt nichts (der freie Rand rechts trägt die ganze Aufweitung)', () => {
    expect(dx(1920)).toBe(0);
  });

  it('@1440 rückt genau der Rest — 88 px seit dem schmaleren Spur-Abstand (29.8.2026)', () => {
    expect(dx(1440)).toBe(-88);
  });

  it('der Kasten geht auf: Anfang + Breite + Ende = Elternbreite', () => {
    for (const fenster of [1150, 1280, 1440, 1920]) {
      const b = rahmenBild({ ...LAGE, raum: raumFuer(fenster) });
      const s = b.breite as Record<string, string>;
      const summe = parseFloat(s.marginInlineStart) + parseFloat(s['--leser-max-w']) + parseFloat(s.marginInlineEnd);
      expect(summe, `@${fenster}`).toBe(raumFuer(fenster).ruhePx);
    }
  });
});
