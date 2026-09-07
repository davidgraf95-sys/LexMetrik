import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { satzspiegelFuer, type Satzspiegel } from './satzspiegel';

// ═══ Ä60 (c) · WIE BREIT DER LESER IST UND WELCHE SPUREN ER TRÄGT ════════════
//
// David-Entscheid 17.8.2026 (Chat, wörtlich «ja und c, mach so»): von den drei
// Optionen des Spalten-Entscheids gilt **(c)** — der Rahmen des GESETZ-LESERS
// darf breiter werden als eine Textseite, damit Gesetzestext und Beiwerk-Blatt
// nebeneinander stehen statt übereinander. Kein anderer Seitentyp ist berührt:
// `max-w-content` (70 rem, `tailwind.config.js`) bleibt unverändert, die
// Aufweitung geschieht am Leser-Wurzelelement und nur dort.
//
// ── DER BEFUND, DEN DAS BEHEBT (Ä60/Ä59, gemessen 17./18.8.2026, StPO 429) ──
// Das rechts angeschlagene Blatt lag ÜBER dem Lesetext, weil der Rahmen auf
// 1072 px gedeckelt war, das Blatt aber am FENSTER klebt:
//
//   Viewport   Rahmen        Textabsatz     Blatt          verdeckt   Titel
//   1024        24… 999      372… 992        672…1024      320 px     328 px
//   1150        39…1111      435…1055        798…1150      257 px     313 px
//   1280       104…1176      500…1120        928…1280      192 px     248 px
//   1440       184…1256      580…1200       1088…1440      112 px     168 px
//   1920       424…1496      820…1440       1568…1920        0 px       0 px
//
// Erst ab 1920 px läuft das Blatt am Rahmen vorbei — auf jedem realen
// Laptop-Fenster fehlten die Zeilenenden. «Keine feste Blattbreite behebt das»
// (Vollzugsvermerk H3): der Rand rechts der Lesespalte misst @1440 240 px,
// @1280 nur 160 — die Arithmetik, nicht die Zahl, war der Defekt.
//
// ── DIE RECHNUNG, DIE DEN DECKEL SETZT ──────────────────────────────────────
// Der frühere Kommentar im Rahmen («KEINE DRITTE SPUR») rechnete richtig und
// zog den falschen Schluss: 18 rem Gliederung + 40 rem Lesemass + 22 rem Blatt
// samt zwei Abständen à 2 rem sind **84 rem**, der Seitenrahmen bot 67 rem
// (1072 px). Der Zweig war nicht unmöglich, ihm fehlten 272 px. Genau die gibt
// (c) ihm — und keinen Schritt mehr: `LESER_MAX_REM` IST diese Summe. Ein
// Rahmen, der breiter wäre als seine drei Spuren, wäre Fensterbreite für
// Fliesstext (Design-Grundlage Kap. 8 Nr. 7).
//
// ── DIE EINE SCHWELLE: «BEHÄLT DER TEXT SEIN VOLLES LESEMASS?» ──────────────
// Unterhalb von 84 rem passen die drei Spuren nicht zusammen. Statt den Text zu
// quetschen (bei 976 px Raum blieben ihm 272 px = ~30 ch) weicht die
// GLIEDERUNG auf ihre Schiene (2.25 rem) — dasselbe Bauteil, das Ä79 als «den
// einen Griff» festgehalten hat, und ein Klick zurück. Gemessen ergibt das:
//
//   Raum (px)   Spuren                        Lesespalte   ch (StPO)
//    976 (VP 1024)  Schiene · Text · Blatt        524 px      ~56
//   1102 (VP 1150)  Schiene · Text · Blatt        640 px       73  (voll)
//   1232 (VP 1280)  Schiene · Text · Blatt        640 px       73  (voll)
//   1344 (VP≥1392)  Gliederung · Text · Blatt     640 px       73  (voll)
//
// Der Text ist also ab 1150 px Fenster in KEINER Lage schmaler als heute, und
// unter 1024 px ändert sich nichts (dort trägt die Gliederung ohnehin ein
// Sheet, und das Blatt bleibt, was es war — David-Entscheid: «unter 1024 bleibt
// alles wie heute»).
//
// ── GEMESSEN WIRD DER RAUM, NICHT DAS EIGENE ELEMENT ────────────────────────
// `useElementBreite` misst das Wurzelelement — genau das, dessen Breite diese
// Datei VERSTELLT. Als Entscheidungsgrundlage wäre es eine Rückkopplung. Der
// `raum` ist darum die Breite, die die Lesefläche im `<main>` HÄTTE (Fenster
// bzw. Pane minus Aussenabstände, ohne Scrollbar); sie ändert sich, wenn das
// Fenster oder die App-Seitenleiste sich ändert, nie durch diese Datei selbst.

