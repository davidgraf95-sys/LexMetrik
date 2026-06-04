import { Link } from 'react-router-dom';
import { LexmetrikSiegel, LexmetrikWortmarke } from './Logo';

// Footer (Design-Doc 5.11): paper-Grund, obere Hairline, Wortmarke klein, Mono-Feinschrift.
export function Footer() {
  return (
    <footer className="border-t border-line bg-paper mt-16">
      <div className="max-w-content mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 no-underline" aria-label="Lexmetrik — Startseite">
          <LexmetrikSiegel size={24} />
          <LexmetrikWortmarke />
        </Link>
        <p className="lc-overline text-ink-400 normal-case sm:text-right" style={{ letterSpacing: '0.04em' }}>
          Lexmetrik · Orientierungsrechner · keine Rechtsberatung · läuft vollständig im Browser
        </p>
      </div>
    </footer>
  );
}
