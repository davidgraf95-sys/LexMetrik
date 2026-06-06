import { Link } from 'react-router-dom';
import type { Calculator } from '../../lib/calculators';
import { fedlexLinkFuerArtikel } from '../../lib/fedlex';
import { sansAmp } from '../typografie';
import { useLocale, fedlexLokalisiert } from '../locale';

// Gemeinsamer Rechner-Kopf (Vorlage Abschnitt 4): Zurück-Pfeil, Breadcrumb,
// Overline, H1, Einleitung, Chips.
// Overrides (Fix 6.6.2026, Befund David): Rechner mit Binnen-Navigation
// (Zuständigkeit: Rechtswege Zivil/SchKG/Straf) zeigen sonst immer die
// ZPO-Chips der Registry — Kategorie/Beschrieb/Normen sind deshalb pro
// gewähltem Rechtsweg überschreibbar (reine Anzeige, §3).
export function RechnerKopf({ calc, kategorieOverride, kurzbeschriebOverride, normenOverride }: {
  calc: Calculator;
  kategorieOverride?: string;
  kurzbeschriebOverride?: string;
  normenOverride?: string[];
}) {
  const { locale } = useLocale();
  const kategorie = kategorieOverride ?? calc.kategorie;
  const kurzbeschrieb = kurzbeschriebOverride ?? calc.kurzbeschrieb;
  const normen = normenOverride ?? calc.normen;
  return (
    <div className="space-y-3 mb-8">
      {/* Sichtbarer Rückweg zur Rechner-Übersicht (Startseite) */}
      <Link to="/" className="inline-flex items-center gap-2 no-underline text-body-s font-medium text-brass-700 hover:text-brass-600">
        <span aria-hidden className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-line bg-surface">←</span>
        Zurück zur Übersicht
      </Link>
      <nav className="lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>
        <Link to="/pro" className="no-underline text-ink-500 hover:text-ink-600">Katalog</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-500">{calc.titel}</span>
      </nav>
      <p className="lc-overline">{kategorie}</p>
      <h1 className="text-h1 font-display font-semibold text-ink-900">{sansAmp(calc.titel)}</h1>
      <p className="text-body-l text-ink-600 max-w-reading">{kurzbeschrieb}</p>
      <div className="flex flex-wrap gap-1.5">
        {/* Norm-Chips mit Fedlex-Direktlink (Spannen/ff. → führender Artikel) */}
        {normen.map((n) => {
          const roh = fedlexLinkFuerArtikel(n);
          const url = roh ? fedlexLokalisiert(roh, locale) : null;
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
