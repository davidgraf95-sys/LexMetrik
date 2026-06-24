import { useEffect, useRef, useState } from 'react';
import {
  sucheLive, LIVE_QUELLE, type LiveTreffer, type LiveSortierung, type LiveSuchErgebnis,
} from '../../lib/rechtsprechung/livesuche';
import { formatiereDatum, kantonLabel } from './format';

// Opt-in Live-Volltextsuche über den GESAMTEN Schweizer Korpus (entscheidsuche.ch),
// weit über die kuratierte LexMetrik-Auswahl hinaus. DISCOVERY, keine Engine (§2):
// externe, NICHT geprüfte Treffer, klar als solche markiert; massgeblich bleibt die
// amtliche Fassung (Link je Treffer). Standardmässig eingeklappt — der Suchbegriff
// verlässt die App erst auf bewusste Aktion (Berufsgeheimnis, §8). Reine Darstellung (§3).

function TrefferZeile({ t }: { t: LiveTreffer }) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className="truncate text-body-s text-ink-800 group-hover:text-brass-700">{t.titel}</div>
        {t.thema && <div className="mt-0.5 truncate text-xs text-ink-500">{t.thema}</div>}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-micro text-ink-400">
          <span>{kantonLabel(t.kanton)}</span>
          {t.datum && <><span aria-hidden>·</span><span className="num">{formatiereDatum(t.datum)}</span></>}
          {t.aktenzeichen && <><span aria-hidden>·</span><span className="num">{t.aktenzeichen}</span></>}
        </div>
      </div>
      {t.quelleUrl && <span aria-hidden className="shrink-0 self-center text-brass-600">↗</span>}
    </>
  );
  return t.quelleUrl ? (
    <a href={t.quelleUrl} target="_blank" rel="noopener noreferrer"
      className="group flex items-stretch gap-3 px-4 py-2.5 no-underline hover:bg-well transition-colors"
      title="Amtliches Dokument bei entscheidsuche.ch öffnen">
      {inner}
    </a>
  ) : (
    <div className="flex items-stretch gap-3 px-4 py-2.5">{inner}</div>
  );
}

export function LiveSuche({ initialQ = '' }: { initialQ?: string }) {
  const [offen, setOffen] = useState(false);
  const [q, setQ] = useState(initialQ);
  const [sortNach, setSortNach] = useState<LiveSortierung>('relevanz');
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState(false);
  const [erg, setErg] = useState<LiveSuchErgebnis | null>(null);
  const abbruch = useRef<AbortController | null>(null);

  useEffect(() => () => abbruch.current?.abort(), []);

  const fuehreAus = (sortierung: LiveSortierung) => {
    const begriff = q.trim();
    if (!begriff) return;
    abbruch.current?.abort();
    const ctrl = new AbortController();
    abbruch.current = ctrl;
    setLaden(true); setFehler(false);
    sucheLive(begriff, { size: 20, sortNach: sortierung, signal: ctrl.signal })
      .then((r) => { if (!ctrl.signal.aborted) { setErg(r); setLaden(false); } })
      .catch((e) => { if (!ctrl.signal.aborted && e?.name !== 'AbortError') { setFehler(true); setLaden(false); } });
  };

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); fuehreAus(sortNach); };
  const setzeSort = (s: LiveSortierung) => { setSortNach(s); if (erg || laden) fuehreAus(s); };

  if (!offen) {
    return (
      <div className="border-t border-line/60 pt-4">
        <button type="button" onClick={() => { setOffen(true); setQ((cur) => cur || initialQ); }}
          className="text-body-s text-brass-700 hover:text-brass-600">
          Nicht dabei? Im gesamten Schweizer Korpus suchen (entscheidsuche.ch) →
        </button>
      </div>
    );
  }

  return (
    <section aria-label="Live-Suche entscheidsuche.ch" className="border-t border-line/60 pt-4 space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="lc-overline text-brass-700">Live-Suche · gesamter CH-Korpus</h2>
        <button type="button" onClick={() => setOffen(false)} className="text-xs text-ink-500 hover:text-ink-700">einklappen</button>
      </div>

      <p className="text-micro text-ink-400 leading-relaxed">
        Durchsucht <span className="text-ink-600">{LIVE_QUELLE}</span> (Bund + alle Kantone, alle Sprachen) — weit über die
        kuratierte Auswahl hinaus. Die Treffer sind <span className="text-ink-600">extern und nicht von LexMetrik geprüft</span>;
        massgeblich ist die amtliche Fassung (Link je Treffer). Der Suchbegriff wird an {LIVE_QUELLE} übermittelt.
      </p>

      <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
        <input
          type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Begriff, Norm oder Aktenzeichen …" aria-label="Live-Suchbegriff"
          className="min-w-0 flex-1 rounded border border-line bg-paper px-3 py-1.5 text-body-s text-ink-900 placeholder:text-ink-400 focus:border-brass-400 focus:outline-none"
        />
        <div className="inline-flex items-stretch overflow-hidden rounded border border-line" role="group" aria-label="Sortierung">
          {(['relevanz', 'datum'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setzeSort(s)} aria-pressed={sortNach === s}
              className={`px-2.5 py-1.5 text-xs ${sortNach === s ? 'bg-well text-brass-700' : 'text-ink-600 hover:bg-paper-sunken'} ${s === 'datum' ? 'border-l border-line' : ''}`}>
              {s === 'relevanz' ? 'Relevanz' : 'Neueste'}
            </button>
          ))}
        </div>
        <button type="submit" disabled={!q.trim() || laden}
          className="lc-chip hover:text-brass-700 hover:border-brass-400 disabled:opacity-40">
          {laden ? 'sucht …' : 'Suchen'}
        </button>
      </form>

      {fehler && (
        <div className="lc-notice lc-notice-warn text-body-s">
          Die Live-Suche bei {LIVE_QUELLE} ist gerade nicht erreichbar. Die kuratierte Auswahl oben funktioniert unabhängig davon.
        </div>
      )}

      {erg && !laden && !fehler && (
        erg.treffer.length === 0 ? (
          <div className="lc-notice text-body-s">Keine externen Treffer für «{q.trim()}».</div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-ink-500">
              <span className="num text-ink-700">{erg.totalIstMindestens ? `${erg.total}+` : erg.total}</span> Treffer bei {LIVE_QUELLE}
              {' '}· angezeigt {erg.treffer.length}
            </p>
            <div className="lc-panel divide-y divide-line overflow-hidden">
              {erg.treffer.map((t) => <TrefferZeile key={t.id} t={t} />)}
            </div>
          </div>
        )
      )}
    </section>
  );
}
