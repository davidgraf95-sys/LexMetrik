import { KATALOG_KARTEN } from '../lib/startseiteConfig';
import { Katalog } from '../components/Katalog';
import { SeitenKopf } from '../components/layout/SeitenKopf';

// ─── Recherche-Seite (Build-Plan App-Shell, Phase 4 — minimal) ──────────────
//
// Schlanke Such-Einstiegsseite, die die BESTEHENDE Katalog-Suche wiederverwendet
// (Katalog liest ?q=, HeaderSuche schreibt es auch auf /recherche live, §5) —
// kein zweiter Such-Apparat. Bewusst minimal: Katalog-Treffer; eine Volltext-
// Normen-Suche folgt später (Build-Plan §5, Recherche-Tiefe v1).
export function Recherche() {
  return (
    <div className="space-y-6">
      <SeitenKopf
        overline="Recherche"
        titel="Katalog durchsuchen"
        intro="Rechner und Vorlagen im Volltext durchsuchen — tippen Sie oben im Suchfeld (Kürzel «/»), oder wählen Sie eine Kategorie. Eine Volltext-Suche in den Gesetzen folgt später."
      />
      <Katalog karten={KATALOG_KARTEN} />
    </div>
  );
}
