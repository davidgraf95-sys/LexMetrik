import { Link } from 'react-router-dom';

// Footer (Design-Doc 5.11): paper-Grund, obere Hairline, Wortmarke klein, Mono-Feinschrift.
export function Footer() {
  return (
    <footer className="border-t border-line bg-paper mt-16">
      <div className="max-w-content mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 no-underline" aria-label="LegalCalc — Startseite">
          <span className="lc-seal" aria-hidden="true" style={{ width: '1.5rem', height: '1.5rem', fontSize: '0.95rem' }}>§</span>
          <span className="font-display font-semibold text-ink-900">LegalCalc</span>
        </Link>
        <p className="lc-overline text-ink-400 normal-case sm:text-right" style={{ letterSpacing: '0.04em' }}>
          LegalCalc · Orientierungsrechner · keine Rechtsberatung · clientseitig &amp; deterministisch
        </p>
      </div>
    </footer>
  );
}
