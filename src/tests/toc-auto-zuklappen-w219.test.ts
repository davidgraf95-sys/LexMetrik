// @vitest-environment node
/**
 * W2·19-GLIEDERUNG · S5 — die Zuklapp-Regel des Gliederungsbaums (F2).
 *
 * Bau-Spec: fahrplaene/FAHRPLAN-W2-19-SEITENLEISTE.md §3.6.
 *
 * WARUM DIESER TEST ÜBERHAUPT EXISTIERT (§6.7 «ein Tor, das nicht scheitern
 * kann, ist gefährlicher als keines»). Für S5 war ein Rot-Zwischenstand Pflicht.
 * Gegen die bestehenden e2e-Tore liess er sich NICHT erzeugen: zwei bewusst
 * eingebaute Sabotagen — (a) Sichtband-Wächter entfernt, also auch sichtbare
 * Äste kollabieren, (b) Kompensation verzehnfacht — liefen beide vollständig
 * GRÜN durch `leser-gliederung-a33` und `leser-kopf-a9` (je gebaut und gegen den
 * echten Build gefahren). Der Grund ist strukturell: das Auto-Zuklappen greift
 * erst, wenn ein Ast AUTO_ZU_NACHLAUF (6) Pfadwechsel alt ist, und so weit
 * scrollen die a33-/a9-Fälle nicht. Die Mechanik war damit ungetestet — der
 * Zustand, vor dem §6.7 warnt.
 *
 * Dieser Test schliesst die Lücke dort, wo die Entscheidung wirklich fällt: an
 * der reinen Funktion `planeZuklappen`. Geprüft wird die REGEL (Sichtband-
 * Wächter, Nachlauf-Fenster, Aktiv-Pfad-Schutz, Kompensation nur für die
 * äussersten Oberhalb-Äste), nicht das Browser-Layout.
 *
 * DOM-DOUBLE statt echter DOM: die Suite läuft in `node` (kein jsdom im Projekt,
 * und `linkedom` liefert für `getBoundingClientRect` nur Nullen). `planeZuklappen`
 * berührt genau fünf DOM-Fähigkeiten — Container-Rect, `querySelector` auf dem
 * Container und auf der Zeile, Ast-Rect und `contains`. Die werden hier exakt
 * nachgebildet; alles andere wäre Kulisse, die nichts beweist.
 */
import { describe, it, expect } from 'vitest';
import {
  planeZuklappen, retteFokusVorZuklapp, scrollRuht, AUTO_ZU_NACHLAUF, AUTO_AUF_RUHE_MS, F2_SICHERHEITSSAUM,
  F2_OBERHALB,
} from '../pages/gesetz-leser/tocAutoZuklappen';

interface ZeilenBau {
  /** Ids, die diese Zeile trägt (verdichtete Kette: mehrere). */
  ids: string[];
  /** Lage des KIND-Containers; `null` = Zeile hat keinen offenen Ast. */
  ast: { top: number; bottom: number } | null;
  /** Ids der Zeilen, deren Ast INNERHALB dieses Astes liegt (Verschachtelung). */
  enthaelt?: string[];
}

/** Baut einen Container-Doppelgänger mit dem Sichtband [contTop, contBottom]. */
function baueToc(contTop: number, contBottom: number, zeilen: ZeilenBau[]): HTMLElement {
  const aeste = new Map<string, { rect: { top: number; bottom: number }; enthaelt: string[] }>();
  for (const z of zeilen) {
    if (z.ast) aeste.set(z.ids[0], { rect: z.ast, enthaelt: z.enthaelt ?? [] });
  }

  // Der echte DOM liefert für dieselbe Zeile IMMER dasselbe Element. Das Double
  // muss das nachbilden, sonst kann es Referenz-Identität nicht prüfen — und
  // genau darauf beruht die Dedup-Regel (B1). Ohne diesen Cache gäbe jeder
  // Aufruf ein neues Objekt, und der Test bewiese eine Eigenschaft des Doubles
  // statt eine des Codes.
  const astCache = new Map<string, HTMLElement>();
  const astEl = (schluessel: string): HTMLElement => {
    const zwischen = astCache.get(schluessel);
    if (zwischen) return zwischen;
    const eintrag = aeste.get(schluessel)!;
    const el = {
      __id: schluessel,
      getBoundingClientRect: () => ({
        top: eintrag.rect.top,
        bottom: eintrag.rect.bottom,
        height: eintrag.rect.bottom - eintrag.rect.top,
      }),
      contains: (anderer: { __id?: string }) =>
        anderer?.__id !== undefined && eintrag.enthaelt.includes(anderer.__id),
    };
    const fertig = el as unknown as HTMLElement;
    astCache.set(schluessel, fertig);
    return fertig;
  };

  const zeileEl = (z: ZeilenBau): HTMLElement => ({
    querySelector: (sel: string) =>
      sel === ':scope > div.grid' && z.ast ? astEl(z.ids[0]) : null,
  } as unknown as HTMLElement);

  return {
    getBoundingClientRect: () => ({ top: contTop, bottom: contBottom, height: contBottom - contTop }),
    querySelector: (sel: string) => {
      const treffer = /\[data-sektion-ids~="([^"]+)"\]/.exec(sel);
      if (!treffer) return null;
      const z = zeilen.find((x) => x.ids.includes(treffer[1]));
      return z ? zeileEl(z) : null;
    },
  } as unknown as HTMLElement;
}