// ── WARUM DAS GRID AUCH EINGEKLAPPT STEHEN BLEIBT (David 16.8.2026) ─────────
// Befund am H1-Stand, @1440 reproduziert: klappte man die Gliederung ein,
// verschwand das Grid ganz. Die Lesespalte sprang um 175 px nach links
// (x 600 → 424) und gewann ganze 31 px Breite (641 → 672, mehr lässt das
// Lesemass nicht zu) — ein Sprung ohne Gewinn, und der einzige Weg zurück war
// ein unbeschriftetes 24-px-☰ an der GEGENÜBERLIEGENDEN Fensterkante (x = 1101).
// Darum bleibt die linke Spur immer stehen und wird zur Schiene (Ä79).

/** Breite der Gliederungsspalte (rem) — Ist-Wert des Rahmens, hier benannt. */
const SPUR_GLIEDERUNG = 18;
/** Breite der eingeklappten Gliederungs-Schiene (rem), `LeserGliederungSchiene`. */
const SPUR_SCHIENE = 2.25;
/** Breite des Beiwerk-Blatts (rem) — Kap. 4d «Panel rechts 22rem». */
const SPUR_BLATT = 22;
/** Abstand zwischen zwei Spuren (rem) = `gap-5` (LeserLeseZeile.tsx).
 *  2 → 1.25 rem am 29.8.2026 (Auftrag David: «weniger Abstand Gesetz ↔
 *  Gliederung»); Folgewerte LESER_MAX_REM/RAUM_MIN_BLATT rechnen mit. */
const SPUR_ABSTAND = 1.25;
/** Lesemass der Lesespalte (rem) = `max-w-reading`, `LeserLesespalte`. */
const LESEMASS = 40;

