import { parseISO, isSameDay, isWithinInterval } from 'date-fns';
import type { Kanton } from '../types/legal';
import { stillstandsperiodeFuer, istArbeitsfreierTag } from '../data/zpoFeiertage';

// Grafische Fristen-Antwort: Monatsraster mit durchgehendem Fristband und
// runden Markern für Ereignis / Fristbeginn / Fristende.

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

type Props = {
  ereignisISO: string;
  aQuoISO: string;
  adQuemISO: string;
  kanton: Kanton;
  stillstandAktiv: boolean;
  feiertage?: boolean;                 // Sa/So/Feiertage abschwächen (default true)
  labels?: { ereignis: string; aquo: string; adquem: string };
};

function monatKey(d: Date) { return d.getFullYear() * 12 + d.getMonth(); }

type BandStatus = 'frist' | 'still' | null;

export function FristenKalender({ ereignisISO, aQuoISO, adQuemISO, kanton, stillstandAktiv, feiertage = true, labels }: Props) {
  const L = labels ?? { ereignis: 'Ereignistag', aquo: 'Fristbeginn', adquem: 'Fristende' };
  const ereignis = parseISO(ereignisISO);
  const aQuo = parseISO(aQuoISO);
  const adQuem = parseISO(adQuemISO);

  // Nur die Schlüssel-Monate zeigen (Ereignis / Fristbeginn / Fristende), dedupliziert.
  const keys = Array.from(new Set([monatKey(ereignis), monatKey(aQuo), monatKey(adQuem)])).sort((a, b) => a - b);
  const monate = keys.map((k) => new Date(Math.floor(k / 12), k % 12, 1));
  const luecken = keys.length > 1 && keys.some((k, i) => i > 0 && k - keys[i - 1] > 1);

  const fristStart = aQuo < adQuem ? aQuo : adQuem;
  const fristEnde = aQuo < adQuem ? adQuem : aQuo;

  // Band-Ebene: laufende Frist (Messing) bzw. Gerichtsstillstand (Warn)
  const bandStatus = (d: Date): BandStatus => {
    if (stillstandAktiv && stillstandsperiodeFuer(d) !== null) return 'still';
    if (isWithinInterval(d, { start: fristStart, end: fristEnde })) return 'frist';
    return null;
  };

  return (
    <div className="lc-card p-5 lc-reveal">
      <p className="lc-overline mb-3">Kalender</p>
      <div className="flex flex-wrap gap-x-8 gap-y-5">
        {monate.map((monat) => {
          const jahr = monat.getFullYear();
          const m = monat.getMonth();
          const anzahl = new Date(jahr, m + 1, 0).getDate();
          const offset = (new Date(jahr, m, 1).getDay() + 6) % 7; // Mo-first
          const zellen: (Date | null)[] = [...Array(offset).fill(null), ...Array.from({ length: anzahl }, (_, i) => new Date(jahr, m, i + 1))];
          return (
            <div key={`${jahr}-${m}`} className="w-[15.5rem]">
              {/* Monat als gravierte Anzeige: Overline + Mono-Jahr */}
              <p className="lc-overline text-ink-600 mb-2">{MONATE[m]} <span className="num text-brass-700">{jahr}</span></p>
              <div className="grid grid-cols-7 gap-x-0 gap-y-0.5 text-center">
                {WTAGE.map((w) => <div key={w} className="lc-overline text-ink-400 py-1" style={{ fontSize: '0.6rem' }}>{w}</div>)}
                {zellen.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const isEreignis = isSameDay(d, ereignis);
                  const isAQuo = isSameDay(d, aQuo);
                  const isAdQuem = isSameDay(d, adQuem);
                  const frei = feiertage && istArbeitsfreierTag(d, kanton);
                  const band = bandStatus(d);

                  // Bandenden abrunden: am Wochen-/Monatsrand und an Statuswechseln
                  const col = i % 7;
                  const vortag = new Date(jahr, m, d.getDate() - 1);
                  const folgetag = new Date(jahr, m, d.getDate() + 1);
                  const rundL = col === 0 || d.getDate() === 1 || bandStatus(vortag) !== band;
                  const rundR = col === 6 || d.getDate() === anzahl || bandStatus(folgetag) !== band;

                  // Marker-Ebene: runde Schlüsseltage über dem Band
                  let marker = frei ? 'text-ink-300' : 'text-ink-700';
                  let title = frei ? 'arbeitsfrei (Sa/So/Feiertag)' : '';
                  if (isAdQuem) { marker = 'bg-sage-500 text-paper font-semibold rounded-full'; title = L.adquem; }
                  else if (isAQuo) { marker = 'bg-brass-500 text-ink-900 font-semibold rounded-full'; title = L.aquo; }
                  else if (isEreignis) { marker = 'border-2 border-ink-900 text-ink-900 font-semibold rounded-full bg-paper-raised'; title = L.ereignis; }
                  else if (band === 'still') { marker = 'text-warn-700'; title = 'Gerichtsstillstand'; }

                  return (
                    <div key={i} title={title} className="relative h-9 flex items-center justify-center">
                      {band && (
                        <span aria-hidden className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-7 ${
                          band === 'still' ? 'bg-warn-bg' : 'bg-brass-100'
                        } ${rundL ? 'rounded-l-full' : ''} ${rundR ? 'rounded-r-full' : ''}`} />
                      )}
                      <span className={`num relative w-8 h-8 flex items-center justify-center text-body-s ${marker}`}>
                        {d.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {luecken && <p className="text-body-s text-ink-400 mt-3 italic">Dazwischenliegende Monate sind nicht dargestellt.</p>}

      {/* Legende */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-line text-body-s text-ink-600">
        {ereignisISO !== aQuoISO && <Legende kreis="border-2 border-ink-900 bg-paper-raised" label={L.ereignis} />}
        <Legende kreis="bg-brass-500" label={L.aquo} />
        <Legende kreis="bg-sage-500" label={L.adquem} />
        <Legende band="bg-brass-100" label="läuft" />
        {stillstandAktiv && <Legende band="bg-warn-bg" label="Gerichtsstillstand" />}
        {feiertage && <Legende muted label="arbeitsfrei (Sa/So/Feiertag)" />}
      </div>
    </div>
  );
}

function Legende({ kreis, band, label, muted }: { kreis?: string; band?: string; label: string; muted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {kreis && <span className={`inline-block w-3.5 h-3.5 rounded-full ${kreis}`} />}
      {band && <span className={`inline-block w-5 h-3 rounded-full ${band}`} />}
      {muted && <span className="text-[10px] text-ink-300 leading-none font-medium">Sa</span>}
      {label}
    </span>
  );
}
