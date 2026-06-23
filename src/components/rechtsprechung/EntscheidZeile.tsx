import { Link } from 'react-router-dom';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';
import { themaText, istSynth, istBge, hauptIdentitaet } from '../../lib/rechtsprechung/browse';
import { GEBIET_LABEL } from '../../lib/normtext/register';
import { NormChip } from './NormChip';
import { formatiereDatum } from './format';

// Kompakte Listen-Zeile — die DEFAULT-Dichte der Übersicht (scan-optimiert: das
// Auge wandert die linke Kante mit dem THEMA herunter). Pendant zur Karte, teilt
// themaText/istSynth + NormChip. Ein ruhiges Leit-Signal (schmaler Messing-Strich
// links), KEIN Badge-Lärm. Reine Darstellung (§3).
export function EntscheidZeile({ e, onNorm }: {
  e: BrowseEntscheid;
  onNorm: (k: string) => void;
}) {
  const leit = e.leitcharakter === 'leitentscheid';
  const synth = istSynth(e);
  return (
    <Link
      to={`/rechtsprechung/${encodeURIComponent(e.key)}`}
      className="group flex items-stretch gap-3 px-4 py-2.5 no-underline hover:bg-well transition-colors"
    >
      {/* Zone 1 — Leit-Signal (oder gleich breiter Spacer für Spaltenstabilität). */}
      <span aria-hidden
        className={`mt-0.5 w-0.5 shrink-0 rounded-full ${leit ? 'bg-brass-500' : 'bg-transparent'}`}
        title={leit ? 'Leitentscheid' : undefined} />

      {/* Zone 2 — Thema (Leitelement) + Metazeile. */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className={`min-w-0 truncate text-body-s ${leit ? 'font-medium text-ink-900' : 'text-ink-700'} group-hover:text-brass-700`}>
            {themaText(e)}
          </span>
          {synth && <span className="shrink-0 text-micro text-ink-400 italic">ohne amtl. Regeste</span>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
          <span>{e.gerichtName}</span>
          <span className="text-ink-300" aria-hidden>·</span>
          <span className="text-brass-700">{GEBIET_LABEL[e.sachgebiet]}</span>
          {/* Identität/Datum auf Mobil hier mit, auf Desktop rechts in Zone 3. */}
          <span className="num text-ink-400 sm:hidden" aria-hidden>· {hauptIdentitaet(e)} · {formatiereDatum(e.datum)}</span>
          {e.normKeys.slice(0, 3).map((k) => <NormChip key={k} normKey={k} onWaehle={onNorm} />)}
          {e.normKeys.length > 3 && <span className="num text-micro text-ink-400">+{e.normKeys.length - 3}</span>}
          {e.kuratierung === 'maschinell' && (
            <span className="text-ink-400" title="Automatisch erfasst, fachlich noch nicht geprüft">ungeprüft</span>
          )}
          {e.sprache !== 'de' && <span className="text-ink-400 uppercase">{e.sprache}</span>}
        </div>
      </div>

      {/* Zone 3 — Identität rechtsbündig (ab sm): BGE-Zitierung hervorgehoben, sonst Aktenzeichen. */}
      <div className="hidden shrink-0 text-right sm:block">
        <span className={`num block text-xs ${istBge(e) ? 'font-medium text-brass-700' : 'text-ink-400'}`}>{hauptIdentitaet(e)}</span>
        <span className="num block text-micro text-ink-300">{formatiereDatum(e.datum)}</span>
      </div>
    </Link>
  );
}
