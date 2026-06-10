import type { ReactNode } from 'react';
import { ErgebnisSprung, LiveHeader } from './vorlagen/ui';

// ─── Geteilter Ergebnisblock-Rahmen (DESIGN-REGLEMENT-RECHNER R4) ───────────
// EIN Rahmen für jedes Rechner-Ergebnis: Sprungmarke (mobil), Live-Hinweis,
// Einblendung und EINE aria-live-Region. Vorher trugen die Formulare diese
// vier Stücke in wechselnden Teilmengen (Audit 11.6.2026: Sprung fehlte in
// 10, reveal/aria in 10, LiveHeader in 2 von 16 Formularen).
//
// id: Standard `lc-ergebnis`; Formulare, die gemeinsam auf einer Seite
// gerendert werden können (Tagerechner-Teilformulare, Kombinierte Ansicht),
// übergeben eindeutige Suffixe — doppelte DOM-ids brechen die Sprungmarke.
// sprung={false} für Blöcke, die ohnehin im ersten Viewport stehen (Schnell-
// rechner) oder neben einem zweiten Ergebnisblock leben — die Sprungmarke ist
// fixed positioniert, zwei Stück würden sich überlagern.
export function ErgebnisBlock({ id = 'lc-ergebnis', live = true, sprung = true, children }: {
  id?: string;
  live?: boolean;
  sprung?: boolean;
  children: ReactNode;
}) {
  return (
    <div id={id} className="lc-reveal space-y-4" aria-live="polite">
      {sprung && <ErgebnisSprung zielId={id} />}
      {live && <LiveHeader />}
      {children}
    </div>
  );
}
