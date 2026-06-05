import { useEffect, useRef, useState } from 'react';
import { LOCALES, useLocale } from './locale';

// Sprachumschalter (Topbar, dezent): de aktiv; en/fr/it funktional, aber
// transparent als «in Bearbeitung» gekennzeichnet (gedämpfte Optik wie
// «In Vorbereitung» im Katalog). Keine maschinelle Übersetzung.

export function SprachUmschalter() {
  const { locale, setLocale } = useLocale();
  const [offen, setOffen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!offen) return;
    const klick = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOffen(false);
    };
    const taste = (e: KeyboardEvent) => { if (e.key === 'Escape') setOffen(false); };
    document.addEventListener('pointerdown', klick);
    document.addEventListener('keydown', taste);
    return () => {
      document.removeEventListener('pointerdown', klick);
      document.removeEventListener('keydown', taste);
    };
  }, [offen]);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOffen((o) => !o)}
        aria-haspopup="menu" aria-expanded={offen} aria-label="Sprache wählen"
        className="inline-flex items-center gap-1 h-9 px-2.5 rounded-lg border border-line bg-surface num text-xs text-ink-600 hover:text-ink-900 hover:border-brass-400 transition-colors uppercase">
        {locale}
        <span aria-hidden className={`text-ink-500 transition-transform ${offen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {offen && (
        <div role="menu" className="absolute right-0 top-full mt-1.5 w-56 bg-surface-raised border border-line rounded-lg shadow-lg p-1 z-30">
          {LOCALES.map((l) => {
            const aktiv = l.code === locale;
            return (
              <button key={l.code} type="button" role="menuitemradio" aria-checked={aktiv}
                onClick={() => { setLocale(l.code); setOffen(false); }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-left text-body-s transition-colors ${
                  aktiv ? 'bg-brass-100/70 text-ink-900 font-medium' : 'text-ink-700 hover:bg-brass-100/40'
                }`}>
                <span className={l.inBearbeitung ? 'text-ink-500' : ''}>
                  <span className="num uppercase text-xs mr-2">{l.code}</span>{l.label}
                </span>
                {l.inBearbeitung
                  ? <span className="lc-badge lc-badge-soft shrink-0">in Bearbeitung</span>
                  : aktiv && <span aria-hidden className="text-brass-700">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
