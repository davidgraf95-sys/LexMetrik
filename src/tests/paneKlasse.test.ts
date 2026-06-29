// Split-View B-1: paneKlasse ist die Verhaltensneutralitäts-Garantie. Bei
// imPane=false MUSS die zeichengleiche Viewport-Klasse zurückkommen — sonst
// driftet der Default-/Prerender-Pfad vom heutigen Verhalten ab (Golden-Bruch,
// Layout-Verschiebung). Die drei realen pane-fähigen Layout-Strings sind hier
// gepinnt: ändert ein Bau-Schritt sie versehentlich auf der Default-Seite,
// schlägt dieser Test an.
import { describe, it, expect } from 'vitest';
import { paneKlasse } from '../components/layout/PaneKontext';

// Die heutigen (Viewport-)Layout-Klassen der paneKlasse-fähigen Stellen.
// (gesetz-leser nutzt KEINE paneKlasse-Grid-Umschaltung, sondern schaltet im Pane
//  per imPane-Toggle auf einspaltig+Drawer — daher hier nicht aufgeführt.)
const VIEWPORT = {
  rechtsprechung: 'lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-6',
  schnellrechner: 'grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start',
  schnellrechnerDivider: 'space-y-2 lg:border-l lg:border-line lg:pl-5',
} as const;

// Die Container-Query-Pendants (im Pane aktiv).
const CONTAINER = {
  rechtsprechung: '@3xl/pane:grid @3xl/pane:grid-cols-[14rem_minmax(0,1fr)] @3xl/pane:gap-6',
  schnellrechner: 'grid gap-5 @3xl/pane:grid-cols-[18rem_minmax(0,1fr)] @3xl/pane:items-start',
  schnellrechnerDivider: 'space-y-2 @3xl/pane:border-l @3xl/pane:border-line @3xl/pane:pl-5',
} as const;

describe('paneKlasse — Verhaltensneutralität des Default-Pfads', () => {
  it('gibt bei imPane=false ZEICHENGLEICH die Viewport-Klasse zurück', () => {
    for (const k of Object.keys(VIEWPORT) as (keyof typeof VIEWPORT)[]) {
      expect(paneKlasse(false, VIEWPORT[k], CONTAINER[k])).toBe(VIEWPORT[k]);
    }
  });

  it('gibt bei imPane=true die Container-Query-Klasse zurück', () => {
    for (const k of Object.keys(VIEWPORT) as (keyof typeof VIEWPORT)[]) {
      expect(paneKlasse(true, VIEWPORT[k], CONTAINER[k])).toBe(CONTAINER[k]);
    }
  });
});
