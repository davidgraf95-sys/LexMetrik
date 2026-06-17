import { Link } from 'react-router-dom';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';

// Erlass-Karte in der Übersicht /gesetze. Nüchtern/kanzleihaft (DESIGN-REGLEMENT):
// Kürzel als Anker, Titel klein, Meta (SR · Artikelzahl), Stand als Chip. Reine
// Darstellung (§3). Snapshot-Erlasse führen in die Lesesicht; nur-live-link-
// Erlasse tragen ehrlich nur den amtlichen Link (§8).

function StandChip({ stand }: { stand: string }) {
  if (!stand) return null;
  const m = stand.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const anzeige = m ? `${m[3]}.${m[2]}.${m[1]}` : stand;
  return <span className="lc-chip whitespace-nowrap">Stand <span className="num">{anzeige}</span></span>;
}

function KarteInhalt({ e }: { e: BrowseErlass }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-h3 font-semibold text-ink-900 leading-none">{e.kuerzel}</span>
        {e.sprache !== 'de' && (
          <span className="lc-badge lc-badge-soft uppercase">{e.sprache}</span>
        )}
      </div>
      <p className="mt-1.5 text-body-s text-ink-600 leading-snug line-clamp-2">{e.titel}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
        {e.sr && <span>SR <span className="num">{e.sr}</span></span>}
        {e.status === 'snapshot'
          ? <span><span className="num">{e.artikelAnzahl}</span> Artikel</span>
          : <span className="text-ink-400">nur Live-Link</span>}
        <StandChip stand={e.stand} />
      </div>
    </>
  );
}

export function ErlassKarte({ e }: { e: BrowseErlass }) {
  // nur-live-link: kein interner Reader (ehrlich, §8) → amtlicher Link extern.
  if (e.status !== 'snapshot') {
    return (
      <a
        href={e.quelleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="lc-card block p-4 no-underline transition-colors hover:border-brass-400"
      >
        <KarteInhalt e={e} />
        <span className="mt-2 inline-flex text-xs text-brass-700">↗ amtliche Fassung</span>
      </a>
    );
  }
  return (
    <Link
      to={`/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`}
      className="lc-card group block p-4 no-underline transition-colors hover:border-brass-400"
    >
      <KarteInhalt e={e} />
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brass-700 opacity-0 transition-opacity group-hover:opacity-100">
        Volltext lesen →
      </span>
    </Link>
  );
}
