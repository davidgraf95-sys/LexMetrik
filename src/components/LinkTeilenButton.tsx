import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ─── «Link teilen»-Button — geteilter Baustein (FAHRPLAN-PRAXIS 1.3) ────────
// Schreibt den kodierten Fall in die URL (replace, keine History-Flut) und
// kopiert den vollständigen Link in die Zwischenablage. Der Query-String
// kommt aus lib/permalink.ts (deterministisch, kein Tracking, rein lokal).

export function LinkTeilenButton({ query }: {
  /** Liefert den aktuellen Query-String («?a=…» oder ''), z. B. () => permalinkKodieren(SPEC, form). */
  query: () => string;
}) {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const [kopiert, setKopiert] = useState(false);
  const teilen = () => {
    const q = query();
    // Hash MITFÜHREN (Ultra-Review HOCH-1, 7.6.2026): Bei den Cluster-
    // Rechnern transportiert er die Tab-/Rechtsweg-Weiche (#kuendigung,
    // #schkg, #straf) — ohne ihn landete der Empfänger auf dem falschen
    // Teilrechner und sah die geteilten Parameter nie.
    navigate({ search: q, hash }, { replace: true });
    try {
      void navigator.clipboard.writeText(`${location.origin}${pathname}${q}${hash}`);
      setKopiert(true); setTimeout(() => setKopiert(false), 1600);
    } catch { /* Clipboard nicht verfügbar */ }
  };
  return (
    <button type="button" className="lc-btn-ghost lc-btn-sm" onClick={teilen}>
      {kopiert ? 'Link kopiert ✓' : 'Link teilen'}
    </button>
  );
}