// ── LESEMASS_MAX · Auftrag David 21.8.2026, wörtlich «können wir machen, dass
//    der gesetzestext bei verfügbarer breite vom bildschirm oder wenn
//    gliederung eingeklappt ist breiter wird» — zugleich Erledigung von
//    Cowork-Befund 50 und der ENTSCHEID zum offenen Satzspiegel-Punkt (Kap. 5
//    im Fahrplan): der Text DARF breiter werden, aber mit einem Deckel statt
//    Vollbreite (Design-Grundlage Kap. 8 Nr. 7 «nie Fensterbreite für
//    Fliesstext»). ─────────────────────────────────────────────────────────
//
// HERLEITUNG (gemessen 21.8.2026 am gebauten Stand, längster mehrzeiliger
// Fliesstext-Absatz je Erlass @1440, Methode von `leser-lesemass.e2e.ts`):
//   · `leser-lesemass.e2e.ts` bewacht als HARTE Zusage SC 1.4.8 (WCAG): Zeile
//     ≤ 80 ch. Diese Zusage gilt unverändert weiter — der Auftrag nennt eine
//     Zielspanne «~75–90 Zeichen», nicht eine Anhebung der WCAG-Decke; wo
//     beides zusammentrifft, gewinnt die geprüfte Accessibility-Zusage.
//   · Erster Versuch 46 rem: StGB (nicht in `ERLASSE`, aber real ausgeliefert)
//     stieg auf 81 ch — ÜBER der Decke. 45 rem = 720 px bringt StGB auf 78 ch
//     zurück (2 ch Reserve) und hält alle anderen Stichproben darunter: ZGB 68→75,
//     OR 71→77, StPO 73→75, VMWG 74→74 ch (unverändert — der längste Absatz
//     bricht an derselben Stelle um). +5 rem = **+12.5 %** gegenüber `LESEMASS`
//     — spürbar breiter, aber knapper als «ein Viertel», weil StGB die 80-ch-
//     Decke schon bei deutlich weniger Zuwachs erreicht (Ausgangswert 73 ch bei
//     40 rem war bereits nah an der Decke). Die 75–90-ch-Zielspanne des
//     Auftrags wird damit nur am UNTEREN Rand erfüllt — offengelegte
//     Abweichung (§7): Ursache ist die vorbestehende SC-1.4.8-Zusage, nicht
//     eine engere Lesung des Auftrags.
//
// WARUM EIN DECKEL UND KEINE VOLLBREITE: die Lese-Zelle (`minmax(0,1fr)` in
// `rahmenBild.spalten`) ist bei offener Gliederung @1440 bereits 752 px breit,
// eingeklappt (Schiene) 1004 px — beides mehr als der Deckel. `width:100%` +
// `max-width` (unverändertes CSS-Muster von `max-w-reading`) liefert genau die
// verlangte Eigenschaft von selbst: die Spalte wächst mit dem verfügbaren Raum
// der GRID-Zelle (schon vorhanden über `useRahmenRaum`/`rahmenBild`, "eine
// Breiten-Quelle", A-8) und STOPPT am Deckel — der Rest geht in Randluft. Keine
// dritte Schwelle, keine neue Messung: die Zelle ist längst dynamisch, nur der
// Deckel selbst war bislang zu knapp gesetzt, um je zu greifen.
//
// ANWENDUNG: `#lc-lesespalte` (`LeserLesespalte`) UND `.max-w-normtext`
// (Artikel-Fliesstext `ArtikelLeser` + Ingress `ErlassKopfBlock`) werden NUR
// innerhalb des V3-Wurzelelements (`index.css`,
// `.lc-leser[data-leser-v3="rahmen"]`) auf denselben Wert gehoben — sonst
// bekäme die Kopfzeile (ungedeckelt, volle Zellenbreite) einen anderen rechten
// Rand als der Fliesstext (genau der Fehler, den A37 behoben hat). V1 (Ist-
// Hülle) ist unberührt: die Selektoren sind auf `[data-leser-v3="rahmen"]`
// gescoped, das V1 nie trägt.
export const LESEMASS_MAX = 45;

/**
 * Deckel des Leser-Rahmens (rem) = die Summe seiner drei Spuren samt Abständen.
 * NICHT `max-w-content`: der gilt für jede andere Seite unverändert weiter.
 *
 * BLEIBT auf `LESEMASS` (40), nicht `LESEMASS_MAX` (45): diese Zahl entscheidet
 * NUR, wie weit der RAHMEN wachsen darf und ob die Gliederung ihre Spalte
 * behält (`vollesLesemass` unten) — beides seit H4 gemessen und unverändert
 * (`leser-v3-rahmenspalten.test.ts`: 84 rem = 1344 px, Rückung −112 px @1440).
 * Sie an `LESEMASS_MAX` zu hängen, sähe nach «derselben Quelle» aus, verschöbe
 * aber diese Schwelle auf 89 rem = 1424 px — mehr, als @1440 real an Raum
 * steht (≈1392 px) — und liesse die Gliederungsspalte dort in die Schiene
 * kippen: sie bräche genau die Zusage, die dieser Fix halten soll (aside=1
 * bleibt, `leser-v3-rahmen.e2e.ts` (a)). Die eigentliche Reserve für
 * `LESEMASS_MAX` steht darum NICHT hier, sondern in `RahmenBild.lesemassMaxRem`
 * (Kommentar dort).
 */
export const LESER_MAX_REM = SPUR_GLIEDERUNG + SPUR_ABSTAND + LESEMASS + SPUR_ABSTAND + SPUR_BLATT; // 82.5 (seit 29.8.2026; vorher 84)

/**
 * Kleinste Lesespalte, die das Blatt als Spur überhaupt rechtfertigt (rem).
 *
 * WOHER DIE ZAHL: 28 rem = 448 px sind bei gemessenen 8.5 px/ch (StPO, 17-px-
 * Stufe: 620 px Absatzbreite = 73 ch) rund **46 ch** — die Untergrenze, die die
 * Design-Grundlage für eine Lesespalte nennt. Sie greift real erst, wenn die
 * App-Seitenleiste ausgeklappt ist (Fenster 1200 px − 256 − 48 = 896 < 900);
 * ohne sie ist der Raum ab 1024 px Fenster immer ≥ 976 px. Ein Deckel, der
 * NIE greifen kann, wäre kein Deckel (§6.7) — dieser kann.
 */
