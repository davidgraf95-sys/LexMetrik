import { Link, useLocation } from 'react-router-dom';
import { LexmetrikSiegel, LexmetrikWortmarke } from './Logo';
import { StufenSchalter } from '../StufenSchalter';

// Header neu (zweizeilig, Instrumenten-Look):
// 1. Feinschrift-Leiste — Mono-Overline mit Einordnung links und Pflichthinweis
//    rechts (immer sichtbar, nicht mehr nur ab md).
// 2. Hauptzeile — Wortmarke links, Stufenwahl (Basis ↔ Fachpersonen) exakt
//    zentriert als primäre Navigation, sekundäre Links (Methodik, Über) rechts.
const NAV = [
  { to: '/methodik', label: 'Methodik', match: (p: string) => p === '/methodik' },
  { to: '/ueber', label: 'Über', match: (p: string) => p === '/ueber' },
];

export function Header() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-20 border-b border-line"
      style={{ background: 'color-mix(in srgb, var(--paper) 92%, transparent)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      {/* Feinschrift-Leiste */}
      <div className="border-b border-line" style={{ background: 'color-mix(in srgb, var(--paper-sunken) 55%, transparent)' }}>
        <div className="max-w-content mx-auto px-5 sm:px-6 h-7 flex items-center justify-between gap-4">
          <p className="lc-overline text-ink-400 hidden sm:block truncate">Schweizer Recht · feste Rechenregeln statt Schätzung</p>
          <p className="lc-overline text-ink-400 truncate">Orientierungsrechner — keine Rechtsberatung</p>
        </div>
      </div>

      {/* Hauptzeile: Grid hält die Stufenwahl exakt mittig */}
      <div className="max-w-content mx-auto px-5 sm:px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Link to="/" className="inline-flex items-center gap-2 no-underline justify-self-start" aria-label="Lexmetrik — Startseite">
          <LexmetrikSiegel size={30} />
          <LexmetrikWortmarke className="text-[1.35rem] hidden min-[420px]:block" />
        </Link>

        <StufenSchalter />

        <nav className="justify-self-end flex items-center gap-1 sm:gap-2">
          {NAV.map((n) => {
            const aktiv = n.match(pathname);
            return (
              <Link key={n.to} to={n.to}
                className={`relative px-2.5 sm:px-3 py-2 text-body-s font-medium no-underline transition-colors ${
                  aktiv ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900'
                }`}>
                {n.label}
                {/* Aktives Item: Messskala als Unterstrich (Designsystem §5) */}
                {aktiv && <span className="scale-rule scale-rule-sm absolute left-2 right-2 -bottom-0.5" aria-hidden />}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
