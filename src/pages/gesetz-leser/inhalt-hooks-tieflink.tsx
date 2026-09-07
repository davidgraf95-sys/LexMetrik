// ─── Tieflink-Sprung des Lesers (§6.6-Split, W2·24-DESIGN-IDENTITAET) ───────
//
// EIN kontiguer Block aus `useLeserSprungSpy` (inhalt-hooks.tsx), Wort fuer
// Wort unveraendert hierher gezogen: der Hash-Seed-Waechter, sein Ruecksetzer
// und der Tieflink-Sprung samt R6/L1-Verdeckung. Der Block sass am ANFANG des
// Hooks, vor dem Scroll-Spy — `useLeserSprungSpy` ruft diesen Hook an exakt
// derselben Stelle, an der die drei Aufrufe (useRef · useEffect ·
// useIsoLayoutEffect) vorher standen. Damit ist die HOOK-REIHENFOLGE
// byte-identisch und der Split verhaltensneutral (§6): keine Dependency-Liste,
// keine Bedingung, keine Reihenfolge veraendert.
//
// WARUM EIGENE DATEI. `inhalt-hooks.tsx` stand nach R10 bei 839 Zeilen (§6.6-
// Schwelle 800). Der Tieflink-Sprung ist der einzige grosse Block, der sich
// ohne Eingriff in den Scroll-Spy loesen laesst: er teilt mit dem Rest weder
// Ref noch Closure ausser `setOffen` (hier als `oeffnePfad` gekapselt, das
// ausserhalb dieses Blocks niemand mehr braucht). Der Spy selbst bleibt
// bewusst in `inhalt-hooks.tsx` — die Quellensonden in
// `leser-adresse-lm202.test.ts` und `tab-titel-paritaet.test.ts` bewachen ihn
// genau dort, und ein Refactoring passt keine Tests an (§6.3).

import { useEffect, useLayoutEffect, useRef, type Dispatch, type RefObject, type SetStateAction } from 'react';
import { aktualisiereTabArtikel } from '../../lib/tabs';
import { istHashVerbraucht } from './scrollAnker';
import { pfadZu } from './helpers';
import { paneRoot, findeArt } from './berechnungen';
import type { Sektion } from '../../lib/normtext/browse';
import type { NormSnapshot } from '../../lib/normtext/typen';

/**
 * Layout-Effekt im Browser, gewoehnlicher Effekt im Prerender (W2·24-R6/L1).
 *
 * Wortgleich zu `useIsoLayoutEffect` in `App.tsx` — dort steht die Herleitung.
 * Gebraucht wird er hier fuer den Tieflink-Sprung: er muss VOR dem ersten Paint
 * laufen, und `useLayoutEffect` warnt im Server-Render.
 */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Der Hash-Seed-Sprung. Signatur = genau die Werte, die der Block gelesen hat. */
