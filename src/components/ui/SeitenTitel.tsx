import type { ReactNode } from 'react';
import { usePaneKlasse } from '../layout/PaneKontext';

// ─── A-1 (W2·19-DESIGN-KONSISTENZ, 31.8.2026) · EIN SEITENTITEL ─────────────
//
// BEFUND der Finder-Welle: die H1 der Seite wurde an vier Stellen von Hand
// nachgebaut — `layout/SeitenKopf`, `layout/RechnerKopf`, `vorlagen/wizard`,
// `gesetz-leser/parts/ErlassLeserKopf` (EntscheidLeser folgt in BAU-4) — und
// alle vier trugen dieselbe VIEWPORT-Kaskade `text-h2 sm:text-h1`. Im
// Split-View ist der Viewport die falsche Zahl: eine 620-px-Pane in einem
// 1440-px-Fenster liest `sm:` als erfüllt und setzt den Titel in der
// Vollansichts-Grösse (32 px) in eine halbe Spalte. Die Kaskade ist gemessen
// die einzige Layout-Aussage des Titels, und sie stand vierfach da.
//
// KANON IST DIE PANE-FÄHIGE FORM — dieselbe Herleitung wie in
// `pages/gesetz-leser/v3/kopfStufen.ts` (dort Z. 17/18): «Ein `xl:`-Präfix hätte
// im Pane den Viewport gemessen und dort das Desktop-Bild in eine 620-px-Spalte
// gezwungen.» `usePaneKlasse` (§5, `layout/PaneKontext`) wählt darum je
// Kontext:
//   · ausserhalb eines Panes → `text-h2 sm:text-h1` (unverändert, Prerender
//     byte-gleich zum Vorzustand);
//   · im Pane                → `text-h2 @xl/pane:text-h1`, gemessen an der
//     PANE-Breite (`@container/pane` liegt am Scroll-Element, `layout/Pane.tsx`).
//
// Reine Darstellung (§3), keine Rechtslogik. Der Baustein rendert die H1
// SELBST (nicht nur eine Klassenzeichenkette): sonst bliebe die Doppelung
// «welches Tag, welche Stimme, welches Gewicht» an vier Stellen stehen und nur
// die Kaskade wäre geteilt (§5/§10).

/**
 * Schriftstimme des Titels (DESIGN-REGLEMENT §e, Zwei-Stimmen-Regel).
 *
 * `display` — die Sans-Display-Stimme der Produkt-Oberfläche (Rechner,
 *             Vorlagen, statische Seiten).
 * `serif`   — die Serif-Stimme des zitierfähigen Quelltexts. Sie trägt den
 *             Erlass-Kopf; die Wahl ist bedeutungstragend und bleibt darum
 *             eine ausdrückliche Angabe des Aufrufers, kein Default.
 */
export type TitelStimme = 'display' | 'serif';

export function SeitenTitel({ stimme = 'display', className, id, children }: {
  stimme?: TitelStimme;
  /** Zusätzliche Klassen des Aufrufers (Umbruch-Regeln, Höhen-Reservierung). */
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  const pk = usePaneKlasse();
  const klassen = [
    pk('text-h2 sm:text-h1', 'text-h2 @xl/pane:text-h1'),
    stimme === 'serif' ? 'font-serif' : 'font-display',
    'font-semibold text-ink-900',
    className,
  ].filter(Boolean).join(' ');
  return <h1 id={id} className={klassen}>{children}</h1>;
}
