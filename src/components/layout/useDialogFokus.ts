import { useEffect, useRef, type RefObject } from 'react';
import { naechsterFokus } from '../../lib/normtext/fokus';

// Selektor für nativ fokussierbare Elemente — identisch zum bewährten
// NormPopover-Overlay (components/vorlagen/ui.tsx), damit alle Dialoge dieselbe
// Fokus-Falle verwenden (§5: eine Quelle für das Verhalten).
const FOKUSSIERBAR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Dialog-/Overlay-Fokusverwaltung nach ARIA-Dialog-Pattern (WCAG 2.4.3):
 *  - setzt beim Öffnen den Fokus in den Container (erstes fokussierbares Element
 *    oder den Container selbst — dieser braucht `tabIndex={-1}`),
 *  - hält Tab/Shift+Tab zyklisch im Container (Fokus-Falle; reine Index-Logik in
 *    `naechsterFokus`, hier nur die DOM-Verdrahtung — identisch zum NormPopover),
 *  - schliesst bei Escape,
 *  - gibt den Fokus beim Schliessen an das zuvor fokussierte Element (den
 *    Auslöser) zurück.
 *
 * `onClose` darf instabil sein (wird über eine Ref gelesen → der Effekt hängt
 * nur an `offen`, re-fokussiert also nicht bei jedem Render).
 */
export function useDialogFokus(
  offen: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
): void {
  const onCloseRef = useRef(onClose);
  // Stets die aktuelle onClose halten, ohne sie zur Effekt-Abhängigkeit zu machen
  // (Schreiben im Effekt, nicht im Render — react-hooks/refs).
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!offen) return;
    const wurzel = containerRef.current;
    if (wurzel == null) return;

    // Auslöser merken, um den Fokus beim Schliessen zurückzugeben.
    const vorherFokussiert = document.activeElement as HTMLElement | null;

    const sammle = () =>
      Array.from(wurzel.querySelectorAll<HTMLElement>(FOKUSSIERBAR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    // Initialen Fokus in den Dialog setzen (sonst bleibt er auf dem Auslöser).
    (sammle()[0] ?? wurzel).focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      // Bei jedem Tab frisch einsammeln (Inhalt kann sich ändern).
      const fokussierbar = sammle();
      if (fokussierbar.length === 0) {
        e.preventDefault();
        wurzel.focus();
        return;
      }
      const aktiv = fokussierbar.indexOf(document.activeElement as HTMLElement);
      const ziel = naechsterFokus(fokussierbar.length, aktiv, e.shiftKey);
      if (ziel < 0) return;
      e.preventDefault();
      fokussierbar[ziel].focus();
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (vorherFokussiert && typeof vorherFokussiert.focus === 'function') {
        vorherFokussiert.focus();
      }
    };
  }, [offen, containerRef]);
}