export function useTieflinkSprung(opts: {
  ebene: string;
  schluessel: string;
  eintraege: NormSnapshot[] | null;
  sektionen: Sektion[];
  istSekundaer: boolean;
  imPane: boolean;
  wurzel: RefObject<HTMLElement | null> | null;
  paneLocationHash: string;
  artLabelByToken: Map<string, string>;
  setOffen: Dispatch<SetStateAction<Record<string, boolean>>>;
  setAktArtikel: Dispatch<SetStateAction<string | null>>;
  setAktivIds: Dispatch<SetStateAction<string[]>>;
}): void {
  const {
    ebene, schluessel, eintraege, sektionen, istSekundaer, imPane, wurzel,
    paneLocationHash, artLabelByToken, setOffen, setAktArtikel, setAktivIds,
  } = opts;

  const oeffnePfad = (ids: string[]) => setOffen((o) => {
    const n = { ...o }; for (const id of ids) n[id] = true; return n;
  });

  // E3/A34 (David 16.7.2026): der Seed-Sprung unten darf pro Erlass-Ladung NUR
  // EINMAL feuern — nicht erneut, wenn die Einzelansicht in den Split-View kippt
  // (`imPane`/`wurzel` wechseln von false→true). Sonst las der Effekt beim Pane-
  // Öffnen erneut `window.location.hash` (= der zuvor angeklickte Artikel) und
  // sprang das frisch weitergescrollte Gesetz-Pane auf diesen früheren Artikel
  // zurück (Scroll-Verlust, §15 Funktions-Treue «Split-View-Pane-Zustand»). Der
  // Wächter wird pro Erlass zurückgesetzt; spätere Hash-Wechsel trägt ohnehin der
  // letzteNavKey-Effekt (Primär) bzw. die eigene Pane-History (A16/A17).
  const hashSeedGetan = useRef(false);
  useEffect(() => { hashSeedGetan.current = false; }, [ebene, schluessel]);

  // Hash-Sprung: alle Vorfahren des Ziel-Artikels öffnen + scrollen.
  // W2·5d U-POSITION/A17: auch im SEKUNDÄREN Pane an die Fundstelle springen —
  // der ⧉-Öffner legt den Pfad MIT `#art-token` ab (NormPopover readerLink), aber
  // die Fundstelle stand bisher nur in `window.location.hash` (= die Haupt-URL,
  // NICHT der Pane-Pfad) und der Effekt brach für Panes ab ⇒ das Pane öffnete oben
  // statt an der Norm. Quelle des Hashs ist im Pane die PANE-LOKALE Location
  // (`<Routes location={loc}>` → react-router `useLocation()` liefert den Pane-Pfad),
  // sonst wie bisher die echte Fenster-URL (Primär/Einzelansicht byte-gleich).
  useIsoLayoutEffect(() => {
    if (!eintraege || !sektionen.length || typeof window === 'undefined') return;
    // A34: nur der ERSTE inhaltsbereite Lauf sät den Sprung. Danach gesperrt —
    // ein `imPane`/`wurzel`-Wechsel (Split-View öffnet) re-triggert den Effekt,
    // darf aber NICHT erneut an den (alten) Hash springen. Wächter VOR dem Hash-
    // Test setzen, damit auch ein hashloser Erststart den späteren Re-Lauf sperrt.
    if (hashSeedGetan.current) return;
    hashSeedGetan.current = true;
    // LM-199 (W2·17-UI-BEFUNDE-B2): VERBRAUCHTER Einstiegs-Hash — beim Browser-
    // Zurück aus einer anderen Route steht der alte «#art-…» noch in der URL,
    // massgeblich ist aber die A16-Anker-Restauration (App.tsx). Ohne diesen
    // Wächter kaperte der Seed-Sprung nach dem Remount die Rückkehr-Position
    // erneut (Prod-Messung 2.8.2026: ~149'000 px daneben). Nur Primär — das
    // sekundäre Pane hat seine eigene, frisch geseedete Location (A17).
    if (!istSekundaer && istHashVerbraucht()) return;
    const hashQuelle = istSekundaer ? paneLocationHash : window.location.hash;
    const m = hashQuelle.match(/^#art-(.+)$/);
    if (!m) return;
    // Deep-Link mit Artikel-Anker → aktiven Reiter darauf melden (Live-Label).
    // Sekundäres Pane treibt den globalen Reiter-Tracker NICHT (es ist nicht die URL).
    if (!istSekundaer) aktualisiereTabArtikel(window.location.pathname + window.location.search + window.location.hash);
    const token = decodeURIComponent(m[1]);
    const ids = pfadZu(sektionen, (s) => s.artikel.some((e) => e.artikel === token)) ?? [];
    // LM-157 (W2·17-UI-BEFUNDE-B4): der Seed-Sprung öffnete den TOC-Pfad
    // (`oeffnePfad`) und scrollte den Text, setzte aber nie `aktivIds`/`aktArtikel`
    // selbst — beides blieb dem IntersectionObserver-Scroll-Spy weiter unten
    // überlassen. Bei einem frischen Aufruf mit `#art-…`-Anker beobachtete der Spy
    // den programmatischen Sprung nicht zuverlässig (Ziel ist im selben Frame noch
    // nicht am Bezugspunkt), darum blieben Gliederung UND Breadcrumb auf dem
    // Dokumentanfang stehen, bis von Hand gescrollt wurde. Fix: dieselben zwei
    // State-Setter, die auch der Klick-Sprung (springeZuSektion) und der laufende
    // Scroll-Spy (unten, Z. ~421/453) verwenden — hier synchron mit dem Seed statt
    // erst nach dem ersten manuellen Scroll.
    if (ids.length) {
      setAktivIds(ids);
      const artLabel = artLabelByToken.get(token) ?? `Art. ${token.replace(/_/g, '')}`;
      setAktArtikel(artLabel);
    }
    if (ids.length) oeffnePfad(ids);
    // ═══ W2·24-R6/L1 · DER TIEFLINK-SPRUNG WIRD NICHT GEMALT, BEVOR ER STEHT ══
    //
    // BEFUND (gemessen 6.9.2026, `dist/`-Preview, Chromium @390×844, je 3 Läufe
    // mit byte-gleichem Ergebnis): CLS **1.1664** auf OR#art-336_c, **0.9307**
    // auf OR#art-1, **0.5749** auf ZGB#art-457 — gegen **0.0362** ohne Anker
    // (ZPO). Der Anker war der Fall, nicht der Erlass.
    //
    // WAS WIRKLICH PASSIERT (Frame-Trace, `requestAnimationFrame`):
    //   t≈1313 ms  Artikel im DOM, scrollY 219'766, docH 828'570
    //   t≈1362 ms  scrollY 221'226, docH 830'803
    //   t≈1440 ms  scrollY 221'403 — steht
    // Also DREI gemalte Lagen desselben Sprungs. Ursache ist
    // `content-visibility:auto`: die 1'000+ Artikel VOR dem Ziel tragen
    // Platzhalterhöhen (`schaetzeArtikelHoehe`), solange sie nie im Bild waren.
    // Der Sprung rechnet mit diesen Schätzungen, macht dabei die Nachbarschaft
    // des Ziels «relevant», die echten Höhen laufen ein — und das Ziel wandert
    // um 1'637 px. Weil sich dabei auch die Höhen ändern, verbucht der Browser
    // die Bewegung nicht als Scroll, sondern als unerwartete Verschiebung.
    //
    // ZWEI WEGE, DIE NICHT FUNKTIONIEREN — beide gemessen, beide verworfen:
    //  (a) Sprung in den Layout-Effekt ziehen (statt `useEffect` nach dem Paint):
    //      richtig und nötig, aber allein wirkungslos — CLS blieb byte-gleich
    //      1.1664. Die erste Lage wird dann eben vor dem Paint eingenommen; die
    //      beiden Korrekturen danach bleiben.
    //  (b) Die Korrektur in denselben Tick schleifen (`scrollIntoView` +
    //      `getBoundingClientRect` bis zur Konvergenz): ebenfalls wirkungslos,
    //      wieder 1.1664. `getBoundingClientRect` erzwingt zwar das Layout, aber
    //      die RELEVANZ eines `content-visibility`-Teilbaums entscheidet der
    //      Browser erst im nächsten Rendering-Lifecycle — im selben Tick sieht
    //      die Schleife immer dieselbe Schätzung und bricht nach zwei Runden ab.
    //
    // DER WEG, DER FUNKTIONIERT: die Lesespalte wird für die Dauer des
    // Einschwingens NICHT GEMALT (`visibility:hidden`, Klasse `.lr6-anker-
    // warten`). Sie behält ihren Platz — die Höhe steht, nichts springt —, und
    // was nicht gemalt wird, kann auch nicht verrutschen: der Browser zählt
    // Verschiebungen nur an sichtbaren Knoten. Sichtbar wird die Spalte erst,
    // wenn die Lage zwei Frames lang steht. Der Leser bekommt damit statt
    // dreier Sprünge EIN Bild, und zwar das richtige.
    //
    // DREI KLAMMERN, damit daraus nie eine leere Seite wird:
    //  · findet der Effekt den Artikel nicht, wird gar nichts versteckt;
    //  · die Aufräum-Funktion des Effekts deckt auf (Abbruch/Unmount);
    //  · ein Zeitdeckel (`AUFDECK_MS`) deckt in jedem Fall auf, auch wenn die
    //    Lage unter Last nie zwei Frames lang steht.
    // Der Schalter sitzt an der WURZEL, nicht an der Lesespalte: verdeckt werden
    // muss auch der Seitenfuss. GEMESSEN auf OR#art-1 (dem Tieflink mit dem
    // KÜRZESTEN Sprung, 1'011 px): dort zeigte der Zwischenframe den Fuss bei
    // y 95 mit 749 px Höhe im Bild, und sein Verschwinden allein trug 0.8874
    // des CLS. Ein Fuss, der für zwei Frames am Kopf des Dokuments steht, ist
    // dieselbe Verschiebung wie ein springender Artikel — nur an einem anderen
    // Knoten. Welche Flächen still bleiben, sagt die Regel in `index.css`.
    const wurzelEl = typeof document !== 'undefined' ? document.documentElement : null;
    wurzelEl?.setAttribute('data-lr6-anker-warten', '');
    let aufgedeckt = false;
    const aufdecken = () => { aufgedeckt = true; wurzelEl?.removeAttribute('data-lr6-anker-warten'); };
    const springe = (blink: boolean) => {
      const el = findeArt(paneRoot(imPane, wurzel), token);
      if (!el) return null;
      // R1: oberer Lese-Rand statt Mitte (deckt sich mit der Scroll-Spy-Bezugslinie).
      el.scrollIntoView({ block: 'start', behavior: 'auto' });
      if (blink) {
        el.classList.add('lc-ziel-blink');
        window.setTimeout(() => el.classList.remove('lc-ziel-blink'), 2400);
      }
      return el;
    };
    springe(true);
    // Deckel für den Aufdeck-Zeitpunkt. GEMESSEN schwingt der Sprung nach
    // 127 ms ein (1313 → 1440); 600 ms ist das Vierfache davon und damit die
    // Reserve für langsame Geräte, nicht der Regelfall.
    const AUFDECK_MS = 600;
    const deckel = window.setTimeout(aufdecken, AUFDECK_MS);
    let ruhig = 0;
    // Gemessen wird die LAGE DES ZIELS im Bild, nicht `window.scrollY`: im
    // sekundären Pane scrollt nicht das Fenster, sondern der Pane-Scroller —
    // die Fensterposition stünde dort von Anfang an still und der Deckel wäre
    // die einzige Klammer (§5: eine Grösse, die in beiden Lagen dasselbe misst).
    let letzteLage = Number.NaN;
    let rafId = 0;
    const nachziehen = () => {
      if (aufgedeckt) return;
      const el = springe(false);
      if (!el) { aufdecken(); return; }
      const lage = el.getBoundingClientRect().top;
      ruhig = Math.abs(lage - letzteLage) <= 1 ? ruhig + 1 : 0;
      letzteLage = lage;
      if (ruhig >= 2) { window.clearTimeout(deckel); aufdecken(); return; }
      rafId = window.requestAnimationFrame(nachziehen);
    };
    rafId = window.requestAnimationFrame(nachziehen);
    return () => { window.clearTimeout(deckel); window.cancelAnimationFrame(rafId); aufdecken(); };
    // location.hash bewusst NICHT in den Deps: der Effekt springt EINMAL beim
    // Erlass-Laden an die (Pane-lokale bzw. Fenster-)Fundstelle — die Primär-
    // Instanz führt spätere Hash-Wechsel über den letzteNavKey-Effekt nach
    // (kein Doppel-Sprung/-Blink), das Pane öffnet an seiner Seed-Fundstelle.
    // Die `eslint-disable`-Zeile für `react-hooks/exhaustive-deps` ist mit R6
    // ERSATZLOS weg: sie stand über einem `useEffect`, das die Regel geprüft
    // hätte — `useIsoLayoutEffect` ist ein Alias, den die Regel gar nicht
    // ansieht, und eine Ausnahme von einer Prüfung, die nicht stattfindet, ist
    // eine tote Zeile (eslint meldet sie selbst als «unused directive»). Die
    // Dep-Liste bleibt byte-gleich; abgeschaltet war die Prüfung vorher wie
    // nachher.
  }, [eintraege, sektionen, istSekundaer, imPane, wurzel]);
}
