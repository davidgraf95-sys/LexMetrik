import { Link, useLocation } from 'react-router-dom';
import { LexmetrikSiegel, LexmetrikWortmarke } from './Logo';

// Header (Design-Doc 5.1): sticky, paper-Grund, untere Hairline, Wortmarke + Navigation.
const NAV = [
  { to: '/rechner', label: 'Rechner', match: (p: string) => p.startsWith('/rechner') },
  { to: '/fachpersonen', label: 'Fachpersonen', match: (p: string) => p === '/fachpersonen' },
  { to: '/methodik', label: 'Methodik', match: (p: string) => p === '/methodik' },
  { to: '/ueber', label: 'Über', match: (p: string) => p === '/ueber' },
];

export function Header() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-20 bg-paper backdrop-blur border-b border-line">
      <div className="max-w-content mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2 no-underline" aria-label="Lexmetrik — Startseite">
          <LexmetrikSiegel size={30} />
          <LexmetrikWortmarke className="text-[1.35rem]" />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV.map((n) => {
            const aktiv = n.match(pathname);
            return (
              <Link key={n.to} to={n.to}
                className={`relative px-3 py-2 text-body-s font-medium no-underline transition-colors ${
                  aktiv ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900'
                }`}>
                {n.label}
                {/* Aktives Item: Messskala als Unterstrich (Designsystem §5) */}
                {aktiv && <span className="scale-rule scale-rule-sm absolute left-2 right-2 -bottom-0.5" aria-hidden />}
              </Link>
            );
          })}
        </nav>
        <p className="hidden md:block lc-overline text-ink-400">Orientierungsrechner — keine Rechtsberatung</p>
      </div>
    </header>
  );
}
