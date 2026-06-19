import { Link } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { HeaderSuche } from './HeaderSuche';
import { SprachUmschalter } from '../SprachUmschalter';

// ─── Top-Streifen der App-Shell (Build-Plan App-Shell, Phase 3) ─────────────
//
// NUR Werkzeuge, KEINE Navigationsziele (die liegen in der Seitenleiste):
// Logo/Wortmarke · globale Katalog-Suche · Sprachumschalter. Auf Mobil zusätzlich
// der ☰-Schalter, der die Seitenleisten-Schublade öffnet (onMenu, von Shell).
export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header
      className="sticky top-0 z-20 border-b border-line"
      style={{ background: 'color-mix(in srgb, var(--paper) 96%, transparent)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
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
          <span aria-hidden className="text-[1.1rem] leading-none">☰</span>
        </button>

        <Link to="/" className="inline-flex items-center gap-2 no-underline shrink-0" aria-label="LexMetrik – Startseite">
          <LexMetrikSiegel size={30} />
          {/* Wortmarke ab sm — auf schmalen Schirmen trägt die Suche die Mitte. */}
          <LexMetrikWortmarke className="hidden sm:block text-[1.35rem]" />
        </Link>

        <div className="flex-1 min-w-0 max-w-xl">
          <HeaderSuche />
        </div>

        <div className="shrink-0">
          <SprachUmschalter />
        </div>
      </div>
    </header>
  );
}
