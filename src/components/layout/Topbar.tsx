import { Link } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { HeaderSuche } from './HeaderSuche';
import { SprachUmschalter } from '../SprachUmschalter';
import { ThemaUmschalter } from './ThemaUmschalter';
import { ReiterUebersicht } from './ReiterUebersicht';

// ─── Top-Streifen der App-Shell (Build-Plan App-Shell, Phase 3) ─────────────
//
// NUR Werkzeuge, KEINE Navigationsziele (die liegen in der Seitenleiste):
// Logo/Wortmarke · globale Katalog-Suche · Sprachumschalter. Auf Mobil zusätzlich
// der ☰-Schalter, der die Seitenleisten-Schublade öffnet (onMenu, von Shell);
// auf Desktop ein Schalter, der die persistente Seitenleiste ein-/ausklappt.
export function Topbar({ onMenu, seitenleisteEingeklappt, onSeitenleisteUmschalten, inhaltBreit, onInhaltsbreiteSetzen, zeigeInhaltsbreite = true }: {
  onMenu: () => void;
  seitenleisteEingeklappt: boolean;
  onSeitenleisteUmschalten: () => void;
  inhaltBreit: boolean;
  onInhaltsbreiteSetzen: (b: 'kompakt' | 'breit') => void;
  /** Im Split-View ausgeblendet: der Breiten-Schalter wäre dort wirkungslos. */
  zeigeInhaltsbreite?: boolean;
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

        {/* Desktop: Inhaltsspalte kompakt/breit schalten (Vorstufe Split-View,
            Strang A). Segmentierter Schalter — die aktive Wahl trägt
            aria-pressed; Tastatur + sichtbarer Fokus über die globale
            :focus-visible-Outline. Ab lg, mobil aus (dort gilt ohnehin die
            schmale Spalte). */}
        {zeigeInhaltsbreite && (
        <div role="group" aria-label="Inhaltsbreite" className="hidden lg:inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5">
          {([['Kompakt', 'kompakt'], ['Breit', 'breit']] as const).map(([label, wert]) => {
            const aktiv = inhaltBreit === (wert === 'breit');
            return (
              <button
                key={wert}
                type="button"
                // Eigenständiger Name je Knopf: der Name einer role="group" wird
                // von Screenreadern nicht zuverlässig vorgelesen (wie EntscheidFilter).
                aria-label={`Inhaltsbreite: ${label}`}
                aria-pressed={aktiv}
                onClick={() => onInhaltsbreiteSetzen(wert)}
                // Aktiv-Fill solides bg-brass-100 (das /NN-Alpha kompiliert mit
                // diesen var()-Farbtokens zu nichts → sichtbarer Zustand ginge
                // verloren). Gewählt-Zustand: Fill + dunklerer Text.
                // Gewählt: Fill + Ring (der Fill allein < 3:1 Nicht-Text-Kontrast,
                // §13/F2) + dunklerer Text. Ring ist layoutneutral (kein 1px-Sprung).
                className={`rounded-md px-2.5 py-1 text-body-s transition-colors ${aktiv ? 'bg-brass-100 text-ink-900 ring-1 ring-inset ring-brass-500' : 'text-ink-600 hover:text-ink-900'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
        )}

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
          <ReiterUebersicht />
          <ThemaUmschalter />
          <SprachUmschalter />
        </div>
      </div>
    </header>
  );
}
