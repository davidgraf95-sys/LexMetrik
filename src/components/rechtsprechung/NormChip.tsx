import { normLabel } from '../../lib/rechtsprechung/browse';

// Klickbarer Norm-Chip — zweite Navigationsachse (Burggraben): setzt den
// ?norm-Filter der Übersicht. EIGENES <button> (NICHT <a>): Karte/Zeile sind
// selbst ein <Link>, ein verschachteltes <a> wäre ungültig und jeder Chip-Klick
// landete sonst im Reader. stopPropagation/preventDefault halten den Klick lokal.
// Reine Darstellung (§3); normLabel ist ein reiner Helfer.
export function NormChip({ normKey, onWaehle }: {
  normKey: string;
  onWaehle: (k: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWaehle(normKey); }}
      className="lc-chip whitespace-nowrap hover:border-brass-400 hover:text-brass-700 transition-colors"
      title={`Rechtsprechung zu ${normLabel(normKey)} anzeigen`}
    >
      {normLabel(normKey)}
    </button>
  );
}
