import { SelectionGrid, type SelectionItem } from './SelectionGrid';
import { hauptTreffer, type PlzTreffer } from '../../data/plz/plzAufloesung';
import { gemeindeOptionen } from './plzGemeindeOptionen';
import type { Kanton } from '../../types/legal';

// ─── PlzGemeindeWahl: Auswahl bei mehrdeutiger PLZ – Darstellungsschicht (§3) ─
// TODO 5 aus bibliothek/behoerden/betreibungskreise-kantone.md (10.6.2026):
// Bei PLZ mit mehreren Gemeinden (1216 von 3177 im amtlichen Verzeichnis)
// musste die Gemeinde bisher von Hand getippt werden (Schreibweisen-Falle);
// jetzt klickbare Kacheln (geteilter Baustein SelectionGrid, §10). Der Klick
// ist eine explizite Nutzerentscheidung und setzt Gemeinde UND Kanton — im
// Unterschied zum Auto-Fill der Formulare, der nur LEERE Felder füllt
// (Leer-Guards, Bug-Fix 10.6.2026, bleiben unberührt). Keine Logik: die
// Kacheln zeigen exakt die amtlichen swisstopo-Treffer der Datenschicht.

export function PlzGemeindeWahl({ plz, treffer, gemeinde, kanton, onWahl }: {
  plz: string;
  treffer: PlzTreffer[];
  /** Aktueller Feldinhalt – die passende Kachel wird als aktiv markiert
      (exakter Abgleich mit dem amtlichen Namen; Getipptes ohne Match → keine). */
  gemeinde: string;
  kanton: Kanton | '';
  onWahl: (wahl: { gemeinde: string; kanton: Kanton }) => void;
}) {
  const optionen = gemeindeOptionen(treffer);
  if (optionen.length < 2) return null;
  const haupt = hauptTreffer(treffer);
  const kantone = [...new Set(optionen.map((o) => o.kanton))];
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-ink-500">
        {haupt
          ? `PLZ ${plz}: Hauptgemeinde ${haupt.gemeinde} (${haupt.kanton}) ist vorausgefüllt — ein Randgebiet nur wählen, falls die Adresse dort liegt.`
          : `PLZ ${plz}: mehrere Gemeinden — die zutreffende wählen${kantone.length > 1 ? ' (setzt auch den Kanton)' : ''}.`}
      </p>
      <SelectionGrid<string>
        items={optionen.map((o): SelectionItem<string> => ({
          code: `${o.gemeinde}|${o.kanton}`,
          label: o.gemeinde,
          sub: <span className="num">{`${o.kanton} · ${o.anteilProzent} % der Adressen`}</span>,
        }))}
        value={`${gemeinde.trim()}|${kanton}`}
        onSelect={(code) => {
          const o = optionen.find((k) => `${k.gemeinde}|${k.kanton}` === code);
          if (o) onWahl({ gemeinde: o.gemeinde, kanton: o.kanton });
        }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
      />
    </div>
  );
}
