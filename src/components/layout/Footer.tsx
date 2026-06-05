import { Link } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';

// Footer (ausgebaut): dreispaltig — Marke + Kurzbeschrieb, Navigation,
// Hinweise; darunter Mono-Feinschriftzeile. Paper-Grund, obere Hairline.

const NAVIGATION = [
  { to: '/', label: 'Free — Rechner & Vorlagen' },
  { to: '/pro', label: 'Pro — vollständiger Katalog' },
  { to: '/?modus=vorlagen', label: 'Vorlagen' },
  { to: '/methodik', label: 'Methodik' },
  { to: '/ueber', label: 'Über LexMetrik' },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper mt-16">
      <div className="max-w-content mx-auto px-5 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr] gap-x-12 gap-y-8">
        {/* Marke */}
        <div className="space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 no-underline" aria-label="LexMetrik — Startseite">
            <LexMetrikSiegel size={26} />
            <LexMetrikWortmarke />
          </Link>
          <p className="text-body-s text-ink-500 leading-relaxed max-w-[34ch]">
            Schweizer Recht: berechnen und erstellen — nach festen Regeln,
            Schritt für Schritt nachvollziehbar, jede Norm direkt verlinkt.
          </p>
        </div>

        {/* Navigation */}
        <nav aria-label="Footer-Navigation" className="space-y-2">
          <p className="lc-overline mb-3">Navigation</p>
          {NAVIGATION.map((n) => (
            <Link key={n.label} to={n.to}
              className="block text-body-s text-ink-600 hover:text-brass-700 no-underline transition-colors">
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
          <p className="lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>
            © 2026 LexMetrik
          </p>
          <p className="lc-overline text-ink-500 normal-case sm:text-right" style={{ letterSpacing: '0.04em' }}>
            Orientierungsrechner · keine Rechtsberatung · läuft vollständig im Browser
          </p>
        </div>
      </div>
    </footer>
  );
}
