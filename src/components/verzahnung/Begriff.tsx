import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { GLOSSAR, type GlossarSchluessel } from '../../lib/verzahnung/glossar';

// ─── Begriff — Fachwort mit zugänglichem Erklär-Popover (§1.7) ───────────────
//
// Touch- UND tastaturtauglich: NICHT nur `title` (auf Touch tot), sondern ein
// echter <button> mit `aria-describedby`, Klick-/Enter-Toggle (Fokus liegt auf dem
// Button), Escape + Aussenklick schliessen. Erklärtext aus dem Glossar (§5). Reine
// Darstellung (§3). Nur existierende Tokens (§13). Wird von StatusBadge-Erklärungen
// und Gruppen-Overlines konsumiert.

export function Begriff({ schluessel, children, className = '' }: {
  schluessel: GlossarSchluessel;
  children?: ReactNode;
  className?: string;
}) {
  const eintrag = GLOSSAR[schluessel];
  const [offen, setOffen] = useState(false);
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);

  // Escape + Aussenklick schliessen — nur solange offen, nur im Browser (die
  // Listener greifen erst nach Mount; SSR/Prerender bleibt unberührt).
  useEffect(() => {
    if (!offen) return;
    const aufTaste = (e: KeyboardEvent) => { if (e.key === 'Escape') setOffen(false); };
    const aufKlick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOffen(false);
    };
    window.addEventListener('keydown', aufTaste);
    window.addEventListener('mousedown', aufKlick);
    return () => {
      window.removeEventListener('keydown', aufTaste);
      window.removeEventListener('mousedown', aufKlick);
    };
  }, [offen]);

  return (
    <span ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        aria-describedby={offen ? id : undefined}
        aria-expanded={offen}
        onClick={() => setOffen((v) => !v)}
        className={`cursor-help underline decoration-dotted decoration-ink-300 underline-offset-2 hover:decoration-brass-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600 ${className}`}
      >
        {children ?? eintrag.begriff}
      </button>
      {offen && (
        <span
          role="tooltip"
          id={id}
          className="lc-card absolute left-0 top-full z-30 mt-1 block w-64 max-w-[80vw] p-3 text-left text-body-s font-normal normal-case tracking-normal text-ink-700"
        >
          <span className="lc-overline mb-1 block text-brass-700">{eintrag.begriff}</span>
          {eintrag.erklaerung}
        </span>
      )}
    </span>
  );
}
