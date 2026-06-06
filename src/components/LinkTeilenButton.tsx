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
  const { pathname } = useLocation();
  const [kopiert, setKopiert] = useState(false);
  const teilen = () => {
    const q = query();
    navigate({ search: q }, { replace: true });
    try {
      void navigator.clipboard.writeText(`${location.origin}${pathname}${q}`);
      setKopiert(true); setTimeout(() => setKopiert(false), 1600);
    } catch { /* Clipboard nicht verfügbar */ }
  };
  return (
    <button type="button" className="lc-btn-ghost lc-btn-sm" onClick={teilen}>
      {kopiert ? 'Link kopiert ✓' : 'Link teilen'}
    </button>
  );
}
