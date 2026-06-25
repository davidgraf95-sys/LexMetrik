import { Link } from 'react-router-dom';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';
import { themaText, istSynth, istBge, hauptIdentitaet } from '../../lib/rechtsprechung/browse';
import { GEBIET_LABEL } from '../../lib/normtext/register';
import { NormChip } from './NormChip';
import { formatiereDatum } from './format';

// Kompakte Listen-Zeile (Default-Dichte). Bezeichnung führt mit dem THEMA/Leitsatz
// (Auftrag David: man soll schon sehen, worum es geht) — die BGE-Nummer steht als
// Identitäts-Anker rechts, das Datum ganz links. Darunter Rechtsgebiet + die in der
// Regeste genannten Normen als klickbare Chips. Fehlt die amtliche Regeste, zeigt die
// Bezeichnung die deterministische Synth-Zeile, ehrlich markiert (§8). Reine
// Darstellung (§3); NormChip ist <button> (stopPropagation), kein <a> im <Link>.
export function EntscheidZeile({ e, onNorm }: {
  e: BrowseEntscheid;
  onNorm: (k: string) => void;
}) {
  const synth = istSynth(e);
  return (
    <Link
      to={`/rechtsprechung/${encodeURIComponent(e.key)}`}
      className="group flex items-stretch gap-3 px-4 py-3 no-underline hover:bg-well transition-colors"
    >
      {/* Ganz links — Entscheiddatum (feste Spalte, scanbare Kante). */}
      <span className="num w-[5.25rem] shrink-0 pt-0.5 text-xs text-ink-500 tabular-nums">
        {formatiereDatum(e.datum)}
      </span>

      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Bezeichnung — Thema/Leitsatz führt; BGE-Nummer als Identität rechtsbündig. */}
        <div className="flex items-baseline gap-3">
          <span className={`min-w-0 flex-1 truncate text-body-s ${synth ? 'text-ink-700' : 'font-medium text-ink-900'} group-hover:text-brass-700`}>
            {themaText(e)}
          </span>
          <span className={`num shrink-0 text-xs ${istBge(e) ? 'font-medium text-brass-700' : 'text-ink-500'}`}>
            {hauptIdentitaet(e)}
          </span>
        </div>

        {/* Metazeile — Rechtsgebiet, Status, angewandte Normen (klickbar). */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
          <span className="text-brass-700">{GEBIET_LABEL[e.sachgebiet]}</span>
          {synth && <span className="text-micro italic text-ink-500">ohne amtl. Regeste</span>}
          {e.kuratierung === 'maschinell' && (
            <span className="lc-badge lc-badge-soft" title="Automatisch erfasst, fachlich noch nicht geprüft">ungeprüft</span>
          )}
          {e.sprache !== 'de' && <span className="lc-badge lc-badge-soft uppercase">{e.sprache}</span>}
          {e.normKeys.slice(0, 5).map((k) => <NormChip key={k} normKey={k} onWaehle={onNorm} />)}
          {e.normKeys.length > 5 && <span className="num text-micro text-ink-500">+{e.normKeys.length - 5}</span>}
        </div>
      </div>
    </Link>
  );
}
