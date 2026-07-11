import type { ZuletztTyp } from '../../lib/zuletztVerwendet';

// ─── Typ-Icon der Verlauf-Einträge (UI-NAV O1) ──────────────────────────────
//
// Kleines, dekoratives Icon je Inhalts-Typ (aria-hidden — der Titel trägt die
// Bedeutung). currentColor, keine Ad-hoc-Farbe (§13/F7). Ein Glyph pro Typ hält
// die Liste ruhig und macht die Rubrik ohne Farbe unterscheidbar (§13/F2).
export function VerlaufIcon({ typ, className }: { typ: ZuletztTyp; className?: string }) {
  const gemein = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, className } as const;
  switch (typ) {
    case 'rechner':
      return (
        <svg {...gemein}>
          <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
          <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <line x1="8" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="12" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'vorlage':
      return (
        <svg {...gemein}>
          <path d="M7 3h7l4 4v14H7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <line x1="10" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <line x1="10" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'gesetz':
      return (
        <svg {...gemein}>
          <path d="M4 5c2.5-1 5.5-1 8 0v14c-2.5-1-5.5-1-8 0z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M20 5c-2.5-1-5.5-1-8 0v14c2.5-1 5.5-1 8 0z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case 'entscheid':
      return (
        <svg {...gemein}>
          <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M12 6l-5 2 5 2 5-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M4 14a3 2.4 0 006 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M14 14a3 2.4 0 006 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'material':
      return (
        <svg {...gemein}>
          <path d="M5 4h9l5 5v11H5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M14 4v5h5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...gemein}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
          <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <line x1="12" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );
  }
}
