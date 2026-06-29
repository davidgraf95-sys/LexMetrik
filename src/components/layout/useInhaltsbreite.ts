import { useEffect, useState } from 'react';

// ─── Inhaltsbreite „kompakt / breit" (persistent) ──────────────────────────
//
// Reiner UI-Zustand der Darstellungsschicht (§3 — KEINE Rechtslogik): Wie breit
// die zentrale Inhaltsspalte laufen darf. `kompakt` ist die heutige schmale
// Lesespalte (`max-w-content`), `breit` nutzt den Platz auf grossen Schirmen
// (`max-w-screen-2xl`) — Vorstufe zum späteren Split-View (Strang B). Die Wahl
// wird in localStorage gespiegelt, damit sie über Sitzungen/Reloads bleibt.
//
// SSR/Prerender-sicher: Initialwert über typeof-window-Guard. Default `kompakt`
// = exakt heutiges Verhalten (Golden byte-gleich). Die App ersetzt beim Mount
// (createRoot render-then-replace) und hydratisiert nicht — der erste
// Client-Render darf direkt aus localStorage lesen, ohne Mismatch-Klasse.
//
// HINWEIS: Dies steuert nur die zentrale Inhaltsspalte. Die Lesespalte
// `max-w-reading` (Fliesstext) bleibt unberührt (§13.2) — sie wird NICHT breiter.

const BREITE_KEY = 'lexmetrik-inhaltsbreite';

export type Inhaltsbreite = 'kompakt' | 'breit';

function ladeBreite(): Inhaltsbreite {
  if (typeof window === 'undefined') return 'kompakt';
  // Lesen wie Schreiben in try/catch: getItem wirft SecurityError, wenn der
  // Speicher per Browser-Policy gesperrt ist (z. B. «alle Cookies blockieren»).
  // Ohne Fang würde der useState-Initialisierer werfen und die ganze App
  // weiss-bildschirmen — daher Fallback auf den Default.
  try {
    return window.localStorage.getItem(BREITE_KEY) === 'breit' ? 'breit' : 'kompakt';
  } catch { return 'kompakt'; }
}

export interface InhaltsbreiteLayout {
  breite: Inhaltsbreite;
  /** true ⇔ breite === 'breit' (Bequemlichkeit für die Klassenwahl). */
  breit: boolean;
  /** Setzt die Breite direkt — passend zum Segment-Schalter («setze auf DIESEN Wert»). */
  setBreite: (b: Inhaltsbreite) => void;
}

export function useInhaltsbreite(): InhaltsbreiteLayout {
  const [breite, setBreite] = useState(ladeBreite);

  useEffect(() => {
    try { window.localStorage.setItem(BREITE_KEY, breite); } catch { /* Speicher gesperrt — Zustand bleibt nur für die Sitzung */ }
  }, [breite]);

  return { breite, breit: breite === 'breit', setBreite };
}
