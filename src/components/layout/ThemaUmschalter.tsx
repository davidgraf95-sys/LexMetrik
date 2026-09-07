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
// Pristine-Zustand (noch keine ausdrückliche Wahl): folgt seit dem Entscheid
// David 8.8.2026 (LM-174/B5-N1) der System-Präferenz — verhaltensgleich mit der
// Wahl 'auto', darum auch gleich beschriftet (§8: Anzeige = Verhalten; der
// frühere zeitbasierte Default vom 19.6.2026 ist revidiert).
const PRISTINE_META = { icon: '◐', label: 'Automatisch (System)' };

export function ThemaUmschalter() {
  // Geteilter Store (synchron mit dem Einstellungen-Segment). null = noch keine
  // ausdrückliche Wahl → zeitbasierter Standard (effektivesThema), passend zum
  // Pre-React-Paint in main.tsx (kein Flash). Erst eine Wahl auf 'auto' aktiviert
  // das System-Verhalten samt Live-Listener.
  const wahl = useThemaWahl();

  useEffect(() => {
    // 'hell'/'dunkel' direkt; 'auto' UND der Pristine-Zustand folgen dem System
    // (effektivesThema — identisch zum Pre-React-Paint in main.tsx, daher kein
    // Flash; Entscheid David 8.8.2026, LM-174). Anzeige unten ist darauf abgestimmt.
    const aufgeloest: Thema =
      wahl === 'hell' || wahl === 'dunkel' ? wahl : effektivesThema();
    wendeThemaAn(aufgeloest);
    if (wahl !== 'auto' && wahl !== null) return; // 'auto' UND pristine reagieren live auf System-Wechsel
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
      /* GB-15 (W2·24): eine Knopf-Form für alle Griffe des Titelblatts
         (Herleitung an `layout/Topbar`, Rezept index.css §GB-15). */
      className="lc-topbar-griff"
    >
      <span aria-hidden className="lc-griff-glyph">{meta.icon}</span>
    </button>
  );
}
