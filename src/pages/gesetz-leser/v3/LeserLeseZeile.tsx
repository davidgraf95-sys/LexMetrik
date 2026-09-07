import type { ReactNode } from 'react';
import { LeserGliederungSchiene } from './LeserGliederungSchiene';
import type { RahmenBild } from './rahmenSpalten';
import { SatzspiegelKontext } from './satzspiegel';

// ─── Die Lese-Zeile: Gliederung/Schiene · Text · Beiwerk-Spur ────────────────
//
// Herausgelöst aus `LeserRahmenV3.tsx` (H4-Nachzug 18.8.2026, §6.6 — die Datei
// stand nach den vier Ä-Fixen bei 447 Zeilen gegen eine 420er-Sonde). Der
// Anlass ist die Zeilenzahl, der GRUND ist ein anderer und trägt allein: dies
// hier ist die einzige Stelle, an der die drei SPUREN nebeneinander stehen, und
// wer wissen will, wie die Breiten-Entscheidung aus `./rahmenSpalten` zu Markup
// wird, soll genau eine Datei lesen müssen.
//
// WELCHE Spuren auf welcher Breite stehen, WIE breit der Rahmen dafür wird und
// warum das Grid auch eingeklappt stehen bleibt: `./rahmenSpalten` (Befund
// David 16.8., Ä60 (c) 17./18.8., beide mit Messreihe). Diese Datei ENTSCHEIDET
// nichts davon — sie bekommt das fertige `RahmenBild` und ordnet an (§3); ihre
// Inhalte kommen als Slots herein, sie kennt weder Modell noch Erlass.

