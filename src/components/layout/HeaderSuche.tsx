import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

// Katalog-Suche im Top-Streifen: Auf /recherche ist die URL führend (?q=,
// teil-/lesezeichenfähig, Zurück-Taste; replace statt push — Tippen füllt
// keine History) und filtert das Register live. Auf allen anderen Seiten
// sammelt das Feld lokal und Enter führt zur Trefferliste auf «/».
// «/» fokussiert das Feld (Verhalten unverändert, neuer Ort: vormals Header).
//
// Die STARTSEITE «/» ist bewusst NICHT mehr aufKatalog (Überarbeitung): dort
// ist die prominente Universal-Suche die alleinige ?q=-Eingabe (sonst zwei
// Felder, die in denselben Parameter schreiben). Enter im Top-Feld führt von
// «/» wie von jeder anderen Seite zur Universal-Suche der Startseite.
export function HeaderSuche() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // Nur /recherche filtert live in der URL (?q=); auf allen anderen Seiten —
  // inkl. der Startseite — sammelt das Feld lokal und Enter führt nach «/».
  const aufKatalog = pathname === '/recherche';
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
    // Die Suche-Schnellaktion der Seitenleiste fokussiert dasselbe Feld (so
    // teilt sich die App EINE globale Sucheingabe, §5) — auch aus der mobilen
    // Schublade heraus, nachdem sie sich geschlossen hat.
    const fokus = () => {
      const el = feld.current;
      if (!el) return;
      el.focus(); el.select();
      el.scrollIntoView({ block: 'nearest', behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('lexmetrik:fokus-suche', fokus);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('lexmetrik:fokus-suche', fokus);
    };
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
