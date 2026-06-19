import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

// Katalog-Suche im Top-Streifen: Auf der Hauptseite ist die URL führend (?q=,
// teil-/lesezeichenfähig, Zurück-Taste; replace statt push — Tippen füllt
// keine History) und filtert das Register live. Auf allen anderen Seiten
// sammelt das Feld lokal und Enter führt zur Trefferliste auf «/».
// «/» fokussiert das Feld (Verhalten unverändert, neuer Ort: vormals Header).
export function HeaderSuche() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // «/» und die Recherche-Seite filtern live in der URL (?q=); auf allen
  // anderen Seiten sammelt das Feld lokal und Enter führt zur Trefferliste auf «/».
  const aufKatalog = pathname === '/' || pathname === '/recherche';
  const q = aufKatalog ? (searchParams.get('q') ?? '') : '';
  const [wert, setWert] = useState(q);
  // URL führt: ändert sich ?q= (Zurück-Taste, Permalink, Zurücksetzen im
  // Register), folgt das Feld — als Render-Phase-Abgleich statt Effect
  // (React-Muster «adjusting state when props change», Lint-Befund).
  const [letztesQ, setLetztesQ] = useState(q);
  if (q !== letztesQ) { setLetztesQ(q); setWert(q); }

  const feld = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const ziel = e.target as HTMLElement | null;
      if (ziel && (/^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName) || ziel.isContentEditable)) return;
      if (feld.current) { e.preventDefault(); feld.current.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const setze = (v: string) => {
    setWert(v);
    if (!aufKatalog) return;
    const p = new URLSearchParams(searchParams);
    if (v) p.set('q', v); else p.delete('q');
    setSearchParams(p, { replace: true });
  };
  const abschicken = () => {
    const s = wert.trim();
    if (!aufKatalog && s) navigate(`/?q=${encodeURIComponent(s)}`);
  };

  return (
    <input
      ref={feld}
      type="search"
      value={wert}
      onChange={(e) => setze(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') abschicken(); }}
      placeholder="Suchen …  ( / )"
      className="lc-input h-9 py-0 text-body-s w-full"
      aria-label="Katalog durchsuchen"
      aria-keyshortcuts="/"
    />
  );
}
