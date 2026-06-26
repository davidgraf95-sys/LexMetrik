import type { KeyboardEvent, MouseEvent } from 'react';
import { normLabel } from '../../lib/rechtsprechung/browse';

// Klickbarer Norm-Chip — zweite Navigationsachse (Burggraben): setzt den
// ?norm-Filter der Übersicht. Karte/Zeile sind selbst ein <Link> (<a>); der Chip
// liegt also als Nachkomme darin. Deshalb WEDER <a> NOCH <button> (beides
// «interactive content» → im <a> ungültiges Markup), sondern ein span mit
// role="button": valides Inhaltsmodell bei voller Funktion — Klick + Tastatur
// (Enter/Space). stopPropagation/preventDefault halten den Klick lokal, sonst
// landete er im Reader. Reine Darstellung (§3); normLabel ist ein reiner Helfer.
export function NormChip({ normKey, onWaehle }: {
  normKey: string;
  onWaehle: (k: string) => void;
}) {
  const waehle = (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWaehle(normKey);
  };
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={waehle}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') waehle(e); }}
      className="lc-chip cursor-pointer whitespace-nowrap hover:border-brass-400 hover:text-brass-700 transition-colors"
      title={`Rechtsprechung zu ${normLabel(normKey)} anzeigen`}
    >
      {normLabel(normKey)}
    </span>
  );
}