/** Ticks so setzen, dass jede Id das Nachlauf-Fenster überschritten hat. */
const alt = (ids: string[]): Map<string, number> => new Map(ids.map((id) => [id, 0]));
// Die Oberhalb-Richtung ist in der Produktion per Fallback ABGESCHALTET
// (F2_OBERHALB = false, Herleitung dort). Die REGEL bleibt implementiert und
// geprüft — sie wird gebraucht, sobald der Nachfolge-Mechanismus steht. Wo ein
// Fall sie prüft, wird sie darum ausdrücklich eingeschaltet.
const MIT_OBEN = { oberhalbErlaubt: true } as const;
const TICK = AUTO_ZU_NACHLAUF + 5;

// Sichtband des Containers in dieser Datei: y = 100 … 500.
const OBEN = { top: -300, bottom: -100 };   // ganz oberhalb
const IM_BAND = { top: 200, bottom: 400 };  // mitten drin
const UNTEN = { top: 700, bottom: 900 };    // ganz unterhalb
const RAND_OBEN = { top: -50, bottom: 150 };  // ragt ins Band hinein
const RAND_UNTEN = { top: 450, bottom: 650 }; // ragt ins Band hinein

describe('S5 — Sichtband-Wächter: was zugeklappt werden darf', () => {
  it('UNTERHALB: klappt zu, ohne Kompensation (nichts Sichtbares bewegt sich)', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: UNTEN }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']) });
    expect(plan.schliessen).toEqual(['sek-1']);
    expect(plan.kompensation).toBe(0);
  });

  it('OBERHALB: klappt zu UND meldet die verschwindende Höhe zur Kompensation', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: OBEN }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']), ...MIT_OBEN });
    expect(plan.schliessen).toEqual(['sek-1']);
    expect(plan.kompensation).toBe(200); // -300 … -100
  });

  it('IM BAND: bleibt offen — der 19.7.-Wächter gilt hier weiter', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: IM_BAND }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']) });
    expect(plan.schliessen).toEqual([]);
    expect(plan.kompensation).toBe(0);
  });

  it('AM RAND (ragt ins Band): bleibt offen — «berührt» genügt, beide Richtungen', () => {
    for (const ast of [RAND_OBEN, RAND_UNTEN]) {
      const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast }]);
      const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']) });
      expect(plan.schliessen, `Ast ${JSON.stringify(ast)} darf nicht zuklappen`).toEqual([]);
    }
  });

  it('KNAPP DANEBEN bleibt offen — der Sicherheitssaum (Regression a33-Rotlauf)', () => {
    // DER FALL, DER GEFEHLT HAT. Der rote a33-Lauf (CLS 0.050354, drei sichtbare
    // Zeilen 280×43 → 0×0) entstand NICHT daran, dass der Wächter die Ausdehnung
    // falsch mass — eine Sonde im gebauten Stand hat für alle acht beobachteten
    // Geometrie-Urteile belegt, dass zum Messzeitpunkt keine Kind-Zeile im Band
    // lag. Er entstand daran, dass «gerade eben draussen» als sicher galt: bis
    // die Mutation committet war, hatte sich der Scroller weiterbewegt, und der
    // Ast stand im Band. Ein Ast, der nur um wenige Pixel am Band vorbeischrammt,
    // darf darum nicht mehr zuklappen. Gegen den Stand VOR dieser Regel ist genau
    // dieser Fall rot — dort zählte jeder Pixel jenseits der Kante als «draussen».
    // ABSOLUTE Werte, bewusst nicht aus der Konstanten abgeleitet: dieser Fall
    // beschreibt die REALE Gefahr (ein Ast, der nur 10–20 px am Band vorbeizieht
    // und bis zum Commit hineinrutscht), nicht die jeweils eingestellte Kante.
    // Würde er aus `F2_SICHERHEITSSAUM` rechnen, wanderte er mit jeder Änderung
    // der Konstanten mit — und könnte den Rückbau des Saums nicht mehr rot
    // zeigen. Genau das ist beim ersten Entwurf passiert (mit Saum 0 blieb er
    // grün, weil die Fixtures mitrutschten); die Kanten-Fälle unten dürfen die
    // Konstante lesen, dieser hier nicht.
    const knappOben = { top: -300, bottom: 90 };   // 10 px über der Bandoberkante
    const knappUnten = { top: 520, bottom: 900 };  // 20 px unter der Bandunterkante
    for (const ast of [knappOben, knappUnten]) {
      const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast }]);
      const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']), ...MIT_OBEN });
      expect(plan.schliessen, `Ast ${JSON.stringify(ast)} liegt im Saum und darf nicht zuklappen`).toEqual([]);
      expect(plan.kompensation).toBe(0);
    }
    // Einen Pixel weiter draussen greift die Regel wieder — der Saum ist eine
    // Kante, keine Abschaltung.
    for (const [ast, was] of [
      [{ top: -300, bottom: 100 - F2_SICHERHEITSSAUM }, 'oben'],
      [{ top: 500 + F2_SICHERHEITSSAUM, bottom: 900 }, 'unten'],
    ] as const) {
      const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast }]);
      const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']), ...MIT_OBEN });
      expect(plan.schliessen, `${was}: exakt am Saum muss zuklappen`).toEqual(['sek-1']);
    }
  });

  it('Fallback F2_OBERHALB=false stellt exakt den 19.7.-Zustand her', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: OBEN }, { ids: ['sek-2'], ast: UNTEN }]);
    const plan = planeZuklappen({
      tocCont: toc, auto: ['sek-1', 'sek-2'], aktivIds: [], tick: TICK,
      ticks: alt(['sek-1', 'sek-2']), oberhalbErlaubt: false,
    });
    expect(plan.schliessen).toEqual(['sek-2']); // nur der Ast UNTERHALB
    expect(plan.kompensation).toBe(0);
  });
});

