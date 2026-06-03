import { Link, NavLink } from 'react-router-dom';

// Header (Design-Doc 5.1): sticky, paper-Grund, untere Hairline, Wortmarke + Navigation.
const NAV = [
  { to: '/rechner', label: 'Rechner' },
  { to: '/methodik', label: 'Methodik' },
  { to: '/ueber', label: 'Über' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-paper backdrop-blur border-b border-line">
      <div className="max-w-content mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2" aria-label="LegalCalc — Startseite">
          <span className="lc-seal" aria-hidden="true">§</span>
          <span className="lc-word">LegalCalc</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-body-s font-medium no-underline transition-colors ${
                  isActive ? 'text-brass-700 bg-brass-100' : 'text-ink-600 hover:text-ink-900'
                }`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <p className="hidden md:block lc-overline text-ink-400">Orientierungsrechner — keine Rechtsberatung</p>
      </div>
    </header>
  );
}
