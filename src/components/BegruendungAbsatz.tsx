import { useState } from 'react';

// ─── «Für die Rechtsschrift»-Absatz — geteilter Baustein (FAHRPLAN-PRAXIS 2.2) ─
// Zeigt den kopierfertigen Begründungs-Absatz (lib/begruendung.ts) und
// kopiert ihn mit einem Klick. Reine Darstellung (§3).

export function BegruendungAbsatz({ text }: { text: string }) {
  const [kopiert, setKopiert] = useState(false);
  if (!text.trim()) return null;
  const kopieren = () => {
    // «Kopiert ✓» erst NACH erfolgreichem Schreiben — eine abgewiesene
    // Clipboard-Berechtigung darf keinen Erfolg vortäuschen (Review-Befund
    // 6.6.2026: Promise-Rejection wurde vom try/catch nicht erfasst).
    try {
      navigator.clipboard.writeText(text).then(() => {
        setKopiert(true); setTimeout(() => setKopiert(false), 1600);
      }).catch(() => { /* Berechtigung verweigert/unsicherer Kontext */ });
    } catch { /* Clipboard-API nicht vorhanden */ }
  };
  return (
    <details className="lc-card p-4">
      <summary className="cursor-pointer text-body-s font-medium text-ink-700">
        Für die Rechtsschrift — kopierfertiger Begründungs-Absatz
      </summary>
      <p className="mt-3 text-body-s text-ink-900 leading-relaxed bg-paper-sunken rounded-md p-3 select-all">
        {text}
      </p>
      <button type="button" className="lc-btn-outline lc-btn-sm mt-3" onClick={kopieren}>
        {kopiert ? 'Kopiert ✓' : 'Absatz kopieren'}
      </button>
      <p className="text-xs text-ink-500 mt-2">
        Formuliert aus dem Rechenergebnis — vor Verwendung im Schriftsatz fachlich prüfen.
      </p>
    </details>
  );
}
