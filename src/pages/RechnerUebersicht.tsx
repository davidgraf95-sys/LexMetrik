import { KATALOG_KARTEN } from '../lib/startseiteConfig';
import { OBERKATEGORIEN } from '../lib/oberkategorien';
import { KategorieSektion } from '../components/Katalog';
import { kartenDerKategorie } from '../lib/katalogKategorie';
import { KatalogHinweis } from '../components/KatalogHinweis';
import { SeitenKopf } from '../components/layout/SeitenKopf';

// ─── Rechner-Übersicht (/rechner) — UI-Welle, Ersatz für /recherche ─────────
//
// Eigene Rubrik-Übersicht analog zu /gesetze und /vorlagen (Auftrag David):
// die drei Rechner-Oberkategorien (Zuständigkeiten · Fristen · Gebühren) je als
// vollständige Sektion auf EINER Seite — alle Werkzeuge direkt browsbar, ohne
// Deckblatt-Zwischenklick. Reine Wiederverwendung der bestehenden
// KategorieSektion-Register (§3/§5); die Suche lebt im Header-Dropdown.
const RECHNER_KATEGORIEN = OBERKATEGORIEN.filter((k) => k.id !== 'vorlagen');

export function RechnerUebersicht() {
  return (
    <div className="space-y-8">
      <SeitenKopf
        overline="Rechner & Werkzeuge"
        titel="Rechner"
        intro="Zuständigkeiten, Fristen und Gebühren – nach Aufgabe gegliedert. Wählen Sie ein Werkzeug, oder suchen Sie oben im Feld (Kürzel «/»)."
      />

      {RECHNER_KATEGORIEN.map((kat) => (
        <KategorieSektion key={kat.id} kat={kat} karten={kartenDerKategorie(KATALOG_KARTEN, kat.id)} />
      ))}

      <KatalogHinweis />
    </div>
  );
}
