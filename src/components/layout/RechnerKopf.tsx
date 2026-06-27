import { Link } from 'react-router-dom';
import type { Calculator } from '../../lib/calculators';
import { sansAmp } from '../typografie';
import { NormChip } from '../vorlagen/ui';

// Gemeinsamer Rechner-Kopf (Vorlage Abschnitt 4): Zurück-Pfeil, Breadcrumb,
// Overline, H1, Einleitung, Chips.
// Overrides (Fix 6.6.2026, Befund David): Rechner mit Binnen-Navigation
// (Zuständigkeit: Rechtswege Zivil/SchKG/Straf) zeigen sonst immer die
// ZPO-Chips der Registry — Kategorie/Beschrieb/Normen sind deshalb pro
// gewähltem Rechtsweg überschreibbar (reine Anzeige, §3).
export function RechnerKopf({ calc, titelOverride, kategorieOverride, kurzbeschriebOverride, normenOverride }: {
  calc: Calculator;
  titelOverride?: string;
  kategorieOverride?: string;
  kurzbeschriebOverride?: string;
  normenOverride?: string[];
}) {
  const titel = titelOverride ?? calc.titel;
  const kategorie = kategorieOverride ?? calc.kategorie;
  const kurzbeschrieb = kurzbeschriebOverride ?? calc.kurzbeschrieb;
  const normen = normenOverride ?? calc.normen;
  return (
    <div className="space-y-3 mb-8">
      {/* EINE Navigationszeile statt zwei (Design-Review 6.6.2026): der
          sichtbare Rückweg (Pfeil → Startseite) und die Breadcrumb
          (Katalog / Titel) teilen sich eine Zeile — gleiche Ziele, halber Platz. */}
      <nav className="flex items-center gap-3 min-w-0">
        <Link to="/" className="inline-flex items-center gap-2 no-underline text-body-s font-medium text-brass-700 hover:text-brass-600 shrink-0">
          <span aria-hidden className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-line bg-surface">←</span>
          Übersicht
        </Link>
        <span aria-hidden className="h-4 w-px bg-line-strong shrink-0" />
        <span className="lc-overline lc-overline-soft text-ink-500 truncate">
          <Link to="/" className="no-underline text-ink-500 hover:text-ink-600">Katalog</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-500">{titel}</span>
        </span>
      </nav>
      <p className="lc-overline">{kategorie}</p>
      <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900">{sansAmp(titel)}</h1>
      <p className="text-body-l text-ink-600 max-w-reading">{kurzbeschrieb}</p>
      <div className="flex flex-wrap gap-1.5">
        {/* Norm-Chips mit Fedlex-Direktlink + Volltext-Popover (Spannen/ff. →
            führender Artikel; NormChip leitet URL/Snapshot aus dem Artikel ab). */}
        {normen.map((n) => (
          <NormChip key={n} artikel={n} title={`${n} auf Fedlex öffnen`} />
        ))}
      </div>
    </div>
  );
}
