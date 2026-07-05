import { Link } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { HeaderSuche } from './HeaderSuche';
import { SprachUmschalter } from '../SprachUmschalter';
import { ThemaUmschalter } from './ThemaUmschalter';
import { ReiterUebersicht } from './ReiterUebersicht';
import type { Schriftskala } from './useSchriftskala';

// ─── Top-Streifen der App-Shell (Build-Plan App-Shell, Phase 3) ─────────────
//
// NUR Werkzeuge, KEINE Navigationsziele (die liegen in der Seitenleiste):
// Logo/Wortmarke · globale Katalog-Suche · Schriftgrösse · Sprachumschalter. Auf
// Mobil zusätzlich der ☰-Schalter, der die Seitenleisten-Schublade öffnet
// (onMenu, von Shell); auf Desktop ein Schalter, der die persistente
// Seitenleiste ein-/ausklappt.
export function Topbar({ onMenu, seitenleisteEingeklappt, onSeitenleisteUmschalten, schrift }: {
  onMenu: () => void;
  seitenleisteEingeklappt: boolean;
  onSeitenleisteUmschalten: () => void;
  /** Globale Schriftskala (A−/A+), R3 — ersetzt den früheren Breiten-Umschalter. */
  schrift: Schriftskala;
}) {
  return (
    <header
      className="sticky top-0 z-20 border-b border-line lc-glass"
    >
      <div className="px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-5">
        {/* Mobil: Schublade öffnen — auf Desktop trägt die persistente Leiste. */}
        <button
          type="button"
          className="lc-btn lc-btn-ghost lc-btn-sm lg:hidden shrink-0"
          aria-label="Navigation öffnen"
          aria-controls="seitenleisten-schublade"
          onClick={onMenu}
        >
          <span aria-hidden className="text-base leading-none">☰</span>
        </button>

        {/* Desktop: persistente Seitenleiste ein-/ausklappen. */}
        <button
          type="button"
          className="lc-btn lc-btn-ghost lc-btn-sm hidden lg:inline-flex shrink-0"
          aria-label={seitenleisteEingeklappt ? 'Seitenleiste einblenden' : 'Seitenleiste ausblenden'}
          aria-pressed={!seitenleisteEingeklappt}
          onClick={onSeitenleisteUmschalten}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <line x1="9" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="1.7" />
            {seitenleisteEingeklappt && <line x1="5.5" y1="9" x2="6.5" y2="9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
          </svg>
        </button>

        {/* Desktop: globale Schriftgrösse A−/A+ (R3 — ersetzt den Kompakt/Breit-
            Schalter). Skaliert die Wurzel-rem (useSchriftskala) → trifft alle
            Seiten; Wert persistent. Eigenständiger Name je Knopf (role="group"-
            Name wird von Screenreadern nicht zuverlässig vorgelesen); disabled an
            den Anschlägen (§13/F4); Tastatur + sichtbarer Fokus über die globale
            :focus-visible-Outline. Ab lg, mobil aus (knapper Topbar-Platz). */}
        <div role="group" aria-label="Schriftgrösse" className="hidden lg:inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5">
          <button
            type="button"
            aria-label="Schrift verkleinern"
            disabled={!schrift.kannKleiner}
            onClick={schrift.kleiner}
            className="rounded-md px-2.5 py-1 text-body-s font-medium text-ink-600 transition-colors hover:text-ink-900 disabled:pointer-events-none disabled:opacity-40"
          >
            A<span aria-hidden>−</span>
          </button>
          {/* Live-Wertansage des aktuellen Prozentwerts (WCAG 4.1.3), tabular für
              ruckelfreie Breite; w-12 hält die Breite stabil (Token, keine px). */}
          <span aria-live="polite" className="w-12 select-none text-center text-micro tabular-nums text-ink-500">{schrift.prozent} %</span>
          <button
            type="button"
            aria-label="Schrift vergrössern"
            disabled={!schrift.kannGroesser}
            onClick={schrift.groesser}
            className="rounded-md px-2.5 py-1 text-body-s font-medium text-ink-600 transition-colors hover:text-ink-900 disabled:pointer-events-none disabled:opacity-40"
          >
            A<span aria-hidden>+</span>
          </button>
        </div>

        {/* Logo nur unterhalb lg — ab lg trägt die Seitenleiste die Marke. */}
        <Link to="/" className="lg:hidden inline-flex items-center gap-2 no-underline shrink-0" aria-label="LexMetrik – Startseite">
          <LexMetrikSiegel size={30} />
          {/* Wortmarke ab sm — auf schmalen Schirmen trägt die Suche die Mitte. */}
          <LexMetrikWortmarke className="hidden sm:block text-h3" />
        </Link>

        <div className="flex-1 min-w-0 max-w-xl">
          <HeaderSuche />
        </div>

        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
          {/* A5 (David 5.7.2026): kein eigener Palette-Knopf mehr — die
              HeaderSuche trägt den Norm-Sprung selbst; ⌘K/Ctrl-K und «/»
              fokussieren ihr Feld (Hinweis-kbd sitzt im Feld). */}
          <ReiterUebersicht />
          <ThemaUmschalter />
          <SprachUmschalter />
        </div>
      </div>
    </header>
  );
}
