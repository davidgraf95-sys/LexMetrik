import { Link } from 'react-router-dom';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';
import { themaText, istSynth, istBge, hauptIdentitaet } from '../../lib/rechtsprechung/browse';
import { GEBIET_LABEL } from '../../lib/normtext/register';
import { NormChip } from './NormChip';
import { formatiereDatum } from './format';

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
  // Verweis-Eintrag: das vollständige Urteil zu einem BGE → Deep-Link in die Voll-Ansicht.
  const verweis = e.verweis ?? null;
  const ziel = verweis
    ? `/rechtsprechung/${encodeURIComponent(verweis.zielKey)}?ansicht=voll`
    : `/rechtsprechung/${encodeURIComponent(e.key)}`;
  return (
    <div className="lc-card group flex h-full flex-col p-4 transition-colors hover:border-brass-400">
      {/* Lese-Bereich (klickbar). flex-1 schiebt den Fuss auf gleiche Höhe.
          Stretched-Link: der Link deckt die ganze Lesefläche per ::after ab, die
          Norm-Chips liegen als GESCHWISTER darüber (relative) — so ist der
          interaktive Chip kein fokussierbarer Nachkomme des <a> (valides Markup),
          die ganze Fläche bleibt aber klickbar. */}
      <div className="relative flex flex-1 flex-col">
      <Link to={ziel} className="block no-underline after:absolute after:inset-0 after:content-['']">
        {/* Statuszeile: Gebiet + Leit-Marker links, Status rechts. */}
        <div className="flex items-center justify-between gap-2 text-micro">
          <span className="flex items-center gap-2">
            {verweis
              ? <span className="lc-badge lc-badge-soft">Vollständiges Urteil</span>
              : leit && <span className="lc-badge lc-badge-ok">Leitentscheid</span>}
            <span className="lc-overline text-brass-700">{GEBIET_LABEL[e.sachgebiet]}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            {synth && <span className="text-ink-500 italic">ohne amtl. Regeste</span>}
            {e.kuratierung === 'maschinell' && (
              <span className="lc-badge lc-badge-soft" title="Automatisch erfasst, fachlich noch nicht geprüft">ungeprüft</span>
            )}
          </span>
        </div>

        {/* THEMA — Leitelement. Verweis: klarer Bezug zum BGE; sonst echte Regeste in
            Serif (Lesebild), Synth in Sans. */}
        {verweis
          ? <p className="mt-2 text-body-s text-ink-700 leading-snug line-clamp-2">Vollständiges Urteil zu <span className="num">BGE {verweis.bgeReferenz}</span></p>
          : synth
            ? <p className="mt-2 text-body-s text-ink-700 leading-snug line-clamp-2">{themaText(e)}</p>
            : <p className="mt-2 font-serif text-body-l text-ink-900 leading-snug line-clamp-2">{themaText(e)}</p>}

      </Link>

      {/* Norm-Zeile — führend (nicht am Fuss): zweite Navigationsachse.
          Geschwister des Links (nicht Nachfahre), relativ über dem Stretch-::after. */}
      {e.normKeys.length > 0 && (
        <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
          {e.normKeys.slice(0, 4).map((k) => <NormChip key={k} normKey={k} onWaehle={onNorm} />)}
          {e.normKeys.length > 4 && <span className="num text-micro text-ink-500">+{e.normKeys.length - 4}</span>}
        </div>
      )}
      </div>

      <div className="scale-rule-sm mt-3" aria-hidden />

      {/* Metazeile (gedämpft) + amtliche Fassung. */}
      <div className="mt-2.5 flex items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-500">
          {/* Identität führend: amtliche BGE-Zitierung (erkannt/zitierbar) hervorgehoben,
              sonst das Aktenzeichen gedämpft. */}
          <span className={`num ${istBge(e) ? 'font-medium text-brass-700' : 'text-ink-500'}`}>{hauptIdentitaet(e)}</span>
          <span className="text-ink-300" aria-hidden>·</span>
          <span>{e.gerichtName}</span>
          <span className="text-ink-300" aria-hidden>·</span>
          <span className="num">{formatiereDatum(e.datum)}</span>
          {istBge(e) && <span className="num text-ink-500" title="Aktenzeichen">({e.nummer})</span>}
          {e.sprache !== 'de' && <span className="lc-badge lc-badge-soft uppercase">{e.sprache}</span>}
        </div>
        <a href={e.quelleUrl} target="_blank" rel="noopener noreferrer"
          className="shrink-0 text-xs text-ink-500 no-underline hover:text-brass-700"
          title="Amtliche Fassung beim Gericht öffnen">
          ↗ amtlich
        </a>
      </div>
    </div>
  );
}