describe('S5 — wer geschützt bleibt', () => {
  it('der aktive Pfad klappt nie zu, egal wie alt der Tick ist', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: OBEN }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: ['sek-1'], tick: TICK, ticks: alt(['sek-1']), ...MIT_OBEN });
    expect(plan.schliessen).toEqual([]);
  });

  it('innerhalb des Nachlauf-Fensters passiert nichts — die Kante liegt bei > NACHLAUF', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: OBEN }]);
    const bau = (tick: number) => planeZuklappen({
      tocCont: toc, auto: ['sek-1'], aktivIds: [], tick, ticks: new Map([['sek-1', 0]]), ...MIT_OBEN,
    });
    expect(bau(AUTO_ZU_NACHLAUF).schliessen).toEqual([]);      // genau am Fenster
    expect(bau(AUTO_ZU_NACHLAUF + 1).schliessen).toEqual(['sek-1']); // eins darüber
  });

  it('eine verdichtete Kette wird über JEDE ihrer Ids gefunden (data-sektion-ids~=)', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-7', 'sek-8', 'sek-9'], ast: OBEN }]);
    for (const id of ['sek-7', 'sek-8', 'sek-9']) {
      const plan = planeZuklappen({ tocCont: toc, auto: [id], aktivIds: [], tick: TICK, ticks: alt([id]), ...MIT_OBEN });
      expect(plan.schliessen, `${id} muss die Zeile treffen`).toEqual([id]);
      expect(plan.kompensation).toBe(200);
    }
  });

  it('ohne Container und ohne gerenderte Zeile wird nichts angefasst (keine Blind-Aktion)', () => {
    expect(planeZuklappen({ tocCont: null, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']) }))
      .toEqual({ schliessen: [], kompensation: 0 });
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: OBEN }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-fremd'], aktivIds: [], tick: TICK, ticks: alt(['sek-fremd']), ...MIT_OBEN });
    expect(plan.schliessen).toEqual([]);
  });

  it('eine Zeile ohne offenen Ast liefert nichts zu schliessen', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: null }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']), ...MIT_OBEN });
    expect(plan.schliessen).toEqual([]);
  });

  it('PRODUKTIONS-DEFAULT festgehalten: die Oberhalb-Richtung ist AKTIV', () => {
    // Hält den Ist-Zustand des Fallback-Schalters fest, damit ein Umlegen eine
    // BEWUSSTE Änderung ist und nicht unbemerkt mitläuft. Er stand am 9.8.2026
    // kurzzeitig auf `false`; die Nullprobe hat gezeigt, dass der rote a33-Fall
    // älter ist als diese Slice, und den Schalter wieder freigegeben.
    expect(F2_OBERHALB).toBe(true);
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: OBEN }, { ids: ['sek-2'], ast: UNTEN }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1', 'sek-2'], aktivIds: [], tick: TICK, ticks: alt(['sek-1', 'sek-2']) });
    expect(plan.schliessen.sort()).toEqual(['sek-1', 'sek-2']);
    expect(plan.kompensation).toBe(200);
  });
});

