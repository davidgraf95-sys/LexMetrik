// ═══ B8 · Scroll-Affordanz, die den Scrollstand kennt (LM-063 + LM-064) ══════
//
// BEFUND, am gebauten Stand reproduziert (31.8.2026, `vite preview`, Chromium):
//  · LM-063 @720 · `/rechner/schkg-fristen`: die Phasen-Leiste (`ui/Tabs.tsx`,
//    `role=group`) misst sichtbar 604 px bei 1'193 px Inhalt — **589 px
//    verborgen**, ohne Verlauf, ohne Maske, ohne sichtbare Leiste.
//    `/rechner/zpo-fristen` 604/756 (152 px), `/rechtsprechung` 672/1'169
//    (497 px, dort mit statischem Verlauf aus D10).
//  · Nebenfund derselben Klasse, gemessen im selben Lauf: die Reiter-Leiste des
//    Leser-Panels (`LeserPanel.tsx`, `scrollbar-width:none`) 350/385 — 35 px
//    verborgen, also ein angeschnittenes viertes Fach «Anwendung».
//  · LM-064 @1440 · `/gesetze/bund/OR`: der Gliederungs-Scroller (`[data-toc]`)
//    728 px sichtbar bei 1'061 px Inhalt, **genau eine** Zeile vom unteren Rand
//    durchgeschnitten, `border-bottom: 0px`, `mask-image: none` — hell wie
//    dunkel. (Der im Befund genannte ZUSÄTZLICHE Waagrecht-Balken ist überholt:
//    `overflow-x: hidden`, `scrollWidth === clientWidth === 288`.)
//
// WAS DIESER WÄCHTER SICHERT — und warum er scheitern KANN (§6.7):
//  (a) Der CSS-Vertrag der geteilten Klasse. Die Affordanz lebt von der
//      local/scroll-Anatomie: zwei DECKEL-Verläufe in `background-attachment:
//      local` (sie scrollen mit dem Inhalt weg) über zwei SCHATTEN in `scroll`
//      (sie stehen am Element). Fällt ein `local` auf `scroll` zurück — ein
//      Ein-Zeichen-Fehler —, steht der Schatten AUCH am Ende der Strecke und
//      behauptet «hier geht es weiter», wo nichts mehr kommt (§8). Genau diese
//      Lüge ist der Grund, warum die B8-Session den statischen Verlauf aus D10
//      NICHT vervielfacht hat (Notiz zu LM-061, 30.8.2026).
//  (b) Die Verankerung an den vier Scrollern. Wer einen fünften baut oder einen
//      der vier auf eine eigene Kopie zurücksetzt, wird hier rot.
// Rot gesehen am 31.8.2026 vor dem Bau: (a) «Klasse .lc-scrollrand-x fehlt in
// src/index.css», (b) vier Datei-Anker fehlend.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';

const css = readFileSync('src/index.css', 'utf8');
const wurzel = postcss.parse(css);

function regel(selektor: string): Record<string, string> | null {
  let treffer: Record<string, string> | null = null;
  wurzel.walkRules((r) => {
    // Nur die Grundfassung, nie eine `@media`-Ausnahme: die Druck-Regel setzt
    // `background-image: none` und überschriebe sonst genau das, was hier
    // geprüft wird (Falle gesehen 31.8.2026 beim ersten Grün-Lauf).
    const eltern = r.parent;
    if (eltern && eltern.type === 'atrule' && (eltern as { name?: string }).name === 'media') return;
    if (r.selector.split(',').map((s) => s.trim()).includes(selektor)) {
      const d: Record<string, string> = {};
      r.walkDecls((decl) => { d[decl.prop] = decl.value; });
      treffer = { ...(treffer ?? {}), ...d };
    }
  });
  return treffer;
}

/** Kommas auf oberster Klammer-Ebene trennen (Ebenen einer Hintergrund-Liste). */
function teile(wert: string): string[] {
  const raus: string[] = [];
  let tiefe = 0;
  let start = 0;
  for (let i = 0; i < wert.length; i++) {
    if (wert[i] === '(') tiefe++;
    else if (wert[i] === ')') tiefe--;
    else if (wert[i] === ',' && tiefe === 0) { raus.push(wert.slice(start, i).trim()); start = i + 1; }
  }
  const rest = wert.slice(start).trim();
  if (rest) raus.push(rest);
  return raus;
}

