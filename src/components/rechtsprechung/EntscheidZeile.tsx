import { Link } from 'react-router-dom';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';
import { istBge, hauptIdentitaet } from '../../lib/rechtsprechung/browse';
import { GEBIET_LABEL } from '../../lib/normtext/register';
import { NormChip } from './NormChip';
import { formatiereDatum } from './format';

// Kompakte Listen-Zeile (Default-Dichte). Aufbau nach Auftrag David: ganz links das
// Entscheiddatum, dann als Bezeichnung die BGE-Nummer (sonst Aktenzeichen), darunter
// die angewandten/in der Regeste genannten Artikel als KLICKBARE Norm-Chips (zweite
// Navigationsachse, ?norm), dann das Rechtsgebiet. Reine Darstellung (§3).
export function EntscheidZeile({ e, onNorm }: {
  e: BrowseEntscheid;
  onNorm: (k: string) => void;
}) {
  const leit = e.leitcharakter === 'leitentscheid';
  return (
    <Link
      to={`/rechtsprechung/${encodeURIComponent(e.key)}`}
      className="group flex items-stretch gap-3 px-4 py-3 no-underline hover:bg-well transition-colors"
    >
      {/* Ganz links — Entscheiddatum (feste Spalte für scanbare Kante). */}
      <span className="num w-[5.25rem] shrink-0 pt-0.5 text-xs text-ink-400 tabular-nums">
        {formatiereDatum(e.datum)}
      </span>

      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Bezeichnung — BGE-Nummer zuerst (sonst Aktenzeichen), hervorgehoben. */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className={`num text-body-s font-medium ${istBge(e) ? 'text-brass-700' : 'text-ink-900'} group-hover:text-brass-700`}>
            {hauptIdentitaet(e)}
          </span>
          {leit && <span className="lc-badge lc-badge-ok shrink-0">Leitentscheid</span>}
          {e.kuratierung === 'maschinell' && (
            <span className="shrink-0 text-micro text-ink-400" title="Automatisch erfasst, fachlich noch nicht geprüft">ungeprüft</span>
          )}
          {e.sprache !== 'de' && <span className="shrink-0 text-micro uppercase text-ink-400">{e.sprache}</span>}
        </div>

        {/* Artikel aus der Regeste — klickbar (filtert die Rechtsprechung nach der Norm). */}
        {e.normKeys.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {e.normKeys.slice(0, 6).map((k) => <NormChip key={k} normKey={k} onWaehle={onNorm} />)}
            {e.normKeys.length > 6 && <span className="num text-micro text-ink-400">+{e.normKeys.length - 6}</span>}
          </div>
        )}

        {/* Rechtsgebiet (Sachgebiet-Zuordnung). */}
        <div className="text-xs text-brass-700">{GEBIET_LABEL[e.sachgebiet]}</div>
      </div>
    </Link>
  );
}
