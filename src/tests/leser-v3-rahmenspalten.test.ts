import { describe, expect, it } from 'vitest';
import { rahmenBild, type RahmenLage } from '../pages/gesetz-leser/v3/rahmenSpalten';

// ─── Die Rahmen-Entscheidung an JEDER Breite (H4 18.8.2026 · D32/D33 7.9.2026) ─
//
// `rahmenBild` ist eine reine Funktion — sie lässt sich für jede Breite
// nachrechnen, nicht nur für die drei, die ein Bildbogen zufällig trifft (§2,
// dieselbe Begründung wie bei `kopfStufen`/`useElementBreite`). Der e2e-Fall
// `e2e/leser-v3-rahmen.e2e.ts` misst dieselben Zusagen im echten Browser; diese
// Datei sichert die ARITHMETIK ab, auch dort, wo kein Screenshot hinkommt.
//
// ── §6.3-DEKLARATION (D33, David 7.9.2026) · DIE DRITTE SPUR IST WEG ─────────
// Diese Datei prüfte bis zum 7.9.2026 die Ä60-(c)-Aufweitung: der Rahmen wuchs
// beim Öffnen des Rechtsprechungs-Blatts auf 1320 px, das Blatt bekam eine
// eigene 22-rem-Spur, und unterhalb von 82.5 rem wich dafür die Gliederung auf
// ihre Schiene. GEMESSEN am gebauten Stand (7.9.2026, @1440, OR) kostete das den
// Leser bei jedem Klick auf «⚖ Rechtsprechung» 88 px Seitenversatz und 124 px
// Textbreite — jede Zeile des gelesenen Artikels brach neu um, und der geklickte
// Knopf floh um 178 px nach rechts. David-Entscheid: Variante A, das Blatt
// überlagert. Damit fallen `LESER_MAX_REM`, `blattOffen`, `breite`,
// `schieneHoltPlatz` und `lesemassMaxRem` — und mit ihnen die Fälle, die sie
// geprüft haben. Deklarierte fachliche Änderung, kein Refactoring; die
// gemessenen Zahlen von damals stehen unverändert im Dateikopf von
// `rahmenSpalten.ts` und in `abnahme/design-identitaet/R6E-LESER.md`.
//
// ROT ZU BEKOMMEN (§6.7, gesehen): in `rahmenSpalten.rahmenBild`
// `spurVersatzRem` fest auf `0` setzen ⇒ die drei Versatz-Fälle scheitern
// (308 / 56 / 0 px sind die Kante, an der die Erlass-Suche beginnt, D32);
// `gliederungSpalte` auf `spaltenLage` verkürzen ⇒ der Schienen-Fall scheitert.

const REM = 16;
/** Fenster → Raum: die Aussenabstände des Route-Wrappers sind 2 × 24 px. */
const raumFuer = (fensterPx: number, ruhePx = Math.min(1072, fensterPx - 48)) =>
  ({ raumPx: fensterPx - 48, ruhePx, remPx: REM });

const LAGE: RahmenLage = {
  raum: raumFuer(1440),
  spaltenLage: true,
  tocOffen: true,
  ruheForm: 'rechts',
};

describe('D33 · das Beiwerk-Blatt bekommt keine Spur — der Rahmen hat zwei', () => {
  it('@1440 stehen Gliederung und Text, und der Rahmen wird NICHT angefasst', () => {
    const b = rahmenBild(LAGE);
    expect(b.blattForm, 'auf D überlagert das Blatt, es steht nicht in der Zeile').toBe('rechts');
    expect(b.gliederungSpalte).toBe(true);
    expect(b.schiene).toBe(false);
    expect(b.spalten).toBe('18rem minmax(0,1fr)');
  });

  it('die Gliederungsspalte hängt NUR am Nutzerwillen, nicht mehr an der Breite', () => {
    // Vor D33 wich sie zwischen 1024 und 1391 px der Blatt-Spur; ohne Spur gibt
    // es dafür keinen Grund mehr — offen bleibt offen, auf jeder Breite.
    for (const fenster of [1024, 1150, 1280, 1367, 1440, 1920]) {
      const b = rahmenBild({ ...LAGE, raum: raumFuer(fenster) });
      expect(b.gliederungSpalte, `@${fenster}`).toBe(true);
      expect(b.schiene, `@${fenster}`).toBe(false);
      expect(b.spalten, `@${fenster}`).toBe('18rem minmax(0,1fr)');
    }
  });

  it('eingeklappt steht die Schiene — und sie ist der einzige Grund dafür', () => {
    const b = rahmenBild({ ...LAGE, tocOffen: false });
    expect(b.gliederungSpalte).toBe(false);
    expect(b.schiene).toBe(true);
    expect(b.spalten).toBe('2.25rem minmax(0,1fr)');
  });
});

