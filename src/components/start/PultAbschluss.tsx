import { useEffect, useRef, useState } from 'react';
import { KorpusStand } from '../ui/KorpusStand';
import { SheetRahmen } from '../ui/SheetRahmen';
import { useDialogFokus } from '../layout/useDialogFokus';
import { usePaneKontext } from '../layout/PaneKontext';
import type { StartModul } from '../../lib/startseiteModulTypen';
import type { StartPosten } from '../../lib/startseiteEinstellung';

// ─── Fuss des Pults + Blatt «Startseite anpassen» (W2·24-R10) ───────────────
//
// Referenzbild `abnahme/design-identitaet/pult-freigegeben.html`, Marke `.fuss`:
// links der Korpus-Stand, rechts der Textknopf «Startseite anpassen». Kein
// Kasten, kein Icon — ein Wort am Seitenende, das man findet, wenn man es sucht.
//
// DAS BLATT ist DASSELBE Bottom-Sheet, das Leser und Rechtsprechungs-Filter
// tragen (`ui/SheetRahmen`, F2-2) — ein Sheet-Muster im Haus, nicht zwei (§10).
// Die Overlay-Anatomie (Scrim, Fokusfang, Esc, Fokus-Rückgabe, stillgelegter
// Hintergrund) folgt Zeile für Zeile `rechtsprechung/FilterSheet`; sie gehört
// zum Aufrufer, nicht zum Rahmen.
//
// REIHENFOLGE PER PFEILEN, NICHT PER ZIEHEN (Vorgabe David 6.9.2026). Ein
// Drag-and-Drop bräuchte eine zweite, eigens gebaute Tastaturbedienung für
// dieselbe Ordnung — zwei Wege, ein Zustand (§5). Die Pfeile sind von Haus aus
// tastatur- und screenreader-bedienbar; am Rand der Liste sind sie deaktiviert
// (kein Umlauf, s. `lib/startseiteEinstellung.verschiebe`).
//
// «WERKSEINSTELLUNG» LÖSCHT den Speichereintrag, statt die heutige Vorgabe
// hineinzuschreiben — so folgt die Seite auch künftigen Änderungen an der
// Werkseinstellung (§5). Der Knopf steht nur da, wenn es etwas zurückzusetzen
// gibt (§6.7: ein Schalter ohne Wirkung ist eine Behauptung).
// Reine Darstellung (§3).

export function PultAbschluss({ module, posten, aufSchalten, aufVerschieben, aufZuruecksetzen, istWerk }: {
  module: readonly StartModul[];
  /** Die Anordnung in ANZEIGE-Reihenfolge (nicht Registry-Reihenfolge). */
  posten: readonly StartPosten[];
  aufSchalten: (id: string) => void;
  aufVerschieben: (id: string, richtung: -1 | 1) => void;
  aufZuruecksetzen: () => void;
  istWerk: boolean;
}) {
  const [offen, setOffen] = useState(false);
  const blattRef = useRef<HTMLDivElement>(null);
  const { imPane } = usePaneKontext();
  useDialogFokus(offen, blattRef, () => setOffen(false));

  // Hintergrund stilllegen, solange das Blatt offen ist — Teil des modalen
  // Versprechens, das `SheetRahmen` mit `aria-modal` abgibt. Im Pane gilt es
  // nicht (dort bleibt der Rest des Fensters bedienbar, `inPane`).
  useEffect(() => {
    if (!offen || imPane) return;
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = vorher; };
  }, [offen, imPane]);

  const titelVon = (id: string) => module.find((m) => m.id === id)?.titel ?? id;

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <KorpusStand />
        <button type="button" onClick={() => setOffen(true)}
          aria-expanded={offen} aria-haspopup="dialog"
          className="border-b border-rule-soft pb-0.5 font-sans text-xs text-ink-600 hover:border-ink-900 hover:text-ink-900">
          Startseite anpassen
        </button>
      </div>

      {offen && (
        <>
          {/* Scrim: Farbe und Deckung aus `.lc-scrim` (src/index.css) — ein
              `bg-ink-900/30` hellte im Dunkelmodus auf, statt abzudunkeln (F2-1). */}
          <div className="lc-scrim fixed inset-0 z-overlay" onClick={() => setOffen(false)} aria-hidden />
          <SheetRahmen sheetRef={blattRef} inPane={imPane} titel="Startseite anpassen"
            onSchliessen={() => setOffen(false)} daten="data-startseite-blatt"
            sockel={(
              <div className="flex items-center justify-between gap-3">
                {istWerk
                  ? <span className="font-sans text-xs text-ink-500">Werkseinstellung</span>
                  : (
                    <button type="button" onClick={aufZuruecksetzen}
                      className="border-b border-rule-soft pb-0.5 font-sans text-xs text-ink-600 hover:border-ink-900 hover:text-ink-900">
                      Werkseinstellung
                    </button>
                  )}
                <button type="button" onClick={() => setOffen(false)}
                  className="lc-chip h-11 justify-center px-4 font-medium text-brass-700 hover:border-brass-400">
                  Fertig
                </button>
              </div>
            )}>
            <p className="mb-3 font-sans text-xs leading-relaxed text-ink-500">
              Was auf der Startseite steht und in welcher Reihenfolge. Nur auf diesem Gerät gespeichert.
            </p>
            <ul>
              {posten.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 border-t border-rule-soft py-2">
                  <label className="flex min-w-0 flex-1 items-center gap-2.5 font-sans text-body-s text-ink-900">
                    <input type="checkbox" checked={p.an} onChange={() => aufSchalten(p.id)}
                      className="h-4 w-4 shrink-0 accent-brass-600" />
                    <span className="min-w-0">{titelVon(p.id)}</span>
                  </label>
                  <button type="button" onClick={() => aufVerschieben(p.id, -1)} disabled={i === 0}
                    aria-label={`${titelVon(p.id)} nach oben`}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-ink-600 hover:text-ink-900 disabled:opacity-40">
                    <span aria-hidden>↑</span>
                  </button>
                  <button type="button" onClick={() => aufVerschieben(p.id, 1)} disabled={i === posten.length - 1}
                    aria-label={`${titelVon(p.id)} nach unten`}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-ink-600 hover:text-ink-900 disabled:opacity-40">
                    <span aria-hidden>↓</span>
                  </button>
                </li>
              ))}
            </ul>
          </SheetRahmen>
        </>
      )}
    </>
  );
}
