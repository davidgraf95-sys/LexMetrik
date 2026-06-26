import { KantonWappen } from './KantonWappen';
import type { Herkunft } from '../lib/tabGruppen';

// Schweizerkreuz (Bund): gemeinfreies nationales Hoheitszeichen als Asset
// (public/wappen/CH.svg) — gleiches Muster wie die Kantonswappen (kein Hex in der
// Komponente, §13.1). Reine Darstellung.
function SchweizKreuz({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <img src="/wappen/CH.svg" alt="" aria-hidden loading="lazy" width={32} height={32} draggable={false}
      className={`${className} object-contain shrink-0 select-none`} />
  );
}

// Welt-Piktogramm (International): Globus im Linien-Gravur-Stil des Designsystems
// (Strichstärke 1.5, currentColor — wie Icon.tsx). Reine Darstellung.
function WeltIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`${className} shrink-0 select-none`} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18 M12 3c2.6 2.6 2.6 15.4 0 18 M12 3c-2.6 2.6-2.6 15.4 0 18" />
    </svg>
  );
}

// Herkunfts-Icon eines Gesetz-Reiters (Auftrag David 26.6.2026): Bund =
// Schweizerkreuz, Kanton = Kantonswappen, International = Welt-Piktogramm.
export function HerkunftIcon({ herkunft, kanton, className = 'h-4 w-4' }: {
  herkunft: Herkunft; kanton?: string | null; className?: string;
}) {
  if (herkunft === 'kanton' && kanton) return <KantonWappen kanton={kanton} className={className} dekorativ />;
  if (herkunft === 'international') return <WeltIcon className={className} />;
  return <SchweizKreuz className={className} />;
}
