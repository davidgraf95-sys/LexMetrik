import type { SachgebietGruppe } from '../../lib/rechtsprechung/browse';
import type { Rechtsgebiet } from '../../lib/normtext/register';

// Sachgebiet-Kacheln (Übersicht /rechtsprechung): je Rechtsgebiet eine Kachel
// mit Treffer-Anzahl — Klick filtert die Liste auf das Sachgebiet. Das ist der
// kuratierte Einstieg (Mehrwert ggü. einer flachen Trefferliste). Reine
// Darstellung (§3); die Gruppierung kommt aus gruppiereNachSachgebiet().

export function SachgebietKacheln({ gruppen, aktiv, onWaehle }: {
  gruppen: SachgebietGruppe[];
  aktiv: Rechtsgebiet | null;
  onWaehle: (g: Rechtsgebiet | null) => void;
}) {
  if (gruppen.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {gruppen.map((g) => {
        const an = aktiv === g.gebiet;
        return (
          <button
            type="button"
            key={g.gebiet}
            onClick={() => onWaehle(an ? null : g.gebiet)}
            aria-pressed={an}
            className={`lc-card group flex flex-col gap-1.5 p-3.5 text-left transition-colors ${
              an ? 'border-brass-500 bg-brass-100/40' : 'hover:border-brass-400'
            }`}
          >
            <span className={`text-body-s font-medium leading-snug ${an ? 'text-brass-800' : 'text-ink-800 group-hover:text-brass-700'}`}>
              {g.label}
            </span>
            <span className="num text-xs text-ink-400">
              {g.entscheide.length} {g.entscheide.length === 1 ? 'Entscheid' : 'Entscheide'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
