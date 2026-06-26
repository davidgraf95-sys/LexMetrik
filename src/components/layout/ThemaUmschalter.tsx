import { useEffect } from 'react';
import { effektivesThema, systemThema, speichereThema, useThemaWahl, wendeThemaAn, type Thema, type ThemaWahl } from '../thema';

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
// Pristine-Zustand (noch keine ausdrückliche Wahl): zeitbasierter Standard
// (Auftrag David 19.6.2026, zeitThema). EHRLICH gelabelt als «Tageszeit», NICHT
// als «System» — sonst verspräche das Icon ein System-Verhalten, das hier (noch)
// nicht greift (§8 Ehrlichkeit: Anzeige = Verhalten).
const PRISTINE_META = { icon: '◐', label: 'Automatisch (Tageszeit)' };

export function ThemaUmschalter() {
  // Geteilter Store (synchron mit dem Einstellungen-Segment). null = noch keine
  // ausdrückliche Wahl → zeitbasierter Standard (effektivesThema), passend zum
  // Pre-React-Paint in main.tsx (kein Flash). Erst eine Wahl auf 'auto' aktiviert
  // das System-Verhalten samt Live-Listener.
  const wahl = useThemaWahl();

  useEffect(() => {
    // 'hell'/'dunkel' direkt; 'auto' folgt dem System (Live-Listener unten); ohne
    // Wahl der zeitbasierte Standard (effektivesThema — identisch zum Pre-React-
    // Paint in main.tsx, daher kein Flash). Anzeige unten ist darauf abgestimmt.
    const aufgeloest: Thema =
      wahl === 'hell' || wahl === 'dunkel' ? wahl
      : wahl === 'auto' ? systemThema()
      : effektivesThema();
    wendeThemaAn(aufgeloest);
    if (wahl !== 'auto') return; // nur die Wahl 'auto' reagiert live auf System-Wechsel
    let mql: MediaQueryList;
    try { mql = window.matchMedia('(prefers-color-scheme: dark)'); } catch { return; }
    const onChange = () => wendeThemaAn(systemThema());
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [wahl]);

  const anzeige: ThemaWahl = wahl ?? 'auto'; // Position im 3er-Zyklus
  const meta = wahl === null ? PRISTINE_META : META[anzeige];
  // speichereThema benachrichtigt den Store → useThemaWahl re-rendert (hier UND
  // im Einstellungen-Segment), der Effekt oben wendet das neue Thema an.
  const umschalten = () => speichereThema(NAECHSTE[anzeige]);

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