export function LeserLeseZeile({
  bild, vollflaechig, onSchieneAuf, leiste, zelle, panelZone,
}: {
  /** Die Breiten-Entscheidung. `bild.spalten === undefined` = kein Grid, alles
   *  steht untereinander wie vor Ä60 (c). */
  bild: RahmenBild;
  /** Nur für die Höhen-Rechnung der Spalte: in der Einzelansicht deckelt das
   *  FENSTER, sonst die Pane-Höhe. Die Prop heisst NICHT `imPane`, und das ist
   *  kein Kosmetik-Entscheid — dieselbe Begründung wie bei `kopfStufen.panelForm`:
   *  die Fundament-Sonde lässt `imPane` nur in den Wurzel-Dateien zu, denn eine
   *  Datei, die den Hüllen-Zustand selbst liest, verzweigt auf ihn. Diese Datei
   *  verzweigt auf eine EIGENSCHAFT DER FLÄCHE, die ihr der Rahmen mitteilt. */
  vollflaechig: boolean;
  /** Klick auf die Schiene — läuft im Rahmen durch den Stick-Ausgleich.
   *  D33 (7.9.2026): er holt keinen Platz mehr vom Blatt zurück, weil das Blatt
   *  keine Spur mehr belegt (`bild.schieneHoltPlatz` ist mit ihr gefallen). */
  onSchieneAuf: () => void;
  /** Inhalt der Gliederungsspalte (Übersicht · Feld · Baum). */
  leiste: ReactNode;
  /** Rechte Zelle: Erlass-Kopf, Ingress und Lesekörper. */
  zelle: ReactNode;
  /** Panel-Zone — im Spalten-Modus die dritte Spur, sonst ohne Box und
   *  ausserhalb des Flusses. `null`, solange es weder Öffner noch Panel gibt. */
  panelZone: ReactNode;
}) {
  return (
    <div
      className={bild.spalten
        ? // gap-5 statt gap-8 (Auftrag David 29.8.2026: «weniger Abstand Gesetz ↔
          // Gliederung») — muss mit SPUR_ABSTAND in rahmenSpalten.ts übereinstimmen.
          //
          // E-4 (Design-Konsistenz 31.8.2026): `duration-200 ease-out` waren die
          // letzten rohen Motion-Werte der Darstellungsschicht — 200 ms lag
          // neben der Haus-Stufe `--dur-slow` (220 ms), und `ease-out` neben der
          // EINEN Kurve `--ease`. Beide Token kommen aus src/index.css
          // (D-1.7 Motion-Dedup, tailwind.config transitionDuration/
          // transitionTimingFunction). `ease-out` fällt ERSATZLOS weg: die
          // `transition-[…]`-Utility setzt bereits die Default-Kurve, und die
          // ist in der Config auf `var(--ease)` gelegt.
          'grid gap-5 motion-safe:transition-[grid-template-columns] motion-safe:duration-slow'
        : ''}
      style={bild.spalten ? { gridTemplateColumns: bild.spalten } : undefined}>
      {bild.schiene && (
        // Optik und Herleitung in `./LeserGliederungSchiene` (C5b, §6.6).
        <LeserGliederungSchiene onAuf={onSchieneAuf} />
      )}
      {bild.gliederungSpalte && (
        <aside role="navigation" aria-label="Gliederung" data-v3-aside
          // Geometrie WÖRTLICH wie die Ist-Spalte, und aus demselben Grund:
          // `top` ist derselbe Ausdruck wie der Sprung-Offset der Anker, damit
          // Spalte und Sprung konstruktiv nicht auseinanderlaufen (LM-003).
          // `flex flex-col` + `maxHeight` ist die tragende Kombination — NICHT
          // `overflow-hidden` mit `h-full` im Kind: `height:100%` löst gegen
          // eine Maximalhöhe nicht auf, der Scroller wüchse auf die volle
          // Inhaltshöhe und der Überschuss würde stumm abgeschnitten
          // (reproduziert am OR @1440×900).
          // W2·24-R6/L16: Der Ausdruck trägt kein Inhaltsverzeichnis und kein
          // Suchfeld. GEMESSEN 6.9.2026 (`emulateMedia('print')`, ZPO): die
          // Spalte druckte mit `display:flex`, 288×506 px, samt «Im Erlass
          // suchen …» — Bedienung auf Papier. Titelblatt, Reiterleiste und
          // Pane-Köpfe waren schon still; hier fehlte die Regel.
          className="sticky flex min-h-0 flex-col self-start print:hidden"
          style={{
            top: 'var(--nt-stick)',
            maxHeight: vollflaechig
              ? 'calc(100vh - var(--nt-stick) - 1.5rem)'
              : 'calc(100dvh - var(--leser-kopf-h) - var(--leser-sub-h) - 1rem)',
          }}>
          {/* D32 (7.9.2026): der Griff «‹ Gliederung ausblenden» stand hier als
              eigene 28-px-Zeile über der Gliederung. Er ist in den linken
              Streifen der Kopfzeile gezogen (`./LeserKopf`, `gliederungGriff`),
              der seit D32 genau die Breite dieser Spur hat und sonst leer
              stünde — Beschriftung, Ä12-Herleitung und `aria-expanded`
              unverändert mitgenommen, nur der Ort ist neu. Folge, gewollt und
              in den Bildbogen aufgenommen: die Gliederung beginnt 28 px höher. */}
          {leiste}
        </aside>
      )}

      {/* Rechte Zelle: Erlass-Kopf UND Lesespalte. Der Erlass-Kopf lief bis H1
          über die VOLLE Breite und schob die Seitenleiste bei 1440 px unter die
          Falz — obwohl sie in V3 die Hauptnavigation ist.

          Auftrag David 21.8.2026 · SCROLL-BLUR: eine dezente Verlaufskante am
          Kopf-Unterrand (wo `--nt-stick` endet) und am unteren Viewport-Rand,
          damit Text sanft unter dem klebenden Kopf verschwindet statt hart zu
          schneiden — wie in Chat-Oberflächen. Reines CSS, keine Scroll-Handler
          (§15): `position: sticky` folgt automatisch dem jeweils NÄHEREN
          Scroll-Container — dem Fenster in der Einzelansicht, dem
          `overflow-y-auto`-Pane im Split-View (`components/layout/Shell.tsx`)
          — ohne dass diese Datei wissen muss, welcher Fall gerade gilt.
          `h-0` an den beiden äusseren Trägern: sie nehmen im Fluss KEINEN Platz
          ein (kein CLS, keine zusätzliche Lücke in `space-y-5`) — der sichtbare
          Streifen ist ein `overflow-visible`-Kind, das aus der Null-Höhe heraus
          über den scrollenden Text ragt. Eigene Ebene AUSSERHALB von
          `LeserLesespalte` (PX-gesperrt, s. dort) — kein Byte dort angefasst.
          `bg-paper`: dieselbe opake Fläche wie der klebende Kopf
          (`LeserKopf.tsx`), also nahtlos; Token statt Hex, beide Themes über
          die CSS-Variable `--paper`. `print:hidden`: im Druck nur Ballast.

          Auftrag David 21.8.2026 · DEZENTER: die erste Fassung wirkte zu
          kräftig — Höhe halbiert (h-8 → h-4, 32px → 16px) UND die
          Startdeckung abgeschwächt (`from-paper` volldeckend →
          `from-paper/70`, Opacity-Modifier auf demselben Token, Tailwind
          3.4 löst ihn per `color-mix()` auf — Beleg-Präzedenz
          `EntscheidLeser.tsx` `bg-paper/95`, `SuchBereichWahl.tsx`
          `bg-paper/60`). `-mt-4` zieht mit der neuen Höhe mit, sonst
          verschöbe sich der untere Streifen vom Viewport-Rand weg. */}
      {/* W2·24-R4 · der Satzspiegel-Anker sitzt AN DER LESE-ZELLE, nicht am
          Leser-Wurzelelement: die Ausbaustufe ist eine Aussage über DIESE
          Fläche (`bild.satzspiegel` ist aus ihrer Breite gerechnet), und der
          Kontext daneben reicht sie an `parts/ArtikelLeser` weiter. Beides
          zusammen an einem Ort — `index.css` (Block «SATZSPIEGEL») und
          `ArtikelLeser` lesen dieselbe Quelle. */}
      <SatzspiegelKontext.Provider value={bild.satzspiegel}>
      <div className="relative min-w-0" data-lr-spiegel={bild.satzspiegel}>
        {/* D33 (7.9.2026): die Panel-Zone steht IN der Lese-Zelle, nicht neben
            ihr. Ihre klebende Gestalt braucht einen `relative`-Bezug und eine
            natürliche Lage unter dem Kopf-Block — beides gibt genau diese Zelle
            her (Herleitung in `./LeserPanelZone`). Sie nimmt keinen Platz: im
            Ruhezustand ist sie `display: contents` ohne Kinder, offen eine
            0-Höhen-Hülle mit absolut gesetztem Blatt. */}
        {panelZone}
        <div aria-hidden data-v3-blur="oben" className="pointer-events-none sticky z-sticky h-0 overflow-visible print:hidden"
          style={{ top: 'var(--nt-stick)' }}>
          <div className="h-4 bg-gradient-to-b from-paper/70 to-transparent" />
        </div>
        <div className="space-y-5">{zelle}</div>
        <div aria-hidden data-v3-blur="unten" className="pointer-events-none sticky bottom-0 z-sticky h-0 overflow-visible print:hidden">
          <div className="-mt-4 h-4 bg-gradient-to-t from-paper/70 to-transparent" />
        </div>
      </div>
      </SatzspiegelKontext.Provider>
    </div>
  );
}