const LESE_MIN = 28;
/** Raum (rem), unter dem das Blatt keine eigene Spur bekommt. */
const RAUM_MIN_BLATT = SPUR_SCHIENE + SPUR_ABSTAND + LESE_MIN + SPUR_ABSTAND + SPUR_BLATT; // 54.75 (seit 29.8.2026; vorher 56.25)

export interface RahmenRaum {
  /** Breite (px), die dem Leser im `<main>` zur Verfügung steht. */
  raumPx: number;
  /** Breite (px), die der Rahmen ohne Aufweitung hat (gedeckelte Elternbreite). */
  ruhePx: number;
  /** Gemessene Wurzel-Schriftgrösse (px) — der Schriftregler verstellt sie (R3). */
  remPx: number;
}

export interface RahmenLage {
  /** Gemessener Raum; `null`, solange nichts gemessen ist (dann bleibt alles wie bisher). */
  raum: RahmenRaum | null;
  /** Steht die Gliederung auf dieser Fläche überhaupt als Spalte zur Wahl? */
  spaltenLage: boolean;
  /** Hat der Nutzer die Gliederung offen? */
  tocOffen: boolean;
  /** Ist das Beiwerk-Blatt offen? */
  blattOffen: boolean;
  /** Gestalt, die das Blatt ohne eigene Spur hätte (`kopfStufen.panelForm`). */
  ruheForm: 'rechts' | 'unten';
}

export interface RahmenBild {
  /** Gestalt des Beiwerk-Blatts — `'spalte'` ist die neue, nicht überlagernde. */
  blattForm: 'rechts' | 'unten' | 'spalte';
  /** Steht die Gliederung als 18-rem-Spalte? */
  gliederungSpalte: boolean;
  /** Steht statt ihrer die schmale Schiene? */
  schiene: boolean;
  /**
   * Muss ein Klick auf die Schiene das Blatt schliessen? (Es hat ihren Platz.)
   *
   * ── P1-1 (Bug-Check 18.8.2026) · DIE FRAGE HING AM FALSCHEN ZUSTAND ────────
   * Bis zum H4-Nachzug lautete die Bedingung `blattSpur && tocOffen &&
   * !gliederungSpalte` — sie las also, ob der Nutzer die Gliederung GERADE
   * offen hat. Reproduziert @1280 (StPO, `p1/r2-schiene.cjs`): klappt man die
   * Gliederung ZUERST ein und öffnet DANN das Blatt, ist `tocOffen` falsch, der
   * Schienen-Griff schliesst das Blatt also nicht — und weil der Platz für
   * beide nicht reicht, bleibt die Spalte aus. Gemessen: `[data-v3-aside]`
   * nach dem ersten Klick **0**, Grid unverändert `36px 780px 352px`; erst der
   * ZWEITE Klick brachte sie (`288px 752px`). Dazwischen stand `tocOffen`
   * still auf `true`, ohne dass etwas sichtbar war — der nächste Esc hätte die
   * Gliederung aufspringen lassen.
   *
   * Die Frage ist nicht «hat der Nutzer die Gliederung offen», sondern «steht
   * die Schiene, WEIL das Blatt ihren Platz hat». Genau das ist
   * `blattSpur && !vollesLesemass`: unterhalb von 84 rem schliessen sich Spalte
   * und Blatt aus (Herleitung oben), oberhalb nicht — dort holt der Griff
   * keinen Platz, er blendet nur ein. Beweis: `leser-v3-rahmenspalten.test.ts`
   * («ein Klick genügt»), Sichtbeweis `leser-v3-rahmen` (g).
   */
  schieneHoltPlatz: boolean;
  /** `grid-template-columns` der Lese-Zeile; `undefined` = kein Grid (wie bisher). */
  spalten: string | undefined;
  /** Aufweitung des Wurzelelements; `undefined` = unverändert wie bisher. */
  breite: CSSProperties | undefined;
  /**
   * Deckel für `--leser-lesemass-max` (rem) — STATISCH, unabhängig von
   * `blattOffen` (Fix 21.8.2026, CI-Rot PR #559).
   *
   * ── DER BEFUND ───────────────────────────────────────────────────────────
   * `LESEMASS_MAX` (`index.css`, `--leser-lesemass-max`) stand bis zu diesem
   * Fix als FLACHER Wert (45 rem, immer) am Wurzelelement — unabhängig davon,
   * ob das Blatt gerade eine Spur belegt. Geschlossen füllte die Lese-Zelle
   * (`minmax(0,1fr)`) den ganzen Rahmen und der Deckel griff bei 45 rem;
   * offen nimmt dieselbe Zelle nur, was der Rahmen NACH Gliederung, Blatt und
   * zwei Abständen übrig lässt — bei voller Gliederungsspalte @1440 sind das
   * strukturell nur 40 rem (`LESER_MAX_REM` reserviert exakt so viel, siehe
   * dort). Der flache Deckel wechselte beim Öffnen also von 45 auf faktisch
   * 40 rem — ein Reflow, den Ä60(c) («die Spur nimmt den freien Rand, nie den
   * Text») und die CLS-Zusage (`leser-v3-kontext-cls.e2e.ts`) ausschliessen.
   *
   * ── DER FIX: DIESELBE RESERVE, IMMER ────────────────────────────────────
   * Statt den Deckel erst beim Öffnen schrumpfen zu lassen, rechnet er die
   * Blatt-Spur-Reserve STATISCH ein — sobald der Raum eine Spur überhaupt
   * ERLAUBEN würde (`ruheForm === 'rechts' && spaltenLage && passt`, exakt die
   * Bedingung von `blattSpur` MINUS `blattOffen`). Ob die Gliederung dabei als
   * Spalte oder Schiene stünde, folgt derselben Fallunterscheidung wie
   * `gliederungSpalte`, nur mit `blattSpur` hypothetisch `true` gerechnet
   * (`!blattSpur || vollesLesemass` wird dann zu `vollesLesemass`) — das ist
   * `gliederungWennOffen` unten. Keine neue Konstante: dieselben `SPUR_*` und
   * derselbe `LESER_MAX_REM`, nur diesmal für die TEXT-Zelle statt für den
   * Rahmen gerechnet. `blattOffen` fliesst nirgends ein — der Wert ist beim
   * ersten Render derselbe wie nach jedem Klick auf den Panel-Zähler.
   */
  lesemassMaxRem: number;
  satzspiegel: Satzspiegel; // Artikelform (W2·24-R6b) — Herleitung in `./satzspiegel`
}

