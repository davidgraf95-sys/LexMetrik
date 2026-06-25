// LexMetrik-Bildmarke (Designsystem §6): das Siegel verbindet die beiden Hälften
// der Identität — «Recht» (gestempeltes §, gezeichnet als Pfad, also schrift-
// unabhängig und auch bei 16 px scharf) und «Metrik» (eine präzise graduierte
// Messkante mit einer Haupt-Teilung in der Mitte und einem Messing-Messpunkt, der
// die gemessene Stelle markiert). Tinte-Grund, Messing-Schnittkante oben rechts.
// Wortmarke zweiton: «Lex» Tinte, «Metrik» Messing-700 (kontraststark).

export function LexMetrikSiegel({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      {/* Stempelkörper */}
      <rect x="3" y="3" width="42" height="42" rx="10" fill="var(--ink-900)" />
      {/* Geschliffene Messing-Schnittkante (oben rechts) — Präzisions-Anmutung. */}
      <path d="M14 3 H35 A10 10 0 0 1 45 13" fill="none"
        stroke="var(--brass-500)" strokeWidth="1.6" strokeLinecap="round" />

      {/* §-Glyphe als Pfad gezeichnet (zwei gespiegelte Haken, von der typischen
          §-Diagonale gekreuzt) — unabhängig von geladenen Schriften, geometrisch
          sauber und auch bei 16 px noch eindeutig als Paragraph lesbar. */}
      <path
        d="M28 17.8c0-2.6-1.8-4.3-4-4.3-2.2 0-3.7 1.4-3.7 3.2 0 1.5 1.1 2.5 3.3 3.6
           M20 30.2c0 2.6 1.8 4.3 4 4.3 2.2 0 3.7-1.4 3.7-3.2 0-1.5-1.1-2.5-3.3-3.6
           M20.6 16 27.4 32"
        fill="none" stroke="var(--paper)" strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Messkante: feine graduierte Skala mit einer höheren Haupt-Teilung in der
          Mitte; darüber ein Messing-Messpunkt — «Metrik» trifft das Recht. */}
      <g stroke="var(--brass-300)" strokeWidth="1" strokeLinecap="round">
        <line x1="13" y1="39.5" x2="13" y2="41" />
        <line x1="17" y1="39" x2="17" y2="41" />
        <line x1="21" y1="39.5" x2="21" y2="41" />
        <line x1="24" y1="37.8" x2="24" y2="41.2" stroke="var(--brass-500)" strokeWidth="1.4" />
        <line x1="27" y1="39.5" x2="27" y2="41" />
        <line x1="31" y1="39" x2="31" y2="41" />
        <line x1="35" y1="39.5" x2="35" y2="41" />
      </g>
      <circle cx="24" cy="35.4" r="1.35" fill="var(--brass-500)" />
    </svg>
  );
}

export function LexMetrikWortmarke({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-semibold tracking-[.01em] ${className}`}>
      <span className="text-ink-900">Lex</span>
      <span className="text-brass-700">Metrik</span>
    </span>
  );
}
