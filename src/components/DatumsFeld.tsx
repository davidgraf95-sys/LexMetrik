import { useEffect, useRef, useState } from 'react';
import { format, isValid, parse, parseISO } from 'date-fns';

// Eigenes Datumsfeld im Lexmetrik-Look: Texteingabe (TT.MM.JJJJ) plus
// aufklappbarer Kalender — ersetzt den nativen Browser-Datepicker.
// Wert bleibt ISO (yyyy-MM-dd), kompatibel zu <input type="date">.

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

type Props = {
  value: string;                      // ISO yyyy-MM-dd oder ''
  onChange: (iso: string) => void;
  className?: string;                 // Klassen des Eingabefelds
  wrapperClassName?: string;          // Breite/Layout des Felds (z. B. 'w-44')
  'aria-label'?: string;
};

function isoZuAnzeige(iso: string): string {
  const d = parseISO(iso);
  return isValid(d) ? format(d, 'dd.MM.yyyy') : '';
}

function gleicherTag(a: Date, b: Date | null): boolean {
  return !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function DatumsFeld({ value, onChange, className = 'lc-input', wrapperClassName = '', 'aria-label': ariaLabel }: Props) {
  const [offen, setOffen] = useState(false);
  const [text, setText] = useState(() => (value ? isoZuAnzeige(value) : ''));
  const [monat, setMonat] = useState(() => {
    const d = value ? parseISO(value) : new Date();
    return isValid(d) ? new Date(d.getFullYear(), d.getMonth(), 1) : new Date();
  });
  const wrapRef = useRef<HTMLDivElement>(null);

  // Externer Wert hat Vorrang (auch nach Auswahl im Kalender) —
  // Sync während des Renderns statt im Effect (React-Pattern «adjusting state»).
  const [letzterWert, setLetzterWert] = useState(value);
  if (value !== letzterWert) {
    setLetzterWert(value);
    setText(value ? isoZuAnzeige(value) : '');
  }

  // Schliessen bei Klick ausserhalb / Escape
  useEffect(() => {
    if (!offen) return;
    const klick = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOffen(false);
    };
    const taste = (e: KeyboardEvent) => { if (e.key === 'Escape') setOffen(false); };
    document.addEventListener('pointerdown', klick);
    document.addEventListener('keydown', taste);
    return () => {
      document.removeEventListener('pointerdown', klick);
      document.removeEventListener('keydown', taste);
    };
  }, [offen]);

  const oeffnen = () => {
    const d = value ? parseISO(value) : new Date();
    setMonat(isValid(d) ? new Date(d.getFullYear(), d.getMonth(), 1) : new Date());
    setOffen(true);
  };

  // Tippen: erst bei vollständigem, gültigem Datum emittieren
  const tippen = (s: string) => {
    setText(s);
    if (!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(s.trim())) return;
    const d = parse(s.trim(), 'd.M.yyyy', new Date());
    if (isValid(d)) onChange(format(d, 'yyyy-MM-dd'));
  };

  // Verlassen: leeres Feld löscht den Wert, ungültiger Text springt zurück
  const verlassen = () => {
    if (text.trim() === '') { if (value) onChange(''); return; }
    setText(value ? isoZuAnzeige(value) : '');
  };

  const waehlen = (d: Date) => { onChange(format(d, 'yyyy-MM-dd')); setOffen(false); };
  const blaettern = (deltaMonate: number) =>
    setMonat((m) => new Date(m.getFullYear(), m.getMonth() + deltaMonate, 1));

  // Monatsraster (Mo-first)
  const jahr = monat.getFullYear();
  const m = monat.getMonth();
  const anzahl = new Date(jahr, m + 1, 0).getDate();
  const offset = (new Date(jahr, m, 1).getDay() + 6) % 7;
  const zellen: (Date | null)[] = [
    ...(Array(offset).fill(null) as null[]),
    ...Array.from({ length: anzahl }, (_, i) => new Date(jahr, m, i + 1)),
  ];
  const gewaehlt = value && isValid(parseISO(value)) ? parseISO(value) : null;
  const heute = new Date();

  const navBtn = 'inline-flex items-center justify-center w-7 h-7 rounded-md text-brass-700 hover:bg-brass-100 transition-colors';

  return (
    <div ref={wrapRef} className={`relative ${wrapperClassName}`}>
      <input
        type="text" inputMode="numeric" placeholder="TT.MM.JJJJ"
        value={text} onChange={(e) => tippen(e.target.value)} onBlur={verlassen}
        className={`${className} pr-11`} aria-label={ariaLabel}
      />
      <button
        type="button" onClick={() => (offen ? setOffen(false) : oeffnen())}
        aria-label="Kalender öffnen" aria-expanded={offen}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-md text-brass-700 hover:bg-brass-100 transition-colors"
      >
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 6h14v14H5zM5 10h14M9 4v4M15 4v4" />
        </svg>
      </button>

      {offen && (
        <div className="absolute z-50 top-full left-0 mt-1.5 w-[17.5rem] bg-surface-raised border border-line rounded-lg shadow-lg p-3 lc-reveal">
          {/* Kopf: Jahr-/Monatsblättern, Monat als Ablese-Anzeige */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex">
              <button type="button" onClick={() => blaettern(-12)} aria-label="Ein Jahr zurück" className={navBtn}>«</button>
              <button type="button" onClick={() => blaettern(-1)} aria-label="Ein Monat zurück" className={navBtn}>‹</button>
            </div>
            <p className="text-body-s font-semibold text-ink-900">
              {MONATE[m]} <span className="num text-ink-600">{jahr}</span>
            </p>
            <div className="flex">
              <button type="button" onClick={() => blaettern(1)} aria-label="Ein Monat vor" className={navBtn}>›</button>
              <button type="button" onClick={() => blaettern(12)} aria-label="Ein Jahr vor" className={navBtn}>»</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WTAGE.map((w) => (
              <div key={w} className="lc-overline text-ink-500 py-1" style={{ fontSize: '0.6rem' }}>{w}</div>
            ))}
            {zellen.map((d, i) => {
              if (!d) return <div key={i} />;
              const istGewaehlt = gleicherTag(d, gewaehlt);
              const istHeute = gleicherTag(d, heute);
              return (
                <button
                  key={i} type="button" onClick={() => waehlen(d)}
                  aria-label={format(d, 'dd.MM.yyyy')} aria-pressed={istGewaehlt}
                  className={`num h-8 flex items-center justify-center rounded-md text-body-s transition-colors ${
                    istGewaehlt
                      ? 'bg-brass-500 text-ink-900 font-semibold'
                      : 'text-ink-700 hover:bg-brass-100'
                  }`}
                  style={!istGewaehlt && istHeute ? { boxShadow: 'inset 0 0 0 1px var(--brass-500)' } : undefined}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end mt-2 pt-2 border-t border-line">
            <button type="button" onClick={() => waehlen(new Date())}
              className="text-body-s font-medium text-brass-700 hover:text-brass-600 px-2 py-1">
              Heute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
