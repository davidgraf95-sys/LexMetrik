import { Link, useLocation } from 'react-router-dom';

// Segmented Control zum Wechsel zwischen Basis-Stufe (/) und Experten-Panel
// (/fachpersonen). Gleiche Anatomie wie der Status-Umschalter der Filterleiste.
const STUFEN = [
  { to: '/', label: 'Allgemeine Rechner' },
  { to: '/fachpersonen', label: 'Für Fachpersonen' },
];

export function StufenSchalter() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Stufe" className="inline-flex gap-1 p-1 bg-surface border border-line rounded-xl">
      {STUFEN.map((s) => {
        const aktiv = pathname === s.to;
        return (
          <Link key={s.to} to={s.to} aria-current={aktiv ? 'page' : undefined}
            className={`px-4 py-2 rounded-lg text-sm font-medium no-underline transition-all ${
              aktiv
                ? 'bg-surface-raised text-brass-700 shadow-sm border border-line'
                : 'text-ink-600 hover:text-ink-900'
            }`}>
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