describe('S5 — Kompensation zählt nur die äussersten Äste', () => {
  it('verschachtelte Äste werden NICHT doppelt gezählt', () => {
    // sek-1 umschliesst sek-2; beide liegen oberhalb und dürften zuklappen.
    // Die Höhe von sek-2 steckt bereits in sek-1 — summierte man beide,
    // überkompensierte der Scroll und der Baum spränge in die Gegenrichtung.
    const toc = baueToc(100, 500, [
      { ids: ['sek-1'], ast: { top: -400, bottom: -100 }, enthaelt: ['sek-2'] },
      { ids: ['sek-2'], ast: { top: -300, bottom: -200 } },
    ]);
    const plan = planeZuklappen({
      tocCont: toc, auto: ['sek-1', 'sek-2'], aktivIds: [], tick: TICK, ticks: alt(['sek-1', 'sek-2']), ...MIT_OBEN,
    });
    expect(plan.schliessen.sort()).toEqual(['sek-1', 'sek-2']);
    expect(plan.kompensation).toBe(300); // NUR sek-1, nicht 300 + 100
  });

  it('B1 — eine verdichtete Kette zählt EINMAL, auch wenn alle ihre Ids im Auto-Set stehen', () => {
    // DER FALL, DEN B1 MELDET. `sek-7/8/9` sind eine verdichtete Kette und
    // teilen sich EINE gerenderte Zeile. Stehen alle drei im Auto-Set, liefert
    // der Id-Lookup dreimal dasselbe Element. Vor dem Dedup ging seine Höhe
    // dreifach in die Kompensation ein (600 statt 200), der Scroll wurde um das
    // Dreifache zurückgenommen und der Baum sprang in die Gegenrichtung —
    // schlimmer als gar keine Korrektur. Gegen den Stand ohne `new Set` ist
    // dieser Fall rot.
    const toc = baueToc(100, 500, [{ ids: ['sek-7', 'sek-8', 'sek-9'], ast: OBEN }]);
    const plan = planeZuklappen({
      tocCont: toc, auto: ['sek-7', 'sek-8', 'sek-9'], aktivIds: [], tick: TICK,
      ticks: alt(['sek-7', 'sek-8', 'sek-9']), ...MIT_OBEN,
    });
    expect(plan.kompensation, 'Höhe der EINEN Zeile, nicht dreimal').toBe(200);
    expect(plan.schliessen.sort()).toEqual(['sek-7', 'sek-8', 'sek-9']);
  });

  it('nebeneinanderliegende Oberhalb-Äste werden addiert', () => {
    const toc = baueToc(100, 500, [
      { ids: ['sek-1'], ast: { top: -400, bottom: -300 } },
      { ids: ['sek-2'], ast: { top: -250, bottom: -100 } },
    ]);
    const plan = planeZuklappen({
      tocCont: toc, auto: ['sek-1', 'sek-2'], aktivIds: [], tick: TICK, ticks: alt(['sek-1', 'sek-2']), ...MIT_OBEN,
    });
    expect(plan.kompensation).toBe(100 + 150);
  });

  it('ein Ast unterhalb trägt nie zur Kompensation bei, auch neben einem oberhalb', () => {
    const toc = baueToc(100, 500, [
      { ids: ['sek-1'], ast: OBEN },
      { ids: ['sek-2'], ast: UNTEN },
    ]);
    const plan = planeZuklappen({
      tocCont: toc, auto: ['sek-1', 'sek-2'], aktivIds: [], tick: TICK, ticks: alt(['sek-1', 'sek-2']), ...MIT_OBEN,
    });
    expect(plan.schliessen.sort()).toEqual(['sek-1', 'sek-2']);
    expect(plan.kompensation).toBe(200); // nur der Oberhalb-Ast
  });
});