/**
 * Die eine Entscheidung über Rahmenbreite und Spuren — rein, an jeder Breite
 * nachrechenbar (§2), Beweis in `src/tests/leser-v3-rahmenspalten.test.ts`.
 */
export function rahmenBild(lage: RahmenLage): RahmenBild {
  const { raum, spaltenLage, tocOffen, blattOffen, ruheForm } = lage;
  const rem = raum?.remPx ?? 16;
  const passt = raum != null && raum.raumPx >= RAUM_MIN_BLATT * rem;
  // Eine eigene Spur bekommt das Blatt nur dort, wo es sonst ÜBER dem Text läge
  // (`'rechts'`) — im Pane und auf dem Handy bleibt es das Bottom-Sheet, weil
  // dort die harte Regel «nie drei vertikale Flächen» gilt (Kap. 4d).
  const blattSpur = blattOffen && ruheForm === 'rechts' && spaltenLage && passt;
  // Die Gliederungsspalte bleibt genau so lange, wie der Text sein volles
  // Lesemass behält; darunter weicht sie auf ihre Schiene (Herleitung oben).
  const vollesLesemass = raum != null && raum.raumPx >= LESER_MAX_REM * rem;
  const gliederungSpalte = spaltenLage && tocOffen && (!blattSpur || vollesLesemass);
  const schiene = spaltenLage && !gliederungSpalte;

  // `lesemassMaxRem` (Feld-Kommentar bei `RahmenBild`): dieselbe Bedingung wie
  // `blattSpur`, aber OHNE `blattOffen` — «könnte das Blatt hier je eine Spur
  // bekommen», nicht «hat es gerade eine».
  const blattSpurMoeglich = ruheForm === 'rechts' && spaltenLage && passt;
  const gliederungWennOffen = spaltenLage && tocOffen && vollesLesemass;
  const seiteWennOffenRem = gliederungWennOffen ? SPUR_GLIEDERUNG : SPUR_SCHIENE;
  // Klammer wie `aufweitung`: bis `LESER_MAX_REM`, nie über den echten Raum.
  const rootWennOffenPx = raum
    ? Math.max(raum.ruhePx, Math.min(LESER_MAX_REM * rem, raum.raumPx))
    : null;
  const lesemassMaxRem = blattSpurMoeglich && rootWennOffenPx != null
    ? Math.min(LESEMASS_MAX, rootWennOffenPx / rem - seiteWennOffenRem - 2 * SPUR_ABSTAND - SPUR_BLATT)
    : LESEMASS_MAX;

  const spurenPx = spaltenLage ? ((gliederungSpalte ? SPUR_GLIEDERUNG : SPUR_SCHIENE) + SPUR_ABSTAND + (blattSpur ? SPUR_BLATT + SPUR_ABSTAND : 0)) * rem : 0;
  // W2·24-R6b: die Lese-Zelle entscheidet die Artikelform (`./satzspiegel`); die
  // R6-Aufweitung für die Randnotiz ist mit ihr gestrichen (`lesemassMaxRem` deckelt den Text ohnehin).
  const zellePx = raum == null ? null : (blattSpur ? (rootWennOffenPx ?? raum.ruhePx) : raum.ruhePx) - spurenPx;
  const satzspiegel = satzspiegelFuer(zellePx, rem, spaltenLage && ruheForm === 'rechts');
  return {
    blattForm: blattSpur ? 'spalte' : ruheForm,
    gliederungSpalte,
    schiene,
    // P1-1: NICHT `tocOffen` (siehe Feld-Kommentar) — die Schiene holt genau
    // dann Platz, wenn das Blatt eine Spur hat und beide nicht zusammen passen.
    schieneHoltPlatz: blattSpur && !vollesLesemass,
    spalten: spaltenLage
      ? `${gliederungSpalte ? `${SPUR_GLIEDERUNG}rem` : `${SPUR_SCHIENE}rem`} minmax(0,1fr)`
        + (blattSpur ? ` ${SPUR_BLATT}rem` : '')
      : undefined,
    breite: blattSpur && raum ? aufweitung(raum, LESER_MAX_REM * rem) : undefined,
    lesemassMaxRem,
    satzspiegel,
  };
}

