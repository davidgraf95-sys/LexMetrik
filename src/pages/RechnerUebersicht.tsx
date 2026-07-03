import { KATALOG_KARTEN } from '../lib/startseiteConfig';
import { OBERKATEGORIEN } from '../lib/oberkategorien';
import { KategorieSektion } from '../components/Katalog';
import { kartenDerKategorie } from '../lib/katalogKategorie';
import { KatalogHinweis } from '../components/KatalogHinweis';
import { MassgebendeGesetze } from '../components/normtext/MassgebendeGesetze';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { ZweiachsigerEinstieg } from '../components/ZweiachsigerEinstieg';
import { Zeiterfassung } from '../components/start/Zeiterfassung';

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
        intro="Zwei Wege hinein: nach Rechtsgebiet (aufklappbar) oder nach Aufgabe (Zuständigkeiten · Fristen · Gebühren). Oder oben im Feld suchen (Kürzel «/»)."
      />

      <ZweiachsigerEinstieg />

      {RECHNER_KATEGORIEN.map((kat) => (
        <KategorieSektion key={kat.id} kat={kat} karten={kartenDerKategorie(KATALOG_KARTEN, kat.id)} />
      ))}

      {/* Werkzeuge: die Zeiterfassung wohnt seit Startseite V3 (§3) hier unten
          statt auf der Startseite — Komponente unverändert, gleiche Selbst-
          Höhe wie zuvor (CLS-neutral). */}
      <section className="space-y-2.5" aria-labelledby="werkzeuge-titel">
        <h2 id="werkzeuge-titel" className="lc-overline text-ink-500">Werkzeuge</h2>
        <Zeiterfassung />
      </section>

      <MassgebendeGesetze modus="rechner" />
      <KatalogHinweis />
    </div>
  );
}
