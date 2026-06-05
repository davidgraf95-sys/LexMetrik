// LexMetrik-Bildmarke (Designsystem §6): gestempeltes §-Siegel mit feiner
// Messing-Schnittkante und graduiertem Bogen – das Siegel trifft die Messskala.
// Wortmarke zweiton: «Lex» Tinte, «metrik» Messing-700 (kontraststark).

export function LexMetrikSiegel({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label="LexMetrik" aria-hidden="true">
      <rect x="3" y="3" width="42" height="42" rx="9" fill="var(--ink-900)" />
      <path d="M12 3 H36 A9 9 0 0 1 45 12" fill="none"
        stroke="var(--brass-500)" strokeWidth="1.5" strokeLinecap="round" />
      <text x="24" y="29" textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif" fontSize="22" fontWeight="600"
        fill="var(--paper)">§</text>
      <g stroke="var(--brass-300)" strokeWidth="1">
        <line x1="16" y1="38" x2="16" y2="40" /><line x1="20" y1="38.5" x2="20" y2="40" />
        <line x1="24" y1="37.5" x2="24" y2="40.5" /><line x1="28" y1="38.5" x2="28" y2="40" />
        <line x1="32" y1="38" x2="32" y2="40" />
      </g>
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
