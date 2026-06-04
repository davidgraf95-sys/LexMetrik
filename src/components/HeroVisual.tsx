// Hero-Visual: graviertes Instrumenten-Zifferblatt aus der Markensprache —
// graduierter Kreisbogen (Messing), Haarlinien-Ringe, römische Sektions-
// Ziffern und das §-Siegel im Zentrum. Rein dekorativ (aria-hidden),
// deterministisch generiert, nur auf grossen Screens sichtbar.

const CX = 170, CY = 170;

function tick(winkelGrad: number, r1: number, r2: number) {
  const a = ((winkelGrad - 90) * Math.PI) / 180;
  return {
    x1: CX + r1 * Math.cos(a), y1: CY + r1 * Math.sin(a),
    x2: CX + r2 * Math.cos(a), y2: CY + r2 * Math.sin(a),
  };
}

// Volle Skala alle 7.5°, jeder 4. Strich länger; Messing-Segment oben rechts.
const TICKS = Array.from({ length: 48 }, (_, i) => {
  const grad = i * 7.5;
  const lang = i % 4 === 0;
  const akzent = grad >= 15 && grad <= 105; // graviertes Messing-Segment
  return { ...tick(grad, 150, lang ? 138 : 144), lang, akzent, grad };
});

export function HeroVisual({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 340" className={className} aria-hidden="true" role="presentation">
      {/* Ringe */}
      <circle cx={CX} cy={CY} r={150} fill="none" stroke="var(--line-strong)" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={118} fill="none" stroke="var(--line)" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={86} fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="2 5" />

      {/* Skala */}
      {TICKS.map((t) => (
        <line key={t.grad} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.akzent ? 'var(--brass-400)' : 'var(--brass-200)'}
          strokeWidth={t.lang ? 1.4 : 1} strokeLinecap="round" />
      ))}

      {/* Römische Sektions-Ziffern (I–IV) */}
      {([['I', 0], ['II', 90], ['III', 180], ['IV', 270]] as const).map(([z, g]) => {
        const a = ((g - 90) * Math.PI) / 180;
        return (
          <text key={z} x={CX + 103 * Math.cos(a)} y={CY + 103 * Math.sin(a) + 4}
            textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize="12"
            fill="var(--ink-300)">{z}</text>
        );
      })}

      {/* Zeiger auf das Messing-Segment */}
      <line {...tick(52, 0, 112)} stroke="var(--brass-500)" strokeWidth="1.5" strokeLinecap="round" />
      <circle {...(() => { const p = tick(52, 112, 112); return { cx: p.x1, cy: p.y1 }; })()} r="3.5"
        fill="var(--brass-500)" stroke="var(--paper)" strokeWidth="1.5" />
      <line {...tick(232, 0, 26)} stroke="var(--brass-300)" strokeWidth="1.5" strokeLinecap="round" />

      {/* §-Siegel im Zentrum (Geometrie der Bildmarke, skaliert) */}
      <g transform={`translate(${CX - 28}, ${CY - 28})`}>
        <rect width="56" height="56" rx="12" fill="var(--ink-900)" />
        <path d="M12 0 H44 A12 12 0 0 1 56 12" fill="none"
          stroke="var(--brass-500)" strokeWidth="1.5" strokeLinecap="round" />
        <text x="28" y="36" textAnchor="middle"
          fontFamily="Fraunces, Georgia, serif" fontSize="28" fontWeight="600"
          fill="var(--paper)">§</text>
      </g>
    </svg>
  );
}
