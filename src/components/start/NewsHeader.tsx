import { useEffect, useRef, useState } from 'react';
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

const MAX = 12;

/** ISO «YYYY-MM-DD…» → «DD.MM.YYYY» ohne Date-Objekt (deterministisch, SSR-sicher). */
function deDatum(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export function NewsHeader() {
  const [news, setNews] = useState<BrowseEntscheid[] | null>(null);
  const streifenRef = useRef<HTMLDivElement>(null);

  // #9: per Klick durch die Entscheide blättern — scrollt den Streifen um EINE
  // Karte (deren Breite + gap), in beide Richtungen.
  const blaettere = (richtung: -1 | 1) => {
    const el = streifenRef.current;
    if (!el) return;
    const karte = el.querySelector('li');
    const schritt = karte ? (karte as HTMLElement).offsetWidth + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: richtung * schritt, behavior: 'smooth' });
  };

  useEffect(() => {
    let lebt = true;
    import('../../lib/rechtsprechung/browse')
      .then(async (m) => {
        const manifest = await m.ladeEntscheidManifest();
        if (!lebt) return;
        // `!e.verweis`: Volltext-Verweise sind Redirect-Stubs auf einen echten
        // Eintrag (EntscheidLeser leitet auf `zielKey` um) — die Hauptansicht
        // (Rechtsprechung.tsx) zählt/listet sie durchgängig als `!e.verweis`.
        // Ohne diesen Filter doppelte der Ticker dieselbe BGE als eigene Karte.
        const bund = (manifest?.entscheide ?? []).filter((e) => e.gerichtstyp === 'bundesgericht' && !e.verweis);
        setNews(m.nachDatum(bund).slice(0, MAX)); // neueste zuerst
      })
      .catch(() => { if (lebt) setNews([]); });
    return () => { lebt = false; };
  }, []);

  // Rank 3 (QS-PERF, §15/2): CLS-Reservierung. Der Streifen lädt async aus dem
  // Register nach; ohne reservierten Platz wächst er ein und schiebt die ganze
  // Startseite nach unten (gemessener Startseiten-CLS-Anteil 0,57). Während des
  // Ladens (news===null) dieselbe Mindesthöhe halten, die der geladene Streifen
  // belegt → nahezu 0 Shift. Reserviert nur Platz, kürzt keinen Inhalt (§15/2).
  if (news === null) return <div className="min-h-modul-news" aria-hidden />;
  // Echter Leerfall (leeres Register, SSR/Prerender — in Prod nie, 272 BGE): nichts
  // anzeigen, kein leerer Kopf (§8). Kollabiert bewusst (kommt in Prod nicht vor).
  if (news.length === 0) return null;

  return (
    <section aria-label="Neue Bundesgerichtsentscheide" className="space-y-2 min-h-modul-news">
      <div className="flex items-center justify-between gap-3">
        <span className="lc-overline text-ink-500">Neu aus dem Bundesgericht</span>
        <div className="flex items-center gap-2">
          {/* Durchblättern per Klick (#9) — auf Touch/schmal ist zudem Wischen möglich. */}
          <div className="hidden sm:flex items-center gap-1" role="group" aria-label="Entscheide durchblättern">
            <button type="button" onClick={() => blaettere(-1)} aria-label="Vorherige Entscheide"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink-500 transition-colors hover:border-brass-300 hover:text-brass-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" onClick={() => blaettere(1)} aria-label="Nächste Entscheide"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink-500 transition-colors hover:border-brass-300 hover:text-brass-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <Link to="/rechtsprechung" className="text-body-s font-medium text-brass-700 hover:text-brass-600 no-underline whitespace-nowrap">
            Alle Entscheide →
          </Link>
        </div>
      </div>
      {/* Block-Scrollcontainer (klippt zuverlässig) + w-max-Flex innen — so
          verbreitert der Streifen die Seite nicht (Mobil-Overflow-Tor 390px). */}
      <div ref={streifenRef} className="overflow-x-auto pb-1.5">
      <ul className="flex gap-3 w-max max-w-full snap-x snap-mandatory">
        {news.map((e) => (
          <li key={e.key} className="snap-start shrink-0 w-[clamp(12rem,72vw,18rem)]">
            <Link to={`/rechtsprechung/${encodeURIComponent(e.key)}`}
              className="group flex h-full flex-col gap-1 lc-card p-3.5 bg-surface no-underline transition-[transform,box-shadow,color] motion-reduce:transition-none motion-reduce:transform-none hover:shadow-lg hover:-translate-y-0.5">
              <span className="flex items-center gap-2">
                <span className="num text-xs text-ink-500">{deDatum(e.datum)}</span>
                {e.leitcharakter === 'leitentscheid' && <span className="lc-badge lc-badge-ok shrink-0">Leitentscheid</span>}
              </span>
              <span className="font-sans font-medium text-ink-900 text-body-s leading-snug group-hover:text-brass-800 transition-colors">{e.zitierung}</span>
              {e.regesteKurz && <span className="text-body-s text-ink-500 leading-snug line-clamp-2">{e.regesteKurz}</span>}
              <span className="mt-auto pt-1 text-xs text-ink-600 truncate">{e.gerichtName}</span>
            </Link>
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}
