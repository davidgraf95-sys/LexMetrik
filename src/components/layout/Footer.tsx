import { Link } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { HERO_TITEL, SITE_KURZFORM } from '../../lib/seo';

// Footer (ausgebaut): dreispaltig – Marke + Kurzbeschrieb, Navigation,
// Hinweise; darunter Mono-Feinschriftzeile. Paper-Grund, obere Hairline.

const NAVIGATION = [
  // Free/Pro-Zweiteilung aufgehoben (FAHRPLAN-EINE-HAUPTSEITE; Bug-Check
  // 7.6.2026 M-2: die alten zwei Einträge zeigten auf dieselbe Seite).
  // W2·10-UI-NAV/N0a: der eine «Rechner & Vorlagen»-Eintrag zeigte auf «/»
  // (Startseite), nicht auf die Übersichten, die das Label verspricht — die tote
  // Verbindung ist zu zwei ehrlichen Zielen aufgelöst (/rechner · /vorlagen).
  { to: '/rechner', label: 'Rechner' },
  { to: '/vorlagen', label: 'Vorlagen' },
  { to: '/methodik', label: 'Methodik' },
  { to: '/ueber', label: 'Über LexMetrik' },
  { to: '/kontakt', label: 'Kontakt' },
  { to: '/datenschutz', label: 'Datenschutzerklärung' },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper mt-16">
      <div className="max-w-content mx-auto px-5 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr] gap-x-12 gap-y-8">
        {/* Marke */}
        <div className="space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 no-underline" aria-label="LexMetrik – Startseite">
            <LexMetrikSiegel size={26} />
            <LexMetrikWortmarke />
          </Link>
          {/* Marken-Kurzbeschrieb aus der I2-SSoT (seo.ts, §5) — Value Proposition
              + Methodik-Kurzform statt einer zweitgepflegten Marketing-Zeile. */}
          <p className="text-body-s text-ink-500 leading-relaxed max-w-[34ch]">
            {HERO_TITEL}. {SITE_KURZFORM}
          </p>
        </div>

        {/* Navigation */}
        <nav aria-label="Footer-Navigation" className="space-y-2">
          <p className="lc-overline mb-3">Navigation</p>
          {NAVIGATION.map((n) => (
            <Link key={n.label} to={n.to}
              className="flex items-center min-h-11 text-body-s text-ink-600 hover:text-brass-700 no-underline transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Hinweise */}
        <div className="space-y-2">
          <p className="lc-overline mb-3">Hinweise</p>
          <p className="text-body-s text-ink-500 leading-relaxed">
            Orientierung, keine Rechtsberatung. Ergebnisse und Entwürfe sind im
            Einzelfall fachlich zu prüfen.
          </p>
          <p className="text-body-s text-ink-500 leading-relaxed">
            Normverweise führen auf die amtliche Sammlung:{' '}
            <a href="https://www.fedlex.admin.ch" target="_blank" rel="noopener noreferrer"
              className="text-brass-700 hover:text-brass-600 no-underline">fedlex.admin.ch</a>
          </p>
          <p className="text-body-s text-ink-500 leading-relaxed">
            Ihre Eingaben verlassen den Browser nicht.
          </p>
        </div>
      </div>

      {/* Feinschriftzeile */}
      <div className="border-t border-line">
        <div className="max-w-content mx-auto px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="lc-fineprint">© 2026 LexMetrik</p>
          <p className="lc-fineprint sm:text-right">
            Orientierungsrechner · keine Rechtsberatung · läuft vollständig im Browser
          </p>
        </div>
      </div>
    </footer>
  );
}
