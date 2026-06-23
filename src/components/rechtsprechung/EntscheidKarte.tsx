import { Link } from 'react-router-dom';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';
import { themaText, istSynth } from '../../lib/rechtsprechung/browse';
import { GEBIET_LABEL } from '../../lib/normtext/register';
import { NormChip } from './NormChip';
import { formatiereDatum, kantonLabel } from './format';

// Karte eines Entscheids (Dichte 'karten'). Hierarchie-Umkehr ggü. der alten
// Karte: das THEMA führt (Scent), das Aktenzeichen wandert in die gedämpfte
// Metazeile — 0/75 haben eine BGE-Referenz, die Nummer trägt also keinen Scent.
// Fehlt die amtliche Regeste, zeigt die Karte die deterministische Synth-Zeile
// (font-sans + Marker, NICHT Serifen-Regeste-Optik → §8 ehrlich). Reine
// Darstellung (§3); Norm-Chips sind <button> (NormChip), kein <a> im <Link>.

export function EntscheidKarte({ e, onNorm }: {
  e: BrowseEntscheid;
  onNorm: (k: string) => void;
}) {
  const leit = e.leitcharakter === 'leitentscheid';
  const synth = istSynth(e);
  return (
    <div className="lc-card group flex h-full flex-col p-4 transition-colors hover:border-brass-400">
      {/* Lese-Bereich (klickbar). flex-1 schiebt den Fuss auf gleiche Höhe. */}
      <Link to={`/rechtsprechung/${encodeURIComponent(e.key)}`} className="block flex-1 no-underline">
        {/* Statuszeile: Gebiet + Leit-Marker links, Status rechts. */}
        <div className="flex items-center justify-between gap-2 text-micro">
          <span className="flex items-center gap-2">
            {leit && <span className="lc-badge lc-badge-ok">Leitentscheid</span>}
            <span className="lc-overline text-brass-700">{GEBIET_LABEL[e.sachgebiet]}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            {synth && <span className="text-ink-400 italic">ohne amtl. Regeste</span>}
            {e.kuratierung === 'maschinell' && (
              <span className="lc-badge lc-badge-soft" title="Automatisch erfasst, fachlich noch nicht geprüft">ungeprüft</span>
            )}
          </span>
        </div>

        {/* THEMA — Leitelement. Echte Regeste in Serif (Lesebild), Synth in Sans. */}
        {synth
          ? <p className="mt-2 text-body-s text-ink-700 leading-snug line-clamp-2">{themaText(e)}</p>
          : <p className="mt-2 font-serif text-body-l text-ink-900 leading-snug line-clamp-2">{themaText(e)}</p>}

        {/* Norm-Zeile — führend (nicht am Fuss): zweite Navigationsachse. */}
        {e.normKeys.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {e.normKeys.slice(0, 4).map((k) => <NormChip key={k} normKey={k} onWaehle={onNorm} />)}
            {e.normKeys.length > 4 && <span className="num text-micro text-ink-400">+{e.normKeys.length - 4}</span>}
          </div>
        )}
      </Link>

      <div className="scale-rule-sm mt-3" aria-hidden />

      {/* Metazeile (gedämpft) + amtliche Fassung. */}
      <div className="mt-2.5 flex items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-500">
          <span>{e.gerichtName}</span>
          <span className="text-ink-300" aria-hidden>·</span>
          <span>{kantonLabel(e.kanton)}</span>
          <span className="text-ink-300" aria-hidden>·</span>
          <span className="num">{formatiereDatum(e.datum)}</span>
          <span className="text-ink-300" aria-hidden>·</span>
          <span className="num text-ink-400">{e.nummer}</span>
          {e.sprache !== 'de' && <span className="lc-badge lc-badge-soft uppercase">{e.sprache}</span>}
        </div>
        <a href={e.quelleUrl} target="_blank" rel="noopener noreferrer"
          className="shrink-0 text-xs text-ink-400 no-underline hover:text-brass-700"
          title="Amtliche Fassung beim Gericht öffnen">
          ↗ amtlich
        </a>
      </div>
    </div>
  );
}
