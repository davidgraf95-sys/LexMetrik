import { useEffect, useState } from 'react';
import { effektivesThema, gespeicherteWahl, systemThema, speichereThema, wendeThemaAn, type Thema, type ThemaWahl } from '../thema';

// Thema-Umschalter im Top-Streifen: 3er-Zyklus hell → dunkel → auto (Auftrag
// David). 'auto' folgt der System-Präferenz (prefers-color-scheme) und reagiert
// live auf Umschaltungen. SSR-sicher (createRoot, kein Hydration-Diff); der
// Effect WENDET nur an (kein setState im Effect-Body → react-hooks-konform).
const NAECHSTE: Record<ThemaWahl, ThemaWahl> = { hell: 'dunkel', dunkel: 'auto', auto: 'hell' };
const META: Record<ThemaWahl, { icon: string; label: string }> = {
  hell: { icon: '☀', label: 'Heller Modus' },
  dunkel: { icon: '☾', label: 'Dunkler Modus' },
  auto: { icon: '◐', label: 'Automatisch (System)' },
};

export function ThemaUmschalter() {
  // null = noch keine ausdrückliche Wahl → bisheriges Verhalten (effektivesThema,
  // d.h. zeitbasiert) bleibt erhalten, kein Flip beim Laden.
  const [wahl, setWahl] = useState<ThemaWahl | null>(gespeicherteWahl);

  useEffect(() => {
    const aufgeloest: Thema = wahl === null ? effektivesThema() : wahl === 'auto' ? systemThema() : wahl;
    wendeThemaAn(aufgeloest);
    if (wahl !== 'auto') return;
    let mql: MediaQueryList;
    try { mql = window.matchMedia('(prefers-color-scheme: dark)'); } catch { return; }
    const onChange = () => wendeThemaAn(systemThema());
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [wahl]);

  const anzeige: ThemaWahl = wahl ?? 'auto';
  const meta = META[anzeige];
  const umschalten = () => {
    const next = NAECHSTE[anzeige];
    setWahl(next);
    speichereThema(next);
  };

  return (
    <button
      type="button"
      onClick={umschalten}
      aria-label={`Farbschema: ${meta.label} — weiterschalten`}
      title={meta.label}
      className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-line bg-surface text-ink-600 hover:text-ink-900 hover:border-brass-400 transition-colors"
    >
      <span aria-hidden className="text-base leading-none">{meta.icon}</span>
    </button>
  );
}