/**
 * Die Aufweitung als Kasten-Rechnung.
 *
 * WARUM NICHT EINFACH ZENTRIERT: der Rahmen steht in einem zentrierten Eltern-
 * Kasten. Ihn beim Öffnen des Blatts neu zu zentrieren, schöbe den gelesenen
 * Text waagrecht weg — @1920 um 152 px, obwohl rechts 400 px frei sind. Der
 * Rahmen wächst darum ZUERST in den freien Rand rechts und rückt nur um den
 * Rest nach links (@1920: 0 px, @1440: 112 px). Der Text bleibt stehen, wo der
 * Platz es zulässt; das ist dieselbe Zusage wie die von `useStickAusgleich` für
 * die senkrechte Richtung.
 */
function aufweitung(raum: RahmenRaum, maxPx: number): CSSProperties | undefined {
  const breite = Math.min(maxPx, raum.raumPx);
  if (breite <= raum.ruhePx) return undefined; // kein Gewinn — nichts anfassen
  const linksHeute = (raum.raumPx - raum.ruhePx) / 2;
  const links = Math.min(linksHeute, raum.raumPx - breite);
  const dx = links - linksHeute; // ≤ 0
  return {
    // Als eigenes Token ausgelegt, damit die Zahl im Browser ablesbar ist und
    // eine spätere Regel sie lesen kann, ohne sie zu wiederholen (§5).
    '--leser-max-w': `${breite}px`,
    width: 'var(--leser-max-w)',
    marginInlineStart: `${dx}px`,
    // Der Kasten muss aufgehen: dx + Breite + Ende = Elternbreite. Ohne die
    // zweite Zahl löst der Browser die Übergleichung selbst auf — sichtbar
    // gleich, aber nicht mehr nachrechenbar.
    marginInlineEnd: `${raum.ruhePx - breite - dx}px`,
  } as CSSProperties;
}

