import { Link } from 'react-router-dom';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';
import { GEBIET_LABEL } from '../../lib/normtext/register';

// Karte eines Entscheids in der Übersicht /rechtsprechung. EIGENE Karte (NICHT
// ErlassKarte): ein Urteil trägt keine SR-Nummer/Artikelzahl, sondern
// Aktenzeichen, Gericht, Datum, Sachgebiet und (wenn vorhanden) die Regeste.
// Reine Darstellung (§3) — keine Rechtslogik.

function formatiereDatum(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export function EntscheidKarte({ e }: { e: BrowseEntscheid }) {
  // Hauptanker: BGE-Referenz (amtliche Sammlung) bevorzugt, sonst Aktenzeichen.
  const anker = e.bgeReferenz ?? e.nummer;
  // Kartentext: geglättete Kurzregeste, sonst die volle Zitierung als Ersatz.
  const text = e.regesteKurz ?? e.zitierung;
  return (
    <Link
      to={`/rechtsprechung/${encodeURIComponent(e.key)}`}
      className="lc-card group block p-4 no-underline transition-colors hover:border-brass-400"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="num font-display text-h3 font-semibold text-ink-900 leading-none">{anker}</span>
        <span className="flex shrink-0 items-center gap-1.5">
          {e.leitcharakter === 'leitentscheid' && (
            <span className="lc-badge lc-badge-ok">Leitentscheid</span>
          )}
          {e.sprache !== 'de' && (
            <span className="lc-badge lc-badge-soft uppercase">{e.sprache}</span>
          )}
        </span>
      </div>
      <p className="mt-2 text-body-s text-ink-600 leading-snug line-clamp-3">{text}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
        <span>{e.gerichtName}</span>
        <span className="text-ink-300" aria-hidden>·</span>
        <span>Urteil vom <span className="num">{formatiereDatum(e.datum)}</span></span>
        <span className="text-ink-300" aria-hidden>·</span>
        <span className="text-brass-700">{GEBIET_LABEL[e.sachgebiet]}</span>
      </div>
      {e.normKeys.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {e.normKeys.slice(0, 5).map((k) => (
            <span key={k} className="lc-chip whitespace-nowrap">{k}</span>
          ))}
          {e.normKeys.length > 5 && (
            <span className="num text-xs text-ink-400">+{e.normKeys.length - 5}</span>
          )}
        </div>
      )}
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brass-700 opacity-0 transition-opacity group-hover:opacity-100">
        Entscheid lesen →
      </span>
    </Link>
  );
}
