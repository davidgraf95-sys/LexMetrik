import { useEffect, useState } from 'react';
import { effektivesThema, speichereThema, wendeThemaAn, type Thema } from '../thema';

// Thema-Umschalter im Top-Streifen (Build-Plan: Theme-Toggle, jetzt mit Inhalt).
// SSR-sicher: erster Render IMMER 'hell' (= prerendertes Light-HTML, keine
// Hydration-Abweichung); im Effekt auf das effektive Thema (gespeichert/System)
// synchronisieren. Klick schaltet zwischen hell und dunkel und merkt die Wahl.
export function ThemaUmschalter() {
  // Lazy-Initializer (SSR-sicher: effektivesThema fällt serverseitig auf 'hell')
  // — gleiches Muster wie LocaleProvider; der Effect WENDET nur an (kein setState
  // im Effect, react-hooks/set-state-in-effect).
  const [thema, setThema] = useState<Thema>(effektivesThema);
  useEffect(() => { wendeThemaAn(thema); }, [thema]);

  const dunkel = thema === 'dunkel';
  const umschalten = () => {
    const next: Thema = dunkel ? 'hell' : 'dunkel';
    setThema(next);
    speichereThema(next);
  };

  return (
    <button
      type="button"
      onClick={umschalten}
      aria-label={dunkel ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'}
      aria-pressed={dunkel}
      title={dunkel ? 'Heller Modus' : 'Dunkler Modus'}
      className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-line bg-surface text-ink-600 hover:text-ink-900 hover:border-brass-400 transition-colors"
    >
      <span aria-hidden className="text-[1.05rem] leading-none">{dunkel ? '☀' : '☾'}</span>
    </button>
  );
}
