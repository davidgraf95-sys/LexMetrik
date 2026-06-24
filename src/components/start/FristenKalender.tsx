import { useMemo } from 'react';
import { istArbeitsfreierTag } from '../../data/zpoFeiertage';
import type { Kanton } from '../../types/legal';

// ─── Fristen-Kalender im Schnellrechner (#7, Auftrag David) ─────────────────
//
// REINE Visualisierung (§3): zeigt das Fristende des Eingabe-Formulars (links)
// als Monatskalender — Ereignistag, (sofern bekannt) erster mitzählender Tag und
// Fristende markiert, arbeitsfreie Tage schattiert. KEINE eigene Rechnung; die
// Stichtage kommen als `FristMarkierung` von der EinfacheFristForm. Funktioniert
// für ALLE Ferien-/Stillstand-Regimes (jede Engine liefert ein ISO-Enddatum), nicht
// nur «keine Ferien» (Auftrag David: Kalender immer ersichtlich).

/** Vom Formular gelieferte Stichtage (regimeneutral). */
export interface FristMarkierung {
  startISO: string;              // Ereignistag (zählt nicht)
  endeISO: string;               // Fristende (massgebend, regime-korrekt)
  fristbeginnISO?: string;       // erster mitzählender Tag (nur «keine Ferien»)
  verschiebeGruende?: string[];  // Verschiebung (nur «keine Ferien»)
  hinweis?: string;              // z.B. «Stillstand (Art. 145 ZPO) berücksichtigt»
}

const WOCHENTAGE_KURZ = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WOCHENTAGE_LANG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONATSNAMEN = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const pad = (n: number) => String(n).padStart(2, '0');
const isoVon = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDe = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}.${m}.${y}`; };
const wochentagDe = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return WOCHENTAGE_LANG[new Date(y, m - 1, d).getDay()]; };

/** Zellen eines Monats, montagsbündig (führende Leerzellen = null). */
function monatsZellen(jahr: number, monat0: number): (Date | null)[] {
  const tageImMonat = new Date(jahr, monat0 + 1, 0).getDate();
  const fuehrend = (new Date(jahr, monat0, 1).getDay() + 6) % 7; // Mo = 0
  const zellen: (Date | null)[] = Array.from({ length: fuehrend }, () => null);
  for (let d = 1; d <= tageImMonat; d++) zellen.push(new Date(jahr, monat0, d));
  return zellen;
}

export function FristenKalender({ markierung, kanton }: {
  markierung: FristMarkierung | null;
  kanton: Kanton;
}) {
  // Angezeigter Monat = Monat des Fristendes (der relevante Stichtag).
  const zellen = useMemo(() => {
    if (!markierung) return null;
    const [y, m] = markierung.endeISO.split('-').map(Number);
    return { jahr: y, monat0: m - 1, zellen: monatsZellen(y, m - 1) };
  }, [markierung]);

  return (
    <div className="space-y-3">
      {!markierung || !zellen ? (
        <p className="text-body-s text-ink-500 py-6 text-center">
          Datum und Frist links eingeben – der Kalender markiert dann Ereignis und Fristende.
        </p>
      ) : (
        <div className="space-y-2.5" aria-live="polite">
          <div className="lc-tile lc-akzent-brass flex items-baseline justify-between gap-3 flex-wrap">
            <span className="text-xs text-ink-500">Fristende ({wochentagDe(markierung.endeISO)})</span>
            <span className="num text-body-l font-semibold text-ink-900">{fmtDe(markierung.endeISO)}</span>
          </div>

          <div>
            <p className="lc-overline text-ink-500 mb-1.5">{MONATSNAMEN[zellen.monat0]} {zellen.jahr}</p>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {WOCHENTAGE_KURZ.map((w) => <span key={w} className="text-[0.65rem] font-medium text-ink-500 pb-0.5">{w}</span>)}
              {zellen.zellen.map((d, i) => {
                if (!d) return <span key={`l${i}`} aria-hidden />;
                const iso = isoVon(d);
                const istEreignis = iso === markierung.startISO;
                const istBeginn = iso === markierung.fristbeginnISO;
                const istEnde = iso === markierung.endeISO;
                const frei = istArbeitsfreierTag(d, kanton);
                const klasse = istEnde
                  ? 'bg-brass-600 text-white font-semibold'
                  : istEreignis
                    ? 'bg-brass-100 text-brass-800 font-medium ring-1 ring-brass-400'
                    : istBeginn
                      ? 'ring-1 ring-brass-300 text-ink-700'
                      : frei
                        ? 'text-ink-500 bg-surface-sunken/40'
                        : 'text-ink-700';
                const titel = istEnde ? 'Fristende' : istEreignis ? 'Ereignistag (zählt nicht)' : istBeginn ? 'erster mitzählender Tag' : frei ? 'arbeitsfreier Tag' : undefined;
                return (
                  <span key={iso} title={titel}
                    className={`num text-xs leading-none py-1.5 rounded text-center tabular-nums ${klasse}`}>
                    {d.getDate()}
                  </span>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.65rem] text-ink-500">
              <span className="inline-flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-brass-600" /> Fristende</span>
              <span className="inline-flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-brass-100 ring-1 ring-brass-400" /> Ereignis</span>
              <span className="inline-flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-surface-sunken/60" /> arbeitsfrei</span>
            </div>
          </div>

          {markierung.hinweis && <p className="text-xs text-ink-500">{markierung.hinweis}</p>}
          {markierung.verschiebeGruende && markierung.verschiebeGruende.length > 0 && (
            <p className="text-xs text-ink-500">Verschoben: {markierung.verschiebeGruende.join(' · ')}</p>
          )}
        </div>
      )}
    </div>
  );
}
