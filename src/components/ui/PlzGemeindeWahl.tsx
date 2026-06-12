import { useEffect, useState } from 'react';
import { SelectionGrid, type SelectionItem } from './SelectionGrid';
import { hauptTreffer, type PlzTreffer } from '../../data/plz/plzAufloesung';
import { plzImStrassenIndex, strasseAufloesen } from '../../data/plz/strassenAufloesung';
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

export function PlzGemeindeWahl({ plz, treffer, gemeinde, kanton, onWahl, kantonFest = '' }: {
  plz: string;
  treffer: PlzTreffer[];
  /** Aktueller Feldinhalt – die passende Kachel wird als aktiv markiert
      (exakter Abgleich mit dem amtlichen Namen; Getipptes ohne Match → keine). */
  gemeinde: string;
  kanton: Kanton | '';
  onWahl: (wahl: { gemeinde: string; kanton: Kanton }) => void;
  /** Kantons-feste Masken (z. B. Schlichtungsgesuch übergibt den gewählten
   *  Kanton): löst die Strasse eine Gemeinde AUSSERHALB dieses Kantons auf,
   *  wird sie offengelegt statt übernommen (Bug-Check 12.6.2026 — die
   *  Eltern-Maske verwirft den Kanton, die Erfolgsmeldung wäre irreführend
   *  und der Auto-Adressat verschwände kommentarlos). */
  kantonFest?: Kanton | '';
}) {
  // Eingabe PLZ-geschlüsselt: wechselt die PLZ, gilt die getippte Strasse
  // nicht mehr — abgeleitet leer, ohne Reset-Effect (Lint: kein synchrones
  // setState im Effect). Status ebenso geschlüsselt, damit nie der Befund
  // einer früheren Eingabe angezeigt wird.
  const [eingabe, setEingabe] = useState({ plz, strasse: '', nummer: '' });
  const strasse = eingabe.plz === plz ? eingabe.strasse : '';
  const nummer = eingabe.plz === plz ? eingabe.nummer : '';
  const [statusRoh, setStatusRoh] = useState<{ schluessel: string; wert: 'aufgeloest' | 'nummer_noetig' | 'unbekannt' | 'ausserhalb'; info?: string } | null>(null);
  const schluessel = `${plz}|${strasse.trim()}|${nummer.trim()}`;
  const status = strasse.trim() !== '' && statusRoh?.schluessel === schluessel ? statusRoh.wert : null;
  // Quellen-Versatz (Bug-Check 12.6.2026): PLZ ohne Strassen-Index (im
  // neueren Gebäudeadressverzeichnis eindeutig, z. B. 1296/6958/8589) —
  // dort wäre das Strassenfeld nie auflösbar; gar nicht erst anbieten.
  const [indexDa, setIndexDa] = useState<{ plz: string; da: boolean } | null>(null);
  useEffect(() => {
    let aktiv = true;
    plzImStrassenIndex(plz)
      .then((da) => { if (aktiv) setIndexDa({ plz, da }); })
      .catch(() => { if (aktiv) setIndexDa(null); });
    return () => { aktiv = false; };
  }, [plz]);
  const strassenFeldDa = indexDa !== null && indexDa.plz === plz && indexDa.da;
  useEffect(() => {
    if (strasse.trim() === '') return;
    let aktiv = true;
    strasseAufloesen(plz, strasse, nummer)
      .then((erg) => {
        if (!aktiv) return;
        if (erg?.typ === 'gemeinde') {
          // Kantons-feste Maske: kantonsfremde Auflösung offenlegen statt
          // übernehmen (die Kacheln sind dort bereits kantonsgefiltert).
          if (kantonFest !== '' && erg.kanton !== kantonFest) {
            setStatusRoh({ schluessel, wert: 'ausserhalb', info: `${erg.gemeinde} (${erg.kanton})` });
            return;
          }
          setStatusRoh({ schluessel, wert: 'aufgeloest' });
          // wie ein Kachel-Klick — nur bei echter Änderung melden (Guard
          // gegen Render-Schleifen; onWahl-Identität wechselt je Render).
          if (erg.gemeinde !== gemeinde.trim() || erg.kanton !== kanton) {
            onWahl({ gemeinde: erg.gemeinde, kanton: erg.kanton });
          }
        } else {
          setStatusRoh({ schluessel, wert: erg ? 'nummer_noetig' : 'unbekannt' });
        }
      })
      .catch(() => { if (aktiv) setStatusRoh(null); });
    return () => { aktiv = false; };
    // gemeinde/kanton/onWahl bewusst nicht in den Deps: der Effect reagiert
    // nur auf die Adress-Eingabe (schluessel deckt plz/strasse/nummer); die
    // Änderungs-Guards oben verhindern Schleifen über die Eltern-Setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schluessel, kantonFest]);
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
      {strassenFeldDa && (
        <>
          <div className="flex gap-2 items-end">
            <label className="block flex-1">
              <span className="text-xs text-ink-600">… oder Strasse eingeben — löst die Gemeinde automatisch (amtl. Gebäudeadressverzeichnis, offline)</span>
              <input
                className="lc-input w-full"
                value={strasse}
                onChange={(e) => setEingabe({ plz, strasse: e.target.value, nummer })}
                aria-label={`Strasse in PLZ ${plz} — löst die Gemeinde automatisch auf`}
              />
            </label>
            <label className="block w-20">
              <span className="text-xs text-ink-600">Nr.</span>
              <input className="lc-input w-full" value={nummer} onChange={(e) => setEingabe({ plz, strasse, nummer: e.target.value })} aria-label="Hausnummer" />
            </label>
          </div>
          {status === 'aufgeloest' && (
            <p className="text-xs text-ink-500">Gemeinde über die Strasse aufgelöst — amtliches Gebäudeadressverzeichnis (swisstopo).</p>
          )}
          {status === 'nummer_noetig' && (
            <p className="text-xs text-warn-700">{nummer.trim() !== ''
              ? 'Diese Hausnummer ist im amtlichen Bestand der Strasse nicht erfasst — Nummer prüfen oder oben die Gemeinde wählen.'
              : 'Diese Strasse verläuft über die Gemeindegrenze — Hausnummer angeben (oder oben die Gemeinde wählen).'}</p>
          )}
          {status === 'unbekannt' && (
            <p className="text-xs text-warn-700">Strasse in der PLZ {plz} im amtlichen Gebäudeadressverzeichnis nicht gefunden — Schreibweise prüfen oder oben die Gemeinde wählen.</p>
          )}
          {status === 'ausserhalb' && (
            <p className="text-xs text-warn-700">Die Strasse liegt in {statusRoh?.info} — diese Maske ist auf den Kanton {kantonFest} eingestellt; Kanton wechseln oder oben die Gemeinde wählen.</p>
          )}
        </>
      )}
    </div>
  );
}
