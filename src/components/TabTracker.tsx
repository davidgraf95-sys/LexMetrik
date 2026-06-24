import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { merkeTab } from '../lib/tabs';
import { labelAusMeta } from '../lib/verlaufLabel';

// Unsichtbarer Tracker in App.tsx: öffnet für jede besuchte
// Inhalts-Route einen Reiter im Tab-Streifen (lexmetrik-tabs). Reines
// localStorage-Schreiben (§3). Die Startseite und die statischen Info-Seiten
// werden NICHT zu Reitern (Reiter sind für Engines/Gesetze/Vorlagen/Entscheide,
// nicht für Methodik/Über/Kontakt/Datenschutz).
const KEINE_REITER = new Set(['/', '/methodik', '/ueber', '/kontakt', '/datenschutz']);

export function TabTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (KEINE_REITER.has(pathname)) return;
    merkeTab(pathname, labelAusMeta(pathname) ?? undefined);
  }, [pathname]);
  return null;
}