// ═══ Ruhe-Tor des Auto-AUFklapps (Entscheid David 9.8.2026, Punkt a) ═════════
//
// WARUM DAS EIN EIGENER, PRÜFBARER SATZ IST. Der Zielkonflikt, den dieses Tor
// auflöst, war über e2e NICHT sauber fassbar: der a33-Fall «Lese-Scroll unter
// CPU-Drossel» reisst mit 2–4/20, weil der Shift IMMER entsteht und allein
// Chromiums 500-ms-`hadRecentInput`-Fenster darüber entscheidet, ob er gezählt
// wird (Dossier a33-lesescroll-cls-altflake-2026-08-09.md). Ein Wächter, dessen
// Rot-Zustand vom Zufall abhängt, ist keiner (§6.7). Die REGEL dagegen — «der
// Aufklapp feuert erst, wenn der Scroll ruht» — ist eine reine Funktion und hier
// deterministisch festgenagelt. Die e2e-Seite belegt danach nur noch, dass der
// gemessene Flake verschwindet.
describe('Ruhe-Tor — wann darf der aktive Zweig von selbst aufgehen', () => {
  it('mitten im Scrollen: Aufklapp wartet', () => {
    expect(scrollRuht(1_000, 1_000)).toBe(false);
    expect(scrollRuht(1_000, 1_000 + AUTO_AUF_RUHE_MS - 1)).toBe(false);
  });

  it('nach dem Ruhefenster: Aufklapp darf', () => {
    expect(scrollRuht(1_000, 1_000 + AUTO_AUF_RUHE_MS)).toBe(true);
    expect(scrollRuht(1_000, 5_000)).toBe(true);
  });

  it('noch nie gescrollt (Deep-Link-Einstieg) gilt als Ruhe — sonst bliebe der Zweig ewig zu', () => {
    expect(scrollRuht(0, 0)).toBe(true);
    expect(scrollRuht(0, 12)).toBe(true);
  });

  it('Ruhefenster liegt in Davids Vorgabe 150–300 ms', () => {
    // Der Wert ist ein Entscheid, keine Ableitung — er gehört darum festgenagelt,
    // damit ein späteres «kurz nachjustieren» sichtbar wird statt still zu gelten.
    expect(AUTO_AUF_RUHE_MS).toBeGreaterThanOrEqual(150);
    expect(AUTO_AUF_RUHE_MS).toBeLessThanOrEqual(300);
  });
});

