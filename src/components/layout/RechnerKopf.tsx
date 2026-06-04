import { Link } from 'react-router-dom';
import type { Calculator } from '../../lib/calculators';
import { fedlexLinkFuerArtikel } from '../../lib/fedlex';
import { sansAmp } from '../typografie';

// Gemeinsamer Rechner-Kopf (Vorlage Abschnitt 4): Zurück-Pfeil, Breadcrumb,
// Overline, H1, Einleitung, Chips.
export function RechnerKopf({ calc }: { calc: Calculator }) {
  return (
    <div className="space-y-3 mb-8">
      {/* Sichtbarer Rückweg zur Rechner-Übersicht (Startseite) */}
      <Link to="/" className="inline-flex items-center gap-2 no-underline text-body-s font-medium text-brass-700 hover:text-brass-600">
        <span aria-hidden className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-line bg-surface">←</span>
        Zurück zur Übersicht
      </Link>
      <nav className="lc-overline text-ink-400 normal-case" style={{ letterSpacing: '0.04em' }}>
        <Link to="/rechner" className="no-underline text-ink-400 hover:text-ink-600">Rechner</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-500">{calc.titel}</span>
      </nav>
      <p className="lc-overline">{calc.kategorie}</p>
      <h1 className="text-h1 font-display font-semibold text-ink-900">{sansAmp(calc.titel)}</h1>
      <p className="text-body-l text-ink-600 max-w-reading">{calc.kurzbeschrieb}</p>
      <div className="flex flex-wrap gap-1.5">
        {/* Norm-Chips mit Fedlex-Direktlink (Spannen/ff. → führender Artikel) */}
        {calc.normen.map((n) => {
          const url = fedlexLinkFuerArtikel(n);
          return url ? (
            <a key={n} href={url} target="_blank" rel="noopener noreferrer"
              className="lc-chip no-underline hover:text-brass-700" title={`${n} auf Fedlex öffnen`}>
              {n}
            </a>
          ) : (
            <span key={n} className="lc-chip">{n}</span>
          );
        })}
      </div>
    </div>
  );
}