// ── D32 · DIE KANTE, AN DER DIE ERLASS-SUCHE BEGINNT ────────────────────────
// `spurVersatzRem` ist die Breite der linken Spur SAMT Abstand — also genau der
// Punkt, an dem die Lese-Zelle anfängt. Die Kopfzeile stellt ihre linke Zone so
// breit; damit steht die Suche über dem Gesetz statt über der Gliederung
// (Befund 7.9.2026: Feld x 184 gegen Textspalte x 492, Δ 308 px).
describe('D32 · der Versatz der Lese-Zelle', () => {
  it('Spalte 308 px · Schiene 56 px · ohne Spur 0 px', () => {
    expect(rahmenBild(LAGE).spurVersatzRem * REM, 'Gliederungsspalte 18 + 1.25 rem').toBe(308);
    expect(rahmenBild({ ...LAGE, tocOffen: false }).spurVersatzRem * REM, 'Schiene 2.25 + 1.25 rem').toBe(56);
    expect(rahmenBild({ ...LAGE, spaltenLage: false }).spurVersatzRem, 'ohne Spur kein Versatz').toBe(0);
  });

  it('der Schriftregler skaliert den Versatz mit (rem, nicht px)', () => {
    // Die Zahl ist ein rem-Wert; bei 20-px-Wurzel sind dieselben 19.25 rem 385 px.
    const gross = { raumPx: 1392, ruhePx: 1340, remPx: 20 };
    expect(rahmenBild({ ...LAGE, raum: gross }).spurVersatzRem * 20).toBe(385);
  });
});

// ── Die Artikelform an ihrer Schwelle (W2·24-R6b, unverändert gültig) ───────
describe('die Artikelform kippt an SPIEGEL_MIN_BREIT — und im Pane nie', () => {
  it('breit @1440, Zeile in der engen Lage, Zeile im Pane', () => {
    // @1440: Zelle = 1072 − 308 = 764 px ≥ 448 ⇒ Breitform.
    expect(rahmenBild(LAGE).satzspiegel).toBe('breit');
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
});

describe('die Ränder des Bildes', () => {
  it('ohne Spalten-Lage (unter 1024 px) und im Pane gibt es kein Grid', () => {
    const schmal = rahmenBild({ ...LAGE, spaltenLage: false, raum: raumFuer(1000) });
    expect(schmal.blattForm).toBe('rechts');
    expect(schmal.spalten).toBeUndefined();
    expect(schmal.gliederungSpalte).toBe(false);
    expect(schmal.schiene).toBe(false);
    // Im Pane ist die Gestalt `'unten'` — die harte Regel «nie drei vertikale
    // Flächen im Split-View» bleibt unberührt, egal wie breit es ist.
    const pane = rahmenBild({ ...LAGE, ruheForm: 'unten', raum: raumFuer(2560) });
    expect(pane.blattForm).toBe('unten');
    expect(pane.satzspiegel, 'im Pane dieselbe Form wie in der anderen Hälfte').toBe('zeile');
  });

  it('ohne Messung (erster Render, kein `<main>`) bleibt alles wie bisher', () => {
    const b = rahmenBild({ ...LAGE, raum: null });
    expect(b.blattForm).toBe('rechts');
    expect(b.spurVersatzRem * REM, 'die Spur steht auch ohne Messung — sie ist eine rem-Zahl').toBe(308);
  });
});