/**
 * Misst den Raum am Elternkasten und am umgebenden `<main>`.
 *
 * `ruhePx` ist die INHALTSBREITE des Elternkastens — also genau die Breite, die
 * der Rahmen ohne Aufweitung hätte, unabhängig davon, wie viele neutrale
 * Zwischen-Container die Hülle einzieht. `raumPx` ist die Breite des `<main>`
 * abzüglich aller Polsterungen und Kanten auf dem Weg dorthin; `clientWidth`
 * lässt die Scrollbar aussen vor, `100vw` täte das nicht.
 */
function raumMessen(el: HTMLElement): RahmenRaum | null {
  const eltern = el.parentElement;
  if (!eltern) return null;
  const innen = (n: HTMLElement) => {
    const cs = getComputedStyle(n);
    return { pad: parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth) };
  };
  const ruhePx = eltern.clientWidth - innen(eltern).pad;
  let rand = 0;
  let lauf: HTMLElement | null = eltern;
  while (lauf && lauf.tagName !== 'MAIN') {
    rand += innen(lauf).pad;
    lauf = lauf.parentElement;
  }
  // Ohne `<main>` gibt es keine belastbare Aussenkante — dann NICHT aufweiten
  // (der Rahmen bleibt, was er heute ist), statt auf `100vw` zu raten.
  if (!lauf) return null;
  const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const raumPx = lauf.clientWidth - rand;
  if (!(raumPx > 0) || !(ruhePx > 0)) return null;
  return { raumPx, ruhePx, remPx };
}

function gleich(a: RahmenRaum | null, b: RahmenRaum | null): boolean {
  if (a === null || b === null) return a === b;
  return a.raumPx === b.raumPx && a.ruhePx === b.ruhePx && a.remPx === b.remPx;
}

/**
 * Der Mess-Ref des Rahmens.
 *
 * CALLBACK-REF und Messung im Commit — dieselbe Begründung und derselbe
 * reproduzierte Fehler wie bei `useElementBreite`: der Rahmen kehrt beim ersten
 * Render mit dem Lade-Platzhalter zurück, ein `useEffect` auf einem `useRef`
 * liefe genau einmal mit `null` und hinge nie einen Observer ein.
 *
 * Beobachtet werden BEIDE Kästen: das `<main>` (Fenster, Pane-Breite,
 * App-Seitenleiste) und der Elternkasten (er folgt dem Schriftregler, weil
 * `max-w-content` in rem misst — das `<main>` täte das nicht).
 */
export function useRahmenRaum(): {
  raum: RahmenRaum | null;
  raumRef: (el: HTMLDivElement | null) => void;
} {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [raum, setRaum] = useState<RahmenRaum | null>(null);

  const uebernimm = useCallback((ziel: HTMLElement) => {
    const neu = raumMessen(ziel);
    setRaum((alt) => (gleich(alt, neu) ? alt : neu));
  }, []);

  const raumRef = useCallback((ziel: HTMLDivElement | null) => {
    setEl(ziel);
    if (ziel) uebernimm(ziel);
  }, [uebernimm]);

  // KEINE Messung im Effekt-Körper (Lint `react-hooks/set-state-in-effect`, rot
  // gesehen im `npm run gate` vom 18.8.2026): ein `setState` direkt im Effekt
  // erzeugt eine Kaskaden-Renderung. Und es wäre die DRITTE Messung derselben
  // Zahl — der Callback-Ref oben misst beim Einhängen, und `ResizeObserver`
  // liefert für jedes neu beobachtete Ziel von sich aus eine erste Meldung.
  // Verhalten bleibt damit gleich; bewiesen an `leser-v3-rahmen` (a)–(f2), die
  // ALLE eine gemessene Aufweitung voraussetzen und ohne sie rot werden.
  useEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return;
    const haupt = el.closest('main');
    const eltern = el.parentElement;
    const ro = new ResizeObserver(() => uebernimm(el));
    if (haupt) ro.observe(haupt, { box: 'border-box' });
    if (eltern) ro.observe(eltern, { box: 'border-box' });
    return () => ro.disconnect();
  }, [el, uebernimm]);

  return { raum, raumRef };
}
