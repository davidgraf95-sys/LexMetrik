import { useEffect, useState } from 'react';

/** Ist das Sprung-ZIEL gerade im Bild? — die eine Stelle, an der die Frage
 *  beantwortet wird (§5/§10).
 *
 *  Bis zum 4.9.2026 stand die Beobachtung nur in `ErgebnisSprung` (ui.tsx); der
 *  zweite schwebende Sprung-Knopf des Hauses («Vorschau ↓» im Vorlagen-Wizard)
 *  hatte gar keine und blieb darum auch dann stehen, wenn sein Ziel längst im
 *  Bild war (LM-084, W2·17-UI-BEFUNDE B10 — gemessen bei 390 px auf
 *  `/vorlagen/nda`: bei identischer Scroll-Tiefe, Ziel y=380, war der Knopf am
 *  Prod-Stand sichtbar und ist es nachher nicht mehr). Statt die Mechanik ein
 *  zweites Mal zu schreiben, ist sie EIN Haken; das Verhalten aus W5
 *  (11.7.2026) bleibt Wort für Wort dasselbe, es gilt nur für beide Bauformen.
 *
 *  Eigene Datei, nicht `ui.tsx`: dort stehen Komponenten, und ein zusätzlicher
 *  Nicht-Komponenten-Export bricht Fast Refresh (eslint
 *  `react-refresh/only-export-components`, Tor `npm run lint`).
 *
 *  §3: reine Darstellung — der Haken weiss nicht, WAS da sichtbar wird. */
export function useZielSichtbar(zielId: string) {
  const [zielSichtbar, setZielSichtbar] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const el = document.getElementById(zielId);
    if (!el) return;
    // −45 % Boden-Marge: als «sichtbar» gilt das Ziel erst, wenn es spürbar in
    // den oberen Bildbereich rückt (nicht schon beim ersten Pixel am unteren Rand).
    const io = new IntersectionObserver(
      ([eintrag]) => setZielSichtbar(eintrag.isIntersecting),
      { rootMargin: '0px 0px -45% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [zielId]);
  return zielSichtbar;
}
