import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';

// ─── News-Header der Startseite (Auftrag David) ─────────────────────────────
//
// Zeigt die NEUESTEN Bundesgerichtsentscheide als scanbaren Streifen, gespeist
// aus dem bestehenden Rechtsprechungs-Register (build-time, neueste zuerst —
// §3/§5: keine eigene Logik, nur Anzeige). Bewusst erweiterbar angelegt: weitere
// amtliche Quellen (neue Gesetze, Initiativen, …) lassen sich später als weitere
// `NachrichtenQuelle` ergänzen, ohne die Anzeige umzubauen.
//
// «live nachladen» (Davids Wahl): das Register ist die sofort sichtbare Basis;
// die Live-Augmentierung gegen entscheidsuche/OpenCaseLaw ist als eigener,
// abnahmebedürftiger Schritt offen (verifizierter API-Vertrag nötig, §1/§7) —
// hier NICHT unverifiziert eingebaut, damit nie falsche Entscheiddaten erscheinen.

const MAX = 6;

/** ISO «YYYY-MM-DD…» → «DD.MM.YYYY» ohne Date-Objekt (deterministisch, SSR-sicher). */
function deDatum(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export function NewsHeader() {
  const [news, setNews] = useState<BrowseEntscheid[] | null>(null);

  useEffect(() => {
    let lebt = true;
    import('../../lib/rechtsprechung/browse')
      .then(async (m) => {
        const manifest = await m.ladeEntscheidManifest();
        if (!lebt) return;
        const bund = (manifest?.entscheide ?? []).filter((e) => e.gerichtstyp === 'bundesgericht');
        setNews(m.nachDatum(bund).slice(0, MAX)); // neueste zuerst
      })
      .catch(() => { if (lebt) setNews([]); });
    return () => { lebt = false; };
  }, []);

  // SSR/Prerender + leeres Register: nichts rendern (News ist dynamisch).
  if (!news || news.length === 0) return null;

  return (
    <section aria-label="Neue Bundesgerichtsentscheide" className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="lc-overline text-ink-500">Neu aus dem Bundesgericht</span>
        <Link to="/rechtsprechung" className="text-body-s font-medium text-brass-700 hover:text-brass-600 no-underline whitespace-nowrap">
          Alle Entscheide →
        </Link>
      </div>
      <ul className="flex gap-3 overflow-x-auto pb-1.5 -mx-1 px-1 snap-x snap-mandatory">
        {news.map((e) => (
          <li key={e.key} className="snap-start shrink-0 w-[clamp(15rem,80vw,19rem)]">
            <Link to={`/rechtsprechung/${encodeURIComponent(e.key)}`}
              className="group flex h-full flex-col gap-1 lc-card p-3.5 bg-surface no-underline transition-[transform,box-shadow,color] motion-reduce:transition-none motion-reduce:transform-none hover:shadow-lg hover:-translate-y-0.5">
              <span className="flex items-center gap-2">
                <span className="num text-xs text-ink-500">{deDatum(e.datum)}</span>
                {e.leitcharakter === 'leitentscheid' && <span className="lc-badge lc-badge-ok shrink-0">Leitentscheid</span>}
              </span>
              <span className="font-sans font-medium text-ink-900 text-body-s leading-snug group-hover:text-brass-800 transition-colors">{e.zitierung}</span>
              {e.regesteKurz && <span className="text-body-s text-ink-500 leading-snug line-clamp-2">{e.regesteKurz}</span>}
              <span className="mt-auto pt-1 text-xs text-ink-400 truncate">{e.gerichtName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
