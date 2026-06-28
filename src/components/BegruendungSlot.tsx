import type { Berechnungsergebnis } from '../types/legal';
import { begruendungsAbsatz } from '../lib/begruendung';
import { BegruendungAbsatz } from './BegruendungAbsatz';

// ─── Eine Aufrufstelle pro Form (FAHRPLAN-BEGRUENDUNGS-ABSATZ B2-0) ──────────
// Komponiert den «Für die Rechtsschrift»-Absatz aus dem Engine-Ergebnis (+
// optionalem, aus Engine-FELDERN formuliertem Zusatz) und rendert ihn. EIN
// String aus EINER Quelle — ab Phase 3 speist derselbe Aufruf zusätzlich
// pdfConfig.begruendung, womit UI- und PDF-Fassung strukturell nie auseinander
// laufen können. Reine Darstellung (§3): keine neue Rechtslogik, kein neuer
// Normtext. Leerer Text → BegruendungAbsatz rendert null.
export function BegruendungSlot({ ergebnis, zusatz }: { ergebnis: Berechnungsergebnis; zusatz?: string }) {
  return <BegruendungAbsatz text={begruendungsAbsatz(ergebnis, zusatz)} />;
}
