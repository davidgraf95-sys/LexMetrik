import { useState } from 'react';
import { KANTONE_KARTE } from '../data/kantoneKarte';

// Soft, gut unterscheidbare Füllfarbe je Kanton: Goldwinkel-Streuung über den
// Farbkreis → benachbarte Kantone bekommen verschiedene Farbtöne. Gedämpft
// (Pastell), damit es zum Papier-Look passt; Hover/aktiv vertiefen den Ton.
function farbe(i: number, zustand: 'basis' | 'hover' | 'aktiv'): string {
  const h = Math.round((i * 137.508) % 360);
  // Lightness aus Token (--karte-l-*): im Dunkelmodus gedämpft, sonst glühen
  // die Pastelle grell. Farbwinkel/Sättigung bleiben hier (reine Geometrie, §3).
  if (zustand === 'aktiv') return `hsl(${h} 58% var(--karte-l-aktiv))`;
  if (zustand === 'hover') return `hsl(${h} 50% var(--karte-l-hover))`;
  return `hsl(${h} 38% var(--karte-l-basis))`;
}

// Interaktive Schweiz-Karte: jeder Kanton ist ein klickbarer, farblich
// unterscheidbarer Pfad. Hover/Fokus heben hervor UND zeigen den Kantonsnamen
// in der Bildunterschrift; der aktive Kanton ist kräftig markiert. Kantone ohne
// Erlasse sind gedämpft und nicht wählbar. Reine Darstellung (§3).
export function SchweizKarte({ aktiv, onWaehle, nameFuer, verfuegbar, className }: {
  aktiv?: string | null;
  onWaehle: (kanton: string) => void;
  nameFuer?: (kanton: string) => string;
  verfuegbar?: (kanton: string) => boolean;
  className?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const codes = Object.keys(KANTONE_KARTE.paths);
  const idx = (k: string) => codes.indexOf(k);
  const name = (k: string) => (nameFuer ? nameFuer(k) : k);
  // Aktiven/gehoverten Kanton zuletzt zeichnen → Rand nicht von Nachbarn überdeckt.
  const eintraege = Object.entries(KANTONE_KARTE.paths).sort(
    ([a], [b]) => (a === aktiv || a === hover ? 1 : 0) - (b === aktiv || b === hover ? 1 : 0),
  );
  const gezeigt = hover ?? aktiv ?? null;
  return (
    <div className={className ?? 'w-full max-w-[40rem] mx-auto'}>
      {/* Bildunterschrift: zeigt, was unter dem Zeiger/Fokus liegt. */}
      <div className="mb-2 flex items-baseline gap-2 min-h-[1.5rem]" aria-live="polite">
        {gezeigt ? (
          <>
            <span className="text-body-s font-semibold text-ink-900">{name(gezeigt)}</span>
            <span aria-hidden className="num text-xs text-ink-400">{gezeigt}</span>
            {verfuegbar && !verfuegbar(gezeigt) && <span className="text-xs text-ink-400">— keine Erlasse</span>}
          </>
        ) : (
          <span className="text-xs text-ink-400">Kanton auf der Karte wählen</span>
        )}
      </div>
      <svg viewBox={KANTONE_KARTE.viewBox} role="group" aria-label="Karte der Schweizer Kantone — Kanton wählen"
        className="w-full h-auto">
        {eintraege.map(([k, d]) => {
          const ist = aktiv === k;
          const waehlbar = verfuegbar ? verfuegbar(k) : true;
          const ueber = hover === k;
          // Nicht-wählbare Kantone: sichtbares Linien-Token statt --paper-sunken
          // (das mit dem Hintergrund verschmolz) — als gedämpfte Landmasse erkennbar.
          const fill = !waehlbar ? 'var(--line-strong)'
            : ist ? farbe(idx(k), 'aktiv')
            : ueber ? farbe(idx(k), 'hover')
            : farbe(idx(k), 'basis');
          return (
            <path key={k} d={d}
              onClick={waehlbar ? () => onWaehle(k) : undefined}
              onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover((h) => (h === k ? null : h))}
              onFocus={() => setHover(k)} onBlur={() => setHover((h) => (h === k ? null : h))}
              onKeyDown={waehlbar ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onWaehle(k); } } : undefined}
              tabIndex={waehlbar ? 0 : -1} role="button" aria-pressed={ist}
              aria-label={waehlbar ? name(k) : `${name(k)} — keine Erlasse`}
              style={{ fill, stroke: ist ? 'var(--brass-700)' : 'var(--paper)', strokeWidth: ist ? 1.6 : 0.8, opacity: waehlbar ? 1 : 0.8 }}
              className={`outline-none transition-[fill] ${waehlbar ? 'cursor-pointer' : 'cursor-default'}`}>
              <title>{name(k)}</title>
            </path>
          );
        })}
      </svg>
    </div>
  );
}
