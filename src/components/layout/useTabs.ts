import { useEffect, useState } from 'react';
import { ladeTabs, TABS_EVENT, type TabEintrag } from '../../lib/tabs';

// Reaktiver Lese-Hook auf die offenen Reiter (Muster useSeitenleiste.ts).
// SSR-sicher: ladeTabs() fällt serverseitig auf [] zurück (typeof-window-Guard
// in localStorage-Zugriff). Synchronisiert sich über das TABS_EVENT (gleicher
// Browser-Tab, geschrieben von TabTracker/Schliess-Buttons) und das native
// `storage`-Event (anderer Browser-Tab). Reine Darstellung (§3).
export function useTabs(): TabEintrag[] {
  const [tabs, setTabs] = useState<TabEintrag[]>(ladeTabs);

  useEffect(() => {
    const sync = () => setTabs(ladeTabs());
    sync(); // nach Mount einmal abgleichen (falls sich vor dem Effect was änderte)
    window.addEventListener(TABS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(TABS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return tabs;
}
