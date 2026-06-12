import { useEffect, useState } from 'react';
import { SelectionGrid, type SelectionItem } from './SelectionGrid';
import { hauptTreffer, type PlzTreffer } from '../../data/plz/plzAufloesung';
import { strasseAufloesen } from '../../data/plz/strassenAufloesung';
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
//
// Adress-Ausbau Stufe 2 (Entscheid David 12.6.2026): zusätzlich eine
// optionale Strasse (+ Nr.) — sie löst die Gemeinde OFFLINE aus dem
// amtlichen Gebäudeadressverzeichnis auf (strassenAufloesung.ts; nichts
// verlässt den Browser) und setzt die Wahl wie ein Kachel-Klick.

export function PlzGemeindeWahl({ plz, treffer, gemeinde, kanton, onWahl }: {
  plz: string;
  treffer: PlzTreffer[];
  /** Aktueller Feldinhalt – die passende Kachel wird als aktiv markiert
      (exakter Abgleich mit dem amtlichen Namen; Getipptes ohne Match → keine). */
  gemeinde: string;
  kanton: Kanton | '';
  onWahl: (wahl: { gemeinde: string; kanton: Kanton }) => void;
}) {
  const [strasse, setStrasse] = useState('');
  const [nummer, setNummer] = useState('');
  const [status, setStatus] = useState<'aufgeloest' | 'nummer_noetig' | 'unbekannt' | null>(null);
  // PLZ-Wechsel: Strassen-Eingabe gehört zur alten PLZ — zurücksetzen.
  useEffect(() => { setStrasse(''); setNummer(''); setStatus(null); }, [plz]);
  useEffect(() => {
    let aktiv = true;
    if (strasse.trim() === '') { setStatus(null); return; }
    strasseAufloesen(plz, strasse, nummer)
      .then((erg) => {
        if (!aktiv) return;
        if (erg?.typ === 'gemeinde') {
          setStatus('aufgeloest');
          // wie ein Kachel-Klick — nur bei echter Änderung melden (Guard
          // gegen Render-Schleifen; onWahl-Identität wechselt je Render).
          if (erg.gemeinde !== gemeinde.trim() || erg.kanton !== kanton) {
            onWahl({ gemeinde: erg.gemeinde, kanton: erg.kanton });
          }
        } else {
          setStatus(erg ? 'nummer_noetig' : 'unbekannt');
        }
      })
      .catch(() => { if (aktiv) setStatus(null); });
    return () => { aktiv = false; };
    // gemeinde/kanton/onWahl bewusst nicht in den Deps: der Effect reagiert
    // nur auf die Adress-Eingabe; die Änderungs-Guards oben verhindern
    // Schleifen über die Eltern-Setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plz, strasse, nummer]);
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
      <div className="flex gap-2 items-end">
        <label className="block flex-1">
          <span className="text-xs text-ink-600">… oder Strasse eingeben — löst die Gemeinde automatisch (amtl. Gebäudeadressverzeichnis, offline)</span>
          <input
            className="lc-input w-full"
            value={strasse}
            onChange={(e) => setStrasse(e.target.value)}
            aria-label={`Strasse in PLZ ${plz} — löst die Gemeinde automatisch auf`}
          />
        </label>
        <label className="block w-20">
          <span className="text-xs text-ink-600">Nr.</span>
          <input className="lc-input w-full" value={nummer} onChange={(e) => setNummer(e.target.value)} aria-label="Hausnummer" />
        </label>
      </div>
      {status === 'aufgeloest' && (
        <p className="text-xs text-ink-500">Gemeinde über die Strasse aufgelöst — amtliches Gebäudeadressverzeichnis (swisstopo).</p>
      )}
      {status === 'nummer_noetig' && (
        <p className="text-xs text-warn-700">Diese Strasse verläuft über die Gemeindegrenze — Hausnummer angeben (oder oben die Gemeinde wählen).</p>
      )}
      {status === 'unbekannt' && (
        <p className="text-xs text-warn-700">Strasse in der PLZ {plz} im amtlichen Gebäudeadressverzeichnis nicht gefunden — Schreibweise prüfen oder oben die Gemeinde wählen.</p>
      )}
    </div>
  );
}
