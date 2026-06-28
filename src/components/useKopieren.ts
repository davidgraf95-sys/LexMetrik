import { useState } from 'react';

// ─── Kopier-Hook (FAHRPLAN-BEGRUENDUNGS-ABSATZ B2-1) ────────────────────────
// Geteilte Copy-to-Clipboard-Mechanik: «Kopiert ✓» erst NACH erfolgreichem
// Schreiben. Eine abgewiesene Clipboard-Berechtigung (Promise-Rejection) oder
// eine fehlende API darf keinen Erfolg vortäuschen (Review-Befund 6.6.2026).
export function useKopieren(text: string, dauerMs = 1600): { kopiert: boolean; kopieren: () => void } {
  const [kopiert, setKopiert] = useState(false);
  const kopieren = () => {
    try {
      navigator.clipboard.writeText(text).then(() => {
        setKopiert(true);
        setTimeout(() => setKopiert(false), dauerMs);
      }).catch(() => { /* Berechtigung verweigert/unsicherer Kontext */ });
    } catch { /* Clipboard-API nicht vorhanden */ }
  };
  return { kopiert, kopieren };
}
