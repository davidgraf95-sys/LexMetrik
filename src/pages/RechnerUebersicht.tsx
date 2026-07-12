import { useMemo, useState } from 'react';
import { KATALOG_KARTEN } from '../lib/startseiteConfig';
import { OBERKATEGORIEN } from '../lib/oberkategorien';
import { KategorieSektion } from '../components/Katalog';
import { kartenDerKategorie } from '../lib/katalogKategorie';
import { kartePasst, LEERER_FILTER } from '../lib/katalogSuche';
import { KatalogHinweis } from '../components/KatalogHinweis';
import { MassgebendeGesetze } from '../components/normtext/MassgebendeGesetze';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { EntwurfLegende } from '../components/EntwurfLegende';
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
  // W2·10-UI-NAV/N0d·W4: lokaler Sofort-Filter über die bestehende Katalog-
  // Struktur (kartePasst — dieselbe getestete Treffer-Logik wie die Kopfsuche,
  // §5). Leerer Filter = unveränderte Ansicht (byte-gleich); bei aktivem Filter
  // werden nur die Kategorien mit Treffern gezeigt und die «In Vorbereitung»-
  // Accordions geöffnet. Rein clientseitig, keine Rechenlogik.
  const [filter, setFilter] = useState('');
  const q = filter.trim();
  const karten = useMemo(
    () => (q === '' ? KATALOG_KARTEN : KATALOG_KARTEN.filter((k) => kartePasst(k, { ...LEERER_FILTER, suche: q }))),
    [q],
  );
  const kategorien = useMemo(
    () => (q === '' ? RECHNER_KATEGORIEN : RECHNER_KATEGORIEN.filter((kat) => kartenDerKategorie(karten, kat.id).length > 0)),
    [karten, q],
  );
  const gefiltert = q !== '';

  return (
    <div className="space-y-8">
      <SeitenKopf
        overline="Rechner & Werkzeuge"
        titel="Rechner"
        intro="Zwei Wege hinein: nach Rechtsgebiet (aufklappbar) oder nach Aufgabe (Zuständigkeiten · Fristen · Gebühren). Oder unten filtern bzw. oben im Feld suchen (Kürzel «/»)."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <label htmlFor="rechner-filter" className="lc-overline">Rechner filtern</label>
          <input id="rechner-filter" type="search" value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Titel, Rechtsgebiet oder Norm …" aria-label="Rechner filtern"
            className="lc-input h-9 py-0 text-body-s w-full max-w-reading" />
        </div>
        <EntwurfLegende />
      </div>

      {!gefiltert && <ZweiachsigerEinstieg />}

      {kategorien.map((kat) => (
        <KategorieSektion key={kat.id} kat={kat} karten={kartenDerKategorie(karten, kat.id)} alleOffen={gefiltert} />
      ))}

      {gefiltert && kategorien.length === 0 && (
        <p className="text-body-s text-ink-500 py-6">
          Kein Rechner für «{q}» gefunden.{' '}
          <button type="button" onClick={() => setFilter('')}
            className="font-medium text-brass-700 hover:text-brass-600">Filter zurücksetzen</button>
        </p>
      )}

      {/* Werkzeuge/Kontext nur in der ungefilterten Vollansicht — im Filter-Modus
          zählt die knappe Trefferliste. */}
      {!gefiltert && (
        <>
          {/* Werkzeuge: die Zeiterfassung wohnt seit Startseite V3 (§3) hier unten
              statt auf der Startseite — Komponente unverändert, gleiche Selbst-
              Höhe wie zuvor (CLS-neutral). */}
          <section className="space-y-2.5" aria-labelledby="werkzeuge-titel">
            <h2 id="werkzeuge-titel" className="lc-overline">Werkzeuge</h2>
            <Zeiterfassung />
          </section>

          <MassgebendeGesetze modus="rechner" />
          <KatalogHinweis />
        </>
      )}
    </div>
  );
}