// ═══ B8 · Fokus-Rettung beim Auto-Zuklappen (WCAG 2.4.3) ════════════════════
//
// W2·18-FEHLERBUCH (Herkunft: W2·19-Bug-Check B8), korrigiert nach dem
// §9-Bug-Check 13.8.2026. Seit dem Unmount zugeklappter Äste (S5) verschwindet
// ein geschlossener Ast aus dem DOM — samt dem Element, auf dem der
// Tastatur-Fokus stand. Der Browser gibt ihn dann an <body>.
//
// ZWEITES DOM-DOUBLE, bewusst neben dem oberen: `planeZuklappen` misst
// Geometrie, `retteFokusVorZuklapp` fragt Fokus-Zugehörigkeit, Verschachtelung
// und Sichtbarkeit. Ein gemeinsames Double müsste beide Rollen tragen und wäre
// in keiner davon mehr lesbar.
//
// SCROLL-SEMANTIK IM DOUBLE (F3b): `focus()` auf ein Element ausserhalb des
// Sichtbands scrollt den Container — genau das war der Fehler der ersten
// Fassung, und ohne diese Nachbildung bliebe er unsichtbar. Das Double
// protokolliert darum, ob das Fokus-Ziel sichtbar war.
describe('B8 — der Tastatur-Fokus überlebt das Auto-Zuklappen', () => {
  interface Bau {
    ids: string[];
    hatAst: boolean;
    fokusImAst?: boolean;
    ohneKnopf?: boolean;
    /** Ids der Zeilen, deren ZEILE innerhalb dieses Astes liegt (Verschachtelung). */
    enthaeltZeilen?: string[];
  }

  function baueFokusToc(zeilen: Bau[], fokus: 'im-ast' | 'auf-zeile' | 'draussen' | 'keiner' | 'auf-marke', mitMarke = true) {
    const fokusEl = { __name: 'fokus' } as unknown as HTMLElement;
    const fokussiert: string[] = [];
    const scrollSpruenge: string[] = [];
    // Die Marken-Zeile ist per F5 immer im Sichtband (Mitscroll-Nudge); die
    // Elternzeile eines schliessenden Astes ist es per Konstruktion nie
    // (F2_SICHERHEITSSAUM ≥ 64 px daneben).
    const knopf = (name: string, sichtbar: boolean): HTMLElement => ({
      __name: name,
      focus: () => { fokussiert.push(name); if (!sichtbar) scrollSpruenge.push(name); },
    } as unknown as HTMLElement);
    const markeEl = mitMarke ? knopf('marke', true) : null;

    const zeilenEl = new Map<string, HTMLElement>();
    const zeileEl = (z: Bau): HTMLElement => {
      const vorhanden = zeilenEl.get(z.ids[0]);
      if (vorhanden) return vorhanden;
      const el = {
        __id: z.ids[0],
        querySelector: (sel: string) => {
          if (sel === ':scope > div.grid') return z.hatAst ? astEl(z) : null;
          // §6.3-DEKLARATION (R6c, P8): der Produktionsselektor trifft seit der
          // Umstellung auf `<a href>` beide Tags — das Doppel spiegelt ihn.
          if (sel === ':scope > div > :is(a, button)[title]') return z.ohneKnopf ? null : knopf(`sprung:${z.ids[0]}`, false);
          if (sel === ':scope > div > button[aria-expanded]') return knopf(`chevron:${z.ids[0]}`, false);
          return null;
        },
      } as unknown as HTMLElement;
      zeilenEl.set(z.ids[0], el);
      return el;
    };
    const asteEl = new Map<string, HTMLElement>();
    const astEl = (z: Bau): HTMLElement => {
      const vorhanden = asteEl.get(z.ids[0]);
      if (vorhanden) return vorhanden;
      const el = {
        contains: (anderer: { __name?: string; __id?: string }) => {
          if (z.fokusImAst === true && anderer === (fokusEl as unknown)) return true;
          return anderer?.__id !== undefined && (z.enthaeltZeilen ?? []).includes(anderer.__id);
        },
      } as unknown as HTMLElement;
      asteEl.set(z.ids[0], el);
      return el;
    };

    const aktivesEl = fokus === 'keiner' ? null : fokus === 'auf-marke' ? markeEl : fokusEl;
    const toc = {
      ownerDocument: { activeElement: aktivesEl },
      contains: (el: unknown) => fokus !== 'draussen' && fokus !== 'keiner' && el === aktivesEl,
      querySelector: (sel: string) => {
        if (sel === '[data-toc-aktiv]') return markeEl;
        const treffer = /\[data-sektion-ids~="([^"]+)"\]/.exec(sel);
        if (!treffer) return null;
        const z = zeilen.find((x) => x.ids.includes(treffer[1]));
        return z ? zeileEl(z) : null;
      },
    } as unknown as HTMLElement;
    return { toc, fokussiert, scrollSpruenge };
  }

  it('Fokus im kollabierenden Ast → er wandert auf die SICHTBARE Marken-Zeile', () => {
    // F3b (§9-Bug-Check): die Elternzeile liegt per Konstruktion off-screen —
    // sie zu fokussieren scrollte den [data-toc]-Container, und die
    // Kompensation im Aufrufer rechnete danach mit falscher Geometrie.
    const { toc, fokussiert, scrollSpruenge } = baueFokusToc([{ ids: ['sek-1'], hatAst: true, fokusImAst: true }], 'im-ast');
    expect(retteFokusVorZuklapp(toc, ['sek-1'])).toBe(true);
    expect(fokussiert).toEqual(['marke']);
    expect(scrollSpruenge, 'der Fokus darf den Scroller nicht verschieben').toEqual([]);
  });

  it('ohne Marke bleibt die Elternzeile der Ersatzweg — Fokus retten schlägt Scroll-Ruhe', () => {
    const { toc, fokussiert } = baueFokusToc(
      [{ ids: ['sek-1'], hatAst: true, fokusImAst: true }], 'im-ast', false);
    expect(retteFokusVorZuklapp(toc, ['sek-1'])).toBe(true);
    expect(fokussiert).toEqual(['sprung:sek-1']);
  });

  it('F3a — verschachtelt: es gewinnt der ÄUSSERSTE schliessende Ast, nicht der erste in der Liste', () => {
    // `schliessen` kommt aus einem Set in Einfüge-Reihenfolge; das Kind kann vor
    // dem Elternteil stehen. Die erste Fassung nahm den ersten Treffer — der
    // Fokus landete dann auf einer Zeile, die im selben flushSync mit
    // ausgehängt wird.
    const { toc, fokussiert } = baueFokusToc([
      { ids: ['sek-2'], hatAst: true, fokusImAst: true },
      { ids: ['sek-1'], hatAst: true, fokusImAst: true, enthaeltZeilen: ['sek-2'] },
    ], 'im-ast', false);
    expect(retteFokusVorZuklapp(toc, ['sek-2', 'sek-1'])).toBe(true);
    expect(fokussiert).toEqual(['sprung:sek-1']);
  });

  it('F3c — ein Ast ohne Treffer bricht die Suche nicht ab', () => {
    // Früher `return false` statt `continue`: stand der Fokus im ZWEITEN Ast und
    // hatte der erste keinen offenen Kind-Container, gab die Funktion auf.
    const { toc, fokussiert } = baueFokusToc([
      { ids: ['sek-1'], hatAst: false },
      { ids: ['sek-2'], hatAst: true, fokusImAst: true },
    ], 'im-ast', false);
    expect(retteFokusVorZuklapp(toc, ['sek-1', 'sek-2'])).toBe(true);
    expect(fokussiert).toEqual(['sprung:sek-2']);
  });

  it('ohne benannten Knopf greift der Chevron derselben Zeile', () => {
    const { toc, fokussiert } = baueFokusToc(
      [{ ids: ['sek-1'], hatAst: true, fokusImAst: true, ohneKnopf: true }], 'im-ast', false);
    expect(retteFokusVorZuklapp(toc, ['sek-1'])).toBe(true);
    expect(fokussiert).toEqual(['chevron:sek-1']);
  });

  it('Fokus auf der Elternzeile selbst bleibt, wo er ist — sie verschwindet ja nicht', () => {
    const { toc, fokussiert } = baueFokusToc([{ ids: ['sek-1'], hatAst: true }], 'auf-zeile');
    expect(retteFokusVorZuklapp(toc, ['sek-1'])).toBe(false);
    expect(fokussiert).toEqual([]);
  });

  it('Fokus steht schon auf der Marke ⇒ kein Neu-Fokussieren (kein Screenreader-Rauschen)', () => {
    const { toc, fokussiert } = baueFokusToc([{ ids: ['sek-1'], hatAst: true, fokusImAst: true }], 'auf-marke');
    expect(retteFokusVorZuklapp(toc, ['sek-1'])).toBe(false);
    expect(fokussiert).toEqual([]);
  });

  it('Fokus ausserhalb der Leiste wird NIE angefasst (keine ungefragte Bewegung)', () => {
    for (const lage of ['draussen', 'keiner'] as const) {
      const { toc, fokussiert } = baueFokusToc([{ ids: ['sek-1'], hatAst: true, fokusImAst: true }], lage);
      expect(retteFokusVorZuklapp(toc, ['sek-1'])).toBe(false);
      expect(fokussiert).toEqual([]);
    }
  });

  it('nichts zu schliessen oder kein Container ⇒ keine Blind-Aktion', () => {
    const { toc, fokussiert } = baueFokusToc([{ ids: ['sek-1'], hatAst: true, fokusImAst: true }], 'im-ast');
    expect(retteFokusVorZuklapp(toc, [])).toBe(false);
    expect(retteFokusVorZuklapp(null, ['sek-1'])).toBe(false);
    expect(fokussiert).toEqual([]);
  });
});
