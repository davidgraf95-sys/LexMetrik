import { parseISO, isSameDay, isWithinInterval } from 'date-fns';
import type { Kanton } from '../types/legal';
import { stillstandsperiodeFuer, istArbeitsfreierTag } from '../data/zpoFeiertage';

// Grafische Fristen-Antwort: Monatsraster mit markierten Tagen.

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

type Props = {
  ereignisISO: string;
  aQuoISO: string;
  adQuemISO: string;
  kanton: Kanton;
  stillstandAktiv: boolean;
  feiertage?: boolean;                 // Sa/So/Feiertage schattieren (default true)
  labels?: { ereignis: string; aquo: string; adquem: string };
};

function monatKey(d: Date) { return d.getFullYear() * 12 + d.getMonth(); }

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

  return (
    <div className="lc-card p-5 lc-reveal">
      <p className="lc-overline mb-3">Kalender</p>
      <div className="flex flex-wrap gap-6">
        {monate.map((monat) => {
          const jahr = monat.getFullYear();
          const m = monat.getMonth();
          const anzahl = new Date(jahr, m + 1, 0).getDate();
          const offset = (new Date(jahr, m, 1).getDay() + 6) % 7; // Mo-first
          const zellen: (Date | null)[] = [...Array(offset).fill(null), ...Array.from({ length: anzahl }, (_, i) => new Date(jahr, m, i + 1))];
          return (
            <div key={`${jahr}-${m}`} className="w-[15.5rem]">
              <p className="text-body-s font-semibold text-ink-900 mb-2 font-display">{MONATE[m]} {jahr}</p>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {WTAGE.map((w) => <div key={w} className="lc-overline text-ink-400 py-1" style={{ fontSize: '0.6rem' }}>{w}</div>)}
                {zellen.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const isEreignis = isSameDay(d, ereignis);
                  const isAQuo = isSameDay(d, aQuo);
                  const isAdQuem = isSameDay(d, adQuem);
                  const inStillstand = stillstandAktiv && stillstandsperiodeFuer(d) !== null;
                  const frei = feiertage && istArbeitsfreierTag(d, kanton);
                  const inFrist = isWithinInterval(d, { start: fristStart, end: fristEnde });

                  let cls = 'text-ink-700';
                  let title = '';
                  if (isAdQuem) { cls = 'bg-sage-500 text-paper font-semibold'; title = L.adquem; }
                  else if (isAQuo) { cls = 'text-paper font-semibold'; title = L.aquo; }
                  else if (isEreignis) { cls = 'bg-ink-900 text-paper font-semibold'; title = L.ereignis; }
                  else if (inStillstand) { cls = 'bg-warn-bg text-warn-700'; title = 'Gerichtsstillstand'; }
                  else if (frei) { cls = 'text-ink-400'; title = 'arbeitsfrei (Sa/So/Feiertag)'; }

                  const style = isAQuo && !isAdQuem ? { background: 'var(--brass-500)' } : undefined;
                  const underline = inFrist && !isAQuo && !isAdQuem && !isEreignis && !inStillstand;

                  return (
                    <div key={i} title={title}
                      className={`num h-8 flex items-center justify-center rounded-md text-body-s ${cls} ${underline ? 'border-b-2 border-brass-200' : ''}`}
                      style={style}>
                      {d.getDate()}
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
        {ereignisISO !== aQuoISO && <Legende swatch="bg-ink-900" label={L.ereignis} />}
        <Legende style={{ background: 'var(--brass-500)' }} label={L.aquo} />
        <Legende swatch="bg-sage-500" label={L.adquem} />
        {stillstandAktiv && <Legende swatch="bg-warn-bg" label="Gerichtsstillstand" />}
        <Legende underline label="läuft" />
        {feiertage && <Legende muted label="arbeitsfrei (Sa/So/Feiertag)" />}
      </div>
    </div>
  );
}

function Legende({ swatch, style, label, underline, muted }: { swatch?: string; style?: React.CSSProperties; label: string; underline?: boolean; muted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-3.5 h-3.5 rounded ${swatch ?? ''} ${underline ? 'border-b-2 border-brass-200' : ''} ${muted ? 'text-ink-400' : ''}`}
        style={style ?? (!swatch && !underline ? { boxShadow: 'inset 0 0 0 1px var(--line)' } : undefined)}>
        {muted ? <span className="text-[10px] text-ink-400 leading-none">Sa</span> : ''}
      </span>
      {label}
    </span>
  );
}
