import { Link, useLocation } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { SprachUmschalter } from '../SprachUmschalter';

// Header (Iteration 5, FAHRPLAN-EINE-HAUPTSEITE E2): ruhiges ZWEI-ZONEN-
// Layout – Logo links, Aktionscluster rechts (Sprache · Methodik), Mitte
// bewusst leer. «Über» wandert ans Seitenende (Footer-Navigation, Entscheid
// 5.6.2026) – der Header trägt nur noch, was beim Arbeiten gebraucht wird.
// Der Pro-Button samt Pseudo-Login ist mit der Aufhebung der Free/Pro-
// Zweiteilung entfallen (Auftrag David 7.6.2026); Methodik ist seither auch
// mobil sichtbar (vorher trug der Pro-Button die mobile Navigation allein).
const NAV = [
  { to: '/methodik', label: 'Methodik', match: (p: string) => p === '/methodik' },
];

export function Header() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-20 border-b border-line"
      style={{ background: 'color-mix(in srgb, var(--paper) 96%, transparent)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      {/* Utility-Bar (schlank): nur der Pflichthinweis rechts – der Claim
          steht genau einmal im Hero. Auf Mobile ausgeblendet. */}
      <div className="hidden sm:block border-b border-line" style={{ background: 'color-mix(in srgb, var(--paper-sunken) 55%, transparent)' }}>
        <div className="max-w-content mx-auto px-5 sm:px-6 h-7 flex items-center justify-end">
          <p className="lc-overline text-ink-500 truncate">Orientierung – keine Rechtsberatung</p>
        </div>
      </div>

      {/* Hauptzeile: Logo links · Aktionscluster rechts · Mitte leer */}
      <div className="max-w-content mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 no-underline shrink-0" aria-label="LexMetrik – Startseite">
          <LexMetrikSiegel size={30} />
          {/* Wortmarke auch mobil: Erstbesucher sollen den Namen im Header
              sehen (Design-Review 6.6.2026). */}
          <LexMetrikWortmarke className="text-[1.35rem]" />
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sprache (en/fr/it «in Bearbeitung», DE-Fallback) */}
          <SprachUmschalter />
          {NAV.map((n) => {
            const aktiv = n.match(pathname);
            return (
              <Link key={n.to} to={n.to}
                className={`relative px-2.5 sm:px-3 py-2 text-body-s font-medium no-underline transition-colors ${
                  aktiv ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900'
                }`}>
                {n.label}
                {/* Aktives Item: Messing-Balken als Unterstrich (Designsystem §5) */}
                {aktiv && <span className="scale-rule scale-rule-sm absolute left-2 right-2 -bottom-0.5" aria-hidden />}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
