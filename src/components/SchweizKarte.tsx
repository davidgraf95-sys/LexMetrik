import { KANTONE_KARTE } from '../data/kantoneKarte';

// Interaktive Schweiz-Karte: jeder Kanton ist ein klickbarer Pfad (Klick →
// onWaehle). Hover/Fokus heben den Kanton hervor, der aktive ist in Messing
// markiert. Kantone ohne Erlasse werden gedämpft und sind nicht wählbar.
// Reine Darstellung (§3); Geometrie aus src/data/kantoneKarte.ts.
export function SchweizKarte({ aktiv, onWaehle, nameFuer, verfuegbar, className }: {
  aktiv?: string | null;
  onWaehle: (kanton: string) => void;
  nameFuer?: (kanton: string) => string;
  verfuegbar?: (kanton: string) => boolean;
  className?: string;
}) {
  // Aktiven Kanton zuletzt zeichnen, damit sein Rand nicht von Nachbarn überdeckt wird.
  const eintraege = Object.entries(KANTONE_KARTE.paths)
    .sort(([a], [b]) => (a === aktiv ? 1 : 0) - (b === aktiv ? 1 : 0));
  return (
    <svg viewBox={KANTONE_KARTE.viewBox} role="group" aria-label="Karte der Schweizer Kantone — Kanton wählen"
      className={className ?? 'w-full max-w-[36rem] mx-auto h-auto'}>
      {eintraege.map(([k, d]) => {
        const ist = aktiv === k;
        const waehlbar = verfuegbar ? verfuegbar(k) : true;
        const name = nameFuer ? nameFuer(k) : k;
        return (
          <path key={k} d={d}
            onClick={waehlbar ? () => onWaehle(k) : undefined}
            onKeyDown={waehlbar ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onWaehle(k); } } : undefined}
            tabIndex={waehlbar ? 0 : -1} role="button" aria-pressed={ist}
            aria-label={waehlbar ? name : `${name} — keine Erlasse`}
            className={`[stroke-width:0.6] outline-none transition-colors ${
              ist
                ? 'fill-brass-400 stroke-brass-700'
                : waehlbar
                  ? 'fill-paper-sunken stroke-line cursor-pointer hover:fill-brass-200 focus-visible:fill-brass-200 focus-visible:[stroke-width:1.4]'
                  : 'fill-paper stroke-line/50 cursor-default'
            }`}>
            <title>{name}</title>
          </path>
        );
      })}
    </svg>
  );
}