describe('B8 · geteilte Scroll-Affordanz (LM-063/LM-064)', () => {
  for (const achse of ['x', 'y'] as const) {
    it(`.lc-scrollrand-${achse} trägt die local/scroll-Anatomie`, () => {
      const d = regel(`.lc-scrollrand-${achse}`);
      expect(d, `Klasse .lc-scrollrand-${achse} fehlt in src/index.css`).not.toBeNull();
      const anhang = (d?.['background-attachment'] ?? '').replace(/\s+/g, ' ').trim();
      expect(anhang).toBe('local, local, scroll, scroll');
      const bild = d?.['background-image'] ?? '';
      // Zwei DECKEL (linear, in `local`) über zwei SCHATTEN (radial, in `scroll`)
      // — die Reihenfolge der Ebenen ist dieselbe wie in `background-attachment`.
      expect((bild.match(/linear-gradient/g) ?? []).length).toBe(2);
      expect((bild.match(/radial-gradient/g) ?? []).length).toBe(2);
      // Die Deckel tragen den Grund-Token, nie eine gemalte Farbe (§13).
      expect((bild.match(/var\(--lc-scrollrand-grund/g) ?? []).length).toBe(2);
      // Vier Ebenen brauchen vier Masse und vier Orte, sonst wiederholt CSS
      // still die erste Angabe und der Schatten sitzt an der falschen Kante.
      expect(teile(d?.['background-size'] ?? '').length).toBe(4);
      expect(teile(d?.['background-position'] ?? '').length).toBe(4);
    });

    it(`.lc-scrollrand-${achse} hat eine Dunkel-Fassung (heller Schatten)`, () => {
      const d = regel(`html.dark .lc-scrollrand-${achse}`);
      expect(d, `Dunkel-Fassung von .lc-scrollrand-${achse} fehlt`).not.toBeNull();
      expect(d?.['background-image'] ?? '').toContain('255 255 255');
    });
  }

  const ANKER: ReadonlyArray<readonly [string, string]> = [
    ['src/components/ui/Tabs.tsx', 'lc-scrollrand-x'],
    ['src/components/rechtsprechung/SachgebietKacheln.tsx', 'lc-scrollrand-x'],
    ['src/pages/gesetz-leser/v3/LeserPanel.tsx', 'lc-scrollrand-x'],
    ['src/pages/gesetz-leser/v3/LeserSeitenleiste.tsx', 'lc-scrollrand-y'],
    // LM-061 (Entscheid David 31.8.2026, revidiert D11) galt zusätzlich den
    // BEIDEN Startseiten-Streifen — sie trugen die Scrollstand-Affordanz statt
    // der angeschnittenen Karte als einziger Auskunft über ~2'600 px
    // verborgenen Inhalt. Der Beleg altert nicht (§2b): er beschreibt den Stand
    // vom 31.8.2026 richtig.
    // DEKLARIERTE ANPASSUNG (W2·24-DESIGN-IDENTITAET R3, 6.9.2026, §6.3): auf
    // «/» gibt es diese zwei Streifen nicht mehr. «Jüngste Entscheide» ist eine
    // LISTE (`start/EntscheideListe.tsx`), «Zuletzt geöffnet» eine umbrechende
    // TEXTZEILE (`start/ZuletztVerwendet.tsx`) — beide ohne waagrechte
    // Scroll-Achse. Ein Wächter, der eine Affordanz für einen Scrollstand
    // verlangt, den es nicht mehr gibt, prüft nichts (§6.7): die zwei Anker
    // sind darum gestrichen, nicht umgehängt. Die Klasse selbst hat vier
    // weitere Konsumenten und bleibt bewacht.
  ];
  for (const [datei, klasse] of ANKER) {
    it(`${datei} nutzt ${klasse}`, () => {
      expect(readFileSync(datei, 'utf8')).toContain(klasse);
    });
  }

  it('SachgebietKacheln trägt keinen statischen Verlauf mehr (§8: er log am Streckenende)', () => {
    const q = readFileSync('src/components/rechtsprechung/SachgebietKacheln.tsx', 'utf8');
    expect(q).not.toContain('bg-gradient-to-l');
  });
});
