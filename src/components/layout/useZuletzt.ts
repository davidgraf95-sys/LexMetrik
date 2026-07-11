import { useEffect, useState } from 'react';
import { holeZuletzt, ZULETZT_EVENT, type ZuletztEintrag } from '../../lib/zuletztVerwendet';

// Reaktiver Lese-Hook auf den Verlauf (Muster useTabs.ts, UI-NAV O1). Reine
// Darstellung (§3): die Liste lebt in lib/zuletztVerwendet.ts (localStorage).
//
// §15.2: Der Initialstate ist auf den SERVER-Zustand gepinnt (leer — der
// Prerender-Node hat kein localStorage). Der echte localStorage-Stand wird erst
// NACH dem Mount per useEffect nachgezogen, damit der erste Client-Paint mit dem
// prerenderten DOM übereinstimmt (keine divergente Erst-Ausgabe). Synchronisiert
// sich danach über das ZULETZT_EVENT (gleicher Tab, vom Tracker/«leeren»
// geschrieben) und das native `storage`-Event (anderer Tab).
export function useZuletzt(): ZuletztEintrag[] {
  const [eintraege, setEintraege] = useState<ZuletztEintrag[]>([]);

  useEffect(() => {
    const sync = () => setEintraege(holeZuletzt());
    sync(); // nach Mount den echten Stand einlesen (§15.2: Abweichung nach Mount)
    window.addEventListener(ZULETZT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(ZULETZT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return eintraege;
}
