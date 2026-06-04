import { Link, useLocation } from 'react-router-dom';

// Segmented Control zum Wechsel zwischen Basis-Stufe (/) und Experten-Panel
// (/fachpersonen). Sitzt zentral im Header; auf schmalen Screens kompakte Labels.
const STUFEN = [
  { to: '/', label: 'Allgemeine Rechner', kurz: 'Basis' },
  { to: '/fachpersonen', label: 'Für Fachpersonen', kurz: 'Fachpersonen' },
];

export function StufenSchalter() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Stufe" className="inline-flex gap-1 p-1 bg-surface border border-line rounded-xl">
      {STUFEN.map((s) => {
        const aktiv = pathname === s.to;
        return (
          <Link key={s.to} to={s.to} aria-current={aktiv ? 'page' : undefined}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium no-underline whitespace-nowrap transition-all ${
              aktiv
                ? 'bg-surface-raised text-brass-700 shadow-sm border border-line'
                : 'text-ink-600 hover:text-ink-900'
            }`}>
            <span className="sm:hidden">{s.kurz}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
